# Agent 4: Article Enhancer

## 1. IDENTITY

| Field | Value |
|-------|-------|
| **Name** | Article Enhancer |
| **Slug** | `article-editor` |
| **Tagline** | "Transform drafts into polished, well-sourced articles" |
| **Type** | Content Enhancement Agent |
| **Icon** | ✍️ |
| **Badge Color** | Purple |

---

## 2. CONCEPT

### What It Does
This agent takes a draft article, analyzes its structure and content, identifies claims that need citations, finds authoritative references, suggests concrete examples, and produces an enhanced version with all improvements integrated.

### Why It's Unique (Agent Archetype)
**Content Enhancement** — The agent's core capability is:
- Analyzing user-provided content (not searching for new topics)
- Evaluating quality across multiple dimensions
- Identifying gaps and weaknesses
- Augmenting with external information
- Producing an improved version of the original

### Value Proposition
"Give me your draft, and I'll analyze its structure, find references for your claims, add relevant examples, and return a polished version ready for publication."

### Demo Approach
**Pre-run only.** You write 5 sample draft articles, run them through the agent, and save the before/after results with full execution traces. Visitors can see the transformation from draft to enhanced article.

---

## 3. INPUT SCHEMA

```typescript
interface ArticleEnhancerInput {
  // The draft content
  article: {
    title: string;
    content: string;                // The draft text (markdown supported)
    word_count?: number;            // Calculated if not provided
  };
  
  // Article metadata
  metadata: {
    article_type: ArticleType;
    target_audience: string;        // e.g., "insurance professionals"
    publication_context?: string;   // e.g., "company blog", "LinkedIn"
    tone?: 'formal' | 'conversational' | 'technical';
  };
  
  // Enhancement options (all default to true)
  enhancements: {
    analyze_structure: boolean;     // Check intro, body, conclusion
    find_references: boolean;       // Find citations for claims
    suggest_examples: boolean;      // Add concrete examples
    improve_clarity: boolean;       // Suggest rewrites for clarity
    add_statistics: boolean;        // Find relevant statistics
    check_flow: boolean;            // Analyze paragraph transitions
  };
}

type ArticleType = 
  | 'blog_post'
  | 'whitepaper'
  | 'report'
  | 'opinion_piece'
  | 'how_to_guide'
  | 'case_study'
  | 'newsletter';
```

### Example Input
```json
{
  "article": {
    "title": "The Rising Threat of Insurance Fraud in the Digital Age",
    "content": "Insurance fraud has always been a problem, but it's getting worse. New technologies make it easier for fraudsters to submit fake claims and create false identities.\n\nCompanies are losing billions every year to fraud. The problem is particularly bad in auto insurance, where staged accidents and inflated claims are common.\n\nArtificial intelligence is helping insurers fight back. Machine learning algorithms can detect suspicious patterns that humans might miss. Many companies are now investing heavily in fraud detection technology.\n\nHowever, technology alone isn't enough. Insurers need a combination of advanced analytics, trained investigators, and public awareness to effectively combat fraud.\n\nThe future of fraud detection lies in collaboration between humans and machines, using the best of both to protect honest policyholders."
  },
  "metadata": {
    "article_type": "blog_post",
    "target_audience": "insurance professionals",
    "publication_context": "company blog",
    "tone": "conversational"
  },
  "enhancements": {
    "analyze_structure": true,
    "find_references": true,
    "suggest_examples": true,
    "improve_clarity": true,
    "add_statistics": true,
    "check_flow": true
  }
}
```

---

## 4. PROCESSING STEPS

| Step # | Name | Type | Description | Example Output |
|--------|------|------|-------------|----------------|
| 1 | **Analyze Structure** | `analysis` | Evaluate intro, body, conclusion, section balance | Structure report |
| 2 | **Identify Claims** | `extraction` | Find statements that need citations | 6 claims identified |
| 3 | **Search References** | `search` | Find authoritative sources for each claim | 8 references found |
| 4 | **Find Examples** | `search` | Search for concrete examples and case studies | 3 examples found |
| 5 | **Analyze Flow** | `analysis` | Check paragraph transitions and logical progression | Flow issues noted |
| 6 | **Generate Suggestions** | `synthesis` | Create improvement recommendations | 12 suggestions |
| 7 | **Produce Enhanced Version** | `synthesis` | Integrate all improvements into final draft | Enhanced article |

