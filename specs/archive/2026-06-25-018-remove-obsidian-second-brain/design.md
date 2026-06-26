# Design: Remove Obsidian Second Brain

## Approach

1. **Delete entire directories/files**
   - `servers/obsidian-mcp/`
   - `skills/obsidian-second-brain/`
   - `docs/docs/supporting/obsidian-second-brain.md`
   - `references/obsidian-mcp-usage.md`
   - `specs/living/obsidian-mcp/`
   - `specs/living/obsidian-second-brain/`
   - `specs/decisions/001-mcp-architecture.md`
   - `specs/decisions/002-three-layer-memory-architecture.md`
   - `specs/decisions/003-cross-skill-obsidian-integration.md`
   - `specs/decisions/004-cli-as-sole-installer.md` (if it only exists because of MCP)
   - `packages/cli/src/mcp.ts`
   - `packages/cli/src/tests/mcp.test.ts`

2. **Update shared documentation**
   - Remove the "Second-Brain Memory" section from `AGENTS.md`.
   - Remove Obsidian entries from `README.md` tables, diagrams, and directory tree.
   - Remove `servers/obsidian-mcp/` from root `package.json` files list.
   - Remove `supporting/obsidian-second-brain` from `docs/sidebars.js`.
   - Remove memory/second-brain references from `references/conventions.md` and `references/workflow.md`.

3. **Update every `SKILL.md`**
   - Remove the mandatory `obsidian-second-brain` invocation paragraph.
   - Remove Obsidian-specific instructions (e.g., linking specs in Obsidian).

4. **Update CLI**
   - Remove the `installMcpServer` call from `packages/cli/src/cli.ts`.
   - Delete `packages/cli/src/mcp.ts` and its tests.

5. **Update dashboard**
   - Remove `obsidian-second-brain` from `servers/dashboard/src/skills/registry.ts` icon map.

## Out of Scope

- Historical archives in `specs/archive/` remain untouched; they are audit records.
- No replacement memory system is introduced.
