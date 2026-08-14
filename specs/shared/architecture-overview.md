# Architecture Overview

> Current architecture of the CrewLoop project, merged from the former `specs/living/` domain specs. Read before designing anything that touches an existing domain.

## 1. Workflow

CrewLoop is a 7-skill role-separated workflow:

| Skill | Role | Never does |
|-------|------|-----------|
| `crewloop:plan` | Discovery, brief synthesis, spec creation, architecture, and routing | Implementation, git, review |
| `crewloop:design` | UI/UX aesthetic direction and design specs | Implementation, git |
| `crewloop:code` | Implementation, tests, and verification | Git, review, architecture |
| `crewloop:review` | Code review, quality gate, security scan | Writing code, git |
| `crewloop:ship` | Git commit, branch creation, push, and PR | Reviewing code, writing implementation |
| `crewloop:docs` | Documentation authoring | Implementation, git, architecture |

### Auto-Routing Flow

```
User request → crewloop:plan → crewloop:design (if UI) → crewloop:code → crewloop:review → crewloop:ship → done
                                  └──── no UI ────────┘
                                       ↑______ FAIL _______|
                                       |__ FAIL (after one fix) __→ crewloop:plan
```

- `crewloop:plan` evaluates the change and routes to `crewloop:design` if the spec touches UI, otherwise to `crewloop:code`.
- `crewloop:code` routes to `crewloop:review` when verification passes. If a build fails and cannot be fixed, it routes back to `crewloop:plan` with the error context.
- `crewloop:review` routes to `crewloop:ship` on PASS and back to `crewloop:code` on FAIL with the review findings.
- `crewloop:ship` routes to `done` after a successful push.
- `crewloop:docs` is invoked on demand and returns to its invoker (default `crewloop:plan`).

### User Interrupts

The user can halt the auto-route flow with explicit commands: `stop`, `pause`, `volta` / `voltar`, `re-analyze`. When any of these are detected, the current skill returns to `crewloop:plan`.

### AFK Mode

When AFK mode is active:

1. Every skill performs its task and returns control to `crewloop:plan` automatically.
2. `crewloop:plan` evaluates the workflow state and loads the next appropriate skill per the transition contract.
3. The standard phase order still applies: `crewloop:plan` → `crewloop:design` (if UI) → `crewloop:code` → `crewloop:review` → `crewloop:ship`.
4. No end-of-skill menus are presented.

### Transition Contract

The canonical transition contract lives in `references/skill-contracts.yaml`. Each `SKILL.md` contains an inline `## TRANSITION CONTRACT` capsule that must match the YAML contract.

### Spec Rules

- Every change gets a feature spec in `specs/features/<domain>/` before implementation, even a 1-line bug fix.
- Completed feature specs **stay** in `specs/features/` as the source of truth (no archiving).
- Architecture proposals go through the RFC lifecycle in `specs/changes/` (approved → ADR in `specs/shared/adrs/`; rejected → `specs/archive/`).

## 2. CLI

The `crewloop` CLI is the single entry point for installing CrewLoop skills, starting the dashboard, and configuring agent hooks.

### Commands

| Command | Description |
|---------|-------------|
| `install` | Install CrewLoop skills and configure agent hooks |
| `list` | List available skills |
| `agents` | List supported agents, hook support, and config paths (read-only) |
| `doctor` | Diagnose package, dashboard, shim, and hook setup (read-only) |
| `dashboard` | Start the real-time skill dashboard |
| `version` | Show version |
| `help` | Show help message (`crewloop help <command>` for command-specific help) |

### Output and exit codes

Output is minimalist: no color, no emoji, no spinners. stdout carries successful results and help; stderr carries errors beginning with `error:`.

| Exit code | Meaning |
|-----------|---------|
| `0` | Success |
| `1` | Runtime failure or unknown command |
| `2` | Usage error: unknown flag, missing value, unexpected argument, invalid `--port` |

Default `install` output is summarized (`installed N skills to <dir>`, `hooks: X configured, Y skipped`, `next: crewloop dashboard`). `--verbose` restores per-skill and per-hook detail. `--dry-run` lines are prefixed with `dry-run:` and never write.

`doctor` prints stable lines prefixed with `ok`, `warn`, or `error` (error-level findings go to stderr; `ok`/`warn` stay on stdout) and returns non-zero only for error-level findings.

### Global binaries

