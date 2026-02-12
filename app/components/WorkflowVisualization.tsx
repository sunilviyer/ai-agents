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

// Generate narrative explanation for each step
function generateNarrative(step: ExecutionStep): string {
  const { step_name, step_type, details } = step;

  // Extract key information from details
  const query = details.query as string || details.search_query as string || '';
  const results_count = details.results_count as number || details.count as number || 0;
  const action = details.action as string || '';
  const status = details.status as string || '';

  // Generate contextual narrative based on step type
  switch (step_type) {
    case 'setup':
      return `🎬 **Setting up the workflow**: The agent is initializing its environment and preparing to ${step_name.toLowerCase()}. This involves configuring parameters and validating inputs to ensure a smooth execution.`;

    case 'search':
      if (query) {
        return `🔍 **Searching for information**: The agent is querying databases and external sources with the search term "${query}". This step retrieves relevant data that will be analyzed in subsequent steps.`;
      }
      return `🔍 **Searching for information**: The agent is querying multiple data sources to gather comprehensive information. This foundational step ensures we have all necessary data for analysis.`;

    case 'analysis':
      if (results_count > 0) {
        return `🧠 **Analyzing ${results_count} results**: The agent is processing and evaluating the retrieved data. It's identifying patterns, extracting insights, and determining relevance to the task at hand.`;
      }
      return `🧠 **Analyzing data**: The agent is processing the collected information, applying analytical algorithms to extract meaningful insights and identify key patterns.`;

    case 'filter':
      return `🔎 **Filtering results**: The agent is refining the dataset by applying criteria and removing irrelevant information. This ensures only high-quality, pertinent data moves forward in the workflow.`;

    case 'enrichment':
      return `📊 **Enriching data**: The agent is enhancing the information by adding context, cross-referencing sources, and augmenting data points with additional relevant details.`;

    case 'synthesis':
      return `✨ **Synthesizing findings**: The agent is combining all analyzed data into coherent insights. It's connecting dots, identifying relationships, and formulating conclusions.`;

    case 'validation':
      if (status) {
        return `✅ **Validating results (${status})**: The agent is verifying the accuracy and completeness of its findings. Quality checks ensure the final output meets requirements.`;
      }
      return `✅ **Validating results**: The agent is performing quality checks to ensure accuracy, completeness, and reliability of the processed information.`;

    case 'output':
      return `📤 **Generating final output**: The agent is compiling all processed information into the final deliverable. This includes formatting, organizing, and presenting findings in a clear, actionable format.`;

    default:
      return `📍 **${step_name}**: The agent is executing this step as part of its workflow process. Each action builds upon previous steps to achieve the final objective.`;
  }
}

