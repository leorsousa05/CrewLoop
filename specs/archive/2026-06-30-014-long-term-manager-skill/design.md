# Design: `long-term-manager` Skill

## [Padrões Aplicados]

- **Skill-as-Instruction:** A mudança é puramente um arquivo Markdown de instrução, consistente com todas as outras skills do CrewLoop. Não há código runtime.
- **Hub-and-Spoke Routing:** `long-term-manager` é uma supporting skill spoke. É invocada pelo Orchestrator, mantém artefatos, e devolve o controle ao Orchestrator. Nunca roteia diretamente para Architect, Designer ou Engineer.
- **Document-as-State:** O estado do projeto de longo prazo é representado por arquivos Markdown no próprio projeto alvo. Isso torna o estado versionável junto com o código e acessível a qualquer agente que leia o repositório.
- **Docs-as-Code:** Os artefatos seguem o princípio docs-as-code: formato Markdown, frontmatter YAML, versionados no repositório do projeto, commitados junto com entregas pelo Shipper.
- **Progressive Disclosure:** A skill começa verificando artefatos existentes, depois decide se precisa criar, atualizar ou apenas resumir.
- **Anti-Corruption Layer (conceitual):** A skill traduz o brief livre do `project-brainstorm` em um formato padronizado de artefatos, isolando o restante do workflow da evolução do brief.
- **Template Method:** Cada artefato segue um template rígido de frontmatter e seções, garantindo consistência entre projetos e sessões.

## Directory Structure

```
skills/
└── long-term-manager/
    ├── SKILL.md                    # New skill instructions
    └── references/
        └── templates/
            ├── long-term-plan.md
            ├── session-log.md
            ├── progress-checklist.md
            └── context-resume.md
```

Updated files:

```
skills/orchestrator/SKILL.md   # Add invocation trigger and routing rule
AGENTS.md                      # Add skill entry
```

Target project artifacts (created/maintained by the skill at runtime guidance):

```
<target-project>/
└── docs/
    ├── long-term-plan.md
    ├── session-log.md
    ├── progress-checklist.md
    └── context-resume.md
```

## Skill Contract

### Input

- The user's original request or the structured brief from `project-brainstorm`.
- Existing long-term artifacts in the target project (if any).

### Output

Four Markdown files with standardized frontmatter and sections. The skill produces or updates:

1. `docs/long-term-plan.md`
2. `docs/session-log.md`
3. `docs/progress-checklist.md`
4. `docs/context-resume.md`

### Activation Flow

```
User request
    ↓
Orchestrator identifies multi-session project
    ↓
project-brainstorm (if new/ambiguous) produces brief
    ↓
Orchestrator invokes long-term-manager
    ↓
long-term-manager creates/updates artifacts
    ↓
Orchestrator receives summary and routes to Architect / Designer
```

## Strict Conventions

### Filenames

The four artifact filenames are immutable:

- `long-term-plan.md`
- `session-log.md`
- `progress-checklist.md`
- `context-resume.md`

If the target project already has a `docs/` folder with a different convention, the skill may place artifacts in `docs/project/` or ask the user. The filenames never change.

### Frontmatter Schema

Every artifact must start with the following YAML frontmatter:

```yaml
---
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
project_name: <name>
---
```

`docs/long-term-plan.md` additionally requires:

```yaml
status: active | paused | completed | cancelled
```

Rules:

- Dates use ISO-8601 (`YYYY-MM-DD`).
- `project_name` is lowercase, kebab-case or short title.
- `updated_at` must be refreshed on every modification.
- `status` is updated only in `long-term-plan.md`.

### Status Values

Allowed statuses:

| Status | Meaning |
|--------|---------|
| `active` | Work is ongoing. |
| `paused` | Work intentionally stopped temporarily. |
| `completed` | All goals achieved, project closed. |
| `cancelled` | Project abandoned or no longer pursued. |

### Priority Values

Used in `progress-checklist.md`:

| Priority | Meaning |
|----------|---------|
| `P0` | Blocker; must be done before anything else. |
| `P1` | Important; expected in the current phase. |
| `P2` | Nice-to-have; can be deferred. |

### Deliverable Status Values

Used in `progress-checklist.md`:

| Status | Meaning |
|--------|---------|
| `not started` | No work yet. |
| `in progress` | Work started, not finished. |
| `done` | Complete and verified. |
| `blocked` | Cannot proceed; requires external action. |

## Artifact Templates

Templates live in `skills/long-term-manager/references/templates/` and are copied/adapted by the skill when creating artifacts.

### `long-term-plan.md`

```markdown
---
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
project_name: <name>
status: active
---

# Long-Term Plan: <Project Name>

## Vision

1–2 sentences describing the desired end state.

## Goals

- [Goal 1: measurable outcome]
- [Goal 2: measurable outcome]
- [Goal 3: measurable outcome]

## Scope

### In scope

- [Item]
- [Item]

### Out of scope

- [Item]
- [Item]

## Milestones

1. **[Milestone name]** — Target: YYYY-MM-DD
   - Acceptance criteria: [criteria]
2. **[Milestone name]** — Target: YYYY-MM-DD
   - Acceptance criteria: [criteria]

## Constraints

- [Technical, timeline, or business constraint]

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk] | low/medium/high | low/medium/high | [Mitigation] |
```

### `session-log.md`

```markdown
---
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
project_name: <name>
---

# Session Log: <Project Name>

## Sessions

### YYYY-MM-DD — [Focus / objective]

- **Focus:** [What this session aimed to do]
- **Key decisions:**
  - [Decision 1]
  - [Decision 2]
- **Outcomes:**
  - [Outcome 1]
  - [Outcome 2]
- **Next steps:**
  - [Next step 1]
  - [Next step 2]
```

