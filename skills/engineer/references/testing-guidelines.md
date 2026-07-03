# Frontend & General Testing Guidelines

UI code is not exempt from tests. Test the logic, not the pixels.

## Always test:
- Form validation rules (pure functions)
- State machines (idle → loading → success → error)
- Calculations (scroll velocity, parallax offsets, animation easing)
- Conditional rendering (WebGL fallback, reduced motion, mobile breakpoints)
- Data transformations (API response → view model)

## Mock browser APIs when needed:
- `window.matchMedia` for reduced motion / dark mode
- `localStorage` / `sessionStorage`
- `fetch` for API calls
- `requestAnimationFrame` for animation timing

## Accessibility tests:
- Keyboard navigation (Tab order, Enter/Space activation)
- ARIA attributes on interactive elements
- Focus management (trap in modals, return on close)
- Color contrast ratios (if generating dynamic colors)

## Performance verification:
- Lighthouse CI or manual Lighthouse run for budget metrics
- Bundle size check against spec budget
- No layout thrashing in animation loops

## Interactive UI features (must verify):
- Drag and drop — test drop handler logic, slot validation, reordering
- Custom cursors — test state changes on hover/leave
- Tooltips/popovers — test trigger conditions and positioning logic
- Canvas interactions — test hit detection, coordinate mapping
- Animation completion callbacks — test promise resolution

## Browser project verification:
If tests run in browser (not Node):
- Provide `tests/index.html` or equivalent test runner
- Show test file listing with what each file covers
- If you cannot execute tests, explicitly state: "Tests written but not executed. Run by opening tests/index.html in browser."
- Do NOT claim tests pass if you haven't run them.
