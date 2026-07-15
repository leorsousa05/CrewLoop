# Proposal: Dashboard Local Security Boundaries

## Status

- **State:** active
- **Created:** 2026-07-15
- **Author:** @opencode

## Problem Statement

The dashboard is intended to be a loopback-only developer tool, but its current HTTP and WebSocket boundaries do not enforce that trust model. File-content and diff endpoints use prefix and session-ID substring checks that can authorize paths outside the workspace, including symlink escapes. WebSocket clients are accepted without Origin validation and receive complete session telemetry. Event bodies, workspace enumeration, and file reads are also unbounded.

## Goals

1. Make the loopback-only trust boundary explicit and enforceable.
2. Restrict every file operation to the canonical workspace root for an existing session.
3. Bound request and filesystem work so malformed local input cannot exhaust the process.
4. Preserve rich local observability after mandatory secret redaction.

## Non-Goals

- Authentication, TLS termination, remote hosting, or multi-user authorization.
- Changing adapter normalization, session lifecycle, or UI layout.
- Supporting arbitrary external file reads inferred from event text.

## Constraints

- Default host remains `127.0.0.1`.
- Hook clients posting `/event` may omit browser Origin headers.
- Browser WebSocket clients must originate from the dashboard's local HTTP origin.
- No new runtime dependency is required.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Valid temporary workspaces are rejected | High | Resolve roots from session state and test real temporary directories |
| Symlink handling blocks legitimate links | Medium | Permit links only when their canonical targets remain inside the canonical root |
| Limits truncate valid large repositories | Medium | Expose typed configuration limits and return explicit bounded errors |
| Host validation disrupts local aliases | Low | Document and test the supported loopback host forms |

## Success Criteria

- [ ] Sibling-prefix, traversal, forged-session, absolute-path, and symlink-escape reads return 403.
- [ ] Cross-origin browser WebSocket upgrades are rejected before telemetry is sent.
- [ ] Oversized event bodies, files, and workspace scans fail predictably without process instability.
- [ ] Valid reads and diffs inside a session workspace continue to work.
