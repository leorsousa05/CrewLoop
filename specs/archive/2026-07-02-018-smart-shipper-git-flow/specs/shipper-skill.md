# Spec: shipper-skill

## Proposed Changes

### 1. skills/shipper/SKILL.md
- **Remote Origin & Main Checks**:
  - Run `git remote -v`. If no remote output, ask the user: "No remote origin configured. Please provide the Git remote URL to configure."
  - Run `git remote add origin <url>`.
  - Check if remote branches exist or if we are making the first commit. If yes, push directly to `main` without creating feature branches.
- **Collaboration Mode Selection**:
  - Prompt: "Would you like to push directly to `main` (Solo Mode) or create a branch to open a Pull Request (Teamwork Mode)?"
- **Advanced Stash Isolation**:
  - Add explicit steps to check for uncommitted changes unrelated to the current spec/task.
  - Stash unrelated changes: `git stash push -m "unrelated-changes-stash" -- <unrelated-files>` (or stash everything, checkout branch, and only pop/apply changes related to the target feature).
- **Formatted Diff & Change Report**:
  - Provide a clear template for diff reporting that shows two separate sections:
    1. **Feature/Fix Changes (Target Task)**: Files and line deltas that are part of the spec implementation.
    2. **Pre-existing / Unrelated Changes**: Files that were already modified in the working directory before starting this task.
- **GitHub CLI Integration**:
  - Check for `gh` command path. If available, add choices to the navigation menu:
    - `[P] Commit, Push & Open PR via gh` (runs `gh pr create --fill` or interactive).
    - `[I] Link to GitHub Issue` (runs `gh issue list` or links).
