"""
Workflow Step Functions for Article Enhancer Agent

This module contains the 7-step workflow implementation:
- Step 1: Analyze Structure (evaluate organization and clarity)
- Step 2: Identify Claims (extract claims needing references)
- Step 3: Search References (Tavily API for authoritative sources)
- Step 4: Find Examples (search for real-world examples)
- Step 5: Analyze Flow (evaluate transitions and coherence)
- Step 6: Generate Suggestions (create structured recommendations)
- Step 7: Produce Enhanced Version (generate improved article)

Each step logs execution details, timing, and results to the execution trace.

Article Enhancement Guidelines:
1. Each article should have a TLDR
2. Each article examples should be highlighted bold
3. Pull SEO (optimize for keywords)
4. Ensure articles have a Key Learnings segment
5. Edits should retain human tone
6. Each Paragraph should have appropriate heading

Implementation: Epic 8, Story 8.3
"""

import os
import time
import json
import re
from typing import Dict, List, Any, Tuple
from datetime import datetime

from langchain_anthropic import ChatAnthropic
from langchain.schema import HumanMessage, SystemMessage

from .constants import AGENT_SLUG
from .models import (
    ArticleEnhancerInput,
    ArticleEnhancerOutput,
    StructuralChange,
    Reference,
    Example,
    FlowImprovement,
    BeforeAfterMetrics,
)


# =============================================================================
# EXECUTION STEP MODEL
# =============================================================================

class ExecutionStep:
    """Execution step for logging to execution trace."""
    def __init__(
        self,
        step_number: int,
        step_name: str,
        step_type: str,
        input_summary: str,
        output_summary: str,
        details: Dict[str, Any],
        duration_ms: int,
        timestamp: str
    ):
        self.step_number = step_number
        self.step_name = step_name
        self.step_type = step_type
        self.input_summary = input_summary
        self.output_summary = output_summary
        self.details = details
        self.duration_ms = duration_ms
        self.timestamp = timestamp

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step_number": self.step_number,
            "step_name": self.step_name,
            "step_type": self.step_type,
            "input_summary": self.input_summary,
            "output_summary": self.output_summary,
            "details": self.details,
            "duration_ms": self.duration_ms,
            "timestamp": self.timestamp,
        }


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def calculate_metrics(text: str, target_keywords: List[str]) -> Dict[str, Any]:
    """
    Calculate various metrics for article text.

    Returns dict with word_count, paragraph_count, headings_count,
    examples_count, readability_score, seo_score, claims_with_references
    """
    # Word count
    word_count = len(text.split())

    # Paragraph count (separated by double newlines or single newlines with blank lines)
    paragraphs = [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]
    paragraph_count = len(paragraphs)

    # Heading count (lines starting with # or lines in all caps)
    headings = re.findall(r'^#+\s+.+$|^[A-Z][A-Z\s]{10,}$', text, re.MULTILINE)
    headings_count = len(headings)

    # Examples count (text containing "for example", "for instance", or bold markers)
    examples_count = len(re.findall(r'\b(for example|for instance|e\.g\.|such as)\b|(\*\*.*?\*\*)', text, re.IGNORECASE))

    # Readability score (simplified Flesch Reading Ease approximation)
    # Score 0-100 where higher is easier to read
    sentences = len(re.findall(r'[.!?]+', text))
    if sentences == 0:
        sentences = 1
    words = len(text.split())
    syllables = sum(len(re.findall(r'[aeiouy]+', word, re.IGNORECASE)) for word in text.split())

    avg_sentence_length = words / sentences
    avg_syllables_per_word = syllables / words if words > 0 else 0
    readability_score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
    readability_score = max(0, min(100, readability_score))  # Clamp to 0-100

    # SEO score (keyword density and presence)
    # Score 0-100 based on keyword presence and distribution
    seo_score = 0.0
    if target_keywords:
        text_lower = text.lower()
        keyword_occurrences = sum(text_lower.count(kw.lower()) for kw in target_keywords)
        # Optimal keyword density is 1-3% of total words
        keyword_density = (keyword_occurrences / words * 100) if words > 0 else 0

        # Score based on presence and reasonable density
        if keyword_density >= 1.0 and keyword_density <= 3.0:
            seo_score = 90.0  # Optimal
        elif keyword_density > 0 and keyword_density < 1.0:
            seo_score = 50.0 + (keyword_density * 40)  # Acceptable but low
        elif keyword_density > 3.0 and keyword_density < 5.0:
            seo_score = 70.0  # Slightly over-optimized
        elif keyword_density >= 5.0:
            seo_score = 40.0  # Over-optimized
        else:
            seo_score = 20.0  # No keywords

    # Claims with references (approximate by counting citations: [text](url) or [number])
    claims_with_references = len(re.findall(r'\[.*?\]\(.*?\)|\[\d+\]', text))

    return {
        "word_count": word_count,
        "paragraph_count": paragraph_count,
        "headings_count": headings_count,
        "examples_count": examples_count,
        "readability_score": round(readability_score, 1),
        "seo_score": round(seo_score, 1),
        "claims_with_references": claims_with_references,
    }


