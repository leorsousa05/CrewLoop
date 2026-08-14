# Design — Specs System Restructure (034)

## Target Structure

```
specs/
├── README.md                        # quick map: what each folder is for
├── archive/                         # obsolete/rejected specs — kept for audit
│   ├── README.md                    # index: what was archived, why, date
│   ├── (existing YYYY-MM-DD-NNN-name folders stay untouched)
│   └── (new: rejected RFCs land here as rfc-NNN-name.md + README entry)
├── changes/                         # RFCs — proposals under discussion
│   ├── README.md                    # lifecycle: draft → approved (→ shared/adrs/) / rejected (→ archive/)
│   └── rfc-NNN-name.md              # RFC files only
├── memory/                          # project brain — always-read context
│   ├── project-state.md             # module status, decisions, blockers, next task
│   ├── chat-logs/                   # YYYY-MM-DD-topic.md summaries (10-20 lines)
│   ├── decisions/                   # lightweight "why X not Y" notes
│   └── incidents/                   # YYYY-MM-DD-topic.md post-mortems
├── shared/                          # stable references — read when needed
│   ├── glossary.md
│   ├── tech-stack.md
│   ├── conventions.md
│   ├── architecture-overview.md     # ← merged from specs/living/** domain specs
│   └── adrs/                        # ← migrated from specs/decisions/
│       ├── adr-001-*.md … adr-010-*.md
│       └── README.md
├── templates/                       # blueprints for new artifacts
│   ├── feature-spec.md
│   ├── rfc-template.md
│   ├── adr-template.md
│   └── task-prompt-template.md
└── features/                        # the real work — one spec = one task
    ├── 00-core/                     # setup, config, infra
    │   └── spec-01-project-setup.md
    ├── 01-cli/
    │   └── spec-01-*.md
    ├── 02-dashboard/
    ├── 03-docs/
    └── 04-workflow/                 # skills, conventions, references
```

## Domain mapping for this repo

| Old location | New location |
|--------------|--------------|
| `specs/changes/012-docs-migration-to-react/` | `specs/features/03-docs/spec-012-docs-migration-to-react.md` |
| `specs/changes/013-automated-architect-and-designer/` | `specs/features/04-workflow/spec-013-automated-architect-and-designer.md` |
| `specs/changes/021-dashboard-console-redesign/` | `specs/features/02-dashboard/spec-021-dashboard-console-redesign.md` |
| `specs/changes/022-dashboard-saas-minimalist-redesign/` | `specs/features/02-dashboard/spec-022-dashboard-saas-minimalist-redesign.md` |
| `specs/changes/029-dashboard-event-session-consistency/` | `specs/features/02-dashboard/spec-029-dashboard-event-session-consistency.md` |
| `specs/changes/030-dashboard-client-correctness/` | `specs/features/02-dashboard/spec-030-dashboard-client-correctness.md` |
| `specs/changes/031-dashboard-responsive-ui-refinement/` | `specs/features/02-dashboard/spec-031-dashboard-responsive-ui-refinement.md` |
| `specs/changes/032-dashboard-quality-documentation/` | `specs/features/02-dashboard/spec-032-dashboard-quality-documentation.md` |
| `specs/decisions/001..010-*.md` | `specs/shared/adrs/adr-001..010-*.md` (title kept, frontmatter updated) |
| `specs/living/{cli,dashboard,docs,npm-distribution,supporting-team-skills,workflow}/spec.md` | merged into `specs/shared/architecture-overview.md` (one section per domain) |
| `specs/templates/*` | replaced by the 4 new templates (old ones removed) |
| `docs/specs/changes/001-docs-redesign/` | archived → `specs/archive/` + README entry (superseded by 024-docs-quiet-console-restyle) |

## Feature spec format (single file, canonical)

