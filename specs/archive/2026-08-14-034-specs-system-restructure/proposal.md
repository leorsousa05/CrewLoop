# Proposal — Specs System Restructure (034)

## WHY

CrewLoop works, but the spec system it uses is actively producing bugs:

1. **Specs are throwaway.** Every change creates `specs/changes/NNN-name/`, and on ship it is moved to `specs/archive/YYYY-MM-DD-NNN-name/` and deltas are manually merged into `specs/living/`. In practice the `living/` merge is skipped or goes stale (`specs/living/dashboard/spec.md` and the archived 2026-07-10-014 spec describe removed views — see 032-dashboard-quality-documentation proposal). The result: the agent's next session re-discovers everything from scratch and re-introduces the same mistakes.
2. **No project memory.** There is no record of *why* decisions were made, what was tried and rejected, or what state each subsystem is in. The agent cannot distinguish "this was already decided" from "this is new", so it re-proposes dead ideas (the proposal's `archive/README.md` rule) and makes contradictory choices.
3. **Per-change context, not per-task context.** A spec describes a change; it does not describe *the work*. Tasks like "add login" sprawl across a change folder with `proposal.md` + `specs/` + `design.md` + `tasks.md`, while related future work (password reset, oauth) lives in completely unrelated folders. The agent never gets the stable, per-domain picture that reduces guesswork.
4. **No guard against re-implementing.** Nothing records "we already built this in chat on 2026-08-15". Implementation loops happen because completed work leaves no trace except an archived spec nobody re-reads.

The proposed structure fixes the root cause: the specs system becomes a **persistent project brain** (memory), a **stable reference layer** (shared), and a **task-oriented work layer** (features) — with RFCs (changes) for architecture decisions and an archive with a README index so dead ideas stay dead.

## Goals

- Restructure `specs/` into: `archive/`, `changes/` (RFCs only), `memory/`, `shared/`, `templates/`, `features/` (per-domain task specs).
- Introduce `memory/project-state.md` as the always-read file that describes current state, decisions, blockers, and next task.
- Feature specs become **single-file, task-oriented, canonical**: one spec = one task, with objective, context, requirements, behavior/flow, constraints, edge cases, acceptance criteria, and done-when. They **stay** in `features/` as the source of truth when completed (no archiving).
- RFC lifecycle: approved RFC → becomes an ADR in `shared/adrs/`; rejected RFC → archived with a reason in `archive/README.md`.
- Migrate existing content: `decisions/` → `shared/adrs/`, active `changes/` → `features/` by domain, `living/` merged into `shared/architecture-overview.md`, `docs/specs/` merged too, `archive/` kept with a new README index.
- Update all 6 SKILL.md files, `references/conventions.md`, `references/workflow.md`, `AGENTS.md`, `README.md`, and the docs site so every consumer speaks the new structure.

## Non-Goals

- Do **not** touch dashboard/CLI runtime code, their tests, or their READMEs (no behavioral change; path docs only if they reference spec paths — none found).
- Do **not** rewrite the content of archived specs (they are audit history; only add the README index).
- Do **not** change skill transition contracts (`references/skill-contracts.yaml`) or the validation script `scripts/validate-skills.py` — skills must keep passing it unchanged.
- Do **not** introduce new tooling, scripts, or CI jobs.
- Do **not** convert the plan skill's internal templates folder layout beyond adding the new template files — the canonical template location stays `skills/crewloop-plan/references/templates/`, synced to `specs/templates/`.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Stale references to old paths left behind (grep misses) | High | Medium | Dedicated task runs repo-wide grep for `specs/(changes\|living\|decisions)/` and whitelists archive/ contents |
| Skills break the validate-skills.py contract during rewrite | Medium | High | Run `python scripts/validate-skills.py` after each skill edit; contract section copied verbatim from the current file |
| Migrated specs lose content in the single-file conversion | Medium | High | Conversion preserves every requirement, acceptance criterion, and edge case; reviewer diffs old vs new |
| `living/` knowledge lost in merge | Medium | Medium | `shared/architecture-overview.md` is written from the 6 living domain specs before `living/` is removed |
| Docs site build breaks after page rewrites | Low | Medium | `npm run build` + `npm run lint` in `docs/` after edits |

## Acceptance Criteria

- **AC-01 (structure):** Given the repo root, running `ls specs/` shows exactly: `archive/ changes/ features/ memory/ shared/ templates/ README.md` and no `decisions/`, `living/`, or numbered change folders remain at the top level.
- **AC-02 (project state):** Given the repo root, `specs/memory/project-state.md` exists, is non-empty, and contains the sections: Last updated, Module status table, Recent decisions, Blockers, Next task suggested.
- **AC-03 (memory):** Given `specs/memory/`, the folders `chat-logs/`, `decisions/`, `incidents/` exist and each contains a README or placeholder explaining its purpose.
- **AC-04 (shared refs):** Given `specs/shared/`, the files `glossary.md`, `tech-stack.md`, `conventions.md`, `architecture-overview.md` and the folder `adrs/` exist; `adrs/` contains `adr-001-*.md` … `adr-010-*.md` matching the old `specs/decisions/001..010` titles.
- **AC-05 (RFCs):** Given `specs/changes/`, it contains only `rfc-*.md` files (or is empty) and a README describing the RFC lifecycle; no `NNN-name/` change folders remain.
- **AC-06 (features):** Given `specs/features/`, at least one domain folder exists with `spec-01-*.md`-style single-file specs; each spec has the sections: Objective, Context, Requirements, Behavior/Flow, Constraints, Edge Cases, Acceptance Criteria, Done When.
- **AC-07 (migration — features):** Given the 8 active change folders (012, 013, 021, 022, 029, 030, 031, 032), each is converted into a feature spec under `specs/features/<domain>/` with every requirement, acceptance criterion, and edge case from the original preserved (verifiable by diff review).
- **AC-08 (migration — archive):** Given `specs/archive/`, a `README.md` index exists listing what was archived and why; the old `specs/decisions/` and `specs/living/` folders are gone (content migrated per AC-04 and `architecture-overview.md`).
- **AC-09 (templates):** Given `specs/templates/`, the files `feature-spec.md`, `rfc-template.md`, `adr-template.md`, `task-prompt-template.md` exist and are non-empty.
- **AC-10 (skills):** Running `python scripts/validate-skills.py` exits 0, all 6 skills PASS, and no skill file references `specs/changes/NNN` or `specs/living/` except in transition-verbatim lines.
- **AC-11 (references):** `references/conventions.md` §Spec Folder Structure and `references/workflow.md` describe the new structure; repo-wide grep for `specs/(living|decisions)/` returns no matches outside `specs/archive/` and `docs/specs/`.
- **AC-12 (AGENTS.md + README.md):** AGENTS.md (specs structure section, contributing steps) and README.md (specs references) describe the new structure; grep for old paths returns no matches outside archive.
- **AC-13 (docs site):** `cd docs && npm run build && npm run lint` passes; docs pages (concepts/specs.md, concepts/workflow.md, contributing/conventions.md, contributing/repository-structure.md, getting-started/first-task.md, core/crewloop-*.md, tools/workflow-test.md) reflect the new structure and contain no stale spec paths.
- **AC-14 (docs/specs merge):** `docs/specs/` content is merged (its single change spec is archived with a reason) and the folder no longer exists.

## Requisites

- **Subagent parallelization:** `approved: false` — migration + skill rewrites are sequential and dependent; parallel edits would collide on the same files (skills, conventions, docs).
