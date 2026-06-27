# Design — CrewLoop Documentation Restructure

---

## Final Directory Structure

```
docs/docs/
├── getting-started/
│   ├── what-is-crewloop.md          ← replaces intro.md
│   ├── why-crewloop.md              ← replaces why-crewloop.md (rewrite)
│   ├── installation.md              ← replaces installation.md (fix npm CLI)
│   └── first-task.md                ← NEW — end-to-end tutorial
├── concepts/
│   ├── skills-and-roles.md          ← NEW — replaces concepts.md partially
│   ├── workflow.md                  ← NEW — replaces workflow/overview + detailed-flow
│   ├── specs.md                     ← NEW — replaces workflow/artifacts
│   ├── navigation-and-afk.md        ← NEW — replaces concepts.md + workflow/afk-mode
│   └── conventional-commits.md      ← NEW — extracted from concepts.md
├── core/
│   ├── orchestrator.md              ← rewrite (expand with full template)
│   ├── architect.md                 ← rewrite (expand)
│   ├── designer.md                  ← rewrite (expand)
│   ├── engineer.md                  ← rewrite (expand)
│   ├── reviewer.md                  ← rewrite (expand)
│   └── shipper.md                   ← rewrite (expand)
├── supporting/
│   ├── accessibility-auditor.md     ← rewrite (expand)
│   ├── docs-writer.md               ← rewrite (expand)
│   ├── maintainer.md                ← rewrite (expand)
│   ├── product-manager.md           ← rewrite (expand)
│   ├── researcher.md                ← rewrite (expand)
│   ├── security-guard.md            ← rewrite (expand)
│   └── tester.md                    ← rewrite (expand)
├── tools/
│   ├── cli.md                       ← NEW — CLI reference (all commands + flags)
│   ├── dashboard.md                 ← NEW — dashboard setup, UI, API
│   └── obsidian-mcp.md              ← NEW — Obsidian MCP server
└── contributing/
    ├── writing-a-skill.md           ← replaces contributing.md + skill-anatomy ref
    ├── repository-structure.md      ← NEW — directory tour for contributors
    ├── conventions.md               ← NEW — commits, branches, spec format
    └── publishing.md                ← NEW — npm publish, GitHub Actions

DELETED:
  docs/docs/intro.md
  docs/docs/why-crewloop.md
  docs/docs/concepts.md
  docs/docs/installation.md
  docs/docs/usage-examples.md
  docs/docs/contributing.md
  docs/docs/workflow/overview.md
  docs/docs/workflow/detailed-flow.md
  docs/docs/workflow/decision-trees.md
  docs/docs/workflow/artifacts.md
  docs/docs/workflow/afk-mode.md
```

---

## Sidebar Contract (`docs/sidebars.js`)

```js
const sidebars = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      link: { type: 'generated-index' },
      items: [
        'getting-started/what-is-crewloop',
        'getting-started/why-crewloop',
        'getting-started/installation',
        'getting-started/first-task',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      link: { type: 'generated-index' },
      items: [
        'concepts/skills-and-roles',
        'concepts/workflow',
        'concepts/specs',
        'concepts/navigation-and-afk',
        'concepts/conventional-commits',
      ],
    },
    {
      type: 'category',
      label: 'The Crew',
      link: { type: 'generated-index', description: 'Reference for all 13 CrewLoop skills.' },
      items: [
        {
          type: 'category',
          label: 'Core Skills',
          link: { type: 'generated-index', description: 'The mandatory six-skill flow.' },
          items: [
            'core/orchestrator',
            'core/architect',
            'core/designer',
            'core/engineer',
            'core/reviewer',
            'core/shipper',
          ],
        },
        {
          type: 'category',
          label: 'Supporting Skills',
          link: { type: 'generated-index', description: 'Optional specialists invoked as needed.' },
          items: [
            'supporting/docs-writer',
            'supporting/tester',
            'supporting/product-manager',
            'supporting/maintainer',
            'supporting/researcher',
            'supporting/security-guard',
            'supporting/accessibility-auditor',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Tools',
      link: { type: 'generated-index' },
      items: [
        'tools/cli',
        'tools/dashboard',
        'tools/obsidian-mcp',
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      link: { type: 'generated-index' },
      items: [
        'contributing/writing-a-skill',
        'contributing/repository-structure',
        'contributing/conventions',
        'contributing/publishing',
      ],
    },
  ],
};
```

---

## Navbar Contract (`docusaurus.config.js` — themeConfig.navbar)

