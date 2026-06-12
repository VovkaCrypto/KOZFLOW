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
    camera.position.set(0, -1.4, 16.5); // чуть снизу — афиши приподняты в кадре, ряд остаётся ровным

    var group = new THREE.Group();
    group.rotation.x = 0; // ровный горизонтальный ряд, без наклона
    scene.add(group);

    var R = 10;

    // ── gold dust — fills the whole panel, not just near the works ──
    var PCOUNT = isMobile ? 700 : 1300;
    var PR = 20; // большой объём → звёзды по всей плашке
    var pg = new THREE.BufferGeometry();
    var pos = new Float32Array(PCOUNT * 3);
    var col = new Float32Array(PCOUNT * 3);
    var c = new THREE.Color();
    for (var i = 0; i < PCOUNT; i++) {
      var rr = PR * Math.cbrt(Math.random());          // равномерно по объёму шара
      var u = Math.random() * 2 - 1;                    // cos(theta)
      var th = Math.random() * Math.PI * 2;
      var s = Math.sqrt(1 - u * u);
      pos[i * 3] = rr * s * Math.cos(th);
      pos[i * 3 + 1] = rr * u;
      pos[i * 3 + 2] = rr * s * Math.sin(th);
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
    var maxAniso = (renderer.capabilities && renderer.capabilities.getMaxAnisotropy)
      ? renderer.capabilities.getMaxAnisotropy() : 1;
    var fading = []; // meshes mid fade-in
    for (var k = 0; k < COUNT; k++) {
      (function (k) {
        var a = (k / COUNT) * Math.PI * 2;
        var x = R * Math.sin(a), z = R * Math.cos(a);
        var name = 'assets/works/w' + (k + 1 < 10 ? '0' + (k + 1) : (k + 1)) + '.jpg';
        // dark placeholder card (matches the band) — visible immediately,
        // so the orbit never looks blank or shows white planes while loading
        var mat = new THREE.MeshBasicMaterial({
          side: THREE.DoubleSide, transparent: true, opacity: 1, color: 0x241a11
        });
        var mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
        mesh.position.set(x, 0, z);
        mesh.rotation.y = a;
        mesh.scale.set(H * 0.72, H, 1); // poster-ish ratio until real AR is known
        group.add(mesh);
        loader.load(name, function (tex) {
          if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
          // crisp at glancing angles, no mipmap fallback fuzz
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          tex.anisotropy = maxAniso;
          mat.map = tex;
          mat.color.set(0xffffff); // let the texture show its true colors
          mat.needsUpdate = true;
          var img = tex.image;
          var ar = (img && img.width && img.height) ? (img.width / img.height) : 0.72;
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
    controls.minPolarAngle = Math.PI * 0.42; // узкий диапазон по вертикали — афиши не «вылетают» под заголовок
    controls.maxPolarAngle = Math.PI * 0.58;
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
      // smooth opacity fade-in for freshly-loaded posters (runs even off-screen so they're ready)
      if (fading.length) {
        for (var fi = fading.length - 1; fi >= 0; fi--) {
          var m = fading[fi];
          m.opacity = Math.min(1, m.opacity + 0.06);
          if (m.opacity >= 1) fading.splice(fi, 1);
        }
      }
      if (!visible) return;
      if (!reduce) group.rotation.y += isMobile ? 0.0016 : 0.0011;
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
  }
})();
