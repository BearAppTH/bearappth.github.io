/* ── ScamShield Service Worker ── */

const DB_NAME    = 'scamshield-db';
const DB_VERSION = 1;
const STORE      = 'blocklist';

/* ── IndexedDB helpers ── */

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'domain' });
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

async function getAllBlocked() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror   = e => reject(e.target.error);
  });
}

async function checkBlocked(hostname) {
  const list = await getAllBlocked();
  const byDomain = list.find(e => e.domain === hostname);
  if (byDomain) return { entry: byDomain, byIP: false };
  const byIP = list.find(e => e.ip === hostname);
  if (byIP)     return { entry: byIP,     byIP: true  };
  return null;
}

/* ── Blocked page HTML ── */

function blockedPage(hostname, entry, byIP) {
  const when    = new Date(entry.blockedAt);
  const dateStr = when.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
  const timeStr = when.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const rows = [
    ['Requested domain', hostname],
    byIP ? ['Blocked via domain', entry.domain] : null,
    ['IP address', entry.ip + (byIP ? '  (IP matched — blocked)' : '  (blocked)')],
    ['Blocked on',   dateStr + ' at ' + timeStr],
    ['Risk level',   entry.riskLevel + ' — Score: ' + entry.riskScore + '/100'],
    ['To unblock',   'Open ScamShield and click Unblock Site'],
  ].filter(Boolean);

  const rowsHTML = rows.map(([k, v]) =>
    '<div class="r"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'
  ).join('');

  const title = byIP ? 'Blocked — IP Association' : 'Access Blocked';
  const sub   = byIP
    ? 'This domain shares an IP address with a site you blocked. Access is restricted by ScamShield.'
    : 'This website has been blocked by ScamShield and cannot be accessed from this device.';

  return '<!DOCTYPE html><html lang="en"><head>' +
    '<meta charset="UTF-8"/>' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"/>' +
    '<title>🚫 ' + title + ' — ScamShield</title>' +
    '<style>' +
    '*{box-sizing:border-box;margin:0;padding:0}' +
    'body{min-height:100vh;display:flex;align-items:center;justify-content:center;' +
         'background:#0d1117;color:#e6edf3;font-family:system-ui,-apple-system,sans-serif;padding:24px}' +
    '.w{max-width:540px;width:100%;text-align:center}' +
    '.ic{font-size:4rem;display:block;margin-bottom:20px;animation:gl 2s ease-in-out infinite}' +
    '@keyframes gl{0%,100%{filter:drop-shadow(0 0 0 rgba(248,81,73,0))}' +
                  '50%{filter:drop-shadow(0 0 16px rgba(248,81,73,.65))}}' +
    'h1{font-size:clamp(1.4rem,4vw,2rem);color:#f85149;margin-bottom:10px;font-weight:700}' +
    '.sub{color:#8b949e;font-size:.9rem;line-height:1.65;margin-bottom:28px}' +
    '.card{background:#161b22;border:1.5px solid rgba(248,81,73,.35);border-radius:10px;' +
           'overflow:hidden;margin-bottom:28px;text-align:left}' +
    '.r{display:flex;gap:14px;padding:11px 18px;border-bottom:1px solid #30363d;align-items:baseline}' +
    '.r:last-child{border-bottom:none}' +
    '.k{color:#8b949e;font-size:.75rem;font-family:monospace;min-width:130px;flex-shrink:0}' +
    '.v{color:#e6edf3;font-size:.82rem;font-family:monospace;word-break:break-all;line-height:1.5}' +
    '.acts{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}' +
    '.btn{display:inline-flex;align-items:center;gap:6px;padding:.65rem 1.4rem;' +
          'border-radius:6px;font-size:.88rem;font-weight:600;text-decoration:none;' +
          'border:1.5px solid transparent;cursor:pointer;min-height:44px}' +
    '.bp{background:#58a6ff;color:#0d1117;border-color:#58a6ff}' +
    '.bg{background:transparent;color:#8b949e;border-color:#30363d}' +
    '.foot{margin-top:28px;font-size:.72rem;color:#484f58;font-family:monospace}' +
    '.foot a{color:#58a6ff;text-decoration:none}' +
    '</style>' +
    '</head><body>' +
    '<div class="w">' +
    '<span class="ic" role="img" aria-label="Blocked">🚫</span>' +
    '<h1>' + title + '</h1>' +
    '<p class="sub">' + sub + '</p>' +
    '<div class="card">' + rowsHTML + '</div>' +
    '<div class="acts">' +
    '<a href="https://bearappth.github.io/scam-checker.html" class="btn bp">' +
    'Open ScamShield to Unblock</a>' +
    '<a href="javascript:history.back()" class="btn bg">Go Back</a>' +
    '</div>' +
    '<p class="foot">Protected by <a href="https://bearappth.github.io/scam-checker.html">ScamShield</a> &middot; BearAppTH</p>' +
    '</div></body></html>';
}

/* ── Lifecycle ── */

self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

/* ── Intercept navigate requests ── */

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.mode !== 'navigate') return;

  const url = new URL(req.url);
  if (url.hostname === self.location.hostname) return;   // never block our own origin

  const hostname = url.hostname.replace(/^www\./i, '').toLowerCase();

  e.respondWith(
    checkBlocked(hostname)
      .then(result => {
        if (result) {
          return new Response(
            blockedPage(hostname, result.entry, result.byIP),
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
        return fetch(req);
      })
      .catch(() => fetch(req))
  );
});

/* ── Messages from main page ── */

self.addEventListener('message', async e => {
  const { type, data } = e.data || {};
  try {
    const db = await openDB();
    const tx = name => db.transaction(STORE, name).objectStore(STORE);

    if (type === 'PING') {
      e.source.postMessage({ type: 'PONG' });
    } else if (type === 'BLOCK') {
      tx('readwrite').put(data);
    } else if (type === 'UNBLOCK') {
      tx('readwrite').delete(data.domain);
    } else if (type === 'CLEAR') {
      tx('readwrite').clear();
    } else if (type === 'GET_LIST') {
      const req = tx('readonly').getAll();
      req.onsuccess = () => e.source.postMessage({ type: 'LIST', data: req.result || [] });
    }
  } catch (err) {
    console.error('[ScamShield SW]', err);
  }
});
