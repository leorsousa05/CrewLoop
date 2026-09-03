---
name: spec-035-settings-accessible-names
domain: 02-dashboard
status: completed
created: 2026-09-02
completed: 2026-09-03
supersedes: []
---

# Settings Accessible Names

## Objective

Expose stable accessible names for the Settings controls that currently render without a programmatically discoverable label.

## Context

The dashboard accessibility preflight found two icon-only Settings switches and the max-events number input without an accessible name. The controls remain visually understandable, but a screen reader cannot reliably identify their purpose.

## Requirements

1. The reduced-motion switch must expose a name that describes its action/state.
2. The auto-follow switch must expose a name that describes its action/state.
3. The max-events input must expose a name describing the setting it edits.
4. Existing visual layout, labels, values, persistence, and control behavior must remain unchanged.
5. A UI regression test must verify the accessible names.

## Behavior / Flow

1. Settings renders the existing Appearance and Behavior controls.
2. Assistive technology can identify each switch and the max-events field without relying on surrounding visual text.
3. Toggling or editing the controls continues to use the existing state handlers.

## Constraints

- This is an accessibility metadata fix; do not add dependencies, new UI, or new settings behavior.
- Preserve the existing 44px touch-target sizing and visual copy.
- Do not change dashboard telemetry, routing, or token-optimization contracts.
- No manual git operations are part of this implementation.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Reduced motion enabled or disabled | The accessible name reflects the corresponding enable/disable action. |
| Auto-follow enabled or disabled | The accessible name remains specific to auto-follow and reflects the corresponding action. |
| Max-events value at its minimum or maximum | The existing numeric constraints and clamping remain unchanged while the field retains its name. |
| Settings rendered with corrupted persisted values | Existing migration/default behavior remains unchanged. |

## Acceptance Criteria

- AC-01: Given Settings is rendered, when the reduced-motion switch is inspected, then it has a non-empty accessible name describing reduced motion.
- AC-02: Given Settings is rendered, when the auto-follow switch is inspected, then it has a non-empty accessible name describing auto-follow.
- AC-03: Given Settings is rendered, when the max-events input is inspected, then it has a non-empty accessible name describing max events per session.
- AC-04: Given the UI regression suite, when `npm run test:ui` runs, then the Settings accessible-name test passes.
- AC-05: Given the dashboard build, when `npm run typecheck` and `npm run build` run, then both commands exit successfully.
- AC-06: Given the accessibility preflight, when Settings is rendered with reduced motion enabled, then the previously unnamed-control count is zero and the contrast checks remain passing.

## Done When

- [x] AC-01 — proven by the Settings component accessibility test.
- [x] AC-02 — proven by the Settings component accessibility test.
- [x] AC-03 — proven by the Settings component accessibility test.
- [x] AC-04 — proven by `npm run test:ui` (22 files, 88 tests passed).
- [x] AC-05 — proven by successful `npm run typecheck` and `npm run build` output.
- [x] AC-06 — proven by the post-fix Chrome accessibility preflight: zero unnamed controls, reduced-motion toggle behavior, and passing contrast ratios.
