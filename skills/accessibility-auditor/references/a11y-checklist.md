# Accessibility Checklist

Reusable checklist for the Accessibility Auditor skill.

---

## Semantic HTML

- [ ] Use native elements (`<button>`, `<a>`, `<input>`, `<label>`, `<select>`, `<textarea>`) before adding ARIA.
- [ ] Headings (`h1`–`h6`) form a logical outline; do not skip levels for font size.
- [ ] Landmarks (`<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>`) are used once per role where appropriate.
- [ ] Lists use `<ul>`, `<ol>`, `<li>`; definition lists use `<dl>`, `<dt>`, `<dd>`.
- [ ] Tables use `<table>`, `<thead>`, `<tbody>`, `<th scope="...">` when the data is tabular.

## Keyboard & Focus

- [ ] All interactive controls are reachable with `Tab` and operable with `Enter`/`Space`/arrows.
- [ ] Focus order matches visual order.
- [ ] Focus indicators are visible and meet 3:1 contrast.
- [ ] Modals trap focus and restore focus to the triggering element on close.
- [ ] Drop-down menus close with `Esc` and arrow keys move between items.
- [ ] No keyboard traps.

## ARIA

- [ ] ARIA is used only when native semantics are insufficient.
- [ ] Required ARIA attributes are present (`aria-expanded`, `aria-controls`, `aria-labelledby`, etc.).
- [ ] `aria-live` regions announce status updates and errors.
- [ ] State changes are reflected in attributes, not just visual classes.
- [ ] Custom components expose name, role, and value.

## Color & Contrast

- [ ] Normal text ≥ 4.5:1 contrast against background (WCAG 2.1 AA).
- [ ] Large text (18 pt+ or 14 pt+ bold) ≥ 3:1 contrast.
- [ ] UI components and graphical objects ≥ 3:1 against adjacent colors.
- [ ] Information is not conveyed by color alone.

## Forms & Labels

- [ ] Every input has a visible and programmatically associated label.
- [ ] Required fields are indicated visually and via `aria-required` or `required`.
- [ ] Error messages are linked with `aria-describedby` or `aria-errormessage`.
- [ ] Input purpose is identifiable (`autocomplete` attributes where appropriate).

## Images & Media

- [ ] Decorative images use `alt=""`.
- [ ] Informative images have concise, descriptive `alt` text.
- [ ] Complex charts/images have a text alternative nearby.
- [ ] Video/audio has captions, transcripts, and audio descriptions where required.

## Motion & Responsiveness

- [ ] Animations respect `prefers-reduced-motion: reduce`.
- [ ] Touch targets are at least 44 × 44 CSS pixels.
- [ ] Layout is usable at 200% browser zoom.
- [ ] Content does not require horizontal scrolling at 320 CSS pixels width.
- [ ] Viewport meta tag is present and does not disable zoom.

## Screen Reader Support

- [ ] Reading order is logical when linearized.
- [ ] Hidden content does not contain focusable elements.
- [ ] Loading and status changes are announced via live regions.
- [ ] Icons used alone have accessible names.
