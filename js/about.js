// Секция «Обо мне» (#about) — sections-v3/about (port.mjs). Запускается, когда секция подходит к экрану.
(() => {
  const root = document.getElementById('about');
  if (!root) return;
  let done = false;
  function boot() {
    if (done) return;
    done = true;

const IMG = {"cut":"assets/about/cut.webp","posters":["assets/about/p02.webp","assets/about/p04.webp","assets/about/p08.webp","assets/about/p10.webp","assets/about/p12.webp","assets/about/p13.webp","assets/about/p17.webp","assets/about/p18.webp","assets/about/p20.webp","assets/about/p22.webp","assets/about/p24.webp","assets/about/p25.webp","assets/about/p26.webp","assets/about/p29.webp","assets/about/p30.webp","assets/about/p31.webp","assets/about/p32.webp","assets/about/p35.webp","assets/about/p37.webp","assets/about/p38.webp","assets/about/p39.webp","assets/about/p40.webp","assets/about/p41.webp","assets/about/p45.webp","assets/about/p46.webp","assets/about/p47.webp","assets/about/p48.webp","assets/about/p50.webp"],"logos":["assets/about/logo-zavod.webp","assets/about/logo-kegelbar.webp","assets/about/logo-kinza.webp","assets/about/logo-schukin.webp","assets/about/logo-volzhanka.webp","assets/about/logo-inproject.webp"],"sites":["assets/about/site-vostok.webp","assets/about/site-tverchefs.webp","assets/about/site-miravi.webp","assets/about/site-deepdiver.webp"],"clips":["assets/about/v-reel-afisha.mp4","assets/about/v-kinza-720.mp4","assets/about/v-reel-dish.mp4","assets/about/v-dd-main-1x1-loop.mp4","assets/about/v-dish.mp4"],"motion":"assets/about/m-afisha.mp4","film":{"voice":"assets/about/f-voice.mp4","dd":"assets/about/f-dd.mp4","dish":"assets/about/f-dish.mp4"}};
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = () => innerWidth <= 760;
// телефон — колода и сторис; выбор один раз при загрузке, иначе поворот в альбомную вернул бы кольцо и пин
// экран устройства считается только у пальца: ноутбук с масштабом 150 % отдаёт screen 1280×720 и телефоном не становится
const STACK = innerWidth <= 760 || (matchMedia('(pointer:coarse)').matches && Math.min(screen.width, screen.height) <= 760);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => 1 - Math.pow(1 - t, 3);
const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a, b, t) => a + (b - a) * t;
function rnd(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }
// ролик: в эскизе — голый base64 (→ Blob, iOS не играет data:-видео), на сайте — обычный путь к файлу
const blobUrl = (b64) => URL.createObjectURL(new Blob([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], { type: 'video/mp4' }));
const media = (s) => (/^(data:|https?:|\/|assets\/)/.test(s) ? s : blobUrl(s));
const CLIPS = IMG.clips.map(media), MOTION = media(IMG.motion);
const sec = document.querySelector('section.ab');

// ---------- цифры: счёт или табло
function setNum(el, val) {
  const v = +el.dataset.v, suf = el.dataset.suf || '', done = val >= v;
  if (sec.dataset.nums !== 'flip') { el.classList.remove('flip'); el.textContent = val + (done ? suf : ''); return; }
  el.classList.add('flip');
  const chars = String(val).padStart(String(v).length, '0').split('');
  if (suf) chars.push(done ? suf : ' ');
  if (el.children.length !== chars.length || !el.querySelector('.fc')) el.innerHTML = chars.map(() => '<span class="fc"><s></s></span>').join('');
  chars.forEach((c, i) => {
    const s = el.children[i].firstChild;
    el.children[i].classList.toggle('e', c === ' ');
    if (s.textContent !== c) { s.textContent = c; s.classList.remove('t'); void s.offsetWidth; s.classList.add('t'); }
  });
}
function playNum(el, delay = 0) {
  if (el.dataset.played) return; el.dataset.played = 1;
  const v = +el.dataset.v;
  if (RM) { setNum(el, v); return; }
  setTimeout(() => {
    if (sec.dataset.nums === 'flip') {
      const S = 12, len = String(v).length; let s = 0;
      const id = setInterval(() => { s++; if (s >= S) { setNum(el, v); clearInterval(id); return; } setNum(el, s < S * 0.6 ? Math.floor(Math.random() * 10 ** len) : Math.round(v * (s / S))); }, 80);
    } else {
      const t0 = performance.now(), D = 1500;
      const f = (t) => { const k = clamp((t - t0) / D); setNum(el, Math.round(v * ease(k))); if (k < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    }
  }, delay);
}

// ---------- мини-карточки автоматизаций (макет 240×320)
const AUTO = [
  `<div class="ac"><div class="ac-top"><i></i>Звонок · Кегельбар</div><div class="ac-dial">К</div><div class="ac-name">Кегель</div><div class="wave">${Array.from({ length: 14 }, (_, i) => `<i style="animation-delay:${(i * 0.13) % 0.9}s"></i>`).join('')}</div><div class="ac-say">«Дорожку на двоих, сегодня в восемь»</div><span class="ok">✓ бронь записана</span></div>`,
  `<div class="ac"><div class="ac-top"><i></i>Света · Завод</div>${[['q', 'Бильярд на девять вечера, на двоих?'], ['a', 'Стол свободен. Бронирую?'], ['q', 'Да, спасибо'], ['a', 'Готово, ждём в 21:00.']].map(([k, t], i) => `<div class="bub ${k}" style="animation-delay:${i * 0.9}s">${t}</div>`).join('')}</div>`,
  `<div class="ac"><div class="ac-top"><i></i>DeepDiver</div><div class="ac-name" style="text-align:left">ABC по меню</div><div class="abc"><div>A<u></u></div><div>B<u style="width:64%;animation-delay:.25s"></u></div><div>C<u style="width:30%;animation-delay:.5s"></u></div></div><div class="ac-sub" style="text-align:left">что убрать, что поднять в цене</div><div class="chips"><span>R-Keeper</span><span>iiko</span><span>StoreHouse</span></div></div>`,
  `<div class="ac"><div class="ac-top"><i></i>Накладная AI · Telegram</div><div class="doc"><b>накладная.pdf</b><i style="width:90%"></i><i style="width:70%"></i><i style="width:80%"></i><i style="width:50%"></i></div><div class="ac-sub">поставщик · сумма · отсрочка</div><span class="ok">✓ платёж в календаре</span></div>`,
];
const AUTO_TAG = ['голосовой бот', 'бот в VK и на сайте', 'аналитика', 'бот закупок'];

// карточка работы: P афиша · V ролик · A автоматизация · S сайт
function workCard(k, j, cls = '') {
  const c = document.createElement('div');
  if (k === 'P') { c.className = `card ${cls}`; c.innerHTML = `<img alt="" src="${IMG.posters[(j * 5) % IMG.posters.length]}">`; }
  if (k === 'V') { c.className = `card ${cls}`; c.innerHTML = `<video muted loop playsinline preload="none" src="${CLIPS[j % CLIPS.length]}"></video><span class="tagc">▶ моушен</span>`; }
  if (k === 'S') { c.className = `card s ${cls}`; c.innerHTML = `<div class="scr"><img alt="" src="${IMG.sites[j % IMG.sites.length]}"></div>`; }
  if (k === 'A') { c.className = `card a ${cls}`; c.innerHTML = AUTO[j % AUTO.length] + `<span class="tagc">${AUTO_TAG[j % AUTO.length]}</span>`; }
  return c;
}

// ---------- колода работ на телефоне: фото, имя, под ними стопка карт; смахнул — карта уходит вниз стопки
function buildDeck(st) {
  st.classList.add('stage--deck');
  st.innerHTML = `<div class="deck-ph"><div class="glow"></div><img alt="Владимир Козлов" src="${IMG.cut}"></div><svg class="deck-nm" viewBox="0 0 1000 400"><text class="l1" x="500" text-anchor="middle">ВЛАДИМИР</text><text class="l2" x="500" text-anchor="middle">КОЗЛОВ</text></svg><div class="ctr"><span class="n" data-v="30" data-suf="+"></span><small>проектов в HoReCa</small></div><div class="deck"></div><p class="deck-hint">Смахните карту вбок — следующая работа</p>`;
  const svg = st.querySelector('.deck-nm'), deck = st.querySelector('.deck'), ctr = st.querySelector('.ctr .n');
  fitLines(svg, [svg.querySelector('.l1'), svg.querySelector('.l2')], 1000, 18);
  const cw = Math.min(innerWidth * 0.56, 230), ch = cw * 1.34, cnt = { P: 0, V: 0, A: 0, S: 0 };
  deck.style.setProperty('--cw', cw + 'px'); deck.style.setProperty('--ch', ch + 'px');
  const order = [...'PVAPSVPA'].map((k, i) => {
    const el = workCard(k, cnt[k]++, 'deck-c'); deck.append(el);
    const ac = el.querySelector('.ac'); if (ac) ac.style.transform = `scale(${cw / 240})`;
    return { el, i, v: el.querySelector('video') };
  });
  let live = false;
  const flying = new Set(); // карта, улетевшая за край, в стопку не возвращается, пока не долетит
  // без движения ролик не играет: первый кадр вместо чёрного прямоугольника
  if (RM) order.forEach((c) => { if (c.v) { c.v.preload = 'metadata'; c.v.src += '#t=0.1'; } });
  // играет только верхняя карта, остальные и вся колода вне кадра держат анимации снятыми
  const sync = () => {
    deck.dataset.top = order[0].i; deck.classList.toggle('still', !live);
    order.forEach((c, p) => { c.el.classList.toggle('top', !p); if (!c.v) return; if (live && !p && !RM) c.v.play().catch(() => {}); else c.v.pause(); });
  };
  const place = (skip) => order.forEach((c, p) => {
    if (c.el === skip || flying.has(c)) return;
    const q = Math.min(p, 3), s = p % 2 ? 1 : -1;
    c.el.style.zIndex = order.length - p;
    c.el.style.opacity = p > 3 ? 0 : 1;
    c.el.style.transform = `translate3d(${s * q * 6}px,${q * 6}px,0) rotate(${p ? s * 3 : 0}deg)`;
  });
  const fling = (dir) => {
    const c = order.shift(); order.push(c);
    c.el.style.zIndex = order.length + 1;
    c.el.style.transform = `translate3d(${dir * innerWidth}px,0,0) rotate(${dir * 14}deg)`;
    flying.add(c); place(g?.el); sync();
    setTimeout(() => { flying.delete(c); c.el.style.transition = 'none'; place(g?.el); void c.el.offsetWidth; c.el.style.transition = ''; }, 320);
  };
  // вертикальный жест браузер забирает себе (touch-action: pan-y) и шлёт pointercancel
  let g = null;
  deck.addEventListener('pointerdown', (e) => {
    if (RM || g) return;
    deck.setPointerCapture(e.pointerId); // мышь в узком окне: отпустили за краем колоды, а жест всё равно закрылся
    g = { id: e.pointerId, x: e.clientX, dx: 0, el: order[0].el };
    g.el.style.transition = 'none';
  });
  deck.addEventListener('pointermove', (e) => {
    if (!g || g.id !== e.pointerId) return;
    g.dx = e.clientX - g.x;
    g.el.style.transform = `translate3d(${g.dx}px,0,0) rotate(${(g.dx * 0.05).toFixed(1)}deg)`;
  });
  const end = (e) => {
    if (!g || g.id !== e.pointerId) return;
    const { dx, el } = g; g = null; el.style.transition = '';
    if (e.type === 'pointerup' && Math.abs(dx) >= 60) fling(Math.sign(dx)); else place();
  };
  deck.addEventListener('pointerup', end);
  deck.addEventListener('pointercancel', end);
  place(); sync();
  new IntersectionObserver(([e]) => {
    live = e.isIntersecting; sync();
    if (live) { st.classList.add('in'); playNum(ctr, 300); }
  }, { threshold: 0.15 }).observe(deck);
  new IntersectionObserver(([e], io) => { if (e.isIntersecting) { st.classList.add('in'); io.disconnect(); } }, { threshold: 0.3 }).observe(st.querySelector('.deck-ph'));
  return { layout() {}, vids: [], frame() {} };
}

// ---------- кольцо работ
function buildRing(st) {
  const ORDER = phone() ? 'PVAPSVPAPVAPSP' : 'PVPAPSPVPAPPVAPSPVPAPV';
  const N = ORDER.length;
  st.innerHTML = `<div class="pin"><div class="glow"></div><svg class="nm" viewBox="0 0 1000 400"><text class="l1" x="500" text-anchor="middle">ВЛАДИМИР</text><text class="l2" x="500" text-anchor="middle">КОЗЛОВ</text></svg><div class="ring"></div><img class="cut" alt="Владимир Козлов" src="${IMG.cut}"><div class="ctr"><span class="n" data-v="30" data-suf="+"></span><small>проектов в HoReCa</small></div><div class="legend"><span>афиши</span><span><b>ролики</b></span><span>сайты</span><span><b>автоматизации</b></span></div></div>`;
  const pin = st.firstChild, ring = pin.querySelector('.ring'), ctr = pin.querySelector('.ctr .n'), legend = [...pin.querySelectorAll('.legend span')];
  const svg = pin.querySelector('.nm'), l1 = svg.querySelector('.l1'), l2 = svg.querySelector('.l2');
  fitLines(svg, [l1, l2], 1000, 18);
  const r = rnd(7), cards = [], cnt = { P: 0, V: 0, A: 0, S: 0 };
  [...ORDER].forEach((k, i) => {
    const c = workCard(k, cnt[k]++);
    ring.append(c);
    const a = r() * Math.PI * 2;
    cards.push({ el: c, k, dx: Math.cos(a), dy: Math.sin(a) - 0.3, rot: (r() - 0.5) * 40, d: i / N });
  });
  const vids = [...ring.querySelectorAll('video')];
  let W, H, cw, ch, last = -1, ps = -1, tPrev = 0;
  const layout = () => {
    W = pin.clientWidth; H = pin.clientHeight; cw = phone() ? 66 : clamp(W * 0.082, 92, 140); ch = cw * 1.34;
    cards.forEach((c) => {
      c.el.style.width = cw + 'px'; c.el.style.height = ch + 'px';
      const ac = c.el.querySelector('.ac'); if (ac) ac.style.transform = `scale(${cw / 240})`;
    });
    last = -1;
  };
  layout();
  return {
    layout, vids,
    frame(t) {
      const box = LOOP.box(st), top = box.top - scrollY, bottom = top + box.height;
      const target = RM ? 1 : clamp(-top / (box.height - LOOP.vh));
      if (bottom < -100 || top > LOOP.vh + 100) { ps = target; tPrev = t; return; } // кольцо вне экрана — не считаем
      // сцена догоняет прокрутку с затуханием: колесо крутит рывками, карточки — нет
      const dt = Math.min(0.05, (t - (tPrev || t)) / 1000); tPrev = t;
      ps = ps < 0 || RM ? target : ps + (target - ps) * (1 - Math.exp(-dt * 3.6));
      const p = ps;
      if (Math.abs(p - last) < 0.0002) return; last = p;
      const cx = W / 2, cy = H * (phone() ? 0.6 : 0.54), rx = phone() ? W * 0.5 : Math.min(W * 0.44, 700), ry = H * 0.17;
      cards.forEach((c, i) => {
        const th = (i / N) * Math.PI * 2 + p * 2.6 + 0.4, depth = Math.sin(th);
        const x = cx + rx * Math.cos(th), y = cy + ry * depth, s = 0.72 + 0.38 * (depth + 1) / 2;
        // у каждой карточки своё окно полёта (шире и с мягким стартом и посадкой)
        const q = smoother(clamp((p - c.d * 0.45) / 0.5));
        const fx = x + c.dx * W * 0.6, fy = y + c.dy * H * 0.65;
        const X = lerp(fx, x, q) - cw / 2, Y = lerp(fy, y, q) - ch / 2, S = lerp(s * 1.7, s, q), R = lerp(c.rot, Math.cos(th) * -9, q);
        c.el.style.transform = `translate3d(${X.toFixed(1)}px,${Y.toFixed(1)}px,0) rotate(${R.toFixed(1)}deg) scale(${S.toFixed(3)})`;
        c.el.style.opacity = smoother(clamp(q * 1.6)).toFixed(3);
        c.el.style.zIndex = depth > 0 ? 30 : 10;
        c.el.style.setProperty('--sh', (0.5 - depth * 0.5) * 0.6);
      });
      const e = smoother(clamp(p * 2));
      l1.setAttribute('transform', `translate(${((1 - e) * -420).toFixed(1)} 0)`); l1.style.opacity = e;
      l2.setAttribute('transform', `translate(${((1 - e) * 420).toFixed(1)} 0)`); l2.style.opacity = e;
      ctr.dataset.played = 1; setNum(ctr, Math.round(30 * clamp(p / 0.72)));
      legend.forEach((s, i) => s.classList.toggle('on', p > 0.3 + i * 0.1));
    },
  };
}

// подгон строк имени под ширину
function fitLines(svg, lines, W, gap) {
  let y = 0;
  lines.forEach((t, i) => {
    t.setAttribute('font-size', 100);
    const w = t.getComputedTextLength() || 500, fs = 100 * (W - 20) / w, cap = fs * 0.74;
    y += (i ? gap : 0) + cap;
    t.setAttribute('font-size', fs.toFixed(1)); t.setAttribute('y', y.toFixed(1));
  });
  svg.setAttribute('viewBox', `0 0 ${W} ${(y + 6).toFixed(1)}`);
}

// ---------- живые ячейки сетки
const CHAT = [['q', 'Бильярд на девять вечера, на двоих?'], ['a', 'Стол свободен. Бронирую?'], ['q', 'Да, спасибо'], ['a', 'Готово, ждём в 21:00.']];
function runChat(box) {
  let i = 0, alive = true;
  const step = () => {
    if (!alive) return;
    if (i === CHAT.length) { setTimeout(() => { box.innerHTML = ''; i = 0; step(); }, 2600); return; }
    const [k, t] = CHAT[i++], m = document.createElement('div');
    m.className = `m ${k} typing`; box.append(m);
    let c = 0;
    const id = setInterval(() => { m.textContent = t.slice(0, ++c); if (c >= t.length) { clearInterval(id); m.classList.remove('typing'); setTimeout(step, 700); } }, RM ? 0 : 34);
  };
  step();
  return () => { alive = false; };
}
function runSites(cell) {
  const scr = cell.querySelector('.scr'), names = [...cell.querySelectorAll('.slist span')];
  scr.innerHTML = IMG.sites.map((s) => `<img alt="" src="${s}">`).join('');
  const imgs = [...scr.children]; let k = 0;
  const show = () => { imgs.forEach((im, i) => im.classList.toggle('on', i === k)); names.forEach((n, i) => n.classList.toggle('on', i === k)); k = (k + 1) % imgs.length; };
  show(); if (!RM) { let on = false; new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(cell); setInterval(() => { if (on && !document.hidden) show(); }, 4200); }
}

function mountCells() {
  if (!sec.querySelector('.bento')) return; // сетка круга 3 есть только в эскизе
  sec.querySelector('.logos').innerHTML = IMG.logos.map((l, i) => `<div><img alt="" src="${l}" style="--d:${i * 0.9}s"></div>`).join('');
  sec.querySelector('.reel').innerHTML = `<video muted loop playsinline preload="none" src="${MOTION}"></video>`;
  runSites(sec.querySelector('.c-sites'));
  let chatOn = false;
  const cells = [...sec.querySelectorAll('.cell')];
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const c = e.target, idx = cells.indexOf(c);
    c.style.setProperty('--d', (idx % 3) * 0.08 + 's'); c.classList.add('in');
    c.querySelectorAll('.n').forEach((n, i) => playNum(n, 250 + i * 150));
    if (c.classList.contains('c-voice') && !chatOn) { chatOn = true; runChat(c.querySelector('.chat')); }
    io.unobserve(c);
  }), { threshold: 0.2 });
  cells.forEach((c) => io.observe(c));
}

// ---------- плёнка
const SUBS = [['Гость', 'Бильярд на девять вечера, на двоих?'], ['Света · Завод', 'Стол свободен. Бронирую?'], ['Гость', 'Да, спасибо'], ['Света · Завод', 'Готово, ждём в 21:00.'],
  ['Гость', 'Дорожку на двоих, сегодня в восемь'], ['Кегель · Кегельбар', 'Бронь записана: сегодня, 20:00, два гостя.']];
function runSubs(box, live = () => true) {
  const who = box.querySelector('small'), p = box.querySelector('p'); let k = 0;
  const line = () => {
    if (!live()) { setTimeout(line, 800); return; } // панель не на экране: диалог ждёт, а не тикает впустую
    const [w, t] = SUBS[k]; k = (k + 1) % SUBS.length;
    who.textContent = w; who.classList.toggle('bot', w !== 'Гость');
    p.innerHTML = t.split(' ').map((s) => `<span>${s}</span>`).join(' ');
    const ws = [...p.children]; let i = 0;
    const id = setInterval(() => {
      ws.forEach((s, j) => { s.classList.toggle('on', j <= i); s.classList.toggle('cur', j === i); });
      if (++i > ws.length) { clearInterval(id); if (!RM) setTimeout(line, 1300); } // без движения одна реплика стоит
    }, RM ? 0 : 230);
  };
  line();
}
function buildFilm() {
  const film = sec.querySelector('.film'), track = film.querySelector('.track'), panels = [...track.children], bar = [...film.querySelectorAll('.fbar span')];
  const FV = { voice: media(IMG.film.voice), dd: media(IMG.film.dd), dish: media(IMG.film.dish) };
  const watch = (v) => { if (!STACK || RM) vio.observe(v); }; // в сторис роликами управляет смена панели
  film.querySelectorAll('video[data-film]').forEach((v) => { v.src = FV[v.dataset.film]; watch(v); });
  const f9 = film.querySelector('.float9'); f9.innerHTML = `<video muted loop playsinline preload="none" src="${MOTION}"></video>`; watch(f9.firstChild);
  // 01: стена — ряды логотипов и афиш, каждый ряд продублирован для бесшовной петли
  const L = IMG.logos, P = IMG.posters;
  film.querySelector('.wall-in').innerHTML = [0, 1, 2, 3].map((r) => {
    // 8 плиток (чётно — чередование логотип/афиша не ломается на стыке копий); 4 разных логотипа в ряду, первый и последний не совпадают
    const items = Array.from({ length: 8 }, (_, i) => {
      const j = i >> 1;
      return (i + r) % 2 === 0 ? `<div class="wt lg"><img alt="" src="${L[(j + r * 3) % L.length]}"></div>` : `<div class="wt"><img alt="" src="${P[((r * 4 + j) * 3) % P.length]}"></div>`;
    }).join('');
    return `<div class="wrow">${items}${items}</div>`;
  }).join('');
  // 03: Парето — столбики по убыванию, кумулятивная кривая, зоны A/B/C (схема, без чисел)
  const par = film.querySelector('.pareto'), hs = [100, 74, 56, 40, 30, 22, 16, 12, 9, 7], bw = 600 / hs.length;
  let acc = 0; const tot = hs.reduce((a, b) => a + b), pts = [];
  par.innerHTML = hs.map((h, i) => {
    acc += h; pts.push([i * bw + bw / 2, 130 - (acc / tot) * 125]);
    const c = i < 3 ? '#C4985A' : i < 6 ? 'rgba(196,152,90,.5)' : 'rgba(196,152,90,.2)';
    return `<rect x="${i * bw + 6}" y="${130 - h * 1.25}" width="${bw - 12}" height="${h * 1.25}" rx="4" fill="${c}" style="transition-delay:${i * 0.07}s"/>`;
  }).join('') + `<path d="M${pts.map((q) => q.join(' ')).join(' L')}"/>` +
    `<text x="4" y="150" class="s">A — оставить</text><text x="${bw * 3 + 6}" y="150" class="s">B — поднять цену</text><text x="${bw * 6 + 6}" y="150" class="s">C — убрать</text>`;
  const ppath = par.querySelector('path'), pl = ppath.getTotalLength(); ppath.style.strokeDasharray = pl; ppath.style.strokeDashoffset = pl;
  // 04: веер телефонов
  const names = ['Восток 24', 'Ассоциация кулинаров', 'Miravi', 'DeepDiver'];
  film.querySelector('.phones').innerHTML = IMG.sites.map((s, i) => `<div class="fph" style="left:${i * 24}%;transform:rotateY(-20deg) translateZ(${-i * 40}px) translateY(${i * 3}%);z-index:${4 - i}"><div class="scr"><img alt="" src="${s}" style="animation-delay:${-i * 3}s"></div><b>${names[i]}</b></div>`).join('');
  // 02: круг звука вокруг цифры
  const cv = film.querySelector('.dial'), cx = cv.getContext('2d');
  const drawDial = (t) => {
    const W = cv.width, R = W * 0.3; cx.clearRect(0, 0, W, W); cx.save(); cx.translate(W / 2, W / 2);
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2, n = Math.abs(Math.sin(t * 2.4 + i * 0.55) * Math.sin(t * 1.3 + i * 0.21));
      const len = 8 + n * W * 0.13;
      cx.strokeStyle = `rgba(196,152,90,${0.25 + n * 0.6})`; cx.lineWidth = 3; cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(Math.cos(a) * R, Math.sin(a) * R); cx.lineTo(Math.cos(a) * (R + len), Math.sin(a) * (R + len)); cx.stroke();
    }
    cx.strokeStyle = 'rgba(243,217,169,.35)'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(0, 0, R - 10, 0, Math.PI * 2); cx.stroke();
    cx.restore();
  };
  const pars = panels.map((pn) => [...pn.querySelectorAll('[data-par]')].map((e) => [e, +e.dataset.par]));
  const tl = film.querySelector('.tl');
  let travel = 0, subsOn = false, subsLive = () => true, fp = -1, ftPrev = 0;
  let pxs = [];
  // панель вошла в кадр: цифры, субтитры, кривая
  const enter = (pn, i) => {
    if (pn.classList.contains('in')) return;
    pn.classList.add('in');
    pn.querySelectorAll('.n').forEach((el, j) => playNum(el, 150 + j * 150));
    if (i === 1 && !subsOn) { subsOn = true; runSubs(pn.querySelector('.subs'), () => subsLive()); }
    if (i === 2) { ppath.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1) .5s'; ppath.style.strokeDashoffset = 0; }
  };
  // сторис на телефоне: панели по одной, автопереход, пока блок в кадре; на последней стоим, там кнопка
  function stories() {
    const STEP = 5, last = panels.length - 1;
    film.classList.add('film--st');
    film.querySelector('.fpin').insertAdjacentHTML('afterbegin', `<div class="segs">${panels.map(() => '<i class="seg"><b></b></i>').join('')}</div>`);
    tl.style.setProperty('--tl', 1);
    if (RM) { panels.forEach(enter); return { layout() {}, frame() {} }; }
    const segs = [...film.querySelectorAll('.seg b')], vids = panels.map((pn) => [...pn.querySelectorAll('video')]);
    let on = -1, el = 0, vis = false, held = false, tPrev = 0, d = null;
    subsLive = () => vis && on === 1;
    const play = () => vids[on].forEach((v) => (vis ? v.play().catch(() => {}) : v.pause()));
    // цифры и кривая ждут первого показа: иначе панель 1 доигрывает, пока блок ещё за 1500 px от кадра
    const show = (i) => {
      if (on >= 0) { panels[on].classList.remove('on'); vids[on].forEach((v) => v.pause()); }
      on = i; el = 0; film.dataset.active = i;
      panels[i].classList.add('on'); if (vis) enter(panels[i], i);
      segs.forEach((s, j) => { s.style.transform = `scaleX(${j < i ? 1 : 0})`; });
      play();
    };
    show(0);
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) enter(panels[on], on); play(); }, { threshold: 0.5 }).observe(film);
    new IntersectionObserver(([e]) => film.classList.toggle('still', !e.isIntersecting)).observe(film);
    film.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a,button')) return;
      film.setPointerCapture(e.pointerId);
      d = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; held = true;
    });
    const up = (e) => {
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y, tap = Math.hypot(dx, dy) < 12 && performance.now() - d.t < 350;
      d = null; held = false;
      if (e.type !== 'pointerup') return;
      const r = film.getBoundingClientRect();
      // вперёд с последней — на первую, назад с первой — та же панель заново
      const step = (fwd) => show(fwd ? (on + 1) % panels.length : Math.max(on - 1, 0));
      if (tap) step(e.clientX > r.left + r.width / 2);
      else if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0);
    };
    film.addEventListener('pointerup', up);
    film.addEventListener('pointercancel', up);
    return {
      layout() {},
      frame(t) {
        const dt = Math.min(0.05, (t - (tPrev || t)) / 1000); tPrev = t;
        if (!vis) return;
        if (on === 1) drawDial(t / 1000);
        if (held) return;
        el = Math.min(STEP, el + dt);
        segs[on].style.transform = `scaleX(${(el / STEP).toFixed(3)})`;
        if (el >= STEP && on < last) show(on + 1);
      },
    };
  }
  if (STACK) return stories();
  const layout = () => { travel = track.scrollWidth - innerWidth; film.style.height = (RM ? 0 : travel + innerHeight * 1.3) + 'px'; pxs = panels.map((pn) => ({ l: pn.offsetLeft, w: pn.offsetWidth })); };
  layout();
  return {
    layout,
    frame(t) {
      if (RM) return;
      const box = LOOP.box(film), top = box.top - scrollY;
      if (top + box.height < -50 || top > LOOP.vh + 50) return;
      const target = clamp(-top / (box.height - LOOP.vh));
      const dt = Math.min(0.05, (t - (ftPrev || t)) / 1000); ftPrev = t;
      fp = fp < 0 ? target : fp + (target - fp) * (1 - Math.exp(-dt * 6));
      const p = fp, x = p * travel;
      track.style.transform = `translate3d(${(-x).toFixed(1)}px,0,0)`;
      const n = panels.length, pos = p * (n - 0.15);
      panels.forEach((pn, i) => {
        const lp = (pxs[i].l + pxs[i].w / 2 - x - LOOP.vw / 2) / LOOP.vw;
        // параллакс — через translate, чтобы не затирать transform самих слоёв (центровка, поворот)
        if (Math.abs(lp) < 1.2) pars[i].forEach(([e, k]) => (e.style.translate = `${(lp * k).toFixed(1)}px 0`));
        if (Math.abs(lp) < 0.5) enter(pn, i);
        if (i === 5) tl.style.setProperty('--tl', clamp(1 - lp * 2).toFixed(3));
        bar[i].style.setProperty('--f', clamp(pos - i + 0.5).toFixed(3));
        bar[i].classList.toggle('on', Math.abs(lp) < 0.5);
      });
      const dl = pxs[1].l - x;
      if (dl + pxs[1].w > 0 && dl < LOOP.vw) drawDial(t / 1000);
    },
  };
}

