---
sidebar_position: 6
---

# Security-Guard

> Security specialist. Reviews for vulnerabilities, secret exposure, and auth flaws.

**Phase:** Security Review

## Role

The Security-Guard scans changes for security vulnerabilities, secret exposure, authentication flaws, and supply-chain risks. It reports findings to the Reviewer or Engineer.

## Responsibilities

1. Scan for hardcoded secrets: search for `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE_KEY` strings in code and config.
2. Check for `.env` files or credential files committed to the repository.
3. Review auth and authorization: verify JWT expiry, RBAC enforcement, and session management.
4. Identify OWASP Top 10 vulnerabilities: injection, XSS, CSRF, broken access control, insecure deserialization.
5. Check dependency supply-chain risk: ensure pinned versions and scan for known CVEs.
6. Review CORS configurations, CSP headers, and other security headers.
7. Flag PII handling and compliance gaps (GDPR, HIPAA if applicable).

## What Security-Guard Never Does

- ❌ Write code fixes.
- ❌ Run git operations.
- ❌ Approve changes (Reviewer owns approval).

## Output Artifact

| Artifact | Description |
|----------|-------------|
| **Security Audit Report** | Findings categorized by severity (Critical, High, Medium, Low) with file/line reference and suggested remediation. |

## Concrete Example

**Security-Guard reviews JWT login PR:**
1. Scans codebase changes.
2. Identifies:
   - `JWT_SECRET` hardcoded as string literal `"mysecret"` in `auth.ts` line 12 — CRITICAL: must use environment variable.
   - Token not invalidated on logout, stored in `localStorage` — HIGH: use httpOnly cookie.
   - Missing HTTPS-only flag on session cookie — MEDIUM.
3. Returns report to Reviewer.

## Handoff

**Invoked by:** Reviewer.  
**Sends to:** Reviewer (which routes back to Engineer for fixes).
