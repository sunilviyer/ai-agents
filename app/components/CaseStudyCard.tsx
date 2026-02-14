'use client';

import { useState } from 'react';
import WorkflowVisualization from './WorkflowVisualization';

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

export default function CaseStudyCard({ caseStudy, agentColor }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Extract relevant data
  const originalText = caseStudy.inputParameters?.original_text as string;
  const targetKeywords = caseStudy.inputParameters?.target_keywords as string;
  const targetAudience = caseStudy.inputParameters?.target_audience as string;

  const tldr = caseStudy.outputResult?.tldr as string;
  const keyLearnings = caseStudy.outputResult?.key_learnings as string[];
  const enhancedArticle = caseStudy.outputResult?.enhanced_article as string;
  const editorNotes = caseStudy.outputResult?.editor_notes as string;

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

      {/* Input Parameters Section */}
      {(originalText || targetKeywords) && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('input')}
            className="w-full flex items-center justify-between p-4 rounded-lg transition-all"
            style={{
              background: expandedSection === 'input'
                ? `linear-gradient(135deg, ${agentColor}20, ${agentColor}10)`
                : 'rgba(0, 48, 73, 0.3)',
              border: `1px solid ${expandedSection === 'input' ? agentColor : 'rgba(102, 155, 188, 0.3)'}`
            }}
          >
            <h4 className="text-xl font-bold" style={{ color: '#FDF0D5' }}>
              📝 Input Parameters
            </h4>
            <span style={{ color: agentColor }}>{expandedSection === 'input' ? '▼' : '▶'}</span>
          </button>

          {expandedSection === 'input' && (
            <div className="mt-4 p-6 rounded-lg" style={{ background: 'rgba(0, 48, 73, 0.3)' }}>
              {targetKeywords && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2" style={{ color: agentColor }}>Target Keywords:</p>
                  <p className="text-base" style={{ color: '#FDF0D5' }}>{targetKeywords}</p>
                </div>
              )}
              {targetAudience && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2" style={{ color: agentColor }}>Target Audience:</p>
                  <p className="text-base" style={{ color: '#FDF0D5' }}>{targetAudience}</p>
                </div>
              )}
              {originalText && (
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: agentColor }}>Original Text Preview:</p>
                  <div className="p-4 rounded bg-black bg-opacity-20 font-mono text-sm overflow-auto max-h-60" style={{ color: '#669BBC' }}>
                    {originalText.substring(0, 500)}...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Output Results Section */}
      {(tldr || keyLearnings || editorNotes) && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('output')}
            className="w-full flex items-center justify-between p-4 rounded-lg transition-all"
            style={{
              background: expandedSection === 'output'
                ? `linear-gradient(135deg, ${agentColor}20, ${agentColor}10)`
                : 'rgba(0, 48, 73, 0.3)',
              border: `1px solid ${expandedSection === 'output' ? agentColor : 'rgba(102, 155, 188, 0.3)'}`
            }}
          >
            <h4 className="text-xl font-bold" style={{ color: '#FDF0D5' }}>
              ✨ Enhancement Results
            </h4>
            <span style={{ color: agentColor }}>{expandedSection === 'output' ? '▼' : '▶'}</span>
          </button>

          {expandedSection === 'output' && (
            <div className="mt-4 p-6 rounded-lg" style={{ background: 'rgba(0, 48, 73, 0.3)' }}>
              {tldr && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2" style={{ color: agentColor }}>TL;DR:</p>
                  <p className="text-base italic" style={{ color: '#FDF0D5' }}>{tldr}</p>
                </div>
              )}
              {keyLearnings && keyLearnings.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2" style={{ color: agentColor }}>Key Learnings:</p>
                  <ul className="list-disc list-inside space-y-2">
                    {keyLearnings.map((learning, idx) => (
                      <li key={idx} className="text-base" style={{ color: '#FDF0D5' }}>{learning}</li>
                    ))}
                  </ul>
                </div>
              )}
              {editorNotes && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2" style={{ color: agentColor }}>Editor Notes:</p>
                  <p className="text-base" style={{ color: '#FDF0D5' }}>{editorNotes}</p>
                </div>
              )}
              {enhancedArticle && (
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: agentColor }}>Enhanced Article Preview:</p>
                  <div className="p-4 rounded bg-black bg-opacity-20 font-mono text-sm overflow-auto max-h-60" style={{ color: '#669BBC' }}>
                    {enhancedArticle.substring(0, 500)}...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Execution Workflow - Always Visible */}
      {caseStudy.executionTrace && caseStudy.executionTrace.length > 0 && (
        <div className="animate-fade-in">
          <WorkflowVisualization steps={caseStudy.executionTrace} agentColor={agentColor} />
        </div>
      )}

    </div>
  );
}
