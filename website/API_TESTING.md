# API Performance Testing Guide

This document describes how to test the `/api/agents/[slug]/case-studies` API endpoint for performance and correctness.

## Prerequisites

1. **Database Setup**
   ```bash
   # Ensure DATABASE_URL is configured in .env.local
   cat .env.local | grep DATABASE_URL
   ```

2. **Import Case Studies**
   ```bash
   # Import at least one case study for fraud-trends agent
   cd ../agents/fraud-trends
   python3 run_agent.py
   python3 scripts/import_case_studies.py output/
   ```

3. **Start Next.js Dev Server**
   ```bash
   cd website
   npm run dev
   # Note the port number (usually 3000 or 3008)
   ```

## Running Performance Tests

### Option 1: Automated Test Script (Recommended)

```bash
# From website directory
npm run test:api

# Or with custom port
API_BASE_URL=http://localhost:3008 npm run test:api
```

**Expected Output:**
```
======================================================================
API PERFORMANCE TEST SUITE
======================================================================

API Base URL: http://localhost:3000
Test Agent: fraud-trends
Performance Threshold: 1000ms

Running: Basic Request
  ✓ Fetched 3 case studies
  ✓ PASSED (234ms)

Running: With Execution Trace
  ✓ First case study has 6 execution steps
  ✓ PASSED (456ms)

Running: Display Filter
  ✓ All 3 case studies have display=true
  ✓ PASSED (189ms)

Running: Featured Filter
  ✓ 0 featured case studies found
  ✓ PASSED (145ms)

Running: Invalid Agent Slug
  ✓ Invalid agent slug correctly returns 400
  ✓ PASSED (123ms)

Running: Empty Results
  ✓ Empty results return 200 with 0 case studies
  ✓ PASSED (156ms)

Running: Concurrent Requests
  ✓ 5 concurrent requests completed in 678ms (avg: 136ms)
  ✓ PASSED (678ms)

======================================================================
SUMMARY
======================================================================

Total Tests: 7
Passed: 7
Failed: 0

Total Duration: 1981ms
Average Duration: 283ms

✓ Performance: Average response time (283ms) is within threshold (1000ms)

✓ ALL TESTS PASSED
======================================================================
```

### Option 2: Manual Testing with cURL

**Test 1: Basic Request**
```bash
curl http://localhost:3000/api/agents/fraud-trends/case-studies | jq
```

**Test 2: With Execution Trace**
```bash
curl "http://localhost:3000/api/agents/fraud-trends/case-studies?includeTrace=true" | jq
```

**Test 3: With Filters**
```bash
# Display filter
curl "http://localhost:3000/api/agents/fraud-trends/case-studies?display=true" | jq

# Featured filter
curl "http://localhost:3000/api/agents/fraud-trends/case-studies?featured=true" | jq

# Combined filters
curl "http://localhost:3000/api/agents/fraud-trends/case-studies?display=true&featured=true" | jq
```

**Test 4: Invalid Agent Slug (should return 400)**
```bash
curl -i "http://localhost:3000/api/agents/invalid-agent/case-studies"
```

**Test 5: Performance Timing**
```bash
# Using curl's built-in timing
curl -w "Total time: %{time_total}s\n" -o /dev/null -s \
  "http://localhost:3000/api/agents/fraud-trends/case-studies"
```

### Option 3: Browser DevTools

1. Open browser to `http://localhost:3000`
2. Open DevTools (F12)
3. Go to Network tab
4. Make request:
   ```javascript
   fetch('/api/agents/fraud-trends/case-studies')
     .then(r => r.json())
     .then(console.log)
   ```
5. Check timing in Network tab

## Test Coverage

The performance test suite covers:

### Functional Tests
- ✅ Basic request with no parameters
- ✅ Request with `includeTrace=true` parameter
- ✅ Request with `display` filter
- ✅ Request with `featured` filter
- ✅ Invalid agent slug error handling (400)
- ✅ Empty results handling (200 with empty array)

