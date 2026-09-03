---
name: spec-055-benchmark-scenario-regression-report
domain: 04-workflow
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Benchmark Scenario Regression Report

## Objective

Expose per-scenario token, duration, success, and cost comparisons in the existing
continuous-optimization result and Markdown report so aggregate medians cannot hide
a regression in one fixed-corpus task.

## Context

- Roadmap: [`ROADMPA.md`](../../../ROADMPA.md), Phase 7 continuous optimization.
- Benchmark engine: [`benchmark.ts`](../../../servers/dashboard/src/telemetry/benchmark.ts).
- Existing contract: [`continuous-optimization.md`](../../../references/continuous-optimization.md).
- The current result compares the complete corpus only in aggregate. The fixed corpus
  and matching repetition coverage already provide the identity needed for a stable
  scenario breakdown.

## Requirements

1. Add a deterministic scenario comparison collection to `TokenBenchmarkComparison`,
   sorted by scenario ID.
2. Compare each scenario using the existing measured-token, duration, success, and
   cost-per-completed-task semantics; missing measured token or cost data remains
   explicit as `null`/`n/a`.
3. Keep the existing aggregate adoption gates and recommendation-only behavior
   unchanged. This report is observability evidence, not an automatic per-scenario
   activation or new policy gate.
4. Include the scenario breakdown in Markdown and JSON output without prompts,
   responses, paths, credentials, provider payloads, or session identifiers.
5. Preserve fixed-corpus validation, duplicate handling, existing exit codes, and
   provider-neutral local-only behavior.

## Behavior / Flow

1. Validate both datasets and their matching scenario/repetition coverage using the
   existing boundary.
2. Group runs by scenario ID for each variant.
3. Calculate the same comparison metrics for each pair, using measured runs for token
   metrics and all runs for duration/success/cost completion metrics.
4. Return the ordered collection alongside the existing aggregate result.
5. Render a bounded `Scenario metrics` Markdown table with scenario ID, token delta,
   duration delta, success rates, and cost-per-completed-task delta.

## Constraints

- Reuse the existing benchmark comparator and metric helpers; do not create a second
  benchmark engine or add dependencies.
- Do not change `adopt_candidate`/`keep_baseline` criteria in this feature.
- Scenario IDs come from validated bounded benchmark data and must be rendered as
  report data only after validation.
- Keep unavailable values as `null`/`n/a`; never infer tokens or cost.

## Edge Cases

| Scenario | Handling |
|---|---|
| A scenario has unavailable token usage | Token metrics are `null`; aggregate gates retain their existing failure behavior. |
| A scenario has unavailable cost | Cost-per-completed-task is `null` for that scenario; the aggregate cost gate remains fail-closed. |
| A scenario contains failed runs | Success rate exposes the difference; no new adoption gate is added. |
| Repeated runs exist for one scenario | Existing median and completion-cost semantics aggregate the repetitions deterministically. |
| Scenario order differs between input files | Output is sorted by scenario ID, independent of input order. |

## Acceptance Criteria

- AC-01: Given a valid fixed-corpus comparison, when it is computed, then the result
  contains one ordered scenario comparison for every scenario ID.
- AC-02: Given a candidate that regresses tokens, duration, success, or cost in one
  scenario while aggregate output remains valid, when the result is computed, then
  that scenario's deltas and rates expose the regression without changing existing
  aggregate gates.
- AC-03: Given unavailable token or cost measurements, when the scenario report is
  generated, then the affected fields are `null`/`n/a` and no estimated value appears.
- AC-04: Given a valid comparison, when JSON or Markdown is emitted, then the report
  includes the bounded scenario breakdown and no raw task/provider content.
- AC-05: Given the existing dashboard benchmark fixtures and test suite, when the
  dashboard typecheck, package tests, fixed benchmarks, and diff review run, then
  previous adoption, cost, corpus, and CLI behavior remains green.

## Done When

- [x] AC-01 — covered by deterministic scenario-order and complete-corpus tests.
- [x] AC-02 — covered by a focused per-scenario regression test.
- [x] AC-03 — covered by unavailable-token and unavailable-cost tests.
- [x] AC-04 — covered by Markdown/JSON shape and privacy assertions.
- [x] AC-05 — covered by dashboard typecheck, the complete package suite, both fixed
  benchmarks, and the diff review. No `SKILL.md` file changed in this feature;
  standalone skill validation was unavailable because Python is not configured in
  the environment.
