---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories']
inputDocuments:
  - /Volumes/External/AIAgents/_bmad-output/planning-artifacts/prd.md
  - /Volumes/External/AIAgents/_bmad-output/planning-artifacts/architecture.md
workflowType: 'epics-and-stories'
project_name: 'AIAgents'
user_name: 'Sunil'
date: '2025-02-09'
---

# AIAgents - Epic Breakdown

## Requirements Inventory

### Functional Requirements (54 Total)

#### Agent Execution Capabilities (FR1-FR10)

**FR1:** Developer can execute Fraud Trends agent with topic, regions, time range, focus areas as input

**FR2:** Agent can generate research strategy with sub-queries based on input parameters

**FR3:** Agent can search industry sources using Tavily web search API

**FR4:** Agent can search regulatory sources (NAIC, FBI, state insurance departments)

**FR5:** Agent can search academic sources (research papers, journals)

**FR6:** Agent can extract key findings with structured classification (fraud type, severity, detection difficulty)

**FR7:** Agent can synthesize executive summary and actionable recommendations

**FR8:** Agent can generate JSON output matching TypeScript FraudTrendsOutput schema exactly

**FR9:** Agent can log execution steps with timing, inputs, outputs, and details to execution trace

**FR10:** Agent can handle API failures gracefully without crashing (Claude API, Tavily API)

#### Data Management Capabilities (FR11-FR18)

**FR11:** Developer can import JSON files to PostgreSQL database via import script

**FR12:** Import script can validate JSON structure against TypeScript schema before insertion

**FR13:** Import script can insert case study data to case_studies table

**FR14:** Import script can insert execution steps to execution_steps table with proper foreign key references

**FR15:** Database can store agent-specific input parameters in JSONB format

**FR16:** Database can store agent-specific output results in JSONB format

**FR17:** Database can store execution trace as JSONB array

**FR18:** Database can query case studies by agent slug and filter by display status

#### Output Quality & Compliance Capabilities (FR19-FR29)

**FR19:** Agent output must classify findings by fraud_type (synthetic identity, repair fraud, etc.)

**FR20:** Agent output must assign severity levels (low, medium, high, critical) to findings

**FR21:** Agent output must estimate detection_difficulty for each finding

**FR22:** Agent output must specify geographic_scope for trends

**FR23:** Agent output must separate regulatory findings from industry findings

**FR24:** Agent output must classify sources by tier (Tier 1: regulatory/academic, Tier 2: industry, Tier 3: news)

**FR25:** Agent output must provide source_tier_breakdown showing distribution across tiers

**FR26:** Agent output must include confidence_level based on source quality

**FR27:** Agent output must include regulatory disclaimer text

**FR28:** Agent output must include data freshness indicator (time range of sources)

**FR29:** Agent output must provide actionable recommendations based on findings

#### API Access Capabilities (FR30-FR37)

**FR30:** API endpoint can return all case studies for a given agent slug

**FR31:** API response includes execution trace for each case study

**FR32:** API returns structured error responses with machine-readable error codes

**FR33:** API validates agent slug and returns 404 for invalid slugs

**FR34:** API returns appropriate HTTP status codes (200/404/500)

**FR35:** API response includes metadata (total count, trace inclusion status)

**FR36:** API response format matches TypeScript type definitions

**FR37:** API error responses do not expose sensitive information or paths

#### Code Quality & Security Capabilities (FR38-FR44)

**FR38:** Python code passes pylint with score ≥9.0/10.0

**FR39:** TypeScript code passes ESLint with zero errors

**FR40:** All immutable constants defined in UPPER_SNAKE_CASE

**FR41:** Every public function has comprehensive comments (purpose, params, returns)

**FR42:** No API keys or secrets appear in git history

**FR43:** .env files are gitignored, .env.example files provide templates

**FR44:** JSON output files contain no API keys or sensitive credentials

#### Validation & Testing Capabilities (FR45-FR50)

**FR45:** Validation script can verify JSON output matches Pydantic schema

**FR46:** Validation script provides clear field-level error messages on failure

**FR47:** Database import validates all foreign key relationships

**FR48:** Import script reports success/failure for each case study

**FR49:** API endpoint returns valid TypeScript types that compile successfully

**FR50:** Gate 1 validation checklist can be executed to verify all requirements

#### Documentation Capabilities (FR51-FR54)

**FR51:** Agent README documents setup, API key requirements, and usage examples

**FR52:** .env.example provides placeholders for all required environment variables

**FR53:** SECURITY_CHECKLIST.md validates zero secrets in repository before making public

**FR54:** Code includes inline comments explaining domain-specific design decisions

### Non-Functional Requirements (19 Total)

#### Security (NFR-S1 to NFR-S5)

**NFR-S1:** All API keys and secrets stored only in .env files (gitignored)

**NFR-S2:** Git history contains zero committed secrets (validated via git log scan)

**NFR-S3:** JSON outputs and database contain no API keys or credentials

**NFR-S4:** Repository passes SECURITY_CHECKLIST.md 100% before going public

**NFR-S5:** API uses read-only database connections with SELECT-only permissions

#### Code Quality (NFR-CQ1 to NFR-CQ5)

**NFR-CQ1:** ESLint shows zero errors for TypeScript code

**NFR-CQ2:** Python pylint score ≥9.0/10.0

**NFR-CQ3:** Every public function documented with purpose, parameters, returns

**NFR-CQ4:** Immutable constants clearly marked with UPPER_SNAKE_CASE naming

**NFR-CQ5:** TypeScript strict mode enabled, Python type hints throughout

#### Reliability (NFR-R1 to NFR-R4)

**NFR-R1:** Agent completes all 6 steps without crashes on valid inputs

**NFR-R2:** Database import succeeds 100% of time for valid JSON

**NFR-R3:** Foreign key enforcement prevents orphaned execution steps

**NFR-R4:** API returns proper HTTP status codes for all error scenarios

#### Performance (NFR-P1 to NFR-P3)

**NFR-P1:** Agent execution completes in ≤60 seconds (target 15-30 seconds)

**NFR-P2:** Database import takes ≤10 seconds per case study

**NFR-P3:** API response time ≤2 seconds for case study retrieval

#### Integration (NFR-I1 to NFR-I4)

**NFR-I1:** Python Pydantic ↔ TypeScript ↔ Database schema exact alignment

**NFR-I2:** Claude API rate limits handled gracefully

**NFR-I3:** Tavily API failures handled without crashing agent

**NFR-I4:** PostgreSQL 14+ compatibility (Neon hosted)

### Additional Requirements from Architecture

#### Project Initialization & Structure

**AR1:** Next.js project initialized via `npx create-next-app@latest website --typescript --tailwind --eslint --app --turbopack --import-alias "@/*"`

**AR2:** Python agent follows manual structure: agent.py, utils/ (models.py, steps.py, constants.py), output/, .env, requirements.txt, README.md

**AR3:** Dependencies installed: langchain≥0.3.0, langchain-anthropic≥0.2.0, tavily-python≥0.5.0, pydantic≥2.5.0, python-dotenv≥1.0.0

