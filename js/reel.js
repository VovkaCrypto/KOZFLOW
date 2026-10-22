/* reel.js — ядро hero v3: один GSAP-таймлайн по сетке 120 BPM (доля 0.5 с), монтаж 10-го варианта.
 * Центр (знак → слово → подпись → кнопка) ведёт ядро; содержимое вокруг строят сцены: REEL.scene(id, build(ctx)).
 * Всё, что рисуется кодом (canvas, WebGL), — функция времени ролика: REEL.onRender(fn(t)) вызывается на каждом кадре и на перемотке.
 */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const hero = $('#hero');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

const BEAT = 0.5;
const SC = [
  { id: 'intro', a: 0, b: 1.5 },
  { id: 'auto', a: 1.5, b: 8, word: 'автоматизации', wc: 'var(--gold)', acc: '#C4985A' },
  { id: 'sites', a: 8, b: 14, word: 'сайты', wc: 'var(--forest)', acc: '#3A4A3D' },
  { id: 'motion', a: 14, b: 22, word: 'моушен', wc: 'var(--cream)', acc: '#A8C5D9' },
  { id: 'design', a: 22, b: 27, word: 'дизайн', wc: 'var(--terracotta)', acc: '#C26B4A' },
  { id: 'final', a: 27, b: 30 }
];
const WRAP = 30, LOOP_FROM = 1.5;
const CHAP = [['auto', 'Автоматизации', 1.5, 8], ['sites', 'Сайты', 8, 14], ['motion', 'Моушен', 14, 22], ['design', 'Дизайн', 22, WRAP]];
const STILL = { auto: 7.3, sites: 11.7, motion: 18.1, design: 25.1 };   // собранные кадры (reduced-motion, главы)
const NIGHT = [14, 22];
const LIGHT = { '--fg': '#2D2419', '--fgi': '#F5EFDF', '--fg-soft': '#4A3E2E', '--fg-mute': '#7A6B56', '--fg-line': '#D9CFB9', '--veil': '250,247,242', '--va': 0.94, '--vb': 0.84 };
const DARK = { '--fg': '#F5EFDF', '--fgi': '#17120D', '--fg-soft': '#D9CDB4', '--fg-mute': '#9C8E76', '--fg-line': '#4A3E2E', '--veil': '23,18,13', '--va': 0.5, '--vb': 0.28 };

const builders = {}, renders = [];
let tl = null, D = 170, DT = 110;
const REEL = window.REEL = {
  BEAT, SC, STILL, WRAP, LOOP_FROM, reduce,
  scene(id, fn) { builders[id] = fn; },
  onRender(fn) { renders.push(fn); },
  get tl() { return tl; },
  get time() { return tl ? tl.time() : 0; },
  works: [], ready: false
};

/* ── помощники монтажа (из 10-го: течение влево, cut-the-curve ±12 % кадра) ── */
const gaps = (n, g0 = 0.05, k = 0.84) => { const a = []; let t = 0; for (let i = 0; i < n; i++) { a.push(t); t += g0 * Math.pow(k, i); } return a; };
function cutOut(els, T, o = {}) {
  const dur = o.dur ?? 0.34, fade = o.fade ?? 0.22, st = o.st ?? 0.025, dx = o.dx ?? -D, n = els.length;
  els.forEach((el, i) => {
    const end = T - 0.02 - (n - 1 - i) * st;
    tl.to(el, { x: dx, duration: dur, ease: 'power4.in' }, end - dur);
    tl.to(el, { opacity: 0, duration: fade, ease: 'none' }, end - fade);
  });
}
function cutIn(els, T, o = {}) {
  const dur = o.dur ?? 0.36, g = gaps(els.length, o.g0 ?? 0.05), dx = o.dx ?? D;
  els.forEach((el, i) => {
    const s = T + g[i];
    tl.fromTo(el, { x: dx }, { x: 0, duration: dur, ease: 'power4.out', immediateRender: false }, s);
    tl.fromTo(el, { opacity: 0.35 }, { opacity: 1, duration: 0.14, ease: 'none', immediateRender: false }, s);
  });
}

