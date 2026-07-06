# Design: Rename Orchestrator to CrewLoop Hub

## Overview
This change renames the central workflow role from `Orchestrator` to `CrewLoop Hub` across the skill bundle, docs site, CLI defaults, and dashboard-facing labels.

The workflow itself does not change. The Hub still gathers context, routes to Architect first, and returns control between phases.

## Proposed Directory & File Structure
```text
crewloop/
├── AGENTS.md                              (Modified)
├── README.md                              (Modified)
├── references/
│   ├── conventions.md                     (Modified)
│   └── workflow.md                        (Modified)
├── packages/
│   └── cli/
│       ├── src/
│       │   ├── agents.ts                  (Modified)
│       │   └── cli.ts                    (Modified)
│       └── src/tests/hooks.test.ts        (Modified)
├── servers/
│   └── dashboard/
│       ├── src/
│       │   ├── config.ts                 (Modified)
│       │   ├── skills/registry.ts        (Modified)
│       │   ├── lib/constants.ts          (Modified)
│       │   ├── state.test.ts             (Modified)
│       │   ├── skills/infer.test.ts      (Modified)
│       │   ├── adapters/shim.test.ts     (Modified)
│       │   └── tests/*.test.ts           (Modified as needed)
├── docs/
│   ├── public/docs/core/orchestrator.md  (Renamed to crewloop-hub.md)
│   ├── src/components/LandingPage.tsx    (Modified)
│   ├── src/components/SkillVisualizer.tsx (Modified)
│   └── src/sidebarConfig.ts              (Modified)
├── skills/
│   ├── orchestrator/SKILL.md             (Renamed to crewloop-hub/SKILL.md)
│   └── crewloop-hub/SKILL.md             (New canonical location)
└── specs/
    └── changes/019-crewloop-hub-rename/
        ├── .spec.yaml                    (New)
        ├── proposal.md                  (New)
        ├── design.md                    (New)
        └── tasks.md                     (New)
```

## Architecture & Naming
- **Canonical identifier:** `crewloop-hub`
- **User-facing title:** `CrewLoop Hub`
- **Workflow role:** central router and discovery gate for all core tasks

## Behavioral Contract
- The Hub still routes to Architect first for every change.
- The Hub still coordinates Designer, Engineer, Reviewer, and Shipper.
- Supporting skills still return findings to the invoking core role, but they should refer to the hub by the new name in user-facing text.

## Data and Runtime Impact
The runtime impact is limited to skill discovery, dashboard labeling, and hook defaults. No event schema changes are required unless a test or label hardcodes the old skill name.

## Compatibility Notes
- Update tests and generated artifacts to use `crewloop-hub` as the expected default skill.
- Do not preserve `orchestrator` as the public canonical name in the documentation set.

## Verification Approach
- Search the repository for remaining canonical `orchestrator` references after patching.
- Run the skill validation script.
- Run package and dashboard tests if source changes touch their named skill expectations.
