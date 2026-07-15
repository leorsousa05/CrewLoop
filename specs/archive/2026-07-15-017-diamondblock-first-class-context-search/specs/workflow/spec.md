# Workflow Delta: DiamondBlock First-Class Discovery

## Changed

### Discovery Flow
- When the DiamondBlock MCP server is configured and installed, the Hub should use it early
  in discovery for session context and semantic codebase search.
- DiamondBlock may be used repeatedly during the same task whenever additional memory or
  codebase search is needed.
- If the codebase should be searched semantically, DiamondBlock should be preferred before
  manual file-by-file inspection.

### Skill Role
- The `diamondblock` skill is not just for session memory distillation; it is also a
  discovery helper for codebase indexing/search.
- The skill remains conditional on the server being available.

### Unchanged
- The rest of the skill routing flow remains the same.
- Manual file inspection is still available when DiamondBlock cannot answer a question.
