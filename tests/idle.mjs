// node tests/idle.mjs [--base URL] [--reduce] [--top] — сколько процессор телефона отдыхает, когда страница стоит.
// iPhone 15, CPU ×4; в каждой точке стоим 2.5 с и снимаем профиль. Порог простоя ≥ 50 % (с --reduce ≥ 80 %), иначе exit 1.
// --top печатает самые дорогие функции каждой точки — с чего начинать, если порог не взят.
import { launch, open, PHONE, flag } from './pw.mjs';

const reduce = flag('--reduce');
const LIMIT = reduce ? 80 : 50;
const b = await launch();
const { ctx, p } = await open(b, PHONE, reduce ? { reducedMotion: 'reduce' } : {});
const cdp = await ctx.newCDPSession(p);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 500 });
const points = await p.evaluate(() => ['top', 'works', 'about', document.getElementById('final') ? 'final' : 'faq']);
const out = {};
for (const id of points) {
  await p.evaluate((id) => { const e = id === 'top' ? null : document.getElementById(id); scrollTo(0, e ? e.getBoundingClientRect().top + scrollY + 200 : 0); }, id);
  await p.waitForTimeout(800);
  await cdp.send('Profiler.start'); await p.waitForTimeout(2500);
  const { profile } = await cdp.send('Profiler.stop');
  const self = new Map(); const dt = profile.timeDeltas; const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  profile.samples.forEach((sid, i) => { const cf = byId.get(sid).callFrame; const k = `${cf.functionName || '(anon)'} ${cf.url.split('/').pop()}:${cf.lineNumber + 1}`; self.set(k, (self.get(k) || 0) + (dt[i] || 0) / 1000); });
  const tot = [...self.values()].reduce((a, v) => a + v, 0);
  out[id] = (100 * (self.get('(idle) :0') || 0)) / tot;
  if (flag('--top')) {
    console.log(`@${id}: idle ${out[id].toFixed(0)} %`);
    for (const [k, v] of [...self.entries()].filter(([k]) => !k.startsWith('(idle)')).sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`   ${v.toFixed(0).padStart(6)}мс  ${k}`);
  }
}
const running = await p.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
await b.close();
console.log(`IDLE ${Object.entries(out).map(([k, v]) => `${k}=${v.toFixed(0)}%`).join(' ')}${reduce ? ' (reduce)' : ''} · анимаций идёт: ${running}`);
const bad = Object.entries(out).filter(([, v]) => v < LIMIT);
if (bad.length) { console.log(`FAIL: простой < ${LIMIT} % в ${bad.map(([k]) => k).join(', ')}`); process.exit(1); }
console.log('PASS');
