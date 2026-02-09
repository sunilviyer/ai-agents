---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns']
inputDocuments:
  - /Volumes/External/AIAgents/_bmad-output/planning-artifacts/prd.md
  - /Volumes/External/AIAgents/docs/01-fraud-trends-agent.md
  - /Volumes/External/AIAgents/docs/ARCHITECTURE_REVIEW.md
  - /Volumes/External/AIAgents/docs/DATA_SOURCING_STRATEGY.md
  - /Volumes/External/AIAgents/_bmad-output/planning-artifacts/product-brief-AIAgents-2025-02-08.md
workflowType: 'architecture'
project_name: 'AIAgents'
user_name: 'Sunil'
date: '2025-02-09'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The project requires **54 functional requirements** organized into 7 capability areas:

1. **Agent Execution Capabilities (FR1-FR10):** Python agent must execute 6-step LangChain workflow (research planning, 3-phase web search via Tavily API, findings extraction, synthesis), generate JSON output matching TypeScript schema, log complete execution traces with timing/inputs/outputs, handle API failures gracefully

2. **Data Management Capabilities (FR11-FR18):** Import script must validate JSON against schema, insert to PostgreSQL universal schema (case_studies + execution_steps tables), use JSONB for agent-specific data, support querying by agent slug and case study relationships

3. **Output Quality & Compliance Capabilities (FR19-FR29):** Agent must classify fraud findings with domain-specific fields (fraud_type, severity, detection_difficulty, geographic_scope), separate regulatory findings, classify sources by tier (Tier 1: regulatory/academic, Tier 2: industry, Tier 3: news), include compliance disclaimers, provide confidence levels based on source quality

4. **API Access Capabilities (FR30-FR37):** REST API must return case studies with execution traces, provide structured error responses with machine-readable codes, validate agent slugs, return appropriate HTTP status codes (200/404/500), include metadata (count, trace inclusion status)

5. **Code Quality & Security Capabilities (FR38-FR44):** Zero linting errors (ESLint/pylint), immutable constants clearly marked (UPPER_CASE), comprehensive function comments, no secrets in git history, .env gitignored with .env.example, output sanitization validated

6. **Validation & Testing Capabilities (FR45-FR50):** JSON validation against TypeScript types, execution trace completeness verification, database import validation, API endpoint type structure testing, Gate 1 validation checklist execution

7. **Documentation Capabilities (FR51-FR54):** README with setup/API keys/usage, .env.example with placeholders, SECURITY_CHECKLIST.md for public repo validation, inline comments explaining domain-specific design decisions

**Non-Functional Requirements:**

Critical NFRs that will drive architectural decisions:

1. **Security (NFR-S1 to NFR-S5):**
   - Secret management: All credentials in .env (gitignored), git history scanned for leaked secrets
   - Output sanitization: Zero API keys in JSON outputs or database
   - Public repository safety: SECURITY_CHECKLIST.md 100% validated before making repo public
   - API security: Read-only database connections, no sensitive details in error responses

2. **Code Quality (NFR-CQ1 to NFR-CQ5):**
   - Linting: ESLint zero errors, Python pylint ≥9.0/10.0
   - Documentation: Every public function commented with purpose/params/returns
   - Naming: Descriptive names revealing intent, immutable constants in UPPER_CASE
   - Type safety: TypeScript strict mode, Python type hints throughout

3. **Reliability (NFR-R1 to NFR-R4):**
   - Agent execution: Graceful API failure handling, no crashes on invalid inputs
   - Database import: 100% success rate for valid JSON, clear field-level error feedback
   - Data integrity: Foreign key enforcement, JSONB structure preservation
   - API error handling: Proper HTTP status codes, structured error responses

4. **Performance (NFR-P1 to NFR-P3):**
   - Agent execution: Target 15-30 seconds per case study, ≤60 seconds acceptable
   - Database import: ≤10 seconds per case study
   - API response: ≤2 seconds for case study retrieval

