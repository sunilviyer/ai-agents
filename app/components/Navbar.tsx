'use client';

import { useTheme } from './ThemeProvider';

interface NavbarProps {
  agentName?: string;
  agentColor?: string;
  status?: 'live' | 'demo';
  showBack?: boolean;
}

// Sun icon (light mode)
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="8" y1="1" x2="8" y2="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="13.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="1" y1="8" x2="2.5" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="13.5" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3.05" y1="3.05" x2="4.12" y2="4.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11.88" y1="11.88" x2="12.95" y2="12.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12.95" y1="3.05" x2="11.88" y2="4.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="4.12" y1="11.88" x2="3.05" y2="12.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// Moon icon (dark mode)
function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 1.5A6 6 0 1 0 13.5 7.5 4.5 4.5 0 0 1 7.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
}

// Home icon
function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L1.5 7.5H3.5V14H6.5V10H9.5V14H12.5V7.5H14.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

export default function Navbar({ agentName, agentColor, status, showBack = true }: NavbarProps) {
  const { theme, toggle } = useTheme();
  const isDarkBg = false; // text color inherits from CSS vars

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

        {/* LEFT — back arrow + home icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '64px' }}>
          {showBack && (
            <a
              href="/"
              aria-label="Home"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-body)',
                textDecoration: 'none',
                opacity: 0.70,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.70')}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <HomeIcon />
            </a>
          )}
        </div>

        {/* CENTER — agent name + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flex: 1, justifyContent: 'center' }}>
          {agentName && (
            <>
              {agentColor && (
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: agentColor,
                  flexShrink: 0,
                  boxShadow: `0 0 5px ${agentColor}90`,
                }} />
              )}
              <span style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'var(--text-heading)',
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

        {/* RIGHT — theme toggle only */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: '64px' }}>
          <button
            className="theme-toggle"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </nav>
  );
}
