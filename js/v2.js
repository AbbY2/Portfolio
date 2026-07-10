/* =========================================================
   Portfolio v2 — multi-page feel + cursor-reactive background
   Static · GitHub-Pages ready · vanilla JS
   ========================================================= */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // enable JS-only behaviours (reveal hiding + multi-page). No JS => normal scroll page.
  document.body.classList.add('js', 'mp');

  /* ---------- Preloader ---------- */
  window.addEventListener('load', function () {
    var p = $('#preloader'); if (p) setTimeout(function () { p.classList.add('hide'); }, 350);
  });

  /* ---------- Animated background ----------
     Primary: Three.js 3D scene (floating wireframe shapes + particle field,
     camera parallax on mouse). Fallback: animated 2D constellation if Three
     or WebGL isn't available — so the background ALWAYS animates. ---------- */
  (function background() {
    var canvas = $('#particles'); if (!canvas) return;
    var ok = false;
    if (typeof THREE !== 'undefined') { try { init3D(); ok = true; } catch (e) { ok = false; } }
    if (!ok) init2D();

    function init3D() {
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 28);
      scene.add(new THREE.AmbientLight(0xffffff, 0.45));
      var d1 = new THREE.DirectionalLight(0xff6a3d, 0.9); d1.position.set(8, 12, 6); scene.add(d1);
      var d2 = new THREE.DirectionalLight(0xf13024, 0.6); d2.position.set(-6, -4, 10); scene.add(d2);
      var COUNT = innerWidth < 700 ? 420 : 850, cc = new THREE.Color();
      var pos = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3);
      for (var i = 0; i < COUNT; i++) {
        var r = 12 + Math.random() * 22, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.cos(ph) * 0.6; pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) * 0.8;
        cc.setHSL(0.03 + Math.random() * 0.06, 0.85, 0.5 + Math.random() * 0.3);
        col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b;
      }
      var pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
      var particles = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.24, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
      scene.add(particles);
      var shapes = [], geos = [new THREE.IcosahedronGeometry(0.5, 0), new THREE.TorusKnotGeometry(0.4, 0.15, 50, 8), new THREE.OctahedronGeometry(0.5)];
      var palette = [0xf13024, 0xff6a3d, 0xffc448, 0xff7a59], SHAPES = innerWidth < 700 ? 12 : 20;
      for (var s = 0; s < SHAPES; s++) {
        var mat = new THREE.MeshPhysicalMaterial({ color: palette[(Math.random() * palette.length) | 0], metalness: 0.2, roughness: 0.35, transparent: true, opacity: 0.3 + Math.random() * 0.3, wireframe: Math.random() > 0.4 });
        var mesh = new THREE.Mesh(geos[(Math.random() * geos.length) | 0], mat);
        var rr = 8 + Math.random() * 16, tt = Math.random() * Math.PI * 2, pp = Math.acos(2 * Math.random() - 1);
        mesh.position.set(rr * Math.sin(pp) * Math.cos(tt), rr * 0.6 * Math.cos(pp), rr * Math.sin(pp) * Math.sin(tt) * 0.7);
        mesh.scale.setScalar(0.35 + Math.random() * 0.6);
        mesh.userData = { rx: (Math.random() - 0.5) * 0.014, ry: (Math.random() - 0.5) * 0.014, off: Math.random() * 100, sp: 0.3 + Math.random() * 0.5, amp: 0.3 + Math.random() * 0.7, base: mesh.position.clone() };
        scene.add(mesh); shapes.push(mesh);
      }
      var mX = 0, mY = 0, tX = 0, tY = 0, t = 0, running = true;
      window.addEventListener('pointermove', function (e) { mX = (e.clientX / innerWidth - 0.5) * 2; mY = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
      function resize() { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }
      window.addEventListener('resize', resize, { passive: true }); resize();
      function frame() {
        t += 0.01; tX += (mX - tX) * 0.05; tY += (mY - tY) * 0.05;
        particles.rotation.y += 0.0016; particles.rotation.x = Math.sin(t * 0.05) * 0.04;
        for (var i = 0; i < shapes.length; i++) {
          var sh = shapes[i], u = sh.userData;
          sh.rotation.x += u.rx; sh.rotation.y += u.ry;
          sh.position.y = u.base.y + Math.sin(t * u.sp + u.off) * u.amp * 0.4;
          sh.position.x += (u.base.x + tX * 1.3 - sh.position.x) * 0.03;
          sh.position.z += (u.base.z + tY * 1.0 - sh.position.z) * 0.03;
        }
        camera.position.x += (tX * 2.8 - camera.position.x) * 0.05;
        camera.position.y += (-tY * 2.0 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0); renderer.render(scene, camera);
      }
      function loop() { if (!running) return; frame(); requestAnimationFrame(loop); }
      document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) requestAnimationFrame(loop); });
      requestAnimationFrame(loop);   // always animate (background was explicitly requested)
    }

    function init2D() {
      var ctx = canvas.getContext('2d'); if (!ctx) return;
      var dpr, W, H, ps = [], raf = null, MARGIN = 60, MAXD, mx = null, my = null, pmx = 0, pmy = 0, gx = 0, gy = 0, ldx = -1, ldy = 0.25;
      function resize() { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); MAXD = innerWidth < 700 ? 120 : 150; init(); }
      function init() { ps = []; var n = Math.min(Math.round((W * H) / 9000), innerWidth < 700 ? 80 : 170); for (var i = 0; i < n; i++) ps.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, size: Math.random() * 1.8 + 1.2 }); }
      function connect() { for (var a = 0; a < ps.length; a++) for (var b = a + 1; b < ps.length; b++) { var dx = ps[a].x - ps[b].x, dy = ps[a].y - ps[b].y, d2 = dx * dx + dy * dy; if (d2 < MAXD * MAXD) { var op = 1 - Math.sqrt(d2) / MAXD; ctx.strokeStyle = 'rgba(240,165,60,' + (op * 0.55) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ps[a].x, ps[a].y); ctx.lineTo(ps[b].x, ps[b].y); ctx.stroke(); } } }
      function drift() { var tx, ty; if (mx != null) { var dvx = mx - pmx, dvy = my - pmy, sp = Math.sqrt(dvx * dvx + dvy * dvy); if (sp > 0.5) { tx = Math.max(-3.2, Math.min(3.2, dvx * 0.16)); ty = Math.max(-3.2, Math.min(3.2, dvy * 0.16)); var inv = 1 / sp; ldx = dvx * inv; ldy = dvy * inv; } else { tx = -ldx * 0.35; ty = -ldy * 0.35; } pmx = mx; pmy = my; } else { tx = -ldx * 0.35; ty = -ldy * 0.35; } gx += (tx - gx) * 0.05; gy += (ty - gy) * 0.05; }
      function step() { ctx.clearRect(0, 0, W, H); drift(); for (var i = 0; i < ps.length; i++) { var p = ps[i]; p.x += p.vx + gx; p.y += p.vy + gy; if (p.x < -MARGIN) p.x = W + MARGIN; else if (p.x > W + MARGIN) p.x = -MARGIN; if (p.y < -MARGIN) p.y = H + MARGIN; else if (p.y > H + MARGIN) p.y = -MARGIN; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = 'rgba(245,175,70,0.95)'; ctx.fill(); } connect(); raf = requestAnimationFrame(step); }
      window.addEventListener('resize', resize, { passive: true });
      window.addEventListener('pointermove', function (e) { if (mx == null) { pmx = e.clientX; pmy = e.clientY; } mx = e.clientX; my = e.clientY; }, { passive: true });
      document.addEventListener('mouseleave', function () { mx = my = null; });
      document.addEventListener('visibilitychange', function () { if (document.hidden) { cancelAnimationFrame(raf); raf = null; } else if (!raf) step(); });
      resize(); step();   // always animate
    }
  })();

  /* ---------- Nav: scrolled, progress, mobile, back-to-top ---------- */
  var nav = $('#nav'), progress = $('#progressTop'), toTop = $('#toTop');
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 24);
    if (toTop) toTop.classList.toggle('show', y > 500);
    if (progress) { var hh = document.documentElement.scrollHeight - window.innerHeight; progress.style.width = (hh > 0 ? y / hh * 100 : 0) + '%'; }
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  var navToggle = $('#navToggle'), navLinks = $('#navLinks');
  function closeMenu() { if (navLinks) navLinks.classList.remove('open'); if (navToggle) navToggle.innerHTML = '<i class="fas fa-bars"></i>'; }
  if (navToggle) navToggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    navToggle.innerHTML = open ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
  });

  /* ---------- Multi-page router with curtain transition ---------- */
  var pages = $$('.page');
  var fx = $('#pageFx');
  var current = null;

  function setNavActive(id) {
    $$('.dock-btn').forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + id); });
  }
  function revealPage(page) {
    var els = $$('.reveal', page);
    els.forEach(function (el) { el.classList.remove('in'); });
    void page.offsetWidth; // reflow so the transition replays
    els.forEach(function (el) { el.classList.add('in'); });
  }
  function runDynamic(page) {
    if (page.id === 'about') { bars(); counters(); }
  }
  function swapTo(next, id) {
    pages.forEach(function (p) { p.classList.remove('active'); });
    next.classList.add('active');
    window.scrollTo(0, 0);
    setNavActive(id);
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
    current = next;
    revealPage(next);
    runDynamic(next);
  }
  function showPage(id) {
    var next = document.getElementById(id);
    if (!next || !next.classList.contains('page') || next === current) return;
    closeMenu();
    if (reduce || !fx) { swapTo(next, id); return; }
    fx.classList.add('active');
    setTimeout(function () { swapTo(next, id); }, 520);
    setTimeout(function () { fx.classList.remove('active'); }, 580);
  }

  // intercept in-page anchor links → route between pages
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var t = document.getElementById(id);
      if (t && t.classList.contains('page')) { e.preventDefault(); showPage(id); }
    });
  });
  window.addEventListener('hashchange', function () {
    var id = location.hash.slice(1);
    var t = document.getElementById(id);
    if (t && t.classList.contains('page') && t !== current) showPage(id);
  });

  /* ---------- Skill bars & counters ---------- */
  function bars() { $$('.bar > span').forEach(function (s) { s.style.width = (s.getAttribute('data-w') || 0) + '%'; }); }
  function counters() {
    $$('.counter').forEach(function (el) {
      var t = +el.getAttribute('data-target');
      if (reduce) { el.textContent = t; return; }
      var dur = 1500, st = performance.now();
      (function s(n) { var p = Math.min((n - st) / dur, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(e * t); if (p < 1) requestAnimationFrame(s); })(st);
    });
  }

  /* ---------- Typing ---------- */
  var typed = $('#typed');
  if (typed) {
    var words = ['Software Engineer', '.NET Developer', 'Web Developer', 'App Developer'], wi = 0, ci = 0, del = false;
    (function type() {
      var wd = words[wi]; typed.textContent = wd.slice(0, ci);
      if (!del && ci < wd.length) { ci++; setTimeout(type, 85); }
      else if (!del && ci === wd.length) { del = true; setTimeout(type, 1500); }
      else if (del && ci > 0) { ci--; setTimeout(type, 40); }
      else { del = false; wi = (wi + 1) % words.length; setTimeout(type, 320); }
    })();
    if (reduce) typed.textContent = words[0];
  }

  /* ---------- Testimonials (clickable thumbnail slider) ---------- */
  var tImg = $('#tslImg');
  if (tImg) {
    var TDATA = [
      { img: 'img/testimonial-1.jpg', name: 'Arti Rupda', role: 'CEO, ARKIT | Japan Jewelry Company', quote: '"Amit is super supportive in his work. If you ask him to work on a project, he delivers it in no time. Very reliable and resourceful for .NET, MVC, and MS SQL. Highly recommend his work."' },
      { img: 'img/testimonial-2.jpg', name: 'Ryan Phoeng', role: 'PSM, PSPO', quote: '"Amit is very knowledgeable in what he does. We had many concurrent projects and Amit delivered them all promptly. I really appreciate his professional work."' },
      { img: 'img/testimonial-3.jpg', name: 'Jayeshkumar Dangruchiya', role: 'Digital Devices Expert', quote: '"Amit is genuinely encouraging in his work. He works swiftly and efficiently on any project. Extremely trustworthy and creative for design and development tasks."' }
    ];
    var tName = $('#tslName'), tRole = $('#tslRole'), tQuote = $('#tslQuote'),
        tCur = $('#tslCur'), tTotal = $('#tslTotal'), tText = $('#tslText'),
        tThumbs = $$('.tsl-thumb'), tIdx = 0, tTimer;
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    if (tTotal) tTotal.textContent = pad(TDATA.length);
    function tShow(n) {
      tIdx = (n + TDATA.length) % TDATA.length;
      var d = TDATA[tIdx];
      tImg.style.opacity = '0';
      setTimeout(function () { tImg.src = d.img; tImg.alt = d.name; tImg.style.opacity = '1'; }, 160);
      if (tName) tName.textContent = d.name;
      if (tRole) tRole.textContent = d.role;
      if (tQuote) tQuote.textContent = d.quote;
      if (tCur) tCur.textContent = pad(tIdx + 1);
      tThumbs.forEach(function (t, i) { t.classList.toggle('active', i === tIdx); });
      if (tText && !reduce) { tText.style.animation = 'none'; void tText.offsetWidth; tText.style.animation = ''; }
      tRestart();
    }
    function tRestart() { if (reduce) return; clearInterval(tTimer); tTimer = setInterval(function () { tShow(tIdx + 1); }, 7000); }
    tThumbs.forEach(function (t) { t.addEventListener('click', function () { tShow(+t.getAttribute('data-i')); }); });
    var tN = $('#tslNext'), tP = $('#tslPrev');
    if (tN) tN.onclick = function () { tShow(tIdx + 1); };
    if (tP) tP.onclick = function () { tShow(tIdx - 1); };
    tRestart();
  }

  /* ---------- Contact form (AJAX FormSubmit) ---------- */
  var form = $('#contactForm');
  if (form) {
    var stt = $('#formStatus'), btn = $('#sendBtn');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (stt) { stt.className = 'form-status'; stt.textContent = 'Sending…'; }
      if (btn) btn.disabled = true;
      fetch('https://formsubmit.co/ajax/destinyofamit@gmail.com', {
        method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form)
      }).then(function (r) { if (!r.ok) throw 0; return r.json().catch(function () { return {}; }); })
        .then(function () { if (stt) { stt.className = 'form-status ok'; stt.textContent = "✓ Thanks! Your message was sent — I'll reply within 24 hours."; } form.reset(); })
        .catch(function () { if (stt) { stt.className = 'form-status err'; stt.textContent = '✕ Could not send. Please email destinyofamit@gmail.com directly.'; } })
        .then(function () { if (btn) btn.disabled = false; });
    });
  }

  /* ---------- Work: animate card stack (front card drops, next opens) ---------- */
  (function astack() {
    var stack = $('#astack'); if (!stack) return;
    var cards = $$('.acard', stack);
    var btn = $('#astackBtn');
    var N = cards.length, order = cards.map(function (_, i) { return i; }), busy = false, VIS = 3;
    function layout() {
      order.forEach(function (ci, pos) {
        var c = cards[ci];
        c.style.zIndex = String(N - pos);
        c.style.transform = 'translateY(' + (-pos * 22) + 'px) scale(' + (1 - pos * 0.045).toFixed(3) + ')';
        c.style.opacity = pos < VIS ? '1' : '0';
        c.style.pointerEvents = pos === 0 ? 'auto' : 'none';
      });
    }
    function next() {
      if (busy || N < 2) return;
      busy = true;
      var front = cards[order[0]];
      front.classList.add('going');           // current card drops down + fades
      setTimeout(function () {
        order.push(order.shift());             // send it to the back, next becomes front
        front.classList.remove('going');
        layout();
        busy = false;
      }, reduce ? 0 : 520);
    }
    if (btn) btn.addEventListener('click', next);
    layout();
  })();

  /* ---------- Spotlight + custom trailing cursor ---------- */
  (function cursor() {
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var dot = $('#cursorDot'), ring = $('#cursorRing'), spot = $('#spotlight');
    if (!fine || reduce || !dot || !ring) return;
    document.body.classList.add('cursor-on');
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    }, { passive: true });
    // grow the ring over interactive elements
    var hoverSel = 'a, button, .dock-btn, .deck-card, .tarrow, .tdot, input, textarea, .badge-spin';
    document.addEventListener('pointerover', function (e) { if (e.target.closest && e.target.closest(hoverSel)) ring.classList.add('hover'); });
    document.addEventListener('pointerout', function (e) { if (e.target.closest && e.target.closest(hoverSel)) ring.classList.remove('hover'); });
    window.addEventListener('pointerdown', function () { ring.classList.add('down'); });
    window.addEventListener('pointerup', function () { ring.classList.remove('down'); });
    document.addEventListener('mouseleave', function () { dot.style.opacity = ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { dot.style.opacity = ring.style.opacity = '1'; });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;   // easing lag → the ring trails the cursor
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      if (spot) spot.style.background = 'radial-gradient(340px circle at ' + rx + 'px ' + ry + 'px, rgba(241,48,36,.12), rgba(255,106,61,.06) 42%, transparent 72%)';
      requestAnimationFrame(loop);
    })();
  })();

  /* ---------- About skills tabs ---------- */
  $$('.tab-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var wrap = b.closest('.about2-panel') || document;
      $$('.tab-btn', wrap).forEach(function (x) { x.classList.remove('active'); });
      $$('.tab-panel', wrap).forEach(function (p) { p.classList.remove('active'); });
      b.classList.add('active');
      var panel = document.getElementById(b.getAttribute('data-tab'));
      if (panel) panel.classList.add('active');
    });
  });

  /* ---------- Mouse-tracking parallax (eased → gentle, relaxing) ---------- */
  (function parallax() {
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine || reduce) return;
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null, root = document.documentElement;
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX / window.innerWidth - 0.5;   // -0.5 .. 0.5
      ty = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    function loop() {
      cx += (tx - cx) * 0.06;                      // slow lerp = soft, unhurried drift
      cy += (ty - cy) * 0.06;
      root.style.setProperty('--mx', cx.toFixed(4));
      root.style.setProperty('--my', cy.toFixed(4));
      raf = (Math.abs(tx - cx) > 0.0004 || Math.abs(ty - cy) > 0.0004) ? requestAnimationFrame(loop) : null;
    }
  })();

  /* ---------- Click ripple (fires on every click) ---------- */
  (function clickFx() {
    document.addEventListener('pointerdown', function (e) {
      var r = document.createElement('span');
      r.className = 'click-ripple';
      r.style.left = e.clientX + 'px';
      r.style.top = e.clientY + 'px';
      document.body.appendChild(r);
      setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 650);
    }, { passive: true });
  })();

  /* ---------- Year ---------- */
  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Boot: activate initial page ---------- */
  var startId = (location.hash || '#home').slice(1);
  var startEl = document.getElementById(startId);
  if (!startEl || !startEl.classList.contains('page')) { startEl = document.getElementById('home'); startId = 'home'; }
  pages.forEach(function (p) { p.classList.remove('active'); });
  startEl.classList.add('active');
  current = startEl;
  setNavActive(startId);
  window.addEventListener('load', function () { revealPage(startEl); runDynamic(startEl); });
})();
