// ===== The Daily Deck — game engine v0.2 (no DOM) =====
const VERSION = 'v0.2.4';
const ATTRS = ['Power', 'Speed', 'Range', 'Grit'];
const SHORT = ['PWR', 'SPD', 'RNG', 'GRT'];
const ABIL_KEYS = ['Scout', 'Switch', 'Boost', 'Shield'];
const ABILITIES = {
  Scout: 'Play first: reveals two more stats of this round’s house card before you choose.',
  Switch: 'After the house card is revealed, you choose which stat to compare.',
  get Boost() { return `+${CFG.boost} to every stat of the card you play this round.`; },
  Shield: 'If you lose or tie this round while staked, you lose nothing.'
};
const CFG = {
  rounds: 5, boostCap: null, boostNoStake: false, maxStakes: null, stakePolicy: 'careful', finaleMult: 3, finaleStacksWithStake: true, forceRule: null, pool: 12, hand: 8, starCount: 5, starLimit: 3, abilitiesDealt: 3,
  win: 10, tie: 5, stakeLoss: 10, boost: 3, stakeThreshold: 2,
  card: { total: [18, 22], min: 1, max: 8 },
  house: { total: [28, 34], min: 4, max: 10 }
};

function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function makeRng(seed) {
  const f = mulberry32(hashStr(seed));
  return {
    f, int: (a, b) => a + Math.floor(f() * (b - a + 1)),
    pick: arr => arr[Math.floor(f() * arr.length)],
    shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
  };
}
function genStats(rng, range, min, max) {
  for (let t = 0; t < 5000; t++) {
    const s = [0, 0, 0, 0].map(() => rng.int(min, max)); const sum = s[0] + s[1] + s[2] + s[3];
    if (sum >= range[0] && sum <= range[1]) return s;
  }
  return [6, 6, 6, 6];
}
function bitCount(m) { let c = 0; while (m) { m &= m - 1; c++; } return c; }

// ---- Card pricing: standalone value = average best-stat result against a fixed sample of house cards ----
let PRICE_SAMPLE = null;
function priceSample() {
  if (!PRICE_SAMPLE) { const rng = makeRng('price-sample'); PRICE_SAMPLE = []; for (let i = 0; i < 400; i++) PRICE_SAMPLE.push(genStats(rng, CFG.house.total, CFG.house.min, CFG.house.max)); }
  return PRICE_SAMPLE;
}
function standaloneValue(stats) {
  let tot = 0;
  for (const h of priceSample()) { let best = 0; for (let a = 0; a < 4; a++) { const d = stats[a] - h[a]; const p = d > 0 ? CFG.win + d : d === 0 ? CFG.tie : 0; if (p > best) best = p; } tot += best; }
  return Math.round(10 * tot / priceSample().length) / 10;
}

function uniqueIdx(stats, fn) { const v = fn(...stats); const idx = []; stats.forEach((x, i) => { if (x === v) idx.push(i); }); return idx.length === 1 ? idx[0] : -1; }
function makeClue(rng, stats) {
  const types = rng.shuffle(['strong', 'weak', 'range', 'total', 'exact', 'strong', 'range']);
  for (const t of types) {
    if (t === 'strong') { const i = uniqueIdx(stats, Math.max); if (i >= 0) return { type: t, attr: i, text: `Strongest stat is ${ATTRS[i]}`, short: `▲ ${SHORT[i]}` }; }
    if (t === 'weak') { const i = uniqueIdx(stats, Math.min); if (i >= 0) return { type: t, attr: i, text: `Weakest stat is ${ATTRS[i]}`, short: `▼ ${SHORT[i]}` }; }
    if (t === 'range') {
      const i = rng.int(0, 3), v = stats[i]; let lo = Math.max(CFG.house.min, v - rng.int(0, 2)), hi = lo + 2;
      if (hi > CFG.house.max) { hi = CFG.house.max; lo = hi - 2; }
      return { type: t, attr: i, lo, hi, text: `${ATTRS[i]} is between ${lo} and ${hi}`, short: `${SHORT[i]} ${lo}–${hi}` };
    }
    if (t === 'total') { const s = stats.reduce((a, b) => a + b, 0); return { type: t, attr: -1, total: s, text: `Stats add up to ${s}`, short: `Σ ${s}` }; }
    if (t === 'exact') { const i = rng.int(0, 3); return { type: t, attr: i, value: stats[i], text: `${ATTRS[i]} is exactly ${stats[i]}`, short: `${SHORT[i]} = ${stats[i]}` }; }
  }
}
function makeCondition(rng) {
  const t = rng.pick(['double', 'rotation', 'finale', 'lowball', 'tiesWin']);
  if (t === 'double') { const a = rng.int(0, 3); return { type: t, attr: a, name: `${ATTRS[a]} Surge`, text: `Rounds won on ${ATTRS[a]} score double.` }; }
  if (t === 'rotation') return { type: t, name: 'Rotation', text: 'You can’t compare the same stat in two rounds running.' };
  if (t === 'finale') return { type: t, name: 'Grand Finale', text: CFG.finaleStacksWithStake ? `Round 5 scores ×${CFG.finaleMult} — good or bad.` : `Round 5 scores ×${CFG.finaleMult} — but not if you stake it.` };
  if (t === 'lowball') { const r = rng.int(1, 3); return { type: t, round: r, name: 'Low Ball', text: `In round ${r + 1}, the LOWER number wins.` }; }
  return { type: t, name: 'Underdog', text: 'Ties count as wins (with a margin of 0).' };
}

