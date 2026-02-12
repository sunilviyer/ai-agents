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

export default function WorkflowVisualization({ steps, agentColor }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = steps[currentStepIndex];

  // Auto-advance to next step
  useEffect(() => {
    if (isPlaying && currentStepIndex < steps.length - 1) {
      const duration = currentStep?.duration_ms || 3000;

      timerRef.current = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
        setProgress(0);
      }, duration);

      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const increment = (100 / duration) * 50; // Update every 50ms
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
    <div className="space-y-6">
      {/* Workflow Stage */}
      <div className="glass-card p-8 relative overflow-hidden">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-12 h-full">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border-r border-steel-blue" />
            ))}
          </div>
        </div>

        {/* Step Display Area */}
        <div className="relative z-10">
          {/* Step Header */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold animate-pulse"
              style={{
                backgroundColor: agentColor,
                color: '#FDF0D5',
                boxShadow: `0 0 20px ${agentColor}80`
              }}
            >
              {currentStep.step_number}
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">
                  {stepTypeIcons[currentStep.step_type] || stepTypeIcons.default}
                </span>
                <h3 className="text-2xl font-bold" style={{ color: '#FDF0D5' }}>
                  {currentStep.step_name}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold uppercase"
                  style={{
                    backgroundColor: `${agentColor}30`,
                    color: agentColor
                  }}
                >
                  {currentStep.step_type}
                </span>
                {currentStep.duration_ms && (
                  <span className="text-sm" style={{ color: '#669BBC' }}>
                    {currentStep.duration_ms < 1000
                      ? `${currentStep.duration_ms}ms`
                      : `${(currentStep.duration_ms / 1000).toFixed(2)}s`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="glass-card p-6 mb-6">
            <div className="font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
              <pre
                className="whitespace-pre-wrap animate-fade-in"
                style={{ color: '#669BBC' }}
                key={currentStep.step_number}
              >
                {JSON.stringify(currentStep.details, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-1 bg-deep-space-blue/30 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full transition-all duration-100 ease-linear rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: agentColor,
              boxShadow: `0 0 10px ${agentColor}`
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 hover:scale-110"
            style={{
              backgroundColor: agentColor,
              color: '#FDF0D5',
              boxShadow: `0 0 20px ${agentColor}60`
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 hover:scale-110"
            style={{
              backgroundColor: 'rgba(0, 48, 73, 0.85)',
              color: '#669BBC'
            }}
          >
            ↺
          </button>

          {/* Step Indicator Text */}
          <div className="flex-grow text-center">
            <span className="text-lg font-semibold" style={{ color: '#FDF0D5' }}>
              Step {currentStep.step_number} of {steps.length}
            </span>
          </div>

          {/* Previous/Next Buttons */}
          <button
            onClick={() => handleStepClick(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'rgba(0, 48, 73, 0.85)',
              color: '#669BBC'
            }}
          >
            ←
          </button>
          <button
            onClick={() => handleStepClick(Math.min(steps.length - 1, currentStepIndex + 1))}
            disabled={currentStepIndex >= steps.length - 1}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'rgba(0, 48, 73, 0.85)',
              color: '#669BBC'
            }}
          >
            →
          </button>
        </div>

        {/* Step Timeline */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <button
              key={step.step_number}
              onClick={() => handleStepClick(index)}
              className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300 hover:scale-110"
              style={{
                backgroundColor: index === currentStepIndex
                  ? agentColor
                  : index < currentStepIndex
                    ? `${agentColor}60`
                    : 'rgba(0, 48, 73, 0.5)',
                color: '#FDF0D5',
                border: index === currentStepIndex ? `2px solid ${agentColor}` : 'none',
                boxShadow: index === currentStepIndex ? `0 0 15px ${agentColor}80` : 'none'
              }}
              title={step.step_name}
            >
              {step.step_number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
