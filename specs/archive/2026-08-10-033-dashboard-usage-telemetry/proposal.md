# Proposal: Durable Dashboard Usage Telemetry

## Problem Statement

The dashboard's Overview includes a redundant Skill Activity graph, while token telemetry is held only in memory and disappears after restart or session pruning. Users cannot compare coding-agent products over time. Codex and Kimi provide measurable counters today, but Claude, OpenCode, and AGY either expose different usage surfaces or no counters in the existing adapters. The dashboard also has no durable deduplication boundary, so persisting cumulative snapshots naively would double-count usage.

## Goals

1. Remove only the redundant Overview Skill Activity section while retaining the Skills view and active-skill status.
2. Persist normalized token measurements and accepted deltas in a local SQLite database without storing prompts, commands, tool payloads, or transcript content.
3. Add a seventh Usage view that compares daily token consumption by coding-agent product over an inclusive 30-day local-calendar window by default.
4. Expand verified usage collection for Codex, Kimi, Claude, OpenCode, and AGY, while distinguishing unavailable telemetry from measured zero.
5. Show optional estimated API-equivalent USD when an exact model price or provider-reported cost exists, with explicit coverage and quality labels.
6. Keep history indefinitely until the user performs an explicit manual reset.

## Non-Goals

- Reconstructing usage from prompts, tool text, file contents, or tokenizer guesses.
- Claiming subscription, seat, negotiated, regional, batch, or priority-tier charges as actual billing.
- Persisting general dashboard events, sessions, source transcripts, raw usage JSON, workspace paths, or credentials.
- Adding remote or multi-user dashboard access.
- Treating the internal `log-watcher` transport as a coding-agent product.
- Guaranteeing telemetry where an upstream product exposes no verified counter or stable identifier.

## Constraints

- Specs 029-031 define the event, client-state, and responsive accessibility baselines and must land first.
- The new route extends ADR 003's hash-routing and single-registry model; it must not introduce a router dependency.
- SQLite access must remain compatible with the dashboard's declared Node 18 floor and the current Node 20 development environment.
- Database and usage APIs remain inside ADR 005's loopback trust boundary.
- Token totals reported by providers are authoritative; cache and reasoning categories may overlap and must not be added to `totalTokens`.
- Monetary values are labeled `Estimated API-equivalent USD`, never actual spend.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cumulative snapshots are counted twice after restart | High | Durable measurement IDs and cursor updates in one SQLite transaction |
| A counter crosses midnight between snapshots | Medium | Attribute the accepted delta to the capture day and disclose capture-day attribution |
| Native SQLite package fails to install | High | Pin a Node-18-compatible `better-sqlite3` release and verify supported prebuild targets |
| Product collectors rely on unstable transcript formats | High | Require bounded readers, sanitized fixtures, fail-open behavior, and generic external ingestion fallback |
| Estimated cost is mistaken for a bill | High | Use explicit API-equivalent labels, immutable price snapshots, nullable estimates, and coverage status |
| Existing active specs overwrite seven-view documentation | Medium | Make spec 032 depend on this change and update its six-view assumptions |
| Unlimited retention grows the database | Medium | Store only normalized numeric facts, index bounded queries, and provide explicit reset |

## Success Criteria

- [ ] Duplicate or replayed cumulative measurements remain idempotent across process restarts. -> T2, T3
- [ ] Daily totals group accepted deltas by product and the database's pinned local timezone. -> T2, T4
- [ ] Codex, Kimi, Claude, OpenCode, and AGY have verified collector/fallback contracts; unavailable products never appear as zero. -> T5-T7
- [ ] Exact known-model or reported costs are stored as immutable micro-USD snapshots; unknown pricing returns `null`. -> T8
- [ ] Overview no longer renders Skill Activity and its remaining content has no empty desktop grid column. -> T9
- [ ] `#/usage` compares products across 7/30/90-day and all-history ranges with accessible loading, empty, partial, stale, error, and success states. -> T9, T10
- [ ] Manual reset clears visible history without allowing the next cumulative snapshot to restore pre-reset totals. -> T2, T4
- [ ] Dashboard and CLI typechecks, builds, tests, security scan, and responsive/accessibility checks pass. -> T12
