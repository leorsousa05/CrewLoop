# Why CrewLoop?

Most AI coding assistants generate code on demand. That works for tiny scripts, but it falls apart for real software projects because they skip the steps that make software reliable: discovery, specification, design, review, and traceability.

CrewLoop exists to fix that.

## The problem with "just build it"

When you ask a single AI to build a feature, you usually get one of these outcomes:

- **It builds the wrong thing** because it didn't ask enough questions.
- **It skips design** and produces generic UI.
- **It skips tests** and breaks existing behavior.
- **It commits directly** without review or a clear commit message.
- **It forgets context** in the next conversation.

Each of these is a symptom of the same disease: **no process**.

## What CrewLoop does differently

CrewLoop treats software development as a workflow, not a one-shot prompt. Every task moves through the same proven phases:

1. **Discovery** — understand what to build and why.
2. **Specification** — write down contracts, acceptance criteria, and constraints.
3. **Design** — define the visual and interaction direction (when UI is involved).
4. **Implementation** — write code and tests against the spec.
5. **Review** — audit quality, security, and compliance.
6. **Shipping** — package changes cleanly with Conventional Commits and archived specs.

Each phase is owned by a specialized skill. The skill doesn't do the next phase's job.

## The benefits

| Problem | CrewLoop solution |
|---------|-------------------|
| Wrong requirements | Orchestrator asks clarifying questions and produces a brief |
| Missing specs | Architect creates mandatory specs for every change |
| Generic UI | Designer commits to a distinct aesthetic direction |
| Untested code | Engineer writes tests before or alongside implementation |
| Security holes | Reviewer scans for secrets, unsafe patterns, and AI artifacts |
| Messy git history | Shipper generates Conventional Commits and proper branches |
| Lost context | Obsidian Second Brain persists decisions and reusable knowledge |

## When CrewLoop shines

CrewLoop is ideal for:

- Multi-file features with UI, API, and database changes.
- Refactors that affect public contracts.
- Bug fixes where root cause analysis matters.
- Projects where multiple people (or AI sessions) work on the same codebase.

## When you might not need it

CrewLoop is probably overkill for:

- One-off scripts or experiments.
- Quick questions about how a function works.
- Prototyping where the goal is speed, not maintainability.

Even then, the **Researcher** or **Engineer** skill can handle small tasks without the full loop.

## The philosophy in one sentence

> Don't ask an AI to code. Ask a crew of AI skills to build software.
