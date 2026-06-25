# AGENTS.md

> Guide for AI agents working in this repository. Read this file before making any changes.

---

## Project Overview

This repository contains the **Loop Engineering Agents**: a team of AI skills designed to operate together as a complete software development flow. Each skill represents a specialized role — orchestrator, architect, designer, engineer, reviewer, and shipper — and is distributed as an independent `SKILL.md` file inside `skills/`.

The skills are consumed by compatible AI agents (Claude Code, Kimi Code, etc.). The project has no executable runtime dependencies. All value lies in the documentation of processes, routing rules, and work conventions.

The main documentation is in English, with technical terms in English (e.g., `specs/`, `brief`, `BUILD`).

---

## Second-Brain Memory

The project includes an Obsidian-based second brain for long-term context:

- **Skill:** `skills/obsidian-second-brain/SKILL.md`
- **Server:** `servers/obsidian-mcp/`
- **Vault:** `~/.lea`

Every skill in the bundle must invoke the `obsidian-second-brain` skill at the start of a task (to read prior context) and at the end (to persist outcomes). Skills must never read or write files in `~/.lea` directly.

See `references/obsidian-mcp-usage.md` for the full layer map and tool reference.

---

## Repository Structure

```
loop-engineering-agents/
├── README.md                  # Public project documentation
├── AGENTS.md                  # This file
├── skills/                    # All team skills
│   ├── orchestrator/
│   │   └── SKILL.md           # Requirement discovery and routing
│   ├── architect/
│   │   ├── SKILL.md           # Technical specification and specs
│   │   └── references/
│   │       └── templates/     # Spec templates
│   ├── designer/
│   │   └── SKILL.md           # Aesthetic direction and design specs
│   ├── engineer/
│   │   └── SKILL.md           # Implementation and tests
│   ├── reviewer/
│   │   └── SKILL.md           # Code review and quality gate
│   └── shipper/
│       └── SKILL.md           # Git workflow and PR
├── scripts/                   # Helper scripts
│   ├── validate-skills.py     # Validate SKILL.md files
│   ├── package-skill.py       # Package a skill into .skill archive
│   └── npm-publish-dry-run.sh # Dry-run npm publish workflow
├── servers/                   # Optional MCP servers
│   └── obsidian-mcp/          # Local Obsidian second-brain server
├── references/                # Shared reference documentation
│   ├── conventions.md         # Conventional Commits, navigation, specs
│   ├── skill-anatomy.md       # How to write a skill
│   └── workflow.md            # Full team workflow
├── assets/                    # Templates and static assets
│   └── templates/
│       └── skill-template.md  # Template for new SKILL.md files
└── tests/                     # Manual testing notes
    └── README.md
```

### Main Files

- `README.md`: team presentation, installation, workflow, and principles.
- `skills/orchestrator/SKILL.md`: entry point for any task. Never writes code; collects context and routes mandatorily to the architect.
- `skills/architect/SKILL.md`: creates mandatory specs in `specs/` for any change.
- `skills/designer/SKILL.md`: defines aesthetic direction and visual specification when there is UI.
- `skills/engineer/SKILL.md`: implements specs, writes tests, and verifies builds.
- `skills/reviewer/SKILL.md`: reviews code for quality, security, spec compliance, and AI artifacts.
- `skills/shipper/SKILL.md`: executes git operations, commits in the Conventional Commits standard, and prepares PRs.
- `references/conventions.md`: shared conventions for commits, navigation, and specs.
- `references/skill-anatomy.md`: guide for writing new skills.
- `references/workflow.md`: complete workflow reference.
- `scripts/validate-skills.py`: validates all `SKILL.md` files.
- `scripts/package-skill.py`: packages a single skill into a `.skill` archive.
- `packages/cli/`: TypeScript CLI that installs skills and configures agent hooks.

There are no runtime build configuration files such as `pyproject.toml`, `package.json`, `Cargo.toml`, or `Makefile`.

---

## Technology and Architecture

- **Project type:** collection of skills/documentation for AI agents.
- **Language:** Markdown, with helper scripts in Bash and Python.
- **Stack:** none. There is no source code, services, or runtime dependencies.
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
- At the end of each skill, present a letter-based navigation menu using the standard identifiers: `[A] Architect`, `[D] Designer`, `[E] Engineer`, `[R] Reviewer`, `[S] Shipper`, `[O] Orchestrator`. Each skill may include only the subset that is relevant for its next handoff; the menu must remain letter-based and must not proceed automatically without user confirmation.
- **AFK mode exception:** When the user has explicitly activated AFK mode (or `MEMORY.md` contains `afk: true`), the skill may skip the navigation menu and load the next skill automatically via the `Skill` tool, as documented in the individual `SKILL.md`.

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

There is no build. The project consists primarily of Markdown files with small helper scripts.

### Tests

There are no automated tests. Use `scripts/validate-skills.py` to check the structure and frontmatter of all skills. See `tests/README.md` for manual testing guidance.

### Deploy

There is no deploy. Install the CLI and run it to set up skills and dashboard hooks:

```bash
npm install -g @archznn/crewloop-skills
crewloop install
```

`crewloop install` copies the skills to the default agent directory (`~/.agents/skills/`), installs the Obsidian MCP server, and automatically configures dashboard hooks for supported agents (Kimi, Claude, Codex, AGY). Use `--no-hooks` to skip hook configuration.

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

1. Any change must pass through the full flow: orchestrator → architect → (designer, if there is UI) → engineer → reviewer → shipper.
2. Create or update specs in `specs/changes/NNN-name/` before modifying any `SKILL.md`.
3. Keep `README.md` and `AGENTS.md` updated if you change the structure or team rules.
4. Follow the Conventional Commits standard for all commit messages.
5. Do not do git operations directly — use the shipper skill.
6. Run `python scripts/validate-skills.py` after adding or editing a skill.
7. To test the installation flow, run `crewloop install` from the CLI package; use `--no-hooks` to verify the legacy skill-copy path.

---

## Notes for Agents

- This project is **documentation-first**. Do not execute build commands, install dependencies, or create runtime configuration files unless an explicit spec requires it.
- When editing `SKILL.md`, preserve the front matter structure (`--- name: ... description: ... ---`), the letter-based navigation rules, and the clear separation of responsibilities between skills.
- The main language of the documentation is **English**. Keep technical terms in English when already established.
- Place new skills in `skills/<skill-name>/SKILL.md`. Use `assets/templates/skill-template.md` as a starting point.
- Shared conventions belong in `references/`. Skill-specific references belong in `skills/<skill-name>/references/`.
