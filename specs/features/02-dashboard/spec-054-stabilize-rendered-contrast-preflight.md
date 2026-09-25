---
name: spec-054-stabilize-rendered-contrast-preflight
status: completed
created: 2026-09-03
---

# Stabilize Rendered-Contrast Preflight

## Objective

Make the dashboard rendered-text contrast smoke deterministic on a cold page load by waiting for the browser's style and rendering readiness before collecting computed colors.

## Context

The dashboard's 112 route/viewport/theme/density checks can finish while the first interaction-smoke navigation is still settling its UI styles. A cold isolated run produced a transient contrast failure in `dark/overview`, while an immediate rerun passed the same 574 candidates. The acceptance command must not depend on browser cache warmth or an arbitrary race window.

## Requirements

1. Add a bounded readiness wait to the shared interaction-page preparation path before interaction assertions and rendered-style audits run.
2. The readiness wait must use browser-observable rendering/style readiness and remain bounded by the existing command timeout.
3. Preserve the rendered-contrast audit's fail-closed behavior for unsupported styles and ratios below 4.5:1.
4. Add a browser-free source contract test proving the readiness wait remains part of the preflight implementation.
5. Do not weaken any existing route, focus, accessibility, contrast, privacy, or manual-acceptance requirement.

## Behavior / Flow

1. Configure the target viewport, emulated color scheme, and persisted dashboard settings.
2. Navigate to the requested route and wait for `interactive` or `complete` as today.
3. Await browser font readiness when available and at least two animation frames so React-rendered styles are observable before the caller inspects the page.
4. Continue with the existing interaction or rendered-contrast assertion.
5. Reject on timeout or any failed invariant; do not convert an unavailable readiness signal into a successful contrast result.

## Constraints

- Keep the implementation package-local and dependency-free.
- Keep the default preflight summary and interaction result schema unchanged.
- Do not capture page text, prompts, responses, paths, credentials, provider payloads, or session identifiers.
- Do not replace the manual visual, keyboard, or screen-reader acceptance matrix.
- Git operations remain the responsibility of CrewLoop Ship.

## Edge Cases

| Case | Expected behavior |
|---|---|
| `document.fonts` is unavailable | Resolve the optional font-readiness branch and still require the animation-frame readiness signal. |
| The page never reaches an interactive/complete state | Preserve the existing bounded timeout failure. |
| A style remains below 4.5:1 after readiness | The rendered-contrast audit fails with its bounded diagnostic. |
| A page uses an unsupported background image/style | The audit remains fail-closed with `unsupportedCount`; readiness must not hide it. |

## Acceptance Criteria

- AC-01: Given a cold isolated dashboard target, when the interaction smoke prepares a route, then it waits for browser style/render readiness before running route interactions or contrast collection.
- AC-02: Given a cold or warm target, when the complete browser preflight runs, then all 112 route combinations and all 8 interaction cases pass without relying on a prior cached navigation.
- AC-03: Given a genuinely sub-AA or unsupported rendered text style, when contrast collection runs after readiness, then the command still exits non-zero with bounded failure evidence.
- AC-04: Given the implementation is checked without launching Chrome, when the package preflight tests run, then a source contract test verifies the bounded readiness logic remains present.

## Done When

- [x] AC-01 — proven by the shared preparation implementation and source contract test for `document.fonts.ready` and two animation frames.
- [x] AC-02 — proven by a fresh isolated Chrome profile with `112/112` route combinations and `8/8` interaction cases.
- [x] AC-03 — preserved by the existing rendered-contrast fail-closed implementation and its `4.5`/`unsupportedCount` contract assertions.
- [x] AC-04 — proven by the complete dashboard suite's `5/5` preflight contract tests.

## Verification

- `npm run build` — passed.
- `npm test` — passed: 354 server tests, 92 UI tests, and 5 preflight contract tests.
- Fresh isolated browser: `112/112` combinations and `8/8` interactions, with 574 rendered-text candidates and 0 unsupported styles.
