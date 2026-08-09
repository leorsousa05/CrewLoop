# Design: Default Security Guard Policies on Install

## Overview

Update `DEFAULT_POLICY` in `packages/cli/src/guard/policy.ts` to include default high-risk confirmation rules and update `installer.ts` / policy initialization to write a default `~/.crewloop/guard.yml` on `crewloop install`.

## Default Rules Specification

```yaml
version: 1
mode: audit
defaultAction: allow
confirmationTimeout: 300000
rules:
  - name: confirm git push
    action: confirm
    tools:
      - Bash
      - run_command
    commandMatches: "^git\\s+push"
    confirmationTimeout: 300000
  - name: confirm git force push
    action: confirm
    tools:
      - Bash
      - run_command
    commandMatches: "^git\\s+push.*--force"
    confirmationTimeout: 300000
```

## Policy Merge Order

1. Built-in `DEFAULT_POLICY` (has `confirm git push` rule).
2. Global `~/.crewloop/guard.yml` (if present).
3. Workspace `.crewloop/guard.yml` (if present).
4. `.crewloop/confirmations.yml` remembered user decisions.
