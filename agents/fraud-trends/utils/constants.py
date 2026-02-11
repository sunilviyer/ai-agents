"""
Immutable Constants for Fraud Trends Agent

This module contains all constant values used throughout the agent:
- AGENT_SLUG: Agent identifier for database storage
- STEP_TYPES: Valid step type values for execution logging
- FRAUD_TYPES: Valid fraud categories (domain-specific classifications)
- SEVERITY_LEVELS: Valid severity values (low, medium, high, critical)
- DETECTION_DIFFICULTY_LEVELS: Valid difficulty ratings
- SOURCE_TIERS: Valid source tier classifications (tier_1, tier_2, tier_3)
- CONFIDENCE_LEVELS: Valid confidence ratings (low, medium, high)

All constants are defined in UPPER_SNAKE_CASE per NFR-CQ4.
This ensures consistency in classifications and logging throughout the codebase.

Implementation: Epic 3, Story 3.1
"""

from typing import List, Dict

# =============================================================================
# AGENT IDENTIFICATION
# =============================================================================

AGENT_SLUG = "fraud-trends"
"""
Agent identifier used for database storage and API routing.
This slug appears in URLs, database records, and file paths.
"""

# =============================================================================
# WORKFLOW STEP TYPES
# =============================================================================

# Step type constants for the 6-step workflow
STEP_TYPE_PLANNING = "planning"
STEP_TYPE_SEARCH_INDUSTRY = "search_industry"
STEP_TYPE_SEARCH_REGULATORY = "search_regulatory"
STEP_TYPE_SEARCH_ACADEMIC = "search_academic"
STEP_TYPE_EXTRACTION = "extraction"
STEP_TYPE_SYNTHESIS = "synthesis"

# Collection of all valid step types
STEP_TYPES: List[str] = [
    STEP_TYPE_PLANNING,
    STEP_TYPE_SEARCH_INDUSTRY,
    STEP_TYPE_SEARCH_REGULATORY,
    STEP_TYPE_SEARCH_ACADEMIC,
    STEP_TYPE_EXTRACTION,
    STEP_TYPE_SYNTHESIS,
]
"""
Valid step types for execution trace logging.
Maps to the 6-step workflow of the Fraud Trends agent.
"""

# =============================================================================
# FRAUD TYPE CLASSIFICATIONS
# =============================================================================

# Common fraud types in insurance industry
FRAUD_TYPE_SYNTHETIC_IDENTITY = "synthetic_identity"
FRAUD_TYPE_STAGED_ACCIDENT = "staged_accident"
FRAUD_TYPE_EXAGGERATED_CLAIM = "exaggerated_claim"
FRAUD_TYPE_REPAIR_FRAUD = "repair_fraud"
FRAUD_TYPE_PHANTOM_VEHICLE = "phantom_vehicle"
FRAUD_TYPE_BODILY_INJURY_FRAUD = "bodily_injury_fraud"
FRAUD_TYPE_PROPERTY_FRAUD = "property_fraud"
FRAUD_TYPE_HEALTH_FRAUD = "health_fraud"
FRAUD_TYPE_WORKERS_COMP_FRAUD = "workers_comp_fraud"
FRAUD_TYPE_ORGANIZED_CRIME = "organized_crime"
FRAUD_TYPE_PROVIDER_FRAUD = "provider_fraud"
FRAUD_TYPE_PREMIUM_FRAUD = "premium_fraud"
FRAUD_TYPE_DIGITAL_FRAUD = "digital_fraud"
FRAUD_TYPE_CYBER_FRAUD = "cyber_fraud"

