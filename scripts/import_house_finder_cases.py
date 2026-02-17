#!/usr/bin/env python3
"""
Import House Finder case studies to production database.

Usage:
    python3 scripts/import_house_finder_cases.py
"""

import sys
import os
import json
import psycopg2
from pathlib import Path

# Database connection string — loaded from environment variable.
# Set DATABASE_URL in your .env file or shell before running.
# Example: export DATABASE_URL="postgresql://neondb_owner:PASSWORD@host/neondb?sslmode=require"
DB_CONNECTION = os.environ.get("DATABASE_URL")
if not DB_CONNECTION:
    raise EnvironmentError("DATABASE_URL environment variable is not set. See .env.example.")

def import_case_study(file_path: str, conn):
    """Import a single case study JSON file to database."""
    with open(file_path, 'r') as f:
        case_study = json.load(f)

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
                updated_at = EXCLUDED.updated_at
        """, (
            case_study['id'],
            case_study['agent_slug'],
            case_study['title'],
            case_study['subtitle'],
            json.dumps(case_study['input_parameters']),
            json.dumps(case_study['output_result']),
            json.dumps(case_study['execution_trace']),
            case_study['display'],
            case_study['featured'],
            case_study['display_order'],
            case_study['created_at'],
            case_study['updated_at']
        ))

        # Import execution steps
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
                    details = EXCLUDED.details
            """, (
                case_study['id'],
                step['step_number'],
                step['step_name'],
                step['step_type'],
                step['input_summary'],
                step['output_summary'],
                json.dumps(step['details']),
                step['duration_ms'],
                step['timestamp']
            ))

    conn.commit()
    print(f"✓ Imported: {case_study['title']} ({case_study['id']})")


def main():
    # Case study files to import (latest 4 case studies from real HouseSigma data)
    case_files = [
        "agents/house-finder/output/case_study_20260213_144710.json",  # Oakville, ON - 4bed/2bath
        "agents/house-finder/output/case_study_20260213_145313.json",  # West Vancouver, BC - 1bed/1bath
        "agents/house-finder/output/case_study_20260213_145555.json",  # Calgary, AB - 3000+ sqft
        "agents/house-finder/output/case_study_20260213_150027.json",  # Brampton, ON - Townhouse
    ]

    # Connect to database
    print("Connecting to database...")
    conn = psycopg2.connect(DB_CONNECTION)

    try:
        # Import each case study
        for file_path in case_files:
            full_path = Path(__file__).parent.parent / file_path
            if full_path.exists():
                import_case_study(str(full_path), conn)
            else:
                print(f"⚠ File not found: {full_path}")

        print(f"\n✅ Successfully imported {len(case_files)} case studies!")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