// видео играют, только пока видны
const vio = new IntersectionObserver((es) => es.forEach((e) => { const v = e.target; if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { rootMargin: '100px' });

// ---------- выбор (только в эскизе; на сайте ручек нет — значения берутся из data-* секции)
const KH = document.getElementById('k-h'), KN = document.getElementById('k-nums'), KL = document.getElementById('k-low'), line = document.getElementById('k-line');
function apply() {
  if (!KH) { sec.querySelectorAll('.film .n').forEach((n) => { if (!n.dataset.played) setNum(n, 0); }); return; }
  sec.dataset.h = KH.value; sec.dataset.nums = KN.value; sec.dataset.low = KL.value;
  sec.querySelectorAll('.bento .n, .film .n').forEach((n) => { delete n.dataset.played; setNum(n, +n.dataset.v); });
  line.textContent = `Обо мне: вихрь работ · низ — ${KL.value === 'film' ? 'плёнка' : 'сетка'} · заголовок ${KH.value} · цифры — ${KN.value === 'flip' ? 'табло' : 'счёт'}`;
  film?.layout();
}
if (KH) {
  KH.addEventListener('change', apply); KN.addEventListener('change', apply); KL.addEventListener('change', apply);
  document.getElementById('k-copy').addEventListener('click', (e) => { navigator.clipboard?.writeText(line.textContent); e.target.textContent = 'Скопировано'; setTimeout(() => (e.target.textContent = 'Скопировать'), 1400); });
}

let ring, film, wasPhone = phone();
// шрифт завис или ползёт по медленной сети: секция собирается без него, имя подгоняется, когда он придёт
const fontsIn = document.fonts ? document.fonts.ready : Promise.resolve();
Promise.race([fontsIn, new Promise((ok) => setTimeout(ok, 2500))]).then(() => {
  const st = sec.querySelector('.stage');
  ring = STACK ? buildDeck(st) : buildRing(st);
  ring.vids.forEach((v) => vio.observe(v));
  mountCells();
  sec.querySelectorAll('.bento video').forEach((v) => vio.observe(v));
  film = buildFilm();
  apply();
  fontsIn.then(() => sec.querySelectorAll('.deck-nm,.nm').forEach((svg) => fitLines(svg, [svg.querySelector('.l1'), svg.querySelector('.l2')], 1000, 18)));
  if (!(STACK && RM)) LOOP.add(sec, (t) => { ring.frame(t); film.frame(t); }); // без движения на телефоне кадровый цикл пуст и только будит отрисовку
  addEventListener('resize', () => {
    if (!STACK && phone() !== wasPhone) { wasPhone = phone(); ring.vids.forEach((v) => vio.unobserve(v)); ring = buildRing(st); ring.vids.forEach((v) => vio.observe(v)); }
    else ring.layout();
    film.layout();
  });
});

  }
  if (!('IntersectionObserver' in window)) { boot(); return; }
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); boot(); } }, { rootMargin: '1500px 0px' });
  io.observe(root);
  // телефон: колода и сторис ниже заготовки на ~730 px. Собранная на подходе секция укорачивала страницу над пальцем,
  // а Safari не держит позицию (нет scroll anchoring) — экран прыгал. Собираем заранее, в простое после загрузки.
  if (innerWidth <= 760 || Math.min(screen.width, screen.height) <= 760) {
    const early = () => { if (!done) { io.disconnect(); boot(); } };
    const idle = () => (window.requestIdleCallback ? requestIdleCallback(early, { timeout: 2500 }) : setTimeout(early, 1200));
    if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
  }
})();