### Step Details

**Step 1: Analyze Structure**
```
Input: Article content
Process:
  - Identify introduction (hook, thesis)
  - Identify body sections and their purposes
  - Identify conclusion (summary, call to action)
  - Check section balance (word count distribution)
  - Evaluate heading usage
  - Flag structural issues
Output: Structure analysis with scores and issues
```

**Step 2: Identify Claims**
```
Input: Article content
Process:
  - Parse article into sentences/paragraphs
  - Identify factual assertions (numbers, statistics, trends)
  - Identify causal claims ("X causes Y")
  - Identify comparative claims ("X is better than Y")
  - Identify expert opinions presented as fact
  - Flag each claim's location in text
Output: List of claims with locations and types
```

**Step 3: Search References**
```
Input: Claims list
Process:
  For each claim:
    - Generate search queries
    - Search authoritative sources (academic, industry, government)
    - Evaluate source credibility
    - Extract supporting quotes/data
    - Match references to claims
Output: References mapped to claims
```

**Step 4: Find Examples**
```
Input: Article content + audience
Process:
  - Identify abstract concepts that need illustration
  - Search for real-world case studies
  - Search for concrete examples
  - Match examples to audience (industry-relevant)
  - Select best 2-3 examples to add
Output: Examples with suggested insertion points
```

**Step 5: Analyze Flow**
```
Input: Article content
Process:
  - Check paragraph-to-paragraph transitions
  - Identify logical gaps
  - Check topic sentence clarity
  - Evaluate argument progression
  - Flag abrupt shifts
Output: Flow analysis with specific issues
```

**Step 6: Generate Suggestions**
```
Input: All analysis from Steps 1-5
Process:
  - Compile structural suggestions
  - Compile clarity improvements
  - Compile reference insertions
  - Compile example additions
  - Prioritize by impact
  - Generate natural language recommendations
Output: Prioritized suggestion list
```

**Step 7: Produce Enhanced Version**
```
Input: Original article + all suggestions
Process:
  - Rewrite weak sections
  - Insert references inline (with citations)
  - Add examples at appropriate points
  - Improve transitions
  - Ensure consistent tone
  - Format citations
Output: Complete enhanced article
```

---

## 5. OUTPUT SCHEMA

```typescript
interface ArticleEnhancerOutput {
  // Original vs Enhanced
  original: {
    title: string;
    content: string;
    word_count: number;
  };
  
  enhanced: {
    title: string;                  // May be improved
    content: string;                // Full enhanced article
    word_count: number;
  };
  
  // Analysis results
  analysis: {
    structure: StructureAnalysis;
    claims: ClaimAnalysis[];
    flow: FlowAnalysis;
  };
  
  // Improvements made
  improvements: {
    references_added: ReferenceAdded[];
    examples_added: ExampleAdded[];
    clarity_improvements: ClarityImprovement[];
    structural_changes: string[];
  };
  
  // Summary
  summary: {
    overall_improvement_score: number;  // 0-100
    key_changes: string[];
    word_count_change: number;
    references_count: number;
    examples_count: number;
  };
}

interface StructureAnalysis {
  has_clear_intro: boolean;
  has_clear_conclusion: boolean;
  section_count: number;
  section_balance: 'good' | 'uneven' | 'poor';
  issues: string[];
  score: number;                    // 0-100
}

interface ClaimAnalysis {
  claim_text: string;
  claim_type: 'statistical' | 'causal' | 'comparative' | 'opinion';
  location: string;                 // e.g., "paragraph 2"
  needs_citation: boolean;
  reference_found: boolean;
  reference?: Reference;
}

interface Reference {
  id: string;
  title: string;
  source: string;                   // Publication name
  url: string;
  date: string;
  quote?: string;                   // Relevant quote
  credibility: 'high' | 'medium';
}

interface FlowAnalysis {
  overall_flow: 'smooth' | 'adequate' | 'choppy';
  transition_issues: TransitionIssue[];
  score: number;
}

interface TransitionIssue {
  location: string;
  issue: string;
  suggestion: string;
}

interface ReferenceAdded {
  claim: string;
  reference: Reference;
  insertion_point: string;
  citation_format: string;          // How it appears in text
}

interface ExampleAdded {
  concept: string;
  example: {
    title: string;
    description: string;
    source?: string;
  };
  insertion_point: string;
}

interface ClarityImprovement {
  original_text: string;
  improved_text: string;
  reason: string;
  location: string;
}
```

