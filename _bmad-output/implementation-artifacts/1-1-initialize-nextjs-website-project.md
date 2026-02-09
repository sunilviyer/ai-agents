# Story 1.1: Initialize Next.js Website Project

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to initialize the Next.js website with TypeScript, TailwindCSS, and ESLint configured,
So that I have a properly configured frontend foundation for the API and future UI.

## Acceptance Criteria

**Given** I am in the project root directory
**When** I run `npx create-next-app@latest website --typescript --tailwind --eslint --app --turbopack --import-alias "@/*"`
**Then** A website/ directory is created with Next.js 15 structure
**And** TypeScript strict mode is enabled in tsconfig.json
**And** TailwindCSS is configured in tailwind.config.ts
**And** ESLint is configured with Next.js rules
**And** `npm run dev` starts the development server successfully
**And** The project uses App Router architecture (app/ directory exists)

## Requirements Traceability

**Functional Requirements:**
- **AR1:** Next.js project initialized via `npx create-next-app@latest website --typescript --tailwind --eslint --app --turbopack --import-alias "@/*"`

**Additional Requirements:**
- AR1 (Project Initialization & Structure)

**Epic Coverage:**
- Epic 1: Project Foundation & Environment Setup
- Story 1.1 (First story in Epic 1 - Foundation)

## Technical Context

### Architecture Requirements

**From Architecture Document (AR1):**
> Next.js project initialized via `npx create-next-app@latest website --typescript --tailwind --eslint --app --turbopack --import-alias "@/*"`

**Key Technical Specifications:**
1. **Framework:** Next.js 15+ (latest stable)
2. **TypeScript:** Strict mode enabled
3. **Styling:** TailwindCSS (latest)
4. **Linting:** ESLint with Next.js configuration
5. **Routing:** App Router architecture (NOT Pages Router)
6. **Build Tool:** Turbopack for faster builds
7. **Import Alias:** `@/*` for clean imports

**Critical Architecture Decisions:**
- **App Router (NOT Pages Router):** This is Phase 1 of a multi-phase project. App Router is required for server components and modern Next.js patterns
- **TypeScript Strict Mode:** Project requires type safety from the start (NFR-CQ5)
- **Import Alias `@/*`:** Enables cleaner imports like `import { pool } from '@/lib/db'` instead of `../../lib/db`

### Project Structure Requirements

**Expected Directory Structure After Initialization:**
```
/Volumes/External/AIAgents/
├── website/                           # Next.js application root
│   ├── app/                          # App Router directory (CRITICAL)
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   └── api/                      # API routes (will be added in Epic 5)
│   ├── public/                       # Static assets
│   ├── lib/                          # Utility modules (will be added in Epic 2)
│   ├── tsconfig.json                 # TypeScript configuration (MUST have strict: true)
│   ├── tailwind.config.ts            # TailwindCSS configuration
│   ├── next.config.js                # Next.js configuration
│   ├── .eslintrc.json                # ESLint configuration
│   ├── package.json                  # Dependencies
│   └── .gitignore                    # Git ignore patterns
```

**CRITICAL PATH VALIDATION:**
- Verify `app/` directory exists (NOT `pages/`) - App Router is required
- Verify `tsconfig.json` has `"strict": true`
- Verify `.gitignore` includes `.next`, `node_modules`, `.env.local`

### Technology Stack Details

**Next.js 15 Features to Leverage:**
- Server Components by default (better performance)
- Enhanced App Router with nested layouts
- Built-in font optimization
- Image optimization
- API Routes in `app/api/` directory

**TypeScript Configuration:**
```json
{
  "compilerOptions": {
    "strict": true,           // REQUIRED by NFR-CQ5
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]          // REQUIRED by AR1
    }
  }
}
```

### Security Considerations

**From Epic 1 Implementation Notes:**
- Security foundations must be established before any code
- This story sets up the base `.gitignore` which is critical for FR43

**Validation Required:**
- Ensure `.gitignore` includes `.env.local` (for Story 1.6)
- Ensure `.gitignore` includes `.env` (for future secrets)
- Ensure `node_modules` and `.next` are gitignored

### Dependencies

**No Previous Stories:**
- This is Story 1.1 - the FIRST story in the entire project
- No previous work to reference
- Establishes the foundation for all subsequent stories

**Blocks These Stories:**
- Story 1.4: Install Next.js Database Client (requires website/ directory)
- Story 1.6: Configure Next.js Environment Variables (requires website/ directory)
- Epic 2: Database & Type System (requires TypeScript setup)
- Epic 5: REST API (requires Next.js app/ directory)

### Performance Requirements

**None for this story** - This is initialization only

### Testing Requirements

**Manual Verification:**
1. Run `npm run dev` and verify server starts without errors
2. Visit `http://localhost:3000` and see default Next.js page
3. Verify no TypeScript errors: `npx tsc --noEmit`
4. Verify no ESLint errors: `npm run lint`

