# Design: Smart Shipper Git Flow

## Git Operation & Decision Workflows

### 1. Verification of Remote State
```mermaid
flowchart TD
    Start[Verify Git State] --> CheckRemote{git remote -v?}
    CheckRemote -- Empty --> AskURL[Ask user for remote origin URL]
    AskURL --> AddRemote[git remote add origin <url>]
    AddRemote --> CheckMain
    CheckRemote -- Exists --> CheckMain{First commit or no remote branches?}
    CheckMain -- Yes --> PushMain[Set default branch to main and push directly]
    CheckMain -- No --> AskMode[Ask user: Solo vs Teamwork Mode]
```

### 2. Solo vs Teamwork Mode Decision
```mermaid
flowchart TD
    AskMode --> SelectSolo[Solo Mode]
    AskMode --> SelectTeam[Teamwork Mode]
    SelectSolo --> CommitSolo[Commit on current branch]
    CommitSolo --> PushSolo[git push origin <current-branch>]
    SelectTeam --> StashAll[git stash push -m 'pre-checkout-stash']
    StashAll --> CheckoutBranch[git checkout -b <type>/<description>]
    CheckoutBranch --> ApplyFeature[git stash pop / apply only feature changes]
    ApplyFeature --> CommitTeam[Commit on feature branch]
    CommitTeam --> PushTeam[git push -u origin <branch>]
    PushTeam --> CheckGH{Is 'gh' CLI available?}
    CheckGH -- Yes --> CreatePR[gh pr create --fill]
    CheckGH -- No --> WebPR[Generate browser comparison PR link]
```

---

## Technical Interface / UI Format

### Change Category Report Template
```markdown
## 📦 Ready to Ship

### 🎯 Feature / Fix Changes (Target Task)
| File | Status | Lines | Description |
|------|--------|-------|-------------|
| `src/main.ts` | Modified | +20 -5 | Implemented feature requirements |

### 📁 Pre-existing / Unrelated Changes
| File | Status | Lines | Description |
|------|--------|-------|-------------|
| `config.json` | Modified | +2 -2 | Local database settings changed prior to task |

**Total:** 2 files, +22 -7

### Proposed Branch
`feat/my-awesome-feature`
```
