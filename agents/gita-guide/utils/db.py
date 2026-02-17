"""
Database utilities for Gita Guide Agent

Provides PostgreSQL connection and query functions for the Bhagavad Gita database.
"""

import os
import psycopg2
from typing import List, Dict, Any, Optional
from psycopg2.extras import RealDictCursor


def get_db_connection():
    """Get PostgreSQL database connection."""
    return psycopg2.connect(
        host="ep-purple-flower-aix6l70h-pooler.c-4.us-east-1.aws.neon.tech",
        port=5432,
        dbname="neondb",
        user="neondb_owner",
        password=os.environ.get("POSTGRES_PASSWORD", "npg_yxzjXk0L8Ofp"),
        cursor_factory=RealDictCursor
    )


def get_all_verses() -> List[Dict[str, Any]]:
    """
    Retrieve all verses from the database.

    Returns:
        List of verse dictionaries with keys: verse_id, chapter, verse, sanskrit,
        transliteration, translation_en, themes, keywords
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    verse_id,
                    chapter,
                    verse,
                    sanskrit,
                    transliteration,
                    translation_en,
                    themes,
                    keywords
                FROM gita_verses
                ORDER BY chapter, verse
            """)
            verses = cur.fetchall()
            return [dict(row) for row in verses]
    finally:
        conn.close()


def get_verses_by_chapter(chapter: int) -> List[Dict[str, Any]]:
    """
    Retrieve all verses from a specific chapter.

    Args:
        chapter: Chapter number (1-18)

    Returns:
        List of verse dictionaries
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    verse_id,
                    chapter,
                    verse,
                    sanskrit,
                    transliteration,
                    translation_en,
                    themes,
                    keywords
                FROM gita_verses
                WHERE chapter = %s
                ORDER BY verse
            """, (chapter,))
            verses = cur.fetchall()
            return [dict(row) for row in verses]
    finally:
        conn.close()


def get_verse_by_id(verse_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a specific verse by its ID.

    Args:
        verse_id: Verse identifier (e.g., "BG2.47")

    Returns:
        Verse dictionary or None if not found
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    verse_id,
                    chapter,
                    verse,
                    sanskrit,
                    transliteration,
                    translation_en,
                    themes,
                    keywords
                FROM gita_verses
                WHERE verse_id = %s
            """, (verse_id,))
            verse = cur.fetchone()
            return dict(verse) if verse else None
    finally:
        conn.close()


def get_verse_commentaries(verse_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Retrieve commentaries for a specific verse.

    Args:
        verse_id: Verse identifier (e.g., "BG2.47")
        limit: Maximum number of commentaries to return

    Returns:
        List of commentary dictionaries with keys: author_name, commentary_en
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    author_name,
                    commentary_en
                FROM gita_verse_commentaries
                WHERE verse_id = %s
                LIMIT %s
            """, (verse_id, limit))
            commentaries = cur.fetchall()
            return [dict(row) for row in commentaries]
    finally:
        conn.close()


def search_verses_by_keywords(keywords: List[str], limit: int = 20) -> List[Dict[str, Any]]:
    """
    Search verses by keywords in translation.

    Args:
        keywords: List of keywords to search for
        limit: Maximum number of verses to return

    Returns:
        List of verse dictionaries
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Build ILIKE conditions for each keyword
            conditions = []
            params = []
            for keyword in keywords:
                search_term = f"%{keyword}%"
                conditions.append("translation_en ILIKE %s")
                params.append(search_term)

            where_clause = " OR ".join(conditions)
            query = f"""
                SELECT
                    verse_id,
                    chapter,
                    verse,
                    sanskrit,
                    transliteration,
                    translation_en,
                    themes,
                    keywords
                FROM gita_verses
                WHERE {where_clause}
                ORDER BY chapter, verse
                LIMIT %s
            """
            params.append(limit)

            cur.execute(query, params)
            verses = cur.fetchall()
            return [dict(row) for row in verses]
    finally:
        conn.close()


def get_verses_by_theme(theme: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get verses related to a specific theme.

    Args:
        theme: Theme name (e.g., "Karma Yoga", "Bhakti", "Knowledge")
        limit: Maximum number of verses to return

    Returns:
        List of verse dictionaries
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT DISTINCT
                    v.verse_id,
                    v.chapter,
                    v.verse,
                    v.sanskrit,
                    v.transliteration,
                    v.translation_en,
                    v.themes,
                    v.keywords
                FROM gita_verses v
                JOIN gita_themes t ON v.chapter = t.chapter
                WHERE t.theme_name ILIKE %s
                ORDER BY v.chapter, v.verse
                LIMIT %s
            """, (f"%{theme}%", limit))
            verses = cur.fetchall()
            return [dict(row) for row in verses]
    finally:
        conn.close()


def get_database_stats() -> Dict[str, int]:
    """
    Get statistics about the database.

    Returns:
        Dictionary with counts of chapters, verses, commentaries, concepts, and themes
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            stats = {}

            cur.execute("SELECT COUNT(*) FROM gita_chapters")
            stats["chapters"] = cur.fetchone()["count"]

            cur.execute("SELECT COUNT(*) FROM gita_verses")
            stats["verses"] = cur.fetchone()["count"]

            cur.execute("SELECT COUNT(*) FROM gita_verse_commentaries")
            stats["commentaries"] = cur.fetchone()["count"]

            cur.execute("SELECT COUNT(*) FROM gita_concepts")
            stats["concepts"] = cur.fetchone()["count"]

            cur.execute("SELECT COUNT(*) FROM gita_themes")
            stats["themes"] = cur.fetchone()["count"]

            return stats
    finally:
        conn.close()
