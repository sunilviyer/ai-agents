'use client';

import { useState } from 'react';

interface Robot {
  id: string;
  name: string;
  color: string;
  description: string;
  status: 'live' | 'demo';
}

const robots: Robot[] = [
  {
    id: 'scout',
    name: 'Scout',
    color: '#669BBC',
    description: 'Fraud Trends Investigator',
    status: 'demo'
  },
  {
    id: 'ticker',
    name: 'Ticker',
    color: '#22c55e',
    description: 'Stock Portfolio Monitor',
    status: 'demo'
  },
  {
    id: 'matcher',
    name: 'Matcher',
    color: '#f97316',
    description: 'House Finder with School Ratings',
    status: 'demo'
  },
  {
    id: 'quill',
    name: 'Quill',
    color: '#8b5cf6',
    description: 'Article Editor & SEO Optimizer',
    status: 'demo'
  },
  {
    id: 'sage',
    name: 'Sage',
    color: '#C1121F',
    description: 'Bhagavad Gita Spiritual Guide',
    status: 'live'
  }
];

export default function RobotStage() {
  const [activeRobot, setActiveRobot] = useState<string | null>(null);

  return (
    <div className="glass-panel p-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4" style={{ color: '#FDF0D5' }}>
          Meet the AI Agents
        </h1>
        <p className="text-xl" style={{ color: '#669BBC' }}>
          Click on each robot to see their agentic capabilities
        </p>
      </div>

      {/* Robot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {robots.map((robot) => (
          <button
            key={robot.id}
            onClick={() => setActiveRobot(activeRobot === robot.id ? null : robot.id)}
            className="glass-card p-8 hover:scale-105 transition-transform duration-300 cursor-pointer relative"
          >
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                robot.status === 'live'
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}>
                {robot.status === 'live' ? 'LIVE CHAT' : 'PRE-RUN DEMOS'}
              </span>
            </div>

            {/* Robot SVG Container */}
            <div className="mb-6 robot-breathe">
              {robot.id === 'scout' && <ScoutRobot />}
              {robot.id === 'ticker' && <TickerRobot />}
              {robot.id === 'matcher' && <MatcherRobot />}
              {robot.id === 'quill' && <QuillRobot />}
              {robot.id === 'sage' && <SageRobot />}
            </div>

            {/* Robot Info */}
            <h3 className="text-2xl font-bold mb-2" style={{ color: robot.color }}>
              {robot.name}
            </h3>
            <p style={{ color: 'rgba(253, 240, 213, 0.8)' }}>
              {robot.description}
            </p>

            {/* Active Indicator */}
            {activeRobot === robot.id && (
              <div className="mt-4 text-sm font-semibold" style={{ color: '#669BBC' }}>
                ✨ Click to view demos →
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Active Robot Details */}
      {activeRobot && (
        <div className="glass-card p-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#FDF0D5' }}>
            {robots.find(r => r.id === activeRobot)?.name} Workflow
          </h2>
          <div style={{ color: '#669BBC' }}>
            <p className="mb-4">
              View pre-run case studies demonstrating this agent's capabilities:
            </p>
            <a
              href={`/agents/${activeRobot}`}
              className="inline-block px-6 py-3 font-semibold rounded-lg transition-colors duration-300"
              style={{
                backgroundColor: '#C1121F',
                color: '#FDF0D5'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#780000'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C1121F'}
            >
              View {robots.find(r => r.id === activeRobot)?.name} Demos →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// Scout Robot SVG (Steel Blue - Fraud Trends Investigator)
function ScoutRobot() {
  return (
    <svg viewBox="0 0 200 240" className="w-full h-48 mx-auto">
      {/* Body */}
      <rect x="60" y="100" width="80" height="90" rx="20" fill="#669BBC" stroke="#003049" strokeWidth="3"/>

      {/* Head */}
      <circle cx="100" cy="70" r="35" fill="#669BBC" stroke="#003049" strokeWidth="3"/>

      {/* Magnifying Glass Antenna */}
      <line x1="100" y1="35" x2="100" y2="15" stroke="#003049" strokeWidth="3"/>
      <circle cx="100" cy="10" r="8" fill="none" stroke="#003049" strokeWidth="3"/>

      {/* Eyes */}
      <circle cx="90" cy="65" r="6" fill="#FDF0D5" className="robot-blink"/>
      <circle cx="110" cy="65" r="6" fill="#FDF0D5" className="robot-blink"/>
      <circle cx="90" cy="65" r="3" fill="#003049"/>
      <circle cx="110" cy="65" r="3" fill="#003049"/>

      {/* Smile */}
      <path d="M 85 80 Q 100 88 115 80" stroke="#003049" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* Arms */}
      <rect x="35" y="120" width="20" height="50" rx="10" fill="#669BBC" stroke="#003049" strokeWidth="3"/>
      <rect x="145" y="120" width="20" height="50" rx="10" fill="#669BBC" stroke="#003049" strokeWidth="3"/>

      {/* Legs */}
      <rect x="70" y="190" width="20" height="40" rx="10" fill="#669BBC" stroke="#003049" strokeWidth="3"/>
      <rect x="110" y="190" width="20" height="40" rx="10" fill="#669BBC" stroke="#003049" strokeWidth="3"/>
    </svg>
  );
}

// Ticker Robot SVG (Green - Stock Monitor)
function TickerRobot() {
  return (
    <svg viewBox="0 0 200 240" className="w-full h-48 mx-auto">
      {/* Body with Chart Display */}
      <rect x="60" y="100" width="80" height="90" rx="20" fill="#22c55e" stroke="#003049" strokeWidth="3"/>

      {/* Chart Display */}
      <rect x="70" y="110" width="60" height="40" rx="5" fill="#003049"/>
      <polyline points="75,140 85,130 95,135 105,125 115,128 125,120" stroke="#22c55e" strokeWidth="2" fill="none"/>

      {/* Head */}
      <circle cx="100" cy="70" r="35" fill="#22c55e" stroke="#003049" strokeWidth="3"/>

      {/* Blinking Light Antenna */}
      <line x1="100" y1="35" x2="100" y2="15" stroke="#003049" strokeWidth="3"/>
      <circle cx="100" cy="10" r="5" fill="#ff0000">
        <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
      </circle>

      {/* Eyes */}
      <circle cx="90" cy="65" r="6" fill="#FDF0D5" className="robot-blink"/>
      <circle cx="110" cy="65" r="6" fill="#FDF0D5" className="robot-blink"/>
      <circle cx="90" cy="65" r="3" fill="#003049"/>
      <circle cx="110" cy="65" r="3" fill="#003049"/>

      {/* Smile */}
      <path d="M 85 80 Q 100 88 115 80" stroke="#003049" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* Arms */}
      <rect x="35" y="120" width="20" height="50" rx="10" fill="#22c55e" stroke="#003049" strokeWidth="3"/>
      <rect x="145" y="120" width="20" height="50" rx="10" fill="#22c55e" stroke="#003049" strokeWidth="3"/>

      {/* Legs */}
      <rect x="70" y="190" width="20" height="40" rx="10" fill="#22c55e" stroke="#003049" strokeWidth="3"/>
      <rect x="110" y="190" width="20" height="40" rx="10" fill="#22c55e" stroke="#003049" strokeWidth="3"/>
    </svg>
  );
}

// Matcher Robot SVG (Orange - House Finder)
function MatcherRobot() {
  return (
    <svg viewBox="0 0 200 240" className="w-full h-48 mx-auto">
      {/* Body */}
      <rect x="60" y="100" width="80" height="90" rx="20" fill="#f97316" stroke="#003049" strokeWidth="3"/>

      {/* House-shaped Head */}
      <rect x="70" y="55" width="60" height="45" rx="10" fill="#f97316" stroke="#003049" strokeWidth="3"/>
      <polygon points="100,30 70,55 130,55" fill="#f97316" stroke="#003049" strokeWidth="3"/>

      {/* Door */}
      <rect x="90" y="70" width="20" height="25" rx="2" fill="#003049"/>

      {/* Windows (Eyes) */}
      <rect x="80" y="60" width="12" height="12" rx="2" fill="#FDF0D5" className="robot-blink"/>
      <rect x="108" y="60" width="12" height="12" rx="2" fill="#FDF0D5" className="robot-blink"/>

      {/* Arms */}
      <rect x="35" y="120" width="20" height="50" rx="10" fill="#f97316" stroke="#003049" strokeWidth="3"/>
      <rect x="145" y="120" width="20" height="50" rx="10" fill="#f97316" stroke="#003049" strokeWidth="3"/>

      {/* Legs */}
      <rect x="70" y="190" width="20" height="40" rx="10" fill="#f97316" stroke="#003049" strokeWidth="3"/>
      <rect x="110" y="190" width="20" height="40" rx="10" fill="#f97316" stroke="#003049" strokeWidth="3"/>
    </svg>
  );
}

// Quill Robot SVG (Purple - Article Editor)
function QuillRobot() {
  return (
    <svg viewBox="0 0 200 240" className="w-full h-48 mx-auto">
      {/* Body with Paper Display */}
      <rect x="60" y="100" width="80" height="90" rx="20" fill="#8b5cf6" stroke="#003049" strokeWidth="3"/>

      {/* Paper Display */}
      <rect x="70" y="110" width="60" height="50" rx="5" fill="#FDF0D5"/>
      <line x1="75" y1="120" x2="125" y2="120" stroke="#8b5cf6" strokeWidth="2"/>
      <line x1="75" y1="130" x2="125" y2="130" stroke="#8b5cf6" strokeWidth="2"/>
      <line x1="75" y1="140" x2="115" y2="140" stroke="#8b5cf6" strokeWidth="2"/>

      {/* Head */}
      <circle cx="100" cy="70" r="35" fill="#8b5cf6" stroke="#003049" strokeWidth="3"/>

      {/* Quill Pen Antenna */}
      <line x1="100" y1="35" x2="95" y2="10" stroke="#003049" strokeWidth="3"/>
      <polygon points="95,10 90,5 100,8" fill="#FDF0D5" stroke="#003049" strokeWidth="2"/>

      {/* Eyes */}
      <circle cx="90" cy="65" r="6" fill="#FDF0D5" className="robot-blink"/>
      <circle cx="110" cy="65" r="6" fill="#FDF0D5" className="robot-blink"/>
      <circle cx="90" cy="65" r="3" fill="#003049"/>
      <circle cx="110" cy="65" r="3" fill="#003049"/>

      {/* Smile */}
      <path d="M 85 80 Q 100 88 115 80" stroke="#003049" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* Arms */}
      <rect x="35" y="120" width="20" height="50" rx="10" fill="#8b5cf6" stroke="#003049" strokeWidth="3"/>
      <rect x="145" y="120" width="20" height="50" rx="10" fill="#8b5cf6" stroke="#003049" strokeWidth="3"/>

      {/* Legs */}
      <rect x="70" y="190" width="20" height="40" rx="10" fill="#8b5cf6" stroke="#003049" strokeWidth="3"/>
      <rect x="110" y="190" width="20" height="40" rx="10" fill="#8b5cf6" stroke="#003049" strokeWidth="3"/>
    </svg>
  );
}

// Sage Robot SVG (Saffron/Red - Gita Guide)
function SageRobot() {
  return (
    <svg viewBox="0 0 200 240" className="w-full h-48 mx-auto">
      {/* Meditation Lotus Base */}
      <ellipse cx="100" cy="210" rx="50" ry="15" fill="#C1121F" opacity="0.5"/>
      <path d="M 60 210 Q 50 200 60 190" fill="#C1121F" opacity="0.7"/>
      <path d="M 140 210 Q 150 200 140 190" fill="#C1121F" opacity="0.7"/>

      {/* Body (Meditating Pose) */}
      <ellipse cx="100" cy="150" rx="45" ry="50" fill="#FDF0D5" stroke="#C1121F" strokeWidth="3"/>

      {/* Arms in Meditation */}
      <ellipse cx="70" cy="160" rx="15" ry="35" fill="#FDF0D5" stroke="#C1121F" strokeWidth="3" transform="rotate(-20 70 160)"/>
      <ellipse cx="130" cy="160" rx="15" ry="35" fill="#FDF0D5" stroke="#C1121F" strokeWidth="3" transform="rotate(20 130 160)"/>

      {/* Head */}
      <circle cx="100" cy="80" r="35" fill="#FDF0D5" stroke="#C1121F" strokeWidth="3"/>

      {/* Om Symbol on Forehead */}
      <text x="100" y="65" fontSize="20" fill="#C1121F" textAnchor="middle" fontFamily="serif" fontWeight="bold">ॐ</text>

      {/* Closed Eyes (Meditating) */}
      <line x1="85" y1="85" x2="95" y2="85" stroke="#C1121F" strokeWidth="3" strokeLinecap="round"/>
      <line x1="105" y1="85" x2="115" y2="85" stroke="#C1121F" strokeWidth="3" strokeLinecap="round"/>

      {/* Peaceful Smile */}
      <path d="M 85 95 Q 100 100 115 95" stroke="#C1121F" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* Halo */}
      <circle cx="100" cy="45" r="20" fill="none" stroke="#C1121F" strokeWidth="2" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}
