# Putting this site on your GoDaddy domain

## Your setup

Checked against the GoDaddy account on 31 Jul 2026:

- **`digitalaqm.com`** — owned, with DNS managed at GoDaddy
- **Websites + Marketing (Free)** — the drag-and-drop builder. Can't run custom HTML/CSS/JS
- **Managed WordPress** — free *trial*, not started
- **Professional Email Pro Light** — `aloy@digitalaqm.com` ← **this depends on the domain's DNS**
- **No cPanel / web hosting**

The domain currently resolves to GoDaddy's parked placeholder page (`13.248.243.5`,
`76.223.105.230`), so nothing real is being served on it yet — nothing to take down.

**→ Follow [Path B](#path-b--domain-only).** Host free on GitHub Pages, point the domain at
it. The Websites + Marketing free plan can't do this design and doesn't need cancelling —
just leave it alone.

> ### ⚠️ Do not break your email
>
> `aloy@digitalaqm.com` runs on this domain's DNS. When you edit DNS records:
>
> - **Only** touch the **A** records for `@` and the **CNAME** for `www`
> - **Never** delete or edit **MX** records, **TXT** records (SPF/DKIM/verification), or
>   CNAMEs named `autodiscover`, `email`, `_domainconnect`, or similar
> - **Do not change the nameservers.** Some hosts ask you to point nameservers at them —
>   that moves *all* DNS away from GoDaddy and takes your email with it. Keep GoDaddy as
>   the DNS host and just add records.
>
> Screenshot the DNS page before you change anything.

---

## First: work out what you actually bought

Log in to GoDaddy → **My Products**. What you see there decides everything below.

| What it says | What you can do | Go to |
| --- | --- | --- |
| **Web Hosting**, **cPanel Hosting**, **Linux Hosting** | Upload the files. Site is live in 10 minutes. | [Path A](#path-a--cpanel--web-hosting) |
| **Domain** only (no hosting) | Host it free somewhere else, point the domain at it. | [Path B](#path-b--domain-only) |
| **Websites + Marketing** / **Website Builder** | Can't run this design as-is. | [Path C](#path-c--websites--marketing-builder) |
| **Managed WordPress** | Works, with a caveat. | [Path D](#path-d--managed-wordpress) |

Two versions of the site are in this repo, both identical to look at:

- **`dist/index.html`** — one self-contained file, 77 KB. Easiest to upload.
- **`index.html` + `assets/`** — the normal split version. Use this if you want to keep editing it.

Regenerate the single file after any edit with `python3 build-standalone.py`.

---

## Path A — cPanel / Web Hosting

The straightforward one.

1. GoDaddy → **My Products** → your hosting → **Manage** → **cPanel Admin**
2. Open **File Manager** → double-click into **`public_html`**
3. GoDaddy puts a placeholder in there. Delete `index.html` and any `coming-soon.html`
   (or rename to `index-old.html` if you want it back)
4. **Upload** → pick `dist/index.html` from this repo → wait for 100%
5. Visit your domain. Hard-refresh with **Ctrl/Cmd + Shift + R** if you still see the old page.

That's it — one file, no folders to get wrong.

**If you'd rather upload the editable version:** upload `index.html` *and* the whole `assets`
folder into `public_html`, keeping the structure exactly (`public_html/assets/css/style.css`,
`public_html/assets/js/main.js`). A broken layout after upload almost always means the
`assets` folder landed in the wrong place.

**Prefer FTP?** Install FileZilla, get your FTP details from cPanel → **FTP Accounts**, and
drag the files into `public_html`.

---

## Path B — Domain only

You don't need GoDaddy hosting at all. Host the site free on GitHub Pages or Netlify and
point the domain at it. This is also the better option than paying for basic hosting.

### Step 1 — turn on GitHub Pages

1. Go to the repo → **Settings** → **Pages** (left sidebar)
2. **Source:** Deploy from a branch
3. **Branch:** `claude/modern-portfolio-website-tt0yel`, folder **`/ (root)`** → **Save**
4. Wait ~1 minute, then check `https://aloymagtoto-cmd.github.io/Digitalaqm/`

A `CNAME` file with `digitalaqm.com` is already committed, so Pages will pick up the custom
domain as soon as it builds.

### Step 2 — point the domain at it

GoDaddy → **My Products** → `digitalaqm.com` → **DNS**.

**Re-read the email warning at the top before touching anything.**

Delete the existing **A record for `@`** (it points at GoDaddy's parking page) and any
existing **CNAME for `www`**. Then add these six records:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | @ | 185.199.108.153 | 1 hour |
| A | @ | 185.199.109.153 | 1 hour |
| A | @ | 185.199.110.153 | 1 hour |
| A | @ | 185.199.111.153 | 1 hour |
| CNAME | www | aloymagtoto-cmd.github.io | 1 hour |

Confirm those four IPs against GitHub's current docs before typing them — search
"GitHub Pages apex domain IP addresses". They change rarely, but they do change.

Leave every **MX** and **TXT** record exactly as it is.

### Step 3 — finish in GitHub

Back in **Settings → Pages → Custom domain**, enter `digitalaqm.com` and save. GitHub will
verify the DNS (a few minutes to an hour), then tick **Enforce HTTPS** once the certificate
is issued.

DNS usually propagates in 15–60 minutes, occasionally up to 48 hours. Until then you may see
the old parked page — that's cache, not a mistake.

### Alternative: Netlify

Friendlier dashboard, instant HTTPS, drag-and-drop deploys from app.netlify.com/drop.
If you use it, keep DNS at GoDaddy (**do not** switch to Netlify DNS — that would move your
email) and use their external-DNS records instead: an A record for `@` pointing at Netlify's
load balancer, and a CNAME for `www` pointing at your `*.netlify.app` subdomain. Netlify
shows you the exact values under **Domain settings → Add custom domain**.

---

## Path C — Websites + Marketing (builder)

Straight answer: you can't use this design on GoDaddy's website builder. It's a closed
drag-and-drop system — you pick their templates and their sections, and there's no way to
replace the theme with your own HTML, CSS, and JavaScript.

There's an **HTML embed** section, but it renders inside a fixed-height sandboxed frame.
A full-page design with a sticky nav, scroll animations, and a custom cursor will not
behave correctly in it. Don't bother.

Your realistic options:

1. **Recommended** — keep the domain, drop the builder subscription, follow [Path B](#path-b--domain-only).
   Free hosting, and you keep this design.
2. Add a **Web Hosting** plan and follow [Path A](#path-a--cpanel--web-hosting).
3. Rebuild the design inside the builder using their sections. You'd lose the type
   treatment, the motion, and most of what makes it look like this.

---

## Path D — Managed WordPress

Two ways, depending on whether this replaces your site or sits alongside it.

**As a section of the existing site** (`yourdomain.com/portfolio/`):

1. Get SFTP details from GoDaddy → hosting → **Settings → SFTP**
2. Connect with FileZilla, go to the site root (the folder containing `wp-content`)
3. Create a folder `portfolio` and upload `dist/index.html` into it
4. Visit `yourdomain.com/portfolio/`

WordPress passes through requests for files that actually exist, so this works. If your
host is aggressive about rewrites and you get a 404, fall back to a subdomain.

**As the whole site** — the clean way is a child theme with a full-width page template
containing this HTML, then set that page as your homepage under **Settings → Reading**.
That's a real chunk of work, and honestly if WordPress isn't doing anything else for you,
[Path B](#path-b--domain-only) is less effort and faster to load.

---

## Before you go live

- **Contact form** — right now it opens the visitor's mail app. For a form that lands in
  your inbox, sign up at formspree.io, then in `assets/js/main.js` replace the `mailto:`
  block with a `fetch()` to your Formspree endpoint. Rebuild with `build-standalone.py`.
- **Real screenshots** — the case study thumbnails are gradients. Ads dashboards or campaign
  creative would carry a lot more weight.
- **Brand mark** — the About block is a gradient block carrying the AQM mark.
- **Analytics** — paste your GA4 snippet just before `</head>`. You of all people will want it.
- **Check it on your phone** before you share the link anywhere.
