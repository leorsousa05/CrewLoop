> 🏗️ **CrewLoop Plan**

# Design — Kimi usage ingestion

## Architecture

```
┌─────────────────┐      POST /ingest/usage      ┌──────────────────┐
│  crewloop-      │ ───────────────────────────> │  Dashboard       │
│  ingest-kimi    │  { session_id, model, usage }│  /ingest/usage   │
│  (helper script)│                              │  handler         │
└─────────────────┘                              └────────┬─────────┘
                                                          │
                            ┌─────────────────────────────┼─────────────┐
                            │                             │             │
                            ▼                             ▼             ▼
                   normalizeTokenUsage()          StateStore.applyEvent()  broadcast()
                   (existing aliases)               (creates/updates        (update message
                                                   session, merges          to WebSocket
                                                   token_usage)             clients)
```

## New and changed files

| File | Change |
|------|--------|
| `servers/dashboard/src/api/usage.ts` | New endpoint handler for `POST /ingest/usage`. |
| `servers/dashboard/src/server.ts` | Register `/ingest/usage`; add to sensitive-route list. |
| `servers/dashboard/src/ingest/kimi.ts` | Helper that reads JSON from stdin and POSTs to `/ingest/usage`. |
| `servers/dashboard/bin/crewloop-ingest-kimi.js` | Compiled bin wrapper for `crewloop-ingest-kimi`. |
| `servers/dashboard/package.json` | Add `bin` entry for `crewloop-ingest-kimi`. |
| `servers/dashboard/src/tests/usage.test.ts` | Tests for the endpoint and helper. |
| `servers/dashboard/src/tests/adapters.test.ts` | Keep the new boundary-validation regression test. |

## Contracts

### `POST /ingest/usage` request body

```typescript
interface IngestUsageRequest {
  session_id: string;
  source?: 'kimi';           // default 'kimi'; validated against AgentSource
  model?: string;            // e.g. 'kimi-k3'
  timestamp?: number;        // epoch ms; default Date.now()
  usage: {
    // Any of the aliases supported by the Kimi alias set
    input_tokens?: number;
    inputTokens?: number;
    prompt_tokens?: number;
    promptTokens?: number;
    output_tokens?: number;
    outputTokens?: number;
    completion_tokens?: number;
    completionTokens?: number;
    cache_read_input_tokens?: number;
    cacheReadInputTokens?: number;
    cached_tokens?: number;
    cachedTokens?: number;
    cache_creation_input_tokens?: number;
    cacheWriteInputTokens?: number;
    reasoning_tokens?: number;
    reasoningTokens?: number;
    total_tokens?: number;
    totalTokens?: number;
  };
}
```

### Internal flow

1. Read and parse JSON body with the same size limit as `/event`.
2. Validate `session_id` is present and `source` is a known `AgentSource`.
3. Normalize `usage` with `normalizeTokenUsage({
     source,
     rawUsage: usage,
     model,
     eventId: `${session_id}:ingest:${nanoid-like}`,
     capturedAt: timestamp,
     semantics: 'cumulative',
     aliases: TOKEN_USAGE_ALIASES,
   })`.
4. If normalization fails, return `400` with `error: 'Invalid usage'`.
5. Create or update the session:
   - If the session does not exist, synthesize a `session_start` event so `StateStore` has a session.
   - Build a synthetic `DashboardEvent` with `event_type: 'skill_change'` (non-lifecycle, will not end the session) and the normalized `token_usage`.
6. Apply the event to `StateStore` and broadcast an update.
7. Return `200 { ok: true }`.

### `crewloop-ingest-kimi` script

```bash
# Reads a JSON object from stdin and forwards it.
echo '{"session_id":"abc","model":"kimi-k3","usage":{"prompt_tokens":100,"completion_tokens":50,"total_tokens":150}}' \
  | crewloop-ingest-kimi
```

The script:
- Reads stdin to EOF.
- Parses JSON and validates required fields (`session_id`, `usage`).
- POSTs to `CREWLOOP_DASHBOARD_URL` (default `http://127.0.0.1:7890`).
- Exits `0` on `200`, `1` on failure, writing `error:` messages to stderr.

## Security

- The route is in the sensitive-route list, so it is protected by the local Host policy.
- The handler rejects unknown `source` values.
- The handler uses the existing `sanitizeEventBoundary` check before processing.

## Edge cases

| Case | Behavior |
|------|----------|
| Session does not yet exist | Create it with a synthetic `session_start` and then apply the usage event. |
| Duplicate ingestion (same measurementId) | Rejected by `mergeTokenUsage` with reason `'duplicate'`; session total unchanged. |
| Invalid token count (negative, float) | `normalizeTokenUsage` returns `undefined`; endpoint returns `400`. |
| Missing `session_id` | `400` with `error: 'Missing session_id'`. |
| Unknown `source` | `400` with `error: 'Invalid source'`. |
| Payload too large | `413` with `code: 'PAYLOAD_TOO_LARGE'`. |

## Backwards compatibility

- No changes to existing `/event` behavior.
- Existing Kimi hook events continue to work as before.
- The new endpoint is additive only.
