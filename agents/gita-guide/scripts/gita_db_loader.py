"""
=============================================================================
BHAGAVAD GITA DATABASE LOADER
=============================================================================
This script fetches all 18 chapters and ~700 verses of the Bhagavad Gita
from the free VedicScriptures API and loads them into your PostgreSQL database.

DATA SOURCE: https://vedicscriptures.github.io/
LICENSE: GPL-3.0 (free for use)

WHAT IT LOADS:
  - 18 chapters with summaries (English + Hindi)
  - ~700 verses with Sanskrit, transliteration, and English translations
  - Multiple commentaries from 20+ scholars
  - Key concepts and themes extracted from the data

PREREQUISITES:
  1. Python 3.8+
  2. pip install requests psycopg2-binary
  3. A running PostgreSQL database

USAGE:
  1. Update the DB_CONFIG section below with your database credentials
  2. Run: python gita_db_loader.py
  3. That's it! The script handles everything else.

=============================================================================
"""

import os
import requests
import json
import time
import sys

# Try to import psycopg2; if not available, we can still generate SQL files
try:
    import psycopg2
    from psycopg2.extras import Json
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False
    print("⚠️  psycopg2 not installed. Will generate SQL files instead.")
    print("   To install: pip install psycopg2-binary")
    print()

# =============================================================================
# STEP 1: CONFIGURATION
# =============================================================================
# Update these with YOUR PostgreSQL database credentials

# Database config — loaded from environment variables.
# Set PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD in your shell or .env file.
# Or set DATABASE_URL as a full connection string.
DB_CONFIG = {
    "host": os.environ.get("PGHOST", ""),
    "port": int(os.environ.get("PGPORT", "5432")),
    "dbname": os.environ.get("PGDATABASE", "neondb"),
    "user": os.environ.get("PGUSER", "neondb_owner"),
    "password": os.environ.get("PGPASSWORD", ""),
}
if not DB_CONFIG["password"]:
    raise EnvironmentError("PGPASSWORD environment variable is not set. See .env.example.")

# API base URL (free, no API key needed)
API_BASE = "https://vedicscriptures.github.io"

# =============================================================================
# STEP 2: DATABASE SCHEMA
# =============================================================================
# These are the CREATE TABLE statements matching your Gita Guide design

