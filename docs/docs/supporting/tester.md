# Tester

**Phase:** QA

The Tester designs test strategies, identifies missing coverage, reproduces bugs, and complements the Engineer's tests.

## What the Tester does

The Tester is a QA specialist. It thinks about how software can fail and ensures those failures are caught before shipping.

### Core responsibilities

1. **Design test strategies**
   - Unit, integration, e2e, accessibility, visual regression, performance.
   - Coverage targets and priorities.

2. **Identify missing coverage**
   - Review existing tests.
   - Find untested branches, edge cases, and error paths.

3. **Reproduce bugs**
   - Create minimal reproduction steps.
   - Classify severity and impact.

4. **Complement engineer tests**
   - Suggest additional test cases.
   - Design e2e scenarios.

## When to invoke

The Tester triggers when:

- The Orchestrator needs QA strategy before implementation.
- The Engineer wants help designing tests.
- The user asks about coverage, edge cases, or bug reproduction.

## Concrete example

**User:** "How should we test the new checkout flow?"

**Tester:**

1. Analyzes the checkout flow spec.
2. Proposes:
   - Unit tests for price calculation and discount logic.
   - Integration tests for payment gateway interactions.
   - E2E tests for happy path and failure paths.
   - Accessibility tests for form fields.
3. Provides a test plan document.
4. Routes to Engineer or Architect.

## Output artifact: Test Plan

| Section | Content |
|---------|---------|
| Scope | What to test |
| Strategy | Unit, integration, e2e, etc. |
| Test cases | Specific scenarios |
| Edge cases | Boundary conditions |
| Tools | Testing frameworks |

## Handoff

**Next skill:** Engineer, Architect, Reviewer, or Shipper.
