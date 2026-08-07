# Team Conventions

Shared conventions used by all CrewLoop skills.

---

## Conventional Commits

All commits follow the [Conventional Commits](https://www.conventionalcommits.org/) standard.

### Allowed types

`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

### Description rules

- Maximum 72 characters
- Imperative mood: "add" not "added"
- No trailing period
- Lowercase after type/scope

### Branch names

Format: `<type>/<short-description>`

- Max 50 characters for the description part
- Kebab-case (hyphens, not underscores)
- No uppercase letters

---

## Direct Routing & Auto-Handoff

Skills route **automatically** to the next skill in the flow. Each skill owns its ending: it
evaluates its outcome and hands off directly to the next appropriate skill. `crewloop:plan`
is the **entry point for new tasks** and the **AFK fallback router**; no central Hub mediates
mid-flow transitions.

### Routing Rules
- **Default is continuous routing.** Do not present end-of-skill navigation menus unless the user explicitly interrupts the flow.
- **User interrupts are explicit only.** The recognized interrupt phrases are `stop`, `pause`, `volta`, `voltar`, and `re-analyze`. When you see one of these, halt the current flow and return to `crewloop:plan`.
- **Direct handoff:** After a skill finishes, continue into the next skill without asking the user to type anything.
- **No slash commands or manual labels:** Never tell the user to invoke the next skill themselves.

### The Transition Contract

Each skill has a deterministic outgoing route defined in `references/skill-contracts.yaml`.

| Skill | Outgoing route | Condition |
|-------|----------------|-----------|
| `crewloop:plan` (entry) | `crewloop:design` or `crewloop:code` | `crewloop:design` if the spec touches UI, else `crewloop:code` |
| `crewloop:design` | `crewloop:code` | always |
| `crewloop:code` | `crewloop:review` or `crewloop:plan` | `crewloop:review` when verification passes; `crewloop:plan` after a failed build that could not be fixed |
| `crewloop:review` | `crewloop:ship` or `crewloop:code` | `crewloop:ship` on PASS, `crewloop:code` on FAIL |
| `crewloop:ship` | `done` | after a successful push |
| `crewloop:docs` | `crewloop:plan` | always returns to its invoker or `crewloop:plan` |

### Supporting Skills

| Supporting skill | Default invoker | Return target |
|------------------|-----------------|---------------|
| `crewloop:docs` | `crewloop:plan` | `crewloop:plan` |

---

## Spec Folder Structure

```
specs/
├── changes/                        ← Active deltas
│   └── 001-change-name/
│       ├── .spec.yaml              ← metadata: name, status, dates, author, affected files
│       │                             (schema: templates/spec-yaml-template.yaml)
│       ├── proposal.md             ← WHY (skipped for lightweight specs)
│       ├── specs/                  ← WHAT (skipped for lightweight specs)
│       ├── design.md               ← HOW (skipped for lightweight specs)
│       ├── design-ui.md            ← UI design spec (only when the change involves UI; written by Designer)
│       └── tasks.md                ← ordered checklist
│
├── archive/                        ← Completed changes (YYYY-MM-DD-NNN-name)
│
├── living/                         ← Merged source of truth
│   └── auth/
│       └── spec.md
│
├── decisions/                      ← ADRs
│   └── 001-architecture-choice.md
│
└── templates/                      ← Reusable templates (working copy; canonical versions
    ├── proposal-template.md         live in skills/crewloop-plan/references/templates/)
    ├── spec-delta-template.md
    ├── design-template.md
    ├── tasks-template.md
    ├── spec-yaml-template.yaml
    └── adr-template.md
```

Rules:

- Every spec lives inside `specs/changes/NNN-name/`. Never directly in `specs/`.
- `living/` reflects the current state of the system, organized as one `<domain>/` folder per bounded context. The CrewLoop Ship merges spec deltas into it when archiving a completed change (never before a CrewLoop Review PASS). The CrewLoop Plan reads it during discovery before designing anything that touches an existing domain.
- `archive/` preserves completed changes for audit.
- `decisions/` records irreversible or cross-cutting architectural choices as ADRs, written from `templates/adr-template.md` and numbered by incrementing the highest `NNN` in the folder.
- `specs/README.md` summarizes how each folder is used; the rules here remain canonical.
- **Lightweight Specs (for bugs and tweaks):** Bug fixes and small tweaks require a lightweight specification, regardless of size. A lightweight spec requires only `.spec.yaml` and `tasks.md` in `specs/changes/NNN-name/`. `proposal.md`, `design.md`, and the `specs/` folder are omitted.

---

## Mandatory Workflow (Auto-Routing)

The flow is a linear chain with dynamic branches. Skills hand off automatically to the next
skill per the transition contract; the user can interrupt the flow with explicit commands.
`crewloop:plan` is the entry point for new tasks and the AFK fallback router.

```
User request → crewloop:plan → crewloop:design (if UI) → crewloop:code ⇄ crewloop:review → crewloop:ship → done
                                  └──── no UI ────────┘
```

`crewloop:docs` is invoked on demand and returns to `crewloop:plan` when done.

---

## AFK Mode

When the user explicitly activates AFK mode, skills route automatically through the
workflow via `crewloop:plan` without presenting navigation menus.

### Activation phrases

Case-insensitive matches: `AFK`, `AFK mode`, `going AFK`.

AFK mode remains active until the workflow returns to `crewloop:plan` after shipping, or until the user explicitly disables it.

### Role prefixes

Every skill response must start with its prefix on its own line:

| Skill | Prefix |
|-------|--------|
| CrewLoop Plan | `> 🏗️ **CrewLoop Plan**` |
| CrewLoop Design | `> 🎨 **CrewLoop Design**` |
| CrewLoop Code | `> 🔧 **CrewLoop Code**` |
| CrewLoop Review | `> 🔍 **CrewLoop Review**` |
| CrewLoop Ship | `> 🚀 **CrewLoop Ship**` |
| CrewLoop Docs | `> 📝 **CrewLoop Docs**` |

### Automatic routing

When AFK mode is active:
1. Every skill performs its task and returns control to `crewloop:plan` automatically.
2. `crewloop:plan` evaluates the workflow state and loads the next appropriate skill per the transition contract.
3. The standard phase order still applies: `crewloop:plan` → `crewloop:design` (if UI) → `crewloop:code` → `crewloop:review` → `crewloop:ship`.

---

## Shared Code Style & Quality Guidelines

These rules apply to all code proposed or implemented by any agent:

| Rule | Reasoning |
|------|-----------|
| **Prefer self-documenting names** | `calculateTax(income, rate)` needs no comment. |
| **Split large files** | >300 lines or >1 responsibility = harder to understand. |
| **Make side effects visible** | Pure when possible. If mutating state, the name should say so. |
| **Clarity over cleverness** | Brevity and performance only better when proven. |
| **Be explicit** | Implicit behavior surprises the next reader. |

---

## TDD Skip Criteria

**WRITE TEST** if any:
- [ ] Branching (if/switch/loops)
- [ ] Side effects (I/O, mutation)
- [ ] External dependencies
- [ ] Public API surface

**SKIP TEST** only if ALL:
- [x] Pure function
- [x] No branching
- [x] No external deps
- [x] Simple data transformation

---

## Shared Response Style Guidelines

### Token and Output Optimization
- **Simple answers:** <150 tokens.
- **Code blocks:** only essential lines, no decorative comments.
- **Eliminate token wasters:** Avoid introductory phrases ("Here is...", "Below you will find...") and closing summaries.
- **Format:** Use bullet lists instead of paragraphs for anything with more than 2 items. One idea per sentence. No markdown inside code blocks.

### Technical Honesty & Traceability
- **No impossible solutions:** Never propose technically impossible designs. If a requirement is not viable, say so and suggest an alternative.
- **Requirement traceability:** Verify every requirement from the original prompt is addressed. List explicitly: "Addressed: X. Deferred: Y (reason)."

---

## General Anti-Patterns

Every skill avoids these. Skill-specific lists live in each SKILL.md (they extend, never replace, this one):

- ❌ AI artifacts: placeholder comments, `TODO` without an issue reference, `console.log` left in code, empty `catch` blocks, "Written by AI" comments
- ❌ Claiming verification without running it ("tests pass" without executing the suite)
- ❌ Inventing contracts, interfaces, or config values not approved in a spec
- ❌ Routing outside your own transition contract (menus, invoker returns, AFK rules)
- ❌ Committing secrets, `.env` files, or build directories (`node_modules/`, `dist/`, `build/`)

---

## Agent Interactive Tools & Capabilities

When running on platforms that support interactive agent tools, agents must prioritize calling these tools to capture inputs and control flow, falling back to raw chat text only if the tool is not supported or errors:

### 1. Interactive Questions (`ask_question`)
- **Navigation Prompts:** Instead of printing a text menu and waiting for the user to type, call `ask_question` with the transition options for the current skill (e.g. `["[R] Send to Reviewer", "[E] Keep implementing", "[A] Back to Architect"]`).
- **Discovery & Questionnaires:** For multi-step questions (e.g. scope discovery or visual styling), group them into structured multiple-choice questions via `ask_question` (using `is_multi_select: false` or `is_multi_select: true` as appropriate) to present checkboxes/radio buttons in a modal.
- **Confirmations:** Use `ask_question` to ask for confirmations (like before committing or pushing changes).

### 2. Timers & Scheduling (`schedule`)
- **Liveness monitoring:** When launching long-running processes (like background builds or tests), use the `schedule` tool to set a one-shot liveness timer (e.g. checking status after 5 minutes if it hasn't finished) instead of running manual infinite loops or polling commands.

### 3. Background Task Management (`manage_task`)
- **Async Execution:** Use `manage_task` with action `list` or `status` to inspect running background commands, and `kill` to terminate stuck processes. Avoid repetitive polling loops.

### 4. Permission Escalation (`ask_permission`)
- **Permission Requests:** If a terminal command or file read/write fails with permission errors, call `ask_permission` with the narrowest target scope required to complete the operation.

---

## CLI Output Summary Blocks

Every skill ends its final response with a summary block. The blocks below define the **required minimum fields** per skill — they are a contract of content, not of layout. Each skill may present these fields inside the richer, skill-specific format defined in its own SKILL.md; when the two differ, the skill's format wins for presentation, but every field below must appear somewhere in the output.

### 1. CrewLoop Plan — minimum fields
```markdown
## 🏗️ Discovery Brief

| Detail | Description |
| :--- | :--- |
| **Task Type** | [Modification / Bug fix / Refactor / etc.] |
| **Bounded Context** | [Core / CLI / Dashboard / etc.] |
| **Scoped Files** | [list of files] |

### 🧭 What I Did
- [Discovery summary]
- [Routing or handoff summary]

### 💬 What I Need From You
- [Question 1]
- [Question 2]

### ✨ Next Move
- [What happens next]
```

### 2. CrewLoop Plan — Spec & Design
```markdown
## 🏗️ Spec & Design

| Detail | Description |
| :--- | :--- |
| **Specs Path** | [path to spec folder] |
| **Integrations** | [External APIs / database / etc.] |

### 🧱 [Applied Patterns]
- [Pattern 1] — [Justification]

### 🚀 [Implementation Strategy]
- [Step 1]
- [Step 2]

### 🔌 Contracts & Stubs: [types, schemas, interfaces]
```

### 3. CrewLoop Design — minimum fields
```markdown
## 🎨 UI/UX Visual Specification

| Detail | Description |
| :--- | :--- |
| **Theme / Mode** | [Dark Mode / Light Mode / HSL Colors] |
| **Typography** | [Google Fonts choice] |

### 🍭 Aesthetic Direction
[Visual identity summary]

### 🧩 Layout Components
[ASCII wireframe or Component compositions]
```

### 4. CrewLoop Code — minimum fields
```markdown
## 🔧 Verification Report

| Detail | Description |
| :--- | :--- |
| **Build Status** | [PASS / FAIL] |
| **Test Coverage** | [e.g. 98% statements] |

### ✅ Implemented Checklist
- [x] [Task 1]
- [x] [Task 2]

### 📊 Test Logs & Verification Summary
[Bash execution logs brief]
```

### 5. CrewLoop Review — minimum fields
```markdown
## 🔍 Review Report

| Detail | Description |
| :--- | :--- |
| **Verdict** | [PASS / PASS WITH WARNINGS / FAIL] |
| **Risk Assessment** | [Low / Medium / High] |

### 📋 Checklist Table
| File | Compliance | Issues |
| :--- | :--- | :--- |

### ⚠️ Findings details: [critical bugs, security threats, style bugs]
```

### 6. CrewLoop Ship — minimum fields
```markdown
## 📦 Ready to Ship

| Detail | Description |
| :--- | :--- |
| **Branch** | [branch name] |
| **Commit Type** | [feat/fix/chore/etc] |

### 🗂️ Files to Commit
| File | Action | Lines |
|------|--------|-------|

### ✉️ Proposed Commit Message
```

---

## Bundle Lock-In & Self-Consistency Rules

1. **Identity Gate:** At the beginning of every turn, read this conventions file and verify that you are operating exclusively under the CrewLoop skill set. 
2. **Context Enclosure:** You are strictly forbidden from executing tasks, writing code, or routing workflows using arbitrary rules outside the 6 skills defined in the CrewLoop bundle.
3. **Auto-Routing:** Skills hand off automatically to the next skill per the transition contract. `crewloop:plan` is the entry point for new tasks and the AFK fallback router. Every skill must end its turn per the contract. If you receive a handoff that violates the transition contract (e.g. a phase skipped without a recognized interrupt), note the deviation and continue the correct next skill.
