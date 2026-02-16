"""
Pydantic Models for Stock Monitor Agent

These models define the input and output schemas for the agent,
ensuring type safety and validation.
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class StockMonitorInput(BaseModel):
    """Input model for Stock Monitor agent"""

    watchlist: List[str] = Field(
        ...,
        description="Stock tickers to monitor (e.g., ['AAPL', 'TSLA', 'GOOGL'])",
        min_length=1
    )
    time_period: Literal["24h", "7d", "30d"] = Field(
        default="24h",
        description="Time period for monitoring"
    )
    event_types: List[str] = Field(
        default_factory=lambda: ["earnings", "news", "filings", "analyst_ratings", "price_movements"],
        description="Types of events to monitor"
    )
    alert_threshold: Literal["low", "medium", "high", "critical"] = Field(
        default="medium",
        description="Minimum severity level for alerts"
    )


class StockAlert(BaseModel):
    """Individual stock alert"""

    ticker: str = Field(..., description="Stock ticker symbol")
    company_name: str = Field(..., description="Company name")
    event_type: str = Field(..., description="Type of event (earnings, news, filing, etc.)")
    severity: Literal["low", "medium", "high", "critical"] = Field(..., description="Alert severity")
    headline: str = Field(..., description="Alert headline/title")
    description: str = Field(..., description="Detailed description of the event")
    source: str = Field(..., description="Source of the information")
    timestamp: str = Field(..., description="When the event occurred/was detected")
    impact_analysis: str = Field(..., description="Analysis of potential impact on stock")
    action_suggested: str = Field(..., description="Recommended action for investors")


class WatchlistOverview(BaseModel):
    """Overview of watchlist monitoring results"""

    total_stocks_monitored: int = Field(..., description="Number of stocks in watchlist")
    alerts_triggered: int = Field(..., description="Total number of alerts generated")
    event_breakdown: dict = Field(..., description="Count of events by type")
    highest_severity_alert: str = Field(..., description="Highest severity level detected")


class StockMonitorOutput(BaseModel):
    """Output model for Stock Monitor agent"""

    executive_summary: str = Field(..., description="Brief summary of key findings")
    alerts: List[StockAlert] = Field(
        default_factory=list,
        description="Prioritized list of stock alerts"
    )
    watchlist_overview: WatchlistOverview = Field(..., description="Overview statistics")
    market_context: str = Field(..., description="General market conditions and context")
    recommendations: List[str] = Field(
        default_factory=list,
        description="High-level recommendations for portfolio management"
    )
