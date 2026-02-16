'use client';

import { useState, useEffect } from 'react';

const steps = [
  {
    number: "1",
    title: "Initialize Scan",
    type: "initialization",
    description: "The agent fetches current stock prices and company information from Twelve Data API for each ticker in your watchlist, providing real-time market data as the foundation for analysis.",
    speech: "Scanning your watchlist!"
  },
  {
    number: "2",
    title: "Search News",
    type: "search_news",
    description: "Searches for recent news articles about each stock using Tavily API, gathering headlines and stories that could impact stock prices from trusted financial news sources.",
    speech: "Finding latest news!"
  },
  {
    number: "3",
    title: "Search Filings",
    type: "search_filings",
    description: "Checks SEC EDGAR database for recent regulatory filings like 10-K annual reports, 10-Q quarterly reports, and 8-K event disclosures that may contain material information.",
    speech: "Checking SEC filings!"
  },
  {
    number: "4",
    title: "Classify Events",
    type: "classification",
    description: "Uses Claude AI to analyze all collected data and classify significant events by type (earnings, news, filings, analyst ratings, price movements) and severity level (low, medium, high, critical).",
    speech: "Classifying events!"
  },
  {
    number: "5",
    title: "Assess Impact",
    type: "analysis",
    description: "Performs AI-powered impact analysis on each classified event, evaluating potential effects on stock price, investor sentiment, and portfolio performance with detailed reasoning.",
    speech: "Assessing impact!"
  },
  {
    number: "6",
    title: "Generate Alerts",
    type: "synthesis",
    description: "Creates a prioritized list of actionable alerts sorted by severity, with specific recommendations for each stock (hold, buy, sell, monitor) based on comprehensive analysis of all events.",
    speech: "Creating your alerts!"
  }
];

