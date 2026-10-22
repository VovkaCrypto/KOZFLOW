// price.js — общий скрипт страниц услуг: калькулятор из #calc-config, кнопки [data-pick],
// ленивые видео (играют только на экране), появление блоков каскадом.
import { computeQuote, telegramLink, formatRub, plural } from './price-calc.js';

document.documentElement.classList.remove('no-js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/* ── калькулятор ── */
const cfgEl = document.getElementById('calc-config');
const calc = document.getElementById('calc');
let pick = () => {};

if (cfgEl && calc) {
  const cfg = JSON.parse(cfgEl.textContent);
  const isPack = (it) => it.kind === 'package' || it.kind === 'perUnit';
  const state = { items: {}, discount: '', urgent: false };
  const opts = calc.querySelector('.calc-opts');
  const total = calc.querySelector('.total');

  const priceLabel = (it) => {
    if (it.kind === 'percent') return `+${it.price} %`;
    const p = (it.from ? 'от ' : '') + formatRub(it.price);
    return it.kind === 'extra' && !it.from && it.plus ? '+' + p : p;
  };
  const optHtml = (it, role) => {
    const q = it.kind === 'perUnit' || it.counter;
    return `<div class="opt-row"><button type="button" class="opt${role === 'checkbox' ? ' box' : ''}" aria-pressed="false" data-id="${esc(it.id)}">` +
      `<span class="mk"></span><span class="nm">${esc(it.name)}${it.note ? `<br><small style="color:var(--ink-mute)">${esc(it.note)}</small>` : ''}</span><span class="pr">${priceLabel(it)}</span></button>` +
      (q ? `<div class="qty" data-for="${esc(it.id)}"><button type="button" aria-label="Меньше">−</button>` +
        `<input type="number" inputmode="numeric" min="1" max="999" value="${it.kind === 'perUnit' ? it.included || 1 : 1}" aria-label="Количество">` +
        `<button type="button" aria-label="Больше">+</button>${it.unit ? `<small>${esc(plural(it.unit, 5))}</small>` : ''}</div>` : '') + '</div>';
  };

  // группы: пакеты (выбор одного) → допы по группам → скидки → срочно
  const groups = [];
  const packs = cfg.items.filter(isPack);
  if (packs.length) groups.push(`<div class="calc-group"><h3>${esc(cfg.packTitle || 'Пакет')}</h3><div class="calc-list" role="group" aria-label="${esc(cfg.packTitle || 'Пакет')}: можно выбрать один">${packs.map((it) => optHtml(it, 'radio')).join('')}</div></div>`);
  const extraGroups = [...new Set(cfg.items.filter((it) => !isPack(it)).map((it) => it.group || 'Дополнительно'))];
  for (const g of extraGroups) {
    const list = cfg.items.filter((it) => !isPack(it) && (it.group || 'Дополнительно') === g);
    groups.push(`<div class="calc-group"><h3>${esc(g)}</h3><div class="calc-list" role="group" aria-label="${esc(g)}">${list.map((it) => optHtml(it, 'checkbox')).join('')}</div></div>`);
  }
  if (cfg.discounts?.length) {
    groups.push(`<div class="calc-group"><h3>Скидка к пакету</h3><div class="chips" role="group" aria-label="Скидка к пакету">` +
      [{ id: '', name: 'Без скидки' }, ...cfg.discounts].map((d) =>
        `<button type="button" class="chip" aria-pressed="${d.id === '' ? 'true' : 'false'}" data-disc="${esc(d.id)}">${esc(d.name)}${d.pct ? ` −${d.pct} %` : ''}</button>`).join('') +
      `</div><p class="pg-note disc-hint">Скидка действует на пакет — сначала выберите его.</p>${cfg.discountNote ? `<p class="pg-note">${esc(cfg.discountNote)}</p>` : ''}</div>`);
  }
  opts.innerHTML = groups.join('');

  total.innerHTML = `<div class="eyebrow">Итого</div><div class="sum" aria-live="polite">0 ₽</div><div class="hint"></div>` +
    `<button type="button" class="more">Подробнее</button><div class="tl"></div>` +
    `<div class="acts"><a class="btn gold tg" target="_blank" rel="noopener"><span class="lg">Отправить в </span>Telegram <span class="ar">→</span></a>` +
    `<button type="button" class="btn copy">Скопировать</button></div><div class="ok" aria-live="polite"></div>`;
  const $ = (s) => total.querySelector(s);
  $('.more').addEventListener('click', () => $('.tl').classList.toggle('open'));

  // количество из поля: 1…999, целое; то, что посчитано, возвращается в поле
  const norm = (v) => { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.max(1, Math.min(999, n)) : 1; };
  const qtyVal = (id, write) => {
    const inp = opts.querySelector(`.qty[data-for="${CSS.escape(id)}"] input`);
    if (!inp) return true;
    const n = norm(inp.value);
    if (write) inp.value = n;
    return n;
  };

  const render = () => {
    for (const b of opts.querySelectorAll('.opt')) {
      const on = state.items[b.dataset.id] != null;
      b.setAttribute('aria-pressed', on);
      b.parentElement.querySelector('.qty')?.classList.toggle('on', on);
    }
    const pack = packs.find((it) => state.items[it.id] != null);
    for (const c of opts.querySelectorAll('.chip')) {
      c.setAttribute('aria-pressed', c.dataset.disc === state.discount);
      c.disabled = !pack && c.dataset.disc !== '';
    }
    const dnote = opts.querySelector('.disc-hint');
    if (dnote) dnote.hidden = !!pack;

    const q = computeQuote(cfg, state);
    const term = pack?.term ? (state.items.urgent != null ? `вдвое короче, чем ${pack.term}` : pack.term) : '';
    $('.sum').textContent = q.empty ? formatRub(0) : (q.from ? 'от ' : '') + formatRub(q.total);
    $('.hint').textContent = q.empty ? 'Отметьте пакет или нужные позиции' : q.from ? '«от» — точную цену назову после разговора' : '';
    const rows = q.lines.map((l) => `<div class="${l.amount < 0 ? 'neg' : ''}"><span>${esc(l.name)}</span><b>${l.amount < 0 ? '−' + formatRub(-l.amount) : (l.from ? 'от ' : '') + formatRub(l.amount)}</b></div>`);
    if (!q.empty) rows.push(`<div><span>${esc(q.prepayLabel)}</span><b>${formatRub(q.prepay)}</b></div>`);
    if (q.monthly) rows.push(`<div><span>Ежемесячно</span><b>${formatRub(q.monthly.min)} – ${formatRub(q.monthly.max)}</b></div>`);
    if (term) rows.push(`<div><span>Срок</span><b>${esc(term)}</b></div>`);
    $('.tl').innerHTML = rows.join('');
    const tg = $('.tg');
    if (q.empty) { tg.removeAttribute('href'); tg.setAttribute('aria-disabled', 'true'); tg.setAttribute('disabled', ''); }
    else { tg.href = telegramLink(q, cfg.title); tg.removeAttribute('aria-disabled'); tg.removeAttribute('disabled'); }
    $('.copy').disabled = q.empty;
    $('.ok').textContent = '';
  };

  const toggle = (id, force) => {
    const it = cfg.items.find((x) => x.id === id);
    if (!it) return;
    const on = force ?? state.items[id] == null;
    if (isPack(it)) for (const p of packs) delete state.items[p.id];
    if (on) state.items[id] = it.kind === 'perUnit' || it.counter ? qtyVal(id) : true;
    else delete state.items[id];
    render();
  };
  pick = (id) => toggle(id, true);

  opts.addEventListener('click', (e) => {
    const b = e.target.closest('.opt');
    if (b) return toggle(b.dataset.id);
    const c = e.target.closest('.chip');
    if (c) { state.discount = c.dataset.disc; return render(); }
    const s = e.target.closest('.qty button');
    if (s) {
      const box = s.closest('.qty'), inp = box.querySelector('input');
      inp.value = norm(norm(inp.value) + (s.textContent === '+' ? 1 : -1));
      state.items[box.dataset.for] = qtyVal(box.dataset.for);
      render();
    }
  });
  opts.addEventListener('input', (e) => {
    const box = e.target.closest('.qty');
    if (box && state.items[box.dataset.for] != null) { state.items[box.dataset.for] = qtyVal(box.dataset.for); render(); }
  });
  opts.addEventListener('change', (e) => {
    const box = e.target.closest('.qty');
    if (!box) return;
    const n = qtyVal(box.dataset.for, true);
    if (state.items[box.dataset.for] != null) { state.items[box.dataset.for] = n; render(); }
  });
  $('.copy').addEventListener('click', async () => {
    const href = $('.tg').getAttribute('href');
    if (!href) return;
    const text = decodeURIComponent(href.split('?text=')[1]);
    try { await navigator.clipboard.writeText(text); $('.ok').textContent = 'Скопировано — вставьте в любой мессенджер'; }
    catch { $('.ok').textContent = 'Не получилось скопировать — нажмите «Отправить в Telegram»'; }
  });
  render();
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-pick]');
  if (!b) return;
  e.preventDefault();
  pick(b.dataset.pick);
  document.getElementById('calc')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
});

