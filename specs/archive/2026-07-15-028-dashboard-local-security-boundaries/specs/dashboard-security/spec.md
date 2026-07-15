# Spec Delta: Dashboard Security

## Current State

The server trusts request host/origin data, falls back across repository and process roots, and authorizes files through string-prefix and session-ID substring checks. Filesystem operations are synchronous and unbounded. WebSocket clients receive full snapshots without an origin gate.

## Changes

### ADDED

- A local request policy that validates HTTP Host and browser WebSocket Origin against configured loopback endpoints.
- A workspace access policy that resolves existing-session roots and canonical contained paths.
- Configurable limits for event body bytes, workspace entries, traversal depth, and readable file bytes.
- Stable JSON error codes for invalid origin, missing workspace, forbidden path, oversized input, binary file, and unavailable diff.

### MODIFIED

- `/api/workspace-files` requires a known session workspace and returns bounded relative entries.
- `/api/file-content` and `/api/file-diff` resolve canonical paths before performing I/O.
- `/event` aborts and rejects bodies that exceed the configured limit.
- WebSocket upgrade accepts only the dashboard's local browser origins.

### REMOVED

- Repository/CWD fallback authorization for session file APIs.
- `absPath.startsWith(root)` and `absPath.includes(sessionId)` authorization.
- Request-path debug logging.

## Migration Notes

Clients must provide a valid `sessionId` for workspace and file APIs. Sessions without a workspace root show an unavailable state rather than reading from the dashboard process directory.

## Backward Compatibility

This intentionally breaks undocumented fallback reads and cross-origin WebSocket access. Loopback dashboard usage and valid in-workspace file operations remain supported.
