# Tasks — Shipper Version Bump Validation

## Checklist

### Implementation
- [x] Read `skills/shipper/SKILL.md` to identify exact line ranges for editing
- [x] Read `docs/docs/core/shipper.md` to identify exact line ranges for editing
- [x] Edit `skills/shipper/SKILL.md` — insert version verification step, bump commands, and rule exception
- [x] Edit `/home/arch/.gemini/skills/shipper/SKILL.md` — apply the same updates
- [x] Edit `docs/docs/core/shipper.md` — update responsibilities and concrete example
- [x] Run `python3 scripts/validate-skills.py` to verify skills format

### Validation
- [x] Run Docusaurus build `npm run build` in `docs/` to check for broken links
- [x] Review changes manually to ensure the instructions are clear and unambiguous

### Ship
- [ ] Commit: `feat(shipper): add version bump validation and workspace helper commands`
- [ ] Branch: `feat/shipper-version-bump-validation`
- [ ] Archive spec to `specs/archive/2026-06-27-003-shipper-version-bump-validation/`
