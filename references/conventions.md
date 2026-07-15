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

## Letter-Based Navigation & Direct Routing

Skills route **directly** to the next skill in the flow. Each skill owns its ending: it
presents the valid next steps from its position, and the user decides. The CrewLoop Hub
mediates only as the **entry point for new tasks** and as the **automatic router in AFK
mode** — never in the middle of an interactive flow.

### Presentation Guidelines
- **Prioritize Interactive Tool:** Call the `ask_question` tool to present navigation options as selectable choices in an interactive modal.
- **Text Fallback:** If `ask_question` is not supported by your environment or fails, print the letter-based options as a standard markdown list at the end of your response.
- **Handling Tool Responses:** If your current turn is triggered by a tool response from a previous `ask_question` navigation/routing call (e.g. user selected a menu option in the modal), do NOT present the navigation menu or call `ask_question` again. Instead, immediately continue into the chosen next skill without asking the user to type anything.
- **Direct Handoff:** After a menu selection, the response must not include a slash command, command label, or instruction for the user to manually invoke the next skill.

### The Transition Contract

Each interactive skill ends with a menu of the valid next steps from its position in the flow. Exactly
one option is marked `(Recommended)`, chosen by the phase outcome.

| Skill | Options (key → next skill) | Recommended when |
|-------|------------------------|------------------|
| crewloop-hub (entry) | `[A]` → Architect, `[B]` → Project-Brainstorm, `[T]` → Long-Term Manager | `[A]` for any well-scoped task |
| architect (non-interactive) | → Designer or Engineer | Designer if the spec touches UI, else Engineer |
| designer (non-interactive) | → Engineer | always |
| engineer | `[R]` → Reviewer, `[E]` → keep implementing, `[A]` → Architect | `[R]` when all tasks are checked and verification passed |
| reviewer | `[S]` → Shipper, `[E]` → Engineer | `[S]` on PASS, `[E]` on FAIL |
| shipper | `[N]` → CrewLoop Hub (new task), `[D]` → done | `[D]` after a successful push |
| maintainer | `[A]` → Architect, `[H]` → CrewLoop Hub | `[A]` for confirmed bugs (lightweight spec) |
| project-brainstorm | `[A]` → Architect, `[H]` → CrewLoop Hub | `[A]` once the brief is complete |
| supporting skills | `[I]` → invoker, `[H]` → CrewLoop Hub (or `[C]` → continue, when the invoker already is the Hub) | `[I]` always |

**Default invokers for supporting skills** (controls which option is recommended; if the
user invoked the skill from a different parent, both options are shown and the user picks):

| Supporting skill | Default invoker | Next skill |
|------------------|-----------------|---------|
| security-guard | reviewer | Reviewer |
| accessibility-auditor | reviewer | Reviewer |
| schema-designer | architect | Architect |
| frontend-architect | designer | Designer |
| devops-specialist | shipper | Shipper |
| tester | engineer | Engineer |
| docs-writer | crewloop-hub | CrewLoop Hub |
| researcher | crewloop-hub | CrewLoop Hub |
| product-manager | crewloop-hub | CrewLoop Hub |
| long-term-manager | crewloop-hub | CrewLoop Hub |
| diamondblock | crewloop-hub | CrewLoop Hub |

When DiamondBlock is configured and installed, the CrewLoop Hub should use it first and repeatedly for session memory, prior decisions, semantic codebase search, and other read-only discovery before broad file-by-file inspection.

### Menu Block Format

```markdown
**What would you like to do?**

- **[R] Send to Reviewer (Recommended)** — Code review and quality check
- **[E] Keep implementing** — Return to the spec task list
- **[A] Back to Architect** — A spec gap was found
```

Rules:
1. Present via `ask_question`; markdown list is the fallback.
2. Exactly one option carries `(Recommended)` — chosen by the outcome condition in the transition table.
3. Non-interactive skills (Architect, Designer) skip the menu and hand off directly to the next skill.
4. Every menu must offer a fallback so there are no dead ends (invoker, `[C] Continue` to keep iterating, or the Hub for a new task).
5. The recommended next skill at the end of each skill's navigation section uses that skill's recommended target (e.g. `Reviewer`), never a hardcoded `/crewloop-hub` unless the Hub is the recommended target.

#### CrewLoop Hub Entry Menu (new tasks only)
The Hub presents this menu only after interactive discovery for a new task. AFK mode never presents menus:

```markdown
**What would you like to do?**

- **[A] Send to Architect (Recommended)** — Create or update specs (always the first step)
- **[B] Send to Project-Brainstorm** — Interactive discovery for a new or ambiguous idea
- **[T] Send to Long-Term Manager** — Durable tracking for a multi-session project
```

---

## Spec Folder Structure

