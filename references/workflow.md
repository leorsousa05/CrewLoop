# Workflow Reference

Complete workflow for the Loop Engineering Agents team.

---

## Team Roles

| Role | File | Responsibility |
|------|------|----------------|
| Orchestrator | `skills/orchestrator/SKILL.md` | Context discovery and routing |
| Architect | `skills/architect/SKILL.md` | Specs, contracts, architecture |
| Designer | `skills/designer/SKILL.md` | Visual/UI direction |
| Engineer | `skills/engineer/SKILL.md` | Implementation and tests |
| Reviewer | `skills/reviewer/SKILL.md` | Code review and quality gate |
| Shipper | `skills/shipper/SKILL.md` | Git operations and PR |

---

## Flow Diagram

```mermaid
flowchart TD
    O["🎯 Orchestrator<br>Discovery & Routing"] --> A["🏗️ Architect<br>Specs & Architecture"]
    A --> D["🎨 Designer<br>UI/UX Direction"]
    A --> E["🔧 Engineer<br>Implementation"]
    D --> E
    E --> R["🔍 Reviewer<br>Quality Gate"]
    R --> S["🚀 Shipper<br>Git & PR"]
    S --> O

    style O fill:#e1f5fe
    style A fill:#fff3e0
    style D fill:#f3e5f5
    style E fill:#e8f5e9
    style R fill:#ffebee
    style S fill:#e0f2f1
```

---

## Routing Rules

1. **Orchestrator ALWAYS sends to Architect first** — never directly to Designer or Engineer.
2. **Architect is the gatekeeper** — creates specs and routes to Designer (UI) or Engineer (code).
3. **Designer acts BEFORE Engineer** — visual spec before implementation.
4. **Engineer never does git or review** — routes to Reviewer after BUILD.
5. **Reviewer is the quality gate** — routes to Shipper if clean, or back to Engineer/Architect if issues are found.
6. **Shipper is the only one who touches git** — commit, branch, push, PR.
7. **All skills return to Orchestrator** — it is the central hub.
