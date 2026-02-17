"""
Workflow Steps for Gita Guide Agent

Implements the 6-step conversational workflow for spiritual guidance.
"""

import json
import os
from typing import Dict, Any, List
from datetime import datetime
from pathlib import Path
import anthropic

from .models import GitaGuideInput, GitaGuideOutput, ExecutionStep, Verse
from .constants import WORKFLOW_STEPS, MODEL_NAME, MAX_TOKENS, TEMPERATURE, KEY_CONCEPTS


def run_gita_guide_workflow(guide_input: GitaGuideInput) -> GitaGuideOutput:
    """
    Run the complete 6-step conversational workflow.

    Steps:
    1. Understand Intent - Analyze question to identify core topic
    2. Retrieve Verses - Find relevant verses from knowledge base
    3. Check Context - Consider previous conversation context
    4. Adapt to Level - Adjust complexity for user's level
    5. Formulate Teaching - Generate answer with practical application
    6. Suggest Next Steps - Propose related topics and follow-up questions
    """
    execution_trace = []
    start_time = datetime.utcnow()

    # Step 1: Understand Intent
    intent_data, step1_trace = step_1_understand_intent(guide_input)
    execution_trace.append(step1_trace.model_dump())

    # Step 2: Retrieve Verses
    relevant_verses, step2_trace = step_2_retrieve_verses(intent_data, guide_input.question)
    execution_trace.append(step2_trace.model_dump())

    # Step 3: Check Context
    context_data, step3_trace = step_3_check_context(guide_input, relevant_verses)
    execution_trace.append(step3_trace.model_dump())

    # Step 4: Adapt to Level
    level_guidance, step4_trace = step_4_adapt_to_level(guide_input, relevant_verses)
    execution_trace.append(step4_trace.model_dump())

    # Step 5: Formulate Teaching
    teaching_data, step5_trace = step_5_formulate_teaching(
        guide_input, relevant_verses, context_data, level_guidance
    )
    execution_trace.append(step5_trace.model_dump())

    # Step 6: Suggest Next Steps
    output, step6_trace = step_6_suggest_next_steps(
        guide_input, teaching_data, relevant_verses, execution_trace
    )
    execution_trace.append(step6_trace.model_dump())

    # Update execution trace in output
    output.execution_trace = execution_trace

    return output


def step_1_understand_intent(guide_input: GitaGuideInput) -> tuple[Dict[str, Any], ExecutionStep]:
    """
    Step 1: Understand Intent - Analyze the question to identify core topic and intent.
    """
    step_start = datetime.utcnow()

    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    prompt = f"""Analyze this spiritual question and extract the core intent and key concepts.

Question: {guide_input.question}

Identify:
1. The main spiritual topic or concern
2. Key Bhagavad Gita concepts that might be relevant (from: {', '.join(KEY_CONCEPTS[:10])}, etc.)
3. The type of guidance being sought (understanding, practical application, resolution of doubt, etc.)
4. Any specific life situations or challenges mentioned

Respond in JSON format:
{{
  "core_topic": "brief description",
  "key_concepts": ["concept1", "concept2"],
  "guidance_type": "type of guidance sought",
  "life_context": "specific situation if mentioned, otherwise null"
}}"""

    response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=500,
        temperature=TEMPERATURE,
        messages=[{"role": "user", "content": prompt}]
    )

    # Parse JSON from response
    response_text = response.content[0].text
    # Extract JSON if wrapped in markdown code blocks
    if "```json" in response_text:
        response_text = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        response_text = response_text.split("```")[1].split("```")[0].strip()

    intent_data = json.loads(response_text)

    step_end = datetime.utcnow()
    duration_ms = int((step_end - step_start).total_seconds() * 1000)

    execution_step = ExecutionStep(
        step_number=1,
        step_name="Understand Intent",
        step_type="analysis",
        details={
            "question": guide_input.question,
            "identified_topic": intent_data.get("core_topic"),
            "key_concepts": intent_data.get("key_concepts", []),
            "guidance_type": intent_data.get("guidance_type")
        },
        duration_ms=duration_ms
    )

    return intent_data, execution_step


