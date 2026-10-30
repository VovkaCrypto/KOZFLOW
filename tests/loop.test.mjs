// node --test tests/loop.test.mjs — общий цикл кадров js/loop.js на фейковых rAF / IntersectionObserver / document
import test from 'node:test';
import assert from 'node:assert/strict';
import '../js/loop.js';

function rig({ coarse = false, dpr = 1 } = {}) {
  let q = null, now = 0;
  const ios = [];
  const doc = { hidden: false, ls: {}, addEventListener(t, f) { (this.ls[t] ||= []).push(f); }, fire(t) { (this.ls[t] || []).forEach((f) => f()); } };
  class IO {
    constructor(cb, o) { this.cb = cb; this.o = o; this.els = []; ios.push(this); }
    observe(el) { this.els.push(el); }
    unobserve(el) { this.els = this.els.filter((e) => e !== el); }
    see(el, v) { this.cb([{ target: el, isIntersecting: v }]); }
  }
  const env = {
    raf: (f) => { q = f; return 1; },
    caf: () => { q = null; },
    IO,
    doc,
    mm: (s) => ({ matches: coarse && /coarse/.test(s) }),
    dpr: () => dpr,
  };
  const L = globalThis.createLoop(env);
  return {
    L, doc,
    get queued() { return !!q; },
    see(el, v) { ios.forEach((io) => io.els.includes(el) && io.see(el, v)); },
    frames(n, step = 16) { for (let i = 0; i < n && q; i++) { const f = q; q = null; now += step; f(now); } },
  };
}

test('runs only while visible', () => {
  const r = rig(); const el = {}; const calls = [];
  r.L.add(el, (t, dt) => calls.push(dt));
  r.frames(5);
  assert.equal(calls.length, 0);
  assert.equal(r.queued, false);
  r.see(el, true);
  assert.equal(r.queued, true);
  r.frames(3);
  assert.equal(calls.length, 3);
  assert.ok(calls.every((d) => d > 0));
});

test('a throwing callback stops neither the others nor the loop', () => {
  const r = rig(); const el = {}; const calls = [];
  const err = console.error; console.error = () => {};
  r.L.add(el, () => { throw new Error('секция сломалась'); });
  r.L.add(el, () => calls.push(1));
  r.see(el, true);
  r.frames(3);
  console.error = err;
  assert.equal(calls.length, 3);
  assert.equal(r.queued, true);
});

test('stops when all hidden', () => {
  const r = rig(); const a = {}, b = {};
  r.L.add(a, () => {}); r.L.add(b, () => {});
  r.see(a, true); r.see(b, true); r.frames(2);
  r.see(a, false); r.see(b, false); r.frames(2);
  assert.equal(r.queued, false);
});

test('pauses on hidden tab and resumes', () => {
  const r = rig(); const el = {}; const calls = [];
  r.L.add(el, (t, dt) => calls.push(dt));
  r.see(el, true); r.frames(2);
  r.doc.hidden = true; r.doc.fire('visibilitychange');
  r.frames(5);
  assert.equal(calls.length, 2);
  assert.equal(r.queued, false);
  r.doc.hidden = false; r.doc.fire('visibilitychange');
  r.frames(1, 5000);
  assert.equal(calls.length, 3);
  assert.ok(calls[2] <= 50, `первый dt после возврата ${calls[2]}`);
});

test('remove', () => {
  const r = rig(); const el = {}; let n = 0;
  const h = r.L.add(el, () => n++);
  r.see(el, true); r.frames(2);
  r.L.remove(h); r.frames(3);
  assert.equal(n, 2);
  assert.equal(r.queued, false);
});

test('dpr caps', () => {
  assert.equal(rig({ coarse: true, dpr: 3 }).L.dpr(), 1.5);
  assert.equal(rig({ coarse: false, dpr: 3 }).L.dpr(), 2);
  assert.equal(rig({ coarse: true, dpr: 1 }).L.dpr(), 1);
  assert.equal(rig({ coarse: true }).L.coarse, true);
});

test('gateCss marks elements off-screen', () => {
  const r = rig();
  const cls = new Set();
  const el = { classList: { toggle: (c, on) => (on ? cls.add(c) : cls.delete(c)) } };
  r.doc.querySelectorAll = () => [el];
  r.L.gateCss('#x');
  r.see(el, false);
  assert.ok(cls.has('is-off'));
  r.see(el, true);
  assert.ok(!cls.has('is-off'));
});
