// ===== The Daily Deck — playtest reporting (itch.io build) =====
// In the itch.io build, every finished game (and any end-of-game feedback) is sent to a
// Google Sheet through a small Apps Script web app. Nothing is sent in the Claude build.
// Items wait in an on-device outbox until they've been sent, so a dropped connection or a
// closed tab just means they go next time the game is opened.
const OUTBOX_KEY = 'dailydeck-outbox-v1';
const TESTER_KEY = 'dailydeck-tester-v1';
const DEV_KEY = 'dailydeck-dev';

function devMode() { try { return localStorage.getItem(DEV_KEY) === '1'; } catch (e) { return false; } }
function setDevFromHash() {
  try { if (location.hash === '#dev') localStorage.setItem(DEV_KEY, '1'); if (location.hash === '#nodev') localStorage.removeItem(DEV_KEY); } catch (e) { }
}

function tester() {
  let t = null; try { t = JSON.parse(localStorage.getItem(TESTER_KEY)); } catch (e) { }
  if (!t || !t.id) { t = { id: 't-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4), name: '' }; saveTester(t); }
  return t;
}
function saveTester(t) { try { localStorage.setItem(TESTER_KEY, JSON.stringify(t)); } catch (e) { } }
function deviceKind() { try { return window.matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse'; } catch (e) { return ''; } }

function outbox() { try { return JSON.parse(localStorage.getItem(OUTBOX_KEY)) || []; } catch (e) { return []; } }
function saveOutbox(o) { try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(o.slice(-300))); } catch (e) { } }

function enqueue(kind, data) {
  if (!IS_ITCH || !DD_BUILD.endpoint) return;
  const t = tester();
  const item = { key: kind + ':' + (data.gameId || Date.now()), sent: false, body: { kind, token: DD_BUILD.token, build: DD_BUILD.mode, testerId: t.id, nickname: t.name || '', device: deviceKind(), ...data } };
  const o = outbox().filter(x => x.key !== item.key); o.push(item); saveOutbox(o);
  flushOutbox();
}

let flushing = false;
async function flushOutbox() {
  if (!IS_ITCH || !DD_BUILD.endpoint || flushing) return; flushing = true;
  try {
    const o = outbox();
    for (const item of o.filter(x => !x.sent)) {
      try {
        // A "simple" request (text/plain, no-cors) so the browser needs no permission check
        // from Google. The reply can't be read, so a resolved request counts as sent.
        await fetch(DD_BUILD.endpoint, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(item.body) });
        item.sent = true; item.sentAt = new Date().toISOString();
      } catch (e) { break; } // offline or blocked: keep the rest for next time
    }
    saveOutbox(o);
  } finally { flushing = false; if (typeof refreshLogView === 'function') refreshLogView(); }
}
function outboxWaiting() { return outbox().filter(x => !x.sent).length; }

function reportGame(rec) { enqueue('game', { gameId: rec.id, ...gameRowObject(rec) }); }
function reportFeedback(gameId, fb) { enqueue('feedback', { gameId, understoodR1: fb.understood || '', playAgain: fb.again || '', comment: (fb.comment || '').slice(0, 2000) }); }

function remoteStatusHtml() {
  if (!DD_BUILD.endpoint) return '<p class="logstatus local">Results are kept on this device only.</p>';
  const w = outboxWaiting();
  return w ? `<p class="logstatus error">${w} result${w > 1 ? 's' : ''} waiting to send. They'll go automatically when you're online.</p>`
    : '<p class="logstatus ready">✓ Your results have been sent to the developer.</p>';
}

if (IS_ITCH) { setDevFromHash(); window.addEventListener('online', flushOutbox); setTimeout(flushOutbox, 1500); }
