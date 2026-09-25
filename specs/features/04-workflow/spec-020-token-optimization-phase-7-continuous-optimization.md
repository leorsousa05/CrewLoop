---
name: spec-020-token-optimization-phase-7-continuous-optimization
domain: 04-workflow
status: completed
created: 2026-09-01
completed: 2026-09-01
supersedes: []
---

# Native Token Optimization — Phase 7 Continuous Optimization

## Objective

Make every optimizer-policy change comparable with its previous version through a deterministic, local A/B benchmark decision. A measured token reduction is useful only when the candidate preserves required quality, safety, coverage, and bounded execution behavior.

## Context

- Product roadmap: [`ROADMPA.md`](../../../ROADMPA.md), especially Phase 7 and the fixed six-scenario corpus.
- Existing telemetry and benchmark contracts: [`spec-014-token-optimization-phase-0-1.md`](spec-014-token-optimization-phase-0-1.md).
- Execution controls: [`spec-016-token-optimization-phase-3-execution-control.md`](spec-016-token-optimization-phase-3-execution-control.md).
- Automatic verification: [`spec-017-token-optimization-phase-4-automatic-verification.md`](spec-017-token-optimization-phase-4-automatic-verification.md).
- Existing implementation: [`servers/dashboard/src/telemetry/benchmark.ts`](../../../servers/dashboard/src/telemetry/benchmark.ts), its tests, and the benchmark CLI.
- Shared workflow rules: [`references/conventions.md`](../../../references/conventions.md) and [`references/workflow.md`](../../../references/workflow.md).

The dashboard already compares baseline and candidate telemetry. This phase makes the compared policy identity explicit, validates that both variants cover the same fixed corpus, and returns a bounded adoption recommendation without mutating the active policy.

## Requirements

1. Identify every benchmark dataset with a bounded policy ID and policy version. Policy metadata must contain no prompts, responses, paths, credentials, provider payloads, or session identifiers.
2. Compare a candidate policy only with the same optimizer policy ID and a separately identified version. Reject comparisons across unrelated policy IDs.
3. Require baseline and candidate data to use the fixed six-scenario optimization corpus with matching scenario coverage before reporting an optimization result.
4. Preserve the existing quality gates: minimum 15% measured token reduction, at least 95% measured coverage, maximum 10% duration regression, and candidate success for every baseline-passing run.
5. Include token, cost, duration, model-call, tool-call, turn, attempt, failure, success-rate, coverage, policy identity, and decision data in the comparison result/report when available. Keep unavailable metrics explicit as `null`/`n/a`.
6. Return `adopt_candidate` only when every configured gate passes; otherwise return `keep_baseline` with bounded failure reasons.
7. Never activate, persist, or remotely publish a candidate policy automatically from the benchmark result. The recommendation is evidence for the existing Plan/Review/Ship workflow.
8. Keep the benchmark local-only and deterministic. Do not add dependencies, provider integrations, remote telemetry, automatic retries, or changes to direct routing, role boundaries, mandatory Review, or Shipper-only Git operations.
9. Encode the benchmark handoff in Plan, Code, and Review so optimization-policy changes carry a bounded manifest, execute the fixed comparison, and require the adoption gate before PASS.

## Behavior / Flow

1. The benchmark loader validates dataset schema, bounded policy identity, run identity, numeric counters, and token-quality semantics.
2. The corpus validator confirms both variants contain the fixed scenario IDs and the same scenario coverage, then confirms both policies share the optimizer policy ID.
3. The comparator calculates the existing medians and execution/cost metrics, applies all quality and safety thresholds, and derives a decision.
4. A passing comparison returns `adopt_candidate`; a failed comparison returns `keep_baseline` and sanitized failure categories.
5. The CLI emits the decision and policy versions in JSON or Markdown. No command in this phase changes the active optimizer policy.

## Continuous Optimization Contract

```typescript
interface TokenBenchmarkPolicy {
  id: string;
  version: string;
}

type TokenOptimizationDecision = 'adopt_candidate' | 'keep_baseline';

interface TokenBenchmarkDataset {
  schemaVersion: 1;
  label: string;
  policy: TokenBenchmarkPolicy;
  runs: TokenBenchmarkRun[];
}

interface TokenBenchmarkComparison {
  policy: {
    baseline: TokenBenchmarkPolicy;
    candidate: TokenBenchmarkPolicy;
  };
  decision: TokenOptimizationDecision;
  passed: boolean;
  failures: string[];
  // Existing token, execution, quality, coverage, and cost metrics remain present.
}
```

`adopt_candidate` is a recommendation, not an activation command. A policy version may be adopted only through the normal reviewed CrewLoop change flow.

## Constraints

