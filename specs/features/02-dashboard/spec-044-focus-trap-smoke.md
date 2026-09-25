# spec-044-focus-trap-smoke

---
name: spec-044-focus-trap-smoke
domain: 02-dashboard
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Overlay Focus-Trap Smoke Checks

## Objective

Extend the opt-in dashboard interaction smoke with real CDP `Tab` and `Shift+Tab` checks so modal surfaces prove focus containment, not only opening and restoration.

## Context

- Spec 031 requires open dialogs and sheets to trap focus predictably.
- Spec 043 added the bounded `--interaction-smoke` runner and Escape/focus-restoration checks.
- The new checks must remain automated evidence and must not close the manual keyboard or screen-reader walkthrough.

## Requirements

1. Reuse the existing `--interaction-smoke` mode and preserve the default 112-combination preflight.
2. Exercise `Tab` and `Shift+Tab` with real CDP keyboard events while the mobile navigation drawer is open.
3. Exercise the same forward and reverse focus transitions in the command palette and mobile filter sheet.
4. Fail closed if focus leaves the active dialog/sheet, and include bounded case details without page content or session data.
5. Document that focus containment is automated evidence while the full manual keyboard walkthrough remains required.

## Behavior / Flow

1. Each existing overlay case opens its surface and verifies initial focus.
2. The case sends forward and reverse Tab events and verifies the active element remains inside the surface.
3. The case then sends Escape and verifies the existing focus-restoration invariant.
4. The combined command exits non-zero if any matrix or interaction invariant fails.

## Constraints

- Do not add a browser automation dependency or change product behavior solely for this check.
- Use only the existing isolated CDP target and bounded selectors/state.
- Do not capture screenshots, prompts, event payloads, identifiers, or arbitrary page text.
- Do not mark Specs 031/032 manual criteria complete from this automated evidence.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Focus leaves an open surface after `Tab` or `Shift+Tab` | Return a named failure and non-zero exit. |
| Surface has one focusable control | Both directions still must remain inside the surface. |
| Overlay is unavailable | Preserve the existing named open/focus failure. |
| Manual assistive technology behavior is not observable through CDP | Keep the manual matrix pending. |

## Acceptance Criteria

- AC-01: Given the default preflight, when it runs without the interaction flag, then the 112-result output remains unchanged.
- AC-02: Given the mobile navigation drawer, when real `Tab` and `Shift+Tab` events are sent while open, then focus remains inside the drawer.
- AC-03: Given the command palette and filter sheet, when real `Tab` and `Shift+Tab` events are sent while open, then focus remains inside each surface.
- AC-04: Given a focus-containment failure, when the interaction smoke exits, then it reports the named case and returns non-zero.
- AC-05: Given the dashboard validation gates, when they run after this change, then typecheck/build/tests and the isolated browser smoke remain green.

## Done When

- [x] AC-01 - proven by the default preflight summary: `112/112`, `passed: 112`, `failed: 0`, `success: true`.
- [x] AC-02 - proven by the drawer result with `focusContained: true` after real `Tab` and `Shift+Tab` events.
- [x] AC-03 - proven by command-palette and filter-sheet results with `focusContained: true` after real `Tab` and `Shift+Tab` events.
- [x] AC-04 - proven by named focus assertions inside the existing fail-closed interaction runner.
- [x] AC-05 - proven by dashboard typecheck, production build, 351 server tests, 89 UI tests, syntax checks, and the combined browser preflight.

## Verification Evidence

- Default preflight: `112/112` combinations passed with the legacy summary shape.
- Interaction preflight: `7/7` cases passed, with all three overlay cases reporting `focusContained: true`; the clean session selector reported `state: "empty"` and `optionCount: 0`.
- The full dashboard suite remained green after this change; manual keyboard, visual, contrast, and screen-reader acceptance remains separate.
