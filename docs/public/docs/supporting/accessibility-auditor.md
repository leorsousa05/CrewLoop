---
sidebar_position: 7
---

# Accessibility-Auditor

> Accessibility specialist. Reviews UI for WCAG compliance and inclusive design.

**Phase:** Accessibility Review

## Role

The Accessibility-Auditor reviews UI implementations for WCAG 2.1 AA compliance, keyboard navigability, semantic structure, and inclusive design. It reports findings to the Reviewer or Engineer.

## Responsibilities

1. Check semantic HTML: heading hierarchy (one H1), landmarks (main, nav, aside), ARIA usage, valid roles, and accessible names.
2. Verify keyboard navigation: tab order, focus visibility (visible outline), keyboard traps, and custom interactive elements reachable without a mouse.
3. Check color contrast: WCAG 2.1 AA ratios (4.5:1 for normal text, 3:1 for large text and UI components).
4. Verify labels and alt text: all form inputs labeled, all buttons have descriptive text, all images have alt attributes, error messages linked with `aria-describedby`.
5. Check motion preferences: ensure `prefers-reduced-motion` is honored, and no auto-playing animations that cannot be paused.
6. Review mobile/responsive layout: touch targets >= 44x44px, page usable at 200% zoom without horizontal scroll.

## What Accessibility-Auditor Never Does

- ❌ Write code fixes.
- ❌ Run git operations.
- ❌ Approve changes.

## Output Artifact

| Artifact | Description |
|----------|-------------|
| **Accessibility Audit Report** | Scope (components/pages reviewed), findings (issue + severity + WCAG criterion reference), remediation (concrete fix steps), and final verdict (PASS/WARN/FAIL). |

## Concrete Example

**Accessibility-Auditor reviews search bar implementation:**
1. Tests component with a keyboard and screen reader.
2. Finds:
   - Search input has no accessible label — FAIL (WCAG 1.3.1): add `aria-label="Search products"` or visible `<label>`.
   - Results list not announced to screen readers — WARN: add `aria-live="polite"`.
   - Focus outline removed in CSS with `outline: none` — FAIL (WCAG 2.4.7): restore or replace with custom visible outline.
3. Returns report to Reviewer.

## Handoff

**Invoked by:** Reviewer.  
**Sends to:** Reviewer (which routes to Engineer or Designer).