/* ── видео: играют только на экране; при reduced-motion — постер и кнопка ── */
const vids = [...document.querySelectorAll('video[data-play]')];
const startStop = (v, on) => {
  if (on) v.play().catch(() => v.closest('figure')?.classList.add('paused'));
  else v.pause();
};
for (const v of vids) {
  v.muted = true;
  const fig = v.closest('figure');
  if (reduced) {
    v.removeAttribute('autoplay');
    v.pause();
    fig?.classList.add('paused');
  }
  if (fig && !fig.querySelector('.play')) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'play'; b.setAttribute('aria-label', 'Смотреть'); b.textContent = '▶';
    b.addEventListener('click', () => { fig.classList.remove('paused'); fig.dataset.user = '1'; v.play().catch(() => {}); });
    (fig.querySelector('.clip') || fig).appendChild(b);
  }
}
if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => startStop(e.target, e.isIntersecting)), { rootMargin: '150px 0px' });
  vids.forEach((v) => io.observe(v));
}

/* ── появление: каскад внутри секции, по порядку элементов ── */
const rv = [...document.querySelectorAll('.rv')];
if (reduced || !('IntersectionObserver' in window)) rv.forEach((el) => el.classList.add('in'));
else {
  for (const sec of document.querySelectorAll('section')) sec.querySelectorAll('.rv').forEach((el, i) => el.style.setProperty('--i', Math.min(i, 8)));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  rv.forEach((el) => io.observe(el));
}
