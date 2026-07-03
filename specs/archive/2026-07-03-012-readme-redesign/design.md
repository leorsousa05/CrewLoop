# Design Specification

## Aesthetic Direction

**Playful Crew Identity.** The README should read like a team introduction: bright role colors, a friendly hero banner, and screenshots that prove the dashboard is real. The tone is inviting but technically precise.

Design references from `skills/designer/references/aesthetic-guidelines.md`:
- **Color:** One dominant warm surface (`#FDF6E3`) + one sharp accent (`#FF6B35`) + role colors from the existing Mermaid diagram.
- **Typography:** GitHub system fonts; hierarchy via weight, size, and section emojis.
- **Layout:** Hero → hook → screenshot proof → crew tables → technical details.
- **Motion:** Static by default (Markdown); any hero graphic should feel energetic through color, not animation.
- **Accessibility:** Text on hero background must maintain ≥4.5:1 contrast. All images get descriptive alt text.

## Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `--role-orchestrator` | `#01579B` | Orchestrator badges/links |
| `--role-architect` | `#E65100` | Architect badges/links |
| `--role-designer` | `#6A1B9A` | Designer badges/links |
| `--role-engineer` | `#1B5E20` | Engineer badges/links |
| `--role-reviewer` | `#B71C1C` | Reviewer badges/links |
| `--role-shipper` | `#00695C` | Shipper badges/links |
| `--bg-hero` | `#FDF6E3` | Hero banner warm background |
| `--accent-primary` | `#FF6B35` | Primary CTA accents |
| `--accent-secondary` | `#7C3AED` | Secondary links |
| `--text-primary` | `#1F2937` | Headings |
| `--text-secondary` | `#4B5563` | Body text |

## Proposed README Structure

```text
README.md
├── Hero banner (assets/images/crewloop-hero.png)
├── Badges
├── Hook paragraph
├── Highlights (6 bullets)
├── Quick Start
├── CLI Reference & Options
├── Real-time Activity Dashboard
│   └── Screenshot (assets/screenshots/dashboard-overview.png)
├── Supported Agents & Hooks
├── Meet the Crew
│   ├── Core Crew table (color-coded role pills)
│   ├── Supporting Crew table
│   └── Skill in action screenshot (assets/screenshots/skill-active.png)
├── Workflow (Hub-and-Spoke)
│   └── Mermaid diagram (kept/evolved)
├── Repository Layout
├── Adding a New Skill
├── Releasing
├── Contributing
└── License
```

## Asset Map

| File | Dimensions | Description | Placement |
|------|------------|-------------|-----------|
| `assets/images/crewloop-hero.png` | 1200×400 | Hero banner with logo, tagline, and crew illustration | Top of README, under H1 |
| `assets/screenshots/dashboard-overview.png` | 1600×900 | Dashboard running in browser | "Real-time Activity Dashboard" section |
| `assets/screenshots/skill-active.png` | 1600×900 | Screen photo showing an active skill | "Meet the Crew" section |

## Markdown Patterns

- Hero image: `![CrewLoop hero banner](assets/images/crewloop-hero.png)`
- Dashboard screenshot: `![Dashboard overview](assets/screenshots/dashboard-overview.png)`
- Skill screenshot: `![Skill active in agent](assets/screenshots/skill-active.png)`
- Role pills in crew tables using inline `<span>` with background color (valid GFM HTML):
  ```html
  <span style="background:#01579B;color:#fff;padding:2px 8px;border-radius:9999px;">Orchestrator</span>
  ```
  Fallback: plain text if HTML is undesirable.

## Content Contracts

1. **Hero banner** must include the project name "CrewLoop" and the tagline "An AI agent crew that runs the complete software development flow".
2. **Hook paragraph** must state the documentation-first, role-based nature in ≤3 sentences.
3. **Dashboard section** must keep the default port (`7890`), environment variable `CREWLOOP_DASHBOARD_PORT`, and keyboard shortcut `Cmd/Ctrl + K`.
4. **CLI table** must preserve all commands and global flags exactly.
5. **Crew tables** must preserve all 18 skill names, links to `skills/<name>/SKILL.md`, and responsibilities.
6. **Workflow diagram** must preserve hub-and-spoke topology and flow rules.

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| User has not yet provided screenshots | Blocks final README | Spec defines exact filenames; README uses relative paths; placeholders accepted until assets arrive |
| GitHub HTML sanitizer strips inline role styles | Low | Use plain text fallback; keep semantic meaning via table |
| Large images bloat repo | Low | Optimize PNGs; keep hero ≤200KB, screenshots ≤500KB each |
| Relative paths break on npm registry view | Low | npm shows README from package root; paths resolve from GitHub repo |

## Deferred

- Animated GIFs / video walkthroughs (user did not provide).
- Dark-mode README variants (GitHub does not support this natively).
- Docusaurus docs visual refresh (out of scope).
