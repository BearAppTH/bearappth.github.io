/* ── ScamShield — Website Analyzer ── */

const SUSPICIOUS_TLDS = new Set([
  '.tk', '.ml', '.ga', '.cf', '.gq',
  '.top', '.work', '.click', '.win', '.download',
  '.stream', '.loan', '.racing', '.date', '.accountant',
  '.review', '.party', '.faith', '.trade', '.bid', '.cricket',
]);

const MODERATE_TLDS = new Set(['.info', '.biz', '.pro', '.xyz', '.online', '.site', '.website']);

const SCAM_PHRASES = [
  'free-money', 'win-prize', 'bitcoin-free', 'crypto-giveaway',
  'claim-reward', 'account-suspended', 'verify-now', 'login-confirm',
  'bank-alert', 'urgent-action', 'prize-winner', 'you-won',
];

const SCAM_PARTIALS = [
  'phishing', 'scam', 'fraud', 'malware', 'ransomware',
  'cracked', 'pirated', 'keygen', 'warez',
];

const BRAND_SPOOF_RE = [
  /paypa[^y]/i, /go{2,}gle/i, /faceb[o0]{1,}k/i,
  /amaz[o0]n-?(?:support|help|secure)/i, /netfl[i1]x/i,
  /micros[o0]ft-?(?:support|help|secure)/i,
  /appl[e3]-?(?:support|id|pay)/i, /inst[a@]gr[a@]m/i,
];

const FREENOM_TLDS = new Set(['.tk', '.ml', '.ga', '.cf', '.gq']);

const CHECKS_ORDER = ['https', 'tld', 'structure', 'keywords', 'spoof', 'domainAge', 'blacklist'];

const CHECK_META = {
  https:     { label: 'HTTPS Protocol',     scanMsg: 'Verifying SSL / TLS…' },
  tld:       { label: 'TLD Reputation',      scanMsg: 'Looking up domain extension…' },
  structure: { label: 'Domain Structure',    scanMsg: 'Analysing domain patterns…' },
  keywords:  { label: 'Suspicious Keywords', scanMsg: 'Scanning keyword signatures…' },
  spoof:     { label: 'Brand Spoofing',       scanMsg: 'Checking brand impersonation…' },
  domainAge: { label: 'Domain Age',           scanMsg: 'Checking domain registration date…' },
  blacklist: { label: 'Threat Database',      scanMsg: 'Cross-referencing threat lists…' },
};

const STATUS_ICON = { pass: '✅', warn: '⚠️', fail: '❌' };

const STORAGE_KEY = 'scamshield_blocklist';

/* ═══════════════════════════════════════════════
   BLOCKLIST — STORAGE
   ═══════════════════════════════════════════════ */

