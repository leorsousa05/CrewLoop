---
name: spec-016-token-optimization-phase-3-execution-control
domain: 04-workflow
status: completed
created: 2026-09-01
completed: 2026-09-03
supersedes: []
---

# Native Token Optimization — Phase 3 Execution Control

## Objective

Make the CrewLoop implementation phase stop redundant work and bounded retries using the risk/profile budgets defined by the optimization foundation. The control policy must reduce unnecessary tool calls and correction loops while preserving required validation, safety checks, accessibility, tests, and user confirmations.

## Context

- Product roadmap: [`ROADMPA.md`](../../../ROADMPA.md), especially Phase 3 and its minimum stop condition.
- Phase 0/1 contracts: [`spec-014-token-optimization-phase-0-1.md`](spec-014-token-optimization-phase-0-1.md).
- Phase 2 context handoff: [`spec-015-token-optimization-phase-2-context-selection.md`](spec-015-token-optimization-phase-2-context-selection.md).
- Workflow contract: [`references/workflow.md`](../../../references/workflow.md) and [`references/conventions.md`](../../../references/conventions.md).

The repository's implementation surface is the portable `crewloop:code` skill. The dashboard records facts but does not execute provider calls, so this phase expresses control at the workflow boundary and keeps any replay/cache state task-local and ephemeral.

## Requirements

1. Add a portable execution-control procedure to `crewloop:code` that initializes the budget selected by Plan and tracks turns, verified model calls, tool calls, attempts, failures, and validation state when those facts are available.
2. Reuse the Phase 0/1 risk budgets and stop categories. Missing counters remain unavailable; they must not be converted to zero or inferred from tool events, text size, or elapsed time.
3. Deduplicate an identical read/search/inspection request while the relevant repository state is unchanged. The reuse key must be task-local and must never be persisted as raw prompt, command, payload, credential, or transcript data.
4. Invalidate task-local cached results after writes, dependency/configuration changes, failed results, or a detected repository-state change. A stale result must not be reused as an authorization or validation result.
5. Stop with a bounded reason when the configured turn, tool-call, or attempt budget is reached. Do not issue another automatic retry after a limit stop.
6. Stop with `no_progress` after two consecutive attempts produce no meaningful state or validation improvement. A single unchanged attempt remains eligible for one bounded follow-up when budget permits.
7. Complete immediately when the requested change is applied, required validation passes, scope is respected, and no mandatory validation remains. Do not start optional review/retry work solely to fill a budget.
8. Preserve all required safety, authorization, input validation, error handling, destructive-operation protection, accessibility, tests, and user confirmations regardless of the selected profile or budget.
9. Keep the first implementation local and additive. Do not add provider SDKs, remote queues, persistent global cache, semantic search, new dependencies, or automatic corrective loops.

## Behavior / Flow

1. Code receives the Plan brief, context manifest, risk/profile, and initial budget.
2. Code initializes task-local counters and an ephemeral replay map; unavailable counters remain unavailable.
3. Before each tool call, Code checks whether the same safe operation was already completed against the unchanged repository state. If so, it reuses the result and does not issue a duplicate call.
4. After every mutation, failure, dependency/configuration change, or repository-state change, Code invalidates affected cached results and reevaluates the remaining budget.
5. After each attempt, Code evaluates validation result, scope, meaningful progress, retry limit, and budget. It records one bounded stop category when stopping.
6. Once the completion condition is true, Code hands off to Review without additional optional execution. If a limit, validation failure, unavailable mandatory validation, or no-progress condition stops the task, it does not create an unbounded retry loop.

## Execution-Control Contract

```typescript
type ExecutionControlAction = 'continue' | 'complete' | 'stop';
type ExecutionControlReason =
  | 'completed'
  | 'validation_failed'
  | 'validation_unavailable'
  | 'budget_exhausted'
  | 'retry_limit'
  | 'no_progress';

interface ExecutionControlState {
  turns: number | null;
  modelCalls: number | null;
  toolCalls: number | null;
  attempts: number | null;
  failures: number | null;
  noProgressAttempts: number;
  repositoryRevision: string | null;
}

interface ExecutionControlDecision {
  action: ExecutionControlAction;
  reason: ExecutionControlReason | null;
}
```

