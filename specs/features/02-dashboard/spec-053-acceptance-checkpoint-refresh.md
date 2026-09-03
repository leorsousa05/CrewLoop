---
name: spec-053-acceptance-checkpoint-refresh
status: completed
created: 2026-09-03
---

# Dashboard Acceptance Checkpoint Refresh

## Objective

Refresh the automated evidence checkpoint in the dashboard manual acceptance matrix so it identifies the current repository revision and the latest reproducible preflight results without claiming that human visual, keyboard, or screen-reader acceptance has been completed.

## Context

The dashboard preflight and interaction smoke gained rendered-contrast coverage after the matrix was first recorded. The matrix still points to an earlier commit and reports the previous interaction count, which makes the evidence traceability stale even though the manual gate remains intentionally open.

## Requirements

1. Run the package-local dashboard browser preflight and interaction smoke against the current production build using an isolated local server/profile when the environment supports it.
2. Update the matrix run record and automated checkpoint with the verified current commit, environment, combination count, interaction count, contrast count, and unsupported-style count.
3. Preserve every unchecked manual view cell and `[record]` interaction result until a human performs the required walkthrough.
4. Record the refresh in `specs/memory/project-state.md` and keep the roadmap's manual-gate boundary explicit.
5. Do not add runtime dependencies, provider telemetry, automatic policy activation, or a second dashboard acceptance engine.

## Behavior / Flow

1. Read the current commit and dashboard test/build contracts.
2. Start or reuse only a local production dashboard endpoint for the acceptance commands; do not touch an existing user browser session.
3. Run the default route/viewport/theme/density preflight and the opt-in interaction smoke.
4. If both commands pass, copy only bounded aggregate evidence into the matrix and project state.
5. If setup or an invariant fails, preserve the previous checkpoint and report the failure instead of recording a partial pass.

## Constraints

- The matrix is a manual acceptance artifact; automated evidence must not mark manual cells or assistive-technology rows as passed.
- Reports must not include page content, prompts, responses, paths, credentials, provider payloads, or session identifiers.
- Validation remains local-only and deterministic.
- Git operations remain the responsibility of CrewLoop Ship.

## Edge Cases

| Case | Expected behavior |
|---|---|
| Browser/CDP endpoint unavailable | Do not update the checkpoint with a new pass; retain the pending state and report the bounded setup failure. |
| One route or interaction invariant fails | Do not record a partial success; preserve the last verified checkpoint and expose the failing category only. |
| Current revision differs from the previous record | Update only after the complete automated run passes. |
| Automated checks pass but no assistive technology is available | Keep screen-reader and manual interaction results pending. |

## Acceptance Criteria

- AC-01: Given the current dashboard build and an available isolated browser endpoint, when both acceptance commands complete successfully, then the matrix records the current short commit and exact aggregate results from that run.
- AC-02: Given a successful current run, when the matrix is updated, then it retains all unchecked view cells and `[record]` interaction rows, explicitly distinguishing automated evidence from manual acceptance.
- AC-03: Given an unavailable browser endpoint or a failed invariant, when the refresh workflow is attempted, then no partial automated pass is recorded and the prior checkpoint remains authoritative.
- AC-04: Given a successful documentation refresh, when project state is inspected, then it contains the checkpoint evidence and still identifies the manual dashboard matrix as the next external validation.

## Done When

- [x] AC-01 — proven by the default and interaction preflight outputs at commit `a11f7a3` plus the refreshed matrix run record.
- [x] AC-02 — proven by the matrix diff retaining every unchecked manual view cell and `[record]` interaction row.
- [x] AC-03 — preserved by the documented fail-closed flow; the preceding cold-run failure was not recorded as a pass.
- [x] AC-04 — proven by the project-state entry and roadmap/matrix consistency scan.

## Verification

- Fresh isolated Chrome checkpoint at `a11f7a3`: `112/112` route combinations and `8/8` interaction cases.
- Rendered contrast: `574` candidates and `0` unsupported styles.
- Manual visual, keyboard, and screen-reader walkthrough: intentionally still pending.
