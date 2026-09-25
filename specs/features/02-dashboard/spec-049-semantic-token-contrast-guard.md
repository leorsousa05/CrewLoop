---
name: spec-049-semantic-token-contrast-guard
domain: 02-dashboard
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Semantic Token Contrast Guard

## Objective

Bring the dashboard's semantic text colors and primary-button label into WCAG AA contrast in both themes, then guard the real CSS token values against regressions.

## Context

- Spec 031 requires body content and interactive text to meet WCAG AA in both themes.
- The existing acceptance record measured only primary/secondary text against the base background.
- Token calculations show additional failures on elevated/inset surfaces and in the fixed primary-button foreground.

## Requirements

1. Keep normal-text foreground tokens at or above a 4.5:1 contrast ratio against the dashboard's base, surface, elevated, and inset backgrounds in both themes.
2. Make `.btn-primary` use a theme-aware foreground that reaches the same threshold against `--accent` in both themes.
3. Preserve the existing semantic token names, layout, status cues, and visual identity.
4. Add a dependency-free test that parses the checked-in stylesheet, calculates WCAG relative luminance, and fails if the token contract regresses.
5. Keep the manual visual and screen-reader acceptance gate separate from the automated token guard.

## Acceptance Criteria

- AC-01: Dark-theme primary, secondary, muted, accent, success, error, warning, and running text tokens meet 4.5:1 against every declared dark surface.
- AC-02: Light-theme primary, secondary, muted, accent, success, error, warning, and running text tokens meet 4.5:1 against every declared light surface.
- AC-03: Primary-button foreground and accent background meet 4.5:1 in both themes.
- AC-04: The stylesheet guard reads the source CSS and passes with no new dependency or runtime artifact.
- AC-05: Existing dashboard behavior and manual acceptance boundaries remain unchanged.

## Done When

- [x] AC-01 — proven by `src/styles/accessibility-tokens.test.ts` (`2/2`)
- [x] AC-02 — proven by `src/styles/accessibility-tokens.test.ts` (`2/2`)
- [x] AC-03 — proven by the button-pair assertion in `src/styles/accessibility-tokens.test.ts`
- [x] AC-04 — proven by the source-CSS test, typecheck, production build, and diff review
- [x] AC-05 — proven by the dashboard regression suite and the preserved manual-gate boundary

## Verification Evidence

- `npm run typecheck` — passed.
- `npm run build` — passed, including the production UI bundle.
- `npm test` — passed: 351 server tests, 92 UI tests, and 3 preflight contract tests.
- Focused guard — passed: 2 tests; it parses the checked-in stylesheet and verifies all eight semantic text tokens against base/surface/elevated/inset backgrounds in both themes, plus the primary button pair.
- The full visual, keyboard, and screen-reader matrix remains a separate manual acceptance gate documented by Specs 031/032.
