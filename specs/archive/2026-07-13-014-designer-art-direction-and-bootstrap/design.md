# Design: Designer Skill Hardening and Vite Bootstrap Helper

## 7 Analysis Questions

### 1. Domain and bounded context placement?
This change lives in the skills/documentation boundary, specifically the Designer role and its reference corpus. The script helper sits in the repository tooling boundary, because it is an explicit scaffold aid rather than part of the skill runtime.

### 2. Core responsibilities of new/changed components?
`skills/designer/SKILL.md` must become more prescriptive about aesthetic thesis, anti-patterns, and output quality. The reference files provide the reusable visual language and critique vocabulary that keep the skill from falling back to a default template. The Vite helper provides a user-chosen starting point for new frontend work without changing the design skill's non-interactive contract.

### 3. Contracts (interfaces, types, APIs) to define or change?
The primary contract is a documentation contract: the Designer must always emit a single chosen direction, a reasoned visual system, real-state treatment, and explicit references to the reference corpus. For the script, the contract is CLI behavior: explicit flags, a predictable exit code model, and a safe default that only scaffolds when invoked directly.

### 4. Which parts need tests per TDD skip criteria?
The shell helper needs tests because it has branching, filesystem side effects, and explicit user-facing behavior. The skill Markdown and reference files do not need unit tests, but they do need validation through `python scripts/validate-skills.py` and a manual review checklist that confirms the new references are linked from the skill.

### 5. Architecture that minimizes ambiguity?
A modular documentation architecture is the safest choice: a tight core skill plus a reference library split into narrow topical files. The bootstrap helper should be independent and optional so the design skill remains about art direction, not project creation logic.

### 6. Project structure changes needed?
Add multiple reference files under `skills/designer/references/` and keep the main skill file as the orchestrator of those references. Add `scripts/bootstrap-vite.sh` at the repo root and document when it should be used. If docs are updated, keep them explanatory rather than procedural.

### 7. Key trade-offs?
More reference files increase maintenance cost, but they reduce drift and generic outputs. The bootstrap helper adds convenience, but it should stay explicit so we do not introduce hidden setup behavior or a second installer path.

## [Padrões Aplicados]

- **Token-driven design systems**: the Designer should rely on explicit reference files for palettes, typography, motion, and layout patterns rather than improvising from one prompt to the next.
- **Anti-corruption via reference library**: separate critique, pattern, and template files protect the main skill from collapsing into one oversized instruction blob.
- **Single-source visual thesis**: each design response must commit to one coherent aesthetic direction, which reduces mixed-style output and generic composition.
- **Optional helper pattern**: the Vite script is an explicit opt-in tool, not a hidden branch in the design workflow, which keeps responsibilities clean.
- **Documentation-first tooling**: the helper script is still a repo artifact described in docs, not a runtime dependency.

## Visual System Intent

The improved Designer skill should feel like a senior art director working from a curated playbook, not a prompt interpreter improvising from memory. Its output should consistently read as deliberate, authored, and specific, with a clear opinion about hierarchy, spacing, typography, and motion.

The reference library should therefore support three layers of judgment:

1. **What to avoid**: explicit anti-patterns and common AI-default failures.
2. **What to choose**: a few strong, named directions that map to real product types.
3. **How to express it**: concrete templates for layout, type, color, motion, and output structure.

This makes the skill easier to steer toward premium outputs without forcing one visual style on every project.

## [Estratégia de Implementação]

1. Refactor `skills/designer/SKILL.md` so the opening sections force the model to choose a single aesthetic thesis, define why it fits the product, and reject default AI patterns before moving into tokens or components.
2. Expand the Designer references into multiple narrow files:
   - anti-patterns and visual failures,
   - layout and composition recipes,
   - typography and color playbooks,
   - motion patterns with reduced-motion fallbacks,
   - and a case-study output template.
3. Update the skill to point into those references explicitly, so the reference library becomes part of the operating procedure rather than optional background reading.
4. Add `scripts/bootstrap-vite.sh` as a small, explicit helper that can scaffold a Vite project when the user chooses that route. Keep it parameterized and predictable, and avoid any hidden dependency installation behavior unless explicitly requested.
5. Refresh the docs that explain how to write skills and how the Designer works so future contributors understand why the reference corpus exists and when the helper script is appropriate.
6. Keep the active change isolated from implementation code; the goal of this spec is to define the contract and the reference structure first.

