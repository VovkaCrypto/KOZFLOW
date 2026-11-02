// Телефонная оболочка главной. Нижний док прячется у подвала и ниже: на ценах Telegram в нём ещё нужен.
// Показ после первого экрана — body.is-past-hero из app.js, правило в css/phone.css.
(() => {
  // Обо всех якорях вне дока, и на ПК тоже: «Обо мне» достраивается на подходе и удлиняет страницу на тысячи px,
  // плавный скролл едет к старому адресу и встаёт посреди секции. Встали мимо — едем ещё раз.
  // Любое своё действие человека отменяет: колесо, палец, клавиша, нажатие на полосу прокрутки или ссылку.
  const USER = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
  let release = () => {};
  const hold = (el, jump) => { // jump: прямая ссылка, страница ещё растёт, цель держим и после попадания
    release();
    const off = () => el.getBoundingClientRect().top - (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
    let last = -1, miss = 0, calm = 0, id = 0;
    const stop = () => { clearTimeout(id); USER.forEach((n) => removeEventListener(n, stop)); };
    const tick = () => {
      if (scrollY === last) {
        const ok = Math.abs(off()) <= 8;
        if (ok ? ++calm >= (jump ? 10 : 1) : ++miss > 6) { stop(); return; }
        if (!ok) { calm = 0; el.scrollIntoView(jump ? { behavior: 'instant' } : undefined); }
      }
      last = scrollY; id = setTimeout(tick, 200);
    };
    USER.forEach((n) => addEventListener(n, stop, { passive: true }));
    release = stop; id = setTimeout(tick, 200);
  };
  document.addEventListener('click', (e) => {
    release();
    if (e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return; // новая вкладка: эта стоит на месте
    const link = e.target.closest('a[href^="#"]'), el = link && document.getElementById(link.hash.slice(1));
    if (el && !link.closest('.dock')) hold(el);
  });
  if (location.hash && performance.getEntriesByType('navigation')[0]?.type === 'navigate') {
    const el = document.getElementById(location.hash.slice(1));
    if (el) hold(el, true);
  }
  const dock = document.querySelector('.dock'), fin = document.querySelector('#final .ln6');
  if (!dock || !fin || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([e]) => dock.classList.toggle('dock--hide', e.isIntersecting || e.boundingClientRect.top < 0)).observe(fin);
  // Цех и «Обо мне» достраиваются при подходе и меняют высоту страницы: после тапа держим цель, пока она не встанет.
  // Палец на экране отменяет — человек уже листает сам.
  dock.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]'), el = link && document.querySelector(link.getAttribute('href'));
    if (!el) return;
    e.preventDefault(); // у страницы плавный скролл: он тащил бы 10 000 px через все тяжёлые секции
    history.pushState(null, '', link.hash);
    let n = 0, id = 0;
    const stop = () => clearTimeout(id);
    const aim = () => { el.scrollIntoView({ behavior: 'instant' }); if (++n < 6) id = setTimeout(aim, 180); else removeEventListener('touchstart', stop); };
    addEventListener('touchstart', stop, { once: true, passive: true });
    aim();
  });
})();
