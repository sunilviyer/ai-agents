# Stock Monitor Agent (Ticker)

**Agent Slug:** `stock-monitor`
**Agent Color:** Green (#22c55e)
**Type:** Event Detection & Alert
**Workflow:** 6 steps

## Overview

The Stock Monitor agent (Ticker) monitors a watchlist of stocks for significant events and generates prioritized alerts. It analyzes earnings announcements, news, SEC filings, analyst ratings, and price movements to help investors stay informed about their portfolio.

## Features

- **Real-time Event Detection**: Monitors multiple event types across your watchlist
- **Severity Classification**: Automatically classifies events by impact level (low, medium, high, critical)
- **Multi-Source Intelligence**: Combines data from Finnhub (market data), Tavily (news), and SEC EDGAR (filings)
- **Impact Analysis**: AI-powered analysis of potential stock price impact
- **Actionable Recommendations**: Suggests specific actions for each alert

## Workflow Steps

1. **Initialize Scan** - Fetch current stock prices and company info from Finnhub API
2. **Search News** - Find recent news articles using Tavily API
3. **Search Filings** - Check SEC EDGAR for regulatory filings (10-K, 10-Q, 8-K)
4. **Classify Events** - Use LLM to classify events by type and severity
5. **Assess Impact** - Analyze potential impact on stock price and investor decisions
6. **Generate Alerts** - Create prioritized alert list with recommendations

## Input Parameters

```python
{
    "watchlist": ["AAPL", "MSFT", "GOOGL", "META"],  # Stock tickers to monitor
    "time_period": "24h",  # Options: 24h, 7d, 30d
    "event_types": [
        "earnings",
        "news",
        "filings",
        "analyst_ratings",
        "price_movements"
    ],
    "alert_threshold": "medium"  # Options: low, medium, high, critical
}
```

## Output Structure

```python
{
    "executive_summary": "Brief overview of key findings",
    "alerts": [
        {
            "ticker": "AAPL",
            "company_name": "Apple Inc.",
            "event_type": "earnings",
            "severity": "high",
            "headline": "Apple Reports Record Q4 Earnings",
            "description": "Detailed event description...",
            "source": "SEC Edgar / Tavily News",
            "timestamp": "2026-02-14T10:30:00Z",
            "impact_analysis": "Likely positive impact on stock price...",
            "action_suggested": "Monitor price action, consider position increase"
        }
    ],
    "watchlist_overview": {
        "total_stocks_monitored": 4,
        "alerts_triggered": 12,
        "event_breakdown": {
            "earnings": 2,
            "news": 7,
            "filings": 3
        },
        "highest_severity_alert": "high"
    },
    "market_context": "Overall market conditions analysis",
    "recommendations": [
        "Focus on AAPL earnings impact",
        "Monitor MSFT regulatory filing response"
    ]
}
```

## Setup

### 1. Install Dependencies

```bash
pip install anthropic finnhub-python tavily-python python-dotenv pydantic
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Required API keys:
- `ANTHROPIC_API_KEY` - For Claude AI analysis
- `FINNHUB_API_KEY` - For stock market data (get free key at https://finnhub.io)
- `TAVILY_API_KEY` - For news search (get free key at https://tavily.com)

### 3. Run the Agent

```bash
cd agents/stock-monitor

# Monitor tech stocks for 24 hours
python agent.py --watchlist AAPL MSFT GOOGL --period 24h --threshold medium

# Monitor EV sector with all events
python agent.py --watchlist TSLA RIVN LCID NIO --period 7d --events earnings news filings

# High-priority alerts only for banking sector
python agent.py --watchlist JPM BAC WFC GS --period 30d --threshold high
```

## CLI Options

- `--watchlist`: Space-separated stock tickers (required)
- `--period`: Time period (24h, 7d, 30d) - default: 24h
- `--events`: Event types to monitor - default: all types
- `--threshold`: Alert threshold (low, medium, high, critical) - default: medium

## Output

The agent generates a JSON file in `output/case_study_YYYYMMDD_HHMMSS.json` containing:
- Complete input parameters
- All detected alerts with severity classification
- Watchlist overview statistics
- Market context analysis
- Actionable recommendations
- Execution trace with timing for each step

## Example Use Cases

### 1. Tech Giants - Earnings Season
```bash
python agent.py --watchlist AAPL MSFT GOOGL META --period 7d --events earnings analyst_ratings
```

### 2. EV Sector - Industry News
```bash
python agent.py --watchlist TSLA RIVN LCID NIO --period 24h --events news price_movements
```

### 3. Banking - Regulatory Filings
```bash
python agent.py --watchlist JPM BAC WFC GS --period 30d --events filings
```

### 4. Healthcare - FDA Approvals
```bash
python agent.py --watchlist JNJ PFE UNH ABBV --period 7d --events news filings
```

### 5. Energy - Commodity Impact
```bash
python agent.py --watchlist XOM CVX BP SLB --period 24h --threshold high
```

## API Rate Limits

- **Finnhub**: 60 requests/minute (free tier)
- **Tavily**: 100 requests/minute (free tier)
- **Anthropic**: Standard Claude API limits

The agent automatically handles rate limiting with appropriate delays.

## Database Import

After generating case studies, import them to the database:

```bash
python scripts/import_case_studies.py
```

Requires `DATABASE_URL` environment variable to be set.

## License

MIT License - See main project LICENSE file
