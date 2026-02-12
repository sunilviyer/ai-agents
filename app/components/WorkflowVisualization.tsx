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

// Calculate reading time based on text length (assuming 200 words per minute)
function calculateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  const minutes = words / 200;
  const milliseconds = minutes * 60 * 1000;
  return Math.max(3000, Math.min(milliseconds, 15000)); // Min 3s, max 15s
}

// Helper function to convert JSON details to natural, readable text
function formatDetailsAsText(details: Record<string, unknown>): { text: React.ReactNode; wordCount: number } {
  let totalWords = 0;

  const countWords = (str: string) => {
    const words = str.split(/\s+/).length;
    totalWords += words;
    return words;
  };

  const formatValue = (key: string, value: unknown, depth: number = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      countWords(value);
      // Long strings get their own paragraph
      if (value.length > 80) {
        return (
          <p key={key} className="mb-4 leading-relaxed">
            <strong className="font-semibold" style={{ color: '#FDF0D5' }}>
              {formatLabel(key)}:
            </strong>
            <br />
            <span className="mt-1 block pl-4 border-l-2" style={{ borderColor: 'rgba(253, 240, 213, 0.3)' }}>
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
      countWords(String(value));
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
        value.forEach(v => countWords(String(v)));
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
              <div key={idx} className="p-4 rounded-lg" style={{
                background: 'rgba(253, 240, 213, 0.05)',
                border: '1px solid rgba(253, 240, 213, 0.1)'
              }}>
                <div className="text-sm font-semibold mb-2 opacity-70" style={{ color: '#FDF0D5' }}>
                  Item {idx + 1}
                </div>
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
        <div key={key} className="mb-4 pl-4 border-l-2" style={{ borderColor: 'rgba(253, 240, 213, 0.3)' }}>
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
    return {
      text: <p className="italic opacity-70" style={{ color: '#FDF0D5' }}>No additional details available for this step.</p>,
      wordCount: 5
    };
  }

  const textContent = (
    <div className="space-y-3">
      {entries.map(([key, value]) => formatValue(key, value))}
    </div>
  );

  return { text: textContent, wordCount: totalWords };
}

export default function WorkflowVisualization({ steps, agentColor }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [displayedText, setDisplayedText] = useState<React.ReactNode>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];

  // Update content when step changes
  useEffect(() => {
    if (currentStep) {
      const formatted = formatDetailsAsText(currentStep.details);
      setDisplayedText(formatted.text);

      // Scroll to top of content
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  }, [currentStep]);

  // Auto-advance to next step with intelligent timing
  useEffect(() => {
    if (isPlaying && currentStepIndex < steps.length - 1) {
      const formatted = formatDetailsAsText(currentStep.details);
      const readingTime = calculateReadingTime(JSON.stringify(currentStep.details));
      const duration = currentStep?.duration_ms || readingTime;

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
    <div className="relative space-y-6">
      {/* GLASSMORPHIC WHITEBOARD */}
      <div className="relative overflow-hidden rounded-3xl"
           style={{
             background: 'linear-gradient(135deg, rgba(253, 240, 213, 0.95) 0%, rgba(253, 240, 213, 0.98) 100%)',
             boxShadow: '0 30px 90px rgba(0, 0, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
             backdropFilter: 'blur(60px)',
             border: '2px solid rgba(255, 255, 255, 0.6)'
           }}>

        {/* Whiteboard Header */}
        <div className="relative px-8 py-6 border-b-2"
             style={{
               background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 0%, transparent 100%)',
               borderColor: 'rgba(0, 48, 73, 0.15)'
             }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Step Number Badge - PROMINENT */}
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}dd 100%)`,
                    color: '#FDF0D5',
                    boxShadow: `0 10px 40px ${agentColor}60, inset 0 2px 0 rgba(255, 255, 255, 0.3)`,
                    border: '2px solid rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {currentStep.step_number}
                </div>
              </div>

              {/* Step Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl">{stepTypeIcons[currentStep.step_type] || stepTypeIcons.default}</span>
                  <h3 className="text-2xl font-bold tracking-tight" style={{
                    color: '#003049',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    {currentStep.step_name}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="px-3 py-1 rounded-lg uppercase tracking-wider font-semibold"
                        style={{
                          background: `${agentColor}30`,
                          color: agentColor,
                          border: `1px solid ${agentColor}50`
                        }}>
                    {currentStep.step_type}
                  </span>
                  <span style={{ color: '#669BBC' }} className="font-medium">
                    Step {currentStep.step_number} of {steps.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2" style={{ background: 'rgba(0, 48, 73, 0.1)' }}>
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
          className="px-10 py-10 min-h-[500px] max-h-[700px] overflow-y-auto"
          style={{
            color: '#003049',
            fontFamily: 'var(--font-geist-sans)',
            fontSize: '1rem',
            lineHeight: '1.8',
            scrollbarWidth: 'thin',
            scrollbarColor: `${agentColor}60 transparent`
          }}
        >
          <div className="prose max-w-none animate-fade-in"
               key={currentStep.step_number}>
            {displayedText}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="rounded-2xl p-6"
           style={{
             background: 'linear-gradient(135deg, rgba(0, 48, 73, 0.85) 0%, rgba(0, 26, 44, 0.95) 100%)',
             border: '1px solid rgba(102, 155, 188, 0.3)',
             boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
           }}>
        <div className="flex items-center gap-4 mb-6">
          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}dd 100%)`,
              color: '#FDF0D5',
              boxShadow: `0 10px 30px ${agentColor}50, inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110"
            style={{
              background: 'rgba(102, 155, 188, 0.2)',
              color: '#FDF0D5',
              border: '1px solid rgba(102, 155, 188, 0.3)'
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
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(102, 155, 188, 0.2)',
              color: '#FDF0D5',
              border: '1px solid rgba(102, 155, 188, 0.3)'
            }}
          >
            ←
          </button>

          {/* Next */}
          <button
            onClick={() => handleStepClick(Math.min(steps.length - 1, currentStepIndex + 1))}
            disabled={currentStepIndex >= steps.length - 1}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(102, 155, 188, 0.2)',
              color: '#FDF0D5',
              border: '1px solid rgba(102, 155, 188, 0.3)'
            }}
          >
            →
          </button>
        </div>

        {/* Step Timeline */}
        <div className="relative">
          <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: '#FDF0D5' }}>
            Timeline
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin"
               style={{ scrollbarColor: `${agentColor}60 transparent` }}>
            {steps.map((step, index) => (
              <button
                key={step.step_number}
                onClick={() => handleStepClick(index)}
                className="relative flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold transition-all duration-300 hover:scale-110"
                style={{
                  background: index === currentStepIndex
                    ? `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}dd 100%)`
                    : index < currentStepIndex
                      ? `rgba(102, 155, 188, 0.3)`
                      : 'rgba(0, 48, 73, 0.5)',
                  color: '#FDF0D5',
                  border: index === currentStepIndex
                    ? `2px solid ${agentColor}`
                    : '1px solid rgba(102, 155, 188, 0.2)',
                  boxShadow: index === currentStepIndex ? `0 0 30px ${agentColor}70` : 'none'
                }}
                title={step.step_name}
              >
                <span className="text-xl">{step.step_number}</span>
                {index < currentStepIndex && (
                  <span className="text-green-400 text-sm mt-1">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
