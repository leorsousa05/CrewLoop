# Design: `crewloop:code-review` Skill

## Architecture

Additive, documentation-only change. One new supporting skill folder plus edits to existing reference/registry files. No runtime code changes.

```
skills/crewloop-code-review/
├── SKILL.md                              # new — the skill definition
└── references/
    └── code-review-checklist.md          # new — audit dimensions & severity rubric
```

### Skill classification

`crewloop:code-review` is a **supporting** skill (like `crewloop:docs`), not a core phase:

- Invoked on demand by `crewloop:plan` (or directly by the user).
- Returns to its invoker; default return target is `crewloop:plan`.
- Never inserted into the mandatory loop `plan → design? → code ⇄ review → ship`.

### Separation of concerns (contract)

| Skill | Input | Output | Routes to |
|-------|-------|--------|-----------|
| `crewloop:review` (existing, narrowed) | uncommitted diff + active spec | Review Report with PASS/FAIL verdict | `crewloop:ship` on PASS, `crewloop:code` on FAIL |
| `crewloop:code-review` (new) | entire codebase or user-scoped paths | Code Debt Report (findings, severity, remediation suggestions) | invoker (default `crewloop:plan`) |

### Keyword partition (frontmatter descriptions)

- `crewloop:review` keeps: `'review'` after BUILD, `'check the code'` (changed code), `'quality check'`, `'quality gate'` — anchored to **the current diff / pending change / after BUILD**.
- `crewloop:code-review` takes: `'code debt'`, `'tech debt'`, `'audit'`, `'review the codebase'`, `'find code smells'`, `'duplication'`, `'dead code'`, `'whole codebase review'`, `'analyze code quality'` — anchored to **the entire codebase, independent of any diff**.

## File Changes

### 1. `skills/crewloop-code-review/SKILL.md` (new)

Copied from `assets/templates/skill-template.md`, with:

- **Frontmatter:**
  ```yaml
  name: crewloop:code-review
  description: Whole-codebase audit skill. Use when the user asks to review the entire codebase, find code debt, tech debt, code smells, duplication, dead code, complexity hotspots, or analyze overall code quality — independent of any pending change. Produces a Code Debt Report. Never for reviewing a pending diff (that is crewloop:review), writing code, or git operations.
  ```
- **Role prefix:** `> 🧹 **CrewLoop Code Review**`
- **TRANSITION CONTRACT:** `Default invoker: crewloop:plan`; `Direct route: crewloop:plan`; `AFK route: crewloop:plan`.
- **MODE:** AUDIT only. NEVER write code. NEVER run git operations. NEVER review a pending diff (route that to `crewloop:review` semantics via report note).
- **WORKFLOW:**
  1. Scope resolution: default = whole repo minus `.gitignore`d and build dirs (`node_modules/`, `dist/`, `build/`); accept user-provided path subset.
  2. Parallel read-only probes for each audit dimension (see checklist reference).
  3. Findings aggregation with severity rubric.
  4. Emit Code Debt Report (markdown template below).
  5. Return to invoker / `crewloop:plan`.
- **Code Debt Report format:**
  ```markdown
  ## 🧹 Code Debt Report
  | Detail | Description |
  | :--- | :--- |
  | **Scope** | [paths audited] |
  | **Overall Health** | [Good / Fair / Poor] |
  | **Findings** | [count by severity] |

  ### Findings
  | Severity | File:Line | Category | Finding | Suggested remediation |
  ```
- **ANTI-PATTERNS:** ❌ fixing code during audit; ❌ reviewing only the git diff; ❌ findings without file/line; ❌ routing to `crewloop:ship` or `crewloop:code`; ❌ aspirational findings without evidence.

### 2. `skills/crewloop-code-review/references/code-review-checklist.md` (new)

Audit dimensions with detection heuristics and severity rubric (Critical/High/Medium/Low):
- **Duplication** — repeated blocks across files.
- **Dead code** — unreferenced exports, unreachable branches.
- **File/function size** — >300 lines per file (per conventions.md), long functions.
- **Complexity hotspots** — deep nesting, high cyclomatic complexity.
- **Missing tests** — files matching TDD-skip-criteria "WRITE TEST" side without tests.
- **Dependency rot** — outdated/unused dependencies.
- **Error handling gaps** — empty catch blocks, swallowed errors.
- **Style drift** — violations of `references/conventions.md` §Shared Code Style.

