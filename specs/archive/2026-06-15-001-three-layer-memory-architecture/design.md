# Design: Three-Layer Memory Architecture for Obsidian RAG

## Overview

Introduce a layered-memory model for the local Obsidian vault (`~/.lea`) so the agent can retrieve context selectively, persist durable knowledge, and avoid reading the entire vault on every session. The design is Markdown-native, uses Obsidian wikilinks, and remains Git-friendly.

## Proposed Directory & File Structure

```
~/.lea/
├── AGENT.md                      # Entry instructions for agents
├── MEMORY.md                     # Curated memory, read at session start
├── memory/                       # Raw working-memory session logs
│   ├── 2026-06-15-1830.md
│   └── 2026-06-15-2100.md
├── Memory/                       # Durable user profile & preferences
│   ├── profile-user.md
│   └── preferences.md
├── Knowledge/                    # Long-lived technical guides
│   ├── obsidian-mcp-setup.md
│   ├── conventional-commits.md
│   └── three-layer-memory.md
├── Journal/                      # Session logs worth keeping
│   ├── 2026-06-15-project-brief.md
│   └── migration-manifest.md
├── Notes/                        # Temporary notes and drafts
│   └── 2026-06-15-ml-concepts.md
└── _Inbox/                       # Agent proposals for promotion
    ├── proposed-knowledge-2026-06-15.md
    └── proposed-profile-update-2026-06-15.md
```

Repository files to create or modify:

```
loop-engineering-agents/
├── skills/
│   └── obsidian-second-brain/
│       └── SKILL.md              # MODIFIED
├── references/
│   ├── obsidian-mcp-usage.md     # MODIFIED
│   └── ...
├── servers/
│   └── obsidian-mcp/
│       └── README.md             # MODIFIED
└── specs/
    ├── changes/
    │   └── 001-three-layer-memory-architecture/
    │       ├── .spec.yaml
    │       ├── proposal.md
    │       ├── specs/spec.md
    │       ├── design.md
    │       └── tasks.md
    ├── decisions/
    │   └── 002-three-layer-memory-architecture.md
    └── living/
        └── obsidian-second-brain/
            └── memory-architecture.md   # ADDED (merged spec)
```

## Code Architecture & Design Patterns

- **Layered Memory Pattern:** Separates concerns by volatility and retrieval priority.
- **Active Distillation Pattern:** The agent periodically reflects on raw logs and updates curated/structured layers.
- **Entry-Point Pattern:** `AGENT.md` provides a stable contract for how to navigate the vault.
- **Inbox Pattern:** `_Inbox/` decouples agent proposals from canonical knowledge, allowing validation before promotion.

## Data Model

No runtime types are introduced. The contract is organizational, expressed as folder semantics and frontmatter.

```yaml
# Frontmatter used across layers
---
type: memory | knowledge | journal | note | inbox
title: string
tags: string[]
updated: ISO-8601
status: draft | active | archived   # optional, mainly for _Inbox/
---
```

### Layer Semantics

| Layer | Path | Volatility | Read Frequency | Contents |
|-------|------|------------|----------------|----------|
| Working Memory | `memory/` | High | Last 1-2 days | Raw session logs |
| Curated Memory | `MEMORY.md` | Medium | Every major session | Distilled user/project context |
| Structured Vault | `Memory/`, `Knowledge/`, `Journal/`, `Notes/` | Low | On demand | Durable knowledge |
| Inbox | `_Inbox/` | High | During heartbeat | Pending proposals |

## API Contracts

No new MCP server APIs. Existing tools are reused with stricter conventions:

- `read_note("AGENT.md")` — agent onboarding.
- `read_note("MEMORY.md")` — session context bootstrap.
- `create_note(path, content)` — create notes in the correct layer.
- `update_note(path, append=...)` — append to working memory or MEMORY.md.
- `learn_from_text(text)` — still permitted, but should target `Knowledge/` or `Memory/` after review.
- `search_notes(query, mode="hybrid")` — prefer `Knowledge/` for technical answers.

### Layer Selection Rules

```
User asks a question
    ↓
Read AGENT.md on first vault use of session
Read MEMORY.md at start of major task
    ↓
Is this about a durable concept/guide? → search Knowledge/
Is this about the user's preferences/identity? → search Memory/
Is this about a recent session or decision? → search Journal/
Is this a raw log of the current conversation? → append to memory/
Agent wants to propose new canonical knowledge? → create in _Inbox/
```

## Flow Diagrams

### Session Start Flow

1. Agent opens vault.
2. Read `AGENT.md` if not already loaded this session.
3. Read `MEMORY.md`.
4. Proceed with user task, searching targeted layers on demand.

### Learning / Distillation Flow

1. Session produces raw context.
2. Append compressed log to `memory/YYYY-MM-DD-HHMM.md`.
3. During heartbeat, read recent `memory/` files.
4. Identify durable facts → update `MEMORY.md` (if short-term relevant) or create note in `_Inbox/` (if canonical).
5. Promote `_Inbox/` notes to `Memory/`, `Knowledge/`, `Journal/`, or `Notes/`.
6. Archive or delete obsolete raw logs.

## State Management

- State is file-based. Each layer is authoritative for its own scope.
- `MEMORY.md` is the only file expected to change between sessions without user action.
- `_Inbox/` acts as a staging area; its contents are transient until promoted.

## Error Handling

- If `AGENT.md` or `MEMORY.md` is missing, the agent should create them using sensible defaults.
- If a note path collides during migration, append a numeric suffix and record it in the migration manifest.
- If `learn_from_text` cannot classify a concept, default to `_Inbox/` for review.

## Performance Considerations

- Read `MEMORY.md` (~500 words) instead of the whole vault at session start.
- Limit working-memory reads to the last 1-2 days.
- Use `search_notes(mode="hybrid")` to narrow target notes before reading.
- Keep `_Inbox/` small; process it during every heartbeat.

## Security Considerations

- Privacy filter applies to all layers.
- Working memory may contain raw conversation snippets; review before promoting to curated or structured layers.
- Never store credentials, tokens, private keys, or PII in `MEMORY.md`, `memory/`, or any vault layer.
