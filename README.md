# Digital AQM — portfolio site

A single-page portfolio site in the style of a modern brand/marketing studio.
Dark by default, light theme included, no build step, no dependencies.

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

## What's in it

| Section | Notes |
| --- | --- |
| Hero | Line-by-line type reveal, animated counters, ambient orbs |
| Marquee | Infinite capability ticker, pauses on hover |
| Services | Six cards with a pointer-tracking spotlight |
| Work | Four case studies with metrics (gradient placeholders for imagery) |
| Process | Sticky column + four steps |
| About | Founder block, portrait placeholder, tool chips |
| Testimonials | Three quotes |
| Contact | Floating-label form with scope pills |
| Footer | Oversized outlined wordmark |

Interactions live in `assets/js/main.js`: preloader, theme toggle (persisted to
`localStorage`), scroll-hiding nav, mobile menu, `IntersectionObserver` reveals with a
stagger, count-ups, a custom cursor with contextual labels, magnetic buttons, pointer
parallax on the background orbs, click-to-copy email, and form validation.

Everything degrades: `prefers-reduced-motion` disables animation and the cursor,
and the layout works down to 390px.

## Customising

- **Colours** — the tokens at the top of `style.css` (`--accent`, `--accent-2`,
  `--accent-3`). The `[data-theme="light"]` block overrides them for light mode.
- **Type** — `--font-display` / `--font-body`. Fonts load from Google Fonts; swap the
  `<link>` in `index.html` if you self-host.
- **Copy and case studies** — all in `index.html`. Placeholder thumbnails are CSS
  gradients (`.work__thumb--1` … `--4`); replace with `<img>` when you have real shots.
- **Portrait** — `.about__portrait` is a gradient block with initials. Drop a photo in
  and swap it out.

## Contact form

There is no backend. On submit the form validates, then composes a `mailto:` to
`aloymagtoto@gmail.com` with the fields filled in. To send server-side instead, point the
form at a service (Formspree, Basin, a serverless function) and replace the `mailto:`
branch in `main.js`.

## Deploying

**GitHub Pages** — Settings → Pages → Deploy from branch → `main` / root.

**Netlify / Vercel / Cloudflare Pages** — no build command, publish directory `/`.

## Content note

The client names, metrics, and testimonials are placeholders written to show the layout.
Swap them for real work before the site goes public.
