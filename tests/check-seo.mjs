// Проверка технического SEO: node tests/check-seo.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const ORIGIN = 'https://kozflow.ru';
const pages = { index: '/', sayty: '/sayty', dizayn: '/dizayn', moushen: '/moushen', avtomatizacii: '/avtomatizacii' };
const services = ['sayty', 'dizayn', 'moushen', 'avtomatizacii'];
const errors = [];
const fail = (m) => errors.push(m);
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const textOf = (s) => decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const meta = (h, re) => (h.match(re) || [])[1];

// sitemap
if (!fs.existsSync(path.join(root, 'sitemap.xml'))) fail('нет sitemap.xml');
else {
  const sm = read('sitemap.xml');
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const want = Object.values(pages).map((p) => ORIGIN + p);
  for (const w of want) if (!locs.includes(w)) fail(`sitemap: нет ${w}`);
  if (locs.length !== want.length) fail(`sitemap: ${locs.length} адресов, ожидалось ${want.length} (политика под noindex не входит)`);
  if (/\.html/.test(sm)) fail('sitemap: адреса с .html');
  if ((sm.match(/<lastmod>\d{4}-\d\d-\d\d<\/lastmod>/g) || []).length !== want.length) fail('sitemap: lastmod есть не у всех');
}

// robots
if (!fs.existsSync(path.join(root, 'robots.txt'))) fail('нет robots.txt');
else {
  const rb = read('robots.txt');
  if (!rb.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) fail('robots: нет Sitemap');
  if (/^Host:/im.test(rb)) fail('robots: Host не нужен');
  if (!/^User-agent: \*/im.test(rb)) fail('robots: нет User-agent: *');
}

const titles = new Set();
const descs = new Set();
for (const [name, url] of Object.entries(pages)) {
  const h = read(`${name}.html`);
  const title = meta(h, /<title>([^<]+)<\/title>/);
  const desc = meta(h, /<meta name="description" content="([^"]*)"/);
  if (!title) fail(`${name}: нет title`);
  else if (titles.has(title)) fail(`${name}: title дублируется`);
  else titles.add(title);
  if (!desc) fail(`${name}: нет description`);
  else {
    if (desc.length > 160) fail(`${name}: description ${desc.length} > 160`);
    if (descs.has(desc)) fail(`${name}: description дублируется`);
    descs.add(desc);
  }
  const canon = meta(h, /<link rel="canonical" href="([^"]+)"/);
  if (canon !== ORIGIN + url) fail(`${name}: canonical ${canon}`);
  const og = (p) => meta(h, new RegExp(`<meta property="og:${p}" content="([^"]*)"`));
  if (og('url') !== ORIGIN + url) fail(`${name}: og:url ${og('url')}`);
  for (const p of ['title', 'description', 'type', 'image', 'locale']) if (!og(p)) fail(`${name}: нет og:${p}`);
  const img = og('image');
  if (img) {
    if (!img.startsWith(ORIGIN + '/')) fail(`${name}: og:image не абсолютный`);
    else if (!fs.existsSync(path.join(root, img.slice(ORIGIN.length + 1)))) fail(`${name}: og:image не существует в репо`);
  }

  // JSON-LD
  const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (blocks.length !== 1) { fail(`${name}: JSON-LD блоков ${blocks.length}, ожидался 1`); continue; }
  let ld;
  try { ld = JSON.parse(blocks[0]); } catch (e) { fail(`${name}: JSON-LD не парсится: ${e.message}`); continue; }
  const graph = ld['@graph'] || [ld];
  const byType = (t) => graph.filter((n) => [].concat(n['@type']).includes(t));
  const plain = textOf(h.replace(/<script[\s\S]*?<\/script>/g, ''));
  if (name === 'index') {
    if (!byType('Person').length) fail('index: нет Person');
    const ps = byType('ProfessionalService')[0];
    if (!ps) fail('index: нет ProfessionalService');
    else {
      if (ps.name !== 'KOZFLOW') fail('index: имя ProfessionalService');
      if (ps.url !== ORIGIN + '/') fail('index: url ProfessionalService');
      if (!JSON.stringify(ps.sameAs || []).includes('https://t.me/kozflow')) fail('index: нет sameAs t.me/kozflow');
      if (!/Тверь/.test(JSON.stringify(ps.areaServed))) fail('index: areaServed без Твери');
    }
  } else {
    const sv = byType('Service')[0];
    if (!sv) fail(`${name}: нет Service`);
    else {
      if (!sv.provider || sv.provider['@id'] !== ORIGIN + '/#business') fail(`${name}: provider не ссылается на #business`);
      for (const o of [].concat(sv.offers || [])) {
        const price = o.price ?? o.priceSpecification?.minPrice;
        const shown = String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
        if (!plain.includes(shown)) fail(`${name}: цена ${shown} (${o.name}) не найдена на странице`);
        if (o.priceCurrency !== 'RUB' && o.priceSpecification?.priceCurrency !== 'RUB') fail(`${name}: валюта ${o.name}`);
      }
      if (!(sv.offers || []).length) fail(`${name}: нет offers`);
    }
    const faqEls = [...h.matchAll(/<div class="faq[^"]*">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/g)];
    const qa = [...(faqEls[0]?.[1] || '').matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map((m) => [textOf(m[1]), textOf(m[2])]);
    const faq = byType('FAQPage')[0];
    if (!qa.length) fail(`${name}: в разметке не нашёл FAQ`);
    else if (!faq) fail(`${name}: нет FAQPage`);
    else {
      const got = faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]);
      if (JSON.stringify(got) !== JSON.stringify(qa)) fail(`${name}: FAQPage не совпадает с .faq (${got.length} против ${qa.length})`);
    }
  }
}

// noindex-страница не тронута
const pol = read('politika.html');
if (!/name="robots" content="noindex/.test(pol)) fail('politika: пропал noindex');
if (/ld\+json/.test(pol)) fail('politika: JSON-LD не нужен на noindex-странице');

if (errors.length) { console.error('FAIL\n- ' + errors.join('\n- ')); process.exit(1); }
console.log('check-seo: OK');