function generateDeck(seed) {
  const rng = makeRng(seed);
  const pool = [];
  for (let i = 0; i < CFG.pool; i++) { const stats = genStats(rng, CFG.card.total, CFG.card.min, CFG.card.max); pool.push({ id: 'ABCDEFGHIJKL'[i], stats, value: standaloneValue(stats), star: false }); }
  pool.map((c, i) => [c.value, i]).sort((a, b) => b[0] - a[0]).slice(0, CFG.starCount).forEach(([, i]) => { pool[i].star = true; });
  const abilities = rng.shuffle(ABIL_KEYS.slice()).slice(0, CFG.abilitiesDealt).sort((a, b) => ABIL_KEYS.indexOf(a) - ABIL_KEYS.indexOf(b));
  const house = [];
  for (let i = 0; i < CFG.rounds; i++) {
    const stats = genStats(rng, CFG.house.total, CFG.house.min, CFG.house.max); const clue = makeClue(rng, stats);
    const others = rng.shuffle([0, 1, 2, 3].filter(a => a !== clue.attr));
    house.push({ stats, clue, scout: others.slice(0, 2).sort() });
  }
  let starMask = 0; pool.forEach((c, i) => { if (c.star) starMask |= 1 << i; });
  let condition = makeCondition(rng);
  if (CFG.forceRule === 'finale') condition = { type: 'finale', name: 'Grand Finale', text: `Round 5 scores ×${CFG.finaleMult}.` };
  return { seed, pool, starMask, abilities, house, condition };
}

// Score one round. ability: null | 'Scout' | 'Switch' | 'Boost' | 'Shield'. Switch is handled by the caller picking attr.
function scoreRound(deck, { card, attr, staked, round, ability }, houseStats) {
  if (ability === 'Boost' && CFG.boostNoStake) staked = false;
  const c = deck.pool[card], cond = deck.condition;
  const them = (houseStats || deck.house[round].stats)[attr];
  const raw = c.stats[attr] + (ability === 'Boost' ? CFG.boost : 0); const you = ability === 'Boost' && CFG.boostCap ? Math.min(raw, Math.max(CFG.boostCap, c.stats[attr])) : raw;
  const low = cond.type === 'lowball' && cond.round === round;
  const diff = low ? them - you : you - them;
  const outcome = diff > 0 ? 'win' : diff < 0 ? 'loss' : (cond.type === 'tiesWin' ? 'win' : 'tie');
  let pts; const notes = [];
  if (outcome === 'win') { pts = CFG.win + diff; notes.push(`${CFG.win} + ${diff} margin`); if (staked) { pts *= 2; notes.push('stake ×2'); } }
  else if (staked) { if (ability === 'Shield') { pts = 0; notes.push('Shield saved the stake'); } else { pts = -CFG.stakeLoss; notes.push('stake lost'); } }
  else pts = outcome === 'tie' ? CFG.tie : 0;
  if (cond.type === 'double' && attr === cond.attr && pts > 0) { pts *= 2; notes.push(`${ATTRS[attr]} Surge ×2`); }
  if (cond.type === 'finale' && round === CFG.rounds - 1 && pts !== 0) {
    if (staked && !CFG.finaleStacksWithStake) notes.push('Finale multiplier not applied to a stake');
    else { pts *= CFG.finaleMult; notes.push(`Finale ×${CFG.finaleMult}`); }
  }
  return { you, them, diff, outcome, pts, notes, low };
}

