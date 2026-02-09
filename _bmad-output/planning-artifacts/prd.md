---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
workflowStatus: 'complete'
completedAt: '2025-02-09'
inputDocuments:
  - /Volumes/External/AIAgents/_bmad-output/planning-artifacts/product-brief-AIAgents-2025-02-08.md
  - /Volumes/External/AIAgents/docs/01-fraud-trends-agent.md
  - /Volumes/External/AIAgents/docs/ARCHITECTURE_REVIEW.md
  - /Volumes/External/AIAgents/docs/DATA_SOURCING_STRATEGY.md
  - /Volumes/External/AIAgents/docs/BMAD_INTEGRATION_PLAN.md
workflowType: 'prd'
briefCount: 1
researchCount: 0
brainstormingCount: 0
projectDocsCount: 4
classification:
  projectType: 'api_backend'
  domain: 'insuretech'
  complexity: 'high'
  projectContext: 'brownfield'
  scope: 'proof_of_concept_validation'
---

# Product Requirements Document - Fraud Trends Investigator

**Author:** Sunil
**Date:** 2025-02-08

## Success Criteria

### User Success

**Functional Success:**
- ✅ Agent runs end-to-end: All 6 steps execute without errors
- ✅ Output validation: JSON matches TypeScript types exactly, validates against schema
- ✅ Database integration: Import works flawlessly, data queries correctly
- ✅ Execution transparency: Complete trace with timing, inputs, outputs for every step
- ✅ Repeatability: Can generate 5 different case studies with consistent quality
- ✅ API endpoint: Returns data correctly for frontend consumption

**Code Quality Success (Public Repository Standards):**
- ✅ **Clean code:** Well-structured, readable, professional-grade Python and TypeScript
- ✅ **Comprehensive comments:** Every function, complex logic, and design decision documented
- ✅ **Clear naming conventions:** Descriptive variable/function names that reveal intent
- ✅ **Immutable constants:** All fixed values (database field names, agent slugs, step types) clearly marked as constants with UPPER_CASE or `as const`
- ✅ **ESLint/Linting clean:** Zero linting errors, follows TypeScript/Python best practices
- ✅ **Type safety:** Full TypeScript strict mode, Python type hints throughout

**Security & Public Repository Success:**
- ✅ **Zero secrets in git:** All API keys, database credentials in .env (gitignored)
- ✅ **Security checklist passed:** SECURITY_CHECKLIST.md 100% validated
- ✅ **.gitignore comprehensive:** No .env files, no output with secrets, no node_modules
- ✅ **Clean git history:** No accidentally committed secrets, proper commit messages
- ✅ **Documentation complete:** README with setup instructions, API key requirements

**Architectural Success (The "Aha!" Moment):**
- ✅ **Simplicity validated:** The 6-step workflow is clear, logical, and easy to understand
- ✅ **Immutable schema works:** Database field names handle Fraud Trends data perfectly
- ✅ **JSONB flexibility proven:** Agent-specific data structures fit in universal schema
- ✅ **Type consistency:** Python Pydantic models ↔ TypeScript types ↔ Database schema all align
- ✅ **Replicability confirmed:** Process is clear enough to replicate for 4 more agents
- ✅ **Go/No-Go decision:** Pass Gate 1 validation - proceed to build remaining agents

### Business Success

**Architecture Validation:**
- ✅ **No schema changes needed:** Database design handles Fraud Trends without modifications
- ✅ **Dev velocity proven:** Pattern is clear and replicable for remaining 4 agents
- ✅ **Public-ready codebase:** Repository demonstrates professional software practices to recruiters
- ✅ **Portfolio differentiator:** Code quality proves "production-ready, not toy project"

**Proof-of-Concept Completion:**
- Complete all 5 Fraud Trends case study runs successfully
- Pass Gate 1 validation from ARCHITECTURE_REVIEW.md
- Proceed with confidence to build remaining 4 agents

### Technical Success

**Execution Metrics:**
- Agent completes all 5 case study runs without manual intervention
- 100% JSON schema validation pass rate
- Database import success rate: 100% (all 5 case studies)
- API response matches expected TypeScript types: 100%
- Execution trace completeness: All 6 steps captured for every run

**Code Quality Metrics:**
- ESLint errors: 0
- Python linting (pylint/flake8) errors: 0
- TypeScript strict mode: Enabled with 0 errors
- Code comments coverage: Every public function documented
- Immutable constants: All database field names, slugs, step types marked as const

**Security Validation:**
- SECURITY_CHECKLIST.md: 100% passed
- Git history scan: 0 secrets detected
- .env file: Properly gitignored, .env.example exists with placeholders
- Output JSON files: Safe to commit (no API keys or credentials)

### Measurable Outcomes

**Validation Gates (from ARCHITECTURE_REVIEW.md):**

**Gate 1: After Fraud Trends Agent**
- ✅ GO Criteria:
  - Agent runs and generates valid JSON output
  - JSON imports to case_studies table successfully
  - Data queries correctly from database
  - Execution steps populate in execution_steps table
  - No schema issues or type mismatches
- 🛑 NO-GO Criteria:
  - Schema modifications needed
  - Type mismatches between Python/TypeScript/Database
  - Import failures or data integrity issues

**Success Timeline:**
- Fraud Trends agent functional: Target completion
- All 5 case studies generated: Within same development cycle
- Database import validated: Immediately after agent completion
- API endpoint tested: Same day as import validation
- Code quality review: Before marking complete

**Documentation Completeness:**
- README.md: Complete with setup, API keys, usage examples
- Code comments: All complex logic explained inline
- BMad artifacts: Product brief, PRD committed to repository
- Type definitions: Fully documented with TSDoc/Python docstrings
- .env.example: All required environment variables listed

## Product Scope

### MVP - Minimum Viable Product (Proof-of-Concept)

**What MUST work to validate the architecture:**

**1. Fraud Trends Python Agent:**
- ✅ Input handling: Accept FraudTrendsInput (topic, regions, time_range, focus_areas)
- ✅ Step 1: Plan Research - LLM generates research strategy with sub-queries
- ✅ Steps 2-4: Tavily Search - Execute 3 parallel searches (industry, regulatory, academic sources)
- ✅ Step 5: Extract Findings - LLM extracts statistics, trends, expert quotes from sources
- ✅ Step 6: Synthesize Report - LLM generates structured FraudTrendsOutput with executive summary
- ✅ Output generation: Valid JSON matching TypeScript FraudTrendsOutput schema exactly
- ✅ Execution trace: Complete logging of all 6 steps with timing, inputs, outputs, and details

**2. Data Requirements:**
- ✅ Tavily API integration: Web search working, results parsed and filtered
- ✅ Claude API integration: All 3 LLM steps functional (plan, extract, synthesize)
- ✅ Environment variables: Loaded from .env file, validated before execution
- ✅ Error handling: Graceful failures with clear error messages, no crashes

**3. Database Integration:**
- ✅ Import script: Python script reads JSON output, inserts to PostgreSQL (Neon)
- ✅ Schema validation: Data fits universal case_studies table structure
- ✅ Execution steps: All 6 steps inserted into execution_steps table with proper relationships
- ✅ JSONB fields: input_parameters and output_result properly populated with agent-specific data
- ✅ Query validation: Can retrieve data via SQL, data integrity confirmed

**4. API Endpoint (Basic):**
- ✅ `/api/agents/fraud-trends/case-studies` - Returns all Fraud Trends case studies from database
- ✅ Type safety: Response matches TypeScript CaseStudy<FraudTrendsInput, FraudTrendsOutput> type
- ✅ Error handling: Proper HTTP status codes (200, 404, 500)
- ✅ Basic validation: Endpoint tested and working before proceeding to UI

**5. Code Quality & Security (Public Repository Standards):**
- ✅ Linting: ESLint/pylint clean, zero errors across all code files
- ✅ Type safety: TypeScript strict mode enabled, Python type hints throughout
- ✅ Comments: All functions documented with purpose, parameters, return values
- ✅ Constants: Immutable values (AGENT_SLUG, STEP_TYPES, DB_FIELD_NAMES) clearly marked
- ✅ Security: No secrets in code, all credentials in .env (gitignored)
- ✅ Git: Clean history, proper .gitignore, no accidental secret commits

**6. Documentation:**
- ✅ README.md: Setup instructions, API key requirements, usage examples, troubleshooting
- ✅ .env.example: Template with placeholder values for all required variables
- ✅ SECURITY_CHECKLIST.md: Validated and passed before making repository public
- ✅ Code comments: Inline documentation for complex logic and design decisions

