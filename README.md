<div align="center">

# &lt;BearAppTH /&gt; · Downloads

**Free and open-source Android apps by BearAppTH 🇹🇭**

[![Website](https://img.shields.io/badge/Website-bearappth.github.io-3fb950?style=flat-square&logo=github&logoColor=white)](https://bearappth.github.io)
[![GitHub](https://img.shields.io/badge/GitHub-BearAppTH-58a6ff?style=flat-square&logo=github&logoColor=white)](https://github.com/BearAppTH)

</div>

---

## 🐻 About

Download page for open-source Android apps developed by BearAppTH. Built with plain HTML, CSS, and vanilla JavaScript — no frameworks, no build step. Deployed automatically via GitHub Pages on every push to `main`.

The download button for each project always points to the **latest published release** — fetched live from the GitHub Releases API on page load, with a hardcoded fallback so the button works even when the API is unavailable.

---

## 📦 Projects

| Project | Description | Latest |
|---|---|---|
| **Bear MicroG** | Open-source Google Play Services alternative for Android | [![Release](https://img.shields.io/github/v/release/BearAppTH/MicroG-RE?style=flat-square&color=3fb950)](https://github.com/BearAppTH/MicroG-RE/releases/latest) |

---

## ✨ Features

- **Live release data** — GitHub API fetched at runtime; version badge, file size, and download URL update automatically on every new release
- **Hardcoded fallback** — download button always works, even offline or when API is rate-limited
- **Dark theme** — GitHub-style dark palette with green download CTA
- **Fully responsive** — mobile-first layout with fluid `clamp()` sizing
- **No sign-up required** — direct APK download, no tracking

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | CSS3 — custom properties, `clamp()`, Flexbox |
| Scripting | Vanilla JavaScript (ES2020+) |
| Fonts | Inter + JetBrains Mono via Google Fonts |
| Hosting | GitHub Pages |
| Release data | GitHub Releases API |

---

## 📁 Structure

```
bearappth.github.io/
├── index.html   # Download page — project cards, buttons, release notes
├── style.css    # Design system — dark theme, components, responsive rules
├── app.js       # GitHub API fetcher — updates version/download/notes live
└── CLAUDE.md    # AI assistant project rules
```

---

## 🚀 How the Download Button Works

1. Page loads with hardcoded fallback values (current latest release)
2. `app.js` calls `https://api.github.com/repos/BearAppTH/<repo>/releases/latest`
3. Finds the `.apk` asset and updates the button `href` to `browser_download_url`
4. Version badge, file size, and release notes update to match the live release
5. If the API fails, fallback values remain — the button is always functional

---

## 📄 License

[MIT](LICENSE)

---

<div align="center">
  Made with ❤️ and lots of ☕ by <strong>BearAppTH</strong>
</div>
