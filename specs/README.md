# Specs — How Each Folder Works

Canonical rules live in `references/conventions.md` (§Spec Folder Structure) and `skills/architect/SKILL.md` (§SDD). This file is the quick map — when in doubt, the canonical sources win.

| Folder | Purpose | Who writes | Who reads (and when) |
|--------|---------|-----------|----------------------|
| `changes/` | Active work — one `NNN-name/` folder per change | Architect (before any code) | Engineer (implements), Reviewer (compliance check) |
| `living/` | Merged current state of the system, one `<domain>/` folder per bounded context | Shipper (merges deltas when archiving) | **CrewLoop Hub and Architect read it during discovery**, before designing anything that touches an existing domain |
| `archive/` | Completed changes, renamed to `YYYY-MM-DD-NNN-name/` | Shipper (on ship, after reviewer PASS) | Anyone auditing history; Hub/Architect when a task relates to past work |
| `decisions/` | ADRs — irreversible or cross-cutting architectural choices | Architect (from `templates/adr-template.md`, next `NNN` in the folder) | Hub/Architect during discovery; everyone before proposing a conflicting design |
| `templates/` | Working copies of the spec templates | Synced from `skills/architect/references/templates/` (canonical) | Architect when scaffolding a new spec |

## When to create what

- **Every change** (even a 1-line fix) → a folder in `changes/`. Bug fix / tweak → lightweight (`.spec.yaml` + `tasks.md`). Feature → full spec.
- **Multi-component or architectural change** → full spec **plus** an ADR in `decisions/`.
- **Change shipped (reviewer PASS)** → Shipper archives the folder and merges its deltas into `living/`.
- **Never** place spec files directly in `specs/` — always inside `changes/NNN-name/`.
