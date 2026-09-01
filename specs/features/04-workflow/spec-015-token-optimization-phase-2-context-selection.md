---
name: spec-015-token-optimization-phase-2-context-selection
domain: 04-workflow
status: active
created: 2026-09-01
completed: null
supersedes: []
---

# Native Token Optimization — Phase 2 Context Selection

## Objective

Make `crewloop:plan` select and hand off only task-relevant context using deterministic textual matches, changed-file signals, and direct import relationships. The first implementation must reduce repeated and unrelated context without introducing semantic search, provider integrations, or a hard cap that can remove required safety or correctness information.

## Context

- Product roadmap: [`ROADMPA.md`](../../../ROADMPA.md), especially Phase 2 and the first textual/import-based approach.
- Workflow contract: [`references/workflow.md`](../../../references/workflow.md) and [`references/conventions.md`](../../../references/conventions.md).
- Current optimization foundation: [`spec-014-token-optimization-phase-0-1.md`](spec-014-token-optimization-phase-0-1.md).
- Skill authoring contract: [`references/skill-contracts.yaml`](../../../references/skill-contracts.yaml).

The repository's executable orchestration surface is the installed CrewLoop skill set. The dashboard observes normalized facts but does not own provider prompts or model context. Therefore this phase implements the selection behavior in the Plan skill and its portable reference, while preserving the existing telemetry boundary for later measurement.

## Requirements

1. Add a portable context-selection procedure to `crewloop:plan` that starts from the task objective, active spec, project rules, and project memory, then selects relevant files through changed-file, textual-match, import/consumer, associated-test, and required-reference signals.
2. Define a compact context manifest with selected paths and bounded reasons. The manifest must deduplicate a path selected by multiple signals and must not include file contents, prompts, responses, commands, credentials, raw transcripts, or workspace session identifiers.
3. Preserve mandatory context: applicable `AGENTS.md` instructions, active feature spec, required security or accessibility guidance, and tests needed to validate the requested behavior. Mandatory context may exceed a soft selection preference when correctness requires it.
4. Exclude known noise by default: `node_modules/`, build output, generated files, caches, unrelated history, production secrets, and files outside the bounded workspace. The selector must never exclude safety, validation, accessibility, or user-confirmation rules solely to reduce context.
5. Reuse context already collected in the current task and avoid repeating full reference documents across handoffs. Each handoff must carry the compact brief, selected paths, and only the specific findings needed by the next skill.
6. Keep the initial selector deterministic and local. Do not add embeddings, vector search, remote indexing, provider SDKs, new runtime dependencies, or a new global session-state store.
7. If relevance cannot be established safely, retain the candidate for review or record a bounded context exception rather than silently dropping it. Do not estimate provider token counts from characters, lines, or file sizes.

## Behavior / Flow

1. Plan classifies the task and reads the required project memory and active spec.
2. Plan builds candidates from modified files, exact task-term matches, one-hop imports/consumers, directly associated tests, and required references.
3. Plan ranks candidates by mandatory status first, then direct task evidence, changed-file evidence, import relationship, test relationship, and textual matches.
4. Plan removes duplicate paths and excludes known noise. A file selected by multiple signals appears once with a short list of signal labels.
5. Plan emits a compact context-selection section in the brief/spec containing the selected path list, selection signals, deferred/noise counts, and any safety/correctness exception.
6. Handoffs reuse that manifest. A later phase requests additional context only when a validation failure, missing contract, or safety concern provides a concrete reason.

## Context Selection Contract

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

Paths are relative, normalized, and bounded to the active workspace. Signal labels are an allowlist; free-form reasons do not cross the handoff boundary.

## Constraints

- Change only the CrewLoop Plan context-selection contract and its portable reference in this phase; do not change direct routing, role boundaries, review gates, or Shipper-only git ownership.
- Preserve the local-only sanitization and workspace access boundaries. Context selection is not permission to read arbitrary paths.
- Do not add a provider token counter, token estimator, semantic index, external service, dependency, or UI surface.
- Do not treat a smaller selected set as success unless required validation and scope checks still pass.
- Do not alter the existing Phase 0/1 benchmark corpus or retroactively fabricate context savings from historical runs.
- [Context source]: chose skill instructions plus a portable reference because CrewLoop distributes Markdown skills and does not own the provider orchestrator; revisit if a native execution host is added.
- [Selection safety]: chose mandatory-context preservation plus soft preferences because required correctness context must never be removed by a cost heuristic.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Empty task text or no textual matches | Keep mandatory context and changed files; mark uncertain relevance when no additional candidate can be justified. |
| Duplicate path from modified, import, and test signals | Emit one normalized candidate with deduplicated allowlisted signals. |
| Invalid, absolute, traversal, or workspace-escaping path | Do not include it in the manifest; rely on existing workspace-access validation and report a bounded exclusion. |
| Generated, build, cache, or dependency path | Exclude by default and increment the bounded noise count. |
| Required safety or validation file exceeds the soft preference | Keep it and set `required_context_exceeds_preference`; never truncate it silently. |
| Ambiguous import or consumer relationship | Defer the candidate or retain it for review; do not guess that it is irrelevant. |
| Sensitive content in a candidate or reason | Pass only the normalized relative path and allowlisted signals; never include the content or free-form reason. |
| Concurrent file changes after selection | Re-run the bounded selection before implementation or mark the manifest stale; do not use an unverified path set as authorization. |
| No active spec or project memory is available | Stop the Plan phase with a bounded missing-context result; do not route to implementation with an incomplete mandatory contract. |

## Acceptance Criteria

- AC-01: Given a task with changed files, exact task matches, imports, consumers, and associated tests, when Plan builds its context manifest, then the selected paths include the relevant candidates with allowlisted signals and no duplicate path entries.
- AC-02: Given a repository containing dependency, build, generated, cache, absolute, traversal, and unrelated paths, when Plan builds its context manifest, then those paths are excluded or deferred without crossing the workspace boundary and the manifest contains no raw content.
- AC-03: Given a task requiring security, accessibility, validation, or user-confirmation rules, when the soft context preference would exclude one of those rules, then the rule remains selected and the manifest records a bounded exception.
- AC-04: Given two handoffs for the same task, when the second handoff has no new validation or safety finding, then it reuses the compact manifest and does not repeat the full reference contents.
- AC-05: Given empty task text, missing matches, ambiguous relationships, or a stale file set, when selection runs, then it preserves mandatory context and returns a bounded uncertain/stale result instead of silently dropping required information.
- AC-06: Given the installed skill bundle, when the skill validator runs, then the new portable context reference is linked, structurally valid, and the existing seven-skill transition contract remains unchanged.

## Done When

- [x] AC-01 — proven by the documented selection examples and review of the Plan manifest procedure for signal ranking and deduplication.
- [x] AC-02 — proven by the documented exclusion matrix and `scripts/validate-skills.py` link/structure validation.
- [x] AC-03 — proven by the mandatory-context and exception examples in `skills/crewloop-plan/references/context-selection.md`.
- [x] AC-04 — proven by the handoff-reuse example in the portable context reference and review of the Plan handoff rules.
- [x] AC-05 — proven by the edge-case examples for empty, ambiguous, invalid, and stale candidates.
- [x] AC-06 — proven by `python scripts/validate-skills.py` using the configured Python executable and the unchanged transition metadata.
