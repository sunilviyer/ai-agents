/**
 * API Performance Test Script
 *
 * Tests the /api/agents/[slug]/case-studies endpoint for:
 * - Response time (should be < 1000ms)
 * - Correct response format
 * - Error handling
 * - Query parameter functionality
 *
 * Usage:
 *   npx tsx test-api-performance.ts
 *
 * Prerequisites:
 *   - Next.js dev server running (npm run dev)
 *   - DATABASE_URL configured in .env.local
 *   - At least one case study imported for fraud-trends
 *
 * Implementation: Epic 5, Story 5.8
 */

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: unknown;
}

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_AGENT_SLUG = 'fraud-trends';
const PERFORMANCE_THRESHOLD_MS = 1000;

/**
 * Execute a single API test with timing
 */
async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<TestResult> {
  const start = Date.now();
  try {
    await testFn();
    const duration = Date.now() - start;
    return {
      name,
      passed: true,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      name,
      passed: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Test 1: Basic request with no parameters
 */
async function testBasicRequest(): Promise<void> {
  const url = `${API_BASE_URL}/api/agents/${TEST_AGENT_SLUG}/case-studies`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // Validate response structure
  if (!data.agentSlug || !Array.isArray(data.caseStudies)) {
    throw new Error('Invalid response structure');
  }

  if (data.agentSlug !== TEST_AGENT_SLUG) {
    throw new Error(
      `Expected agentSlug '${TEST_AGENT_SLUG}', got '${data.agentSlug}'`
    );
  }

  console.log(`  ✓ Fetched ${data.totalCount} case studies`);
}

/**
 * Test 2: Request with includeTrace=true
 */
async function testWithExecutionTrace(): Promise<void> {
  const url = `${API_BASE_URL}/api/agents/${TEST_AGENT_SLUG}/case-studies?includeTrace=true`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.executionTraceIncluded) {
    throw new Error('executionTraceIncluded should be true');
  }

  // Check if case studies have execution traces
  if (data.caseStudies.length > 0) {
    const firstCase = data.caseStudies[0];
    if (!Array.isArray(firstCase.executionTrace)) {
      throw new Error('executionTrace should be an array');
    }
    console.log(
      `  ✓ First case study has ${firstCase.executionTrace.length} execution steps`
    );
  } else {
    console.log('  ⚠ No case studies found (cannot verify execution trace)');
  }
}

/**
 * Test 3: Request with display filter
 */
async function testDisplayFilter(): Promise<void> {
  const url = `${API_BASE_URL}/api/agents/${TEST_AGENT_SLUG}/case-studies?display=true`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // All returned case studies should have display=true
  for (const caseStudy of data.caseStudies) {
    if (caseStudy.display !== true) {
      throw new Error(`Case study ${caseStudy.id} has display=${caseStudy.display}`);
    }
  }

  console.log(`  ✓ All ${data.totalCount} case studies have display=true`);
}

/**
 * Test 4: Request with featured filter
 */
async function testFeaturedFilter(): Promise<void> {
  const url = `${API_BASE_URL}/api/agents/${TEST_AGENT_SLUG}/case-studies?featured=true`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // All returned case studies should have featured=true
  for (const caseStudy of data.caseStudies) {
    if (caseStudy.featured !== true) {
      throw new Error(`Case study ${caseStudy.id} has featured=${caseStudy.featured}`);
    }
  }

  console.log(`  ✓ ${data.totalCount} featured case studies found`);
}

/**
 * Test 5: Invalid agent slug should return 400
 */
async function testInvalidAgentSlug(): Promise<void> {
  const url = `${API_BASE_URL}/api/agents/invalid-agent/case-studies`;
  const response = await fetch(url);

  if (response.status !== 400) {
    throw new Error(`Expected HTTP 400, got ${response.status}`);
  }

  const data = await response.json();

  if (!data.error || data.error.code !== 'INVALID_AGENT_SLUG') {
    throw new Error('Expected INVALID_AGENT_SLUG error');
  }

  console.log('  ✓ Invalid agent slug correctly returns 400');
}

/**
 * Test 6: Empty results should return 200 with empty array
 */
async function testEmptyResults(): Promise<void> {
  const url = `${API_BASE_URL}/api/agents/${TEST_AGENT_SLUG}/case-studies?featured=true&display=false`;
  const response = await fetch(url);

  if (response.status !== 200) {
    throw new Error(`Expected HTTP 200, got ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data.caseStudies)) {
    throw new Error('caseStudies should be an array');
  }

  console.log(`  ✓ Empty results return 200 with ${data.totalCount} case studies`);
}

/**
 * Test 7: Performance - multiple concurrent requests
 */
async function testConcurrentRequests(): Promise<void> {
  const numRequests = 5;
  const url = `${API_BASE_URL}/api/agents/${TEST_AGENT_SLUG}/case-studies`;

  const start = Date.now();
  const promises = Array(numRequests)
    .fill(null)
    .map(() => fetch(url));

  const responses = await Promise.all(promises);
  const duration = Date.now() - start;

  // All should succeed
  for (const response of responses) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
  }

  const avgDuration = duration / numRequests;
  console.log(
    `  ✓ ${numRequests} concurrent requests completed in ${duration}ms (avg: ${avgDuration.toFixed(0)}ms)`
  );

  if (avgDuration > PERFORMANCE_THRESHOLD_MS) {
    throw new Error(
      `Average response time ${avgDuration.toFixed(0)}ms exceeds threshold ${PERFORMANCE_THRESHOLD_MS}ms`
    );
  }
}

/**
 * Main test runner
 */
async function main(): Promise<void> {
  console.log('='.repeat(70));
  console.log('API PERFORMANCE TEST SUITE');
  console.log('='.repeat(70));
  console.log();
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Test Agent: ${TEST_AGENT_SLUG}`);
  console.log(`Performance Threshold: ${PERFORMANCE_THRESHOLD_MS}ms`);
  console.log();

  const tests = [
    { name: 'Basic Request', fn: testBasicRequest },
    { name: 'With Execution Trace', fn: testWithExecutionTrace },
    { name: 'Display Filter', fn: testDisplayFilter },
    { name: 'Featured Filter', fn: testFeaturedFilter },
    { name: 'Invalid Agent Slug', fn: testInvalidAgentSlug },
    { name: 'Empty Results', fn: testEmptyResults },
    { name: 'Concurrent Requests', fn: testConcurrentRequests },
  ];

  const results: TestResult[] = [];

  for (const test of tests) {
    console.log(`Running: ${test.name}`);
    const result = await runTest(test.name, test.fn);
    results.push(result);

    if (result.passed) {
      console.log(`  ✓ PASSED (${result.duration}ms)`);
    } else {
      console.log(`  ✗ FAILED (${result.duration}ms)`);
      console.log(`    Error: ${result.error}`);
    }
    console.log();
  }

  // Summary
  console.log('='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log();

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const avgDuration = totalDuration / results.length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log();
  console.log(`Total Duration: ${totalDuration}ms`);
  console.log(`Average Duration: ${avgDuration.toFixed(0)}ms`);
  console.log();

  // Performance check
  if (avgDuration > PERFORMANCE_THRESHOLD_MS) {
    console.log(
      `⚠ WARNING: Average response time (${avgDuration.toFixed(0)}ms) exceeds threshold (${PERFORMANCE_THRESHOLD_MS}ms)`
    );
  } else {
    console.log(
      `✓ Performance: Average response time (${avgDuration.toFixed(0)}ms) is within threshold (${PERFORMANCE_THRESHOLD_MS}ms)`
    );
  }

  console.log();

  if (failed > 0) {
    console.log('✗ SOME TESTS FAILED');
    console.log('='.repeat(70));
    process.exit(1);
  } else {
    console.log('✓ ALL TESTS PASSED');
    console.log('='.repeat(70));
    process.exit(0);
  }
}

// Run tests
main().catch((error) => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