5. **Integration (NFR-I1 to NFR-I4):**
   - Type consistency: Python Pydantic ↔ TypeScript ↔ Database schema exact alignment
   - Claude API: Rate limit handling, Sonnet model compatibility
   - Tavily API: Failure handling, correct result parsing
   - Database: PostgreSQL 14+ (Neon), environment-based configuration

**Scale & Complexity:**

- **Primary domain:** API Backend / Python Service (LangChain agents + PostgreSQL + Next.js API routes)
- **Complexity level:** High
  - Domain-specific requirements (insuretech with regulatory compliance)
  - Multi-agent architecture with universal schema validation
  - Strict 3-way type consistency enforcement
  - Public repository quality standards (production-grade code for portfolio)
  - Gate-based validation methodology (proof-of-concept with explicit GO/NO-GO decisions)

- **Estimated architectural components:**
  - **Python Agent Layer:** 1 agent implementation (Fraud Trends) as template for 4 more
  - **Database Layer:** Universal schema (2 tables: case_studies, execution_steps) with JSONB flexibility
  - **Import/ETL Layer:** Python scripts for JSON validation and database insertion
  - **API Layer:** Next.js API routes (REST endpoints for case study retrieval)
  - **Type Definition Layer:** Shared TypeScript types + Python Pydantic models
  - **Validation Layer:** JSON schema validation, security scanning, linting enforcement

### Technical Constraints & Dependencies

**Hard Constraints:**

1. **Universal Schema Immutability:** Database schema must be locked before implementation - if Fraud Trends + Stock Monitor both work without schema changes, pattern is validated for remaining 3 agents

2. **Type Consistency Enforcement:** Changes to Python Pydantic models must propagate to TypeScript types and database JSONB structure - any mismatch breaks the integration

3. **Public Repository Requirement:** Code must meet production standards (zero secrets, comprehensive comments, clean linting) from Day 1 - cannot refactor for quality later

4. **Pre-Run Economic Model:** Case studies must be generated once and stored - live execution would create unsustainable API costs for portfolio demonstration

5. **Insuretech Domain Accuracy:** Fraud taxonomy, source tier classification, and regulatory disclaimers must be correct - errors undermine portfolio credibility

**External Dependencies:**

- **Claude API (Anthropic):** LLM for research planning, findings extraction, report synthesis (Steps 1, 5, 6)
- **Tavily API:** Web search for industry, regulatory, academic sources (Steps 2-4)
- **PostgreSQL 14+ (Neon):** Hosted database with JSONB support
- **Vercel:** Deployment platform for Next.js API routes (serverless functions)

**Technology Constraints:**

- **Python 3.10+:** Required for LangChain and modern type hints
- **TypeScript strict mode:** Non-negotiable for type safety validation
- **PostgreSQL JSONB:** Required for universal schema flexibility across agent types

**Gate 1 Validation Constraint:**

- Fraud Trends agent must fully work (all 5 case studies generated, imported, queryable) before proceeding to Stock Monitor
- If Stock Monitor requires schema changes, universal pattern hypothesis is invalidated → pivot to flexible schema approach

### Cross-Cutting Concerns Identified

**1. Type Consistency Across Language Boundaries**

**Challenge:** Maintaining perfect alignment between Python Pydantic models, TypeScript types, and PostgreSQL JSONB schemas

**Architectural Impact:**
- Requires shared type definition source or validation layer
- JSON schema validation script needed to verify Python output matches TypeScript expectations
- Database query results must validate against TypeScript types before API responses

**2. Universal Schema Validation (Innovation Hypothesis)**

**Challenge:** Proving one database schema can handle 5 completely different agent types (research, detection, matching, enhancement, conversational) without modifications

**Architectural Impact:**
- JSONB flexibility is critical - must store agent-specific structures without predefined columns
- Execution steps table must handle diverse step types (planning, search, analysis, synthesis, filter, enrichment)
- Validation at Gate 1 determines whether to proceed or pivot architecture

**3. Security & Secret Management for Public Repository**

**Challenge:** Ensuring zero secrets leak into git history, outputs, or database while maintaining functionality

