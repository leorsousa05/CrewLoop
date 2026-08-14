# AGENTS.md

> Guide for AI agents working in this repository. Read this file before making any changes.

---

## Project Overview

**CrewLoop** is a team of AI skills that operate together as a complete, role-separated software development workflow. Each skill represents a specialist role — CrewLoop Plan, CrewLoop Design, CrewLoop Code, CrewLoop Review, CrewLoop Ship, and CrewLoop Docs — and is distributed as an independent `SKILL.md` file that any compatible AI agent can load and follow.

**Why it exists:** Most AI agents operate without a structured process — they jump straight to implementation, skip architecture, and skip review. CrewLoop enforces a mandatory flow where every change goes through context gathering, spec creation, design (if there is UI), implementation, code review, and git operations, each handled by a dedicated skill.

**How it is consumed:** Install the CLI globally and run `crewloop install`. The CLI copies all skills to the agent's skill directory (e.g., `~/.agents/skills/`) and configures hook files for supported agents so that the real-time dashboard receives tool-use events. Supported agents: Kimi Code, Claude, Codex, AGY, OpenCode.

**What this repository contains:**
- **Skills** — 7 Markdown skill files, each describing a specialist role
- **CLI** (`packages/cli/`) — TypeScript tool that installs skills and configures agent hooks
- **Dashboard** (`servers/dashboard/`) — real-time WebSocket server + browser UI that shows which skill is active and a live event timeline
- **Docs site** (`docs/`) — Vite + React + Tailwind SPA deployed to GitHub Pages
- **Helper scripts** — Python/Bash scripts for skill validation and packaging

**Key constraint:** This is a documentation-first project. The skills folder has no runtime application. Do not execute build commands, install dependencies, or create runtime config files unless an explicit spec requires it.

---

## Repository Structure

```
crewloop/
├── AGENTS.md                        # This file
├── README.md                        # Public project documentation
├── package.json                     # npm workspace (packages/cli + servers/dashboard)
├── package-lock.json
├── .gitignore
├── .github/
│   └── workflows/                   # CI/CD: npm publish, validation
├── assets/
│   └── templates/
│       └── skill-template.md        # Template for new SKILL.md files
├── docs/                            # Docs site (Vite + React + Tailwind SPA)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── public/
│   └── src/
├── packages/
│   └── cli/                         # @archznn/crewloop-cli (TypeScript)
│       ├── src/
│       │   ├── cli.ts               # Entry point and command parser
│       │   ├── agents.ts            # Supported agent definitions
│       │   ├── installer.ts         # Skill copy/install logic
│       │   ├── hooks.ts             # Agent hook configuration (Strategy pattern)
│       │   ├── resolver.ts          # Path resolution utilities
│       │   └── tests/
│       ├── bin/
│       ├── dist/
│       ├── AGENTS.md                # CLI-specific agent guide
│       ├── README.md
│       ├── package.json
│       └── tsconfig.json
├── references/
│   ├── conventions.md               # Conventional Commits, navigation menus, AFK mode
│   ├── skill-contracts.yaml          # Machine-readable authoring contract for all skills
│   ├── skill-anatomy.md             # How to write a SKILL.md
│   └── workflow.md                  # Full team workflow reference
├── scripts/
│   ├── validate-skills.py           # Validates structure, links, Markdown, and transitions
│   ├── package-skill.py             # Packages a skill into a .skill archive
│   └── npm-publish-dry-run.sh       # Dry-run npm publish workflow
├── servers/
│   ├── dashboard/                   # Real-time skill dashboard (TypeScript/Node.js)
│   │   ├── src/
│   │   │   ├── server.ts            # HTTP + WebSocket server
│   │   │   ├── state.ts             # Session and skill state management
│   │   │   ├── presenter.ts         # Data formatting layer
│   │   │   ├── types.ts             # Shared TypeScript types
│   │   │   ├── config.ts            # Environment configuration
│   │   │   ├── adapters/            # Agent-specific event normalizers
│   │   │   ├── api/                 # REST endpoints
│   │   │   ├── filters/             # Event filtering logic
│   │   │   └── skills/              # Skill inference heuristics
│   │   ├── ui/                      # Browser UI (served by dashboard)
│   │   ├── bin/                     # crewloop-shim binary
│   │   ├── config-examples/         # Sample hook configs per agent
│   │   ├── dist/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
├── skills/                          # All 7 skill directories
│   ├── crewloop-plan/
│   │   ├── SKILL.md
│   │   └── references/              # Local references folder
│   ├── crewloop-design/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── crewloop-code/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── crewloop-review/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── crewloop-ship/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── crewloop-docs/
│   │   ├── SKILL.md
│   │   └── references/
│   └── crewloop-code-review/
│       ├── SKILL.md
│       └── references/
├── specs/
│   ├── features/                     # The real work — one spec = one task (per domain)
│   ├── changes/                      # RFCs only — proposals under discussion
│   ├── memory/                       # Project state, chat-logs, decisions, incidents
│   ├── shared/                       # Reusable references (glossary, stack, ADRs)
│   ├── templates/                    # Feature-spec / RFC / ADR / task-prompt blueprints
│   └── archive/                      # Dead or legacy specs (indexed in README.md)
└── tests/
    └── README.md                    # Manual testing guidance
```

