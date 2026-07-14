# Design Delta — 025 Docs Logo Swap (navbar brand slot + favicon)

> Delta scope only. The full system is spec 024's `design-ui.md` (Quiet Console); this note governs exactly one slot: the brand mark in the 56px hairline navbar, plus the favicon that shares the asset.

## 1. Case-study frame

- **Problem:** the docs navbar currently brands itself with a generic Phosphor `Terminal` glyph in a hairline chip — an icon, not an identity. The product now has a real mark (orbit rings, three nodes) and the chrome should carry it.
- **Audience:** developers evaluating CrewLoop; they read the navbar for ~200ms before scrolling. Brand recognition happens at the mark, not the wordmark.
- **Insight:** Quiet Console's rule is "nothing glows except what is live." A logo is the sanctioned exception — the one full-color artifact on graphite chrome. Giving it a bordered chip would demote it to "just another icon."
- **Solution:** the mark rides bare — no chip, no border — at optical size, next to the unchanged Space Grotesk wordmark.

## 2. Aesthetic direction

**Industrial/console continuity** (the established thesis from specs 023/024 — this delta does not introduce a new one). References: `aesthetic-guidelines.md` (one dominant thesis; color semantic, not decorative — the mark is identity, so its color is exempt from the graphite rule) and `layout-patterns.md` (dense utility stack: the navbar is a console rail; the brand cluster is its left anchor).

## 3. Slot treatment (the decision)

| Property | Value | Rationale |
|----------|-------|-----------|
| Container | **Bare `<img>`, no chip** — no `border`, no `bg-elevated`, no radius | A hairline chip behind a transparent full-color mark reads as "sticker in a box"; the border competes with the orbit rings. Bare mark = product-logo convention (Vercel/Linear pattern). |
| Size | **32×32** (`h-8 w-8`), `object-contain` | The old chip was 28px filled; a bare thin-stroke mark at 28px reads optically smaller. 32px restores optical parity against the 16px wordmark. |
| Layout | Same left brand cluster, `gap-2.5` to the wordmark, button hit area unchanged (≥44px via navbar padding) | Structure untouched; only the glyph slot changes. |
| Wordmark | Unchanged (`font-display`, `text-heading`, "CrewLoop") | The mark replaces the icon, not the name. |
| Hover | `opacity-85 → opacity-100`, `transition-opacity` 150ms ease-out | Same affordance language as the landing's agent icons; opacity-only, reduced-motion safe. |
| Focus | Global 2px `--focus` ring on the parent button (unchanged) | a11y guardrail from `aesthetic-guidelines.md`. |

## 4. Theme legibility (both themes verified by construction)

- **Light theme (`html.light`):** all three node colors (blue/teal/green) sit well above the paper background — no risk.
- **Dark theme:** the teal/green arcs and nodes carry the shape; the **dark-blue ring segment and node will partially sink** into `--bg-surface` graphite. Accepted risk: the mark stays identifiable from the bright arcs at 32px. If the deferred visual walkthrough judges it illegible, the follow-up is a padded `bg-surface` rounded badge variant (radius-md, 4px padding) — NOT a recolor of the asset.
- **Favicon:** same PNG at 16px; browsers downscale cleanly (transparent background preserved). No separate favicon sizes generated in this delta.

## 5. States

- **Default/hover/focus:** per §3. No active/disabled states exist for a brand link.
- **Loading:** static asset in `public/` — no async state.
- **Error (404 asset):** browser alt text fallback; acceptable for a static deploy asset.

## 6. a11y

- The visible wordmark already names the brand, so the image is decorative: `alt=""` + `aria-hidden="true"` — avoids the duplicated announcement "CrewLoop logo CrewLoop". **This overrides the Architect's `alt="CrewLoop logo"` contract** (design-domain call; recorded here for traceability).
- Touch target: the parent button keeps ≥44px height from navbar padding — unchanged.

## 7. Motion

None new. The opacity hover is the only transition (150ms, covered by the global reduced-motion kill-switch).

## 8. Implementation contract (for Engineer)

- Replace the chip `<span>` (icon + border classes) with:
  `<img src={`${import.meta.env.BASE_URL}assets/images/crewloop-logo.png`} alt="" aria-hidden="true" className="h-8 w-8 object-contain opacity-85 transition-opacity group-hover:opacity-100" />`
  (class list is the contract; Engineer may adjust only if the crop read-back forces it.)
- Remove the `Terminal` import from `App.tsx` if no other usage remains.
- Favicon per `tasks.md`: `%BASE_URL%assets/images/crewloop-logo.png`, `type="image/png"`; delete `favicon.svg`.

## 9. Deferred

- Visual confirmation on both themes (standing walkthrough deferral, spec 024).
- Dashboard brand slot — out of scope (user decision).
- Multi-size favicon set (32/180/192/512) — single PNG ships now; set is a follow-up if needed.
