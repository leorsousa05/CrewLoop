(() => {
  'use strict';

  // ---- Config ----
  const WS_URL = `ws://${location.host}/ws`;
  const MAX_EVENTS = 100;
  const SKILL_ICONS = {
    orchestrator: 'ph-target',
    architect: 'ph-blueprint',
    designer: 'ph-palette',
    engineer: 'ph-wrench',
    reviewer: 'ph-magnifying-glass',
    shipper: 'ph-rocket-launch',
    'docs-writer': 'ph-article',
    tester: 'ph-flask',
    'product-manager': 'ph-chart-bar',
    maintainer: 'ph-toolbox',
    researcher: 'ph-microscope',
    'security-guard': 'ph-shield',
    'accessibility-auditor': 'ph-person',
    'obsidian-second-brain': 'ph-brain',
    'project-mapper': 'ph-tree-structure',
    default: 'ph-circle',
  };

  // ---- State ----
  const state = {
    sessions: new Map(),
    activeSessionId: null,
    selectedSessionId: null,
    theme: localStorage.getItem('crewloop-theme') || 'system',
    connection: 'connecting',
    lastPong: 0,
    eventCountWindow: [],
    ws: null,
    reconnectTimer: null,
    pingTimer: null,
  };

  // ---- DOM refs ----
  const $ = (id) => document.getElementById(id);
  const themeToggle = $('theme-toggle');
  const connectionDot = $('connection-dot');
  const sessionTrigger = $('session-trigger');
  const sessionLabel = $('session-label');
  const sessionList = $('session-list');
  const activeStrip = $('active-strip');
  const activeSkillIcon = $('active-skill-icon');
  const activeSkillName = $('active-skill-name');
  const statusBadge = $('status-badge');
  const statusDot = $('status-dot');
  const statusText = $('status-text');
  const confidenceBadge = $('confidence-badge');
  const activeSkillSource = $('active-skill-source');
  const toolCount = $('tool-count');
  const durationEl = $('duration');
  const eventRate = $('event-rate');
  const timeline = $('timeline');
  const activityGraph = $('activity-graph');

  // ---- Utils ----
  function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    if (totalSeconds < 3600) return `${minutes}:${seconds}`;
    const hours = Math.floor(totalSeconds / 3600);
    return `${hours}:${minutes}:${seconds}`;
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function updateEventRate() {
    const now = Date.now();
    const windowStart = now - 60000;
    state.eventCountWindow = state.eventCountWindow.filter((t) => t > windowStart);
    eventRate.textContent = state.eventCountWindow.length.toString();
  }

  function skillIcon(skillName) {
    const key = skillName?.toLowerCase().replace(/\s+/g, '-');
    return SKILL_ICONS[key] || SKILL_ICONS.default;
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ---- Theme ----
  function applyTheme(theme) {
    const root = document.documentElement;
    let resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    root.setAttribute('data-theme', resolved);
    const icon = themeToggle.querySelector('i');
    if (resolved === 'light') {
      icon.className = 'ph ph-sun';
    } else {
      icon.className = 'ph ph-moon';
    }
  }

  function cycleTheme() {
    const order = ['system', 'light', 'dark'];
    const idx = order.indexOf(state.theme);
    state.theme = order[(idx + 1) % order.length];
    localStorage.setItem('crewloop-theme', state.theme);
    applyTheme(state.theme);
  }

  // ---- WebSocket ----
  function setConnection(status) {
    state.connection = status;
    connectionDot.className = 'connection-dot ' + status;
  }

  function connect() {
    setConnection('connecting');
    const ws = new WebSocket(WS_URL);
    state.ws = ws;

    ws.addEventListener('open', () => {
      setConnection('connected');
      state.lastPong = Date.now();
      startPing();
    });

    ws.addEventListener('message', (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      handleMessage(msg);
    });

    ws.addEventListener('close', () => {
      setConnection('disconnected');
      stopPing();
      scheduleReconnect();
    });

    ws.addEventListener('error', () => {
      ws.close();
    });
  }

  function scheduleReconnect() {
    if (state.reconnectTimer) return;
    state.reconnectTimer = setTimeout(() => {
      state.reconnectTimer = null;
      connect();
    }, 3000);
  }

  function startPing() {
    stopPing();
    state.pingTimer = setInterval(() => {
      if (!state.ws || state.ws.readyState !== WebSocket.OPEN) return;
      state.ws.send(JSON.stringify({ type: 'ping' }));
      if (Date.now() - state.lastPong > 35000) {
        state.ws.close();
      }
    }, 15000);
  }

  function stopPing() {
    if (state.pingTimer) {
      clearInterval(state.pingTimer);
      state.pingTimer = null;
    }
  }

  function handleMessage(msg) {
    if (msg.type === 'pong') {
      state.lastPong = Date.now();
      return;
    }
    if (msg.type === 'snapshot') {
      state.sessions.clear();
      (msg.sessions || []).forEach((s) => state.sessions.set(s.id, s));
      if (!state.selectedSessionId) {
        state.selectedSessionId = state.activeSessionId || state.sessions.keys().next().value || null;
      }
      renderSessionSelector();
      renderAll();
      return;
    }
    if (msg.type === 'update') {
      const session = msg.session;
      if (!session) return;
      state.sessions.set(session.id, session);
      if (msg.isActive) {
        state.activeSessionId = session.id;
        if (!state.selectedSessionId) state.selectedSessionId = session.id;
      }
      state.eventCountWindow.push(Date.now());
      renderSessionSelector();
      renderAll();
    }
  }

  // ---- Rendering ----
  function getSession() {
    return state.sessions.get(state.selectedSessionId) || null;
  }

  function renderAll() {
    const session = getSession();
    renderActiveSkill(session);
    renderTelemetry(session);
    renderTimeline(session);
    renderActivityGraph(session);
  }

  let lifecycleBadgeEl = null;
  let emptyStateEl = null;

  function getActiveSkillContent() {
    return activeSkillName.parentElement;
  }

  function setChildrenVisibility(visible) {
    const content = getActiveSkillContent();
    if (!content) return;
    Array.from(content.children).forEach((child) => {
      if (child === emptyStateEl) return;
      child.style.display = visible ? '' : 'none';
    });
  }

  function renderEmptyState() {
    if (!emptyStateEl) {
      emptyStateEl = document.createElement('div');
      emptyStateEl.className = 'empty-state';
      emptyStateEl.innerHTML = `
        <div class="empty-state-icon"><i class="ph ph-monitor-play"></i></div>
        <h2 class="empty-state-title">NO ACTIVE SESSION</h2>
        <p class="empty-state-body">Start an agent session to see it here.</p>
      `;
      getActiveSkillContent()?.appendChild(emptyStateEl);
    }
    emptyStateEl.style.display = 'flex';
    setChildrenVisibility(false);
  }

  function hideEmptyState() {
    if (emptyStateEl) {
      emptyStateEl.style.display = 'none';
    }
    setChildrenVisibility(true);
  }

  function renderLifecycleBadge(session) {
    if (!lifecycleBadgeEl) {
      lifecycleBadgeEl = document.createElement('span');
      lifecycleBadgeEl.className = 'lifecycle-badge';
      statusBadge.parentNode?.insertBefore(lifecycleBadgeEl, statusBadge.nextSibling);
    }
    const lifecycle = session.lifecycle || 'starting';
    lifecycleBadgeEl.className = 'lifecycle-badge ' + lifecycle;
    lifecycleBadgeEl.innerHTML = `<span class="lifecycle-dot"></span>${lifecycle.toUpperCase()}`;
    lifecycleBadgeEl.style.display = 'inline-flex';
  }

  function hideLifecycleBadge() {
    if (lifecycleBadgeEl) {
      lifecycleBadgeEl.style.display = 'none';
    }
  }

  function renderActiveSkill(session) {
    if (!session) {
      renderEmptyState();
      activeStrip.className = 'panel-accent-strip';
      hideLifecycleBadge();
      return;
    }

    hideEmptyState();

    const skill = session.activeSkill || { name: 'UNKNOWN', confidence: 'low' };
    const iconClass = skillIcon(skill.name);
    activeSkillName.textContent = skill.name.toUpperCase();
    activeSkillIcon.className = 'ph ' + iconClass;

    const lifecycle = session.lifecycle || 'starting';
    activeStrip.className = 'panel-accent-strip ' + lifecycle;

    if (lifecycle === 'ended') {
      statusDot.className = 'status-dot ' + (session.status || '');
      statusText.textContent = session.status ? session.status.toUpperCase() : 'ENDED';
    } else {
      statusDot.className = 'status-dot ' + lifecycle;
      statusText.textContent = lifecycle.toUpperCase();
    }

    renderLifecycleBadge(session);
    confidenceBadge.textContent = skill.confidence || 'low';

    activeSkillSource.innerHTML = `<i class="ph ph-${sourceIcon(session.source)}"></i><span>${session.source || 'unknown'}</span>`;
  }

  function sourceIcon(source) {
    switch (source) {
      case 'kimi': return 'chat-teardrop-text';
      case 'codex': return 'terminal';
      case 'opencode': return 'code-block';
      case 'log-watcher': return 'file-text';
      default: return 'monitor';
    }
  }

  function renderTelemetry(session) {
    if (!session) {
      toolCount.textContent = '0';
      durationEl.textContent = '00:00';
      updateEventRate();
      return;
    }
    const events = session.events || [];
    const toolEvents = events.filter((e) => e.event_type === 'tool_start' || e.event_type === 'tool_end');
    toolCount.textContent = String(Math.ceil(toolEvents.length / 2));
    const endTime = session.endedAt || session.lastActivity;
    const dur = endTime && session.startTime ? endTime - session.startTime : 0;
    durationEl.textContent = formatDuration(dur);
    updateEventRate();
  }

  function renderTimeline(session) {
    timeline.innerHTML = '';
    if (!session) return;
    const events = (session.events || []).slice(-MAX_EVENTS).reverse();
    const fragment = document.createDocumentFragment();
    events.forEach((ev) => {
      const li = document.createElement('li');
      li.className = 'timeline-item';
      const outcome = ev.status || (ev.event_type.endsWith('_end') ? 'success' : '');
      li.innerHTML = `
        <span class="timeline-time">${formatTime(ev.timestamp)}</span>
        <span class="timeline-dot ${outcome}"></span>
        <div class="timeline-main">
          <span class="timeline-tool">${ev.tool || ev.event_type}</span>
          <span class="timeline-detail">${escapeHtml(ev.detail || ev.skill || '')}</span>
        </div>
        <span class="timeline-outcome">${outcome}</span>
      `;
      fragment.appendChild(li);
    });
    timeline.appendChild(fragment);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderActivityGraph(session) {
    activityGraph.innerHTML = '';
    if (!session || !session.events || session.events.length === 0) {
      activityGraph.innerHTML = '<div class="activity-empty">Waiting for agent activity...</div>';
      return;
    }

    const events = session.events;
    const now = Date.now();
    const span = Math.max(60000, now - Math.min(...events.map((e) => e.timestamp)));
    const buckets = 40;
    const bucketMs = span / buckets;
    const counts = new Array(buckets).fill(0);

    events.forEach((e) => {
      const idx = Math.min(buckets - 1, Math.floor((now - e.timestamp) / bucketMs));
      const safeIdx = buckets - 1 - idx;
      counts[safeIdx]++;
    });

    const max = Math.max(1, ...counts);
    const canvas = document.createElement('canvas');
    canvas.className = 'activity-canvas';
    const rect = activityGraph.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;
    const pad = 4;
    const barW = (width - pad * 2) / buckets;

    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue('--accent').trim() || '#22d3ee';
    const muted = style.getPropertyValue('--bg-inset').trim() || '#1c1c1f';

    // background grid
    ctx.fillStyle = muted;
    ctx.fillRect(0, 0, width, height);

    counts.forEach((count, i) => {
      const barH = (count / max) * (height - pad * 2);
      const x = pad + i * barW;
      const y = height - pad - barH;
      ctx.fillStyle = accent;
      ctx.fillRect(x + 1, y, Math.max(1, barW - 2), Math.max(1, barH));
    });

    activityGraph.appendChild(canvas);
  }

  function renderSessionSelector() {
    sessionList.innerHTML = '';
    if (state.sessions.size === 0) {
      sessionLabel.textContent = 'No session';
      return;
    }

    const sessions = Array.from(state.sessions.values()).sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));
    if (!state.selectedSessionId || !state.sessions.has(state.selectedSessionId)) {
      state.selectedSessionId = sessions[0].id;
    }

    const activeSession = state.sessions.get(state.activeSessionId);
    let label = 'No session';
    const current = state.sessions.get(state.selectedSessionId);
    if (current) {
      label = current.skill ? current.skill.toUpperCase() : truncate(current.id, 12);
      if (current.id === state.activeSessionId && activeSession) {
        label = '● ' + label;
      }
    }
    sessionLabel.textContent = label;

    sessions.forEach((s) => {
      const li = document.createElement('li');
      li.className = 'session-item' + (s.id === state.selectedSessionId ? ' active' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(s.id === state.selectedSessionId));
      const duration = s.endedAt
        ? `ended after ${formatDuration(s.endedAt - s.startTime)}`
        : formatDuration(Date.now() - s.startTime);
      li.innerHTML = `
        <div class="session-item-main">
          <span class="session-item-id">${truncate(s.id, 16)}</span>
          <span class="session-item-meta">${formatTime(s.startTime)} · ${duration}</span>
        </div>
        <span class="session-item-source">${s.source || 'unknown'}</span>
      `;
      li.addEventListener('click', () => {
        state.selectedSessionId = s.id;
        closeSessionList();
        renderAll();
      });
      sessionList.appendChild(li);
    });
  }

  function truncate(str, n) {
    if (!str) return '';
    return str.length > n ? str.slice(0, n - 1) + '…' : str;
  }

  function toggleSessionList() {
    const open = sessionList.classList.toggle('open');
    sessionTrigger.setAttribute('aria-expanded', String(open));
  }

  function closeSessionList() {
    sessionList.classList.remove('open');
    sessionTrigger.setAttribute('aria-expanded', 'false');
  }

  // ---- Event listeners ----
  themeToggle.addEventListener('click', cycleTheme);

  sessionTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSessionList();
  });

  document.addEventListener('click', (e) => {
    if (!sessionTrigger.contains(e.target) && !sessionList.contains(e.target)) {
      closeSessionList();
    }
  });

  window.addEventListener('resize', () => {
    if (prefersReducedMotion()) {
      renderActivityGraph(getSession());
    } else {
      window.requestAnimationFrame(() => renderActivityGraph(getSession()));
    }
  });

  // Keep duration ticking
  setInterval(() => {
    const session = getSession();
    if (session && session.status === 'running') {
      renderTelemetry(session);
    }
  }, 1000);

  // Init
  applyTheme(state.theme);
  connect();
})();
