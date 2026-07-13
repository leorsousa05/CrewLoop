# Design: Direct Skill Routing

## Overview
Replace hub-mediated phase transitions with direct skill-to-skill routing. Each skill owns
its ending: it presents an interactive menu (`ask_question`, markdown fallback) whose
options are the valid next steps from that point in the flow, with the outcome-appropriate
option marked "(Recommended)". The CrewLoop Hub keeps exactly two roles: entry point for
new tasks (discovery → Architect) and automatic router in AFK mode. The canonical contract
lives in `references/conventions.md`; every skill file applies it verbatim.

## Proposed Directory & File Structure
```
crewloop/
├── references/
│   ├── conventions.md                (Modified — new Direct Routing section, rewritten workflow + lock-in rules)
│   └── workflow.md                   (Modified — linear-chain diagram, rewritten routing rules)
├── AGENTS.md                         (Modified — flow section, rules 7/9, AFK, How to Contribute)
├── skills/
│   ├── crewloop-hub/SKILL.md         (Modified — drop mid-flow handback; keep entry + AFK routing)
│   ├── architect/SKILL.md            (Modified — handoff recommends /designer or /engineer)
│   ├── designer/SKILL.md             (Modified — handoff recommends /engineer)
│   ├── engineer/SKILL.md             (Modified — dynamic ending menu)
│   ├── reviewer/SKILL.md             (Modified — verdict-based ending menu; flow checklist updated)
│   ├── shipper/SKILL.md              (Modified — end-of-flow menu)
│   ├── tester/SKILL.md               (Modified — invoker-return menu)
│   ├── maintainer/SKILL.md           (Modified — recommends /architect for bug pipeline)
│   ├── docs-writer/SKILL.md          (Modified — invoker-return menu)
│   ├── researcher/SKILL.md           (Modified — invoker-return menu)
│   ├── product-manager/SKILL.md      (Modified — invoker-return menu)
│   ├── security-guard/SKILL.md       (Modified — invoker-return menu)
│   ├── accessibility-auditor/SKILL.md (Modified — invoker-return menu)
│   ├── schema-designer/SKILL.md      (Modified — invoker-return menu)
│   ├── frontend-architect/SKILL.md   (Modified — invoker-return menu)
│   ├── devops-specialist/SKILL.md    (Modified — invoker-return menu)
│   ├── project-brainstorm/SKILL.md   (Modified — recommends /architect with the brief)
│   ├── long-term-manager/SKILL.md    (Modified — invoker-return menu)
│   └── diamondblock/SKILL.md         (Modified — invoker-return menu)
└── specs/
    └── decisions/
        └── 002-direct-skill-routing.md (New — ADR)
```

## Code Architecture & Design Patterns
- **Architecture Model:** Convention-over-configuration. One canonical navigation contract
  in `references/conventions.md` (single source of truth); skill files are mechanical
  instantiations of it. This mirrors the existing pattern where conventions.md owns shared
  rules and skills reference it.
- **Design Patterns Used:**
  - **Strategy** — the ending menu is a per-skill strategy: same interface (menu block +
    command recommendation), different option set per role and outcome.
  - **State Machine** — the workflow is modeled as states (skills) with explicit
    transitions (menu options); the transition table below is the contract. Dynamic
    recommendation = state-dependent default transition.
  - **Template Method** — every ending follows the same skeleton: summary → `ask_question`
    menu → (on tool response) command recommendation → end turn. Skills fill in the options.

## Data Model
The "data" of this change is the transition contract. Formal definition:

```typescript
// One entry per skill state.
interface SkillTransition {
  skill: string;                 // SKILL.md this applies to
  interactive: boolean;          // false = non-interactive (architect, designer): no menu, direct recommendation
  options: MenuOption[];         // valid next steps, in display order
}

interface MenuOption {
  key: string;                   // letter key, e.g. "R"
  label: string;                 // e.g. "Send to Reviewer"
  command: string;               // slash command recommended, e.g. "/reviewer"
  recommendedWhen: string;       // outcome condition that marks this option "(Recommended)"
}
```

### Transition Table (the contract)

