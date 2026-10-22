// node tests/check-prices.mjs — цены и связки страниц услуг сверены со спекой (2026-10-22 — страницы услуг — дизайн.md)
// Текст страницы = HTML без <head> и тегов (конфиг калькулятора внутри <script> тоже считается), неразрывный пробел → обычный.
// Цена ищется целым числом: «5 000 ₽» не засчитывается внутри «15 000 ₽».
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LINKS = ['/sayty', '/dizayn', '/moushen', '/avtomatizacii'];
const NBSP = String.fromCharCode(160);

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
    // прайс графики построчно: «название<b>цена»
    lines: [
      ['Пост или сторис', '1 200 ₽'], ['Серия из пяти в одном стиле', '4 500 ₽'], ['Карусель до восьми слайдов', '3 000 ₽'],
      ['Оформление группы: обложка, аватар, меню', '2 800 ₽'], ['Креатив под рекламу с вариантами для теста', '1 500 ₽'],
      ['Афиша или постер, под печать и соцсети', '3 000 ₽'], ['Меню — основное или барное', 'от 6 000 ₽'], ['QR-меню под телефон', 'от 4 500 ₽'],
      ['Тейбл-тент, флаер, листовка', '2 200 ₽'], ['Мелочи в одном стиле: наклейки, номерки, ценники', '2 000 ₽'], ['Сертификат или ваучер', '2 200 ₽'],
      ['Этикетка или упаковка', 'от 4 500 ₽'], ['Наружка: билборд, штендер, реклама в лифте', '3 500 ₽'],
      ['Логотип: три направления, финал в векторе', '5 000 ₽'], ['Логотип и мини-брендбук: палитра, шрифты, правила', '14 000 ₽'], ['Визитки и бланки', '2 000 ₽'],
      ['Презентация до 15 слайдов, файлом', '9 000 ₽'], ['Интерактивная презентация, ссылкой', '15 000 ₽'],
      ['Фото блюда или товара с нуля', '1 200 ₽ за кадр'], ['То же от пяти кадров', '1 000 ₽ за кадр'], ['Ретушь: фото блюда аппетитнее', '800 ₽'],
      ['Убрать или заменить фон', '400 ₽'], ['Убрать лишнее из кадра', '600 ₽'], ['Восстановить старое фото или логотип', '600 ₽'],
      ['Концепт-рендер зала, витрины, подачи', '3 000 ₽'],
    ],
    need: ['9 000 ₽', '20 000 ₽', 'от 15 000 ₽', 'от 35 000 ₽', '500 ₽ за круг', '+50 %', 'около 9 400 ₽', 'около 25 600 ₽'],
    ban: ['Видео и движение', '12 000 ₽', '20 000 ₽ — 4–7', 'Промо-страница'],
    // та же цена у позиции калькулятора
    calc: { post: 1200, series: 4500, carousel: 3000, group: 2800, ad: 1500, poster: 3000, menu: 6000, qr: 4500, tent: 2200,
      small: 2000, cert: 2200, pack: 4500, outdoor: 3500, logo: 5000, brandbook: 14000, cards: 2000, pres: 9000, presi: 15000,
      photo: 1200, retouch: 800, bg: 400, clean: 600, restore: 600, render: 3000, rounds: 500, urgent: 50,
      'kit-promo': 9000, 'kit-month': 20000, 'kit-menu': 15000, 'kit-start': 35000 },
  },
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (text, s) => new RegExp('(?<!\\d)(?<!\\d )' + esc(s)).test(text);
const norm = (s) => s.split(NBSP).join(' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

const errors = [];
for (const [page, { need, ban, lines = [], calc }] of Object.entries(PAGES)) {
  const html = norm(fs.readFileSync(path.join(root, page), 'utf8'));
  const text = html.replace(/<head>[\s\S]*?<\/head>/, ' ').replace(/<[^>]+>/g, ' ');
  for (const s of need) if (!has(text, s)) errors.push(`${page}: нет «${s}»`);
  for (const [name, price] of lines) if (!html.includes(`<div>${name}<b>${price}</b></div>`)) errors.push(`${page}: в прайсе нет «${name} — ${price}»`);
  if (calc) {
    const cfg = JSON.parse(html.match(/id="calc-config">([\s\S]*?)<\/script>/)[1]);
    const byId = Object.fromEntries(cfg.items.map((it) => [it.id, it.price]));
    for (const [id, price] of Object.entries(calc)) if (byId[id] !== price) errors.push(`${page}: калькулятор ${id} = ${byId[id]}, нужно ${price}`);
    const bulk = cfg.items.find((it) => it.id === 'photo')?.bulk;
    if (bulk?.from !== 5 || bulk?.price !== 1000) errors.push(`${page}: фото от 5 шт — по 1 000 ₽`);
  }
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
