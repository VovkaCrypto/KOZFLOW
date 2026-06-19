# KozFlow B2B Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перепозиционировать лендинг KozFlow с B2C-фриланс-тона на серьёзный B2B (ЛПР/директора, солидно для инвестора) через копирайт, прайс-подачу и hero-визуал — без слома структуры и техстека.

**Architecture:** Правки в 3 корневых файлах: `index.html` (разметка+копирайт всех секций), `app.js` (FAQ-массив + микрокопирайт формы), `styles.css` (тёмный editorial-hero, тим-блок, фон контакта). Структура секций, JS-логика и анимации сохраняются. Видео-кодер (`assets/hero.mp4`) убирается из 3 мест.

**Tech Stack:** Статический сайт — HTML + ванильный JS + CSS, GSAP (CDN). Деплой Vercel из корня.

**Spec:** `docs/superpowers/specs/2026-06-19-kozflow-b2b-redesign-design.md`

## Global Constraints

- Деплой Vercel из **корня** — править только корневые `index.html`, `app.js`, `styles.css`, `works-orbit.js`. НЕ трогать `kozflow-landing-site/`.
- Позиция: студия двоих — **Владимир Козлов** (AI/разработка/продукт) + **Арсений Кизельбаш** (продажи/клиенты/операционка). Голос «мы».
- Запрещённые строки нигде (HTML+JS): `фрилансер`, `один человек`, `без джунов`, `SOLO`, `самозанятый`, `инфобиз`, `Почему я`, `веду` (в смысле «я веду»).
- Нигде нет сумм в ₽ и `×1.5` — везде «по запросу» / «от проекта» / «фикс в КП».
- Тон: деловой, без хайпа/эмоджи. Везде «я»→«мы».
- Юр-подача нейтральная: «работаем по договору, безнал». Форму ИП/ООО НЕ указывать.
- Бэкап существует: ветка `backup/b2c-pre-b2b`, папка `_backup_b2c_2026-06-19/`. Откат: `git checkout backup/b2c-pre-b2b -- index.html styles.css app.js works-orbit.js`.
- H1 по умолчанию: «Меньше операционки.» / «Больше выручки.» (легко заменить — см. Task 1).

