# Security Guard

**Phase:** Security Review

The Security Guard performs focused security audits of changed files and reports findings with severity and remediation steps.

## What the Security Guard does

The Security Guard is a deep-dive security specialist. It reviews code for secrets, injection risks, authentication/authorization boundaries, dependency vulnerabilities, and infrastructure exposure.

### Core responsibilities

1. **Scan for secrets**
   - API keys, tokens, passwords, private keys, and `.env` files.
   - Hard-coded credentials and leaked configuration.

2. **Check for injection risks**
   - SQL injection, command injection, XSS, path traversal.
   - Unsanitized user input reaching sensitive sinks.

3. **Verify auth and authz**
   - Protected endpoints, session handling, OAuth/JWT usage.
   - Privilege escalation and missing authorization checks.

4. **Review dependencies**
   - New packages and supply-chain risks.
   - Known vulnerable versions or suspicious publishers.

5. **Inspect infrastructure**
   - CORS, CSP, security headers, secrets in CI/CD.
   - Production exposure and network boundaries.

## When to invoke

The Security Guard triggers when:

- The Orchestrator or Reviewer detects security-sensitive work.
- The user asks about security review, audit, secrets, auth, vulnerabilities, or supply chain.
- The change involves payments, PII, health data, authentication, new dependencies, or production exposure.

## Concrete example

**User:** "Can you review the new auth flow for security issues?"

**Security Guard:**

1. Reads the changed files and the spec.
2. Scans for hard-coded secrets and insecure token storage.
3. Checks password handling and session configuration.
4. Reviews dependency changes for known vulnerabilities.
5. Produces a Security Review Report with severity and remediation steps.
6. Routes to Engineer or Reviewer.

## Output artifact: Security Review Report

| Section | Content |
|---------|---------|
| Scope | Files and surfaces reviewed |
| Findings | Issues with severity and evidence |
| Remediation | Concrete steps to fix each issue |
| Verdict | PASS / WARN / FAIL |

## Handoff

**Next skill:** Engineer, Reviewer, or Orchestrator.