def step_2_retrieve_verses(intent_data: Dict[str, Any], question: str) -> tuple[List[Dict], ExecutionStep]:
    """
    Step 2: Retrieve Verses - Find relevant verses from PostgreSQL database using semantic search.
    """
    step_start = datetime.utcnow()

    # Import database utilities
    from .db import get_all_verses

    # Load all verses from PostgreSQL database
    all_verses_from_db = get_all_verses()

    # Convert to format expected by the rest of the code (without commentaries for now)
    # We'll add commentaries only for selected verses later to avoid 700+ DB queries
    all_verses = []
    for v in all_verses_from_db:
        all_verses.append({
            "verse_id": v["verse_id"],
            "chapter": v["chapter"],
            "verse": v["verse"],
            "sanskrit": v["sanskrit"],
            "transliteration": v["transliteration"],
            "translation": v["translation_en"],
            "commentary": ""  # Will be added only for selected verses
        })

    # Use LLM to find relevant verses (semantic search without vector DB)
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    # Create a simplified verse list for the LLM
    verse_summaries = []
    for v in all_verses:
        verse_summaries.append({
            "verse_id": v["verse_id"],
            "translation": v["translation"],
            "commentary": v["commentary"]
        })

    prompt = f"""Given this spiritual question and the identified key concepts, select the 3-5 most relevant Bhagavad Gita verses.

Question: {question}
Core Topic: {intent_data.get('core_topic')}
Key Concepts: {', '.join(intent_data.get('key_concepts', []))}

Available verses (showing translation and brief commentary):
{json.dumps(verse_summaries, indent=2)}

Select the most relevant verses and explain why each is relevant to the question.

Respond in JSON format:
{{
  "selected_verses": [
    {{
      "verse_id": "BG2.47",
      "relevance": "explanation of why this verse is relevant"
    }}
  ]
}}

Select 3-5 verses maximum."""

    response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=1500,
        temperature=TEMPERATURE,
        messages=[{"role": "user", "content": prompt}]
    )

    # Parse response
    response_text = response.content[0].text
    if "```json" in response_text:
        response_text = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        response_text = response_text.split("```")[1].split("```")[0].strip()

    selection_data = json.loads(response_text)

    # Get full verse data for selected verses
    selected_verse_ids = [v["verse_id"] for v in selection_data.get("selected_verses", [])]
    relevance_map = {v["verse_id"]: v["relevance"] for v in selection_data.get("selected_verses", [])}

    # Now fetch commentaries only for the selected verses (3-5 verses instead of 700+)
    from .db import get_verse_commentaries

    relevant_verses = []
    for verse in all_verses:
        if verse["verse_id"] in selected_verse_ids:
            verse_copy = verse.copy()
            verse_copy["relevance_to_question"] = relevance_map.get(verse["verse_id"], "")

            # Add commentary for this selected verse
            commentaries = get_verse_commentaries(verse["verse_id"], limit=1)
            if commentaries and commentaries[0].get('commentary_en'):
                verse_copy["commentary"] = commentaries[0]['commentary_en'][:500]

            relevant_verses.append(verse_copy)

    step_end = datetime.utcnow()
    duration_ms = int((step_end - step_start).total_seconds() * 1000)

    execution_step = ExecutionStep(
        step_number=2,
        step_name="Retrieve Verses",
        step_type="search",
        details={
            "total_verses_searched": len(all_verses),
            "verses_selected": len(relevant_verses),
            "selected_verse_ids": selected_verse_ids
        },
        duration_ms=duration_ms
    )

    return relevant_verses, execution_step


def step_3_check_context(guide_input: GitaGuideInput, relevant_verses: List[Dict]) -> tuple[Dict[str, Any], ExecutionStep]:
    """
    Step 3: Check Context - Consider previous conversation context if provided.
    """
    step_start = datetime.utcnow()

    context_data = {
        "has_previous_context": bool(guide_input.context),
        "context_summary": None,
        "conversation_continuation": False
    }

    if guide_input.context:
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

        prompt = f"""Analyze the conversation context and determine how it relates to the current question.

Previous Context: {guide_input.context}
Current Question: {guide_input.question}

Determine:
1. Is this a follow-up question to the previous context?
2. What key points from the context should inform the answer?
3. Are there any contradictions or shifts in the user's inquiry?

Respond in JSON format:
{{
  "is_followup": true/false,
  "context_summary": "brief summary of relevant context",
  "key_points_to_address": ["point1", "point2"]
}}"""

        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=500,
            temperature=TEMPERATURE,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = response.content[0].text
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        context_analysis = json.loads(response_text)
        context_data["context_summary"] = context_analysis.get("context_summary")
        context_data["conversation_continuation"] = context_analysis.get("is_followup", False)
        context_data["key_points"] = context_analysis.get("key_points_to_address", [])

    step_end = datetime.utcnow()
    duration_ms = int((step_end - step_start).total_seconds() * 1000)

    execution_step = ExecutionStep(
        step_number=3,
        step_name="Check Context",
        step_type="context_analysis",
        details=context_data,
        duration_ms=duration_ms
    )

    return context_data, execution_step


