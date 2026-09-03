# Dashboard Manual Acceptance Matrix

This artifact is the reproducible manual gate for the dashboard after automated validation passes. It records the environment and covers every view across the supported viewport, theme, and density combinations without treating color alone as state communication.

## Run record

Fill these fields for each release candidate:

| Field | Value |
| :--- | :--- |
| Date/time | `2026-09-03 14:55:54 -03:00` |
| Commit | `e971854` |
| OS | `Windows 10.0.26200.0` |
| Browser | `Chrome/152.0.7977.65` |
| Server URL | `http://127.0.0.1:7891` |
| Actual desktop viewport | `1440 × 1000 CSS px` |
| Actual mobile viewport | `390 × 844 CSS px` |
| Assistive technology | `None; screen-reader walkthrough pending` |

Start the production server from `servers/dashboard/` with `npm start`, then open the recorded server URL.

## Recorded automated preflight checkpoint

This checkpoint is evidence for the later manual walkthrough; it does not mark the manual gate complete.

- `112/112` combinations passed across seven routes × desktop/mobile × light/dark/system-light/system-dark × comfortable/compact.
- Desktop interaction smoke passed for Overview, session selector keyboard navigation and Escape dismissal, command palette, Settings persistence, Timeline navigation, browser history, seven route renders, no external font requests, and no horizontal overflow.
- Mobile interaction smoke passed for drawer opening, focus trapping, Escape dismissal with focus restoration, command palette focus, Settings route, touch-target measurements, and no horizontal overflow.
- The post-fix empty Overview was visually inspected at `390 × 844` in light and dark themes; the guidance paragraph wraps within the viewport.
- After the Settings accessibility fix, a production-reloaded Settings probe reported `unnamedControls: []`; Theme, reduced motion, auto-follow, and Max events controls exposed non-empty names. Reduced motion toggled to `true` with the `reduced-motion` root class and restored cleanly. Primary/secondary text contrast measured `17.083:1`/`4.832:1` in light theme and `17.485:1`/`8.742:1` in dark theme on the base background.
- A global visible-control-name scan covered all seven routes at both recorded viewports (14 route × viewport combinations): every combination reported zero unnamed visible controls. Control counts were 17/31/25/35/17/16/16 on desktop and 11/20/14/24/6/10/10 on mobile for Overview/Sessions/Timeline/Files/Skills/Usage/Settings.
- Chrome's native accessibility tree scan covered the same 14 route × viewport combinations: every interactive AX node had a non-empty name. Interactive-node counts were 18/33/25/17/17/18/19 on desktop and 12/22/14/6/6/12/13 on mobile for Overview/Sessions/Timeline/Files/Skills/Usage/Settings.

The repository preflight `npm run acceptance:browser -- --url http://127.0.0.1:7891/ --cdp http://127.0.0.1:9229 --timeout 5000 --summary` completed `112/112` combinations at commit `e971854`, with `passed: 112`, `failed: 0`, and exit code `0`.

The optional interaction preflight `npm run acceptance:browser -- --url http://127.0.0.1:7891/ --cdp http://127.0.0.1:9229 --timeout 5000 --summary --interaction-smoke` also passed with `7/7` interaction cases, `interactionSuccess: true`, and exit code `0`. The empty session-selector case reported `state: "empty"` and `optionCount: 0`; drawer, command palette, and filter sheet cases used real CDP keyboard events for Escape and focus restoration.

The smoke checks used Chrome DevTools Protocol with no assistive technology. Keyboard, full contrast coverage, async-state, and screen-reader observations still require the manual matrix below.

## View matrix

Each cell is one walkthrough. Mark `P` only after the view renders without clipping or horizontal page overflow, its hierarchy remains clear, and its controls remain usable at the recorded viewport.

| View | Desktop light comfortable | Desktop light compact | Desktop dark comfortable | Desktop dark compact | Desktop system-light comfortable | Desktop system-light compact | Desktop system-dark comfortable | Desktop system-dark compact | Mobile light comfortable | Mobile light compact | Mobile dark comfortable | Mobile dark compact | Mobile system-light comfortable | Mobile system-light compact | Mobile system-dark comfortable | Mobile system-dark compact |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Overview | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Sessions | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Timeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Files | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Skills | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Usage | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Settings | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

