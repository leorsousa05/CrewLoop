---
sidebar_position: 1
---

# Project Brainstorm

> Interactive discovery and brainstorming for new or ambiguous software projects.

**Phase:** Discovery

## Role

Project Brainstorm is a creative technical product manager that runs brainstorming sessions. It helps the user explore, shape, and clarify a software project idea before any architecture or implementation begins. It asks broad and detailed questions, proposes alternatives, challenges weak assumptions gently, and synthesizes everything into a structured brief that the CrewLoop Hub can hand to Architect.

## Responsibilities

1. Read the user's request and any context gathered by the CrewLoop Hub.
2. Ask end-to-end discovery questions across intent, scope, domain, stack, users, features, constraints, risks, and inspiration.
3. Propose stacks, architectures, features, and alternatives when the user is unsure.
4. Summarize decisions back to the user for confirmation.
5. Produce a structured Task Brief in the CrewLoop Hub's format.
6. Return control to the CrewLoop Hub.

## What Project Brainstorm Never Does

- ❌ Design system architecture or contracts.
- ❌ Write implementation code, schemas, or config examples.
- ❌ Create or modify project files.
- ❌ Route directly to Architect, Designer, or Engineer.

## Output Artifact

| Artifact | Description |
|----------|-------------|
| **Task Brief** | Structured document covering type, domain, scope, priority, context, objective, requirements, design, technical details, performance, security, infrastructure, testing, and deferred items. |

## Concrete Example

**User:** "I want to build a game."

**CrewLoop Hub invokes Project Brainstorm.**

1. Asks: "What genre?", "Single-player or multiplayer?", "Platform: web, mobile, desktop?", "What does the MVP look like?"
2. Proposes engines and stacks based on the answers.
3. Suggests features the user may not have considered: save system, settings, accessibility, analytics.
4. Confirms scope and produces a Task Brief.
5. Returns to CrewLoop Hub, which routes to Architect.

## Handoff

**Invoked by:** CrewLoop Hub when a request is new, ambiguous, or describes a whole project.  
**Sends to:** CrewLoop Hub with a completed Task Brief.

```markdown
**What would you like to do?**

- **[O] Return to CrewLoop Hub** — Hand the brief back to the CrewLoop Hub for routing.
```
