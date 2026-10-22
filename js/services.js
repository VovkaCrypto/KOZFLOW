/* services.js — секция «Услуги», вариант A. Генерируется из sections-v3/uslugi/template-A.html: node export.mjs */
(() => {
'use strict';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mob = innerWidth <= 900;
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => .5 - Math.cos(Math.PI * t) / 2;
const C = (x, y, r) => `M${x + r} ${y}a${r} ${r} 0 1 0 ${-2 * r} 0a${r} ${r} 0 1 0 ${2 * r} 0`;
const RR = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;

/* ── содержимое: только настоящее (цены — kozflow.ru/sayty и /dizayn) ── */
const SV = [
  { id: 'auto', word: 'Автоматизации', acl: '#B0844A', acd: '#C4985A', price: '/avtomatizacii',
    lead: 'Боты и голосовые ассистенты, автоматизация рутины и свои приложения под задачу. Всё, что можно отдать машине, работает само.',
    what: ['Боты', 'Автоматизации', 'Приложения'], fact: ['Работают', 'Звонки, чаты, CRM, ваши сервисы'],
    cost: ['от 10 000 ₽', 'автоматизация · чат-бот 20 000 ₽'] },
  { id: 'sites', word: 'Сайты', acl: '#3A4A3D', acd: '#93AC93', price: '/sayty',
    lead: 'Лендинги и многостраничные сайты под ключ: от структуры и текстов до анимации, заявок и поиска.',
    what: ['Лендинги', 'Сайты', 'Интеграции'], fact: ['Срок', 'Лендинг 1–1,5 недели · сайт 2–3'],
    cost: ['от 25 000 ₽', 'лендинг под ключ'] },
  { id: 'motion', word: 'Моушен', acl: '#4F7896', acd: '#A8C5D9', price: '/moushen',
    lead: 'Ролики и анимация для экранов в зале, сайта и соцсетей: от идеи и раскадровки до готового файла.',
    what: ['Ролики', 'Видео для экранов', 'Анимация'], fact: ['Форматы', 'ТВ, сайт, соцсети'],
    cost: ['от 2 000 ₽', 'оживить макет · ролик от 5 000 ₽'] },
  { id: 'design', word: 'Дизайн', acl: '#C26B4A', acd: '#DB8664', price: '/dizayn',
    lead: 'Афиши, меню, фирменный стиль и упаковка. Макеты сразу готовы к печати и к экрану.',
    what: ['Афиши', 'Меню', 'Айдентика', 'Упаковка'], fact: ['Форматы', 'Печать, экран, соцсети'],
    cost: ['от 1 200 ₽', 'макет · афиша 3 000 ₽'] }
];
const DK = [0, 1, 0, 1, 0];                      // 0 — светлый фон, 1 — тёмный; 0 — знак K
const INK0 = [45, 36, 25], INK1 = [245, 239, 223];
// фон перетекает через тёплый полутон, а не через серый
const BG3 = [[250, 247, 242], [139, 116, 86], [23, 18, 13]];
const bgAt = (d) => { const a = d < .5 ? BG3[0] : BG3[1], b = d < .5 ? BG3[1] : BG3[2], e = d < .5 ? d * 2 : d * 2 - 1; return `rgb(${a.map((c, j) => Math.round(c + (b[j] - c) * e)).join(',')})`; };

/* ── рамки (коробка 600×600) и окна работ внутри них ── */
const holes = (y) => { let d = ''; for (let x = 44; x <= 540; x += 40) d += `M${x} ${y}h16v14h-16Z `; return d; };
const FRAME = {
  // корпус 240×500 ≈ пропорции настоящего телефона (9:19,5 по экрану)
  auto: { d: [RR(180, 50, 240, 500, 38), 'M272 74h56', 'M276 530h48',
      'M444 258a52 52 0 0 1 0 84', 'M470 230a90 90 0 0 1 0 140', 'M156 258a52 52 0 0 0 0 84', 'M130 230a90 90 0 0 0 0 140'],
    win: [194, 92, 212, 424, 14] },
  sites: { d: [RR(20, 100, 560, 372, 14), 'M20 140H580', C(44, 120, 6) + C(64, 120, 6) + C(84, 120, 6), 'M130 111h300a9 9 0 0 1 0 18h-300a9 9 0 0 1 0-18Z'],
    win: [26, 144, 548, 322, 6] },
  motion: { d: ['M20 104H580 M20 500H580', holes(116), holes(470), 'M30 150h540v304h-540Z'],
    win: [40, 160, 520, 284, 4] },
  design: { d: ['M150 60h300v400h-300Z', 'M266 44h68v30h-68Z', 'M130 60h-30 M150 40v-30 M470 60h30 M450 40v-30 M130 460h-30 M150 480v30 M470 460h30 M450 480v30',
      C(234, 528, 14) + C(278, 528, 14) + C(322, 528, 14) + C(366, 528, 14)],
    win: [160, 70, 280, 380, 3] }
};
/* ── спутники-иконки (коробка 100×100) и их места вокруг рамки ── */
const SAT = {
  auto: { d: ['M10 48L90 14L72 86L48 62Z M48 62L90 14 M48 62V82L60 70',
      'M14 22h72v66h-72Z M14 40h72 M32 12v18 M68 12v18 M30 56h10 M46 56h10 M62 56h10 M30 72h10 M46 72h10',
      C(50, 50, 38) + 'M50 26V50L66 62', 'M28 70V46a22 22 0 0 1 44 0v24l8 8H20Z M42 84a8 8 0 0 0 16 0'],
    at: [[-.38, -.32], [.38, -.33], [-.39, .31], [.39, .3]] },
  sites: { d: ['M50 90C50 90 20 58 20 38a30 30 0 0 1 60 0c0 20-30 52-30 52Z' + C(50, 38, 11),
      'M32 8h36a6 6 0 0 1 6 6v72a6 6 0 0 1-6 6h-36a6 6 0 0 1-6-6v-72a6 6 0 0 1 6-6Z M44 82h12', C(42, 42, 26) + 'M61 61L88 88'],
    at: [[-.3, -.43], [.3, -.43], [0, .42]] },
  motion: { d: ['M10 34h58v44h-58Z M68 48L90 36V76L68 64' + C(26, 22, 10) + C(52, 22, 10),
      'M12 80C30 20 70 80 88 20 M12 80L34 40 M88 20L66 60' + C(34, 40, 5) + C(66, 60, 5),
      'M12 42h76v46h-76Z M12 42L16 20L86 30L84 42 M32 23L28 40 M52 26L48 41 M72 29L68 42', C(50, 50, 38) + 'M42 34L66 50L42 66Z'],
    at: [[-.34, -.45], [.34, -.45], [-.34, .45], [.34, .45]] },
  design: { d: ['M50 12a38 38 0 1 0 0 76c8 0 10-6 6-12s0-12 8-12h10a14 14 0 0 0 14-14c0-22-18-38-38-38Z' + C(32, 42, 6) + C(50, 28, 6) + C(68, 40, 6),
      'M86 10L46 56 M46 56c-10-4-22 2-24 14s-6 12-12 14c16 6 36 0 38-14Z', 'M8 86L30 16L52 86 M16 62h28' + C(74, 72, 13) + 'M87 56V86', 'M28 8V72H92 M8 28H72V92'],
    at: [[-.4, -.26], [.4, -.29], [-.41, .24], [.4, .27]] }
};
const NAV = {
  auto: 'M30 14h26a6 6 0 0 1 6 6v60a6 6 0 0 1-6 6h-26a6 6 0 0 1-6-6v-60a6 6 0 0 1 6-6Z M72 38a14 14 0 0 1 0 24 M82 28a28 28 0 0 1 0 44',
  sites: 'M10 18h80v64h-80Z M10 34h80 M20 26h4 M30 26h4 M22 46h30v24h-30Z M62 48h18 M62 58h14',
  motion: 'M12 22h76v56h-76Z M42 38L62 50L42 62Z M12 34h76 M12 66h76',
  design: 'M50 8L78 48L50 92L22 48Z M50 8V54' + C(50, 60, 6)
};
/* ── работы в окнах ── */
const CHATS = [
  { who: 'Кегель', where: 'Кегельбар · голос и VK', m: [['q', 'Дорожку на четверых, сегодня в семь?'], ['a', 'Есть свободная на 19:00. Записываю?'], ['q', 'Да'], ['a', 'Готово! Ждём в 19:00.']] },
  { who: 'Света', where: 'Завод · голосовой бот', m: [['q', 'Бильярд на девять вечера, на двоих?'], ['a', 'Стол свободен. Бронирую?'], ['q', 'Да, спасибо'], ['a', 'Готово, ждём в 21:00.']] }
];
const MEDIA = {
  auto: `<div class="m m-chat"><div class="hd"><i class="av"></i><span><b></b><small></small></span></div><div class="msgs"></div></div>`,
  sites: `<div class="m m-sl"><img class="sl" src="assets/services/vostok-desk-hero.webp" alt="Восток 24" data-cap="Восток 24"><img class="sl" src="assets/services/tverchefs-desk-hero.webp" alt="Ассоциация кулинаров" data-cap="Ассоциация кулинаров"><img class="sl" src="assets/services/miravi-desk-hero.webp" alt="Miravi" data-cap="Miravi"><span class="cap"></span></div>`,
  motion: `<div class="m m-vid"><video data-vid="dish" muted playsinline loop autoplay preload="auto"></video><span class="cap">Видеоменю · Восток 24</span><span class="bar"></span></div>`,
  design: `<div class="m m-sl"><img class="sl" src="assets/services/w02.webp" alt="Афиша Кегельбара" data-cap="Кегельбар"><img class="sl" src="assets/services/w12.webp" alt="Афиша Завода" data-cap="Завод"><img class="sl" src="assets/services/w09.webp" alt="Айдентика Волжанки" data-cap="Волжанка"><img class="sl" src="assets/services/w37.webp" alt="Упаковка «Щукин и дети»" data-cap="Щукин и дети"><span class="cap"></span></div>`
};

/* ── семплинг контуров в точки ── */
const kPts = (document.getElementById('svc-kpts').textContent.trim() || '').split(/\s+/).map((p) => p.split(',').map(Number)).filter((p) => p.length === 2 && !isNaN(p[0]));
const SH = (() => {
  const S = 600, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const g = cv.getContext('2d', { willReadFrequently: true });
  const grab = (draw, step, sc = 1, lw = 7) => {
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S, S); g.setTransform(sc, 0, 0, sc, 0, 0);
    g.strokeStyle = g.fillStyle = '#000'; g.lineWidth = lw / sc; g.lineCap = g.lineJoin = 'round';
    draw(g); const px = g.getImageData(0, 0, S, S).data, out = [], side = sc === 1 ? S : 100 * sc;
    for (let y = 0; y < side; y += step) for (let x = 0; x < side; x += step) if (px[(y * S + x) * 4 + 3] > 120) out.push(x / side - .5, y / side - .5);
    return out;
  };
  const res = { k: grab((g) => {
    if (!kPts.length) return;
    const xs = kPts.map((p) => p[0]), ys = kPts.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), sc = 380 / (y1 - y0);
    g.beginPath(); kPts.forEach(([x, y], i) => { const X = 300 + (x - (x0 + x1) / 2) * sc, Y = 300 + (y - (y0 + y1) / 2) * sc; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); g.fill();
  }, 4), sat: {} };
  for (const id in FRAME) {
    res[id] = grab((g) => FRAME[id].d.forEach((d) => g.stroke(new Path2D(d))), 3, 1, 6);
    res.sat[id] = SAT[id].d.map((d) => grab((g) => g.stroke(new Path2D(d)), 3, 3, 6));
  }
  return res;
})();

/* ── многогранники для переходов: точки по рёбрам, радиус 0.5 ── */
const POLY = (() => {
  const F = (1 + Math.sqrt(5)) / 2, out = [], dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const edges = (V) => { let d0 = 1e9; const E = [];
    for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) d0 = Math.min(d0, dist(V[i], V[j]));
    for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) if (dist(V[i], V[j]) < d0 * 1.001) E.push([V[i], V[j]]);
    return E; };
  const norm = (pts) => { let r = 0; for (let i = 0; i < pts.length; i += 3) r = Math.max(r, Math.hypot(pts[i], pts[i + 1], pts[i + 2])); return Float32Array.from(pts, (v) => v / r * .5); };
  const fromEdges = (E, total = 2600) => { const L = E.reduce((s, [a, b]) => s + dist(a, b), 0), pts = [];
    E.forEach(([a, b]) => { const n = Math.max(2, Math.round(total * dist(a, b) / L));
      for (let i = 0; i < n; i++) { const t = i / (n - 1); pts.push(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t); } });
    return norm(pts); };
  const sg = [-1, 1], ico = [], dod = [], cube = [];
  sg.forEach((a) => sg.forEach((b) => { ico.push([0, a, b * F], [a, b * F, 0], [b * F, 0, a]); dod.push([0, a / F, b * F], [a / F, b * F, 0], [b * F, 0, a / F]); }));
  sg.forEach((a) => sg.forEach((b) => sg.forEach((c) => { cube.push([a, b, c]); dod.push([a, b, c]); })));
  out.push(fromEdges(edges(ico)));
  out.push(fromEdges([...edges(cube.filter((v) => v[0] * v[1] * v[2] > 0)), ...edges(cube.filter((v) => v[0] * v[1] * v[2] < 0))]));
  const tor = [], RM = .36, rm = .15, tp = (a, b) => tor.push((RM + rm * Math.cos(b)) * Math.cos(a), rm * Math.sin(b), (RM + rm * Math.cos(b)) * Math.sin(a));
  for (let i = 0; i < 18; i++) for (let j = 0; j < 70; j++) tp(i / 18 * 6.2832, j / 70 * 6.2832);
  for (let j = 0; j < 6; j++) for (let i = 0; i < 160; i++) tp(i / 160 * 6.2832, j / 6 * 6.2832);
  out.push(norm(tor));
  out.push(fromEdges(edges(dod)));
  return out; // K→Автоматизации: икосаэдр; →Сайты: звёздный тетраэдр; →Моушен: тор; →Дизайн: додекаэдр
})();

