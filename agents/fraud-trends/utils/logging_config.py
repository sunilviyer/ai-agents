"""
Logging Configuration for Fraud Trends Agent

This module provides centralized logging configuration for the agent workflow.
Logs are output to console with clear formatting showing:
- Timestamp
- Log level (INFO, WARNING, ERROR)
- Step context
- Message

Implementation: Epic 3, Story 3.9
"""

import logging
import sys
from typing import Optional


def setup_logging(level: int = logging.INFO) -> logging.Logger:
    """
    Configure logging for the Fraud Trends agent.

    Args:
        level: Logging level (default: logging.INFO)

    Returns:
        logging.Logger: Configured logger instance
    """
    # Create logger
    logger = logging.getLogger("fraud_trends_agent")
    logger.setLevel(level)

    # Remove existing handlers to avoid duplicates
    logger.handlers = []

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)

    # Create formatter
    formatter = logging.Formatter(
        fmt='%(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)

    # Add handler to logger
    logger.addHandler(console_handler)

    # Prevent propagation to root logger
    logger.propagate = False

    return logger


def log_step_start(logger: logging.Logger, step_number: int, step_name: str, context: Optional[str] = None):
    """
    Log the start of a workflow step.

    Args:
        logger: Logger instance
        step_number: Step number (1-6)
        step_name: Name of the step
        context: Optional context information
    """
    msg = f"[Step {step_number}] Starting: {step_name}"
    if context:
        msg += f" | {context}"
    logger.info(msg)


def log_step_complete(logger: logging.Logger, step_number: int, step_name: str, duration_ms: int, summary: str):
    """
    Log the completion of a workflow step.

    Args:
        logger: Logger instance
        step_number: Step number (1-6)
        step_name: Name of the step
        duration_ms: Execution time in milliseconds
        summary: Output summary
    """
    duration_sec = duration_ms / 1000.0
    logger.info(f"[Step {step_number}] Complete: {step_name} ({duration_sec:.2f}s) | {summary}")


def log_step_error(logger: logging.Logger, step_number: int, step_name: str, error: Exception):
    """
    Log an error that occurred during a workflow step.

    Args:
        logger: Logger instance
        step_number: Step number (1-6)
        step_name: Name of the step
        error: Exception that occurred
    """
    error_type = type(error).__name__
    error_msg = str(error)

    # Sanitize error message to remove API keys
    sanitized_msg = _sanitize_message(error_msg)

    logger.error(f"[Step {step_number}] ERROR in {step_name}: {error_type} - {sanitized_msg}")


def log_warning(logger: logging.Logger, message: str, context: Optional[str] = None):
    """
    Log a warning message.

    Args:
        logger: Logger instance
        message: Warning message
        context: Optional context information
    """
    msg = _sanitize_message(message)
    if context:
        msg = f"{context} | {msg}"
    logger.warning(msg)


def log_info(logger: logging.Logger, message: str):
    """
    Log an informational message.

    Args:
        logger: Logger instance
        message: Info message
    """
    logger.info(_sanitize_message(message))


def _sanitize_message(message: str) -> str:
    """
    Sanitize log messages to prevent leaking API keys or credentials.

    Args:
        message: Original message

    Returns:
        str: Sanitized message with sensitive data redacted
    """
    # List of patterns that might indicate API keys
    sensitive_patterns = [
        "sk-ant-api",
        "tvly-",
        "api_key=",
        "anthropic_api_key",
        "tavily_api_key",
    ]

    sanitized = message
    for pattern in sensitive_patterns:
        if pattern in sanitized.lower():
            # Replace with redacted placeholder
            sanitized = sanitized.replace(pattern, "[REDACTED]")
            # Also redact any following alphanumeric characters that look like keys
            import re
            sanitized = re.sub(r'[A-Za-z0-9_-]{20,}', '[REDACTED_KEY]', sanitized)

    return sanitized


# Global logger instance
_logger: Optional[logging.Logger] = None


def get_logger() -> logging.Logger:
    """
    Get the global logger instance, creating it if necessary.

    Returns:
        logging.Logger: Logger instance
    """
    global _logger
    if _logger is None:
        _logger = setup_logging()
    return _logger
