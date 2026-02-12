'use client';

import { useState, useEffect, useRef } from 'react';

interface ExecutionStep {
  step_number: number;
  step_name: string;
  step_type: string;
  details: Record<string, unknown>;
  duration_ms: number | null;
  timestamp: string;
}

interface Props {
  steps: ExecutionStep[];
  agentColor: string;
}

const stepTypeIcons: Record<string, string> = {
  'setup': '⚙️',
  'search': '🔍',
  'analysis': '🧠',
  'synthesis': '✨',
  'filter': '🔎',
  'enrichment': '📊',
  'validation': '✅',
  'output': '📤',
  'default': '📍'
};

// Helper function to convert JSON details to natural, readable text
function formatDetailsAsText(details: Record<string, unknown>): React.ReactNode {
  const formatValue = (key: string, value: unknown, depth: number = 0): React.ReactNode => {
    const indent = '  '.repeat(depth);

    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      // Long strings get their own paragraph
      if (value.length > 80) {
        return (
          <p key={key} className="mb-4 leading-relaxed">
            <strong className="font-semibold" style={{ color: '#FDF0D5' }}>
              {formatLabel(key)}:
            </strong>
            <br />
            <span className="mt-1 block pl-4 border-l-2" style={{ borderColor: 'rgba(102, 155, 188, 0.3)' }}>
              {value}
            </span>
          </p>
        );
      }
      // Short strings inline
      return (
        <p key={key} className="mb-2">
          <strong className="font-semibold" style={{ color: '#FDF0D5' }}>
            {formatLabel(key)}:
          </strong>{' '}
          {value}
        </p>
      );
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return (
        <p key={key} className="mb-2">
          <strong className="font-semibold" style={{ color: '#FDF0D5' }}>
            {formatLabel(key)}:
          </strong>{' '}
          {String(value)}
        </p>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return null;

      // Check if array of simple values
      if (value.every(v => typeof v === 'string' || typeof v === 'number')) {
        return (
          <div key={key} className="mb-4">
            <strong className="font-semibold block mb-2" style={{ color: '#FDF0D5' }}>
              {formatLabel(key)}:
            </strong>
            <ul className="list-disc list-inside pl-4 space-y-1">
              {value.map((item, idx) => (
                <li key={idx}>{String(item)}</li>
              ))}
            </ul>
          </div>
        );
      }

      // Array of objects
      return (
        <div key={key} className="mb-6">
          <strong className="font-semibold block mb-3 text-lg" style={{ color: '#FDF0D5' }}>
            {formatLabel(key)}:
          </strong>
          <div className="space-y-4 pl-4">
            {value.map((item, idx) => (
              <div key={idx} className="glass-card p-4 rounded-lg">
                <div className="text-sm font-semibold mb-2 opacity-70">Item {idx + 1}</div>
                {typeof item === 'object' && item !== null
                  ? Object.entries(item as Record<string, unknown>).map(([k, v]) => formatValue(k, v, depth + 1))
                  : <span>{String(item)}</span>
                }
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const entries = Object.entries(obj);

      if (entries.length === 0) return null;

      return (
        <div key={key} className="mb-4 pl-4 border-l-2" style={{ borderColor: 'rgba(102, 155, 188, 0.3)' }}>
          <strong className="font-semibold block mb-2" style={{ color: '#FDF0D5' }}>
            {formatLabel(key)}:
          </strong>
          <div className="space-y-2">
            {entries.map(([k, v]) => formatValue(k, v, depth + 1))}
          </div>
        </div>
      );
    }

    return null;
  };

  const formatLabel = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const entries = Object.entries(details);
  if (entries.length === 0) {
    return <p className="italic opacity-70">No additional details available for this step.</p>;
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => formatValue(key, value))}
    </div>
  );
}

export default function WorkflowVisualization({ steps, agentColor }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [displayedText, setDisplayedText] = useState<React.ReactNode>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];

  // Typewriter effect for content
  useEffect(() => {
    if (currentStep) {
      // Immediate display with fade-in
      setDisplayedText(formatDetailsAsText(currentStep.details));

      // Scroll to top of content
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  }, [currentStep]);

  // Auto-advance to next step
  useEffect(() => {
    if (isPlaying && currentStepIndex < steps.length - 1) {
      const duration = currentStep?.duration_ms || 4000;

      timerRef.current = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
        setProgress(0);
      }, duration);

      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const increment = (100 / duration) * 50;
          return Math.min(prev + increment, 100);
        });
      }, 50);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        clearInterval(progressInterval);
      };
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
      setProgress(100);
    }
  }, [isPlaying, currentStepIndex, currentStep, steps.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
    setProgress(0);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setProgress(0);
    setIsPlaying(false);
  };

  if (!currentStep) return null;

  return (
    <div className="relative">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
             style={{ background: `radial-gradient(circle, ${agentColor} 0%, transparent 70%)` }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
             style={{ background: `radial-gradient(circle, ${agentColor} 0%, transparent 70%)` }} />
      </div>

      {/* Main Stage Container */}
      <div className="space-y-6">
        {/* Glassmorphic Whiteboard */}
        <div className="relative overflow-hidden rounded-3xl"
             style={{
               background: 'linear-gradient(135deg, rgba(0, 48, 73, 0.95) 0%, rgba(0, 26, 44, 0.98) 100%)',
               boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
               backdropFilter: 'blur(40px)',
               border: '1px solid rgba(102, 155, 188, 0.2)'
             }}>

          {/* Whiteboard Header Bar */}
          <div className="relative px-8 py-6 border-b border-steel-blue/20"
               style={{
                 background: 'linear-gradient(to bottom, rgba(102, 155, 188, 0.08) 0%, transparent 100%)'
               }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Step Number Badge */}
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}dd 100%)`,
                      color: '#FDF0D5',
                      boxShadow: `0 8px 32px ${agentColor}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                    }}
                  >
                    <span className="animate-pulse">{currentStep.step_number}</span>
                  </div>
                  {/* Animated Ring */}
                  <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                       style={{ background: agentColor }} />
                </div>

                {/* Step Info */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{stepTypeIcons[currentStep.step_type] || stepTypeIcons.default}</span>
                    <h3 className="text-xl font-bold tracking-tight" style={{
                      color: '#FDF0D5',
                      fontFamily: 'var(--font-geist-sans)'
                    }}>
                      {currentStep.step_name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-2 py-1 rounded-md uppercase tracking-wider font-semibold"
                          style={{
                            background: `${agentColor}20`,
                            color: agentColor,
                            border: `1px solid ${agentColor}30`
                          }}>
                      {currentStep.step_type}
                    </span>
                    {currentStep.duration_ms && (
                      <span style={{ color: '#669BBC' }}>
                        ⏱ {currentStep.duration_ms < 1000
                          ? `${currentStep.duration_ms}ms`
                          : `${(currentStep.duration_ms / 1000).toFixed(2)}s`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step Counter */}
              <div className="text-right">
                <div className="text-sm opacity-60" style={{ color: '#669BBC' }}>
                  Progress
                </div>
                <div className="text-2xl font-bold" style={{ color: '#FDF0D5' }}>
                  {currentStep.step_number}<span className="opacity-40">/{steps.length}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <div
                className="h-full transition-all duration-100 ease-linear"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${agentColor} 0%, ${agentColor}cc 100%)`,
                  boxShadow: `0 0 20px ${agentColor}80`
                }}
              />
            </div>
          </div>

          {/* Whiteboard Content Area */}
          <div
            ref={contentRef}
            className="px-8 py-8 min-h-[400px] max-h-[600px] overflow-y-auto"
            style={{
              color: '#669BBC',
              fontFamily: 'var(--font-geist-sans)',
              fontSize: '0.95rem',
              lineHeight: '1.7',
              scrollbarWidth: 'thin',
              scrollbarColor: `${agentColor}40 transparent`
            }}
          >
            <div className="prose prose-invert max-w-none animate-fade-in"
                 key={currentStep.step_number}>
              {displayedText}
            </div>
          </div>

          {/* Whiteboard Footer Glow */}
          <div className="h-px"
               style={{
                 background: `linear-gradient(90deg, transparent 0%, ${agentColor}30 50%, transparent 100%)`
               }} />
        </div>

        {/* Control Panel */}
        <div className="glass-card rounded-2xl p-6"
             style={{
               background: 'linear-gradient(135deg, rgba(0, 48, 73, 0.8) 0%, rgba(0, 26, 44, 0.9) 100%)',
               border: '1px solid rgba(102, 155, 188, 0.15)'
             }}>
          <div className="flex items-center gap-4 mb-6">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 hover:rotate-12"
              style={{
                background: `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}dd 100%)`,
                color: '#FDF0D5',
                boxShadow: `0 8px 24px ${agentColor}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 hover:-rotate-180"
              style={{
                background: 'rgba(0, 48, 73, 0.6)',
                color: '#669BBC',
                border: '1px solid rgba(102, 155, 188, 0.2)'
              }}
            >
              ↺
            </button>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* Previous */}
            <button
              onClick={() => handleStepClick(Math.max(0, currentStepIndex - 1))}
              disabled={currentStepIndex === 0}
              className="w-14 h-14 rounded-xl flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(0, 48, 73, 0.6)',
                color: '#669BBC',
                border: '1px solid rgba(102, 155, 188, 0.2)'
              }}
            >
              ←
            </button>

            {/* Next */}
            <button
              onClick={() => handleStepClick(Math.min(steps.length - 1, currentStepIndex + 1))}
              disabled={currentStepIndex >= steps.length - 1}
              className="w-14 h-14 rounded-xl flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(0, 48, 73, 0.6)',
                color: '#669BBC',
                border: '1px solid rgba(102, 155, 188, 0.2)'
              }}
            >
              →
            </button>
          </div>

          {/* Step Timeline */}
          <div className="relative">
            <div className="text-xs uppercase tracking-wider font-semibold mb-3 opacity-60"
                 style={{ color: '#669BBC' }}>
              Timeline
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
                 style={{ scrollbarColor: `${agentColor}40 transparent` }}>
              {steps.map((step, index) => (
                <button
                  key={step.step_number}
                  onClick={() => handleStepClick(index)}
                  className="relative flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-110"
                  style={{
                    background: index === currentStepIndex
                      ? `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}dd 100%)`
                      : index < currentStepIndex
                        ? `rgba(102, 155, 188, 0.2)`
                        : 'rgba(0, 48, 73, 0.4)',
                    color: '#FDF0D5',
                    border: index === currentStepIndex
                      ? `2px solid ${agentColor}`
                      : '1px solid rgba(102, 155, 188, 0.1)',
                    boxShadow: index === currentStepIndex ? `0 0 24px ${agentColor}60` : 'none'
                  }}
                  title={step.step_name}
                >
                  <span className="text-lg">{step.step_number}</span>
                  {index < currentStepIndex && (
                    <span className="text-green-400 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
