# Tasks: npm Distribution of CrewLoop Skills

## Setup
- [x] Create spec folder structure
- [x] Initialize `.spec.yaml`

## Implementation
- [x] Add root `package.json` for `@crewloop/skills`
- [x] Create `packages/cli/` with `package.json`, `tsconfig.json`, and `bin/crewloop.js`
- [x] Implement `src/resolver.ts` to discover skills from `@crewloop/skills`
- [x] Implement `src/agents.ts` with default agent directory mappings
- [x] Implement `src/installer.ts` with copy and symlink strategies
- [x] Implement `src/cli.ts` with argument parsing and command dispatch
- [x] Add `list` command to print available skills
- [x] Add `install` command with `--target`, `--skill`, `--agent`, `--symlink`, `--force`, `--dry-run`
- [x] Ensure CLI works when invoked via `npx @crewloop/cli`
- [x] Build `dist/` before publishing

## Testing
- [x] Unit tests for `resolver.ts` (filtering, manifest parsing)
- [x] Unit tests for `installer.ts` (copy, symlink, force, dry-run)
- [x] Unit tests for `agents.ts` (directory resolution)
- [x] Integration test: install to a temporary directory and validate skill files
- [x] Edge case: missing source package
- [x] Edge case: existing skill without `--force`

## Verification
- [x] Run TypeScript type check: `npm run typecheck`
- [x] Run CLI tests: `npm test`
- [x] Run `python scripts/validate-skills.py` against source `skills/`
- [x] Manual verification: `crewloop list` prints 12 skills
- [x] Manual verification: `crewloop install --target /tmp/test-skills` installs all skills
- [x] Manual verification: `crewloop install --skill architect --target /tmp/test-skills` installs one skill

## Documentation
- [x] Write `packages/cli/README.md`
- [x] Update root `README.md` with npm install instructions
- [x] Update `scripts/install.sh` header comment to mention npm option
- [x] Update `.gitignore` for `node_modules/`, `*.tgz`, and `dist/`
- [x] Document TypeScript build steps in `packages/cli/README.md`
- [ ] Add ADR in `specs/decisions/` if distribution approach becomes irreversible

## Completion
- [ ] Archive change folder
- [ ] Update `.spec.yaml` status to completed
