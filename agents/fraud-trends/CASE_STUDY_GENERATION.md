# Case Study Generation Guide

This guide explains how to generate case studies for the Fraud Trends Investigator agent.

## Current Case Studies

**Location:** `output/`

**Existing Case Studies (3):**
1. `case_study_20260209_225910.json` - Synthetic Identity Fraud in Auto Insurance
2. `case_study_20260209_230251.json` - Synthetic Identity Fraud in Auto Insurance (duplicate)
3. `case_study_20260210_001103.json` - Benefits for Data Sharing Across Insurers

**Status:** Need 2 more diverse case studies to reach target of 5

---

## Method 1: Batch Generation Script (Recommended)

Generate all 5 case studies with diverse topics automatically.

### Usage

```bash
# From agents/fraud-trends directory
python3 generate_case_studies.py
```

### Topics Covered

The script generates case studies for:

1. **Synthetic Identity Fraud** (Auto Insurance)
   - Region: United States
   - Time Range: 2023-2024
   - Focus: Fabricated identities in auto insurance

2. **Data Sharing Benefits** (Cross-Industry)
   - Regions: United States, United Kingdom
   - Time Range: 2024-2025
   - Focus: Inter-insurer collaboration for fraud prevention

3. **Telematics Fraud** (Usage-Based Insurance)
   - Regions: United States, Canada
   - Time Range: 2023-2024
   - Focus: Manipulation of telematics devices

4. **Medical Provider Fraud** (Health Insurance)
   - Region: United States
   - Time Range: 2024-2025
   - Focus: Healthcare provider billing fraud

5. **Property Claims Inflation** (Homeowners Insurance)
   - Region: United States
   - Time Range: 2023-2024
   - Focus: Exaggerated property damage claims

### Expected Output

```
======================================================================
FRAUD TRENDS AGENT - BATCH CASE STUDY GENERATION
======================================================================

Generating 5 case studies...

======================================================================
GENERATING CASE STUDY 1/5
======================================================================
Topic: Synthetic identity fraud using fabricated identities
Regions: United States
Time Range: 2023-2024

[1/5] Step 1: Planning research strategy...
  ✓ Generated 3+2+2 queries
[1/5] Step 2: Searching industry sources...
  ✓ Found 25 industry sources
[1/5] Step 3: Searching regulatory sources...
  ✓ Found 15 regulatory sources
[1/5] Step 4: Searching academic sources...
  ✓ Found 10 academic sources
[1/5] Step 5: Extracting key findings...
  ✓ Extracted 4 trends, 2 regulatory findings
[1/5] Step 6: Synthesizing final report...
  ✓ Generated report with 7 recommendations
[1/5] Generating JSON output...
  ✓ Saved to: output/case_study_20260210_140530.json

✓ Case Study 1/5 completed successfully
  - Total sources: 50
  - Trends identified: 4
  - Recommendations: 7
  - Confidence: HIGH
  - Output: output/case_study_20260210_140530.json

[... continues for all 5 case studies ...]

======================================================================
BATCH GENERATION COMPLETE
======================================================================

Total case studies: 5
Successful: 5
Failed: 0

✓ All case studies generated successfully!

Next steps:
  1. Review case studies in output/ directory
  2. Import to database: python3 scripts/import_case_studies.py output/
```

### Execution Time

- Each case study: ~2-4 minutes
- Total for 5 case studies: ~10-20 minutes
- Progress displayed in real-time

---

## Method 2: Manual Single Generation

Generate one case study at a time with custom topics.

### Usage

```bash
# From agents/fraud-trends directory
python3 run_agent.py
```

### Customize Topic

Edit `run_agent.py` and modify the input parameters:

```python
fraud_input = FraudTrendsInput(
    topic="your custom fraud topic here",
    regions=["United States", "Canada"],  # Customize regions
    time_range="2024-2025"  # Customize time range
)
```

### Example Topics

**Auto Insurance:**
- "staged accident fraud rings in auto insurance"
- "rental car fraud schemes"
- "airbag fraud and parts replacement schemes"

**Health Insurance:**
- "upcoding and unbundling in medical billing"
- "prescription drug diversion schemes"
- "phantom billing by medical providers"

