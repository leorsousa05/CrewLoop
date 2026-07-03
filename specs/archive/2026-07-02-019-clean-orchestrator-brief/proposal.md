# Proposal: Clean Orchestrator Brief and Shipper Version Bumps

## Motivation
1. **Orchestrator Brief Clutter**: The `orchestrator` skill forces the output of a long, verbose Task Brief with empty/irrelevant sections. We need to simplify the brief to focus only on populated, essential topics.
2. **Shipper Version Bumps**: The `shipper` skill frequently forgets to bump versions for projects/workspaces that require it. The current rule only checks if the manifest file itself is in the diff, which is incorrect because version bumps are needed whenever files *within* the package directory are modified by a `feat` or `fix`.

## Scope
- **Orchestrator**:
  - Update `skills/orchestrator/SKILL.md` to simplify the Task Brief template.
  - Dynamically omit non-populated or non-applicable headers/sections.
- **Shipper**:
  - Update `skills/shipper/SKILL.md` to enforce version bumps whenever modified files belong to a versioned workspace/package.
  - Change the manifest check rule: inspect the file paths of all modified files. If any file path starts with a versioned workspace prefix (e.g. `packages/cli/`), and the commit type is `feat` or `fix`, trigger a mandatory version bump.
  - Force the Shipper to suggest/execute the bump command and confirm with the user before committing.

## Constraints
- Must pass `python3 scripts/validate-skills.py`.
