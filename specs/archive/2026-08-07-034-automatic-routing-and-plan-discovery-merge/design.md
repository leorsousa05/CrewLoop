# Design: Automatic Routing & Plan as Unified Discovery Entry

## Overview

Replace the three-role entry (`crewloop:hub` → `crewloop:brainstorm` / `crewloop:plan`) with a single `crewloop:plan` skill that owns discovery, brief synthesis, and spec creation. All downstream skills (`crewloop:design`, `crewloop:code`, `crewloop:review`, `crewloop:ship`, `crewloop:docs`) switch from letter-based ending menus to automatic handoffs. The user can interrupt with explicit commands, but the default behavior is continuous, state-aware routing.

## Assumptions & Defaults

- **Plan is the entry point.** Every session starts with `crewloop:plan` because the CLI hook now passes `--default-skill crewloop-plan`. The dashboard maps the directory name `crewloop-plan` to the canonical `crewloop:plan`.
- **Auto-routing is the default; interruption is explicit.** The user can say `stop`, `pause`, `volta`, `voltar`, or `re-analyze` to halt or return to `crewloop:plan`. Revisit if users need a soft-confirm mode.
- **Design is conditional.** `crewloop:plan` decides whether the change touches UI by reading the brief and spec; if yes, it routes to `crewloop:design`, otherwise to `crewloop:code`.
- **Failure paths are also automatic.** `crewloop:review` on FAIL routes back to `crewloop:code`. `crewloop:code` on a failed build routes back to `crewloop:plan` after one failed fix attempt, carrying the error context. Revisit if looping becomes a problem.
- **`crewloop:docs` is invoked on demand.** The user can still ask for pure documentation; `crewloop:docs` returns to `crewloop:plan` when done, because there is no longer a Hub.
- **AFK mode is Plan-driven.** In AFK, every skill returns to `crewloop:plan`, which evaluates the workflow state and loads the next skill. This replaces the old Hub-mediated AFK router.

## 7 Analysis Questions

1. **Domain and bounded context placement?** The change belongs to the **workflow** and **skills** bounded contexts. It rewrites the role definitions in `skills/`, the routing contract in `references/`, and the install/default-skill surface in `packages/cli/` and `servers/dashboard/`.
2. **Core responsibilities of new/changed components?** `crewloop:plan` now does discovery + brief + spec + routing. `crewloop:design`, `crewloop:code`, `crewloop:review`, `crewloop:ship`, and `crewloop:docs` focus on their single responsibility and auto-route. `references/skill-contracts.yaml` becomes the single source of truth for transitions.
3. **Contracts (interfaces, types, APIs) to define or change?** The YAML contract is the canonical contract. We add two new conditional direct-target strings: `conditional-crewloop:ship-or-crewloop:code` (for review) and `conditional-crewloop:plan-or-crewloop:review` (for code when build fails). The validator must accept them. There is no new runtime API.
4. **Which parts need tests per TDD skip criteria?** The Markdown skill instructions are content, not code, so they are validated by `validate-skills.py`. The CLI default-skill string and root detection are config changes covered by existing tests. The dashboard `canonicalSkillName` helper already has test coverage via inference tests. The validator canonical-skill check is logic with branching and must be covered by `test_validate_skills.py`.
5. **Architecture that minimizes ambiguity?** A **directed workflow graph** with `crewloop:plan` as the entry node. Each skill is a node with one default outgoing edge. Explicit interrupts are exceptions. This is the simplest state machine that satisfies the requirement.
6. **Project structure changes needed?** Delete `skills/crewloop-hub/` and `skills/crewloop-brainstorm/`. Rewrite `skills/crewloop-plan/SKILL.md`. Update all remaining skill SKILL.md files. Update references, templates, AGENTS.md, README.md, CLI defaults, dashboard icon maps, and validator.
7. **Key trade-offs?** Simplicity vs. flexibility: removing the Hub and menus reduces user control but removes friction. Centralizing discovery in Plan makes the skill larger; we mitigate this with subagents and clear internal phases. Removing Brainstorm means there is no longer a dedicated ambiguous-project skill; Plan must detect ambiguity and run the brainstorming phase itself.

## Proposed Directory & File Structure

