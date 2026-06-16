# Spec: Fix Obsidian Second Brain Invocation

## Current state

The Memory & Context pattern says:

```markdown
Follow the pattern in `references/obsidian-mcp-usage.md#skill-memory--context-pattern`.
```

The reference says:

```markdown
### Before acting

Use the `obsidian-second-brain` skill to:

1. Read `AGENT.md` once per session if not already loaded.
2. Read `MEMORY.md` at the start of the task.
3. Search the layers relevant to this skill's role (see table below).
```

This is ambiguous. Agents may read the files directly instead of invoking the skill.

## Desired state

Replace the ambiguous "Use the `obsidian-second-brain` skill to:" with an explicit invocation instruction:

```markdown
### Before acting

Invoke the `obsidian-second-brain` skill via the `Skill` tool. That skill will:

1. Read `AGENT.md` once per session if not already loaded.
2. Read `MEMORY.md` at the start of the task.
3. Search the layers relevant to this skill's role (see table below).

If the vault or MCP server is unavailable, continue without memory.
```

Similarly, for persistence:

```markdown
### After acting

Use the `obsidian-second-brain` skill to persist outcomes to the correct layer:

- Reusable guides, conventions, or architecture notes → `Knowledge/`
- Session outcomes, decisions, or findings → `Journal/`
- User profile facts or preferences → `Memory/`
- Proposed canonical notes awaiting review → `_Inbox/`
- Active context and priorities → update `MEMORY.md`
```

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
