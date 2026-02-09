# Complete Build Plan: All 5 AI Agents

**Status**: ✅ Infrastructure Complete | 🚧 Ready to Build Agents

---

## 📋 Build Order (Recommended)

### Priority: Moderate → Easy → Complex

1. **Article Editor** (Moderate) - 5-7 hours
2. **Fraud Trends** (Moderate) - 4-5 hours
3. **Gita Guide** (Easy, but data-heavy) - 5-8 hours
4. **Stock Monitor** (Complex) - 4-5 hours
5. **House Finder** (Most Complex) - 9-11 hours

**Total Estimated Time**: 27-36 hours

---

## 🎯 Agent 1: Article Editor

### Status: Ready to Build
### Estimated Time: 5-7 hours

#### Data Requirements
- ✅ **YOU NEED TO WRITE**: 5 draft articles (150-300 words each)
- ✅ **API**: Tavily or SerpAPI for reference searching

#### Topics for Your Drafts
1. Insurance Fraud in the Digital Age (Blog Post)
2. AI Governance Framework (Whitepaper)
3. Modernizing Claims Processing (How-To Guide)
4. Predictive Analytics Opinion (Opinion Piece)
5. Customer Experience 2025 (Report)

#### Build Steps
1. **Write 5 drafts** (2-3 hours)
   - Make them intentionally imperfect (vague claims, no citations, weak flow)
   - Save as: `agents/article-editor/data/draft_001.txt` through `draft_005.txt`

2. **Get API Key**
   - Tavily: https://tavily.com/ (1,000 free searches/month)
   - Add to `.env`: `TAVILY_API_KEY=...`

3. **Build Agent** (3-4 hours)
   - Create `agents/article-editor/agent.py`
   - Implement 7 steps:
     1. Analyze Structure
     2. Identify Claims
     3. Search References
     4. Find Examples
     5. Analyze Flow
     6. Generate Suggestions
     7. Produce Enhanced Version

4. **Run on 5 Drafts**
   ```bash
   cd agents/article-editor
   python agent.py
   # Generates: output/case_study_001.json through 005.json
   ```

5. **Import to Database**
   ```bash
   python scripts/import-case-studies.py --agent article-editor
   ```

#### Success Criteria
- [x] 5 case studies with before/after articles
- [x] References found and cited
- [x] Structure analysis scores
- [x] Word count improvements tracked

---

## 🎯 Agent 2: Fraud Trends Investigator

### Status: Ready to Build
### Estimated Time: 4-5 hours

#### Data Requirements
- ✅ **API**: Tavily or SerpAPI (same as Article Editor)
- ✅ **Topics**: Defined in requirements (5 fraud topics)

#### Build Steps
1. **API Setup** (already done if you built Article Editor)

2. **Build Agent** (4-5 hours)
   - Create `agents/fraud-trends/agent.py`
   - Implement 6 steps:
     1. Plan Research
     2. Search Industry Sources
     3. Search Regulatory Reports
     4. Search News & Academic
     5. Extract Key Findings
     6. Synthesize Report

3. **Run on 5 Topics**
   ```bash
   cd agents/fraud-trends
   python agent.py --topic "Auto Insurance Fraud" --regions "Canada,US" --years "2024-2025"
   # Repeat for all 5 topics from requirements
   ```

4. **Import to Database**

#### Topics (from requirements)
1. Auto Insurance Fraud 2024-2025
2. Property Fraud After Climate Events
3. Digital & Synthetic Identity Fraud
4. Organized Fraud Rings
5. Technology in Fraud Detection

#### Success Criteria
- [x] 5 research reports with trends, statistics, sources
- [x] 10+ sources per report
- [x] Executive summaries
- [x] Trend direction indicators

---

## 🎯 Agent 3: Gita Guide

### Status: Needs Data Preparation
### Estimated Time: 5-8 hours

#### Data Requirements
- 🔴 **Bhagavad Gita Verses**: 700 verses (18 chapters)
- 🔴 **Concepts**: 50-100 key terms
- 🔴 **Chapter Summaries**: 18 summaries

#### Data Sourcing Options

**Option A: Automated (Recommended)**
- Use vedabase.io API or structured source
- Script to download and parse
- Time: 2 hours

**Option B: Manual CSV**
- Find CSV/JSON dataset online
- Import to database
- Time: 4-6 hours

**Option C: I Help You Compile**
- I can create a starter dataset with 50-100 key verses
- You expand as needed
- Time: 2-3 hours

