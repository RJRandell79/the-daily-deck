// Candidate ruleset v1 (D27): 2 stakes, Grand Finale x2, Boost +2, abilities apply to the round played.
// Usage: node sim/candidate.js [decks] — scores by daily rule for the bots, plus stake and ability metrics.
const E = require('../src/engine.js');
const n = +process.argv[2] || 400;
E.CFG.maxStakes = 2; E.CFG.stakePolicy = 'careful'; E.CFG.finaleMult = 2; E.CFG.boost = 2;
const L = E.runLab(n, 't');
const pc = (a, b) => b ? Math.round(100 * a / b) + '%' : '—', f = x => Math.round(x);
console.log(`Candidate ruleset v1, ${n} decks`);
console.log('Rule | decks | Top Trumps | Careful | Perfect | Careful/Perfect | TT/Perfect');
for (const [k, R] of Object.entries(L.rules)) console.log(`${k} | ${R.n} | ${f(R.tt / R.n)} | ${f(R.careful / R.n)} | ${f(R.best / R.n)} | ${pc(R.careful, R.best)} | ${pc(R.tt, R.best)}`);
console.log(`All | ${n} | ${f(L.tt / n)} | ${f(L.careful / n)} | ${f(L.best / n)} | ${pc(L.careful, L.best)} | ${pc(L.tt, L.best)}`);
console.log(`Careful stakes won ${pc(L.stk.wins, L.stk.used)}; careful stakes by round ${L.stk.byRound.map(x => pc(x, L.stk.used)).join(' ')}; perfect ${L.stk.perfectByRound.map(x => pc(x, L.stk.perfectUsed)).join(' ')}`);
for (const [k, A] of Object.entries(L.abil)) console.log(`${k}: contribution ${(A.contrib / A.dealt).toFixed(1)}, avg round ${(A.roundSum / Math.max(1, A.used)).toFixed(1)}, staked when used ${pc(A.staked, A.used)}`);
