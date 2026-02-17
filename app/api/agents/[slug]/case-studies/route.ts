/**
 * API Route: GET /api/agents/[slug]/case-studies
 *
 * Retrieves all case studies for a specific agent from the PostgreSQL database.
 * This API uses the READ-ONLY database connection for security.
 *
 * Query Parameters:
 * - includeTrace: boolean (default: false) - Whether to include execution steps
 * - display: boolean (default: true) - Filter by display status
 * - featured: boolean (optional) - Filter by featured status
 *
 * Response Format:
 * {
 *   "agentSlug": "fraud-trends",
 *   "caseStudies": [...],
 *   "totalCount": 5,
 *   "executionTraceIncluded": false
 * }
 *
 * Error Response:
 * {
 *   "error": {
 *     "code": "AGENT_NOT_FOUND",
 *     "message": "Agent slug not found or invalid",
 *     "details": { ... }
 *   }
 * }
 *
 * Implementation: Epic 5, Stories 5.1-5.6
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  CaseStudy,
  ExecutionStep,
  ApiError,
  CaseStudiesResponse,
  isValidAgentSlug,
} from '@/lib/types';

// Type for route params
type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * GET handler for case studies endpoint.
 *
 * Stories Implemented:
 * - 5.1: API route structure
 * - 5.2: Case study query logic
 * - 5.3: API response formatting
 * - 5.4: Agent slug validation
 * - 5.5: Database error handling
 * - 5.6: Empty results handling
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<CaseStudiesResponse | ApiError>> {
  try {
    // =========================================================================
    // STEP 1: Extract and validate route parameters (Story 5.4)
    // =========================================================================
    const { slug } = await params;

    // Validate agent slug
    if (!isValidAgentSlug(slug)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_AGENT_SLUG',
            message: `Invalid agent slug: ${slug}`,
            details: {
              validSlugs: [
                'fraud-trends',
                'stock-monitor',
                'house-finder',
                'article-editor',
                'gita-guide',
              ],
            },
          },
        },
        { status: 400 }
      );
    }

    // =========================================================================
    // STEP 2: Parse query parameters
    // =========================================================================
    const searchParams = request.nextUrl.searchParams;
    const includeTrace = searchParams.get('includeTrace') === 'true';
    const displayFilter = searchParams.get('display');
    const featuredFilter = searchParams.get('featured');

    // =========================================================================
    // STEP 3: Query case studies from database (Story 5.2)
    // =========================================================================
    let caseStudiesQuery = `
      SELECT
        id,
        agent_slug,
        title,
        subtitle,
        input_parameters,
        output_result,
        execution_trace,
        display,
        featured,
        display_order,
        created_at,
        updated_at
      FROM case_studies
      WHERE agent_slug = $1
    `;

    const queryParams: unknown[] = [slug];
    let paramIndex = 2;

    // Add display filter if specified
    if (displayFilter !== null) {
      caseStudiesQuery += ` AND display = $${paramIndex}`;
      queryParams.push(displayFilter === 'true');
      paramIndex++;
    }

    // Add featured filter if specified
    if (featuredFilter !== null) {
      caseStudiesQuery += ` AND featured = $${paramIndex}`;
      queryParams.push(featuredFilter === 'true');
      paramIndex++;
    }

    // Order by display_order (ascending, nulls last), then created_at (descending)
    caseStudiesQuery += `
      ORDER BY
        display_order ASC NULLS LAST,
        created_at DESC
    `;

    // Execute query with error handling (Story 5.5)
    let caseStudiesResult;
    try {
      caseStudiesResult = await query<{
        id: string;
        agent_slug: string;
        title: string;
        subtitle: string | null;
        input_parameters: unknown;
        output_result: unknown;
        execution_trace: unknown[] | null;
        display: boolean;
        featured: boolean;
        display_order: number | null;
        created_at: string;
        updated_at: string;
      }>(caseStudiesQuery, queryParams);
    } catch (dbError) {
      console.error('[API] Database error querying case studies:', dbError);
      return NextResponse.json(
        {
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to query case studies from database',
            details: {
              error: dbError instanceof Error ? dbError.message : 'Unknown error',
            },
          },
        },
        { status: 500 }
      );
    }

    // =========================================================================
    // STEP 4: Handle empty results (Story 5.6)
    // =========================================================================
    if (caseStudiesResult.rows.length === 0) {
      // Return empty array with appropriate message
      // This is NOT an error - agent might just not have case studies yet
      return NextResponse.json({
        agentSlug: slug,
        caseStudies: [],
        totalCount: 0,
        executionTraceIncluded: includeTrace,
      });
    }

    // =========================================================================
    // STEP 5: Fetch execution steps if requested (Story 5.2)
    // =========================================================================
    const executionStepsMap: Map<string, ExecutionStep[]> = new Map();

    if (includeTrace) {
      // Get all case study IDs
      const caseStudyIds = caseStudiesResult.rows.map((row) => row.id);

      // Query execution steps for all case studies
      const executionStepsQuery = `
        SELECT
          case_study_id,
          step_number,
          step_name,
          step_type,
          input_summary,
          output_summary,
          details,
          duration_ms,
          timestamp
        FROM execution_steps
        WHERE case_study_id = ANY($1::uuid[])
        ORDER BY case_study_id, step_number ASC
      `;

      try {
        const executionStepsResult = await query<{
          case_study_id: string;
          step_number: number;
          step_name: string;
          step_type: string;
          input_summary: string | null;
          output_summary: string | null;
          details: unknown;
          duration_ms: number | null;
          timestamp: string;
        }>(executionStepsQuery, [caseStudyIds]);

        // Group execution steps by case_study_id
        for (const row of executionStepsResult.rows) {
          const step: ExecutionStep = {
            stepNumber: row.step_number,
            stepName: row.step_name,
            stepType: row.step_type as ExecutionStep['stepType'],
            inputSummary: row.input_summary || undefined,
            outputSummary: row.output_summary || undefined,
            details: row.details as Record<string, unknown> | undefined,
            durationMs: row.duration_ms || undefined,
            timestamp: row.timestamp,
          };

          if (!executionStepsMap.has(row.case_study_id)) {
            executionStepsMap.set(row.case_study_id, []);
          }
          executionStepsMap.get(row.case_study_id)!.push(step);
        }
      } catch (dbError) {
        // Log error but continue - execution steps are supplementary
        console.error('[API] Error fetching execution steps:', dbError);
        // executionStepsMap remains empty
      }
    }

    // =========================================================================
    // STEP 6: Format response (Story 5.3)
    // =========================================================================
    const caseStudies: CaseStudy<unknown, unknown>[] = caseStudiesResult.rows.map(
      (row) => {
        // Prefer execution_steps table; fall back to execution_trace JSONB column
        const stepsFromTable = includeTrace ? executionStepsMap.get(row.id) || [] : [];
        const traceFromColumn = (row.execution_trace as ExecutionStep[] | null) || [];
        const executionTrace = stepsFromTable.length > 0 ? stepsFromTable : traceFromColumn;

        return {
          id: row.id,
          agentSlug: row.agent_slug,
          title: row.title,
          subtitle: row.subtitle || undefined,
          inputParameters: row.input_parameters,
          outputResult: row.output_result,
          executionTrace,
          display: row.display,
          featured: row.featured,
          displayOrder: row.display_order || undefined,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
    );

    // =========================================================================
    // STEP 7: Return formatted response
    // =========================================================================
    const response: CaseStudiesResponse = {
      agentSlug: slug,
      caseStudies,
      totalCount: caseStudies.length,
      executionTraceIncluded: includeTrace,
    };

    return NextResponse.json(response);
  } catch (error) {
    // =========================================================================
    // Catch-all error handler
    // =========================================================================
    console.error('[API] Unexpected error in case studies endpoint:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      },
      { status: 500 }
    );
  }
}
