---
sidebar_position: 4
---

# Your First Task

This tutorial walks through a complete CrewLoop task from start to finish. You will see what each skill does, what it produces, and how the handoff works.

**Scenario:** Add a search feature to a web app.

---

## Step 1 — `crewloop:hub`: Discovery

You describe the task:

> "Add a search bar to the product listing page."

The **CrewLoop Hub** begins by exploring the codebase, then asks clarifying questions:

> - What framework? (React, Vue, plain HTML?)
> - Should search be client-side or server-side?
> - Any existing component library or design system?
> - Debounce delay? Minimum character count?
> - Accessibility requirements?

After your answers, the CrewLoop Hub produces a **Task Brief** and presents:

```
[A] Send to crewloop:plan — Create specs (always first)
```

---

## Step 2 — `crewloop:plan`: Specs

**`crewloop:plan`** creates a spec folder:

```
specs/changes/042-product-search/
├── .spec.yaml
├── proposal.md
├── design.md
└── tasks.md
```

The spec defines:
- Component interface: `<SearchBar query={string} onSearch={fn} />`
- API contract: `GET /products?q={query}&limit=20`
- TypeScript types for `Product` and `SearchResult`
- Test plan: unit test for debounce, integration test for API call

```
[D] Send to crewloop:design — UI direction
[C] Send to crewloop:code — Implementation
```

---

## Step 3 — `crewloop:design`: Visual Direction

**`crewloop:design`** commits to a direction:

> **Direction:** Clean editorial. Input field with subtle border, no box shadow. Placeholder fades on focus. Results appear with a 150ms ease-in slide. Respects `prefers-reduced-motion`.

The design spec covers color states, typography, animation easing, and accessibility (`role="search"`, `aria-label`, Escape-to-dismiss).

```
[C] Send to crewloop:code — Implement the spec
```

---

## Step 4 — `crewloop:code`: Implementation

**`crewloop:code`** implements:

- `src/components/SearchBar.tsx` — the search input component
- `src/hooks/useSearch.ts` — debounced search hook
- `src/services/products.ts` — updated with search API call
- `src/components/SearchBar.test.tsx` — unit + integration tests

```
[R] Send to crewloop:review — Quality gate
```

---

## Step 5 — `crewloop:review`: Quality Gate

**`crewloop:review`** inspects the diff:

```
## Review Report

**Overall:** Approved with Warnings

### Warnings
- SearchBar.tsx line 23: console.log left in debounce handler
```

`crewloop:code` removes the `console.log`. `crewloop:review` approves:

```
[S] Send to crewloop:ship — Commit and push
```

---

## Step 6 — `crewloop:ship`: Git & PR

**`crewloop:ship`** archives the spec and commits:

**Branch:** `feat/product-search-bar`

```
feat(search): add debounced product search bar

- SearchBar component with focus animations
- useSearch hook with 300ms debounce
- GET /products?q= API integration
- Unit and integration tests
- Accessibility: role=search, aria-label, Escape-to-dismiss
```

Spec archived to `specs/archive/2026-06-27-042-product-search/`.

```
[O] Return to crewloop:hub — Next task
```

---

## What to explore next

- [Core Skills](../core/crewloop-hub) — deep reference for each skill
- [Concepts: Specs](../concepts/specs) — how specs are structured
- [Concepts: Workflow](../concepts/workflow) — the full routing rules
- [CLI Reference](../tools/cli) — all CLI commands
