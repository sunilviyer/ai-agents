# Agent 3: Home Match Agent

## 1. IDENTITY

| Field | Value |
|-------|-------|
| **Name** | Home Match Agent |
| **Slug** | `house-finder` |
| **Tagline** | "AI-powered home matching with school ratings" |
| **Type** | Multi-Criteria Matching Agent |
| **Icon** | 🏠 |
| **Badge Color** | Orange |

---

## 2. CONCEPT

### What It Does
This agent searches real estate listings based on hard requirements (bedrooms, price, location), enriches each property with school ratings and walkability scores, then ranks and explains which properties best match all criteria.

### Why It's Unique (Agent Archetype)
**Multi-Criteria Matching** — The agent's core capability is:
- Accepting multiple hard constraints (must-haves)
- Accepting soft preferences (nice-to-haves)
- Searching a dataset for candidates
- Scoring and ranking by overall fit
- Explaining tradeoffs for each match

### Value Proposition
"Tell me what you need in a home—bedrooms, budget, school quality—and I'll find the best matches and explain the tradeoffs for each."

### Demo Approach
**Pre-run only.** You execute the agent on 5 different home search scenarios, save the execution traces and results. Visitors browse the saved searches and see matched properties with explanations.

---

## 3. INPUT SCHEMA

```typescript
interface HomeSearchInput {
  // Search identification
  search_name: string;              // e.g., "Family Home in Oakville"
  
  // Location parameters
  location: {
    city: string;                   // e.g., "Oakville"
    province: string;               // e.g., "Ontario"
    neighborhoods?: string[];       // Optional specific areas
    postal_codes?: string[];        // Optional postal code filters
  };
  
  // Hard requirements (must meet ALL)
  requirements: {
    bedrooms_min: number;
    bathrooms_min?: number;
    price_max: number;
    price_min?: number;
    property_types: PropertyType[];
    sqft_min?: number;
  };
  
  // Soft preferences (used for scoring)
  preferences: {
    school_rating_min?: number;     // Fraser Institute score (1-10)
    walk_score_min?: number;        // 0-100
    transit_score_min?: number;     // 0-100
    lot_size_preference?: 'small' | 'medium' | 'large';
    age_preference?: 'new' | 'recent' | 'any';
  };
  
  // Results configuration
  max_results?: number;             // Default 10
}

type PropertyType = 
  | 'detached' 
  | 'semi-detached' 
  | 'townhouse' 
  | 'condo' 
  | 'bungalow';
```

### Example Input
```json
{
  "search_name": "Family Home in Oakville",
  "location": {
    "city": "Oakville",
    "province": "Ontario",
    "neighborhoods": ["Bronte", "River Oaks", "Glen Abbey"]
  },
  "requirements": {
    "bedrooms_min": 4,
    "bathrooms_min": 3,
    "price_max": 1500000,
    "property_types": ["detached", "semi-detached"]
  },
  "preferences": {
    "school_rating_min": 8,
    "walk_score_min": 50
  },
  "max_results": 10
}
```

---

## 4. PROCESSING STEPS

| Step # | Name | Type | Description | Example Output |
|--------|------|------|-------------|----------------|
| 1 | **Parse Criteria** | `setup` | Extract requirements and preferences | 4 hard, 2 soft criteria |
| 2 | **Search Listings** | `search` | Query real estate sources with filters | 45 listings found |
| 3 | **Apply Hard Filters** | `filter` | Remove listings that don't meet requirements | 23 listings remain |
| 4 | **Enrich with School Data** | `enrichment` | Look up school ratings by address | Ratings added |
| 5 | **Enrich with Scores** | `enrichment` | Add walk score, transit score | Scores added |
| 6 | **Score & Rank** | `analysis` | Calculate match percentage for each | Properties ranked |
| 7 | **Analyze Tradeoffs** | `analysis` | Identify pros/cons for top matches | Analysis complete |
| 8 | **Generate Report** | `synthesis` | Compile final report with explanations | Report ready |

### Step Details

