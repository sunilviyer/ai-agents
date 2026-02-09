# 🤖 AI Agents Portfolio

A showcase of 5 distinct AI agents, each demonstrating different agentic capabilities. Built with LangChain, Claude AI, Next.js, and deployed on Vercel with Neon PostgreSQL.

---

## 🎯 Project Overview

This portfolio demonstrates **5 different agent archetypes**:

| Agent | Type | Demo Mode | Description |
|-------|------|-----------|-------------|
| 🔍 **Fraud Trends Investigator** | Research & Synthesis | Pre-run (4 case studies) | Deep research on insurance fraud patterns with source citations |
| 📈 **Market Watch Agent** | Event Detection & Alert | Pre-run (4 case studies) | Monitors stocks for M&A, buybacks, and corporate events |
| 🏠 **Home Match Agent** | Multi-Criteria Matching | Pre-run (4 case studies) | Finds homes matching requirements with school ratings |
| ✍️ **Article Enhancer** | Content Enhancement | Pre-run (4 case studies) | Transforms drafts into polished articles with references |
| 🙏 **Gita Guide** | Conversational Expert | **LIVE CHAT** (+ 4 examples) | Interactive Bhagavad Gita teacher |

### Why This Structure?

- **4 agents (Pre-run)**: Showcase complex workflows without API costs in production
- **1 agent (Live)**: Gita Guide uses a static knowledge base, making it safe and cost-effective to run live
- **Universal Schema**: All agents share the same database structure for consistency

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  USER PORTFOLIO WEBSITE (existing)                          │
│  └─> Links to: ai-agents.yourdomain.com                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  AI AGENTS LANDING PAGE (Next.js on Vercel)                 │
│  • Interactive robot demos                                  │
│  • Agent selection                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  INDIVIDUAL AGENT PAGES                                     │
│  • /agents/fraud-trends                                     │
│  • /agents/stock-monitor                                    │
│  • /agents/house-finder                                     │
│  • /agents/article-editor                                   │
│  • /agents/gita-guide (+ live chat)                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  NEON POSTGRESQL DATABASE                                   │
│  • case_studies (universal)                                 │
│  • execution_steps (universal)                              │
│  • gita_verses (Gita Guide only)                            │
│  • schools (House Finder only)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
/AIAgents
├── docs/                      # All requirement documents
├── agents/                    # Python agent implementations (run locally)
│   ├── fraud-trends/
│   ├── stock-monitor/
│   ├── house-finder/
│   ├── article-editor/
│   └── gita-guide/
├── website/                   # Next.js frontend (deployed to Vercel)
│   ├── src/
│   │   ├── app/              # App router
│   │   ├── components/       # React components
│   │   └── lib/              # DB, types, utilities
│   └── public/
├── database/                  # SQL schema and migrations
└── scripts/                   # Data loading utilities
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (Neon DB recommended)
- API Keys (see `.env.example`)

### 1. Clone and Setup

```bash
# Install dependencies
cd website
npm install

cd ../agents
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your keys:
# - DATABASE_URL (from Neon)
# - ANTHROPIC_API_KEY
# - TAVILY_API_KEY (for research agents)
# - FINNHUB_API_KEY (for stock monitor)
```

### 3. Setup Database

```bash
# Create database schema
psql $DATABASE_URL -f database/schema.sql

# Load Gita Guide data (if using)
python scripts/load-gita-data.py

# Load school data (if using House Finder)
python scripts/load-school-data.py
```

### 4. Run Agents Locally (Generate Case Studies)

```bash
# Example: Run Article Editor
cd agents/article-editor
python agent.py

# This generates: output/case_study_001.json
```

### 5. Import Case Studies to Database

```bash
python scripts/import-case-studies.py
```

### 6. Run Website Locally

```bash
cd website
npm run dev
# Visit: http://localhost:3000
```

---

## 🌐 Deployment

### Deploy to Vercel

```bash
cd website

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
SESSION_SECRET=random-secret-key
GITA_CHAT_MESSAGE_LIMIT=10
```

### Link from Your Portfolio

In your main portfolio site:

```html
<a href="https://ai-agents.yourdomain.com">
  🤖 Explore My AI Agents
</a>
```

