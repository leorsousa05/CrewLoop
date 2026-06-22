# Getting Started

CrewLoop is a team of AI skills that work together as a complete software development flow — from requirements discovery to deploy — ensuring no step is skipped and every change is traceable.

## What is CrewLoop?

CrewLoop distributes responsibilities across specialized AI skills. Each skill owns one phase of the workflow and never invades another's territory:

- **Orchestrator** — discovers context and routes every task.
- **Architect** — creates mandatory specs and contracts.
- **Designer** — defines aesthetic direction for UI work.
- **Engineer** — implements specs with tests.
- **Reviewer** — audits quality, security, and spec compliance.
- **Shipper** — handles git operations and PRs.
- **Docs-Writer, Tester, Product-Manager, Maintainer, Researcher** — support the core flow.

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/leorsousa05/loop-engineering-agents.git
cd loop-engineering-agents
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

## Optional: Obsidian Second Brain

CrewLoop also includes an optional MCP server that turns a local Obsidian vault (`~/.lea`) into a second brain / RAG for AI agents.

- [`servers/obsidian-mcp/README.md`](https://github.com/leorsousa05/loop-engineering-agents/tree/main/servers/obsidian-mcp) — installation and configuration
- [`references/obsidian-mcp-usage.md`](https://github.com/leorsousa05/loop-engineering-agents/tree/main/references/obsidian-mcp-usage.md) — how agents/skills should use it
