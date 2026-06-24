# Design: Second-Brain Documentation and Integration

## Approach

Documentation-only change across three top-level files and the structural alignment of skill files.

## `AGENTS.md` Changes

Add section:

```markdown
## Second-Brain Memory

The project includes an Obsidian-based second brain for long-term context:

- **Skill:** `skills/obsidian-second-brain/SKILL.md`
- **Server:** `servers/obsidian-mcp/`
- **Vault:** `~/.lea`

Every skill in the bundle must invoke the `obsidian-second-brain` skill at the start of a task (to read prior context) and at the end (to persist outcomes). Skills must never read or write files in `~/.lea` directly.

See `references/obsidian-mcp-usage.md` for the full layer map and tool reference.
```

Update the repository structure block to include:

```
├── servers/                # Optional MCP servers
│   └── obsidian-mcp/       # Local Obsidian second-brain server
```

## `references/conventions.md` Changes

Add section before "Mandatory Workflow":

```markdown
## Memory Conventions

- Every skill invokes `obsidian-second-brain` via the `Skill` tool at task start and end.
- Never read or write files inside `~/.lea` directly with `Read`, `Edit`, `Write`, or `Bash`.
- Target the correct vault layer: `Knowledge/` for durable guides, `Journal/` for session outcomes, `Memory/` for user profile, `Notes/` for scratchpads, `_Inbox/` for proposals.
- Full reference: `references/obsidian-mcp-usage.md`.
```

## `references/workflow.md` Changes

Add bullet under "Routing Rules" or as a new paragraph:

```markdown
Each skill reads from the second brain at the start of a task and persists outcomes at the end. The Orchestrator initiates memory reads during discovery; the Shipper updates `Journal/loop-engineering-agents.md` with active/archived spec links.
```

## Skill Structural Alignment

For each skill file, move the `MEMORY & CONTEXT` section to appear immediately after the "MANDATORY: Read Reference & Template Files" block. No content changes unless the section is missing the standard wording.

Standard wording:

```markdown
## MEMORY & CONTEXT

**Always invoke the `obsidian-second-brain` skill via the `Skill` tool.**
Never read or write files inside `~/.lea` directly with `Read`, `Edit`, `Write`, or `Bash`.

At the start of the task, the `obsidian-second-brain` skill will search and read the relevant layers for this role.
At the end of the task, it will persist outcomes to the correct layers.
```

## Directory Structure

```
AGENTS.md                              # modified
references/conventions.md              # modified
references/workflow.md                 # modified
skills/
├── orchestrator/SKILL.md              # already correct position
├── architect/SKILL.md                 # already correct position
├── designer/SKILL.md                  # already correct position
├── engineer/SKILL.md                  # already correct position
├── reviewer/SKILL.md                  # already correct position
├── shipper/SKILL.md                   # already correct position
├── docs-writer/SKILL.md               # already correct position
├── security-guard/SKILL.md            # move MEMORY & CONTEXT up
├── accessibility-auditor/SKILL.md     # move MEMORY & CONTEXT up
├── product-manager/SKILL.md           # move MEMORY & CONTEXT up
├── researcher/SKILL.md                # move MEMORY & CONTEXT up
├── tester/SKILL.md                    # move MEMORY & CONTEXT up
└── maintainer/SKILL.md                # move MEMORY & CONTEXT up
```

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Moving sections breaks internal anchors | Only move whole sections; do not change headings. |
| `AGENTS.md` becomes too long | Keep the new section concise and link to the full reference. |

## Deferred

- Rewriting skill-specific workflows.
- Adding memory usage examples to each skill.
