# Data Sourcing Strategy for All 5 Agents

This document outlines where to get data for each agent's case studies.

---

## 1. Article Editor (EASIEST)

### What You Need
- **5 draft articles** (150-300 words each, intentionally imperfect)

### How to Get It
**YOU WRITE THEM!** Create 5 rough drafts on these topics (from the requirements):

1. **Insurance Fraud in the Digital Age** (Blog Post)
   - Write a 200-word rough draft about AI fraud detection
   - Make it vague ("many companies"), missing citations, weak structure

2. **AI Governance Framework** (Whitepaper)
   - Write a 250-word draft about AI ethics in insurance
   - Include claims without sources

3. **Modernizing Claims Processing** (How-To Guide)
   - Write a 200-word process guide
   - Missing concrete examples

4. **Predictive Analytics Opinion** (Opinion Piece)
   - Write a 180-word opinion
   - Needs data to back up claims

5. **Customer Experience 2025** (Report)
   - Write a 220-word trend report
   - Needs statistics and examples

**Time Required**: 2-3 hours to write all 5 drafts

---

## 2. Fraud Trends Investigator (MODERATE)

### What You Need
- **Web Search API** for research

### Recommended: Tavily API
- **URL**: https://tavily.com/
- **Free Tier**: 1,000 searches/month
- **Perfect for**: Research agents
- **Signup**: Email + API key instantly

### Alternative: SerpAPI
- **URL**: https://serpapi.com/
- **Free Tier**: 100 searches/month
- **Also works**: Google Scholar, News search

### Setup
```bash
pip install tavily-python
export TAVILY_API_KEY="tvly-..."
```

### Topics (from requirements)
1. Auto Insurance Fraud 2024-2025
2. Property Fraud After Climate Events
3. Digital & Synthetic Identity Fraud
4. Organized Fraud Rings
5. Technology in Fraud Detection

**No additional data needed** - everything comes from web search!

---

## 3. Stock Monitor (MODERATE-COMPLEX)

### What You Need
- **Financial News API**
- **SEC Filings API** (free)

### Recommended: Finnhub
- **URL**: https://finnhub.io/
- **Free Tier**: 60 calls/minute (very generous)
- **Provides**: News, company info, filings
- **Signup**: Email + API key

### SEC EDGAR (Free, No Key Needed)
- **URL**: https://www.sec.gov/edgar/searchedgar/companysearch.html
- **API Docs**: https://www.sec.gov/edgar/sec-api-documentation
- **No authentication required**

### SEDAR+ for Canadian Stocks (Free)
- **URL**: https://www.sedarplus.ca/
- **Manual lookup** (no easy API)

### Watchlists (from requirements)
1. Tech Giants (AAPL, MSFT, GOOGL, AMZN, META, NVDA)
2. Canadian Banks (RY, TD, BNS, BMO, CM)
3. Insurance Sector (AIG, ALL, PGR, TRV, MET, CB)
4. EV & Clean Energy (TSLA, RIVN, NIO, LCID, ENPH, FSLR)
5. Canadian REITs (REI.UN, CAR.UN, HR.UN, AP.UN, CRT.UN)

**Setup**
```bash
pip install finnhub-python
export FINNHUB_API_KEY="..."
```

---

## 4. House Finder (COMPLEX)

### Challenge
Real estate APIs are heavily restricted and expensive.

### RECOMMENDED APPROACH: Mock Data

#### School Ratings (Real Data - FREE)
**Fraser Institute School Rankings**
- **URL**: https://www.fraserinstitute.org/school-performance
- **Download**: Annual Ontario School Rankings (CSV)
- **Contains**: ~3,000 schools with ratings (1-10)
- **File**: `ontario_school_rankings_2024.csv`

**How to Get:**
1. Visit: https://www.compareschoolrankings.org/
2. Download Ontario data
3. Parse CSV into database

#### Real Estate Listings (Mock Data)
**Create realistic mock listings for 5 cities:**
- Oakville, Burlington, Mississauga, Milton, Brampton

**Mock Data Strategy:**
```python
# Generate 20-30 properties per city
properties = [
    {
        "address": "123 Lakeshore Rd W",
        "city": "Oakville",
        "price": 1450000,
        "bedrooms": 4,
        "bathrooms": 3,
        "sqft": 2800,
        "property_type": "detached",
        "year_built": 2015,
        # Match to real schools via postal code
        "postal_code": "L6K 1E5"
    }
]
```

