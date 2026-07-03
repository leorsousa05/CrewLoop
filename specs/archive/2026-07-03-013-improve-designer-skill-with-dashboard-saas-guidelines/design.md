# Design: Designer Skill Improvements (Portfolio-Ready Edition)

This specification details the structural changes to the `designer` skill rules and guidelines so that every design output becomes a **portfolio-ready case study** while remaining fully implementable by engineers.

## [Padrões Aplicados]

### 1. User-Centric Dashboard Layout Patterns
- **Justification:** Adding concrete guidelines for Bento Grids, Minimalist Linear-like layouts, Terminal Monospace brutalism, and Glassmorphism prevents fallback to generic grids and provides clear templates for SaaS and product interfaces.

### 2. User Flow & Interaction Specification Patterns
- **Justification:** Requiring the designer to formally spec primary navigation (sidebars/topbars), modal overlays, right-click context menus, tooltips, and conversion flows forces the agent to balance visual aesthetics with usability.

### 3. SVG-first & Text-based Visual Specs (ASCII Wireframing)
- **Justification:** Requiring ASCII representations of charts, graphs, metrics cards, and widget layouts ensures the handoff to the Engineer is concrete, functional, and highly detailed. This forces the designer to think about layout grids, responsiveness, and information hierarchy before handoff.

### 4. Conversion-Centered Design (CCD) with 8-12 Section Sequences
- **Justification:** Standardizing landing-page flows to require a detailed sequence of 8 to 12 sections (Hero, Trust Logos, Hook, Product Demo, Bento Features, Stats, Testimonials, Pricing Cards, FAQs, Final CTA, Footer) prevents oversimplified 3-section pages.

### 5. Accessible Design Systems for Data Visualization (WCAG Guidelines)
- **Justification:** Standardizing chart accessibility (non-color indicators like dash arrays, distinct line shapes, and 3:1 contrast ratios) ensures premium designs are universally accessible.

### 6. Brand Narrative & Case-Study Structure
- **Justification:** Portfolio-worthy work is framed as a story: problem → audience → insight → visual solution → outcome. Requiring a short case-study structure in every output elevates the design from a spec sheet to a product story.

### 7. Real-State UI Design
- **Justification:** Real products spend a large fraction of their lifetime in loading, empty, error, skeleton, success, or offline states. Designing these explicitly prevents fragile, placeholder-ridden UIs and proves the design is production-ready.

### 8. Complete Design-Token Taxonomy
- **Justification:** A precise token system (spacing, radius, elevation, typography scale, semantic color, asset sizes) removes ambiguity in engineering handoff and makes the design system reproducible across components.

### 9. Contextual Mockup & Presentation Specs
- **Justification:** ASCII wireframes are engineering-friendly but not portfolio-friendly. Requiring descriptions of browser/device frames, before/after comparisons, and environmental context makes the work feel finished and shareable.

### 10. Granular Motion Choreography
- **Justification:** High-impact motion requires exact timing, easing, keyframes, stagger formulas, scroll triggers, and cursor-driven effects. Granular specs prevent engineers from guessing and produce polished, intentional interfaces.

---

## [Estratégia de Implementação]

### Phase 1: Update `skills/designer/SKILL.md`

1. **Brand Narrative & Case-Study Structure**
   - Add a new deliverable step before "Aesthetic Direction Statement" that requires a short case-study frame:
     - **Problem:** What user/job-to-be-done this interface serves.
     - **Audience:** Primary user persona and their emotional/contextual state.
     - **Insight:** The single insight that justifies the chosen direction.
     - **Solution:** One sentence tying the direction to the product promise.
   - Update "Aesthetic Direction Statement" to reference the case-study frame explicitly.

2. **Real-State Specifications**
   - Add a new deliverable: **Real-State Specs**.
   - For each key component/screen, the designer must describe visual treatment for:
     - **Loading:** Skeleton, spinner, progress, or shimmer approach.
     - **Empty:** Empty-state illustration/iconography, copy tone, and CTA.
     - **Error:** Inline message, toast, full-screen error, retry action.
     - **Skeleton:** Placeholder structure that mirrors final layout.
     - **Success:** Confirmation state, checkmark, toast, confetti (if appropriate).
     - **Offline:** Cached-state indicator, retry flow, disabled actions.

