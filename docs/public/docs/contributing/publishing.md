---
sidebar_position: 4
---

# Publishing

CrewLoop packages are published to npm automatically by GitHub Actions on semantic version tags. Manual publishing is not needed.

## Packages

| Package | Published |
|---------|----------|
| `@archznn/crewloop-skills` | First |
| `@archznn/crewloop-cli` | After skills are live on npm |

## How to release

1. Update `version` in `package.json` (root) and `packages/cli/package.json`. Keep them aligned.
2. Update the CLI dependency: `"@archznn/crewloop-skills": "^<new-version>"` in `packages/cli/package.json`.
3. Push a semantic version tag:

```bash
git tag v0.8.0
git push origin v0.8.0
```

## What the workflow does

On a `v*.*.*` tag:

1. Validates that the tag matches both `package.json` versions.
2. Publishes `@archznn/crewloop-skills`.
3. Waits for the new version to be visible on the npm registry.
4. Publishes `@archznn/crewloop-cli`.

## Required secret

The `NPM_TOKEN` repository secret must contain a valid npm automation token with publish rights for the `@archznn` scope. Configure it under **Settings → Secrets and variables → Actions**.

## Dry run

```bash
bash scripts/npm-publish-dry-run.sh
```
