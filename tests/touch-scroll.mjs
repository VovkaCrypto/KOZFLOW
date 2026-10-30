// node tests/touch-scroll.mjs [--base URL] — палец на блоке тянет вверх, страница прокручивается, а не залипает.
// Сырые Input.dispatchTouchEvent, iPhone 15: Input.synthesizeScrollGesture в этой эмуляции не двигает даже пустую страницу.
// Список растёт с задачами плана.
import { launch, open, PHONE } from './pw.mjs';

const BLOCKS = ['#hero', '#services'];
const DIST = 400, STEPS = 24;
const b = await launch();
const { ctx, p, errs } = await open(b, PHONE);
const cdp = await ctx.newCDPSession(p);
const bad = [];
for (const sel of BLOCKS) {
  const box = await p.evaluate((sel) => {
    const e = document.querySelector(sel), r = e.getBoundingClientRect();
    scrollTo({ top: Math.max(0, r.top + scrollY - 40), behavior: 'instant' });
    const q = e.getBoundingClientRect(), x = q.left + q.width / 2, y = Math.max(q.top + 60, Math.min(q.bottom - 20, innerHeight - 40));
    return { x, y, top: scrollY, own: !!document.elementFromPoint(x, y)?.closest(sel) };
  }, sel);
  if (!box.own) { bad.push(`${sel}: точка жеста не на блоке`); continue; }
  await p.waitForTimeout(400);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x, y: box.y }] });
  for (let i = 1; i <= STEPS; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: box.x, y: box.y - DIST * i / STEPS }] });
    await p.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(900);
  const moved = (await p.evaluate(() => scrollY)) - box.top;
  console.log(`${sel}: прокрутка ${Math.round(moved)} px`);
  if (moved < 200) bad.push(`${sel}: ${Math.round(moved)} px`);
}
await b.close();
if (errs.length) bad.push(`ошибки консоли: ${errs.join(' | ')}`);
console.log(bad.length ? `FAIL\n  ${bad.join('\n  ')}` : `PASS: ${BLOCKS.length} блоков`);
process.exit(bad.length ? 1 : 0);
