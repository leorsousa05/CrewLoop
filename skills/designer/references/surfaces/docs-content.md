# Surface: Docs & Long-Form Content

## Anatomy

Structure every docs page in this order:

1. **Top bar** — product logo, version selector, search entry, link to app/GitHub, theme toggle. Height 56-64px, sticky.
2. **Left sidebar** — full navigation tree, grouped by section with collapsible groups. Current page highlighted; current section expanded by default.
3. **Article column** — breadcrumb (section / page), H1 title, optional 1-line summary, then the content body.
4. **Right TOC** — "On this page" list of H2/H3 anchors, sticky, active item tracked on scroll.
5. **Content body** — H2 sections with consistent internal order: concept → example → reference details → edge cases.
6. **Code blocks** — inline in flow, with language label and copy button.
7. **Prev/Next pager** — links to adjacent pages in the sidebar order, at the bottom of the article.
8. **Feedback/footer row** — "Was this helpful?", "Edit this page" link, last-updated date.

## Density & spacing

- Article width: 680-760px max — never let prose span the full monitor. Sidebar 240-280px, TOC 200-240px.
- Body text 16-17px / 1.65-1.75 line-height; paragraph spacing 1em; H2 margin-top 48px, H3 32px.
- Base grid: 4px. Code blocks: 13-14px mono, 1.6 line-height, 16-24px padding.
- Line length for prose: 65-75 characters. If it exceeds 80, narrow the column.

## Navigation

- Sidebar: 2 levels expanded by default, deeper levels behind disclosure arrows. Scroll position preserved across page loads.
- TOC highlights the section currently in view (scroll-spy); clicking scrolls smoothly to the anchor.
- Mobile: sidebar collapses behind a hamburger as a slide-over drawer; TOC moves inline below the title as a collapsible list; code blocks scroll horizontally instead of wrapping.
- Search: prominent in the top bar, keyboard shortcut (`/` or `Ctrl+K`), results grouped by section with title + content snippet + highlight.

## Real states

- **Search loading:** spinner inside the results panel; **search empty:** "No results for X" with query shown and a suggestion to browse the sidebar.
- **Search error:** inline message with retry; never a silent failure.
- **404 / moved page:** list the 3-5 closest matching pages, not just "page not found".
- **Code copy success:** icon swap + "Copied" tooltip for 1.5-2s; no toast.
- **Version mismatch:** banner when viewing a non-latest version ("You're viewing docs for v2 — switch to v3").

## Motion posture

- Budget: 0-2 animations. This is a Quiet productivity surface — reading is the task.
- Allowed: hover/focus feedback at 100-150ms; sidebar group expand/collapse at 150-200ms (opacity + height via transform-free layout animation is acceptable here, or instant).
- Off-limits: page-load reveals, scroll-triggered section animations, animated TOC underlines that chase the cursor, any looping decoration. Smooth anchor scrolling is the only scroll motion, and it must respect reduced motion.

## Interaction specifics

- Code blocks: syntax highlighting with a theme that passes 4.5:1 contrast in both modes; language badge top-right; copy button top-right, always visible on touch, hover-reveal acceptable on desktop.
- Tabbed code examples (npm/yarn/pnpm, JS/TS) share one persistent choice stored across pages.
- Anchor link icon appears on heading hover/focus; every heading has a stable `id`.
- Admonitions (note / warning / tip): left border 3px + tinted background, icon + bold label, used sparingly — if every third block is a callout, none of them mean anything.
- Tables: sticky header on long tables, horizontal scroll wrapper on mobile, zebra striping only if rows lack whitespace separation.

## Default register & pairings

- Default: **Quiet / Product Default** — system or one neutral font family, restrained palette, density over spectacle.
- Works: Editorial / Magazine for thought-leadership blogs and documentation with a strong voice; Industrial / Utilitarian for developer tools that want a harder edge (monospace accents, square corners).
- Clashes: Brutalist, Playful / Toy-like, Luxury — expressive registers fight sustained reading and age badly in a reference context.

## Common pitfalls

- Prose column stretched to 1200px+ with 16px text — unreadable line lengths, the #1 AI-slop signature for this surface.
- Default `Inter` everywhere plus purple gradient accents on code blocks and links, with no product identity.
- Sidebar with every group collapsed and no active-page highlight, forcing the user to hunt for where they are.
- Code blocks without language labels, copy buttons, or horizontal scroll — lines wrapping mid-token on mobile.
- Scroll-spy TOC that animates or a page that fades sections in while the user is trying to read — motion that interrupts reading is always a defect here.
