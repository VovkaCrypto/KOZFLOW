// node tests/check-prices.mjs — цены и связки страниц услуг сверены со спекой (2026-10-22 — страницы услуг — дизайн.md)
// Текст страницы = HTML без тегов (конфиг калькулятора внутри <script> тоже считается),   → пробел.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LINKS = ['/sayty', '/dizayn', '/moushen', '/avtomatizacii'];

const PAGES = {
  'moushen.html': {
    need: ['от 2 000 ₽', 'от 5 000 ₽', 'от 10 000 ₽', 'от 30 000 ₽', 'до 65 блюд', '+500 ₽', '+3 000 ₽', 'от 15 000 ₽', '1 500 ₽', '2 000 ₽',
      'от 7 000 ₽', '4 000 ₽', '3 000 ₽', 'от 9 000 ₽', '+1 000 ₽', '−30 %', '−20 %', '+50 %'],
    ban: [],
  },
  'avtomatizacii.html': {
    need: ['20 000 ₽', '40 000 ₽', '50 000 ₽', 'от 10 000 ₽', 'от 25 000 ₽', 'от 70 000 ₽', '1 500 ₽', '10 000–40 000 ₽', 'пример расчёта'],
    ban: [/Кинз[а-яё]*[^.]{0,40}\bбот|\bбот[^.]{0,40}Кинз/i],
  },
  'sayty.html': {
    need: ['25 000 ₽', '40 000 ₽', '5 000 ₽', 'от 10 000 ₽', '3 000 ₽', 'Связь с 1С'],
    ban: ['Личный кабинет, связь с 1С'],
  },
  'dizayn.html': {
    need: ['1 200 ₽', '3 000 ₽', 'от 6 000 ₽', '5 000 ₽', '14 000 ₽', '9 000 ₽', '20 000 ₽', 'от 15 000 ₽', 'от 35 000 ₽'],
    ban: ['Видео и движение', '12 000 ₽', '20 000 ₽ — 4–7', 'Промо-страница'],
  },
};

const errors = [];
for (const [page, { need, ban }] of Object.entries(PAGES)) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/&amp;/g, '&');
  for (const s of need) if (!text.includes(s)) errors.push(`${page}: нет «${s}»`);
  for (const b of ban) {
    const hit = typeof b === 'string' ? text.includes(b) && b : (text.match(b) || [])[0];
    if (hit) errors.push(`${page}: запрещено «${hit}»`);
  }
  for (const l of LINKS) if (!html.includes(`href="${l}"`)) errors.push(`${page}: нет ссылки ${l}`);
}

if (errors.length) {
  console.log(errors.join('\n'));
  process.exit(1);
}
console.log('OK prices');
