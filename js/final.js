// Секция «Финал» (#final) — цены, короткие ответы, связь, вордмарк KOZFLOW из афиш.
// Разметка и стили перенесены из sections-v3/final (port.mjs); этот файл правится здесь, в эскизе его нет.
// Вордмарк: буквы поднимаются из-под края страницы, под лучом проступают цветные афиши. Лента запечена в assets/final.
(() => {
  const root = document.getElementById('final');
  if (!root) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  root.querySelectorAll('.mail6').forEach((b) => (b.onclick = () => { navigator.clipboard?.writeText(b.dataset.mail).catch(() => {}); b.dataset.done = ''; setTimeout(() => delete b.dataset.done, 1400); }));
  root.querySelectorAll('.pl>li>button').forEach((b) => b.addEventListener('click', () => { const on = b.parentElement.classList.toggle('on'); b.setAttribute('aria-expanded', on); }));
  root.querySelector('.up').addEventListener('click', () => scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }));

  const clk = root.querySelector('.clk6'), fmt = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' });
  const upd = () => { if (!document.hidden) clk.textContent = fmt.format(new Date()); };
  upd(); setInterval(upd, 15000);

  const wm = root.querySelector('.wm6'), base = [...wm.querySelectorAll('.base span')], lit = [...wm.querySelectorAll('.lit span')];
  const up = base.map(() => 0), trPrev = base.map(() => '');

  // кегль подгоняем по факту: пробный размер, потом масштаб, чтобы слово встало ровно в ширину
  let off = [], two = false, fw = 0;
  function fit(force) {
    const w = wm.clientWidth;
    if (!w || (w === fw && !force)) return; // адресная строка телефона меняет только высоту
    fw = w; wm.style.setProperty('--fs', '100px');
    const rows = wm.querySelectorAll('.wr');
    rows.forEach((r) => r.style.setProperty('--fs', '100px'));
    two = getComputedStyle(base[0].parentElement).display === 'flex';
    const fsOf = (r) => ((100 * w) / r.reduce((a, e) => a + e.offsetWidth, 0)) * 0.99;
    let fs;
    if (two) {
      // на телефоне каждая строка во всю ширину своим кеглем, как на афише: KOZ крупнее FLOW
      const f = [fsOf(base.slice(0, 3)), fsOf(base.slice(3))]; fs = f[1];
      wm.querySelectorAll('.wl').forEach((l) => [...l.children].forEach((r, i) => r.style.setProperty('--fs', f[i].toFixed(1) + 'px')));
    } else { fs = fsOf(base); rows.forEach((r) => r.style.removeProperty('--fs')); }
    wm.style.setProperty('--fs', fs.toFixed(1) + 'px'); wm.style.setProperty('--r', Math.round(clamp(fs * 1.05, 120, 320)) + 'px');
    off = base.map((e) => e.offsetLeft);
    if (RM) place();
  }
  // буквы поднимаются из-под края по очереди; остаются чуть утопленными в край страницы
  function setUp(i) {
    const rest = two && i < 3 ? 0 : 9, tr = `translateY(${(rest + (1 - up[i]) * (100 - rest + 4)).toFixed(1)}%)`;
    if (tr === trPrev[i]) return;
    trPrev[i] = tr; base[i].style.transform = tr; lit[i].style.transform = tr;
  }
  // без движения: лента стоит, но у каждой буквы свой кусок афиш
  function place() { up.fill(1); base.forEach((e, i) => { setUp(i); e.style.backgroundPosition = lit[i].style.backgroundPosition = `${-off[i]}px 50%`; }); }

  let booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    wm.style.setProperty('--strip', 'url(/assets/final/strip.jpg)');
    wm.style.setProperty('--dim', 'url(/assets/final/strip-dim.jpg)');
    fit(true);
    addEventListener('resize', () => fit());
    // шрифт секции грузится, только когда её текст начинают рисовать; ready к этому моменту может быть уже закрыт
    document.fonts?.load("100px 'STRome'").then(() => fit(true));
    if (RM) return;

    // луч: за курсором, без курсора и на телефоне гуляет сам
    let mx = -999, my = 0, tx = 0, ty = 0, auto = true, speed = 26, speedT = 26, bx = 0;
    if (!LOOP.coarse) {
      wm.addEventListener('pointermove', (e) => { const r = wm.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; auto = false; });
      wm.addEventListener('pointerenter', () => (speedT = 90));
      wm.addEventListener('pointerleave', () => { auto = true; speedT = 26; });
    }
    LOOP.add(wm, (t, ms) => {
      const dt = ms / 1000, box = LOOP.box(wm), top = box.top - scrollY;
      // k: 0 — слово только показалось снизу, 1 — видно целиком (это самый низ страницы)
      const k = clamp((LOOP.vh - top) / box.height, 0, 1);
      base.forEach((e, i) => {
        const p = clamp(k * 1.35 - i * 0.05, 0, 1), target = 1 - (1 - p) ** 3;
        up[i] += (target - up[i]) * (1 - Math.exp(-dt * 7));
        setUp(i);
      });
      speed += (speedT - speed) * (1 - Math.exp(-dt * 3)); bx -= speed * dt;
      base.forEach((e, i) => { const bp = `${(bx - off[i]).toFixed(1)}px 50%`; e.style.backgroundPosition = bp; lit[i].style.backgroundPosition = bp; });
      if (auto) { const u = t / 1000; tx = fw * (0.5 + Math.sin(u * 0.42) * 0.4); ty = box.height * (0.55 + Math.sin(u * 0.9) * 0.18); }
      if (mx < -900) { mx = tx; my = ty; }
      const a = 1 - Math.exp(-dt * (auto ? 3 : 9)); mx += (tx - mx) * a; my += (ty - my) * a;
      wm.style.setProperty('--mx', mx.toFixed(1) + 'px'); wm.style.setProperty('--my', my.toFixed(1) + 'px');
    }, { margin: '50px' });
  }
  if (!('IntersectionObserver' in window)) { boot(); return; }
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); boot(); } }, { rootMargin: '1200px 0px' });
  io.observe(root);
})();
