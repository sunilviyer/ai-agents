#!/usr/bin/env python3
"""
Generate the 3 Missing Case Studies for Fraud Trends Agent

This script generates only the case studies that haven't been run yet:
1. Auto Insurance Fraud 2024-2025
2. Property Fraud After Climate Events
3. Organized Fraud Rings

Usage:
    python3 generate_missing_cases.py
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
from utils.logging_config import get_logger, log_info

# Load environment variables
load_dotenv()

# The 3 missing case studies (from documentation: 01-fraud-trends-agent.md Section 7)
MISSING_CASE_STUDIES = [
    {
        "topic": "Auto Insurance Fraud",
        "regions": ["Canada", "US"],
        "time_range": "2024-2025",
        "focus_areas": ["staged collisions", "phantom passengers", "paper mills"],
        "description": "Staged accidents, phantom passengers, and emerging schemes"
    },
    {
        "topic": "Property Insurance Fraud",
        "regions": ["US", "Canada"],
        "time_range": "2023-2025",
        "focus_areas": ["disaster fraud", "inflated claims", "contractor schemes"],
        "description": "How natural disasters create fraud opportunities"
    },
    {
        "topic": "Organized Insurance Fraud",
        "regions": ["Canada", "US"],
        "time_range": "2023-2025",
        "focus_areas": ["fraud rings", "cross-border networks", "prosecution rates"],
        "description": "Networks, tactics, and prosecution trends"
    },
]


def generate_single_case_study(topic_config: dict, index: int, total: int) -> bool:
    """
    Generate a single case study.

    Args:
        topic_config: Configuration dict with topic, regions, time_range, focus_areas
        index: Current case study index (1-based)
        total: Total number of case studies to generate

    Returns:
        bool: True if successful, False otherwise
    """
    logger = get_logger()

    print("\n" + "=" * 70)
    print(f"GENERATING CASE STUDY {index}/{total}")
    print("=" * 70)
    print(f"Topic: {topic_config['description']}")
    print(f"Regions: {', '.join(topic_config['regions'])}")
    print(f"Time Range: {topic_config['time_range']}")
    print(f"Focus Areas: {', '.join(topic_config['focus_areas'])}")
    print()

    # Create input
    fraud_input = FraudTrendsInput(
        topic=topic_config['topic'],
        regions=topic_config['regions'],
        time_range=topic_config['time_range'],
        focus_areas=topic_config.get('focus_areas')
    )

    execution_trace = []

    try:
        # Step 1: Plan Research
        log_info(logger, f"[{index}/{total}] Step 1: Planning research strategy...")
        research_plan, step1 = step_1_plan_research(fraud_input)
        execution_trace.append(step1)
        log_info(logger, f"  ✓ Generated {len(research_plan['industry_queries'])}+{len(research_plan['regulatory_queries'])}+{len(research_plan['academic_queries'])} queries")

        # Step 2: Search Industry
        log_info(logger, f"[{index}/{total}] Step 2: Searching industry sources...")
        industry_results, step2 = step_2_search_industry(research_plan)
        execution_trace.append(step2)
        log_info(logger, f"  ✓ Found {len(industry_results)} industry sources")

        # Step 3: Search Regulatory
        log_info(logger, f"[{index}/{total}] Step 3: Searching regulatory sources...")
        regulatory_results, step3 = step_3_search_regulatory(research_plan)
        execution_trace.append(step3)
        log_info(logger, f"  ✓ Found {len(regulatory_results)} regulatory sources")

        # Step 4: Search Academic
        log_info(logger, f"[{index}/{total}] Step 4: Searching academic sources...")
        academic_results, step4 = step_4_search_academic(research_plan)
        execution_trace.append(step4)
        log_info(logger, f"  ✓ Found {len(academic_results)} academic sources")

        # Check total sources
        total_sources = len(industry_results) + len(regulatory_results) + len(academic_results)
        if total_sources == 0:
            log_info(logger, f"  ✗ No sources found - skipping case study")
            return False

        # Step 5: Extract Findings
        log_info(logger, f"[{index}/{total}] Step 5: Extracting key findings...")
        findings, step5 = step_5_extract_findings(industry_results, regulatory_results, academic_results)
        execution_trace.append(step5)
        log_info(logger, f"  ✓ Extracted {len(findings['trends'])} trends, {len(findings['regulatory_findings'])} regulatory findings")

        # Step 6: Synthesize Report
        log_info(logger, f"[{index}/{total}] Step 6: Synthesizing final report...")
        report, step6 = step_6_synthesize_report(fraud_input, findings)
        execution_trace.append(step6)
        log_info(logger, f"  ✓ Generated report with {len(report['recommendations'])} recommendations")

        # Generate JSON Output
        log_info(logger, f"[{index}/{total}] Generating JSON output...")
        output_path = generate_json_output(fraud_input, findings, report, execution_trace)
        log_info(logger, f"  ✓ Saved to: {output_path}")

        print()
        print(f"✓ Case Study {index}/{total} completed successfully")
        print(f"  - Total sources: {total_sources}")
        print(f"  - Trends identified: {len(findings['trends'])}")
        print(f"  - Recommendations: {len(report['recommendations'])}")
        print(f"  - Confidence: {report['confidence_level'].upper()}")
        print(f"  - Output: {output_path}")

        return True

    except Exception as e:
        print(f"\n✗ Error generating case study {index}/{total}: {e}")
        logger.error(f"Case study generation failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main execution function."""
    logger = get_logger()

    # Validate environment variables
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("✗ Error: ANTHROPIC_API_KEY environment variable not set")
        print("  Please set it in your .env file or environment")
        return 1

    if not os.getenv("TAVILY_API_KEY"):
        print("✗ Error: TAVILY_API_KEY environment variable not set")
        print("  Please set it in your .env file or environment")
        return 1

    # Print header
    print("=" * 70)
    print("FRAUD TRENDS AGENT - GENERATE MISSING CASE STUDIES")
    print("=" * 70)
    print()
    print(f"Generating {len(MISSING_CASE_STUDIES)} missing case studies...")
    print()
    print("Missing studies:")
    for i, topic in enumerate(MISSING_CASE_STUDIES, 1):
        print(f"  {i}. {topic['description']}")
    print()

    # Generate case studies
    successful = 0
    failed = 0

    for index, topic_config in enumerate(MISSING_CASE_STUDIES, start=1):
        if generate_single_case_study(topic_config, index, len(MISSING_CASE_STUDIES)):
            successful += 1
        else:
            failed += 1

        # Brief pause between case studies
        if index < len(MISSING_CASE_STUDIES):
            import time
            print("\nWaiting 2 seconds before next case study...")
            time.sleep(2)

    # Summary
    print()
    print("=" * 70)
    print("GENERATION COMPLETE")
    print("=" * 70)
    print()
    print(f"Total case studies attempted: {len(MISSING_CASE_STUDIES)}")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print()

    if failed == 0:
        print("✓ All missing case studies generated successfully!")
        print()
        print("Next steps:")
        print("  1. Review case studies in output/ directory")
        print("  2. Import to database: python3 scripts/import_case_studies.py output/")
        print()
        return 0
    else:
        print(f"⚠ {failed} case study(ies) failed to generate")
        return 1


if __name__ == "__main__":
    sys.exit(main())
