# Putting this site on your GoDaddy domain

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

### Step 1 — publish the site

**GitHub Pages** — repo **Settings → Pages → Deploy from a branch**, pick the branch,
folder `/ (root)`, **Save**. You get `https://aloymagtoto-cmd.github.io/Digitalaqm/`.

**Netlify** (no account fuss) — go to app.netlify.com/drop and drag the project folder onto
the page. Live instantly on a random subdomain you can rename.

### Step 2 — point the GoDaddy domain

GoDaddy → **My Products** → domain → **DNS** → **Manage Zones**.

For **GitHub Pages**, you need four A records and one CNAME:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | aloymagtoto-cmd.github.io |

Confirm those IPs against GitHub's current docs before you type them in — search
"GitHub Pages apex domain IP addresses". They change rarely, but they do change.

Then back in **Settings → Pages → Custom domain**, enter your domain and save. Tick
**Enforce HTTPS** once the certificate finishes (can take an hour).

For **Netlify**, skip the A records — Netlify's dashboard gives you the exact DNS values
under **Domain settings → Add custom domain**.

DNS changes usually take 15–60 minutes, occasionally up to 48 hours.

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
- **Headshot** — currently a gradient block with "AM".
- **Analytics** — paste your GA4 snippet just before `</head>`. You of all people will want it.
- **Check it on your phone** before you share the link anywhere.
