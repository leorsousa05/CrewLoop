#!/usr/bin/env node

import wsPackage from 'ws';
import { runInteractionSmoke } from './dashboard-interaction-smoke.mjs';

const WebSocket = wsPackage.WebSocket || wsPackage;

const DEFAULT_DASHBOARD_URL = 'http://127.0.0.1:7890/';
const DEFAULT_CDP_URL = 'http://127.0.0.1:9229';
const DEFAULT_TIMEOUT_MS = 10000;
const SETTINGS_KEY = 'crewloop-dashboard-settings';
const SETTINGS_VERSION = 1;

const VIEWS = ['overview', 'sessions', 'timeline', 'files', 'skills', 'usage', 'settings'];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000, mobile: false },
  { name: 'mobile', width: 390, height: 844, mobile: true },
];
const THEMES = [
  { name: 'light', setting: 'light', media: 'light' },
  { name: 'dark', setting: 'dark', media: 'dark' },
  { name: 'system-light', setting: 'system', media: 'light' },
  { name: 'system-dark', setting: 'system', media: 'dark' },
];
const DENSITIES = ['comfortable', 'compact'];
const INTERACTIVE_SELECTORS = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  'summary',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="option"]',
  '[role="tab"]',
];
const INTERACTIVE_AX_ROLES = new Set([
  'button',
  'checkbox',
  'combobox',
  'link',
  'listbox',
  'menuitem',
  'option',
  'radio',
  'scrollbar',
  'searchbox',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'textbox',
]);

function usage() {
  return [
    'Usage: npm run acceptance:browser -- [options]',
    '',
    'Options:',
    `  --url <url>       Dashboard URL (default: ${DEFAULT_DASHBOARD_URL})`,
    `  --cdp <url>       Chrome CDP endpoint (default: ${DEFAULT_CDP_URL})`,
    `  --timeout <ms>    Per-operation timeout (default: ${DEFAULT_TIMEOUT_MS})`,
    '  --summary         Emit only the final JSON summary',
    '  --interaction-smoke  Run bounded keyboard and state-transition checks',
    '  --help            Show this help',
  ].join('\n');
}

