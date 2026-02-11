#!/usr/bin/env python3
"""
Fraud Trends Agent - Main Orchestrator

This script orchestrates the complete 6-step fraud trends research workflow
with comprehensive error handling and logging.

Usage:
    python3 run_agent.py

The agent will:
1. Plan research strategy (Claude LLM)
2. Search industry sources (Tavily API)
3. Search regulatory sources (Tavily API with domain filtering)
4. Search academic sources (Tavily API with domain filtering)
5. Extract key findings (Claude LLM analysis)
6. Synthesize final report (Claude LLM synthesis)
7. Generate validated JSON output

Implementation: Epic 3, Stories 3.2-3.9
"""

import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
from utils.models import FraudTrendsInput
from utils.steps import (
    step_1_plan_research,
    step_2_search_industry,
    step_3_search_regulatory,
    step_4_search_academic,
    step_5_extract_findings,
    step_6_synthesize_report,
    generate_json_output,
)
from utils.logging_config import (
    get_logger,
    log_step_start,
    log_step_complete,
    log_step_error,
    log_warning,
    log_info,
)


def main():
    """
    Main orchestration function for the Fraud Trends agent.

    Executes the complete 6-step workflow with error handling and logging.

    Returns:
        int: Exit code (0 for success, non-zero for failure)
    """
    # Load environment variables
    load_dotenv()

    # Setup logging
    logger = get_logger()

    # Validate environment variables
    if not os.getenv("ANTHROPIC_API_KEY"):
        logger.error("ANTHROPIC_API_KEY environment variable not set")
        return 1

    if not os.getenv("TAVILY_API_KEY"):
        logger.error("TAVILY_API_KEY environment variable not set")
        return 1

    # Print banner
    print("=" * 70)
    print("FRAUD TRENDS INVESTIGATOR AGENT")
    print("=" * 70)
    print()

    # Create input parameters
    # TODO: In production, these would come from CLI args or config file
    fraud_input = FraudTrendsInput(
        topic="synthetic identity fraud trends in auto insurance",
        regions=["United States"],
        time_range="2023-2024"
    )

    log_info(logger, f"Research Topic: {fraud_input.topic}")
    log_info(logger, f"Regions: {', '.join(fraud_input.regions)}")
    log_info(logger, f"Time Range: {fraud_input.time_range}")
    print()

    # Execution trace to collect all steps
    execution_trace = []

    try:
        # =====================================================================
        # STEP 1: Plan Research Strategy
        # =====================================================================
        log_step_start(logger, 1, "Plan Research Strategy", "Using Claude LLM")

        try:
            research_plan, step1 = step_1_plan_research(fraud_input)
            execution_trace.append(step1)
            log_step_complete(logger, 1, "Plan Research Strategy", step1.duration_ms,
                             f"Generated {len(research_plan['industry_queries'])}+{len(research_plan['regulatory_queries'])}+{len(research_plan['academic_queries'])} queries")
        except Exception as e:
            log_step_error(logger, 1, "Plan Research Strategy", e)
            logger.error("Critical failure: Cannot proceed without research plan")
            return 1

        # =====================================================================
        # STEP 2: Search Industry Sources
        # =====================================================================
        log_step_start(logger, 2, "Search Industry Sources", "Using Tavily API")

        try:
            industry_results, step2 = step_2_search_industry(research_plan)
            execution_trace.append(step2)
            log_step_complete(logger, 2, "Search Industry Sources", step2.duration_ms,
                             f"Found {len(industry_results)} sources")

            if len(industry_results) == 0:
                log_warning(logger, "No industry sources found", "Step 2")
        except Exception as e:
            log_step_error(logger, 2, "Search Industry Sources", e)
            # Graceful degradation: continue with empty results
            industry_results = []
            log_warning(logger, "Continuing with no industry sources", "Step 2")

        # =====================================================================
        # STEP 3: Search Regulatory Sources
        # =====================================================================
        log_step_start(logger, 3, "Search Regulatory Sources", "Using Tavily API with domain filters")

        try:
            regulatory_results, step3 = step_3_search_regulatory(research_plan)
            execution_trace.append(step3)
            log_step_complete(logger, 3, "Search Regulatory Sources", step3.duration_ms,
                             f"Found {len(regulatory_results)} Tier 1 sources")

            if len(regulatory_results) == 0:
                log_warning(logger, "No regulatory sources found", "Step 3")
        except Exception as e:
            log_step_error(logger, 3, "Search Regulatory Sources", e)
            # Graceful degradation: continue with empty results
            regulatory_results = []
            log_warning(logger, "Continuing with no regulatory sources", "Step 3")

        # =====================================================================
        # STEP 4: Search Academic Sources
        # =====================================================================
        log_step_start(logger, 4, "Search Academic Sources", "Using Tavily API with domain filters")

        try:
            academic_results, step4 = step_4_search_academic(research_plan)
            execution_trace.append(step4)
            log_step_complete(logger, 4, "Search Academic Sources", step4.duration_ms,
                             f"Found {len(academic_results)} Tier 1 sources")

            if len(academic_results) == 0:
                log_warning(logger, "No academic sources found", "Step 4")
        except Exception as e:
            log_step_error(logger, 4, "Search Academic Sources", e)
            # Graceful degradation: continue with empty results
            academic_results = []
            log_warning(logger, "Continuing with no academic sources", "Step 4")

        # Check if we have enough sources to continue
        total_sources = len(industry_results) + len(regulatory_results) + len(academic_results)
        if total_sources == 0:
            logger.error("Critical failure: No sources found from any search step")
            return 1

        if total_sources < 10:
            log_warning(logger, f"Low source count ({total_sources} sources). Confidence will be reduced.", "Data Quality")

        # =====================================================================
        # STEP 5: Extract Key Findings
        # =====================================================================
        log_step_start(logger, 5, "Extract Key Findings", "Analyzing sources with Claude LLM")

        try:
            findings, step5 = step_5_extract_findings(industry_results, regulatory_results, academic_results)
            execution_trace.append(step5)
            log_step_complete(logger, 5, "Extract Key Findings", step5.duration_ms,
                             f"Extracted {len(findings['trends'])} trends, {len(findings['regulatory_findings'])} regulatory findings")
        except Exception as e:
            log_step_error(logger, 5, "Extract Key Findings", e)
            logger.error("Critical failure: Cannot generate report without extracted findings")
            return 1

        # =====================================================================
        # STEP 6: Synthesize Report
        # =====================================================================
        log_step_start(logger, 6, "Synthesize Report", "Generating executive summary and recommendations")

        try:
            report, step6 = step_6_synthesize_report(fraud_input, findings)
            execution_trace.append(step6)
            log_step_complete(logger, 6, "Synthesize Report", step6.duration_ms,
                             f"Generated summary and {len(report['recommendations'])} recommendations (confidence: {report['confidence_level']})")
        except Exception as e:
            log_step_error(logger, 6, "Synthesize Report", e)
            logger.error("Critical failure: Cannot complete without final report")
            return 1

        # =====================================================================
        # Generate JSON Output
        # =====================================================================
        print()
        log_info(logger, "Generating JSON output file...")

        try:
            output_path = generate_json_output(fraud_input, findings, report, execution_trace)
            log_info(logger, f"JSON output saved: {output_path}")
        except Exception as e:
            log_step_error(logger, 0, "JSON Output Generation", e)
            logger.error("Failed to generate JSON output file")
            return 1

        # =====================================================================
        # Success Summary
        # =====================================================================
        print()
        print("=" * 70)
        print("✓ WORKFLOW COMPLETED SUCCESSFULLY")
        print("=" * 70)

        total_duration = sum(step.duration_ms for step in execution_trace)
        print(f"\nTotal Duration: {total_duration}ms (~{total_duration/1000:.1f}s)")
        print(f"Confidence Level: {report['confidence_level'].upper()}")
        print(f"Total Sources: {total_sources}")
        print(f"Trends Identified: {len(findings['trends'])}")
        print(f"Recommendations: {len(report['recommendations'])}")
        print(f"Output File: {output_path}")
        print()

        return 0

    except KeyboardInterrupt:
        print("\n\nWorkflow interrupted by user")
        logger.warning("Workflow interrupted by user (Ctrl+C)")
        return 130

    except Exception as e:
        print("\n\nUnexpected error occurred")
        log_step_error(logger, 0, "Workflow", e)
        logger.error("Workflow terminated due to unexpected error")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
