# Obsidian MCP Second Brain — Usage for Agents

This document explains how the Loop Engineering Agents team should use the local Obsidian MCP server (`servers/obsidian-mcp`).

## What It Is

A local MCP server exposes a vault at `~/.lea` as a second brain. The AI can:

- Search existing knowledge (bundle + vault notes).
- Read notes.
- Create and update notes.
- Learn from conversation text automatically via `learn_from_text`.

## Vault Architecture

The vault follows a **three-layer memory architecture**. Every skill in the bundle that reads from or writes to `~/.lea` must use these layers.

```
~/.lea/
├── AGENT.md              # Entry point: read this first
├── MEMORY.md             # Curated memory: read at session start
├── memory/               # Working memory: raw session logs
├── Memory/               # Durable user profile and preferences
├── Knowledge/            # Long-lived technical guides and decisions
├── Journal/              # Session logs and dashboards worth keeping
├── Notes/                # Temporary notes, drafts, and research
└── _Inbox/               # Agent proposals before promotion
```

### Layer Semantics

| Layer | Path | When to Use |
|-------|------|-------------|
| Agent entry | `AGENT.md` | Read once per session before using the vault. |
| Curated memory | `MEMORY.md` | Read at the start of every major task. Soft cap ~500 words. |
| Working memory | `memory/` | Append raw, timestamped session logs. Pattern: `YYYY-MM-DD-HHMM.md`. |
| User profile | `Memory/` | Durable facts about the user: role, preferences, goals. |
| Knowledge | `Knowledge/` | Durable technical guides, architectural decisions, reusable docs. |
| Journal | `Journal/` | Important session outcomes, project briefs, dashboards. |
| Notes | `Notes/` | Temporary scratchpads, drafts, research not yet canonical. |
| Inbox | `_Inbox/` | Proposed new canonical notes. Auto-promotion is allowed. |

### Session Start

1. Call `sync_from_bundle` once per session.
2. Read `AGENT.md`.
3. Read `MEMORY.md`.
4. Search targeted layers based on the user's question.

### Layer Selection Rules

```
User asks a question
    ↓
Read AGENT.md and MEMORY.md
    ↓
Durable concept or guide?       → search Knowledge/
User preference or identity?    → search Memory/
Recent session or decision?     → search Journal/
Raw log of current conversation? → append to memory/
Proposing new canonical knowledge? → create in _Inbox/
```

### Heartbeat / Distillation

Every 2-4 sessions (or at the end of a significant task), the agent should:

1. Read recent files in `memory/`.
2. Update `MEMORY.md` with distilled, short-term-relevant facts.
3. Promote durable facts from `_Inbox/` to `Memory/`, `Knowledge/`, `Journal/`, or `Notes/`.
4. Archive or delete obsolete raw logs.

Keep `MEMORY.md` under ~500 words. If it grows, move long-lived facts to `Knowledge/` or `Memory/` and keep only active context in `MEMORY.md`.

## Available MCP Tools

| Tool | Purpose |
|------|---------|
| `search_notes` | Find relevant notes. Prefer `mode: "hybrid"`. |
| `read_note` | Read a specific note by path. |
| `create_note` | Create a new note in the correct layer. |
| `update_note` | Append or replace content. Use `append` to preserve history. |
| `delete_note` | Remove a note. Use sparingly. |
| `list_notes` | List notes, optionally filtered by folder. |
| `get_related_notes` | Explore graph relationships from a note. |
| `sync_from_bundle` | Re-index the skill bundle and local vault. |
| `learn_from_text` | Detect concepts/decisions in text and auto-create notes. |

## Note Paths

Use English folder names and English note content:

- `Memory/profile-user.md`
- `Knowledge/obsidian-mcp-setup.md`
- `Journal/2026-06-15-project-brief.md`
- `Notes/2026-06-15-ml-concepts.md`
- `_Inbox/proposed-knowledge-2026-06-15.md`

## Privacy Rules

Never persist in the vault:

- API keys, secrets, tokens, passwords
- Private keys or certificates
- `.env` contents
- Personal identifiable information (PII)

The server has a privacy filter, but avoid sensitive input regardless. Review working memory before promoting anything to curated or structured layers.

## Configuration Reminder

The server must be installed and added to the agent's MCP config:

```toml
[mcpServers.obsidian-mcp]
command = "/path/to/servers/obsidian-mcp/.venv/bin/python"
args = ["-m", "obsidian_mcp.main"]
```

See `servers/obsidian-mcp/README.md` for full setup instructions.

## Migration from Flat Folders

Old flat folders (`concepts/`, `decisions/`, `projects/`, `dashboards/`) should be migrated to the new layers:

- `concepts/` → `Knowledge/` (durable) or `Notes/` (transient)
- `decisions/` → `Knowledge/`
- `projects/` → `Journal/` (active) or `Knowledge/` (reference)
- `dashboards/` → `Journal/`

## Per-Skill Memory Targets

Each skill in the bundle should read from and write to the layers relevant to its role. See `skills/obsidian-second-brain/SKILL.md` for tool usage details.

| Skill | Read at start | Persist at end |
|-------|---------------|----------------|
| `orchestrator` | `MEMORY.md`, `Memory/preferences.md` | User priorities/context to `MEMORY.md`; unclear items to `_Inbox/` |
| `architect` | `Knowledge/`, `Memory/`, `Journal/decisions*` | Specs rationale to `Knowledge/`; ADRs to `Knowledge/` |
| `designer` | `Memory/preferences.md`, `Journal/design*`, `Knowledge/brand*` | Design direction to `Journal/`; reusable systems to `Knowledge/` |
| `engineer` | `Knowledge/`, `Journal/`, `Memory/` | Implementation notes to `Journal/`; reusable patterns to `Knowledge/` |
| `reviewer` | `Knowledge/conventions*`, `Journal/decisions*`, `Memory/` | Review findings to `Journal/`; process updates to `Knowledge/` |
| `shipper` | `Knowledge/conventions*`, `Memory/preferences.md` | Shipping log to `Journal/` |
| `docs-writer` | `Knowledge/`, `Memory/preferences.md`, `Journal/` | New/updated docs to `Knowledge/` |
| `researcher` | `Knowledge/`, `Journal/` | Research summaries to `Knowledge/` or `_Inbox/` |
| `maintainer` | `Knowledge/`, `Journal/incidents*` | Incident/debt notes to `Journal/`; runbooks to `Knowledge/` |
| `product-manager` | `Memory/preferences.md`, `Journal/`, `Knowledge/` | Decisions/metrics to `Knowledge/` or `Journal/` |
| `tester` | `Knowledge/`, `Journal/bugs*` | Test strategies/heuristics to `Knowledge/` |
