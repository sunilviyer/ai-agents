# BMad Method Setup Instructions

## Installation

Since BMad Method requires interactive setup, please run this in your terminal:

```bash
cd /Volumes/External/AIAgents
npx bmad-method@beta install
```

## Recommended Configuration

When prompted, select:

### 1. Modules to Install
- ✅ **BMad Method (BMM)** - Core framework (REQUIRED)
- ✅ **Test Architect (TEA)** - Enterprise testing (RECOMMENDED)
- ⬜ BMad Builder (BMB) - Only if creating custom workflows
- ⬜ Game Dev Studio - Not needed
- ⬜ Creative Intelligence Suite - Not needed

### 2. AI IDE Tool
- ✅ **Claude Code** (you're using this)

### 3. Project Type
- Select: **Web Application** or **Full-Stack Application**

## After Installation

BMad will create:
- `.claude/` - Agent configurations
- `bmad-artifacts/` - Workflow outputs
- Various agent slash commands

## Integration with Our Project

Once installed, we'll use BMad Method workflows for:

### 1. Proof of Concept (Fraud Trends Agent)
```
/product-brief
/create-prd
/create-architecture
/dev-story
/code-review
```

### 2. Remaining 4 Agents
We'll use the same workflow pattern:
- `/create-story` for each agent
- `/dev-story` to implement
- `/code-review` to validate
- `/test-automation` (if TEA installed)

### 3. Website Development
- `/create-architecture` for Next.js app
- `/dev-story` for each component
- `/code-review` for quality

## BMad + Our Architecture

BMad Method will help us:
- ✅ Structure the development process
- ✅ Create proper user stories for each agent
- ✅ Review code systematically
- ✅ Test thoroughly
- ✅ Document properly

Our project structure remains the same:
```
/AIAgents
├── .bmad/              (BMad framework - gitignored)
├── .claude/            (Agent configs from BMad)
├── bmad-artifacts/     (Planning docs - can commit)
├── agents/             (Our agent implementations)
├── website/            (Our Next.js frontend)
├── database/           (Our schema)
└── docs/               (Our documentation)
```

## Next Steps After Installation

1. Run `/bmad-help` to see available commands
2. Start with `/product-brief` to define the AI Agents Portfolio project
3. Then `/create-prd` to formalize requirements
4. Then we'll build Fraud Trends agent as proof-of-concept

## Important Notes

- BMad artifacts can be committed to git (they're documentation)
- BMad doesn't change our database schema or TypeScript types
- We'll use BMad workflows to guide development, not replace our architecture
- Security checklist still applies

---

**Run the installation now, then let me know when it's complete!**
