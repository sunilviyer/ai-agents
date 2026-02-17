"""
Pydantic Models for Gita Guide Agent

Defines the input/output structures for conversational spiritual guidance
based on the Bhagavad Gita.
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime
import uuid


class Verse(BaseModel):
    """Model for a Bhagavad Gita verse with full details."""
    chapter: int = Field(..., description="Chapter number (1-18)")
    verse_number: int = Field(..., description="Verse number within the chapter")
    verse_id: str = Field(..., description="Unique verse identifier (e.g., 'BG2.47')")
    sanskrit_text: str = Field(..., description="Original Sanskrit text in Devanagari")
    transliteration: str = Field(..., description="Romanized transliteration")
    english_translation: str = Field(..., description="English translation")
    relevance_to_question: str = Field(
        ...,
        description="Explanation of how this verse relates to the user's question"
    )


class GitaGuideInput(BaseModel):
    """Input model for spiritual questions."""
    question: str = Field(
        ...,
        description="The spiritual question or topic raised by the user",
        min_length=5
    )
    user_level: Literal["beginner", "intermediate", "advanced"] = Field(
        default="beginner",
        description="User's knowledge level of Bhagavad Gita and Vedic philosophy"
    )
    context: Optional[str] = Field(
        default=None,
        description="Optional previous conversation context for follow-up questions"
    )


class GitaGuideOutput(BaseModel):
    """Output model for spiritual guidance response."""
    conversation_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Unique identifier for this conversation"
    )
    question: str = Field(
        ...,
        description="The original question asked"
    )
    executive_summary: str = Field(
        ...,
        description="Brief overview of the answer (1-2 sentences)"
    )
    answer: str = Field(
        ...,
        description="Detailed spiritual guidance response"
    )
    relevant_verses: List[Verse] = Field(
        default_factory=list,
        description="Bhagavad Gita verses referenced in the answer with full details"
    )
    explanation: str = Field(
        ...,
        description="Interpretation and practical application of the teachings"
    )
    related_topics: List[str] = Field(
        default_factory=list,
        description="Related spiritual topics for further exploration"
    )
    suggested_next_questions: List[str] = Field(
        default_factory=list,
        description="Follow-up questions to deepen understanding (3-5 suggestions)"
    )
    execution_trace: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Step-by-step execution trace of the workflow"
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat() + "Z",
        description="ISO 8601 timestamp of response generation"
    )


class ExecutionStep(BaseModel):
    """Model for tracking workflow execution steps."""
    step_number: int
    step_name: str
    step_type: str
    details: Dict[str, Any]
    duration_ms: Optional[int] = None
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat() + "Z"
    )
