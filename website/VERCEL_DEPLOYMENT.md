# Vercel Deployment Guide

This guide covers deploying the AI Agents Portfolio website to Vercel.

## Prerequisites

1. **Vercel Account**
   - Sign up at https://vercel.com
   - Install Vercel CLI: `npm install -g vercel`

2. **Database Setup**
   - PostgreSQL database with case studies imported
   - Read-only database user created (`api_readonly`)
   - Database accessible from Vercel's IP ranges

3. **Repository**
   - Code pushed to GitHub/GitLab/Bitbucket
   - Or deploy from local directory using Vercel CLI

---

## Environment Variables

### Required Variables

The following environment variables must be configured in Vercel:

#### 1. DATABASE_URL

**Description:** PostgreSQL connection string for read-only API access

**Format:**
```
postgresql://api_readonly:password@host:5432/database?sslmode=require
```

**Production Value:**
```
postgresql://api_readonly:YOUR_READONLY_PASSWORD@YOUR_HOST.neon.tech/YOUR_DATABASE?sslmode=require
```

**Example (do not use):**
```
postgresql://api_readonly:readonly_pass_123@ep-example-a1b2c3.aws.neon.tech/aiagents?sslmode=require
```

**Security Notes:**
- ✅ Uses read-only user (`api_readonly`)
- ✅ User has SELECT-only permissions
- ✅ Cannot INSERT, UPDATE, or DELETE data
- ✅ SSL mode required for encrypted connections
- ✅ Neon connection pooling enabled (pooler endpoint)

**Scope:** Production, Preview, Development

---

## Deployment Methods

### Method 1: Git-Based Deployment (Recommended for Production)

Vercel automatically deploys when code is pushed to the connected Git repository.

#### Prerequisites

1. **GitHub Repository Connected**
   - Repository: https://github.com/[your-username]/ai-agents.git
   - Branch: `main` (production)
   - Connected to Vercel project: `ai-agents`

2. **Root Directory Configured**
   - Root: `website` (set in Vercel project settings)
   - Framework: Next.js (auto-detected)

#### Deployment Steps

**Step 1: Stage Changes**

```bash
# From project root
cd /Volumes/External/AIAgents

# Stage website files
git add website/

# Optional: Stage other changes (agents, docs, etc.)
git add agents/ docs/ database/

# Check staged files
git status
```

**Step 2: Commit Changes**

```bash
# Create commit with descriptive message
git commit -m "Deploy: Update API with case studies functionality

- Add /api/agents/[slug]/case-studies endpoint
- Implement execution trace support
- Add database connection module
- Configure environment variables
- Add comprehensive documentation

Epic 6, Story 6.4: Deploy Next.js API to Vercel"
```

**Step 3: Push to GitHub**

```bash
# Push to main branch (triggers Vercel deployment)
git push origin main
```

**Step 4: Monitor Deployment**

Vercel automatically:
1. Detects push to `main` branch
2. Starts build process
3. Runs `npm install` and `npm run build`
4. Deploys to production URL
5. Sends notification when complete

**Check Deployment Status:**
```bash
# Via Vercel CLI
vercel ls --yes

# Or visit Vercel Dashboard
# https://vercel.com/[your-organization]/ai-agents
```

#### Automatic Deployment Triggers

| Branch | Environment | URL |
|--------|-------------|-----|
| `main` | Production | https://ai-agents-tau-one.vercel.app |
| Pull Requests | Preview | https://ai-agents-[hash]-[your-organization].vercel.app |
| Other branches | Preview | https://ai-agents-[hash]-[your-organization].vercel.app |

#### Expected Timeline

- **Commit to Deployment:** ~30-60 seconds
- **Build Duration:** ~15-25 seconds
- **Total Time:** ~45-85 seconds

---

### Method 2: Vercel Dashboard (Manual Import)

#### Step 1: Connect Repository

1. Go to https://vercel.com/new
2. Import your Git repository
3. Select the `website` directory as the root directory
4. Framework preset: **Next.js** (auto-detected)

#### Step 2: Configure Project Settings

**Root Directory:** `website`

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

**Node.js Version:** 20.x (recommended)

#### Step 3: Configure Environment Variables

1. Go to **Project Settings** → **Environment Variables**
2. Add the following variable:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | `postgresql://api_readonly:YOUR_PASSWORD@YOUR_HOST.neon.tech/YOUR_DB?sslmode=require` | Production, Preview, Development |

