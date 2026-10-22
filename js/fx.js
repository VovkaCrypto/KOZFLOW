/* fx.js — слово и знак как материя: частицы, пиксели, рябь. Один холст поверх центра.
 * Снимки: REEL.fx.word(id) и REEL.fx.mark(color) растрируют слово/знак в их точном месте и берут точки.
 * Рисование — только из REEL.onRender сцены (функция времени ролика), ядро чистит холст в начале кадра:
 *   fx.scatter(snap, u, o) — распад в вихрь и сборка; fx.pixel(snap, block, tint) — пикселизация;
 *   fx.solid(snap, alpha) — слово целиком; fx.ring(x, y, r, a, col, w) — рябь.
 */
(() => {
  'use strict';
  const hero = document.querySelector('#hero'), copy = document.querySelector('.copy');
  const cv = document.createElement('canvas');
  cv.className = 'fx'; cv.setAttribute('aria-hidden', 'true');
  copy.after(cv);
  const g = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, dirty = false, snaps = {};
  const imgs = {};
  const PAL = ['#F5EFDF', '#C4985A', '#C26B4A', '#A8C5D9', '#C9B6E4', '#E8A9B8'];

  let markSrc = null;
  fetch('assets/mark.svg').then((r) => r.text()).then((s) => { markSrc = s; }).catch(() => {});

  // место элемента в кадре hero без учёта его собственных трансформов (сдвиг .copy учтён)
  const place = (el) => {
    const h = hero.getBoundingClientRect(), c = copy.getBoundingClientRect();
    let x = 0, y = 0, e = el;
    while (e && e !== copy) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    return { x: c.left - h.left + x, y: c.top - h.top + y, w: el.offsetWidth, h: el.offsetHeight };
  };
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // точки из растра; цвет частицы — по палитре, сгруппирован (рисуем пачками одного цвета)
  function sample(img, box, step) {
    const x0 = Math.max(0, Math.floor(box.x - 10)), y0 = Math.max(0, Math.floor(box.y - 10));
    const bw = Math.min(W - x0, Math.ceil(box.w + 20)), bh = Math.min(H - y0, Math.ceil(box.h + 20));
    const d = img.getContext('2d').getImageData(x0, y0, bw, bh).data;
    const pts = [];
    for (let y = 0; y < bh; y += step) for (let x = 0; x < bw; x += step) if (d[(y * bw + x) * 4 + 3] > 120) pts.push(x0 + x, y0 + y);
    const n = pts.length / 2, P = new Float32Array(pts), R = new Float32Array(n * 4), C = new Uint8Array(n);
    seed = 11;
    for (let i = 0; i < n; i++) { R[i * 4] = rand(); R[i * 4 + 1] = rand(); R[i * 4 + 2] = rand(); R[i * 4 + 3] = rand(); C[i] = Math.floor(rand() * PAL.length); }
    const order = [...Array(n).keys()].sort((a, b) => C[a] - C[b]);
    return { n, P, R, C, order, box: { x: x0, y: y0, w: bw, h: bh }, cx: x0 + bw / 2, cy: y0 + bh / 2 };
  }
  const off = () => { const o = document.createElement('canvas'); o.width = W; o.height = H; return o; };

  const FX = (window.REEL.fx = {
    PAL,
    resize() {
      W = hero.clientWidth; H = hero.clientHeight; dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr; snaps = {}; dirty = true;
    },
    // ядро зовёт в начале кадра
    frame() { if (dirty) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); dirty = false; } g.setTransform(dpr, 0, 0, dpr, 0, 0); },
    word(id, color) {
      const key = 'w:' + id + color;
      if (snaps[key]) return snaps[key];
      const w = document.querySelector(`.word[data-w="${id}"]`), L = [...w.querySelectorAll('b')];
      const fs = parseFloat(getComputedStyle(w).fontSize), img = off(), o = img.getContext('2d');
      o.font = `900 ${fs}px STRome, Georgia, serif`; o.textBaseline = 'alphabetic'; o.fillStyle = color;
      const m = o.measureText('Н'), A = m.fontBoundingBoxAscent, Dd = m.fontBoundingBoxDescent;
      let bx = 1e9, by = 1e9, bx1 = -1e9, by1 = -1e9;
      const letters = L.map((b) => {
        const p = place(b), base = p.y + 0.12 * fs + (0.95 * fs - (A + Dd)) / 2 + A;
        o.fillText(b.textContent, p.x + 0.015 * fs, base);
        bx = Math.min(bx, p.x); by = Math.min(by, p.y); bx1 = Math.max(bx1, p.x + p.w); by1 = Math.max(by1, p.y + p.h);
        return { ...p, ch: b.textContent, base };
      });
      const s = sample(img, { x: bx, y: by, w: bx1 - bx, h: by1 - by }, W < 761 ? 2 : 3);
      return (snaps[key] = { ...s, img, letters, fs, color });
    },
    mark(color) {
      const key = 'm:' + color;
      if (snaps[key]) return snaps[key];
      const el = document.querySelector('.mark');
      if (!markSrc || !el) return null;
      let im = imgs[color];
      if (!im) { im = imgs[color] = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markSrc.replace(/#2D2419/g, color)); }
      if (!im.complete || !im.naturalWidth) return null;
      const p = place(el), img = off();
      img.getContext('2d').drawImage(im, p.x, p.y, p.w, p.h);
      const s = sample(img, p, 2);
      if (!s.n) return null;
      return (snaps[key] = { ...s, img, home: p });
    },
    solid(snap, alpha = 1, dx = 0, dy = 0) {
      if (!snap || alpha <= 0) return; dirty = true;
      g.globalAlpha = alpha; g.drawImage(snap.img, snap.box.x, snap.box.y, snap.box.w, snap.box.h, snap.box.x + dx, snap.box.y + dy, snap.box.w, snap.box.h); g.globalAlpha = 1;
    },
    /* распад и сборка. o: t0 — взрыв, t1 — начало сборки, R — радиус, cx/cy — центр вихря, spin, dx/dy — сдвиг цели (знак летит к слову) */
    scatter(snap, u, o) {
      if (!snap) return 0;
      const { n, P, R, C, order } = snap, cx = o.cx ?? snap.cx, cy = o.cy ?? snap.cy, Rr = o.R, spin = o.spin ?? 1;
      const kOut = Math.min(1, Math.max(0, (u - o.t0) / 0.35));
      const kBack = Math.min(1, Math.max(0, (u - o.t1 - 0.25) / 0.55));
      if (u < o.t0 || u > o.t1 + 0.9) return 0;
      dirty = true;
      const bw = snap.box.w || 1, hold = Math.max(0, Math.min(u, o.t1 + 0.6) - o.t0);
      let col = -1;
      for (let j = 0; j < n; j++) {
        const i = order[j], x = P[i * 2], y = P[i * 2 + 1], r1 = R[i * 4], r2 = R[i * 4 + 1], r3 = R[i * 4 + 2], r4 = R[i * 4 + 3];
        let po = (u - o.t0 - r1 * 0.12) / 0.5; po = po <= 0 ? 0 : po >= 1 ? 1 : 1 - Math.pow(1 - po, 3);
        const sx = (x - snap.box.x) / bw;
        let pb = (u - o.t1 - sx * 0.3 - r2 * 0.08) / 0.5; pb = pb <= 0 ? 0 : pb >= 1 ? 1 : pb < 0.5 ? 4 * pb * pb * pb : 1 - Math.pow(-2 * pb + 2, 3) / 2;
        const k = po * (1 - pb);
        if (k <= 0.001 && kOut >= 1 && kBack <= 0) continue;
        let vx = x - cx, vy = y - cy; const L = Math.hypot(vx, vy) || 1;
        const a0 = Math.atan2(vy, vx) + (r2 - 0.5) * 1.6, dist = (0.18 + r3 * 0.82) * Rr;
        const ex = Math.cos(a0) * dist, ey = Math.sin(a0) * dist * 0.62;
        const phi = k * spin * (0.9 + r4 * 1.3 + hold * (0.6 + r4));
        let px = vx + ex * k, py = vy + ey * k;
        const c = Math.cos(phi), s = Math.sin(phi);
        const qx = px * c - py * s * 1.6, qy = px * s / 1.6 + py * c;
        const X = cx + qx + (o.dx || 0) * k, Y = cy + qy + (o.dy || 0) * k;
        if (C[i] !== col) { col = C[i]; g.fillStyle = k > 0.05 ? PAL[col] : snap.color || PAL[0]; }
        const sz = 1.4 + k * (0.8 + r4 * 2.4);
        g.globalAlpha = Math.min(1, 0.35 + k * 1.2) * (1 - 0.0 * L);
        g.fillRect(X - sz / 2, Y - sz / 2, sz, sz);
      }
      g.globalAlpha = 1;
      // твёрдое слово уходит в первые доли взрыва и возвращается в конце сборки
      const solidA = Math.max(1 - kOut * 4, (kBack - 0.8) / 0.2);
      return Math.max(0, Math.min(1, solidA));
    },
    // пикселизация: блок в px; tint — сдвиг палитры по блокам (0 — без цвета)
    // покрытие честно усредняется по площади блока (drawImage при сильном сжатии теряет тонкие штрихи)
    pixel(snap, block, tint = 0, t = 0) {
      if (!snap) return; dirty = true;
      const b = Math.max(1, Math.round(block)), { x, y, w, h } = snap.box;
      if (b < 2) { FX.solid(snap, 1); return; }
      const A = snap.alpha || (snap.alpha = snap.img.getContext('2d').getImageData(x, y, w, h).data);
      const cache = snap.cells || (snap.cells = {});
      let cell = cache[b];
      if (!cell) {
        const cw = Math.ceil(w / b), ch = Math.ceil(h / b), cov = new Float32Array(cw * ch);
        for (let yy = 0; yy < h; yy++) { const row = Math.floor(yy / b) * cw; for (let xx = 0; xx < w; xx++) cov[row + Math.floor(xx / b)] += A[(yy * w + xx) * 4 + 3]; }
        for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) { const n = Math.min(b, w - i * b) * Math.min(b, h - j * b); cov[j * cw + i] /= 255 * n; }
        cell = cache[b] = { cw, ch, cov };
      }
      const { cw, ch, cov } = cell, gap = b >= 7 ? 1 : 0, shift = Math.floor(t * 6);
      for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
        const c = cov[j * cw + i];
        if (c < 0.14) continue;
        const r = Math.abs(Math.sin(i * 12.99 + j * 78.23) * 43758.5) % 1;
        g.fillStyle = r < tint ? PAL[1 + ((i + (j >> 1) + shift) % (PAL.length - 1))] : snap.color || PAL[0];
        g.globalAlpha = Math.min(1, c * 1.7);
        g.fillRect(x + i * b, y + j * b, b - gap, b - gap);
      }
      g.globalAlpha = 1;
    },
    ring(x, y, r, a, col = '#F5EFDF', w = 1.5) {
      if (a <= 0 || r <= 0) return; dirty = true;
      g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    },
    get ctx() { dirty = true; return g; },
    place
  });
})();
