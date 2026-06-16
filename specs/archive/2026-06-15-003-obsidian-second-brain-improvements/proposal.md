# Proposal: Improve obsidian-second-brain Skill

## Problem

The current `obsidian-second-brain` skill is functional but too abstract. Agents using it often lack clarity on:

1. **When to stop searching and answer** — leading to too many tool calls or no calls at all.
2. **How to handle real-world prompts** — the existing examples are generic and do not cover multi-step scenarios.
3. **How to produce dashboard/summary notes** — there is no guidance for generating project status, pending decisions, or recent concepts summaries.

## Proposal

Enhance the skill with:

1. **Explicit workflow rules** defining exactly when to `search`, `read`, `learn`, or `stop`.
2. **Real-world examples** covering bug context, decision recall, concept lookup, and project status.
3. **Dashboard creation pattern** using existing `create_note`/`update_note` tools, without adding a new MCP tool.

Dashboards will be Markdown notes under `dashboards/` with structured frontmatter and generated from indexed vault data.