function parseArgs(argv) {
  const options = {
    url: DEFAULT_DASHBOARD_URL,
    cdp: DEFAULT_CDP_URL,
    timeout: DEFAULT_TIMEOUT_MS,
    summaryOnly: false,
    interactionSmoke: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') return { ...options, help: true };
    if (argument === '--summary') {
      options.summaryOnly = true;
      continue;
    }
    if (argument === '--interaction-smoke') {
      options.interactionSmoke = true;
      continue;
    }
    if (!['--url', '--cdp', '--timeout'].includes(argument)) {
      throw new Error(`Unknown option: ${argument}\n\n${usage()}`);
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${argument}`);
    index += 1;

    if (argument === '--url') options.url = value;
    if (argument === '--cdp') options.cdp = value;
    if (argument === '--timeout') {
      options.timeout = Number(value);
      if (!Number.isInteger(options.timeout) || options.timeout < 100) {
        throw new Error('--timeout must be an integer of at least 100 milliseconds');
      }
    }
  }

  return options;
}

function combinations() {
  return VIEWS.flatMap((view) =>
    VIEWPORTS.flatMap((viewport) =>
      THEMES.flatMap((theme) =>
        DENSITIES.map((density) => ({ view, viewport, theme, density }))
      )
    )
  );
}

function dashboardUrl(baseUrl, view) {
  const url = new URL(baseUrl);
  url.hash = `/${view}`;
  return url.toString();
}

function emit(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

class CdpClient {
  constructor(socket, timeout) {
    this.socket = socket;
    this.timeout = timeout;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    socket.on('message', (payload) => this.handleMessage(JSON.parse(payload.toString())));
    socket.on('close', () => {
      for (const pending of this.pending.values()) {
        pending.reject(new Error('Chrome CDP connection closed'));
      }
      this.pending.clear();
    });
  }

  static async connect(endpoint, timeout) {
    const response = await fetch(`${endpoint.replace(/\/$/, '')}/json/version`);
    if (!response.ok) throw new Error(`Chrome CDP version endpoint returned HTTP ${response.status}`);
    const version = await response.json();
    if (typeof version.webSocketDebuggerUrl !== 'string') {
      throw new Error('Chrome CDP version endpoint did not provide webSocketDebuggerUrl');
    }

    const socket = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timed out connecting to Chrome CDP')), timeout);
      socket.once('open', () => {
        clearTimeout(timer);
        resolve();
      });
      socket.once('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
    return new CdpClient(socket, timeout);
  }

  handleMessage(message) {
    if (message.id !== undefined) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timer);
      if (message.error) pending.reject(new Error(message.error.message || 'Chrome CDP command failed'));
      else pending.resolve(message.result || {});
      return;
    }

    const key = `${message.sessionId || 'browser'}:${message.method}`;
    const listeners = this.listeners.get(key) || [];
    this.listeners.delete(key);
    for (const listener of listeners) listener(message.params || {});
  }

  call(method, params = {}, sessionId) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timed out waiting for ${method}`));
      }, this.timeout);
      this.pending.set(id, { resolve, reject, timer });
      const message = { id, method, params };
      if (sessionId) message.sessionId = sessionId;
      this.socket.send(JSON.stringify(message));
    });
  }

  waitForEvent(method, sessionId) {
    const key = `${sessionId || 'browser'}:${method}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const listeners = this.listeners.get(key) || [];
        this.listeners.set(key, listeners.filter((listener) => listener !== onEvent));
        reject(new Error(`Timed out waiting for ${method}`));
      }, this.timeout);
      const onEvent = (params) => {
        clearTimeout(timer);
        resolve(params);
      };
      const listeners = this.listeners.get(key) || [];
      this.listeners.set(key, [...listeners, onEvent]);
    });
  }

  async evaluate(expression, sessionId) {
    const response = await this.call(
      'Runtime.evaluate',
      { expression, awaitPromise: true, returnByValue: true },
      sessionId
    );
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.exception?.description || 'Runtime evaluation failed');
    }
    return response.result?.value;
  }

  close() {
    this.socket.close();
  }
}

async function createTarget(client, url) {
  const { targetId } = await client.call('Target.createTarget', { url });
  const { sessionId } = await client.call('Target.attachToTarget', { targetId, flatten: true });
  return { targetId, sessionId };
}

async function navigate(client, sessionId, url, timeout) {
  const result = await client.call('Page.navigate', { url }, sessionId);
  if (result.errorText) throw new Error(`Navigation failed: ${result.errorText}`);
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const readyState = await client.evaluate('document.readyState', sessionId);
      if (readyState === 'interactive' || readyState === 'complete') {
        await sleep(Math.min(100, Math.max(25, timeout / 100)));
        return;
      }
    } catch {
      // The execution context can disappear while the navigation commits.
    }
    await sleep(50);
  }
  throw new Error('Timed out waiting for document.readyState');
}

function settingsScript(theme, density) {
  return `localStorage.setItem(${JSON.stringify(SETTINGS_KEY)}, ${JSON.stringify(JSON.stringify({
    version: SETTINGS_VERSION,
    settings: {
      theme,
      density,
      reducedMotion: false,
      autoFollowActive: false,
      maxEvents: 50,
    },
  }))});`;
}

async function collectInvariants(client, sessionId, expectedView) {
  const dom = await client.evaluate(`(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    };
    const labelledBy = (element) => (element.getAttribute('aria-labelledby') || '')
      .split(/\\s+/)
      .map((id) => document.getElementById(id)?.textContent || '')
      .join(' ');
    const name = (element) => (
      element.getAttribute('aria-label') ||
      labelledBy(element) ||
      element.labels?.[0]?.textContent ||
      element.getAttribute('title') ||
      element.innerText ||
      element.textContent ||
      ''
    ).replace(/\\s+/g, ' ').trim();
    const controls = [...document.querySelectorAll(${JSON.stringify(INTERACTIVE_SELECTORS.join(','))})]
      .filter(visible)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        role: element.getAttribute('role') || null,
        name: name(element),
      }));
    const main = document.querySelector('main');
    const mainText = main?.textContent?.replace(/\\s+/g, ' ').trim() || '';
    return {
      hasRoot: Boolean(document.querySelector('#root')),
      hasMain: Boolean(main && visible(main)),
      hasRenderedContent: mainText.length > 0,
      hash: window.location.hash,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body?.scrollWidth || 0,
      controls,
      unnamedControls: controls.filter((control) => !control.name),
    };
  })()`, sessionId);

  const accessibility = await client.call('Accessibility.getFullAXTree', { depth: -1 }, sessionId);
  const unnamedAxNodes = (accessibility.nodes || [])
    .filter((node) => !node.ignored && INTERACTIVE_AX_ROLES.has(node.role?.value))
    .filter((node) => !String(node.name?.value || '').trim())
    .map((node) => ({ role: node.role?.value || 'unknown', nodeId: node.nodeId }));

  return {
    ...dom,
    unnamedAxNodes,
    ok:
      dom.hasRoot &&
      dom.hasMain &&
      dom.hasRenderedContent &&
      dom.hash === `#/${expectedView}` &&
      dom.documentWidth <= dom.viewportWidth + 1 &&
      dom.bodyWidth <= dom.viewportWidth + 1 &&
      dom.unnamedControls.length === 0 &&
      unnamedAxNodes.length === 0,
  };
}

