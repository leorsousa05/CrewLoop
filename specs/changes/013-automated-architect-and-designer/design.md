# Design Spec: Automated Architect and Designer Skills

## 1. Orchestrator Skill Changes
- Update the **Workflow** section to specify that:
  - During Discovery (Step 2), the Orchestrator must resolve all stack, package, framework, and visual design parameters.
  - The Orchestrator can execute the Architect or Designer skills directly in the main thread (without manual routing step prompts) or delegate to a subagent to write the files asynchronously.
  - Remove instructions that require the Orchestrator to wait for user confirmation between the Architect and Designer stages.

## 2. Architect Skill Changes
- Remove the **STOP CONDITIONS** or analysis questions that require user feedback.
- Change the confirmation/handoff prompt. The Architect must immediately write the files to `specs/changes/NNN-name/` and hand control back to the Orchestrator.

## 3. Designer Skill Changes
- Remove the **Discovery (2-3 questions)** section.
- Dictate that the Designer reads the existing Task Brief and specs, commits to a visual direction directly, writes the `design.md` layout spec, and returns control to the Orchestrator.
