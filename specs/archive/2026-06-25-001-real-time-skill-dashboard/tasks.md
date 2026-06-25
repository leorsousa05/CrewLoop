# Implementation Tasks: Real-time Skill Dashboard

## Phase 1 — Foundation

- [x] 1.1 Create `servers/dashboard/package.json` with TypeScript, `ws`, and test dependencies.
- [x] 1.2 Create `servers/dashboard/tsconfig.json` aligned with `packages/cli/tsconfig.json`.
- [x] 1.3 Implement `src/types.ts` with shared contracts (`DashboardEvent`, `Session`, `AgentSource`, etc.).
- [x] 1.4 Implement `src/config.ts` for port, bind address, and sanitization allowlist.
- [x] 1.5 Implement `src/filters/sanitize.ts` with allowlist-based filtering.
  - [x] Write `sanitize.test.ts`.
- [x] 1.6 Implement `src/state.ts` in-memory session store with event capping and pruning.
  - [x] Write `state.test.ts`.

## Phase 2 — Event Server

- [x] 2.1 Implement `src/server.ts` HTTP + WebSocket server.
- [x] 2.2 Implement `src/api/event.ts` `POST /event` handler.
- [x] 2.3 Implement `src/api/skills.ts` `GET /api/skills` handler using local filesystem skill scan.
- [x] 2.4 Implement `src/index.ts` bootstrap and graceful shutdown.
- [x] 2.5 Implement `bin/crewloop-dashboard.js` CLI entry point.
- [x] 2.6 Add `crewloop dashboard` subcommand to `packages/cli`.
- [x] 2.7 Write integration test: WebSocket snapshot + broadcast on `POST /event`.

## Phase 3 — Skill Inference

- [x] 3.1 Implement `src/skills/registry.ts` to load skill metadata from `skills/*/SKILL.md`.
- [x] 3.2 Implement `src/skills/mapping.ts` heuristic tool-to-skill map.
- [x] 3.3 Implement `src/skills/infer.ts` inference engine.
  - [x] Write `infer.test.ts`.
- [x] 3.4 Integrate inference into `POST /event` flow.

## Phase 4 — Agent Adapters

- [x] 4.1 Implement generic `src/adapters/shim.ts`.
- [x] 4.2 Implement `src/adapters/kimi.ts` normalizer.
- [x] 4.3 Implement `src/adapters/codex.ts` normalizer.
- [x] 4.4 Implement `src/adapters/opencode.ts` normalizer (used by plugin).
- [x] 4.5 Create `config-examples/kimi-code-config.toml` snippet.
- [x] 4.6 Create `config-examples/codex-hooks.json` snippet.
- [x] 4.7 Create `config-examples/opencode-plugin/crewloop-dashboard.js` plugin.
- [x] 4.8 Write shim tests for Kimi and Codex input shapes.
- [ ] 4.9 (Optional) Implement `src/adapters/log-watcher.ts` fallback.

## Phase 5 — Dashboard UI

- [x] 5.1 Create `public/index.html` with layout.
- [x] 5.2 Implement WebSocket client in `public/app.js`.
- [x] 5.3 Implement active skill card component.
- [x] 5.4 Implement event timeline component.
- [x] 5.5 Implement session selector component.
- [x] 5.6 Implement telemetry panel (tool count, duration, event rate).
- [x] 5.7 Add dark/light mode support and `prefers-reduced-motion` respect.
- [x] 5.8 Manual UI test with simulated events.

## Phase 6 — Documentation & Integration

- [x] 6.1 Write `servers/dashboard/README.md` with install and config instructions.
- [ ] 6.2 Update root `README.md` with a dashboard section (short; docs-writer may expand).
- [ ] 6.3 Add dashboard page placeholder to `docs/` (optional; docs-writer owns).
- [x] 6.4 Document known limitations (Codex file-edit hook gaps, log watcher fallback).

## Phase 7 — Quality & Review

- [x] 7.1 Run all unit and integration tests.
- [x] 7.2 Run `python scripts/validate-skills.py` to ensure skills remain valid.
- [x] 7.3 Security review: verify no sensitive data reaches the UI.
- [x] 7.4 Accessibility review of the dashboard UI.
- [ ] 7.5 Route to Reviewer for code review.

## Post-merge

- [ ] Archive spec to `specs/archive/2026-06-25-001-real-time-skill-dashboard/`.
- [ ] Update `specs/living/` with dashboard architecture note.
- [ ] Create ADR in `specs/decisions/001-dashboard-hybrid-architecture.md`.
