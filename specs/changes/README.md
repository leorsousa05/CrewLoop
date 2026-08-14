# changes/ — RFCs (Change Proposals)

This folder holds **RFCs — proposals under discussion**. Nothing in here is implemented.

## Lifecycle

```
draft ──► discussed ──► approved ──► shared/adrs/adr-NNN-name.md (+ feature specs updated)
                  └───── rejected ──► archive/rfc-NNN-name.md (+ reason in archive/README.md)
```

1. `crewloop:plan` writes `changes/rfc-NNN-name.md` from `specs/templates/rfc-template.md` for architecture or cross-cutting changes.
2. The RFC is discussed (user/team). **No implementation while the RFC sits in `changes/`.**
3. **Approved** → the RFC moves to `shared/adrs/adr-NNN-name.md` with the decision recorded; affected feature specs are updated to match.
4. **Rejected** → the RFC moves to `archive/rfc-NNN-name.md` and a one-line reason is appended to `archive/README.md`.
5. `changes/` holds only **open** RFCs — at most a few; closed ones leave the folder.

## Naming

`rfc-NNN-name.md` — increment `NNN` from the highest existing RFC or ADR number.

## Rules

- Implementation work lives in `specs/features/<domain>/spec-NN-name.md`, never here.
- A review gate rejects implementation without an approved feature spec or ADR.
- If an RFC becomes urgent while under discussion, the feature spec is written first and the RFC documents the architecture decision separately.
