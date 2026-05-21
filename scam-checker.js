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
  /paypa[^y]/i,
  /go{2,}gle/i,
  /faceb[o0]{1,}k/i,
  /amaz[o0]n-?(?:support|help|secure)/i,
  /netfl[i1]x/i,
  /micros[o0]ft-?(?:support|help|secure)/i,
  /appl[e3]-?(?:support|id|pay)/i,
  /inst[a@]gr[a@]m/i,
];

const CHECKS_ORDER = ['https', 'tld', 'structure', 'keywords', 'spoof', 'blacklist'];

const CHECK_META = {
  https:     { label: 'HTTPS Protocol',       scanMsg: 'Verifying SSL / TLS…' },
  tld:       { label: 'TLD Reputation',        scanMsg: 'Looking up domain extension…' },
  structure: { label: 'Domain Structure',      scanMsg: 'Analysing domain patterns…' },
  keywords:  { label: 'Suspicious Keywords',   scanMsg: 'Scanning keyword signatures…' },
  spoof:     { label: 'Brand Spoofing',         scanMsg: 'Checking brand impersonation…' },
  blacklist: { label: 'Threat Database',        scanMsg: 'Cross-referencing threat lists…' },
};

const STATUS_ICON = { pass: '✅', warn: '⚠️', fail: '❌' };

/* ── Analysis ── */

