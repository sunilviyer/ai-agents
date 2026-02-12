# Deployment Guide - AI Agents Portfolio

**Project:** AI Agents Portfolio
**Production URL:** https://ai-agents-rosy-mu.vercel.app
**Last Updated:** 2026-02-11
**Epic:** Epic 6 - Deployment & Gate 1 Validation

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Initial Setup](#initial-setup)
5. [Deployment Workflow](#deployment-workflow)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [API Endpoints](#api-endpoints)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedures](#rollback-procedures)

---

## Overview

This project deploys a **Next.js REST API** to **Vercel** that serves case studies from a **PostgreSQL database** (hosted on Neon). The API supports multiple AI agents through a universal schema design.

### Current Status

- ✅ **Production Deployed:** https://ai-agents-rosy-mu.vercel.app
- ✅ **Database:** Neon PostgreSQL (pooled connection)
- ✅ **Framework:** Next.js 16.1.6 (App Router)
- ✅ **Hosting:** Vercel (Automatic Git deployments)
- ✅ **Agents:** 1 active (fraud-trends)
- ✅ **Case Studies:** 3 imported

---

## Architecture

```
┌─────────────────┐
│   GitHub Repo   │
│  (main branch)  │
└────────┬────────┘
         │
         │ (push triggers deployment)
         ↓
┌─────────────────┐
│     Vercel      │
│  Build & Deploy │
└────────┬────────┘
         │
         │ (Next.js API)
         ↓
┌─────────────────┐        ┌──────────────────┐
│  Production API │◄──────►│ Neon PostgreSQL  │
│ ai-agents-*.app │        │  (Read-Only User)│
└─────────────────┘        └──────────────────┘
         │
         │ (JSON responses)
         ↓
┌─────────────────┐
│   API Clients   │
│ (Future Website)│
└─────────────────┘
```

### Technology Stack

- **Frontend Framework:** Next.js 16.1.6 (App Router)
- **Runtime:** Node.js 24.x
- **Database:** PostgreSQL 15 (Neon)
- **Database Driver:** node-postgres (pg)
- **Hosting:** Vercel (Serverless Functions)
- **CI/CD:** Automatic Git deployments
- **SSL:** Vercel auto-provisioned

---

## Prerequisites

### Required Accounts

1. **GitHub Account**
   - Repository: `https://github.com/[your-username]/ai-agents`
   - Access: Push access to `main` branch

2. **Vercel Account**
   - Sign up: https://vercel.com
   - Connected to GitHub repository

3. **Neon Account** (or any PostgreSQL provider)
   - Database created
   - Read-only user configured
   - Connection pooling enabled

### Local Development Tools

```bash
# Node.js (v20 or later recommended)
node --version  # Should be v20.x or v24.x

# npm (comes with Node.js)
npm --version

# Git
git --version

# PostgreSQL client (for database operations)
psql --version
```

---

## Initial Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/[your-username]/ai-agents.git
cd ai-agents
```

### Step 2: Install Dependencies

```bash
# Install Next.js dependencies
npm install

# Verify installation
npm list next react react-dom pg
```

### Step 3: Configure Local Environment

Create `.env.local` in the project root:

```bash
# Database connection (use your actual credentials)
DATABASE_URL=postgresql://api_readonly:YOUR_PASSWORD@YOUR_HOST.neon.tech/YOUR_DB?sslmode=require
```

**Important:** Never commit `.env.local` to git (it's already in `.gitignore`)

### Step 4: Test Local API

```bash
# Start development server
npm run dev

# Test API (in another terminal)
curl http://localhost:3000/api/agents/fraud-trends/case-studies | jq
```

**Expected Response:**
```json
{
  "agentSlug": "fraud-trends",
  "totalCount": 3,
  "caseStudies": [...],
  "executionTraceIncluded": false
}
```

---

## Deployment Workflow

### Method 1: Automatic Git Deployment (Recommended)

This is the **primary deployment method** for production.

#### How It Works

1. Push code to `main` branch on GitHub
2. Vercel detects the push via webhook
3. Vercel automatically builds and deploys
4. New deployment is live in ~30-60 seconds

#### Step-by-Step Process

**1. Make Changes**
```bash
# Edit files (e.g., API routes, components)
vim app/api/agents/[slug]/case-studies/route.ts

# Test locally
npm run dev
```

**2. Commit Changes**
```bash
git add .
git commit -m "Update: Description of changes"
```

**3. Push to GitHub**
```bash
git push origin main
```

**4. Monitor Deployment**

Option A: Vercel Dashboard
- Visit: https://vercel.com/[your-org]/ai-agents
- Check "Deployments" tab

Option B: GitHub
- Check commit status (Vercel bot comments on commits)

**5. Verify Deployment**
```bash
# Wait ~30-60 seconds, then test
curl "https://ai-agents-rosy-mu.vercel.app/api/agents/fraud-trends/case-studies" | jq '.totalCount'
```

### Method 2: Manual Vercel CLI Deployment (Not Recommended)

Only use this for testing. Production should always use Git deployments.

```bash
# NOT recommended for production
vercel --prod
```

---

## Environment Variables

### Required Variables

All environment variables are configured in the **Vercel Dashboard**.

#### DATABASE_URL

**Purpose:** PostgreSQL connection string for API
**Format:** `postgresql://user:password@host:port/database?sslmode=require`

**Configuration:**
1. Go to: https://vercel.com/[your-org]/ai-agents/settings/environment-variables
2. Add variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Your actual database URL
   - **Environments:** ✅ Production ✅ Preview ✅ Development

**Security:**
- ✅ Encrypted in Vercel
- ✅ Not visible in build logs
- ✅ Never committed to git

#### Example Value

```
postgresql://api_readonly:npg_readonly_2025_secure@ep-purple-flower-aix6l70h-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Components:**
- **User:** `api_readonly` (read-only permissions)
- **Password:** `npg_readonly_2025_secure` (example)
- **Host:** `ep-purple-flower-aix6l70h-pooler.c-4.us-east-1.aws.neon.tech` (Neon pooler)
- **Database:** `neondb`
- **SSL:** `?sslmode=require` (required for security)

### Updating Environment Variables

When you update environment variables in Vercel:

1. **Update in Dashboard**
   - Settings → Environment Variables → Edit

2. **Redeploy to Apply Changes**
```bash
git commit --allow-empty -m "Trigger redeploy for env var changes"
git push origin main
```

---

## Database Setup

### Database Provider: Neon PostgreSQL

**Why Neon?**
- ✅ Serverless PostgreSQL (auto-scales)
- ✅ Connection pooling built-in
- ✅ Generous free tier
- ✅ SSL by default
- ✅ No database maintenance

### Schema Setup

**1. Create Database**
```sql
CREATE DATABASE neondb;
```

**2. Apply Schema**
```bash
psql $DATABASE_URL -f database/schema.sql
```

**3. Create Read-Only User**
```sql
-- Create read-only user for API
CREATE USER api_readonly WITH PASSWORD 'your_secure_password';

-- Grant SELECT permissions
GRANT SELECT ON case_studies TO api_readonly;
GRANT SELECT ON execution_steps TO api_readonly;
GRANT USAGE ON SCHEMA public TO api_readonly;
```

**4. Verify Permissions**
```sql
-- Test read access (should work)
SET ROLE api_readonly;
SELECT COUNT(*) FROM case_studies;

-- Test write access (should fail)
INSERT INTO case_studies (agent_slug, title, input_parameters, output_result)
VALUES ('test', 'Test', '{}', '{}');
-- Expected: ERROR: permission denied for table case_studies
```

### Import Case Studies

**From agent output directory:**
```bash
# Set DATABASE_URL (use admin user with write permissions)
export DATABASE_URL="postgresql://admin_user:password@host/database"

# Import case studies
cd agents/fraud-trends
python3 scripts/import_case_studies.py output/
```

**Expected Output:**
```
Phase 1: Pre-validating files...
[1/3] Validating case_study_1.json... ✓
[2/3] Validating case_study_2.json... ✓
[3/3] Validating case_study_3.json... ✓

Phase 2: Importing 3 validated files to database...
[1/3] Importing case_study_1.json ✓
[2/3] Importing case_study_2.json ✓
[3/3] Importing case_study_3.json ✓

✓ ALL IMPORTS SUCCESSFUL
```

---

## API Endpoints

### GET /api/agents/[slug]/case-studies

Retrieves case studies for a specific agent.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Agent identifier (e.g., `fraud-trends`) |
| `includeTrace` | boolean | No | Include execution trace (default: false) |
| `display` | boolean | No | Filter by display status |
| `featured` | boolean | No | Filter by featured status |

#### Examples

**Basic Query:**
```bash
curl "https://ai-agents-rosy-mu.vercel.app/api/agents/fraud-trends/case-studies"
```

**With Execution Trace:**
```bash
curl "https://ai-agents-rosy-mu.vercel.app/api/agents/fraud-trends/case-studies?includeTrace=true"
```

**Filter by Display:**
```bash
curl "https://ai-agents-rosy-mu.vercel.app/api/agents/fraud-trends/case-studies?display=true"
```

#### Response Format

```json
{
  "agentSlug": "fraud-trends",
  "totalCount": 3,
  "caseStudies": [
    {
      "id": "uuid",
      "agentSlug": "fraud-trends",
      "title": "Case Study Title",
      "subtitle": "Subtitle",
      "inputParameters": {...},
      "outputResult": {...},
      "executionTrace": [...],  // Only if includeTrace=true
      "display": true,
      "featured": false,
      "createdAt": "2026-02-10T00:11:03.651Z",
      "updatedAt": "2026-02-10T00:11:03.651Z"
    }
  ],
  "executionTraceIncluded": false
}
```

#### Error Responses

**400 Bad Request:**
```json
{
  "error": {
    "code": "INVALID_AGENT_SLUG",
    "message": "Invalid agent slug",
    "details": {
      "provided": "invalid-agent"
    }
  }
}
```

**500 Internal Server Error:**
```json
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to query case studies from database",
    "details": {
      "error": "connection timeout"
    }
  }
}
```

---

## Troubleshooting

### Issue 1: API Returns 404

**Symptoms:**
```bash
curl https://ai-agents-rosy-mu.vercel.app/api/agents/fraud-trends/case-studies
# Response: 404 NOT_FOUND
```

**Possible Causes:**
1. Deployment hasn't completed yet
2. Build failed
3. Route file missing

**Solutions:**

**Check Deployment Status:**
```bash
# Visit Vercel Dashboard
https://vercel.com/[your-org]/ai-agents/deployments

