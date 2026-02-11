/**
 * Database Connection Module for AI Agents Portfolio
 *
 * This module provides a reusable PostgreSQL connection pool for Next.js API routes.
 * Uses the pg (node-postgres) library with SSL configuration for Neon hosted database.
 *
 * IMPORTANT: This uses the READ-ONLY database user (api_readonly) for security.
 * The API can only SELECT data, not INSERT/UPDATE/DELETE.
 *
 * Environment Variables Required:
 * - DATABASE_URL: PostgreSQL connection string (from .env.local)
 *   Format: postgresql://api_readonly:password@host:5432/database?sslmode=require
 *
 * See: docs/SCHEMA_MAPPING.md for database schema details
 */

import { Pool, PoolConfig } from 'pg';

/**
 * Database connection pool configuration optimized for serverless functions.
 *
 * Serverless functions are stateless and short-lived, so we keep connection
 * pool settings minimal to avoid holding open connections unnecessarily.
 */
const poolConfig: PoolConfig = {
  // Connection string from environment variable
  connectionString: process.env.DATABASE_URL,

  // SSL configuration for Neon (required)
  ssl: {
    rejectUnauthorized: false, // Neon uses self-signed certificates
  },

  // Serverless function optimizations
  max: 10, // Maximum number of clients in the pool (low for serverless)
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Wait max 10 seconds for connection
};

/**
 * PostgreSQL connection pool instance.
 *
 * This pool is reused across API route invocations in the same serverless
 * function instance, improving performance by avoiding repeated connections.
 *
 * Usage in API routes:
 * ```typescript
 * import { pool } from '@/lib/db';
 *
 * export async function GET() {
 *   const result = await pool.query('SELECT * FROM case_studies WHERE agent_slug = $1', ['fraud-trends']);
 *   return Response.json(result.rows);
 * }
 * ```
 */
export const pool = new Pool(poolConfig);

/**
 * Query helper with automatic error logging.
 *
 * This wrapper adds error logging and type safety for common query patterns.
 *
 * @param text - SQL query string (use $1, $2 for parameterized queries)
 * @param params - Query parameters (prevents SQL injection)
 * @returns Query result with rows array
 *
 * @example
 * ```typescript
 * const result = await query(
 *   'SELECT * FROM case_studies WHERE agent_slug = $1 AND display = $2',
 *   ['fraud-trends', true]
 * );
 * console.log(result.rows);
 * ```
 */
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number }> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries (>1000ms) in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`[DB] Slow query (${duration}ms):`, text);
    }

    return {
      rows: result.rows,
      rowCount: result.rowCount ?? 0, // Handle null rowCount
    };
  } catch (error) {
    // Log errors without exposing sensitive connection details
    console.error('[DB] Query error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      query: text.substring(0, 100), // First 100 chars only
    });
    throw error;
  }
}

/**
 * Health check to verify database connectivity.
 *
 * Useful for API health endpoints and debugging connection issues.
 *
 * @returns Promise that resolves if connection is healthy, rejects otherwise
 *
 * @example
 * ```typescript
 * export async function GET() {
 *   try {
 *     await healthCheck();
 *     return Response.json({ status: 'healthy' });
 *   } catch (error) {
 *     return Response.json({ status: 'unhealthy' }, { status: 503 });
 *   }
 * }
 * ```
 */
export async function healthCheck(): Promise<void> {
  const result = await pool.query('SELECT NOW() as current_time');
  if (!result.rows[0]) {
    throw new Error('Database health check failed');
  }
}

/**
 * Gracefully close all connections in the pool.
 *
 * Should be called when shutting down the application (e.g., in tests).
 * Not typically needed in serverless functions as they handle cleanup automatically.
 *
 * @example
 * ```typescript
 * // In tests
 * afterAll(async () => {
 *   await closePool();
 * });
 * ```
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

// Handle process termination gracefully
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGTERM', async () => {
    console.log('[DB] Closing connection pool (SIGTERM)');
    await closePool();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('[DB] Closing connection pool (SIGINT)');
    await closePool();
    process.exit(0);
  });
}
