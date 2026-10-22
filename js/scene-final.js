/* scene-final.js — финал петли: KOZFLOW встаёт на место большого слова, в центре.
 * «ДИЗАЙН» уходит (ядро снимает слово на 27), буквы KOZFLOW встают волной с изгибом и наливаются своими цветами.
 * Центр не сдвигается и ни на что не наезжает — на любом экране одинаково.
 * u = t − a (a = 27), 3 с = 6 долей.
 */
REEL.scene('final', (c) => {
  const { tl, a, b, cam, W, mob, $, $$, hero } = c;
  const COL = ['var(--fg)', 'var(--terracotta)', 'var(--gold)', 'var(--forest)', 'var(--sky)', 'var(--terracotta)', 'var(--fg)'];
  cam.innerHTML = `<div class="fi-wm">${[...'KOZFLOW'].map((ch, i) => `<b style="--c:${COL[i]}">${ch}</b>`).join('')}</div>`;
  const wm = $('.fi-wm', cam), L = $$('b', wm);
  // строка слова в центре — туда и встаёт вордмарк
  const words = document.querySelector('.words').getBoundingClientRect(), hr = hero.getBoundingClientRect();
  wm.style.fontSize = '100px';
  const ratio = L.reduce((s, l) => s + l.getBoundingClientRect().width, 0) / 100 || 5.6;
  const fsz = Math.min((W * (mob ? 0.9 : 0.78)) / ratio, words.height * 1.05);
  wm.style.fontSize = fsz + 'px';
  wm.style.top = (words.top - hr.top + words.height / 2) + 'px';

  tl.set(L, { opacity: 0, yPercent: 0, skewX: 0, scaleY: 1, '--f': '0%' }, 0);
  // вуаль-подложка глушит сцену под центром — на финале её нет, вордмарк в полном цвете
  tl.set('.veil', { opacity: 1 }, 0);
  tl.to('.veil', { opacity: 0, duration: 0.3, ease: 'none' }, a);
  tl.to('.veil', { opacity: 1, duration: 0.2, ease: 'none' }, b - 0.2);
  // буквы встают волной: снизу, с наклоном и растяжением, оседают с перелётом; заливка — по очереди
  L.forEach((l, i) => {
    const T = a + 0.08 + i * 0.07;
    tl.set(l, { opacity: 1 }, T);
    tl.fromTo(l, { yPercent: 70, skewX: -18, scaleY: 1.5, transformOrigin: '50% 100%' }, { yPercent: 0, skewX: 0, scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.55)', immediateRender: false }, T);
    tl.fromTo(l, { '--f': '0%' }, { '--f': '100%', duration: 0.4, ease: 'power3.out', immediateRender: false }, a + 0.55 + i * 0.22);
  });
  c.cutOut(L, b, { st: 0.03 });
});
