# Context Selection

Use this procedure when preparing the Plan brief and every later handoff. The goal is to keep the model's working context relevant without weakening safety, validation, accessibility, or user-confirmation requirements.

## Selection Order

1. Normalize candidate paths as relative paths inside the active workspace. Reject absolute paths, traversal segments, symlink escapes, and paths that cannot be checked by the existing workspace boundary.
2. Select mandatory context first:
   - applicable `AGENTS.md` instructions;
   - `specs/memory/project-state.md` and the active feature spec;
   - required security, accessibility, validation, and user-confirmation rules;
   - tests that prove the requested behavior.
3. Add candidates with one or more of these signals:
   - `modified` — already changed or explicitly named by the task;
   - `task_match` — an exact, bounded task-term match in a path or inspected file metadata;
   - `import` — directly imported by a selected implementation file;
   - `consumer` — directly consumes a selected public module or contract;
   - `test` — directly exercises a selected implementation or behavior;
   - `reference` — a specific contract, ADR, or policy required by the task.
4. Prefer direct task evidence, modified files, and mandatory references over indirect relationships. Use at most a one-hop import/consumer expansion in the first pass.
5. Deduplicate by normalized path. A path selected by multiple signals is emitted once with the deduplicated allowlisted signal labels.
6. Exclude known noise by default: `node_modules/`, `dist/`, `build/`, generated output, caches, unrelated history, credentials, raw transcripts, and files outside the bounded workspace.
7. If relevance is uncertain, defer the candidate or retain it for review. Never silently discard a candidate needed for safety or correctness.

## Compact Handoff Manifest

Carry this small manifest in the brief/spec. Do not copy full source files, reference documents, prompts, responses, commands, tool payloads, credentials, raw transcripts, or session identifiers into it.

```typescript
type ContextSelectionSignal =
  | 'mandatory'
  | 'modified'
  | 'task_match'
  | 'import'
  | 'consumer'
  | 'test'
  | 'reference';

interface ContextCandidate {
  path: string;
  signals: ContextSelectionSignal[];
  mandatory: boolean;
  deferred: boolean;
}

interface ContextSelectionManifest {
  schemaVersion: 1;
  selected: ContextCandidate[];
  excludedNoiseCount: number;
  deferredCount: number;
  exception: 'none' | 'required_context_exceeds_preference' | 'uncertain_relevance';
}
```

Signal labels are an allowlist. Do not add free-form explanations to the manifest; keep bounded reasoning in the Plan brief if the next skill needs it.

## Soft Preferences and Exceptions

- Selection preferences are not permission to read arbitrary files and are not a replacement for workspace access validation.
- Do not estimate provider token counts from characters, lines, or file sizes.
- If required context exceeds a soft preference, keep the required context and set `exception` to `required_context_exceeds_preference`.
- If task terms produce no reliable match, keep mandatory context and set `exception` to `uncertain_relevance`.
- If a file set changes after selection, refresh the manifest before implementation or mark it stale; never use a stale manifest as authorization.

## Handoff Reuse

The next skill receives the compact brief, the selected paths, and only the findings needed for its responsibility. Reuse the manifest when no new validation or safety finding exists. Request additional context only when a concrete missing contract, failing validation, or safety concern justifies it.

## Examples

### Focused implementation change

```text
selected:
  - servers/dashboard/src/state.ts [modified, task_match]
  - servers/dashboard/src/state.test.ts [test]
  - servers/dashboard/src/types.ts [import]
  - specs/features/02-dashboard/spec-XYZ.md [mandatory, reference]
excludedNoiseCount: 3
deferredCount: 0
exception: none
```

### Required safety context exceeds a preference

Keep the security policy and negative-path tests even when the candidate list is otherwise small, then record `required_context_exceeds_preference`. A smaller manifest is never a reason to omit a trust boundary or required validation.

### Empty or ambiguous task evidence

Keep the applicable rules, memory, active spec, and explicitly changed files. Set `uncertain_relevance` and defer ambiguous imports or consumers instead of guessing that they are unrelated.
