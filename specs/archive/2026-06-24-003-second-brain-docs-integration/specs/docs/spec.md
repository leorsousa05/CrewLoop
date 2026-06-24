# Spec: Second-Brain Documentation and Integration

## Current State

- `AGENTS.md` describes repository structure, conventions, and workflow but omits the second-brain system.
- `references/conventions.md` covers commits, navigation, and spec folders but not memory.
- `references/workflow.md` describes the skill flow without mentioning when to invoke memory.
- Skills vary in where they place the `MEMORY & CONTEXT` section.

### ADDED

#### 1. `AGENTS.md` Section

Add a new top-level section "Second-Brain Memory" after "Repository Structure" or "Technology and Architecture". It must include:

- What `obsidian-second-brain` and `obsidian-mcp` are.
- The vault location (`~/.lea`) and layer map.
- The rule that every skill must invoke `obsidian-second-brain` before touching the vault.
- A link to `references/obsidian-mcp-usage.md` for details.
- An update to the "Repository Structure" code block to include `servers/obsidian-mcp/`.

#### 2. `conventions.md` Section

Add a subsection under "Mandatory Workflow" or as a new "Memory" section:

- Every skill invokes `obsidian-second-brain` at start and end.
- Never read/write `~/.lea` directly.
- Link to `references/obsidian-mcp-usage.md`.

#### 3. `workflow.md` Section

Add memory invocation points to the flow diagram description:

- Orchestrator reads memory before discovery.
- Each skill reads memory at start and persists at end.
- Shipper updates `Journal/loop-engineering-agents.md` with spec links.

#### 4. Skill Structural Alignment

All `skills/*/SKILL.md` files must place `MEMORY & CONTEXT` immediately after "MANDATORY: Read Reference & Template Files" and before any workflow/rules sections.

### MODIFIED

- `AGENTS.md`
- `references/conventions.md`
- `references/workflow.md`
- Position of `MEMORY & CONTEXT` in `skills/security-guard/SKILL.md`, `skills/accessibility-auditor/SKILL.md`, `skills/product-manager/SKILL.md`, `skills/researcher/SKILL.md`, `skills/tester/SKILL.md`, and `skills/maintainer/SKILL.md`.

### REMOVED

- Confusing "three-layer" references that contradict the eight listed paths, replaced by "three-layer memory architecture" with an explicit note that the eight paths are subdivisions of those layers.

## Acceptance Criteria

- [ ] `AGENTS.md` contains a "Second-Brain Memory" section.
- [ ] `references/conventions.md` contains memory conventions.
- [ ] `references/workflow.md` describes memory invocation points.
- [ ] All skills place `MEMORY & CONTEXT` in the same relative position.
- [ ] Terminology "three-layer" is clarified everywhere it appears.
