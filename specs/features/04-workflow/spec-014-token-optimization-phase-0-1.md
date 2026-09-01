---
name: spec-014-token-optimization-phase-0-1
domain: 04-workflow
status: completed
created: 2026-09-01
completed: 2026-09-01
supersedes: []
---

# Native Token Optimization Foundation — Phases 0 and 1

## Objective

Define the first native CrewLoop token-optimization layer: a privacy-preserving execution measurement contract and a compact minimalism policy used by the CrewLoop workflow. The foundation must establish a comparable baseline before enforcing aggressive budgets or changing model routing.

## Context

- Product roadmap: [`ROADMPA.md`](../../../ROADMPA.md).
- Workflow and routing: [`specs/shared/architecture-overview.md`](../../shared/architecture-overview.md) and [`references/workflow.md`](../../../references/workflow.md).
- Existing event and token contracts: `servers/dashboard/src/types.ts` and `servers/dashboard/src/telemetry/`.
- Existing durable provider-usage history: [ADR 010](../../shared/adrs/adr-010-durable-product-usage-telemetry.md).
- Existing baseline/candidate comparison: `servers/dashboard/src/telemetry/benchmark.ts`.

The repository owns the CrewLoop skills, CLI, hook shim, and dashboard; it does not own provider model APIs. Phase 0 therefore measures facts exposed by the host agent/orchestrator and existing normalized events. It must not fabricate model-call or token data from prompt, command, transcript, or character counts.

## Requirements

1. Define a versioned, machine-readable execution record containing task identity, baseline/candidate variant, repetition, profile/risk, duration, model calls, tool calls, turns, attempts, failures, verification result, stop reason, token counts, and optional API-equivalent cost.
2. Reuse the existing `TokenUsageMeasurement`, `TokenUsageRepository`, and benchmark comparison contracts instead of creating a second provider-usage pipeline.
3. Keep raw prompts, responses, commands, tool payloads, transcript lines, workspace paths, credentials, and session identifiers out of persisted optimization telemetry.
4. Record unknown or unavailable measurements as unknown/unavailable; never convert missing counters into zero or estimate tokens from text.
5. Add one compact minimalism policy to the shared CrewLoop workflow contract. The policy must require reuse checks, standard-library/native capability checks, dependency restraint, smallest-correct-change selection, and explicit preservation of safety, accessibility, validation, tests, and user confirmations.
6. Have `crewloop:plan` select a task risk (`low`, `medium`, or `high`) and an execution profile (`minimal`, `balanced`, `safe`, or `review`) in the task brief/spec. The default for unspecified work is `balanced`; security, data-loss, authentication, authorization, and destructive-operation work defaults to `safe`.
7. Define proposed per-risk budgets for later enforcement without applying hard caps during baseline collection. Budget enforcement belongs to the execution-control phase after baseline data is available.
8. Define objective stop conditions: finish when the requested change is applied, required validation passes, scope is respected, and no mandatory validation remains; stop with a bounded failure when the budget or retry limit is reached; stop as no-progress when two consecutive attempts produce no meaningful state or validation improvement.
9. Define a fixed benchmark corpus covering a trivial documentation change, a focused CLI change, a dashboard logic change, a dashboard UI change, a security-sensitive change, and a failed-validation case. Each scenario must run as baseline and candidate with the same inputs and acceptance checks.
10. Keep the first implementation additive and local. Do not add provider SDKs, embeddings, vector search, fine-tuning, remote telemetry, multi-user storage, or a complex dashboard surface in this phase.

## Behavior / Flow

1. `crewloop:plan` reads the project memory, classifies task type and risk, and selects the smallest applicable policy profile.
2. Plan emits a compact optimization summary with the task spec rather than repeating a full policy document in every phase or turn.
3. The host agent/orchestrator emits only normalized execution facts at task, model-call, tool-call, turn, attempt, verification, and task-end boundaries when those facts are available.
4. The dashboard or benchmark collector validates the versioned record, merges verified token usage through the existing token pipeline, and stores aggregate numeric facts only.
5. Baseline and candidate runs use the same scenario IDs, acceptance checks, and repetition count. A comparison is valid only when both variants contain matching scenario sets and measured coverage is sufficient.
6. The result is judged by cost per correctly completed task first, then total tokens, redundant calls, latency, retries, and security/quality regressions. Token reduction alone cannot produce a passing result.
7. When the stop condition is met, the workflow ends without an extra review or tool call that has no required validation purpose.

