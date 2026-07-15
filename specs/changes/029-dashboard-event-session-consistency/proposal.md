# Proposal: Dashboard Event and Session Consistency

## Status

- **State:** active
- **Created:** 2026-07-15
- **Author:** @opencode

## Problem Statement

The ingestion pipeline accepts structurally invalid events, erases `workspacePath` while relativizing payload paths, and relies on unrelated event IDs or tool-name stacks to pair concurrent invocations. Session start times use receipt time, ended sessions cannot resume consistently, pruned sessions leave stale clients and runtime root mappings, and several adapters discard native identity, status, duration, or file payloads.

## Goals

1. Define and validate one canonical event contract for all agent sources.
2. Preserve workspace identity while normalizing only path-bearing tool payloads.
3. Correlate concurrent tool starts/ends through stable invocation IDs whenever available.
4. Make session lifecycle, active-session selection, pruning, and resume behavior deterministic.

## Non-Goals

- Changing visual layout, filter semantics, or settings.
- Guaranteeing perfect correlation for upstream sources that provide no stable identifier.
- Adding durable session-history storage.

## Constraints

- Kimi, Claude, Codex, AGY, and OpenCode remain supported.
- Legacy events without `invocation_id` use an explicit best-effort fallback.
- Workspace roots remain absolute server-side and are never exposed as event details.
- Adapter changes in the CLI and dashboard must be released together when their payload contract changes.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Real hook payload differs from fixtures | High | Capture sanitized fixtures per supported source |
| New IDs split previously merged sessions | Medium | Document intentional identity correction and test concurrency |
| Resume semantics revive stale sessions | Medium | Clear terminal fields only on explicit/new valid activity |
| Root mapping persistence races | Medium | Encapsulate atomic updates and cleanup with state transitions |

## Success Criteria

- [ ] Invalid events cannot enter state or broadcast.
- [ ] `workspacePath` reaches `Session.workspaceRoot` unchanged and payload paths become relative.
- [ ] Out-of-order concurrent same-tool calls pair correctly when a native ID exists.
- [ ] Lifecycle, status, timestamps, active selection, and client removal stay consistent.
- [ ] Every supported adapter has contract fixtures for identity, failure, duration, and path data.