/* ── разметка ── */
const pin = document.querySelector('.svc-pin'), el = document.getElementById('services'), box = el.querySelector('.svc-symbox');
const letters = (s) => [...s].map((ch, k) => `<i style="--d:${k}">${ch}</i>`).join('');
el.querySelector('.svc-ww').innerHTML = `<h2 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Услуги: ${SV.map((s) => s.word).join(', ')}</h2><div class="svc-word">` +
  SV.map((s, i) => `<span class="w" data-i="${i}" style="--wc:${s.acl};--wcd:${s.acd}">${letters(s.word)}</span>`).join('') + '</div>';
const nb = (t) => t.replace(/(\d) (?=\d{3})/g, '$1 ').replace(/ ₽/g, ' ₽'); // цены не рвутся по строкам
// описание и паспорт услуги — один блок, чтобы высоты не расходились и не оставляли дыр
el.querySelector('.svc-body').innerHTML = SV.map((s) => `<div class="svc-b"><p class="svc-lead">${s.lead}</p><dl class="svc-spec">` +
  `<div class="r r-what"><dt>Делаю</dt><dd>${s.what.join('<i>·</i>')}</dd></div>` +
  `<div class="r"><dt>${s.fact[0]}</dt><dd>${s.fact[1]}</dd></div>` +
  `<div class="r r-p"><dt>Цена</dt><dd><b>${nb(s.cost[0])}</b><small>${nb(s.cost[1])}</small></dd>` +
  (s.price ? `<dd class="lnk"><a class="svc-more" href="${s.price}" target="_blank" rel="noopener">Прайс<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15L15 5M7 5h8v8"/></svg></a></dd>` : '') + '</div></dl></div>').join('');
