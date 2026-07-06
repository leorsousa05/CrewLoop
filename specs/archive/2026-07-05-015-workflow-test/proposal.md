# Proposal: Workflow Integration Test Documentation

## Motivation
The CrewLoop system operates using a multi-agent hub-and-spoke workflow where tasks transition through a defined sequence of roles: Orchestrator, Architect, Designer, Engineer, Reviewer, and Shipper/Tester. While each individual skill directory contains specific instructions and validation rules, there is currently no centralized documentation explaining how to run, coordinate, and verify a complete end-to-end integration test of this entire workflow.

By creating a dedicated `Workflow Integration Test` guide under `docs/public/docs/tools/workflow-test.md`, we provide developers and AI agents with a step-by-step verification methodology. This guide will outline the test scenario, step-by-step agent interactions, inputs, outputs, and validation criteria for each stage, facilitating the testing of the complete pipeline.

---

## 7 Architectural Analysis Questions

### 1. Domain and bounded context placement?
The changes lie within the **Documentation Bounded Context**. The specific placement is under the tools reference documentation directory at `docs/public/docs/tools/`.

### 2. Core responsibilities of new/changed components?
The new file `docs/public/docs/tools/workflow-test.md` is responsible for defining:
- The setup and objectives of a standard workflow integration test.
- The step-by-step instructions for testing each phase of the pipeline.
- The input/output expectations and verification checklists for all active agent roles.

### 3. Contracts (interfaces, types, APIs) to define or change?
There are no runtime APIs or typescript interface changes. The documentation follows the content structure contract required by the existing Vite/Docusaurus project configuration, including YAML frontmatter for Docusaurus page metadata (e.g., `sidebar_position`).

### 4. Which parts need tests per TDD skip criteria?
This task is documentation-only, which has no code branching, mutations, or side effects. Therefore, it qualifies for the TDD skip criteria. Verification is done visually by checking markdown formatting and ensuring page links work.

### 5. Architecture that minimizes ambiguity?
To eliminate ambiguity, the guide is structured chronologically, mapping the lifecycle of a task from Context Discovery to Final Testing/Review. Emojis and titles align with the roles defined in `references/conventions.md`.

### 6. Project structure changes needed?
We will introduce a single new file:
- `docs/public/docs/tools/workflow-test.md`

No existing files or configurations will be modified.

### 7. Key trade-offs?
- **Detail vs. Brevity**: A comprehensive test guide for 6 roles can be long. We solve this by using structured tables for inputs/outputs and clear checklists to ensure the page remains scannable and actionable.
- **Static vs. Live Integration**: Documenting manual test setups instead of writing automated testing scripts. This is appropriate because the primary target of these skills is LLM-based agent execution, which requires manual flow checking rather than rigid unit-testing.

---

## Scope
- Create the documentation file `docs/public/docs/tools/workflow-test.md`.
- Implement a clear layout detailing:
  - Integration Test Scenario.
  - The chronological pipeline flow (Orchestrator -> Architect -> Designer -> Engineer -> Reviewer -> Tester).
  - Concrete step-by-step validation guides for each role.
  - Verification checklist for confirming test success.

## Constraints
- The page must use standard Markdown formatting.
- It must integrate with the existing sidebar hierarchy using `sidebar_position: 3`.
- No code or logic modifications are allowed outside the specification folder `specs/changes/015-workflow-test/`.
