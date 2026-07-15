# Design: Dashboard Quality and Documentation Consolidation

## Overview

Treat verification as a contract matrix rather than a coverage-number exercise. Each critical behavior from specs 028 through 031 maps to the cheapest reliable test layer. Documentation is then reconciled from verified contracts, preserving historical decisions while marking superseded statements.

## Proposed Directory & File Structure

```text
servers/dashboard/
├── README.md                         (Modified)
├── src/**/*.test.ts                 (Modified/New contract and integration tests)
└── ui/src/**/*.test.ts              (Modified/New pure and component tests)
specs/
├── living/dashboard/spec.md         (Modified)
├── decisions/001-dashboard-hybrid-architecture.md (Modified: supersession note)
├── changes/
│   ├── 021-dashboard-console-redesign/            (Metadata disposition only)
│   └── 022-dashboard-saas-minimalist-redesign/     (Metadata disposition only)
└── archive/                         (Shipper moves 021/022 after review)
docs/project/*.md                    (Modified: final program state)
```

## Code Architecture & Design Patterns

- **Test Pyramid:** pure policy/projection tests, focused server integration tests, and a small browser/component layer for DOM behavior.
- **Contract Testing:** adapter fixtures and WebSocket/REST messages are validated independently from presentation.
- **Traceability Matrix:** every spec acceptance criterion maps to evidence and documentation.
- **Docs as Code:** source-of-truth updates share review and shipping gates with implementation.

## Data Model

```typescript
interface VerificationRecord {
  requirement: string;
  sourceSpec: '028' | '029' | '030' | '031';
  layer: 'unit' | 'integration' | 'component' | 'manual';
  evidence: string;
  status: 'pass' | 'fail' | 'blocked';
}
```

## API Contracts

No new runtime API is introduced. Existing final contracts are exercised through public handlers, adapters, presenters, hooks, and user interactions rather than private implementation details.

## Flow Diagrams

### Consolidation

1. Build the requirement-to-test matrix from specs 028 through 031.
2. Fill automated gaps at the lowest reliable layer.
3. Execute the desktop/mobile manual matrix for behavior unsuitable for stable automation.
4. Reconcile README, living spec, and ADR language from passing evidence.
5. Update long-term artifacts and prepare stale specs for Shipper archival.

## State Management

No runtime state changes. Long-term tracking moves from active to completed only after all dependent specs and this consolidation pass ship.

## Error Handling

Any failing or blocked verification remains explicit; documentation must not describe the intended behavior as delivered. Flaky tests are treated as failures requiring isolation or correction.

## Performance Considerations

Keep browser/component tests focused on high-risk interactions. Avoid duplicating exhaustive adapter matrices at multiple layers.

## Security Considerations

Fixtures contain synthetic secrets only and assert redaction; no real commands, paths, tokens, environment files, or user content are committed. Test artifacts and logs must not leak temporary absolute paths unnecessarily.
