> 🏗️ **CrewLoop Plan**

# Design — Automatic Kimi token telemetry from wire logs

## Overview

Mirror the Codex transcript fallback pattern already in `servers/dashboard/src/adapters/codex-session.ts`. Add a Kimi-specific reader that discovers a session's `wire.jsonl` under the Kimi data directory, tails the file, and extracts the latest turn-scoped usage record. Wire this reader into `normalizeKimi` as a fallback when the hook payload itself carries no `usage` object.

## Assumptions & Defaults

- **Kimi data directory resolution:** default to `~/.kimi-code`, then fall back to `~/.kimi`; allow override via the `KIMI_DATA_DIR` environment variable (comma-separated list supported, matching `ccusage`). Chose this because it is the documented layout and requires no Kimi Code configuration changes.
- **Session ID matching:** search for directories named exactly like the hook `session_id` under `<data-dir>/sessions/**`. Chose this because the `session_id` is the only stable correlation key available in Kimi hooks.
- **File selection when multiple matches exist:** pick the most recently modified `wire.jsonl`. Chose this because a session may have multiple agent subdirectories (`agents/<agent-id>/wire.jsonl`).
- **Usage semantics:** treat wire usage as `cumulative` snapshots, identical to Codex transcripts. Chose this because the records represent per-turn cumulative totals in the Kimi wire format.

## Proposed Directory & File Structure

```
servers/dashboard/src/adapters/
├── kimi.ts                    # modify: add wire-log fallback
├── kimi-session.ts            # new: discover + read Kimi wire logs
├── kimi-session.test.ts       # new: unit tests
├── shim.ts                    # modify: pass Kimi data dir / sessions root
└── codex-session.ts           # unchanged (reference pattern)
servers/dashboard/src/
├── config.ts                  # modify: expose resolved Kimi data dir
└── types.ts                   # modify: add sessionsRoot to normalization options if needed
```

## File-by-File Changes

| File | Action | What changes | Design ref |
|------|--------|--------------|------------|
| `src/adapters/kimi-session.ts` | Create | Discovery, tail read, and parsing of Kimi `wire.jsonl` usage records. | §Contracts |
| `src/adapters/kimi-session.test.ts` | Create | Tests for parser, discovery, path containment, symlink escape, malformed lines. | §Edge Cases |
| `src/adapters/kimi.ts` | Modify | Fall back to `readKimiSessionTokenUsage` when the hook payload has no usable `usage`. | §Integration |
| `src/adapters/shim.ts` | Modify | Pass `kimiDataDir` / `sessionsRoot` through to `normalizeKimi`. | §Integration |
| `src/config.ts` | Modify | Resolve and expose `kimiDataDir` in `ServerConfig`. | §Configuration |
| `src/types.ts` | Modify | Add optional `kimiDataDir` to `KimiNormalizationOptions` if an options object is introduced. | §Contracts |
| `src/tests/adapters.test.ts` | Modify | Keep existing `normalizeKimi` tests green; add a regression test for wire-log fallback. | §Verification |

## Code Architecture & Design Patterns

- **Adapter pattern:** `kimi-session.ts` is a focused I/O adapter, analogous to `codex-session.ts`.
- **Fail-safe parser:** every JSONL line is parsed inside `try/catch`; malformed or oversized lines are skipped.
- **Path containment:** the discovered `wire.jsonl` path is resolved with `fs.realpathSync` and verified to be inside the configured Kimi data dir before reading.

## Data Model & Interfaces

```typescript
// servers/dashboard/src/adapters/kimi-session.ts
export interface ReadKimiSessionUsageInput {
  sessionId: string;
  model?: string;
  kimiDataDir?: string;        // single root or first of comma-separated list
  maxTailBytes?: number;
  maxLineBytes?: number;
}

export interface KimiWireUsageRecord {
  type: 'usage.record';
  timestamp?: string;          // ISO-8601; fallback to file mtime if missing
  usage?: {
    inputOther?: number;
    output?: number;
    inputCacheRead?: number;
    inputCacheCreation?: number;
    total?: number;
  };
}
```

```typescript
// servers/dashboard/src/adapters/kimi.ts
export interface KimiNormalizationOptions {
  kimiDataDir?: string;
}

export function normalizeKimi(
  payload: KimiHookPayload,
  options?: KimiNormalizationOptions
): DashboardEvent | undefined;
```

## Integration Flow

```
Kimi hook event arrives
        │
        ▼
normalizeKimi(payload, options)
        │
        ├── direct usage from payload.usage ?
        │       └── yes → use it
        │
        └── no  → readKimiSessionTokenUsage({ sessionId, model, kimiDataDir })
                    │
                    ├── discover wire.jsonl under <kimiDataDir>/sessions/**/SESSION_ID/**/wire.jsonl
                    ├── verify path containment
                    ├── read bounded tail
                    ├── parse latest usage.record line
                    └── normalizeTokenUsage({ source: 'kimi', semantics: 'cumulative', aliases: KIMI_WIRE_ALIASES })
```

## Edge Case & Error Handling Matrix

| Scenario / Input | Expected Behavior | Return Value |
|------------------|-------------------|--------------|
| `session_id` missing or `'unknown'` | Skip discovery, no fallback | `token_usage: undefined` |
| Kimi data dir does not exist | Fail open | `token_usage: undefined` |
| No `wire.jsonl` matches the session ID | Fail open | `token_usage: undefined` |
| Multiple `wire.jsonl` files match | Pick most recently modified | normalized usage or `undefined` |
| Discovered path is outside the data dir | Reject (path traversal protection) | `token_usage: undefined` |
| Symlink escapes the data dir | Reject | `token_usage: undefined` |
| Wire line exceeds `maxLineBytes` | Skip line | continue scanning |
| usage.record has zero or malformed counters | `normalizeTokenUsage` rejects | `token_usage: undefined` |
| Wire format changes and `usage.record` no longer exists | No matching line found | `token_usage: undefined` |

## State Management & Caching

- No persistent state is required.
- Cache the resolved `wire.jsonl` path per `sessionId` for the lifetime of the process to avoid repeated directory walks. Use a simple in-memory `Map<string, string | undefined>`.

## Performance Considerations

- Read only the tail of the wire file (default 256 KB, max 1 MB), same as Codex.
- Limit glob depth to a reasonable value (e.g., 6) to avoid deep traversal.
- Cache the discovered path per session.

## Security Considerations

- Apply `fs.realpathSync` + `isContainedPath` identical to `codex-session.ts`.
- Never broadcast or store raw wire content; only the normalized `TokenUsageMeasurement` is forwarded.
- Reject files that are not named exactly `wire.jsonl`.
