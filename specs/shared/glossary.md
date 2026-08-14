# Glossary

> Shared vocabulary. Feature specs and RFCs reference these terms by link, never by redefinition.

| Term | Definition |
|------|------------|
| **CrewLoop** | A team of AI skills that operate as a role-separated software development workflow. |
| **Skill** | A specialist role (plan, design, code, review, ship, docs) distributed as a `SKILL.md` file. |
| **Feature spec** | A single-file task contract in `specs/features/<domain>/spec-NN-name.md`. One spec = one task. The canonical source of truth while implementing. |
| **RFC** | A change proposal in `specs/changes/rfc-NNN-name.md`, under discussion, never implemented directly. |
| **ADR** | Architectural Decision Record in `specs/shared/adrs/adr-NNN-name.md` — an accepted, irreversible architecture choice. |
| **Domain** | A bounded context folder in `specs/features/` (e.g. `02-dashboard`). |
| **Project state** | `specs/memory/project-state.md` — the always-read status file (modules, decisions, blockers, next task). |
| **Chat-log** | A 10-20 line session summary in `specs/memory/chat-logs/YYYY-MM-DD-topic.md`. |
| **Incident** | A post-mortem in `specs/memory/incidents/YYYY-MM-DD-topic.md`. |
| **Agent** | A client AI tool (Kimi Code, Claude, Codex, AGY, OpenCode) that CrewLoop instruments. |
| **Hook** | An agent-native callback (PreToolUse/PostToolUse etc.) that forwards tool events to the dashboard. |
| **Shim** | `crewloop-shim` — the binary that reads agent payloads, normalizes them, and POSTs to the dashboard. |
| **Dashboard** | The real-time session/tool/usage visualization server (`servers/dashboard/`). |
| **CLI** | `crewloop` — the installer CLI (`packages/cli/`). |
| **AFK mode** | Continuous workflow mode where skills auto-route without user navigation prompts. |
| **Transition contract** | The deterministic outgoing route per skill, defined in `references/skill-contracts.yaml`. |