#### Build Steps
1. **Prepare Data** (2-4 hours)
   - Get verses JSON/CSV
   - Create concepts CSV
   - Write chapter summaries

2. **Load Data**
   ```bash
   python scripts/load-gita-data.py --verses gita_verses.json --concepts gita_concepts.csv
   ```

3. **Build Agent** (3-4 hours)
   - Create `agents/gita-guide/agent.py`
   - Implement 5 steps:
     1. Understand Intent
     2. Retrieve Relevant Verses
     3. Check Conversation Context
     4. Adapt to User Level
     5. Formulate Teaching
     6. Suggest Next Steps

4. **Create 5 Example Conversations**
   - Manually simulate conversations
   - Save as case studies

5. **Build Live Chat API** (in website)
   - `/api/agents/gita-guide/chat`

#### Example Conversation Topics
1. Understanding Dharma
2. Dealing with Fear
3. Karma and Detachment
4. Finding Inner Peace
5. Life Transitions

#### Success Criteria
- [x] 700 verses loaded in database
- [x] 50+ concepts defined
- [x] 5 example conversations
- [x] Live chat functional
- [x] Rate limiting active

---

## 🎯 Agent 4: Stock Monitor

### Status: Ready to Build (API key needed)
### Estimated Time: 4-5 hours

#### Data Requirements
- 🔴 **API**: Finnhub (free: 60 calls/min) or Alpha Vantage
- ✅ **Watchlists**: Defined in requirements (5 watchlists)

#### Build Steps
1. **Get API Key**
   - Finnhub: https://finnhub.io/ (signup with email)
   - Add to `.env`: `FINNHUB_API_KEY=...`

2. **Build Agent** (4-5 hours)
   - Create `agents/stock-monitor/agent.py`
   - Implement 6 steps:
     1. Initialize Scan
     2. Search News per Ticker
     3. Search SEC Filings
     4. Classify Events
     5. Assess Impact
     6. Generate Alerts

3. **Run on 5 Watchlists**
   ```bash
   cd agents/stock-monitor
   python agent.py --watchlist "Tech Giants" --tickers "AAPL,MSFT,GOOGL,AMZN,META,NVDA"
   # Repeat for all 5 watchlists
   ```

4. **Import to Database**

#### Watchlists (from requirements)
1. Tech Giants (6 stocks)
2. Canadian Banks (5 stocks)
3. Insurance Sector (6 stocks)
4. EV & Clean Energy (6 stocks)
5. Canadian REITs (5 stocks)

#### Success Criteria
- [x] 5 watchlist scans
- [x] Events classified (acquisition, buyback, etc.)
- [x] Impact assessments (positive/negative/neutral)
- [x] No-events list included
- [x] Financial disclaimer added

---

## 🎯 Agent 5: House Finder

### Status: Needs Data Preparation (Most Complex)
### Estimated Time: 9-11 hours

#### Data Requirements
- 🔴 **School Data**: Fraser Institute CSV (real data)
- 🔴 **Real Estate Listings**: Mock data (recommended)
- 🟡 **Walk Score**: Optional (can mock)

#### Build Steps
1. **Get School Data** (1 hour)
   - Download: https://www.compareschoolrankings.org/
   - Get Ontario School Rankings CSV
   - Load to database:
   ```bash
   python scripts/load-school-data.py --csv fraser_ontario_2024.csv
   ```

2. **Create Mock Listings** (3-4 hours)
   - Create realistic mock data for 5 cities:
     - Oakville, Burlington, Mississauga, Milton, Brampton
   - 20-30 properties per city
   - Match postal codes to school catchments
   - Save as: `agents/house-finder/data/mock_listings.json`

3. **Build Agent** (5-6 hours)
   - Create `agents/house-finder/agent.py`
   - Implement 8 steps:
     1. Parse Criteria
     2. Search Listings
     3. Apply Hard Filters
     4. Enrich with School Data
     5. Enrich with Walk Scores
     6. Score & Rank
     7. Analyze Tradeoffs
     8. Generate Report

4. **Run on 5 Searches**
   ```bash
   cd agents/house-finder
   python agent.py --city "Oakville" --bedrooms 4 --price-max 1500000 --school-min 8
   # Repeat for all 5 searches
   ```

5. **Import to Database**

#### Search Scenarios (from requirements)
1. Family Home in Oakville (4 bed, $1.5M, school > 8)
2. Starter Home in Burlington (3 bed, $900K, transit)
3. Executive Home in Mississauga (5 bed, $2.5M, premium)
4. Downsizer in Milton (3 bed, $1M, single-level)
5. Young Family in Brampton (4 bed, $1.2M, newer)

