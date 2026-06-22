# Design: npm Publish CI/CD

## Overview

Introduce a single GitHub Actions workflow that transforms a semantic-version git tag into two published npm packages. The workflow is intentionally simple: no matrix builds, no release assets, no GitHub Releases integration in this iteration. It focuses on reliability, traceability, and secret safety.

## Proposed Directory & File Structure

```
CrewLoop/
├── .github/
│   └── workflows/
│       ├── deploy.yml            # existing Docusaurus deploy (unchanged)
│       └── publish-npm.yml       # NEW: npm publish workflow
├── scripts/
│   └── npm-publish-dry-run.sh    # NEW: local dry-run helper (optional)
├── package.json                  # @archznn/crewloop-skills
├── packages/
│   └── cli/
│       └── package.json          # @archznn/crewloop-cli
└── specs/
    └── changes/
        └── 012-npm-publish-ci-cd/
            └── ...
```

## Code Architecture & Design Patterns

- **Pipeline pattern:** The workflow is a linear pipeline of validation → publish skills → verify → publish CLI.
- **Fail-fast validation:** Version alignment and dependency checks run before any network call to npm.
- **Job dependency ordering:** `publish-cli` declares `needs: publish-skills` so GitHub Actions enforces publication order.
- **Least-privilege secrets:** Only the publish jobs receive `NPM_TOKEN`; checkout and validation steps do not require it.

## Data Model

No runtime data model is introduced. The workflow treats these immutable inputs:

```yaml
inputs:
  git_ref: ${{ github.ref }}            # refs/tags/vX.Y.Z
  tag_name: ${{ github.ref_name }}      # vX.Y.Z
  npm_token: ${{ secrets.NPM_TOKEN }}   # GitHub secret
```

Derived values:

```yaml
version: "${TAG#v}"                   # X.Y.Z
skills_package: "@archznn/crewloop-skills"
cli_package: "@archznn/crewloop-cli"
```

## API Contracts

There are no new code APIs. The contract is the workflow interface between git tags and the npm registry.

### Workflow trigger contract

```yaml
on:
  push:
    tags:
      - 'v[0-9]+.[0-9]+.[0-9]+'
```

### npm registry contract

- `npm publish --workspace @archznn/crewloop-skills --access public`
- `npm view @archznn/crewloop-skills@${VERSION} version` must return the expected version before CLI publish.
- `npm publish --workspace @archznn/crewloop-cli --access public`

## Build & Publish Flow

### Full workflow

1. **Trigger:** Push tag `vX.Y.Z`.
2. **Validate versions:**
   - Extract `VERSION` from tag.
   - Assert `package.json` version equals `VERSION`.
   - Assert `packages/cli/package.json` version equals `VERSION`.
   - Assert `packages/cli/package.json` dependency on `@archznn/crewloop-skills` is `^${VERSION}`.
3. **Publish skills (`publish-skills`):**
   - Checkout repository.
   - Setup Node.js 20 with npm registry authentication (`NODE_AUTH_TOKEN`).
   - Run `npm ci`.
   - Run `npm run build --workspace @archznn/crewloop-cli` to ensure CLI artifact is fresh.
   - Run `npm publish --workspace @archznn/crewloop-skills --access public`.
4. **Verify skills publish:**
   - Poll `npm view @archznn/crewloop-skills@${VERSION} version` until it returns `VERSION` (with timeout).
5. **Publish CLI (`publish-cli`):**
   - Checkout repository.
   - Setup Node.js 20 with npm registry authentication.
   - Run `npm ci`.
   - Run `npm publish --workspace @archznn/crewloop-cli --access public`.
6. **Post-publish verification:**
   - `npm view @archznn/crewloop-cli@${VERSION} version` returns `VERSION`.

## State Management

No persistent state. The workflow relies on:

- Git tag as the source of truth for version.
- npm registry as the source of truth for publish success.
- GitHub Actions job dependencies to enforce ordering.

## Error Handling

- Misformatted tag → workflow does not trigger.
- Version mismatch → workflow fails in the validation job with a clear message.
- Skills publish failure → `publish-cli` is skipped because of `needs`.
- npm registry replication delay → verify step retries with exponential backoff.
- CLI dependency mismatch → fails before CLI publish.

## Security Considerations

- `NPM_TOKEN` is stored as a GitHub Actions secret.
- `npm config set` or `actions/setup-node` with `registry-url` writes `.npmrc` with auth; no token is echoed.
- Publish jobs use a dedicated job so the token scope is limited.
- Workflow does not accept untrusted input in shell commands; versions are derived from the tag and validated against `package.json`.

## Performance Considerations

- Workflow runs only on tags, so it is not on the critical path for every push.
- `npm ci` runs in both jobs, which adds some duplication but keeps each job independent and easier to retry.
- The skills verification poll should cap at 60 seconds with a 5-second interval.

## Future Extentions (out of scope)

- Generate GitHub Releases with release notes.
- Attach provenance attestations via `npm publish --provenance` once the repository is public and npm supports it.
- Add a `dry-run` mode that publishes to the npm staging registry.