SCHEMA_SQL = """
-- =============================================
-- Drop existing tables (in reverse dependency order)
-- =============================================
DROP TABLE IF EXISTS gita_themes CASCADE;
DROP TABLE IF EXISTS gita_concepts CASCADE;
DROP TABLE IF EXISTS gita_verse_commentaries CASCADE;
DROP TABLE IF EXISTS gita_verses CASCADE;
DROP TABLE IF EXISTS gita_chapters CASCADE;

-- =============================================
-- Table 1: CHAPTERS (18 chapters)
-- =============================================
CREATE TABLE gita_chapters (
    chapter         INTEGER PRIMARY KEY,
    name_sanskrit   VARCHAR(200),           -- e.g., "अर्जुनविषादयोग"
    name_english    VARCHAR(200),           -- e.g., "Arjuna Visada Yoga"
    transliteration VARCHAR(200),           -- e.g., "Arjun Viṣhād Yog"
    meaning_en      VARCHAR(300),           -- e.g., "Arjuna's Dilemma"
    meaning_hi      VARCHAR(300),           -- Hindi meaning
    summary_en      TEXT,                   -- English chapter summary
    summary_hi      TEXT,                   -- Hindi chapter summary
    verse_count     INTEGER,                -- Number of verses
    key_themes      TEXT[]                  -- Array of themes
);

-- =============================================
-- Table 2: VERSES (all ~700 verses)
-- =============================================
CREATE TABLE gita_verses (
    id              SERIAL PRIMARY KEY,
    verse_id        VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "BG1.1"
    chapter         INTEGER NOT NULL REFERENCES gita_chapters(chapter),
    verse           INTEGER NOT NULL,
    sanskrit        TEXT,                   -- Original Devanagari text
    transliteration TEXT,                   -- Romanized Sanskrit
    translation_en  TEXT,                   -- Primary English translation
    themes          TEXT[],                 -- e.g., ARRAY['duty', 'dharma']
    keywords        TEXT[],                 -- Searchable keywords
    UNIQUE(chapter, verse)
);

-- =============================================
-- Table 3: COMMENTARIES (multiple per verse)
-- =============================================
-- Separated from verses because there are 20+ commentaries per verse.
-- This keeps the verses table clean and lets you query commentaries flexibly.
CREATE TABLE gita_verse_commentaries (
    id              SERIAL PRIMARY KEY,
    verse_id        VARCHAR(20) NOT NULL REFERENCES gita_verses(verse_id),
    author_key      VARCHAR(20) NOT NULL,   -- e.g., "siva", "prabhu"
    author_name     VARCHAR(200) NOT NULL,  -- e.g., "Swami Sivananda"
    translation_en  TEXT,                   -- English translation (if available)
    translation_hi  TEXT,                   -- Hindi translation (if available)
    commentary_en   TEXT,                   -- English commentary (if available)
    commentary_sc   TEXT,                   -- Sanskrit commentary (if available)
    UNIQUE(verse_id, author_key)
);

-- =============================================
-- Table 4: CONCEPTS (key philosophical terms)
-- =============================================
CREATE TABLE gita_concepts (
    id                  SERIAL PRIMARY KEY,
    term                VARCHAR(100) NOT NULL,      -- English term
    sanskrit            VARCHAR(100),               -- Sanskrit term
    definition          TEXT NOT NULL,
    related_chapters    INTEGER[],                  -- Chapters where discussed
    related_concepts    TEXT[]                       -- Related term names
);

-- =============================================
-- Table 5: THEMES (for search/navigation)
-- =============================================
CREATE TABLE gita_themes (
    id                  SERIAL PRIMARY KEY,
    theme               VARCHAR(100) NOT NULL UNIQUE,
    description         TEXT,
    verse_references    JSONB       -- e.g., [{"chapter": 2, "verse": 47}, ...]
);

-- =============================================
-- INDEXES for fast searching
-- =============================================
CREATE INDEX idx_verses_chapter ON gita_verses(chapter);
CREATE INDEX idx_verses_themes ON gita_verses USING GIN(themes);
CREATE INDEX idx_verses_keywords ON gita_verses USING GIN(keywords);
CREATE INDEX idx_commentaries_verse ON gita_verse_commentaries(verse_id);
CREATE INDEX idx_commentaries_author ON gita_verse_commentaries(author_key);
CREATE INDEX idx_verses_translation ON gita_verses USING GIN(to_tsvector('english', translation_en));
CREATE INDEX idx_themes_theme ON gita_themes(theme);
"""

# =============================================================================
# STEP 3: AUTHOR KEY MAPPING
# =============================================================================
# The API uses short keys for each author/commentator.
# This maps those keys to the fields they provide.
#
# Each author has different fields:
#   et = English translation
#   ht = Hindi translation
#   ec = English commentary
#   hc = Hindi commentary
#   sc = Sanskrit commentary

AUTHOR_MAP = {
    "tej":     {"name": "Swami Tejomayananda",     "fields": ["ht"]},
    "siva":    {"name": "Swami Sivananda",          "fields": ["et", "ec"]},
    "purohit": {"name": "Shri Purohit Swami",       "fields": ["et"]},
    "chinmay": {"name": "Swami Chinmayananda",      "fields": ["hc"]},
    "san":     {"name": "Dr. S. Sankaranarayan",     "fields": ["et"]},
    "adi":     {"name": "Swami Adidevananda",        "fields": ["et"]},
    "gambir":  {"name": "Swami Gambirananda",        "fields": ["et"]},
    "madhav":  {"name": "Sri Madhavacharya",         "fields": ["sc"]},
    "anand":   {"name": "Sri Anandgiri",             "fields": ["sc"]},
    "rams":    {"name": "Swami Ramsukhdas",          "fields": ["ht", "hc"]},
    "raman":   {"name": "Sri Ramanuja",              "fields": ["sc", "et"]},
    "abhinav": {"name": "Sri Abhinav Gupta",         "fields": ["sc", "et"]},
    "sankar":  {"name": "Sri Shankaracharya",        "fields": ["ht", "sc", "et"]},
    "jaya":    {"name": "Sri Jayatritha",            "fields": ["sc"]},
    "vallabh": {"name": "Sri Vallabhacharya",        "fields": ["sc"]},
    "ms":      {"name": "Sri Madhusudan Saraswati",  "fields": ["sc"]},
    "srid":    {"name": "Sri Sridhara Swami",        "fields": ["sc"]},
    "dhan":    {"name": "Sri Dhanpati",              "fields": ["sc"]},
    "venkat":  {"name": "Vedantadeshikacharya",      "fields": ["sc"]},
    "puru":    {"name": "Sri Purushottamji",         "fields": ["sc"]},
    "neel":    {"name": "Sri Neelkanth",             "fields": ["sc"]},
    "prabhu":  {"name": "A.C. Bhaktivedanta Swami Prabhupada", "fields": ["et", "ec"]},
}

