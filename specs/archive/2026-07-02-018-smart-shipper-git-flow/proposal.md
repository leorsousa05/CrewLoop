# Proposal: Smart Shipper Git Flow and Robust Features Isolation

## Motivation
The current `shipper` skill has several flaws when dealing with raw repository setups (no remote origin or main branch), lacks feature isolation (unrelated/unfinished changes from other tasks can leak into commits or PRs), cannot be configured in different collaboration modes (Solo vs Team), lacks visual separation in its diff report for pre-existing changes, and misses local automation hooks using the GitHub CLI (`gh`).

## Scope
- **Repo Initialization & Remote Checks**: Ask for remote origin URL and configure it if origin is missing. Push directly to `main` if it's the first commit/no remote main branch exists.
- **Team vs Solo Modes**: Prompt the user to select either "Solo Mode" (commit and push directly to `main`) or "Team Mode" (checkout feature branch and open PR).
- **Feature Isolation**: Implement advanced `git stash` checks to save unrelated modifications and prevent code leaks in PRs.
- **Detailed Diff & Category Report**: Separate pre-existing changes from changes related to the current task/spec in the user report.
- **GitHub CLI Automation**: Detect `gh` capability and offer automated PR/issue actions directly in the CLI navigation flow.

## Constraints
- Must pass `python3 scripts/validate-skills.py` checks.
- Changes are restricted to documentation and instructions inside `skills/shipper/`.
