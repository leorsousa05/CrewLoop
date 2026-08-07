# Register: Bento Grid / Modular

## When to use

- Product index/overview pages that must present many heterogeneous items (features, integrations, metrics, proof points) on one scannable page.
- Information-dense marketing pages where the content genuinely varies in importance and shape — a flagship feature next to three minor ones.
- Pricing or comparison pages, changelog indexes, and "everything at a glance" product tours.

## When NOT to use

- Tools, dashboards, forms, settings — productivity surfaces get Quiet register; a bento grid on an admin console is the #1 AI-slop signature.
- Content-poor pages: if you have 3 features, you have a list, not a bento. The register needs 6+ cells of genuinely different weight.
- Long-form reading (docs, blog, editorial) — cell fragmentation destroys reading flow.
- Any page where all content has equal importance; equal content wants a plain grid, not a bento.

## Palette philosophy

- Restrained base with marketing headroom: light neutral background `H 220-260, S 10-20%, L 96-98%`, or a deep dark `H 230-260, S 15-25%, L 7-11%` for developer-brand energy.
- Cell surfaces step 2-4% in luminance from the page background — the grid is read through borders and gaps, not through heavy card fills.
- One accent family (`H` anywhere brand-appropriate, `S 70-90%, L 50-60%` in light mode) used for CTAs, key stat numerals, and at most one highlighted cell — not sprayed across every cell.
- Individual cells may each carry a small chromatic cue (a tinted icon, a colored stat), but keep cell-level tints desaturated (`S ≤40%`) so the page reads as one system, not a sticker sheet.
- Contrast posture: marketing-relaxed for display type (≥3:1 on large text) but body copy and stats stay ≥4.5:1; tinted cells must re-verify text contrast per cell.

## Typography

- This register earns a display face: a geometric or neo-grotesque for cell headlines and stat numerals (H1-equivalent 32-48px on hero cell, 20-28px on primary cells), paired with a neutral body family at 14-16px.
- Stat numerals are a first-class citizen: 40-64px, weight 600-700, tabular figures if they animate or compare.
- Cell body copy is short by construction — 1-3 lines at 14-15px, line-height 1.45-1.55. If a cell needs a paragraph, the content is miscut.
- Labels/eyebrows: 11-12px uppercase, letter-spacing 0.06-0.1em, muted tone, one per cell maximum.
- Never more than two families; the display face does the expressive work, everything else stays quiet.

## Textures & effects

- Allowed: 1px borders or 8-16px gaps as the grid separator, radius 12-20px on cells (this is the register's signature), one elevation level for hover/raised cells.
- Allowed with justification: one subtle gradient or mesh tint inside at most one hero cell; product screenshots or mini-diagrams inside cells; small icon set consistent across cells.
- Forbidden: glassmorphism stacked with gradients, per-cell neon glows, heavy noise/grain across the whole grid, mismatched radii between cells, drop shadows on every cell (shadow is a hover state, not a resting state).
- Texture budget: pick ONE decorative device for the whole page (one gradient cell, or one diagram style, or one icon tint family) — never all three.

## Motion flavor

- Posture: marketing surfaces may use more of the skill's budget than tools, but the cap still holds — 3-4 animations total, each justified.
- What earns its place: a hover lift on interactive cells (150-200ms `ease-out`, translateY -2 to -4px + shadow), one stat count-up or live number in a metric cell, a single hero-cell loop if it demonstrates the product.
- Easings: standard `ease-out`; mild spring is tolerated on marketing hover only if it never overshoots visibly — when in doubt, stay with `ease-out`.
- Off-limits: staggered scroll-reveal cascades where each cell flies in (the canonical AI-slop bento move), scroll-jacking to "assemble" the grid, cursor parallax or glow tracking across cells, independent looping animations in multiple cells (one loop max per page).

## Layout idioms

1. Asymmetric 12-col bento: one hero cell spanning 6-8 cols and 2 rows, surrounded by 2-4 col satellite cells; cell spans derived from content priority, not from a template.
2. Stat anchor: one row where a single wide cell (8 cols) carries the headline metric, flanked by narrow proof cells (2 cols each).
3. Feature constellation: 3-5 medium cells of mixed spans (4/4/4 is forbidden — mix 5/7, 4/8, 6/6) around a screenshot cell.
4. Comparison band: full-width 12-col cell splitting internally into 2-3 columns for vs/pricing content.
5. Responsive collapse: 12-col desktop → 6-col tablet (hero goes full-width) → single column mobile, preserving cell order by importance.

## Do / Don't

Do:
- Derive every cell's span from its content's actual importance — write the content inventory first, then size the grid.
- Mix cell spans asymmetrically (5/7, 4/8, full-width bands) so the page has a clear reading order.
- Keep cell content atomic: one idea, one visual, ≤3 lines of copy per cell.
- Use the hero cell for the single most important message; if you can't name it, the page isn't ready for bento.
- Test the collapsed single-column order on mobile — importance order must survive the flattening.

Don't:
- Don't ship the default 3-column-equal boilerplate bento (three equal cards, gradient icon, generic title, one-line description) — it is the AI-slop signature this register exists to avoid.
- Don't invent filler content to complete a grid shape; an empty-looking cell means the content inventory was too thin for bento.
- Don't give every cell the same visual weight (same icon size, same headline size) — hierarchy is the register's entire point.
- Don't stagger-reveal cells on scroll; the grid should be fully present on load with at most hover feedback.
- Don't nest bento inside bento or exceed ~8-10 cells per page section — beyond that, split into sections with plain bands between them.
