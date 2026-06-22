# Spec Delta: npm Distribution

## Current State

CrewLoop skills live in `skills/<name>/SKILL.md` and are installed via `scripts/install.sh`. The script copies each skill directory into `~/.agents/skills/<name>/` and merges shared `references/` and `assets/` into every skill directory. There is no npm package, no versioning, and no per-skill installation option.

## Changes

### ADDED

- `package.json` at repository root to declare the npm package `@crewloop/skills` and whitelist `skills/`, `README.md`, and `LICENSE.md` for publishing.
- `packages/cli/` (or repository root `bin/` + `src/cli/`) containing the `@crewloop/cli` installer.
- CLI entry point that discovers skills inside the installed package and copies/symlinks them to a target directory.
- CLI flags: `--target`, `--skill`, `--agent`, `--symlink`, `--force`, `--dry-run`, `--list`.
- `packages/cli/package.json` with `bin` entry `crewloop`.
- `packages/cli/README.md` documenting install commands and flags.
- Optional: `scripts/prepublish.sh` or GitHub Actions workflow to publish both packages.

### MODIFIED

- `scripts/install.sh` — update header comment to mention npm as the preferred install method; keep behavior unchanged.
- `README.md` — add npm install instructions alongside the existing `./scripts/install.sh` instructions.
- `.gitignore` — add `node_modules/`, `*.tgz`, and `packages/cli/node_modules/` if not already present.

### REMOVED

- Nothing.

## Migration Notes

Existing users who clone the repo and run `./scripts/install.sh` are unaffected. New users can choose npm install instead. The skill directory layout inside `~/.agents/skills/` remains identical, so agent hosts load skills the same way.

## Backward Compatibility

Fully backward compatible. `install.sh` keeps its current behavior. The npm path is additive.
