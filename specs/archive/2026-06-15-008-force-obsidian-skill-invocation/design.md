# Design: Force Obsidian Second Brain Invocation via Skill Tool

## Approach

Remove all direct vault file paths from skill Memory & Context sections and replace them with a clear instruction to invoke `obsidian-second-brain` via the `Skill` tool. Centralize the detailed layer targets in `references/obsidian-mcp-usage.md`.

## Reference update

In `references/obsidian-mcp-usage.md`, make the pattern section:

```markdown
## Skill Memory & Context Pattern

Every skill in the bundle must access the local Obsidian vault at `~/.lea` **only** through the `obsidian-second-brain` skill. Never read or write vault files directly with `Read`, `Edit`, `Write`, or `Bash`.

### Before acting

Invoke the `obsidian-second-brain` skill via the `Skill` tool. It will:

1. Read `AGENT.md` once per session if not already loaded.
2. Read `MEMORY.md` at the start of the task.
3. Search the layers relevant to this skill's role (see table below).

If the vault or MCP server is unavailable, continue without memory.

### After acting

Invoke the `obsidian-second-brain` skill again to persist outcomes to the correct layer:

- Reusable guides, conventions, or architecture notes → `Knowledge/`
- Session outcomes, decisions, or findings → `Journal/`
- User profile facts or preferences → `Memory/`
- Proposed canonical notes awaiting review → `_Inbox/`
- Active context and priorities → update `MEMORY.md`
```

## Skill section template

Replace each skill's Memory & Context section with:

```markdown
## MEMORY & CONTEXT

**Always invoke the `obsidian-second-brain` skill via the `Skill` tool.**
Never read or write files inside `~/.lea` directly with `Read`, `Edit`, `Write`, or `Bash`.

At the start of the task, the `obsidian-second-brain` skill will search and read the relevant layers for this role.
At the end of the task, it will persist outcomes to the correct layers.

This skill's targets:
- **Read at start:** <intent>
- **Persist at end:** <intent>
```

The `<intent>` is a short phrase like "user priorities and active context" or "relevant conventions, patterns, and prior implementations".

## Obsidian-second-brain skill update

Add a prominent instruction at the top of the skill body:

```markdown
**Invocation:** This skill must be invoked via the `Skill` tool. Other skills should never read or write vault files directly.
```

## Verification

- `python3 scripts/validate-skills.py` must pass.
- No skill Memory & Context section should contain direct vault file paths like `MEMORY.md` or `Memory/preferences.md` as read/write instructions.
