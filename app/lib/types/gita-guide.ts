/**
 * TypeScript types for Gita Guide Agent
 *
 * Conversational spiritual guidance based on the Bhagavad Gita.
 * Matches Pydantic models in agents/gita-guide/utils/models.py
 */

/**
 * User knowledge level for tailoring responses
 */
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * A single verse from the Bhagavad Gita with full details
 */
export interface Verse {
  /** Chapter number (1-18) */
  chapter: number;

  /** Verse number within the chapter */
  verse_number: number;

  /** Unique verse identifier (e.g., 'BG2.47') */
  verse_id: string;

  /** Original Sanskrit text in Devanagari */
  sanskrit_text: string;

  /** Romanized transliteration */
  transliteration: string;

  /** English translation */
  english_translation: string;

  /** Explanation of how this verse relates to the user's question */
  relevance_to_question: string;
}

/**
 * Input for spiritual question to the Gita Guide
 */
export interface GitaGuideInput {
  /** The spiritual question or topic raised by the user */
  question: string;

  /** User's knowledge level of Bhagavad Gita and Vedic philosophy */
  user_level?: UserLevel;

  /** Optional previous conversation context for follow-up questions */
  context?: string | null;
}

/**
 * Execution step tracking for workflow transparency
 */
export interface ExecutionStep {
  step_number: number;
  step_name: string;
  step_type: string;
  details: Record<string, any>;
  duration_ms?: number | null;
  timestamp: string;
}

/**
 * Output response from Gita Guide with spiritual guidance
 */
export interface GitaGuideOutput {
  /** Unique identifier for this conversation */
  conversation_id: string;

  /** The original question asked */
  question: string;

  /** Brief overview of the answer (1-2 sentences) */
  executive_summary: string;

  /** Detailed spiritual guidance response */
  answer: string;

  /** Bhagavad Gita verses referenced in the answer with full details */
  relevant_verses: Verse[];

  /** Interpretation and practical application of the teachings */
  explanation: string;

  /** Related spiritual topics for further exploration */
  related_topics: string[];

  /** Follow-up questions to deepen understanding (3-5 suggestions) */
  suggested_next_questions: string[];

  /** Step-by-step execution trace of the workflow */
  execution_trace: Record<string, any>[];

  /** ISO 8601 timestamp of response generation */
  timestamp: string;
}