**Step 1: Parse Criteria**
```
Input: Search parameters
Process:
  - Separate hard requirements (must meet)
  - Separate soft preferences (scoring factors)
  - Validate location data
  - Set default values for optionals
Output: Structured criteria object
```

**Step 2: Search Listings**
```
Input: Location + basic filters
Process:
  - Query real estate data source
  - Apply location filter (city, neighborhoods)
  - Apply property type filter
  - Retrieve listing details (address, price, beds, baths, sqft)
Output: Raw listing collection
```

**Step 3: Apply Hard Filters**
```
Input: Raw listings + requirements
Process:
  - Filter: bedrooms >= bedrooms_min
  - Filter: bathrooms >= bathrooms_min
  - Filter: price <= price_max
  - Filter: property_type in allowed types
  - Filter: sqft >= sqft_min (if specified)
Output: Filtered listing collection
```

**Step 4: Enrich with School Data**
```
Input: Filtered listings
Process:
  For each property:
    - Geocode address to lat/long
    - Look up school catchment area
    - Retrieve Fraser Institute ratings
    - Identify elementary and secondary schools
Output: Listings with school data attached
```

**Step 5: Enrich with Scores**
```
Input: Listings with school data
Process:
  For each property:
    - Query Walk Score API
    - Query Transit Score API (if available)
    - Add neighborhood context
Output: Fully enriched listings
```

**Step 6: Score & Rank**
```
Input: Enriched listings + preferences
Process:
  For each property:
    - Score each preference dimension (0-100)
    - Calculate weighted average
    - Generate overall match percentage
  - Sort by match percentage descending
  - Take top N results
Output: Ranked property list with scores
```

**Step 7: Analyze Tradeoffs**
```
Input: Top ranked properties
Process:
  For each property:
    - Identify strengths (exceeds criteria)
    - Identify weaknesses (meets but doesn't exceed)
    - Identify concerns (close to minimum)
    - Compare to other matches
    - Generate natural language analysis
Output: Pros/cons for each property
```

**Step 8: Generate Report**
```
Input: Ranked properties with analysis
Process:
  - Write executive summary
  - Format property cards
  - Add market context
  - Compile sources
Output: Final search report
```

---

## 5. OUTPUT SCHEMA

```typescript
interface HomeSearchOutput {
  // Search metadata
  search_id: string;
  search_name: string;
  search_timestamp: string;
  search_parameters: HomeSearchInput;
  
  // Results summary
  summary: {
    total_listings_found: number;
    after_hard_filters: number;
    matches_returned: number;
    best_match_score: number;
    price_range: {
      min: number;
      max: number;
      median: number;
    };
  };
  
  // Property matches
  matches: PropertyMatch[];
  
  // Market context
  market_context: {
    avg_price_area: number;
    avg_days_on_market: number;
    inventory_level: 'low' | 'balanced' | 'high';
    price_trend: 'rising' | 'stable' | 'falling';
    notes: string;
  };
}

interface PropertyMatch {
  // Property identification
  id: string;
  rank: number;
  match_score: number;              // 0-100
  
  // Basic details
  address: {
    street: string;
    city: string;
    province: string;
    postal_code: string;
  };
  
  // Property attributes
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lot_size?: string;
  property_type: PropertyType;
  year_built?: number;
  
  // Listing details
  listing_url: string;
  listing_date: string;
  days_on_market: number;
  mls_number?: string;
  
  // Images
  primary_image_url: string;
  image_urls?: string[];
  
  // Enrichment data
  school_data: {
    elementary: {
      name: string;
      rating: number;
      distance_km: number;
    };
    secondary: {
      name: string;
      rating: number;
      distance_km: number;
    };
    overall_rating: number;
  };
  
  walk_score: number;
  transit_score?: number;
  
  // Scoring breakdown
  score_breakdown: {
    price_score: number;
    school_score: number;
    walkability_score: number;
    size_score: number;
  };
  
  // Analysis
  pros: string[];
  cons: string[];
  agent_notes: string;              // Natural language analysis
}
```