// Format details for accordion
function formatDetailsForAccordion(details: Record<string, unknown>): React.ReactNode {
  const formatValue = (key: string, value: unknown): React.ReactNode => {
    if (value === null || value === undefined) return null;

    const formatLabel = (k: string) => k.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();

    if (typeof value === 'string') {
      return (
        <div key={key} className="mb-2">
          <span className="font-semibold" style={{ color: '#003049' }}>{formatLabel(key)}:</span>{' '}
          <span style={{ color: '#669BBC' }}>{value}</span>
        </div>
      );
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return (
        <div key={key} className="mb-2">
          <span className="font-semibold" style={{ color: '#003049' }}>{formatLabel(key)}:</span>{' '}
          <span style={{ color: '#669BBC' }}>{String(value)}</span>
        </div>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      return (
        <div key={key} className="mb-3">
          <div className="font-semibold mb-1" style={{ color: '#003049' }}>{formatLabel(key)}:</div>
          <ul className="list-disc list-inside pl-4" style={{ color: '#669BBC' }}>
            {value.slice(0, 5).map((item, idx) => (
              <li key={idx}>{String(item)}</li>
            ))}
            {value.length > 5 && <li className="italic">... and {value.length - 5} more</li>}
          </ul>
        </div>
      );
    }

    if (typeof value === 'object') {
      return (
        <div key={key} className="mb-3 pl-3 border-l-2" style={{ borderColor: 'rgba(0, 48, 73, 0.2)' }}>
          <div className="font-semibold mb-1" style={{ color: '#003049' }}>{formatLabel(key)}:</div>
          {Object.entries(value as Record<string, unknown>).map(([k, v]) => formatValue(k, v))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-2">
      {Object.entries(details).map(([key, value]) => formatValue(key, value))}
    </div>
  );
}

export default function WorkflowVisualization({ steps, agentColor }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];

  // Auto-advance with intelligent timing
  useEffect(() => {
    if (isPlaying && currentStepIndex < steps.length - 1) {
      const duration = currentStep?.duration_ms || 5000; // 5 seconds default for reading

      timerRef.current = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
        setProgress(0);
        setShowDetails(false); // Close accordion when moving to next step
      }, duration);

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
    setShowDetails(false);
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setProgress(0);
    setIsPlaying(false);
    setShowDetails(false);
  };

  if (!currentStep) return null;

  const narrative = generateNarrative(currentStep);

  return (
    <div className="relative space-y-6">
      {/* GLASSMORPHIC WHITEBOARD */}
      <div className="relative overflow-hidden rounded-3xl"
           style={{
             background: 'linear-gradient(135deg, rgba(253, 240, 213, 0.98) 0%, rgba(253, 240, 213, 1) 100%)',
             boxShadow: '0 30px 90px rgba(0, 0, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
             backdropFilter: 'blur(60px)',
             border: '3px solid rgba(255, 255, 255, 0.8)'
           }}>

        {/* Whiteboard Header */}
        <div className="relative px-8 py-6 border-b-2"
             style={{
               background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%)',
               borderColor: 'rgba(0, 48, 73, 0.15)'
             }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* STEP NUMBER BADGE - SUPER PROMINENT */}
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center font-bold shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}cc 100%)`,
                    color: '#FDF0D5',
                    fontSize: '3rem',
                    boxShadow: `0 12px 48px ${agentColor}70, inset 0 2px 0 rgba(255, 255, 255, 0.4)`,
                    border: '3px solid rgba(255, 255, 255, 0.6)'
                  }}
                >
                  {currentStep.step_number}
                </div>
              </div>

              {/* Step Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-4xl">{stepTypeIcons[currentStep.step_type] || stepTypeIcons.default}</span>
                  <h3 className="text-2xl font-bold tracking-tight" style={{
                    color: '#003049',
                    fontFamily: 'var(--font-geist-sans)'
                  }}>
                    {currentStep.step_name}
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-base font-semibold" style={{ color: '#669BBC' }}>
                  <span>Step {currentStep.step_number} of {steps.length}</span>
                  <span className="px-3 py-1 rounded-lg uppercase tracking-wider text-xs"
                        style={{
                          background: `${agentColor}25`,
                          color: agentColor,
                          border: `1px solid ${agentColor}40`
                        }}>
                    {currentStep.step_type}
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
                background: `linear-gradient(90deg, ${agentColor} 0%, ${agentColor}aa 100%)`,
                boxShadow: `0 0 20px ${agentColor}90`
              }}
            />
          </div>
        </div>

        {/* Whiteboard Content Area - NARRATIVE EXPLANATION */}
        <div
          ref={contentRef}
          className="px-10 py-10 min-h-[400px]"
          style={{
            fontFamily: 'var(--font-geist-sans)',
            fontSize: '1.125rem',
            lineHeight: '2',
            color: '#003049'
          }}
        >
          <div className="prose max-w-none animate-fade-in" key={currentStep.step_number}>
            <p className="text-lg leading-relaxed" style={{ color: '#003049' }}>
              {narrative.split('**').map((part, idx) =>
                idx % 2 === 1 ? <strong key={idx} style={{ color: '#003049' }}>{part}</strong> : part
              )}
            </p>

            {/* ACCORDION FOR TECHNICAL DETAILS */}
            <div className="mt-8">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-between"
                style={{
                  background: showDetails ? `${agentColor}20` : 'rgba(0, 48, 73, 0.08)',
                  color: '#003049',
                  border: `2px solid ${showDetails ? agentColor : 'rgba(0, 48, 73, 0.15)'}`,
                  boxShadow: showDetails ? `0 4px 16px ${agentColor}30` : 'none'
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">{showDetails ? '📖' : '🔍'}</span>
                  <span>{showDetails ? 'Hide' : 'View'} Technical Details</span>
                </span>
                <span className="text-xl transform transition-transform duration-300"
                      style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </button>

              {showDetails && (
                <div className="mt-4 p-6 rounded-xl animate-fade-in"
                     style={{
                       background: 'rgba(0, 48, 73, 0.05)',
                       border: '1px solid rgba(0, 48, 73, 0.1)'
                     }}>
                  {formatDetailsForAccordion(currentStep.details)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="rounded-2xl p-6"
           style={{
             background: 'linear-gradient(135deg, rgba(0, 48, 73, 0.9) 0%, rgba(0, 26, 44, 0.95) 100%)',
             border: '1px solid rgba(102, 155, 188, 0.3)',
             boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
           }}>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}dd 100%)`,
              color: '#FDF0D5',
              boxShadow: `0 10px 30px ${agentColor}60, inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button
            onClick={handleReset}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110"
            style={{
              background: 'rgba(102, 155, 188, 0.25)',
              color: '#FDF0D5',
              border: '1px solid rgba(102, 155, 188, 0.4)'
            }}
          >
            ↺
          </button>

          <div className="flex-grow" />

          <button
            onClick={() => handleStepClick(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(102, 155, 188, 0.25)',
              color: '#FDF0D5',
              border: '1px solid rgba(102, 155, 188, 0.4)'
            }}
          >
            ←
          </button>

          <button
            onClick={() => handleStepClick(Math.min(steps.length - 1, currentStepIndex + 1))}
            disabled={currentStepIndex >= steps.length - 1}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 disabled:opacity-20 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(102, 155, 188, 0.25)',
              color: '#FDF0D5',
              border: '1px solid rgba(102, 155, 188, 0.4)'
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
                    ? `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}dd 100())`
                    : index < currentStepIndex
                      ? `rgba(102, 155, 188, 0.35)`
                      : 'rgba(0, 48, 73, 0.6)',
                  color: '#FDF0D5',
                  border: index === currentStepIndex
                    ? `2px solid ${agentColor}`
                    : '1px solid rgba(102, 155, 188, 0.3)',
                  boxShadow: index === currentStepIndex ? `0 0 30px ${agentColor}80` : 'none'
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