Installing `@archznn/crewloop-skills` globally exposes:

- `crewloop` — main CLI (`packages/cli/bin/crewloop.js`)
- `crewloop-shim` — agent hook entry point (`servers/dashboard/bin/crewloop-shim.js`)

### Hooks

Supported agents: `kimi`, `claude`, `codex`, `agy`, `opencode`.

`crewloop install` registers `before_tool_use` and `after_tool_use` hooks in each detected agent's config file. The hooks invoke:

```
crewloop-shim <agent> --default-skill crewloop-hub
```

The shim reads the agent payload from stdin, normalizes it to a `DashboardEvent`, and POSTs it to the dashboard at `http://127.0.0.1:7890/event`.

Use `--no-hooks` to skip hook configuration.

### Idempotency

Running `crewloop install` multiple times:

- Does not duplicate skill entries (existing skills are skipped unless `--force` is used).
- Does not duplicate hook entries.
- Creates a backup of an agent config file only when the file is actually modified.

### Skill installation layout

Installed skills keep `SKILL.md` at the skill root for agent discovery. Shared CrewLoop files are isolated beneath the reserved `_crewloop/references/` and `_crewloop/assets/` namespace so they cannot overwrite skill-local `references/` or `assets/`.

Copy mode materializes both local and shared content. `--symlink` creates a real installed wrapper, materializes the rewritten `SKILL.md`, and links the remaining local payload entries and shared directories individually. The installer never mutates children through a whole-skill-directory symlink.

### Implementation notes

- The dispatcher lives in `packages/cli/src/cli.ts`; the strict parser lives in `src/args.ts`, help topics in `src/help.ts`, output formatting in `src/output.ts`, and command handlers in `src/commands/`.
- Hook config writers live in `packages/cli/src/hooks.ts`.
- Agent metadata lives in `packages/cli/src/agents.ts`.
- Shim normalization lives in `servers/dashboard/src/adapters/shim.ts`.

## 3. Dashboard

The CrewLoop dashboard accepts normalized events from multiple agent hook sources and presents them as a unified real-time session view.

### Supported sources

| Source | Config format | Hook events |
|--------|---------------|-------------|
| `kimi` | TOML array-of-tables (`~/.kimi/config/config.toml`) | `PreToolUse` / `PostToolUse` |
| `claude` | JSON flat object (`~/.claude/config.json`) | `before_tool_use` / `after_tool_use` |
| `codex` | JSON matcher-array groups (`~/.codex/hooks.json`) | `PreToolUse` / `PostToolUse` |
| `agy` | JSON matcher-array groups (`~/.gemini/config/hooks.json`, fallback `~/.gemini/antigravity-cli/hooks.json`) | `PreToolUse` / `PostToolUse` / `AfterModel` |
| `opencode` | JavaScript plugin (`~/.config/opencode/plugins/crewloop.js`) | Tool execution and final assistant message events |

The `crewloop-shim` binary dispatches on the source name passed as the first positional argument:

```bash
crewloop-shim <kimi|claude|codex|agy|opencode|log-watcher> --default-skill crewloop-plan
```

### Normalization

Each source adapter converts its native payload into `DashboardEvent`:

```typescript
export interface DashboardEvent {
  id: string;
  timestamp: number;
  source: AgentSource;
  session_id: string;
  event_type: EventType; // session_start | session_end | tool_start | tool_end | skill_change
  tool?: string;
  skill?: string;
  detail?: string;
  status?: 'running' | 'success' | 'error';
  duration_ms?: number;
  token_usage?: TokenUsageMeasurement;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface ClientEvent {
  id: string;
  timestamp: number;
  event_type: EventType;
  tool?: string;
  detail?: string;
  status?: 'running' | 'success' | 'error';
  duration_ms?: number;
  tokenUsage?: TokenUsageMeasurement;
  skill?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}
```

The AGY adapter (`servers/dashboard/src/adapters/agy.ts`) resolves event type from `hook_event_name`, session id from `conversationId ?? sessionId ?? session_id`, deterministic pairing ids, tool name mapping from snake_case to internal names, skill inference from `SKILL.md` reads, and `--default-skill` fallback for sessions with no active skill.

### Security (ADR 005)

The dashboard is a loopback-only product, enforced in code rather than implied by bind address:

