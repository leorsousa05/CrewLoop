# Tasks: README Rewrite + Shipper Version Bump

- [x] Rewrite `README.md` with technical tone, NPM badge, CI/tests badge, docs badge, and license badge.
- [x] Add `LICENSE.md` so the license badge resolves.
- [x] Create `.github/workflows/validate.yml` so the tests badge reflects a real CI run.
- [x] Restore README coverage: repository layout, adding a skill, and releasing sections.
- [x] Update `skills/shipper/SKILL.md` to enforce version bump checks for versioned code.
- [x] Add explicit mapping: bugfix → patch, feat → minor, breaking → major.
- [x] Add rule: Shipper must ask the user when unsure about bumping.
- [x] Bump `package.json` version from `0.8.0` to `0.9.0`.
- [x] Bump `packages/cli/package.json` version from `0.8.0` to `0.9.0`.
- [x] Run `python3 scripts/validate-skills.py`, `npm run build --workspaces`, and `npm test --workspaces`.
- [ ] Hand off to Reviewer.
