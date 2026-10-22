/* scene-auto.js — «Автоматизации»: сцена звонка из 10-го варианта, развитая, на векторной графике.
 * Кегель («Кегельбар») и Света («Завод») — круглые «циферблаты» звонка: кольцо прогресса, деления, орбита со спутником,
 * вокруг аватара — радиальная волна голоса того, кто говорит. Внизу волна во всю ширину, как в 10-м.
 * Распознанные слова обводятся от руки (SVG-лассо) и по нитям влетают во входы нейросети 3-4-2: импульсы бегут по рёбрам,
 * выход рождает чип брони → чип едет по маршруту в значок VK, где бронь выбивает страйк.
 * Следом бронь Светы стекает в ту же сеть, выходит вторым выходом и падает в Telegram.
 * Сеть, импульсы, кегли — на холсте волны и целиком функция времени (перемотка пальцем работает).
 * Время сцены — в долях исходного сценария u, сжатых в S раз: 8 с сценария играются за 6.5 с (a = 1.5).
 */
REEL.scene('auto', (c) => {
  if (c.mob && REEL.mobile.auto) return REEL.mobile.auto(c);
  const { tl, a, b, cam, W, H, $, $$ } = c;
  const S = 0.78, at = (u) => a + u * S, du = (x) => x * S;
  const GUEST = [['Дорожку ', 0], ['на четверых', 1], [', ', 0], ['сегодня', 2], [' в семь.', 0]];
  const BOT = [['Записал на ', 0], ['19:00', 3], ['. Ждём!', 0]];
  const KG = 'Бильярд на девять?', KK = 'Стол 3 ваш, 21:00.';
  const TOK = [[1, '4 игрока'], [2, 'сегодня'], [3, '19:00']];
  const WY = 0.905;                                           // линия волны (доля высоты кадра)
  const TICKS = 36;

  const PHONE = 'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z';
  const PLANE = 'M2.5 11.2 20.6 4c.8-.3 1.6.4 1.4 1.3l-3 14.2c-.2.8-1.1 1.1-1.7.7l-4.6-3.4-2.4 2.3c-.4.4-1.1.2-1.2-.4l-.9-4.4-5.6-1.8c-.9-.3-.9-1.5-.1-1.3zM9 13.4l.6 3.5 1.2-2.6 6.6-7.6z';
  const VK = 'M19.376 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z';
  const dial = () => `<svg class="dial" viewBox="-70 -70 140 140" aria-hidden="true">
      <g class="orbit"><circle r="67"/><circle class="sat" cx="0" cy="-67" r="3.6"/></g>
      <g class="ticks">${Array.from({ length: TICKS }, (_, i) => `<line x1="0" y1="-57" x2="0" y2="-52" transform="rotate(${(i * 360) / TICKS})"/>`).join('')}</g>
      <circle class="trk" r="61"/><circle class="arc" r="61" pathLength="1" transform="rotate(-90)"/></svg>`;
  const who = (cls, img, nm, rl, extra) => `
    <div class="it au-who ${cls}">
      <div class="orb">${dial()}<span class="av z"><img src="assets/clients/${img}.webp" alt=""><i class="ring"></i><i class="ring r2"></i></span>
        <span class="badge"><svg viewBox="0 0 24 24"><path class="hs" d="${PHONE}"/><path class="ok" d="M5 12.5l4.5 4.5L19 7.5"/></svg></span></div>
      <div class="txt"><b class="nm">${nm}</b><span class="rl">${rl}</span>
        <span class="status caps"><i class="dot"></i><span class="stt"></span><span class="tcc">00:00</span></span>${extra}</div>
    </div>`;
  const TAIL = '<svg class="tail" viewBox="0 0 20 16" aria-hidden="true"><path d="M0 0h9c1 6 5 11 11 16C10 16 3 12 0 6z"/></svg>';
  const LASSO = '<svg class="lasso" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M14 31C3 25 6 9 31 5c26-4 61-1 64 13 3 14-29 19-53 18-22-1-36-6-34-16 1-6 8-11 18-13"/></svg>';
  const emb = (cls, path, lb) => `<div class="em ${cls}"><i class="pulse"></i><span class="disc"><svg viewBox="0 0 24 24"><path d="${path}"/></svg></span><b class="cnt">0</b><span class="lb caps">${lb}</span></div>`;

  cam.innerHTML = `
    <canvas class="au-wave"></canvas>
    <svg class="au-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">${TOK.map(() => '<path class="thr" pathLength="1"/>').join('')}<path class="route r1" pathLength="1"/><path class="route r2" pathLength="1"/><path class="route r3" pathLength="1"/></svg>
    ${who('au-kegel', 'kegelbar', 'Кегель', 'голосовой бот «Кегельбара»', '')}
    ${who('au-sveta', 'zavod', 'Света', 'голосовой бот «Завода»', '<div class="tr"><p class="g"><b class="caps">гость</b><span></span></p><p class="k"><b class="caps">Света</b><span></span></p></div>')}
    <div class="it caps au-note">{ пример диалога }</div>
    <div class="it au-bub au-in">${TAIL}<span class="who caps">Гость</span><span class="tx"></span></div>
    <div class="it au-bub au-out">${TAIL}<span class="who caps">Кегель</span><span class="tx"></span></div>
    <div class="it au-tg">
      <div class="msgs"><span class="idle">Ждёт заявку…</span>
        <div class="msg m2">${TAIL}<b>Завод · бильярд, стол 3</b><span>сегодня · 21:00 · приняла Света ✓</span></div>
        <div class="msg m1">${TAIL}<b>Кегельбар · дорожка</b><span>4 игрока · 19:00 · записал Кегель ✓</span></div></div>
      <div class="ems">${emb('tgm', PLANE, 'Telegram')}${emb('vkm', VK, 'VK')}</div>
    </div>
    <div class="it caps au-nnc">нейросеть · разбор речи</div>
    ${TOK.map(([, s]) => `<span class="au-tok caps">${s}</span>`).join('')}
    <span class="au-tok caps t2">бильярд · 21:00</span>
    <div class="au-chip c1 caps">Дорожка · 4 · 19:00</div>
    <div class="au-chip c2 caps">Стол 3 · 21:00</div>
    <canvas class="au-wave au-top"></canvas>`;

  const kegel = $('.au-kegel', cam), sveta = $('.au-sveta', cam), note = $('.au-note', cam), bIn = $('.au-in', cam), bOut = $('.au-out', cam), tg = $('.au-tg', cam), nnc = $('.au-nnc', cam);
  const toks = $$('.au-tok:not(.t2)', cam), tok2 = $('.au-tok.t2', cam), chip1 = $('.c1', cam), chip2 = $('.c2', cam), m1 = $('.m1', tg), m2 = $('.m2', tg);
  const vk = $('.vkm', tg), tgm = $('.tgm', tg);
  const thr = $$('.thr', cam), route1 = $('.r1', cam), route2 = $('.r2', cam), route3 = $('.r3', cam);
  // нижний холст — волна и сеть под репликами; верхний — страйк поверх значков и сообщений
  const dpr = Math.min(2, devicePixelRatio || 1);
  const topCv = $('.au-top', cam), [g, gt] = [$('.au-wave', cam), topCv].map((cv) => { cv.width = W * dpr; cv.height = H * dpr; const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return x; });

  // реплики: текст целиком (ещё не напечатанное прозрачно и держит размер), ключевые слова — в своих спанах с лассо
  const fill = (el, parts) => { $('.tx', el).innerHTML = parts.map(([s, k]) => (k ? `<i class="kw" data-k="${k}">` : '<i>') + [...s].map((ch) => `<span>${ch}</span>`).join('') + (k ? LASSO : '') + '</i>').join(''); };
  fill(bIn, GUEST); fill(bOut, BOT);
  const chIn = $$('.tx > i > span', bIn), chOut = $$('.tx > i > span', bOut);
  // координаты в кадре сцены (до трансформов)
  const pos = (el) => { let x = 0, y = 0, e = el; while (e && e !== cam) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y, w: el.offsetWidth, h: el.offsetHeight, cx: x + el.offsetWidth / 2, cy: y + el.offsetHeight / 2 }; };
  const kwPos = (k) => pos($(`.kw[data-k="${k}"]`, cam));
  const waveY = H * WY;
  const E1 = pos($('.disc', vk)), E2 = pos($('.disc', tgm)), K = pos($('.txt', sveta)), oL = pos($('.orb', kegel)), oK = pos($('.orb', sveta));

  /* ── нейросеть 3-4-2: между репликами и кнопкой ── */
  const pIn = pos(bIn), pOut = pos(bOut);
  const gx0 = Math.max(pIn.x + pIn.w, pOut.x + pOut.w) + W * 0.035, gx1 = Math.min(gx0 + W * 0.1, W * 0.385);
  const gy0 = pIn.y + pIn.h * 0.15, gy1 = pOut.y + pOut.h * 0.9;
  const layer = (n, x, pad) => Array.from({ length: n }, (_, i) => ({ x, y: gy0 + pad + ((gy1 - gy0 - 2 * pad) * (n === 1 ? 0.5 : i / (n - 1))) }));
  const NI = layer(3, gx0, (gy1 - gy0) * 0.12), NH = layer(4, (gx0 + gx1) / 2, 0), NO = layer(2, gx1, (gy1 - gy0) * 0.26);
  const EIH = [], EHO = [];
  NI.forEach((p, i) => NH.forEach((q, j) => EIH.push({ i, j, p, q, h: (i * 4 + j) * 0.37 % 1 })));
  NH.forEach((p, j) => NO.forEach((q, o) => EHO.push({ j, o, p, q, h: (j * 2 + o) * 0.53 % 1 })));
  nnc.style.left = gx0 - 4 + 'px'; nnc.style.top = gy1 + 14 + 'px';
  // два прогона сети: бронь Кегеля (все входы, первый выход, золото) и Светы (средний вход, второй выход, зелень)
  const FIRES = [
    { arr: [3.25, 3.32, 3.39], ins: [0, 1, 2], o: 0, col: '#C4985A' },
    { arr: [0, 6.1, 0], ins: [1], o: 1, col: '#3A4A3D' }
  ];
  FIRES.forEach((f) => { f.s = Math.max(...f.ins.map((i) => f.arr[i])); f.hid = f.s + 0.2; f.out = f.s + 0.38; });
  const O0 = NO[0], O1 = NO[1];

  // нити от слов ко входам сети и маршруты: выходы → значки, Света → вход сети
  TOK.forEach(([k], i) => {
    const p = kwPos(k), q = NI[i];
    thr[i].setAttribute('d', `M${p.cx} ${p.cy}C${p.cx + 60} ${p.cy - 50} ${q.x - 70} ${q.y - 40} ${q.x} ${q.y}`);
  });
  route1.setAttribute('d', `M${O0.x} ${O0.y}C${O0.x + 110} ${waveY} ${W * 0.6} ${waveY + 12} ${W * 0.76} ${waveY - 4}S${E1.cx - 10} ${E1.cy + 90} ${E1.cx} ${E1.cy}`);
  const k0 = { x: K.x + K.w * 0.55, y: K.y + K.h + 22 };
  route2.setAttribute('d', `M${k0.x} ${k0.y}C${k0.x - 80} ${k0.y + 220} ${NI[1].x + 300} ${NI[1].y - 250} ${NI[1].x} ${NI[1].y}`);
  route3.setAttribute('d', `M${O1.x} ${O1.y}C${O1.x + 90} ${O1.y + 50} ${W * 0.55} ${waveY - 34} ${W * 0.7} ${waveY - 30}S${E2.cx - 20} ${E2.cy + 80} ${E2.cx} ${E2.cy}`);

  // элемент едет по пути; путь прочерчивается за ним следом (pathLength = 1)
  const follow = (el, path, u0, uDur, ease, trail = true) => {
    const L = path.getTotalLength(), o = { p: 0 };
    const place = () => { const q = path.getPointAtLength(L * o.p); gsap.set(el, { x: q.x, y: q.y }); if (trail) path.style.strokeDashoffset = 1 - o.p; };
    tl.fromTo(o, { p: 0 }, { p: 1, duration: du(uDur), ease, immediateRender: false, onUpdate: place, onStart: place }, at(u0));
  };

  /* ── исходные ── */
  tl.set([kegel, sveta, note, bIn, bOut, tg, nnc], { opacity: 0, x: 0, y: 0, scale: 1 }, 0);
  tl.set([chip1, chip2], { opacity: 0, scale: 0.3, xPercent: -50, yPercent: -50 }, 0);
  tl.set(chip1, { x: O0.x, y: O0.y }, 0);
  tl.set(chip2, { x: O1.x, y: O1.y }, 0);
  tl.set([...toks, tok2], { opacity: 0, x: 0, y: 0, scale: 1, xPercent: -50, yPercent: -50 }, 0);
  tl.set([m1, m2], { opacity: 0, y: 14, height: 0 }, 0);
  tl.set($('.idle', tg), { opacity: 1 }, 0);
  tl.set([...thr, route1, route2, route3], { strokeDashoffset: 1, opacity: 1 }, 0);
  tl.set($$('.lasso path', cam), { strokeDashoffset: 1 }, 0);
  tl.set($$('.kw', cam), { '--hl': 0 }, 0);
  tl.set($$('.pulse', tg), { scale: 0.6, opacity: 0 }, 0);
  tl.set($$('.disc', tg), { rotation: 0, x: 0, y: 0 }, 0);

  /* ── вход: циферблаты и значки — в течение ролика; реплики — на долях с пружиной ── */
  c.cutIn([kegel, sveta, tg], a);
  [kegel, sveta].forEach((w, i) => tl.fromTo($('.dial', w), { rotation: -120, scale: 0.6 }, { rotation: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)', immediateRender: false }, a + 0.05 + i * 0.08));
  tl.set(note, { opacity: 1, x: 0 }, at(0.5));
  tl.to(nnc, { opacity: 1, duration: 0.3 }, at(0.7));
  [[bIn, 0.5], [bOut, 1.6]].forEach(([el, u]) => {
    tl.set(el, { opacity: 1, x: 0 }, at(u));
    tl.fromTo(el, { y: 18, scale: 0.85, transformOrigin: el === bIn ? '0% 100%' : '100% 100%' }, { y: 0, scale: 1, duration: 0.45, ease: 'back.out(2.2)', immediateRender: false }, at(u));
  });

  /* ── распознавание: слова обводятся от руки и по нитям влетают во входы сети ── */
  tl.to($$('.lasso path', cam), { strokeDashoffset: 0, duration: 0.32, ease: 'power2.inOut', stagger: 0.07 }, at(2.4));
  tl.to($$('.kw', cam), { '--hl': 1, duration: 0.25, stagger: 0.07 }, at(2.4));
  TOK.forEach(([k], i) => {
    const p = kwPos(k), u0 = 2.75 + i * 0.07;
    tl.set(toks[i], { x: p.cx, y: p.cy, opacity: 1, scale: 1 }, at(u0));
    tl.fromTo(toks[i], { scale: 1.25 }, { scale: 1, duration: 0.3, ease: 'back.out(3)', immediateRender: false }, at(u0));
    follow(toks[i], thr[i], u0, 0.5, 'power2.inOut');
    tl.to(toks[i], { scale: 0.2, opacity: 0, duration: 0.1, ease: 'power3.in' }, at(FIRES[0].arr[i]) - 0.06);
  });
  tl.to(thr, { opacity: 0, duration: 0.3 }, at(3.5));
  // выход сети рождает чип; чип едет вдоль волны и ныряет в значок
  const dive = (chip, path, u0, uDur, keep) => {
    follow(chip, path, u0, uDur, 'power2.inOut');
    tl.to(chip, { scale: 0.35, opacity: 0, duration: 0.12, ease: 'power2.in' }, at(u0 + uDur) - 0.1);
    tl.to(path, { opacity: keep, duration: 0.4 }, at(u0 + uDur));
  };
  tl.to(chip1, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, at(FIRES[0].out));
  dive(chip1, route1, FIRES[0].out + 0.07, 0.95, 0.32);
  const msgIn = (m, em, u) => {
    const T = at(u), disc = $('.disc', em);
    tl.to($('.idle', tg), { opacity: 0, duration: 0.12 }, T);
    tl.to(m, { height: 'auto', duration: 0.35, ease: 'expo.out' }, T);
    tl.to(m, { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.8)' }, T + 0.05);
    tl.fromTo($('.pulse', em), { scale: 0.6, opacity: 0.8 }, { scale: 2.2, opacity: 0, duration: 0.6, ease: 'power3.out', immediateRender: false }, T);
    tl.fromTo(disc, { rotation: 0, x: 0, y: 0 }, { rotation: -16, x: 7, y: -7, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, T);
  };
  const U_VK = FIRES[0].out + 0.07 + 0.95, U_TG = 7.25;
  msgIn(m1, vk, U_VK);

  /* ── параллельно: Света «Завода» принимает свою бронь, бронь стекает в ту же сеть ── */
  tl.set(tok2, { x: k0.x, y: k0.y, opacity: 1 }, at(5.7));
  tl.fromTo(tok2, { scale: 0.4 }, { scale: 1, duration: 0.25, ease: 'back.out(3)', immediateRender: false }, at(5.7));
  follow(tok2, route2, 5.7, 0.4, 'power2.in');
  tl.to(tok2, { scale: 0.2, opacity: 0, duration: 0.08 }, at(6.1) - 0.04);
  tl.to(route2, { opacity: 0, duration: 0.3 }, at(6.12));
  tl.to(chip2, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(3)' }, at(FIRES[1].out));
  dive(chip2, route3, FIRES[1].out + 0.04, U_TG - FIRES[1].out - 0.04, 0.32);
  msgIn(m2, tgm, U_TG);

  tl.fromTo(cam, { scale: 1 }, { scale: 1.025, duration: b - a, ease: 'none' }, a);
  c.cutOut([kegel, sveta, note, bIn, bOut, tg, chip1, chip2, nnc], b);
  tl.to($('.au-svg', cam), { opacity: 0, duration: 0.2 }, b);
  tl.set($('.au-svg', cam), { opacity: 1 }, 0);

  /* ── время: печать реплик, статусы, кольца, счётчики, волны, сеть, кегли ── */
  const L = { el: kegel, stt: $('.stt', kegel), tcc: $('.tcc', kegel), arc: $('.arc', kegel), ticks: $$('.ticks line', kegel), orbit: $('.orbit', kegel) };
  const Kr = { el: sveta, stt: $('.stt', sveta), tcc: $('.tcc', sveta), arc: $('.arc', sveta), ticks: $$('.ticks line', sveta), orbit: $('.orbit', sveta) };
  const kg = $('.tr .g span', sveta), kk = $('.tr .k span', sveta), cVK = $('.cnt', vk), cTG = $('.cnt', tgm);
  const cl = (x) => Math.max(0, Math.min(1, x));
  let sig = '';
  const dialSet = (d, p, t, dir) => {
    d.arc.style.strokeDashoffset = 1 - p;
    const n = Math.round(p * TICKS);
    if (d.n !== n) { d.n = n; d.ticks.forEach((l, i) => l.classList.toggle('on', i < n)); }
    d.orbit.setAttribute('transform', `rotate(${(t * 40 * dir) % 360})`);
  };
  REEL.onRender((t) => {
    const u = (t - a) / S, end = (b - a) / S;
    if (u < -0.6 || u > end + 0.2) { if (sig !== 'off') { g.clearRect(0, 0, W, H); gt.clearRect(0, 0, W, H); sig = 'off'; } return; }
    const k1 = Math.round(cl((u - 0.6) / 0.85) * chIn.length), k2 = Math.round(cl((u - 1.7) / 0.6) * chOut.length);
    const q1 = Math.round(cl((u - 4.6) / 0.5) * KG.length), q2 = Math.round(cl((u - 5.2) / 0.5) * KK.length);
    const s = [k1, k2, q1, q2, Math.floor(u * 2)].join('|');
    if (s !== sig) {
      sig = s;
      chIn.forEach((ch, i) => ch.classList.toggle('on', i < k1)); chOut.forEach((ch, i) => ch.classList.toggle('on', i < k2));
      kg.textContent = KG.slice(0, q1); kk.textContent = KK.slice(0, q2);
      L.stt.textContent = u < 0.45 ? 'Входящий' : u < 2.5 ? 'На линии' : 'Бронь создана';
      L.tcc.textContent = '00:' + String(Math.max(0, Math.min(59, Math.floor((u - 0.45) * 2.4)))).padStart(2, '0');
      Kr.stt.textContent = u < 4.2 ? 'Ждёт звонка' : u < 4.5 ? 'Входящий' : u < 5.9 ? 'На линии' : 'Бронь создана';
      Kr.tcc.textContent = '00:' + String(Math.max(0, Math.min(59, Math.floor((u - 4.5) * 2.4)))).padStart(2, '0');
      kegel.classList.toggle('ringing', u < 0.45); kegel.classList.toggle('done', u >= 2.5);
      sveta.classList.toggle('ringing', u >= 4.2 && u < 4.5); sveta.classList.toggle('done', u >= 5.9); sveta.classList.toggle('live', u >= 4.2);
      cVK.textContent = u >= U_VK ? 1 : 0; cTG.textContent = u >= U_TG ? 1 : 0;
      vk.classList.toggle('has', u >= U_VK); tgm.classList.toggle('has', u >= U_TG);
    }
    dialSet(L, cl((u - 0.45) / 2.05), t, 1);
    dialSet(Kr, cl((u - 4.5) / 1.4), t, -1);
    draw(u, t, end);
  });

  // кто говорит: [сила, центр нижней волны, цвет, чей циферблат]
  const env = (u) => {
    if (u < 0.45) return [0.08 + 0.08 * Math.abs(Math.sin(u * 26)), 0.25, '#2D2419', 'L'];
    if (u >= 0.6 && u < 1.5) return [0.85, 0.22, '#2D2419', 'L'];
    if (u >= 1.7 && u < 2.35) return [0.95, 0.3, '#C26B4A', 'L'];
    if (u >= 4.6 && u < 5.1) return [0.75, 0.78, '#2D2419', 'K'];
    if (u >= 5.2 && u < 5.75) return [0.9, 0.76, '#3A4A3D', 'K'];
    return [0.2 + 0.06 * Math.sin(u * 5), 0.5, '#7A6B56', ''];   // между репликами линия дышит, а не пропадает
  };
  // радиальная волна вокруг аватара: штрихи наружу от кольца
  const radial = (o, amp, col, t, fade, seed) => {
    const cx = o.cx, cy = o.cy, R = o.w / 2 + 6, n = 72;
    g.strokeStyle = col; g.lineWidth = 2; g.lineCap = 'round'; g.globalAlpha = 0.9 * fade;
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
      const s1 = Math.abs(Math.sin(i * 1.7 + t * 9.4 + seed)) * Math.abs(Math.sin(i * 0.37 - t * 4.3));
      const len = 2 + R * 0.42 * amp * (0.25 + 0.75 * s1);
      const ca = Math.cos(ang), sa = Math.sin(ang);
      g.moveTo(cx + ca * R, cy + sa * R); g.lineTo(cx + ca * (R + len), cy + sa * (R + len));
    }
    g.stroke(); g.globalAlpha = 1;
  };

  // вспышка узла: x — время с момента срабатывания (доли сценария)
  const glow = (x) => (x < 0 ? 0 : Math.exp(-x * 3.2));
  const dot = (x, y, r, col, al) => { g.globalAlpha = al; g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  function net(u, t, fade) {
    if (fade <= 0) return;
    const ink = '#2D2419';
    // рёбра — тонкие; горят, пока по ним идёт импульс
    g.lineWidth = 1.1;
    const edge = (e, lit, col) => { g.globalAlpha = fade * (0.2 + 0.7 * lit); g.strokeStyle = lit > 0.05 ? col : ink; g.beginPath(); g.moveTo(e.p.x, e.p.y); g.lineTo(e.q.x, e.q.y); g.stroke(); };
    const runs = [];
    EIH.forEach((e) => {
      let lit = 0, col = ink;
      FIRES.forEach((f) => {
        if (!f.ins.includes(e.i)) return;
        const p = (u - f.arr[e.i] - 0.02 - e.h * 0.05) / 0.15;
        if (p > -0.2 && p < 1.4) { lit = Math.max(lit, 1 - Math.abs(p - 0.5) * 1.1); col = f.col; if (p > 0 && p < 1) runs.push([e, p, f.col]); }
      });
      edge(e, cl(lit), col);
    });
    EHO.forEach((e) => {
      let lit = 0, col = ink;
      FIRES.forEach((f) => {
        const own = e.o === f.o, p = (u - f.hid - 0.02 - e.h * 0.04) / 0.16;
        if (p > -0.2 && p < 1.4) { lit = Math.max(lit, (own ? 1 : 0.3) * (1 - Math.abs(p - 0.5) * 1.1)); col = f.col; if (own && p > 0 && p < 1) runs.push([e, p, f.col]); }
      });
      edge(e, cl(lit), col);
    });
    // фоновая жизнь: редкие слабые искры по рёбрам, пока сеть ждёт
    [...EIH, ...EHO].forEach((e, k) => {
      if (e.h < 0.55) return;
      const p = (t * 0.55 + e.h * 3.1 + k * 0.17) % 1;
      dot(e.p.x + (e.q.x - e.p.x) * p, e.p.y + (e.q.y - e.p.y) * p, 1.3, '#7A6B56', fade * 0.35 * Math.sin(Math.PI * p));
    });
    // импульсы — капли с хвостом
    runs.forEach(([e, p, col]) => {
      for (let k = 0; k < 4; k++) { const q = Math.max(0, p - k * 0.07); dot(e.p.x + (e.q.x - e.p.x) * q, e.p.y + (e.q.y - e.p.y) * q, 4 - k * 0.8, col, fade * (1 - k * 0.22)); }
    });
    // узлы: кольцо + заливка вспышкой, вокруг сработавшего — расходящееся кольцо
    const node = (n, act, col, r0) => {
      const a = cl(act);
      g.globalAlpha = fade; g.fillStyle = '#F7F2E8'; g.strokeStyle = a > 0.05 ? col : ink; g.lineWidth = 1.5;
      g.beginPath(); g.arc(n.x, n.y, r0 + 3 * a, 0, 7); g.fill(); g.globalAlpha = fade * (0.55 + 0.45 * a); g.stroke();
      if (a > 0.02) dot(n.x, n.y, (r0 - 1.5) * a + 1.2, col, fade * a);
    };
    const ring = (n, x, col) => { if (x <= 0 || x > 0.55) return; g.globalAlpha = fade * (1 - x / 0.55) * 0.8; g.strokeStyle = col; g.lineWidth = 1.4; g.beginPath(); g.arc(n.x, n.y, 6 + x * 46, 0, 7); g.stroke(); };
    NI.forEach((n, i) => { let act = 0, col = ink; FIRES.forEach((f) => { if (f.ins.includes(i)) { const v = glow(u - f.arr[i]); if (v > act) { act = v; col = f.col; } ring(n, u - f.arr[i], f.col); } }); node(n, act, col, 7); });
    NH.forEach((n, j) => { let act = 0, col = ink; FIRES.forEach((f) => { const v = glow(u - f.hid - j * 0.015); if (v > act) { act = v; col = f.col; } }); node(n, act, col, 6); });
    NO.forEach((n, o) => { let act = 0, col = ink; FIRES.forEach((f) => { if (f.o === o) { const v = glow((u - f.out) * 0.6); if (v > act) { act = v; col = f.col; } ring(n, u - f.out, f.col); ring(n, u - f.out - 0.12, f.col); } }); node(n, act, col, 8.5); });
    g.globalAlpha = 1;
  }

  // страйк: бронь ударяет в значок VK — кегли разлетаются веером и падают
  const pin = (x, y, rot, s, al) => {
    gt.save(); gt.translate(x, y); gt.rotate(rot); gt.scale(s, s); gt.globalAlpha = al;
    gt.beginPath();
    gt.moveTo(0, -11); gt.bezierCurveTo(3, -11, 3.2, -6.5, 1.6, -4.6); gt.bezierCurveTo(5.4, -1.4, 5, 7, 2.6, 10);
    gt.lineTo(-2.6, 10); gt.bezierCurveTo(-5, 7, -5.4, -1.4, -1.6, -4.6); gt.bezierCurveTo(-3.2, -6.5, -3, -11, 0, -11);
    gt.fillStyle = '#FFFFFF'; gt.fill(); gt.lineWidth = 1 / s * 1.1; gt.strokeStyle = '#2D2419'; gt.stroke();
    gt.fillStyle = '#C26B4A'; gt.fillRect(-2.2, -4.2, 4.4, 1.3); gt.fillRect(-2.6, -2.2, 5.2, 1.1);
    gt.restore();
  };
  function strike(u) {
    const tau = (u - U_VK) * S, on = tau >= 0 && tau <= 1.1;
    if (topCv.style.visibility !== (on ? 'visible' : 'hidden')) topCv.style.visibility = on ? 'visible' : 'hidden';
    if (!on) return;
    const cx = E1.cx, cy = E1.cy;
    for (let i = 0; i < 7; i++) {
      const h1 = Math.abs(Math.sin(i * 91.7 + 3.1) * 4375.5) % 1, h2 = Math.abs(Math.sin(i * 37.3 + 1.7) * 9137.1) % 1;
      const ang = -Math.PI / 2 + (i - 3) * 0.34 + (h1 - 0.5) * 0.3 - 0.3, v = 330 + h2 * 200;
      const x = cx + Math.cos(ang) * v * tau, y = cy + Math.sin(ang) * v * tau + 0.5 * 980 * tau * tau;
      pin(x, y, tau * (7 + h1 * 9) * (i % 2 ? 1 : -1), 2 + h2 * 0.7, cl(1 - (tau - 0.65) / 0.45) * cl(tau / 0.05));
    }
    // хлопок: короткие лучи от значка
    if (tau < 0.3) {
      gt.strokeStyle = '#C4985A'; gt.lineWidth = 2; gt.lineCap = 'round'; gt.globalAlpha = 1 - tau / 0.3;
      gt.beginPath();
      for (let k = 0; k < 14; k++) { const an = (k / 14) * Math.PI * 2, r0 = E1.w * 0.62 + tau * 90, r1 = r0 + 14 + tau * 40; gt.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0); gt.lineTo(cx + Math.cos(an) * r1, cy + Math.sin(an) * r1); }
      gt.stroke(); gt.globalAlpha = 1;
    }
  }

  function draw(u, t, end) {
    g.clearRect(0, 0, W, H);
    const [amp, cx, col, sp] = env(u), fade = cl((u + 0.1) / 0.35) * (1 - cl((u - end + 0.35) / 0.3));
    const left = W * 0.035, right = W * 0.965, step = 8, n = Math.floor((right - left) / step), maxH = H * 0.06;
    g.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const x = left + i * step, p = i / (n - 1);
      const focus = Math.exp(-Math.pow((p - cx) / 0.22, 2));
      const s1 = Math.abs(Math.sin(p * 23 + t * 9.4)) * Math.abs(Math.sin(p * 7.3 - t * 5.1 + 1.3));
      const edge = Math.sin(Math.PI * p) ** 0.6;
      const h = Math.max(1.2, maxH * amp * (0.3 + 0.7 * s1) * edge * (0.25 + 0.75 * focus) * 2);
      g.globalAlpha = (amp < 0.1 ? 0.45 : 0.92) * fade;
      g.fillRect(x, waveY - h / 2, 2.2, h);
    }
    g.globalAlpha = 1;
    const kOn = u >= 4.2;
    radial(oL, sp === 'L' ? amp : 0.12, sp === 'L' ? col : '#B7A98F', t, fade, 0);
    if (kOn) radial(oK, sp === 'K' ? amp : 0.12, sp === 'K' ? col : '#B7A98F', t, fade * cl((u - 4.2) / 0.3), 2.1);
    net(u, t, fade * cl((u - 0.6) / 0.4));
    gt.clearRect(0, 0, W, H); strike(u);
  }
});
