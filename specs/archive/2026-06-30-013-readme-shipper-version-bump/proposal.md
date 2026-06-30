# Proposal: Rewrite README, Update Shipper Version Bump Rules, and Bump Version

## WHY

After merging the `project-brainstorm` skill, two follow-up needs emerged:

1. The current README is functional but lacks standard open-source badges (NPM version, CI status) and could present the project with a more polished, technical-first structure.
2. The Shipper skill currently suggests a version bump but does not make it explicit that it must happen whenever the change touches versioned code. The previous PR (#53) was merged without a version bump, creating a gap between the feature and the published package.

This change fixes both gaps in one delivery.

## Scope

- Rewrite `README.md` with a technical tone, NPM/version badges, and clearer sections.
- Update `skills/shipper/SKILL.md` to enforce version bump checks and ask the user when unsure.
- Bump `@archznn/crewloop-skills` and `@archznn/crewloop-cli` from `0.8.0` to `0.9.0` (minor bump for the new `project-brainstorm` skill).

## Constraints

- Documentation-first project: only Markdown and JSON manifest files are modified.
- Badges must use real, working URLs for the project.
- Version bump rules in the Shipper skill must be simple: bugfix → patch, feat → minor, breaking → major.
- The Shipper skill must ask the user for confirmation before running any `npm version` command.

## What is NOT in scope

- Changes to the CLI source code.
- New skills or features beyond README polish and Shipper instructions.
