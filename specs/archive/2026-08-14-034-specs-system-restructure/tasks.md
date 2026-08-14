# Tasks — Specs System Restructure (034)

> Run order matters. Tasks 1-3 build the target tree first; 4-6 migrate content; 7-10 rewrite consumers; 11 verifies. Grep verification pattern used below:
> `grep -rnE "specs/(changes|living|decisions)/" --include="*.md" . | grep -v "specs/archive/" | grep -v "docs/specs/"`

## Phase 1 — Scaffold target tree

### T-1 Create new spec folders
- **Files:** `specs/features/00-core/`, `specs/features/01-cli/`, `specs/features/02-dashboard/`, `specs/features/03-docs/`, `specs/features/04-workflow/`, `specs/memory/chat-logs/`, `specs/memory/decisions/`, `specs/memory/incidents/`, `specs/shared/adrs/`
- **Depends on:** —
- **Verification:** `ls specs/features/ specs/memory/ specs/shared/`
- **Done when:** All 9 directories exist (EC-02 satisfied). Proves: structure groundwork for AC-01.

### T-2 Write `specs/memory/project-state.md`
- **Files:** `specs/memory/project-state.md`
- **Depends on:** T-1
- **Verification:** `wc -l specs/memory/project-state.md` and visual check of sections
- **Done when:** File contains: Last updated (today), Module status table (Skills ✅ / CLI ✅ / Dashboard ✅ / Docs site ✅ / Specs system 🔄), Recent decisions (references 001..010 ADRs), Blockers, Next task suggested (this change). Proves: AC-02.

### T-3 Write `specs/memory/README.md` + subfolder placeholders
- **Files:** `specs/memory/README.md`, `specs/memory/chat-logs/README.md`, `specs/memory/decisions/README.md`, `specs/memory/incidents/README.md`
- **Depends on:** T-1
- **Verification:** `ls specs/memory/` shows README + 3 subfolders with READMEs
- **Done when:** Each README explains its purpose and naming convention (chat-logs `YYYY-MM-DD-topic.md`, incidents `YYYY-MM-DD-topic.md`). Proves: AC-03.

## Phase 2 — Migrate existing content

### T-4 Migrate ADRs: `specs/decisions/` → `specs/shared/adrs/`
- **Files:** `specs/decisions/001..010-*.md` → `specs/shared/adrs/adr-001..010-*.md` (10 files); then delete `specs/decisions/`
- **Depends on:** T-1
- **Verification:** `ls specs/shared/adrs/ | wc -l` → 10; `test ! -d specs/decisions && echo gone`
- **Done when:** 10 ADRs at new path with titles preserved, frontmatter `adr: NNN` updated, old folder removed. Proves: AC-04, AC-08.

### T-5 Merge `specs/living/` into `specs/shared/architecture-overview.md`
- **Files:** `specs/shared/architecture-overview.md` (created from `specs/living/{cli,dashboard,docs,npm-distribution,supporting-team-skills,workflow}/spec.md`); `specs/shared/glossary.md`; `specs/shared/tech-stack.md`; `specs/shared/conventions.md`; then delete `specs/living/`
- **Depends on:** T-4
- **Verification:** `test ! -d specs/living && echo gone`; grep for each domain name in architecture-overview.md
- **Done when:** One section per former living domain (6 sections) exists in architecture-overview.md; glossary/tech-stack/conventions created (glossary defines Team/User/Skill/Feature; tech-stack lists TypeScript, Node, Vite, React, Tailwind, Python scripts with versions from package.json; conventions links to `references/conventions.md`). Proves: AC-04, AC-08.

### T-6 Convert active change specs → feature specs
- **Files:**
  - `specs/changes/012-docs-migration-to-react/` → `specs/features/03-docs/spec-012-docs-migration-to-react.md`
  - `specs/changes/013-automated-architect-and-designer/` → `specs/features/04-workflow/spec-013-automated-architect-and-designer.md`
  - `specs/changes/021-dashboard-console-redesign/` → `specs/features/02-dashboard/spec-021-dashboard-console-redesign.md`
  - `specs/changes/022-dashboard-saas-minimalist-redesign/` → `specs/features/02-dashboard/spec-022-dashboard-saas-minimalist-redesign.md`
  - `specs/changes/029-dashboard-event-session-consistency/` → `specs/features/02-dashboard/spec-029-dashboard-event-session-consistency.md`
  - `specs/changes/030-dashboard-client-correctness/` → `specs/features/02-dashboard/spec-030-dashboard-client-correctness.md`
  - `specs/changes/031-dashboard-responsive-ui-refinement/` → `specs/features/02-dashboard/spec-031-dashboard-responsive-ui-refinement.md`
  - `specs/changes/032-dashboard-quality-documentation/` → `specs/features/02-dashboard/spec-032-dashboard-quality-documentation.md`
  - then delete `specs/changes/*/` folders (keep the folder itself)