## Contracts

```typescript
type OptimizationRisk = 'low' | 'medium' | 'high';
type OptimizationProfile = 'minimal' | 'balanced' | 'safe' | 'review';
type ExecutionVariant = 'baseline' | 'candidate';
type VerificationResult = 'passed' | 'failed' | 'not_run' | 'unavailable';
type ExecutionOutcome = 'completed' | 'failed' | 'incomplete' | 'stopped';

interface ExecutionBudget {
  maxContextTokens: number | null;
  maxOutputTokens: number | null;
  maxTurns: number;
  maxToolCalls: number;
  maxAttempts: number;
}

interface TaskExecutionRecord {
  schemaVersion: 1;
  taskId: string;
  scenarioId: string;
  variant: ExecutionVariant;
  repetition: number;
  risk: OptimizationRisk;
  profile: OptimizationProfile;
  startedAt: number;
  endedAt: number | null;
  durationMs: number | null;
  modelCalls: number | null;
  toolCalls: number | null;
  turns: number | null;
  attempts: number | null;
  failures: number | null;
  verification: VerificationResult;
  outcome: ExecutionOutcome;
  stopReason: string | null;
  tokenUsage: ClientTokenUsage | null;
  costMicrousd: number | null;
}
```

`null` means the producer did not expose a verified value. `0` means a verified zero. `stopReason` is a bounded category/message and must not contain prompts, commands, paths, or provider payloads. `ClientTokenUsage` continues to use the existing token quality semantics.

### Initial budget proposal

| Risk | Context tokens | Output tokens | Turns | Tool calls | Attempts |
|------|---------------:|--------------:|------:|-----------:|---------:|
| low | 12,000 | 4,000 | 4 | 12 | 1 |
| medium | 24,000 | 8,000 | 8 | 24 | 2 |
| high | 40,000 | 12,000 | 12 | 40 | 2 |

These are starting values for measurement and review, not an authorization to truncate required context. A budget may be increased when a mandatory safety or correctness check requires it; the increase must be recorded in the run metadata.

## Constraints

- Use `specs/features/04-workflow/` for this cross-cutting workflow feature; do not create a second roadmap or a global session-state file.
- Reuse the dashboard's existing local-only trust boundary and durable token-usage repository. Do not persist raw content or introduce a remote collector.
- Do not change the direct skill-routing contract, role boundaries, mandatory review gate, or Shipper ownership of git operations.
- Do not remove input validation, authentication/authorization, safe error handling, destructive-operation protection, accessibility, essential tests, or user confirmations to meet a budget.
- Do not count a tool lifecycle event as a model call unless the producer provides a verified model-call fact or verified token measurement.
- Do not sum overlapping cache/reasoning categories into provider-reported total tokens.
- [Default profile]: chose `balanced` because the roadmap optimizes cost without making correctness an opt-in.
- [High-risk handling]: chose `safe` as the default because risk matters more than change size.
- [Baseline caps]: chose observation before enforcement because premature truncation would invalidate the roadmap's success metric.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Missing/null execution field | Preserve the record with `null` for unavailable metrics; reject only missing identity, version, or variant. |
| Negative, fractional, non-finite, or oversized counter | Reject the invalid field/record safely; never coerce it to zero. |
| Duplicate record or replay after restart | Deduplicate using the stable task/scenario/variant/repetition identity and leave the aggregate unchanged. |
| Baseline/candidate scenario mismatch | Mark comparison invalid; do not report a token-saving win. |
| Provider exposes no verified model-call or token count | Record `null`/`unavailable`; do not infer from text length or tool count. |
| Measured zero tokens | Preserve zero as a measured value distinct from unavailable. |
| Required context exceeds proposed budget | Keep required context, record the budget exception, and continue under the safe profile. |
| Two consecutive attempts make no state or validation progress | Stop with `stopReason: no_progress`; do not start another retry automatically. |
| Safety validation fails | Mark the run failed and prevent a passing comparison, regardless of token reduction. |
| Concurrent events arrive out of order | Order by producer sequence when available; otherwise retain the event but mark derived turn/attempt metrics unavailable. |
| Permission prevents telemetry persistence | Keep the task execution alive when safe, return a sanitized telemetry error, and never expose database paths or payloads. |
| Sensitive data appears in an event | Apply the existing sanitization boundary and ensure it is absent from stored telemetry. |

