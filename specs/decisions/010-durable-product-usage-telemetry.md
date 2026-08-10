# ADR 010: Durable Product Usage Telemetry in SQLite

- **Status:** accepted
- **Date:** 2026-08-10
- **Related spec:** `specs/archive/2026-08-10-033-dashboard-usage-telemetry/`

## Context

The dashboard currently treats session memory as the only token-usage store. Restart and pruning erase history, and cumulative provider snapshots cannot be safely summed without durable cursors. The product needs daily comparison across coding agents while preserving the local trust boundary and avoiding storage of prompts, commands, transcripts, and other sensitive telemetry. The dashboard supports Node 18, so the built-in `node:sqlite` module added in Node 22.5 is not available across the supported range.

## Decision

We will store normalized token deltas, durable cumulative cursors, materialized session/day aggregates, immutable cost-estimate snapshots, and reset watermarks in a local SQLite database accessed through a repository port. The adapter will use the pinned Node-18-compatible `better-sqlite3@11.10.0` release. One transaction will deduplicate a measurement, calculate its accepted delta, advance its cursor, and update aggregates. SQLite is authoritative for usage history; in-memory state remains authoritative for live general events. The database stores product identifiers and hashed session IDs but no raw agent or workspace content.

## Alternatives Considered

| Alternative | Why rejected |
|-------------|--------------|
| Keep history in memory | Loses data on restart/prune and cannot provide durable daily comparison |
| Persist only daily totals | Cannot safely deduplicate cumulative snapshots or recover cursor state after restart |
| Persist all dashboard events | Violates data minimization and retains unnecessary prompts/tool payloads |
| Built-in `node:sqlite` | Requires Node 22.5+ and would break the declared Node 18/20 environment |
| `sqlite3` package | The current package is deprecated/unmaintained and its callback API conflicts with the synchronous state path |
| `sql.js` | Keeps the database in memory and requires whole-file export for persistence |
| JSON files | Lacks transactional cursor/aggregate updates, indexed date queries, and robust concurrent access |

## Consequences

- **Positive:** Daily usage survives restarts, cumulative replay is idempotent, reads stay bounded, and the database remains inspectable with standard SQLite tools.
- **Positive:** A repository port allows in-memory test doubles and a future driver migration without changing product contracts.
- **Positive:** Data minimization is explicit: only numeric usage facts, model metadata, product, dates, pricing version, and hashed session identity persist.
- **Negative:** `better-sqlite3` is a native dependency and requires prebuilt-binary verification on supported platforms.
- **Negative:** A cumulative delta captured after midnight is assigned wholly to its capture day because upstream snapshots lack finer timestamps.
- **Negative:** Unlimited retention requires a manual reset and may grow over long periods.
- **Irreversibility:** The local API and on-disk migration contract become user-visible compatibility surfaces; future schema changes must be forward migrations rather than destructive replacement.

## References

- [Node.js SQLite documentation](https://nodejs.org/api/sqlite.html)
- [better-sqlite3 documentation](https://github.com/WiseLibs/better-sqlite3)
- [OpenAI API pricing](https://openai.com/api/pricing/)
- [Anthropic API pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- `specs/decisions/003-dashboard-ui-navigation-model.md`
- `specs/decisions/005-dashboard-local-trust-boundary.md`
- `specs/decisions/009-kimi-token-usage-ingestion.md`
