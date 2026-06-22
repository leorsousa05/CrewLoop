# npm Distribution

CrewLoop is distributed through npm as two public packages under the `@archznn` scope.

## Packages

| Package | Location | Contents |
|---------|----------|----------|
| `@archznn/crewloop-skills` | Repository root `package.json` | `skills/` directory with all `SKILL.md` files |
| `@archznn/crewloop-cli` | `packages/cli/package.json` | `crewloop` CLI installer |

## Installation

Install the CLI globally and install all skills:

```bash
npm install -g @archznn/crewloop-cli
crewloop install
```

Install only selected skills:

```bash
crewloop install --skill architect --skill engineer
```

Install to a custom directory:

```bash
crewloop install --target /path/to/skills
```

## Publishing

Publishing is automated via GitHub Actions. When a semantic-version tag is pushed, the workflow in `.github/workflows/publish-npm.yml`:

1. Validates that the tag matches both `package.json` versions and the CLI dependency on the skills package.
2. Publishes `@archznn/crewloop-skills`.
3. Waits until the new version is visible on npm.
4. Publishes `@archznn/crewloop-cli`.

Required secret: `NPM_TOKEN` (npm automation token with publish rights for the `@archznn` scope).

To release:

```bash
git tag v0.2.0
git push origin v0.2.0
```

## Local Dry-Run

Preview what would be published without uploading:

```bash
./scripts/npm-publish-dry-run.sh
```

## Source Fallback

Users who do not use npm can still run `./scripts/install.sh` to copy skills from a git clone.
