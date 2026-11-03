// Страница на телефоне не прыгает сама. У Safari нет scroll anchoring: любой рост блока выше пальца сдвигает экран.
// Проверяем, что высоты не меняются там, где раньше менялись:
//   «Обо мне» собирается в простое после загрузки, пока человек наверху страницы;
//   Цех: сборка сцены, финал (сразу и через вылет изделия) и переход к следующему изделию — высота секции та же.
//   node tests/no-jump.mjs [--base http://127.0.0.1:8731/]
import { launch, PHONE, BASE } from './pw.mjs';

const b = await launch();
const ctx = await b.newContext(PHONE);
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.goto(BASE, { waitUntil: 'load' });
const fails = [];
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) fails.push(msg); };
const H = (sel) => p.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().height), sel);

// 1. «Обо мне» собрана без скролла
const built = await p.waitForFunction(() => document.querySelector('#about .film--st') && document.querySelector('#about .stage--deck'), null, { timeout: 8000 }).then(() => true, () => false);
ok(built && (await p.evaluate(() => scrollY)) === 0, '«Обо мне» собрана в простое, страницу не листали');
await p.waitForTimeout(600);
const ab0 = await H('#about');

// 2. Цех: до и после сборки
const pr0 = await H('#process');
await p.evaluate(() => scrollTo(0, document.querySelector('#process').getBoundingClientRect().top + scrollY));
await p.waitForFunction(() => window.__cv, null, { timeout: 15000 });
await p.waitForTimeout(1200);
const pr1 = await H('#process');
ok(Math.abs(pr1 - pr0) <= 1, `Цех: высота до сборки ${pr0}, после ${pr1}`);

// 3. Финал сразу
await p.evaluate(() => window.__cv.showFin(true)); await p.waitForTimeout(800);
const pr2 = await H('#process');
ok(Math.abs(pr2 - pr1) <= 1, `Цех: финал «Все этапы сразу» ${pr2} (было ${pr1})`);

// 4. Следующее изделие
await p.evaluate(() => window.__cv.start('bot')); await p.waitForTimeout(800);
const pr3 = await H('#process');
ok(Math.abs(pr3 - pr1) <= 1, `Цех: следующее изделие ${pr3}`);

// 5. Финал через вылет изделия: последняя станция, конец стоянки
const last = await p.evaluate(() => { const st = window.__cv.state(); return st; });
await p.evaluate(() => window.__cv.jump(document.querySelectorAll('#process .cv-line li:not(.cvsub)').length - 1));
await p.evaluate(() => window.__cv.set({ t: 6.3 })); // стоянка 6.4 с → outro → вылет
let ph = '';
for (let k = 0; k < 40 && ph !== 'fin'; k++) { await p.waitForTimeout(250); ph = await p.evaluate(() => window.__cv.state().ph); }
const pr4 = await H('#process');
ok(ph === 'fin', `Цех: дошёл до финала через вылет (фаза ${ph}, старт ${last.w})`);
ok(Math.abs(pr4 - pr1) <= 1, `Цех: финал после вылета ${pr4}`);

// 6. «Обо мне» за это время не менялась
const ab1 = await H('#about');
ok(Math.abs(ab1 - ab0) <= 1, `«Обо мне»: ${ab0} → ${ab1}`);
// 7. Пришёл снизу (ссылка на цены, подвал) и листает вверх: ни одна секция не меняет высоту
const q = await (await b.newContext(PHONE)).newPage();
q.on('pageerror', (e) => errs.push(e.message));
await q.goto(BASE, { waitUntil: 'load' });
await q.waitForTimeout(5000);
await q.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, document.documentElement.scrollHeight); });
await q.waitForTimeout(1200);
await q.evaluate(() => {
  window.__ch = [];
  const prev = new Map();
  const ro = new ResizeObserver((es) => es.forEach((e) => { const h = Math.round(e.target.getBoundingClientRect().height), o = prev.get(e.target); prev.set(e.target, h); if (o !== undefined && o !== h) window.__ch.push(`${e.target.id || e.target.className} ${o}→${h}`); }));
  document.querySelectorAll('header.nav, section, footer').forEach((e) => { if (!e.parentElement.closest('section')) ro.observe(e); });
});
await q.waitForTimeout(300);
for (let y = await q.evaluate(() => scrollY); y > 0; y -= 350) { await q.evaluate((y) => scrollTo(0, y), y); await q.waitForTimeout(160); }
await q.waitForTimeout(800);
const ch = await q.evaluate(() => window.__ch);
ok(!ch.length, `снизу вверх высоты секций не менялись${ch.length ? ': ' + ch.slice(0, 6).join(', ') : ''}`);
ok(!errs.length, `ошибок страницы нет${errs.length ? ': ' + errs.join(' | ') : ''}`);

await b.close();
console.log(fails.length ? `FAIL ${fails.length}` : 'PASS');
process.exit(fails.length ? 1 : 0);
