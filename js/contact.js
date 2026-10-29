// Секция «Контакт» (#contact) — бейдж на ремешке, sections-v3/contact (port.mjs). Правки — там.
// Запускается, когда секция подходит к экрану.
(() => {
  const root = document.getElementById('contact');
  if (!root) return;
  let done = false;
  function boot() {
    if (done) return;
    done = true;
  const IMG = {"photo":"assets/contact/blazer.webp","sig":"/assets/contact/sig.webp"};
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// видимость и общий кадр: анимации крутятся только на экране
const vis = new WeakMap();
const io = new IntersectionObserver((es) => es.forEach((e) => vis.set(e.target, e.isIntersecting)), { rootMargin: '150px' });
const TK = [];
const tick = (s, f) => TK.push({ s, f });
(function loop(t) { for (const k of TK) if (vis.get(k.s)) k.f(t); requestAnimationFrame(loop); })(0);
const once = (el, f, th = 0.35) => { const o = new IntersectionObserver((es) => { if (es[0].isIntersecting) { o.disconnect(); f(); } }, { threshold: th }); o.observe(el); };
const local = (el, e) => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; };

  // 1 — бейдж: XPBD с шагом по реальному времени кадра (одинаково на 60 и 144 Гц).
  // Ремешок — цепочка лёгких точек: тянется с податливостью резины и не сжимается, а провисает.
  // Бейдж — две точки с жёсткой связью: клипса (1/4 массы) и точка на 2/3 высоты (3/4 массы) —
  // так у него момент инерции и центр масс настоящей пластины, и он качается как маятник, а не как стрелка.
  // Палец держит бейдж мягкой пружиной в точке касания: бейдж поворачивается вокруг пальца, бросок даёт честную скорость.
  function badge(s) {
    const st = s.querySelector('.stage1'), bd = s.querySelector('.badge'), bi = bd.querySelector('.bi'), path = s.querySelector('#strapP'), bands = s.querySelectorAll('.strap use');
    s.querySelector('.sg').style.setProperty('--sig', `url(${IMG.sig})`);
    const N = 14, MS = 0.035, MB = 1, B0 = N, B1 = N + 1, K = N + 2;
    const x = new Float64Array(K), y = new Float64Array(K), px = new Float64Array(K), py = new Float64Array(K);
    const vx = new Float64Array(K), vy = new Float64Array(K), w = new Float64Array(K), lam = new Float64Array(N);
    let G = 2900, VMAX = 2600, W = 0, H = 0, AX = 0, rest = 0, lb = 0, bw = 0, hb = 0, comp = 0, gl = 0;
    let drag = null, live = false, moved = 0, calm = 0, last = 0, kick = 0, tilt = 0, fa = 0, fv = 0;
    const AY = -24, GRAB = 1 / 14000;
    for (let i = 1; i < N; i++) w[i] = 1 / MS;
    w[B0] = 4 / MB; w[B1] = 4 / (3 * MB);
    const size = () => {
      W = st.clientWidth; H = st.clientHeight; AX = W / 2; bw = bd.offsetWidth; hb = bd.offsetHeight; lb = hb * 2 / 3;
      const len = H * (innerWidth < 900 ? 0.27 : 0.36); rest = len / N;
      // сила тяжести и предел скорости — в масштабе сцены: на телефоне бейдж качается в том же ритме, что на компьютере
      G = 2900 * (len / 260); VMAX = 2600 * (len / 260);
      comp = (0.17 * len) / (N * MB * G); // под весом бейджа резинка тянется на ~17%
    };
    const reset = () => {
      size();
      // старт: ремешок отведён вправо и чуть провисает — бейдж срывается и раскачивается
      for (let i = 0; i <= N; i++) { const r = i * rest * 0.92; x[i] = AX + r * Math.sin(1.15); y[i] = AY + r * Math.cos(1.15) - 30 * Math.sin((i / N) * Math.PI); }
      x[B1] = x[B0] + lb * 0.3; y[B1] = y[B0] + lb * 0.95;
      vx.fill(0); vy.fill(0); kick = 0; tilt = 0; calm = 0;
    };
    const wake = () => (calm = 0);
    // стенки сцены мягкие: за 60px до края включается пружина с трением, жёсткий упор — только последняя страховка
    const lim = (i) => [bw * 0.38, W - bw * 0.38, -H * 0.12 + (i === B1 ? lb : 0), i === B1 ? H - hb / 3 - 8 : H - hb - 8];
    function walls(i, h) {
      const [x0, x1, y0, y1] = lim(i), Z = 60, k = 900 * h, c = 1 - Math.min(1, 14 * h);
      let o = x[i] - (x1 - Z); if (o > 0) { vx[i] -= o * k; if (vx[i] > 0) vx[i] *= c; }
      o = x0 + Z - x[i]; if (o > 0) { vx[i] += o * k; if (vx[i] < 0) vx[i] *= c; }
      o = y[i] - (y1 - Z); if (o > 0) { vy[i] -= o * k; if (vy[i] > 0) vy[i] *= c; }
      o = y0 + Z - y[i]; if (o > 0) { vy[i] += o * k; if (vy[i] < 0) vy[i] *= c; }
    }
    const keep = (i) => { const [x0, x1, y0, y1] = lim(i); x[i] = clamp(x[i], x0, x1); y[i] = clamp(y[i], y0, y1); };

    function rope(i, h) {
      const j = i + 1, dx = x[j] - x[i], dy = y[j] - y[i], d = Math.hypot(dx, dy) || 1e-6, C = d - rest, e = Math.max(0, C / rest - 0.25);
      const at = comp / (1 + 120 * e * e) / (h * h); // резина твердеет при сильном растяжении — рывок до пола не долетает
      let dl = (-C - at * lam[i]) / (w[i] + w[j] + at);
      const nl = Math.min(0, lam[i] + dl); dl = nl - lam[i]; lam[i] = nl; // только натяжение: верёвка не толкает
      if (!dl) return;
      const nx = dx / d, ny = dy / d;
      x[i] -= w[i] * nx * dl; y[i] -= w[i] * ny * dl; x[j] += w[j] * nx * dl; y[j] += w[j] * ny * dl;
    }
    function rigid() {
      const dx = x[B1] - x[B0], dy = y[B1] - y[B0], d = Math.hypot(dx, dy) || 1e-6, dl = -(d - lb) / (w[B0] + w[B1]), nx = dx / d, ny = dy / d;
      x[B0] -= w[B0] * nx * dl; y[B0] -= w[B0] * ny * dl; x[B1] += w[B1] * nx * dl; y[B1] += w[B1] * ny * dl;
    }
    // точка касания g = (1−t)·B0 + t·B1 + q·⊥(B1−B0) — линейна по обеим точкам, поэтому хват сбоку даёт крутящий момент
    function grab(h) {
      const { t, q } = drag, ex = x[B1] - x[B0], ey = y[B1] - y[B0];
      const gx = x[B0] + t * ex - q * ey, gy = y[B0] + t * ey + q * ex, dx = gx - drag.tx, dy = gy - drag.ty, C = Math.hypot(dx, dy);
      if (C < 1e-6) return;
      const nx = dx / C, ny = dy / C, at = GRAB / (h * h);
      const ax0 = (1 - t) * nx - q * ny, ay0 = (1 - t) * ny + q * nx, ax1 = t * nx + q * ny, ay1 = t * ny - q * nx;
      const dl = (-C - at * gl) / (w[B0] * (ax0 * ax0 + ay0 * ay0) + w[B1] * (ax1 * ax1 + ay1 * ay1) + at); gl += dl;
      x[B0] += w[B0] * ax0 * dl; y[B0] += w[B0] * ay0 * dl; x[B1] += w[B1] * ax1 * dl; y[B1] += w[B1] * ay1 * dl;
    }
    function step(h) {
      walls(B0, h); walls(B1, h);
      for (let i = 1; i < K; i++) {
        const c = 1 - h * (i < B0 ? 2.6 : 1.1); // сопротивление воздуха: ремешок гасится быстрее бейджа
        vy[i] += G * h; vx[i] *= c; vy[i] *= c;
        px[i] = x[i]; py[i] = y[i]; x[i] += vx[i] * h; y[i] += vy[i] * h;
      }
      x[0] = AX; y[0] = AY; lam.fill(0); gl = 0;
      for (let it = 0; it < 4; it++) { for (let i = 0; i < N; i++) rope(i, h); rigid(); if (drag) grab(h); }
      keep(B0); keep(B1);
      for (let i = 1; i < K; i++) {
        vx[i] = (x[i] - px[i]) / h; vy[i] = (y[i] - py[i]) / h;
        // быстрый бросок тормозится плавно растущим сопротивлением, без жёсткого потолка скорости
        const sp = Math.hypot(vx[i], vy[i]) / VMAX; if (sp > 0.5) { const k = Math.exp(-h * 10 * (sp - 0.5) * (sp - 0.5)); vx[i] *= k; vy[i] *= k; }
      }
      // внутреннее трение резины: гасит только растяжение, качание остаётся долгим
      const f = Math.min(1, 14 * h);
      for (let i = 0; i < N; i++) {
        const j = i + 1, dx = x[j] - x[i], dy = y[j] - y[i], d = Math.hypot(dx, dy) || 1e-6;
        if (d <= rest) continue;
        const nx = dx / d, ny = dy / d, vr = ((vx[j] - vx[i]) * nx + (vy[j] - vy[i]) * ny) * f, ws = w[i] + w[j];
        vx[i] += nx * vr * w[i] / ws; vy[i] += ny * vr * w[i] / ws; vx[j] -= nx * vr * w[j] / ws; vy[j] -= ny * vr * w[j] / ws;
      }
      // трение в клипсе: гасит вращение бейджа относительно ремешка, как у настоящего карабина
      const ex = (x[B1] - x[B0]) / lb, ey = (y[B1] - y[B0]) / lb, rp = ((vx[B1] - vx[B0]) * -ey + (vy[B1] - vy[B0]) * ex) * Math.min(1, 2.2 * h), ws = w[B0] + w[B1];
      vx[B0] -= ey * rp * w[B0] / ws; vy[B0] += ex * rp * w[B0] / ws; vx[B1] += ey * rp * w[B1] / ws; vy[B1] -= ex * rp * w[B1] / ws;
    }
    function draw(dt) {
      // ремешок — гладкая кривая Катмулла–Рома через точки; заканчивается у верха клипсы
      const ex = x[B1] - x[B0], ey = y[B1] - y[B0], ang = Math.atan2(-ex, ey);
      const X = Array.from(x.subarray(0, N)), Y = Array.from(y.subarray(0, N));
      X.push(x[B0] - (ex / lb) * 26); Y.push(y[B0] - (ey / lb) * 26);
      let d = `M${X[0].toFixed(1)},${Y[0].toFixed(1)}`, len = 0;
      for (let i = 0; i < X.length - 1; i++) {
        const a = Math.max(i - 1, 0), b = Math.min(i + 2, X.length - 1);
        d += ` C${(X[i] + (X[i + 1] - X[a]) / 6).toFixed(1)},${(Y[i] + (Y[i + 1] - Y[a]) / 6).toFixed(1)} ${(X[i + 1] - (X[b] - X[i]) / 6).toFixed(1)},${(Y[i + 1] - (Y[b] - Y[i]) / 6).toFixed(1)} ${X[i + 1].toFixed(1)},${Y[i + 1].toFixed(1)}`;
        if (i < N) len += Math.hypot(x[i + 1] - x[i], y[i + 1] - y[i]);
      }
      path.setAttribute('d', d);
      // растянутая резинка становится уже
      const sw = (24 / Math.sqrt(Math.max(1, len / (rest * N)))).toFixed(2);
      bands.forEach((b) => (b.style.strokeWidth = sw));
      // разворот к зрителю от боковой скорости и переворот — пружины, а не CSS-переход
      tilt += (clamp((vx[B1] + vx[B0]) * 0.006, -26, 26) - tilt) * Math.min(1, dt * 9);
      const ft = bd.classList.contains('flip') ? 180 : 0;
      fv += ((ft - fa) * 120 - fv * 15) * dt; fa += fv * dt;
      bd.style.transform = `translate(${(x[B0] - bw / 2).toFixed(2)}px,${y[B0].toFixed(2)}px) rotate(${ang.toFixed(4)}rad) perspective(1100px) rotateY(${tilt.toFixed(2)}deg)`;
      if (!RM) bi.style.transform = `rotateY(${fa.toFixed(2)}deg)`;
      bd.style.setProperty('--h', (50 + ang * 160 + tilt * 1.4).toFixed(1) + '%');
      return Math.abs(ft - fa) + Math.abs(fv);
    }
    reset();
    if (!RM) bi.style.transition = 'none';
    draw(0);
    once(st, () => {
      live = true; bd.classList.add('on');
      if (RM) { for (let i = 0; i < 900; i++) step(1 / 240); draw(0); }
    });
    tick(s, (t) => {
      if (!live || RM) return;
      let dt = last ? (t - last) / 1000 : 1 / 60; last = t;
      if (calm > 40 && !drag) return;
      dt = clamp(dt, 1 / 240, 1 / 30);
      // толчок от прокрутки вливается за несколько кадров — без рывка
      if (kick) {
        const k = kick * 0.25, side = Math.sign(vx[B1]) || 1; kick -= k; if (Math.abs(kick) < 2) kick = 0;
        for (let i = 1; i < K; i++) { const r = Math.min(1, i / N); vy[i] += k * r; vx[i] += k * 0.22 * side * r; }
      }
      const n = Math.ceil(dt * 240 - 1e-6);
      for (let i = 0; i < n; i++) step(dt / n);
      const spin = draw(dt);
      let e = spin; for (let i = 1; i < K; i++) e = Math.max(e, Math.abs(vx[i]) + Math.abs(vy[i]));
      calm = e < 4 && !kick ? calm + 1 : 0;
      if (calm > 40) last = 0;
    });
    bd.addEventListener('pointerdown', (e) => {
      if (!live) return;
      const p = local(st, e), ex = x[B1] - x[B0], ey = y[B1] - y[B0], rx = p.x - x[B0], ry = p.y - y[B0];
      // координаты касания в осях бейджа: t — вдоль, q — поперёк (в долях lb)
      drag = { t: (rx * ex + ry * ey) / (lb * lb), q: (ry * ex - rx * ey) / (lb * lb), tx: p.x, ty: p.y }; moved = 0; wake();
      bd.setPointerCapture(e.pointerId);
    });
    bd.addEventListener('pointermove', (e) => {
      if (!drag) return; const p = local(st, e), nx = clamp(p.x, 0, W), ny = clamp(p.y, -60, H - 40);
      moved += Math.hypot(nx - drag.tx, ny - drag.ty); drag.tx = nx; drag.ty = ny; wake();
    });
    const up = () => { if (!drag) return; drag = null; if (moved < 6) bd.classList.toggle('flip'); wake(); };
    bd.addEventListener('pointerup', up); bd.addEventListener('pointercancel', up);
    bd.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bd.classList.toggle('flip'); wake(); } });
    let ly = scrollY;
    addEventListener('scroll', () => { const dy = scrollY - ly; ly = scrollY; if (!live || RM || !vis.get(s)) return; kick = clamp(kick + clamp(dy, -60, 60) * 7, -900, 900); wake(); }, { passive: true });
    addEventListener('resize', () => { const w0 = W; size(); if (Math.abs(w0 - W) > 40) reset(); wake(); });
  }

  root.querySelectorAll('.cs .copy').forEach((b) => (b.onclick = () => { navigator.clipboard?.writeText(b.dataset.mail).catch(() => {}); b.dataset.done = ''; setTimeout(() => delete b.dataset.done, 1400); }));
  io.observe(root); badge(root);
  }
  if (!('IntersectionObserver' in window)) { boot(); return; }
  const io0 = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io0.disconnect(); boot(); } }, { rootMargin: '1200px 0px' });
  io0.observe(root);
})();
