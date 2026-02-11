"""
Workflow Step Functions for Fraud Trends Agent

This module contains the 6-step workflow implementation:
- Step 1: Plan Research Strategy (LLM-based planning)
- Step 2: Search Industry Sources (Tavily API)
- Step 3: Search Regulatory Sources (Tavily API with domain filters)
- Step 4: Search Academic Sources (Tavily API)
- Step 5: Extract Key Findings (LLM-based extraction with classifications)
- Step 6: Synthesize Report (LLM-based synthesis with recommendations)

Each step logs execution details, timing, and results to the execution trace.

Implementation: Epic 3, Stories 3.2-3.7
"""

import os
import time
import json
from typing import Dict, List, Any, Optional
from datetime import datetime

from langchain_anthropic import ChatAnthropic
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, SystemMessage

from utils.constants import (
    STEP_TYPE_PLANNING,
    STEP_TYPE_SEARCH_INDUSTRY,
    STEP_TYPE_SEARCH_REGULATORY,
    STEP_TYPE_SEARCH_ACADEMIC,
    STEP_TYPE_EXTRACTION,
    STEP_TYPE_SYNTHESIS,
)
from utils.models import (
    FraudTrendsInput,
    FraudTrendsOutput,
    FraudTrend,
    RegulatoryFinding,
    SourceTierBreakdown,
    ExecutionStep,
    CaseStudy,
)


# =============================================================================
# STEP 1: PLAN RESEARCH STRATEGY
# =============================================================================

