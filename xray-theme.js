(() => {
  const frame = document.getElementById('feed-frame');
  if (!frame) return;

  let boundDoc = null;
  let observers = [];

  const clean = () => {
    observers.forEach(o => o.disconnect());
    observers = [];
  };

  function parsePct(text) {
    const m = String(text || '').match(/(-?\d+(?:\.\d+)?)\s*%/);
    return m ? Number(m[1]) : 0;
  }

  function injectTheme(d) {
    if (!d.getElementById('xray-theme-css')) {
      const link = d.createElement('link');
      link.id = 'xray-theme-css';
      link.rel = 'stylesheet';
      link.href = './xray-theme.css';
      d.head.appendChild(link);
    }
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
      refreshXray(d);
    });
    d.body.appendChild(btn);
    return btn;
  }

  function ensureOverlay(d) {
    const card = d.getElementById('active-post-card');
    if (!card) return null;
    card.style.position = 'relative';
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

  function readWeights(d) {
    const rows = Array.from(d.querySelectorAll('#topic-weights-container .topic-weight-row'));
    const items = rows.map(row => {
      const name = row.querySelector('.topic-weight-label span:last-child')?.textContent?.trim() || 'Topic';
      const pct = parsePct(row.querySelector('.topic-weight-pct')?.textContent);
      return { name, pct };
    }).sort((a,b) => b.pct - a.pct);
    return items;
  }

  function refreshXray(d) {
    const overlay = ensureOverlay(d);
    if (!overlay) return;
    const weights = readWeights(d);
    const current = d.getElementById('card-topic-badge')?.textContent?.trim() || 'Current post';
    const interaction = d.getElementById('interaction-step-counter')?.textContent?.trim() || 'Interaction 0 / 12';
    const currentWeight = weights.find(x => x.name === current)?.pct || 0;
    const top = weights[0] || { name: current, pct: currentWeight };
    const second = weights[1] || { name: 'Other topics', pct: 0 };
    const suppressed = weights.slice(-2).map(x => x.name + ' ' + x.pct + '%').join(' • ');

    overlay.innerHTML =
      '<h4>Why this post reached you</h4>' +
      '<div class="xray-reason"><span>Current topic score</span><strong>' + current + ' ' + currentWeight + '%</strong></div>' +
      '<div class="xray-reason"><span>Strongest learned signal</span><strong>' + top.name + ' ' + top.pct + '%</strong></div>' +
      '<div class="xray-reason"><span>Second strongest signal</span><strong>' + second.name + ' ' + second.pct + '%</strong></div>' +
      '<div class="xray-reason"><span>Experiment progress</span><strong>' + interaction + '</strong></div>' +
      '<div class="xray-suppressed">Quietly losing visibility: ' + (suppressed || 'none yet') + '</div>';
  }

  function stageFromDom(d) {
    const countText = d.getElementById('interaction-step-counter')?.textContent || '';
    const count = Number((countText.match(/(\d+)/) || [0,0])[1]);
    const risk = d.getElementById('metric-risk-badge');
    if (risk?.classList.contains('risk-echo') || count >= 8) return 'echo';
    if (risk?.classList.contains('risk-high') || risk?.classList.contains('risk-moderate') || count >= 4) return 'learning';
    return 'exploration';
  }

  function applyStage(d) {
    const stage = stageFromDom(d);
    d.documentElement.dataset.xrayStage = stage;
    d.body.classList.toggle('xray-stage-learning', stage === 'learning');
    d.body.classList.toggle('xray-stage-echo', stage === 'echo');
    refreshXray(d);
  }

  function rewriteCopy(d) {
    const eyebrow = d.querySelector('.hero-eyebrow');
    if (eyebrow) eyebrow.textContent = 'VISUALIZING THE INVISIBLE — SOCIAL MEDIA ALGORITHMS';
    const title = d.getElementById('intro-main-title');
    if (title) title.textContent = 'Inside the Feed';
    const subtitle = d.querySelector('.hero-subtitle');
    if (subtitle) subtitle.textContent = 'You see a post. The algorithm sees a signal.';
    const tagline = d.querySelector('.hero-tagline');
    if (tagline) tagline.textContent = 'Use the feed normally, then switch on X-RAY to expose the invisible scoring system deciding what appears, what gets amplified, and what quietly disappears.';
    const enter = d.querySelector('#btn-enter-feed span');
    if (enter) enter.textContent = 'Start the Experiment';
    const rightTitle = d.querySelector('.panel-right-col .panel-title');
    if (rightTitle) rightTitle.textContent = 'Evidence Monitor';
    const leftTitle = d.querySelector('.panel-left-col .panel-title');
    if (leftTitle) leftTitle.textContent = 'Algorithm Evidence';
  }

  function bind(d) {
    if (!d || !d.documentElement) return;
    if (boundDoc === d && d.documentElement.dataset.xrayBound === '1') return;
    clean();
    boundDoc = d;
    d.documentElement.dataset.xrayBound = '1';
    injectTheme(d);
    rewriteCopy(d);
    buildToggle(d);
    ensureOverlay(d);
    applyStage(d);

    const targets = [
      d.getElementById('topic-weights-container'),
      d.getElementById('interaction-step-counter'),
      d.getElementById('metric-risk-badge'),
      d.getElementById('active-post-card'),
      d.getElementById('screen-dashboard')
    ].filter(Boolean);

    targets.forEach(target => {
      const observer = new MutationObserver(() => applyStage(d));
      observer.observe(target, { childList: true, subtree: true, attributes: true, characterData: true });
      observers.push(observer);
    });

    ['btn-action-like','btn-action-share','btn-action-skip','btn-break-bubble'].forEach(id => {
      const el = d.getElementById(id);
      if (el && !el.dataset.xrayBound) {
        el.dataset.xrayBound = '1';
        el.addEventListener('click', () => {
          setTimeout(() => applyStage(d), 80);
          setTimeout(() => applyStage(d), 320);
        }, true);
      }
    });
  }

  frame.addEventListener('load', () => setTimeout(() => bind(frame.contentDocument), 80));
  try {
    if (frame.contentDocument?.readyState === 'complete') setTimeout(() => bind(frame.contentDocument), 80);
  } catch (_) {}
})();
