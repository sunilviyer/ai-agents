# Fraud Trends Agent - Workflow Visualization Guide

This document provides a detailed step-by-step breakdown of the agent workflow, designed for creating animations and visual demonstrations.

---

## Complete Workflow Overview

```
USER INPUT → STEP 1 → STEP 2 → STEP 3 → STEP 4 → STEP 5 → STEP 6 → JSON OUTPUT
```

**Total Duration:** ~30-35 seconds
**Steps:** 6 workflow steps + 1 output generation
**APIs Used:** Anthropic Claude (3 calls), Tavily Search (8 calls)

---

## Detailed Step-by-Step Process

### 🎬 INITIALIZATION: User Input

**What Happens:**
- User provides research parameters via `FraudTrendsInput` model
- Input validation using Pydantic
- Environment variables checked (API keys)

**Input Fields:**
```json
{
  "topic": "User's research topic",
  "regions": ["List of geographic regions"],
  "time_range": "Time period (e.g., 2023-2024)",
  "focus_areas": ["Optional specific areas"]
}
```

**Example:**
```json
{
  "topic": "Benefits for data sharing across insurers",
  "regions": ["United States"],
  "time_range": "2023-2024",
  "focus_areas": null
}
```

**Validation:**
- Topic must be non-empty string
- Regions must be non-empty list
- Time range must be specified

**Visual Elements for Animation:**
- Form/input fields being filled
- Validation checkmarks
- Loading spinner starts

---

### 📋 STEP 1: Plan Research Strategy

**Duration:** ~1.5-2 seconds
**Type:** LLM-based planning
**Tool Used:** Anthropic Claude API

**What Happens:**
1. Takes user input parameters
2. Sends to Claude with specialized prompt
3. Claude analyzes topic and generates targeted search queries
4. Returns structured JSON with 3 query categories

**LLM Configuration:**
- **Model:** claude-3-haiku-20240307
- **Temperature:** 0.3 (low for consistent planning)
- **Prompt Type:** System + Human message

**System Prompt Focus:**
- Expert insurance fraud researcher persona
- Generate specific, targeted queries
- Optimize for authoritative sources

**Output Structure:**
```json
{
  "industry_queries": [
    "2-3 queries for insurance trade publications",
    "Industry reports and professional organizations"
  ],
  "regulatory_queries": [
    "2-3 queries for NAIC, FBI, state departments",
    "Government agencies and regulatory bodies"
  ],
  "academic_queries": [
    "1-2 queries for research papers",
    "University studies and peer-reviewed journals"
  ]
}
```

**Example Output:**
```json
{
  "industry_queries": [
    "benefits of data sharing among US insurance companies 2023-2024",
    "trends in insurance industry data collaboration 2023-2024",
    "insurance industry reports on cross-company data sharing 2023-2024"
  ],
  "regulatory_queries": [
    "NAIC guidelines for insurance data sharing 2023-2024",
    "FBI reports on insurance fraud prevention through data sharing 2023-2024",
    "US state insurance department policies on inter-company data exchange 2023-2024"
  ],
  "academic_queries": [
    "academic studies on the impact of data sharing on insurance fraud 2023-2024",
    "peer-reviewed research on benefits of cross-insurer data collaboration 2023-2024"
  ]
}
```

**Execution Logged:**
- Input: User's topic, regions, time range
- Output: Number of queries generated per category
- Duration: Milliseconds
- LLM model and temperature used

**Visual Elements for Animation:**
- Claude AI icon/logo
- "Analyzing research topic..." text
- Query categories appearing: Industry → Regulatory → Academic
- Progress bar filling
- Generated queries appearing in list format

---

### 🔍 STEP 2: Search Industry Sources

**Duration:** ~5-7 seconds
**Type:** Web search with Tavily API
**Tool Used:** Tavily Search (Advanced)

**What Happens:**
1. Takes industry queries from Step 1
2. Executes each query via Tavily API (3 calls)
3. Retrieves up to 10 results per query
4. Formats and collects all results
5. Handles errors gracefully (per-query try/catch)

**API Configuration:**
- **Search Depth:** advanced (comprehensive crawling)
- **Max Results Per Query:** 10
- **Domain Filtering:** None (open web search)
- **Source Tier:** Not explicitly set (determined later by URL analysis)

**Per-Query Process:**
```
Query → Tavily API → Parse Response → Format Results → Append to Collection
```

**Graceful Degradation:**
- If query fails: Log warning, continue with other queries
- Partial results acceptable: Don't crash entire workflow