# Look for latest deployment status
```

**Check Build Logs:**
```
Vercel Dashboard → Latest Deployment → Build Logs
```

**Verify Route File Exists:**
```bash
ls -la app/api/agents/[slug]/case-studies/route.ts
```

---

### Issue 2: Database Connection Error

**Symptoms:**
```json
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to query case studies from database",
    "details": {
      "error": "connect ECONNREFUSED 127.0.0.1:5432"
    }
  }
}
```

**Possible Causes:**
1. DATABASE_URL not set in Vercel
2. Invalid database credentials
3. Database is down
4. Firewall blocking connection

**Solutions:**

**Verify Environment Variable:**
```bash
# Check in Vercel Dashboard
Settings → Environment Variables → DATABASE_URL

# Ensure it's set for Production environment
```

**Test Database Connection Locally:**
```bash
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM case_studies;"
```

**Check Database Status:**
```bash
# For Neon, check dashboard:
https://console.neon.tech
```

---

### Issue 3: Build Failures

**Symptoms:**
```
Deployment Status: ● Error
Duration: 5s (suspiciously fast)
```

**Possible Causes:**
1. TypeScript errors
2. Missing dependencies
3. Environment variables not set
4. Build command incorrect

**Solutions:**

**Check Build Logs:**
```
Vercel Dashboard → Failed Deployment → Build Logs
```

**Test Build Locally:**
```bash
npm run build
```

**Fix TypeScript Errors:**
```bash
# Check for type errors
npx tsc --noEmit
```

**Verify Dependencies:**
```bash
cat package.json | grep -A 5 dependencies
```

---

### Issue 4: Slow API Response

**Symptoms:**
- API response time > 2 seconds
- Timeouts

**Possible Causes:**
1. Cold start (first request after idle)
2. Database in different region
3. Connection pool exhausted
4. Slow database query

**Solutions:**

**Check Response Times:**
```bash
curl -w "Total time: %{time_total}s\n" -o /dev/null -s "https://ai-agents-rosy-mu.vercel.app/api/agents/fraud-trends/case-studies"
```

**Expected Times:**
- First request (cold start): < 2s
- Subsequent requests: < 500ms

**Verify Connection Pooling:**
```typescript
// lib/db.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,  // Connection pool size
});
```

**Check Database Region:**
- Ideal: Database and Vercel in same region (us-east-1)

---

### Issue 5: Environment Variable Not Applied

**Symptoms:**
- Updated DATABASE_URL in Vercel
- API still uses old value

**Solution:**
```bash
# Trigger redeploy
git commit --allow-empty -m "Redeploy: Apply env var changes"
git push origin main
```

---

## Rollback Procedures

### Rollback via Vercel Dashboard

**When to Use:** Latest deployment is broken

**Steps:**
1. Go to: https://vercel.com/[your-org]/ai-agents/deployments
2. Find last working deployment
3. Click "⋯" menu → "Promote to Production"
4. Confirm promotion

**Timeline:** Immediate (< 30 seconds)

---

### Rollback via Git Revert

**When to Use:** Need to undo recent commits

**Steps:**
```bash
# View recent commits
git log --oneline -5

