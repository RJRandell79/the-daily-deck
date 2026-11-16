// ===== The Daily Deck — interface v0.2 =====
const $app = document.getElementById('app');
const $bar = document.getElementById('bar');
let S = null;
const STORE = 'dailydeck-proto-v1';
function load() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
function save(d) { try { localStorage.setItem(STORE, JSON.stringify(d)); } catch (e) { } }
CFG.boost = load().boost === 2 ? 2 : 3;
CFG.maxStakes = load().maxStakes === 2 ? 2 : null;
const stakesLeft = () => CFG.maxStakes == null ? null : CFG.maxStakes - S.stakesUsed;
const fmtRounds = a => a && a.length ? a.map(r => 'R' + r).join(', ') : 'none';

function todayStr() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function niceDate() { return new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); }
function randCode() { const ch = 'abcdefghjkmnpqrstuvwxyz23456789'; let s = ''; for (let i = 0; i < 6; i++) s += ch[Math.floor(Math.random() * ch.length)]; return s; }

function newGame(mode, code) {
  const seed = mode === 'daily' ? 'v02-daily-' + todayStr() : 'v02-deck-' + code;
  const deck = generateDeck(seed);
  S = { mode, code, seed, deck, phase: 'draft', picked: [], hand: [], round: 0, mask: 0, last: -1,
    scouted: [false, false, false, false, false], abilLeft: deck.abilities.slice(), ability: null,
    sel: null, attr: null, staked: false, log: [], total: 0, bench: null, record: null, t0: Date.now(), tDraft: null, stakesUsed: 0 };
  render(); window.scrollTo(0, 0);
}
function route() { const m = location.hash.match(/^#deck-([a-z0-9]{4,12})$/); if (m) newGame('practice', m[1]); else newGame('daily'); }

const cond = () => S.deck.condition;
const isLow = r => cond().type === 'lowball' && cond().round === r;
const blocked = a => cond().type === 'rotation' && a === S.last;
const used = i => (S.mask & (1 << i)) !== 0;
const starsPicked = () => S.picked.filter(i => S.deck.pool[i].star).length;
const boostOn = () => S.ability === 'Boost';

function knownValue(r, a) {
  const h = S.deck.house[r], c = h.clue;
  if (S.scouted[r] && h.scout.includes(a)) return { v: h.stats[a], cls: 'scout' };
  if (c.attr === a) {
    if (c.type === 'exact') return { v: c.value, cls: 'clue' };
    if (c.type === 'range') return { v: `${c.lo}–${c.hi}`, cls: 'clue' };
    if (c.type === 'strong') return { v: '▲', cls: 'clue', t: 'highest' };
    if (c.type === 'weak') return { v: '▼', cls: 'clue', t: 'lowest' };
  }
  return { v: '?', cls: '' };
}
function resultMark(l) { const sym = l.outcome === 'win' ? '✓' : l.outcome === 'tie' ? '=' : '✗'; return `<div class="res ${l.outcome}">${sym} ${l.pts > 0 ? '+' : ''}${l.pts}${l.staked ? ' ●' : ''}</div>`; }

function header() {
  return `<header>
    <div class="brand">The Daily Deck <span class="tag">prototype ${VERSION}</span></div>
    <div class="score">${S.total}<small> pts</small></div>
  </header>
  <div class="meta">${S.mode === 'daily' ? 'Today’s deck · ' + niceDate() : 'Practice deck · <code>' + S.code + '</code>'}${CFG.boost !== 3 ? ` <span class="tag exp">Boost +${CFG.boost}</span>` : ''}${CFG.maxStakes ? ` <span class="tag exp">${CFG.maxStakes} stakes</span>` : ''}</div>
  <div class="cond"><b>Today’s rule — ${cond().name}:</b> ${cond().text}</div>
  <details class="rules"><summary>How to play</summary>
    <ul>
      <li><b>Draft:</b> pick <b>8 of today’s 12</b> cards. At most <b>3 ★</b> cards (the five strongest in the pool).</li>
      <li><b>Play 5 rounds</b> against the house. Each round, tap one stat on one of your cards. It’s compared with the same stat on the house card. Each card is used once.</li>
      <li><b>Win:</b> 10 points + the margin. <b>Tie:</b> 5. <b>Lose:</b> 0.</li>
      <li><b>Stake</b> before you play: a win scores double, but a tie or loss costs 10.${CFG.maxStakes ? ` <b>You have ${CFG.maxStakes} stakes per game</b> — choose your rounds.` : ''}</li>
      <li>House cards are hidden and can reach 10; yours top out at 8. Each house card shows one clue.</li>
      <li><b>Abilities:</b> you get 3 today. Use at most <b>one per round</b>, alongside a card. Unused abilities score nothing.</li>
      <li>One rule changes every day. Everyone gets the same pool, house cards and abilities.</li>
    </ul>
  </details>`;
}

function track() {
  return `<section class="track">${S.deck.house.map((h, i) => {
    const l = S.log[i]; const cur = i === S.round && (S.phase === 'choose' || S.phase === 'switch' || S.phase === 'result');
    return `<div class="hc ${cur ? 'cur' : ''} ${l ? 'past' : ''}">
      <div class="r">R${i + 1}${isLow(i) ? ' <span class="low">LOW</span>' : ''}${cond().type === 'finale' && i === 4 ? ' <span class="x3">×3</span>' : ''}</div>
      ${l ? `<div class="hs">${h.stats.join(' ')}</div>${resultMark(l)}` : `<div class="clue">${h.clue.short}</div>${S.scouted[i] ? '<div class="sc">scouted</div>' : ''}`}
    </div>`;
  }).join('')}</section>`;
}

function abilityRow(interactive) {
  return `<section class="abrow"><span class="ablbl">Abilities</span>${S.deck.abilities.map(k => {
    const left = S.abilLeft.includes(k), on = S.ability === k;
    const usedEarlier = !left && !on;
    const dis = !interactive || usedEarlier || (S.ability === 'Scout' && !on) || (on && k === 'Scout');
    return `<button class="abchip ab-${k} ${on ? 'on' : ''} ${usedEarlier ? 'spent' : ''}" data-abil="${k}" ${dis ? 'disabled' : ''}>${k}${on ? ' ✓' : ''}</button>`;
  }).join('')}<button class="abinfo" data-info="1" aria-label="What do the abilities do?">?</button></section>`;
}

function card(c, i, opts) {
  const { interactive, selectable, picked } = opts;
  const u = used(i);
  return `<div class="card ${u ? 'used' : ''} ${S.sel === i ? 'sel' : ''} ${picked ? 'picked' : ''} ${selectable ? 'pickable' : ''}" ${selectable ? `data-pick="${i}"` : ''}>
    <div class="ch"><span class="cid">${c.id}</span>${c.star ? '<span class="star">★</span>' : ''}${picked ? '<span class="tick">✓</span>' : ''}</div>
    ${c.stats.map((v, a) => {
      if (selectable) return `<div class="st"><span>${SHORT[a]}</span><b>${v}</b></div>`;
      const dis = !interactive || u || blocked(a); const bv = boostOn() && !u ? v + CFG.boost : v;
      return `<button class="st ${S.sel === i && S.attr === a ? 'on' : ''} ${boostOn() && !u ? 'boosted' : ''}" data-card="${i}" data-attr="${a}" ${dis ? 'disabled' : ''}><span>${SHORT[a]}</span><b>${bv}</b></button>`;
    }).join('')}
  </div>`;
}

function draftView() {
  return `<section class="opp"><div class="opp-h">Draft your hand</div>
    <p class="dnote">Pick <b>8 of these 12</b> — at most <b>3 ★</b>. Check the house clues above and today’s rule. Your abilities today: <b>${S.deck.abilities.join(', ')}</b>.</p></section>
    <section class="hand pool">${S.deck.pool.map((c, i) => card(c, i, { selectable: true, picked: S.picked.includes(i) })).join('')}</section>`;
}

function oppPanel() {
  const r = S.round, h = S.deck.house[r];
  return `<section class="opp">
    <div class="opp-h">Round ${r + 1} of 5 · House card${isLow(r) ? ' · <span class="low">LOWER number wins</span>' : ''}</div>
    <div class="opp-stats">${ATTRS.map((n, a) => { const k = knownValue(r, a); return `<div class="os ${k.cls}"><span>${n}</span><b>${k.v}</b>${k.t ? `<i>${k.t}</i>` : ''}</div>`; }).join('')}</div>
    <div class="clue-full">Clue: ${h.clue.text}${S.scouted[r] ? ' · Scout revealed ' + h.scout.map(a => ATTRS[a]).join(' and ') : ''}</div>
  </section>`;
}

function handView(interactive) {
  return `<section class="hand">${S.hand.map(i => card(S.deck.pool[i], i, { interactive })).join('')}</section>
  ${cond().type === 'rotation' && S.last >= 0 && S.phase === 'choose' ? `<div class="note">Rotation: ${ATTRS[S.last]} is locked this round.</div>` : ''}`;
}

function switchPanel() {
  const r = S.round, h = S.deck.house[r], c = S.deck.pool[S.sel];
  return `<section class="opp reveal">
    <div class="opp-h">Switch! The house card is revealed — choose your stat</div>
    <div class="swgrid">${ATTRS.map((n, a) => {
      const you = c.stats[a], them = h.stats[a]; const diff = isLow(r) ? them - you : you - them;
      return `<button class="sw ${diff > 0 ? 'w' : diff < 0 ? 'l' : 't'}" data-sw="${a}" ${blocked(a) ? 'disabled' : ''}><span>${n}</span><b>${you} v ${them}</b></button>`;
    }).join('')}</div>
    ${S.staked ? '<div class="note">You staked this round.</div>' : ''}
  </section>`;
}

function resultPanel() {
  const l = S.log[S.round], h = S.deck.house[S.round], c = S.deck.pool[l.card];
  const label = { win: 'You win the round', tie: 'A tie', loss: 'The house takes it' }[l.outcome];
  return `<section class="opp result ${l.outcome}">
    <div class="opp-h">Round ${S.round + 1} result${l.ability ? ' · used ' + l.ability : ''}</div>
    <div class="opp-stats">${ATTRS.map((n, a) => `<div class="os ${a === l.attr ? 'hit' : ''}"><span>${n}</span><b>${h.stats[a]}</b></div>`).join('')}</div>
    <div class="big">${label}: <b>${c.id}</b> ${ATTRS[l.attr]} ${l.you} v ${l.them}${l.low ? ' (low wins)' : ''}</div>
    <div class="pts">${l.pts > 0 ? '+' : ''}${l.pts} points <small>${l.notes.join(' · ')}</small></div>
  </section>`;
}

function shareText() {
  const sq = { win: '🟩', tie: '🟨', loss: '🟥' }, ci = { win: '🟢', tie: '🟡', loss: '🔴' };
  const row = S.log.map(l => (l.staked ? ci : sq)[l.outcome]).join('');
  const title = S.mode === 'daily' ? `The Daily Deck · ${niceDate()}` : `The Daily Deck · practice deck ${S.code}`;
  return `${title}\n${row}  ${S.total} pts\n(circles = staked)`;
}

function doneView() {
  const b = S.bench; const pct = Math.round(100 * S.total / Math.max(1, b.best));
  const verdict = S.total >= b.best ? 'Perfect — you found the best possible line.' : S.total >= b.careful ? 'You beat the careful bot.' : S.total > b.tt ? 'Better than the Top Trumps approach.' : 'The Top Trumps approach beat you today.';
  return `<section class="sum">
    <div class="opp-h">${S.mode === 'daily' ? 'Today’s result' : 'Practice result'}</div>
    <h2>${S.total} points</h2>
    <p class="verdict">${verdict}${pct >= 0 ? ' (' + pct + '% of perfect)' : ''}</p>
    ${S.record ? `<p class="note">${S.record}</p>` : ''}
    <table class="tbl"><thead><tr><th>Rd</th><th>Play</th><th>Ability</th><th>You v House</th><th>Pts</th></tr></thead><tbody>
    ${S.log.map((l, i) => `<tr class="${l.outcome}"><td>${i + 1}</td><td>${S.deck.pool[l.card].id} · ${ATTRS[l.attr]}${l.staked ? ' ●' : ''}</td><td>${l.ability || '—'}</td><td>${l.you} v ${l.them}</td><td>${l.pts > 0 ? '+' : ''}${l.pts}</td></tr>`).join('')}
    </tbody></table>
    <p class="note">Your hand: ${S.hand.map(i => S.deck.pool[i].id + (S.deck.pool[i].star ? '★' : '')).join(' ')}</p>
    <div class="stakecmp"><b>Stakes${CFG.maxStakes ? ' (' + CFG.maxStakes + ' per game)' : ''}</b><div><span>You</span>${fmtRounds(b.youStaked)}</div><div><span>Careful bot</span>${fmtRounds(b.carefulStaked)}</div><div><span>Perfect</span>${fmtRounds(b.perfectStaked)}</div></div>
    <div class="bench">
      <div><span>Top Trumps player<small>drafts and plays the biggest numbers, uses abilities at once, never stakes</small></span><b>${b.tt}</b></div>
      <div><span>Careful bot<small>drafts against the clues, plans ahead, stakes when confident</small></span><b>${b.careful}</b></div>
      <div><span>Perfect hindsight<small>knew every house card in advance</small></span><b>${b.best}</b></div>
      <div class="you"><span>You</span><b>${S.total}</b></div>
    </div>
    <div class="share"><textarea id="sharetxt" readonly rows="3">${shareText()}</textarea><button class="btn" id="copy">Copy result</button></div>
    <div class="btns">
      <button class="btn" data-go="practice">New practice deck</button>
      <button class="btn sec" data-go="replay">Replay this deck</button>
      ${S.mode !== 'daily' ? '<button class="btn sec" data-go="daily">Today’s deck</button>' : ''}
    </div>
    <details><summary>Show the perfect line</summary><ol class="line">
      ${b.line.map(m => { const r = scoreRound(S.deck, { card: m.card, attr: m.attr, staked: m.staked, round: m.round, ability: m.ability }); return `<li>${S.deck.pool[m.card].id} · ${ATTRS[m.attr]}${m.ability ? ' + ' + m.ability : ''}${m.staked ? ' (staked)' : ''} — ${r.you} v ${r.them}, ${r.pts > 0 ? '+' : ''}${r.pts}</li>`; }).join('')}
    </ol><p class="note">With perfect knowledge only Boost changes the result, so Scout and Switch never appear here.</p></details>
    <details class="tester"><summary>Tester questions</summary><ol>
      <li>Did you understand what to do by the end of round 1?</li>
      <li>Did the draft feel like a real decision, or a chore?</li>
      <li>When did you use each ability — and why then?</li>
      <li>Did staking feel exciting, or just risky?</li>
      <li>Would you play tomorrow’s deck? Would you send your result to someone?</li>
    </ol></details>
  </section>`;
}

function labView() {
  return `<details class="lab" id="labbox"><summary>Balance lab</summary>
    <p>Plays random decks with the bots: scores by rule, plus how each ability is used and what it’s worth. “Contribution” = the careful bot’s score with the ability minus its score without it.</p>
    <div class="expbox"><b>Experiment E1 — Boost size</b><span>Applies to new games and lab runs.</span><div class="seg"><button class="${CFG.boost === 3 ? 'on' : ''}" data-boost="3">Boost +3</button><button class="${CFG.boost === 2 ? 'on' : ''}" data-boost="2">Boost +2</button></div></div>
    <div class="expbox"><b>Experiment E3 — Stakes per game</b><span>Applies to new games and lab runs. The test log records which rounds you stake.</span><div class="seg"><button class="${CFG.maxStakes == null ? 'on' : ''}" data-stakes="0">Unlimited</button><button class="${CFG.maxStakes === 2 ? 'on' : ''}" data-stakes="2">2 per game</button></div></div>
    <button class="btn sec" id="lab">Run 100 decks (Boost +${CFG.boost}, ${CFG.maxStakes ? CFG.maxStakes + ' stakes' : 'unlimited stakes'})</button><div id="labout"></div>
    <div id="mine">${myStatsHtml()}</div></details>`;
}

function myStatsHtml() {
  const h = (load().history || []); if (!h.length) return '<p>Your own ability use will appear here after you finish a game.</p>';
  const rows = {}; const key = (k, g) => k === 'Boost' ? `Boost +${g.boost || 3}` : k;
  const row = k => rows[k] = rows[k] || { dealt: 0, used: 0, rs: 0, st: 0, sw: 0 };
  h.forEach(g => { g.dealt.forEach(k => row(key(k, g)).dealt++); g.uses.forEach(u => { const a = row(key(u.ability, g)); a.used++; a.rs += u.round + 1; if (u.staked) { a.st++; if (u.outcome === 'win') a.sw++; } }); });
  const order = ['Scout', 'Switch', 'Boost +3', 'Boost +2', 'Shield'].filter(k => rows[k]);
  const pc = (a, b) => b ? Math.round(100 * a / b) + '%' : '—';
  return `<h3>Your games in this browser (${h.length})</h3><table class="tbl"><thead><tr><th>Ability</th><th>Used when dealt</th><th>Avg round</th><th>Declined to stake</th><th>Staked wins</th></tr></thead><tbody>
    ${order.map(k => { const a = rows[k]; return `<tr><td>${k}</td><td>${a.dealt ? pc(a.used, a.dealt) + ' of ' + a.dealt : '—'}</td><td>${a.used ? (a.rs / a.used).toFixed(1) : '—'}</td><td>${a.used ? pc(a.used - a.st, a.used) + ' of ' + a.used : '—'}</td><td>${a.st ? a.sw + ' / ' + a.st : '—'}</td></tr>`; }).join('')}</tbody></table>
    <p>“Declined to stake” = rounds where you used the ability but chose not to stake. The bot always follows fixed rules, so this is the human signal.</p>`;
}

function render() {
  hideTip();
  let main = header() + track();
  if (S.phase === 'draft') main += draftView();
  else if (S.phase === 'choose') main += oppPanel() + abilityRow(true) + handView(true);
  else if (S.phase === 'switch') main += switchPanel() + abilityRow(false) + handView(false);
  else if (S.phase === 'result') main += resultPanel() + abilityRow(false) + handView(false);
  else main += doneView();
  main += logView() + labView();
  const openIds = [...document.querySelectorAll('details[id]')].filter(d => d.open).map(d => d.id);
  $app.innerHTML = main;
  openIds.forEach(id => { const d = document.getElementById(id); if (d) d.open = true; });
  renderBar();
}

function renderBar() {
  if (S.phase === 'draft') {
    const n = S.picked.length, st = starsPicked();
    $bar.innerHTML = `<div class="bar-in"><div class="pick">Picked <b>${n}/8</b> · ★ <b>${st}/3</b><small>${n < 8 ? 'Tap cards to add or remove them' : 'Ready when you are'}</small></div>
      <button class="btn" id="confirm" ${n === 8 ? '' : 'disabled'}>Confirm hand</button></div>`;
  } else if (S.phase === 'choose') {
    const c = S.sel !== null ? S.deck.pool[S.sel] : null;
    const val = c ? c.stats[S.attr] + (boostOn() ? CFG.boost : 0) : null;
    const abNote = S.ability === 'Scout' ? '<small>Scout used: two more house stats revealed</small>' : S.ability ? `<small>With ${S.ability}: ${ABILITIES[S.ability]}</small>` : (c ? `<small>vs the house card’s ${ATTRS[S.attr]}</small>` : '');
    $bar.innerHTML = `<div class="bar-in">
      <div class="pick">${c ? `<b>${c.id}</b> · ${ATTRS[S.attr]} <b>${val}</b>` : 'Tap a stat on one of your cards'}${abNote}</div>
      <button class="stake ${S.staked ? 'on' : ''}" id="stake" aria-pressed="${S.staked}" ${stakesLeft() === 0 ? 'disabled' : ''}>${stakesLeft() === 0 ? 'No stakes' : S.staked ? '● Staked' : 'Stake'}<small>${stakesLeft() === null ? 'win ×2 · else −10' : stakesLeft() === 0 ? 'all used' : `${stakesLeft()} left · ×2 / −10`}</small></button>
      <button class="btn" id="play" ${c ? '' : 'disabled'}>Play</button></div>`;
  } else if (S.phase === 'result') {
    $bar.innerHTML = `<div class="bar-in"><div class="pick">Total <b>${S.total}</b> pts</div><button class="btn" id="next">${S.round < 4 ? 'Next round' : 'See results'}</button></div>`;
  } else if (S.phase === 'switch') {
    $bar.innerHTML = `<div class="bar-in"><div class="pick">Pick the stat to compare</div></div>`;
  } else $bar.innerHTML = '';
  document.body.classList.toggle('nobar', S.phase === 'done');
}

function resolve(attr) {
  const r = scoreRound(S.deck, { card: S.sel, attr, staked: S.staked, round: S.round, ability: S.ability });
  S.log.push({ card: S.sel, attr, origAttr: S.attr, staked: S.staked, ability: S.ability, ...r });
  S.total += r.pts; S.mask |= 1 << S.sel; S.last = attr; if (S.staked) S.stakesUsed++;
  if (S.ability) S.abilLeft = S.abilLeft.filter(k => k !== S.ability);
  S.phase = 'result'; render();
}

function finish() {
  const best = perfect(S.deck);
  const cb = botCareful(S.deck);
  S.bench = { best: best.pts, line: best.line, tt: botTopTrumps(S.deck).total, careful: cb.total,
    youStaked: S.log.map((l, i) => l.staked ? i + 1 : 0).filter(Boolean), carefulStaked: cb.rounds.filter(x => x.staked).map(x => x.round + 1), perfectStaked: best.line.filter(m => m.staked).map(m => m.round + 1) };
  const d = load();
  d.history = (d.history || []).concat([{ boost: CFG.boost, dealt: S.deck.abilities, uses: S.log.map((l, i) => l.ability ? { ability: l.ability, round: i, staked: l.staked, outcome: l.outcome } : null).filter(Boolean) }]).slice(-200);
  if (S.mode === 'daily') {
    d.daily = d.daily || {}; const key = VERSION + '-b' + CFG.boost + (CFG.maxStakes ? '-s' + CFG.maxStakes : '') + '-' + todayStr();
    if (d.daily[key] === undefined) { d.daily[key] = S.total; S.record = 'Recorded as today’s score. Replays won’t replace it — in the real game you’d get one attempt.'; }
    else S.record = `Replay — your recorded score for today is ${d.daily[key]}.`;
  }
  save(d);
  logGame(S);
}

function runLabUI() {
  const out = document.getElementById('labout'); const n = 100, chunk = 4; const tag = 'lab-' + Math.random().toString(36).slice(2) + '-';
  const agg = { n: 0, rules: {}, tt: 0, careful: 0, best: 0, ttBeats: 0, abil: {}, stk: { used: 0, wins: 0, byRound: [0, 0, 0, 0, 0], perfectByRound: [0, 0, 0, 0, 0], perfectUsed: 0 } };
  ABIL_KEYS.forEach(k => { agg.abil[k] = { dealt: 0, used: 0, roundSum: 0, staked: 0, stakedWins: 0, contrib: 0, flips: 0, stakeSaves: 0, gain: 0 }; });
  let done = 0; const t0 = performance.now();
  function step() {
    const part = runLab(chunk, tag + done + '-'); done += chunk;
    agg.n += part.n; agg.tt += part.tt; agg.careful += part.careful; agg.best += part.best; agg.ttBeats += part.ttBeats;
    for (const k in part.rules) { const p = part.rules[k]; const a = agg.rules[k] = agg.rules[k] || {}; for (const f in p) a[f] = (a[f] || 0) + p[f]; }
    agg.stk.used += part.stk.used; agg.stk.wins += part.stk.wins; agg.stk.perfectUsed += part.stk.perfectUsed; for (let i = 0; i < 5; i++) { agg.stk.byRound[i] += part.stk.byRound[i]; agg.stk.perfectByRound[i] += part.stk.perfectByRound[i]; }
    for (const k in part.abil) { const a = agg.abil[k], p = part.abil[k]; for (const f in a) a[f] += p[f]; }
    if (done < n) { out.innerHTML = `<p>Running… ${done}/${n}</p>`; setTimeout(step, 0); } else show();
  }
  function show() {
    const f = x => Math.round(x), p = (a, b) => b ? Math.round(100 * a / b) + '%' : '—';
    const B = agg.abil.Boost;
    out.innerHTML = `<h3>Scores by rule · Boost +${CFG.boost}</h3><table class="tbl"><thead><tr><th>Rule</th><th>Top Trumps</th><th>Careful</th><th>Perfect</th><th>Careful ÷ perfect</th></tr></thead><tbody>
      ${Object.entries(agg.rules).map(([k, v]) => `<tr><td>${k} (${v.n})</td><td>${f(v.tt / v.n)}</td><td>${f(v.careful / v.n)}</td><td>${f(v.best / v.n)}</td><td>${p(v.careful, v.best)}</td></tr>`).join('')}
      <tr class="tot"><td>All decks</td><td>${f(agg.tt / agg.n)}</td><td>${f(agg.careful / agg.n)}</td><td>${f(agg.best / agg.n)}</td><td>${p(agg.careful, agg.best)}</td></tr></tbody></table>
      <h3>Stakes · ${CFG.maxStakes ? CFG.maxStakes + ' per game' : 'unlimited'}</h3><table class="tbl"><thead><tr><th></th><th>Per game</th><th>R1</th><th>R2</th><th>R3</th><th>R4</th><th>R5</th></tr></thead><tbody>
      <tr><td>Careful</td><td>${(agg.stk.used / agg.n).toFixed(1)}</td>${agg.stk.byRound.map(x => `<td>${p(x, agg.stk.used)}</td>`).join('')}</tr>
      <tr><td>Perfect</td><td>${(agg.stk.perfectUsed / agg.n).toFixed(1)}</td>${agg.stk.perfectByRound.map(x => `<td>${p(x, agg.stk.perfectUsed)}</td>`).join('')}</tr></tbody></table>
      <p>Careful bot’s stakes won ${p(agg.stk.wins, agg.stk.used)} of the time.</p>
      <h3>Boost in detail</h3><table class="tbl"><tbody>
      <tr><td>Turns a loss or tie into a win</td><td>${p(B.flips, B.used)} of uses</td></tr>
      <tr><td>Rescues a stake that would have failed</td><td>${p(B.stakeSaves, B.used)} of uses</td></tr>
      <tr><td>Points gained in the round it’s used</td><td>${B.used ? '+' + (B.gain / B.used).toFixed(1) : '—'}</td></tr></tbody></table>
      <table class="tbl"><thead><tr><th>Rule</th><th>Boost contribution</th><th>Flip rate</th></tr></thead><tbody>
      ${Object.entries(agg.rules).map(([k, v]) => `<tr><td>${k}</td><td>${v.boostN ? '+' + (v.boostContrib / v.boostN).toFixed(1) : '—'}</td><td>${p(v.boostFlips, v.boostN)}</td></tr>`).join('')}</tbody></table>
      <p>Top Trumps matched or beat the careful bot on ${p(agg.ttBeats, agg.n)} of decks.</p>
      <h3>Abilities (careful bot)</h3><table class="tbl"><thead><tr><th>Ability</th><th>Used when dealt</th><th>Avg round</th><th>Staked wins</th><th>Contribution</th></tr></thead><tbody>
      ${ABIL_KEYS.map(k => { const a = agg.abil[k]; return `<tr><td>${k}</td><td>${p(a.used, a.dealt)}</td><td>${a.used ? (a.roundSum / a.used).toFixed(1) : '—'}</td><td>${p(a.stakedWins, a.staked)}</td><td>${a.dealt ? (a.contrib / a.dealt >= 0 ? '+' : '') + (a.contrib / a.dealt).toFixed(1) : '—'}</td></tr>`; }).join('')}
      </tbody></table><p>${agg.n} decks · ${Math.round((performance.now() - t0) / 1000)} s</p>`;
  }
  out.innerHTML = '<p>Running…</p>'; setTimeout(step, 30);
}

document.addEventListener('click', e => {
  const pk = e.target.closest('[data-pick]');
  if (pk && S.phase === 'draft') {
    const i = +pk.dataset.pick; const at = S.picked.indexOf(i);
    if (at >= 0) S.picked.splice(at, 1);
    else if (S.picked.length >= CFG.hand) { showTip('You already have 8 — tap a picked card to drop it.'); return; }
    else if (S.deck.pool[i].star && starsPicked() >= CFG.starLimit) { showTip('You can only take 3 ★ cards.'); return; }
    else S.picked.push(i);
    render(); return;
  }
  const t = e.target.closest('button'); if (!t) return;
  if (t.id === 'confirm' && S.picked.length === CFG.hand) { S.tDraft = Date.now(); S.hand = S.picked.slice().sort((a, b) => a - b); S.phase = 'choose'; render(); window.scrollTo(0, 0); return; }
  if (t.dataset.info) { showTip(S.deck.abilities.map(k => `${k}: ${ABILITIES[k]}`).join('\n')); return; }
  if (t.dataset.abil && S.phase === 'choose') {
    const k = t.dataset.abil;
    if (S.ability === k) { S.ability = null; render(); return; }
    if (k === 'Scout') { S.ability = 'Scout'; S.scouted[S.round] = true; render(); return; }
    S.ability = k; render(); return;
  }
  if (t.dataset.card !== undefined && S.phase === 'choose') { S.sel = +t.dataset.card; S.attr = +t.dataset.attr; render(); return; }
  if (t.id === 'stake') { if (stakesLeft() === 0) return; S.staked = !S.staked; renderBar(); return; }
  if (t.id === 'play' && S.sel !== null) { if (S.ability === 'Switch') { S.phase = 'switch'; render(); } else resolve(S.attr); return; }
  if (t.dataset.sw !== undefined) { resolve(+t.dataset.sw); return; }
  if (t.id === 'next') { S.round++; S.sel = null; S.attr = null; S.staked = false; S.ability = null; if (S.round >= CFG.rounds) { S.phase = 'done'; finish(); } else S.phase = 'choose'; render(); if (S.phase === 'done') window.scrollTo(0, 0); return; }
  if (t.id === 'copy') { const txt = shareText(); const ta = document.getElementById('sharetxt'); Promise.resolve().then(() => navigator.clipboard.writeText(txt)).then(() => { t.textContent = 'Copied ✓'; }).catch(() => { ta.select(); t.textContent = 'Select & copy above'; }); return; }
  if (t.dataset.go === 'practice') { location.hash = 'deck-' + randCode(); return; }
  if (t.dataset.go === 'replay') { newGame(S.mode, S.code); return; }
  if (t.dataset.go === 'daily') { location.hash = 'daily'; return; }
  if (t.id === 'lab') { runLabUI(); return; }
  if (t.dataset.stakes !== undefined) { CFG.maxStakes = +t.dataset.stakes || null; const d = load(); d.maxStakes = CFG.maxStakes; save(d); newGame(S.mode, S.code); document.getElementById('labbox').open = true; showTip(CFG.maxStakes ? `Now ${CFG.maxStakes} stakes per game. New game started.` : 'Stakes are unlimited again. New game started.'); return; }
  if (t.dataset.boost) { CFG.boost = +t.dataset.boost; const d = load(); d.boost = CFG.boost; save(d); newGame(S.mode, S.code); document.getElementById('labbox').open = true; showTip(`Boost is now +${CFG.boost}. New game started.`); return; }
});

let tipTimer;
function hideTip() { const el = document.getElementById('tip'); if (el) el.classList.remove('show'); clearTimeout(tipTimer); }
document.addEventListener('pointerdown', e => { if (!e.target.closest('[data-ab],[data-info],[data-pick],[data-boost],[data-stakes]')) hideTip(); }, true);
function showTip(msg) { const el = document.getElementById('tip'); el.textContent = msg; el.classList.add('show'); clearTimeout(tipTimer); tipTimer = setTimeout(() => el.classList.remove('show'), 3600); }

window.addEventListener('hashchange', route);
route();
