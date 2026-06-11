# AGENTS.md

> Guide for AI agents working in this repository. Read this file before making any changes.

---

## Project Overview

This repository contains the **Loop Engineering Agents**: a team of AI skills designed to operate together as a complete software development flow. Each skill represents a specialized role — orchestrator, architect, designer, engineer, reviewer, and shipper — and is distributed as an independent `SKILL.md` file.

The skills are consumed by compatible AI agents (Claude Code, Kimi Code, etc.). The project has no executable code, build, automated tests, or runtime dependencies. All value lies in the documentation of processes, routing rules, and work conventions.

The main documentation is in English, with technical terms in English (e.g., `specs/`, `brief`, `BUILD`).

---

## Repository Structure

```
loop-engineering-agents/
├── README.md                  # Public project documentation
├── AGENTS.md                  # This file
├── architect/
│   └── SKILL.md               # Technical specification and specs
├── designer/
│   └── SKILL.md               # Aesthetic direction and design specs
├── engineer/
│   └── SKILL.md               # Implementation and tests
├── orchestrator/
│   └── SKILL.md               # Requirement discovery and routing
├── reviewer/
│   └── SKILL.md               # Code review and quality gate
└── shipper/
    └── SKILL.md               # Git workflow and PR
```

### Main Files

- `README.md`: team presentation, installation, workflow, and principles.
- `orchestrator/SKILL.md`: entry point for any task. Never writes code; collects context and routes mandatorily to the architect.
- `architect/SKILL.md`: creates mandatory specs in `specs/` for any change.
- `designer/SKILL.md`: defines aesthetic direction and visual specification when there is UI.
- `engineer/SKILL.md`: implements specs, writes tests, and verifies builds.
- `reviewer/SKILL.md`: reviews code for quality, security, spec compliance, and AI artifacts.
- `shipper/SKILL.md`: executes git operations, commits in the Conventional Commits standard, and prepares PRs.

There are no build configuration files such as `pyproject.toml`, `package.json`, `Cargo.toml`, `Makefile`, etc.

---

## Technology and Architecture

- **Project type:** collection of skills/documentation for AI agents.
- **Language:** Markdown.
- **Stack:** none. There is no source code, scripts, packages, or services.
- **Runtime:** not applicable.
- **Architecture:** modular by role (orchestrator → architect → designer/engineer → reviewer → shipper → orchestrator).

Each skill is autonomous and describes:

1. Its role and responsibilities.
2. The workflow to be followed.
3. Rules of what to do and what never to do.
4. Expected deliverables.
5. Navigation options for the next skill.

---

## Development Conventions

### Mandatory Flow

```
Orchestrator → Architect → (Designer, if UI) → Engineer → Reviewer → Shipper → Orchestrator
```

Critical rules:

- The orchestrator **always** sends to the architect first. Never directly to designer or engineer.
- The architect creates specs for **any** change, including 1-line bug fixes.
- Designer acts **before** the engineer when there is a visual interface.
- Engineer **never** executes git operations or reviews their own code.
- Reviewer **never** writes code or runs git operations.
- Shipper is the only one responsible for commit, branch, push, and PR.
- At the end of each skill, present letter-based navigation menu: `[A] Architect`, `[D] Designer`, `[E] Engineer`, `[R] Reviewer`, `[S] Shipper`, `[O] Orchestrator`.

### Standards Followed by the Skills

| Standard | Application |
|----------|-------------|
| SDD (Spec-Driven Development) | Specs in `specs/` are the source of truth. |
| DDD (Domain-Driven Design) | Organization by bounded contexts. |
| CDD (Contract-Driven Development) | Contracts, interfaces, and explicit types. |
| TDD (Test-Driven Development) | Tests before or alongside implementation. |
| Context Engineering | Semantic names; understand function by reading ≤2 adjacent files. |

### Specs Structure

```
specs/
├── changes/                        # Active deltas
│   └── 001-change-name/
│       ├── .spec.yaml              # status, dates, author
│       ├── proposal.md             # WHY
│       ├── specs/                  # WHAT
│       ├── design.md               # HOW
│       └── tasks.md                # ordered checklist
├── archive/                        # Completed changes (YYYY-MM-DD-NNN-name)
├── living/                         # Merged source of truth
├── decisions/                      # ADRs
└── templates/                      # Reusable templates
```

Rules:

- Every spec goes inside `specs/changes/NNN-name/`. Never directly in `specs/`.
- `living/` reflects the current state of the system.
- `archive/` preserves completed changes for audit.
- `decisions/` records irreversible architectural choices.

### Commits

- Standard: **Conventional Commits**.
- Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Description in imperative, maximum 72 characters, no trailing period.
- Branches: `<type>/<short-description>` in kebab-case.
- Breaking changes use `!` after type/scope.

---

## Build, Test, and Deploy

### Build

There is no build. The project consists exclusively of Markdown files.

### Tests

There are no automated tests. The skills include TDD criteria to be applied by the engineer during implementations in other projects, but this repository itself has no test suite.

### Deploy

There is no deploy. The "installation" consists of copying the skill folders to the AI agent's skills directory (e.g., `~/.agents/skills/`).

---

## Security

- Do not store secrets (API keys, tokens, passwords) in any repository file.
- The reviewer must scan changes for:
  - Strings such as `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE_KEY`.
  - `.env` files.
  - Build/dependency directories (`node_modules/`, `.next/`, `dist/`, `build/`).
  - AI artifacts: "Written by AI" comments, placeholders, `TODO` without reference, `console.log`, `debugger`, empty `catch` blocks, etc.
- The shipper must respect `.gitignore` and never commit secrets, `.env` files, or build/dependency directories.

---

## How to Contribute

1. Any change must go through the full flow: orchestrator → architect → (designer, if there is UI) → engineer → reviewer → shipper.
2. Create or update specs in `specs/changes/NNN-name/` before modifying any `SKILL.md`.
3. Keep `README.md` and `AGENTS.md` updated if you change the structure or team rules.
4. Follow the Conventional Commits standard for all commit messages.
5. Do not do git operations directly — use the shipper skill.

---

## Notes for Agents

- This project is **documentation only**. Do not execute build commands, install dependencies, or create runtime configuration files unless an explicit spec requires it.
- When editing `SKILL.md`, preserve the front matter structure (`--- name: ... description: ... ---`), the letter-based navigation rules, and the clear separation of responsibilities between skills.
- The main language of the documentation is **English**. Keep technical terms in English when already established.