- **Depends on:** T-5
- **Verification:** `ls specs/changes/` → only README.md (after T-7); grep each old folder name → only archive hits
- **Done when:** 8 feature specs exist in the single-file format (frontmatter + Objective/Context/Requirements/Behavior/Constraints/Edge Cases/Acceptance Criteria/Done When) with **every** requirement, AC, and edge case from the original `.spec.yaml`/proposal/specs/tasks preserved (diff review: each original requirement string appears in the new file). Proves: AC-06, AC-07.

### T-7 Write `specs/changes/README.md` (RFC lifecycle)
- **Files:** `specs/changes/README.md`
- **Depends on:** T-6
- **Verification:** `cat specs/changes/README.md`
- **Done when:** README describes: `changes/` holds RFCs only; lifecycle draft → approved (moves to `shared/adrs/`) / rejected (moves to `archive/` + index entry); naming `rfc-NNN-name.md`. Proves: AC-05.

### T-8 Write `specs/archive/README.md` index
- **Files:** `specs/archive/README.md`
- **Depends on:** T-4
- **Verification:** `wc -l specs/archive/README.md` (> 20 lines)
- **Done when:** README tables the archive folder list with per-entry reason derived from `.spec.yaml` statuses (completed / superseded-by / cancelled) and notes that archived specs describe the old layout (EC-01, EC-06). Proves: AC-08.

### T-9 Migrate `docs/specs/` into archive
- **Files:** `docs/specs/changes/001-docs-redesign/` → `specs/archive/2026-08-14-docs-redesign/` (+ README.md entry "superseded by 024-docs-quiet-console-restyle"); delete `docs/specs/`
- **Depends on:** T-8
- **Verification:** `test ! -d docs/specs && echo gone`; grep "docs/specs" in archive README
- **Done when:** Spec preserved under archive with reason, `docs/specs/` removed. Proves: AC-14.

### T-10 Replace `specs/templates/` with the 4 new templates
- **Files:** `specs/templates/feature-spec.md`, `specs/templates/rfc-template.md`, `specs/templates/adr-template.md`, `specs/templates/task-prompt-template.md` (content per `specs/changes/034-specs-system-restructure/specs/structure.md`); delete old `proposal-template.md`, `spec-delta-template.md`, `design-template.md`, `tasks-template.md`, `spec-yaml-template.yaml`; sync canonical copies into `skills/crewloop-plan/references/templates/`
- **Depends on:** T-6
- **Verification:** `ls specs/templates/` → exactly 4 files; `ls skills/crewloop-plan/references/templates/` → 4 matching files
- **Done when:** 4 templates exist in both locations; obsolete templates removed. Proves: AC-09.

## Phase 3 — Rewrite consumers

### T-11 Rewrite `specs/README.md`
- **Files:** `specs/README.md`
- **Depends on:** T-10
- **Verification:** `cat specs/README.md`
- **Done when:** Quick map table of 6 folders (archive/changes/memory/shared/templates/features) with purpose + who writes/reads; points to `references/conventions.md` as canonical; no old-path references. Proves: AC-01.

### T-12 Rewrite `skills/crewloop-plan/SKILL.md` (workflow + paths)
- **Files:** `skills/crewloop-plan/SKILL.md`
- **Depends on:** T-11
- **Verification:** `python scripts/validate-skills.py` (exit 0)
- **Done when:** Discovery reads `memory/project-state.md` + `shared/`; spec creation targets `features/<domain>/spec-NN-*.md` single-file format; RFCs to `changes/rfc-NNN-*.md`; project-state.md updated at session end; TRANSITION CONTRACT section byte-identical to current. Proves: AC-10.

### T-13 Rewrite `skills/crewloop-design/SKILL.md`
- **Files:** `skills/crewloop-design/SKILL.md`
- **Depends on:** T-11
- **Verification:** `python scripts/validate-skills.py` (exit 0)
- **Done when:** Reads the feature spec; UI detail added as a section/sub-spec inside the feature spec; no `specs/changes/` references. Proves: AC-10.

