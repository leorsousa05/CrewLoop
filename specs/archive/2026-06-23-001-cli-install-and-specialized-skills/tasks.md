# Tasks: CLI consolidation and specialized review skills

## Phase 1 — CLI installer

- [x] Implement `mergeSharedDirs()` in `packages/cli/src/installer.ts`.
- [x] Update `installSkills()` signature to accept `sharedRoot?: string`.
- [x] Wire shared merge into the install loop (respect `--dry-run` and `--symlink`).
- [x] Create `packages/cli/src/mcp.ts` with `installMcpServer()`, `McpInstallOptions`, and `McpInstallResult`.
- [x] Update `packages/cli/src/cli.ts` `handleInstall()` to call `installMcpServer()` when `servers/obsidian-mcp/` exists.
- [x] Update `packages/cli/src/tests/installer.test.ts` with shared-merge tests.
- [x] Create `packages/cli/src/tests/mcp.test.ts` with MCP install tests.
- [x] Update `packages/cli/src/tests/cli.test.ts` if new flags or help text change.
- [x] Update root `package.json` `files` array to include `references/`, `assets/`, and `servers/obsidian-mcp/`.
- [x] Delete `scripts/install.sh`.

## Phase 2 — New skills

- [x] Create `skills/security-guard/SKILL.md` following the standard skill structure.
- [x] Create `skills/security-guard/references/security-checklist.md` (optional but recommended).
- [x] Create `skills/accessibility-auditor/SKILL.md` following the standard skill structure.
- [x] Create `skills/accessibility-auditor/references/a11y-checklist.md` (optional but recommended).
- [x] Run `python scripts/validate-skills.py` and fix any issues.

## Phase 3 — Documentation and workflow

- [x] Update `README.md` to remove `scripts/install.sh` references and document CLI-only install.
- [x] Update `README.md` Supporting Crew table to include `security-guard` and `accessibility-auditor`.
- [x] Update `references/workflow.md` team roles table and routing rules for the new skills.
- [x] Update `docs/sidebars.js` to add `supporting/security-guard` and `supporting/accessibility-auditor`.
- [x] Create `docs/docs/supporting/security-guard.md`.
- [x] Create `docs/docs/supporting/accessibility-auditor.md`.
- [x] Update `specs/living/npm-distribution/spec.md` to remove the source-fallback paragraph.
- [x] Update `specs/living/supporting-team-skills/spec.md` to include the new skills.

## Phase 4 — Verification

- [x] Run `npm test` in `packages/cli`.
- [x] Run `python scripts/validate-skills.py`.
- [x] Run `cd docs && npm run build`.
- [x] Do a manual end-to-end install to a temp directory and verify shared files and MCP binary.
- [x] Mark tasks complete and update `.spec.yaml` status to `completed`.
