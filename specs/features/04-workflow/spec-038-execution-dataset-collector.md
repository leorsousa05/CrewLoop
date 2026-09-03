# spec-038-execution-dataset-collector

---
name: spec-038-execution-dataset-collector
domain: 04-workflow
status: active
created: 2026-09-03
completed: null
supersedes: []
---

# Execution Record Dataset Collector

## Objective

Build a validated token benchmark dataset from multiple host execution records while keeping incomplete telemetry explicit and non-adoptable.

## Context

- Spec 037 added the side-effect-free projection from one `TaskExecutionRecord` to one existing `TokenBenchmarkRun`.
- Benchmark comparison requires a dataset with complete, measured run inputs before it can recommend `adopt_candidate`.
- A caller must not silently drop a record with unavailable required measurements or replace it with zero.

## Requirements

1. Accept a bounded dataset label, policy identity, source, and a list of execution records.
2. Reuse the Spec 037 record projection and the existing benchmark dataset validator.
3. Return a ready dataset only when every supplied execution record can be projected to a benchmark run.
4. Return bounded record indexes and unavailable reasons when any required metric is missing; do not produce a partial ready dataset.
5. Preserve duplicate/conflict validation and policy/source/record errors without echoing raw input values.
6. Keep the collector deterministic, side-effect free, provider-neutral, and local-only.

## Behavior / Flow

1. The caller supplies records for one baseline or candidate dataset.
2. The collector projects each record and collects bounded unavailable entries.
3. If any entry is unavailable, it returns an incomplete result and no adoptable dataset.
4. If all entries are ready, it validates the assembled dataset through the existing validator and returns it.
5. The existing corpus comparator remains responsible for matching baseline/candidate coverage and quality gates.

## Constraints

- Do not change the `TaskExecutionRecord` or `TokenBenchmarkDataset` schemas.
- Do not infer missing token, duration, tool-call, or other execution values.
- Do not persist records, activate policies, or call provider APIs.
- Do not bypass the existing corpus, coverage, quality, or verification gates.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Empty record list | Return `no_records` and no dataset. |
| One record lacks required token telemetry | Return its bounded index and `token_usage_unavailable`. |
| Multiple records lack different metrics | Return all bounded unavailable entries in input order. |
| Identical duplicate records | Let the existing validator deduplicate them. |
| Conflicting duplicate records | Let the existing validator reject the dataset. |
| Invalid policy or label | Reject through the existing dataset validator without echoing unsafe values. |
| Unknown source | Reject with the bounded source error from the single-record bridge. |

## Acceptance Criteria

- AC-01: Complete records produce a deterministic validated `TokenBenchmarkDataset` with all projected runs preserved.
- AC-02: Any missing required measurement returns an incomplete result with bounded index/reason data and no dataset.
- AC-03: Empty inputs, invalid records, unknown sources, and conflicting duplicates remain fail-closed.
- AC-04: Existing benchmark comparison, dashboard tests, typecheck, and build remain green.

## Done When

- [x] AC-01 - proven by ready dataset tests for baseline/candidate records and deterministic output.
- [x] AC-02 - proven by single and multiple unavailable-record tests with no zero coercion.
- [x] AC-03 - proven by empty, invalid, source, and duplicate/conflict tests.
- [x] AC-04 - proven by the complete dashboard test suite and typecheck/build.
