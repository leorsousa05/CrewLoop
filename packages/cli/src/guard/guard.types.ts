export type GuardMode = 'block' | 'audit';
export type GuardAction = 'allow' | 'block' | 'confirm';

export interface GuardRule {
  name: string;
  action: GuardAction;
  tools?: string[];
  commandMatches?: string;
  paths?: string[];
  confirmationTimeout?: number;
}

export interface GuardPolicy {
  version: number;
  mode: GuardMode;
  defaultAction: GuardAction;
  confirmationTimeout?: number;
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
  decision: GuardAction | 'pending';
  rule?: string;
  reason?: string;
  workspacePath: string;
  timestamp: number;
  confirmationId?: string;
}

export type AgentGuardCapability = 'block' | 'audit' | false;
