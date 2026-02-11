#!/usr/bin/env python3
"""
Database Import Script for Case Studies

This script imports validated case study JSON files into the PostgreSQL database.
It supports importing single files or batch importing from a directory.

Usage:
    # Import single file
    python scripts/import_case_studies.py output/case_study_20260210_001103.json

    # Import all files from directory
    python scripts/import_case_studies.py output/

    # Use custom database connection string
    export DATABASE_URL="postgresql://user:password@host:port/database"
    python scripts/import_case_studies.py output/case_study_20260210_001103.json

Implementation: Epic 4, Stories 4.1-4.6
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

try:
    import psycopg2
    from psycopg2 import pool
    from psycopg2.extras import RealDictCursor
except ImportError:
    print("Error: psycopg2 is not installed. Please install it:")
    print("  python3 -m pip install psycopg2-binary")
    sys.exit(1)


# =============================================================================
# DATABASE CONNECTION
# =============================================================================

class DatabaseConnection:
    """
    Manages PostgreSQL database connection pool with robust error handling.

    Features:
    - Connection pooling for performance
    - Retry logic for transient failures
    - Connection validation before use
    - Detailed error categorization
    - Graceful degradation and cleanup
    """

    def __init__(self, connection_string: str, max_retries: int = 3, retry_delay: int = 2):
        """
        Initialize database connection pool.

        Args:
            connection_string: PostgreSQL connection string
            max_retries: Maximum connection retry attempts (default: 3)
            retry_delay: Delay between retries in seconds (default: 2)
        """
        self.connection_string = connection_string
        self.connection_pool = None
        self.max_retries = max_retries
        self.retry_delay = retry_delay

    def connect(self):
        """
        Create connection pool with retry logic.

        Handles:
        - Connection timeouts
        - Authentication failures
        - Network issues
        - Database unavailability
        - Invalid connection strings

        Raises:
            psycopg2.OperationalError: If connection fails after retries
            psycopg2.Error: For other database errors
        """
        import time

        last_error = None

        for attempt in range(1, self.max_retries + 1):
            try:
                print(f"Attempting database connection (attempt {attempt}/{self.max_retries})...")

                self.connection_pool = psycopg2.pool.SimpleConnectionPool(
                    minconn=1,
                    maxconn=5,
                    dsn=self.connection_string,
                    connect_timeout=10  # 10 second timeout
                )

                # Test the connection
                conn = self.connection_pool.getconn()
                try:
                    cursor = conn.cursor()
                    cursor.execute("SELECT 1")
                    cursor.close()
                    print(f"✓ Connected to database successfully")
                    return
                finally:
                    self.connection_pool.putconn(conn)

            except psycopg2.OperationalError as e:
                last_error = e
                error_msg = str(e).lower()

                # Categorize the error
                if "timeout" in error_msg or "timed out" in error_msg:
                    print(f"✗ Connection timeout (attempt {attempt}/{self.max_retries})")
                elif "could not connect" in error_msg or "connection refused" in error_msg:
                    print(f"✗ Database unavailable (attempt {attempt}/{self.max_retries})")
                elif "does not exist" in error_msg:
                    print(f"✗ Database does not exist: {e}")
                    raise  # Don't retry for this error
                elif "authentication failed" in error_msg or "password" in error_msg:
                    print(f"✗ Authentication failed: {e}")
                    raise  # Don't retry for this error
                else:
                    print(f"✗ Connection failed (attempt {attempt}/{self.max_retries}): {e}")

                # Retry with delay (except on last attempt)
                if attempt < self.max_retries:
                    print(f"  Retrying in {self.retry_delay} seconds...")
                    time.sleep(self.retry_delay)

            except psycopg2.Error as e:
                last_error = e
                print(f"✗ Database error: {e}")
                raise  # Don't retry for non-operational errors

            except Exception as e:
                last_error = e
                print(f"✗ Unexpected error: {e}")
                raise

        # All retries exhausted
        print(f"✗ Failed to connect after {self.max_retries} attempts")
        raise psycopg2.OperationalError(f"Connection failed after {self.max_retries} retries: {last_error}")

    def get_connection(self):
        """
        Get a connection from the pool with validation.

        Returns:
            psycopg2.connection: Database connection

        Raises:
            RuntimeError: If connection pool not initialized
            psycopg2.pool.PoolError: If pool is exhausted
        """
        if self.connection_pool is None:
            raise RuntimeError("Connection pool not initialized. Call connect() first.")

        try:
            conn = self.connection_pool.getconn()

            # Validate connection is still alive
            if conn.closed:
                print("⚠ Warning: Retrieved closed connection, reconnecting...")
                self.connection_pool.putconn(conn, close=True)
                conn = self.connection_pool.getconn()

            return conn

        except psycopg2.pool.PoolError as e:
            print(f"✗ Connection pool exhausted: {e}")
            raise

    def return_connection(self, conn, error: bool = False):
        """
        Return connection to the pool.

        Args:
            conn: Connection to return
            error: If True, closes the connection instead of returning to pool
        """
        if self.connection_pool and conn:
            try:
                if error or conn.closed:
                    # Close connection on error or if already closed
                    self.connection_pool.putconn(conn, close=True)
                else:
                    # Return healthy connection to pool
                    self.connection_pool.putconn(conn)
            except Exception as e:
                print(f"⚠ Warning: Error returning connection to pool: {e}")

    def test_connection(self) -> bool:
        """
        Test database connectivity without throwing exceptions.

        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            if self.connection_pool is None:
                return False

            conn = self.get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                cursor.close()
                return True
            finally:
                self.return_connection(conn)

        except Exception as e:
            print(f"⚠ Connection test failed: {e}")
            return False

    def close(self):
        """Close all connections in the pool with error handling."""
        if self.connection_pool:
            try:
                self.connection_pool.closeall()
                print(f"✓ Database connections closed")
            except Exception as e:
                print(f"⚠ Warning: Error closing connection pool: {e}")


