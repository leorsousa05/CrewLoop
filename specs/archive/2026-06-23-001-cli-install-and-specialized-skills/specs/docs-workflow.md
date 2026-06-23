# Delta: documentation and workflow updates

## Current state

- `README.md` lists six core skills and five supporting skills; it does not include `security-guard` or `accessibility-auditor`.
- `README.md` still documents `./scripts/install.sh` as a source-install fallback.
- `references/workflow.md` shows only the original six core roles.
- `docs/sidebars.js` lists only the existing supporting skills.
- `specs/living/npm-distribution/spec.md` mentions `./scripts/install.sh` as a source fallback.

## Desired state

All public documentation reflects the CLI-only install path and the two new supporting skills. The workflow reference shows where `security-guard` and `accessibility-auditor` fit in the optional routing.

## Files changed

### Modified

- `README.md`
  - Remove all references to `scripts/install.sh`.
  - Update the "What's in the Box?" table to include `security-guard` and `accessibility-auditor` in the Supporting Crew section.
  - Ensure the install examples use only `npm install -g @archznn/crewloop-cli && crewloop install`.
- `references/workflow.md`
  - Update the team roles table to include `security-guard` and `accessibility-auditor`.
  - Update the routing rules to mention optional security/a11y review before shipper.
  - Update the Mermaid diagram if feasible (the text rules are sufficient if diagram maintenance is risky).
- `specs/living/npm-distribution/spec.md`
  - Remove the "Source Fallback" paragraph.
- `docs/sidebars.js`
  - Add `supporting/security-guard` and `supporting/accessibility-auditor` to the Supporting Skills category.

### Added

- `docs/docs/supporting/security-guard.md`
- `docs/docs/supporting/accessibility-auditor.md`

## Workflow routing

The new skills are supporting skills, not part of the mandatory core flow. They are invoked by the orchestrator or reviewer when the context calls for it:

```
Orchestrator/Reviewer
       │
       ├─ security concerns ──► security-guard ──► Engineer / Reviewer
       │
       └─ UI/a11y concerns ───► accessibility-auditor ──► Engineer / Reviewer / Designer
```

In AFK mode, the orchestrator may optionally route through these skills before the reviewer if the task clearly involves security or UI accessibility.

## Acceptance criteria

- No mention of `scripts/install.sh` remains in `README.md` or `specs/living/npm-distribution/spec.md`.
- `README.md` lists `security-guard` and `accessibility-auditor`.
- `references/workflow.md` mentions both skills.
- `docs/sidebars.js` includes both new docs pages.
- `cd docs && npm run build` succeeds.