---

## 📊 Data Sources

See [docs/DATA_SOURCING_STRATEGY.md](docs/DATA_SOURCING_STRATEGY.md) for detailed data requirements.

**Summary:**
- **Article Editor**: You write 5 draft articles
- **Fraud Trends**: Tavily API (free tier)
- **Stock Monitor**: Finnhub API (free tier)
- **House Finder**: Fraser Institute CSV + mock listings
- **Gita Guide**: Public domain Bhagavad Gita text

---

## 🎨 Design System

### Color Palette (from landing page)

```css
--molten-lava: #780000;
--flag-red: #C1121F;
--papaya-whip: #FDF0D5;
--deep-space-blue: #003049;
--steel-blue: #669BBC;
```

### Agent Colors

| Agent | Primary Color | Badge Color |
|-------|--------------|-------------|
| Fraud Trends | Steel Blue | `#669BBC` |
| Stock Monitor | Green | `#22c55e` |
| House Finder | Orange | `#f97316` |
| Article Editor | Purple | `#8b5cf6` |
| Gita Guide | Saffron/Red | `#C1121F` |

---

## 🔐 Security & Best Practices

### API Keys
- ✅ All API keys in `.env` (gitignored)
- ✅ Never commit secrets to git
- ✅ Use `.env.example` as template

### Rate Limiting (Gita Guide Live Chat)
- 10 messages per session (default)
- Session stored in localStorage
- Can be upgraded to Redis for production

### Database Security
- ✅ Connection pooling enabled
- ✅ SSL required for Neon connection
- ✅ Parameterized queries only

---

## 📈 Performance

### Pre-run Agents (Fraud, Stock, House, Article)
- **Website**: Fast - just reads from database
- **No LLM calls** in production
- **No API costs** after case studies generated

### Live Agent (Gita Guide)
- **LLM calls**: Only for live chat
- **Cost**: ~$0.01 per conversation (Claude Sonnet)
- **Rate limited**: 10 messages/session
- **Knowledge base**: Static (no external APIs)

---

## 🧪 Testing

### Test Case Studies

```bash
# Test database connection
npm run test:db

# Test API routes
npm run test:api
```

### Manual Testing Checklist

- [ ] All 5 agents visible on landing page
- [ ] Each agent page loads case studies
- [ ] Execution traces expand/collapse correctly
- [ ] Gita Guide live chat responds
- [ ] Rate limiting works (try 11 messages)
- [ ] Mobile responsive

---

## 📚 Documentation

- [Data Sourcing Strategy](docs/DATA_SOURCING_STRATEGY.md)
- [Fraud Trends Agent Spec](docs/01-fraud-trends-agent.md)
- [Stock Monitor Agent Spec](docs/02-stock-monitor-agent.md)
- [House Finder Agent Spec](docs/03-house-finder-agent.md)
- [Article Editor Agent Spec](docs/04-article-editor-agent.md)
- [Gita Guide Agent Spec](docs/05-gita-guide-agent.md)

---

## 🎯 Roadmap

### Phase 1: Infrastructure ✅
- [x] Folder structure
- [x] Database schema
- [x] TypeScript types
- [x] Environment setup

### Phase 2: Build Agents (In Progress)
- [ ] Article Editor agent
- [ ] Fraud Trends agent
- [ ] Gita Guide agent
- [ ] Stock Monitor agent
- [ ] House Finder agent

### Phase 3: Frontend
- [ ] Shared components
- [ ] Agent pages
- [ ] API routes
- [ ] Live chat interface

### Phase 4: Deploy
- [ ] Vercel deployment
- [ ] Domain setup
- [ ] Testing

---

## 🤝 Contributing

This is a personal portfolio project, but if you find it useful:

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a PR

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Claude AI** by Anthropic
- **LangChain** framework
- **Neon** for PostgreSQL
- **Vercel** for hosting
- **Fraser Institute** for school data
- **Bhagavad Gita** public domain translations

---

## 📧 Contact

Built by [Your Name]
Portfolio: [your-portfolio.com]
GitHub: [@yourusername]

---

**Ready to explore AI agents? Visit: [ai-agents.yourdomain.com](#)**
