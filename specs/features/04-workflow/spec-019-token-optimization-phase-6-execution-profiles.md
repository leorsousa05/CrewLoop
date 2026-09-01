---
name: spec-019-token-optimization-phase-6-execution-profiles
domain: 04-workflow
status: completed
created: 2026-09-01
completed: 2026-09-01
supersedes: []
---

# Native Token Optimization — Phase 6 Execution Profiles

## Objective

Make the optimization trade-off explicit and predictable by selecting an execution profile for each CrewLoop task. Profiles may tune context breadth, optional work, model capability, and verification depth, but none may remove mandatory safety, correctness, accessibility, tests, or user-confirmation requirements.

## Context

- Product roadmap: [`ROADMPA.md`](../../../ROADMPA.md), especially Phase 6 and the four suggested profiles.
- Existing profile classification: [`spec-014-token-optimization-phase-0-1.md`](spec-014-token-optimization-phase-0-1.md).
- Context selection: [`spec-015-token-optimization-phase-2-context-selection.md`](spec-015-token-optimization-phase-2-context-selection.md).
- Execution control: [`spec-016-token-optimization-phase-3-execution-control.md`](spec-016-token-optimization-phase-3-execution-control.md).
- Model routing: [`spec-018-token-optimization-phase-5-model-routing.md`](spec-018-token-optimization-phase-5-model-routing.md) and [`references/model-routing.md`](../../../references/model-routing.md).
- Shared workflow rules: [`references/conventions.md`](../../../references/conventions.md) and [`references/workflow.md`](../../../references/workflow.md).

The Phase 0/1 telemetry already carries the profile field, but the installed skills do not yet define the operational differences between profiles. This phase supplies that portable policy without creating per-user global state or provider-specific settings.

## Requirements

1. Define `minimal`, `balanced`, `safe`, and `review` profiles with explicit differences in context preference, optional execution, model capability, and verification emphasis.
2. Make `balanced` the default for unspecified tasks. Make `safe` the default for high-risk work and automatically raise a requested profile when it would weaken a risk-required control.
3. Restrict `minimal` to low-risk work with a bounded context, no optional retries, and the required verification gate still active.
4. Use `balanced` for normal work with relevant context, standard execution budgets, standard verification, and no optional work after completion.
5. Use `safe` for security, authorization, data-loss, destructive-operation, sensitive-data, or uncertain-risk work with mandatory context, stronger model routing, and expanded negative-path verification.
6. Use `review` for refactors, regressions, complexity, compatibility, or quality-focused work with broader impact analysis and regression checks; it must not replace the actual Review phase.
7. Carry a compact profile manifest through Plan, Code, and Review containing selected profile, requested profile (if any), risk, enforced invariants, and escalation reason. Do not include raw task content, provider data, credentials, or session identifiers.
8. Keep profiles task-local and additive. Do not create global session state, provider SDK configuration, new dependencies, or a profile that bypasses routing, review, security, or tests.

## Behavior / Flow

1. Plan classifies risk and reads any explicit profile request.
2. Plan selects the requested profile when compatible; otherwise it escalates to the minimum safe profile and records the reason.
3. Plan emits the compact profile manifest along with context and model-routing manifests.
4. Code applies profile preferences only to optional context, retries, and model routing; mandatory rules remain unchanged.
5. Review applies the profile's verification emphasis but evaluates the same fail-closed quality gate for every profile.

## Profile Contract

```typescript
type ExecutionProfile = 'minimal' | 'balanced' | 'safe' | 'review';
type ProfileContextMode = 'bounded' | 'relevant' | 'mandatory_plus_related' | 'broad_impact';
type VerificationDepth = 'focused' | 'standard' | 'expanded' | 'regression';

interface ExecutionProfilePolicy {
  profile: ExecutionProfile;
  context: ProfileContextMode;
  optionalRetries: 0 | 1;
  verification: VerificationDepth;
  minimumRisk: 'low' | 'medium' | 'high';
  preservesMandatoryControls: true;
}

interface ExecutionProfileManifest {
  schemaVersion: 1;
  requestedProfile: ExecutionProfile | null;
  selectedProfile: ExecutionProfile;
  risk: 'low' | 'medium' | 'high';
  escalation: 'none' | 'risk_requires_safe' | 'review_scope_required' | 'unavailable';
  preservesMandatoryControls: true;
}
```

