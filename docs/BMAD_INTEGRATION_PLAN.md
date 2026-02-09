# BMad Method Integration Plan

## Overview

We're using **BMad Method** framework to guide the systematic development of all 5 AI agents. This ensures:

- ✅ **Structured approach** - From planning to deployment
- ✅ **Quality gates** - Code review at every step
- ✅ **Documentation** - Auto-generated from workflow
- ✅ **Testing** - Systematic test coverage
- ✅ **Dev team coordination** - Clear handoff process

---

## Phase 1: Proof of Concept (Fraud Trends Agent)

**Goal**: Build ONE complete agent end-to-end to validate architecture

### BMad Workflows to Use

#### 1. Product Brief (`/product-brief`)
Define the AI Agents Portfolio project:
- **Problem**: Showcase 5 different AI agent architectures
- **Users**: Recruiters, hiring managers, technical peers
- **MVP Scope**: 5 agents (4 pre-run, 1 live) + website
- **Success Metrics**: Portfolio views, agent demonstrations

#### 2. Product Requirements (`/create-prd`)
Formalize requirements for Fraud Trends agent:
- User stories
- Acceptance criteria
- Technical constraints
- Data requirements

#### 3. Technical Architecture (`/create-architecture`)
Design Fraud Trends agent architecture:
- Python agent structure
- LangChain integration
- API selection (Tavily)
- Output format (JSON)
- Database integration

#### 4. Epic & Stories (`/create-epics-and-stories`)
Break Fraud Trends into implementable stories:
- Story 1: Setup agent skeleton
- Story 2: Implement research planner
- Story 3: Integrate Tavily search
- Story 4: Extract findings logic
- Story 5: Synthesis engine
- Story 6: Database import script

#### 5. Development (`/dev-story`)
Implement each story:
- Follow TDD if possible
- Code to spec
- Handle errors gracefully

#### 6. Code Review (`/code-review`)
Review each story:
- Security check
- Code quality
- Best practices
- Documentation

#### 7. Testing (`/test-automation` - if TEA installed)
Create tests:
- Unit tests for each step
- Integration test (end-to-end)
- Mock API responses

---

## Phase 2: Validate End-to-End Workflow

After building Fraud Trends with BMad:

### ✅ Validation Checklist

**Agent Side (Python)**:
- [ ] Agent runs successfully
- [ ] Generates valid JSON output
- [ ] No secrets in output
- [ ] All 6 steps execute
- [ ] Error handling works

**Database Side**:
- [ ] JSON imports to `case_studies` table
- [ ] `execution_steps` populate correctly
- [ ] JSONB fields parse properly
- [ ] Data types match schema

**API Side (Next.js)**:
- [ ] `/api/agents/fraud-trends/case-studies` returns data
- [ ] Types match TypeScript definitions
- [ ] No CORS issues
- [ ] Response format correct

**Frontend Side**:
- [ ] Case study displays on page
- [ ] Execution trace expands/collapses
- [ ] Output renders correctly
- [ ] Mobile responsive

**Security Side**:
- [ ] No API keys in git
- [ ] `.env` properly gitignored
- [ ] Output JSONs safe to commit
- [ ] No credentials in database schema

**Documentation Side**:
- [ ] BMad artifacts committed (product brief, PRD, architecture)
- [ ] README updated
- [ ] Code commented
- [ ] Types documented

### 🚦 Go/No-Go Decision

**✅ GO** if all validation passes:
- Proceed to build remaining 4 agents using same pattern
- Dev team can work in parallel
- Architecture is proven

**🛑 NO-GO** if issues found:
- Fix architecture issues
- Update database schema (while we can)
- Revise types
- Re-test Fraud Trends
- Don't build other agents until validated

---

## Phase 3: Remaining 4 Agents (Dev Team)

Once Fraud Trends validates, use **BMad Method** for each remaining agent:

### Agent Build Pattern (Repeat 4x)

#### Article Editor
```
/create-story → /dev-story → /code-review → /test-automation
```
- 5 user drafts as input
- Tavily for references
- Before/after comparison output

#### Gita Guide
```
/create-story → /dev-story → /code-review → /test-automation
```
- Load Gita verses to DB first
- Conversation state management
- Live chat API endpoint

#### Stock Monitor
```
/create-story → /dev-story → /code-review → /test-automation
```
- Finnhub API integration
- Event classification logic
- Alert generation

#### House Finder
```
/create-story → /dev-story → /code-review → /test-automation
```
- Fraser Institute school data
- Mock listing generation
- Scoring algorithm
- Ranking logic

### Parallel Development Strategy

**Dev Team Size: 2-3 developers**

**Option A: Parallel by Agent**
- Dev 1: Article Editor + Stock Monitor
- Dev 2: Gita Guide + House Finder
- Dev 3: Website + Integration

**Option B: Parallel by Layer**
- Dev 1: All agent Python scripts
- Dev 2: Database + import scripts
- Dev 3: Frontend + API routes