**Result Format:**
```json
{
  "title": "Article/report title",
  "url": "https://source-url.com",
  "content": "Snippet or summary of content",
  "published_date": "2024-01-15" or null,
  "score": 0.85 (relevance score 0-1)
}
```

**Example Results:**
- "12 Insurance Industry Trends for 2024 | One Inc"
- "Key Trends in U.S. Benefits for 2024 and Beyond | Aon"
- "The Benefits of Data Sharing Now Outweigh the Risks | BCG"

**Execution Logged:**
- Input: List of industry queries
- Output: Total number of sources found
- Details: Results per query, search depth, max results setting
- All results stored in execution trace

**Visual Elements for Animation:**
- Tavily logo/icon
- "Searching industry sources..." text
- Progress indicator showing 3 queries
- Results counter incrementing: 0 → 10 → 20 → 30
- Sample source titles appearing
- Industry publication icons (trade journals, reports)

---

### 🏛️ STEP 3: Search Regulatory Sources

**Duration:** ~7-9 seconds
**Type:** Web search with domain filtering
**Tool Used:** Tavily Search (Advanced + Domain Filters)

**What Happens:**
1. Takes regulatory queries from Step 1
2. Applies domain filtering to target authoritative sources
3. Executes each query via Tavily API (3 calls)
4. Tags all results as Tier 1 (highest quality)
5. Formats and collects results

**API Configuration:**
- **Search Depth:** advanced
- **Max Results Per Query:** 10
- **Domain Filtering:** YES - 6 regulatory domains
- **Source Tier:** tier_1 (explicitly tagged)

**Domain Filters:**
```python
[
  "naic.org",          # National Association of Insurance Commissioners
  "fbi.gov",           # Federal Bureau of Investigation
  "doi.gov",           # Department of Insurance (various states)
  "insurance.ca.gov",  # California Department of Insurance
  "dfs.ny.gov",        # New York Department of Financial Services
  "tdi.texas.gov"      # Texas Department of Insurance
]
```

**Why Domain Filtering?**
- Ensures Tier 1 source quality
- Focuses on authoritative regulatory bodies
- Reduces noise from general web content

**Result Format:**
```json
{
  "title": "Regulatory report or advisory title",
  "url": "https://naic.org/...",
  "content": "Content snippet",
  "published_date": "2024-02-01" or null,
  "score": 0.92,
  "source_tier": "tier_1"  ← Explicitly tagged
}
```

**Example Results:**
- "NAIC Releases 2023 Market Share Data"
- "NAIC Announces 2024 Strategic Priorities"
- "Annual Report 2024 - Advancing Insurance Regulation"

**Execution Logged:**
- Input: Regulatory queries + domain filters
- Output: Number of Tier 1 sources found
- Details: Domain filter list, query results breakdown

**Visual Elements for Animation:**
- Government building icons
- "Searching regulatory sources..." text
- Domain filter badges appearing (NAIC, FBI, etc.)
- Tier 1 quality badge/seal
- Results counter with quality indicator
- Sample regulatory document titles

---

### 🎓 STEP 4: Search Academic Sources

**Duration:** ~5-7 seconds
**Type:** Web search with academic domain filtering
**Tool Used:** Tavily Search (Advanced + Academic Domains)

**What Happens:**
1. Takes academic queries from Step 1
2. Applies academic domain filtering
3. Executes each query via Tavily API (2 calls)
4. Tags all results as Tier 1
5. Formats and collects results

**API Configuration:**
- **Search Depth:** advanced
- **Max Results Per Query:** 10
- **Domain Filtering:** YES - 7 academic domains
- **Source Tier:** tier_1 (explicitly tagged)

**Domain Filters:**
```python
[
  ".edu",                 # Educational institutions
  "scholar.google.com",   # Google Scholar
  "researchgate.net",     # ResearchGate platform
  "jstor.org",            # JSTOR digital library
  "springer.com",         # Springer publications
  "sciencedirect.com",    # ScienceDirect database
  "ieee.org"              # IEEE publications
]
```

**Why Fewer Queries?**
- Academic sources are more targeted
- Higher quality per result
- 1-2 queries sufficient for comprehensive coverage

**Result Format:**
```json
{
  "title": "Research paper or study title",
  "url": "https://researchgate.net/...",
  "content": "Abstract or summary",
  "published_date": "2023-09-15" or null,
  "score": 0.88,
  "source_tier": "tier_1"  ← Explicitly tagged
}
```

**Example Results:**
- "Analyzing how data analytics is used in detecting fraud"
- "InsurTech: Digital technologies in insurance - Springer"
- "Deep Learning in Financial Fraud Detection: Innovations"

