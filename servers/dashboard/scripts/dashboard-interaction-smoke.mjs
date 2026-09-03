const SETTINGS_KEY = 'crewloop-dashboard-settings';
const SETTINGS_VERSION = 1;
const SHIFT_MODIFIER = 8;
const CONTRAST_ROUTES = ['overview', 'sessions', 'timeline', 'files', 'skills', 'usage', 'settings'];

function dashboardUrl(baseUrl, view) {
  const url = new URL(baseUrl);
  url.hash = `/${view}`;
  return url.toString();
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

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForHash(client, sessionId, expectedHash, timeout) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const hash = await client.evaluate('window.location.hash', sessionId);
    if (hash === expectedHash) return;
    await sleep(50);
  }
  throw new Error(`history did not restore ${expectedHash}`);
}

async function requireInteraction(client, sessionId, label, expression) {
  const result = await client.evaluate(expression, sessionId);
  if (!result?.ok) throw new Error(`${label}: ${result?.reason || 'invariant failed'}`);
  return result;
}

async function pressKey(client, sessionId, key, modifiers = 0) {
  await client.call('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, modifiers }, sessionId);
  await client.call('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, modifiers }, sessionId);
}

async function prepareInteractionPage(client, sessionId, url, timeout, options = {}) {
  const {
    width = 390,
    height = 844,
    mobile = true,
    theme = 'light',
    media = 'light',
    density = 'comfortable',
  } = options;
  await client.call(
    'Emulation.setDeviceMetricsOverride',
    { width, height, deviceScaleFactor: 1, mobile },
    sessionId
  );
  await client.call(
    'Emulation.setEmulatedMedia',
    { features: [{ name: 'prefers-color-scheme', value: media }] },
    sessionId
  );
  await client.evaluate(settingsScript(theme, density), sessionId);
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

function renderedContrastExpression() {
  return `(() => {
    const minimumRatio = 4.5;
    const semanticClasses = new Map([
      ['text-text-primary', 'text-primary'],
      ['text-text-secondary', 'text-secondary'],
      ['text-text-muted', 'text-muted'],
      ['text-accent', 'accent'],
      ['text-success', 'success'],
      ['text-error', 'error'],
      ['text-warning', 'warning'],
      ['text-running', 'running'],
    ]);
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      for (let current = element; current; current = current.parentElement) {
        const style = getComputedStyle(current);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      }
      return true;
    };
    const hasDirectText = (element) => [...element.childNodes]
      .some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    const parseColor = (value) => {
      const channels = value.match(/[\\d.]+/g)?.map(Number) || [];
      if (channels.length < 3 || channels.length > 4) return null;
      return {
        red: channels[0],
        green: channels[1],
        blue: channels[2],
        alpha: channels.length === 4 ? channels[3] : 1,
      };
    };
    const composite = (foreground, background) => {
      const alpha = foreground.alpha + background.alpha * (1 - foreground.alpha);
      if (alpha === 0) return { red: 0, green: 0, blue: 0, alpha: 0 };
      return {
        red: (foreground.red * foreground.alpha + background.red * background.alpha * (1 - foreground.alpha)) / alpha,
        green: (foreground.green * foreground.alpha + background.green * background.alpha * (1 - foreground.alpha)) / alpha,
        blue: (foreground.blue * foreground.alpha + background.blue * background.alpha * (1 - foreground.alpha)) / alpha,
        alpha,
      };
    };
    const backgroundFor = (element) => {
      const ancestors = [];
      for (let current = element; current; current = current.parentElement) ancestors.push(current);
      let background = { red: 0, green: 0, blue: 0, alpha: 0 };
      for (let index = ancestors.length - 1; index >= 0; index -= 1) {
        const style = getComputedStyle(ancestors[index]);
        if (style.backgroundImage !== 'none') return null;
        const color = parseColor(style.backgroundColor);
        if (color) background = composite(color, background);
      }
      return background.alpha > 0.99 ? background : null;
    };
    const channel = (value) => {
      const normalized = value / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };
    const luminance = (color) => (
      0.2126 * channel(color.red)
      + 0.7152 * channel(color.green)
      + 0.0722 * channel(color.blue)
    );
    const contrast = (foreground, background) => {
      const foregroundLuminance = luminance(foreground);
      const backgroundLuminance = luminance(background);
      return (
        (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
        / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
      );
    };
    const tokenFor = (element) => {
      const className = typeof element.className === 'string' ? element.className : '';
      for (const [classToken, semanticToken] of semanticClasses) {
        if (className.split(/\\s+/).includes(classToken)) return semanticToken;
      }
      return 'computed';
    };
    const candidates = [...document.querySelectorAll('body *')]
      .filter((element) => visible(element) && hasDirectText(element))
      .filter((element) => !element.matches(':disabled, [aria-disabled="true"]'));
    const failures = [];
    let unsupported = 0;
    for (const element of candidates) {
      const style = getComputedStyle(element);
      const foreground = parseColor(style.color);
      const background = backgroundFor(element);
      if (!foreground || !background || style.backgroundImage !== 'none') {
        unsupported += 1;
        continue;
      }
      const ratio = contrast(foreground, background);
      if (ratio < minimumRatio) {
        failures.push({
          token: tokenFor(element),
          ratio: Number(ratio.toFixed(3)),
          tag: element.tagName.toLowerCase(),
        });
      }
    }
    return {
      ok: candidates.length > 0 && failures.length === 0 && unsupported === 0,
      candidateCount: candidates.length,
      failureCount: failures.length,
      unsupportedCount: unsupported,
      failures: failures.slice(0, 8),
    };
  })()`;
}

export async function runInteractionSmoke(client, sessionId, baseUrl, timeout) {
  const cases = [];
  const prepare = (url) => prepareInteractionPage(client, sessionId, url, timeout);
  const runCase = async (name, action) => {
    try {
      const details = await action();
      cases.push({ name, ok: true, details });
    } catch (error) {
      cases.push({ name, ok: false, error: errorMessage(error) });
    }
  };

  await runCase('mobile drawer focus restoration', async () => {
    await prepare(dashboardUrl(baseUrl, 'overview'));
    await requireInteraction(client, sessionId, 'drawer trigger', `(() => {
      const trigger = document.querySelector('[aria-label="Toggle sidebar"]');
      if (!trigger) return { ok: false, reason: 'toggle sidebar not found' };
      trigger.focus();
      trigger.click();
      return { ok: true };
    })()`);
    await sleep(75);
    await requireInteraction(client, sessionId, 'drawer open focus', `(() => {
      const dialog = document.querySelector('[role="dialog"][aria-label="Main navigation"]');
      return { ok: Boolean(dialog && dialog.contains(document.activeElement)) };
    })()`);
    await pressKey(client, sessionId, 'Tab');
    await requireInteraction(client, sessionId, 'drawer forward focus trap', `(() => {
      const dialog = document.querySelector('[role="dialog"][aria-label="Main navigation"]');
      return { ok: Boolean(dialog && dialog.contains(document.activeElement)) };
    })()`);
    await pressKey(client, sessionId, 'Tab', SHIFT_MODIFIER);
    await requireInteraction(client, sessionId, 'drawer reverse focus trap', `(() => {
      const dialog = document.querySelector('[role="dialog"][aria-label="Main navigation"]');
      return { ok: Boolean(dialog && dialog.contains(document.activeElement)) };
    })()`);
    await pressKey(client, sessionId, 'Escape');
    await sleep(75);
    const result = await requireInteraction(client, sessionId, 'drawer close focus', `(() => {
      const trigger = document.querySelector('[aria-label="Toggle sidebar"]');
      const dialog = document.querySelector('[role="dialog"][aria-label="Main navigation"]');
      return { ok: Boolean(trigger && !dialog && document.activeElement === trigger) };
    })()`);
    return { focusContained: true, restored: result.ok };
  });

  await runCase('command palette focus restoration', async () => {
    await prepare(dashboardUrl(baseUrl, 'overview'));
    await requireInteraction(client, sessionId, 'command palette trigger', `(() => {
      const trigger = document.querySelector('[aria-label="Open command palette"]');
      if (!trigger) return { ok: false, reason: 'command palette trigger not found' };
      trigger.focus();
      trigger.click();
      return { ok: true };
    })()`);
    await sleep(75);
    await requireInteraction(client, sessionId, 'command palette open focus', `(() => {
      const dialog = document.querySelector('[role="dialog"][aria-label="Command palette"]');
      const input = document.querySelector('[aria-label="Search commands"]');
      return { ok: Boolean(dialog && input && dialog.contains(document.activeElement) && document.activeElement === input) };
    })()`);
    await pressKey(client, sessionId, 'Tab');
    await requireInteraction(client, sessionId, 'command palette forward focus trap', `(() => {
      const dialog = document.querySelector('[role="dialog"][aria-label="Command palette"]');
      return { ok: Boolean(dialog && dialog.contains(document.activeElement)) };
    })()`);
    await pressKey(client, sessionId, 'Tab', SHIFT_MODIFIER);
    await requireInteraction(client, sessionId, 'command palette reverse focus trap', `(() => {
      const dialog = document.querySelector('[role="dialog"][aria-label="Command palette"]');
      return { ok: Boolean(dialog && dialog.contains(document.activeElement)) };
    })()`);
    await pressKey(client, sessionId, 'Escape');
    await sleep(75);
    const result = await requireInteraction(client, sessionId, 'command palette close focus', `(() => {
      const trigger = document.querySelector('[aria-label="Open command palette"]');
      const dialog = document.querySelector('[role="dialog"][aria-label="Command palette"]');
      return { ok: Boolean(trigger && !dialog && document.activeElement === trigger) };
    })()`);
    return { focusContained: true, restored: result.ok };
  });

  await runCase('mobile filter sheet focus restoration', async () => {
    await prepare(dashboardUrl(baseUrl, 'timeline'));
    await requireInteraction(client, sessionId, 'filter sheet trigger', `(() => {
      const trigger = [...document.querySelectorAll('button[aria-haspopup="dialog"]')]
        .find((button) => button.textContent?.includes('Filters'));
      if (!trigger) return { ok: false, reason: 'mobile filters trigger not found' };
      trigger.focus();
      trigger.click();
      return { ok: true };
    })()`);
    await sleep(75);
    await requireInteraction(client, sessionId, 'filter sheet open focus', `(() => {
      const dialog = document.querySelector('#mobile-filter-sheet');
      return { ok: Boolean(dialog && dialog.contains(document.activeElement)) };
    })()`);
    await pressKey(client, sessionId, 'Tab');
    await requireInteraction(client, sessionId, 'filter sheet forward focus trap', `(() => {
      const dialog = document.querySelector('#mobile-filter-sheet');
      return { ok: Boolean(dialog && dialog.contains(document.activeElement)) };
    })()`);
    await pressKey(client, sessionId, 'Tab', SHIFT_MODIFIER);
    await requireInteraction(client, sessionId, 'filter sheet reverse focus trap', `(() => {
      const dialog = document.querySelector('#mobile-filter-sheet');
      return { ok: Boolean(dialog && dialog.contains(document.activeElement)) };
    })()`);
    await pressKey(client, sessionId, 'Escape');
    await sleep(75);
    const result = await requireInteraction(client, sessionId, 'filter sheet close focus', `(() => {
      const trigger = [...document.querySelectorAll('button[aria-haspopup="dialog"]')]
        .find((button) => button.textContent?.includes('Filters'));
      const dialog = document.querySelector('#mobile-filter-sheet');
      return { ok: Boolean(trigger && !dialog && document.activeElement === trigger) };
    })()`);
    return { focusContained: true, restored: result.ok };
  });

  await runCase('empty session selector keyboard state', async () => {
    await prepare(dashboardUrl(baseUrl, 'overview'));
    await requireInteraction(client, sessionId, 'session selector trigger', `(() => {
      const trigger = document.querySelector('[role="combobox"][aria-label="Select session"]');
      if (!trigger) return { ok: false, reason: 'session selector not found' };
      trigger.focus();
      return { ok: true };
    })()`);
    await pressKey(client, sessionId, 'Enter');
    await sleep(75);
    const selector = await requireInteraction(client, sessionId, 'session selector listbox', `(() => {
      const listbox = document.querySelector('[role="listbox"][aria-label="Sessions"]');
      const empty = [...(listbox?.querySelectorAll('li') || [])]
        .some((item) => item.textContent?.includes('No sessions yet.'));
      const optionCount = listbox?.querySelectorAll('[role="option"]').length || 0;
      const trigger = document.querySelector('[role="combobox"][aria-label="Select session"]');
      return {
        ok: Boolean(listbox && (empty || optionCount > 0)),
        empty,
        optionCount,
        reason: 'listbox=' + Boolean(listbox)
          + '; options=' + optionCount
          + '; empty=' + empty
          + '; expanded=' + (trigger?.getAttribute('aria-expanded') || 'missing')
          + '; active=' + (document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName || 'none'),
      };
    })()`);
    await pressKey(client, sessionId, 'Escape');
    await sleep(75);
    await requireInteraction(client, sessionId, 'session selector close', `(() => ({
      ok: !document.querySelector('[role="listbox"][aria-label="Sessions"]')
    }))()`);
    return {
      keyboardOpened: true,
      state: selector.empty ? 'empty' : 'populated',
      optionCount: selector.optionCount,
    };
  });

  await runCase('settings reduced-motion persistence', async () => {
    await prepare(dashboardUrl(baseUrl, 'settings'));
    const result = await requireInteraction(client, sessionId, 'reduced-motion toggle', `(() => {
      const toggle = document.querySelector('[aria-label="Enable reduced motion"], [aria-label="Disable reduced motion"]');
      if (!toggle) return { ok: false, reason: 'reduced-motion toggle not found' };
      const original = toggle.getAttribute('aria-pressed') === 'true';
      toggle.click();
      return { ok: true, original, toggled: !original };
    })()`);
    await sleep(100);
    await requireInteraction(client, sessionId, 'reduced-motion persisted state', `(() => {
      const stored = JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_KEY)}) || '{}');
      const expected = ${JSON.stringify(result.toggled)};
      return {
        ok: document.documentElement.dataset.reducedMotion === String(expected)
          && stored.settings?.reducedMotion === expected,
      };
    })()`);
    await requireInteraction(client, sessionId, 'reduced-motion restore', `(() => {
      const toggle = document.querySelector('[aria-label="Enable reduced motion"], [aria-label="Disable reduced motion"]');
      if (!toggle) return { ok: false, reason: 'reduced-motion restore toggle not found' };
      toggle.click();
      return { ok: true };
    })()`);
    await sleep(100);
    const restored = await requireInteraction(client, sessionId, 'reduced-motion restored state', `(() => {
      const stored = JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_KEY)}) || '{}');
      const expected = ${JSON.stringify(result.original)};
      return { ok: stored.settings?.reducedMotion === expected };
    })()`);
    return { restored: restored.ok };
  });

  await runCase('hash history restoration', async () => {
    await prepare(dashboardUrl(baseUrl, 'overview'));
    await requireInteraction(client, sessionId, 'timeline navigation trigger', `(() => {
      const menu = document.querySelector('[aria-label="Toggle sidebar"]');
      if (!menu) return { ok: false, reason: 'mobile sidebar trigger not found' };
      menu.click();
      return { ok: true };
    })()`);
    await sleep(75);
    await requireInteraction(client, sessionId, 'timeline navigation item', `(() => {
      const item = [...document.querySelectorAll('button')]
        .find((button) => button.querySelector('.text-label')?.textContent?.trim() === 'Timeline');
      if (!item) return { ok: false, reason: 'timeline navigation item not found' };
      item.click();
      return { ok: true };
    })()`);
    await sleep(100);
    await requireInteraction(client, sessionId, 'timeline navigation state', `(() => ({
      ok: window.location.hash === '#/timeline'
        && document.querySelector('h1')?.textContent?.trim() === 'Timeline'
    }))()`);
    await client.evaluate('history.back()', sessionId);
    await waitForHash(client, sessionId, '#/overview', timeout);
    await sleep(100);
    await requireInteraction(client, sessionId, 'overview history state', `(() => ({
      ok: document.querySelector('h1')?.textContent?.trim() === 'No sessions yet'
        || document.querySelector('h1')?.textContent?.trim() === 'Overview'
    }))()`);
    return { restoredHash: '#/overview', restoredView: true };
  });

  await runCase('external font resources', async () => {
    await prepare(dashboardUrl(baseUrl, 'overview'));
    return requireInteraction(client, sessionId, 'font resource policy', `(() => {
      const externalFonts = performance.getEntriesByType('resource')
        .map((entry) => entry.name)
        .filter((name) => /\\.(woff2?|ttf|otf)(\\?|$)/i.test(name))
        .filter((name) => new URL(name, location.href).origin !== location.origin);
      return { ok: externalFonts.length === 0 };
    })()`);
  });

  await runCase('rendered text contrast', async () => {
    let candidateCount = 0;
    let unsupportedCount = 0;
    for (const theme of ['light', 'dark']) {
      for (const view of CONTRAST_ROUTES) {
        await prepareInteractionPage(client, sessionId, dashboardUrl(baseUrl, view), timeout, {
          width: 1440,
          height: 1000,
          mobile: false,
          theme,
          media: theme,
        });
        const result = await client.evaluate(renderedContrastExpression(), sessionId);
        candidateCount += result?.candidateCount || 0;
        unsupportedCount += result?.unsupportedCount || 0;
        if (!result?.ok) {
          const failure = result?.failures?.[0];
          const diagnostic = failure
            ? `${failure.token}/${failure.tag}=${failure.ratio}`
            : `unsupported=${result?.unsupportedCount || 0}`;
          throw new Error(`${theme}/${view}: rendered contrast below AA or unavailable (${diagnostic})`);
        }
      }
    }
    return { routeThemePairs: CONTRAST_ROUTES.length * 2, candidateCount, unsupportedCount };
  });

  return {
    type: 'interaction-summary',
    total: cases.length,
    passed: cases.filter((result) => result.ok).length,
    failed: cases.filter((result) => !result.ok).length,
    success: cases.every((result) => result.ok),
    cases,
  };
}
