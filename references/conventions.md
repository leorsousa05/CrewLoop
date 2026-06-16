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

## Letter-Based Navigation

At the end of each skill, present navigation options by letter:

```markdown
**What would you like to do?**

- **[A] Architect** — Create or update specs
- **[D] Designer** — Visual/UI design direction
- **[E] Engineer** — Implement (BUILD mode)
- **[R] Reviewer** — Code review and quality gate
- **[S] Shipper** — Commit, branch, push, PR
- **[O] Orchestrator** — New task or adjust scope
```

Use only the letters relevant to the current context.

---

## Spec Folder Structure

```
specs/
├── changes/                        # Active deltas
│   └── 001-change-name/
│       ├── .spec.yaml              # status, dates, author
│       ├── proposal.md             # WHY
│       ├── specs/                  # WHAT
│       ├── design.md               # HOW
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

---

## Mandatory Workflow

```
Orchestrator → Architect → (Designer, if UI) → Engineer → Reviewer → Shipper → Orchestrator
```

Critical rules:

- The orchestrator **always** sends to the architect first.
- The architect creates specs for **any** change.
- Designer acts **before** engineer when there is UI.
- Engineer **never** executes git operations or reviews their own code.
- Reviewer **never** writes code or runs git operations.
- Shipper is the only one responsible for commit, branch, push, and PR.

---

## AFK Mode

When the user explicitly activates AFK mode, skills route automatically through the workflow without presenting navigation menus.

### Activation phrases

Case-insensitive matches: `AFK`, `estarei AFK`, `modo AFK`, `vou ficar AFK`.

When activated, set `afk: true` in `MEMORY.md` so subsequent skills know the mode is active. AFK mode resets when the workflow returns to Orchestrator after shipping, or when the user explicitly disables it.

### Role prefixes

Every skill response must start with its prefix on its own line:

| Skill | Prefix |
|-------|--------|
| Orchestrator | `[ORCHESTRATOR TALKING]` |
| Architect | `[ARCHITECT ANALYZING]` |
| Designer | `[DESIGNER DESIGNING]` |
| Engineer | `[ENGINEER BUILDING]` |
| Reviewer | `[REVIEWER REVIEWING]` |
| Shipper | `[SHIPPER SHIPPING]` |

### Automatic routing

When AFK mode is active, each skill proceeds to the next role in the standard workflow without waiting for user confirmation:

```
Orchestrator → Architect → (Designer, if UI) → Engineer → Reviewer → Shipper → Orchestrator
```

---

## Patterns We Follow

| Pattern | How We Apply It |
|---------|---------------|
| **SDD (Spec-Driven Development)** | Specs in `specs/` are the source of truth. |
| **DDD (Domain-Driven Design)** | Organization by bounded contexts. |
| **CDD (Contract-Driven Development)** | Contracts, interfaces, and explicit types. |
| **TDD (Test-Driven Development)** | Tests before or alongside implementation. |
| **Context Engineering** | Semantic names; understand function by reading ≤2 adjacent files. |
