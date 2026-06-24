# Design: obsidian-second-brain Skill Improvements

## Approach

This is a documentation-only change to a single Markdown file. The goal is to reduce ambiguity without increasing length unnecessarily.

## Structure Changes

The skill file keeps its current sections but adds:

1. A short "Definitions" subsection after "MCP Tools Reference".
2. A renamed working-memory path (`logs/`).
3. Three new examples.
4. A complete final navigation menu.

## Navigation Menu

Replace the existing final menu with:

```markdown
**What would you like to do?**

- **[O] Return to Orchestrator** — Main task routing
- **[A] Return to Architect** — Design or spec questions
- **[D] Return to Designer** — Visual/UI design direction
- **[E] Return to Engineer** — Implementation work
- **[R] Return to Reviewer** — Quality review
- **[S] Return to Shipper** — Commit, branch, push, PR
```

## Definitions Section

Insert after the "MCP Tools Reference" table:

```markdown
### Definitions

- `sync_from_bundle`: re-indexes the skill bundle and the local vault. Call once per session before the first substantive search. Takes no arguments.
- Search score: a normalized relevance score returned by `search_notes`. Matches above `0.3` are usually worth reading; lower scores are typically noise.
- Major task: any task involving specs, architecture, implementation, durable knowledge, or multi-step reasoning.
- Heartbeat: a distillation routine run every 2-4 sessions (or after a significant task) to promote raw logs into `MEMORY.md` and structured layers.
```

## Layer Rename

All occurrences of `memory/` become `logs/`. The semantics stay the same: high-volatility raw session logs with filenames `YYYY-MM-DD-HHMM.md`.

## New Examples

Add after Example 5:

```markdown
### Example 6 — persist a user preference
User: "I prefer Portuguese for conversation but English for vault notes."
Agent:
1. Privacy check (safe).
2. Decide layer: user profile → `Memory/`.
3. `create_note("Memory/user-language-preferences.md", content)`.
4. Answer: "Preference saved to `Memory/user-language-preferences.md`."

### Example 7 — temporary research scratchpad
User: "Collect articles about vector databases for now."
Agent:
1. Privacy check (safe).
2. Decide layer: temporary → `Notes/`.
3. `create_note("Notes/vector-database-research.md", content)`.
4. Answer: "Scratchpad created at `Notes/vector-database-research.md`."

### Example 8 — propose a canonical note
Agent:
1. Privacy check (safe).
2. Decide layer: uncertain → `_Inbox/`.
3. `create_note("_Inbox/proposed-decision-2026-06-24.md", content)`.
4. Answer: "Proposal saved to `_Inbox/proposed-decision-2026-06-24.md` for review during the next heartbeat."
```

## Directory Structure

```
skills/obsidian-second-brain/
└── SKILL.md              # modified
```

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Renaming `memory/` to `logs/` breaks existing references | Update all references in the same file. Other skills only refer to the skill, not to the path directly. |
| Skill becomes too long | Keep additions concise; remove redundancy where possible. |

## Deferred

- Automated validation that the skill is being followed.
