# Database Schema Mapping & Type Consistency

**Version:** 1.0
**Last Updated:** 2025-02-09
**Status:** LOCKED (Immutable after Epic 2)

This document defines the exact mapping between:
- PostgreSQL database schema (tables, columns, types)
- Python Pydantic models (field names, types)
- TypeScript interfaces (property names, types)

**CRITICAL:** All three layers must remain in perfect sync. Any changes require updates to all three layers and validation via the JSON validation script.

---

## Core Principles

1. **Field Name Consistency:** Use `snake_case` in database/Python, `camelCase` in TypeScript (auto-convert in API layer)
2. **Type Mapping:** Follow strict type equivalence rules (see below)
3. **JSONB Flexibility:** Use JSONB for agent-specific data while maintaining type safety
4. **Immutability:** Schema is LOCKED after Epic 2 - no changes without formal review

---

## Type Mapping Rules

### Primitive Types

| PostgreSQL | Python (Pydantic) | TypeScript |
|------------|-------------------|------------|
| `UUID` | `str` | `string` |
| `VARCHAR(n)` | `str` | `string` |
| `TEXT` | `str` | `string` |
| `INTEGER` | `int` | `number` |
| `BOOLEAN` | `bool` | `boolean` |
| `TIMESTAMP` | `str` (ISO 8601) | `string` (ISO 8601) |
| `JSONB` | `dict` | `object` or typed interface |

### Complex Types

| PostgreSQL | Python (Pydantic) | TypeScript |
|------------|-------------------|------------|
| `ARRAY` | `List[T]` | `T[]` |
| - | `Optional[T]` | `T \| undefined` or `T?` |
| - | `Literal["a", "b"]` | `"a" \| "b"` |

---

## Table: `case_studies`

**Purpose:** Stores pre-run agent execution results for all agents.

### Column Mapping

| Database Column | Type | Python Field | Python Type | TypeScript Property | TypeScript Type |
|----------------|------|--------------|-------------|---------------------|-----------------|
| `id` | UUID PRIMARY KEY | `id` | `str` | `id` | `string` |
| `agent_slug` | VARCHAR(50) NOT NULL | `agent_slug` | `str` | `agentSlug` | `string` |
| `title` | VARCHAR(200) NOT NULL | `title` | `str` | `title` | `string` |
| `subtitle` | VARCHAR(300) | `subtitle` | `Optional[str]` | `subtitle` | `string \| undefined` |
| `input_parameters` | JSONB NOT NULL | `input_parameters` | `FraudTrendsInput` | `inputParameters` | `FraudTrendsInput` |
| `output_result` | JSONB NOT NULL | `output_result` | `FraudTrendsOutput` | `outputResult` | `FraudTrendsOutput` |
| `execution_trace` | JSONB | `execution_trace` | `List[ExecutionStep]` | `executionTrace` | `ExecutionStep[]` |
| `display` | BOOLEAN DEFAULT TRUE | `display` | `bool` | `display` | `boolean` |
| `featured` | BOOLEAN DEFAULT FALSE | `featured` | `bool` | `featured` | `boolean` |
| `display_order` | INTEGER | `display_order` | `Optional[int]` | `displayOrder` | `number \| undefined` |
| `created_at` | TIMESTAMP | `created_at` | `str` | `createdAt` | `string` |
| `updated_at` | TIMESTAMP | `updated_at` | `str` | `updatedAt` | `string` |

### Indexes

- `idx_case_studies_agent_slug` ON `(agent_slug)`
- `idx_case_studies_display` ON `(display, featured, display_order)`
- `idx_case_studies_created` ON `(created_at DESC)`

---

## Table: `execution_steps`

**Purpose:** Stores individual workflow steps for execution transparency.

### Column Mapping

| Database Column | Type | Python Field | Python Type | TypeScript Property | TypeScript Type |
|----------------|------|--------------|-------------|---------------------|-----------------|
| `id` | UUID PRIMARY KEY | `id` | `str` | `id` | `string` |
| `case_study_id` | UUID FK | `case_study_id` | `str` | `caseStudyId` | `string` |
| `step_number` | INTEGER NOT NULL | `step_number` | `int` | `stepNumber` | `number` |
| `step_name` | VARCHAR(100) NOT NULL | `step_name` | `str` | `stepName` | `string` |
| `step_type` | VARCHAR(50) NOT NULL | `step_type` | `str` | `stepType` | `string` |
| `input_summary` | TEXT | `input_summary` | `Optional[str]` | `inputSummary` | `string \| undefined` |
| `output_summary` | TEXT | `output_summary` | `Optional[str]` | `outputSummary` | `string \| undefined` |
| `details` | JSONB | `details` | `Optional[dict]` | `details` | `object \| undefined` |
| `duration_ms` | INTEGER | `duration_ms` | `Optional[int]` | `durationMs` | `number \| undefined` |
| `timestamp` | TIMESTAMP | `timestamp` | `str` | `timestamp` | `string` |

### Indexes

- `idx_execution_steps_case_study_id` ON `(case_study_id, step_number)`

### Foreign Keys

