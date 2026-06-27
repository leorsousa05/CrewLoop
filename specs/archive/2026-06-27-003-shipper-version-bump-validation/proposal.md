# Proposal — Add Version Bump Validation to Shipper Skill

## WHY

The `shipper` skill is responsible for final packaging, branching, committing, and opening PRs. However, it currently lacks checks or instructions for project versioning. In npm workspaces or versioned libraries, forgetting to bump the version before pushing a new feature (`feat`) or bug fix (`fix`) breaks release pipelines (e.g., GitHub Actions publishing tag conflicts or failing to publish because version already exists).

By introducing explicit pre-commit version checks and helper commands into the Shipper's guide, we guarantee that releases are properly versioned and CLI dependencies are aligned.

## SCOPE

- **In scope:**
  - Update `skills/shipper/SKILL.md` (source skill)
  - Update `/home/arch/.gemini/skills/shipper/SKILL.md` (agent's active local skill)
  - Update `docs/docs/core/shipper.md` (public documentation)
  - Validate skills with validator script

- **Out of scope:**
  - Updating other skill files.
  - Modifying code logic of CLI or dashboard.

## CONSTRAINTS

- Do not break YAML frontmatter in `skills/shipper/SKILL.md`.
- Keep changes in English (the language of the repository documentation).
- Ensure the Docusaurus build continues to pass.
