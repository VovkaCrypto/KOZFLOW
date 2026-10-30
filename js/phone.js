// Телефонная оболочка главной. Нижний док прячется, пока финал в кадре: там своя кнопка Telegram.
// Показ после первого экрана — body.is-past-hero из app.js, правило в css/phone.css.
(() => {
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