**Recommended: Option A** - Each dev owns 1-2 complete agents

---

## Phase 4: Website Development

Use BMad for frontend too:

### Website Stories

1. **Shared Components**
   ```
   /create-story "Create universal AgentHeader component"
   /dev-story
   /code-review
   ```

2. **API Routes**
   ```
   /create-story "Create case studies API endpoint"
   /dev-story
   /code-review
   ```

3. **Agent Pages**
   ```
   /create-story "Create dynamic agent page with execution trace"
   /dev-story
   /code-review
   ```

4. **Gita Guide Live Chat**
   ```
   /create-story "Create live chat interface with rate limiting"
   /dev-story
   /code-review
   ```

5. **Landing Page**
   ```
   /create-story "Create interactive landing page with robot animations"
   /dev-story
   /code-review
   ```

---

## BMad Artifacts to Commit

These are **documentation**, not code - safe to commit:

```
bmad-artifacts/
├── product-brief.md
├── prd.md
├── architecture.md
├── epics-and-stories.md
├── sprint-plans/
├── test-plans/
└── reviews/
```

**.claude/** directory should also be committed - it contains agent configurations.

---

## Integration with Our Architecture

### What BMad Provides
- 🎯 **Process** - Workflow guidance
- 📝 **Documentation** - Auto-generated artifacts
- 🔍 **Review** - Quality gates
- 🧪 **Testing** - Test scaffolding

### What We Provide
- 📊 **Database Schema** - Immutable, pre-defined
- 🎨 **Types** - TypeScript interfaces
- 🏗️ **Architecture** - Agent structure, website structure
- 📚 **Requirements** - 5 agent specifications

### How They Work Together

```
BMad Method (Process)
    ↓
Our Requirements (5 agent specs)
    ↓
Our Architecture (database, types, structure)
    ↓
Implementation (guided by BMad workflows)
    ↓
Quality Gates (BMad code review)
    ↓
Deployment (Vercel)
```

---

## Timeline with BMad Method

### Week 1: Proof of Concept
- **Day 1**: BMad product brief + PRD for entire portfolio
- **Day 2**: BMad architecture for Fraud Trends
- **Day 3**: BMad dev stories - implement Fraud Trends
- **Day 4**: BMad code review + testing
- **Day 5**: Validate end-to-end, Go/No-Go decision

### Week 2: Parallel Agent Development
- **Day 1-2**: Article Editor + Stock Monitor
- **Day 3-4**: Gita Guide + House Finder
- **Day 5**: Integration testing

### Week 3: Website Development
- **Day 1-2**: Shared components + API routes
- **Day 3-4**: Agent pages + Gita live chat
- **Day 5**: Landing page + polish

### Week 4: Deployment
- **Day 1**: Deploy to Vercel
- **Day 2**: Security audit
- **Day 3**: Link from portfolio
- **Day 4-5**: Testing + fixes

---

## Dev Team Onboarding

### Prerequisites for Dev Team

1. **Install BMad Method**
   ```bash
   npx bmad-method@beta install
   ```

2. **Review Documentation**
   - Read: `docs/COMPLETE_BUILD_PLAN.md`
   - Read: `docs/DATA_SOURCING_STRATEGY.md`
   - Read: `docs/ARCHITECTURE_REVIEW.md`
   - Review: `database/schema.sql`
   - Review: `website/src/lib/types.ts`

3. **Setup Environment**
   - Copy `.env.example` to `.env`
   - Get API keys (Tavily, Finnhub, Anthropic)
   - Setup Neon DB connection

4. **Run Fraud Trends Agent** (once validated)
   ```bash
   cd agents/fraud-trends
   python agent.py
   # Should generate: output/case_study_001.json
   ```

### Dev Team Workflows

Each developer follows this pattern:

1. **Pick an agent** (from assigned list)
2. **Run BMad workflows**:
   ```
   /create-story "Build [Agent Name] agent"
   /dev-story
   /code-review
   ```
3. **Test locally**
4. **Import to database**
5. **Verify in website**
6. **Commit to git** (after security check)
7. **Mark story complete**

---

## Success Metrics

### For Proof of Concept (Fraud Trends)
- [ ] Completes in < 1 week
- [ ] End-to-end works first try (or < 3 iterations)
- [ ] No architecture changes needed
- [ ] Security checklist passes
- [ ] Dev team can replicate

### For Full Project
- [ ] All 5 agents complete in < 3 weeks
- [ ] All case studies (25 total) in database
- [ ] Website deployed to Vercel
- [ ] Git repo clean (no secrets)
- [ ] Portfolio link live
- [ ] Zero security issues

---

## Next Steps

1. **You run**: `npx bmad-method@beta install` in your terminal
2. **Select**: BMM + TEA modules, Claude Code tool
3. **Then run**: `/bmad-help` to get oriented
4. **Then start**: `/product-brief` to define the project
5. **I'll assist**: With all BMad workflows and coding

**Once BMad is installed, let me know and we'll start with `/product-brief`!**
