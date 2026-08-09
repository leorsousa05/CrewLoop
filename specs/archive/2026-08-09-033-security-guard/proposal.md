# Proposal: Security Guard for Agent Hooks

> Metadata lives in `.spec.yaml`.

## Problem Statement

CrewLoop currently observes agent activity via `crewloop-shim` but cannot prevent unsafe tool calls. Users running AI agents on real repositories want a local, configurable guard that analyzes each `PreToolUse` event and blocks or audits actions such as destructive shell commands, reads of private keys, or writes outside the workspace.

## Goals

1. Provide a `crewloop-guard` binary that evaluates every `PreToolUse` hook against a configurable policy.
2. Support cross-agent installation (Kimi, Claude, Codex, AGY, OpenCode) with graceful degradation to audit-only mode where blocking is not supported.
3. Surface security decisions in the dashboard through a dedicated Security view.
4. Keep the guard transparent: telemetry continues to flow even when the guard blocks a tool.

## Non-Goals

- LLM-based policy interpretation or natural-language rule definitions.
- Interactive user confirmation prompts from the hook (hooks run non-interactively).
- Network egress detection beyond local filesystem path rules.
- Replacing the operating-system or container-level sandbox.

## Constraints

- The guard must never block telemetry: if policy allows, `crewloop-shim` still runs.
- The guard must fail open by default (missing or invalid policy = allow) so existing installs keep working.
- Hook latency budget: median evaluation < 10 ms per tool call on a warm process.
- The CLI package must not depend on the dashboard package at build time.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Agent does not honor hook exit code for blocking | Medium | Detect unsupported agents and run in `audit` mode by default; document behavior per agent. |
| Guard adds unacceptable latency to every tool call | Medium | Policy evaluation is local file/regex only; HTTP post to dashboard is fire-and-forget with 100 ms timeout. |
| False positives block legitimate agent work | High | Default policy is permissive; rules are explicit; provide `~/.crewloop/guard.yml` override and per-workspace config. |
| Policy configuration becomes a secret vector | Low | Never load policies from repository files unless explicitly enabled; validate rule shape and reject invalid configs. |

## Success Criteria

- [ ] Guard binary installs and runs on Kimi, blocking configured tools → verified by T1, T2
- [ ] Claude/Codex/AGY/OpenCode receive guard hooks in audit mode without breaking existing telemetry → verified by T3
- [ ] Dashboard Security view lists recent `allow`/`block` decisions with rule name and reason → verified by T5, T6
- [ ] Existing test suites still pass after changes → verified by T7