# =============================================================================
# STEP 4: KEY CONCEPTS DATA
# =============================================================================
# Pre-defined philosophical concepts for the gita_concepts table

KEY_CONCEPTS = [
    {
        "term": "Dharma",
        "sanskrit": "धर्म",
        "definition": "Righteous duty; the moral law governing individual conduct. In the Gita, Krishna teaches Arjuna about his svadharma (personal duty) as a warrior.",
        "related_chapters": [1, 2, 3, 18],
        "related_concepts": ["Svadharma", "Karma", "Adharma"]
    },
    {
        "term": "Karma Yoga",
        "sanskrit": "कर्मयोग",
        "definition": "The path of selfless action. Performing one's duties without attachment to the fruits or results. Krishna describes this as the discipline of action.",
        "related_chapters": [2, 3, 5, 18],
        "related_concepts": ["Nishkama Karma", "Karma", "Yoga"]
    },
    {
        "term": "Bhakti Yoga",
        "sanskrit": "भक्तियोग",
        "definition": "The path of loving devotion to God. Krishna describes this as the most accessible and powerful path to spiritual realization.",
        "related_chapters": [7, 9, 12, 18],
        "related_concepts": ["Devotion", "Surrender", "Grace"]
    },
    {
        "term": "Jnana Yoga",
        "sanskrit": "ज्ञानयोग",
        "definition": "The path of knowledge and wisdom. Understanding the true nature of the Self (Atman) and its relationship to the ultimate reality (Brahman).",
        "related_chapters": [2, 4, 7, 13],
        "related_concepts": ["Atman", "Brahman", "Viveka"]
    },
    {
        "term": "Dhyana Yoga",
        "sanskrit": "ध्यानयोग",
        "definition": "The path of meditation. Techniques for controlling the mind, achieving inner stillness, and experiencing union with the divine.",
        "related_chapters": [6],
        "related_concepts": ["Meditation", "Samadhi", "Concentration"]
    },
    {
        "term": "Atman",
        "sanskrit": "आत्मन्",
        "definition": "The eternal Self or soul. Krishna teaches that the Atman is immortal, indestructible, and beyond the physical body. It cannot be cut, burned, wetted, or dried.",
        "related_chapters": [2, 6, 13, 15],
        "related_concepts": ["Brahman", "Self", "Soul"]
    },
    {
        "term": "Brahman",
        "sanskrit": "ब्रह्मन्",
        "definition": "The ultimate reality or supreme consciousness. The infinite, unchanging reality that is the ground of all existence.",
        "related_chapters": [4, 7, 8, 13, 14],
        "related_concepts": ["Atman", "Paramatma", "Ishvara"]
    },
    {
        "term": "Maya",
        "sanskrit": "माया",
        "definition": "The divine illusion or creative power that makes the material world appear real. Krishna describes it as His energy that is difficult to overcome.",
        "related_chapters": [7, 9, 14, 18],
        "related_concepts": ["Prakriti", "Gunas", "Illusion"]
    },
    {
        "term": "Gunas",
        "sanskrit": "गुण",
        "definition": "The three modes or qualities of material nature: Sattva (goodness), Rajas (passion), and Tamas (ignorance). Everything in the material world is influenced by these three.",
        "related_chapters": [3, 14, 17, 18],
        "related_concepts": ["Sattva", "Rajas", "Tamas", "Prakriti"]
    },
    {
        "term": "Sthitaprajna",
        "sanskrit": "स्थितप्रज्ञ",
        "definition": "A person of steady wisdom. One whose mind is undisturbed by sorrow, free from desire, fear, and anger. Krishna describes this ideal state in Chapter 2.",
        "related_chapters": [2, 6, 14],
        "related_concepts": ["Equanimity", "Wisdom", "Detachment"]
    },
    {
        "term": "Nishkama Karma",
        "sanskrit": "निष्काम कर्म",
        "definition": "Desireless action. Performing duties without selfish desire for personal gain. The foundation of Karma Yoga as taught by Krishna.",
        "related_chapters": [2, 3, 5, 18],
        "related_concepts": ["Karma Yoga", "Detachment", "Svadharma"]
    },
    {
        "term": "Yoga",
        "sanskrit": "योग",
        "definition": "Union or discipline. In the Gita, yoga means connecting with the divine through various paths - action, knowledge, devotion, or meditation.",
        "related_chapters": [2, 3, 4, 5, 6, 12],
        "related_concepts": ["Karma Yoga", "Bhakti Yoga", "Jnana Yoga", "Dhyana Yoga"]
    },
    {
        "term": "Svadharma",
        "sanskrit": "स्वधर्म",
        "definition": "One's own duty or calling based on nature and position. Krishna says it is better to perform one's own dharma imperfectly than another's dharma perfectly.",
        "related_chapters": [2, 3, 18],
        "related_concepts": ["Dharma", "Duty", "Varna"]
    },
    {
        "term": "Moksha",
        "sanskrit": "मोक्ष",
        "definition": "Liberation from the cycle of birth and death (samsara). The ultimate goal of spiritual practice as described in the Gita.",
        "related_chapters": [2, 5, 8, 18],
        "related_concepts": ["Liberation", "Samsara", "Nirvana"]
    },
    {
        "term": "Prakriti",
        "sanskrit": "प्रकृति",
        "definition": "Material nature. The primordial substance from which the physical universe evolves. Composed of the three gunas.",
        "related_chapters": [3, 7, 9, 13, 14],
        "related_concepts": ["Gunas", "Maya", "Purusha"]
    },
    {
        "term": "Sankhya",
        "sanskrit": "सांख्य",
        "definition": "The analytical study of the nature of spirit and matter. Krishna uses Sankhya philosophy to explain the immortality of the soul.",
        "related_chapters": [2, 3, 5, 13, 18],
        "related_concepts": ["Purusha", "Prakriti", "Discrimination"]
    },
    {
        "term": "Tyaga",
        "sanskrit": "त्याग",
        "definition": "Renunciation of the fruits of action (not the action itself). Krishna prefers tyaga over sanyasa, teaching that true renunciation is internal detachment.",
        "related_chapters": [5, 12, 18],
        "related_concepts": ["Sanyasa", "Detachment", "Nishkama Karma"]
    },
    {
        "term": "Ishvara",
        "sanskrit": "ईश्वर",
        "definition": "The Supreme Lord or personal God. Krishna reveals himself as Ishvara - the controller and sustainer of all creation.",
        "related_chapters": [7, 9, 10, 11, 15, 18],
        "related_concepts": ["Brahman", "Paramatma", "Krishna"]
    },
    {
        "term": "Samsara",
        "sanskrit": "संसार",
        "definition": "The cycle of birth, death, and rebirth. The material world of suffering from which spiritual practice seeks liberation.",
        "related_chapters": [2, 8, 9, 15],
        "related_concepts": ["Moksha", "Karma", "Rebirth"]
    },
    {
        "term": "Vishvarupa",
        "sanskrit": "विश्वरूप",
        "definition": "The universal cosmic form of God. In Chapter 11, Krishna reveals this awe-inspiring form to Arjuna, showing all of creation within His body.",
        "related_chapters": [11],
        "related_concepts": ["Ishvara", "Darshan", "Cosmic Form"]
    }
]