```
crewloop/
├── skills/
│   ├── crewloop-plan/SKILL.md            (Rewritten: discovery + brief + spec + routing)
│   ├── crewloop-plan/references/         (unchanged)
│   ├── crewloop-design/SKILL.md          (Modified: auto-route to code)
│   ├── crewloop-code/SKILL.md            (Modified: auto-route to review or plan on failure)
│   ├── crewloop-review/SKILL.md          (Modified: auto-route to ship or code)
│   ├── crewloop-ship/SKILL.md            (Modified: auto-route to done)
│   ├── crewloop-docs/SKILL.md            (Modified: default invoker = plan, auto-route to plan)
│   ├── crewloop-hub/                     (Deleted)
│   └── crewloop-brainstorm/              (Deleted)
├── references/
│   ├── skill-contracts.yaml              (Rewritten: 6 entries, direct routes)
│   ├── conventions.md                    (Modified: 6-skill transition table, no menus)
│   ├── workflow.md                       (Rewritten: 6-skill flow, plan-driven AFK)
│   └── skill-anatomy.md                  (Modified: naming + entry skill note)
├── assets/templates/skill-template.md    (Modified: default invoker = plan, no menu example)
├── AGENTS.md                             (Modified: 6 skills, flow rules)
├── README.md                             (Modified: team description, install flow)
├── packages/cli/src/
│   ├── agents.ts                         (Modified: --default-skill crewloop-plan)
│   ├── cli.ts                            (Modified: root detection crewloop-plan/SKILL.md)
│   └── help.ts                           (Modified: example default skill)
├── servers/dashboard/src/
│   ├── lib/constants.ts                  (Modified: 6-skill icon map)
│   └── skills/registry.ts                (Modified: 6-skill icon map)
├── scripts/
│   ├── validate-skills.py                (Modified: EXPECTED_SKILLS=6, conditional strings)
│   └── tests/test_validate_skills.py     (Modified: fixtures)
└── specs/decisions/008-automatic-routing-and-plan-merge.md (New ADR)
```

## File-by-File Changes

| File | Action | What changes | Design ref |
|------|--------|--------------|------------|
| `skills/crewloop-hub/` | Delete | Skill no longer exists; Plan absorbs entry routing | §Overview |
| `skills/crewloop-brainstorm/` | Delete | Skill no longer exists; Plan absorbs brainstorming | §Overview |
| `skills/crewloop-plan/SKILL.md` | Rewrite | Frontmatter `name: crewloop:plan`, description as entry; role combines discovery + spec; asks comprehensive questions; uses subagents; writes brief + spec; auto-routes to design/code; dashboard lifecycle note | §Overview, §New Plan Skill |
| `skills/crewloop-design/SKILL.md` | Modify | Remove menu; auto-route to `crewloop:code`; AFK returns to `crewloop:plan` | §Auto-Routing |
| `skills/crewloop-code/SKILL.md` | Modify | Remove menu; auto-route to `crewloop:review` on success; on build failure after one fix, route to `crewloop:plan`; AFK returns to `crewloop:plan` | §Auto-Routing |
| `skills/crewloop-review/SKILL.md` | Modify | Remove menu; PASS → `crewloop:ship`, FAIL → `crewloop:code`; AFK returns to `crewloop:plan` | §Auto-Routing |
| `skills/crewloop-ship/SKILL.md` | Modify | Remove menu; after successful push, route to `done`; AFK returns to `crewloop:plan` | §Auto-Routing |
| `skills/crewloop-docs/SKILL.md` | Modify | Default invoker `crewloop:plan`; remove menu; auto-route to `crewloop:plan`; AFK returns to `crewloop:plan` | §Auto-Routing |
| `references/skill-contracts.yaml` | Rewrite | 6 entries; plan direct target conditional design/code; review conditional ship/code; code conditional review/plan; ship direct `done`; docs direct `crewloop:plan`; afk_target `crewloop:plan` for all | §Contracts |
| `references/conventions.md` | Modify | Transition table 6 rows; menu-block example updated; Hub/Brainstorm references removed; AFK section plan-driven | §Contracts |
| `references/workflow.md` | Rewrite | 6-skill team table; flow diagram with Plan at entry; routing rules; AFK flow | §Contracts |
| `references/skill-anatomy.md` | Modify | Note that new skills use `crewloop:plan` as default invoker; directory naming unchanged | §Contracts |
| `assets/templates/skill-template.md` | Modify | Default invoker `crewloop:plan`; transition contract without menu; auto-route | §Contracts |
| `AGENTS.md` / `README.md` | Modify | 6 skills, Plan as entry, no Hub/Brainstorm, no menus | §Docs |
| `packages/cli/src/agents.ts` | Modify | Hook `--default-skill crewloop-plan` | §CLI |
| `packages/cli/src/cli.ts` | Modify | Root detection `skills/crewloop-plan/SKILL.md` | §CLI |
| `packages/cli/src/help.ts` | Modify | Install example uses `crewloop-plan` as default skill reference | §CLI |
| `servers/dashboard/src/lib/constants.ts` | Modify | `SKILL_ICONS` keyed by 6 names; remove hub/brainstorm | §Dashboard |
| `servers/dashboard/src/skills/registry.ts` | Modify | `SKILL_ICONS` keyed by 6 names; remove hub/brainstorm | §Dashboard |
| `scripts/validate-skills.py` | Modify | `CANONICAL_SKILLS` = 6 dir names; accept new conditional direct-target strings; canonical checks for plan entry | §Validator |
| `scripts/tests/test_validate_skills.py` | Modify | Update fixtures to 6 skills and new contract strings | §Validator |
| `specs/decisions/008-automatic-routing-and-plan-merge.md` | Create | ADR: merge Hub/Brainstorm into Plan, auto-routing by default | §ADR |

