---
name: spec-018-token-optimization-phase-5-model-routing
domain: 04-workflow
status: completed
created: 2026-09-01
completed: 2026-09-03
supersedes: []
---

# Native Token Optimization — Phase 5 Risk-Aware Model Routing

## Objective

Define a provider-neutral model-routing recommendation for each CrewLoop stage, with task risk taking precedence over apparent change size. The policy must reduce cost on low-risk discovery work while routing complex, security-sensitive, and debugging work to stronger capability plus verification.

## Context

- Product roadmap: [`ROADMPA.md`](../../../ROADMPA.md), especially Phase 5 and its risk rule.
- Optimization classification: [`spec-014-token-optimization-phase-0-1.md`](spec-014-token-optimization-phase-0-1.md).
- Context selection: [`spec-015-token-optimization-phase-2-context-selection.md`](spec-015-token-optimization-phase-2-context-selection.md).
- Execution control: [`spec-016-token-optimization-phase-3-execution-control.md`](spec-016-token-optimization-phase-3-execution-control.md).
- Automatic verification: [`spec-017-token-optimization-phase-4-automatic-verification.md`](spec-017-token-optimization-phase-4-automatic-verification.md).
- Shared workflow rules: [`references/conventions.md`](../../../references/conventions.md), [`references/workflow.md`](../../../references/workflow.md), and [`references/skill-contracts.yaml`](../../../references/skill-contracts.yaml).

CrewLoop supports multiple host agents and does not own provider model catalogs. The implementation therefore selects a capability class, not a vendor/model name, and lets the host resolve the available model.

## Requirements

1. Add a provider-neutral model-routing policy covering classification, file search, summarization, trivial changes, complex implementation, security work, and debugging.
2. Use the task risk (`low`, `medium`, `high`) as the primary routing input. Change size, file count, or token estimate must not downgrade a high-risk task.
3. Recommend `economical` capability for low-risk classification/search/summarization when no safety-sensitive concern exists; recommend `fast` for trivial low-risk changes; recommend `capable` for complex implementation, security, authorization, data-loss, destructive-operation, and debugging work.
4. Require verification for every route and preserve the existing Code → Review gate. A cheaper model is never a reason to skip tests, security checks, user confirmations, or review.
5. Carry a compact routing manifest through Plan and Code. It must include stage, capability class, risk, and verification requirement, but no prompt, response, credential, provider payload, or session identifier.
6. Handle missing capability metadata or unavailable host routing as `unavailable`; preserve the safe route and record a bounded fallback rather than silently selecting a weaker model.
7. Keep routing local and additive. Do not add provider SDKs, model price catalogs, remote routing, model fine-tuning, or a new dependency.

## Behavior / Flow

1. Plan classifies risk/profile and task stages from the active spec.
2. Plan applies the risk-first route matrix and emits a compact routing manifest.
3. Code receives the manifest and uses the host's available model resolver for each stage.
4. If the host cannot honor the recommendation, Code records a bounded fallback/unavailable result and keeps required verification and safety gates.
5. Review evaluates the resulting change independently; model capability never replaces objective verification.

## Model-Routing Contract

```typescript
type ModelCapability = 'economical' | 'fast' | 'capable';
type RoutingStage =
  | 'classification'
  | 'file_search'
  | 'summarization'
  | 'trivial_change'
  | 'complex_implementation'
  | 'security'
  | 'debugging';

interface ModelRoute {
  stage: RoutingStage;
  capability: ModelCapability;
  risk: 'low' | 'medium' | 'high';
  verificationRequired: true;
  fallback: 'same_capability' | 'capable' | 'unavailable';
}

interface ModelRoutingManifest {
  schemaVersion: 1;
  routes: ModelRoute[];
  hostResolution: 'available' | 'unavailable';
}
```

## Constraints

- Change only the shared model-routing contract and Plan/Code instructions in this phase; do not change direct routing, role boundaries, verification gates, or Shipper-only Git operations.
- Use capability classes instead of vendor names or invented model IDs.
- Do not route by estimated token count, line count, file count, or apparent diff size when risk indicates a stronger route.
- Do not persist provider payloads, prompts, responses, credentials, pricing data, or session identifiers.
- Do not treat model selection as proof of correctness; every route retains the Review and verification gates.
- [Capability abstraction]: chose provider-neutral classes because CrewLoop supports multiple host agents and does not own their model catalogs.
- [Risk precedence]: chose risk over size because a small authentication or destructive-operation change can have greater impact than a large low-risk documentation change.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Low-risk classification/search/summarization | Recommend `economical` with verification retained. |
| Low-risk trivial change | Recommend `fast` with focused tests and Review retained. |
| Complex implementation or medium/high-risk task | Recommend `capable`; do not downgrade based on small diff size. |
| Security, authorization, data-loss, destructive operation, or debugging | Recommend `capable` plus required verification and safe profile behavior. |
| Host has no model capability metadata | Mark `hostResolution: unavailable`; preserve capable fallback and verification requirements. |
| Requested capability is unavailable | Use the declared bounded fallback or stop as unavailable; do not silently choose a weaker route for high-risk work. |
| User explicitly requests a model that conflicts with risk | Preserve the risk-required verification and report the routing conflict; do not bypass safety gates. |
| Empty or ambiguous task stage | Keep classification at `capable` when risk is unknown; otherwise record unavailable and request Plan re-analysis. |
| Provider payload or secret appears during routing | Keep it outside the manifest/report and pass only capability, stage, risk, and status. |

## Acceptance Criteria

- AC-01: Given a low-risk discovery stage without safety concerns, when Plan creates the routing manifest, then it recommends `economical` and retains verification requirements.
- AC-02: Given a low-risk trivial implementation, when Plan creates the routing manifest, then it recommends `fast` with verification required.
- AC-03: Given a complex, security-sensitive, authorization, data-loss, destructive-operation, or debugging task, when Plan creates the routing manifest, then it recommends `capable` regardless of change size.
- AC-04: Given an unavailable host capability resolver or requested capability, when routing is evaluated, then the manifest records `unavailable` or its declared safe fallback without silently downgrading high-risk work.
- AC-05: Given any model capability route, when Code and Review execute the workflow, then tests, safety checks, user confirmations, and the existing Review gate remain required.
- AC-06: Given the installed skill bundle, when the skill validator runs, then the shared routing reference is linked, structurally valid, and the existing seven-skill transition contract remains unchanged.

## Done When

- [x] AC-01 — proven by the low-risk discovery route example in `references/model-routing.md`.
- [x] AC-02 — proven by the trivial-change route example in the shared model-routing reference.
- [x] AC-03 — proven by the risk-first security/debugging examples.
- [x] AC-04 — proven by the unavailable-host and bounded-fallback examples.
- [x] AC-05 — proven by the verification-preservation rules in Plan, Code, and the model-routing reference.
- [x] AC-06 — proven by `python scripts/validate-skills.py` using the configured Python executable and the unchanged transition metadata.
