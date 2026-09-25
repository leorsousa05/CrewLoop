---
name: spec-034-mobile-empty-state-wrapping
domain: 02-dashboard
status: completed
created: 2026-09-02
completed: 2026-09-03
supersedes: []
---

# Mobile Empty-State Wrapping

## Objective

Keep the Overview empty-state guidance readable at narrow mobile widths without changing the dashboard's layout or content.

## Context

The dashboard acceptance preflight rendered the empty Overview state at 390px and showed the guidance paragraph extending beyond the useful content width. The application shell clips overflow, so the document-level scroll width does not expose the visual truncation. This is a regression found while executing the Spec 032 responsive acceptance work.

## Requirements

1. The empty-state paragraph must use the available content width while retaining its existing maximum width and centered alignment.
2. The existing copy, typography, spacing, and desktop layout must remain unchanged.
3. A UI regression test must prove that the empty-state markup preserves the wrapping contract.
4. The mobile preflight must be rerun at 390px in light and dark themes after the fix.

## Behavior / Flow

1. When Overview has no sessions, render the existing icon, heading, and guidance paragraph.
2. At narrow widths, the paragraph wraps inside the padded content area instead of sizing to an overflowing max-content width.
3. At desktop widths, the paragraph remains centered and capped by the existing `max-w-sm` constraint.

## Constraints

- This is a targeted responsive bugfix; do not add a new component, dependency, breakpoint, or product feature.
- Do not change the empty-state wording or the surrounding shell overflow policy.
- Do not alter the token-optimization contracts or dashboard data behavior.
- No manual git operations are part of this implementation.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Empty Overview at 320–390px | Paragraph width is bounded by the parent content width and wraps without visual clipping. |
| Empty Overview at 768px and above | Existing centered `max-w-sm` presentation is retained. |
| Overview with one or more sessions | Existing dashboard grid is unaffected; the empty-state-only rule is not applied elsewhere. |
| Invalid or missing session data | The existing session-store behavior remains unchanged; this fix only changes the empty-state paragraph class. |

## Acceptance Criteria

- AC-01: Given an empty Overview, when the component renders, then the guidance paragraph has a full-width constraint together with its existing maximum-width constraint and centered text.
- AC-02: Given the Overview UI regression suite, when `npm run test:ui` runs, then the empty-state wrapping test passes.
- AC-03: Given the dashboard build, when `npm run typecheck` and `npm run build` run, then both commands exit successfully.
- AC-04: Given the dashboard at 390px, when the empty Overview is rendered in light and dark themes, then the guidance copy remains inside the visible viewport with no horizontal clipping.

## Done When

- [x] AC-01 — proven by the Overview component regression test.
- [x] AC-02 — proven by the UI test command.
- [x] AC-03 — proven by typecheck and production build output.
- [x] AC-04 — proven by the post-fix Chrome mobile preflight and visual screenshot check.
