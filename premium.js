/* =========================================================
   Premium portfolio interactions (vanilla)
   Lenis smooth scroll · scroll progress · RAF reveals ·
   counters · typing · tabs · testimonials · theme · nav
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme (dark/light) ---------- */
  var root = document.documentElement;
  var toggle = $('#themeToggle');
  var saved = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (prefersDark ? 'dark' : 'light'));

  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    if (toggle) toggle.innerHTML = mode === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#0c0d14' : '#f13024');
    if (window.__threeHero) window.__threeHero.setTheme(mode);
  }
  if (toggle) toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
  });

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    var isTouch = window.matchMedia('(pointer: coarse)').matches;
    lenis = new Lenis({
      lerp: isTouch ? 0.1 : 0.085,   // Safari/iOS-safe
      smoothWheel: true,
      syncTouch: false               // disable on touch to avoid iOS stutter
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    // anchor links go through Lenis
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -80 }); closeMenu(); }
      });
    });
  }

  /* ---------- Preloader ---------- */
  window.addEventListener('load', function () {
    var pre = $('#preloader');
    if (pre) setTimeout(function () { pre.classList.add('hide'); }, 400);
  });
  // fake-but-honest preload bar (animates while assets settle)
  var plBar = $('#plBar'), plPct = $('#plPct'), pct = 0;
  if (plBar) {
    var pi = setInterval(function () {
      pct = Math.min(100, pct + Math.random() * 22);
      plBar.style.width = pct + '%';
      if (plPct) plPct.textContent = Math.floor(pct) + '%';
      if (pct >= 100) clearInterval(pi);
    }, 130);
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = $('#navToggle');
  var navLinks = $('#navLinks');
  function closeMenu() { if (navLinks) navLinks.classList.remove('open'); }
  if (navToggle) navToggle.addEventListener('click', function () { navLinks.classList.toggle('open'); });
  $$('#navLinks a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------- Navbar state + progress + back-to-top ---------- */
  var nav = $('#nav');
  var progress = $('#progressTop');
  var toTop = $('#toTop');
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 30);
    if (toTop) toTop.classList.toggle('show', y > 600);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () {
    if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Scrollspy ---------- */
  var sections = $$('section[id], div[id].spy');
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        $$('#navLinks a').forEach(function (a) { a.classList.remove('active'); });
        var l = $('#navLinks a[href="#' + e.target.id + '"]');
        if (l) l.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(function (s) { spy.observe(s); });

  /* ---------- Reveal on scroll ---------- */
  var revEls = $$('.reveal');
  if (reduce) {
    revEls.forEach(function (el) { el.classList.add('in'); });
    animateBars(); animateCounters();
  } else {
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.14 });
    revEls.forEach(function (el) { revObs.observe(el); });
  }

  /* ---------- Skill bars ---------- */
  function animateBars() { $$('.bar > span').forEach(function (s) { s.style.width = (s.getAttribute('data-w') || 0) + '%'; }); }
  var skillSection = $('#skill');
  if (skillSection && !reduce) {
    var bObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateBars(); obs.disconnect(); } });
    }, { threshold: 0.3 });
    bObs.observe(skillSection);
  }

  /* ---------- Counters ---------- */
  function animateCounters() {
    $$('.counter').forEach(function (el) {
      var target = +el.getAttribute('data-target');
      if (reduce) { el.textContent = target; return; }
      var dur = 1600, start = performance.now();
      (function step(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  }
  var statsEl = $('.stats');
  if (statsEl && !reduce) {
    var cObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateCounters(); obs.disconnect(); } });
    }, { threshold: 0.4 });
    cObs.observe(statsEl);
  }

  /* ---------- Typing effect ---------- */
  var typedEl = $('#typed');
  if (typedEl) {
    var words = ['Software Engineer', '.NET Developer', 'Web Developer', 'Front-End Developer', 'App Developer'];
    var wi = 0, ci = 0, deleting = false;
    function type() {
      var word = words[wi];
      typedEl.textContent = word.slice(0, ci);
      if (!deleting && ci < word.length) { ci++; setTimeout(type, 85); }
      else if (!deleting && ci === word.length) { deleting = true; setTimeout(type, 1600); }
      else if (deleting && ci > 0) { ci--; setTimeout(type, 40); }
      else { deleting = false; wi = (wi + 1) % words.length; setTimeout(type, 320); }
    }
    if (reduce) typedEl.textContent = words[0]; else type();
  }

  /* ---------- Tabs ---------- */
  $$('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      $$('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = $('#' + btn.getAttribute('data-tab'));
      if (panel) panel.classList.add('active');
    });
  });

  /* ---------- Testimonials carousel ---------- */
  var slides = $('#tslides');
  if (slides) {
    var total = slides.children.length;
    var dotsWrap = $('#tdots');
    var idx = 0, timer;
    for (var i = 0; i < total; i++) {
      (function (n) {
        var d = document.createElement('button');
        d.className = 'tdot' + (n === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Go to testimonial ' + (n + 1));
        d.addEventListener('click', function () { go(n); });
        dotsWrap.appendChild(d);
      })(i);
    }
    function render() {
      slides.style.transform = 'translateX(-' + (idx * 100) + '%)';
      $$('.tdot', dotsWrap).forEach(function (d, n) { d.classList.toggle('active', n === idx); });
    }
    function go(n) { idx = (n + total) % total; render(); restart(); }
    function restart() { if (reduce) return; clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 6000); }
    var nx = $('#tnext'), pv = $('#tprev');
    if (nx) nx.addEventListener('click', function () { go(idx + 1); });
    if (pv) pv.addEventListener('click', function () { go(idx - 1); });
    restart();
  }

  /* ---------- 3D portrait pointer tilt ---------- */
  var tiltArea = $('#heroTilt');
  var tiltInner = $('#tiltInner');
  if (tiltArea && tiltInner && !reduce) {
    var MAX = 16;                 // max tilt in degrees
    var trX = 0, trY = 0, cX = 0, cY = 0, hovering = false, raf2 = null;
    function setHover(on) { hovering = on; if (!on) { trX = 0; trY = 0; } queue(); }
    tiltArea.addEventListener('pointerenter', function () { setHover(true); });
    tiltArea.addEventListener('pointerleave', function () { setHover(false); });
    tiltArea.addEventListener('pointermove', function (e) {
      var r = tiltArea.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;   // -0.5..0.5
      var py = (e.clientY - r.top) / r.height - 0.5;
      trY = px * MAX * 2;          // rotateY follows horizontal
      trX = -py * MAX * 2;         // rotateX follows vertical
      queue();
    }, { passive: true });
    function queue() { if (!raf2) raf2 = requestAnimationFrame(render); }
    function render() {
      raf2 = null;
      cX += (trX - cX) * 0.12;
      cY += (trY - cY) * 0.12;
      tiltInner.style.transform = 'rotateX(' + cX.toFixed(2) + 'deg) rotateY(' + cY.toFixed(2) + 'deg)';
      if (Math.abs(trX - cX) > 0.05 || Math.abs(trY - cY) > 0.05) queue();
    }
  }

  /* ---------- Contact form (AJAX → FormSubmit, works on GitHub Pages) ---------- */
  var form = $('#contactForm');
  if (form) {
    var statusEl = $('#formStatus');
    var sendBtn = $('#sendBtn');
    var endpoint = 'https://formsubmit.co/ajax/destinyofamit@gmail.com';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (statusEl) { statusEl.className = 'form-status'; statusEl.textContent = 'Sending…'; }
      if (sendBtn) sendBtn.disabled = true;
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok) {
          if (statusEl) { statusEl.className = 'form-status ok'; statusEl.textContent = "✓ Thanks! Your message has been sent — I'll reply within 24 hours."; }
          form.reset();
        } else {
          throw new Error('bad response');
        }
      })
      .catch(function () {
        if (statusEl) { statusEl.className = 'form-status err'; statusEl.textContent = '✕ Could not send. Please email destinyofamit@gmail.com directly.'; }
      })
      .then(function () { if (sendBtn) sendBtn.disabled = false; });
    });
  }

  /* ---------- Footer year ---------- */
  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
})();
