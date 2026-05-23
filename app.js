/* ── BearAppTH Downloads — GitHub Release Fetcher ── */

const PROJECTS = [
  {
    cardId:    'microg-re',
    historyId: 'microg-history',
    owner:     'BearAppTH',
    repo:      'MicroG-RE',
    fallback: {
      version:     'v3.0.1',
      downloadUrl: 'https://github.com/BearAppTH/MicroG-RE/releases/download/v3.0.1/bear-microg-v3.0.1.apk',
      notes:       'Fixed settings tab crash caused by platform/non-platform transition mismatch. Updated app icon to Bear MicroG logo. Filled icon backgrounds to eliminate white corners.',
      releaseUrl:  'https://github.com/BearAppTH/MicroG-RE/releases/tag/v3.0.1',
    },
  },
];

const GH_HEADERS = { Accept: 'application/vnd.github+json' };

async function fetchLatestRelease(owner, repo) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
    { headers: GH_HEADERS }
  );
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function fetchReleases(owner, repo, perPage = 5) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases?per_page=${perPage}`,
    { headers: GH_HEADERS }
  );
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

function findApkAsset(assets) {
  return (assets || []).find(a => a.name.endsWith('.apk')) || null;
}

function fmtBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function fmtCount(n) {
  if (n == null) return null;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: '2-digit',
  });
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
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Update project card with release data ── */

function updateCard(card, { version, downloadUrl, fileSize, dlCount, notes, releaseUrl }) {
  if (version) {
    card.querySelectorAll('.js-version').forEach(el => { el.textContent = version; });
  }

  const dlBtn = card.querySelector('.js-download-btn');
  if (dlBtn && downloadUrl) dlBtn.href = downloadUrl;

  const sizeEl = card.querySelector('.js-file-size');
  if (sizeEl) sizeEl.textContent = fileSize || '—';

  const countEl = card.querySelector('.js-dl-count');
  if (countEl) countEl.textContent = dlCount != null ? dlCount : '—';

  const notesEl = card.querySelector('.js-release-notes');
  if (notesEl && notes) notesEl.textContent = notes;

  const linkEl = card.querySelector('.js-release-link');
  if (linkEl && releaseUrl) linkEl.href = releaseUrl;

  const verifyEl = card.querySelector('.js-verify-link');
  if (verifyEl && releaseUrl) verifyEl.href = releaseUrl;
}

/* ── Render release history list ── */

function renderHistory(containerId, releases) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!releases || !releases.length) {
    const section = document.getElementById('history-section-microg');
    if (section) section.hidden = true;
    return;
  }

  container.innerHTML = releases.map((r, i) => `
    <div class="history-item${i === 0 ? ' history-item--latest' : ''}">
      <div class="history-tag">
        ${i === 0 ? '<span class="history-latest-chip">latest</span>' : ''}
        <span class="history-version">${escHtml(r.tag_name)}</span>
      </div>
      <div class="history-meta">
        <span class="history-title">${escHtml(r.name || r.tag_name)}</span>
        <span class="history-date">${fmtDate(r.published_at)}</span>
      </div>
      <a href="${escHtml(r.html_url)}"
         class="history-link"
         target="_blank" rel="noopener noreferrer"
         aria-label="Release notes for ${escHtml(r.tag_name)}">
        Notes
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>
    </div>
  `).join('');
}

/* ── Error / fallback banner ── */

function showFallbackBanner() {
  const banner = document.getElementById('fetchBanner');
  if (banner) banner.hidden = false;
}

/* ── Main load function ── */

async function loadProject(project) {
  const card = document.getElementById(project.cardId);
  if (!card) return;

  /* Apply fallback immediately so the button is always usable */
  updateCard(card, {
    version:     project.fallback.version,
    downloadUrl: project.fallback.downloadUrl,
    notes:       project.fallback.notes,
    releaseUrl:  project.fallback.releaseUrl,
    fileSize:    null,
    dlCount:     null,
  });

  try {
    /* Fetch latest release and history in parallel */
    const [release, releases] = await Promise.all([
      fetchLatestRelease(project.owner, project.repo),
      fetchReleases(project.owner, project.repo, 5),
    ]);

    const apk = findApkAsset(release.assets);

    updateCard(card, {
      version:     release.tag_name  || project.fallback.version,
      downloadUrl: apk ? apk.browser_download_url : project.fallback.downloadUrl,
      fileSize:    apk ? fmtBytes(apk.size)        : null,
      dlCount:     apk ? fmtCount(apk.download_count) : null,
      notes:       stripMarkdown(release.body)     || project.fallback.notes,
      releaseUrl:  release.html_url                || project.fallback.releaseUrl,
    });

    renderHistory(project.historyId, releases);

  } catch {
    /* Button still works via fallback — just show the info banner */
    showFallbackBanner();
    const section = document.getElementById('history-section-microg');
    if (section) section.hidden = true;
  }
}

PROJECTS.forEach(loadProject);
