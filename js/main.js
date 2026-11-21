/* =========================================================
   JIREH DIGITAL — Interactions
   ========================================================= */
(function () {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Preloader ---------- */
  const markLoaded = () => root.classList.add('is-loaded');
  if (document.readyState === 'complete') setTimeout(markLoaded, 300);
  else window.addEventListener('load', () => setTimeout(markLoaded, 300));

  /* ---------- Year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header: scrolled / hide on scroll down ---------- */
  const header = $('.header');
  const progress = $('.scroll-progress');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) {
      header.classList.toggle('is-scrolled', y > 30);
      const menuOpen = $('#nav-links')?.classList.contains('is-open');
      header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 500);
    }
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    updateProcess();
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- Mobile navigation ---------- */
  const toggle = $('.nav__toggle');
  const links = $('#nav-links');
  function setMenu(open) {
    if (!toggle || !links) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
  }
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('#nav-links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 960) setMenu(false); });

  /* ---------- Active nav link ---------- */
  const navLinks = $$('.nav__link');
  const sections = navLinks.map(l => $(l.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(l => {
            const active = l.getAttribute('href') === '#' + entry.target.id;
            l.classList.toggle('is-active', active);
            if (active) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- Reveal on scroll (with stagger) ---------- */
  const reveals = $$('.reveal');
  // stagger siblings inside the same parent
  const groups = new Map();
  reveals.forEach(el => {
    const p = el.parentElement;
    const i = groups.get(p) || 0;
    el.style.setProperty('--d', `${Math.min(i, 6) * 0.08}s`);
    groups.set(p, i + 1);
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('is-visible');
          setTimeout(() => el.classList.add('is-revealed'), 1600);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible', 'is-revealed'));
  }

  /* ---------- Process timeline progress ---------- */
  const processList = $('.process__steps');
  const steps = $$('.step');
  function updateProcess() {
    if (!processList) return;
    const r = processList.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height + vh * 0.25)));
    processList.style.setProperty('--progress', p.toFixed(3));
    steps.forEach((s, i) => s.classList.toggle('is-active', p >= (i + 0.35) / steps.length || p > 0.98));
  }
  updateProcess();

  /* ---------- Hero 3D scene: pointer parallax ---------- */
  const scene = $('#scene');
  const hero = $('.hero');
  if (scene && hero && finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      scene.style.setProperty('--ry', `${-16 + x * 22}deg`);
      scene.style.setProperty('--rx', `${8 - y * 14}deg`);
    });
    hero.addEventListener('pointerleave', () => {
      scene.style.removeProperty('--ry');
      scene.style.removeProperty('--rx');
    });
  }

  /* ---------- Cursor glow ---------- */
  const glow = $('.cursor-glow');
  if (glow && finePointer && !reduceMotion) {
    root.classList.add('has-pointer');
    let gx = 0, gy = 0, cx = 0, cy = 0, raf;
    window.addEventListener('pointermove', e => {
      gx = e.clientX; gy = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    function loop() {
      cx += (gx - cx) * 0.15; cy += (gy - cy) * 0.15;
      glow.style.transform = `translate(${cx - 260}px, ${cy - 260}px)`;
      raf = Math.abs(gx - cx) + Math.abs(gy - cy) > 0.5 ? requestAnimationFrame(loop) : null;
    }
  }

  /* ---------- 3D tilt cards ---------- */
  if (finePointer && !reduceMotion) {
    $$('.tilt').forEach(card => {
      const max = card.classList.contains('logo-orb') ? 10 : 7;
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateY(${(x - 0.5) * max * 2}deg) rotateX(${(0.5 - y) * max * 2}deg) translateY(-6px)`;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    /* Magnetic buttons */
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Portfolio filters ---------- */
  const chips = $$('.chip');
  const projects = $$('.project');
  chips.forEach(chip => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach(c => { c.classList.toggle('is-active', c === chip); c.setAttribute('aria-pressed', String(c === chip)); });
    projects.forEach(p => {
      const show = f === 'all' || p.dataset.cat === f || p.dataset.cat === 'all';
      p.classList.toggle('is-hidden', !show);
      if (show) p.classList.add('is-visible');
    });
  }));

  /* ---------- Service "Enquire" pre-selects the form ---------- */
  const serviceSelect = $('#service');
  function syncSelect() { serviceSelect?.classList.toggle('has-value', !!serviceSelect.value); }
  serviceSelect?.addEventListener('change', syncSelect);
  $$('[data-service]').forEach(link => link.addEventListener('click', () => {
    if (!serviceSelect) return;
    serviceSelect.value = link.dataset.service;
    syncSelect();
    setTimeout(() => $('#name')?.focus({ preventScroll: true }), 900);
  }));

  /* ---------- Contact form (Netlify Forms + validation) ---------- */
  const form = $('.contact__form');
  if (form) {
    const status = $('.form__status', form);
    const submitBtn = $('button[type="submit"]', form);
    const label = $('.btn__label', submitBtn);
    const messages = {
      name: 'Please enter your name.',
      email: 'Please enter a valid email address.',
      service: 'Please choose the service you need.',
      message: 'Please tell us a little about your project.'
    };

    function validateField(el) {
      const field = el.closest('.field');
      if (!field || !el.required) return true;
      let ok = el.value.trim() !== '';
      if (ok && el.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim());
      field.classList.toggle('has-error', !ok);
      const err = $('.field__error', field);
      if (err) err.textContent = ok ? '' : messages[el.name] || 'This field is required.';
      el.setAttribute('aria-invalid', String(!ok));
      return ok;
    }

    $$('input, select, textarea', form).forEach(el => {
      el.addEventListener('blur', () => { if (el.value) validateField(el); });
      el.addEventListener('input', () => { if (el.closest('.field')?.classList.contains('has-error')) validateField(el); });
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const fields = $$('input[required], select[required], textarea[required]', form);
      const results = fields.map(validateField);
      if (results.includes(false)) {
        const first = fields[results.indexOf(false)];
        first.focus();
        status.className = 'form__status is-error';
        status.textContent = 'Please complete the highlighted fields.';
        return;
      }

      submitBtn.classList.add('is-loading');
      label.textContent = 'Sending…';
      status.className = 'form__status';
      status.textContent = '';

      try {
        const body = new URLSearchParams(new FormData(form)).toString();
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body
        });
        if (!res.ok) throw new Error('Network response was not ok');
        form.reset();
        syncSelect();
        status.className = 'form__status is-success';
        status.textContent = 'Thank you! Your enquiry has been sent — we\'ll be in touch shortly.';
      } catch (err) {
        status.className = 'form__status is-error';
        status.innerHTML = 'Sorry, something went wrong. Please <a href="https://wa.me/27704416035" target="_blank" rel="noopener" style="color:#25d366;text-decoration:underline">message us on WhatsApp</a> instead.';
      } finally {
        submitBtn.classList.remove('is-loading');
        label.textContent = 'Send Project Enquiry';
      }
    });
  }
})();
