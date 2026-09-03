# Record-Mode Fixtures — 2026-09-03

## Summary

- Created Spec 041 to make the provider-neutral execution-record benchmark reproducible from the repository.
- Added checked-in baseline and candidate containers covering all six canonical scenarios with complete measured records and distinct policy versions.
- Added CLI assertions for exact existing schema keys, measured fields, canonical coverage, forbidden raw-data keys, and clean benchmark output.
- Documented the repository-root command and clarified that npm workspace arguments resolve from `servers/dashboard`.

## Verification

- Focused benchmark CLI suite: 7 tests passed.
- Complete dashboard suite: 351 server tests and 89 UI tests passed.
- Dashboard typecheck and production build passed.
- Record-mode benchmark passed with `adopt_candidate`, 100% measured coverage, 25% total-token reduction, and 25% cost reduction.
