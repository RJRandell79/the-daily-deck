// Usage: node sim/stake-regret.js playtests/<session>.csv — for each 2-stake game, the best stake placement given the player's own plays.
// Re-score each E3 game with the player's own plays, trying every placement of 2 stakes.
const E = require('../src/engine.js');
// Optional: FINALE_MULT=2 and/or FINALE_NOSTACK=1 to re-score under E4a/E4b; ONLY_RULE='Grand Finale' to filter.
if (process.env.FINALE_MULT) E.CFG.finaleMult = +process.env.FINALE_MULT;
if (process.env.FINALE_NOSTACK) E.CFG.finaleStacksWithStake = false;
const fs = require('fs');
const lines = fs.readFileSync(process.argv[2], 'utf8').trim().split('\n');
const parse = l => l.match(/"([^"]*)"/g).map(x => x.slice(1, -1));
const head = parse(lines[0].split(',').map(x => `"${x}"`).join(','));
const AT = { Pow: 0, Spe: 1, Ran: 2, Gri: 3 };
const combos = []; for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) combos.push([a, b]);
let sumAct = 0, sumBest = 0, sumAllStake = 0;
for (const l of lines.slice(1)) {
  const v = parse(l); const g = Object.fromEntries(head.map((h, i) => [h, v[i]]));
  if (g.stakeLimit !== '2') continue;
  if (process.env.ONLY_RULE && g.rule !== process.env.ONLY_RULE) continue;
  E.CFG.boost = +g.boost; const d = E.generateDeck(g.mode === 'daily' ? 'v02-daily-' + g.deck : 'v02-deck-' + g.deck);
  const plays = [0, 1, 2, 3, 4].map(i => { const m = g['R' + (i + 1)].match(/^([A-L])·(\w{3})(?:\+(\w+))?(●)?/); return { card: d.pool.findIndex(c => c.id === m[1]), attr: AT[m[2]], ability: m[3] || null, staked: !!m[4] }; });
  const score = st => plays.reduce((s, p, i) => s + E.scoreRound(d, { card: p.card, attr: p.attr, staked: st.includes(i), round: i, ability: p.ability }).pts, 0);
  const actual = score(plays.map((p, i) => p.staked ? i : -1).filter(i => i >= 0));
  let best = -1e9, bestC = null; for (const c of combos) { const s = score(c); if (s > best) { best = s; bestC = c; } }
  sumAct += actual; sumBest += best;
  console.log(`${g.deck.padEnd(7)} ${g.rule.padEnd(13)} logged ${String(g.total).padStart(4)} recomputed ${String(actual).padStart(4)} | best stake placement for your plays: ${bestC.map(i => 'R' + (i + 1)).join(' ')} = ${best} | timing cost ${best - actual}`);
}
const games = lines.length - 1;
console.log(`TOTAL actual ${sumAct}, with best stake placement ${sumBest}, timing cost ${sumBest - sumAct}`);
