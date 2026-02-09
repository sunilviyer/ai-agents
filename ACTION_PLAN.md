# AI Agents Portfolio - Action Plan

**Status**: BMad Installed ✅ | Ready to Execute

---

## 🎯 Critical Path: Proof of Concept (Fraud Trends Agent)

We'll build ONE complete agent end-to-end to validate the architecture before building the other 4.

---

## Phase 1: Product Definition (1-2 hours)

### ✋ YOU DO (Run BMad Workflows):

1. **Create Product Brief**
   ```
   /bmad-bmm-create-product-brief
   ```

   **What to enter when prompted**:
   - **Product Name**: AI Agents Portfolio
   - **Problem**: Showcase 5 different AI agent architectures (Research, Event Detection, Matching, Enhancement, Conversational)
   - **Target Users**:
     - Recruiters/hiring managers
     - Technical peers/developers
     - Potential clients
   - **Value Proposition**: Demonstrate deep understanding of agentic AI patterns with working examples
   - **MVP Scope**:
     - 5 agents (4 pre-run case studies, 1 live chat)
     - Professional website with execution transparency
     - Public portfolio piece
   - **Success Metrics**:
     - Portfolio views
     - Engagement with agent demos
     - Technical interview conversations

2. **Create PRD (for Fraud Trends proof-of-concept)**
   ```
   /bmad-bmm-create-prd
   ```

   **What to enter**:
   - **Focus**: Fraud Trends Investigator agent ONLY (proof of concept)
   - **User Story**: "As a portfolio visitor, I want to see a research agent in action, so I can understand how AI synthesizes information from multiple sources"
   - **Features**:
     - Python agent that researches fraud trends
     - Tavily API integration for web search
     - 6-step workflow (Plan → Search → Extract → Synthesize)
     - JSON output with sources
     - 5 case studies covering different fraud topics
   - **Technical Constraints**:
     - Must output to database schema (already defined)
     - No API keys in output
     - Execution trace must be transparent
   - **Non-Goals**: Other 4 agents (those come after validation)

3. **Create Architecture**
   ```
   /bmad-bmm-create-architecture
   ```

   **What to enter**:
   - **Component**: Fraud Trends Agent (Python)
   - **Tech Stack**:
     - Python 3.10+
     - LangChain
     - Anthropic Claude API
     - Tavily Search API
   - **Data Flow**:
     ```
     Input (topic, regions, time_range)
       ↓
     Step 1: Plan Research Strategy
       ↓
     Step 2: Search Industry Sources (Tavily)
       ↓
     Step 3: Search Regulatory Reports (Tavily)
       ↓
     Step 4: Search Academic/News (Tavily)
       ↓
     Step 5: Extract Key Findings
       ↓
     Step 6: Synthesize Report
       ↓
     Output (JSON matching FraudTrendsOutput type)
     ```
   - **Database Integration**:
     - Separate import script
     - Reads JSON from `agents/fraud-trends/output/`
     - Inserts into `case_studies` table
   - **Security**:
     - API keys in `.env` only
     - No secrets in JSON output

### 📝 Outputs from These Steps:
- `bmad-artifacts/product-brief.md`
- `bmad-artifacts/prd.md`
- `bmad-artifacts/architecture.md`

---

## Phase 2: Story Creation (30 min - 1 hour)

### ✋ YOU DO:

4. **Create Epics and Stories**
   ```
   /bmad-bmm-create-epics-and-stories
   ```

   **Break Fraud Trends into implementable stories**:

   **Epic 1: Agent Foundation**
   - Story 1.1: Setup project structure (requirements.txt, agent.py skeleton)
   - Story 1.2: Environment configuration (API key loading)
   - Story 1.3: Input/output type definitions

   **Epic 2: Research Workflow**
   - Story 2.1: Research planner (Step 1)
   - Story 2.2: Tavily search integration (Steps 2-4)
   - Story 2.3: Findings extraction (Step 5)
   - Story 2.4: Report synthesis (Step 6)

   **Epic 3: Output & Integration**
   - Story 3.1: JSON output generator
   - Story 3.2: Database import script
   - Story 3.3: Error handling & logging

   **Epic 4: Testing & Validation**
   - Story 4.1: Run on 5 case study topics
   - Story 4.2: Validate JSON structure
   - Story 4.3: Test database import

### 📝 Output:
- `bmad-artifacts/epics-and-stories.md`

---

## Phase 3: Implementation (THIS IS WHERE I HELP)

### 🤖 I DO (You ask me to build each story):

For each story, you run:
```
/bmad-bmm-dev-story
```
Then select the story to implement.

**BUT** - You can also just ask me directly:

**Story 1.1: Setup Project Structure**

**What you ask me**:
> "Build the Fraud Trends agent foundation - create requirements.txt, agent.py skeleton with all imports, and basic command-line interface"

**What I'll create**:
- `agents/fraud-trends/requirements.txt`
- `agents/fraud-trends/agent.py` (skeleton)
- `agents/fraud-trends/.env.example`

---

**Story 2.1-2.4: Research Workflow**

**What you ask me**:
> "Implement the 6-step research workflow for Fraud Trends agent using LangChain and Tavily"

