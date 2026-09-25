# Browser Interaction Smoke

- Implemented Spec 043 for the dashboard browser acceptance preflight.
- Added the opt-in `--interaction-smoke` flag without changing the default matrix.
- Split interaction checks into `dashboard-interaction-smoke.mjs` to keep the matrix runner focused.
- Exercised mobile drawer, command palette, and filter sheet focus restoration with real CDP keyboard events.
- Exercised keyboard opening/closing of the session selector, including the clean empty state.
- Exercised reduced-motion persistence/restoration, hash history, and external font policy.
- Documented the mode in the dashboard and test guides.
- Default preflight passed `112/112` with the legacy summary shape.
- Interaction preflight passed `7/7` and combined output passed `112/112` plus `interactionSuccess: true`.
- Dashboard typecheck, production build, 351 server tests, and 89 UI tests passed.
- Skill validation, workflow contracts, and both module syntax checks passed.
- Manual visual, contrast, and screen-reader acceptance for Specs 031/032 remains pending.
