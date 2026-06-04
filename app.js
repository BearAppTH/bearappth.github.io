/* ── BearAppTH Downloads ── */

/* ═══════════════════════════ i18n ═══════════════════════════ */

const I18N = {
  en: {
    'hero.eyebrow':      'Open Source · Free Forever',
    'hero.title':        'Downloads',
    'hero.sub':          'Free and open-source Android apps by <span class="accent">BearAppTH</span><br />Always the latest release — no sign-up required.',
    'bearstore.desc':    'An open-source Android app store by BearAppTH. Browse and install BearAppTH apps directly from GitHub Releases — no Google Play required.',
    'stat.downloads':    'downloads',
    'stat.verify':       'Verify on GitHub',
    'btn.download':      'Download APK',
    'btn.copy':          'Copy Link',
    'btn.share':         'Share',
    'btn.github':        'View on GitHub',
    'notes.header':      "What's new in",
    'notes.link':        'Full release notes',
    'install.title':     'How to Install on Android',
    'install.s1.title':  'Tap Download APK',
    'install.s1.desc':   "The APK file will download to your device's Downloads folder.",
    'install.s2.title':  'Open the file',
    'install.s2.desc':   'Go to Files / My Files and tap the downloaded <code>.apk</code> file to begin installation.',
    'install.s3.title':  'Allow unknown sources',
    'install.s3.desc':   'Android will prompt you — tap <em>Settings</em> and enable "Install unknown apps" for your file manager or browser, then go back and tap Install.',
    'install.s4.title':  'Done — open the app',
    'install.s4.desc':   'Tap Open after installation completes and the app is ready to use.',
    'history.title':     'Release History',
    'history.all':       'All releases →',
    'history.latest':    'latest',
    'history.notes':     'Notes',
    'copy.done':         'Copied!',
  },
  th: {
    'hero.eyebrow':      'โอเพนซอร์ส · ฟรีตลอดไป',
    'hero.title':        'ดาวน์โหลด',
    'hero.sub':          'แอป Android โอเพนซอร์สฟรีโดย <span class="accent">BearAppTH</span><br />เวอร์ชันล่าสุดเสมอ — ไม่ต้องสมัครสมาชิก',
    'bearstore.desc':    'แอปสโตร์ Android โอเพนซอร์สโดย BearAppTH เรียกดูและติดตั้งแอปของ BearAppTH ได้โดยตรงจาก GitHub Releases — ไม่ต้องผ่าน Google Play',
    'stat.downloads':    'ครั้งดาวน์โหลด',
    'stat.verify':       'ตรวจสอบบน GitHub',
    'btn.download':      'ดาวน์โหลด APK',
    'btn.copy':          'คัดลอกลิงก์',
    'btn.share':         'แชร์',
    'btn.github':        'ดูบน GitHub',
    'notes.header':      'มีอะไรใหม่ใน',
    'notes.link':        'ดูรายละเอียดทั้งหมด',
    'install.title':     'วิธีติดตั้งบน Android',
    'install.s1.title':  'กดดาวน์โหลด APK',
    'install.s1.desc':   'ไฟล์ APK จะถูกดาวน์โหลดไปยังโฟลเดอร์ Downloads ของเครื่อง',
    'install.s2.title':  'เปิดไฟล์',
    'install.s2.desc':   'ไปที่แอป Files หรือ My Files แล้วกดที่ไฟล์ <code>.apk</code> ที่ดาวน์โหลดมา',
    'install.s3.title':  'อนุญาตการติดตั้งจากแหล่งอื่น',
    'install.s3.desc':   'Android จะแจ้งให้ไปตั้งค่า กดเปิดใช้ "Install unknown apps" สำหรับแอปที่ใช้ดาวน์โหลด แล้วกลับมากด Install',
    'install.s4.title':  'เสร็จแล้ว — เปิดแอป',
    'install.s4.desc':   'กด Open หลังติดตั้งเสร็จ แอปพร้อมใช้งานได้ทันที',
    'history.title':     'ประวัติการอัพเดต',
    'history.all':       'ทั้งหมด →',
    'history.latest':    'ล่าสุด',
    'history.notes':     'รายละเอียด',
    'copy.done':         'คัดลอกแล้ว!',
  },
};

