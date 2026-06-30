# Spec Delta: README Rewrite + Shipper Version Bump

## Current System

- `README.md` exists with basic sections: highlights, quick start, skills table, workflow, adding a skill, repository layout, releasing, contributing, license.
- `skills/shipper/SKILL.md` has a "Verify & Bump Package Version" step that is advisory and asks for confirmation before running `npm version`.
- `package.json` and `packages/cli/package.json` are at version `0.8.0`.

## Proposed Change

### ADDED

1. New README sections and badges:
   - Badges: NPM version, license, CI/tests, docs.
   - Cleaner technical structure.

2. New Shipper skill rules:
   - Explicit rule: "If the diff touches versioned packages, a version bump is required."
   - Mapping: `fix` → patch, `feat` → minor, breaking change → major.
   - If the Shipper is unsure whether a bump is needed, it must ask the user.
   - Always ask for confirmation before running `npm version`.

3. Version bump:
   - `package.json`: `0.8.0` → `0.9.0`
   - `packages/cli/package.json`: `0.8.0` → `0.9.0`

### MODIFIED

- `README.md` — rewrite.
- `skills/shipper/SKILL.md` — strengthen version bump rules.
- `package.json` — bump version.
- `packages/cli/package.json` — bump version.

### REMOVED

- None.
