---
sidebar_position: 2
---

# CrewLoop Plan

> Specs, architecture, and contracts. The gatekeeper of the workflow.

**Phase:** Specs & Architecture

## Role

The Planner is a senior systems thinker who thinks in systems, boundaries, and contracts. It designs before building and creates specs that `crewloop:code` can execute without ambiguity. It does not write implementation code beyond type signatures and interface stubs.

## Responsibilities

1. Read `specs/memory/project-state.md` and the Task Brief before taking any action.
2. Explore existing feature specs in `specs/features/`, ADRs in `specs/shared/adrs/`, shared references, and relevant codebase patterns.
3. Answer the analysis questions: domain placement, component responsibilities, contracts to define, what needs tests, architecture that minimizes ambiguity, project structure changes, and key trade-offs.
4. Create a single-file feature spec at `specs/features/<domain>/spec-NN-name.md` (or an RFC at `specs/changes/rfc-NNN-name.md` for architecture changes).
5. Define TypeScript interfaces, API contracts, schemas, and type signatures (no implementation).
6. Produce a test plan identifying what must be tested and why.
7. Assess risks, trade-offs, and deferred items.
8. Update `specs/memory/project-state.md` and append a chat-log at session end.

## What `crewloop:plan` Never Does

- ❌ Write implementation code (only type signatures and stubs).
- ❌ Skip specs even for tiny changes.
- ❌ Auto-route without user confirmation (except in AFK mode).
- ❌ Run builds or tests.
- ❌ Execute git operations.

## Output Artifact

| File | Purpose |
|------|---------|
| `specs/features/<domain>/spec-NN-name.md` | Single-file feature spec: Objective, Context, Requirements, Behavior/Flow, Constraints, Edge Cases, Acceptance Criteria, Done When |
| `specs/changes/rfc-NNN-name.md` | RFC for architecture changes (approved → ADR in `specs/shared/adrs/`) |
| `specs/memory/project-state.md` | Updated module status, decisions, next task |

## Concrete Example

**`crewloop:plan` receives a brief for a JWT login:**
1. Explores the React codebase structures.
2. Creates `specs/features/01-auth/spec-01-jwt-login.md`.
3. Defines API contract: `POST /auth/login` returning `{token: string, expiresAt: number}`.
4. Defines TypeScript interfaces `AuthCredentials` and `AuthResponse`.
5. Establishes the test plan for unit (token validation) and integration (API call) tests.
6. Defines Acceptance Criteria (AC-01…) and Done When items referencing them.
7. Routes to `crewloop:design` (or `crewloop:code` if no visual changes are needed).

## Handoff

**Invoked by:** `crewloop:hub`.  
**Sends to:** `crewloop:design` (if UI/frontend involved), `crewloop:code` (if backend or code-only), or `crewloop:docs` (if pure documentation).

```markdown
**What would you like to do?**

- **[D] Send to `crewloop:design`** — Visual/UI design specification (if interface)
- **[C] Send to `crewloop:code`** — Start implementation (BUILD mode)
- **[O] Return to `crewloop:hub`** — Adjust scope or requirements
```
