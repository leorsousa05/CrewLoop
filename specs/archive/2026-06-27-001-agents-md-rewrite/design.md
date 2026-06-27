# Design — AGENTS.md Rewrite

## Target Files

```
/home/arch/codes/crewloop/
├── AGENTS.md                        ← REWRITE (root agent guide)
└── packages/
    └── cli/
        └── AGENTS.md                ← REWRITE (CLI-specific agent guide)
```

---

## Root `AGENTS.md` — Required Sections & Content Contract

The file must follow this section order exactly:

### 1. Title + Tagline
```
# AGENTS.md
> Guide for AI agents working in this repository. Read this file before making any changes.
```

### 2. Project Overview (NEW — currently missing)
- What CrewLoop is: a team of AI skills that operate as a complete software development flow
- Why it exists: to give AI agents a structured, role-separated workflow (orchestrator, architect, designer, engineer, reviewer, shipper) + supporting specialists
- How it is consumed: installed via `npm install -g @archznn/crewloop-skills` + `crewloop install`, copied to agent skill directories
- What the project output is: Markdown skill files + TypeScript CLI + real-time dashboard + Docusaurus docs site
- Key constraint: documentation-first, no runtime application to build or run

### 3. Repository Structure
Accurate ASCII directory tree reflecting current state:
- Root level files: AGENTS.md, README.md, package.json, .gitignore, .github/
- assets/templates/
- docs/ (Docusaurus site)
- packages/cli/ (TypeScript CLI)
- references/ (conventions.md, skill-anatomy.md, workflow.md)
- scripts/ (validate-skills.py, package-skill.py, npm-publish-dry-run.sh)
- servers/dashboard/ (real-time TypeScript dashboard)
- servers/obsidian-mcp/ (Python MCP server)
- skills/ (all 13 skill directories)
- specs/ (changes/, archive/, living/, decisions/)
- tests/

### 4. Main Files — Purpose Table
Table mapping each key file to its purpose (one line each). Must include all 13 SKILL.md files.

### 5. Technology and Architecture
- Project type: AI skill collection + tooling
- Languages: Markdown (skills/references), TypeScript (CLI + dashboard), Python (obsidian-mcp, scripts)
- Stack: no source application. CLI distributes skills. Dashboard tracks active skill state in real time. Docs site is Docusaurus.
- Architecture: modular by role. Skills are autonomous, self-describing documents.
- Runtime: `packages/cli/` (crewloop binary) + `servers/dashboard/` (crewloop-shim binary) + `servers/obsidian-mcp/`

### 6. The 13 Skills — Complete Table
Two sub-tables:

**Core Skills (6)** — mandatory in every task flow:
| Skill | Role | Never does |
|-------|------|-----------|
| orchestrator | Context discovery, requirement gathering, routing | Writes code, designs systems |
| architect | Specs, architecture, contracts | Writes implementation code |
| designer | UI/UX aesthetic direction, design specs | Writes implementation code |
| engineer | Implementation, tests, BUILD | Git ops, code review, architecture |
| reviewer | Code review, quality gate | Writes code, git ops |
| shipper | Git commit, branch, push, PR | Reviews code, implementation |

**Supporting Skills (7)** — invoked by orchestrator or reviewer as needed:
| Skill | Invoked when |
|-------|-------------|
| accessibility-auditor | UI changes with a11y scope |
| docs-writer | Pure documentation tasks |
| maintainer | Bug triage, technical debt, dependency updates |
| product-manager | Prioritization, roadmap, success metrics |
| researcher | Technology evaluation, library comparison |
| security-guard | Security review, secret scanning, auth |
| tester | Test strategy, QA, coverage analysis |

### 7. Mandatory Development Flow
```
Orchestrator → Architect → (Designer, if UI) → Engineer → Reviewer → Shipper → Orchestrator
```

Rules as a numbered list (not prose):
1. Orchestrator ALWAYS routes to Architect first — never directly to Designer or Engineer
2. Architect creates a spec in `specs/changes/NNN-name/` for EVERY change, including 1-line fixes
3. Designer acts before Engineer when there is a visual interface
4. Engineer never does git ops or reviews own code
5. Reviewer never writes code or runs git ops
6. Shipper is the only skill that commits, branches, pushes, and creates PRs
7. At the end of each skill, show a letter-based navigation menu and wait for user input
8. Supporting skills (security-guard, accessibility-auditor) are invoked by Orchestrator or Reviewer; they report back but do not touch git

### 8. AFK Mode (NEW — currently missing)
- Activation: user says "AFK", "modo AFK", "vou ficar AFK", or MEMORY.md contains `afk: true`
- Behavior: skills skip the navigation menu and load the next skill automatically via the Skill tool
- Each response must start with the skill's role prefix (e.g., `[ENGINEER BUILDING]`)
- AFK mode ends when Shipper finishes and returns to Orchestrator
- MEMORY.md location: project root (if it exists)

