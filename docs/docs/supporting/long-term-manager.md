---
sidebar_position: 1
---

# Long-Term Manager

> Durable tracking for projects that span multiple AI sessions.

**Phase:** Discovery / Tracking

## Role

The Long-Term Manager keeps project context alive across sessions. When a project is too large to finish in one conversation, it creates and maintains a small set of Markdown artifacts inside the target project. The next time work resumes, the crew can pick up exactly where it left off.

It does not design systems, write implementation code, or run git operations. It produces living documents and hands control back to the Orchestrator.

## Responsibilities

1. Read the brief from `project-brainstorm` or the Orchestrator.
2. Check whether long-term tracking artifacts already exist.
3. Decide whether to create, update, or resume the tracking set.
4. Ask only the targeted questions needed to fill gaps.
5. Create or update the four artifact files using the templates in `references/templates/`.
6. Summarize the current state and next actions for the Orchestrator.

## What Long-Term Manager Never Does

- ❌ Design system architecture or UI.
- ❌ Write implementation code, schemas, or config.
- ❌ Run `git commit`, `git push`, or any git operation.
- ❌ Replace the full discovery flow of `project-brainstorm`.
- ❌ Route directly to Architect, Designer, Engineer, or Shipper.

## Docs-as-code discipline

The artifacts are plain Markdown files with YAML frontmatter. They live in the target project's repository, are versioned with the code, and should be committed by the Shipper alongside the work they describe.

### The four artifacts

| Artifact | Purpose |
|----------|---------|
| `docs/long-term-plan.md` | Vision, goals, milestones, risks, and project status. |
| `docs/session-log.md` | A prepend-only log of every session. |
| `docs/progress-checklist.md` | Deliverables, owners, priorities, and current status. |
| `docs/context-resume.md` | A snapshot of the current state for the next session. |

### Allowed values

| Concept | Allowed values |
|---------|---------------|
| Project status | `active`, `paused`, `completed`, `cancelled` |
| Deliverable status | `not started`, `in progress`, `done`, `blocked` |
| Priority | `P0`, `P1`, `P2` |

Every modification refreshes the `updated_at` frontmatter field.

## Output Artifacts

| Artifact | Description |
|----------|-------------|
| **Long-term plan** | Project name, status, vision, goals, milestones, risks, and open questions. |
| **Session log** | Chronological entries for each session: date, focus, decisions, blockers. |
| **Progress checklist** | Deliverables with status, priority, and owner. |
| **Context resume** | Concise reconstruction of the current state and next concrete actions. |

## Concrete Example

**User:** "I want to build a personal finance app."

**Orchestrator invokes Project Brainstorm, then Long-Term Manager.**

1. Long-Term Manager checks `docs/` and finds no artifacts.
2. Asks: "What is the short project name?" → "finloop".
3. Asks: "What are the 3 main milestones?" → "setup, MVP, beta".
4. Creates the four files from templates with consistent frontmatter.
5. Returns to Orchestrator: *"Created long-term tracking artifacts for 'finloop'. Status: active. Next: Architect can create the technical spec."*

On the next session, the user says "Continue finloop." The Orchestrator invokes Long-Term Manager in update mode, which reads `context-resume.md`, prepends a new session entry, updates deliverable statuses, and returns a concise briefing.

## Handoff

**Invoked by:** Orchestrator, usually after `project-brainstorm` or when resuming a multi-session project.  
**Sends to:** Orchestrator with updated or newly created artifacts.

```markdown
**What would you like to do?**

- **[O] Return to Orchestrator** — Hand the updated long-term artifacts back to the Orchestrator for routing.
```
