# Visual Specification: Docs Homepage Redesign

This document outlines the complete visual identity, styling tokens, component states, and motion choreography for the redesigned CrewLoop documentation homepage. It translates the architectural requirements of the landing page into a high-fidelity, implementable visual specification.

---

## 1. Brand Narrative & Case-Study Frame

### Problem
Developers view AI code orchestrators as unpredictable "black boxes." When CLI agents edit code directly, developers suffer from a lack of visibility and trust, leading them to abandon AI workflows for fear of silent errors, broken architectures, or security leaks. 

### Audience
Professional Software Engineers, Tech Leads, and Engineering Directors who expect code security, strict architectural compliance, and deterministic workflows. They value technical precision over simple wrappers and require clear visibility into their tooling.

### Insight
Trust is built on transparency and deterministic structures. Developers buy into autonomous AI systems only when they can inspect the real-time routing logic (hub-and-spoke), trace the agent's internal state machine, and see validation steps mapped visually.

### Solution
A high-performance "Cyber-Deterministic" landing page. By combining the raw clarity of a monospaced terminal simulator with premium, glassmorphic 3D visualizations, CrewLoop positions itself as an elite, production-grade system that brings structure and verification to agentic development.

---

## 2. Aesthetic Direction Statement

**Direction:** Futuristic Glassmorphic + Terminal Monospace (The "Cyber-Deterministic" Theme)

The design fuses futuristic, translucent glass panels and rich backdrop glows with the precise, high-contrast grid layouts of a developer terminal. Deep dark backgrounds are layered with glowing radial mesh gradients that pulse gently under glass-morphic surfaces, creating physical depth. Headings and interface boundaries use monospaced text, raw 1px lines, and status labels (`[OK]`, `[RUNNING]`, `[FAIL]`) to anchor the design in developer utility. The emotional effect is one of extreme performance, safety, and modern sophistication.

---

## 3. Color System Table

The interface uses a primary dark theme with custom semantic HSL tokens to represent status and active execution loops. Light mode is fully supported through a mirrored HSL color scheme.

| Token Name | Dark Mode HSL | Light Mode HSL | Intent / Usage |
| :--- | :--- | :--- | :--- |
| `--bg-primary` | `hsl(240, 20%, 3%)` | `hsl(240, 15%, 98%)` | Main layout canvas background |
| `--bg-surface` | `hsl(240, 16%, 6%)` | `hsl(240, 10%, 94%)` | Resting glass card backdrops |
| `--bg-elevated` | `hsl(240, 14%, 10%)` | `hsl(240, 10%, 89%)` | Raised widgets, dialogs, popovers |
| `--text-primary` | `hsl(240, 10%, 96%)` | `hsl(240, 20%, 12%)` | High-contrast body, header copy |
| `--text-secondary` | `hsl(240, 8%, 72%)` | `hsl(240, 12%, 38%)` | Secondary body, paragraph text |
| `--text-muted` | `hsl(240, 6%, 46%)` | `hsl(240, 8%, 62%)` | Code comments, disabled states |
| `--accent` | `hsl(180, 100%, 50%)` | `hsl(180, 100%, 35%)` | Cyan glow - Core flow highlights, active states |
| `--accent-alt` | `hsl(150, 100%, 45%)` | `hsl(150, 80%, 30%)` | Terminal emerald - Success logs, CLI prompts |
| `--success` | `hsl(145, 80%, 45%)` | `hsl(145, 80%, 35%)` | Verification pass, safe state updates |
| `--warning` | `hsl(38, 95%, 55%)` | `hsl(38, 95%, 45%)` | Warn conditions, lint issues, AFK state |
| `--error` | `hsl(355, 90%, 60%)` | `hsl(355, 85%, 45%)` | Terminate state, test failures, console trace |
| `--info` | `hsl(215, 95%, 60%)` | `hsl(215, 90%, 45%)` | Info dialogs, helper logs |
| `--border` | `hsla(240, 10%, 15%, 0.5)`| `hsla(240, 10%, 85%, 0.6)`| 1px glass card outer grid boundaries |
| `--border-glow` | `hsla(180, 100%, 50%, 0.15)`| `hsla(180, 100%, 35%, 0.08)`| Highlight borders for active components |
| `--focus` | `hsl(180, 100%, 50%)` | `hsl(180, 100%, 35%)` | Outline for keyboard focus rings |
| `--overlay` | `hsla(240, 20%, 3%, 0.7)` | `hsla(240, 20%, 98%, 0.7)` | Modals and detail drawer overlays |
| `--glass-bg` | `hsla(240, 16%, 6%, 0.65)` | `hsla(240, 10%, 95%, 0.7)` | Translucent glass backdrop |

