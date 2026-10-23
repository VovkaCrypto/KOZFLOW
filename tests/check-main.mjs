// node tests/check-main.mjs — каркас новой главной: нужные секции на месте, старых нет, локальные ссылки ведут на существующие файлы
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const errors = [];

for (const id of ['services', 'works', 'process', 'why', 'faq', 'contact']) {
  if (!html.includes(`id="${id}"`)) errors.push(`нет секции #${id}`);
}
if (html.includes('id="cases"')) errors.push('остались старые кейсы — их заменили «Работы»');
if (html.includes('id="price"')) errors.push('осталась старая секция #price');
if ((html.match(/id="services"/g) || []).length > 1) errors.push('две секции #services');

const refs = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map(m => m[1]);
for (const ref of refs) {
  if (/^(#|https?:|mailto:|tel:|data:|\/\/)/.test(ref)) continue;
  const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
  if (!clean) continue;
  let file = path.join(root, clean.replace(/^\//, ''));
  if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
  if (!fs.existsSync(file)) errors.push(`нет файла: ${ref}`);
}

if (errors.length) {
  console.log(errors.join('\n'));
  process.exit(1);
}
console.log('OK main');