/* ── центр ── */
const wordsEl = $('.words'), markEl = $('.mark'), copy = $('.copy');
const WORDS = SC.filter((s) => s.word);
wordsEl.innerHTML = WORDS.map((s) => `<span class="word" data-w="${s.id}" style="--wc:${s.wc}">${[...s.word].map((c) => `<b>${c}</b>`).join('')}</span>`).join('');
const wordEl = Object.fromEntries(WORDS.map((s) => [s.id, $(`.word[data-w="${s.id}"]`)]));
const letters = (id) => $$('b', wordEl[id]);
let mk = null;   // части знака: k, линии, точки

function wordIn(id, T) {
  const L = letters(id), g = gaps(L.length, 0.045);
  tl.set(wordEl[id], { visibility: 'visible' }, T);
  L.forEach((l, i) => {
    tl.fromTo(l, { x: DT, y: 0, rotation: 8, '--f': '0%' }, { x: 0, rotation: 0, duration: 0.42, ease: 'back.out(1.6)', immediateRender: false }, T + g[i]);
    tl.fromTo(l, { opacity: 0.35 }, { opacity: 1, duration: 0.1, ease: 'none', immediateRender: false }, T + g[i]);
    // заливка поднимается волной по буквам — «буквы красятся»
    tl.fromTo(l, { '--f': '0%' }, { '--f': '100%', duration: 0.5, ease: 'power3.inOut', immediateRender: false }, T + 0.45 + i * 0.06);
  });
}
function wordOut(id, T) {
  const L = letters(id), n = L.length, dur = 0.3, st = 0.02;
  L.forEach((l, i) => {
    const s = T - 0.02 - dur - (n - 1) * st + i * st;
    tl.to(l, { x: -DT, rotation: -6, duration: dur, ease: 'power4.in' }, s);
    tl.to(l, { opacity: 0, duration: 0.2, ease: 'none' }, s + dur - 0.2);
  });
  tl.set(wordEl[id], { visibility: 'hidden' }, T);
}

/* ── сборка ── */
function fitWords(Wd, mob) {
  const ws = $$('.word');
  ws.forEach((w) => { w.style.fontSize = '100px'; });
  const r = ws.map((w) => w.getBoundingClientRect().width / 100);
  const cap = mob ? 112 : Math.min(Wd * 0.15, 290);   // кегль как в 10-м: слово — главное в кадре; длинное — на всю ширину
  const fs = r.map((x) => Math.min(cap, (mob ? 0.92 : 0.92) * Wd / x));
  ws.forEach((w, i) => { w.style.fontSize = fs[i] + 'px'; });
  hero.style.setProperty('--w', Math.max(...fs) + 'px');
}

