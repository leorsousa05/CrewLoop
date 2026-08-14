# Specs — How Each Folder Works

> Quick map of the specs system. Canonical rules live in `references/conventions.md` (§Spec Folder Structure) and `references/workflow.md` — when in doubt, those win.

| Folder | Purpose | Who writes | Who reads (and when) |
|--------|---------|-----------|----------------------|
| `features/` | **The real work.** One spec = one task, per domain (`NN-name/`). Single-file specs that stay as the source of truth when completed. | CrewLoop Plan (before any code) | CrewLoop Code (implements), CrewLoop Review (compliance check), Plan (discovery) |
| `changes/` | **RFCs only.** Proposals under discussion. Nothing here is implemented. | CrewLoop Plan (architecture changes) | User/team (discussion); approved → `shared/adrs/`, rejected → `archive/` |
| `memory/` | **Project brain.** `project-state.md` (always read), chat-logs, decisions, incidents. | Plan, Ship (updates) | Every skill at session start; Plan at session end |
| `shared/` | **Stable references.** Glossary, tech-stack, conventions, architecture overview, ADRs. Referenced by link, never copied. | Plan (from approved RFCs / decisions) | Everyone, when a spec links it |
| `templates/` | Blueprints: feature-spec, RFC, ADR, task-prompt. Canonical copies in `skills/crewloop-plan/references/templates/`. | Synced from the plan skill | Plan when scaffolding a new spec/RFC/ADR |
| `archive/` | Dead ideas, rejected RFCs, and legacy completed specs — kept for audit with a README index of *why*. | Plan (rejected RFCs), Ship | Anyone; the AI points to the README instead of re-reading the folder |

## When to create what

- **Every task** (even a 1-line fix) → a single-file feature spec in `features/<domain>/spec-NN-name.md`.
- **Architecture or cross-cutting change** → an RFC in `changes/rfc-NNN-name.md` first; approved RFCs become ADRs.
- **Task shipped (Review PASS)** → Ship marks the feature spec `status: completed` + date, appends a chat-log, updates `project-state.md`. The spec **stays** in `features/`.
- **Dead proposal** → moves to `archive/` with a reason in `archive/README.md`.
- **Never** place spec files directly in `specs/` — always in a subfolder above.