# Revert last commit
git revert HEAD

# Push revert
git push origin main
```

**Timeline:** ~60 seconds (triggers new deployment)

---

### Emergency Rollback (Force Reset)

**When to Use:** Multiple bad commits, need to go back several commits

**⚠️ Warning:** This is destructive. Use with caution.

```bash
# Find commit to reset to
git log --oneline -10

# Hard reset (DESTRUCTIVE)
git reset --hard <commit-hash>

# Force push (DANGEROUS on main branch)
git push --force origin main
```

**Only use this in emergencies!**

---

## Deployment Checklist

### Pre-Deployment Checklist

Before pushing to `main`:

- [ ] Code tested locally (`npm run dev`)
- [ ] Build succeeds (`npm run build`)
- [ ] TypeScript has no errors (`npx tsc --noEmit`)
- [ ] API endpoints tested locally
- [ ] Database connection works
- [ ] No hardcoded credentials in code
- [ ] `.env.local` not committed to git
- [ ] Commit message is descriptive

### Post-Deployment Checklist

After deployment completes:

- [ ] Deployment status is "Ready" in Vercel
- [ ] Production API responds (`curl https://ai-agents-rosy-mu.vercel.app/api/...`)
- [ ] Response format is correct
- [ ] Response time is acceptable (< 500ms)
- [ ] No errors in Vercel logs
- [ ] Database connection working

