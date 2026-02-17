'use client';

import { useEffect, useState } from 'react';
import CaseStudyCard from './CaseStudyCard';

interface CaseStudy {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  createdAt: string;
  inputParameters: Record<string, unknown>;
  outputResult: Record<string, unknown>;
  executionTrace: ExecutionStep[];
}

interface ExecutionStep {
  step_number: number;
  step_name: string;
  step_type: string;
  details: Record<string, unknown>;
  duration_ms: number | null;
  timestamp: string;
}

interface Props {
  agentSlug: string;
  agentName: string;
  agentColor: string;
  isDark?: boolean;
  sectionLabel?: string;
}

export default function CaseStudyList({ agentSlug, agentName, agentColor, isDark = false, sectionLabel }: Props) {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function fetchCaseStudies() {
      try {
        const response = await fetch(`/api/agents/${agentSlug}/case-studies?includeTrace=true`);
        if (!response.ok) throw new Error(`Failed to fetch case studies: ${response.statusText}`);
        const data = await response.json();
        setCaseStudies(data.caseStudies || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load case studies');
      } finally {
        setLoading(false);
      }
    }
    fetchCaseStudies();
  }, [agentSlug]);

  const textHead = isDark ? 'white' : 'var(--text-heading)';
  const textMeta = isDark ? 'rgba(255,255,255,0.55)' : 'var(--text-meta)';

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: `3px solid ${agentColor}`,
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem',
        }} />
        <p style={{ color: textMeta, margin: 0 }}>Loading case studies…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: `2px solid #ef4444`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 0.75rem',
          fontSize: '1.1rem', fontWeight: 800, color: '#ef4444',
        }}>!</div>
        <h2 style={{ color: textHead, margin: '0 0 0.5rem', fontSize: '1.2rem' }}>Error Loading Case Studies</h2>
        <p style={{ color: textMeta, margin: 0, fontSize: '0.85rem' }}>{error}</p>
      </div>
    );
  }

  if (caseStudies.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: `2px solid ${agentColor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 0.75rem',
          fontSize: '0.7rem', fontWeight: 800, color: agentColor, letterSpacing: '-0.01em',
        }}>—</div>
        <h2 style={{ color: textHead, margin: '0 0 0.5rem', fontSize: '1.2rem' }}>No Case Studies Yet</h2>
        <p style={{ color: textMeta, margin: 0, fontSize: '0.85rem' }}>
          {agentName} doesn&apos;t have any pre-run demonstrations available yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: 700,
          color: textHead,
          letterSpacing: '-0.02em',
        }}>
          {sectionLabel ?? 'Case Studies'}
        </h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: textMeta }}>
          {caseStudies.length} pre-run demonstration{caseStudies.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tab selector */}
      <div className="demo-tabs" style={{ marginBottom: '1.25rem' }}>
        {caseStudies.map((cs, index) => {
          // Extract short label: first part of title before ' - ', truncated
          const topic = cs.title.split(' - ')[0].trim();
          const label = topic.length > 22 ? topic.substring(0, 21) + '…' : topic;
          return (
            <button
              key={cs.id}
              className={`demo-tab ${activeTab === index ? 'active' : ''}`}
              style={{
                '--tab-color': agentColor,
              } as React.CSSProperties}
              onClick={() => setActiveTab(index)}
            >
              <span style={{
                fontSize: '0.63rem',
                opacity: 0.55,
                display: 'block',
                marginBottom: '0.1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {index + 1}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active case study — 3-panel layout */}
      <div className="animate-fade-in" key={caseStudies[activeTab].id}>
        <CaseStudyCard
          caseStudy={caseStudies[activeTab]}
          agentColor={agentColor}
          isDark={isDark}
        />
      </div>
    </div>
  );
}
