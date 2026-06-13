# cybersnake223.github.io

Personal portfolio — a static site deployed on GitHub Pages. Zero frameworks, zero build steps.

**Live:** [cybersnake223.github.io](https://cybersnake223.github.io)

---

## Stack

| Thing | Choice |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (external `style.css`) |
| Scripting | Vanilla JS (external `script.js`) |
| Fonts | JetBrains Mono · Fraunces · Inter (via Google Fonts) |
| Analytics | [GoatCounter](https://www.goatcounter.com/) — privacy-friendly, no cookies |
| Contact form | Formspree |
| GitHub stats | github-readme-stats · streak-stats · activity-graph |
| Hosting | GitHub Pages |
| PWA | Service worker + manifest.json for offline support |

## Features

- Fully responsive — mobile nav with hamburger toggle
- Dark / light theme with OS preference detection and View Transitions API
- Scroll-driven reveal animations respecting `prefers-reduced-motion`
- Typewriter terminal widget in the hero
- Scroll progress bar
- Structured data (JSON-LD) + full Open Graph / Twitter Card meta
- GoatCounter analytics (no cookies, GDPR-friendly)
- Offline support via service worker
- Custom 404 page
- `manifest.json` for PWA installability
- `sitemap.xml` + `robots.txt` for search indexing
- Sub-page: [Vicious Viper](https://cybersnake223.github.io/vicious-viper/) — event-driven Hyprland dotfiles showcase
- Contribution snake — animated snake devouring GitHub activity squares, generated daily via `Platane/snk` GitHub Action

## Project Structure

```
cybersnake223.github.io/
├── index.html               # Main portfolio page
├── style.css                # All styles
├── script.js                # All JavaScript
├── sw.js                    # Service worker (offline PWA)
├── 404.html                 # Custom 404 page
├── resume.pdf               # CV (linked from the portfolio)
├── manifest.json            # PWA manifest
├── sitemap.xml              # For search engines
├── robots.txt
├── google25f06b01202c5f94.html  # Google Search Console verification
├── output/                      # Generated contribution snake SVGs (from GitHub Actions)
├── .github/workflows/
│   └── snake.yml                # Daily workflow to generate contribution snake
└── vicious-viper/
    ├── index.html           # Hyprland dotfiles showcase page
    └── vicious-viper.css    # Vicious Viper styles
```

## Running Locally

```bash
git clone https://github.com/Cybersnake223/cybersnake223.github.io
cd cybersnake223.github.io

python3 -m http.server 8080
# or
npx serve .
```

Then open `http://localhost:8080`.

## Design Decisions

**External CSS/JS** — styles and scripts are separate files so browsers cache them independently. No bundler, no preprocessor, no framework.

**Service worker** — enables offline access and PWA installability. Uses network-first for HTML (always fresh) and cache-first for assets (fast from cache).

**GoatCounter over GA** — pageview counts with no cookies and no privacy cost.

**JetBrains Mono + Fraunces** — monospace for the terminal/code aesthetic, serif for display headings to add contrast.

## License

MIT — feel free to fork and adapt for your own portfolio. Credit appreciated but not required.

---

*Built with 🐧 & vim motions · New Delhi, India*