| Skill | Mode | Options (key → command) | Recommended when |
|-------|------|------------------------|------------------|
| crewloop-hub | entry | `[A]` → /architect, `[B]` → /project-brainstorm (ambiguous idea), `[T]` → /long-term-manager (multi-session) | `[A]` for any well-scoped task |
| architect | non-interactive | → /designer or /engineer | /designer if spec touches UI, else /engineer |
| designer | non-interactive | → /engineer | always |
| engineer | interactive | `[R]` → /reviewer, `[E]` → keep implementing, `[A]` → /architect | `[R]` when all tasks checked and verification passed |
| reviewer | interactive | PASS: `[S]` → /shipper, `[E]` → /engineer. FAIL: `[E]` → /engineer, `[S]` → /shipper | `[S]` on PASS; `[E]` on FAIL |
| shipper | interactive | `[N]` → /crewloop-hub (new task), `[D]` → done | `[D]` after successful push |
| maintainer | interactive | `[A]` → /architect (lightweight bug spec), `[H]` → /crewloop-hub | `[A]` for confirmed bugs |
| project-brainstorm | interactive | `[A]` → /architect, `[H]` → /crewloop-hub | `[A]` once brief is complete |
| supporting skills (see below) | interactive | `[I]` → invoker command, `[H]` → /crewloop-hub | `[I]` always |

### Default Invoker Table (supporting skills)

| Supporting skill | Default invoker | Command |
|------------------|-----------------|---------|
| security-guard | reviewer | /reviewer |
| accessibility-auditor | reviewer | /reviewer |
| schema-designer | architect | /architect |
| frontend-architect | designer | /designer |
| devops-specialist | shipper | /shipper |
| tester | engineer | /engineer |
| docs-writer | crewloop-hub | /crewloop-hub |
| researcher | crewloop-hub | /crewloop-hub |
| product-manager | crewloop-hub | /crewloop-hub |
| long-term-manager | crewloop-hub | /crewloop-hub |
| diamondblock | crewloop-hub | /crewloop-hub |

If the user invoked a supporting skill from a different parent than the default, the menu
still shows both options (`[I]` invoker, `[H]` hub) and the user picks — the default only
controls which option is marked "(Recommended)".

## API Contracts
The canonical menu block (interactive skills), to be stored in `conventions.md` and
instantiated per skill:

```markdown
**What would you like to do?**

- **[R] Send to Reviewer (Recommended)** — Code review and quality check
- **[E] Keep implementing** — Return to the spec tasks
- **[A] Back to Architect** — A spec gap was found
```

Rules attached to the contract:
1. Present via `ask_question`; markdown list is the fallback.
2. Exactly one option carries "(Recommended)" — chosen by the outcome condition above.
3. **Handling Tool Responses (retained):** if the turn was triggered by the user picking a
   menu option, do NOT re-present the menu; output the bold command recommendation for the
   chosen skill (e.g. `To proceed, execute: /reviewer`) and end the turn.
4. **Mandatory Command Recommendation (retained):** every response ends with the bold
   next-command recommendation on its own line.
5. Non-interactive skills (architect, designer) skip the menu and output only the
   recommendation line.

## Flow Diagrams
### Interactive Flow (default)
1. User → `/crewloop-hub` → discovery → brief → recommends `/architect`
2. Architect writes spec → recommends `/designer` (UI) or `/engineer`
3. Designer writes design spec → recommends `/engineer`
4. Engineer implements + verifies → menu: `/reviewer` (recommended)
5. Reviewer PASS → menu: `/shipper` (recommended); FAIL → menu: `/engineer` (recommended)
6. Shipper commits/pushes → menu: new task (`/crewloop-hub`) or done
7. Supporting skill finishes → menu: invoker (recommended) or hub

### AFK Flow (unchanged mediation)
1. Skill finishes → loads CrewLoop Hub automatically (Skill tool)
2. Hub evaluates state → loads next skill automatically
3. No menus, role prefixes on every response
4. Ends when Shipper completes and returns to Hub

## State Management
No runtime state. The workflow state (which phase, PASS/FAIL) lives in the conversation
and in spec artifacts (`.spec.yaml` status, `tasks.md` checkboxes). The recommendation
logic reads that state: e.g. Engineer marks tasks complete in `tasks.md` before the menu
marks `/reviewer` as recommended; Reviewer's verdict line drives its own menu.

## Error Handling
- **User picks a non-recommended option** — valid transition; skill outputs the command
  recommendation for the picked option and ends. No second-guessing.
- **Supporting skill with unknown invoker** — fall back to the default invoker table.
- **Skill file missing the menu section** — Reviewer flags it as spec non-compliance
  (added to the Reviewer checklist).
- **AFK + interactive conflict** — AFK sections take precedence: when `afk: true`, skills
  skip menus entirely and route via the Hub, exactly as today.

## Performance Considerations
N/A — Markdown-only change. One user-facing latency improvement: one menu per transition
instead of two.

## Security Considerations
No secrets, no code, no new file types. Reviewer's existing secret/AI-artifact scan
applies unchanged to the diff.
