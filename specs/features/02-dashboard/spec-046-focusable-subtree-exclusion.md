---
name: spec-046-focusable-subtree-exclusion
domain: 02-dashboard
status: completed
created: 2026-09-03
completed: 2026-09-03
supersedes: []
---

# Focusable Subtree Exclusion

## Objective

Make the dashboard's shared focus-trap discovery ignore controls inside hidden or inert ancestor subtrees, so closed transient surfaces cannot re-enter keyboard focus through a stale or reused DOM branch.

## Context

- Spec 031 requires closed/off-screen overlays to contain no keyboard-reachable focus targets.
- Specs 043 and 044 prove the currently mounted dashboard overlays through browser interaction smoke, but the shared `getFocusableElements` primitive only checks attributes on each control itself.
- The fix must remain local to focus discovery and must not change the product's overlay lifecycle.

## Requirements

1. Exclude a candidate when it or any ancestor is marked `hidden`, `aria-hidden="true"`, or `inert`.
2. Preserve the existing focusable selector and the behavior for visible controls.
3. Add regression coverage for each ancestor exclusion and retain coverage for visible/element-level hidden controls.
4. Keep the change browser-free and dependency-free.

## Acceptance Criteria

- AC-01: A focusable control inside a `hidden` ancestor is excluded.
- AC-02: A focusable control inside an `aria-hidden="true"` ancestor is excluded.
- AC-03: A focusable control inside an `inert` ancestor is excluded.
- AC-04: Visible controls remain discoverable and direct hidden controls remain excluded.
- AC-05: Dashboard typecheck and UI tests pass without changing the browser preflight contract.

## Done When

- [x] AC-01 — proven by the focus-discovery regression test
- [x] AC-02 — proven by the focus-discovery regression test
- [x] AC-03 — proven by the focus-discovery regression test
- [x] AC-04 — proven by the existing and expanded accessibility contract tests
- [x] AC-05 — proven by typecheck and dashboard test gates

## Verification Evidence

- `getFocusableElements` now excludes hidden, `aria-hidden="true"`, and `inert` ancestor subtrees while retaining the existing selector and direct-control checks.
- Accessibility contract tests cover all three ancestor markers and visible-control discovery.
- Dashboard typecheck and UI tests passed after implementation.
