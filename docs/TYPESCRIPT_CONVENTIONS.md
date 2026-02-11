# TypeScript Naming Conventions & Best Practices

**Version:** 1.0
**Last Updated:** 2025-02-09
**Applies To:** All TypeScript code in `website/` directory

This document establishes consistent naming conventions, type definitions, and code organization patterns for the TypeScript layer of the AI Agents Portfolio project.

---

## Core Principles

1. **Type Safety First:** Use TypeScript strict mode, avoid `any`
2. **Python Pydantic Alignment:** TypeScript types must match Python models exactly
3. **Explicit Over Implicit:** Prefer explicit type annotations
4. **Descriptive Names:** Use clear, self-documenting names

---

## Naming Conventions

### Files and Directories

```
website/
├── app/                          # Next.js App Router (kebab-case)
│   ├── api/
│   │   └── agents/
│   │       └── [slug]/
│   │           └── case-studies/
│   │               └── route.ts  # API route handler
│   └── page.tsx                  # Page components (PascalCase)
├── lib/                          # Utility libraries (kebab-case)
│   ├── db.ts                     # Database connection
│   ├── types.ts                  # Type definitions
│   └── utils.ts                  # Helper functions
└── components/                   # React components (PascalCase folders)
    └── AgentCard/
        ├── AgentCard.tsx
        └── AgentCard.module.css
```

### Interfaces and Types

```typescript
// Interfaces: PascalCase (noun or adjective + noun)
interface CaseStudy<TInput, TOutput> { }
interface FraudTrendsInput { }
interface ExecutionStep { }
interface ApiResponse { }
interface DatabaseConfig { }

// Type Aliases: PascalCase
type SeverityLevel = "low" | "medium" | "high" | "critical";
type ConfidenceLevel = "low" | "medium" | "high";
type AgentSlug = "fraud-trends" | "stock-monitor" | "house-finder";

// Generic Type Parameters: Single uppercase letter or PascalCase
type CaseStudy<TInput, TOutput> = { ... }
type Result<T, E> = { ... }
```

### Properties and Variables

```typescript
// Properties: camelCase
interface CaseStudy {
  agentSlug: string;        // NOT agent_slug
  inputParameters: object;  // NOT input_parameters
  executionTrace: Step[];   // NOT execution_trace
  createdAt: string;        // NOT created_at
}

// Variables: camelCase
const caseStudies: CaseStudy[] = [];
const executionStep: ExecutionStep = {};
const databasePool: Pool = new Pool();

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = "/api";
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 20;
```

### Functions

```typescript
// Functions: camelCase (verb or verb + noun)
function getCaseStudies(slug: string): Promise<CaseStudy[]> { }
function formatTimestamp(date: Date): string { }
function validateAgentSlug(slug: string): boolean { }

// Async functions: still camelCase (async is implicit)
async function fetchCaseStudies(slug: string): Promise<CaseStudy[]> { }

// React Components: PascalCase
export default function CaseStudyCard({ data }: Props) { }
```

### Enums (Avoid - Use Union Types Instead)

```typescript
// AVOID enums - use string literal unions instead
// ❌ BAD:
enum Severity {
  Low = "low",
  Medium = "medium",
  High = "high"
}

// ✅ GOOD:
type SeverityLevel = "low" | "medium" | "high" | "critical";
```

---

## snake_case to camelCase Conversion Table

When converting from Python/Database to TypeScript:

| Python/Database (snake_case) | TypeScript (camelCase) |
|------------------------------|------------------------|
| `agent_slug` | `agentSlug` |
| `input_parameters` | `inputParameters` |
| `output_result` | `outputResult` |
| `execution_trace` | `executionTrace` |
| `case_study_id` | `caseStudyId` |
| `step_number` | `stepNumber` |
| `step_name` | `stepName` |
| `step_type` | `stepType` |
| `input_summary` | `inputSummary` |
| `output_summary` | `outputSummary` |
| `duration_ms` | `durationMs` |
| `display_order` | `displayOrder` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
| `time_range` | `timeRange` |
| `focus_areas` | `focusAreas` |
| `executive_summary` | `executiveSummary` |
| `regulatory_findings` | `regulatoryFindings` |
| `source_tier_breakdown` | `sourceTierBreakdown` |
| `confidence_level` | `confidenceLevel` |
| `data_freshness` | `dataFreshness` |
| `detection_difficulty` | `detectionDifficulty` |
| `geographic_scope` | `geographicScope` |
| `affected_lines` | `affectedLines` |
| `estimated_impact` | `estimatedImpact` |
| `tier_1_count` | `tier1Count` |
| `tier_2_count` | `tier2Count` |
| `tier_3_count` | `tier3Count` |
| `tier_1_percentage` | `tier1Percentage` |
| `tier_2_percentage` | `tier2Percentage` |
| `tier_3_percentage` | `tier3Percentage` |

---

## Type Definition Patterns

