# Living Spec: Workflow

> Merged source of truth for the CrewLoop delivery workflow. Last merged: spec 034 (`034-automatic-routing-and-plan-discovery-merge`).

## Team

CrewLoop is a 6-skill role-separated workflow:

| Skill | Role | Never does |
|-------|------|-----------|
| `crewloop:plan` | Discovery, brief synthesis, spec creation, architecture, and routing | Implementation, git, review |
| `crewloop:design` | UI/UX aesthetic direction and design specs | Implementation, git |
| `crewloop:code` | Implementation, tests, and verification | Git, review, architecture |
| `crewloop:review` | Code review, quality gate, security scan | Writing code, git |
| `crewloop:ship` | Git commit, branch creation, push, and PR | Reviewing code, writing implementation |
| `crewloop:docs` | Documentation authoring | Implementation, git, architecture |

## Auto-Routing Flow

```
User request → crewloop:plan → crewloop:design (if UI) → crewloop:code → crewloop:review → crewloop:ship → done
                                  └──── no UI ────────┘
                                       ↑______ FAIL _______|
                                       |__ FAIL (after one fix) __→ crewloop:plan
```

- `crewloop:plan` evaluates the change and routes to `crewloop:design` if the spec touches UI, otherwise to `crewloop:code`.
- `crewloop:code` routes to `crewloop:review` when verification passes. If a build fails and cannot be fixed, it routes back to `crewloop:plan` with the error context.
- `crewloop:review` routes to `crewloop:ship` on PASS and back to `crewloop:code` on FAIL with the review findings.
- `crewloop:ship` routes to `done` after a successful push.
- `crewloop:docs` is invoked on demand and returns to its invoker (default `crewloop:plan`).

## User Interrupts

The user can halt the auto-route flow with explicit commands:

- `stop`
- `pause`
- `volta` / `voltar`
- `re-analyze`

When any of these are detected, the current skill returns to `crewloop:plan`.

## AFK Mode

When AFK mode is active:

1. Every skill performs its task and returns control to `crewloop:plan` automatically.
2. `crewloop:plan` evaluates the workflow state and loads the next appropriate skill per the transition contract.
3. The standard phase order still applies: `crewloop:plan` → `crewloop:design` (if UI) → `crewloop:code` → `crewloop:review` → `crewloop:ship`.
4. No end-of-skill menus are presented.

## Transition Contract

The canonical transition contract lives in `references/skill-contracts.yaml`. Each `SKILL.md` contains an inline `## TRANSITION CONTRACT` capsule that must match the YAML contract.

## Spec Rules

- Every change gets a spec before implementation, even a 1-line bug fix.
- Specs live in `specs/changes/NNN-name/`.
- After `crewloop:review` PASS, `crewloop:ship` archives the change to `specs/archive/YYYY-MM-DD-NNN-name/` and merges deltas into the relevant `specs/living/` spec.
