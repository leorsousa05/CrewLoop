# Proposal: Cross-Skill Obsidian Second Brain Integration

## Status
- **State:** draft
- **Created:** 2026-06-15
- **Author:** architect

## Problem Statement

The `obsidian-second-brain` skill now defines a three-layer memory architecture for the local Obsidian vault at `~/.lea`. However, the core workflow skills (`orchestrator`, `architect`, `engineer`, `reviewer`, `shipper`, `designer`, `docs-writer`) do not reference the vault or instruct the agent to use persisted memory during their work. Supporting skills (`researcher`, `maintainer`, `product-manager`, `tester`) mention Obsidian tools but only briefly.

As a result, the second brain is optional and ad-hoc. The agent may start each task with no memory of prior decisions, user preferences, conventions, or project history, wasting tokens on repeated discovery and producing inconsistent outputs.

## Goals

1. Integrate Obsidian second-brain lookups into every skill's standard workflow.
2. Define what each skill should read from `~/.lea` at the start and persist at the end.
3. Keep skills concise by referencing `obsidian-second-brain` and shared references.
4. Maintain the existing role boundaries and workflow order.

## Non-Goals

- Changing the MCP server or adding new tools.
- Moving memory responsibilities out of `obsidian-second-brain`.
- Altering the three-layer architecture itself.
- Human-in-the-loop approval for persisted notes.

## Constraints

- All skill text remains in English.
- Each skill must still route through the mandatory workflow.
- No skill may invoke another skill directly; navigation remains menu-based.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Skills become too long | Medium | Keep the memory section short and link to shared docs. |
| Excessive vault reads | Medium | Read `AGENT.md`/`MEMORY.md` once per session; search only when domain-relevant. |
| Inconsistent instructions across skills | Medium | Define a shared pattern in `references/obsidian-mcp-usage.md` and repeat a short checklist in each skill. |

## Success Criteria

- [ ] All 11 skills contain a "Memory & Context" section.
- [ ] Each skill lists its domain-specific vault targets.
- [ ] `references/obsidian-mcp-usage.md` documents per-skill targets.
- [ ] `validate-skills.py` passes after changes.
