# Spec: Spec-to-Journal Linking

## Functional Requirements

1. `Journal/loop-engineering-agents.md` must contain a "Specs" section listing all archived specs, decisions, and living specs with markdown links.
2. The `architect` skill must, after creating a new spec, invoke `obsidian-second-brain` to append a link to the new spec in `Journal/loop-engineering-agents.md` under an active specs list.
3. The `shipper` skill must, after archiving a completed spec, invoke `obsidian-second-brain` to move/update the spec link from active to archived in `Journal/loop-engineering-agents.md`.

## Non-functional Requirements

- Skills continue to create specs in `specs/changes/` and archive them to `specs/archive/` as before.
- Vault updates are append-only or idempotent — no duplicate links.
- All vault access goes through the `obsidian-second-brain` skill; no direct `Read`/`Edit`/`Write`/`Bash` on `~/.lea`.
