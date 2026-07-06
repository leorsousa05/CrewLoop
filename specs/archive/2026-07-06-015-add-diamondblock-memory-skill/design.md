# Design: Diamondblock Memory Skill

## 1. Skill Meta Definition
- **Name**: `diamondblock`
- **Description**: Supporting memory management skill that interacts with the `diamondblock` MCP server to get session contexts, search knowledge, and save distilled session logs.
- **Mode**: `MANAGE` only.
- **Workflow Role**: Support `crewloop-hub` and `long-term-manager` by performing session initialization/distillation, and support execution/review skills by retrieving and cataloging knowledge.

## 2. Diamondblock MCP Tool Integration Mapping

| Activity / Phase | Target Tool | Trigger / Action |
| :--- | :--- | :--- |
| **Session Startup** | `get_context` | The Hub loads `diamondblock` to fetch the project context and session history using `session_id` and `project_id`. |
| **Search / Diagnostic** | `search_memory` | Loaded on-demand when looking up coding rules, past bugs, or conventions. |
| **Verification & Handoff** | `save_memory` | Save distilled lessons learned and conventions to the database. |
| **Refinement** | `update_memory` | Refine or append to existing notes/rules. |
| **Cleanup** | `delete_memory` | Delete obsolete memories. |
| **Session Wrap-up** | `log_session` | Shipper or Hub logs the message transcript of the session for distillation. |

## 3. Workflow lifecycle hooks
- **Start**:
  ```
  User Prompt ➔ CrewLoop Hub (loads diamondblock: get_context) ➔ Context populated ➔ Hub routes to Architect
  ```
- **End**:
  ```
  Shipper (Ships PR) ➔ CrewLoop Hub (loads diamondblock: log_session + save_memory) ➔ Distillation complete ➔ Session ended
  ```
