# spec-041-record-mode-fixtures

---
name: spec-041-record-mode-fixtures
domain: 04-workflow
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Reproducible Execution-Record Benchmark Fixtures

## Objective

Make the provider-neutral record mode of the local token benchmark reproducible from checked-in, sanitized six-scenario fixtures and prove that it reaches the same quality gates as the existing dataset-file mode.

## Context

- Spec 037 projects validated `TaskExecutionRecord` values into the existing benchmark-run contract.
- Spec 038 collects complete execution records into a benchmark dataset and fails closed on unavailable measurements.
- Spec 039 adds paired `--baseline-records` and `--candidate-records` input to the benchmark CLI.
- Spec 040 defines the task-boundary handoff that produces one sanitized record without raw task or provider data.
- The CLI currently proves record mode with temporary test data, but the repository has no checked-in record-mode input that an operator can run directly.

## Requirements

1. Add checked-in baseline and candidate record containers covering the canonical six benchmark scenarios with complete measured values and distinct policy versions.
2. Keep fixtures deterministic, provider-neutral, and sanitized; they must contain only the existing record/container fields and no prompts, responses, commands, paths, credentials, transcript content, or session identifiers.
3. Extend the CLI test to execute record mode from the checked-in fixtures and assert the adoption recommendation, token delta, measured coverage, and output cleanliness.
4. Document the exact repository-root command for the checked-in record-mode fixtures and retain the existing negative-path and dataset-mode instructions.
5. Do not change benchmark comparison semantics, acceptance gates, schemas, runtime policy activation, or Git ownership.

## Behavior / Flow

1. An operator runs the documented record-mode command from the repository root.
2. The CLI reads both checked-in containers, validates every `TaskExecutionRecord`, collects the six scenarios, and compares them through the existing benchmark gate.
3. A successful run reports `adopt_candidate`, 100% measured coverage, and the expected token reduction without emitting raw fixture data.
4. The existing malformed/incomplete and quality-failure paths remain unchanged.

## Constraints

- Use the existing `TaskExecutionRecord` and execution-dataset schemas; do not create a fixture-only schema.
- Use synthetic, bounded identifiers and measurements only; do not imply provider-specific production metrics.
- Do not add credentials, session IDs, prompts, responses, paths, commands, raw payloads, or comments containing hidden task content.
- Do not infer or transform measurements in the CLI test; the fixture values must already be verified-style numeric facts.
- Do not activate or persist the candidate policy from the benchmark recommendation.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Baseline and candidate fixture paths are swapped | Existing variant/policy validation or comparison must fail; no adoption is claimed. |
| One fixture omits a canonical scenario | Existing fixed-corpus validation fails closed with no partial comparison. |
| One record has unavailable token, duration, or tool-call measurement | Existing collector reports its bounded index/reason and emits no partial dataset. |
| Fixture contains a forbidden raw-data key | Test or review rejects it before it becomes benchmark input. |
| CLI is run with only one record-mode file | Existing usage error remains deterministic and non-zero. |
| Candidate reduces tokens but regresses quality | Existing `keep_baseline` path remains the result. |

## Acceptance Criteria

- AC-01: Given the checked-in record fixtures, when the documented CLI command runs, then it exits `0`, reports `adopt_candidate`, reports 100% measured coverage, and reports the expected 25% total-token reduction.
- AC-02: Given either checked-in fixture, when its JSON is inspected, then it contains exactly the existing container/record data needed by the collector, all six canonical scenarios, measured token/duration/tool-call values, and no forbidden raw-data fields.
- AC-03: Given the CLI test suite, when it runs against the checked-in fixtures, then the record-mode path is covered without replacing the temporary malformed-input, missing-pair, quality-failure, or dataset-mode cases.
- AC-04: Given the repository documentation, when an operator follows the record-mode section, then the command resolves the checked-in fixture paths from the repository root and retains recommendation-only wording.
- AC-05: Given the existing dashboard suite, typecheck, build, skill validation, and fixed benchmark, when they run after this change, then all existing gates remain green.

## Done When

- [x] AC-01 - proven by the repository-root record-mode benchmark command.
- [x] AC-02 - proven by fixture/schema/privacy assertions in the CLI test.
- [x] AC-03 - proven by the complete benchmark CLI test suite.
- [x] AC-04 - proven by documentation inspection and the same successful CLI command.
- [x] AC-05 - proven by dashboard tests, typecheck, build, skill validation, workflow tests, and the fixed benchmark command.