**What's explicitly OUT of scope for MVP (Deferred to Phase 2):**
- ❌ UI/Frontend: Next.js website with glass aesthetic (comes after all 5 agents work)
- ❌ Robot animations: Visual step-by-step execution display (Phase 2)
- ❌ Glass UI aesthetic: Frosted, tinted, transparent design system (Phase 2)
- ❌ Advanced error recovery: Retry logic, exponential backoff (future enhancement)
- ❌ Caching: API response caching or result memoization (optimization)
- ❌ Performance optimization: Parallel processing beyond basic implementation
- ❌ More than 5 case studies: Scope is fixed at 5 for proof-of-concept
- ❌ Real-time agent execution: Pre-run only for MVP
- ❌ Other 4 agents: Stock Monitor, Home Finder, Article Enhancer, Gita Guide (after Gate 1 validation)

### Growth Features (Post-MVP, After Gate 1 Validation)

**After proving Fraud Trends architecture works:**
- Build remaining 4 agents using validated pattern
- Add UI layer with Next.js and glass aesthetic
- Implement robot animations for execution trace visualization
- Performance optimization (caching, parallel execution improvements)
- Enhanced error handling with retry logic and better failure recovery
- Monitoring and observability tooling for agent execution
- Additional case studies (expand from 5 to 10+ per agent)

### Vision (Future)

**Long-term possibilities after all 5 agents working and deployed:**
- Real-time agent execution for portfolio visitors (with rate limiting to prevent API abuse)
- Custom query input allowing users to run their own research topics
- Agent comparison dashboard showing performance across different agent types
- Multi-LLM support (GPT-4, Gemini alongside Claude for comparison)
- Open-source community contributions and case study marketplace
- Educational content and tutorials based on agent implementation
- Framework extraction for reusable agent patterns

## User Journeys

### Journey 1: Sunil (Builder) - First Successful Agent Run

**Context:** You've spent weeks designing the architecture on paper. Database schema is ready. TypeScript types are defined. Now it's time to see if the Fraud Trends agent actually works.

**Opening Scene:**

You're sitting at your desk, terminal open. The `agents/fraud-trends/` directory is ready with `agent.py`, `.env` file loaded with API keys. You've double-checked everything. Your heart is beating a bit faster than usual.

```bash
$ python agent.py --topic "Auto Insurance Fraud 2024-2025" --regions "North America"
```

You hit Enter.

**Rising Action:**

The logs start flowing:

```
[INFO] Loading configuration from .env...
[INFO] ✅ Anthropic API key found
[INFO] ✅ Tavily API key found
[INFO] Starting Fraud Trends Investigator...
[INFO] Topic: Auto Insurance Fraud 2024-2025
[INFO] Regions: North America

[STEP 1/6] Planning research strategy...
[INFO] LLM generating research plan...
[INFO] ✅ Research plan complete (3.2s)
      - Industry sources: 3 queries
      - Regulatory sources: 2 queries
      - Academic sources: 2 queries

[STEP 2/6] Searching industry sources...
[INFO] Executing Tavily search: "auto insurance fraud trends 2024 North America"...
[INFO] ✅ Found 12 sources (2.8s)

[STEP 3/6] Searching regulatory sources...
[INFO] Executing Tavily search: "insurance fraud regulations 2024 NAIC FBI"...
[INFO] ✅ Found 8 sources (2.1s)

[STEP 4/6] Searching academic sources...
[INFO] Executing Tavily search: "vehicle fraud detection research 2024"...
[INFO] ✅ Found 6 sources (2.5s)

[STEP 5/6] Extracting key findings...
[INFO] LLM analyzing 26 sources...
[INFO] ✅ Extracted 15 key findings (5.7s)

[STEP 6/6] Synthesizing report...
[INFO] LLM generating executive summary and recommendations...
[INFO] ✅ Report complete (4.1s)

[SUCCESS] ✅ Case study generated successfully!
[INFO] Output saved to: output/case_study_001.json
[INFO] Total execution time: 20.4s
[INFO] Execution trace saved with 6 steps
```

**Climax:**

You see that final line: `✅ SUCCESS: Output saved to output/case_study_001.json`

Your hands are actually shaking a little as you open the file:

```json
{
  "agent_slug": "fraud-trends",
  "timestamp": "2025-02-09T18:45:32Z",
  "input_parameters": {
    "topic": "Auto Insurance Fraud 2024-2025",
    "regions": ["North America"],
    ...
  },
  "output_result": {
    "executive_summary": "Auto insurance fraud in North America...",
    "key_trends": [
      {
        "trend_name": "Rise of Staged Accidents",
        "severity": "high",
        ...
      }
    ],
    ...
  },
  "execution_steps": [
    {
      "step_number": 1,
      "step_name": "Plan Research",
      "duration_ms": 3200,
      ...
    }
  ]
}
```

It's... perfect. The JSON structure matches your TypeScript types exactly. Every field is there. No API keys leaked in the output. The execution trace is complete.

**Resolution:**

You run the database import script:

```bash
$ python scripts/import-case-studies.py output/case_study_001.json
[INFO] Connecting to PostgreSQL (Neon)...
[INFO] ✅ Connected
[INFO] Parsing case_study_001.json...
[INFO] ✅ Parsed successfully
[INFO] Inserting into case_studies table...
[INFO] ✅ Inserted case_study (id: 1)
[INFO] Inserting 6 execution steps...
[INFO] ✅ All steps inserted
[SUCCESS] Import complete!
```

You open your database client and query:

```sql
SELECT * FROM case_studies WHERE agent_slug = 'fraud-trends';
```

There it is. The data is in the database. The JSONB fields are populated. The execution steps are linked correctly.

**Emotional Arc:**

- **Start:** Nervous, uncertain ("Will this even work?")
- **Middle:** Watching logs in real-time, cautiously optimistic
- **Climax:** Relief and excitement when you see `✅ SUCCESS`
- **End:** Confidence and validation ("The architecture works. I can replicate this.")

**What This Journey Validates:**
- ✅ Agent workflow executes end-to-end
- ✅ JSON output is valid and complete
- ✅ Database import works without schema changes
- ✅ Execution trace is captured correctly
- ✅ Architecture is sound

---

### Journey 2: Sunil (Validator) - Gate 1 Validation Checklist

**Context:** The Fraud Trends agent works. You've run it 5 times on different topics. All 5 case studies are in the database. Now it's time to systematically validate against Gate 1 criteria from ARCHITECTURE_REVIEW.md before proceeding to build the other 4 agents.

**Opening Scene:**

You open ARCHITECTURE_REVIEW.md and scroll to the Gate 1 section. You have a checklist printed out. You're methodical now—this is about proving the architecture is replicable, not just functional.

**Rising Action:**

**✅ Functional Checks:**

1. **Agent runs and generates valid JSON output**
   - You run: `python scripts/validate-json.py output/*.json`
   - Result: ✅ All 5 case studies validate against FraudTrendsOutput schema

2. **JSON imports to case_studies table successfully**
   - You check: `SELECT COUNT(*) FROM case_studies WHERE agent_slug = 'fraud-trends';`
   - Result: ✅ 5 rows

3. **Data queries correctly from database**
   - You test: `SELECT input_parameters->>'topic' FROM case_studies WHERE agent_slug = 'fraud-trends';`
   - Result: ✅ All 5 topics returned correctly

4. **Execution steps populate in execution_steps table**
   - You check: `SELECT COUNT(*) FROM execution_steps WHERE case_study_id IN (SELECT id FROM case_studies WHERE agent_slug = 'fraud-trends');`
   - Result: ✅ 30 steps (6 steps × 5 case studies)

5. **No schema issues or type mismatches**
   - You review: Database schema vs. TypeScript types vs. Pydantic models
   - Result: ✅ Perfect alignment

**✅ Code Quality Checks:**

6. **ESLint clean**
   - You run: `npm run lint` in website/
   - Result: ✅ 0 errors

7. **Python linting clean**
   - You run: `pylint agents/fraud-trends/agent.py`
   - Result: ✅ Score: 9.8/10 (acceptable)

8. **Code comments**
   - You manually review: agent.py and import script
   - Result: ✅ Every function documented

9. **Immutable constants marked**
   - You grep: `AGENT_SLUG`, `STEP_TYPES`, `DB_FIELD_NAMES`
   - Result: ✅ All marked as constants with clear naming

**✅ Security Audit:**

10. **No secrets in git**
    - You run: `git log --all --full-history -- "*/.env"`
    - Result: ✅ No .env files in history

