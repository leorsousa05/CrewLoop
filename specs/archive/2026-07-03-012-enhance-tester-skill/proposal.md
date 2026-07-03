# Proposal: Enhance Tester Skill with Ephemeral Credentials and Two-Stage Test Reports

## Motivation
To provide robust QA, the `tester` skill needs a clear two-stage verification cycle:
1. **Planning**: Outputting a detailed Test Plan/Spec first so the user can verify if the test design is comprehensive.
2. **Execution**: Running tests and outputting an Execution Report with results and error logs.
Additionally, this enhancement includes permissions and instructions for running tests, E2E validation, data formatting validation, debugging, and secure environment credentials management.

## Scope
- Update `skills/tester/SKILL.md` to:
  - Allow terminal command execution for test running and validation.
  - Implement a mandatory two-stage reporting pipeline (Test Plan for approval, and Test Execution Report).
  - Provide guidelines for E2E flow testing (Playwright, MCP tools).
  - Add guidelines for data schema and formatting validation.
  - Detail manual testing entrypoints and general debugging guidelines.
  - Establish a secure workflow for environment variables (`.env`) creation, user prompt, test run, and immediate cleanup.
- Validate the updated skill via `python3 scripts/validate-skills.py`.

## Constraints
- The `tester` skill must NOT write production code.
- The `tester` skill must NOT perform git operations.
- Guidelines must remain generic to apply across any programming language.