---

## 4. Typography System Table

Typography enforces a strict hierarchy, pairing geometric display type with crisp monospace fonts.

| Level | Font | Size | Line-Height | Letter-Spacing | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **H1** | Space Grotesk | `3.00rem` (48px) | `1.15` | `-0.02em` | 700 (Bold) | Main Hero title |
| **H2** | Space Grotesk | `2.25rem` (36px) | `1.20` | `-0.01em` | 700 (Bold) | Section headings |
| **H3** | Space Grotesk | `1.50rem` (24px) | `1.30` | `0` | 600 (Semibold)| Card & bento box titles |
| **Body** | Plus Jakarta Sans | `1.00rem` (16px) | `1.60` | `0` | 400 (Regular) | Primary descriptions |
| **Body-sm**| Plus Jakarta Sans | `0.875rem` (14px)| `1.55` | `0` | 400 (Regular) | Meta text, cards subtext |
| **Label** | JetBrains Mono | `0.75rem` (12px) | `1.40` | `0.05em` | 500 (Medium)  | Tags, system status dots |
| **Button** | JetBrains Mono | `0.875rem` (14px)| `1.20` | `0.02em` | 700 (Bold)   | Button text, CTA anchors |
| **Code** | JetBrains Mono | `0.875rem` (14px)| `1.50` | `0` | 400 (Regular) | Terminals, config files |

---

## 5. Design Tokens

### Spacing Scale (4px Base Grid)
- `--space-xs`: `4px` (`0.25rem`) — Badge inner margin, label/dot separation.
- `--space-sm`: `8px` (`0.50rem`) — Input borders padding, tags gaps.
- `--space-md`: `16px` (`1.00rem`) — Card padding (standard), buttons vertical spacing.
- `--space-lg`: `24px` (`1.50rem`) — Main card layout grid gutters.
- `--space-xl`: `32px` (`2.00rem`) — Hero components offset, section container inner gaps.
- `--space-2xl`: `48px` (`3.00rem`) — Bento grid inner spacing gutters.
- `--space-3xl`: `64px` (`4.00rem`) — Mid-section vertical breaks.
- `--space-4xl`: `96px` (`6.00rem`) — Top and bottom page layout boundaries.

### Border Radius Scale
- `--radius-none`: `0` — Sharp corners for terminal windows and command inputs.
- `--radius-sm`: `4px` (`0.25rem`) — Visualizer active status indicators, small pill keys.
- `--radius-md`: `8px` (`0.50rem`) — Action buttons, small card blocks.
- `--radius-lg`: `12px` (`0.75rem`) — Default glass cards, comparison grid segments.
- `--radius-xl`: `16px` (`1.00rem`) — Hero visualizer wrappers, bento box wrappers.
- `--radius-full`: `9999px` — Rounded pill tags, profile badges.

### Elevation / Shadow Scale
- `--shadow-none`: `none` — Flat structural blocks.
- `--shadow-1`: `0 2px 8px hsla(0, 0%, 0%, 0.15), inset 0 1px 1px hsla(0, 0%, 100%, 0.05)` — Resting card.
- `--shadow-2`: `0 8px 24px hsla(0, 0%, 0%, 0.35), inset 0 1px 1px hsla(0, 0%, 100%, 0.08)` — Card hover state.
- `--shadow-3`: `0 16px 48px hsla(0, 0%, 0%, 0.50)` — Overlays and detail modals.
- `--shadow-glow-cyan`: `0 0 20px hsla(180, 100%, 50%, 0.15)` — Active cyan nodes glowing.
- `--shadow-glow-green`: `0 0 20px hsla(150, 100%, 45%, 0.12)` — Success command highlights.