**Property Insurance:**
- "contractor fraud in insurance repairs"
- "arson-for-profit schemes in property insurance"
- "public adjuster fraud and kickbacks"

**Life Insurance:**
- "stranger-originated life insurance (STOLI) schemes"
- "premium diversion by agents"
- "death certificate fraud"

**Workers Compensation:**
- "doctor shopping in workers compensation claims"
- "premium fraud by employers"
- "employee classification fraud"

---

## Post-Generation Steps

### Step 1: Review Generated Case Studies

```bash
# List all case studies
ls -lh output/

# View case study titles
for file in output/*.json; do
  echo "=== $(basename $file) ==="
  jq -r '.title' "$file"
done

# Check case study details
jq '.output_result.confidence_level, .output_result.trends | length' output/case_study_*.json
```

### Step 2: Validate Case Studies

```bash
# Dry-run validation
python3 scripts/import_case_studies.py output/ --dry-run

# Expected output:
# Validation complete: 5 valid, 0 invalid
```

### Step 3: Import to Database

```bash
# Import all case studies
python3 scripts/import_case_studies.py output/

# Verify import
psql $DATABASE_URL -c "SELECT id, title, created_at FROM case_studies WHERE agent_slug='fraud-trends' ORDER BY created_at DESC;"
```

---

## Quality Checklist

Before proceeding to deployment, verify:

- [ ] At least 5 case studies generated
- [ ] Diverse topics covered (not all duplicates)
- [ ] All case studies have valid JSON structure
- [ ] Each case study has 6 execution steps
- [ ] Confidence level is present (high/medium/low)
- [ ] At least 3+ trends identified per case study
- [ ] At least 5+ recommendations per case study
- [ ] Source tier breakdown shows Tier 1 sources (>20%)
- [ ] Executive summary is comprehensive (2-3 paragraphs)
- [ ] All case studies successfully import to database

---

## Troubleshooting

### Error: "ANTHROPIC_API_KEY not set"

```bash
# Check .env file
cat .env | grep ANTHROPIC_API_KEY

# Or set temporarily
export ANTHROPIC_API_KEY="sk-ant-api..."
```

### Error: "TAVILY_API_KEY not set"

```bash
# Check .env file
cat .env | grep TAVILY_API_KEY

# Or set temporarily
export TAVILY_API_KEY="tvly-..."
```

### Error: "No sources found"

**Possible causes:**
- Tavily API rate limit reached
- Network connectivity issues
- Invalid search queries

**Solution:**
- Wait 1 minute and retry
- Check Tavily API quota: https://app.tavily.com
- Verify internet connection

### Error: "LLM API error"

**Possible causes:**
- Anthropic API rate limit
- Invalid API key
- Network issues

**Solution:**
- Wait 1 minute and retry
- Verify API key is valid
- Check Anthropic API status

### Duplicate Case Studies

If generating duplicate topics:

```bash
# Remove duplicate case studies
rm output/case_study_20260209_225910.json  # Keep only one synthetic identity

# Re-generate with different topic
# Edit run_agent.py or use batch script
```

---

## Performance Optimization

### Parallel Generation (Advanced)

```bash
# Generate multiple case studies in parallel (requires GNU parallel)
parallel -j 2 'python3 run_agent.py --topic {}' ::: \
  "telematics fraud" \
  "medical provider fraud" \
  "property claims inflation"
```

### Rate Limit Management

- **Anthropic API:** 50 requests/minute (Claude Haiku)
- **Tavily API:** 100 requests/minute (varies by plan)

**Best Practice:** Generate case studies sequentially with 2-second delays

---

## Next Steps After Generation

1. **Review Quality** - Manually review 1-2 case studies for accuracy
2. **Import to Database** - Run import script
3. **Test API** - Verify case studies appear in API
4. **Deploy to Production** - Proceed with Epic 6 deployment steps

---

## Additional Resources

- **Agent Documentation:** `README.md`
- **Workflow Visualization:** `WORKFLOW_VISUALIZATION.md`
- **Import Script:** `scripts/import_case_studies.py`
- **Gate 1 Checklist:** `GATE_1_VALIDATION_CHECKLIST.md`