**AR4:** Next.js database client installed: `npm install pg` and `npm install -D @types/pg`

#### Database Schema (LOCKED - Immutable)

**AR5:** Database schema created with case_studies table (id UUID, agent_slug, title, subtitle, input_parameters JSONB, output_result JSONB, execution_trace JSONB, display, featured, display_order, timestamps)

**AR6:** Database schema includes execution_steps table (id UUID, case_study_id FK, step_number, step_name, step_type, input_summary, output_summary, details JSONB, duration_ms, timestamp)

**AR7:** Indexes created: idx_case_studies_agent_slug, idx_case_studies_display, idx_execution_steps_case_study_id

**AR8:** Read-only database user created with SELECT-only permissions for API access

#### Type Consistency & Validation

**AR9:** Python Pydantic models defined for FraudTrendsInput and FraudTrendsOutput in utils/models.py

**AR10:** TypeScript types defined in website/lib/types.ts matching Pydantic models exactly

**AR11:** Validation script (scripts/validate-json.py) verifies JSON against Pydantic schema

**AR12:** Manual synchronization workflow: Define Python → Create matching TypeScript → Validate with script → Code review

#### Environment Configuration

**AR13:** Python agent validates required environment variables (ANTHROPIC_API_KEY, TAVILY_API_KEY) on startup

**AR14:** Next.js uses .env.local for DATABASE_URL (gitignored)

**AR15:** Both layers have .env.example files with placeholder values (committed)

**AR16:** Vercel deployment uses environment variables configured via dashboard

#### API Architecture

**AR17:** API route structure: GET /api/agents/[slug]/case-studies implemented in app/api/agents/[slug]/case-studies/route.ts

**AR18:** API response format: { agent_slug, case_studies, total_count, execution_trace_included }

**AR19:** Standardized error response format: { error: { code, message, details } }

**AR20:** HTTP status codes: 200 (success), 404 (not found), 500 (server error)

**AR21:** Database connection via pg Pool with SSL for Neon (lib/db.ts)

#### Security Implementation

**AR22:** CORS configured for portfolio domain only (Vercel default)

**AR23:** Rate limiting relies on Vercel infrastructure (no custom implementation in MVP)

**AR24:** Git history validation: `git log --all --full-history -- "*/.env"` returns no results

**AR25:** Output sanitization validated before JSON files committed

#### Deployment Strategy

**AR26:** MVP deployment is manual: Python agent runs locally, outputs imported manually, Next.js deployed via `vercel deploy --prod`

**AR27:** Gate 1 validation before proceeding to additional agents

**AR28:** CI/CD automation deferred to Phase 2 (after pattern validation)

#### Frontend Architecture (Phase 3 - Deferred)

**AR29:** React Server Components with no client-side state library in MVP

**AR30:** Shared reusable components: AgentHeader, HowItWorks, CaseStudyGrid, CaseStudyCard, ExecutionTrace, ExecutionStep

**AR31:** Agent-specific components: FraudTrendsReport (and others for remaining agents)

### Requirements Coverage Map

#### Functional Requirements Coverage (54 Total)

**Epic 1 (Foundation):** FR42, FR43, FR51, FR52, FR53

**Epic 2 (Database & Types):** FR8, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR36

**Epic 3 (Agent):** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR9, FR10, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR38, FR40, FR41, FR44, FR54

**Epic 4 (Validation & Import):** FR45, FR46, FR47, FR48, FR50

**Epic 5 (API):** FR30, FR31, FR32, FR33, FR34, FR35, FR37, FR39, FR49

**Epic 6 (Deployment):** (No FRs - focuses on integration and validation)

#### Additional Requirements Coverage (31 Total)

**Epic 1:** AR1, AR2, AR3, AR4, AR13, AR14, AR15, AR22, AR24, AR25

**Epic 2:** AR5, AR6, AR7, AR8, AR9, AR10, AR11, AR12, AR21

**Epic 3:** (No ARs - agent implementation)

**Epic 4:** (No ARs - validation/import logic)

**Epic 5:** AR17, AR18, AR19, AR20, AR23

**Epic 6:** AR16, AR26, AR27, AR28

**Note:** Frontend requirements (AR29-AR31) deferred to Phase 3

#### Non-Functional Requirements Coverage (19 Total)

**Epic 1:** (Security foundations established)

**Epic 2:** NFR-S5, NFR-I1, NFR-I4

**Epic 3:** NFR-S1, NFR-S3, NFR-CQ2, NFR-CQ3, NFR-CQ4, NFR-CQ5, NFR-R1, NFR-P1, NFR-I2, NFR-I3

**Epic 4:** NFR-R2, NFR-R3, NFR-P2

**Epic 5:** NFR-CQ1, NFR-R4, NFR-P3

**Epic 6:** NFR-S2, NFR-S4

## Epic List

### Epic 1: Project Foundation & Environment Setup

**User Outcome:** Developers can initialize the project structure with proper dependencies, environment configuration, and security safeguards in place.

**What users can accomplish:**
- Initialize Next.js website with TypeScript, TailwindCSS, ESLint
- Set up Python agent project structure
- Install all required dependencies
- Configure environment variables securely
- Validate no secrets leak into git

**FRs covered:** FR42, FR43, FR51, FR52, FR53

**Additional Requirements:** AR1, AR2, AR3, AR4, AR13, AR14, AR15, AR22, AR24, AR25

**Implementation Notes:**
- Uses official Next.js create-next-app starter
- Establishes security foundations before any code
- Creates templates (.env.example) for safe onboarding
- First epic must be complete before development can begin

---

### Epic 2: Universal Database Schema & Type System

**User Outcome:** Developers have a validated, immutable database schema with synchronized type definitions across Python, TypeScript, and PostgreSQL that can handle all agent types.

**What users can accomplish:**
- Create PostgreSQL database with universal schema
- Define Pydantic models for agent input/output
- Define matching TypeScript types
- Set up database connection layer
- Configure read-only database access for API security
- Validate type consistency across all layers

**FRs covered:** FR8, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR36

**Additional Requirements:** AR5, AR6, AR7, AR8, AR9, AR10, AR11, AR12, AR21

**NFRs addressed:** NFR-S5, NFR-I1, NFR-I4

**Implementation Notes:**
- Database schema LOCKED after this epic (immutable)
- 3-way type alignment is critical constraint
- Validation script ensures no drift
- Gate 1 depends on this schema working for Fraud Trends

---

### Epic 3: Fraud Trends Research Agent (6-Step Workflow)

**User Outcome:** Developers can execute the Fraud Trends agent to research fraud topics, generating complete JSON case studies with execution transparency.

**What users can accomplish:**
- Execute agent with topic, regions, time range, focus areas
- Agent plans research strategy (Step 1)
- Agent searches industry, regulatory, academic sources (Steps 2-4)
- Agent extracts key findings with domain classifications (Step 5)
- Agent synthesizes executive summary and recommendations (Step 6)
- Generate JSON output matching TypeScript schema
- Log complete execution trace with timing and details
- Handle API failures gracefully

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR9, FR10, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR38, FR40, FR41, FR44, FR54