#### Success Criteria
- [x] School data loaded (~3,000 schools)
- [x] Mock listings created (100-150 properties)
- [x] 5 search results with rankings
- [x] Match scores calculated
- [x] Pros/cons analysis
- [x] Map data (lat/long)

---

## 🌐 Website Build Plan

### After All Agents Complete

#### Phase 1: Shared Components (4-5 hours)
```
src/components/shared/
├── AgentHeader.tsx
├── HowItWorks.tsx
├── CaseStudyGrid.tsx
├── CaseStudyCard.tsx
├── ExecutionTrace.tsx
└── ExecutionStep.tsx
```

#### Phase 2: API Routes (2-3 hours)
```
src/app/api/agents/[slug]/
├── case-studies/route.ts     (GET list)
└── case-studies/[id]/route.ts (GET single)

src/app/api/agents/gita-guide/
└── chat/route.ts              (POST - live chat)
```

#### Phase 3: Agent Pages (3-4 hours)
```
src/app/agents/[slug]/page.tsx
```
- Dynamic route for all 5 agents
- Loads case studies from API
- Renders agent-specific output

#### Phase 4: Agent-Specific Components (5-6 hours)
```
src/components/fraud-trends/
├── ResearchReport.tsx
├── TrendCard.tsx
└── SourceList.tsx

src/components/stock-monitor/
├── AlertCard.tsx
└── SentimentBadge.tsx

src/components/house-finder/
├── PropertyCard.tsx
└── PropertyMap.tsx

src/components/article-editor/
├── BeforeAfterComparison.tsx
└── DiffView.tsx

src/components/gita-guide/
├── ChatInterface.tsx
├── VerseCard.tsx
└── ConceptPill.tsx
```

#### Phase 5: Landing Page (2-3 hours)
- Adapt `agents-landing-red-primary.html` to Next.js
- Interactive robot stage
- Agent cards grid

**Total Website Time**: 16-21 hours

---

## 📅 Complete Timeline

### Week 1: Infrastructure + First 2 Agents
- **Day 1**: ✅ Folder structure, database schema, types (DONE)
- **Day 2-3**: Article Editor (write drafts + build agent)
- **Day 4-5**: Fraud Trends (build agent + run)

### Week 2: Remaining 3 Agents
- **Day 1-2**: Gita Guide (prepare data + build)
- **Day 3**: Stock Monitor (build + run)
- **Day 4-5**: House Finder (prepare data + build)

### Week 3: Website
- **Day 1-2**: Shared components + API routes
- **Day 3-4**: Agent-specific components
- **Day 5**: Landing page + polish

### Week 4: Deploy & Test
- **Day 1**: Deploy to Vercel
- **Day 2**: Link from portfolio
- **Day 3**: Test all agents
- **Day 4-5**: Fix bugs, polish UI

**Total Project Time**: 3-4 weeks (part-time)

---

## ✅ Current Status Checklist

Infrastructure Setup:
- [x] Folder structure created
- [x] `.gitignore` configured
- [x] Database schema designed
- [x] TypeScript types defined
- [x] `.env.example` templates created
- [x] Data sourcing strategy documented
- [x] README written
- [x] Docs organized

Ready to Build:
- [ ] Article Editor
- [ ] Fraud Trends
- [ ] Gita Guide
- [ ] Stock Monitor
- [ ] House Finder

---

## 🚀 Next Steps

You have 3 options:

### Option A: Start with Article Editor
1. Write your 5 draft articles now (2-3 hours)
2. Get Tavily API key (5 min)
3. Build the agent (3-4 hours)
4. Generate case studies
5. **Time to first working agent**: ~1 day

### Option B: Start with Fraud Trends
1. Get Tavily API key (5 min)
2. Build the agent (4-5 hours)
3. Run on 5 topics
4. **Time to first working agent**: ~5-6 hours

### Option C: Parallel Approach
1. Write drafts for Article Editor (background)
2. Build Fraud Trends (foreground)
3. By the time Fraud Trends is done, drafts are ready
4. Build Article Editor
5. **Time to 2 agents**: ~1.5 days

---

## 💡 Recommendation

**Start with Fraud Trends**:
- Requires only API key (no data prep)
- Shows full research workflow
- Quick win to build momentum
- While it runs, write your Article Editor drafts

Then do Article Editor, then Gita Guide, then Stock Monitor, then House Finder.

---

**Ready to start building? Let me know which agent you want to tackle first!**
