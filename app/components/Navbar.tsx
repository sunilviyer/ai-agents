'use client';

interface NavbarProps {
  agentName?: string;
  agentColor?: string;
  status?: 'live' | 'demo';
  showBack?: boolean;
}

export default function Navbar({ agentName, agentColor, status, showBack = true }: NavbarProps) {
  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

        {/* LEFT — back to agents list */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '80px' }}>
          {showBack && (
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'inherit',
                textDecoration: 'none',
                opacity: 0.75,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.75')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden-mobile">Agents</span>
            </a>
          )}
        </div>

        {/* CENTER — agent name + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, justifyContent: 'center' }}>
          {agentName && (
            <>
              {agentColor && (
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: agentColor,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${agentColor}80`,
                }} />
              )}
              <span style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                maxWidth: '160px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {agentName}
              </span>
              {status && (
                <span className={`status-badge ${status}`}>
                  {status === 'live' ? '● Live' : 'Demo'}
                </span>
              )}
            </>
          )}
        </div>

        {/* RIGHT — home link */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: '80px' }}>
          <a
            href="https://www.suniliyer.ca"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'inherit',
              textDecoration: 'none',
              opacity: 0.65,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.65')}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
              <path d="M7.5 1L1 7.5H3.5V14H6.5V10H8.5V14H11.5V7.5H14L7.5 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
            <span className="hidden-mobile">suniliyer.ca</span>
          </a>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 480px) {
          .hidden-mobile { display: none; }
        }
      `}</style>
    </nav>
  );
}