**NFRs addressed:** NFR-S1, NFR-S3, NFR-CQ2, NFR-CQ3, NFR-CQ4, NFR-CQ5, NFR-R1, NFR-P1, NFR-I2, NFR-I3

**Implementation Notes:**
- Core agent implementation with LangChain
- Domain-specific insuretech classifications
- Execution transparency as first-class feature
- Proves universal schema works (Gate 1 requirement)

---

### Epic 4: Case Study Validation & Database Import

**User Outcome:** Developers can validate generated JSON case studies and import them to PostgreSQL, ensuring data integrity and type consistency.

**What users can accomplish:**
- Validate JSON output against Pydantic schema
- Receive clear field-level error messages on validation failure
- Import validated case studies to database
- Insert execution steps with proper foreign keys
- Query imported case studies by agent slug
- Verify 100% import success rate for valid JSON

**FRs covered:** FR45, FR46, FR47, FR48, FR50

**NFRs addressed:** NFR-R2, NFR-R3, NFR-P2

**Implementation Notes:**
- Builds on Epic 2 (schema) and Epic 3 (agent output)
- Validation script catches type mismatches
- Import script handles database transactions
- Gate 1 validation checklist execution

---

### Epic 5: REST API for Case Study Access

**User Outcome:** Portfolio visitors and developers can retrieve case studies and execution traces via REST API with proper error handling and type safety.

**What users can accomplish:**
- Fetch all case studies for an agent via GET /api/agents/[slug]/case-studies
- Receive execution traces with timing and step details
- Get structured error responses with machine-readable codes
- Receive proper HTTP status codes (200/404/500)
- Query validated data matching TypeScript types
- Access API without authentication (read-only public access)

**FRs covered:** FR30, FR31, FR32, FR33, FR34, FR35, FR37, FR39, FR49

**Additional Requirements:** AR17, AR18, AR19, AR20, AR23

**NFRs addressed:** NFR-CQ1, NFR-R4, NFR-P3

**Implementation Notes:**
- Builds on Epic 2 (database) and Epic 4 (imported data)
- Next.js App Router API routes
- Read-only access with SELECT-only database user
- Type-safe responses validated against TypeScript

---

### Epic 6: Deployment & Gate 1 Validation

**User Outcome:** Developers can deploy the complete system to production and validate the universal schema pattern works before proceeding to additional agents.

**What users can accomplish:**
- Generate 5 Fraud Trends case studies on different topics
- Validate all case studies pass schema validation
- Import all case studies to production database
- Deploy Next.js API to Vercel with environment variables
- Execute Gate 1 validation checklist
- Make GO/NO-GO decision on universal schema pattern

**Additional Requirements:** AR16, AR26, AR27, AR28

**NFRs addressed:** NFR-S2, NFR-S4

**Implementation Notes:**
- Manual deployment for MVP validation
- Vercel environment variable configuration
- SECURITY_CHECKLIST.md 100% validated
- Proves pattern before building agents 2-5
- CI/CD deferred to Phase 2

---

# Epic Stories

## Epic 1: Project Foundation & Environment Setup

### Story 1.1: Initialize Next.js Website Project

As a developer,
I want to initialize the Next.js website with TypeScript, TailwindCSS, and ESLint configured,
So that I have a properly configured frontend foundation for the API and future UI.

**Acceptance Criteria:**

**Given** I am in the project root directory
**When** I run `npx create-next-app@latest website --typescript --tailwind --eslint --app --turbopack --import-alias "@/*"`
**Then** A website/ directory is created with Next.js 15 structure
**And** TypeScript strict mode is enabled in tsconfig.json
**And** TailwindCSS is configured in tailwind.config.ts
**And** ESLint is configured with Next.js rules
**And** `npm run dev` starts the development server successfully
**And** The project uses App Router architecture (app/ directory exists)

---

### Story 1.2: Create Python Agent Project Structure

As a developer,
I want to set up the Fraud Trends agent directory with proper structure,
So that I have organized locations for agent code, utilities, and outputs.

**Acceptance Criteria:**

**Given** I am in the project root directory
**When** I create the agents/fraud-trends/ directory structure
**Then** The following directories and files exist:
- agents/fraud-trends/agent.py (skeleton script)
- agents/fraud-trends/utils/__init__.py
- agents/fraud-trends/utils/models.py (empty, ready for Pydantic models)
- agents/fraud-trends/utils/steps.py (empty, ready for step functions)
- agents/fraud-trends/utils/constants.py (empty, ready for constants)
- agents/fraud-trends/output/ (directory for JSON outputs)
- agents/fraud-trends/README.md (with project description)
**And** agent.py contains a basic command-line argument parser
**And** Running `python agent.py --help` displays usage information

---

### Story 1.3: Install Python Dependencies

As a developer,
I want to install all required Python dependencies for the agent,
So that LangChain, Anthropic, Tavily, and validation tools are available.

**Acceptance Criteria:**

**Given** The agents/fraud-trends/ directory structure exists
**When** I create requirements.txt with specified dependencies
**Then** requirements.txt includes:
- langchain>=0.3.0
- langchain-anthropic>=0.2.0
- tavily-python>=0.5.0
- pydantic>=2.5.0
- python-dotenv>=1.0.0
**And** Running `pip install -r requirements.txt` succeeds without errors
**And** Python can import all packages (langchain, langchain_anthropic, tavily, pydantic, dotenv)

---

### Story 1.4: Install Next.js Database Client

As a developer,
I want to install the PostgreSQL client library for Next.js,
So that API routes can connect to the database.

**Acceptance Criteria:**

**Given** The website/ directory exists with package.json
**When** I run `npm install pg` and `npm install -D @types/pg`
**Then** Both packages appear in package.json dependencies
**And** TypeScript recognizes the pg types without errors
**And** I can import { Pool } from 'pg' in a TypeScript file

---

### Story 1.5: Configure Python Environment Variables

As a developer,
I want to set up .env configuration with required API keys for the agent,
So that credentials are securely managed and not committed to git.

**Acceptance Criteria:**

**Given** The agents/fraud-trends/ directory exists
**When** I create .env.example with placeholders
**Then** .env.example contains:
- ANTHROPIC_API_KEY=your_anthropic_api_key_here
- TAVILY_API_KEY=your_tavily_api_key_here
**And** .env is added to .gitignore
**And** agents/fraud-trends/.gitignore includes .env
**And** .env.example is tracked by git (not gitignored)
**And** agent.py loads environment variables using python-dotenv
**And** agent.py validates ANTHROPIC_API_KEY and TAVILY_API_KEY exist on startup
**And** agent.py exits with clear error message if required variables are missing
**And** Satisfies FR43, AR13, AR14, AR15

---

### Story 1.6: Configure Next.js Environment Variables

As a developer,
I want to set up .env.local configuration for database connection,
So that the API can connect to PostgreSQL securely.

