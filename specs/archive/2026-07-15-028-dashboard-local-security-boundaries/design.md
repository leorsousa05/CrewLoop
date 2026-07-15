# Design: Dashboard Local Security Boundaries

## Overview

Keep the dashboard modular monolith and introduce two policy modules at the transport/filesystem boundary. Route handlers remain orchestration code: validate the local request, resolve an existing session workspace, canonicalize the requested path, enforce resource limits, then perform the operation.

## Proposed Directory & File Structure

```text
servers/dashboard/src/
├── config.ts                         (Modified: bounded resource settings)
├── types.ts                          (Modified: ServerConfig and API error types)
├── server.ts                         (Modified: policy-driven HTTP/WS handlers)
├── api/
│   ├── event.ts                      (Modified: bounded body ingestion)
│   └── event.test.ts                 (Modified: size and validation cases)
└── lib/
    ├── local-request-policy.ts       (New: Host and Origin decisions)
    ├── local-request-policy.test.ts  (New)
    ├── workspace-access.ts           (New: root and canonical path policy)
    └── workspace-access.test.ts      (New)
servers/dashboard/src/server.test.ts  (Modified: HTTP/WS/filesystem integration)
specs/decisions/005-dashboard-local-trust-boundary.md (New)
```

## Code Architecture & Design Patterns

- **Architecture Model:** Ports & Adapters inside the existing modular monolith. HTTP, WebSocket, filesystem, and Git are adapters around explicit policy contracts.
- **Policy Object:** local-request and workspace-access decisions are centralized and independently testable.
- **CQS:** path authorization returns a canonical path; file reading and diff execution occur only after authorization succeeds.
- **Backpressure:** every externally influenced body, scan, and read has a configured upper bound.

## Data Model

```typescript
type DashboardApiErrorCode =
  | 'INVALID_LOCAL_HOST'
  | 'INVALID_WEBSOCKET_ORIGIN'
  | 'SESSION_NOT_FOUND'
  | 'WORKSPACE_UNAVAILABLE'
  | 'PATH_FORBIDDEN'
  | 'PAYLOAD_TOO_LARGE'
  | 'FILE_TOO_LARGE'
  | 'BINARY_FILE_UNSUPPORTED';

interface DashboardApiError {
  error: string;
  code: DashboardApiErrorCode;
}

interface ResourceLimits {
  eventBodyBytes: number;
  fileBytes: number;
  workspaceEntries: number;
  workspaceDepth: number;
}
```

## API Contracts

```typescript
interface LocalRequestPolicy {
  acceptsHost(host: string | undefined): boolean;
  acceptsWebSocketOrigin(origin: string | undefined): boolean;
}

interface WorkspaceAccessPolicy {
  resolveSessionRoot(sessionId: string): Promise<string>;
  resolveContainedPath(root: string, relativePath: string): Promise<string>;
  listRelativeFiles(root: string, limits: ResourceLimits): Promise<string[]>;
}

function readJsonBody(req: IncomingMessage, maxBytes: number): Promise<unknown>;
function readTextFile(absPath: string, maxBytes: number): Promise<string>;
```

## Flow Diagrams

### File Read

1. Validate local Host and parse `sessionId` plus relative path.
2. Resolve the session's canonical workspace root; do not use CWD fallback.
3. Resolve the requested canonical path and verify `path.relative` remains contained.
4. Reject directory, binary, symlink escape, or oversized file.
5. Return content with no path-bearing debug output.

### WebSocket Upgrade

1. Read Host and Origin from the upgrade request.
2. Accept the exact configured local origin and supported loopback aliases only.
3. Reject missing browser Origin or any foreign origin before connection registration.
4. Send the initial snapshot only after acceptance.

## State Management

No new persistent state is introduced. Policies consume `ServerConfig` and read session roots through a narrow callback, keeping `StateStore` ownership unchanged.

## Error Handling

Expected policy failures map to 400, 403, 404, or 413 with stable safe codes. Filesystem and Git failures return generic messages and never include absolute paths, command arguments, or raw stderr in client responses.

## Performance Considerations

Replace unbounded synchronous recursion and whole-file reads with bounded asynchronous operations. Stop traversal immediately when count/depth limits are reached and abort request-body accumulation at the byte limit.

## Security Considerations

Canonical containment must account for path separators, nonexistent diff targets, and symlink targets. Sanitization remains defense in depth; secret-bearing fields stay redacted even though the dashboard preserves other local tool content.
