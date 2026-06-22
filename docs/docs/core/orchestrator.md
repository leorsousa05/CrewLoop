# Orchestrator

**Phase:** Discovery & Routing

The Orchestrator is the front door of CrewLoop. Every task — a new feature, a bug fix, a refactor, a design request, or even a vague idea — starts here. Its job is to extract every ounce of relevant context from the user before any code is written or architecture is designed.

## What the Orchestrator does

The Orchestrator acts as a technical product manager and discovery specialist. It does **not** write code, design systems, or make technical decisions. It asks, clarifies, organizes, and hands off.

### Core responsibilities

1. **Identify the task type**
   - New feature, modification, bug fix, refactor, investigation, integration, UI/UX design.

2. **Gather context**
   - Project/framework, existing codebase, patterns, conventions, relevant files.
   - Existing specs, docs, or ADRs.

3. **Clarify the change**
   - Current behavior vs. desired behavior.
   - Inputs, outputs, edge cases, error states.

4. **Capture goals and constraints**
   - Primary goal, non-functional requirements, hard constraints.
   - What must **not** change.

5. **Explore design and architecture**
   - Preferred patterns, architecture style, reusability.
   - Integration points with existing systems.

6. **Define UI/UX direction (if applicable)**
   - Visual style, animation preferences, design system, responsive requirements.
   - Accessibility, dark mode, typography, color palette.

7. **Consolidate into a structured brief**
   - The brief is the single artifact produced by the Orchestrator.
   - It is passed verbatim to the Architect.

## When to invoke

The Orchestrator triggers automatically when the user says things like:

- "Build a login page"
- "Fix this bug"
- "Refactor this module"
- "Design a dashboard"
- "Add OAuth"
- "Why is this slow?"
- "I have an idea for a feature"

## Concrete example

**User:** "Add a login page to my React app."

**Orchestrator:**

1. Spawns subagents to explore the project structure and read `AGENTS.md`, `conventions.md`, and `workflow.md`.
2. Asks:
   - "What authentication backend? (Firebase Auth, custom JWT, OAuth?)"
   - "What visual style? Minimalist, brutalist, corporate?"
   - "Any existing design system or component library?"
   - "Do you need password recovery, social login, or 2FA?"
3. Produces a brief with type, domain, scope, requirements, design direction, and technical details.
4. Presents the menu:
   ```
   [A] Send to Architect — Create specs and architecture
   ```

## What the Orchestrator never does

- ❌ Write code
- ❌ Design architecture
- ❌ Create UI/UX designs
- ❌ Run git operations
- ❌ Route directly to Designer or Engineer
- ❌ Mutate the project (no `Write`, `Edit`, or mutating `Bash`)

## Output artifact: Task Brief

The brief includes:

| Section | Content |
|---------|---------|
| Type | feature, modification, bugfix, refactor, investigation, integration |
| Domain | frontend, backend, fullstack, infrastructure, UI/UX |
| Scope | new or existing codebase |
| Priority | P0, P1, P2 |
| Context | Project type, framework, patterns, relevant files |
| Objective | What success looks like |
| Requirements | Functional, non-functional, constraints |
| Design & Architecture | Patterns, style, animation, references |
| Technical Details | Location, data flow, state, APIs |
| Performance | Budget, lazy loading, traffic |
| Security | Auth, sensitive data, compliance |
| Infrastructure | Platform, CI/CD, database |
| Testing | Unit, integration, e2e, accessibility |
| Deferred | Out of scope items |

## Handoff

**Next skill:** Architect (always).

The Orchestrator never sends work directly to Designer, Engineer, or Docs-Writer. The Architect is the mandatory next step for every task.

## Navigation menu example

```markdown
**What would you like to do?**

- **[A] Send to Architect** — Create specs and architectural analysis (ALWAYS the first step)
```
