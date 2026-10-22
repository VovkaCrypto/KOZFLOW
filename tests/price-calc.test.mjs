// node --test tests/price-calc.test.mjs — логика калькулятора страниц услуг (значения из спеки)
import test from 'node:test';
import assert from 'node:assert/strict';
import { computeQuote, telegramLink, formatRub } from '../js/price-calc.js';

const threshold = { mode: 'threshold', threshold: 10000 };
const reel = {
  items: [
    { id: 'promo', name: 'Промо-ролик', price: 10000, from: true, kind: 'package' },
    { id: 'alive', name: 'Оживить макет', price: 2000, from: true, kind: 'package' },
    { id: 'format', name: 'Формат кадра', price: 1000, kind: 'extra' },
    { id: 'urgent', name: 'Срочно', price: 50, kind: 'percent' },
    { id: 'menu', name: 'Видеоменю', price: 30000, from: true, kind: 'perUnit', unit: 'блюд', included: 65, unitPrice: 500 },
  ],
  discounts: [{ id: 'first', name: 'Первый заказ', pct: 30 }],
  prepay: threshold,
};

test('пакет 10 000 + формат +1 000 ×2', () => {
  const q = computeQuote(reel, { items: { promo: true, format: 2 } });
  assert.equal(q.total, 12000);
  assert.equal(q.prepay, 6000);
  assert.equal(q.from, true);
});

test('«Оживить» от 2 000 — меньше порога, 100 % вперёд', () => {
  const q = computeQuote(reel, { items: { alive: true } });
  assert.equal(q.total, 2000);
  assert.equal(q.from, true);
  assert.equal(q.prepay, 2000);
});

test('скидка только к пакету, допы без скидки', () => {
  assert.equal(computeQuote(reel, { items: { promo: true }, discount: 'first' }).total, 7000);
  assert.equal(computeQuote(reel, { items: { promo: true, format: 1 }, discount: 'first' }).total, 8000);
});

test('срочно считается после скидки', () => {
  const q = computeQuote(reel, { items: { promo: true }, discount: 'first', urgent: true });
  assert.equal(q.total, 10500);
});

test('видеоменю: 65 блюд в цене, дальше +500', () => {
  assert.equal(computeQuote(reel, { items: { menu: 85 } }).total, 40000);
  assert.equal(computeQuote(reel, { items: { menu: 40 } }).total, 30000);
});

test('предоплата half и stages', () => {
  const site = { items: [{ id: 'site', name: 'Сайт', price: 40000, kind: 'package' }], prepay: { mode: 'half' } };
  assert.equal(computeQuote(site, { items: { site: true } }).prepay, 20000);
  const app = { items: [{ id: 'app', name: 'Приложение', price: 70000, kind: 'package' }], prepay: { mode: 'stages', stagePct: 30 } };
  const q = computeQuote(app, { items: { app: true } });
  assert.equal(q.prepay, 21000);
  assert.match(q.prepayLabel, /30\s%/);
});

test('ежемесячно — отдельно от итога', () => {
  const bot = { items: [{ id: 'voice', name: 'Голосовой бот', price: 50000, from: true, kind: 'package', monthly: { min: 10000, max: 40000 } }], prepay: threshold };
  const q = computeQuote(bot, { items: { voice: true } });
  assert.deepEqual(q.monthly, { min: 10000, max: 40000 });
  assert.equal(q.total, 50000);
});

test('пусто: итог 0, empty; только допы — не пусто', () => {
  const none = computeQuote(reel, { items: {} });
  assert.equal(none.total, 0);
  assert.equal(none.empty, true);
  assert.equal(Number.isNaN(none.prepay), false);
  assert.equal(computeQuote(reel, { items: {}, urgent: true }).empty, true);
  assert.equal(computeQuote(reel, { items: { format: 1 } }).empty, false);
});

test('telegramLink: кириллица и ₽ кодируются, текст ≤ 2000', () => {
  const q = computeQuote(reel, { items: { promo: true, format: 2 }, discount: 'first', urgent: true });
  const link = telegramLink(q, 'Моушен');
  assert.ok(link.startsWith('https://t.me/Vovka_Kozisss?text='));
  assert.ok(link.includes('%E2%82%BD'));
  const text = decodeURIComponent(link.split('?text=')[1]);
  assert.ok(text.includes('Моушен'));
  assert.ok(text.includes(formatRub(q.total)));
  assert.ok(text.length <= 2000);

  const many = { items: Array.from({ length: 300 }, (_, i) => ({ id: 'x' + i, name: 'Очень длинная позиция прайса номер ' + i, price: 1000, kind: 'extra' })), prepay: threshold };
  const sel = { items: Object.fromEntries(many.items.map((it) => [it.id, 1])) };
  const long = decodeURIComponent(telegramLink(computeQuote(many, sel), 'Дизайн').split('?text=')[1]);
  assert.ok(long.length <= 2000);
});

