# Spec Delta: Dashboard Events and Sessions

## Current State

TypeScript types are trusted at runtime, event-wide recursive path normalization mutates workspace identity, and adapter-specific IDs are inconsistent. Session terminal state is sticky, pruning is server-only, and runtime root mappings are not cleaned.

## Changes

### ADDED

- Runtime event parser with required-field, enum, type, numeric, length, and structural validation.
- Optional canonical `invocation_id` carried from adapters to client events and invocation projection.
- A `remove` WebSocket message emitted when a session is pruned.
- Explicit session resume transition and active-session eligibility rules.
- Adapter contract fixtures for all supported sources.

### MODIFIED

- Path normalization targets `input`, `output`, and display detail without rewriting `workspacePath`.
- `started_at` derives from the first accepted event timestamp.
- Codex forwards call identity, failure, execution, and duration fields.
- AGY produces unique event IDs while sharing a stable invocation ID across pre/post events.
- OpenCode plugin/shim forwards stable session identity, tool arguments, output, and invocation identity when available.
- Runtime root mappings are updated atomically and removed with expired sessions.

### REMOVED

- Event-wide `any` recursion for path normalization.
- Tool name as the preferred correlation mechanism.
- Sticky `ended_at` semantics that prevent explicit session resume.

## Migration Notes

Client code must accept the new `remove` message. Existing events without `invocation_id` remain renderable and use the documented best-effort same-tool fallback.

## Backward Compatibility

Source support is preserved, but malformed events and ambiguous legacy payloads may now be rejected. OpenCode session grouping may change because workspace path is no longer the sole identity.
