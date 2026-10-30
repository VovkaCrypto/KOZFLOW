// node tests/hero-touch.mjs [--base URL] — частицы героя уходят от пальца, iPhone 15.
// На паузе в собранном кадре: тап меняет снимок в радиусе 90 px, вне его совпадает, через секунду кадр вернулся.
// Вне радиуса допуск ±1 CSS-пиксель: под маской контур слова растрируется иначе, это край глифа, а не эффект.
// Ещё: палец едет вбок — координаты следуют; с prefers-reduced-motion эффекта нет.
import { launch, open, PHONE, BASE } from './pw.mjs';

const CASES = [['auto', 7.3, '.word[data-w="auto"]', 0.5], ['sites', 11.7, '.word[data-w="sites"]', 0.5], ['motion', 18.1, '.mo-gl', 0.3], ['design', 25.1, '.word[data-w="design"]', 0.5]];
const R = 90, S = 2, MIN_IN = 500, MAX_OUT = 20;

const b = await launch();
const { ctx, p, errs } = await open(b, PHONE);
const bad = [];
await p.evaluate(() => window.__goto(7.3));
const shots = [];
for (const [name, t, sel, fy] of CASES) {
  await p.evaluate((t) => window.__goto(t), t);
  await p.waitForTimeout(1400);   // первый кадр сцены дорисовывается не сразу
  const pt = await p.evaluate(([sel, fy]) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * fy }; }, [sel, fy]);
  const a = await p.screenshot({ type: 'png' });
  await p.touchscreen.tap(pt.x, pt.y);
  await p.waitForTimeout(120);
  const c = await p.screenshot({ type: 'png' });
  await p.waitForTimeout(1200);
  const d = await p.screenshot({ type: 'png' });
  const left = await p.evaluate(() => [window.REEL.touch.k, document.querySelectorAll('.word.hole').length]);
  if (left[0] || left[1]) bad.push(`${name}: после касания k=${left[0]}, дырок ${left[1]}`);
  shots.push({ name, pt, a: a.toString('base64'), c: c.toString('base64'), d: d.toString('base64') });
}

// палец едет вбок: страница стоит, координаты следуют
const cdp = await ctx.newCDPSession(p);
await p.evaluate(() => window.__goto(11.7));
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 100, y: 400 }] });
for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 100 + i * 12, y: 400 }] }); await p.waitForTimeout(16); }
const mid = await p.evaluate(() => ({ ...window.REEL.touch, y0: scrollY }));
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await p.waitForTimeout(80);
if (!mid.active || Math.abs(mid.x - 196) > 2 || mid.y0 !== 0) bad.push(`вбок: active=${mid.active} x=${mid.x} scrollY=${mid.y0}`);
if (await p.evaluate(() => window.REEL.touch.active)) bad.push('палец убран, active остался');

// сравнение пикселей в браузере
const s = await (await b.newContext()).newPage();
const R2 = await s.evaluate(async ({ shots, R, S }) => {
  const load = (b64) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = 'data:image/png;base64,' + b64; });
  const dat = (i) => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(i, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; };
  const out = [];
  for (const { name, pt, a, c, d } of shots) {
    const A = await load(a), W = A.width, H = A.height, pa = dat(A), pc = dat(await load(c)), pd = dat(await load(d));
    const diff = (p, q, i, j) => Math.abs(p[i] - q[j]) + Math.abs(p[i + 1] - q[j + 1]) + Math.abs(p[i + 2] - q[j + 2]);
    let inside = 0, outside = 0, back = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (diff(pa, pd, i, i) > 24) back++;
      if (diff(pa, pc, i, i) <= 24) continue;
      if (Math.hypot(x / S - pt.x, y / S - pt.y) <= R) { inside++; continue; }
      let near = false;
      for (let dy = -S; dy <= S && !near; dy++) for (let dx = -S; dx <= S && !near; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < H && xx >= 0 && xx < W && diff(pc, pa, i, (yy * W + xx) * 4) <= 24) near = true; }
      if (!near) outside++;
    }
    out.push({ name, inside, outside, back });
  }
  return out;
}, { shots, R, S });
for (const { name, inside, outside, back } of R2) {
  console.log(`${name}: в радиусе ${inside}, вне ${outside}, не вернулось ${back}`);
  if (inside < MIN_IN) bad.push(`${name}: эффекта нет (${inside})`);
  if (outside > MAX_OUT) bad.push(`${name}: задело вне радиуса (${outside})`);
  if (back > MAX_OUT) bad.push(`${name}: кадр не вернулся (${back})`);
}

// reduced-motion: касание не работает
const rc = await b.newContext({ ...PHONE, reducedMotion: 'reduce' });
const rp = await rc.newPage();
await rp.goto(BASE); await rp.waitForFunction(() => window.__ready);
await rp.touchscreen.tap(196, 400); await rp.waitForTimeout(150);
if (await rp.evaluate(() => window.REEL.touch.k)) bad.push('reduced-motion: k > 0');

await b.close();
if (errs.length) bad.push(`ошибки консоли: ${errs.join(' | ')}`);
console.log(bad.length ? `FAIL\n  ${bad.join('\n  ')}` : 'PASS');
process.exit(bad.length ? 1 : 0);
