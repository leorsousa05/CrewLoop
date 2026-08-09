# ADR 010: Security Guard Hook Architecture

- **Status:** accepted
- **Date:** 2026-08-08
- **Related spec:** `specs/changes/033-security-guard/`

## Context

CrewLoop observes agent tool use through `crewloop-shim`, but it cannot intervene before a tool runs. Users want a local policy layer that can block or audit unsafe actions without relying on external services or container sandboxes. We need to decide where the guard lives, how it integrates with existing hooks, and how it reports decisions.

## Decision

We will introduce a `crewloop-guard` binary that wraps `crewloop-shim`.

- The CLI installs `crewloop-guard <agent>` as the `PreToolUse` hook when guard mode is enabled.
- The guard reads the agent payload, evaluates a layered YAML policy, and either blocks the tool (exit 1 on capable agents) or delegates to `crewloop-shim` to preserve telemetry.
- Security decisions are posted fire-and-forget to the dashboard as `security_decision` events.
- Default behavior is permissive (allow) and fail-open on any guard internal error.

## Alternatives Considered

| Alternative | Why rejected |
|-------------|--------------|
| Build guard logic directly into `crewloop-shim` | Would couple policy evaluation with telemetry forwarding and make shim behavior harder to reason about; shim should remain a passive forwarder. |
| Two separate hooks (guard + shim) | Not all agents support multiple PreToolUse hooks, and ordering is unreliable. A single wrapper command is portable. |
| LLM-based policy decisions | Adds latency, cost, and network dependency; explicit rule lists are deterministic and auditable. |
| Block by default with allow-list | Too disruptive for existing users; default-allow keeps onboarding friction low while still providing audit visibility. |

## Consequences

- **Positive:** Adds an observable, user-controlled safety layer without changing agent runtimes or dashboard internals deeply.
- **Negative:** Increases hook latency slightly and adds a new configuration surface users must learn.
- **Irreversibility:** Once users depend on guard policies for safety, changing the default to allow-everything would be a behavioral regression. We commit to maintaining the guard as a first-class CLI feature.

## References

- `specs/changes/033-security-guard/design.md`
- `packages/cli/src/hooks.ts`
- `servers/dashboard/src/adapters/shim.ts`
