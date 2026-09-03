# spec-040-execution-record-handoff

---
name: spec-040-execution-record-handoff
domain: 04-workflow
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Workflow Execution Record Handoff

## Objective

Make the CrewLoop skills produce one compact, provider-neutral execution-record handoff at the task boundary so measured workflow runs can feed the existing local benchmark without repeating context or exposing raw task data.

## Context

- Spec 014 defines the versioned `TaskExecutionRecord` and requires normalized facts from the host when available.
- Spec 037 bridges one validated execution record to the benchmark-run contract.
- Spec 039 lets the benchmark CLI consume paired execution-record collections.
- The skills currently describe budgets, verification, and stop conditions independently but do not share a precise handoff rule for assembling the final record.

## Requirements

1. Define one shared handoff protocol for the Plan, Code, Review, and Ship phases using the existing `TaskExecutionRecord` fields; do not create a second schema.
2. Require Plan to carry only bounded task metadata needed to complete a record: task/scenario identity, baseline/candidate variant, repetition, risk, and profile. Policy ID/version stays in the existing benchmark container; it is not a new `TaskExecutionRecord` field.
3. Require Code to update verified execution counters, timestamps, outcome, stop reason, and token usage when the host exposes them; unavailable facts remain `null`.
4. Require Review to validate record completeness, quality, scope, and sensitive-data exclusion before the record is considered benchmark evidence.
5. Require Ship to preserve the record as a sanitized handoff artifact or explicitly report it unavailable; Ship must never commit raw telemetry or activate a candidate policy.
6. Emit the record only at a task boundary or requested benchmark boundary, not on every turn, to avoid adding workflow token overhead.
7. Keep the protocol provider-neutral, local-only, deterministic, and compatible with the existing benchmark CLI and role boundaries.

## Behavior / Flow

1. Plan selects the bounded optimization metadata and marks whether benchmark evidence is requested. When policy metadata is needed, Plan places it in the existing benchmark manifest alongside the record rather than extending the record schema.
2. Code keeps task-local counters and adds only verified facts to the pending record.
3. Review checks the record against the existing schema, required validation result, and privacy rules.
4. On a completed task, the workflow emits one compact JSON record if required fields are available; otherwise it emits a bounded unavailable status and does not fabricate a record.
5. A caller may place records into the Spec 039 container and run the existing benchmark CLI. The handoff never changes the active policy.

## Constraints

- Do not add provider SDKs, model names, remote telemetry, persistence, endpoints, or a new record schema.
- Do not infer tokens, model calls, turns, attempts, duration, or tool calls from text length, tool lifecycle events, wall-clock assumptions, or response shape.
- Do not include prompts, responses, commands, paths, credentials, transcript content, raw provider payloads, or session identifiers in the handoff.
- Do not weaken required validation, security, accessibility, confirmations, Review, or Shipper-only Git ownership to reduce output size.
- Do not emit a partial adoptable record; missing required evidence is explicitly unavailable.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Benchmark metadata is not requested | Keep the workflow compact and do not emit a record block. |
| Host does not expose token or model-call counters | Preserve `null`/unavailable and do not estimate values. |
| Required validation fails | Set failed outcome and bounded stop reason; benchmark comparison cannot pass it. |
| Required validation is unavailable | Preserve unavailable verification and do not claim benchmark evidence. |
| Task ends at a budget or retry limit | Emit a bounded stopped record only when identity and timestamps are verified. |
| Review finds raw sensitive data in a proposed record | Reject the record handoff and report only a bounded privacy failure. |
| Ship sees an incomplete record | Leave it out of adoptable benchmark input and report the bounded missing fields. |
| Multiple phases try to emit the same boundary record | Keep one task-local record and merge only verified fields; do not duplicate it. |

## Acceptance Criteria

- AC-01: Given a benchmark-requested task, when Plan hands off to Code, then the handoff contains only bounded identity, variant, repetition, risk, profile, and policy metadata.
- AC-02: Given host-provided and unavailable counters, when Code assembles the task record, then verified values are preserved and unavailable values remain `null` without inference.
- AC-03: Given a proposed record, when Review validates it, then invalid schema, failed/unavailable verification, or sensitive-content cases cannot become adoptable benchmark evidence.
- AC-04: Given a completed valid record, when Ship prepares the handoff, then it produces one sanitized record compatible with the Spec 039 CLI or a bounded unavailable result, without Git/policy side effects.
- AC-05: Given the installed skill bundle, when skill validation and workflow contract tests run, then the shared protocol is present and the existing seven-skill routing contract remains unchanged.
- AC-06: Given the existing dashboard benchmark suite, when typecheck, tests, build, and fixed benchmark run, then all existing comparison behavior remains green.

## Done When

- [x] AC-01 - proven by Plan contract assertions for bounded optimization metadata.
- [x] AC-02 - proven by Code contract assertions for verified and unavailable counters.
- [x] AC-03 - proven by Review contract assertions for fail-closed verification and privacy checks.
- [x] AC-04 - proven by Ship contract assertions for one sanitized handoff and no policy/Git side effects.
- [x] AC-05 - proven by `python scripts/validate-skills.py` and workflow contract tests.
- [x] AC-06 - proven by the complete dashboard suite, typecheck, build, and fixed benchmark command.
