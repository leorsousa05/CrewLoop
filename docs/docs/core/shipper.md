---
sidebar_position: 6
---

# Shipper

> Git operations and PR preparation. The only skill allowed to touch git.

**Phase:** Ship

## Role

The Shipper is the only skill authorized to perform git operations. After the Reviewer approves, the Shipper packages the changes cleanly: analyzes the diff, archives the spec, drafts a Conventional Commits message, creates a branch, commits, pushes, and prepares a PR.

## Responsibilities

1. Verify git state: check git status, git diff --stat, git log, and remote configuration.
2. Read the full diff to understand what changed and categorize the change type.
3. Determine the correct Conventional Commits type and scope.
4. Archive the spec: move specs/changes/NNN-name/ to specs/archive/YYYY-MM-DD-NNN-name/.
5. Draft the commit message: type(scope): description in imperative mood, max 72 chars, no trailing period. Add a body for non-trivial changes.
6. Create the branch: type/short-description in kebab-case.
7. Stage all changes, commit, and push to the remote.
8. Generate and display the PR creation link.

## What Shipper Never Does

- ❌ Write implementation code.
- ❌ Review code or fix bugs.
- ❌ Commit without showing the diff first.
- ❌ Use vague messages ("update", "fix", "changes").
- ❌ Force push.
- ❌ Commit `.env` files, secrets, or build directories.

## Output Artifact

| Artifact | Description |
|----------|-------------|
| **Branch** | type/short-description (kebab-case) |
| **Commit** | Conventional Commits message with scope and optional body |
| **Archived spec** | specs/archive/YYYY-MM-DD-NNN-name/ |
| **PR link** | Platform URL for opening the pull request |

## Concrete Example

**Shipper ships JWT login:**
1. Verifies Reviewer approval.
2. Archives spec to `specs/archive/2026-06-27-003-jwt-login/`.
3. Creates branch `feat/jwt-login-page`.
4. Commits with message:
   ```
   feat(auth): add JWT login page with animated form

   - LoginForm component with focus animations
   - useAuth hook with JWT storage
   - POST /auth/login integration
   - Unit and integration tests
   - Accessibility: aria-label, role=form, Escape-to-dismiss
   ```
5. Pushes to remote repository and generates PR link.

## Handoff

**Invoked by:** Reviewer.  
**Sends to:** Orchestrator (returns control to start the next loop).

```markdown
**What would you like to do?**

- **[O] Return to Orchestrator** — Next task or adjustments
```
