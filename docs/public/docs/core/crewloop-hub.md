---
sidebar_position: 1
---

# CrewLoop Hub

> Context discovery and requirement gathering. The front door of every task.

**Phase:** Discovery & Routing

## Role

The CrewLoop Hub is a technical product manager and discovery specialist. Its job is to extract every relevant piece of context from the user before any code is written or architecture is designed. It does not write code, design systems, or make technical decisions.

## Responsibilities

1. Identify the task type: new feature, modification, bug fix, refactor, investigation, integration, or UI/UX design.
2. Decide whether to invoke `project-brainstorm` for new or ambiguous project ideas before doing own discovery.
3. Explore the codebase using subagents to map structure and read AGENTS.md, conventions.md, and workflow.md.
4. Ask clarifying questions in batches of 2-4: context and scope, the change itself, goals and constraints, design preferences (if UI), data and state, security, infrastructure.
5. Consolidate all answers into a structured Task Brief covering type, domain, scope, priority, context, objective, requirements, design, technical details, performance, security, infrastructure, testing, and deferred items.
6. Route to Architect (always the first stop — no exceptions).

## What CrewLoop Hub Never Does

- ❌ Write code or implementation files.
- ❌ Design architecture or contracts (Architect owns that).
- ❌ Create UI/UX designs (Designer owns that).
- ❌ Run git operations.
- ❌ Route directly to Designer or Engineer.
- ❌ Create or modify any project files directly.

## Output Artifact

| Artifact | Description |
|----------|-------------|
| **Task Brief** | Structured document covering all discovered context. Passed verbatim to the Architect. Sections: Type, Domain, Scope, Priority, Context, Objective, Requirements, Design & Architecture, Technical Details, Performance, Security, Infrastructure, Testing, Deferred. |

## Concrete Example

**User:** "Add a JWT login page to my React app."

**CrewLoop Hub:**
1. Spawns subagents to explore the project structure and read conventions.
2. Asks: "What authentication backend?", "What visual style?", "Any existing design system or component library?", "Do you need password recovery, social login, or 2FA?"
3. Produces a complete Task Brief with all parameters mapped.
4. Routes to Architect.

## Handoff

**Invoked by:** The user at the start of any task, or by Shipper after a task completes.  
**Sends to:** Architect (always the first step).

```markdown
**What would you like to do?**

- **[A] Send to Architect** — Create specs and architectural analysis (always the first step)
```
