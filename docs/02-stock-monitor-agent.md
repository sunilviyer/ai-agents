# Agent 2: Market Watch Agent

## 1. IDENTITY

| Field | Value |
|-------|-------|
| **Name** | Market Watch Agent |
| **Slug** | `stock-monitor` |
| **Tagline** | "AI-powered financial event detection" |
| **Type** | Event Detection & Alert Agent |
| **Icon** | 📈 |
| **Badge Color** | Green |

---

## 2. CONCEPT

### What It Does
This agent monitors a predefined watchlist of stocks for specific corporate events (mergers, acquisitions, buybacks, stock dilution). It scans news and filings, classifies events, assesses impact, and generates alert cards.

### Why It's Unique (Agent Archetype)
**Event Detection & Alert** — The agent's core capability is:
- Watching a defined set of items (watchlist)
- Detecting specific event types (classification)
- Assessing significance and impact
- Generating alerts only when conditions are met

### Value Proposition
"Watch my portfolio. When something important happens—a merger, acquisition, buyback, or dilution—tell me immediately and explain what it means."

### Demo Approach
**Pre-run only.** You execute the agent on 5 different watchlists, save the execution traces and alerts. Visitors browse the saved scans and see what events were detected.

---

## 3. INPUT SCHEMA

```typescript
interface StockMonitorInput {
  // Name for this watchlist
  watchlist_name: string;           // e.g., "Tech Giants"
  
  // Stocks to monitor
  tickers: TickerInfo[];
  
  // Event types to watch for
  event_types: EventType[];
  
  // How far back to search
  lookback_days: number;            // e.g., 14
}

interface TickerInfo {
  ticker: string;                   // e.g., "AAPL"
  company_name: string;             // e.g., "Apple Inc."
  exchange?: string;                // e.g., "NASDAQ"
}

type EventType = 
  | 'merger' 
  | 'acquisition' 
  | 'buyback' 
  | 'dilution' 
  | 'spinoff' 
  | 'dividend_change'
  | 'executive_change'
  | 'earnings_surprise';
```

### Example Input
```json
{
  "watchlist_name": "Tech Giants",
  "tickers": [
    {"ticker": "AAPL", "company_name": "Apple Inc.", "exchange": "NASDAQ"},
    {"ticker": "MSFT", "company_name": "Microsoft Corporation", "exchange": "NASDAQ"},
    {"ticker": "GOOGL", "company_name": "Alphabet Inc.", "exchange": "NASDAQ"},
    {"ticker": "AMZN", "company_name": "Amazon.com Inc.", "exchange": "NASDAQ"},
    {"ticker": "NVDA", "company_name": "NVIDIA Corporation", "exchange": "NASDAQ"},
    {"ticker": "META", "company_name": "Meta Platforms Inc.", "exchange": "NASDAQ"}
  ],
  "event_types": ["merger", "acquisition", "buyback", "dilution"],
  "lookback_days": 14
}
```

---

## 4. PROCESSING STEPS

| Step # | Name | Type | Description | Example Output |
|--------|------|------|-------------|----------------|
| 1 | **Initialize Scan** | `setup` | Load watchlist, set date range, prepare queries | 6 tickers, 14-day range |
| 2 | **Search News per Ticker** | `search` | Query financial news for each stock | 45 articles found |
| 3 | **Search SEC Filings** | `search` | Check 8-K, S-1, proxy statements | 8 filings found |
| 4 | **Classify Events** | `analysis` | Determine if news matches event types | 3 potential events |
| 5 | **Assess Impact** | `analysis` | Evaluate significance for shareholders | Impact scores assigned |
| 6 | **Generate Alerts** | `synthesis` | Compile final alert cards | 2 alerts generated |

### Step Details

**Step 1: Initialize Scan**
```
Input: Watchlist configuration
Process:
  - Parse ticker list
  - Calculate date range (today - lookback_days)
  - Build search query templates
  - Initialize results collection
Output: Scan configuration ready
```

**Step 2: Search News per Ticker**
```
Input: Ticker list + event keywords
Process:
  For each ticker:
    - Search: "{ticker} + {company_name} + merger OR acquisition OR buyback..."
    - Filter by date range
    - Capture: headline, source, date, snippet
Output: News articles per ticker
```

**Step 3: Search SEC Filings**
```
Input: Ticker list + date range
Process:
  For each ticker:
    - Query SEC EDGAR for 8-K filings (material events)
    - Query for S-1/S-3 (securities offerings)
    - Query for DEF 14A (proxy statements)
Output: Relevant filings per ticker
```

**Step 4: Classify Events**
```
Input: All news + filings
Process:
  For each article/filing:
    - Determine event type (merger, acquisition, buyback, etc.)
    - Assign confidence score (high/medium/low)
    - Extract key details (parties, amounts, dates)
    - Filter out irrelevant/low-confidence items
Output: Classified events with metadata
```

