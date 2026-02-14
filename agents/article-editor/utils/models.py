"""
Pydantic models for Article Editor Agent

Article Enhancement Guidelines:
1. Each article should have a TLDR
2. Each article examples should be highlighted bold
3. Pull SEO (optimize for keywords)
4. Ensure articles have a Key Learnings segment
5. Edits should retain human tone
6. Each Paragraph should have appropriate heading
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class ArticleEnhancerInput(BaseModel):
    """Input parameters for article enhancement"""
    original_text: str = Field(..., description="The draft article to enhance")
    target_keywords: List[str] = Field(default_factory=list, description="SEO keywords to optimize for")
    target_audience: str = Field(default="general", description="Target audience: general, technical, or executive")
    enhancement_focus: List[str] = Field(
        default_factory=lambda: ["clarity", "seo", "examples", "flow", "structure"],
        description="Enhancement focus areas"
    )
    word_limit: Optional[int] = Field(None, description="Optional target word count")
    tone: str = Field(default="professional", description="Desired tone while retaining human quality")


class StructuralChange(BaseModel):
    """Represents a structural change made to the article"""
    section: str = Field(..., description="Section name where change was made")
    change_type: str = Field(..., description="Type of change: heading_added, paragraph_split, reordered, etc.")
    description: str = Field(..., description="What was changed")
    rationale: str = Field(..., description="Why this change improves the article")


class Reference(BaseModel):
    """Represents an added reference/citation"""
    claim: str = Field(..., description="The claim being referenced")
    source_title: str = Field(..., description="Title of the source")
    source_url: str = Field(..., description="URL to the source")
    relevance: str = Field(..., description="Why this reference supports the claim")


class Example(BaseModel):
    """Represents an added or enhanced example"""
    context: str = Field(..., description="Where the example was added")
    example_text: str = Field(..., description="The example content (will be bolded in output)")
    purpose: str = Field(..., description="What this example illustrates")


class FlowImprovement(BaseModel):
    """Represents a flow/coherence improvement"""
    location: str = Field(..., description="Where the improvement was made")
    improvement_type: str = Field(..., description="Type: transition_added, paragraph_reordered, clarity_enhanced")
    description: str = Field(..., description="What was improved")


class BeforeAfterMetrics(BaseModel):
    """Metrics comparing before and after enhancement"""
    word_count_before: int = Field(..., description="Original word count")
    word_count_after: int = Field(..., description="Enhanced word count")
    readability_score_before: float = Field(..., description="Original readability score (0-100)")
    readability_score_after: float = Field(..., description="Enhanced readability score (0-100)")
    paragraph_count_before: int = Field(..., description="Original paragraph count")
    paragraph_count_after: int = Field(..., description="Enhanced paragraph count")
    headings_before: int = Field(..., description="Original heading count")
    headings_after: int = Field(..., description="Enhanced heading count (Rule 6: Each paragraph should have heading)")
    examples_before: int = Field(..., description="Original example count")
    examples_after: int = Field(..., description="Enhanced example count (Rule 2: Examples bolded)")
    seo_score_before: float = Field(..., description="Original SEO score (0-100)")
    seo_score_after: float = Field(..., description="Enhanced SEO score (0-100, Rule 3)")
    claims_with_references_before: int = Field(..., description="Original referenced claims")
    claims_with_references_after: int = Field(..., description="Enhanced referenced claims")


class ArticleEnhancerOutput(BaseModel):
    """Output from article enhancement workflow"""
    # Rule 1: TLDR
    tldr: str = Field(..., description="2-3 sentence TLDR summarizing the article")

    executive_summary: str = Field(..., description="Executive summary of changes made")

    # Preserved original for comparison
    original_article: str = Field(..., description="Original article text preserved for comparison")

    # Enhanced article with all 6 rules applied
    enhanced_article: str = Field(
        ...,
        description="Enhanced article with TLDR, headings, bolded examples, SEO, Key Learnings, and human tone"
    )

    # Rule 4: Key Learnings extracted
    key_learnings: List[str] = Field(
        ...,
        description="Key Learnings segment - main takeaways from the article"
    )

    # Enhancement tracking
    structural_changes: List[StructuralChange] = Field(
        default_factory=list,
        description="Structural changes made (headings, paragraphs, organization)"
    )

    added_references: List[Reference] = Field(
        default_factory=list,
        description="References added to support claims"
    )

    added_examples: List[Example] = Field(
        default_factory=list,
        description="Examples added/enhanced (Rule 2: highlighted bold in enhanced_article)"
    )

    flow_improvements: List[FlowImprovement] = Field(
        default_factory=list,
        description="Flow and coherence improvements"
    )

    # Metrics
    before_after_metrics: BeforeAfterMetrics = Field(
        ...,
        description="Quantitative metrics showing improvement"
    )

    # SEO Analysis (Rule 3)
    seo_analysis: str = Field(
        ...,
        description="SEO optimization analysis - keyword usage, optimization opportunities"
    )

    # Rule 5: Human tone preservation
    tone_preservation_notes: str = Field(
        ...,
        description="Notes on how human tone was retained throughout edits"
    )

    # Editor notes
    editor_notes: str = Field(
        ...,
        description="Overall editor commentary on enhancements and recommendations"
    )

    # Compliance checklist
    enhancement_checklist: dict = Field(
        default_factory=lambda: {
            "has_tldr": False,
            "examples_bolded": False,
            "seo_optimized": False,
            "has_key_learnings": False,
            "human_tone_retained": False,
            "paragraphs_have_headings": False
        },
        description="Checklist confirming all 6 enhancement rules were applied"
    )
