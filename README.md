# INSIDE THE FEED

> **“You choose the clicks. The algorithm shapes your world.”**

An interactive, real-time simulation that makes the invisible dynamics of social media recommendation algorithms visible.

![Inside The Feed Preview](https://raw.githubusercontent.com/pranesh-2601/inside-the-feed/main/preview.png)

---

## 🌟 Overview

Recommendation algorithms optimize for predicted retention and engagement rather than intellectual diversity. **Inside The Feed** demonstrates this phenomenon through a hands-on, live-updating feedback loop:

1. **Baseline Interest Calibration**: Select 3 initial topics (Technology, Environment, Fitness, Travel, Entertainment, Finance).
2. **Interactive Feed Engine**: Like (+2 pts), Share (+3 pts), or Skip (-1 pt) dynamic posts.
3. **Algorithm Mind Visualization**: Watch neural node orbitals expand, shrink, and re-weight with every click in real time.
4. **Live Telemetry Dashboard**: Real-time meters for *Feed Diversity (Shannon Entropy)*, *Filter Bubble Risk*, *Personalization Level*, and *Algorithm Confidence*.
5. **The Final Reveal**: A side-by-side diagnostic comparing your intended baseline feed against the algorithmic echo chamber.
6. **Break My Bubble**: Disruption mechanic that re-injects high entropy and restores cognitive diversity.

---

## 🚀 Quick Start (Zero Dependencies)

This project is completely self-contained with no external APIs, build tools, or frameworks required.

### Run Locally:
1. Clone this repository:
   ```bash
   git clone https://github.com/pranesh-2601/inside-the-feed.git
   ```
2. Open the folder and double-click `index.html` in any modern web browser.

---

## 🧠 Algorithmic Mathematical Model

- **Recommendation Amplification**:
  $$P_i = \frac{W_i^\gamma}{\sum_j W_j^\gamma} \quad (\gamma = 1.35)$$
- **Feed Diversity (Normalized Shannon Entropy)**:
  $$H = -\sum_{i=1}^{k} P_i \log_k(P_i)$$
- **Filter Bubble Risk Classification**:
  - $P_{\max} < 0.35 \rightarrow$ **LOW**
  - $0.35 \le P_{\max} < 0.55 \rightarrow$ **MODERATE**
  - $0.55 \le P_{\max} < 0.70 \rightarrow$ **HIGH**
  - $P_{\max} \ge 0.70 \rightarrow$ **ECHO CHAMBER**

---

## ⌨️ Keyboard Shortcuts

- `[L]` — **Like** (+2 topic affinity)
- `[S]` — **Share** (+3 viral affinity)
- `[K]` — **Skip** (-1 dampening)

---

## 🛠️ Built With

- **HTML5 & CSS3**: Glassmorphism, CSS grid & flexbox, custom variables, responsive layout.
- **Vanilla JavaScript (ES6+)**: Custom recommendation engine, event bus, and state management.
- **HTML5 Canvas**: Background data particle system & neural topology node visualizer.
- **Web Audio API**: Real-time synthesized interaction chimes, heartbeat pulses, and bubble breakout harmonics.

---

## 📄 License

MIT License — Feel free to use, modify, and distribute!
