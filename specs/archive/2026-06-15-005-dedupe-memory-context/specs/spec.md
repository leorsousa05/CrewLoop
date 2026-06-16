# Spec: Deduplicate Memory & Context Sections

## Current state

Each skill contains a block similar to:

```markdown
## MEMORY & CONTEXT

Before <role>, use the `obsidian-second-brain` skill to:

1. Read `AGENT.md` once per session if not already loaded.
2. Read `MEMORY.md` at the start of the task.
3. Search `<layer1>/`, `<layer2>/`, ... for ...

After <role>, persist outcomes:
- ... → `<layer>/`
- ... → update `MEMORY.md`
```

The onboarding steps (1 and 2) and the post-work persistence instructions are identical. Only the search targets and persistence targets change per role.

## Desired state

### `references/obsidian-mcp-usage.md`

Add a new top-level section, "Skill Memory & Context Pattern", containing:

1. Generic instructions:
   - Read `AGENT.md` once per session if not already loaded.
   - Read `MEMORY.md` at the start of every major task.
   - Search the layers relevant to the current skill before acting.
   - Persist outcomes to the correct layer after significant work.
   - Update `MEMORY.md` with active context.
2. The existing per-skill memory targets table, moved into this section.

### Each `skills/<role>/SKILL.md`

Replace the full "Memory & Context" section with:

```markdown
## MEMORY & CONTEXT

Follow the pattern in `references/obsidian-mcp-usage.md#skill-memory--context-pattern`.

This skill's targets:
- **Read at start:** <layers>
- **Persist at end:** <layers>
```

The exact targets remain unchanged from the current version.

### `specs/living/obsidian-second-brain/memory-architecture.md`

If the per-skill targets table is duplicated here, replace it with a reference to `references/obsidian-mcp-usage.md` to avoid further duplication.

## Files changed

- `references/obsidian-mcp-usage.md`
- `skills/orchestrator/SKILL.md`
- `skills/architect/SKILL.md`
- `skills/designer/SKILL.md`
- `skills/engineer/SKILL.md`
- `skills/reviewer/SKILL.md`
- `skills/shipper/SKILL.md`
- `skills/docs-writer/SKILL.md`
- `skills/researcher/SKILL.md`
- `skills/maintainer/SKILL.md`
- `skills/product-manager/SKILL.md`
- `skills/tester/SKILL.md`
- `specs/living/obsidian-second-brain/memory-architecture.md` (minor cross-reference update)
