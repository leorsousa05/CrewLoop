# Spec Delta: Dashboard Quality and Documentation

## Current State

Automated tests omit major public APIs and interactive UI behavior. Manual verification deferred by prior redesigns has not been recorded. Documentation contains stale view counts, source lists, privacy statements, development port guidance, and inference descriptions. Two old dashboard specs remain in the active changes directory despite terminal statuses.

## Changes

### ADDED

- A cross-phase regression matrix mapping each requirement to automated or manual evidence.
- Component/browser coverage for critical keyboard, focus, responsive, and async flows.
- Explicit documentation of local trust boundaries, resource limits, correlation fallback, and retained telemetry.
- Final session log and context-resume updates for `dashboard-hardening`.

### MODIFIED

- README reflects six views, supported sources, actual dev ports, effective settings, and enforced security behavior.
- Living spec includes OpenCode consistently and incorporates final server/client/UI contracts.
- ADR 001 gains a supersession note for generic skill inference and any adapter details overtaken by later accepted decisions.
- Specs 021 and 022 metadata/tasks clearly state their final disposition before shipping archive.

### REMOVED

- Claims for a Network 3D view, seven-view navigation, ineffective max-events behavior, and unsafe filesystem guarantees.
- Ambiguous or contradictory source lists and shim examples.

## Migration Notes

No runtime migration. Documentation changes land only after final implementation behavior is verified.

## Backward Compatibility

Not applicable to runtime contracts. Historical specs and ADRs remain auditable after archival and supersession notes.