def step_1_plan_research(
    fraud_input: FraudTrendsInput
) -> tuple[Dict[str, List[str]], ExecutionStep]:
    """
    Step 1: Generate a research strategy based on input parameters.

    This step uses Claude to analyze the research topic and generate targeted
    search queries across three categories: industry, regulatory, and academic.

    Args:
        fraud_input: FraudTrendsInput containing topic, regions, time_range, focus_areas

    Returns:
        tuple containing:
        - Research plan dict with:
            - industry_queries: List[str] (2-3 queries)
            - regulatory_queries: List[str] (2-3 queries)
            - academic_queries: List[str] (1-2 queries)
        - ExecutionStep for execution trace logging

    Raises:
        Exception: If Claude API call fails
    """
    start_time = time.time()

    # Initialize Claude LLM
    llm = ChatAnthropic(
        model="claude-3-haiku-20240307",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        temperature=0.3,  # Low temperature for consistent planning
    )

    # Build the research planning prompt
    system_prompt = """You are an expert insurance fraud researcher and investigator.
Your task is to create a targeted research strategy for investigating fraud trends.

You will generate specific search queries optimized for web search engines to find:
1. Industry sources (insurance trade publications, industry reports, professional organizations)
2. Regulatory sources (NAIC, FBI, state insurance departments, government agencies)
3. Academic sources (research papers, university studies, peer-reviewed journals)

Guidelines:
- Make queries specific and targeted (not too broad)
- Include relevant time periods when applicable
- Focus queries on the specific regions of interest
- Include both technical fraud terms and common language
- Prioritize queries that will yield authoritative, high-quality sources
"""

    # Build focus areas string if provided
    focus_areas_str = ""
    if fraud_input.focus_areas:
        focus_areas_str = f"\nFocus Areas: {', '.join(fraud_input.focus_areas)}"

    human_prompt = f"""Create a research strategy for the following fraud investigation:

Topic: {fraud_input.topic}
Regions: {', '.join(fraud_input.regions)}
Time Range: {fraud_input.time_range}{focus_areas_str}

Generate 6-8 total search queries distributed as follows:
- 2-3 queries for INDUSTRY sources (insurance publications, trade journals, industry reports)
- 2-3 queries for REGULATORY sources (NAIC, FBI, state departments, government agencies)
- 1-2 queries for ACADEMIC sources (research papers, university studies, peer-reviewed journals)

Return your response in the following JSON format:
{{
  "industry_queries": ["query 1", "query 2", "query 3"],
  "regulatory_queries": ["query 1", "query 2", "query 3"],
  "academic_queries": ["query 1", "query 2"]
}}

IMPORTANT: Return ONLY the JSON object, no additional text or explanation.
"""

    try:
        # Call Claude API
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt),
        ]

        response = llm.invoke(messages)
        response_text = response.content

        # Parse JSON response
        research_plan = json.loads(response_text)

        # Validate response structure
        required_keys = ["industry_queries", "regulatory_queries", "academic_queries"]
        for key in required_keys:
            if key not in research_plan:
                raise ValueError(f"Missing required key in research plan: {key}")

        # Calculate execution time
        duration_ms = int((time.time() - start_time) * 1000)

        # Create execution step for logging
        execution_step = ExecutionStep(
            step_number=1,
            step_name="Plan Research Strategy",
            step_type=STEP_TYPE_PLANNING,
            input_summary=f"Topic: {fraud_input.topic}, Regions: {', '.join(fraud_input.regions)}, Time Range: {fraud_input.time_range}",
            output_summary=f"Generated {len(research_plan['industry_queries'])} industry queries, "
                          f"{len(research_plan['regulatory_queries'])} regulatory queries, "
                          f"{len(research_plan['academic_queries'])} academic queries",
            details={
                "input_parameters": fraud_input.model_dump(),
                "research_plan": research_plan,
                "llm_model": "claude-3-haiku-20240307",
                "temperature": 0.3,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

        return research_plan, execution_step

    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse Claude response as JSON: {e}\nResponse: {response_text}")
    except Exception as e:
        # Log error in execution step
        duration_ms = int((time.time() - start_time) * 1000)
        execution_step = ExecutionStep(
            step_number=1,
            step_name="Plan Research Strategy",
            step_type=STEP_TYPE_PLANNING,
            input_summary=f"Topic: {fraud_input.topic}",
            output_summary=f"ERROR: {str(e)}",
            details={
                "error": str(e),
                "error_type": type(e).__name__,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        raise Exception(f"Step 1 (Research Planning) failed: {e}") from e


# =============================================================================
# STEP 2: SEARCH INDUSTRY SOURCES
# =============================================================================

def step_2_search_industry(
    research_plan: Dict[str, List[str]]
) -> tuple[List[Dict[str, Any]], ExecutionStep]:
    """
    Step 2: Search industry sources using Tavily API.

    Executes industry-focused search queries to find fraud trends from trade
    publications, industry reports, and professional organizations.

    Args:
        research_plan: Dict containing industry_queries list

    Returns:
        tuple containing:
        - List of search results (each with title, url, content, published_date)
        - ExecutionStep for execution trace logging

    Raises:
        Exception: If Tavily API call fails
    """
    start_time = time.time()

    # Import Tavily client
    from tavily import TavilyClient

    # Validate input
    if "industry_queries" not in research_plan:
        raise ValueError("research_plan must contain 'industry_queries' key")

    industry_queries = research_plan["industry_queries"]
    if not industry_queries:
        raise ValueError("industry_queries list cannot be empty")

    # Initialize Tavily client
    tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

    # Collect all search results
    all_results = []
    query_results = {}

    try:
        # Execute search for each industry query
        for i, query in enumerate(industry_queries):
            try:
                # Call Tavily API with advanced search
                search_response = tavily_client.search(
                    query=query,
                    search_depth="advanced",
                    max_results=10,
                )

                # Extract results from response
                results = search_response.get("results", [])

                # Format each result
                for result in results:
                    formatted_result = {
                        "title": result.get("title", ""),
                        "url": result.get("url", ""),
                        "content": result.get("content", ""),
                        "published_date": result.get("published_date", None),
                        "score": result.get("score", 0.0),
                    }
                    all_results.append(formatted_result)

                # Track results per query for logging
                query_results[query] = len(results)

            except Exception as e:
                # Log error but continue with other queries (graceful degradation)
                print(f"Warning: Tavily search failed for query '{query}': {e}")
                query_results[query] = 0

        # Calculate execution time
        duration_ms = int((time.time() - start_time) * 1000)

        # Create execution step for logging
        execution_step = ExecutionStep(
            step_number=2,
            step_name="Search Industry Sources",
            step_type=STEP_TYPE_SEARCH_INDUSTRY,
            input_summary=f"Executed {len(industry_queries)} industry queries: {', '.join(industry_queries[:3])}{'...' if len(industry_queries) > 3 else ''}",
            output_summary=f"Found {len(all_results)} industry sources across {len(industry_queries)} queries",
            details={
                "queries": industry_queries,
                "query_results": query_results,
                "total_results": len(all_results),
                "search_depth": "advanced",
                "max_results_per_query": 10,
                "results": all_results,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

        return all_results, execution_step

    except Exception as e:
        # Log error in execution step
        duration_ms = int((time.time() - start_time) * 1000)
        execution_step = ExecutionStep(
            step_number=2,
            step_name="Search Industry Sources",
            step_type=STEP_TYPE_SEARCH_INDUSTRY,
            input_summary=f"Attempted {len(industry_queries)} queries",
            output_summary=f"ERROR: {str(e)}",
            details={
                "error": str(e),
                "error_type": type(e).__name__,
                "queries": industry_queries,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        raise Exception(f"Step 2 (Industry Search) failed: {e}") from e


# =============================================================================
# STEP 3: SEARCH REGULATORY SOURCES
# =============================================================================

def step_3_search_regulatory(
    research_plan: Dict[str, List[str]]
) -> tuple[List[Dict[str, Any]], ExecutionStep]:
    """
    Step 3: Search regulatory sources using Tavily API with domain filters.

    Executes regulatory-focused search queries targeting NAIC, FBI, state
    insurance departments, and other government agencies.

    Args:
        research_plan: Dict containing regulatory_queries list

    Returns:
        tuple containing:
        - List of search results from regulatory sources
        - ExecutionStep for execution trace logging

    Raises:
        Exception: If Tavily API call fails
    """
    start_time = time.time()

    # Import Tavily client and regulatory domains
    from tavily import TavilyClient
    from utils.constants import REGULATORY_DOMAINS

    # Validate input
    if "regulatory_queries" not in research_plan:
        raise ValueError("research_plan must contain 'regulatory_queries' key")

    regulatory_queries = research_plan["regulatory_queries"]
    if not regulatory_queries:
        raise ValueError("regulatory_queries list cannot be empty")

    # Initialize Tavily client
    tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

    # Collect all search results
    all_results = []
    query_results = {}

    try:
        # Execute search for each regulatory query
        for i, query in enumerate(regulatory_queries):
            try:
                # Call Tavily API with advanced search and domain filtering
                # Note: Tavily's include_domains parameter filters results to specified domains
                search_response = tavily_client.search(
                    query=query,
                    search_depth="advanced",
                    max_results=10,
                    include_domains=REGULATORY_DOMAINS,  # Filter to regulatory sources
                )

                # Extract results from response
                results = search_response.get("results", [])

                # Format each result
                for result in results:
                    formatted_result = {
                        "title": result.get("title", ""),
                        "url": result.get("url", ""),
                        "content": result.get("content", ""),
                        "published_date": result.get("published_date", None),
                        "score": result.get("score", 0.0),
                        "source_tier": "tier_1",  # Regulatory sources are Tier 1
                    }
                    all_results.append(formatted_result)

                # Track results per query for logging
                query_results[query] = len(results)

            except Exception as e:
                # Log error but continue with other queries (graceful degradation)
                print(f"Warning: Tavily search failed for regulatory query '{query}': {e}")
                query_results[query] = 0

        # Calculate execution time
        duration_ms = int((time.time() - start_time) * 1000)

        # Create execution step for logging
        execution_step = ExecutionStep(
            step_number=3,
            step_name="Search Regulatory Sources",
            step_type=STEP_TYPE_SEARCH_REGULATORY,
            input_summary=f"Executed {len(regulatory_queries)} regulatory queries with domain filters: {', '.join(REGULATORY_DOMAINS[:3])}...",
            output_summary=f"Found {len(all_results)} regulatory sources (Tier 1) across {len(regulatory_queries)} queries",
            details={
                "queries": regulatory_queries,
                "query_results": query_results,
                "total_results": len(all_results),
                "search_depth": "advanced",
                "max_results_per_query": 10,
                "domain_filters": REGULATORY_DOMAINS,
                "source_tier": "tier_1",
                "results": all_results,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

        return all_results, execution_step

    except Exception as e:
        # Log error in execution step
        duration_ms = int((time.time() - start_time) * 1000)
        execution_step = ExecutionStep(
            step_number=3,
            step_name="Search Regulatory Sources",
            step_type=STEP_TYPE_SEARCH_REGULATORY,
            input_summary=f"Attempted {len(regulatory_queries)} queries",
            output_summary=f"ERROR: {str(e)}",
            details={
                "error": str(e),
                "error_type": type(e).__name__,
                "queries": regulatory_queries,
                "domain_filters": REGULATORY_DOMAINS,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        raise Exception(f"Step 3 (Regulatory Search) failed: {e}") from e


# =============================================================================
# STEP 4: SEARCH ACADEMIC SOURCES
# =============================================================================

def step_4_search_academic(
    research_plan: Dict[str, List[str]]
) -> tuple[List[Dict[str, Any]], ExecutionStep]:
    """
    Step 4: Search academic sources using Tavily API.

    Executes academic-focused search queries to find peer-reviewed research,
    university studies, and scholarly articles on fraud trends.

    Args:
        research_plan: Dict containing academic_queries list

    Returns:
        tuple containing:
        - List of search results from academic sources
        - ExecutionStep for execution trace logging

    Raises:
        Exception: If Tavily API call fails
    """
    start_time = time.time()

    # Import Tavily client and academic domains
    from tavily import TavilyClient
    from utils.constants import ACADEMIC_DOMAINS

    # Validate input
    if "academic_queries" not in research_plan:
        raise ValueError("research_plan must contain 'academic_queries' key")

    academic_queries = research_plan["academic_queries"]
    if not academic_queries:
        raise ValueError("academic_queries list cannot be empty")

    # Initialize Tavily client
    tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

    # Collect all search results
    all_results = []
    query_results = {}

    try:
        # Execute search for each academic query
        for i, query in enumerate(academic_queries):
            try:
                # Call Tavily API with advanced search and domain filtering
                # Note: Tavily's include_domains parameter filters results to specified domains
                search_response = tavily_client.search(
                    query=query,
                    search_depth="advanced",
                    max_results=10,
                    include_domains=ACADEMIC_DOMAINS,  # Filter to academic sources
                )

                # Extract results from response
                results = search_response.get("results", [])

                # Format each result
                for result in results:
                    formatted_result = {
                        "title": result.get("title", ""),
                        "url": result.get("url", ""),
                        "content": result.get("content", ""),
                        "published_date": result.get("published_date", None),
                        "score": result.get("score", 0.0),
                        "source_tier": "tier_1",  # Academic sources are Tier 1
                    }
                    all_results.append(formatted_result)

                # Track results per query for logging
                query_results[query] = len(results)

            except Exception as e:
                # Log error but continue with other queries (graceful degradation)
                print(f"Warning: Tavily search failed for academic query '{query}': {e}")
                query_results[query] = 0

        # Calculate execution time
        duration_ms = int((time.time() - start_time) * 1000)

        # Create execution step for logging
        execution_step = ExecutionStep(
            step_number=4,
            step_name="Search Academic Sources",
            step_type=STEP_TYPE_SEARCH_ACADEMIC,
            input_summary=f"Executed {len(academic_queries)} academic queries with domain filters: {', '.join(ACADEMIC_DOMAINS[:3])}...",
            output_summary=f"Found {len(all_results)} academic sources (Tier 1) across {len(academic_queries)} queries",
            details={
                "queries": academic_queries,
                "query_results": query_results,
                "total_results": len(all_results),
                "search_depth": "advanced",
                "max_results_per_query": 10,
                "domain_filters": ACADEMIC_DOMAINS,
                "source_tier": "tier_1",
                "results": all_results,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

        return all_results, execution_step

    except Exception as e:
        # Log error in execution step
        duration_ms = int((time.time() - start_time) * 1000)
        execution_step = ExecutionStep(
            step_number=4,
            step_name="Search Academic Sources",
            step_type=STEP_TYPE_SEARCH_ACADEMIC,
            input_summary=f"Attempted {len(academic_queries)} queries",
            output_summary=f"ERROR: {str(e)}",
            details={
                "error": str(e),
                "error_type": type(e).__name__,
                "queries": academic_queries,
                "domain_filters": ACADEMIC_DOMAINS,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        raise Exception(f"Step 4 (Academic Search) failed: {e}") from e


# =============================================================================
# STEP 5: EXTRACT KEY FINDINGS
# =============================================================================

def step_5_extract_findings(
    industry_results: List[Dict[str, Any]],
    regulatory_results: List[Dict[str, Any]],
    academic_results: List[Dict[str, Any]]
) -> tuple[Dict[str, Any], ExecutionStep]:
    """
    Step 5: Extract and classify key findings from all search results.

    Uses Claude to analyze search results and extract structured fraud trends
    with domain-specific classifications (severity, detection difficulty, etc.).

    Args:
        industry_results: Search results from Step 2
        regulatory_results: Search results from Step 3
        academic_results: Search results from Step 4

    Returns:
        tuple containing:
        - Dict with extracted findings (trends, regulatory_findings, source_tier_breakdown)
        - ExecutionStep for execution trace logging

    Raises:
        Exception: If Claude API call fails
    """
    start_time = time.time()

    # Import constants
    from utils.constants import (
        FRAUD_TYPES,
        SEVERITY_LEVELS,
        DETECTION_DIFFICULTY_LEVELS,
        get_source_tier,
    )

    # Initialize Claude LLM
    llm = ChatAnthropic(
        model="claude-3-haiku-20240307",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        temperature=0.4,  # Slightly higher for creative extraction
    )

    # Combine all results
    all_results = industry_results + regulatory_results + academic_results
    total_sources = len(all_results)

    if total_sources == 0:
        raise ValueError("No search results provided to extract findings from")

    # Calculate source tier breakdown
    tier_1_count = sum(1 for r in all_results if r.get("source_tier") == "tier_1")
    tier_2_count = 0
    tier_3_count = 0

    # For results without explicit tier, use URL-based classification
    for result in all_results:
        if "source_tier" not in result:
            tier = get_source_tier(result.get("url", ""))
            if tier == "tier_1":
                tier_1_count += 1
            elif tier == "tier_2":
                tier_2_count += 1
            else:
                tier_3_count += 1

    # Calculate percentages
    tier_1_percentage = round((tier_1_count / total_sources) * 100, 2) if total_sources > 0 else 0.0
    tier_2_percentage = round((tier_2_count / total_sources) * 100, 2) if total_sources > 0 else 0.0
    tier_3_percentage = round((tier_3_count / total_sources) * 100, 2) if total_sources > 0 else 0.0

    source_tier_breakdown = {
        "tier_1_count": tier_1_count,
        "tier_2_count": tier_2_count,
        "tier_3_count": tier_3_count,
        "tier_1_percentage": tier_1_percentage,
        "tier_2_percentage": tier_2_percentage,
        "tier_3_percentage": tier_3_percentage,
        "total_sources": total_sources,
    }

    # Prepare source content for LLM analysis
    # Limit to top 50 sources by score to stay within token limits
    sorted_results = sorted(all_results, key=lambda x: x.get("score", 0.0), reverse=True)[:50]

    source_summaries = []
    for i, result in enumerate(sorted_results, 1):
        content = result.get("content", "")[:500]  # Limit content length
        source_summaries.append(
            f"Source {i}: {result.get('title', 'Untitled')}\n"
            f"URL: {result.get('url', '')}\n"
            f"Content: {content}\n"
        )

    sources_text = "\n---\n".join(source_summaries)

    # Build extraction prompt
    system_prompt = """You are an expert insurance fraud analyst specializing in trend identification and classification.

Your task is to analyze research sources and extract structured fraud trend data with domain-specific attributes.

For each fraud trend you identify:
1. Name: Clear, concise name for the trend
2. Category: Must be one of: synthetic_identity, staged_accident, exaggerated_claim, repair_fraud, phantom_vehicle, bodily_injury_fraud, property_fraud, health_fraud, workers_comp_fraud, organized_crime, provider_fraud, premium_fraud, digital_fraud, cyber_fraud
3. Description: 2-3 sentence description
4. Severity: Must be one of: low, medium, high, critical
5. Detection Difficulty: Must be one of: easy, moderate, hard, very_hard
6. Geographic Scope: List of regions/states affected
7. Affected Lines: List of insurance lines (e.g., auto, home, health)
8. Estimated Impact: Financial or operational impact description

For regulatory findings:
- Identify any regulatory changes, warnings, or enforcement actions
- Include issuing agency, date range, and specific requirements

Be comprehensive but accurate. Only extract trends with clear evidence from the sources."""

    human_prompt = f"""Analyze the following {len(sorted_results)} research sources and extract structured fraud trends and regulatory findings.

{sources_text}

Return your analysis in the following JSON format:
{{
  "trends": [
    {{
      "name": "Trend name",
      "category": "fraud_category",
      "description": "Detailed description",
      "severity": "severity_level",
      "detection_difficulty": "difficulty_level",
      "geographic_scope": ["region1", "region2"],
      "affected_lines": ["auto", "home"],
      "estimated_impact": "Impact description"
    }}
  ],
  "regulatory_findings": [
    {{
      "title": "Regulatory finding title",
      "issuing_agency": "Agency name",
      "date_range": "Time period",
      "description": "Description of regulatory change or action",
      "severity": "severity_level",
      "affected_regions": ["region1"]
    }}
  ]
}}

IMPORTANT:
- Return ONLY the JSON object, no additional text
- Use ONLY the exact category values listed above
- Use ONLY these severity values: low, medium, high, critical
- Use ONLY these detection difficulty values: easy, moderate, hard, very_hard
- Extract 3-7 major trends (prioritize quality over quantity)
- Include 0-5 regulatory findings if present in sources"""

    try:
        # Call Claude API
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt),
        ]

        response = llm.invoke(messages)
        response_text = response.content

        # Parse JSON response
        extracted_data = json.loads(response_text)

        # Validate response structure
        if "trends" not in extracted_data:
            raise ValueError("Missing 'trends' key in extraction response")
        if "regulatory_findings" not in extracted_data:
            extracted_data["regulatory_findings"] = []

        # Add source tier breakdown to findings
        findings = {
            "trends": extracted_data["trends"],
            "regulatory_findings": extracted_data["regulatory_findings"],
            "source_tier_breakdown": source_tier_breakdown,
        }

        # Calculate execution time
        duration_ms = int((time.time() - start_time) * 1000)

        # Create execution step for logging
        execution_step = ExecutionStep(
            step_number=5,
            step_name="Extract Key Findings",
            step_type=STEP_TYPE_EXTRACTION,
            input_summary=f"Analyzed {total_sources} sources ({tier_1_count} Tier 1, {tier_2_count} Tier 2, {tier_3_count} Tier 3)",
            output_summary=f"Extracted {len(findings['trends'])} fraud trends, {len(findings['regulatory_findings'])} regulatory findings",
            details={
                "total_sources_analyzed": total_sources,
                "sources_sent_to_llm": len(sorted_results),
                "source_tier_breakdown": source_tier_breakdown,
                "trends_count": len(findings["trends"]),
                "regulatory_findings_count": len(findings["regulatory_findings"]),
                "llm_model": "claude-3-haiku-20240307",
                "temperature": 0.4,
                "extracted_findings": findings,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

        return findings, execution_step

    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse Claude response as JSON: {e}\nResponse: {response_text}")
    except Exception as e:
        # Log error in execution step
        duration_ms = int((time.time() - start_time) * 1000)
        execution_step = ExecutionStep(
            step_number=5,
            step_name="Extract Key Findings",
            step_type=STEP_TYPE_EXTRACTION,
            input_summary=f"Attempted to analyze {total_sources} sources",
            output_summary=f"ERROR: {str(e)}",
            details={
                "error": str(e),
                "error_type": type(e).__name__,
                "total_sources": total_sources,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        raise Exception(f"Step 5 (Extract Findings) failed: {e}") from e


# =============================================================================
# STEP 6: SYNTHESIZE REPORT
# =============================================================================

def step_6_synthesize_report(
    fraud_input: FraudTrendsInput,
    extracted_findings: Dict[str, Any]
) -> tuple[Dict[str, Any], ExecutionStep]:
    """
    Step 6: Synthesize final report with executive summary and recommendations.

    Uses Claude to generate executive summary, actionable recommendations,
    confidence level, data freshness indicator, and regulatory disclaimer.

    Args:
        fraud_input: Original input parameters
        extracted_findings: Findings from Step 5

    Returns:
        tuple containing:
        - Dict with final report (executive_summary, recommendations, confidence_level, etc.)
        - ExecutionStep for execution trace logging

    Raises:
        Exception: If Claude API call fails
    """
    start_time = time.time()

    # Import constants
    from utils.constants import (
        CONFIDENCE_LEVELS,
        REGULATORY_DISCLAIMER,
        MIN_SOURCES_FOR_HIGH_CONFIDENCE,
        MIN_TIER_1_PERCENTAGE_FOR_HIGH_CONFIDENCE,
        RECOMMENDED_RECOMMENDATIONS_MIN,
        RECOMMENDED_RECOMMENDATIONS_MAX,
    )

    # Initialize Claude LLM
    llm = ChatAnthropic(
        model="claude-3-haiku-20240307",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        temperature=0.5,  # Moderate temperature for balanced synthesis
    )

    # Extract data from findings
    trends = extracted_findings.get("trends", [])
    regulatory_findings = extracted_findings.get("regulatory_findings", [])
    source_breakdown = extracted_findings.get("source_tier_breakdown", {})

    # Calculate confidence level based on source quality
    total_sources = source_breakdown.get("total_sources", 0)
    tier_1_percentage = source_breakdown.get("tier_1_percentage", 0.0)

    if (total_sources >= MIN_SOURCES_FOR_HIGH_CONFIDENCE and
        tier_1_percentage >= MIN_TIER_1_PERCENTAGE_FOR_HIGH_CONFIDENCE):
        confidence_level = "high"
    elif total_sources >= 10 and tier_1_percentage >= 20.0:
        confidence_level = "medium"
    else:
        confidence_level = "low"

    # Build synthesis prompt
    system_prompt = """You are an expert insurance fraud consultant preparing an executive briefing.

Your task is to synthesize research findings into a concise, actionable report for insurance executives and fraud investigators.

Guidelines:
- Executive Summary: Write 2-3 clear paragraphs covering key trends, their business impact, and overall assessment
- Recommendations: Provide 5-7 specific, actionable recommendations prioritized by impact
- Focus on business value and operational applicability
- Use professional but accessible language
- Emphasize what insurers should DO in response to these trends"""

    # Format trends for LLM
    trends_text = ""
    for i, trend in enumerate(trends, 1):
        affected_lines = ', '.join(trend.get('affected_lines', []))
        trends_text += f"{i}. {trend['name']} (Category: {trend['category']})\n"
        trends_text += f"   Severity: {trend['severity']} | Detection: {trend['detection_difficulty']}\n"
        trends_text += f"   Lines: {affected_lines}\n"
        trends_text += f"   Description: {trend.get('description', 'N/A')}\n"
        trends_text += f"   Impact: {trend.get('estimated_impact', 'N/A')}\n\n"

    # Format regulatory findings for LLM
    regulatory_text = ""
    if regulatory_findings:
        regulatory_text = "REGULATORY FINDINGS:\n"
        for i, finding in enumerate(regulatory_findings, 1):
            regulatory_text += f"{i}. {finding['title']}\n"
            regulatory_text += f"   Agency: {finding['issuing_agency']}\n"
            regulatory_text += f"   Severity: {finding['severity']}\n"
            regulatory_text += f"   Description: {finding.get('description', 'N/A')}\n\n"

    human_prompt = f"""Synthesize the following fraud trend research into an executive report:

RESEARCH CONTEXT:
Topic: {fraud_input.topic}
Regions: {', '.join(fraud_input.regions)}
Time Range: {fraud_input.time_range}

SOURCE QUALITY:
Total Sources: {total_sources}
Tier 1 Sources: {source_breakdown.get('tier_1_count', 0)} ({tier_1_percentage}%)
Tier 2 Sources: {source_breakdown.get('tier_2_count', 0)} ({source_breakdown.get('tier_2_percentage', 0.0)}%)
Tier 3 Sources: {source_breakdown.get('tier_3_count', 0)} ({source_breakdown.get('tier_3_percentage', 0.0)}%)

FRAUD TRENDS IDENTIFIED:
{trends_text}

{regulatory_text}

Generate an executive report in the following JSON format:
{{
  "executive_summary": "2-3 paragraphs synthesizing key findings, business impact, and overall assessment",
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3",
    "Specific actionable recommendation 4",
    "Specific actionable recommendation 5"
  ]
}}

IMPORTANT:
- Return ONLY the JSON object, no additional text
- Executive summary should be 2-3 well-structured paragraphs
- Provide {RECOMMENDED_RECOMMENDATIONS_MIN}-{RECOMMENDED_RECOMMENDATIONS_MAX} actionable recommendations
- Make recommendations specific and implementable (not generic advice)
- Prioritize recommendations by potential business impact"""

    try:
        # Call Claude API
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt),
        ]

        response = llm.invoke(messages)
        response_text = response.content

        # Parse JSON response
        synthesis_data = json.loads(response_text)

        # Validate response structure
        if "executive_summary" not in synthesis_data:
            raise ValueError("Missing 'executive_summary' key in synthesis response")
        if "recommendations" not in synthesis_data:
            raise ValueError("Missing 'recommendations' key in synthesis response")

        # Build final report
        report = {
            "executive_summary": synthesis_data["executive_summary"],
            "recommendations": synthesis_data["recommendations"],
            "confidence_level": confidence_level,
            "data_freshness": fraud_input.time_range,
            "regulatory_disclaimer": REGULATORY_DISCLAIMER,
        }

        # Calculate execution time
        duration_ms = int((time.time() - start_time) * 1000)

        # Create execution step for logging
        execution_step = ExecutionStep(
            step_number=6,
            step_name="Synthesize Report",
            step_type=STEP_TYPE_SYNTHESIS,
            input_summary=f"Synthesizing {len(trends)} trends, {len(regulatory_findings)} regulatory findings, confidence: {confidence_level}",
            output_summary=f"Generated executive summary and {len(report['recommendations'])} recommendations",
            details={
                "input_trends_count": len(trends),
                "input_regulatory_findings_count": len(regulatory_findings),
                "confidence_level": confidence_level,
                "confidence_basis": {
                    "total_sources": total_sources,
                    "tier_1_percentage": tier_1_percentage,
                },
                "recommendations_count": len(report["recommendations"]),
                "llm_model": "claude-3-haiku-20240307",
                "temperature": 0.5,
                "final_report": report,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

        return report, execution_step

    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse Claude response as JSON: {e}\nResponse: {response_text}")
    except Exception as e:
        # Log error in execution step
        duration_ms = int((time.time() - start_time) * 1000)
        execution_step = ExecutionStep(
            step_number=6,
            step_name="Synthesize Report",
            step_type=STEP_TYPE_SYNTHESIS,
            input_summary=f"Attempted to synthesize {len(trends)} trends",
            output_summary=f"ERROR: {str(e)}",
            details={
                "error": str(e),
                "error_type": type(e).__name__,
                "trends_count": len(trends),
                "regulatory_findings_count": len(regulatory_findings),
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        raise Exception(f"Step 6 (Synthesize Report) failed: {e}") from e


# =============================================================================
# JSON OUTPUT GENERATION
# =============================================================================

def generate_json_output(
    fraud_input: FraudTrendsInput,
    extracted_findings: Dict[str, Any],
    report: Dict[str, Any],
    execution_trace: List[ExecutionStep]
) -> str:
    """
    Generate and save validated JSON output file.

    Creates a complete case study JSON file including input parameters,
    output results, and execution trace. Validates using Pydantic models
    before writing to disk.

    Args:
        fraud_input: Original input parameters
        extracted_findings: Findings from Step 5
        report: Final report from Step 6
        execution_trace: List of all execution steps

    Returns:
        str: Path to the created JSON file

    Raises:
        Exception: If validation or file writing fails
    """
    import uuid
    from pathlib import Path
    from utils.constants import AGENT_SLUG

    # Generate UUID and timestamps
    case_study_id = str(uuid.uuid4())
    timestamp_now = datetime.utcnow().isoformat() + "Z"

    # Create title from input topic
    title = fraud_input.topic
    if not title.endswith(" - Fraud Trends Analysis"):
        title = f"{title} - Fraud Trends Analysis"

    # Create subtitle from regions and time range
    regions_str = ", ".join(fraud_input.regions)
    subtitle = f"Research findings for {regions_str} ({fraud_input.time_range})"

    # Convert extracted findings to Pydantic models
    trends = extracted_findings.get("trends", [])
    regulatory_findings_raw = extracted_findings.get("regulatory_findings", [])
    source_breakdown = extracted_findings.get("source_tier_breakdown", {})

    # Map regulatory findings from Step 5 format to Pydantic model format
    regulatory_findings_models = []
    for finding in regulatory_findings_raw:
        regulatory_findings_models.append(
            RegulatoryFinding(
                source=finding.get("issuing_agency", "Unknown Agency"),
                finding=finding.get("title", ""),
                date=finding.get("date_range", "Unknown"),
                severity=finding.get("severity", "medium"),
                url=None
            )
        )

    # Convert trends to FraudTrend models
    fraud_trends_models = [FraudTrend(**trend) for trend in trends]

    # Create SourceTierBreakdown model
    source_tier_breakdown_model = SourceTierBreakdown(**source_breakdown)

    # Create FraudTrendsOutput model (validates structure)
    output_result = FraudTrendsOutput(
        executive_summary=report["executive_summary"],
        trends=fraud_trends_models,
        regulatory_findings=regulatory_findings_models,
        source_tier_breakdown=source_tier_breakdown_model,
        confidence_level=report["confidence_level"],
        data_freshness=report["data_freshness"],
        disclaimer=report["regulatory_disclaimer"],
        recommendations=report["recommendations"]
    )

    # Create CaseStudy model (validates entire structure)
    case_study = CaseStudy(
        id=case_study_id,
        agent_slug=AGENT_SLUG,
        title=title,
        subtitle=subtitle,
        input_parameters=fraud_input,
        output_result=output_result,
        execution_trace=execution_trace,
        display=True,
        featured=False,
        display_order=None,
        created_at=timestamp_now,
        updated_at=timestamp_now
    )

    # Sanitize execution trace to remove API keys
    sanitized_case_study = json.loads(case_study.model_dump_json())
    
    # Remove sensitive data from execution trace details
    for step in sanitized_case_study.get("execution_trace", []):
        if "details" in step and step["details"]:
            details = step["details"]
            if "api_key" in details:
                del details["api_key"]
            if "anthropic_api_key" in details:
                del details["anthropic_api_key"]
            if "tavily_api_key" in details:
                del details["tavily_api_key"]

    # Create output directory
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)

    # Generate filename with timestamp
    timestamp_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"case_study_{timestamp_str}.json"
    file_path = output_dir / filename

    # Write JSON file with pretty formatting
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(sanitized_case_study, f, indent=2, ensure_ascii=False)

    # Print success message
    print(f"\n✓ Case study JSON generated successfully!")
    print(f"  File: {file_path.absolute()}")
    print(f"  ID: {case_study_id}")
    print(f"  Title: {title}")
    print(f"  Size: {file_path.stat().st_size:,} bytes")

    return str(file_path.absolute())
