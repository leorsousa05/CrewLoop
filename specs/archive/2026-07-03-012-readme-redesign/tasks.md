# Implementation Tasks

## Phase 1: Asset Preparation

- [x] Obtain `assets/images/crewloop-hero.png` from user or generate a placeholder.
- [x] Obtain `assets/screenshots/dashboard-overview.png` from user.
- [x] Obtain `assets/screenshots/skill-active.png` from user.
- [x] Optimize all images (e.g., `oxipng` or ImageMagick) to keep total added size ≤1MB.
- [x] Verify images render correctly in a Markdown preview.

## Phase 2: README Rewrite

- [x] Create the new hero section with banner and tagline.
- [x] Preserve existing badges and links.
- [x] Rewrite hook paragraph to be inviting while remaining technically accurate.
- [x] Keep the Highlights section with the same 6 points.
- [x] Refactor Quick Start and CLI Reference sections; no command changes.
- [x] Insert dashboard screenshot in the Real-time Activity Dashboard section.
- [x] Keep Supported Agents & Hooks content unchanged.
- [x] Add skill-active screenshot in the Meet the Crew section.
- [x] Preserve Core Crew and Supporting Crew tables (optionally add role-color badges).
- [x] Keep Workflow section with Mermaid diagram and flow rules.
- [x] Keep Repository Layout, Adding a New Skill, Releasing, Contributing, and License sections.

## Phase 3: Validation

- [x] Run `python scripts/validate-skills.py` to ensure no skill links were broken.
- [x] Preview README.md in a Markdown renderer.
- [x] Check that all relative image paths resolve.
- [x] Confirm no secrets, `.env` files, or build directories are added.

## Phase 4: Ship

- [ ] Engineer returns control to Orchestrator.
- [ ] Reviewer checks README diff for broken links, typos, and image paths.
- [ ] Shipper commits on branch `docs/readme-redesign` and opens PR.
- [ ] Move this spec to `specs/archive/YYYY-MM-DD-012-readme-redesign/`.
