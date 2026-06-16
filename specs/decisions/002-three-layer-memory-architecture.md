# ADR 002: Three-Layer Memory Architecture for Obsidian RAG

## Status
- **State:** accepted
- **Date:** 2026-06-15
- **Author:** architect

## Context

The `loop-engineering-agents` bundle uses a local Obsidian vault at `~/.lea` as a second brain / RAG for AI agents. The initial layout (`concepts/`, `decisions/`, `projects/`, `dashboards/`) served small knowledge bases but lacked a memory model. As usage grows, the agent risks reading too many notes, mixing transient and durable knowledge, and failing to bootstrap context efficiently at session start.

## Decision

Adopt a three-layer memory architecture across the entire bundle for all interactions with `~/.lea`:

1. **Working Memory (`memory/`):** raw, timestamped session logs with high volatility.
2. **Curated Memory (`MEMORY.md`):** a single, ~500-word distilled file read at the start of major sessions.
3. **Structured Vault (`Memory/`, `Knowledge/`, `Journal/`, `Notes/`, `_Inbox/`):** durable, categorized knowledge with explicit lifecycles.

All folder names and note content must be in English. The agent may auto-promote notes from `_Inbox/` without human approval.

## Consequences

### Positive

- Reduced token usage through selective retrieval.
- Clear separation between transient context and durable knowledge.
- A stable entry contract (`AGENT.md`) and bootstrap context (`MEMORY.md`).
- Git-friendly, Markdown-native, and compatible with Obsidian wikilinks.

### Negative

- Requires discipline from every skill that writes to the vault.
- `MEMORY.md` can drift if heartbeat distillation is neglected.
- Migration of existing notes adds upfront work.

## Alternatives Considered

- **Flat folders with vector search:** Rejected because vector search is not implemented in the current MCP server and would increase complexity.
- **Typed fact files (`memory/facts/...`):** Rejected as the primary scheme because it adds friction for human readers; may be adopted later as an optional enhancement under `Memory/`.
- **Human-in-the-loop `_Inbox/` approval:** Rejected because the user explicitly allowed auto-promotion.

## Related

- `specs/changes/001-three-layer-memory-architecture/`
- `skills/obsidian-second-brain/SKILL.md`
- `references/obsidian-mcp-usage.md`