### 3. `skills/crewloop-review/SKILL.md` (edit)

- Frontmatter description narrowed, e.g.: `Pre-ship diff review and quality gatekeeper. Use after BUILD or when the user says 'review', 'check the code', 'quality check' for pending changes. Inspects the current diff and changed files for spec compliance, quality, tests, security, performance and AI artifacts. For a whole-codebase audit or code-debt analysis, use crewloop:code-review. Never for git operations or implementation.`
- ROLE paragraph: add one sentence clarifying scope boundary ("For whole-codebase audits independent of a diff, that is `crewloop:code-review`."). No other behavioral edits.

### 4. `references/skill-contracts.yaml` (edit)

Append:
```yaml
  crewloop:code-review:
    kind: supporting
    prefix: "> 🧹 **CrewLoop Code Review**"
    default_invoker: "crewloop:plan"
    return_strategy: invoker
    interactive: false
    direct_target: "crewloop:plan"
    afk_target: "crewloop:plan"
```

### 5. `references/workflow.md` (edit)

- Team Roles table: add row for `CrewLoop Code Review` → whole-codebase audit.
- Supporting Skills section: document invoker/return semantics.
- Mermaid diagram: add `CR["🧹 CrewLoop Code Review"] --> P` edge alongside Docs.

### 6. `references/conventions.md` (edit)

- Transition Contract table: add `crewloop:code-review` → `crewloop:plan` (invoker).
- Supporting Skills table: add row (`crewloop:code-review` | `crewloop:plan` | invoker / `crewloop:plan`).
- AFK role-prefix table: add `> 🧹 **CrewLoop Code Review**`.

### 7. `AGENTS.md` (edit)

- "The 6 Skills" section → retitle to "The Skills"; add `crewloop:code-review` to the Supporting Skills table with its invocation trigger.
- Bundle Lock-In rule 10: replace hard-coded "6 skills" with "the skills registered in `references/skill-contracts.yaml`".
- Repository Structure tree: add `crewloop-code-review/` under `skills/`.

### 8. `README.md` (edit)

- Skill list / team section: add `crewloop:code-review` with one-line description, mirroring the AGENTS.md wording.

## Contracts / Interfaces

Frontmatter contract (validated by `scripts/validate-skills.py`):

```yaml
---
name: crewloop:code-review        # exactly crewloop:<slug>, dir = crewloop-<slug>
description: <trigger-rich text>  # must not overlap crewloop:review's diff scope
---
```

`skill-contracts.yaml` entry schema (per existing entries): `kind`, `prefix`, `default_invoker`, `return_strategy`, `interactive`, `direct_target`, `afk_target`.

## Edge Case & Error Handling Matrix

| Entry point | Scenario | Expected behavior |
|-------------|----------|-------------------|
| Skill trigger | User says "review" with no diff and no pending change (ambiguous) | Descriptions disambiguate: pre-ship/diff context → `crewloop:review`; whole codebase → `crewloop:code-review`. New SKILL.md notes ambiguous cases default to `crewloop:plan` routing. |
| Audit scope | User provides no path scope | Skill audits whole repo, excluding `.gitignore`d and build dirs. |
| Audit scope | User provides nonexistent path | Report states scope resolution failure, lists attempted paths, returns to invoker — no crash, no fabricated findings. |
| Audit scope | Empty repo / no source files | Report: 0 findings, Overall Health "N/A — nothing to audit". |
| Findings | Zero findings | Report still emitted with empty findings table and explicit "no debt found" statement. |
| Findings | Very large codebase (thousands of files) | Findings capped per severity category (top N by severity) with a count of remaining; full list never truncated silently. |
| Validation | `validate-skills.py` run on a machine without Python deps | Task verification documents fallback: manual frontmatter check. |
| Concurrency | Parallel audit probes | Read-only only; probes must not write files or run git mutations. |
| Permissions | Unreadable files/dirs during audit | Skipped paths listed in report under "Excluded"; audit continues. |

## Verification

- `python scripts/validate-skills.py` exits 0.
- `git diff --stat` shows only the files listed in `.spec.yaml` touched.