## Code Architecture & Design Patterns

- **Architecture Model:** Directed workflow graph (state machine). `crewloop:plan` is the entry node and the AFK fallback router. Each skill is a node with one deterministic outgoing edge.
- **Design Patterns Used:**
  - **Single Responsibility with sequenced phases** — `crewloop:plan` has two internal phases (Discovery and Architecture) but remains one skill because they always run together for every task.
  - **Strategy pattern for routing** — the contract defines the routing rule; each skill follows its own rule without central logic at runtime.
  - **Exception-based interruption** — explicit user commands are the only branching path out of the auto-route graph.

## New `crewloop:plan` Skill Structure

The rewritten `SKILL.md` is organized as:

1. **ROLE** — entry point, discovery specialist, and spec writer.
2. **DASHBOARD LIFECYCLE** — mark session as `crewloop:plan`.
3. **TRANSITION CONTRACT** — direct route to `crewloop:design` or `crewloop:code`; AFK return to `crewloop:plan`.
4. **MODE** — discovery + analysis; never implementation; never git.
5. **SUBAGENT DELEGATION** — parallel exploration, reference reading, and specialist probes.
6. **WORKFLOW**
   - Phase 0: Read references and project context.
   - Phase 1: Subagent discovery (codebase, specs, ADRs, living docs).
   - Phase 2: Ask comprehensive questions (intent, objective, why, how, what, expectations, suggestions).
   - Phase 3: Synthesize structured brief.
   - Phase 4: Write spec (proposal, design, deltas, tasks, ADR).
   - Phase 5: Auto-route to `crewloop:design` if UI is involved, otherwise `crewloop:code`.
7. **INTERRUPTION COMMANDS** — `stop`, `pause`, `volta`, `voltar`, `re-analyze` halt the auto-route and return to `crewloop:plan`.

## Contracts

### `references/skill-contracts.yaml` target

```yaml
version: 3
skills:
  crewloop:plan:
    kind: core
    prefix: "> 🏗️ **CrewLoop Plan**"
    interactive: false
    direct_target: conditional-crewloop:design-or-crewloop:code
    afk_target: "crewloop:plan"
  crewloop:design:
    kind: core
    prefix: "> 🎨 **CrewLoop Design**"
    interactive: false
    direct_target: "crewloop:code"
    afk_target: "crewloop:plan"
  crewloop:code:
    kind: core
    prefix: "> 🔧 **CrewLoop Code**"
    interactive: false
    direct_target: conditional-crewloop:review-or-crewloop:plan
    afk_target: "crewloop:plan"
  crewloop:review:
    kind: core
    prefix: "> 🔍 **CrewLoop Review**"
    interactive: false
    direct_target: conditional-crewloop:ship-or-crewloop:code
    afk_target: "crewloop:plan"
  crewloop:ship:
    kind: core
    prefix: "> 🚀 **CrewLoop Ship**"
    interactive: false
    direct_target: done
    afk_target: "crewloop:plan"
  crewloop:docs:
    kind: supporting
    prefix: "> 📝 **CrewLoop Docs**"
    default_invoker: "crewloop:plan"
    return_strategy: invoker
    interactive: false
    direct_target: "crewloop:plan"
    afk_target: "crewloop:plan"
```

### Validator additions

Update `scripts/validate-skills.py` to accept:

```python
DIRECT_TARGET_CONDITIONALS = {
    "conditional-crewloop:design-or-crewloop:code",
    "conditional-crewloop:review-or-crewloop:plan",
    "conditional-crewloop:ship-or-crewloop:code",
}
```

And update canonical checks so the only entry skill is `crewloop:plan`.

## Flow Diagrams

### New workflow

```
User request → crewloop:plan → [UI?] crewloop:design → crewloop:code → crewloop:review → crewloop:ship → done
                          └─────── no UI ───────────────┘
                              ↑____________ FAIL ____________|
                              |____ FAIL (after one fix) ___→ crewloop:plan
```

`crewloop:docs` is invoked on demand and returns to `crewloop:plan`.

### AFK mode

```
All skills → crewloop:plan (evaluates state) → next skill
```

## Error Handling

- **User interrupt:** any skill that sees `stop`, `pause`, `volta`, `voltar`, or `re-analyze` halts and returns to `crewloop:plan`.
- **Build failure in code:** one automated fix attempt; if still failing, route to `crewloop:plan` with the error log so the spec can be adjusted.
- **Review FAIL:** route directly to `crewloop:code` with the review findings.
- **Missing spec:** any skill that needs a spec and doesn't find one routes to `crewloop:plan` instead of blocking.

## Performance Considerations

None. The change is instruction-level; no new runtime loops or data processing.

## Security Considerations

None. The change does not touch secrets, auth, or external APIs. The dashboard sanitization rules remain unchanged.
