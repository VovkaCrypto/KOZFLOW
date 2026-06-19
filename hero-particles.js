/* KozFlow hero — warm particle network (vanilla port of the Aether-Flow canvas).
   Brand palette: gold / terracotta / cream on warm-dark. Mounts on #heroParticles
   inside .hero. Degrades gracefully: reduced-motion / weak device / no canvas ->
   static frame or CSS gradient. Same perf discipline as hero-hills.js. */
(function () {
  function start() {
    // only run when this variant is selected (index uses body[data-herobg])
    if (document.body && document.body.getAttribute('data-herobg') !== 'particles') return;
    var canvas = document.getElementById('heroParticles');
    var hero = document.querySelector('.hero');
    if (!canvas || !hero) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var mq = window.matchMedia || function () { return { matches: false }; };
    var reduce = mq('(prefers-reduced-motion: reduce)').matches;
    var coarse = mq('(hover: none), (pointer: coarse)').matches;
    var mobile = mq('(max-width: 720px)').matches || coarse;

    var saveData = navigator.connection && navigator.connection.saveData;
    var weak = (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
               (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);

    // ── brand palette ──
    var GOLD  = [196, 152, 90];   // #C4985A
    var TERRA = [194, 107, 74];   // #C26B4A
    var CREAM = [232, 220, 192];  // #E8DCC0

    var DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5);
    var FPS = mobile ? 30 : 60;
    var frameMin = 1000 / FPS;

    var W = 0, H = 0;            // CSS px
    var particles = [];
    var grad = null;
    var mouse = { x: null, y: null, radius: mobile ? 0 : 170 };
    var maxDist = mobile ? 140 : 195;     // wider reach → denser, richer web
    var maxDistSq = maxDist * maxDist;

    function makeGradient() {
      grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1F1612');
      grad.addColorStop(0.55, '#1A1410');
      grad.addColorStop(1, '#140F0B');
    }

    function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

    function Particle(x, y, dx, dy, size, color) {
      this.x = x; this.y = y; this.dx = dx; this.dy = dy; this.size = size; this.color = color;
    }
    Particle.prototype.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    };
    Particle.prototype.update = function () {
      if (this.x > W || this.x < 0) this.dx = -this.dx;
      if (this.y > H || this.y < 0) this.dy = -this.dy;
      if (mouse.x !== null && mouse.radius) {
        var ddx = mouse.x - this.x, ddy = mouse.y - this.y;
        var dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < mouse.radius + this.size && dist > 0) {
          var f = (mouse.radius - dist) / mouse.radius;
          this.x -= (ddx / dist) * f * 4;
          this.y -= (ddy / dist) * f * 4;
        }
      }
      this.x += this.dx;
      this.y += this.dy;
      this.draw();
    };

    function init() {
      particles = [];
      // area-based count, capped so the O(n²) connect stays cheap
      var area = W * H;
      var n = Math.floor(area / (mobile ? 19000 : 10500));
      n = Math.max(28, Math.min(n, mobile ? 72 : 185));
      for (var i = 0; i < n; i++) {
        var size = Math.random() * 1.6 + 1;
        var x = Math.random() * (W - size * 2) + size;
        var y = Math.random() * (H - size * 2) + size;
        var dx = (Math.random() * 0.4) - 0.2;
        var dy = (Math.random() * 0.4) - 0.2;
        // mix gold↔terracotta per particle for warm variety
        var t = Math.random() * 0.5;
        var c = [
          Math.round(GOLD[0] + (TERRA[0] - GOLD[0]) * t),
          Math.round(GOLD[1] + (TERRA[1] - GOLD[1]) * t),
          Math.round(GOLD[2] + (TERRA[2] - GOLD[2]) * t)
        ];
        particles.push(new Particle(x, y, dx, dy, size, rgba(c, 0.85)));
      }
    }

    function resize() {
      W = hero.clientWidth || window.innerWidth;
      H = hero.clientHeight || window.innerHeight;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      makeGradient();
      init();
    }

    function connect() {
      for (var a = 0; a < particles.length; a++) {
        var pa = particles[a];
        for (var b = a + 1; b < particles.length; b++) {
          var pb = particles[b];
          var dx = pa.x - pb.x, dy = pa.y - pb.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < maxDistSq) {
            var ratio = d2 / maxDistSq;             // 0 = touching, 1 = far edge
            var op = 1 - ratio;                     // fade with distance
            // near cursor → cream highlight; otherwise the line shifts gold
            // (short links) → terracotta (long links) for a varied warm web
            var hot = false;
            if (mouse.x !== null && mouse.radius) {
              var mdx = pa.x - mouse.x, mdy = pa.y - mouse.y;
              if (mdx * mdx + mdy * mdy < mouse.radius * mouse.radius) hot = true;
            }
            if (hot) {
              ctx.strokeStyle = rgba(CREAM, op * 0.9);
            } else {
              var lc = [
                Math.round(GOLD[0] + (TERRA[0] - GOLD[0]) * ratio),
                Math.round(GOLD[1] + (TERRA[1] - GOLD[1]) * ratio),
                Math.round(GOLD[2] + (TERRA[2] - GOLD[2]) * ratio)
              ];
              ctx.strokeStyle = rgba(lc, op * 0.5);
            }
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.stroke();
          }
        }
      }
    }

    function render() {
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) particles[i].update();
      connect();
    }

    window.addEventListener('resize', resize);
    resize();

    if (!coarse) {
      window.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      });
      window.addEventListener('mouseout', function () { mouse.x = null; mouse.y = null; });
    }

    // Reduced motion / weak / save-data → one static frame, no loop
    if (reduce || weak || saveData) { render(); return; }

    var raf = 0, visible = true, last = 0;
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      if (now - last < frameMin) return;   // FPS cap
      last = now;
      render();
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var v = es[0].isIntersecting;
        if (v && !visible) { visible = true; }
        else if (!v && visible) { visible = false; }
      }, { threshold: 0 }).observe(hero);
    }
    raf = requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else { start(); }
})();
