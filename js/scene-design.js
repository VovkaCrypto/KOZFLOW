/* scene-design.js — «Дизайн»: афиши живут как система.
 * Влетают из глубины созвездием вокруг центра → соединяются линиями → переворачиваются волной (на обороте другая работа)
 * → складываются «по полочкам» в две сетки по бокам → разлетаются на шве. Наведение: работа выходит вперёд; клик — к работам.
 * u = t − a (a = 22), 5 с = 10 долей. Позиции — трансформы от (0,0) кадра: x, y = центр афиши.
 */
REEL.scene('design', (c) => {
  if (c.mob && REEL.mobile.design) return REEL.mobile.design(c);
  const { tl, a, b, cam, W, H, mob, $, $$ } = c;
  const all = (REEL.works || []).filter((w) => /афиша|постер|соцсети|меню/.test(w.kind) && w.h >= w.w);
  const pick = all.length >= 24 ? all : (REEL.works || []);
  // созвездие вокруг центра (доли кадра) и «полки» — по 6 работ с каждой стороны
  const STAR = mob
    ? [[0.14, 0.2], [0.5, 0.13], [0.86, 0.2], [0.12, 0.78], [0.5, 0.86], [0.88, 0.78]]
    : [[0.08, 0.25], [0.19, 0.33], [0.1, 0.6], [0.21, 0.68], [0.92, 0.25], [0.81, 0.33], [0.9, 0.6], [0.79, 0.68], [0.28, 0.15], [0.72, 0.15], [0.31, 0.86], [0.69, 0.86]];
  const SHELF = mob ? STAR : [[0.085, 0.24], [0.185, 0.24], [0.085, 0.49], [0.185, 0.49], [0.085, 0.74], [0.185, 0.74], [0.915, 0.24], [0.815, 0.24], [0.915, 0.49], [0.815, 0.49], [0.915, 0.74], [0.815, 0.74]];
  const SC = mob ? [1, 1, 1, 1, 1, 1] : [1, 0.9, 0.95, 0.85, 1, 0.9, 0.95, 0.85, 0.72, 0.72, 0.62, 0.62];
  const n = STAR.length;
  const pw = mob ? Math.min(W * 0.22, 96) : Math.min(W * 0.075, 118);
  const src = (w) => 'assets/' + (w.thumb || w.file);
  cam.innerHTML = `<svg class="ds-net" style="opacity:1" viewBox="0 0 ${W} ${H}" aria-hidden="true">${'<line/>'.repeat(n)}${'<circle r="3"/>'.repeat(n)}</svg>` +
    STAR.map((p, i) => {
      const w1 = pick[(i * 2) % pick.length] || {}, w2 = pick[(i * 2 + 1) % pick.length] || {};
      return `<a class="it ds-p" href="#works" data-work="${w1.id ?? ''}" style="width:${pw}px"><span class="fl"><img class="f1" src="${src(w1)}" alt="" decoding="async"><img class="f2" src="${src(w2)}" alt="" decoding="async"></span></a>`;
    }).join('');
  const P = $$('.ds-p', cam), FL = P.map((p) => $('.fl', p));
  const lines = $$('.ds-net line', cam), dots = $$('.ds-net circle', cam);
  const px = (f) => f * W, py = (f) => f * H;

  /* ── исходные: каждая афиша стоит в своей точке созвездия, глубоко «за кадром» ── */
  P.forEach((p, i) => {
    tl.set(p, { opacity: 0, x: px(STAR[i][0]), y: py(STAR[i][1]), xPercent: -50, yPercent: -50, scale: SC[i], rotation: (i % 2 ? 1 : -1) * (3 + (i % 3) * 2), filter: 'blur(0px)', zIndex: 1 }, 0);
    tl.set(FL[i], { rotationY: 0, transformPerspective: 900 }, 0);
  });
  const net = { p: 0, o: 0, run: 0 };
  tl.set(net, { p: 0, o: 0, run: 0 }, 0);

  const home = (i) => [px(STAR[i][0]), py(STAR[i][1])];
  /* ── 1 · раздача: афиши вылетают из-за слова, как карты, с вращением; посадка — сжатие и пружина ── */
  const order = P.map((p, i) => i).sort((i, j) => Math.abs(STAR[j][0] - 0.5) - Math.abs(STAR[i][0] - 0.5));
  order.forEach((i, k) => {
    const T = a + 0.02 + k * 0.04, [hx, hy] = home(i), rot = (i % 2 ? 1 : -1) * (3 + (i % 3) * 2);
    tl.set(P[i], { opacity: 1 }, T);
    tl.fromTo(P[i], { x: W / 2, y: H * 0.47, scale: SC[i] * 0.35, rotation: rot + (i % 2 ? 380 : -380) },
      { x: hx, y: hy, scale: SC[i], rotation: rot, duration: 0.5, ease: 'power3.out', immediateRender: false }, T);
    tl.fromTo(FL[i], { scaleX: 1, scaleY: 1 }, { scaleX: 1.14, scaleY: 0.86, duration: 0.07, ease: 'power2.out', immediateRender: false }, T + 0.46);
    tl.to(FL[i], { scaleX: 1, scaleY: 1, duration: 0.45, ease: 'elastic.out(1, 0.4)' }, T + 0.53);
  });
  /* ── 2 · связи: линии прочерчиваются, по ним бегут огоньки ── */
  tl.to(net, { p: 1, o: 1, duration: 0.7, ease: 'power3.inOut' }, a + 0.6);
  tl.fromTo(net, { run: 0 }, { run: 1, duration: 2.2, ease: 'none', immediateRender: false }, a + 0.9);
  /* ── 3 · панч на долях: каждая доля — своя тройка афиш выпрыгивает вперёд ── */
  [1.0, 1.5, 2.0].forEach((u, k) => {
    [k, k + 4, k + 8].filter((i) => i < n).forEach((i) => {
      const T = a + u;
      tl.to(FL[i], { scale: 1.2, rotation: (i % 2 ? 6 : -6), duration: 0.12, ease: 'power2.out' }, T);
      tl.to(FL[i], { scale: 1, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.35)' }, T + 0.12);
    });
  });
  /* ── 4 · переворот волной слева направо: на обороте — другая работа ── */
  const byX = P.map((p, i) => i).sort((i, j) => STAR[i][0] - STAR[j][0]);
  byX.forEach((i, k) => tl.to(FL[i], { rotationY: 180, duration: 0.55, ease: 'back.inOut(1.5)' }, a + 1.75 + k * 0.045));
  /* ── 5 · обмен: пары меняются местами по дугам ── */
  const PAIRS = mob ? [[0, 2], [3, 5]] : [[0, 3], [1, 2], [4, 7], [5, 6], [8, 9], [10, 11]];
  const at = {}; P.forEach((p, i) => { at[i] = home(i); });
  PAIRS.forEach(([i, j], k) => {
    const T = a + 2.45 + k * 0.03, [xi, yi] = at[i], [xj, yj] = at[j], lift = H * 0.06;
    [[i, xj, yj, -1], [j, xi, yi, 1]].forEach(([q, x2, y2, sgn]) => {
      tl.to(P[q], { x: x2, duration: 0.45, ease: 'power3.inOut' }, T);
      tl.to(P[q], { y: Math.min(yi, yj) + sgn * lift, duration: 0.22, ease: 'power2.out' }, T);
      tl.to(P[q], { y: y2, duration: 0.23, ease: 'power2.in' }, T + 0.22);
      tl.to(P[q], { rotation: '+=' + sgn * 180, duration: 0.45, ease: 'power3.inOut' }, T);
    });
    at[i] = [xj, yj]; at[j] = [xi, yi];
  });
  /* ── 6 · магнит: все втягиваются к слову и пружиной отскакивают ── */
  tl.to(net, { o: 0, duration: 0.2, ease: 'none' }, a + 2.95);
  P.forEach((p, i) => {
    const [x0, y0] = at[i], T = a + 3.0;
    tl.to(p, { x: x0 + (W / 2 - x0) * 0.22, y: y0 + (H * 0.47 - y0) * 0.22, duration: 0.18, ease: 'power3.in' }, T);
    tl.to(p, { x: x0, y: y0, duration: 0.5, ease: 'elastic.out(1, 0.4)' }, T + 0.18);
  });
  /* ── 7 · по полочкам: nudge-кривая (тихо — рывок — долгий хвост) ── */
  P.forEach((p, i) => {
    const T = a + 3.6 + (i % 6) * 0.025;
    tl.to(p, { rotation: 0, scale: mob ? 1 : 0.92, duration: 0.55, ease: 'power3.inOut' }, T);
    tl.to(p, { x: px(SHELF[i][0]), y: py(SHELF[i][1]), duration: 0.6, ease: 'expo.inOut' }, T);
  });
  /* ── 8 · разлёт на шве: из центра наружу, с поворотом и размытием скорости ── */
  P.forEach((p, i) => {
    const dx = SHELF[i][0] - 0.5, dy = SHELF[i][1] - 0.5, T = b - 0.36;
    tl.to(p, { x: px(SHELF[i][0]) + dx * W * 0.9, y: py(SHELF[i][1]) + dy * H * 0.9, rotation: dx * 60, duration: 0.34, ease: 'power4.in' }, T);
    tl.to(p, { filter: 'blur(8px)', opacity: 0, duration: 0.22, ease: 'none' }, T + 0.12);
  });
  tl.set(net, { p: 0, o: 0 }, b);

  /* ── связи: каждая линия — от афиши к следующей по кругу; рисуется по трансформам ── */
  const ring = STAR.map((s, i) => i).sort((i, j) => Math.atan2(STAR[i][1] - 0.5, STAR[i][0] - 0.5) - Math.atan2(STAR[j][1] - 0.5, STAR[j][0] - 0.5));
  const gp = gsap.getProperty;
  REEL.onRender((t) => {
    const u = t - a;
    if (u < 0 || u > b - a) { if (net.__shown) { lines.forEach((l) => { l.style.opacity = 0; }); dots.forEach((d) => { d.style.opacity = 0; }); net.__shown = false; } return; }
    net.__shown = true;
    ring.forEach((i, k) => {
      const j = ring[(k + 1) % ring.length];
      const x1 = gp(P[i], 'x'), y1 = gp(P[i], 'y'), x2 = gp(P[j], 'x'), y2 = gp(P[j], 'y');
      const q = Math.max(0, Math.min(1, net.p * ring.length - k * 0.6));
      const l = lines[k];
      l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x1 + (x2 - x1) * q); l.setAttribute('y2', y1 + (y2 - y1) * q);
      l.style.opacity = net.o;
      // огонёк бежит по линии от афиши к соседке
      const f = ((net.run || 0) * 3 + k * 0.17) % 1;
      dots[k].setAttribute('cx', x1 + (x2 - x1) * f); dots[k].setAttribute('cy', y1 + (y2 - y1) * f); dots[k].style.opacity = net.o * (q >= 1 ? 1 : 0);
    });
    // курсор расталкивает афиши (отдельное свойство translate — не мешает таймлайну)
    const cur = REEL.cursor;
    if (cur && !mob) {
      const mx = (cur.x + 0.5) * W, my = (cur.y + 0.5) * H;
      P.forEach((p) => {
        const dx = gp(p, 'x') - mx, dy = gp(p, 'y') - my, d = Math.hypot(dx, dy) || 1, f = Math.max(0, 1 - d / 260) * 40;
        p.style.translate = (dx / d * f).toFixed(1) + 'px ' + (dy / d * f).toFixed(1) + 'px';
      });
    }
  });

  /* ── наведение: работа выходит вперёд и подсвечивается (интерактив поверх ролика) ── */
  P.forEach((p) => {
    p.addEventListener('pointerenter', () => { p.style.zIndex = 5; gsap.to($('.fl', p), { scale: 1.18, duration: 0.45, ease: 'back.out(2.2)', overwrite: 'auto' }); });
    p.addEventListener('pointerleave', () => { p.style.zIndex = ''; gsap.to($('.fl', p), { scale: 1, duration: 0.4, ease: 'power3.out', overwrite: 'auto' }); });
  });
});
