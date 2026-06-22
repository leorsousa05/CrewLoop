# Spec: Add fallback instructions when Obsidian vault or MCP is unavailable

## Acceptance criteria

1. `skills/obsidian-second-brain/SKILL.md` contains a clearly marked section explaining what to do when the Obsidian MCP server or `~/.lea` vault is unavailable.
2. The fallback instructions tell the agent to:
   - Skip vault read/write operations.
   - Continue the task using in-session context.
   - Briefly inform the user that vault persistence was skipped.
3. `scripts/validate-skills.py` still passes after the change.

## Affected files

- `skills/obsidian-second-brain/SKILL.md`

## Non-goals

- Modifying `AGENTS.md` or other skills.
- Adding new MCP tools or memory layers.
