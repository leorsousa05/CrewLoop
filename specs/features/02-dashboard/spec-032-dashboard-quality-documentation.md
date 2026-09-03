# spec-032-dashboard-quality-documentation

---
name: spec-032-dashboard-quality-documentation
domain: 02-dashboard
status: active
created: 2026-07-15
completed: null
supersedes: []
---

# Dashboard Quality and Documentation Consolidation

## Objective

Establish regression evidence across all dashboard implementation phases, and make README, shared docs, ADRs, and tracking artifacts describe verified behavior — leaving one reproducible desktop/mobile acceptance matrix for future releases.

## Context

- Dashboard: `shared/architecture-overview.md` §Dashboard; ADR 001 (hybrid instrumentation), ADR 005 (trust), ADR 010 (durable telemetry).
- Depends on specs 028–031 and 033 being implementation-complete; resolves stale specs 021/022 disposition.
- Reconciles the durable product-usage telemetry and seventh Usage view introduced by spec 033.

## Requirements

1. Regression evidence across the four implementation phases: critical security, state, adapter, client, and accessibility contracts have tests.
2. Typecheck, build, server tests, UI tests, and skill validation pass.
3. README and shared docs describe the seven-view, five-agent, localhost-only product with durable minimized usage telemetry.
4. ADR 001 clearly identifies clauses superseded by later decisions (no history rewrite).
5. Specs 021 and 022 remain completed feature specs under `specs/features/04-workflow/` with preserved history, following the current retention contract.
6. One reproducible manual acceptance matrix (viewport, theme, density, browser recorded).

## Behavior / Flow

1. Confirm all dependency implementations reached review PASS.
2. Build the requirement-to-evidence matrix mapping each requirement to automated or manual evidence.
3. Fill test gaps: policy, filesystem, event-schema, lifecycle, adapter, projection, filter, settings, request-race; component tests for overlays, focus restoration, rows, live regions, Files drill-down.
4. Manual matrix: seven views × desktop/mobile × light/dark/system × compact/comfortable; keyboard shortcuts, overlays, pause/resume, route round-trips, back/forward, empty states, reduced motion, connection loss, session removal, file loading/diff/retry.
5. Documentation: reconcile README (features, sources, durable storage, dev ports, settings, security, limits); merge final behavior into shared docs; add supersession notes to ADR 001; normalize specs 021/022 disposition.
6. Verification + diff review for secrets, generated artifacts, debug logs, empty catches, stale TODOs.

## Constraints

- No new product features during consolidation.
- No chasing an arbitrary global coverage percentage.
- Documentation cannot claim behavior not demonstrated by tests or manual evidence.
- Shipper alone performs Git operations; completed feature specs remain in `specs/features/`, while only dead or rejected proposals use `specs/archive/`.
- Generated build artifacts and screenshots not committed unless explicitly required.
- Historical ADRs preserved; superseded clauses marked, not rewritten.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Tests duplicate implementation details | Assert contracts and user-observable behavior instead |
| Browser matrix environment-dependent | Record viewport, theme, density, and browser used |
| Historical ADR edits obscure decisions | Preserve original decision; add supersession notes |
| Cleanup accidentally archives active work | Verify metadata and references before ship move |
| Secrets in fixtures | Synthetic redaction verified; no sensitive fixtures committed |

## Acceptance Criteria

- AC-01: Given the dashboard repo, critical security, state, adapter, client, and accessibility contracts have regression tests that run in `npm test`.
- AC-02: Given `servers/dashboard/`, `npm run typecheck`, `npm run build`, and `npm test` pass.
- AC-03: Given the docs, the README and shared docs describe seven views, five agents, localhost-only operation, and durable minimized usage telemetry — with no stale Network-3D or six-view claims.
- AC-04: Given ADR 001, superseded clauses are explicitly marked with references to later decisions, and the original decision text is preserved.
- AC-05: Given specs 021 and 022, they remain completed feature specs under `specs/features/04-workflow/` with preserved history and correct metadata.
- AC-06: Given the manual matrix, it covers all seven views, both widths, both/three themes, both densities, and the listed interaction states, with environment recorded.
- AC-07: Given the shipped diff, it contains no secrets, generated artifacts, debug logs, empty catches, or stale TODOs.

## Done When

- [x] AC-01 — proven by `npm test` run with the existing server, client, and accessibility contract suites
- [x] AC-02 — proven by running typecheck/build/test in `servers/dashboard/`
- [x] AC-03 — proven by doc review against verified behavior and stale-claim scans
- [x] AC-04 — proven by ADR 001 diff review
- [x] AC-05 — proven by feature-path/frontmatter inspection; both specs remain under `specs/features/04-workflow/` with `status: completed`.
- [ ] AC-06 — proven by the recorded manual matrix artifact
- [x] AC-07 — proven by the shipped diff review, `git diff --check`, and scans for secrets, generated artifacts, debug logs, empty catches, and stale TODOs.
