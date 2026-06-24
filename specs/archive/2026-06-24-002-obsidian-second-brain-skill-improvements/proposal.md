# Proposal: obsidian-second-brain Skill Improvements

## WHY

The `obsidian-second-brain` skill is the single entry point for all vault operations in the Loop Engineering Agents bundle. An end-to-end review showed that the skill is comprehensive but contains ambiguities and gaps that can lead to inconsistent agent behavior.

The main issues are:

1. **Final navigation menu is incomplete**. It omits `[D] Designer` and `[S] Shipper`, even though those are standard skills in the bundle.
2. **`sync_from_bundle` and search-score thresholds are unexplained**. Agents using the skill do not know what the tool does or how to interpret search scores.
3. **"Major task" and "heartbeat" are undefined**. The skill instructs agents to read `MEMORY.md` at the start of every major task and to run a heartbeat every 2-4 sessions, but provides no criteria.
4. **The `memory/` vs `Memory/` distinction is confusing**. Both paths exist and serve different purposes, but the similarity in naming invites mistakes.
5. **Examples are missing for some layers**. `Memory/`, `Notes/`, and `_Inbox/` lack concrete usage examples.

This change tightens the skill so that every agent uses the second brain consistently and intelligently.

## Scope

- `skills/obsidian-second-brain/SKILL.md`

## Out of Scope

- Code changes to the MCP server
- Changes to other skills
- Changes to `references/obsidian-mcp-usage.md`

## Success Criteria

- Navigation menu at the end of the skill includes all relevant standard skills.
- `sync_from_bundle`, search scores, "major task", and "heartbeat" are defined.
- Layer naming is clarified or renamed to remove ambiguity.
- Every layer has at least one concrete example.
