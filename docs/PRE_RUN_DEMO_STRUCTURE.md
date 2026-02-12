# Pre-Run Demo Structure

**Document Version:** 1.0
**Last Updated:** 2026-02-12
**Status:** LOCKED - This structure is standardized across all pre-run demo agents

---

## Overview

This document defines the canonical structure for pre-run demo case studies. This structure was established during the development of the Fraud Trends (Scout) agent and must be used for all future pre-run demo agents.

**Important:** This structure is different from live demo agents, which allow real-time user interaction.

---

## 1. Page Layout

### Top Section: Animated Workflow Explanation
- **Component:** `ScoutEasel.tsx` (or agent-specific easel component)
- **Purpose:** Educational overview showing how the agent works
- **Features:**
  - Kawaii robot mascot with breathing/blinking animations
  - Wooden easel with glass whiteboard
  - Interactive step-by-step walkthrough (6 steps for Scout)
  - Auto-animation with typewriter effect for descriptions
  - Manual navigation (prev/next buttons, progress dots)
  - Speech bubbles showing agent's current action

### Middle Section: Case Study Tabs
- **Component:** `CaseStudyList.tsx`
- **Purpose:** Browse between multiple pre-run demonstrations
- **Features:**
  - Horizontal tab bar showing all available case studies
  - Active tab highlighted with agent's brand color
  - Click to switch between case studies
  - Shows case study title preview in each tab

### Bottom Section: Case Study Detail
- **Component:** `WorkflowVisualization.tsx` + `CaseStudyCard.tsx`
- **Purpose:** Display detailed execution of a specific case study
- **Features:**
  - Header with step number badge and navigation arrows
  - Step-specific narrative description (not generic)
  - Technical details always visible (no accordion/toggle)
  - Click-only navigation (no auto-play)

---

## 2. Component Structure

### Header Section
```typescript
// Located at top of WorkflowVisualization
<div className="whiteboard-header">
  <div className="flex items-center gap-4">
    {/* Step Number Badge - 96x96px */}
    <div className="w-24 h-24 rounded-2xl"
         style={{ background: agentColor }}>
      {stepNumber}
    </div>

    {/* Step Title */}
    <h3>Step {stepNumber}: {stepName}</h3>

    {/* Step Type Badge */}
    <span className="step-type-badge">{stepType}</span>
  </div>

  {/* Navigation Arrows - Top Right */}
  <div className="flex gap-3">
    <button onClick={() => previousStep()}>←</button>
    <button onClick={() => nextStep()}>→</button>
  </div>
</div>
```

### Content Section
```typescript
// Narrative Description
<p>{narrative}</p>  // Agent-specific, not generic

// Technical Details - Always Visible
<div className="technical-details">
  <h4>🔍 Technical Details</h4>
  <div className="details-content">
    {formatDetailsForAccordion(details)}
  </div>
</div>
```

### Navigation
- **NO timeline bar at bottom**
- **NO play/pause/reset buttons**
- **NO auto-advance**
- **YES to next/back arrows in header**
- **YES to tab switching between case studies**

---

## 3. Data Structure

### ExecutionStep Interface
```typescript
interface ExecutionStep {
  // Support both camelCase (API) and snake_case (legacy)
  stepNumber?: number;
  step_number?: number;
  stepName?: string;
  step_name?: string;
  stepType?: string;
  step_type?: string;
  details?: Record<string, unknown>;
  durationMs?: number | null;
  duration_ms?: number | null;
  timestamp: string;
}
```

### Narrative Generation
```typescript
// Agent-specific descriptions mapped by step_type
const AGENT_STEP_DESCRIPTIONS: Record<string, string> = {
  'planning': 'The agent creates a research plan...',
  'search_industry': 'Searches insurance industry publications...',
  // ... specific to each step type
};

function generateNarrative(step: ExecutionStep): string {
  const stepType = step.stepType || step.step_type || '';

  if (AGENT_STEP_DESCRIPTIONS[stepType]) {
    return AGENT_STEP_DESCRIPTIONS[stepType];
  }

  // Fallback (past tense for pre-run demos)
  return `The agent executed this step as part of its workflow process...`;
}
```

---

## 4. Styling Standards

### Colors
- **Whiteboard Background:** `rgba(253, 240, 213, 0.98)` (papaya-whip)
- **Text on Whiteboard:** `#003049` (dark blue - high contrast)
- **Step Badge Background:** Agent's brand color with gradient
- **Step Badge Text:** `#FDF0D5` (cream)
- **Technical Details Background:** `rgba(0, 48, 73, 0.05)`

### Typography
- **Step Title:** 2xl, bold, dark blue
- **Narrative:** text-lg, leading-relaxed, dark blue
- **Technical Details Title:** text-xl, bold, dark blue
- **Technical Details Content:** Formatted key-value pairs

### Animations
- **Easel Component:** Full animations (breathing, blinking, typewriter)
- **Case Study Detail:** NO animations (static, click-only)
- **Tab Switching:** Fade-in animation only

---

## 5. Required Case Study Count

**Standard:** 5 case studies per agent (as defined in documentation)