### Monitoring Checklist

Regular monitoring:

- [ ] Check Vercel dashboard for failed deployments
- [ ] Monitor API response times
- [ ] Check database connection pool usage
- [ ] Review error logs weekly
- [ ] Test API endpoints monthly

---

## Best Practices

### Development Workflow

✅ **DO:**
- Test locally before pushing
- Write descriptive commit messages
- Use feature branches for major changes
- Keep `main` branch stable
- Monitor deployment status

❌ **DON'T:**
- Push directly to `main` without testing
- Commit sensitive data (`.env.local`)
- Force push to `main` (except emergencies)
- Deploy without verifying environment variables

### Security Best Practices

✅ **DO:**
- Use read-only database user for API
- Require SSL for database connections
- Rotate credentials every 90 days
- Monitor for leaked credentials (GitHub secret scanning)
- Keep dependencies updated

❌ **DON'T:**
- Hardcode credentials in code
- Commit `.env.local` to git
- Use admin database user for API
- Expose internal database structure in API responses

### Performance Best Practices

✅ **DO:**
- Use connection pooling (already configured)
- Add indexes on frequently queried columns
- Cache static responses (if applicable)
- Monitor response times
- Use Neon pooler endpoint

❌ **DON'T:**
- Create new database connection per request
- Run expensive queries in API routes
- Return excessive data in responses