# =============================================================================
# STEP 1: ANALYZE STRUCTURE
# =============================================================================

def step_1_analyze_structure(
    article_input: ArticleEnhancerInput
) -> Tuple[Dict[str, Any], ExecutionStep]:
    """
    Step 1: Analyze article structure, organization, and clarity.

    Uses Claude to evaluate current structure and identify areas for improvement.

    Returns:
        Tuple of (structure_analysis dict, ExecutionStep)
    """
    start_time = time.time()

    # Initialize Claude LLM
    llm = ChatAnthropic(
        model="claude-3-haiku-20240307",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        temperature=0.3,
    )

    # Build analysis prompt
    system_prompt = """You are an expert content editor analyzing article structure.

Your task is to evaluate the article's organization, clarity, and overall structure.

Analyze:
1. Current structure (introduction, body, conclusion)
2. Logical flow and organization
3. Paragraph structure and length
4. Heading usage and hierarchy
5. Overall clarity and readability
6. Missing elements (TLDR, Key Learnings, etc.)"""

    human_prompt = f"""Analyze the structure of this article:

ARTICLE TEXT:
{article_input.original_text[:4000]}

TARGET AUDIENCE: {article_input.target_audience}
ENHANCEMENT FOCUS: {', '.join(article_input.enhancement_focus)}

Return analysis in JSON format:
{{
  "has_clear_introduction": true/false,
  "has_clear_conclusion": true/false,
  "has_tldr": true/false,
  "has_key_learnings": true/false,
  "paragraph_structure": "description of paragraph quality",
  "heading_usage": "description of heading usage",
  "structural_issues": ["issue 1", "issue 2"],
  "recommended_sections": ["section to add 1", "section to add 2"]
}}

IMPORTANT: Return ONLY the JSON object, no additional text."""

    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt),
        ]

        response = llm.invoke(messages)
        response_text = response.content

        # Try to extract JSON from response (sometimes Claude wraps it in markdown)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        # Parse JSON response with lenient parsing
        try:
            structure_analysis = json.loads(response_text)
        except json.JSONDecodeError:
            structure_analysis = json.loads(response_text, strict=False)

        duration_ms = int((time.time() - start_time) * 1000)

        execution_step = ExecutionStep(
            step_number=1,
            step_name="Analyze Structure",
            step_type="structure_analysis",
            input_summary=f"Article: {len(article_input.original_text)} characters, Target: {article_input.target_audience}",
            output_summary=f"Identified {len(structure_analysis.get('structural_issues', []))} structural issues",
            details={
                "input_parameters": article_input.model_dump(),
                "structure_analysis": structure_analysis,
                "llm_model": "claude-3-haiku-20240307",
                "temperature": 0.3,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

        return structure_analysis, execution_step

    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        execution_step = ExecutionStep(
            step_number=1,
            step_name="Analyze Structure",
            step_type="structure_analysis",
            input_summary=f"Article: {len(article_input.original_text)} characters",
            output_summary=f"ERROR: {str(e)}",
            details={
                "error": str(e),
                "error_type": type(e).__name__,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        raise Exception(f"Step 1 (Analyze Structure) failed: {e}") from e


# =============================================================================
# STEP 2: IDENTIFY CLAIMS
# =============================================================================

def step_2_identify_claims(
    article_text: str
) -> Tuple[List[Dict[str, str]], ExecutionStep]:
    """
    Step 2: Identify factual claims that need references.

    Uses Claude to extract claims that would benefit from citations.

    Returns:
        Tuple of (claims list, ExecutionStep)
    """
    start_time = time.time()

    # Initialize Claude LLM
    llm = ChatAnthropic(
        model="claude-3-haiku-20240307",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        temperature=0.3,
    )

    system_prompt = """You are an expert fact-checker identifying claims that need citations.

Your task is to identify factual claims, statistics, or statements that would benefit from authoritative references.

Guidelines:
- Focus on verifiable facts and statistics
- Identify claims about research, studies, or data
- Note industry-specific statements
- Prioritize claims that readers might question
- Limit to 5-8 most important claims"""

    human_prompt = f"""Identify factual claims in this article that need references:

ARTICLE TEXT:
{article_text[:5000]}

Return claims in JSON format:
{{
  "claims": [
    {{
      "claim_text": "The specific claim needing a reference",
      "context": "Brief context where this appears",
      "claim_type": "statistic/research/industry_fact/expert_opinion"
    }}
  ]
}}

IMPORTANT: Return ONLY the JSON object, no additional text."""

    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt),
        ]

        response = llm.invoke(messages)
        response_text = response.content

        # Try to extract JSON from response (sometimes Claude wraps it in markdown)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        # Parse JSON response with lenient parsing
        try:
            claims_data = json.loads(response_text)
        except json.JSONDecodeError:
            claims_data = json.loads(response_text, strict=False)
        claims = claims_data.get("claims", [])

        duration_ms = int((time.time() - start_time) * 1000)

        execution_step = ExecutionStep(
            step_number=2,
            step_name="Identify Claims",
            step_type="claim_identification",
            input_summary=f"Analyzing {len(article_text)} characters for claims",
            output_summary=f"Identified {len(claims)} claims needing references",
            details={
                "claims_identified": len(claims),
                "claims": claims,
                "llm_model": "claude-3-haiku-20240307",
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

        return claims, execution_step

    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        execution_step = ExecutionStep(
            step_number=2,
            step_name="Identify Claims",
            step_type="claim_identification",
            input_summary=f"Analyzing article for claims",
            output_summary=f"ERROR: {str(e)}",
            details={
                "error": str(e),
                "error_type": type(e).__name__,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        raise Exception(f"Step 2 (Identify Claims) failed: {e}") from e


# =============================================================================
# STEP 3: SEARCH REFERENCES (TAVILY API)
# =============================================================================

def step_3_search_references(
    claims: List[Dict[str, str]],
    target_keywords: List[str]
) -> Tuple[List[Dict[str, Any]], ExecutionStep]:
    """
    Step 3: Search for authoritative references using Tavily API.

    Searches for sources to support identified claims.

    Returns:
        Tuple of (references list, ExecutionStep)
    """
    start_time = time.time()

    # Check if Tavily API key is available
    tavily_api_key = os.getenv("TAVILY_API_KEY")

    if not tavily_api_key:
        # No Tavily key - skip search
        duration_ms = int((time.time() - start_time) * 1000)
        execution_step = ExecutionStep(
            step_number=3,
            step_name="Search References",
            step_type="reference_search",
            input_summary=f"{len(claims)} claims to research",
            output_summary="Skipped: TAVILY_API_KEY not configured (optional for MVP)",
            details={
                "tavily_available": False,
                "claims_count": len(claims),
                "note": "Reference search requires TAVILY_API_KEY environment variable",
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        return [], execution_step

    # Import Tavily client
    from tavily import TavilyClient

    tavily_client = TavilyClient(api_key=tavily_api_key)
    all_references = []

    try:
        # Search for references for each claim (limit to top 5 claims)
        for claim_data in claims[:5]:
            claim_text = claim_data.get("claim_text", "")

            # Build search query
            search_query = claim_text
            if target_keywords:
                search_query = f"{claim_text} {' '.join(target_keywords[:2])}"

            try:
                # Call Tavily API
                search_response = tavily_client.search(
                    query=search_query,
                    search_depth="basic",
                    max_results=3,
                )

                # Extract results
                results = search_response.get("results", [])

                for result in results:
                    all_references.append({
                        "claim": claim_text,
                        "source_title": result.get("title", ""),
                        "source_url": result.get("url", ""),
                        "content_snippet": result.get("content", "")[:200],
                        "score": result.get("score", 0.0),
                    })

            except Exception as e:
                print(f"Warning: Tavily search failed for claim '{claim_text[:50]}...': {e}")
                continue

        duration_ms = int((time.time() - start_time) * 1000)

        execution_step = ExecutionStep(
            step_number=3,
            step_name="Search References",
            step_type="reference_search",
            input_summary=f"Searching references for {len(claims)} claims",
            output_summary=f"Found {len(all_references)} potential references from Tavily",
            details={
                "claims_searched": min(len(claims), 5),
                "references_found": len(all_references),
                "references": all_references,
                "search_depth": "basic",
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

        return all_references, execution_step

    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        execution_step = ExecutionStep(
            step_number=3,
            step_name="Search References",
            step_type="reference_search",
            input_summary=f"Searching references for {len(claims)} claims",
            output_summary=f"ERROR: {str(e)}",
            details={
                "error": str(e),
                "error_type": type(e).__name__,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        raise Exception(f"Step 3 (Search References) failed: {e}") from e


# =============================================================================
# STEP 4: FIND EXAMPLES
# =============================================================================

def step_4_find_examples(
    article_text: str,
    target_audience: str,
    structure_analysis: Dict[str, Any]
) -> Tuple[List[Dict[str, str]], ExecutionStep]:
    """
    Step 4: Find or suggest real-world examples to add to the article.

    Uses Claude to identify where examples would enhance understanding.

    Returns:
        Tuple of (examples list, ExecutionStep)
    """
    start_time = time.time()

    # Initialize Claude LLM
    llm = ChatAnthropic(
        model="claude-3-haiku-20240307",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        temperature=0.5,
    )

    system_prompt = """You are an expert content editor suggesting examples for articles.

Your task is to identify where real-world examples would enhance understanding and engagement.

Guidelines:
- Suggest specific, concrete examples
- Match examples to target audience
- Focus on practical, relatable scenarios
- Examples should illustrate key concepts
- Limit to 3-5 high-impact examples"""

    human_prompt = f"""Suggest examples to enhance this article:

ARTICLE TEXT:
{article_text[:3000]}

TARGET AUDIENCE: {target_audience}

Return examples in JSON format:
{{
  "examples": [
    {{
      "location": "Where to add this example (section/paragraph)",
      "concept": "The concept this example illustrates",
      "example_text": "The specific example to add",
      "rationale": "Why this example helps"
    }}
  ]
}}

IMPORTANT: Return ONLY the JSON object, no additional text."""

    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt),
        ]

        response = llm.invoke(messages)
        response_text = response.content

        # Try to extract JSON from response (sometimes Claude wraps it in markdown)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        # Parse JSON response with lenient parsing
        try:
            examples_data = json.loads(response_text)
        except json.JSONDecodeError:
            examples_data = json.loads(response_text, strict=False)
        examples = examples_data.get("examples", [])

        duration_ms = int((time.time() - start_time) * 1000)

        execution_step = ExecutionStep(
            step_number=4,
            step_name="Find Examples",
            step_type="example_identification",
            input_summary=f"Analyzing article for example opportunities, audience: {target_audience}",
            output_summary=f"Identified {len(examples)} examples to add (Rule 2: will be bolded)",
            details={
                "examples_identified": len(examples),
                "examples": examples,
                "target_audience": target_audience,
                "llm_model": "claude-3-haiku-20240307",
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

        return examples, execution_step

    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        execution_step = ExecutionStep(
            step_number=4,
            step_name="Find Examples",
            step_type="example_identification",
            input_summary=f"Analyzing article for examples",
            output_summary=f"ERROR: {str(e)}",
            details={
                "error": str(e),
                "error_type": type(e).__name__,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        raise Exception(f"Step 4 (Find Examples) failed: {e}") from e


# =============================================================================
# STEP 5: ANALYZE FLOW
# =============================================================================

def step_5_analyze_flow(
    article_text: str
) -> Tuple[List[Dict[str, str]], ExecutionStep]:
    """
    Step 5: Analyze article flow, transitions, and coherence.

    Uses Claude to evaluate logical progression and identify flow issues.

    Returns:
        Tuple of (flow_improvements list, ExecutionStep)
    """
    start_time = time.time()

    # Initialize Claude LLM
    llm = ChatAnthropic(
        model="claude-3-haiku-20240307",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        temperature=0.3,
    )

    system_prompt = """You are an expert content editor analyzing article flow and coherence.

Your task is to evaluate transitions, logical progression, and overall flow.

Analyze:
1. Transitions between paragraphs
2. Logical progression of ideas
3. Coherence and connection between sections
4. Redundant or disconnected content
5. Missing transitions or bridges"""

    human_prompt = f"""Analyze the flow of this article:

ARTICLE TEXT:
{article_text[:5000]}

Return analysis in JSON format:
{{
  "flow_improvements": [
    {{
      "location": "Where the issue occurs",
      "issue_type": "weak_transition/logical_gap/redundancy/disconnection",
      "description": "Description of the flow issue",
      "suggestion": "How to improve the flow"
    }}
  ]
}}

IMPORTANT: Return ONLY the JSON object, no additional text."""

    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt),
        ]

        response = llm.invoke(messages)
        response_text = response.content

        # Try to extract JSON from response (sometimes Claude wraps it in markdown)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        # Parse JSON response with lenient parsing
        try:
            flow_data = json.loads(response_text)
        except json.JSONDecodeError:
            flow_data = json.loads(response_text, strict=False)
        flow_improvements = flow_data.get("flow_improvements", [])

        duration_ms = int((time.time() - start_time) * 1000)

        execution_step = ExecutionStep(
            step_number=5,
            step_name="Analyze Flow",
            step_type="flow_analysis",
            input_summary=f"Analyzing article flow and coherence",
            output_summary=f"Identified {len(flow_improvements)} flow improvements",
            details={
                "flow_improvements_count": len(flow_improvements),
                "flow_improvements": flow_improvements,
                "llm_model": "claude-3-haiku-20240307",
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

        return flow_improvements, execution_step

    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        execution_step = ExecutionStep(
            step_number=5,
            step_name="Analyze Flow",
            step_type="flow_analysis",
            input_summary=f"Analyzing article flow",
            output_summary=f"ERROR: {str(e)}",
            details={
                "error": str(e),
                "error_type": type(e).__name__,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        raise Exception(f"Step 5 (Analyze Flow) failed: {e}") from e


# =============================================================================
# STEP 6: GENERATE SUGGESTIONS
# =============================================================================

def step_6_generate_suggestions(
    structure_analysis: Dict[str, Any],
    claims: List[Dict[str, str]],
    references: List[Dict[str, Any]],
    examples: List[Dict[str, str]],
    flow_improvements: List[Dict[str, str]],
    article_input: ArticleEnhancerInput
) -> Tuple[Dict[str, Any], ExecutionStep]:
    """
    Step 6: Generate structured improvement recommendations.

    Consolidates all analysis into actionable suggestions.

    Returns:
        Tuple of (suggestions dict, ExecutionStep)
    """
    start_time = time.time()

    # Consolidate all findings
    suggestions = {
        "structural_changes": [],
        "add_references": [],
        "add_examples": [],
        "flow_improvements": [],
        "seo_improvements": [],
        "compliance_checklist": {
            "needs_tldr": not structure_analysis.get("has_tldr", False),
            "needs_key_learnings": not structure_analysis.get("has_key_learnings", False),
            "needs_more_headings": len(structure_analysis.get("structural_issues", [])) > 0,
            "needs_bold_examples": len(examples) > 0,
            "needs_seo_optimization": len(article_input.target_keywords) > 0,
        }
    }

    # Structural changes from Step 1
    for issue in structure_analysis.get("structural_issues", []):
        suggestions["structural_changes"].append({
            "change_type": "structure_improvement",
            "description": issue,
            "priority": "high"
        })

    # References from Step 3
    for ref in references[:8]:  # Limit to top 8
        suggestions["add_references"].append({
            "claim": ref.get("claim", ""),
            "source": ref.get("source_title", ""),
            "url": ref.get("source_url", ""),
        })

    # Examples from Step 4
    for ex in examples:
        suggestions["add_examples"].append({
            "location": ex.get("location", ""),
            "example": ex.get("example_text", ""),
            "rationale": ex.get("rationale", ""),
        })

    # Flow improvements from Step 5
    for flow in flow_improvements:
        suggestions["flow_improvements"].append({
            "location": flow.get("location", ""),
            "issue": flow.get("description", ""),
            "suggestion": flow.get("suggestion", ""),
        })

    # SEO improvements
    if article_input.target_keywords:
        suggestions["seo_improvements"] = [
            f"Optimize for keywords: {', '.join(article_input.target_keywords[:5])}",
            "Ensure keywords appear in headings and first paragraph",
            "Maintain 1-3% keyword density throughout article",
        ]

    duration_ms = int((time.time() - start_time) * 1000)

    execution_step = ExecutionStep(
        step_number=6,
        step_name="Generate Suggestions",
        step_type="suggestion_generation",
        input_summary=f"Consolidating findings: {len(structure_analysis.get('structural_issues', []))} structural, {len(references)} references, {len(examples)} examples",
        output_summary=f"Generated {len(suggestions['structural_changes'])} structural, {len(suggestions['add_references'])} reference, {len(suggestions['add_examples'])} example suggestions",
        details={
            "suggestions": suggestions,
            "total_suggestions": sum([
                len(suggestions["structural_changes"]),
                len(suggestions["add_references"]),
                len(suggestions["add_examples"]),
                len(suggestions["flow_improvements"]),
            ]),
        },
        duration_ms=duration_ms,
        timestamp=datetime.utcnow().isoformat() + "Z",
    )

    return suggestions, execution_step


# =============================================================================
# STEP 7: PRODUCE ENHANCED VERSION
# =============================================================================

def step_7_produce_enhanced_version(
    article_input: ArticleEnhancerInput,
    suggestions: Dict[str, Any],
    claims: List[Dict[str, str]],
    references: List[Dict[str, Any]],
    examples: List[Dict[str, str]]
) -> Tuple[ArticleEnhancerOutput, ExecutionStep]:
    """
    Step 7: Generate enhanced article with all improvements applied.

    Uses Claude to produce the final enhanced version following all 6 rules.

    Returns:
        Tuple of (ArticleEnhancerOutput, ExecutionStep)
    """
    start_time = time.time()

    # Initialize Claude LLM with max tokens for long responses
    llm = ChatAnthropic(
        model="claude-3-haiku-20240307",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        temperature=0.5,
        max_tokens=4096,  # Increased from default for longer articles
    )

    # Calculate before metrics
    before_metrics = calculate_metrics(article_input.original_text, article_input.target_keywords)

    # Build comprehensive enhancement prompt
    system_prompt = """You are an expert content editor creating an enhanced article version.

CRITICAL ENHANCEMENT RULES (ALL 6 MUST BE APPLIED):
1. Add a 2-3 sentence TLDR at the very beginning
2. Bold ALL examples using **double asterisks**
3. Optimize for SEO keywords throughout (1-3% density)
4. Add a "Key Learnings" section at the end with bullet points
5. Retain human tone - keep natural, conversational language
6. Add appropriate headings to EVERY major paragraph/section

Your task is to produce a complete, enhanced article that implements ALL suggestions while following ALL 6 rules above."""

    # Format suggestions for prompt
    structural_changes_text = "\n".join(f"- {sc['description']}" for sc in suggestions.get("structural_changes", []))
    references_text = "\n".join(f"- Add reference for: {ref['claim'][:100]}" for ref in suggestions.get("add_references", [])[:5])
    examples_text = "\n".join(f"- Add example: {ex['example'][:100]}" for ex in suggestions.get("add_examples", [])[:5])
    flow_text = "\n".join(f"- {fi['suggestion'][:100]}" for fi in suggestions.get("flow_improvements", [])[:5])

    human_prompt = f"""Enhance this article following ALL 6 RULES and implementing the suggestions below:

ORIGINAL ARTICLE:
{article_input.original_text[:4000]}

TARGET AUDIENCE: {article_input.target_audience}
TARGET KEYWORDS: {', '.join(article_input.target_keywords) if article_input.target_keywords else 'None'}
TONE: {article_input.tone}
WORD LIMIT: {article_input.word_limit if article_input.word_limit else 'None specified'}

STRUCTURAL IMPROVEMENTS:
{structural_changes_text if structural_changes_text else 'None'}

REFERENCES TO ADD:
{references_text if references_text else 'None'}

EXAMPLES TO ADD (MUST BE BOLDED):
{examples_text if examples_text else 'None'}

FLOW IMPROVEMENTS:
{flow_text if flow_text else 'None'}

SEO IMPROVEMENTS:
{chr(10).join(suggestions.get('seo_improvements', [])) if suggestions.get('seo_improvements') else 'None'}

Return the enhanced article in JSON format:
{{
  "tldr": "2-3 sentence TLDR (Rule 1)",
  "enhanced_article": "Full enhanced article text with ALL 6 rules applied. IMPORTANT: This field should ONLY contain the article text itself, not the metadata sections below.",
  "key_learnings": ["Learning 1", "Learning 2", "Learning 3"],
  "structural_changes_made": [
    {{"section": "Section", "change_type": "added_heading", "description": "What changed", "rationale": "Why"}}
  ],
  "added_references": [
    {{"claim": "Claim", "source_title": "Source", "source_url": "URL", "relevance": "Why relevant"}}
  ],
  "added_examples": [
    {{"context": "Where added", "example_text": "Example (bolded in article)", "purpose": "Purpose"}}
  ],
  "flow_improvements_made": [
    {{"location": "Where", "improvement_type": "transition_added", "description": "What improved"}}
  ],
  "seo_analysis": "Brief analysis of SEO optimization applied",
  "tone_preservation_notes": "How human tone was retained",
  "editor_notes": "Overall commentary on enhancements"
}}

CRITICAL: The "enhanced_article" field should contain ONLY the enhanced article text. The "Key Learnings" section must be included in the enhanced_article text itself, AND also listed in the "key_learnings" array separately. Do NOT include metadata like "Structural Changes Made", "Added Examples", "Flow Improvements", "SEO Analysis", "Tone Preservation Notes", or "Editor Notes" in the enhanced_article text - those belong in their respective JSON fields OUTSIDE the enhanced_article field.

IMPORTANT:
- Return ONLY the JSON object, no additional text
- MUST include TLDR at start (Rule 1)
- MUST bold examples with **double asterisks** (Rule 2)
- MUST optimize for keywords (Rule 3)
- MUST include Key Learnings section (Rule 4)
- MUST retain human tone (Rule 5)
- MUST add headings to paragraphs (Rule 6)"""

    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt),
        ]

        response = llm.invoke(messages)
        response_text = response.content

        # Try to extract JSON from response (sometimes Claude wraps it in markdown)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        # Fix common JSON issues: unescaped quotes and newlines within string values
        # This is a heuristic fix - not perfect but helps with Claude's output
        import re
        def fix_json_string_escaping(text):
            # Find the enhanced_article field value and fix escaping issues
            # Look for pattern: "enhanced_article": "..." where content goes until next field or end
            # The .*? will match everything including newlines until we hit the closing pattern

            # First, try to find where enhanced_article starts and ends
            start_pattern = r'"enhanced_article":\s*"'
            # Look for end - either next field starts or we hit closing brace
            end_patterns = [
                r'"\s*,\s*"key_learnings"',
                r'"\s*,\s*"structural_changes"',
                r'"\s*,\s*"added_references"',
                r'"\s*}$'
            ]

            start_match = re.search(start_pattern, text)
            if not start_match:
                return text  # enhanced_article not found

            start_pos = start_match.end()

            # Find the end position
            end_pos = None
            matched_ending = None
            for end_pat in end_patterns:
                end_match = re.search(end_pat, text[start_pos:], re.MULTILINE)
                if end_match:
                    end_pos = start_pos + end_match.start()
                    matched_ending = end_match.group(0)
                    break

            if end_pos is None:
                return text  # Couldn't find end

            # Extract the content between start and end
            content = text[start_pos:end_pos]

            # Fix escaping in content
            # First mark already escaped quotes
            fixed_content = content.replace(r'\"', '\x00ESCAPED_QUOTE\x00')
            # Then escape all remaining unescaped quotes
            fixed_content = fixed_content.replace('"', r'\"')
            # Restore the already-escaped quotes
            fixed_content = fixed_content.replace('\x00ESCAPED_QUOTE\x00', r'\"')

            # Escape newlines and control characters
            fixed_content = fixed_content.replace('\n', r'\n')
            fixed_content = fixed_content.replace('\r', r'\r')
            fixed_content = fixed_content.replace('\t', r'\t')

            # Rebuild the JSON
            result = text[:start_pos] + fixed_content + matched_ending + text[start_pos + len(content) + len(matched_ending):]
            return result

        response_text = fix_json_string_escaping(response_text)

        # Parse JSON response
        try:
            # First try standard JSON parsing
            enhanced_data = json.loads(response_text)
        except json.JSONDecodeError as e:
            # If it fails due to control characters, try with strict=False
            try:
                enhanced_data = json.loads(response_text, strict=False)
            except json.JSONDecodeError:
                # If that still fails, print the error and raw response for debugging
                print(f"\nWarning: JSON parse error: {e}")
                print(f"Raw response length: {len(response_text)} characters")
                print(f"First 1000 chars: {response_text[:1000]}")
                # Try to save the raw response for manual inspection
                with open("/tmp/failed_json_response.txt", "w") as f:
                    f.write(response_text)
                print(f"Saved full response to /tmp/failed_json_response.txt")
                raise

        # Calculate after metrics
        enhanced_article_text = enhanced_data.get("enhanced_article", article_input.original_text)
        after_metrics = calculate_metrics(enhanced_article_text, article_input.target_keywords)

        # Create BeforeAfterMetrics model
        before_after_metrics = BeforeAfterMetrics(
            word_count_before=before_metrics["word_count"],
            word_count_after=after_metrics["word_count"],
            readability_score_before=before_metrics["readability_score"],
            readability_score_after=after_metrics["readability_score"],
            paragraph_count_before=before_metrics["paragraph_count"],
            paragraph_count_after=after_metrics["paragraph_count"],
            headings_before=before_metrics["headings_count"],
            headings_after=after_metrics["headings_count"],
            examples_before=before_metrics["examples_count"],
            examples_after=after_metrics["examples_count"],
            seo_score_before=before_metrics["seo_score"],
            seo_score_after=after_metrics["seo_score"],
            claims_with_references_before=before_metrics["claims_with_references"],
            claims_with_references_after=after_metrics["claims_with_references"],
        )

        # Create Pydantic models from response
        structural_changes_models = [
            StructuralChange(**change) for change in enhanced_data.get("structural_changes_made", [])
        ]

        # added_references may be missing if JSON truncated - make it optional
        added_references_list = enhanced_data.get("added_references", [])
        added_references_models = []
        if added_references_list:
            try:
                added_references_models = [Reference(**ref) for ref in added_references_list]
            except Exception as e:
                print(f"Warning: Could not parse added_references: {e}")

        added_examples_models = [
            Example(**ex) for ex in enhanced_data.get("added_examples", [])
        ]

        flow_improvements_models = [
            FlowImprovement(**fi) for fi in enhanced_data.get("flow_improvements_made", [])
        ]

        # Create enhancement checklist
        enhancement_checklist = {
            "has_tldr": bool(enhanced_data.get("tldr")),
            "examples_bolded": "**" in enhanced_article_text,
            "seo_optimized": after_metrics["seo_score"] > before_metrics["seo_score"],
            "has_key_learnings": len(enhanced_data.get("key_learnings", [])) > 0,
            "human_tone_retained": bool(enhanced_data.get("tone_preservation_notes")),
            "paragraphs_have_headings": after_metrics["headings_count"] > before_metrics["headings_count"],
        }

        # Create executive summary
        executive_summary = f"Enhanced article from {before_metrics['word_count']} to {after_metrics['word_count']} words. " \
                          f"Added {after_metrics['headings_count'] - before_metrics['headings_count']} headings, " \
                          f"{len(added_references_models)} references, and {len(added_examples_models)} examples. " \
                          f"Improved readability from {before_metrics['readability_score']:.1f} to {after_metrics['readability_score']:.1f}. " \
                          f"SEO score improved from {before_metrics['seo_score']:.1f} to {after_metrics['seo_score']:.1f}."

        # Create ArticleEnhancerOutput
        output = ArticleEnhancerOutput(
            tldr=enhanced_data.get("tldr", ""),
            executive_summary=executive_summary,
            original_article=article_input.original_text,
            enhanced_article=enhanced_article_text,
            key_learnings=enhanced_data.get("key_learnings", []),
            structural_changes=structural_changes_models,
            added_references=added_references_models,
            added_examples=added_examples_models,
            flow_improvements=flow_improvements_models,
            before_after_metrics=before_after_metrics,
            seo_analysis=enhanced_data.get("seo_analysis", ""),
            tone_preservation_notes=enhanced_data.get("tone_preservation_notes", ""),
            editor_notes=enhanced_data.get("editor_notes", ""),
            enhancement_checklist=enhancement_checklist,
        )

        duration_ms = int((time.time() - start_time) * 1000)

        # Verify all 6 rules applied
        rules_applied = sum(enhancement_checklist.values())

        execution_step = ExecutionStep(
            step_number=7,
            step_name="Produce Enhanced Version",
            step_type="enhancement",
            input_summary=f"Applying {len(suggestions.get('structural_changes', []))} structural, {len(suggestions.get('add_references', []))} reference suggestions",
            output_summary=f"Generated enhanced article: {after_metrics['word_count']} words, {rules_applied}/6 enhancement rules applied",
            details={
                "before_metrics": before_metrics,
                "after_metrics": after_metrics,
                "enhancement_checklist": enhancement_checklist,
                "rules_applied": rules_applied,
                "structural_changes": len(structural_changes_models),
                "references_added": len(added_references_models),
                "examples_added": len(added_examples_models),
                "flow_improvements": len(flow_improvements_models),
                "llm_model": "claude-3-haiku-20240307",
                "temperature": 0.5,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )

        return output, execution_step

    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        execution_step = ExecutionStep(
            step_number=7,
            step_name="Produce Enhanced Version",
            step_type="enhancement",
            input_summary=f"Attempting to enhance article",
            output_summary=f"ERROR: {str(e)}",
            details={
                "error": str(e),
                "error_type": type(e).__name__,
            },
            duration_ms=duration_ms,
            timestamp=datetime.utcnow().isoformat() + "Z",
        )
        raise Exception(f"Step 7 (Produce Enhanced Version) failed: {e}") from e


# =============================================================================
# MAIN WORKFLOW ORCHESTRATOR
# =============================================================================

def run_article_editor_workflow(
    input_params: ArticleEnhancerInput
) -> Tuple[ArticleEnhancerOutput, List[dict]]:
    """
    Execute the 7-step article enhancement workflow.

    Args:
        input_params: ArticleEnhancerInput with original text and parameters

    Returns:
        Tuple of (ArticleEnhancerOutput, execution_trace)

    Raises:
        Exception: If any critical step fails
    """
    print("📝 Starting Article Enhancement workflow...")
    print(f"   Original text: {len(input_params.original_text)} characters")
    print(f"   Target audience: {input_params.target_audience}")
    print(f"   Enhancement focus: {', '.join(input_params.enhancement_focus)}\n")

    execution_trace = []
    workflow_start_time = time.time()

    try:
        # Step 1: Analyze Structure
        print("Step 1/7: Analyzing article structure...")
        structure_analysis, step1_trace = step_1_analyze_structure(input_params)
        execution_trace.append(step1_trace.to_dict())

        # Step 2: Identify Claims
        print("Step 2/7: Identifying claims needing references...")
        claims, step2_trace = step_2_identify_claims(input_params.original_text)
        execution_trace.append(step2_trace.to_dict())

        # Step 3: Search References
        print("Step 3/7: Searching for authoritative references...")
        references, step3_trace = step_3_search_references(claims, input_params.target_keywords)
        execution_trace.append(step3_trace.to_dict())

        # Step 4: Find Examples
        print("Step 4/7: Finding examples to enhance understanding...")
        examples, step4_trace = step_4_find_examples(
            input_params.original_text,
            input_params.target_audience,
            structure_analysis
        )
        execution_trace.append(step4_trace.to_dict())

        # Step 5: Analyze Flow
        print("Step 5/7: Analyzing article flow and coherence...")
        flow_improvements, step5_trace = step_5_analyze_flow(input_params.original_text)
        execution_trace.append(step5_trace.to_dict())

        # Step 6: Generate Suggestions
        print("Step 6/7: Generating improvement suggestions...")
        suggestions, step6_trace = step_6_generate_suggestions(
            structure_analysis,
            claims,
            references,
            examples,
            flow_improvements,
            input_params
        )
        execution_trace.append(step6_trace.to_dict())

        # Step 7: Produce Enhanced Version
        print("Step 7/7: Producing enhanced article with all 6 rules applied...")
        final_output, step7_trace = step_7_produce_enhanced_version(
            input_params,
            suggestions,
            claims,
            references,
            examples
        )
        execution_trace.append(step7_trace.to_dict())

        # Calculate total workflow time
        workflow_duration = int((time.time() - workflow_start_time) * 1000)
        print(f"\n✓ Workflow completed in {workflow_duration}ms")
        print(f"  Original: {final_output.before_after_metrics.word_count_before} words")
        print(f"  Enhanced: {final_output.before_after_metrics.word_count_after} words")
        print(f"  Enhancement rules applied: {sum(final_output.enhancement_checklist.values())}/6")

        return final_output, execution_trace

    except Exception as e:
        print(f"\n✗ Workflow failed: {e}")
        raise