**Execution Logged:**
- Input: Academic queries + domain filters
- Output: Number of Tier 1 sources found
- Details: Domain filter list (7 domains), query results

**Visual Elements for Animation:**
- University/graduation cap icons
- "Searching academic sources..." text
- Academic platform logos (ResearchGate, Springer, etc.)
- Research paper icons
- Tier 1 quality badge
- Results counter with academic indicator

---

### 🔬 STEP 5: Extract Key Findings

**Duration:** ~5-7 seconds
**Type:** LLM-based analysis and extraction
**Tool Used:** Anthropic Claude API

**What Happens:**
1. Combines all sources from Steps 2-4 (typically 70-80 sources)
2. Calculates source tier breakdown (% Tier 1, 2, 3)
3. Sorts sources by relevance score
4. Sends top 50 sources to Claude for analysis
5. Claude extracts structured fraud trends and regulatory findings
6. Returns JSON with classifications

**Why Top 50 Sources?**
- Token limit management
- Highest quality results prioritized
- Sufficient for comprehensive analysis

**LLM Configuration:**
- **Model:** claude-3-haiku-20240307
- **Temperature:** 0.4 (moderate for creative extraction)
- **Input:** Source titles, URLs, content snippets (500 chars each)

**System Prompt Focus:**
- Expert insurance fraud analyst persona
- Extract structured data with domain-specific attributes
- Strict classification requirements

**Classification Requirements:**
```python
# Fraud Categories (14 types)
synthetic_identity, staged_accident, exaggerated_claim, repair_fraud,
phantom_vehicle, bodily_injury_fraud, property_fraud, health_fraud,
workers_comp_fraud, organized_crime, provider_fraud, premium_fraud,
digital_fraud, cyber_fraud

# Severity Levels
low, medium, high, critical

# Detection Difficulty
easy, moderate, hard, very_hard
```

**Source Tier Calculation:**
```python
tier_1_percentage = (tier_1_count / total_sources) * 100
tier_2_percentage = (tier_2_count / total_sources) * 100
tier_3_percentage = (tier_3_count / total_sources) * 100
```

**Output Structure:**
```json
{
  "trends": [
    {
      "name": "Fraud trend name",
      "category": "fraud_category",
      "description": "2-3 sentence description",
      "severity": "high",
      "detection_difficulty": "hard",
      "geographic_scope": ["California", "New York"],
      "affected_lines": ["auto", "health"],
      "estimated_impact": "Financial impact description"
    }
  ],
  "regulatory_findings": [
    {
      "title": "Regulatory finding title",
      "issuing_agency": "NAIC",
      "date_range": "2023",
      "description": "Description of finding",
      "severity": "medium",
      "affected_regions": ["nationwide"]
    }
  ],
  "source_tier_breakdown": {
    "tier_1_count": 52,
    "tier_2_count": 22,
    "tier_3_count": 6,
    "tier_1_percentage": 65.0,
    "tier_2_percentage": 27.5,
    "tier_3_percentage": 7.5,
    "total_sources": 80
  }
}
```

**Execution Logged:**
- Input: Total sources analyzed, tier breakdown
- Output: Number of trends and regulatory findings extracted
- Details: Sources sent to LLM, LLM model, temperature, full findings

**Visual Elements for Animation:**
- Claude AI analyzing icon
- "Analyzing 80 sources..." text
- Source tier pie chart appearing
- Trend extraction progress
- Trend cards appearing one by one with:
  - Trend name
  - Severity indicator (color-coded)
  - Detection difficulty meter
  - Geographic map highlights
- Regulatory findings appearing separately

---

### 📊 STEP 6: Synthesize Report

**Duration:** ~3-4 seconds
**Type:** LLM-based synthesis and report generation
**Tool Used:** Anthropic Claude API

**What Happens:**
1. Takes extracted findings from Step 5
2. Calculates confidence level based on source quality
3. Sends findings to Claude for synthesis
4. Claude generates executive summary and recommendations
5. Adds regulatory disclaimer
6. Returns complete report

**Confidence Level Calculation:**
```python
if (total_sources >= 20 AND tier_1_percentage >= 30%):
    confidence = "high"
elif (total_sources >= 10 AND tier_1_percentage >= 20%):
    confidence = "medium"
else:
    confidence = "low"
```

**LLM Configuration:**
- **Model:** claude-3-haiku-20240307
- **Temperature:** 0.5 (balanced for synthesis)
- **Input:** Trends, regulatory findings, source breakdown, original topic