**Acceptance Criteria:**

**Given** The website/ directory exists
**When** I create .env.example in website/
**Then** .env.example contains:
- DATABASE_URL=postgresql://username:password@host:5432/database
**And** .env.local is added to website/.gitignore
**And** .env.example is tracked by git
**And** Next.js automatically loads .env.local during development
**And** Satisfies FR43, AR14, AR15

---

### Story 1.7: Create Agent README Documentation

As a developer,
I want comprehensive README documentation for the Fraud Trends agent,
So that setup, API keys, and usage are clearly documented.

**Acceptance Criteria:**

**Given** The agents/fraud-trends/ directory exists
**When** I write agents/fraud-trends/README.md
**Then** README includes:
- Project description and purpose
- Setup instructions (Python version, dependency installation)
- API key requirements (where to get Anthropic and Tavily keys)
- How to configure .env file
- Usage examples with sample commands
- Output file location explanation
**And** Instructions are clear enough for a new developer to set up the agent
**And** Satisfies FR51

---

### Story 1.8: Create Security Validation Checklist

As a developer,
I want a SECURITY_CHECKLIST.md document to validate repository safety,
So that I can verify zero secrets exist before making the repo public.

**Acceptance Criteria:**

**Given** The project root directory exists
**When** I create SECURITY_CHECKLIST.md
**Then** Checklist includes validation items:
- [ ] .env files are gitignored (check .gitignore files)
- [ ] Git history contains no API keys (run: git log --all --full-history -- "*/.env")
- [ ] JSON output files contain no API keys or credentials
- [ ] Database connection strings use environment variables only
- [ ] .env.example files contain only placeholders
- [ ] No hardcoded secrets in Python or TypeScript code
**And** Each checklist item has validation command or manual check instructions
**And** Satisfies FR53, AR24, AR25

---

## Epic 2: Universal Database Schema & Type System

### Story 2.1: Create PostgreSQL Database Schema

As a developer,
I want to create the universal database schema with case_studies and execution_steps tables,
So that all agent types can store their data in a consistent structure.

**Acceptance Criteria:**

**Given** I have access to a PostgreSQL 14+ database (Neon or local)
**When** I execute the schema creation SQL script
**Then** The case_studies table exists with columns:
- id UUID PRIMARY KEY
- agent_slug VARCHAR(50) NOT NULL
- title VARCHAR(200) NOT NULL
- subtitle VARCHAR(300)
- input_parameters JSONB NOT NULL
- output_result JSONB NOT NULL
- execution_trace JSONB NOT NULL
- display BOOLEAN NOT NULL DEFAULT TRUE
- featured BOOLEAN DEFAULT FALSE
- display_order INTEGER
- created_at TIMESTAMP DEFAULT NOW()
- updated_at TIMESTAMP DEFAULT NOW()
**And** The execution_steps table exists with columns:
- id UUID PRIMARY KEY
- case_study_id UUID REFERENCES case_studies(id)
- step_number INTEGER NOT NULL
- step_name VARCHAR(100) NOT NULL
- step_type VARCHAR(50) NOT NULL
- input_summary TEXT
- output_summary TEXT
- details JSONB
- duration_ms INTEGER
- timestamp TIMESTAMP DEFAULT NOW()
**And** Indexes are created:
- idx_case_studies_agent_slug ON case_studies(agent_slug)
- idx_case_studies_display ON case_studies(display) WHERE display = TRUE
- idx_execution_steps_case_study_id ON execution_steps(case_study_id)
**And** Foreign key constraint on execution_steps.case_study_id is enforced
**And** Satisfies AR5, AR6, AR7, FR13, FR14, FR15, FR16, FR17, NFR-I4

---

### Story 2.2: Create Read-Only Database User for API

As a developer,
I want a read-only PostgreSQL user for the API layer,
So that the public API cannot modify or delete data.

**Acceptance Criteria:**

**Given** The database schema exists
**When** I create the api_readonly database user
**Then** The user is created with a secure password
**And** The user has SELECT permissions on case_studies table
**And** The user has SELECT permissions on execution_steps table
**And** The user has NO INSERT, UPDATE, or DELETE permissions
**And** The connection string for this user is documented in website/.env.example
**And** Satisfies AR8, NFR-S5

---

### Story 2.3: Define Python Pydantic Models

As a developer,
I want Pydantic models for FraudTrendsInput and FraudTrendsOutput,
So that the agent validates data structure and the output matches TypeScript types.

**Acceptance Criteria:**

**Given** The agents/fraud-trends/utils/models.py file exists
**When** I define the Pydantic models
**Then** FraudTrendsInput model includes:
- topic: str
- regions: List[str]
- time_range: str
- focus_areas: List[str] | None = None
**And** FraudTrendsOutput model includes all fields from PRD FR19-FR29:
- executive_summary: str
- trends: List[FraudTrend]
- regulatory_findings: List[RegulatoryFinding]
- source_tier_breakdown: SourceTierBreakdown
- confidence_level: Literal["low", "medium", "high"]
- data_freshness: str
- disclaimer: str
- recommendations: List[str]
**And** FraudTrend model includes: name, category, description, severity, detection_difficulty, geographic_scope, affected_lines, estimated_impact
**And** All models use Python type hints throughout
**And** Models validate on instantiation (Pydantic validation)
**And** Satisfies AR9, FR8, FR19-FR29, NFR-CQ5

---

### Story 2.4: Define TypeScript Type Definitions

As a developer,
I want TypeScript types matching the Pydantic models exactly,
So that API responses are type-safe and validated.

**Acceptance Criteria:**

**Given** The website/lib/ directory exists
**When** I create website/lib/types.ts
**Then** FraudTrendsInput interface matches Pydantic model exactly:
- topic: string
- regions: string[]
- time_range: string
- focus_areas?: string[]
**And** FraudTrendsOutput interface matches Pydantic model exactly with all fields
**And** FraudTrend interface includes all fields with matching types
**And** Generic CaseStudy<TInput, TOutput> interface is defined:
- id: string
- agent_slug: string
- title: string
- subtitle?: string
- input_parameters: TInput
- output_result: TOutput
- execution_trace: ExecutionStep[]
- display: boolean
- featured: boolean
- display_order?: number
- created_at: string
- updated_at: string
**And** ExecutionStep interface matches execution_steps table structure
**And** All severity/confidence literals match Python exactly
**And** Satisfies AR10, FR36, NFR-I1

---

### Story 2.5: Create Database Connection Module

As a developer,
I want a reusable database connection module for Next.js API routes,
So that all routes can connect to PostgreSQL securely.

**Acceptance Criteria:**

**Given** The website/lib/ directory exists
**When** I create website/lib/db.ts
**Then** The module exports a pg Pool instance
**And** Connection uses process.env.DATABASE_URL
**And** SSL configuration includes: { rejectUnauthorized: false } for Neon compatibility
**And** The pool is configured for serverless function optimization
**And** TypeScript types are correctly imported from pg
**And** I can import pool from '@/lib/db' in API routes
**And** Satisfies AR21, NFR-I4