// Exhaustive search. allowed = bitmask of playable cards. boostAvail: whether Boost may still be used.
// With perfect information only Boost changes outcomes (Scout/Switch add information you already have; Shield never matters).
function solve(deck, start, { allowed, stake = true, boostAvail = false, houseOverride = null, starLimit = 99, maxStakes = Infinity, stakeRounds = null } = {}) {
  const memo = new Map(); const rot = deck.condition.type === 'rotation';
  const keyOf = (round, mask, last, b, su) => (((round * 4096 + mask) * 5 + (last + 1)) * 2 + (b ? 1 : 0)) * 8 + Math.min(su, 7);
  function rec(round, mask, last, b, su) {
    if (round === CFG.rounds) return { pts: 0 };
    if (maxStakes === Infinity) su = 0; // the count only matters when stakes are limited
    const key = keyOf(round, mask, last, b, su); const m = memo.get(key); if (m) return m;
    const stakes = stake && su < maxStakes && (!stakeRounds || stakeRounds.includes(round)) ? [false, true] : [false];
    let best = { pts: -Infinity };
    const starsUsed = bitCount(mask & deck.starMask);
    for (let c = 0; c < CFG.pool; c++) {
      if (!(allowed & (1 << c)) || (mask & (1 << c))) continue;
      if ((deck.starMask & (1 << c)) && starsUsed >= starLimit) continue;
      for (let a = 0; a < 4; a++) {
        if (rot && a === last) continue;
        for (const ab of (b ? [null, 'Boost'] : [null])) for (const st of stakes) {
          const r = scoreRound(deck, { card: c, attr: a, staked: st, round, ability: ab }, houseOverride && houseOverride[round]);
          const tot = r.pts + rec(round + 1, mask | (1 << c), a, b && ab !== 'Boost', su + (st ? 1 : 0)).pts;
          if (tot > best.pts) best = { pts: tot, move: { card: c, attr: a, staked: st, ability: ab } };
        }
      }
    }
    memo.set(key, best); return best;
  }
  const su0 = start.su || 0;
  const res = rec(start.round, start.mask, start.last, boostAvail, su0);
  const line = []; let s = { ...start }, b = boostAvail, su = su0;
  while (s.round < CFG.rounds) {
    const mv = memo.get(keyOf(s.round, s.mask, s.last, b, maxStakes === Infinity ? 0 : su)).move; line.push({ ...mv, round: s.round });
    if (mv.ability === 'Boost') b = false; if (mv.staked) su++;
    s = { round: s.round + 1, mask: s.mask | (1 << mv.card), last: mv.attr };
  }
  return { pts: res.pts, line };
}
const START = { round: 0, mask: 0, last: -1 };
const ALL = (1 << CFG.pool) - 1;
function perfect(deck) { return solve(deck, START, { allowed: ALL, boostAvail: deck.abilities.includes('Boost'), starLimit: CFG.starLimit, maxStakes: CFG.maxStakes ?? Infinity }); }

// What a player can infer about a house card from its clue (+ Scout).
function estimate(deck, r, scouted) {
  const h = deck.house[r], c = h.clue; const avg = (CFG.house.total[0] + CFG.house.total[1]) / 8;
  let e = [avg, avg, avg, avg];
  if (c.type === 'strong') e = e.map((_, i) => i === c.attr ? 8.5 : avg - 0.7);
  if (c.type === 'weak') e = e.map((_, i) => i === c.attr ? 3.5 : avg + 0.7);
  if (c.type === 'range') e[c.attr] = (c.lo + c.hi) / 2;
  if (c.type === 'total') e = e.map(() => c.total / 4);
  if (c.type === 'exact') e[c.attr] = c.value;
  if (scouted) h.scout.forEach(i => { e[i] = h.stats[i]; });
  return e;
}
function maskOf(idx) { return idx.reduce((m, i) => m | (1 << i), 0); }
function legalHand(deck, idx) { return idx.length === CFG.hand && bitCount(maskOf(idx) & deck.starMask) <= CFG.starLimit; }

