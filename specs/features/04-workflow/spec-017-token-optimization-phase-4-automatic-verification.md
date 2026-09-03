---
name: spec-017-token-optimization-phase-4-automatic-verification
domain: 04-workflow
status: completed
created: 2026-09-01
completed: 2026-09-03
supersedes: []
---

# Native Token Optimization — Phase 4 Automatic Verification

## Objective

Make `crewloop:review` use objective verification gates so the model is not the only authority over correctness, security, or scope. The gate must run only relevant checks, fail closed when required evidence is unavailable, and allow at most one bounded correction round before re-analysis.

## Context

- Product roadmap: [`ROADMPA.md`](../../../ROADMPA.md), especially Phase 4 and its limited-correction requirement.
- Phase 3 execution control: [`spec-016-token-optimization-phase-3-execution-control.md`](spec-016-token-optimization-phase-3-execution-control.md).
- Existing Review rules: [`skills/crewloop-review/references/review-checklist.md`](../../../skills/crewloop-review/references/review-checklist.md).
- Workflow contract: [`references/workflow.md`](../../../references/workflow.md), [`references/conventions.md`](../../../references/conventions.md), and [`references/skill-contracts.yaml`](../../../references/skill-contracts.yaml).

The repository already has package-specific builds/tests, a skill validator, local trust-boundary tests, and a Review checklist. This phase composes those existing checks into a portable Review protocol and does not add a second test runner or security service.

## Requirements

1. Add a portable verification protocol to `crewloop:review` covering required tests/builds, format/schema/link checks when applicable, changed-file scope, secrets and sensitive-data scanning, basic security checks, AI artifacts, and destructive-command detection.
2. Derive required verification commands from the active feature spec and existing package scripts. Run the smallest relevant set that proves the acceptance criteria; do not claim a check passed without evidence.
3. Classify each check as `passed`, `failed`, `unavailable`, or `not_applicable`. A required `unavailable` check prevents a passing verdict unless the spec explicitly permits the environment limitation.
4. Inspect the complete pending file set, including untracked files, and reject build/dependency artifacts, `.env` files, secrets, raw credentials, or out-of-scope changes.
5. Scan changed implementation and automation files for dangerous destructive commands such as broad recursive deletion, hard resets, destructive checkout, or database destruction. Flag them unless the active spec explicitly authorizes the operation and the target is bounded.
6. Keep findings sanitized: report file and line plus a stable category, never secret values, raw command payloads, prompts, responses, credentials, or full tool output.
7. On a failing review, route findings to Code for at most one bounded correction round. Re-run the affected checks after correction; if the failure remains, route to Plan for re-analysis instead of retrying indefinitely.
8. Preserve the existing Review → Ship / Code transition contract and Shipper-only git operations. Review must not modify files, commit, branch, push, or open a PR.

## Behavior / Flow

1. Review reads the active feature spec, current pending file set, relevant package scripts, and the existing checklist.
2. Review creates a verification plan mapped to acceptance criteria and identifies required versus optional checks.
3. Review runs the smallest relevant verification commands and records their status without storing raw output.
4. Review inspects scope, changed-file types, secrets, AI artifacts, unsafe commands, security boundaries, and test evidence.
5. Review produces a sanitized report. PASS requires all required checks passed, no unresolved security/scope finding, and every acceptance criterion having evidence. FAIL routes to one Code correction; a repeated failure routes to Plan.

## Verification Contract

```typescript
type VerificationStatus = 'passed' | 'failed' | 'unavailable' | 'not_applicable';
type VerificationCheck =
  | 'tests'
  | 'build'
  | 'format'
  | 'schema'
  | 'links'
  | 'scope'
  | 'secret_scan'
  | 'security_scan'
  | 'destructive_command_scan'
  | 'ai_artifact_scan';

interface VerificationFinding {
  check: VerificationCheck;
  status: Exclude<VerificationStatus, 'passed' | 'not_applicable'>;
  file: string | null;
  line: number | null;
  category: string;
}

interface VerificationReport {
  schemaVersion: 1;
  checks: Array<{ check: VerificationCheck; status: VerificationStatus; required: boolean }>;
  findings: VerificationFinding[];
  correctionRound: 0 | 1;
  verdict: 'pass' | 'fail';
}
```

