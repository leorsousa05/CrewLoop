# Design: Enhance Tester Skill Instructions

## Directory Structure
This change modifies the following files:
```
crewloop/
└── skills/
    └── tester/
        └── SKILL.md                 # Target file to update
```

## Role & Permissions Architecture
We enforce a strict separation of concerns (Clean Architecture applied to Agent Workflow).
- **Core Principle**: Tester verifies, Engineer implements, Shipper ships.
- **Changed Boundary**: Tester is now permitted to execute terminal commands (run tests, execute scripts, check environments). 
- **Preserved Boundary**: Tester is strictly prohibited from writing production code or mutating git state.

### Design Pattern: Secure Credential Lifecycle
To prevent credential leaks, the Tester must follow a strict lifecycle pattern for environment variables:
1. **Instantiation**: Generate a `.env` template with empty placeholder values.
2. **User Interaction**: Prompt the user to fill in the required credentials.
3. **Execution**: Run E2E or integration tests utilizing the local environment.
4. **Destruction**: Delete the `.env` file before returning control to the Orchestrator.

### Design Pattern: Two-Stage Testing Workflow
To allow user-side evaluation of test design before running tests:
1. **Stage 1 (Test Specification / Plan)**: Prior to writing or running any test scripts, the Tester must analyze the codebase/specs and produce a **Test Specification / Plan** (Report 1). This plan must contain the test cases, happy path, edge cases, error paths, frameworks, and environments. The Tester presents this and waits for approval.
2. **Stage 2 (Test Execution Report)**: Once approved, the Tester executes the tests (running terminal commands, Playwright, etc.) and compiles a **Test Execution Report** (Report 2) with test cases status, environment details, and logs/errors for failing assertions.

## Content Design for SKILL.md
We will structure the new guidelines into `skills/tester/SKILL.md` under the following sections:

### 1. Mode Update
Update `MODE` to allow running terminal commands:
- **VERIFY and EXECUTE tests.** Analyze, design, run, and critique tests.
- **NEVER write production code** — Route implementation to the engineer skill.
- **NEVER run git operations** — Branch, commit, and PR belong to the shipper.

### 2. Workflow Update (Two-Stage Pipeline)
#### Step 1: Understand the Context
Read the spec, the implementation, and existing tests. Identify the behaviors, gaps, and edge cases.
#### Step 2: Design the Test Spec (Stage 1 Report)
Create a **Test Specification / Plan** containing:
- Proposed testing frameworks and tools.
- Test scenarios (Happy paths, Edge cases, Error paths).
- Data mapping and structures to validate.
- Presentation: Output this report to the user and wait for approval.
#### Step 3: Execute & Verify (Stage 2 Report)
Once approved:
- Setup environments (e.g. temporary secrets) and run the tests.
- Compile and output a **Test Execution Report** detailing:
  - List of test cases executed and their status (PASS/FAIL).
  - Target test environments and execution commands.
  - Logs, stack traces, and verbose console output for failures.
- Immediately clean up any temporary credentials/files.

### 3. Testing Scenarios & Guidelines
- E2E & Flow Testing (Playwright, MCP).
- Data & Integration Validation (Scraping structure, schemas).
- Manual/Alternative Testing & Debugging (Java `main` entrypoints).
- Secure Credential Lifecycle (Creation, prompt, execution, destruction of `.env`).
