#!/usr/bin/env python3
"""
JSON Validation Script for AI Agents Portfolio

This script validates JSON case study files against Pydantic schemas to ensure
type consistency before database import.

Usage:
    python scripts/validate-json.py <json_file_path>
    python scripts/validate-json.py agents/fraud-trends/output/case_study_001.json

Exit Codes:
    0 - Validation successful
    1 - Validation failed (schema mismatch or file error)

The script validates:
- File exists and is readable
- JSON is well-formed
- output_result field matches FraudTrendsOutput Pydantic schema
- All required fields are present
- Field types match exactly
- Literal values are valid (e.g., severity must be "low"|"medium"|"high"|"critical")

See: docs/SCHEMA_MAPPING.md for schema details
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, Any

# Add fraud-trends agent to Python path for imports
project_root = Path(__file__).parent.parent
fraud_trends_path = project_root / "agents" / "fraud-trends"
sys.path.insert(0, str(fraud_trends_path))

try:
    from utils.models import (
        FraudTrendsOutput,
        CaseStudy,
        FraudTrendsInput
    )
    from pydantic import ValidationError
except ImportError as e:
    print(f"❌ ERROR: Failed to import Pydantic models: {e}")
    print("\nMake sure you're running from the project root and dependencies are installed:")
    print("  cd /path/to/AIAgents")
    print("  pip install -r agents/fraud-trends/requirements.txt")
    sys.exit(1)


def parse_arguments() -> argparse.Namespace:
    """
    Parse command-line arguments.

    Returns:
        argparse.Namespace: Parsed arguments with json_file path
    """
    parser = argparse.ArgumentParser(
        description="Validate JSON case study files against Pydantic schemas",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/validate-json.py agents/fraud-trends/output/case_study_001.json
  python scripts/validate-json.py agents/fraud-trends/output/*.json

Note: This script validates the output_result field against FraudTrendsOutput schema.
      It also validates the complete CaseStudy structure if validating a full case study JSON.
        """
    )

    parser.add_argument(
        "json_file",
        type=str,
        help="Path to JSON file to validate"
    )

    parser.add_argument(
        "--strict",
        action="store_true",
        help="Enable strict validation (validates entire CaseStudy structure, not just output_result)"
    )

    parser.add_argument(
        "--quiet",
        "-q",
        action="store_true",
        help="Suppress success messages (only show errors)"
    )

    return parser.parse_args()


def load_json_file(file_path: str) -> Dict[str, Any]:
    """
    Load and parse JSON file.

    Args:
        file_path: Path to JSON file

    Returns:
        Dict containing parsed JSON data

    Raises:
        FileNotFoundError: If file doesn't exist
        json.JSONDecodeError: If JSON is malformed
    """
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    if not path.is_file():
        raise ValueError(f"Path is not a file: {file_path}")

    with open(path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            raise json.JSONDecodeError(
                f"Invalid JSON in {file_path}: {e.msg}",
                e.doc,
                e.pos
            )

    return data


def validate_output_result(data: Dict[str, Any], file_path: str) -> bool:
    """
    Validate the output_result field against FraudTrendsOutput schema.

    Args:
        data: Parsed JSON data
        file_path: Path to JSON file (for error messages)

    Returns:
        True if validation succeeds

    Raises:
        ValidationError: If validation fails
    """
    if "output_result" not in data:
        raise ValueError(
            f"Missing required field 'output_result' in {file_path}\n"
            "Expected structure: { ..., 'output_result': {{ FraudTrendsOutput }}, ... }"
        )

    output_result = data["output_result"]

    # Validate against FraudTrendsOutput schema
    try:
        validated_output = FraudTrendsOutput(**output_result)
        return True
    except ValidationError as e:
        # Re-raise with context
        raise ValidationError.from_exception_data(
            title="FraudTrendsOutput validation failed",
            line_errors=e.errors()
        )


def validate_case_study(data: Dict[str, Any], file_path: str) -> bool:
    """
    Validate the entire case study structure against CaseStudy schema.

    Args:
        data: Parsed JSON data
        file_path: Path to JSON file (for error messages)

    Returns:
        True if validation succeeds

    Raises:
        ValidationError: If validation fails
    """
    try:
        # Validate complete CaseStudy structure
        validated_case_study = CaseStudy(**data)
        return True
    except ValidationError as e:
        # Re-raise with context
        raise ValidationError.from_exception_data(
            title="CaseStudy validation failed",
            line_errors=e.errors()
        )


def format_validation_error(error: ValidationError) -> str:
    """
    Format Pydantic ValidationError for human-readable output.

    Args:
        error: Pydantic ValidationError

    Returns:
        Formatted error message string
    """
    error_lines = ["Validation errors found:\n"]

    for err in error.errors():
        location = " -> ".join(str(loc) for loc in err["loc"])
        error_type = err["type"]
        message = err["msg"]

        error_lines.append(f"  Field: {location}")
        error_lines.append(f"  Error: {message}")
        error_lines.append(f"  Type:  {error_type}")

        # Add input value if available
        if "input" in err:
            input_val = err["input"]
            if len(str(input_val)) > 100:
                input_val = str(input_val)[:100] + "..."
            error_lines.append(f"  Input: {input_val}")

        error_lines.append("")  # Blank line between errors

    return "\n".join(error_lines)


def main() -> int:
    """
    Main entry point for validation script.

    Returns:
        int: Exit code (0 for success, 1 for failure)
    """
    args = parse_arguments()

    try:
        # Load JSON file
        if not args.quiet:
            print(f"📂 Loading JSON file: {args.json_file}")

        data = load_json_file(args.json_file)

        if not args.quiet:
            print("✅ JSON file loaded successfully")

        # Perform validation
        if args.strict:
            # Validate entire CaseStudy structure
            if not args.quiet:
                print("🔍 Validating complete CaseStudy structure...")
            validate_case_study(data, args.json_file)
        else:
            # Validate only output_result field (default)
            if not args.quiet:
                print("🔍 Validating output_result field against FraudTrendsOutput schema...")
            validate_output_result(data, args.json_file)

        # Success!
        if not args.quiet:
            print(f"✅ {Path(args.json_file).name} validates against schema")
            print("\n✅ Validation successful - file is ready for database import")

        return 0

    except FileNotFoundError as e:
        print(f"❌ ERROR: {e}")
        return 1

    except json.JSONDecodeError as e:
        print(f"❌ ERROR: Invalid JSON format")
        print(f"   {e}")
        return 1

    except ValidationError as e:
        print(f"❌ VALIDATION FAILED: {Path(args.json_file).name}")
        print()
        print(format_validation_error(e))
        print("Fix the errors above before attempting database import.")
        print("See docs/SCHEMA_MAPPING.md for schema reference.")
        return 1

    except ValueError as e:
        print(f"❌ ERROR: {e}")
        return 1

    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
