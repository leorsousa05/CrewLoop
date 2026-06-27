---
sidebar_position: 2
---

# Why CrewLoop?

Most AI coding assistants generate code on demand. That works for tiny scripts, but falls apart for real software projects because they skip the steps that make software reliable: discovery, specification, design, review, and traceability.

CrewLoop exists to fix that.

## The problem with "just build it"

When you ask a single AI to build a feature, you usually get one of these outcomes:

- **It builds the wrong thing** — it did not ask enough questions.
- **It skips design** — the result looks generic.
- **It skips tests** — existing behavior breaks silently.
- **It commits directly** — no review, no clear commit message.
- **It forgets context** — the next conversation starts from zero.

Each symptom has the same root cause: **no process**.

## What CrewLoop does differently

| Problem | CrewLoop solution |
|---------|-------------------|
| Wrong requirements | Orchestrator asks clarifying questions and produces a structured brief |
| Missing specs | Architect creates mandatory specs for every change, including 1-line fixes |
| Generic UI | Designer commits to a distinct aesthetic direction before code is written |
| Untested code | Engineer writes tests alongside implementation |
| Security holes | Reviewer scans for secrets, unsafe patterns, and AI artifacts |
| Messy git history | Shipper generates Conventional Commits messages and proper branches |
| Undocumented changes | Every change is traced through a spec that is archived on commit |

## When CrewLoop shines

- Multi-file features with UI, API, and database changes
- Refactors that affect public contracts
- Bug fixes where root cause analysis matters
- Projects where multiple AI sessions work on the same codebase
- Teams that need traceability and review gates

## When you might not need it

- One-off scripts or experiments
- Quick questions about how a function works
- Prototyping where speed matters more than maintainability

Even then, individual skills like **Researcher** or **Engineer** can handle small tasks without the full loop.

## The philosophy

> Don't ask an AI to code. Ask a crew of AI skills to build software.