### Example Output (Abbreviated)
```json
{
  "original": {
    "title": "The Rising Threat of Insurance Fraud in the Digital Age",
    "content": "[original draft text]",
    "word_count": 187
  },
  
  "enhanced": {
    "title": "The Rising Threat of Insurance Fraud in the Digital Age",
    "content": "Insurance fraud has always challenged the industry, but digital transformation has dramatically amplified the threat. According to the Coalition Against Insurance Fraud, fraud costs American consumers at least $308.6 billion annually across all insurance lines [1].\n\nNew technologies enable sophisticated fraud schemes...[enhanced content with citations]...\n\n**References:**\n[1] Coalition Against Insurance Fraud, 2024 Annual Report\n[2] Insurance Information Institute, Auto Insurance Fraud Statistics...",
    "word_count": 412
  },
  
  "analysis": {
    "structure": {
      "has_clear_intro": true,
      "has_clear_conclusion": true,
      "section_count": 5,
      "section_balance": "uneven",
      "issues": [
        "Introduction lacks a compelling hook",
        "Body paragraphs are unequal in depth",
        "Conclusion could include a stronger call to action"
      ],
      "score": 65
    },
    "claims": [
      {
        "claim_text": "Companies are losing billions every year to fraud",
        "claim_type": "statistical",
        "location": "paragraph 2",
        "needs_citation": true,
        "reference_found": true,
        "reference": {
          "id": "ref_001",
          "title": "The Impact of Insurance Fraud",
          "source": "Coalition Against Insurance Fraud",
          "url": "https://example.com/report",
          "date": "2024",
          "quote": "Insurance fraud costs American consumers at least $308.6 billion annually",
          "credibility": "high"
        }
      }
    ],
    "flow": {
      "overall_flow": "adequate",
      "transition_issues": [
        {
          "location": "between paragraphs 2 and 3",
          "issue": "Abrupt shift from problem to solution without bridge",
          "suggestion": "Add transitional sentence introducing the technology response"
        }
      ],
      "score": 70
    }
  },
  
  "improvements": {
    "references_added": [
      {
        "claim": "Companies are losing billions every year to fraud",
        "reference": { "..." : "..." },
        "insertion_point": "paragraph 2, sentence 1",
        "citation_format": "According to the Coalition Against Insurance Fraud, fraud costs American consumers at least $308.6 billion annually [1]"
      }
    ],
    "examples_added": [
      {
        "concept": "AI fraud detection",
        "example": {
          "title": "Lemonade's AI Jim",
          "description": "Lemonade's AI claims bot 'Jim' processes claims in seconds and has flagged numerous fraudulent patterns.",
          "source": "Lemonade Insurance Blog"
        },
        "insertion_point": "paragraph 3"
      }
    ],
    "clarity_improvements": [
      {
        "original_text": "Insurance fraud has always been a problem, but it's getting worse.",
        "improved_text": "Insurance fraud has always challenged the industry, but digital transformation has dramatically amplified the threat.",
        "reason": "More specific and professional tone",
        "location": "paragraph 1, sentence 1"
      }
    ],
    "structural_changes": [
      "Added specific statistics to support claims",
      "Improved transitions between paragraphs",
      "Strengthened conclusion with actionable takeaway"
    ]
  },
  
  "summary": {
    "overall_improvement_score": 78,
    "key_changes": [
      "Added 4 authoritative references with citations",
      "Included real-world example (Lemonade AI)",
      "Improved 3 weak transitions",
      "Rewrote introduction for stronger hook"
    ],
    "word_count_change": 225,
    "references_count": 4,
    "examples_count": 1
  }
}
```

---

## 6. DATA REQUIREMENTS

### Database Tables

Uses shared `case_studies` and `execution_steps` tables.

### Execution Step Detail Schema
```typescript
interface ArticleEnhancerStepDetails {
  // For structure analysis
  structure_score?: number;
  structure_issues?: string[];
  
  // For claim identification
  claims_found?: number;
  claims_needing_citation?: number;
  sample_claims?: string[];
  
  // For reference search
  searches_performed?: number;
  references_found?: number;
  references_matched?: number;
  
  // For example search
  concepts_identified?: number;
  examples_found?: number;
  examples_selected?: number;
  
  // For enhancement generation
  improvements_count?: number;
  word_count_before?: number;
  word_count_after?: number;
}
```

