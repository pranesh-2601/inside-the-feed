# INSIDE THE FEED

**Visualizing the Invisible — Social Media Recommendation Algorithms**

> You see content. The system sees signals.

**Inside The Feed** is an interactive web experience that makes the hidden feedback loop behind social media recommendations visible. Users interact with a simulated feed, while the system continuously updates topic weights, recommendation probabilities, diversity, personalization, confidence, and filter-bubble risk.

### Live Demo

**https://inside-the-feed.vercel.app/**

### Source Code

**https://github.com/pranesh-2601/inside-the-feed**

---

## Hackathon Track

- **Challenge:** Visualizing the Invisible
- **Track:** Website — Interactive Visualization / Simulation
- **Invisible phenomenon:** How social media algorithms influence what people see and gradually shape their choices

---

## The Idea

Recommendation systems learn from tiny actions such as likes, shares, and skips. Those actions look harmless individually, but repeated signals can gradually narrow a feed and reduce exposure to other topics.

Inside The Feed turns that invisible process into a visible, interactive experiment.

1. Select **3 initial interests** from Technology, Environment, Fitness, Travel, Entertainment, and Finance.
2. Use the simulated feed normally with **Like**, **Share**, and **Skip**.
3. Watch hidden interest weights and recommendation probabilities change in real time.
4. Turn on **X-RAY** to reveal why a post reached you, which signals are strongest, and which topics are losing visibility.
5. Observe **Feed Diversity**, **Filter Bubble Risk**, **Personalization**, and **Algorithm Confidence** evolve during the session.
6. Reach the final reveal to compare your starting interests with the feed the algorithm learned.
7. Use **Break My Bubble** to deliberately restore diversity.

---

## What Makes It Different

### X-RAY Mode
A normal feed shows only the content. X-RAY mode exposes the hidden recommendation layer behind the current post, including the strongest learned interests and low-visibility topics.

### Real-Time Feedback Loop
Every interaction immediately changes the internal scoring model and influences what can appear next.

### Filter-Bubble Visualization
The experience shows how repeated engagement can make one preference dominate while other interests quietly disappear from the feed.

### Interactive Recovery
**Break My Bubble** demonstrates that recommendation systems can also be designed to re-introduce diversity instead of only maximizing reinforcement.

---

## Interaction Model

| Action | Effect on topic affinity |
| --- | ---: |
| Like | `+2.0` |
| Share | `+3.5` |
| Skip | `-1.2` |

Recommendation probability is calculated from the current topic weights using an amplification exponent:

```text
P(i) = W(i)^1.35 / sum(W(j)^1.35)
```

Feed diversity is estimated using normalized Shannon entropy over the recommendation probability distribution.

> The project is an educational simulation of recommendation feedback loops. It is not intended to reproduce the proprietary ranking system of any specific social media platform.

---

## Demo Flow

For a quick judge demo:

1. Open the live site and enter the experiment.
2. Pick 3 interests.
3. Repeatedly Like or Share one topic.
4. Turn **X-RAY ON** and show how the hidden signals change.
5. Continue interacting until the feed enters the high-bias / echo-chamber stage.
6. Open the final report.
7. Press **Break My Bubble** to restore diversity.

Keyboard shortcuts are also available:

- `L` — Like
- `S` — Share
- `K` — Skip

---

## Tech Stack

- **HTML5**
- **CSS3**
- **Vanilla JavaScript (ES6+)**
- **HTML5 Canvas** for the algorithm / neural visualization
- **Web Audio API** for interaction feedback
- **Vercel** for deployment

The project has **no framework, build step, backend, database, or external API dependency**.

---

## Run Locally

Because the final interface loads the simulation inside a same-origin frame, run the folder through a small local web server instead of opening the file directly.

```bash
git clone https://github.com/pranesh-2601/inside-the-feed.git
cd inside-the-feed
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/enhanced.html
```

---

## Project Structure

```text
inside-the-feed/
├── index.html         # Core recommendation simulation
├── enhanced.html      # Final presentation wrapper
├── xray-theme.css     # Final dark X-RAY interface
├── xray-theme.js      # X-RAY mode + presentation behavior
├── favicon.svg
├── vercel.json        # Production route configuration
└── README.md
```

---

## Submission Links

- **Live Website:** https://inside-the-feed.vercel.app/
- **GitHub Repository:** https://github.com/pranesh-2601/inside-the-feed

---

## License

MIT License
