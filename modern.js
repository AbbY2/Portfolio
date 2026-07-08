/* =========================================================
   Amit Tiwari — Portfolio  |  Motion & Interactions (vanilla)
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader ---------- */
  window.addEventListener('load', () => {
    const pre = $('#preloader');
    if (pre) setTimeout(() => pre.classList.add('hide'), 350);
  });

  /* ---------- Theme (dark/light) with system + saved preference ---------- */
  const root = document.documentElement;
  const toggle = $('#themeToggle');
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (prefersDark ? 'dark' : 'light'));

  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    if (toggle) toggle.innerHTML = mode === 'dark'
      ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#0b0b14' : '#7c4dff');
  }
  if (toggle) toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
  });

  /* ---------- Mobile nav ---------- */
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  if (navToggle) navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  /* ---------- Navbar scrolled state + progress + back-to-top ---------- */
  const nav = $('#nav');
  const progress = $('#progressTop');
  const toTop = $('#toTop');
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 30);
    if (toTop) toTop.classList.toggle('show', y > 500);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Scrollspy (active nav link) ---------- */
  const sections = $$('section[id], header[id]');
  const linkFor = id => $(`#navLinks a[href="#${id}"]`);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        $$('#navLinks a').forEach(a => a.classList.remove('active'));
        const l = linkFor(e.target.id);
        if (l) l.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revEls = $$('.reveal');
  if (reduceMotion) {
    revEls.forEach(el => el.classList.add('in'));
    animateBars(); animateCounters();
  } else {
    const revObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    revEls.forEach(el => revObs.observe(el));
  }

  /* ---------- Skill bars ---------- */
  const skillSection = $('#skill');
  function animateBars() { $$('.bar > span').forEach(s => s.style.width = (s.dataset.w || 0) + '%'); }
  if (skillSection && !reduceMotion) {
    const bObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { animateBars(); obs.disconnect(); } });
    }, { threshold: 0.3 });
    bObs.observe(skillSection);
  }

  /* ---------- Counters ---------- */
  function animateCounters() {
    $$('.counter').forEach(el => {
      const target = +el.dataset.target;
      if (reduceMotion) { el.textContent = target; return; }
      const dur = 1600; const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  const statsEl = $('.stats');
  if (statsEl && !reduceMotion) {
    const cObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { animateCounters(); obs.disconnect(); } });
    }, { threshold: 0.4 });
    cObs.observe(statsEl);
  }

  /* ---------- Typing effect ---------- */
  const typedEl = $('#typed');
  if (typedEl) {
    const words = ['Web Developer', 'Software Engineer', '.NET Developer', 'Front-End Developer', 'App Developer'];
    let wi = 0, ci = 0, deleting = false;
    function type() {
      const word = words[wi];
      typedEl.textContent = word.slice(0, ci);
      if (!deleting && ci < word.length) { ci++; setTimeout(type, 90); }
      else if (!deleting && ci === word.length) { deleting = true; setTimeout(type, 1600); }
      else if (deleting && ci > 0) { ci--; setTimeout(type, 45); }
      else { deleting = false; wi = (wi + 1) % words.length; setTimeout(type, 350); }
    }
    if (reduceMotion) typedEl.textContent = words[0]; else type();
  }

  /* ---------- Skill / Cert tabs ---------- */
  $$('.tab-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.tab-btn').forEach(b => b.classList.remove('active'));
    $$('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    $('#' + btn.dataset.tab).classList.add('active');
  }));

  /* ---------- Testimonials carousel ---------- */
  const slides = $('#tslides');
  if (slides) {
    const total = slides.children.length;
    const dotsWrap = $('#tdots');
    let idx = 0, timer;
    for (let i = 0; i < total; i++) {
      const d = document.createElement('button');
      d.className = 'tdot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => go(i));
      dotsWrap.appendChild(d);
    }
    function render() {
      slides.style.transform = `translateX(-${idx * 100}%)`;
      $$('.tdot', dotsWrap).forEach((d, i) => d.classList.toggle('active', i === idx));
    }
    function go(i) { idx = (i + total) % total; render(); restart(); }
    function restart() { if (reduceMotion) return; clearInterval(timer); timer = setInterval(() => go(idx + 1), 6000); }
    $('#tnext').addEventListener('click', () => go(idx + 1));
    $('#tprev').addEventListener('click', () => go(idx - 1));
    restart();
  }

  /* ---------- Hero parallax (pointer + scroll) ---------- */
  const portrait = $('.portrait-wrap');
  if (portrait && !reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 18;
      const y = (e.clientY / window.innerHeight - 0.5) * 18;
      portrait.style.transform = `translate(${x}px, ${y}px)`;
    });
  }
  const blobs = $$('.blob');
  if (blobs.length && !reduceMotion) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      blobs.forEach((b, i) => b.style.translate = `0 ${y * (0.05 + i * 0.03)}px`);
    }, { passive: true });
  }

  /* ---------- Footer year ---------- */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
})();
