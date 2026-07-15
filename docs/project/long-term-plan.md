---
created_at: 2026-07-15
updated_at: 2026-07-15
project_name: dashboard-hardening
status: active
---

# Long-Term Plan: Dashboard Hardening

## Vision

Make the local CrewLoop dashboard a trustworthy operational instrument: secure at its local boundaries, correct under concurrent agent activity, responsive on desktop and mobile, and aligned with its documentation.

## Goals

- Eliminate known filesystem, WebSocket, and event-ingestion vulnerabilities.
- Keep session, invocation, workspace, filter, and settings behavior internally consistent.
- Refine the six-view interface without replacing its navigation model or product identity.
- Add regression coverage and reconcile the dashboard source of truth.

## Scope

### In scope

- Local HTTP/WebSocket trust boundaries and bounded filesystem access.
- Event validation, adapter correlation, session lifecycle, and pruning.
- Client projection, settings, filters, buffering, and file-viewer reliability.
- Partial responsive and accessible UI refinement.
- Automated verification, README, living spec, ADR, and stale spec cleanup.

### Out of scope

- Remote or multi-user hosting, authentication, and cloud deployment.
- Persistent session history, server-side search, and timeline virtualization.
- Reintroducing the Network 3D view or dashboard-based CLI configuration.
- A complete visual identity replacement.

## Milestones

1. **Local security boundaries** - Spec 028 accepted and shipped.
2. **Event and session consistency** - Spec 029 accepted and shipped.
3. **Client correctness** - Spec 030 accepted and shipped.
4. **Responsive UI refinement** - Spec 031 accepted and shipped.
5. **Quality and documentation** - Spec 032 accepted and shipped.

## Constraints

- The server remains loopback-only by default.
- Kimi, Claude, Codex, AGY, and OpenCode remain supported.
- Tool content remains observable locally after mandatory credential redaction and bounded ingestion.
- Hash routing, six-view navigation, themes, density, and persisted preferences remain product foundations.
- No new runtime dependency is introduced without a separate architectural decision.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Adapter payload differences break correlation | high | high | Contract tests per source and explicit fallback behavior |
| Security hardening blocks valid workspace reads | medium | high | Temporary-workspace integration fixtures and typed denial reasons |
| UI changes regress deep links or keyboard flows | medium | medium | Preserve ADR 003 and test routing independently |
| Program scope grows across phases | high | medium | Separate specs, sequential gates, and explicit non-goals |
