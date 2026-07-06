# Tasks: Add Diamondblock Memory Skill

## Step 1: Create Diamondblock Skill
- [x] Create `skills/diamondblock/SKILL.md` using the standard `skill-template.md` guidelines:
  - Add YAML frontmatter with `name: diamondblock` and a detailed description.
  - Define the `diamondblock` role, its mode (`MANAGE` only), and workflow guidelines.
  - Specify the usage of `get_context`, `search_memory`, `save_memory`, `update_memory`, `delete_memory`, and `log_session` tools.
  - Specify response rules and anti-patterns for memory operations.
  - Include navigation menus to return control back to the CrewLoop Hub.

## Step 2: Update Repository Docs
- [x] Edit `AGENTS.md` to:
  - Add `diamondblock` under the Supporting Skills section.
  - Briefly explain when it is invoked.
- [x] Edit `README.md` to:
  - Document the new memory capability.

## Step 3: Validation
- [x] Run the python skill validation script: `python scripts/validate-skills.py`.