**System Prompt Focus:**
- Expert insurance fraud consultant persona
- Executive briefing style
- Actionable recommendations prioritized by impact

**Output Structure:**
```json
{
  "executive_summary": "2-3 paragraphs covering key trends, business impact, overall assessment",
  "recommendations": [
    "5-7 specific, actionable recommendations",
    "Prioritized by potential business impact"
  ],
  "confidence_level": "high",
  "data_freshness": "2023-2024",
  "regulatory_disclaimer": "Standard disclaimer text"
}
```

**Recommendations Criteria:**
- Specific and implementable (not generic)
- 5-7 items (per constants)
- Prioritized by business impact
- Actionable with clear next steps

**Execution Logged:**
- Input: Trends count, regulatory findings count, confidence level
- Output: Summary generated, recommendations count
- Details: Confidence calculation basis, LLM model, temperature

**Visual Elements for Animation:**
- Document/report icon
- "Synthesizing final report..." text
- Confidence level meter filling up
- Executive summary typing out (typewriter effect)
- Recommendations list building
- Quality badges (HIGH confidence, 2023-2024 data)
- Disclaimer banner appearing

---

### 💾 OUTPUT GENERATION: Create JSON File

**Duration:** ~0.1 seconds
**Type:** File I/O with validation
**Tool Used:** Pydantic validation + Python file I/O

**What Happens:**
1. Generates UUID for case study ID
2. Creates ISO 8601 timestamps
3. Builds title from input topic
4. Converts all data to Pydantic models (validation)
5. Creates `CaseStudy` model with all components
6. Sanitizes execution trace (removes API keys)
7. Writes formatted JSON to output directory
8. Returns file path

**Security Sanitization:**
```python
# Removes from execution trace:
- api_key
- anthropic_api_key
- tavily_api_key
- Any strings matching key patterns
```

**Output File Structure:**
```json
{
  "id": "uuid-v4",
  "agent_slug": "fraud-trends",
  "title": "User topic - Fraud Trends Analysis",
  "subtitle": "Research findings for [regions] ([time_range])",
  "input_parameters": { /* FraudTrendsInput */ },
  "output_result": { /* FraudTrendsOutput with trends, findings, etc. */ },
  "execution_trace": [ /* All 6 ExecutionStep objects */ ],
  "display": true,
  "featured": false,
  "display_order": null,
  "created_at": "2026-02-10T00:11:03.650533Z",
  "updated_at": "2026-02-10T00:11:03.650533Z"
}
```

**File Details:**
- **Directory:** `agents/fraud-trends/output/`
- **Filename:** `case_study_{timestamp}.json`
- **Format:** Pretty-printed with 2-space indentation
- **Size:** Typically 180-200 KB
- **Encoding:** UTF-8

**Validation Process:**
1. FraudTrendsInput → validates input parameters
2. FraudTrend → validates each trend (14 possible categories)
3. RegulatoryFinding → validates each finding
4. SourceTierBreakdown → validates tier percentages
5. FraudTrendsOutput → validates complete output
6. CaseStudy → validates entire case study structure

**Execution Logged:**
- File path
- Case study ID
- Title
- File size in bytes

**Visual Elements for Animation:**
- Validation checkmarks appearing
- "Generating case study..." text
- Folder icon with "output/" label
- File icon appearing with filename
- File size meter
- Success confirmation
- JSON structure preview

---

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INPUT                                  │
│  • Topic, Regions, Time Range, Focus Areas                          │
│  • Pydantic validation                                              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 1: Plan Research                            │
│  Tool: Anthropic Claude API                                         │
│  Input: User parameters                                             │
│  Output: 8 search queries (3 industry, 3 regulatory, 2 academic)    │
│  Duration: ~1.7s                                                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                STEP 2: Search Industry Sources                       │
│  Tool: Tavily Search API (3 calls)                                  │
│  Input: 3 industry queries                                          │
│  Output: ~30 industry sources                                       │
│  Duration: ~6.7s                                                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│               STEP 3: Search Regulatory Sources                      │
│  Tool: Tavily Search API (3 calls) + Domain Filters                 │
│  Input: 3 regulatory queries + 6 domains                            │
│  Output: ~30 Tier 1 regulatory sources                              │
│  Duration: ~8.7s                                                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                STEP 4: Search Academic Sources                       │
│  Tool: Tavily Search API (2 calls) + Domain Filters                 │
│  Input: 2 academic queries + 7 domains                              │
│  Output: ~20 Tier 1 academic sources                                │
│  Duration: ~6.8s                                                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 STEP 5: Extract Key Findings                         │
│  Tool: Anthropic Claude API                                         │
│  Input: 80 total sources (top 50 sent to LLM)                       │
│  Output: 3-7 fraud trends + 0-5 regulatory findings                 │
│  Duration: ~6.2s                                                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  STEP 6: Synthesize Report                           │
│  Tool: Anthropic Claude API                                         │
│  Input: Extracted trends + findings                                 │
│  Output: Executive summary + 5-7 recommendations                     │
│  Duration: ~3.5s                                                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   JSON OUTPUT GENERATION                             │
│  Tool: Pydantic validation + File I/O                                │
│  Input: All workflow data                                           │
│  Output: Validated JSON file (~190KB)                               │
│  Duration: ~0.1s                                                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
                        ✅ COMPLETE
