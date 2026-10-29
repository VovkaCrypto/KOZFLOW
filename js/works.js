// Секция «Работы» (#works) — из эскиза sections-v3/raboty/sketch.html (port.mjs). Данные схем — js/works-pipes.js.
(() => {
const A = '';
const CAT = { design: 'Дизайн', sites: 'Сайты', motion: 'Моушен', auto: 'Автоматизации' };
const PAGE = { design: '/dizayn', sites: '/sayty', motion: '/moushen', auto: '/avtomatizacii' };
const FROM = { design: 'от 1 200 ₽', sites: 'от 25 000 ₽', motion: 'от 2 000 ₽', auto: 'от 10 000 ₽' };
const D = (id, t, k, w = 896, h = 1200) => ({ cat: 'design', img: `assets/works/${id}.webp`, a: w / h, t, k });
const S = (slug, img, t, k, m2, url) => ({ cat: 'sites', img, a: 16 / 10, t, k, url,
  desk: [`assets/sites/${slug}-desk-full.webp`], mob: [`assets/sites/${slug}-mob-full.webp`, ...(m2 ? [`assets/sites/${slug}-mob-full-2.webp`] : [])] });
const W = [
  D('45', 'Кинза', 'афиша'), D('02', 'Кегельбар', 'афиша'), D('09', 'Волжанка', 'логотип', 1200, 1200), D('04', 'Щукин и дети', 'афиша'),
  D('12', 'Завод', 'афиша'), D('55', 'Кинза', 'меню', 900, 1200), D('08', 'Завод × Кегельбар', 'афиша'), D('03', 'Завод', 'баннер для соцсетей', 1200, 509),
  D('38', 'Кинза', 'афиша'), D('24', 'Кегельбар', 'афиша'), D('37', 'Щукин и дети', 'постер', 805, 1200), D('42', 'Кинза', 'пост', 1200, 670),
  D('31', 'Завод', 'афиша'), D('50', 'Кегельбар', 'айдентика', 1200, 1200), D('10', 'Кинза', 'меню'), D('39', 'Кегельбар', 'афиша'),
  D('17', 'Кинза', 'афиша'), D('25', 'Завод', 'коктейльная карта'), D('53', 'Кинза', 'афиша', 849, 1200), D('21', 'Проект П', 'логотип', 1200, 1200),
  D('34', 'Кинза', 'доставка', 1032, 1200), D('41', 'Щукин и дети', 'упаковка', 805, 1200),
  S('vostok', 'assets/services/vostok-desk-hero.webp', 'Восток 24', 'сайт ресторана · 40 000 ₽', 1, 'https://восток24.рф'),
  S('tverchefs', 'assets/sites/tverchefs-desk-hero.webp', 'Ассоциация кулинаров', 'лендинг · 30 000 ₽', 1, 'https://tverchefs.ru'),
  S('miravi', 'assets/sites/miravi-desk-hero.webp', 'Miravi', 'сайт сервиса · 30 000 ₽', 0, 'https://miravi.art'),
  S('deepdiver', 'assets/sites/deepdiver-desk-hero.webp', 'DeepDiver', 'мой продукт', 0, 'https://deepdiver.tech'),
  { cat: 'motion', vid: 'assets/moushen/reel-afisha', a: 9 / 16, t: 'Кегельбар', k: 'афиша оживает' },
  { cat: 'motion', vid: 'assets/moushen/reel-zoom', a: 16 / 9, t: 'Кегельбар', k: 'промо: от города до страйка' },
  { cat: 'motion', vid: 'assets/moushen/reel-dish', a: 9 / 16, t: 'Восток 24', k: 'блюдо в невесомости' },
  { cat: 'motion', vid: 'assets/moushen/dish', a: 16 / 9, t: 'Восток 24', k: 'видеоменю, 85 блюд' },
  { cat: 'motion', vid: 'assets/moushen/kinza-720', a: 9 / 16, t: 'Кинза', k: 'тизер «Винный вечер»' },
  { cat: 'motion', vid: 'assets/moushen/dd-promo-16x9', a: 16 / 9, t: 'DeepDiver', k: 'промо продукта' },
  ...PIPES.map((p) => ({ cat: 'auto', a: 1.32, ...p })),
];

// значки этапов схемы (24×24, обводка)
const IC = {
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  vk: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M7 9c1 4 3 6 5 6v-3c1 0 2 1 3 3h2c-1-2-2-3-3-3.5 1-.5 2-2 2.5-3.5h-2c-.5 1.5-1.5 2.5-2.5 2.5V9h-2v5c-1-.5-2-2-2.5-5z"/>',
  tg: '<path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/><path d="m9 13 8-6"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  pdf: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  ai: '<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"/><path d="M19 15c.2 1.7.8 2.3 2.5 2.5-1.7.2-2.3.8-2.5 2.5-.2-1.7-.8-2.3-2.5-2.5 1.7-.2 2.3-.8 2.5-2.5z"/>',
  flow: '<circle cx="5" cy="6" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="12" r="2.2"/><path d="M7.2 6h3.3c2 0 2 6 4 6h2.3M7.2 18h3.3c2 0 2-6 4-6"/>',
  db: '<ellipse cx="12" cy="5.5" rx="7" ry="2.5"/><path d="M5 5.5v13c0 1.4 3 2.5 7 2.5s7-1.1 7-2.5v-13M5 12c0 1.4 3 2.5 7 2.5s7-1.1 7-2.5"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  sheet: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M3.5 9h17M3.5 14h17M10 4v16"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  yt: '<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
  server: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M8 7.5h.01M8 16.5h.01"/>',
  text: '<path d="M5 6h14M5 10h14M5 14h9M5 18h6"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
  wave: '<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2"/>',
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  doc: '<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/>',
  phoneOut: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
};
const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k] || IC.flow}</svg>`;
const ARR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mob = () => matchMedia('(max-width:640px)').matches;
const river = document.querySelector('.river');
const chips = document.querySelector('.chips');
let filter = 'all';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const media = (w, big) => w.vid
  ? `<video class="${big ? 'm' : ''}" loop playsinline ${big ? 'autoplay controls' : 'muted preload="none"'} poster="${A}${w.vid}.webp"><source src="${A}${w.vid}.mp4" type="video/mp4"></video>`
  : w.img ? `<img class="${big ? 'm' : ''}" src="${A}${w.img}" alt="${esc(w.t + ' — ' + w.k)}" loading="lazy" draggable="false">` : '';

// своя анимация карточки — по смыслу работы
const ANIM = {
  wave: () => `<div class="an an-wave">${Array.from({ length: 28 }, (_, i) => `<i style="--d:${(-(i * 0.37) % 1.2).toFixed(2)}s"></i>`).join('')}</div>`,
  slots: () => `<div class="an an-slots">${['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'].map((t, i) =>
    `<i class="${[1, 2, 6].includes(i) ? 'busy' : i === 4 ? 'on' : ''}" style="--d:${i * 0.12}s">${t}</i>`).join('')}</div>`,
  pdf: () => `<div class="an an-pdf"><span class="doc"></span><span class="arr"></span><span class="cal">${Array.from({ length: 14 }, (_, i) => `<i class="${i === 10 ? 'on' : ''}"></i>`).join('')}</span><span class="sum">дата оплаты</span></div>`,
  chat: () => `<div class="an an-chat"><b style="--d:0s">🎙 0:12</b><b style="--d:1.1s">идея для поста</b><b style="--d:2.2s">чек 1 840 ₽</b><span class="box"></span></div>`,
  abc: () => `<div class="an an-abc">${[[40, 95, 'a'], [70, 88, 'a'], [30, 76, 'a'], [85, 60, 'b'], [55, 52, 'b'], [65, 44, 'b'], [90, 30, 'c'], [45, 22, 'c'], [75, 14, 'c']].map(([h1, h2, c]) =>
    `<i class="${c}" style="--h1:${h1}%;--h2:${h2}%"></i>`).join('')}<span class="lg">A · B · <s>C — убрать</s></span></div>`,
  yt: () => `<div class="an an-yt"><span class="pl"></span><span class="tx">${[[0.95, 0], [0.8, 0.5], [0.55, 1, 'k']].map(([w, d, k]) => `<i class="${k || ''}" style="--w:${w};--d:${d}s"></i>`).join('')}</span></div>`,
};
const mini = (p) => `<div class="mini">${p.mini.map((k, i) => (i ? '<em></em>' : '') + `<span class="${k === 'ai' ? 'ai' : ''}">${svg(k)}</span>`).join('')}<i></i></div>`;
const card = (w, i) => {
  if (w.cat === 'auto') return `<button class="card auto" style="--a:${w.a}" data-i="${i}" aria-label="${esc(w.t)}: схема работы">
    <span class="who">${esc(w.who)}</span>${w.call ? '<span class="live">на линии<span> · можно позвонить</span></span>' : ''}<h3>${esc(w.t)}</h3><p>${esc(w.k)}</p>${ANIM[w.anim]?.() || ''}
    <span class="ft">${mini(w)}<span class="more">Схема ${ARR}</span></span></button>`;
  const play = w.cat === 'sites' ? `<span class="play">${ARR}</span>` : '';
  return `<button class="card" style="--a:${w.a}" data-i="${i}" aria-label="${esc(w.t + ', ' + w.k)}">${w.cat === 'sites' ? `<span class="shot"><img src="${A}${w.desk[0]}" alt="${esc(w.t + ' — ' + w.k)}" loading="lazy" draggable="false" style="--dur:${18 + (i % 3) * 4}s"></span>` : media(w)}<span class="tag" data-c="${w.cat}">${CAT[w.cat]}</span>${play}<span class="cap"><b>${esc(w.t)}</b>${esc(w.k)}</span></button>`;
};

// ряды: высота на компьютере / телефоне, направление, скорость (px/с)
const ROWS = [{ h: 270, hm: 170, dir: -1, v: 58 }, { h: 320, hm: 200, dir: 1, v: 44 }, { h: 270, hm: 170, dir: -1, v: 70 }];
let rows = [];

function build() {
  const list = W.map((w, i) => ({ w, i })).filter(({ w }) => filter === 'all' || w.cat === filter);
  // перемешиваем направления, чтобы в ряду не шли три афиши подряд
  const order = filter === 'all' ? interleave(list) : list;
  // мало работ в фильтре — один ряд, иначе одни и те же карточки встают рядом в кадре
  const n = filter === 'all' ? 3 : Math.min(3, Math.max(1, Math.ceil(order.length / 7)));
  river.innerHTML = '';
  rows = [];
  for (let r = 0; r < n; r++) {
    // одиночный ряд — средний, самый высокий
    const R = ROWS[n === 1 ? 1 : r];
    const per = Math.ceil(order.length / n);
    const items = order.slice(r * per, (r + 1) * per); // подряд идущий кусок перемешанного списка: в каждом ряду все направления
    const el = document.createElement('div');
    el.className = 'row';
    el.style.cssText = `--h:${R.h}px;--hm:${R.hm}px`;
    // двойной трек — бесшовная петля; при малом числе работ повторяем ещё
    const html = items.map(({ w, i }) => card(w, i)).join('');
    const reps = items.length < 5 ? 4 : 2;
    el.innerHTML = `<div class="track">${html.repeat(reps)}</div>`;
    river.appendChild(el);
    rows.push({ el, track: el.firstChild, x: 0, dir: R.dir, v: R.v, reps, slow: 1, fling: 0, drag: null });
  }
  rows.forEach(dragRow);
  watchVideos();
}

function interleave(list) {
  const by = {};
  list.forEach((x) => (by[x.w.cat] = by[x.w.cat] || []).push(x));
  const out = []; const keys = Object.keys(by);
  // дизайн много — разбавляем остальными равномерно
  const total = list.length;
  const ptr = Object.fromEntries(keys.map((k) => [k, 0]));
  for (let s = 0; out.length < total; s++) {
    for (const k of keys) {
      const step = total / by[k].length;
      if (ptr[k] < by[k].length && s >= Math.floor(ptr[k] * step)) out.push(by[k][ptr[k]++]);
    }
  }
  return out;
}

function renderChips() {
  chips.innerHTML = [['all', 'Все'], ...Object.entries(CAT)].map(([c, n]) =>
    `<button class="chip" aria-pressed="${c === filter}" data-c="${c}">${n}</button>`).join('');
}
chips.addEventListener('click', (e) => {
  const b = e.target.closest('.chip'); if (!b) return;
  filter = b.dataset.c; renderChips(); build();
});
// прайс-листы: картинка направления + цена «от» + три позиции с настоящими ценами со страниц
const PRICE = {
  design: { vis: `<div class="vis v-design">${['45', '02', '12'].map((id) => `<img src="${A}assets/works/${id}.webp" alt="" loading="lazy">`).join('')}</div>`,
    items: [['Пост', '1 200 ₽'], ['Афиша', '3 000 ₽'], ['Меню', 'от 6 000 ₽']] },
  sites: { vis: `<div class="vis v-sites"><div class="br"><i></i><img src="${A}assets/sites/vostok-desk-full.webp" alt="" loading="lazy"></div></div>`,
    items: [['Лендинг', '25 000 ₽'], ['Сайт до 7 разделов', '40 000 ₽'], ['Поддержка', '5 000 ₽/мес']] },
  motion: { vis: `<div class="vis v-motion"><video muted loop playsinline autoplay preload="metadata" poster="${A}assets/moushen/reel-zoom.webp"><source src="${A}assets/moushen/reel-zoom.mp4" type="video/mp4"></video></div>`,
    items: [['Оживлённая афиша', 'от 2 000 ₽'], ['Рилс', 'от 5 000 ₽'], ['Промо-ролик', 'от 10 000 ₽']] },
  auto: { vis: `<div class="vis v-auto">${ANIM.wave()}${mini({ mini: ['phone', 'wave', 'ai', 'flow', 'cal', 'tg'] })}</div>`,
    items: [['Автоматизация', 'от 10 000 ₽'], ['Чат-бот', '20 000 ₽'], ['Голосовой бот', '40 000 ₽']] },
};
document.querySelector('.prices').innerHTML = Object.keys(CAT).map((c, i) => `<a class="prc" href="${PAGE[c]}">${PRICE[c].vis}
  <span class="bd"><span class="nm"><b>${CAT[c]}</b><i>0${i + 1}</i></span><span class="fr"><small>от</small>${FROM[c].replace('от ', '')}</span>
  <ul>${PRICE[c].items.map(([n, v]) => `<li><span>${n}</span><span>${v}</span></li>`).join('')}</ul>
  <span class="go">Открыть прайс-лист ${ARR}</span></span></a>`).join('');

// ряд тянется мышью и пальцем; отпустил — докатывается по инерции
let dragged = false;
function dragRow(r) {
  r.el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') r.slow = 0.55; });
  r.el.addEventListener('pointerleave', () => (r.slow = 1));
  r.el.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    r.drag = { x0: e.clientX, y0: e.clientY, last: e.clientX, t: performance.now(), v: 0, on: false, id: e.pointerId };
    dragged = false;
  });
  r.el.addEventListener('pointermove', (e) => {
    const d = r.drag; if (!d || d.id !== e.pointerId) return;
    if (!d.on) {
      if (Math.abs(e.clientX - d.x0) < 6) return;
      if (Math.abs(e.clientY - d.y0) > Math.abs(e.clientX - d.x0)) { r.drag = null; return; } // это прокрутка страницы
      d.on = true; dragged = true; r.el.classList.add('drag'); r.el.setPointerCapture(e.pointerId);
    }
    const now = performance.now();
    const dx = e.clientX - d.last;
    r.x += dx; d.v = dx / Math.max(8, now - d.t) * 1000; d.last = e.clientX; d.t = now;
  });
  const end = () => {
    const d = r.drag; r.drag = null; r.el.classList.remove('drag');
    if (d?.on) r.fling = Math.max(-2400, Math.min(2400, d.v));
  };
  r.el.addEventListener('pointerup', end);
  r.el.addEventListener('pointercancel', end);
  r.el.addEventListener('click', (e) => { if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);
}

// движение: своя скорость ряда + разгон от прокрутки + бросок рукой
let boost = 0, lastY = scrollY, lastT = performance.now(), inView = false;
addEventListener('scroll', () => {
  const now = performance.now();
  const v = Math.abs(scrollY - lastY) / Math.max(16, now - lastT);
  boost = Math.min(5, boost + v * 1.4);
  lastY = scrollY; lastT = now;
}, { passive: true });
function tick(t) {
  const dt = Math.min(0.05, (t - (tick.t || t)) / 1000); tick.t = t;
  boost *= Math.pow(0.04, dt);
  if (inView) for (const r of rows) {
    const half = r.track.scrollWidth / r.reps;
    if (!r.drag?.on) {
      r.x += (r.dir * r.v * r.slow * (1 + boost) + r.fling) * dt;
      r.fling *= Math.pow(0.03, dt);
    }
    while (r.x <= -half) r.x += half; while (r.x > 0) r.x -= half;
    r.track.style.transform = `translate3d(${r.x}px,0,0)`;
  }
  requestAnimationFrame(tick);
}

// ролики играют, только пока секция на экране
let vio;
function watchVideos() {
  vio?.disconnect();
  vio = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting && inView && !reduced) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
  }), { rootMargin: '0px 200px' });
  river.querySelectorAll('video').forEach((v) => vio.observe(v));
}
new IntersectionObserver(([e]) => {
  inView = e.isIntersecting;
  river.querySelectorAll('video').forEach((v) => (inView && !reduced ? null : v.pause()));
  if (inView) watchVideos();
}, { rootMargin: '100px 0px' }).observe(document.getElementById('works'));

// открыть работу: дизайн/ролик — крупно, сайт — экраны, автоматизация — схема
const dlg = { lb: document.getElementById('lb'), sv: document.getElementById('sv'), pv: document.getElementById('pv') };
river.addEventListener('click', (e) => {
  const c = e.target.closest('.card'); if (!c) return;
  const w = W[+c.dataset.i];
  if (w.cat === 'sites') return openSite(w);
  if (w.cat === 'auto') return openPipe(w);
  dlg.lb.querySelector('.lb').innerHTML = media(w, true) +
    `<div class="info"><b>${esc(w.t)}</b><span>${esc(w.k)}</span><a href="${PAGE[w.cat]}">${CAT[w.cat]}: цены ↗</a></div>`;
  dlg.lb.showModal();
});
Object.values(dlg).forEach((d) => d.addEventListener('click', (e) => {
  if (e.target === d || e.target.closest('.x')) { d.querySelector('video')?.pause(); d.close(); }
}));
dlg.sv.addEventListener('close', () => (scrollers = []));
dlg.pv.addEventListener('close', () => (pipe = null));

// ---------- сайт: компьютер + телефон, медленно листаются сами, рукой — сразу ----------
let scrollers = [];
function openSite(w) {
  const imgs = (l) => l.map((s) => `<img src="${A}${s}" alt="" draggable="false">`).join('');
  const host = w.t === 'DeepDiver' ? 'deepdiver' : w.t.toLowerCase();
  dlg.sv.querySelector('.sv').innerHTML = `
    <div class="tabs"><button data-v="m" aria-pressed="true">Телефон</button><button data-v="d" aria-pressed="false">Компьютер</button></div>
    <div class="screens">
      <div class="pc"><div class="bar"><i></i><i></i><i></i><span>${esc(w.t)}</span></div><div class="scr">${imgs(w.desk)}</div></div>
      <div class="ph"><div class="scr">${imgs(w.mob)}</div></div>
    </div>
    <div class="info"><b>${esc(w.t)}</b><span>${esc(w.k)}</span><span class="hint">листается само — можно крутить рукой</span>${w.url ? `<a href="${w.url}" target="_blank" rel="noopener">Открыть сайт ↗</a>` : ''}<a href="${PAGE.sites}">Сайты: цены ↗</a></div>`;
  const sv = dlg.sv.querySelector('.sv'); sv.dataset.v = 'm';
  sv.querySelector('.tabs').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    sv.dataset.v = b.dataset.v; sv.querySelectorAll('.tabs button').forEach((x) => x.setAttribute('aria-pressed', x === b));
  };
  dlg.sv.showModal();
  scrollers = [...sv.querySelectorAll('.scr')].map((el) => {
    const s = { el, dir: 1, pause: 1.2, pos: 0 };
    const hold = () => (s.pause = 2.5);
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((ev) => el.addEventListener(ev, hold, { passive: true }));
    el.addEventListener('scroll', () => { if (Math.abs(el.scrollTop - s.pos) > 2) { s.pos = el.scrollTop; hold(); } }, { passive: true });
    return s;
  });
}
function scrollTick(dt) {
  for (const s of scrollers) {
    const el = s.el; const max = el.scrollHeight - el.clientHeight;
    if (max <= 0 || !el.offsetParent) continue;
    if (s.pause > 0) { s.pause -= dt; s.pos = el.scrollTop; continue; }
    const v = el.clientHeight * 0.09; // ~11 с на экран: успеваешь рассмотреть
    s.pos += s.dir * v * dt;
    if (s.pos >= max) { s.pos = max; s.dir = -1; s.pause = 1.5; }
    if (s.pos <= 0) { s.pos = 0; s.dir = 1; s.pause = 1.5; }
    el.scrollTop = s.pos;
  }
}

// ---------- автоматизация: вся схема, по ней бегут данные по сценариям ----------
let pipe = null;
function openPipe(p) {
  const vert = mob();
  const nc = p.stages.length;
  const nr = Math.max(...p.nodes.map((n) => n.r)) + 1;
  // на телефоне высота полосы этапа — по числу узлов в нём
  const bands = p.stages.map((_, c) => p.nodes.filter((n) => n.c === c).length * 96 + 70);
  const ph = bands.reduce((a, b) => a + b, 0);
  dlg.pv.querySelector('.pv').innerHTML = `
    <div class="top"><div><div class="who">${esc(p.who)}</div><h3>${esc(p.t)}</h3>
      ${p.nums ? `<div class="nums">${p.nums.map(([v, l]) => `<span><b>${esc(v)}</b>${esc(l)}</span>`).join('')}</div>` : ''}
      ${p.call ? `<a class="call" href="tel:${p.call.tel}">${svg('phone')}Позвонить ${esc(p.call.who)} · <span class="nw">${esc(p.call.show)}</span></a><span class="callh">бот ответит вживую — это рабочая линия</span>` : ''}</div>
      <p>${esc(p.long || p.k)}</p></div>
    <div class="sc"><span>Сценарий</span>${p.scen.map((s, i) => `<button data-s="${i}" aria-pressed="${!i}">${esc(s.t)}<u></u></button>`).join('')}</div>
    <div class="stage" style="--ph:${ph}px">
      <div class="cols" style="grid-template-columns:repeat(${nc},1fr);grid-template-rows:${vert ? bands.map((b) => b + 'px').join(' ') : '1fr'}">${p.stages.map((s) => `<div>${esc(s)}</div>`).join('')}</div>
      <div class="canvas"><svg class="wires"></svg>${p.nodes.map((n) =>
        `<div class="node ${n.kind || ''}" data-n="${n.id}"><span class="ic">${svg(n.ic)}</span><span><b>${esc(n.t)}</b>${n.s ? `<small>${esc(n.s)}</small>` : ''}</span><span class="say"></span></div>`).join('')}</div>
    </div>
    <div class="bot"><div class="need"><span>Что внутри:</span>${p.stack.map((s) => `<i>${esc(s)}</i>`).join('')}</div><span>${p.url ? `<a href="${p.url}" target="_blank" rel="noopener">Открыть ${esc(p.url.replace('https://', ''))} ↗</a> &nbsp; ` : ''}<a href="${PAGE.auto}">Автоматизации: цены ↗</a></span></div>`;
  dlg.pv.showModal();
  const pv = dlg.pv.querySelector('.pv');
  pv.scrollTop = 0;
  pipe = { p, pv, vert, nc, nr, bands, scen: 0, step: 0, prog: 0, wait: 0.6, auto: true, edges: {} };
  layoutPipe();
  pv.querySelector('.sc').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    pipe.auto = false; startScen(+b.dataset.s);
  };
  startScen(0);
}
function layoutPipe() {
  const { p, pv, vert, nc, nr } = pipe;
  const canvas = pv.querySelector('.canvas');
  const W_ = canvas.clientWidth, H_ = canvas.clientHeight;
  // этап = колонка, r — ряд внутри (дробный — для разводки проводов)
  // на телефоне этап — полоса сверху вниз, узлы этапа стоят друг под другом
  const pos = {};
  const by = {};
  p.nodes.forEach((n) => (by[n.c] = by[n.c] || []).push(n));
  p.nodes.forEach((n) => {
    const el = canvas.querySelector(`[data-n="${n.id}"]`);
    let px, py;
    if (vert) {
      const list = by[n.c].slice().sort((a, b) => a.r - b.r), i = list.indexOf(n), k = list.length;
      const top = pipe.bands.slice(0, n.c).reduce((a, b) => a + b, 0);
      px = W_ / 2 - 12; py = top + pipe.bands[n.c] / 2 + 14 + (i - (k - 1) / 2) * 96;
    } else { px = W_ * (n.c + 0.5) / nc; py = 40 + (H_ - 80) * (n.r + 0.5) / nr; }
    el.style.left = px + 'px'; el.style.top = py + 'px';
    pos[n.id] = el;
  });
  // провода: объединение всех путей сценариев
  const svgEl = pv.querySelector('svg.wires');
  const keys = new Set();
  p.scen.forEach((s) => s.path.forEach((id, i) => {
    if (!i) return; const a = s.path[i - 1];
    if (!keys.has(`${id}>${a}`)) keys.add(`${a}>${id}`);
  }));
  const node = Object.fromEntries(p.nodes.map((n) => [n.id, n]));
  const cr = canvas.getBoundingClientRect();
  // центр и размер узла в координатах холста
  const box = (id) => { const r = pos[id].getBoundingClientRect(); return { x: r.left - cr.left + r.width / 2, y: r.top - cr.top + r.height / 2, w: r.width, h: r.height }; };
  const colW = W_ / nc;
  let rail = 0;
  svgEl.innerHTML = '';
  pipe.edges = {};
  keys.forEach((k) => {
    const [a, b] = k.split('>'); const A_ = box(a), B_ = box(b), na = node[a], nb = node[b];
    let d;
    if (vert || na.c === nb.c) {
      // узлы друг под другом: напрямую, а если между ними чужой узел — в обход справа
      const sy = B_.y > A_.y ? 1 : -1;
      const between = p.nodes.some((n) => {
        if (n === na || n === nb) return false;
        const C = box(n.id);
        return Math.abs(C.x - A_.x) < 30 && (C.y - A_.y) * sy > 0 && (B_.y - C.y) * sy > 0;
      });
      if (between) {
        const x1 = A_.x + A_.w / 2, x2 = B_.x + B_.w / 2, r = 12;
        const xr = Math.max(x1, x2) + 16 + (rail++ % 3) * 7;
        d = `M${x1},${A_.y} L${xr - r},${A_.y} Q${xr},${A_.y} ${xr},${A_.y + sy * r} L${xr},${B_.y - sy * r} Q${xr},${B_.y} ${xr - r},${B_.y} L${x2},${B_.y}`;
      } else {
        const y1 = A_.y + sy * A_.h / 2, y2 = B_.y - sy * B_.h / 2, my = (y1 + y2) / 2;
        d = `M${A_.x},${y1} C${A_.x},${my} ${B_.x},${my} ${B_.x},${y2}`;
      }
    } else {
      const sx = B_.x > A_.x ? 1 : -1;
      const x1 = A_.x + sx * A_.w / 2, x2 = B_.x - sx * B_.w / 2;
      if (Math.abs(nb.c - na.c) > 1) {
        // провод через этап: поворачивает в зазоре и идёт по свободному ряду, не сквозь узлы
        const lo = Math.min(na.c, nb.c), hi = Math.max(na.c, nb.c);
        const free = (r) => !p.nodes.some((n) => n.c > lo && n.c < hi && Math.abs(n.r - r) < 0.5);
        const g = (colW - A_.w) / 2;
        if (free(nb.r)) d = `M${x1},${A_.y} C${x1 + sx * g},${A_.y} ${x1 + sx * g},${B_.y} ${x1 + sx * 2 * g},${B_.y} L${x2},${B_.y}`;
        else if (free(na.r)) d = `M${x1},${A_.y} L${x2 - sx * 2 * g},${A_.y} C${x2 - sx * g},${A_.y} ${x2 - sx * g},${B_.y} ${x2},${B_.y}`;
      }
      if (!d) { const mx = (x1 + x2) / 2; d = `M${x1},${A_.y} C${mx},${A_.y} ${mx},${B_.y} ${x2},${B_.y}`; }
    }
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d); svgEl.appendChild(path);
    pipe.edges[k] = path;
  });
  pipe.dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  pipe.dot.setAttribute('r', 5); svgEl.appendChild(pipe.dot);
}
function startScen(i) {
  const { pv, p } = pipe;
  pipe.scen = i; pipe.step = 0; pipe.prog = 0; pipe.wait = 0.5; pipe.t = 0;
  pv.querySelectorAll('.sc button').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.s === i));
  const on = new Set(p.scen[i].path);
  pv.querySelectorAll('.node').forEach((n) => { n.classList.remove('hot'); n.classList.toggle('dim', !on.has(n.dataset.n)); n.querySelector('.say').classList.remove('on'); });
  Object.values(pipe.edges).forEach((e) => e.classList.remove('hot'));
  hit(p.scen[i].path[0], 0);
}
function hit(id, step) {
  const { pv, p } = pipe;
  pv.querySelectorAll('.node').forEach((n) => { n.classList.toggle('hot', n.dataset.n === id); n.querySelector('.say').classList.remove('on'); });
  const say = p.scen[pipe.scen].say?.[step];
  const el = pv.querySelector(`[data-n="${id}"] .say`);
  if (say) { el.textContent = say; el.classList.add('on'); }
}
function pipeTick(dt) {
  if (!pipe) return;
  const s = pipe.p.scen[pipe.scen];
  const total = s.path.length - 1;
  const u = pipe.pv.querySelector('.sc button[aria-pressed="true"] u');
  if (u) u.style.setProperty('--p', Math.min(100, ((pipe.step + pipe.prog) / total) * 100) + '%');
  if (pipe.wait > 0) { pipe.wait -= dt; return; }
  if (pipe.step >= total) { // сценарий прошёл — следующий
    const next = pipe.auto ? (pipe.scen + 1) % pipe.p.scen.length : pipe.scen;
    startScen(next); return;
  }
  const a = s.path[pipe.step], b = s.path[pipe.step + 1];
  const fwd = pipe.edges[`${a}>${b}`], back = pipe.edges[`${b}>${a}`];
  const path = fwd || back;
  path.classList.add('hot');
  pipe.prog += dt / 0.95;
  const L = path.getTotalLength();
  const k = Math.min(1, pipe.prog); const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const pt = path.getPointAtLength(fwd ? L * e : L * (1 - e));
  pipe.dot.setAttribute('cx', pt.x); pipe.dot.setAttribute('cy', pt.y);
  if (pipe.prog >= 1) {
    pipe.prog = 0; pipe.step++; hit(b, pipe.step);
    pipe.wait = s.say?.[pipe.step] ? 1.5 : 0.45; if (pipe.step >= total) pipe.wait = 2.6;
  }
}
addEventListener('resize', () => { if (pipe) { const sc = pipe.scen, au = pipe.auto; pipe.vert = mob(); layoutPipe(); pipe.auto = au; startScen(sc); } });

let lt = 0;
function loop(t) { const dt = Math.min(0.05, (t - (lt || t)) / 1000); lt = t; scrollTick(dt); pipeTick(dt); requestAnimationFrame(loop); }

renderChips(); build();
if (!reduced) { requestAnimationFrame(tick); requestAnimationFrame(loop); }
})();