function build() {
  if (tl) tl.kill();
  renders.length = 0;   // сцены регистрируют рисование заново при каждой сборке
  if (REEL.fx) REEL.fx.resize();
  const Wd = hero.clientWidth, Hh = hero.clientHeight, mob = Wd < 761;
  D = Math.round(Wd * 0.12);
  DT = Math.round(Math.min(150, Wd * 0.09));
  fitWords(Wd, mob);
  tl = gsap.timeline({ paused: true });
  REEL.D = D;

  // исходные состояния
  tl.set('.scene', { visibility: 'hidden' }, 0);
  tl.set('.it', { opacity: 0 }, 0);
  tl.set('.word', { visibility: 'hidden' }, 0);
  tl.set('.word b', { opacity: 0, x: 0, rotation: 0, '--f': '0%' }, 0);
  tl.set(copy, { y: 0 }, 0);
  gsap.set(copy, { yPercent: -52 });
  tl.set(['.sub', '.cta'], { opacity: 0, y: 14 }, 0);
  tl.set('.night', { clipPath: 'circle(0% at 50% 46%)' }, 0);
  tl.set(document.body, LIGHT, 0);
  tl.set(hero, { '--acc': SC[1].acc }, 0);

  /* ── 0 · знак рисует себя: K проявляется снизу, линии тянутся, точки выпрыгивают со сжатием ── */
  if (mk) {
    tl.set(mk.lines, { strokeDashoffset: (i, el) => el.__len }, 0);
    tl.set(mk.dots, { scale: 0, transformOrigin: '50% 50%' }, 0);
    tl.fromTo(mk.k, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.55, ease: 'power4.out' }, 0.1);
    tl.to(mk.lines, { strokeDashoffset: 0, duration: 0.5, ease: 'power3.inOut', stagger: 0.06 }, 0.35);
    mk.dots.forEach((d, i) => {
      const s = 0.75 + i * 0.09;
      tl.fromTo(d, { scale: 0 }, { scale: 1.35, duration: 0.14, ease: 'power2.out', immediateRender: false }, s);
      tl.to(d, { scaleX: 0.8, scaleY: 1.2, duration: 0.08, ease: 'power1.inOut' }, s + 0.14);
      tl.to(d, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.45)' }, s + 0.22);
    });
  }
  tl.to('.sub', { opacity: 1, y: 0, duration: 0.45, ease: 'power4.out' }, 0.95);
  tl.to('.cta', { opacity: 1, y: 0, duration: 0.45, ease: 'power4.out' }, 1.02);

  /* ── сцены ── */
  SC.forEach((s, i) => {
    const el = $(`.scene[data-s="${s.id}"]`);
    tl.set(el, { visibility: 'visible' }, s.a);
    tl.set(el, { visibility: 'hidden' }, s.b);
    if (s.word) {
      wordIn(s.id, s.a);
      const next = SC[i + 1];
      if (next) wordOut(s.id, s.b);   // последнее слово уступает строку вордмарку финала
      tl.set(hero, { '--acc': s.acc }, s.a);
    }
    if (builders[s.id]) {
      try {
        builders[s.id]({ tl, id: s.id, a: s.a, b: s.b, el, cam: $('.cam', el), hero, W: Wd, H: Hh, mob, D, BEAT, cutIn, cutOut, gaps, $, $$, works: REEL.works, copyRect: () => rel(copy) });
      } catch (e) { console.error('[REEL] scene ' + s.id, e); }
    }
  });

  /* ── ночь: тёмный кадр раскрывается кругом от слова и схлопывается обратно ── */
  tl.fromTo('.night', { clipPath: 'circle(0% at 50% 46%)' }, { clipPath: 'circle(150% at 50% 46%)', duration: 0.6, ease: 'power4.out', immediateRender: false }, NIGHT[0] - 0.08);
  tl.to(document.body, { ...DARK, duration: 0.25, ease: 'none' }, NIGHT[0] - 0.05);
  tl.to('.night', { clipPath: 'circle(0% at 50% 46%)', duration: 0.5, ease: 'power4.in' }, NIGHT[1] - 0.5);
  tl.to(document.body, { ...LIGHT, duration: 0.25, ease: 'none' }, NIGHT[1] - 0.12);

  tl.set({}, {}, WRAP);
  tl.eventCallback('onUpdate', render);
  tl.eventCallback('onComplete', () => { tl.seek(LOOP_FROM, false); if (shouldPlay()) tl.play(); render(); });
}
const rel = (el) => { const r = el.getBoundingClientRect(), h = hero.getBoundingClientRect(); return { left: r.left - h.left, top: r.top - h.top, right: r.right - h.left, bottom: r.bottom - h.top, width: r.width, height: r.height }; };

/* ── полоса, таймкод, пульс знака, ночь ── */
let lastDark = null;
function render() {
  if (!tl) return;
  const t = tl.time();
  const dark = t >= NIGHT[0] && t < NIGHT[1];
  if (dark !== lastDark) { document.body.classList.toggle('dark', dark); lastDark = dark; }
  // точки знака дышат на долю: короткий толчок и затухание
  if (mk && t > 1.6) {
    const u = (t % BEAT) / BEAT, k = 1 + 0.22 * Math.exp(-u * 7);
    mk.dots.forEach((d, i) => { if (Math.floor(t / BEAT) % 4 === i) d.style.transform = `scale(${k.toFixed(3)})`; else d.style.transform = ''; });
  }
  if (REEL.fx) REEL.fx.frame();
  for (const f of renders) { try { f(t); } catch (e) { console.error(e); } }
  if (mk) accents(t);
}

