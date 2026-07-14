# Implementation Tasks: Dashboard Redesign & CLI Feature Integration

This document contains the step-by-step ordered checklist for implementing the dashboard redesign and CLI visual manager.

---

## Phase 1: Backend API Implementation

- [x] **Task 1.1: Create the API handlers file**
  Create `servers/dashboard/src/api/cli.ts` containing the handlers for:
  - `GET /api/cli/skills`: Call `resolveSkills` from `@archznn/crewloop-cli` package to return available skills.
  - `GET /api/cli/hooks`: Check active agent configs and return their hook statuses using `@archznn/crewloop-cli` agents helper.
  - `POST /api/cli/install`: Parse query parameters and run skill installation and hook updates synchronously.
  - Export a router/handler function to be registered in `server.ts`.

- [x] **Task 1.2: Register handlers in Server**
  Modify `servers/dashboard/src/server.ts` to:
  - Import the new handlers from `./api/cli`.
  - Wire the routes inside the main HTTP server request handler:
    - Route `GET /api/cli/skills` -> skills list.
    - Route `GET /api/cli/hooks` -> hooks status check.
    - Route `POST /api/cli/install` -> run install/dry-run.

- [x] **Task 1.3: Verify API with unit tests**
  Add mock tests in `servers/dashboard/src/api/cli.test.ts` to verify:
  - Skills retrieval returns a correct JSON format.
  - Correct argument conversion from requests into CLI packages installer methods.

---

## Phase 2: Design System & Styling (Minimalist Theme)

- [x] **Task 2.1: Update CSS variables**
  Modify `servers/dashboard/ui/src/styles/index.css` to:
  - Redefine background, panel, text, border, and validation status colors based on a dark-slate theme.
  - Enforce clean layout borders, spacing scale, and scrollbar styles.

- [x] **Task 2.2: Implement Global Layout Shell**
  Modify `servers/dashboard/ui/src/App.tsx` layout structure:
  - Change the header to show active workspace path clearly with a professional header.
  - Introduce navigation tabs at the top: `[Observability]` and `[CLI Configuration]`.
  - Add state variables to toggle between these tabs.

---

## Phase 3: Frontend CLI Management Panel

- [x] **Task 3.1: Build CLI Config Panel UI**
  Create `servers/dashboard/ui/src/components/CLIConfigPanel.tsx` containing:
  - Left Form: Target directory input, agent select list, checkboxes/switches for `--symlink`, `--force`, `--dry-run`, and `--hooks`/`--no-hooks`.
  - Center list: Selection checklists for available skills.
  - Action buttons: "Run Dry-Run" and "Install Skills".
  - Right Console: Panel with dark background and monospace text to stream logs/results (such as skipped and installed skills).

- [x] **Task 3.2: Connect Panel to Backend APIs**
  Implement API client calls using `fetch` or custom hooks:
  - Fetch available skills on mount.
  - Fetch supported agent hooks on mount.
  - Submit the install request on button press and handle response states (`loading`, `error`, `success`).

- [x] **Task 3.3: Refine Observability Views**
  Streamline the remaining tabs (`Overview`, `Timeline`, `Sessions`, `Network`, `Files`) to match the new minimalist typography and layout parameters.

---

## Phase 4: Verification & Handoff

- [x] **Task 4.1: Run tests and type checking**
  Execute:
  - `npm run typecheck` inside `servers/dashboard` to verify React TypeScript typing.
  - `npm test` to verify backend and frontend unit tests.

- [x] **Task 4.2: Build verification**
  Run `npm run build` in `servers/dashboard` to ensure both backend compilation and Vite UI bundle build successfully without errors.