---

### Story 2.6: Create JSON Validation Script

As a developer,
I want a Python script to validate JSON outputs against Pydantic schemas,
So that I can verify type consistency before database import.

**Acceptance Criteria:**

**Given** The scripts/ directory exists
**When** I create scripts/validate-json.py
**Then** Script accepts JSON file path as command-line argument
**And** Script imports FraudTrendsOutput from agents.fraud_trends.utils.models
**And** Script loads JSON and validates output_result field against Pydantic schema
**And** Script prints "✅ {filename} validates against schema" on success
**And** Script prints detailed Pydantic ValidationError on failure
**And** Script exits with code 0 on success, 1 on failure
**And** Script can be run: `python scripts/validate-json.py agents/fraud-trends/output/case_study_001.json`
**And** Satisfies AR11, AR12, FR12, FR45, FR46

---

## Epic 3: Fraud Trends Research Agent (6-Step Workflow)

### Story 3.1: Define Agent Constants

As a developer,
I want immutable constants for the agent configuration,
So that consistent values are used throughout the codebase and easily identified.

**Acceptance Criteria:**

**Given** The agents/fraud-trends/utils/constants.py file exists
**When** I define the agent constants
**Then** Constants are defined in UPPER_SNAKE_CASE:
- AGENT_SLUG = "fraud-trends"
- STEP_TYPES with values: "planning", "search_industry", "search_regulatory", "search_academic", "extraction", "synthesis"
- FRAUD_TYPES (list of valid fraud categories from PRD)
- SEVERITY_LEVELS = ["low", "medium", "high", "critical"]
- DETECTION_DIFFICULTY_LEVELS = ["easy", "moderate", "hard", "very_hard"]
- SOURCE_TIERS = ["tier_1", "tier_2", "tier_3"]
- CONFIDENCE_LEVELS = ["low", "medium", "high"]
**And** Constants are exported and importable from other modules
**And** Satisfies FR40, NFR-CQ4

---

### Story 3.2: Implement Step 1 - Research Planning

As a developer,
I want the agent to generate a research strategy based on input parameters,
So that search queries are targeted and comprehensive.

**Acceptance Criteria:**