// ---- Bot 1: "Top Trumps player" — drafts the biggest numbers, plays its biggest number, uses abilities straight away, never stakes ----
function botTopTrumps(deck) {
  const order = deck.pool.map((c, i) => [Math.max(...c.stats), c.value, i]).sort((a, b) => b[0] - a[0] || b[1] - a[1]);
  const hand = []; let stars = 0;
  for (const [, , i] of order) { if (hand.length === CFG.hand) break; const st = deck.pool[i].star; if (st && stars >= CFG.starLimit) continue; hand.push(i); if (st) stars++; }
  let mask = 0, last = -1, total = 0; const abil = deck.abilities.slice(); const rot = deck.condition.type === 'rotation'; const uses = [];
  for (let r = 0; r < CFG.rounds; r++) {
    const ability = abil.shift() || null;
    let bc = -1, ba = -1, bv = -1;
    for (const c of hand) { if (mask & (1 << c)) continue; for (let a = 0; a < 4; a++) { if (rot && a === last) continue; const v = deck.pool[c].stats[a]; if (v > bv) { bv = v; bc = c; ba = a; } } }
    if (ability === 'Switch') ba = bestSwitchAttr(deck, bc, r, last, null);
    const res = scoreRound(deck, { card: bc, attr: ba, staked: false, round: r, ability });
    total += res.pts; if (ability) uses.push({ ability, round: r, staked: false, outcome: res.outcome, pts: res.pts });
    mask |= 1 << bc; last = ba;
  }
  return { total, hand, uses };
}
function bestSwitchAttr(deck, card, r, last, ability) {
  let bestA = -1, bestP = -Infinity;
  for (let a = 0; a < 4; a++) { if (deck.condition.type === 'rotation' && a === last) continue; const p = scoreRound(deck, { card, attr: a, staked: false, round: r, ability }).pts; if (p > bestP) { bestP = p; bestA = a; } }
  return bestA;
}

// ---- Bot 2: "Careful player" — drafts by planning against the clues, re-plans every round, uses abilities with judgement ----
function carefulDraft(deck) {
  const est = deck.house.map((_, i) => estimate(deck, i, false));
  const plan = solve(deck, START, { allowed: ALL, stake: false, houseOverride: est, starLimit: CFG.starLimit });
  const hand = plan.line.map(m => m.card); let stars = bitCount(maskOf(hand) & deck.starMask);
  const rest = deck.pool.map((c, i) => [c.value, i]).filter(([, i]) => !hand.includes(i)).sort((a, b) => b[0] - a[0]);
  for (const [, i] of rest) { if (hand.length === CFG.hand) break; const st = deck.pool[i].star; if (st && stars >= CFG.starLimit) continue; hand.push(i); if (st) stars++; }
  return hand;
}
function botCareful(deck, opts = {}) {
  const abilities = (opts.abilities || deck.abilities).slice();
  const hand = opts.hand || carefulDraft(deck);
  const allowed = maskOf(hand);
  let s = { ...START }; const scouted = [false, false, false, false, false]; let total = 0; const uses = []; const rounds = [];
  const limited = CFG.maxStakes != null; let su = 0;
  const has = a => abilities.includes(a); const useUp = a => abilities.splice(abilities.indexOf(a), 1);
  for (let r = 0; r < CFG.rounds; r++) {
    const plan = () => { const est = deck.house.map((_, i) => estimate(deck, i, scouted[i])); const p = solve(deck, { ...s, su }, limited ? { allowed, stake: true, houseOverride: est, maxStakes: CFG.maxStakes } : { allowed, stake: false, houseOverride: est }); const mv = p.line[0]; return { mv, est, e: scoreRound(deck, { card: mv.card, attr: mv.attr, staked: false, round: r, ability: null }, est[r]) }; };
    let { mv, est, e } = plan();
    const left = CFG.rounds - r, force = abilities.length >= left;
    const clueOnAttr = deck.house[r].clue.type === 'exact' && deck.house[r].clue.attr === mv.attr;
    let ability = null, attr = mv.attr, staked;
    if (has('Scout') && ((!clueOnAttr && e.diff < 3) || force)) {
      ability = 'Scout'; useUp('Scout'); scouted[r] = true; ({ mv, est, e } = plan()); attr = mv.attr; staked = e.diff >= CFG.stakeThreshold;
    } else if (has('Switch') && (e.diff < 1 || force)) {
      ability = 'Switch'; useUp('Switch'); attr = bestSwitchAttr(deck, mv.card, r, s.last, null); staked = true;
    } else if (has('Boost') && ((e.diff >= -3 && e.diff < CFG.stakeThreshold) || force)) {
      ability = 'Boost'; useUp('Boost'); staked = !CFG.boostNoStake && e.diff + CFG.boost >= CFG.stakeThreshold;
    } else if (has('Shield') && ((e.diff >= 0 && e.diff < CFG.stakeThreshold) || force)) {
      ability = 'Shield'; useUp('Shield'); staked = true;
    } else staked = e.diff >= CFG.stakeThreshold;
    if (limited) {
      const stakesLeft = CFG.maxStakes - su;
      if (CFG.stakePolicy === 'first') staked = stakesLeft > 0; // E3b control: spend them immediately
      else staked = stakesLeft > 0 && staked && (mv.staked || stakesLeft >= left || ability === 'Switch' || ability === 'Shield');
    }
    if (staked) su++;
    const res = scoreRound(deck, { card: mv.card, attr, staked, round: r, ability });
    total += res.pts; rounds.push({ round: r, staked, outcome: res.outcome, ability, pts: res.pts });
    if (ability) {
      const u = { ability, round: r, staked, outcome: res.outcome, pts: res.pts };
      if (ability === 'Boost') { const base = scoreRound(deck, { card: mv.card, attr, staked, round: r, ability: null }); u.flip = base.outcome !== 'win' && res.outcome === 'win'; u.gain = res.pts - base.pts; }
      uses.push(u);
    }
    s = { round: r + 1, mask: s.mask | (1 << mv.card), last: attr };
  }
  return { total, hand, uses, rounds };
}

