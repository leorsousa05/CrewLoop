# spec-043-browser-interaction-smoke

---
name: spec-043-browser-interaction-smoke
domain: 02-dashboard
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Browser Interaction Smoke Checks

## Objective

Extend the existing Chrome CDP acceptance preflight with a bounded interaction smoke suite so repeatable keyboard, overlay, navigation, settings, and resource checks are automated before the remaining manual dashboard walkthrough.

## Context

- Spec 031 defines responsive and accessible dashboard interactions, including mobile navigation, focus restoration, overlays, Settings, and reduced motion.
- Spec 032 records the manual acceptance matrix and deliberately separates human visual/screen-reader checks from automated evidence.
- Spec 036 provides the package-local CDP preflight for seven routes across 112 viewport/theme/density combinations.
- The current preflight verifies rendered content, overflow, DOM names, and AX names but does not exercise the most important state transitions.

## Requirements

1. Add an opt-in `--interaction-smoke` mode to the existing preflight without changing the default 112-combination behavior.
2. Verify deterministic mobile drawer open/close with Escape and focus restoration to its trigger.
3. Verify command palette and mobile filter sheet open, expose their expected dialog/control, close with Escape, and restore focus.
4. Verify the session selector remains keyboard-addressable and exposes either its bounded empty state or session options in a listbox when opened.
5. Verify Settings persists a reduced-motion toggle and applies the root reduced-motion state, then restore the original setting.
6. Verify hash navigation history returns to the prior route and loaded resources contain no external font request.
7. Emit a structured interaction summary and fail non-zero on an unmet interaction invariant; keep manual visual, contrast, and screen-reader checks explicitly separate.

## Behavior / Flow

1. The default command runs only the existing matrix and remains backward-compatible.
2. With `--interaction-smoke`, the preflight runs the existing matrix, then navigates an isolated target through the bounded interaction cases.
3. Each case returns a named pass/fail result with no task content, session identifiers, or raw browser payloads.
4. The process returns `0` only when both the matrix and every requested interaction case pass.
5. With `--summary`, the interaction result is nested in the single final summary object instead of emitting an additional line.

## Constraints

- Reuse the existing CDP client, target, dashboard URL, and timeout controls; add no browser automation dependency.
- Keep checks deterministic and local-only; do not require real sessions, external resources, credentials, or network services.
- Do not modify product behavior solely to satisfy the preflight.
- Do not mark the manual view/interaction matrix complete from automated results.
- Do not capture screenshots, page contents, prompts, event payloads, or arbitrary browser network bodies.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Default preflight runs without the flag | Preserve the existing 112-result output and exit behavior. |
| Mobile drawer trigger is unavailable | Fail the interaction suite with a named invariant; do not continue silently. |
| Overlay opens without focusable content | Fail focus/role checks and return non-zero. |
| Settings toggle cannot be restored | Fail the smoke suite and report the named state, not raw page content. |
| Browser history is unavailable | Fail the history case; do not infer navigation from the current page alone. |
| External font request appears | Fail closed with the resource origin/type only. |
| Manual assistive-technology or visual behavior is not observable through CDP | Leave the manual matrix pending and state the limitation. |

## Acceptance Criteria

- AC-01: Given the preflight without `--interaction-smoke`, when it runs against the dashboard, then the existing 112-combination summary remains unchanged.
- AC-02: Given the interaction flag and a mobile viewport, when the drawer, command palette, and filter sheet are exercised, then each opens with the expected role, closes with Escape, and restores focus to its trigger.
- AC-03: Given the interaction flag, when the session selector and Settings reduced-motion toggle are exercised, then keyboard opening exposes a valid empty state or options listbox, the root state changes and persists, and the original setting is restored.
- AC-04: Given the interaction flag, when route history and loaded resources are checked, then the prior hash route is restored and no external font resource is present.
- AC-05: Given a failed interaction invariant, when the command exits, then it emits a named failure and returns non-zero without claiming manual acceptance.
- AC-06: Given the existing dashboard tests/build and browser preflight, when they run after this change, then all existing checks remain green and the interaction smoke passes in an isolated local browser.

## Done When

- [x] AC-01 - proven by the default preflight summary: `112/112`, `passed: 112`, `failed: 0`, `success: true`.
- [x] AC-02 - proven by the interaction summary: drawer, command palette, and filter sheet all passed focus restoration with real CDP Escape events.
- [x] AC-03 - proven by keyboard-opening the session selector (`state: empty`, `optionCount: 0` on a clean server) and passing reduced-motion persistence/restoration.
- [x] AC-04 - proven by hash history restoration to `#/overview` and zero external font resources.
- [x] AC-05 - proven by named per-case results, bounded invariant errors, and non-zero exit behavior when the interaction suite fails.
- [x] AC-06 - proven by dashboard typecheck, production build, 351 server tests, 89 UI tests, skill validation, workflow tests, syntax checks, and both preflight modes.

## Verification Evidence

- Default preflight: `112/112` passed with the legacy summary shape.
- Interaction preflight on a clean local dashboard: `7/7` interaction cases passed, including `state: "empty"` for the session selector; the combined result was `112/112` plus `interactionSuccess: true`.
- Interaction preflight on a dashboard with an active session: `7/7` passed, confirming the selector check does not depend on an empty server in normal operation.
- Manual visual, contrast, and screen-reader acceptance remains separate and is not closed by this automated checkpoint.
