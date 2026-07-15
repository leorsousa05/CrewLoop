# Tasks: Dashboard Quality and Documentation Consolidation

## Setup

- [x] Create the full spec folder and dependencies on specs 028 through 031.
- [ ] Confirm all dependency implementations reached Reviewer PASS.
- [ ] Build the requirement-to-evidence matrix.

## Automated Verification

- [ ] Fill policy, filesystem, event-schema, lifecycle, adapter, projection, filter, settings, and request-race gaps.
- [ ] Add focused component tests for overlays, focus restoration, rows, live regions, and Files drill-down.
- [ ] Remove duplicated state tests or assign distinct contract ownership.
- [ ] Verify synthetic secret redaction and absence of sensitive fixtures.

## Manual Matrix

- [ ] Verify all six views at desktop and mobile widths.
- [ ] Verify light/dark/system themes and compact/comfortable densities.
- [ ] Verify keyboard shortcuts, overlays, pause/resume, route round-trips, back/forward, and empty states.
- [ ] Verify reduced motion, connection loss, session removal, file loading, diff, and retry behavior.

## Documentation

- [ ] Reconcile README features, sources, development ports, settings, security, and limits.
- [ ] Merge final behavior into `specs/living/dashboard/spec.md`.
- [ ] Add supersession notes to ADR 001 without erasing history.
- [ ] Normalize final disposition of specs 021 and 022 for Shipper archival.
- [ ] Update all four `docs/project/` artifacts and mark the program completed only when appropriate.

## Verification

- [ ] Run `npm run typecheck`, `npm run build`, and `npm test` in `servers/dashboard/`.
- [ ] Run CLI verification if spec 029 changed generated OpenCode hooks.
- [ ] Run `python scripts/validate-skills.py` from repository root.
- [ ] Review the complete diff for secrets, generated artifacts, debug logs, empty catches, and stale TODOs.

## Completion

- [ ] Reviewer validates traceability and residual risk.
- [ ] Shipper archives specs 021, 022, 028 through 032 as their statuses permit.
- [ ] Update `.spec.yaml` to completed and archive this change last.