el.querySelector('.svc-nav').innerHTML = SV.map((s, i) => `<button type="button" data-go="${i}" aria-label="${s.word}"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="${NAV[s.id]}"/></svg><span>${s.word}</span></button>`).join('');
box.innerHTML = SV.map((s) => MEDIA[s.id]).join('');
const MD = [...box.querySelectorAll('.m')];
MD.forEach((m, i) => { const [x, y, w, h, r] = FRAME[SV[i].id].win; Object.assign(m.style, { left: x / 6 + '%', top: y / 6 + '%', width: w / 6 + '%', height: h / 6 + '%' }); m.style.setProperty('--r', r + 'px'); });
// переписка: сообщения строятся один раз, показ — по времени
const chat = box.querySelector('.m-chat'), msgs = chat.querySelector('.msgs');
msgs.innerHTML = CHATS[0].m.map(([c]) => `<span class="mg ${c}"></span>`).join('') + '<span class="ty"><i></i><i></i><i></i></span>';
const MG = [...msgs.querySelectorAll('.mg')], TY = msgs.querySelector('.ty');
let chatI = -1;
function chatTick(t) {
  const cyc = 10, k = Math.floor(t / cyc) % CHATS.length, c = t % cyc;
  if (k !== chatI) { chatI = k; const d = CHATS[k]; chat.querySelector('.hd .av').textContent = d.who[0]; chat.querySelector('.hd b').textContent = d.who; chat.querySelector('.hd small').textContent = d.where;
    MG.forEach((g, j) => { g.textContent = d.m[j][1]; g.classList.remove('on'); }); }
  const at = [.6, 2.6, 4.4, 6.4];
  MG.forEach((g, j) => g.classList.toggle('on', c > at[j] && c < cyc - .5));
  const typing = (c > 1.4 && c < 2.6) || (c > 5.2 && c < 6.4);
  TY.classList.toggle('on', typing); TY.style.display = typing ? '' : 'none';
}
// листание работ в окнах
const SLD = MD.map((m) => [...m.querySelectorAll('.sl')]), VID = MD[2].querySelector('video');
function slideTick(i, t) {
  const sl = SLD[i]; if (!sl.length) return; const per = i === 3 ? 2.6 : 3.2, k = Math.floor(t / per) % sl.length;
  if (sl._k === k) return; sl._k = k; sl.forEach((s, j) => s.classList.toggle('on', j === k));
  const cap = MD[i].querySelector('.cap'); if (cap) cap.textContent = sl[k].dataset.cap;
}

