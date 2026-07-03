# Proposal: README Improvements and Obsidian MCP Cleanup

## Motivation
The current root `README.md` outlines the CrewLoop framework at a high level but leaves out critical details regarding its practical usage, CLI capabilities, and the real-time Dashboard. 
Specifically, the CLI commands table is missing essential flags (such as `--symlink`, `--force`, and `--dry-run`), and there are no direct instructions for starting or interacting with the real-time Dashboard (port `7890` and keyboard shortcuts).
Additionally, the repository contains a `servers/obsidian-mcp/` directory which is obsolete, has already been removed from the remote GitHub repository, and creates confusing documentation gaps. 

To maintain repository hygiene and provide high-quality developer onboarding, we must:
1. Delete the `servers/obsidian-mcp/` directory.
2. Update the root `README.md` to document the CLI commands/options, Dashboard setup/usage, supported agents and hooks, and introduce aesthetic improvements (alerts and workflow cycle breakdown).
3. Clean up references to Obsidian MCP in `AGENTS.md` and `README.md`.

## Scope
- **In Scope:**
  - Deletion of the `servers/obsidian-mcp/` directory.
  - Adding detailed CLI command options/flags table to `README.md`.
  - Adding a dedicated "Real-time Activity Dashboard" section to `README.md`.
  - Documenting supported agent hooks (`kimi`, `claude`, `codex`, `agy`) and hook file generation in `README.md`.
  - Enhancing the visual presentation of the workflow section with markdown alerts and a concrete example of the developer cycle.
  - Removing all references to Obsidian MCP in the root `README.md` and `AGENTS.md`.
- **Out of Scope:**
  - Modiﬁcations to active TS code in `packages/cli` or `servers/dashboard` unless specifically required by references cleanup (no code changes needed, only documentation and folder deletion).

## Constraints
- **Validation:** All 16 skills must remain valid and pass `python scripts/validate-skills.py`.
- **No Broken Links:** Ensure any link updates within documentation target correct files.
