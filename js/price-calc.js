// price-calc.js — расчёт калькулятора страниц услуг, без DOM.
// Порядок: пакеты → скидка к пакетам → + допы → процентные позиции (срочно) к итогу → предоплата.
// Поштучный пакет (видеоменю) — тоже пакет: скидка к нему применяется.

const NBSP = ' ';
const TG = 'https://t.me/Vovka_Kozisss?text=';
const TG_MAX = 2000;
const MORE = '— …\n';

export function formatRub(n) {
  const s = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return s + NBSP + '₽';
}

// unit — строка или три формы: ['блюдо', 'блюда', 'блюд']
export function plural(unit, n) {
  if (!Array.isArray(unit)) return unit;
  const a = n % 100, b = n % 10;
  return unit[a > 10 && a < 20 ? 2 : b === 1 ? 0 : b >= 2 && b <= 4 ? 1 : 2];
}

const qtyOf = (v) => {
  const n = v === true ? 1 : Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

export function computeQuote(config, selection = {}) {
  const picked = selection.items || {};
  const lines = [];
  const parts = []; // сумма по позиции и её схема предоплаты — для смешанного выбора
  let packages = 0, rest = 0, from = false, monthly = null;

  for (const it of config.items) {
    const q = qtyOf(picked[it.id]);
    if (!q || it.kind === 'percent') continue;
    const amount = it.kind === 'perUnit'
      ? it.price + Math.max(0, q - (it.included || 0)) * (it.unitPrice || 0)
      : it.price * q;
    const name = it.kind === 'perUnit' ? `${it.name}, ${q}${it.unit ? ' ' + plural(it.unit, q) : ''}` : q > 1 ? `${it.name} ×${q}` : it.name;
    // только ежемесячная позиция (поддержка 5 000 ₽/мес): строки «0 ₽» нет, идёт в «Ежемесячно»
    if (amount === 0 && it.monthly) { monthly = { min: (monthly?.min || 0) + it.monthly.min, max: (monthly?.max || 0) + it.monthly.max }; continue; }
    if (it.kind === 'extra') rest += amount; else packages += amount;
    lines.push({ name, amount, from: !!it.from });
    parts.push({ name: it.name, amount, prepay: it.prepay });
    if (it.from) from = true;
    if (it.monthly) monthly = { min: (monthly?.min || 0) + it.monthly.min, max: (monthly?.max || 0) + it.monthly.max };
  }

  const empty = lines.length === 0;
  const disc = !empty && selection.discount && (config.discounts || []).find((d) => d.id === selection.discount);
  if (disc && packages > 0) {
    const cut = Math.round(packages * disc.pct / 100);
    packages -= cut;
    lines.push({ name: `${disc.name} −${disc.pct}${NBSP}%`, amount: -cut, from: false });
  }

  let total = packages + rest;
  if (!empty) {
    for (const it of config.items) {
      if (it.kind !== 'percent') continue;
      if (!qtyOf(picked[it.id]) && !(selection.urgent && it.id === 'urgent')) continue;
      const add = Math.round(total * it.price / 100);
      total += add;
      lines.push({ name: `${it.name} +${it.price}${NBSP}%`, amount: add, from: !!it.from });
      if (it.from) from = true;
    }
  }

  const { prepay, prepayLabel } = prepayFor(config.prepay || { mode: 'threshold', threshold: 10000 }, total, parts);
  return { total, from, prepay, prepayLabel, monthly, lines, empty };
}

const pct = (n) => `${n}${NBSP}%`;

function rateOf(p, total) {
  if (p.mode === 'half') return { rate: 0.5, label: `Предоплата ${pct(50)}` };
  if (p.mode === 'stages') {
    const s = p.stages || [p.stagePct ?? 30, 100 - 2 * (p.stagePct ?? 30), p.stagePct ?? 30];
    return { rate: s[0] / 100, label: `Оплата этапами: ${s.map(pct).join(' / ')}` };
  }
  const limit = p.threshold ?? 10000;
  return total < limit
    ? { rate: 1, label: `До ${formatRub(limit)} — ${pct(100)} вперёд` }
    : { rate: 0.5, label: `Предоплата ${pct(50)}` };
}

// Своя схема у позиции (бот 50/50 + приложение 30/40/30) — предоплата по долям итога.
function prepayFor(page, total, parts) {
  if (!total) return { prepay: 0, prepayLabel: '' };
  if (!parts.some((x) => x.prepay)) {
    const { rate, label } = rateOf(page, total);
    return { prepay: Math.round(total * rate), prepayLabel: label };
  }
  const base = parts.reduce((s, x) => s + x.amount, 0) || 1;
  let prepay = 0;
  const labels = [];
  for (const x of parts) {
    const share = total * x.amount / base;
    const { rate, label } = rateOf(x.prepay || page, share);
    prepay += share * rate;
    labels.push(`${x.name}: ${label.charAt(0).toLowerCase()}${label.slice(1)}`);
  }
  return { prepay: Math.round(prepay), prepayLabel: labels.join('; ') };
}

// Обрезка по кодовым точкам, чтобы не разрезать эмодзи (одиночный суррогат ломает encodeURIComponent).
const cut = (s, n) => (s.length <= n ? s : Array.from(s.slice(0, n + 1)).reduce((a, ch) => (a.length + ch.length <= n ? a + ch : a), ''));

export const monthlyText = (m) => (m.min === m.max ? formatRub(m.min) : `${formatRub(m.min)} – ${formatRub(m.max)}`);

export function telegramLink(quote, pageTitle = '') {
  const ot = (f) => (f ? 'от ' : '');
  const head = cut(pageTitle ? `Здравствуйте! Мой расчёт на странице «${pageTitle}»:` : 'Здравствуйте! Мой расчёт стоимости:', 300);
  const tail = cut([
    `Итого: ${ot(quote.from)}${formatRub(quote.total)}`,
    quote.monthly ? `Ежемесячно: ${monthlyText(quote.monthly)}` : '',
    quote.prepayLabel ? `${quote.prepayLabel}: ${formatRub(quote.prepay)}` : '',
  ].filter(Boolean).join('\n'), 600);

  const room = TG_MAX - head.length - tail.length - 2;
  let body = '';
  for (const l of quote.lines) {
    const row = `— ${l.name}: ${l.amount < 0 ? '−' + formatRub(-l.amount) : ot(l.from) + formatRub(l.amount)}\n`;
    if (body.length + row.length + MORE.length > room) { body += MORE; break; }
    body += row;
  }
  return TG + encodeURIComponent(`${head}\n${body}\n${tail}`);
}