---

## 7. CASE STUDIES

### Pre-Run Articles (5)

| # | Title | Article Type | Topic |
|---|-------|--------------|-------|
| 1 | **Insurance Fraud in the Digital Age** | Blog Post | Fraud trends and AI detection |
| 2 | **AI Governance Framework for Insurers** | Whitepaper | AI ethics and compliance |
| 3 | **Modernizing Claims Processing** | How-To Guide | Digital transformation |
| 4 | **The Case for Predictive Analytics** | Opinion Piece | Data-driven decision making |
| 5 | **Customer Experience in 2025** | Report | Policyholder expectations |

### Case Study 1: Insurance Fraud Blog Post
```json
{
  "title": "Insurance Fraud in the Digital Age",
  "subtitle": "Transforming a rough draft into a well-sourced blog post",
  "input_parameters": {
    "article": {
      "title": "The Rising Threat of Insurance Fraud in the Digital Age",
      "content": "Insurance fraud has always been a problem, but it's getting worse. New technologies make it easier for fraudsters to submit fake claims and create false identities.\n\nCompanies are losing billions every year to fraud. The problem is particularly bad in auto insurance, where staged accidents and inflated claims are common.\n\nArtificial intelligence is helping insurers fight back. Machine learning algorithms can detect suspicious patterns that humans might miss. Many companies are now investing heavily in fraud detection technology.\n\nHowever, technology alone isn't enough. Insurers need a combination of advanced analytics, trained investigators, and public awareness to effectively combat fraud.\n\nThe future of fraud detection lies in collaboration between humans and machines, using the best of both to protect honest policyholders."
    },
    "metadata": {
      "article_type": "blog_post",
      "target_audience": "insurance professionals",
      "tone": "conversational"
    },
    "enhancements": {
      "analyze_structure": true,
      "find_references": true,
      "suggest_examples": true,
      "improve_clarity": true,
      "add_statistics": true,
      "check_flow": true
    }
  }
}
```

### Case Study 2: AI Governance Whitepaper
```json
{
  "title": "AI Governance Framework for Insurers",
  "subtitle": "Enhancing a technical whitepaper with references and structure",
  "input_parameters": {
    "article": {
      "title": "Building an AI Governance Framework for Insurance Companies",
      "content": "AI is transforming insurance but brings risks. Companies need governance frameworks to manage these risks responsibly.\n\nKey principles include transparency, fairness, and accountability. AI systems should be explainable and free from bias. Human oversight is essential for critical decisions.\n\nImplementation requires executive sponsorship and cross-functional teams. Start with a risk assessment and develop policies for data use, model validation, and monitoring.\n\nRegulatory compliance is increasingly important. New laws around AI are emerging globally. Companies should prepare for stricter requirements.\n\nThe investment in governance pays off through reduced risk, better decisions, and maintained trust with customers and regulators."
    },
    "metadata": {
      "article_type": "whitepaper",
      "target_audience": "insurance executives and compliance officers",
      "tone": "formal"
    },
    "enhancements": {
      "analyze_structure": true,
      "find_references": true,
      "suggest_examples": true,
      "improve_clarity": true,
      "add_statistics": true,
      "check_flow": true
    }
  }
}
```

### Case Study 3: Claims Processing How-To
```json
{
  "title": "Modernizing Claims Processing",
  "subtitle": "Transforming a process guide with examples and references",
  "input_parameters": {
    "article": {
      "title": "How to Modernize Your Claims Processing Operation",
      "content": "Claims processing is ripe for modernization. Many insurers still rely on manual processes that are slow and error-prone.\n\nStart by assessing your current state. Map your workflows and identify bottlenecks. Talk to adjusters about their pain points.\n\nTechnology options include straight-through processing, AI triage, and digital FNOL. Choose solutions that integrate with your existing systems.\n\nChange management is critical. Train your team and communicate benefits clearly. Start with a pilot before full rollout.\n\nMeasure success through cycle times, customer satisfaction, and adjuster productivity. Continuous improvement should be built into your process."
    },
    "metadata": {
      "article_type": "how_to_guide",
      "target_audience": "claims managers and operations leaders",
      "tone": "technical"
    },
    "enhancements": {
      "analyze_structure": true,
      "find_references": true,
      "suggest_examples": true,
      "improve_clarity": true,
      "add_statistics": true,
      "check_flow": true
    }
  }
}
```

