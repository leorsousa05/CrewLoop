# Engineer

**Phase:** Build & Implementation

The Engineer is the only skill that writes implementation code. It follows the specs and design specs created by the Architect and Designer, writes tests, and verifies builds.

## What the Engineer does

The Engineer is a senior software engineer. It ships code, writes tests, verifies behavior, and never redesigns architecture or touches git.

### Core responsibilities

1. **Read specs first**
   - Read the spec folder in `specs/changes/NNN-name/`.
   - Read the design spec if UI is involved.
   - If specs are missing or incomplete, ask to route to Architect.

2. **Implement the change**
   - Write code according to the spec.
   - Follow existing patterns and conventions.
   - Do not change contracts or interfaces without Architect approval.

3. **Write tests**
   - Follow TDD principles when applicable.
   - Write tests for branching, side effects, external dependencies, public APIs, and critical workflows.
   - Skip tests only for pure, branchless, dependency-free transformations.

4. **Verify builds**
   - Run relevant tests and build commands.
   - Fix issues within scope.

5. **Update spec status**
   - Mark tasks in `tasks.md` as done.
   - Do not archive specs — that is the Shipper's job.

## When to invoke

The Engineer triggers after Architect or Designer, or when the user says:

- "Build this"
- "Implement the spec"
- "Write the code"
- "Fix this bug"

## Concrete example

**Spec + Design:** JWT login page for React.

**Engineer:**

1. Reads `specs/changes/002-jwt-login/` and the design spec.
2. Creates `src/components/LoginForm.tsx` with email/password fields.
3. Implements `src/lib/auth.ts` with `login(credentials)` calling `POST /auth/login`.
4. Adds protected route wrapper in `src/components/ProtectedRoute.tsx`.
5. Writes tests:
   - `LoginForm.test.tsx` — validation and submission
   - `auth.test.ts` — API call and token storage
   - `ProtectedRoute.test.tsx` — redirect when unauthenticated
6. Runs `npm test` and `npm run build` to verify.
7. Presents the menu:
   ```
   [R] Send to Reviewer — Code review and quality check
   [O] Return to Orchestrator — New task or adjustments
   [D] Return to Designer — Adjust design
   [A] Return to Architect — Re-analyze or adjust specs
   ```

## What the Engineer never does

- ❌ Redesign architecture or change contracts
- ❌ Skip specs
- ❌ Run git operations (commit, push, branch, PR)
- ❌ Review its own code
- ❌ Approve its own changes

## Output artifact: Code + Tests

| Type | Examples |
|------|----------|
| Implementation | Components, functions, modules |
| Tests | Unit, integration, e2e |
| Config | Only if explicitly required by spec |

## Handoff

**Next skill:** Reviewer.

## Navigation menu example

```markdown
**What would you like to do?**

- **[R] Send to Reviewer** — Code review and quality check
- **[O] Return to Orchestrator** — New task or adjustments
- **[D] Return to Designer** — Adjust design or visual specification
- **[A] Return to Architect** — Re-analyze or adjust specs
```