**Step 5: Assess Impact**
```
Input: Classified events
Process:
  For each event:
    - Determine sentiment (positive/negative/neutral)
    - Assess magnitude (material vs minor)
    - Identify short-term vs long-term implications
    - Generate impact summary
Output: Events with impact assessments
```

**Step 6: Generate Alerts**
```
Input: Assessed events
Process:
  - Filter to high-confidence, material events only
  - Rank by importance
  - Format alert cards with all details
  - List tickers with no events detected
Output: Final alert collection
```

---

## 5. OUTPUT SCHEMA

```typescript
interface StockMonitorOutput {
  // Scan metadata
  scan_id: string;
  scan_timestamp: string;           // ISO timestamp
  watchlist_name: string;
  scan_parameters: StockMonitorInput;
  
  // Date range scanned
  date_range: {
    start: string;                  // ISO date
    end: string;                    // ISO date
  };
  
  // Detected events
  alerts: StockAlert[];
  
  // Tickers with no events
  no_events: NoEventTicker[];
  
  // Summary statistics
  summary: {
    tickers_scanned: number;
    articles_reviewed: number;
    filings_reviewed: number;
    events_detected: number;
    alerts_generated: number;
  };
}

interface StockAlert {
  id: string;
  ticker: string;
  company_name: string;
  
  // Event classification
  event_type: EventType;
  event_date: string;               // When the event occurred/was announced
  
  // Content
  headline: string;
  summary: string;                  // 2-3 sentence explanation
  
  // Impact assessment
  impact: {
    sentiment: 'positive' | 'negative' | 'neutral';
    magnitude: 'major' | 'moderate' | 'minor';
    short_term: string;             // Immediate implications
    long_term: string;              // Strategic implications
  };
  
  // Confidence
  confidence: 'high' | 'medium' | 'low';
  
  // Key details extracted
  details: {
    parties_involved?: string[];    // For M&A
    deal_value?: string;            // For M&A, buybacks
    share_count?: string;           // For buybacks, dilution
    percentage?: string;            // For ownership changes
  };
  
  // Source
  source: {
    title: string;
    url: string;
    publication: string;
    date: string;
  };
}

interface NoEventTicker {
  ticker: string;
  company_name: string;
  articles_scanned: number;
  filings_scanned: number;
  note: string;                     // e.g., "No relevant events in scan period"
}
```

### Example Output (Abbreviated)
```json
{
  "scan_id": "scan_20250201_tech",
  "scan_timestamp": "2025-02-01T14:30:00Z",
  "watchlist_name": "Tech Giants",
  "date_range": {
    "start": "2025-01-18",
    "end": "2025-02-01"
  },
  
  "alerts": [
    {
      "id": "alert_001",
      "ticker": "NVDA",
      "company_name": "NVIDIA Corporation",
      "event_type": "acquisition",
      "event_date": "2025-01-28",
      "headline": "NVIDIA Acquires AI Startup Run:ai for $700M",
      "summary": "NVIDIA has announced the acquisition of Run:ai, an AI infrastructure orchestration company, for approximately $700 million. The deal strengthens NVIDIA's software ecosystem for enterprise AI deployment.",
      "impact": {
        "sentiment": "positive",
        "magnitude": "moderate",
        "short_term": "Minor cash outlay relative to NVIDIA's market cap; deal expected to close Q2 2025",
        "long_term": "Strengthens competitive moat in enterprise AI infrastructure; adds recurring software revenue"
      },
      "confidence": "high",
      "details": {
        "parties_involved": ["NVIDIA Corporation", "Run:ai"],
        "deal_value": "$700 million"
      },
      "source": {
        "title": "NVIDIA to Acquire Run:ai",
        "url": "https://example.com/nvidia-runai",
        "publication": "Reuters",
        "date": "2025-01-28"
      }
    }
  ],
  
  "no_events": [
    {
      "ticker": "AAPL",
      "company_name": "Apple Inc.",
      "articles_scanned": 12,
      "filings_scanned": 2,
      "note": "No merger, acquisition, buyback, or dilution events detected in scan period"
    }
  ],
  
  "summary": {
    "tickers_scanned": 6,
    "articles_reviewed": 45,
    "filings_reviewed": 8,
    "events_detected": 3,
    "alerts_generated": 2
  }
}
```

---

## 6. DATA REQUIREMENTS

### Database Tables

Uses shared `case_studies` and `execution_steps` tables from universal schema.