### Case Study 4: Predictive Analytics Opinion
```json
{
  "title": "The Case for Predictive Analytics",
  "subtitle": "Strengthening an opinion piece with data and examples",
  "input_parameters": {
    "article": {
      "title": "Why Every Insurer Needs Predictive Analytics Now",
      "content": "Predictive analytics is no longer optional for insurers. Those who don't adopt it will fall behind competitors who do.\n\nThe benefits are clear. Better risk selection, faster claims, and improved customer retention. Early adopters are seeing significant returns.\n\nSkeptics worry about data quality and model accuracy. These are valid concerns but shouldn't stop progress. Start small and improve over time.\n\nThe talent gap is real but manageable. Partner with vendors, upskill existing staff, and hire strategically. You don't need a huge data science team to get started.\n\nThe time to act is now. Waiting only makes the competitive gap wider."
    },
    "metadata": {
      "article_type": "opinion_piece",
      "target_audience": "insurance executives",
      "tone": "conversational"
    },
    "enhancements": {
      "analyze_structure": true,
      "find_references": true,
      "suggest_examples": true,
      "improve_clarity": true,
      "add_statistics": true,
      "check_flow": true
    }
  }
}
```

### Case Study 5: Customer Experience Report
```json
{
  "title": "Customer Experience in 2025",
  "subtitle": "Enhancing a trend report with research and statistics",
  "input_parameters": {
    "article": {
      "title": "The State of Insurance Customer Experience in 2025",
      "content": "Customer expectations in insurance have never been higher. People expect the same digital experience they get from tech companies.\n\nKey trends include omnichannel communication, personalization, and self-service options. Mobile-first is now table stakes.\n\nPain points remain around claims communication, policy complexity, and response times. Insurers who address these will win loyalty.\n\nTechnology enables better experiences but isn't sufficient alone. Culture and processes must also change. Customer-centric thinking should permeate the organization.\n\nThe future belongs to insurers who treat customers as partners, not policyholders. Trust and transparency will differentiate winners from losers."
    },
    "metadata": {
      "article_type": "report",
      "target_audience": "insurance marketing and customer experience professionals",
      "tone": "formal"
    },
    "enhancements": {
      "analyze_structure": true,
      "find_references": true,
      "suggest_examples": true,
      "improve_clarity": true,
      "add_statistics": true,
      "check_flow": true
    }
  }
}
```

---

## 8. UI COMPONENTS

