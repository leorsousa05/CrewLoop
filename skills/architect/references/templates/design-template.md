# Design: [Change Name]

## Overview
[High-level summary of the approach]

## Assumptions & Defaults
[Every ambiguity resolved with a default convention (per the Architect's non-interactive rule) MUST be recorded here.
Format: `- [Topic]: chose [X] because [reason]. Revisit if [condition].`]

## Proposed Directory & File Structure
```
[Insert a complete ASCII tree of the proposed directories and files to be added, modified, or removed.
Example:
my-project/
├── src/
│   ├── components/
│   │   └── NewComponent.tsx  (New)
│   └── hooks/
│   │   └── useHook.ts        (Modified)
└── tests/
    └── NewComponent.test.tsx (New)
]
```

## File-by-File Changes
[The anchor artifact for the implementer. Every file touched appears here AND in at least one tasks.md entry.]
| File | Action | What changes | Design ref |
|------|--------|--------------|------------|
| `src/example.ts` | Modify | Add `foo()` export; rework `bar()` to use Strategy | §API Contracts |
| `src/example.test.ts` | Create | Unit tests for `foo()` and `bar()` strategies | §Data Model |
| `src/legacy.ts` | Delete | Superseded by `src/example.ts` | §Overview |

## Code Architecture & Design Patterns
- **Architecture Model:** [Describe the architecture of the solution, clean code boundaries, separation of concerns, e.g. Clean Architecture, Modular, DDD context]
- **Design Patterns Used:** [Name and justify the design patterns applied, e.g. Factory, Strategy, Observer, Repository pattern]

## Data Model
```typescript
// Core entities, value objects, types
interface Example {
  id: string;
  name: string;
}
```

## API Contracts
```typescript
// Interfaces, function signatures, schemas
interface ServiceContract {
  method(input: Input): Promise<Output>;
}
```

## Flow Diagrams
### [Flow Name]
1. Step 1
2. Step 2
3. Step 3

## State Management
[Where state lives, how it flows]

## Error Handling
[Expected errors, fallback strategies]

## Performance Considerations
[Budgets, caching, optimization strategies]

## Security Considerations
[Auth, validation, sanitization]
