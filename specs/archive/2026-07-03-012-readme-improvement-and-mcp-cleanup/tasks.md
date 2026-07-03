# Tasks: README Improvements and Obsidian MCP Cleanup

## Phase 1: Repository Cleanup
- [x] Delete `servers/obsidian-mcp/` directory recursively
- [x] Remove `servers/obsidian-mcp/` references from [AGENTS.md](file:///home/arch/codes/crewloop/AGENTS.md)
- [x] Remove `servers/obsidian-mcp/` references from [README.md](file:///home/arch/codes/crewloop/README.md)
- [x] Remove `servers/obsidian-mcp/` references from Docusaurus docs (`docs/docs/contributing/repository-structure.md`)
- [x] Delete obsolete documentation file `docs/docs/tools/obsidian-mcp.md`
- [x] Remove `'tools/obsidian-mcp'` item from `docs/sidebars.js`

## Phase 2: README.md CLI Documentation
- [x] Document CLI command options (`--symlink`, `--force`, `--dry-run`, `--agent`) under "Quick Start" in [README.md](file:///home/arch/codes/crewloop/README.md)
- [x] Add table of CLI commands (`crewloop install`, `crewloop list`, `crewloop dashboard`) in [README.md](file:///home/arch/codes/crewloop/README.md)

## Phase 3: README.md Dashboard & Hooks Documentation
- [x] Add "Real-time Activity Dashboard" section in [README.md](file:///home/arch/codes/crewloop/README.md) (port 7890, dev server steps, keyboard shortcuts)
- [x] Document supported agents (`kimi`, `claude`, `codex`, `agy`) and hook file generation behavior

## Phase 4: Aesthetic & Workflow Clarity
- [x] Apply GitHub alert markdown tags (`> [!IMPORTANT]`, `> [!NOTE]`) for hub-and-spoke routing rules in [README.md](file:///home/arch/codes/crewloop/README.md)
- [x] Add the text illustration of the core developer cycle step-by-step

## Phase 5: Verification & Validation
- [x] Run `python scripts/validate-skills.py` to ensure skill files are valid
- [x] Check markdown links inside [README.md](file:///home/arch/codes/crewloop/README.md) and [AGENTS.md](file:///home/arch/codes/crewloop/AGENTS.md)
