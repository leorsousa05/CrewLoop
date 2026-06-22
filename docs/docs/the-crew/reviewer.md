# Reviewer

**Phase:** Quality Gate

The Reviewer inspects every diff for spec compliance, code quality, test coverage, security, performance, and AI artifacts.

## Responsibilities

- Read changed files, not just the diff.
- Produce a structured review report.
- Classify findings as critical or warnings.
- Route to Shipper (if clean) or back to Engineer/Architect (if issues found).

## Critical rules

- Never write code or fix issues during review.
- Never run git operations.
- Always reference the spec when one exists.

## Next skill

**Shipper** (approved) or **Engineer**/**Architect** (changes required).