```js
navbar: {
  title: 'CrewLoop',
  items: [
    {
      type: 'docSidebar',
      sidebarId: 'docsSidebar',
      position: 'left',
      label: 'Docs',
    },
    {
      to: '/docs/getting-started/installation',
      label: 'Install',
      position: 'left',
    },
    {
      to: '/docs/core/orchestrator',
      label: 'The Crew',
      position: 'left',
    },
    {
      href: 'https://github.com/leorsousa05/CrewLoop',
      label: 'GitHub',
      position: 'right',
    },
  ],
}
```

---

## Page Content Contracts

### Universal Skill Page Template
Every page in `core/` and `supporting/` MUST contain these sections in order:

```markdown
# [Skill Name]

> [One-line role description]

**Phase:** [phase name]

## Role

[2–3 sentences describing what this skill is and its job in the flow.]

## Responsibilities

[Numbered list of 4–7 concrete responsibilities.]

## What [Skill] Never Does

[Bullet list of 3–6 hard prohibitions — things other skills own.]

## Output Artifact

| Artifact | Description |
|----------|-------------|
| [name] | [what it contains] |

## Concrete Example

[A realistic, named scenario (e.g., "Adding a JWT login page") showing what this skill does step by step in that scenario.]

## Handoff

**Invoked by:** [who sends work here]
**Sends to:** [who receives work next and under what conditions]
```

---

### `getting-started/what-is-crewloop.md`
- H1: "What is CrewLoop?"
- One-liner tagline
- "CrewLoop is..." — 2-paragraph explanation: what it is and the analogy (crew of specialists)
- "13 skills, one workflow" — brief table: skill name | phase | one-line description (all 13)
- Mermaid flowchart of the full crew flow
- "What CrewLoop is not" — 3 bullets (it is not a single AI, not a build tool, not opinionated about your stack)
- CTA → Installation

### `getting-started/why-crewloop.md`
- Keep the existing content structure but rewrite for clarity
- Table: "The problem with just build it" | "CrewLoop's solution"
- "When CrewLoop shines" + "When you might not need it"
- Closing quote

### `getting-started/installation.md`
**CRITICAL FIX:** Remove all references to `./scripts/install.sh`.

Content:
- Prerequisites: Node.js 20+, a compatible AI agent
- Step 1: `npm install -g @archznn/crewloop-cli`
- Step 2: `crewloop install` (installs all skills)
- Step 2a (optional): `crewloop install --skill architect --skill engineer` (specific skills)
- Step 2b (optional): `crewloop install --agent claude` (specific agent)
- Step 3: `python scripts/validate-skills.py` (optional validation)
- "What happens next" — brief explanation of auto-detection
- Link to CLI reference for all flags

### `getting-started/first-task.md`
- Tutorial format — "Your First Task"
- Concrete scenario: "Add a search feature to a web app"
- Show each skill's output step by step (what the user sees, what the agent produces)
- Show the navigation menu at each transition
- Show the final commit message produced by Shipper
- "What to try next" → links to core skill pages

### `concepts/skills-and-roles.md`
- What a skill is (file, frontmatter, body, references/)
- The 13 skills in two tables: core (6) + supporting (7)
- Role separation rules: who owns what, who never invades what
- "The crew is not a committee" — decisions belong to one skill

### `concepts/workflow.md`
- The canonical flow diagram (Mermaid)
- "Mandatory rules" — numbered list (same 10 rules as AGENTS.md)
- "How supporting skills plug in" — diagram showing optional specialist invocation
- Decision table: "Which skill should I send this to?" — task type → skill

### `concepts/specs.md`
- What a spec is and why it exists
- Spec folder structure (ASCII tree + table)
- When to create a spec (table by change size)
- What each file contains (proposal.md, design.md, tasks.md, .spec.yaml)
- Lifecycle: changes/ → archive/ → living/

### `concepts/navigation-and-afk.md`
- The letter-based navigation menu (what it looks like, how it works)
- AFK mode: activation phrases, behavior, deactivation
- When skills auto-route vs. wait

### `concepts/conventional-commits.md`
- Format: `type(scope): description`
- Table of all allowed types
- Branch naming rules
- Examples (real ones, not foo/bar)

