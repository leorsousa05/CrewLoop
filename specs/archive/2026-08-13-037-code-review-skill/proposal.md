# Proposal: `crewloop:code-review` — Whole-Codebase Audit Skill

## WHY

Today `crewloop:review` conflates two responsibilities in the user's mind:

1. **Diff gate** (what it actually does): inspect the current uncommitted diff for spec compliance, security, and AI artifacts before shipping. Its transition contract (`PASS → crewloop:ship`, `FAIL → crewloop:code`) is built around this.
2. **Whole-codebase audit** (what it does NOT do): proactive analysis of the entire codebase to surface code debt — duplication, dead code, oversized files, complexity hotspots, missing tests, dependency rot — independent of any pending change.

Because the skill description uses generic triggers ("review", "code review"), requests for a full codebase audit are routed into a diff-only gate that produces an empty or misleading report when there is no diff. We need a dedicated skill, `crewloop:code-review`, that owns whole-codebase auditing, while `crewloop:review` is narrowed to explicitly own the pre-ship diff gate.

## Goals

- Add a new supporting skill `crewloop:code-review` in `skills/crewloop-code-review/` following `assets/templates/skill-template.md`.
- The skill audits the entire codebase (or a user-scoped subset) and produces a structured **Code Debt Report** with severity, file/line references, and suggested remediation.
- Register the skill in `references/skill-contracts.yaml` as a **supporting** skill returning to its invoker (default `crewloop:plan`).
- Narrow `crewloop:review`'s frontmatter description and SKILL.md wording so trigger keywords do not collide: "review a diff / changed code" → `crewloop:review`; "review the codebase / find code debt" → `crewloop:code-review`.
- Update `AGENTS.md`, `README.md`, `references/workflow.md`, and `references/conventions.md` to document the 7-skill team and the separation of the two review skills.

## Non-Goals

- **Do NOT change the transition contract of `crewloop:review`** — its routing (PASS → ship, FAIL → code) stays identical.
- **Do NOT add `crewloop:code-review` to the mandatory delivery loop** — it is an on-demand supporting skill, never a required phase.
- **Do NOT modify `crewloop:code`, `crewloop:ship`, `crewloop:design`, `crewloop:docs`, or `crewloop:plan` behavior** beyond Plan gaining awareness of the new skill for routing.
- **Do NOT implement automatic fixing** — the skill reports findings only; remediation goes through the normal `crewloop:plan → crewloop:code` flow.
- **Do NOT touch the CLI, dashboard, or docs site code.**

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Trigger collision with `crewloop:review` ("code review" keyword) | High | Explicitly partition keywords in both skills' descriptions; `crewloop:review` keeps pre-ship/diff triggers, `crewloop:code-review` takes codebase/audit/debt triggers. |
| Bundle Lock-In rule ("6 skills") contradicting a 7th skill | Medium | Update `AGENTS.md` Bundle Lock-In wording to reference the full registered skill set instead of a hard-coded count. |
| Validator rejects new skill | Low | Follow `assets/templates/skill-template.md` and run `python scripts/validate-skills.py`. |
| AFK flow accidentally routes into the audit skill | Low | `afk_target` is `crewloop:plan`; AFK phase order unchanged. |

## Acceptance Criteria

- **AC-1** Given the change is complete, when `ls skills/` runs, then `crewloop-code-review/` exists with a non-empty `SKILL.md` whose frontmatter `name` is `crewloop:code-review` and `description` mentions whole-codebase audit triggers (e.g. "code debt", "audit", "entire codebase").
- **AC-2** Given the new SKILL.md, when `python scripts/validate-skills.py` runs from the repo root, then it exits 0 with no errors for `crewloop-code-review`.
- **AC-3** Given `references/skill-contracts.yaml`, when parsed as YAML, then it contains a `crewloop:code-review` entry with `kind: supporting`, `return_strategy: invoker`, `direct_target: crewloop:plan`, and `afk_target: crewloop:plan`.
- **AC-4** Given `skills/crewloop-review/SKILL.md`, when its frontmatter description is read, then it no longer claims generic "code review" of arbitrary code; it states diff/change-gate scope (e.g. "reviews the current diff"), and the word "codebase audit" does not appear as its responsibility.
- **AC-5** Given the new SKILL.md, when its MODE section is read, then it contains explicit "NEVER write code" and "NEVER run git operations" restrictions.
- **AC-6** Given `references/workflow.md` and `references/conventions.md`, when their skill tables are read, then both list `crewloop:code-review` as a supporting skill that returns to its invoker / `crewloop:plan`, and the AFK role-prefix table includes the new skill's prefix.
- **AC-7** Given `AGENTS.md`, when the skill tables and Bundle Lock-In rule are read, then `crewloop:code-review` appears as a supporting skill and the lock-in rule no longer hard-codes "6 skills".
- **AC-8** Given the new SKILL.md workflow, when read, then it defines a deterministic audit procedure ending in a Code Debt Report containing per-finding severity and file/line references, and routes back to the invoker without presenting navigation menus.