/* ── частицы: цели по состояниям ── */
const N = mob ? 1600 : 3400, SATSC = mob ? .12 : .13;
const rnd = Float32Array.from({ length: N * 5 }, () => Math.random());
const pickIdx = (k, m) => Math.floor(((k * .6180339887 + rnd[k * 5]) % 1) * m);
function stateOf(shape, sats, scale) {
  const X = new Float32Array(N), Y = new Float32Array(N), Z = new Float32Array(N), T = new Int8Array(N).fill(-1);
  for (let k = 0; k < N; k++) {
    const r = rnd[k * 5 + 3];
    if (sats && r > .74) { const j = Math.min(sats.length - 1, Math.floor((r - .74) / .26 * sats.length)), a = sats[j], q = pickIdx(k, a.length / 2) * 2;
      X[k] = a[q] * SATSC; Y[k] = a[q + 1] * SATSC; T[k] = j; }
    else { const q = pickIdx(k, shape.length / 2) * 2; X[k] = shape[q] * scale; Y[k] = shape[q + 1] * scale; Z[k] = (rnd[k * 5 + 2] - .5) * .02; }
  }
  return { X, Y, Z, T };
}
const ST = [stateOf(SH.k, null, .85), ...SV.map((s) => Object.assign(stateOf(SH[s.id], SH.sat[s.id], 1), { at: SAT[s.id].at }))];
// многогранник + ореол: часть частиц в переходе улетает на широкую сферу
const PL = POLY.map((a) => {
  const X = new Float32Array(N), Y = new Float32Array(N), Z = new Float32Array(N), m = a.length / 3;
  for (let k = 0; k < N; k++) {
    if (rnd[k * 5 + 4] < .16) { const y = 1 - 2 * ((k * .618034 + rnd[k * 5 + 1] * .1) % 1), rr = Math.sqrt(1 - y * y), th = k * 2.39996, R = .8 + rnd[k * 5 + 2] * .6;
      X[k] = Math.cos(th) * rr * R; Y[k] = y * R; Z[k] = Math.sin(th) * rr * R; }
    else { const q = pickIdx(k, m) * 3; X[k] = a[q] * 1.25; Y[k] = a[q + 1] * 1.25; Z[k] = a[q + 2] * 1.25; }
  }
  return { X, Y, Z };
});
const PX = new Float32Array(N), PY = new Float32Array(N), PZ = new Float32Array(N), VX = new Float32Array(N), VY = new Float32Array(N), VZ = new Float32Array(N);

