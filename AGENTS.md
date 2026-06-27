# AGENTS.md

> Guide for AI agents working in this repository. Read this file before making any changes.

---

## Project Overview

**CrewLoop** is a team of AI skills that operate together as a complete, role-separated software development workflow. Each skill represents a specialist role — orchestrator, architect, designer, engineer, reviewer, shipper, and seven supporting roles — and is distributed as an independent `SKILL.md` file that any compatible AI agent can load and follow.

**Why it exists:** Most AI agents operate without a structured process — they jump straight to implementation, skip architecture, and skip review. CrewLoop enforces a mandatory flow where every change goes through context gathering, spec creation, design (if there is UI), implementation, code review, and git operations, each handled by a dedicated skill.

**How it is consumed:** Install the CLI globally and run `crewloop install`. The CLI copies all skills to the agent's skill directory (e.g., `~/.agents/skills/`) and configures hook files for supported agents so that the real-time dashboard receives tool-use events. Supported agents: Kimi Code, Claude, Codex, AGY.

**What this repository contains:**
- **Skills** — 13 Markdown skill files, each describing a specialist role
- **CLI** (`packages/cli/`) — TypeScript tool that installs skills and configures agent hooks
- **Dashboard** (`servers/dashboard/`) — real-time WebSocket server + browser UI that shows which skill is active and a live event timeline
- **Obsidian MCP** (`servers/obsidian-mcp/`) — Python MCP server that bridges skills with an Obsidian vault
- **Docs site** (`docs/`) — Docusaurus site deployed to GitHub Pages
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
├── docs/                            # Docusaurus documentation site
│   ├── docusaurus.config.js
│   ├── sidebars.js
│   ├── docs/
│   ├── src/
│   └── static/
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
│   ├── skill-anatomy.md             # How to write a SKILL.md
│   └── workflow.md                  # Full team workflow reference
├── scripts/
│   ├── validate-skills.py           # Validates SKILL.md structure and frontmatter
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
│   └── obsidian-mcp/                # Obsidian MCP server (Python)
│       └── src/
│           └── obsidian_mcp/        # Python package
├── skills/                          # All 13 skill directories
│   ├── orchestrator/SKILL.md
│   ├── architect/SKILL.md
│   ├── designer/SKILL.md
│   ├── engineer/SKILL.md
│   ├── reviewer/SKILL.md
│   ├── shipper/SKILL.md
│   ├── accessibility-auditor/SKILL.md
│   ├── docs-writer/SKILL.md
│   ├── maintainer/SKILL.md
│   ├── product-manager/SKILL.md
│   ├── researcher/SKILL.md
│   ├── security-guard/SKILL.md
│   └── tester/SKILL.md
├── specs/
│   ├── changes/                     # Active in-progress specs
│   ├── archive/                     # Completed specs (date-prefixed)
│   ├── living/                      # Merged source of truth per subsystem
│   └── decisions/                   # Architectural Decision Records (ADRs)
└── tests/
    └── README.md                    # Manual testing guidance