11. **SECURITY_CHECKLIST.md passed**
    - You go through every line of the checklist
    - Result: ✅ 100% passed

12. **.gitignore comprehensive**
    - You check: .env, output/*.json, node_modules all ignored
    - Result: ✅ All critical files ignored

**Climax:**

You make the Go/No-Go decision. You write in your notes:

```
GATE 1 VALIDATION - 2025-02-09
================================

Functional: ✅ PASS (all 12 checks passed)
Code Quality: ✅ PASS (ESLint clean, constants marked)
Security: ✅ PASS (no secrets, checklist 100%)

DECISION: ✅ GO

Next Steps:
- Replicate pattern for Stock Monitor agent
- Validate replicability (Gate 1.5 - informal check)
- Proceed to remaining 3 agents if Stock Monitor works on first try
```

**Resolution:**

You commit everything with confidence:

```bash
git add .
git commit -m "✅ Gate 1 validation complete - Fraud Trends agent production-ready

- All 5 case studies generated and imported successfully
- JSON schema validation: 100% pass rate
- Database integration: No schema changes needed
- Code quality: ESLint clean, comments comprehensive
- Security: SECURITY_CHECKLIST.md 100% validated
- Architecture: Confirmed replicable for remaining 4 agents

Gate 1 Status: GO - Proceed to Stock Monitor agent"
```

**Emotional Arc:**

- **Start:** Methodical, thorough ("No cutting corners")
- **Middle:** Systematic validation, checking every item
- **Climax:** Confidence as every check passes
- **End:** Validated and ready to scale ("This architecture works. Let's build the rest.")

**What This Journey Validates:**
- ✅ Gate 1 criteria are comprehensive and measurable
- ✅ Code quality standards are enforced systematically
- ✅ Security checklist prevents accidental exposure
- ✅ Architecture is validated beyond "it works"—it's replicable

---

### Journey 3: Sunil (Replicator) - Using Fraud Trends as Template for Stock Monitor

**Context:** Fraud Trends passed Gate 1. Now it's time to test the ultimate validation: Can you replicate this pattern for a completely different agent type? Stock Monitor is agent #2. If this works without schema changes, you've proven the architecture.

**Opening Scene:**

You create a new directory: `agents/stock-monitor/`. You copy `agents/fraud-trends/agent.py` to use as a template. You open the Stock Monitor spec from `docs/02-stock-monitor-agent.md`.

You're nervous again, but for a different reason. This is the test of replicability.

**Rising Action:**

**Step 1: Identify What Stays the Same**

You realize:
- ✅ The 6-step workflow structure (Plan → Search → Search → Search → Extract → Synthesize)
- ✅ The execution trace logic (same pattern)
- ✅ The JSON output structure (CaseStudy<Input, Output>)
- ✅ The database import script (works for any agent!)
- ✅ The constants pattern (AGENT_SLUG, STEP_TYPES)

**Step 2: Identify What Changes**

You identify:
- ❌ Input schema: `StockMonitorInput` (ticker, date_range, event_types)
- ❌ Output schema: `StockMonitorOutput` (events detected, price correlations)
- ❌ Search queries: Stock news, SEC filings, analyst reports (not fraud topics)
- ❌ LLM prompts: Event detection focus (not fraud research)

**Step 3: Make the Changes**

You work systematically:

1. Update `AGENT_SLUG = "stock-monitor"` (1 line change)
2. Update Pydantic models for StockMonitorInput/Output (new models, same validation pattern)
3. Update search queries in Steps 2-4 (different Tavily queries, same API calls)
4. Update LLM prompts in Steps 1, 5, 6 (different prompts, same LangChain structure)
5. Test with: `python agent.py --ticker "AAPL" --date-range "2024-12-01,2025-01-31"`

**Climax:**

The agent runs. You watch the logs:

```
[INFO] Starting Stock Monitor...
[STEP 1/6] Planning event detection strategy...
[INFO] ✅ Detection plan complete (2.9s)

[STEP 2/6] Searching stock news sources...
[INFO] ✅ Found 15 sources (3.1s)

[STEP 3/6] Searching SEC filings...
[INFO] ✅ Found 8 sources (2.7s)

[STEP 4/6] Searching analyst reports...
[INFO] ✅ Found 6 sources (2.3s)

[STEP 5/6] Extracting key events...
[INFO] ✅ Extracted 12 events (4.8s)

[STEP 6/6] Synthesizing impact report...
[INFO] ✅ Report complete (3.6s)

[SUCCESS] ✅ Case study generated successfully!
[INFO] Output saved to: output/case_study_001.json
```

It worked. On the first try.

**Resolution:**

You run the database import script:

```bash
$ python scripts/import-case-studies.py agents/stock-monitor/output/case_study_001.json
[INFO] Connecting to PostgreSQL (Neon)...
[INFO] ✅ Connected
[INFO] Parsing case_study_001.json...
[INFO] ✅ Parsed successfully
[INFO] Agent slug detected: stock-monitor
[INFO] Inserting into case_studies table...
[INFO] ✅ Inserted case_study (id: 6)
[INFO] Inserting 6 execution steps...
[INFO] ✅ All steps inserted
[SUCCESS] Import complete!
```

You query the database:

```sql
SELECT agent_slug, COUNT(*) FROM case_studies GROUP BY agent_slug;
```

Result:
```
agent_slug      | count
----------------|------
fraud-trends    | 5
stock-monitor   | 1
```

No schema changes. The universal schema handled both agents perfectly.

**Emotional Arc:**

- **Start:** Uncertain ("What if this doesn't work as smoothly?")
- **Middle:** Methodical implementation, trusting the pattern
- **Climax:** Validation when it works on first try
- **End:** Efficient and confident ("I can build the remaining 3 agents quickly")

**What This Journey Validates:**
- ✅ Architecture is replicable across different agent types
- ✅ Database schema is truly universal (JSONB flexibility works)
- ✅ Development velocity is proven (Stock Monitor took ~2 hours, not days)
- ✅ Pattern is clear enough to follow systematically
- ✅ Confidence to proceed to remaining 3 agents

---

## Journey Requirements Summary

Based on the three user journeys above, the Fraud Trends proof-of-concept must provide:

**Development Tools & Scripts:**
1. **Agent runner** (`agents/fraud-trends/agent.py`) with CLI arguments and comprehensive logging
2. **Database import script** (`scripts/import-case-studies.py`) with validation and error handling
3. **JSON validation script** (`scripts/validate-json.py`) to verify output matches schema
4. **Linting scripts** for both Python (pylint/flake8) and TypeScript (ESLint)

**Code Quality Standards:**
1. **Comprehensive comments** on every function with purpose, parameters, return values
2. **Immutable constants** clearly marked (AGENT_SLUG, STEP_TYPES, DB_FIELD_NAMES in UPPER_CASE)
3. **Type hints** throughout Python code, TypeScript strict mode enabled
4. **Descriptive naming** that reveals intent without needing comments
5. **Zero linting errors** before considering work complete

**Documentation Requirements:**
1. **README.md** with setup instructions, API key requirements, usage examples
2. **.env.example** with placeholder values for all required environment variables
3. **SECURITY_CHECKLIST.md** validated before making repository public
4. **Gate 1 validation document** with measurable pass/fail criteria
5. **Inline code documentation** explaining complex logic and design decisions

**Validation Framework:**
1. **JSON schema validation** ensuring output matches TypeScript types exactly
2. **Database integrity checks** confirming data queries correctly
3. **Execution trace completeness** verification (all 6 steps captured)
4. **Security audit tools** to scan git history for accidental secret commits
5. **Replicability test** using Fraud Trends as template for second agent

**Error Handling Requirements:**
1. **Graceful API failures** with clear error messages (no crashes)
2. **Missing environment variable detection** with helpful setup instructions
3. **Database connection error handling** with retry guidance
4. **JSON validation errors** with specific field-level feedback
5. **Execution step failures** logged with context for debugging

## Domain-Specific Requirements

### Insuretech Domain Context

**Classification:**
- **Domain:** Insuretech (Insurance Technology)
- **Complexity:** High
- **Focus Area:** Fraud research and trend analysis
- **Scope:** Research tool for portfolio demonstration (not production claims processing)

### Compliance & Regulatory Requirements

**Regulatory Acknowledgment:**
- ✅ **Disclaimer required:** All output JSON files must include a disclaimer noting:
  - "This research is for educational and demonstration purposes only"
  - "Not intended as regulatory advice or compliance guidance"
  - "Does not constitute professional insurance fraud investigation services"
- ✅ **Data handling:** Agent processes only public web sources, no PII or sensitive claims data
- ✅ **Geographic compliance:** Research can cover multiple jurisdictions without triggering specific state insurance licensing requirements (research-only use case)

**Regulatory Source Prioritization:**
- ✅ Prioritize official regulatory sources in research:
  - National Association of Insurance Commissioners (NAIC)
  - Coalition Against Insurance Fraud (CAIF)
  - FBI Insurance Fraud statistics and reports
  - State insurance department publications
  - Department of Justice insurance fraud enforcement actions

**Documentation for Public Repository:**
- ✅ **README.md must include:**
  - Statement: "This tool does not process real insurance claims data or PII"
  - Intended use: "Research and demonstration purposes only"
  - Data source acknowledgment: "Uses public web sources via Tavily API - subject to source availability and accuracy limitations"
  - No claims of regulatory compliance or professional fraud investigation capabilities

### Source Credibility & Prioritization

**Source Weighting Strategy:**

The agent must implement prioritized source credibility:

1. **Tier 1 (Highest Priority):**
   - Government and regulatory agencies (NAIC, FBI, state insurance departments)
   - Official industry associations (Coalition Against Insurance Fraud)
   - Academic research from insurance/actuarial programs

2. **Tier 2 (Medium Priority):**
   - Insurance industry publications (Insurance Journal, National Underwriter)
   - Major insurers' fraud prevention reports
   - Actuarial societies and research organizations

3. **Tier 3 (Supporting Context):**
   - General business news (WSJ, Reuters, Bloomberg)
   - Technology news (fraud detection technologies)
   - Regional news (for geographic-specific fraud trends)

**Implementation Requirement:**
- Search queries in Steps 2-4 must explicitly target Tier 1 and Tier 2 sources
- LLM synthesis in Step 6 must weight Tier 1 sources more heavily in conclusions
- Source citations in output must identify source type/tier

### Enhanced Output Schema Requirements

**Fraud Findings Classification:**

The `FraudTrendsOutput` schema must support domain-specific categorization:

```typescript
interface FraudFinding {
  // Existing fields
  trend_name: string;
  description: string;

  // REQUIRED DOMAIN-SPECIFIC FIELDS:

  // Fraud taxonomy
  fraud_type: "staged_accident" | "soft_fraud" | "hard_fraud" | "organized_ring" | "medical_billing" | "property_damage" | "identity_fraud" | "other";

  // Severity classification
  severity: "low" | "medium" | "high" | "critical";
  severity_rationale: string; // Why this severity level?

  // Geographic specificity
  geographic_scope: "national" | "regional" | "state_specific" | "local";
  affected_regions: string[]; // e.g., ["California", "Florida", "Texas"]

  // Industry segment
  insurance_segments: ("auto" | "property" | "health" | "life" | "commercial" | "workers_comp")[];

  // Detection characteristics
  detection_difficulty: "easy" | "moderate" | "difficult" | "sophisticated";
  detection_rationale: string; // What makes it easy/difficult to detect?

  // Regulatory context
  regulatory_considerations: string; // Any specific regulations or enforcement trends

  // Source credibility
  source_tier_breakdown: {
    tier1_sources: number; // Count of regulatory/academic sources
    tier2_sources: number; // Count of industry sources
    tier3_sources: number; // Count of general news sources
  };
}
```

**Executive Summary Requirements:**

Must include domain-specific context:
- Overall fraud landscape assessment
- Regulatory environment summary (enforcement trends, new regulations)
- Technology impact on fraud patterns
- Geographic hot spots
- Emerging vs. persistent fraud types

### Risk Mitigations (Domain-Specific)

**1. Inaccurate Trend Identification**
- **Risk:** LLM misinterprets data or identifies false fraud trends
- **Mitigation:**
  - Require minimum 3 sources per identified trend (at least 1 Tier 1 source)
  - Include confidence rating based on source agreement
  - Provide source citations with publication dates
- **Validation:** Output must include `confidence_level` field per finding

**2. Outdated Fraud Intelligence**
- **Risk:** Fraud landscape evolves rapidly, research becomes stale quickly
- **Mitigation:**
  - Enforce time_range parameter (default: last 12 months)
  - Include source publication date range in output
  - Timestamp every case study execution
  - Flag if sources are predominantly older than 6 months
- **Validation:** Output includes `source_freshness_assessment`

**3. Sensationalism Bias**
- **Risk:** News sources over-report dramatic fraud cases, under-report systemic issues
- **Mitigation:**
  - Balance across 3 source types (industry, regulatory, academic)
  - Weight Tier 1 regulatory sources more heavily in synthesis
  - Explicitly identify "emerging trends" vs. "persistent patterns"
- **Validation:** Source tier breakdown tracked in output

**4. Regulatory Misinterpretation**
- **Risk:** Agent misrepresents regulatory requirements or enforcement actions
- **Mitigation:**
  - Separate section in output for regulatory findings
  - Direct quotes from regulatory sources when citing regulations
  - Clear attribution to specific agencies (NAIC, FBI, state departments)
  - Include disclaimer: "Regulatory information is for research purposes only"
- **Validation:** `regulatory_findings` as separate array in output schema

**5. Geographic Misapplication**
- **Risk:** Applying fraud trends from one region to another inappropriately
- **Mitigation:**
  - Explicit geographic tagging on all findings
  - Note regional variations in fraud patterns
  - Separate analysis by region when trends differ significantly
- **Validation:** `geographic_scope` and `affected_regions` required on all findings

### Technical Constraints (Domain-Specific)

**Data Privacy & Security:**
- ✅ No PII processing (public sources only)
- ✅ No sensitive insurance claims data (research focus)
- ✅ API keys protected via .env (ANTHROPIC_API_KEY, TAVILY_API_KEY)
- ✅ Output sanitization to ensure no API keys in JSON files
- ✅ Safe to commit outputs to public repository

**Performance Requirements:**
- ✅ Execution time: Target 15-30 seconds per case study (acceptable for research tool)
- ✅ Source gathering: Minimum 20 sources across 3 search types (industry, regulatory, academic)
- ✅ Finding extraction: Minimum 10 distinct fraud findings per case study
- ✅ Source diversity: At least 30% Tier 1 sources in every case study

**Integration Requirements:**
- ✅ Tavily API: Web search for public fraud research sources
- ✅ Claude API: LLM for research planning, extraction, and synthesis
- ✅ PostgreSQL (Neon): Universal case_studies schema with JSONB flexibility
- ✅ TypeScript types: Strict alignment with Python Pydantic models

### Domain Validation Checklist

Before considering Fraud Trends agent complete, validate:

**Functional Domain Requirements:**
- [ ] Disclaimer present in all output JSON files
- [ ] Source tier breakdown calculated and included in output
- [ ] Fraud findings include all required domain-specific fields (fraud_type, severity, detection_difficulty, etc.)
- [ ] Regulatory findings separated and properly attributed
- [ ] Geographic scope explicitly tagged on all findings
- [ ] Confidence levels based on source count and tier

**Code Quality Domain Requirements:**
- [ ] Constants defined for fraud taxonomies (FRAUD_TYPES, SEVERITY_LEVELS, DETECTION_DIFFICULTY)
- [ ] Source tier classification logic clearly documented
- [ ] Insurance industry terminology used correctly in prompts and output
- [ ] Comments explain domain-specific design decisions

**Documentation Domain Requirements:**
- [ ] README.md includes all required disclaimers and use case limitations
- [ ] .env.example documents which API keys are required and why
- [ ] Code comments reference insurance industry concepts where relevant
- [ ] Output schema documentation explains domain-specific fields

**Security Domain Requirements:**
- [ ] No insurance data in outputs (public sources only)
- [ ] API keys never in outputs or database
- [ ] Safe to share outputs publicly (no sensitive information)
- [ ] Repository safe to make public (SECURITY_CHECKLIST.md validated)

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Universal Agent Schema Pattern**

**What's Novel:**
Creating a **single database schema** that can handle **5 completely different agent types** using JSONB flexibility. This is genuinely innovative for agent architectures:

- ✅ **Most agent systems:** Hard-coded schemas per agent type, requiring schema migrations for each new agent
- ✅ **Our approach:** Immutable universal schema (`case_studies` + `execution_steps` tables) that handles any agent type without modifications
- ✅ **Innovation signal:** API composition - composing a universal data structure that works across research agents, detection agents, matching agents, enhancement agents, and conversational agents

**Why It's Different:**
Traditional agent platforms require different database designs for different agent types. This project proves that a universal schema with JSONB flexibility can handle agent diversity without schema churn.

**2. Execution Transparency as First-Class Feature**

**What's Novel:**
Treating **execution traces** as a primary product feature, not debugging metadata:

- ✅ **Most agent demos:** Black box outputs ("here's the result")
- ✅ **Our approach:** Complete step-by-step execution trace with timing, inputs, outputs, and reasoning at every step
- ✅ **Innovation signal:** New protocol - establishing a new pattern for agent observability where transparency is the product

**Why It's Different:**
Portfolio projects usually hide complexity. This approach showcases complexity as a differentiator - demonstrating how to architect agent systems with complete observability.

**3. Pre-Run Case Study Strategy**

**What's Novel:**
Solving the **API cost problem** for portfolio projects in a unique way:

- ✅ **Most agent demos:** Live execution (expensive, rate-limited, unreliable for visitors)
- ✅ **Our approach:** Pre-run case studies with full execution traces, stored in database, served via API (zero API cost in production)
- ✅ **Innovation signal:** Architecture pattern that makes agent portfolios economically viable

**Why It's Different:**
This is a replicable pattern: "How do you demo expensive LLM agents without bankrupting yourself?" Answer: pre-run high-quality case studies, showcase execution transparency, maintain one live agent (Gita Guide) for real-time capability demonstration.

### Market Context & Competitive Landscape

**Similar Approaches:**
- **LangSmith/LangTrace:** Focus on debugging and monitoring, not public showcase or portfolio use
- **Agent frameworks (CrewAI, AutoGPT):** Live execution only, no pre-run strategy for cost management
- **Traditional developer portfolios:** Static code samples, no working agent demos with execution transparency

**Differentiation:**
1. **Universal schema** - proving immutability works across agent archetypes
2. **Execution transparency** - making the "how" as important as the "what"
3. **Economic sustainability** - pre-run strategy makes agent demos viable long-term without ongoing API costs
4. **Gate-based validation** - proving architecture before scaling (methodical, systematic approach)

**Innovation Validation Question:**
Has anyone publicly demonstrated a **universal agent schema** handling 5+ different agent archetypes (research, detection, matching, enhancement, conversational) without schema changes? This specific pattern has not been widely documented as a replicable approach in public portfolios.

### Validation Approach

**How we validate these innovations work:**

**1. Universal Schema Validation (Gate 1 - Primary)**
- ✅ **Test:** Build Fraud Trends agent, import to database
- ✅ **Validation:** No schema changes needed
- ✅ **Gate 1 Success Criteria:** Build Stock Monitor (completely different agent archetype), import to same schema
- ✅ **Proof:** If Stock Monitor works without schema modifications, universal pattern is validated
- 🛑 **No-Go Trigger:** If schema changes are required, document findings and pivot to flexible schema approach

**2. Execution Transparency Validation**
- ✅ **Test:** All 6 steps captured with complete trace (timing, inputs, outputs, LLM reasoning)
- ✅ **Validation:** Can query execution_steps table and reconstruct agent reasoning path
- ✅ **User feedback metric:** Portfolio visitors find execution traces valuable (post-launch qualitative feedback)
- ✅ **Technical validation:** TypeScript types align with Python Pydantic models and database schema

**3. Economic Model Validation**
- ✅ **Test:** Run 5 case studies per agent (5 agents × 5 case studies = 25 total pre-run executions)
- ✅ **Cost calculation:** One-time API cost (Claude + Tavily) vs. unlimited visitor access
- ✅ **Proof:** Website can serve thousands of visitors with zero additional API costs after initial case study generation
- ✅ **Live agent validation:** Gita Guide chat demonstrates real-time capability without undermining pre-run strategy

**4. Replicability Validation (Gate 1.5 - Informal Check)**
- ✅ **Test:** Measure time to build Stock Monitor after Fraud Trends is complete
- ✅ **Success metric:** If Stock Monitor takes <25% of Fraud Trends development time, pattern is proven replicable
- ✅ **Documentation:** Clear template pattern emerges from comparing Fraud Trends and Stock Monitor implementations
- ✅ **Confidence boost:** If replicable, proceed to remaining 3 agents with high velocity

### Risk Mitigation

**Innovation Risk 1: Universal Schema Doesn't Scale to All Agent Types**
- **Risk:** Agent #3, #4, or #5 has data structures that don't fit JSONB approach
- **Mitigation:**
  - Test with Fraud Trends (research agent - complex output) first
  - Validate with Stock Monitor (detection agent - event-based output) second
  - If both work, high confidence for remaining 3 agents (matching, enhancement, conversational)
  - Gate 1 is specifically designed to catch this risk early
- **Fallback:** If schema changes are needed, document as "lessons learned" and pivot to flexible schema with agent-specific extensions
- **Documentation value:** Either outcome produces valuable architectural insights for portfolio narrative

**Innovation Risk 2: Execution Traces Aren't Valuable to Viewers**
- **Risk:** Recruiters and visitors don't care about step-by-step execution details
- **Mitigation:**
  - Make execution trace optional in UI (summary view vs. detailed view toggle)
  - Gather early feedback from developer peers and technical recruiters
  - Even if not publicly featured prominently, traces remain valuable for debugging and architecture demonstration
- **Fallback:** De-emphasize traces in main UI, keep them available in "Technical Details" section
- **Alternative value:** Traces demonstrate systems thinking and debugging capabilities regardless of visitor interest

**Innovation Risk 3: Pre-Run Strategy Appears Less Impressive Than Live Execution**
- **Risk:** Visitors perceive pre-run case studies as "fake" or less technically impressive
- **Mitigation:**
  - Be transparent in UI: "Pre-run case studies demonstrate agent architecture and execution patterns"
  - Emphasize: "I can generate new case studies on demand" with option to request custom topics
  - Include Gita Guide as live chat agent to prove real-time execution capability
  - Highlight cost management as architectural decision, not limitation
- **Fallback:** Add "Request Custom Analysis" feature where visitors can request new case studies (run manually with notification when complete)

**Innovation Risk 4: Pattern Isn't Truly Replicable Across Agent Types**
- **Risk:** Stock Monitor requires significant architectural rework, invalidating replicability claim
- **Mitigation:**
  - Document all changes needed between Fraud Trends and Stock Monitor (becomes "iteration learnings")
  - Gate 1 decision includes explicit "replicability assessment" not just "it works"
  - If replicability partially fails, identify what stayed universal vs. what needed customization
- **Fallback:** Pivot narrative from "universal pattern" to "5 diverse agent implementations showcasing architectural versatility"
- **Portfolio value:** Either outcome demonstrates systems thinking - successful pattern or thoughtful iteration

### Innovation Summary

**Core Innovation Thesis:**
"A universal database schema with JSONB flexibility, combined with execution transparency as a first-class feature and pre-run case study economics, creates an architecturally elegant and economically sustainable approach to showcasing diverse AI agent capabilities in a public portfolio."

**What Makes This Worth Validating:**
- ✅ **If successful:** Replicable pattern for agent portfolios (valuable for developer community)
- ✅ **If schema needs iteration:** Documented challenges and solutions (valuable for learners and architectural discussions)
- ✅ **Either outcome:** Strong portfolio piece demonstrating systems thinking, architectural decision-making, and validation methodology

**Gate 1 as Innovation Validation:**
Gate 1 validation explicitly tests the innovation hypothesis:
- **GO decision:** Universal schema pattern validated, proceed to scale
- **NO-GO decision:** Pattern breaks, pivot with documented learnings

Both outcomes produce portfolio-worthy insights into agent architecture design.

## API Backend Specific Requirements

### Project-Type Overview

This project is an **API Backend / Python Service** with the following characteristics:

- **Primary Components:** Python agents (LangChain-based) + PostgreSQL database + Next.js API routes
- **Data Flow:** Python agent generates JSON → Import script loads to database → API endpoints serve to frontend
- **Deployment:** Python agents run locally/CI for case study generation, API hosted on Vercel, database on Neon
- **Access Pattern:** Read-only public access for portfolio demonstration

### Endpoint Specification

**Primary Endpoint (MVP):**

```
GET /api/agents/{agent-slug}/case-studies
```

**Path Parameters:**
- `agent-slug`: One of `fraud-trends`, `stock-monitor`, `home-finder`, `article-enhancer`, `gita-guide`

**Query Parameters (Optional for MVP):**
- `limit`: Number of results to return (default: all case studies for that agent)
- `offset`: Pagination offset (default: 0)
- `include_steps`: Boolean - include execution steps in response (default: true for full transparency)

**Response Format:**
```typescript
{
  "agent_slug": string,
  "case_studies": CaseStudy<AgentInput, AgentOutput>[],
  "total_count": number,
  "execution_trace_included": boolean
}
```

**Secondary Endpoint (Optional for MVP):**

```
GET /api/agents/{agent-slug}/case-studies/{case-study-id}
```

**Response Format:**
```typescript
CaseStudy<AgentInput, AgentOutput> // Single case study with full execution_steps
```

**List All Agents Endpoint (Nice-to-Have):**

```
GET /api/agents
```

**Response Format:**
```typescript
{
  "agents": [
    {
      "slug": "fraud-trends",
      "name": "Fraud Trends Investigator",
      "description": string,
      "case_study_count": number
    },
    // ... other agents
  ]
}
```

### Authentication Model

**MVP Approach:**
- ✅ **No authentication required:** Public read-only access for portfolio visitors
- ✅ **Database security:** Read-only connection strings for API endpoints
- ✅ **No mutations:** All endpoints are GET requests only, no POST/PUT/DELETE in MVP
- ✅ **Future consideration:** API keys for "Request Custom Analysis" feature (Phase 2)

**Security Measures:**
- API routes use read-only database connection
- No sensitive data in responses (case studies use public sources only)
- Vercel environment variables for database credentials
- CORS configured for portfolio domain only

### Data Schemas

**Request Schema:**
- ✅ No request body (GET requests only for MVP)
- ✅ Query parameters validated using Zod or similar (type-safe validation)
- ✅ Path parameters validated against known agent slugs

**Response Schema:**
- ✅ JSON format matching TypeScript types exactly
- ✅ Generic type: `CaseStudy<TInput, TOutput>`
- ✅ Agent-specific types:
  - `FraudTrendsInput`, `FraudTrendsOutput`
  - `StockMonitorInput`, `StockMonitorOutput`
  - etc.
- ✅ Execution steps array with full trace (step_number, step_name, duration_ms, inputs, outputs, details)

**Type Safety:**
- ✅ TypeScript strict mode enabled
- ✅ Shared types between frontend and API routes
- ✅ Database query results validated against TypeScript types
- ✅ Zod schemas for runtime validation

### Error Codes & Response Format

**Standardized Error Response:**

```typescript
interface APIError {
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable error message
    details?: Record<string, any>;  // Additional context
  }
}
```

**HTTP Status Codes:**

- **200 OK:** Successful retrieval of case studies
- **404 Not Found:**
  - Invalid agent slug (e.g., `/api/agents/invalid-agent/case-studies`)
  - No case studies found for valid agent
  - Case study ID not found
- **500 Internal Server Error:**
  - Database connection failure
  - Unexpected server error
- **429 Too Many Requests:** Rate limit exceeded (if rate limiting implemented)

**Error Examples:**

```typescript
// 404 - Invalid agent slug
{
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "Agent 'invalid-agent' not found",
    "details": {
      "valid_agents": ["fraud-trends", "stock-monitor", "home-finder", "article-enhancer", "gita-guide"]
    }
  }
}

// 404 - No case studies
{
  "error": {
    "code": "NO_CASE_STUDIES",
    "message": "No case studies found for agent 'fraud-trends'",
    "details": {
      "agent_slug": "fraud-trends"
    }
  }
}

// 500 - Database error
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to connect to database",
    "details": {} // No sensitive details exposed
  }
}
```

### Rate Limits

**MVP Approach:**
- ✅ **Rely on Vercel infrastructure limits** (no custom rate limiting initially)
- ✅ **Reasoning:** Read-only access to pre-run data, low abuse risk
- ✅ **Monitoring:** Track usage via Vercel analytics

**Future Considerations:**
- Add Vercel Edge Middleware rate limiting if abuse detected
- Consider per-IP rate limits (e.g., 100 requests per minute)
- Add caching headers to reduce redundant requests

### API Versioning

**MVP Approach:**
- ✅ **No explicit versioning:** Start with `/api/agents/...` (no `/v1/` prefix)
- ✅ **Reasoning:** Proof-of-concept with no breaking changes expected during initial launch
- ✅ **Flexibility:** Can introduce versioning later if breaking changes needed

**Future Versioning Strategy:**
- If schema changes required, introduce `/api/v2/agents/...`
- Maintain backward compatibility with `/api/agents/...` → `/api/v1/agents/...` redirect
- Document version changes in API changelog

### API Documentation

**MVP Documentation:**
- ✅ **README.md section:** API endpoints with example requests and responses
- ✅ **Inline code comments:** API route handlers fully documented with JSDoc
- ✅ **Type definitions:** TypeScript types serve as inline documentation

**Example README.md API Documentation:**

```markdown
## API Endpoints

### Get Case Studies for an Agent

**Endpoint:** `GET /api/agents/{agent-slug}/case-studies`

**Example Request:**
```bash
curl https://yourdomain.com/api/agents/fraud-trends/case-studies
```

**Example Response:**
```json
{
  "agent_slug": "fraud-trends",
  "case_studies": [
    {
      "id": 1,
      "agent_slug": "fraud-trends",
      "created_at": "2025-02-09T12:00:00Z",
      "input_parameters": {
        "topic": "Auto Insurance Fraud 2024-2025",
        "regions": ["North America"],
        ...
      },
      "output_result": {
        "executive_summary": "...",
        "key_trends": [...]
      },
      "execution_steps": [...]
    }
  ],
  "total_count": 5,
  "execution_trace_included": true
}
```
```

**Future Documentation (Phase 2):**
- OpenAPI/Swagger specification if API becomes primary feature
- Interactive API documentation (e.g., Swagger UI)
- Postman collection for testing

### Technical Architecture Considerations

**Next.js API Routes:**
- ✅ Located in `website/src/app/api/` directory (App Router)
- ✅ Server-side rendering with database queries
- ✅ TypeScript for type safety
- ✅ Error handling middleware for consistent error responses

**Database Connection:**
- ✅ PostgreSQL client (e.g., `pg` or Prisma)
- ✅ Connection pooling for performance
- ✅ Read-only user for API endpoints
- ✅ Connection string from environment variables (Vercel)

**Performance Considerations:**
- ✅ Database indexes on `agent_slug` and `id` columns
- ✅ Consider caching headers (`Cache-Control: public, max-age=3600`) since data is pre-run
- ✅ Lazy loading execution steps if response size is large

**Monitoring & Logging:**
- ✅ Vercel analytics for usage tracking
- ✅ Error logging for 500 errors (investigate database issues)
- ✅ Performance monitoring (response times)

### Implementation Considerations

**Development Workflow:**
1. **Python agent generates JSON** → Local execution or CI pipeline
2. **Import script loads to database** → Run manually or via CI after agent execution
3. **API endpoints query database** → Deployed on Vercel, read-only access
4. **Frontend fetches from API** → Next.js pages/components consume API

**Deployment Strategy:**
- ✅ **Python agents:** Run locally or in CI (not deployed to production)
- ✅ **Database:** Neon PostgreSQL (hosted, persistent)
- ✅ **API + Frontend:** Vercel (serverless Next.js)

**Testing:**
- ✅ **API endpoint tests:** Verify response format matches TypeScript types
- ✅ **Database query tests:** Ensure case studies and execution steps retrieved correctly
- ✅ **Error handling tests:** Verify 404, 500 responses work as expected

**Gate 1 API Validation:**
- ✅ API endpoint returns Fraud Trends case studies correctly
- ✅ Response matches TypeScript `CaseStudy<FraudTrendsInput, FraudTrendsOutput>` type
- ✅ Execution steps included and formatted correctly
- ✅ Error handling tested (invalid agent slug, database connection issues)

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach: Proof-of-Concept Validation MVP**

This is a **technical validation MVP** focused on:
1. **Architecture validation:** Can one database schema handle 5 different agent types?
2. **Pattern replicability:** Can Fraud Trends serve as a template for remaining agents?
3. **Portfolio quality:** Does the code meet public repository standards?

**Strategic Rationale:**
- **Not building for users yet** - building to validate architecture first
- **Gate 1 decision point** - GO/NO-GO before scaling to remaining 4 agents
- **Developer as customer** - proving to yourself (and future employers) that the pattern works

**MVP Resource Requirements:**
- **Team size:** Solo developer
- **Skills needed:** Python, LangChain, PostgreSQL, TypeScript, Next.js
- **Timeline:** Fraud Trends agent complete → Gate 1 validation → Decision to proceed
- **Budget:** API costs only (Claude + Tavily for 5 case studies)

### MVP Feature Set (Phase 1 - Fraud Trends Proof-of-Concept)

**Core Components (Must-Have for Gate 1):**

**1. Python Agent (`agents/fraud-trends/agent.py`):**
- ✅ 6-step workflow (Plan → 3 Searches → Extract → Synthesize)
- ✅ Claude API integration (3 LLM steps)
- ✅ Tavily API integration (3 search steps)
- ✅ JSON output matching TypeScript schema
- ✅ Execution trace with complete logging
- ✅ Error handling and graceful failures

**2. Database Integration:**
- ✅ Import script (`scripts/import-case-studies.py`)
- ✅ PostgreSQL schema (case_studies + execution_steps tables)
- ✅ JSONB fields for agent-specific data
- ✅ Data integrity validation

**3. API Endpoint (Basic):**
- ✅ `/api/agents/fraud-trends/case-studies` endpoint
- ✅ TypeScript types matching database schema
- ✅ Error handling (404, 500)
- ✅ Tested and functional

**4. Code Quality & Security:**
- ✅ ESLint/pylint clean (zero errors)
- ✅ Comprehensive comments on all functions
- ✅ Immutable constants clearly marked
- ✅ No secrets in git, SECURITY_CHECKLIST.md validated
- ✅ .gitignore comprehensive, .env.example exists

**5. Case Studies:**
- ✅ 5 case studies on different fraud topics
- ✅ All imported to database successfully
- ✅ All queryable via API

**What's Explicitly OUT of MVP (Phase 1):**
- ❌ Other 4 agents (wait for Gate 1 GO decision)
- ❌ UI/Frontend (deferred to Phase 2)
- ❌ Robot animations and glass aesthetic (Phase 2)
- ❌ Real-time agent execution (pre-run only for MVP)
- ❌ Advanced error recovery (basic error handling sufficient)
- ❌ Caching or performance optimization

### Post-MVP Features

**Phase 2 (After Gate 1 Validation - Growth):**

**If Gate 1 = GO:**
1. **Build remaining 4 agents** using Fraud Trends as template:
   - Stock Monitor (detection agent)
   - Home Finder (matching agent)
   - Article Enhancer (content enhancement agent)
   - Gita Guide (conversational agent with static knowledge base)
2. **Validate replicability:** Measure Stock Monitor development time vs. Fraud Trends
3. **Complete all case studies:** 5 per agent × 5 agents = 25 total case studies
4. **Import all to database:** Universal schema handles all agent types

**If Gate 1 = NO-GO:**
1. **Document learnings:** What broke? Where did schema need changes?
2. **Pivot to flexible schema:** Agent-specific extensions if needed
3. **Portfolio value:** "Here's what I learned about agent architecture"

**Phase 3 (After All Agents Working - UI & Polish):**

1. **Next.js Frontend:**
   - Landing page with agent showcase
   - Agent-specific detail pages
   - Glass aesthetic UI design
   - Robot animations for execution traces
2. **Enhanced API:**
   - Additional endpoints (`/api/agents`, individual case study retrieval)
   - Caching headers for performance
   - Rate limiting if needed
3. **Deployment:**
   - Vercel deployment for website + API
   - Neon PostgreSQL for production database
   - CI/CD pipeline for case study generation

**Phase 4 (Vision - Future Enhancements):**

1. **Real-time execution** for Gita Guide live chat
2. **Custom query input** - visitors can request custom case studies
3. **Performance optimization** - caching, parallel execution improvements
4. **Monitoring & observability** - agent execution metrics
5. **Community features** - open-source contributions, case study marketplace

### Risk Mitigation Strategy

**Technical Risks:**

**Risk 1: Universal Schema Doesn't Work**
- **Probability:** Medium (untested assumption)
- **Impact:** High (requires major architecture change)
- **Mitigation:** Gate 1 validation tests this explicitly - test with 2 different agent types (Fraud Trends + Stock Monitor)
- **Fallback:** Pivot to flexible schema with agent-specific extensions, document as "lessons learned"

**Risk 2: Type Consistency Breaks**
- **Probability:** Low (TypeScript strict mode enforces consistency)
- **Impact:** Medium (requires refactoring Python or TypeScript)
- **Mitigation:** JSON schema validation script, strict type checking
- **Fallback:** Add type conversion layer between Python and TypeScript

**Risk 3: API Costs Too High**
- **Probability:** Low (5 case studies per agent = predictable cost)
- **Impact:** Low (one-time cost, not recurring)
- **Mitigation:** Pre-run strategy eliminates ongoing API costs
- **Fallback:** Reduce case study count from 5 to 3 per agent

**Market Risks:**

**Risk 1: Portfolio Doesn't Impress Recruiters**
- **Probability:** Low (technical depth and code quality are differentiators)
- **Impact:** High (defeats portfolio purpose)
- **Mitigation:** Focus on code quality, execution transparency, architectural thinking
- **Validation:** Share with developer peers for feedback before making public

**Risk 2: Innovation Isn't Perceived as Novel**
- **Probability:** Medium (universal schema may not resonate)
- **Impact:** Medium (reduces differentiation)
- **Mitigation:** Emphasize either successful pattern OR valuable learnings from failure
- **Fallback:** Pivot narrative to "5 diverse agent implementations showcasing versatility"

**Resource Risks:**

**Risk 1: Takes Longer Than Expected**
- **Probability:** High (first time building this architecture)
- **Impact:** Medium (delays portfolio launch)
- **Mitigation:** Gate 1 provides early feedback - can decide to simplify after Fraud Trends
- **Contingency:** Launch with just Fraud Trends and one other agent (proof-of-concept still valid)

**Risk 2: API Keys Run Out / Budget Exceeded**
- **Probability:** Low (Anthropic/Tavily provide reasonable free tiers or trial credits)
- **Impact:** Low (can pause and resume)
- **Mitigation:** Monitor API usage, estimate costs before running all case studies
- **Contingency:** Generate fewer case studies (3 instead of 5 per agent)

**Risk 3: Burnout or Loss of Motivation**
- **Probability:** Medium (large project, solo developer)
- **Impact:** High (project abandonment)
- **Mitigation:** Gate 1 provides early win/validation, phased approach allows breaks
- **Contingency:** MVP (Fraud Trends alone) is still portfolio-worthy - can stop after Phase 1

### Scope Decision Summary

**Strategic Scoping:**
- ✅ MVP = Fraud Trends agent + database + basic API (Phase 1)
- ✅ Gate 1 validation as explicit decision point
- ✅ Remaining 4 agents as Phase 2 (conditional on Gate 1 GO)
- ✅ UI as Phase 3 (after all agents working)

**Scoping Benefits:**
- **Strategic:** Validates architecture before scaling
- **Lean:** Minimum to test hypothesis (universal schema)
- **Pragmatic:** Gate 1 provides exit or pivot point
- **Portfolio-worthy:** Even Phase 1 alone demonstrates systems thinking

## Functional Requirements

### Agent Execution Capabilities

**FR1:** Developer can execute Fraud Trends agent with topic, regions, time range, and focus areas as input parameters

**FR2:** Agent can generate a research strategy with sub-queries based on input topic and parameters

**FR3:** Agent can search industry sources for fraud trends using web search API

**FR4:** Agent can search regulatory sources (NAIC, FBI, state departments) for compliance and enforcement information

**FR5:** Agent can search academic sources for fraud research and analysis

**FR6:** Agent can extract key findings from aggregated search results with structured classification

**FR7:** Agent can synthesize executive summary and recommendations from extracted findings

**FR8:** Agent can generate JSON output matching predefined TypeScript schema

**FR9:** Agent can log execution steps with timing, inputs, outputs, and details for each step

**FR10:** Agent can handle API failures gracefully with clear error messages

### Data Management Capabilities

**FR11:** Developer can import agent-generated JSON files to PostgreSQL database

**FR12:** Import script can validate JSON structure against TypeScript schema before database insertion

**FR13:** Import script can insert case study metadata into universal case_studies table

**FR14:** Import script can insert execution steps into execution_steps table with proper foreign key relationships

**FR15:** Database can store agent-specific input parameters in JSONB format

**FR16:** Database can store agent-specific output results in JSONB format

**FR17:** Database can query case studies filtered by agent slug

**FR18:** Database can query execution steps for a specific case study

### Output Quality & Compliance Capabilities

**FR19:** Agent can classify fraud findings by fraud type (staged_accident, soft_fraud, hard_fraud, organized_ring, medical_billing, property_damage, identity_fraud)

**FR20:** Agent can assign severity levels (low, medium, high, critical) to fraud findings with rationale

**FR21:** Agent can specify geographic scope (national, regional, state_specific, local) for fraud findings

**FR22:** Agent can identify affected regions for each fraud finding

**FR23:** Agent can tag insurance segments (auto, property, health, life, commercial, workers_comp) for findings

**FR24:** Agent can assess detection difficulty (easy, moderate, difficult, sophisticated) with rationale

**FR25:** Agent can separate regulatory findings from general fraud trends

**FR26:** Agent can classify sources by tier (Tier 1: regulatory/academic, Tier 2: industry, Tier 3: general news)

**FR27:** Agent can include source tier breakdown in output (count of Tier 1, 2, 3 sources used)

**FR28:** Agent can include disclaimer text in JSON output stating research is for educational purposes only

**FR29:** Agent can include confidence level for findings based on source count and tier

### API Access Capabilities

**FR30:** Frontend can retrieve all case studies for a specific agent via REST API

**FR31:** API can return case studies with execution steps included by default

**FR32:** API can return error response with machine-readable code and human-readable message

**FR33:** API can validate agent slug parameter against known agents

**FR34:** API can return 404 error for invalid agent slug with list of valid agents

**FR35:** API can return 404 error when no case studies exist for valid agent

**FR36:** API can return 500 error for database connection failures without exposing sensitive details

**FR37:** API can return case study count in response metadata

### Code Quality & Security Capabilities

**FR38:** Developer can run linting tools (ESLint for TypeScript, pylint for Python) with zero errors

**FR39:** Developer can validate that immutable constants (AGENT_SLUG, STEP_TYPES, DB_FIELD_NAMES) are clearly marked with UPPER_CASE naming

**FR40:** Developer can verify that all functions have comprehensive comments documenting purpose, parameters, and return values

**FR41:** Developer can confirm that no API keys or credentials exist in git history

**FR42:** Developer can validate that .env file is properly gitignored and .env.example exists with placeholders

**FR43:** Developer can run security checklist validation script to verify repository is safe for public sharing

**FR44:** Developer can verify that output JSON files contain no API keys or credentials

### Validation & Testing Capabilities

**FR45:** Developer can validate JSON output matches TypeScript types exactly using validation script

**FR46:** Developer can verify all 6 execution steps were captured in execution trace

**FR47:** Developer can query database to confirm case studies imported successfully

**FR48:** Developer can query database to confirm execution steps linked correctly to case studies

**FR49:** Developer can test API endpoint returns correct TypeScript type structure

**FR50:** Developer can run Gate 1 validation checklist to verify all criteria pass before proceeding to additional agents

### Documentation Capabilities

**FR51:** Developer can reference README.md for setup instructions, API key requirements, and usage examples

**FR52:** Developer can reference .env.example for required environment variables with placeholder values

**FR53:** Developer can reference SECURITY_CHECKLIST.md for validation before making repository public

**FR54:** Developer can read inline code comments explaining domain-specific design decisions (insurance industry concepts, source tier classification, fraud taxonomies)

## Non-Functional Requirements

### Security

**NFR-S1: Secret Management**
- All API keys and database credentials must be stored in .env files
- .env files must be gitignored
- .env.example must exist with placeholder values for all required variables
- **Validation:** Running `git log --all --full-history -- "*/.env"` returns no results