**Given** The agent receives valid FraudTrendsInput (topic, regions, time_range, focus_areas)
**When** Step 1 executes
**Then** LLM (Claude) is invoked with a prompt containing:
- Input topic and parameters
- Instructions to generate 3-5 targeted search queries
- Instructions to identify source types (industry, regulatory, academic)
**And** Step returns research plan with:
- industry_queries: List[str] (2-3 queries)
- regulatory_queries: List[str] (2-3 queries)
- academic_queries: List[str] (1-2 queries)
**And** Execution step is logged with:
- step_number: 1
- step_name: "Plan Research Strategy"
- step_type: "planning"
- input_summary: JSON string of input parameters
- output_summary: Summary of generated queries
- details: Complete research plan as JSONB
- duration_ms: Execution time
**And** Claude API errors are caught and logged (doesn't crash agent)
**And** Satisfies FR2, FR9, NFR-I2, NFR-R1

---

### Story 3.3: Implement Step 2 - Industry Source Search

As a developer,
I want the agent to search industry sources using Tavily API,
So that current fraud trends from industry reports are captured.

**Acceptance Criteria:**

**Given** Step 1 has generated industry_queries
**When** Step 2 executes
**Then** Tavily API is called for each industry query
**And** Search parameters include:
- query: industry_queries[i]
- search_depth: "advanced"
- max_results: 10
**And** Results are collected and categorized as tier_2 sources
**And** Each result includes: title, url, content_snippet, published_date
**And** Execution step is logged with:
- step_number: 2
- step_name: "Search Industry Sources"
- step_type: "search_industry"
- input_summary: List of queries executed
- output_summary: Count of sources found
- details: Complete search results as JSONB
- duration_ms: Execution time
**And** Tavily API errors are caught and handled gracefully (partial results returned)
**And** Satisfies FR3, FR9, FR24, NFR-I3, NFR-R1

---

### Story 3.4: Implement Step 3 - Regulatory Source Search

As a developer,
I want the agent to search regulatory sources (NAIC, FBI, state departments),
So that authoritative fraud data from regulators is included.

**Acceptance Criteria:**

**Given** Step 1 has generated regulatory_queries
**When** Step 3 executes
**Then** Tavily API is called for each regulatory query with domain filters
**And** Search focuses on regulatory domains:
- naic.org (National Association of Insurance Commissioners)
- fbi.gov
- State insurance department websites
**And** Results are categorized as tier_1 sources
**And** Execution step is logged with search results and timing
**And** Satisfies FR4, FR9, FR23, FR24, NFR-R1

---

### Story 3.5: Implement Step 4 - Academic Source Search

As a developer,
I want the agent to search academic sources (research papers, journals),
So that peer-reviewed research on fraud trends is included.

**Acceptance Criteria:**

**Given** Step 1 has generated academic_queries
**When** Step 4 executes
**Then** Tavily API is called for each academic query
**And** Search targets academic domains (.edu, research journals)
**And** Results are categorized as tier_1 sources
**And** Execution step is logged with search results and timing
**And** Satisfies FR5, FR9, FR24, NFR-R1

---

### Story 3.6: Implement Step 5 - Extract Key Findings

As a developer,
I want the agent to extract structured findings from search results,
So that trends are classified with domain-specific attributes.

**Acceptance Criteria:**

**Given** Steps 2-4 have returned search results
**When** Step 5 executes
**Then** LLM (Claude) analyzes all search results and extracts:
- Fraud trends with classification (name, category, description)
- Severity levels (low, medium, high, critical)
- Detection difficulty (easy, moderate, hard, very_hard)
- Geographic scope (regions affected)
- Affected insurance lines
- Estimated impact
**And** Regulatory findings are separated from general trends
**And** Source tier breakdown is calculated (% tier_1, tier_2, tier_3)
**And** Execution step is logged with extracted findings
**And** Satisfies FR6, FR9, FR19, FR20, FR21, FR22, FR23, FR24, NFR-R1

---

### Story 3.7: Implement Step 6 - Synthesize Report

As a developer,
I want the agent to synthesize a final report with recommendations,
So that actionable insights are provided based on findings.

**Acceptance Criteria:**

**Given** Step 5 has extracted structured findings
**When** Step 6 executes
**Then** LLM (Claude) generates:
- Executive summary (2-3 paragraphs)
- Actionable recommendations (5-7 items)
- Confidence level based on source quality (low, medium, high)
- Data freshness indicator (time range of sources)
- Regulatory disclaimer text
**And** Output validates against FraudTrendsOutput Pydantic model
**And** Execution step is logged
**And** Satisfies FR7, FR9, FR25, FR26, FR27, FR28, FR29, NFR-R1

---

### Story 3.8: Implement JSON Output Generation

As a developer,
I want the agent to generate validated JSON output files,
So that case studies can be stored and imported to the database.

**Acceptance Criteria:**

**Given** All 6 steps have completed successfully
**When** The agent finalizes execution
**Then** A JSON file is created in agents/fraud-trends/output/
**And** Filename format: case_study_{timestamp}.json
**And** JSON structure includes:
- id: UUID
- agent_slug: "fraud-trends"
- title: Generated from topic
- subtitle: Brief description
- input_parameters: FraudTrendsInput as JSON
- output_result: FraudTrendsOutput as JSON
- execution_trace: Array of all 6 execution steps
- display: true
- featured: false
- timestamps: ISO 8601 format
**And** Pydantic validates output_result before writing file
**And** JSON contains NO API keys or credentials
**And** File is saved successfully
**And** Success message printed to console with file path
**And** Satisfies FR8, FR9, FR44, NFR-S3, NFR-R1

---

### Story 3.9: Implement Error Handling and Logging

As a developer,
I want comprehensive error handling throughout the agent workflow,
So that failures are logged clearly without crashing the entire process.

**Acceptance Criteria:**

**Given** The agent is executing any step
**When** An error occurs (API failure, validation error, network timeout)
**Then** Error is caught with try/except blocks
**And** Error details are logged to console with:
- Step number and name where error occurred
- Error type and message
- Timestamp
**And** Agent attempts graceful degradation where possible:
- Partial search results used if some Tavily calls fail
- Warning logged if confidence is low due to missing data
**And** Agent exits cleanly with non-zero exit code on critical failures
**And** No stack traces leak API keys or credentials
**And** Satisfies FR10, NFR-R1, NFR-S1

---

### Story 3.10: Add Code Documentation and Comments

As a developer,
I want comprehensive documentation for all agent functions,
So that the code is maintainable and serves as a template for future agents.

**Acceptance Criteria:**

**Given** All agent code is written
**When** I review the codebase
**Then** Every public function has docstring with:
- Purpose description
- Args with types
- Returns with type
- Raises (exceptions)
**And** Inline comments explain:
- Domain-specific design decisions (fraud classification logic)
- Why certain source tiers are assigned
- Prompt engineering choices for LLM calls
**And** Complex logic blocks have explanatory comments
**And** Constants file has comments explaining each constant's purpose
**And** Python linting (pylint) score is ≥9.0/10.0
**And** Satisfies FR38, FR41, FR54, NFR-CQ2, NFR-CQ3

---

## Epic 4: Case Study Validation & Database Import

### Story 4.1: Create Database Import Script Structure

As a developer,
I want a Python script that imports case studies to PostgreSQL,
So that validated JSON files can be loaded into the database.

**Acceptance Criteria:**

**Given** The scripts/ directory exists
**When** I create scripts/import-case-studies.py
**Then** Script includes command-line argument parsing for:
- JSON file path or directory
- Database connection string (from environment variable)
**And** Script imports required dependencies:
- psycopg2 for PostgreSQL connection
- json for file parsing
- uuid for ID generation
**And** Script has main execution flow with proper error handling
**And** Script can be run: `python scripts/import-case-studies.py agents/fraud-trends/output/case_study_001.json`
**And** Satisfies FR11, FR48

---

### Story 4.2: Implement Case Study Import Logic

As a developer,
I want the import script to insert case studies to the case_studies table,
So that agent output is persisted in the database.

**Acceptance Criteria:**

**Given** A validated JSON file exists
**When** The import script processes the file
**Then** Script loads JSON and extracts case study data
**And** Script generates UUID for id if not present
**And** Script inserts to case_studies table with all fields:
- id, agent_slug, title, subtitle
- input_parameters (JSONB)
- output_result (JSONB)
- execution_trace (JSONB)
- display, featured, display_order
- created_at, updated_at (current timestamp)
**And** JSONB fields are properly serialized from Python dicts
**And** Database transaction is committed on success
**And** Script prints "✅ Imported case study: {title}" on success
**And** Satisfies FR13, FR15, FR16, FR17, NFR-R2

---

### Story 4.3: Implement Execution Steps Import Logic

As a developer,
I want the import script to insert execution steps to the execution_steps table,
So that complete execution traces are stored with proper foreign key relationships.

**Acceptance Criteria:**

**Given** A case study has been inserted successfully
**When** The script processes execution_trace array
**Then** For each step in execution_trace:
- Script generates UUID for step id
- Script inserts to execution_steps table with:
  - id, case_study_id (FK to case_studies)
  - step_number, step_name, step_type
  - input_summary, output_summary
  - details (JSONB)
  - duration_ms, timestamp
**And** Foreign key constraint is enforced (fails if case_study_id invalid)
**And** All steps are inserted within same database transaction as case study
**And** Script prints "✅ Imported {count} execution steps" on success
**And** Satisfies FR14, FR47, NFR-R3

---

### Story 4.4: Add Pre-Import Validation

As a developer,
I want the import script to validate JSON before database insertion,
So that only valid data is imported.

**Acceptance Criteria:**

**Given** The import script receives a JSON file path
**When** The script begins processing
**Then** Script first calls validate-json.py to verify schema compliance
**And** Script only proceeds to import if validation passes
**And** Script prints clear error message if validation fails:
- "❌ Validation failed for {filename}"
- Pydantic error details
**And** Script exits with code 1 without database connection if validation fails
**And** Satisfies FR12, FR46, NFR-R2

---

### Story 4.5: Implement Batch Import for Multiple Files

As a developer,
I want to import multiple JSON files in a single script execution,
So that I can load all case studies efficiently.

**Acceptance Criteria:**

**Given** Multiple JSON files exist in agents/fraud-trends/output/
**When** I run `python scripts/import-case-studies.py agents/fraud-trends/output/`
**Then** Script discovers all .json files in the directory
**And** Script processes each file sequentially
**And** Script reports success/failure for each file:
- "✅ Imported case_study_001.json"
- "❌ Failed to import case_study_002.json: [error details]"
**And** Script continues processing remaining files if one fails
**And** Script prints final summary:
- "Imported: 4/5 case studies"
- "Failed: 1/5 case studies"
**And** Script exits with code 0 if all succeed, 1 if any fail
**And** Satisfies FR48, NFR-P2

---

### Story 4.6: Add Database Connection Error Handling

As a developer,
I want robust database connection error handling in the import script,
So that failures are reported clearly without data corruption.

**Acceptance Criteria:**

**Given** The import script attempts to connect to PostgreSQL
**When** A database error occurs (connection failure, permission denied, constraint violation)
**Then** Script catches psycopg2 exceptions
**And** Script prints clear error message:
- Connection failures: "❌ Cannot connect to database: [details]"
- Permission errors: "❌ Database permission denied: [details]"
- Constraint violations: "❌ Foreign key constraint failed: [details]"
**And** Script rolls back transaction on any error
**And** Script does not commit partial data
**And** Script exits with non-zero code
**And** No database credentials are leaked in error messages
**And** Satisfies NFR-R2, NFR-R3

---

### Story 4.7: Create Gate 1 Validation Checklist

As a developer,
I want a Gate 1 validation checklist to verify the system works end-to-end,
So that I can make a GO/NO-GO decision on the universal schema pattern.

**Acceptance Criteria:**

**Given** The project root directory exists
**When** I create GATE_1_CHECKLIST.md
**Then** Checklist includes validation items:
- [ ] 5 case studies generated successfully (different fraud topics)
- [ ] All 5 JSON files validate against Pydantic schema
- [ ] All 5 case studies imported to database without errors
- [ ] Database query: `SELECT COUNT(*) FROM case_studies WHERE agent_slug = 'fraud-trends'` returns 5
- [ ] Database query: `SELECT COUNT(*) FROM execution_steps WHERE case_study_id IN (SELECT id FROM case_studies WHERE agent_slug = 'fraud-trends')` returns 30 (5 cases × 6 steps)
- [ ] Foreign key constraints enforced (try inserting orphaned step)
- [ ] JSONB fields queryable (test: `SELECT output_result->>'executive_summary' FROM case_studies LIMIT 1`)
- [ ] Type consistency verified (Python Pydantic ↔ TypeScript ↔ Database)
- [ ] Performance: Average agent execution ≤60 seconds
- [ ] Performance: Average import time ≤10 seconds per case study
**And** Each checklist item has validation command or test procedure
**And** Satisfies FR50

---

## Epic 5: REST API for Case Study Access

### Story 5.1: Create API Route Structure

As a developer,
I want to create the Next.js API route for fetching case studies by agent slug,
So that portfolio visitors can retrieve agent data via REST API.

**Acceptance Criteria:**

**Given** The website/app/api/ directory exists
**When** I create the API route file structure
**Then** File path exists: website/app/api/agents/[slug]/case-studies/route.ts
**And** Route exports a GET handler function
**And** Handler receives request with slug parameter from URL path
**And** TypeScript types are imported from @/lib/types
**And** Database pool is imported from @/lib/db
**And** Route can be accessed at: GET /api/agents/fraud-trends/case-studies
**And** Satisfies AR17

---

### Story 5.2: Implement Case Study Query Logic

As a developer,
I want the API route to query case studies from PostgreSQL,
So that agent data is returned from the database.

**Acceptance Criteria:**

**Given** A GET request is made to /api/agents/{slug}/case-studies
**When** The handler executes the database query
**Then** SQL query is executed:
- `SELECT * FROM case_studies WHERE agent_slug = $1 AND display = TRUE ORDER BY display_order, created_at DESC`
**And** Query uses parameterized values (not string concatenation)
**And** Results are fetched as array of case study objects
**And** For each case study, execution_steps are queried:
- `SELECT * FROM execution_steps WHERE case_study_id = $1 ORDER BY step_number`
**And** Execution steps are attached to each case study as execution_trace array
**And** JSONB fields (input_parameters, output_result) are parsed as JSON objects
**And** Satisfies FR18, FR30, FR31

---

### Story 5.3: Implement API Response Formatting

As a developer,
I want the API to return standardized JSON responses,
So that frontend can reliably parse the data.

**Acceptance Criteria:**

**Given** The database query has returned results
**When** The handler formats the response
**Then** Response JSON structure matches AR18 format:
```typescript
{
  "agent_slug": string,
  "case_studies": CaseStudy<FraudTrendsInput, FraudTrendsOutput>[],
  "total_count": number,
  "execution_trace_included": boolean
}
```
**And** HTTP status code 200 is returned
**And** Content-Type header is application/json
**And** Response validates against TypeScript types (no type errors)
**And** Satisfies AR18, FR35, FR49, NFR-CQ1

---

### Story 5.4: Implement Agent Slug Validation

As a developer,
I want the API to validate agent slugs and return 404 for invalid slugs,
So that only valid agent data is queried.

**Acceptance Criteria:**

**Given** A GET request is made with an agent slug parameter
**When** The handler validates the slug
**Then** If slug is not in valid agents list (fraud-trends, stock-monitor, house-finder, article-editor, gita-guide):
- Return HTTP 404 Not Found
- Response body matches error format:
```typescript
{
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "Agent 'invalid-slug' not found",
    "details": {
      "valid_agents": ["fraud-trends", "stock-monitor", "house-finder", "article-editor", "gita-guide"]
    }
  }
}
```
**And** If slug is valid, proceed with database query
**And** Satisfies FR33, FR34, AR19, AR20

---

### Story 5.5: Implement Database Error Handling

As a developer,
I want the API to handle database errors gracefully,
So that server errors are reported without exposing sensitive information.

**Acceptance Criteria:**

**Given** The API route attempts to query the database
**When** A database error occurs (connection failure, query error, timeout)
**Then** Error is caught in try/catch block
**And** HTTP 500 Internal Server Error is returned
**And** Response body matches error format:
```typescript
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to retrieve case studies",
    "details": {}
  }
}
```
**And** No database credentials or sensitive paths are exposed in error message
**And** Error is logged to server console with full details (for debugging)
**And** Satisfies FR32, FR34, FR37, AR19, AR20, NFR-R4

---

### Story 5.6: Implement Empty Results Handling

As a developer,
I want the API to handle cases where no case studies exist for an agent,
So that valid empty responses are returned (not errors).

**Acceptance Criteria:**

**Given** A valid agent slug is provided but no case studies exist in the database
**When** The database query returns zero results
**Then** HTTP 200 OK is returned (not 404)
**And** Response body includes:
```typescript
{
  "agent_slug": "fraud-trends",
  "case_studies": [],
  "total_count": 0,
  "execution_trace_included": true
}
```
**And** This is a success response (empty array is valid)
**And** Satisfies FR35

---

### Story 5.7: Add API Route TypeScript Linting

As a developer,
I want the API route code to pass ESLint with zero errors,
So that code quality standards are met.

**Acceptance Criteria:**

**Given** The API route code is complete
**When** I run `npm run lint` in the website/ directory
**Then** ESLint shows zero errors for route.ts
**And** No TypeScript compilation errors exist
**And** All imports are correctly resolved
**And** Unused variables are removed
**And** Code follows Next.js App Router best practices
**And** Satisfies FR39, NFR-CQ1

---

### Story 5.8: Test API Performance

As a developer,
I want to verify the API meets performance requirements,
So that response times are acceptable for portfolio visitors.

**Acceptance Criteria:**

**Given** The API route is deployed and database contains case studies
**When** I make GET requests to /api/agents/fraud-trends/case-studies
**Then** Response time is ≤2 seconds for all requests (NFR-P3)
**And** Performance is measured with:
- Local development: `time curl http://localhost:3000/api/agents/fraud-trends/case-studies`
- Production (Vercel): Browser DevTools Network tab or curl with timing
**And** Performance results are documented in GATE_1_CHECKLIST.md
**And** If performance exceeds 2 seconds, query optimization is needed (add indexes, optimize JSONB access)
**And** Satisfies NFR-P3

---

## Epic 6: Deployment & Gate 1 Validation

### Story 6.1: Generate 5 Fraud Trends Case Studies

As a developer,
I want to generate 5 diverse case studies on different fraud topics,
So that I can validate the agent works across various use cases.

**Acceptance Criteria:**

**Given** The Fraud Trends agent is fully implemented and tested
**When** I execute the agent 5 times with different topics
**Then** 5 case studies are generated successfully:
1. Auto Insurance Fraud Trends (2024-2025)
2. Property Insurance Fraud After Climate Events
3. Digital and Synthetic Identity Fraud
4. Organized Fraud Rings and Schemes
5. Technology and AI in Fraud Detection
**And** Each execution completes in ≤60 seconds (NFR-P1)
**And** Each generates a valid JSON file in agents/fraud-trends/output/
**And** All 5 JSON files pass validation: `python scripts/validate-json.py agents/fraud-trends/output/*.json`
**And** No errors or crashes occur during execution
**And** Agent demonstrates handling different regions, time ranges, and focus areas
**And** Satisfies AR26, NFR-P1

---

### Story 6.2: Import All Case Studies to Production Database

As a developer,
I want to import all 5 case studies to the production PostgreSQL database,
So that the data is available for the API.

**Acceptance Criteria:**

**Given** 5 validated JSON files exist
**When** I run the import script on production database
**Then** Command executes: `python scripts/import-case-studies.py agents/fraud-trends/output/`
**And** All 5 case studies import successfully without errors
**And** Database contains 5 case_studies records: `SELECT COUNT(*) FROM case_studies WHERE agent_slug = 'fraud-trends'` returns 5
**And** Database contains 30 execution_steps records: `SELECT COUNT(*) FROM execution_steps` returns 30 (5 × 6 steps)
**And** Import completes in ≤50 seconds total (≤10 seconds per case study per NFR-P2)
**And** All JSONB fields are properly stored and queryable
**And** Foreign key relationships are intact
**And** Satisfies AR26, NFR-P2

---

### Story 6.3: Configure Vercel Environment Variables

As a developer,
I want to configure environment variables in Vercel dashboard,
So that the deployed API can connect to the production database.

**Acceptance Criteria:**

**Given** I have access to Vercel project dashboard
**When** I configure environment variables
**Then** DATABASE_URL is set with production Neon connection string
**And** Variable is marked as sensitive (encrypted)
**And** Variable is available in production environment
**And** Variable can be accessed by serverless functions via process.env.DATABASE_URL
**And** Local .env.local is NOT committed to git
**And** Vercel deployment uses dashboard-configured variables (not .env files)
**And** Satisfies AR16, AR26

---

### Story 6.4: Deploy Next.js API to Vercel

As a developer,
I want to deploy the Next.js API to Vercel production,
So that the API is publicly accessible.

**Acceptance Criteria:**

**Given** The website/ code is complete and tested locally
**When** I run `vercel deploy --prod` or push to main branch
**Then** Vercel builds the Next.js application successfully
**And** No build errors or TypeScript compilation errors occur
**And** API route is deployed and accessible at: https://{project}.vercel.app/api/agents/fraud-trends/case-studies
**And** API returns case studies from production database
**And** HTTP responses match expected format (200 with case studies array)
**And** Error responses work correctly (404 for invalid slugs)
**And** Performance meets requirements (≤2 seconds response time)
**And** Deployment URL is documented
**And** Satisfies AR26, AR27

---

### Story 6.5: Execute SECURITY_CHECKLIST.md Validation

As a developer,
I want to validate all security requirements before making the repository public,
So that no secrets are exposed.

**Acceptance Criteria:**

**Given** SECURITY_CHECKLIST.md exists with all validation items
**When** I execute each checklist item
**Then** All items pass validation:
- ✅ .env files are gitignored (verified in .gitignore)
- ✅ Git history scan: `git log --all --full-history -- "*/.env"` returns no results
- ✅ JSON output files contain no API keys (manual inspection of all 5 files)
- ✅ Database connection strings use environment variables only (code review)
- ✅ .env.example files contain only placeholders (verified)
- ✅ No hardcoded secrets in Python or TypeScript code (code review + grep for "sk-ant", "tvly-")
**And** Checklist file is updated with ✅ marks for all passing items
**And** Repository is safe to make public
**And** Satisfies NFR-S2, NFR-S4

---

### Story 6.6: Execute GATE_1_CHECKLIST.md Validation

As a developer,
I want to execute the Gate 1 validation checklist,
So that I can verify the universal schema pattern works end-to-end.

**Acceptance Criteria:**

**Given** GATE_1_CHECKLIST.md exists with all validation items
**When** I execute each checklist item
**Then** All items pass validation:
- ✅ 5 case studies generated successfully
- ✅ All 5 JSON files validate against Pydantic schema
- ✅ All 5 case studies imported to database without errors
- ✅ Database query confirms 5 case_studies records
- ✅ Database query confirms 30 execution_steps records
- ✅ Foreign key constraints enforced (test by attempting orphaned insert)
- ✅ JSONB fields queryable (test executive_summary extraction)
- ✅ Type consistency verified (Python ↔ TypeScript ↔ Database)
- ✅ Performance: Agent execution ≤60 seconds
- ✅ Performance: Import ≤10 seconds per case study
- ✅ Performance: API response ≤2 seconds
**And** Checklist file is updated with ✅ marks and actual performance measurements
**And** Satisfies AR27

---

### Story 6.7: Make GO/NO-GO Decision on Universal Schema

As a developer,
I want to evaluate the Gate 1 results and make a GO/NO-GO decision,
So that I know whether to proceed with the remaining 4 agents or pivot the architecture.

**Acceptance Criteria:**

**Given** GATE_1_CHECKLIST.md is 100% complete with all items passing
**When** I review the validation results
**Then** GO decision criteria are met:
- Universal schema successfully stored Fraud Trends data without modifications
- JSONB flexibility handled agent-specific output structure
- Type consistency was maintainable (Python ↔ TypeScript ↔ Database)
- Performance requirements met (agent ≤60s, import ≤10s, API ≤2s)
- No schema changes were needed during implementation
- Foreign key relationships work correctly
- Execution traces stored completely
**And** Decision is documented in GATE_1_CHECKLIST.md with rationale
**And** If GO: Proceed to implement Stock Monitor agent (Gate 1.5)
**And** If NO-GO: Document what schema changes would be needed and reassess architecture
**And** Satisfies AR27, AR28

---

### Story 6.8: Document Deployment Process

As a developer,
I want deployment documentation for future reference,
So that the process can be repeated for updates or additional agents.

**Acceptance Criteria:**

**Given** The deployment is successful
**When** I create deployment documentation
**Then** Documentation includes:
- Agent execution steps (how to generate case studies)
- Validation steps (how to validate JSON outputs)
- Import steps (how to import to database)
- Vercel deployment steps (environment variables, deploy command)
- Testing steps (how to test API endpoints)
- Performance benchmarking procedures
- Troubleshooting common issues
**And** Documentation is added to README.md or DEPLOYMENT.md
**And** Instructions are clear enough for someone to repeat the process
**And** Satisfies AR26, AR28
