'use client';

import { useState, useEffect } from 'react';

const steps = [
  {
    number: "1",
    title: "Analyze Structure",
    type: "analysis",
    description: "The agent analyzes the article's overall structure, identifying the introduction, main sections, conclusion, and how information flows throughout the piece.",
    speech: "Analyzing your article!"
  },
  {
    number: "2",
    title: "Identify Claims",
    type: "extraction",
    description: "Extracts all factual claims, statistics, and statements that would benefit from supporting references or examples to strengthen credibility.",
    speech: "Finding key claims!"
  },
  {
    number: "3",
    title: "Search References",
    type: "search",
    description: "Searches for authoritative sources, research papers, and credible references that support the article's claims and add depth to the content.",
    speech: "Searching for sources!"
  },
  {
    number: "4",
    title: "Find Examples",
    type: "examples",
    description: "Identifies opportunities to add concrete examples, case studies, and real-world illustrations that make abstract concepts more tangible and engaging.",
    speech: "Finding examples!"
  },
  {
    number: "5",
    title: "Improve Flow",
    type: "refinement",
    description: "Analyzes logical flow, transitions between sections, and readability. Suggests improvements to make the article more scannable with headings and formatting.",
    speech: "Improving flow!"
  },
  {
    number: "6",
    title: "Generate Suggestions",
    type: "synthesis",
    description: "Synthesizes all findings into actionable enhancement suggestions including SEO keywords, structural changes, and content additions aligned with best practices.",
    speech: "Creating suggestions!"
  },
  {
    number: "7",
    title: "Produce Enhanced Version",
    type: "output",
    description: "Applies all enhancements to create the final version: adds TLDR, bold examples, optimizes for target keywords, includes key learnings, and ensures professional yet human tone.",
    speech: "Writing enhanced article!"
  }
];

export default function QuillEasel() {
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
    <div className="quill-easel-container">
      <style jsx>{`
        .quill-easel-container {
          padding: 2rem 0;
        }

        .quill-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .quill-header h2 {
          font-size: 2rem;
          color: #FDF0D5;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .quill-header h2 span {
          color: #8b5cf6;
        }

        .quill-stage {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 3rem;
          position: relative;
        }

        .quill-robot {
          position: relative;
          z-index: 10;
        }

        .quill-robot-svg {
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

        .quill-easel {
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
          background: #8b5cf6;
          color: white;
          padding: 0.25rem 0.7rem;
          border-radius: 100px;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .step-badge.analysis { background: #1e40af; }
        .step-badge.extraction { background: #15803d; }
        .step-badge.search { background: #7c3aed; }
        .step-badge.examples { background: #0891b2; }
        .step-badge.refinement { background: #ea580c; }
        .step-badge.synthesis { background: #C1121F; }
        .step-badge.output { background: #8b5cf6; }

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
          background: #8b5cf6;
        }

        .quill-navigation {
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
          .quill-stage {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .quill-robot-svg {
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

      <div className="quill-header">
        <h2>✍️ <span>Quill</span> Explains: Article Enhancement</h2>
      </div>

      <div className="quill-stage">
        {/* Robot */}
        <div className="quill-robot">
          <div className={`speech-bubble ${speechVisible ? 'visible' : ''}`}>
            {step.speech}
          </div>

          <svg className="quill-robot-svg" viewBox="0 0 160 220">
            <g className="robot-body">
              <ellipse cx="80" cy="215" rx="45" ry="6" fill="rgba(0,0,0,0.2)"/>
              <rect x="50" y="160" width="18" height="50" rx="6" fill="#8b5cf6"/>
              <rect x="92" y="160" width="18" height="50" rx="6" fill="#8b5cf6"/>
              <rect x="44" y="203" width="30" height="12" rx="5" fill="#7c3aed"/>
              <rect x="86" y="203" width="30" height="12" rx="5" fill="#7c3aed"/>
              <rect x="38" y="85" width="84" height="80" rx="12" fill="#8b5cf6"/>
              <rect x="50" y="98" width="60" height="45" rx="6" fill="#7c3aed"/>
              <circle cx="80" cy="120" r="12" fill="#a78bfa"/>
              <circle cx="80" cy="120" r="6" fill="#8b5cf6"/>
              <g className="robot-arm-left">
                <rect x="12" y="90" width="20" height="50" rx="6" fill="#8b5cf6"/>
                <circle cx="22" cy="148" r="10" fill="#a78bfa"/>
              </g>
              <g className={`robot-arm-right ${armPointing ? 'pointing' : ''}`}>
                <rect x="128" y="90" width="20" height="50" rx="6" fill="#8b5cf6"/>
                <circle cx="138" cy="148" r="10" fill="#a78bfa"/>
                <rect x="132" y="138" width="45" height="5" rx="2" fill="#5a4a3a" transform="rotate(-45 132 140)"/>
                <circle cx="162" cy="118" r="4" fill="#C1121F"/>
              </g>
              <rect x="42" y="18" width="76" height="72" rx="16" fill="#8b5cf6"/>
              <ellipse className="robot-eye" cx="62" cy="50" rx="11" ry="13" fill="#FDF0D5"/>
              <ellipse className="robot-eye" cx="98" cy="50" rx="11" ry="13" fill="#FDF0D5"/>
              <circle cx="62" cy="52" r="5" fill="#003049"/>
              <circle cx="98" cy="52" r="5" fill="#003049"/>
              <circle cx="59" cy="48" r="2.5" fill="white" opacity="0.9"/>
              <circle cx="95" cy="48" r="2.5" fill="white" opacity="0.9"/>
              <rect x="51" y="34" width="22" height="3" rx="1.5" fill="#7c3aed" transform="rotate(-5 62 35)"/>
              <rect x="87" y="34" width="22" height="3" rx="1.5" fill="#7c3aed" transform="rotate(5 98 35)"/>
              <circle cx="128" cy="30" r="16" fill="none" stroke="#FDF0D5" strokeWidth="4"/>
              <path d="M 120 38 Q 128 28 136 38" fill="none" stroke="#FDF0D5" strokeWidth="3" strokeLinecap="round"/>
              <line x1="128" y1="26" x2="128" y2="20" stroke="#FDF0D5" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="128" cy="30" r="9" fill="rgba(253,240,213,0.15)"/>
              <path d="M62 72 Q80 84 98 72" fill="none" stroke="#FDF0D5" strokeWidth="3" strokeLinecap="round"/>
            </g>
          </svg>
        </div>

        {/* Easel with Whiteboard */}
        <div className="quill-easel">
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
            <rect x="187" y="288" width="8" height="12" rx="2" fill="#8b5cf6"/>
          </svg>

          <div className="whiteboard">
            <div className="step-indicator">
              <span className={`step-badge ${step.type}`}>{step.type}</span>
              <span className="step-count">Step {currentStep + 1} of 7</span>
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
      <div className="quill-navigation">
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
