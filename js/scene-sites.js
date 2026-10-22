/* scene-sites.js — «Сайты»: все четыре сайта живые, каждый в своём углу вокруг слова.
 * Сверху два браузера, снизу два телефона. Прожектор проходит по сайтам на долях — у каждого свой жест:
 *   Восток 24 — курсор листает колесом и кликает; Ассоциация кулинаров — каркас прочерчивается, сканер «рендерит» страницу;
 *   Miravi — палец свайпает с инерцией; DeepDiver — свайп и тап с откликом.
 * Финал сцены: браузеры адаптивно сжимаются в мобильные версии, все четыре листаются разом.
 * u = t − a (a = 8), 6 с = 12 долей.
 */
REEL.scene('sites', (c) => {
  if (c.mob && REEL.mobile.sites) return REEL.mobile.sites(c);
  const { tl, a, b, cam, mob, $, $$ } = c;
  const S = [
    { k: 'br', pos: 'tl', name: 'Восток 24', note: 'ресторан', desk: 'vostok-desk-v3', mobi: 'vostok-mob-v3' },
    { k: 'br', pos: 'tr', name: 'Ассоциация кулинаров', note: 'сообщество', desk: 'tverchefs-desk-v3', mobi: 'tverchefs-mob-v3' },
    { k: 'ph', pos: 'br', name: 'Miravi', note: '3D-интерьеры', mobi: 'miravi-mob-v3' },
    { k: 'ph', pos: 'bl', name: 'DeepDiver', note: 'аналитика заведений', mobi: 'deepdiver-mob-v3' }
  ];
  const img = (n) => `assets/sites/${n}.webp`;
  const CUR = '<div class="cur"><span class="rip"></span><svg viewBox="0 0 30 30"><path d="M5 3l18 9.2-8 2.2-2.6 8z" fill="#2D2419" stroke="#FAF7F2" stroke-width="2" stroke-linejoin="round"/></svg></div>';
  const WF = `<svg class="wf" viewBox="0 0 100 115" preserveAspectRatio="none"><rect x="4" y="3" width="92" height="6"/><rect x="4" y="14" width="54" height="30"/><rect x="62" y="14" width="34" height="30"/><line x1="8" y1="50" x2="60" y2="50"/><line x1="8" y1="55" x2="48" y2="55"/><rect x="4" y="66" width="28" height="22"/><rect x="36" y="66" width="28" height="22"/><rect x="68" y="66" width="28" height="22"/><rect x="34" y="96" width="32" height="8" rx="4"/></svg><i class="scan"></i>`;
  cam.innerHTML = S.map((s, i) => s.k === 'br'
    ? `<div class="it si-dev si-br p-${s.pos}" data-i="${i}"><div class="bar"><i></i><i></i><i></i><span class="url caps">${s.name}</span></div>
        <div class="scr"><img class="pg dk" src="${img(s.desk)}" alt="" decoding="async"><img class="pg mb" src="${img(s.mobi)}" alt="" decoding="async">${i === 1 ? WF : ''}</div>${i === 0 ? CUR : ''}
        <span class="lab caps">${s.name} · ${s.note}</span></div>`
    : `<div class="it si-dev si-ph p-${s.pos}" data-i="${i}"><div class="face"><div class="sc"><img class="pg" src="${img(s.mobi)}" alt="" decoding="async"></div></div><i class="finger"></i><i class="tap"></i>
        <span class="lab caps">${s.name} · ${s.note}</span></div>`).join('');

  const D = $$('.si-dev', cam), [vos, tvc, mir, dd] = D;
  const pg = (d, sel = '.pg') => $(sel, d);
  const maxY = (d, el) => () => -Math.max(0, el.clientHeight - $(d.classList.contains('si-br') ? '.scr' : '.sc', d).clientHeight);
  const scrollTo = (d, el, k, T, dur = 0.7, ease = 'power4.out') => tl.to(el, { y: () => maxY(d, el)() * k, duration: dur, ease }, T);

  /* ── исходные ── */
  D.forEach((d, i) => {
    const left = d.classList.contains('p-tl') || d.classList.contains('p-bl');
    tl.set(d, { opacity: 0, x: 0, scale: 1, rotationY: left ? 14 : -14, transformPerspective: 1300, transformOrigin: left ? '0% 50%' : '100% 50%', '--dim': 0 }, 0);
  });
  tl.set($$('.pg', cam), { y: 0, opacity: 1 }, 0);
  tl.set($$('.pg.mb', cam), { opacity: 0 }, 0);
  tl.set($$('.si-br', cam), { width: '' }, 0);
  const wf = $$('.wf > *', tvc); wf.forEach((el) => { const L = el.getTotalLength ? el.getTotalLength() : 200; el.style.strokeDasharray = L; el.__L = L; });
  tl.set(wf, { strokeDashoffset: (i, el) => el.__L, opacity: 1 }, 0);
  tl.set(pg(tvc, '.dk'), { clipPath: 'inset(0 0 100% 0)' }, 0);
  tl.set($('.scan', tvc), { top: '0%', opacity: 0 }, 0);
  tl.set($('.cur', vos), { opacity: 0, x: 0, y: 0, scale: 1 }, 0);
  tl.set($$('.finger, .tap', cam), { opacity: 0, y: 0, scale: 1 }, 0);

  /* ── вход: из своих углов с доворотом ── */
  c.cutIn(D, a, { dur: 0.5 });
  D.forEach((d, i) => {
    const left = d.classList.contains('p-tl') || d.classList.contains('p-bl');
    tl.fromTo(d, { rotationY: left ? 36 : -36 }, { rotationY: left ? 14 : -14, duration: 0.9, ease: 'back.out(1.6)', immediateRender: false }, a + i * 0.05);
  });
  // ждущие сайты листаются сами, медленно
  [[vos, '.dk'], [mir, '.pg'], [dd, '.pg']].forEach(([d, sel]) => tl.fromTo(pg(d, sel), { y: 0 }, { y: () => maxY(d, pg(d, sel))() * 0.08, duration: 3, ease: 'none', immediateRender: false }, a + 0.3));

  /* ── прожектор: свой сайт выходит вперёд, остальные притухают ── */
  const spot = (i, T, dur) => {
    D.forEach((d, j) => tl.to(d, { '--dim': j === i ? 0 : 1, scale: j === i ? 1.06 : 0.97, duration: 0.35, ease: 'power3.out' }, T));
    tl.to(D[i], { rotationY: 0, duration: 0.5, ease: 'back.out(1.6)' }, T);
    const left = D[i].classList.contains('p-tl') || D[i].classList.contains('p-bl');
    tl.to(D[i], { rotationY: left ? 14 : -14, duration: 0.5, ease: 'power2.inOut' }, T + dur - 0.1);
  };
  // 01 · Восток 24: курсор входит, два толчка колесом, клик — страница прыгает к разделу
  spot(0, a + 0.45, 1.1);
  const cur = $('.cur', vos), rip = $('.rip', vos), vdk = pg(vos, '.dk');
  const vw = () => vos.offsetWidth, vh = () => $('.scr', vos).offsetHeight + 26;
  tl.set(cur, { opacity: 1 }, a + 0.5);
  tl.fromTo(cur, { x: () => vw() * 0.9, y: () => vh() * 1.05 }, { x: () => vw() * 0.55, y: () => vh() * 0.55, duration: 0.35, ease: 'power3.out', immediateRender: false }, a + 0.5);
  scrollTo(vos, vdk, 0.2, a + 0.9, 0.45, 'power3.out'); scrollTo(vos, vdk, 0.34, a + 1.15, 0.45, 'power3.out');
  tl.to(cur, { x: () => vw() * 0.3, y: () => vh() * 0.32, duration: 0.2, ease: 'power3.inOut' }, a + 1.3);
  tl.to(cur, { scale: 0.82, duration: 0.07 }, a + 1.5); tl.to(cur, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, a + 1.57);
  tl.fromTo(rip, { scale: 0.2, opacity: 0.9 }, { scale: 1.8, opacity: 0, duration: 0.5, ease: 'power3.out', immediateRender: false }, a + 1.5);
  scrollTo(vos, vdk, 0.62, a + 1.55, 0.6, 'expo.inOut');
  tl.to(cur, { opacity: 0, duration: 0.15 }, a + 2.0);
  // 02 · Ассоциация кулинаров: каркас → скан → живая страница → листание
  spot(1, a + 1.55, 1.1);
  tl.to(wf, { strokeDashoffset: 0, duration: 0.45, ease: 'power3.inOut', stagger: 0.035 }, a + 1.4);
  const sc0 = a + 1.95, tdk = pg(tvc, '.dk'), scan = $('.scan', tvc);
  tl.set(scan, { opacity: 1 }, sc0);
  tl.fromTo(scan, { top: '0%' }, { top: '100%', duration: 0.45, ease: 'power2.inOut', immediateRender: false }, sc0);
  tl.fromTo(tdk, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.45, ease: 'power2.inOut', immediateRender: false }, sc0);
  tl.to(wf, { opacity: 0, duration: 0.25 }, sc0 + 0.25); tl.to(scan, { opacity: 0, duration: 0.12 }, sc0 + 0.45);
  scrollTo(tvc, tdk, 0.3, a + 2.45, 0.6);
  // 03 · Miravi: два свайпа пальцем с инерцией
  spot(2, a + 2.65, 1.1);
  const swipe = (d, k, T) => {
    const f = $('.finger', d), el = pg(d);
    tl.set(f, { opacity: 1 }, T);
    tl.fromTo(f, { y: 50, scale: 1.25 }, { y: -60, scale: 1, duration: 0.26, ease: 'power2.in', immediateRender: false }, T);
    tl.to(f, { opacity: 0, duration: 0.1 }, T + 0.22);
    scrollTo(d, el, k, T + 0.1, 0.8);
  };
  swipe(mir, 0.2, a + 2.85); swipe(mir, 0.38, a + 3.3);
  // 04 · DeepDiver: свайп и тап — кнопка отвечает волной
  spot(3, a + 3.75, 1.1);
  swipe(dd, 0.16, a + 3.9);
  const tap = $('.tap', dd);
  tl.fromTo(tap, { opacity: 0.9, scale: 0.3 }, { opacity: 0, scale: 2.2, duration: 0.55, ease: 'power3.out', immediateRender: false }, a + 4.45);
  tl.fromTo(dd, { y: 0 }, { y: -10, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, a + 4.45);

  /* ── финал: всё живое разом; браузеры сжимаются в мобильные версии (адаптив на глазах) ── */
  const F = a + 4.85;
  D.forEach((d) => tl.to(d, { '--dim': 0, scale: 1, duration: 0.3, ease: 'power2.out' }, F));
  if (!mob) $$('.si-br', cam).forEach((br) => {
    tl.to(br, { width: () => br.offsetWidth * 0.46, duration: 0.55, ease: 'expo.inOut' }, F);
    tl.to(pg(br, '.dk'), { opacity: 0, duration: 0.25 }, F + 0.15);
    tl.to(pg(br, '.mb'), { opacity: 1, duration: 0.25 }, F + 0.15);
  });
  D.forEach((d) => { const el = d.classList.contains('si-br') ? pg(d, '.mb') : pg(d); tl.to(el, { y: () => maxY(d, el)() * 0.5, duration: 0.9, ease: 'power3.inOut' }, F + 0.3); });

  tl.fromTo(cam, { scale: 1 }, { scale: 1.03, duration: b - a, ease: 'none' }, a);
  c.cutOut(D, b);
});
