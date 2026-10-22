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

test('formatRub: неразрывные пробелы', () => {
  assert.equal(formatRub(12000), '12 000 ₽');
  assert.equal(formatRub(500), '500 ₽');
  assert.equal(formatRub(1250000), '1 250 000 ₽');
});
