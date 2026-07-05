---
sidebar_position: 4
---

# Engineer

> Implementation and tests. The only skill that writes code.

**Phase:** Build

## Role

The Engineer is the only skill that writes implementation code. It follows specs and design specs, writes tests, verifies builds, and never reviews its own work or touches git.

## Responsibilities

1. Read the spec folder completely before writing any code. If a spec is missing, ask to route to Architect first.
2. Read the design spec if the task involves any UI change.
3. Implement the change following existing codebase patterns and conventions. Do not change contracts without Architect approval.
4. Write tests following TDD principles: unit tests for branching and side effects, integration tests for API calls, e2e for critical user flows.
5. Verify the build passes and all tests are green.
6. Mark completed tasks in tasks.md.
7. Route to Tester if test coverage strategy is involved before proceeding to Reviewer.

### TDD skip criteria
Write a test if **ANY** of these apply:
- Branching logic (if/switch/loops)
- Side effects or I/O, state mutation
- External dependencies
- Public API surface

Skip only if **ALL** are true:
- [x] Pure function
- [x] No branching
- [x] No external deps
- [x] Simple data transformation

## What Engineer Never Does

- ❌ Redesign architecture or change public contracts without Architect approval.
- ❌ Skip reading specs.
- ❌ Run git operations (commit, branch, push, PR).
- ❌ Review its own code.
- ❌ Approve its own changes.

## Output Artifact

| Type | Examples |
|------|----------|
| **Implementation** | Components, hooks, services, utilities, modules |
| **Tests** | Unit, integration, e2e |
| **Build verification** | All tests pass, no type errors |

## Concrete Example

**Engineer implements JWT login:**
1. Creates `LoginForm.tsx` following the design spec colors and animation.
2. Creates `useAuth.ts` hook with JWT storage.
3. Creates `auth.ts` service with `POST /auth/login` call.
4. Creates `LoginForm.test.tsx` with 4 unit tests and 2 integration tests.
5. Verifies build passes locally.
6. Routes to Reviewer.

## Handoff

**Invoked by:** Architect or Designer.  
**Sends to:** Reviewer (after Tester if applicable).

```markdown
**What would you like to do?**

- **[R] Send to Reviewer** — Quality gate
```
