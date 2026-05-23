/* ── BearAppTH Downloads — GitHub Release Fetcher ── */

const PROJECTS = [
  {
    cardId:  'microg-re',
    owner:   'BearAppTH',
    repo:    'MicroG-RE',
    fallback: {
      version:     'v3.0.1',
      downloadUrl: 'https://github.com/BearAppTH/MicroG-RE/releases/download/v3.0.1/bear-microg-v3.0.1.apk',
      notes:       'Fixed settings tab crash caused by platform/non-platform transition mismatch. Updated app icon to Bear MicroG logo. Filled icon backgrounds to eliminate white corners.',
      releaseUrl:  'https://github.com/BearAppTH/MicroG-RE/releases/tag/v3.0.1',
    },
  },
];

async function fetchLatestRelease(owner, repo) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
    { headers: { Accept: 'application/vnd.github+json' } }
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

function stripMarkdown(text) {
  return (text || '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\r\n/g, '\n')
    .trim();
}

function updateCard(card, { version, downloadUrl, fileSize, notes, releaseUrl }) {
  card.querySelectorAll('.js-version').forEach(el => {
    el.textContent = version;
  });

  const dlBtn = card.querySelector('.js-download-btn');
  if (dlBtn && downloadUrl) {
    dlBtn.href = downloadUrl;
  }

  const sizeEl = card.querySelector('.js-file-size');
  if (sizeEl && fileSize) sizeEl.textContent = fileSize;

  const notesEl = card.querySelector('.js-release-notes');
  if (notesEl && notes) notesEl.textContent = notes;

  const linkEl = card.querySelector('.js-release-link');
  if (linkEl && releaseUrl) linkEl.href = releaseUrl;
}

async function loadProject(project) {
  const card = document.getElementById(project.cardId);
  if (!card) return;

  /* Use fallback values immediately so the button is always usable */
  updateCard(card, {
    version:     project.fallback.version,
    downloadUrl: project.fallback.downloadUrl,
    notes:       project.fallback.notes,
    releaseUrl:  project.fallback.releaseUrl,
    fileSize:    null,
  });

  /* Try to pull live data from GitHub API and update */
  try {
    const release = await fetchLatestRelease(project.owner, project.repo);
    const apk     = findApkAsset(release.assets);

    updateCard(card, {
      version:     release.tag_name  || project.fallback.version,
      downloadUrl: apk ? apk.browser_download_url : project.fallback.downloadUrl,
      fileSize:    apk ? fmtBytes(apk.size) : null,
      notes:       stripMarkdown(release.body) || project.fallback.notes,
      releaseUrl:  release.html_url || project.fallback.releaseUrl,
    });
  } catch {
    /* fallback already applied above — silently do nothing */
  }
}

PROJECTS.forEach(loadProject);
