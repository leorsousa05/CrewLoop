# spec-029-dashboard-event-session-consistency

---
name: spec-029-dashboard-event-session-consistency
domain: 02-dashboard
status: active
created: 2026-07-15
completed: null
supersedes: []
---

# Dashboard Event and Session Consistency

## Objective

Make the ingestion pipeline contract-valid, preserve workspace identity through normalization, correlate concurrent invocations via stable IDs, and make session lifecycle/pruning/resume behavior deterministic.

## Context

- Dashboard architecture: `shared/architecture-overview.md` §Dashboard (normalization, security, skill inference).
- ADR 001 (hybrid instrumentation), ADR 005 (local trust boundary — workspace root containment).
- Depends on spec 028 (dashboard local security boundaries) being shipped first.

## Requirements

1. Define and validate one canonical event contract for all agent sources (Kimi, Claude, Codex, AGY, OpenCode).
2. Preserve workspace identity while normalizing only path-bearing tool payloads — `workspacePath` reaches `Session.workspaceRoot` unchanged.
3. Correlate concurrent tool starts/ends through stable invocation IDs whenever available; legacy events without `invocation_id` use an explicit best-effort fallback.
4. Make session lifecycle (create/start/activity/end/idle/resume/prune), active-session selection, pruning, and resume behavior deterministic.
5. Emit typed session-removal messages and clean runtime root mappings on prune.
6. Adapter contract fixtures per source covering identity, failure, duration, and path data.

## Behavior / Flow

1. Runtime event parser validates required fields, enums, types, numerics, lengths, structure — invalid events never mutate state or broadcast.
2. Path normalization targets `input`/`output`/display detail only; `workspacePath` is excluded.
3. `started_at` derives from the first accepted event timestamp, not receipt time.
4. Invocation pairing is correlation-first (`invocation_id`), with same-tool fallback for legacy payloads.
5. Session terminal state is no longer sticky: explicit resume transitions revive ended sessions; idle end applies only on explicit/new valid activity.
6. Pruning emits a `remove` WebSocket message and removes the runtime root mapping atomically.
7. CLI OpenCode plugin contract updated without exposing secrets; CLI and dashboard changes ship together when payload contracts change.

## Constraints

- Kimi, Claude, Codex, AGY, and OpenCode remain supported.
- Workspace roots remain absolute server-side, never exposed as event details.
- Adapter changes in CLI and dashboard released together when their payload contract changes.
- No changes to visual layout, filter semantics, or settings.
- No durable session-history storage (non-goal).

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Malformed event (bad type/enum/timestamp/ID/schema) | Rejected by parser; no state mutation, no broadcast |
| Upstream provides no stable invocation ID | Best-effort same-tool fallback documented; perfect correlation not guaranteed |
| Concurrent same-tool calls ending out of order | Pair correctly when a native ID exists |
| Resume of an ended session | Explicit resume transition; cleared terminal fields only on new valid activity |
| Pruned session with active client | Typed `remove` message; client handles it (migration note) |
| Root mapping persistence races | Atomic updates + cleanup bound to state transitions |
| Real hook payload differs from fixtures | Sanitized fixtures captured per supported source |

## Acceptance Criteria

- AC-01: Given a malformed event (invalid type/enum/timestamp/ID/schema), the dashboard state does not mutate and nothing broadcasts.
- AC-02: Given an event with `workspacePath`, `Session.workspaceRoot` equals the absolute value unchanged while nested payload paths become relative.
- AC-03: Given concurrent same-tool calls with `invocation_id`, ending out of order pairs them correctly.
- AC-04: Given session lifecycle, create/start/activity/end/idle/resume/prune transitions are deterministic; ended sessions cannot become active except via explicit resume.
- AC-05: Given a pruned session, a typed `remove` message is emitted and the runtime root mapping is cleaned.
- AC-06: Given the five adapters, contract fixtures exist covering success, failure, duration, path, identity, and missing optional fields per source.

## Done When

- [ ] AC-01 — proven by unit test: malformed fixture events cause no mutation/broadcast
- [ ] AC-02 — proven by unit test: workspace root preserved, nested paths relative
- [ ] AC-03 — proven by unit test: out-of-order same-tool pairing with native IDs
- [ ] AC-04 — proven by state-transition tests in `StateStore`
- [ ] AC-05 — proven by server test: prune emits `remove`, mappings cleaned
- [ ] AC-06 — proven by fixture files under `servers/dashboard/test/fixtures/` (one per source)