**NFR-S2: Git History Integrity**
- Git history must contain zero committed secrets (API keys, database passwords, credentials)
- **Validation:** SECURITY_CHECKLIST.md validation script passes 100%

**NFR-S3: Output Sanitization**
- Agent-generated JSON output files must contain no API keys or credentials
- Database must contain no API keys or credentials in any fields
- **Validation:** Manual inspection of JSON outputs and database exports finds zero secrets

**NFR-S4: Public Repository Safety**
- Repository must be safe to make public without exposing sensitive information
- All documentation must exclude sensitive configuration details
- **Validation:** SECURITY_CHECKLIST.md 100% validated before making repository public

**NFR-S5: API Security**
- API endpoints use read-only database connections (no mutations)
- API error responses must not expose sensitive system details or stack traces
- **Validation:** Database user has SELECT-only permissions, error responses contain no sensitive paths or credentials

### Code Quality

**NFR-CQ1: Linting Standards**
- TypeScript code must pass ESLint with zero errors
- Python code must pass pylint with score ≥9.0/10.0
- **Validation:** `npm run lint` returns 0 errors, `pylint agents/fraud-trends/agent.py` scores ≥9.0

**NFR-CQ2: Code Documentation**
- Every public function must have comprehensive comments documenting purpose, parameters, and return values
- Complex logic must include inline comments explaining the approach
- Design decisions must be documented in code comments
- **Validation:** Manual code review confirms all functions documented, complex logic explained

