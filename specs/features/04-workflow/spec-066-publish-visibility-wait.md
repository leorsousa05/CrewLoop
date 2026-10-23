# spec-066-publish-visibility-wait

---
name: spec-066-publish-visibility-wait
domain: 04-workflow
status: completed
created: 2026-10-23
completed: 2026-10-23
supersedes: []
---

# Publish Visibility Wait Without False Failures

## Objective

Stop the `Publish CrewLoop to npm` workflow from failing after a successful `npm publish` by making the registry-visibility check bypass the local npm cache, wait long enough for real registry lag, and report a still-invisible version as a warning instead of a failure.

## Context

- Workflow: [publish-npm.yml](../../../.github/workflows/publish-npm.yml), job `publish`, step `Wait for package to be available`; release flow documented in [publishing.md](../../../docs/public/docs/contributing/publishing.md).
- Evidence: runs `40009375975` (0.23.0) and `39891843100` (0.22.2) both passed `Publish package` and failed only the wait step after 64 s (12 × 5 s). The 0.23.0 registry timestamp (19:13:51Z) is about 100 s after its publish step finished (19:12:13Z). Both versions are live on npm.
- `npm view` caches the registry packument (served with a multi-minute `max-age`), so polling without `--prefer-online` can keep returning the pre-publish document.
- The step originally gated publishing the separate CLI package, which no longer exists ([spec-065](../03-docs/spec-065-install-command-package-name.md)); nothing depends on it now.

## Requirements

1. The poll uses `npm view @archznn/crewloop-skills@"$VERSION" version --prefer-online` so every attempt revalidates against the registry.
2. The poll waits up to about 5 minutes by default: `WAIT_ATTEMPTS` (default 30) × `WAIT_SECONDS` (default 10), both overridable through step environment variables.
3. When the version becomes visible, the step prints the existing success message and exits 0.
4. When the version is still not visible after the last attempt, the step prints a GitHub `::warning::` annotation stating that `npm publish` succeeded but registry visibility was not confirmed, and exits 0. `npm publish`'s exit code remains the only publish gate.
5. Failure of the `Publish package` step still fails the job (unchanged).
6. A workflow contract test asserts R1–R4, and a behavioral test runs the step's script with a stub `npm` on `PATH` for both the visible and the never-visible case; the stub exits 1 while the version is invisible, like a real `npm view` 404.
7. `docs/public/docs/contributing/publishing.md` describes the check as a warning-only visibility confirmation (added after review as a non-blocking follow-up).

## Behavior / Flow

1. `npm publish` succeeds → wait step polls with `--prefer-online`.
2. Version visible → success message, exit 0. Not visible within the window → warning annotation, exit 0.

## Constraints

- Do not change triggers, tag/version checks, `npm publish`, Node version, or other jobs.
- Do not touch `.github/workflows/release-tag.yml` or `validate.yml`.
- This change must not publish anything: it ships without a root version bump, so `release-tag` finds the existing `v0.23.0` tag and `publish-npm` skips because `HEAD` carries no matching tag.
- [Warning vs failure]: chose a warning because a failed visibility check after a successful publish is not actionable and has produced false red runs on every recent release. Revisit if a later job ever needs the package to be resolvable.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Version visible on the first attempt | Success message, exit 0, no sleep |
| Version visible after several attempts | Success message after that attempt, exit 0 |
| Version never visible within the window | `::warning::` annotation, exit 0 |
| `npm view` errors (network, 404 before propagation) | Treated as not yet visible (`|| true`), keep polling |
| `WAIT_ATTEMPTS`/`WAIT_SECONDS` unset | Defaults 30 and 10 |
| `npm publish` fails | Job fails at that step; wait step skipped (unchanged) |

## Acceptance Criteria

- AC-01: Given `publish-npm.yml`, when the wait step is read, then it calls `npm view` with `--prefer-online` and loops over `${WAIT_ATTEMPTS:-30}` attempts sleeping `${WAIT_SECONDS:-10}` seconds.
- AC-02: Given the step script and a stub `npm` that prints the version on its third call, when the script runs with `WAIT_SECONDS=0`, then it exits 0, prints the success message, and calls `npm` exactly three times with `--prefer-online`.
- AC-03: Given the step script and a stub `npm` that never prints the version, when the script runs with `WAIT_ATTEMPTS=3 WAIT_SECONDS=0`, then it exits 0 and prints a line starting with `::warning::`.
- AC-04: Given `publish-npm.yml`, when the `Publish package` step is read, then it is unchanged (`npm publish --access public` with `NODE_AUTH_TOKEN`).

## Done When

- [x] AC-01 — proven by `python -m unittest scripts.tests.test_automated_workflow` (publish wait contract test)
- [x] AC-02 — proven by `python -m unittest scripts.tests.test_automated_workflow` (stub-npm behavioral test, run on Linux/CI and in WSL locally)
- [x] AC-03 — proven by `python -m unittest scripts.tests.test_automated_workflow` (stub-npm behavioral test)
- [x] AC-04 — proven by `python -m unittest scripts.tests.test_automated_workflow` and `git diff` of the `Publish package` step
