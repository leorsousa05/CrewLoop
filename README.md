# Loop Engineering Agents

A team of AI skills designed to work together as a complete software development flow. Each skill represents a specialized role — from requirements discovery to deploy — ensuring no step is skipped and work is done with professional quality.

## Why I created this?

Whenever I asked an AI to create code, I felt something was missing: **process**. The AI skipped important steps: it didn't ask enough before coding, didn't document decisions, didn't think about design before implementing, and sometimes committed code without reviewing. This led to rework, poorly structured code, and lack of traceability.

So I decided to create a **team of specialized agents**, where each one has ONE clear responsibility and NEVER invades another's territory. The result is a flow where:

- **Nothing starts without context** — the orchestrator ensures all requirements are collected
- **Nothing is implemented without specs** — the architect creates technical specifications for everything, even bug fixes
- **Nothing is coded without design** — the designer defines aesthetic direction before the engineer touches the code
- **Nothing is shipped without review** — the shipper validates commits, messages, and archives specs

## The Team

### 🎯 Orchestrator — Discovery and Routing
**File:** `orchestrator/SKILL.md`

The entry point for any task. The orchestrator does not write code, design, or architect. It **asks, clarifies, and organizes**.

**What it does:**
- Collects project context (technologies, constraints, preferences)
- Identifies the task type (feature, bug fix, redesign, refactor)
- Asks about UI/UX when relevant (visual style, animations, target audience)
- Produces a **structured brief** with all requirements
- **ALWAYS routes to the architect** — no exceptions, no choice

**Golden rule:** The orchestrator NEVER sends directly to designer or engineer. Architect is always the next step.

**When it activates:** Whenever the user asks for anything related to code, design, or project changes.

---

### 🏗️ Architect — Architecture and Specs
**File:** `architect/SKILL.md`

The technical brain of the team. The architect **thinks before building** and documents everything.

**What it does:**
- Creates the `specs/` folder with organized structure (`changes/`, `archive/`, `living/`, `decisions/`)
- Produces **mandatory specs for any change** — from a 1-line bug fix to a complex feature
- Defines contracts, interfaces, data models, and APIs
- Analyzes trade-offs and records architectural decisions (ADRs)
- Follows standards: SDD (Spec-Driven), DDD (Domain-Driven), CDD (Contract-Driven), TDD

**Spec structure:**
```
specs/
├── changes/001-feature-name/
│   ├── .spec.yaml          # status, dates, author
│   ├── proposal.md         # WHY: motivation and scope
│   ├── specs/              # WHAT: delta vs current system
│   ├── design.md           # HOW: models, APIs, flows
│   └── tasks.md            # ordered implementation checklist
├── archive/                # completed specs
├── living/                 # merged source of truth
└── decisions/              # ADRs
```

**When it activates:** Always after the orchestrator. It is the **mandatory first step** of any task.

---

### 🎨 Designer — Aesthetic Direction and Design Specs
**File:** `designer/SKILL.md`

The creative eye of the team. The designer **rejects generic AI aesthetics** and creates memorable visual identities.

**What it does:**
- Chooses a **bold aesthetic direction** (brutalist, maximalist, luxury, organic, editorial, etc.)
- Defines distinctive typography (never Inter/Roboto as the main font)
- Creates bold color palettes (never cliché purple gradient)
- Specifies unexpected layouts, choreographed animations, and atmospheric textures
- Applies **technical guardrails**: accessibility (contrast 4.5:1), touch targets ≥44px, reduced motion
- Produces **8 deliverables**: aesthetic direction, color system, typography, components, layout, motion, assets, checklist

**What it DOES NOT do:**
- Does not write HTML/CSS/JS code
- Does not use generic fonts (Inter, Roboto, Arial, Space Grotesk, Poppins)
- Does not create cliché purple gradients

**When it activates:** After the architect, when the task involves UI, frontend, landing pages, dashboards, or visual components.

---

### 🔧 Engineer — Implementation and BUILD
**File:** `engineer/SKILL.md`

