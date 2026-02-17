#!/usr/bin/env python3
"""
Gita Guide Agent - Conversational Spiritual Guide

This agent provides spiritual guidance based on the Bhagavad Gita using a
static knowledge base of 700 verses. It supports live conversational interaction.

Agent Specifications:
- Slug: gita-guide
- Color: Saffron (#C1121F)
- Type: Conversational Expert (LIVE CHAT)
- Workflow: 6 conversational steps
- Knowledge Base: Static JSON (no external APIs except Claude)
- Target Execution Time: ≤5 seconds
"""

import argparse
import json
import sys
import os
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(Path(__file__).parent / '.env')

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent))

from utils.models import GitaGuideInput, GitaGuideOutput
from utils.steps import run_gita_guide_workflow
from utils.constants import AGENT_SLUG, AGENT_NAME


def main():
    """Main entry point for Gita Guide agent."""
    parser = argparse.ArgumentParser(
        description=f'{AGENT_NAME} - Spiritual Guidance from the Bhagavad Gita',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Ask a simple question
  python agent.py --question "What is dharma?"

  # Ask about a specific topic
  python agent.py --question "How to find inner peace?" --context "meditation"

  # Save output to custom file
  python agent.py --question "What is the path of devotion?" --output my_conversation.json
        """
    )

    parser.add_argument(
        '--question',
        type=str,
        required=True,
        help='Your spiritual question for the Gita Guide'
    )

    parser.add_argument(
        '--context',
        type=str,
        default='',
        help='Optional context or topic for the question (e.g., karma, dharma, meditation)'
    )

    parser.add_argument(
        '--conversation-history',
        type=str,
        default='',
        help='Optional JSON string of previous conversation messages for context'
    )

    parser.add_argument(
        '--output',
        type=str,
        help='Optional output filename (defaults to conversation_TIMESTAMP.json)'
    )

    args = parser.parse_args()

    # Validate required environment variables
    required_vars = ['ANTHROPIC_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        print(f"Error: Missing required environment variables: {', '.join(missing_vars)}")
        print("\nPlease set them in your .env file or export them:")
        for var in missing_vars:
            print(f"  export {var}='your_key_here'")
        sys.exit(1)

    # Create input model
    guide_input = GitaGuideInput(
        question=args.question,
        context=args.context if args.context else None
    )

    print(f"\n{'='*70}")
    print(f"{AGENT_NAME.upper()} - SPIRITUAL GUIDANCE")
    print(f"{'='*70}\n")
    print(f"Question: {guide_input.question}")
    if guide_input.context:
        print(f"Context: {guide_input.context}")
    print(f"\n{'='*70}\n")

    try:
        # Run the 6-step conversational workflow
        result = run_gita_guide_workflow(guide_input)

        print("\n" + "="*70)
        print("RESPONSE")
        print("="*70)
        print(f"\nExecutive Summary: {result.executive_summary}\n")
        print(f"\nAnswer:\n{result.answer}\n")
        print(f"\nPractical Guidance:\n{result.explanation}\n")

        if result.relevant_verses:
            print("\n" + "="*70)
            print(f"RELATED VERSES ({len(result.relevant_verses)} found)")
            print("="*70)
            for verse in result.relevant_verses[:3]:  # Show top 3
                print(f"\n  • {verse.verse_id}: {verse.english_translation[:100]}...")

        if result.related_topics:
            print("\n" + "="*70)
            print("RELATED TOPICS")
            print("="*70)
            for topic in result.related_topics:
                print(f"  • {topic}")

        if result.suggested_next_questions:
            print("\n" + "="*70)
            print("SUGGESTED NEXT QUESTIONS")
            print("="*70)
            for question in result.suggested_next_questions:
                print(f"  • {question}")

        # Generate output filename
        if args.output:
            output_file = Path(args.output)
        else:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = Path(__file__).parent / "output" / f"conversation_{timestamp}.json"

        # Save to JSON
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            # Create case study format compatible with database
            case_study = {
                "id": result.conversation_id,
                "agent_slug": AGENT_SLUG,
                "title": f"Gita Guide - {guide_input.question[:50]}...",
                "subtitle": guide_input.context or "General spiritual guidance",
                "input_parameters": guide_input.model_dump(),
                "output_result": result.model_dump(),
                "execution_trace": result.execution_trace,
                "display": True,
                "featured": False,
                "display_order": None,
                "created_at": result.timestamp,
                "updated_at": result.timestamp
            }
            json.dump(case_study, f, indent=2, ensure_ascii=False, default=str)

        print(f"\n{'='*70}")
        print(f"Output saved to: {output_file}")
        print(f"{'='*70}\n")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