### Example Output (Abbreviated)
```json
{
  "search_id": "search_oakville_family_001",
  "search_name": "Family Home in Oakville",
  "search_timestamp": "2025-02-01T10:00:00Z",
  
  "summary": {
    "total_listings_found": 156,
    "after_hard_filters": 23,
    "matches_returned": 10,
    "best_match_score": 94,
    "price_range": {
      "min": 1150000,
      "max": 1495000,
      "median": 1350000
    }
  },
  
  "matches": [
    {
      "id": "prop_001",
      "rank": 1,
      "match_score": 94,
      "address": {
        "street": "123 Lakeshore Road West",
        "city": "Oakville",
        "province": "Ontario",
        "postal_code": "L6K 1E5"
      },
      "price": 1450000,
      "bedrooms": 4,
      "bathrooms": 3,
      "sqft": 2800,
      "property_type": "detached",
      "year_built": 2015,
      "listing_url": "https://example.com/listing/123",
      "days_on_market": 12,
      "primary_image_url": "https://example.com/images/123.jpg",
      "school_data": {
        "elementary": {
          "name": "Sunningdale Public School",
          "rating": 8.7,
          "distance_km": 0.8
        },
        "secondary": {
          "name": "Abbey Park High School",
          "rating": 8.5,
          "distance_km": 1.2
        },
        "overall_rating": 8.6
      },
      "walk_score": 72,
      "transit_score": 55,
      "score_breakdown": {
        "price_score": 85,
        "school_score": 95,
        "walkability_score": 72,
        "size_score": 90
      },
      "pros": [
        "Excellent school ratings (8.6 overall)",
        "Modern construction (2015)",
        "Good lot size for the area",
        "Walk score above preference"
      ],
      "cons": [
        "At the higher end of budget ($50K under max)",
        "12 days on market - may have competition"
      ],
      "agent_notes": "This property hits nearly all your criteria. The schools are excellent—Abbey Park is one of the top-rated high schools in Halton. The 2015 build means modern systems and likely lower maintenance. It's priced near your maximum, but offers strong value given the school catchment. Worth viewing quickly given days on market."
    }
  ],
  
  "market_context": {
    "avg_price_area": 1380000,
    "avg_days_on_market": 21,
    "inventory_level": "low",
    "price_trend": "stable",
    "notes": "Oakville's detached home market remains competitive with limited inventory. Properties in top school catchments typically sell within 15-20 days."
  }
}
```

---

## 6. DATA REQUIREMENTS

### Database Tables

Uses shared `case_studies` and `execution_steps` tables.

### Agent-Specific: School Data (Pre-loaded)
```sql
-- School ratings data (Fraser Institute)
CREATE TABLE schools (
  id UUID PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  school_type VARCHAR(20),          -- 'elementary', 'secondary'
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(50),
  postal_code VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  fraser_rating DECIMAL(3, 1),      -- 1.0 to 10.0
  rating_year INTEGER,
  enrollment INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- School catchment areas (simplified)
CREATE TABLE school_catchments (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES schools(id),
  postal_code VARCHAR(10),          -- Postal codes in catchment
  PRIMARY KEY (school_id, postal_code)
);
```

### Data Sources Needed

| Data | Source | Notes |
|------|--------|-------|
| Listings | HouseSigma API, Realtor.ca scrape, or mock data | Real estate data is hardest to get |
| School Ratings | Fraser Institute (free download) | Annual report cards |
| Walk Score | Walk Score API | Free tier available |
| Geocoding | Google Maps API or Mapbox | For lat/long lookup |

### Pre-loading School Data
```
1. Download Fraser Institute school rankings (Ontario)
2. Parse CSV into schools table
3. Build postal code → school mapping
4. Use this for all searches
```

---

## 7. CASE STUDIES

### Pre-Run Searches (5)

| # | Title | Location | Key Criteria |
|---|-------|----------|--------------|
| 1 | **Family Home in Oakville** | Oakville, ON | 4 bed, $1.5M max, school > 8 |
| 2 | **Starter Home in Burlington** | Burlington, ON | 3 bed, $900K max, transit focus |
| 3 | **Executive Home in Mississauga** | Mississauga, ON | 5 bed, $2.5M max, premium schools |
| 4 | **Downsizer in Milton** | Milton, ON | 3 bed, $1M max, single-level preferred |
| 5 | **Young Family in Brampton** | Brampton, ON | 4 bed, $1.2M max, newer builds |

