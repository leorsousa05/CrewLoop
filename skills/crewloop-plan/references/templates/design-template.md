# Design: [Change Name]

## Overview
[High-level summary of the approach]

## Assumptions & Defaults
[Every ambiguity resolved with a default convention MUST be recorded here.
Format: `- [Topic]: chose [X] because [reason]. Revisit if [condition].`]

## Proposed Directory & File Structure
```
[Insert a complete ASCII tree of the proposed directories and files to be added, modified, or removed.]
```

## File-by-File Changes
| File | Action | What changes | Design ref |
|------|--------|--------------|------------|
| `src/example.ts` | Modify | Add `foo()` export; rework `bar()` to use Strategy | §API Contracts |

## Code Architecture & Design Patterns
- **Architecture Model:** [Clean Architecture, Modular, DDD context]
- **Design Patterns Used:** [Factory, Strategy, Observer, Repository, etc.]

## Data Model & Interfaces
```typescript
// Explicit types, interfaces, schemas, and signatures
interface ServiceContract {
  execute(input: InputSchema): Promise<OutputSchema>;
}
```

## Edge Case & Error Handling Matrix
[MANDATORY — a spec without failure scenarios is invalid. Cover every public entry point:
empty/null/invalid inputs, boundary values, error paths, external failures (network, I/O, dependency down),
and concurrency/permission concerns when relevant.]
| Scenario / Input | Type | Expected Behavior | Return Value / Error Thrown |
|------------------|------|-------------------|-----------------------------|
| Valid input (happy path) | happy | Process normally | Returns `Result` |
| Empty string / null input | edge | Reject early with validation error | Throws `ValidationError` |
| Boundary value (0, max, overflow) | edge | Clamp or reject per contract | Returns `BoundaryError` |
| Network timeout / dependency down | error | Fallback to cached response | Returns `CacheFallback` |
| Concurrent modification | error | Last-write-wins or conflict error | Throws `ConflictError` |
| Missing permission / unauthorized | error | Reject before side effects | Returns `403` |

## Failure Mode Analysis
[For each external dependency touched: what happens when it fails, times out, or returns garbage?
Which failures are retried, which are surfaced to the caller, which are silent fallbacks?]

## Flow Diagrams
1. Step 1
2. Step 2

## State Management & Caching
[Where state lives, how it flows]

## Performance Considerations
[Budgets, lazy loading, query optimizations]

## Security Considerations
[Auth, input sanitization, PII protection]