---

## Production URLs

### Primary Production URL
```
https://ai-agents-rosy-mu.vercel.app
```

### API Endpoints
```
https://ai-agents-rosy-mu.vercel.app/api/agents/fraud-trends/case-studies
https://ai-agents-rosy-mu.vercel.app/api/agents/stock-monitor/case-studies (future)
https://ai-agents-rosy-mu.vercel.app/api/agents/house-finder/case-studies (future)
```

### Dashboard Links
- **Vercel Dashboard:** https://vercel.com/[your-org]/ai-agents
- **GitHub Repository:** https://github.com/[your-username]/ai-agents
- **Neon Dashboard:** https://console.neon.tech

---

## Support & Resources

### Documentation
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Neon Docs:** https://neon.tech/docs

### Internal Docs
- **Gate 1 Validation Report:** `GATE_1_VALIDATION_REPORT.md`
- **Universal Schema Decision:** `UNIVERSAL_SCHEMA_DECISION.md`
- **Security Validation:** `SECURITY_VALIDATION_REPORT.md`
- **Database Schema:** `database/schema.sql`

### Contact
- **Issues:** Create GitHub issue in repository
- **Vercel Support:** https://vercel.com/support

---

## Deployment History

| Date | Commit | Change | Status |
|------|--------|--------|--------|
| 2026-02-11 | `4e0cb7e` | Add DATABASE_URL environment variable | ✅ Success |
| 2026-02-11 | `b60a0fe` | Move Next.js app to repository root | ✅ Success |
| 2026-02-11 | `a099480` | Add package.json to git (fix deployment) | ✅ Success |
| 2026-02-10 | `01ab520` | Complete Epic 6 deployment | ✅ Success |

---

## Appendix: Quick Commands

### Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start
```

### Database Operations
```bash
# Connect to database
psql "$DATABASE_URL"

# Check case studies count
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM case_studies;"

# Import case studies
python3 agents/fraud-trends/scripts/import_case_studies.py output/
```

### Deployment
```bash
# Deploy via Git (recommended)
git add .
git commit -m "Update: Description"
git push origin main

# Monitor deployment
# Visit: https://vercel.com/[your-org]/ai-agents/deployments
```

### Testing
```bash
# Test local API
curl http://localhost:3000/api/agents/fraud-trends/case-studies | jq

# Test production API
curl https://ai-agents-rosy-mu.vercel.app/api/agents/fraud-trends/case-studies | jq

# Check response time
curl -w "Time: %{time_total}s\n" -o /dev/null -s "https://ai-agents-rosy-mu.vercel.app/api/agents/fraud-trends/case-studies"
```

---

**Last Updated:** 2026-02-11
**Deployment Status:** 🟢 **PRODUCTION - STABLE**
**Next Review:** 2026-03-11
