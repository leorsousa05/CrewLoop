# Automatic Verification

Use this protocol for the pending change after Code reports its verification. The Review gate is evidence-driven and read-only: it evaluates the change, reports findings, and routes corrections without editing files or performing Git operations.

## Build the Verification Matrix

1. Read the active feature spec and map every acceptance criterion to its required test, build, format, schema, link, security, accessibility, or manual check.
2. Inspect the relevant package scripts and existing validation tools. Run the smallest relevant set that proves the mapped criteria; do not run unrelated suites only to create activity.
3. Mark each check `passed`, `failed`, `unavailable`, or `not_applicable` based on the observed result.
4. Treat a required `unavailable` check as a gate failure unless the spec explicitly defines an observable alternative. A missing dependency, skipped test, or unrun command is never a pass.

## Pending File and Safety Scans

Inspect all changed tracked and untracked files before deciding the verdict.

- Confirm every file belongs to the active spec's scope.
- Reject `node_modules/`, `dist/`, `build/`, generated artifacts, committed `.env` files, and credential/private-key material.
- Scan changed files for secret-like names and values such as `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`, and `PRIVATE_KEY`. Report only category, file, and line; never echo the value.
- Scan for AI artifacts: placeholder comments, unreferenced `TODO`/`FIXME`, `console.log`, `debugger`, empty catches, generated-attribution comments, and commented-out code.
- Scan changed scripts, workflows, and automation for broad destructive commands such as recursive deletion, hard reset, destructive checkout, or database destruction. Detection is read-only; never execute the command to validate it.
- Recheck changed security boundaries, authorization, input validation, safe errors, destructive-operation protection, accessibility, and essential tests whenever the diff touches them.

## Sanitized Report Contract

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
  status: 'failed' | 'unavailable';
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

`category` is a bounded label. Never include secret values, raw command output, prompts, responses, credentials, tool payloads, or full logs in the report, chat log, telemetry, or dashboard event.

## Verdict and Correction Loop

- PASS requires every required check to pass, no unresolved scope/security/sensitive-artifact finding, and evidence for every acceptance criterion.
- FAIL returns a sanitized finding to Code. Code may perform one bounded correction round and Review then reruns the affected checks plus the relevant gate.
- If the same finding remains after correction round 1, stop the correction loop and route to Plan for re-analysis. Do not ask the model to keep retrying.
- Optional checks may be `unavailable` without blocking PASS only when no acceptance criterion depends on them and the report says so explicitly.

## Examples

### Required check unavailable

```text
check: tests
status: unavailable
required: true
finding: { category: missing_test_runner, file: null, line: null }
verdict: fail
```

The report does not include the shell output or environment path.

### Destructive command detection

If a changed script contains a broad recursive deletion or hard reset, record `destructive_command_scan: failed` with the file, line, and category. Do not execute the script. Only an active spec with an explicitly bounded, authorized operation can clear the finding.

### One bounded correction

Review reports a failing focused test to Code. After one correction, Review reruns the focused test and scope/security scans. If it still fails, route to Plan instead of starting a second autonomous repair cycle.
