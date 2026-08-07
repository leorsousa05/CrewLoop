# Spec Delta: Docs Site

## Current State

Docs site hardcodes all 19 skills: grouped sidebar in `sidebarConfig.ts`, skill cards in `LandingPage.tsx`, simulated install output in `TerminalSimulator.tsx`, and workflow nodes in `SkillVisualizer.tsx`.

## Changes

### MODIFIED
- `docs/src/sidebarConfig.ts` → sidebar lists the 8 skills (core: hub, plan, design, code, review, ship; supporting: brainstorm, docs).
- `docs/src/components/LandingPage.tsx` → 8 skill cards with new names/descriptions.
- `docs/src/components/TerminalSimulator.tsx` → simulated `crewloop install` output lists 8 skills.
- `docs/src/components/SkillVisualizer.tsx` → workflow nodes keyed by new ids; `crewloop-hub` remains the default active step.

### REMOVED
- Cards/sidebar entries/nodes for the 11 removed skills.

## Migration Notes

Docs pages for removed skills (if any under `docs/`) are deleted alongside sidebar entries.

## Backward Compatibility

Non-breaking; static content update deployed via GitHub Pages on next publish.
