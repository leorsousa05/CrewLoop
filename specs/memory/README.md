# memory/ — Project Brain

This folder is the persistent memory of the project. It answers "where are we, what did we decide, what did we try" without re-reading the whole repository.

| Subfolder | Purpose | Naming |
|-----------|---------|--------|
| `project-state.md` | Always-read status: module table, recent decisions, blockers, next task | single file |
| `chat-logs/` | 10-20 line session summaries (what was done, what was decided) — never full transcripts | `YYYY-MM-DD-topic.md` |
| `decisions/` | Lightweight rationale notes ("why X, not Y") that do not warrant a full ADR | `why-topic.md` |
| `incidents/` | Post-mortems: what broke, why, what changed to prevent recurrence | `YYYY-MM-DD-topic.md` |

Rules:

- `project-state.md` is the **only file read on every session**.
- Chat-logs are summaries, not transcripts. If a decision changes architecture, promote it to `shared/adrs/` or `memory/decisions/`.
- When a feature spec is completed, `crewloop:ship` appends a chat-log entry and updates `project-state.md`.