/* ── акценты на сменах глав: знак монетой, перерисовкой линий и пульсом; у слов «Сайты» и «Дизайн» свои приёмы.
 * Всё — функция времени и пишет в отдельные CSS-свойства (scale/translate/--f/--wc), не в transform: тот держит GSAP.
 * Окна не задевают STILL-кадры глав (11.7, 25.1). */
const ACC = { coin: [7.85, 8.45], redraw: [21.9, 22.55], pulse: [27.02, 28.1], drain: [9.9, 10.35], fill: [10.5, 11.05], paint: [23.4, 24.95] };
const PAINT = ['var(--gold)', 'var(--forest)', 'var(--sky)', '#C9B6E4', '#E8A9B8', 'var(--gold)'];
const inA = (t, w) => t >= w[0] && t < w[1];
const clp = (x) => Math.max(0, Math.min(1, x));
const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
let accOn = {};
function accents(t) {
  const on = (k) => { if (inA(t, ACC[k])) { accOn[k] = true; return (t - ACC[k][0]) / (ACC[k][1] - ACC[k][0]); } return -1; };
  const off = (k, fn) => { if (accOn[k] && !inA(t, ACC[k])) { accOn[k] = false; fn(); } };
  // монета: знак проворачивается по вертикальной оси, обратная сторона — золото
  let p = on('coin');
  if (p >= 0) { const c = Math.cos(2 * Math.PI * eio(p)); markEl.style.scale = `${(Math.sign(c) * Math.max(0.04, Math.abs(c))).toFixed(3)} ${(1 + 0.08 * Math.sin(Math.PI * p)).toFixed(3)}`; markEl.style.color = c < 0 ? 'var(--gold)' : ''; }
  off('coin', () => { markEl.style.scale = ''; markEl.style.color = ''; });
  // перерисовка: линии знака втягиваются и рисуются заново, точки выпрыгивают следом
  p = on('redraw');
  if (p >= 0) {
    mk.lines.forEach((l, i) => { const q = clp((p - i * 0.05) / 0.8); l.style.strokeDashoffset = (l.__len * (q < 0.4 ? eio(q / 0.4) : 1 - eio((q - 0.4) / 0.6))).toFixed(1); });
    mk.dots.forEach((d, i) => { const q = clp((p - 0.55 - i * 0.06) / 0.3); d.style.scale = q <= 0 ? '0' : (1 + 0.5 * Math.sin(Math.PI * q) * (1 - q)).toFixed(3); });
  }
  off('redraw', () => { mk.lines.forEach((l) => { l.style.strokeDashoffset = '0'; }); mk.dots.forEach((d) => { d.style.scale = ''; }); });
  // пульс: два удара сердца и расходящиеся кольца на финале
  p = on('pulse');
  if (p >= 0) {
    const x = t - ACC.pulse[0], beat = (y) => (y > 0 ? Math.exp(-y * 9) * Math.sin(Math.min(Math.PI, y * 18)) : 0);
    markEl.style.scale = (1 + 0.28 * (beat(x) + 0.8 * beat(x - 0.25))).toFixed(3);
    if (REEL.fx) { const r = REEL.fx.place(markEl), cx = r.x + r.w / 2, cy = r.y + r.h / 2; [0, 0.25, 0.5].forEach((d0, j) => { const y = x - d0; if (y > 0 && y < 0.8) REEL.fx.ring(cx, cy, r.h * (0.35 + y * 1.8), (1 - y / 0.8) * 0.7, j % 2 ? '#C4985A' : '#C26B4A', 2 - j * 0.4); }); }
  }
  off('pulse', () => { markEl.style.scale = ''; });
  // «Сайты»: заливка стекает в контур и поднимается обратно, по её краю идёт сканлиния
  const sl = letters('sites');
  p = on('drain');
  if (p >= 0) sl.forEach((l, i) => l.style.setProperty('--f', (100 * (1 - eio(clp((p - i * 0.08) / 0.68)))).toFixed(1) + '%'));
  const restoreF = () => { if (t >= ACC.drain[0] && t < 14) sl.forEach((l) => l.style.setProperty('--f', '100%')); };
  off('drain', restoreF);
  p = on('fill');
  if (p >= 0) {
    const f = eio(p);
    sl.forEach((l) => l.style.setProperty('--f', (100 * f).toFixed(1) + '%'));
    if (REEL.fx && f > 0.02 && f < 0.98) {
      const r = REEL.fx.place(wordEl.sites), y = r.y + r.h * (1 - f), g = REEL.fx.ctx;
      const gr = g.createLinearGradient(r.x - 30, 0, r.x + r.w + 30, 0);
      gr.addColorStop(0, 'rgba(196,152,90,0)'); gr.addColorStop(0.5, 'rgba(196,152,90,1)'); gr.addColorStop(1, 'rgba(196,152,90,0)');
      g.fillStyle = gr; g.fillRect(r.x - 30, y - 1.5, r.w + 60, 3);
      g.globalAlpha = 0.18; g.fillRect(r.x - 30, y - 9, r.w + 60, 18); g.globalAlpha = 1;
    }
  }
  off('fill', restoreF);
  if (inA(t, [ACC.drain[1], ACC.fill[0]])) sl.forEach((l) => l.style.setProperty('--f', '0%'));
  // «Дизайн»: буквы по очереди перекрашиваются палитрой и подпрыгивают, потом возвращают свой цвет
  const dl = letters('design');
  p = on('paint');
  if (p >= 0) {
    const x = t - ACC.paint[0];
    dl.forEach((l, i) => {
      const a = x - i * 0.09, k = a > 0 && a < 1.0;
      if (k) l.style.setProperty('--wc', PAINT[(i + Math.floor(a / 0.25)) % PAINT.length]); else l.style.removeProperty('--wc');
      const j = a > 0 && a < 0.35 ? Math.sin((Math.PI * a) / 0.35) : 0;
      l.style.translate = `0 ${(-0.09 * j).toFixed(3)}em`;
    });
  }
  off('paint', () => dl.forEach((l) => { l.style.removeProperty('--wc'); l.style.translate = ''; }));
}

