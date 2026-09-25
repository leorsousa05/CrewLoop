# Execution Profiles

Profiles make the cost/quality trade-off explicit for the current task. They are task-local preferences layered on top of the risk budgets, model-routing policy, context-selection policy, and automatic verification gate.

## Profile Matrix

| Profile | Context | Optional retries | Model preference | Verification |
|---|---|---:|---|---|
| `minimal` | `bounded` | 0 | `economical`/`fast` when compatible with low risk | `focused` |
| `balanced` | `relevant` | 1 | stage and risk matrix | `standard` |
| `safe` | `mandatory_plus_related` | 1 | `capable` for risk-sensitive stages | `expanded` |
| `review` | `broad_impact` | 1 | `capable` for impact analysis | `regression` |

All profiles preserve mandatory controls. The matrix changes optional breadth and emphasis only; it never removes required context, security, authorization, validation, error handling, destructive-operation protection, accessibility, tests, confirmations, or the Review phase.

## Selection Rules

1. If no profile is requested, select `balanced` for low/medium risk and `safe` for high or unknown risk.
2. Select `minimal` only for low-risk work with a bounded context and no safety-sensitive concern. Disable optional retries, but keep required verification.
3. Use `balanced` for normal work. Keep relevant context, standard verification, the risk-based model route, and no optional work after completion.
4. Select or escalate to `safe` for security, authorization, data-loss, destructive-operation, sensitive-data, or unresolved-risk work. Keep mandatory plus directly related context and expanded negative-path checks.
5. Select or escalate to `review` for refactors, regressions, compatibility, complexity, or quality-impact work. Require broad impact and regression analysis; this does not replace the Review skill.
6. If a requested profile is weaker than the task risk, raise it to the minimum safe profile and record `risk_requires_safe` or `review_scope_required`.
7. If a capability or profile cannot be resolved, record `unavailable`, preserve stricter controls already applied, and route to Plan when the missing information blocks safe execution.

## Compact Manifest

```typescript
type ExecutionProfile = 'minimal' | 'balanced' | 'safe' | 'review';

interface ExecutionProfileManifest {
  schemaVersion: 1;
  requestedProfile: ExecutionProfile | null;
  selectedProfile: ExecutionProfile;
  risk: 'low' | 'medium' | 'high';
  escalation: 'none' | 'risk_requires_safe' | 'review_scope_required' | 'unavailable';
  preservesMandatoryControls: true;
}
```

Only bounded profile/risk/escalation values cross a handoff. Do not include raw task text, prompts, responses, provider settings, credentials, context contents, or session identifiers.

## Invariants

- A profile cannot authorize arbitrary workspace access or override context-boundary validation.
- A profile cannot turn unavailable required evidence into a pass.
- A profile cannot downgrade high-risk model routing because the diff is small.
- A profile cannot trigger an automatic review loop after every trivial change.
- If a profile changes after execution starts, re-evaluate before the next stage and retain the stricter controls already applied.

## Examples

### Default ordinary task

```text
requestedProfile: null
selectedProfile: balanced
risk: medium
escalation: none
```

### High-risk conflict

```text
requestedProfile: minimal
selectedProfile: safe
risk: high
escalation: risk_requires_safe
```

### Quality-focused refactor

```text
requestedProfile: null
selectedProfile: review
risk: medium
escalation: review_scope_required
```
