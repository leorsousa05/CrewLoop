# Accessibility-Auditor

**Phase:** Accessibility Review

The Accessibility-Auditor reviews UI implementations for WCAG compliance, keyboard navigability, semantic structure, and inclusive design.

## What the Accessibility-Auditor does

The Accessibility-Auditor is a focused accessibility specialist. It checks that UI changes work for keyboard users, screen-reader users, people with low vision, and people who prefer reduced motion.

### Core responsibilities

1. **Check semantic HTML**
   - Proper heading hierarchy, landmarks, and ARIA usage.
   - Valid roles and accessible names.

2. **Verify keyboard navigation**
   - Focus order, focus visibility, and keyboard traps.
   - Custom controls reachable and operable without a mouse.

3. **Check color and contrast**
   - WCAG 2.1 level AA contrast ratios.
   - Information not conveyed by color alone.

4. **Verify labels and alt text**
   - Form labels, button text, image alternatives.
   - Error messages and status announcements.

5. **Respect motion preferences**
   - `prefers-reduced-motion` honored for animations.
   - No auto-playing motion that cannot be paused.

6. **Review responsive behavior**
   - Touch target sizes, zoom behavior, mobile usability.

## When to invoke

The Accessibility-Auditor triggers when:

- The Orchestrator, Reviewer, or Designer detects UI accessibility concerns.
- The user asks about accessibility audit, a11y check, WCAG, screen readers, keyboard navigation, or color contrast.
- The change involves new components, forms, modals, color/typography changes, or responsive layouts.

## Concrete example

**User:** "Is the new checkout form accessible?"

**Accessibility-Auditor:**

1. Reads the changed files and the design spec.
2. Checks form labels, error messaging, and focus management.
3. Verifies color contrast and keyboard flow.
4. Reviews ARIA usage on custom dropdowns.
5. Produces an Accessibility Audit Report with severity and remediation steps.
6. Routes to Engineer, Designer, or Reviewer.

## Output artifact: Accessibility Audit Report

| Section | Content |
|---------|---------|
| Scope | Components and pages reviewed |
| Findings | Issues with severity and WCAG reference |
| Remediation | Concrete steps to fix each issue |
| Verdict | PASS / WARN / FAIL |

## Handoff

**Next skill:** Engineer, Designer, Reviewer, or Orchestrator.
