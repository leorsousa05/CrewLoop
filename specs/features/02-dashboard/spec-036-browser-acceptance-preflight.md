# spec-036-browser-acceptance-preflight

---
name: spec-036-browser-acceptance-preflight
domain: 02-dashboard
status: completed
created: 2026-09-02
completed: 2026-09-03
supersedes: []
---

# Reproducible Dashboard Browser Acceptance Preflight

## Objective

Provide a package-local browser preflight that reproduces the automated portion of the dashboard acceptance matrix without depending on shell-specific globbing or a browser automation framework.

## Context

- `tests/dashboard-acceptance-matrix.md` records 112 view, viewport, theme, and density combinations.
- The dashboard already has a production server and a local-only operating model.
- The current evidence was collected through Chrome DevTools Protocol (CDP), but the procedure is not yet a repeatable repository command.
- A preflight cannot replace a manual screen-reader walkthrough or human visual inspection.

## Requirements

1. Add a Node-based command under `servers/dashboard/` that connects to an already-running Chrome CDP endpoint and dashboard URL.
2. Cover all seven dashboard views at desktop and mobile widths, light/dark/system-light/system-dark media states, and comfortable/compact density.
3. For each combination, verify that the view renders, the document has no horizontal overflow, and every visible interactive element has a non-empty accessible name.
4. Print stable machine-readable summary output and exit non-zero on an unavailable endpoint, navigation failure, or failed combination.
5. Never launch Chrome, expose the dashboard beyond localhost, or change production application code/configuration.
6. Keep manual screen-reader, keyboard, contrast, async-state, and visual checks separate in the acceptance matrix.

## Behavior / Flow

1. The command accepts the dashboard URL and CDP endpoint through flags or documented defaults.
2. It creates an isolated CDP target, applies viewport and emulated color-scheme settings, writes the test density/theme to local storage, and navigates to one view.
3. It evaluates the rendered document for the required invariants and records one result per combination.
4. It closes the isolated target, prints pass/fail counts and failed combinations, and returns a failing exit code if any result failed.

## Constraints

- Use only dependencies already available to the dashboard package.
- Keep the script cross-platform; do not rely on Bash, PowerShell, or shell glob syntax.
- Use a test-only isolated browser target so the operator's existing tab is not navigated.
- Do not infer screen-reader support from the accessibility tree alone.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Chrome is not listening on the CDP endpoint | Print setup guidance and exit non-zero before changing the dashboard. |
| The dashboard URL is unreachable | Report the affected setup step and exit non-zero. |
| A route has no session data | Treat the documented empty state as valid when it remains inside the viewport. |
| A system theme is requested | Set the browser media preference while the app theme remains `system`. |
| A visible control has only an icon | Fail the combination and report the element selector/role where possible. |

## Acceptance Criteria

- AC-01: The package exposes a documented `acceptance:browser` command with URL/CDP options.
- AC-02: A successful run evaluates exactly 112 combinations and reports a stable summary.
- AC-03: Missing CDP, navigation failure, overflow, render failure, or unnamed visible controls produce a non-zero exit code.
- AC-04: The command uses an isolated target and leaves the caller's browser tabs untouched.
- AC-05: The tests guide explains that the preflight is automated evidence and does not close the manual acceptance gate.

## Done When

- [x] AC-01 — proven by `npm run acceptance:browser -- --help`, the package script, and the tests/dashboard README command examples.
- [x] AC-02 — proven by a live run against the local dashboard: `total: 112`, `expected: 112`, `passed: 112`, `failed: 0`.
- [x] AC-03 — proven by the missing-CDP probe returning exit code `1` and the first live run failing closed on the unnamed filter input before the correction.
- [x] AC-04 — proven by the isolated `Target.createTarget`/`Target.closeTarget` lifecycle and a live page-tab probe with `1` tab before and `1` after.
- [x] AC-05 — proven by the tests guide, dashboard README, and acceptance matrix language that keeps manual screen-reader and visual checks pending.