**Architectural Impact:**
- All credential management via .env files (gitignored)
- Output sanitization validation before JSON files committed
- API error responses must not expose sensitive paths or credentials
- SECURITY_CHECKLIST.md must be validated before making repository public

**4. Execution Transparency as Product Feature**

**Challenge:** Capturing complete execution traces (timing, inputs, outputs, LLM reasoning) for every agent step as primary portfolio differentiator

**Architectural Impact:**
- Execution logging must be integrated into agent workflow (not optional)
- Database schema must support detailed step storage with JSONB for step-specific details
- API responses must include execution traces by default
- Frontend must display traces as primary UI element

**5. Domain-Specific Output Schemas (Insuretech Complexity)**

**Challenge:** Fraud findings require specialized classification (fraud_type, severity, detection_difficulty, geographic_scope, source_tier_breakdown) beyond generic research outputs

**Architectural Impact:**
- Agent must implement source credibility classification during search phase
- LLM prompts must enforce domain-specific output structure
- Validation layer must verify domain fields are populated correctly
- Constants defined for fraud taxonomies (FRAUD_TYPES, SEVERITY_LEVELS, DETECTION_DIFFICULTY)

**6. Replicability & Template Pattern Validation**

**Challenge:** Fraud Trends must serve as template for 4 more agents - pattern must be clear enough to replicate with <25% development time per subsequent agent

**Architectural Impact:**
- Code structure must be modular and clearly documented
- Agent-specific vs. universal code must be cleanly separated
- Immutable constants must be clearly marked to prevent accidental changes
- Gate 1.5 informal validation: measure Stock Monitor development time vs. Fraud Trends

**7. Economic Sustainability (Pre-Run Strategy)**

**Challenge:** Portfolio must be demonstrable without ongoing API costs - requires pre-run case study generation with complete transparency

**Architectural Impact:**
- Agent execution happens locally/CI, not in production
- Database stores pre-generated case studies
- API serves read-only data (no live agent execution)
- One agent (Gita Guide) will have live chat to prove real-time capability without undermining economic model

## Starter Template Evaluation

### Primary Technology Domain

**API Backend / Python Service + Next.js API Routes** based on project requirements analysis

This project consists of two distinct technical layers with different initialization needs:

1. **Python Agent Layer:** Custom LangChain-based agents (standalone scripts, not a traditional web framework)
2. **Next.js API Layer:** TypeScript-based API routes serving pre-generated case studies

### Starter Options Considered

**Python Agent Layer Options:**

- **Standard LangChain Project Structure:** Recommended structure from LangChain documentation (2025)
  - Custom project structure (no CLI generator available for LangChain agents)
  - Manual setup with agent.py, utils/, requirements.txt, .env, langgraph.json
  - Best for production agents with stateful workflow (LangGraph pattern)

- **Verdict:** No starter template - manual project structure following LangChain best practices

**Next.js API/Frontend Layer Options:**

- **create-next-app (Official Next.js CLI):** Latest stable Next.js 15 with App Router
  - TypeScript, TailwindCSS, ESLint built-in
  - App Router architecture (recommended for 2025)
  - Turbopack for fast development builds
  - Zero configuration for TypeScript strict mode

- **Verdict:** Use official Next.js starter - most maintained, best practices for 2025

### Selected Approach: Two-Layer Initialization

**Layer 1: Python Agent Layer (Custom Structure)**

**Rationale for Manual Setup:**
- LangChain agents don't have standardized starters - custom workflows require custom structures
- Following LangGraph 2025 best practices for production agents
- Allows precise control over agent architecture and dependencies

**Manual Project Structure:**

```
agents/fraud-trends/
├── agent.py                 # Main agent execution script
├── utils/
│   ├── __init__.py
│   ├── models.py           # Pydantic models for input/output
│   ├── steps.py            # Individual step functions
│   └── constants.py        # Immutable constants (AGENT_SLUG, STEP_TYPES)
├── output/                  # Generated JSON case studies
├── .env                     # API keys (gitignored)
├── .env.example             # Template with placeholders
├── requirements.txt         # Python dependencies
└── README.md                # Agent-specific documentation
```

