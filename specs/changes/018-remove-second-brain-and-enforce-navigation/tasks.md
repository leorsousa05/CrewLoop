# Tasks: Remove second-brain integration and enforce navigation menus

## Spec

- [x] Create this spec in `specs/changes/018-remove-second-brain-and-enforce-navigation/`.

## Active workflow cleanup

- [ ] Remove second-brain/Obsidian requirements from `AGENTS.md`.
- [ ] Remove second-brain/Obsidian requirements from `README.md`.
- [ ] Remove second-brain/Obsidian requirements from `references/conventions.md`.
- [ ] Remove second-brain/Obsidian requirements from `references/workflow.md`.
- [ ] Delete `references/obsidian-mcp-usage.md`.

## Skill contract updates

- [ ] Remove memory/Obsidian sections from all active skills.
- [ ] Update AFK references so they no longer depend on `MEMORY.md`.
- [ ] Add explicit final-response menu requirements to all active skills.
- [ ] Delete `skills/obsidian-second-brain/SKILL.md`.

## CLI and packaging

- [ ] Remove `servers/obsidian-mcp/` from package files.
- [ ] Remove CLI MCP installation flow from active CLI source.
- [ ] Delete obsolete active CLI MCP helper source.

## Docs and evals

- [ ] Remove docs pages and sidebar entries for the second-brain feature.
- [ ] Remove or rewrite active docs references to Obsidian setup.
- [ ] Remove second-brain-only eval definitions.

## Living specs

- [ ] Remove active living specs for the retired second-brain integration.
- [ ] Update active living CLI spec to stop promising Obsidian MCP installation.

## Verification

- [ ] Run `python scripts/validate-skills.py`.
- [ ] Run targeted CLI tests if still applicable.
- [ ] Re-scan active files for `obsidian`, `second-brain`, `~/.lea`, and `MEMORY.md`.
