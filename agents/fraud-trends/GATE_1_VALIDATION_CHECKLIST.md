# Gate 1 Validation Checklist

**Project:** Fraud Trends Investigator Agent
**Epic:** Epic 4 - Case Study Validation & Database Import
**Date Created:** 2025-02-09
**Purpose:** Validate database import system readiness before proceeding to Epic 5 (REST API)

---

## Overview

This checklist validates that the database import system is production-ready and can reliably import case study JSON files into PostgreSQL. All items must pass before proceeding to API development.

---

## 1. Database Schema Validation

### 1.1 Schema Existence
- [ ] PostgreSQL database exists and is accessible
- [ ] `case_studies` table exists with correct schema
- [ ] `execution_steps` table exists with correct schema
- [ ] Foreign key constraint from `execution_steps.case_study_id` to `case_studies.id` is active
- [ ] Indexes exist on primary keys and foreign keys

**Validation Command:**
```bash
psql $DATABASE_URL -c "\d case_studies"
psql $DATABASE_URL -c "\d execution_steps"
```

**Expected Output:**
- Both tables present with all required columns
- Correct data types (UUID, TEXT, JSONB, TIMESTAMP, etc.)
- Primary keys and foreign keys properly defined

---

### 1.2 Database Permissions
- [ ] Read-only user (`agent_api_readonly`) exists for future API use
- [ ] Read-only user has SELECT permissions on both tables
- [ ] Import script uses appropriate credentials (read-write access)
- [ ] Connection strings stored securely (environment variables, not hardcoded)

**Validation Command:**
```bash
psql $DATABASE_URL -c "\du agent_api_readonly"
psql $DATABASE_URL -c "SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name='case_studies';"
```

---

## 2. Import Script Functionality

### 2.1 Basic Import Operations
- [ ] Single file import works correctly
- [ ] Directory batch import works correctly
- [ ] Dry-run mode validates without database operations
- [ ] Script handles missing DATABASE_URL gracefully
- [ ] Script provides clear usage instructions with `--help`

**Validation Commands:**
```bash
# Test dry-run mode
python3 scripts/import_case_studies.py output/ --dry-run

# Test single file import (requires DATABASE_URL)
export DATABASE_URL="postgresql://user:password@host:port/database"
python3 scripts/import_case_studies.py output/case_study_20260210_001103.json

# Test batch import
python3 scripts/import_case_studies.py output/
```

**Expected Results:**
- Dry-run validates all files without database connection
- Single file import succeeds with commit
- Batch import processes all files with summary statistics

---

### 2.2 Data Validation
- [ ] UUID format validation works (rejects invalid IDs)
- [ ] Agent slug validation works (only accepts 'fraud-trends')
- [ ] Required field validation catches missing fields
- [ ] Data type validation catches type mismatches
- [ ] Nested structure validation works (input_parameters, output_result, execution_trace)
- [ ] Timestamp validation works (ISO 8601 format)
- [ ] Array validation works (non-empty checks)
- [ ] Enum validation works (confidence_level: high/medium/low)

**Test Cases:**
Create invalid test files and verify rejection:
```bash
# Invalid UUID
echo '{"id": "not-a-uuid", ...}' > test_invalid_uuid.json
python3 scripts/import_case_studies.py test_invalid_uuid.json --dry-run
# Expected: ✗ Invalid 'id': Must be valid UUID format

# Invalid agent_slug
echo '{"id": "valid-uuid", "agent_slug": "wrong-agent", ...}' > test_invalid_slug.json
python3 scripts/import_case_studies.py test_invalid_slug.json --dry-run
# Expected: ✗ Invalid 'agent_slug': Expected 'fraud-trends'

# Missing required field
echo '{"id": "valid-uuid", "agent_slug": "fraud-trends"}' > test_missing_field.json
python3 scripts/import_case_studies.py test_missing_field.json --dry-run
# Expected: ✗ Missing required field 'title'
```

---

