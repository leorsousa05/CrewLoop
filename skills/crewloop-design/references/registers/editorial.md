# Register: Editorial

Magazine-grade reading experience. Type does the work; decoration steps aside.

## When to use

- Reading-heavy products: blogs, docs, publications, thought leadership, long-form marketing.
- Content-first brands where the text is the product (journals, research, essays, newsrooms).
- Landing pages whose pitch is a narrative, not a feature grid.

## When NOT to use

- Dashboards, admin tools, forms, consoles, or any productivity surface — use Quiet register.
- Conversion-first landing pages that need fast scanning and loud CTAs.
- Data-dense views where a 70ch measure would starve tables and charts.

## Palette philosophy

Paper and ink, plus one editorial accent. Nothing neon, nothing synthetic.

- Background: warm paper whites, `hsl(40-50, 15-35%, 94-98%)` light mode; deep ink `hsl(220-260, 10-20%, 8-14%)` dark mode.
- Text: near-black ink `hsl(220-260, 10-25%, 10-22%)`; secondary at 35-50% lightness, muted at 50-60%.
- Accent: one muted, literary color — oxblood `hsl(350-10, 35-55%, 30-42%)`, forest `hsl(140-165, 25-40%, 25-35%)`, or navy `hsl(215-235, 35-50%, 28-40%)`. Links, rules, drop caps only.
- Contrast posture: long-form body text at ≥7:1 (AAA), never the 4.5:1 floor — readers stay for minutes, not seconds.

## Typography

The hierarchy is the design. Invest everything here.

- Display: a transitional or old-style serif (e.g. Freight, Tiempos, Source Serif, Lora class) for H1/H2 — 40-72px, weight 400-600, line-height 1.05-1.2.
- Body: serif for long-form reading, 18-20px, weight 400, line-height 1.6-1.75, measure 60-75ch.
- Meta/kickers: small sans or small caps, 12-14px, letter-spacing 0.06-0.12em, uppercase.
- Pull quotes: display serif, 24-32px, italic or light weight, indented or full-width breakout.
- Allow one display + one body family, two at most. Drop caps optional — one per article, never per section.

## Textures & effects

- Allowed: hairline rules (1px, `--border` at 8-15% ink), small caps kickers, generous figure captions, margin notes.
- Forbidden: gradients, mesh, glow, glassmorphism, noise overlays, drop shadows heavier than a whisper, rounded "card" chrome around articles.
- Imagery: full-bleed or column-width figures with captions; no stock-photo fillers between paragraphs.

## Motion flavor

Near-zero. Reading surfaces must never move under the reader.

- Budget: 0-2 animations per interface. A page that renders instantly is the correct default.
- Allowed: 150-250ms `ease-out` fade on route transitions; 100-150ms underline/opacity feedback on links and buttons.
- Off-limits: scroll-triggered reveals, parallax imagery, staggered section entrances, reading-progress gimmicks that shift layout. Never animate anything mid-paragraph.
- Reduced-motion fallback: instant swap, always.

## Layout idioms

- Single centered column, 60-75ch measure, with 24-40px of breathing room per side.
- Asymmetric two-column: text column + narrow sidebar for notes, TOC, or meta (only when side content is real).
- Pull quote or figure breakout that spans wider than the text column to reset the reader's eye.
- Section markers: numbered kickers or small rules, not colored banners.
- Index/archive pages: title-led list or 2-column grid, each entry carried by headline + standfirst, not thumbnails.
- Footnote/margin-note pattern for references instead of modals.

## Do / Don't

Do:
- Set body text at 18px minimum with line-height ≥1.6.
- Use one accent color and spend it only on links, rules, and rare emphasis.
- Design the empty pull quote, footnote, and caption styles as first-class components.
- Let headlines be long and specific — editorial headlines wrap, and that's fine.
- Verify reading contrast at AAA in both light and dark mode.

Don't:
- Don't put articles in rounded cards with shadows — that's dashboard chrome, not publishing.
- Don't add hero gradients or background imagery behind body text.
- Don't shrink body copy below 16px to fit more on screen.
- Don't use more than two typefaces or more than four type sizes for body content.
- Don't animate section reveals as the reader scrolls — the text is already the reward.
