---
name: spec-051-benchmark-cost-gate
domain: 04-workflow
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Benchmark Cost Gate

## Objective

Make the token benchmark honor the roadmap's primary metric by refusing to recommend a candidate whose measured cost per correctly completed task regresses or is unavailable.

## Context

- The roadmap defines total cost per correctly completed task as the primary optimization metric.
- The existing comparator reports cost per completed task but only gates token reduction, coverage, duration, and candidate success.
- Token reduction alone must not approve a more expensive policy.

## Requirements

1. Add a bounded `maximumCostRegressionPercent` benchmark configuration with a default of `0` percent.
2. Compare baseline and candidate cost per completed task using the existing nullable cost metric.
3. Fail closed with `keep_baseline` when the cost comparison is unavailable or exceeds the configured regression limit.
4. Preserve the existing token, coverage, duration, quality, corpus, privacy, local-only, recommendation-only, and Shipper-only contracts.
5. Keep the cost gate deterministic and use only verified `costMicrousd` values; never infer cost from tokens, model names, prompts, or text.
6. Update synthetic dataset fixtures and documentation so the normal dataset benchmark carries explicit cost evidence.

## Acceptance Criteria

- AC-01: A candidate with lower tokens but higher cost per correctly completed task returns `keep_baseline` with a bounded cost-regression failure.
- AC-02: A valid candidate with measured cost at or below baseline can still return `adopt_candidate` when every existing gate passes.
- AC-03: Missing cost evidence returns `keep_baseline` and an unavailable-cost failure instead of silently approving token reduction.
- AC-04: The configured cost threshold is bounded and applies without a new dependency or second benchmark engine.
- AC-05: Dataset and execution-record benchmarks, full dashboard tests/build, and documentation remain green; no policy is activated automatically.

## Done When

- [x] AC-01 - proven by the regression test with a cheaper-token, higher-cost candidate
- [x] AC-02 - proven by the fixed dataset and execution-record benchmark fixtures
- [x] AC-03 - proven by the unavailable-cost test
- [x] AC-04 - proven by the bounded config and existing benchmark implementation
- [x] AC-05 - proven by the dashboard gates and updated benchmark documentation

## Verification Evidence

- Focused benchmark and CLI tests - passed: `34/34`.
- Dataset benchmark - passed with `adopt_candidate`, 25% lower tokens, 25% lower cost per completed task, 100% measured coverage, and 5% duration increase.
- Execution-record benchmark - passed with the same 25% token and cost reduction and 100% measured coverage.
- Negative-path tests - passed for cost regression and unavailable cost evidence; both return `keep_baseline`.
- Full dashboard gates - passed: typecheck, production build, `353` server tests, `92` UI tests, and `4` browser-free preflight contract tests.
- The existing combined Chrome/CDP dashboard preflight remains green after the preceding UI changes; the cost gate itself is local, deterministic, and recommendation-only.