```
specs/
├── changes/                        ← Active deltas
│   └── 001-change-name/
│       ├── .spec.yaml              ← status, dates, author
│       ├── proposal.md             ← WHY (skipped for lightweight specs)
│       ├── specs/                  ← WHAT (skipped for lightweight specs)
│       ├── design.md               ← HOW (skipped for lightweight specs)
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
└── templates/                      ← Reusable templates
    ├── proposal-template.md
    ├── spec-delta-template.md
    ├── design-template.md
    └── tasks-template.md
```

Rules:

- Every spec lives inside `specs/changes/NNN-name/`. Never directly in `specs/`.
- `living/` reflects the current state of the system.
- `archive/` preserves completed changes for audit.
- `decisions/` records irreversible architectural choices.
- **Lightweight Specs (for bugs):** Bug fixes under any category require a lightweight specification. A lightweight spec requires only `.spec.yaml` and `tasks.md` in `specs/changes/NNN-bug-name/`. `proposal.md`, `design.md`, and the `specs/` folder are omitted.

---

## Mandatory Workflow (Direct Routing)

The flow is a linear chain with dynamic branches. Skills hand off directly to the next
skill per the transition contract; the user confirms each transition via the ending menu.
The CrewLoop Hub mediates only at task entry and in AFK mode.

```
CrewLoop Hub (entry) → Architect → Designer (if UI) → Engineer ⇄ Reviewer → Shipper → done
                                                            ↑________ FAIL ________|
Supporting skills → back to the invoking skill
Maintainer / Project Brainstorm → Architect after confirmed triage / completed brief
New task → CrewLoop Hub
```

---

## Optional Runtime Lifecycle (DiamondBlock)

DiamondBlock is an OPTIONAL, non-blocking runtime layer. Installing the skill does not
activate it — runtime behavior depends exclusively on the MCP capabilities exposed in the
agent's tool registry, never on binary, package, or config-file presence.

- **Capability-based detection:** skills inspect their own tool registry for the DiamondBlock MCP tools (`get_context`, `search_memory`, `save_memory`, `update_memory`, `log_session`, `index_codebase`). Skill installed ≠ MCP active.
- **Startup context:** when capabilities are exposed, the CrewLoop Hub loads `diamondblock` directly before broad manual discovery to retrieve session context; ordinary explore subagents remain the fallback.
- **Repeated targeted search:** the Hub may return to DiamondBlock repeatedly with targeted semantic queries (prior decisions, semantic memory, codebase search) during discovery.
- **Confirmed-decision persistence:** memories are saved only after user confirmation or acceptance into a spec/ADR, after a search-before-save check, and only as short, distilled, non-secret records with project scope and provenance. Never save raw chat, transient hypotheses, command output, tokens, or source payloads.
- **Wrap-up logging ownership:** outside AFK, Shipper invokes DiamondBlock for post-push `log_session` and then resumes its normal ending menu; in AFK, Shipper returns to the Hub and the Hub owns wrap-up logging.
- **One-warning failures:** any MCP failure produces a single warning and the normal flow continues — never blocked, never altering a successful result.
- **Manual indexing:** a missing or stale index keeps the manual `dblock index run` fallback; no skill auto-indexes.

---

## AFK Mode

When the user explicitly activates AFK mode, skills route automatically through the
workflow via the CrewLoop Hub without presenting navigation menus. **AFK is the only mode
where the Hub mediates mid-flow.**

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
| Maintainer | `> 🧰 **Maintainer**` |
| Project Brainstorm | `> 🧠 **Project Brainstorm**` |
| Long-Term Manager | `> 📅 **Long-Term Manager**` |
| DiamondBlock | `> 💎 **DiamondBlock**` |
| Docs Writer | `> 📝 **Docs Writer**` |
| Researcher | `> 🔬 **Researcher**` |
| Product Manager | `> 📊 **Product Manager**` |
| Security Guard | `> 🛡️ **Security-Guard**` |
| Accessibility Auditor | `> ♿ **Accessibility-Auditor**` |
| Tester | `> 🧪 **Tester**` |
| Frontend Architect | `> 📐 **Frontend-Architect**` |
| Schema Designer | `> 🗄️ **Schema-Designer**` |
| DevOps Specialist | `> 🛠️ **DevOps-Specialist**` |

### Automatic routing

When AFK mode is active:
1. Every non-Hub skill performs its task and returns control to the CrewLoop Hub automatically (using the Skill tool to trigger CrewLoop Hub).
2. The CrewLoop Hub automatically evaluates state and loads the next appropriate skill per the transition contract.

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
2. **Context Enclosure:** You are strictly forbidden from executing tasks, writing code, or routing workflows using arbitrary rules outside the 19 skills defined in the CrewLoop bundle.
3. **Direct Routing:** Execution skills hand off directly to the next skill per the transition contract — the CrewLoop Hub mediates only as the new-task entry point and in AFK mode. Every skill must end its turn per the contract (menu + direct handoff). If you receive a handoff that violates the transition contract (e.g. a phase skipped without the user choosing it), note the deviation and continue the correct next skill.
