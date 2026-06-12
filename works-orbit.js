// 3D-орбита дизайн-работ. three.js грузится лениво — только когда секция в зоне видимости.
(function () {
  var el = document.getElementById('worksOrbit');
  if (!el) return;
  var stage = document.getElementById('worksStage');
  var canvas = document.getElementById('worksCanvas');
  if (!stage || !canvas) return;

  var started = false;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !started) { started = true; io.disconnect(); boot(); }
    });
  }, { rootMargin: '300px' });
  io.observe(el);

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  function boot() {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
      .then(function () { return loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'); })
      .then(init)
      .catch(function () { /* нет сети/WebGL — оставляем тёмный бэнд как есть */ });
  }

  function init() {
    var THREE = window.THREE;
    if (!THREE) return;
    var isMobile = window.matchMedia('(max-width:720px)').matches;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !isMobile, alpha: true });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 2.4, 18);

    var group = new THREE.Group();
    group.rotation.x = 0.18;
    scene.add(group);

    var R = 10;

    // ── gold dust particles ──
    var PCOUNT = isMobile ? 420 : 900;
    var pg = new THREE.BufferGeometry();
    var pos = new Float32Array(PCOUNT * 3);
    var col = new Float32Array(PCOUNT * 3);
    var c = new THREE.Color();
    for (var i = 0; i < PCOUNT; i++) {
      var phi = Math.acos(-1 + (2 * i) / PCOUNT);
      var theta = Math.sqrt(PCOUNT * Math.PI) * phi;
      var rr = R + (Math.random() - 0.5) * 4;
      pos[i * 3] = rr * Math.cos(theta) * Math.sin(phi);
      pos[i * 3 + 1] = rr * Math.cos(phi);
      pos[i * 3 + 2] = rr * Math.sin(theta) * Math.sin(phi);
      c.setHSL(0.09 + Math.random() * 0.04, 0.7, 0.55 + Math.random() * 0.3); // warm gold
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var pm = new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true });
    group.add(new THREE.Points(pg, pm));

    // ── orbiting works (original aspect ratio, wider) ──
    var COUNT = 20;
    var H = 3.2; // height of each work; width derives from its real aspect
    var loader = new THREE.TextureLoader();
    for (var k = 0; k < COUNT; k++) {
      (function (k) {
        var a = (k / COUNT) * Math.PI * 2;
        var x = R * Math.sin(a), z = R * Math.cos(a);
        var name = 'assets/works/w' + (k + 1 < 10 ? '0' + (k + 1) : (k + 1)) + '.jpg';
        var mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true });
        var mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
        mesh.position.set(x, 0, z);
        mesh.rotation.y = a;
        mesh.scale.set(H, H, 1);
        group.add(mesh);
        loader.load(name, function (tex) {
          if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
          mat.map = tex; mat.needsUpdate = true;
          var img = tex.image;
          var ar = (img && img.width && img.height) ? (img.width / img.height) : 1;
          mesh.scale.set(H * ar, H, 1);
        });
      })(k);
    }

    // ── controls ──
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.5;
    controls.minPolarAngle = Math.PI * 0.30;
    controls.maxPolarAngle = Math.PI * 0.62;
    if (isMobile) controls.enabled = false; // не перехватываем скролл страницы

    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    var visible = true;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { visible = e.isIntersecting; });
    }, { threshold: 0.01 }).observe(el);

    function animate() {
      requestAnimationFrame(animate);
      if (!visible) return;
      if (!reduce) group.rotation.y += isMobile ? 0.0016 : 0.0011;
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
  }
})();
