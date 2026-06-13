# cybersnake223.github.io

Personal portfolio — a static site deployed on GitHub Pages. Zero frameworks, zero build steps.

**Live:** [cybersnake223.github.io](https://cybersnake223.github.io)

---

## Stack

| Thing | Choice |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (external `style.min.css`) |
| Scripting | Vanilla JS (external `script.min.js`) |
| Minification | `make` — csso-cli for CSS, terser for JS |
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
- Animated gradient mesh background
- Typewriter terminal widget in the hero
- Scroll progress bar
- Structured data (JSON-LD) + full Open Graph / Twitter Card meta
- GoatCounter analytics (no cookies, GDPR-friendly)
- Offline support via service worker
- Keyboard shortcuts: <code>g p</code> projects · <code>g c</code> contact · <code>g h</code> home · <code>?</code> help
- Custom 404 page
- `manifest.json` for PWA installability
- `sitemap.xml` + `robots.txt` for search indexing
- Sub-page: [Vicious Viper](https://cybersnake223.github.io/vicious-viper/) — event-driven Hyprland dotfiles showcase

## Project Structure

```
cybersnake223.github.io/
├── index.html               # Main portfolio page
├── style.css                # Source (edit this)
├── style.min.css            # Minified (referenced from HTML)
├── script.js                # Source (edit this)
├── script.min.js            # Minified (referenced from HTML)
├── sw.js                    # Service worker (offline PWA)
├── 404.html                 # Custom 404 page
├── Makefile                 # Build: `make` minifies CSS & JS
├── resume.pdf               # CV (linked from the portfolio)
├── manifest.json            # PWA manifest
├── sitemap.xml              # For search engines
├── robots.txt
├── google25f06b01202c5f94.html  # Google Search Console verification
└── vicious-viper/
    ├── index.html           # Hyprland dotfiles showcase page
    ├── vicious-viper.css    # Source (edit this)
    └── vicious-viper.min.css # Minified (referenced from HTML)
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

**Minimal build** — a `Makefile` minifies CSS (csso-cli) and JS (terser). No bundler, no preprocessor, no framework. Run `make` after editing source files; the HTML references the minified output.

**Service worker** — enables offline access and PWA installability. Uses a network-first strategy for HTML (always fresh) and cache-first for assets (fast from cache).

**External CSS/JS** — split from the original single-file approach to let browsers cache assets independently. Changing a CSS rule no longer invalidates the cached HTML.

**GoatCounter over GA** — pageview counts with no cookies and no privacy cost.

**JetBrains Mono + Fraunces** — monospace for the terminal/code aesthetic, serif for display headings to add contrast.

## License

MIT — feel free to fork and adapt for your own portfolio. Credit appreciated but not required.

---

*Built with 🐧 & vim motions · New Delhi, India*
