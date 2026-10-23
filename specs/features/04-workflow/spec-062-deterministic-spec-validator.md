# spec-062-deterministic-spec-validator

---
name: spec-062-deterministic-spec-validator
domain: 04-workflow
status: superseded
created: 2026-10-23
completed: null
supersedes: []
---

# Deterministic Spec Validator

> **Superseded by [spec-064](../01-cli/spec-064-cli-validate-specs.md)** before shipping: the rules below are kept, but the Python script is replaced by the `crewloop validate-specs` CLI command so users receive the validator through npm without a Python dependency.

## Objective

Add `scripts/validate-specs.py`, a deterministic checker for the `specs/` tree that turns the written spec conventions into machine-checked rules, and run it in CI and in the Review gate so malformed or misplaced specs fail before they ship.

## Context

- Spec rules: [conventions.md](../../../references/conventions.md) §Spec Folder Structure, [specs/README.md](../../README.md), [feature-spec.md](../../templates/feature-spec.md).
- Existing validator style and CI: [validate-skills.py](../../../scripts/validate-skills.py), [validate.yml](../../../.github/workflows/validate.yml).
- Prior art: Guarana's `guarana specs validate` structural check, run by its verifier before acceptance review.

## Requirements

1. CLI: `python scripts/validate-specs.py [--root DIR] [--json]`. `--root` defaults to the repository root; the script validates `<root>/specs`. Python standard library plus PyYAML only (same as `validate-skills.py`).
2. Exit codes: `0` when there are no errors (warnings allowed), `1` when at least one error exists, `2` when `<root>/specs` does not exist or arguments are invalid.
3. Each issue has `level` (`error`|`warning`), `path` (root-relative, forward slashes), `code` (bounded kebab-case label), and `message`. Text mode prints one issue per line plus a summary; `--json` prints `{"ok": bool, "files": int, "issues": [...]}`.
4. Placement rules:
   - Any file directly in `specs/` other than `README.md` → error `loose-spec-file`.
   - Any file directly in `specs/features/` → error `loose-feature-file`; a domain folder not matching `NN-kebab-name` → error `invalid-domain-folder`.
   - A non-`spec-*` Markdown file inside a domain folder → warning `non-spec-file`. Sub-spec folders `spec-NNN-name/` are allowed and their contents are not validated as feature specs.
5. Feature spec rules (`specs/features/<domain>/spec-*.md`):
   - Filename matches `spec-NN(N)-kebab-name.md` → else error `invalid-filename`.
   - Frontmatter exists either at line 1 or right after a leading `# title` line → else error `missing-frontmatter`; unparsable YAML → error `invalid-frontmatter`.
   - `name` present and equal to the filename stem → error `missing-field` / `name-mismatch`.
   - `status` in `active | completed | superseded` → error `invalid-status`.
   - `domain`, when present, equals the parent folder → error `domain-mismatch`; absent → warning `missing-field`.
   - Sections `## Objective`, `## Acceptance Criteria`, `## Done When` are required → error `missing-section`. `## Edge Cases` is required for `active` specs (error) and recommended for others (warning).
   - Every `AC-NN` referenced in Done When is defined in Acceptance Criteria → error `unknown-ac-reference`. Every defined AC is referenced in Done When → error for `active`, warning otherwise (`unmapped-ac`). An `active` spec with no `AC-NN` IDs → error `missing-ac-ids`.
   - Relative Markdown links resolve to an existing path → error for `active`, warning otherwise (`broken-link`). External (`http(s):`, `mailto:`) and pure `#anchor` links are skipped; headings inside fenced code are ignored.
   - Two feature specs sharing the same number → warning `duplicate-spec-number`, escalated to error when any of them is `active`.
