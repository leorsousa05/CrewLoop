# Continuous Optimization

Continuous optimization is an evidence gate for changes that alter CrewLoop context selection, execution budgets, stop conditions, model routing, or execution profiles. It compares a candidate policy with a baseline using the existing local dashboard benchmark contracts.

## Benchmark Manifest

Plan emits one bounded manifest when the task changes optimization behavior:

```typescript
interface ContinuousOptimizationManifest {
  schemaVersion: 1;
  policyId: string;
  baselineVersion: string;
  candidateVersion: string;
  corpus: 'token-optimization-fixed-v1';
  repetitions: number;
  acceptanceChecks: 'identical';
}
```

The manifest contains no prompts, responses, paths, credentials, provider payloads, raw context, or session identifiers. Policy IDs and versions use the same bounded identifier rules as the benchmark dataset.

## Required Comparison

1. Run baseline and candidate with the same six scenario IDs, repetitions, inputs, acceptance checks, and relevant environment assumptions.
2. Validate both datasets with `validateTokenOptimizationCorpus`.
3. Compare them with `compareTokenOptimizationBenchmarks` and retain the existing execution and cost metrics.
4. Require the configured quality gates: at least 15% measured token reduction, at least 95% measured coverage, no more than 10% duration regression, and candidate success for every baseline-passing run.
5. Treat `adopt_candidate` as evidence for the normal reviewed workflow. Treat `keep_baseline` or unavailable required evidence as a reason to preserve the baseline and report bounded failure categories.

## Workflow Boundaries

- Plan identifies the policy change, versions, fixed corpus, and acceptance checks before Code starts.
- Code executes only the requested benchmark repetitions, reuses unchanged results, and does not mutate the active policy from a report.
- Review verifies corpus coverage, quality gates, sanitized reports, and the recommendation before PASS.
- Ship may commit or push only after Review passes; benchmark output never bypasses Shipper's Git boundary.
- A single noisy run cannot auto-tune limits, routing, profiles, or context selection. Any adoption is a separately reviewed policy change with a new candidate version.

## Report Contract

Every continuous comparison reports:

- baseline and candidate policy ID/version;
- `adopt_candidate` or `keep_baseline`;
- measured token, input, output, duration, coverage, and success metrics;
- model-call, tool-call, turn, attempt, failure, and cost metrics when available;
- bounded failure categories and no raw task or provider content.
