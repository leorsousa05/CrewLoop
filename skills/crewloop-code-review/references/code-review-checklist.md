# Code Review Checklist — Audit Dimensions & Severity Rubric

Reference for `crewloop:code-review`. Each dimension lists detection heuristics. Every finding must cite `file:line` evidence.

---

## Audit Dimensions

### 1. Duplication
- Repeated blocks (≥5 similar lines) across files.
- Copy-pasted functions with renamed variables.
- Parallel implementations of the same logic in different modules.

### 2. Dead Code
- Exported symbols never imported anywhere.
- Unreachable branches (code after `return`/`throw`, impossible conditions).
- Unused parameters, variables, and files.

### 3. File & Function Size
- Files >300 lines or with more than one responsibility (per `references/conventions.md` §Shared Code Style).
- Functions >50 lines or deeply sequential "do everything" bodies.

### 4. Complexity Hotspots
- Nesting depth >3.
- High cyclomatic complexity (many `if`/`switch`/loops per function).
- Long boolean chains and nested ternaries.

### 5. Missing Tests
- Files that meet the "WRITE TEST" criteria in `references/conventions.md` §TDD Skip Criteria (branching, side effects, external deps, public API) without a corresponding test file.

### 6. Dependency Rot
- Dependencies declared but never imported.
- Duplicate/overlapping dependencies.
- Pinned ancient versions where the project otherwise tracks current ones.

### 7. Error Handling Gaps
- Empty `catch` blocks (also an AI artifact per conventions).
- Swallowed errors (catch that only logs, then continues silently).
- Missing error paths on I/O boundaries.

### 8. Style Drift
- Violations of `references/conventions.md` §Shared Code Style: unclear names, hidden side effects, implicit behavior.
- Inconsistent formatting or patterns diverging from the module's established style.

---

## Severity Rubric

| Severity | Criteria | Examples |
|----------|----------|----------|
| **Critical** | Correctness or security risk; data loss possible; secrets exposed | Swallowed errors on payment path, hardcoded credentials, unreachable error handling |
| **High** | Likely bug source or major maintainability blocker | Large duplication of business logic, missing tests on public API, dead code in hot paths |
| **Medium** | Debt that slows change but is not dangerous today | Oversized files, complexity hotspots, dependency rot |
| **Low** | Cosmetic or local inconsistency | Style drift, minor naming issues, small duplicated snippets |

---

## Reporting Rules

- One row per finding in the Code Debt Report; never aggregate unrelated findings.
- Suggested remediation must be actionable ("extract shared helper into X"), not aspirational ("improve this").
- On large codebases, list the top N findings per severity and state the remaining count explicitly.
