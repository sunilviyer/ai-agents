/**
 * TypeScript Type Definitions for AI Agents Portfolio
 *
 * These types match Python Pydantic models EXACTLY.
 * See docs/SCHEMA_MAPPING.md for field name mappings.
 *
 * IMPORTANT: Any changes must be synchronized with:
 * - Python Pydantic models in agents utils models files
 * - PostgreSQL schema in database schema file
 * - This TypeScript types file
 *
 * Naming Convention:
 * - Python uses snake_case to TypeScript uses camelCase
 * - See docs/TYPESCRIPT_CONVENTIONS.md for full conventions
 */

// =============================================================================
// INPUT MODELS
// =============================================================================

/**
 * Input parameters for the Fraud Trends Investigator agent.
 * Matches: agents/fraud-trends/utils/models.py::FraudTrendsInput
 */
export interface FraudTrendsInput {
  /** The fraud topic to research (e.g., "Auto Insurance Fraud") */
  topic: string;
  /** Geographic regions to focus on (e.g., ["US", "CA", "UK"]) */
  regions: string[];
  /** Time range for research (e.g., "2024-2025", "2024") */
  timeRange: string;
  /** Optional specific areas to emphasize (e.g., ["detection", "prevention"]) */
  focusAreas?: string[];
}

// =============================================================================
// OUTPUT MODELS
// =============================================================================

/**
 * Severity levels for fraud trends and regulatory findings.
 * Matches: Python Literal["low", "medium", "high", "critical"]
 */
export type SeverityLevel = "low" | "medium" | "high" | "critical";

/**
 * Detection difficulty levels for fraud trends.
 * Matches: Python Literal["easy", "moderate", "hard", "very_hard"]
 */
export type DetectionDifficulty = "easy" | "moderate" | "hard" | "very_hard";

/**
 * Confidence levels for fraud trend analysis.
 * Matches: Python Literal["low", "medium", "high"]
 */
export type ConfidenceLevel = "low" | "medium" | "high";

/**
 * A single fraud trend identified during research.
 * Matches: agents/fraud-trends/utils/models.py::FraudTrend
 */
export interface FraudTrend {
  /** Short name of the fraud trend */
  name: string;
  /** Fraud type category (e.g., "synthetic_identity", "repair_fraud") */
  category: string;
  /** Detailed description of the trend */
  description: string;
  /** Impact severity level */
  severity: SeverityLevel;
  /** Difficulty of detecting this fraud type */
  detectionDifficulty: DetectionDifficulty;
  /** Regions where this trend is prevalent */
  geographicScope: string[];
  /** Insurance lines affected */
  affectedLines: string[];
  /** Financial or operational impact description */
  estimatedImpact: string;
}

/**
 * A finding from regulatory sources (NAIC, FBI, state departments).
 * Matches: agents/fraud-trends/utils/models.py::RegulatoryFinding
 */
export interface RegulatoryFinding {
  /** Name of the regulatory body */
  source: string;
  /** The regulatory finding or advisory */
  finding: string;
  /** Date of the finding */
  date: string;
  /** Severity of the regulatory concern */
  severity: SeverityLevel;
  /** Optional URL to source document */
  url?: string;
}

/**
 * Distribution of sources by tier quality.
 *
 * Tier 1: Regulatory bodies, academic papers (highest quality)
 * Tier 2: Industry reports, professional organizations
 * Tier 3: News articles, general web sources
 *
 * Matches: agents/fraud-trends/utils/models.py::SourceTierBreakdown
 */
export interface SourceTierBreakdown {
  /** Number of Tier 1 sources (regulatory/academic) */
  tier1Count: number;
  /** Number of Tier 2 sources (industry reports) */
  tier2Count: number;
  /** Number of Tier 3 sources (news/web) */
  tier3Count: number;
  /** Percentage from Tier 1 (0.0-100.0) */
  tier1Percentage: number;
  /** Percentage from Tier 2 (0.0-100.0) */
  tier2Percentage: number;
  /** Percentage from Tier 3 (0.0-100.0) */
  tier3Percentage: number;
}

/**
 * Complete output from the Fraud Trends Investigator agent.
 *
 * This represents the final synthesized report after all 6 workflow steps.
 * Matches: agents/fraud-trends/utils/models.py::FraudTrendsOutput
 */
export interface FraudTrendsOutput {
  /** High-level summary of findings (2-3 paragraphs) */
  executiveSummary: string;
  /** Identified fraud trends with classifications */
  trends: FraudTrend[];
  /** Findings from regulatory sources */
  regulatoryFindings: RegulatoryFinding[];
  /** Distribution of sources by quality tier */
  sourceTierBreakdown: SourceTierBreakdown;
  /** Overall confidence in findings based on source quality */
  confidenceLevel: ConfidenceLevel;
  /** Time range of sources used (e.g., "2024-Q1 to 2025-Q1") */
  dataFreshness: string;
  /** Regulatory disclaimer text */
  disclaimer: string;
  /** Actionable recommendations (5-7 items) */
  recommendations: string[];
}

