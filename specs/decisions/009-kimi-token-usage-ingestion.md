# ADR 009: External token-usage ingestion for Kimi

- **Status:** accepted
- **Date:** 2026-08-08
- **Related spec:** `specs/changes/001-kimi-token-telemetry/`

## Context

Kimi Code hooks expose the tool lifecycle (`PreToolUse`, `PostToolUse`) and session lifecycle (`SessionStart`, `SessionEnd`, `Stop`), but they do **not** include token-usage counters. The CrewLoop dashboard already has a complete token-usage pipeline — normalization, validation, aggregation, and presentation — but it cannot display Kimi usage because the data never arrives through the hook path. We needed a way to feed Moonshot-style usage into a dashboard session without coupling the dashboard to the Moonshot API.

## Decision

We will expose a new local-only `POST /ingest/usage` endpoint on the dashboard and ship a small `crewloop-ingest-kimi` helper script. The endpoint accepts a session id, optional model, and a Moonshot-compatible `usage` object, normalizes it with the same alias set used by the Kimi adapter, and merges it into the matching session's token telemetry. The helper script reads that payload from stdin and forwards it to the dashboard, so users can wire it into their own Moonshot API integration or logging pipeline.

## Alternatives Considered

| Alternative | Why rejected |
|-------------|--------------|
| Add a Moonshot API client inside the dashboard | Requires API keys, request correlation, and polling — too heavy and invasive for a dashboard. |
| Estimate tokens from tool input/output | Inaccurate, model-dependent, and would mislead users about cost. |
| Document the limitation only | Does not solve the user's need to see Kimi token usage in the dashboard. |
| Reuse `POST /event` with a synthetic event | Possible, but a dedicated endpoint is clearer, easier to secure, and keeps `/event` focused on agent hook events. |

## Consequences

- **Positive:** Kimi users can now populate the dashboard Telemetry panel by forwarding their existing Moonshot API usage responses.
- **Positive:** The change is additive and reuses the existing token aggregation logic.
- **Negative:** Users must run the ingestion helper themselves or integrate the POST call; it is not automatic from Kimi Code hooks.
- **Irreversibility:** The endpoint becomes part of the dashboard's public local API. Removing it later would break any user integrations, so it should be kept stable or deprecated with notice.

## References

- `specs/changes/001-kimi-token-telemetry/design.md`
- Kimi Code CLI hooks documentation: `https://www.kimi.com/code/docs/en/kimi-code-cli/customization/hooks.html`
- Moonshot API chat-completion response format: `https://platform.moonshot.ai/docs/api/chat`
