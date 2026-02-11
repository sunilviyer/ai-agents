"""
Pydantic Models for Fraud Trends Agent

This module contains Pydantic models for validating input and output data:
- FraudTrendsInput: Input parameters for the agent
- FraudTrendsOutput: Output structure matching TypeScript types
- Supporting models: FraudTrend, RegulatoryFinding, SourceTierBreakdown, etc.

These models ensure type safety and data validation across the entire system,
maintaining consistency between Python (agent), TypeScript (API), and PostgreSQL (database).

Implementation: Epic 2, Story 2.3
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field


# =============================================================================
# INPUT MODELS
# =============================================================================

class FraudTrendsInput(BaseModel):
    """
    Input parameters for the Fraud Trends Investigator agent.

    Attributes:
        topic: The fraud topic to research (e.g., "Auto Insurance Fraud")
        regions: List of geographic regions to focus on (e.g., ["US", "CA", "UK"])
        time_range: Time range for research (e.g., "2024-2025", "2024")
        focus_areas: Optional list of specific areas to emphasize (e.g., ["detection", "prevention"])
    """
    topic: str = Field(
        ...,
        description="The fraud topic to research",
        min_length=1,
        example="Auto Insurance Fraud"
    )
    regions: List[str] = Field(
        ...,
        description="Geographic regions to focus on",
        min_length=1,
        example=["US", "CA", "UK"]
    )
    time_range: str = Field(
        ...,
        description="Time range for research",
        min_length=1,
        example="2024-2025"
    )
    focus_areas: Optional[List[str]] = Field(
        default=None,
        description="Optional specific areas to emphasize",
        example=["detection", "prevention", "technology"]
    )


# =============================================================================
# OUTPUT MODELS
# =============================================================================

class FraudTrend(BaseModel):
    """
    A single fraud trend identified during research.

    Attributes:
        name: Short name of the trend
        category: Fraud type category (e.g., "synthetic_identity", "repair_fraud")
        description: Detailed description of the trend
        severity: Impact severity level
        detection_difficulty: How hard it is to detect this fraud
        geographic_scope: Regions where this trend is prevalent
        affected_lines: Insurance lines affected by this fraud
        estimated_impact: Financial or operational impact description
    """
    name: str = Field(
        ...,
        description="Short name of the fraud trend",
        example="AI-Generated Synthetic Identities"
    )
    category: str = Field(
        ...,
        description="Fraud type category",
        example="synthetic_identity"
    )
    description: str = Field(
        ...,
        description="Detailed description of the trend",
        min_length=10
    )
    severity: Literal["low", "medium", "high", "critical"] = Field(
        ...,
        description="Impact severity level"
    )
    detection_difficulty: Literal["easy", "moderate", "hard", "very_hard"] = Field(
        ...,
        description="Difficulty of detecting this fraud type"
    )
    geographic_scope: List[str] = Field(
        ...,
        description="Regions where this trend is prevalent",
        example=["US", "CA"]
    )
    affected_lines: List[str] = Field(
        ...,
        description="Insurance lines affected",
        example=["auto", "property", "health"]
    )
    estimated_impact: str = Field(
        ...,
        description="Financial or operational impact description",
        example="$500M-$1B annual industry loss"
    )


class RegulatoryFinding(BaseModel):
    """
    A finding from regulatory sources (NAIC, FBI, state departments).

    Attributes:
        source: Name of the regulatory body
        finding: The regulatory finding or advisory
        date: Date of the finding or advisory
        severity: Severity level of the regulatory concern
        url: Optional URL to the source document
    """
    source: str = Field(
        ...,
        description="Regulatory body name",
        example="National Association of Insurance Commissioners (NAIC)"
    )
    finding: str = Field(
        ...,
        description="The regulatory finding or advisory",
        min_length=10
    )
    date: str = Field(
        ...,
        description="Date of the finding",
        example="2024-Q3"
    )
    severity: Literal["low", "medium", "high", "critical"] = Field(
        ...,
        description="Severity of the regulatory concern"
    )
    url: Optional[str] = Field(
        default=None,
        description="URL to source document",
        example="https://naic.org/example-advisory"
    )


class SourceTierBreakdown(BaseModel):
    """
    Distribution of sources by tier quality.

    Tier 1: Regulatory bodies, academic papers (highest quality)
    Tier 2: Industry reports, professional organizations
    Tier 3: News articles, general web sources

    Attributes:
        tier_1_count: Number of Tier 1 sources used
        tier_2_count: Number of Tier 2 sources used
        tier_3_count: Number of Tier 3 sources used
        tier_1_percentage: Percentage of sources from Tier 1
        tier_2_percentage: Percentage of sources from Tier 2
        tier_3_percentage: Percentage of sources from Tier 3
    """
    tier_1_count: int = Field(
        ...,
        ge=0,
        description="Number of Tier 1 sources (regulatory/academic)"
    )
    tier_2_count: int = Field(
        ...,
        ge=0,
        description="Number of Tier 2 sources (industry reports)"
    )
    tier_3_count: int = Field(
        ...,
        ge=0,
        description="Number of Tier 3 sources (news/web)"
    )
    tier_1_percentage: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Percentage from Tier 1"
    )
    tier_2_percentage: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Percentage from Tier 2"
    )
    tier_3_percentage: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Percentage from Tier 3"
    )


class FraudTrendsOutput(BaseModel):
    """
    Complete output from the Fraud Trends Investigator agent.

    This model represents the final synthesized report after all 6 workflow steps.
    It matches the TypeScript FraudTrendsOutput interface exactly.

    Attributes:
        executive_summary: High-level summary of findings (2-3 paragraphs)
        trends: List of identified fraud trends with classifications
        regulatory_findings: List of findings from regulatory sources
        source_tier_breakdown: Distribution of sources by quality tier
        confidence_level: Overall confidence in findings based on source quality
        data_freshness: Time range of sources used (e.g., "2024-Q1 to 2025-Q1")
        disclaimer: Regulatory disclaimer text
        recommendations: List of actionable recommendations (5-7 items)
    """
    executive_summary: str = Field(
        ...,
        description="High-level summary of findings",
        min_length=100
    )
    trends: List[FraudTrend] = Field(
        ...,
        description="Identified fraud trends with classifications",
        min_length=1
    )
    regulatory_findings: List[RegulatoryFinding] = Field(
        ...,
        description="Findings from regulatory sources",
        min_length=0
    )
    source_tier_breakdown: SourceTierBreakdown = Field(
        ...,
        description="Distribution of sources by quality tier"
    )
    confidence_level: Literal["low", "medium", "high"] = Field(
        ...,
        description="Confidence in findings based on source quality"
    )
    data_freshness: str = Field(
        ...,
        description="Time range of sources used",
        example="2024-Q1 to 2025-Q1"
    )
    disclaimer: str = Field(
        ...,
        description="Regulatory disclaimer text",
        min_length=50
    )
    recommendations: List[str] = Field(
        ...,
        description="Actionable recommendations",
        min_length=5,
        max_length=7
    )


# =============================================================================
# EXECUTION TRACE MODELS
# =============================================================================

class ExecutionStep(BaseModel):
    """
    A single step in the agent execution workflow.

    Used for execution transparency - shows what the agent did at each step.
    This matches the execution_steps database table structure.

    Attributes:
        step_number: Sequential step number (1-6 for Fraud Trends agent)
        step_name: Human-readable name of the step
        step_type: Type of step (planning, search_industry, search_regulatory, etc.)
        input_summary: Summary of inputs to this step
        output_summary: Summary of outputs from this step
        details: Detailed step-specific data (queries, results, etc.)
        duration_ms: Execution time in milliseconds
        timestamp: ISO 8601 timestamp of step execution
    """
    step_number: int = Field(
        ...,
        ge=1,
        description="Sequential step number"
    )
    step_name: str = Field(
        ...,
        description="Human-readable step name",
        example="Plan Research Strategy"
    )
    step_type: str = Field(
        ...,
        description="Type of step",
        example="planning"
    )
    input_summary: Optional[str] = Field(
        default=None,
        description="Summary of inputs to this step"
    )
    output_summary: Optional[str] = Field(
        default=None,
        description="Summary of outputs from this step"
    )
    details: Optional[dict] = Field(
        default=None,
        description="Detailed step-specific data (stored as JSONB in database)"
    )
    duration_ms: Optional[int] = Field(
        default=None,
        ge=0,
        description="Execution time in milliseconds"
    )
    timestamp: str = Field(
        ...,
        description="ISO 8601 timestamp",
        example="2025-02-09T12:00:00Z"
    )


# =============================================================================
# CASE STUDY MODEL
# =============================================================================

class CaseStudy(BaseModel):
    """
    Complete case study representing one agent execution.

    This model represents the entire JSON structure that gets saved to a file
    and imported to the database. It includes input, output, and execution trace.

    Attributes:
        id: UUID identifier for the case study
        agent_slug: Agent identifier (e.g., "fraud-trends")
        title: Case study title
        subtitle: Optional subtitle or brief description
        input_parameters: The input parameters used for this execution
        output_result: The complete output from the agent
        execution_trace: Step-by-step execution log
        display: Whether to display on website
        featured: Whether to feature on homepage
        display_order: Optional manual sort order for featured items
        created_at: ISO 8601 timestamp of creation
        updated_at: ISO 8601 timestamp of last update
    """
    id: str = Field(
        ...,
        description="UUID identifier",
        example="550e8400-e29b-41d4-a716-446655440000"
    )
    agent_slug: str = Field(
        ...,
        description="Agent identifier",
        example="fraud-trends"
    )
    title: str = Field(
        ...,
        description="Case study title",
        min_length=1,
        max_length=500
    )
    subtitle: Optional[str] = Field(
        default=None,
        description="Optional subtitle",
        max_length=1000
    )
    input_parameters: FraudTrendsInput = Field(
        ...,
        description="Input parameters for this execution"
    )
    output_result: FraudTrendsOutput = Field(
        ...,
        description="Complete output from the agent"
    )
    execution_trace: List[ExecutionStep] = Field(
        ...,
        description="Step-by-step execution log",
        min_length=1
    )
    display: bool = Field(
        default=True,
        description="Whether to display on website"
    )
    featured: bool = Field(
        default=False,
        description="Whether to feature on homepage"
    )
    display_order: Optional[int] = Field(
        default=None,
        description="Manual sort order for featured items"
    )
    created_at: str = Field(
        ...,
        description="ISO 8601 timestamp of creation",
        example="2025-02-09T12:00:00Z"
    )
    updated_at: str = Field(
        ...,
        description="ISO 8601 timestamp of last update",
        example="2025-02-09T12:00:00Z"
    )
