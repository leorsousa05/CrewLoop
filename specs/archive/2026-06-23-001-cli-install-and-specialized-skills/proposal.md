# Proposal: Consolidate installation in CLI and add specialized review skills

## Problem

CrewLoop currently has two ways to install skills:

1. `npm install -g @archznn/crewloop-cli && crewloop install` (the TypeScript CLI).
2. `./scripts/install.sh` from a git clone (a Bash script).

The Bash script is more complete: it merges the shared `references/` and `assets/` directories into every installed skill and installs the Obsidian MCP server. The CLI only copies each skill directory, which means users who install from npm never receive the shared conventions and templates. The npm skills package also omits `references/` and `assets/` entirely.

In addition, the crew lacks specialized review skills. Security and accessibility checks are mentioned inside the `reviewer` skill, but no dedicated skill owns deep-dive scans. As the project grows, this gap makes it harder to guarantee secure and accessible output.

## Goals

1. Make the CLI the single, portable installer for CrewLoop.
2. Remove the legacy `scripts/install.sh`.
3. Ensure every installed skill receives shared `references/` and `assets/`.
4. Ensure the CLI can install the Obsidian MCP server when its source is present.
5. Add `security-guard` and `accessibility-auditor` supporting skills with clear triggers and routing.
6. Update public documentation (README, workflow reference, docs site) to reflect the new state.

## Scope

### In scope

- `packages/cli/src/installer.ts` — merge shared directories into each installed skill.
- `packages/cli/src/mcp.ts` (new) — Obsidian MCP server installation logic.
- `packages/cli/src/cli.ts` — orchestrate skill install, shared merge, and MCP install.
- `packages/cli/src/tests/*.test.ts` — new tests for shared merge and MCP install.
- Root `package.json` — include `references/`, `assets/`, and `servers/obsidian-mcp/` in the published package.
- `scripts/install.sh` — delete.
- `skills/security-guard/SKILL.md` — new skill.
- `skills/accessibility-auditor/SKILL.md` — new skill.
- `README.md` — CLI-only installation, new skills list.
- `references/workflow.md` — include new skills in routing.
- `docs/docs/supporting/security-guard.md` — new docs page.
- `docs/docs/supporting/accessibility-auditor.md` — new docs page.
- `docs/sidebars.js` — add new supporting skills.

### Out of scope

- New CLI commands such as `crewloop doctor`, `crewloop info`, or `crewloop validate`.
- Automated trigger evals for the new skills.
- Docs drift checker.
- Rewriting the whole docs site beyond the affected pages.

## Constraints

- The project is documentation-first; no runtime build steps unless required by the CLI code itself.
- All changes must follow the existing `SKILL.md` structure: frontmatter, role prefix, memory context, AFK mode, anti-patterns, letter-based navigation.
- No direct git operations during spec/implementation (shipper skill owns those).
- Main documentation language is English.

## Success criteria

- `crewloop install` from npm produces skill directories that contain `references/` and `assets/`.
- `crewloop install` installs the Obsidian MCP server when `servers/obsidian-mcp/` is present.
- `scripts/install.sh` no longer exists.
- `python scripts/validate-skills.py` passes for all skills, including the two new ones.
- `cd docs && npm run build` succeeds after doc updates.
- `npm test` in `packages/cli` passes after CLI changes.
- The README and workflow reference accurately describe the CLI-only install path and the two new review skills.