### T-14 Rewrite `skills/crewloop-code/SKILL.md`
- **Files:** `skills/crewloop-code/SKILL.md`
- **Depends on:** T-11
- **Verification:** `python scripts/validate-skills.py` (exit 0)
- **Done when:** SDD reads the single feature spec; never creates specs; verification = Done When tests. Proves: AC-10.

### T-15 Rewrite `skills/crewloop-review/SKILL.md`
- **Files:** `skills/crewloop-review/SKILL.md`
- **Depends on:** T-11
- **Verification:** `python scripts/validate-skills.py` (exit 0)
- **Done when:** Compliance check against `features/<domain>/spec-*.md`; checklist references updated paths. Proves: AC-10.

### T-16 Rewrite `skills/crewloop-ship/SKILL.md`
- **Files:** `skills/crewloop-ship/SKILL.md`
- **Depends on:** T-11
- **Verification:** `python scripts/validate-skills.py` (exit 0)
- **Done when:** Ship marks feature spec `status: completed` + date, appends chat-log `memory/chat-logs/YYYY-MM-DD-topic.md`, updates `project-state.md`; no archive/living merge steps. Proves: AC-10.

### T-17 Rewrite `skills/crewloop-docs/SKILL.md`
- **Files:** `skills/crewloop-docs/SKILL.md`
- **Depends on:** T-11
- **Verification:** `python scripts/validate-skills.py` (exit 0)
- **Done when:** Docs tasks operate on feature specs under `features/`; path references updated. Proves: AC-10.

### T-18 Update `references/conventions.md` (§Spec Folder Structure + routing notes)
- **Files:** `references/conventions.md`
- **Depends on:** T-16
- **Verification:** grep pattern → 0 matches outside archive/docs/specs
- **Done when:** §Spec Folder Structure shows the 6-folder tree with rules (features stay, RFC lifecycle, memory always-read); lightweight-spec rule replaced by single-file feature spec rule. Proves: AC-11.

### T-19 Update `references/workflow.md`
- **Files:** `references/workflow.md`
- **Depends on:** T-16
- **Verification:** grep pattern → 0 matches outside archive/docs/specs
- **Done when:** Rules updated: plan reads project-state.md; ship updates memory instead of archiving/living merge. Proves: AC-11.

### T-20 Update `AGENTS.md`
- **Files:** `AGENTS.md`
- **Depends on:** T-18
- **Verification:** grep pattern → 0 matches outside archive/docs/specs; `grep -n "features/" AGENTS.md` → hit
- **Done when:** Repository tree, Specs Structure section, How to Contribute steps, and Notes reference the new folders (features/memory/shared/changes-RFC). Proves: AC-12.

### T-21 Update root `README.md`
- **Files:** `README.md`
- **Depends on:** T-18
- **Verification:** grep pattern → 0 matches outside archive/docs/specs
- **Done when:** Specs references in README (mandatory specs bullet, spec archiving bullet) describe the new flow. Proves: AC-12.

### T-22 Update docs site pages
- **Files:** `docs/public/docs/concepts/specs.md`, `docs/public/docs/concepts/workflow.md`, `docs/public/docs/contributing/conventions.md`, `docs/public/docs/contributing/repository-structure.md`, `docs/public/docs/getting-started/first-task.md`, `docs/public/docs/core/crewloop-plan.md`, `docs/public/docs/core/crewloop-code.md`, `docs/public/docs/core/crewloop-review.md`, `docs/public/docs/core/crewloop-ship.md`, `docs/public/docs/core/crewloop-design.md`, `docs/public/docs/core/crewloop-hub.md`, `docs/public/docs/tools/workflow-test.md`
- **Depends on:** T-21
- **Verification:** `cd docs && npm run build && npm run lint`; grep pattern → 0 matches outside archive/docs/specs
- **Done when:** All listed pages describe the new structure with no stale `specs/changes/NNN`/`living/`/`decisions/` paths. Proves: AC-13.

## Phase 4 — Final verification

### T-23 Full regression sweep
- **Files:** none (read-only)
- **Depends on:** T-22
- **Verification:**
  - `python scripts/validate-skills.py` → exit 0, 6 PASS
  - `cd docs && npm run build && npm run lint` → pass
  - `cd packages/cli && npm run build && npm test` → pass
  - `cd servers/dashboard && npm run build && npm test` → pass
  - grep pattern → 0 matches outside archive
- **Done when:** All five checks green. Proves: AC-10, AC-13, and no regressions in cli/dashboard builds.
