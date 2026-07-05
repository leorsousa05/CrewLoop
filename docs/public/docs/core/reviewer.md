---
sidebar_position: 5
---

# Reviewer

> Quality gate. The last line of defense before code reaches the repository.

**Phase:** Review

## Role

The Reviewer audits every diff for spec compliance, code quality, security, performance, and AI artifacts. It is the single gate between Engineer and Shipper. It never writes code or fixes issues itself.

## Responsibilities

1. Check git status and diff to confirm there are changes to review.
2. Read changed files in full — the diff alone is not sufficient context.
3. Read the spec to verify the implementation matches the contract.
4. Evaluate code quality: SOLID principles, clean code, complexity, error handling.
5. Check test coverage: new logic must have tests; no new branches without assertions.
6. Scan for security issues: hardcoded secrets (`API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`), unsafe patterns, OWASP Top 10.
7. Scan for AI artifacts: `console.log`, `TODO` without issue reference, placeholder comments, empty catch blocks, "Written by AI" comments.
8. Produce a review report with a clear verdict and specific file/line references for every issue.

## What Reviewer Never Does

- ❌ Write code or fix issues (returns to Engineer).
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

**Reviewer reviews JWT login diff:**
1. Verifies that implementation files match the spec requirements.
2. Identifies:
   - `console.log` in `auth.ts` line 42 — CRITICAL (must remove before ship).
   - JWT secret compared with `==` instead of `crypto.timingSafeEqual` — CRITICAL (timing attack vulnerability).
   - Missing `aria-describedby` on error message — WARNING.
3. Returns `Changes Required` report to Engineer.

## Handoff

**Invoked by:** Engineer.  
**Sends to:** Shipper (approved), Engineer (code fixes needed), Architect (design-level issue), Security-Guard (security concerns), Accessibility-Auditor (accessibility concerns).

```markdown
**What would you like to do?**

- **[S] Send to Shipper** — Commit and ship the documentation (if approved)
```
