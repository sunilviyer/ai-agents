#!/usr/bin/env python3
"""
Database Import Script for Stock Monitor Case Studies

Imports validated case study JSON files into the PostgreSQL database.
"""

import json
import os
import sys
from pathlib import Path

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    print("Error: psycopg2 is not installed. Please install it:")
    print("  python3 -m pip install psycopg2-binary")
    sys.exit(1)


def import_case_study(conn, file_path: Path) -> bool:
    """Import a single case study JSON file to the database."""
    try:
        # Load JSON file
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Validate agent_slug
        if data.get('agent_slug') != 'stock-monitor':
            print(f"  ✗ Invalid agent_slug: Expected 'stock-monitor', got '{data.get('agent_slug')}'")
            return False

        print(f"\n  Importing: {file_path.name}")
        print(f"    ID: {data['id']}")
        print(f"    Title: {data.get('title', 'N/A')}")

        cursor = conn.cursor()

        # Insert/update case study
        insert_query = """
            INSERT INTO case_studies (
                id, agent_slug, title, subtitle,
                input_parameters, output_result, execution_trace,
                display, featured, display_order,
                created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s,
                %s::jsonb, %s::jsonb, %s::jsonb,
                %s, %s, %s,
                %s::timestamp, %s::timestamp
            )
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                subtitle = EXCLUDED.subtitle,
                input_parameters = EXCLUDED.input_parameters,
                output_result = EXCLUDED.output_result,
                execution_trace = EXCLUDED.execution_trace,
                display = EXCLUDED.display,
                featured = EXCLUDED.featured,
                display_order = EXCLUDED.display_order,
                updated_at = EXCLUDED.updated_at
        """

        cursor.execute(insert_query, (
            data['id'],
            data['agent_slug'],
            data.get('title', ''),
            data.get('subtitle'),
            json.dumps(data['input_parameters']),
            json.dumps(data['output_result']),
            json.dumps(data['execution_trace']),
            data.get('display', True),
            data.get('featured', False),
            data.get('display_order'),
            data['created_at'],
            data.get('updated_at', data['created_at'])
        ))

        cursor.close()
        print(f"    ✓ Imported successfully")
        return True

    except Exception as e:
        print(f"    ✗ Error: {e}")
        return False


def main():
    """Main execution function."""
    # Get database URL
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("✗ DATABASE_URL not set. Please set it:")
        print("  export DATABASE_URL='postgresql://...'")
        return 1

    # Get output directory
    output_dir = Path(__file__).parent.parent / "output"
    if not output_dir.exists():
        print(f"✗ Output directory not found: {output_dir}")
        return 1

    # Find all case study JSON files
    json_files = sorted(output_dir.glob('case_study_*.json'))
    if not json_files:
        print(f"✗ No case study JSON files found in {output_dir}")
        return 1

    print("=" * 70)
    print("STOCK MONITOR CASE STUDY IMPORT")
    print("=" * 70)
    print(f"\nFound {len(json_files)} case study files")

    # Connect to database
    try:
        conn = psycopg2.connect(database_url)
        print("✓ Connected to database\n")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return 1

    # Import each file
    successful = 0
    failed = 0

    for file_path in json_files:
        if import_case_study(conn, file_path):
            conn.commit()
            successful += 1
        else:
            conn.rollback()
            failed += 1

    conn.close()

    # Summary
    print("\n" + "=" * 70)
    print("IMPORT SUMMARY")
    print("=" * 70)
    print(f"Total files: {len(json_files)}")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print("=" * 70)

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
