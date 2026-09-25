---
name: spec-021-continuous-benchmark-ci-gate
domain: 04-workflow
status: completed
created: 2026-09-01
completed: 2026-09-01
supersedes: []
---

# Continuous Benchmark CI Gate

## Objective

Make the Phase 7 benchmark contract execute automatically in CrewLoop's existing validation workflow so corpus, policy metadata, thresholds, and adoption decisions cannot silently drift.

## Context

- Roadmap: [`ROADMPA.md`](../../../ROADMPA.md), Phase 7 continuous optimization.
- Continuous policy contract: [`spec-020-token-optimization-phase-7-continuous-optimization.md`](spec-020-token-optimization-phase-7-continuous-optimization.md).
- Existing CI workflow: [`validate.yml`](../../../.github/workflows/validate.yml).
- Existing CLI and fixed fixtures: [`servers/dashboard/src/telemetry/benchmark-cli.ts`](../../../servers/dashboard/src/telemetry/benchmark-cli.ts) and [`servers/dashboard/src/telemetry/fixtures/`](../../../servers/dashboard/src/telemetry/fixtures/).

The current CI already installs dependencies, builds workspaces, runs tests, and validates skills, but it does not invoke the fixed-corpus benchmark. The CLI already returns a non-zero exit code for a failed comparison, so the smallest correct integration is a post-build CI step plus concise dashboard documentation for local reproduction.

## Requirements

1. Add a step to `.github/workflows/validate.yml` that runs the dashboard token benchmark CLI with the fixed baseline and candidate fixtures after the workspace build.
2. The CI step must fail when the CLI returns a non-zero exit code, including invalid metadata/corpus, failed quality gates, unavailable required measurements, or `keep_baseline` results.
3. Keep the command explicit about baseline and candidate fixture paths and use the existing `compareTokenOptimizationBenchmarks` implementation through the package CLI; do not duplicate threshold logic in YAML.
4. Document the equivalent local command in `servers/dashboard/README.md`, including the expected `adopt_candidate` result and the candidate-failure fixture for validating `keep_baseline` behavior.
5. Preserve local-only synthetic fixtures, the existing validation job permissions, dependency versions, role boundaries, and the recommendation-only policy adoption boundary.
6. Do not add a remote telemetry service, scheduled workflow, secrets, automatic policy activation, release behavior, new dependencies, or a second benchmark engine.

## Behavior / Flow

1. CI checks out the repository, installs the existing workspace dependencies, and builds the dashboard server as it does today.
2. CI invokes `benchmark:tokens` with `fixtures/baseline.json` and `fixtures/candidate.json`.
3. The CLI validates policy identity and fixed six-scenario coverage, compares all configured quality gates, prints the report, and exits `0` only for `adopt_candidate`.
4. Any failure stops the validation job before merge; no runtime policy or repository file is changed by the benchmark step.
5. A developer can reproduce the passing gate locally and can run `candidate-fail.json` to verify the rejection path.

## CI Contract

```yaml
- name: Run continuous token benchmark
  run: >-
    npm run benchmark:tokens --workspace=@archznn/crewloop-dashboard --
    --baseline src/telemetry/fixtures/baseline.json
    --candidate src/telemetry/fixtures/candidate.json
    --format markdown
```

The command must run after `npm run build --workspaces` and before the job is considered successful. The CLI's exit code is the only CI decision source; the workflow must not parse or recreate benchmark metrics.

## Constraints

- Modify only the existing validation workflow and dashboard benchmark documentation in this phase, plus focused tests/fixtures if a contract mismatch is discovered.
- Do not run the failing fixture in the required CI path; keep it available for local negative-path verification.
- Do not weaken the existing build, test, skill-validation, security, permissions, or branch protections to make the benchmark pass.
- Do not commit generated `dist/`, `node_modules/`, `.env`, credentials, or benchmark output files.
- Keep the workflow deterministic and bounded; no network calls beyond the existing dependency installation and no external benchmark data.
- [Reuse]: chose the existing CLI because it already owns validation, thresholds, output, and exit semantics.
- [Fail-closed]: chose a required post-build step because a missing benchmark invocation must fail CI rather than silently skip continuous optimization.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Baseline fixture missing | CLI fails with a non-zero exit code; CI fails. |
| Candidate fixture missing | CLI fails with a non-zero exit code; CI fails. |
| Fixture policy ID/version invalid | Dataset validation fails without echoing raw values. |
| Fixed scenario removed or coverage differs | Corpus validation fails before a benchmark win is reported. |
| Candidate saves tokens but fails a required gate | CLI returns `keep_baseline` and exit code 1; CI fails. |
| Required measurement unavailable | CLI returns a failed comparison; CI fails closed. |
| Local developer runs the negative fixture | The command exits 1 intentionally and documents the expected rejection. |
| CI output contains sensitive content | Existing bounded benchmark errors/report fields contain only policy metadata and sanitized failure categories. |
| Workflow step is accidentally reordered before build | The command fails because the dashboard CLI is not compiled; CI exposes the ordering mistake. |
| Existing unrelated validation fails | The existing job remains authoritative; benchmark changes do not mask earlier failures. |

## Acceptance Criteria

- AC-01: Given the existing validation workflow, when a normal CI run reaches the post-build benchmark step, then it invokes the CLI with the fixed baseline and candidate fixture paths and the Markdown format.
- AC-02: Given valid fixed fixtures, when the CI benchmark command runs, then it returns exit code 0 and reports `adopt_candidate`.
- AC-03: Given a candidate fixture with a quality regression, when the same CLI is run locally, then it reports `keep_baseline` with a non-zero exit code.
- AC-04: Given a missing, invalid, or incomplete fixture, when the CI command runs, then the step fails without producing a false optimization success.
- AC-05: Given the workflow change, when the YAML and dashboard documentation are inspected, then no new dependency, secret, permission, remote telemetry, policy activation, or generated artifact is introduced.
- AC-06: Given the repository's existing validation suite, when build, tests, skill validation, and benchmark gate run, then all existing checks remain active and the new gate is deterministic.

## Done When

- [x] AC-01 — proven by the committed `validate.yml` step and workflow review.
- [x] AC-02 — proven by the passing fixed-fixture CLI command after a successful workspace build.
- [x] AC-03 — proven by the local `candidate-fail.json` CLI command returning exit code 1 and `keep_baseline`.
- [x] AC-04 — proven by existing CLI/dataset validation tests and the fixed-corpus validator.
- [x] AC-05 — proven by changed-file/security/secret/generated-artifact review.
- [x] AC-06 — proven by the complete dashboard test suite, workspace build, skill validator, and benchmark gate.
