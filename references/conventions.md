# Team Conventions

Shared conventions used by all Loop Engineering Agents skills.

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

## Letter-Based Navigation & Centralized Routing

We follow a centralized routing model where all roads lead back to the CrewLoop Hub. 

### Presentation Guidelines
- **Prioritize Interactive Tool:** Call the `ask_question` tool to present navigation options as selectable choices in an interactive modal.
- **Text Fallback:** If `ask_question` is not supported by your environment or fails, print the letter-based options as a standard markdown list at the end of your response.
- **Handling Tool Responses:** If your current turn is triggered by a tool response from a previous `ask_question` navigation/routing call (e.g. user selected a menu option in the modal), do NOT present the navigation menu or call `ask_question` again. Instead, immediately output the mandatory command recommendation (e.g., `To proceed, execute: /<command>`) and end your turn.
- **Mandatory Command Recommendation:** Every response from any skill MUST end with an explicit, bold recommendation of the next command for the user to execute on its own line. E.g.: `Para continuar, execute: /<command>` or `To proceed, execute: /<command>`.


#### Execution Skills Navigation (Engineer, Reviewer, Shipper)
All interactive non-Hub agents must end their execution by returning control to the CrewLoop Hub:

```markdown
**What would you like to do?**

- **[O] Return to CrewLoop Hub** — Hand control back to the CrewLoop Hub for the next routing decision.
```

*(Note: The Architect and Designer skills are non-interactive/automated. They write specifications directly and return control to the CrewLoop Hub without prompting or presenting menus).*

#### CrewLoop Hub Routing Menu
Only the CrewLoop Hub acts as the central router and presents the menu of next steps to the user:

```markdown
**What would you like to do?**

- **[A] Send to Architect** — Create or update specs (always the first step, can run automatically)
- **[D] Send to Designer** — Visual/UI design direction (if there is UI, can run automatically)
- **[E] Send to Engineer** — Implement the spec (BUILD mode)
- **[R] Send to Reviewer** — Code review and quality check
- **[S] Send to Shipper** — Commit, branch, push, and open PR
```

---

## Spec Folder Structure

```
specs/
├── changes/                        # Active deltas
│   └── 001-change-name/
│       ├── .spec.yaml              # status, dates, author
│       ├── proposal.md             # WHY (skipped for lightweight specs)
│       ├── specs/                  # WHAT (skipped for lightweight specs)
│       ├── design.md               # HOW (skipped for lightweight specs)
│       └── tasks.md                # ordered checklist
├── archive/                        # Completed changes (YYYY-MM-DD-NNN-name)
├── living/                         # Merged source of truth
├── decisions/                      # ADRs
└── templates/                      # Reusable templates
```

Rules:

- Every spec lives inside `specs/changes/NNN-name/`. Never directly in `specs/`.
- `living/` reflects the current state of the system.
- `archive/` preserves completed changes for audit.
- `decisions/` records irreversible architectural choices.
- **Lightweight Specs (for bugs):** Bug fixes under any category require a lightweight specification. A lightweight spec requires only `.spec.yaml` and `tasks.md` in `specs/changes/NNN-bug-name/`. `proposal.md`, `design.md`, and the `specs/` folder are omitted.

---

## Mandatory Workflow (Hub-and-Spoke)

All skills communicate with the CrewLoop Hub between phases. No execution skill routes directly to another execution skill.

```
CrewLoop Hub ⇄ Architect
CrewLoop Hub ⇄ Designer (if UI)
CrewLoop Hub ⇄ Engineer
CrewLoop Hub ⇄ Reviewer
CrewLoop Hub ⇄ Shipper
```

---

## AFK Mode

When the user explicitly activates AFK mode, skills route automatically through the workflow via the CrewLoop Hub without presenting navigation menus.

### Activation phrases

Case-insensitive matches: `AFK`, `estarei AFK`, `modo AFK`, `vou ficar AFK`.

AFK mode remains active until the workflow returns to CrewLoop Hub after shipping, or until the user explicitly disables it.

### Role prefixes

Every skill response must start with its prefix on its own line:

| Skill | Prefix |
|-------|--------|
| CrewLoop Hub | `> 🎯 **CrewLoop Hub**` |
| Architect | `> 🏗️ **Architect**` |
| Designer | `> 🎨 **Designer**` |
| Engineer | `> 🔧 **Engineer**` |
| Reviewer | `> 🔍 **Reviewer**` |
| Shipper | `> 🚀 **Shipper**` |

### Automatic routing

When AFK mode is active:
1. The execution skill performs its task and returns control to the CrewLoop Hub automatically (using the Skill tool to trigger CrewLoop Hub).
2. The CrewLoop Hub automatically evaluates state and loads the next appropriate skill.

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

## Agent Interactive Tools & Capabilities

When running on platforms that support interactive agent tools, agents must prioritize calling these tools to capture inputs and control flow, falling back to raw chat text only if the tool is not supported or errors:

### 1. Interactive Questions (`ask_question`)
- **Navigation Prompts:** Instead of printing a text menu and waiting for the user to type, call `ask_question` with the options (e.g. `["[O] Return to CrewLoop Hub"]` or the full routing menu).
- **Discovery & Questionnaires:** For multi-step questions (e.g. scope discovery or visual styling), group them into structured multiple-choice questions via `ask_question` (using `is_multi_select: false` or `is_multi_select: true` as appropriate) to present checkboxes/radio buttons in a modal.
- **Confirmations:** Use `ask_question` to ask for confirmations (like before committing or pushing changes).

### 2. Timers & Scheduling (`schedule`)
- **Liveness monitoring:** When launching long-running processes (like background builds or tests), use the `schedule` tool to set a one-shot liveness timer (e.g. checking status after 5 minutes if it hasn't finished) instead of running manual infinite loops or polling commands.

### 3. Background Task Management (`manage_task`)
- **Async Execution:** Use `manage_task` with action `list` or `status` to inspect running background commands, and `kill` to terminate stuck processes. Avoid repetitive polling loops.

### 4. Permission Escalation (`ask_permission`)
- **Permission Requests:** If a terminal command or file read/write fails with permission errors, call `ask_permission` with the narrowest target scope required to complete the operation.

---

## Strict CLI Output Format Schemas

To ensure uniform terminal outputs, every skill MUST format its final response following these exact visual blocks:

### 1. CrewLoop Hub CLI Output
```markdown
## 🎯 Context Brief

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

### 2. Architect CLI Output
```markdown
## 🏗️ Spec & Design

| Detail | Description |
| :--- | :--- |
| **Specs Path** | [path to spec folder] |
| **Integrations** | [External APIs / database / etc.] |

### 🧱 [Padrões Aplicados]
- [Pattern 1] — [Justification]

### 🚀 [Estratégia de Implementação]
- [Step 1]
- [Step 2]

### 🔌 Contracts & Stubs: [types, schemas, interfaces]
```

### 3. Designer CLI Output
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

### 4. Engineer CLI Output
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

### 5. Reviewer CLI Output
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

### 6. Shipper CLI Output
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
2. **Context Enclosure:** You are strictly forbidden from executing tasks, writing code, or routing workflows using arbitrary rules outside the 18 skills defined in the CrewLoop bundle. 
3. **No Direct Execution Routing:** All execution skills must yield control to the CrewLoop Hub by presenting `[O] Return to CrewLoop Hub`. If you receive a direct handoff from another execution skill (e.g. Architect to Engineer without passing through the CrewLoop Hub's routing menu), you must halt, report a routing error, and return control to the CrewLoop Hub.