**Important:**
- Select all three environments (Production, Preview, Development)
- Do NOT commit this value to git
- Keep the password secure

#### Step 4: Deploy

1. Click **Deploy**
2. Wait for build to complete (~2-3 minutes)
3. Verify deployment at the generated URL

---

### Method 3: Vercel CLI (Not Recommended for Production)

**Note:** Use Git-based deployment (Method 1) for production. CLI deployment is useful for testing only.

---

### Method 2: Vercel CLI (Legacy - For Testing Only)

#### Step 1: Login to Vercel

```bash
vercel login
```

#### Step 2: Navigate to Website Directory

```bash
cd /Volumes/External/AIAgents/website
```

#### Step 3: Set Environment Variables

```bash
# Add DATABASE_URL to all environments
vercel env add DATABASE_URL production
# Paste your actual DATABASE_URL when prompted

vercel env add DATABASE_URL preview
# Paste the same DATABASE_URL value

vercel env add DATABASE_URL development
# Paste the same DATABASE_URL value
```

#### Step 4: Deploy to Production

```bash
# First deployment (creates project)
vercel --prod

# Subsequent deployments
vercel --prod
```

#### Step 5: Verify Deployment

```bash
# Get deployment URL
vercel ls

# Test API endpoint
curl https://your-project.vercel.app/api/agents/fraud-trends/case-studies | jq
```

---

## Post-Deployment Verification

### 1. Test API Endpoints

```bash
# Get deployment URL
VERCEL_URL="https://your-project.vercel.app"

# Test basic endpoint
curl "$VERCEL_URL/api/agents/fraud-trends/case-studies" | jq '.totalCount'
# Expected: 3

# Test with execution trace
curl "$VERCEL_URL/api/agents/fraud-trends/case-studies?includeTrace=true" | jq '.executionTraceIncluded'
# Expected: true

# Test invalid agent slug
curl -i "$VERCEL_URL/api/agents/invalid-agent/case-studies"
# Expected: 400 Bad Request
```

### 2. Check Database Connection

Verify the Vercel deployment can connect to the database:

```bash
# Check Vercel deployment logs
vercel logs

# Look for:
# ✓ Database connection pool initialized
# ✓ API request successful
```

### 3. Verify Read-Only Access

The API should NOT be able to modify data:

```bash
# Try to connect with read-only user (should fail for write operations)
# Use your actual DATABASE_URL credentials for this test
psql $DATABASE_URL_READONLY \
  -c "INSERT INTO case_studies (id, agent_slug, title, input_parameters, output_result) VALUES ('00000000-0000-0000-0000-000000000000', 'test', 'Test', '{}', '{}');"

# Expected: ERROR:  permission denied for table case_studies
```

### 4. Performance Check

```bash
# Run performance test against production
curl -w "Total time: %{time_total}s\n" -o /dev/null -s "$VERCEL_URL/api/agents/fraud-trends/case-studies"

# Expected: < 1 second
```

---

## Domain Configuration (Optional)

### Custom Domain Setup

1. Go to **Project Settings** → **Domains**
2. Add your custom domain (e.g., `ai-agents.yourdomain.com`)
3. Configure DNS records as instructed by Vercel
4. Wait for SSL certificate provisioning (~5 minutes)

**Example DNS Configuration:**
```
Type: CNAME
Name: ai-agents
Value: cname.vercel-dns.com
```

---

## Troubleshooting

### Error: "Database connection failed"

**Cause:** DATABASE_URL not set or incorrect

**Solution:**
```bash
# Verify environment variable in Vercel dashboard
# Project Settings → Environment Variables → DATABASE_URL

# Or via CLI:
vercel env ls

# Re-add if missing:
vercel env add DATABASE_URL production
```

### Error: "Cannot find module 'pg'"

**Cause:** Dependencies not installed during build

**Solution:**
```bash
# Verify package.json has pg dependency
cat package.json | grep '"pg"'

# Expected: "pg": "^8.18.0"

# Redeploy:
vercel --prod --force
```

### Error: "SSL connection required"

**Cause:** Missing `?sslmode=require` in DATABASE_URL

**Solution:**
```bash
# Update DATABASE_URL to include SSL mode:
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
# Paste: postgresql://...?sslmode=require
```

### Error: "Too many connections"

**Cause:** Connection pool exhausted

**Solution:**
1. Check `lib/db.ts` connection pool settings:
   ```typescript
   maxconn: 10  // Adjust if needed
   ```