// ---- Balance lab: aggregates over many decks ----
function runLab(n, seedPrefix) {
  const out = { n, rules: {}, tt: 0, careful: 0, best: 0, ttBeats: 0, abil: {}, stk: { used: 0, wins: 0, byRound: [0, 0, 0, 0, 0], winsByRound: [0, 0, 0, 0, 0], perfectByRound: [0, 0, 0, 0, 0], perfectUsed: 0, gamesAllUsed: 0 } };
  ABIL_KEYS.forEach(k => { out.abil[k] = { dealt: 0, used: 0, roundSum: 0, staked: 0, stakedWins: 0, contrib: 0, flips: 0, stakeSaves: 0, gain: 0 }; });
  for (let i = 0; i < n; i++) {
    const d = generateDeck(seedPrefix + i);
    const pf = perfect(d), best = pf.pts, tt = botTopTrumps(d), cb = botCareful(d);
    let usedHere = 0; for (const x of cb.rounds) if (x.staked) { usedHere++; out.stk.used++; out.stk.byRound[x.round]++; if (x.outcome === 'win') { out.stk.wins++; out.stk.winsByRound[x.round]++; } }
    if (CFG.maxStakes != null && usedHere >= CFG.maxStakes) out.stk.gamesAllUsed++;
    for (const m of pf.line) if (m.staked) { out.stk.perfectUsed++; out.stk.perfectByRound[m.round]++; }
    out.tt += tt.total; out.careful += cb.total; out.best += best; if (tt.total >= cb.total) out.ttBeats++;
    const rk = d.condition.type === 'double' ? 'Stat Surge' : d.condition.name;
    const R = out.rules[rk] = out.rules[rk] || { n: 0, tt: 0, careful: 0, best: 0, ratioSum: 0, boostN: 0, boostContrib: 0, boostFlips: 0 }; R.n++; R.tt += tt.total; R.careful += cb.total; R.best += best; R.ratioSum += best > 0 ? cb.total / best : 0;
    for (const k of d.abilities) {
      const A = out.abil[k]; A.dealt++;
      const u = cb.uses.find(x => x.ability === k);
      if (u) { A.used++; A.roundSum += u.round + 1; if (u.staked) { A.staked++; if (u.outcome === 'win') A.stakedWins++; } if (u.flip) { A.flips++; if (u.staked) A.stakeSaves++; } if (u.gain !== undefined) A.gain += u.gain; }
      const c = cb.total - botCareful(d, { hand: cb.hand, abilities: d.abilities.filter(x => x !== k) }).total;
      A.contrib += c;
      if (k === 'Boost') { R.boostN++; R.boostContrib += c; if (u && u.flip) R.boostFlips++; }
    }
  }
  return out;
}

if (typeof module !== 'undefined') module.exports = { VERSION, ATTRS, SHORT, ABIL_KEYS, ABILITIES, CFG, generateDeck, scoreRound, solve, START, ALL, perfect, estimate, botTopTrumps, botCareful, carefulDraft, runLab, legalHand, maskOf, bitCount, bestSwitchAttr };
