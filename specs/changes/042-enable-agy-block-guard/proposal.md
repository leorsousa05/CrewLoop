# Proposal: Enable Blocking Guard Capability for AGY

## Problem

AGY is currently defined as `guardCapable: 'audit'` in `packages/cli/src/agents.ts`. Consequently, Security Guard cannot block tool execution or pause for human confirmation when AGY runs high-risk operations (such as `git push`).

## Goals

1. Update AGY agent configuration in `packages/cli/src/agents.ts` to `guardCapable: 'block'`.
2. Update CLI unit test assertions to reflect `guardCapable: 'block'` for AGY.

## Non-Goals

- Changing behavior for other agents.
