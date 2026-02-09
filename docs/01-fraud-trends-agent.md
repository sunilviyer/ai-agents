# Agent 1: Fraud Trends Investigator

## 1. IDENTITY

| Field | Value |
|-------|-------|
| **Name** | Fraud Trends Investigator |
| **Slug** | `fraud-trends` |
| **Tagline** | "Deep research on global insurance fraud patterns" |
| **Type** | Research & Synthesis Agent |
| **Icon** | 🔍 |
| **Badge Color** | Blue |

---

## 2. CONCEPT

### What It Does
This agent researches a given insurance fraud topic by searching multiple authoritative sources, extracting key findings, and synthesizing them into a structured report with trends, statistics, and citations.

### Why It's Unique (Agent Archetype)
**Research & Synthesis** — The agent's core capability is:
- Searching broadly across multiple source types
- Extracting and categorizing information
- Combining disparate findings into a coherent narrative
- Providing citations and evidence

### Value Proposition
"Give me a topic, and I'll research it deeply across industry publications, regulatory reports, and academic sources—then deliver a comprehensive brief."

### Demo Approach
**Pre-run only.** You execute the agent on 5 topics, save the full execution trace and results to your database. Visitors browse and explore these saved case studies.

---

## 3. INPUT SCHEMA

```typescript
interface FraudTrendsInput {
  // Primary topic to research
  topic: string;                    // e.g., "Auto Insurance Fraud"
  
  // Geographic scope
  regions: string[];                // e.g., ["Canada", "US", "UK"]
  
  // Time period focus
  time_range: string;               // e.g., "2024-2025"
  
  // Specific areas to emphasize (optional)
  focus_areas?: string[];           // e.g., ["staged accidents", "digital fraud"]
  
  // Source preferences (optional)
  source_types?: string[];          // e.g., ["industry", "regulatory", "academic"]
}
```

### Example Input
```json
{
  "topic": "Auto Insurance Fraud",
  "regions": ["Canada", "US"],
  "time_range": "2024-2025",
  "focus_areas": ["staged collisions", "phantom passengers", "tow truck schemes"],
  "source_types": ["industry", "regulatory", "news"]
}
```

---

## 4. PROCESSING STEPS

| Step # | Name | Type | Description | Example Output |
|--------|------|------|-------------|----------------|
| 1 | **Plan Research** | `planning` | Break topic into sub-queries; identify source categories | 5 sub-queries, 3 source categories |
| 2 | **Search Industry Sources** | `search` | Query insurance industry publications (NICB, IBC, CAIF, III) | 12 relevant articles found |
| 3 | **Search Regulatory Reports** | `search` | Query government and regulator publications | 4 reports found |
| 4 | **Search News & Academic** | `search` | Query news archives and Google Scholar | 8 articles, 3 papers found |
| 5 | **Extract Key Findings** | `analysis` | Pull statistics, named trends, expert quotes from sources | 15 findings extracted |
| 6 | **Synthesize Report** | `synthesis` | Combine findings into structured narrative with categories | Final report generated |

### Step Details

**Step 1: Plan Research**
```
Input: Topic + parameters
Process: 
  - Identify 3-5 sub-queries based on topic and focus areas
  - Map which source types are relevant
  - Determine search priority order
Output: Research plan with queries and source strategy
```

**Step 2-4: Search Phases**
```
Input: Sub-queries from Step 1
Process:
  - Execute searches against appropriate sources
  - Filter for relevance and recency
  - Capture title, URL, snippet, date for each result
Output: List of relevant sources with metadata
```

**Step 5: Extract Key Findings**
```
Input: All sources from Steps 2-4
Process:
  - Read/summarize each source
  - Extract specific statistics
  - Identify named fraud schemes/trends
  - Capture expert quotes
  - Note regional variations
Output: Structured list of findings with source attribution
```

**Step 6: Synthesize Report**
```
Input: All findings from Step 5
Process:
  - Group findings by theme/category
  - Identify patterns across sources
  - Resolve contradictions
  - Rank trends by prevalence/impact
  - Write executive summary
  - Format final report
Output: Complete research report
```

---

## 5. OUTPUT SCHEMA

```typescript
interface FraudTrendsOutput {
  // High-level summary (2-3 paragraphs)
  executive_summary: string;
  
  // Categorized trends
  trends: FraudTrend[];
  
  // Standalone statistics
  key_statistics: KeyStatistic[];
  
  // All sources used
  sources: Source[];
  
  // Metadata
  generated_at: string;             // ISO timestamp
  research_parameters: FraudTrendsInput;
}

interface FraudTrend {
  name: string;                     // e.g., "Staged Collision Rings"
  category: string;                 // e.g., "Organized Fraud"
  description: string;              // 2-3 sentence explanation
  statistics: string[];             // Related stats
  regions_affected: string[];       // Where this trend is observed
  severity: 'high' | 'medium' | 'low';
  trend_direction: 'increasing' | 'stable' | 'decreasing';
  sources: string[];                // Source IDs that support this
}

interface KeyStatistic {
  value: string;                    // e.g., "$8.6 billion"
  context: string;                  // e.g., "Annual cost of auto fraud in US"
  year: string;                     // e.g., "2024"
  source: string;                   // Source ID
}

interface Source {
  id: string;                       // Unique identifier
  title: string;
  url: string;
  source_type: 'industry' | 'regulatory' | 'academic' | 'news';
  publication: string;              // e.g., "Insurance Bureau of Canada"
  date: string;
  relevance_note: string;           // Why this source was useful
}
```

