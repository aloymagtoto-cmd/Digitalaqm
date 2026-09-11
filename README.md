# AQM Digital Marketing — site

A single-page site for an independent paid-media practice: full-funnel media buying,
measurement, and conversion work. Dark by default, light theme included, no build step, no
dependencies.

```
index.html
assets/
  css/style.css
  js/main.js
```

Open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000   # → http://localhost:8000
```

## Structure

| Section | Notes |
| --- | --- |
| Hero | Line-by-line type reveal; five animated stats (9+ yrs, $117K+ managed, 9.08× peak ROAS, 2,400+ leads, 5 platforms) |
| Marquee | Platform ticker, pauses on hover |
| What I do | Six capabilities — media buying, measurement, ASO, brand & content, conversion & web, privacy & compliance |
| Work | Seven case studies with metrics, each with the account notes behind the numbers |
| How I work | Four-step loop: audit measurement → find the break → buy against real signal → hold efficiency while scaling |
| Experience | Six roles — California Recovery Center, Executive Optical, Ubertech, NXT Gen Garage, Chapter One, MerQado PH |
| Stack | Six tool groups, from ad platforms to commerce and creative |
| Contact | Email, phone/WhatsApp/Viber, plus a form |

All copy and every metric come from the source deck. The two headline case studies
(California Recovery Center, NXT Gen Garage) span the full grid width; the rest sit in a
two-column layout that collapses to one under 900px.

## Interactions

`assets/js/main.js` — preloader, theme toggle (persisted to `localStorage`), scroll-hiding
nav, mobile menu, `IntersectionObserver` reveals with a stagger, count-ups (with prefix,
suffix, decimal, and thousands formatting), a custom cursor with contextual labels, magnetic
buttons, pointer parallax on the background orbs, click-to-copy email, and form validation.

Everything degrades: `prefers-reduced-motion` disables animation and the cursor, and the
layout holds down to 390px.

## Customising

- **Colours** — the tokens at the top of `style.css` (`--accent`, `--accent-2`, `--accent-3`).
  The `[data-theme="light"]` block overrides them for light mode.
- **Type** — `--font-display` / `--font-body`. Fonts load from Google Fonts; swap the `<link>`
  in `index.html` to self-host.
- **Case studies** — all in `index.html`. Each is a `.work__item` with a `.work__metrics` grid
  (six metrics) and a `.work__notes` list. Add `work__item--wide` to make one span both columns.
- **Thumbnails** — currently CSS gradients (`.work__thumb--1` … `--7`). Swap in real campaign
  screenshots or dashboard captures when you have shareable ones.

## Contact form

There is no backend. On submit the form validates, then composes a `mailto:` to
`aloy@digitalaqm.com` with the fields filled in. To send server-side instead, point the form
at a service (Formspree, Basin, a serverless function) and replace the `mailto:` branch in
`main.js`.

## Deploying

See **[DEPLOY.md](DEPLOY.md)** for step-by-step instructions, including putting this on a
GoDaddy domain (cPanel upload, DNS pointing, and what to do if you're on their website
builder).

Quick version:

- **GitHub Pages** — Settings → Pages → Deploy from branch → root.
- **Netlify / Vercel / Cloudflare Pages** — no build command, publish directory `/`.
- **Any classic host** — run `python3 build-standalone.py` and upload the single
  `dist/index.html` on its own.
