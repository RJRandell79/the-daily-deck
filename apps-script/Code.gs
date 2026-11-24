/**
 * The Daily Deck — playtest results receiver (Google Apps Script)
 *
 * Paste this into the Sheet's Apps Script editor (Extensions → Apps Script), set TOKEN below to
 * the same text as "token" in itch.config.json, then Deploy → New deployment → Web app
 * (Execute as: Me · Who has access: Anyone). The web app URL ending in /exec is the "endpoint".
 *
 * Each finished game arrives as one row on the "Games" tab; end-of-game feedback goes to the
 * "Feedback" tab. Optional: run setupDailySummary() once for a morning email of yesterday's games.
 */

const CONFIG = {
  TOKEN: 'pick-any-random-text-and-use-the-same-in-itch.config.json',
  EMAIL_EACH_GAME: false,   // true = an email for every game (can get noisy)
  SUMMARY_HOUR: 8           // hour (in the script's time zone) for the daily summary email
};

const GAME_COLS = ['receivedAt', 'testerId', 'nickname', 'device', 'gameId', 'playedAt', 'version', 'build',
  'boost', 'stakeLimit', 'finaleMult', 'stakesLeftAtR5', 'mode', 'deck', 'replay', 'rule', 'abilities', 'hand', 'stars',
  'R1', 'R2', 'R3', 'R4', 'R5', 'stakedRounds', 'carefulStakedRounds', 'perfectStakedRounds',
  'total', 'careful', 'perfect', 'topTrumps', 'pctPerfect', 'draftSecs', 'gameSecs'];
const FEEDBACK_COLS = ['receivedAt', 'testerId', 'nickname', 'device', 'gameId', 'understoodR1', 'playAgain', 'comment'];

function doGet() {
  return text_('The Daily Deck playtest endpoint is running.');
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return text_('bad json'); }
  if (!d || d.token !== CONFIG.TOKEN) return text_('bad token');
  if (!/^[\w-]{4,40}$/.test(String(d.gameId || ''))) return text_('bad game id');
  if (d.kind === 'game') {
    if (!/^v\d/.test(String(d.version || '')) || !d.R1 || !d.R5) return text_('bad game');
    const added = append_('Games', GAME_COLS, d, true);
    if (added && CONFIG.EMAIL_EACH_GAME) {
      MailApp.sendEmail(owner_(), `Daily Deck: ${d.nickname || d.testerId} scored ${d.total} (${d.rule})`,
        `${d.nickname || d.testerId} played ${d.mode === 'daily' ? "today's deck" : 'deck ' + d.deck} (${d.rule}).\n` +
        `Score ${d.total} — ${d.pctPerfect}% of perfect (careful bot ${d.careful}, perfect ${d.perfect}).\nStakes: ${d.stakedRounds || 'none'}`);
    }
    return text_('ok');
  }
  if (d.kind === 'feedback') { append_('Feedback', FEEDBACK_COLS, d, false); return text_('ok'); }
  return text_('bad kind');
}

/** Creates the Games and Feedback tabs with headers. Safe to run more than once. */
function setup() { sheet_('Games', GAME_COLS); sheet_('Feedback', FEEDBACK_COLS); }

/** Run once to get a summary email each morning (only sent when there were games). */
function setupDailySummary() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'sendDailySummary').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendDailySummary').timeBased().everyDays(1).atHour(CONFIG.SUMMARY_HOUR).create();
}

/** Emails a summary of the last 24 hours. Also handy to run by hand. */
function sendDailySummary() {
  const since = Date.now() - 24 * 3600 * 1000;
  const games = rows_('Games').filter(r => new Date(r.receivedAt).getTime() >= since);
  const fb = rows_('Feedback').filter(r => new Date(r.receivedAt).getTime() >= since);
  if (!games.length && !fb.length) return;
  // A tester may add their name after their first game: use their latest name everywhere.
  const names = {}; [...rows_('Games'), ...rows_('Feedback')].forEach(r => { if (r.nickname) names[r.testerId] = r.nickname; });
  const who = r => names[r.testerId] || r.nickname || r.testerId;
  const avg = (a, f) => a.length ? Math.round(a.reduce((s, x) => s + (Number(f(x)) || 0), 0) / a.length) : '—';
  const rules = {};
  games.forEach(g => { (rules[g.rule] = rules[g.rule] || []).push(g); });
  const count = (k, v) => fb.filter(r => r[k] === v).length;
  const lines = [
    `${games.length} game${games.length === 1 ? '' : 's'} from ${new Set(games.map(who)).size} tester(s) in the last 24 hours.`,
    `Average: ${avg(games, g => g.pctPerfect)}% of perfect (careful bot ${avg(games, g => g.perfect ? 100 * g.careful / g.perfect : 0)}%).`,
    '', 'By rule:',
    ...Object.keys(rules).map(k => `  ${k}: ${rules[k].length} game(s), ${avg(rules[k], g => g.pctPerfect)}% of perfect`),
    '', 'By tester:',
    ...[...new Set(games.map(who))].map(t => { const g = games.filter(x => who(x) === t); return `  ${t}: ${g.length} game(s), ${avg(g, x => x.pctPerfect)}% of perfect`; }),
    '', `Feedback (${fb.length}): understood by round 1 — yes ${count('understoodR1', 'yes')}, no ${count('understoodR1', 'no')}; ` +
    `play tomorrow — yes ${count('playAgain', 'yes')}, maybe ${count('playAgain', 'maybe')}, no ${count('playAgain', 'no')}`,
    ...fb.filter(r => r.comment).map(r => `  “${String(r.comment).replace(/^'/, "")}” — ${who(r)}`),
    '', SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ];
  MailApp.sendEmail(owner_(), `Daily Deck playtest: ${games.length} game(s) yesterday`, lines.join('\n'));
}

// ---- helpers ----
function append_(name, cols, d, dedupe) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const sh = sheet_(name, cols);
    if (dedupe && sh.getLastRow() > 1) {
      const col = cols.indexOf('gameId') + 1;
      const hit = sh.getRange(2, col, sh.getLastRow() - 1, 1).createTextFinder(String(d.gameId)).matchEntireCell(true).findNext();
      if (hit) return false; // the game sent this one twice — keep a single row
    }
    sh.appendRow(cols.map(c => c === 'receivedAt' ? new Date() : clean_(d[c])));
    return true;
  } finally { lock.releaseLock(); }
}
function sheet_(name, cols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) { sh.appendRow(cols); sh.setFrozenRows(1); }
  return sh;
}
function rows_(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  const v = sh.getDataRange().getValues(); const head = v[0];
  return v.slice(1).map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}
// Keeps numbers as numbers; stops text from a tester being read as a formula; caps length.
function clean_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  let s = String(v).slice(0, 2000);
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
function owner_() { return Session.getEffectiveUser().getEmail(); }
function text_(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT); }
