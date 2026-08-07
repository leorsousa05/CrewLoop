# Design: Skill Namespace `crewloop:*` & Team Reduction to 8 Skills

## Overview

Two coordinated changes across the monorepo:

1. **Rename** the 8 surviving skills to the `crewloop:*` namespace (frontmatter `name:`) and rename their directories to the filesystem-safe form (`crewloop-plan`, `crewloop-code`, …).
2. **Remove** the 11 unvalidated supporting skills (directories + every cross-reference) and simplify the transition contract to the core flow.

The change is a pure refactor: no runtime behavior of the remaining skills changes, only identities and routes.

### The 8 skills (final mapping)

| Old name | Directory | `name:` | Role |
|---|---|---|---|
| crewloop-hub | `skills/crewloop-hub/` | `crewloop:hub` | entry/discovery |
| architect | `skills/crewloop-plan/` | `crewloop:plan` | specs/architecture |
| designer | `skills/crewloop-design/` | `crewloop:design` | UI/UX spec |
| engineer | `skills/crewloop-code/` | `crewloop:code` | implementation |
| reviewer | `skills/crewloop-review/` | `crewloop:review` | quality gate |
| shipper | `skills/crewloop-ship/` | `crewloop:ship` | git/PR |
| project-brainstorm | `skills/crewloop-brainstorm/` | `crewloop:brainstorm` | interactive discovery |
| docs-writer | `skills/crewloop-docs/` | `crewloop:docs` | pure documentation |

### The 11 removed skills

`long-term-manager`, `diamondblock`, `accessibility-auditor`, `frontend-architect`, `maintainer`, `product-manager`, `researcher`, `schema-designer`, `security-guard`, `devops-specialist`, `tester`.

## Assumptions & Defaults

- **Directory naming:** chose `crewloop-plan` (hyphen) over `crewloop:plan` because `:` is unsafe on Windows filesystems and in some URL/packaging contexts. Mapping rule: `name:` uses `crewloop:<slug>`, directory uses `crewloop-<slug>`. Revisit if agents require dir == name literally.
- **Validator name rule:** `validate-skills.py` currently requires `name == directory` and kebab-case. It will be relaxed to accept the `crewloop:<slug>` ↔ `crewloop-<slug>` equivalence, because the namespace is the whole point of the change.
- **CLI default skill:** hook templates pass `--default-skill crewloop-hub`. The dashboard shim receives skill names from agent events; the installed directory stays `crewloop-hub`, so the default becomes `crewloop-hub` → events report `crewloop:hub` (frontmatter name). The CLI continues passing the directory name; the dashboard maps dir → display name. Revisit if the shim contract changes.
- **DiamondBlock removal:** the entire `--diamondblock` CLI surface (flag, doctor checks, help text, tests) is removed rather than deprecated, because the skill itself is removed and the feature was opt-in/warn-only.
- **Archive untouched:** `specs/archive/` keeps historical names; the repo-wide reference sweep excludes `specs/archive/`.
- **Bug-fixing pipeline:** the "Maintainer routes confirmed bugs to Architect" rule disappears with maintainer; bug fixes enter via the Hub like any task. `references/conventions.md` and `AGENTS.md` are rewritten accordingly.

## 7 Analysis Questions

1. **Domain and bounded context placement?** Four bounded contexts are touched: `skills` (the team bundle), `cli` (installer/hooks), `dashboard` (visualization), `docs` (docs site). All four already exist under `specs/living/` (supporting-team-skills, cli, dashboard, docs).
2. **Core responsibilities of changed components?** Skills: identity + routing menus only. CLI: default-skill string, root detection, diamondblock removal. Dashboard: name-keyed icon/inference maps. Docs: hardcoded skill lists. Validator: canonical skill set + name rule.
3. **Contracts to define or change?** `references/skill-contracts.yaml` is rewritten with 8 entries and new names (machine-readable contract). Validator's `CANONICAL_SKILLS` mirrors it. Transition contract tables in `conventions.md` shrink to 8 rows.
4. **Which parts need tests per TDD skip criteria?** CLI tests (arg parsing, doctor) and dashboard tests (registry, inference, state) already exist and must be updated, not skipped — they have branching and external deps. Skills/references/docs-site changes are content-only: validated by `validate-skills.py` and build, no new unit tests.
5. **Architecture that minimizes ambiguity?** Single source of truth per layer: `skill-contracts.yaml` for routing, `EXPECTED_SKILLS`/`CANONICAL_SKILLS` in the validator, one skill list in docs `sidebarConfig.ts`. Everything else references those.
6. **Project structure changes needed?** 8 directory renames + 11 directory deletions under `skills/`; no new directories elsewhere.
7. **Key trade-offs?** Accepting `name:` ≠ directory (colon vs hyphen) in exchange for filesystem safety; accepting breaking change for existing installs (old skill names disappear) in exchange for a clean, tested 8-skill bundle.