# =============================================================================
# VALIDATION
# =============================================================================

def validate_json_file(file_path: Path) -> Optional[Dict[str, Any]]:
    """
    Validate and load JSON case study file with comprehensive validation.

    Validates:
    - File format and structure
    - Required fields presence
    - Data types for all fields
    - Nested structure validity (input_parameters, output_result, execution_trace)
    - Business logic constraints
    - Timestamp format
    - ID format (UUID v4)

    Args:
        file_path: Path to JSON file

    Returns:
        Dict containing case study data, or None if invalid
    """
    try:
        # =====================================================================
        # STEP 1: Load and parse JSON
        # =====================================================================
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if not isinstance(data, dict):
            print(f"✗ Invalid JSON: Root must be an object, not {type(data).__name__} in {file_path.name}")
            return None

        # =====================================================================
        # STEP 2: Validate required top-level fields
        # =====================================================================
        required_fields = [
            'id', 'agent_slug', 'title', 'input_parameters',
            'output_result', 'execution_trace', 'created_at'
        ]

        for field in required_fields:
            if field not in data:
                print(f"✗ Missing required field '{field}' in {file_path.name}")
                return None

        # =====================================================================
        # STEP 3: Validate ID format (should be UUID v4)
        # =====================================================================
        case_id = data['id']
        if not isinstance(case_id, str) or len(case_id) == 0:
            print(f"✗ Invalid 'id': Must be non-empty string in {file_path.name}")
            return None

        # Basic UUID format check (8-4-4-4-12 hex digits)
        import re
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        if not re.match(uuid_pattern, case_id, re.IGNORECASE):
            print(f"✗ Invalid 'id': Must be valid UUID format in {file_path.name}")
            return None

        # =====================================================================
        # STEP 4: Validate agent_slug
        # =====================================================================
        if not isinstance(data['agent_slug'], str):
            print(f"✗ Invalid 'agent_slug': Must be string in {file_path.name}")
            return None

        if data['agent_slug'] != 'fraud-trends':
            print(f"✗ Invalid 'agent_slug': Expected 'fraud-trends', got '{data['agent_slug']}' in {file_path.name}")
            return None

        # =====================================================================
        # STEP 5: Validate title and subtitle
        # =====================================================================
        if not isinstance(data['title'], str) or len(data['title']) == 0:
            print(f"✗ Invalid 'title': Must be non-empty string in {file_path.name}")
            return None

        if len(data['title']) > 500:
            print(f"✗ Invalid 'title': Exceeds 500 character limit in {file_path.name}")
            return None

        if 'subtitle' in data and data['subtitle'] is not None:
            if not isinstance(data['subtitle'], str):
                print(f"✗ Invalid 'subtitle': Must be string or null in {file_path.name}")
                return None
            if len(data['subtitle']) > 1000:
                print(f"✗ Invalid 'subtitle': Exceeds 1000 character limit in {file_path.name}")
                return None

        # =====================================================================
        # STEP 6: Validate input_parameters (must be object)
        # =====================================================================
        if not isinstance(data['input_parameters'], dict):
            print(f"✗ Invalid 'input_parameters': Must be object in {file_path.name}")
            return None

        # Validate required input_parameters fields
        required_input_fields = ['topic', 'regions', 'time_range']
        for field in required_input_fields:
            if field not in data['input_parameters']:
                print(f"✗ Missing required field 'input_parameters.{field}' in {file_path.name}")
                return None

        # Validate topic is non-empty string
        if not isinstance(data['input_parameters']['topic'], str) or len(data['input_parameters']['topic']) == 0:
            print(f"✗ Invalid 'input_parameters.topic': Must be non-empty string in {file_path.name}")
            return None

        # Validate regions is non-empty array
        if not isinstance(data['input_parameters']['regions'], list) or len(data['input_parameters']['regions']) == 0:
            print(f"✗ Invalid 'input_parameters.regions': Must be non-empty array in {file_path.name}")
            return None

        # Validate time_range is non-empty string
        if not isinstance(data['input_parameters']['time_range'], str) or len(data['input_parameters']['time_range']) == 0:
            print(f"✗ Invalid 'input_parameters.time_range': Must be non-empty string in {file_path.name}")
            return None

        # =====================================================================
        # STEP 7: Validate output_result (must be object)
        # =====================================================================
        if not isinstance(data['output_result'], dict):
            print(f"✗ Invalid 'output_result': Must be object in {file_path.name}")
            return None

        # Validate required output_result fields
        required_output_fields = ['executive_summary', 'trends', 'regulatory_findings', 'recommendations', 'confidence_level']
        for field in required_output_fields:
            if field not in data['output_result']:
                print(f"✗ Missing required field 'output_result.{field}' in {file_path.name}")
                return None

        # Validate executive_summary is non-empty string
        if not isinstance(data['output_result']['executive_summary'], str) or len(data['output_result']['executive_summary']) == 0:
            print(f"✗ Invalid 'output_result.executive_summary': Must be non-empty string in {file_path.name}")
            return None

        # Validate trends is array
        if not isinstance(data['output_result']['trends'], list):
            print(f"✗ Invalid 'output_result.trends': Must be array in {file_path.name}")
            return None

        # Validate regulatory_findings is array
        if not isinstance(data['output_result']['regulatory_findings'], list):
            print(f"✗ Invalid 'output_result.regulatory_findings': Must be array in {file_path.name}")
            return None

        # Validate recommendations is array
        if not isinstance(data['output_result']['recommendations'], list):
            print(f"✗ Invalid 'output_result.recommendations': Must be array in {file_path.name}")
            return None

        # Validate confidence_level is valid enum
        valid_confidence_levels = ['high', 'medium', 'low']
        if data['output_result']['confidence_level'] not in valid_confidence_levels:
            print(f"✗ Invalid 'output_result.confidence_level': Must be one of {valid_confidence_levels} in {file_path.name}")
            return None

        # =====================================================================
        # STEP 8: Validate execution_trace (must be non-empty array)
        # =====================================================================
        if not isinstance(data['execution_trace'], list):
            print(f"✗ Invalid 'execution_trace': Must be array in {file_path.name}")
            return None

        if len(data['execution_trace']) == 0:
            print(f"✗ Invalid 'execution_trace': Cannot be empty in {file_path.name}")
            return None

        # Validate each execution step
        for idx, step in enumerate(data['execution_trace']):
            if not isinstance(step, dict):
                print(f"✗ Invalid 'execution_trace[{idx}]': Must be object in {file_path.name}")
                return None

            # Validate required step fields
            required_step_fields = ['step_number', 'step_name', 'step_type', 'timestamp']
            for field in required_step_fields:
                if field not in step:
                    print(f"✗ Missing required field 'execution_trace[{idx}].{field}' in {file_path.name}")
                    return None

            # Validate step_number is positive integer
            if not isinstance(step['step_number'], int) or step['step_number'] <= 0:
                print(f"✗ Invalid 'execution_trace[{idx}].step_number': Must be positive integer in {file_path.name}")
                return None

            # Validate step_name is non-empty string
            if not isinstance(step['step_name'], str) or len(step['step_name']) == 0:
                print(f"✗ Invalid 'execution_trace[{idx}].step_name': Must be non-empty string in {file_path.name}")
                return None

            # Validate step_type is non-empty string
            if not isinstance(step['step_type'], str) or len(step['step_type']) == 0:
                print(f"✗ Invalid 'execution_trace[{idx}].step_type': Must be non-empty string in {file_path.name}")
                return None

            # Validate timestamp is non-empty string
            if not isinstance(step['timestamp'], str) or len(step['timestamp']) == 0:
                print(f"✗ Invalid 'execution_trace[{idx}].timestamp': Must be non-empty string in {file_path.name}")
                return None

            # Validate duration_ms if present
            if 'duration_ms' in step and step['duration_ms'] is not None:
                if not isinstance(step['duration_ms'], (int, float)) or step['duration_ms'] < 0:
                    print(f"✗ Invalid 'execution_trace[{idx}].duration_ms': Must be non-negative number in {file_path.name}")
                    return None

        # =====================================================================
        # STEP 9: Validate timestamps (ISO 8601 format)
        # =====================================================================
        timestamp_fields = ['created_at']
        if 'updated_at' in data:
            timestamp_fields.append('updated_at')

        for field in timestamp_fields:
            timestamp_str = data[field]
            if not isinstance(timestamp_str, str) or len(timestamp_str) == 0:
                print(f"✗ Invalid '{field}': Must be non-empty string in {file_path.name}")
                return None

            # Try parsing timestamp
            try:
                datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            except ValueError:
                print(f"✗ Invalid '{field}': Must be valid ISO 8601 timestamp in {file_path.name}")
                return None

        # =====================================================================
        # STEP 10: Validate optional boolean fields
        # =====================================================================
        if 'display' in data and data['display'] is not None:
            if not isinstance(data['display'], bool):
                print(f"✗ Invalid 'display': Must be boolean in {file_path.name}")
                return None

        if 'featured' in data and data['featured'] is not None:
            if not isinstance(data['featured'], bool):
                print(f"✗ Invalid 'featured': Must be boolean in {file_path.name}")
                return None

        # Validate display_order if present
        if 'display_order' in data and data['display_order'] is not None:
            if not isinstance(data['display_order'], int) or data['display_order'] < 0:
                print(f"✗ Invalid 'display_order': Must be non-negative integer in {file_path.name}")
                return None

        # =====================================================================
        # VALIDATION PASSED
        # =====================================================================
        return data

    except json.JSONDecodeError as e:
        print(f"✗ JSON parse error in {file_path.name}: {e}")
        return None
    except Exception as e:
        print(f"✗ Error reading {file_path.name}: {e}")
        return None


