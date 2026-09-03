# spec-037-execution-record-benchmark-bridge

---
name: spec-037-execution-record-benchmark-bridge
domain: 04-workflow
status: active
created: 2026-09-02
completed: null
supersedes: []
---

# Execution Record to Benchmark Bridge

## Objective

Make verified host execution records consumable by the existing token benchmark without adding a provider integration, persistence layer, or second telemetry schema.

## Context

- `execution.ts` already validates the provider-neutral `TaskExecutionRecord` used by the CrewLoop workflow.
- `benchmark.ts` already compares `TokenBenchmarkRun` values and enforces the fixed corpus and quality gates.
- The two contracts overlap, but there is no explicit adapter for turning a verified execution record into a benchmark run.
- The bridge must preserve unavailable measurements as unavailable and must not infer counters from text, tools, or elapsed time.

## Requirements

1. Accept a validated `TaskExecutionRecord` and a known `AgentSource` and project it into the existing `TokenBenchmarkRun` shape.
2. Carry scenario, variant, repetition, token usage, duration, tool calls, model, model-call, turn, attempt, failure, risk, profile, verification, outcome, stop reason, and cost fields when available.
3. Set benchmark `passed` only from an explicit completed outcome with passed verification.
4. Return a bounded unavailable reason when token usage, duration, or tool calls are not available; never coerce those values to zero.
5. Reuse existing record and benchmark validators and agent-source values. Do not add providers, files, persistence, endpoints, or automatic policy activation.
6. Reject an invalid execution record or unknown source without echoing raw input content.

## Behavior / Flow

1. The host passes a record and source to the adapter.
2. The adapter validates the record, checks source membership, and checks the required benchmark measurements.
3. A ready projection returns one existing `TokenBenchmarkRun`; an unavailable projection returns a bounded reason for the caller to record as missing evidence.
4. The existing corpus validator and comparator decide whether the resulting baseline/candidate data is sufficient for optimization.

## Constraints

- Do not change the `TaskExecutionRecord` or `TokenBenchmarkRun` schemas.
- Do not infer duration, tool calls, model calls, turns, attempts, failures, or tokens.
- Do not treat an unavailable projection as a passing benchmark run.
- Keep the function deterministic and side-effect free.
- Preserve local-only telemetry and the Plan → Code → Review → Ship role boundaries.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| `tokenUsage` is `null` | Return `token_usage_unavailable`. |
| `durationMs` is `null` | Return `duration_unavailable`. |
| `toolCalls` is `null` | Return `tool_calls_unavailable`. |
| Verification passed but outcome is incomplete | Project with `passed: false`. |
| Optional model/execution counters are `null` | Preserve them as `null`/omitted in the benchmark run. |
| Unknown source | Reject with a bounded source error. |
| Invalid record contains sensitive text | Reject through the existing validator without echoing the value. |

## Acceptance Criteria

- AC-01: A complete validated execution record projects deterministically to one benchmark run with all available metrics preserved.
- AC-02: A completed record with passed verification projects with `passed: true`; an incomplete, failed, or stopped record projects with `passed: false`.
- AC-03: Missing token usage, duration, or tool calls returns a bounded unavailable reason and never produces a synthetic zero.
- AC-04: Invalid records and unknown sources are rejected through bounded validation errors without raw input echoing.
- AC-05: Existing benchmark corpus/comparison and dashboard test suites remain green.

## Done When

- [x] AC-01 — proven by focused benchmark tests for field preservation and deterministic output.
- [x] AC-02 — proven by completed and non-completed projection tests.
- [x] AC-03 — proven by unavailable-measurement tests asserting no zero coercion.
- [x] AC-04 — proven by invalid-record, unknown-source, and bounded-error tests.
- [x] AC-05 — proven by the focused suite, followed by the complete dashboard test suite and typecheck/build.