### Case Study Details

**Case Study 1: Family Home in Oakville**
```json
{
  "title": "Family Home in Oakville",
  "subtitle": "4+ bedrooms with top-rated schools under $1.5M",
  "input_parameters": {
    "search_name": "Family Home in Oakville",
    "location": {
      "city": "Oakville",
      "province": "Ontario"
    },
    "requirements": {
      "bedrooms_min": 4,
      "bathrooms_min": 3,
      "price_max": 1500000,
      "property_types": ["detached", "semi-detached"]
    },
    "preferences": {
      "school_rating_min": 8,
      "walk_score_min": 50
    },
    "max_results": 10
  }
}
```

**Case Study 2: Starter Home in Burlington**
```json
{
  "title": "Starter Home in Burlington",
  "subtitle": "First home buyers prioritizing transit and value",
  "input_parameters": {
    "search_name": "Starter Home Burlington",
    "location": {
      "city": "Burlington",
      "province": "Ontario"
    },
    "requirements": {
      "bedrooms_min": 3,
      "bathrooms_min": 2,
      "price_max": 900000,
      "property_types": ["semi-detached", "townhouse", "condo"]
    },
    "preferences": {
      "transit_score_min": 60,
      "school_rating_min": 7
    },
    "max_results": 10
  }
}
```

**Case Study 3: Executive Home in Mississauga**
```json
{
  "title": "Executive Home in Mississauga",
  "subtitle": "Premium property with top schools and space",
  "input_parameters": {
    "search_name": "Executive Mississauga",
    "location": {
      "city": "Mississauga",
      "province": "Ontario",
      "neighborhoods": ["Lorne Park", "Mineola", "Port Credit"]
    },
    "requirements": {
      "bedrooms_min": 5,
      "bathrooms_min": 4,
      "price_max": 2500000,
      "sqft_min": 3500,
      "property_types": ["detached"]
    },
    "preferences": {
      "school_rating_min": 8.5,
      "lot_size_preference": "large"
    },
    "max_results": 10
  }
}
```

---

## 8. UI COMPONENTS

### Page Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🏠 Home Match Agent                                         │ │
│ │ "AI-powered home matching with school ratings"              │ │
│ │ [Multi-Criteria Matching Agent]                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ HOW IT WORKS                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Criteria] → [Search] → [Filter] → [Enrich Schools] →       │ │
│ │ [Enrich Scores] → [Rank] → [Analyze] → [Report]             │ │
│ │                                                             │ │
│ │ This agent searches listings, enriches with school and      │ │
│ │ walkability data, then ranks properties by how well they    │ │
│ │ match your requirements and preferences.                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ CASE STUDIES                                                    │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────┐│
│ │ Oakville  │ │ Burlington│ │ Mississauga│ │ Milton   │ │Bramp││
│ │ Family    │ │ Starter   │ │ Executive │ │ Downsizer│ │ ton ││
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └─────┘│
├─────────────────────────────────────────────────────────────────┤
│ SELECTED CASE STUDY                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Search Criteria                                             │ │
│ │ Location: Oakville, ON                                      │ │
│ │ Requirements: 4+ bed, 3+ bath, ≤$1.5M, detached/semi       │ │
│ │ Preferences: School rating ≥8, Walk score ≥50              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Execution Trace                                             │ │
│ │ ✓ Step 1: Parse Criteria ...................... 0.2s       │ │
│ │ ✓ Step 2: Search Listings ..................... 3.4s       │ │
│ │   └ 156 listings found in Oakville                          │ │
│ │ ✓ Step 3: Apply Hard Filters .................. 0.8s       │ │
│ │   └ 23 listings match requirements                          │ │
│ │ ✓ Step 4: Enrich with School Data ............. 4.2s       │ │
│ │ ✓ Step 5: Enrich with Walk/Transit Scores ..... 2.1s       │ │
│ │ ✓ Step 6: Score & Rank ........................ 1.5s       │ │
│ │ ✓ Step 7: Analyze Tradeoffs ................... 3.8s       │ │
│ │ ✓ Step 8: Generate Report ..................... 1.2s       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Search Results                                              │ │
│ │                                                             │ │
│ │ SUMMARY                                                     │ │
│ │ 156 found → 23 match requirements → 10 best shown          │ │
│ │ Price range: $1.15M - $1.49M (median $1.35M)               │ │
│ │                                                             │ │
│ │ TOP MATCHES                                                 │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ #1  94% Match                              $1,450,000   │ │ │
│ │ │ ┌───────┐ 123 Lakeshore Rd W, Oakville                  │ │ │
│ │ │ │ IMAGE │ 4 bed | 3 bath | 2,800 sqft | Detached        │ │ │
│ │ │ └───────┘                                               │ │ │
│ │ │ 🏫 School: 8.6  🚶 Walk: 72  🚌 Transit: 55             │ │ │
│ │ │                                                         │ │ │
│ │ │ ✓ Excellent schools    ✓ Modern (2015)                  │ │ │
│ │ │ ⚠ Near budget max      ⚠ 12 days on market             │ │ │
│ │ │                                                         │ │ │
│ │ │ "This property hits nearly all your criteria..."        │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │ [More property cards...]                                    │ │
│ │                                                             │ │
│ │ MAP VIEW                                                    │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │                                                         │ │ │
│ │ │    [Interactive map with property pins]                 │ │ │
│ │ │                                                         │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ MARKET CONTEXT                                              │ │
│ │ Avg price: $1.38M | Avg days on market: 21 | Inventory: Low│ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Components Needed

