// node tests/pc-guard.mjs [--base URL] [--write] — ПК-версия не поплыла: высоты блоков главной на 1440×900
// против tests/baseline/pc-sections.json, допуск ±2 %. Блок, которого нет в базе или на странице, — тоже ошибка.
// --write переписывает базу текущими высотами (только когда блоки поменялись намеренно).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, open, PC, SECTIONS, flag } from './pw.mjs';

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), 'baseline/pc-sections.json');
const b = await launch();
const { p, errs } = await open(b, PC);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
const sect = await p.evaluate(SECTIONS);
await b.close();
if (flag('--write')) { fs.writeFileSync(file, JSON.stringify({ H, vh: 900, sect }, null, 1)); console.log(`база записана: ${sect.length} блоков, страница ${H}px`); process.exit(0); }
const base = JSON.parse(fs.readFileSync(file, 'utf8')).sect;
const now = new Map(sect.map((s) => [s.n, s]));
const bad = [];
for (const s of base) {
  const c = now.get(s.n);
  if (!c) { bad.push(`нет блока ${s.n}`); continue; }
  const d = s.h ? Math.abs(c.h - s.h) / s.h : 0;
  if (d > 0.02) bad.push(`${s.n}: ${s.h} → ${c.h}px (${(d * 100).toFixed(1)} %)`);
}
for (const s of sect) if (!base.some((x) => x.n === s.n)) bad.push(`новый блок ${s.n} (нет в базе)`);
if (errs.length) bad.push(`ошибки консоли: ${errs.join(' | ')}`);
console.log(bad.length ? `FAIL\n  ${bad.join('\n  ')}` : `PASS: ${base.length} блоков в пределах ±2 %`);
process.exit(bad.length ? 1 : 0);
