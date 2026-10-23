---
sidebar_position: 4
---

# Publishing

CrewLoop packages are published to npm automatically by GitHub Actions on semantic version tags. Manual publishing is not needed.

## Packages

| Package | Published |
|---------|----------|
| `@archznn/crewloop-skills` | Only package published; it bundles the `crewloop` CLI and the dashboard |

## How to release

1. Bump `version` in the root `package.json` (the private `packages/cli` workspace version is not published).
2. Merge the bump into `main`. The `release-tag` workflow creates the `v<version>` tag automatically when it does not exist yet; pushing a matching tag manually also works.

## What the workflow does

On a `v*.*.*` tag (or after `release-tag` succeeds):

1. Verifies that the tag matches the root `package.json` version and points to a commit on `main`.
2. Builds all workspaces and publishes `@archznn/crewloop-skills`, which includes the `crewloop` CLI (`packages/cli/dist/`) and the dashboard.
3. Waits for the new version to be visible on the npm registry.

## Required secret

The `NPM_TOKEN` repository secret must contain a valid npm automation token with publish rights for the `@archznn` scope. Configure it under **Settings → Secrets and variables → Actions**.

## Dry run

```bash
bash scripts/npm-publish-dry-run.sh
```