### `tools/cli.md`
- `@archznn/crewloop-cli` — what it does
- Install: `npm install -g @archznn/crewloop-cli`
- Commands table:
  | Command | Description |
  |---------|-------------|
  | `crewloop install` | Install all skills |
  | `crewloop install --skill <name>` | Install specific skills |
  | `crewloop install --agent <agent>` | Install for specific agent |
  | `crewloop install --target <dir>` | Install to custom directory |
  | `crewloop install --symlink` | Create symlinks |
  | `crewloop install --force` | Overwrite existing skills |
  | `crewloop install --dry-run` | Preview without installing |
  | `crewloop list` | List available skills |
  | `crewloop dashboard` | Start the dashboard |
- Supported agents table: kimi, claude, codex, agy + their config paths
- Hook identification rule (crewloop-shim)

### `tools/dashboard.md`
- What the dashboard is: real-time skill activity viewer
- Quick start: `cd servers/dashboard && npm run build && npm start`
- Or via CLI: `crewloop dashboard`
- Open `http://127.0.0.1:7890`
- Environment variables: `CREWLOOP_DASHBOARD_PORT`, `CREWLOOP_DASHBOARD_HOST`
- 7 views table (Overview, Sessions, Timeline, Network, Files, Skills, Settings)
- Event schema (TypeScript interface from README)
- Security note (binds to 127.0.0.1, strips dangerous keys)
- Agent integration: `POST /event`

### `tools/obsidian-mcp.md`
- What it is: Python MCP server bridging CrewLoop skills with an Obsidian vault
- Location: `servers/obsidian-mcp/`
- Purpose: skills can read/write to Obsidian vault as "second brain"
- Note: experimental — refer to `servers/obsidian-mcp/` for setup

### `contributing/writing-a-skill.md`
- Skill anatomy: frontmatter (name, description), body sections
- Step-by-step: copy template → fill frontmatter → write body → run validator → go through flow
- What makes a good skill: concise, role-separated, references/ for overflow
- Anti-patterns: skills that invade other roles, skills without "never does" section
- Link to `assets/templates/skill-template.md` and `references/skill-anatomy.md`

### `contributing/repository-structure.md`
- Full ASCII directory tree (same as AGENTS.md but with contributor context)
- "What lives where" — decision table
- "Where NOT to put things"

### `contributing/conventions.md`
- Conventional Commits (link to concepts/conventional-commits.md, expand for contributors)
- Branch naming
- Spec format and required files per change size
- When to create an ADR

### `contributing/publishing.md`
- How npm publishing works (automated via GitHub Actions)
- How to create a release tag: `git tag v0.x.x && git push origin v0.x.x`
- Package publish order: `@archznn/crewloop-skills` first, then `@archznn/crewloop-cli`
- Required secret: `NPM_TOKEN` (explain as env var, no real value)
- Version alignment requirement

---

## README.md Contract

Sections in order:
1. H1: `# CrewLoop`
2. One-liner tagline
3. Badges: Docs | License | Skills (13) | Validation
4. `📚 **Full documentation at [...]**`
5. **Highlights** — 6 bullets (same as current, update if needed)
6. **Quick Start** — `npm install -g @archznn/crewloop-cli` + `crewloop install` + optional flags
7. **What's in the Box** — two tables (Core Crew 6 + Supporting Crew 7) with Docs links
8. **Workflow** — Mermaid diagram + 12 flow rules (numbered)
9. **Repository Layout** — ASCII tree (updated: include `servers/obsidian-mcp/`, `docs/`)
10. **Adding a New Skill** — 4 steps
11. **Releasing** — tag-based publish workflow
12. **Contributing** — 2-line summary + link to docs
13. **License** — MIT

---

## Addressed Requirements

| Requirement | Addressed |
|------------|-----------|
| Fix broken installation.md | ✅ getting-started/installation.md with npm CLI |
| Two-audience structure | ✅ getting-started/ (users) + contributing/ (contributors) |
| Expand supporting skills | ✅ All 7 rewritten with full template |
| Add CLI reference page | ✅ tools/cli.md |
| Add Dashboard page | ✅ tools/dashboard.md |
| Add Obsidian MCP page | ✅ tools/obsidian-mcp.md |
| Restructure sidebar | ✅ 5-section sidebar contract |
| Update README for v0.7.0 | ✅ README contract |
| No broken links | ✅ All old URLs migrated; sidebar references new paths |
| npm run build passes | ✅ All referenced paths exist in new structure |

## Deferred

- Redirect plugin for old `workflow/` URLs — not added (no new npm deps allowed; Reviewer must confirm no external links exist)
- Docusaurus theme redesign — out of scope
