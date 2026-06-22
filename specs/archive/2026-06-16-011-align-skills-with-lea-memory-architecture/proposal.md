# Proposal: Align skills with ~/.lea three-layer memory architecture

## Status
- **State:** active
- **Created:** 2026-06-16
- **Author:** @architect

## Problem Statement
The `~/.lea` Obsidian vault has migrated from flat folders (`concepts/`, `decisions/`, `projects/`, `dashboards/`) to a three-layer memory architecture (`memory/`, `Memory/`, `Knowledge/`, `Journal/`, `Notes/`, `_Inbox/`). Several skills still trigger on or reference the old names, causing agents to search or write to the wrong layers and weakening the second-brain contract.

## Goals
1. Update `obsidian-second-brain` trigger language to be layer-aware.
2. Make `architect` distinguish project ADRs (`specs/decisions/`) from vault decisions/knowledge (`Knowledge/`).
3. Convert the `shipper` commented placeholder into actionable steps.
4. Optionally tighten generic "prior decisions" references in `tester`, `maintainer`, `product-manager`, and `researcher`.

## Non-Goals
- Change MCP server code or runtime behavior.
- Update deferred test files or `specs/living/obsidian-second-brain/`.
- Migrate actual vault folders (assumed already done).

## Constraints
- Documentation/skills only.
- Preserve frontmatter and letter-based navigation menus.
- Maintain Conventional Commits branch naming.
- All vault access must be delegated to `obsidian-second-brain`.

## Risks
| Risk | Impact | Mitigation |
| Old folder names linger in references | Med | Post-edit grep for `concepts/`, `projects/`, `docs/decisions/`, `dashboards/`. |
| `specs/decisions/` confused with `Knowledge/` decisions | Med | Add explicit note in `architect` skill. |
| Broken frontmatter from edits | Low | Run `validate-skills.py`. |

## Success Criteria
- [ ] `obsidian-second-brain` description uses layer-aware terms.
- [ ] `architect` skill points to `specs/decisions/` and `Knowledge/` correctly.
- [ ] `shipper` placeholder resolved.
- [ ] No old folder names remain in `skills/`.
- [ ] `python scripts/validate-skills.py` passes.
