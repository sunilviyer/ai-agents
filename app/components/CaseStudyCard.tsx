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
  isDark?: boolean;
}

function formatDuration(ms: number | null): string {
  if (!ms) return '';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ── INPUT PANEL ──────────────────────────────────────────
function InputPanel({ caseStudy, agentColor, isDark }: Props) {
  const p = caseStudy.inputParameters;
  const textBody = isDark ? 'rgba(255,255,255,0.85)' : 'var(--text-body)';

  // Generic renderer
  const renderValue = (val: unknown): React.ReactNode => {
    if (Array.isArray(val)) {
      return (
        <div className="param-chips">
          {val.map((v, i) => (
            <span key={i} className="param-chip" style={{
              color: agentColor,
              borderColor: agentColor + '40',
              background: agentColor + '12',
            }}>{String(v)}</span>
          ))}
        </div>
      );
    }
    if (typeof val === 'string' && val.length > 200) {
      return <span style={{ color: textBody, fontSize: '0.8rem' }}>{val.substring(0, 200)}…</span>;
    }
    return <span style={{ color: textBody }}>{String(val)}</span>;
  };

  const entries = Object.entries(p).filter(([, v]) => v != null && v !== '');

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div className="panel-label">
        <span>📥</span> Input
      </div>
      {entries.map(([key, val]) => (
        <div key={key} className="param-row">
          <span className="param-label">{key.replace(/_/g, ' ')}</span>
          <div className="param-value">{renderValue(val)}</div>
        </div>
      ))}
      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
        <span style={{ fontSize: '0.72rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--text-meta)' }}>
          {formatDate(caseStudy.createdAt)}
        </span>
      </div>
    </div>
  );
}

