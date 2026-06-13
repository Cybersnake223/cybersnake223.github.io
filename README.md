# cybersnake223.github.io

Personal portfolio — a single-file static site deployed on GitHub Pages.

**Live:** [cybersnake223.github.io](https://cybersnake223.github.io)

---

## Stack

Built with zero dependencies, zero build steps, zero frameworks. Just HTML, CSS, and vanilla JS in a single `index.html`.

| Thing | Choice |
|---|---|
| Fonts | JetBrains Mono · Fraunces · Inter (via Google Fonts) |
| Analytics | [GoatCounter](https://www.goatcounter.com/) — privacy-friendly, no cookies |
| Contact form | Formspree |
| GitHub stats | github-readme-stats · streak-stats · activity-graph |
| Hosting | GitHub Pages |

## Features

- Fully responsive — mobile nav with hamburger toggle
- Dark / light theme with OS preference detection and View Transitions API
- Scroll-driven reveal animations respecting `prefers-reduced-motion`
- Animated starfield canvas background
- Typewriter terminal widget in the hero
- Scroll progress bar
- Structured data (JSON-LD) + full Open Graph / Twitter Card meta
- GoatCounter analytics (no cookies, GDPR-friendly)
- `manifest.json` for PWA installability
- `sitemap.xml` + `robots.txt` for search indexing

## Project Structure

```
cybersnake223.github.io/
├── index.html              # Everything — markup, styles, scripts
├── resume.pdf              # CV (linked from the portfolio)
├── manifest.json           # PWA manifest
├── sitemap.xml             # For search engines
├── robots.txt
├── vicious-viper/          # Hyprland dotfiles showcase page
└── google25f06b01202c5f94.html  # Google Search Console verification
```

## Running Locally

No build step required. Just open the file:

```bash
git clone https://github.com/Cybersnake223/cybersnake223.github.io
cd cybersnake223.github.io

# Option 1 — Python (usually pre-installed)
python3 -m http.server 8080

# Option 2 — Node
npx serve .
```

Then open `http://localhost:8080`.

## Design Decisions

**Single file** — the entire site is one `index.html`. For a portfolio this size, a build system would add complexity with no real benefit. Easier to version, easier to deploy, loads fast.

**No JS framework** — vanilla JS handles scroll animations, the terminal widget, theme toggling, and nav. The total JS is ~200 lines, all inlined.

**GoatCounter over GA** — I don't want to track visitors with cookies or sell data to Google. GoatCounter gives me pageview counts with no privacy cost.

**JetBrains Mono + Fraunces** — monospace for the terminal/code aesthetic, a serif for display headings to add contrast and character. Deliberately avoiding the Inter-only look.

## License

MIT — feel free to fork and adapt for your own portfolio. Credit appreciated but not required.

---

*Built with 🐧 & vim motions · New Delhi, India*
