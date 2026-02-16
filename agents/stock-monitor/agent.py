#!/usr/bin/env python3
"""
Stock Monitor Agent - Event Detection & Alert
Agent slug: stock-monitor
Agent color: Green (#22c55e)
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

from utils.models import StockMonitorInput, StockMonitorOutput
from utils.steps import run_stock_monitor_workflow
from utils.constants import AGENT_SLUG


def generate_json_output(
    monitor_input: StockMonitorInput,
    output: StockMonitorOutput,
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
    watchlist_str = ", ".join(monitor_input.watchlist[:4])
    if len(monitor_input.watchlist) > 4:
        watchlist_str += f" +{len(monitor_input.watchlist) - 4} more"
    title = f"Stock Monitor - {watchlist_str}"

    # Create subtitle
    event_types_str = ", ".join(monitor_input.event_types[:3])
    subtitle = f"{monitor_input.time_period} scan, {event_types_str}, {monitor_input.alert_threshold} alerts"

    # Create case study structure
    case_study = {
        "id": case_study_id,
        "agent_slug": AGENT_SLUG,
        "title": title,
        "subtitle": subtitle,
        "input_parameters": monitor_input.model_dump(),
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
        description='Stock Monitor Agent - Event Detection & Alert'
    )
    parser.add_argument(
        '--watchlist',
        nargs='+',
        required=True,
        help='Stock tickers to monitor (e.g., AAPL MSFT GOOGL)'
    )
    parser.add_argument(
        '--period',
        default='24h',
        choices=['24h', '7d', '30d'],
        help='Time period to monitor (default: 24h)'
    )
    parser.add_argument(
        '--events',
        nargs='+',
        default=['earnings', 'news', 'filings', 'analyst_ratings', 'price_movements'],
        help='Event types to monitor (default: all)'
    )
    parser.add_argument(
        '--threshold',
        default='medium',
        choices=['low', 'medium', 'high', 'critical'],
        help='Alert threshold (default: medium)'
    )

    args = parser.parse_args()

    # Load environment variables after parsing args (so --help works without .env)
    load_dotenv()

    # Validate required environment variables
    required_vars = ['ANTHROPIC_API_KEY', 'TWELVE_DATA_API_KEY', 'TAVILY_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        print(f"Error: Missing required environment variables: {', '.join(missing_vars)}")
        print("Please configure .env file based on .env.example")
        sys.exit(1)

    # Create input model
    try:
        monitor_input = StockMonitorInput(
            watchlist=args.watchlist,
            time_period=args.period,
            event_types=args.events,
            alert_threshold=args.threshold
        )
    except Exception as e:
        print(f"Error: Invalid input parameters: {e}")
        sys.exit(1)

    # Run workflow
    try:
        print(f"\n🔍 Starting stock monitor for: {', '.join(args.watchlist)}")
        print(f"   Period: {args.period}")
        print(f"   Events: {', '.join(args.events)}")
        print(f"   Threshold: {args.threshold}\n")

        output, execution_trace = run_stock_monitor_workflow(monitor_input)

        # Generate JSON output
        json_path = generate_json_output(monitor_input, output, execution_trace)

        print(f"\n🎉 Stock Monitor completed successfully!")
        print(f"   Total Alerts: {len(output.alerts)}")
        print(f"   Highest Severity: {output.watchlist_overview.highest_severity_alert}")
        print(f"   Output: {json_path}")

    except Exception as e:
        print(f"\n❌ Stock Monitor failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