// ── PROCESS PANEL ─────────────────────────────────────────
function ProcessPanel({ caseStudy, agentColor, isDark }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const steps = caseStudy.executionTrace ?? [];

  const totalDuration = steps.reduce((sum, s) => sum + (s.duration_ms ?? 0), 0);

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div className="panel-label" style={{ justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>⚙️</span> Process
        </span>
        {totalDuration > 0 && (
          <span style={{
            fontSize: '0.65rem',
            color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--text-meta)',
          }}>
            {formatDuration(totalDuration)} total
          </span>
        )}
      </div>

      <div className="step-timeline">
        {steps.map((step) => {
          const isOpen = expanded === step.step_number;
          const detailText = step.details
            ? Object.entries(step.details)
                .filter(([, v]) => v != null && String(v).trim())
                .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${typeof v === 'string' ? v.substring(0, 150) : JSON.stringify(v).substring(0, 150)}`)
                .slice(0, 3)
                .join(' • ')
            : '';

          return (
            <div key={step.step_number}>
              <button
                className={`step-pill ${isOpen ? 'expanded' : ''}`}
                onClick={() => setExpanded(isOpen ? null : step.step_number)}
                style={{ width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer', border: 'none', padding: 0 }}
              >
                <div className="step-pill" style={{ width: '100%' }}>
                  <span className="step-number" style={{ background: agentColor }}>
                    {step.step_number}
                  </span>
                  <span style={{
                    flex: 1,
                    fontSize: '0.80rem',
                    fontWeight: 600,
                    color: isDark ? 'rgba(255,255,255,0.88)' : 'var(--text-heading)',
                  }}>
                    {step.step_name}
                  </span>
                  {step.duration_ms != null && (
                    <span className="duration-badge">{formatDuration(step.duration_ms)}</span>
                  )}
                  <span style={{
                    fontSize: '0.65rem',
                    marginLeft: '0.25rem',
                    opacity: 0.5,
                    color: isDark ? 'white' : 'inherit',
                  }}>
                    {isOpen ? '▲' : '▼'}
                  </span>
                </div>
              </button>
              {isOpen && detailText && (
                <div className="step-detail">
                  {detailText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── OUTPUT PANEL ──────────────────────────────────────────
function OutputPanel({ caseStudy, agentColor, isDark }: Props) {
  const [showMore, setShowMore] = useState(false);
  const out = caseStudy.outputResult;
  const textBody = isDark ? 'rgba(255,255,255,0.85)' : 'var(--text-body)';
  const textMeta = isDark ? 'rgba(255,255,255,0.5)' : 'var(--text-meta)';

  // Try to find a prominent summary field
  const summary =
    (out?.executive_summary as string) ||
    (out?.tldr as string) ||
    (out?.answer as string) ||
    null;

  const keyLearnings = out?.key_learnings as string[] | null;
  const recommendations = out?.recommendations as string[] | null;
  const alerts = out?.alerts as Array<{ ticker: string; headline: string; severity: string }> | null;
  const verses = out?.relevant_verses as Array<{ verse_id: string; english_translation: string }> | null;
  const suggestedQ = out?.suggested_next_questions as string[] | null;
  const editorNotes = out?.editor_notes as string | null;
  const matchedProperties = out?.matched_properties as Array<{ address?: string; price?: number; match_score?: number }> | null;
  const marketContext = out?.market_context as string | null;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div className="panel-label">
        <span>📤</span> Output
      </div>

      {/* Summary hero */}
      {summary && (
        <div style={{
          padding: '0.85rem',
          borderRadius: '12px',
          background: agentColor + '12',
          border: `1px solid ${agentColor}30`,
          marginBottom: '0.85rem',
        }}>
          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            lineHeight: 1.55,
            color: textBody,
          }}>
            {showMore ? summary : summary.substring(0, 280) + (summary.length > 280 ? '…' : '')}
          </p>
          {summary.length > 280 && (
            <button
              onClick={() => setShowMore(!showMore)}
              style={{
                marginTop: '0.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: agentColor,
                padding: 0,
              }}
            >
              {showMore ? 'Show less ↑' : 'Read more ↓'}
            </button>
          )}
        </div>
      )}

      {/* Key learnings */}
      {keyLearnings && keyLearnings.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMeta, marginBottom: '0.35rem' }}>Key Learnings</div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {keyLearnings.slice(0, 3).map((l, i) => (
              <li key={i} style={{ fontSize: '0.8rem', color: textBody, lineHeight: 1.4 }}>{l}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Stock alerts */}
      {alerts && alerts.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMeta, marginBottom: '0.35rem' }}>
            Alerts ({alerts.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {alerts.slice(0, 3).map((alert, i) => (
              <div key={i} style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.3)',
                borderLeft: `3px solid ${
                  alert.severity === 'high' || alert.severity === 'critical' ? '#ef4444' :
                  alert.severity === 'medium' ? '#f59e0b' : '#10b981'
                }`,
                fontSize: '0.78rem',
                color: textBody,
              }}>
                <span style={{ fontWeight: 700, color: agentColor }}>{alert.ticker}</span>
                {' '}{alert.headline?.substring(0, 80)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMeta, marginBottom: '0.35rem' }}>Recommendations</div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {recommendations.slice(0, 3).map((r, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.78rem', color: textBody }}>
                <span style={{ color: agentColor, flexShrink: 0 }}>✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Market context */}
      {marketContext && (
        <div style={{ marginBottom: '0.75rem', fontSize: '0.78rem', color: textBody, lineHeight: 1.4 }}>
          {marketContext.substring(0, 150)}{marketContext.length > 150 ? '…' : ''}
        </div>
      )}

      {/* Matched properties */}
      {matchedProperties && matchedProperties.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMeta, marginBottom: '0.35rem' }}>
            Top Matches
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {matchedProperties.slice(0, 3).map((prop, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.4rem 0.6rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.3)',
                fontSize: '0.78rem',
                color: textBody,
              }}>
                <span>{prop.address?.substring(0, 40) ?? `Property ${i + 1}`}</span>
                {prop.match_score != null && (
                  <span style={{ fontWeight: 700, color: agentColor }}>{prop.match_score}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gita verses */}
      {verses && verses.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMeta, marginBottom: '0.35rem' }}>
            Referenced Verses
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {verses.slice(0, 2).map((v, i) => (
              <div key={i} style={{
                padding: '0.5rem',
                borderRadius: '8px',
                background: agentColor + '10',
                border: `1px solid ${agentColor}25`,
                fontSize: '0.75rem',
                color: textBody,
              }}>
                <div style={{ fontWeight: 700, color: agentColor, marginBottom: '0.2rem' }}>{v.verse_id}</div>
                <div style={{ lineHeight: 1.4 }}>{v.english_translation?.substring(0, 100)}…</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor notes */}
      {editorNotes && (
        <div style={{ marginBottom: '0.75rem', fontSize: '0.78rem', color: textBody, lineHeight: 1.4, fontStyle: 'italic' }}>
          {editorNotes.substring(0, 150)}{editorNotes.length > 150 ? '…' : ''}
        </div>
      )}

      {/* Suggested questions */}
      {suggestedQ && suggestedQ.length > 0 && (
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMeta, marginBottom: '0.35rem' }}>
            Continue Your Journey
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {suggestedQ.slice(0, 2).map((q, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.35rem', fontSize: '0.75rem', color: textBody }}>
                <span style={{ color: agentColor }}>→</span>
                <span style={{ fontStyle: 'italic' }}>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── MAIN CARD ─────────────────────────────────────────────
export default function CaseStudyCard({ caseStudy, agentColor, isDark }: Props) {
  return (
    <div className="animate-fade-in">
      {/* Title row */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.15rem',
          fontWeight: 700,
          color: isDark ? 'white' : 'var(--text-heading)',
          letterSpacing: '-0.02em',
        }}>
          {caseStudy.title}
        </h3>
        {caseStudy.description && (
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: isDark ? 'rgba(255,255,255,0.6)' : 'var(--text-meta)' }}>
            {caseStudy.description}
          </p>
        )}
      </div>

      {/* 3-panel layout */}
      <div className="case-panels">
        <InputPanel   caseStudy={caseStudy} agentColor={agentColor} isDark={isDark} />
        <ProcessPanel caseStudy={caseStudy} agentColor={agentColor} isDark={isDark} />
        <OutputPanel  caseStudy={caseStudy} agentColor={agentColor} isDark={isDark} />
      </div>
    </div>
  );
}
