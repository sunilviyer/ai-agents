#!/usr/bin/env python3
"""
Import Gita Guide case studies to production database.

Usage:
    python3 scripts/import_gita_guide_cases.py
"""

import sys
import os
import json
import psycopg2
from pathlib import Path

# Database connection string (use owner account for write operations)
DB_CONNECTION = "postgresql://neondb_owner:npg_yxzjXk0L8Ofp@ep-purple-flower-aix6l70h-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"


def import_case_study(file_path: str, conn, display_order: int = None, featured: bool = False):
    """Import a single case study JSON file to database."""
    with open(file_path, 'r') as f:
        case_study = json.load(f)

    # Generate a meaningful subtitle from the question (max 40 chars)
    question = case_study['input_parameters'].get('question', '')
    subtitle = question[:40] + '...' if len(question) > 40 else question

    # Insert case study
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO case_studies (
                id, agent_slug, title, subtitle,
                input_parameters, output_result, execution_trace,
                display, featured, display_order,
                created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                subtitle = EXCLUDED.subtitle,
                input_parameters = EXCLUDED.input_parameters,
                output_result = EXCLUDED.output_result,
                execution_trace = EXCLUDED.execution_trace,
                featured = EXCLUDED.featured,
                display_order = EXCLUDED.display_order,
                updated_at = EXCLUDED.updated_at
        """, (
            case_study['id'],
            case_study['agent_slug'],
            case_study['title'],
            subtitle,
            json.dumps(case_study['input_parameters']),
            json.dumps(case_study['output_result']),
            json.dumps(case_study['execution_trace']),
            case_study.get('display', True),
            featured,
            display_order,
            case_study['created_at'],
            case_study['updated_at']
        ))

        # Import execution steps - gita steps don't have input_summary/output_summary
        for step in case_study['execution_trace']:
            cur.execute("""
                INSERT INTO execution_steps (
                    case_study_id, step_number, step_name, step_type,
                    input_summary, output_summary, details,
                    duration_ms, timestamp
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (case_study_id, step_number) DO UPDATE SET
                    step_name = EXCLUDED.step_name,
                    details = EXCLUDED.details,
                    duration_ms = EXCLUDED.duration_ms
            """, (
                case_study['id'],
                step['step_number'],
                step['step_name'],
                step['step_type'],
                step.get('input_summary'),   # nullable
                step.get('output_summary'),  # nullable
                json.dumps(step.get('details', {})),
                step.get('duration_ms'),
                step.get('timestamp')
            ))

    conn.commit()
    print(f"✓ Imported: {case_study['title']} ({case_study['id']})")


def main():
    # Case study files to import - 5 diverse questions from the Bhagavad Gita
    base_dir = Path(__file__).parent.parent

    # Find all gita-guide output files and pick the 5 best unique ones
    output_dir = base_dir / "agents" / "gita-guide" / "output"
    all_files = sorted(output_dir.glob("*.json"), key=lambda f: f.stat().st_mtime)

    # Deduplicate by question - keep the most recent version of each unique question
    seen_questions = {}
    for file_path in all_files:
        with open(file_path) as f:
            data = json.load(f)
        question = data['input_parameters']['question']
        seen_questions[question] = str(file_path)

    # Select the 5 most diverse/interesting case studies
    # If we have 5+ unique questions, pick 5; otherwise use all
    unique_files = list(seen_questions.values())
    print(f"Found {len(unique_files)} unique questions across {len(list(all_files))} output files")

    case_files = unique_files[:5]  # Take up to 5

    # Connect to database
    print("Connecting to database...")
    conn = psycopg2.connect(DB_CONNECTION)

    try:
        imported = 0
        for i, file_path in enumerate(case_files):
            if Path(file_path).exists():
                is_featured = (i == 0)  # Feature the first one
                import_case_study(file_path, conn, display_order=i+1, featured=is_featured)
                imported += 1
            else:
                print(f"⚠ File not found: {file_path}")

        print(f"\n✅ Successfully imported {imported} case studies!")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