## Proposed Directory & File Structure

```
crewloop/
├── skills/
│   ├── crewloop-hub/SKILL.md            (Modified — internal references)
│   ├── crewloop-plan/                   (Renamed from skills/architect/)
│   │   ├── SKILL.md                     (Modified)
│   │   └── references/                  (unchanged content)
│   ├── crewloop-design/                 (Renamed from skills/designer/)
│   ├── crewloop-code/                   (Renamed from skills/engineer/)
│   ├── crewloop-review/                 (Renamed from skills/reviewer/)
│   ├── crewloop-ship/                   (Renamed from skills/shipper/)
│   ├── crewloop-brainstorm/             (Renamed from skills/project-brainstorm/)
│   ├── crewloop-docs/                   (Renamed from skills/docs-writer/)
│   ├── long-term-manager/               (Deleted)
│   ├── diamondblock/                    (Deleted)
│   ├── accessibility-auditor/           (Deleted)
│   ├── frontend-architect/              (Deleted)
│   ├── maintainer/                      (Deleted)
│   ├── product-manager/                 (Deleted)
│   ├── researcher/                      (Deleted)
│   ├── schema-designer/                 (Deleted)
│   ├── security-guard/                  (Deleted)
│   ├── devops-specialist/               (Deleted)
│   └── tester/                          (Deleted)
├── references/
│   ├── conventions.md                   (Modified — 8-skill contract, menus, prefixes, no DiamondBlock)
│   ├── workflow.md                      (Modified — 8-skill flow)
│   ├── skill-contracts.yaml             (Rewritten — 8 entries, new names)
│   └── skill-anatomy.md                 (Modified — template references)
├── assets/templates/skill-template.md   (Modified — naming convention note)
├── AGENTS.md                            (Modified — structure, team list, flow rules)
├── README.md                            (Modified — skill list, install docs)
├── packages/cli/src/
│   ├── agents.ts                        (Modified — default skill in hook templates)
│   ├── cli.ts                           (Modified — root detection)
│   ├── commands/doctor.ts               (Modified — diamondblock checks removed)
│   ├── help.ts                          (Modified — --diamondblock removed)
│   └── tests/                           (Modified — args/commands tests)
├── servers/dashboard/src/
│   ├── config.ts                        (Modified — root detection)
│   ├── skills/registry.ts               (Modified — SKILL_ICONS keyed by new names)
│   ├── skills/mapping.ts                (Modified — shipper inference key)
│   ├── lib/constants.ts                 (Modified — UI icon map)
│   └── **tests**                        (Modified — fixtures use new names)
├── docs/src/
│   ├── sidebarConfig.ts                 (Modified — 8-skill sidebar)
│   └── components/
│       ├── LandingPage.tsx              (Modified — 8 skill cards)
│       ├── TerminalSimulator.tsx        (Modified — install output)
│       └── SkillVisualizer.tsx          (Modified — workflow nodes)
└── scripts/
    ├── validate-skills.py               (Modified — EXPECTED_SKILLS=8, name rule, afk targets)
    └── tests/test_validate_skills.py    (Modified)
```

## File-by-File Changes

