# The Daily Deck

A daily tactical card game. Everyone gets the same cards and faces the same house, and tries to get the highest score. Easy to learn, difficult to master, different decisions every day.

**Status:** v0.2.6 — placeholder-numbers prototype for testing the core mechanics before any artwork or theme.

- **Play the prototype:** https://claude.ai/artifact/9dszi39qzrajPPTgUntgRo, or open `dist/index.html` in a browser.
- **Design document:** [`docs/gameplay.md`](docs/gameplay.md). This is the living record of rules, decisions, experiments and playtests.

## Layout

| Path | What it is |
|---|---|
| `src/engine.js` | Game rules, deck generation, scoring, solver and benchmark bots. Has no DOM, so it runs in Node too. |
| `src/log.js` | Test log: saves every finished game on the device and to the prototype's shared database, with CSV export. |
| `src/remote.js` | itch.io build only: sends finished games and feedback to the Google Sheet, with an on-device outbox for retries. |
| `src/ui.js` | Browser interface: the draft, rounds, results and Balance lab. |
| `src/style.css` | Styles. |
| `build.sh` | Combines `src/` into a single self-contained `dist/index.html`. `build.sh itch` makes the itch.io playtest build in `dist/itch/` using `itch.config.json`. |
| `apps-script/Code.gs` | Google Apps Script that receives playtest results into a Sheet (Games and Feedback tabs) and can email a daily summary. |
| `docs/itch-playtest.md` | Step-by-step guide to publishing the playtest on itch.io. |
| `sim/lab.js` | Runs 400 random decks through the bots and prints scores by rule and ability metrics. |
| `sim/experiment.js` | Controlled Boost experiments (E1, E2). |
| `sim/e3.js`, `sim/e3-timing.js` | Stake-limit experiment E3 and its timing control. |
| `sim/e4.js` | Grand Finale experiment E4 (×2, or no stacking with stakes). |
| `sim/stake-regret.js` | For logged 2-stake games: the best stake placement given the player's own plays, and the timing cost. |
| `sim/finale-summary.js` | Groups logged Grand Finale games by stake limit and multiplier. |
| `sim/candidate.js` | Simulates candidate ruleset v1 (2 stakes, Finale ×2, Boost +2) by daily rule. |
| `sim/boost-summary.js` | Re-scores logged Boost rounds with and without Boost: flip rate, stake use, points added. |
| `playtests/` | Raw CSV exports from playtest sessions. |
| `docs/gameplay.md` | Gameplay design document. |

## Commands

```bash
npm run build                                # rebuild dist/index.html (Claude prototype)
npm run build:itch                           # itch.io playtest build (needs itch.config.json — see docs/itch-playtest.md)
npm run lab                                  # balance report, 400 decks
node sim/experiment.js 3 400                 # Boost +3 baseline
node sim/experiment.js 2 400                 # E1: Boost +2
node sim/experiment.js 3 400 nostake         # E2: no staking on Boost rounds
node sim/e3.js baseline|e3a|e3b 400          # E3: two stakes per game (a = bot chooses, b = forced R1–R2)
node sim/e3-timing.js                        # E3: value of stake timing under perfect play
node sim/e4.js e3|e4a|e4b 400                # E4: Grand Finale ×3 reference, ×2, or ×3 not stacking with a stake
FINALE_MULT=2 ONLY_RULE='Grand Finale' node sim/stake-regret.js playtests/<file>.csv
```

There are no dependencies: you only need Node 18+ and bash.

## Working rules

- Change one balance variable at a time (D14).
- Every rules change gets an entry in the change log in `docs/gameplay.md`, and a re-run of the lab with the results noted.
- No purchasable, grindable or seniority-based competitive advantage (D11).