For Fraud Trends Agent:
1. Auto Insurance Fraud 2024-2025
2. Property Fraud After Climate Events
3. Digital & Synthetic Identity Fraud
4. Organized Fraud Rings
5. Technology in Fraud Detection

---

## 6. Step Type Taxonomy

Standard step types across all agents:

| Step Type | Icon | Usage |
|-----------|------|-------|
| `planning` | 📋 | Initial strategy/plan creation |
| `search` | 🔍 | General search operations |
| `search_industry` | 📰 | Industry-specific search |
| `search_regulatory` | 🏛️ | Regulatory source search |
| `search_academic` | 📚 | Academic paper search |
| `analysis` | 🧠 | Data analysis/processing |
| `extraction` | 📊 | Information extraction |
| `synthesis` | ✨ | Final report generation |
| `filter` | 🔎 | Data filtering |
| `validation` | ✅ | Validation/verification |
| `output` | 📤 | Output generation |

---

## 7. File Locations

### Components
- `/app/components/ScoutEasel.tsx` - Animated workflow explanation (agent-specific)
- `/app/components/WorkflowVisualization.tsx` - Case study detail viewer (shared)
- `/app/components/CaseStudyList.tsx` - Tab navigation (shared)
- `/app/components/CaseStudyCard.tsx` - Case study container (shared)
- `/app/components/formatDataAsText.tsx` - Technical details formatter (shared)

### Agent Scripts
- `/agents/[agent-name]/generate_case_studies.py` - Generate all case studies
- `/agents/[agent-name]/scripts/import_case_studies.py` - Import to database

### Documentation
- `/docs/[number]-[agent-name].md` - Agent specification
- `/docs/PRE_RUN_DEMO_STRUCTURE.md` - This document (universal structure)

---

## 8. Agent-Specific Customization Points

### What to Customize per Agent:
1. **Easel Component** - Robot design, step descriptions, speech bubbles
2. **Step Descriptions** - Agent-specific narrative for each step_type
3. **Step Type Icons** - If agent has unique step types
4. **Brand Color** - Agent's primary color for badges/highlights
5. **Case Study Topics** - 5 topics specific to agent's domain

### What MUST Stay the Same:
1. **Page layout order** - Easel → Tabs → Detail
2. **Navigation pattern** - Click-only, no auto-play for case studies
3. **Header structure** - Badge + Title + Type + Arrows
4. **Data structure** - ExecutionStep interface
5. **Database schema** - case_studies and execution_steps tables
6. **Component reuse** - WorkflowVisualization, CaseStudyList, etc.

---

## 9. Differences from Live Demo

| Feature | Pre-Run Demo | Live Demo |
|---------|--------------|-----------|
| **User Input** | No input - browse pre-generated | User provides parameters |
| **Execution** | Static, already completed | Real-time execution |
| **Navigation** | Click through steps | Watch progress live |
| **Results** | Stored in database | Generated on-the-fly |
| **Animation** | Easel only, not case studies | Full workflow animation |
| **Case Study Count** | Fixed (5 per agent) | Unlimited user sessions |

---

## 10. Migration Checklist

When converting a legacy agent to this structure:

- [ ] Create agent-specific Easel component
- [ ] Update WorkflowVisualization to remove auto-play
- [ ] Remove timeline navigation from bottom
- [ ] Add next/back arrows to header
- [ ] Add tab navigation for case studies
- [ ] Change generic narratives to specific descriptions
- [ ] Remove accordion, show technical details always
- [ ] Fix property naming (camelCase vs snake_case)
- [ ] Update fallback text to past tense ("executed" not "is executing")
- [ ] Ensure 5 case studies are generated
- [ ] Test build and deploy

---

## 11. Future Considerations

### For Live Demo Agents
When building live demo agents (like Sage), consider:
- Real-time streaming of step execution
- WebSocket connection for progress updates
- User input form at top
- Cancel/interrupt functionality
- Rate limiting and queue management
- Cost tracking per execution

### For Additional Pre-Run Agents
When adding more pre-run agents:
- Reuse WorkflowVisualization, CaseStudyList components
- Create new agent-specific Easel component
- Define 5 case study topics in documentation
- Run agent script to generate cases
- Import to shared database tables
- Update agent registry in page router

---

## 12. Key Lessons Learned

### From Scout Agent Development

1. **Property Naming:** API returns camelCase but component initially expected snake_case. Solution: Support both with normalization layer.

2. **Generic vs Specific:** Original implementation used generic "The agent is executing..." text. Users want specific explanations per step type.

3. **Past vs Present Tense:** Pre-run demos should use past tense ("executed") since they're historical, not live.

4. **Navigation Clarity:** Users found timeline redundant with header navigation. Header arrows are clearer.

5. **Technical Details:** Users want to see details without clicking accordion. Always-visible is better for pre-run demos.

6. **Visual Hierarchy:** Step number badge must be LARGE (96x96px) to be immediately visible. Small badges were missed.

7. **Color Contrast:** White text on papaya-whip background is invisible. Always use dark text on light backgrounds for readability.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-12 | Initial documentation based on Scout agent implementation |

---

**End of Document**
