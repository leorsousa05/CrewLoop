# Tasks: Make Diamondblock Skill Explicitly Optional

## Step 1: Update Diamondblock Skill Description & Workflow
- [x] Edit `skills/diamondblock/SKILL.md` to:
  - Explicitly declare in the frontmatter description and role description that this skill is **optional** and should only be triggered if the user's environment has the `diamondblock` MCP server configured.
  - Add a fallback/failure rule to the workflow stating that if any MCP tool call fails or the server is unavailable, the skill must fail gracefully and return control to the CrewLoop Hub with a notification of the status, without blocking the overall task.

## Step 2: Validation
- [x] Validate all 19 skills: `python3 scripts/validate-skills.py`.