/* ── состояние секции ── */
const S = { cv: el.querySelector('.svc-cv'), words: [...el.querySelectorAll('.svc-word .w')], stacks: [...el.querySelectorAll('.svc-stackp')], nav: [...el.querySelectorAll('.svc-nav button')],
  active: -1, vis: false, init: false, last: 0, mx: -1e4, my: -1e4, tx: 0, ty: 0, tvx: 0, tvy: 0, dk: 0, mv: [0, 0, 0, 0] };
S.ctx = S.cv.getContext('2d');
pin.addEventListener('pointermove', (e) => { const r = pin.getBoundingClientRect(); S.mx = e.clientX - r.left; S.my = e.clientY - r.top; S.tx = (S.mx / r.width - .5) * 2; S.ty = (S.my / r.height - .5) * 2; });
pin.addEventListener('pointerleave', () => { S.mx = S.my = -1e4; S.tx = S.ty = 0; });
// точки остановки: середина «стоянки» каждой услуги
const HOLD = [.47, 1.31, 2.31, 3.31];
const snaps = HOLD.map(() => { const i = document.createElement('i'); i.className = 'snap'; el.appendChild(i); return i; });
S.nav.forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.go; scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.offsetHeight - innerHeight) * HOLD[i] / SV.length, behavior: reduce ? 'auto' : 'smooth' }); }));
new IntersectionObserver(([e]) => { S.vis = e.isIntersecting; }, { rootMargin: '20% 0px' }).observe(el);