**Проверка в браузере (для visual-шагов):** открыть `index.html` локально (`python -m http.server` из корня → http://localhost:8000) либо использовать skill `run`.

---

### Task 1: Hero — тёмный editorial, новый H1/sub/CTA, убрать видео-кодер

**Files:**
- Modify: `index.html` (HERO, стр. ~210–239; META стр. ~6–13)
- Modify: `styles.css` (hero-стили — добавить editorial-фон)

**Interfaces:**
- Produces: класс `.hero--editorial` + разметка `#heroBg` (gradient-mesh + зерно), используемая только в hero.

- [ ] **Step 1: Заменить hero-видео-стек на editorial-фон**

В `index.html` блок `<div class="hero-video-stack" id="videoStack">…</div>` (включая 2 `<video>` и `<img class="hero-poster">`) и `<div class="hero-dim"></div>` заменить на:

```html
  <div class="hero-bg" id="heroBg" aria-hidden="true">
    <div class="hero-mesh"></div>
    <div class="hero-grain"></div>
    <div class="hero-vignette"></div>
  </div>
```

- [ ] **Step 2: Новый H1 / sub / CTA**

Заменить `<h1 …>` и `<p class="sub …">` и блок CTA на:

```html
    <h1 class="reveal delay-1 cursor-text" data-cursor-text style="opacity: 1"><span class="it">Меньше операционки.</span><br /><span class="it">Больше выручки.</span></h1>
    <p class="sub reveal delay-2">
      AI-агенты, автоматизация процессов и аналитика для бизнеса.<br />
      Внедряем системы, которые работают вместо людей — и окупаются.
    </p>
    <div class="reveal delay-3" id="heroCtaWrap">
      <div class="hero-cta-row">
        <a class="cta cta-outline" href="#contact">Обсудить задачу <span class="arrow">→</span></a>
        <a class="cta cta-ghost" href="#cases">Смотреть кейсы</a>
      </div>
    </div>
```

- [ ] **Step 3: META под студию/результат**

В `<head>` заменить:
- `<title>` → `KozFlow — студия AI-агентов и автоматизаций для бизнеса`
- `<meta name="description" …>` content → `Голосовые AI-агенты, автоматизация процессов и аналитика. Внедряем системы, которые работают вместо людей и окупаются. По договору, удалённо по РФ.`
- `<meta property="og:title" …>` content → `KozFlow — меньше операционки, больше выручки`
- `<meta property="og:description" …>` content → `AI-агенты, автоматизация и аналитика для бизнеса. Рабочие системы в проде, не слайды.`

- [ ] **Step 4: CSS — editorial-фон hero**

В `styles.css` добавить (в конец файла):

```css
/* B2B hero — dark editorial */
.hero .hero-bg{position:absolute;inset:0;z-index:0;background:#0b0c10;overflow:hidden}
.hero .hero-mesh{position:absolute;inset:-20%;background:
  radial-gradient(40% 50% at 20% 30%, rgba(80,110,160,.45), transparent 70%),
  radial-gradient(45% 55% at 80% 25%, rgba(150,120,90,.40), transparent 70%),
  radial-gradient(50% 60% at 60% 90%, rgba(60,70,110,.50), transparent 70%);
  filter:blur(40px);animation:heroMesh 22s ease-in-out infinite alternate}
@keyframes heroMesh{0%{transform:translate3d(-3%,-2%,0) scale(1.05)}100%{transform:translate3d(3%,2%,0) scale(1.15)}}
.hero .hero-grain{position:absolute;inset:0;opacity:.06;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.hero .hero-vignette{position:absolute;inset:0;background:radial-gradient(120% 120% at 50% 30%, transparent 40%, rgba(0,0,0,.55) 100%)}
@media (prefers-reduced-motion: reduce){.hero .hero-mesh{animation:none}}
```

- [ ] **Step 5: Verify (визуально + grep)**

```bash
grep -nE "hero\.mp4|videoStack|hero-poster" index.html
```
Expected: в HERO-секции (стр. ~210–240) совпадений НЕТ (видео-кодер убран из hero; в why/contact ещё есть — это Task 5/8).
Визуально: hero тёмный, читаемый H1 «Меньше операционки / Больше выручки», CTA «Обсудить задачу» + «Смотреть кейсы».

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css
git commit -m "feat(hero): dark editorial hero + B2B H1/meta, drop coder video"
```

---

### Task 2: Strip + Clients + Services — B2B-копирайт

**Files:**
- Modify: `index.html` (PROOF STRIP ~242–260, CLIENTS ~263–287, SERVICES ~289–341)

- [ ] **Step 1: Proof strip — результат-пруфы**

В `.strip-track` заменить набор `<span>` (и дубликат для loop — оба одинаково) на этот порядок:

```html
      <span>Голосовые AI-агенты в проде</span><span class="dot">·</span>
      <span>0 пропущенных звонков и броней</span><span class="dot">·</span>
      <span class="stack-tag">Claude · n8n · Vapi · Telegram API</span><span class="dot">·</span>
      <span>Работаем по договору · безнал · NDA</span><span class="dot">·</span>
      <span>Удалённо по РФ и СНГ</span><span class="dot">·</span>
      <span>30+ внедрений в HoReCa</span><span class="dot">·</span>
```
Продублировать те же 6 пар с `aria-hidden="true"` (как было).

- [ ] **Step 2: Clients — серьёзный заголовок**

```html
      <span class="kicker">нам доверяют</span>
      <h3 class="clients-title serif">компании, которые нам доверяют</h3>
```

- [ ] **Step 3: Services — язык результата (3 карточки `.c6-text`)**

AI-агенты:
```html
        <p class="c6-text">Голосовые и текстовые агенты принимают звонки и заявки 24/7, фиксируют брони и отвечают клиентам — без расширения штата. Ни один звонок не теряется.</p>
```
Автоматизации:
```html
        <p class="c6-text">Процессы без ручного труда: интеграции CRM и мессенджеров, автоотчёты, сквозная аналитика. Заявки доходят туда, где их ждут — без потерь.</p>
```
Визуал:
```html
        <p class="c6-text">Дизайн, который продаёт: брендинг, презентации, инфографика для бизнеса. Материалы уровня, под которым не стыдно подписаться.</p>
```

- [ ] **Step 4: Verify**

```bash
grep -nE "работали со мной|Скажите НЕТ|воображени|действующих заведениях" index.html
```
Expected: совпадений НЕТ.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(copy): B2B strip/clients/services — outcome language"
```

---

### Task 3: Cases — reframe под надёжность и ROI («мы»)

**Files:**
- Modify: `index.html` (CASES ~343–543)

- [ ] **Step 1: Lede усилить**

`.cases-lede`:
```html
        <p class="cases-lede reveal delay-1">Не слайды — рабочие системы в проде. Голосовых агентов можно прямо сейчас набрать и проверить голосом.</p>
```

- [ ] **Step 2: Eyebrows → «в проде»**

- Завод: `<span class="flagship-eyebrow">голосовой агент · в проде с 2025</span>`
- Кинза: `<span class="flagship-eyebrow">голосовая хостес · в проде с 2026</span>`
- ABC: оставить `веб-приложение · 2026` (уже ок).

- [ ] **Step 3: Desc — убрать casual, добавить надёжность (где честно)**

Завод `.flagship-desc`:
```html
          <p class="flagship-desc">Принимает звонки клуба круглосуточно: бронирует дорожки, бильярд и караоке, отвечает по меню и ценам, фиксирует заявки — без участия персонала. Ноль пропущенных звонков, ноль потерянных броней. Голос и VK работают на одной логике.</p>
```
Кинза `.flagship-desc` — оставить (уже про «двойное подтверждение · ноль случайных броней»), только убедиться в тоне (ок).
ABC `.flagship-desc` — оставить (ок).

- [ ] **Step 4: Вторичные кейсы (`.sc-row`) — проверить тон**

Оставить как есть (уже про бизнес-эффект: «−5 ч ручной работы», «0 потерянных заявок», «реакция за минуты»). Менять не нужно.

- [ ] **Step 5: Verify**

```bash
grep -nE "Не слайды|в проде|пропущенных" index.html
```
Expected: совпадения есть (lede + eyebrows + Завод desc).

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat(cases): reframe flagships for reliability/ROI"
```

---

### Task 4: Price → «Стоимость» — убрать все ₽

**Files:**
- Modify: `index.html` (PRICE ~597–770)

- [ ] **Step 1: Заголовок секции**

```html
      <div class="kicker">Стоимость</div>
      <h2 class="section-title serif" style="margin-top:14px">Как формируется стоимость</h2>
      <p class="price-orbital-hint reveal delay-1">фикс-стоимость в КП · оплата по этапам · без скрытых платежей</p>
```

- [ ] **Step 2: Тир-карты — суммы → «по запросу»**

В каждой из 5 `.price-tier` заменить блок `.price-tier-price-row` целиком на:
```html
        <div class="price-tier-price-row">
          <span class="price-tier-amount serif">по запросу</span>
        </div>
```
(удаляет `<span class="price-tier-from">от</span>` и числовые суммы у всех тиров, включая design «от 2 000 ₽»).

- [ ] **Step 3: Опции — мелкие ₽ → «по запросу»**

В `.price-side-list-options` у каждой `.opt-price` заменить значение на `по запросу`:
- `×1.5` → `по запросу`
- `+15к/мес` → `по запросу`
- `+10к` → `по запросу`
- `+8к` → `по запросу`
- `+25к` → `по запросу`

- [ ] **Step 4: Verify — нет цифр-цен**

```bash
grep -nE "[0-9][0-9 ]*₽|×1\.5|\+[0-9]+к|от 2 000|price-tier-from" index.html
```
Expected: совпадений НЕТ.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(price): remove all ₽ amounts -> по запросу"
```

---

### Task 5: Why — студия двоих, тим-блок вместо видео-портрета

**Files:**
- Modify: `index.html` (WHY ~772–915)
- Modify: `styles.css` (тим-блок)

- [ ] **Step 1: Заголовок**

```html
      <h2 class="why-title">Почему KozFlow</h2>
```

- [ ] **Step 2: Переписать 6 `.why-name` + `.why-desc`**

Левая колонка:
```html
          <h3 class="why-name">Студия, а не конвейер</h3>
          <p class="why-desc">Работаете напрямую с основателями. Нет цепочки менеджеров и джунов, через которых теряются детали и сроки.</p>
```
```html
          <h3 class="why-name">HoReCa-экспертиза</h3>
          <p class="why-desc">30+ проектов для ресторанов, баров и сетей. Знаем индустрию изнутри — редкое преимущество в AI-разработке.</p>
```
```html
          <h3 class="why-name">Системы уже в проде</h3>
          <p class="why-desc">Голосовые агенты работают в действующих заведениях: принимают звонки, отвечают, фиксируют брони — без участия персонала.</p>
```
Правая колонка:
```html
          <h3 class="why-name">Быстрый старт</h3>
          <p class="why-desc">Без брифов на 40 страниц. Письменно или коротким созвоном — и сразу к делу. Фиксированное предложение, пилот за 2 недели.</p>
```
```html
          <h3 class="why-name">Прозрачно и по договору</h3>
          <p class="why-desc">Цена в КП заранее, не «по факту». Работаем по договору, безнал. NDA по запросу. Исходники и доступы — ваши после сдачи.</p>
```
```html
          <h3 class="why-name">Работает без вас</h3>
          <p class="why-desc">Настраивается один раз и дальше работает автономно: звонки, заявки, отчёты — без вашего участия. Первый месяц поддержки включён.</p>
```

- [ ] **Step 3: Центр — тим-блок двоих (заменить видео-портрет)**

Заменить `<div class="why-portrait reveal">…</div>` целиком на:

```html
        <div class="why-portrait why-team reveal">
          <div class="why-team-badge mono">KOZFLOW · STUDIO</div>
          <div class="why-team-list">
            <div class="why-team-card">
              <div class="why-team-ini serif" aria-hidden="true">ВК</div>
              <div class="why-team-meta">
                <div class="why-team-name serif">Владимир Козлов</div>
                <div class="why-team-role">AI · разработка · продукт</div>
              </div>
            </div>
            <div class="why-team-card">
              <div class="why-team-ini serif" aria-hidden="true">АК</div>
              <div class="why-team-meta">
                <div class="why-team-name serif">Арсений Кизельбаш</div>
                <div class="why-team-role">клиенты · проекты · операционка</div>
              </div>
            </div>
          </div>
          <div class="why-portrait-frame" aria-hidden="true"></div>
        </div>
```

- [ ] **Step 4: CSS — тим-блок**

В `styles.css` добавить (в конец):
```css
/* B2B why — team block */
.why-team{display:flex;flex-direction:column;gap:18px;justify-content:center;padding:28px;
  background:linear-gradient(160deg,#11131a,#1b1e28);border-radius:var(--radius,22px);min-height:320px;position:relative}
.why-team-badge{font-size:11px;letter-spacing:.22em;color:rgba(255,255,255,.55)}
.why-team-list{display:flex;flex-direction:column;gap:16px}
.why-team-card{display:flex;align-items:center;gap:16px}
.why-team-ini{width:56px;height:56px;flex:0 0 56px;display:grid;place-items:center;border-radius:50%;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);color:#fff;font-size:20px}
.why-team-name{color:#fff;font-size:18px;line-height:1.2}
.why-team-role{color:rgba(255,255,255,.6);font-size:13px;letter-spacing:.04em;margin-top:3px}
```

- [ ] **Step 5: Подпись стека — оставить; убедиться нет «фрилансер/SOLO»**

Старый блок `.why-portrait-overlay` со `SOLO · OPERATOR` / «фрилансер» удалён вместе с Step 3 (он был внутри `.why-portrait`). Проверить, что `.why-stack` (стек-пиллы) остался — он отдельным блоком ниже, не трогать.

- [ ] **Step 6: Verify**

```bash
grep -nE "Почему я|SOLO|OPERATOR|фрилансер|один человек|без джунов" index.html
```
Expected: совпадений НЕТ.

- [ ] **Step 7: Commit**

```bash
git add index.html styles.css
git commit -m "feat(why): studio team block, drop solo/freelancer + portrait video"
```

---

### Task 6: Process — договор/NDA, B2B-язык

**Files:**
- Modify: `index.html` (PROCESS ~546–595)

- [ ] **Step 1: Этап 2 «Предложение» — добавить договор**

```html
        <p class="pr-step-desc">Скоуп, сроки, стоимость. Фиксируем договором и КП</p>
        <span class="pr-step-meta">кп · договор · nda</span>
```

- [ ] **Step 2: Этап 1 desc — «мы»**

```html
        <p class="pr-step-desc">Разбираем задачу вместе. Без брифов на 40 страниц</p>
```

- [ ] **Step 3: Этап 3 desc — «мы»**

```html
        <p class="pr-step-desc">Внедряем. Вы следите за прогрессом</p>
```

- [ ] **Step 4: Verify**

```bash
grep -nE "Делаю\.|договор" index.html
```
Expected: «Делаю.» НЕТ; «договор» есть.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(process): contract/NDA + we-voice"
```

---

### Task 7: FAQ — переписать массив в app.js (цены/самозанятый/фрилансер/инфобиз/я→мы)

**Files:**
- Modify: `app.js` (массив `faqs`, стр. ~319–340)

- [ ] **Step 1: Заменить весь массив `faqs` целиком**

Заменить от `const faqs = [` до закрывающей `];` на:

```js
  const faqs = [
    { cat: 'scope', q: 'Что вы делаете и НЕ делаете?', a: 'Делаем: голосовых AI-агентов, Telegram-ботов, автоматизации (n8n / Make), интеграции с CRM, дизайн и инфографику. Не беремся за: SEO-продвижение, мобильные приложения с нуля, бухгалтерию, маркетинг под ключ.' },
    { cat: 'scope', q: 'Можно ли увидеть демо голосового агента?', a: 'Да. На созвоне даём ссылку на тестовый номер — звоните и проверяйте. Также пришлём записи реальных диалогов из заведений (с обезличенными данными).' },
    { cat: 'time',  q: 'Сколько длится проект?', a: 'Telegram-бот — 1–2 недели. Workflow / интеграции — 2–3 недели. Голосовой агент — 3–5 недель. Срочный запуск возможен — обсуждаем отдельно.' },
    { cat: 'time',  q: 'Как быстро отвечаете на заявку?', a: 'В течение рабочего дня, обычно за 2–4 часа. Если срочно — пишите в Telegram @kozflow напрямую.' },
    { cat: 'pay',   q: 'Сколько стоит?', a: 'Стоимость считаем под задачу — фиксируем в КП заранее, без скрытых доплат. Оплата по этапам. Сориентируем по бюджету на первом созвоне.' },
    { cat: 'pay',   q: 'Как оплата — счёт, безнал, юр.лицо?', a: 'Работаем по договору, безналичный расчёт — счёт для ИП и юр.лиц. Оплата по этапам.' },
    { cat: 'pay',   q: 'Возможна ли поэтапная оплата?', a: 'Да. Стандарт: 50% предоплата → 50% после сдачи. На крупных проектах — 30/40/30 по этапам. Без скрытых доплат.' },
    { cat: 'tech',  q: 'Можно интегрировать с моей CRM или системой?', a: 'В большинстве случаев — да. Работали с YClients, Bitrix24, AmoCRM, Google Sheets, Notion, Airtable. Если у системы есть API — подключим. Уточняем на созвоне.' },
    { cat: 'tech',  q: 'Голосовой агент звучит как робот?', a: 'Нет. Используем Vapi / Retell с голосами Yandex / ElevenLabs — звучит естественно. На созвоне дадим послушать живую запись.' },
    { cat: 'tech',  q: 'Где хранятся данные клиентов?', a: 'По умолчанию — в вашей системе (CRM / таблица / БД). Мы только пробрасываем. Если нужно хранение у нас — обсуждаем отдельно, используем серверы в РФ. NDA по запросу.' },
    { cat: 'legal', q: 'Договор, NDA, владение исходниками?', a: 'Работаем по договору. NDA подписываем по запросу — высылаем шаблон или подписываем ваш. Все исходники, промпты и доступы передаём после сдачи. Вы — единственный владелец результата.' },
    { cat: 'scope', q: 'Поддержка после запуска и гарантии?', a: 'Первый месяц поддержки включён в стоимость (доработки, мониторинг, обновление промптов). Если что-то не работает по согласованному ТЗ — дорабатываем бесплатно. Дальше поддержка по договорённости.' },
    { cat: 'scope', q: 'Работаете с нишами кроме HoReCa?', a: 'Да. HoReCa — основной опыт (30+ проектов), но логика агентов и автоматизаций та же для услуг, ритейла, сетей и записи. Разберём вашу задачу на созвоне.' },
    { cat: 'time',  q: 'Что нужно от вас для старта?', a: 'Короткий созвон на 20–30 минут или текстовое ТЗ, доступы к нужным сервисам и пара примеров типичных диалогов или заявок. Остальное берём на себя.' },
    { cat: 'pay',   q: 'Есть гарантия, если результат не подойдёт?', a: 'Да. Работаем по согласованному ТЗ: если агент не делает то, о чём договорились — дорабатываем бесплатно до результата. Две итерации правок уже включены.' },
    { cat: 'tech',  q: 'Бот умеет переводить звонок на живого человека?', a: 'Да. Сложный или нестандартный случай агент передаёт менеджеру — звонком, в Telegram или в CRM. Вы сами решаете, что считать «горячим» и куда это направлять.' },
    { cat: 'tech',  q: 'А если агент чего-то не знает или ошибётся?', a: 'Он не выдумывает. На незнакомый вопрос отвечает честно и переводит на человека или фиксирует заявку. Все диалоги логируются — слабые места видно сразу, в первый месяц поддержки подкручиваем промпты.' },
    { cat: 'tech',  q: 'Какой номер нужен для голосового агента?', a: 'Можно подключить новый (выдаём виртуальный / SIP) или ваш текущий через переадресацию. Существующий номер заведения остаётся прежним — звонки просто начинает принимать агент.' },
    { cat: 'scope', q: 'Можно начать с малого и расширять потом?', a: 'Да, так и советуем. Сначала пилот на одну задачу — например, приём звонков. Убеждаемся, что работает, потом достраиваем брони, отзывы, интеграции. Платите по мере роста.' },
    { cat: 'scope', q: 'Чем вы лучше конструкторов ботов и подрядчиков?', a: 'Конструкторы ломаются на нестандартных диалогах. Мы делаем под вашу логику: реальные брони, интеграции, передача человеку. Работаете напрямую со студией, без потерь между людьми, и мы знаем HoReCa изнутри.' },
  ];
```

- [ ] **Step 2: Verify — нет B2C-сигналов в FAQ**

```bash
grep -nE "₽|самозанят|фрилансер|инфобиз|Веду проект один|×1\.5|От 15 000|от 30 000" app.js
```
Expected: совпадений НЕТ.

- [ ] **Step 3: Visual — FAQ рендерится, категории работают**

Открыть сайт → секция FAQ: вопросы отображаются, чипы-категории (Все/Скоуп/Сроки/Оплата/Технологии/Юр) фильтруют, раскрытие работает.

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat(faq): B2B rewrite — drop prices/самозанятый/фрилансер, we-voice"
```

---

### Task 8: Contact + форма — бюджет-чипы, «отвечаем», микрокопирайт

**Files:**
- Modify: `index.html` (CONTACT ~953–1098)
- Modify: `app.js` (микрокопирайт ~410–560, если есть «я»-формы)

- [ ] **Step 1: Подзаголовки контакта — «мы»**

`.cta-section` sub (стр. ~959) и `.cta-fineprint` (стр. ~1053):
```html
    <p class="sub reveal delay-2">Отвечаем в течение дня · работаем по договору · NDA по запросу</p>
```
```html
          <p class="cta-fineprint">отвечаем за день · по договору · NDA по запросу</p>
```

- [ ] **Step 2: Бюджет-чипы — поднять порог**

Заменить 5 `<label class="cta-chip">` в `role="radiogroup" aria-label="Бюджет"` на:
```html
              <label class="cta-chip"><input type="radio" name="budget" value="до 150 тыс ₽"><span>до 150к</span></label>
              <label class="cta-chip"><input type="radio" name="budget" value="150 — 400 тыс ₽"><span>150 — 400к</span></label>
              <label class="cta-chip"><input type="radio" name="budget" value="400 тыс+ ₽"><span>400к+</span></label>
              <label class="cta-chip"><input type="radio" name="budget" value="обсудим"><span>обсудим</span></label>
```
(было 5 чипов с «до 30к» — стало 4 с поднятым порогом.)

- [ ] **Step 3: Видео-фон контакта → убрать (Task 1 убрал hero.mp4 из hero; здесь второй источник)**

Заменить `<video class="bg-video" data-lazy-src="assets/hero.mp4?v=2" …></video>` и следующий `<div class="bg-fade"></div>` на:
```html
  <div class="cta-bg" aria-hidden="true"></div>
```
И в `styles.css` добавить:
```css
.cta-section .cta-bg{position:absolute;inset:0;z-index:0;background:
  radial-gradient(60% 80% at 50% 0%, rgba(80,110,160,.30), transparent 70%), #0b0c10}
```

- [ ] **Step 4: app.js — «я»→«мы» в микрокопирайте формы**

Проверить строки ~410–560. Если присутствуют формы единственного числа в видимых пользователю строках (тосты/превью) — перевести в «мы». Лейблы-валидаторы («Выберите тип задачи», «Укажите имя» и т.п.) и «Здравствуйте! Заявка с сайта» — нейтральны, не трогать.

```bash
grep -nE "отвечаю|я свяжусь|напишу|перезвоню" app.js
```
Для каждого совпадения в видимой строке заменить на «мы»-форму. Если совпадений нет — шаг пропустить.

- [ ] **Step 5: Verify**

```bash
grep -nE "bg-video|hero\.mp4|до 30к|отвечаю в течение" index.html app.js
```
Expected: в CONTACT совпадений НЕТ. (hero.mp4 может остаться в why-портрете — он удалён в Task 5; перепроверить в Step 6 финального свипа.)

- [ ] **Step 6: Commit**

```bash
git add index.html app.js styles.css
git commit -m "feat(contact): we-voice, raise budget tiers, drop bg video"
```

---

### Task 9: Footer + финальный свип

**Files:**
- Modify: `index.html` (FOOTER ~1101–1110)
- Sweep: `index.html`, `app.js`

- [ ] **Step 1: Footer — студия**

```html
    <div>KozFlow · студия AI и автоматизаций · Тверь · 2026</div>
```
Контакты справа оставить.

- [ ] **Step 2: Финальный grep — запрещённые строки (вся кодовая база)**

```bash
grep -rnE "фрилансер|один человек|без джунов|SOLO|самозанят|инфобиз|Почему я|×1\.5|[0-9][0-9 ]+₽|от 2 000|hero\.mp4|bg-video|работали со мной" index.html app.js
```
Expected: **0 совпадений.** Любое совпадение — вернуться в соответствующий Task и доправить.

- [ ] **Step 3: Финальный grep — «я»-формы (ручной просмотр)**

```bash
grep -nE "\bя\b|сделаю|веду\b|пробрасываю|даю послушать|использую\b" index.html app.js
```
Expected: видимых пользователю «я»-форм нет (служебные/в кавычках примеров — оценить вручную, кейс-by-кейс).

- [ ] **Step 4: Visual smoke — весь сайт**

Открыть `index.html`, проскроллить все секции: hero (тёмный, без видео), strip, clients, services, cases (номера ботов на месте, кликабельны), price («по запросу», без ₽), why (тим-блок двоих, без видео), process (договор), faq (рендер+фильтр), contact (без видео-фона, бюджет 4 чипа), footer (студия). Консоль без новых ошибок.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(footer): studio line + final B2B sweep"
```

---

### Task 10: Деплой-проверка + кэш-бамп

**Files:**
- Modify: `index.html` (версии ассетов при необходимости)

- [ ] **Step 1: Бамп версий изменённых ассетов**

Если правились `styles.css`/`app.js` — поднять query-версии в `index.html`, чтобы обойти кэш:
- `styles.css?v=68` → `styles.css?v=69`
- `app.js?v=27` → `app.js?v=28`

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "chore: bump asset cache versions"
```

- [ ] **Step 3: Push (по подтверждению пользователя)**

⚠️ НЕ пушить без явного «пушь». После подтверждения:
```bash
git push origin main
```
Vercel деплоит из корня автоматически. Проверить прод после деплоя.

---

## Self-Review

**Spec coverage:**
- §1 позиция (студия/мы) → Task 5, 7, 9 ✓
- §2 тон → все Task ✓
- §3.1 hero → Task 1 ✓
- §3.2 strip → Task 2 ✓
- §3.3 clients → Task 2 ✓
- §3.4 services → Task 2 ✓
- §3.5 cases → Task 3 ✓
- §3.6 process + договор → Task 6 ✓
- §3.7 price убрать ₽ → Task 4 ✓
- §3.8 why/team → Task 5 ✓
- §3.9 FAQ → Task 7 ✓
- §3.10 contact → Task 8 ✓
- §3.11 footer → Task 9 ✓
- §3.12 я→мы + meta → Task 1 (meta), 6/7/8 (мы), 9 (sweep) ✓
- §3.13 юр → Task 5, 7 ✓
- §3.14 ROI → Task 3 ✓
- §3.15 отзывы НЕ добавляем → не делаем ✓ (явно)
- §4 видео-кодер 3 места → Task 1 (hero), 5 (why), 8 (contact) ✓

**Placeholder scan:** Все шаги содержат конкретный код/строки. H1 — дефолт задан, swap-инструкция в Task 1. FAQ — полный массив. ✓

**Type/selector consistency:** новые классы `.hero-bg/.hero-mesh/.hero-grain/.hero-vignette` (Task 1), `.why-team*` (Task 5), `.cta-bg` (Task 8) — определены в CSS в тех же тасках. ✓