`repositoryRevision` is an ephemeral change detector, not a persisted session identifier. Replay keys are local to the current task and must be discarded at task end.

## Constraints

- Change only the `crewloop:code` execution-control contract and its portable reference in this phase; do not change direct routing, role boundaries, or Shipper-only git ownership.
- Reuse `ExecutionBudget` and stop categories from spec 014; do not create competing budget semantics.
- Do not enforce a hard context cap that removes mandatory safety or correctness material. Record an exception and continue safely when required work exceeds a preference.
- Do not treat a cache hit as proof that a mutation, test, security scan, or required validation succeeded.
- Do not persist raw operation keys, commands, paths, tool payloads, model output, prompts, responses, or credentials.
- [Cache scope]: chose task-local ephemeral reuse because cross-session invalidation and privacy cannot be guaranteed by the current product surface; revisit if a versioned persistent cache is explicitly designed.
- [Limit behavior]: chose bounded stop plus explicit handoff because retries without measurable progress increase cost and can hide failures.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Missing turn, model-call, or token counter | Keep the value unavailable; use only verified facts for budget decisions and never coerce to zero. |
| Identical read/search request after an unchanged repository state | Reuse the task-local result without issuing a duplicate tool call. |
| Repository write, dependency change, config change, failed read, or stale revision | Invalidate affected cache entries before the next decision. |
| Tool/turn/attempt budget reached | Stop once with `budget_exhausted` or `retry_limit`; do not issue an automatic extra call. |
| One attempt with no visible progress | Permit one bounded follow-up if validation or budget requires it; do not classify as `no_progress` yet. |
| Two consecutive attempts with no state or validation improvement | Stop with `no_progress` and route the bounded failure for re-analysis instead of retrying indefinitely. |
| Required validation fails or is unavailable | Stop with the corresponding validation reason; token reduction cannot turn the run into a pass. |
| Completion condition is satisfied | Stop with `completed` and do not start optional retries or reviews before the required Review phase. |
| Security, accessibility, destructive-operation, or confirmation requirement conflicts with a limit | Preserve the requirement, record the exception, and stop safely if the budget cannot be increased. |
| Concurrent repository change during a cached operation | Mark the cache stale, discard the result, and re-evaluate against the new revision. |
| Sensitive data in an operation key or result | Keep it only in the host's protected ephemeral execution context; never include it in telemetry, manifests, logs, or handoffs. |

## Acceptance Criteria

- AC-01: Given a Plan brief with a valid risk/profile budget, when Code starts an implementation task, then it initializes the matching budget and tracks verified execution counters without converting unavailable values to zero.
- AC-02: Given an identical read or search operation and an unchanged repository revision, when Code requests it again, then it reuses the task-local result without issuing a duplicate call; after a mutation, the result is invalidated.
- AC-03: Given a task at its turn, tool-call, or attempt limit, when Code evaluates the next action, then it stops with a bounded limit reason and issues no automatic retry.
- AC-04: Given two consecutive attempts without meaningful state or validation improvement, when Code evaluates progress, then it stops with `no_progress`; given only one unchanged attempt, then it does not stop for no progress solely for that reason.
- AC-05: Given a task with applied change, passing required validation, respected scope, and no pending mandatory validation, when Code evaluates the state, then it stops as completed without optional extra execution.
- AC-06: Given a required safety, accessibility, validation, test, or user-confirmation action, when a cost preference conflicts with it, then Code preserves the action and records a bounded exception or safe stop.
- AC-07: Given the installed skill bundle, when the skill validator runs, then the new execution-control reference is linked, structurally valid, and the existing seven-skill transition contract remains unchanged.

## Done When

- [x] AC-01 — proven by the budget initialization and unavailable-counter examples in `skills/crewloop-code/references/execution-control.md`.
- [x] AC-02 — proven by the replay/invalidation examples in the portable execution-control reference.
- [x] AC-03 — proven by the bounded-limit examples and the Plan-selected budget handoff rules.
- [x] AC-04 — proven by the one-attempt and two-attempt no-progress examples.
- [x] AC-05 — proven by the completion stop example with no optional follow-up.
- [x] AC-06 — proven by the safety-preservation examples and explicit no-hard-cap constraint.
- [x] AC-07 — proven by `python scripts/validate-skills.py` using the configured Python executable and the unchanged transition metadata.
