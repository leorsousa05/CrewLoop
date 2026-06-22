# Shipper

**Phase:** Git & PR

The Shipper is the only skill allowed to touch git. After review, it packages the changes cleanly: analyzes the diff, drafts a Conventional Commit message, creates a branch, commits, pushes, and prepares the PR.

## What the Shipper does

The Shipper is a git workflow specialist. It does not write code, review code, or fix bugs. It ships what is already built and reviewed.

### Core responsibilities

1. **Verify git state**
   - Check `git status`, `git diff --stat`, `git log`, remote configuration.
   - Confirm there are changes to ship.

2. **Read the diff**
   - Understand what changed.
   - Categorize the change type.

3. **Analyze and categorize**
   - Determine Conventional Commit type: `feat`, `fix`, `docs`, `refactor`, `test`, etc.
   - Identify scope.

4. **Archive specs**
   - Move completed specs from `specs/changes/NNN-name/` to `specs/archive/YYYY-MM-DD-NNN-name/`.

5. **Draft commit message**
   - Follow Conventional Commits.
   - Include body for non-trivial changes.

6. **Create branch and commit**
   - Branch name: `<type>/<short-description>` in kebab-case.
   - Stage, commit, and push.

7. **Prepare PR**
   - Generate PR link based on remote platform (GitHub, GitLab, Bitbucket).

## When to invoke

The Shipper triggers after Reviewer approval, or when the user says:

- "Commit this"
- "Create PR"
- "Ship it"
- "Push changes"

## Concrete example

**Shipping JWT login page:**

**Shipper:**

1. Runs `git status --short` and sees modified files.
2. Analyzes diff and categorizes as `feat(auth)`.
3. Drafts commit message:
   ```
   feat(auth): add JWT login page

   Implement login form, auth API client, and protected route.
   Add unit tests for form validation, API call, and route guard.

   - Add LoginForm component
   - Add auth service with JWT token handling
   - Add ProtectedRoute wrapper
   - Add tests for auth flow
   ```
4. Creates branch `feat/jwt-login-page`.
5. Archives spec from `specs/changes/002-jwt-login/` to `specs/archive/2026-06-22-002-jwt-login/`.
6. Stages, commits, and pushes.
7. Generates PR link: `https://github.com/leorsousa05/CrewLoop/compare/feat/jwt-login-page?expand=1`.

## What the Shipper never does

- ❌ Write code
- ❌ Review code
- ❌ Fix bugs
- ❌ Commit without showing the diff first
- ❌ Use vague commit messages like "update" or "fix"
- ❌ Force push

## Conventional Commits types

| Type | Use when |
|------|----------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change without behavior change |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `build` | Build system changes |
| `ci` | CI/CD changes |
| `chore` | Maintenance, deps, config |
| `revert` | Reverting a previous commit |

## Handoff

**Next skill:** Orchestrator.

## Navigation menu example

```markdown
**What would you like to do?**

- **[C] Commit & Push** — Create branch, commit, and push
- **[P] Commit, Push & Open PR** — All of the above + PR link
- **[E] Edit** — Change commit message, branch name, or scope
- **[R] Review** — Go back to review the changes
- **[O] Back to Orchestrator** — New task or continue working
- **[N] Cancel** — Do nothing, keep changes unstaged
```
