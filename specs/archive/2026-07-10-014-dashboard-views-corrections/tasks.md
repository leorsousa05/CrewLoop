# Tasks: Dashboard Views Corrections

## Setup
- [x] Create spec folder structure
- [x] Initialize `.spec.yaml`

## Implementation

### Network 3D
- [x] Annotate each incoming `DashboardEvent` with the session's active skill before storing.
- [x] Update `projectInvocations` to capture `skill` on every `ToolInvocation`.
- [x] Rewrite `buildGraph3D` to create one skill node per distinct `inv.skill` and link each invocation to its own skill node.
- [x] Ensure stable node IDs (`skill:<name>`, `tool:<name>`, `file:<path>`) so `Network3D` reuses objects.
- [x] Add/update unit tests for multi-skill graph construction.

### Path Resolution (AGY + all agents)
- [x] Extend `resolvePath` to recognize `AbsolutePath`, `TargetFile`, and lowercase variants.
- [x] Ensure `extractFileDetail` and `resolvePath` use the same canonical set of path keys.
- [x] Add unit tests covering Kimi/Claude/Codex/AGY path fields.

### Read Content (Kimi + others)
- [x] Update `SAFE_PAYLOAD_KEYS` in `config.ts` to include `content`, `result`, `contentsnippet`.
- [x] Adjust `normalizeKimi` to preserve structured read output when possible.
- [x] Extend `buildFileActivity` snippet extraction to fallback to `content`, `output.content`, `result`, etc.
- [x] Update `FileDiff` to render read content (not only diff) and show operation metadata.

### File Explorer UX
- [x] Keep `selectedPath` stable in `FilesView` while new events arrive.
- [x] Highlight selected file in `FileList`.
- [x] Show per-operation badges (`read`/`edit`/`other`) in both `FileList` and `FileDiff`.
- [x] (Optional) Display line hint when `StartLine`/`Line` is present in the payload.

## Testing
- [x] Add regression test: AGY `view_file` produces a `FileEntry`.
- [x] Add regression test: Kimi `Read` output content appears as `FileEntry.snippet`.
- [x] Add regression test: graph contains two skill nodes after a skill change.
- [x] Run server tests: `npm run test:server`.
- [x] Run UI tests: `npm run test:ui`.
- [x] Run full dashboard tests: `npm test`.
- [x] Validate skills: `python3 scripts/validate-skills.py`.

## Verification
- [x] Manual: start dashboard, run CrewLoop Hub then Architect then Engineer; verify Network shows separate skill nodes.
- [x] Manual: trigger AGY to read `README.md`; verify file appears in Files view.
- [x] Manual: trigger Kimi to read `README.md`; verify content appears in FileDiff.
- [x] Manual: switch between files in Files view; verify selection persists.

## Documentation
- [x] Update `specs/living/dashboard/spec.md` if view behavior changed.
- [x] Update `servers/dashboard/README.md` if new path/content keys are documented.

## Completion
- [ ] Run Shipper to commit/branch/PR.
- [ ] Archive change folder to `specs/archive/`.
- [x] Update `.spec.yaml` status to completed.
