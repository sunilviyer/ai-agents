/**
 * TypeScript types for Article Editor Agent
 *
 * Article Enhancement Guidelines:
 * 1. Each article should have a TLDR
 * 2. Each article examples should be highlighted bold
 * 3. Pull SEO (optimize for keywords)
 * 4. Ensure articles have a Key Learnings segment
 * 5. Edits should retain human tone
 * 6. Each Paragraph should have appropriate heading
 */

export interface ArticleEnhancerInput {
  original_text: string;
  target_keywords: string[];
  target_audience: 'general' | 'technical' | 'executive';
  enhancement_focus: string[];
  word_limit: number | null;
  tone: string;
}

export interface StructuralChange {
  section: string;
  change_type: string;
  description: string;
  rationale: string;
}

export interface Reference {
  claim: string;
  source_title: string;
  source_url: string;
  relevance: string;
}

export interface Example {
  context: string;
  example_text: string;
  purpose: string;
}

export interface FlowImprovement {
  location: string;
  improvement_type: string;
  description: string;
}

export interface BeforeAfterMetrics {
  word_count_before: number;
  word_count_after: number;
  readability_score_before: number;
  readability_score_after: number;
  paragraph_count_before: number;
  paragraph_count_after: number;
  headings_before: number;
  headings_after: number;
  examples_before: number;
  examples_after: number;
  seo_score_before: number;
  seo_score_after: number;
  claims_with_references_before: number;
  claims_with_references_after: number;
}

export interface EnhancementChecklist {
  has_tldr: boolean;
  examples_bolded: boolean;
  seo_optimized: boolean;
  has_key_learnings: boolean;
  human_tone_retained: boolean;
  paragraphs_have_headings: boolean;
}

export interface ArticleEnhancerOutput {
  // Rule 1: TLDR
  tldr: string;

  executive_summary: string;

  // Preserved original for comparison
  original_article: string;

  // Enhanced article with all 6 rules applied
  enhanced_article: string;

  // Rule 4: Key Learnings
  key_learnings: string[];

  // Enhancement tracking
  structural_changes: StructuralChange[];
  added_references: Reference[];
  added_examples: Example[];
  flow_improvements: FlowImprovement[];

  // Metrics
  before_after_metrics: BeforeAfterMetrics;

  // Rule 3: SEO Analysis
  seo_analysis: string;

  // Rule 5: Human tone preservation
  tone_preservation_notes: string;

  // Editor notes
  editor_notes: string;

  // Compliance checklist
  enhancement_checklist: EnhancementChecklist;
}
