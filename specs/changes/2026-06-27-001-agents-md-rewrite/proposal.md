# Proposal — Complete Rewrite of AGENTS.md Files

## WHY

The two existing `AGENTS.md` files are outdated and incomplete:

- **Root `AGENTS.md`** documents only the 6 core skills and a basic project structure. It is missing:
  - A clear project description (what CrewLoop is and why it exists)
  - The 7 supporting skills (accessibility-auditor, docs-writer, maintainer, product-manager, researcher, security-guard, tester)
  - The `servers/` directory (dashboard + obsidian-mcp)
  - The `docs/` Docusaurus site
  - AFK mode behavior and its impact on the skill flow
  - Accurate package structure (`packages/cli/` details)
  - The distinction between core and supporting skills in the team workflow

- **`packages/cli/AGENTS.md`** is already well-structured and mostly accurate but needs to be included in scope for completeness and to ensure any changes from recent specs (e.g., AGY hook path migration) are reflected.

Any AI agent reading the current `AGENTS.md` will have an incomplete and misleading mental model of the project, leading to errors in routing, structure placement, and scope.

## SCOPE

- **In scope:**
  - Full rewrite of `AGENTS.md` (project root)
  - Full rewrite of `packages/cli/AGENTS.md`
  - Source of truth: `references/conventions.md`, `references/workflow.md`, all 13 `skills/*/SKILL.md` files, `servers/dashboard/README.md`, `packages/cli/README.md`, root `README.md`, `specs/living/`

- **Out of scope:**
  - `README.md` (public documentation — separate concern)
  - Any `SKILL.md` file
  - `MEMORY.md` (does not exist; out of scope to create)
  - `docs/` Docusaurus content

## CONSTRAINTS

- Preserve Markdown only (no MDX, no frontmatter — these are not Docusaurus pages)
- Must not contradict `references/conventions.md` or `references/workflow.md`
- Must remain readable by any AI agent without prior context
- No secrets, API keys, tokens, or credential examples
- Each section must be self-sufficient (agent should not need to cross-reference 3 files to understand a rule)
