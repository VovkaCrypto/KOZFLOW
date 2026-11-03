// pg-top.js — шапка страниц услуг и политики.
// ПК: подсветка вкладки переезжает за наведением и возвращается к текущей.
// Телефон: кнопка с названием страницы открывает нижний лист ремёсел; шапка прячется при скролле вниз и возвращается вверх.
// Везде: полоса чтения внизу шапки в цвете ремесла.
(() => {
  const top = document.querySelector('.pg-top');
  if (!top) return;
  const root = document.documentElement;

  /* ── подсветка вкладок ── */
  const nav = top.querySelector('.pg-tabs');
  const ind = nav && nav.querySelector('.pg-ind');
  if (ind) {
    const cur = nav.querySelector('[aria-current="page"]');
    const tabs = [...nav.querySelectorAll('a')];
    const to = (a) => {
      for (const t of tabs) t.classList.toggle('on', t === a);
      if (!a) { ind.style.opacity = '0'; return; }
      ind.style.opacity = '1';
      ind.style.width = a.offsetWidth + 'px';
      ind.style.transform = `translateX(${a.offsetLeft}px)`;
      ind.style.background = getComputedStyle(a).getPropertyValue('--cd').trim() || '';
    };
    const rest = () => to(cur);
    nav.addEventListener('pointerover', (e) => { const a = e.target.closest('a'); if (a && e.pointerType === 'mouse') to(a); });
    nav.addEventListener('pointerleave', rest);
    nav.addEventListener('focusin', (e) => { const a = e.target.closest('a'); if (a) to(a); });
    nav.addEventListener('focusout', rest);
    // первая постановка — без анимации; шрифт и ресайз меняют ширины вкладок
    const settle = () => { ind.classList.add('nt'); rest(); void ind.offsetWidth; ind.classList.remove('nt'); };
    settle();
    root.classList.add('pg-js');
    if (document.fonts) document.fonts.ready.then(settle);
    addEventListener('resize', settle);
  }

  /* ── лист ремёсел ── */
  const dlg = document.getElementById('pg-menu');
  const btn = top.querySelector('.pg-cur');
  if (dlg && btn && typeof dlg.showModal === 'function') {
    btn.addEventListener('click', () => {
      dlg.showModal();
      root.classList.add('pg-lock');
      btn.setAttribute('aria-expanded', 'true');
    });
    dlg.addEventListener('close', () => {
      root.classList.remove('pg-lock');
      btn.setAttribute('aria-expanded', 'false');
    });
    // тап по затемнению закрывает: всё содержимое внутри .pg-sheet, сам dialog — только подложка;
    // «Вы здесь» — ссылка на эту же страницу: закрывает лист, а не перезагружает
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg || e.target.closest('a[aria-current="page"]')) { e.preventDefault(); dlg.close(); }
    });
    // уход по ссылке из листа: в bfcache страница не должна остаться с открытым листом и запертой прокруткой
    addEventListener('pagehide', () => { if (dlg.open) dlg.close(); });
    root.classList.add('pg-dlg');
  }

  /* ── прятать при скролле вниз (телефон) и полоса чтения ── */
  const phone = matchMedia('(max-width: 640px)');
  const prog = top.querySelector('.pg-prog');
  let lastY = scrollY, run = 0, queued = false;
  const update = () => {
    queued = false;
    const y = scrollY;
    const max = root.scrollHeight - innerHeight;
    if (prog) prog.style.transform = `scaleX(${max > 0 ? Math.max(0, Math.min(1, y / max)) : 0})`;
    const dy = y - lastY;
    lastY = y;
    if (!phone.matches || y < 80 || (dlg && dlg.open)) { top.classList.remove('hid'); run = 0; return; }
    run = run * dy > 0 ? run + dy : dy; // путь в одну сторону; смена направления сбрасывает
    if (run > 24) top.classList.add('hid');
    else if (run < -24) top.classList.remove('hid');
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  top.addEventListener('focusin', () => top.classList.remove('hid'));
  update();
})();
