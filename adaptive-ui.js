(() => {
  const frame = document.getElementById('feed-frame');
  let attachedDoc = null;
  let observers = [];
  let breakoutTimer = null;

  const TOPIC_COLORS = {
    Technology: ['#00f0ff', '0,240,255'],
    Environment: ['#10b981', '16,185,129'],
    Fitness: ['#f97316', '249,115,22'],
    Travel: ['#8b5cf6', '139,92,246'],
    Entertainment: ['#ec4899', '236,72,153'],
    Finance: ['#eab308', '234,179,8']
  };

  function clearObservers() {
    observers.forEach(o => o.disconnect());
    observers = [];
  }

  function safeDoc() {
    try { return frame && frame.contentDocument; } catch (_) { return null; }
  }

  function ensureStyle(d) {
    if (d.getElementById('adaptive-ui-css')) return;
    const link = d.createElement('link');
    link.id = 'adaptive-ui-css';
    link.rel = 'stylesheet';
    link.href = './adaptive-ui.css';
    d.head.appendChild(link);
  }

  function ensureStateChip(d) {
    let chip = d.getElementById('adaptive-state-chip');
    if (chip) return chip;
    chip = d.createElement('div');
    chip.id = 'adaptive-state-chip';
    chip.className = 'adaptive-state-chip';
    chip.innerHTML = '<span class="adaptive-state-dot"></span><span class="adaptive-state-copy"><strong>Algorithm state</strong><span id="adaptive-state-text">Exploration</span></span>';
    d.body.appendChild(chip);
    return chip;
  }

  function ensureDominantStrip(d) {
    const leftPanel = d.querySelector('.panel-left-col');
    if (!leftPanel) return null;
    let strip = d.getElementById('adaptive-dominant-strip');
    if (strip) return strip;
    strip = d.createElement('div');
    strip.id = 'adaptive-dominant-strip';
    strip.className = 'adaptive-dominant-strip';
    strip.innerHTML = '<span>Strongest recommendation signal</span><strong id="adaptive-dominant-text">Waiting for signal…</strong>';
    const narrative = leftPanel.querySelector('.narrative-stream-box');
    if (narrative) narrative.insertAdjacentElement('afterend', strip);
    else leftPanel.appendChild(strip);
    return strip;
  }

  function parsePercent(text) {
    const match = String(text || '').match(/(-?\d+(?:\.\d+)?)\s*%/);
    return match ? Number(match[1]) : 0;
  }

  function readInteractionCount(d) {
    const el = d.getElementById('interaction-step-counter');
    if (!el) return 0;
    const match = el.textContent.match(/(\d+)\s*\/\s*(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  function readRiskLevel(d) {
    const badge = d.getElementById('metric-risk-badge');
    if (!badge) return 'low';
    if (badge.classList.contains('risk-echo')) return 'echo';
    if (badge.classList.contains('risk-high')) return 'high';
    if (badge.classList.contains('risk-moderate')) return 'moderate';
    return 'low';
  }

  function readStage(d) {
    const count = readInteractionCount(d);
    const label = (d.getElementById('stage-banner-tag')?.textContent || '').toLowerCase();
    const risk = readRiskLevel(d);
    if (risk === 'echo' || label.includes('echo') || count >= 8) return 'echo';
    if (label.includes('pattern') || count >= 4 || risk === 'high' || risk === 'moderate') return 'learning';
    return 'exploration';
  }

  function readDominantTopic(d) {
    const rows = Array.from(d.querySelectorAll('#topic-weights-container .topic-weight-row'));
    let best = null;
    rows.forEach(row => {
      const label = row.querySelector('.topic-weight-label span:last-child')?.textContent?.trim();
      const pct = parsePercent(row.querySelector('.topic-weight-pct')?.textContent);
      if (label && (!best || pct > best.pct)) best = { name: label, pct, row };
    });
    if (!best) {
      const badge = d.getElementById('card-topic-badge');
      const name = badge?.textContent?.trim() || 'Technology';
      best = { name, pct: 0, row: null };
    }
    return best;
  }

  function setTopicVars(d, dominant) {
    const pair = TOPIC_COLORS[dominant.name] || TOPIC_COLORS.Technology;
    const root = d.documentElement;
    if (root.style.getPropertyValue('--adaptive-topic') !== pair[0]) root.style.setProperty('--adaptive-topic', pair[0]);
    if (root.style.getPropertyValue('--adaptive-topic-rgb') !== pair[1]) root.style.setProperty('--adaptive-topic-rgb', pair[1]);

    d.querySelectorAll('#topic-weights-container .topic-weight-row').forEach(row => {
      const shouldBeDominant = row === dominant.row;
      if (row.classList.contains('adaptive-dominant-topic') !== shouldBeDominant) {
        row.classList.toggle('adaptive-dominant-topic', shouldBeDominant);
      }
    });

    const text = d.getElementById('adaptive-dominant-text');
    const nextText = dominant.name + (dominant.pct ? ` · ${dominant.pct}%` : '');
    if (text && text.textContent !== nextText) text.textContent = nextText;
  }

  function showTransition(d, nextState) {
    const map = {
      exploration: ['Exploration', 'The system is still sampling broadly.'],
      learning: ['Pattern Learning', 'Your repeated signals are beginning to reshape the feed.'],
      echo: ['Echo Chamber Lock', 'One preference is now dominating what the algorithm selects.'],
      breakout: ['Bubble Disrupted', 'Diversity has been deliberately restored.']
    };
    const copy = map[nextState] || map.exploration;
    d.querySelectorAll('.adaptive-transition-banner').forEach(el => el.remove());
    const banner = d.createElement('div');
    banner.className = 'adaptive-transition-banner';
    banner.innerHTML = `<b>${copy[0]}</b><span>${copy[1]}</span>`;
    d.body.appendChild(banner);
    setTimeout(() => banner.remove(), 1450);
  }

  function applyState(d, stateName, announce = true) {
    if (!d?.documentElement) return;
    const root = d.documentElement;
    const old = root.dataset.algoState;
    if (old !== stateName) root.dataset.algoState = stateName;

    const chip = ensureStateChip(d);
    const text = d.getElementById('adaptive-state-text');
    const labels = { exploration: 'Exploration', learning: 'Pattern Learning', echo: 'Echo Chamber', breakout: 'Bubble Breakout' };
    const label = labels[stateName] || stateName;
    if (text && text.textContent !== label) text.textContent = label;

    const dashboardActive = d.getElementById('screen-dashboard')?.classList.contains('active');
    chip.classList.toggle('visible', !!dashboardActive);
    if (announce && old && old !== stateName && stateName !== 'breakout') showTransition(d, stateName);
  }

  function sync(d, announce = true) {
    if (!d?.documentElement) return;
    ensureStateChip(d);
    ensureDominantStrip(d);
    setTopicVars(d, readDominantTopic(d));
    if (d.documentElement.dataset.algoState === 'breakout') return;
    applyState(d, readStage(d), announce);
  }

  function setLastAction(d, action) {
    d.documentElement.dataset.lastAction = action;
    setTimeout(() => {
      if (d.documentElement.dataset.lastAction === action) delete d.documentElement.dataset.lastAction;
    }, 800);
  }

  function wireActionAwareness(d) {
    const buttons = [
      ['btn-action-like', 'like'],
      ['btn-action-share', 'share'],
      ['btn-action-skip', 'skip']
    ];
    buttons.forEach(([id, action]) => {
      const btn = d.getElementById(id);
      if (!btn || btn.dataset.adaptiveBound) return;
      btn.dataset.adaptiveBound = '1';
      btn.addEventListener('click', () => {
        setLastAction(d, action);
        setTimeout(() => sync(d, true), 70);
        setTimeout(() => sync(d, false), 340);
      }, true);
    });

    const breakBtn = d.getElementById('btn-break-bubble');
    if (breakBtn && !breakBtn.dataset.adaptiveBound) {
      breakBtn.dataset.adaptiveBound = '1';
      breakBtn.addEventListener('click', () => {
        if (breakoutTimer) clearTimeout(breakoutTimer);
        applyState(d, 'breakout', false);
        showTransition(d, 'breakout');
        breakoutTimer = setTimeout(() => {
          applyState(d, 'exploration', false);
          sync(d, false);
        }, 1250);
      }, true);
    }
  }

  function wireKeyboard(d, w) {
    if (w.__adaptiveKeyboardBound) return;
    w.__adaptiveKeyboardBound = true;
    w.addEventListener('keydown', e => {
      if (!d.getElementById('screen-dashboard')?.classList.contains('active')) return;
      const key = e.key.toLowerCase();
      if (key === 'l') setLastAction(d, 'like');
      else if (key === 's') setLastAction(d, 'share');
      else if (key === 'k') setLastAction(d, 'skip');
      else return;
      setTimeout(() => sync(d, true), 85);
      setTimeout(() => sync(d, false), 350);
    }, true);
  }

  function watch(target, options, d, announce = true) {
    if (!target) return;
    const observer = new MutationObserver(() => sync(d, announce));
    observer.observe(target, options);
    observers.push(observer);
  }

  function attach() {
    const d = safeDoc();
    const w = frame?.contentWindow;
    if (!d || !w || !d.documentElement) return;
    if (attachedDoc === d && d.documentElement.dataset.adaptiveBound === 'true') return;

    clearObservers();
    attachedDoc = d;
    d.documentElement.dataset.adaptiveBound = 'true';
    ensureStyle(d);
    ensureStateChip(d);
    ensureDominantStrip(d);
    wireActionAwareness(d);
    wireKeyboard(d, w);
    sync(d, false);

    watch(d.getElementById('interaction-step-counter'), { childList: true, subtree: true, characterData: true }, d, true);
    watch(d.getElementById('metric-risk-badge'), { childList: true, subtree: true, attributes: true, characterData: true }, d, true);
    watch(d.getElementById('topic-weights-container'), { childList: true, subtree: true, characterData: true }, d, false);
    watch(d.getElementById('screen-dashboard'), { attributes: true, attributeFilter: ['class'] }, d, false);
    watch(d.getElementById('screen-reveal'), { attributes: true, attributeFilter: ['class'] }, d, false);

    const periodic = setInterval(() => {
      if (safeDoc() !== d) { clearInterval(periodic); return; }
      sync(d, false);
    }, 1200);
    observers.push({ disconnect: () => clearInterval(periodic) });
  }

  if (!frame) return;
  frame.addEventListener('load', () => setTimeout(attach, 80));
  if (frame.contentDocument?.readyState === 'complete') setTimeout(attach, 80);
})();
