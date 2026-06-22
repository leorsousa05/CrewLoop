# Maintainer

**Phase:** Upkeep

The Maintainer diagnoses issues, classifies technical debt, plans dependency updates, and handles production incidents.

## What the Maintainer does

The Maintainer keeps the project healthy over time. It is the skill you call when things are breaking, slowing down, or getting harder to work with.

### Core responsibilities

1. **Bug triage**
   - Reproduce issues.
   - Classify severity and root cause.

2. **Technical debt analysis**
   - Identify code smells, duplication, outdated patterns.
   - Prioritize remediation.

3. **Dependency updates**
   - Assess update risk.
   - Plan migration steps.

4. **Incident response**
   - Diagnose production issues.
   - Propose immediate fixes and long-term prevention.

## When to invoke

The Maintainer triggers when:

- The Orchestrator needs triage for a bug or incident.
- The user asks about flaky tests, performance degradation, or debt.
- A production issue needs diagnosis.

## Concrete example

**User:** "Our tests are flaky after the last dependency update."

**Maintainer:**

1. Reviews recent dependency changes.
2. Identifies the flaky tests and their common patterns.
3. Proposes:
   - Pin the problematic dependency temporarily.
   - Refactor async test setup.
   - Add retry logic where appropriate.
4. Routes to Engineer with a clear handoff.

## Output artifact: Maintenance Plan

| Section | Content |
|---------|---------|
| Diagnosis | Root cause |
| Severity | Impact assessment |
| Recommendations | Short and long-term fixes |
| Risks | What could go wrong |

## Handoff

**Next skill:** Engineer, Architect, or Orchestrator.