/* ── воспроизведение ── */
let offscreen = false, userPause = false;
function shouldPlay() { return !reduce && !userPause && !offscreen && !document.hidden; }
function apply() { if (!tl) return; if (shouldPlay()) tl.play(); else tl.pause(); }
function goChapter(i) { tl.seek(reduce ? STILL[CHAP[i][0]] : CHAP[i][2] + 0.02, false); render(); apply(); }
REEL.goChapter = goChapter;
REEL.seek = (t) => { tl.seek(t, false); render(); };
REEL.pause = () => { userPause = true; apply(); };
REEL.play = () => { userPause = false; apply(); };

/* ── камера: на компьютере её ведёт курсор, на телефоне — наклон; сцены и частицы читают REEL.cursor ── */
if (!reduce) {
  const cam = { x: 0, y: 0 };
  const qx = gsap.quickTo(cam, 'x', { duration: 0.9, ease: 'expo.out' }), qy = gsap.quickTo(cam, 'y', { duration: 0.9, ease: 'expo.out' });
  if (fine) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      qx((e.clientX - r.left) / r.width - 0.5); qy((e.clientY - r.top) / r.height - 0.5);
    });
    hero.addEventListener('pointerleave', () => { qx(0); qy(0); });
  } else {
    let b0 = null;
    const onTilt = (e) => { if (e.gamma == null) return; if (b0 == null) b0 = e.beta; qx(Math.max(-0.5, Math.min(0.5, e.gamma / 50))); qy(Math.max(-0.5, Math.min(0.5, (e.beta - b0) / 50))); };
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {   // iOS: разрешение только из жеста
      hero.addEventListener('pointerup', function ask() { hero.removeEventListener('pointerup', ask); DOE.requestPermission().then((r) => { if (r === 'granted') addEventListener('deviceorientation', onTilt); }, () => {}); });
    } else if (DOE) addEventListener('deviceorientation', onTilt);
  }
  REEL.cursor = cam;
  gsap.ticker.add(() => { $$('.scene .cam').forEach((c) => { c.style.translate = `${(-cam.x * 26).toFixed(2)}px ${(-cam.y * 16).toFixed(2)}px`; }); });
}

