# Spec: Force Obsidian Second Brain Invocation via Skill Tool

## Current state

The Memory & Context sections look like this:

```markdown
## MEMORY & CONTEXT

Follow the pattern in `references/obsidian-mcp-usage.md#skill-memory--context-pattern`.
Invoke the `obsidian-second-brain` skill via the `Skill` tool to execute the pattern.

This skill's targets:
- **Read at start:** `MEMORY.md`, `Memory/preferences.md`
- **Persist at end:**
  - Confirmed user priorities and constraints → update `MEMORY.md`
  - Unclear items that may become canonical later → `_Inbox/`
```

The paths `MEMORY.md` and `Memory/preferences.md` still look like direct file read targets.

## Desired state

```markdown
## MEMORY & CONTEXT

**Always invoke the `obsidian-second-brain` skill via the `Skill` tool.**
Never read or write files inside `~/.lea` directly with `Read`, `Edit`, `Write`, or `Bash`.

At the start of the task, the `obsidian-second-brain` skill will search and read the relevant layers for this role.
At the end of the task, it will persist outcomes to the correct layers.

This skill's targets:
- **Read at start:** user priorities and active context.
- **Persist at end:** confirmed priorities to curated memory; unclear items to inbox.
```

The exact read/persist targets move to `references/obsidian-mcp-usage.md` and are described as layers/intents, not as direct file paths.

## Files changed

- `references/obsidian-mcp-usage.md`
- `skills/obsidian-second-brain/SKILL.md`
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