let currentLang = localStorage.getItem('lang') || 'en';

function t(key) {
  return I18N[currentLang]?.[key] ?? I18N.en[key] ?? key;
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (el.dataset.i18nHtml !== undefined) {
      el.innerHTML = val;
    } else {
      el.textContent = val;
    }
  });

  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = lang === 'en' ? 'TH' : 'EN';

  /* Re-format release dates on cards */
  document.querySelectorAll('.js-release-date[data-iso]').forEach(el => {
    el.textContent = fmtDate(el.dataset.iso);
  });

  /* Re-render history with translated labels */
  Object.entries(cachedReleases).forEach(([id, list]) => renderHistory(id, list));
}

/* ═══════════════════════════ Theme ═══════════════════════════ */

function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  setTheme(saved, false);
}

function setTheme(theme, save = true) {
  document.documentElement.dataset.theme = theme;
  if (save) localStorage.setItem('theme', theme);
  const moon = document.querySelector('.icon-moon');
  const sun  = document.querySelector('.icon-sun');
  if (moon) moon.hidden = theme === 'light';
  if (sun)  sun.hidden  = theme === 'dark';
}

document.getElementById('themeToggle')?.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme;
  setTheme(current === 'dark' ? 'light' : 'dark');
});

document.getElementById('langToggle')?.addEventListener('click', () => {
  applyLanguage(currentLang === 'en' ? 'th' : 'en');
});

/* ═══════════════════════════ Copy Link ═══════════════════════════ */

function copyLink(btn) {
  const card  = btn.closest('.project-card');
  const dlBtn = card?.querySelector('.js-download-btn');
  if (!dlBtn || dlBtn.getAttribute('href') === '#') return;
  const url = dlBtn.href;
  if (!url) return;

  navigator.clipboard.writeText(url).then(() => {
    const span = btn.querySelector('[data-i18n]');
    const orig = t('btn.copy');
    if (span) span.textContent = t('copy.done');
    btn.disabled = true;
    setTimeout(() => {
      if (span) span.textContent = orig;
      btn.disabled = false;
    }, 2000);
  }).catch(() => {});
}

/* ═══════════════════════════ Share ═══════════════════════════ */

function shareApp(btn) {
  const card = btn.closest('.project-card');
  const name = card?.querySelector('.project-name')?.textContent?.trim() || 'BearAppTH';
  const dlBtn = card?.querySelector('.js-download-btn');
  const url = (dlBtn && dlBtn.getAttribute('href') !== '#') ? dlBtn.href : location.href;
  navigator.share({ title: name, text: `Download ${name} APK`, url }).catch(() => {});
}

/* ═══════════════════════════ JSON-LD ═══════════════════════════ */

function updateJsonLd(version) {
  const el = document.querySelector('script[type="application/ld+json"]');
  if (!el) return;
  try {
    const data = JSON.parse(el.textContent);
    if (data.mainEntity) data.mainEntity.softwareVersion = version.replace(/^v/, '');
    el.textContent = JSON.stringify(data);
  } catch {}
}

/* ═══════════════════════════ GitHub API ═══════════════════════════ */

const GH_HEADERS = { Accept: 'application/vnd.github+json' };

