// node tests/no-numbers.mjs [--base URL] — на сайте нет нумерации 01, 02, 1/6, а контакты живут только в #contact.
// Цифры-факты (цены, сроки, «50 / 50», «2 круга») проверка не трогает: ищет только текст, состоящий из одного номера.
import fs from 'node:fs';
import { launch, PC, PHONE, BASE } from './pw.mjs';

const bad = [];
const b = await launch();

const scan = () => {
  const label = /^\s*0\d\s*$|^\s*\d\s*\/\s*\d\s*$/, out = []; // 01, 1/6
  document.querySelectorAll('body *').forEach((e) => {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(e.tagName)) return;
    const any = e.closest('#process') && !e.closest('.cv-terms, .cv-pick, svg'); // в Цехе нумерации нет совсем, таблички проверяются ниже
    for (const c of e.childNodes) if (c.nodeType === 3 && (label.test(c.textContent) || (any && /^\s*\d(\.\d)?\s*$/.test(c.textContent)))) out.push(`${c.textContent.trim()} в ${e.tagName}.${e.getAttribute('class') || ''} (${e.closest('section,header,footer')?.id || '?'})`);
  });
  document.querySelectorAll('#process .sg-n, #process .m-n text, #process .ci-num, #process span.fc-n').forEach((e) => out.push(`номер ${e.textContent} в ${e.getAttribute('class') || e.tagName}`));
  return [...new Set(out)];
};

const pages = ['', 'dizayn', 'moushen', 'sayty', 'avtomatizacii'];
for (const pg of pages) for (const [nm, o] of [['ПК', PC], ['телефон', PHONE]]) {
  const ctx = await b.newContext(o), p = await ctx.newPage();
  await p.goto(BASE + (pg ? `${pg}.html` : ''), { waitUntil: 'load' }); await p.waitForTimeout(700);
  for (let y = 0, H = 30000; y < H; y += 800) { H = await p.evaluate(() => document.documentElement.scrollHeight); await p.evaluate((v) => scrollTo({ top: v, behavior: 'instant' }), y); await p.waitForTimeout(40); }
  await p.waitForTimeout(600);
  for (const l of await p.evaluate(scan)) bad.push(`${pg || 'главная'}, ${nm}: ${l}`);
  await ctx.close();
}

// контакты один раз: разметка главной
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
for (const [what, needle] of [['телефон', 'href="tel:+79106407134"'], ['почта', 'data-mail='], ['бот Завода', 'href="tel:+79038083333"'], ['бот Кегельбара', 'href="tel:+79157028000"'], ['«Как начать»', 'Как начать?'], ['QR', 'class="qr6"']]) {
  const n = html.split(needle).length - 1, want = what === 'QR' || what === '«Как начать»' ? 0 : 1;
  if (n !== want) bad.push(`${what}: встречается ${n} раз, нужно ${want}`);
}
const final = html.slice(html.indexOf('<!-- final:start -->'), html.indexOf('<!-- final:end -->'));
if (/href="tel:|t\.me\/kozflow/.test(final)) bad.push('в #final снова способ связи');

await b.close();
console.log(bad.length ? `FAIL\n  ${bad.join('\n  ')}` : 'PASS');
process.exit(bad.length ? 1 : 0);
