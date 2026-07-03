# Design: README Improvements and Obsidian MCP Cleanup

This specification details the structural design of documentation improvements and file cleanup for the CrewLoop framework.

## [Padrões Aplicados]

### 1. Single Source of Truth (SSOT)
- **Justification:** Ensuring the root `README.md` acts as the definitive entry point for CLI flags, dashboard details, and agent configurations. Outdated or removed features (specifically Obsidian MCP) must be pruned from both the README and `AGENTS.md` to prevent document drift and developer confusion.

### 2. User-Centric Technical Documentation Design
- **Justification:** The structure of the README is optimized for scanning. Technical command options are mapped in a compact markdown table for fast lookup. High-impact constraints and workflows are styled with visual alert containers (`> [!IMPORTANT]`, `> [!NOTE]`) to separate background details from runtime rules.

---

## [Estratégia de Implementação]

### Phase 1: Bounded Context Cleanup (Removal of Obsidian MCP)
1. Delete the `servers/obsidian-mcp/` folder recursively.
2. Search files to identify any other stale imports or references to `obsidian-mcp`.

### Phase 2: Refactoring AGENTS.md
1. Open [AGENTS.md](file:///home/arch/codes/crewloop/AGENTS.md).
2. Locate the repository layout map and remove the `servers/obsidian-mcp/` line.
3. Locate the technology and architecture table and remove the Obsidian MCP row.
4. Verify all counts of files/skills in text are consistent.

### Phase 3: Refactoring README.md
1. Open [README.md](file:///home/arch/codes/crewloop/README.md).
2. Locate the "Quick Start" section. Expand it to detail the global installer flags (`--symlink`, `--force`, `--dry-run`, `--agent <name>`).
3. Add a table of all CLI commands:
   - `crewloop install`
   - `crewloop list`
   - `crewloop dashboard`
4. Add a "Real-time Activity Dashboard" section under the CLI/Quick Start, explaining configuration, port `7890`, custom environments (`CREWLOOP_DASHBOARD_PORT`), and keyboard shortcuts (`Cmd/Ctrl+K`).
5. Document supported agent hooks shim mechanism (`kimi`, `claude`, `codex`, `agy`).
6. Apply Markdown alert blocks for critical hub-and-spoke rules (e.g. Architect gatekeeper).
7. Remove `servers/obsidian-mcp` from the repository layout text block.

### Phase 4: Validation
1. Verify skill definitions by running `python scripts/validate-skills.py` to ensure everything remains compliant.
2. Confirm there are no broken links in the modified documents.
