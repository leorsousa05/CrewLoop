export type AgentSource = 'kimi' | 'claude' | 'codex' | 'opencode' | 'log-watcher' | 'agy' | 'guard';

export type OperationType = 'read' | 'edit' | 'other';

export type EventType =
  | 'session_start'
  | 'session_end'
  | 'tool_start'
  | 'tool_end'
  | 'skill_change'
  | 'security_decision';

export type EventStatus = 'running' | 'success' | 'error';

export type TokenMeasurementQuality = 'measured' | 'estimated' | 'unavailable';

export type TokenCounterSemantics = 'delta' | 'cumulative';

export interface TokenUsageCounts {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  reasoningTokens: number;
  totalTokens: number;
}

export interface TokenUsageMeasurement extends TokenUsageCounts {
  measurementId: string;
  capturedAt: number;
  source: AgentSource;
  model?: string;
  quality: Exclude<TokenMeasurementQuality, 'unavailable'>;
  semantics: TokenCounterSemantics;
}

export interface TokenUsageCursor {
  capturedAt: number;
  counts: TokenUsageCounts;
}

export interface SessionTokenUsage extends TokenUsageCounts {
  quality: TokenMeasurementQuality;
  model?: string;
  measurementCount: number;
  rejectedMeasurementCount: number;
  measuredEventCount: number;
  estimatedEventCount: number;
  cursors: Record<string, TokenUsageCursor>;
  measurementIds: string[];
}

export interface ClientTokenUsage extends TokenUsageCounts {
  quality: TokenMeasurementQuality;
  model?: string;
  measurementCount: number;
  rejectedMeasurementCount: number;
}

export interface DashboardEvent {
  id: string;
  timestamp: number;
  source: AgentSource;
  session_id: string;
  event_type: EventType;
  skill?: string;
  default_skill?: string;
  tool?: string;
  operationType?: OperationType;
  detail?: string;
  status?: EventStatus;
  duration_ms?: number;
  token_usage?: TokenUsageMeasurement;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  workspacePath?: string;
}

export interface SecurityDecision {
  timestamp: number;
  tool: string;
  decision: 'allow' | 'block';
  rule?: string;
  reason?: string;
}

export interface Session {
  id: string;
  source: AgentSource;
  active_skill?: string;
  active_confidence?: 'explicit' | 'heuristic' | 'unknown';
  status?: EventStatus;
  lifecycle: 'starting' | 'running' | 'ended';
  events: DashboardEvent[];
  tool_counts: Record<string, number>;
  token_usage: SessionTokenUsage;
  security_decisions: SecurityDecision[];
  started_at: number;
  last_event_at: number;
  ended_at?: number;
  workspaceRoot?: string;
}

export interface DashboardState {
  sessions: Record<string, Session>;
}

export interface ClientActiveSkill {
  name: string;
  confidence: 'explicit' | 'heuristic' | 'unknown';
}

export interface ClientEvent {
  id: string;
  timestamp: number;
  event_type: EventType;
  tool?: string;
  operationType?: OperationType;
  detail?: string;
  status?: EventStatus;
  duration_ms?: number;
  tokenUsage?: TokenUsageMeasurement;
  skill?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface ClientSecurityDecision {
  timestamp: number;
  tool: string;
  decision: 'allow' | 'block';
  rule?: string;
  reason?: string;
}

export interface ClientSession {
  id: string;
  source: AgentSource;
  skill?: string;
  activeSkill?: ClientActiveSkill;
  status?: EventStatus;
  lifecycle: 'starting' | 'running' | 'ended';
  events: ClientEvent[];
  startTime: number;
  lastActivity: number;
  endedAt?: number;
  toolCounts: Record<string, number>;
  tokenUsage?: ClientTokenUsage;
  securityDecisions: ClientSecurityDecision[];
  workspaceRoot?: string;
}

export interface ClientSnapshotMessage {
  type: 'snapshot';
  sessions: ClientSession[];
}

export interface ClientUpdateMessage {
  type: 'update';
  session: ClientSession;
  isActive: boolean;
}

export interface ClientPongMessage {
  type: 'pong';
}

export type ClientWebSocketMessage =
  | ClientSnapshotMessage
  | ClientUpdateMessage
  | ClientPongMessage;

export interface SkillMeta {
  name: string;
  description: string;
  icon: string;
}

export interface SkillInferenceResult {
  skill: string | undefined;
  confidence: 'explicit' | 'heuristic' | 'unknown';
}

export interface ServerConfig {
  port: number;
  host: string;
  packageRoot: string;
  kimiDataDir?: string;
  maxEventsPerSession: number;
  sessionMaxAgeMs: number;
  sessionIdleTimeoutMs: number;
  pruneIntervalMs: number;
  eventBodyBytes: number;
  fileBytes: number;
  workspaceEntries: number;
  workspaceDepth: number;
}

