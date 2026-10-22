/* scene-motion.js — «Моушен»: работ нет, только ремесло движения. Кадр тёмный.
 * Центр — само слово МОУШЕН и знак показывают приёмы один за другим: волна, растяжение, распад на частицы
 * вместе со знаком и сборка, пульс знака, пикселизация с палитрой, глитч, переворот букв с перекраской, дыхание кернинга.
 * Фон — WebGL: ~7000 частиц, сетка → тор-узел (3,2) → сфера; вращение ведёт курсор.
 * По углам — демо без рамок, по три на угол, у каждого угла свой переход (диафрагма, жалюзи, пиксели, шторка).
 * Всё — чистая функция времени ролика t (u = t − a, a = 14).
 */
REEL.scene('motion', (c) => {
  const { tl, a, b, cam, W, H, mob, $, $$ } = c;
  const DUR = b - a;
  const PAL = { cream: [0.96, 0.94, 0.87], terra: [0.76, 0.42, 0.29], gold: [0.77, 0.6, 0.35], sky: [0.66, 0.77, 0.85], lav: [0.79, 0.71, 0.89], pink: [0.91, 0.66, 0.72] };
  cam.innerHTML = `
    <canvas class="mo-gl"></canvas>
    ${(mob ? ['one'] : ['tl', 'tr', 'bl', 'br']).map((q) => `<div class="it mo-pan mo-${q}"><canvas class="cv"></canvas><div class="ft caps"></div></div>`).join('')}`;
  const glc = $('.mo-gl', cam), PAN = $$('.mo-pan', cam);

  /* ───────── WebGL: частицы ───────── */
  const gl = glc.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: true });
  const N = mob ? 2600 : 7000;
  let prog = null, U = {};
  if (gl) {
    const vs = `
      attribute vec3 aGrid; attribute vec3 aKnot; attribute vec3 aSph; attribute vec3 aCol; attribute float aR;
      uniform float uM1, uM2, uT, uAsp, uSize, uRy, uRx, uBurst;
      varying vec3 vCol; varying float vA;
      void main(){
        vec3 p = mix(mix(aGrid, aKnot, uM1), aSph * (1.0 + uBurst * (0.4 + aR)), uM2);
        p += 0.018 * vec3(sin(uT*1.7 + aR*40.0), cos(uT*1.3 + aR*30.0), sin(uT*1.1 + aR*20.0)) * (uM1 + uM2);
        float cy = cos(uRy), sy = sin(uRy), cx = cos(uRx), sx = sin(uRx);
        p = vec3(cy*p.x + sy*p.z, p.y, -sy*p.x + cy*p.z);
        p = vec3(p.x, cx*p.y - sx*p.z, sx*p.y + cx*p.z);
        float z = p.z + 3.4;
        gl_Position = vec4(p.x * 2.1 / (z * uAsp), p.y * 2.1 / z, 0.0, 1.0);
        gl_PointSize = uSize * (0.6 + aR) / z;
        vCol = aCol; vA = smoothstep(6.0, 2.0, z);
      }`;
    const fs = `
      precision mediump float; varying vec3 vCol; varying float vA; uniform float uA;
      void main(){ vec2 d = gl_PointCoord - 0.5; float r = dot(d, d); if (r > 0.25) discard;
        gl_FragColor = vec4(vCol, uA * vA * smoothstep(0.25, 0.05, r)); }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); gl.useProgram(prog);
    const grid = new Float32Array(N * 3), knot = new Float32Array(N * 3), sph = new Float32Array(N * 3), col = new Float32Array(N * 3), rnd = new Float32Array(N);
    const cols = Math.ceil(Math.sqrt(N * 2.2)), rows = Math.ceil(N / cols);
    const cset = [PAL.cream, PAL.cream, PAL.cream, PAL.terra, PAL.gold, PAL.sky, PAL.lav];
    let seed = 7; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < N; i++) {
      grid[i * 3] = ((i % cols) / (cols - 1) - 0.5) * 3.6; grid[i * 3 + 1] = (Math.floor(i / cols) / (rows - 1) - 0.5) * 2.0; grid[i * 3 + 2] = 0;
      const ph = (i / N) * Math.PI * 2, p = 3, q = 2, rr = Math.cos(q * ph) + 2.2;
      const kx = rr * Math.cos(p * ph), ky = rr * Math.sin(p * ph), kz = -Math.sin(q * ph);
      const tube = 0.32 * Math.sqrt(rand()), ang = rand() * Math.PI * 2;
      knot[i * 3] = (kx + tube * Math.cos(ang)) * 0.41; knot[i * 3 + 1] = (ky + tube * Math.sin(ang)) * 0.41; knot[i * 3 + 2] = (kz * 1.4 + tube * Math.sin(ang * 1.7)) * 0.41;
      const yy = 1 - (i / (N - 1)) * 2, rad = Math.sqrt(1 - yy * yy), th = i * 2.399963;
      sph[i * 3] = Math.cos(th) * rad * 1.15; sph[i * 3 + 1] = yy * 1.15; sph[i * 3 + 2] = Math.sin(th) * rad * 1.15;
      const cc = cset[Math.floor(rand() * cset.length)]; col.set(cc, i * 3); rnd[i] = rand();
    }
    const attr = (name, data, size) => { const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); const loc = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); };
    attr('aGrid', grid, 3); attr('aKnot', knot, 3); attr('aSph', sph, 3); attr('aCol', col, 3); attr('aR', rnd, 1);
    ['uM1', 'uM2', 'uT', 'uAsp', 'uSize', 'uRy', 'uRx', 'uBurst', 'uA'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  }
  const dpr = Math.min(2, devicePixelRatio || 1);
  glc.width = W * dpr; glc.height = H * dpr;

  /* ───────── демо по углам: 2D-холсты ───────── */
  const pans = PAN.map((p) => ({ el: p, cv: $('.cv', p), ft: $('.ft', p) }));
  pans.forEach((p) => { p.g = p.cv.getContext('2d'); });
  function sizePans() { pans.forEach((p) => { p.w = p.cv.clientWidth; p.h = p.cv.clientHeight; p.cv.width = p.w * dpr; p.cv.height = p.h * dpr; p.g.setTransform(dpr, 0, 0, dpr, 0, 0); }); }

  tl.set(PAN, { opacity: 0, x: 0 }, 0);
  c.cutIn(PAN, a + 0.25, { dur: 0.5 });
  c.cutOut(PAN, b);

  const cl = (x, a0 = 0, a1 = 1) => Math.max(a0, Math.min(a1, x));
  const sm = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
  const e4 = (x) => { x = cl(x); return x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2; };
  const C = { cream: '#F5EFDF', mute: '#9C8E76', line: 'rgba(245,239,223,.16)', terra: '#C26B4A', gold: '#C4985A', sky: '#A8C5D9', lav: '#C9B6E4', pink: '#E8A9B8', forest: '#3A4A3D', night: '#17120D' };
  const font = (px, w = 500) => `${w} ${px}px STRome, Georgia, serif`;

  function drawGL(u, t) {
    if (!gl || !prog) return;
    gl.viewport(0, 0, glc.width, glc.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    if (u < 0 || u > DUR) return;
    const m1 = e4((u - 0.5) / 1.0) - e4((u - 6.4) / 1.0);
    const m2 = e4((u - 4.6) / 0.6) * (1 - e4((u - 6.0) / 0.5));
    const burst = sm((u - 2.85) / 0.25) * (1 - sm((u - 3.4) / 0.6)) * 0.6 + sm((u - 4.6) / 0.4) * (1 - sm((u - 5.4) / 0.6));
    const alpha = sm(u / 0.4) * (1 - sm((u - DUR + 0.45) / 0.4));
    const cur = REEL.cursor || { x: 0, y: 0 };
    gl.uniform1f(U.uM1, cl(m1)); gl.uniform1f(U.uM2, cl(m2)); gl.uniform1f(U.uT, t); gl.uniform1f(U.uAsp, W / H);
    gl.uniform1f(U.uSize, (mob ? 8 : 10.5) * dpr); gl.uniform1f(U.uBurst, burst);
    gl.uniform1f(U.uRy, u * 0.55 * m1 + cur.x * 0.9); gl.uniform1f(U.uRx, 0.35 * m1 + cur.y * 0.6);
    gl.uniform1f(U.uA, alpha * 0.9);
    gl.drawArrays(gl.POINTS, 0, N);
  }

  /* ── демо ── */
  function tTiming(g, w, h, lu) {
    g.font = font(Math.min(w * 0.2, 60), 900); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.strokeStyle = 'rgba(245,239,223,.12)'; g.lineWidth = 1; g.strokeText('ШОУРИЛ', w / 2, h * 0.36);
    const y0 = h * 0.8, x0 = w * 0.1, x1 = w * 0.9;
    g.strokeStyle = C.line; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.stroke();
    g.font = font(9); g.fillStyle = C.mute; g.textAlign = 'center';
    [['СЖАТИЕ', 0.22], ['РАСТЯЖЕНИЕ', 0.5], ['УДАР', 0.8]].forEach(([s, p]) => { const x = x0 + (x1 - x0) * p; g.fillRect(x - 0.5, y0 - 4, 1, 8); g.fillText(s, x, y0 + 16); });
    const per = 0.56, i = Math.min(2, Math.floor(lu / per)), f = lu / per - i;
    const final = lu >= per * 2 + per * 0.5;
    const xb = x0 + (x1 - x0) * cl(0.08 + lu / 1.95 * 0.75);
    const hgt = h * 0.5 * Math.pow(0.78, i) * 4 * f * (1 - f);
    const near = Math.min(f, 1 - f), r = Math.min(w, h) * 0.055;
    let sx = 1, sy = 1;
    if (!final) { if (near < 0.07) { sx = 1.45; sy = 0.6; } else if (near < 0.16) { sx = 0.82; sy = 1.28; } }
    g.save(); g.translate(xb, y0 - (final ? 0 : hgt));
    if (final) {
      const k = sm((lu - per * 2.5) / 0.15);
      g.strokeStyle = C.terra; g.lineWidth = 1.5; g.beginPath(); g.ellipse(0, -r * 0.4, r * (1.2 + k * 0.8), r * (1.2 + k * 0.8), 0, 0, 7); g.stroke();
      for (let s = 0; s < 12; s++) { const ang = -Math.PI * (0.1 + 0.8 * s / 11), d = r * (1.4 + 2.6 * k) * (0.7 + (s % 3) * 0.2); g.fillStyle = s % 3 ? C.terra : C.gold; g.globalAlpha = 1 - k * 0.7; g.beginPath(); g.arc(Math.cos(ang) * d, Math.sin(ang) * d - r * 0.3, 2, 0, 7); g.fill(); }
      g.globalAlpha = 1; g.fillStyle = C.terra; g.beginPath(); g.ellipse(0, -r * 0.3, r * (1 + k), r * (1 - k * 0.6), 0, 0, 7); g.fill();
    } else {
      g.fillStyle = i === 2 && f > 0.5 ? C.terra : C.cream; g.beginPath(); g.ellipse(0, -r * sy, r * sx, r * sy, 0, 0, 7); g.fill();
    }
    g.restore();
    return 'шар · сжатие и растяжение';
  }
  // морфинг: одна замкнутая кривая перетекает круг → квадрат → звезда → капля с упругим доводом
  const SHAPES = [
    () => 1,
    (th) => 0.86 / Math.max(Math.abs(Math.cos(th)), Math.abs(Math.sin(th))),
    (th) => 0.5 + 0.5 * Math.pow((Math.cos(5 * th) + 1) / 2, 2.4),
    (th, t) => 0.82 + 0.13 * Math.sin(3 * th + t * 2) + 0.06 * Math.sin(5 * th - t * 3)
  ];
  const elastic = (x) => { x = cl(x); return x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI) / 3) + 1; };
  function tMorph(g, w, h, lu, t) {
    const seg = 0.62, i = Math.floor(lu / seg), f = elastic((lu - i * seg) / 0.5);
    const A = SHAPES[i % 4], B = SHAPES[(i + 1) % 4], cx = w / 2, cy = h * 0.46, R = Math.min(w, h) * 0.34, rot = lu * 0.9;
    const path = (fn, k) => { g.beginPath(); for (let s = 0; s <= 180; s++) { const th = (s / 180) * Math.PI * 2, r = R * fn(th, t) * k; s ? g.lineTo(cx + Math.cos(th + rot) * r, cy + Math.sin(th + rot) * r) : g.moveTo(cx + Math.cos(th + rot) * r, cy + Math.sin(th + rot) * r); } g.closePath(); };
    g.setLineDash([3, 5]); g.strokeStyle = 'rgba(245,239,223,.35)'; g.lineWidth = 1; path(B, 1.12); g.stroke(); g.setLineDash([]);
    const gr = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R); gr.addColorStop(0, C.terra); gr.addColorStop(0.5, C.gold); gr.addColorStop(1, C.pink);
    g.fillStyle = gr; path((th, tt) => A(th, tt) + (B(th, tt) - A(th, tt)) * f, 1); g.fill();
    // вершины-узлы, как в редакторе
    g.fillStyle = C.cream;
    for (let s = 0; s < 8; s++) { const th = (s / 8) * Math.PI * 2, r = R * (A(th, t) + (B(th, t) - A(th, t)) * f); g.fillRect(cx + Math.cos(th + rot) * r - 2.5, cy + Math.sin(th + rot) * r - 2.5, 5, 5); }
    return 'морфинг · одна кривая, четыре формы';
  }
  const mb = document.createElement('canvas'), MW = 150, MH = 190; mb.width = MW; mb.height = MH; const mg = mb.getContext('2d'); const img = mg.createImageData(MW, MH);
  const BANDS = [[194, 107, 74], [196, 152, 90], [201, 182, 228], [232, 169, 184], [168, 197, 217], [245, 239, 223]];
  function tLiquid(g, w, h, lu, t) {
    const bl = [0, 1, 2, 3, 4].map((k) => ({ x: 0.5 + 0.33 * Math.sin(t * (0.9 + k * 0.23) + k * 2.1), y: 0.5 + 0.36 * Math.cos(t * (0.7 + k * 0.19) + k * 1.3), r: 0.085 + 0.022 * k }));
    const d = img.data;
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const px = x / MW, py = y / MH; let f = 0;
      for (const o of bl) { const dx = px - o.x, dy = (py - o.y) * (MH / MW); f += (o.r * o.r) / (dx * dx + dy * dy + 1e-4); }
      const j = (y * MW + x) * 4;
      if (f > 1) { const band = Math.floor(Math.log2(f) * 3.2) % BANDS.length, c0 = BANDS[band]; d[j] = c0[0]; d[j + 1] = c0[1]; d[j + 2] = c0[2]; d[j + 3] = 255; }
      else d[j + 3] = 0;
    }
    mg.putImageData(img, 0, 0);
    g.imageSmoothingEnabled = true; g.drawImage(mb, w * 0.06, h * 0.04, w * 0.88, h * 0.82);
    const lf = Math.min(w * 0.13, h * 0.13, 38);
    g.font = `italic 300 ${lf}px STRome, Georgia, serif`; g.fillStyle = C.cream; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillText('жидкость.', w / 2, h - lf * 0.28);
    return 'метаболы · поле и контуры';
  }
  // фигуры Лиссажу: светящийся след с утончением
  function tLissajous(g, w, h, lu, t) {
    const cx = w / 2, cy = h * 0.48, Ax = w * 0.4, Ay = h * 0.4, d = lu * 0.7, t0 = lu * 2.6, n = 160;
    const P = (s) => [cx + Math.sin(3 * s + d) * Ax, cy + Math.sin(4 * s) * Ay];
    g.lineCap = 'round';
    for (let k = 1; k < n; k++) {
      const s0 = t0 - 2.6 * (1 - (k - 1) / n), s1 = t0 - 2.6 * (1 - k / n), [x0, y0] = P(s0), [x1, y1] = P(s1), q = k / n;
      g.strokeStyle = q > 0.66 ? C.cream : q > 0.33 ? C.sky : C.lav; g.globalAlpha = q; g.lineWidth = 0.6 + q * 3.2;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
    g.globalAlpha = 1; const [hx, hy] = P(t0);
    g.fillStyle = C.gold; g.beginPath(); g.arc(hx, hy, 5, 0, 7); g.fill();
    g.strokeStyle = 'rgba(196,152,90,.4)'; g.lineWidth = 1; g.beginPath(); g.arc(hx, hy, 11 + 4 * Math.sin(t * 10), 0, 7); g.stroke();
    return 'лиссажу · 3:4 и сдвиг фазы';
  }
  function tGeometry(g, w, h, lu) {
    const cols = 4, rows = 5, s = Math.min(w / cols, h * 0.86 / rows), ox = (w - s * cols) / 2, oy = h * 0.04;
    const pal = [C.cream, C.terra, C.gold, C.sky, C.night];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const p = cl(lu * 1.25 - (i + j) * 0.09), flip = Math.cos(Math.PI * p), swap = p > 0.5;
      const k = (i * 7 + j * 3 + (swap ? 2 : 0)) % 6;
      g.save(); g.translate(ox + i * s + s / 2, oy + j * s + s / 2); g.scale(Math.abs(flip) || 0.001, 1); g.rotate((swap ? 1 : 0) * Math.PI / 2 * ((i + j) % 2 ? 1 : -1));
      g.fillStyle = pal[(i + j * 2 + (swap ? 1 : 0)) % 5]; g.fillRect(-s / 2 + 1, -s / 2 + 1, s - 2, s - 2);
      g.fillStyle = pal[(i * 2 + j + 3 + (swap ? 2 : 0)) % 5]; const r = s / 2 - 1; g.beginPath();
      if (k === 0) { g.moveTo(-r, -r); g.arc(-r, -r, 2 * r, 0, Math.PI / 2); g.closePath(); g.fill(); }
      else if (k === 1) { g.arc(0, r, r, Math.PI, 0); g.fill(); }
      else if (k === 2) { g.ellipse(0, 0, r, r * 0.45, Math.PI / 4, 0, 7); g.fill(); }
      else if (k === 3) { for (let q = -2; q <= 2; q++) g.fillRect(-r, q * r * 0.4 - r * 0.1, 2 * r, r * 0.2); }
      else if (k === 4) { g.fillRect(-r, -r * 0.18, 2 * r, r * 0.36); g.fillRect(-r * 0.18, -r, r * 0.36, 2 * r); }
      else { g.lineWidth = r * 0.35; g.strokeStyle = g.fillStyle; g.arc(0, 0, r * 0.62, 0, 7); g.stroke(); }
      g.restore();
    }
    return 'плитки баухауса · каскад';
  }
  function tType(g, w, h, lu, t) {
    const word = 'ВОЛНА', fs = Math.min(w * 0.24, 78);
    g.font = font(fs, 900); g.textBaseline = 'alphabetic'; g.textAlign = 'center';
    const widths = [...word].map((ch) => g.measureText(ch).width), tot = widths.reduce((s, x) => s + x, 0);
    let x = w / 2 - tot / 2;
    [...word].forEach((ch, i) => {
      const cw = widths[i], y = h * 0.52 + Math.sin(t * 6 - i * 0.8) * h * 0.06;
      g.save(); g.translate(x + cw / 2, y); g.rotate(Math.sin(t * 4 - i) * 0.08); g.transform(1, 0, Math.sin(t * 5 - i * 0.9) * 0.3, 1, 0, 0);
      g.fillStyle = [C.cream, C.terra, C.gold, C.sky, C.lav][i]; g.fillText(ch, 0, 0); g.restore();
      x += cw;
    });
    g.font = font(fs * 0.5, 900); g.lineWidth = 1; g.strokeStyle = 'rgba(245,239,223,.25)';
    for (let r = 0; r < 3; r++) g.strokeText('ВОЛНА ВОЛНА', w / 2 + Math.sin(t + r) * 20, h * (0.18 + r * 0.06) + h * 0.55);
    return 'кинетика букв · волна и наклон';
  }
  function tCurve(g, w, h, lu) {
    const m = 18, x0 = m, y0 = h * 0.8, cw = w - 2 * m, ch = h * 0.66;
    g.strokeStyle = C.line; g.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(x0 + cw * i / 4, y0); g.lineTo(x0 + cw * i / 4, y0 - ch); g.stroke(); g.beginPath(); g.moveTo(x0, y0 - ch * i / 4); g.lineTo(x0 + cw, y0 - ch * i / 4); g.stroke(); }
    const k = sm((lu - 0.2) / 1.1), p1 = [0.25 + 0.58 * k, 0.1 - 0.1 * k], p2 = [0.17, 1];
    const P = (q) => [x0 + q[0] * cw, y0 - q[1] * ch];
    const A = P([0, 0]), B = P(p1), Cc = P(p2), Dd = P([1, 1]);
    g.strokeStyle = 'rgba(245,239,223,.5)'; g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.moveTo(...Dd); g.lineTo(...Cc); g.stroke();
    g.strokeStyle = C.terra; g.lineWidth = 2.5; g.beginPath(); g.moveTo(...A); g.bezierCurveTo(...B, ...Cc, ...Dd); g.stroke();
    [[B, C.cream], [Cc, C.cream]].forEach(([q, col]) => { g.fillStyle = col; g.beginPath(); g.arc(q[0], q[1], 5, 0, 7); g.fill(); });
    g.save(); g.translate(B[0] + 4, B[1] + 4); g.fillStyle = C.cream; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 16); g.lineTo(4.5, 12); g.lineTo(8, 19); g.lineTo(10.5, 18); g.lineTo(7, 11); g.lineTo(12.5, 11); g.closePath(); g.fill(); g.restore();
    const ph = (lu * 0.9) % 1, bez = (s, a0, a1, a2, a3) => (1 - s) ** 3 * a0 + 3 * (1 - s) ** 2 * s * a1 + 3 * (1 - s) * s * s * a2 + s ** 3 * a3;
    let s = ph; for (let it = 0; it < 8; it++) { const xx = bez(s, 0, p1[0], p2[0], 1); s = cl(s - (xx - ph) * 0.8); }
    const yy = bez(s, 0, p1[1], p2[1], 1);
    g.strokeStyle = C.gold; g.lineWidth = 1; g.beginPath(); g.moveTo(x0 + ph * cw, y0); g.lineTo(x0 + ph * cw, y0 - ch); g.stroke();
    g.fillStyle = C.gold; g.beginPath(); g.arc(x0 + ph * cw, y0 - yy * ch, 5, 0, 7); g.fill();
    g.font = font(10); g.fillStyle = C.cream; g.textAlign = 'left';
    g.fillText(`cubic-bezier(${p1[0].toFixed(2)}, ${p1[1].toFixed(2)}, 0.17, 1.00)`, x0, y0 + 22);
    return 'редактор кривых · значение';
  }
  // волна маятников (вид сверху): у каждого свой период, вместе они рисуют змейку, расходятся и сходятся
  function tPendulum(g, w, h, lu) {
    const n = 15, top = h * 0.06, step = (h * 0.86) / (n - 1), cx = w / 2, A = w * 0.4, pts = [];
    for (let k = 0; k < n; k++) { const ph = 2 * Math.PI * lu * (0.9 + k * 0.075); pts.push([cx + Math.sin(ph) * A, top + k * step]); }
    g.strokeStyle = 'rgba(245,239,223,.22)'; g.lineWidth = 1; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    g.strokeStyle = C.line; g.beginPath(); g.moveTo(cx, top - 6); g.lineTo(cx, top + (n - 1) * step + 6); g.stroke();
    pts.forEach(([x, y], k) => { const q = k / (n - 1); g.fillStyle = q < 0.33 ? C.terra : q < 0.66 ? C.gold : C.sky; g.beginPath(); g.arc(x, y, 3 + 3 * (1 - Math.abs(x - cx) / A), 0, 7); g.fill(); });
    return 'маятники · волна из фаз';
  }
  function tRhythm(g, w, h, lu, t) {
    const n = 16, bw = (w - 36) / n, base = h * 0.8;
    const grad = g.createLinearGradient(0, base, 0, base - h * 0.62); grad.addColorStop(0, C.gold); grad.addColorStop(0.55, C.terra); grad.addColorStop(1, C.pink);
    const beatPhase = (t % 0.5) / 0.5, hit = Math.exp(-beatPhase * 5), bi = Math.floor(t / 0.5);
    for (let i = 0; i < n; i++) {
      const r = Math.abs(Math.sin(i * 12.9898 + bi * 78.233) * 43758.5453) % 1;
      const v = 0.12 + 0.88 * (0.35 * Math.abs(Math.sin(t * 3 + i * 0.6)) + 0.65 * hit * (0.4 + 0.6 * r));
      g.fillStyle = grad; g.beginPath(); g.roundRect(18 + i * bw + 2, base - v * h * 0.62, bw - 4, v * h * 0.62, (bw - 4) / 2); g.fill();
    }
    // такт — четыре точки, текущая доля вспыхивает
    for (let k = 0; k < 4; k++) { const on = bi % 4 === k; g.fillStyle = on ? C.cream : 'rgba(245,239,223,.25)'; g.beginPath(); g.arc(w - 18 - (3 - k) * 16, h * 0.08, on ? 4 + 3 * hit : 3, 0, 7); g.fill(); }
    g.font = font(10); g.fillStyle = C.mute; g.textAlign = 'left'; g.fillText('120 BPM · ВСЁ НА СЕТКЕ', 18, base + 22);
    return 'ритм · удар на долю';
  }
  function tGizmo(g, w, h, lu, t) {
    const cx = w / 2, cy = h * 0.46, R = Math.min(w, h) * 0.3, cur = REEL.cursor || { x: 0, y: 0 };
    const ry = (t - a) * 0.55 + cur.x * 0.9, rx = 0.35 + cur.y * 0.6;
    const pr = (v) => { let [x, y, z] = v; [x, z] = [Math.cos(ry) * x + Math.sin(ry) * z, -Math.sin(ry) * x + Math.cos(ry) * z]; [y, z] = [Math.cos(rx) * y - Math.sin(rx) * z, Math.sin(rx) * y + Math.cos(rx) * z]; return [cx + x * R, cy - y * R, z]; };
    // каркасный куб вокруг осей
    const V = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => pr([x * 0.6, y * 0.6, z * 0.6]))));
    g.strokeStyle = 'rgba(245,239,223,.3)'; g.lineWidth = 1;
    [[0, 1], [0, 2], [0, 4], [3, 1], [3, 2], [3, 7], [5, 1], [5, 4], [5, 7], [6, 2], [6, 4], [6, 7]].forEach(([i, j]) => { g.beginPath(); g.moveTo(V[i][0], V[i][1]); g.lineTo(V[j][0], V[j][1]); g.stroke(); });
    [[[1, 0, 0], C.terra, 'X'], [[0, 1, 0], C.gold, 'Y'], [[0, 0, 1], C.sky, 'Z']].forEach(([v, col, l]) => {
      const p = pr(v); g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(p[0], p[1]); g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(p[0], p[1], 4, 0, 7); g.fill(); g.font = font(10); g.fillText(l, p[0] + 7, p[1] - 6);
    });
    g.font = font(10); g.fillStyle = C.cream; g.textAlign = 'left'; g.fillText('ТОР-УЗЕЛ (3,2)', 18, h * 0.84);
    g.fillStyle = C.mute; g.fillText(N.toLocaleString('ru-RU') + ' частиц · WebGL', 18, h * 0.84 + 16);
    return '3D · камера ведётся курсором';
  }
  // полутон: сетка точек, радиус — интерференция двух волн; источник ведёт курсор
  function tHalftone(g, w, h, lu, t) {
    const s = mob ? 9 : 11, cur = REEL.cursor || { x: 0, y: 0 };
    const s1 = [w * (0.3 + cur.x * 0.4), h * 0.3], s2 = [w * 0.72, h * (0.7 + cur.y * 0.4)];
    for (let y = s / 2; y < h; y += s) for (let x = s / 2; x < w; x += s) {
      const d1 = Math.hypot(x - s1[0], y - s1[1]), d2 = Math.hypot(x - s2[0], y - s2[1]);
      const v = (Math.sin(d1 * 0.09 - t * 6) + Math.sin(d2 * 0.07 - t * 4.4)) / 2, r = (s / 2) * (0.15 + 0.85 * (v * 0.5 + 0.5));
      g.fillStyle = v > 0.55 ? C.gold : v < -0.55 ? C.terra : C.cream; g.globalAlpha = 0.35 + 0.65 * (v * 0.5 + 0.5);
      g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
    return 'полутон · интерференция волн';
  }
  function tOutput(g, w, h, lu) {
    const cx = w / 2, cy = h * 0.4, R = Math.min(w, h) * 0.3;
    [[C.terra, 1, 0.99], [C.gold, 0.78, 0.86], [C.sky, 0.56, 0.72]].forEach(([col, k, to], i) => {
      const p = e4(lu / 1.4 - i * 0.08) * to;
      g.strokeStyle = 'rgba(245,239,223,.1)'; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, R * k, 0, 7); g.stroke();
      g.strokeStyle = col; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, R * k, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); g.stroke(); g.lineCap = 'butt';
    });
    const v = Math.round(e4(lu / 1.4) * 99);
    g.fillStyle = C.cream; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = font(Math.min(w * 0.14, 40), 900); g.fillText(v + '%', cx, cy - 4);
    g.font = font(8); g.fillStyle = C.mute; g.fillText('РЕНДЕР', cx, cy + R * 0.22);
    const kf = Math.round(e4(lu / 1.6) * 12248);
    g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = font(Math.min(w * 0.09, 26), 900); g.fillStyle = C.cream; g.fillText(kf.toLocaleString('ru-RU'), 18, h * 0.86);
    g.font = font(9); g.fillStyle = C.gold; g.fillText('КЛЮЧЕВЫХ КАДРОВ · 0 ЛИНЕЙНЫХ', 18, h * 0.86 + 16);
    return 'выход · ролик собран кодом';
  }

  /* ── переходы между демо: у каждого угла свой ── */
  const WIPES = {
    iris: (g, w, h, q) => { g.arc(w / 2, h / 2, q * Math.hypot(w, h) * 0.55, 0, 7); },
    blinds: (g, w, h, q) => { const n = 7, bh = h / n; for (let i = 0; i < n; i++) g.rect(0, i * bh, w, bh * cl(q * 1.4 - i * 0.06)); },
    pixels: (g, w, h, q) => { const cx = 8, cy = 10, cw = w / cx, ch = h / cy; for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) { const r = Math.abs(Math.sin(i * 12.99 + j * 78.23) * 43758.5) % 1; if (r < q) g.rect(i * cw, j * ch, cw + 0.5, ch + 0.5); } },
    diag: (g, w, h, q) => { const x = q * (w + h); g.moveTo(0, 0); g.lineTo(x, 0); g.lineTo(x - h, h); g.lineTo(0, h); g.closePath(); }
  };
  const LISTS = [
    { wipe: 'iris', d: [tTiming, tMorph, tType] },
    { wipe: 'blinds', d: [tCurve, tPendulum, tRhythm] },
    { wipe: 'pixels', d: [tLiquid, tLissajous, tGeometry] },
    { wipe: 'diag', d: [tGizmo, tHalftone, tOutput] }
  ];
  const LOOPED = new Set([tTiming, tOutput]);   // короткие демо повторяются внутри своего окна
  const TR = 0.32, last = ['', '', '', ''];
  function drawSeq(p, side, list, wipe, u, t, seg, sp = 1) {
    const i = cl(Math.floor(u / seg), 0, list.length - 1), raw = u - i * seg, g = p.g;
    const lu = (fn, r) => (LOOPED.has(fn) ? (r * sp) % 2 : r * sp);
    g.clearRect(0, 0, p.w, p.h);
    let cap;
    if (i > 0 && raw < TR) {
      list[i - 1](g, p.w, p.h, lu(list[i - 1], seg + raw), t);
      g.save(); g.beginPath(); WIPES[wipe](g, p.w, p.h, e4(raw / TR)); g.clip(); g.clearRect(0, 0, p.w, p.h);
      cap = list[i](g, p.w, p.h, lu(list[i], raw), t); g.restore();
    } else cap = list[i](g, p.w, p.h, lu(list[i], raw), t);
    if (last[side] !== cap) { last[side] = cap; p.ft.textContent = cap; }
  }
  // телефон: одна большая панель, восемь демо подряд, переходы по кругу
  const ONE = [tTiming, tMorph, tCurve, tLissajous, tLiquid, tGizmo, tHalftone, tGeometry];
  const ONE_W = ['iris', 'blinds', 'pixels', 'diag'];

  /* ───────── центр: слово МОУШЕН и знак показывают приёмы ───────── */
  const fx = REEL.fx, wordEl = document.querySelector('.word[data-w="motion"]'), WL = [...wordEl.querySelectorAll('b')], nL = WL.length, mid = (nL - 1) / 2;
  const mk = REEL.mk, markEl = document.querySelector('.mark');
  const COLS = ['#C26B4A', '#C4985A', '#A8C5D9', '#C9B6E4', '#E8A9B8', '#F5EFDF'];
  const CREAM = '#F5EFDF';
  // окна приёмов (доли сцены u)
  const E = { wave: [0.95, 1.95], stretch: [1.95, 2.85], burst: [2.85, 4.42], pixel: [4.42, 5.3], glitch: [5.3, 6.02], flip: [6.05, 7.0], breath: [7.0, 7.5] };
  const inW = (u, w) => u >= w[0] && u < w[1];
  let dirtyL = false, fxOn = false, markDirty = false, lastColor = '';
  const setL = (i, tx, ty, sx, sy) => { const s = WL[i].style; s.translate = `${tx.toFixed(1)}px ${ty.toFixed(1)}px`; s.scale = `${sx.toFixed(3)} ${sy.toFixed(3)}`; };
  const resetL = () => { WL.forEach((l) => { l.style.translate = ''; l.style.scale = ''; l.style.filter = ''; l.style.removeProperty('--wc'); }); dirtyL = false; };
  const hash = (x) => Math.abs(Math.sin(x * 127.1 + 311.7) * 43758.5453) % 1;

  function center(u, t) {
    const fs = parseFloat(getComputedStyle(wordEl).fontSize) || 100;
    const active = u > 0.9 && u < 7.55;
    if (!active) {
      if (dirtyL) resetL();
      if (fxOn) { wordEl.classList.remove('fxh'); markEl.classList.remove('fxh'); fxOn = false; }
      if (markDirty) { markEl.style.scale = ''; markEl.style.filter = ''; markDirty = false; }
      return;
    }
    dirtyL = true;
    let hideWord = false, hideMark = false;
    for (let i = 0; i < nL; i++) { WL[i].style.filter = ''; }
    if (inW(u, E.wave)) {
      const p = (u - E.wave[0]) / 1, env = Math.pow(Math.sin(Math.PI * p), 0.6);
      for (let i = 0; i < nL; i++) { const ph = 2 * Math.PI * p * 1.6 - i * 0.75; setL(i, 0, -Math.sin(ph) * fs * 0.13 * env, 1, 1 + Math.cos(ph) * 0.1 * env); }
    } else if (inW(u, E.stretch)) {
      // резина: слово растягивается в стороны, отпускается и дрожит
      const x = u - E.stretch[0], e = x < 0.28 ? 1 - Math.pow(1 - x / 0.28, 3) : Math.exp(-6 * (x - 0.28)) * Math.cos(16 * (x - 0.28));
      for (let i = 0; i < nL; i++) setL(i, (i - mid) * fs * 0.2 * e, 0, 1 + 0.4 * Math.max(-0.4, e), 1 - 0.26 * e);
    } else if (inW(u, E.burst)) {
      for (let i = 0; i < nL; i++) setL(i, 0, 0, 1, 1);
      const ws = fx.word('motion', CREAM), ms = fx.mark(CREAM);
      const o = { t0: E.burst[0], t1: E.burst[0] + 0.65, R: Math.min(W, H) * 0.42, cx: ws.cx, cy: ws.cy };
      const sa = fx.scatter(ws, u, o);
      if (ms) { const t1m = o.t1 + 0.06; fx.scatter(ms, u, { ...o, t0: o.t0 + 0.04, t1: t1m, spin: -1.3 }); fx.solid(ms, cl((u - t1m - 0.62) / 0.15)); }
      fx.solid(ws, sa);
      hideWord = true; hideMark = !!ms;
    } else if (inW(u, E.pixel)) {
      for (let i = 0; i < nL; i++) setL(i, 0, 0, 1, 1);
      const ws = fx.word('motion', CREAM), p = (u - E.pixel[0]) / (E.pixel[1] - E.pixel[0]), env = Math.pow(Math.sin(Math.PI * p), 1.1);
      // блок — от кегля, чтобы на телефоне слово читалось и на пике; цвет приходит только на крупных блоках
      const steps = [0, 4, 8, 14, 22, 30, 22, 14, 8, 4, 0];
      const block = Math.max(1, steps[Math.min(steps.length - 1, Math.floor(p * steps.length))] / 30 * fs * 0.17 * (0.6 + 0.4 * env));
      fx.pixel(ws, block, env * cl((block - 3) / 6), t);
      hideWord = true;
    } else if (inW(u, E.glitch)) {
      const fr = Math.floor(u * 24), amp = 0.35 + 0.65 * Math.exp(-((u * 2) % 1) * 5), d = fs * 0.035 * amp;
      for (let i = 0; i < nL; i++) {
        const r = hash(fr * 7 + i), jx = r > 0.6 ? (hash(fr + i * 3) - 0.5) * fs * 0.16 * amp : 0, jy = r > 0.85 ? (hash(fr * 3 + i) - 0.5) * fs * 0.08 : 0;
        setL(i, jx, jy, 1 + (r > 0.9 ? 0.15 : 0), 1);
        WL[i].style.filter = `drop-shadow(${-d}px 0 rgba(194,107,74,.95)) drop-shadow(${d}px 0 rgba(168,197,217,.9))`;
      }
      markDirty = true; markEl.style.filter = `drop-shadow(${-d * 0.4}px 0 #C26B4A) drop-shadow(${d * 0.4}px 0 #A8C5D9)`;
    } else if (inW(u, E.flip)) {
      // буквы переворачиваются по одной (ось X), обратная сторона — своего цвета, и обратно
      for (let i = 0; i < nL; i++) {
        const k1 = e4((u - E.flip[0] - i * 0.06) / 0.32), k2 = e4((u - E.flip[0] - 0.5 - i * 0.06) / 0.32), th = Math.PI * (k1 - k2);
        setL(i, 0, 0, 1 + 0.08 * Math.sin(th), Math.cos(th));
        if (th > Math.PI / 2) WL[i].style.setProperty('--wc', COLS[i % COLS.length]); else WL[i].style.removeProperty('--wc');
      }
    } else if (inW(u, E.breath)) {
      const p = (u - E.breath[0]) / 0.5, e = Math.sin(Math.PI * p);
      for (let i = 0; i < nL; i++) { WL[i].style.removeProperty('--wc'); setL(i, (i - mid) * fs * 0.07 * e, 0, 1, 1); }
    } else for (let i = 0; i < nL; i++) setL(i, 0, 0, 1, 1);
    if (!inW(u, E.glitch) && markDirty) { markEl.style.filter = ''; }
    // пульс знака после сборки: два удара сердца и круги
    const pz = E.burst[1] + 0.02;
    if (u >= pz && u < pz + 1.1) {
      const beat = (x) => (x > 0 ? Math.exp(-x * 9) * Math.sin(Math.min(Math.PI, x * 18)) : 0);
      const k = beat(u - pz) + 0.8 * beat(u - pz - 0.25);
      markEl.style.scale = (1 + 0.32 * k).toFixed(3); markDirty = true;
      const p = fx.place(markEl), cx = p.x + p.w / 2, cy = p.y + p.h / 2;
      [0, 0.25, 0.5].forEach((d0, j) => { const x = u - pz - d0; if (x > 0 && x < 0.8) fx.ring(cx, cy, p.h * (0.35 + x * 1.8), (1 - x / 0.8) * 0.8, j % 2 ? '#C4985A' : '#F5EFDF', 2 - j * 0.4); });
    } else if (markDirty && !inW(u, E.glitch)) { markEl.style.scale = ''; }
    if (hideWord !== wordEl.classList.contains('fxh')) wordEl.classList.toggle('fxh', hideWord);
    if (hideMark !== markEl.classList.contains('fxh')) markEl.classList.toggle('fxh', hideMark);
    fxOn = hideWord || hideMark;
  }

  let sized = false;
  REEL.onRender((t) => {
    const u = t - a;
    if (u < -0.2 || u > DUR + 0.2) { if (gl) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); } center(-1, t); return; }
    if (!sized) { sizePans(); sized = true; }
    drawGL(u, t);
    const uu = cl(u, 0, DUR - 0.01);
    if (mob) { const p = pans[0], i = cl(Math.floor(uu), 0, 7); drawSeq(p, 0, ONE, ONE_W[i % 4], uu, t, 1, 2); }
    else pans.forEach((p, k) => drawSeq(p, k, LISTS[k].d, LISTS[k].wipe, uu, t, DUR / 3));
    center(u, t);
  });
});
