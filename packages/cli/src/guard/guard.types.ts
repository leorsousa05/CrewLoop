export type GuardMode = 'block' | 'audit';
export type GuardAction = 'allow' | 'block';

export interface GuardRule {
  name: string;
  action: GuardAction;
  tools?: string[];
  commandMatches?: string;
  paths?: string[];
}

export interface GuardPolicy {
  version: number;
  mode: GuardMode;
  defaultAction: GuardAction;
  rules: GuardRule[];
}

export interface NormalizedGuardEvent {
  agent: string;
  session_id: string;
  tool: string;
  input?: Record<string, unknown>;
  cwd: string;
}

export interface GuardDecision {
  action: GuardAction;
  rule?: string;
  reason?: string;
}

export interface GuardPostEvent {
  event_type: 'security_decision';
  source: 'guard';
  session_id: string;
  tool: string;
  decision: GuardAction;
  rule?: string;
  reason?: string;
  workspacePath: string;
  timestamp: number;
}

export type AgentGuardCapability = 'block' | 'audit' | false;
