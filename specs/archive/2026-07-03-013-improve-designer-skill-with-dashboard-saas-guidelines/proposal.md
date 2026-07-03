# Proposal: Improve Designer Skill with Dashboard, SaaS and Portfolio-Ready Guidelines

## Motivation

The current `designer` skill has already moved away from generic "AI slop" aesthetics, but the output still reads like an internal spec sheet rather than a **portfolio-ready case study**. Engineers can implement from it, yet the designs rarely feel like finished pieces that could live on Behance, Dribbble, or a design portfolio.

The missing layer is **design narrative + production depth**:

- There is no explicit **brand narrative** that explains why a visual direction was chosen for this specific product and audience.
- Real interface states — loading, empty, error, skeleton, success, offline — are treated as afterthoughts rather than first-class deliverables.
- The **design-token system** is loose (colors and typography are listed, but spacing, radius, elevation, and asset export sizes are not standardized), making handoff to engineering imprecise.
- **Mockups** are limited to ASCII wireframes. There is no requirement to describe contextual presentation (browser/device frames, before/after comparisons, environmental shots) that make the work feel finished.
- **Motion choreography** is high-level. It lacks keyframe definitions, stagger formulas, scroll-trigger thresholds, cursor-driven effects, and per-component reduced-motion fallbacks.
- There is no **case-study structure** in the output, so the designer never frames the work as a problem → solution → outcome narrative.

This spec expands the in-progress `013-improve-designer-skill-with-dashboard-saas-guidelines` work to close those gaps. The goal is to make every design produced by the skill feel like a **deliberate, portfolio-worthy product story** while remaining fully implementable by an engineer.

## Scope

### In Scope

- Update `skills/designer/SKILL.md` to require portfolio-ready deliverables:
  - **Brand Narrative & Case-Study Structure** in every design output.
  - **Real-State Specifications** for loading, empty, error, skeleton, success, and offline states.
  - **Complete Design-Token System** including spacing, radius, elevation, typography scale, semantic color usage, and asset export sizes/formats.
  - **Contextual Mockup Requirements** (device/browser frames, before/after, environmental presentation).
  - **Granular Motion Choreography** with keyframes, stagger formulas, scroll triggers, cursor-driven effects, and reduced-motion fallbacks.
- Update `skills/designer/references/aesthetic-guidelines.md` with:
  - A "Portfolio-Ready Output" section defining quality thresholds.
  - Expanded real-state design rules.
  - A complete design-token taxonomy.
  - Advanced motion specs and accessibility alternatives.
- Update the existing spec folder (`specs/changes/013-improve-designer-skill-with-dashboard-saas-guidelines/`) to reflect the expanded scope.
- Validate the final markdown files with `python scripts/validate-skills.py`.

### Out of Scope

- No changes to runtime CLI or dashboard code.
- No modifications to other core skills.
- No implementation of actual UI components, HTML, CSS, or JavaScript.

## Constraints

- **Compatibility:** All markdown files must pass `validate-skills.py`.
- **Aesthetic Pillars Consistency:** Maintain the existing skill structure; enrich sections rather than replacing them.
- **Engineering Handoff:** Every new requirement must still be implementable from text/ASCII specs (no Figma files, no generated images).
- **Bundle Lock-In:** Changes must stay within the 18-skill CrewLoop bundle and follow the hub-and-spoke workflow.

## Success Criteria

- After the change, a designer execution should produce a spec that includes: brand narrative, case-study structure, real states, design-token table, contextual mockup descriptions, and granular motion specs.
- `python scripts/validate-skills.py` passes without errors.
- The skill remains loadable and readable by compatible agents.