### Agent-Specific: Watchlist Storage (Optional)
```sql
-- Optional: Store watchlists for reuse
CREATE TABLE watchlists (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  tickers JSONB NOT NULL,           -- Array of TickerInfo
  default_event_types JSONB,        -- Default event types to monitor
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Execution Step Detail Schema
```typescript
interface StockMonitorStepDetails {
  // For search steps
  ticker_being_searched?: string;
  queries_executed?: string[];
  articles_found?: number;
  filings_found?: number;
  sample_results?: Array<{
    headline: string;
    source: string;
    date: string;
  }>;
  
  // For classification steps
  events_identified?: number;
  events_filtered_out?: number;
  filter_reasons?: string[];
  
  // For impact assessment
  sentiment_breakdown?: {
    positive: number;
    negative: number;
    neutral: number;
  };
}
```

---

## 7. CASE STUDIES

### Pre-Run Watchlists (5)

| # | Title | Watchlist | Event Types | Notes |
|---|-------|-----------|-------------|-------|
| 1 | **Tech Giants Q1 2025** | AAPL, MSFT, GOOGL, AMZN, META, NVDA | All | Major tech companies |
| 2 | **Canadian Banks Q4 2024** | RY, TD, BNS, BMO, CM | All | Big 5 Canadian banks |
| 3 | **Insurance Sector Watch** | AIG, ALL, PGR, TRV, MET, CB | merger, acquisition | Insurance industry consolidation |
| 4 | **EV & Clean Energy** | TSLA, RIVN, NIO, LCID, ENPH, FSLR | All | High-volatility sector |
| 5 | **Canadian REITs** | REI.UN, CAR.UN, HR.UN, AP.UN, CRT.UN | acquisition, dilution | Real estate investment trusts |

### Case Study Details

**Case Study 1: Tech Giants Q1 2025**
```json
{
  "title": "Tech Giants Q1 2025",
  "subtitle": "Monitoring major technology companies for corporate events",
  "input_parameters": {
    "watchlist_name": "Tech Giants",
    "tickers": [
      {"ticker": "AAPL", "company_name": "Apple Inc."},
      {"ticker": "MSFT", "company_name": "Microsoft Corporation"},
      {"ticker": "GOOGL", "company_name": "Alphabet Inc."},
      {"ticker": "AMZN", "company_name": "Amazon.com Inc."},
      {"ticker": "META", "company_name": "Meta Platforms Inc."},
      {"ticker": "NVDA", "company_name": "NVIDIA Corporation"}
    ],
    "event_types": ["merger", "acquisition", "buyback", "dilution"],
    "lookback_days": 30
  }
}
```

**Case Study 2: Canadian Banks Q4 2024**
```json
{
  "title": "Canadian Banks Q4 2024",
  "subtitle": "Big Five Canadian banks corporate event scan",
  "input_parameters": {
    "watchlist_name": "Canadian Big Five",
    "tickers": [
      {"ticker": "RY", "company_name": "Royal Bank of Canada"},
      {"ticker": "TD", "company_name": "Toronto-Dominion Bank"},
      {"ticker": "BNS", "company_name": "Bank of Nova Scotia"},
      {"ticker": "BMO", "company_name": "Bank of Montreal"},
      {"ticker": "CM", "company_name": "Canadian Imperial Bank of Commerce"}
    ],
    "event_types": ["merger", "acquisition", "buyback", "dilution", "dividend_change"],
    "lookback_days": 90
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
│ │ 📈 Market Watch Agent                                       │ │
│ │ "AI-powered financial event detection"                      │ │
│ │ [Event Detection & Alert Agent]                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ HOW IT WORKS                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Watchlist] → [Scan News] → [Scan Filings] →                │ │
│ │ [Classify] → [Assess Impact] → [Generate Alerts]            │ │
│ │                                                             │ │
│ │ This agent monitors your stock watchlist for corporate      │ │
│ │ events like mergers, acquisitions, and buybacks, then       │ │
│ │ alerts you with impact assessments.                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ CASE STUDIES                                                    │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────┐│
│ │ Tech      │ │ Canadian  │ │ Insurance │ │ EV &      │ │CAD  ││
│ │ Giants    │ │ Banks     │ │ Sector    │ │ Clean     │ │REITs││
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └─────┘│
├─────────────────────────────────────────────────────────────────┤
│ SELECTED CASE STUDY                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Scan Parameters                                             │ │
│ │ • Watchlist: Tech Giants (6 stocks)                         │ │
│ │ • Events: merger, acquisition, buyback, dilution            │ │
│ │ • Period: Jan 1 - Jan 31, 2025                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Execution Trace                                             │ │
│ │ ✓ Step 1: Initialize Scan .................... 0.3s        │ │
│ │ ✓ Step 2: Search News per Ticker ............. 12.4s       │ │
│ │   └ AAPL: 8 articles | MSFT: 12 articles | ...              │ │
│ │ ✓ Step 3: Search SEC Filings ................. 6.2s        │ │
│ │ ✓ Step 4: Classify Events .................... 3.1s        │ │
│ │ ✓ Step 5: Assess Impact ...................... 2.4s        │ │
│ │ ✓ Step 6: Generate Alerts .................... 1.1s        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Scan Results                                                │ │
│ │                                                             │ │
│ │ SUMMARY                                                     │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │ │
│ │ │ 6        │ │ 45       │ │ 8        │ │ 2        │        │ │
│ │ │ Tickers  │ │ Articles │ │ Filings  │ │ Alerts   │        │ │
│ │ │ Scanned  │ │ Reviewed │ │ Checked  │ │ Generated│        │ │
│ │ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │ │
│ │                                                             │ │
│ │ ALERTS                                                      │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ 📈 NVDA    Acquisition    [Positive] [High Confidence]  │ │ │
│ │ │ NVIDIA Acquires Run:ai for $700M                        │ │ │
│ │ │ Summary text...                                         │ │ │
│ │ │ Impact: Strengthens AI infrastructure position          │ │ │
│ │ │ [View Source →]                                         │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ NO EVENTS DETECTED                                          │ │
│ │ AAPL (12 articles) • MSFT (15 articles) • AMZN (8 articles)│ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ DISCLAIMER                                                  │ │
│ │ This is a demonstration only. Not financial advice.         │ │
│ │ Always consult a qualified financial advisor.               │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Components Needed

| Component | Purpose |
|-----------|---------|
| `AgentHeader` | Icon, name, tagline, type badge |
| `HowItWorks` | Step diagram |
| `CaseStudyGrid` | Grid of watchlist scan cards |
| `CaseStudyCard` | Individual scan preview |
| `ScanParameters` | Display watchlist and filters |
| `ExecutionTrace` | Step list with per-ticker details |
| `ScanSummary` | Statistics cards (tickers, articles, alerts) |
| `AlertCard` | Individual alert with sentiment badge |
| `SentimentBadge` | Colored badge (green/red/gray) |
| `ConfidenceBadge` | High/Medium/Low indicator |
| `NoEventsRow` | List of tickers with no events |
| `DisclaimerBanner` | Financial advice disclaimer |

### Sentiment Badge Colors
| Sentiment | Color |
|-----------|-------|
| Positive | Green (`#22c55e`) |
| Negative | Red (`#ef4444`) |
| Neutral | Gray (`#6b7280`) |

### Event Type Icons
| Event | Icon |
|-------|------|
| Merger | 🤝 |
| Acquisition | 🏢 |
| Buyback | 💵 |
| Dilution | 📉 |
| Spinoff | ✂️ |
| Dividend | 💰 |

---

## 9. TECHNICAL NOTES

### Agent Implementation
- **Framework:** LangChain (Python)
- **LLM:** Claude API for classification and summarization
- **News API:** Finnhub (free tier) or NewsAPI
- **SEC Data:** EDGAR API (free)

### Data Flow
```
1. Define watchlist and parameters
2. Run agent script locally
3. Agent scans news and filings
4. Classifies and assesses events
5. Save output + trace to JSON
6. Import to PostgreSQL
7. Frontend displays saved scans
```

### News Search Strategy
```
For each ticker:
  Query 1: "{ticker} merger OR acquisition"
  Query 2: "{ticker} buyback OR repurchase"
  Query 3: "{ticker} stock offering OR dilution"
  Query 4: "{company_name} deal OR transaction"
```

### SEC Filing Types to Check
| Filing | Description |
|--------|-------------|
| 8-K | Current report (material events) |
| S-1 | Registration for new securities |
| S-3 | Shelf registration |
| DEF 14A | Proxy statement |
| SC 13D | Ownership above 5% |

### Key Considerations
- Canadian stocks (TSX) won't have SEC filings—use SEDAR+
- Set realistic confidence thresholds to avoid false positives
- Include "no events" list to show thorough scanning
- Always include financial disclaimer

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
| Agent slug | kebab-case | `stock-monitor` |
| Component | PascalCase | `CaseStudyCard` |
| DB table | snake_case | `case_studies` |
| JSON field | snake_case | `input_parameters` |
| TS interface | PascalCase | `StockMonitorInput` |

### Fixed Constraints
- **5 case studies per agent** (no more, no less)
- **All agents use same database tables**
- **All agents follow same page layout**
- **All execution steps use same format**

---

## COPY-PASTE CHECKLIST

When starting a new chat to build this agent:

- [ ] Copy this entire document
- [ ] Reference the universal database schema
- [ ] Set up news API access (Finnhub recommended)
- [ ] Build agent script (Python)
- [ ] Run on all 5 watchlist scans
- [ ] Export execution traces to JSON
- [ ] Build frontend components
- [ ] Add financial disclaimer
- [ ] Import data to database
- [ ] Connect frontend to database