| File | Action | What changes | Design ref |
|------|--------|--------------|------------|
| `skills/architect/` → `skills/crewloop-plan/` | Rename+Modify | `name: crewloop:plan`; menus/routes reference new names | §Overview |
| `skills/designer/` → `skills/crewloop-design/` | Rename+Modify | `name: crewloop:design`; routes → `crewloop:code` | §Overview |
| `skills/engineer/` → `skills/crewloop-code/` | Rename+Modify | `name: crewloop:code`; menu targets `crewloop:review`/`crewloop:plan` | §Overview |
| `skills/reviewer/` → `skills/crewloop-review/` | Rename+Modify | `name: crewloop:review`; menu targets `crewloop:ship`/`crewloop:code` | §Overview |
| `skills/shipper/` → `skills/crewloop-ship/` | Rename+Modify | `name: crewloop:ship`; menu targets `crewloop:hub`/done; remove DiamondBlock wrap-up logging | §Overview |
| `skills/crewloop-hub/SKILL.md` | Modify | `name: crewloop:hub`; entry menu drops `[T]`; routes to `crewloop:plan`/`crewloop:brainstorm`; remove DiamondBlock/long-term-manager sections | §Contracts |
| `skills/project-brainstorm/` → `skills/crewloop-brainstorm/` | Rename+Modify | `name: crewloop:brainstorm`; routes to `crewloop:plan`/`crewloop:hub` | §Overview |
| `skills/docs-writer/` → `skills/crewloop-docs/` | Rename+Modify | `name: crewloop:docs`; invoker `crewloop:hub` | §Overview |
| 11 skill dirs | Delete | Removed entirely | §Overview |
| `references/skill-contracts.yaml` | Rewrite | 8 entries, new names, simplified menus (no `[T]`, no removed invokers) | §Contracts |
| `references/conventions.md` | Modify | Transition contract 8 rows; prefix table 8 rows; remove DiamondBlock section, maintainer/long-term-manager rows; Hub entry menu without `[T]` | §Contracts |
| `references/workflow.md` | Modify | 8-skill role table + simplified flow | §Contracts |
| `references/skill-anatomy.md` | Modify | Naming convention `crewloop:*` | §Contracts |
| `assets/templates/skill-template.md` | Modify | `name: crewloop:<slug>` convention | §Contracts |
| `AGENTS.md` | Modify | 8-skill tables, repository structure, flow rules, bundle lock-in ("19"→"8") | §Contracts |
| `README.md` | Modify | Skill list, install instructions, diamondblock flag removal | §Contracts |
| `packages/cli/src/agents.ts` | Modify | `--default-skill crewloop-hub` stays as directory name; confirm comment/logic (5 agents) | §CLI |
| `packages/cli/src/cli.ts` | Modify | Root detection `skills/crewloop-hub/SKILL.md` (unchanged path — dir keeps name) | §CLI |
| `packages/cli/src/commands/doctor.ts` | Modify | Remove diamondblock layered checks | §CLI |
| `packages/cli/src/help.ts` | Modify | Remove `--diamondblock` docs | §CLI |
| `packages/cli/src/tests/*.test.ts` | Modify | Remove diamondblock cases; update name fixtures | §CLI |
| `servers/dashboard/src/config.ts` | Modify | Root detection unchanged (`crewloop-hub` dir kept) | §Dashboard |
| `servers/dashboard/src/skills/registry.ts` | Modify | `SKILL_ICONS` → 8 new names; removed-skill entries dropped | §Dashboard |
| `servers/dashboard/src/lib/constants.ts` | Modify | Icon map → 8 new names; drop stray `project-mapper` | §Dashboard |
| `servers/dashboard/src/skills/mapping.ts` | Modify | Inference maps to `crewloop:ship` | §Dashboard |
| `servers/dashboard/src/**/*test*` | Modify | Fixtures: `crewloop:hub`, `crewloop:plan`, `crewloop:code`, `crewloop:ship` | §Dashboard |
| `docs/src/sidebarConfig.ts` | Modify | 8-skill grouped sidebar | §Docs |
| `docs/src/components/LandingPage.tsx` | Modify | 8 skill cards with new names | §Docs |
| `docs/src/components/TerminalSimulator.tsx` | Modify | Simulated install output lists 8 skills | §Docs |
| `docs/src/components/SkillVisualizer.tsx` | Modify | Nodes keyed by new ids; `crewloop-hub` default step | §Docs |
| `scripts/validate-skills.py` | Modify | `EXPECTED_SKILLS`/`CANONICAL_SKILLS` = 8 new names; name rule accepts `crewloop:<slug>` ↔ `crewloop-<slug>`; afk checks use new names (`crewloop:hub`, `crewloop:plan`) | §Validator |
| `scripts/tests/test_validate_skills.py` | Modify | Contract fixtures with new names | §Validator |

## Code Architecture & Design Patterns

