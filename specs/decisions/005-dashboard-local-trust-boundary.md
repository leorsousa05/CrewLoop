# ADR 005: Dashboard Local Trust Boundary

- **Status:** accepted
- **Date:** 2026-07-15
- **Spec:** `specs/changes/028-dashboard-local-security-boundaries/`

## Context

The dashboard exposes rich agent telemetry and workspace file operations. Binding to loopback reduces exposure but does not prevent hostile browser origins, DNS rebinding, malformed local clients, path traversal, or symlink escape. The product is not intended to provide remote or multi-user access.

## Decision

1. Treat the configured loopback HTTP origin as the browser trust boundary.
2. Validate HTTP Host where sensitive routes are served and validate WebSocket Origin before upgrade.
3. Permit non-browser hook POSTs without Origin only on the configured loopback listener.
4. Authorize file operations only through an existing session's canonical workspace root.
5. Require relative paths and verify canonical containment with path-boundary semantics and symlink resolution.
6. Remove repository/CWD and session-ID substring authorization fallbacks.
7. Bound event bodies, workspace scans, and file reads through explicit server configuration.
8. Preserve useful local tool input/output after mandatory credential redaction; localhost is not treated as permission to retain secrets.

## Consequences

### Positive

- Cross-origin pages cannot subscribe to telemetry through the loopback WebSocket.
- Session IDs no longer grant arbitrary filesystem access.
- Resource consumption is predictable under malformed or unexpectedly large input.
- The security model is explicit and testable rather than implied by bind address.

### Negative

- Remote access and arbitrary hostname aliases are unsupported without a future authenticated deployment design.
- Sessions that do not provide a workspace root cannot use file APIs.
- Legitimate symlinks leaving a workspace are intentionally unreadable.

## Alternatives Considered

| Alternative | Verdict | Reason |
|-------------|---------|--------|
| Rely only on `127.0.0.1` binding | Rejected | Does not address browser-origin attacks or unsafe path authorization |
| Add token authentication immediately | Rejected | Expands product scope and does not replace filesystem containment |
| Allow event-derived external paths | Rejected | Event text is untrusted and cannot safely authorize filesystem access |
| Disable tool payloads entirely | Rejected | Conflicts with the dashboard's local observability purpose |
