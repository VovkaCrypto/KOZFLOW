// node tests/about-phone.mjs [--base URL] — «Обо мне» на телефоне, iPhone 15: колода под фото, факты сторис.
// Жесты — сырые Input.dispatchTouchEvent. Движение выключено отдельным заходом: лента и список, без автоперехода.
import { launch, open, opt, PHONE } from './pw.mjs';

const VW = +opt('--w') || 393, VH = +opt('--h') || 659; // другие размеры: --w 320 --h 568
const SIZE = { viewport: { width: VW, height: VH }, screen: { width: VW, height: VH } };
const LAND = VW > VH; // альбомная: две колонки ПК, медиа рядом с текстом, блок почти в окно
const b = await launch();
const bad = [];
const check = (ok, msg) => { if (!ok) bad.push(msg); };

async function session(extra) {
  const s = await open(b, PHONE, extra);
  await s.p.evaluate(() => document.getElementById('about').scrollIntoView({ behavior: 'instant' }));
  await s.p.waitForTimeout(1500);
  const cdp = await s.ctx.newCDPSession(s.p);
  s.touch = async (x, y, dx, dy, steps = 14) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= steps; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / steps, y: y + dy * i / steps }] });
      await s.p.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await s.p.waitForTimeout(600);
  };
  s.press = async (x, y, ms) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await s.p.waitForTimeout(ms);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await s.p.waitForTimeout(150);
  };
  return s;
}

// --- колода
let { p, touch, press, errs, ctx } = await session(SIZE);
const deckIn = () => p.evaluate(() => {
  const d = document.querySelector('#about .deck'), ph = document.querySelector('#about .deck-ph').getBoundingClientRect();
  d.scrollIntoView({ behavior: 'instant', block: 'center' });
  const r = d.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: d.dataset.top, phBottom: ph.bottom };
});
const crossing = () => p.evaluate(() => {
  const ph = document.querySelector('#about .deck-ph').getBoundingClientRect();
  return [...document.querySelectorAll('#about .deck .deck-c')].filter((c) => {
    const r = c.getBoundingClientRect();
    return Math.min(r.right, ph.right) > Math.max(r.left, ph.left) && Math.min(r.bottom, ph.bottom) > Math.max(r.top, ph.top);
  }).length;
});
const top = () => p.evaluate(() => document.querySelector('#about .deck').dataset.top);
check(await p.evaluate((L) => getComputedStyle(document.querySelector('#about .stage')).position !== 'sticky' && (L || document.querySelector('#about .stage').offsetHeight < innerHeight * 2.2), LAND), 'стадия всё ещё тянется на экраны прокрутки');
let z = await deckIn(); await p.waitForTimeout(500);
z = await deckIn();
check(z.top !== undefined, 'нет data-top у колоды');
check(await p.evaluate(() => { const d = document.querySelector('#about .deck'); return [...d.querySelectorAll('.deck-c')].every((c) => c.offsetWidth === d.offsetWidth && c.offsetHeight === d.offsetHeight); }), 'карты разного размера');
check((await crossing()) === 0, `карты в рамке фото: ${await crossing()}`);
const t0 = await top();
await touch(z.x + 60, z.y, -120, 6);
const t1 = await top();
check(t1 !== t0, 'свайп влево не сменил верхнюю карту');
check((await crossing()) === 0, 'после свайпа карты в рамке фото');
await touch(z.x - 60, z.y, 120, 6);
check((await top()) !== t1, 'свайп вправо не сменил верхнюю карту');
const t2 = await top();
await touch(z.x + 10, z.y, -30, 0);
check((await top()) === t2, 'сдвиг на 30 px сменил карту');
const y0 = await p.evaluate(() => scrollY);
await touch(z.x, z.y + 60, 8, -240, 20);
check((await p.evaluate(() => scrollY)) - y0 > 100, 'вертикальный жест по колоде не прокрутил страницу');
check((await top()) === t2, 'вертикальный жест сменил карту');

