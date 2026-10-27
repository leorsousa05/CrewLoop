# Ship-owned memory and micro-spec

- Scope: phase 1 of the "lanes" proposal for making small tasks cheaper. Spec 067.
- Problem: Plan (step 9) and Ship (step 5) both wrote a chat-log and updated `project-state.md` for the same task; Docs wrote a third chat-log. The spec rule said "every task, even 1-line fixes" while Plan's anti-pattern said "non-trivial tasks", and Plan step 7 demanded a full edge-case matrix that the lightweight spec lacked.
- Done: Ship is the single owner of task-closing memory. Plan only adds one `## Blockers` line when a `[STOPPED]` task never reaches Ship. Docs no longer writes chat-logs.
- The lightweight spec became the official micro-spec (Objective with scope limit, Edge Cases with at least one failure scenario, AC, Done When) for low-risk fixes. Template at `specs/templates/micro-spec.md`, with a canonical copy in `skills/crewloop-plan/references/templates/`.
- Aligned AGENTS.md, conventions, workflow, specs/README, decisions README and decision-log header, `specs/shared/conventions.md`, and three docs-site pages.
- Classified outside the continuous-optimization gate (no change to context selection, budgets, stop conditions, routing, or profiles); the isolated review agreed.
- Review: first isolated review FAILed (stale "Plan writes memory" docs, a broken AC-07 command, missing canonical template); fixed in one round; second isolated review PASSed.
- Tests: `python scripts/validate-skills.py` 7/7 PASS; `crewloop validate-specs` 0 errors, 16 pre-existing warnings.
- Deferred (later phases, need a decision on the benchmark gate first): conditional reads, quick lane, lean reviewer reads, spec approval checkpoint. `token-optimization-fixed-v1` exists only as scenario IDs; there are no executable task definitions.
- Non-blocking leftovers: `docs/public/docs/concepts/specs.md` tree comment and bug-fix row, `docs/public/docs/contributing/conventions.md`, and `specs/shared/conventions.md` don't name the micro-spec yet.
- Shipped on branch `fix/ship-owned-memory-micro-spec` without a version bump.
- CI follow-up: the spec-063 contract test still required the rotation instruction in Plan. It now checks rotation in Ship only, and a new spec-067 test asserts Ship-only ownership. The spec AC-07 Done When now includes `python -m unittest scripts.tests...` (37 OK, 2 bash-only skipped on Windows). Isolated review: PASS.