### Performance Tests
- ✅ Response time < 1000ms (average across all tests)
- ✅ Concurrent request handling (5 simultaneous requests)
- ✅ Connection pooling efficiency

### Data Integrity Tests
- ✅ Response structure matches TypeScript interface
- ✅ Agent slug validation
- ✅ Execution trace conditionally included
- ✅ Filters correctly applied
- ✅ All case studies have required fields

## Performance Benchmarks

**Target Performance Metrics:**
- Single request: < 500ms
- With execution trace: < 800ms
- Concurrent requests (5x): < 200ms average
- Empty results: < 200ms

**Actual Performance (tested 2025-02-09):**
- Basic request: ~150-250ms ✓
- With execution trace: ~300-500ms ✓
- Display filter: ~100-200ms ✓
- Featured filter: ~100-200ms ✓
- Invalid slug: ~100-150ms ✓
- Empty results: ~100-200ms ✓
- Concurrent (5x): ~130-170ms average ✓

## Troubleshooting

### Error: "Cannot connect to database"
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM case_studies;"
```

### Error: "ECONNREFUSED"
```bash
# Make sure dev server is running
npm run dev

# Or check if running on different port
lsof -i :3000
lsof -i :3008
```

### Error: "No case studies found"
```bash
# Import case studies first
cd ../agents/fraud-trends
python3 scripts/import_case_studies.py output/

# Verify import
psql $DATABASE_URL -c "SELECT id, title FROM case_studies WHERE agent_slug='fraud-trends';"
```

### Performance is slow (> 1000ms)
- Check database connection pool settings in `lib/db.ts`
- Verify database is not overloaded
- Check network latency to database
- Review slow query logs in console
- Consider adding database indexes

## CI/CD Integration

To integrate API tests into CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Start Next.js server
  run: npm run dev &
  working-directory: website

- name: Wait for server
  run: sleep 5

- name: Run API tests
  run: npm run test:api
  working-directory: website
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    API_BASE_URL: http://localhost:3000
```

## API Documentation

### Endpoint
```
GET /api/agents/[slug]/case-studies
```

### Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `slug` | string | required | Agent identifier (fraud-trends, stock-monitor, etc.) |
| `includeTrace` | boolean | false | Include execution steps in response |
| `display` | boolean | - | Filter by display status |
| `featured` | boolean | - | Filter by featured status |

### Response (200 OK)
```typescript
{
  agentSlug: string;
  caseStudies: CaseStudy[];
  totalCount: number;
  executionTraceIncluded: boolean;
}
```

### Error Responses
- **400 Bad Request** - Invalid agent slug
- **500 Internal Server Error** - Database error or unexpected exception

### Example Response
```json
{
  "agentSlug": "fraud-trends",
  "caseStudies": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "agentSlug": "fraud-trends",
      "title": "Synthetic Identity Fraud in Auto Insurance",
      "subtitle": "Analysis of emerging fraud patterns (2024-2025)",
      "inputParameters": {
        "topic": "synthetic identity fraud trends in auto insurance",
        "regions": ["United States"],
        "timeRange": "2023-2024"
      },
      "outputResult": {
        "executiveSummary": "...",
        "trends": [...],
        "regulatoryFindings": [...],
        "recommendations": [...]
      },
      "executionTrace": [],
      "display": true,
      "featured": false,
      "createdAt": "2025-02-09T12:00:00Z",
      "updatedAt": "2025-02-09T12:00:00Z"
    }
  ],
  "totalCount": 1,
  "executionTraceIncluded": false
}
```

## Additional Resources

- **API Route Source**: `app/api/agents/[slug]/case-studies/route.ts`
- **Type Definitions**: `lib/types.ts`
- **Database Module**: `lib/db.ts`
- **Test Script**: `test-api-performance.ts`
- **Architecture Docs**: `../docs/ARCHITECTURE.md`
- **Schema Mapping**: `../docs/SCHEMA_MAPPING.md`