# =============================================================================
# STEP 5: DATA FETCHING FUNCTIONS
# =============================================================================

def fetch_chapters():
    """Fetch all 18 chapter summaries from the API."""
    print("📖 Fetching chapter data...")
    url = f"{API_BASE}/chapters"
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    chapters = response.json()
    print(f"   ✅ Got {len(chapters)} chapters")
    return chapters


def fetch_verse(chapter, verse, retries=3):
    """Fetch a single verse with all translations and commentaries."""
    url = f"{API_BASE}/slok/{chapter}/{verse}"
    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=30)
            if response.status_code == 404:
                return None  # Verse doesn't exist
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            if attempt < retries - 1:
                time.sleep(2)  # Wait before retry
            else:
                print(f"   ⚠️  Failed to fetch {chapter}:{verse} after {retries} attempts: {e}")
                return None


def fetch_all_verses(chapters):
    """Fetch every verse across all 18 chapters."""
    all_verses = []
    
    for ch in chapters:
        ch_num = ch["chapter_number"]
        verse_count = ch["verses_count"]
        print(f"   📜 Chapter {ch_num}: fetching {verse_count} verses...", end="", flush=True)
        
        chapter_verses = []
        for v in range(1, verse_count + 1):
            verse_data = fetch_verse(ch_num, v)
            if verse_data:
                chapter_verses.append(verse_data)
            
            # Be polite to the API - small delay between requests
            time.sleep(0.3)
        
        print(f" got {len(chapter_verses)}")
        all_verses.extend(chapter_verses)
    
    print(f"   ✅ Total verses fetched: {len(all_verses)}")
    return all_verses