**No automated tests required for initialization**

## Tasks / Subtasks

- [ ] **Task 1:** Initialize Next.js project (AC: All)
  - [ ] Navigate to project root: `/Volumes/External/AIAgents/`
  - [ ] Run create-next-app command exactly as specified: `npx create-next-app@latest website --typescript --tailwind --eslint --app --turbopack --import-alias "@/*"`
  - [ ] Verify `website/` directory created
  - [ ] Verify `app/` directory exists (NOT `pages/`)

- [ ] **Task 2:** Validate TypeScript Configuration (AC: TypeScript strict mode)
  - [ ] Open `website/tsconfig.json`
  - [ ] Verify `"strict": true` is present in compilerOptions
  - [ ] Verify `"paths": { "@/*": ["./*"] }` exists for import alias
  - [ ] If missing, manually add them

- [ ] **Task 3:** Validate TailwindCSS Setup (AC: TailwindCSS configured)
  - [ ] Verify `tailwind.config.ts` exists
  - [ ] Verify `app/globals.css` includes Tailwind directives
  - [ ] Verify TailwindCSS works by checking default page styling

- [ ] **Task 4:** Validate ESLint Configuration (AC: ESLint configured)
  - [ ] Verify `.eslintrc.json` exists with Next.js rules
  - [ ] Run `npm run lint` and confirm zero errors

- [ ] **Task 5:** Test Development Server (AC: npm run dev works)
  - [ ] Run `npm run dev`
  - [ ] Verify server starts on `http://localhost:3000`
  - [ ] Verify no compilation errors
  - [ ] Verify default Next.js page loads in browser

- [ ] **Task 6:** Validate App Router Architecture (AC: App Router exists)
  - [ ] Confirm `app/` directory exists (NOT `pages/`)
  - [ ] Confirm `app/layout.tsx` exists
  - [ ] Confirm `app/page.tsx` exists
  - [ ] Document that App Router is active

- [ ] **Task 7:** Security Validation (FR43 compliance)
  - [ ] Verify `.gitignore` includes `.env.local`
  - [ ] Verify `.gitignore` includes `.env`
  - [ ] Verify `.gitignore` includes `node_modules`
  - [ ] Verify `.gitignore` includes `.next`

## Dev Notes

### Critical Implementation Requirements

**MUST USE EXACT COMMAND:**
```bash
npx create-next-app@latest website --typescript --tailwind --eslint --app --turbopack --import-alias "@/*"
```

**DO NOT:**
- Use interactive prompts (all flags provided)
- Use Pages Router (--app flag ensures App Router)
- Skip any configuration flags
- Modify the command in any way

### Architecture Compliance

**This story establishes the foundation for:**
- Epic 2: Database & Type System (TypeScript types in `website/lib/types.ts`)
- Epic 5: REST API (API routes in `website/app/api/`)
- Future frontend (Phase 3 - deferred)

**Key Architectural Patterns:**
- **Server Components First:** Default in App Router - use client components only when needed
- **API Routes:** Will be added in `app/api/agents/[slug]/case-studies/route.ts` (Epic 5)
- **Type Safety:** Strict TypeScript enforced (NFR-CQ5)

### File Structure Compliance

**Created by this story:**
- `website/` - Next.js application root
- `website/app/` - App Router directory
- `website/tsconfig.json` - TypeScript config
- `website/tailwind.config.ts` - TailwindCSS config
- `website/.eslintrc.json` - ESLint config
- `website/package.json` - Dependencies
- `website/.gitignore` - Git ignore patterns

**To be created in future stories:**
- `website/lib/` - Epic 2 (database connection, types)
- `website/app/api/` - Epic 5 (API routes)
- `website/.env.local` - Story 1.6 (environment variables)

### Common Pitfalls to Avoid

1. **DO NOT use Pages Router** - Ensure `app/` directory exists, NOT `pages/`
2. **DO NOT skip TypeScript strict mode** - Required by NFR-CQ5
3. **DO NOT modify .gitignore prematurely** - create-next-app provides good defaults
4. **DO NOT install extra dependencies yet** - Only what create-next-app provides
5. **DO NOT create API routes yet** - That's Epic 5

### Success Criteria Summary

**Story Complete When:**
1. ✅ `website/` directory exists at project root
2. ✅ `app/` directory exists (App Router confirmed)
3. ✅ TypeScript strict mode enabled in `tsconfig.json`
4. ✅ TailwindCSS configured in `tailwind.config.ts`
5. ✅ ESLint configured with Next.js rules
6. ✅ `npm run dev` starts without errors
7. ✅ Can access `http://localhost:3000` successfully
8. ✅ `.gitignore` includes security-critical patterns

### References