# =============================================================================
# TEXT SANITIZATION
# =============================================================================

def sanitize_text(text: str) -> str:
    """
    Sanitize text for safe PostgreSQL insertion.

    Handles:
    - Null bytes that cause PostgreSQL errors
    - Invalid UTF-8 sequences
    - Excessive whitespace

    Args:
        text: Raw text string

    Returns:
        str: Sanitized text safe for database insertion
    """
    if not isinstance(text, str):
        return str(text)

    # Remove null bytes (PostgreSQL doesn't allow them)
    text = text.replace('\x00', '')

    # Normalize whitespace (but preserve intentional newlines)
    # Remove other control characters except \n and \t
    text = ''.join(char if char in '\n\t' or not char.isspace() or char == ' ' else ' ' for char in text)

    # Ensure valid UTF-8 encoding
    text = text.encode('utf-8', errors='ignore').decode('utf-8')

    # Trim excessive whitespace
    text = text.strip()

    return text


def sanitize_json_field(data: Any) -> Any:
    """
    Recursively sanitize JSON data for PostgreSQL JSONB storage.

    Handles:
    - Text sanitization in strings
    - Recursive processing of nested objects
    - Arrays and lists
    - Preserves structure and types

    Args:
        data: JSON-serializable data (dict, list, str, int, etc.)

    Returns:
        Sanitized data structure
    """
    if isinstance(data, dict):
        return {key: sanitize_json_field(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [sanitize_json_field(item) for item in data]
    elif isinstance(data, str):
        return sanitize_text(data)
    else:
        # Numbers, booleans, None - return as-is
        return data


# =============================================================================
# IMPORT LOGIC
# =============================================================================

def import_case_study(conn, case_study_data: Dict[str, Any]) -> bool:
    """
    Import a single case study to the database.

    Handles:
    - Text sanitization for all string fields
    - JSON serialization for complex fields (JSONB)
    - Proper escaping via parameterized queries
    - Special character handling (quotes, newlines, unicode)

    Args:
        conn: Database connection
        case_study_data: Case study data from JSON

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        cursor = conn.cursor()

        # Sanitize text fields
        case_study_id = case_study_data['id']
        agent_slug = sanitize_text(case_study_data['agent_slug'])
        title = sanitize_text(case_study_data['title'])
        subtitle = sanitize_text(case_study_data.get('subtitle', '')) if case_study_data.get('subtitle') else None

        # Sanitize JSON fields (recursive)
        input_parameters = sanitize_json_field(case_study_data['input_parameters'])
        output_result = sanitize_json_field(case_study_data['output_result'])

        # Boolean fields
        display = case_study_data.get('display', True)
        featured = case_study_data.get('featured', False)
        display_order = case_study_data.get('display_order')

        # Timestamps
        created_at = case_study_data['created_at']
        updated_at = case_study_data.get('updated_at', created_at)

        # Use parameterized query to prevent SQL injection
        # PostgreSQL will handle JSON serialization and escaping
        insert_query = """
            INSERT INTO case_studies (
                id, agent_slug, title, subtitle,
                input_parameters, output_result,
                display, featured, display_order,
                created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s,
                %s::jsonb, %s::jsonb,
                %s, %s, %s,
                %s::timestamp, %s::timestamp
            )
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                subtitle = EXCLUDED.subtitle,
                input_parameters = EXCLUDED.input_parameters,
                output_result = EXCLUDED.output_result,
                display = EXCLUDED.display,
                featured = EXCLUDED.featured,
                display_order = EXCLUDED.display_order,
                updated_at = EXCLUDED.updated_at
        """

        # Convert Python dicts to JSON strings for JSONB
        cursor.execute(insert_query, (
            case_study_id,
            agent_slug,
            title,
            subtitle,
            json.dumps(input_parameters, ensure_ascii=False),  # Preserve unicode
            json.dumps(output_result, ensure_ascii=False),
            display,
            featured,
            display_order,
            created_at,
            updated_at
        ))

        cursor.close()
        print(f"  ✓ Case study inserted/updated: {case_study_id}")
        return True

    except psycopg2.Error as e:
        print(f"  ✗ Database error importing case study: {e}")
        return False
    except Exception as e:
        print(f"  ✗ Error importing case study: {e}")
        return False


def import_execution_steps(conn, case_study_id: str, execution_trace: List[Dict[str, Any]]) -> bool:
    """
    Import execution steps for a case study.

    Handles:
    - Batch insertion for performance
    - Text sanitization for all string fields
    - JSON sanitization for details field
    - Proper null handling for optional fields

    Args:
        conn: Database connection
        case_study_id: Case study ID
        execution_trace: List of execution steps

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        cursor = conn.cursor()

        # Delete existing execution steps for this case study (for re-imports)
        delete_query = "DELETE FROM execution_steps WHERE case_study_id = %s"
        cursor.execute(delete_query, (case_study_id,))

        # Prepare batch insert
        insert_query = """
            INSERT INTO execution_steps (
                case_study_id, step_number, step_name, step_type,
                input_summary, output_summary, details,
                duration_ms, timestamp
            ) VALUES (
                %s, %s, %s, %s,
                %s, %s, %s::jsonb,
                %s, %s::timestamp
            )
        """

        # Prepare data for batch insert
        rows = []
        for step in execution_trace:
            # Sanitize text fields
            step_name = sanitize_text(step['step_name'])
            step_type = sanitize_text(step['step_type'])
            input_summary = sanitize_text(step.get('input_summary', '')) if step.get('input_summary') else None
            output_summary = sanitize_text(step.get('output_summary', '')) if step.get('output_summary') else None

            # Sanitize JSON details field (recursive)
            details = sanitize_json_field(step.get('details')) if step.get('details') else None
            details_json = json.dumps(details, ensure_ascii=False) if details else None

            rows.append((
                case_study_id,
                step['step_number'],
                step_name,
                step_type,
                input_summary,
                output_summary,
                details_json,
                step.get('duration_ms'),
                step['timestamp']
            ))

        # Execute batch insert
        cursor.executemany(insert_query, rows)
        cursor.close()

        print(f"  ✓ Inserted {len(rows)} execution steps")
        return True

    except psycopg2.Error as e:
        print(f"  ✗ Database error importing execution steps: {e}")
        return False
    except Exception as e:
        print(f"  ✗ Error importing execution steps: {e}")
        return False


# =============================================================================
# BATCH IMPORT
# =============================================================================

def import_single_file(db: DatabaseConnection, file_path: Path) -> bool:
    """
    Import a single case study JSON file.

    Args:
        db: Database connection manager
        file_path: Path to JSON file

    Returns:
        bool: True if successful, False otherwise
    """
    print(f"\nImporting: {file_path.name}")

    # Validate JSON
    case_study_data = validate_json_file(file_path)
    if case_study_data is None:
        return False

    print(f"  ✓ JSON validation passed")
    print(f"  Case Study ID: {case_study_data['id']}")
    print(f"  Title: {case_study_data['title']}")
    print(f"  Execution Steps: {len(case_study_data['execution_trace'])}")

    # Get database connection with error handling
    conn = None
    try:
        conn = db.get_connection()
    except Exception as e:
        print(f"  ✗ Failed to get database connection: {e}")
        return False

    has_error = False
    try:
        # Import case study (Story 4.2)
        if not import_case_study(conn, case_study_data):
            has_error = True
            return False

        # Import execution steps (Story 4.3)
        if not import_execution_steps(conn, case_study_data['id'], case_study_data['execution_trace']):
            has_error = True
            return False

        # Commit transaction
        conn.commit()
        print(f"  ✓ Import successful")
        return True

    except psycopg2.OperationalError as e:
        print(f"  ✗ Database connection error during import: {e}")
        has_error = True
        try:
            conn.rollback()
        except:
            pass  # Connection may already be closed
        return False

    except psycopg2.Error as e:
        print(f"  ✗ Database error during import: {e}")
        has_error = True
        try:
            conn.rollback()
        except:
            pass
        return False

    except Exception as e:
        print(f"  ✗ Unexpected error during import: {e}")
        has_error = True
        try:
            conn.rollback()
        except:
            pass
        return False

    finally:
        if conn:
            db.return_connection(conn, error=has_error)


def import_directory(db: DatabaseConnection, directory_path: Path, continue_on_error: bool = True) -> tuple[int, int, Dict[str, Any]]:
    """
    Import all JSON files from a directory with batch processing.

    Features:
    - Automatic file discovery with pattern matching
    - Pre-validation before import
    - Progress tracking with detailed reporting
    - Continue-on-error mode for resilient batch processing
    - Comprehensive statistics and summary

    Args:
        db: Database connection manager
        directory_path: Path to directory containing JSON files
        continue_on_error: If True, continues importing remaining files after errors (default: True)

    Returns:
        tuple: (successful_count, failed_count, statistics_dict)
    """
    # =========================================================================
    # STEP 1: File Discovery
    # =========================================================================
    json_files = sorted(directory_path.glob('case_study_*.json'))

    if not json_files:
        print(f"✗ No case study JSON files found in {directory_path}")
        print(f"  Expected pattern: case_study_*.json")
        return (0, 0, {})

    print(f"\nFound {len(json_files)} case study files")
    print("=" * 70)

    # =========================================================================
    # STEP 2: Pre-validation Phase (fast validation without DB operations)
    # =========================================================================
    print("\nPhase 1: Pre-validating files...")
    print("-" * 70)

    valid_files = []
    invalid_files = []
    validation_errors = {}

    for idx, file_path in enumerate(json_files, 1):
        print(f"[{idx}/{len(json_files)}] Validating {file_path.name}...", end=" ")

        case_study_data = validate_json_file(file_path)
        if case_study_data is not None:
            valid_files.append((file_path, case_study_data))
            print("✓")
        else:
            invalid_files.append(file_path)
            validation_errors[file_path.name] = "Validation failed (see errors above)"
            print("✗")

    print("-" * 70)
    print(f"Validation complete: {len(valid_files)} valid, {len(invalid_files)} invalid")

    if len(invalid_files) > 0:
        print(f"\n⚠ Invalid files (will be skipped):")
        for file_path in invalid_files:
            print(f"  - {file_path.name}")

    if len(valid_files) == 0:
        print(f"\n✗ No valid files to import")
        return (0, len(invalid_files), {
            'total_files': len(json_files),
            'valid_files': 0,
            'invalid_files': len(invalid_files),
            'successful_imports': 0,
            'failed_imports': 0,
            'validation_errors': validation_errors
        })

    # =========================================================================
    # STEP 3: Database Import Phase
    # =========================================================================
    print(f"\nPhase 2: Importing {len(valid_files)} validated files to database...")
    print("=" * 70)

    successful = 0
    failed = 0
    import_errors = {}
    imported_ids = []
    total_execution_steps = 0
    start_time = datetime.now()

    for idx, (file_path, case_study_data) in enumerate(valid_files, 1):
        print(f"\n[{idx}/{len(valid_files)}] Importing {file_path.name}")
        print(f"  Case Study ID: {case_study_data['id']}")
        print(f"  Title: {case_study_data['title']}")
        print(f"  Execution Steps: {len(case_study_data['execution_trace'])}")

        # Get database connection with error handling
        conn = None
        has_error = False

        try:
            conn = db.get_connection()
        except Exception as e:
            print(f"  ✗ Failed to get database connection: {e}")
            failed += 1
            import_errors[file_path.name] = f"Connection error: {str(e)}"
            if not continue_on_error:
                break
            continue

        try:
            # Import case study
            if not import_case_study(conn, case_study_data):
                failed += 1
                has_error = True
                import_errors[file_path.name] = "Case study import failed"
                if not continue_on_error:
                    break
                continue

            # Import execution steps
            if not import_execution_steps(conn, case_study_data['id'], case_study_data['execution_trace']):
                failed += 1
                has_error = True
                import_errors[file_path.name] = "Execution steps import failed"
                try:
                    conn.rollback()
                except:
                    pass
                if not continue_on_error:
                    break
                continue

            # Commit transaction
            conn.commit()
            print(f"  ✓ Import successful")
            successful += 1
            imported_ids.append(case_study_data['id'])
            total_execution_steps += len(case_study_data['execution_trace'])

        except psycopg2.OperationalError as e:
            print(f"  ✗ Database connection error: {e}")
            has_error = True
            failed += 1
            import_errors[file_path.name] = f"Connection error: {str(e)}"
            try:
                conn.rollback()
            except:
                pass
            if not continue_on_error:
                break

        except psycopg2.Error as e:
            print(f"  ✗ Database error: {e}")
            has_error = True
            failed += 1
            import_errors[file_path.name] = f"Database error: {str(e)}"
            try:
                conn.rollback()
            except:
                pass
            if not continue_on_error:
                break

        except Exception as e:
            print(f"  ✗ Unexpected error: {e}")
            has_error = True
            failed += 1
            import_errors[file_path.name] = f"Unexpected error: {str(e)}"
            try:
                conn.rollback()
            except:
                pass
            if not continue_on_error:
                break

        finally:
            if conn:
                db.return_connection(conn, error=has_error)

    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()

    # =========================================================================
    # STEP 4: Summary Statistics
    # =========================================================================
    statistics = {
        'total_files': len(json_files),
        'valid_files': len(valid_files),
        'invalid_files': len(invalid_files),
        'successful_imports': successful,
        'failed_imports': failed,
        'imported_case_study_ids': imported_ids,
        'total_execution_steps_imported': total_execution_steps,
        'duration_seconds': duration,
        'validation_errors': validation_errors,
        'import_errors': import_errors
    }

    return (successful, failed + len(invalid_files), statistics)


# =============================================================================
# COMMAND-LINE INTERFACE
# =============================================================================

def parse_arguments():
    """
    Parse command-line arguments.

    Returns:
        argparse.Namespace: Parsed arguments
    """
    parser = argparse.ArgumentParser(
        description='Import case study JSON files to PostgreSQL database',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Import single file
  python scripts/import_case_studies.py output/case_study_20260210_001103.json

  # Import all files from directory
  python scripts/import_case_studies.py output/

  # Use custom database URL
  export DATABASE_URL="postgresql://user:password@host:port/database"
  python scripts/import_case_studies.py output/
        """
    )

    parser.add_argument(
        'path',
        type=str,
        help='Path to JSON file or directory containing JSON files'
    )

    parser.add_argument(
        '--database-url',
        type=str,
        default=None,
        help='PostgreSQL connection string (default: from DATABASE_URL env var)'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Validate files without importing to database'
    )

    return parser.parse_args()


# =============================================================================
# MAIN EXECUTION
# =============================================================================

def main():
    """Main execution function."""
    # Parse arguments
    args = parse_arguments()

    # Print banner
    print("=" * 70)
    print("CASE STUDY DATABASE IMPORT")
    print("=" * 70)
    print()

    # Validate path
    path = Path(args.path)
    if not path.exists():
        print(f"✗ Path does not exist: {path}")
        return 1

    # Dry run mode (can run without database)
    if args.dry_run:
        print("DRY RUN MODE: Validating files only (no database operations)")
        print()

        if path.is_file():
            data = validate_json_file(path)
            return 0 if data else 1
        else:
            json_files = sorted(path.glob('case_study_*.json'))
            valid = 0
            invalid = 0
            for file_path in json_files:
                if validate_json_file(file_path):
                    valid += 1
                else:
                    invalid += 1
            print(f"\nValidation complete: {valid} valid, {invalid} invalid")
            return 0 if invalid == 0 else 1

    # Get database connection string
    database_url = args.database_url or os.getenv('DATABASE_URL')
    if not database_url:
        print("✗ DATABASE_URL not set. Please provide --database-url or set DATABASE_URL environment variable.")
        return 1

    # Connect to database
    db = DatabaseConnection(database_url)
    try:
        db.connect()
        print()

        # Import files
        if path.is_file():
            # Single file import
            success = import_single_file(db, path)
            print()
            print("=" * 70)
            print(f"Result: {'SUCCESS' if success else 'FAILED'}")
            print("=" * 70)
            return 0 if success else 1
        else:
            # Directory batch import with statistics
            successful, failed, statistics = import_directory(db, path)

            # Display detailed summary
            print()
            print("=" * 70)
            print("BATCH IMPORT SUMMARY")
            print("=" * 70)
            print()
            print(f"Total Files Found:       {statistics.get('total_files', 0)}")
            print(f"Valid Files:             {statistics.get('valid_files', 0)}")
            print(f"Invalid Files:           {statistics.get('invalid_files', 0)}")
            print()
            print(f"Successful Imports:      {statistics.get('successful_imports', 0)}")
            print(f"Failed Imports:          {statistics.get('failed_imports', 0)}")
            print(f"Total Execution Steps:   {statistics.get('total_execution_steps_imported', 0)}")
            print()
            print(f"Duration:                {statistics.get('duration_seconds', 0):.2f}s")

            if statistics.get('imported_case_study_ids'):
                print()
                print(f"Imported Case Study IDs:")
                for case_id in statistics['imported_case_study_ids']:
                    print(f"  - {case_id}")

            if statistics.get('validation_errors'):
                print()
                print(f"⚠ Validation Errors:")
                for filename, error in statistics['validation_errors'].items():
                    print(f"  - {filename}: {error}")

            if statistics.get('import_errors'):
                print()
                print(f"⚠ Import Errors:")
                for filename, error in statistics['import_errors'].items():
                    print(f"  - {filename}: {error}")

            print()
            print("=" * 70)
            if failed == 0:
                print("✓ ALL IMPORTS SUCCESSFUL")
            elif successful > 0:
                print(f"⚠ PARTIAL SUCCESS: {successful} successful, {failed} failed")
            else:
                print("✗ ALL IMPORTS FAILED")
            print("=" * 70)

            return 0 if failed == 0 else 1

    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
