# Obsidian Second Brain — Three-Layer Memory Architecture

> Living specification for the `~/.lea` vault used by the Loop Engineering Agents bundle.

## Overview

The local Obsidian vault at `~/.lea` follows a three-layer memory architecture. The goal is to reduce token usage, improve selective retrieval, and give every skill in the bundle a consistent pattern for reading and writing knowledge.

## Vault Layout

```
~/.lea/
├── AGENT.md              # Entry point: read first
├── MEMORY.md             # Curated memory: read at task start
├── memory/               # Working memory: raw session logs
├── Memory/               # Durable user profile and preferences
├── Knowledge/            # Long-lived technical guides and decisions
├── Journal/              # Important session logs and dashboards
├── Notes/                # Temporary notes and drafts
└── _Inbox/               # Agent proposals before promotion
```

## Layer Semantics

| Layer | Path | Volatility | Read Frequency | Contents |
|-------|------|------------|----------------|----------|
| Agent entry | `AGENT.md` | Low | Once per session | Navigation rules for the vault. |
| Curated memory | `MEMORY.md` | Medium | Every major task | Distilled user/project context, ~500 words. |
| Working memory | `memory/` | High | Last 1-2 days | Raw session logs (`YYYY-MM-DD-HHMM.md`). |
| User profile | `Memory/` | Low | On demand | User facts, preferences, goals. |
| Knowledge | `Knowledge/` | Low | On demand | Technical guides, decisions, reusable docs. |
| Journal | `Journal/` | Medium | On demand | Session outcomes, briefs, dashboards. |
| Notes | `Notes/` | High | On demand | Temporary scratchpads and drafts. |
| Inbox | `_Inbox/` | High | During heartbeat | Proposed canonical notes. |

## Session Start

1. Call `sync_from_bundle` once per session.
2. Read `AGENT.md`.
3. Read `MEMORY.md`.
4. Search targeted layers based on the user's question.

## Layer Selection Rules

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

## Heartbeat / Distillation

Every 2-4 sessions, or at the end of a significant task:

1. Read recent files in `memory/`.
2. Update `MEMORY.md` with distilled, short-term-relevant facts.
3. Promote `_Inbox/` notes to `Memory/`, `Knowledge/`, `Journal/`, or `Notes/`.
4. Archive or delete obsolete raw logs.

Keep `MEMORY.md` under ~500 words. Move long-lived facts to `Knowledge/` or `Memory/`.

## Note Conventions

- All folder names and note content are in English.
- Use frontmatter with `type`, `title`, `tags`, and `updated`.
- Use Obsidian wikilinks (`[[note]]`) to connect related notes.
- Never store secrets, API keys, tokens, passwords, or PII in any layer.

## Migration from Flat Folders

Old flat folders map to the new layers as follows:

- `concepts/` → `Knowledge/` (durable) or `Notes/` (transient)
- `decisions/` → `Knowledge/`
- `projects/` → `Journal/` (active) or `Knowledge/` (reference)
- `dashboards/` → `Journal/`

## References

- `references/obsidian-mcp-usage.md` — agent usage guide
- `skills/obsidian-second-brain/SKILL.md` — skill instructions
- `specs/decisions/002-three-layer-memory-architecture.md` — ADR