- **[Source: epics.md#Story-1.1]** - Story definition and acceptance criteria
- **[Source: architecture.md#AR1]** - Exact initialization command
- **[Source: prd.md#NFR-CQ5]** - TypeScript strict mode requirement
- **[Source: prd.md#FR43]** - .env files must be gitignored
- **[Source: architecture.md#AR17]** - API route structure (for future reference)

## Implementation Guidance

### Step-by-Step Execution

1. **Navigate to project root:**
   ```bash
   cd /Volumes/External/AIAgents
   ```

2. **Run initialization command:**
   ```bash
   npx create-next-app@latest website --typescript --tailwind --eslint --app --turbopack --import-alias "@/*"
   ```

3. **Wait for installation** (may take 2-3 minutes)

4. **Verify directory structure:**
   ```bash
   ls -la website/
   ls -la website/app/
   ```

5. **Check TypeScript config:**
   ```bash
   cat website/tsconfig.json | grep strict
   cat website/tsconfig.json | grep "@/\*"
   ```

6. **Test development server:**
   ```bash
   cd website
   npm run dev
   ```

7. **Verify in browser:** http://localhost:3000

8. **Run linting:**
   ```bash
   npm run lint
   ```

9. **Validate .gitignore:**
   ```bash
   cat .gitignore | grep -E "\.env|node_modules|\.next"
   ```

### Expected Output

**Console output should include:**
- "Creating a new Next.js app in..."
- "Installing dependencies..."
- "Initialized a git repository"
- "Success! Created website at..."

**Development server output:**
- "▲ Next.js 15.x.x"
- "Local: http://localhost:3000"
- "✓ Compiled successfully"

### Troubleshooting

**If create-next-app fails:**
- Ensure Node.js 18+ is installed: `node --version`
- Clear npm cache: `npm cache clean --force`
- Try with explicit version: `npx create-next-app@15 ...`

**If TypeScript strict mode missing:**
- Manually edit `tsconfig.json`
- Add `"strict": true` to `compilerOptions`

**If .gitignore incomplete:**
- Manually add missing patterns
- Ensure `.env.local` and `.env` are included

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

- Next.js 16.1.6 installation completed successfully
- Development server started on port 3008 (port 3000 in use)
- TypeScript compilation: 0 errors
- ESLint: 0 errors

### Completion Notes List

**Implementation Summary:**
- Executed exact command as specified: `npx create-next-app@latest website --typescript --tailwind --eslint --app --turbopack --import-alias "@/*"`
- Answered "No" to React Compiler prompt (not required by story)
- Answered "No" to src/ directory (App Router at root required)
- All acceptance criteria met

**Validations Completed:**
1. ✅ Next.js 16.1.6 with Turbopack installed
2. ✅ App Router confirmed (app/ directory exists, NO pages/ directory)
3. ✅ TypeScript strict mode enabled (tsconfig.json:7)
4. ✅ Import alias `@/*` configured (tsconfig.json:21-23)
5. ✅ TailwindCSS v4 configured via PostCSS plugin
6. ✅ ESLint configured with Next.js rules (eslint.config.mjs)
7. ✅ Development server starts successfully (http://localhost:3008)
8. ✅ No TypeScript errors (tsc --noEmit passed)
9. ✅ No ESLint errors (npm run lint passed)
10. ✅ .gitignore includes security patterns (.env*, node_modules, .next)

**Notes:**
- Next.js 16.1.6 uses TailwindCSS v4 (no tailwind.config.ts file, configured via postcss.config.mjs)
- Uses new flat ESLint config format (eslint.config.mjs instead of .eslintrc.json)
- All requirements from AR1, NFR-CQ5, and FR43 satisfied

### File List

**Core Configuration Files:**
- `website/package.json` - Dependencies and scripts
- `website/tsconfig.json` - TypeScript configuration (strict mode enabled)
- `website/eslint.config.mjs` - ESLint flat config with Next.js rules
- `website/postcss.config.mjs` - PostCSS with TailwindCSS plugin
- `website/next.config.ts` - Next.js configuration
- `website/.gitignore` - Git ignore patterns (includes .env*)
- `website/next-env.d.ts` - Next.js TypeScript declarations
- `website/README.md` - Next.js project documentation

**App Router Files:**
- `website/app/layout.tsx` - Root layout component
- `website/app/page.tsx` - Home page component
- `website/app/globals.css` - Global styles with Tailwind imports
- `website/app/favicon.ico` - Default favicon

**Static Assets:**
- `website/public/` - Static files directory

**Dependencies Installed:**
- next (16.1.6)
- react, react-dom
- typescript
- tailwindcss, @tailwindcss/postcss
- eslint, eslint-config-next
- @types/* (node, react, react-dom)

---

**Story Status:** done
**Created:** 2025-02-09
**Completed:** 2025-02-09
**Epic:** 1 - Project Foundation & Environment Setup
**Priority:** CRITICAL (Blocks Epic 2, 5, and future frontend)
