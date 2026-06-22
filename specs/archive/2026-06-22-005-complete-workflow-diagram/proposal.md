# Proposal: Expand workflow documentation with complete end-to-end diagram

## Problem

The current workflow documentation explains the skill flow skill-by-skill. It does not show the full picture: user entry points, artifacts produced at each phase, decision branches, rework loops, AFK mode, memory integration, spec archiving, and git operations.

## Why now

A complete diagram and explanation helps users understand how the entire system works as an integrated process, not just a sequence of isolated skills.

## Scope

In scope:
- Rewrite `docs/docs/workflow.md` with a comprehensive Mermaid diagram.
- Explain artifacts, decision points, loops, AFK mode, memory, and supporting skills.

Out of scope:
- Changing skill logic or AGENTS.md rules.
- Adding interactive elements.
