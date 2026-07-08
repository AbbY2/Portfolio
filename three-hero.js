/* =========================================================
   Three.js scroll-driven 3D hero  (r128 UMD, global THREE)
   Static · GitHub-Pages friendly · DPR-aware · reduced-motion safe
   - Faceted icosahedron + wireframe overlay (the "3D object")
   - Particle field for depth
   - Scroll progress drives scale / position / camera / color
   - Pointer parallax with damping
   ========================================================= */
(function () {
  'use strict';

  var canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') {
    if (canvas) canvas.style.display = 'none';
    return;
  }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  // ---- main faceted object ----
  var group = new THREE.Group();
  scene.add(group);

  var geo = new THREE.IcosahedronGeometry(1.7, 1);
  var mat = new THREE.MeshStandardMaterial({
    color: 0xf13024, roughness: 0.28, metalness: 0.65, flatShading: true
  });
  var mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);

  var wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(geo),
    new THREE.LineBasicMaterial({ color: 0xff6a3d, transparent: true, opacity: 0.45 })
  );
  mesh.add(wire);

  // small orbiting torus for extra interest
  var ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.7, 0.04, 16, 120),
    new THREE.MeshBasicMaterial({ color: 0xff7a59, transparent: true, opacity: 0.5 })
  );
  ring.rotation.x = Math.PI / 2.2;
  group.add(ring);

  // ---- particle field ----
  var N = window.innerWidth < 768 ? 380 : 750;
  var pGeo = new THREE.BufferGeometry();
  var pos = new Float32Array(N * 3);
  for (var i = 0; i < N; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 20;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var points = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xffc448, size: 0.035, transparent: true, opacity: 0.75, sizeAttenuation: true
  }));
  scene.add(points);

  // ---- lights ----
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  var key = new THREE.DirectionalLight(0xff7a59, 1.3); key.position.set(5, 5, 5); scene.add(key);
  var fill = new THREE.DirectionalLight(0xff6a3d, 1.1); fill.position.set(-6, -3, 2); scene.add(fill);
  var rim = new THREE.PointLight(0xff8a3d, 1.2, 30); rim.position.set(0, 2, 6); scene.add(rim);

  // ---- state ----
  var progress = 0;             // 0..1 across the hero scroll
  var targetMX = 0, targetMY = 0, mx = 0, my = 0;
  var color = new THREE.Color();

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    canvas.width = w * renderer.getPixelRatio();
    canvas.height = h * renderer.getPixelRatio();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function computeProgress() {
    var hero = document.querySelector('.hero-wrap');
    if (!hero) { progress = 0; return; }
    var max = hero.offsetHeight - window.innerHeight;
    progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    // hide the whole canvas once we're well past the hero (save GPU)
    canvas.style.opacity = String(Math.max(0, 1 - progress * 0.9));
  }
  window.addEventListener('scroll', computeProgress, { passive: true });
  computeProgress();

  if (!reduce) {
    window.addEventListener('pointermove', function (e) {
      targetMX = (e.clientX / window.innerWidth - 0.5);
      targetMY = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });
  }

  var clock = new THREE.Clock();
  var running = true;
  // pause render when tab hidden
  document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) loop(); });

  function frame() {
    var t = clock.getElapsedTime();
    mx += (targetMX - mx) * 0.05;
    my += (targetMY - my) * 0.05;

    // idle spin + pointer parallax
    group.rotation.y = t * 0.28 + mx * 0.9;
    group.rotation.x = t * 0.12 + my * 0.9;
    ring.rotation.z = t * 0.5;

    // scroll-driven transforms
    var p = progress;
    group.scale.setScalar(1 - p * 0.45);
    group.position.y = p * 2.2;
    group.position.x = p * -1.2;
    camera.position.z = 6 + p * 2.5;

    // morph accent color as you scroll (indigo -> violet)
    color.setHSL(0.02 + p * 0.04, 0.85, 0.55);
    mat.color.copy(color);

    points.rotation.y = t * 0.035;
    points.rotation.x = t * 0.012;

    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    frame();
  }

  if (reduce) {
    // static single render, no animation
    group.rotation.set(0.4, 0.6, 0);
    frame();
  } else {
    loop();
  }

  // expose a tiny hook so the theme toggle can nudge particle brightness
  window.__threeHero = {
    setTheme: function (mode) {
      points.material.opacity = mode === 'dark' ? 0.8 : 0.55;
      wire.material.opacity = mode === 'dark' ? 0.5 : 0.35;
    }
  };
})();