**Dependencies (requirements.txt):**
```
langchain>=0.3.0
langchain-anthropic>=0.2.0
tavily-python>=0.5.0
pydantic>=2.5.0
python-dotenv>=1.0.0
```

**Layer 2: Next.js API/Frontend Layer (Official Starter)**

**Rationale for Selection:**
- Official `create-next-app` provides best practices for Next.js 15
- TypeScript strict mode, TailwindCSS, ESLint configured out-of-the-box
- App Router architecture aligns with project requirements
- Vercel deployment optimization built-in
- Most actively maintained Next.js starter (official support)

**Initialization Command:**

```bash
npx create-next-app@latest website --typescript --tailwind --eslint --app --turbopack --import-alias "@/*"
```

This command creates a Next.js 15 project with:
- **TypeScript:** Strict mode enabled by default
- **TailwindCSS:** Latest version (v4 compatible)
- **ESLint:** Pre-configured with Next.js best practices
- **App Router:** Recommended architecture for API routes
- **Turbopack:** Fast development builds
- **Import alias:** `@/*` for cleaner imports

### Architectural Decisions Provided by Next.js Starter

**Language & Runtime:**
- TypeScript with strict mode enabled (tsconfig.json pre-configured)
- Node.js 20.9+ runtime
- React 18 with Server Components support

**Styling Solution:**
- TailwindCSS with PostCSS configuration
- CSS modules support for component-specific styles
- Automatic CSS optimization and tree-shaking

**Build Tooling:**
- Turbopack for development (fast HMR)
- Webpack for production builds (optimized bundles)
- Automatic code splitting and lazy loading
- Image optimization built-in

**Testing Framework:**
- No testing framework included by default (intentional - allows choice)
- Recommended: Add Jest + React Testing Library separately
- TypeScript types ensure compile-time safety

**Code Organization:**
- App Router structure: `app/` directory for routes
- API routes: `app/api/` directory
- Shared types: `lib/types.ts` (custom addition needed)
- Components: `components/` directory (custom addition needed)

**Development Experience:**
- Hot Module Replacement (HMR) with fast refresh
- TypeScript IntelliSense and type checking
- ESLint warnings in development
- Automatic environment variable loading (.env.local)

**Project Structure (After Initialization):**
```
website/
├── app/
│   ├── api/                # API routes directory
│   │   └── agents/
│   │       └── [slug]/
│   │           └── case-studies/
│   │               └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── public/
├── lib/
│   └── types.ts           # Shared TypeScript types (custom)
├── .env.local             # Environment variables (gitignored)
├── .env.example           # Template (custom addition)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json          # TypeScript strict mode enabled
├── package.json
└── README.md
```

**Additional Configuration Needed:**

1. **Environment Variables (.env.local):**
   ```
   DATABASE_URL=postgresql://...
   ```

2. **Database Client:**
   ```bash
   npm install pg
   npm install -D @types/pg
   ```

3. **Shared Types (lib/types.ts):**
   - Import Python Pydantic model definitions as TypeScript types
   - Ensure 3-way type consistency (Python ↔ TypeScript ↔ Database)

**Note:**
- Python agent layer initialization is manual (no CLI command)
- Next.js initialization using `create-next-app` should be first implementation story for website layer
- Database schema initialization happens separately via SQL scripts

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Database schema locked and immutable (Gate 1 constraint)
2. Type consistency strategy across Python/TypeScript/Database
3. Database connection layer for API routes
4. Environment configuration for secrets management

**Important Decisions (Shape Architecture):**
1. API error response format standardization
2. State management strategy for frontend
3. Deployment workflow for MVP validation

**Deferred Decisions (Post-MVP):**
1. CI/CD pipeline automation (manual deployment for Gate 1)
2. Advanced error recovery and retry logic
3. Caching and performance optimization
4. Testing framework selection

### Data Architecture

**Decision 1.1: Database Schema (LOCKED - Immutable after Gate 1)**

**Final Schema Definition:**

