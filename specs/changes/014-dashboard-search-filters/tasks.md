# Tasks: Dashboard Search, Filters, Sorting, Export, and Keyboard Shortcuts

## Analysis and design

- [x] Inspect existing dashboard components, styles, and tests.
- [x] Define `FilterState`, `SortState`, `SearchState`, and component contracts.
- [x] Create spec folder `specs/changes/014-dashboard-search-filters/`.
- [x] Write `proposal.md`, `design.md`, `specs/dashboard/spec.md`, and `tasks.md`.

## Frontend / shared

- [ ] Create `public/components/eventFilter.js` with pure filter/sort/search functions and UMD wrapper.
- [ ] Create `public/components/exportController.js` with JSON/CSV/download helpers and UMD wrapper.
- [ ] Create `public/components/toolbar.js` with toolbar DOM builder and event wiring.
- [ ] Load new components in `public/index.html` before `app.js`.
- [ ] Add toolbar container to `public/index.html` above the view tabs.

## Frontend / integration

- [ ] Extend `public/app.js` state with `search`, `filters`, `sort`, and `toolbarExpanded`.
- [ ] Wire toolbar callbacks to update state, run `EventFilter.filterAndSort`, and re-render the active view.
- [ ] Add debounced search input handling.
- [ ] Refresh toolbar filter-option lists when new events arrive without clearing active selections.
- [ ] Pass filtered invocations to `Timeline.renderTimeline` and `FileActivity.buildFileActivity`/`renderFileActivity`.
- [ ] Add keyboard shortcuts (`/`, `1`, `2`, `3`, `Esc`) and ignore them when focus is in an input.
- [ ] Wire JSON/CSV export buttons to `ExportController` with the current filtered list.

## Frontend / views

- [ ] Update `public/components/timeline.js` to accept and render an optional filtered invocation list.
- [ ] Update `public/components/fileActivity.js` to accept and render an optional filtered invocation list.
- [ ] Ensure Timeline and Files panels have bounded internal scroll and do not expand the viewport.

## Styling

- [ ] Add toolbar, search, filter panel, sort, export, and meta-info styles in `public/styles.css`.
- [ ] Add scroll-container utilities and verify Timeline/Files panes stay bounded.
- [ ] Add responsive breakpoints for toolbar wrapping and Files drill-in on small screens.
- [ ] Respect `prefers-reduced-motion` for new transitions.

## Testing

- [ ] Add unit tests for `EventFilter.filterAndSort` with combined filters.
- [ ] Add unit tests for `EventFilter.matchesSearch` across all scopes.
- [ ] Add unit tests for `EventFilter.compareInvocations` for every sort field/direction.
- [ ] Add unit tests for `EventFilter.buildFilterOptions`.
- [ ] Add unit tests for `ExportController.asJson` and `ExportController.asCsv`.
- [ ] Run `npm test` in the dashboard workspace and ensure all tests pass.
- [ ] Run a live agent session and manually verify search, filters, sorting, export, shortcuts, scrolling, and responsive layout.

## Documentation and shipping

- [ ] Update `specs/living/dashboard/spec.md` to describe the new search/filter/export features.
- [ ] Move this spec to `specs/archive/` and mark complete.
- [ ] Hand off to Shipper for branch, commit, push, and PR.