## Reference Library Plan

### 1. `aesthetic-guidelines.md`
The anchor file should remain short and opinionated. It should explain the core aesthetic pillars and route readers into the deeper playbooks rather than repeating the entire system.

### 2. `anti-patterns.md`
This file should name the visible failure modes that trigger “AI slop”: generic SaaS gradients, identical card decks, unearned glass effects, weak hierarchy, default font stacks, and layouts with no spatial tension. Each anti-pattern should include a short “why it fails” note so the skill can critique itself.

### 3. `reference-library.md`
This file should act as the index and selector. It should list the available directions and the conditions under which each direction is strongest, such as editorial for content-heavy flows, linear-like for developer tools, and luxury/refined for premium surfaces.

### 4. `layout-patterns.md`
This file should describe compositional structures such as asymmetrical hero layouts, bent grids, reading-column layouts, split-screen comparison blocks, and high-density panel stacks. The focus is on spatial logic, not raw implementation.

### 5. `typography-playbook.md`
This file should define how to choose display vs body faces, how to set the hierarchy, when to use compressed grotesques, when to use serif display faces, and how to keep rhythm consistent across long pages.

### 6. `color-playbook.md`
This file should describe how to commit to one dominant palette plus one accent family, how to avoid white-page / purple-gradient drift, and how to map semantic colors into meaningful states.

### 7. `motion-playbook.md`
This file should define motion by purpose: entrance, hover, transition, and feedback. It should emphasize transform-only animation, restrained easing, and reduced-motion fallbacks.

### 8. `case-study-template.md`
This file should act like a fill-in-the-blanks narrative shell so every design brief reads as a product story: problem, audience, insight, solution, and why the chosen direction is the right emotional fit.

### 9. `output-checklist.md`
This file should be the final quality gate. It should force a pass/fail review on hierarchy, contrast, density, spacing, states, motion, and whether the design looks intentionally authored rather than assembled from defaults.

## Bootstrap Helper UX

The helper script should be treated as a small, explicit entrypoint for starting a new Vite project when the user already decided they want that path. It should not try to infer intent, and it should not silently install dependencies.

Recommended interaction model:

- require a target directory,
- require or infer a template choice from a narrow allow-list,
- print the selected actions clearly,
- fail loudly on missing arguments or invalid target paths,
- only install dependencies when an explicit install flag is supplied.

This keeps the helper useful without turning it into a second, hidden project-scaffolding system.

## Contracts

### Designer output contract
```text
DesignerResponse
- problem: string
- audience: string
- insight: string
- solution: string
- aesthetic_direction: string
- design_tokens: object
- component_specs: array
- layout_wireframe: string
- real_states: object
- motion_table: array
- assets: array
- export_spec: array
- risks: array
- traceability: object
```

### Vite bootstrap helper contract
```text
bootstrap-vite.sh
- Inputs:
  - project path
  - template choice
  - package manager preference
  - optional install flag
- Outputs:
  - scaffolded Vite project directory
  - clear stdout/stderr guidance
- Exit codes:
  - 0 on success
  - non-zero on validation or filesystem failure
```

## Test Plan

- Run `python scripts/validate-skills.py` after the skill and reference markdown changes.
- Verify that every new reference file is linked from `skills/designer/SKILL.md`.
- Verify the bootstrap helper with at least one happy path and one invalid-argument path.
- Verify the helper does not mutate unrelated paths and does not auto-install dependencies unless explicitly enabled.

## Risks

- The reference pack can become too large if it is not structured with clear topical boundaries.
- The bootstrap helper can drift into becoming a generic project generator if its scope is not kept narrow.
- If the skill becomes too prescriptive, it could overfit to a few visual styles; the reference set should therefore include multiple valid directions, not just one aesthetic.

## Subagent Plan

This change can be split into two independent implementation tracks:
- skill and reference library updates
- optional Vite bootstrap helper and related docs

The two tracks should stay aligned on naming, but they do not need to share runtime code.

## Requirement traceability

Addressed:
- stronger non-generic UI direction,
- more reference files,
- optional Vite scaffolding helper,
- documentation updates for discoverability.

Deferred:
- any actual implementation details beyond the shell helper contract, because this spec phase should remain implementation-agnostic.