```sql
-- Universal schema for all 5 agent types
CREATE TABLE case_studies (
  id UUID PRIMARY KEY,
  agent_slug VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  input_parameters JSONB NOT NULL,        -- Agent-specific input schema
  output_result JSONB NOT NULL,           -- Agent-specific output schema
  execution_trace JSONB NOT NULL,         -- Array of execution steps
  display BOOLEAN NOT NULL DEFAULT TRUE,  -- Control visibility in portfolio
  featured BOOLEAN DEFAULT FALSE,         -- Highlight on landing page
  display_order INTEGER,                  -- Manual ordering for display
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE execution_steps (
  id UUID PRIMARY KEY,
  case_study_id UUID REFERENCES case_studies(id),
  step_number INTEGER NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  step_type VARCHAR(50) NOT NULL,        -- 'planning', 'search', 'analysis', 'synthesis', etc.
  input_summary TEXT,
  output_summary TEXT,
  details JSONB,                          -- Step-specific expandable details
  duration_ms INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_case_studies_agent_slug ON case_studies(agent_slug);
CREATE INDEX idx_case_studies_display ON case_studies(display) WHERE display = TRUE;
CREATE INDEX idx_execution_steps_case_study_id ON execution_steps(case_study_id);
```

**Rationale:**
- **JSONB flexibility:** Allows agent-specific structures without schema changes
- **display column:** Control which case studies appear publicly without deletion
- **featured flag:** Separate from display (case study can be visible but not featured)
- **Universal design:** Must handle Fraud Trends, Stock Monitor, House Finder, Article Editor, Gita Guide without modifications
- **Gate 1 validation:** If Fraud Trends + Stock Monitor both work with this schema, pattern is validated

**Affects:** All agents, database import script, API queries, frontend display logic

**Decision 1.2: Database Connection Layer**

**Selected Technology:** `pg` (node-postgres) - Raw SQL client

**Version:** Latest stable (verified via npm)

**Rationale:**
- Read-only API queries in MVP (no complex mutations)
- Simple queries: `SELECT * FROM case_studies WHERE agent_slug = $1 AND display = TRUE`
- Minimal overhead for Vercel serverless functions (faster cold starts)
- Direct SQL control for performance optimization
- TypeScript type safety enforced at response validation layer (not query layer)

**Installation:**
```bash
npm install pg
npm install -D @types/pg
```

**Connection Pattern:**
```typescript
// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Neon
});

export default pool;
```

**Affects:** API route implementations, database query performance

**Decision 1.3: Data Validation Strategy**

**Selected Approach:** Python Pydantic validation + JSON schema validation script

**Validation Flow:**
1. **Agent execution:** Pydantic models validate output before JSON generation
2. **Pre-import:** Validation script checks JSON against Pydantic schema
3. **Import:** Database accepts valid JSON into JSONB fields
4. **API response:** TypeScript types validate response data

**Validation Script:**
```python
# scripts/validate-json.py
import json
import sys
from pydantic import ValidationError
from agents.fraud_trends.utils.models import FraudTrendsOutput

def validate_case_study(json_path: str) -> bool:
    """Validate JSON output matches Pydantic schema"""
    with open(json_path) as f:
        data = json.load(f)

    try:
        FraudTrendsOutput(**data['output_result'])
        print(f"✅ {json_path} validates against schema")
        return True
    except ValidationError as e:
        print(f"❌ {json_path} validation failed:")
        print(e)
        return False

if __name__ == "__main__":
    success = validate_case_study(sys.argv[1])
    sys.exit(0 if success else 1)
```

**Affects:** Import script workflow, Gate 1 validation checklist

### Authentication & Security

**Decision 2.1: API Authentication Strategy**

**Selected Approach:** No authentication (public read-only access)

**Security Measures:**
- **Database user:** Read-only SELECT permissions only (no INSERT/UPDATE/DELETE)
- **CORS:** Configured for portfolio domain only (Vercel default)
- **Rate limiting:** Rely on Vercel infrastructure limits (no custom implementation in MVP)
- **No sensitive data:** Case studies use public sources only, safe for public access

