'use client';

import { useEffect, useState } from 'react';
import CaseStudyCard from './CaseStudyCard';

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  created_at: string;
  input_parameters: Record<string, unknown>;
  output_result: Record<string, unknown>;
  execution_trace: ExecutionStep[];
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

      <div className="space-y-8">
        {caseStudies.map((caseStudy) => (
          <CaseStudyCard
            key={caseStudy.id}
            caseStudy={caseStudy}
            agentColor={agentColor}
          />
        ))}
      </div>
    </div>
  );
}