6. CI: `.github/workflows/validate.yml` gains a `Validate specs` step that runs the validator unit tests and `python3 scripts/validate-specs.py`.
7. Review gate: `automatic-verification.md` instructs Review to run the project's spec validator when it exists and to map errors to the `schema` check as `failed`. Plan's pre-handoff gate runs it on the new spec when available.
8. Unit tests in `scripts/tests/test_validate_specs.py` cover every rule above with temporary fixture trees.
9. The current repository validates with exit code `0`: historical deviations in `completed` specs are warnings, not errors.

## Behavior / Flow

1. Resolve root and `specs/`; exit `2` if missing.
2. Walk `specs/` placement rules, then every feature spec, collecting issues.
3. Print text or JSON; exit by error count.

## Constraints

- Do not rewrite or reformat existing specs to silence warnings; this spec adds checks only (except new specs 061–063, which must validate clean).
- Do not change `validate-skills.py` behavior or its tests.
- No network access, no file writes, no new dependencies.
- The validator lives in this repository only; exposing it through the published CLI (`crewloop specs validate`) is out of scope. Skills reference it conditionally ("when the project provides it").
- [Strictness]: chose error-for-active / warning-for-completed because 7 completed specs lack `Edge Cases`, 2 lack `domain`, and Specs 021/022 share numbers across domains. Revisit once history is normalized.
- [Frontmatter position]: accept both line-1 and after-title frontmatter because the official template places the title first while 15+ specs start at line 1.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| `specs/` missing or `--root` points to a non-directory | Exit `2` with a one-line message |
| Unknown CLI argument | argparse error, exit `2` |
| Empty `specs/features/` | Exit `0`, `files: 0` |
| Frontmatter opened but never closed | Error `invalid-frontmatter` |
| Frontmatter is valid YAML but not a mapping | Error `invalid-frontmatter` |
| `created: 2026-10-23` parsed by YAML as a date | Accepted |
| Heading text inside a fenced code block | Ignored for section detection |
| Link with anchor `file.md#part` | Resolve `file.md` only |
| File not readable as UTF-8 | Error `unreadable-file`, continue other files |
| Sub-spec folder `spec-031-x/` inside a domain | Allowed; contents skipped |
| Duplicate numbers where one spec is active | Error `duplicate-spec-number` |

## Acceptance Criteria

- AC-01: Given a valid fixture tree, when the validator runs, then it exits `0` and JSON reports `ok: true` with no issues.
- AC-02: Given fixtures violating each placement rule (loose file, loose feature file, bad domain folder, non-spec file), when the validator runs, then it reports the documented code and level for each.
- AC-03: Given fixtures violating each feature-spec rule (filename, frontmatter missing/invalid, name, status, domain, sections, AC mapping, links, duplicate numbers), when the validator runs, then each documented code is reported with the documented level, including the active/completed strictness split.
- AC-04: Given a missing `specs/` directory, when the validator runs, then it exits `2`.
- AC-05: Given the current repository, when `python scripts/validate-specs.py` runs, then it exits `0`, and specs 061–063 produce no issues.
- AC-06: Given `.github/workflows/validate.yml`, when read, then a `Validate specs` step runs `scripts.tests.test_validate_specs` and `scripts/validate-specs.py`.
- AC-07: Given `automatic-verification.md` and the Plan skill, when read, then Review maps spec-validator errors to a failed `schema` check and Plan runs the validator before handoff when it exists.

## Done When

- [x] AC-01 — proven by `python -m unittest scripts.tests.test_validate_specs`
- [x] AC-02 — proven by `python -m unittest scripts.tests.test_validate_specs`
- [x] AC-03 — proven by `python -m unittest scripts.tests.test_validate_specs`
- [x] AC-04 — proven by `python -m unittest scripts.tests.test_validate_specs`
- [x] AC-05 — proven by `python scripts/validate-specs.py` (exit 0) and `python scripts/validate-specs.py --json`
- [x] AC-06 — proven by `python -m unittest scripts.tests.test_automated_workflow` (CI step contract)
- [x] AC-07 — proven by `python -m unittest scripts.tests.test_automated_workflow`
