# Tags & Releases Guidelines

The CrewLoop repository uses `.github/workflows/release-tag.yml` to create annotated tags automatically when `main` is pushed with a new `package.json` version. Treat CI as the default tagging path. Only proceed with manual tagging when the user explicitly asks for a release or when CI cannot be used.

## When to create a tag manually
- The user says "create a release", "tag this version", or similar.
- The version bump has been committed but no CI pipeline will create the tag.
- You are working on a fork or environment where `release-tag.yml` does not run.

## Rules
| Concern | Rule |
|---------|------|
| Tag name | `vMAJOR.MINOR.PATCH` (semver, prefixed with `v`). |
| Tag type | Annotated: `git tag -a vX.Y.Z -m "..."`. |
| Tag target | The version bump commit (usually `HEAD`). |
| Existing tag | Abort and warn if the tag already exists. |
| Confirmation | Always ask before creating or pushing a tag. |
| Release notes | Derive from commits since the previous tag; never invent changes. |

## Detect context
```bash
# Last tag (if any)
git describe --tags --abbrev=0

# Commits since the last tag
git log <LAST_TAG>..HEAD --oneline

# Check whether a tag already exists
git rev-parse "vX.Y.Z" >/dev/null 2>&1 && echo "exists"
```

## Tag message template
```
Release vX.Y.Z

- Short summary of the release
- Optional second summary line
```

Example:
```
Release v0.10.0

- Add long-term-manager skill for multi-session tracking
- Update README and AGENTS.md with 18-skill bundle
```

## Release notes template
Group commits since the previous tag by Conventional Commits type:
```markdown
## What's Changed

### Features
- feat(scope): description (#123)

### Bug Fixes
- fix(scope): description (#124)

### Documentation
- docs(scope): description (#125)

### Other Changes
- chore(scope): description (#126)
```

## Execution (after user confirmation)
Create the annotated tag:
```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z

- Summary line 1
- Summary line 2"
```

Push the tag:
```bash
git push origin vX.Y.Z
```

Open the GitHub release creation page:
```
https://github.com/<owner>/<repo>/releases/new?tag=vX.Y.Z
```

Or create the release via the GitHub CLI (if available and confirmed):
```bash
gh release create vX.Y.Z --title "Release vX.Y.Z" --notes-file release-notes.md
```

## GitLab / Bitbucket equivalents
- GitLab release URL: `https://gitlab.com/<owner>/<repo>/-/releases/new?tag_name=vX.Y.Z`
- Bitbucket tag page: create the tag first, then use the repository's "Create release" UI.
