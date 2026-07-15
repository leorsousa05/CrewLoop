# Proposal: DiamondBlock as the Default Discovery Layer

## Status

- **State:** completed
- **Superseded in part by:** `specs/changes/033-diamondblock-runtime-integration/` (2026-07-15)

## Problem Statement
CrewLoop currently treats `diamondblock` as an optional memory helper that can be used
when convenient. In practice, the DiamondBlock project already provides more than session
memory: it can retrieve context, search semantic memory, and index/search a codebase. The
current CrewLoop flow still leans on file-by-file reading even when that local intelligence
layer is available. The user wants DiamondBlock to be the default starting point for any
read-only discovery so the agent spends less token on broad manual inspection.

## Goals
1. Make DiamondBlock the default discovery layer whenever it is configured and installed.
2. Use DiamondBlock for memory retrieval, codebase search, and other read-only discovery
   before falling back to manual file-by-file exploration.
3. Update CrewLoop docs so the Hub and supporting skills know when to invoke DiamondBlock.
4. Preserve a clean fallback path when DiamondBlock is not available.

## Non-Goals
- Adding runtime integration code inside CrewLoop.
- Replacing all manual file inspection.
- Changing the broader role flow or command-free handoff contract.

## Success Criteria
- The Hub documentation explicitly prefers DiamondBlock for context, codebase search, and
  read-only discovery when the server is active.
- The DiamondBlock skill documentation names codebase indexing/search as a first-class use case.
- Supporting docs explain that DiamondBlock is the default helper for discovery, not a
  one-off optional tool.
- Existing fallback behavior remains intact when DiamondBlock is not configured.