- **WebSocket Origin policy** — browser WebSocket upgrades must present an Origin matching the configured local origin; foreign origins are rejected with 403.
- **Workspace filesystem policy** — `/api/workspace-files`, `/api/file-content`, and `/api/file-diff` require a `sessionId` with a known workspace root.
- **Canonical path containment** — requested paths must be relative, resolve inside the canonical workspace root, and symlinks escaping the root are rejected (403).
- **Bounded resources** — event bodies, workspace scans, and file reads have configured limits; violations return typed 413 errors.
- **Safe errors** — API errors carry stable codes (`PATH_FORBIDDEN`, `WORKSPACE_UNAVAILABLE`, `FILE_TOO_LARGE`, `BINARY_FILE_UNSUPPORTED`, `PAYLOAD_TOO_LARGE`) and never expose absolute paths or raw stderr.

The shim runs the raw payload through `sanitize()` before forwarding; dangerous keys and verbose content are stripped.

### Token usage ingestion

The dashboard displays selected-session token usage in Overview and durable cross-session comparisons in Usage. Product collectors: Codex (hook counters or transcript tail), Kimi (counters or `wire.jsonl` streams), Claude (counters or transcript records), OpenCode (final assistant message usage), AGY (final `AfterModel` usage metadata).

`POST /ingest/usage` remains a local instrumentation fallback. Accepted usage deltas are committed transactionally to SQLite (`~/.crewloop/dashboard/telemetry.sqlite`, overridable via `CREWLOOP_TELEMETRY_DB_PATH`). `GET /api/usage/daily` returns product totals with tri-state availability (`measured`, `partial`, `unavailable`). `POST /api/usage/reset` requires exact `{"confirmation":"RESET"}` body. Tokens are the source of truth; monetary fields are estimated API-equivalent USD.

### Client views

The dashboard UI is a Vercel-style command center (persistent sidebar, top bar, main content area) with seven views registered centrally in `ui/src/lib/navigation.ts` (`NAV_ITEMS`):

1. **Overview** — command center for the selected session: Now strip, telemetry strip, live preview of last 5 tool invocations, recent-sessions strip.
2. **Sessions** — filterable, pinnable session list with sort control (`recent`/`duration`/`events`/`name`), pinned sessions persist in `localStorage`.
3. **Timeline** — tool invocations for the selected session; `tool_start`/`tool_end` collapse into one row (blue → green/red); `j`/`k` selection, `Enter` expand, `p` pause.
4. **Files** — master-detail Explorer: file tree (`role="tree"`) + viewer (code reader / diff format).
5. **Skills** — sole owner of aggregate skill/tool usage rankings.
6. **Usage** — product-level comparison (7/30/90-day, all), token totals, cost coverage, reset.
7. **Settings** — theme, density, reduced motion, auto-follow, max events, keyboard shortcuts reference.

Navigation state lives in the URL hash (`#/view?...`) via `ui/src/hooks/useHashRoute.ts` and `ui/src/lib/route.ts`. Global shortcuts: `⌘/Ctrl+K` palette, digits `1`–`7` views, `/` filter, `Esc` close. Filter bar applies to invocations/sessions by source, skill, status, tool, operation type, time range.

### Design system

8-step named type scale (`display-2xl`…`micro`, 13px body) as CSS variables + Tailwind `fontSize` tokens. Color tokens `accent-strong`, `accent-subtle`, `focus`; tokenized motion (`sheet-in`, `banner-in`, `drill-in`, …) respecting reduced motion.

### Skill inference

The dashboard does **not** guess a skill from generic tool usage. `SkillInferenceEngine` uses only: explicit `skill_change` events, `Skill` tool invocations, git Bash heuristics (`commit`/`push`/`branch`/`merge`/`tag`/`checkout` → `crewloop:ship`), preserved explicit skill, or no active skill.

### Implementation notes

- Source adapters in `servers/dashboard/src/adapters/`.
- Sanitization in `servers/dashboard/src/filters/sanitize.ts`.
- React UI in `servers/dashboard/ui/`, built by Vite into `dist/public/`, served on `http://127.0.0.1:7890`.
- Endpoints: `POST /event`, `GET /api/skills`, `GET /api/workspace-files`, `GET /api/file-content?path=...`, `GET /api/file-diff?path=...`, `POST /ingest/usage`, `GET /api/usage/daily`, `POST /api/usage/reset`, WebSocket for live updates.

## 4. Docs Site

### Stack & Shape