# =============================================================================
# STEP 6: DATA EXTRACTION HELPERS
# =============================================================================

def get_primary_translation(verse_data):
    """
    Get the best English translation for a verse.
    Priority: Swami Sivananda > Prabhupada > Purohit > Gambirananda > any
    """
    # Priority order of translators for the primary English translation
    priority = ["siva", "prabhu", "purohit", "gambir", "adi", "san", "abhinav", "raman"]
    
    for key in priority:
        if key in verse_data and isinstance(verse_data[key], dict):
            if "et" in verse_data[key] and verse_data[key]["et"]:
                return verse_data[key]["et"]
    
    # Fallback: try any author with 'et' field
    for key, val in verse_data.items():
        if isinstance(val, dict) and "et" in val and val["et"]:
            return val["et"]
    
    return None


def extract_themes_from_chapter(chapter_data):
    """Extract theme keywords from chapter summary."""
    themes = []
    summary = chapter_data.get("summary", {}).get("en", "")
    meaning = chapter_data.get("meaning", {}).get("en", "")
    
    # Common Gita themes to look for
    theme_keywords = [
        "action", "devotion", "knowledge", "meditation", "duty", "dharma",
        "karma", "yoga", "faith", "renunciation", "surrender", "wisdom",
        "self-realization", "liberation", "detachment", "divine", "nature",
        "soul", "god", "bhakti", "jnana", "cosmic", "universal"
    ]
    
    text = (summary + " " + meaning).lower()
    for keyword in theme_keywords:
        if keyword in text:
            themes.append(keyword)
    
    return themes


def extract_commentaries(verse_data):
    """Extract all commentaries from a verse's JSON data."""
    commentaries = []
    verse_id = verse_data.get("_id", "")
    
    for key, info in AUTHOR_MAP.items():
        if key in verse_data and isinstance(verse_data[key], dict):
            author_data = verse_data[key]
            commentary = {
                "verse_id": verse_id,
                "author_key": key,
                "author_name": author_data.get("author", info["name"]),
                "translation_en": author_data.get("et"),
                "translation_hi": author_data.get("ht"),
                "commentary_en": author_data.get("ec"),
                "commentary_sc": author_data.get("sc") or author_data.get("hc"),
            }
            # Only add if there's at least some content
            if any([commentary["translation_en"], commentary["translation_hi"],
                     commentary["commentary_en"], commentary["commentary_sc"]]):
                commentaries.append(commentary)
    
    return commentaries


# =============================================================================
# STEP 7: DATABASE LOADING FUNCTIONS
# =============================================================================

def create_schema(cursor):
    """Create all database tables."""
    print("🏗️  Creating database schema...")
    cursor.execute(SCHEMA_SQL)
    print("   ✅ Schema created")


def load_chapters(cursor, chapters):
    """Load chapter data into gita_chapters table."""
    print("📖 Loading chapters...")
    
    for ch in chapters:
        themes = extract_themes_from_chapter(ch)
        cursor.execute("""
            INSERT INTO gita_chapters 
                (chapter, name_sanskrit, name_english, transliteration,
                 meaning_en, meaning_hi, summary_en, summary_hi,
                 verse_count, key_themes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (chapter) DO UPDATE SET
                name_sanskrit = EXCLUDED.name_sanskrit,
                name_english = EXCLUDED.name_english
        """, (
            ch["chapter_number"],
            ch.get("name"),
            ch.get("translation"),
            ch.get("transliteration"),
            ch.get("meaning", {}).get("en"),
            ch.get("meaning", {}).get("hi"),
            ch.get("summary", {}).get("en"),
            ch.get("summary", {}).get("hi"),
            ch.get("verses_count"),
            themes
        ))
    
    print(f"   ✅ Loaded {len(chapters)} chapters")


