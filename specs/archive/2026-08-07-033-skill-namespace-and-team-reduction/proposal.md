# Proposal: Skill Namespace `crewloop:*` & Team Reduction to 8 Skills

> Metadata (status, dates, author, affected files) lives in `.spec.yaml` — do not duplicate it here.

## Problem Statement

CrewLoop currently ships 19 skills with flat names (`architect`, `engineer`, …) that collide with generic skill names in agent environments and make the bundle hard to identify. Two decisions were made by the project owner:

1. **Namespace all skills under `crewloop:*`** — skills become `/crewloop:plan`, `/crewloop:code`, etc., giving the bundle a clear, collision-free identity across agents (Claude, Kimi, Codex, AGY, OpenCode).
2. **Reduce the team to 8 skills** — the 11 supporting skills that were never validated in practice (by AI or human testing) are removed so the shipped flow is 100% tested end-to-end.

## Goals

1. Rename the 8 remaining skills to the `crewloop:*` namespace — frontmatter `name:` AND directory names (`skills/crewloop-plan/` etc.).
2. Delete the 11 unvalidated supporting skills and purge every reference to them across skills, references, CLI, dashboard, docs site, validator, AGENTS.md and README.md.
3. Simplify the transition contract to the core flow: Hub → plan → design (if UI) → code ⇄ review → ship, plus brainstorm → plan and docs-writer as the only supporting skill.
4. Remove DiamondBlock-specific logic from the CLI (`--diamondblock` flag, `doctor` checks) and from the workflow conventions.
5. Keep every validation gate green: `validate-skills.py`, CLI tests/build, dashboard tests/build.

## Non-Goals

- No changes to the workflow semantics of the remaining 8 skills (roles, prefixes, AFK rules stay the same — only names/routes change).
- No new skills are introduced.
- No version bump / npm publish logic changes beyond what name updates require (Shipper handles tagging at ship time).
- Archive (`specs/archive/`) is NOT rewritten — historical specs keep old names for auditability.
- `specs/living/` is updated only in domains affected by this change (cli, dashboard, docs, supporting-team-skills).

## Constraints

- The `name:` field in each SKILL.md frontmatter must match the directory name convention expected by installers (`crewloop install` copies directories as-is).
- `scripts/validate-skills.py` `EXPECTED_SKILLS` and AFK-target checks must reflect the 8-skill set and new names.
- Agent hook configs installed by the CLI reference `crewloop-hub` as default skill — must become `crewloop:hub` (or the resolved installed name).
- Existing users may have the 19-skill set installed; the change is source-only, but docs should mention the reduced bundle.
- Commit/branch conventions unchanged (Conventional Commits, `refactor/` branch).

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missed cross-reference to a removed skill breaks routing or validation | High | Repo-wide `rg` sweep for all 19 old names + 11 removed names as a dedicated task; validator enforces closure |
| Dashboard skill icons/inference keyed by old names silently degrade | Med | Update registry/constants/mapping + tests; run dashboard test suite |
| CLI `--diamondblock` removal breaks scripts users may have | Low | Document removal in README; doctor warns cleanly |
| Directory rename breaks `crewloop install` path assumptions | Med | Installer is generic over directories, but root detection (`skills/crewloop-hub/SKILL.md`) is hardcoded — updated and tested |
| Docs site cards/sidebar out of sync with shipped skills | Med | Single source list update in `sidebarConfig.ts` + `LandingPage.tsx` + tests |

## Success Criteria

- [ ] Exactly 8 directories under `skills/`, named `crewloop-hub`, `crewloop-plan`, `crewloop-design`, `crewloop-code`, `crewloop-review`, `crewloop-ship`, `crewloop-brainstorm`, `crewloop-docs`, each with `name:` matching → verified by T2, T3
- [ ] Zero repo references (outside `specs/archive/`) to the 11 removed skills or to old flat names of the 8 kept skills → verified by T7
- [ ] `python scripts/validate-skills.py` exits 0 → verified by T8
- [ ] `npm test` + `npm run build` pass in `packages/cli/` → verified by T4, T8
- [ ] `npm test` + `npm run build` pass in `servers/dashboard/` → verified by T5, T8
- [ ] Docs site builds and lists only the 8 skills → verified by T6, T8
- [ ] ADR 007 records the namespace + reduction decision → verified by T1