---

## Main Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Agent onboarding guide — start here |
| `README.md` | Public-facing project documentation |
| `references/conventions.md` | Conventional Commits format, auto-routing rules, AFK mode |
| `references/workflow.md` | Canonical skill routing flow and role responsibilities |
| `references/skill-anatomy.md` | Guide for writing new SKILL.md files |
| `assets/templates/skill-template.md` | Template to copy when creating a new skill |
| `scripts/validate-skills.py` | Validates SKILL.md structure and YAML frontmatter |
| `scripts/package-skill.py` | Packages a single skill into a `.skill` archive |
| `specs/memory/project-state.md` | Always-read project status (modules, decisions, blockers, next task) |
| `specs/shared/adrs/` | Architectural Decision Records (ADR-001..010) |
| `packages/cli/AGENTS.md` | Agent guide specific to the CLI package |
| `servers/dashboard/README.md` | Dashboard setup, API, and event schema |
| `packages/cli/README.md` | CLI install and usage reference |

---

## Technology and Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Skills | Markdown | Role-based workflow instructions for AI agents |
| CLI | TypeScript (Node.js) | Installs skills and configures agent hooks |
| Dashboard | TypeScript (Node.js + WebSocket) | Real-time skill and tool activity visualization |
| Docs site | Vite + React + Tailwind | GitHub Pages documentation site (SPA) |
| Scripts | Python + Bash | Skill validation, packaging, and publish automation |

**Architecture:** Modular by role. Each skill is an autonomous, self-describing Markdown document. The CLI and dashboard are independent packages in an npm workspace. Skills do not import or depend on each other.

**Binaries exposed:**
- `crewloop` — the CLI binary (`packages/cli/bin/crewloop.js`)
- `crewloop-shim` — the dashboard event forwarder (`servers/dashboard/bin/crewloop-shim.js`)

---

## The Skills

### Core Skills — own the mandatory delivery loop (CrewLoop Design is conditional)

| Skill | Role | Never does |
|-------|------|-----------|
| **crewloop:plan** | Context discovery, requirement gathering, spec creation, architecture design, routing | Writes implementation code, runs git |
| **crewloop:design** | UI/UX aesthetic direction, design specs | Writes implementation code, runs git |
| **crewloop:code** | Implementation, tests, BUILD | Git operations, code review, architecture |
| **crewloop:review** | Code review, quality gate, security scan | Writes code, runs git operations |
| **crewloop:ship** | Git commit, branch creation, push, PR | Reviews code, writes implementation |

### Supporting Skills — invoked by the relevant core skill as needed

| Skill | Invoked when |
|-------|-------------|
| **crewloop:docs** | Pure documentation tasks without code changes |
| **crewloop:code-review** | Whole-codebase audits and code-debt analysis, independent of any pending diff |

Supporting skills report findings back to the skill that invoked them. `crewloop:docs` returns to `crewloop:plan`. `crewloop:code-review` returns to its invoker (default `crewloop:plan`) and never reviews pending diffs — that is `crewloop:review`'s job. Supporting skills do not write implementation code or run git operations.

---