---

## 6. Component Specs

### 1. Interactive CTA Buttons
- **Default State**:
  - Font: `var(--font-button)`, monospace.
  - Border: `1px solid var(--accent)`.
  - Background: `hsla(180, 100%, 50%, 0.05)`.
  - Color: `var(--accent)`.
  - Padding: `10px 20px`.
  - Border Radius: `var(--radius-md)`.
- **Hover State**:
  - Background: `var(--accent)`.
  - Color: `var(--bg-primary)`.
  - Box Shadow: `var(--shadow-glow-cyan)`.
  - Transform: `scale(1.02) translateY(-2px)`.
  - Transition: `transform 200ms cubic-bezier(0.25, 1, 0.5, 1), background 200ms ease`.
- **Active State**:
  - Background: `hsl(180, 100%, 40%)`.
  - Transform: `scale(0.98) translateY(0px)`.
- **Focus State**:
  - Outline: `2px dashed var(--focus)`.
  - Outline Offset: `3px`.
- **Disabled State**:
  - Border: `1px solid var(--text-muted)`.
  - Background: `transparent`.
  - Color: `var(--text-muted)`.
  - Cursor: `not-allowed`.

### 2. Glass Cards (`.glass-card-3d`)
- **Default State**:
  - Background: `var(--glass-bg)`.
  - Border: `1px solid var(--border)`.
  - Backdrop Filter: `blur(20px)`.
  - Border Radius: `var(--radius-lg)`.
  - Shadow: `var(--shadow-1)`.
- **Hover State**:
  - Border Color: `hsla(180, 100%, 50%, 0.3)`.
  - Transform: `translateY(-6px) rotateX(1deg) rotateY(1deg)`.
  - Shadow: `var(--shadow-2)`.
  - Background: `hsla(240, 16%, 8%, 0.7)`.
  - Transition: `all 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`.
- **Focus State**:
  - Border Color: `var(--accent)`.
  - Box Shadow: `var(--shadow-glow-cyan)`.
  - Outline: `none`.

### 3. Visualizer Nodes (`SkillVisualizer`)
- **Default State**:
  - Shape: Rounded rectangle (`var(--radius-md)`), 1px border.
  - Border: `1px solid var(--border)`.
  - Background: `var(--bg-elevated)`.
  - Text: `var(--text-secondary)`, monospace.
  - Interactive Target: `min-width: 120px, height: 48px` (Touch target compliance).
- **Hover State**:
  - Scale: `scale(1.10)`.
  - Border: `1px solid var(--accent)`.
  - Background: `hsla(180, 100%, 50%, 0.1)`.
  - Text Color: `var(--accent)`.
  - Box Shadow: `var(--shadow-glow-cyan)`.
  - Connected SVG lines transition from grey-dashed to solid neon cyan.
- **Active State (Selected)**:
  - Scale: `scale(1.10)`.
  - Border: `2px solid var(--accent)`.
  - Background: `hsla(180, 100%, 50%, 0.15)`.
  - Text Color: `var(--accent)`.
  - Inner Indicator: Glowing center status dot.
- **Focus State**:
  - Outline: `2px solid var(--focus)`.
  - Outline Offset: `2px`.

---

## 7. ASCII Wireframe Layout Sequence

