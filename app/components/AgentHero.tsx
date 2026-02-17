'use client';

// Robot SVGs — inline, adapted for orb display
function ScoutRobot() {
  return (
    <svg viewBox="0 0 160 220" style={{ width: '75%', height: '75%' }}>
      <g className="robot-breathe">
        <ellipse cx="80" cy="215" rx="45" ry="6" fill="rgba(0,0,0,0.08)"/>
        <rect x="50" y="160" width="18" height="50" rx="6" fill="#669BBC"/>
        <rect x="92" y="160" width="18" height="50" rx="6" fill="#669BBC"/>
        <rect x="44" y="203" width="30" height="12" rx="5" fill="#4a7a94"/>
        <rect x="86" y="203" width="30" height="12" rx="5" fill="#4a7a94"/>
        <rect x="38" y="85" width="84" height="80" rx="12" fill="#669BBC"/>
        <rect x="50" y="98" width="60" height="45" rx="6" fill="#4a7a94"/>
        <circle cx="80" cy="120" r="12" fill="#5a8fa8"/>
        <circle cx="80" cy="120" r="6" fill="#669BBC"/>
        <rect x="12" y="90" width="20" height="50" rx="6" fill="#669BBC"/>
        <circle cx="22" cy="148" r="10" fill="#7eb3cc"/>
        <rect x="128" y="90" width="20" height="50" rx="6" fill="#669BBC"/>
        <circle cx="138" cy="148" r="10" fill="#7eb3cc"/>
        <rect x="42" y="18" width="76" height="72" rx="16" fill="#669BBC"/>
        <ellipse className="robot-blink" cx="62" cy="50" rx="11" ry="13" fill="#FDF0D5"/>
        <ellipse className="robot-blink" cx="98" cy="50" rx="11" ry="13" fill="#FDF0D5"/>
        <circle cx="62" cy="52" r="5" fill="#003049"/>
        <circle cx="98" cy="52" r="5" fill="#003049"/>
        <circle cx="59" cy="48" r="2.5" fill="white" opacity="0.9"/>
        <circle cx="95" cy="48" r="2.5" fill="white" opacity="0.9"/>
        <circle cx="128" cy="30" r="16" fill="none" stroke="#FDF0D5" strokeWidth="4"/>
        <line x1="139" y1="42" x2="150" y2="56" stroke="#FDF0D5" strokeWidth="4" strokeLinecap="round"/>
        <path d="M62 72 Q80 84 98 72" fill="none" stroke="#FDF0D5" strokeWidth="3" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function TickerRobot() {
  return (
    <svg viewBox="0 0 200 240" style={{ width: '75%', height: '75%' }}>
      <g className="robot-breathe">
        <rect x="60" y="100" width="80" height="90" rx="20" fill="#22c55e" stroke="#003049" strokeWidth="2"/>
        <rect x="70" y="110" width="60" height="40" rx="5" fill="#003049"/>
        <polyline points="75,140 85,130 95,135 105,125 115,128 125,120" stroke="#22c55e" strokeWidth="2" fill="none"/>
        <circle cx="100" cy="70" r="35" fill="#22c55e" stroke="#003049" strokeWidth="2"/>
        <line x1="100" y1="35" x2="100" y2="15" stroke="#003049" strokeWidth="3"/>
        <circle cx="100" cy="10" r="5" fill="#ef4444">
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
        </circle>
        <circle className="robot-blink" cx="90" cy="65" r="6" fill="#FDF0D5"/>
        <circle className="robot-blink" cx="110" cy="65" r="6" fill="#FDF0D5"/>
        <circle cx="90" cy="65" r="3" fill="#003049"/>
        <circle cx="110" cy="65" r="3" fill="#003049"/>
        <path d="M 85 80 Q 100 88 115 80" stroke="#003049" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <rect x="35" y="120" width="20" height="50" rx="10" fill="#22c55e" stroke="#003049" strokeWidth="2"/>
        <rect x="145" y="120" width="20" height="50" rx="10" fill="#22c55e" stroke="#003049" strokeWidth="2"/>
        <rect x="70" y="190" width="20" height="40" rx="10" fill="#22c55e" stroke="#003049" strokeWidth="2"/>
        <rect x="110" y="190" width="20" height="40" rx="10" fill="#22c55e" stroke="#003049" strokeWidth="2"/>
      </g>
    </svg>
  );
}

function MatcherRobot() {
  return (
    <svg viewBox="0 0 200 240" style={{ width: '75%', height: '75%' }}>
      <g className="robot-breathe">
        <rect x="60" y="100" width="80" height="90" rx="20" fill="#f97316" stroke="#003049" strokeWidth="2"/>
        <rect x="70" y="55" width="60" height="45" rx="10" fill="#f97316" stroke="#003049" strokeWidth="2"/>
        <polygon points="100,30 70,55 130,55" fill="#f97316" stroke="#003049" strokeWidth="2"/>
        <rect x="90" y="70" width="20" height="25" rx="2" fill="#003049"/>
        <rect className="robot-blink" x="80" y="60" width="12" height="12" rx="2" fill="#FDF0D5"/>
        <rect className="robot-blink" x="108" y="60" width="12" height="12" rx="2" fill="#FDF0D5"/>
        <rect x="35" y="120" width="20" height="50" rx="10" fill="#f97316" stroke="#003049" strokeWidth="2"/>
        <rect x="145" y="120" width="20" height="50" rx="10" fill="#f97316" stroke="#003049" strokeWidth="2"/>
        <rect x="70" y="190" width="20" height="40" rx="10" fill="#f97316" stroke="#003049" strokeWidth="2"/>
        <rect x="110" y="190" width="20" height="40" rx="10" fill="#f97316" stroke="#003049" strokeWidth="2"/>
      </g>
    </svg>
  );
}

function QuillRobot() {
  return (
    <svg viewBox="0 0 200 240" style={{ width: '75%', height: '75%' }}>
      <g className="robot-breathe">
        <rect x="60" y="100" width="80" height="90" rx="20" fill="#8b5cf6" stroke="#003049" strokeWidth="2"/>
        <rect x="70" y="110" width="60" height="50" rx="5" fill="#FDF0D5"/>
        <line x1="75" y1="120" x2="125" y2="120" stroke="#8b5cf6" strokeWidth="2"/>
        <line x1="75" y1="130" x2="125" y2="130" stroke="#8b5cf6" strokeWidth="2"/>
        <line x1="75" y1="140" x2="115" y2="140" stroke="#8b5cf6" strokeWidth="2"/>
        <circle cx="100" cy="70" r="35" fill="#8b5cf6" stroke="#003049" strokeWidth="2"/>
        <line x1="100" y1="35" x2="95" y2="10" stroke="#003049" strokeWidth="3"/>
        <polygon points="95,10 90,5 100,8" fill="#FDF0D5" stroke="#003049" strokeWidth="2"/>
        <circle className="robot-blink" cx="90" cy="65" r="6" fill="#FDF0D5"/>
        <circle className="robot-blink" cx="110" cy="65" r="6" fill="#FDF0D5"/>
        <circle cx="90" cy="65" r="3" fill="#003049"/>
        <circle cx="110" cy="65" r="3" fill="#003049"/>
        <path d="M 85 80 Q 100 88 115 80" stroke="#003049" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <rect x="35" y="120" width="20" height="50" rx="10" fill="#8b5cf6" stroke="#003049" strokeWidth="2"/>
        <rect x="145" y="120" width="20" height="50" rx="10" fill="#8b5cf6" stroke="#003049" strokeWidth="2"/>
        <rect x="70" y="190" width="20" height="40" rx="10" fill="#8b5cf6" stroke="#003049" strokeWidth="2"/>
        <rect x="110" y="190" width="20" height="40" rx="10" fill="#8b5cf6" stroke="#003049" strokeWidth="2"/>
      </g>
    </svg>
  );
}

function SageRobot() {
  return (
    <svg viewBox="0 0 200 240" style={{ width: '75%', height: '75%' }}>
      <g className="robot-breathe">
        <ellipse cx="100" cy="210" rx="50" ry="15" fill="#C1121F" opacity="0.3"/>
        <path d="M 60 210 Q 50 200 60 190" fill="#C1121F" opacity="0.7"/>
        <path d="M 140 210 Q 150 200 140 190" fill="#C1121F" opacity="0.7"/>
        <ellipse cx="100" cy="150" rx="45" ry="50" fill="#FDF0D5" stroke="#C1121F" strokeWidth="3"/>
        <ellipse cx="70" cy="160" rx="15" ry="35" fill="#FDF0D5" stroke="#C1121F" strokeWidth="3" transform="rotate(-20 70 160)"/>
        <ellipse cx="130" cy="160" rx="15" ry="35" fill="#FDF0D5" stroke="#C1121F" strokeWidth="3" transform="rotate(20 130 160)"/>
        <circle cx="100" cy="80" r="35" fill="#FDF0D5" stroke="#C1121F" strokeWidth="3"/>
        <text x="100" y="65" fontSize="20" fill="#C1121F" textAnchor="middle" fontFamily="serif" fontWeight="bold">ॐ</text>
        <line x1="85" y1="85" x2="95" y2="85" stroke="#C1121F" strokeWidth="3" strokeLinecap="round"/>
        <line x1="105" y1="85" x2="115" y2="85" stroke="#C1121F" strokeWidth="3" strokeLinecap="round"/>
        <path d="M 85 95 Q 100 100 115 95" stroke="#C1121F" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <circle cx="100" cy="45" r="20" fill="none" stroke="#C1121F" strokeWidth="2" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
        </circle>
      </g>
    </svg>
  );
}

// Pipeline step labels per agent — no emoji
const pipelines: Record<string, string[]> = {
  scout:   ['Plan Strategy', 'Industry Sources', 'Regulatory Data', 'Academic Sources', 'Extract Findings', 'Synthesize Report'],
  ticker:  ['Load Watchlist', 'Fetch Market Data', 'Analyze Events', 'Generate Alerts', 'Recommendations'],
  matcher: ['Parse Criteria', 'Search Listings', 'Rate Schools', 'Score Matches', 'Present Results'],
  quill:   ['Analyze Article', 'Extract Keywords', 'Rewrite & Enhance', 'SEO Check', 'Final Polish'],
  sage:    ['Receive Question', 'Search Verses', 'Select Teachings', 'Compose Answer', 'Suggest Journey'],
};

interface AgentHeroProps {
  slug: string;
  agentName: string;
  agentColor: string;
  description: string;
  status: 'live' | 'demo';
}

export default function AgentHero({ slug, agentName, agentColor, description, status }: AgentHeroProps) {
  const steps = pipelines[slug] ?? [];

  return (
    <div style={{ padding: '2rem 0 2.5rem', textAlign: 'center' }}>

      {/* Robot orb — centered */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <div
          className="robot-orb"
          style={{ '--glass-bg': 'var(--glass-light)' } as React.CSSProperties}
        >
          {slug === 'scout'   && <ScoutRobot />}
          {slug === 'ticker'  && <TickerRobot />}
          {slug === 'matcher' && <MatcherRobot />}
          {slug === 'quill'   && <QuillRobot />}
          {slug === 'sage'    && <SageRobot />}
        </div>
      </div>

      {/* Header block — centered */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', justifyContent: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-heading)',
            lineHeight: 1,
          }}>
            {agentName}
          </h1>
          <span className={`status-badge ${status}`}>
            {status === 'live' ? '● Live Chat' : '● Demos'}
          </span>
        </div>

        <p style={{
          margin: '0 auto',
          fontSize: '1rem',
          fontWeight: 500,
          color: agentColor,
          opacity: 0.9,
          maxWidth: '480px',
        }}>
          {description}
        </p>

        <p style={{
          margin: '0.6rem auto 0',
          fontSize: '0.8rem',
          color: 'var(--text-meta)',
          maxWidth: '400px',
        }}>
          {status === 'live'
            ? 'Live AI — ask anything below'
            : 'Pre-run case studies showing real agent outputs'}
        </p>
      </div>

      {/* Pipeline — single horizontal scrollable line */}
      <div className="pipeline-strip">
        {steps.map((step, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <span
              className="pipeline-chip"
              style={{ '--chip-color': agentColor + '45' } as React.CSSProperties}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="pipeline-arrow" style={{ color: agentColor + '80' }}>→</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
