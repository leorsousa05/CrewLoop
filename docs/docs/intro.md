# Getting Started

CrewLoop is a team of AI skills that work together as a complete software development flow — from requirements discovery to deploy — ensuring no step is skipped and every change is traceable.

## What is CrewLoop?

Instead of asking a single AI to "build this feature", CrewLoop distributes responsibilities across specialized skills. Each skill owns one phase of the workflow and never invades another's territory:

- **Orchestrator** — discovers context and routes every task.
- **Architect** — creates mandatory specs and contracts.
- **Designer** — defines aesthetic direction for UI work.
- **Engineer** — implements specs with tests.
- **Reviewer** — audits quality, security, and spec compliance.
- **Shipper** — handles git operations and PRs.

Supporting skills extend the flow: **Docs-Writer**, **Tester**, **Product-Manager**, **Maintainer**, **Researcher**, **Security-Guard**, and **Accessibility-Auditor**.

## Who is this for?

- Developers who want structured AI assistance instead of ad-hoc code generation.
- Teams that need traceability, specs, and review gates.
- Anyone building non-trivial software where skipping steps leads to bugs and rework.

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/leorsousa05/CrewLoop.git
cd CrewLoop
```

2. Install all skills to your agent's skills directory:

```bash
./scripts/install.sh
```

By default this copies `skills/*` to `~/.agents/skills/`. Pass a custom target if needed:

```bash
./scripts/install.sh /path/to/your/skills/dir
```

3. Validate that all skills are well-formed:

```bash
python scripts/validate-skills.py
```

Each skill will be automatically detected and activated according to the conversation context.

## What happens after installation?

Once the skills are installed, start any task by describing what you want:

> "Add a login page to my React app."

The **Orchestrator** will take over, ask clarifying questions, and route the task through the crew.
