# Spec Delta: Validator

## Current State

`scripts/validate-skills.py` expects exactly 8 skill directories (`crewloop-hub`, `crewloop-plan`, etc.). It accepts only one conditional direct-target string: `conditional-crewloop:design-or-crewloop:code`. It has a special canonical check that validates the old Hub/Plan/Design entry shape.

## Changes

### MODIFIED
- `CANONICAL_SKILLS` set reduced to 6 directory names: `crewloop-plan`, `crewloop-design`, `crewloop-code`, `crewloop-review`, `crewloop-ship`, `crewloop-docs`.
- `DIRECT_TARGET_CONDITIONALS` set expanded to include:
  - `conditional-crewloop:design-or-crewloop:code`
  - `conditional-crewloop:review-or-crewloop:plan`
  - `conditional-crewloop:ship-or-crewloop:code`
- Canonical contract shape checks updated to validate `crewloop:plan` as the entry skill with direct route to design/code, and `crewloop:design`/`crewloop:code`/`crewloop:review`/`crewloop:ship`/`crewloop:docs` with their new routes.
- `scripts/tests/test_validate_skills.py` fixtures updated to 6 skills and new conditional strings.

## Migration Notes

The validator will fail any remaining old skill directories or old transition contracts until they are updated or removed.

## Backward Compatibility

Breaking for content: old skills must be updated. The validation script itself remains compatible with existing invocation.