`system-light` and `system-dark` mean the OS/browser prefers-color-scheme setting was changed while the dashboard theme remained `system`.

## Requirement-to-evidence map

| Spec criterion | Automated evidence | Manual or document evidence | State |
| :--- | :--- | :--- | :--- |
| AC-01 | `servers/dashboard/src/lib/local-request-policy.test.ts`, `workspace-access.test.ts`, `lib/event-contract.test.ts`, `state.test.ts`, adapter suites, and UI request-race tests | — | Automated |
| AC-02 | `npm run typecheck`, `npm run build`, and `npm test` from `servers/dashboard/` | — | Automated |
| AC-03 | — | Root [README](../README.md), [architecture overview](../specs/shared/architecture-overview.md), and [dashboard README](../servers/dashboard/README.md) | Document review |
| AC-04 | — | [ADR 001](../specs/shared/adrs/adr-001-dashboard-hybrid-architecture.md) supersession notes plus preserved historical text | Document review |
| AC-05 | — | Archive listing and frontmatter verification for specs 021 and 022 during Ship | Pending Ship |
| AC-06 | UI component and state tests cover the interaction contracts; run `npm test` before the walkthrough; Chrome preflight passed 112/112 view combinations and optional interaction smoke passed 7/7 | View matrix and interaction matrix in this file, with the run record completed | Manual pending; preflight recorded |
| AC-07 | `git diff --check` plus repository scans for secrets, generated artifacts, debug logs, empty catches, and stale TODOs | Diff review before Ship | Review pending |

The automated evidence is intentionally contract-oriented; this project does not use an arbitrary global coverage target.

## Interaction matrix

| Area | Steps | Expected observable result | Result / notes |
| :--- | :--- | :--- | :--- |
| Mobile navigation | At mobile width, close the menu; press `Tab`; open it and press `Tab`/`Shift+Tab`; press `Escape` | Closed drawer contributes no focus targets. Open drawer traps focus, Escape closes it, and focus returns to the menu trigger. | `[record]` |
| Filters and command palette | Open each overlay from keyboard; move focus through controls; press `Escape`; reopen with `Ctrl/Cmd+K` and `/` | Focus initializes in the overlay, wraps within it, and returns to the invoking control. Global shortcuts do not fire behind an open overlay. | `[record]` |
| Session selector | Open with keyboard, use arrows/Home/End, select with Enter, dismiss with Escape | Combobox/listbox state and active option are announced; selection and dismissal are keyboard-complete. | `[record]` |
| Timeline and Sessions | Focus the primary row action, then the Copy or Pin action | Primary selection/expansion and secondary Copy/Pin are separate focus targets; no nested interactive row behavior occurs. | `[record]` |
| Connection and pause | Disconnect/reconnect the dashboard connection; pause and resume live updates | Status is exposed through text/live status, not color alone; pause/resume remains available at touch size. | `[record]` |
| Copy feedback | Copy a Timeline event | A visible or assistive-text confirmation reports that the event was copied. | `[record]` |
| Files | Open Files with no session, select a workspace file, trigger loading/error/retry, open content and diff | Empty, loading, error, retry, content, and diff states are understandable and remain inside the viewport. | `[record]` |
| Session removal | Remove the selected session while viewing it | A live announcement reports removal and the UI selects a safe fallback without a dead deep link. | `[record]` |
| Theme and density | Toggle light/dark/system and comfortable/compact in Settings | Body text remains readable, focus remains visible, and compact mode does not shrink controls below 44×44 CSS pixels on touch layouts. | `[record]` |
| Reduced motion | Enable manual reduced motion; repeat with OS reduced-motion preference | Decorative motion is disabled or limited to transform/opacity; no required information depends on animation. | `[record]` |
| External resources | Open DevTools Network, filter `font`, reload | No Google Fonts or other external font request is made at runtime. | `[record]` |
| Navigation history | Change views and filters; use browser back/forward; reload a deep link | Hash route, selected view, and filter state round-trip without a blank or stale view. | `[record]` |

## Completion rule

The manual gate is complete only when every view-matrix cell and every interaction row has a recorded result in the run record. Failures must become a new feature spec or a correction to the active spec; do not silently mark a failed cell as passed.
