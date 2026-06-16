# Design: Deduplicate Memory & Context Sections

## Approach

Extract the common Memory & Context instructions into a single canonical reference and make each skill point to it. This is a documentation refactor with no functional changes.

## Centralized pattern in `references/obsidian-mcp-usage.md`

Insert a new section before "Per-Skill Memory Targets":

```markdown
## Skill Memory & Context Pattern

Every skill in the bundle should follow this pattern when the local Obsidian vault at `~/.lea` is available.

### Before acting

Use the `obsidian-second-brain` skill to:

1. Read `AGENT.md` once per session if not already loaded.
2. Read `MEMORY.md` at the start of the task.
3. Search the layers relevant to this skill's role (see table below).

### After acting

Persist outcomes to the correct layer:

- Reusable guides, conventions, or architecture notes → `Knowledge/`
- Session outcomes, decisions, or findings → `Journal/`
- User profile facts or preferences → `Memory/`
- Proposed canonical notes awaiting review → `_Inbox/`
- Active context and priorities → update `MEMORY.md`

## Per-Skill Memory Targets

<table stays here>
```

## Per-skill section template

Each skill replaces its current "Memory & Context" section with:

```markdown
## MEMORY & CONTEXT

Follow the pattern in `references/obsidian-mcp-usage.md#skill-memory--context-pattern`.

This skill's targets:
- **Read at start:** <comma-separated layers>
- **Persist at end:** <bullet list of outcomes and layers>
```

## Role-specific targets (preserved)

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

## No subagents

The refactor is a small, pattern-based edit across many files. The same transformation applies to all skills, so a single engineer pass with careful find/replace is more efficient than parallel subagents. Coordination overhead outweighs the benefit here.

## Verification

- `python3 scripts/validate-skills.py` must pass.
- Each skill file must still contain a "Memory & Context" section with its role-specific targets.
- `references/obsidian-mcp-usage.md` must contain the centralized pattern and the full targets table.