function fit() {
  const dpr = Math.min(2, devicePixelRatio || 1), r = pin.getBoundingClientRect();
  S.cv.width = r.width * dpr; S.cv.height = r.height * dpr; S.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); S.W = r.width; S.H = r.height;
  const b = box.getBoundingClientRect();
  S.cx = b.left - r.left + b.width / 2; S.cy = b.top - r.top + b.height / 2; S.sz = Math.min(b.width, b.height);
  const W = el.querySelector('.svc-ww').clientWidth || S.W * .4;
  S.words.forEach((w) => { w.style.setProperty('--fs', '100px'); const fs = Math.min(Math.min(190, S.H * .14), W / (w.scrollWidth || 1) * 100 * .98); w.style.setProperty('--fs', fs + 'px'); });
  const span = el.offsetHeight - innerHeight; snaps.forEach((s, i) => s.style.top = (span * HOLD[i] / SV.length) + 'px');
}

function setActive(a) {
  if (S.active === a) return;
  const was = S.active; S.active = a;
  S.words.forEach((w) => { const i = +w.dataset.i; w.classList.toggle('on', i === a); w.classList.toggle('out', i === was && i !== a); });
  S.stacks.forEach((st) => [...st.children].forEach((c, i) => c.classList.toggle('on', i === a)));
  S.nav.forEach((b, i) => b.classList.toggle('on', i === a));
  pin.style.setProperty('--acl', SV[a].acl); pin.style.setProperty('--acd', SV[a].acd);
}

