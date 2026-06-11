/* KozFlow — interactions */
(function () {
  // ── Preloader: hold body until hero video can play, with hard timeout
  (function initLoader() {
    const loader = document.getElementById('kfLoader');
    if (!loader) return;
    const v1 = document.getElementById('v1');
    let done = false;
    function finish() {
      if (done) return;
      done = true;
      document.body.classList.remove('is-loading');
      // remove from DOM after fade
      setTimeout(() => { loader.parentNode && loader.parentNode.removeChild(loader); }, 700);
    }
    // wait for hero video first frame, OR window load, OR 4.5s timeout
    if (v1) {
      const ready = () => finish();
      v1.addEventListener('canplay', ready, { once: true });
      v1.addEventListener('loadeddata', ready, { once: true });
      v1.addEventListener('error', ready, { once: true });
    }
    window.addEventListener('load', () => setTimeout(finish, 200), { once: true });
    setTimeout(finish, 4500); // hard cap
  })();

  // ── Lazy videos: hydrate src when in viewport
  (function initLazyVideos() {
    const vids = document.querySelectorAll('video[data-lazy-src]');
    if (!vids.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const v = e.target;
        if (!v.src) {
          v.src = v.dataset.lazySrc;
          v.preload = 'auto';
          v.muted = true;
          v.loop = v.loop || v.hasAttribute('loop');
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        }
        io.unobserve(v);
      });
    }, { rootMargin: '300px 0px' });
    vids.forEach((v) => io.observe(v));
  })();

  // ── Toast helper (global)
  function showToast(text, ok) {
    let el = document.querySelector('.kf-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'kf-toast';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.toggle('kf-toast-ok', !!ok);
    el.classList.add('is-show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('is-show'), 1800);
  }
  window.__kfToast = showToast;


  // Reveal-on-scroll for inner elements
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Section-level kirifuda-style slide in
  const ktIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
        } else if (e.boundingClientRect.top > 0) {
          // exit when scrolling back up — re-arm
          e.target.classList.remove('is-in');
        }
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -10% 0px' }
  );
  const ktSections = document.querySelectorAll('[data-kt]');
  ktSections.forEach((el) => ktIO.observe(el));

  // Initial pass — reveal anything already visible (or close to it) at load.
  // IO sometimes delays its first callback; without this, sections start at opacity:0.
  function ktInitialPass() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    ktSections.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add('is-in');
    });
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add('is-visible');
    });
  }
  ktInitialPass();
  requestAnimationFrame(ktInitialPass);
  window.addEventListener('load', () => requestAnimationFrame(ktInitialPass));
  window.addEventListener('resize', ktInitialPass);

  // Scroll fallback — if IO is slow/disabled, this still reveals on user scroll.
  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => { ktInitialPass(); scrollTick = false; });
  }, { passive: true });

  // Hero-pill toggle — body.is-past-hero once hero scrolled out of top of viewport
  (function initHeroPillToggle() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const heroIO = new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('is-past-hero', !entry.isIntersecting);
    }, { rootMargin: '-72px 0px 0px 0px', threshold: 0 });
    heroIO.observe(hero);
  })();

  // ── Kinetic full-screen menu (CSS slide + GSAP details)
  (function initKineticMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const navWrap = document.getElementById('navOverlay');
    if (!menuBtn || !navWrap) return;

    const overlay = navWrap.querySelector('.overlay');
    const menuLinks = navWrap.querySelectorAll('.nav-link');
    const fadeTargets = navWrap.querySelectorAll('[data-menu-fade]');
    const btnTexts = menuBtn.querySelectorAll('.menu-button-text p');
    const btnIcon = menuBtn.querySelector('.menu-button-icon');
    const hasGsap = () => typeof window.gsap !== 'undefined';

    let isOpen = false;

    function setInitialState() {
      if (!hasGsap()) return;
      try {
        if (window.CustomEase && !gsap.parseEase('kf-main')) {
          CustomEase.create('kf-main', '0.65, 0.01, 0.05, 0.99');
          gsap.defaults({ ease: 'kf-main', duration: 0.7 });
        }
      } catch (_) { gsap.defaults({ ease: 'power2.out', duration: 0.7 }); }

      gsap.set(menuLinks, { yPercent: 140, rotate: 10 });
      if (fadeTargets.length) gsap.set(fadeTargets, { autoAlpha: 0, yPercent: 50 });
      if (btnTexts.length) gsap.set(btnTexts, { yPercent: 0 });
      if (btnIcon) gsap.set(btnIcon, { rotate: 0 });
    }

    function openMenu() {
      if (isOpen) return;
      isOpen = true;
      navWrap.setAttribute('data-nav', 'open');
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');

      if (!hasGsap()) return;
      const tl = gsap.timeline();
      tl.fromTo(btnTexts, { yPercent: 0 }, { yPercent: -100, stagger: 0.15, duration: 0.5 })
        .fromTo(btnIcon, { rotate: 0 }, { rotate: 315, duration: 0.5 }, '<')
        .fromTo(menuLinks, { yPercent: 140, rotate: 10 }, { yPercent: 0, rotate: 0, stagger: 0.06, duration: 0.7 }, 0.45);
      if (fadeTargets.length) {
        tl.fromTo(fadeTargets,
          { autoAlpha: 0, yPercent: 50 },
          { autoAlpha: 1, yPercent: 0, stagger: 0.04, duration: 0.5, clearProps: 'all' },
          0.7);
      }
    }

    function closeMenu() {
      if (!isOpen) return;
      isOpen = false;
      menuBtn.setAttribute('aria-expanded', 'false');
      navWrap.setAttribute('data-nav', 'closed');
      document.body.classList.remove('menu-open');

      if (!hasGsap()) return;
      const tl = gsap.timeline();
      tl.to(btnTexts, { yPercent: 0, duration: 0.4 })
        .to(btnIcon, { rotate: 0, duration: 0.4 }, '<')
        .to(menuLinks, { yPercent: 140, rotate: 10, duration: 0.4, stagger: -0.03 }, '<');
      if (fadeTargets.length) {
        tl.to(fadeTargets, { autoAlpha: 0, yPercent: 50, duration: 0.3 }, '<');
      }
    }

    function toggle() { isOpen ? closeMenu() : openMenu(); }

    function whenReady(cb) {
      if (hasGsap()) { cb(); return; }
      let tries = 0;
      const id = setInterval(() => {
        tries++;
        if (hasGsap()) { clearInterval(id); cb(); }
        else if (tries > 100) { clearInterval(id); cb(); /* run anyway, CSS-only fallback */ }
      }, 50);
    }

    // Always wire click handlers — CSS handles slide even if GSAP fails
    menuBtn.addEventListener('click', toggle);
    overlay && overlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closeMenu();
    });
    navWrap.querySelectorAll('a[data-close]').forEach((a) => {
      a.addEventListener('click', () => setTimeout(closeMenu, 140));
    });

    whenReady(() => {
      setInitialState();
    });
  })();

  // ── Hero video crossfade loop
  const v1 = document.getElementById('v1');
  const v2 = document.getElementById('v2');
  function setupCrossfade(a, b) {
    const fadeAhead = 1.0;
    let armed = false;
    a.addEventListener('timeupdate', () => {
      if (!a.duration || isNaN(a.duration)) return;
      if (!armed && a.currentTime >= a.duration - fadeAhead) {
        armed = true;
        b.currentTime = 0;
        const p = b.play(); if (p && p.catch) p.catch(()=>{});
        b.classList.remove('fading'); a.classList.add('fading');
      }
    });
    a.addEventListener('ended', () => { a.currentTime = 0; try{a.play();}catch(_){} armed = false; });
  }
  if (v1 && v2) { setupCrossfade(v1, v2); setupCrossfade(v2, v1); }

  // ── FAQ — categories + filter + ask
  const FAQ_CATS = [
    { id: 'all',   label: 'Все' },
    { id: 'scope', label: 'Скоуп' },
    { id: 'time',  label: 'Сроки' },
    { id: 'pay',   label: 'Оплата' },
    { id: 'tech',  label: 'Технологии' },
    { id: 'legal', label: 'Юр' },
  ];
  const faqs = [
    { cat: 'scope', q: 'Что вы делаете и НЕ делаете?', a: 'Делаю: голосовых AI-агентов, Telegram-ботов, автоматизации (n8n / Make), интеграции с CRM, дизайн и инфографику. Не беру: SEO-продвижение, мобильные приложения с нуля, бухгалтерию, маркетинг под ключ.' },
    { cat: 'scope', q: 'Можно ли увидеть демо голосового агента?', a: 'Да. На созвоне даю ссылку на тестовый номер — звоните и проверяйте. Также пришлю записи реальных диалогов из заведений (с обезличенными данными).' },
    { cat: 'time',  q: 'Сколько длится проект?', a: 'Telegram-бот — 1–2 недели. Workflow / интеграции — 2–3 недели. Голосовой агент — 3–5 недель. Срочный запуск возможен с коэффициентом ×1.5.' },
    { cat: 'time',  q: 'Как быстро отвечаете на заявку?', a: 'В течение рабочего дня, обычно за 2–4 часа. Если срочно — пишите в Telegram @kozflow напрямую.' },
    { cat: 'pay',   q: 'Сколько стоит?', a: 'От 15 000 ₽ за простой бот. Голосовой агент — от 30 000 ₽. Workflow — от 15 000 ₽. Все цены фикс, в КП заранее. См. блок «Прайс».' },
    { cat: 'pay',   q: 'Как оплата — карта, счёт, ИП, юр.лицо?', a: 'Любым удобным способом: карта (СБП, Тинькофф), счёт от ИП, безнал на юр.лицо. Работаю как самозанятый и через ИП — выбираем что удобнее.' },
    { cat: 'pay',   q: 'Возможна ли поэтапная оплата?', a: 'Да. Стандарт: 50% предоплата → 50% после сдачи. На крупных проектах — 30/40/30 по этапам. Без скрытых доплат.' },
    { cat: 'tech',  q: 'Можно интегрировать с моей CRM или системой?', a: 'В большинстве случаев — да. Работал с YClients, Bitrix24, AmoCRM, Google Sheets, Notion, Airtable. Если у системы есть API — подключим. Уточняем на созвоне.' },
    { cat: 'tech',  q: 'Голосовой агент звучит как робот?', a: 'Нет. Использую Vapi / Retell с голосами Yandex / ElevenLabs — звучит естественно. На созвоне дам послушать живую запись.' },
    { cat: 'tech',  q: 'Где хранятся данные клиентов?', a: 'По умолчанию — в вашей системе (CRM / таблица / БД). Я только пробрасываю. Если нужно хранение у меня — обсуждаем отдельно, использую серверы в РФ. NDA по запросу.' },
    { cat: 'legal', q: 'NDA, конфиденциальность, владение исходниками?', a: 'NDA подписываю по запросу — высылаю шаблон или подписываю ваш. Все исходники, промпты и доступы передаю после сдачи. Вы — единственный владелец результата.' },
    { cat: 'scope', q: 'Поддержка после запуска и гарантии?', a: 'Первый месяц поддержки — включён в стоимость (доработки, мониторинг, обновление промптов). Если что-то не работает по согласованному ТЗ — дорабатываю бесплатно. Дальше поддержка по договорённости (от 10 000 ₽/мес).' },
    { cat: 'scope', q: 'Работаете с нишами кроме HoReCa?', a: 'Да. HoReCa — основной опыт (30+ проектов), но логика агентов и автоматизаций та же для услуг, ритейла, записи и инфобиза. Разберём вашу задачу на созвоне.' },
    { cat: 'time',  q: 'Что нужно от меня для старта?', a: 'Короткий созвон на 20–30 минут или текстовое ТЗ, доступы к нужным сервисам и пара примеров типичных диалогов или заявок. Остальное беру на себя.' },
  ];
  const faqList = document.getElementById('faqList');
  const faqChips = document.getElementById('faqChips');
  if (faqList && !faqList.dataset.populated) {
    faqList.dataset.populated = '1';

    if (faqChips) {
      FAQ_CATS.forEach((cat, i) => {
        const count = cat.id === 'all' ? faqs.length : faqs.filter(f => f.cat === cat.id).length;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'faq-chip' + (i === 0 ? ' is-active' : '');
        btn.dataset.cat = cat.id;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        btn.innerHTML = cat.label + ' <span class="faq-chip-count">' + count + '</span>';
        faqChips.appendChild(btn);
      });
      faqChips.addEventListener('click', (e) => {
        const t = e.target.closest('.faq-chip');
        if (!t) return;
        const cat = t.dataset.cat;
        faqChips.querySelectorAll('.faq-chip').forEach(c => {
          const on = c === t;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-selected', on);
        });
        faqList.querySelectorAll('.faq-item').forEach(item => {
          item.classList.toggle('is-hidden', cat !== 'all' && item.dataset.cat !== cat);
        });
      });
    }

    const catLabel = id => (FAQ_CATS.find(c => c.id === id) || {}).label || '';
    faqs.forEach((f, i) => {
      const item = document.createElement('div');
      item.className = 'faq-item reveal' + (i < 5 ? ' delay-' + (i+1) : '');
      item.id = 'faq-' + (i+1);
      item.dataset.cat = f.cat;
      const num = String(i+1).padStart(2,'0');
      item.innerHTML = '<button class="faq-q" aria-expanded="false"><span><span style="color:var(--ink-mute);font-family:var(--mono);font-size:11px;letter-spacing:.18em;margin-right:14px;vertical-align:middle">' + num + '</span><span class="faq-item-cat">' + catLabel(f.cat) + '</span>' + f.q + '</span><span class="toggle">+</span></button><div class="faq-a"><div><p>' + f.a + '</p></div></div>';
      const btn = item.querySelector('.faq-q');
      btn.addEventListener('click', () => {
        item.classList.toggle('open');
        btn.setAttribute('aria-expanded', item.classList.contains('open'));
      });
      faqList.appendChild(item);
      io.observe(item);
    });

    const m = location.hash.match(/^#faq-(\d+)/);
    if (m) {
      const target = document.getElementById('faq-' + m[1]);
      if (target) {
        target.classList.add('open');
        target.querySelector('.faq-q').setAttribute('aria-expanded', 'true');
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
      }
    }
  }

  // FAQ ask — POST to /api/submit, fallback to TG link
  const askForm = document.getElementById('faqAskForm');
  if (askForm) {
    askForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('faqAskInput');
      const q = (input.value || '').trim();
      if (!q) return;
      const btn = askForm.querySelector('.faq-ask-btn');
      const orig = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span>Отправка…</span>';
      const sent = await sendToServer({ kind: 'faq', question: q });
      if (sent) {
        btn.innerHTML = '<span>Отправлено ✓</span>';
        input.value = '';
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 2400);
      } else {
        // fallback — open TG with prefilled
        window.open('https://t.me/kozflow?text=' + encodeURIComponent('Привет! Вопрос с сайта: ' + q), '_blank', 'noopener');
        btn.innerHTML = orig;
        btn.disabled = false;
      }
    });
  }

  // Form backend.
  // На GitHub Pages (.ru) серверной функции нет — форму принимает Yandex Cloud Function.
  // После создания функции вставь её URL сюда (см. yandex-function/README.md).
  // Пока стоит заглушка — на Vercel (.com) работает старый /api/submit.
  const FORM_ENDPOINT = 'https://functions.yandexcloud.net/d4e72pvnvo8ikt58b5ne';

  // Shared server submit helper — returns true on success
  async function sendToServer(payload) {
    const endpoint = FORM_ENDPOINT.includes('REPLACE') ? '/api/submit' : FORM_ENDPOINT;
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) return false;
      const data = await r.json().catch(() => ({}));
      return !!data.ok;
    } catch (_) {
      return false;
    }
  }
  // expose for contact form below
  window.__kfSend = sendToServer;

  // ── CONTACT — 3-step state machine
  (function initCtaSteps() {
    const form = document.getElementById('ctaForm');
    if (!form) return;
    const steps  = Array.from(form.querySelectorAll('.cta-step'));
    const progress = Array.from(document.querySelectorAll('.cta-progress-step'));
    const success = form.querySelector('.cta-success');
    const preview = document.getElementById('ctaPreview');
    const taskInput = document.getElementById('fTask');
    const taskCount = document.getElementById('fTaskCount');
    const contactInput = document.getElementById('fContact');
    let cur = 1;

    function go(n) {
      cur = n;
      steps.forEach(s => s.classList.toggle('is-active', Number(s.dataset.step) === n));
      progress.forEach(p => {
        const sn = Number(p.dataset.step);
        p.classList.toggle('is-active', sn === n);
        p.classList.toggle('is-done', sn < n);
      });
      if (success) success.hidden = true;
      const active = steps.find(s => Number(s.dataset.step) === n);
      if (active && n > 1) {
        const focusable = active.querySelector('input:not([type=hidden]):not(.hp), textarea, button[data-step-next]');
        if (focusable) focusable.focus({ preventScroll: true });
      }
    }

    function validateStep(n) {
      if (n === 1) {
        if (!form.querySelector('input[name="type"]:checked')) { flash('Выберите тип задачи'); return false; }
      }
      if (n === 2) {
        if (!form.querySelector('input[name="budget"]:checked'))  { flash('Выберите бюджет'); return false; }
        if (!form.querySelector('input[name="urgency"]:checked')) { flash('Выберите сроки'); return false; }
      }
      if (n === 3) {
        if (!form.name.value.trim())    { flash('Укажите имя'); return false; }
        if (!form.contact.value.trim()) { flash('Укажите контакт'); return false; }
        if (!form.task.value.trim())    { flash('Опишите задачу'); return false; }
      }
      return true;
    }

    let flashEl;
    function flash(text) {
      if (!flashEl) {
        flashEl = document.createElement('div');
        flashEl.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--terracotta);color:var(--cream);padding:12px 20px;border-radius:999px;font-family:var(--mono);font-size:12px;letter-spacing:.12em;z-index:1000;box-shadow:0 12px 30px rgba(45,36,25,.25);transition:opacity .3s';
        document.body.appendChild(flashEl);
      }
      flashEl.textContent = text;
      flashEl.style.opacity = '1';
      clearTimeout(flash._t);
      flash._t = setTimeout(() => { flashEl.style.opacity = '0'; }, 2200);
    }

    form.querySelectorAll('[data-step-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!validateStep(cur)) return;
        if (cur < 3) go(cur + 1);
        updatePreview();
      });
    });
    form.querySelectorAll('[data-step-prev]').forEach(btn => {
      btn.addEventListener('click', () => { if (cur > 1) go(cur - 1); });
    });

    form.querySelectorAll('input[name="channel"]').forEach(r => {
      r.addEventListener('change', () => {
        const v = r.value;
        if (v === 'email') {
          contactInput.type = 'email';
          contactInput.inputMode = 'email';
          contactInput.placeholder = 'name@example.com';
        } else if (v === 'phone') {
          contactInput.type = 'tel';
          contactInput.inputMode = 'tel';
          contactInput.placeholder = '+7 (___) ___-__-__';
        } else {
          contactInput.type = 'text';
          contactInput.inputMode = 'text';
          contactInput.placeholder = '@username';
        }
      });
    });

    if (taskInput && taskCount) {
      taskInput.addEventListener('input', () => {
        taskCount.textContent = taskInput.value.length;
        updatePreview();
      });
    }
    form.addEventListener('change', updatePreview);

    function buildMessage() {
      const data = new FormData(form);
      const channel = data.get('channel') || 'tg';
      const channelLabel = channel === 'tg' ? 'Telegram' : channel === 'email' ? 'Email' : 'Телефон';
      return [
        'Здравствуйте! Заявка с сайта kozflow.ai',
        '',
        'Имя: ' + (data.get('name') || '—'),
        'Контакт (' + channelLabel + '): ' + (data.get('contact') || '—'),
        'Тип задачи: ' + (data.get('type') || '—'),
        'Бюджет: ' + (data.get('budget') || '—'),
        'Сроки: ' + (data.get('urgency') || '—'),
        '',
        'Описание:',
        (data.get('task') || '—'),
      ].join('\n');
    }

    function updatePreview() {
      if (preview) preview.textContent = buildMessage();
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.website && form.website.value) return; // honeypot
      if (!validateStep(3)) return;

      const msg = buildMessage();
      const data = new FormData(form);
      const channel = (data.get('channel')) || 'tg';

      const submitBtn = form.querySelector('.cta-submit');
      const origText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Отправка… <span class="arrow">…</span>';
      }

      // 1) Try server (Telegram bot)
      const sent = await (window.__kfSend || (() => false))({
        kind: 'form',
        name: data.get('name'),
        contact: data.get('contact'),
        channel,
        type: data.get('type'),
        budget: data.get('budget'),
        urgency: data.get('urgency'),
        task: data.get('task'),
        website: data.get('website') || '',
      });

      // 2) Show success state regardless — user always gets a path forward
      steps.forEach(s => s.classList.remove('is-active'));
      progress.forEach(p => p.classList.add('is-done'));
      success.hidden = false;

      // 3) If server failed → fallback open chosen channel
      if (!sent) {
        try {
          if (channel === 'email') {
            const subject = 'Заявка с kozflow.ai';
            window.location.href = 'mailto:kozflow.ai@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(msg);
          } else {
            window.open('https://t.me/kozflow?text=' + encodeURIComponent(msg), '_blank', 'noopener');
          }
        } catch (_) {}
      }

      // 4) Update success copy if delivered
      if (sent) {
        const sub = success.querySelector('.cta-success-sub');
        const title = success.querySelector('.cta-success-title');
        if (title) title.textContent = 'Заявка отправлена ✓';
        if (sub) sub.textContent = 'Уведомление улетело в Telegram. Отвечу за день. Можно также написать напрямую:';
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origText;
      }

      const tg = document.getElementById('successTg');
      const mail = document.getElementById('successMail');
      const copyBtn = document.getElementById('copyMsgBtn');
      if (tg) tg.href = 'https://t.me/kozflow?text=' + encodeURIComponent(msg);
      if (mail) mail.href = 'mailto:kozflow.ai@gmail.com?subject=' + encodeURIComponent('Заявка с kozflow.ai') + '&body=' + encodeURIComponent(msg);
      if (copyBtn) {
        copyBtn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(msg);
            copyBtn.classList.add('is-copied');
            copyBtn.querySelector('span').textContent = 'Скопировано ✓';
            setTimeout(() => {
              copyBtn.classList.remove('is-copied');
              copyBtn.querySelector('span').textContent = 'Скопировать сообщение';
            }, 2000);
          } catch (_) {
            flash('Не удалось скопировать. Выделите текст в превью');
          }
        };
      }
    });

    const restart = document.getElementById('ctaRestart');
    if (restart) {
      restart.addEventListener('click', () => {
        form.reset();
        if (taskCount) taskCount.textContent = '0';
        success.hidden = true;
        progress.forEach(p => p.classList.remove('is-done'));
        go(1);
      });
    }

    updatePreview();
  })();

  // ── CONTACT FAN (nav channel switcher)
  (function initContactFan() {
    const fan = document.getElementById('contactFan');
    if (!fan) return;
    const trigger = document.getElementById('contactFanTrigger');
    const stickyBtn = document.getElementById('stickyContactBtn');

    function setOpen(v) {
      fan.dataset.open = String(v);
      trigger.setAttribute('aria-expanded', String(v));
      document.body.classList.toggle('fan-open', v);
    }
    function toggle() { setOpen(fan.dataset.open !== 'true'); }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });
    if (stickyBtn) {
      stickyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // scroll fan into view + open
        trigger.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => setOpen(true), 280);
      });
    }
    document.addEventListener('click', (e) => {
      if (fan.dataset.open === 'true' && !fan.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && fan.dataset.open === 'true') {
        setOpen(false);
        trigger.focus();
      }
    });
    const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    fan.querySelectorAll('.contact-fan-item').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href') || '';
        // Telegram → always open in new tab
        if (a.classList.contains('contact-fan-item-tg')) {
          setTimeout(() => setOpen(false), 100);
          return;
        }
        // Phone / Email — on mobile let default fire (dialer / mail);
        // on desktop copy the value to clipboard with toast
        if (!isCoarse) {
          e.preventDefault();
          let value = '';
          if (href.startsWith('tel:'))    value = href.replace(/^tel:/, '');
          else if (href.startsWith('mailto:')) value = href.replace(/^mailto:/, '').split('?')[0];
          if (value && navigator.clipboard) {
            navigator.clipboard.writeText(value)
              .then(() => showToast('Скопировано: ' + value, true))
              .catch(() => showToast('Не удалось скопировать'));
          }
        }
        setTimeout(() => setOpen(false), 100);
      });
    });
  })();

  // ── Universal copy-on-desktop for tel:/mailto: links (alts + footer + faq-ask-alts)
  (function initCopyLinks() {
    const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (isCoarse) return; // mobile uses native dialer/mail
    const sels = '.cta-alt, .foot a, .faq-ask-alts a';
    document.querySelectorAll(sels).forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('tel:') && !href.startsWith('mailto:')) return;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const val = href.startsWith('tel:')
          ? href.replace(/^tel:/, '')
          : href.replace(/^mailto:/, '').split('?')[0];
        if (val && navigator.clipboard) {
          navigator.clipboard.writeText(val)
            .then(() => showToast('Скопировано: ' + val, true))
            .catch(() => showToast('Не удалось скопировать'));
        }
      });
    });
  })();

  // ── PRICE — orbital toggle
  (function initOrbitalToggle() {
    const btn = document.getElementById('orbitalToggle');
    const shell = document.getElementById('priceOrbitalShell');
    if (!btn || !shell) return;
    btn.addEventListener('click', () => {
      const isOpen = !shell.hidden;
      shell.hidden = isOpen;
      btn.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen) {
        // trigger orbital reposition by dispatching resize after layout settles
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
          shell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 80);
      }
    });
  })();

  // ── Cases tabs
  const tabs = document.querySelectorAll('.cases-tab');
  const variants = document.querySelectorAll('.cases-variant');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const v = tab.dataset.variant;
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on);
      });
      variants.forEach((el) => {
        el.classList.toggle('is-active', el.dataset.variant === v);
      });
    });
  });

  // ── Generic tab system: pp-* and svc-*
  function wireTabs(tabSel, variantSel, dataKey) {
    const ts = document.querySelectorAll(tabSel);
    const vs = document.querySelectorAll(variantSel);
    ts.forEach((tab) => {
      tab.addEventListener('click', () => {
        const v = tab.dataset[dataKey];
        ts.forEach((t) => {
          const on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', on);
        });
        vs.forEach((el) => el.classList.toggle('is-active', el.dataset[dataKey] === v));
      });
    });
  }
  wireTabs('.pp-tab', '.pp-variant', 'pp');
  wireTabs('.svc-tab', '.svc-variant', 'svc');

  // ── Price · Orbital Timeline
  (function initOrbital() {
    const orbital = document.getElementById('priceOrbital');
    const stage = document.getElementById('priceStage');
    const card = document.getElementById('priceCard');
    if (!orbital || !stage || !card) return;
    const nodes = Array.from(stage.querySelectorAll('.orbital-node'));
    if (!nodes.length) return;

    // Responsive radius — must match orbital-ring CSS dimensions exactly
    // so node centers sit precisely on the ring line
    const getRadius = () => {
      const w = window.innerWidth;
      if (w < 480) return 130;   // matches ring 260px
      if (w < 760) return 180;   // matches ring 360px
      return 260;                 // matches ring 520px
    };

    let angle = 0;
    let auto = true;
    let activeId = null;

    function position() {
      const r = getRadius();
      const N = nodes.length;
      nodes.forEach((node, i) => {
        const a = ((i / N) * 360 + angle) % 360;
        const rad = (a * Math.PI) / 180;
        const x = r * Math.cos(rad);
        const y = r * Math.sin(rad);
        // node-disc tilt-fade based on y-position (front/back)
        const depth = (1 + Math.sin(rad)) / 2; // 0..1
        const opacity = 0.55 + 0.45 * depth;
        const zIndex = Math.round(50 + 50 * Math.cos(rad));
        // position via top/left (transform reserved for CSS hover/active states)
        node.style.left = `calc(50% + ${x}px)`;
        node.style.top  = `calc(50% + ${y}px)`;
        node.style.zIndex = String(node.classList.contains('is-active') ? 200 : zIndex);
        if (!node.classList.contains('is-active') && !node.classList.contains('is-related')) {
          node.style.opacity = String(opacity);
        } else {
          node.style.opacity = '1';
        }
        node._cx = x;
        node._cy = y;
      });
      // place card under active node
      if (activeId != null) {
        const active = nodes.find(n => n.dataset.id === String(activeId));
        if (active) {
          const cx = active._cx;
          const cy = active._cy;
          card.style.left = `calc(50% + ${cx}px)`;
          card.style.top  = `calc(50% + ${cy + 80}px)`;
        }
      }
    }

    let raf = null;
    function animate() {
      if (auto) angle = (angle + 0.18) % 360;
      position();
      raf = requestAnimationFrame(animate);
    }

    function fillCard(node) {
      card.querySelector('[data-bind="title"]').textContent = node.dataset.title;
      card.querySelector('[data-bind="desc"]').textContent  = node.dataset.desc;
      card.querySelector('[data-bind="tag"]').textContent   = node.dataset.tag;
      card.querySelector('[data-bind="time"]').textContent  = node.dataset.time;
      card.querySelector('[data-bind="price"]').textContent = node.dataset.price;
      const energy = parseInt(node.dataset.energy, 10) || 0;
      card.querySelector('[data-bind="energy"]').textContent = energy + '%';
      card.querySelector('[data-bind="energy-bar"]').style.width = energy + '%';
      // related
      const relList = card.querySelector('[data-bind="related"]');
      relList.innerHTML = '';
      const relIds = (node.dataset.related || '').split(',').map(s=>s.trim()).filter(Boolean);
      relIds.forEach(rid => {
        const target = nodes.find(n => n.dataset.id === rid);
        if (!target) return;
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = target.dataset.title.replace(/ \/ .*/, '').replace(/^([^—]+).*/, '$1').trim();
        b.addEventListener('click', (e) => { e.stopPropagation(); activate(rid); });
        relList.appendChild(b);
      });
    }

    function activate(id) {
      const node = nodes.find(n => n.dataset.id === String(id));
      if (!node) return;
      activeId = String(id);
      auto = false;
      orbital.dataset.active = activeId;
      // align so active node sits at top (-90deg) for visibility
      const idx = nodes.indexOf(node);
      const target = -90 - (idx / nodes.length) * 360;
      angle = target;
      // classes
      const relIds = (node.dataset.related || '').split(',').map(s=>s.trim()).filter(Boolean);
      nodes.forEach(n => {
        n.classList.toggle('is-active', n === node);
        n.classList.toggle('is-related', relIds.includes(n.dataset.id) && n !== node);
      });
      fillCard(node);
      card.classList.add('is-visible');
      card.setAttribute('aria-hidden', 'false');
      position();
    }

    function deactivate() {
      activeId = null;
      auto = true;
      orbital.dataset.active = '';
      nodes.forEach(n => n.classList.remove('is-active','is-related'));
      card.classList.remove('is-visible');
      card.setAttribute('aria-hidden', 'true');
    }

    nodes.forEach(node => {
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        if (node.classList.contains('is-active')) deactivate();
        else activate(node.dataset.id);
      });
    });

    // click empty area inside orbital to deactivate
    orbital.addEventListener('click', (e) => {
      if (e.target === orbital || e.target.classList.contains('orbital-ring') ||
          e.target.classList.contains('orbital-stage')) {
        deactivate();
      }
    });

    // pause/resume on hover
    orbital.addEventListener('mouseenter', () => { if (!activeId) auto = false; });
    orbital.addEventListener('mouseleave', () => { if (!activeId) auto = true; });

    window.addEventListener('resize', position);

    animate();
  })();

  // ── Cases showcase: cursor-follow preview
  const showcase = document.getElementById('caseShowcase');
  const preview = document.getElementById('showcasePreview');
  if (showcase && preview) {
    const imgs = preview.querySelectorAll('img');
    const rows = showcase.querySelectorAll('.sc-row');
    let targetX = 0, targetY = 0, x = 0, y = 0;
    let active = -1;
    let raf = null;

    function start() {
      if (raf) return;
      const tick = () => {
        x += (targetX - x) * 0.18;
        y += (targetY - y) * 0.18;
        preview.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${active >= 0 ? 1 : 0.88})`;
        if (Math.abs(x - targetX) > 0.3 || Math.abs(y - targetY) > 0.3 || active >= 0) {
          raf = requestAnimationFrame(tick);
        } else { raf = null; }
      };
      raf = requestAnimationFrame(tick);
    }

    showcase.addEventListener('mousemove', (e) => {
      // position offset so preview sits to the right of cursor and slightly above
      const px = e.clientX + 28;
      const py = e.clientY - 110;
      // clamp inside viewport
      const w = preview.offsetWidth, h = preview.offsetHeight;
      targetX = Math.max(8, Math.min(window.innerWidth - w - 8, px));
      targetY = Math.max(8, Math.min(window.innerHeight - h - 8, py));
      // initialise position immediately on first move to avoid swoop from 0,0
      if (active === -1 && x === 0 && y === 0) { x = targetX; y = targetY; }
      start();
    });

    rows.forEach((row, i) => {
      row.addEventListener('mouseenter', () => {
        active = i;
        preview.classList.add('is-visible');
        imgs.forEach((img) => img.classList.toggle('is-active', Number(img.dataset.i) === i));
        start();
      });
      row.addEventListener('mouseleave', () => {
        active = -1;
        preview.classList.remove('is-visible');
        imgs.forEach((img) => img.classList.remove('is-active'));
      });
    });
  }

  // ── Custom cursor (beige + soft trail) — desktop only
  if (!window.matchMedia('(hover: none), (pointer: coarse)').matches) {
    const TRAIL_LEN = 8;
    const dots = [];
    for (let i = 0; i < TRAIL_LEN; i++) {
      const d = document.createElement('div');
      d.className = 'kt-trail';
      d.style.opacity = String(0.55 * (1 - i / TRAIL_LEN));
      d.style.width = d.style.height = (10 - i * 0.7) + 'px';
      document.body.appendChild(d);
      dots.push({ el: d, x: 0, y: 0 });
    }
    const cursor = document.createElement('div');
    cursor.className = 'kt-cursor';
    document.body.appendChild(cursor);
    let mx = 0, my = 0;
    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    function tick() {
      cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      let px = mx, py = my;
      for (const d of dots) {
        d.x += (px - d.x) * 0.28;
        d.y += (py - d.y) * 0.28;
        d.el.style.transform = `translate(${d.x}px, ${d.y}px) translate(-50%,-50%)`;
        px = d.x; py = d.y;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ── Hero text — cursor proximity effect (vanilla port of motion/react)
  (function initCursorText() {
    const targets = document.querySelectorAll('[data-cursor-text]');
    if (!targets.length) return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const RADIUS = 180;
    const FROM_COLOR = [232, 214, 168];   // var(--cream) cool ~#E8D6A8
    const TO_COLOR   = [196, 152, 90];    // var(--gold) #C4985A
    const SCALE_FROM = 1;
    const SCALE_TO   = 1.45;

    const allLetters = [];

    targets.forEach((root) => {
      const walk = (node) => {
        const children = Array.from(node.childNodes);
        children.forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent;
            if (!text || !text.trim()) return;
            const frag = document.createDocumentFragment();
            for (const ch of text) {
              if (ch === ' ') {
                const sp = document.createElement('span');
                sp.className = 'ws';
                sp.textContent = ' ';
                frag.appendChild(sp);
              } else {
                const sp = document.createElement('span');
                sp.className = 'cl';
                sp.textContent = ch;
                frag.appendChild(sp);
                allLetters.push(sp);
              }
            }
            node.replaceChild(frag, child);
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            // skip if already wrapped or is a <br>
            if (child.tagName === 'BR') return;
            if (child.classList && (child.classList.contains('cl') || child.classList.contains('ws'))) return;
            walk(child);
          }
        });
      };
      walk(root);
    });

    if (!allLetters.length) return;

    let mx = -9999, my = -9999;
    let raf = null;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    });
    document.addEventListener('mouseleave', () => {
      mx = -9999; my = -9999;
      if (!raf) raf = requestAnimationFrame(update);
    });

    function update() {
      raf = null;
      allLetters.forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(mx - cx, my - cy);
        // Gaussian falloff — strongest at center, fades out at radius
        const t = Math.exp(-Math.pow(dist / (RADIUS / 2), 2) / 2);
        const tc = Math.min(Math.max(t, 0), 1);
        const scale = SCALE_FROM + (SCALE_TO - SCALE_FROM) * tc;
        const r1 = Math.round(FROM_COLOR[0] + (TO_COLOR[0] - FROM_COLOR[0]) * tc);
        const g1 = Math.round(FROM_COLOR[1] + (TO_COLOR[1] - FROM_COLOR[1]) * tc);
        const b1 = Math.round(FROM_COLOR[2] + (TO_COLOR[2] - FROM_COLOR[2]) * tc);
        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.color = `rgb(${r1},${g1},${b1})`;
      });
    }
  })();

  // ── Why stats — count-up on scroll into view
  (function initWhyCounters() {
    const stats = document.querySelectorAll('.why-stat-num[data-count]');
    if (!stats.length) return;
    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const unitEl = el.querySelector('.why-stat-unit');
      const unit = unitEl ? unitEl.outerHTML : '';
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = Math.round(eased * target);
        el.innerHTML = String(value) + unit;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const ioStats = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCount(e.target);
          ioStats.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach((el) => ioStats.observe(el));
  })();

  // ── Flip cards — click-to-flip on all devices (in addition to hover)
  (function initFlip() {
    const flips = document.querySelectorAll('[data-flip]');
    if (!flips.length) return;
    flips.forEach((el) => {
      el.addEventListener('click', (e) => {
        // ignore clicks on inner CTA links (so they navigate)
        if (e.target.closest('a, button')) return;
        el.classList.toggle('is-flipped');
      });
    });
  })();

  // ── 3D tilt — gravitate effect on [data-card] (lerp-smoothed)
  (function initTilt() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(hover: none)').matches;
    if (reduce || coarse) return;
    const cards = document.querySelectorAll('[data-card]');
    if (!cards.length) return;

    const TILT = 6;
    const SCALE = 1.025;
    const PERSP = 1400;
    const LERP = 0.12;

    cards.forEach((el) => {
      el.classList.add('tilt-host');
      const cs = getComputedStyle(el);
      if (cs.position === 'static') el.style.position = 'relative';

      const spot = document.createElement('div');
      spot.className = 'tilt-spotlight';
      spot.setAttribute('aria-hidden', 'true');
      el.appendChild(spot);

      const cur = { rx: 0, ry: 0, sx: 50, sy: 50 };
      const tgt = { rx: 0, ry: 0, sx: 50, sy: 50 };
      let raf = 0;
      let active = false;

      const tick = () => {
        cur.rx += (tgt.rx - cur.rx) * LERP;
        cur.ry += (tgt.ry - cur.ry) * LERP;
        cur.sx += (tgt.sx - cur.sx) * LERP;
        cur.sy += (tgt.sy - cur.sy) * LERP;
        const sc = active ? SCALE : 1;
        el.style.transform =
          `perspective(${PERSP}px) rotateX(${cur.rx.toFixed(3)}deg) rotateY(${cur.ry.toFixed(3)}deg) scale3d(${sc},${sc},${sc})`;
        spot.style.setProperty('--mx', cur.sx.toFixed(2) + '%');
        spot.style.setProperty('--my', cur.sy.toFixed(2) + '%');
        const settled =
          Math.abs(tgt.rx - cur.rx) < 0.02 &&
          Math.abs(tgt.ry - cur.ry) < 0.02;
        if (!active && settled) {
          el.style.transform = '';
          raf = 0;
          return;
        }
        raf = requestAnimationFrame(tick);
      };

      el.addEventListener('pointerenter', () => {
        active = true;
        el.classList.add('tilt-active');
      });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        tgt.rx = (py - 0.5) * (TILT * 2) * -1;
        tgt.ry = (px - 0.5) * (TILT * 2);
        tgt.sx = px * 100;
        tgt.sy = py * 100;
        if (!raf) raf = requestAnimationFrame(tick);
      });
      el.addEventListener('pointerleave', () => {
        active = false;
        el.classList.remove('tilt-active');
        tgt.rx = 0; tgt.ry = 0; tgt.sx = 50; tgt.sy = 50;
        if (!raf) raf = requestAnimationFrame(tick);
      });
    });
  })();

  // ── Mobile accordion: tier cards
  (function initTierAccordion() {
    const mql = window.matchMedia('(max-width: 720px)');
    const tiers = Array.from(document.querySelectorAll('.price-tier'));
    if (!tiers.length) return;
    function attach() {
      tiers.forEach(t => {
        if (t._kfAccBound) return;
        t._kfAccBound = true;
        t.addEventListener('click', e => {
          if (!mql.matches) return;
          if (e.target.closest('.price-tier-cta')) return;
          t.classList.toggle('is-open');
        });
      });
    }
    function reset() {
      if (!mql.matches) tiers.forEach(t => t.classList.remove('is-open'));
    }
    attach();
    mql.addEventListener('change', reset);
  })();

  // ── Mobile horizontal scroll: snap progress dots for services + process
  (function initSnapDots() {
    const mql = window.matchMedia('(max-width: 720px)');
    const targets = [
      { rail: '.svc-grid', dotWrap: '#svcDots' },
      { rail: '.pr-flow',  dotWrap: '#prDots'  },
    ];
    targets.forEach(({ rail, dotWrap }) => {
      const r = document.querySelector(rail);
      const w = document.querySelector(dotWrap);
      if (!r || !w) return;
      function build() {
        if (!mql.matches) { w.innerHTML = ''; return; }
        const items = r.children;
        if (w.children.length !== items.length) {
          w.innerHTML = '';
          for (let i = 0; i < items.length; i++) {
            const d = document.createElement('span');
            d.className = 'snap-dot';
            w.appendChild(d);
          }
        }
        update();
      }
      function update() {
        if (!mql.matches) return;
        const items = r.children;
        const sl = r.scrollLeft + r.clientWidth / 2;
        let active = 0;
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          if (it.offsetLeft <= sl && it.offsetLeft + it.offsetWidth >= sl) { active = i; break; }
        }
        Array.from(w.children).forEach((d, i) => d.classList.toggle('is-active', i === active));
      }
      build();
      r.addEventListener('scroll', update, { passive: true });
      mql.addEventListener('change', build);
      window.addEventListener('resize', build);
    });
  })();
})();
