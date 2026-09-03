# spec-042-record-mode-ci-gate

---
name: spec-042-record-mode-ci-gate
domain: 04-workflow
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Continuous Record-Mode Benchmark Gate

## Objective

Run the checked-in execution-record benchmark in the existing validation workflow so the provider-neutral token-optimization evidence is verified automatically alongside the original dataset benchmark.

## Context

- Spec 021 added the fixed dataset-mode token benchmark to `.github/workflows/validate.yml`.
- Spec 041 added sanitized baseline/candidate execution-record fixtures and a reproducible local command.
- The CLI already returns non-zero for invalid input, quality regressions, or `keep_baseline`; CI can reuse that exit contract without parsing report output.

## Requirements

1. Add one required CI step after the existing workspace build/tests and dataset-mode benchmark that invokes record mode with both checked-in fixture paths.
2. Use the existing `benchmark:tokens` CLI and its exit code as the only gate decision; do not parse or recreate metrics in YAML.
3. Keep the record-mode gate deterministic, recommendation-only, provider-neutral, and free of secrets or remote telemetry.
4. Extend workflow contract coverage to verify the step ordering, paired record options, checked-in fixture paths, and Markdown output.
5. Preserve the existing dataset benchmark, skill validator, permissions, dependency set, and all quality gates.

## Behavior / Flow

1. CI checks out the repository, installs the existing dependencies, builds workspaces, and runs the existing tests.
2. CI runs the existing dataset-mode benchmark.
3. CI runs the record-mode benchmark against `execution-baseline.json` and `execution-candidate.json`.
4. The CLI validates and compares the records through the existing quality gates; exit code `0` allows the job to continue, and any non-zero result fails validation.
5. No policy is activated, persisted, or changed by the workflow.

## Constraints

- Modify only the existing validation workflow and its contract tests for this increment.
- Do not add dependencies, secrets, permissions, network calls, generated outputs, or a second benchmark implementation.
- Do not weaken or replace the existing dataset-mode benchmark.
- Do not parse Markdown output or duplicate benchmark thresholds in shell/YAML.
- Do not activate a candidate policy from CI evidence.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Record fixture is missing or malformed | CLI exits non-zero and CI fails closed. |
| Only one record fixture is passed | CLI usage validation exits non-zero; no partial comparison occurs. |
| Candidate loses a quality gate | CLI returns `keep_baseline` with a failing exit code; CI blocks the change. |
| Dataset-mode step is removed or reordered | Workflow contract test rejects the missing or incorrectly ordered gate. |
| Workflow attempts to parse metrics | Contract review rejects duplicated decision logic outside the CLI. |

## Acceptance Criteria

- AC-01: Given the existing validation workflow, when its YAML is inspected, then a record-mode benchmark step appears after the dataset-mode benchmark and before skill validation.
- AC-02: Given valid checked-in execution-record fixtures, when the CI command runs, then it invokes paired `--baseline-records` and `--candidate-records` options with Markdown output and exits `0` with `adopt_candidate`.
- AC-03: Given a malformed, incomplete, or quality-failing record fixture, when the CLI returns non-zero, then the CI job fails without a fallback or synthetic comparison.
- AC-04: Given the workflow diff, when security and scope checks run, then no secret, permission, dependency, remote telemetry, generated artifact, policy activation, or duplicated benchmark logic is introduced.
- AC-05: Given the repository validation suite, when tests, build, skill validation, dataset benchmark, and record-mode benchmark run, then all existing gates remain active and deterministic.

## Done When

- [x] AC-01 - proven by workflow contract assertions for step ordering.
- [x] AC-02 - proven by the workflow command and successful record-mode benchmark execution.
- [x] AC-03 - proven by existing CLI fail-closed tests and preserved workflow exit-code behavior.
- [x] AC-04 - proven by diff review and repository security/scope scans.
- [x] AC-05 - proven by the complete dashboard suite, workspace build, skill validation, dataset benchmark, and record-mode benchmark.
