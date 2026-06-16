# ADR 003: Cross-Skill Obsidian Second Brain Integration

## Status
- **State:** accepted
- **Date:** 2026-06-15
- **Author:** architect

## Context

The Loop Engineering Agents bundle has a local Obsidian vault at `~/.lea` managed by the `obsidian-second-brain` skill. The vault follows a three-layer memory architecture (`AGENT.md`, `MEMORY.md`, `memory/`, `Memory/`, `Knowledge/`, `Journal/`, `Notes/`, `_Inbox/`). However, most skills do not instruct the agent to use this memory, so context is lost between tasks and roles.

## Decision

Integrate Obsidian second-brain usage into every skill by adding a standardized "Memory & Context" section. Each skill will:

1. Read `AGENT.md` once per session and `MEMORY.md` at the start of major tasks.
2. Search domain-relevant vault layers before acting.
3. Persist outcomes to the correct layer after significant work.

The `obsidian-second-brain` skill remains the authoritative guide for vault mechanics; other skills reference it and add only domain-specific targets.

## Consequences

### Positive

- Consistent use of memory across all roles.
- Reduced repeated discovery and better continuity between sessions.
- Clear per-skill guidance for what to read and where to write.

### Negative

- Each skill file grows slightly.
- Requires discipline to avoid excessive vault reads.

## Alternatives Considered

- **Centralize all memory instructions in `obsidian-second-brain` only:** Rejected because it does not tell other skills when to use memory in their own workflows.
- **Create a separate "memory hook" skill:** Rejected because it adds complexity; a section in each skill is simpler and keeps role boundaries clear.

## Related

- `specs/changes/004-cross-skill-obsidian-integration/`
- `skills/obsidian-second-brain/SKILL.md`
- `references/obsidian-mcp-usage.md`
