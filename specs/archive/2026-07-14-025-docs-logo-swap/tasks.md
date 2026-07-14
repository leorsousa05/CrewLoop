# Tasks — 025 Docs Logo Swap

## Context (read first)

- Source image: `/home/arch/Downloads/Gemini_Generated_Image_5asi555asi555asi-removebg-preview.png` — 677×369 PNG, transparent background, orbit mark centered horizontally.
- User decisions (Hub): apply to **navbar brand slot + favicon**, docs only (NOT the dashboard), **with square center-crop**.
- Deploy base is `/CrewLoop/` (`docs/vite.config.ts`), so all asset URLs must be base-aware.
- Spec 024 is implemented and reviewed but unshipped; this spec ships right after it (Shipper sequences both).

## Analysis summary (Architect)

1. **Bounded context:** docs site presentation layer — static brand asset + two chrome surfaces.
2. **Responsibilities:** one new static file is the single source of truth for the mark; navbar and favicon reference it by URL.
3. **Contracts:** no TS/interface changes. The contract is the asset URL `assets/images/crewloop-logo.png` and the img `alt="CrewLoop logo"`.
4. **Tests:** skipped per TDD criteria (pure markup + static asset, no logic). Verification = `npm run build` + `npx oxlint` in `docs/` + visual read-back of the cropped PNG.
5. **Architecture:** single public asset referenced by URL in both surfaces (no bundled import → no duplicate copies).
6. **Structure:** `+ docs/public/assets/images/crewloop-logo.png`; `M docs/index.html`; `M docs/src/App.tsx`; `− docs/public/favicon.svg`.
7. **Trade-offs:** public URL (single file, base-aware) over bundled import (hashed but duplicated); favicon.svg deleted to avoid a dead asset; PIL one-off command (no script committed to the repo).

## Implementation checklist (Engineer, in order)

- [x] **Crop** the source PNG to a center square with a one-off PIL command (do NOT commit a script): crop box `(154, 0, 523, 369)` (369×369) from the 677×369 source; save to `docs/public/assets/images/crewloop-logo.png` (optimize: default PNG settings are fine, ~81KB source).
- [x] **Read back** the cropped image (ReadMediaFile) and confirm the full orbit mark is captured — rings not clipped, roughly centered. If clipped, adjust the crop box before proceeding. — Confirmed: full mark, centered, 369×369, 60KB.
- [x] `docs/index.html`: replace the favicon link with `<link rel="icon" type="image/png" href="%BASE_URL%assets/images/crewloop-logo.png" />` (`%BASE_URL%` is the Vite-html way to stay correct under `/CrewLoop/`).
- [x] Delete `docs/public/favicon.svg` (no references remain after the swap — verified by grep).
- [x] `docs/src/App.tsx` navbar brand slot: replace the Terminal-icon chip with the new mark per the Designer's treatment note (below). URL contract in React: `` `${import.meta.env.BASE_URL}assets/images/crewloop-logo.png` `` — same base-aware pattern `DocsLayout.tsx` already uses for markdown fetches. Remove the now-unused `Terminal` import if no other usage remains in the file. — Implemented per `design-ui.md` §8 (bare img 32×32, `alt=""` + `aria-hidden`, opacity hover); `Terminal` import removed.
- [x] Verify: `npm run build` and `npm run lint` in `docs/` pass. — build ✓; oxlint 0 errors, 1 pre-existing warning (TerminalSimulator, unchanged).
- [x] Sweep: `grep -rn "favicon.svg\|Terminal" docs/index.html docs/src/App.tsx` returns no stale references.

## Designer treatment note (Designer fills before Engineer starts)

- Slot treatment for the navbar brand (size, bare `<img>` vs. keeping the bordered chip), checked against both themes on the graphite chrome. Designer records the decision as a comment on this file or a short `design-ui.md` delta in this folder.

## Deferred

- Visual check in browser (same standing deferral as spec 024 — manual Reviewer walkthrough).
- Dashboard brand swap — explicitly out of scope (user decision).
- `docs/public/icons.svg` and `docs/src/assets/hero.png`/`react.svg`/`vite.svg` — pre-existing unused scaffold assets, not touched here.
