'use client';

import { useState } from 'react';

interface ExecutionStep {
  step_number: number;
  step_name: string;
  step_type: string;
  details: Record<string, unknown>;
  duration_ms: number | null;
  timestamp: string;
}

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  inputParameters: Record<string, unknown>;
  outputResult: Record<string, unknown>;
  executionTrace: ExecutionStep[];
}

interface Props {
  caseStudy: CaseStudy;
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

export default function CaseStudyCard({ caseStudy, agentColor }: Props) {
  const [showTrace, setShowTrace] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepNumber: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepNumber)) {
      newExpanded.delete(stepNumber);
    } else {
      newExpanded.add(stepNumber);
    }
    setExpandedSteps(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (ms: number | null) => {
    if (ms === null) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="glass-panel p-8">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-3xl font-bold mb-3" style={{ color: agentColor }}>
          {caseStudy.title}
        </h3>
        {caseStudy.description && (
          <p className="text-lg mb-4" style={{ color: '#FDF0D5' }}>
            {caseStudy.description}
          </p>
        )}
        <p className="text-sm" style={{ color: '#669BBC' }}>
          Generated: {formatDate(caseStudy.createdAt)}
        </p>
      </div>

      {/* Input Parameters */}
      <div className="mb-6 glass-card p-6">
        <h4 className="text-xl font-bold mb-3" style={{ color: '#FDF0D5' }}>
          📥 Input Parameters
        </h4>
        <div className="font-mono text-sm overflow-x-auto">
          <pre className="whitespace-pre-wrap" style={{ color: '#669BBC' }}>
            {JSON.stringify(caseStudy.inputParameters, null, 2)}
          </pre>
        </div>
      </div>

      {/* Output Summary */}
      <div className="mb-6 glass-card p-6">
        <h4 className="text-xl font-bold mb-3" style={{ color: '#FDF0D5' }}>
          📤 Output Summary
        </h4>
        <div className="font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap" style={{ color: '#669BBC' }}>
            {JSON.stringify(caseStudy.outputResult, null, 2)}
          </pre>
        </div>
      </div>

      {/* Execution Trace Toggle */}
      {caseStudy.executionTrace && caseStudy.executionTrace.length > 0 && (
        <>
          <button
            onClick={() => setShowTrace(!showTrace)}
            className="w-full px-6 py-4 font-semibold rounded-lg transition-all duration-300 flex items-center justify-between"
            style={{
              backgroundColor: showTrace ? agentColor : 'rgba(0, 48, 73, 0.85)',
              color: '#FDF0D5'
            }}
          >
            <span className="flex items-center gap-2">
              <span className="text-2xl">{showTrace ? '📖' : '📋'}</span>
              <span>
                {showTrace ? 'Hide' : 'Show'} Execution Trace
                ({caseStudy.executionTrace.length} steps)
              </span>
            </span>
            <span className="text-2xl transform transition-transform duration-300"
                  style={{ transform: showTrace ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              ▼
            </span>
          </button>

          {/* Execution Steps */}
          {showTrace && (
            <div className="mt-6 space-y-4 animate-fade-in">
              {caseStudy.executionTrace.map((step) => (
                <div key={step.step_number} className="glass-card p-6">
                  <button
                    onClick={() => toggleStep(step.step_number)}
                    className="w-full flex items-start gap-4 text-left"
                  >
                    {/* Step Number Circle */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold"
                      style={{
                        backgroundColor: agentColor,
                        color: '#FDF0D5'
                      }}
                    >
                      {step.step_number}
                    </div>

                    {/* Step Info */}
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">
                          {stepTypeIcons[step.step_type] || stepTypeIcons.default}
                        </span>
                        <h5 className="text-xl font-bold" style={{ color: '#FDF0D5' }}>
                          {step.step_name}
                        </h5>
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: 'rgba(102, 155, 188, 0.2)',
                            color: '#669BBC'
                          }}
                        >
                          {step.step_type}
                        </span>
                      </div>

                      {step.duration_ms !== null && (
                        <p className="text-sm" style={{ color: '#669BBC' }}>
                          Duration: {formatDuration(step.duration_ms)}
                        </p>
                      )}
                    </div>

                    {/* Expand Icon */}
                    <div className="flex-shrink-0">
                      <span
                        className="text-xl transform transition-transform duration-300"
                        style={{
                          transform: expandedSteps.has(step.step_number)
                            ? 'rotate(180deg)'
                            : 'rotate(0deg)',
                          display: 'inline-block',
                          color: '#669BBC'
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Step Details */}
                  {expandedSteps.has(step.step_number) && (
                    <div className="mt-4 pl-14 animate-fade-in">
                      <div className="font-mono text-sm overflow-x-auto">
                        <pre className="whitespace-pre-wrap" style={{ color: '#669BBC' }}>
                          {JSON.stringify(step.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