### Page Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ✍️ Article Enhancer                                         │ │
│ │ "Transform drafts into polished, well-sourced articles"     │ │
│ │ [Content Enhancement Agent]                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ HOW IT WORKS                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Analyze Structure] → [Identify Claims] → [Find References] │ │
│ │ → [Find Examples] → [Analyze Flow] → [Generate Enhanced]    │ │
│ │                                                             │ │
│ │ This agent analyzes your draft, finds citations for claims, │ │
│ │ adds relevant examples, improves clarity, and produces a    │ │
│ │ polished version ready for publication.                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ CASE STUDIES                                                    │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────┐│
│ │ Fraud     │ │ AI        │ │ Claims    │ │ Predictive│ │ CX  ││
│ │ Blog Post │ │ Governance│ │ How-To    │ │ Analytics │ │2025 ││
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └─────┘│
├─────────────────────────────────────────────────────────────────┤
│ SELECTED CASE STUDY                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Article Details                                             │ │
│ │ Type: Blog Post | Audience: Insurance Professionals         │ │
│ │ Original: 187 words | Enhanced: 412 words                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Execution Trace                                             │ │
│ │ ✓ Step 1: Analyze Structure .................. 1.2s        │ │
│ │   └ Score: 65/100 | Issues: 3 found                         │ │
│ │ ✓ Step 2: Identify Claims .................... 0.8s        │ │
│ │   └ 6 claims found, 4 need citations                        │ │
│ │ ✓ Step 3: Search References .................. 8.4s        │ │
│ │   └ 8 references found, 4 matched to claims                 │ │
│ │ ✓ Step 4: Find Examples ...................... 4.2s        │ │
│ │   └ 1 example added (Lemonade AI case study)                │ │
│ │ ✓ Step 5: Analyze Flow ....................... 1.1s        │ │
│ │   └ Score: 70/100 | 2 transition issues                     │ │
│ │ ✓ Step 6: Generate Suggestions ............... 1.5s        │ │
│ │ ✓ Step 7: Produce Enhanced Version ........... 2.8s        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ BEFORE / AFTER COMPARISON                                   │ │
│ │                                                             │ │
│ │ ┌─────────────────────┐  ┌─────────────────────┐            │ │
│ │ │ ORIGINAL DRAFT      │  │ ENHANCED VERSION    │            │ │
│ │ │                     │  │                     │            │ │
│ │ │ Insurance fraud has │  │ Insurance fraud has │            │ │
│ │ │ always been a       │  │ always challenged   │            │ │
│ │ │ problem, but it's   │  │ the industry, but   │            │ │
│ │ │ getting worse...    │  │ digital transform-  │            │ │
│ │ │                     │  │ ation has dramatic- │            │ │
│ │ │                     │  │ ally amplified the  │            │ │
│ │ │                     │  │ threat. According   │            │ │
│ │ │                     │  │ to the Coalition... │            │ │
│ │ │                     │  │                     │            │ │
│ │ │ [187 words]         │  │ [412 words]         │            │ │
│ │ └─────────────────────┘  └─────────────────────┘            │ │
│ │                                                             │ │
│ │ [Toggle: Show Full Text | Show Diff | Show Side-by-Side]    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ IMPROVEMENTS SUMMARY                                        │ │
│ │                                                             │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │ │
│ │ │ +225     │ │ 4        │ │ 1        │ │ 78%      │        │ │
│ │ │ Words    │ │ References│ │ Example  │ │ Improved │        │ │
│ │ │ Added    │ │ Added    │ │ Added    │ │ Score    │        │ │
│ │ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │ │
│ │                                                             │ │
│ │ KEY CHANGES                                                 │ │
│ │ ✓ Added 4 authoritative references with citations           │ │
│ │ ✓ Included real-world example (Lemonade AI)                 │ │
│ │ ✓ Improved 3 weak transitions                               │ │
│ │ ✓ Rewrote introduction for stronger hook                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ANALYSIS DETAILS (Expandable Sections)                      │ │
│ │                                                             │ │
│ │ ▸ Structure Analysis (65/100)                               │ │
│ │ ▸ Claims & References (4 claims cited)                      │ │
│ │ ▸ Flow Analysis (70/100)                                    │ │
│ │ ▸ Clarity Improvements (3 rewrites)                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Components Needed

| Component | Purpose |
|-----------|---------|
| `AgentHeader` | Icon, name, tagline, type badge |
| `HowItWorks` | 7-step diagram |
| `CaseStudyGrid` | Grid of article cards |
| `CaseStudyCard` | Individual article preview |
| `ArticleMetadata` | Type, audience, word counts |
| `ExecutionTrace` | Step list with analysis summaries |
| `BeforeAfterComparison` | Side-by-side article view |
| `DiffView` | Highlighted changes view |
| `ImprovementsSummary` | Statistics cards |
| `KeyChangesList` | Bulleted improvement list |
| `StructureAnalysis` | Expandable structure details |
| `ClaimsTable` | Table of claims and their references |
| `FlowAnalysis` | Transition issues list |
| `ReferenceList` | Formatted citations |

### View Modes for Comparison
| Mode | Description |
|------|-------------|
| Side-by-Side | Original and enhanced in two columns |
| Diff View | Inline highlighting of changes |
| Full Text | Enhanced version only with annotations |

---

## 9. TECHNICAL NOTES

### Agent Implementation
- **Framework:** LangChain (Python)
- **LLM:** Claude API for analysis and rewriting
- **Search:** Tavily or SerpAPI for reference finding
- **Diff:** Python `difflib` for generating text comparisons

### Data Flow
```
1. Write sample draft articles (5)
2. Run agent on each draft
3. Agent analyzes, searches, enhances
4. Save original + enhanced + trace to JSON
5. Import to PostgreSQL
6. Frontend displays before/after comparison
```

### Reference Search Strategy
```
For each claim:
  1. Extract key assertion (e.g., "fraud costs billions")
  2. Generate search queries:
     - "{topic} statistics {year}"
     - "{topic} research report"
     - "{topic} industry data"
  3. Filter for authoritative sources:
     - Government (.gov)
     - Academic (.edu, journals)
     - Industry associations
     - Major publications
  4. Extract relevant quote and citation info
```

