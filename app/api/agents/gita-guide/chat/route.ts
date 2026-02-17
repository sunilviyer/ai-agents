import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { query } from '@/lib/db';

// Vercel serverless max duration (free tier allows 60s, Pro allows 300s)
export const maxDuration = 60;

// Simple in-memory rate limiter (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Model constants
const MODEL_NAME = 'claude-3-haiku-20240307';
const MAX_TOKENS = 2000;
const TEMPERATURE = 0.7;

const KEY_CONCEPTS = [
  'Dharma', 'Karma Yoga', 'Bhakti Yoga', 'Jnana Yoga', 'Raja Yoga',
  'Atman', 'Brahman', 'Maya', 'Moksha', 'Samsara',
  'Gunas', 'Nishkama Karma', 'Sthitaprajna', 'Sankhya', 'Yoga',
  'Renunciation', 'Devotion', 'Self-realization', 'Equanimity', 'Liberation'
];

// Types
interface VerseRow {
  verse_id: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation_en: string;
  themes: string[];
  keywords: string[];
}

interface VerseWithRelevance {
  verse_id: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation: string;
  commentary: string;
  relevance_to_question: string;
}

interface ExecutionStep {
  step_number: number;
  step_name: string;
  step_type: string;
  details: Record<string, unknown>;
  duration_ms: number;
  timestamp: string;
}

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  userLimit.count++;
  return true;
}

function parseJsonFromLLM(text: string): unknown {
  let cleaned = text;
  if (cleaned.includes('```json')) {
    cleaned = cleaned.split('```json')[1].split('```')[0].trim();
  } else if (cleaned.includes('```')) {
    cleaned = cleaned.split('```')[1].split('```')[0].trim();
  }
  return JSON.parse(cleaned);
}

function getLevelGuidance(userLevel: string) {
  const levelMap: Record<string, { style: string; depth: string; tone: string }> = {
    beginner: {
      style: 'Use simple language, explain Sanskrit terms, provide relatable examples',
      depth: 'Focus on practical application and basic concepts',
      tone: 'Warm, encouraging, accessible',
    },
    intermediate: {
      style: 'Balance technical terms with explanations, draw connections between concepts',
      depth: 'Explore philosophical nuances and interconnections',
      tone: 'Engaging, intellectually stimulating',
    },
    advanced: {
      style: 'Use philosophical terminology, reference commentaries, explore subtle meanings',
      depth: 'Deep philosophical analysis, multiple interpretations, scholarly context',
      tone: 'Profound, contemplative, scholarly',
    },
  };
  return levelMap[userLevel] ?? levelMap['beginner'];
}

// Step 1: Understand Intent
async function step1UnderstandIntent(
  client: Anthropic,
  question: string,
  startTime: number
): Promise<{ intentData: Record<string, unknown>; step: ExecutionStep }> {
  const stepStart = Date.now();

  const prompt = `Analyze this spiritual question and extract the core intent and key concepts.

Question: ${question}

Identify:
1. The main spiritual topic or concern
2. Key Bhagavad Gita concepts that might be relevant (from: ${KEY_CONCEPTS.slice(0, 10).join(', ')}, etc.)
3. The type of guidance being sought (understanding, practical application, resolution of doubt, etc.)
4. Any specific life situations or challenges mentioned

Respond in JSON format:
{
  "core_topic": "brief description",
  "key_concepts": ["concept1", "concept2"],
  "guidance_type": "type of guidance sought",
  "life_context": "specific situation if mentioned, otherwise null"
}`;

  const response = await client.messages.create({
    model: MODEL_NAME,
    max_tokens: 500,
    temperature: TEMPERATURE,
    messages: [{ role: 'user', content: prompt }],
  });

  const intentData = parseJsonFromLLM(
    (response.content[0] as { type: string; text: string }).text
  ) as Record<string, unknown>;

  const duration = Date.now() - stepStart;

  return {
    intentData,
    step: {
      step_number: 1,
      step_name: 'Understand Intent',
      step_type: 'analysis',
      details: {
        question,
        identified_topic: intentData.core_topic,
        key_concepts: intentData.key_concepts ?? [],
        guidance_type: intentData.guidance_type,
      },
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    },
  };
}