// --- сторис
const filmIn = () => p.evaluate(() => {
  const f = document.querySelector('#about .film'); f.scrollIntoView({ behavior: 'instant', block: 'center' });
  const r = f.getBoundingClientRect();
  return { l: r.left, w: r.width, top: r.top, h: r.height, y: r.top + r.height * 0.4, vh: innerHeight };
});
const act = () => p.evaluate(() => +document.querySelector('#about .film').dataset.active);
let f = await filmIn(); await p.waitForTimeout(400); f = await filmIn();
console.log(`сторис: ${Math.round(f.w)}×${Math.round(f.h)} из ${f.vh}`);
check(f.h <= 640, `блок выше нормы: ${f.h}`);
if (VW >= 393 && !LAND) check(f.h <= f.vh * 0.82 + 1, `блок выше 82 % окна: ${f.h}`);
check(await p.evaluate(() => getComputedStyle(document.querySelector('#about .fpin')).position !== 'sticky'), 'пин плёнки остался');
check(await p.evaluate(() => { const t = document.querySelector('#about .film .track'); return t.scrollWidth <= t.clientWidth + 1; }), 'горизонтальная лента осталась');
check((await p.evaluate(() => document.querySelectorAll('#about .film .seg').length)) === 6, 'нет шести сегментов');
const a0 = await act();
await press(f.l + f.w * 0.8, f.y, 60);
check((await act()) === (a0 + 1) % 6, `тап справа: ${await act()} после ${a0}`);
const a1 = await act();
await press(f.l + f.w * 0.2, f.y, 60);
check((await act()) === (a1 + 5) % 6, `тап слева: ${await act()} после ${a1}`);
await press(f.l + f.w * 0.2, f.y, 60);
check((await act()) === 0, `тап слева на первой панели увёл на ${await act()}`);
const a2 = await act();
await p.waitForTimeout(5600);
check((await act()) === a2 + 1, `автопереход: ${await act()} после ${a2}`);
const a3 = await act();
await press(f.l + f.w * 0.5, f.y, 6000);
check((await act()) === a3, `удержание не держит: ${await act()} после ${a3}`);
// текст панели не перекрыт: ни одна панель не наезжает на .pn-txt своим медиа
for (let i = 0; i < 6; i++) {
  const r = await p.evaluate(() => {
    const pn = document.querySelector('#about .pn.on'), t = pn?.querySelector('.pn-txt')?.getBoundingClientRect(), box = pn?.getBoundingClientRect(), W = t?.right ?? 0;
    if (!t) return { none: true };
    const under = [...pn.querySelectorAll('.pn-m,.phones,.tl,.float9,.big-tg')].map((e) => e.getBoundingClientRect()).filter((q) => q.height);
    const kids = [...pn.querySelectorAll('.pn-txt>*')].map((e) => e.getBoundingClientRect()), last = kids.reduce((m, q) => Math.max(m, q.bottom), 0), right = kids.reduce((m, q) => Math.max(m, q.right), 0);
    return { name: pn.className, last: Math.round(last - box.top), H: Math.round(box.height), clash: under.filter((q) => q.top < last - 1 && q.left < right - 1).length, out: under.filter((q) => q.bottom > box.bottom + 1).length };
  });
  check(!r.none, `панель ${i}: нет активной .pn.on`);
  if (!r.none) { console.log(`${r.name}: текст до ${r.last} из ${r.H}`); check(!r.clash, `${r.name}: текст перекрыт`); check(!r.out, `${r.name}: медиа выходит за панель`); check(r.last <= r.H, `${r.name}: текст за панелью`); }
  await press(f.l + f.w * 0.8, f.y, 60);
}
// вне кадра анимаций нет: колода под блоком сторис, блок сторис над карточками контактов
check(await p.evaluate(() => { const d = document.querySelector('#about .deck'), top = d.querySelector('.deck-c.top'); return d.querySelectorAll('.deck-c').length - d.querySelectorAll('.deck-c:not(.top)').length === 1 && !!top; }), 'верхняя карта не помечена');
await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(400);
check(await p.evaluate(() => { const n = (s) => document.getAnimations().filter((a) => a.effect.target?.closest?.(s) && a.playState === 'running' && a.effect.getTiming().iterations === Infinity).length; return document.querySelector('#about .film').classList.contains('still') && document.querySelector('#about .deck').classList.contains('still') && !n('#about .deck') && !n('#about .film'); }), 'анимации #about идут вне кадра');
const y1 = await filmIn().then(() => p.waitForTimeout(400)).then(() => p.evaluate(() => scrollY));
await touch(f.l + f.w / 2, f.y, 6, -220, 20);
check((await p.evaluate(() => scrollY)) - y1 > 100, 'вертикальный жест по сторис не прокрутил страницу');
if (errs.length) bad.push(`ошибки консоли: ${errs.join(' | ')}`);
await ctx.close();

// --- без движения: лента и список
({ p, errs, ctx } = await session({ ...SIZE, reducedMotion: 'reduce' }));
const rm = await p.evaluate(() => {
  const d = document.querySelector('#about .deck'), f = document.querySelector('#about .film'), pn = [...f.querySelectorAll('.pn')];
  return { posters: [...d.querySelectorAll('video')].every((v) => v.preload === 'metadata' && /#t=/.test(v.src)), deckScroll: d.scrollWidth > d.clientWidth, shown: pn.filter((e) => getComputedStyle(e).display !== 'none').length, stacked: pn[1].getBoundingClientRect().top >= pn[0].getBoundingClientRect().bottom - 1, segs: getComputedStyle(f.querySelector('.segs')).display, nums: [...f.querySelectorAll('.gn .n')].map((n) => n.textContent) };
});
console.log(JSON.stringify(rm));
check(rm.deckScroll, 'reduced: колода не лента');
check(rm.posters, 'reduced: ролики колоды без первого кадра');
check(rm.shown === 6 && rm.stacked, 'reduced: сторис не список');
check(rm.segs === 'none', 'reduced: сегменты видны');
check(rm.nums.every((n) => /[1-9]/.test(n)), `reduced: нули в цифрах ${rm.nums}`);
if (errs.length) bad.push(`reduced, ошибки консоли: ${errs.join(' | ')}`);

await b.close();
console.log(bad.length ? `FAIL\n  ${bad.join('\n  ')}` : 'PASS');
process.exit(bad.length ? 1 : 0);
