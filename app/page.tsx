import Link from 'next/link';

const agents = [
  {
    slug: 'scout',
    name: 'Scout',
    color: '#669BBC',
    description: 'Fraud Trends Investigator',
    status: 'demo' as const,
    emoji: '🔍',
    tagline: 'Mines industry & regulatory sources to surface emerging fraud patterns.',
    pipeline: ['Plan Strategy', 'Industry Sources', 'Regulatory Data', 'Synthesize Report'],
  },
  {
    slug: 'ticker',
    name: 'Ticker',
    color: '#22c55e',
    description: 'Stock Portfolio Monitor',
    status: 'demo' as const,
    emoji: '📈',
    tagline: 'Watches your portfolio 24/7, alerting you to earnings events and price swings.',
    pipeline: ['Load Watchlist', 'Fetch Market Data', 'Analyze Events', 'Generate Alerts'],
  },
  {
    slug: 'matcher',
    name: 'Matcher',
    color: '#f97316',
    description: 'House Finder with School Ratings',
    status: 'demo' as const,
    emoji: '🏠',
    tagline: 'Combines MLS listings with school ratings to score your perfect home match.',
    pipeline: ['Parse Criteria', 'Search Listings', 'Rate Schools', 'Score Matches'],
  },
  {
    slug: 'quill',
    name: 'Quill',
    color: '#8b5cf6',
    description: 'Article Editor & SEO Optimizer',
    status: 'demo' as const,
    emoji: '✏️',
    tagline: 'Rewrites and polishes articles for clarity, engagement, and SEO performance.',
    pipeline: ['Analyze Article', 'Extract Keywords', 'Rewrite & Enhance', 'SEO Check'],
  },
  {
    slug: 'sage',
    name: 'Sage',
    color: '#C1121F',
    description: 'Bhagavad Gita Spiritual Guide',
    status: 'live' as const,
    emoji: '🕉️',
    tagline: 'Answers your deepest questions through the wisdom of the Bhagavad Gita.',
    pipeline: ['Receive Question', 'Search Verses', 'Select Teachings', 'Compose Answer'],
  },
];

const techStack = [
  { icon: '🤖', name: 'Claude AI', sub: 'Anthropic' },
  { icon: '🔗', name: 'LangChain', sub: 'Framework' },
  { icon: '⚡', name: 'Next.js 15', sub: 'Frontend' },
  { icon: '🐘', name: 'PostgreSQL', sub: 'Neon Database' },
];

export default function Home() {
  return (
    <main className="bg-home min-h-screen" style={{ color: 'var(--text-body)' }}>
      {/* All content sits above the animated blobs */}
      <div className="section-z" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>

        {/* ── NAV ─────────────────────────────────── */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 0 0',
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.01em' }}>
            AI Agents Portfolio
          </span>
          <a
            href="https://www.suniliyer.ca"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-meta)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            🏠 suniliyer.ca
          </a>
        </nav>

        {/* ── HERO ────────────────────────────────── */}
        <div style={{ textAlign: 'center', padding: '4rem 0 3rem' }}>
          <div style={{
            display: 'inline-block',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-meta)',
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.8)',
            padding: '0.35rem 1rem',
            borderRadius: '100px',
            marginBottom: '1.5rem',
          }}>
            5 Agents · LangChain · Claude AI
          </div>

          <h1 style={{
            margin: '0 0 1rem',
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            color: 'var(--text-heading)',
          }}>
            AI Agents that<br />
            <span style={{ color: '#669BBC' }}>actually work</span>
          </h1>

          <p style={{
            margin: '0 auto',
            maxWidth: '520px',
            fontSize: '1.05rem',
            lineHeight: 1.65,
            color: 'var(--text-body)',
          }}>
            Five distinct agents demonstrating real agentic workflows —
            from fraud research to spiritual guidance.
            Built by{' '}
            <a href="https://www.suniliyer.ca" target="_blank" rel="noopener noreferrer"
               style={{ color: 'var(--text-heading)', fontWeight: 700, textDecoration: 'none' }}>
              Sunil Iyer
            </a>.
          </p>
        </div>

        {/* ── AGENT GRID ──────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '1.25rem',
          marginBottom: '4rem',
        }}>
          {agents.map((agent) => (
            <Link
              key={agent.slug}
              href={`/agents/${agent.slug}`}
              className="agent-tile"
            >
              {/* Accent stripe */}
              <div
                className="agent-tile-accent"
                style={{ background: agent.color }}
              />

              {/* Emoji avatar */}
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: agent.color + '18',
                border: `2px solid ${agent.color}35`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                marginBottom: '1rem',
              }}>
                {agent.emoji}
              </div>

              {/* Name + badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
                  {agent.name}
                </span>
                <span className={`status-badge ${agent.status}`}>
                  {agent.status === 'live' ? '● Live' : '● Demo'}
                </span>
              </div>

              {/* Description */}
              <p style={{
                margin: '0 0 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: agent.color,
              }}>
                {agent.description}
              </p>

              {/* Tagline */}
              <p style={{
                margin: '0 0 1rem',
                fontSize: '0.8rem',
                color: 'var(--text-body)',
                lineHeight: 1.45,
                textAlign: 'center',
              }}>
                {agent.tagline}
              </p>

              {/* Mini pipeline */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'center' }}>
                {agent.pipeline.map((step, i) => (
                  <span key={i} style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '100px',
                    background: agent.color + '14',
                    color: agent.color,
                    border: `1px solid ${agent.color}30`,
                  }}>
                    {step}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div style={{
                marginTop: '1.25rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: agent.color,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}>
                {agent.status === 'live' ? 'Chat now' : 'View demos'} →
              </div>
            </Link>
          ))}
        </div>

        {/* ── ABOUT STRIP ─────────────────────────── */}
        <div className="glass-panel" style={{ padding: '2rem 2.5rem', marginBottom: '2rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
                How it works
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Four agents run pre-recorded demos so you can see real outputs without API costs.
                Sage uses a local knowledge base for live responses.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { icon: '📥', label: 'Input', desc: 'User parameters & context' },
                { icon: '⚙️', label: 'Process', desc: 'Multi-step agent reasoning' },
                { icon: '📤', label: 'Output', desc: 'Structured, actionable results' },
              ].map(({ icon, label, desc }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{icon}</span>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-heading)' }}>{label}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-meta)', marginLeft: '0.4rem' }}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TECH STACK ──────────────────────────── */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          justifyContent: 'center',
        }}>
          {techStack.map(({ icon, name, sub }) => (
            <div key={name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '100px',
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.75)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              fontSize: '0.82rem',
            }}>
              <span>{icon}</span>
              <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{name}</span>
              <span style={{ color: 'var(--text-meta)' }}>{sub}</span>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