FRAUD_TYPES: List[str] = [
    FRAUD_TYPE_SYNTHETIC_IDENTITY,
    FRAUD_TYPE_STAGED_ACCIDENT,
    FRAUD_TYPE_EXAGGERATED_CLAIM,
    FRAUD_TYPE_REPAIR_FRAUD,
    FRAUD_TYPE_PHANTOM_VEHICLE,
    FRAUD_TYPE_BODILY_INJURY_FRAUD,
    FRAUD_TYPE_PROPERTY_FRAUD,
    FRAUD_TYPE_HEALTH_FRAUD,
    FRAUD_TYPE_WORKERS_COMP_FRAUD,
    FRAUD_TYPE_ORGANIZED_CRIME,
    FRAUD_TYPE_PROVIDER_FRAUD,
    FRAUD_TYPE_PREMIUM_FRAUD,
    FRAUD_TYPE_DIGITAL_FRAUD,
    FRAUD_TYPE_CYBER_FRAUD,
]
"""
Valid fraud type categories for classification.
Based on insurance industry standards and regulatory definitions.
"""

# =============================================================================
# SEVERITY LEVELS
# =============================================================================

SEVERITY_LOW = "low"
SEVERITY_MEDIUM = "medium"
SEVERITY_HIGH = "high"
SEVERITY_CRITICAL = "critical"

SEVERITY_LEVELS: List[str] = [
    SEVERITY_LOW,
    SEVERITY_MEDIUM,
    SEVERITY_HIGH,
    SEVERITY_CRITICAL,
]
"""
Valid severity levels for fraud trends and regulatory findings.
Matches Pydantic Literal["low", "medium", "high", "critical"].
"""

# =============================================================================
# DETECTION DIFFICULTY LEVELS
# =============================================================================

DETECTION_EASY = "easy"
DETECTION_MODERATE = "moderate"
DETECTION_HARD = "hard"
DETECTION_VERY_HARD = "very_hard"

DETECTION_DIFFICULTY_LEVELS: List[str] = [
    DETECTION_EASY,
    DETECTION_MODERATE,
    DETECTION_HARD,
    DETECTION_VERY_HARD,
]
"""
Valid detection difficulty levels for fraud trends.
Indicates how challenging it is to identify this type of fraud.
Matches Pydantic Literal["easy", "moderate", "hard", "very_hard"].
"""

# =============================================================================
# SOURCE TIER CLASSIFICATIONS
# =============================================================================

SOURCE_TIER_1 = "tier_1"  # Regulatory bodies, academic papers (highest quality)
SOURCE_TIER_2 = "tier_2"  # Industry reports, professional organizations
SOURCE_TIER_3 = "tier_3"  # News articles, general web sources

SOURCE_TIERS: List[str] = [
    SOURCE_TIER_1,
    SOURCE_TIER_2,
    SOURCE_TIER_3,
]
"""
Valid source tier classifications for research quality assessment.

Tier 1: Regulatory bodies (NAIC, FBI, state departments), academic research
Tier 2: Industry associations, professional organizations, insurance publications
Tier 3: News articles, general web content

Higher tier sources (Tier 1) provide greater confidence in findings.
"""

# =============================================================================
# CONFIDENCE LEVELS
# =============================================================================

CONFIDENCE_LOW = "low"
CONFIDENCE_MEDIUM = "medium"
CONFIDENCE_HIGH = "high"

CONFIDENCE_LEVELS: List[str] = [
    CONFIDENCE_LOW,
    CONFIDENCE_MEDIUM,
    CONFIDENCE_HIGH,
]
"""
Valid confidence levels for overall report assessment.
Based on source quality distribution and quantity.
Matches Pydantic Literal["low", "medium", "high"].
"""

# =============================================================================
# REGULATORY SOURCES
# =============================================================================

REGULATORY_DOMAINS: List[str] = [
    "naic.org",  # National Association of Insurance Commissioners
    "fbi.gov",   # Federal Bureau of Investigation
    "doi.gov",   # Department of Insurance (various states)
    "insurance.ca.gov",  # California Department of Insurance
    "dfs.ny.gov",        # New York Department of Financial Services
    "tdi.texas.gov",     # Texas Department of Insurance
]
"""
Known regulatory domain names for Tier 1 source identification.
Used in Step 3 (search_regulatory) to filter and classify sources.
"""

