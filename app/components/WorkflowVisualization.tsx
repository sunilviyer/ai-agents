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

// Specific step descriptions for Scout agent
const SCOUT_STEP_DESCRIPTIONS: Record<string, string> = {
  'planning': 'The agent creates a research plan by analyzing the user\'s fraud trend query and determining which sources to search, what keywords to use, and how to structure the investigation.',
  'search_industry': 'Searches insurance industry publications, reports, and news sources for recent fraud trends, case studies, and industry best practices.',
  'search_regulatory': 'Queries regulatory databases, government reports, and compliance documents for official fraud statistics, regulatory changes, and enforcement actions.',
  'search_academic': 'Searches academic journals, research papers, and white papers for scholarly analysis of fraud patterns, detection methods, and emerging risks.',
  'extraction': 'Analyzes all collected data from the three search sources, identifies key insights, statistics, trends, and patterns, and organizes them by relevance and credibility.',
  'synthesis': 'Combines all extracted findings into a coherent fraud trends report with executive summary, detailed analysis, statistics, and actionable recommendations.'
};

// Generate narrative explanation for each step
function generateNarrative(step: ExecutionStep): string {
  const { step_type } = step;

  // Use specific description if available
  if (SCOUT_STEP_DESCRIPTIONS[step_type]) {
    return SCOUT_STEP_DESCRIPTIONS[step_type];
  }

  // Fallback for other step types
  return `The agent is executing this step as part of its workflow process. Each action builds upon previous steps to achieve the final objective.`;
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
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
            <p className="text-lg leading-relaxed mb-6" style={{ color: '#003049' }}>
              {narrative}
            </p>

            {/* TECHNICAL DETAILS - ALWAYS VISIBLE */}
            <div className="mt-8">
              <div className="mb-4 pb-2 border-b-2" style={{ borderColor: 'rgba(0, 48, 73, 0.2)' }}>
                <h4 className="text-xl font-bold flex items-center gap-2" style={{ color: '#003049' }}>
                  <span>🔍</span>
                  <span>Technical Details</span>
                </h4>
              </div>
              <div className="p-6 rounded-xl"
                   style={{
                     background: 'rgba(0, 48, 73, 0.05)',
                     border: '1px solid rgba(0, 48, 73, 0.1)'
                   }}>
                {formatDetailsForAccordion(currentStep.details)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="rounded-2xl p-6"
           style={{
             background: 'linear-gradient(135deg, rgba(0, 48, 73, 0.9) 0%, rgba(0, 26, 44, 0.95) 100%)',
             border: '1px solid rgba(102, 155, 188, 0.3)',
             boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
           }}>
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