export default function TickerEasel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [descVisible, setDescVisible] = useState(false);
  const [speechVisible, setSpeechVisible] = useState(false);
  const [armPointing, setArmPointing] = useState(false);
  const [descriptionChars, setDescriptionChars] = useState<string[]>([]);
  const [writtenChars, setWrittenChars] = useState(0);

  const step = steps[currentStep];

  useEffect(() => {
    animateStep();
  }, [currentStep]);

  const animateStep = () => {
    setIsAnimating(true);
    setTitleVisible(false);
    setDescVisible(false);
    setSpeechVisible(false);
    setArmPointing(false);
    setWrittenChars(0);

    setTimeout(() => setSpeechVisible(true), 100);
    setTimeout(() => setArmPointing(true), 300);
    setTimeout(() => setTitleVisible(true), 500);
    setTimeout(() => {
      setDescVisible(true);
      const chars = step.description.split('');
      setDescriptionChars(chars);

      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < chars.length) {
          setWrittenChars(charIndex + 1);
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setIsAnimating(false);
        }
      }, 12);
    }, 700);
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.length && !isAnimating) {
      setCurrentStep(index);
    }
  };

  return (
    <div className="ticker-easel-container">
      <style jsx>{`
        .ticker-easel-container {
          padding: 2rem 0;
        }

        .ticker-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .ticker-header h2 {
          font-size: 2rem;
          color: #FDF0D5;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .ticker-header h2 span {
          color: #22c55e;
        }

        .ticker-stage {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 3rem;
          position: relative;
        }

        .ticker-robot {
          position: relative;
          z-index: 10;
        }

        .ticker-robot-svg {
          width: 160px;
          height: 220px;
        }

        .robot-body {
          animation: breathe 2.5s ease-in-out infinite;
        }

        @keyframes breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .robot-eye {
          animation: blink 3.5s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }

        .robot-arm-right {
          transform-origin: 115px 95px;
          transition: transform 0.5s ease;
        }

        .robot-arm-right.pointing {
          transform: rotate(-60deg) translateX(15px) translateY(-10px);
        }

        .speech-bubble {
          position: absolute;
          top: -60px;
          right: -20px;
          background: #FDF0D5;
          padding: 0.6rem 1rem;
          border-radius: 16px;
          font-size: 0.85rem;
          color: #003049;
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          opacity: 0;
          transition: opacity 0.3s ease;
          font-weight: 500;
        }

        .speech-bubble.visible {
          opacity: 1;
        }

        .speech-bubble::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 30px;
          border: 6px solid transparent;
          border-top-color: #FDF0D5;
        }

        .ticker-easel {
          position: relative;
        }

        .easel-svg {
          width: 380px;
          height: 420px;
        }

        .whiteboard {
          position: absolute;
          top: 28px;
          left: 50%;
          transform: translateX(-50%);
          width: 290px;
          height: 260px;
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(248, 250, 252, 0.9) 50%,
            rgba(241, 245, 249, 0.95) 100%
          );
          border-radius: 6px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.2),
            inset 0 1px 1px rgba(255, 255, 255, 0.9),
            inset 0 -1px 1px rgba(0, 0, 0, 0.05),
            0 0 0 4px #c0c7cf,
            0 0 0 5px #a8aeb5,
            0 0 0 8px #d4d9de,
            0 4px 12px 8px rgba(0, 0, 0, 0.15);
        }

        .step-indicator {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.6rem;
          border-bottom: 2px solid rgba(100, 116, 139, 0.2);
          position: relative;
          z-index: 1;
        }

        .step-badge {
          background: #22c55e;
          color: white;
          padding: 0.25rem 0.7rem;
          border-radius: 100px;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .step-badge.initialization { background: #1e40af; }
        .step-badge.search_news { background: #15803d; }
        .step-badge.search_filings { background: #7c3aed; }
        .step-badge.classification { background: #0891b2; }
        .step-badge.analysis { background: #ea580c; }
        .step-badge.synthesis { background: #C1121F; }

        .step-count {
          font-family: 'Caveat', cursive;
          font-size: 1rem;
          color: #64748b;
        }

        .step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }

        .step-title {
          font-family: 'Caveat', cursive;
          font-size: 1.5rem;
          color: #b91c1c;
          margin: 0.5rem 0 0.75rem;
          overflow: hidden;
        }

        .step-title-text {
          display: inline-block;
          opacity: 0;
          transform: translateX(-100%);
          transition: all 0.6s ease 0.3s;
        }

        .step-title-text.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .step-description {
          font-size: 0.85rem;
          color: #475569;
          line-height: 1.5;
          opacity: 0;
          transition: opacity 0.5s ease 0.6s;
        }

        .step-description.visible {
          opacity: 1;
        }

        .step-description span {
          opacity: 0;
          transition: opacity 0.03s ease;
        }

        .step-description span.written {
          opacity: 1;
        }

        .progress-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .progress-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(253, 240, 213, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .progress-dot:hover {
          background: rgba(253, 240, 213, 0.5);
          transform: scale(1.2);
        }

        .progress-dot.active {
          background: #FDF0D5;
          transform: scale(1.2);
        }

        .progress-dot.completed {
          background: #22c55e;
        }

        .ticker-navigation {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .nav-btn {
          background: rgba(253, 240, 213, 0.15);
          color: #FDF0D5;
          border: 2px solid rgba(253, 240, 213, 0.3);
          padding: 0.75rem 1.75rem;
          border-radius: 100px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-btn:hover:not(:disabled) {
          background: rgba(253, 240, 213, 0.25);
          border-color: #FDF0D5;
          transform: translateY(-2px);
        }

        .nav-btn.primary {
          background: #FDF0D5;
          color: #780000;
          border-color: #FDF0D5;
        }

        .nav-btn.primary:hover:not(:disabled) {
          background: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(253, 240, 213, 0.3);
        }

        .nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @media (max-width: 700px) {
          .ticker-stage {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .ticker-robot-svg {
            width: 100px;
            height: 140px;
          }

          .easel-svg {
            width: 320px;
            height: 360px;
          }

          .whiteboard {
            width: 240px;
            height: 220px;
            padding: 1rem;
            top: 24px;
          }

          .step-title {
            font-size: 1.2rem;
          }

          .step-description {
            font-size: 0.75rem;
          }
        }
      `}</style>

      <div className="ticker-header">
        <h2>📈 <span>Ticker</span> Explains: Stock Portfolio Monitoring</h2>
      </div>

      <div className="ticker-stage">
        {/* Robot */}
        <div className="ticker-robot">
          <div className={`speech-bubble ${speechVisible ? 'visible' : ''}`}>
            {step.speech}
          </div>

          <svg className="ticker-robot-svg" viewBox="0 0 160 220">
            <g className="robot-body">
              <ellipse cx="80" cy="215" rx="45" ry="6" fill="rgba(0,0,0,0.2)"/>
              <rect x="50" y="160" width="18" height="50" rx="6" fill="#22c55e"/>
              <rect x="92" y="160" width="18" height="50" rx="6" fill="#22c55e"/>
              <rect x="44" y="203" width="30" height="12" rx="5" fill="#16a34a"/>
              <rect x="86" y="203" width="30" height="12" rx="5" fill="#16a34a"/>
              <rect x="38" y="85" width="84" height="80" rx="12" fill="#22c55e"/>
              <rect x="50" y="98" width="60" height="45" rx="6" fill="#16a34a"/>
              <circle cx="80" cy="120" r="12" fill="#4ade80"/>
              <circle cx="80" cy="120" r="6" fill="#22c55e"/>
              <g className="robot-arm-left">
                <rect x="12" y="90" width="20" height="50" rx="6" fill="#22c55e"/>
                <circle cx="22" cy="148" r="10" fill="#4ade80"/>
              </g>
              <g className={`robot-arm-right ${armPointing ? 'pointing' : ''}`}>
                <rect x="128" y="90" width="20" height="50" rx="6" fill="#22c55e"/>
                <circle cx="138" cy="148" r="10" fill="#4ade80"/>
                <rect x="132" y="138" width="45" height="5" rx="2" fill="#5a4a3a" transform="rotate(-45 132 140)"/>
                <circle cx="162" cy="118" r="4" fill="#C1121F"/>
              </g>
              <rect x="42" y="18" width="76" height="72" rx="16" fill="#22c55e"/>
              <ellipse className="robot-eye" cx="62" cy="50" rx="11" ry="13" fill="#FDF0D5"/>
              <ellipse className="robot-eye" cx="98" cy="50" rx="11" ry="13" fill="#FDF0D5"/>
              <circle cx="62" cy="52" r="5" fill="#003049"/>
              <circle cx="98" cy="52" r="5" fill="#003049"/>
              <circle cx="59" cy="48" r="2.5" fill="white" opacity="0.9"/>
              <circle cx="95" cy="48" r="2.5" fill="white" opacity="0.9"/>
              <rect x="51" y="34" width="22" height="3" rx="1.5" fill="#16a34a" transform="rotate(-5 62 35)"/>
              <rect x="87" y="34" width="22" height="3" rx="1.5" fill="#16a34a" transform="rotate(5 98 35)"/>
              <path d="M 120 20 L 130 15 L 135 25 L 128 30 Z" fill="#FDF0D5"/>
              <line x1="130" y1="15" x2="135" y2="10" stroke="#FDF0D5" strokeWidth="3" strokeLinecap="round"/>
              <line x1="135" y1="25" x2="142" y2="25" stroke="#FDF0D5" strokeWidth="3" strokeLinecap="round"/>
              <path d="M62 72 Q80 84 98 72" fill="none" stroke="#FDF0D5" strokeWidth="3" strokeLinecap="round"/>
            </g>
          </svg>
        </div>

        {/* Easel with Whiteboard */}
        <div className="ticker-easel">
          <svg className="easel-svg" viewBox="0 0 380 420">
            <rect x="180" y="290" width="14" height="130" rx="4" fill="#6b5344" transform="rotate(-12 187 290)"/>
            <rect x="75" y="285" width="16" height="135" rx="4" fill="#8b7355"/>
            <rect x="73" y="285" width="20" height="8" rx="2" fill="#7a6548"/>
            <rect x="289" y="285" width="16" height="135" rx="4" fill="#8b7355"/>
            <rect x="287" y="285" width="20" height="8" rx="2" fill="#7a6548"/>
            <rect x="85" y="340" width="210" height="10" rx="3" fill="#7a6548"/>
            <rect x="60" y="280" width="260" height="14" rx="4" fill="#8b7355"/>
            <rect x="55" y="288" width="270" height="10" rx="2" fill="#6b5344"/>
            <rect x="55" y="286" width="270" height="6" rx="2" fill="#9a8672"/>
            <rect x="58" y="12" width="14" height="276" rx="4" fill="#8b7355"/>
            <rect x="308" y="12" width="14" height="276" rx="4" fill="#8b7355"/>
            <rect x="52" y="8" width="276" height="16" rx="5" fill="#7a6548"/>
            <circle cx="65" cy="16" r="3" fill="#5a4a3a"/>
            <circle cx="315" cy="16" r="3" fill="#5a4a3a"/>
            <circle cx="65" cy="284" r="3" fill="#5a4a3a"/>
            <circle cx="315" cy="284" r="3" fill="#5a4a3a"/>
            <rect x="130" y="292" width="120" height="8" rx="2" fill="#6b5344"/>
            <rect x="135" y="288" width="8" height="12" rx="2" fill="#1e40af"/>
            <rect x="148" y="288" width="8" height="12" rx="2" fill="#b91c1c"/>
            <rect x="161" y="288" width="8" height="12" rx="2" fill="#15803d"/>
            <rect x="174" y="288" width="8" height="12" rx="2" fill="#7c3aed"/>
            <rect x="187" y="288" width="8" height="12" rx="2" fill="#22c55e"/>
          </svg>

          <div className="whiteboard">
            <div className="step-indicator">
              <span className={`step-badge ${step.type}`}>{step.type.replace(/_/g, ' ')}</span>
              <span className="step-count">Step {currentStep + 1} of 6</span>
            </div>

            <div className="step-content">
              <div className="step-title">
                <span className={`step-title-text ${titleVisible ? 'visible' : ''}`}>{step.title}</span>
              </div>
              <p className={`step-description ${descVisible ? 'visible' : ''}`}>
                {descriptionChars.map((char, idx) => (
                  <span key={idx} className={idx < writtenChars ? 'written' : ''}>{char}</span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="progress-dots">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            onClick={() => goToStep(index)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="ticker-navigation">
        <button
          className="nav-btn"
          onClick={() => goToStep(currentStep - 1)}
          disabled={currentStep === 0}
        >
          ← Back
        </button>
        <button
          className="nav-btn primary"
          onClick={() => goToStep(currentStep + 1)}
          disabled={currentStep === steps.length - 1}
        >
          {currentStep === steps.length - 1 ? 'Complete ✓' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
