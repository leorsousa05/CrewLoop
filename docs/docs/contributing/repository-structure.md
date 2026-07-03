---
sidebar_position: 2
---

# Repository Structure

A guide to where everything lives and why.

```
crewloop/
├── AGENTS.md                        # AI agent onboarding guide
├── README.md                        # Public project documentation
├── package.json                     # npm workspace root (v0.7.0)
├── .github/workflows/               # CI/CD: npm publish, validation
├── assets/
│   └── templates/
│       └── skill-template.md        # Template for new SKILL.md files
├── docs/                            # This Docusaurus site
├── packages/
│   └── cli/                         # @archznn/crewloop-cli (TypeScript)
│       ├── src/
│       │   ├── cli.ts               # CLI entry point
│       │   ├── agents.ts            # Supported agent definitions
│       │   ├── installer.ts         # Skill copy logic
│       │   ├── hooks.ts             # Agent hook configuration
│       │   └── resolver.ts          # Path resolution utilities
│       └── AGENTS.md                # CLI-specific agent guide
├── references/
│   ├── conventions.md               # Conventional Commits, AFK mode, nav menus
│   ├── skill-anatomy.md             # How to write a SKILL.md
│   └── workflow.md                  # Talk routing flow
├── scripts/
│   ├── validate-skills.py           # Validates SKILL.md structure and frontmatter
│   ├── package-skill.py             # Packages a skill into a .skill archive
│   └── npm-publish-dry-run.sh       # Dry-run npm publish workflow
├── servers/
│   └── dashboard/                   # Real-time skill dashboard (TypeScript/Node.js)
│       ├── src/
│       ├── ui/
│       └── README.md
├── skills/                          # All 18 skill directories
│   ├── orchestrator/SKILL.md
│   ├── architect/SKILL.md
│   └── ... (18 total)
├── specs/
│   ├── changes/                     # Active in-progress specs
│   ├── archive/                     # Completed specs
│   ├── living/                      # Merged source of truth per subsystem
│   └── decisions/                   # Architectural Decision Records
└── tests/
    └── README.md
```

## Where to put things

| What | Where |
|------|-------|
| New skill | `skills/<skill-name>/SKILL.md` |
| Shared conventions | `references/` |
| Skill-specific references | `skills/<skill-name>/references/` |
| Active change spec | `specs/changes/NNN-name/` |
| Architectural decision | `specs/decisions/NNN-name.md` |
| CLI source changes | `packages/cli/src/` |
| Dashboard source changes | `servers/dashboard/src/` |
| Documentation pages | `docs/docs/` |

## Where NOT to put things

- Spec files directly in `specs/` — always nested in `specs/changes/NNN-name/`.
- Shared conventions inside a SKILL.md — use `references/`.
- `.env` files or secrets anywhere in the repository.
- `node_modules/`, `dist/`, or build output committed to git.