| Component | Purpose |
|-----------|---------|
| `AgentHeader` | Icon, name, tagline, type badge |
| `HowItWorks` | 8-step diagram |
| `CaseStudyGrid` | Grid of search cards |
| `CaseStudyCard` | Individual search preview |
| `SearchCriteria` | Display requirements and preferences |
| `ExecutionTrace` | Step list with counts |
| `SearchSummary` | Funnel visualization (found → filtered → shown) |
| `PropertyCard` | Individual property with image, details, scores |
| `MatchScoreBadge` | Large percentage badge |
| `ScoreIndicators` | School/Walk/Transit score pills |
| `ProsCons` | Checkmarks and warnings list |
| `AgentNotes` | Natural language analysis block |
| `PropertyMap` | Map with pins for all matches |
| `MarketContext` | Market statistics bar |

### Score Color Coding
| Score Range | Color |
|-------------|-------|
| 90-100 | Green |
| 75-89 | Light Green |
| 60-74 | Yellow |
| Below 60 | Orange |

---

## 9. TECHNICAL NOTES

### Agent Implementation
- **Framework:** LangChain (Python)
- **LLM:** Claude API for analysis and natural language
- **Listings:** Mock data recommended (real APIs are restricted)
- **Schools:** Fraser Institute data (pre-loaded)
- **Walk Score:** API or mock data

### Data Strategy

**Option A: Mock Listings (Recommended)**
```
Create realistic mock listings for each city:
- Generate 50-100 properties per search area
- Vary prices, sizes, ages realistically
- Include realistic addresses
- Use placeholder images or Unsplash

Benefits: 
- No API costs
- No legal issues
- Full control over demo data
- Consistent results
```

**Option B: Point-in-Time Snapshot**
```
Scrape listings once, save to database:
- Run scraper manually
- Store listing details locally
- Use for all demos
- Note: "Data as of [date]"

Benefits:
- Real data
- One-time effort

Risks:
- Data goes stale
- Scraping may violate ToS
```

### School Data Loading
```python
# Example: Loading Fraser Institute data
import pandas as pd

# Download from: https://www.fraserinstitute.org/school-performance
df = pd.read_csv('ontario_school_rankings.csv')

# Insert into database
for _, row in df.iterrows():
    insert_school(
        name=row['School Name'],
        school_type=row['Level'],
        city=row['City'],
        rating=row['Rating'],
        # etc.
    )
```

### Key Considerations
- Real estate data is the hardest part—consider mock data
- School ratings update annually (use latest available)
- Walk Score free tier has limits—cache results
- Always show "data as of" date
- Include market context for realism

