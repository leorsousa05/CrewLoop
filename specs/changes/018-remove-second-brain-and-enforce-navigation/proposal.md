# Proposal: Remove second-brain integration and enforce navigation menus

## Why

The active CrewLoop workflow currently depends on the `obsidian-second-brain` skill, the
`obsidian-mcp` server, and related documentation. The user wants to retire that integration
for now and replace it later with a different implementation.

At the same time, the skills are inconsistently ending without the required letter-based
navigation menu. The repository rules make that menu mandatory except for explicit AFK mode,
but the active skill instructions do not make the final-response requirement strong enough.

## Goals

- Remove active references, installation hooks, and documentation that require Obsidian or
  the second-brain integration.
- Preserve archived specs/history, but stop advertising or depending on the current memory
  implementation in active workflow files.
- Make the navigation menu requirement explicit and hard to miss in the active skills and
  shared conventions.

## Scope

- Active workflow docs: `AGENTS.md`, `README.md`, `references/*.md`
- Active skills under `skills/`
- Active docs site content under `docs/docs/` and `docs/sidebars.js`
- Packaging/install surface: root `package.json`, CLI source files, and related active tests
- Active living specs that describe currently supported system behavior

## Out of scope

- Archived specs under `specs/archive/`
- Unrelated dashboard work already in progress
- Designing or implementing the replacement memory system