```
# spec-NNN-name.md
---
name: spec-NNN-name
domain: NN-domain
status: active | completed | superseded
created: YYYY-MM-DD
completed: null
supersedes: []
---

## Objective
## Context            # links to shared/, never copies
## Requirements       # numbered, testable
## Behavior / Flow    # happy path, step by step
## Constraints        # what must NOT be done
## Edge Cases         # empty/null/invalid inputs, error paths, boundaries, concurrency
## Acceptance Criteria  # Given/When/Then, IDs AC-01…, mapped in Done When
## Done When          # checkboxes referencing AC IDs + the test that proves it
```

## RFC lifecycle (`changes/`)

1. Plan writes `changes/rfc-NNN-name.md` from `rfc-template.md` for architecture changes.
2. User/team discusses the RFC. **No implementation happens while in `changes/`.**
3. **Approved** → RFC moves to `shared/adrs/adr-NNN-name.md` (with the decision recorded) and affected feature specs are updated.
4. **Rejected** → RFC moves to `archive/rfc-NNN-name.md` and a one-line reason is appended to `archive/README.md`.
5. `changes/` holds only open RFCs — at most a few; closed ones leave the folder.

## Skill contract changes (behavior only, transition contract untouched)

- **crewloop:plan** — reads `memory/project-state.md` + `shared/` refs during discovery; creates **one feature spec per task** in `specs/features/<domain>/` (or an RFC in `changes/`); updates `project-state.md` after the session.
- **crewloop:design** — writes design detail as a section or sub-spec inside the feature spec folder (only when the feature has UI); never creates separate `design-ui.md` in `changes/`.
- **crewloop:code** — reads the single feature spec; implements; never creates or moves specs.
- **crewloop:review** — verifies against the feature spec; PASS → ship, FAIL → code.
- **crewloop:ship** — commits; marks the feature spec `status: completed` + `completed: date`; appends a chat-log summary to `memory/chat-logs/YYYY-MM-DD-topic.md`; updates `project-state.md` (module status, last chat). **No more archiving of completed specs — they stay in `features/`.**
- **crewloop:docs** — reads/writes feature specs under `features/`; returns to plan.

## Edge Case & Error Handling Matrix

| # | Scenario | Expected handling |
|---|----------|-------------------|
| EC-01 | Old archived specs reference `specs/changes/NNN/` paths | Left as-is (audit history); archive README notes they describe the old layout |
| EC-02 | A feature spec exists for a domain with no folder yet | Plan creates `features/NN-name/` on demand |
| EC-03 | Two features touch the same files | Specs record `supersedes`/conflicts in frontmatter; Plan is the arbiter; tasks must not be parallelized on the same files |
| EC-04 | RFC sits in `changes/` while implementation is requested | Hard rule: no code until RFC moves out; review gate rejects implementations without an approved ADR/feature spec |
| EC-05 | `project-state.md` missing/stale at session start | Plan recreates/updates it from chat-logs before any spec work |
| EC-06 | `archive/README.md` missing during migration | Generated from the folder listing + superseded/cancelled `.spec.yaml` statuses (reason = "superseded by X" / "cancelled" / "completed") |
| EC-07 | ADR numbering collision | New ADRs take `max(NNN)+1`; migrated ADRs keep their 001..010 numbers |
| EC-08 | Feature spec grows beyond single file (large feature) | Allowed exception: sub-spec files inside `features/<domain>/spec-NN-name/` subfolder, linked from the main spec; noted in conventions |
| EC-09 | Docs site pages reference removed pages/folders | Grep sweep task + `npm run build` catches dead links before ship |
| EC-10 | Skills rewrite breaks `validate-skills.py` (transition contract lines) | Contract block copied byte-for-byte from current SKILL.md; validation run after each skill edit |
| EC-11 | Empty `specs/changes/` after migration (no RFCs) | Kept with README only; README documents lifecycle |
| EC-12 | `docs/specs/` merge loses the superseded spec | Archived with README entry before folder deletion |
