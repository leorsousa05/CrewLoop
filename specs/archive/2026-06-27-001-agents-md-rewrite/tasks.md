# Tasks — AGENTS.md Rewrite

## Checklist

### Preparation
- [ ] Read `references/conventions.md` for up-to-date rules
- [ ] Read `references/workflow.md` for the canonical flow
- [ ] Read all 13 `skills/*/SKILL.md` front matter (name + description)
- [ ] Read `servers/dashboard/README.md` for dashboard description
- [ ] Read `packages/cli/README.md` for CLI description
- [ ] Read root `README.md` for public project description
- [ ] Read current `AGENTS.md` (root) to extract any still-valid content
- [ ] Read current `packages/cli/AGENTS.md` to extract still-valid content
- [ ] Check `specs/decisions/001-dashboard-hybrid-architecture.md` for any architectural notes

### Root `AGENTS.md` — Rewrite
- [ ] Write **Section 1**: Title + tagline
- [ ] Write **Section 2**: Project Overview (what it is, why it exists, how consumed, what it outputs)
- [ ] Write **Section 3**: Repository Structure (accurate ASCII tree, updated)
- [ ] Write **Section 4**: Main Files — purpose table
- [ ] Write **Section 5**: Technology and Architecture
- [ ] Write **Section 6**: The 13 Skills — two tables (core 6 + supporting 7)
- [ ] Write **Section 7**: Mandatory Development Flow with numbered rules
- [ ] Write **Section 8**: AFK Mode
- [ ] Write **Section 9**: Specs Structure
- [ ] Write **Section 10**: Build, Test, and Deploy commands table
- [ ] Write **Section 11**: Security rules
- [ ] Write **Section 12**: How to Contribute
- [ ] Write **Section 13**: Notes for Agents (anti-pattern rules)

### `packages/cli/AGENTS.md` — Rewrite
- [ ] Retain: "What this package does"
- [ ] Add: "Source files at a glance" table
- [ ] Retain: Hook installation architecture (Strategy pattern)
- [ ] Retain: Hook format examples (Kimi TOML, Codex/Claude JSON, AGY JSON)
- [ ] Verify: AGY config path is `~/.gemini/config/hooks.json` (not `~/.agy/config.json`)
- [ ] Retain: CrewLoop hook identification rule (crewloop-shim)
- [ ] Retain: Matcher behavior section
- [ ] Retain: Command string section
- [ ] Retain: "How to add or modify an agent hook format" (numbered steps)
- [ ] Retain: Legacy format cleanup
- [ ] Retain: Testing section
- [ ] Retain: Conventions
- [ ] Add: "What agents should NOT do here" (anti-patterns)

### Quality Check (Reviewer)
- [ ] Root AGENTS.md has all 13 required sections in order
- [ ] All 13 skills are listed accurately
- [ ] No contradictions with `references/conventions.md`
- [ ] No contradictions with `references/workflow.md`
- [ ] No secrets, tokens, API keys, or credentials present
- [ ] No AI artifacts (placeholders, TODOs without references, "Written by AI")
- [ ] Directory tree matches actual repo structure
- [ ] AGY path is correct in cli/AGENTS.md
- [ ] AFK mode is documented
- [ ] Build commands are accurate

### Ship
- [ ] Commit: `docs: rewrite AGENTS.md files for full project coverage`
- [ ] Branch: `docs/agents-md-rewrite`
- [ ] Archive spec to `specs/archive/2026-06-27-001-agents-md-rewrite/`
