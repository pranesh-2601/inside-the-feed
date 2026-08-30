(() => {
  const frame = document.getElementById('feed-frame');
  const boot = document.getElementById('boot-screen');
  if (!frame) return;

  let currentDoc = null;
  let observers = [];

  function cleanup() {
    observers.forEach(o => o.disconnect());
    observers = [];
  }

  function parsePct(text) {
    const m = String(text || '').match(/(-?\d+(?:\.\d+)?)\s*%/);
    return m ? Number(m[1]) : 0;
  }

  function injectTheme(d) {
    if (d.getElementById('xray-theme-css')) return;
    const link = d.createElement('link');
    link.id = 'xray-theme-css';
    link.rel = 'stylesheet';
    link.href = './xray-theme.css?v=3';
    d.head.appendChild(link);
  }

  function rewriteCopy(d) {
    const eyebrow = d.querySelector('.hero-eyebrow');
    if (eyebrow) eyebrow.textContent = 'VISUALIZING THE INVISIBLE / SOCIAL ALGORITHMS';

    const title = d.getElementById('intro-main-title');
    if (title) title.textContent = 'Inside the Feed';

    const subtitle = d.querySelector('.hero-subtitle');
    if (subtitle) subtitle.textContent = 'You see a post. The algorithm sees a signal.';

    const tagline = d.querySelector('.hero-tagline');
    if (tagline) tagline.textContent = 'Use the feed normally. Then switch on X-RAY to reveal why each post was selected, which interests are being amplified, and which ones are quietly disappearing.';

    const enter = d.querySelector('#btn-enter-feed span');
    if (enter) enter.textContent = 'Start the Experiment';

    const leftTitle = d.querySelector('.panel-left-col .panel-title');
    if (leftTitle) leftTitle.textContent = 'Algorithm Evidence';

    const rightTitle = d.querySelector('.panel-right-col .panel-title');
    if (rightTitle) rightTitle.textContent = 'Feed Evidence';

    const reveal = d.querySelector('#btn-manual-reveal span');
    if (reveal) reveal.textContent = 'Open the Algorithm Report';
  }

  function readWeights(d) {
    return Array.from(d.querySelectorAll('#topic-weights-container .topic-weight-row'))
      .map(row => ({
        name: row.querySelector('.topic-weight-label span:last-child')?.textContent?.trim() || 'Topic',
        pct: parsePct(row.querySelector('.topic-weight-pct')?.textContent)
      }))
      .sort((a, b) => b.pct - a.pct);
  }

  function ensureOverlay(d) {
    const card = d.getElementById('active-post-card');
    if (!card) return null;

    let label = card.querySelector('.xray-label');
    if (!label) {
      label = d.createElement('div');
      label.className = 'xray-label';
      label.textContent = 'ALGORITHM X-RAY';
      card.appendChild(label);
    }

    let overlay = card.querySelector('.xray-overlay');
    if (!overlay) {
      overlay = d.createElement('div');
      overlay.className = 'xray-overlay';
      card.appendChild(overlay);
    }
    return overlay;
  }

  function refreshOverlay(d) {
    const overlay = ensureOverlay(d);
    if (!overlay) return;

    const weights = readWeights(d);
    const current = d.getElementById('card-topic-badge')?.textContent?.trim() || 'Current topic';
    const currentPct = weights.find(x => x.name === current)?.pct || 0;
    const top = weights[0] || { name: current, pct: currentPct };
    const second = weights[1] || { name: 'Other topics', pct: 0 };
    const low = weights.slice(-2);
    const progress = d.getElementById('interaction-step-counter')?.textContent?.trim() || 'Interaction 0 / 12';

    const html = [
      '<h4>Why this post reached you</h4>',
      `<div class="xray-reason"><span>This post category</span><strong>${current} · ${currentPct}%</strong></div>`,
      `<div class="xray-reason"><span>Strongest learned signal</span><strong>${top.name} · ${top.pct}%</strong></div>`,
      `<div class="xray-reason"><span>Next strongest signal</span><strong>${second.name} · ${second.pct}%</strong></div>`,
      `<div class="xray-reason"><span>Experiment progress</span><strong>${progress}</strong></div>`,
      `<div class="xray-suppressed">Losing visibility: ${low.length ? low.map(x => `${x.name} ${x.pct}%`).join(' / ') : 'not enough data yet'}</div>`
    ].join('');

    if (overlay.innerHTML !== html) overlay.innerHTML = html;
  }

  function stageFromDom(d) {
    const counter = d.getElementById('interaction-step-counter')?.textContent || '';
    const count = Number((counter.match(/(\d+)/) || [0, 0])[1]);
    const risk = d.getElementById('metric-risk-badge');

    if (risk?.classList.contains('risk-echo') || count >= 8) return 'echo';
    if (risk?.classList.contains('risk-high') || risk?.classList.contains('risk-moderate') || count >= 4) return 'learning';
    return 'exploration';
  }

  function syncStage(d) {
    const stage = stageFromDom(d);
    if (d.documentElement.dataset.xrayStage !== stage) {
      d.documentElement.dataset.xrayStage = stage;
      d.body.classList.toggle('xray-stage-learning', stage === 'learning');
      d.body.classList.toggle('xray-stage-echo', stage === 'echo');
    }
    refreshOverlay(d);
  }

  function buildToggle(d) {
    let btn = d.getElementById('xray-toggle');
    if (btn) return btn;

    btn = d.createElement('button');
    btn.id = 'xray-toggle';
    btn.className = 'xray-toggle';
    btn.type = 'button';
    btn.textContent = 'X-RAY: OFF';
    btn.setAttribute('aria-pressed', 'false');

    btn.addEventListener('click', () => {
      const on = !d.documentElement.classList.contains('xray-on');
      d.documentElement.classList.toggle('xray-on', on);
      btn.classList.toggle('active', on);
      btn.textContent = on ? 'X-RAY: ON' : 'X-RAY: OFF';
      btn.setAttribute('aria-pressed', String(on));
      if (on) refreshOverlay(d);
    });

    d.body.appendChild(btn);
    return btn;
  }

  function bindSafeObservers(d) {
    const counter = d.getElementById('interaction-step-counter');
    if (counter) {
      const o = new MutationObserver(() => syncStage(d));
      o.observe(counter, { childList: true, characterData: true, subtree: true });
      observers.push(o);
    }

    const weights = d.getElementById('topic-weights-container');
    if (weights) {
      const o = new MutationObserver(() => refreshOverlay(d));
      o.observe(weights, { childList: true, subtree: true });
      observers.push(o);
    }

    const risk = d.getElementById('metric-risk-badge');
    if (risk) {
      const o = new MutationObserver(() => syncStage(d));
      o.observe(risk, { attributes: true, childList: true });
      observers.push(o);
    }
  }

  function bind(d) {
    if (!d?.documentElement) return;
    if (currentDoc === d && d.documentElement.dataset.xrayBound === '1') return;

    cleanup();
    currentDoc = d;
    d.documentElement.dataset.xrayBound = '1';

    injectTheme(d);
    rewriteCopy(d);
    buildToggle(d);
    ensureOverlay(d);
    syncStage(d);
    bindSafeObservers(d);

    // Refresh after user actions. No observer watches the post card itself,
    // so X-Ray overlay updates cannot recursively trigger themselves.
    ['btn-action-like', 'btn-action-share', 'btn-action-skip', 'btn-break-bubble', 'btn-start-feed'].forEach(id => {
      const el = d.getElementById(id);
      if (!el || el.dataset.xrayActionBound) return;
      el.dataset.xrayActionBound = '1';
      el.addEventListener('click', () => {
        setTimeout(() => syncStage(d), 120);
        setTimeout(() => syncStage(d), 360);
      }, true);
    });

    // Let the iframe paint the new paper theme before removing the loader.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (boot) boot.classList.add('hidden');
    }));
  }

  frame.addEventListener('load', () => {
    try { setTimeout(() => bind(frame.contentDocument), 60); } catch (_) { if (boot) boot.classList.add('hidden'); }
  });

  try {
    if (frame.contentDocument?.readyState === 'complete') setTimeout(() => bind(frame.contentDocument), 60);
  } catch (_) {}
})();