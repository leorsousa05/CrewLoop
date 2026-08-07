# Tasks: Skill Namespace `crewloop:*` & Team Reduction to 8 Skills

> Granularity rules (do not delete this block — it defines what a valid task is):
> - One task = one cohesive set of files. If a task touches more than ~3 unrelated files, split it.
> - Every task MUST list **Files**, **Depends on**, and **Done when**. No orphan checkboxes.
> - Order tasks by dependency, not by type. Each phase must end in a verifiable state.
> - Reference the `design.md` section that backs each task (e.g. "per design.md §Contracts").

## Phase 0: Setup

### T0 — Scaffold spec
- **Files:** `specs/changes/033-skill-namespace-and-team-reduction/`
- **Depends on:** —
- **Do:** Spec folder with `.spec.yaml`, `proposal.md`, `design.md`, `specs/` deltas, `tasks.md`.
- **Done when:** All spec files exist with `status: active`. ✅ (done by Architect)

### T1 — ADR for the decision ✅
- **Files:** `specs/decisions/007-skill-namespace-and-8-skill-team.md` (create)
- **Depends on:** T0
- **Do:** Record the namespace (`crewloop:*`) + team reduction decision per `templates/adr-template.md` (design.md §Overview, §Assumptions).
- **Done when:** ADR exists with context, decision, alternatives, consequences.

## Phase 1: Skills & References (subagent: skills-and-references)

### T2 — Rename 8 skills, delete 11 ✅
- **Files:** `skills/architect/→crewloop-plan/`, `skills/designer/→crewloop-design/`, `skills/engineer/→crewloop-code/`, `skills/reviewer/→crewloop-review/`, `skills/shipper/→crewloop-ship/`, `skills/project-brainstorm/→crewloop-brainstorm/`, `skills/docs-writer/→crewloop-docs/`, `skills/crewloop-hub/`; delete the 11 removed dirs
- **Depends on:** T1
- **Do:** `git mv` the 7 renamed dirs; update `name:` in all 8 frontmatters; rewrite every internal cross-reference (menus, AFK targets, descriptions, transition contracts) to new names; remove DiamondBlock/long-term-manager/maintainer sections from hub and shipper; delete 11 skill dirs (design.md §Overview, §File-by-File).
- **Done when:** Exactly 8 dirs under `skills/`; `rg -l "architect|designer|engineer|reviewer|shipper|project-brainstorm|docs-writer" skills/` (as old-name references in routing contexts) returns no stale flat names; `rg -l "long-term-manager|diamondblock|accessibility-auditor|frontend-architect|maintainer|product-manager|researcher|schema-designer|security-guard|devops-specialist|tester" skills/` returns nothing.

### T3 — Rewrite references, AGENTS.md, README, template ✅
- **Files:** `references/skill-contracts.yaml` (rewrite), `references/conventions.md`, `references/workflow.md`, `references/skill-anatomy.md`, `assets/templates/skill-template.md`, `AGENTS.md`, `README.md`
- **Depends on:** T2
- **Do:** Apply the target contract from design.md §Contracts; shrink transition/prefix tables to 8 rows; Hub entry menu drops `[T]`; remove DiamondBlock lifecycle section; update bundle lock-in to 8 skills; document the `crewloop:<slug>` ↔ `crewloop-<slug>` naming rule.
- **Done when:** No reference to any removed skill or old flat name outside `specs/archive/` in these files; `python scripts/validate-skills.py` contract checks align (validated in T8).

## Phase 2: Packages (parallel subagents: cli, dashboard, docs-site)

### T4 — CLI updates ✅
- **Files:** `packages/cli/src/agents.ts`, `packages/cli/src/cli.ts`, `packages/cli/src/commands/doctor.ts`, `packages/cli/src/help.ts`, `packages/cli/src/tests/args.test.ts`, `packages/cli/src/tests/commands.test.ts`
- **Depends on:** T2
- **Do:** Verify/update default-skill strings and root detection; remove `--diamondblock` flag, doctor checks, help text, and related tests (specs/cli/spec.md).
- **Done when:** `npm run build && npm test` pass in `packages/cli/`; `rg diamondblock packages/cli/src` returns nothing.

### T5 — Dashboard updates ✅
- **Files:** `servers/dashboard/src/skills/registry.ts`, `servers/dashboard/src/lib/constants.ts`, `servers/dashboard/src/skills/mapping.ts`, `servers/dashboard/src/config.ts`, dashboard test files
- **Depends on:** T2
- **Do:** Rekey `SKILL_ICONS` and UI icon map to the 8 new names; drop removed-skill and `project-mapper` entries; inference targets `crewloop:ship`; update test fixtures (specs/dashboard/spec.md).
- **Done when:** `npm run build && npm test` pass in `servers/dashboard/`; `rg "architect|engineer|reviewer|shipper" servers/dashboard/src --glob '!**/node_modules/**'` shows no stale flat-name keys.

### T6 — Docs site updates ✅
- **Files:** `docs/src/sidebarConfig.ts`, `docs/src/components/LandingPage.tsx`, `docs/src/components/TerminalSimulator.tsx`, `docs/src/components/SkillVisualizer.tsx`
- **Depends on:** T2
- **Do:** Update sidebar, cards, simulated install output, and visualizer nodes to the 8 skills (specs/docs/spec.md).
- **Done when:** Docs site builds (`npm run build` in `docs/`); no removed-skill names in `docs/src/`.

## Phase 3: Validation & Sweep

### T7 — Validator update + repo-wide reference sweep ✅
- **Files:** `scripts/validate-skills.py`, `scripts/tests/test_validate_skills.py`
- **Depends on:** T2–T6
- **Do:** Set `EXPECTED_SKILLS`/`CANONICAL_SKILLS` to the 8 new names; implement the `crewloop:<slug>` ↔ `crewloop-<slug>` name rule (design.md §Validator); update afk-target checks (`crewloop:hub`→`crewloop:plan`); update validator tests. Then run a repo-wide `rg` sweep for all 19 old names + 11 removed skills (excluding `specs/archive/`) and fix any residual references.
- **Done when:** Sweep returns zero stale references; validator tests pass.

### T8 — Automated verification ✅
- **Files:** `.spec.yaml`
- **Depends on:** T7
- **Do:** Run `python scripts/validate-skills.py`, `npm run build && npm test` in `packages/cli/` and `servers/dashboard/`, `npm run build` in `docs/`. Then set `.spec.yaml` status to `completed` with the completed date.
- **Done when:** All commands exit 0; `.spec.yaml` shows `status: completed`.

### T9 — Ship (Reviewer PASS required)
- **Files:** `.spec.yaml`, `specs/living/`, `specs/archive/`
- **Depends on:** T8, reviewer PASS
- **Do:** Shipper moves the change folder to `specs/archive/2026-08-05-033-skill-namespace-and-team-reduction/` and merges deltas into `specs/living/{supporting-team-skills,cli,dashboard,docs}/`.
- **Done when:** Spec folder exists in `specs/archive/`; living specs reflect the 8-skill namespaced team.
