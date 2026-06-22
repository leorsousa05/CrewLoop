# Concepts

Before using CrewLoop, it helps to understand the core ideas that make it work.

## Skill

A **skill** is a reusable instruction set for an AI agent. In CrewLoop, each skill is a `SKILL.md` file that defines:

- The role and responsibilities.
- What the skill must never do.
- The expected inputs and outputs.
- How to hand off to the next skill.

Skills are loaded by compatible agents (Claude Code, Kimi Code, etc.) and triggered by conversation context.

## Brief

A **brief** is the structured output of the Orchestrator. It captures:

- Task type and scope.
- Context and constraints.
- Requirements (functional and non-functional).
- Design and architecture preferences.
- UI/UX preferences (if applicable).
- Security, infrastructure, and testing considerations.

The brief is passed verbatim to the Architect.

## Spec

A **spec** is the source of truth for a change. It lives in `specs/changes/NNN-name/` and contains:

- `.spec.yaml` — metadata (status, author, dates).
- `proposal.md` — why the change is needed.
- `specs/spec.md` — what the change must do.
- `design.md` — how it should be built (UI/UX, architecture).
- `tasks.md` — ordered checklist.

Every change, including one-line bug fixes, gets a spec.

## Artifact

An **artifact** is any document or code produced by a skill:

| Phase | Artifact |
|-------|----------|
| Orchestrator | Task Brief |
| Architect | Spec Folder |
| Designer | Design Spec |
| Engineer | Code + Tests |
| Reviewer | Review Report |
| Shipper | Branch + Commit + PR, Archived Spec |

Artifacts make the workflow traceable.

## Navigation menu

At the end of each skill, a letter-based menu is presented:

```
[A] Architect  [D] Designer  [E] Engineer
[R] Reviewer   [S] Shipper   [O] Orchestrator
```

Each skill shows only the options relevant to its handoff. The agent waits for explicit user confirmation.

## AFK mode

**AFK mode** lets the workflow continue without manual menu selection. When activated (by the user saying "AFK" or by `MEMORY.md` containing `afk: true`), the skill:

- Skips the navigation menu.
- States the next skill.
- Loads the next skill automatically.

This is the only exception to the "never route automatically" rule.

## Second brain

The **Obsidian Second Brain** is an optional memory layer powered by a local Obsidian vault (`~/.lea`) and the `obsidian-mcp` server. It stores:

- User priorities in `MEMORY.md`.
- Durable knowledge in `Knowledge/`.
- Session outcomes in `Journal/`.
- Temporary drafts in `Notes/`.

If the vault is unavailable, CrewLoop continues without it.

## Conventional Commits

All commits follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
type(scope): description
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

The Shipper generates these messages by analyzing the diff.
