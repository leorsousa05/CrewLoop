# Spec Delta: `long-term-manager` Skill

## Current System

CrewLoop has 18 skills in the bundle. The `project-brainstorm` skill produces a structured brief for new/ambiguous projects, and the Orchestrator routes that brief to Architect. Once Architect, Designer, and Engineer begin work, there is no skill responsible for maintaining the project's long-term context across multiple sessions.

## Proposed Change

### ADDED

1. `skills/long-term-manager/SKILL.md`
   - New supporting skill with YAML frontmatter (`name`, `description`).
   - ROLE: keeper of long-term project context across sessions.
   - MODE: PLAN and TRACK only. No architecture, no implementation, no code, no git.
   - WORKFLOW:
     1. Read the brief from `project-brainstorm` or context from `orchestrator`.
     2. Verify whether long-term artifacts already exist in the target project.
     3. Determine mode: Create, Update, or Resume.
     4. Ask only targeted questions to fill gaps.
     5. Create or update the four artifact files using templates from `references/templates/`.
     6. Return control to Orchestrator with a summary of what was created or updated.
   - RESPONSE RULES: role prefix, letter-based navigation, return to Orchestrator, docs-as-code discipline.
   - ANTI-PATTERNS: do not design systems, do not write implementation code, do not run git, do not route to execution skills directly, do not create artifacts for single-session tasks.

2. `skills/long-term-manager/references/templates/`
   - `long-term-plan.md` — template with frontmatter and section prompts.
   - `session-log.md` — template with session entry structure.
   - `progress-checklist.md` — template with deliverables table.
   - `context-resume.md` — template with resume sections.

3. Reference to `long-term-manager` in `skills/orchestrator/SKILL.md`
   - Add trigger condition: when a project is expected to last multiple sessions, the Orchestrator may invoke `long-term-manager` after `project-brainstorm` returns (or directly if the brief already exists).
   - Add routing rule: after `long-term-manager` returns, the Orchestrator continues normal routing to Architect or Designer.

4. Reference to `long-term-manager` in `AGENTS.md`
   - Add the skill to the skills table so agents know it is part of the bundle.

### MODIFIED

- `skills/orchestrator/SKILL.md` — add invocation rule for `long-term-manager`.
- `AGENTS.md` — add skill entry and update skill count.

### REMOVED

- None.

## Skill Contract

### Input

- The user's original request or the structured brief produced by `project-brainstorm`.
- Any existing long-term artifacts found in the target project.

### Output

Four Markdown artifact files inside the target project (default location `docs/`):

| File | Purpose |
|------|---------|
| `docs/long-term-plan.md` | Vision, goals, scope boundaries, milestones, risks, constraints, status. |
| `docs/session-log.md` | One entry per session with date, focus, decisions, outcomes, next steps. |
| `docs/progress-checklist.md` | High-level deliverables with status (not started / in progress / done / blocked). |
| `docs/context-resume.md` | One-page summary for resuming the project after a long break. |

If the target project already uses a different `docs/` convention, the skill adapts the path but keeps the filenames.

### Trigger Conditions (from Orchestrator)

The Orchestrator invokes `long-term-manager` when:

- The request is a new software project expected to last multiple sessions.
- The user explicitly asks to track, plan, or manage a project over time.
- `project-brainstorm` has produced a brief that signals long-term work.
- The user returns to an existing project and needs context reconstruction.

The Orchestrator skips `long-term-manager` when:

- The task is a single-session bug fix, tweak, or small refactor.
- The user explicitly asks for a one-off change without follow-up.

### Navigation

At the end of the session, the skill presents:

```markdown
**What would you like to do?**

- **[O] Return to Orchestrator** — Hand the updated artifacts back to the Orchestrator for routing.
```

## Docs-as-Code Discipline

- Artifacts are Markdown files with YAML frontmatter.
- They live inside the target project's repository, alongside code.
- They should be committed by the Shipper alongside the deliverables they describe.
- `updated_at` must be refreshed every time an artifact changes.
- Filenames and frontmatter keys are immutable conventions.