### Key Considerations
- Write realistic draft articles (imperfect but coherent)
- Include a variety of article types for range
- Save both original and enhanced for comparison
- Track word count changes
- Format citations consistently

### Sample Draft Quality Guidelines
```
Good draft characteristics (for demo purposes):
- Has a clear topic but weak structure
- Makes claims without citations
- Uses vague language ("many companies")
- Has adequate but not great flow
- Is approximately 150-300 words

This allows the agent to show meaningful improvement
without starting from garbage.
```

---

---

## 10. IMMUTABLE CONSTANTS (DO NOT CHANGE)

These elements are locked across all 5 agents for portfolio consistency:

### Database Schema (Universal)
```sql
-- Shared by ALL agents - never modify

case_studies
├── id UUID PRIMARY KEY
├── agent_slug VARCHAR(50)        -- Links to agent
├── title VARCHAR(200)
├── subtitle VARCHAR(300)
├── input_parameters JSONB        -- Agent-specific input
├── output_result JSONB           -- Agent-specific output
├── execution_trace JSONB         -- Array of steps
├── featured BOOLEAN
├── display_order INTEGER
├── created_at TIMESTAMP
└── updated_at TIMESTAMP

execution_steps
├── id UUID PRIMARY KEY
├── case_study_id UUID            -- FK to case_studies
├── step_number INTEGER
├── step_name VARCHAR(100)
├── step_type VARCHAR(50)         -- 'search', 'analysis', 'synthesis', etc.
├── input_summary TEXT
├── output_summary TEXT
├── details JSONB                 -- Step-specific details
├── duration_ms INTEGER
└── timestamp TIMESTAMP
```

### Agent Registry (All 5 Agents)
| Agent | Slug | Type Badge | Badge Color |
|-------|------|------------|-------------|
| Fraud Trends | `fraud-trends` | Research & Synthesis Agent | Blue |
| Stock Monitor | `stock-monitor` | Event Detection & Alert Agent | Green |
| House Finder | `house-finder` | Multi-Criteria Matching Agent | Orange |
| Article Editor | `article-editor` | Content Enhancement Agent | Purple |
| Gita Guide | `gita-guide` | Conversational Expert Agent | Saffron |

### Page Structure (Every Agent Page)
```
1. HEADER         → Icon + Name + Tagline + Type Badge
2. HOW IT WORKS   → Step diagram + brief explanation
3. CASE STUDIES   → Grid of 5 clickable cards
4. DETAIL VIEW    → Input → Execution Trace → Output
```

### Execution Step Format (Universal)
```typescript
interface ExecutionStep {
  step_number: number;      // Sequential: 1, 2, 3...
  step_name: string;        // Human-readable
  step_type: string;        // 'setup' | 'search' | 'analysis' | 'synthesis' | 'filter' | 'enrichment'
  input_summary: string;    // What went in
  output_summary: string;   // What came out
  details: object;          // Expandable (agent-specific)
  duration_ms: number;      // Execution time
}
```

### Shared UI Components (Build Once, Use Everywhere)
| Component | Purpose |
|-----------|---------|
| `AgentHeader` | Icon, name, tagline, type badge |
| `HowItWorks` | Step diagram |
| `CaseStudyGrid` | Grid of case study cards |
| `CaseStudyCard` | Individual preview card |
| `ExecutionTrace` | Step-by-step trace display |
| `ExecutionStep` | Single expandable step |

### API Route Pattern
```
/api/agents/[slug]/case-studies       → List case studies
/api/agents/[slug]/case-studies/[id]  → Get single case study
```

### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Agent slug | kebab-case | `article-editor` |
| Component | PascalCase | `CaseStudyCard` |
| DB table | snake_case | `case_studies` |
| JSON field | snake_case | `input_parameters` |
| TS interface | PascalCase | `ArticleEnhancerInput` |

### Fixed Constraints
- **5 case studies per agent** (no more, no less)
- **All agents use same database tables**
- **All agents follow same page layout**
- **All execution steps use same format**

---

## COPY-PASTE CHECKLIST

When starting a new chat to build this agent:

- [ ] Copy this entire document
- [ ] Write 5 sample draft articles (realistic but imperfect)
- [ ] Reference the universal database schema
- [ ] Build agent script (Python)
- [ ] Run on all 5 articles
- [ ] Export before/after + traces to JSON
- [ ] Build frontend components (especially comparison views)
- [ ] Import data to database
- [ ] Connect frontend to database
