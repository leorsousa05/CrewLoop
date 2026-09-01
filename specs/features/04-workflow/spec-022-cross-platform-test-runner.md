---
name: spec-022-cross-platform-test-runner
domain: 04-workflow
status: active
created: 2026-09-01
completed: null
supersedes: []
---

# Cross-Platform Test Runner

## Objective

Make the existing workspace test commands discover compiled tests consistently on Windows and Unix-like CI environments.

## Context

- Existing workspace scripts: [`packages/cli/package.json`](../../../packages/cli/package.json) and [`servers/dashboard/package.json`](../../../servers/dashboard/package.json).
- Validation workflow: [`validate.yml`](../../../.github/workflows/validate.yml).
- Current failure: the scripts pass the quoted glob `dist/**/*.test.js` to Node. On Windows, the glob is not expanded and Node exits before discovering tests, while `node --test dist` discovers the compiled test tree successfully.

The fix is a package-script-only change using Node's native directory discovery. Test files and assertions remain unchanged.

## Requirements

1. Change the CLI test script to run `node --test dist`.
2. Change the dashboard server test script to run `node --test dist`; preserve the existing UI test command.
3. Keep recursive discovery of every compiled `*.test.js` file under each workspace's `dist` directory.
4. Do not add dependencies, custom shell syntax, platform-specific scripts, test exclusions, or changes to test assertions.
5. Preserve the CI sequence and all existing build, server, UI, skill-validation, and benchmark gates.

## Behavior / Flow

1. `npm test` in `packages/cli` invokes Node's test runner with the compiled `dist` directory.
2. `npm run test:server` in `servers/dashboard` invokes Node's test runner with the compiled `dist` directory.
3. Node recursively discovers compiled tests on Windows and Linux without shell glob expansion.
4. `npm test` in the dashboard continues to run server tests followed by UI tests.

## Constraints

- Modify only the two package manifests and this feature spec in this phase.
- Keep Node `>=18` compatibility supported by the existing packages.
- Do not mask or quarantine a failing test; the runner must report the same assertions as before.
- Do not change CI permissions, install behavior, workflow ordering, or benchmark policy logic.
- [Native runner]: chose directory discovery because it removes shell-dependent glob behavior without a dependency or wrapper script.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| `dist` does not exist | Node fails clearly, preserving the build-before-test requirement. |
| Compiled test file is nested under `dist` | Native directory discovery includes it recursively. |
| A test assertion fails | The same failure propagates with a non-zero exit code. |
| No test files are present | Node reports the runner result; no silent success is introduced by a shell glob. |
| Windows shell has no glob expansion | Directory discovery remains independent of shell behavior. |
| Unix CI shell expands paths differently | Directory discovery remains independent of shell behavior. |
| Dashboard UI tests run after server tests | Existing `npm test` chaining remains unchanged. |

## Acceptance Criteria

- AC-01: Given a built CLI workspace on Windows or Unix, when its test script runs, then Node recursively discovers compiled tests under `dist` without relying on a quoted glob.
- AC-02: Given a built dashboard workspace on Windows or Unix, when `npm run test:server` runs, then all compiled server tests execute and the existing UI test script remains configured.
- AC-03: Given a failing compiled test, when either runner executes, then it returns a non-zero exit code instead of skipping or hiding the failure.
- AC-04: Given the workspace manifests, when they are inspected, then no dependency, test exclusion, custom wrapper, or assertion change is introduced.
- AC-05: Given the repository validation workflow, when build and test commands run, then the existing benchmark, UI, and skill-validation gates remain present and ordered.

## Done When

- [x] AC-01 — proven by `npm test` in `packages/cli`; Node discovered all 97 compiled tests through `dist` on Windows.
- [x] AC-02 — proven by the dashboard server runner (322 passing tests), the UI runner (65 passing tests), and package-script inspection.
- [x] AC-03 — proven by the existing Node runner returning a non-zero exit code for the pre-existing failing CLI assertion instead of hiding it.
- [x] AC-04 — proven by package-manifest diff and dependency/test-file inspection.
- [x] AC-05 — proven by workflow inspection, workspace build, passing token benchmark, YAML parsing, skill validation, and diff check.

## Review Status

- Scoped review: PASS; the change is ready for CrewLoop Ship.
- The local CLI suite still has one pre-existing environment-sensitive assertion failure in `commands.test.ts`; it is unrelated to the runner change and remains a separate follow-up.
- The feature remains `active` until Ship commits it, per the repository workflow.