### Example Output (Abbreviated)
```json
{
  "executive_summary": "Auto insurance fraud continues to evolve in 2024-2025, with organized staged collision rings representing the most significant threat across North America. Digital fraud vectors, including synthetic identity schemes, are growing rapidly. Industry estimates suggest annual losses exceeding $8 billion in the US alone, with Canadian losses proportionally significant...",
  
  "trends": [
    {
      "name": "Staged Collision Rings",
      "category": "Organized Fraud",
      "description": "Coordinated networks staging deliberate accidents with multiple participants playing pre-assigned roles (driver, passengers, witnesses). Often involves recruited vulnerable individuals.",
      "statistics": [
        "42% increase in suspected staged accidents in Ontario (2023-2024)",
        "Average staged claim value: $47,000"
      ],
      "regions_affected": ["Ontario", "California", "Florida"],
      "severity": "high",
      "trend_direction": "increasing",
      "sources": ["src_001", "src_004", "src_007"]
    }
  ],
  
  "key_statistics": [
    {
      "value": "$8.6 billion",
      "context": "Estimated annual cost of auto insurance fraud in the United States",
      "year": "2024",
      "source": "src_002"
    }
  ],
  
  "sources": [
    {
      "id": "src_001",
      "title": "2024 Auto Insurance Fraud Report",
      "url": "https://example.com/report",
      "source_type": "industry",
      "publication": "National Insurance Crime Bureau",
      "date": "2024-06",
      "relevance_note": "Comprehensive annual fraud statistics and trend analysis"
    }
  ],
  
  "generated_at": "2025-02-04T10:30:00Z",
  "research_parameters": { ... }
}
```

---

## 6. DATA REQUIREMENTS

### Database Tables

**Table: `case_studies`** (shared across all agents)
```sql
CREATE TABLE case_studies (
  id UUID PRIMARY KEY,
  agent_slug VARCHAR(50) NOT NULL,        -- 'fraud-trends'
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  input_parameters JSONB NOT NULL,        -- FraudTrendsInput
  output_result JSONB NOT NULL,           -- FraudTrendsOutput
  execution_trace JSONB NOT NULL,         -- Array of ExecutionStep
  featured BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Table: `execution_steps`** (shared across all agents)
```sql
CREATE TABLE execution_steps (
  id UUID PRIMARY KEY,
  case_study_id UUID REFERENCES case_studies(id),
  step_number INTEGER NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  step_type VARCHAR(50) NOT NULL,         -- 'planning', 'search', 'analysis', 'synthesis'
  input_summary TEXT,
  output_summary TEXT,
  details JSONB,                          -- Full details for expansion
  duration_ms INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### Execution Step Detail Schema
```typescript
interface ExecutionStepDetails {
  // For search steps
  queries_executed?: string[];
  sources_found?: number;
  sources_kept?: number;
  sample_results?: Array<{title: string; url: string; snippet: string}>;
  
  // For analysis steps
  findings_extracted?: number;
  sample_findings?: string[];
  
  // For synthesis steps
  trends_identified?: number;
  categories_created?: string[];
}
```

---

## 7. CASE STUDIES

### Pre-Run Topics (5)

| # | Title | Subtitle | Input Parameters |
|---|-------|----------|------------------|
| 1 | **Auto Insurance Fraud 2024-2025** | Staged accidents, phantom passengers, and emerging schemes | `{"topic": "Auto Insurance Fraud", "regions": ["Canada", "US"], "time_range": "2024-2025", "focus_areas": ["staged collisions", "phantom passengers", "paper mills"]}` |
| 2 | **Property Fraud After Climate Events** | How natural disasters create fraud opportunities | `{"topic": "Property Insurance Fraud", "regions": ["US", "Canada"], "time_range": "2023-2025", "focus_areas": ["disaster fraud", "inflated claims", "contractor schemes"]}` |
| 3 | **Digital & Synthetic Identity Fraud** | The rise of AI-enabled insurance fraud | `{"topic": "Digital Insurance Fraud", "regions": ["North America", "UK"], "time_range": "2024-2025", "focus_areas": ["synthetic identity", "deepfakes", "application fraud"]}` |
| 4 | **Organized Fraud Rings** | Networks, tactics, and prosecution trends | `{"topic": "Organized Insurance Fraud", "regions": ["Canada", "US"], "time_range": "2023-2025", "focus_areas": ["fraud rings", "cross-border networks", "prosecution rates"]}` |
| 5 | **Technology in Fraud Detection** | AI/ML adoption and predictive analytics | `{"topic": "Fraud Detection Technology", "regions": ["Global"], "time_range": "2024-2025", "focus_areas": ["AI detection", "predictive analytics", "automation"]}` |

---

## 8. UI COMPONENTS

### Page Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔍 Fraud Trends Investigator                                │ │
│ │ "Deep research on global insurance fraud patterns"          │ │
│ │ [Research & Synthesis Agent]                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ HOW IT WORKS                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Plan] → [Search Industry] → [Search Regulatory] →          │ │
│ │ [Search News] → [Extract] → [Synthesize]                    │ │
│ │                                                             │ │
│ │ This agent researches fraud topics across multiple          │ │
│ │ authoritative sources and synthesizes findings into         │ │
│ │ a comprehensive report with statistics and citations.       │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ CASE STUDIES                                                    │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────┐│
│ │ Auto      │ │ Property  │ │ Digital   │ │ Organized │ │ Tech││
│ │ Fraud     │ │ & Climate │ │ Identity  │ │ Rings     │ │     ││
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └─────┘│
├─────────────────────────────────────────────────────────────────┤
│ SELECTED CASE STUDY                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Input Parameters                                            │ │
│ │ • Topic: Auto Insurance Fraud                               │ │
│ │ • Regions: Canada, US                                       │ │
│ │ • Focus: staged collisions, phantom passengers              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Execution Trace                                             │ │
│ │ ✓ Step 1: Plan Research ..................... 1.2s         │ │
│ │ ✓ Step 2: Search Industry Sources ........... 8.4s         │ │
│ │   └ [Expand to see queries and results]                     │ │
│ │ ✓ Step 3: Search Regulatory Reports ......... 5.2s         │ │
│ │ ✓ Step 4: Search News & Academic ............ 6.1s         │ │
│ │ ✓ Step 5: Extract Key Findings .............. 3.3s         │ │
│ │ ✓ Step 6: Synthesize Report ................. 4.8s         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Research Report                                             │ │
│ │                                                             │ │
│ │ EXECUTIVE SUMMARY                                           │ │
│ │ [Summary text...]                                           │ │
│ │                                                             │ │
│ │ KEY TRENDS                                                  │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ 🔴 Staged Collision Rings              [High] [Rising]  │ │ │
│ │ │ Description text...                                     │ │ │
│ │ │ • 42% increase in Ontario                               │ │ │
│ │ │ • Average claim: $47,000                                │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │ [More trend cards...]                                       │ │
│ │                                                             │ │
│ │ KEY STATISTICS                                              │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐                     │ │
│ │ │ $8.6B    │ │ 42%      │ │ 15,000   │                     │ │
│ │ │ Annual   │ │ Increase │ │ Arrests  │                     │ │
│ │ │ US Cost  │ │ in Staged│ │ 2024     │                     │ │
│ │ └──────────┘ └──────────┘ └──────────┘                     │ │
│ │                                                             │ │
│ │ SOURCES                                                     │ │
│ │ [Collapsible source list with links]                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Components Needed

