---
sidebar_position: 5
---

# CrewLoop Review

> Quality gate. The last line of defense before code reaches the repository.

**Phase:** Review

## Role

`crewloop:review` audits every diff for spec compliance, code quality, security, performance, and AI artifacts. It is the single gate between `crewloop:code` and `crewloop:ship`. It never writes code or fixes issues itself.

## Responsibilities

1. Check git status and diff to confirm there are changes to review.
2. Read changed files in full — the diff alone is not sufficient context.
3. Read the spec to verify the implementation matches the contract.
4. Evaluate code quality: SOLID principles, clean code, complexity, error handling.
5. Check test coverage: new logic must have tests; no new branches without assertions.
6. Scan for security issues: hardcoded secrets (`API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`), unsafe patterns, OWASP Top 10.
7. Scan for AI artifacts: `console.log`, `TODO` without issue reference, placeholder comments, empty catch blocks, "Written by AI" comments.
8. Produce a review report with a clear verdict and specific file/line references for every issue.

## What `crewloop:review` Never Does

- ❌ Write code or fix issues (returns to `crewloop:code`).
- ❌ Run git operations.
- ❌ Approve without reading changed files.
- ❌ Approve new logic without checking for tests.

## Output Artifact

| Section | Content |
|---------|---------|
| **Verdict** | Approved / Approved with Warnings / Changes Required |
| **Critical issues** | Ship blockers with file and line reference |
| **Warnings** | Non-blocking concerns |
| **Recommendations** | Suggestions for improvement |

## Concrete Example

**`crewloop:review` reviews a JWT login diff:**
1. Verifies that implementation files match the spec requirements.
2. Identifies:
   - `console.log` in `auth.ts` line 42 — CRITICAL (must remove before ship).
   - JWT secret compared with `==` instead of `crypto.timingSafeEqual` — CRITICAL (timing attack vulnerability).
   - Missing `aria-describedby` on error message — WARNING.
3. Returns `Changes Required` report to `crewloop:code`.

## Handoff

**Invoked by:** `crewloop:code`.  
**Sends to:** `crewloop:ship` (approved), `crewloop:code` (code fixes needed), or `crewloop:plan` (design-level issue).

```markdown
**What would you like to do?**

- **[S] Send to `crewloop:ship`** — Commit and ship the change (if approved)
- **[C] Send to `crewloop:code`** — Fix implementation issues
- **[O] Return to `crewloop:hub`** — Adjust scope or requirements
```
