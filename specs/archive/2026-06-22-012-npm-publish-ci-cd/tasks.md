# Tasks: npm Publish CI/CD

## Spec
- [x] Create spec folder `specs/changes/012-npm-publish-ci-cd/`
- [x] Write `.spec.yaml`
- [x] Write `proposal.md`
- [x] Write `specs/spec.md`
- [x] Write `design.md`
- [x] Write `tasks.md`

## Repository Preparation
- [x] Ensure `package.json` version matches the current release.
- [x] Ensure `packages/cli/package.json` version matches the current release.
- [x] Ensure `packages/cli/package.json` dependency on `@archznn/crewloop-skills` is `^<version>` and aligned.
- [ ] Commit pending package rename changes (`@crewloop` → `@archznn`) — shipper step.

## Secret Setup
- [ ] Create an npm automation token with publish rights for the `@archznn` scope.
- [ ] Add the token as `NPM_TOKEN` in the GitHub repository secrets.

## Workflow Implementation
- [x] Create `.github/workflows/publish-npm.yml`.
- [x] Add trigger filter for tags `v[0-9]+.[0-9]+.[0-9]+`.
- [x] Add `validate` job that asserts version alignment between tag, root `package.json`, and CLI `package.json`.
- [x] Add `publish-skills` job that depends on `validate` and publishes `@archznn/crewloop-skills`.
- [x] Add `verify-skills` step that polls npm registry until the new version is visible.
- [x] Add `publish-cli` job that depends on `publish-skills` and publishes `@archznn/crewloop-cli`.
- [x] Add `verify-cli` step that confirms the CLI version is visible on npm.

## Optional Local Helper
- [x] Create `scripts/npm-publish-dry-run.sh` to run `npm publish --dry-run` for both packages locally.

## Documentation
- [x] Add a "Releasing" section to `README.md` explaining tag-based publish.
- [x] Add a note to `packages/cli/README.md` about the automated publish flow.

## Verification
- [x] Validate workflow YAML syntax with Python yaml loader (`actionlint` not installed).
- [x] Run `python scripts/validate-skills.py` to confirm skills still validate.
- [x] Run `npm run typecheck` and `npm test` in `packages/cli/`.
- [ ] Perform a real test by pushing a tag and confirming both packages publish.

## Completion
- [x] Update `.spec.yaml` status to completed.
- [x] Archive change folder to `specs/archive/2026-06-22-012-npm-publish-ci-cd/`.
- [x] Update `specs/living/npm-distribution/spec.md`.