### Generic CaseStudy Type

```typescript
// Generic case study that works for all agents
interface CaseStudy<TInput, TOutput> {
  id: string;
  agentSlug: string;
  title: string;
  subtitle?: string;
  inputParameters: TInput;
  outputResult: TOutput;
  executionTrace: ExecutionStep[];
  display: boolean;
  featured: boolean;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

// Agent-specific usage
type FraudTrendsCaseStudy = CaseStudy<FraudTrendsInput, FraudTrendsOutput>;
```

### Optional Properties

```typescript
// Use ? for optional properties (matches Python Optional[T])
interface Example {
  required: string;       // Required
  optional?: string;      // Optional (can be undefined)
  nullable: string | null;  // Explicitly nullable
}
```

### String Literal Unions

```typescript
// Use string literal unions for constrained values (matches Python Literal)
type SeverityLevel = "low" | "medium" | "high" | "critical";
type DetectionDifficulty = "easy" | "moderate" | "hard" | "very_hard";
type ConfidenceLevel = "low" | "medium" | "high";
type StepType =
  | "planning"
  | "search_industry"
  | "search_regulatory"
  | "search_academic"
  | "extraction"
  | "synthesis";
```

### API Response Types

```typescript
// Standard API response wrapper
interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Agent-specific API responses
interface CaseStudiesResponse {
  agentSlug: string;
  caseStudies: CaseStudy<unknown, unknown>[];
  totalCount: number;
  executionTraceIncluded: boolean;
}
```

---

## Import Organization

```typescript
// 1. External imports (alphabetical)
import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

// 2. Internal absolute imports (alphabetical)
import { pool } from '@/lib/db';
import type { CaseStudy, FraudTrendsInput, FraudTrendsOutput } from '@/lib/types';

// 3. Relative imports (alphabetical)
import { formatTimestamp } from '../utils';
```

---

## Export Patterns

```typescript
// Named exports for utilities and types
export type { CaseStudy, FraudTrendsInput };
export function getCaseStudies() { }

// Default export for React components and API routes
export default function Page() { }
```

---

## Documentation Comments

```typescript
/**
 * Fetches all case studies for a given agent from the database.
 *
 * @param agentSlug - The agent identifier (e.g., "fraud-trends")
 * @returns Array of case studies with execution traces
 * @throws DatabaseError if connection fails
 */
async function getCaseStudies(agentSlug: string): Promise<CaseStudy[]> {
  // Implementation
}
```

---

## Common Patterns to Follow

### Database Query Results

```typescript
// Convert snake_case from database to camelCase
const dbResult = await pool.query('SELECT * FROM case_studies WHERE agent_slug = $1', [slug]);

const caseStudies: CaseStudy[] = dbResult.rows.map(row => ({
  id: row.id,
  agentSlug: row.agent_slug,              // Convert snake_case
  title: row.title,
  subtitle: row.subtitle,
  inputParameters: row.input_parameters,   // JSONB already parsed
  outputResult: row.output_result,         // JSONB already parsed
  executionTrace: row.execution_trace,     // JSONB already parsed
  display: row.display,
  featured: row.featured,
  displayOrder: row.display_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}));
```

### API Route Handlers

```typescript
// GET handler
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
): Promise<NextResponse<CaseStudiesResponse | ApiError>> {
  try {
    // Implementation
    return NextResponse.json({ agentSlug, caseStudies, totalCount, executionTraceIncluded: true });
  } catch (error) {
    return NextResponse.json(
      { code: 'DATABASE_ERROR', message: 'Failed to retrieve case studies', details: {} },
      { status: 500 }
    );
  }
}
```

---

## Anti-Patterns to Avoid

```typescript
// ❌ AVOID: Using 'any'
function process(data: any) { }

// ✅ GOOD: Use proper types or unknown
function process(data: CaseStudy) { }
function processUnknown(data: unknown) { }

// ❌ AVOID: snake_case in TypeScript
interface case_study {
  agent_slug: string;
}

// ✅ GOOD: camelCase for properties
interface CaseStudy {
  agentSlug: string;
}

// ❌ AVOID: Implicit any
const result = await fetchData();  // result has type 'any'

// ✅ GOOD: Explicit type annotation
const result: CaseStudy[] = await fetchData();
```

---

## Validation Checklist

Before committing TypeScript code:

- [ ] All interfaces use PascalCase
- [ ] All properties use camelCase (not snake_case)
- [ ] All string literals match Python Literal types exactly
- [ ] No usage of `any` type
- [ ] Imports are organized correctly
- [ ] Types match Python Pydantic models (see SCHEMA_MAPPING.md)
- [ ] Run `npm run lint` with zero errors
- [ ] Run `npm run build` with zero TypeScript errors

---

## References

- See `docs/SCHEMA_MAPPING.md` for Python ↔ TypeScript type mappings
- See `website/lib/types.ts` for canonical type definitions
- See Next.js documentation for App Router patterns
