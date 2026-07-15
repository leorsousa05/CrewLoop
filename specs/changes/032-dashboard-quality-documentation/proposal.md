# Proposal: Dashboard Quality and Documentation Consolidation

## Status

- **State:** active
- **Created:** 2026-07-15
- **Author:** @opencode

## Problem Statement

Dashboard tests focus on pure utilities and basic server startup while filesystem APIs, WebSocket trust, adapter contracts, settings behavior, component interactions, responsive layouts, and accessibility remain weakly covered. README and living specifications describe removed views, incomplete source lists, ineffective settings, and security guarantees that do not match implementation. Completed or superseded specs remain in `specs/changes/`.

## Goals

1. Establish regression evidence across the four implementation phases.
2. Make README, living spec, ADRs, and tracking artifacts describe verified behavior.
3. Resolve stale specs 021 and 022 through the normal review/shipping archive process.
4. Leave one reproducible desktop/mobile acceptance matrix for future releases.

## Non-Goals

- Adding new product features during consolidation.
- Chasing an arbitrary global coverage percentage.
- Rewriting accepted ADR history instead of marking superseded clauses clearly.

## Constraints

- This spec begins only after 028 through 031 are implementation-complete.
- Documentation cannot claim behavior not demonstrated by tests or manual evidence.
- Shipper alone moves completed/superseded spec folders into archive.
- Generated build artifacts and screenshots are not committed unless explicitly required.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tests duplicate implementation details | Medium | Assert contracts and user-observable behavior |
| Browser matrix is environment-dependent | Medium | Record viewport, theme, density, and browser used |
| Historical ADR edits obscure decisions | Medium | Preserve original decision and add supersession notes |
| Cleanup accidentally archives active work | High | Verify metadata and references before Shipper move |

## Success Criteria

- [ ] Critical security, state, adapter, client, and accessibility contracts have regression tests.
- [ ] Typecheck, build, server tests, UI tests, and skill validation pass.
- [ ] README and living spec match the six-view, five-agent, localhost-only product.
- [ ] ADR 001 clearly identifies clauses superseded by later decisions.
- [ ] Specs 021 and 022 are correctly archived with preserved history.
