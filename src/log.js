// ===== The Daily Deck — test log (local + shared database) =====
// Every finished game is saved in full: on this device always, and to the artifact's
// shared database when the viewer is allowed to write there.
const GAMES_KEY = 'dailydeck-games-v1';
const Cloud = { db: null, user: null, uid: null, status: 'connecting', owner: false, all: null, allStatus: '' };

function localGames() { try { return JSON.parse(localStorage.getItem(GAMES_KEY)) || []; } catch (e) { return []; } }
function saveLocalGames(g) { try { localStorage.setItem(GAMES_KEY, JSON.stringify(g.slice(-300))); } catch (e) { } }
function gameId() { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }

function buildRecord(S) {
  const now = new Date();
  return {
    id: gameId(), v: VERSION, boost: CFG.boost, mode: S.mode, code: S.code || null, seed: S.seed,
    day: todayStr(), playedAt: now.toISOString(), replay: S.mode === 'daily' && !!(S.record && S.record.startsWith('Replay')),
    rule: S.deck.condition.name, ruleType: S.deck.condition.type, abilities: S.deck.abilities.slice(),
    hand: S.hand.map(i => S.deck.pool[i].id), stars: S.hand.filter(i => S.deck.pool[i].star).length,
    rounds: S.log.map((l, i) => ({ r: i + 1, card: S.deck.pool[l.card].id, attr: ATTRS[l.attr], ability: l.ability || null, staked: !!l.staked, you: l.you, them: l.them, outcome: l.outcome, pts: l.pts })),
    total: S.total, perfect: S.bench.best, careful: S.bench.careful, topTrumps: S.bench.tt,
    pctPerfect: S.bench.best > 0 ? Math.round(100 * S.total / S.bench.best) : null,
    draftSecs: S.tDraft ? Math.round((S.tDraft - S.t0) / 1000) : null,
    gameSecs: Math.round((Date.now() - S.t0) / 1000),
    synced: false
  };
}

async function cloudWrite(rec) {
  const body = Object.assign({}, rec); delete body.synced;
  await Cloud.db.doc(`players/${Cloud.uid}/games/${rec.id}`).set(body);
}
async function cloudTouchPlayer(count) {
  await Cloud.db.doc(`players/${Cloud.uid}`).set({ lastPlayed: new Date().toISOString(), lastVersion: VERSION, gamesOnDevice: count });
}
function markReadOnly(e) {
  if (e && (e.code === 'invalid_argument' || e.code === 'not_granted' || e.code === 'capability_disabled' || e.code === 'revoked')) Cloud.status = 'readonly';
  else Cloud.status = 'error';
}

let syncing = false;
async function syncPending() {
  if (syncing || Cloud.status !== 'ready') return; syncing = true;
  try {
    const games = localGames(); let changed = false;
    for (const g of games.filter(x => !x.synced).slice(0, 25)) {
      try { await cloudWrite(g); g.synced = true; changed = true; }
      catch (e) { if (e && e.code === 'unavailable') { await new Promise(r => setTimeout(r, 800 + Math.random() * 800)); try { await cloudWrite(g); g.synced = true; changed = true; continue; } catch (e2) { markReadOnly(e2); break; } } markReadOnly(e); break; }
    }
    if (changed) { saveLocalGames(games); try { await cloudTouchPlayer(games.length); } catch (e) { } }
  } finally { syncing = false; refreshLogView(); }
}

function logGame(S) {
  const rec = buildRecord(S); const games = localGames(); games.push(rec); saveLocalGames(games);
  syncPending();
  return rec;
}

async function initCloud() {
  const timer = setTimeout(() => { if (Cloud.status === 'connecting') { Cloud.status = 'local'; refreshLogView(); } }, 10000);
  try {
    if (!window.claude || typeof window.claude.use !== 'function') { Cloud.status = 'local'; return; }
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    Cloud.db = db; Cloud.user = user;
    Cloud.uid = user ? await user.id() : null;
    Cloud.owner = user ? !!user.isOwner() : false;
    if (!db || !Cloud.uid) { Cloud.status = 'local'; return; }
    const can = user.can ? user.can('data.write') : null;
    Cloud.status = 'ready';
    if (can === false && !Cloud.owner) Cloud.status = 'ready'; // own subtree may still be writable; a refused write decides
    syncPending();
  } catch (e) { Cloud.status = 'local'; }
  finally { clearTimeout(timer); refreshLogView(); }
}

const STATUS_TEXT = {
  connecting: 'Connecting to the shared test log…',
  ready: '✓ Saving every game to the shared test log, as well as on this device.',
  readonly: 'Saving on this device only. You can view this page but not write to its shared log. Ask Rob to invite you as an Editor, or use “Copy my games” and send the result.',
  error: 'Couldn’t reach the shared log just now. Games are kept on this device and will upload next time.',
  local: 'Saving on this device only (the shared log isn’t available here). Use “Copy my games” to send your results.'
};

