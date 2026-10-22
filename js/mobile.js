/* mobile.js — сцены телефона, собранные с нуля (не ужатый десктоп).
 * Композиция: центр (знак, слово, подпись, кнопка) — в нижней части кадра; сверху у каждой сцены один крупный герой.
 *   auto   — большая карточка звонка Кегеля («Кегельбар»): пульс, волна, субтитры; слова слетают в чип, карточка переворачивается в VK.
 *   sites  — телефон-куб: четыре грани = четыре сайта, поворот на каждый сайт; рядом редакционный список из четырёх названий.
 *   design — колода афиш: падает стопкой, раскрывается веером, панч, переворот, тасовка, полки, выброс.
 * Сцена берёт мобильную версию так: if (c.mob && REEL.mobile.<id>) return REEL.mobile.<id>(c).
 */
(() => {
  'use strict';
  const M = (window.REEL.mobile = {});
  const cl = (x) => Math.max(0, Math.min(1, x));

  /* ───────── Автоматизации ───────── */
  M.auto = (c) => {
    const { tl, a, b, cam, W, H, $, $$ } = c;
    const S = 0.85, at = (u) => a + u * S;   // сценарий сцены играется быстрее
    const GUEST = [['Дорожку ', 0], ['на четверых', 1], [', ', 0], ['сегодня', 2], [' в семь.', 0]];
    const BOT = [['Записал на ', 0], ['19:00', 3], ['. Ждём!', 0]];
    const TOK = [[1, '4 игрока'], [2, 'сегодня'], [3, '19:00']];
    const line = (parts) => parts.map(([s, k]) => (k ? `<i class="kw" data-k="${k}">` : '<i>') + [...s].map((ch) => `<span>${ch}</span>`).join('') + (k ? LASSO : '') + '</i>').join('');
    const LASSO = '<svg class="lasso" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M14 31C3 25 6 9 31 5c26-4 61-1 64 13 3 14-29 19-53 18-22-1-36-6-34-16 1-6 8-11 18-13"/></svg>';
    cam.innerHTML = `
      <canvas class="ma-wave"></canvas>
      <div class="it ma-card"><div class="flip">
        <div class="fc front">
          <div class="who"><span class="av"><svg class="dial" viewBox="-70 -70 140 140" aria-hidden="true"><g class="orbit"><circle r="67"/><circle class="sat" cx="0" cy="-67" r="5"/></g><g class="ticks">${Array.from({ length: 24 }, (_, i) => `<line x1="0" y1="-60" x2="0" y2="-55" transform="rotate(${i * 15})"/>`).join('')}</g><circle class="arc" r="62" pathLength="1" transform="rotate(-90)"/></svg><img class="z" src="assets/clients/kegelbar.webp" alt=""><i class="ring"></i><i class="ring r2"></i></span>
            <span><b class="nm">Кегель</b><span class="rl">голосовой бот «Кегельбара»</span></span><span class="tcc caps">00:00</span></div>
          <canvas class="ma-voice"></canvas>
          <div class="subs"><p class="g"><b class="caps">гость</b><span class="tx">${line(GUEST)}</span></p><p class="l"><b class="caps">Кегель</b><span class="tx">${line(BOT)}</span></p></div>
          <div class="st caps"><i class="dot"></i><span class="stt">Входящий</span></div>
        </div>
        <div class="fc back">
          <div class="hd caps"><span class="tge vk"><i class="pulse"></i><span class="disc"><svg viewBox="0 0 24 24"><path d="M19.376 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/></svg></span>VK · директору</span><span>19:02</span></div>
          <div class="msg"><b>Новая бронь</b><span>Кегельбар · дорожка · 4 игрока · 19:00</span><em class="caps">записал Кегель ✓ · без администратора</em></div>
        </div>
      </div></div>
      ${TOK.map(([, s]) => `<span class="au-tok caps">${s}</span>`).join('')}
      <div class="au-chip caps ma-chip">Дорожка · 4 · 19:00</div>`;
    const card = $('.ma-card', cam), flip = $('.flip', card), toks = $$('.au-tok', cam), chip = $('.ma-chip', cam), msg = $('.back .msg', card);
    const chG = $$('.g .tx > i > span', card), chL = $$('.l .tx > i > span', card), lasso = $$('.lasso path', card), mpulse = $('.back .pulse', card);
    const kwPos = (k) => { const el = $(`.kw[data-k="${k}"]`, card); let x = el.offsetLeft + el.offsetWidth / 2, y = el.offsetTop + el.offsetHeight / 2, p = el.offsetParent; while (p && p !== cam) { x += p.offsetLeft; y += p.offsetTop; p = p.offsetParent; } return { x, y }; };
    const spot = { x: W / 2, y: card.offsetTop + card.offsetHeight - 6 };

    tl.set(card, { opacity: 0, x: 0, y: 0, scale: 1 }, 0);
    tl.set(flip, { rotationY: 0, transformPerspective: 900 }, 0);
    tl.set([chip], { opacity: 0, scale: 0.3, x: spot.x, y: spot.y, xPercent: -50, yPercent: -50 }, 0);
    tl.set(toks, { opacity: 0 }, 0);
    tl.set($$('.kw', card), { '--hl': 0 }, 0);
    tl.set(msg, { opacity: 0, y: 14 }, 0);
    tl.set(lasso, { strokeDashoffset: 1 }, 0);
    tl.set(mpulse, { scale: 0.6, opacity: 0 }, 0);
    // вход: карточка поднимается снизу и садится с пружиной
    tl.set(card, { opacity: 1 }, a);
    tl.fromTo(card, { y: 60, scale: 0.9 }, { y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)', immediateRender: false }, a);
    // распознавание: слова подсвечиваются и слетают в чип
    tl.to($$('.kw', card), { '--hl': 1, duration: 0.3, stagger: 0.08 }, at(2.45));
    tl.to(lasso, { strokeDashoffset: 0, duration: 0.32, ease: 'power2.inOut', stagger: 0.07 }, at(2.4));
    TOK.forEach(([k], i) => {
      const p0 = kwPos(k), T = at(2.75 + i * 0.07);
      tl.set(toks[i], { x: p0.x, y: p0.y, xPercent: -50, yPercent: -50, opacity: 1, scale: 1 }, T);
      tl.to(toks[i], { x: spot.x + (i - 1) * 70, y: spot.y, duration: 0.42, ease: 'back.in(1.4)' }, T);
      tl.to(toks[i], { x: spot.x, scale: 0.4, opacity: 0, duration: 0.14, ease: 'power3.in' }, at(3.3));
    });
    tl.to(chip, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, at(3.36));
    // карточка переворачивается в VK, чип ныряет в неё
    tl.to(flip, { rotationY: 180, duration: 0.7, ease: 'back.inOut(1.4)' }, at(3.75));
    tl.to(chip, { y: spot.y - 90, scale: 0.4, opacity: 0, duration: 0.35, ease: 'power3.in' }, at(4.2));
    tl.to(msg, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }, at(4.45));
    tl.fromTo(mpulse, { scale: 0.6, opacity: 0.8 }, { scale: 2.4, opacity: 0, duration: 0.6, ease: 'power3.out', immediateRender: false }, at(4.45));
    tl.fromTo(card, { scale: 1 }, { scale: 1.04, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, at(4.45));
    c.cutOut([card, chip], b);

    // волна: по низу кадра и в карточке; субтитры, статус
    const big = $('.ma-wave', cam), gb = big.getContext('2d'), sm = $('.ma-voice', card), gs = sm.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
    big.width = W * dpr; big.height = H * dpr; gb.setTransform(dpr, 0, 0, dpr, 0, 0);
    const stt = $('.stt', card), tcc = $('.tcc', card), arc = $('.dial .arc', card), orbit = $('.dial .orbit', card), ticks = $$('.dial .ticks line', card);
    let sig = '', sized = false;
    const env = (u) => u < 0.45 ? [0.15, '#2D2419'] : u >= 0.6 && u < 1.5 ? [0.85, '#2D2419'] : u >= 1.7 && u < 2.35 ? [0.95, '#C26B4A'] : [0.22, '#7A6B56'];
    const bars = (g, w, h, y, amp, col, t, step, fade) => {
      g.fillStyle = col; const n = Math.floor(w / step);
      for (let i = 0; i < n; i++) { const p = i / (n - 1), s = Math.abs(Math.sin(p * 19 + t * 9.4)) * Math.abs(Math.sin(p * 6.3 - t * 5.1 + 1.3)); const hh = Math.max(1.2, h * amp * (0.3 + 0.7 * s) * Math.sin(Math.PI * p) ** 0.5); g.globalAlpha = (amp < 0.3 ? 0.5 : 0.92) * fade; g.fillRect(i * step, y - hh / 2, step * 0.45, hh); }
      g.globalAlpha = 1;
    };
    REEL.onRender((t) => {
      const u = (t - a) / S;
      if (u < -0.5 || u > (b - a) / S + 0.1) { if (sig !== 'off') { gb.clearRect(0, 0, W, H); gs.clearRect(0, 0, sm.width, sm.height); sig = 'off'; } return; }
      if (!sized) { sm.width = sm.clientWidth * dpr; sm.height = sm.clientHeight * dpr; gs.setTransform(dpr, 0, 0, dpr, 0, 0); sized = true; }
      const k1 = Math.round(cl((u - 0.6) / 0.85) * chG.length), k2 = Math.round(cl((u - 1.7) / 0.6) * chL.length);
      const s = k1 + '|' + k2 + '|' + Math.floor(u * 2);
      if (s !== sig) {
        sig = s; chG.forEach((ch, i) => ch.classList.toggle('on', i < k1)); chL.forEach((ch, i) => ch.classList.toggle('on', i < k2));
        stt.textContent = u < 0.45 ? 'Входящий' : u < 2.5 ? 'На линии' : 'Бронь создана';
        tcc.textContent = '00:' + String(Math.max(0, Math.min(59, Math.floor((u - 0.45) * 2.4)))).padStart(2, '0');
        card.classList.toggle('ringing', u < 0.45); card.classList.toggle('done', u >= 2.5);
      }
      const pr = cl((u - 0.45) / 2.05), nt = Math.round(pr * ticks.length);
      arc.style.strokeDashoffset = 1 - pr; ticks.forEach((l, i) => l.classList.toggle('on', i < nt)); orbit.setAttribute('transform', `rotate(${(t * 40) % 360})`);
      const [amp, col] = env(u), fade = cl((u + 0.1) / 0.35) * (1 - cl((u - (b - a) / S + 0.35) / 0.3));
      gb.clearRect(0, 0, W, H); bars(gb, W, H * 0.06, H * 0.955, amp, col, t, 6, fade);
      gs.clearRect(0, 0, sm.clientWidth, sm.clientHeight); bars(gs, sm.clientWidth, sm.clientHeight, sm.clientHeight / 2, amp, col, t + 1, 5, 1);
    });
  };

  /* ───────── Сайты: телефон-куб и список ───────── */
  M.sites = (c) => {
    const { tl, a, b, cam, $, $$ } = c;
    const S = [['Восток 24', 'ресторан', 'vostok-mob-v3'], ['Ассоциация кулинаров', 'сообщество', 'tverchefs-mob-v3'], ['Miravi', '3D-интерьеры', 'miravi-mob-v3'], ['DeepDiver', 'аналитика заведений', 'deepdiver-mob-v3']];
    cam.innerHTML = `
      <div class="it ms-ph"><div class="cube">${S.map((s, i) => `<div class="face f${i}"><div class="sc"><img class="pg" src="assets/sites/${s[2]}.webp" alt="" decoding="async"></div></div>`).join('')}</div><i class="finger"></i></div>
      <ol class="it ms-list">${S.map((s, i) => `<li><span class="nm">${s[0]}</span><span class="nt caps">${s[1]}</span><i class="bar"><i></i></i></li>`).join('')}</ol>`;
    const ph = $('.ms-ph', cam), cube = $('.cube', ph), faces = $$('.face', cube), list = $('.ms-list', cam), rows = $$('li', list), finger = $('.finger', ph);
    const w = ph.offsetWidth;
    faces.forEach((f, i) => { f.style.transform = `rotateY(${i * 90}deg) translateZ(${w / 2}px)`; });
    const maxY = (f) => () => -Math.max(0, $('.pg', f).clientHeight - $('.sc', f).clientHeight);

    tl.set([ph, list], { opacity: 0, x: 0, y: 0 }, 0);
    tl.set(cube, { rotationY: 0, z: -w / 2, transformPerspective: 1000 }, 0);
    tl.set($$('.pg', cube), { y: 0 }, 0);
    tl.set(rows, { '--on': 0 }, 0);
    tl.set($$('.bar i', list), { scaleX: 0 }, 0);
    tl.set(finger, { opacity: 0 }, 0);
    tl.set(ph, { opacity: 1 }, a);
    tl.fromTo(ph, { y: 80, rotationX: 30, transformPerspective: 900 }, { y: 0, rotationX: 0, duration: 0.7, ease: 'back.out(1.5)', immediateRender: false }, a);
    c.cutIn([list], a + 0.1);
    S.forEach((s, i) => {
      const T = a + 0.25 + i * 1.3;
      if (i) tl.to(cube, { rotationY: -90 * i, duration: 0.6, ease: 'back.inOut(1.3)' }, T - 0.3);
      rows.forEach((r, j) => tl.to(r, { '--on': j === i ? 1 : 0, duration: 0.3, ease: 'power2.out' }, T - 0.2));
      tl.fromTo($$('.bar i', list)[i], { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: 'none', immediateRender: false }, T - 0.2);
      [0.25, 0.7].forEach((du, k) => {
        tl.set(finger, { opacity: 1 }, T + du);
        tl.fromTo(finger, { y: 40, scale: 1.2 }, { y: -50, scale: 1, duration: 0.24, ease: 'power2.in', immediateRender: false }, T + du);
        tl.to(finger, { opacity: 0, duration: 0.1 }, T + du + 0.2);
        tl.to($('.pg', faces[i]), { y: () => maxY(faces[i])() * (0.14 + k * 0.16), duration: 0.7, ease: 'power4.out' }, T + du + 0.08);
      });
    });
    c.cutOut([ph, list], b);
  };

  /* ───────── Дизайн: колода афиш ───────── */
  M.design = (c) => {
    const { tl, a, b, cam, W, H, $$ } = c;
    const all = (REEL.works || []).filter((w) => /афиша|постер|соцсети/.test(w.kind) && w.h >= w.w);
    const n = 7, pw = Math.round(W * 0.3);
    cam.innerHTML = Array.from({ length: n }, (_, i) => {
      const w1 = all[(i * 3) % all.length] || {}, w2 = all[(i * 3 + 1) % all.length] || {};
      return `<a class="it ds-p md-p" href="#works" style="width:${pw}px"><span class="fl"><img class="f1" src="assets/${w1.thumb || w1.file}" alt=""><img class="f2" src="assets/${w2.thumb || w2.file}" alt=""></span></a>`;
    }).join('');
    const P = $$('.md-p', cam), FL = P.map((p) => p.firstElementChild);
    const cx = W / 2, cy = H * 0.3, mid = (n - 1) / 2;
    const fanR = (i) => (i - mid) * 11, fanX = (i) => (i - mid) * W * 0.045;
    P.forEach((p, i) => {
      tl.set(p, { opacity: 0, x: cx, y: cy, xPercent: -50, yPercent: -50, rotation: 0, scale: 1, zIndex: i, transformOrigin: '50% 150%' }, 0);
      tl.set(FL[i], { rotationY: 0, scale: 1, transformPerspective: 800 }, 0);
    });
    // 1 · колода падает стопкой, каждая карта приземляется со сжатием
    P.forEach((p, i) => {
      const T = a + i * 0.04;
      tl.set(p, { opacity: 1 }, T);
      tl.fromTo(p, { y: -H * 0.3, rotation: (i % 2 ? 1 : -1) * 25 }, { y: cy - i * 1.5, rotation: (i % 2 ? 1 : -1) * 2, duration: 0.42, ease: 'power3.in', immediateRender: false }, T);
      tl.to(FL[i], { scaleY: 0.86, scaleX: 1.1, duration: 0.06 }, T + 0.42);
      tl.to(FL[i], { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' }, T + 0.48);
    });
    // 2 · веер
    P.forEach((p, i) => tl.to(p, { rotation: fanR(i), x: cx + fanX(i), y: cy, duration: 0.6, ease: 'back.out(1.8)' }, a + 0.75 + Math.abs(i - mid) * 0.03));
    // 3 · панч на долях: карта выпрыгивает из веера
    [[1.5, 1], [2.0, 5], [2.5, 3]].forEach(([u, i]) => {
      tl.to(p0(i), { y: cy - H * 0.06, duration: 0.14, ease: 'power2.out' }, a + u);
      tl.to(p0(i), { y: cy, duration: 0.5, ease: 'elastic.out(1, 0.35)' }, a + u + 0.14);
    });
    function p0(i) { return P[i]; }
    // 4 · переворот волной
    P.forEach((p, i) => tl.to(FL[i], { rotationY: 180, duration: 0.5, ease: 'back.inOut(1.5)' }, a + 2.9 + i * 0.05));
    // 5 · тасовка: собираются в стопку и чередуясь вылетают влево/вправо, возвращаясь наверх
    P.forEach((p, i) => tl.to(p, { rotation: 0, x: cx, duration: 0.3, ease: 'power3.inOut' }, a + 3.4));
    P.forEach((p, i) => {
      const T = a + 3.7 + i * 0.07, s = i % 2 ? 1 : -1;
      tl.to(p, { x: cx + s * W * 0.34, rotation: s * 14, duration: 0.16, ease: 'power2.out' }, T);
      tl.set(p, { zIndex: 20 + i }, T + 0.16);
      tl.to(p, { x: cx, rotation: s * 2, duration: 0.2, ease: 'power3.in' }, T + 0.16);
    });
    // 6 · выброс на шве: карты разлетаются вверх и в стороны
    P.forEach((p, i) => {
      const T = b - 0.4, s = i - mid;
      tl.to(p, { x: cx + s * W * 0.3, y: -H * 0.2, rotation: s * 40, duration: 0.38, ease: 'power4.in' }, T);
      tl.to(p, { opacity: 0, duration: 0.2 }, T + 0.18);
    });
  };
})();
