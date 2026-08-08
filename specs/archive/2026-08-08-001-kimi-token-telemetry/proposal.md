> 🏗️ **CrewLoop Plan**

# 001 — Fix Kimi token telemetry

## Why

The dashboard Telemetry panel reports token usage as **unavailable** for sessions driven by Kimi Code. Investigation showed that the existing adapter, boundary validation, and state aggregation are all correct: when a `usage` object is present in the Kimi hook payload, it is normalized and displayed. The problem is that **Kimi Code hooks do not include token usage** in their lifecycle or tool-event payloads. Therefore telemetry cannot be fixed inside the normal hook pipeline; it needs an external ingestion path.

## Goals

1. Provide a dashboard endpoint that accepts a normalized Kimi/Moonshot usage payload and merges it into the matching session.
2. Ship a small helper script that forwards a Moonshot-style `usage` block to that endpoint.
3. Reuse existing token normalization, validation, and aggregation code so the two ingestion paths behave identically.
4. Keep the change local-only and secure (same host/origin policy as `/event`).

## Non-goals

- Building a full Moonshot API client or correlating individual API requests with dashboard sessions automatically.
- Changing how Codex, Claude, AGY, or OpenCode ingest usage.
- Modifying the dashboard UI beyond showing the now-populated telemetry.
- Persisting usage data outside the in-memory session store.

## Risk assessment

| Risk | Mitigation |
|------|------------|
| External ingestion could accept spoofed usage | Bind the endpoint to the same local trust policy as `/event` and require a known `source`. |
| Duplicated usage if both hooks and ingestion run | Use the existing measurement-id de-duplication in `mergeTokenUsage`; document that ingestion is a fallback for sources without hook usage. |
| API surface expansion | Keep the payload minimal and reuse `DashboardEvent.token_usage` shape internally. |
