# The Daily Deck

A daily tactical card game. Everyone gets the same cards and faces the same house, and tries to get the highest score. Easy to learn, difficult to master, different decisions every day.

**Status:** v0.2.3 — placeholder-numbers prototype for testing the core mechanics before any artwork or theme.

- **Play the prototype:** https://claude.ai/artifact/9dszi39qzrajPPTgUntgRo, or open `dist/index.html` in a browser.
- **Design document:** [`docs/gameplay.md`](docs/gameplay.md). This is the living record of rules, decisions, experiments and playtests.

## Layout

| Path | What it is |
|---|---|
| `src/engine.js` | Game rules, deck generation, scoring, solver and benchmark bots. Has no DOM, so it runs in Node too. |
| `src/log.js` | Test log: saves every finished game on the device and to the prototype's shared database, with CSV export. |
| `src/ui.js` | Browser interface: the draft, rounds, results and Balance lab. |
| `src/style.css` | Styles. |
| `build.sh` | Combines `src/` into a single self-contained `dist/index.html`. |
| `sim/lab.js` | Runs 400 random decks through the bots and prints scores by rule and ability metrics. |
| `sim/experiment.js` | Controlled Boost experiments (E1, E2). |
| `docs/gameplay.md` | Gameplay design document. |

## Commands

```bash
npm run build                                # rebuild dist/index.html
npm run lab                                  # balance report, 400 decks
node sim/experiment.js 3 400                 # Boost +3 baseline
node sim/experiment.js 2 400                 # E1: Boost +2
node sim/experiment.js 3 400 nostake         # E2: no staking on Boost rounds
```

There are no dependencies: you only need Node 18+ and bash.

## Working rules

- Change one balance variable at a time (D14).
- Every rules change gets an entry in the change log in `docs/gameplay.md`, and a re-run of the lab with the results noted.
- No purchasable, grindable or seniority-based competitive advantage (D11).