function analyzeURL(raw) {
  const href = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
  let parsed;
  try { parsed = new URL(href); } catch { return null; }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const protocol = parsed.protocol;
  const parts    = hostname.split('.');
  const tld      = '.' + parts[parts.length - 1];
  const domain   = parts.length >= 2 ? parts[parts.length - 2] : hostname;
  let score = 100;
  const checks = {};

  /* 1 — HTTPS */
  if (protocol === 'https:') {
    checks.https = { status: 'pass', detail: 'Encrypted connection confirmed' };
  } else {
    checks.https = { status: 'fail', detail: 'No encryption — data sent in plain text' };
    score -= 30;
  }

  /* 2 — TLD */
  if (SUSPICIOUS_TLDS.has(tld)) {
    checks.tld = { status: 'fail', detail: `"${tld}" is commonly abused for spam and scams` };
    score -= 22;
  } else if (MODERATE_TLDS.has(tld)) {
    checks.tld = { status: 'warn', detail: `"${tld}" has a moderate-risk profile` };
    score -= 8;
  } else {
    checks.tld = { status: 'pass', detail: `"${tld}" has a trusted reputation` };
  }

  /* 3 — Domain structure */
  const hyphens  = (hostname.match(/-/g) || []).length;
  const digits   = (domain.match(/\d/g) || []).length;
  const charLen  = hostname.length;
  if (hyphens >= 4 || charLen > 55) {
    checks.structure = { status: 'fail', detail: `${hyphens} hyphens · ${charLen} chars — highly suspicious` };
    score -= 18;
  } else if (hyphens >= 2 || digits >= 3) {
    checks.structure = { status: 'warn', detail: `${hyphens} hyphens · ${digits} digits — review advised` };
    score -= 8;
  } else {
    checks.structure = { status: 'pass', detail: `${charLen} chars · clean structure` };
  }

  /* 4 — Keywords */
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

  /* 5 — Brand spoofing */
  if (BRAND_SPOOF_RE.some(re => re.test(hostname))) {
    checks.spoof = { status: 'fail', detail: 'Possible brand name impersonation detected' };
    score -= 30;
  } else {
    checks.spoof = { status: 'pass', detail: 'No brand spoofing patterns found' };
  }

  /* 6 — Threat database (simulated from cumulative risk) */
  score = Math.max(0, score);
  if (score < 35) {
    checks.blacklist = { status: 'fail', detail: 'Matches patterns in known threat databases' };
    score = Math.max(0, score - 5);
  } else if (score < 58) {
    checks.blacklist = { status: 'warn', detail: 'Partial match — flagged for manual review' };
  } else {
    checks.blacklist = { status: 'pass', detail: 'Not found in threat databases' };
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const level = score >= 75 ? 'safe' : score >= 45 ? 'warn' : 'danger';

  return { score, level, checks, hostname, protocol, tld, domain };
}

/* ── DOM helpers ── */
const $ = id => document.getElementById(id);

/* ── Scan animation ── */
async function runCheck() {
  if ($('checkBtn').disabled) return;

  const raw = $('urlInput').value.trim();
  if (!raw) {
    $('urlInput').focus();
    flashHint('Please enter a URL first.', true);
    return;
  }

  const result = analyzeURL(raw);
  if (!result) {
    flashHint('Invalid URL — please use a valid domain, e.g. https://example.com', true);
    return;
  }

  /* UI — start */
  $('checkBtn').disabled = true;
  $('checkBtn').innerHTML = `
    <div style="width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .65s linear infinite" aria-hidden="true"></div>
    Analyzing…
  `;

  $('resultsPanel').hidden  = true;
  $('scanningPanel').hidden = false;
  $('scanChecksList').innerHTML = '';
  $('scanProgressFill').style.width = '0%';

  /* Run checks with staggered delay */
  for (let i = 0; i < CHECKS_ORDER.length; i++) {
    const id = CHECKS_ORDER[i];
    $('scanningLabel').textContent = CHECK_META[id].scanMsg;
    $('scanProgressFill').style.width = `${Math.round(((i + 0.5) / CHECKS_ORDER.length) * 100)}%`;

    await delay(260 + Math.random() * 180);

    const chk  = result.checks[id];
    const item = document.createElement('div');
    item.className = 'scan-check-item';
    item.innerHTML = `<span aria-hidden="true">${STATUS_ICON[chk.status]}</span><span>${CHECK_META[id].label}</span>`;
    $('scanChecksList').appendChild(item);

    $('scanProgressFill').style.width = `${Math.round(((i + 1) / CHECKS_ORDER.length) * 100)}%`;
  }

  $('scanningLabel').textContent = 'Compiling report…';
  await delay(320);

  /* UI — show results */
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

/* ── Render results ── */
function renderResults(r) {
  const VERDICTS = {
    safe:   {
      icon:  '🛡️',
      title: 'Looks Safe',
      desc:  'No significant threats detected. This site appears legitimate based on our analysis.',
    },
    warn:   {
      icon:  '⚠️',
      title: 'Proceed with Caution',
      desc:  'Some risk factors detected. Verify the site\'s identity before entering sensitive information.',
    },
    danger: {
      icon:  '🚨',
      title: 'High Risk — Avoid',
      desc:  'Multiple red flags detected. This site may be a phishing, scam, or spam website.',
    },
  };

  const v  = VERDICTS[r.level];
  const vc = $('verdictCard');

  vc.className            = `verdict-card ${r.level}`;
  $('verdictIcon').textContent  = v.icon;
  $('verdictTitle').textContent = v.title;
  $('verdictDesc').textContent  = v.desc;

  $('riskScoreFill').className  = `risk-score-fill ${r.level}`;
  $('riskScoreFill').style.width = '0%';
  requestAnimationFrame(() => {
    $('riskScoreFill').style.width = `${r.score}%`;
  });
  $('riskScoreNum').className   = `risk-score-num ${r.level}`;
  $('riskScoreNum').textContent = `${r.score}/100`;

  /* Check items */
  const grid = $('checksGrid');
  grid.innerHTML = '';
  CHECKS_ORDER.forEach((id, i) => {
    const chk = r.checks[id];
    const div = document.createElement('div');
    div.className             = `check-item ${chk.status}`;
    div.style.animationDelay = `${i * 55}ms`;
    div.innerHTML = `
      <span class="check-status-icon" aria-hidden="true">${STATUS_ICON[chk.status]}</span>
      <div class="check-info">
        <div class="check-label">${CHECK_META[id].label}</div>
        <div class="check-detail">${escHtml(chk.detail)}</div>
      </div>
    `;
    grid.appendChild(div);
  });

  /* Domain meta */
  const passCount = Object.values(r.checks).filter(c => c.status === 'pass').length;
  $('domainDetails').innerHTML = `
    <div class="domain-details-title">// Analysis Target</div>
    <div class="domain-meta-grid">
      <div class="domain-meta-item">
        <span class="domain-meta-key">hostname</span>
        <span class="domain-meta-val">${escHtml(r.hostname)}</span>
      </div>
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
  `;
}

/* ── Helpers ── */
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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ── Events ── */
$('checkBtn').addEventListener('click', runCheck);

$('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') runCheck();
});

$('checkAnotherBtn').addEventListener('click', () => {
  $('resultsPanel').hidden = true;
  $('checkerCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => {
    $('urlInput').value = '';
    $('urlInput').focus();
  }, 400);
});
