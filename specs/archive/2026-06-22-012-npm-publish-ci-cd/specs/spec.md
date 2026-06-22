# Spec Delta: npm Publish CI/CD

## Current State

CrewLoop publishes two npm packages manually from a developer machine:

- `@archznn/crewloop-skills` — root package shipping the `skills/` directory.
- `@archznn/crewloop-cli` — CLI package under `packages/cli/` that depends on the skills package.

The repository already has `.github/workflows/deploy.yml` for Docusaurus/GitHub Pages, but there is no GitHub Actions workflow for npm publishing. Version bumps, tagging, and the ordered publish are performed manually.

## Changes

### ADDED

- `.github/workflows/publish-npm.yml` — GitHub Actions workflow triggered by semantic-version tags.
- Job `publish-skills` — builds, packs, and publishes `@archznn/crewloop-skills`.
- Job `publish-cli` — waits for `publish-skills`, verifies the published dependency version, then publishes `@archznn/crewloop-cli`.
- Validation step `assert-version-alignment` — ensures root `package.json` and `packages/cli/package.json` versions match the pushed tag.
- Optional local dry-run script `scripts/npm-publish-dry-run.sh` for maintainers to preview what will be published.

### MODIFIED

- `.github/workflows/deploy.yml` — no functional change, but confirm concurrency group names do not clash with the new workflow.
- `README.md` — add a "Releasing" section documenting how to create a tag and what the workflow does.
- `packages/cli/package.json` — ensure the dependency on `@archznn/crewloop-skills` uses an exact caret range that matches the current release version (e.g., `^0.2.0`).

### REMOVED

- Nothing.

## Migration Notes

Existing manual publish steps remain possible for emergency fixes, but the default path becomes tag-based automation. No consumer-facing behavior changes.

## Backward Compatibility

Fully backward compatible. The workflow is additive. Published package contents and install behavior do not change.