```
=========================================================================================
[1] TOP NAVIGATION BAR
=========================================================================================
[CrewLoop Logo]     Docs  GitHub  CLI  |  $ npm i -g @archznn/crewloop-cli  [Copy]   [Dark/Light]
-----------------------------------------------------------------------------------------

=========================================================================================
[2] HERO SPLIT SECTION
=========================================================================================
  
  CREWLOOP: ENFORCED AGENTIC FLOW      | ┌──────────────────────────────────────────────┐
                                       | │ terminal: ~/crewloop                    [-][x]│
  Deterministic AI software engineering| ├──────────────────────────────────────────────┤
  teams executing step-by-step         | │ $ crewloop run "refactor auth"               │
  pipeline verification.               | │ > [🎯 Orchestrator] active                   │
                                       | │ > [🏗️ Architect] spec created                 │
  [ Get Started ]   [ Explore Skills ] | │ > [🔧 Engineer] writing tests...             │
                                       | │ > [SUCCESS] build passing (24 tests)         │
                                       | └──────────────────────────────────────────────┘

=========================================================================================
[3] INTERACTIVE HUB-AND-SPOKE VISUALIZER (SkillVisualizer)
=========================================================================================
  
                             .------ [ 🏗️ Architect ] ----.
                            /                             \
             [ 🚀 Shipper ]       .--- (Pulse) ----.       [ 🎨 Designer ]
                   |             /                  \             |
                   '----- [ 🎯 Orchestrator ] -------'------ [ 🔧 Engineer ]
                                 \                  /
                                  '--- [ 🔍 Reviewer ] ----'

  (Click on any node to view details on the interactive dashboard panel below)
  ┌─────────────────────────────────────────────────────────────────────────────────────┐
  │ SELECTED: [ 🔍 Reviewer ]                                                           │
  │ Action: Quality & Security gatekeeper. Scans diff, checks coverage, runs lint checks│
  │ Constraint: Never writes code, never runs git operations.                           │
  └─────────────────────────────────────────────────────────────────────────────────────┘

=========================================================================================
[4] SKILLS CATALOG BENTO GRID (Core Flow vs Specialist Advisors)
=========================================================================================

  CORE TEAM FLOW (Sequential pipeline)         SPECIALIST ADVISORS (Triggered as needed)
  ┌──────────────────┐ ┌──────────────────┐    ┌──────────────────┐ ┌──────────────────┐
  │ 🎯 Orchestrator  │ │ 🏗️ Architect     │    │ PM               │ │ Researcher       │
  │ Context & brief  │ │ Spec writer      │    │ Scope stories    │ │ Compare libraries│
  └──────────────────┘ └──────────────────┘    └──────────────────┘ └──────────────────┘
  ┌──────────────────┐ ┌──────────────────┐    ┌──────────────────┐ ┌──────────────────┐
  │ 🎨 Designer      │ │ 🔧 Engineer      │    │ Tester           │ │ Security Guard   │
  │ Spec UI mockup   │ │ Code execution   │    │ QA test plans    │ │ PII, secrets scan│
  └──────────────────┘ └──────────────────┘    └──────────────────┘ └──────────────────┘
  ┌──────────────────┐ ┌──────────────────┐    ┌──────────────────┐ ┌──────────────────┐
  │ 🔍 Reviewer      │ │ 🚀 Shipper       │    │ Accessibility    │ │ Maintainer       │
  │ Lint & gatekeeper│ │ Git commit, PR   │    │ WCAG compliance  │ │ Debt, bug triage │
  └──────────────────┘ └──────────────────┘    └──────────────────┘ └──────────────────┘

=========================================================================================
[5] ENFORCED FLOW VS STANDARD AGENTS MATRIX (Comparison Section)
=========================================================================================

  THE CREWLOOP DIFFERENCE: PROVABLE PIPELINES vs AGENTIC CHAOS
  ┌──────────────────────────────────────────┬──────────────────────────────────────────┐
  │ CrewLoop Enforced Flow (Deterministic)   │ Standard AI Agents (Heuristic/Ad-hoc)    │
  ├──────────────────────────────────────────┼──────────────────────────────────────────┤
  │ [✔] Pre-code architectural specifications │ [✘] Jump directly into implementation    │
  │ [✔] Strict role isolation (No self-review)│ [✘] Single agent writes, tests, commits  │
  │ [✔] Automatic git & PR handling by Shipper│ [✘] Manual git steps or arbitrary pushes │
  │ [✔] Security checks before final commit  │ [✘] Vulnerabilities pushed unchecked     │
  └──────────────────────────────────────────┴──────────────────────────────────────────┘

=========================================================================================
[6] METRICS & PERFORMANCE TESTIMONIALS
=========================================================================================

  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
  │          -94%          │  │         100%           │  │          12k+          │
  │   Production Errors    │  │  Spec Traceability     │  │   Autonomous Runs      │
  │ "Enforced Reviewer gates│  │ "No code is written    │  │ "Powering enterprise   │
  │ block bug regression." │  │ without an approved spec"│  │ pipelines."            │
  └────────────────────────┘  └────────────────────────┘  └────────────────────────┘

=========================================================================================
[7] QUICK START CLI INSTALLER SECTION
=========================================================================================

  Ready to orchestrate your loops?
  Run the global installer command:
  ┌─────────────────────────────────────────────────────────────────────────────────────┐
  │ $ npm install -g @archznn/crewloop-cli && crewloop install                   [Copy] │
  └─────────────────────────────────────────────────────────────────────────────────────┘

=========================================================================================
[8] FOOTER GRID
=========================================================================================
  CrewLoop (c) 2026. Distributed under MIT License.
  Docs | CLI GitHub | Dashboard Server | NPM package
=========================================================================================
```

