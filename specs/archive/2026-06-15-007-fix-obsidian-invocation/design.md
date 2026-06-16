# Design: Fix Obsidian Second Brain Invocation

## Approach

Clarify the Memory & Context instructions so the agent knows it must invoke the `obsidian-second-brain` skill via the `Skill` tool, not read vault files directly.

## Reference update

In `references/obsidian-mcp-usage.md`, change:

```markdown
### Before acting

Use the `obsidian-second-brain` skill to:

1. Read `AGENT.md` once per session if not already loaded.
2. Read `MEMORY.md` at the start of the task.
3. Search the layers relevant to this skill's role (see table below).
```

To:

```markdown
### Before acting

Invoke the `obsidian-second-brain` skill via the `Skill` tool. That skill will:

1. Read `AGENT.md` once per session if not already loaded.
2. Read `MEMORY.md` at the start of the task.
3. Search the layers relevant to this skill's role (see table below).

If the vault or MCP server is unavailable, continue without memory.
```

And change:

```markdown
### After acting

Persist outcomes to the correct layer:
```

To:

```markdown
### After acting

Use the `obsidian-second-brain` skill to persist outcomes to the correct layer:
```

## Skill updates

Each skill's Memory & Context section already references the central pattern, so no per-skill changes are strictly required. However, to make the fix visible at the skill level, update the opening line from:

```markdown
Follow the pattern in `references/obsidian-mcp-usage.md#skill-memory--context-pattern`.
```

To:

```markdown
Follow the pattern in `references/obsidian-mcp-usage.md#skill-memory--context-pattern`.
Invoke the `obsidian-second-brain` skill via the `Skill` tool to execute the pattern.
```

## Verification

- `python3 scripts/validate-skills.py` must pass.
- Every skill with Memory & Context must mention invoking `obsidian-second-brain` via the `Skill` tool.
