# Design: Security Guard for Agent Hooks

## Overview

Add a `crewloop-guard` executable that wraps `crewloop-shim`. The CLI installs the guard as the `PreToolUse` hook command. The guard reads the agent payload, evaluates a layered policy, and either exits non-zero to block the tool or delegates to `crewloop-shim` to preserve telemetry. Security decisions are posted to the dashboard as `security_decision` events and shown in a new Security view.

## Assumptions & Defaults

- **Default policy action:** `allow` so existing users are not disrupted.
- **Policy layering:** global `~/.crewloop/guard.yml` is loaded first, then workspace `.crewloop/guard.yml` if present; workspace rules override global rules by name.
- **Blocking support:** Kimi and OpenCode support blocking via hook exit code / plugin throw. Claude, Codex, and AGY are treated as audit-only unless future testing proves otherwise.
- **Guard location:** `packages/cli/bin/crewloop-guard.js` is exposed as a `crewloop-guard` bin by `@archznn/crewloop-cli`.
- **Event delivery:** security decisions are posted fire-and-forget to the dashboard so telemetry does not wait on network I/O.

## Proposed Directory & File Structure

```
packages/cli/
├── bin/
│   └── crewloop-guard.js              # new: guard entry point
├── src/
│   ├── guard/
│   │   ├── index.ts                   # new: argv parsing, orchestration
│   │   ├── policy.ts                  # new: load/merge/validate policy
│   │   ├── evaluator.ts               # new: match rules against normalized event
│   │   ├── normalize.ts               # new: minimal agent payload normalization
│   │   ├── post.ts                    # new: fire-and-forget POST to dashboard
│   │   └── guard.types.ts             # new: shared guard interfaces
│   ├── agents.ts                      # modify: add guardCapable flag per agent
│   ├── hooks.ts                       # modify: wrap PreToolUse command with guard when enabled
│   └── tests/
│       └── guard.test.ts              # new: evaluator + policy tests
servers/dashboard/
├── src/
│   ├── types.ts                       # modify: add 'security_decision' EventType, GuardDecision type
│   ├── state.ts                       # modify: store security decisions per session
│   ├── presenter.ts                   # modify: include security summary in session view-model
│   ├── api/
│   │   └── security.ts                # new: GET /api/sessions/:id/security
│   ├── server.ts                      # modify: register security endpoint
│   └── adapters/
│       └── shim.ts                    # modify: accept source 'guard' and build security_decision events
└── ui/
    ├── src/
    │   ├── lib/
    │   │   └── navigation.ts          # modify: add Security view to NAV_ITEMS
    │   ├── hooks/
    │   │   └── useSecurity.ts         # new: fetch security decisions
    │   ├── views/
    │   │   └── Security.tsx           # new: Security view
    │   └── tests/
    │       └── Security.test.tsx      # new: view tests
└── specs/
    ├── changes/033-security-guard/
    ├── decisions/010-security-guard-architecture.md
    └── living/cli/hooks.md
```

## File-by-File Changes

| File | Action | What changes | Design ref |
|------|--------|--------------|------------|
| `packages/cli/bin/crewloop-guard.js` | Add | Node shebang entry that imports `src/guard/index.ts`. | §Guard Binary |
| `packages/cli/src/guard/index.ts` | Add | Reads stdin, parses argv (`<agent> [--default-skill ...]`), loads policy, evaluates, posts decision, delegates to shim if allowed. | §Guard Binary |
| `packages/cli/src/guard/policy.ts` | Add | Loads YAML from `~/.crewloop/guard.yml` and workspace `.crewloop/guard.yml`, merges, validates schema, returns `GuardPolicy`. | §Policy Format |
| `packages/cli/src/guard/evaluator.ts` | Add | Matches a normalized event against policy rules and returns `GuardDecision`. | §Rule Engine |
| `packages/cli/src/guard/normalize.ts` | Add | Extracts `tool`, `tool_input`, `cwd`, `session_id` from Kimi/Claude/Codex/AGY/OpenCode payloads. | §Normalization |
| `packages/cli/src/guard/post.ts` | Add | Posts `GuardEvent` to dashboard `/event` with 100 ms timeout; swallows errors. | §Event Delivery |
| `packages/cli/src/agents.ts` | Modify | Adds `guardCapable: 'block' | 'audit' | false` to each `AgentConfig`. | §Agent Capability |
| `packages/cli/src/hooks.ts` | Modify | When guard is enabled, prepends guard command before shim in `PreToolUse` hooks; keeps shim commands unchanged for `PostToolUse`. | §Hook Installation |
| `servers/dashboard/src/types.ts` | Modify | Adds `'security_decision'` to `EventType`; adds `GuardDecision` interface. | §Event Schema |
| `servers/dashboard/src/state.ts` | Modify | Adds `securityDecisions` array to session; caps size per session. | §State Management |
| `servers/dashboard/src/api/security.ts` | Add | `GET /api/security?sessionId=...` returns decisions. | §API |
| `servers/dashboard/src/adapters/shim.ts` | Modify | Handles `source === 'guard'` by building `security_decision` events directly. | §Event Normalization |
| `servers/dashboard/ui/src/views/Security.tsx` | Add | Table of decisions with badge coloring. | §UI |