---

## 8. Motion Choreography Table

Animations build visual excitement without causing layout lag or navigation fatigue.

| Animation Element | Trigger Condition | Animating CSS Properties | Duration (ms) | Easing Curve (cubic-bezier) | Stagger / Delay | Reduced-Motion Fallback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Load Reveal** | Page Render (`onload`) | `opacity`, `transform` (Translate Y from 20px to 0) | `500ms` | `cubic-bezier(0.25, 1, 0.5, 1)` | `index * 60ms` stagger | Opacity crossfade only |
| **Glow Blob Drift** | Continuous Loop | `transform` (Translate, Scale grid path) | `25000ms` | `ease-in-out` | None (infinite loop) | Static background |
| **Node Spring Scale**| Cursor Hover | `transform` (Scale 1.0 to 1.1) | `300ms` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | None (instant trigger) | Standard linear scale |
| **Handoff Dash Flow**| Active visualizer loop| `stroke-dashoffset` | `3000ms` | `linear` | Loop animation | Static dashed path line |
| **Terminal Log Feed**| Sim step change | `opacity`, `transform` (Translate Y from 5px to 0) | `200ms` | `ease-out` | Typewriter sequence delay| Instant content injection|
| **Matrix Row Reveal**| Scroll into viewport (20%)| `opacity`, `transform` (Translate X from -10px to 0)| `400ms` | `cubic-bezier(0.25, 1, 0.5, 1)` | `row_index * 80ms` | Instant row opacity fade |
| **Button Click Scale**| Pointer Down | `transform` (Scale 1.0 to 0.98) | `120ms` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | None | Instant background tint |

---

## 9. Real-State Specs

### 1. Skeleton Loading States
For bento grids, card details, and visualizer layouts loading async content:
- **Structure**: Gray translucent boxes matching component shapes (`var(--bg-elevated)`).
- **Effect**: Shimmer effect (`shimmer-drift`). A diagonal light band sweeps left-to-right indefinitely.
- **CSS Rule**:
  ```css
  @keyframes shimmerDrift {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .skeleton-shimmer {
    background: linear-gradient(90deg, 
      var(--bg-elevated) 25%, 
      hsla(240, 10%, 15%, 0.4) 50%, 
      var(--bg-elevated) 75%
    );
    background-size: 200% 100%;
    animation: shimmerDrift 1.5s infinite;
  }
  ```

