# Delta: accessibility-auditor supporting skill

## Current state

Accessibility requirements are mentioned in the `designer` skill and partially checked by the `reviewer`, but no skill owns a dedicated accessibility audit after implementation. UI changes may ship without systematic a11y review.

## Desired state

A dedicated `accessibility-auditor` supporting skill that reviews UI implementations for WCAG compliance, focus management, semantic HTML, color contrast, and motion preferences. It is invoked after the engineer finishes UI work and before or alongside the reviewer.

## New files

- `skills/accessibility-auditor/SKILL.md`
- `skills/accessibility-auditor/references/a11y-checklist.md` (optional, reusable checklist)
- `docs/docs/supporting/accessibility-auditor.md`

## Trigger phrases

The skill activates on:

- "accessibility audit"
- "a11y check"
- "a11y review"
- "check accessibility"
- "WCAG"
- "screen reader"
- "keyboard navigation"
- "focus management"
- "color contrast"
- "prefers-reduced-motion"
- "accessible design"
- "accessibility auditor"

It should also trigger when the change involves:

- New UI components, pages, or forms.
- Modals, dialogs, dropdowns, or custom inputs.
- Color, typography, or animation changes.
- Mobile/responsive layouts.
- User input or error messaging.

## Role and responsibilities

- Review UI changes against WCAG 2.1 level AA (or specified level).
- Check semantic HTML, heading hierarchy, and ARIA usage.
- Verify keyboard navigability and focus order.
- Check color contrast and non-color indicators.
- Verify alt text, labels, and form associations.
- Respect `prefers-reduced-motion` for animations.
- Test touch target sizes and responsive behavior.
- Report findings with severity and remediation steps.

## Mode

**REVIEW only.** Analyze, judge, and report. Do not write fixes. Do not run git operations.

## Routing

- Default previous skill: reviewer, designer, or engineer (after UI implementation).
- Next skills:
  - `[E] Engineer` — fix reported issues.
  - `[R] Reviewer` — return to general review after a11y fixes.
  - `[D] Designer` — design-level a11y problem.
  - `[O] Orchestrator` — adjust scope.

## Skill structure requirements

The `SKILL.md` must include:

1. YAML frontmatter with `name: accessibility-auditor` and a trigger-rich description.
2. `ROLE` section.
3. `MODE` section with restrictions.
4. `MEMORY & CONTEXT` section invoking `obsidian-second-brain`.
5. `AFK MODE & ROLE PREFIX` section with prefix `[ACCESSIBILITY-AUDITOR CHECKING]`.
6. `WORKFLOW` section with concrete steps and commands.
7. `RESPONSE RULES` section.
8. `ANTI-PATTERNS` section.
9. Letter-based navigation menu at the end.

## Docs page

`docs/docs/supporting/accessibility-auditor.md` mirrors `docs/docs/supporting/tester.md`:

- Phase label.
- What the skill does.
- Core responsibilities.
- When to invoke.
- Concrete example.
- Output artifact (Accessibility Audit Report).
- Handoff options.

## Acceptance criteria

- `python scripts/validate-skills.py` passes for `accessibility-auditor`.
- `cd docs && npm run build` succeeds after adding the docs page.
- `docs/sidebars.js` includes `supporting/accessibility-auditor`.
- `README.md` lists `accessibility-auditor` in the Supporting Crew table.
- `references/workflow.md` includes `accessibility-auditor` in the optional routing diagram/rules.
