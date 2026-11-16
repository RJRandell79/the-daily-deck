// Experiment E4 — Grand Finale under the 2-stake rules. Usage: node sim/e4.js <e3|e4a|e4b> [decks]
//   e3  : current Finale (×3, stacks with a stake) — reference
//   e4a : Finale ×2 (stacks with a stake)
//   e4b : Finale ×3, but not applied to a staked round 5
const E = require('../src/engine.js');
const variant = process.argv[2] || 'e3', n = +process.argv[3] || 400;
E.CFG.maxStakes = 2; E.CFG.forceRule = 'finale';
if (variant === 'e4a') E.CFG.finaleMult = 2;
if (variant === 'e4b') E.CFG.finaleStacksWithStake = false;
const sd = a => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };
const careful = [], perfectS = [], tt = [], r5careful = [], r5perfect = [], forced = []; let cStakes = 0, cWins = 0, cR5 = 0, pR5 = 0, r5Swing = [];
for (let i = 0; i < n; i++) {
  const d = E.generateDeck('f' + i);
  const o = { allowed: E.ALL, boostAvail: d.abilities.includes('Boost'), starLimit: E.CFG.starLimit, maxStakes: 2 };
  const pf = E.solve(d, E.START, o); const pfEarly = E.solve(d, E.START, { ...o, stakeRounds: [0, 1] });
  const cb = E.botCareful(d);
  careful.push(cb.total); perfectS.push(pf.pts); tt.push(E.botTopTrumps(d).total); forced.push(pfEarly.pts);
  for (const x of cb.rounds) if (x.staked) { cStakes++; if (x.outcome === 'win') cWins++; if (x.round === 4) cR5++; }
  r5careful.push(cb.rounds[4].pts);
  if (pf.line[4].staked) pR5++;
  // swing of a staked R5 for the careful bot's actual R5 play: staked win vs staked loss/tie
  const m = cb.rounds[4];
  const win = E.scoreRound(d, { card: 0, attr: 0, staked: true, round: 4, ability: null }); // placeholder not used
}
const avg = a => a.reduce((x, y) => x + y, 0) / a.length, f = x => x.toFixed(1), pc = (a, b) => Math.round(100 * a / b) + '%';
console.log(JSON.stringify({ variant, n,
  careful: f(avg(careful)), perfect: f(avg(perfectS)), topTrumps: f(avg(tt)),
  carefulVsPerfect: pc(avg(careful), avg(perfectS)), ttVsPerfect: pc(avg(tt), avg(perfectS)),
  carefulSpreadSD: f(sd(careful)), carefulR5PointsSD: f(sd(r5careful)), carefulR5avg: f(avg(r5careful)),
  carefulStakeSuccess: pc(cWins, cStakes), carefulStakesInR5: pc(cR5, cStakes), perfectStakesR5: pc(pR5, n),
  timingValue: f(avg(perfectS) - avg(forced))
}, null, 1));
