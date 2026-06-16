# Proposal: Link Specs to Journal Project Note

## Problem

Specs created for the Loop Engineering Agents project live in `specs/archive/`, `specs/decisions/`, and `specs/living/` inside the repository. However, they are not linked from the Obsidian vault project note (`Journal/loop-engineering-agents.md`) nor tagged consistently. This makes it hard to trace which specs belong to the project and what decisions have been recorded.

## Goal

1. Create a historical index of existing specs in `Journal/loop-engineering-agents.md`.
2. Update the `architect` skill to append new specs to the project note when they are created.
3. Update the `shipper` skill to move completed specs to the archive section of the project note when they are archived.

## Scope

- In scope: updating one Journal note and two skills (`architect`, `shipper`).
- Out of scope: changing the spec folder structure or the Obsidian MCP server.
