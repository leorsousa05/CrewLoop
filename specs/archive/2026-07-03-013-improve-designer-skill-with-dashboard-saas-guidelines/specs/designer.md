# Specification Delta: Designer Skill Improvements (Portfolio-Ready Edition)

## Bounded Context

- **Designer Skill Instructions:** `skills/designer/SKILL.md`
- **Designer Aesthetic Reference:** `skills/designer/references/aesthetic-guidelines.md`

---

## 1. Directory Tree Changes

No folders or files are created or deleted. The directory tree remains:

```text
skills/
└── designer/
    ├── SKILL.md (MODIFIED)
    └── references/
        └── aesthetic-guidelines.md (MODIFIED)
```

---

## 2. `skills/designer/SKILL.md` Changes

### 2.1 Brand Narrative & Case-Study Structure

Add a new deliverable step **before** the existing "Aesthetic Direction Statement" that requires a short case-study frame:

- **Problem:** The user/job-to-be-done this interface serves.
- **Audience:** Primary user persona and their emotional/contextual state.
- **Insight:** The single insight justifying the chosen direction.
- **Solution:** One sentence tying the direction to the product promise.

Update the "Aesthetic Direction Statement" description to require that it references the case-study frame (e.g., "Build on the case-study frame above with 2-3 sentences describing the visual direction and why it fits the product and audience").

### 2.2 Real-State Specifications

Add a new deliverable: **Real-State Specs**. For each key component or screen, the designer must define visual treatment for:

- **Loading:** Skeleton, spinner, progress bar, or shimmer approach.
- **Empty:** Empty-state illustration/iconography, copy tone, and CTA.
- **Error:** Inline message, toast, full-screen error, retry action.
- **Skeleton:** Placeholder structure that mirrors the final layout.
- **Success:** Confirmation state, checkmark, toast, or non-blocking celebration.
- **Offline:** Cached-state indicator, retry flow, disabled actions.

### 2.3 Complete Design-Token System

Expand deliverables to require a full token taxonomy in table form:

- **Color System:** Semantic tokens — background, surface, elevated, text-primary, text-secondary, text-muted, accent, success, warning, error, info, border, focus, overlay.
- **Spacing Scale:** 4px base grid — xs=4, sm=8, md=16, lg=24, xl=32, 2xl=48, 3xl=64, 4xl=96.
- **Border Radius Scale:** none=0, sm=4, md=8, lg=12, xl=16, 2xl=24, full=9999.
- **Elevation/Shadow Scale:** 0-5 levels with exact `box-shadow` values.
- **Typography Scale:** Exact sizes in px/rem, line-heights, letter-spacing, and weights.
- **Asset Export Spec:** Icon sizes (16/20/24/32/48), image formats (SVG/WebP/AVIF), and recommended export names.

### 2.4 Contextual Mockup Requirements

Add a new deliverable: **Presentation Mockups**. Require at least three contextual descriptions:

- **Browser-frame mockup:** How the design looks inside a browser window.
- **Device mockup:** Mobile/tablet adaptation description.
- **Before/after or competitive comparison:** What the design replaces and why it is better.

### 2.5 Granular Motion Choreography

Replace the single "Motion Choreography" deliverable with a structured table containing:

| Field | Description |
| --- | --- |
| Animation name | e.g., "Card entrance" |
| Trigger | load, scroll, hover, click, focus, data-update, route-change |
| Property | transform, opacity, filter (only transform/opacity for layout-avoidance) |
| Duration | ms |
| Easing | cubic-bezier or spring approximation |
| Stagger formula | e.g., `delay = index * 50ms + base 100ms` |
| Reduced-motion fallback | static or fade only |

Add guidance for scroll-triggered reveals, cursor-driven parallax/glow, and page transitions.

### 2.6 Updated Pre-Implementation Checklist

Append portfolio-ready checks:

- [ ] Brand narrative ties visual direction to audience and problem.
- [ ] Loading, empty, error, skeleton, success, and offline states are spec'd.
- [ ] Design tokens cover color, spacing, radius, elevation, typography, and assets.
- [ ] At least three contextual mockups are described.
- [ ] Motion specs include reduced-motion fallbacks.

### 2.7 Existing Dashboard & SaaS Deliverables Remain

Keep existing additions:

- ASCII chart/widget wireframes.
- Data Visualization Spec.
- User Flow & Interaction Spec.
- 8-12 section landing-page sequence.

---

## 3. `aesthetic-guidelines.md` Changes

### 3.1 New "Portfolio-Ready Output" Section

Define the quality threshold:

- Every design must tell a product story, not just list visual choices.
- Every design must prove it works in real states.
- Every design must be reproducible via a complete token system.
- Every design must include motion with accessibility alternatives.

### 3.2 Expanded "Color & Theme"

Add a full semantic-token example table mapping tokens to usage.

### 3.3 Expanded "Spatial Composition"

Add spacing and border-radius scales.

### 3.4 New "Elevation & Shadow System" Section

Define shadow levels 0-5 with exact values and usage contexts.

### 3.5 Expanded "Motion Design"

Add:

- Keyframe naming conventions.
- Scroll-trigger thresholds (e.g., 20% viewport intersection).
- Cursor-driven effects using `transform` and `opacity` only.
- Stagger formulas.

### 3.6 New "Asset & Export Conventions" Section

Define icon sizes, image formats, and naming conventions.

### 3.7 New "Real-State Design" Subsection under "Technical Guardrails"

- Skeleton must mirror final layout.
- Empty states must have a clear CTA and on-brand tone.
- Error states must use color + icon/text.
- Loading feedback within 300ms.
- Success states must be brief and non-blocking.

### 3.8 Existing Sections Remain

Keep existing sections:

- Dashboard & Data Visualization Design.
- Dashboard Easing & Fluid Animations.
- User Interaction & Navigation Architecture.
- Conversion-Centered Landing Page Design.
- Existing accessibility guardrails.
