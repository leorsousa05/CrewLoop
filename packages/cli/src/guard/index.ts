import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import type { GuardDecision, GuardPostEvent, AgentGuardCapability, GuardAction } from './guard.types';
import { loadPolicy, saveRememberedConfirmation } from './policy';
import { normalizePayload } from './normalize';
import { evaluatePolicy } from './evaluator';
import { postDecision } from './post';
import { requestConfirmation } from './confirm';

export { loadPolicy, saveRememberedConfirmation, normalizePayload, evaluatePolicy, postDecision };
export type { GuardPolicy, GuardRule, GuardDecision, NormalizedGuardEvent } from './guard.types';

function parseArgv(argv: string[]): { agent: string; defaultSkill?: string; eventType?: string; guardCapable: AgentGuardCapability } {
  const agent = argv[2];
  const defaultSkillIdx = argv.indexOf('--default-skill');
  const defaultSkill = defaultSkillIdx !== -1 ? argv[defaultSkillIdx + 1] : undefined;
  const eventTypeIdx = argv.indexOf('--event-type');
  const eventType = eventTypeIdx !== -1 ? argv[eventTypeIdx + 1] : undefined;

  let guardCapable: AgentGuardCapability = false;
  const capableIdx = argv.indexOf('--guard-capable');
  if (capableIdx !== -1) {
    const value = argv[capableIdx + 1];
    if (value === 'block' || value === 'audit') {
      guardCapable = value;
    }
  }

  return { agent, defaultSkill, eventType, guardCapable };
}

function buildPostEvent(
  event: { session_id: string; tool: string; cwd: string },
  decision: GuardDecision,
  actionOverride?: GuardAction | 'pending',
  confirmationId?: string
): GuardPostEvent {
  return {
    event_type: 'security_decision',
    source: 'guard',
    session_id: event.session_id,
    tool: event.tool,
    decision: actionOverride ?? decision.action,
    rule: decision.rule,
    reason: decision.reason,
    workspacePath: event.cwd,
    timestamp: Date.now(),
    confirmationId,
  };
}

function delegateToShim(agent: string, defaultSkill: string | undefined, eventType: string | undefined, rawPayload: string): void {
  const args = [agent];
  if (defaultSkill) {
    args.push('--default-skill', defaultSkill);
  }
  if (eventType) {
    args.push('--event-type', eventType);
  }
  const shim = spawn('crewloop-shim', args, {
    stdio: ['pipe', 'ignore', 'ignore'],
  });
  shim.unref();
  shim.stdin.write(rawPayload);
  shim.stdin.end();
  // Do not wait for the shim; telemetry must not block the agent.
}

export async function runGuard(argv: string[]): Promise<number> {
  const { agent, defaultSkill, eventType, guardCapable } = parseArgv(argv);
  if (!agent) {
    process.stderr.write('crewloop-guard: missing agent argument\n');
    return 0; // Fail open.
  }

  const rawPayload = await readStdin();
  if (rawPayload.length === 0) {
    return 0;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawPayload);
  } catch {
    return 0;
  }

  const event = normalizePayload(agent, payload);
  if (!event) {
    return 0;
  }

  const policy = loadPolicy({ cwd: event.cwd });
  const decision = evaluatePolicy(policy, event);

  if (decision.action === 'confirm') {
    if (guardCapable === 'block') {
      const result = await requestConfirmation(event, decision, {
        timeout: policy.confirmationTimeout,
      });
      postDecision(buildPostEvent(event, decision, result.action));
      if (result.action === 'allow' && result.remember && decision.rule) {
        saveRememberedConfirmation(event.cwd, decision.rule);
      }
      if (result.action === 'block') {
        process.stderr.write(`[crewloop-guard] Action blocked by security decision: ${decision.rule || 'policy'}\n`);
        return 1;
      }
      delegateToShim(agent, defaultSkill, eventType, rawPayload);
      return 0;
    }

    // Audit-only and non-guard-capable agents log the pending decision but allow the tool.
    postDecision(buildPostEvent(event, decision, 'pending', randomUUID()));
    delegateToShim(agent, defaultSkill, eventType, rawPayload);
    return 0;
  }

  postDecision(buildPostEvent(event, decision));

  if (decision.action === 'block' && guardCapable === 'block') {
    process.stderr.write(`[crewloop-guard] Action blocked by security policy: ${decision.rule || 'policy'}\n`);
    return 1;
  }

  delegateToShim(agent, defaultSkill, eventType, rawPayload);
  return 0;
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    if (process.stdin.isTTY) {
      resolve('');
    }
  });
}
