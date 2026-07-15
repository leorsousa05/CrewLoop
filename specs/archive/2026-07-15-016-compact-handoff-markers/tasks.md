# Tasks: Direct Handoff Without Commands

## Contract and Validation

- [x] Add `references/skill-contracts.yaml` for all 19 skills.
- [x] Extend `scripts/validate-skills.py` with manifest, inventory, frontmatter-type, fence, link, prefix, menu, and AFK validation.
- [x] Add fixture-driven validator tests for known and boundary failures.
- [x] Structure manifest menu entries with target, recommendation, and optional condition metadata.
- [x] Validate known targets, return strategies, exact capsule boundaries, and instruction precedence.
- [x] Add regression fixtures for contradictory later footers, malformed frontmatter delimiters, and robust fence handling.

## Shared Guidance

- [x] Normalize `references/conventions.md`, `references/workflow.md`, and `AGENTS.md`.
- [x] Define all 19 role prefixes and the universal non-Hub AFK return rule.
- [x] Reconcile ADR 002 with no-command handoffs and Hub-mediated AFK.

## Skill Migration

- [x] Normalize the six core skills.
- [x] Normalize Maintainer, Project Brainstorm, and Long-Term Manager.
- [x] Normalize DiamondBlock, Docs Writer, Researcher, and Product Manager.
- [x] Normalize Security Guard, Accessibility Auditor, and Tester.
- [x] Normalize Frontend Architect, Schema Designer, and DevOps Specialist.
- [x] Remove contradictory route phrases and repair Schema Designer Markdown.

## Authoring and Documentation

- [x] Update `assets/templates/skill-template.md` and `references/skill-anatomy.md`.
- [x] Update current README/docs references to 19 skills and direct routing.

## Verification

- [x] Run validator unit tests.
- [x] Run `python3 scripts/validate-skills.py`.
- [x] Run applicable workspace tests.
- [x] Run copy and symlink installation sandbox checks.
- [x] Repeat the 76-scenario behavioral matrix with 76 expected outcomes.
- [x] Submit to Reviewer and resolve all blocking findings.