**Realistic Data Sources:**
- Check Realtor.ca manually for current price ranges
- Use Google Maps for real street names
- Match postal codes to school catchments

#### Walk Score
**Option 1**: Walk Score API (paid after 5,000 requests)
**Option 2**: Mock scores (60-85 for urban areas)

### Alternative: Point-in-Time Scrape
- Scrape 50 listings ONCE from Realtor.ca
- Save to CSV
- Use for all demos
- Note: "Data as of February 2024"

**⚠️ Legal**: Only for personal portfolio demo, not commercial use

---

## 5. Gita Guide (EASY - Static Data)

### What You Need
- **Bhagavad Gita verses** (700 verses, 18 chapters)
- **Concept definitions** (50-100 terms)

### Recommended Sources

#### Verses - Public Domain
**Bhagavad Gita As It Is** (A.C. Bhaktivedanta Swami Prabhupada)
- **License**: Public domain in many jurisdictions
- **Source 1**: https://vedabase.io/en/library/bg/ (structured, clean)
- **Source 2**: https://www.holy-bhagavad-gita.org/ (downloadable JSON/CSV)
- **Source 3**: Compile from Project Gutenberg

**Alternative**: Eknath Easwaran translation (check copyright)

#### Data Format Needed
```json
{
  "chapter": 2,
  "verse": 47,
  "sanskrit": "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन",
  "transliteration": "karmaṇy-evādhikāras te mā phaleṣu kadācana",
  "translation": "You have the right to work only, but never to its fruits.",
  "commentary": "Krishna teaches Arjuna...",
  "themes": ["karma", "duty", "detachment"],
  "keywords": ["work", "action", "fruits", "results"]
}
```

#### Concepts
Create definitions for key terms:
- Dharma, Karma, Yoga, Atman, Brahman
- Sthitaprajna, Karma Yoga, Bhakti Yoga, Jnana Yoga
- Guna (Sattva, Rajas, Tamas)
- etc.

**I can help compile this data** - it's straightforward data entry.

#### Chapters Summary
Create short summaries for all 18 chapters (1-2 paragraphs each)

### Setup
```python
# Load data script
python scripts/load-gita-data.py
```

**Time Required**:
- If using vedabase.io API: 2 hours to script
- If manual CSV: 4-6 hours

---

## Data Loading Strategy

### Phase 1: Prepare Data
1. **Article Editor**: Write 5 drafts (2-3 hours)
2. **Fraud Trends**: Get Tavily API key (5 min)
3. **Stock Monitor**: Get Finnhub API key (5 min)
4. **House Finder**: Download Fraser Institute CSV (30 min) + Create mock listings (3-4 hours)
5. **Gita Guide**: Compile verses from vedabase.io (2-4 hours)

### Phase 2: Load into Database
```bash
# Create database
psql $DATABASE_URL -f database/schema.sql

# Load Gita data
python scripts/load-gita-data.py

# Load school data
python scripts/load-school-data.py
```

### Phase 3: Run Agents
```bash
# Run each agent
cd agents/article-editor
python agent.py

cd agents/fraud-trends
python agent.py

# etc.
```

### Phase 4: Import Case Studies
```bash
# Import all generated case studies to database
python scripts/import-case-studies.py
```

---

## Estimated Time Budget

| Agent | Data Prep Time | Agent Build Time | Total |
|-------|---------------|------------------|-------|
| Article Editor | 2-3 hours | 3-4 hours | 5-7 hours |
| Fraud Trends | 5 min | 4-5 hours | 4-5 hours |
| Gita Guide | 2-4 hours | 3-4 hours | 5-8 hours |
| House Finder | 4-5 hours | 5-6 hours | 9-11 hours |
| Stock Monitor | 5 min | 4-5 hours | 4-5 hours |
| **TOTAL** | **8-12 hours** | **19-24 hours** | **27-36 hours** |

---

## Quick Start: Which Agent First?

### If you want to code NOW:
**Start with Fraud Trends** - only needs API key, no data prep

### If you want to prep data first:
**Start with Article Editor** - write your 5 drafts, then code the agent

### Recommended Order:
1. **Fraud Trends** (immediate, just API key)
2. **Article Editor** (write drafts in parallel)
3. **Gita Guide** (while data loads)
4. **Stock Monitor** (similar to Fraud Trends)
5. **House Finder** (most data-intensive, save for last)

---

## Next Steps

Let me know which agent you want to build first, and I'll:
1. Help you get the required API keys
2. Create the agent script
3. Generate the case study data
4. Import to database

Ready to start?
