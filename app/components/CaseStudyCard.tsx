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

  // Extract relevant data - Article Editor (Quill)
  const originalText = caseStudy.inputParameters?.original_text as string;
  const targetKeywords = caseStudy.inputParameters?.target_keywords as string;
  const targetAudience = caseStudy.inputParameters?.target_audience as string;

  const tldr = caseStudy.outputResult?.tldr as string;
  const keyLearnings = caseStudy.outputResult?.key_learnings as string[];
  const enhancedArticle = caseStudy.outputResult?.enhanced_article as string;
  const editorNotes = caseStudy.outputResult?.editor_notes as string;

  // Extract relevant data - Stock Monitor (Ticker)
  const watchlist = caseStudy.inputParameters?.watchlist as string[];
  const timePeriod = caseStudy.inputParameters?.time_period as string;
  const eventTypes = caseStudy.inputParameters?.event_types as string[];
  const alertThreshold = caseStudy.inputParameters?.alert_threshold as string;

  const executiveSummary = caseStudy.outputResult?.executive_summary as string;
  const alerts = caseStudy.outputResult?.alerts as Array<{
    ticker: string;
    company_name: string;
    event_type: string;
    severity: string;
    headline: string;
    description: string;
    impact_analysis: string;
    action_suggested: string;
  }>;
  const recommendations = caseStudy.outputResult?.recommendations as string[];
  const marketContext = caseStudy.outputResult?.market_context as string;

  // Determine which type of content to show
  const isArticleEditor = !!(originalText || targetKeywords);
  const isStockMonitor = !!(watchlist && watchlist.length > 0);

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

      {/* Input Parameters Section - Article Editor */}
      {isArticleEditor && (
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

      {/* Input Parameters Section - Stock Monitor */}
      {isStockMonitor && (
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
              📊 Monitoring Parameters
            </h4>
            <span style={{ color: agentColor }}>{expandedSection === 'input' ? '▼' : '▶'}</span>
          </button>

          {expandedSection === 'input' && (
            <div className="mt-4 p-6 rounded-lg" style={{ background: 'rgba(0, 48, 73, 0.3)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {watchlist && (
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: agentColor }}>Watchlist:</p>
                    <div className="flex flex-wrap gap-2">
                      {watchlist.map((ticker, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full text-sm font-bold"
                              style={{ background: agentColor, color: '#003049' }}>
                          {ticker}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {timePeriod && (
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: agentColor }}>Time Period:</p>
                    <p className="text-base" style={{ color: '#FDF0D5' }}>{timePeriod}</p>
                  </div>
                )}
                {eventTypes && (
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: agentColor }}>Event Types:</p>
                    <p className="text-base" style={{ color: '#FDF0D5' }}>{eventTypes.join(', ')}</p>
                  </div>
                )}
                {alertThreshold && (
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: agentColor }}>Alert Threshold:</p>
                    <p className="text-base capitalize" style={{ color: '#FDF0D5' }}>{alertThreshold}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Output Results Section - Article Editor */}
      {isArticleEditor && (
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

      {/* Output Results Section - Stock Monitor */}
      {isStockMonitor && (
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
              🚨 Alerts & Analysis
            </h4>
            <span style={{ color: agentColor }}>{expandedSection === 'output' ? '▼' : '▶'}</span>
          </button>

          {expandedSection === 'output' && (
            <div className="mt-4 p-6 rounded-lg" style={{ background: 'rgba(0, 48, 73, 0.3)' }}>
              {executiveSummary && (
                <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: agentColor }}>Executive Summary:</p>
                  <p className="text-base" style={{ color: '#FDF0D5' }}>{executiveSummary}</p>
                </div>
              )}

              {alerts && alerts.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-3" style={{ color: agentColor }}>
                    Alerts ({alerts.length}):
                  </p>
                  <div className="space-y-4">
                    {alerts.map((alert, idx) => (
                      <div key={idx} className="p-4 rounded-lg border-l-4"
                           style={{
                             background: 'rgba(0, 0, 0, 0.2)',
                             borderLeftColor: alert.severity === 'high' || alert.severity === 'critical' ? '#ef4444' :
                                            alert.severity === 'medium' ? '#f59e0b' : '#10b981'
                           }}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="font-bold text-lg" style={{ color: '#FDF0D5' }}>
                              {alert.ticker}
                            </span>
                            <span className="ml-2 text-sm" style={{ color: '#669BBC' }}>
                              {alert.company_name}
                            </span>
                          </div>
                          <span className="px-2 py-1 rounded text-xs font-bold uppercase"
                                style={{
                                  background: alert.severity === 'high' || alert.severity === 'critical' ? '#ef4444' :
                                            alert.severity === 'medium' ? '#f59e0b' : '#10b981',
                                  color: 'white'
                                }}>
                            {alert.severity}
                          </span>
                        </div>
                        <h5 className="font-bold mb-2" style={{ color: agentColor }}>{alert.headline}</h5>
                        <p className="text-sm mb-3" style={{ color: '#FDF0D5' }}>{alert.description}</p>
                        <div className="text-sm mb-2" style={{ color: '#669BBC' }}>
                          <strong style={{ color: agentColor }}>Impact:</strong> {alert.impact_analysis}
                        </div>
                        <div className="text-sm p-3 rounded" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#FDF0D5' }}>
                          <strong style={{ color: agentColor }}>Recommended Action:</strong> {alert.action_suggested}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {marketContext && (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2" style={{ color: agentColor }}>Market Context:</p>
                  <p className="text-base" style={{ color: '#FDF0D5' }}>{marketContext}</p>
                </div>
              )}

              {recommendations && recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3" style={{ color: agentColor }}>Recommendations:</p>
                  <ul className="space-y-2">
                    {recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2" style={{ color: agentColor }}>✓</span>
                        <span className="text-base" style={{ color: '#FDF0D5' }}>{rec}</span>
                      </li>
                    ))}
                  </ul>
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