When updating, prepend a new entry at the top under `## Sessions`.

### `progress-checklist.md`

```markdown
---
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
project_name: <name>
---

# Progress Checklist: <Project Name>

## Deliverables

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [Deliverable 1] | not started | P0 | [Notes] |
| [Deliverable 2] | in progress | P1 | [Notes] |
| [Deliverable 3] | done | P2 | [Notes] |
```

### `context-resume.md`

```markdown
---
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
project_name: <name>
---

# Context Resume: <Project Name>

## Project Summary

One-paragraph overview of what the project is and why it exists.

## Current Phase

Where the project is right now (e.g., "MVP implementation", "Design review").

## Last Session Highlights

- [Decision or progress from the most recent session]
- [Decision or progress from the most recent session]

## Open Questions

- [Question that must be answered next]
- [Question that must be answered next]

## Next Actions

1. [Concrete next step]
2. [Concrete next step]
```

## Interaction Examples

### Example 1: Initial Session

**User:** *"I want to build a personal finance app."*

**Orchestrator** invokes `project-brainstorm`.

**project-brainstorm** returns a brief: app de finanças pessoais, React + Node, MVP com controle de despesas e metas.

**Orchestrator** invokes `long-term-manager`.

**long-term-manager:**
1. Checks `docs/` — no artifacts exist.
2. Asks: "What is the short project name?" → "finloop".
3. Asks: "What are the 3 main milestones?" → "setup, MVP, beta".
4. Creates the four files from templates.
5. Returns to Orchestrator: *"Created long-term-plan.md, session-log.md, progress-checklist.md, context-resume.md for project 'finloop'. Current status: active. Next: Architect can create the technical spec."*

### Example 2: Follow-Up Session

**User:** *"Continue finloop."*

**Orchestrator** detects existing artifacts and invokes `long-term-manager` in Update mode.

**long-term-manager:**
1. Reads `docs/context-resume.md`.
2. Summarizes: *"Last session: defined MVP scope. Next action was Architect spec."*
3. Asks: "What is the focus of today's session?" → "Architect created the spec; we want to start implementing auth."
4. Prepends a new entry to `session-log.md`.
5. Updates `progress-checklist.md`: auth deliverable → `in progress`.
6. Rewrites `context-resume.md` with new open questions and next actions.
7. Returns to Orchestrator.

### Example 3: Resume After Long Break

**User:** *"What was I doing on finloop?"*

**Orchestrator** invokes `long-term-manager` in Resume mode.

**long-term-manager:**
1. Reads all four artifacts.
2. Presents a concise reconstruction: project summary, current phase, last session highlights, open questions, next actions.
3. Asks: "Do you want to continue with the planned next actions or adjust?"
4. Updates `updated_at` on `context-resume.md`.
5. Returns to Orchestrator.

## Question Flow

When invoked, the skill follows this discovery pattern:

1. **Check existing artifacts** — Look for `docs/long-term-plan.md` and related files in the target project.
2. **Determine mode** — Decide whether to create, update, or resume.
3. **Fill gaps** — Ask only the questions needed to complete or update the artifacts (not a full discovery; that is `project-brainstorm`'s job).
4. **Update artifacts** — Write the four Markdown files with consistent frontmatter.
5. **Summarize** — Present a concise summary of changes and return to Orchestrator.

Example questions:

- "What is the short name for this project?"
- "What are the 2–4 main milestones you want to track?"
- "What was the focus of this session, and what decisions were made?"
- "Are any deliverables blocked or at risk?"
- "What are the next concrete actions for the upcoming session?"

## Docs-as-Code Commit Guidance

The skill must remind the user (or the Shipper, when invoked later) that long-term artifacts are docs-as-code:

- They should be committed alongside the code they describe.
- The Shipper should include artifact updates in the same commit when a milestone or deliverable changes.
- If no code changed but only the plan/log was updated, the Shipper may commit with `docs(long-term): update session log`.

The skill itself never runs git.

## Test Plan

- Run `python scripts/validate-skills.py` after creating `skills/long-term-manager/SKILL.md`.
- Verify that `skills/orchestrator/SKILL.md` still passes validation (no broken references).
- Manual review: confirm the new skill follows `assets/templates/skill-template.md`.
- Manual review: confirm templates in `references/templates/` match the artifact schemas.
- Manual review: confirm the orchestrator invocation rules are clear and do not conflict with existing routing.

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Skill duplicates responsibilities of `project-brainstorm` or `product-manager` | Clear scope: brainstorm discovers, product-manager prioritizes, long-term-manager tracks across sessions. |
| Skill drifts into architecture or implementation | Strong anti-patterns: never design systems, never write code. |
| Skill bypasses Orchestrator | Navigation menu only offers `[O] Return to Orchestrator`. |
| Artifacts become stale | Each session updates `session-log.md`, `progress-checklist.md`, and `context-resume.md`; frontmatter includes `updated_at`. |
| Path conflicts if target project already has `docs/` | Skill adapts path but keeps filenames; if `docs/` is unsuitable, it asks the user. |
| Templates become outdated | Templates live with the skill and are reviewed when the skill is updated. |

## Deferred

- Visual dashboard for progress tracking.
- Integration with Obsidian MCP or centralized second-brain memory.
- Automated git commit of artifacts (Shipper remains the only skill that touches git).
- Executable helpers or CLI subcommands.
- Multi-project portfolio view.

## Subagent Plan

This change now includes the skill file plus four template files, plus updates to orchestrator and AGENTS.md. The templates are independent from each other but share the same frontmatter conventions. They could be developed in parallel, but the coordination overhead is low and the risk of inconsistency is high. A single Engineer implementation is sufficient.
