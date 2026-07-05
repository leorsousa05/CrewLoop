---
sidebar_position: 6
---

# Shipper

> Git operations and PR preparation. The only skill allowed to touch git.

**Phase:** Ship

## Role

The Shipper is the only skill authorized to perform git operations. After the Reviewer approves, the Shipper packages the changes cleanly: analyzes the diff, archives the spec, drafts a Conventional Commits message, creates a branch, commits, pushes, prepares a PR, and can create annotated tags and draft releases when explicitly requested.

## Responsibilities

1. Verify git state: check git status, git diff --stat, git log, and remote configuration.
2. Read the full diff to understand what changed and categorize the change type.
3. Determine the correct Conventional Commits type and scope.
4. Verify and execute package version bumps (`npm version <type>`) if versioning applies, aligning internal dependencies in workspaces.
5. Archive the spec: move specs/changes/NNN-name/ to specs/archive/YYYY-MM-DD-NNN-name/.
6. Draft the commit message: type(scope): description in imperative mood, max 72 chars, no trailing period. Add a body for non-trivial changes.
7. Create the branch: type/short-description in kebab-case.
8. Stage all changes, commit, and push to the remote.
9. Generate and display the PR creation link.
10. When explicitly requested, create an annotated tag (`vX.Y.Z`) with a structured tag message and draft release notes grouped by Conventional Commits type.

## What Shipper Never Does

- ❌ Write implementation code or fix functional bugs (Exception: Allowed to run version bump commands like `npm version` or modify manifest JSON files to update version strings).
- ❌ Review code or fix bugs.
- ❌ Commit without showing the diff first.
- ❌ Use vague messages ("update", "fix", "changes").
- ❌ Force push.
- ❌ Create tags or releases without explicit user confirmation.
- ❌ Invent release notes; derive them from commits since the last tag.
- ❌ Overwrite an existing tag.
- ❌ Commit `.env` files, secrets, or build directories.

## Output Artifact

| Artifact | Description |
|----------|-------------|
| **Branch** | type/short-description (kebab-case) |
| **Commit** | Conventional Commits message with scope and optional body |
| **Bumped Version** | Staged manifest changes updating project and dependency versions |
| **Archived spec** | specs/archive/YYYY-MM-DD-NNN-name/ |
| **PR link** | Platform URL for opening the pull request |
| **Tag** | Annotated semver tag (when explicitly requested) |
| **Release notes** | Markdown notes grouped by Conventional Commits type |

## Concrete Example

**Shipper ships JWT login:**
1. Verifies Reviewer approval.
2. Identifies commit type as `feat` (requires a minor version bump).
3. Executes `npm version minor --workspaces --no-git-tag-version` after user confirmation.
4. Updates local dependency reference of CLI on the root package.
5. Archives spec to `specs/archive/2026-06-27-003-jwt-login/`.
6. Creates branch `feat/jwt-login-page`.
7. Commits with message:
   ```
   feat(auth): add JWT login page with animated form

   - LoginForm component with focus animations
   - useAuth hook with JWT storage
   - POST /auth/login integration
   - Unit and integration tests
   - Accessibility: aria-label, role=form, Escape-to-dismiss
   ```
8. Pushes to remote repository and generates PR link.

## Handoff

**Invoked by:** Reviewer.  
**Sends to:** Orchestrator (returns control to start the next loop).

```markdown
**What would you like to do?**

- **[O] Return to Orchestrator** — Next task or adjustments
```