async function run(options) {
  const expected = combinations();
  if (expected.length !== 112) throw new Error(`Acceptance matrix definition produced ${expected.length} combinations, expected 112`);

  let client;
  let targetId;
  let sessionId;
  try {
    client = await CdpClient.connect(options.cdp, options.timeout);
    const first = expected[0];
    ({ targetId, sessionId } = await createTarget(client, dashboardUrl(options.url, first.view)));
    await client.call('Page.enable', {}, sessionId);
    await client.call('Runtime.enable', {}, sessionId);
    await client.call('Accessibility.enable', {}, sessionId);

    const results = [];
    for (const [index, combination] of expected.entries()) {
      const startedAt = Date.now();
      let checks;
      let failure;
      try {
        await client.call(
          'Emulation.setDeviceMetricsOverride',
          {
            width: combination.viewport.width,
            height: combination.viewport.height,
            deviceScaleFactor: 1,
            mobile: combination.viewport.mobile,
          },
          sessionId
        );
        await client.call(
          'Emulation.setEmulatedMedia',
          { features: [{ name: 'prefers-color-scheme', value: combination.theme.media }] },
          sessionId
        );
        await client.evaluate(settingsScript(combination.theme.setting, combination.density), sessionId);
        await navigate(client, sessionId, dashboardUrl(options.url, combination.view), options.timeout);
        checks = await collectInvariants(client, sessionId, combination.view);
        if (!checks.ok) failure = 'one or more browser invariants failed';
      } catch (error) {
        failure = errorMessage(error);
      }

      const result = {
        type: 'result',
        index: index + 1,
        total: expected.length,
        view: combination.view,
        viewport: combination.viewport.name,
        theme: combination.theme.name,
        density: combination.density,
        ok: !failure,
        durationMs: Date.now() - startedAt,
      };
      if (checks) {
        result.checks = {
          hasRoot: checks.hasRoot,
          hasMain: checks.hasMain,
          hasRenderedContent: checks.hasRenderedContent,
          hash: checks.hash,
          viewport: `${checks.viewportWidth}x${checks.viewportHeight}`,
          documentWidth: checks.documentWidth,
          bodyWidth: checks.bodyWidth,
          controlCount: checks.controls.length,
          unnamedControls: checks.unnamedControls,
          unnamedAxNodes: checks.unnamedAxNodes,
        };
      }
      if (failure) result.error = failure;
      if (!options.summaryOnly) emit(result);
      results.push(result);
    }

    const passed = results.filter((result) => result.ok).length;
    const failed = results.length - passed;
    let interactionSummary;
    if (options.interactionSmoke) {
      try {
        interactionSummary = await runInteractionSmoke(client, sessionId, options.url, options.timeout);
      } catch (error) {
        interactionSummary = {
          type: 'interaction-summary',
          total: 0,
          passed: 0,
          failed: 1,
          success: false,
          error: errorMessage(error),
          cases: [],
        };
      }
      if (!options.summaryOnly) emit(interactionSummary);
    }
    const summary = {
      type: 'summary',
      total: results.length,
      expected: expected.length,
      passed,
      failed,
      success: failed === 0,
    };
    if (interactionSummary) {
      summary.interactionSmoke = true;
      summary.interactionSuccess = interactionSummary.success;
      summary.success = summary.success && interactionSummary.success;
      if (options.summaryOnly) summary.interaction = interactionSummary;
    }
    emit(summary);
    return failed === 0 && (interactionSummary?.success ?? true) ? 0 : 1;
  } finally {
    if (client && targetId) {
      try {
        await client.call('Target.closeTarget', { targetId });
      } catch {
        // The browser may have closed the isolated target after a failed run.
      }
    }
    client?.close();
  }
}

let options;
try {
  options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    process.exit(0);
  }
  process.exitCode = await run(options);
} catch (error) {
  emit({ type: 'error', error: errorMessage(error) });
  process.stderr.write(`${errorMessage(error)}\n\n${usage()}\n`);
  process.exitCode = 1;
}
