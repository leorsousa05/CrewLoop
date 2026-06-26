# Tasks: Files Tab Diff Not Appearing

## Diagnosis

- [x] Reproduce the issue: added unit tests that simulate Write followed by Read and assert the diff is visible.
- [x] Inspect the sanitized event payload in the WebSocket message for the affected tool.
- [x] Verify whether `output.diff` or `output.contentSnippet` is present after sanitization.
- [x] Identify which code path fails: `FileActivity.buildFileActivity` used only the latest operation's snippet, so a subsequent `Read` hid an earlier `Write`/`Edit` diff.
- [x] Identify Kimi-specific gaps: `tool_input.operations[].path`, `tool_response.result`, and missing response field extraction for Bash/Read.

## Root-cause checklist

### Sanitizer (`servers/dashboard/src/filters/sanitize.ts`)

- [x] Confirm `addToolInputSnippet` is called for `Write` tools and generates `output.contentSnippet` from `tool_input.content`.
- [x] Confirm `addToolInputSnippet` is called for `Edit`/`EditFile` tools and generates `output.diff` from `tool_input.old_string` + `tool_input.new_string`.
- [x] Verify `sanitize()` is invoked for both `pre` and `post` events and that `output` is only populated on `post`.
- [x] Check that `extractSafeObject` does not strip `diff` or `contentSnippet` keys from `output`.
- [x] Verify the shim attaches the generated `output` to the forwarded event.
- [x] Alias Kimi's `tool_output` field to `tool_response` in `buildEvent()`.
- [x] Handle `tool_response` as a plain string (some agents, including Kimi for simple tools, send the response as a string instead of an object).
- [x] Extract `contentSnippet` from object `tool_response` fields used by Kimi: `content`, `result` (string/array), `stdout`, `stderr`, `output`.
- [x] Support Kimi `Write`/`Edit` input key fallbacks: `file_path`, `oldString`/`newString`, `old`/`new`, `text`, `code`.

### Path resolution (`servers/dashboard/public/components/shared.js`)

- [x] Confirm `Shared.resolvePath` checks `input` and `output` in the expected order, including nested `args`.
- [x] Add `input.operations[].path` and `input.operations[].file_path` lookups for Kimi `Read` payloads.

### File activity builder (`servers/dashboard/public/components/fileActivity.js`)

- [x] Confirm `buildFileActivity` used only the latest operation's snippet, hiding earlier diffs.
- [x] Verify the snippet fallback order covers `output.diff` and `output.contentSnippet`.
- [x] Ensure `renderDiffLines` handles an empty/whitespace-only snippet with a clear fallback message.
- [x] Confirm `Shared.resolvePath` checks `input` and `output` in the expected order, including nested `args`.

### Tests

- [x] Add unit tests for `FileActivity.buildFileActivity` keeping the latest diff visible when the last operation is a `Read`.
- [x] Add unit tests for `FileActivity.buildFileActivity` falling back to `contentSnippet`.
- [x] Add unit tests for `sanitize()` handling string `tool_response`.
- [x] Add unit tests for `sanitize()` handling Kimi object response fields (`result`, `stdout`, `output`).
- [x] Add unit tests for `Shared.resolvePath` handling `operations[]` and camelCase keys.
- [x] Add unit tests for `addToolInputSnippet` fallback keys for Write/Edit.
- [x] Run the full dashboard test suite and ensure all tests pass.

## Fix and verify

- [x] Implement the minimal fix in `fileActivity.js`: compute `file.snippet` as the latest non-empty snippet across all operations.
- [x] Implement the fix in `sanitize.ts`: treat string `tool_response` as a content snippet.
- [x] Implement response-field extraction in `sanitize.ts` for Kimi object responses.
- [x] Implement input-key fallbacks in `sanitize.ts` for Kimi Write/Edit payloads.
- [x] Implement `operations[]` path resolution in `shared.js`.
- [x] Run `npm test` in the dashboard workspace and ensure all tests pass.
- [x] Run a live agent session and verify the Files tab now shows the diff/content snippet.
- [x] Update `specs/living/dashboard/spec.md` to describe the latest-non-empty snippet behavior and Kimi payload support.
- [ ] Move this spec to `specs/archive/` and mark complete.
- [ ] Hand off to Shipper for branch, commit, push, and PR.