```

---

## Main Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Agent onboarding guide — start here |
| `README.md` | Public-facing project documentation |
| `references/conventions.md` | Conventional Commits format, navigation menu rules, AFK mode |
| `references/workflow.md` | Canonical skill routing flow and role responsibilities |
| `references/skill-anatomy.md` | Guide for writing new SKILL.md files |
| `assets/templates/skill-template.md` | Template to copy when creating a new skill |
| `scripts/validate-skills.py` | Validates SKILL.md structure and YAML frontmatter |
| `scripts/package-skill.py` | Packages a single skill into a `.skill` archive |
| `specs/decisions/001-dashboard-hybrid-architecture.md` | ADR for the dashboard's hybrid architecture |
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
| Obsidian MCP | Python | MCP server bridging skills with an Obsidian vault |
| Docs site | Docusaurus | GitHub Pages documentation site |
| Scripts | Python + Bash | Skill validation, packaging, and publish automation |

**Architecture:** Modular by role. Each skill is an autonomous, self-describing Markdown document. The CLI and dashboard are independent packages in an npm workspace. Skills do not import or depend on each other.

**Binaries exposed:**
- `crewloop` — the CLI binary (`packages/cli/bin/crewloop.js`)
- `crewloop-shim` — the dashboard event forwarder (`servers/dashboard/bin/crewloop-shim.js`)

---

## The 13 Skills

### Core Skills — mandatory in every task flow

| Skill | Role | Never does |
|-------|------|-----------|
| **orchestrator** | Context discovery, requirement gathering, routing | Writes code, designs systems, creates files |
| **architect** | Spec creation, architecture design, contracts | Writes implementation code, runs git |
| **designer** | UI/UX aesthetic direction, design specs | Writes implementation code, runs git |
| **engineer** | Implementation, tests, BUILD | Git operations, code review, architecture |
| **reviewer** | Code review, quality gate, security scan | Writes code, runs git operations |
| **shipper** | Git commit, branch creation, push, PR | Reviews code, writes implementation |

### Supporting Skills — invoked by Orchestrator or Reviewer as needed

| Skill | Invoked when |
|-------|-------------|
| **accessibility-auditor** | UI changes with accessibility scope (WCAG, screen readers, keyboard nav) |
| **docs-writer** | Pure documentation tasks without code changes |
| **maintainer** | Bug triage, technical debt, dependency updates, production incidents |
| **product-manager** | Prioritization, roadmap, user stories, success metrics |
| **researcher** | Technology evaluation, library comparison, proof-of-concept |
| **security-guard** | Security review, secret scanning, auth, authorization, PII |
| **tester** | Test strategy, QA, coverage analysis, test plans |

Supporting skills report their findings back to the skill that invoked them. They do not write code or run git operations.

---

## Mandatory Development Flow

```
Orchestrator → Architect → (Designer, if UI) → Engineer → Reviewer → Shipper → Orchestrator
```

Rules — no exceptions:

1. **Orchestrator always routes to Architect first.** Never directly to Designer or Engineer.
2. **Architect creates a spec** in `specs/changes/NNN-name/` for every change — including 1-line bug fixes.
3. **Designer acts before Engineer** whenever the change involves a visual interface.
4. **Engineer never does git operations** and never reviews its own code.
5. **Reviewer never writes code** and never runs git operations.
6. **Shipper is the only skill** that commits, creates branches, pushes, and opens PRs.
7. **Navigation menus are letter-based** (`[A] Architect`, `[D] Designer`, `[E] Engineer`, `[R] Reviewer`, `[S] Shipper`, `[O] Orchestrator`) and appear at the end of each skill response. Skills must wait for user confirmation before routing.
8. **Security-guard and accessibility-auditor** are optional specialists. They are invoked by Orchestrator or Reviewer, report findings, and do not advance the flow independently.
9. **Tester cycles with Engineer** — `Engineer → Tester → Engineer` — before routing to Reviewer.
10. **All roads return to Orchestrator.** After Shipper completes, the flow loops back.

---

## AFK Mode

AFK mode allows the workflow to run automatically without waiting for user navigation confirmations between skills.

**Activation:** The user says `AFK`, `modo AFK`, `vou ficar AFK`, or `MEMORY.md` in the project root contains `afk: true`.

**Behavior when active:**
- Skills skip the letter-based navigation menu at the end of their response.
- Each response must start with the skill's role prefix on its own line (e.g., `[ENGINEER BUILDING]`, `[REVIEWER INSPECTING]`).
- Each skill loads the next skill automatically via the Skill tool without waiting for user input.
- The standard routing rules still apply: Orchestrator → Architect → (Designer) → Engineer → Reviewer → Shipper.

**Deactivation:** AFK mode ends when Shipper completes and returns control to Orchestrator.

---

## Specs Structure

Every change — no exceptions — gets a spec before any code or documentation is written.

```
specs/
├── changes/                         # Active in-progress specs
│   └── NNN-name/                    # One folder per change
│       ├── .spec.yaml               # Status, dates, author, affected files
│       ├── proposal.md              # WHY — motivation, scope, constraints
│       ├── specs/                   # WHAT — delta vs. current system
│       ├── design.md                # HOW — models, APIs, data flows, contracts
│       └── tasks.md                 # Ordered implementation checklist
├── archive/                         # Completed specs (prefixed YYYY-MM-DD-NNN-name on archival)
├── living/                          # Merged source of truth per subsystem
└── decisions/                       # Architectural Decision Records (ADRs)
```

| Change size | Required spec files |
|------------|---------------------|
| Bug fix / tweak (< 10 lines) | `.spec.yaml` + `tasks.md` |
| Feature / component | Full: `.spec.yaml` + `proposal.md` + `specs/` + `design.md` + `tasks.md` |
| Multi-component / architectural | Full spec + ADR in `decisions/` |

**Critical:** Every spec file must live inside `specs/changes/NNN-name/`. Never place spec files directly in `specs/`.

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

1. Start with **Orchestrator** — gather context, produce a structured brief.
2. **Architect** creates or updates a spec in `specs/changes/NNN-name/` before any code is written.
3. If the change involves a visual interface, **Designer** creates a design spec before Engineer starts.
4. **Engineer** implements the spec, then routes to Tester if test coverage is involved.
5. **Reviewer** inspects the diff for spec compliance, quality, tests, security, and AI artifacts.
6. **Shipper** commits on a branch following the Conventional Commits format, pushes, and opens a PR.
7. Run `python scripts/validate-skills.py` after adding or editing any `SKILL.md`.
8. Update `README.md` and `AGENTS.md` if the repository structure or team rules change.
9. Place new skills in `skills/<skill-name>/SKILL.md` using `assets/templates/skill-template.md`.
10. Never perform git operations manually — always use the Shipper skill.

**Commit format:** `<type>(<scope>): <description>` — imperative mood, max 72 characters, no trailing period.  
**Branch format:** `<type>/<short-description>` in kebab-case.  
**Allowed types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

---

## Notes for Agents

- **Documentation-first.** Do not execute build commands, install dependencies, or create runtime configuration files unless an explicit spec in `specs/changes/` requires it.
- **When editing a SKILL.md:** preserve the YAML frontmatter (`--- name: ... description: ... ---`), letter-based navigation rules, and the clear separation of responsibilities between skills.
- **New skills:** copy `assets/templates/skill-template.md` → `skills/<skill-name>/SKILL.md`. Shared conventions belong in `references/`. Skill-specific references belong in `skills/<skill-name>/references/`.
- **Specs:** never write spec files directly in `specs/` — always nested inside `specs/changes/NNN-name/`.
- **Git:** never perform git operations directly — always use the Shipper skill.
- **Language:** project documentation is in English. Keep technical terms in English.
- **Specs folder is the source of truth.** If a spec exists for the current task, follow it. If it conflicts with this file, the spec takes precedence.
