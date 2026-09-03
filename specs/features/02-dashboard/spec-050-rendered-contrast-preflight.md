---
name: spec-050-rendered-contrast-preflight
domain: 02-dashboard
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Rendered Contrast Preflight

## Objective

Extend the opt-in dashboard browser smoke with a bounded audit of the contrast actually rendered by the browser, complementing the source-CSS semantic-token guard from Spec 049.

## Context

- Spec 031 keeps visual contrast as part of the dashboard acceptance boundary.
- Spec 049 protects semantic token values in the checked-in stylesheet, but a component rule can still override a token or place text over a different surface.
- The existing CDP preflight already has an isolated target, route matrix, theme emulation, and structured interaction results.

## Requirements

1. Add one bounded interaction case that inspects visible, non-disabled text in each dashboard route under explicit light and dark themes.
2. Resolve the effective foreground and nearest composited background from browser computed styles; fail closed for an actual normal-text ratio below 4.5:1.
3. Keep the audit local, dependency-free, bounded, and free of raw page content, session data, or provider payloads in its result.
4. Preserve the default 112-combination preflight and existing interaction cases; the new audit remains opt-in behind `--interaction-smoke`.
5. Keep the automated rendered-style checkpoint separate from the manual visual, keyboard, and screen-reader acceptance matrix.

## Acceptance Criteria

- AC-01: The interaction smoke reports a named rendered-contrast case for all seven routes in both light and dark themes.
- AC-02: The audit evaluates effective computed colors, composited ancestor backgrounds, visibility, and normal-text contrast without adding a dependency.
- AC-03: A contrast failure returns a bounded route/theme/selector diagnostic and makes the combined preflight exit non-zero.
- AC-04: The default preflight output and existing interaction invariants remain unchanged when `--interaction-smoke` is absent.
- AC-05: Dashboard typecheck, build, tests, browser preflight, and documentation stay green; manual acceptance remains explicitly pending.

## Done When

- [x] AC-01 - proven by the `rendered text contrast` result across 14 route/theme pairs
- [x] AC-02 - proven by computed-style sampling of 574 visible text elements with 0 unsupported styles
- [x] AC-03 - proven by the bounded route/theme diagnostic and non-zero combined preflight result on failure
- [x] AC-04 - proven by the unchanged default `112/112` matrix and browser-free CLI contract tests
- [x] AC-05 - proven by the dashboard gates and updated acceptance documentation

## Verification Evidence

- `npm run test:preflight` - passed: 4 contract tests.
- Focused semantic token test - passed: 2 tests.
- Production build - passed after the browser audit exposed and corrected the light `--text-muted` rounding boundary.
- Combined Chrome/CDP preflight - passed: `112/112` matrix combinations and `8/8` interaction cases, including `14` explicit light/dark route audits, `574` text candidates, and `0` unsupported styles.
- The manual visual, keyboard, and screen-reader matrix remains a separate acceptance gate documented by Specs 031/032.