| Component | Purpose |
|-----------|---------|
| `AgentHeader` | Icon, name, tagline, type badge |
| `HowItWorks` | Animated step diagram with descriptions |
| `CaseStudyGrid` | Grid of clickable case study cards |
| `CaseStudyCard` | Individual case study preview |
| `InputParameters` | Display formatted input JSON |
| `ExecutionTrace` | List of steps with expand/collapse |
| `ExecutionStep` | Individual step with timing and details |
| `ResearchReport` | Main output display component |
| `TrendCard` | Individual trend with severity/direction badges |
| `StatisticCard` | Key statistic with value and context |
| `SourceList` | Collapsible list of sources with links |

---

## 9. TECHNICAL NOTES

### Agent Implementation
- **Framework:** LangChain or LangGraph (Python)
- **LLM:** Claude API (claude-sonnet-4-20250514 recommended)
- **Search:** Tavily API or SerpAPI for web search
- **Execution:** Run locally or via scheduled job

### Data Flow
```
1. You define input parameters
2. Run agent script locally
3. Agent executes all steps, logging each
4. Final output + trace saved to JSON
5. Import JSON to PostgreSQL
6. Frontend reads from database
```

### Key Considerations
- Cache search results to avoid re-running identical queries
- Store raw search results in case you want to re-analyze
- Log timestamps for each step to show realistic execution times
- Include sample sources in step details for transparency

### Search Sources to Target
| Source | URL | Notes |
|--------|-----|-------|
| NICB | nicb.org | US National Insurance Crime Bureau |
| IBC | ibc.ca | Insurance Bureau of Canada |
| CAIF | caif-acfa.org | Canadian Association of Insurance Fraud |
| III | iii.org | Insurance Information Institute |
| FSRA | fsrao.ca | Ontario regulator |
| Industry journals | Various | Insurance Journal, Canadian Underwriter |

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
| Agent slug | kebab-case | `fraud-trends` |
| Component | PascalCase | `CaseStudyCard` |
| DB table | snake_case | `case_studies` |
| JSON field | snake_case | `input_parameters` |
| TS interface | PascalCase | `FraudTrendsInput` |

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
- [ ] Build agent script first (Python)
- [ ] Run on all 5 case study topics
- [ ] Export execution traces to JSON
- [ ] Build frontend components
- [ ] Import data to database
- [ ] Connect frontend to database
