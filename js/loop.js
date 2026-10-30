// Общий цикл кадров главной. Каждая анимация регистрируется со своей секцией:
//   const h = LOOP.add(section, (t, dt) => { … }, { margin: '150px' });   LOOP.remove(h);
// Кадр идёт, только пока хоть одна зарегистрированная секция пересекает окно и вкладка видима;
// иначе requestAnimationFrame не запрашивается вовсе — телефон отдыхает. dt ограничен 50 мс,
// чтобы после возврата на вкладку анимации не прыгали.
// LOOP.coarse — сенсорный экран без мыши; LOOP.dpr() — плотность холстов (телефон ≤ 1.5, ПК ≤ 2).
// LOOP.gateCss(sel) — CSS-анимации блоков стоят, пока блок вне окна (класс is-off, правило в css/system.css).
// LOOP.box(el) — { top, height } блока на странице из кеша: читать раскладку каждый кадр дорого; LOOP.vw, LOOP.vh — размеры окна из кеша.
(function (g) {
  function createLoop(env) {
    const coarse = env.mm('(hover: none) and (pointer: coarse)').matches;
    const items = new Set();
    const watchers = new Map(); // margin → { io, st: Map<el, { vis, n }> }
    let id = 0, last = 0;

    const want = () => { if (env.doc.hidden) return false; for (const it of items) if (it.st.vis) return true; return false; };
    function frame(t) {
      id = 0;
      if (!want()) return;
      const dt = last ? Math.min(50, Math.max(0, t - last)) : 16;
      last = t;
      for (const it of [...items]) if (it.st.vis && items.has(it)) it.fn(t, dt);
      if (want()) id = env.raf(frame);
    }
    function wake() { if (!id && want()) { last = 0; id = env.raf(frame); } }
    function sleep() { if (id) { env.caf(id); id = 0; } }

    function watcher(margin) {
      let w = watchers.get(margin);
      if (!w) {
        const st = new Map();
        const io = new env.IO((es) => {
          for (const e of es) { const s = st.get(e.target); if (s) s.vis = e.isIntersecting; }
          wake();
        }, { rootMargin: margin });
        w = { io, st };
        watchers.set(margin, w);
      }
      return w;
    }

    env.doc.addEventListener('visibilitychange', () => (env.doc.hidden ? sleep() : wake()));

    return {
      coarse,
      dpr: () => Math.min(env.dpr() || 1, coarse ? 1.5 : 2),
      add(el, fn, opts = {}) {
        const w = watcher(opts.margin || '150px');
        let s = w.st.get(el);
        if (!s) { s = { vis: false, n: 0 }; w.st.set(el, s); w.io.observe(el); }
        s.n++;
        const it = { el, fn, st: s, w };
        items.add(it);
        wake();
        return it;
      },
      remove(it) {
        if (!items.delete(it)) return;
        if (--it.st.n === 0) { it.w.st.delete(it.el); it.w.io.unobserve(it.el); }
      },
      gateCss(sel, margin = '100px') {
        const io = new env.IO((es) => es.forEach((e) => e.target.classList.toggle('is-off', !e.isIntersecting)), { rootMargin: margin });
        env.doc.querySelectorAll(sel).forEach((el) => io.observe(el));
      },
    };
  }

  g.createLoop = createLoop;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  // без IntersectionObserver считаем всё видимым — анимации работают, просто без экономии
  const IO = window.IntersectionObserver || class { constructor(cb) { this.cb = cb; } observe(el) { this.cb([{ target: el, isIntersecting: true }]); } unobserve() {} };
  g.LOOP = createLoop({
    raf: (f) => requestAnimationFrame(f),
    caf: (i) => cancelAnimationFrame(i),
    IO,
    doc: document,
    mm: (q) => matchMedia(q),
    dpr: () => window.devicePixelRatio,
  });

  // кеш положения блоков: сбрасывается, когда меняется высота страницы или ширина окна (адресная строка его не трогает)
  const boxes = new Map();
  g.LOOP.box = (el) => {
    let b = boxes.get(el);
    if (!b) { const r = el.getBoundingClientRect(); b = { top: r.top + scrollY, height: r.height }; boxes.set(el, b); }
    return b;
  };
  // размеры окна из кеша: чтение innerHeight в кадре заставляет браузер пересчитывать раскладку
  let vw = innerWidth;
  g.LOOP.vw = vw; g.LOOP.vh = innerHeight;
  addEventListener('resize', () => { g.LOOP.vh = innerHeight; if (innerWidth !== vw) { g.LOOP.vw = vw = innerWidth; boxes.clear(); } });
  if (window.ResizeObserver) new ResizeObserver(() => boxes.clear()).observe(document.documentElement);

  g.LOOP.gateCss('#hero, #clients, #services, #works, #process, #about, #contact');

  // телефон: блоки вне экрана браузер не считает вовсе; высота запоминается, чтобы полоса прокрутки не прыгала.
  // На ПК не нужно и нельзя: содержание ломает схлопывание отступов, высоты секций меняются.
  if (g.LOOP.coarse) addEventListener('load', () => document.querySelectorAll('#works, #process, #about, #faq, #contact, footer.foot').forEach((el) => {
    el.style.containIntrinsicSize = `auto ${Math.round(el.offsetHeight)}px`;
    el.style.contentVisibility = 'auto';
  }));
})(typeof globalThis !== 'undefined' ? globalThis : window);
