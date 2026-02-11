# Git-Based Deployment Workflow

**Quick Reference for Deploying to Vercel via Git**

---

## Overview

The `ai-agents` Vercel project is configured for **automatic Git-based deployment**:
- **Repository:** https://github.com/[your-username]/ai-agents.git
- **Production Branch:** `main`
- **Root Directory:** `website`
- **Automatic Deployment:** Enabled (on push to `main`)

---

## Standard Deployment Process

### 1. Make Changes

Edit files in the `website/` directory:
```bash
cd /Volumes/External/AIAgents/website

# Make changes to:
# - app/ (pages, API routes)
# - lib/ (utilities, database)
# - public/ (static assets)
# - Configuration files (next.config.mjs, etc.)
```

### 2. Test Locally

```bash
# Start dev server
npm run dev

# Test changes at http://localhost:3008
```

### 3. Stage Changes

```bash
# From project root
cd /Volumes/External/AIAgents

# Stage website changes
git add website/

# Optional: Stage related changes
git add agents/ docs/ database/ _bmad-output/

# Review staged files
git status
```

### 4. Commit

```bash
git commit -m "Descriptive commit message

- Brief summary of changes
- Key features added/fixed
- Reference to Epic/Story if applicable

Epic X, Story Y.Z"
```

### 5. Push to GitHub

```bash
# Push to main (triggers production deployment)
git push origin main
```

### 6. Monitor Deployment

**Option A: Vercel CLI**
```bash
vercel ls --yes
```

**Option B: Vercel Dashboard**
- Visit: https://vercel.com/[your-organization]/ai-agents
- Check "Deployments" tab

**Option C: GitHub Actions**
- Check commit status on GitHub
- Vercel bot will comment on commit with deployment status

### 7. Verify Deployment

```bash
# Test production API
curl https://ai-agents-tau-one.vercel.app/api/agents/fraud-trends/case-studies | jq '.totalCount'

# Expected: 3 (or current case study count)
```

---

## Deployment Timeline

| Stage | Duration | Details |
|-------|----------|---------|
| Push to GitHub | ~1-5s | Git push operation |
| Vercel Detection | ~5-15s | Webhook trigger |
| Build Start | ~5-10s | Environment setup |
| Build Process | ~15-25s | npm install, next build |
| Deployment | ~5-10s | Upload and activate |
| **Total** | **~30-65s** | Push to live |

---

## Branch Strategy

### Production (`main`)
- **Deploys to:** https://ai-agents-tau-one.vercel.app
- **Automatic:** Yes
- **Environment:** Production
- **Protection:** Deploy protection disabled (public API)

### Feature Branches
- **Deploys to:** https://ai-agents-[hash].vercel.app (preview)
- **Automatic:** Yes
- **Environment:** Preview
- **Protection:** Optional

### Pull Requests
- **Deploys to:** https://ai-agents-[hash].vercel.app (preview)
- **Automatic:** Yes
- **Environment:** Preview
- **Comment:** Vercel bot adds deployment link to PR

---

## Environment Variables

Environment variables are managed in Vercel Dashboard, not in Git:

**To update environment variables:**
1. Go to: https://vercel.com/[your-organization]/ai-agents/settings/environment-variables
2. Add/Edit/Remove variables
3. Select environments (Production, Preview, Development)
4. **Redeploy** to apply changes

**Configured Variables:**
- `DATABASE_URL` (and 15 other database-related vars)
- All encrypted and secure

---

## Common Deployment Scenarios

### Scenario 1: API Route Changes

```bash
# Edit API route
vim website/app/api/agents/[slug]/case-studies/route.ts

# Test locally
npm run dev

# Deploy
git add website/app/api/
git commit -m "Update API: Add new query parameter"
git push origin main
```

### Scenario 2: Database Schema Changes

```bash
# 1. Update schema
vim database/schema.sql

# 2. Apply to production database
psql $DATABASE_URL -f database/schema.sql

# 3. Update TypeScript types
vim website/lib/types.ts

# 4. Deploy
git add database/ website/lib/
git commit -m "Update schema: Add new field to case_studies"
git push origin main
```