**SQL for Read-Only User:**
```sql
CREATE USER api_readonly WITH PASSWORD 'secure_password';
GRANT SELECT ON case_studies TO api_readonly;
GRANT SELECT ON execution_steps TO api_readonly;
```

**Future Consideration (Phase 2):**
- API keys for "Request Custom Analysis" feature
- Per-IP rate limiting via Vercel Edge Middleware

**Rationale:**
- Portfolio demonstration requires public access
- No user data or mutations in MVP
- Read-only database user prevents accidental data modification
- Simplifies MVP implementation (no auth middleware)

**Affects:** API route implementation, database configuration, deployment setup

**Decision 2.2: Secret Management**

**Selected Approach:** Environment variables with .env files

**Python Agent Layer:**
```bash
# .env (gitignored)
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...

# .env.example (committed)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

**Next.js Layer:**
```bash
# .env.local (gitignored)
DATABASE_URL=postgresql://user:pass@host/db

# .env.example (committed)
DATABASE_URL=postgresql://username:password@host:5432/database
```

**Vercel Deployment:**
- Environment variables configured via Vercel dashboard
- `DATABASE_URL` stored as production secret

**Security Validation:**
- SECURITY_CHECKLIST.md must be 100% validated before public repository
- Git history scan: `git log --all --full-history -- "*/.env"` returns no results
- Output sanitization: JSON files contain no API keys

**Affects:** Development workflow, deployment process, security checklist

### API & Communication Patterns

**Decision 3.1: API Design Pattern**

**Selected Pattern:** REST API with Next.js App Router API routes

**Endpoint Structure:**
```
GET /api/agents/[slug]/case-studies
GET /api/agents/[slug]/case-studies/[id]  (Optional for MVP)
GET /api/agents                            (Nice-to-have)
```

**Response Format:**
```typescript
// GET /api/agents/fraud-trends/case-studies
{
  "agent_slug": "fraud-trends",
  "case_studies": CaseStudy<FraudTrendsInput, FraudTrendsOutput>[],
  "total_count": 5,
  "execution_trace_included": true
}
```

**Rationale:**
- Simple read-only queries align with REST pattern
- Next.js App Router provides file-based routing (`app/api/agents/[slug]/case-studies/route.ts`)
- No need for GraphQL complexity (no complex nested queries or mutations in MVP)

**Affects:** API route file structure, frontend data fetching

**Decision 3.2: Error Response Format**

**Standardized Error Schema:**
```typescript
interface APIError {
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable error message
    details?: Record<string, any>;  // Optional additional context
  }
}
```

**HTTP Status Codes:**
- **200 OK:** Successful case study retrieval
- **404 Not Found:** Invalid agent slug or case study not found
- **500 Internal Server Error:** Database connection failure or unexpected error

**Example Error Responses:**
```typescript
// 404 - Invalid agent slug
{
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "Agent 'invalid-agent' not found",
    "details": {
      "valid_agents": ["fraud-trends", "stock-monitor", "house-finder", "article-editor", "gita-guide"]
    }
  }
}

