# Model Routing

Use capability classes instead of provider or model names. CrewLoop supports several host agents and does not own a provider catalog; the host resolves the concrete model when it can.

## Risk-First Route Matrix

| Stage | Default capability | Required behavior |
|---|---|---|
| Classification | `economical` | Use only when no safety-sensitive concern is present. |
| File search | `economical` | Keep workspace and context-boundary checks. |
| Summarization | `economical` | Preserve security, validation, and user constraints. |
| Trivial change | `fast` | Focused tests and Review remain required. |
| Complex implementation | `capable` | Use the stronger route regardless of file count or diff size. |
| Security / authorization | `capable` | Keep the safe profile and required negative-path verification. |
| Debugging | `capable` | Preserve failure evidence and bounded retry control. |

Risk takes precedence over apparent size. A small authentication, authorization, data-loss, or destructive-operation change is still a `capable` route. When risk is unknown, use the safer route until Plan resolves it.

## Compact Routing Manifest

Carry only the stage, capability, risk, verification requirement, fallback, and host-resolution status. Do not include provider payloads, model output, prompts, credentials, pricing data, or session identifiers.

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

## Fallbacks

- If the host cannot resolve capability metadata, set `hostResolution: unavailable`; do not invent a model or claim that routing was applied.
- If `economical` is unavailable for a low-risk stage, use `same_capability` only when the host provides an equivalent; otherwise use `capable` and record the fallback.
- If `fast` is unavailable for a trivial change, use `capable` rather than weakening verification.
- If `capable` is unavailable for medium/high-risk work, record `unavailable`, preserve the required safety and verification gates, and stop or request Plan re-analysis.
- An explicit user model preference can be honored only when it does not bypass risk-required controls. Report a conflict without exposing provider details.

## Stage Handoff

Plan emits the manifest once. Code applies the route for the relevant stage and retains the manifest in the current task only. Review evaluates correctness independently; no capability class is evidence of a passing change.

## Examples

### Low-risk discovery

```text
stage: file_search
capability: economical
risk: low
verificationRequired: true
fallback: same_capability
hostResolution: available
```

### Small but security-sensitive change

```text
stage: security
capability: capable
risk: high
verificationRequired: true
fallback: unavailable
hostResolution: available
```

The route remains `capable` even if the change touches one line.

### Unavailable host resolver

Set `hostResolution: unavailable`, preserve the capable fallback and required verification, and do not silently downgrade a high-risk task.