### Scenario 3: New API Endpoint

```bash
# 1. Create new route
mkdir -p website/app/api/new-endpoint
vim website/app/api/new-endpoint/route.ts

# 2. Test locally
npm run dev

# 3. Update documentation
vim website/API_TESTING.md

# 4. Deploy
git add website/app/api/new-endpoint/ website/API_TESTING.md
git commit -m "Add new API endpoint: /api/new-endpoint"
git push origin main
```

### Scenario 4: Hotfix

```bash
# 1. Make urgent fix
vim website/app/api/agents/[slug]/case-studies/route.ts

# 2. Quick test (if time permits)
npm run dev

# 3. Deploy immediately
git add website/app/api/
git commit -m "Hotfix: Fix database connection timeout"
git push origin main

# 4. Monitor deployment
vercel ls --yes
```

---

## Rollback Procedure

If deployment has issues:

### Option 1: Vercel Dashboard

1. Go to: https://vercel.com/[your-organization]/ai-agents
2. Click "Deployments" tab
3. Find previous working deployment
4. Click "⋯" → "Promote to Production"

### Option 2: Git Revert

```bash
# Find commit to revert
git log --oneline -5

# Revert to previous commit
git revert HEAD

# Push revert
git push origin main

# Or hard reset (use with caution)
git reset --hard HEAD~1
git push --force origin main  # Only if necessary!
```

---

## Troubleshooting

### Issue: Deployment Not Triggered

**Check:**
```bash
# Verify remote is correct
git remote -v

# Verify branch is main
git branch

# Verify push succeeded
git push origin main
```

**Fix:**
- Ensure Vercel GitHub integration is enabled
- Check Vercel project settings → Git → Ensure repository is connected

### Issue: Build Fails

**Check Vercel logs:**
```bash
vercel logs
```

**Common causes:**
- Missing dependencies in `package.json`
- TypeScript errors
- Environment variables not set
- Build command incorrect

**Fix:**
```bash
# Test build locally
npm run build

# Fix errors, commit, push
git add .
git commit -m "Fix build errors"
git push origin main
```

### Issue: API Returns 404

**Check:**
- Verify route file exists: `app/api/agents/[slug]/case-studies/route.ts`
- Verify root directory is set to `website` in Vercel project settings
- Check deployment logs for errors

### Issue: Environment Variable Changes Not Applied

**Fix:**
1. Update environment variables in Vercel Dashboard
2. **Manually trigger redeploy:**
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

---

## Best Practices

✅ **DO:**
- Test locally before pushing
- Write descriptive commit messages
- Stage only related files together
- Monitor deployment status
- Verify production API after deployment
- Keep environment variables in Vercel Dashboard

❌ **DON'T:**
- Push directly to `main` without testing
- Commit `.env.local` or secrets
- Use `vercel deploy` for production (use Git instead)
- Force push to `main` unless absolutely necessary
- Hardcode credentials in code

---

## Quick Commands Reference

```bash
# Complete deployment workflow
git add website/
git commit -m "Update: Brief description"
git push origin main
vercel ls --yes  # Monitor

# Test production
curl https://ai-agents-tau-one.vercel.app/api/agents/fraud-trends/case-studies | jq

# Rollback via Git
git revert HEAD
git push origin main

# Check deployment status
vercel ls --yes

# View logs
vercel logs

# List environment variables
vercel env ls
```

---

## Related Documentation

- **Full Deployment Guide:** `VERCEL_DEPLOYMENT.md`
- **Deployment Status:** `DEPLOYMENT_STATUS.md`
- **API Testing:** `API_TESTING.md`
- **Vercel Dashboard:** https://vercel.com/[your-organization]/ai-agents
- **GitHub Repository:** https://github.com/[your-username]/ai-agents

---

**Last Updated:** 2026-02-10
**Status:** Git-based deployment configured and active
