# Tasks: Automatic Routing & Plan as Unified Discovery Entry

> Granularity rules (do not delete this block — it defines what a valid task is):
> - One task = one cohesive set of files. If a task touches more than ~3 unrelated files, split it.
> - Every task MUST list **Files**, **Depends on**, and **Done when**. No orphan checkboxes.
> - Order tasks by dependency, not by type. Each phase must end in a verifiable state.
> - Reference the `design.md` section that backs each task (e.g., "per design.md §Contracts").

## Phase 0: Setup

### T0 — Scaffold spec
- **Files:** `specs/changes/034-automatic-routing-and-plan-discovery-merge/`
- **Depends on:** —
- **Do:** Create the spec folder, `.spec.yaml`, `proposal.md`, `design.md`, `specs/` deltas, `tasks.md`, and the ADR.
- **Done when:** All spec files exist with `status: active`. ✅ (done by Architect)

### T1 — ADR for the decision
- **Files:** `specs/decisions/008-automatic-routing-and-plan-merge.md` (create)
- **Depends on:** T0
- **Do:** Record the decision to merge Hub/Brainstorm into Plan and remove end-of-skill menus (design.md §ADR).
- **Done when:** ADR exists with context, decision, alternatives, consequences.

## Phase 1: Skill Content & Deletions

### T2 — Delete Hub and Brainstorm
- **Files:** `skills/crewloop-hub/`, `skills/crewloop-brainstorm/`
- **Depends on:** T0
- **Do:** Remove both directories and all references to them in current skills and references (per design.md §Overview).
- **Done when:** `ls skills/crewloop-hub skills/crewloop-brainstorm` fails; `rg -l "crewloop:hub\b|crewloop-brainstorm\b|crewloop:brainstorm\b" skills/ references/ assets/ AGENTS.md README.md` returns nothing.

### T3 — Rewrite `crewloop:plan` as entry skill
- **Files:** `skills/crewloop-plan/SKILL.md`
- **Depends on:** T2
- **Do:** Merge the discovery questions from the old Hub, the brainstorming categories from the old Brainstorm, and the spec-writing responsibilities of Plan into a single skill. Add subagent delegation, brief format, spec-writing workflow, and auto-route to `crewloop:design` or `crewloop:code` (design.md §New Plan Skill).
- **Done when:** The new `SKILL.md` validates with `python scripts/validate-skills.py` (after validator is updated in T7).

### T4 — Update remaining skills to auto-route
- **Files:** `skills/crewloop-design/SKILL.md`, `skills/crewloop-code/SKILL.md`, `skills/crewloop-review/SKILL.md`, `skills/crewloop-ship/SKILL.md`, `skills/crewloop-docs/SKILL.md`
- **Depends on:** T3
- **Do:** Replace transition contracts and ending instructions with direct/conditional routes; remove letter-based menus; define explicit interrupt commands; set `afk_target: crewloop:plan` (design.md §Auto-Routing).
- **Done when:** All 5 skills validate; no `[A]`/`[B]`/`[R]`/`[S]`/`[E]`/`[N]`/`[D]` menu blocks remain.

## Phase 2: References, Templates, and Documentation

### T5 — Rewrite references and templates
- **Files:** `references/skill-contracts.yaml`, `references/conventions.md`, `references/workflow.md`, `references/skill-anatomy.md`, `assets/templates/skill-template.md`, `AGENTS.md`, `README.md`
- **Depends on:** T4
- **Do:** Reduce team to 6 skills, update transition contract table, remove menu examples, rewrite flow diagram, update skill-anatomy/template default invoker, update AGENTS.md and README team/flow sections (design.md §Contracts, §Docs).
- **Done when:** `rg -l "crewloop:hub\b|crewloop:brainstorm\b|menu\s*$|navigation menu" references/ assets/templates/ AGENTS.md README.md` returns nothing (excluding archive or historical context).

## Phase 3: CLI, Dashboard, and Validator

### T6 — Update CLI default entry skill
- **Files:** `packages/cli/src/agents.ts`, `packages/cli/src/cli.ts`, `packages/cli/src/help.ts`
- **Depends on:** T5
- **Do:** Change default hook skill from `crewloop-hub` to `crewloop-plan`; update root detection and help examples (design.md §CLI).
- **Done when:** `npm run build && npm test` pass in `packages/cli/`; `rg "crewloop-hub" packages/cli/src` returns nothing.

### T7 — Update dashboard icon maps
- **Files:** `servers/dashboard/src/lib/constants.ts`, `servers/dashboard/src/skills/registry.ts`
- **Depends on:** T5
- **Do:** Remove `crewloop:hub` and `crewloop:brainstorm` icon entries; keep 6 names (design.md §Dashboard).
- **Done when:** `npm run build && npm test` pass in `servers/dashboard/`; `rg "crewloop:hub\b|crewloop:brainstorm\b" servers/dashboard/src` returns nothing.

### T8 — Update validator and tests
- **Files:** `scripts/validate-skills.py`, `scripts/tests/test_validate_skills.py`
- **Depends on:** T4, T6, T7
- **Do:** Reduce `EXPECTED_SKILLS`/`CANONICAL_SKILLS` to 6; add new conditional direct-target strings; update canonical shape checks; update test fixtures (design.md §Validator).
- **Done when:** `python scripts/validate-skills.py` passes with the 6 updated skills; `python3 -m unittest scripts.tests.test_validate_skills` passes.

## Phase 4: Verification & Wrap-up

### T9 — Automated verification
- **Files:** `.spec.yaml`
- **Depends on:** T8
- **Do:** Run `python scripts/validate-skills.py`, `npm run build && npm test` in `packages/cli/` and `servers/dashboard/`, `npm run build` in `docs/`. Then set `.spec.yaml` status to `completed` with the completed date.
- **Done when:** All commands exit 0; `.spec.yaml` shows `status: completed`.

### T10 — Ship (Reviewer PASS required)
- **Files:** `.spec.yaml`, `specs/living/`, `specs/archive/`
- **Depends on:** T9, reviewer PASS
- **Do:** Shipper moves the change folder to `specs/archive/YYYY-MM-DD-034-automatic-routing-and-plan-discovery-merge/` and merges the deltas into `specs/living/workflow/` and `specs/living/skills/`.
- **Done when:** Spec folder exists in `specs/archive/`; living specs reflect the 6-skill auto-routing workflow.
