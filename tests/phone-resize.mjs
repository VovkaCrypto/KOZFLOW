// node tests/phone-resize.mjs <selector>… [--base URL] — адресная строка браузера не сбивает блок, iPhone 15.
// Для каждого блока: прокрутить в середину, окно 393×659 → 393×749 → 393×659; прокрутка ушла ≤ 2 px, data-active не изменился.
import { launch, open, PHONE } from './pw.mjs';

const sels = process.argv.slice(2).filter((a) => a.startsWith('#') || a.startsWith('.'));
if (!sels.length) { console.log('нужен селектор: node tests/phone-resize.mjs "#services"'); process.exit(2); }
const b = await launch();
const { p, errs } = await open(b, PHONE);
const bad = [];
const state = (sel) => p.evaluate((sel) => [scrollY, document.querySelector(sel)?.dataset.active ?? null], sel);
for (const sel of sels) {
  await p.evaluate((sel) => { const e = document.querySelector(sel), r = e.getBoundingClientRect(); scrollTo({ top: r.top + scrollY + r.height / 2 - innerHeight / 2, behavior: 'instant' }); }, sel);
  await p.waitForTimeout(600);
  const [y0, a0] = await state(sel);
  await p.setViewportSize({ width: 393, height: 749 }); await p.waitForTimeout(350);
  await p.setViewportSize({ width: 393, height: 659 }); await p.waitForTimeout(500);
  const [y1, a1] = await state(sel);
  console.log(`${sel}: прокрутка ${Math.round(y0)} → ${Math.round(y1)}, data-active ${a0} → ${a1}`);
  if (Math.abs(y1 - y0) > 2) bad.push(`${sel}: прокрутка ушла на ${Math.round(y1 - y0)} px`);
  if (a0 !== a1) bad.push(`${sel}: data-active ${a0} → ${a1}`);
}
await b.close();
if (errs.length) bad.push(`ошибки консоли: ${errs.join(' | ')}`);
console.log(bad.length ? `FAIL\n  ${bad.join('\n  ')}` : `PASS: ${sels.length} блоков`);
process.exit(bad.length ? 1 : 0);