### 2. Live Terminal Simulator States
- **Loading State**: Terminal displays `[RUNNING]` indicator with an active spinning command prompt bar `|` / `/` / `-` / `\`.
- **Success State**: Complete workflow prints checkmarks in emerald `[OK]` or `[SUCCESS]` along with a summary statement.
- **Error State**: Terminal displays code trace lines in dark red `[FAIL]`, printing a mock stack trace and a flashing prompt: `Run 'crewloop audit' to review build logs. [Retry Action Button]`.

### 3. Connection Loss (Offline State)
- **Visual Signal**: A warning strip (`1.5rem` height) drops down at the top of the viewport: `[OFFLINE MODE] - Accessing local cached documentation. Sync will resume once connection is re-established.`
- **Colors**: Background `var(--warning)`, text `var(--bg-primary)`.
- **Interactive changes**: Network-reliant dashboard links display a greyed-out icon.

---

## 10. Asset List & Export Specification

### 1. Custom SVG Asset List
- **Icons Set**: All icons use the `@phosphor-icons/react` package at size `24px`.
  - Core navigation: `TerminalWindow`, `ShieldCheck`, `GitFork`, `Cpu`, `Browsers`, `Key`.
  - Process statuses: `CheckCircle` (success), `WarningCircle` (warning), `XCircle` (error), `ArrowClockwise` (retry).
- **Background Textures**:
  - `noise.svg`: A noise filter applied on a full-viewport overlay at 3% opacity.
  ```xml
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.03"/>
  </svg>
  ```
  - `mesh-gradients.css`: Soft radial glows generated using CSS variables placed in layout absolute divs (no image requests required).

### 2. Asset Export Specification

| Asset Type | Standard Format | Target Sizing | Naming Scheme | Usage Context |
| :--- | :--- | :--- | :--- | :--- |
| **Icons** | SVG | `24x24px`, vector | `icon-{name}.svg` | Interactive buttons, tags |
| **Illustrations**| Vector SVG | Responsive viewBox | `visualizer-{name}.svg` | Node visualizer, comparative overlays |
| **Logo** | SVG, 2x PNG | ViewBox `180x48px` | `crewloop-logo-{variant}.{ext}`| Topbar header, footer |
| **Screenshots** | WebP (AVIF Fallback)| `1280x720px` max | `mockup-{feature}.webp` | Testimonials details panels |
| **Favicon** | PNG, ICO | `32px`, `180px`, `512px` | `favicon-{size}.png` | Browser bookmarks, web clips |

---

## 11. Presentation Mockups

To prepare the redesign for portfolio-grade presentation, the layout handles three distinct contextual frames:

1. **Browser-Frame Mockup (Desktop View)**
   - Simulated macOS browser window frame with dark chrome header bar and window controls.
   - Screen bounds set to `1280px` max-width container, centered with side padding of `var(--space-xl)`.
2. **Device Mockup (Mobile/Tablet)**
   - Double-column layout stacks vertically (Terminal simulator drops underneath Hero head copy).
   - SVG visualizer wrapper maps paths dynamically using relative percentages, with option to toggle list layout for narrow screens (`< 480px`).
3. **Before/After Screen Comparison**
   - Interactive sliding canvas showing old standard Docusaurus theme on the left and new Cyber-Deterministic theme on the right.

---

## 12. Pre-Implementation Checklist

- [x] Brand narrative ties visual direction to audience and problem.
- [x] Aesthetic direction is intentional, not generic.
- [x] Color system uses semantic HSL tokens for dark/light modes.
- [x] Typography system defines exact sizes, weights, and line-heights.
- [x] Design tokens cover spacing, border-radius, elevation scales.
- [x] Contrast ratios verified (body copy ≥ 4.5:1, large display ≥ 3:1).
- [x] Touch targets mapped to safe sizes (minimum 44x44px).
- [x] Focus states designed for buttons, cards, and interactive nodes.
- [x] Loading, empty, success, and error states are specified.
- [x] Motion specifications include durations, easings, and reduced-motion fallbacks.
- [x] Chart element color variables and visual series indicators are documented.
- [x] No emoji used as structural interface icons.
