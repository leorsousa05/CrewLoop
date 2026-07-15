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

Skills live in `skills/<skill-name>/SKILL.md`. They are loaded by compatible agents (Kimi Code, Claude, Codex, AGY, OpenCode) and triggered by conversation context.

## The 19 skills

### Core Skills

These skills own the delivery loop. Designer participates only when a change affects a visual interface.

| Skill | Phase | Role |
|-------|-------|------|
| **CrewLoop Hub** | Discovery | Gathers context, asks questions, produces a Task Brief, routes to Architect |
| **Architect** | Specs | Creates spec folders, defines contracts, routes to Designer or Engineer |
| **Designer** | Design | Commits to aesthetic direction, produces a design spec |
| **Engineer** | Build | Writes implementation code and tests — the only skill that does |
| **Reviewer** | Review | Audits quality, security, and spec compliance — never writes code |
| **Shipper** | Ship | Commits, branches, pushes, opens PRs — the only skill that touches git |

### Supporting Skills

Invoked by the owning core skill when a task needs specialist analysis. Default invokers are defined in `references/skill-contracts.yaml`.

| Skill | Invoked when |
|-------|-------------|
| **Project-Brainstorm** | New or ambiguous software project ideas that need interactive discovery before specs |
| **Long-Term Manager** | Projects that span multiple sessions and need durable tracking artifacts across sessions |
| **Docs-Writer** | Pure documentation tasks without code changes |
| **Tester** | Test strategy, QA, coverage analysis, bug reproduction |
| **Product-Manager** | Prioritization, roadmap, user stories, success metrics |
| **Maintainer** | Bug triage, technical debt, dependency updates, incidents |
| **Researcher** | Technology evaluation, library comparison, proof-of-concept |
| **Security-Guard** | Security review, secret scanning, auth, PII, authorization |
| **Accessibility-Auditor** | WCAG compliance, keyboard nav, screen readers, color contrast |
| **DiamondBlock** | Optional session memory, semantic context retrieval, and codebase search |
| **Frontend-Architect** | React component boundaries, props, slots, and state ownership |
| **Schema-Designer** | Relational schemas, constraints, migrations, and API contracts |
| **DevOps-Specialist** | CI/CD, deployment, containers, and infrastructure validation |

Supporting skills report findings back to the skill that invoked them. Maintainer and Project Brainstorm route confirmed triage/completed briefs to Architect. They do not write implementation code or run git operations.

## Role separation rules

| Rule | Rationale |
|------|-----------|
| Only Engineer writes implementation code | Prevents untested, unreviewed code from other skills |
| Only Shipper touches git | Ensures every commit is deliberate, reviewed, and Conventional Commits-compliant |
| Only Reviewer approves changes | Prevents self-review and rubber-stamping |
| Architect is the first mandatory delivery phase | Allows approved discovery helpers while ensuring specs exist before delivery work |
| Designer acts before Engineer on UI | Ensures visual direction is set before implementation |

## The crew is not a committee

Each skill makes its own decisions within its phase. The Architect does not ask the Engineer for architectural opinions. The Reviewer does not rewrite code. The Shipper does not reopen scope.

**Decisions belong to one skill per phase. That is what makes the flow predictable.**