function fmtDate(iso) { const d = new Date(iso); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
function roundShort(x) { const o = { win: '✓', tie: '=', loss: '✗' }[x.outcome]; return `${x.card}·${x.attr.slice(0, 3)}${x.ability ? '+' + x.ability : ''}${x.staked ? '●' : ''}${o}${x.pts > 0 ? '+' : ''}${x.pts}`; }

function gamesCsv(games) {
  const head = ['playedAt', 'version', 'boost', 'mode', 'deck', 'replay', 'rule', 'abilities', 'hand', 'stars', 'R1', 'R2', 'R3', 'R4', 'R5', 'total', 'careful', 'perfect', 'topTrumps', 'pctPerfect', 'draftSecs', 'gameSecs'];
  const q = s => `"${String(s).replace(/"/g, '""')}"`;
  const rows = games.map(g => [g.playedAt, g.v, g.boost, g.mode, g.code || g.day, g.replay ? 'yes' : '', g.rule, g.abilities.join(' '), g.hand.join(''), g.stars, ...[0, 1, 2, 3, 4].map(i => g.rounds[i] ? roundShort(g.rounds[i]) : ''), g.total, g.careful, g.perfect, g.topTrumps, g.pctPerfect, g.draftSecs, g.gameSecs].map(q).join(','));
  return [head.join(','), ...rows].join('\n');
}

function myGamesTable(games) {
  if (!games.length) return '<p class="note">No games logged yet on this device.</p>';
  return `<table class="tbl"><thead><tr><th>When</th><th>Deck</th><th>Score</th><th>% perf.</th><th>Draft</th></tr></thead><tbody>
    ${games.slice(-15).reverse().map(g => `<tr><td>${fmtDate(g.playedAt)}${g.synced ? '' : ' <span class="unsynced" title="Not yet in the shared log">•</span>'}</td><td>${g.mode === 'daily' ? 'Daily' + (g.replay ? ' (replay)' : '') : g.code}<small> · B+${g.boost}</small></td><td>${g.total}</td><td>${g.pctPerfect ?? '—'}%</td><td>${g.draftSecs ?? '—'}s</td></tr>`).join('')}
  </tbody></table>`;
}

async function loadAllTesters() {
  Cloud.allStatus = 'Loading…'; refreshLogView();
  try {
    const players = await Cloud.db.collection('players').get();
    const out = [];
    for (const p of players.docs) {
      const gs = await Cloud.db.collection(`players/${p.id}/games`).get();
      out.push({ id: p.id, games: gs.docs.map(d => d.data()) });
    }
    let names = {};
    try { names = await Cloud.user.profiles(out.map(o => o.id)); } catch (e) { }
    Cloud.all = out.map(o => ({ ...o, name: (names[o.id] && names[o.id].name) || 'Someone' }));
    Cloud.allStatus = '';
  } catch (e) { Cloud.allStatus = 'Couldn’t load the shared log: ' + (e && e.code || 'error'); }
  refreshLogView();
}

function allTestersHtml() {
  if (!Cloud.all) return '';
  const all = Cloud.all.flatMap(p => p.games.map(g => ({ ...g, player: p.name })));
  if (!all.length) return '<p class="note">No games in the shared log yet.</p>';
  const avg = (arr, f) => arr.length ? Math.round(arr.reduce((s, x) => s + (f(x) || 0), 0) / arr.length) : '—';
  const byBoost = [3, 2].map(b => { const g = all.filter(x => x.boost === b); return g.length ? `<tr><td>Boost +${b}</td><td>${g.length}</td><td>${avg(g, x => x.total)}</td><td>${avg(g, x => x.pctPerfect)}%</td><td>${avg(g, x => x.draftSecs)}s</td></tr>` : ''; }).join('');
  return `<h3>All testers</h3>
    <table class="tbl"><thead><tr><th>Tester</th><th>Games</th><th>Avg score</th><th>Avg % perfect</th><th>Avg draft</th></tr></thead><tbody>
    ${Cloud.all.map(p => `<tr><td>${escapeHtml(p.name)}</td><td>${p.games.length}</td><td>${avg(p.games, x => x.total)}</td><td>${avg(p.games, x => x.pctPerfect)}%</td><td>${avg(p.games, x => x.draftSecs)}s</td></tr>`).join('')}
    ${byBoost}</tbody></table>
    <p class="note">${all.length} games in total. Copy them all below, or ask Claude to analyse the shared log.</p>
    <button class="btn sec" id="copyall">Copy all games (CSV)</button>`;
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function logView() {
  const games = localGames();
  return `<details class="lab" id="logbox"><summary>Test log</summary>
    <p class="logstatus ${Cloud.status}">${STATUS_TEXT[Cloud.status]}</p>
    <h3>My games (${games.length} on this device)</h3>
    ${myGamesTable(games)}
    <div class="btns"><button class="btn sec" id="copymine">Copy my games (CSV)</button>
    ${Cloud.status === 'ready' && Cloud.owner ? '<button class="btn sec" id="loadall">Load all testers</button>' : ''}</div>
    <textarea id="csvout" class="csv" readonly rows="4" hidden></textarea>
    ${Cloud.allStatus ? `<p class="note">${Cloud.allStatus}</p>` : ''}
    <div id="allout">${allTestersHtml()}</div>
  </details>`;
}
function refreshLogView() {
  const box = document.getElementById('logbox'); if (!box) return;
  const open = box.open; const tmp = document.createElement('div'); tmp.innerHTML = logView();
  box.replaceWith(tmp.firstElementChild); if (open) document.getElementById('logbox').open = true;
}

function copyText(btn, txt) {
  const ta = document.getElementById('csvout'); ta.value = txt; ta.hidden = false;
  Promise.resolve().then(() => navigator.clipboard.writeText(txt)).then(() => { btn.textContent = 'Copied ✓'; }).catch(() => { ta.select(); btn.textContent = 'Select & copy below'; });
}
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.id === 'copymine') copyText(t, gamesCsv(localGames()));
  if (t.id === 'loadall') loadAllTesters();
  if (t.id === 'copyall' && Cloud.all) copyText(t, gamesCsv(Cloud.all.flatMap(p => p.games.map(g => ({ ...g, code: (g.code || g.day) + ' / ' + p.name })))));
});

initCloud();