// Step 2: Retrieve Verses
async function step2RetrieveVerses(
  client: Anthropic,
  intentData: Record<string, unknown>,
  question: string
): Promise<{ verses: VerseWithRelevance[]; step: ExecutionStep }> {
  const stepStart = Date.now();

  // Fetch all verses from DB (no commentaries yet)
  const allVerses = await query<VerseRow>(
    'SELECT verse_id, chapter, verse, sanskrit, transliteration, translation_en FROM gita_verses ORDER BY chapter, verse'
  );

  // Build a compact summary for LLM (verse_id + translation only)
  const verseSummaries = allVerses.rows.map((v) => ({
    verse_id: v.verse_id,
    translation: v.translation_en,
  }));

  const prompt = `Given this spiritual question and the identified key concepts, select the 3-5 most relevant Bhagavad Gita verses.

Question: ${question}
Core Topic: ${intentData.core_topic}
Key Concepts: ${(intentData.key_concepts as string[] | undefined ?? []).join(', ')}

Available verses (showing translation):
${JSON.stringify(verseSummaries, null, 2)}

Select the most relevant verses and explain why each is relevant to the question.

Respond in JSON format:
{
  "selected_verses": [
    {
      "verse_id": "BG2.47",
      "relevance": "explanation of why this verse is relevant"
    }
  ]
}

Select 3-5 verses maximum.`;

  const response = await client.messages.create({
    model: MODEL_NAME,
    max_tokens: 1500,
    temperature: TEMPERATURE,
    messages: [{ role: 'user', content: prompt }],
  });

  const selectionData = parseJsonFromLLM(
    (response.content[0] as { type: string; text: string }).text
  ) as { selected_verses: Array<{ verse_id: string; relevance: string }> };

  const selectedVerseIds = new Set(
    selectionData.selected_verses.map((v) => v.verse_id)
  );
  const relevanceMap = Object.fromEntries(
    selectionData.selected_verses.map((v) => [v.verse_id, v.relevance])
  );

  // Fetch commentaries only for selected verses
  const verses: VerseWithRelevance[] = [];
  for (const v of allVerses.rows) {
    if (!selectedVerseIds.has(v.verse_id)) continue;

    // Get one commentary for this verse
    const commentaryResult = await query<{ commentary_en: string }>(
      'SELECT commentary_en FROM gita_verse_commentaries WHERE verse_id = $1 LIMIT 1',
      [v.verse_id]
    );
    const commentary = commentaryResult.rows[0]?.commentary_en?.substring(0, 500) ?? '';

    verses.push({
      verse_id: v.verse_id,
      chapter: v.chapter,
      verse: v.verse,
      sanskrit: v.sanskrit,
      transliteration: v.transliteration,
      translation: v.translation_en,
      commentary,
      relevance_to_question: relevanceMap[v.verse_id] ?? '',
    });
  }

  const duration = Date.now() - stepStart;

  return {
    verses,
    step: {
      step_number: 2,
      step_name: 'Retrieve Verses',
      step_type: 'search',
      details: {
        total_verses_searched: allVerses.rows.length,
        verses_selected: verses.length,
        selected_verse_ids: Array.from(selectedVerseIds),
      },
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    },
  };
}

// Step 3: Check Context
async function step3CheckContext(
  client: Anthropic,
  question: string,
  context: string | null
): Promise<{ contextData: Record<string, unknown>; step: ExecutionStep }> {
  const stepStart = Date.now();

  const contextData: Record<string, unknown> = {
    has_previous_context: !!context,
    context_summary: null,
    conversation_continuation: false,
  };

  if (context) {
    const prompt = `Analyze the conversation context and determine how it relates to the current question.

Previous Context: ${context}
Current Question: ${question}

Determine:
1. Is this a follow-up question to the previous context?
2. What key points from the context should inform the answer?
3. Are there any contradictions or shifts in the user's inquiry?

Respond in JSON format:
{
  "is_followup": true,
  "context_summary": "brief summary of relevant context",
  "key_points_to_address": ["point1", "point2"]
}`;

    const response = await client.messages.create({
      model: MODEL_NAME,
      max_tokens: 500,
      temperature: TEMPERATURE,
      messages: [{ role: 'user', content: prompt }],
    });

    const contextAnalysis = parseJsonFromLLM(
      (response.content[0] as { type: string; text: string }).text
    ) as Record<string, unknown>;

    contextData.context_summary = contextAnalysis.context_summary;
    contextData.conversation_continuation = contextAnalysis.is_followup ?? false;
    contextData.key_points = contextAnalysis.key_points_to_address ?? [];
  }

  const duration = Date.now() - stepStart;

  return {
    contextData,
    step: {
      step_number: 3,
      step_name: 'Check Context',
      step_type: 'context_analysis',
      details: contextData,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    },
  };
}

