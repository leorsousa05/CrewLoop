# Tasks: Three-Layer Memory Architecture for Obsidian RAG

## Setup
- [x] Create spec folder `specs/changes/001-three-layer-memory-architecture/`.
- [x] Initialize `.spec.yaml` with status, dates, and author.
- [x] Create `proposal.md`, `specs/spec.md`, `design.md`, and `tasks.md`.

## Decision Record
- [x] Create ADR at `specs/decisions/002-three-layer-memory-architecture.md`.
- [x] Record why layered memory was chosen over flat folders and vector search deferral.

## Documentation Update
- [x] Update `references/obsidian-mcp-usage.md` with the three-layer layout.
- [x] Update `servers/obsidian-mcp/README.md` with a pointer to the architecture.

## Skill Update
- [x] Rewrite `skills/obsidian-second-brain/SKILL.md` to enforce the new architecture.
- [x] Add layer-selection decision tree.
- [x] Add heartbeat / distillation instructions.
- [x] Update examples to use new folder names.
- [x] Update navigation options.

## Vault Migration
- [x] Backup existing `~/.lea` contents.
- [x] Create `AGENT.md` and `MEMORY.md` at vault root.
- [x] Create folders: `memory/`, `Memory/`, `Knowledge/`, `Journal/`, `Notes/`, `_Inbox/`.
- [x] Map and move existing notes:
  - `concepts/*` → `Knowledge/` or `Notes/`
  - `decisions/*` → `Knowledge/`
  - `projects/*` → `Knowledge/` or `Journal/`
  - `dashboards/*` → `Journal/`
- [x] Generate `Journal/migration-manifest.md`.
- [x] Update or preserve internal wikilinks.

## Living Spec
- [x] Create or update `specs/living/obsidian-second-brain/memory-architecture.md` as the merged source of truth.

## Validation
- [x] Run `python3 scripts/validate-skills.py`.
- [x] Verify vault layout matches the design.
- [x] Confirm no sensitive data was promoted during migration.
- [x] Review `MEMORY.md` word count stays near the 500-word soft cap.

## Completion
- [x] Archive change folder to `specs/archive/2026-06-15-001-three-layer-memory-architecture/`.
- [x] Update `.spec.yaml` status to completed.