def load_verses(cursor, verses):
    """Load verse data into gita_verses table."""
    print("📜 Loading verses...")
    count = 0
    
    for v in verses:
        verse_id = v.get("_id", f"BG{v['chapter']}.{v['verse']}")
        translation = get_primary_translation(v)
        
        # Extract simple keywords from translation
        keywords = []
        if translation:
            # Basic keyword extraction
            stop_words = {"the", "a", "an", "is", "are", "was", "were", "of", "in",
                         "to", "and", "or", "for", "on", "at", "by", "with", "from",
                         "that", "this", "which", "who", "whom", "his", "her", "he",
                         "she", "it", "they", "them", "their", "its", "not", "but",
                         "be", "been", "being", "have", "has", "had", "do", "does",
                         "did", "will", "would", "could", "should", "may", "might",
                         "shall", "can", "as", "if", "so", "no", "all", "my", "your",
                         "our", "what", "when", "where", "how", "i", "you", "we", "me"}
            words = translation.lower().split()
            keywords = list(set([
                w.strip(".,;:!?()\"'") for w in words 
                if len(w) > 3 and w.strip(".,;:!?()\"'") not in stop_words
            ]))[:20]  # Keep top 20 keywords
        
        cursor.execute("""
            INSERT INTO gita_verses 
                (verse_id, chapter, verse, sanskrit, transliteration,
                 translation_en, themes, keywords)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (verse_id) DO UPDATE SET
                sanskrit = EXCLUDED.sanskrit,
                translation_en = EXCLUDED.translation_en
        """, (
            verse_id,
            v["chapter"],
            v["verse"],
            v.get("slok"),
            v.get("transliteration"),
            translation,
            [],  # themes - can be enriched later
            keywords
        ))
        count += 1
    
    print(f"   ✅ Loaded {count} verses")


def load_commentaries(cursor, verses):
    """Load all commentaries into gita_verse_commentaries table."""
    print("💬 Loading commentaries...")
    count = 0
    
    for v in verses:
        commentaries = extract_commentaries(v)
        for c in commentaries:
            cursor.execute("""
                INSERT INTO gita_verse_commentaries
                    (verse_id, author_key, author_name,
                     translation_en, translation_hi,
                     commentary_en, commentary_sc)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (verse_id, author_key) DO UPDATE SET
                    translation_en = EXCLUDED.translation_en,
                    commentary_en = EXCLUDED.commentary_en
            """, (
                c["verse_id"], c["author_key"], c["author_name"],
                c["translation_en"], c["translation_hi"],
                c["commentary_en"], c["commentary_sc"]
            ))
            count += 1
    
    print(f"   ✅ Loaded {count} commentaries")