## Constraints

- Change only the shared profile contract, Plan/Code/Review instructions, and the existing telemetry selector's profile-safety invariant with a focused regression test in this phase; do not change direct routing, role boundaries, or Shipper-only Git operations.
- Profiles may reduce optional work, never mandatory controls. Required validation, security, accessibility, tests, safe error handling, destructive-operation protection, and confirmations always remain active.
- Do not infer a profile from token count, file count, diff size, or provider pricing alone.
- Do not persist provider settings, prompts, responses, credentials, raw context, or session identifiers.
- Do not use `review` as an excuse to skip the mandatory Review phase or to trigger an automatic review loop after every trivial change.
- [Default]: chose `balanced` because correctness must not be opt-in for ordinary work.
- [Escalation]: chose automatic escalation to `safe` because risk controls must override a cheaper user preference.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| No profile requested | Select `balanced` for low/medium risk and `safe` for high risk. |
| User requests `minimal` for a high-risk task | Escalate to `safe`, record `risk_requires_safe`, and preserve mandatory checks. |
| User requests `safe` for low-risk work | Honor `safe`; extra verification is allowed and remains bounded. |
| Refactor, regression, compatibility, or quality task | Select or escalate to `review` and require broader impact/regression checks. |
| Profile conflicts with model capability availability | Record `unavailable`, preserve the safer route, and do not silently weaken controls. |
| Unknown risk | Use `safe` until Plan resolves the risk; do not select `minimal`. |
| Required context exceeds the profile preference | Keep required context and record the existing context exception. |
| Profile changes after work starts | Re-evaluate before the next stage; invalidate incompatible optional cache state and retain the stricter controls already applied. |
| Sensitive profile reason appears in a handoff | Pass only the bounded escalation category, never raw task or provider details. |

## Acceptance Criteria

- AC-01: Given an unspecified low/medium-risk task, when Plan selects a profile, then it selects `balanced` and preserves mandatory controls.
- AC-02: Given a high-risk task or an explicit low profile that conflicts with high risk, when Plan selects a profile, then it selects `safe` and records the escalation category.
- AC-03: Given a low-risk task explicitly requesting `minimal`, when Code applies the profile, then optional retries are disabled, context remains bounded, and required verification stays active.
- AC-04: Given a refactor, regression, compatibility, or quality task, when Plan selects a profile, then `review` is selected or escalated and regression-focused verification is required without bypassing the Review phase.
- AC-05: Given any profile, when required safety, validation, accessibility, tests, or user confirmations are evaluated, then those controls remain active regardless of cost preference.
- AC-06: Given a profile change or unavailable capability, when the manifest is updated, then the stricter controls remain and the bounded escalation/unavailable state is recorded without raw sensitive data.
- AC-07: Given the installed skill bundle, when the skill validator runs, then the shared profile reference is linked, structurally valid, and the existing seven-skill transition contract remains unchanged.

## Done When

- [x] AC-01 — proven by the default-profile examples in `references/execution-profiles.md`.
- [x] AC-02 — proven by the high-risk escalation examples.
- [x] AC-03 — proven by the minimal-profile execution example.
- [x] AC-04 — proven by the review-profile regression example.
- [x] AC-05 — proven by the mandatory-control invariant examples.
- [x] AC-06 — proven by the unavailable-capability and profile-change examples.
- [x] AC-07 — proven by `python scripts/validate-skills.py` using the configured Python executable and the unchanged transition metadata.
