#!/usr/bin/env python3
"""
Article Editor Agent - Content Enhancement & SEO Optimization
Agent slug: article-editor
Agent color: Purple
"""

import argparse
import os
import sys
import json
import uuid
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Add utils to path
sys.path.insert(0, os.path.dirname(__file__))

from utils.models import ArticleEnhancerInput, ArticleEnhancerOutput
from utils.steps import run_article_editor_workflow
from utils.constants import AGENT_SLUG


def generate_json_output(
    article_input: ArticleEnhancerInput,
    output: ArticleEnhancerOutput,
    execution_trace: list
) -> str:
    """
    Generate and save validated JSON output file.

    Returns:
        Path to created JSON file
    """
    # Generate UUID and timestamps
    case_study_id = str(uuid.uuid4())
    timestamp_now = datetime.utcnow().isoformat() + "Z"

    # Create title
    title = f"Article Enhancement - {len(article_input.original_text)} characters"

    # Create subtitle
    keywords_str = ", ".join(article_input.target_keywords[:3]) if article_input.target_keywords else "no keywords"
    subtitle = f"{article_input.tone} tone, {keywords_str}"

    # Create case study structure
    case_study = {
        "id": case_study_id,
        "agent_slug": AGENT_SLUG,
        "title": title,
        "subtitle": subtitle,
        "input_parameters": article_input.model_dump(),
        "output_result": output.model_dump(),
        "execution_trace": execution_trace,
        "display": True,
        "featured": False,
        "display_order": None,
        "created_at": timestamp_now,
        "updated_at": timestamp_now
    }

    # Create output directory
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)

    # Generate filename
    timestamp_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"case_study_{timestamp_str}.json"
    file_path = output_dir / filename

    # Write JSON file
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(case_study, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Case study JSON generated successfully!")
    print(f"  File: {file_path.absolute()}")
    print(f"  ID: {case_study_id}")
    print(f"  Size: {file_path.stat().st_size:,} bytes")

    return str(file_path.absolute())


def main():
    parser = argparse.ArgumentParser(
        description='Article Editor Agent - Content Enhancement & SEO Optimization'
    )
    parser.add_argument('--article-file', required=True, help='Path to article text file')
    parser.add_argument('--keywords', nargs='*', default=[], help='Target SEO keywords (space-separated)')
    parser.add_argument('--tone', default='professional', help='Desired tone (default: professional)')
    parser.add_argument('--goals', nargs='*', default=['readability', 'seo', 'engagement'],
                       help='Enhancement goals (default: readability seo engagement)')

    args = parser.parse_args()

    # Load environment variables after parsing args (so --help works without .env)
    load_dotenv()

    # Validate required environment variables
    required_vars = ['ANTHROPIC_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        print(f"Error: Missing required environment variables: {', '.join(missing_vars)}")
        print("Please configure .env file based on .env.example")
        print("Note: TAVILY_API_KEY is optional for MVP")
        sys.exit(1)

    # Read article file
    try:
        article_path = Path(args.article_file)
        if not article_path.exists():
            print(f"Error: Article file not found: {args.article_file}")
            sys.exit(1)

        # Try multiple encodings
        encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
        article_text = None

        for encoding in encodings:
            try:
                with open(article_path, 'r', encoding=encoding) as f:
                    article_text = f.read()
                print(f"Successfully read file with {encoding} encoding")
                break
            except UnicodeDecodeError:
                continue

        if article_text is None:
            print(f"Error: Could not decode file with any supported encoding")
            sys.exit(1)

    except Exception as e:
        print(f"Error reading article file: {e}")
        sys.exit(1)

    # Create input model
    try:
        article_input = ArticleEnhancerInput(
            original_text=article_text,
            target_keywords=args.keywords,
            target_audience="general",  # Default, could be added as CLI arg
            enhancement_focus=args.goals,
            word_limit=None,
            tone=args.tone
        )
    except Exception as e:
        print(f"Error: Invalid input parameters: {e}")
        sys.exit(1)

    # Run workflow
    try:
        output, execution_trace = run_article_editor_workflow(article_input)

        # Generate JSON output
        json_path = generate_json_output(article_input, output, execution_trace)

        print(f"\n🎉 Article Enhancement completed successfully!")
        print(f"   Output: {json_path}")

    except Exception as e:
        print(f"\n❌ Article Enhancement failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