---

---

## 10. IMMUTABLE CONSTANTS (DO NOT CHANGE)

These elements are locked across all 5 agents for portfolio consistency:

### Database Schema (Universal)
```sql
-- Shared by ALL agents - never modify

case_studies
├── id UUID PRIMARY KEY
├── agent_slug VARCHAR(50)        -- Links to agent
├── title VARCHAR(200)
├── subtitle VARCHAR(300)
├── input_parameters JSONB        -- Agent-specific input
├── output_result JSONB           -- Agent-specific output
├── execution_trace JSONB         -- Array of steps
├── featured BOOLEAN
├── display_order INTEGER
├── created_at TIMESTAMP
└── updated_at TIMESTAMP

execution_steps
├── id UUID PRIMARY KEY
├── case_study_id UUID            -- FK to case_studies
├── step_number INTEGER
├── step_name VARCHAR(100)
├── step_type VARCHAR(50)         -- 'search', 'analysis', 'synthesis', etc.
├── input_summary TEXT
├── output_summary TEXT
├── details JSONB                 -- Step-specific details
├── duration_ms INTEGER
└── timestamp TIMESTAMP
```

### Agent Registry (All 5 Agents)
| Agent | Slug | Type Badge | Badge Color |
|-------|------|------------|-------------|
| Fraud Trends | `fraud-trends` | Research & Synthesis Agent | Blue |
| Stock Monitor | `stock-monitor` | Event Detection & Alert Agent | Green |
| House Finder | `house-finder` | Multi-Criteria Matching Agent | Orange |
| Article Editor | `article-editor` | Content Enhancement Agent | Purple |
| Gita Guide | `gita-guide` | Conversational Expert Agent | Saffron |

### Page Structure (Every Agent Page)
```
1. HEADER         → Icon + Name + Tagline + Type Badge
2. HOW IT WORKS   → Step diagram + brief explanation
3. CASE STUDIES   → Grid of 5 clickable cards
4. DETAIL VIEW    → Input → Execution Trace → Output
```

### Execution Step Format (Universal)
```typescript
interface ExecutionStep {
  step_number: number;      // Sequential: 1, 2, 3...
  step_name: string;        // Human-readable
  step_type: string;        // 'setup' | 'search' | 'analysis' | 'synthesis' | 'filter' | 'enrichment'
  input_summary: string;    // What went in
  output_summary: string;   // What came out
  details: object;          // Expandable (agent-specific)
  duration_ms: number;      // Execution time
}
```

### Shared UI Components (Build Once, Use Everywhere)
| Component | Purpose |
|-----------|---------|
| `AgentHeader` | Icon, name, tagline, type badge |
| `HowItWorks` | Step diagram |
| `CaseStudyGrid` | Grid of case study cards |
| `CaseStudyCard` | Individual preview card |
| `ExecutionTrace` | Step-by-step trace display |
| `ExecutionStep` | Single expandable step |

### API Route Pattern
```
/api/agents/[slug]/case-studies       → List case studies
/api/agents/[slug]/case-studies/[id]  → Get single case study
```

### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Agent slug | kebab-case | `house-finder` |
| Component | PascalCase | `CaseStudyCard` |
| DB table | snake_case | `case_studies` |
| JSON field | snake_case | `input_parameters` |
| TS interface | PascalCase | `HomeSearchInput` |

### Fixed Constraints
- **5 case studies per agent** (no more, no less)
- **All agents use same database tables**
- **All agents follow same page layout**
- **All execution steps use same format**

---

## COPY-PASTE CHECKLIST

When starting a new chat to build this agent:

- [ ] Copy this entire document
- [ ] Decide on data strategy (mock vs real)
- [ ] Download Fraser Institute school data
- [ ] Load school data into database
- [ ] Create mock listings (or scrape once)
- [ ] Build agent script (Python)
- [ ] Run on all 5 search scenarios
- [ ] Export execution traces to JSON
- [ ] Build frontend components (property cards, map)
- [ ] Import data to database
- [ ] Connect frontend to database