## Mandatory Development Flow (Auto-Routing)

Skills hand off automatically to the next skill per the transition contract. The user can
interrupt the flow with explicit commands. `crewloop:plan` is the entry point for new tasks
and the AFK fallback router:

```
User request → CrewLoop Plan → CrewLoop Design (if UI) → CrewLoop Code ⇄ CrewLoop Review → CrewLoop Ship → done
                                        └──── no UI ────────┘
```

`crewloop:docs` is invoked on demand and returns to `crewloop:plan` when done.

Rules — no exceptions:

1. **`crewloop:plan` is the first mandatory delivery phase.** Every session starts here; it never routes directly to `crewloop:design` or `crewloop:code` without first creating a spec.
2. **`crewloop:plan` creates a single-file feature spec** in `specs/features/<domain>/spec-NN-name.md` for every change — including 1-line bug fixes.
3. **CrewLoop Design acts before CrewLoop Code** whenever the change involves a visual interface.
4. **CrewLoop Code never does git operations** and never reviews its own code.
5. **CrewLoop Review never writes code** and never runs git operations.
6. **CrewLoop Ship is the only skill** that commits, creates branches, pushes, and opens PRs.
7. **Skills auto-route based on the transition contract.** Present navigation options only when the user interrupts with `stop`, `pause`, `volta`, `voltar`, or `re-analyze`.
8. **Sub-skills assist core skills** — supporting skills return to their invoker; `crewloop:docs` returns to `crewloop:plan` by default.
9. **Direct handoffs between phases.** Every agent ends by routing to the next skill per the transition contract; `crewloop:plan` is the entry point and AFK fallback router.
10. **Bundle Lock-In:** You are strictly forbidden from loading, referencing, or switching to any skills outside the skills registered in `references/skill-contracts.yaml`. You must strictly execute the CrewLoop workflow steps, and never perform actions that skip the `crewloop:plan` gatekeeper.
11. **Bug-Fixing Pipeline:** Bug fixes enter via `crewloop:plan` like any other task and follow the standard chain: `crewloop:plan` → `crewloop:code` → `crewloop:review` → `crewloop:ship` (commit/ship and close the feature spec: mark completed + chat-log + project-state update).


---

## AFK Mode

AFK mode allows the workflow to run automatically without waiting for user navigation confirmations between skills.

**Activation:** The user says `AFK`, `AFK mode`, `going AFK`, or `MEMORY.md` in the project root contains `afk: true`.

**Behavior when active:**
- Skills skip the interactive navigation prompts.
- Each response must start with the skill's role prefix on its own line (e.g., `> 🔧 **CrewLoop Code**`, `> 🔍 **CrewLoop Review**`).
- Every skill returns control to `crewloop:plan` automatically at the end of its turn.
- `crewloop:plan` evaluates state and loads the next appropriate skill per the transition contract.
- The standard phase order still applies: `crewloop:plan` → `crewloop:design` (if UI) → `crewloop:code` → `crewloop:review` → `crewloop:ship`.

**Deactivation:** AFK mode ends when Shipper completes and returns control to `crewloop:plan`.

---

## Specs Structure

Every change — no exceptions — gets a feature spec before any code or documentation is written.

See `specs/README.md` for the folder map (who writes/reads `features/`, `changes/`, `memory/`, `shared/`, `templates/`, `archive/` and when) and `references/conventions.md` §Spec Folder Structure for the canonical tree and rules.

In short: **one spec = one task**, written as a single file in `specs/features/<domain>/spec-NN-name.md` (Objective, Context, Requirements, Behavior/Flow, Constraints, Edge Cases, Acceptance Criteria, Done When). Completed feature specs **stay** in `features/` as the source of truth. Architecture changes start as RFCs in `specs/changes/`; approved RFCs become ADRs in `specs/shared/adrs/`, rejected ones go to `specs/archive/` with a reason in its README.

**Critical:** `specs/memory/project-state.md` is read at the start of every session and updated at session end. Never place spec files directly in `specs/` — always in a subfolder above.

---

## Build, Test, and Deploy

There is no top-level build. Run all commands from their respective package directories.