// 500 - Database error
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to connect to database",
    "details": {} // No sensitive information exposed
  }
}
```

**Affects:** API route error handling, frontend error display, API documentation

### Frontend Architecture

**Decision 4.1: State Management Strategy**

**Selected Approach:** React Server Components + URL state (no client-side state library)

**Rationale:**
- Case studies are pre-generated static data (no real-time updates)
- Next.js 15 App Router defaults to Server Components (optimal for read-heavy apps)
- Data fetched server-side, minimal JavaScript sent to client
- Navigation state lives in URL: `/agents/fraud-trends?case=1`
- Faster page loads (important for portfolio first impressions)

**When to Add Client State (Phase 3):**
- Theme toggle (light/dark mode) → React Context API is sufficient
- Complex UI interactions (expandable execution traces, filters)
- Only add Zustand/Redux if React Context becomes insufficient

**Data Fetching Pattern:**
```typescript
// app/agents/[slug]/page.tsx (Server Component)
async function AgentPage({ params }: { params: { slug: string } }) {
  const caseStudies = await fetch(`${process.env.API_URL}/api/agents/${params.slug}/case-studies`)
    .then(res => res.json());

  return <AgentDetail caseStudies={caseStudies} />;
}
```

**Affects:** Component architecture, data fetching patterns, JavaScript bundle size

**Decision 4.2: Component Architecture**

**Selected Pattern:** Shared UI components across all 5 agent pages

**Reusable Components:**
- `AgentHeader` - Icon, name, tagline, type badge
- `HowItWorks` - Animated step diagram
- `CaseStudyGrid` - Grid of clickable case study cards
- `CaseStudyCard` - Individual preview card
- `ExecutionTrace` - Step-by-step trace display (expandable)
- `ExecutionStep` - Single step with timing and details

**Agent-Specific Components:**
- `FraudTrendsReport` - Fraud findings display
- `StockMonitorEvents` - Event detection display
- etc. (one per agent)

**Rationale:**
- Consistent UI across all agents (portfolio cohesion)
- Development velocity (build once, use 5 times)
- Type-safe props using generic types: `CaseStudy<TInput, TOutput>`

**Affects:** Component file structure, code reusability, development time for agents 2-5

### Infrastructure & Deployment

**Decision 5.1: Environment Configuration Strategy**

**Multi-Layer Environment Management:**

**Development (Local):**
- Python: `.env` file in `agents/fraud-trends/`
- Next.js: `.env.local` in `website/`
- Both gitignored, `.env.example` committed

**Production (Vercel):**
- Environment variables configured via Vercel dashboard
- `DATABASE_URL` as production secret
- Automatic injection into serverless functions

**Configuration Validation:**
```python
# agents/fraud-trends/agent.py
from dotenv import load_dotenv
import os
import sys

load_dotenv()

REQUIRED_VARS = ["ANTHROPIC_API_KEY", "TAVILY_API_KEY"]
missing = [var for var in REQUIRED_VARS if not os.getenv(var)]

if missing:
    print(f"❌ Missing required environment variables: {', '.join(missing)}")
    print(f"Please configure these in your .env file")
    sys.exit(1)
```

**Affects:** Development setup, deployment checklist, error handling

**Decision 5.2: Deployment Strategy**

**MVP (Gate 1 Validation) - Manual Deployment:**

**Python Agent Execution:**
1. Run locally: `cd agents/fraud-trends && python agent.py`
2. Generate 5 case studies (manual execution per topic)
3. Validate JSON: `python scripts/validate-json.py output/case_study_001.json`
4. Import to database: `python scripts/import-case-studies.py`

**Next.js Deployment:**
1. Local development: `npm run dev`
2. Manual deployment: `vercel deploy --prod`
3. Environment variables configured in Vercel dashboard

**Rationale:**
- Gate 1 is proof-of-concept validation (manual control ensures quality)
- No CI/CD complexity during validation phase
- Can iterate quickly on agent code without pipeline overhead

**Phase 2+ (After Gate 1 Validation) - Automated CI/CD:**

**GitHub Actions Workflow:**
```yaml
# .github/workflows/generate-case-studies.yml
name: Generate Case Studies
on:
  workflow_dispatch:  # Manual trigger

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Fraud Trends Agent
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          TAVILY_API_KEY: ${{ secrets.TAVILY_API_KEY }}
        run: |
          cd agents/fraud-trends
          pip install -r requirements.txt
          python agent.py
      - name: Import to Database
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: python scripts/import-case-studies.py
```

**Vercel Auto-Deployment:**
- Push to `main` branch triggers automatic deployment
- Preview deployments for pull requests

**Deferred to Phase 2:** CI/CD adds value after pattern validation, not during initial proof-of-concept

**Affects:** Development workflow, deployment documentation, Gate 1 validation process

### Type Consistency Enforcement

**Decision 6.1: Cross-Language Type Synchronization Strategy**

**Selected Approach:** Manual synchronization + validation script (reassess after Gate 1)

**Three-Way Type Alignment:**

**1. Python Pydantic Models (Source of Truth for Agent Output):**
```python
# agents/fraud-trends/utils/models.py
from pydantic import BaseModel
from typing import List, Literal

