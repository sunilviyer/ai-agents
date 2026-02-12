'use client';

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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

      {/* Execution Workflow - Always Visible */}
      {caseStudy.executionTrace && caseStudy.executionTrace.length > 0 && (
        <div className="animate-fade-in">
          <WorkflowVisualization steps={caseStudy.executionTrace} agentColor={agentColor} />
        </div>
      )}

    </div>
  );
}