```

---

## API Usage Summary

### Anthropic Claude API
- **Total Calls:** 3
- **Step 1:** Research planning (temperature 0.3)
- **Step 5:** Findings extraction (temperature 0.4)
- **Step 6:** Report synthesis (temperature 0.5)
- **Model:** claude-3-haiku-20240307

### Tavily Search API
- **Total Calls:** 8
- **Step 2:** 3 calls (industry queries)
- **Step 3:** 3 calls (regulatory queries with domain filters)
- **Step 4:** 2 calls (academic queries with domain filters)
- **Search Depth:** advanced (all calls)
- **Results Per Query:** 10 max

---

## Key Metrics for Animation

- **Total Execution Time:** 30-35 seconds
- **API Calls:** 11 total (3 Claude + 8 Tavily)
- **Sources Collected:** 70-80 on average
- **Tier 1 Sources:** Typically 60-70% of total
- **Trends Extracted:** 3-7 per case study
- **Recommendations:** 5-7 per report
- **Confidence Level:** Usually HIGH (with good sources)
- **Output File Size:** 180-200 KB

---

## Animation Sequence Recommendations

1. **Opening Scene (0-2s):**
   - User types research topic
   - Input fields populate
   - "Start Research" button clicked

2. **Step 1 Animation (2-4s):**
   - Claude AI logo appears
   - "Planning research strategy..."
   - Query categories expand
   - 8 queries appear in list

3. **Steps 2-4 Animation (4-25s):**
   - Tavily search icon
   - Progress bars for each query
   - Results counter incrementing
   - Source cards appearing
   - Domain filter badges (Steps 3-4)
   - Tier 1 quality seals

4. **Step 5 Animation (25-31s):**
   - Source pile compacting
   - Claude analyzing animation
   - Pie chart showing source tiers
   - Trends extracting one by one
   - Severity/difficulty indicators

5. **Step 6 Animation (31-35s):**
   - Document forming
   - Summary text typing out
   - Recommendations list building
   - Confidence meter rising

6. **Output Animation (35-36s):**
   - File icon appearing
   - JSON structure preview
   - Success checkmark
   - File download indicator

---

## Error Handling & Edge Cases

### Graceful Degradation
- If individual Tavily queries fail → Continue with successful ones
- If no sources found → Log warning, continue workflow
- If LLM returns invalid JSON → Parse error, retry with modified prompt

### Critical Failures (Workflow Stops)
- Missing API keys → Exit code 1
- Step 1 fails → Cannot proceed without queries
- Step 5 fails → Cannot generate report without findings
- All searches fail → No data to analyze

### Warnings Logged
- Low source count (<10) → Confidence reduced to LOW
- No regulatory sources → Missing Tier 1 data
- API rate limits → Retry with backoff

---

## JSON Structure for Website Display

The generated JSON file is designed for direct import to the database and includes:

1. **Metadata:** ID, agent_slug, title, subtitle, timestamps
2. **Input Parameters:** Complete user input for reproducibility
3. **Output Result:** All trends, findings, recommendations, summary
4. **Execution Trace:** Step-by-step process log with timing
5. **Display Flags:** `display: true`, `featured: false`

This structure allows the website to:
- Show step-by-step execution animation
- Display source quality metrics
- Render trends with severity/difficulty indicators
- Show execution timing breakdown
- Provide "replay" functionality

---

## Next Steps for Animation

1. **Access the execution_trace array** in any generated JSON file
2. **Parse each step** to show:
   - Step number and name
   - Duration and timestamp
   - Input/output summaries
   - Tool/API used
   - Detailed metrics
3. **Visualize the flow** using the data structure above
4. **Add smooth transitions** between steps
5. **Show real metrics** from actual case study executions

The execution trace in every case study JSON provides complete visibility into the agent's decision-making process!
