# Design: Shipper Tags and Releases

## [Padrões Aplicados]

- **Single Responsibility:** The Shipper already owns all git operations; tags and releases are a natural extension of that responsibility, not a new role.
- **Convention over Configuration:** Tag names (`vX.Y.Z`), annotated tag messages, and release notes all follow existing Conventional Commits conventions so no new format needs to be learned.
- **Progressive Disclosure:** The skill defaults to CI-driven tagging (existing `release-tag.yml`) and only explains manual tagging/release drafting for when the user explicitly requests it.
- **Auditability:** Annotated tags and release notes reference the version bump commit and list real changes, creating a durable record of what was released.
- **Human-in-the-Loop:** The Shipper must ask before creating tags or releases, matching the existing confirmation pattern for version bumps and commits.

## Directory Structure

```
crewloop/
├── skills/
│   └── shipper/
│       └── SKILL.md              # Updated with tag/release section
├── docs/
│   └── docs/
│       └── core/
│           └── shipper.md        # Updated public docs
└── .github/
    └── workflows/
        ├── release-tag.yml       # Unchanged
        └── publish-npm.yml       # Unchanged
```

## Skill Contract

### Input

- Current branch and commit history.
- Last tag (if any): `git describe --tags --abbrev=0`.
- Conventional commit type and version bump decision from earlier Shipper steps.
- User request or explicit approval to create a release.

### Output

- Annotated git tag (when explicitly requested and confirmed).
- Draft release notes in Markdown.
- GitHub/GitLab release creation link or CLI command.

### Rules

| Concern | Rule |
|---------|------|
| Tag name | `vMAJOR.MINOR.PATCH` (semver, prefixed with `v`). |
| Tag type | Annotated: `git tag -a vX.Y.Z -m "..."`. |
| Tag target | The version bump commit (usually the latest commit). |
| Existing tag | If the tag already exists, abort and warn the user. |
| Release notes | Group commits since the last tag by Conventional Commits type. |
| Confirmation | Always ask before creating a tag or release. |
| CI default | Prefer the existing `release-tag.yml` workflow for automatic tagging on `main`. |

## Tag Message Template

```
Release vX.Y.Z

- Short summary of the release (one line)
- Optional second line
```

Example:

```
Release v0.10.0

- Add long-term-manager skill for multi-session tracking
- Update README and AGENTS.md with 18-skill bundle
```

## Release Notes Template

```markdown
## What's Changed

### Features
- feat(scope): description (#PR)

### Bug Fixes
- fix(scope): description (#PR)

### Documentation
- docs(scope): description (#PR)

### Other Changes
- chore(scope): description (#PR)
```

## Commands

Detect last tag:

```bash
git describe --tags --abbrev=0
```

List commits since last tag:

```bash
git log <last-tag>..HEAD --oneline
```

Create annotated tag (after confirmation):

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z

- Summary line 1
- Summary line 2"
```

Push tag:

```bash
git push origin vX.Y.Z
```

Open GitHub release page:

```
https://github.com/<owner>/<repo>/releases/new?tag=vX.Y.Z
```

Or create via CLI (with user confirmation):

```bash
gh release create vX.Y.Z --title "Release vX.Y.Z" --notes-file release-notes.md
```

## Test Plan

- Run `python scripts/validate-skills.py` after editing `skills/shipper/SKILL.md`.
- Verify `docs/docs/core/shipper.md` renders correctly in Docusaurus preview.
- Manual review: confirm the new tag/release section is consistent with existing Conventional Commits rules.

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Shipper creates tags without confirmation | Explicit rule: always ask before `git tag`. |
| Tag message becomes inconsistent | Provide a strict template and examples. |
| Release notes invent changes | Derive notes from `git log` only. |
| Conflicts with CI auto-tagging | Clarify that CI is the default; manual tagging is only on explicit request. |
| Tag overwrite | Check tag existence with `git rev-parse` and abort if found. |

## Deferred

- Automated changelog file generation.
- Integration with `gh`/`glab` CLI detection.
- Multi-package release notes for monorepos.

## Subagent Plan

This is a single skill-file update with a matching docs update. The changes are sequential (docs mirror skill) and small enough for one Engineer implementation. No parallel subagents needed.