### 9. Specs Structure
```
specs/
├── changes/    ← Active in-progress specs (NNN-name or YYYY-MM-DD-NNN-name)
├── archive/    ← Completed specs (date-prefixed on archival)
├── living/     ← Merged source of truth per subsystem
└── decisions/  ← Architectural Decision Records (ADRs)
```
Rules:
- Every spec lives in `specs/changes/NNN-name/` — never flat in `specs/`
- Minimum files per spec: `.spec.yaml` + `tasks.md` (for tweaks); full spec adds `proposal.md`, `specs/`, `design.md`
- Archive on commit; update `living/` to reflect current system state

### 10. Build, Test, and Deploy
Commands table:

| Task | Command | Directory |
|------|---------|-----------|
| Validate SKILL.md files | `python scripts/validate-skills.py` | repo root |
| Build CLI | `npm run build` | `packages/cli/` |
| Test CLI | `npm test` | `packages/cli/` |
| Build dashboard | `npm run build` | `servers/dashboard/` |
| Test dashboard | `npm test` | `servers/dashboard/` |
| Install skills globally | `crewloop install` | anywhere |
| Dry-run npm publish | `bash scripts/npm-publish-dry-run.sh` | repo root |

Note: There is no top-level build. Run workspace commands per package.

### 11. Security
- Do not store secrets, API keys, tokens, or passwords in any file
- Reviewer must scan for: `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE_KEY` strings; `.env` files; build dirs (`node_modules/`, `dist/`, `.next/`, `build/`)
- Reviewer must flag AI artifacts: placeholder comments, `TODO` without issue reference, `console.log`, empty `catch` blocks, "Written by AI" comments
- Shipper must respect `.gitignore` and never commit secrets or build directories

### 12. How to Contribute
Numbered list mirroring the mandatory flow:
1. Start with Orchestrator — gather context, create a brief
2. Architect creates or updates a spec in `specs/changes/NNN-name/`
3. If there is UI: Designer creates design spec before Engineer
4. Engineer implements, then routes to Reviewer
5. Reviewer approves or sends back to Engineer/Architect
6. Shipper commits, creates branch, pushes, opens PR
7. Run `python scripts/validate-skills.py` after any SKILL.md change
8. Update `README.md` and `AGENTS.md` if repo structure or team rules change

### 13. Notes for Agents (rules block)
- Documentation-first: do NOT execute build commands, install dependencies, or create runtime config unless an explicit spec requires it
- When editing SKILL.md: preserve YAML front matter, letter-based navigation rules, and role separation
- New skills: copy `assets/templates/skill-template.md` → `skills/<skill-name>/SKILL.md`; shared conventions go in `references/`; skill-specific references in `skills/<skill-name>/references/`
- Specs: never write spec files directly in `specs/` — always nested in `specs/changes/NNN-name/`
- Git: never perform git operations directly — always use the Shipper skill

---

## `packages/cli/AGENTS.md` — Required Sections & Content Contract

The current file is structurally sound. The rewrite must:
- Retain all existing sections (architecture, hook formats, matcher behavior, command string, how to add agents, legacy cleanup, testing, conventions)
- Add a missing **"What agents should NOT do here"** section (anti-patterns)
- Verify the AGY config path is current (`~/.gemini/config/hooks.json`) — per recent spec `2026-06-26-008-fix-agy-hook-integration`
- Add a **"Source files at a glance"** table mapping each `src/` file to its single responsibility
- Tone: technical and direct, same as current

### Source Files Table (to add)
| File | Responsibility |
|------|---------------|
| `src/cli.ts` | CLI entry point, command parsing |
| `src/agents.ts` | Supported agent definitions (config path, format, agent ID) |
| `src/installer.ts` | Skill copy logic — copies skills to agent's skill dir |
| `src/hooks.ts` | Hook configuration — writes/updates agent config files |
| `src/resolver.ts` | Path resolution utilities |
| `src/tests/` | Test suite — hooks, installer, agents |

### Anti-patterns Section (to add)
- Do not modify `src/hooks.ts` and `src/installer.ts` in the same PR unless the spec explicitly requires it
- Do not hardcode paths — use `src/resolver.ts`
- Do not remove a hook whose command does not contain `crewloop-shim`
- Do not use a glob `*` as the Kimi matcher (it is an invalid regex — use `.*`)
- Do not touch real agent config files in tests (use temp directories)

---

## Addressed Requirements

| Requirement | Addressed |
|------------|-----------|
| Full rewrite of root AGENTS.md | ✅ Section contract defined above |
| Full rewrite of packages/cli/AGENTS.md | ✅ Delta contract defined above |
| Project description for agent onboarding | ✅ Section 2 (Project Overview) |
| All 13 skills documented | ✅ Section 6 (two tables) |
| servers/, docs/, packages/cli/ in structure | ✅ Section 3 (Directory tree) |
| AFK mode documented | ✅ Section 8 |
| Build/test commands | ✅ Section 10 |
| No secrets or credentials | ✅ Section 11 + constraint |

## Deferred

- `servers/obsidian-mcp/` — mentioned in directory tree with a note; no detailed section (insufficient existing documentation to draw from)
- `docs/` Docusaurus internals — mentioned in structure, not detailed (separate concern)
