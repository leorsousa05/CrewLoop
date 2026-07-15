# Spec Delta: Dashboard Client Correctness

## Current State

Projection uses a hard-coded limit, several filters are partial, pause buffering appends complete updates indefinitely, and async file fetches are not associated with selection identity. Settings persistence is separate from effective behavior.

## Changes

### ADDED

- Configurable invocation projection using `settings.maxEvents` within server-retained bounds.
- Session-removal handling and deterministic selected-session fallback.
- Coalesced paused updates keyed by session, with snapshot replacement semantics.
- Abortable file content/diff requests tied to the selected session/path/request generation.
- Reactive media-query subscriptions for system theme and reduced motion.

### MODIFIED

- Recent panels and command palette select newest-first data correctly.
- Session and Files filters apply query, tool, operation, status, source, skill, and time consistently.
- Auto-follow responds to newly active sessions according to the setting without overriding an explicit pinned/deep-linked choice.
- WebSocket URL derives `ws:` or `wss:` from page protocol.
- Manual reduced motion applies a root-level effective-motion state.

### REMOVED

- Hard-coded UI projection cap disconnected from settings.
- Unbounded array replay for paused full-session updates.
- Stale file responses that update state after selection changes.

## Migration Notes

Existing settings are merged with validated defaults. Invalid persisted values are ignored. Hash-route format does not change.

## Backward Compatibility

Deep links and valid preferences remain compatible. Filtered results may change because controls now apply their advertised semantics.
