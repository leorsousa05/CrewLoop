# Proposal: Automate npm Publishing with GitHub Actions

## Status
- **State:** active
- **Created:** 2026-06-22
- **Author:** agent

## Problem Statement

CrewLoop now ships two npm packages — `@archznn/crewloop-skills` and `@archznn/crewloop-cli` — but both are published manually from a local developer machine. The manual process is error-prone, opaque, and hard to reproduce:

- It requires a local `npm login` and access token with publish rights.
- Version bumps, tagging, and package ordering (skills first, then CLI) are done by hand.
- There is no audit trail linking a git release to the published tarball.
- A single mistake can publish a broken CLI that depends on an unpublished skills version.
- Other maintainers cannot publish without sharing credentials.

Manual publishing also conflicts with the Conventional Commits workflow enforced by the shipper skill: releases should be reproducible, traceable, and gated by the repository state.

## Goals

1. Add a GitHub Actions workflow that publishes both packages to npm automatically.
2. Trigger publication only on pushed git tags matching `v*.*.*` (semantic versions).
3. Guarantee publication order: publish `@archznn/crewloop-skills` before `@archznn/crewloop-cli`.
4. Use an npm automation token stored as a GitHub secret (`NPM_TOKEN`).
5. Verify the package contents and dependency versions before publishing.
6. Keep the existing Docusaurus deploy workflow untouched.

## Non-Goals

- Changing the package scope or package names.
- Adding integration tests that require npm registry network access.
- Supporting pre-releases, canary builds, or nightly publishes in this iteration.
- Replacing manual `npm publish` entirely for emergency fixes (maintainers can still run locally if needed).
- Creating a changelog generator or GitHub Releases page.

## Constraints

- The workflow must use the Node.js version declared by the project (`>=18`).
- It must run `npm ci` using the root `package-lock.json` and the CLI lockfile.
- It must not leak the npm token in logs or artifacts.
- It must fail fast if the CLI dependency version does not match the published skills version.
- It must respect npm provenance for published packages when possible.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| NPM_TOKEN secret missing or expired | High | Document setup steps; workflow fails clearly with a secret-check step. |
| CLI depends on a skills version not yet published | High | Publish skills first, then validate CLI `package.json` before publishing CLI. |
| Tag pushed before code is ready | Med | Workflow runs only on tags; enforce that tags are created from `main` via branch rules. |
| npm 2FA blocks automation | Med | Use an npm automation token, which bypasses 2FA for programmatic publish. |
| Windows-only local tests hide workflow failures | Low | Workflow runs on `ubuntu-latest`; add local dry-run script. |

## Success Criteria

- [ ] Pushing a git tag `v0.2.0` triggers the workflow.
- [ ] The workflow publishes `@archznn/crewloop-skills@0.2.0`.
- [ ] The workflow then publishes `@archznn/crewloop-cli@0.2.0`.
- [ ] `npm view @archznn/crewloop-cli@0.2.0` shows the correct `dependencies["@archznn/crewloop-skills"]` version.
- [ ] A failed publish prevents the dependent package from publishing.
- [ ] The npm token is never printed in logs.

## Related Work

- Spec `011-npm-distribution` introduced the npm packages and CLI.
- `.github/workflows/deploy.yml` deploys documentation; the new workflow must not conflict with it.
