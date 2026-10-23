# decisions/

Lightweight rationale notes: `why-topic.md`.

Use when a choice is worth remembering but does not warrant a full ADR:

```markdown
# Why <choice>?

- Date:
- Decided by:
- Context:
- Alternatives rejected:
- Consequence:
```

Architecture-level decisions go to `specs/shared/adrs/` instead.

## decision-log.md

Append-only archive of `project-state.md` Recent decisions, oldest first. Recent decisions keeps at most 10 dated entries; when a new one would exceed the cap, Plan or Ship moves the oldest entries here, verbatim and oldest first, to the bottom until 10 remain. Read it on demand only, when a task touches a recorded topic.
