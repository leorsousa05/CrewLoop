# Spec: obsidian-second-brain Skill Improvements

## Current State

`skills/obsidian-second-brain/SKILL.md` describes the layered memory architecture, MCP tools, privacy rules, anti-patterns, and examples. It is invoked by all other skills before touching the vault.

### ADDED

#### 1. Complete Navigation Menu

The final navigation menu must include all standard bundle skills that are valid next steps:

```markdown
**What would you like to do?**

- **[O] Return to Orchestrator** — Main task routing
- **[A] Return to Architect** — Design or spec questions
- **[D] Return to Designer** — Visual/UI design direction
- **[E] Return to Engineer** — Implementation work
- **[R] Return to Reviewer** — Quality review
- **[S] Return to Shipper** — Commit, branch, push, PR
```

#### 2. Glossary / Definitions

Add a "Definitions" subsection under "MCP Tools Reference" or as a new top-level section:

- `sync_from_bundle`: re-indexes the skill bundle and local vault. Call once per session before the first substantive search. No arguments required.
- Search score: a normalized float returned by `search_notes`. Values above `0.3` generally indicate a strong match; values below indicate weak or no relevance.
- Major task: any task that involves creating specs, making architectural decisions, implementing features, or persisting durable knowledge.
- Heartbeat: a distillation routine run every 2-4 sessions (or after a significant task) to move raw logs into curated memory and structured layers.

#### 3. Layer Naming Clarification

Rename the working-memory folder from `memory/` to `logs/` in the architecture diagram, decision tree, and layer semantics table. Keep `Memory/` (capital M) as the durable user-profile layer.

If renaming is rejected, add a prominent warning box explaining the distinction.

#### 4. Additional Examples

Add concrete examples for:
- `Memory/` — persisting a user preference (e.g., "User prefers Portuguese for conversation but English for vault notes").
- `Notes/` — temporary scratchpad for research.
- `_Inbox/` — proposing a canonical note before promotion.

### MODIFIED

- Final navigation menu.
- "MCP Tools Reference" table to include a one-line description of `sync_from_bundle`.
- "Layer Semantics" table to reflect `logs/` instead of `memory/`.
- Examples section to cover all layers.

### REMOVED

- Ambiguous references to `memory/` (lowercase) once renamed to `logs/`.

## Acceptance Criteria

- [ ] Navigation menu includes `[D]` and `[S]`.
- [ ] `sync_from_bundle`, search score, "major task", and "heartbeat" are defined.
- [ ] `logs/` replaces `memory/` consistently, or a clear warning distinguishes them.
- [ ] Every layer (`AGENT.md`, `MEMORY.md`, `logs/`, `Memory/`, `Knowledge/`, `Journal/`, `Notes/`, `_Inbox/`) has at least one example.
