/* =========================================================
   Digital AQM — interactions
   Vanilla JS, no dependencies.
   ========================================================= */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── loader ───────────────────────────────────────────── */
  const loader = $('#loader');
  const bar    = $('#loaderBar');
  const count  = $('#loaderCount');

  const finishLoad = () => {
    document.body.style.overflow = '';
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 700);
  };

  if (reduced) {
    finishLoad();
  } else {
    document.body.style.overflow = 'hidden';
    let n = 0;
    const tick = setInterval(() => {
      n = Math.min(100, n + Math.random() * 14);
      bar.style.width = n + '%';
      count.textContent = Math.round(n);
      if (n >= 100) {
        clearInterval(tick);
        setTimeout(finishLoad, 320);
      }
    }, 90);
    // Never trap the page if something stalls.
    setTimeout(() => { clearInterval(tick); finishLoad(); }, 4000);
  }

  /* ── theme ────────────────────────────────────────────── */
  const root   = document.documentElement;
  const toggle = $('#themeToggle');
  // The inline script in <head> has already applied any stored choice before
  // first paint; this only has to keep the toggle and the meta colour in sync.
  const THEME_COLOR = { dark: '#0a0a0b', light: '#f2f1ee' };

  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('aqm-theme', next);
    $('meta[name="theme-color"]').setAttribute('content', THEME_COLOR[next]);
  });

  /* ── mobile menu ──────────────────────────────────────── */
  const burger = $('#burger');
  const links  = $('#navLinks');
  let menuOpen = false;

  const setMenu = (open) => {
    menuOpen = open;
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burger.addEventListener('click', () => setMenu(!menuOpen));
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => menuOpen && setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) setMenu(false); });

  /* ── nav: sticky + hide on scroll down ────────────────── */
  const nav = $('#nav');
  const cue = $('.scroll-cue');
  let lastY = window.scrollY;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('stuck', y > 30);
    nav.classList.toggle('hide', y > 480 && y > lastY && !menuOpen);
    if (cue) cue.classList.toggle('gone', y > 60);
    lastY = y;
  }, { passive: true });

  /* ── reveal on scroll ─────────────────────────────────── */
  const revealables = $$('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        // Stagger siblings so grids cascade instead of popping as a block.
        const siblings = [...entry.target.parentElement.children].filter(n => n.classList.contains('reveal'));
        const i = Math.max(0, siblings.indexOf(entry.target));
        entry.target.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(el => io.observe(el));
  }

  /* ── counters ─────────────────────────────────────────── */
  const counters = $$('.count');
  const runCount = (el) => {
    const to     = parseFloat(el.dataset.to);
    const dec    = parseInt(el.dataset.dec || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    // 2400 reads better as 2,400 — but only when there are no decimals in play.
    const fmt = (v) => prefix + (dec
      ? v.toFixed(dec)
      : Math.round(v).toLocaleString('en-US')) + suffix;

    if (reduced) { el.textContent = fmt(to); return; }

    const dur = 1500;
    const t0  = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        runCount(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => cio.observe(el));
  } else {
    counters.forEach(runCount);
  }

  /* ── card spotlight ───────────────────────────────────── */
  $$('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  });

  /* ── custom cursor + magnetic buttons ─────────────────── */
  if (fine && !reduced) {
    const cursor = $('#cursor');
    const label  = $('#cursorLabel');
    let cx = 0, cy = 0, tx = 0, ty = 0;

    window.addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('on');
    }, { passive: true });

    (function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();

    $$('[data-cursor]').forEach(el => {
      el.addEventListener('pointerenter', () => {
        label.textContent = el.dataset.cursor;
        cursor.classList.add('hot');
      });
      el.addEventListener('pointerleave', () => {
        cursor.classList.remove('hot');
        label.textContent = '';
      });
    });

    $$('.magnetic').forEach(el => {
      const strength = 0.28;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    /* orbs drift with the pointer — cheap parallax */
    const orbs = $$('.orb');
    window.addEventListener('pointermove', e => {
      const nx = (e.clientX / window.innerWidth - 0.5);
      const ny = (e.clientY / window.innerHeight - 0.5);
      orbs.forEach((orb, i) => {
        const d = (i + 1) * 26;
        orb.style.transform = `translate(${nx * d}px, ${ny * d}px)`;
      });
    }, { passive: true });
  }

  /* ── email: click to copy ─────────────────────────────── */
  const mail = $('.cta__mail');
  if (mail && navigator.clipboard) {
    mail.addEventListener('click', async (e) => {
      if (e.metaKey || e.ctrlKey) return;          // let modified clicks behave normally
      e.preventDefault();
      const original = mail.textContent;
      try {
        await navigator.clipboard.writeText(original);
        mail.textContent = 'copied ✓';
        setTimeout(() => { mail.textContent = original; }, 1600);
      } catch {
        window.location.href = mail.getAttribute('href');
      }
    });
  }

  /* ── contact form ─────────────────────────────────────── */

  // ┌─────────────────────────────────────────────────────────────────┐
  // │  FILL IN *ONE* OF THESE TWO AND SUBMISSIONS REACH YOUR INBOX.   │
  // │                                                                 │
  // │  WEB3FORMS_KEY — easiest. Put your email into the box at        │
  // │    web3forms.com, they email you an access key. No account,     │
  // │    no password. Paste the key between the quotes.               │
  // │                                                                 │
  // │  FORM_ENDPOINT — formspree.io, if you prefer it. Sign up,       │
  // │    create a form, paste the URL: https://formspree.io/f/xxxx    │
  // │                                                                 │
  // │  With both empty the form still works: it offers WhatsApp,      │
  // │  email, and copy-to-clipboard instead.                          │
  // └─────────────────────────────────────────────────────────────────┘
  const WEB3FORMS_KEY = '';
  const FORM_ENDPOINT = '';

  // Change these in one place and the whole form picks them up.
  const CONTACT_EMAIL   = 'aloymagtoto@gmail.com';
  const WHATSAPP_NUMBER = '639171737602';   // international format, no + or spaces

  const form = $('#contactForm');
  const note = form && $('#formNote');
  const submitBtn = form && $('button[type="submit"]', form);

  const setNote = (msg, kind) => {
    note.textContent = msg;
    note.className = 'form__note' + (kind ? ' ' + kind : '');
  };

  const isValid = () => {
    let ok = true;
    $$('.field', form).forEach(f => {
      const input = $('input[required], textarea[required]', f);
      if (!input) return;
      const good = input.checkValidity() && input.value.trim() !== '';
      f.classList.toggle('invalid', !good);
      if (!good) ok = false;
    });
    return ok;
  };

  const summarise = (data) => [
    `Name: ${data.get('name')}`,
    `Email: ${data.get('email')}`,
    `Company: ${data.get('company') || '—'}`,
    `Scope: ${data.get('scope')}`,
    '',
    data.get('message')
  ].join('\n');

  // Nothing configured to receive submissions. Never auto-navigate to a
  // mailto: here — on any machine without a mail app registered that does
  // nothing at all, silently, and the enquiry is lost. Offer routes the
  // visitor can see and choose instead, and keep the form filled in.
  const offerFallbacks = (data) => {
    const summary = summarise(data);

    note.textContent = '';
    note.className = 'form__note';

    const lead = document.createElement('span');
    lead.textContent = 'Almost there — send it through:';

    const row = document.createElement('div');
    row.className = 'form__routes';

    const whatsapp = document.createElement('a');
    whatsapp.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary)}`;
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener';
    whatsapp.className = 'route route--go';
    whatsapp.textContent = 'WhatsApp';

    const mail = document.createElement('a');
    mail.href =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('New project enquiry — ' + data.get('name'))}` +
      `&body=${encodeURIComponent(summary)}`;
    mail.className = 'route';
    mail.textContent = 'Email';

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'route';
    copy.textContent = 'Copy message';
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(`${summary}\n\nSend to: ${CONTACT_EMAIL}`);
        copy.textContent = 'Copied ✓';
      } catch {
        copy.textContent = 'Press Ctrl/Cmd + C';
      }
      setTimeout(() => { copy.textContent = 'Copy message'; }, 2200);
    });

    row.append(whatsapp, mail, copy);
    note.append(lead, row);
  };

  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setNote('');

    if (!isValid()) {
      setNote('A couple of fields still need you.', 'err');
      return;
    }

    const data = new FormData(form);
    // collapse the checkbox group into one readable line
    data.set('scope', data.getAll('scope').join(', ') || 'Not specified');

    if (!WEB3FORMS_KEY && !FORM_ENDPOINT) { offerFallbacks(data); return; }

    if (WEB3FORMS_KEY) data.set('access_key', WEB3FORMS_KEY);

    const label = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch(
        WEB3FORMS_KEY ? 'https://api.web3forms.com/submit' : FORM_ENDPOINT,
        { method: 'POST', body: data, headers: { Accept: 'application/json' } }
      );
      if (!res.ok) throw new Error('HTTP ' + res.status);

      form.reset();
      setNote("Got it — I'll reply within two working days.", 'ok');
    } catch {
      // Don't reset: the enquiry hasn't landed, so let them use another route.
      offerFallbacks(data);
      note.prepend(Object.assign(document.createElement('span'), {
        textContent: "That didn't send. "
      }));
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = label;
    }
  });

  /* ── misc ─────────────────────────────────────────────── */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