def load_concepts(cursor):
    """Load key philosophical concepts."""
    print("🧠 Loading key concepts...")
    
    for concept in KEY_CONCEPTS:
        cursor.execute("""
            INSERT INTO gita_concepts
                (term, sanskrit, definition, related_chapters, related_concepts)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            concept["term"],
            concept["sanskrit"],
            concept["definition"],
            concept["related_chapters"],
            concept["related_concepts"]
        ))
    
    print(f"   ✅ Loaded {len(KEY_CONCEPTS)} concepts")


def load_themes(cursor, chapters):
    """Load themes with verse references."""
    print("🏷️  Loading themes...")
    
    # Predefined themes with descriptions
    themes_data = {
        "duty": "The concept of performing one's righteous duty (dharma) regardless of outcome",
        "action": "The philosophy of selfless action and its role in spiritual growth",
        "devotion": "Pure, unconditional loving service to the Supreme",
        "knowledge": "The path of wisdom and understanding the true nature of reality",
        "meditation": "Techniques and practices for controlling the mind and achieving inner peace",
        "detachment": "Freedom from attachment to results, possessions, and outcomes",
        "surrender": "Complete submission to the divine will as a path to liberation",
        "faith": "The role of belief and trust in spiritual advancement",
        "renunciation": "Giving up attachment to material desires while continuing to act",
        "liberation": "Freedom from the cycle of birth and death (samsara)",
        "soul": "The eternal, indestructible nature of the individual self (Atman)",
        "divine nature": "The qualities and manifestations of God",
        "cosmic form": "The universal form of God revealed to Arjuna",
        "self-realization": "The process of understanding one's true spiritual nature",
        "equanimity": "Maintaining balance and composure in all circumstances",
        "yoga": "Various paths of spiritual discipline leading to union with the divine",
        "karma": "The law of cause and effect governing actions and their consequences",
        "wisdom": "Deep understanding that leads to right action and spiritual freedom"
    }
    
    for theme, description in themes_data.items():
        cursor.execute("""
            INSERT INTO gita_themes (theme, description, verse_references)
            VALUES (%s, %s, %s)
            ON CONFLICT (theme) DO UPDATE SET description = EXCLUDED.description
        """, (theme, description, Json([])))
    
    print(f"   ✅ Loaded {len(themes_data)} themes")


# =============================================================================
# STEP 8: GENERATE SQL FILE (fallback if no psycopg2)
# =============================================================================

def generate_sql_file(chapters, verses):
    """Generate a .sql file that can be run directly against PostgreSQL."""
    print("📝 Generating SQL file...")
    
    filename = "gita_data_load.sql"
    with open(filename, "w", encoding="utf-8") as f:
        # Write schema
        f.write("-- Auto-generated Bhagavad Gita Database Load Script\n")
        f.write("-- Run with: psql -U postgres -d gita_guide -f gita_data_load.sql\n\n")
        f.write("BEGIN;\n\n")
        f.write(SCHEMA_SQL)
        f.write("\n\n")
        
        # Write chapter inserts
        f.write("-- CHAPTERS\n")
        for ch in chapters:
            themes = extract_themes_from_chapter(ch)
            themes_sql = "ARRAY[" + ",".join([f"'{t}'" for t in themes]) + "]" if themes else "ARRAY[]::TEXT[]"
            
            summary_en = (ch.get("summary", {}).get("en") or "").replace("'", "''")
            summary_hi = (ch.get("summary", {}).get("hi") or "").replace("'", "''")
            name = (ch.get("name") or "").replace("'", "''")
            translation = (ch.get("translation") or "").replace("'", "''")
            translit = (ch.get("transliteration") or "").replace("'", "''")
            meaning_en = (ch.get("meaning", {}).get("en") or "").replace("'", "''")
            meaning_hi = (ch.get("meaning", {}).get("hi") or "").replace("'", "''")
            
            f.write(f"""INSERT INTO gita_chapters (chapter, name_sanskrit, name_english, transliteration, meaning_en, meaning_hi, summary_en, summary_hi, verse_count, key_themes)
VALUES ({ch['chapter_number']}, '{name}', '{translation}', '{translit}', '{meaning_en}', '{meaning_hi}', '{summary_en}', '{summary_hi}', {ch['verses_count']}, {themes_sql});\n""")
        
        f.write("\n-- VERSES AND COMMENTARIES\n")
        for v in verses:
            verse_id = v.get("_id", f"BG{v['chapter']}.{v['verse']}")
            translation = (get_primary_translation(v) or "").replace("'", "''")
            sanskrit = (v.get("slok") or "").replace("'", "''")
            translit = (v.get("transliteration") or "").replace("'", "''")
            
            f.write(f"""INSERT INTO gita_verses (verse_id, chapter, verse, sanskrit, transliteration, translation_en, themes, keywords)
VALUES ('{verse_id}', {v['chapter']}, {v['verse']}, '{sanskrit}', '{translit}', '{translation}', ARRAY[]::TEXT[], ARRAY[]::TEXT[]);\n""")
            
            # Commentaries
            commentaries = extract_commentaries(v)
            for c in commentaries:
                t_en = (c["translation_en"] or "").replace("'", "''")
                t_hi = (c["translation_hi"] or "").replace("'", "''")
                c_en = (c["commentary_en"] or "").replace("'", "''")
                c_sc = (c["commentary_sc"] or "").replace("'", "''")
                
                f.write(f"""INSERT INTO gita_verse_commentaries (verse_id, author_key, author_name, translation_en, translation_hi, commentary_en, commentary_sc)
VALUES ('{c['verse_id']}', '{c['author_key']}', '{c['author_name'].replace("'", "''")}', '{t_en}', '{t_hi}', '{c_en}', '{c_sc}');\n""")
        
        # Concepts
        f.write("\n-- CONCEPTS\n")
        for concept in KEY_CONCEPTS:
            chs = "ARRAY[" + ",".join(str(c) for c in concept["related_chapters"]) + "]"
            related = "ARRAY[" + ",".join([f"'{r}'" for r in concept["related_concepts"]]) + "]"
            defn = concept["definition"].replace("'", "''")
            f.write(f"""INSERT INTO gita_concepts (term, sanskrit, definition, related_chapters, related_concepts)
VALUES ('{concept["term"]}', '{concept["sanskrit"]}', '{defn}', {chs}, {related});\n""")
        
        f.write("\nCOMMIT;\n")
    
    print(f"   ✅ Generated {filename}")
    return filename


# =============================================================================
# STEP 9: MAIN EXECUTION
# =============================================================================

def main():
    print("=" * 60)
    print("🙏 BHAGAVAD GITA DATABASE LOADER")
    print("=" * 60)
    print()
    
    # ---- Phase 1: Fetch data from API ----
    print("PHASE 1: FETCHING DATA FROM API")
    print("-" * 40)
    
    chapters = fetch_chapters()
    
    print()
    print("📜 Fetching all verses (this takes ~5-10 minutes)...")
    print("   The API has ~700 verses and we fetch them one by one")
    print("   to be respectful to the free API service.")
    print()
    
    verses = fetch_all_verses(chapters)
    
    # Save raw data as JSON backup
    print()
    print("💾 Saving raw JSON backup...")
    with open("gita_raw_data.json", "w", encoding="utf-8") as f:
        json.dump({"chapters": chapters, "verses": verses}, f, ensure_ascii=False, indent=2)
    print("   ✅ Saved gita_raw_data.json (backup)")
    
    # ---- Phase 2: Load into database ----
    print()
    print("PHASE 2: LOADING INTO DATABASE")
    print("-" * 40)
    
    if HAS_PSYCOPG2:
        try:
            print(f"🔌 Connecting to PostgreSQL ({DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']})...")
            conn = psycopg2.connect(**DB_CONFIG)
            conn.autocommit = False
            cursor = conn.cursor()
            print("   ✅ Connected!")
            
            create_schema(cursor)
            load_chapters(cursor, chapters)
            load_verses(cursor, verses)
            load_commentaries(cursor, verses)
            load_concepts(cursor)
            load_themes(cursor, chapters)
            
            conn.commit()
            print()
            print("✅ ALL DATA COMMITTED TO DATABASE!")
            
            # Print summary stats
            cursor.execute("SELECT COUNT(*) FROM gita_chapters")
            ch_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM gita_verses")
            v_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM gita_verse_commentaries")
            c_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM gita_concepts")
            co_count = cursor.fetchone()[0]
            
            print()
            print("=" * 60)
            print("📊 DATABASE SUMMARY")
            print("=" * 60)
            print(f"   Chapters:      {ch_count}")
            print(f"   Verses:        {v_count}")
            print(f"   Commentaries:  {c_count}")
            print(f"   Concepts:      {co_count}")
            print("=" * 60)
            
            cursor.close()
            conn.close()
            
        except psycopg2.OperationalError as e:
            print(f"\n❌ Database connection failed: {e}")
            print("\n   Falling back to SQL file generation...")
            filename = generate_sql_file(chapters, verses)
            print(f"\n   Run this to load: psql -U postgres -d gita_guide -f {filename}")
    else:
        filename = generate_sql_file(chapters, verses)
        print(f"\n   Run this to load: psql -U postgres -d gita_guide -f {filename}")
    
    print()
    print("=" * 60)
    print("🙏 DONE! Your Gita Guide database is ready.")
    print("=" * 60)
    print()
    print("NEXT STEPS:")
    print("  1. Verify data: psql -d gita_guide -c 'SELECT * FROM gita_chapters;'")
    print("  2. Test a query: psql -d gita_guide -c")
    print("     \"SELECT verse_id, translation_en FROM gita_verses")
    print("      WHERE chapter=2 AND verse=47;\"")
    print("  3. Connect your Gita Guide agent to this database!")


if __name__ == "__main__":
    main()