- Reuse `benchmark.ts`, its fixed `TOKEN_OPTIMIZATION_SCENARIO_IDS`, fixtures, tests, and CLI; do not create a second benchmark engine.
- Keep schema fields bounded and provider-neutral. Reject unsafe or oversized policy identifiers; never echo invalid sensitive values in errors or reports.
- Do not treat token reduction as success when candidate validation, coverage, duration, or required execution quality fails.
- Do not infer measurements from prompt length, file size, model names, tool count, or pricing.
- Do not silently accept a missing policy version, mismatched policy ID, missing corpus scenario, or unrelated baseline/candidate pair.
- Do not auto-tune budgets, model routes, profiles, or context rules from a single comparison. Emit evidence and a bounded recommendation only.
- Preserve local-only storage, mandatory controls, accessibility checks, tests, confirmations, and the Shipper-only Git boundary.
- [Quality-first]: chose `keep_baseline` on any failed or unavailable required gate so a cheaper result cannot masquerade as a safe optimization.
- [Adoption boundary]: chose recommendation-only output because activating policy changes requires the existing reviewed delivery flow.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Missing policy metadata | Reject the dataset before comparison. |
| Invalid, oversized, or sensitive-looking policy identifier | Reject with a bounded field error and never echo the value. |
| Different optimizer policy IDs | Reject the comparison as unrelated; do not emit an adoption decision. |
| Same policy ID and same version on both sides | Allow a reproducibility comparison, but the result remains recommendation-only. |
| Missing fixed scenario in either variant | Reject corpus validation and do not report a token-saving win. |
| Different scenario coverage | Reject before metric aggregation. |
| Candidate saves tokens but required validation fails | Return `keep_baseline` with the quality failure. |
| Required metric is unavailable | Preserve `null`/`n/a`; fail the corresponding required gate rather than estimate. |
| Replayed identical run | Deduplicate by existing variant/scenario/repetition identity. |
| Conflicting duplicate run | Reject the dataset as invalid. |
| Benchmark report is consumed by another stage | Pass policy IDs, versions, decision, and bounded failure categories only. |
| Candidate recommendation is not approved | Keep the baseline active; do not mutate runtime or policy files. |

## Acceptance Criteria

- AC-01: Given a benchmark dataset without a valid bounded policy ID and version, when it crosses the telemetry boundary, then validation rejects it without echoing raw invalid content.
- AC-02: Given baseline and candidate datasets for different policy IDs, when they are compared, then comparison rejects the unrelated pair before calculating an adoption result.
- AC-03: Given baseline and candidate datasets with the fixed six scenario IDs and equal scenario coverage, when corpus validation runs, then it passes; when a scenario is missing or coverage differs, then it fails closed.
- AC-04: Given a candidate with enough measured token reduction and no quality/duration regression, when all configured gates pass, then the comparison returns `passed: true` and `decision: adopt_candidate`.
- AC-05: Given a candidate with fewer tokens but a failed validation, insufficient coverage, excessive duration, or missing required evidence, when it is compared, then it returns `passed: false` and `decision: keep_baseline`.
- AC-06: Given a valid comparison, when the Markdown or JSON report is formatted, then it contains both policy identities, the decision, quality/cost/execution metrics, and bounded failures without raw task data.
- AC-07: Given a passing comparison, when the result is consumed by the workflow, then it provides only a recommendation and does not activate or persist the candidate policy automatically.
- AC-08: Given the installed CrewLoop bundle, when validation and dashboard tests run, then the seven-skill transition contract and existing telemetry safety behavior remain valid.
- AC-09: Given a task that changes an optimization policy, when Plan, Code, and Review load the continuous-optimization contract, then the bounded benchmark manifest, fixed-corpus execution, and adoption gate are required without changing role boundaries.

## Done When

- [x] AC-01 — proven by dataset policy-metadata validation tests for missing and invalid identifiers.
- [x] AC-02 — proven by a benchmark test rejecting mismatched optimizer policy IDs.
- [x] AC-03 — proven by fixed-corpus and coverage-mismatch tests.
- [x] AC-04 — proven by a passing comparison test asserting `adopt_candidate`.
- [x] AC-05 — proven by quality, coverage, duration, and unavailable-evidence failure tests asserting `keep_baseline`.
- [x] AC-06 — proven by stable Markdown/JSON report tests containing policy identity and decision fields.
- [x] AC-07 — proven by the recommendation-only contract and absence of activation side effects in the benchmark implementation.
- [x] AC-08 — proven by `scripts/validate-skills.py`, dashboard build, and the complete compiled dashboard test suite.
- [x] AC-09 — proven by the linked continuous-optimization reference and Plan/Code/Review contract checks.