async function fetchLatestRelease(owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, { headers: GH_HEADERS });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function fetchReleases(owner, repo, n = 5) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=${n}`, { headers: GH_HEADERS });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function fetchRepoInfo(owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: GH_HEADERS });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

function findApkAsset(assets) {
  return (assets || []).find(a => a.name.endsWith('.apk')) || null;
}

function fmtBytes(b) {
  if (!b) return '';
  return b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
}

function fmtCount(n) {
  if (n == null) return null;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function fmtDate(iso) {
  const locale = currentLang === 'th' ? 'th-TH' : 'en-US';
  return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

function stripMarkdown(text) {
  return (text || '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\r\n/g, '\n')
    .trim();
}

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ═══════════════════════════ Update Card ═══════════════════════════ */

function updateCard(card, { version, downloadUrl, fileSize, dlCount, releaseDateIso, notes, releaseUrl }) {
  if (version) card.querySelectorAll('.js-version').forEach(el => { el.textContent = version; });
  const dlBtn = card.querySelector('.js-download-btn');
  if (dlBtn && downloadUrl) dlBtn.href = downloadUrl;
  const sizeEl = card.querySelector('.js-file-size');
  if (sizeEl) sizeEl.textContent = fileSize || '—';
  const countEl = card.querySelector('.js-dl-count');
  if (countEl) countEl.textContent = dlCount != null ? dlCount : '—';
  if (releaseDateIso) {
    const dateEl   = card.querySelector('.js-release-date');
    const dateStat = card.querySelector('.js-release-date-stat');
    const dateSep  = card.querySelector('.js-release-date-sep');
    if (dateEl) { dateEl.textContent = fmtDate(releaseDateIso); dateEl.dataset.iso = releaseDateIso; }
    if (dateStat) dateStat.hidden = false;
    if (dateSep)  dateSep.hidden  = false;
  }
  const notesEl = card.querySelector('.js-release-notes');
  if (notesEl && notes) notesEl.textContent = notes;
  const linkEl = card.querySelector('.js-release-link');
  if (linkEl && releaseUrl) linkEl.href = releaseUrl;
  const verifyEl = card.querySelector('.js-verify-link');
  if (verifyEl && releaseUrl) verifyEl.href = releaseUrl;
}

function updateRepoStats(card, { stars, language, langColor }) {
  const starsStat = card.querySelector('.js-stars-stat');
  if (starsStat && stars != null) {
    card.querySelector('.js-star-count').textContent = fmtCount(stars);
    starsStat.hidden = false;
  }
  const langStat = card.querySelector('.js-lang-stat');
  if (langStat && language) {
    const dot  = card.querySelector('.js-lang-dot');
    const text = card.querySelector('.js-lang-text');
    if (dot)  dot.style.background = langColor || '#8b949e';
    if (text) text.textContent = language;
    langStat.hidden = false;
  }
}

/* ═══════════════════════════ Language colors ═══════════════════════════ */

const LANG_COLORS = {
  Java: '#b07219', Kotlin: '#7f52ff', JavaScript: '#f1e05a',
  TypeScript: '#3178c6', Python: '#3572A5', Swift: '#f05138',
  'C++': '#f34b7d', Go: '#00add8', Rust: '#dea584',
};

/* ═══════════════════════════ Release History ═══════════════════════════ */

const cachedReleases = {};

function renderHistory(containerId, releases) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!releases?.length) {
    const section = document.getElementById('history-section-bear-store');
    if (section) section.hidden = true;
    return;
  }

  container.innerHTML = releases.map((r, i) => {
    const notes = stripMarkdown(r.body);
    return `
      <div class="history-entry">
        <div class="history-item" role="button" tabindex="0" aria-expanded="false">
          <div class="history-tag">
            ${i === 0 ? `<span class="history-latest-chip">${escHtml(t('history.latest'))}</span>` : ''}
            <span class="history-version">${escHtml(r.tag_name)}</span>
          </div>
          <div class="history-meta">
            <span class="history-title">${escHtml(r.name || r.tag_name)}</span>
            <span class="history-date">${fmtDate(r.published_at)}</span>
          </div>
          <svg class="history-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        ${notes ? `
        <div class="history-notes" hidden>
          <p class="history-notes-text">${escHtml(notes)}</p>
          <a href="${escHtml(r.html_url)}" class="history-gh-link" target="_blank" rel="noopener noreferrer">
            ${escHtml(t('history.notes'))} on GitHub →
          </a>
        </div>` : ''}
      </div>
    `;
  }).join('');
}

