# Proposal: Show tool input/output in dashboard timeline

## Problem

The dashboard timeline renders each tool invocation with an expandable row that can display `Input` and `Output` payloads (see `TimelineRow.tsx`). However, the events produced by `crewloop-shim` do not carry `input` or `output` fields, so `TimelineRow` always shows "No details available." even though the agent sent `tool_input` and `tool_response` in the hook payload.

Root cause:

- `servers/dashboard/src/adapters/kimi.ts` and `codex.ts` build `DashboardEvent` objects without `input`/`output`.
- `servers/dashboard/src/adapters/shim.ts` `buildEvent()` only forwards `detail`, `status`, and `duration_ms` from the raw payload; it drops `tool_input`/`tool_response`.

## Goal

Forward `tool_input` as `input` and `tool_response` as `output` in the `DashboardEvent` so the timeline can display them.

## Scope

- Update `normalizeKimi()` to include `input`/`output` from `tool_input`/`tool_response`.
- Update `normalizeCodex()` to include `input`/`output` from `toolInput`/`toolResponse`.
- Ensure `buildEvent()` preserves these fields in the final event.
- Add/update tests for both adapters and the shim binary.

## Non-goals

- No UI changes; `TimelineRow` already supports input/output display.
- No new sanitization or redaction beyond the existing `sanitizeEventBoundary` check.
