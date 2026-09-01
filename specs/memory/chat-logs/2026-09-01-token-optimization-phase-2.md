---
date: 2026-09-01
topic: token-optimization-phase-2
---

# Phase 2 Context Selection

- Resumed the native CrewLoop token-optimization roadmap after Phase 0/1 was shipped.
- Confirmed the next scope is Phase 2: deterministic context selection inside `crewloop:plan`.
- Preserved the existing dashboard-hardening artifacts under `docs/project/` as legacy history; `specs/memory/` remains the active source of truth for this roadmap.
- Created `spec-015-token-optimization-phase-2-context-selection.md`.
- Scope uses changed files, task-term matches, imports/consumers, associated tests, and mandatory references.
- Explicitly excludes embeddings, vector search, provider SDKs, remote indexing, token estimation, and hard caps that could remove required context.
- Implemented the portable Plan reference and updated the Plan skill.
- Validation and review passed; the work remains unshipped until an explicit Shipper step.
- Next roadmap phase: execution control in `crewloop:code`.
