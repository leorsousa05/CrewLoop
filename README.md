# CrewLoop

![CrewLoop hero banner](assets/images/crewloop-hero.png)

[![NPM version](https://img.shields.io/npm/v/@archznn/crewloop-skills)](https://www.npmjs.com/package/@archznn/crewloop-skills)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![Tests](https://github.com/leorsousa05/CrewLoop/actions/workflows/validate.yml/badge.svg)](https://github.com/leorsousa05/CrewLoop/actions/workflows/validate.yml)
[![Docs](https://img.shields.io/github/deployments/leorsousa05/CrewLoop/github-pages?label=docs&logo=github)](https://leorsousa05.github.io/CrewLoop/)

CrewLoop is a documentation-first framework of role-based AI skills. Each skill is a self-contained `SKILL.md` instruction set that agents load and follow, enforcing a structured workflow across discovery, architecture, design, implementation, review, and shipping.

## Highlights

- **Process-driven workflow:** Orchestrator, Architect, Designer, Engineer, Reviewer, Shipper, and nine supporting roles each own one phase and never invade another's territory.
- **Mandatory specs:** Every change, from a one-line fix to a full feature, gets a lightweight spec in `specs/changes/` before implementation starts.
- **Design before code:** When there is UI, the Designer defines the aesthetic direction before the Engineer writes markup or styles.
- **Docs by docs-writer:** READMEs, module docs, and changelogs are owned by the docs-writer skill so the engineer can focus on code and tests.
- **Quality gate:** The Reviewer inspects every diff for spec compliance, security, performance, and AI artifacts before anything reaches the repository.
- **Conventional Commits:** The Shipper generates commit messages, branches, archives specs, and opens PRs following the Conventional Commits standard.

## Quick Start

Install the CLI globally and load the full crew:

```bash
npm install -g @archznn/crewloop-cli
crewloop install
```

Install only the skills you need:

```bash
crewloop install --skill architect --skill engineer
```

Install to a custom directory or for another supported agent:

```bash
crewloop install --target /path/to/your/skills/dir
crewloop install --agent claude
```

Validate that all skills are well-formed:

```bash
python scripts/validate-skills.py
```

Each skill is automatically detected and activated according to the conversation context.

## CLI Reference & Options

The `crewloop` CLI provides commands to manage skills and integrate them with your AI coding agents.

### Commands

| Command | Description |
| :--- | :--- |
| `crewloop install` | Installs the CrewLoop skills to your local environment. |
| `crewloop list` | Lists all installed skills and active hooks. |
| `crewloop dashboard` | Launches the real-time WebSocket dashboard. |

### Global Flags for `crewloop install`

| Flag | Description |
| :--- | :--- |
| `--symlink` | Symbolically link skills instead of copying them (ideal for development). |
| `--force` | Overwrite existing skill configurations or hooks without asking. |
| `--dry-run` | Output the installation steps without modifying any files. |
| `--agent <name>` | Configure hooks for a specific agent (e.g., `kimi`, `claude`, `codex`, `agy`). |
| `--target <path>` | Specify a custom destination path for the skills. |
| `--skill <name>` | Install only a specific skill (can be specified multiple times). |

## Real-time Activity Dashboard

The dashboard provides a real-time WebSocket visualization of active skills, tool-use events, and execution logs.

![Dashboard overview](assets/screenshots/dashboard-overview.png)

By default, the dashboard binds to `http://127.0.0.1:7890`. You can change this port by setting the `CREWLOOP_DASHBOARD_PORT` environment variable.

### Running the Dashboard

You can start the dashboard using the CLI:
```bash
crewloop dashboard
```

Alternatively, you can run it from the source:
```bash
cd servers/dashboard
npm install
npm run dev
```

### Keyboard Shortcuts
- **`Cmd/Ctrl + K`**: Opens the command palette to search events, switch sessions, or manage active skills.

## Supported Agents & Hooks

CrewLoop supports native shimming/hooking for the following AI agents:
- **Kimi Code** (`kimi`)
- **Claude** (`claude`)
- **Codex** (`codex`)
- **AGY** (`agy`)

During `crewloop install`, the installer modifies the configuration or custom scripts of the selected agent. This shims their execution, allowing tool execution events (such as read/write file, run command, etc.) to be forwarded to the local dashboard WebSocket.

## Meet the Crew

CrewLoop ships 18 specialist skills. The core crew owns the main delivery loop; the supporting crew jumps in when the context demands it.

### Core Crew

| Skill | Phase | Responsibility |
|-------|-------|----------------|
| <span style="background:#01579B;color:#fff;padding:2px 8px;border-radius:9999px;">Orchestrator</span> | Discovery | Context gathering, requirement clarification, and routing |
| <span style="background:#E65100;color:#fff;padding:2px 8px;border-radius:9999px;">Architect</span> | Specs | Spec creation, architecture design, and contracts |
| <span style="background:#6A1B9A;color:#fff;padding:2px 8px;border-radius:9999px;">Designer</span> | Design | UI/UX aesthetic direction and design specs |
| <span style="background:#1B5E20;color:#fff;padding:2px 8px;border-radius:9999px;">Engineer</span> | Build | Implementation, tests, and verification |
| <span style="background:#B71C1C;color:#fff;padding:2px 8px;border-radius:9999px;">Reviewer</span> | Review | Code review, quality gate, and security scan |
| <span style="background:#00695C;color:#fff;padding:2px 8px;border-radius:9999px;">Shipper</span> | Ship | Git commit, branch creation, push, and PR |

### Supporting Crew

| Skill | Phase | Responsibility |
|-------|-------|----------------|
| [`project-brainstorm`](skills/project-brainstorm/SKILL.md) | Brainstorm | Discovery for new or ambiguous project ideas |
| [`long-term-manager`](skills/long-term-manager/SKILL.md) | Tracking | Durable tracking for projects that span multiple sessions |
| [`docs-writer`](skills/docs-writer/SKILL.md) | Docs | Documentation, READMEs, and changelogs |
| [`tester`](skills/tester/SKILL.md) | QA | Test strategy, coverage analysis, and test plans |
| [`product-manager`](skills/product-manager/SKILL.md) | Product | Prioritization, roadmap, and success metrics |
| [`maintainer`](skills/maintainer/SKILL.md) | Upkeep | Bug triage, technical debt, and incidents |
| [`researcher`](skills/researcher/SKILL.md) | Research | Technology evaluation and proof-of-concepts |
| [`security-guard`](skills/security-guard/SKILL.md) | Security Review | Security review, secret scanning, and auth |
| [`accessibility-auditor`](skills/accessibility-auditor/SKILL.md) | Accessibility Review | WCAG, screen reader, and keyboard navigation review |

### Skills in Action

![Skill active in agent](assets/screenshots/skill-active.png)

## Workflow (Hub-and-Spoke)

All execution skills return control to the Orchestrator, which manages task state and handles routing decisions.

```mermaid
flowchart TD
    O["Orchestrator\nCentral Hub"] <--> A["Architect\nSpecs & Architecture"]
    O <--> D["Designer\nUI/UX Direction"]
    O <--> E["Engineer\nImplementation"]
    O <--> R["Reviewer\nQuality Gate"]
    O <--> S["Shipper\nGit & PR"]
    O <--> PB["Project-Brainstorm\nDiscovery"]
    O <--> LTM["Long-Term Manager\nMulti-Session Tracking"]
    O <--> W["Docs-Writer\nDocumentation"]
    O <--> PM["Product-Manager\nPrioritization"]
    O <--> RS["Researcher\nTechnology Evaluation"]
    O <--> MN["Maintainer\nIncident & Debt"]
    O <--> T["Tester\nQA Strategy"]

    A -.-> SD["Schema-Designer\nAPI & DB Schemas"]
    SD -.-> A
    D -.-> FA["Frontend-Architect\nComponent Spec"]
    FA -.-> D
    S -.-> DO["DevOps-Specialist\nCI/CD & Docker"]
    DO -.-> S

    SG["Security-Guard\nSecurity Review"] -.-> R
    AA["Accessibility-Auditor\nAccessibility Review"] -.-> R
    R -.-> SG
    R -.-> AA
```

**Flow rules:**

> [!IMPORTANT]
> **Core Routing Rule:** Under the star topology, no execution skill is allowed to hand off directly to another execution skill. All roads return control to the Orchestrator.

1. **Orchestrator is the central hub** — every skill hands control back to Orchestrator at the end of its turn.
2. **Orchestrator always routes to Architect first** — to create or update specifications.
3. **Architect is the design gatekeeper** — once the spec is created, control returns to Orchestrator, which routes to Designer (for UI) or Engineer (for code).
4. **Designer acts before Engineer** — when there is UI, the Designer creates the visual specification before the Engineer implements.
5. **Engineer never does git, review, or docs** — it implements code and tests, then returns to Orchestrator.
6. **Reviewer is the quality gate** — no code reaches the repository without review.
7. **Shipper is the only skill that touches git** — commit, branch, push, and PR.
8. **Sub-skills assist core skills** — `project-brainstorm` helps `orchestrator`; `schema-designer` helps `architect`; `frontend-architect` helps `designer`; and `devops-specialist` helps `shipper`.
9. **Specs are archived** — the `specs/changes/` folder is moved to `specs/archive/` on commit.
10. **Bug-fixing Pipeline** — Bug triaging is handled by the Maintainer, who yields control to the Orchestrator. The Orchestrator routes to the Architect to create a lightweight specification (`.spec.yaml` + `tasks.md`), then to the Engineer for implementation and testing, to the Reviewer for verification, and to the Shipper to commit/ship and archive the spec.

> [!NOTE]
> **Standard Developer Cycle Example:**
> `Orchestrator` (Discovery) -> `Architect` (Spec creation) -> `Orchestrator` (Briefing) -> `Engineer` (Build & Tests) -> `Orchestrator` (Handoff) -> `Reviewer` (Quality gate check) -> `Orchestrator` (Approval) -> `Shipper` (Git commit & PR) -> `Orchestrator` (Complete).


## Repository Layout

```text
crewloop/
├── skills/                # Role-based SKILL.md instructions
├── packages/cli/          # npm-published CLI installer
├── servers/dashboard/     # Real-time WebSocket dashboard
├── docs/                  # Docusaurus documentation site
├── references/            # Shared conventions and workflow reference
├── scripts/               # Validation and packaging helpers
└── specs/                 # Active, archived, and living specs
```

## Adding a New Skill

1. Copy [`assets/templates/skill-template.md`](assets/templates/skill-template.md) to `skills/<skill-name>/SKILL.md`.
2. Fill in the YAML frontmatter and role instructions.
3. Add the skill to the README tables if it is user-facing.
4. Run `python scripts/validate-skills.py`.
5. Open a PR; the Reviewer validates structure and the Shipper archives the spec.

## Releasing

Versions are published automatically from `main`:

1. The Shipper bumps the version in `package.json` (and workspace manifests) following semver.
2. Merging to `main` triggers `.github/workflows/release-tag.yml`, which creates a `vX.Y.Z` tag.
3. `.github/workflows/publish-npm.yml` publishes `@archznn/crewloop-skills` to npm.

Manual releases are not required.

## Contributing

Edit the files in `skills/` and `references/`. Keep each `SKILL.md` concise and use reference files for shared detail. Run `python scripts/validate-skills.py` before opening a PR. For the full workflow, see [`references/workflow.md`](references/workflow.md).

## License

[MIT](LICENSE.md)