class FraudTrendsInput(BaseModel):
    topic: str
    regions: List[str]
    time_range: str
    focus_areas: List[str] | None = None

class FraudTrend(BaseModel):
    name: str
    category: str
    description: str
    severity: Literal["low", "medium", "high", "critical"]
    # ... other fields

class FraudTrendsOutput(BaseModel):
    executive_summary: str
    trends: List[FraudTrend]
    # ... other fields
```

**2. TypeScript Types (Source of Truth for API/Frontend):**
```typescript
// website/lib/types.ts
export interface FraudTrendsInput {
  topic: string;
  regions: string[];
  time_range: string;
  focus_areas?: string[];
}

export interface FraudTrend {
  name: string;
  category: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  // ... other fields
}

export interface FraudTrendsOutput {
  executive_summary: string;
  trends: FraudTrend[];
  // ... other fields
}
```

**3. Database Schema (JSONB stores validated structures):**
```sql
-- Validated by Pydantic before insertion
input_parameters JSONB NOT NULL  -- Stores FraudTrendsInput
output_result JSONB NOT NULL     -- Stores FraudTrendsOutput
```

**Synchronization Workflow:**

1. **Define types in Python first** (Pydantic models guide agent implementation)
2. **Manually create matching TypeScript types** (visual comparison during coding)
3. **Validation script checks alignment** before database import
4. **Code review verifies consistency** before committing

**Validation Script:**
```python
# scripts/validate-json.py
import json
import sys
from pydantic import ValidationError
from agents.fraud_trends.utils.models import FraudTrendsOutput

def validate_case_study(json_path: str) -> bool:
    with open(json_path) as f:
        data = json.load(f)

    try:
        # Validates against Pydantic schema
        FraudTrendsOutput(**data['output_result'])
        print(f"✅ {json_path} validates against Pydantic schema")
        return True
    except ValidationError as e:
        print(f"❌ {json_path} validation failed:")
        print(e)
        return False
```

**Rationale:**
- MVP has only 1 agent (Fraud Trends) - manual sync is manageable
- Types are well-defined in PRD (low risk of drift)
- Validation script catches mismatches before database import
- After Gate 1, reassess if automation needed (if Stock Monitor sync is painful, add code generation)

**Future Automation Options (Post-Gate 1):**
- `pydantic-to-typescript` - Generate TypeScript from Pydantic
- JSON Schema as bridge - Generate both from schema files
- Only add if manual sync becomes error-prone across 5 agents

**Affects:** Development workflow, Gate 1 validation checklist, type definition process

### Decision Impact Analysis

**Implementation Sequence (Dependency Order):**

1. **Database schema creation** (blocks all other work)
2. **Python agent structure setup** (Pydantic models, constants, utils)
3. **Agent execution logic** (6-step workflow implementation)
4. **JSON validation script** (enables safe database import)
5. **Database import script** (loads case studies to PostgreSQL)
6. **Next.js initialization** (`create-next-app`, TypeScript types)
7. **API route implementation** (database queries, error handling)
8. **Frontend components** (Phase 3 - after all agents working)

**Cross-Component Dependencies:**

**Database Schema ↔ All Components:**
- Changes to schema require updates to: Pydantic models, TypeScript types, import script, API queries
- **Immutability constraint:** Schema locked after Gate 1 validation

**Type Definitions ↔ Agent + API + Frontend:**
- Python Pydantic models must match TypeScript types exactly
- Validation script enforces alignment before import
- API response types match frontend expectations

**Environment Variables ↔ Agent + API:**
- Python agent requires: `ANTHROPIC_API_KEY`, `TAVILY_API_KEY`
- API routes require: `DATABASE_URL`
- Missing variables cause runtime failures (validation scripts check at startup)

**Gate 1 Validation ↔ All Future Agents:**
- Fraud Trends proves universal schema works
- Stock Monitor validates replicability
- GO decision enables agents 3-5, NO-GO triggers schema pivot

