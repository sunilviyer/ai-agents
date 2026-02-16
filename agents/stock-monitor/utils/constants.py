"""
Stock Monitor Agent Constants
"""

# Agent Configuration
AGENT_SLUG = "stock-monitor"
AGENT_NAME = "Ticker"
AGENT_COLOR = "#22c55e"  # Green
AGENT_DESCRIPTION = "Stock Portfolio Monitor"

# LLM Configuration
MODEL_NAME = "claude-3-haiku-20240307"
MAX_TOKENS = 4000
TEMPERATURE = 0.3

# Workflow Steps
WORKFLOW_STEPS = [
    {
        "number": 1,
        "name": "Initialize Scan",
        "type": "initialization",
        "description": "Fetch current stock prices and basic company info from Finnhub API"
    },
    {
        "number": 2,
        "name": "Search News",
        "type": "search_news",
        "description": "Search for recent news articles for each ticker using Tavily API"
    },
    {
        "number": 3,
        "name": "Search Filings",
        "type": "search_filings",
        "description": "Check SEC EDGAR for recent regulatory filings (10-K, 10-Q, 8-K)"
    },
    {
        "number": 4,
        "name": "Classify Events",
        "type": "classification",
        "description": "Use LLM to classify events by type and severity"
    },
    {
        "number": 5,
        "name": "Assess Impact",
        "type": "analysis",
        "description": "Analyze potential impact on stock price and investor decisions"
    },
    {
        "number": 6,
        "name": "Generate Alerts",
        "type": "synthesis",
        "description": "Create prioritized alert list with action recommendations"
    }
]

# API Rate Limits
FINNHUB_RATE_LIMIT = 60  # requests per minute
TAVILY_RATE_LIMIT = 100  # requests per minute

# Event Types
EVENT_TYPES = [
    "earnings",
    "news",
    "filings",
    "analyst_ratings",
    "price_movements"
]

# Severity Levels
SEVERITY_LEVELS = [
    "low",
    "medium",
    "high",
    "critical"
]

# Time Periods
TIME_PERIODS = [
    "24h",
    "7d",
    "30d"
]
