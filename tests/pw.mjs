// Общее для проверок в браузере: Playwright из глобальных модулей, адрес сайта и телефон/ПК.
// Адрес — флагом --base (по умолчанию локальный сервер `python -m http.server 8731 --bind 127.0.0.1`).
import { createRequire } from 'node:module';

const require = createRequire('C:/Users/Admin/AppData/Roaming/npm/node_modules/');
export const { chromium, devices } = require('playwright');

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
export const flag = (name) => process.argv.includes(name);
export const opt = arg;
export const BASE = arg('--base') || 'http://127.0.0.1:8731/';

export const PHONE = { ...devices['iPhone 15'], deviceScaleFactor: 2 };
export const PC = { viewport: { width: 1440, height: 900 } };

export const launch = () => chromium.launch({ channel: 'msedge' });

// Верхнеуровневые блоки страницы: имя (id или первые классы), y и высота
export const SECTIONS = `(() => { const L = []; document.querySelectorAll('header.nav, section, footer').forEach((e) => { if (e.parentElement.closest('section')) return; const r = e.getBoundingClientRect(); L.push({ n: (e.id || e.className || e.tagName).toString().split(' ').slice(0, 2).join('.'), y: Math.round(r.top + scrollY), h: Math.round(r.height) }); }); return L; })()`;

export async function open(b, ctxOpts, extra = {}) {
  const ctx = await b.newContext({ ...ctxOpts, ...extra });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 160)));
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  return { ctx, p, errs };
}
