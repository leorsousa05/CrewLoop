# Spec: docs-writer-skill

## Proposed Changes

### 1. skills/docs-writer/SKILL.md
- Add guidelines for **Aesthetics & Branding** (centered title, logos, itallic slogan, and flat-square badges).
- Add guidelines for **Tables & Metrics** (before/after comparison tables, ASCII boxes, benchmarking tables).
- Add guidelines for **Interactive Details** (using `<details>` and `<summary>` for secondary information).
- Add guidelines for **GitHub Alert Callouts** (using `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`).

### 2. skills/docs-writer/references/section-templates.md
- Update the **CLI Tool** template to include centered title, logos, badges, highlights bullet style, and a details block for advanced options/benchmarks.
- Update the **Library / Package** template to include a centered layout, quick start code examples, and before/after comparison table structure.
- Update the **Web App** template to include a banner/screenshot placeholder, a detailed getting started flow, environment variable tables, and technology stack callouts.

### 3. skills/docs-writer/references/quality-checklist.md
- Add specific checks under a new "Visual & Layout" section:
  - Header is centered (if applicable)
  - Logo/Images have `alt` tags and proper fallback structures
  - No plain/boring list blocks when tables/cards are more clear
  - Collapsible panels used for long setup/log data
  - GitHub alerts used instead of plain notes
