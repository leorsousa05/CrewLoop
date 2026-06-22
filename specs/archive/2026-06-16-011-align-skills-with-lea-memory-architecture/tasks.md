# Tasks: Align skills with ~/.lea three-layer memory architecture

## Setup
- [x] Create `specs/changes/001-align-skills-with-lea-memory-architecture/`.
- [x] Write `.spec.yaml`, `proposal.md`, `specs/spec.md`, `design.md`, `tasks.md`.

## Implementation
- [x] Update `skills/obsidian-second-brain/SKILL.md` description to layer-aware language.
- [x] Update `skills/architect/SKILL.md` to distinguish `specs/decisions/` vs `Knowledge/`.
- [x] Resolve `skills/shipper/SKILL.md` placeholder (lines 346-352) into actionable `obsidian-second-brain` step.
- [x] Tighten `skills/tester/SKILL.md` MCP tools reference.
- [x] Tighten `skills/maintainer/SKILL.md` MCP tools reference.
- [x] Tighten `skills/product-manager/SKILL.md` MCP tools reference.
- [x] Tighten `skills/researcher/SKILL.md` MCP tools reference.

## Verification
- [x] Run `python scripts/validate-skills.py` and fix any frontmatter errors.
- [x] Grep for old folder names in `skills/`:
  ```bash
  grep -R -E "concepts/|projects/|docs/decisions/|dashboards/" skills/
  ```
  Expected: no matches.
- [x] Confirm no new direct `~/.lea` read/write instructions were introduced.

## Documentation
- [ ] (Deferred) Update `specs/living/obsidian-second-brain/` in a follow-up spec if required.

## Completion
- [x] Mark `.spec.yaml` status completed after review/ship.
- [x] Shipper archives change folder and updates `Journal/loop-engineering-agents.md` via `obsidian-second-brain`.