- **Vite + React 19 + Tailwind 3.4 SPA** (not Docusaurus). Hash routing: `#/` (landing) and `#/docs/<id>` (reader). Built with `npm run build` in `docs/` (`tsc -b && vite build`), deployed to GitHub Pages from `docs/dist` via `.github/workflows/deploy.yml`.
- Markdown content is fetched at runtime from `public/` per `sidebarConfig.ts`; `react-markdown` + `remark-gfm` render it; `mermaid` renders diagrams.
- No test runner is installed; verification = `npm run build` + `npm run lint` (oxlint).

### Design System — "Quiet Console" (shared with the dashboard)

The docs site uses the **same design tokens as the dashboard**, verbatim, defined in `docs/src/index.css`: dark default (`:root`), light overrides under `html.light`; prose tokens (`--text-prose: 15px`, `--leading-prose: 1.65`, `--measure: 68ch`); typography: JetBrains Mono chrome, Space Grotesk display headings, Plus Jakarta Sans prose; component classes `.panel`, `.label`, `.kbd`, `.chip`, `.btn-primary`, `.btn-ghost`; rules: no glass/glow/gradients/neon, hairline borders, token-based motion only.

### Theme Mechanism

`docs/src/hooks/useTheme.ts` — default dark, persists to `localStorage['crewloop-docs-theme']`, anti-FOUC inline script in `index.html`, mermaid re-initialized per theme.

### Component Map

| File | Role |
|------|------|
| `src/App.tsx` | Hash router, 56px hairline navbar (orbit brand mark + wordmark, Home/Docs/GitHub links, ThemeToggle) |
| `src/components/LandingPage.tsx` | Asymmetrical hero, SkillVisualizer, skill grids, observability screenshots, modals |
| `src/components/SkillVisualizer.tsx` | 6-phase stepper (vertical desktop, horizontal `snap-x` mobile) |
| `src/components/TerminalSimulator.tsx` | Reference terminal panel |
| `src/components/DocsLayout.tsx` | 260px sidebar, off-canvas mobile sheet, breadcrumb, shimmer skeleton, 404, prev/next cards |
| `src/components/MarkdownRenderer.tsx` | Prose overrides, alert panels, code slabs, mermaid per theme |
| `src/hooks/useTheme.ts` | Theme context |
| `src/sidebarConfig.ts` | Docs reader navigation + markdown paths |
| `index.css` / `tailwind.config.js` | Token definitions |

### Brand Asset

`public/assets/images/crewloop-logo.png` (369×369, transparent) is the single source of truth for the brand mark — orbit rings, three nodes, blue→teal→green gradient.

## 5. npm Distribution

CrewLoop is distributed through npm as two public packages under the `@archznn` scope.

| Package | Location | Contents |
|---------|----------|----------|
| `@archznn/crewloop-skills` | Repository root `package.json` | `skills/`, `references/`, `assets/`, and `servers/dashboard/` |
| `@archznn/crewloop-cli` | `packages/cli/package.json` | `crewloop` CLI installer |

### Installation

```bash
npm install -g @archznn/crewloop-cli
crewloop install
```

Selective install: `crewloop install --skill crewloop-plan --skill crewloop-code`. Custom directory: `crewloop install --target /path/to/skills`.

### Publishing

Automated via GitHub Actions (`.github/workflows/publish-npm.yml`) when a semantic-version tag is pushed: validates tag vs both `package.json` versions, publishes `@archznn/crewloop-skills` first, waits for visibility, then publishes `@archznn/crewloop-cli`. Required secret: `NPM_TOKEN`.

```bash
git tag v0.2.0
git push origin v0.2.0
```

Local dry-run: `./scripts/npm-publish-dry-run.sh`.

## 6. Supporting Team Skills

- **Core crew** — `crewloop:plan`, `crewloop:design`, `crewloop:code`, `crewloop:review`, `crewloop:ship`.
- **Supporting crew** — `crewloop:docs` (documentation authoring, returns to invoker, default `crewloop:plan`), `crewloop:code-review` (whole-codebase audits and code-debt analysis, returns to invoker, never reviews pending diffs).

`references/skill-contracts.yaml` is the machine-readable authoring contract for all 7 skills. Each runtime `SKILL.md` keeps a compact inline transition capsule so role identity, invoker behavior, direct routes, and AFK routing survive independent installation and context compaction.
