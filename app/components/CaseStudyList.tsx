'use client';

import { useEffect, useState } from 'react';
import CaseStudyCard from './CaseStudyCard';

interface CaseStudy {
  id: string;
  title: string;
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
}

export default function CaseStudyList({ agentSlug, agentName, agentColor }: Props) {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function fetchCaseStudies() {
      try {
        const response = await fetch(`/api/agents/${agentSlug}/case-studies?includeTrace=true`);

        if (!response.ok) {
          throw new Error(`Failed to fetch case studies: ${response.statusText}`);
        }

        const data = await response.json();
        setCaseStudies(data.caseStudies || []);
      } catch (err) {
        console.error('Error fetching case studies:', err);
        setError(err instanceof Error ? err.message : 'Failed to load case studies');
      } finally {
        setLoading(false);
      }
    }

    fetchCaseStudies();
  }, [agentSlug]);

  if (loading) {
    return (
      <div className="glass-panel p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
               style={{ borderColor: `${agentColor} transparent ${agentColor} ${agentColor}` }} />
          <span className="ml-4 text-xl" style={{ color: '#FDF0D5' }}>
            Loading case studies...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-12">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#FDF0D5' }}>
            Error Loading Case Studies
          </h2>
          <p style={{ color: '#669BBC' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (caseStudies.length === 0) {
    return (
      <div className="glass-panel p-12">
        <div className="text-center">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#FDF0D5' }}>
            No Case Studies Yet
          </h2>
          <p style={{ color: '#669BBC' }}>
            This agent doesn't have any pre-run demonstrations available yet.
            Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold" style={{ color: '#FDF0D5' }}>
          Case Studies
        </h2>
        <p className="text-lg mt-2" style={{ color: '#669BBC' }}>
          {caseStudies.length} pre-run demonstration{caseStudies.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* TABS FOR CASE STUDIES */}
      <div className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3"
             style={{ gridAutoRows: '1fr' }}>
          {caseStudies.map((caseStudy, index) => (
            <button
              key={caseStudy.id}
              onClick={() => setActiveTab(index)}
              className="px-4 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center text-center min-h-[100px]"
              style={{
                background: activeTab === index
                  ? `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}dd 100%)`
                  : 'rgba(0, 48, 73, 0.5)',
                color: '#FDF0D5',
                border: activeTab === index ? `2px solid ${agentColor}` : '1px solid rgba(102, 155, 188, 0.3)',
                boxShadow: activeTab === index ? `0 8px 24px ${agentColor}50` : 'none'
              }}
            >
              <div className="text-xs opacity-80 mb-2 whitespace-nowrap">Case {index + 1}</div>
              <div className="text-sm font-bold leading-tight break-words hyphens-auto" style={{ wordBreak: 'break-word' }}>
                {caseStudy.title.split(' - ')[0]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE CASE STUDY */}
      <div className="animate-fade-in">
        <CaseStudyCard
          caseStudy={caseStudies[activeTab]}
          agentColor={agentColor}
        />
      </div>
    </div>
  );
}