### 2.3 Text Sanitization
- [ ] Null bytes are removed (PostgreSQL doesn't allow \x00)
- [ ] Whitespace is normalized (preserves newlines/tabs)
- [ ] UTF-8 encoding is enforced
- [ ] Special characters are handled (quotes, unicode, emojis)
- [ ] JSON fields are recursively sanitized

**Test Cases:**
```bash
# Create test file with special characters
cat > test_sanitization.json <<EOF
{
  "id": "test-uuid",
  "title": "Test with \"quotes\" and 'apostrophes'",
  "input_parameters": {
    "topic": "Test with emoji 🔥 and unicode €"
  }
}
EOF

python3 scripts/import_case_studies.py test_sanitization.json --dry-run
# Expected: Validation passes, special characters preserved
```

---

### 2.4 Database Connection Handling
- [ ] Connection retry logic works (3 attempts, 2s delay)
- [ ] Connection timeout works (10 seconds)
- [ ] Authentication errors are caught and reported
- [ ] Database unavailable errors trigger retries
- [ ] Database does not exist errors are fatal (no retry)
- [ ] Connection pool exhaustion is handled gracefully
- [ ] Closed connections are detected and replaced
- [ ] Error-aware connection return works (bad connections closed)

**Test Cases:**
```bash
# Test invalid credentials (should fail without retry)
export DATABASE_URL="postgresql://invalid:password@localhost:5432/test"
python3 scripts/import_case_studies.py output/
# Expected: ✗ Authentication failed (no retries)

# Test non-existent database (should fail without retry)
export DATABASE_URL="postgresql://user:password@localhost:5432/nonexistent"
python3 scripts/import_case_studies.py output/
# Expected: ✗ Database does not exist (no retries)

# Test connection timeout (should retry 3 times)
export DATABASE_URL="postgresql://user:password@192.0.2.1:5432/test"
python3 scripts/import_case_studies.py output/
# Expected: 3 retry attempts with 2s delays
```

---

### 2.5 Batch Import Features
- [ ] Pre-validation phase separates valid/invalid files
- [ ] Progress tracking shows current file and total count
- [ ] Continue-on-error mode processes all files despite failures
- [ ] Statistics collection tracks all metrics
- [ ] Summary display shows comprehensive results
- [ ] Error categorization (validation vs. import errors)
- [ ] Timing statistics are accurate

**Validation:**
```bash
# Create a batch with mixed valid/invalid files
mkdir test_batch
cp output/case_study_*.json test_batch/
echo '{"invalid": "json"}' > test_batch/invalid_file.json

python3 scripts/import_case_studies.py test_batch/
```

**Expected Output:**
```
Phase 1: Pre-validating files...
[1/4] Validating case_study_1.json... ✓
[2/4] Validating case_study_2.json... ✓
[3/4] Validating case_study_3.json... ✓
[4/4] Validating invalid_file.json... ✗

⚠ Invalid files (will be skipped):
  - invalid_file.json

Phase 2: Importing 3 validated files to database...
[1/3] Importing case_study_1.json
  ✓ Import successful
[2/3] Importing case_study_2.json
  ✓ Import successful
[3/3] Importing case_study_3.json
  ✓ Import successful

======================================================================
BATCH IMPORT SUMMARY
======================================================================

Total Files Found:       4
Valid Files:             3
Invalid Files:           1

Successful Imports:      3
Failed Imports:          1
Total Execution Steps:   18

Duration:                X.XXs

Imported Case Study IDs:
  - uuid-1
  - uuid-2
  - uuid-3

⚠ Validation Errors:
  - invalid_file.json: Validation failed

======================================================================
✓ ALL IMPORTS SUCCESSFUL
======================================================================
```

---

## 3. Data Integrity

### 3.1 Case Study Import
- [ ] All required fields are imported correctly
- [ ] Optional fields (subtitle, display_order) are handled correctly
- [ ] JSONB fields (input_parameters, output_result) are properly serialized
- [ ] Timestamps are stored in correct format
- [ ] Boolean fields (display, featured) have correct defaults
- [ ] ON CONFLICT clause updates existing records correctly

**Validation Queries:**
```sql
-- Verify case study was imported
SELECT id, agent_slug, title, created_at
FROM case_studies
WHERE id = 'test-case-study-id';

-- Verify JSONB structure
SELECT
  id,
  input_parameters->>'topic' as topic,
  output_result->>'confidence_level' as confidence
FROM case_studies
WHERE id = 'test-case-study-id';

-- Test upsert (re-import same file)
-- Should update existing record, not create duplicate
```

---

### 3.2 Execution Steps Import
- [ ] All execution steps are imported for each case study
- [ ] Step numbers are sequential and correct
- [ ] Text fields (step_name, step_type) are sanitized
- [ ] Optional fields (input_summary, output_summary, details) are handled
- [ ] JSONB details field is properly serialized
- [ ] Duration and timestamp fields are correct
- [ ] Re-import deletes old steps and inserts new ones

**Validation Queries:**
```sql
-- Count execution steps for a case study
SELECT COUNT(*)
FROM execution_steps
WHERE case_study_id = 'test-case-study-id';

-- Verify step sequence
SELECT step_number, step_name, step_type, duration_ms
FROM execution_steps
WHERE case_study_id = 'test-case-study-id'
ORDER BY step_number;

-- Verify JSONB details
SELECT step_number, details
FROM execution_steps
WHERE case_study_id = 'test-case-study-id'
  AND details IS NOT NULL;
```

---

### 3.3 Foreign Key Integrity
- [ ] Foreign key constraint prevents orphaned execution steps
- [ ] Deleting a case study cascades to execution steps (if configured)
- [ ] Cannot insert execution steps without valid case_study_id

**Validation Queries:**
```sql
-- Test foreign key constraint (should fail)
INSERT INTO execution_steps (
  case_study_id, step_number, step_name, step_type, timestamp
) VALUES (
  'non-existent-uuid', 1, 'Test', 'test', NOW()
);
-- Expected: ERROR: foreign key constraint violation

-- Verify no orphaned execution steps
SELECT es.case_study_id
FROM execution_steps es
LEFT JOIN case_studies cs ON es.case_study_id = cs.id
WHERE cs.id IS NULL;
-- Expected: 0 rows
```

---

## 4. Error Handling & Resilience

### 4.1 Graceful Degradation
- [ ] Script continues processing remaining files after errors (continue-on-error mode)
- [ ] Connection failures don't crash the entire batch
- [ ] Validation errors are collected and reported at end
- [ ] Import errors are collected and reported at end
- [ ] Partial success is clearly indicated

---

### 4.2 Transaction Safety
- [ ] Each file import is a separate transaction
- [ ] Rollback occurs on import failure
- [ ] No partial data is committed on error
- [ ] Connection is properly cleaned up on error

**Test Case:**
```bash
# Simulate import failure mid-transaction
# Manually interrupt import or cause database error
# Verify no partial data in database
```

---

### 4.3 Error Messages
- [ ] Validation errors are clear and actionable
- [ ] Database errors include helpful context
- [ ] Connection errors suggest troubleshooting steps
- [ ] File-level errors reference specific filenames
- [ ] Field-level errors reference specific field paths (e.g., "input_parameters.topic")

---

## 5. Performance & Scalability

### 5.1 Batch Performance
- [ ] Connection pooling reduces overhead
- [ ] Batch insert used for execution steps (not individual inserts)
- [ ] Pre-validation reduces database load
- [ ] Memory usage is reasonable for large batches
- [ ] Import time is acceptable (< 1s per case study)

**Benchmark:**
```bash
# Time batch import of 10 files
time python3 scripts/import_case_studies.py output/

# Expected: < 15 seconds for 10 case studies
```

---

### 5.2 Connection Pool
- [ ] Connection pool size is appropriate (1-5 connections)
- [ ] Connections are reused efficiently
- [ ] Pool doesn't leak connections
- [ ] Pool cleanup happens on script exit

---

## 6. Documentation & Usability

### 6.1 Documentation
- [ ] Script has comprehensive docstring
- [ ] Usage examples are provided in `--help`
- [ ] README documents import process
- [ ] Environment variables are documented
- [ ] Error messages are documented

---

### 6.2 Command-Line Interface
- [ ] `--help` flag works and is comprehensive
- [ ] `--dry-run` flag validates without database
- [ ] `--database-url` flag overrides environment variable
- [ ] Positional argument accepts file or directory
- [ ] Exit codes are meaningful (0=success, 1=failure)

---

### 6.3 Logging & Output
- [ ] Progress is visible during execution
- [ ] Summary statistics are comprehensive
- [ ] Errors are highlighted (✗ symbol)
- [ ] Successes are confirmed (✓ symbol)
- [ ] Warnings use appropriate symbol (⚠)

---

## 7. Security Validation

### 7.1 SQL Injection Prevention
- [ ] All queries use parameterized queries (no string concatenation)
- [ ] User input is never directly inserted into SQL
- [ ] JSONB fields use proper casting (::jsonb)
- [ ] Text fields are sanitized before insertion

**Security Audit:**
```bash
# Search for potential SQL injection vulnerabilities
grep -n "execute(.*%.*)" scripts/import_case_studies.py
# Expected: All uses are parameterized queries with %s placeholders

# Search for string concatenation in SQL
grep -n "f\".*INSERT" scripts/import_case_studies.py
grep -n "f'.*INSERT" scripts/import_case_studies.py
# Expected: No results (all queries use triple-quoted strings)
```

---

### 7.2 Credential Handling
- [ ] No credentials hardcoded in script
- [ ] DATABASE_URL read from environment variable
- [ ] Connection string not logged or printed
- [ ] Credentials not stored in version control

**Security Audit:**
```bash
# Search for hardcoded passwords
grep -i "password.*=" scripts/import_case_studies.py
# Expected: No hardcoded passwords

# Verify .env is in .gitignore
grep -n "^\.env$" .gitignore
# Expected: Found in .gitignore
```

---

### 7.3 Input Validation
- [ ] All external input is validated before use
- [ ] File paths are validated (existence, type)
- [ ] JSON structure is validated before database operations
- [ ] Data types are enforced (UUID, timestamps, enums)

---

## 8. Test Case Studies

### 8.1 Real Data Validation
- [ ] Import at least 3 real case studies from agent output
- [ ] Verify all data is intact after import
- [ ] Query data to ensure retrievability
- [ ] Verify execution trace completeness

**Test Case:**
```bash
# Generate fresh case studies
python3 run_agent.py  # Run 3 times with different topics

# Import all generated case studies
python3 scripts/import_case_studies.py output/

# Verify count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM case_studies WHERE agent_slug='fraud-trends';"
# Expected: 3 or more

# Verify execution steps
psql $DATABASE_URL -c "SELECT cs.id, COUNT(es.step_number) as steps FROM case_studies cs LEFT JOIN execution_steps es ON cs.id = es.case_study_id GROUP BY cs.id;"
# Expected: Each case study has 6+ execution steps
```

---

## 9. Gate 1 Decision Criteria

### 9.1 Required for PASS
All of the following must be TRUE:

- [ ] **Database schema is correct** (Section 1)
- [ ] **Basic import operations work** (Section 2.1)
- [ ] **Data validation is comprehensive** (Section 2.2)
- [ ] **Text sanitization prevents SQL errors** (Section 2.3)
- [ ] **Database connection handling is robust** (Section 2.4)
- [ ] **Batch import features are complete** (Section 2.5)
- [ ] **Data integrity is maintained** (Section 3)
- [ ] **Error handling is graceful** (Section 4)
- [ ] **Security validation passes** (Section 7)
- [ ] **At least 3 real case studies imported successfully** (Section 8)

### 9.2 Optional (Nice to Have)
These are recommended but not required:

- [ ] Performance benchmarks meet targets (Section 5)
- [ ] Documentation is comprehensive (Section 6)
- [ ] Additional test cases created for edge scenarios

### 9.3 Blockers (Auto-FAIL)
Any of the following will FAIL Gate 1:

- ❌ SQL injection vulnerability found
- ❌ Credentials hardcoded in script
- ❌ Data loss or corruption during import
- ❌ Foreign key integrity violated
- ❌ Cannot import real case studies from agent

---

## 10. Sign-Off

### 10.1 Validation Results

**Date Tested:** _________________

**Tested By:** _________________

**Database URL (host only, no credentials):** _________________

**Number of Test Files:** _________________

**Pass/Fail Summary:**
- Section 1 (Database Schema): ⬜ PASS  ⬜ FAIL
- Section 2 (Import Script): ⬜ PASS  ⬜ FAIL
- Section 3 (Data Integrity): ⬜ PASS  ⬜ FAIL
- Section 4 (Error Handling): ⬜ PASS  ⬜ FAIL
- Section 5 (Performance): ⬜ PASS  ⬜ FAIL  ⬜ SKIP (optional)
- Section 6 (Documentation): ⬜ PASS  ⬜ FAIL  ⬜ SKIP (optional)
- Section 7 (Security): ⬜ PASS  ⬜ FAIL
- Section 8 (Real Data): ⬜ PASS  ⬜ FAIL

### 10.2 Final Decision

**Gate 1 Status:** ⬜ PASS - Proceed to Epic 5  ⬜ FAIL - Fix issues and re-validate

**Notes:**
```
[Record any issues, concerns, or recommendations here]
```

**Approver Signature:** _________________

**Date:** _________________

---

## Appendix A: Quick Validation Script

```bash
#!/bin/bash
# Quick validation script for Gate 1 checklist

set -e

echo "==================================================================="
echo "GATE 1 VALIDATION SCRIPT"
echo "==================================================================="
echo ""

# Check environment
echo "1. Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
  echo "  ✗ DATABASE_URL not set"
  exit 1
else
  echo "  ✓ DATABASE_URL is set"
fi

# Check database schema
echo ""
echo "2. Checking database schema..."
psql $DATABASE_URL -c "\d case_studies" > /dev/null 2>&1 && echo "  ✓ case_studies table exists" || echo "  ✗ case_studies table missing"
psql $DATABASE_URL -c "\d execution_steps" > /dev/null 2>&1 && echo "  ✓ execution_steps table exists" || echo "  ✗ execution_steps table missing"

# Check dry-run mode
echo ""
echo "3. Testing dry-run mode..."
python3 scripts/import_case_studies.py output/ --dry-run > /dev/null 2>&1 && echo "  ✓ Dry-run mode works" || echo "  ✗ Dry-run mode failed"

# Check batch import
echo ""
echo "4. Testing batch import..."
python3 scripts/import_case_studies.py output/ > /tmp/import_log.txt 2>&1
if [ $? -eq 0 ]; then
  echo "  ✓ Batch import succeeded"
  cat /tmp/import_log.txt | grep "BATCH IMPORT SUMMARY" -A 20
else
  echo "  ✗ Batch import failed"
  cat /tmp/import_log.txt
  exit 1
fi

# Verify data
echo ""
echo "5. Verifying imported data..."
CASE_COUNT=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM case_studies WHERE agent_slug='fraud-trends';")
STEP_COUNT=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM execution_steps;")
echo "  Case studies imported: $CASE_COUNT"
echo "  Execution steps imported: $STEP_COUNT"

if [ "$CASE_COUNT" -ge 3 ]; then
  echo "  ✓ Sufficient case studies imported"
else
  echo "  ✗ Need at least 3 case studies"
  exit 1
fi

echo ""
echo "==================================================================="
echo "GATE 1 VALIDATION: PASSED"
echo "==================================================================="
```

---

## Appendix B: Troubleshooting Guide

### Common Issues

**Issue: "psycopg2 is not installed"**
```bash
Solution: pip install psycopg2-binary
```

**Issue: "DATABASE_URL not set"**
```bash
Solution: export DATABASE_URL="postgresql://user:password@host:port/database"
```

**Issue: "Database does not exist"**
```bash
Solution: Create database first
psql -U postgres -c "CREATE DATABASE your_database_name;"
```

**Issue: "Authentication failed"**
```bash
Solution: Check credentials in DATABASE_URL
- Verify username and password are correct
- Verify user has CREATE, INSERT, UPDATE permissions
```

**Issue: "Connection timeout"**
```bash
Solution: Check network connectivity and database availability
- Verify database server is running
- Check firewall rules
- Verify host and port are correct
```

**Issue: "Null byte in data"**
```bash
Solution: Text sanitization should remove these automatically
- If error persists, check sanitize_text() function
- Verify data source doesn't have embedded null bytes
```

---

**End of Gate 1 Validation Checklist**
