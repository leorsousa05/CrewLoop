# Design: Unified Skill Transition and AFK Contracts

## Overview

The change introduces a machine-readable authoring contract in `references/skill-contracts.yaml` and uses it to validate the inline transition capsules in all 19 skills. The manifest is not loaded by agents at runtime; it prevents documentation drift in CI. Runtime skills retain concise identity, authority, interactive transition, and AFK rules so correctness does not depend on optional reference reads or context compaction.

## Seven Analysis Questions

1. **Domain placement:** The change belongs to the skill authoring and workflow-governance bounded context. Runtime application packages are unaffected.
2. **Responsibilities:** The manifest defines expected transitions; each skill owns its local runtime capsule; the validator compares source artifacts with the contract; shared docs explain the state machine.
3. **Contracts:** A YAML schema defines skill identity, kind, prefix, default invoker, menu keys/targets, AFK target, and non-interactive destination. `validate_skill` gains repository-aware semantic checks while preserving CLI exit behavior.
4. **Tests:** YAML parsing, branching validation, filesystem links, fence balance, menus, and error paths require fixture-driven tests. Behavioral probes remain an execution-level manual gate.
5. **Architecture:** Canonical authoring data plus inline runtime invariants balances consistency and instruction reliability without requiring a runtime cache.
6. **Structure:** Add one manifest and one validator test module; modify all skill files, shared guidance, template, ADR, and active spec.
7. **Trade-offs:** Some critical transition text remains duplicated for runtime reliability. Validation, rather than pointer-only instructions, controls that deliberate duplication.

## Proposed Structure

```text
crewloop/
├── references/
│   ├── skill-contracts.yaml          (New, authoring source)
│   ├── conventions.md                (Modified)
│   ├── workflow.md                   (Modified)
│   └── skill-anatomy.md              (Modified)
├── assets/templates/
│   └── skill-template.md             (Modified)
├── skills/
│   └── */SKILL.md                    (19 modified)
├── scripts/
│   ├── validate-skills.py            (Modified)
│   └── tests/test_validate_skills.py (New)
├── specs/changes/016-compact-handoff-markers/ (Modified)
└── specs/decisions/002-direct-skill-routing.md (Modified)
```

## [Padrões Aplicados]

- **Contract-Driven Design:** YAML records the expected state-machine metadata independently of prose.
- **Single Source of Truth for authoring:** CI consumes the manifest; agents consume local capsules.
- **Fail Fast:** malformed YAML, Markdown, links, inventory, menus, prefixes, or AFK routes fail validation before distribution.
- **State Machine:** interactive and AFK transitions are explicit states and targets rather than narrative implications.
- **Progressive Validation:** frontmatter checks remain local; repository contract checks run only when a manifest is supplied.

## Manifest Contract

```yaml
version: 1
skills:
  <skill-name>:
    kind: core | supporting
    prefix: string
    default_invoker: <skill-name> | null
    return_strategy: invoker | architect-after-triage | architect-after-brief
    interactive: boolean
    menu:
      <key>:
        target: <skill-name> | invoker | done
        recommended: always | conditional | never
        condition: string | null
    direct_target: <skill-name> | null
    afk_target: crewloop-hub | <skill-name>
```

Rules:

- `crewloop-hub.afk_target` is `architect` at task entry; as AFK controller it may route by current phase state.
- Every other skill has `afk_target: crewloop-hub`.
- Architect and Designer set `interactive: false` and define `direct_target`.
- Supporting menus use `target: invoker`; their rendered label may name the actual invoker. Maintainer and Project Brainstorm are explicit exceptions with Architect-bound return strategies.
- A continue option is valid when the actual invoker is already CrewLoop Hub.
- At most one menu entry may be `recommended: always`; conditional recommendations declare distinct conditions.

## Runtime Transition Capsules

Each skill must state, inline:

1. Its exact prefix.
2. Its default invoker or predecessor.
3. Its permitted outside-AFK transition.
4. That menu selections load the selected skill directly without typed commands.
5. That AFK skips menus and returns to CrewLoop Hub, except Hub itself.
6. Any later mandatory footer or menu instruction is explicitly scoped to outside AFK.

## Canonical Flows

```text
Interactive:
Hub → Architect → Designer? → Engineer ⇄ Reviewer → Shipper → done
Supporting → actual invoker

AFK:
Current skill → Hub → next state selected by Hub
```

## Validator Contracts

```python
def load_contracts(path: Path) -> dict[str, object]: ...
def validate_skill(skill_dir: Path, contract: dict | None = None) -> list[str]: ...
def validate_repository(skills_dir: Path, contracts_path: Path) -> list[str]: ...
def validate_markdown_links(markdown_file: Path, content: str) -> list[str]: ...
def validate_fences(content: str) -> list[str]: ...
def extract_transition_contract(content: str) -> list[str]: ...
def validate_instruction_precedence(content: str, contract: dict) -> list[str]: ...
```

The command remains `python scripts/validate-skills.py` and exits non-zero for any repository or skill error.

## Error Handling

- Invalid manifest structure produces one repository-level error and stops semantic checks.
- A missing skill contract or extra skill directory is an inventory error.
- External HTTP links and anchors are excluded from filesystem link validation.
- Dynamic invoker labels are checked through required contract phrases rather than exact rendered skill names.
- Contract validation extracts the single `TRANSITION CONTRACT` section and compares its bullet lines exactly; expected strings elsewhere do not satisfy it.
- Later mandatory handoff and menu-wait instructions must contain an explicit outside-AFK qualification for every non-Hub skill.
- Validator errors identify the skill and violated field or line-oriented artifact.

## Test Plan

- Frontmatter: missing fields, non-string values, invalid kebab-case, name mismatch.
- Markdown: unmatched fences and broken relative links.
- Inventory: fewer/more than 19 skills and missing manifest entries.
- Contract: wrong prefix, unknown targets, invalid menu key, duplicate/unconditional recommendations, incorrect return strategy, and incorrect AFK target.
- Known regressions: Accessibility Auditor AFK, Schema Designer fence, Project Brainstorm route contradiction, Tester invoker mismatch.
- Precedence: appended mandatory direct routes and unqualified menu-wait instructions fail even when the capsule itself is correct.
- Integration: all repository skills pass, copy/symlink sandbox remains valid, and behavioral probes produce 76/76 expected outcomes.

## [Estratégia de Implementação]

1. Add the complete 19-skill manifest.
2. Extend validator parsing and add failing fixtures for known defects.
3. Normalize shared conventions and workflow language.
4. Update core skill capsules, then supporting skill capsules, using the manifest as the checklist.
5. Remove contradictory legacy phrases and repair malformed Markdown.
6. Update template, anatomy guide, ADR, and public repository guidance.
7. Run unit validation, repository validation, skill installation sandbox, and behavioral matrix.

## Risk Assessment

- **False validator positives:** keep rules structural and contract-based rather than matching arbitrary prose.
- **Mixed protocol:** update all 19 skills in one change and gate on repository validation.
- **Runtime reliability regression:** retain authority and transition rules inline.
- **Scope collision with change 026:** do not modify installer files and preserve its independent spec.
- **Existing worktree changes:** review and ship only files attributed to this change.

## Validation

- Run validator unit tests and repository validation.
- Review all 19 transition capsules against the manifest.
- Confirm no typed command reminder or contradictory route remains.
- Repeat the 76 behavioral scenarios in isolated contexts.
- Require independent Reviewer PASS before shipping.

## Subagent Parallelization

Not approved. Although skill files are physically separate, all edits depend on the same transition contract and broad parallel edits would increase drift risk.