3. **Complete Design-Token System**
   - Expand the "Color System" deliverable to require semantic tokens:
     - Background, surface, elevated, text-primary, text-secondary, text-muted, accent, success, warning, error, info, border, focus, overlay.
   - Add new deliverables/tables:
     - **Spacing Scale:** 4px base grid with named steps (xs=4, sm=8, md=16, lg=24, xl=32, 2xl=48, 3xl=64, 4xl=96).
     - **Border Radius Scale:** none=0, sm=4, md=8, lg=12, xl=16, 2xl=24, full=9999.
     - **Elevation/Shadow Scale:** 0-5 levels with exact CSS `box-shadow` values.
     - **Typography Scale:** Type scale with exact sizes (px/rem), line-heights, letter-spacing, weights.
     - **Asset Export Spec:** Icon sizes (16/20/24/32/48), image formats (SVG/WebP/AVIF), and recommended export names.

4. **Contextual Mockup Requirements**
   - Add a new deliverable: **Presentation Mockups**.
   - Require at least three contextual descriptions:
     - **Browser-frame mockup:** How the design looks inside a browser window.
     - **Device mockup:** Mobile/tablet adaptation description.
     - **Before/after or competitive comparison:** What the design replaces and why it is better.

5. **Granular Motion Choreography**
   - Replace the single "Motion Choreography" deliverable with a structured table containing:
     - Animation name.
     - Trigger (load, scroll, hover, click, focus, data-update, route-change).
     - Animation property (transform, opacity, filter).
     - Duration (ms).
     - Easing function (cubic-bezier or spring approximation).
     - Stagger formula (if applicable).
     - Reduced-motion fallback.
   - Add guidance for scroll-triggered reveals, cursor-driven parallax/glow, and page transitions.

6. **Pre-Implementation Checklist Updates**
   - Add portfolio-ready and real-state checks:
     - Brand narrative is present and tied to audience.
     - Loading, empty, error, skeleton, success, and offline states are spec'd.
     - Design tokens cover color, spacing, radius, elevation, typography, and assets.
     - At least three contextual mockups are described.
     - Motion specs include reduced-motion fallbacks.

### Phase 2: Update `skills/designer/references/aesthetic-guidelines.md`

1. Add a new **"Portfolio-Ready Output"** section that defines the quality threshold:
   - Every design must tell a product story, not just list visual choices.
   - Every design must prove it works in real states.
   - Every design must be reproducible via a complete token system.
   - Every design must include motion with accessibility alternatives.

2. Add a **"Real-State Design"** subsection under **"Technical Guardrails"**:
   - Skeleton must mirror final layout to avoid layout shift.
   - Empty states must have a clear CTA and on-brand tone.
   - Error states must use both color and icon/text; never color alone.
   - Loading feedback must appear within 300ms for operations over that threshold.
   - Success states must be brief and non-blocking.

3. Expand **"Color & Theme"** to include a full semantic-token example table.

4. Expand **"Spatial Composition"** to define spacing and border-radius scales.

5. Add an **"Elevation & Shadow System"** section.

6. Expand **"Motion Design"** to include:
   - Keyframe naming conventions.
   - Scroll-trigger thresholds (e.g., 20% viewport intersection).
   - Cursor-driven effects with `transform` and `opacity` only.
   - Stagger formulas (`delay = index * 50ms + base 100ms`).

7. Add an **"Asset & Export Conventions"** section.

### Phase 3: Validation & Handoff

1. Update `specs/changes/013-improve-designer-skill-with-dashboard-saas-guidelines/specs/designer.md` to reflect the expanded delta.
2. Update `tasks.md` with new implementation tasks.
3. Validate the modified files by running `python scripts/validate-skills.py`.

---

## Risk Assessment

- **Risk:** Requiring too many deliverables makes the skill output excessively long.
  - **Mitigation:** Keep each deliverable concise; use tables and checklists rather than prose. The skill asks for completeness, not verbosity.
- **Risk:** Designers using the skill may find the token system rigid.
  - **Mitigation:** Tokens are presented as a required handoff format, not a fixed theme. The skill still allows any aesthetic direction.
- **Risk:** ASCII-only mockups may not feel "portfolio-ready" to some users.
  - **Mitigation:** Contextual mockup descriptions compensate by requiring the designer to verbally frame the work as finished presentation pieces.

## Deferred Items

- Generating actual image mockups or Figma files (out of scope; text specs only).
- Automated contrast checking or token validation tooling (could be added in a future spec).
