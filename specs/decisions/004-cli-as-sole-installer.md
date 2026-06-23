# ADR 004: CLI as the sole installer

## Status

accepted

## Context

CrewLoop currently supports two installation paths:

1. The npm-published TypeScript CLI (`crewloop install`).
2. A Bash script (`scripts/install.sh`) run from a git clone.

The Bash script is more capable than the CLI: it merges shared `references/` and `assets/` into every installed skill and installs the Obsidian MCP server. The CLI lacks both behaviors. At the same time, maintaining two installers duplicates effort and creates drift. The Bash script also relies on Unix-only commands (`ln -sf`, `.venv/bin/pip`, `~/.local/bin`), making it unreliable on Windows/Git Bash.

## Decision

Consolidate all installation logic into the TypeScript CLI. Remove `scripts/install.sh`. The CLI will:

1. Copy or symlink each skill into the target directory.
2. Merge shared `references/` and `assets/` into each installed skill.
3. Install the Obsidian MCP server when `servers/obsidian-mcp/` is present in the resolved skills package.

The root npm package (`@archznn/crewloop-skills`) will ship `skills/`, `references/`, `assets/`, and `servers/obsidian-mcp/` so the CLI can perform a complete install from npm.

## Consequences

### Positive

- Single source of truth for installation behavior.
- Portable installer across macOS, Linux, and Windows (via Node.js APIs).
- npm users receive shared conventions, templates, and the MCP server source.
- Removes Unix-specific shell assumptions from the install path.

### Negative

- Users who previously relied on `./scripts/install.sh` must switch to `crewloop install`.
- The npm tarball grows because it now includes `references/`, `assets/`, and `servers/obsidian-mcp/`.
- The CLI must handle cross-platform Python venv and binary exposure, which adds complexity.

## Alternatives considered

- **Keep both installers:** Rejected because it perpetuates drift and doubles maintenance.
- **Rewrite `install.sh` in POSIX shell or Python for portability:** Rejected because the CLI already exists and is the user-facing install path; investing in a second portable installer is wasteful.
- **Keep `install.sh` but make it call the CLI:** Rejected because it still leaves a shell wrapper that solves no problem the CLI cannot solve directly.

## Related

- Living spec: `specs/living/npm-distribution/spec.md`
- Active change: `specs/changes/001-cli-install-and-specialized-skills/`