**NFR-CQ3: Naming Conventions**
- Variable and function names must be descriptive and reveal intent without needing comments
- Immutable constants must use UPPER_CASE naming (e.g., `AGENT_SLUG`, `STEP_TYPES`, `DB_FIELD_NAMES`)
- TypeScript const assertions must be used for readonly values (`as const`)
- **Validation:** Code review confirms clear naming and proper constant marking

**NFR-CQ4: Type Safety**
- TypeScript strict mode must be enabled with zero type errors
- Python code must include type hints for all function signatures
- **Validation:** `tsc --noEmit` passes with 0 errors, Python type hints present on all functions

**NFR-CQ5: Git Commit Quality**
- Commit messages must be descriptive and explain the "why" not just the "what"
- Commits must be atomic (single logical change per commit)
- **Validation:** Git log review shows clear commit history

### Reliability

**NFR-R1: Agent Execution Reliability**
- Agent must complete all 6 steps without crashes for valid inputs
- Agent must handle API failures (Claude, Tavily) gracefully with clear error messages
- Agent must not crash on invalid inputs; must return actionable error messages
- **Validation:** Agent runs successfully for 5 different case study topics; intentional API failures produce error messages not crashes

**NFR-R2: Database Import Reliability**
- Import script must successfully import 100% of valid JSON outputs without manual intervention
- Import script must validate JSON structure before attempting database insertion
- Import script must report clear errors for invalid JSON with field-level feedback
- **Validation:** All 5 Fraud Trends case studies import successfully on first attempt

