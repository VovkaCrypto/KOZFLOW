// price-calc.js — расчёт калькулятора страниц услуг, без DOM.
// Порядок: пакеты → скидка к пакетам → + допы и поштучные → процентные позиции (срочно) к итогу → предоплата.

const NBSP = ' ';
const TG = 'https://t.me/Vovka_Kozisss?text=';
const TG_MAX = 2000;

export function formatRub(n) {
  const s = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return s + NBSP + '₽';
}

const qtyOf = (v) => (v === true ? 1 : Number(v) > 0 ? Math.floor(Number(v)) : 0);

export function computeQuote(config, selection = {}) {
  const picked = selection.items || {};
  const lines = [];
  let packages = 0, rest = 0, from = false, monthly = null;

  const take = (it) => {
    if (it.from) from = true;
    if (it.monthly) monthly = { min: (monthly?.min || 0) + it.monthly.min, max: (monthly?.max || 0) + it.monthly.max };
  };

  for (const it of config.items) {
    const q = qtyOf(picked[it.id]);
    if (!q || it.kind === 'percent') continue;
    if (it.kind === 'package') {
      packages += it.price * q;
      lines.push({ name: q > 1 ? `${it.name} ×${q}` : it.name, amount: it.price * q, from: !!it.from });
    } else if (it.kind === 'perUnit') {
      const amount = it.price + Math.max(0, q - (it.included || 0)) * (it.unitPrice || 0);
      rest += amount;
      lines.push({ name: `${it.name}, ${q}${it.unit ? ' ' + it.unit : ''}`, amount, from: !!it.from });
    } else {
      rest += it.price * q;
      lines.push({ name: q > 1 ? `${it.name} ×${q}` : it.name, amount: it.price * q, from: !!it.from });
    }
    take(it);
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
      if (!picked[it.id] && !(selection.urgent && it.id === 'urgent')) continue;
      const add = Math.round(total * it.price / 100);
      total += add;
      lines.push({ name: `${it.name} +${it.price}${NBSP}%`, amount: add, from: !!it.from });
      take(it);
    }
  }

  const { prepay, prepayLabel } = prepayFor(config.prepay || { mode: 'threshold', threshold: 10000 }, total);
  return { total, from, prepay, prepayLabel, monthly, lines, empty };
}

function prepayFor(p, total) {
  if (!total) return { prepay: 0, prepayLabel: '' };
  if (p.mode === 'half') return { prepay: Math.round(total / 2), prepayLabel: `Предоплата 50${NBSP}%` };
  if (p.mode === 'stages') {
    const pct = p.stagePct ?? 30;
    return { prepay: Math.round(total * pct / 100), prepayLabel: `Оплата этапами: ${pct}${NBSP}% на старте, 40${NBSP}% на сборке, ${pct}${NBSP}% при сдаче` };
  }
  const limit = p.threshold ?? 10000;
  return total < limit
    ? { prepay: total, prepayLabel: `До ${formatRub(limit)} — 100${NBSP}% вперёд` }
    : { prepay: Math.round(total / 2), prepayLabel: `Предоплата 50${NBSP}%` };
}

export function telegramLink(quote, pageTitle) {
  const ot = (f) => (f ? 'от ' : '');
  const head = `Здравствуйте! Посчитал на странице «${pageTitle}»:`;
  const tail = [
    `Итого: ${ot(quote.from)}${formatRub(quote.total)}`,
    quote.monthly ? `Ежемесячно: ${formatRub(quote.monthly.min)} – ${formatRub(quote.monthly.max)}` : '',
    quote.prepayLabel,
  ].filter(Boolean).join('\n');

  let body = '';
  for (const l of quote.lines) {
    const row = `— ${l.name}: ${l.amount < 0 ? '−' + formatRub(-l.amount) : ot(l.from) + formatRub(l.amount)}\n`;
    if (head.length + 1 + body.length + row.length + 2 + tail.length > TG_MAX) { body += '— …\n'; break; }
    body += row;
  }
  const text = `${head}\n${body}\n${tail}`.slice(0, TG_MAX);
  return TG + encodeURIComponent(text);
}