## Benchmark Corpus

The first baseline must include these fixed scenarios, each with the same acceptance check in both variants:

1. `docs-small`: one bounded documentation correction.
2. `cli-small`: one parser or output behavior change with focused tests.
3. `dashboard-logic`: one server-side state or API behavior change.
4. `dashboard-ui`: one existing dashboard component adjustment with an accessibility assertion.
5. `security-boundary`: one validation or trust-boundary change with negative-path tests.
6. `verification-failure`: an intentionally failing validation that must terminate as failed without an unbounded retry loop.

The corpus must use synthetic repositories/fixtures, fixed prompts supplied by the benchmark harness, and no production credentials or workspace data.

## Acceptance Criteria

- AC-01: Given a valid baseline or candidate execution record, when the collector validates it, then all required identity fields and numeric counters are accepted and unavailable metrics remain explicitly `null`/`unavailable`.
- AC-02: Given an invalid record containing a negative, fractional, non-finite, oversized, or sensitive value, when it crosses the telemetry boundary, then it is rejected or sanitized without persisting the invalid value or raw sensitive content.
- AC-03: Given replayed records for the same task/scenario/variant/repetition, when they are collected more than once, then the comparison aggregate changes only once.
- AC-04: Given baseline and candidate datasets with identical scenarios and verified acceptance results, when they are compared, then the report includes tokens, model calls, tool calls, turns, attempts, failures, duration, and cost-per-completed-task inputs.
- AC-05: Given a candidate with fewer tokens but a failed required validation, when the benchmark is evaluated, then the comparison fails and cannot report optimization success.
- AC-06: Given a new task without an explicit optimization profile, when `crewloop:plan` classifies it, then it records `balanced`; given a high-risk task, then it records `safe`.
- AC-07: Given a task whose change is applied, required tests pass, and scope is respected, when no mandatory validation remains, then the workflow reaches a terminal stop without an additional optional retry/review cycle.
- AC-08: Given the fixed benchmark corpus, when baseline and candidate runs are executed with the same inputs and checks, then all six scenario IDs appear in both datasets and the report identifies coverage or mismatch failures.
- AC-09: Given the repository's current skill contracts and routing, when the new policy is loaded, then direct routing, role boundaries, safety rules, and Shipper-only git operations remain unchanged.

## Done When

- [x] AC-01 — proven by `servers/dashboard/src/telemetry/execution.test.ts` covering valid, null, zero, and unavailable fields.
- [x] AC-02 — proven by telemetry-boundary tests for invalid counters, unsafe identifiers, and free-form sensitive stop reasons.
- [x] AC-03 — proven by benchmark deduplication and duplicate-identity tests plus the existing durable usage replay tests.
- [x] AC-04 — proven by `servers/dashboard/src/telemetry/benchmark.test.ts` and the stable benchmark CLI Markdown report.
- [x] AC-05 — proven by the candidate-failure benchmark test, which fails despite reduced token totals.
- [x] AC-06 — proven by `selectOptimizationProfile` tests and the Plan policy directive.
- [x] AC-07 — proven by deterministic stop-condition tests for success, validation failure, budget exhaustion, and no progress.
- [x] AC-08 — proven by the fixed corpus validator test requiring all six scenario IDs in both variants.
- [x] AC-09 — proven by `scripts/validate-skills.py` (7 PASS) and preserved transition metadata.