2. Verify database has sufficient connection limit
3. Use Neon pooler endpoint (already configured)

### Slow API Response (> 2 seconds)

**Possible Causes:**
- Cold start (first request after idle)
- Database region mismatch
- Network latency

**Solutions:**
1. Enable Vercel Edge Functions (optional)
2. Use Neon pooler endpoint (already configured)
3. Verify database is in same region as Vercel deployment

---

## Monitoring and Logs

### View Deployment Logs

```bash
# View recent logs
vercel logs

# Follow logs in real-time
vercel logs --follow

# Filter by specific deployment
vercel logs <deployment-id>
```

### Analytics

1. Go to **Project Dashboard** → **Analytics**
2. Monitor:
   - Request count
   - Response time
   - Error rate
   - Geographic distribution

---

## Security Checklist

Before deploying to production, verify:

- [ ] DATABASE_URL uses read-only user (`api_readonly`)
- [ ] Read-only user has SELECT-only permissions
- [ ] DATABASE_URL includes `?sslmode=require`
- [ ] Environment variables set for all environments (Production, Preview, Development)
- [ ] .env.local NOT committed to git
- [ ] No hardcoded credentials in code
- [ ] API endpoints return proper error codes (400, 500)
- [ ] SQL queries use parameterized statements (no SQL injection)
- [ ] Database connection pool properly configured
- [ ] SSL certificate valid (auto-provisioned by Vercel)

---

## Rollback Procedure

If deployment has issues:

```bash
# List recent deployments
vercel ls

# Promote previous deployment to production
vercel promote <previous-deployment-url>

# Or via dashboard:
# Deployments → Select previous deployment → Promote to Production
```

---

## CI/CD Integration (Optional)

Vercel automatically deploys on git push. To customize:

### GitHub Actions Example

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
    paths: ['website/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: website

      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: website

      - name: Deploy to Production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: website
```

**Required Secrets:**
- `VERCEL_TOKEN` - Generate at https://vercel.com/account/tokens
- `VERCEL_ORG_ID` - Found in `.vercel/project.json`
- `VERCEL_PROJECT_ID` - Found in `.vercel/project.json`

---

## Environment-Specific Configuration

### Production
- **Domain:** Custom domain or Vercel auto-generated
- **Database:** Production Neon database
- **Caching:** Enabled (Edge Network)
- **Analytics:** Enabled

### Preview (Pull Requests)
- **Domain:** Auto-generated preview URL
- **Database:** Same as production (read-only user)
- **Caching:** Enabled
- **Analytics:** Enabled

### Development
- **Domain:** Local development only
- **Database:** Same as production (read-only user)
- **Caching:** Disabled
- **Analytics:** Disabled

---

## Cost Estimation

### Vercel (Hobby Plan - Free)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL certificates
- ✅ Edge Network (CDN)
- ✅ Preview deployments
- ⚠️ Serverless function execution: 100 GB-hours/month

**Upgrade to Pro ($20/month) if:**
- Traffic > 100 GB/month
- Need team collaboration
- Need password protection for previews

### Neon (Free Tier)
- ✅ 0.5 GB storage
- ✅ Pooling enabled
- ✅ Auto-suspend after inactivity
- ⚠️ 100 hours compute/month

**Upgrade to Pro ($19/month) if:**
- Storage > 0.5 GB
- Compute > 100 hours/month
- Need higher connection limits

---

## Additional Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Neon Documentation:** https://neon.tech/docs
- **API Testing Guide:** `API_TESTING.md`
- **Security Checklist:** `../SECURITY_CHECKLIST.md`
- **Gate 1 Validation:** `../agents/fraud-trends/GATE_1_VALIDATION_CHECKLIST.md`

---

## Quick Reference Commands

```bash
# Login to Vercel
vercel login

# Deploy to production
cd website
vercel --prod

# Add environment variable
vercel env add DATABASE_URL production

# View logs
vercel logs --follow

# List deployments
vercel ls

# Remove deployment
vercel rm <deployment-id>

# Pull environment variables locally
vercel env pull .env.local
```

---

## Support

**Issues with deployment?**
1. Check Vercel status: https://www.vercel-status.com/
2. Check Neon status: https://neonstatus.com/
3. Review deployment logs: `vercel logs`
4. Test database connection: `psql $DATABASE_URL -c "SELECT 1"`
5. Contact support: https://vercel.com/support

---

**Last Updated:** 2026-02-10
**Epic 6, Story 6.3:** Configure Vercel Environment Variables