/* ── телефон: ролик перематывается пальцем, как плёнка (с инерцией); тап — пауза/пуск ── */
const SPAN = WRAP - LOOP_FROM;
function seekWrap(t) {
  if (t < LOOP_FROM) t = WRAP - ((LOOP_FROM - t) % SPAN);
  if (t >= WRAP) t = LOOP_FROM + ((t - WRAP) % SPAN);
  tl.seek(t, false); render();
}
if (!fine && !reduce) {
  const S_PER_PX = 0.022;
  let drag = null, inertia = null;
  const end = () => { hero.classList.remove('scrub'); apply(); };
  hero.addEventListener('pointerdown', (e) => {
    if (!tl || e.target.closest('a,button')) return;
    if (inertia) { inertia.kill(); inertia = null; }
    drag = { x: e.clientX, y: e.clientY, t0: tl.time(), last: e.clientX, lt: performance.now(), v: 0, moved: false };
  });
  hero.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) < 8 && Math.abs(e.clientY - drag.y) < 8) return;
      if (Math.abs(e.clientY - drag.y) > Math.abs(dx)) { drag = null; return; }   // вертикальный жест — это прокрутка страницы
      drag.moved = true; tl.pause(); hero.classList.add('scrub');
    }
    const now = performance.now();
    drag.v = (e.clientX - drag.last) / Math.max(1, now - drag.lt); drag.last = e.clientX; drag.lt = now;
    seekWrap(drag.t0 - dx * S_PER_PX);
  });
  hero.addEventListener('pointerup', () => {
    if (!drag) return;
    const d = drag; drag = null;
    if (!d.moved) { userPause = !userPause; apply(); return; }
    const st = { v: -d.v * 1000 * S_PER_PX };   // секунд ролика в секунду
    inertia = gsap.to(st, { v: 0, duration: Math.min(1.4, 0.35 + Math.abs(st.v) * 0.04), ease: 'power2.out',
      onUpdate: () => seekWrap(tl.time() + st.v * gsap.ticker.deltaRatio() / 60), onComplete: () => { inertia = null; end(); } });
  });
  hero.addEventListener('pointercancel', () => { if (drag && drag.moved) end(); drag = null; });
}
REEL.seekWrap = (t) => seekWrap(t);
document.addEventListener('visibilitychange', apply);
new IntersectionObserver(([e]) => { offscreen = !e.isIntersecting; apply(); }, { threshold: 0.05 }).observe(hero);

/* ── старт ── */
async function loadMark() {
  try {
    const svg = await (await fetch('assets/mark.svg')).text();
    markEl.innerHTML = svg.replace(/#2D2419/g, 'currentColor');
    const s = $('svg', markEl);
    mk = REEL.mk = { el: markEl, k: $('#k', s), lines: $$('polyline', s), dots: $$('circle', s) };
    mk.lines.forEach((l) => { l.__len = l.getTotalLength(); l.style.strokeDasharray = l.__len; });
    mk.dots.forEach((d) => { d.style.transformBox = 'fill-box'; d.style.transformOrigin = '50% 50%'; });
  } catch (e) { console.error('[REEL] mark', e); }
}
async function loadWorks() {
  try { const r = await fetch('assets/works/manifest.json'); REEL.works = r.ok ? await r.json() : []; } catch { REEL.works = []; }
}
let rz;
function start(seekTo) {
  const keep = tl ? tl.time() : 0;
  build();
  if (reduce) { tl.seek(STILL.auto, false); tl.pause(); render(); }
  else { tl.seek(seekTo ?? keep, false); render(); apply(); }
}
addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => start(), 200); });
const fonts = ['300 16px STRome', '500 16px STRome', '900 16px STRome'].map((f) => document.fonts.load(f));
Promise.all([loadMark(), loadWorks(), Promise.race([Promise.all(fonts), new Promise((r) => setTimeout(r, 1500))])]).then(() => {
  const t0 = parseFloat(new URLSearchParams(location.search).get('t'));
  if (!isNaN(t0)) { start(t0); tl.pause(); userPause = true; render(); } else start(0);
  REEL.ready = true; window.__ready = true;
});
window.__goto = (t) => { tl.seek(t, false); tl.pause(); userPause = true; render(); };
})();
