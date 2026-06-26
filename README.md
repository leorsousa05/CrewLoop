# CrewLoop

An AI agent crew that runs the complete software development flow — from discovery to deploy — with clear roles, mandatory specs, and no skipped steps.

[![Docs](https://img.shields.io/github/deployments/leorsousa05/CrewLoop/github-pages?label=docs&logo=github)](https://leorsousa05.github.io/CrewLoop/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![Skills](https://img.shields.io/badge/skills-14-blueviolet)](#whats-in-the-box)
[![Validation](https://img.shields.io/badge/validate--skills-passing-brightgreen)](scripts/validate-skills.py)

📚 **Read the full documentation at [leorsousa05.github.io/CrewLoop](https://leorsousa05.github.io/CrewLoop/)**

## Highlights

- **Process-driven workflow:** Orchestrator, Architect, Designer, Engineer, Reviewer, Shipper, Docs-Writer, Tester, Product-Manager, Maintainer, Researcher, Security-Guard, and Accessibility-Auditor each own one phase and never invade another's territory.
- **Mandatory specs:** Every change, from a one-line bug fix to a full feature, gets a lightweight spec in `specs/` before implementation starts.
- **Design before code:** When there is a UI, the Designer defines the aesthetic direction before the Engineer writes a single line of HTML or CSS.
- **Docs by docs-writer:** READMEs, module docs, feature docs, and changelogs are owned by the docs-writer skill — the engineer focuses on code and tests.
- **Quality gate:** The Reviewer inspects every diff for spec compliance, security, performance, and AI artifacts before anything reaches the repository.
- **Conventional Commits:** The Shipper generates commit messages, branches, archives specs, and prepares PRs following the Conventional Commits standard.

## Quick Start

```bash
npm install -g @archznn/crewloop-cli
crewloop install
```

Install only the skills you need:

```bash
crewloop install --skill architect --skill engineer
```

Install to a custom directory or for another agent:

```bash
crewloop install --target /path/to/your/skills/dir
crewloop install --agent claude
```

Validate that all skills are well-formed:

```bash
python scripts/validate-skills.py
```

Each skill will be automatically detected and activated according to the conversation context.

## What's in the Box?

### Core Crew

| Skill | Emoji | Phase | Learn more |
|-------|-------|-------|------------|
| [`orchestrator`](skills/orchestrator/SKILL.md) | 🎯 | Discovery | [Docs](https://leorsousa05.github.io/CrewLoop/docs/core/orchestrator) |
| [`architect`](skills/architect/SKILL.md) | 🏗️ | Specs | [Docs](https://leorsousa05.github.io/CrewLoop/docs/core/architect) |
| [`designer`](skills/designer/SKILL.md) | 🎨 | Design | [Docs](https://leorsousa05.github.io/CrewLoop/docs/core/designer) |
| [`engineer`](skills/engineer/SKILL.md) | 🔧 | Build | [Docs](https://leorsousa05.github.io/CrewLoop/docs/core/engineer) |
| [`reviewer`](skills/reviewer/SKILL.md) | 🔍 | Review | [Docs](https://leorsousa05.github.io/CrewLoop/docs/core/reviewer) |
| [`shipper`](skills/shipper/SKILL.md) | 🚀 | Ship | [Docs](https://leorsousa05.github.io/CrewLoop/docs/core/shipper) |

### Supporting Crew

| Skill | Emoji | Phase | Learn more |
|-------|-------|-------|------------|
| [`docs-writer`](skills/docs-writer/SKILL.md) | 📝 | Docs | [Docs](https://leorsousa05.github.io/CrewLoop/docs/supporting/docs-writer) |
| [`tester`](skills/tester/SKILL.md) | 🧪 | QA | [Docs](https://leorsousa05.github.io/CrewLoop/docs/supporting/tester) |
| [`product-manager`](skills/product-manager/SKILL.md) | 📊 | Product | [Docs](https://leorsousa05.github.io/CrewLoop/docs/supporting/product-manager) |
| [`maintainer`](skills/maintainer/SKILL.md) | 🛠️ | Upkeep | [Docs](https://leorsousa05.github.io/CrewLoop/docs/supporting/maintainer) |
| [`researcher`](skills/researcher/SKILL.md) | 🔬 | Research | [Docs](https://leorsousa05.github.io/CrewLoop/docs/supporting/researcher) |
| [`security-guard`](skills/security-guard/SKILL.md) | 🛡️ | Security Review | [Docs](https://leorsousa05.github.io/CrewLoop/docs/supporting/security-guard) |
| [`accessibility-auditor`](skills/accessibility-auditor/SKILL.md) | ♿ | Accessibility Review | [Docs](https://leorsousa05.github.io/CrewLoop/docs/supporting/accessibility-auditor) |

## Workflow

```mermaid
flowchart TD
    O["🎯 Orchestrator<br>Discovery & Routing"]
    O --> PM["📊 Product-Manager<br>Prioritization"]
    O --> RS["🔬 Researcher<br>Technology Evaluation"]
    O --> MN["🛠️ Maintainer<br>Incident & Debt"]
    O --> T["🧪 Tester<br>QA Strategy"]
    PM --> A
    RS --> A
    MN --> A
    T --> A
    A["🏗️ Architect<br>Specs & Architecture"] --> D["🎨 Designer<br>UI/UX Direction"]
    A --> E["🔧 Engineer<br>Implementation"]
    A --> W["📝 Docs-Writer<br>Documentation"]
    D --> E
    E --> T
    T --> E
    E --> R["🔍 Reviewer<br>Quality Gate"]
    R --> S["🚀 Shipper<br>Git & PR"]
    S --> O
    W --> O
    SG["🛡️ Security-Guard<br>Security Review"] -.-> R
    AA["♿ Accessibility-Auditor<br>Accessibility Review"] -.-> R
    R --> SG
    R --> AA
    SG --> E
    AA --> E

    style O fill:#01579b,color:#fff
    style A fill:#e65100,color:#fff
    style D fill:#6a1b9a,color:#fff
    style E fill:#1b5e20,color:#fff
    style R fill:#b71c1c,color:#fff
    style S fill:#00695c,color:#fff
    style W fill:#5e35b1,color:#fff
    style T fill:#f57f17,color:#fff
    style PM fill:#283593,color:#fff
    style RS fill:#006064,color:#fff
    style MN fill:#37474f,color:#fff
    style OB fill:#4a148c,color:#fff
    style SG fill:#b71c1c,color:#fff
    style AA fill:#6a1b9a,color:#fff
```

**Flow rules:**

1. **Orchestrator always sends to Architect first** — never directly to Designer, Engineer, or Docs-Writer. Optional pre-routing to Product-Manager, Researcher, Maintainer, or Tester is allowed.
2. **Architect is the gatekeeper** — creates specs and decides whether to route to Designer (UI/frontend), Engineer (backend/code), or Docs-Writer (documentation).
3. **Designer acts before Engineer** — when there is UI, the designer creates the visual specification before the engineer implements.
4. **Engineer never does git, review, or docs** — reviewer, shipper, and docs-writer handle those.
5. **Reviewer is the quality gate** — no code reaches the repository without review.
6. **Shipper is the only one who touches git** — commit, branch, push, PR.
7. **Docs-Writer produces documentation** — READMEs, module docs, feature docs. Called by orchestrator when the task is purely documentation.
8. **Tester designs QA strategy** — reviews coverage, reproduces bugs, and complements engineer tests.
9. **Product-Manager, Researcher, and Maintainer are optional advisors** — framing, technology evaluation, and upkeep before or alongside the core flow.
10. **Security-Guard and Accessibility-Auditor are optional review specialists** — invoked by the Orchestrator or Reviewer when the change involves security-sensitive work or UI accessibility. They report findings back to the Engineer or Reviewer and do not touch git.
11. **Specs are archived** — `specs/changes/` becomes `specs/archive/` on commit.
12. **All skills return to orchestrator** — it is the central hub.

## Adding a New Skill

1. Copy the template:

```bash
cp assets/templates/skill-template.md skills/<skill-name>/SKILL.md
```

2. Fill in the frontmatter and body following [`references/skill-anatomy.md`](references/skill-anatomy.md).

3. Run the validator:

```bash
python scripts/validate-skills.py
```

4. Follow the full team workflow (orchestrator → architect → engineer → reviewer → shipper) to integrate it.

## Repository Layout

```
CrewLoop/
├── skills/                    # All team skills
│   ├── orchestrator/
│   ├── architect/
│   ├── designer/
│   ├── engineer/
│   ├── reviewer/
│   ├── shipper/
│   ├── docs-writer/
│   ├── tester/
│   ├── product-manager/
│   ├── maintainer/
│   ├── researcher/
│   ├── security-guard/
│   └── accessibility-auditor/
├── servers/                   # Optional MCP servers
├── scripts/                   # Helper scripts
│   ├── validate-skills.py
│   ├── package-skill.py
│   └── npm-publish-dry-run.sh
├── references/                # Shared conventions and workflow docs
│   ├── conventions.md
│   ├── skill-anatomy.md
│   ├── workflow.md
├── docs/                      # Docusaurus documentation site
├── specs/                     # Spec-driven change records
│   ├── changes/
│   ├── archive/
│   ├── living/
│   └── decisions/
├── assets/                    # Templates and static assets
│   └── templates/
│       └── skill-template.md
└── tests/                     # Manual testing notes
    └── README.md
```

## Releasing

Packages are published automatically by GitHub Actions when a semantic-version tag is pushed.

1. Make sure `package.json` and `packages/cli/package.json` versions are updated and aligned.
2. Make sure `packages/cli/package.json` depends on `@archznn/crewloop-skills` with `^<version>`.
3. Create and push a tag:

```bash
git tag v0.2.0
git push origin v0.2.0
```

The workflow will:

- Validate that the tag matches both `package.json` versions and the CLI dependency.
- Publish `@archznn/crewloop-skills`.
- Wait until the new version is visible on npm.
- Publish `@archznn/crewloop-cli`.

You need an npm automation token with publish rights for the `@archznn` scope configured as the `NPM_TOKEN` repository secret.

## Contributing

Edit the files in `skills/` and `references/`. Keep each `SKILL.md` concise and use reference files for shared detail. Run `python scripts/validate-skills.py` before opening a PR.

## License

[MIT](LICENSE.md)
