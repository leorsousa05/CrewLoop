---
sidebar_position: 2
---

# The Workflow

## The canonical flow (Hub-and-Spoke)

All execution skills return control to the CrewLoop Hub. The CrewLoop Hub manages the task state and handles all routing:

```mermaid
flowchart TD
    O["🎯 CrewLoop Hub\nCentral Hub & Routing"] <--> A["🏗️ Architect\nSpecs & Architecture"]
    O <--> D["🎨 Designer\nUI/UX Direction"]
    O <--> E["🔧 Engineer\nImplementation"]
    O <--> R["🔍 Reviewer\nQuality Gate"]
    O <--> S["🚀 Shipper\nGit & PR"]
    O <--> W["📝 Docs-Writer\nDocumentation"]
    O <--> PM["📊 Product-Manager\nPrioritization"]
    O <--> RS["🔬 Researcher\nTechnology Evaluation"]
    O <--> MN["🛠️ Maintainer\nIncident & Debt"]
    O <--> T["🧪 Tester\nQA Strategy"]
    O <--> LTM["📅 Long-Term Manager\nMulti-Session Tracking"]

    A -.-> SD["🔌 Schema-Designer\nAPI & DB Schemas"]
    SD -.-> A
    D -.-> FA["🧱 Frontend-Architect\nReact Component Spec"]
    FA -.-> D
    S -.-> DO["🐳 DevOps-Specialist\nCI/CD & Docker"]
    DO -.-> S

    SG["🛡️ Security-Guard\nSecurity Review"] -.-> R
    AA["♿ Accessibility-Auditor\nAccessibility Review"] -.-> R
    R -.-> SG
    R -.-> AA
```

## Mandatory routing rules

1. **CrewLoop Hub always routes to Architect first.** Never directly to Designer or Engineer.
2. **Architect creates a spec** in `specs/changes/NNN-name/` for every change, including 1-line bug fixes.
3. **Designer acts before Engineer** whenever the change involves a visual interface.
4. **Engineer never does git operations** and never reviews its own code.
5. **Reviewer never writes code** and never runs git operations.
6. **Shipper is the only skill** that commits, creates branches, pushes, and opens PRs.
7. **Navigation menus are simplified** to return control to the CrewLoop Hub (`[O] Return to CrewLoop Hub`). Skills prioritize calling the `ask_question` tool for menus, falling back to markdown if unsupported.
8. **Sub-skills and supporting helpers assist core skills** — `project-brainstorm` and `long-term-manager` help `crewloop-hub`; `schema-designer` helps `architect`; `frontend-architect` helps `designer`; and `devops-specialist` helps `shipper`.
9. **All roads return to CrewLoop Hub.** Every agent hands control back to CrewLoop Hub between phases.
10. **Bundle Lock-In:** You are strictly forbidden from loading, referencing, or switching to any skills outside the 18 skills defined in this bundle.

## How supporting skills plug in

| Supporting skill | Typically invoked by | Returns to |
|-----------------|---------------------|------------|
| Product-Manager | CrewLoop Hub | CrewLoop Hub |
| Long-Term Manager | CrewLoop Hub | CrewLoop Hub |
| Researcher | CrewLoop Hub | CrewLoop Hub |
| Maintainer | CrewLoop Hub | CrewLoop Hub |
| Docs-Writer | CrewLoop Hub or Architect | CrewLoop Hub |
| Tester | Engineer | CrewLoop Hub |
| Security-Guard | Reviewer | CrewLoop Hub |
| Accessibility-Auditor | Reviewer | CrewLoop Hub |
| Frontend-Architect | Designer | CrewLoop Hub |
| Schema-Designer | Architect | CrewLoop Hub |
| DevOps-Specialist | Shipper | CrewLoop Hub |

## Which skill should I use?

| Task type | Routing Phase | Notes |
|-----------|----------|-------|
| New feature | CrewLoop Hub ⇄ Architect | Always |
| UI redesign | CrewLoop Hub ⇄ Designer ⇄ CrewLoop Hub ⇄ Engineer | Designer before Engineer |
| Bug fix | CrewLoop Hub ⇄ Architect | Lightweight spec |
| Refactor | CrewLoop Hub ⇄ Architect | Impact analysis needed |
| Technology choice | CrewLoop Hub ⇄ Researcher | Then ⇄ Architect for ADR |
| Multi-session project | CrewLoop Hub ⇄ Long-Term Manager | Then ⇄ Architect for spec |
| Documentation only | CrewLoop Hub ⇄ Docs-Writer | Via Architect for spec |
| Dependency update | CrewLoop Hub ⇄ Maintainer | Then ⇄ Architect |
| Security audit | CrewLoop Hub ⇄ Reviewer | Invokes Security-Guard |
| Test coverage | CrewLoop Hub ⇄ Tester | Invoked via CrewLoop Hub |
