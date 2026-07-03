# Spec: shipper-skill

## Proposed Changes

### 1. skills/shipper/SKILL.md
- **Mandatory Bump Verification**:
  - In Step 4 (Verify & Bump Package Version), update the detection logic:
    1. Inspect all files in the git diff using `git diff --name-only`.
    2. Map these files to their respective versioned package/workspace directories (e.g., `packages/cli/*` maps to `packages/cli`, `servers/dashboard/*` maps to `servers/dashboard`).
    3. If any file belongs to a versioned workspace, and the commit type is `feat` or `fix` (or has breaking changes `!`), a version bump is **mandatory** for that workspace.
  - Reject proceeding to Step 8 without presenting the version bump command options to the user if a bump is required but hasn't been committed yet.
- **Fail-Safe Gate**:
  - Add an automatic fail check to the Shipper's self-checklist:
    - `❌ Proceeding with feat/fix commit without bumping version of modified workspaces.`
