---
sidebar_position: 1
---

# Skills and Roles

## What is a skill?

A **skill** is a reusable instruction set for an AI agent. In CrewLoop, each skill is a `SKILL.md` file that defines:

- The role and its responsibilities
- What the skill must **never** do
- The expected inputs and outputs
- How to hand off to the next skill

Skills live in `skills/crewloop-<slug>/SKILL.md` with logical identity `crewloop:<slug>`. They are loaded by compatible agents (Kimi Code, Claude, Codex, AGY, OpenCode) and triggered by conversation context.

## The 8 skills

### Core Skills

These skills own the delivery loop. `crewloop:design` participates only when a change affects a visual interface.

| Skill | Phase | Role |
|-------|-------|------|
| **`crewloop:hub`** | Discovery | Gathers context, asks questions, produces a Task Brief, routes to `crewloop:plan` |
| **`crewloop:plan`** | Specs | Creates spec folders, defines contracts, routes to `crewloop:design` or `crewloop:code` |
| **`crewloop:design`** | Design | Commits to aesthetic direction, produces a design spec |
| **`crewloop:code`** | Build | Writes implementation code and tests — the only skill that does |
| **`crewloop:review`** | Review | Audits quality, security, and spec compliance — never writes code |
| **`crewloop:ship`** | Ship | Commits, branches, pushes, opens PRs — the only skill that touches git |

### Supporting Skills

Invoked by the owning core skill when a task needs specialist analysis. Supporting skills report findings back to the skill that invoked them and do not write implementation code or run git operations.

| Skill | Invoked by | Purpose |
|-------|-----------|---------|
| **`crewloop:brainstorm`** | `crewloop:hub` | New or ambiguous software project ideas that need interactive discovery before specs |
| **`crewloop:docs`** | `crewloop:hub` (or any core skill) | Pure documentation tasks without code changes |

`crewloop:brainstorm` hands its completed Task Brief to `crewloop:plan`. `crewloop:docs` returns to its invoker.

## Role separation rules

| Rule | Rationale |
|------|-----------|
| Only `crewloop:code` writes implementation code | Prevents untested, unreviewed code from other skills |
| Only `crewloop:ship` touches git | Ensures every commit is deliberate, reviewed, and Conventional Commits-compliant |
| Only `crewloop:review` approves changes | Prevents self-review and rubber-stamping |
| `crewloop:plan` is the first mandatory delivery phase | Allows discovery helpers while ensuring specs exist before delivery work |
| `crewloop:design` acts before `crewloop:code` on UI | Ensures visual direction is set before implementation |

## The crew is not a committee

Each skill makes its own decisions within its phase. The Planner does not ask `crewloop:code` for architecture-level opinions. `crewloop:review` does not rewrite code. `crewloop:ship` does not reopen scope.

**Decisions belong to one skill per phase. That is what makes the flow predictable.**
