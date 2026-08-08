> 🏗️ **CrewLoop Plan**

# Proposal — Automatic Kimi token telemetry from wire logs

## Problem Statement

The dashboard still reports **"Token usage was not reported by this agent"** for Kimi Code sessions after the `001-kimi-token-telemetry` fix. That fix added `POST /ingest/usage` and `crewloop-ingest-kimi`, but usage only appears when a user manually pipes a Moonshot usage payload into the helper. Kimi Code lifecycle hooks do not include token counts, so the dashboard cannot populate telemetry from the normal hook flow alone.

## Goals

1. Make Kimi token telemetry automatic by reading Kimi Code's local wire JSONL logs.
2. Discover the correct `wire.jsonl` file from the Kimi `session_id` already present in hook events.
3. Parse the latest turn-scoped `usage.record` entry and normalize it through the existing `normalizeTokenUsage` pipeline.
4. Reuse the same path-containment and tail-read security patterns already used for Codex transcripts.

## Non-Goals

- Building a Moonshot API client or proxy.
- Modifying Kimi Code CLI, its hooks, or its plugin system.
- Supporting every historical Kimi data layout; target the layout documented by `ccusage`.
- Correlating exact API calls with dashboard tool events.

## Constraints

- File reads must stay inside the configured Kimi data directory (`~/.kimi-code` / `~/.kimi` by default, overridable via `KIMI_DATA_DIR`).
- Implementation must be fail-safe: missing files, malformed JSONL, or changed wire formats must not crash the dashboard.
- Synchronous I/O is acceptable inside the adapter because the read is bounded to a tail of the file.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Kimi wire format is experimental and may change | Medium | Gate every field access, fall back to "unavailable" if the expected shape is not found. |
| Directory walk could be slow with many sessions | Low | Limit glob depth, cache the resolved wire path per session, and read only a bounded tail. |
| Reading files from the user's home directory raises privacy concerns | Low | Apply the same containment rules as Codex transcripts and do not store raw wire content. |

## Success Criteria

- [ ] After a Kimi Code session writes its wire log, the dashboard Telemetry panel shows `quality: 'measured'` without manual ingestion. → verified by T1, T2
- [ ] The implementation passes the dashboard server test suite with 0 failures. → verified by T4