// Step 4: Adapt to Level (pure logic, no LLM)
function step4AdaptToLevel(
  userLevel: string
): { levelGuidance: Record<string, string>; step: ExecutionStep } {
  const guidance = getLevelGuidance(userLevel);
  const levelGuidance = { ...guidance, user_level: userLevel };

  return {
    levelGuidance,
    step: {
      step_number: 4,
      step_name: 'Adapt to Level',
      step_type: 'personalization',
      details: {
        user_level: userLevel,
        style_guidance: guidance.style,
        depth_guidance: guidance.depth,
      },
      duration_ms: 0,
      timestamp: new Date().toISOString(),
    },
  };
}

// Step 5: Formulate Teaching
async function step5FormulateTeaching(
  client: Anthropic,
  question: string,
  verses: VerseWithRelevance[],
  contextData: Record<string, unknown>,
  levelGuidance: Record<string, string>
): Promise<{ teachingData: Record<string, unknown>; step: ExecutionStep }> {
  const stepStart = Date.now();

  const verseReferences = verses
    .map(
      (v) => `
Verse ${v.verse_id} (Chapter ${v.chapter}, Verse ${v.verse})
Sanskrit: ${v.sanskrit}
Translation: ${v.translation}
Commentary: ${v.commentary}
Relevance: ${v.relevance_to_question}
`
    )
    .join('');

  const contextNote = contextData.has_previous_context
    ? `\nPrevious Context: ${contextData.context_summary}\n`
    : '';

  const prompt = `You are a wise spiritual guide well-versed in the Bhagavad Gita. A seeker has asked you a question.

Question: ${question}
${contextNote}
User Level: ${levelGuidance.user_level}

Style Guidance: ${levelGuidance.style}
Depth Guidance: ${levelGuidance.depth}
Tone: ${levelGuidance.tone}

Relevant Bhagavad Gita Verses:
${verseReferences}

Provide a comprehensive spiritual teaching that:
1. Directly addresses the question with wisdom from the Gita
2. References the relevant verses naturally in the explanation
3. Provides practical application for modern life
4. Is appropriate for the user's knowledge level
5. Offers deep insight while remaining accessible

IMPORTANT: Respond ONLY with valid JSON. Use \\n for newlines within strings, not actual line breaks.

Format:
{
  "executive_summary": "1-2 sentence overview",
  "answer": "Main teaching (3-5 paragraphs with \\n\\n between paragraphs)",
  "explanation": "Practical application (2-3 paragraphs with \\n\\n between paragraphs)",
  "related_topics": ["topic1", "topic2", "topic3"]
}`;

  const response = await client.messages.create({
    model: MODEL_NAME,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    messages: [{ role: 'user', content: prompt }],
  });

  let teachingData: Record<string, unknown>;
  try {
    teachingData = parseJsonFromLLM(
      (response.content[0] as { type: string; text: string }).text
    ) as Record<string, unknown>;
  } catch {
    const rawText = (response.content[0] as { type: string; text: string }).text;
    teachingData = {
      executive_summary: 'The Gita teaches performing duty without attachment to results.',
      answer: rawText.substring(0, 1000),
      explanation: 'This principle of Karma Yoga guides us to focus on our actions while surrendering outcomes.',
      related_topics: ['Karma Yoga', 'Nishkama Karma', 'Detachment'],
    };
  }

  const duration = Date.now() - stepStart;

  return {
    teachingData,
    step: {
      step_number: 5,
      step_name: 'Formulate Teaching',
      step_type: 'synthesis',
      details: {
        verses_referenced: verses.length,
        answer_length: (teachingData.answer as string | undefined ?? '').length,
        user_level: levelGuidance.user_level,
      },
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    },
  };
}

