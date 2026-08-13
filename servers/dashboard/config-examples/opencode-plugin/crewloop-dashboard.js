const { spawn } = require('node:child_process');

function sendEvent(payload) {
  try {
    const child = spawn('crewloop-shim', ['opencode'], {
      stdio: ['pipe', 'ignore', 'ignore'],
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  } catch {
    // Dashboard telemetry must never block OpenCode.
  }
}

export const CrewLoopPlugin = async ({ directory }) => ({
  'tool.execute.before': async (input) => {
    sendEvent({
      tool: input.tool,
      event_type: 'tool_start',
      cwd: input.cwd || directory,
      session_id: input.sessionID,
    });
  },
  'tool.execute.after': async (input, output) => {
    sendEvent({
      tool: input.tool,
      event_type: 'tool_end',
      cwd: input.cwd || directory,
      session_id: input.sessionID,
      success: output?.success !== false,
      duration_ms: output?.duration,
    });
  },
  event: async ({ event }) => {
    if (event?.type !== 'message.updated') return;
    const info = event.properties?.info;
    const tokens = info?.tokens;
    if (
      info?.role !== 'assistant'
      || typeof info.id !== 'string'
      || typeof info.sessionID !== 'string'
      || !Number.isSafeInteger(info.time?.completed)
      || !tokens
    ) return;
    sendEvent({
      event_type: 'model_usage',
      cwd: directory,
      session_id: info.sessionID,
      message_id: info.id,
      captured_at: info.time.completed,
      final: true,
      model: info.modelID,
      cost_usd: info.cost,
      usage: {
        input: tokens.input,
        output: tokens.output,
        reasoning: tokens.reasoning,
        cache_read: tokens.cache?.read,
        cache_write: tokens.cache?.write,
      },
    });
  },
});
