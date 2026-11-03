// node tests/process-phone.mjs [--base URL] — Цех на телефоне, iPhone 15: камера на станции, свайп, нижний лист.
// Жесты — сырые Input.dispatchTouchEvent, как в touch-scroll.mjs.
import { launch, open, PHONE } from './pw.mjs';

const CLOSE = 0.66; // станция занимает не меньше этой доли высоты сцены. Было 0.7: с 03.11 соседние станции делят общий масштаб (без перерастеризации слоя на iPhone), кадр мельче на 2–3 %
const b = await launch();
const { ctx, p, errs } = await open(b, PHONE);
const cdp = await ctx.newCDPSession(p);
const bad = [];
const check = (ok, msg) => { if (!ok) bad.push(msg); };
const stageTop = () => p.evaluate(() => {
  const r = document.querySelector('#process .cv-stage').getBoundingClientRect();
  scrollTo({ top: r.top + scrollY - 8, behavior: 'instant' });
});
const touch = async (x, y, dx, dy, steps = 14) => {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / steps, y: y + dy * i / steps }] });
    await p.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(350);
};
const station = () => p.evaluate(() => __cv.state().i);
const frame = (j) => p.evaluate((j) => {
  const stage = document.querySelector('#process .cv-stage'), st = stage.getBoundingClientRect();
  const g = document.querySelector('#process .cv-svg g[data-w]:not([hidden])');
  let t = 1e9, l = 1e9, r = -1e9, bt = -1e9;
  g.querySelectorAll(`[data-i="${j}"]`).forEach((e) => { const q = e.getBoundingClientRect(); if (!q.width) return; t = Math.min(t, q.top); l = Math.min(l, q.left); r = Math.max(r, q.right); bt = Math.max(bt, q.bottom); });
  const svg = document.querySelector('#process .cv-svg');
  return { top: t - st.top, left: l - st.left, right: r - st.left, bottom: bt - st.top, W: st.width, H: st.height, seen: st.width / svg.getBoundingClientRect().width, active: document.getElementById('process').dataset.active };
}, j);

// камера: на каждой станции каждого продукта рамка целиком в сцене, крупно
await stageTop(); await p.waitForTimeout(600);
const worlds = await p.evaluate(() => window.CV.worlds.map((w) => [w.id, w.stops.length]));
for (const [id, n] of worlds) {
  await p.evaluate((id) => { __cv.start(id); __cv.set({ playing: false }); }, id);
  for (let j = 0; j < n; j++) {
    await p.evaluate((j) => __cv.jump(j), j);
    await p.waitForTimeout(1800);
    const f = await frame(j), tag = `${id} станция ${j + 1}`;
    console.log(`${tag}: ${Math.round(f.left)}–${Math.round(f.right)} из ${Math.round(f.W)}, ${Math.round(f.top)}–${Math.round(f.bottom)} из ${Math.round(f.H)}, видно ${Math.round(f.seen * 100)} % цеха`);
    check(f.seen < 0.5, `${tag}: видно ${Math.round(f.seen * 100)} % цеха`);
    check(f.left >= 0 && f.right <= f.W && f.top >= 0 && f.bottom <= f.H, `${tag}: рамка срезана`);
    check((f.bottom - f.top) / f.H >= CLOSE, `${tag}: мелко, ${Math.round((f.bottom - f.top) / f.H * 100)} % высоты`);
    check(f.active === String(j), `${tag}: data-active ${f.active}`);
  }
}

