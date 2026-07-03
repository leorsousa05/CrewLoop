# Section Templates

README skeletons for each project type. Copy the relevant template, fill placeholders, and adapt to the project.

## Contents

- [CLI tool](#cli-tool)
- [Library / package](#library--package)
- [Web app](#web-app)
- [Framework](#framework)
- [Monorepo](#monorepo)
- [Skill bundle](#skill-bundle)
- [Module / feature doc](#module--feature-doc)
- [Section-by-section guidance](#section-by-section-guidance)

---

## CLI Tool

```markdown
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png">
    <img src="assets/logo.png" width="220" alt="{{name}} logo">
  </picture>
</p>

<h1 align="center">{{name}}</h1>

<p align="center">
  <em>{{one-liner}}</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/{{name}}"><img src="https://img.shields.io/npm/v/{{name}}?style=flat-square&color=111111" alt="npm version"></a>
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT License"></a>
</p>

- **Feature one:** short explanation.
- **Feature two:** short explanation.
- **Feature three:** short explanation.

## Install

\`\`\`bash
npm install -g {{name}}
\`\`\`

Requires Node.js {{node-version}}+.

## Usage

\`\`\`bash
{{name}} {{basic-command}}
{{name}} {{command-with-flag}}
\`\`\`

<details>
<summary><strong>Advanced Options</strong></summary>

\`\`\`
-o, --output <file>    Description
-v, --verbose          Description
-h, --help             Show help
-V, --version          Show version
\`\`\`

</details>

## API

\`\`\`typescript
import { {{mainExport}} } from "{{name}}";

const result = await {{mainExport}}({{args}});
\`\`\`

## License

[MIT](LICENSE.md)
```

### Notes

- Lead with centered logo picture, title + italic slogan + flat-square badges block for visual impact.
- Feature list goes above the fold (no heading needed, just a bullet list).
- Show `npm install -g` first (global install for CLIs), then `npx` as alternative if applicable.
- Usage section: 3-5 real commands, simplest first. Show actual flags, not pseudocode.
- Use `<details>` collapsible panels for long lists of Options or advanced commands.
- API section: only include if the CLI also exports a programmatic API. Otherwise omit.

---

## Library / Package

```markdown
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png">
    <img src="assets/logo.png" width="220" alt="{{name}} logo">
  </picture>
</p>

<h1 align="center">{{name}}</h1>

<p align="center">
  <em>{{one-liner}}</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/{{name}}"><img alt="npm version" src="https://img.shields.io/npm/v/{{name}}?style=flat-square&color=111111"></a>
  <a href="LICENSE.md"><img alt="License" src="https://img.shields.io/badge/license-MIT-111111?style=flat-square"></a>
</p>

- **Highlight one:** short description.
- **Highlight two:** short description.

## Before / After

<table>
<tr>
<td width="50%">

### 🗣️ Verbose / Traditional
\`\`\`tsx
// Old way
import { Component } from "old-library";
const app = () => <Component option={true} />;
\`\`\`

</td>
<td width="50%">

### ⚡ Clean / Optimized
\`\`\`tsx
// With {{name}}
import { {{mainExport}} } from "{{name}}";
const app = () => <{{mainExport}} />;
\`\`\`

</td>
</tr>
</table>

## Quick Start

\`\`\`bash
npm install {{name}}
\`\`\`

\`\`\`tsx
import { {{mainExport}} } from "{{name}}"

const result = {{mainExport}}();
\`\`\`

## Usage

\`\`\`tsx
// Pattern description
import { {{mainExport}} } from "{{name}}"
\`\`\`

All components/functions accept these props/options:

- `option`: description (default: `value`)

## License

[MIT](LICENSE.md)
```

### Notes

- Lead with centered logo picture, title + italic slogan + flat-square badges block.
- Include a visual "Before / After" comparison table showing the improvement or clean API comparison.
- Quick Start = install + minimal working example in under 10 lines total.
- Usage section shows import patterns and common configurations.
- Prop/option list uses inline code for names and defaults.
- Link to external docs site if one exists (add a Documentation section after Highlights).

---

## Web App

```markdown
<p align="center">
  <img src="assets/preview-mockup.png" width="860" alt="{{name}} visual preview">
</p>

# {{name}}

{{one-liner describing what the app does and who it's for}}

## Features

- **Feature one:** short explanation.
- **Feature two:** short explanation.
- **Feature three:** short explanation.

## Getting Started

\`\`\`bash
git clone https://github.com/{{owner}}/{{repo}}.git
cd {{repo}}
npm install
cp .env.example .env.local
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `API_KEY` | Third-party API key | Yes |

## Tech Stack

- [Next.js](https://nextjs.org/): framework
- [TypeScript](https://www.typescriptlang.org/): language
- [Tailwind CSS](https://tailwindcss.com/): styling

## License

[MIT](LICENSE.md)
```

### Notes

- Lead with a visual banner or desktop screenshot mockup (`assets/preview-mockup.png`) to give a rich visual impression of the application.
- No registry badges for private apps (since they're not published to npm/crates/PyPI).
- Getting Started replaces Install: readers need to clone and configure.
- Environment variables table is critical. Include `.env.example` in the repo.
- Tech Stack is optional but helps contributors understand the codebase.
- Never ship the default create-next-app README. Replace it immediately.

---

## Framework

```markdown
# {{name}}

[![npm version](https://img.shields.io/npm/v/{{name}}.svg)](https://www.npmjs.com/package/{{name}})
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

{{one-liner explaining the core value proposition}}

## Features

- **Feature one:** detailed explanation of what it does and why it matters.
- **Feature two:** detailed explanation.
- **Feature three:** detailed explanation.

## Install

\`\`\`bash
npm install {{name}}
\`\`\`

## Quick Start

\`\`\`typescript
{{minimal-working-example}}
\`\`\`

## Usage

### Basic

\`\`\`typescript
{{basic-usage}}
\`\`\`

### Advanced

\`\`\`typescript
{{advanced-usage-with-configuration}}
\`\`\`

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `option` | `string` | `"default"` | What it controls |

## Requirements

- Node.js {{version}}+
- {{other-dependency}}

## License

[MIT](LICENSE.md)
```

### Notes

- Feature descriptions are longer than for CLIs and libraries: explain the "why" alongside the "what".
- Progressive disclosure: Quick Start (5 lines) → Basic Usage → Advanced Usage → Configuration reference.
- Configuration table with types and defaults is essential for frameworks.
- Requirements section is more important here: frameworks often have specific runtime needs.

---

## Monorepo (published)

```markdown
# {{name}}

{{one-liner}}

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`{{pkg-a}}`](packages/{{pkg-a}}) | What it does | [![npm](https://img.shields.io/npm/v/{{pkg-a}}.svg)](https://www.npmjs.com/package/{{pkg-a}}) |
| [`{{pkg-b}}`](packages/{{pkg-b}}) | What it does | [![npm](https://img.shields.io/npm/v/{{pkg-b}}.svg)](https://www.npmjs.com/package/{{pkg-b}}) |

## Getting Started

\`\`\`bash
git clone https://github.com/{{owner}}/{{repo}}.git
cd {{repo}}
npm install
npm run dev
\`\`\`

## Development

\`\`\`bash
npm run build       # Build all packages
npm run test        # Run all tests
npm run lint        # Lint all packages
\`\`\`

## Contributing

See individual package READMEs for package-specific setup.

## License

[MIT](LICENSE.md)
```

### Notes

- The packages table is the centerpiece: it's how readers discover what's in the monorepo.
- Link each package name to its directory (which should have its own README).
- Version badges in the table give at-a-glance status for each package.
- Development commands run from root using the workspace tool (turbo, nx, etc.).

---

## Monorepo (private / internal)

Use this when the monorepo is not published to a registry (`"private": true` in package.json, no npm publish). No badges, no version column. Focus on getting a contributor running fast.

```markdown
# {{name}}

{{one-liner}}

## Requirements

- Node {{node-version}}+ (npm {{npm-version}}, see `packageManager` in `package.json`)
- {{additional-runtime}} (e.g., Python 3 for pipeline scripts)

## Quick start

\`\`\`bash
npm install
{{additional-setup-commands}}
npm run dev
\`\`\`

## Workspaces

| Package | Purpose |
|---------|---------|
| [`{{app-a}}`](apps/{{app-a}}) | What it does |
| [`{{pkg-a}}`](packages/{{pkg-a}}) | What it does |
| [`{{pkg-b}}`](packages/{{pkg-b}}) | What it does |

## Common commands

\`\`\`bash
npm run build            # build all workspaces
npm run typecheck        # type-check applicable workspaces
{{project-specific commands with inline comments}}
\`\`\`

{{optional: one paragraph on what is gitignored and why}}
```

### Notes

- No badges, no version column: private packages have no registry presence.
- "Workspaces" instead of "Packages" reads clearer for mixed app + package monorepos.
- "Purpose" column instead of "Description" encourages specific, action-oriented text.
- Requirements section is critical when multiple runtimes are needed (Node + Python, Node + Rust).
- List setup commands for secondary runtimes in Quick start (e.g., `npm run setup:python`).
- Common commands section replaces "Development": show the commands people actually run, not generic build/test/lint.

---

## Skill Bundle

```markdown
# {{name}}

{{one-liner}}

## Quick Start

\`\`\`bash
npx skills add {{owner}}/{{repo}} -g --all -y
\`\`\`

Supports OpenCode, Claude Code, Codex, and Cursor. Install a single skill with `--skill <name>`.

## Skills

| Skill | Phase | What it does |
|-------|-------|-------------|
| `{{skill-a}}` | {{phase}} | {{description}} |
| `{{skill-b}}` | {{phase}} | {{description}} |

## Contributing

Edit the files in `skills/`. Keep `SKILL.md` concise and use reference files for detail.
```

### Notes

- Quick Start is the single install command, nothing else needed.
- Skills table is the core content. One row per skill with phase and description.
- Contributing section is minimal: point to the skills/ directory.
- No license section needed if the bundle is not a published package (add one if it is).

---

## Module / Feature Doc

For documenting a module, feature, or capability within a larger project.

```markdown
# {{name}}

{{one-liner describing what this module/feature does}}

## Overview

{{2-3 sentences on purpose, scope, and where it fits in the project}}

## Usage

\`\`\`{{language}}
{{minimal-working-example}}
\`\`\`

### Common patterns

\`\`\`{{language}}
{{pattern-one}}
\`\`\`

\`\`\`{{language}}
{{pattern-two}}
\`\`\`

## API / Interface

| Name | Type | Description |
|------|------|-------------|
| `{{function}}` | `({{args}}) => {{return}}` | What it does |
| `{{config}}` | `{{type}}` | Configuration option |

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `{{option}}` | `{{type}}` | `{{default}}` | What it controls |

## Related

- [{{related-doc}}]({{path}})
- [{{another-doc}}]({{path}})
```

### Notes

- One module/feature = one doc file. Keep it focused.
- Usage examples must be copy-pasteable and runnable.
- API table documents the public surface only.
- Link to related docs for context and navigation.

---

## Section-by-Section Guidance

### Title

- Use the project name exactly as it appears in `package.json` `name` field (or equivalent).
- Never use "About", "Introduction", or "Overview" as the first heading.
- For published packages: centered HTML title (`<h1 align="center">`) or `# name`.
- For apps and internal tools: plain `# name`.

### One-liner

- One sentence directly below the title. No heading.
- Answers: "What does this do?" in plain language.
- Bad: "This is a tool that helps you manage your configurations."
- Good: "Manage configurations across environments with type-safe schemas."

### Feature list

- Bullet list with bold lead + short explanation.
- 5-9 features. More than 9 means you need subheadings or a docs site.
- Place above the fold (before Install) so readers see value before effort.
- Format: `- **Feature name:** what it does.` (not `- **Feature name** - what it does.`)

### Install

- Show the single fastest path. For npm packages: `npm install {{name}}`.
- Add global flag for CLIs: `npm install -g {{name}}`.
- Show `npx` alternative only if it's the primary usage pattern.
- List requirements immediately after the install command (Node.js version, system deps).

### Usage / Quick Start

- Start with the simplest possible example that produces a visible result.
- Every code block must be copy-pasteable and runnable without modification.
- Use realistic values. Never use `foo`, `bar`, `example`, or `test` as values.
- Show 3-5 examples. First is basic, last is advanced.
- For CLIs: show actual terminal commands with real flags.
- For libraries: show import + minimal usage in under 10 lines.

### Options / API reference

- CLIs: paste `--help` output as a code block. Keep it as-is.
- Libraries: list exported functions/components with their signatures.
- Use tables for structured option docs (name, type, default, description).
- Only document public API. Internal functions stay internal.

### Environment variables

- Table format: variable name, description, required/optional.
- Ship a `.env.example` file in the repo with placeholder values.
- Never include real API keys or secrets in examples.

### License

- Always include. One line: `[MIT](LICENSE.md)` or equivalent.
- Use a link to the LICENSE file, not the full license text.
