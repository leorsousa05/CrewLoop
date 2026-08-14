# Task Prompt Template

Use this template when starting a working session with the AI.

## Context to load (in this order)

1. `specs/memory/project-state.md` — where we are (always read)
2. `specs/features/<domain>/spec-NNN-name.md` — what to do today (one spec)
3. `specs/shared/` references — ONLY if the spec links them

## Instruction base

- What is the objective of this task?
- Which existing files will I reuse?
- Which new files will I create?
- What is the "done" criterion (the spec's Done When)?

## Before coding

- Do not modify files outside this spec's scope
- Do not reimplement what already exists (check `specs/memory/chat-logs/`)
- Always follow `specs/shared/conventions.md`

## Done definition

All Done When checkboxes in the feature spec are ticked, each proven by the referenced test or manual step.