// свайп: влево — следующая, вправо — предыдущая, вертикальный жест — страница
await p.evaluate(() => { __cv.start('site'); __cv.set({ playing: false }); __cv.jump(2); });
await stageTop(); await p.waitForTimeout(500);
const zone = await p.evaluate(() => { const r = document.querySelector('#process .cv-stage').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
await touch(zone.x + 70, zone.y, -140, 8);
check((await station()) === 3, `свайп влево: станция ${await station()}, ждали 3`);
await touch(zone.x - 70, zone.y, 140, 8);
check((await station()) === 2, `свайп вправо: станция ${await station()}, ждали 2`);
await touch(zone.x + 15, zone.y, -25, 0);
check((await station()) === 2, `короткий сдвиг сменил станцию: ${await station()}`);
const y0 = await p.evaluate(() => scrollY);
await touch(zone.x, zone.y + 60, 10, -240, 20);
await p.waitForTimeout(500);
const y1 = await p.evaluate(() => scrollY);
check(y1 - y0 > 100, `вертикальный жест: страница ушла на ${Math.round(y1 - y0)} px`);
check((await station()) === 2, `вертикальный жест сменил станцию: ${await station()}`);

// свайп на финале не срывает его
await stageTop(); await p.waitForTimeout(300);
await p.evaluate(() => { __cv.set({ playing: true }); __cv.jump(5); document.querySelector('#process .c-next').click(); });
await p.waitForTimeout(400);
const f0 = await p.evaluate(() => __cv.state());
await touch(zone.x + 70, zone.y, -140, 8);
const f1 = await p.evaluate(() => __cv.state());
check(f0.ph === 'outro' && (f1.ph === 'fly' || f1.t > f0.t), `свайп на финале: ${f0.ph} ${f0.t.toFixed(2)} → ${f1.ph} ${f1.t.toFixed(2)}`);
await p.evaluate(() => { __cv.start('site'); __cv.set({ playing: false }); __cv.jump(2); });
await p.waitForTimeout(300);

// нижний лист
const openSheet = async () => {
  await p.evaluate(() => document.querySelector('#process .c-more').scrollIntoView({ behavior: 'instant', block: 'center' }));
  await p.waitForTimeout(300);
  await p.tap('#process .c-more');
  await p.waitForTimeout(700);
};
const isOpen = () => p.evaluate(() => document.querySelector('#process .cv-dr').open);
await openSheet();
const sh = await p.evaluate(() => {
  const d = document.querySelector('#process .cv-dr'), r = d.getBoundingClientRect();
  return { l: r.left, b: r.bottom, w: r.width, h: r.height, vw: innerWidth, vh: innerHeight, text: d.textContent, grip: !!d.querySelector('.dr-grip') };
});
console.log(`лист: ${Math.round(sh.w)}×${Math.round(sh.h)}, низ ${Math.round(sh.b)} из ${sh.vh}`);
check(sh.l === 0 && sh.w === sh.vw, `лист не во всю ширину: ${sh.l}, ${sh.w}`);
check(Math.abs(sh.b - sh.vh) <= 1, `лист не у нижнего края: ${sh.b}`);
check(sh.h <= sh.vh * 0.9, `лист на весь экран: ${sh.h}`);
check(sh.grip, 'нет ручки .dr-grip');
check(/нужно от вас/i.test(sh.text) && /вы получаете/i.test(sh.text), 'в листе нет «От вас / Вы получаете»');
const y2 = await p.evaluate(() => scrollY);
await touch(196, 40, 0, 200);
check(await isOpen(), 'жест по подложке закрыл лист');
await touch(196, 240, 0, -200);
check(await isOpen(), 'прокрутка листа закрыла его');
check(Math.abs((await p.evaluate(() => scrollY)) - y2) < 2, 'фон прокрутился под листом');
await touch(196, sh.vh - sh.h + 14, 0, 220);
await p.waitForTimeout(500);
check(!(await isOpen()), 'свайп вниз не закрыл лист');
await openSheet();
const inner = await p.evaluate(() => { const d = document.querySelector('#process .cv-dr'); d.scrollTop = 120; return d.scrollTop; });
await touch(196, 500, 0, 60);
check(await isOpen(), 'лист закрылся, пока его содержимое прокручено');
check(inner === 0 || (await p.evaluate(() => document.querySelector('#process .cv-dr').scrollTop)) < inner, 'содержимое листа не прокрутилось вверх');
await p.touchscreen.tap(196, 30);
await p.waitForTimeout(600);
check(!(await isOpen()), 'тап по фону не закрыл лист');

await b.close();
if (errs.length) bad.push(`ошибки консоли: ${errs.join(' | ')}`);
console.log(bad.length ? `FAIL\n  ${bad.join('\n  ')}` : 'PASS');
process.exit(bad.length ? 1 : 0);
