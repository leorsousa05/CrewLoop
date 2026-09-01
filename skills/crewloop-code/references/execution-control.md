# Execution Control

Use this procedure for every implementation task after Plan provides the risk, profile, budget, and compact context manifest. The objective is to finish as soon as required work is validated and to prevent duplicate inspection or unbounded retries.

## Initialization

At task start, load the `ExecutionBudget` selected by Plan from the Phase 0/1 contract. Keep counters for turns, verified model calls, tool calls, attempts, failures, and validation state when the host exposes them.

- An unavailable counter stays unavailable. Do not convert it to zero.
- A tool lifecycle event is not a model call unless the host supplies a verified model-call fact or token measurement.
- Budgets are control signals, not permission to omit required context, safety checks, tests, accessibility checks, or user confirmations.
- Keep replay state and repository revision state in the current task only. Discard both at task end.

## Before Each Tool Call

1. Check whether the operation is required by the spec, an acceptance criterion, a safety rule, or a concrete implementation need.
2. Build a task-local replay key from the operation type and bounded target. Never put raw prompt, command, payload, credential, transcript, or model output into the key or a handoff.
3. If an identical read/search/inspection operation already succeeded against the unchanged repository revision, reuse its result and do not issue another tool call.
4. Do not reuse a cached result for writes, failed operations, tests, security scans, validation, or authorization decisions.
5. Before issuing a new call, check the remaining turn, tool-call, and attempt budget. If a required action cannot fit, preserve the action and stop safely with a bounded reason.

## Cache Invalidation

Invalidate affected task-local results immediately after:

- any file or repository write;
- dependency, lockfile, or configuration changes;
- a failed or partial read/search result;
- a detected repository revision change;
- an operation whose inputs or required rules changed.

A stale result is not evidence of current code, a successful mutation, a passing test, a security property, or authorization to continue.

## Stop Evaluation

Evaluate the state after each attempt and before optional work. Use only the bounded categories from the execution foundation:

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
```

Apply these decisions in order:

1. If required validation failed or is unavailable, stop with the matching validation reason. Fewer tokens never turn this into a passing task.
2. If the turn, tool-call, or attempt budget is exhausted, stop with `budget_exhausted` or `retry_limit` and issue no automatic extra call.
3. If two consecutive attempts made no meaningful state or validation improvement, stop with `no_progress` and do not start another retry loop.
4. If the requested change is applied, required validation passed, scope is respected, and no mandatory validation remains, stop with `completed` and hand off to Review.
5. Otherwise continue only when the next action has a concrete implementation, validation, or safety purpose and budget permits it.

## Required Work Wins Over Cost Preference

Always preserve applicable `AGENTS.md` rules, security and authorization checks, input validation, safe error handling, destructive-operation protection, accessibility assertions, essential tests, and user confirmations. If required work exceeds a soft preference, record a bounded exception and complete the required work or stop safely; never silently remove it.

## Examples

### Reuse and invalidation

```text
Read servers/dashboard/src/state.ts at revision R1 -> cache success.
Read servers/dashboard/src/state.ts at revision R1 -> reuse; no duplicate call.
Write servers/dashboard/src/state.ts -> invalidate affected cache.
Read servers/dashboard/src/state.ts at revision R2 -> execute again.
```

### Bounded no-progress handling

One unchanged attempt may receive one concrete follow-up when budget permits. After two consecutive attempts without state or validation improvement, stop with `no_progress`; do not retry automatically.

### Completion

When the scoped change is applied, required tests and checks pass, scope is respected, and no mandatory check remains, stop with `completed`. Do not run optional inspection merely to consume remaining budget.
