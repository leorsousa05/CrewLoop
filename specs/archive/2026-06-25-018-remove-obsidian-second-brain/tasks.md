# Tasks: Remove Obsidian Second Brain

## Preparation

- [x] Identify all files and references to remove.
- [x] Create spec folder and files.

## Deletion

- [x] Delete `servers/obsidian-mcp/`.
- [x] Delete `skills/obsidian-second-brain/`.
- [x] Delete `docs/docs/supporting/obsidian-second-brain.md`.
- [x] Delete `references/obsidian-mcp-usage.md`.
- [x] Delete `specs/living/obsidian-mcp/` and `specs/living/obsidian-second-brain/`.
- [x] Delete Obsidian-related decision records.
- [x] Delete `packages/cli/src/mcp.ts` and `packages/cli/src/tests/mcp.test.ts`.

## Updates

- [x] Update `AGENTS.md`.
- [x] Update `README.md`.
- [x] Update root `package.json`.
- [x] Update `docs/sidebars.js`.
- [x] Update `references/conventions.md`.
- [x] Update `references/workflow.md`.
- [x] Update `docs/docs/intro.md`, `installation.md`, `concepts.md`, and workflow docs.
- [x] Update all `skills/*/SKILL.md` to remove obsidian-second-brain invocation.
- [x] Update `packages/cli/src/cli.ts` to remove MCP install block.
- [x] Update `servers/dashboard/src/skills/registry.ts`.

## Verification

- [x] `python scripts/validate-skills.py` passes.
- [x] `npm test` in `servers/dashboard` passes.
- [x] `grep` confirms no active Obsidian references remain.
- [x] Archive this spec and mark complete.
