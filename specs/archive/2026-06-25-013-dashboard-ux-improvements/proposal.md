# Proposal: Dashboard UX Improvements

## WHY

The current CrewLoop dashboard (`servers/dashboard/public/`) renders the event timeline in reverse chronological order (newest first) and emits separate visual rows for `tool_start` and `tool_end`. During an active agent session this forces the user to scroll repeatedly to see what just happened, and it inflates the timeline with pairs of events for every tool call. Users also lack visibility into *what* a tool actually did: a `Read` or `Bash` event only shows a truncated detail string. Finally, there is no higher-level view of the running skills or the files the agent is touching.

This change aims to:

1. Make the timeline feel like a chat/log: chronological, auto-scrolling, and pausable on hover.
2. Collapse each tool invocation into a single live row that changes color from running (blue) to success (green) or error (red).
3. Surface meaningful tool summaries and let the user expand the full input/output.
4. Add a skill network graph ("brain view") showing active skills, tools, and files as connected nodes.
5. Add a file activity view that lists files read or edited by the agent, with diffs for edits.

## Scope

### In scope

- Timeline rendering order, scrolling, hover-pause, and expansion behavior.
- Single-row tool invocation collapsing on the client.
- Enrichment of events with sanitized tool input/output so the UI can show summaries and details.
- New dashboard sections/tabs: **Network** (skill graph) and **Files** (file activity + diffs).
- Minimal backend changes to propagate sanitized input/output and keep existing contracts backward-compatible.

### Out of scope (deferred)

- Persisting file contents or diffs across server restarts.
- Real-time diff computation for arbitrary file edits (we show whatever the tool response provides).
- Interactive graph editing or manual skill mapping.
- Mobile-specific UX redesign beyond responsive CSS tweaks.

## Constraints

- Keep the vanilla HTML/CSS/JS stack. No React, Vue, or heavy charting libraries.
- Reuse existing CSS variables and design tokens.
- Respect `prefers-reduced-motion`.
- Do not break the existing WebSocket contract; only extend it.
- Sanitize all user-facing input/output to avoid leaking secrets or executing arbitrary content.

## Success criteria

- A running agent session shows one timeline row per tool call.
- New events appear at the bottom and the timeline auto-scrolls to them.
- Hovering the timeline pauses updates for 1 second; leaving flushes pending rows.
- Tool rows can be clicked to expand sanitized input/output.
- A running tool is blue, successful tool green, failed tool red.
- The network view renders skill/tool/file nodes and edges.
- The files view shows read/edited files and diffs when available.
