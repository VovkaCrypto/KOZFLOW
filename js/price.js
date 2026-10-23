// price.js — общий скрипт страниц услуг: калькулятор из #calc-config, кнопки [data-pick],
// ленивые видео (играют только на экране), появление блоков каскадом.
import { computeQuote, telegramLink, formatRub, plural, monthlyText } from './price-calc.js';

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
    if (!it.price && it.monthly) return monthlyText(it.monthly) + ' / мес';
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
  // пакеты группами (боты / автоматизации); в каждой группе выбирается один
  const packGroup = (it) => it.group || cfg.packTitle || 'Пакет';
  for (const g of [...new Set(packs.map(packGroup))]) {
    const list = packs.filter((it) => packGroup(it) === g);
    groups.push(`<div class="calc-group"><h3>${esc(g)}</h3><div class="calc-list" role="group" aria-label="${esc(g)}: можно выбрать один">${list.map((it) => optHtml(it, 'radio')).join('')}</div></div>`);
  }
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
  calc.insertAdjacentHTML('afterend', '<p class="pg-note calc-offer">Расчёт ориентировочный и не является публичной офертой: итоговая цена — в ТЗ и договоре.</p>');
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
    const terms = packs.filter((it) => state.items[it.id] != null && it.term).map((it) => it.term).join(' + ');
    const term = terms ? (state.items.urgent != null ? `вдвое короче, чем ${terms}` : terms) : '';
    $('.sum').textContent = q.empty ? formatRub(0) : (q.from ? 'от ' : '') + formatRub(q.total);
    $('.hint').textContent = q.empty ? 'Отметьте пакет или нужные позиции' : q.from ? '«от» — точную цену назову после разговора' : '';
    const rows = q.lines.map((l) => `<div class="${l.amount < 0 ? 'neg' : ''}"><span>${esc(l.name)}</span><b>${l.amount < 0 ? '−' + formatRub(-l.amount) : (l.from ? 'от ' : '') + formatRub(l.amount)}</b></div>`);
    if (!q.empty) rows.push(`<div><span>${esc(q.prepayLabel)}</span><b>${formatRub(q.prepay)}</b></div>`);
    if (q.monthly) rows.push(`<div><span>Ежемесячно</span><b>${monthlyText(q.monthly)}</b></div>`);
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
    if (isPack(it)) for (const p of packs) if (packGroup(p) === packGroup(it)) delete state.items[p.id];
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

/* ── переписка с ботом: [data-chat] с <script type="application/json"> внутри — диалоги по кругу ── */
for (const el of document.querySelectorAll('[data-chat]')) {
  const dialogs = JSON.parse(el.querySelector('script').textContent);
  const av = el.querySelector('.av'), who = el.querySelector('.who'), where = el.querySelector('.where'), box = el.querySelector('.msgs');
  const show = (d) => { av.textContent = d.who[0]; who.textContent = d.who; where.textContent = d.where; };
  const bubble = (c, t) => { const b = document.createElement('div'); b.className = 'mg ' + c; b.textContent = t; box.appendChild(b); requestAnimationFrame(() => b.classList.add('on')); return b; };
  if (reduced) { show(dialogs[0]); dialogs[0].m.forEach(([c, t]) => bubble(c, t).classList.add('on')); continue; }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  (async () => {
    for (let k = 0; ; k = (k + 1) % dialogs.length) {
      const d = dialogs[k];
      box.replaceChildren(); show(d);
      await wait(500);
      for (const [c, t] of d.m) {
        if (c === 'a') { const ty = bubble('a ty', ''); ty.innerHTML = '<i></i><i></i><i></i>'; await wait(1100); ty.remove(); }
        bubble(c, t);
        await wait(c === 'a' ? 1500 : 1000);
      }
      await wait(2600);
    }
  })();
}

/* ── калькулятор выгоды: #gain — зарплата × ставки (+ взносы) против расхода на бота ── */
const gain = document.getElementById('gain');
if (gain) {
  const out = (k) => gain.querySelector(`[data-out="${k}"]`);
  const num = (n) => { const v = Number(String(gain.elements[n].value).replace(/\s/g, '')); return Number.isFinite(v) && v > 0 ? v : 0; };
  const calcGain = () => {
    const staff = num('salary') * num('rates') * (gain.elements.taxes.checked ? 1.3 : 1);
    const diff = Math.round(staff - num('bot'));
    out('staff').textContent = formatRub(staff);
    out('month').textContent = (diff < 0 ? '−' : '') + formatRub(Math.abs(diff));
    out('year').textContent = (diff < 0 ? '−' : '') + formatRub(Math.abs(diff * 12));
    const pack = Number(gain.dataset.pack) || 0;
    out('payback').textContent = diff > 0 && pack ? `${Math.max(1, Math.ceil(pack / diff))} мес.` : '—';
  };
  gain.addEventListener('input', calcGain);
  gain.addEventListener('submit', (e) => e.preventDefault());
  calcGain();
}

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
  // у роликов со звуком — кнопка звука; включённый звук глушит остальные ролики
  if (fig && v.hasAttribute('data-sound') && !fig.querySelector('.snd')) {
    const s = document.createElement('button');
    s.type = 'button'; s.className = 'snd'; s.setAttribute('aria-label', 'Звук'); s.setAttribute('aria-pressed', 'false');
    s.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="off" d="m16 9 5 6m0-6-5 6"/><path class="on" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>';
    s.addEventListener('click', () => {
      const on = v.muted;
      for (const o of vids) { o.muted = true; o.closest('figure')?.querySelector('.snd')?.setAttribute('aria-pressed', 'false'); }
      v.muted = !on;
      s.setAttribute('aria-pressed', String(on));
      if (on) { fig.classList.remove('paused'); v.play().catch(() => {}); }
    });
    (fig.querySelector('.clip') || fig).appendChild(s);
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
