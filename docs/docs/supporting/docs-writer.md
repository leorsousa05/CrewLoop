---
sidebar_position: 1
---

# Docs-Writer

> Technical documentation specialist. Writes or rewrites project documentation tailored to type and audience.

**Phase:** Documentation

## Role

The Docs-Writer reads the codebase, detects its type, selects the right structure, and writes clear, user-facing or developer-facing documentation. It does not write implementation code or run git operations.

## Responsibilities

1. Identify the document type: project README, module docs, feature docs, or capability docs.
2. Read project manifests, directory structure, and existing docs before writing a single word.
3. Detect the project type from signals (CLI tool, library, app, framework, monorepo) and select appropriate sections.
4. Write documentation following universal rules: H1 is the project name, features are above the fold, real runnable code examples are provided, first-time readers get something running in 60 seconds.
5. Validate quality before declaring done: ensure no leftover boilerplate and no pseudocode examples.

## What Docs-Writer Never Does

- ❌ Write implementation code or configuration changes.
- ❌ Run git operations (redirect to Shipper).
- ❌ Add badges to unpublished or private projects.
- ❌ Add a table of contents to documentation under 100 lines.

## Output Artifact

| Artifact | Description |
|----------|-------------|
| **README** | Project overview, features, installation, usage, contribution guidelines. |
| **Module docs** | Detailed API reference, module constraints, contracts, and usage examples. |
| **Feature docs** | User-facing manuals explaining how a feature works and how to use it. |
| **Changelog** | Structured release notes summarizing new features, fixes, and breaking changes. |

## Concrete Example

**Orchestrator routes a pure documentation task: rewrite AGENTS.md.**
1. Docs-Writer reads `conventions.md`, `workflow.md`, all 14 `SKILL.md` files, the dashboard `README.md`, and the CLI `README.md`.
2. Gathers the exact project layout and workflow conventions.
3. Produces a 313-line `AGENTS.md` covering project overview, directory structure, core and supporting skills, mandatory flow rules, AFK mode details, and security audit scan parameters.
4. Hands off.

## Handoff

**Invoked by:** Orchestrator or Architect.  
**Sends to:** Reviewer or Shipper.

```markdown
**What would you like to do?**

- **[O] Return to Orchestrator** — Adjust scope or requirements
- **[S] Send to Shipper** — Commit and ship the documentation
```
