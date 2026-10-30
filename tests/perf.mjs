// node tests/perf.mjs [--base URL] [--only phone|pc] [--runs 3] — плавность скролла главной по секциям.
// Телефон: iPhone 15, CPU ×4; ПК: 1440×900. Скролл по 14 px за кадр (~840 px/с — листающий палец).
// В зачёт идёт медиана прогонов: под замедлением CPU разброс между прогонами доходит до двух раз.
// Порог: средний кадр телефона ≤ 33 мс, ПК ≤ 17 мс; иначе exit 1.
import { launch, open, PHONE, PC, SECTIONS, opt } from './pw.mjs';

const LIMIT = { phone: 33, pc: 17 };
const only = opt('--only');
const RUNS = +(opt('--runs') || 3);
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const runs = [{ name: 'phone', ctx: PHONE, cpu: 4 }, { name: 'pc', ctx: PC, cpu: 1 }].filter((r) => !only || r.name === only);
const b = await launch();
const avgs = {};
for (const R of runs) for (let n = 0; n < RUNS; n++) {
  const { ctx, p, errs } = await open(b, R.ctx);
  const sect = await p.evaluate(SECTIONS);
  await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(800);
  const cdp = await ctx.newCDPSession(p);
  if (R.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: R.cpu });
  const res = await p.evaluate(async () => {
    const lt = []; try { new PerformanceObserver((l) => l.getEntries().forEach((e) => lt.push({ d: e.duration, y: scrollY }))).observe({ type: 'longtask', buffered: false }); } catch {}
    const fr = []; let last = performance.now();
    const H = document.documentElement.scrollHeight - innerHeight; let stall = 0, yPrev = -1; // страница могла стать короче H: скролл встал — конец
    await new Promise((ok) => { const f = (t) => { fr.push({ d: t - last, y: scrollY }); last = t; stall = scrollY === yPrev ? stall + 1 : 0; yPrev = scrollY; if (scrollY >= H - 2 || stall > 30) return ok(); scrollBy({ top: 14, behavior: 'instant' }); requestAnimationFrame(f); }; requestAnimationFrame(f); });
    await new Promise((r) => setTimeout(r, 300));
    return { fr, lt };
  });
  const by = sect.map((s) => ({ ...s, frames: 0, slow: 0, sum: 0, worst: 0, lt: 0 }));
  const at = (y) => by.findLast((s) => y + 300 >= s.y) || by[0];
  for (const f of res.fr.slice(1)) { const s = at(f.y); s.frames++; s.sum += f.d; if (f.d > 25) s.slow++; s.worst = Math.max(s.worst, f.d); }
  for (const t of res.lt) at(t.y).lt++;
  const tot = res.fr.slice(1); const avg = tot.reduce((a, f) => a + f.d, 0) / tot.length;
  (avgs[R.name] ||= []).push(avg);
  console.log(`\n== ${R.name}${R.cpu > 1 ? ` (CPU ×${R.cpu})` : ''}: кадров ${tot.length}, средний ${avg.toFixed(1)} мс (${(1000 / avg).toFixed(0)} fps), медленных >25мс ${tot.filter((f) => f.d > 25).length}, длинных задач ${res.lt.length}`);
  for (const s of by) if (s.frames) console.log(`  ${s.n.padEnd(24)} y${String(s.y).padStart(6)}  ср ${(s.sum / s.frames).toFixed(1).padStart(5)}мс  медл ${String(s.slow).padStart(3)}/${String(s.frames).padStart(3)}  худш ${s.worst.toFixed(0).padStart(4)}  LT ${s.lt}`);
  console.log('  ошибки:', errs.length ? errs.join(' | ') : 'нет');
  await ctx.close();
}
await b.close();
const med = Object.fromEntries(Object.entries(avgs).map(([k, v]) => [k, median(v)]));
console.log(`\nPERF ${Object.entries(med).map(([k, v]) => `${k} avg=${v.toFixed(1)} (${avgs[k].map((x) => x.toFixed(1)).join(' / ')})`).join(' ')}`);
const bad = Object.entries(med).filter(([k, v]) => v > LIMIT[k]);
if (bad.length) { console.log(`FAIL: ${bad.map(([k, v]) => `${k} ${v.toFixed(1)} > ${LIMIT[k]} мс`).join(', ')}`); process.exit(1); }
console.log('PASS');
