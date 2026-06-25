// OpenCode plugin example for CrewLoop dashboard.
// Loads agent context and posts tool events to the local dashboard server.

const http = require('node:http');
const { env } = require('node:process');

const DEFAULT_URL = 'http://127.0.0.1:7890';

function postEvent(event) {
  const serverUrl = env.CREWLOOP_DASHBOARD_URL || DEFAULT_URL;
  const body = JSON.stringify(event);
  const url = new URL('/event', serverUrl);

  const req = http.request(
    {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 300,
    },
    () => {}
  );

  req.on('error', () => {});
  req.on('timeout', () => req.destroy());
  req.write(body);
  req.end();
}

module.exports = function crewloopDashboardPlugin(context) {
  const sessionId = context.sessionId || `opencode-${Date.now()}`;

  return {
    name: 'crewloop-dashboard',
    beforeToolUse(tool) {
      postEvent({
        id: `${sessionId}-${Date.now()}`,
        timestamp: Date.now(),
        source: 'opencode',
        session_id: sessionId,
        event_type: 'tool_start',
        tool: tool.name,
        detail: tool.args?.path || tool.args?.skill,
      });
    },
    afterToolUse(tool, result) {
      postEvent({
        id: `${sessionId}-${Date.now()}`,
        timestamp: Date.now(),
        source: 'opencode',
        session_id: sessionId,
        event_type: 'tool_end',
        tool: tool.name,
        status: result?.error ? 'error' : 'success',
        duration_ms: result?.duration_ms,
      });
    },
  };
};
