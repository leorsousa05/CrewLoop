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

Skills live in `skills/<skill-name>/SKILL.md`. They are loaded by compatible agents (Kimi Code, Claude, Codex, AGY) and triggered by conversation context.

## The 13 skills

### Core Skills

Mandatory in every task flow. No task bypasses any of them.

| Skill | Phase | Role |
|-------|-------|------|
| **Orchestrator** | Discovery | Gathers context, asks questions, produces a Task Brief, routes to Architect |
| **Architect** | Specs | Creates spec folders, defines contracts, routes to Designer or Engineer |
| **Designer** | Design | Commits to aesthetic direction, produces a design spec |
| **Engineer** | Build | Writes implementation code and tests — the only skill that does |
| **Reviewer** | Review | Audits quality, security, and spec compliance — never writes code |
| **Shipper** | Ship | Commits, branches, pushes, opens PRs — the only skill that touches git |

### Supporting Skills

Invoked by Orchestrator or Reviewer when the task needs a specialist.

| Skill | Invoked when |
|-------|-------------|
| **Docs-Writer** | Pure documentation tasks without code changes |
| **Tester** | Test strategy, QA, coverage analysis, bug reproduction |
| **Product-Manager** | Prioritization, roadmap, user stories, success metrics |
| **Maintainer** | Bug triage, technical debt, dependency updates, incidents |
| **Researcher** | Technology evaluation, library comparison, proof-of-concept |
| **Security-Guard** | Security review, secret scanning, auth, PII, authorization |
| **Accessibility-Auditor** | WCAG compliance, keyboard nav, screen readers, color contrast |

Supporting skills report findings back to the skill that invoked them. They do not write code or run git operations.

## Role separation rules

| Rule | Rationale |
|------|-----------|
| Only Engineer writes implementation code | Prevents untested, unreviewed code from other skills |
| Only Shipper touches git | Ensures every commit is deliberate, reviewed, and Conventional Commits-compliant |
| Only Reviewer approves changes | Prevents self-review and rubber-stamping |
| Orchestrator always routes to Architect first | Ensures specs exist before any code is written |
| Designer acts before Engineer on UI | Ensures visual direction is set before implementation |

## The crew is not a committee

Each skill makes its own decisions within its phase. The Architect does not ask the Engineer for architectural opinions. The Reviewer does not rewrite code. The Shipper does not reopen scope.

**Decisions belong to one skill per phase. That is what makes the flow predictable.**