| Task | Command | Directory |
|------|---------|-----------|
| Validate SKILL.md files | `python scripts/validate-skills.py` | repo root |
| Build CLI | `npm run build` | `packages/cli/` |
| Test CLI | `npm test` | `packages/cli/` |
| Build dashboard | `npm run build` | `servers/dashboard/` |
| Test dashboard | `npm test` | `servers/dashboard/` |
| Run dashboard (dev) | `npm run dev` | `servers/dashboard/` |
| Start dashboard (prod) | `npm start` | `servers/dashboard/` |
| Install skills globally | `crewloop install` | anywhere |
| Dry-run npm publish | `bash scripts/npm-publish-dry-run.sh` | repo root |

Dashboard runs on `http://127.0.0.1:7890` by default. Port and host are configurable via `CREWLOOP_DASHBOARD_PORT` and `CREWLOOP_DASHBOARD_HOST`.

**Deploy:** Publishing is automated via GitHub Actions on `v*.*.*` semantic version tags. `@archznn/crewloop-skills` is published first, then `@archznn/crewloop-cli`.

---

## Security

- **Never store secrets** (API keys, tokens, passwords, private keys) in any repository file.
- **Reviewer must scan every change for:**
  - Strings containing `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE_KEY`
  - `.env` files committed to the repository
  - Build or dependency directories (`node_modules/`, `dist/`, `.next/`, `build/`)
  - AI artifacts: placeholder comments, `TODO` without an issue reference, `console.log` left in code, empty `catch` blocks, "Written by AI" comments
- **Shipper must:**
  - Respect `.gitignore` at all times
  - Never commit secrets, `.env` files, or build directories
- **Dashboard:** binds to `127.0.0.1` by default; strips dangerous keys (`command`, `content`, `token`, `api_key`) before storage and broadcast.

---

## How to Contribute

1. Start with **CrewLoop Plan** — gather context, produce a structured brief, and write a spec.
2. **CrewLoop Plan** creates or updates a single-file feature spec in `specs/features/<domain>/spec-NN-name.md` before any code is written, then recommends CrewLoop Design (UI) or CrewLoop Code.
3. If the change involves a visual interface, **CrewLoop Design** creates a design spec before CrewLoop Code starts, then recommends CrewLoop Code.
4. **CrewLoop Code** implements the spec, runs verification, and routes to CrewLoop Review automatically.
5. **CrewLoop Review** inspects the diff for spec compliance, quality, tests, security, and AI artifacts; PASS routes to CrewLoop Ship, FAIL routes to CrewLoop Code.
6. **CrewLoop Ship** commits on a branch following the Conventional Commits format, pushes, opens a PR, then ends the flow on `done`.
7. Run `python scripts/validate-skills.py` after adding or editing any `SKILL.md`.
8. Update `README.md` and `AGENTS.md` if the repository structure or team rules change.
9. Place new skills in `skills/crewloop-<slug>/SKILL.md` using `assets/templates/skill-template.md`. The frontmatter `name` is `crewloop:<slug>`; the directory is `crewloop-<slug>`.
10. Never perform git operations manually — always use the Shipper skill.

**Commit format:** `<type>(<scope>): <description>` — imperative mood, max 72 characters, no trailing period.  
**Branch format:** `<type>/<short-description>` in kebab-case.  
**Allowed types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

---

## Notes for Agents

- **Documentation-first.** Do not execute build commands, install dependencies, or create runtime configuration files unless an explicit spec in `specs/features/` requires it.
- **When editing a SKILL.md:** preserve the YAML frontmatter (`--- name: ... description: ... ---`), auto-routing rules, and the clear separation of responsibilities between skills.
- **New skills:** copy `assets/templates/skill-template.md` → `skills/<skill-name>/SKILL.md`. Shared conventions belong in `references/`. Skill-specific references belong in `skills/<skill-name>/references/`.
- **Specs:** never write spec files directly in `specs/` — always nested inside `specs/features/<domain>/` (feature specs) or `specs/changes/` (RFCs).
- **Git:** never perform git operations directly — always use the Shipper skill.
- **Language:** project documentation is in English. Keep technical terms in English.
- **Specs folder is the source of truth.** If a spec exists for the current task, follow it. If it conflicts with this file, the spec takes precedence.
