#!/usr/bin/env python3
"""
Generate Multiple Case Studies for Fraud Trends Agent

This script generates multiple case studies with diverse topics to showcase
the agent's capabilities across different fraud scenarios.

Usage:
    python3 generate_case_studies.py

The script will generate case studies for:
1. Synthetic Identity Fraud (auto insurance)
2. Benefits Data Sharing (insurers)
3. Telematics Fraud (usage-based insurance)
4. Medical Provider Fraud (health insurance)
5. Property Claims Inflation (homeowners insurance)

Implementation: Epic 6, Story 6.1
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

# Case study topics to generate
CASE_STUDY_TOPICS = [
    {
        "topic": "synthetic identity fraud trends in auto insurance",
        "regions": ["United States"],
        "time_range": "2023-2024",
        "description": "Synthetic identity fraud using fabricated identities"
    },
    {
        "topic": "benefits of data sharing across insurers for fraud prevention",
        "regions": ["United States", "United Kingdom"],
        "time_range": "2024-2025",
        "description": "Cross-insurer data sharing and collaboration"
    },
    {
        "topic": "telematics fraud in usage-based insurance programs",
        "regions": ["United States", "Canada"],
        "time_range": "2023-2024",
        "description": "Manipulation of telematics devices and data"
    },
    {
        "topic": "medical provider fraud schemes in health insurance",
        "regions": ["United States"],
        "time_range": "2024-2025",
        "description": "Healthcare provider billing fraud and kickbacks"
    },
    {
        "topic": "property claims inflation fraud in homeowners insurance",
        "regions": ["United States"],
        "time_range": "2023-2024",
        "description": "Exaggerated or inflated property damage claims"
    },
]


def generate_single_case_study(topic_config: dict, index: int, total: int) -> bool:
    """
    Generate a single case study.

    Args:
        topic_config: Configuration dict with topic, regions, time_range
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
    print()

    # Create input
    fraud_input = FraudTrendsInput(
        topic=topic_config['topic'],
        regions=topic_config['regions'],
        time_range=topic_config['time_range']
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
        return False


def main():
    """Main execution function."""
    logger = get_logger()

    # Validate environment variables
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("✗ Error: ANTHROPIC_API_KEY environment variable not set")
        return 1

    if not os.getenv("TAVILY_API_KEY"):
        print("✗ Error: TAVILY_API_KEY environment variable not set")
        return 1

    # Print header
    print("=" * 70)
    print("FRAUD TRENDS AGENT - BATCH CASE STUDY GENERATION")
    print("=" * 70)
    print()
    print(f"Generating {len(CASE_STUDY_TOPICS)} case studies...")
    print()

    # Generate case studies
    successful = 0
    failed = 0

    for index, topic_config in enumerate(CASE_STUDY_TOPICS, start=1):
        if generate_single_case_study(topic_config, index, len(CASE_STUDY_TOPICS)):
            successful += 1
        else:
            failed += 1

        # Brief pause between case studies
        if index < len(CASE_STUDY_TOPICS):
            import time
            print("\nWaiting 2 seconds before next case study...")
            time.sleep(2)

    # Summary
    print()
    print("=" * 70)
    print("BATCH GENERATION COMPLETE")
    print("=" * 70)
    print()
    print(f"Total case studies: {len(CASE_STUDY_TOPICS)}")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print()

    if failed == 0:
        print("✓ All case studies generated successfully!")
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