`category` is a bounded label. The report must not contain secret values, raw command output, prompts, responses, payloads, or credentials.

## Constraints

- Change only the `crewloop:review` verification contract and its portable reference in this phase; do not change implementation code, direct routing, role boundaries, or Shipper-only git ownership.
- Reuse existing package scripts, `scripts/validate-skills.py`, and the Review checklist. Do not add a new dependency or duplicate scanner.
- Do not run or suggest destructive commands as part of verification. Static detection must be read-only.
- Do not treat a missing tool, missing dependency, or skipped required test as a pass.
- Do not expose secrets or raw command output in findings, telemetry, manifests, or chat logs.
- [Evidence policy]: chose fail-closed for required unavailable checks because a token-saving result without quality evidence is not a valid optimization.
- [Correction policy]: chose one correction round because repeated autonomous fixes can cost more than the original task and obscure the root cause.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| No relevant test/build command exists | Mark the check `not_applicable` only when the spec has observable alternative evidence; otherwise mark required verification `unavailable`. |
| Required command or dependency unavailable in the environment | Mark `unavailable`, do not claim PASS, and report only the bounded environment category. |
| Test/build/format/schema/link check fails | Mark `failed`, include sanitized file/line/category when available, and route one bounded correction round. |
| Untracked file appears in the pending set | Inspect it fully for scope, secrets, generated output, and AI artifacts before verdict. |
| Secret-like value found | Do not echo it; fail the scan with a category and location only. |
| Destructive command found in changed script | Fail unless explicitly authorized and bounded by the spec; never execute the command to verify it. |
| Required security, accessibility, or confirmation check is skipped | Fail or mark required evidence unavailable; token reduction cannot override the omission. |
| First correction does not resolve the finding | Stop the correction loop and route to Plan for re-analysis. |
| Optional check is unavailable | Record `unavailable` without blocking PASS when no acceptance criterion depends on it; do not mislabel it as passed. |
| Review report contains raw output or sensitive data | Sanitize before returning the report; the raw material must not be persisted or broadcast. |

## Acceptance Criteria

- AC-01: Given an active feature spec with verification commands, when Review evaluates the change, then each required command is mapped to an acceptance criterion and its actual result is recorded as passed, failed, unavailable, or not applicable.
- AC-02: Given changed tracked and untracked files, when Review inspects the pending set, then it checks scope, generated/dependency artifacts, secrets, AI artifacts, and sensitive-data exposure before deciding PASS.
- AC-03: Given a changed script containing a broad destructive command, when the destructive-command scan runs, then Review fails the change without executing the command and without exposing its raw payload.
- AC-04: Given a required test, build, format, schema, link, security, or accessibility check that cannot run, when Review evaluates the gate, then it records unavailable and does not pass the change without an explicitly permitted alternative.
- AC-05: Given a failed check, when Review returns findings to Code, then at most one correction round is allowed; a repeated failure stops the loop and routes to Plan.
- AC-06: Given all required checks pass, scope is respected, no security finding remains, and every acceptance criterion has evidence, when Review creates its report, then the verdict is PASS and the existing route to Ship remains unchanged.
- AC-07: Given the installed skill bundle, when the skill validator runs, then the new verification reference is linked, structurally valid, and the existing seven-skill transition contract remains unchanged.

## Done When

- [x] AC-01 — proven by the verification matrix and command-mapping examples in `skills/crewloop-review/references/automatic-verification.md`.
- [x] AC-02 — proven by the changed-file and sensitive-artifact scan examples.
- [x] AC-03 — proven by the destructive-command detection examples, which remain read-only.
- [x] AC-04 — proven by the unavailable-check examples and fail-closed rule.
- [x] AC-05 — proven by the one-correction-round flow example.
- [x] AC-06 — proven by the PASS gate example and preserved transition contract.
- [x] AC-07 — proven by `python scripts/validate-skills.py` using the configured Python executable and the unchanged transition metadata.
