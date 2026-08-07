# Surface: Ecommerce

## Anatomy

1. **Announcement bar** (optional, 32-40px tall) — free shipping threshold or current promotion, dismissible, never stacked.
2. **Header** — logo left, search center or icon right, account/cart icons with cart badge count; category nav below on desktop.
3. **Catalog grid** — filter sidebar (desktop) or filter drawer (mobile) + sort control + product cards in a 2/3/4-column grid.
4. **Product detail (PDP)** — image gallery left (or top on mobile), buy box right: title, price, rating, variant selectors, quantity, primary CTA, delivery estimate, trust signals.
5. **Cart** — line items with thumbnails, quantity steppers, remove action, order summary with subtotal/shipping/total, promo code field.
6. **Checkout** — single-column stepped flow: contact → shipping → payment → review; order summary persistent in a sidebar (desktop) or collapsible section (mobile).
7. **Footer** — support links, payment method icons, legal; keep it functional, not decorative.

## Density & spacing

- Base grid: 8px spacing unit; card internal padding 12-16px, grid gaps 16-24px.
- Catalog max content width: 1200-1280px centered; checkout narrows to 960-1080px for focus.
- Product cards: 3-4 columns desktop, 2 columns mobile; never 1 column of giant cards on a grid.
- PDP gallery: 55-60% of content width; buy box 40-45%, sticky on desktop scroll.
- Line height for product titles: 1.3-1.4; truncate at 2 lines in cards, never 3+.

## Navigation

- Persistent header with search always reachable; mega-menu only if the catalog has 3+ levels, otherwise a flat category bar.
- Breadcrumbs on PDP (`Home / Category / Product`) — required for deep catalogs.
- Mobile: bottom bar with Home, Search, Cart (badged), Account; filters collapse into a full-height drawer with apply/close actions.
- Cart icon navigates to cart page on desktop; on mobile it may open a slide-over — pick one pattern per breakpoint, not both.

## Real states

- **Loading:** skeleton cards in the grid (image block + 2 text lines); never a full-page spinner for catalog loads.
- **Empty:** empty search results with query echo ("No results for 'x'"), popular categories, and a clear-filters action; empty cart with a continue-shopping CTA.
- **Error:** inline payment errors under the failing field, stock errors on the line item ("Only 2 left" / "Out of stock"), network failure with retry on checkout submit.
- **Success:** add-to-cart confirmation (mini-cart popover or toast, 200ms in, auto-dismiss ≤4s); order confirmation page with order number and next steps.
- **Out of stock:** disabled variant selector or CTA swap to "Notify me" — never hide the product silently.

## Motion posture

- Budget: ≤3 justified animations — add-to-cart feedback, cart badge/count update, image gallery transition.
- Feedback 100-200ms ease-out; gallery crossfade or horizontal slide 200-250ms; transform/opacity only.
- Never spring overshoot, never scroll-triggered reveals on catalog pages, never auto-playing carousels without user control.
- Reduced motion: instant state swaps everywhere; gallery becomes click-to-swap with no transition.

## Interaction specifics

- Primary CTA ("Add to cart") full-width on mobile, ≥48px tall; sticky bottom bar on mobile PDP so the CTA never scrolls away.
- Variant selectors: swatches for color (≥28px hit area), buttons for size with stock state visible; selecting an unavailable combo shows the consequence immediately.
- Quantity: stepper with +/- buttons ≥40px, direct input allowed.
- Checkout forms: single column, labels above inputs (never placeholder-only), address autocomplete if available, express payment options first, guest checkout default.
- One primary action per step; "back" as a text link, never a competing button style.

## Default register & pairings

- **Default: Quiet / Product Default** — the product photography carries the brand; the UI chrome stays neutral (neutral grays, one accent for price/CTA, white surfaces).
- **Works:** Luxury/Refined for premium single-brand stores (more whitespace, serif display for titles, hairline borders); Editorial for story-driven brand catalogs.
- **Clashes:** Brutalist (undermines trust at payment time), Retro-futuristic and Playful on checkout (novelty reads as risk), heavy glassmorphism anywhere near forms.

## Common pitfalls

- Fake urgency slop: countdown timers, "14 people viewing", and pulsing "Almost gone!" badges everywhere — one honest urgency signal (real stock count) per surface, if any.
- Discount theater: strikethrough on every price, stacked coupon banners, and percentage badges on half the grid — price hierarchy collapses when everything shouts.
- Carousel hero on the storefront pushing the catalog below the fold; users scroll past, conversion drops.
- Purple-gradient trust badges, glassmorphic cards, and glow shadows on product tiles — decoration competing with the photography.
- Hiding shipping costs until the last checkout step; surface the estimate on the PDP or first cart view.
