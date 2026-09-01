---
name: spec-023-cli-doctor-test-isolation
domain: 01-cli
status: active
created: 2026-09-01
completed: null
supersedes: []
---

# CLI Doctor Test Isolation

## Objective

Make the CLI doctor's output-routing test deterministic across developer machines and CI environments by injecting its home-directory dependency during tests without changing the default command behavior.

## Context

- The CLI doctor command inspects agent hook configuration under the current operating system home directory.
- `packages/cli/src/tests/commands.test.ts` creates an isolated temporary home for the doctor test, but `runDoctorCommand` cannot receive it, so an installed host hook can change the expected warning into an `ok` result.
- Related runner fix: [`spec-022-cross-platform-test-runner.md`](../04-workflow/spec-022-cross-platform-test-runner.md).

## Requirements

1. Allow `runDoctorCommand` callers to provide an optional home directory used for doctor checks.
2. Preserve the existing operating-system home-directory behavior when no home directory is provided.
3. Update the affected test to pass its temporary home directory and assert the same error/warning stream routing.
4. Do not alter doctor severity rules, hook detection, CLI arguments, output labels, or unrelated tests.

## Behavior / Flow

1. The production CLI invokes `runDoctorCommand` without an override and continues using the process home directory.
2. The isolated test invokes `runDoctorCommand` with a temporary home directory containing no hook configuration.
3. Package-root failure remains on stderr, while missing hook configuration remains a warning on stdout.
4. The CLI test suite completes without depending on the developer's installed hooks.

## Constraints

- Modify only the doctor command, its affected test, and this feature spec.
- Keep the public command syntax and default runtime behavior unchanged.
- Do not read or write the real user home directory from the test.
- Do not weaken assertions or skip the affected test.
- [Injection shape]: chose one optional home-directory override because it is the smallest dependency seam required for deterministic coverage; revisit only if additional doctor dependencies need isolation.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| No override is supplied | Doctor resolves the platform home directory as before. |
| Override points to an empty temporary home | Supported hook agents produce warnings, with no host configuration leakage. |
| Package root cannot be resolved | Existing error checks remain on stderr and the command returns exit code 1. |
| A hook config exists in the isolated home | Existing hook detection reports its actual status. |
| Windows or Unix path format | The injected path is passed through existing path resolution. |

## Acceptance Criteria

- AC-01: Given no home override, when the production CLI runs `doctor`, then it preserves the existing operating-system home-directory behavior.
- AC-02: Given an empty temporary home, when the isolated doctor command test runs, then hook findings are warnings on stdout and package-root errors are on stderr.
- AC-03: Given the CLI test suite, when it runs after the change, then all compiled CLI tests pass without depending on host hook configuration.
- AC-04: Given the pending diff, when it is reviewed, then only the doctor command, its affected test, and this spec change; no assertion is weakened or test skipped.

## Done When

- [x] AC-01 — proven by the unchanged production call path and the focused doctor tests.
- [x] AC-02 — proven by the isolated temporary-home test.
- [x] AC-03 — proven by `npm test` in `packages/cli` with 97 passing tests.
- [x] AC-04 — proven by changed-file, security, and test-scope review.

## Review Status

- Scoped review: PASS; the change is ready for CrewLoop Ship.
- The production CLI call path remains unchanged and continues to use the operating-system home directory by default.
- The feature remains `active` until Ship commits it, per the repository workflow.
