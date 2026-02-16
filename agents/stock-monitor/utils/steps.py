"""
Stock Monitor Agent Workflow Steps

This module implements the 6-step workflow for stock event detection and alerting.
"""

import os
import json
import time
import requests
from datetime import datetime, timedelta
from typing import Tuple, List, Dict, Any
from anthropic import Anthropic

from .models import (
    StockMonitorInput,
    StockMonitorOutput,
    StockAlert,
    WatchlistOverview
)
from .constants import MODEL_NAME, MAX_TOKENS, TEMPERATURE


def create_execution_step(
    step_number: int,
    step_name: str,
    step_type: str,
    details: Dict[str, Any],
    duration_ms: int
) -> Dict[str, Any]:
    """Create a standardized execution trace step."""
    return {
        "step_number": step_number,
        "step_name": step_name,
        "step_type": step_type,
        "details": details,
        "duration_ms": duration_ms,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


def step_1_initialize_scan(
    monitor_input: StockMonitorInput
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Step 1: Initialize Scan
    Fetch current stock prices and basic company info from Twelve Data API.
    """
    start_time = time.time()

    twelve_data_key = os.getenv('TWELVE_DATA_API_KEY')
    if not twelve_data_key:
        raise ValueError("TWELVE_DATA_API_KEY not set")

    stock_data = {}

    for ticker in monitor_input.watchlist:
        try:
            # Get real-time quote from Twelve Data
            quote_url = f"https://api.twelvedata.com/quote?symbol={ticker}&apikey={twelve_data_key}"
            quote_resp = requests.get(quote_url, timeout=10)
            quote_resp.raise_for_status()
            quote = quote_resp.json()

            # Check for API error
            if 'code' in quote and quote['code'] != 200:
                raise ValueError(quote.get('message', 'API error'))

            # Extract price data
            current_price = float(quote.get('close', 0))
            previous_close = float(quote.get('previous_close', current_price))
            change = current_price - previous_close if previous_close else 0
            percent_change = (change / previous_close * 100) if previous_close else 0

            stock_data[ticker] = {
                "current_price": current_price,
                "change": change,
                "percent_change": percent_change,
                "high": float(quote.get('high', 0)),
                "low": float(quote.get('low', 0)),
                "open": float(quote.get('open', 0)),
                "previous_close": previous_close,
                "company_name": quote.get('name', ticker),
                "exchange": quote.get('exchange', 'Unknown'),
                "currency": quote.get('currency', 'USD')
            }

            # Rate limiting - Twelve Data free tier: 8 API calls/minute
            time.sleep(8)

        except Exception as e:
            print(f"Warning: Failed to fetch data for {ticker}: {e}")
            stock_data[ticker] = {
                "current_price": 0,
                "change": 0,
                "percent_change": 0,
                "company_name": ticker,
                "error": str(e)
            }

    duration_ms = int((time.time() - start_time) * 1000)

    details = {
        "stocks_scanned": len(monitor_input.watchlist),
        "successful_fetches": sum(1 for data in stock_data.values() if 'error' not in data),
        "stock_summary": {
            ticker: {
                "price": data.get('current_price'),
                "change_percent": data.get('percent_change'),
                "company": data.get('company_name')
            }
            for ticker, data in stock_data.items()
        }
    }

    return stock_data, details, duration_ms


def step_2_search_news(
    monitor_input: StockMonitorInput,
    stock_data: Dict[str, Any]
) -> Tuple[Dict[str, List[Dict]], Dict[str, Any]]:
    """
    Step 2: Search News
    Use Tavily API to find recent news for each ticker.
    """
    start_time = time.time()

    tavily_key = os.getenv('TAVILY_API_KEY')
    if not tavily_key:
        raise ValueError("TAVILY_API_KEY not set")

    news_data = {}

    # Calculate time range based on period
    if monitor_input.time_period == "24h":
        max_results = 3
        days_back = 1
    elif monitor_input.time_period == "7d":
        max_results = 5
        days_back = 7
    else:  # 30d
        max_results = 7
        days_back = 30

    for ticker in monitor_input.watchlist:
        try:
            company_name = stock_data.get(ticker, {}).get('company_name', ticker)
            query = f"{ticker} {company_name} stock news"

            # Tavily search
            response = requests.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": tavily_key,
                    "query": query,
                    "max_results": max_results,
                    "days": days_back
                },
                timeout=15
            )
            response.raise_for_status()
            result = response.json()

            news_data[ticker] = result.get('results', [])

            # Rate limiting
            time.sleep(0.1)

        except Exception as e:
            print(f"Warning: Failed to fetch news for {ticker}: {e}")
            news_data[ticker] = []

    duration_ms = int((time.time() - start_time) * 1000)

    total_articles = sum(len(articles) for articles in news_data.values())

    details = {
        "tickers_searched": len(monitor_input.watchlist),
        "total_articles_found": total_articles,
        "articles_per_ticker": {ticker: len(articles) for ticker, articles in news_data.items()}
    }

    return news_data, details, duration_ms


def step_3_search_filings(
    monitor_input: StockMonitorInput
) -> Tuple[Dict[str, List[Dict]], Dict[str, Any]]:
    """
    Step 3: Search Filings
    Check SEC EDGAR for recent regulatory filings (10-K, 10-Q, 8-K).
    """
    start_time = time.time()

    filings_data = {}

    # SEC EDGAR requires a User-Agent header
    headers = {
        'User-Agent': 'Stock Monitor Agent contact@example.com'
    }

    for ticker in monitor_input.watchlist:
        try:
            # SEC EDGAR company search
            # Note: This is a simplified implementation
            # Production should use proper CIK lookups

            search_url = f"https://www.sec.gov/cgi-bin/browse-edgar"
            params = {
                'action': 'getcompany',
                'CIK': ticker,
                'type': '',
                'dateb': '',
                'owner': 'exclude',
                'count': 10,
                'output': 'atom'
            }

            response = requests.get(search_url, params=params, headers=headers, timeout=15)

            # For MVP, create placeholder filings data
            # Full implementation would parse EDGAR XML/Atom feed
            filings_data[ticker] = []

            # Rate limiting for SEC (be respectful!)
            time.sleep(0.5)

        except Exception as e:
            print(f"Warning: Failed to fetch filings for {ticker}: {e}")
            filings_data[ticker] = []

    duration_ms = int((time.time() - start_time) * 1000)

    total_filings = sum(len(filings) for filings in filings_data.values())

    details = {
        "tickers_searched": len(monitor_input.watchlist),
        "total_filings_found": total_filings,
        "note": "SEC EDGAR filing search - simplified MVP implementation"
    }

    return filings_data, details, duration_ms


def step_4_classify_events(
    monitor_input: StockMonitorInput,
    stock_data: Dict[str, Any],
    news_data: Dict[str, List[Dict]],
    filings_data: Dict[str, List[Dict]]
) -> Tuple[List[Dict], Dict[str, Any]]:
    """
    Step 4: Classify Events
    Use LLM to classify events by type and severity.
    """
    start_time = time.time()

    client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

    # Prepare event data for classification
    events_by_ticker = {}

    for ticker in monitor_input.watchlist:
        stock_info = stock_data.get(ticker, {})
        news_items = news_data.get(ticker, [])

        events_by_ticker[ticker] = {
            "ticker": ticker,
            "company_name": stock_info.get('company_name', ticker),
            "price_data": {
                "current_price": stock_info.get('current_price'),
                "change_percent": stock_info.get('percent_change'),
                "high": stock_info.get('high'),
                "low": stock_info.get('low')
            },
            "news_headlines": [
                {
                    "title": item.get('title', ''),
                    "url": item.get('url', ''),
                    "published_date": item.get('published_date', '')
                }
                for item in news_items[:5]
            ]
        }

    # Build LLM prompt
    prompt = f"""You are a financial analyst classifying stock market events.

Analyze the following stock data and news for {len(monitor_input.watchlist)} stocks:

{json.dumps(events_by_ticker, indent=2)}

For each ticker, classify any significant events by:
1. Event Type: earnings, news, filings, analyst_ratings, or price_movements
2. Severity: low, medium, high, or critical

Consider:
- Price movements >5% as significant
- Recent news mentioning earnings, acquisitions, regulatory issues
- Alert threshold: {monitor_input.alert_threshold}

Return a JSON array of events. Each event should have:
- ticker: stock symbol
- company_name: company name
- event_type: one of the event types above
- severity: one of low/medium/high/critical
- headline: brief event description
- reasoning: why this event is significant

Only include events that meet or exceed the "{monitor_input.alert_threshold}" severity threshold.

Return ONLY valid JSON array, no markdown formatting."""

    try:
        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = response.content[0].text.strip()

        # Extract JSON from response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        classified_events = json.loads(response_text, strict=False)

        if not isinstance(classified_events, list):
            classified_events = []

    except Exception as e:
        print(f"Warning: Event classification failed: {e}")
        classified_events = []

    duration_ms = int((time.time() - start_time) * 1000)

    details = {
        "total_events_classified": len(classified_events),
        "events_by_severity": {},
        "events_by_type": {}
    }

    # Count by severity and type
    for event in classified_events:
        severity = event.get('severity', 'unknown')
        event_type = event.get('event_type', 'unknown')
        details['events_by_severity'][severity] = details['events_by_severity'].get(severity, 0) + 1
        details['events_by_type'][event_type] = details['events_by_type'].get(event_type, 0) + 1

    return classified_events, details, duration_ms


def step_5_assess_impact(
    classified_events: List[Dict],
    stock_data: Dict[str, Any]
) -> Tuple[List[Dict], Dict[str, Any]]:
    """
    Step 5: Assess Impact
    Analyze potential impact on stock price and investor decisions.
    """
    start_time = time.time()

    client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

    if not classified_events:
        duration_ms = int((time.time() - start_time) * 1000)
        return [], {"note": "No events to assess"}, duration_ms

    # Build impact analysis prompt
    prompt = f"""You are a financial analyst assessing the impact of market events.

For each of these classified events, analyze the potential impact:

{json.dumps(classified_events, indent=2)}

Stock price context:
{json.dumps({ticker: {"current_price": data.get("current_price"), "change_percent": data.get("percent_change")} for ticker, data in stock_data.items()}, indent=2)}

For each event, add:
- impact_analysis: detailed analysis of potential stock price impact (2-3 sentences)
- action_suggested: recommended action for investors (e.g., "Hold position and monitor", "Consider profit taking", etc.)

Return the same JSON array with these two fields added to each event.
Return ONLY valid JSON array, no markdown formatting."""

    try:
        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = response.content[0].text.strip()

        # Extract JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        assessed_events = json.loads(response_text, strict=False)

        if not isinstance(assessed_events, list):
            assessed_events = classified_events

    except Exception as e:
        print(f"Warning: Impact assessment failed: {e}")
        assessed_events = classified_events

    duration_ms = int((time.time() - start_time) * 1000)

    details = {
        "events_assessed": len(assessed_events),
        "assessment_complete": all('impact_analysis' in evt for evt in assessed_events)
    }

    return assessed_events, details, duration_ms


def step_6_generate_alerts(
    monitor_input: StockMonitorInput,
    assessed_events: List[Dict],
    stock_data: Dict[str, Any]
) -> Tuple[StockMonitorOutput, Dict[str, Any]]:
    """
    Step 6: Generate Alerts
    Create prioritized alert list with action recommendations.
    """
    start_time = time.time()

    client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

    # Build final synthesis prompt
    prompt = f"""You are generating a stock monitoring report.

Monitored Watchlist: {', '.join(monitor_input.watchlist)}
Time Period: {monitor_input.time_period}
Alert Threshold: {monitor_input.alert_threshold}

Assessed Events:
{json.dumps(assessed_events, indent=2)}

Generate:
1. executive_summary: 2-3 sentence overview of key findings
2. market_context: brief description of overall market conditions affecting these stocks
3. recommendations: 3-5 high-level portfolio management recommendations

Return JSON with these three fields.
Return ONLY valid JSON object, no markdown formatting."""

    try:
        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=2000,
            temperature=TEMPERATURE,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = response.content[0].text.strip()

        # Extract JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        synthesis = json.loads(response_text, strict=False)

    except Exception as e:
        print(f"Warning: Alert synthesis failed: {e}")
        synthesis = {
            "executive_summary": f"Monitored {len(monitor_input.watchlist)} stocks with {len(assessed_events)} alerts generated.",
            "market_context": "Unable to generate market context.",
            "recommendations": ["Review individual alerts for detailed analysis."]
        }

    # Create StockAlert objects
    alerts = []
    for event in assessed_events:
        try:
            alert = StockAlert(
                ticker=event.get('ticker', 'UNKNOWN'),
                company_name=event.get('company_name', event.get('ticker', 'Unknown Company')),
                event_type=event.get('event_type', 'unknown'),
                severity=event.get('severity', 'medium'),
                headline=event.get('headline', 'No headline'),
                description=event.get('reasoning', 'No description available'),
                source="Finnhub + Tavily News",
                timestamp=datetime.utcnow().isoformat() + "Z",
                impact_analysis=event.get('impact_analysis', 'Impact analysis pending'),
                action_suggested=event.get('action_suggested', 'Monitor situation')
            )
            alerts.append(alert)
        except Exception as e:
            print(f"Warning: Failed to create alert: {e}")
            continue

    # Sort alerts by severity (critical > high > medium > low)
    severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
    alerts.sort(key=lambda a: severity_order.get(a.severity, 4))

    # Create watchlist overview
    event_breakdown = {}
    for alert in alerts:
        event_breakdown[alert.event_type] = event_breakdown.get(alert.event_type, 0) + 1

    highest_severity = alerts[0].severity if alerts else "none"

    overview = WatchlistOverview(
        total_stocks_monitored=len(monitor_input.watchlist),
        alerts_triggered=len(alerts),
        event_breakdown=event_breakdown,
        highest_severity_alert=highest_severity
    )

    # Create final output
    output = StockMonitorOutput(
        executive_summary=synthesis.get('executive_summary', ''),
        alerts=alerts,
        watchlist_overview=overview,
        market_context=synthesis.get('market_context', ''),
        recommendations=synthesis.get('recommendations', [])
    )

    duration_ms = int((time.time() - start_time) * 1000)

    details = {
        "total_alerts_generated": len(alerts),
        "alerts_by_severity": {
            severity: sum(1 for a in alerts if a.severity == severity)
            for severity in ['critical', 'high', 'medium', 'low']
        },
        "recommendations_count": len(output.recommendations)
    }

    return output, details, duration_ms


def run_stock_monitor_workflow(
    monitor_input: StockMonitorInput
) -> Tuple[StockMonitorOutput, list]:
    """
    Execute the complete 6-step stock monitoring workflow.

    Args:
        monitor_input: Validated StockMonitorInput

    Returns:
        Tuple of (StockMonitorOutput, execution_trace)
    """
    execution_trace = []

    print("Step 1/6: Initializing stock scan...")
    stock_data, step1_details, step1_duration = step_1_initialize_scan(monitor_input)
    execution_trace.append(create_execution_step(1, "Initialize Scan", "initialization", step1_details, step1_duration))

    print("Step 2/6: Searching for news...")
    news_data, step2_details, step2_duration = step_2_search_news(monitor_input, stock_data)
    execution_trace.append(create_execution_step(2, "Search News", "search_news", step2_details, step2_duration))

    print("Step 3/6: Searching SEC filings...")
    filings_data, step3_details, step3_duration = step_3_search_filings(monitor_input)
    execution_trace.append(create_execution_step(3, "Search Filings", "search_filings", step3_details, step3_duration))

    print("Step 4/6: Classifying events...")
    classified_events, step4_details, step4_duration = step_4_classify_events(
        monitor_input, stock_data, news_data, filings_data
    )
    execution_trace.append(create_execution_step(4, "Classify Events", "classification", step4_details, step4_duration))

    print("Step 5/6: Assessing impact...")
    assessed_events, step5_details, step5_duration = step_5_assess_impact(classified_events, stock_data)
    execution_trace.append(create_execution_step(5, "Assess Impact", "analysis", step5_details, step5_duration))

    print("Step 6/6: Generating alerts...")
    output, step6_details, step6_duration = step_6_generate_alerts(monitor_input, assessed_events, stock_data)
    execution_trace.append(create_execution_step(6, "Generate Alerts", "synthesis", step6_details, step6_duration))

    total_duration = sum(step['duration_ms'] for step in execution_trace)
    print(f"\n✓ Workflow completed in {total_duration/1000:.1f} seconds")

    return output, execution_trace