// =============================================================================
// EXECUTION TRACE MODELS
// =============================================================================

/**
 * Step types for agent workflow execution.
 * Matches: Python step_type field values
 */
export type StepType =
  | "planning"
  | "search_industry"
  | "search_regulatory"
  | "search_academic"
  | "extraction"
  | "synthesis"
  | "setup"
  | "search"
  | "analysis"
  | "filter"
  | "enrichment"
  | "retrieval"
  | "personalization"
  | "guidance";

/**
 * A single step in the agent execution workflow.
 *
 * Used for execution transparency - shows what the agent did at each step.
 * Matches: agents/fraud-trends/utils/models.py::ExecutionStep
 * Matches: database table execution_steps
 */
export interface ExecutionStep {
  /** Sequential step number (1-6 for Fraud Trends agent) */
  stepNumber: number;
  /** Human-readable step name */
  stepName: string;
  /** Type of step */
  stepType: StepType;
  /** Summary of inputs to this step */
  inputSummary?: string;
  /** Summary of outputs from this step */
  outputSummary?: string;
  /** Detailed step-specific data (stored as JSONB in database) */
  details?: Record<string, unknown>;
  /** Execution time in milliseconds */
  durationMs?: number;
  /** ISO 8601 timestamp */
  timestamp: string;
}

// =============================================================================
// CASE STUDY MODEL
// =============================================================================

/**
 * Valid agent slugs in the system.
 */
export type AgentSlug =
  | "fraud-trends"
  | "stock-monitor"
  | "house-finder"
  | "article-editor"
  | "gita-guide";

/**
 * Generic case study representing one agent execution.
 *
 * This generic type works for all agents - the TInput and TOutput types
 * are agent-specific.
 *
 * Matches: agents/fraud-trends/utils/models.py::CaseStudy
 * Matches: database table case_studies
 */
export interface CaseStudy<TInput, TOutput> {
  /** UUID identifier */
  id: string;
  /** Agent identifier */
  agentSlug: string;
  /** Case study title */
  title: string;
  /** Optional subtitle or brief description */
  subtitle?: string;
  /** The input parameters used for this execution (agent-specific) */
  inputParameters: TInput;
  /** The complete output from the agent (agent-specific) */
  outputResult: TOutput;
  /** Step-by-step execution log */
  executionTrace: ExecutionStep[];
  /** Whether to display on website */
  display: boolean;
  /** Whether to feature on homepage */
  featured: boolean;
  /** Optional manual sort order for featured items */
  displayOrder?: number;
  /** ISO 8601 timestamp of creation */
  createdAt: string;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
}

/**
 * Fraud Trends specific case study type.
 * Convenience type alias for the most common usage.
 */
export type FraudTrendsCaseStudy = CaseStudy<
  FraudTrendsInput,
  FraudTrendsOutput
>;

// =============================================================================
// API RESPONSE MODELS
// =============================================================================

/**
 * Standard error response format from API routes.
 * Matches: Architecture requirement AR19
 */
export interface ApiError {
  error: {
    /** Machine-readable error code (e.g., "DATABASE_ERROR", "AGENT_NOT_FOUND") */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Optional additional error details */
    details?: Record<string, unknown>;
  };
}

/**
 * Response format for GET /api/agents/[slug]/case-studies
 * Matches: Architecture requirement AR18
 */
export interface CaseStudiesResponse<TInput = unknown, TOutput = unknown> {
  /** Agent identifier */
  agentSlug: string;
  /** Array of case studies for this agent */
  caseStudies: CaseStudy<TInput, TOutput>[];
  /** Total number of case studies returned */
  totalCount: number;
  /** Whether execution traces are included in the response */
  executionTraceIncluded: boolean;
}

/**
 * Fraud Trends specific API response type.
 */
export type FraudTrendsCaseStudiesResponse = CaseStudiesResponse<
  FraudTrendsInput,
  FraudTrendsOutput
>;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a response is an error.
 */
export function isApiError(
  response: unknown
): response is ApiError {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as ApiError).error === "object"
  );
}

/**
 * Type guard to check if an agent slug is valid.
 */
export function isValidAgentSlug(slug: string): slug is AgentSlug {
  return [
    "fraud-trends",
    "stock-monitor",
    "house-finder",
    "article-editor",
    "gita-guide",
  ].includes(slug);
}
