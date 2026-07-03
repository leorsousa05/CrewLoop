# Design: Clean Orchestrator Brief and Shipper Version Bumps

## 1. Simplified Brief Template Blueprint

```markdown
## Task Brief

- **Type:** [feature | modification | bugfix | refactor | docs]
- **Scope:** [new | existing codebase]
- **Priority:** [P0 | P1 | P2]

### Objective
[1-2 sentences summarizing the core goal]

### Requirements
- [ ] Requirement 1

### Affected Files
- `path/to/file`

[Only include below sections if populated/relevant]

### Design & Visuals
- Style/Color: ...
- Layout: ...

### Technical Specs
- State/Data flow: ...
```

---

## 2. Shipper Version Bump Verification Logic

```mermaid
flowchart TD
    Start[Verify Changes] --> GetFiles[git diff --name-only]
    GetFiles --> CheckWorkspace{Are files inside a versioned workspace?}
    CheckWorkspace -- No --> Skip[Skip bump checks]
    CheckWorkspace -- Yes --> CheckType{Commit type is feat or fix?}
    CheckType -- No --> Skip
    CheckType -- Yes --> CheckBumped{Is version already bumped in diff?}
    CheckBumped -- Yes --> Approved[Approved to commit]
    CheckBumped -- No --> Mandatory[Mandatory Bump Required]
    Mandatory --> SuggestBump[Prompt user for version bump: patch/minor/major]
```
