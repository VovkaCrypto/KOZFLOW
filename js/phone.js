// Телефонная оболочка главной. Нижний док прячется, пока финал в кадре: там своя кнопка Telegram.
// Показ после первого экрана — body.is-past-hero из app.js, правило в css/phone.css.
(() => {
  // Обо всех якорях вне дока, и на ПК тоже: «Обо мне» достраивается на подходе и удлиняет страницу на тысячи px,
  // плавный скролл едет к старому адресу и встаёт посреди секции. Доехал мимо — едем ещё раз, колесо и палец отменяют.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]'), el = link && link.hash.length > 1 && document.querySelector(link.hash);
    if (!el || link.closest('.dock')) return;
    const pad = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    let last = -1, n = 0, id = 0;
    const stop = () => { clearTimeout(id); removeEventListener('wheel', stop); removeEventListener('touchstart', stop); };
    const tick = () => {
      if (scrollY === last) {
        if (Math.abs(el.getBoundingClientRect().top - pad()) <= 8 || ++n > 4) { stop(); return; }
        el.scrollIntoView();
      }
      last = scrollY; id = setTimeout(tick, 200);
    };
    addEventListener('wheel', stop, { passive: true }); addEventListener('touchstart', stop, { passive: true });
    id = setTimeout(tick, 200);
  });
  const dock = document.querySelector('.dock'), fin = document.getElementById('final');
  if (!dock || !fin || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([e]) => dock.classList.toggle('dock--hide', e.isIntersecting)).observe(fin);
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