function frame(now) {
  const dt = S.last ? Math.min(50, now - S.last) : 16.7; S.last = now; const fr = dt / 16.67, t = now / 1000;
  const r = el.getBoundingClientRect(), span = r.height - innerHeight, n = SV.length;
  const p = cl(-r.top / span) * n, i = Math.min(n - 1, Math.floor(p)), f = p - i;
  // K → первая услуга в начале, дальше у каждой услуги долгая стоянка и переход в последней трети
  let A, B, u, poly;
  if (p < .3) { A = 0; B = 1; u = p / .3; poly = 0; }
  else if (i < n - 1 && f >= .62) { A = i + 1; B = i + 2; u = (f - .62) / .38; poly = i + 1; }
  else { A = B = i + 1; u = 0; poly = -1; }
  setActive(cl(Math.floor(p + .2), 0, n - 1));

  // фон и текст: плавное перетекание светлый ↔ тёмный
  const dkT = A === B ? DK[A] : DK[A] + (DK[B] - DK[A]) * ease(cl((u - .3) / .4));
  S.dk += (dkT - S.dk) * (reduce ? 1 : Math.min(1, .06 * fr));
  const dkt = ease(cl((S.dk - .38) / .24)), dks = S.dk.toFixed(3);
  if (S.dks !== dks) { S.dks = dks; pin.style.background = bgAt(S.dk); pin.style.setProperty('--dkt', dkt.toFixed(3)); }

  // работы в рамках: проявляются, когда рамка собрана
  for (let k = 0; k < n; k++) {
    const on = (A === B && A === k + 1) || (A !== B && A === k + 1 && u < .08);
    S.mv[k] += ((on ? 1 : 0) - S.mv[k]) * (reduce ? 1 : Math.min(1, (on ? .045 : .12) * fr));
    const m = MD[k], v = S.mv[k] < .005 ? 0 : S.mv[k] > .99 ? 1 : S.mv[k];
    // на стоянке — без фильтра и маски, иначе браузер рисует работу мягче
    if (m._v !== v) { m._v = v; m.style.setProperty('--mv', v.toFixed(3)); m.style.opacity = v ? Math.min(1, v * 1.6).toFixed(3) : 0; m.classList.toggle('full', v === 1); }
  }
  if (S.mv[0] > .01) chatTick(t);
  if (S.mv[1] > .01) slideTick(1, t);
  if (S.mv[3] > .01) slideTick(3, t);
  if (S.mv[2] > .01 && VID.duration) MD[2].style.setProperty('--vp', (VID.currentTime / VID.duration).toFixed(2));
  const mvMax = Math.max(...S.mv);

  // частицы
  const ctx = S.ctx; ctx.clearRect(0, 0, S.W, S.H);
  S.tvx += (S.tx - S.tvx) * .04 * fr; S.tvy += (S.ty - S.tvy) * .04 * fr;
  const ry = t * .2 + u * 1.6, rx = .42 + Math.sin(t * .17) * .14, cY = Math.cos(ry), sY = Math.sin(ry), cX = Math.cos(rx), sX = Math.sin(rx);
  const tilt = reduce ? 0 : 1 - mvMax, gy = S.tvx * .3 * tilt, gx = -S.tvy * .2 * tilt, cgy = Math.cos(gy), sgy = Math.sin(gy), cgx = Math.cos(gx), sgx = Math.sin(gx);
  // спутники: лёгкое покачивание и поворот вокруг своей оси
  const sat = (st) => { const o = []; if (!st.at) return o; st.at.forEach(([ax, ay], j) => { const a = reduce ? 0 : Math.sin(t * .5 + j * 1.3) * .7; o.push(ax, ay + (reduce ? 0 : Math.sin(t * .7 + j * 1.7) * .012), Math.cos(a), Math.sin(a)); }); return o; };
  const stA = ST[A], stB = ST[B], oA = sat(stA), oB = A === B ? oA : sat(stB), pl = poly >= 0 && A !== B ? PL[poly] : null;
  const K = reduce ? 1 : .011, damp = Math.pow(.9, fr), sw = .003, F = 2.4, sz = S.sz, cx = S.cx, cy = S.cy;
  const MR = 130, MR2 = MR * MR, push = .3 / sz;
  const ink = INK0.map((c, j) => Math.round(c + (INK1[j] - c) * dkt)).join(','), sv = SV[Math.max(0, (u < .5 ? A : B) - 1)], acc = dkt > .5 ? sv.acd : sv.acl;
  const paths = Array.from({ length: 6 }, () => new Path2D());
  const first = !S.init; S.init = true;
  for (let k = 0; k < N; k++) {
    let x, y, z; const ta = stA.T[k];
    if (ta < 0) { x = stA.X[k]; y = stA.Y[k]; z = stA.Z[k]; } else { x = oA[ta * 4] + stA.X[k] * oA[ta * 4 + 2]; y = oA[ta * 4 + 1] + stA.Y[k]; z = stA.X[k] * oA[ta * 4 + 3] * .6; }
    if (A !== B) {
      const d1 = rnd[k * 5 + 1] * .1, ea = ease(cl((u - d1) / .4)), eb = ease(cl((u - .6 - d1) / .3));
      if (pl && ea > 0) { const x0 = pl.X[k], y0 = pl.Y[k], z0 = pl.Z[k], x1 = x0 * cY + z0 * sY, z1 = -x0 * sY + z0 * cY, y1 = y0 * cX - z1 * sX, z2 = y0 * sX + z1 * cX;
        x += (x1 - x) * ea; y += (y1 - y) * ea; z += (z2 - z) * ea; }
      if (eb > 0) { const tb = stB.T[k]; let bx, by, bz;
        if (tb < 0) { bx = stB.X[k]; by = stB.Y[k]; bz = stB.Z[k]; } else { bx = oB[tb * 4] + stB.X[k] * oB[tb * 4 + 2]; by = oB[tb * 4 + 1] + stB.Y[k]; bz = stB.X[k] * oB[tb * 4 + 3] * .6; }
        x += (bx - x) * eb; y += (by - y) * eb; z += (bz - z) * eb; }
    }
    // наклон всей фигуры за курсором (пока работа не проявилась)
    const x2 = x * cgy + z * sgy, z3 = -x * sgy + z * cgy, y2 = y * cgx - z3 * sgx, z4 = y * sgx + z3 * cgx;
    if (first || reduce) { PX[k] = x2; PY[k] = y2; PZ[k] = z4; VX[k] = VY[k] = VZ[k] = 0; }
    else {
      const sg = rnd[k * 5 + 2] > .5 ? sw : -sw, ex = x2 - PX[k], ey = y2 - PY[k];
      VX[k] = (VX[k] + ex * K * fr - ey * sg * fr) * damp; VY[k] = (VY[k] + ey * K * fr + ex * sg * fr) * damp; VZ[k] = (VZ[k] + (z4 - PZ[k]) * K * fr) * damp;
      PX[k] += VX[k] * fr; PY[k] += VY[k] * fr; PZ[k] += VZ[k] * fr;
    }
    const q = F / (F + PZ[k]), X = cx + PX[k] * sz * q, Y = cy + PY[k] * sz * q;
    if (!reduce) { const dx = X - S.mx, dy = Y - S.my, d2 = dx * dx + dy * dy;
      if (d2 < MR2) { const d = Math.sqrt(d2) || 1, fz = (1 - d / MR) * (1 - d / MR) * push * fr; VX[k] += dx / d * fz; VY[k] += dy / d * fz; } }
    const r3 = rnd[k * 5 + 2], s = (1 + r3 * 1.5) * q, lv = q > 1.04 ? 2 : q > .97 ? 1 : 0;
    paths[(r3 > .8 ? 3 : 0) + lv].rect(X - s / 2, Y - s / 2, s, s);
  }
  const AL = [.42, .7, .95];
  for (let b = 0; b < 6; b++) { ctx.fillStyle = b < 3 ? `rgb(${ink})` : acc; ctx.globalAlpha = AL[b % 3]; ctx.fill(paths[b]); }
  ctx.globalAlpha = 1;
}

function tick(now) { if (S.vis) { const a = performance.now(); frame(now); const d = performance.now() - a; S.ft = S.ft ? S.ft * .95 + d * .05 : d; } requestAnimationFrame(tick); }
// видео: вшитое base64 → Blob (iOS не играет data:-видео)
document.querySelectorAll('video[data-vid]').forEach((v) => { const s = document.getElementById('vid-' + v.dataset.vid); v.src = s ? URL.createObjectURL(new Blob([Uint8Array.from(atob(s.textContent.trim()), (c) => c.charCodeAt(0))], { type: 'video/mp4' })) : `assets/services/${v.dataset.vid}.mp4`; v.play().catch(() => {}); });
document.querySelectorAll('img').forEach((im) => im.decode && im.decode().catch(() => {}));
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fit, 150); });
document.fonts.ready.then(fit);
fit();
window.__svc = [{ el, get ft() { return S.ft; } }];
requestAnimationFrame(tick);
})();
