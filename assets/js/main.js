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
  const stored = localStorage.getItem('aqm-theme');
  if (stored) root.dataset.theme = stored;

  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('aqm-theme', next);
    $('meta[name="theme-color"]').setAttribute('content', next === 'dark' ? '#0a0a0b' : '#f2f1ee');
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
    cue.classList.toggle('gone', y > 60);
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
  const form = $('#contactForm');
  const note = $('#formNote');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    note.className = 'form__note';

    let valid = true;
    $$('.field', form).forEach(f => {
      const input = $('input[required], textarea[required]', f);
      if (!input) return;
      const ok = input.checkValidity() && input.value.trim() !== '';
      f.classList.toggle('invalid', !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      note.textContent = 'A couple of fields still need you.';
      note.classList.add('err');
      return;
    }

    // No backend wired up yet — hand off to the mail client so nothing is lost.
    const data  = new FormData(form);
    const scope = data.getAll('scope').join(', ') || 'Not specified';
    const body  = [
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Company: ${data.get('company') || '—'}`,
      `Scope: ${scope}`,
      '',
      data.get('message')
    ].join('\n');

    window.location.href =
      `mailto:aloymagtoto@gmail.com?subject=${encodeURIComponent('New project enquiry — ' + data.get('name'))}` +
      `&body=${encodeURIComponent(body)}`;

    note.textContent = 'Opening your mail app — hit send and I\'ll reply within two working days.';
    note.classList.add('ok');
    form.reset();
  });

  /* ── misc ─────────────────────────────────────────────── */
  $('#year').textContent = new Date().getFullYear();
})();
