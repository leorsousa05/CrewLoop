# Spec Delta: Cross-Skill Obsidian Integration

## Current State

- `obsidian-second-brain/SKILL.md` fully defines the three-layer vault architecture.
- `researcher`, `maintainer`, `product-manager`, and `tester` mention `search_notes` and `learn_from_text` in a small MCP tools table.
- Core skills (`orchestrator`, `architect`, `engineer`, `reviewer`, `shipper`, `designer`, `docs-writer`) do not mention Obsidian, `~/.lea`, or memory retrieval.
- `references/obsidian-mcp-usage.md` documents the architecture but does not map memory usage to individual skills.

## Changes

### ADDED

- **"Memory & Context" section** in each skill:
  - `orchestrator/SKILL.md`
  - `architect/SKILL.md`
  - `engineer/SKILL.md`
  - `reviewer/SKILL.md`
  - `shipper/SKILL.md`
  - `designer/SKILL.md`
  - `docs-writer/SKILL.md`
  - `researcher/SKILL.md`
  - `maintainer/SKILL.md`
  - `product-manager/SKILL.md`
  - `tester/SKILL.md`

- **Per-skill memory targets** in `references/obsidian-mcp-usage.md`:
  - Table mapping each skill to what it should read and where it should persist.

### MODIFIED

- Supporting skills updated to align with three-layer terminology (`Knowledge/`, `Journal/`, `Memory/`, `Notes/`, `_Inbox/`).
- `references/obsidian-mcp-usage.md` extended with a "Per-Skill Memory Targets" section.

### REMOVED

- Nothing removed.

## Backward Compatibility

- Non-breaking. Skills gain guidance but do not change their core responsibilities or routing rules.
