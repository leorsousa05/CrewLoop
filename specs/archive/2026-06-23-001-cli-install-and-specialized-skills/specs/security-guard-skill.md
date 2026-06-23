# Delta: security-guard supporting skill

## Current state

Security checks are a subsection of the `reviewer` skill. The reviewer scans for secrets, injection risks, auth, dependencies, and exposure, but it does not own deep-dive security analysis. There is no skill that triggers specifically on security concerns.

## Desired state

A dedicated `security-guard` supporting skill that the orchestrator (or reviewer) can route to when the change involves security-sensitive work. It performs a focused security audit and reports findings back to the reviewer or engineer.

## New files

- `skills/security-guard/SKILL.md`
- `skills/security-guard/references/security-checklist.md` (optional, reusable checklist)
- `docs/docs/supporting/security-guard.md`

## Trigger phrases

The skill activates on:

- "security review"
- "security audit"
- "check security"
- "scan for secrets"
- "supply chain"
- "dependency audit"
- "auth" / "authentication" / "authorization"
- "vulnerability"
- "secure this"
- "security guard"

It should also trigger when the user asks about:

- Storing API keys, tokens, passwords, or private keys.
- Adding authentication, OAuth, JWT, sessions.
- Handling PII, payment, or health data.
- Adding new dependencies or external services.
- Deploying to production or exposing endpoints.

## Role and responsibilities

- Deep-dive security review of changed files.
- Scan for secrets, tokens, passwords, private keys, and `.env` files.
- Check for injection risks (SQL, command, XSS, path traversal).
- Verify auth/authz boundaries.
- Review new dependencies for known vulnerabilities or supply-chain risks.
- Inspect infrastructure changes (CORS, CSP, headers, secrets in CI).
- Report findings with severity and remediation steps.

## Mode

**REVIEW only.** Analyze, judge, and report. Do not write fixes. Do not run git operations.

## Routing

- Default previous skill: reviewer or orchestrator.
- Next skills:
  - `[E] Engineer` — fix reported issues.
  - `[R] Reviewer` — return to general review after security fixes.
  - `[O] Orchestrator` — adjust scope.

## Skill structure requirements

The `SKILL.md` must include:

1. YAML frontmatter with `name: security-guard` and a trigger-rich description.
2. `ROLE` section.
3. `MODE` section with restrictions.
4. `MEMORY & CONTEXT` section invoking `obsidian-second-brain`.
5. `AFK MODE & ROLE PREFIX` section with prefix `[SECURITY-GUARD SCANNING]`.
6. `WORKFLOW` section with concrete steps and commands.
7. `RESPONSE RULES` section.
8. `ANTI-PATTERNS` section.
9. Letter-based navigation menu at the end.

## Docs page

`docs/docs/supporting/security-guard.md` mirrors the structure of `docs/docs/supporting/tester.md`:

- Phase label.
- What the skill does.
- Core responsibilities.
- When to invoke.
- Concrete example.
- Output artifact (Security Review Report).
- Handoff options.

## Acceptance criteria

- `python scripts/validate-skills.py` passes for `security-guard`.
- `cd docs && npm run build` succeeds after adding the docs page.
- `docs/sidebars.js` includes `supporting/security-guard`.
- `README.md` lists `security-guard` in the Supporting Crew table.
- `references/workflow.md` includes `security-guard` in the optional routing diagram/rules.