/* Toggle release notes open/closed */
document.addEventListener('click', e => {
  const toggle = e.target.closest('.release-notes-toggle');
  if (!toggle) return;
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!expanded));
  const body = document.getElementById(toggle.getAttribute('aria-controls'));
  if (body) body.hidden = expanded;
});

/* Toggle history section open/closed */
document.addEventListener('click', e => {
  const toggle = e.target.closest('.history-toggle');
  if (!toggle) return;
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!expanded));
  const wrap = document.getElementById(toggle.getAttribute('aria-controls'));
  if (wrap) wrap.hidden = expanded;
});

/* Expand individual history items */
document.addEventListener('click', e => {
  const item = e.target.closest('.history-item[role="button"]');
  if (!item) return;
  const expanded = item.getAttribute('aria-expanded') === 'true';
  item.setAttribute('aria-expanded', String(!expanded));
  const notes = item.nextElementSibling;
  if (notes?.classList.contains('history-notes')) notes.hidden = expanded;
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const item = e.target.closest('.history-item[role="button"]');
  if (item) { e.preventDefault(); item.click(); }
});

/* ═══════════════════════════ Project Loading ═══════════════════════════ */

const PROJECTS = [
  {
    cardId:    'bear-store',
    historyId: 'bear-store-history',
    owner:     'BearAppTH',
    repo:      'BearApp',
    fallback: {
      version:     'v1.0.0',
      downloadUrl: 'https://github.com/BearAppTH/BearApp/releases/latest',
      notes:       'Visit the GitHub releases page to download the latest version.',
      releaseUrl:  'https://github.com/BearAppTH/BearApp/releases/latest',
    },
  },
];

async function loadProject(project) {
  const card = document.getElementById(project.cardId);
  if (!card) return;

  card.querySelector('.js-copy-btn')?.addEventListener('click', function () {
    copyLink(this);
  });

  const shareBtn = card.querySelector('.js-share-btn');
  if (shareBtn) {
    if (navigator.share) {
      shareBtn.hidden = false;
      shareBtn.addEventListener('click', function () { shareApp(this); });
    }
  }

  /* Static project — URL stored in JS only, not fetched from API */
  if (project.type === 'static') {
    updateCard(card, {
      version:     project.version     || null,
      downloadUrl: project.downloadUrl || null,
      fileSize:    null,
      dlCount:     null,
      notes:       null,
      releaseUrl:  null,
    });
    return;
  }

  /* GitHub project — apply fallback then fetch live data */
  updateCard(card, { ...project.fallback, fileSize: null, dlCount: null });

  try {
    const [release, releases, repo] = await Promise.all([
      fetchLatestRelease(project.owner, project.repo),
      fetchReleases(project.owner, project.repo, 5),
      fetchRepoInfo(project.owner, project.repo),
    ]);

    const apk = findApkAsset(release.assets);

    updateCard(card, {
      version:     release.tag_name || project.fallback.version,
      downloadUrl: apk?.browser_download_url || project.fallback.downloadUrl,
      fileSize:    apk ? fmtBytes(apk.size) : null,
      dlCount:     apk ? fmtCount(apk.download_count) : null,
      releaseDateIso: release.published_at || null,
      notes:       stripMarkdown(release.body) || project.fallback.notes,
      releaseUrl:  release.html_url || project.fallback.releaseUrl,
    });

    updateRepoStats(card, {
      stars:     repo.stargazers_count,
      language:  repo.language,
      langColor: LANG_COLORS[repo.language],
    });

    updateJsonLd(release.tag_name || project.fallback.version);

    cachedReleases[project.historyId] = releases;
    renderHistory(project.historyId, releases);

  } catch {
    const section = document.getElementById('history-section-bear-store');
    if (section) section.hidden = true;
  }
}

/* ═══════════════════════════ Init ═══════════════════════════ */

initTheme();
if (currentLang !== 'en') applyLanguage(currentLang);

PROJECTS.forEach(loadProject);
