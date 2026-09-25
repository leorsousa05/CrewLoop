# Spec Retention Contract — 2026-09-03

## Summary

- Reconciled Spec 032 with the current CrewLoop rule that completed feature specs stay
  in `specs/features/` and only dead or rejected proposals use `specs/archive/`.
- Updated root README, published Ship documentation, and the dashboard acceptance evidence map.
- Preserved Specs 021 and 022 in `specs/features/04-workflow/` with completed metadata.
- Kept the manual dashboard matrix explicitly pending; no manual result was fabricated.

## Verification

- Specs 021 and 022 path/frontmatter inspection passed.
- Only Specs 031 and 032 remain active because of the manual dashboard matrix.
- Lifecycle and manual-gate scans passed; no runtime files were changed.
