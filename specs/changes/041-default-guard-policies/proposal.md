# Proposal: Default Security Guard Policies on Install

## Problem

When installing CrewLoop Guard, the default policy (`DEFAULT_POLICY`) operates with an empty rule set (`rules: []`) and allows all actions (`defaultAction: allow`). Users must manually craft policy files in `~/.crewloop/guard.yml` to block or require confirmation for dangerous operations like `git push` or secret exfiltration.

## Goals

1. Include default security rules in `DEFAULT_POLICY` so that high-risk operations (e.g. `git push`, force pushes) require confirmation out of the box.
2. Automatically initialize `~/.crewloop/guard.yml` during `crewloop install` if it does not already exist.
3. Ensure users can still override or disable these rules per workspace in `.crewloop/guard.yml`.

## Non-Goals

- Blocking non-destructive read operations.
- Forcing hard-coded un-overridable rules.