- **Architecture Model:** Modular by role (unchanged). The change applies the **Single Source of Truth** principle per layer: `skill-contracts.yaml` (routing), validator canonical set (validation), `sidebarConfig.ts` (docs nav).
- **Design Patterns Used:**
  - **Namespace pattern** — the `crewloop:` prefix scopes the bundle like a package namespace, preventing collisions with generic skill names in host agents.
  - **Name mapping (Adapter)** — `crewloop:<slug>` (logical name) ↔ `crewloop-<slug>` (filesystem name) resolved in one place (validator + docs), instead of spreading the rule.

## Data Model / Contracts

### `skill-contracts.yaml` (target state, 8 entries)

```yaml
version: 2
skills:
  crewloop:hub:
    kind: core
    prefix: "> 🎯 **CrewLoop Hub**"
    interactive: true
    menu:
      A: {target: "crewloop:plan", recommended: conditional, condition: well-scoped-task}
      B: {target: "crewloop:brainstorm", recommended: conditional, condition: ambiguous-project}
    afk_target: "crewloop:plan"
  crewloop:plan:
    kind: core
    prefix: "> 🏗️ **Architect**"
    interactive: false
    direct_target: conditional-designer-or-engineer
    afk_target: "crewloop:hub"
  crewloop:design:
    kind: core
    prefix: "> 🎨 **Designer**"
    interactive: false
    direct_target: "crewloop:code"
    afk_target: "crewloop:hub"
  crewloop:code:
    kind: core
    prefix: "> 🔧 **Engineer**"
    interactive: true
    menu:
      R: {target: "crewloop:review", recommended: conditional, condition: verified-build}
      E: {target: continue, recommended: conditional, condition: incomplete-build}
      A: {target: "crewloop:plan", recommended: conditional, condition: spec-gap}
    afk_target: "crewloop:hub"
  crewloop:review:
    kind: core
    prefix: "> 🔍 **Reviewer**"
    interactive: true
    menu:
      S: {target: "crewloop:ship", recommended: conditional, condition: pass}
      E: {target: "crewloop:code", recommended: conditional, condition: fail}
    afk_target: "crewloop:hub"
  crewloop:ship:
    kind: core
    prefix: "> 🚀 **Shipper**"
    interactive: true
    menu:
      N: {target: "crewloop:hub", recommended: never}
      D: {target: done, recommended: always}
    afk_target: "crewloop:hub"
  crewloop:brainstorm:
    kind: supporting
    prefix: "> 🧠 **Project Brainstorm**"
    default_invoker: "crewloop:hub"
    return_strategy: architect-after-brief
    interactive: true
    menu:
      A: {target: "crewloop:plan", recommended: always}
      H: {target: "crewloop:hub", recommended: never}
    afk_target: "crewloop:hub"
  crewloop:docs:
    kind: supporting
    prefix: "> 📝 **Docs Writer**"
    default_invoker: "crewloop:hub"
    return_strategy: invoker
    interactive: true
    menu:
      I: {target: invoker, recommended: always}
      C: {target: continue, recommended: never}
      H: {target: "crewloop:hub", recommended: never}
    afk_target: "crewloop:hub"
```

### Validator naming rule

```python
NAMESPACED_NAME = re.compile(r"crewloop:[a-z0-9]+(?:-[a-z0-9]+)*")

def expected_dir_name(name: str) -> str:
    return name.replace(":", "-")  # crewloop:plan -> crewloop-plan
```

Validation passes when `expected_dir_name(frontmatter.name) == skill_dir.name` and `NAMESPACED_NAME.fullmatch(frontmatter.name)`.

## Flow Diagrams

### Target workflow (8 skills)

```
crewloop:hub (entry) → crewloop:plan → crewloop:design (if UI) → crewloop:code ⇄ crewloop:review → crewloop:ship → done
crewloop:brainstorm → crewloop:plan (completed brief)
crewloop:docs → back to crewloop:hub (invoker)
```

## Error Handling

- Repo-wide sweep (T7) uses `rg` over both old flat names and removed skill names; any hit outside `specs/archive/` is a build-blocking finding.
- `validate-skills.py` fails if any SKILL.md references an unknown skill name (link check + contract closure already enforce this).
- Dashboard registry degrades gracefully for unknown names (existing fallback icon), so stale events from older installs do not crash the UI.

## Performance Considerations

None — content/config refactor only.

## Security Considerations

- Removal of diamondblock CLI paths deletes an external-binary invocation surface (positive).
- No secrets involved; reviewer still scans the final diff per the standard security checklist.