# =============================================================================
# ACADEMIC DOMAINS
# =============================================================================

ACADEMIC_DOMAINS: List[str] = [
    ".edu",
    "scholar.google.com",
    "researchgate.net",
    "jstor.org",
    "springer.com",
    "sciencedirect.com",
    "ieee.org",
]
"""
Known academic domain patterns for Tier 1 source identification.
Used in Step 4 (search_academic) to filter and classify sources.
"""

# =============================================================================
# WORKFLOW CONFIGURATION
# =============================================================================

MAX_SEARCH_RESULTS_PER_QUERY = 10
"""Maximum number of search results to retrieve per query via Tavily API."""

MIN_SOURCES_FOR_HIGH_CONFIDENCE = 20
"""Minimum total source count required for high confidence rating."""

MIN_TIER_1_PERCENTAGE_FOR_HIGH_CONFIDENCE = 30.0
"""Minimum Tier 1 source percentage (0-100) required for high confidence."""

RECOMMENDED_RECOMMENDATIONS_MIN = 5
"""Minimum number of actionable recommendations to generate."""

RECOMMENDED_RECOMMENDATIONS_MAX = 7
"""Maximum number of actionable recommendations to generate."""

# =============================================================================
# PROMPTS AND DISCLAIMERS
# =============================================================================

REGULATORY_DISCLAIMER = (
    "This report is for informational purposes only and does not constitute "
    "legal, regulatory, or insurance advice. The information presented is based "
    "on publicly available sources and may not reflect the most current "
    "developments. Insurers should consult with their legal and compliance teams "
    "before implementing any recommendations or making business decisions based "
    "on this analysis. Fraud patterns and detection methods vary by jurisdiction "
    "and may be subject to regulatory oversight."
)
"""
Standard regulatory disclaimer text for all fraud trends reports.
Required per FR27 to clarify the informational nature of the analysis.
"""

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def is_valid_severity(severity: str) -> bool:
    """
    Check if a severity value is valid.

    Args:
        severity: Severity string to validate

    Returns:
        bool: True if severity is in SEVERITY_LEVELS
    """
    return severity in SEVERITY_LEVELS


def is_valid_detection_difficulty(difficulty: str) -> bool:
    """
    Check if a detection difficulty value is valid.

    Args:
        difficulty: Detection difficulty string to validate

    Returns:
        bool: True if difficulty is in DETECTION_DIFFICULTY_LEVELS
    """
    return difficulty in DETECTION_DIFFICULTY_LEVELS


def is_valid_confidence(confidence: str) -> bool:
    """
    Check if a confidence level is valid.

    Args:
        confidence: Confidence level string to validate

    Returns:
        bool: True if confidence is in CONFIDENCE_LEVELS
    """
    return confidence in CONFIDENCE_LEVELS


def get_source_tier(url: str) -> str:
    """
    Determine the source tier based on URL domain.

    Args:
        url: Source URL to classify

    Returns:
        str: SOURCE_TIER_1, SOURCE_TIER_2, or SOURCE_TIER_3

    Example:
        >>> get_source_tier("https://naic.org/advisory")
        'tier_1'
        >>> get_source_tier("https://news.example.com/article")
        'tier_3'
    """
    url_lower = url.lower()

    # Check for regulatory domains (Tier 1)
    for domain in REGULATORY_DOMAINS:
        if domain in url_lower:
            return SOURCE_TIER_1

    # Check for academic domains (Tier 1)
    for domain in ACADEMIC_DOMAINS:
        if domain in url_lower:
            return SOURCE_TIER_1

    # Check for industry domains (Tier 2)
    # Common insurance industry domains
    industry_keywords = [
        "insurance",
        "actuarial",
        "underwriting",
        "claims",
        "iii.org",  # Insurance Information Institute
        "napslo.org",
        "aba.org",
    ]
    for keyword in industry_keywords:
        if keyword in url_lower:
            return SOURCE_TIER_2

    # Default to Tier 3 (news, general web)
    return SOURCE_TIER_3