## Code Architecture & Design Patterns

- **Fail-open guard:** The guard exits `0` (allow) on any internal error so the agent is never hard-blocked by a misconfiguration.
- **Command wrapper:** Guard acts as a decorator around `crewloop-shim`, keeping shim responsibilities unchanged.
- **Policy rule engine:** Simple ordered rule list; first matching rule wins.
- **Fire-and-forget telemetry:** Security decisions are posted asynchronously so the agent tool loop is not delayed.

## Data Model & Interfaces

```typescript
// packages/cli/src/guard/guard.types.ts
export type GuardMode = 'block' | 'audit';
export type GuardAction = 'allow' | 'block';

export interface GuardRule {
  name: string;
  action: GuardAction;
  tools?: string[];
  commandMatches?: string; // RegExp source
  paths?: string[];        // glob patterns; leading '!' negates
}

export interface GuardPolicy {
  version: number;
  mode: GuardMode;
  defaultAction: GuardAction;
  rules: GuardRule[];
}

export interface NormalizedGuardEvent {
  agent: string;
  session_id: string;
  tool: string;
  input?: Record<string, unknown>;
  cwd: string;
}

export interface GuardDecision {
  action: GuardAction;
  rule?: string;
  reason?: string;
}

// servers/dashboard/src/types.ts additions
export type EventType =
  | 'session_start'
  | 'session_end'
  | 'tool_start'
  | 'tool_end'
  | 'skill_change'
  | 'security_decision';

export interface SecurityDecision {
  timestamp: number;
  tool: string;
  decision: 'allow' | 'block';
  rule?: string;
  reason?: string;
}
```

## Edge Case & Error Handling Matrix

| Scenario / Input | Expected Behavior | Return Value / Exit Code |
|------------------|-------------------|--------------------------|
| Missing policy file | Use built-in permissive default | Exit 0, allow |
| Invalid YAML / schema | Log warning to stderr, fail open | Exit 0, allow |
| Agent capability is `audit` | Evaluate policy but always exit 0; decision still posted | Exit 0 |
| Agent capability is `false` | Guard hook not installed | N/A |
| Dashboard POST fails | Ignore; do not block agent | Exit per policy decision |
| Shim delegation fails | Ignore shim failure; tool already allowed | Exit 0 |
| Rule regex invalid | Skip that rule, log warning, continue evaluation | — |
| Workspace path unknown | Treat path rules as `allow` for that check | — |

## Flow Diagrams

### PreToolUse Hook Flow

```
Agent invokes PreToolUse hook
        │
        ▼
┌─────────────────┐
│ crewloop-guard  │
│  <agent-id>     │
└────────┬────────┘
         │
    reads stdin JSON
         │
         ▼
┌─────────────────┐
│ normalize.ts    │
│ (agent-specific)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ policy.ts       │
│ load + merge    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ evaluator.ts    │
│ match rules     │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
  block     allow
    │         │
    ▼         ▼
 exit 1   post decision
 (agent    then
  blocks)  spawn crewloop-shim
           exit 0
```

## State Management & Caching

- Security decisions are stored per session in `state.ts` in a bounded array (max 1000 per session) to prevent unbounded memory growth.
- Dashboard UI polls `GET /api/security?sessionId=...` or receives WebSocket updates along with existing events.

## Performance Considerations

- Policy evaluation is synchronous and must complete in < 10 ms for typical rules.
- File path matching uses `minimatch` or a small custom matcher; avoid heavy glob libraries.
- Dashboard POST uses Node `http` with a 100 ms timeout and no retry.

## Security Considerations

- The guard itself runs with the user's privileges; it is a policy layer, not a sandbox.
- Policies are loaded only from `~/.crewloop/guard.yml` and the workspace `.crewloop/guard.yml`.
- Repository-provided policies are not loaded automatically to prevent repository owners from overriding user guard settings.
- Dangerous keys (`command`, `content`, `token`, `api_key`) are stripped from events before dashboard storage, consistent with existing sanitization.
