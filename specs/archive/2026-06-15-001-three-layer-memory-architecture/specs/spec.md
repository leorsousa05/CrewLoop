# Spec Delta: Obsidian RAG Memory

## Current State

The local Obsidian vault at `~/.lea` and the `obsidian-second-brain` skill use a flat organizational scheme:

- Vault root contains note files with no mandatory entry document.
- Notes are grouped into semantic folders: `concepts/`, `decisions/`, `projects/`, `dashboards/`.
- The agent calls `sync_from_bundle` once, then searches and reads notes reactively.
- New concepts are persisted via `learn_from_text`, which auto-selects a folder.
- There is no explicit working-memory layer or curated-memory file.

This layout mixes durable knowledge, transient notes, and project status pages without distinguishing their retrieval priority or lifecycle.

## Changes

### ADDED

- **`AGENT.md`** at vault root (`~/.lea/AGENT.md`)
  - Entry instructions for any agent entering the vault.
  - Summary of the three layers and navigation rules.
  - Link to `MEMORY.md` and the `_Inbox/` folder.

- **`MEMORY.md`** at vault root (`~/.lea/MEMORY.md`)
  - Curated memory read at the start of every major session.
  - Soft cap of ~500 words.
  - Contains: user identity, active priorities, learned lessons, current project context.

- **`memory/`** folder (lowercase)
  - Working memory raw session logs.
  - Filename pattern: `YYYY-MM-DD-HHMM.md`.
  - Written by the agent during or after sessions.
  - Only the most recent 1-2 days are typically read.

- **`Memory/`** folder (capitalized)
  - Durable user profile and preferences.
  - Examples: `Memory/profile-user.md`, `Memory/preferences.md`.

- **`Knowledge/`** folder
  - Long-lived technical guides, reusable documentation.
  - Examples: `Knowledge/obsidian-mcp-setup.md`, `Knowledge/conventional-commits.md`.

- **`Journal/`** folder
  - Important session logs worth keeping beyond raw working memory.
  - Examples: `Journal/2026-06-15-project-brief.md`.

- **`Notes/`** folder
  - Temporary notes, research scratchpads, drafts.
  - Examples: `Notes/2026-06-15-ml-concepts.md`.

- **`_Inbox/`** folder
  - Agent proposals before promotion to a canonical layer.
  - Auto-promotion is allowed; notes should be reviewed during heartbeat.

- **Heartbeat distillation flow**
  - Periodic review (2-4x per day or at end of significant tasks).
  - Reads recent `memory/` files.
  - Updates `MEMORY.md`.
  - Promotes durable knowledge to `Memory/`, `Knowledge/`, `Journal/`, or `Notes/`.

### MODIFIED

- **`skills/obsidian-second-brain/SKILL.md`**
  - Replace reactive workflow with layered-memory workflow.
  - Add rules for when to use each layer.
  - Add heartbeat / distillation guidance.
  - Update navigation options.

- **`references/obsidian-mcp-usage.md`**
  - Document the three-layer layout.
  - Explain `AGENT.md`, `MEMORY.md`, and the folder semantics.
  - Provide examples in English.

- **`servers/obsidian-mcp/README.md`**
  - Add a short pointer to the new architecture docs.

- **Existing notes in `~/.lea`**
  - Relocated according to mapping rules below.

### REMOVED

- Flat folder usage as the primary organization (legacy folders remain only during migration or for backward-compatible references).

## Migration Notes

Map existing notes to the new layers using intent and lifetime:

| Existing folder | New location | Rationale |
|-----------------|--------------|-----------|
| `concepts/` | `Knowledge/` or `Notes/` | Concepts that are durable → `Knowledge/`; transient research → `Notes/`. |
| `decisions/` | `Knowledge/` | Architectural/process decisions are durable knowledge. |
| `projects/` | `Knowledge/` or `Journal/` | Active project notes → `Journal/`; reference documentation → `Knowledge/`. |
| `dashboards/` | `Journal/` | Status dashboards are session/state artifacts. |

After migration, generate a `migration-manifest.md` in `Journal/` listing source path, destination path, and reason.

## Backward Compatibility

- Non-breaking for the MCP server protocol.
- The skill change is breaking in behavior: agents will be expected to follow the new layout.
- Old flat folders may remain as read-only aliases during a transition period, but new notes must use the new structure.