def step_4_adapt_to_level(guide_input: GitaGuideInput, relevant_verses: List[Dict]) -> tuple[Dict[str, Any], ExecutionStep]:
    """
    Step 4: Adapt to Level - Adjust explanation complexity based on user_level.
    """
    step_start = datetime.utcnow()

    user_level = guide_input.user_level or "beginner"

    level_guidance = {
        "beginner": {
            "style": "Use simple language, explain Sanskrit terms, provide relatable examples",
            "depth": "Focus on practical application and basic concepts",
            "tone": "Warm, encouraging, accessible"
        },
        "intermediate": {
            "style": "Balance technical terms with explanations, draw connections between concepts",
            "depth": "Explore philosophical nuances and interconnections",
            "tone": "Engaging, intellectually stimulating"
        },
        "advanced": {
            "style": "Use philosophical terminology, reference commentaries, explore subtle meanings",
            "depth": "Deep philosophical analysis, multiple interpretations, scholarly context",
            "tone": "Profound, contemplative, scholarly"
        }
    }

    selected_guidance = level_guidance.get(user_level, level_guidance["beginner"])
    selected_guidance["user_level"] = user_level

    step_end = datetime.utcnow()
    duration_ms = int((step_end - step_start).total_seconds() * 1000)

    execution_step = ExecutionStep(
        step_number=4,
        step_name="Adapt to Level",
        step_type="personalization",
        details={
            "user_level": user_level,
            "style_guidance": selected_guidance["style"],
            "depth_guidance": selected_guidance["depth"]
        },
        duration_ms=duration_ms
    )

    return selected_guidance, execution_step


def step_5_formulate_teaching(
    guide_input: GitaGuideInput,
    relevant_verses: List[Dict],
    context_data: Dict[str, Any],
    level_guidance: Dict[str, Any]
) -> tuple[Dict[str, Any], ExecutionStep]:
    """
    Step 5: Formulate Teaching - Generate answer with verse references and practical application.
    """
    step_start = datetime.utcnow()

    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    # Build verse reference text
    verse_references = []
    for v in relevant_verses:
        verse_references.append(f"""
Verse {v['verse_id']} (Chapter {v['chapter']}, Verse {v['verse']})
Sanskrit: {v['sanskrit']}
Translation: {v['translation']}
Commentary: {v['commentary']}
Relevance: {v.get('relevance_to_question', '')}
""")

    context_note = ""
    if context_data.get("has_previous_context"):
        context_note = f"\nPrevious Context: {context_data.get('context_summary')}\n"

    prompt = f"""You are a wise spiritual guide well-versed in the Bhagavad Gita. A seeker has asked you a question.

Question: {guide_input.question}
{context_note}
User Level: {level_guidance['user_level']}

Style Guidance: {level_guidance['style']}
Depth Guidance: {level_guidance['depth']}
Tone: {level_guidance['tone']}

Relevant Bhagavad Gita Verses:
{''.join(verse_references)}

Provide a comprehensive spiritual teaching that:
1. Directly addresses the question with wisdom from the Gita
2. References the relevant verses naturally in the explanation
3. Provides practical application for modern life
4. Is appropriate for the user's knowledge level
5. Offers deep insight while remaining accessible

IMPORTANT: Respond ONLY with valid JSON. Use \\n for newlines within strings, not actual line breaks.

Format:
{{
  "executive_summary": "1-2 sentence overview",
  "answer": "Main teaching (3-5 paragraphs with \\n\\n between paragraphs)",
  "explanation": "Practical application (2-3 paragraphs with \\n\\n between paragraphs)",
  "related_topics": ["topic1", "topic2", "topic3"]
}}"""

    response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=MAX_TOKENS,
        temperature=TEMPERATURE,
        messages=[{"role": "user", "content": prompt}]
    )

    response_text = response.content[0].text
    if "```json" in response_text:
        response_text = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        response_text = response_text.split("```")[1].split("```")[0].strip()

    try:
        teaching_data = json.loads(response_text)
    except json.JSONDecodeError as e:
        # If JSON parsing fails, try to extract key parts manually
        print(f"Warning: JSON parsing failed, attempting fallback. Error: {e}")
        print(f"Response text preview: {response_text[:500]}")
        # Use a simpler fallback structure
        teaching_data = {
            "executive_summary": "The Gita teaches performing duty without attachment to results (Nishkama Karma).",
            "answer": response_text[:1000],  # Use first part of response
            "explanation": "This principle of Karma Yoga guides us to focus on our actions while surrendering outcomes.",
            "related_topics": ["Karma Yoga", "Nishkama Karma", "Detachment"]
        }

    step_end = datetime.utcnow()
    duration_ms = int((step_end - step_start).total_seconds() * 1000)

    execution_step = ExecutionStep(
        step_number=5,
        step_name="Formulate Teaching",
        step_type="synthesis",
        details={
            "verses_referenced": len(relevant_verses),
            "answer_length": len(teaching_data.get("answer", "")),
            "user_level": level_guidance["user_level"]
        },
        duration_ms=duration_ms
    )

    return teaching_data, execution_step


