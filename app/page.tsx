import Link from 'next/link';

// Compact robot SVGs for home page tiles — 64×64 viewbox
function TileRobot({ slug, color }: { slug: string; color: string }) {
  if (slug === 'scout') {
    const dark = '#00253a';
    return (
      <svg viewBox="0 0 64 80" width="46" height="46">
        <rect x="18" y="30" width="28" height="28" rx="5" fill={color}/>
        <rect x="22" y="34" width="20" height="14" rx="2" fill={dark}/>
        <circle cx="32" cy="41" r="4" fill={color} opacity="0.7"/>
        <rect x="4" y="32" width="11" height="16" rx="4" fill={color}/>
        <rect x="49" y="32" width="11" height="16" rx="4" fill={color}/>
        <rect x="16" y="8" width="32" height="24" rx="7" fill={color}/>
        <ellipse cx="24" cy="20" rx="5" ry="6" fill="#FDF0D5"/>
        <ellipse cx="40" cy="20" rx="5" ry="6" fill="#FDF0D5"/>
        <circle cx="24" cy="21" r="2.5" fill={dark}/>
        <circle cx="40" cy="21" r="2.5" fill={dark}/>
        <circle cx="44" cy="11" r="6" fill="none" stroke="#FDF0D5" strokeWidth="2"/>
        <line x1="48" y1="16" x2="52" y2="21" stroke="#FDF0D5" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }
  if (slug === 'ticker') {
    const dark = '#3a0000';
    return (
      <svg viewBox="0 0 64 80" width="46" height="46">
        <rect x="16" y="34" width="32" height="30" rx="8" fill={color}/>
        <rect x="20" y="38" width="24" height="14" rx="2" fill={dark}/>
        <polyline points="22,48 27,43 32,46 37,40 42,42" stroke="#ff9999" strokeWidth="1.5" fill="none"/>
        <circle cx="32" cy="22" r="14" fill={color}/>
        <circle cx="28" cy="20" r="3" fill="#FDF0D5"/>
        <circle cx="36" cy="20" r="3" fill="#FDF0D5"/>
        <circle cx="28" cy="20" r="1.5" fill={dark}/>
        <circle cx="36" cy="20" r="1.5" fill={dark}/>
        <line x1="32" y1="8" x2="32" y2="2" stroke={dark} strokeWidth="2"/>
        <circle cx="32" cy="1" r="2" fill="#ef4444">
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
        </circle>
        <rect x="4" y="40" width="10" height="18" rx="5" fill={color}/>
        <rect x="50" y="40" width="10" height="18" rx="5" fill={color}/>
      </svg>
    );
  }
  if (slug === 'matcher') {
    const dark = '#3d6b8a';
    return (
      <svg viewBox="0 0 64 80" width="46" height="46">
        <rect x="16" y="34" width="32" height="30" rx="8" fill={color}/>
        <rect x="26" y="20" width="12" height="16" rx="2" fill={dark}/>
        <polygon points="32,8 22,20 42,20" fill={color}/>
        <rect x="22" y="22" width="20" height="14" rx="2" fill={dark}/>
        <rect x="4" y="40" width="10" height="18" rx="5" fill={color}/>
        <rect x="50" y="40" width="10" height="18" rx="5" fill={color}/>
        <rect x="22" y="64" width="8" height="12" rx="4" fill={color}/>
        <rect x="34" y="64" width="8" height="12" rx="4" fill={color}/>
      </svg>
    );
  }
  if (slug === 'quill') {
    const dark = '#7a0b14';
    return (
      <svg viewBox="0 0 64 80" width="46" height="46">
        <rect x="16" y="34" width="32" height="30" rx="8" fill={color}/>
        <rect x="20" y="38" width="24" height="18" rx="2" fill="#FDF0D5"/>
        <line x1="22" y1="43" x2="42" y2="43" stroke={color} strokeWidth="1.5"/>
        <line x1="22" y1="48" x2="42" y2="48" stroke={color} strokeWidth="1.5"/>
        <line x1="22" y1="53" x2="36" y2="53" stroke={color} strokeWidth="1.5"/>
        <circle cx="32" cy="22" r="14" fill={color}/>
        <circle cx="28" cy="20" r="3" fill="#FDF0D5"/>
        <circle cx="36" cy="20" r="3" fill="#FDF0D5"/>
        <circle cx="28" cy="20" r="1.5" fill={dark}/>
        <circle cx="36" cy="20" r="1.5" fill={dark}/>
        <line x1="32" y1="8" x2="30" y2="2" stroke={dark} strokeWidth="2"/>
        <polygon points="30,2 28,0 32,1" fill="#FDF0D5"/>
        <rect x="4" y="40" width="10" height="18" rx="5" fill={color}/>
        <rect x="50" y="40" width="10" height="18" rx="5" fill={color}/>
      </svg>
    );
  }
  if (slug === 'sage') {
    return (
      <svg viewBox="0 0 64 80" width="46" height="46">
        <ellipse cx="32" cy="55" rx="16" ry="18" fill="#FDF0D5" stroke="#C1121F" strokeWidth="1.5"/>
        <circle cx="32" cy="26" r="14" fill="#FDF0D5" stroke="#C1121F" strokeWidth="1.5"/>
        <text x="32" y="31" fontSize="10" fill="#C1121F" textAnchor="middle" fontFamily="serif" fontWeight="bold">ॐ</text>
        <line x1="26" y1="33" x2="30" y2="33" stroke="#C1121F" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="34" y1="33" x2="38" y2="33" stroke="#C1121F" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="32" cy="12" r="8" fill="none" stroke="#C1121F" strokeWidth="1" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
        </circle>
      </svg>
    );
  }
  return null;
}

const agents = [
  {
    slug: 'scout',
    name: 'Scout',
    color: '#003049',
    description: 'Fraud Trends Investigator',
    status: 'demo' as const,
    tagline: 'Mines industry & regulatory sources to surface emerging fraud patterns.',
    pipeline: ['Plan Strategy', 'Industry Sources', 'Regulatory Data', 'Synthesize Report'],
  },
  {
    slug: 'ticker',
    name: 'Ticker',
    color: '#780000',
    description: 'Stock Portfolio Monitor',
    status: 'demo' as const,
    tagline: 'Watches your portfolio 24/7, alerting you to earnings events and price swings.',
    pipeline: ['Load Watchlist', 'Fetch Market Data', 'Analyze Events', 'Generate Alerts'],
  },
  {
    slug: 'matcher',
    name: 'Matcher',
    color: '#669BBC',
    description: 'House Finder with School Ratings',
    status: 'demo' as const,
    tagline: 'Combines MLS listings with school ratings to score your perfect home match.',
    pipeline: ['Parse Criteria', 'Search Listings', 'Rate Schools', 'Score Matches'],
  },
  {
    slug: 'quill',
    name: 'Quill',
    color: '#C1121F',
    description: 'Article Editor & SEO Optimizer',
    status: 'demo' as const,
    tagline: 'Rewrites and polishes articles for clarity, engagement, and SEO performance.',
    pipeline: ['Analyze Article', 'Extract Keywords', 'Rewrite & Enhance', 'SEO Check'],
  },
  {
    slug: 'sage',
    name: 'Sage',
    color: '#5a3e2b',
    description: 'Bhagavad Gita Spiritual Guide',
    status: 'live' as const,
    tagline: 'Answers your deepest questions through the wisdom of the Bhagavad Gita.',
    pipeline: ['Receive Question', 'Search Verses', 'Select Teachings', 'Compose Answer'],
  },
];

const techStack = [
  { name: 'Claude AI', sub: 'Anthropic' },
  { name: 'LangChain', sub: 'Framework' },
  { name: 'Next.js 15', sub: 'Frontend' },
  { name: 'PostgreSQL', sub: 'Neon Database' },
];

export default function Home() {
  return (
    <main
      className="bg-home"
      style={{
        minHeight: '100vh',
        color: 'var(--text-body)',
        backgroundImage: "url('/background/homepage-agent.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
      }}
    >
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

              {/* Robot avatar */}
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: agent.color + '14',
                border: `2px solid ${agent.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                flexShrink: 0,
              }}>
                <TileRobot slug={agent.slug} color={agent.color} />
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
                { label: 'Input', desc: 'User parameters & context' },
                { label: 'Process', desc: 'Multi-step agent reasoning' },
                { label: 'Output', desc: 'Structured, actionable results' },
              ].map(({ label, desc }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '6px',
                    background: 'rgba(102,155,188,0.15)',
                    border: '1px solid rgba(102,155,188,0.25)',
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 800,
                    color: '#669BBC', letterSpacing: '-0.01em',
                  }}>
                    {label[0]}
                  </div>
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
          {techStack.map(({ name, sub }) => (
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
              <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{name}</span>
              <span style={{ color: 'var(--text-meta)' }}>{sub}</span>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
