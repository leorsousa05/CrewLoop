---
sidebar_position: 2
---

# Tester

> QA specialist. Designs test strategies, analyzes coverage, and reproduces bugs.

**Phase:** Quality Assurance

## Role

The Tester designs test strategies, analyzes coverage gaps, and reproduces bugs with minimal test cases. It cycles with the Engineer during implementation to ensure full test coverage before the Reviewer inspects the code.

## Responsibilities

1. Read the spec and implementation to understand the expected behavior.
2. Design test strategy: determine which layer covers which behavior (unit, integration, e2e, accessibility, performance).
3. Identify untested branches, edge cases, and error states.
4. Reproduce reported bugs with a minimal failing test case.
5. Analyze coverage gaps and flag what is missing.
6. Cycle with the Engineer: Tester finds gaps, Engineer fixes, Tester verifies.

## What Tester Never Does

- ❌ Write implementation code.
- ❌ Run git operations.
- ❌ Approve changes (Reviewer owns approval).

## Output Artifact

| Artifact | Description |
|----------|-------------|
| **Test Plan** | Testing approach per layer (unit/integration/e2e). |
| **Coverage gaps** | Documented list of untested paths and edge cases. |
| **Bug reproduction** | Minimal failing test case reproducing a bug. |
| **Recommendations** | Detailed list of what the Engineer should test next. |

## Concrete Example

**Engineer finishes search bar component:**
1. Tester reviews implementation and test files.
2. Finds that `useSearch` hook has no test for rapid input clearing.
3. Identifies that API error states (404/500) are not verified.
4. Notes keyboard navigation from input to results is not verified.
5. Returns findings to Engineer.
6. Engineer adds tests. Tester confirms coverage is complete.

## Handoff

**Invoked by:** Engineer.  
**Sends back to:** Engineer.
