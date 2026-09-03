# spec-039-execution-record-benchmark-cli

---
name: spec-039-execution-record-benchmark-cli
domain: 04-workflow
status: active
created: 2026-09-03
completed: null
supersedes: []
---

# Execution Record Benchmark CLI Input

## Objective

Allow the existing local token benchmark CLI to compare validated host execution-record collections without requiring callers to pre-build `TokenBenchmarkDataset` JSON.

## Context

- Spec 037 provides a provider-neutral projection from one `TaskExecutionRecord` to one benchmark run.
- Spec 038 collects complete execution records into a validated benchmark dataset and reports unavailable measurements without partial output.
- The benchmark CLI currently accepts only already assembled dataset files, so the execution-record bridge is not usable from the reproducible command-line workflow.

## Requirements

1. Preserve the existing `--baseline` and `--candidate` dataset-file mode unchanged.
2. Add paired `--baseline-records` and `--candidate-records` options for files shaped as `{ label, policy, source, records }`.
3. Route record-file inputs through `buildTokenBenchmarkDatasetFromExecutionRecords` and the existing corpus comparator; do not create a second comparison path.
4. Require the two record-file options together and reject mixing record-file mode with dataset-file mode.
5. Convert unavailable record measurements into bounded CLI errors containing only indexes and reason codes; never emit a partial dataset or synthetic zero.
6. Keep output formats, exit codes, local-only behavior, recommendation-only adoption, and existing dataset mode unchanged.

## Behavior / Flow

1. Parse either the existing dataset pair or the new execution-record pair.
2. In record mode, parse each JSON input, validate the container shape, and collect its records with the Spec 038 collector.
3. If collection is unavailable, fail with exit code 2 and bounded index/reason details.
4. If both collections are ready, compare them through `compareTokenOptimizationBenchmarks`.
5. Emit the same JSON or Markdown comparison report and return 0 for `adopt_candidate`, 1 for `keep_baseline`, and 2 for invalid input.

## Constraints

- Do not change benchmark schemas, execution-record schemas, thresholds, provider adapters, persistence, or policy activation.
- Do not accept a partial record collection or infer missing measurements.
- Do not echo record contents, credentials, paths, or unsafe policy values in bounded validation errors.
- Do not add dependencies or remote calls.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Existing dataset pair | Continue through the current loader and comparator. |
| Only one record-file option | Return the usage error with exit code 2. |
| Dataset and record options mixed | Reject the ambiguous mode with exit code 2. |
| Malformed record container | Reject with a bounded container error. |
| Missing required measurement | Return bounded indexes and reason codes; do not compare. |
| Unknown source or invalid record | Preserve the existing bounded bridge/validator error. |
| Fixed corpus or quality failure | Return the existing `keep_baseline` report and exit code 1. |
| Passing comparison | Return the existing `adopt_candidate` recommendation only. |

## Acceptance Criteria

- AC-01: Existing dataset-file invocations produce the same comparison result and exit behavior.
- AC-02: Valid paired execution-record files produce the same adoption report as their equivalent assembled datasets.
- AC-03: Incomplete records, malformed containers, missing option pairs, and mixed modes fail closed with bounded errors and no comparison output.
- AC-04: Record mode preserves the existing corpus, quality, output-format, recommendation-only, and exit-code contracts.
- AC-05: Dashboard benchmark tests, typecheck, build, and the fixed benchmark command remain green.

## Done When

- [x] AC-01 - proven by legacy dataset-mode CLI regression tests.
- [x] AC-02 - proven by a passing record-mode CLI test with a six-scenario corpus.
- [x] AC-03 - proven by incomplete-record, malformed-input, and option-shape tests.
- [x] AC-04 - proven by JSON/Markdown, quality-failure, and recommendation-only regression tests.
- [x] AC-05 - proven by the complete dashboard test suite and typecheck/build.