**NFR-R3: Data Integrity**
- Database foreign key relationships must be enforced (execution_steps linked to case_studies)
- JSONB fields must preserve data structure without corruption
- **Validation:** Query database confirms all execution steps linked correctly, JSONB data matches original JSON outputs exactly

**NFR-R4: API Error Handling**
- API must return appropriate HTTP status codes (200, 404, 500)
- API must return structured error responses with machine-readable codes and human-readable messages
- API must handle database connection failures gracefully without crashing
- **Validation:** API tests verify correct status codes for success, invalid agent, and database error scenarios

### Performance

**NFR-P1: Agent Execution Time**
- Agent execution must complete within 60 seconds for typical case study (target: 15-30 seconds)
- Agent execution time ≥90 seconds is considered degraded performance requiring investigation
- **Validation:** Time 5 case study runs; 80% complete within 60 seconds

**NFR-P2: Database Import Time**
- Import script must complete within 10 seconds for single case study with 6 execution steps
- **Validation:** Time import operations; average ≤10 seconds

**NFR-P3: API Response Time**
- API endpoint must return case studies within 2 seconds under normal conditions
- **Validation:** API response time measurements average ≤2 seconds for case study retrieval

### Integration

**NFR-I1: Type Consistency**
- Python Pydantic models must align exactly with TypeScript types
- TypeScript types must align exactly with database schema (JSONB structure)
- **Validation:** JSON validation script confirms Python output matches TypeScript schema; database queries return data matching TypeScript types

**NFR-I2: Claude API Integration**
- Agent must handle Claude API rate limits gracefully with retry logic or clear errors
- Agent must work with Claude Sonnet model (or compatible model)
- **Validation:** Agent handles API rate limit responses without crashing; Claude API requests succeed

**NFR-I3: Tavily API Integration**
- Agent must handle Tavily API failures gracefully (network errors, rate limits)
- Agent must parse Tavily search results correctly without data loss
- **Validation:** Agent handles Tavily failures without crashing; search results captured correctly in JSON output

**NFR-I4: Database Compatibility**
- Code must work with PostgreSQL 14+ (Neon hosted)
- Database connection must use environment variables for configuration
- **Validation:** Successfully connects to Neon PostgreSQL; all JSONB operations work correctly

