# Spec Delta: Shipper Tags and Releases

## Current System

- `skills/shipper/SKILL.md` covers: git state verification, diff reading, conventional commit categorization, version bump, branch naming, commit drafting, presenting to user, executing commit/push, PR link generation, and anti-patterns.
- `docs/docs/core/shipper.md` mirrors the skill responsibilities in the public docs.
- `.github/workflows/release-tag.yml` creates an annotated tag automatically when `main` is pushed with a new `package.json` version.
- There is no guidance in the Shipper skill about:
  - When to create tags manually.
  - How to write tag messages.
  - How to draft release notes / release messages.
  - How to open a GitHub/GitLab release page.

## Proposed Change

### ADDED

1. **New Shipper workflow step: "Tags & Releases"**
   - Trigger conditions for manual tagging (user asks for a release, version bump is present, no CI tag exists).
   - Tag naming convention: `vMAJOR.MINOR.PATCH`.
   - Annotated tag message format:
     ```
     Release vX.Y.Z

     - Summary line 1
     - Summary line 2
     ```
   - Derive release notes from commits since the last tag using `git log` grouped by Conventional Commits type.
   - Generate GitHub/GitLab release link or use `gh release create` / `glab release create` with user confirmation.

2. **New validation rules**
   - Never create a tag without user confirmation.
   - Never overwrite an existing tag.
   - Tag message must reference the version and a short summary.
   - Release notes must list real commits; no invented items.

3. **New examples in the skill**
   - Annotated tag example.
   - Release notes example (Markdown, grouped by type).
   - GitHub release URL example.

### MODIFIED

- `skills/shipper/SKILL.md` — insert new step after "Execute", update responsibilities, anti-patterns, and examples.
- `docs/docs/core/shipper.md` — update responsibilities and output artifacts to mention tags and releases.

### REMOVED

- None.
