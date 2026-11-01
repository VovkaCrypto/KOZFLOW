// node tests/anchors.mjs [--base URL] — клик по якорю доводит до цели, хотя страница по дороге вырастает.
// ПК 1440×900 и ноутбук с масштабом 150 % (screen 1280×720, мышь): телефонная ветка там не включается.
import { launch, open, PC, PHONE, BASE } from './pw.mjs';

const b = await launch();
const bad = [];

for (const id of ['services', 'works', 'process', 'about', 'contact']) {
  const { ctx, p } = await open(b, PC);
  await p.evaluate((i) => document.querySelector(`a[href="#${i}"]`).click(), id);
  await p.waitForFunction((i) => {
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    return Math.abs(document.getElementById(i).getBoundingClientRect().top - pad) <= 8;
  }, id, { timeout: 12000 }).catch(() => {});
  await p.waitForTimeout(1500); // цель встала и не уехала
  const r = await p.evaluate((i) => {
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    return { off: Math.round(document.getElementById(i).getBoundingClientRect().top - pad), H: document.documentElement.scrollHeight };
  }, id);
  console.log(`#${id}: мимо на ${r.off} px, страница ${r.H}`);
  if (Math.abs(r.off) > 8) bad.push(`#${id}: мимо на ${r.off} px`);
  await ctx.close();
}

// прямая ссылка с якорем: страница растёт уже после прихода
for (const [opts, id, name] of [[PC, 'contact', 'ПК'], [PHONE, 'prices', 'телефон']]) {
  const ctx = await b.newContext(opts), p = await ctx.newPage();
  await p.goto(`${BASE}#${id}`, { waitUntil: 'load' }); await p.waitForTimeout(5000);
  const off = await p.evaluate((i) => { const e = document.getElementById(i), s = getComputedStyle(document.documentElement); return Math.round(e.getBoundingClientRect().top - (parseFloat(s.scrollPaddingTop) || 0) - (parseFloat(getComputedStyle(e).scrollMarginTop) || 0)); }, id);
  console.log(`${name}, прямая ссылка #${id}: мимо на ${off} px`);
  if (Math.abs(off) > 12) bad.push(`${name}, прямая ссылка #${id}: мимо на ${off} px`);
  await ctx.close();
}

// человек важнее догона: End посреди плавного скролла и Ctrl+клик
{
  const { ctx, p } = await open(b, PC);
  await p.evaluate(() => document.querySelector('a[href="#works"]').click()); await p.waitForTimeout(250);
  await p.keyboard.press('End'); await p.waitForTimeout(4000);
  const y = await p.evaluate(() => Math.round(scrollY)), top = await p.evaluate(() => Math.round(document.getElementById('works').getBoundingClientRect().top + scrollY));
  console.log(`End посреди скролла: y ${y}, #works на ${top}`);
  if (y <= top + 100) bad.push('догон перебил клавишу End');
  await ctx.close();
}
{
  const { ctx, p } = await open(b, PC);
  await p.evaluate(() => { const a = document.querySelector('a[href="#works"]'); a.addEventListener('click', (e) => e.preventDefault(), { once: true }); a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true })); });
  await p.waitForTimeout(2000);
  const y = await p.evaluate(() => Math.round(scrollY));
  console.log(`Ctrl+клик: y ${y}`);
  if (y > 10) bad.push('Ctrl+клик сдвинул исходную вкладку');
  await ctx.close();
}

const { ctx, p } = await open(b, { viewport: { width: 1400, height: 700 }, screen: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
await p.evaluate(() => document.getElementById('about').scrollIntoView({ behavior: 'instant' })); await p.waitForTimeout(1500);
const zoom = await p.evaluate(() => ({ deck: !!document.querySelector('#about .deck'), st: !!document.querySelector('#about .film--st'), stack: !!document.querySelector('#services .sk') }));
console.log(`масштаб 150 %: ${JSON.stringify(zoom)}`);
if (zoom.deck || zoom.st || zoom.stack) bad.push('ноутбук с масштабом 150 % попал в телефонную ветку');
await ctx.close();

await b.close();
console.log(bad.length ? `FAIL\n  ${bad.join('\n  ')}` : 'PASS');
process.exit(bad.length ? 1 : 0);
