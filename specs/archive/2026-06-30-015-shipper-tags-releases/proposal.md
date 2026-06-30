# Proposal: Shipper Tags and Releases

## WHY

The Shipper skill already covers commit messages, branch names, PR preparation, and package version bumps. However, the published CrewLoop packages are released via Git tags (created by `.github/workflows/release-tag.yml`) and the releases are visible on GitHub. The current skill instructions do not tell the Shipper how to:

- Decide when an annotated git tag should be created locally or left to CI.
- Write a consistent tag message.
- Draft release notes / release messages for GitHub or GitLab.
- Link a release to the conventional commits that compose it.

This leads to inconsistent or missing release metadata, and forces maintainers to manually write release notes after CI runs. Adding explicit release-tag guidance keeps the Shipper as the single owner of all git-facing operations.

## Scope

This change expands the Shipper skill (and its public docs page) with a dedicated section on tags and releases. It does NOT change the CI workflows; it only instructs the Shipper agent on how to behave when a release is expected or requested.

### ADDED

- New "Step 8: Tags & Releases" in `skills/shipper/SKILL.md`:
  - When to create a tag (only when explicitly asked or when the version bump requires it).
  - How to format an annotated tag message.
  - How to derive release notes from Conventional Commits since the last tag.
  - How to publish a GitHub/GitLab release (manual link or `gh`/`glab` CLI).
- New example tag message and release notes in the skill.
- Update `docs/docs/core/shipper.md` to mirror the new responsibilities.

### MODIFIED

- `skills/shipper/SKILL.md` — add tag/release step and examples.
- `docs/docs/core/shipper.md` — reflect tag/release responsibilities.

### REMOVED

- None.

## Constraints

- The Shipper must NOT create tags automatically unless the user explicitly asks for a release.
- Tag names must follow semver: `vMAJOR.MINOR.PATCH`.
- Annotated tags must reference the version bump commit.
- Release notes must be derived from actual commits; never invent changes.
- The existing CI workflow (`release-tag.yml`) remains the default path for automatic tagging on `main`; this skill addition covers manual/local release tasks.

## What is NOT in scope

- Changing `.github/workflows/release-tag.yml` or `.github/workflows/publish-npm.yml`.
- Adding a new CLI command for releases.
- Automating npm publishing beyond what CI already does.
