(() => {
  const frame = document.getElementById('feed-frame');
  const boot = document.getElementById('boot-screen');

  function hideBoot() {
    if (boot) boot.classList.add('hidden');
  }

  function enhance() {
    let d, w;
    try {
      d = frame.contentDocument;
      w = frame.contentWindow;
    } catch (e) {
      hideBoot();
      return;
    }
    if (!d || !d.documentElement) return;
    if (d.documentElement.dataset.enhancedUi === 'true') {
      hideBoot();
      return;
    }
    d.documentElement.dataset.enhancedUi = 'true';

    // Load the visual layer inside the same-origin simulation document.
    const styleLink = d.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = './enhancements.css';
    d.head.appendChild(styleLink);

    // HERO — reduce copy and explain the core cause/effect in one glance.
    const subtitle = d.querySelector('.hero-subtitle');
    const tagline = d.querySelector('.hero-tagline');
    const enterBtnText = d.querySelector('#btn-enter-feed span');
    if (subtitle) subtitle.textContent = 'You choose the clicks. The algorithm shapes your world.';
    if (tagline) {
      tagline.textContent = 'Like, share, or skip. Watch each signal enter the algorithm, reshape what it believes about you, and narrow what you see next.';
      if (!d.querySelector('.hero-impact-demo')) {
        const demo = d.createElement('div');
        demo.className = 'hero-impact-demo';
        demo.setAttribute('aria-label', 'How the simulation works');
        demo.innerHTML =
          '<div class="hero-impact-node"><div class="hero-impact-icon">♥</div><div><strong>Your Click</strong><span>Like • Share • Skip</span></div></div>' +
          '<div class="hero-impact-arrow">→</div>' +
          '<div class="hero-impact-node"><div class="hero-impact-icon">◎</div><div><strong>Algorithm Learns</strong><span>Weights shift instantly</span></div></div>' +
          '<div class="hero-impact-arrow">→</div>' +
          '<div class="hero-impact-node"><div class="hero-impact-icon">◉</div><div><strong>Your World Narrows</strong><span>Bubble risk rises</span></div></div>';
        tagline.insertAdjacentElement('afterend', demo);
      }
    }
    if (enterBtnText) enterBtnText.textContent = 'Enter the Experiment';
    const launchText = d.querySelector('#btn-start-feed span');
    if (launchText) launchText.textContent = 'Launch My Feed';

    // Make the dashboard language more judge-friendly.
    const rightPanelTitle = d.querySelector('.panel-right-col .panel-title');
    if (rightPanelTitle) rightPanelTitle.textContent = 'Bubble Monitor';
    const manualRevealText = d.querySelector('#btn-manual-reveal span');
    if (manualRevealText) manualRevealText.textContent = 'Reveal What Changed';

    // BIG FILTER-BUBBLE MONITOR — replaces the small duplicate risk card.
    const metricsStack = d.querySelector('.panel-right-col .metrics-stack');
    const riskBadge = d.getElementById('metric-risk-badge');
    const riskFill = d.getElementById('meter-risk-fill');
    const rightPanel = d.querySelector('.panel-right-col');
    let riskHero = null;

    if (metricsStack && riskBadge && !d.getElementById('enh-risk-hero')) {
      riskHero = d.createElement('div');
      riskHero.id = 'enh-risk-hero';
      riskHero.className = 'risk-hero risk-low';
      riskHero.innerHTML =
        '<div class="risk-kicker">Live filter-bubble risk</div>' +
        '<div class="risk-main"><div class="risk-score" id="enh-risk-score">20%</div><div class="risk-word" id="enh-risk-word">LOW</div></div>' +
        '<div class="risk-caption">Every interaction changes the probability of what reaches you next.</div>';
      metricsStack.insertBefore(riskHero, metricsStack.firstChild);
      const oldRiskCard = riskBadge.closest('.metric-card');
      if (oldRiskCard) oldRiskCard.style.display = 'none';
    } else {
      riskHero = d.getElementById('enh-risk-hero');
    }

    function syncRisk() {
      if (!riskBadge || !riskHero) return;
      let level = 'low';
      if (riskBadge.classList.contains('risk-echo')) level = 'echo';
      else if (riskBadge.classList.contains('risk-high')) level = 'high';
      else if (riskBadge.classList.contains('risk-moderate')) level = 'moderate';

      const scoreMap = { low: 20, moderate: 45, high: 75, echo: 100 };
      const wordMap = { low: 'LOW', moderate: 'MODERATE', high: 'HIGH', echo: 'ECHO CHAMBER' };
      const inlineScore = riskFill ? parseFloat(riskFill.style.width || '') : NaN;
      const score = Number.isFinite(inlineScore) ? Math.round(inlineScore) : scoreMap[level];

      riskHero.className = 'risk-hero risk-' + level;
      const scoreEl = d.getElementById('enh-risk-score');
      const wordEl = d.getElementById('enh-risk-word');
      if (scoreEl) scoreEl.textContent = score + '%';
      if (wordEl) wordEl.textContent = wordMap[level];

      if (rightPanel) {
        rightPanel.classList.toggle('risk-alert', level === 'high');
        rightPanel.classList.toggle('risk-danger', level === 'echo');
      }
    }

    syncRisk();
    if (riskBadge) {
      new MutationObserver(syncRisk).observe(riskBadge, { attributes: true, childList: true, characterData: true, subtree: true });
    }
    if (riskFill) {
      new MutationObserver(syncRisk).observe(riskFill, { attributes: true, attributeFilter: ['style'] });
    }

    // CLICK → ALGORITHM → METRICS feedback. Existing physics packet is kept,
    // this adds a readable signal label and synchronized panel flashes.
    const leftPanel = d.querySelector('.panel-left-col');
    const postCard = d.getElementById('active-post-card');

    function currentSignalColor() {
      if (!postCard) return '#00f0ff';
      const value = w.getComputedStyle(postCard).getPropertyValue('--card-topic-color').trim();
      return value || '#00f0ff';
    }

    function flashSignal(type) {
      const topicBadge = d.getElementById('card-topic-badge');
      const topic = topicBadge ? topicBadge.textContent : 'Current topic';
      const actionCopy = {
        like: 'LIKE SIGNAL  →  ' + topic + ' +2',
        share: 'SHARE SIGNAL  →  ' + topic + ' +3.5',
        skip: 'SKIP SIGNAL  →  ' + topic + ' −1.2'
      };
      const toast = d.createElement('div');
      toast.className = 'signal-toast';
      toast.style.setProperty('--signal-color', currentSignalColor());
      toast.textContent = actionCopy[type] || 'SIGNAL SENT TO ALGORITHM';
      d.body.appendChild(toast);
      setTimeout(() => toast.remove(), 950);

      if (leftPanel) {
        leftPanel.classList.remove('algorithm-hit');
        void leftPanel.offsetWidth;
        leftPanel.classList.add('algorithm-hit');
        setTimeout(() => leftPanel.classList.remove('algorithm-hit'), 760);
      }
      if (rightPanel) {
        rightPanel.classList.remove('metrics-hit');
        void rightPanel.offsetWidth;
        rightPanel.classList.add('metrics-hit');
        setTimeout(() => rightPanel.classList.remove('metrics-hit'), 760);
      }
      if (postCard) {
        postCard.classList.remove('active-post-card-hit');
        void postCard.offsetWidth;
        postCard.classList.add('active-post-card-hit');
        setTimeout(() => postCard.classList.remove('active-post-card-hit'), 500);
      }
      setTimeout(syncRisk, 80);
      setTimeout(syncRisk, 280);
    }

    const actionButtons = [
      ['btn-action-like', 'like'],
      ['btn-action-share', 'share'],
      ['btn-action-skip', 'skip']
    ];
    actionButtons.forEach(([id, action]) => {
      const btn = d.getElementById(id);
      if (btn) btn.addEventListener('click', () => flashSignal(action), true);
    });

    w.addEventListener('keydown', (e) => {
      if (!d.getElementById('screen-dashboard')?.classList.contains('active')) return;
      const k = e.key.toLowerCase();
      if (k === 'l') flashSignal('like');
      else if (k === 's') flashSignal('share');
      else if (k === 'k') flashSignal('skip');
    }, true);

    // FINAL REVEAL — stronger message + live narrowing visualization.
    const revealTitle = d.getElementById('reveal-title');
    const revealSubtitle = d.querySelector('.reveal-header p');
    const focal = d.querySelector('.focal-quote-text');
    const focalSub = d.querySelector('.focal-quote-sub');
    if (revealTitle) revealTitle.textContent = 'Your Feed Was Trained';
    if (revealSubtitle) revealSubtitle.textContent = 'The invisible feedback loop is now visible.';
    if (focal) focal.innerHTML = 'You never asked for an echo chamber.<br><span>You trained one.</span>';
    if (focalSub) focalSub.textContent = 'Your actions were small. Their accumulated effect was not: the algorithm amplified what kept you engaged and quietly reduced everything else.';

    function getDistribution(containerId) {
      const container = d.getElementById(containerId);
      if (!container) return [];
      return Array.from(container.querySelectorAll('.comp-bar-item')).map(item => {
        const fill = item.querySelector('.comp-bar-fill');
        const label = item.querySelector('.comp-bar-label-row span');
        return {
          name: label ? label.textContent : 'Topic',
          width: fill ? Math.max(0, parseFloat(fill.style.width || '0')) : 0,
          color: item.style.getPropertyValue('--bar-color').trim() || '#00f0ff'
        };
      });
    }

    function trackMarkup(items) {
      return items.map(x => '<div class="reveal-funnel-seg" title="' + x.name + ': ' + x.width + '%" style="width:' + x.width + '%;background:' + x.color + '"></div>').join('');
    }

    function buildRevealFunnel() {
      const focalBox = d.querySelector('.focal-quote-box');
      if (!focalBox) return;
      const before = getDistribution('reveal-dist-before');
      const after = getDistribution('reveal-dist-after');
      if (!before.length || !after.length) return;

      let funnel = d.getElementById('enh-reveal-funnel');
      if (!funnel) {
        funnel = d.createElement('div');
        funnel.id = 'enh-reveal-funnel';
        funnel.className = 'reveal-funnel';
        focalBox.insertAdjacentElement('afterend', funnel);
      }
      const dominant = after.reduce((a, b) => b.width > a.width ? b : a, after[0]);
      funnel.innerHTML =
        '<div class="reveal-funnel-label"><span>Your starting choice</span><span>Broader mix</span></div>' +
        '<div class="reveal-funnel-track">' + trackMarkup(before) + '</div>' +
        '<div class="reveal-funnel-arrow">↓ &nbsp;<b>ENGAGEMENT OPTIMIZATION</b>&nbsp; ↓</div>' +
        '<div class="reveal-funnel-label"><span>What the algorithm learned</span><span>Narrower feed</span></div>' +
        '<div class="reveal-funnel-track">' + trackMarkup(after) + '</div>' +
        '<div class="reveal-funnel-dominant">Dominant signal: <strong style="color:' + dominant.color + '">' + dominant.name + ' — ' + dominant.width + '%</strong></div>';
    }

    const revealScreen = d.getElementById('screen-reveal');
    if (revealScreen) {
      new MutationObserver(() => {
        if (revealScreen.classList.contains('active')) setTimeout(buildRevealFunnel, 80);
      }).observe(revealScreen, { attributes: true, attributeFilter: ['class'] });
    }
    const revealBtn = d.getElementById('btn-manual-reveal');
    if (revealBtn) revealBtn.addEventListener('click', () => setTimeout(buildRevealFunnel, 120));

    hideBoot();
  }

  if (frame) {
    frame.addEventListener('load', enhance);
    if (frame.contentDocument?.readyState === 'complete') enhance();
  } else {
    hideBoot();
  }
})();