- `case_study_id` REFERENCES `case_studies(id)` ON DELETE CASCADE

---

## Agent-Specific Models: Fraud Trends

### FraudTrendsInput

| Python Field | Python Type | TypeScript Property | TypeScript Type |
|--------------|-------------|---------------------|-----------------|
| `topic` | `str` | `topic` | `string` |
| `regions` | `List[str]` | `regions` | `string[]` |
| `time_range` | `str` | `timeRange` | `string` |
| `focus_areas` | `Optional[List[str]]` | `focusAreas` | `string[] \| undefined` |

### FraudTrend

| Python Field | Python Type | TypeScript Property | TypeScript Type |
|--------------|-------------|---------------------|-----------------|
| `name` | `str` | `name` | `string` |
| `category` | `str` | `category` | `string` |
| `description` | `str` | `description` | `string` |
| `severity` | `Literal["low", "medium", "high", "critical"]` | `severity` | `"low" \| "medium" \| "high" \| "critical"` |
| `detection_difficulty` | `Literal["easy", "moderate", "hard", "very_hard"]` | `detectionDifficulty` | `"easy" \| "moderate" \| "hard" \| "very_hard"` |
| `geographic_scope` | `List[str]` | `geographicScope` | `string[]` |
| `affected_lines` | `List[str]` | `affectedLines` | `string[]` |
| `estimated_impact` | `str` | `estimatedImpact` | `string` |

### RegulatoryFinding

| Python Field | Python Type | TypeScript Property | TypeScript Type |
|--------------|-------------|---------------------|-----------------|
| `source` | `str` | `source` | `string` |
| `finding` | `str` | `finding` | `string` |
| `date` | `str` | `date` | `string` |
| `severity` | `Literal["low", "medium", "high", "critical"]` | `severity` | `"low" \| "medium" \| "high" \| "critical"` |
| `url` | `Optional[str]` | `url` | `string \| undefined` |

### SourceTierBreakdown

| Python Field | Python Type | TypeScript Property | TypeScript Type |
|--------------|-------------|---------------------|-----------------|
| `tier_1_count` | `int` | `tier1Count` | `number` |
| `tier_2_count` | `int` | `tier2Count` | `number` |
| `tier_3_count` | `int` | `tier3Count` | `number` |
| `tier_1_percentage` | `float` | `tier1Percentage` | `number` |
| `tier_2_percentage` | `float` | `tier2Percentage` | `number` |
| `tier_3_percentage` | `float` | `tier3Percentage` | `number` |

### FraudTrendsOutput

| Python Field | Python Type | TypeScript Property | TypeScript Type |
|--------------|-------------|---------------------|-----------------|
| `executive_summary` | `str` | `executiveSummary` | `string` |
| `trends` | `List[FraudTrend]` | `trends` | `FraudTrend[]` |
| `regulatory_findings` | `List[RegulatoryFinding]` | `regulatoryFindings` | `RegulatoryFinding[]` |
| `source_tier_breakdown` | `SourceTierBreakdown` | `sourceTierBreakdown` | `SourceTierBreakdown` |
| `confidence_level` | `Literal["low", "medium", "high"]` | `confidenceLevel` | `"low" \| "medium" \| "high"` |
| `data_freshness` | `str` | `dataFreshness` | `string` |
| `disclaimer` | `str` | `disclaimer` | `string` |
| `recommendations` | `List[str]` | `recommendations` | `string[]` |

---

## Naming Convention Rules

### Database (PostgreSQL)
- Tables: `snake_case`, plural (e.g., `case_studies`, `execution_steps`)
- Columns: `snake_case`, singular (e.g., `agent_slug`, `created_at`)
- Indexes: `idx_{table}_{columns}` (e.g., `idx_case_studies_agent_slug`)
- Foreign Keys: `{referenced_table_singular}_id` (e.g., `case_study_id`)

### Python (Pydantic)
- Classes: `PascalCase` (e.g., `FraudTrendsInput`, `CaseStudy`)
- Fields: `snake_case` (e.g., `agent_slug`, `time_range`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `AGENT_SLUG`, `STEP_TYPES`)

### TypeScript
- Interfaces: `PascalCase` (e.g., `FraudTrendsInput`, `CaseStudy`)
- Properties: `camelCase` (e.g., `agentSlug`, `timeRange`)
- Types: `PascalCase` (e.g., `SeverityLevel`, `ConfidenceLevel`)

---

## Validation Workflow

1. **Define Python Pydantic models** (source of truth for structure)
2. **Create TypeScript types** matching Python exactly (manual sync)
3. **Validate JSON** using `scripts/validate-json.py` before import
4. **Code review** to verify 3-way consistency

---

## Change Management

**Any schema changes require:**

1. Update `database/schema.sql`
2. Update Python Pydantic models in `agents/*/utils/models.py`
3. Update TypeScript types in `website/lib/types.ts`
4. Update this mapping document
5. Run validation script to verify consistency
6. Update all existing agents if breaking change
7. Gate review for approval

**Current Status:** Schema LOCKED for Gate 1 validation (Epic 2 complete)
