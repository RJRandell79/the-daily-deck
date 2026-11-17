// Usage: node sim/boost-summary.js playtests/*.csv
// For every logged round where Boost was used: did it turn a loss/tie into a win (flip), was it staked, did it win?
// Grouped by Boost size and stake limit. Re-scores each round with and without Boost using the logged deck.
const E = require('../src/engine.js');
const fs = require('fs');
const parse = l => l.match(/"([^"]*)"/g).map(x => x.slice(1, -1));
const AT = { Pow: 0, Spe: 1, Ran: 2, Gri: 3 };
const G = {};
for (const f of process.argv.slice(2)) {
  const L = fs.readFileSync(f, 'utf8').trim().split('\n'); const head = L[0].split(',');
  for (const l of L.slice(1)) {
    const v = parse(l); const g = Object.fromEntries(head.map((h, i) => [h, v[i]]));
    E.CFG.boost = +g.boost; E.CFG.maxStakes = g.stakeLimit === '2' ? 2 : null;
    E.CFG.finaleMult = g.rule === 'Grand Finale' ? (+g.finaleMult || 3) : 3;
    const d = E.generateDeck(g.mode === 'daily' ? 'v02-daily-' + g.deck : 'v02-deck-' + g.deck);
    const key = `Boost +${g.boost} · ${g.stakeLimit === '2' ? '2 stakes' : 'unlimited'}`;
    const A = G[key] = G[key] || { games: 0, dealt: 0, used: 0, staked: 0, stakedWon: 0, flips: 0, gain: 0, rounds: [] };
    A.games++; if (g.abilities.split(' ').includes('Boost')) A.dealt++;
    [1, 2, 3, 4, 5].forEach(i => {
      const m = g['R' + i].match(/^([A-L])·(\w{3})(?:\+(\w+))?(●)?/); if (!m || m[3] !== 'Boost') return;
      const card = d.pool.findIndex(c => c.id === m[1]), attr = AT[m[2]], staked = !!m[4];
      const withB = E.scoreRound(d, { card, attr, staked, round: i - 1, ability: 'Boost' });
      const without = E.scoreRound(d, { card, attr, staked, round: i - 1, ability: null });
      A.used++; A.rounds.push(i); if (staked) { A.staked++; if (withB.outcome === 'win') A.stakedWon++; }
      if (withB.outcome === 'win' && without.outcome !== 'win') A.flips++;
      A.gain += withB.pts - without.pts;
    });
  }
}
const pc = (a, b) => b ? Math.round(100 * a / b) + '%' : '—';
for (const [k, A] of Object.entries(G)) console.log(`${k}: games ${A.games}, Boost dealt ${A.dealt}, used ${A.used} (${pc(A.used, A.dealt)}) | staked ${pc(A.staked, A.used)} (declined ${pc(A.used - A.staked, A.used)}) | staked wins ${pc(A.stakedWon, A.staked)} | flipped a loss/tie to a win ${pc(A.flips, A.used)} | avg points added by Boost ${A.used ? (A.gain / A.used).toFixed(1) : '—'} | rounds used ${A.rounds.join(' ')}`);