def step_6_suggest_next_steps(
    guide_input: GitaGuideInput,
    teaching_data: Dict[str, Any],
    relevant_verses: List[Dict],
    execution_trace: List[Dict]
) -> tuple[GitaGuideOutput, ExecutionStep]:
    """
    Step 6: Suggest Next Steps - Propose related topics and follow-up questions.
    """
    step_start = datetime.utcnow()

    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    prompt = f"""Based on this spiritual teaching, suggest 3-5 follow-up questions that would deepen the seeker's understanding.

Original Question: {guide_input.question}
Teaching Summary: {teaching_data.get('executive_summary')}
Related Topics: {', '.join(teaching_data.get('related_topics', []))}

Create questions that:
1. Build naturally from this teaching
2. Explore related concepts from the Gita
3. Help the seeker apply these teachings more deeply
4. Encourage progressive spiritual development

Respond in JSON format:
{{
  "suggested_questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?"
  ]
}}

Provide 3-5 questions."""

    response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=500,
        temperature=TEMPERATURE,
        messages=[{"role": "user", "content": prompt}]
    )

    response_text = response.content[0].text
    if "```json" in response_text:
        response_text = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        response_text = response_text.split("```")[1].split("```")[0].strip()

    next_steps_data = json.loads(response_text)

    # Convert verse dicts to Verse Pydantic models
    verse_models = []
    for v in relevant_verses:
        verse_models.append(Verse(
            chapter=v["chapter"],
            verse_number=v["verse"],
            verse_id=v["verse_id"],
            sanskrit_text=v["sanskrit"],
            transliteration=v["transliteration"],
            english_translation=v["translation"],
            relevance_to_question=v.get("relevance_to_question", "")
        ))

    # Create final output
    output = GitaGuideOutput(
        question=guide_input.question,
        executive_summary=teaching_data.get("executive_summary", ""),
        answer=teaching_data.get("answer", ""),
        relevant_verses=verse_models,
        explanation=teaching_data.get("explanation", ""),
        related_topics=teaching_data.get("related_topics", []),
        suggested_next_questions=next_steps_data.get("suggested_questions", []),
        execution_trace=execution_trace
    )

    step_end = datetime.utcnow()
    duration_ms = int((step_end - step_start).total_seconds() * 1000)

    execution_step = ExecutionStep(
        step_number=6,
        step_name="Suggest Next Steps",
        step_type="guidance",
        details={
            "suggested_questions_count": len(next_steps_data.get("suggested_questions", [])),
            "related_topics_count": len(teaching_data.get("related_topics", []))
        },
        duration_ms=duration_ms
    )

    return output, execution_step
