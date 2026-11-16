// Experiment E3 — limited stakes. Usage: node sim/e3.js <baseline|e3a|e3b> [decks]
const E = require('../src/engine.js');
const variant = process.argv[2] || 'baseline', n = +process.argv[3] || 400;
if (variant === 'e3a') { E.CFG.maxStakes = 2; E.CFG.stakePolicy = 'careful'; }
if (variant === 'e3b') { E.CFG.maxStakes = 2; E.CFG.stakePolicy = 'first'; }
const t0 = Date.now(); const L = E.runLab(n, 't');
const pc = (a, b) => b ? Math.round(100 * a / b) + '%' : '—', f = x => x.toFixed(1);
const out = { variant, n, secs: Math.round((Date.now() - t0) / 1000),
  avg: { careful: f(L.careful / n), perfect: f(L.best / n), topTrumps: f(L.tt / n) },
  carefulVsPerfect: pc(L.careful, L.best), ttVsPerfect: pc(L.tt, L.best),
  stakes: { perGame: f(L.stk.used / n), successRate: pc(L.stk.wins, L.stk.used), gamesUsingAll: E.CFG.maxStakes ? pc(L.stk.gamesAllUsed, n) : 'n/a',
    carefulByRound: L.stk.byRound.map(x => pc(x, L.stk.used)).join(' '), successByRound: L.stk.winsByRound.map((w, i) => pc(w, L.stk.byRound[i])).join(' '),
    perfectPerGame: f(L.stk.perfectUsed / n), perfectByRound: L.stk.perfectByRound.map(x => pc(x, L.stk.perfectUsed)).join(' ') },
  rules: Object.fromEntries(Object.entries(L.rules).map(([k, R]) => [k, { n: R.n, careful: f(R.careful / R.n), perfect: f(R.best / R.n), cVsP: pc(R.careful, R.best), ttVsP: pc(R.tt, R.best) }])),
  abilities: Object.fromEntries(Object.entries(L.abil).map(([k, A]) => [k, { used: pc(A.used, A.dealt), avgRound: f(A.roundSum / Math.max(1, A.used)), stakedWhenUsed: pc(A.staked, A.used), stakedWins: pc(A.stakedWins, A.staked), contribution: f(A.contrib / Math.max(1, A.dealt)) }]))
};
console.log(JSON.stringify(out, null, 1));
