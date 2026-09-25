# spec-045-preflight-cli-contract

---
name: spec-045-preflight-cli-contract
domain: 02-dashboard
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Browser Preflight CLI Contract

## Objective

Add a fast, browser-free regression contract for the dashboard acceptance preflight entrypoint so its help text and fail-closed argument validation remain stable in the normal test command.

## Context

- Specs 043 and 044 added the opt-in interaction smoke and focus-containment checks.
- The preflight is a package-local Node entrypoint with user-facing flags and non-zero setup failures.
- Browser acceptance remains covered separately by the isolated Chrome CDP runs.

## Requirements

1. Test the actual preflight entrypoint through the current Node runtime without connecting to Chrome.
2. Verify `--help` exits successfully and documents `--interaction-smoke`.
3. Verify an unknown option exits non-zero and reports the bounded parser error.
4. Verify an invalid timeout exits non-zero and reports the timeout contract.
5. Include the tests in the dashboard package's `npm test` command without changing existing server/UI test behavior.

## Behavior / Flow

1. The test spawns the package preflight script with a controlled working directory.
2. Help is treated as a successful CLI contract.
3. Invalid arguments are treated as expected fail-closed contracts; no browser endpoint is required.
4. Existing server and UI suites run before the new browser-free contract.

## Constraints

- Use Node's built-in test and child-process modules; add no dependency.
- Assert bounded output fragments only; do not print environment paths or browser payloads.
- Do not weaken the preflight's non-zero failure behavior.
- Keep browser interaction and manual accessibility validation separate.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Help is invoked without Chrome | Exit `0` and print the complete usage contract. |
| Unknown option is supplied | Exit non-zero with a named parser error. |
| Timeout is below the minimum | Exit non-zero with the bounded timeout error. |
| Browser is unavailable during these tests | No browser connection is attempted. |

## Acceptance Criteria

- AC-01: Given the preflight entrypoint, when `--help` runs, then it exits `0` and includes `--interaction-smoke`.
- AC-02: Given an unknown option, when the entrypoint runs, then it exits non-zero and reports `Unknown option`.
- AC-03: Given an invalid timeout, when the entrypoint runs, then it exits non-zero and reports the minimum-timeout contract.
- AC-04: Given the dashboard package test command, when it runs, then the new contract executes alongside the existing server and UI suites.
- AC-05: Given the repository quality gates, when they run after this change, then typecheck/build, tests, skill validation, and browser preflight behavior remain green.

## Done When

- [x] AC-01 - proven by the browser-free CLI contract test: help exits `0` and includes `--interaction-smoke`.
- [x] AC-02 - proven by the browser-free CLI contract test: unknown options exit non-zero with `Unknown option`.
- [x] AC-03 - proven by the browser-free CLI contract test: timeout `99` exits non-zero with the minimum-timeout message.
- [x] AC-04 - proven by `npm test`, which now runs the server, UI, and three CLI contract tests.
- [x] AC-05 - proven by dashboard typecheck, production build, 351 server tests, 89 UI tests, 3 CLI contract tests, skill validation, workflow tests, syntax checks, and both browser preflight modes.

## Verification Evidence

- Browser-free preflight contract: `3/3` tests passed without connecting to Chrome.
- Default browser preflight: `112/112` combinations passed.
- Interaction browser preflight: `7/7` cases passed with `interactionSuccess: true`.
- Manual visual, contrast, keyboard walkthrough, and screen-reader acceptance remains separate.