// Step 6: Suggest Next Steps
async function step6SuggestNextSteps(
  client: Anthropic,
  question: string,
  teachingData: Record<string, unknown>
): Promise<{ suggestedQuestions: string[]; step: ExecutionStep }> {
  const stepStart = Date.now();

  const relatedTopics = (teachingData.related_topics as string[] | undefined ?? []).join(', ');

  const prompt = `Based on this spiritual teaching, suggest 3-5 follow-up questions that would deepen the seeker's understanding.

Original Question: ${question}
Teaching Summary: ${teachingData.executive_summary}
Related Topics: ${relatedTopics}

Create questions that:
1. Build naturally from this teaching
2. Explore related concepts from the Gita
3. Help the seeker apply these teachings more deeply
4. Encourage progressive spiritual development

Respond in JSON format:
{
  "suggested_questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?"
  ]
}

Provide 3-5 questions.`;

  const response = await client.messages.create({
    model: MODEL_NAME,
    max_tokens: 500,
    temperature: TEMPERATURE,
    messages: [{ role: 'user', content: prompt }],
  });

  const nextStepsData = parseJsonFromLLM(
    (response.content[0] as { type: string; text: string }).text
  ) as { suggested_questions: string[] };

  const suggestedQuestions = nextStepsData.suggested_questions ?? [];
  const duration = Date.now() - stepStart;

  return {
    suggestedQuestions,
    step: {
      step_number: 6,
      step_name: 'Suggest Next Steps',
      step_type: 'guidance',
      details: {
        suggested_questions_count: suggestedQuestions.length,
        related_topics_count: (teachingData.related_topics as string[] | undefined ?? []).length,
      },
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const identifier =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'anonymous';

    if (!checkRateLimit(identifier)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending another message.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { question, user_level = 'beginner', context = null } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    if (question.length > 500) {
      return NextResponse.json(
        { error: 'Question is too long. Please keep it under 500 characters.' },
        { status: 400 }
      );
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const executionTrace: ExecutionStep[] = [];

    // Step 1: Understand Intent
    const { intentData, step: step1 } = await step1UnderstandIntent(client, question, Date.now());
    executionTrace.push(step1);

    // Step 2: Retrieve Verses
    const { verses, step: step2 } = await step2RetrieveVerses(client, intentData, question);
    executionTrace.push(step2);

    // Step 3: Check Context
    const { contextData, step: step3 } = await step3CheckContext(
      client,
      question,
      context ? String(context).substring(0, 1000) : null
    );
    executionTrace.push(step3);

    // Step 4: Adapt to Level (pure logic)
    const { levelGuidance, step: step4 } = step4AdaptToLevel(user_level);
    executionTrace.push(step4);

    // Step 5: Formulate Teaching
    const { teachingData, step: step5 } = await step5FormulateTeaching(
      client,
      question,
      verses,
      contextData,
      levelGuidance
    );
    executionTrace.push(step5);

    // Step 6: Suggest Next Steps
    const { suggestedQuestions, step: step6 } = await step6SuggestNextSteps(
      client,
      question,
      teachingData
    );
    executionTrace.push(step6);

    const totalExecutionMs = executionTrace.reduce((sum, s) => sum + s.duration_ms, 0);

    const response = {
      answer: {
        teaching: teachingData.answer,
        executive_summary: teachingData.executive_summary,
        explanation: teachingData.explanation,
        verse_references: verses.map((v) => ({
          chapter: v.chapter,
          verse: v.verse,
          sanskrit_text: v.sanskrit,
          transliteration: v.transliteration,
          translation: v.translation,
          relevance: v.relevance_to_question,
        })),
        related_topics: teachingData.related_topics,
        suggested_questions: suggestedQuestions,
      },
      execution_time_ms: totalExecutionMs,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in gita-guide chat endpoint:', error);

    return NextResponse.json(
      {
        error: 'Failed to process your question. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
