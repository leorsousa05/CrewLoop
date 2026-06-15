# Proposal: Three-Layer Memory Architecture for Obsidian RAG

## Status
- **State:** draft
- **Created:** 2026-06-15
- **Author:** architect

## Problem Statement

The `loop-engineering-agents` bundle currently uses a flat, folder-based vault layout (`concepts/`, `decisions/`, `projects/`) for its Obsidian second brain at `~/.lea`. While this works for small knowledge bases, it does not scale well as a RAG system:

- The agent reads notes reactively without a clear distinction between transient session context and durable knowledge.
- There is no curated entry point: every search starts from scratch, consuming tokens on potentially irrelevant notes.
- There is no active distillation loop: raw conversation artifacts are never compressed into a compact working memory.
- Folder semantics are mixed (some folders hold long-lived knowledge, others hold project scratchpads), making retrieval ambiguous.

This proposal introduces a deliberate three-layer memory architecture that separates working memory, curated memory, and structured vault knowledge. The goal is to reduce token spend, improve selective retrieval, and establish a single canonical pattern every skill in the bundle must follow.

## Goals

1. Define a global, English-language vault layout used by every skill that touches `~/.lea`.
2. Establish `AGENT.md` as the agent entry point and `MEMORY.md` as the curated memory read at session start.
3. Implement an active distillation flow from raw session logs → curated memory → structured vault.
4. Migrate existing notes in `~/.lea` into the new structure without data loss.
5. Update `obsidian-second-brain` skill and `references/obsidian-mcp-usage.md` to enforce the new architecture.

## Non-Goals

- Adding vector/semantic search to the MCP server (acknowledged limitation, deferred).
- Changing the MCP server protocol or adding new server-side tools.
- Human-in-the-loop approval for `_Inbox/` promotion (auto-promotion is allowed).
- Supporting multiple vaults or remote vaults.

## Constraints

- All folder names and note content must be in English.
- The layout must remain Markdown-native and Git-friendly.
- The migration must preserve existing backlinks and frontmatter where possible.
- The solution must not store secrets, API keys, tokens, passwords, or PII in any layer.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Agent fails to follow new structure | High | Update skill instructions with explicit rules and examples; validate with `validate-skills.py`. |
| Existing notes map poorly to new layers | Medium | Provide clear mapping rules and a migration log. |
| `MEMORY.md` drifts and becomes bloated | Medium | Define a heartbeat distillation cycle and a 500-word soft cap. |
| Duplicated or orphaned notes after migration | Low | Generate a migration manifest and verify links after move. |

## Success Criteria

- [ ] `~/.lea` follows the three-layer layout after migration.
- [ ] `AGENT.md` and `MEMORY.md` exist at the vault root.
- [ ] `obsidian-second-brain/SKILL.md` references the new architecture.
- [ ] `references/obsidian-mcp-usage.md` documents the new layout and flow.
- [ ] Existing notes are relocated and linked without loss.
