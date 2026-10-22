// node tests/shot.mjs <page.html> <WxH> [outDir] [--reduced]
// Снимок всей страницы с http://localhost:8000 (python -m http.server 8000 в корне) → tests/shots/<page>-<W>.png
// Печатает JSON {page,vw,sw,errors,videos:[{src,ratioBox,ratioVideo,readyState,offscreenLoading}]}; код 1 при ошибках, гор. прокрутке или обрезанном видео.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('C:/Users/Admin/AppData/Roaming/npm/node_modules/');
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const reduced = args.includes('--reduced');
const [page, size = '1440x900', outDir = path.join(root, 'tests', 'shots')] = args.filter(a => !a.startsWith('--'));
const [vw, vh] = size.split('x').map(Number);
const base = process.env.BASE || 'http://localhost:8000/';

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, reducedMotion: reduced ? 'reduce' : 'no-preference', deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', e => errors.push('pageerror: ' + e.message));
p.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
p.on('requestfailed', r => { if (!/favicon|mc\.yandex/.test(r.url())) errors.push('requestfailed: ' + r.url()); });
p.on('response', r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push(`http ${r.status()}: ${r.url()}`); });

await p.goto(base + page, { waitUntil: 'load' });
await p.waitForTimeout(1500);

// видео ниже первого экрана до прокрутки не должны грузиться
const offscreen = await p.evaluate(() => [...document.querySelectorAll('video')]
  .filter(v => v.getBoundingClientRect().top > innerHeight * 1.5)
  .map(v => ({ src: v.currentSrc || v.querySelector('source')?.src || v.src, loading: v.networkState === 2 && v.readyState > 0 })));

const h = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 600) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(140); }
await p.evaluate(() => scrollTo(0, 0));
await p.waitForTimeout(800);

const info = await p.evaluate(() => ({
  sw: document.documentElement.scrollWidth,
  videos: [...document.querySelectorAll('video')].map(v => {
    const r = v.getBoundingClientRect();
    return { src: (v.currentSrc || v.src || '').split('/').pop(), ratioBox: r.height ? +(r.width / r.height).toFixed(3) : 0,
      ratioVideo: v.videoHeight ? +(v.videoWidth / v.videoHeight).toFixed(3) : 0, readyState: v.readyState,
      fit: getComputedStyle(v).objectFit };
  }),
}));

const name = path.basename(page, '.html') + '-' + vw + (reduced ? '-reduced' : '') + '.png';
await p.screenshot({ path: path.join(outDir, name), fullPage: true });
await browser.close();

const cropped = info.videos.filter(v => v.ratioVideo && v.ratioBox && v.fit === 'cover' && Math.abs(v.ratioBox - v.ratioVideo) / v.ratioVideo > 0.01);
const offLoading = offscreen.filter(o => o.loading);
const out = { page, vw, sw: info.sw, errors, videos: info.videos, cropped: cropped.map(v => v.src), offscreenLoading: offLoading.map(o => o.src), shot: name };
console.log(JSON.stringify(out));
process.exit(errors.length || info.sw > vw || cropped.length ? 1 : 0);
