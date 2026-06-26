# Spec: Remove Obsidian Second Brain

## Requirements

1. The repository must not contain the `servers/obsidian-mcp` server code.
2. The repository must not contain the `skills/obsidian-second-brain` skill.
3. No active doc or reference file may mention Obsidian, `~/.lea`, or second brain.
4. `crewloop install` must not attempt to install the Obsidian MCP server.
5. All existing skills must no longer instruct invocation of `obsidian-second-brain`.
6. `scripts/validate-skills.py` must pass after the skill is removed.

## Acceptance Criteria

- `grep -Ri obsidian` over the working tree returns matches only in `specs/archive/`.
- `grep -Ri 'second brain' --exclude-dir=specs/archive` returns no matches.
- `grep -Ri '~/.lea'` over the working tree returns no matches.
- `npm test` in `servers/dashboard` passes.
- `python scripts/validate-skills.py` passes.
