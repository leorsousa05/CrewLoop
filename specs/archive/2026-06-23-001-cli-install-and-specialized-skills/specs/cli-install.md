# Delta: CLI becomes the sole installer

## Current state

- `scripts/install.sh` copies skills, merges `references/` and `assets/` into each skill target, and installs the Obsidian MCP server.
- `packages/cli/src/installer.ts` only copies the skill directory (`copyDir(skill.sourcePath, targetPath)`).
- Root `package.json` ships only `skills/`, `README.md`, and `LICENSE.md`, so npm users never receive shared files or the MCP server source.

## Desired state

- `scripts/install.sh` is removed.
- `crewloop install` is the only supported installation path.
- The CLI merges shared `references/` and `assets/` into each installed skill.
- The CLI installs the Obsidian MCP server when `servers/obsidian-mcp/` is available in the resolved skills package.
- The npm skills package ships everything the CLI needs: `skills/`, `references/`, `assets/`, and `servers/obsidian-mcp/`.

## Files changed

### Removed

- `scripts/install.sh`

### Added

- `packages/cli/src/mcp.ts` — cross-platform MCP server installation.

### Modified

- `packages/cli/src/installer.ts` — accept a package root and merge shared directories.
- `packages/cli/src/cli.ts` — orchestrate shared merge and MCP install inside `handleInstall`.
- `packages/cli/src/tests/installer.test.ts` — test shared-directory merge behavior.
- `packages/cli/src/tests/mcp.test.ts` — test MCP install error handling and dry-run.
- Root `package.json` — extend `files` array.
- `README.md` — replace `scripts/install.sh` references with CLI instructions.
- `specs/living/npm-distribution/spec.md` — remove the source-fallback paragraph.

## Behavior details

### Shared directory merge

After copying a skill into the target directory, the CLI must also copy:

- `<packageRoot>/references` → `<targetSkill>/references`
- `<packageRoot>/assets` → `<targetSkill>/assets`

If the skill source already contains a `references/` or `assets/` directory, the shared copy must overlay it (later copies win). In `--dry-run` mode no files are written, but the skill is reported as installed. In `--symlink` mode, shared directories may be copied as real directories or symlinked; the implementation must not break the symlinked skill.

### MCP server installation

When `<packageRoot>/servers/obsidian-mcp` exists, the CLI must:

1. Create a Python virtual environment at `<mcpDir>/.venv` if it does not exist.
2. Install the MCP server in editable mode: `pip install -e <mcpDir>`.
3. Expose the `obsidian-mcp` binary in a local bin directory (default `<home>/.local/bin`).
4. On Unix, create a symlink to `<venv>/bin/obsidian-mcp`.
5. On Windows, create a `.cmd` wrapper pointing to `<venv>/Scripts/obsidian-mcp.exe` (or symlink if the environment allows it).
6. Report success, skip, or error clearly without blocking skill installation.

### Error handling

- Missing Python: report a warning, continue installing skills.
- pip install failure: report error, continue installing skills.
- Missing shared directories: silently skip (they are optional).
- Unknown CLI flags: should still be ignored by `parseArgs` for now, but the implementation may log a warning.

## Acceptance criteria

- `crewloop install --dry-run` lists skills and reports whether it would install MCP.
- `crewloop install` copies `references/` and `assets/` into every installed skill.
- `crewloop install` creates the MCP venv and binary wrapper when the source is present.
- `npm test` in `packages/cli` passes.
