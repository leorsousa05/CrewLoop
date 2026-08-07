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
| Scenario / Input | Expected Behavior | Return Value / Error Thrown |
|------------------|-------------------|-----------------------------|
| Empty string / null input | Reject early with validation error | Throws `ValidationError` |
| Network timeout | Fallback to cached response | Returns `CacheFallback` |

## Flow Diagrams
1. Step 1
2. Step 2

## State Management & Caching
[Where state lives, how it flows]

## Performance Considerations
[Budgets, lazy loading, query optimizations]

## Security Considerations
[Auth, input sanitization, PII protection]