test('ревью: длинный расчёт не теряет «Итого» и предоплату', () => {
  const many = { items: Array.from({ length: 200 }, (_, i) => ({ id: 'x' + i, name: 'Доп ' + i, price: 1000, kind: 'extra' })), prepay: { mode: 'half' } };
  const q = computeQuote(many, { items: Object.fromEntries(many.items.map((it) => [it.id, 1])) });
  const text = decodeURIComponent(telegramLink(q, 'Дизайн').split('?text=')[1]);
  assert.ok(text.length <= 2000);
  assert.ok(text.endsWith(`Итого: ${formatRub(200000)}\nПредоплата 50 %: ${formatRub(100000)}`));
  assert.ok(text.includes('— …'));
});

test('ревью: странное количество не ломает расчёт', () => {
  assert.equal(computeQuote(reel, { items: { promo: true, urgent: '0' } }).total, 10000);
  assert.equal(computeQuote(reel, { items: { promo: true, urgent: -1 } }).total, 10000);
  assert.equal(computeQuote(reel, { items: { promo: true, urgent: 1 } }).total, 15000);
  assert.equal(computeQuote(reel, { items: { format: Infinity } }).empty, true);
  assert.equal(computeQuote(reel, { items: { promo: true }, discount: 'nope' }).total, 10000);
});

test('ревью: заголовок без текста и из эмодзи', () => {
  const q = computeQuote(reel, { items: { promo: true } });
  assert.ok(!decodeURIComponent(telegramLink(q).split('?text=')[1]).includes('undefined'));
  for (let n = 1; n < 6; n++) assert.doesNotThrow(() => telegramLink(q, 'x'.repeat(n) + '🎬'.repeat(400)));
});

test('ревью: скидка действует и на видеоменю (это пакет)', () => {
  assert.equal(computeQuote(reel, { items: { menu: 85 }, discount: 'first' }).total, 28000);
});

test('ревью: этапы в сумме 100 %, бот + приложение — каждый по своей схеме', () => {
  const app = { items: [{ id: 'app', name: 'Приложение', price: 70000, kind: 'package' }], prepay: { mode: 'stages', stagePct: 20 } };
  assert.match(computeQuote(app, { items: { app: true } }).prepayLabel, /20\s%\s\/\s60\s%\s\/\s20\s%/);
  const auto = {
    items: [
      { id: 'voice', name: 'Голосовой бот', price: 50000, from: true, kind: 'package', prepay: { mode: 'half' } },
      { id: 'app', name: 'Приложение', price: 70000, from: true, kind: 'package', prepay: { mode: 'stages', stagePct: 30 } },
    ],
    prepay: { mode: 'half' },
  };
  const q = computeQuote(auto, { items: { voice: true, app: true } });
  assert.equal(q.total, 120000);
  assert.equal(q.prepay, 25000 + 21000);
  assert.match(q.prepayLabel, /Голосовой бот: предоплата 50\s%/);
  assert.match(q.prepayLabel, /Приложение: оплата этапами: 30\s%/);
});

test('ревью: склонение единиц у поштучного пакета', () => {
  const cfg = { ...reel, items: reel.items.map((it) => (it.id === 'menu' ? { ...it, unit: ['блюдо', 'блюда', 'блюд'] } : it)) };
  const name = (n) => computeQuote(cfg, { items: { menu: n } }).lines[0].name;
  assert.equal(name(1), 'Видеоменю, 1 блюдо');
  assert.equal(name(3), 'Видеоменю, 3 блюда');
  assert.equal(name(11), 'Видеоменю, 11 блюд');
  assert.equal(name(85), 'Видеоменю, 85 блюд');
});

test('formatRub: неразрывные пробелы', () => {
  assert.equal(formatRub(12000), '12 000 ₽');
  assert.equal(formatRub(500), '500 ₽');
  assert.equal(formatRub(1250000), '1 250 000 ₽');
});

test('только ежемесячная позиция: без строки «0 ₽», в «Ежемесячно»', () => {
  const cfg = { items: [
    { id: 'site', name: 'Сайт', price: 40000, kind: 'package' },
    { id: 'support', name: 'Поддержка', price: 0, kind: 'extra', monthly: { min: 5000, max: 5000 } },
  ], prepay: { mode: 'half' } };
  const q = computeQuote(cfg, { items: { site: true, support: true } });
  assert.equal(q.total, 40000);
  assert.equal(q.lines.length, 1);
  assert.deepEqual(q.monthly, { min: 5000, max: 5000 });
  assert.ok(decodeURIComponent(telegramLink(q, 'Сайты').split('?text=')[1]).includes('Ежемесячно: 5\u00a0000\u00a0₽\n'));
});

test('оптовая цена: фото от 5 штук — по 1 000 ₽ за кадр', () => {
  const cfg = { items: [
    { id: 'photo', name: 'Фото блюда с нуля', price: 1200, counter: true, bulk: { from: 5, price: 1000 }, kind: 'extra' },
  ], prepay: { mode: 'threshold', threshold: 10000 } };
  assert.equal(computeQuote(cfg, { items: { photo: 4 } }).total, 4800);
  assert.equal(computeQuote(cfg, { items: { photo: 5 } }).total, 5000);
  assert.equal(computeQuote(cfg, { items: { photo: 12 } }).total, 12000);
  assert.equal(computeQuote(cfg, { items: { photo: 5 } }).lines[0].name, 'Фото блюда с нуля ×5');
});