The hands of the team. The engineer **implements specs with precision** and nothing more.

**What it does:**
- Reads architect specs before any implementation
- Follows contracts and interfaces defined by the architect
- Writes production code with tests, documentation, and error handling
- Verifies builds and tests — fail once, fix once, still fail → STOP
- Applies TDD (writes tests before or alongside code)

**What it DOES NOT do:**
- **Never does git operations** (commit, push, branch, merge) — that's the shipper's job
- Never redesigns architecture without architect approval
- Never skips specs or invents contracts mid-implementation
- Never writes vague pseudocode

**When it activates:** After the architect (and designer, if there is UI). Receives ready specs and transforms them into code.

---

### 🚀 Shipper — Git Workflow and Deploy
**File:** `shipper/SKILL.md`

The release coordinator. The shipper **packages and ships** the completed work.

**What it does:**
- Analyzes the diff and categorizes changes (feat, fix, refactor, docs, chore, etc.)
- Generates **commit messages in the Conventional Commits standard** with rigorous validation
- Creates branches in the `type/short-description` format
- Detects and prevents secret commits (API keys, tokens, .env)
- Scans and removes AI artifacts ("Written by AI" comments, placeholders)
- **Archives specs** when committing: moves `specs/changes/` → `specs/archive/`
- Generates PR links for GitHub/GitLab/Bitbucket

**Commit validation:**
- Mandatory type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- Description in imperative: "add login" (not "added login")
- Maximum 72 characters in description
- No trailing period
- Breaking changes with `!`: `feat(api)!: remove endpoint`

**When it activates:** After the engineer, when the user wants to commit, create a PR, or "ship" the work.

---

## Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATOR                             │
│              (Collects context, creates brief)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ARCHITECT                               │
│         (Creates mandatory specs for ANY change)                │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
┌───────────────────────┐           ┌───────────────────────┐
│       DESIGNER        │           │       ENGINEER        │
│  (Aesthetic direction +│           │  (Implements specs    │
│   UI specification)   │           │   into code)          │
└───────────────────────┘           └───────────────────────┘
            │                                   │
            └─────────────────┬─────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SHIPPER                                 │
│   (Conventional commits, branch, push, PR, archives specs)      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR                               │
│                    (Next task)                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Flow rules:**
1. **Orchestrator ALWAYS sends to Architect first** — never sends directly to Designer or Engineer
2. **Architect is the gatekeeper** — creates specs and decides whether to route to Designer (UI/frontend) or Engineer (backend/code)
3. **Designer acts BEFORE Engineer** — when there is UI, the designer creates the visual specification before the engineer implements
4. **Engineer never does git** — shipper is the only one who touches the repository
5. **Specs are archived** — `specs/changes/` becomes `specs/archive/` on commit
6. **All skills return to orchestrator** — it is the central hub

## Installation

The skills are `SKILL.md` files that can be used with compatible AI agents (Claude Code, Kimi Code, etc.).

1. Clone the repository:
```bash
git clone https://github.com/leorsousa05/loop-engineering-agents.git
```

2. Copy the skills to your agent's skills directory:
```bash
# Example for Kimi Code
cp -r loop-engineering-agents/* ~/.agents/skills/
```

3. Each skill will be automatically detected and activated according to the conversation context.

## Team Principles

- **Separation of responsibilities:** Each skill does ONE thing and does it well. Never invades another's territory.
- **Specs as source of truth:** The architect documents, the designer specifies, the engineer implements, the shipper archives. Everything is traceable.
- **Quality over speed:** Nothing is skipped for being "fast". A 1-line bug fix still needs a lightweight spec.
- **Letter-based navigation:** At the end of each skill, the user chooses the next step by letter (`[A] Architect`, `[D] Designer`, `[E] Engineer`, `[S] Shipper`, `[O] Orchestrator`).
- **Resistance to shortcuts:** The skills were tested with stress tests to ensure they don't give in to pressures like "just do it quickly", "skip the design", or "commit for me".

---

**Author:** @leorsousa05  
**License:** MIT