**What I'll create**:
- Complete `agent.py` with all 6 steps
- LangChain agent configuration
- Tavily API integration
- Step-by-step execution logic

---

**Story 3.1-3.2: Output & Integration**

**What you ask me**:
> "Create JSON output formatter and database import script for Fraud Trends agent"

**What I'll create**:
- JSON export in `FraudTrendsOutput` format
- `scripts/import-case-studies.py`
- Validation logic

---

**Story 4.1-4.3: Testing**

**Manual Work - YOU DO**:
1. Get Tavily API key: https://tavily.com/
2. Add to `.env`: `TAVILY_API_KEY=tvly-xxx`
3. Run agent:
   ```bash
   cd agents/fraud-trends
   python agent.py --topic "Auto Insurance Fraud" --regions "US,Canada" --years "2024-2025"
   ```
4. Check output: `agents/fraud-trends/output/case_study_001.json`
5. Import to DB:
   ```bash
   python scripts/import-case-studies.py --agent fraud-trends
   ```

**What you ask me**:
> "Help me debug any issues with the agent or import script"

---

## Phase 4: Code Review (30 min)

### ✋ YOU DO:

After implementation, run:
```
/bmad-bmm-code-review
```

**BMad will review**:
- Code quality
- Security (no API keys hardcoded)
- Best practices
- Error handling

### 🤖 I DO:

Fix any issues BMad finds.

---

## Phase 5: End-to-End Validation (1 hour)

### 🔍 YOU DO (Manual Testing):

**Test 1: Agent Execution**
```bash
cd agents/fraud-trends
python agent.py --topic "Auto Insurance Fraud" --regions "US,Canada"
```
✅ Should generate: `output/case_study_001.json`

**Test 2: Database Import**
```bash
# First: Create database
psql $DATABASE_URL -f database/schema.sql

# Then: Import
python scripts/import-case-studies.py --agent fraud-trends --file agents/fraud-trends/output/case_study_001.json
```
✅ Should insert into `case_studies` table

**Test 3: Query Database**
```bash
psql $DATABASE_URL -c "SELECT title, agent_slug FROM case_studies WHERE agent_slug='fraud-trends';"
```
✅ Should return 1 row

**Test 4: API Endpoint** (later - after website built)

---

## Phase 6: Go/No-Go Decision

### ✅ GO Decision Criteria:

- [ ] Agent executes successfully
- [ ] JSON output matches `FraudTrendsOutput` type exactly
- [ ] No API keys in output files
- [ ] Database import works
- [ ] Data queries correctly
- [ ] No errors or warnings
- [ ] Process is repeatable

### 🛑 NO-GO (fix first):

- Schema needs changes → Update `database/schema.sql`
- Types don't match → Update `website/src/lib/types.ts`
- Security issues → Fix before proceeding

---

## Phase 7: Remaining 4 Agents (After GO)

**Repeat Process for Each**:
1. `/bmad-bmm-create-story` (for that agent)
2. Ask me to implement
3. `/bmad-bmm-code-review`
4. Test manually
5. Import to database

**Order**:
1. Article Editor (2-3 hours build + 2-3 hours to write drafts)
2. Gita Guide (3-4 hours build + 2-4 hours data prep)
3. Stock Monitor (3-4 hours build)
4. House Finder (5-6 hours build + 3-4 hours mock data)

---

## Manual Work Summary

### Things YOU Must Do (BMad can't do these):

1. **Run BMad Workflows** (they need to run in your Claude Code UI)
   - `/bmad-bmm-create-product-brief`
   - `/bmad-bmm-create-prd`
   - `/bmad-bmm-create-architecture`
   - `/bmad-bmm-create-epics-and-stories`
   - `/bmad-bmm-code-review` (after I build)

2. **Get API Keys**
   - Tavily: https://tavily.com/
   - Anthropic: https://console.anthropic.com/
   - Finnhub: https://finnhub.io/

3. **Setup Database**
   - Create Neon DB: https://console.neon.tech/
   - Run schema: `psql $DATABASE_URL -f database/schema.sql`

4. **Test Manually**
   - Run agents
   - Import to database
   - Verify outputs

5. **Write Content** (for Article Editor)
   - 5 draft articles (150-300 words each)

6. **Prepare Data** (for Gita Guide)
   - Gita verses (I can help compile)

7. **Create Mock Data** (for House Finder)
   - Real estate listings (I can help generate)

### Things I Can Do (ask me anytime):

1. **Write All Code**
   - Agent scripts (Python)
   - Import scripts
   - Website (Next.js)
   - API routes
   - Components

2. **Debug Issues**
   - Agent errors
   - Database issues
   - Type mismatches

3. **Review & Explain**
   - Code review
   - Architecture questions
   - BMad workflow help

4. **Generate Data**
   - Mock real estate listings
   - Help compile Gita verses

---

## Next Immediate Action

**👉 YOU DO NOW**:

Run this command in your Claude Code interface:
```
/bmad-bmm-create-product-brief
```

**Then**:
- Fill in the details I provided above
- It will generate: `bmad-artifacts/product-brief.md`
- Review it
- Come back here and say "Product brief done"
- I'll guide you to the next step

**Let's build this systematically! 🚀**
