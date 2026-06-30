# Design: `project-brainstorm` Skill

## Architecture & Patterns

- **Skill-as-Instruction:** The change is purely a Markdown instruction file, consistent with every other CrewLoop skill. There is no runtime code.
- **Hub-and-Spoke Routing:** `project-brainstorm` is a spoke skill. It is invoked by the Orchestrator, performs discovery, and returns control to the Orchestrator. It never routes directly to Architect, Designer, or Engineer.
- **Progressive Disclosure:** The skill asks broad questions first, then drills into specifics based on answers.
- **Idea Co-Creation:** Unlike a rigid questionnaire, the skill contributes suggestions and alternatives, treating the session as a real brainstorm.

## Directory Structure

```
skills/
└── project-brainstorm/
    └── SKILL.md          # New skill instructions
```

Updated files:

```
skills/orchestrator/SKILL.md   # Add invocation trigger and routing rule
AGENTS.md                      # Add skill entry
```

## Skill Contract

### Input

- The user's original request.
- Any context already gathered by the Orchestrator.

### Output

A structured brief in Markdown that the Orchestrator can consume and forward to Architect. The brief must include:

- **Type:** feature, modification, bugfix, refactor, investigation, integration, UI/UX design
- **Domain:** frontend, backend, fullstack, infrastructure, mobile, etc.
- **Scope:** new or existing codebase
- **Priority:** P0, P1, P2 (if known)
- **Context:** project type, framework, existing patterns
- **Objective:** 1–2 sentences describing success
- **Requirements:** functional, non-functional, constraints
- **Technical Details:** location, data flow, state, edge cases
- **Deferred / Out of Scope:** explicitly excluded items

### Trigger Conditions (from Orchestrator)

The Orchestrator invokes `project-brainstorm` when the user request matches any of:

- New project or product idea ("quero fazer um jogo", "criar um app").
- Ambiguous scope ("melhorar o dashboard", "adicionar coisas").
- Multi-domain request with unclear boundaries.
- User explicitly asks to brainstorm or explore possibilities.

### Navigation

At the end of the session, the skill presents:

```markdown
**What would you like to do?**

- **[O] Return to Orchestrator** — Hand the brief back to the Orchestrator for routing.
```

## Question Flow

The skill is not limited to 4 questions. It explores the topic end-to-end using follow-ups. Example categories:

1. **Intent & outcome** — What problem does this solve? Who is it for? What does success look like?
2. **Scope & boundaries** — What is included? What is explicitly out of scope? What is the MVP?
3. **Domain & stack** — Platform, language, framework, database, deployment preferences.
4. **Users & experience** — Target users, personas, accessibility, devices.
5. **Features & priorities** — Must-haves, nice-to-haves, later. Ask the user to rank.
6. **Constraints & risks** — Timeline, budget, performance, security, compliance, legacy dependencies.
7. **Inspiration & references** — Existing apps, competitors, design references, prior art.

The skill must also:

- Propose stacks and architectures when the user is unsure.
- Suggest features the user may not have considered.
- Challenge weak assumptions gently.
- Summarize decisions and repeat them back for confirmation.

## Test Plan

- Run `python scripts/validate-skills.py` after creating `skills/project-brainstorm/SKILL.md`.
- Verify that `skills/orchestrator/SKILL.md` still passes validation (no broken references).
- Manual review: read the new skill and confirm it follows `assets/templates/skill-template.md`.

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Skill asks too many questions and fatigues the user | Include an explicit "enough for now" option and allow the user to skip categories. |
| Skill drifts into architecture or design | Strong anti-patterns section: never design systems or UI. |
| Skill bypasses Orchestrator | Navigation menu only offers `[O] Return to Orchestrator`. |

## Deferred

- Long-term project management skill will be specified in a separate change.
- Executable helpers or templates for the brief output are not included.