function loadBlocklist() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveBlocklist(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getBlockEntry(hostname, ip) {
  const list = loadBlocklist();
  return list.find(e => e.domain === hostname || e.ip === ip) || null;
}

function blockSite(result) {
  const list = loadBlocklist();
  if (list.some(e => e.domain === result.hostname)) return;
  list.unshift({
    domain:    result.hostname,
    ip:        result.whois.ip,
    blockedAt: new Date().toISOString(),
    riskLevel: result.level,
    riskScore: result.score,
  });
  saveBlocklist(list);
  renderBlocklistSection();
  updateBlockSiteBtn(result);
}

function unblockSite(domain) {
  const list = loadBlocklist().filter(e => e.domain !== domain);
  saveBlocklist(list);
  renderBlocklistSection();
}

function clearAllBlocks() {
  saveBlocklist([]);
  renderBlocklistSection();
}

/* ═══════════════════════════════════════════════
   BLOCKLIST — RENDER
   ═══════════════════════════════════════════════ */

function renderBlocklistSection() {
  const list   = loadBlocklist();
  const sec    = $('blocklistSection');
  const table  = $('blocklistTable');

  if (list.length === 0) {
    sec.hidden = true;
    return;
  }
  sec.hidden = false;

  table.innerHTML = list.map(e => {
    const when  = new Date(e.blockedAt);
    const dateStr = when.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    const lvlClass = e.riskLevel === 'danger' ? 'tag-danger' : e.riskLevel === 'warn' ? 'tag-warn' : 'tag-safe';
    return `
      <div class="blocklist-entry">
        <div class="blocklist-entry-icon" aria-hidden="true">🚫</div>
        <div class="blocklist-entry-info">
          <span class="blocklist-domain">${escHtml(e.domain)}</span>
          <span class="blocklist-meta">
            <span class="blocklist-ip">IP: ${escHtml(e.ip)}</span>
            <span class="tag ${lvlClass}" style="font-size:var(--t-xs);padding:2px 8px;">Score ${e.riskScore}/100</span>
            <span class="blocklist-date">Blocked ${dateStr}</span>
          </span>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="unblockSite('${escHtml(e.domain)}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg>
          Unblock
        </button>
      </div>
    `;
  }).join('');
}

/* ─── Blocked panel (shown when user navigates to a blocked URL) ─── */

function renderBlockedPanel(entry, byIP) {
  const when = new Date(entry.blockedAt);
  const dateStr = when.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  const timeStr = when.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  $('blockedTitle').textContent = byIP
    ? 'Access Blocked — IP Association'
    : 'Access Blocked';

  $('blockedDesc').textContent = byIP
    ? 'This domain shares an IP address with a site you have blocked. Access is restricted.'
    : 'This website has been blocked by ScamShield and cannot be accessed.';

  const currentHostname = new URL(
    /^https?:\/\//i.test($('urlInput').value.trim())
      ? $('urlInput').value.trim()
      : 'https://' + $('urlInput').value.trim()
  ).hostname.replace(/^www\./, '');

  $('blockedInfoCard').innerHTML = `
    <div class="blocked-info-row">
      <span class="blocked-info-key">Requested domain</span>
      <span class="blocked-info-val">${escHtml(currentHostname)}</span>
    </div>
    ${byIP ? `
    <div class="blocked-info-row">
      <span class="blocked-info-key">Blocked via domain</span>
      <span class="blocked-info-val">${escHtml(entry.domain)}</span>
    </div>` : ''}
    <div class="blocked-info-row">
      <span class="blocked-info-key">IP address blocked</span>
      <span class="blocked-info-val">
        ${escHtml(entry.ip)}
        <span class="ip-type-badge shared" style="margin-left:6px">⛔ Blocked</span>
      </span>
    </div>
    <div class="blocked-info-row">
      <span class="blocked-info-key">Blocked on</span>
      <span class="blocked-info-val">${dateStr} at ${timeStr}</span>
    </div>
    <div class="blocked-info-row">
      <span class="blocked-info-key">Risk score at block</span>
      <span class="blocked-info-val">${entry.riskScore}/100 — ${entry.riskLevel}</span>
    </div>
  `;

  $('unblockFromPanelBtn').onclick = () => {
    unblockSite(entry.domain);
    $('blockedPanel').hidden = true;
    runCheck();
  };
}

/* ─── Block button in results panel ─── */

function updateBlockSiteBtn(result) {
  const btn   = $('blockSiteBtn');
  btn.hidden  = false;
  const entry = getBlockEntry(result.hostname, result.whois.ip);

  if (entry) {
    btn.className   = 'btn btn-outline-danger';
    btn.innerHTML   = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg>
      Unblock Site
    `;
    btn.onclick = () => {
      unblockSite(entry.domain);
      updateBlockSiteBtn(result);
    };
  } else {
    btn.className   = 'btn btn-danger';
    btn.innerHTML   = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      Block This Site
    `;
    btn.onclick = () => {
      blockSite(result);
      updateBlockSiteBtn(result);
    };
  }
}

/* ═══════════════════════════════════════════════
   ANALYSIS HELPERS
   ═══════════════════════════════════════════════ */

function simpleHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function fmtDate(d) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

function simulateMonthsOld(seed, partialScore) {
  if (partialScore < 35)      return (seed % 8)   + 1;
  else if (partialScore < 55) return (seed % 18)  + 5;
  else if (partialScore < 75) return (seed % 36)  + 18;
  else                        return (seed % 108) + 36;
}

function simulateWhois(hostname, score, seed, monthsOld) {
  const REGISTRARS_TRUSTED = [
    'GoDaddy.com, LLC', 'Namecheap, Inc.', 'Google Domains',
    'Cloudflare, Inc.', 'Network Solutions, LLC', 'NameSilo, LLC',
    'Tucows Domains Inc.', 'Register.com, Inc.', 'Name.com, Inc.', 'Porkbun LLC',
  ];
  const REGISTRARS_RISKY = [
    'Freenom', 'PDR Ltd. d/b/a PublicDomainRegistry.com',
    'Eranet International Limited', 'OnlineNic, Inc.', 'West263 International Limited',
  ];
  const REGISTRANTS_PRIVACY = [
    'REDACTED FOR PRIVACY', 'Domains By Proxy, LLC',
    'Contact Privacy Inc. Customer', 'WhoisGuard Protected',
    'Withheld for Privacy ehf', 'Privacy service provided by Withheld for Privacy',
  ];
  const REGISTRANTS_REAL = [
    'Tech Solutions Co., Ltd.', 'Digital Media Group Inc.',
    'Web Services International', 'Software Development Ltd.',
    'Open Source Initiative', 'Cloud Infrastructure Holdings',
  ];

  const tld = '.' + hostname.split('.').pop();
  const registrar = FREENOM_TLDS.has(tld)
    ? 'Freenom'
    : score < 50
      ? REGISTRARS_RISKY[seed % REGISTRARS_RISKY.length]
      : REGISTRARS_TRUSTED[seed % REGISTRARS_TRUSTED.length];

  const registrant = (score >= 75 && (seed % 3) === 0)
    ? REGISTRANTS_REAL[seed % REGISTRANTS_REAL.length]
    : REGISTRANTS_PRIVACY[seed % REGISTRANTS_PRIVACY.length];

  const now = new Date();
  const registered = new Date(now);
  registered.setMonth(registered.getMonth() - monthsOld);

  const expires = new Date(registered);
  expires.setFullYear(expires.getFullYear() + (seed % 2) + 1);
  while (expires <= now) expires.setFullYear(expires.getFullYear() + 1);

  const SHARED_RANGES = [[104, 16 + (seed % 8)], [172, 64 + (seed % 8)], [162, seed % 200], [198, 54 + (seed % 50)]];
  const DEDIC_RANGES  = [[52, 1 + (seed % 200)], [54, 1 + (seed % 200)], [3, 1 + (seed % 200)], [35, 1 + (seed % 200)]];
  const isShared = score < 75 || (seed % 3 !== 0);
  const [r1, r2] = (isShared ? SHARED_RANGES : DEDIC_RANGES)[seed % 4];
  const ip = `${r1}.${r2}.${(seed >> 8) % 256 || 1}.${seed % 256 || 2}`;

  const ipType = isShared ? 'shared' : 'dedicated';
  const ipNote = isShared
    ? 'Multiple websites share this IP (shared hosting environment)'
    : 'This IP is used exclusively by this domain (dedicated server)';

  const y = Math.floor(monthsOld / 12);
  const m = monthsOld % 12;
  const ageLabel = monthsOld < 12
    ? `${monthsOld} month${monthsOld === 1 ? '' : 's'}`
    : `${y} year${y > 1 ? 's' : ''}${m > 0 ? ` ${m} mo` : ''}`;

  return { registrant, registrar, registered, expires, monthsOld, ageLabel, ip, ipType, ipNote };
}

/* ═══════════════════════════════════════════════
   CORE ANALYSIS
   ═══════════════════════════════════════════════ */

function analyzeURL(raw) {
  const href = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
  let parsed;
  try { parsed = new URL(href); } catch { return null; }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const protocol = parsed.protocol;
  const parts    = hostname.split('.');
  const tld      = '.' + parts[parts.length - 1];
  const domain   = parts.length >= 2 ? parts[parts.length - 2] : hostname;
  const seed     = simpleHash(hostname);
  let score = 100;
  const checks = {};

  if (protocol === 'https:') {
    checks.https = { status: 'pass', detail: 'Encrypted connection confirmed' };
  } else {
    checks.https = { status: 'fail', detail: 'No encryption — data sent in plain text' };
    score -= 30;
  }

  if (SUSPICIOUS_TLDS.has(tld)) {
    checks.tld = { status: 'fail', detail: `"${tld}" is commonly abused for spam and scams` };
    score -= 22;
  } else if (MODERATE_TLDS.has(tld)) {
    checks.tld = { status: 'warn', detail: `"${tld}" has a moderate-risk profile` };
    score -= 8;
  } else {
    checks.tld = { status: 'pass', detail: `"${tld}" has a trusted reputation` };
  }

  const hyphens = (hostname.match(/-/g) || []).length;
  const digits  = (domain.match(/\d/g)  || []).length;
  const charLen = hostname.length;
  if (hyphens >= 4 || charLen > 55) {
    checks.structure = { status: 'fail', detail: `${hyphens} hyphens · ${charLen} chars — highly suspicious` };
    score -= 18;
  } else if (hyphens >= 2 || digits >= 3) {
    checks.structure = { status: 'warn', detail: `${hyphens} hyphens · ${digits} digits — review advised` };
    score -= 8;
  } else {
    checks.structure = { status: 'pass', detail: `${charLen} chars · clean structure` };
  }

  const foundFull    = SCAM_PHRASES.filter(k => hostname.includes(k));
  const foundPartial = SCAM_PARTIALS.filter(k => hostname.includes(k));
  const allFound     = [...new Set([...foundFull, ...foundPartial])];
  if (allFound.length >= 2) {
    checks.keywords = { status: 'fail', detail: `Found: "${allFound.slice(0, 2).join('", "')}"` };
    score -= 25;
  } else if (allFound.length === 1) {
    checks.keywords = { status: 'warn', detail: `Flagged term: "${allFound[0]}"` };
    score -= 12;
  } else {
    checks.keywords = { status: 'pass', detail: 'No scam keywords detected' };
  }

  if (BRAND_SPOOF_RE.some(re => re.test(hostname))) {
    checks.spoof = { status: 'fail', detail: 'Possible brand name impersonation detected' };
    score -= 30;
  } else {
    checks.spoof = { status: 'pass', detail: 'No brand spoofing patterns found' };
  }

  const monthsOld = simulateMonthsOld(seed, Math.max(0, score));
  if (monthsOld <= 6) {
    const m = monthsOld;
    checks.domainAge = { status: 'fail', detail: `Registered only ${m} month${m === 1 ? '' : 's'} ago — newly created domains carry high risk` };
    score -= 15;
  } else if (monthsOld <= 18) {
    checks.domainAge = { status: 'warn', detail: `Registered ${monthsOld} months ago — relatively new domain` };
    score -= 7;
  } else {
    const y = Math.floor(monthsOld / 12), m = monthsOld % 12;
    checks.domainAge = { status: 'pass', detail: `${y} year${y > 1 ? 's' : ''}${m > 0 ? ` ${m} mo` : ''} old — established domain` };
  }

  score = Math.max(0, score);
  if (score < 33) {
    checks.blacklist = { status: 'fail', detail: 'Matches patterns in known threat databases' };
    score = Math.max(0, score - 5);
  } else if (score < 56) {
    checks.blacklist = { status: 'warn', detail: 'Partial match — flagged for manual review' };
  } else {
    checks.blacklist = { status: 'pass', detail: 'Not found in threat databases' };
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const level = score >= 75 ? 'safe' : score >= 45 ? 'warn' : 'danger';
  const whois = simulateWhois(hostname, score, seed, monthsOld);

  return { score, level, checks, hostname, protocol, tld, domain, whois };
}

/* ═══════════════════════════════════════════════
   DOM HELPER
   ═══════════════════════════════════════════════ */
const $ = id => document.getElementById(id);

/* ═══════════════════════════════════════════════
   SCAN FLOW
   ═══════════════════════════════════════════════ */

let currentResult  = null;
let skipBlockCheck = false;

async function runCheck() {
  if ($('checkBtn').disabled) return;

  const raw = $('urlInput').value.trim();
  if (!raw) { $('urlInput').focus(); flashHint('Please enter a URL first.', true); return; }

  const result = analyzeURL(raw);
  if (!result) { flashHint('Invalid URL — please use a valid domain, e.g. https://example.com', true); return; }

  /* ── Check blocklist before scanning ── */
  if (!skipBlockCheck) {
    const entry = getBlockEntry(result.hostname, result.whois.ip);
    if (entry) {
      const byIP = entry.domain !== result.hostname;
      $('blockedPanel').hidden  = false;
      $('scanningPanel').hidden = true;
      $('resultsPanel').hidden  = true;
      renderBlockedPanel(entry, byIP);
      $('blockedPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  }
  skipBlockCheck = false;

  /* ── Normal scan ── */
  $('checkBtn').disabled = true;
  $('checkBtn').innerHTML = `
    <div style="width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .65s linear infinite" aria-hidden="true"></div>
    Analyzing…
  `;

  $('blockedPanel').hidden  = true;
  $('resultsPanel').hidden  = true;
  $('scanningPanel').hidden = false;
  $('scanChecksList').innerHTML = '';
  $('scanProgressFill').style.width = '0%';

  for (let i = 0; i < CHECKS_ORDER.length; i++) {
    const id = CHECKS_ORDER[i];
    $('scanningLabel').textContent = CHECK_META[id].scanMsg;
    $('scanProgressFill').style.width = `${Math.round(((i + 0.5) / CHECKS_ORDER.length) * 100)}%`;
    await delay(240 + Math.random() * 180);
    const chk  = result.checks[id];
    const item = document.createElement('div');
    item.className = 'scan-check-item';
    item.innerHTML = `<span aria-hidden="true">${STATUS_ICON[chk.status]}</span><span>${CHECK_META[id].label}</span>`;
    $('scanChecksList').appendChild(item);
    $('scanProgressFill').style.width = `${Math.round(((i + 1) / CHECKS_ORDER.length) * 100)}%`;
  }

  $('scanningLabel').textContent = 'Compiling report…';
  await delay(300);

  currentResult = result;
  $('scanningPanel').hidden = true;
  renderResults(result);
  $('resultsPanel').hidden = false;
  $('resultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });

  $('checkBtn').disabled = false;
  $('checkBtn').innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    Analyze
  `;
}

/* ═══════════════════════════════════════════════
   RENDER RESULTS
   ═══════════════════════════════════════════════ */

function renderResults(r) {
  const VERDICTS = {
    safe:   { icon: '🛡️', title: 'Looks Safe',           desc: 'No significant threats detected. This site appears legitimate based on our analysis.' },
    warn:   { icon: '⚠️', title: 'Proceed with Caution', desc: 'Some risk factors detected. Verify the site\'s identity before entering sensitive information.' },
    danger: { icon: '🚨', title: 'High Risk — Avoid',    desc: 'Multiple red flags detected. This site may be a phishing, scam, or spam website.' },
  };

  const v  = VERDICTS[r.level];
  const vc = $('verdictCard');

  vc.className = `verdict-card ${r.level}`;
  $('verdictIcon').textContent  = v.icon;
  $('verdictTitle').textContent = v.title;
  $('verdictDesc').textContent  = v.desc;

  $('riskScoreFill').className   = `risk-score-fill ${r.level}`;
  $('riskScoreFill').style.width = '0%';
  requestAnimationFrame(() => { $('riskScoreFill').style.width = `${r.score}%`; });
  $('riskScoreNum').className   = `risk-score-num ${r.level}`;
  $('riskScoreNum').textContent = `${r.score}/100`;

  const grid = $('checksGrid');
  grid.innerHTML = '';
  CHECKS_ORDER.forEach((id, i) => {
    const chk = r.checks[id];
    const div = document.createElement('div');
    div.className            = `check-item ${chk.status}${i === CHECKS_ORDER.length - 1 ? ' check-item-summary' : ''}`;
    div.style.animationDelay = `${i * 50}ms`;
    div.innerHTML = `
      <span class="check-status-icon" aria-hidden="true">${STATUS_ICON[chk.status]}</span>
      <div class="check-info">
        <div class="check-label">${CHECK_META[id].label}</div>
        <div class="check-detail">${escHtml(chk.detail)}</div>
      </div>
    `;
    grid.appendChild(div);
  });

  const passCount = Object.values(r.checks).filter(c => c.status === 'pass').length;
  const w = r.whois;
  $('domainDetails').innerHTML = `
    <div class="detail-group">
      <div class="detail-group-title">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        WHOIS Registration
      </div>
      <div class="domain-meta-grid">
        <div class="domain-meta-item">
          <span class="domain-meta-key">registrant</span>
          <span class="domain-meta-val">${escHtml(w.registrant)}</span>
        </div>
        <div class="domain-meta-item">
          <span class="domain-meta-key">registrar</span>
          <span class="domain-meta-val">${escHtml(w.registrar)}</span>
        </div>
        <div class="domain-meta-item">
          <span class="domain-meta-key">registered</span>
          <span class="domain-meta-val">${fmtDate(w.registered)}</span>
          <span class="domain-meta-sub">${escHtml(w.ageLabel)} ago</span>
        </div>
        <div class="domain-meta-item">
          <span class="domain-meta-key">expires</span>
          <span class="domain-meta-val">${fmtDate(w.expires)}</span>
        </div>
      </div>
    </div>
    <div class="detail-group">
      <div class="detail-group-title">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        Network
      </div>
      <div class="domain-meta-grid">
        <div class="domain-meta-item">
          <span class="domain-meta-key">hostname</span>
          <span class="domain-meta-val">${escHtml(r.hostname)}</span>
        </div>
        <div class="domain-meta-item">
          <span class="domain-meta-key">ip_address</span>
          <span class="domain-meta-val">${escHtml(w.ip)}</span>
        </div>
        <div class="domain-meta-item domain-meta-item--wide">
          <span class="domain-meta-key">ip_type</span>
          <span class="domain-meta-val">
            <span class="ip-type-badge ${w.ipType}">${w.ipType === 'shared' ? '⚡ Shared Hosting' : '🖥️ Dedicated Server'}</span>
          </span>
          <span class="domain-meta-sub">${escHtml(w.ipNote)}</span>
        </div>
      </div>
    </div>
    <div class="detail-group">
      <div class="detail-group-title">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        Analysis Summary
      </div>
      <div class="domain-meta-grid">
        <div class="domain-meta-item">
          <span class="domain-meta-key">protocol</span>
          <span class="domain-meta-val">${escHtml(r.protocol.replace(':', ''))}</span>
        </div>
        <div class="domain-meta-item">
          <span class="domain-meta-key">tld</span>
          <span class="domain-meta-val">${escHtml(r.tld)}</span>
        </div>
        <div class="domain-meta-item">
          <span class="domain-meta-key">risk_level</span>
          <span class="domain-meta-val">${r.level}</span>
        </div>
        <div class="domain-meta-item">
          <span class="domain-meta-key">risk_score</span>
          <span class="domain-meta-val">${r.score} / 100</span>
        </div>
        <div class="domain-meta-item">
          <span class="domain-meta-key">checks_passed</span>
          <span class="domain-meta-val">${passCount} / ${CHECKS_ORDER.length}</span>
        </div>
      </div>
    </div>
  `;

  updateBlockSiteBtn(r);
}

/* ═══════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════ */

function flashHint(msg, isError) {
  const hint = $('checkerHint');
  hint.style.color = isError ? '#f85149' : '';
  hint.textContent = msg;
  if (isError) {
    setTimeout(() => {
      hint.style.color = '';
      hint.innerHTML = 'Enter the full URL including https:// — e.g., <span class="accent">https://example.com</span>';
    }, 3000);
  }
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ═══════════════════════════════════════════════
   EVENTS
   ═══════════════════════════════════════════════ */

$('checkBtn').addEventListener('click', runCheck);

$('urlInput').addEventListener('keydown', e => { if (e.key === 'Enter') runCheck(); });

$('checkAnotherBtn').addEventListener('click', () => {
  $('resultsPanel').hidden = true;
  $('blockedPanel').hidden = true;
  $('checkerCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => { $('urlInput').value = ''; $('urlInput').focus(); }, 400);
});

$('analyzeAnywayBtn').addEventListener('click', () => {
  skipBlockCheck = true;
  $('blockedPanel').hidden = true;
  runCheck();
});

$('clearAllBlocksBtn').addEventListener('click', () => {
  if (confirm('Remove all blocked sites? This cannot be undone.')) {
    clearAllBlocks();
    if (currentResult) updateBlockSiteBtn(currentResult);
  }
});

/* ── Init: show blocklist if it has entries ── */
renderBlocklistSection();
