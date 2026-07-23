# Tasks: [Change Name]

> Granularity rules (do not delete this block — it defines what a valid task is):
> - One task = one cohesive set of files. If a task touches more than ~3 unrelated files, split it.
> - Every task MUST list **Files**, **Depends on**, and **Done when**. No orphan checkboxes.
> - Order tasks by dependency, not by type. Each phase must end in a verifiable state.
> - Reference the `design.md` section that backs each task (e.g. "per design.md §API Contracts").

## Phase 0: Setup

### T0 — Scaffold spec
- **Files:** `specs/changes/NNN-name/`
- **Depends on:** —
- **Do:** Create the spec folder structure and initialize `.spec.yaml` from `templates/spec-yaml-template.yaml`.
- **Done when:** `.spec.yaml` exists with `status: active` and all required fields filled.

## Phase 1: [First executable phase name]

### T1 — [short title]
- **Files:** `path/to/file.ts` (modify), `path/to/file.test.ts` (create)
- **Depends on:** T0
- **Do:** [What to implement, in 1-3 sentences. Reference the design.md section.]
- **Done when:** [Verifiable criterion: test X passes / command Y exits clean / behavior Z is observed]

### T2 — [short title]
- **Files:** `path/to/other.ts` (modify)
- **Depends on:** T1
- **Do:** [What to implement.]
- **Done when:** [Verifiable criterion.]

## Phase 2: [Next phase — repeat the task block pattern above]

## Final Phase: Verification & Wrap-up

### T8 — Automated verification
- **Files:** —
- **Depends on:** [all implementation tasks]
- **Do:** Run the full test/build suite: `[command]`. Then set `.spec.yaml` status to `completed` with the `completed` date.
- **Done when:** Suite exits 0 with no failing or skipped tests, and `.spec.yaml` shows `status: completed`.

### T9 — Ship (Reviewer PASS required)
- **Files:** `.spec.yaml`, `specs/living/`, `specs/archive/`
- **Depends on:** T8, reviewer PASS
- **Do:** Shipper moves the change folder to `specs/archive/YYYY-MM-DD-NNN-name/` and merges the deltas into `specs/living/`.
- **Done when:** The spec folder exists in `specs/archive/` and the living specs reflect the change.
