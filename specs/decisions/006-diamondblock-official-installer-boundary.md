# ADR 006: Delegate DiamondBlock MCP Configuration to Its Official Installer

- **Status:** accepted
- **Date:** 2026-07-15
- **Spec:** `specs/changes/033-diamondblock-runtime-integration/`

## Context

CrewLoop distributes a DiamondBlock supporting skill but does not own the DiamondBlock MCP server or its per-agent configuration formats. Installing a Markdown skill does not activate an MCP server. CrewLoop currently has hook writers for dashboard telemetry, but those hooks are unrelated to MCP registration and would duplicate external ownership if extended to DiamondBlock.

The installed DiamondBlock CLI exposes `diamondblock install`, `--target <agent>`, and `--dry-run`. It is the component best positioned to track supported agents, preserve user MCP configuration, and evolve format details.

## Decision

1. Add an explicit `crewloop install --diamondblock` opt-in; normal installation never touches MCP configuration.
2. Delegate all MCP registration to the installed official `diamondblock` CLI (falling back to its `dblock` alias).
3. Run official dry-run preflight before CrewLoop mutates skills or hooks when opt-in is requested.
4. Forward an explicit CrewLoop `--agent` as DiamondBlock `--target`; without one, allow official auto-detection.
5. Do not maintain a hardcoded “common agents” list beyond CrewLoop's own parser validation; official preflight determines current intersection support.
6. Treat a requested missing binary or unsupported target as a CLI error; treat DiamondBlock absence in normal install/Doctor as optional warning only.
7. Separate static readiness from runtime activation. Binary and preflight can establish installer readiness; only exposed MCP tools inside the agent establish active runtime capability.
8. Keep runtime memory calls non-blocking and preserve manual codebase indexing fallback.

## Consequences

### Positive

- CrewLoop does not duplicate or drift from DiamondBlock's agent config writers.
- MCP mutation is explicit, previewable, and testable without touching real user files.
- Newly supported agents become available through official installer evolution without a CrewLoop writer change.
- Doctor and Hub use honest evidence levels rather than conflating package, skill, binary, config, and runtime state.
- Existing CrewLoop installs remain unchanged and DiamondBlock remains optional.

### Negative

- Successful integration depends on a separately installed compatible DiamondBlock CLI.
- Official CLI argument or exit-code changes can require adapter updates.
- Final external installation is not transactionally coupled to CrewLoop skill/hook writes; failures must report partial state.
- `crewloop doctor` cannot prove runtime tool exposure from outside an active agent session.

## Alternatives Considered

| Alternative | Verdict | Reason |
|-------------|---------|--------|
| Auto-run DiamondBlock on every CrewLoop install | Rejected | Silent mutation violates optionality and user control |
| Implement MCP config writers in CrewLoop | Rejected | Duplicates external ownership and creates multi-agent format drift |
| Diagnose/document only | Rejected | Leaves an avoidable onboarding gap despite an official installer API |
| Treat binary presence as active | Rejected | Does not prove MCP registration or tool exposure |
| Require DiamondBlock for CrewLoop | Rejected | Memory/search must remain a graceful optional enhancement |

## Operational Rule

The authoritative chain is:

```text
CrewLoop opt-in intent
  -> official installer dry-run preflight
  -> CrewLoop skills/hooks installation
  -> official DiamondBlock installation
  -> agent restart/new session
  -> runtime tool-capability verification
  -> Hub startup/search/save and Shipper/Hub wrap-up lifecycle
```
