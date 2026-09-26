/* Stand choreography: a distinct, canon-styled animation for every Stand move.
   Routing (no changes needed in battle-ui.js):
   - SBR.fx.play(look, from, tos, meta) asks lookup(): by meta.abId (party abilities) or, for enemies, by the move's name
     (read from the act banner battle-ui shows). A hit replaces the generic look.
   - SBR.strike.rush(opts) (close-range Stands) asks rush(): the ability id comes from the SBR.stands.keyFor(u, abId)
     call battle-ui makes right before rushing. Moves without their own choreography get a per-Stand barrage STYLE.
   Everything is drawn procedurally (canvas via SBR.fx.kit + DOM/SVG + css/standfx.css). A sprite sheet can replace a
   Stand's drawn body: SBR.standfx.sprites[key] (or [key + '.' + anim]) = { src, frames, fps, cols, loop }.
   Power: p = tier + level - 1 (0-5). Timings are divided by the game speed; reduced motion drops shakes/jolts/flicker. */
'use strict';
SBR.standfx = (() => {
  const F = SBR.fx, KIT = F.kit, K = '#1a1020', TAU = Math.PI * 2;
  const spd = () => SBR.settings.speed || 1;
  const calm = () => !!SBR.settings.reducedMotion;
  const wait = ms => new Promise(r => setTimeout(r, ms / spd()));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const snd = n => { try { SBR.audio.play(n); } catch (e) { /* no audio */ } };
  const shake = big => { try { if (!calm()) SBR.ui.shake(undefined, big); } catch (e) { /* no ui */ } };
  const L = () => document.getElementById('fx-layer');
  const rel = p => { const r = L().getBoundingClientRect(); return { x: p.x - r.left, y: p.y - r.top }; };
  const mid = ps => ({ x: ps.reduce((s, t) => s + t.x, 0) / ps.length, y: ps.reduce((s, t) => s + t.y, 0) / ps.length });
  const ease = k => 1 - Math.pow(1 - k, 3);
  const fade = (k, a = 0.7) => (k < a ? 1 : Math.max(0, 1 - (k - a) / (1 - a)));
  const side = (a, b) => (b.x >= a.x ? 1 : -1);

  /* ================= DOM helpers ================= */
  function dom(cls, html, p, ms, style) {
    const lay = L(); if (!lay) return null;
    const d = document.createElement('div');
    d.className = cls; d.innerHTML = html || '';
    if (p) { const q = rel(p); d.style.left = q.x + 'px'; d.style.top = q.y + 'px'; }
    if (style) for (const k in style) { if (k.startsWith('--')) d.style.setProperty(k, style[k]); else d.style[k] = style[k]; }
    if (ms) { d.style.setProperty('--d', Math.round(ms / spd()) + 'ms'); setTimeout(() => d.remove(), ms / spd() + 40); } else setTimeout(() => d.remove(), 8000); // safety net
    lay.appendChild(d);
    return d;
  }
  const screen = (cls, ms, html, style) => dom('sfx-screen ' + cls, html, null, ms, style);
  /** manga sound effect lettering */
  const say = (txt, p, o = {}) => dom('sfx-say' + (o.cls ? ' ' + o.cls : ''), txt, p, o.ms || 800, { '--c': o.c || '#fff', '--rot': (o.rot != null ? o.rot : rnd(-12, 6)) + 'deg', fontSize: (o.size || 40) + 'px' });
  /** a move title slammed across the upper screen (capstones) */
  const title = (jp, en, c = '#fff', ms = 1100) => dom('sfx-title', `<b>${jp}</b>${en ? `<i>${en}</i>` : ''}`, { x: innerWidth / 2, y: innerHeight * 0.28 }, ms, { '--c': c });
  const focus = (p, c = '#fff', n = 36, life = 0.5) => KIT.radialLines(p.x, p.y, c, n, 0, 0.6, life);

  /* ---- Stand bodies (SVG from SBR.stands, or a sprite sheet when one is registered) ---- */
  const sprites = {};
  const spriteFor = (key, anim) => sprites[key + '.' + (anim || 'idle')] || sprites[key] || null;
  function playSprite(el, s) {
    const cols = s.cols || s.frames, rows = Math.ceil(s.frames / cols);
    el.classList.add('sprite');
    el.style.backgroundImage = `url("${s.src}")`;
    el.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
    let i = 0;
    const step = () => {
      if (!el.isConnected) return;
      const c = i % cols, r = Math.floor(i / cols);
      el.style.backgroundPosition = `${cols > 1 ? (c / (cols - 1)) * 100 : 0}% ${rows > 1 ? (r / (rows - 1)) * 100 : 0}%`;
      i++;
      if (i >= s.frames) { if (s.loop === false) return; i = 0; }
      setTimeout(step, 1000 / (s.fps || 12) / spd());
    };
    step();
  }
  /** fetch a manifest { key: {src, frames, fps, cols, loop}, ... } and register it */
  async function loadSprites(url) {
    try { const r = await fetch(url); if (!r.ok) return false; const m = await r.json(); const base = url.replace(/[^/]*$/, ''); for (const k in m) sprites[k] = Object.assign({}, m[k], { src: /^(https?:|data:|\/)/.test(m[k].src) ? m[k].src : base + m[k].src }); return true; } catch (e) { return false; }
  }
  function standAt(key, p, o = {}) {
    if (!SBR.stands || !SBR.stands.DEFS[key]) return null;
    const sp = spriteFor(key, o.anim);
    const d = dom('sfx-stand' + (o.cls ? ' ' + o.cls : '') + (o.enemy ? ' enemy' : ''), sp ? '' : SBR.stands.svg(key), p, o.ms || 0, { '--sc': o.color || '#fff', '--size': (o.size || 160) + 'px', '--flip': o.flip ? -1 : 1 });
    if (d && sp) playSprite(d, sp);
    if (d) requestAnimationFrame(() => d.classList.add('go'));
    return d;
  }
  function moveEl(d, p, ms, extra) { if (!d) return; const q = rel(p); d.style.transition = ms ? `left ${ms / spd()}ms cubic-bezier(.5,0,.3,1), top ${ms / spd()}ms cubic-bezier(.5,0,.3,1), opacity .15s` : 'none'; d.style.left = q.x + 'px'; d.style.top = q.y + 'px'; if (extra != null) d.style.setProperty('--flip', extra); }
  const gone = (d, ms = 240) => { if (!d) return; d.classList.add('out'); setTimeout(() => d.remove(), ms / spd()); };
  const fistEl = (p, color, rot = 0, cls = '') => dom('sfx-fist ' + cls, SBR.strike.fist(color), p, 0, { '--r': rot + 'deg' });

  /* ---- move the unit card itself (Web Animations, additive so the card's own classes keep working) ---- */
  function cardAt(p) { try { for (const e of document.elementsFromPoint(p.x, p.y)) { const c = e.closest && e.closest('.unit-card'); if (c) return c; } } catch (e) { /* ignore */ } return null; }
  function jolt(p, frames, ms, easing = 'cubic-bezier(.3,1.3,.5,1)') { if (calm()) return; const c = cardAt(p); if (!c || !c.animate) return; try { c.animate(frames, { duration: ms / spd(), easing, composite: 'add' }); } catch (e) { /* old browser */ } }
  const knock = (p, dir, d = 28) => jolt(p, [{ transform: 'translate(0,0)' }, { transform: `translate(${dir * d}px,-8px) rotate(${dir * 5}deg)`, offset: 0.2 }, { transform: 'translate(0,0)' }], 460);
  const pull = (p, toward, frac = 0.45) => jolt(p, [{ transform: 'translate(0,0)' }, { transform: `translate(${(toward.x - p.x) * frac}px,${(toward.y - p.y) * frac * 0.5}px) scale(.94)`, offset: 0.35 }, { transform: 'translate(0,0)' }], 620, 'cubic-bezier(.2,.9,.3,1)');
  const sink = (p, d = 60) => jolt(p, [{ transform: 'translate(0,0)', opacity: 0 }, { transform: `translate(0,${d}px) scaleY(.4)`, opacity: -0.9, offset: 0.45 }, { transform: `translate(0,${d}px) scaleY(.4)`, opacity: -0.9, offset: 0.6 }, { transform: 'translate(0,0)', opacity: 0 }], 800, 'ease-in-out');

  /* ================= canvas helpers ================= */
  const C = () => KIT.ctx;
  const draw = (life, fn, o) => KIT.add(Object.assign({ x: 0, y: 0, life, update() {}, draw: (p, k) => fn(C(), k, p) }, o || {}));
  /** a projectile that resolves when it lands */
  const fly = (a, b, life, fn, o = {}) => new Promise(res => KIT.add({
    x: a.x, y: a.y, life, done: res, rot: 0,
    update(p, dt, k) { const e = o.linear ? k : ease(k); p.px = p.x; p.py = p.y; p.x = a.x + (b.x - a.x) * e + (o.cx || 0) * Math.sin(Math.PI * e); p.y = a.y + (b.y - a.y) * e + (o.arc || 0) * Math.sin(Math.PI * e); p.rot += dt * (o.spin || 0); if (o.trail) o.trail(p, k); },
    draw: (p, k) => fn(C(), k, p),
  }));
  function ink(c, path, col, w, core) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = K; c.lineWidth = w + 4; c.beginPath(); path(c); c.stroke();
    c.strokeStyle = col; c.lineWidth = w; c.beginPath(); path(c); c.stroke();
    if (core) { c.strokeStyle = core; c.lineWidth = Math.max(1, w * 0.35); c.beginPath(); path(c); c.stroke(); }
  }
  const dot = (x, y, r, col, life = 0.5, o = {}) => KIT.add(Object.assign({ x, y, vx: 0, vy: 0, r, c: col, life, draw: KIT.D.dot, shrink: true }, o));

  /* shapes (drawn around 0,0) */
  function ankh(c, s, col = '#ff8a2a') { ink(c, c => { c.ellipse(0, -s * 0.8, s * 0.4, s * 0.55, 0, 0, TAU); c.moveTo(-s * 0.95, 0); c.lineTo(s * 0.95, 0); c.moveTo(0, -s * 0.25); c.lineTo(0, s * 1.5); }, col, s * 0.32, '#fff3a0'); }
  function ladybug(c, r) {
    c.fillStyle = '#d8323c'; c.strokeStyle = K; c.lineWidth = 1.6;
    c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(0, -r); c.lineTo(0, r); c.stroke();
    c.fillStyle = K; c.beginPath(); c.arc(0, -r * 0.95, r * 0.45, 0, TAU); c.fill();
    [[-0.45, -0.1], [0.45, -0.1], [-0.4, 0.45], [0.4, 0.45]].forEach(([x, y]) => { c.beginPath(); c.arc(x * r, y * r, r * 0.18, 0, TAU); c.fill(); });
  }
  function knife(c, s) {
    c.fillStyle = '#eef0f8'; c.strokeStyle = K; c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(s * 1.6, 0); c.lineTo(-s * 0.2, -s * 0.26); c.lineTo(-s * 0.2, s * 0.26); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#6a4a2a'; c.fillRect(-s * 0.9, -s * 0.16, s * 0.7, s * 0.32); c.strokeRect(-s * 0.9, -s * 0.16, s * 0.7, s * 0.32);
    c.fillStyle = '#c8a040'; c.fillRect(-s * 0.28, -s * 0.42, s * 0.12, s * 0.84); c.strokeRect(-s * 0.28, -s * 0.42, s * 0.12, s * 0.84);
  }
  function nailShape(c, s, col = '#f6dcc8', swirl = '#b070ff') {
    c.fillStyle = col; c.strokeStyle = K; c.lineWidth = 1.6;
    c.beginPath(); c.ellipse(0, 0, s, s * 0.62, 0, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(s * 0.8, s * 0.2); c.quadraticCurveTo(0, s * 0.45, -s * 0.8, s * 0.2); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = swirl; c.lineWidth = 2; c.setLineDash([5, 4]); c.beginPath(); c.arc(0, 0, s * 1.55, 0, TAU); c.stroke(); c.setLineDash([]);
  }
  function heart(c, s, col) { c.fillStyle = col; c.strokeStyle = K; c.lineWidth = 2; c.beginPath(); c.moveTo(0, s * 0.35); c.bezierCurveTo(-s * 1.2, -s * 0.4, -s * 0.45, -s * 1.2, 0, -s * 0.45); c.bezierCurveTo(s * 0.45, -s * 1.2, s * 1.2, -s * 0.4, 0, s * 0.35); c.fill(); c.stroke(); }
  function clover(c, s) { c.fillStyle = '#5ac05a'; c.strokeStyle = K; c.lineWidth = 1.4; for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); c.translate(0, -s * 0.55); heart(c, s * 0.5, '#5ac05a'); c.restore(); } c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * 0.3, s * 0.8, s * 0.1, s * 1.2); c.stroke(); }
  function hookShape(c, s) { ink(c, c => { c.moveTo(0, -s); c.lineTo(0, s * 0.5); c.arc(-s * 0.4, s * 0.5, s * 0.4, 0, Math.PI * 0.9); }, '#b8b8c8', 3); }
  function ghostShape(c, s, col) {
    c.fillStyle = col; c.strokeStyle = K; c.lineWidth = 1.6;
    c.beginPath(); c.arc(0, -s * 1.1, s * 0.42, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-s * 0.55, -s * 0.6); c.quadraticCurveTo(0, -s * 0.85, s * 0.55, -s * 0.6); c.lineTo(s * 0.7, s * 0.9); for (let i = 3; i >= 0; i--) c.lineTo(-s * 0.7 + i * s * 0.47, s * (i % 2 ? 0.7 : 1)); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(-s * 0.15, -s * 1.12, s * 0.07, 0, TAU); c.arc(s * 0.15, -s * 1.12, s * 0.07, 0, TAU); c.fill();
  }

  /* composite canvas effects */
  function cracks(t, n = 7, r = 64, col = '#fff', life = 0.6) {
    const rays = [...Array(n)].map(() => { const a = rnd(0, TAU); const pts = [[0, 0]]; let d = 0; while (d < r) { d += rnd(8, 16); const aa = a + rnd(-0.35, 0.35); pts.push([Math.cos(aa) * d, Math.sin(aa) * d]); } return pts; });
    draw(life, (c, k) => { c.globalAlpha = fade(k, 0.55); c.translate(t.x, t.y); const pr = Math.min(1, k * 3); rays.forEach(pts => ink(c, c => { c.moveTo(0, 0); const m = Math.max(2, Math.ceil(pts.length * pr)); for (let i = 1; i < m; i++) c.lineTo(pts[i][0], pts[i][1]); }, col, 2)); });
  }
  function converge(t, n, col, r0 = 110, life = 0.45, shape = 'square') {
    for (let i = 0; i < n; i++) { const a = rnd(0, TAU), d = rnd(r0 * 0.6, r0), sx = t.x + Math.cos(a) * d, sy = t.y + Math.sin(a) * d; KIT.add({ x: sx, y: sy, r: rnd(3, 6), c: Array.isArray(col) ? col[i % col.length] : col, rot: rnd(0, TAU), life, draw: shape === 'shard' ? KIT.D.shard : KIT.D.square, update: (p, dt, k) => { const e = k * k; p.x = sx + (t.x - sx) * e; p.y = sy + (t.y - sy) * e; p.rot += dt * 8; } }); }
  }
  function gouge(a, b, w, life = 0.65, rim = '#8ab0ff') {
    const ang = Math.atan2(b.y - a.y, b.x - a.x), len0 = Math.hypot(b.x - a.x, b.y - a.y);
    const specks = [...Array(Math.ceil(len0 / 14))].map(() => [rnd(0, 1), rnd(-0.45, 0.45)]);
    draw(life, (c, k) => {
      const open = Math.min(1, k * 5), close = k < 0.5 ? 1 : Math.max(0, 1 - (k - 0.5) / 0.22), ww = w * close, len = len0 * open;
      c.translate(a.x, a.y); c.rotate(ang);
      if (ww > 0.6) {
        c.fillStyle = K; c.fillRect(0, -ww / 2 - 4, len, ww + 8);
        c.fillStyle = '#05030a'; c.fillRect(0, -ww / 2, len, ww);
        c.fillStyle = 'rgba(200,215,255,.85)'; specks.forEach(([u, v]) => { if (u * len0 < len) c.fillRect(u * len0, v * ww, 2, 2); });
        c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -ww / 2); c.lineTo(len, -ww / 2); c.moveTo(0, ww / 2); c.lineTo(len, ww / 2); c.stroke();
        c.strokeStyle = rim; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -ww / 2 + 3); c.lineTo(len, -ww / 2 + 3); c.moveTo(0, ww / 2 - 3); c.lineTo(len, ww / 2 - 3); c.stroke();
      } else if (k < 0.92) { c.globalAlpha = 1 - (k - 0.72) / 0.2; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(len0, 0); c.stroke(); }
    });
  }
  function zipper(t, ang, len, col = '#dfe6f4', life = 0.9) { KIT.add({ x: t.x, y: t.y, ang, len, c: col, life, draw: KIT.D.zipper, update() {} }); }
  function vine(x, y, h, dirx = 1, col = '#4aa04a', life = 1) {
    const pts = []; let px = x, py = y, a = -Math.PI / 2 + dirx * 0.35;
    for (let i = 0; i < 16; i++) { pts.push([px, py]); a += Math.sin(i * 0.9 + dirx) * 0.32 * dirx; px += Math.cos(a) * h / 16; py += Math.sin(a) * h / 16; }
    draw(life, (c, k) => {
      const n = Math.max(2, Math.ceil(pts.length * Math.min(1, k * 2.2))); c.globalAlpha = fade(k, 0.7);
      ink(c, c => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n; i++) c.lineTo(pts[i][0], pts[i][1]); }, col, 4);
      for (let i = 3; i < n; i += 3) { c.save(); c.translate(pts[i][0], pts[i][1]); c.rotate((i % 2 ? 1 : -1) * 0.9 - Math.PI / 2); c.fillStyle = '#7ad86a'; c.strokeStyle = K; c.lineWidth = 1.4; c.beginPath(); c.ellipse(8, 0, 8, 3.8, 0, 0, TAU); c.fill(); c.stroke(); c.restore(); }
      if (k > 0.42) { const [fx, fy] = pts[n - 1], s = 7 * Math.min(1, (k - 0.42) * 5); c.translate(fx, fy); for (let i = 0; i < 5; i++) { c.save(); c.rotate(i * TAU / 5); c.fillStyle = '#f6a8d0'; c.strokeStyle = K; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, -s, s * 0.55, s, 0, 0, TAU); c.fill(); c.stroke(); c.restore(); } c.fillStyle = '#f2c14e'; c.beginPath(); c.arc(0, 0, s * 0.45, 0, TAU); c.fill(); c.stroke(); }
    });
  }
  function ladybugs(t, n = 4) { for (let i = 0; i < n; i++) { const a = rnd(-Math.PI * 0.9, -Math.PI * 0.1), v = rnd(90, 190); KIT.add({ x: t.x + rnd(-20, 20), y: t.y + rnd(-10, 20), vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: rnd(0, TAU), life: rnd(0.7, 1), drag: 0.97, draw: (p, k) => { const c = C(); c.globalAlpha = fade(k, 0.6); c.translate(p.x, p.y); c.rotate(p.rot + Math.sin(k * 30) * 0.2); ladybug(c, 7); } }); } }
  function flameAt(x, y, n = 6, r = 16) { F.flames(x, y, n, 10, -120, r); }
  /** gems, shards, nails etc. flying in a stream */
  function stream(a, b, n, gap, mkShot) { const all = []; for (let i = 0; i < n; i++) all.push(new Promise(r => setTimeout(() => mkShot(i).then(r), (i * gap) / spd()))); return Promise.all(all); }
  const burst = (t, col, r = 60, n = 12) => { F.starBurst(t.x, t.y, col, r, n, 0.3); F.ring(t.x, t.y, col, r + 10, 5, 0.4); F.sparks(t.x, t.y, '#fff', 10, 7); };

  /* ================= context & routing ================= */
  let lastAct = null, lastBanner = null;
  if (SBR.stands && SBR.stands.keyFor && !SBR.stands._sfxWrapped) {
    const kf = SBR.stands.keyFor;
    SBR.stands.keyFor = function (u, abId) { const k = kf.apply(this, arguments); if (arguments.length >= 2) lastAct = { u, abId, key: k, t: performance.now() }; return k; };
    SBR.stands._sfxWrapped = true;
  }
  try {
    new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('act-banner')) lastBanner = { name: n.textContent || '', enemy: n.classList.contains('enemy'), t: performance.now() }; })
      .observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) { /* no DOM */ }
  const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const bannerName = (maxAge = 4500) => (lastBanner && performance.now() - lastBanner.t < maxAge ? lastBanner.name : '');

  function ctxOf(from, tos, meta, via, def, extra) {
    const tier = Math.max(0, Math.min(3, meta.tier | 0)), lvl = meta.lvl || 1;
    return Object.assign({ from, to: tos && tos.length ? tos : [from], t0: (tos && tos[0]) || from, tier, lvl, power: Math.min(5, tier + lvl - 1), color: (def && def.color) || meta.color || meta.dcol || '#fff', enemy: !!meta.enemy, self: !!meta.self, meta, via, key: def && def.key }, extra || {});
  }
  function lookup(kind, meta) {
    let def = meta.abId ? MOVES[meta.abId] : null;
    if (!def && (meta.enemy || !meta.abId)) { const n = meta.name || bannerName(); if (n && (meta.name || !meta.enemy || !lastBanner || lastBanner.enemy)) def = NAMED[norm(n)]; }
    if (!def || !def.fn) return null;
    return { own: def.own !== false, kana: def.kana, fn: async (from, tos, m) => { try { await def.fn(ctxOf(from, tos, m, 'fx', def)); } catch (e) { console.warn('standfx', e); } } };
  }
  function rush(o) {
    const cur = lastAct && performance.now() - lastAct.t < 120 ? lastAct : null;
    const abId = o.abId || (cur && cur.abId);
    let def = abId ? MOVES[abId] : null;
    if (!def && o.enemy) def = NAMED[norm(o.name || bannerName())];
    const c = ctxOf(o.from, o.to, { tier: o.tier, lvl: o.lvl, color: o.color, enemy: o.enemy }, 'rush', def, { key: o.key, abId });
    if (def && def.color) c.color = def.color;
    const safe = p => Promise.resolve(p).catch(e => console.warn('standfx', e));
    if (def && def.fn) return safe(def.fn(c));
    const st = STYLE[o.key];
    if (st) { c.color = st.color || c.color; return safe(barrage(c, st.style ? st.style(c) : {})); }
    return null;
  }
  /** the shared close-range barrage (js/strike.js) with a Stand's own flavour */
  const barrage = (c, style) => SBR.strike.rush({ key: c.key, from: c.from, to: c.to, tier: c.tier, lvl: c.lvl, color: c.color, enemy: c.enemy, plain: true, style });
  const fans = c => Math.min(3, 1 + (c.power >> 1));
  async function cine(c, col = c.color) { if (c.tier >= 3) await KIT.cinematic(c.from, { enemy: c.enemy, dcol: col }); }

  /* ================= per-Stand barrage styles (default for every rush without its own move) ================= */
  const STYLE = {
    star_platinum: { color: '#9a7ae8', style: c => ({ cry: ['オラ', 'ORA'], fan: fans(c), onArrive: t => focus(t, '#fff', 30, 0.4), finish: async (t, p, dir) => { uppercut(t, '#9a7ae8', dir, 'オラァッ!'); } }) },
    crazy_diamond: { color: '#e89ac8', style: c => ({ cry: ['ドラ', 'DORA'], fan: fans(c), onHit: (t, i) => { if (i % 4 === 1) F.stars(t.x + rnd(-30, 30), t.y + rnd(-30, 30), '#8adcff', 2, 90); }, finish: async (t, p, dir) => { uppercut(t, '#e89ac8', dir, 'ドラァ!'); } }) },
    gold_experience: { color: '#f2c14e', style: c => ({ cry: ['無駄', 'MUDA'], fan: fans(c), finish: async (t, p, dir) => { uppercut(t, '#f2c14e', dir, '無駄ァ!'); ladybugs(t, 3); } }) },
    sticky_fingers: { color: '#dfe6f4', style: c => ({ cry: ['アリ', 'ARI'], fan: fans(c), onHit: (t, i) => { if (i % 3 === 2) zipper({ x: t.x + rnd(-30, 30), y: t.y + rnd(-30, 30) }, rnd(-1, 1), 60, '#c8ccd8', 0.6); }, finish: async (t, p, dir) => uppercut(t, '#5a8ad0', dir, 'アリーッ!') }) },
    king_crimson: { color: '#c8323c', style: c => ({ cry: ['ドン', 'DON'], blink: true, hits: p => 2 + p, finish: async (t, p, dir) => { pierce(t, dir, '#c8323c'); } }) },
    killer_queen: { color: '#e8a0c8', style: c => ({ cry: ['シバ', 'SHIBA'], hits: p => 3 + p, finish: async t => { await detonate(t, c.power); } }) },
    the_hand: { color: '#3a6ac8', style: c => ({ cry: ['オラ', 'ORA'], hits: p => 2 + p, finish: async (t, p, dir) => { gouge({ x: t.x - 90, y: t.y - 70 }, { x: t.x + 90, y: t.y + 70 }, 26 + p * 4); say('ガオン', { x: t.x, y: t.y - 60 }, { c: '#8ab0ff', size: 44 }); } }) },
    silver_chariot: { color: '#c8ccd8', style: c => ({ cry: ['ホラ', 'HORA'], fist: rapierSvg, fan: fans(c) + 1, onHit: (t, i, p, dir) => thrust(t, dir) }) },
    stone_free: { color: '#4a7ad0', style: c => ({ cry: ['オラ', 'ORA'], fan: fans(c), onArrive: t => threads(c.from, t, 3), finish: async (t, p, dir) => uppercut(t, '#4a7ad0', dir, 'オラァ!') }) },
    whitesnake: { color: '#d8d8e8', style: c => ({ cry: ['ズギュ', 'ZUGYU'], hits: p => 3 + p, finish: async t => { await popDisc(t, c.from); } }) },
    tusk4: { color: '#f2c14e', style: c => ({ cry: ['オラ', 'ORA'], fan: fans(c) + 1, fistColor: '#f6c8e0', finish: async (t, p, dir) => { uppercut(t, '#f2c14e', dir, 'ORAAA!'); F.spiral(t.x, t.y, '#ffd84a', 90, 6, 1.4, 4); } }) },
    d4c: { color: '#6a8ad8', style: c => ({ cry: ['ドジャ', 'DOJYAAN'], fan: fans(c), finish: async (t, p, dir) => { uppercut(t, '#6a8ad8', dir, 'ドジャアァーン'); } }) },
    lovetrain: { color: '#f6ecd8', style: c => ({ cry: ['ドジャ', 'DOJYAAN'], fan: fans(c), finish: async t => { lightRays(t, 0.8); } }) },
    theworld: { color: '#f2c14e', style: c => ({ cry: ['無駄', 'MUDA'], fan: fans(c), fistColor: '#f2d36a', finish: async (t, p, dir) => uppercut(t, '#f2c14e', dir, '無駄ァッ!') }) },
  };
  function uppercut(t, col, dir, word) {
    const f = fistEl({ x: t.x - dir * 30, y: t.y + 30 }, col, -dir * 40, 'upper');
    setTimeout(() => f && f.remove(), 520 / spd());
    F.starBurst(t.x, t.y - 10, '#fff', 90, 14, 0.35); F.ring(t.x, t.y, col, 120, 8, 0.45); F.speedLines(t.x, t.y, '#fff', 200, 26);
    say(word, { x: t.x - dir * 20, y: t.y - 80 }, { c: col, size: 50, cls: 'big' });
    knock(t, -dir, 34); shake(true);
  }
  function pierce(t, dir, col) {
    const a = { x: t.x + dir * 70, y: t.y }, b = { x: t.x - dir * 170, y: t.y - 10 };
    KIT.streak(a, b, col, 14, 0.35); KIT.streak(a, b, '#fff', 5, 0.3);
    F.ring(t.x, t.y, K, 34, 10, 0.4); F.blood(t.x - dir * 10, t.y, 16); F.starBurst(t.x, t.y, col, 70, 12, 0.3);
    say('ドン!', { x: t.x, y: t.y - 76 }, { c: col, size: 52, cls: 'big' }); knock(t, -dir, 30); shake(true);
  }
  const rapierSvg = () => `<svg viewBox="0 0 40 40"><path d="M-30 20L40 18L-30 22z" fill="#eef0f8" stroke="${K}" stroke-width="1.6"/><rect x="-36" y="15" width="7" height="10" rx="2" fill="#c8a040" stroke="${K}" stroke-width="1.6"/></svg>`;
  function thrust(t, dir) { const y = t.y + rnd(-36, 36), x = t.x + rnd(-20, 20); KIT.streak({ x: x + dir * 110, y: y + rnd(-10, 10) }, { x: x - dir * 30, y }, '#eef0f8', 3, 0.2); if (Math.random() < 0.4) F.sparks(x, y, '#fff', 3, 4, 2); }
  function threads(a, b, n = 3, col = '#4a7ad0') { for (let i = 0; i < n; i++) KIT.add({ a: [a.x, a.y + (i - 1) * 10], b: [b.x, b.y + (i - 1) * 12], c1: [(a.x + b.x) / 2, Math.min(a.y, b.y) - 40 - i * 30], c: i === 1 ? '#8ab0f0' : col, w: 2.5, life: 0.6, draw: KIT.D.curve, update() {} }); }
  async function detonate(t, power) {
    F.ring(t.x, t.y, '#e8a0c8', 50, 5, 0.5, 50);
    draw(0.5, (c, k) => { c.globalAlpha = 0.5 + 0.5 * Math.sin(k * 30); c.font = '900 34px "Noto Sans JP", sans-serif'; c.textAlign = 'center'; c.fillStyle = '#e8a0c8'; c.strokeStyle = K; c.lineWidth = 4; c.strokeText('☠', t.x, t.y + 12); c.fillText('☠', t.x, t.y + 12); });
    await wait(200);
    clickThumb({ x: t.x, y: t.y - 90 });
    await wait(160);
    F.boom(t.x, t.y); F.ring(t.x, t.y, '#e8a0c8', 150 + power * 20, 9, 0.5);
    if (power >= 2) F.flames(t.x, t.y, 10, 40, -140, 24);
    say('ドグォォン', { x: t.x, y: t.y - 70 }, { c: '#ffb0d8', size: 54, cls: 'big' }); shake(true);
  }
  function clickThumb(p) { dom('sfx-click', `<svg viewBox="0 0 60 60"><path d="M14 44q-6-12 2-22l10-8q4-3 7 0l3 4 10-3q6-1 7 5t-6 8l-9 2q2 9-6 15-9 5-18-1z" fill="#e8a0c8" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M30 18l6 8" stroke="${K}" stroke-width="3" stroke-linecap="round"/><circle cx="37" cy="27" r="3" fill="#fff"/></svg><b>カチッ</b>`, p, 700); snd('click'); }
  async function popDisc(t, back) {
    const head = { x: t.x, y: t.y - 34 };
    F.ring(head.x, head.y, '#e8e8f0', 40, 4, 0.4);
    say('ズズッ', { x: t.x + 30, y: t.y - 80 }, { c: '#e8e8f0', size: 36 });
    await fly(head, { x: head.x, y: head.y - 60 }, 0.2, (c, k, p) => { c.translate(p.x, p.y); KIT.D.disc({ x: 0, y: 0, r: 14, rot: k * 12 }, 0); });
    fly({ x: head.x, y: head.y - 60 }, back, 0.4, (c, k, p) => { c.translate(p.x, p.y); KIT.D.disc({ x: 0, y: 0, r: 14, rot: k * 20 }, 0); }, { arc: -60 }).then(() => F.ring(back.x, back.y, '#e8e8f0', 50, 4, 0.4));
  }
  function lightRays(t, life = 0.8, n = 14) { const seed = [...Array(n)].map(() => rnd(0, TAU)); draw(life, (c, k) => { c.globalCompositeOperation = 'lighter'; c.globalAlpha = (k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8) * 0.8; c.translate(t.x, t.y); seed.forEach((a, i) => { c.rotate(0); const g = c.createLinearGradient(0, 0, Math.cos(a) * 260, Math.sin(a) * 260); g.addColorStop(0, '#fffbe8'); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a - 0.05) * 260, Math.sin(a - 0.05) * 260); c.lineTo(Math.cos(a + 0.05) * 260, Math.sin(a + 0.05) * 260); c.fill(); }); }); }

  /* ================= the moves ================= */
  const M = {};

  /* ---------- Star Platinum ---------- */
  M.ora_rush = { key: 'star_platinum', color: '#9a7ae8', fn: c => barrage(c, STYLE.star_platinum.style(c)) };
  M.star_finger = { key: 'star_platinum', color: '#9a7ae8', kana: 'スターフィンガー', fn: async c => {
    const t = c.t0, dir = side(c.from, t), st = standAt('star_platinum', { x: c.from.x + dir * 60, y: c.from.y - 10 }, { color: c.color, size: 150 + c.power * 14, flip: dir < 0 });
    snd('stand'); await wait(200);
    const hand = { x: c.from.x + dir * 100, y: c.from.y - 18 }, over = c.power >= 3 ? 160 : 0;
    const end = { x: t.x + dir * over, y: t.y + (t.y - hand.y) * (over / Math.max(1, Math.abs(t.x - hand.x))) };
    say('スターフィンガー!', { x: hand.x + dir * 40, y: hand.y - 70 }, { c: '#c8b0ff', size: 32 });
    draw(0.55, (cx, k) => { const e = Math.min(1, k * 4.5), r = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3; const x = hand.x + (end.x - hand.x) * e * r, y = hand.y + (end.y - hand.y) * e * r; ink(cx, q => { q.moveTo(hand.x, hand.y); q.lineTo(x, y); }, '#9a7ae8', 7 + c.power, '#fff'); cx.fillStyle = '#f6e8ff'; cx.strokeStyle = K; cx.lineWidth = 2; cx.beginPath(); cx.arc(x, y, 5 + c.power * 0.6, 0, TAU); cx.fill(); cx.stroke(); });
    await wait(150);
    burst(t, '#c8b0ff', 50 + c.power * 8); F.ring(t.x, t.y, K, 30, 8, 0.35); say('ズギュン', { x: t.x, y: t.y - 64 }, { c: '#c8b0ff', size: 42 }); snd('crit');
    if (over) F.sparks(t.x + dir * 40, t.y, '#fff', 14, 9);
    knock(t, dir, 22);
    await wait(300); gone(st);
  } };
  M.sp_the_world = { key: 'star_platinum', color: '#9a7ae8', kana: '時よ止まれ', fn: async c => {
    await timeStop(c, 'star_platinum', '#9a7ae8', 'スタープラチナ・ザ・ワールド', 'STAR PLATINUM: THE WORLD');
  } };
  /** shared by Star Platinum: The World and THE WORLD */
  async function timeStop(c, key, col, jp, en, knives = false) {
    KIT.overlay('vfx-invert', 160); snd('timestop');
    const scr = screen('tw-stop', 2400);
    F.clock(innerWidth / 2, innerHeight * 0.45, '#ffd84a', Math.min(innerWidth, innerHeight) * 0.3, 1.1);
    title(jp, en, col, 1200);
    await wait(420);
    const st = standAt(key, c.from, { color: col, size: 150 + c.power * 14, cls: 'blinky' });
    const frozen = [];
    for (const t of c.to.slice(0, 5)) {
      const dir = side(c.from, t);
      moveEl(st, { x: t.x - dir * 60, y: t.y - 6 }, 0, dir < 0 ? -1 : 1);
      const n = 3 + Math.min(4, c.power);
      for (let i = 0; i < n; i++) {
        const p = { x: t.x - dir * rnd(20, 60), y: t.y + rnd(-50, 40) };
        if (knives) { const a = rnd(0, TAU), d = rnd(70, 110), kp = { x: t.x + Math.cos(a) * d, y: t.y + Math.sin(a) * d }; frozen.push({ kind: 'knife', p: kp, t, a: Math.atan2(t.y - kp.y, t.x - kp.x) }); }
        else { const f = fistEl(p, col, dir > 0 ? rnd(-20, 20) : 180 + rnd(-20, 20), 'frozen'); if (f) { f.style.setProperty('--tx', (t.x - p.x) + 'px'); f.style.setProperty('--ty', (t.y - p.y) + 'px'); } frozen.push({ kind: 'fist', el: f, t, p }); }
      }
      say(knives ? 'ピタッ' : 'オラオラ', { x: t.x, y: t.y - 90 }, { c: col, size: 30, ms: 1000 });
      await wait(180);
    }
    // frozen knives hang in the air
    let knifeLayer = null;
    if (knives) { let stop = false; draw(2.2, cx => { if (stop) return; frozen.forEach(f => { cx.save(); cx.translate(f.p.x, f.p.y); cx.rotate(f.a); knife(cx, 14); cx.restore(); }); }); knifeLayer = { stop: () => { stop = true; } }; }
    gone(st);
    title('そして時は動き出す', 'AND TIME RESUMES', '#fff', 900);
    await wait(360);
    scr.classList.add('out'); setTimeout(() => scr.remove(), 250 / spd());
    snd('crit');
    if (knifeLayer) knifeLayer.stop();
    frozen.forEach(f => {
      if (f.kind === 'fist') { if (!f.el) return; f.el.classList.add('release'); setTimeout(() => f.el.remove(), 300 / spd()); }
      else fly(f.p, f.t, 0.14, (cx, k, p) => { cx.translate(p.x, p.y); cx.rotate(f.a); knife(cx, 14); }, { linear: true });
    });
    await wait(120);
    c.to.forEach(t => { burst(t, col, 80); F.speedLines(t.x, t.y, '#fff', 220, 26); knock(t, side(c.from, t), 30); });
    shake(true);
    await wait(220);
  }

  /* ---------- Magician's Red ---------- */
  M.crossfire = { key: 'magicians_red', color: '#ff8a2a', kana: 'クロスファイヤーハリケーン', fn: async c => {
    const special = c.power >= 3, n = special ? 6 : 1 + (c.power >= 1) + (c.power >= 2);
    if (special) title('クロスファイヤーハリケーン・スペシャル', 'CROSSFIRE HURRICANE SPECIAL', '#ff8a2a', 1000);
    else say('クロスファイヤーハリケーン!', { x: c.from.x, y: c.from.y - 90 }, { c: '#ffb050', size: 26 });
    F.flames(c.from.x, c.from.y, 14, 30, -160, 22); snd('boom');
    const shots = [];
    c.to.forEach(t => { for (let i = 0; i < n; i++) { const s = special ? 11 : 20; shots.push(new Promise(r => setTimeout(() => fly(c.from, { x: t.x + rnd(-14, 14), y: t.y + rnd(-14, 14) }, 0.42, (cx, k, p) => { cx.translate(p.x, p.y); cx.rotate(Math.sin(k * 8) * 0.25); ankh(cx, s); }, { arc: special ? (i - n / 2) * 30 : -40, trail: (p) => { if (Math.random() < 0.8) KIT.add({ x: p.x + rnd(-6, 6), y: p.y + rnd(-6, 6), vx: rnd(-30, 30), vy: rnd(-90, -30), r: rnd(8, 14), life: 0.3, draw: KIT.D.flame, drag: 0.95 }); } }).then(r), i * 70 / spd()))); } });
    await Promise.all(shots);
    c.to.forEach(t => { F.flames(t.x, t.y, 22, 34, -220, 26); F.ring(t.x, t.y, '#ff8a2a', 90 + c.power * 14, 7, 0.45); F.smoke(t.x, t.y - 20, '#4a3a3a', 6, 0.45, -70); say('ゴォッ', { x: t.x, y: t.y - 70 }, { c: '#ffb050', size: 40 }); });
    if (c.tier >= 2) KIT.overlay('vfx-grade', 500, { background: '#ff6a20' });
    shake(c.tier >= 2);
  } };
  M.red_bind = { key: 'magicians_red', color: '#ff8a2a', fn: async c => {
    c.to.forEach(t => { for (let i = 0; i < 3; i++) draw(0.9, (cx, k) => { const r = 70 - ease(Math.min(1, k * 1.6)) * 36, y = t.y + (i - 1) * 22; cx.globalAlpha = fade(k); cx.save(); cx.translate(t.x, y); cx.rotate(Math.sin(k * 6 + i) * 0.15); ink(cx, q => q.ellipse(0, 0, r, r * 0.3, 0, 0, TAU), '#ff8a2a', 5, '#fff3a0'); cx.restore(); if (Math.random() < 0.5) KIT.add({ x: t.x + rnd(-r, r), y: y + rnd(-6, 6), vx: 0, vy: rnd(-80, -30), r: rnd(6, 11), life: 0.3, draw: KIT.D.flame, drag: 0.95 }); }); });
    await wait(280);
    c.to.forEach(t => { draw(0.7, (cx, k) => { cx.globalAlpha = fade(k, 0.5); cx.translate(t.x, t.y - 70 - k * 20); ankh(cx, 14); }); say('ジュウ', { x: t.x + 40, y: t.y - 30 }, { c: '#ffb050', size: 34 }); });
    await wait(200);
  } };
  M.life_detector = { key: 'magicians_red', color: '#ff6a3a', fn: async c => {
    const o = c.from, foes = c.to.filter(t => Math.abs(t.x - o.x) > 4 || Math.abs(t.y - o.y) > 4);
    for (let i = 0; i < 6; i++) draw(0.55, (cx, k) => { const a = i * TAU / 6 + k * 5; KIT.D.flame({ x: o.x + Math.cos(a) * 60, y: o.y + Math.sin(a) * 26, r: 13 }, 0.2); });
    say('生命探知機', { x: o.x, y: o.y - 90 }, { c: '#ffb050', size: 28 });
    await wait(380);
    (foes.length ? foes : c.to).forEach((t, i) => fly(o, t, 0.35, (cx, k, p) => KIT.D.flame({ x: p.x, y: p.y, r: 14 }, 0.1), { arc: -50 }).then(() => { F.ring(t.x, t.y, '#ff6a3a', 60, 4, 0.5); flameAt(t.x, t.y - 40, 4, 10); }));
    await wait(380);
  } };

  /* ---------- Hierophant Green ---------- */
  M.emerald_splash = { key: 'hierophant', color: '#3ad07a', kana: 'エメラルドスプラッシュ', fn: async c => {
    const o = c.from;
    F.ring(o.x, o.y, '#3ad07a', 16, 6, 0.35, 90); F.gems(o.x, o.y, '#6af0a0', 6, 120);
    say('エメラルドスプラッシュ!', { x: o.x, y: o.y - 90 }, { c: '#6af0a0', size: c.power >= 3 ? 34 : 26 });
    await wait(160);
    const n = 5 + c.power * 3;
    await Promise.all(c.to.map(t => stream(o, t, n, 26, i => KIT.projectile('gem', { x: o.x + rnd(-16, 16), y: o.y + rnd(-16, 16) }, { x: t.x + rnd(-26, 26), y: t.y + rnd(-26, 26) }, { arc: rnd(-70, 40), r: rnd(5, 9) }))));
    c.to.forEach(t => { F.gems(t.x, t.y, '#3ad07a', 14, 300); F.shards(t.x, t.y, '#b8ffd0', 6, 220); F.ring(t.x, t.y, '#3ad07a', 70, 5, 0.4); say('バシバシ', { x: t.x, y: t.y - 66 }, { c: '#6af0a0', size: 32 }); });
  } };
  M.tentacle_bind = { key: 'hierophant', color: '#3ad07a', fn: async c => {
    c.to.forEach(t => { for (let i = 0; i < 4; i++) draw(0.95, (cx, k) => { const pr = Math.min(1, k * 2.2), o = c.from; cx.globalAlpha = fade(k, 0.75); ink(cx, q => { q.moveTo(o.x, o.y + (i - 1.5) * 8); const steps = 40; for (let s = 1; s <= steps * pr; s++) { const u = s / steps; if (u < 0.6) { const v = u / 0.6; q.lineTo(o.x + (t.x - o.x) * v, o.y + (t.y - o.y) * v - Math.sin(Math.PI * v) * (40 + i * 18)); } else { const v = (u - 0.6) / 0.4, a = v * TAU * 1.5 + i; q.lineTo(t.x + Math.cos(a) * 34 * (1 - v * 0.3), t.y - 30 + v * 60 + Math.sin(a) * 10); } } }, i % 2 ? '#3ad07a' : '#6af0a0', 3); }); });
    await wait(420);
    c.to.forEach(t => { F.ring(t.x, t.y, '#3ad07a', 40, 5, 0.5, 60); say('シュルル', { x: t.x + 40, y: t.y - 50 }, { c: '#6af0a0', size: 30 }); });
    await wait(150);
  } };
  M.emerald_barrier = { key: 'hierophant', color: '#3ad07a', kana: '半径20m', fn: async c => {
    const o = c.from, R = Math.hypot(innerWidth, innerHeight), n = 16;
    screen('green', 1300);
    title('半径20m エメラルドスプラッシュ', '20 METRE EMERALD SPLASH', '#3ad07a', 1200);
    const angs = [...Array(n)].map((_, i) => i * TAU / n + rnd(-0.08, 0.08));
    draw(1.1, (cx, k) => {
      const e = ease(Math.min(1, k * 1.6)); cx.globalAlpha = fade(k, 0.75);
      cx.strokeStyle = '#6af0a0'; cx.lineWidth = 1.6;
      angs.forEach(a => { cx.beginPath(); cx.moveTo(o.x, o.y); cx.lineTo(o.x + Math.cos(a) * R * e, o.y + Math.sin(a) * R * e); cx.stroke(); });
      [90, 180, 300, 450].forEach((r, j) => { if (r > R * e) return; cx.beginPath(); angs.forEach((a, i) => { const x = o.x + Math.cos(a) * r, y = o.y + Math.sin(a) * r; i ? cx.lineTo(x, y) : cx.moveTo(x, y); }); cx.closePath(); cx.stroke();
        angs.forEach((a, i) => { if ((i + j) % 3) return; const x = o.x + Math.cos(a) * r, y = o.y + Math.sin(a) * r, s = 3 + 2 * Math.sin(k * 20 + i); cx.fillStyle = '#b8ffd0'; cx.beginPath(); cx.moveTo(x, y - s * 1.6); cx.lineTo(x + s, y); cx.lineTo(x, y + s * 1.6); cx.lineTo(x - s, y); cx.fill(); }); });
    });
    snd('stand'); await wait(700);
    F.gems(o.x, o.y, '#3ad07a', 12, 200);
  } };

  /* ---------- Silver Chariot ---------- */
  M.rapier_flurry = { key: 'silver_chariot', color: '#c8ccd8', fn: c => barrage(c, Object.assign(STYLE.silver_chariot.style(c), { finish: async (t, p, dir) => { KIT.streak({ x: t.x + dir * 120, y: t.y }, { x: t.x - dir * 150, y: t.y - 4 }, '#fff', 8, 0.3); F.starBurst(t.x, t.y, '#eef0f8', 70, 16, 0.3); say('シュバッ', { x: t.x, y: t.y - 70 }, { c: '#eef0f8', size: 44 }); knock(t, -dir, 20); } })) };
  M.armor_off = { key: 'silver_chariot', color: '#c8ccd8', fn: async c => {
    const o = c.from;
    for (let i = 0; i < 12; i++) { const a = rnd(0, TAU), v = rnd(200, 420); KIT.add({ x: o.x, y: o.y - 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 100, g: 900, r: rnd(6, 11), c: i % 3 ? '#c8ccd8' : '#9aa0b0', rot: rnd(0, TAU), vr: rnd(-12, 12), life: 0.8, draw: KIT.D.square }); }
    say('ガシャン!', { x: o.x, y: o.y - 90 }, { c: '#eef0f8', size: 40 }); snd('crit');
    await wait(220);
    const ghosts = [];
    const n = calm() ? 2 : 4 + (c.power >= 3 ? 2 : 0);
    for (let i = 0; i < n; i++) { const a = i * TAU / n; ghosts.push(standAt('silver_chariot', { x: o.x + Math.cos(a) * 80, y: o.y + Math.sin(a) * 30 - 10 }, { cls: 'ghost', size: 130, color: '#eef0f8' })); }
    F.speedLines(o.x, o.y, '#fff', 180, 24); say('ドドドド', { x: o.x + 60, y: o.y - 60 }, { c: '#c8ccd8', size: 30 });
    await wait(520);
    ghosts.forEach(gone);
  } };
  M.afterimages = { key: 'silver_chariot', color: '#c8ccd8', kana: 'シュバババ', fn: async c => {
    await cine(c);
    const gs = c.to.map(t => { const dir = side(c.from, t); return standAt('silver_chariot', { x: t.x - dir * 60, y: t.y - 6 }, { cls: 'ghost solid', size: 140, color: '#eef0f8', flip: dir < 0 }); });
    say('残像だ!', { x: mid(c.to).x, y: mid(c.to).y - 110 }, { c: '#eef0f8', size: 40, cls: 'big' });
    for (let i = 0; i < 6 + c.power * 2; i++) { c.to.forEach(t => thrust(t, side(c.from, t))); if (i % 3 === 0) snd('hit'); await wait(40); }
    c.to.forEach(t => { F.slash(t.x, t.y, '#eef0f8', 2, 56); F.starBurst(t.x, t.y, '#fff', 60, 16, 0.3); knock(t, side(c.from, t), 18); });
    await wait(160); gs.forEach(gone);
  } };

  /* ---------- Crazy Diamond ---------- */
  M.dora_rush = { key: 'crazy_diamond', color: '#e89ac8', fn: c => barrage(c, Object.assign(STYLE.crazy_diamond.style(c), { finish: async (t, p, dir) => {
    uppercut(t, '#e89ac8', dir, 'ドラララァ!'); cracks(t, 8, 70, '#8adcff', 0.7);
    await wait(260); converge(t, 10 + p * 2, ['#8adcff', '#e89ac8', '#fff'], 120, 0.4, 'shard');
    draw(0.6, (cx, k) => { cx.globalAlpha = fade(k, 0.5); cx.translate(t.x, t.y - 60 - k * 20); cx.scale(0.6 + k, 0.6 + k); heart(cx, 12, '#e89ac8'); });
  } })) };
  M.cd_restore = { key: 'crazy_diamond', color: '#e89ac8', fn: async c => {
    c.to.forEach(t => { cracks(t, 6, 50, '#e89ac8', 0.4); converge(t, 14, ['#e89ac8', '#8adcff', '#f6ecd8'], 120, 0.5, 'shard'); });
    await wait(300);
    c.to.forEach(t => { draw(0.7, (cx, k) => { cx.globalAlpha = fade(k, 0.5); cx.translate(t.x, t.y - 20); cx.scale(0.8 + k * 0.8, 0.8 + k * 0.8); heart(cx, 16, '#f0a8d0'); }); F.stars(t.x, t.y, '#8adcff', 6, 150); F.ring(t.x, t.y, '#e89ac8', 60, 5, 0.5, 50); say('治す', { x: t.x, y: t.y - 76 }, { c: '#f0a8d0', size: 40 }); });
    await wait(180);
  } };
  M.cd_reverse = { key: 'crazy_diamond', color: '#e89ac8', fn: async c => {
    const t = c.t0, dir = side(c.from, t), st = standAt('crazy_diamond', { x: c.from.x + dir * 60, y: c.from.y - 10 }, { color: c.color, size: 150, flip: dir < 0 });
    say('なおす!', { x: c.from.x + dir * 40, y: c.from.y - 90 }, { c: '#f0a8d0', size: 30 }); await wait(160);
    const n = 6 + c.power * 2;
    await stream(null, t, n, 30, () => { const s = { x: t.x + dir * rnd(260, 420), y: t.y + rnd(-160, 160) }, e = { x: t.x - dir * 160, y: t.y + rnd(-20, 20) }; return fly(s, e, 0.3, (cx, k, p) => { cx.translate(p.x, p.y); cx.rotate(Math.atan2(e.y - s.y, e.x - s.x)); KIT.D.shard({ x: 0, y: 0, r: 7, c: '#8adcff', rot: 0 }, 0); }, { linear: true }); });
    burst(t, '#8adcff', 70); say('ドギュン', { x: t.x, y: t.y - 70 }, { c: '#8adcff', size: 44 }); knock(t, -dir, 22);
    await wait(200); gone(st);
  } };

  /* ---------- Killer Queen ---------- */
  M.kq_bomb = { key: 'killer_queen', color: '#e8a0c8', kana: 'カチッ', fn: async c => {
    if (c.via !== 'rush') { await Promise.all(c.to.map(t => KIT.projectile('pin', c.from, t))); for (const t of c.to) await detonate(t, c.power); return; }
    await barrage(c, { cry: ['', ''], hits: () => 1, noFinishFlash: true, finish: async t => { F.ring(t.x, t.y, '#e8a0c8', 30, 4, 0.4); say('タッチ', { x: t.x, y: t.y - 60 }, { c: '#ffb0d8', size: 26 }); } });
    for (const t of c.to) await detonate(t, c.power);
  } };
  M.sb_primary_bomb = M.kq_bomb;
  M.kq_sha = { key: 'killer_queen', color: '#e8a0c8', kana: 'シアーハートアタック', fn: async c => {
    const foes = c.to.filter(t => t !== c.from); const tgt = foes.length ? foes : [{ x: c.from.x + 300, y: c.from.y }];
    const tank = dom('sfx-sha', shaSvg(), { x: c.from.x, y: c.from.y + 40 }, 0);
    say('コッチヲ見ロ', { x: c.from.x, y: c.from.y - 40 }, { c: '#fff', size: 26, cls: 'bubble', ms: 1100 });
    snd('click'); await wait(200);
    for (const t of tgt.slice(0, 4)) { moveEl(tank, { x: t.x, y: t.y + 40 }, 300); tank.style.setProperty('--flip', side(c.from, t)); await wait(300); F.boom(t.x, t.y); say('ドグォン', { x: t.x, y: t.y - 60 }, { c: '#ffb0d8', size: 44 }); shake(true); await wait(90); }
    gone(tank, 200);
    await wait(120);
  } };
  const shaSvg = () => `<svg viewBox="0 0 80 60"><rect x="6" y="36" width="68" height="18" rx="9" fill="#5a4a5a" stroke="${K}" stroke-width="3"/><g class="tread">${[14, 28, 42, 56, 66].map(x => `<circle cx="${x}" cy="45" r="5" fill="#8a7a8a" stroke="${K}" stroke-width="2"/>`).join('')}</g><path d="M14 38q0-26 26-28q26 2 26 28z" fill="#e8e0d8" stroke="${K}" stroke-width="3"/><circle cx="31" cy="26" r="6" fill="${K}"/><circle cx="49" cy="26" r="6" fill="${K}"/><path d="M34 34h12M37 31v6M43 31v6" stroke="${K}" stroke-width="2"/><path d="M40 10V2" stroke="${K}" stroke-width="3"/><circle cx="40" cy="2" r="3" fill="#e8a0c8" stroke="${K}" stroke-width="2"/></svg>`;
  M.kq_btd = { key: 'killer_queen', color: '#e8a0c8', kana: 'バイツァ・ダスト', fn: async c => {
    screen('pink rewind', 1400); snd('rewind');
    F.clock(c.from.x, c.from.y, '#e8a0c8', 110, 1.1, true);
    title('バイツァ・ダスト', 'KILLER QUEEN · BITES THE DUST', '#e8a0c8', 1200);
    const kq = standAt('killer_queen', { x: c.from.x, y: c.from.y - 20 }, { cls: 'tiny', size: 70, color: '#e8a0c8' });
    await wait(620);
    F.ring(c.from.x, c.from.y, '#e8a0c8', 140, 6, 0.6); F.spiral(c.from.x, c.from.y, '#e8a0c8', 90, 5, 0.9, 3);
    await wait(260); gone(kq);
  } };

  /* ---------- The Hand ---------- */
  M.hand_erase = { key: 'the_hand', color: '#3a6ac8', kana: 'ガオン', fn: c => barrage(c, { cry: ['', ''], hits: () => 1, noFinishFlash: true, finish: async (t, p, dir) => {
    const a = { x: t.x + dir * 90, y: t.y - 120 }, b = { x: t.x - dir * 110, y: t.y + 100 };
    gouge(a, b, 44 + p * 8, 0.8); snd('rewind');
    say('ガオン', { x: t.x - dir * 30, y: t.y - 80 }, { c: '#8ab0ff', size: 56, cls: 'big' });
    for (let i = 0; i < 10; i++) { const sx = t.x + rnd(-70, 70), sy = t.y + rnd(-70, 70); KIT.add({ x: sx, y: sy, r: rnd(2, 5), c: i % 2 ? '#f6ecd8' : '#8ab0ff', rot: 0, life: 0.4, draw: KIT.D.square, update: (q, dt, k) => { q.x = sx + (t.x - sx) * k; q.y = sy + (t.y - sy) * k; q.rot += dt * 10; } }); }
    await wait(300); shake(true);
  } }) };
  M.hand_pull = { key: 'the_hand', color: '#3a6ac8', fn: async c => {
    const t = c.t0, dir = side(c.from, t), st = standAt('the_hand', { x: c.from.x + dir * 60, y: c.from.y - 10 }, { color: c.color, size: 150, flip: dir < 0 });
    snd('stand'); await wait(180);
    gouge({ x: c.from.x + dir * 70, y: c.from.y - 6 }, { x: t.x - dir * 30, y: t.y }, 24, 0.55);
    say('ガオン!', mid([c.from, t]), { c: '#8ab0ff', size: 48, cls: 'big' }); snd('rewind');
    await wait(90); pull(t, c.from, 0.55);
    await wait(260); burst(t, '#8ab0ff', 50); F.ring(t.x, t.y, K, 60, 10, 0.3);
    await wait(120); gone(st);
  } };
  M.hand_shield = { key: 'the_hand', color: '#3a6ac8', fn: async c => {
    const o = c.from;
    for (let i = 0; i < 5; i++) { const s = { x: o.x + (o.x < innerWidth / 2 ? 1 : -1) * rnd(300, 420), y: o.y + rnd(-120, 80) }, e = { x: o.x + (s.x - o.x) * 0.3, y: o.y + (s.y - o.y) * 0.3 }; setTimeout(() => KIT.projectile('bullet', s, e).then(() => { gouge({ x: e.x - 30, y: e.y - 24 }, { x: e.x + 30, y: e.y + 24 }, 14, 0.4); }), i * 70 / spd()); }
    await wait(420); say('ガオン', { x: o.x, y: o.y - 90 }, { c: '#8ab0ff', size: 44 }); snd('rewind');
    await wait(200);
  } };

  /* ---------- Gold Experience ---------- */
  M.muda_rush = { key: 'gold_experience', color: '#f2c14e', fn: c => barrage(c, Object.assign(STYLE.gold_experience.style(c), { onHit: (t, i) => { if (i % 5 === 4) ladybugs(t, 1); }, finish: async (t, p, dir) => {
    uppercut(t, '#f2c14e', dir, '無駄ァ!');
    for (let i = 0; i < 3 + (p >> 1); i++) vine(t.x + rnd(-40, 40), t.y + 50, rnd(70, 120), i % 2 ? 1 : -1, '#4aa04a', 1);
    ladybugs(t, 3 + p);
  } })) };
  M.life_giver = { key: 'gold_experience', color: '#8adf6a', fn: async c => {
    c.to.forEach(t => { for (let i = 0; i < 5; i++) vine(t.x + (i - 2) * 22, t.y + 56, rnd(60, 110), i < 2 ? -1 : 1, '#4aa04a', 1.1); ladybugs(t, 3); F.petals(t.x, t.y, '#f6a8d0', 8); say('生命を与える', { x: t.x, y: t.y - 90 }, { c: '#8adf6a', size: 26 }); });
    await wait(420);
    c.to.forEach(t => { F.stars(t.x, t.y, '#fff3a0', 8, 140); F.ring(t.x, t.y, '#8adf6a', 64, 5, 0.6, 40); });
    await wait(160);
  } };
  M.sense_overload = { key: 'gold_experience', color: '#f2c14e', kana: 'ゆっくり', fn: async c => {
    await barrage(c, { cry: ['無駄', 'MUDA'], hits: () => 1, noFinishFlash: true });
    screen('slowmo', 1200);
    say('意識だけが暴走する…', { x: innerWidth / 2, y: innerHeight * 0.25 }, { c: '#f2c14e', size: 30, ms: 1200 });
    c.to.forEach(t => { for (let i = 1; i <= 3; i++) draw(1, (cx, k) => { cx.globalAlpha = (1 - k) * 0.5; cx.strokeStyle = '#f2c14e'; cx.lineWidth = 3; cx.setLineDash([8, 6]); cx.beginPath(); cx.ellipse(t.x + i * 16 * k, t.y - i * 6 * k, 38 + i * 4, 52 + i * 4, 0, 0, TAU); cx.stroke(); cx.setLineDash([]); }); for (let i = 0; i < 3; i++) setTimeout(() => F.ring(t.x, t.y, '#f2c14e', 50 + i * 30, 3, 0.9), i * 200 / spd()); });
    await wait(760);
    c.to.forEach(t => { burst(t, '#fff3a0', 90); say('ゆっくり…', { x: t.x, y: t.y - 76 }, { c: '#f2c14e', size: 34 }); knock(t, side(c.from, t), 26); });
    shake(true); await wait(160);
  } };

  /* ---------- Sticky Fingers ---------- */
  M.ari_rush = { key: 'sticky_fingers', color: '#dfe6f4', fn: c => barrage(c, Object.assign(STYLE.sticky_fingers.style(c), { finish: async (t, p, dir) => { uppercut(t, '#5a8ad0', dir, 'アリアリアリ!'); zipper(t, -0.5, 130, '#c8ccd8', 0.9); say('ジィッ', { x: t.x + 50, y: t.y - 40 }, { c: '#8ab0ff', size: 32 }); } })) };
  M.zipper_escape = { key: 'sticky_fingers', color: '#dfe6f4', fn: async c => {
    zipper({ x: c.from.x, y: c.from.y + 56 }, 0, 150, '#c8ccd8', 1); say('ジィィッ', { x: c.from.x, y: c.from.y - 80 }, { c: '#8ab0ff', size: 36 }); snd('click');
    await wait(200); sink(c.from, 60); await wait(600);
  } };
  M.arrivederci = { key: 'sticky_fingers', color: '#dfe6f4', kana: 'アリーヴェデルチ', fn: async c => {
    await barrage(c, Object.assign(STYLE.sticky_fingers.style(c), { fan: 3, finish: async (t, p, dir) => {
      [-0.6, 0.1, 0.8].forEach((a, i) => setTimeout(() => zipper({ x: t.x + (i - 1) * 16, y: t.y + (i - 1) * 20 }, a, 170, '#c8ccd8', 1), i * 80 / spd()));
      await wait(300);
      jolt(t, [{ transform: 'translate(0,0)' }, { transform: `translate(${-dir * 10}px,6px) rotate(${-dir * 6}deg)`, offset: 0.3 }, { transform: 'translate(0,0)' }], 600);
      title('アリーヴェデルチ!', 'ARRIVEDERCI', '#8ab0ff', 1000); F.debris(t.x, t.y, '#5a8ad0', 12); shake(true);
      await wait(260);
    } }));
  } };

  /* ---------- King Crimson ---------- */
  M.heart_punch = { key: 'king_crimson', color: '#c8323c', fn: c => barrage(c, { cry: ['', ''], blink: true, hits: () => 1, noFinishFlash: true, onArrive: t => { KIT.overlay('vfx-grey red', 260); }, finish: async (t, p, dir) => pierce(t, dir, '#c8323c') }) };
  M.epitaph = { key: 'king_crimson', color: '#c8323c', kana: 'エピタフ', fn: async c => {
    screen('red', 1100); snd('rewind');
    dom('sfx-eye', `<svg viewBox="0 0 120 60"><path d="M4 30Q60-14 116 30Q60 74 4 30z" fill="#f6ecd8" stroke="${K}" stroke-width="4"/><circle cx="60" cy="30" r="17" fill="#c8323c" stroke="${K}" stroke-width="3"/><circle cx="60" cy="30" r="7" fill="${K}"/><circle cx="54" cy="24" r="4" fill="#fff"/></svg>`, { x: c.from.x, y: c.from.y - 100 }, 1000);
    say('エピタフ', { x: c.from.x + 70, y: c.from.y - 130 }, { c: '#ff6a6a', size: 34, ms: 1000 });
    const dir = c.from.x < innerWidth / 2 ? 1 : -1;
    for (let i = 1; i <= 3; i++) setTimeout(() => { const g = standAt('king_crimson', { x: c.from.x + dir * i * 70, y: c.from.y - 10 }, { cls: 'ghost red', size: 140, color: '#ff6a6a', flip: dir < 0 }); setTimeout(() => gone(g), 420 / spd()); }, i * 120 / spd());
    await wait(820);
  } };
  M.time_erase = { key: 'king_crimson', color: '#c8323c', kana: '時は消し飛ぶ', fn: async c => {
    const scr = screen('kc-void', 2200, '<i class="frames"></i>'); snd('rewind');
    title('キング・クリムゾン!', '時は消し飛ぶ · TIME IS ERASED', '#ff4a5a', 1100);
    await wait(380);
    const st = standAt('king_crimson', c.from, { color: '#c8323c', size: 160, cls: 'blinky' });
    for (const t of c.to.slice(0, 5)) {
      const dir = side(c.from, t);
      moveEl(st, { x: t.x - dir * 60, y: t.y - 6 }, 0, dir < 0 ? -1 : 1);
      const g = standAt('king_crimson', { x: t.x - dir * 30, y: t.y - 6 }, { cls: 'ghost red', size: 130, color: '#ff6a6a', flip: dir < 0 }); setTimeout(() => gone(g), 300 / spd());
      F.slash(t.x, t.y, '#ff4a5a', 2, 60); F.blood(t.x, t.y, 10); snd('hit');
      await wait(170);
    }
    gone(st);
    scr.classList.add('out'); setTimeout(() => scr.remove(), 200 / spd());
    KIT.overlay('vfx-invert', 120);
    c.to.forEach(t => { burst(t, '#ff4a5a', 80); knock(t, side(c.from, t), 30); say('ドォン', { x: t.x, y: t.y - 76 }, { c: '#ff6a6a', size: 40 }); });
    shake(true); await wait(220);
  } };

  /* ---------- Stone Free ---------- */
  function net(t, col = '#4a7ad0', life = 1) {
    draw(life, (cx, k) => {
      const e = ease(Math.min(1, k * 2.2)), s = 1 - Math.max(0, k - 0.45) * 0.55, R = 70 * s;
      cx.globalAlpha = fade(k, 0.75); cx.save(); cx.translate(t.x, t.y); cx.rotate(0.785);
      for (let i = -3; i <= 3; i++) { const o = i * R / 3; ink(cx, q => { q.moveTo(-R * e, o); q.quadraticCurveTo(0, o + 8 * Math.sin(i + k * 6), R * e, o); }, col, 2); ink(cx, q => { q.moveTo(o, -R * e); q.quadraticCurveTo(o + 8 * Math.cos(i + k * 6), 0, o, R * e); }, col, 2); }
      cx.restore();
    });
  }
  M.string_net = { key: 'stone_free', color: '#4a7ad0', fn: async c => {
    const dir = side(c.from, c.t0), st = standAt('stone_free', { x: c.from.x + dir * 60, y: c.from.y - 10 }, { color: c.color, size: 150, flip: dir < 0 });
    await wait(150);
    c.to.forEach(t => { threads(c.from, t, 5); });
    say('シュルルル', { x: c.from.x + dir * 60, y: c.from.y - 90 }, { c: '#8ab0f0', size: 30 }); snd('whistle');
    await wait(240);
    c.to.forEach(t => { net(t); F.ring(t.x, t.y, '#8ab0f0', 40, 4, 0.6, 80); });
    await wait(420); c.to.forEach(t => jolt(t, [{ transform: 'scale(1)' }, { transform: 'scale(.9)', offset: 0.4 }, { transform: 'scale(1)' }], 400));
    await wait(150); gone(st);
  } };
  M.unravel = { key: 'stone_free', color: '#4a7ad0', fn: async c => {
    const o = c.from;
    for (let i = 0; i < 8; i++) { const a0 = i * TAU / 8; draw(0.9, (cx, k) => { const out = Math.sin(Math.PI * Math.min(1, k * 1.2)); cx.globalAlpha = fade(k, 0.8); ink(cx, q => { q.moveTo(o.x, o.y); for (let s = 0; s <= 20; s++) { const u = s / 20, a = a0 + u * 3, r = u * 110 * out; q.lineTo(o.x + Math.cos(a) * r, o.y + Math.sin(a) * r * 0.6); } }, i % 2 ? '#8ab0f0' : '#4a7ad0', 2); }); }
    say('ほどける', { x: o.x, y: o.y - 90 }, { c: '#8ab0f0', size: 32 }); snd('whistle');
    jolt(o, [{ opacity: 0 }, { opacity: -0.6, offset: 0.4 }, { opacity: 0 }], 800);
    await wait(700);
  } };
  M.mobius = { key: 'stone_free', color: '#4a7ad0', kana: 'メビウスの輪', fn: c => barrage(c, Object.assign(STYLE.stone_free.style(c), { onArrive: async t => {
    draw(1, (cx, k) => { const pr = Math.min(1, k * 2.5); cx.globalAlpha = fade(k, 0.75); ink(cx, q => { for (let s = 0; s <= 80 * pr; s++) { const a = s / 80 * TAU, d = 1 + Math.sin(a) ** 2; const x = t.x + 80 * Math.cos(a) / d, y = t.y + 50 * Math.sin(a) * Math.cos(a) / d; s ? q.lineTo(x, y) : q.moveTo(x, y); } }, '#8ab0f0', 3, '#fff'); });
    say('メビウスの輪', { x: t.x, y: t.y - 100 }, { c: '#8ab0f0', size: 30 }); await wait(220);
  } })) };

  /* ---------- Whitesnake ---------- */
  M.disc_steal = { key: 'whitesnake', color: '#d8d8e8', fn: async c => {
    if (c.via !== 'rush') { for (const t of c.to) await popDisc(t, c.from); await wait(200); return; }
    await barrage(c, { cry: ['', ''], hits: () => 2, noFinishFlash: true, finish: async t => { await popDisc(t, c.from); } });
  } };
  M.ws_melt = { key: 'whitesnake', color: '#d8d8e8', fn: async c => {
    const dir = side(c.from, c.t0), st = standAt('whitesnake', { x: c.from.x + dir * 60, y: c.from.y - 10 }, { color: '#b8f0a8', size: 150, flip: dir < 0 });
    await wait(160);
    c.to.forEach(t => {
      draw(1, (cx, k) => { cx.globalAlpha = fade(k, 0.7) * 0.8; for (let i = 0; i < 6; i++) { const y = t.y - 50 + i * 20; cx.strokeStyle = i % 2 ? '#b8f0a8' : '#f0a8e8'; cx.lineWidth = 3; cx.beginPath(); for (let x = -60; x <= 60; x += 6) cx.lineTo(t.x + x, y + Math.sin(x * 0.12 + k * 14 + i) * 6); cx.stroke(); } });
      for (let i = 0; i < 12; i++) setTimeout(() => KIT.add({ x: t.x + rnd(-44, 44), y: t.y - 30 + rnd(-20, 20), vx: 0, vy: rnd(20, 60), g: 400, r: rnd(4, 7), c: i % 2 ? '#b8f0a8' : '#f0a8e8', life: 0.8, draw: KIT.D.drop, drag: 0.99 }), i * 40 / spd());
      say('ドロォ', { x: t.x + 30, y: t.y - 70 }, { c: '#b8f0a8', size: 40 });
    });
    snd('debuff'); await wait(600); gone(st);
  } };
  M.command_disc = { key: 'whitesnake', color: '#d8d8e8', kana: '命令', fn: async c => {
    const o = c.via === 'rush' ? { x: c.from.x, y: c.from.y - 20 } : c.from;
    let st = null; if (c.via === 'rush') { const dir = side(c.from, c.t0); st = standAt('whitesnake', { x: c.from.x + dir * 60, y: c.from.y - 10 }, { color: '#d8d8e8', size: 150, flip: dir < 0 }); await wait(150); }
    await Promise.all(c.to.map(t => fly(o, { x: t.x, y: t.y - 36 }, 0.4, (cx, k, p) => { cx.translate(p.x, p.y); KIT.D.disc({ x: 0, y: 0, r: 14, rot: k * 20 }, 0); }, { arc: -80 })));
    c.to.forEach(t => { draw(0.4, (cx, k) => { cx.translate(t.x, t.y - 36); cx.scale(1, 1 - k); KIT.D.disc({ x: 0, y: 0, r: 14, rot: 0 }, k); }); F.ring(t.x, t.y - 36, '#e8e8f0', 50, 4, 0.5); say('命令', { x: t.x, y: t.y - 90 }, { c: '#e8e8f0', size: 40 }); });
    snd('debuff'); await wait(300); gone(st);
  } };

  /* ---------- Tusk (Johnny) ---------- */
  async function nails(c, n, o = {}) {
    const gold = !!o.gold;
    await Promise.all(c.to.map(t => stream(c.from, t, n, o.gap || 55, i => { const s = { x: c.from.x + rnd(-10, 10), y: c.from.y + rnd(-14, 6) }, e = { x: t.x + rnd(-18, 18), y: t.y + rnd(-18, 18) }; return fly(s, e, o.dur || 0.24, (cx, k, p) => { cx.translate(p.x, p.y); cx.rotate(p.rot); nailShape(cx, gold ? 10 : 8, gold ? '#ffe89a' : '#f6dcc8', gold ? '#ffd84a' : '#b070ff'); }, { spin: 30, arc: o.arc || 0, trail: p => { if (Math.random() < 0.6) dot(p.x, p.y, rnd(2, 3.5), gold ? '#ffd84a' : '#c8a0ff', 0.25, { vx: rnd(-30, 30), vy: rnd(-30, 30) }); } }).then(() => { F.ring(e.x, e.y, gold ? '#ffd84a' : '#b070ff', 34, 4, 0.35); F.sparks(e.x, e.y, gold ? '#fff3a0' : '#c8a0ff', 5, 5, 2); }); })));
    c.to.forEach(t => { F.spiral(t.x, t.y, gold ? '#ffd84a' : '#b070ff', 50 + c.power * 6, 4, 0.8, 2.5); });
  }
  M.nail_shot = { fn: async c => { await nails(c, 1 + (c.power >> 1)); say('ズキュン', { x: c.t0.x, y: c.t0.y - 66 }, { c: '#c8a0ff', size: 32 }); } };
  M.nail_bullet = { color: '#b070ff', fn: async c => { say('ACT1', { x: c.from.x, y: c.from.y - 80 }, { c: '#c8a0ff', size: 28 }); await nails(c, 2 + c.power); say('ズキュン', { x: c.t0.x, y: c.t0.y - 66 }, { c: '#c8a0ff', size: 36 }); } };
  M.ten_nails = M.nail_volley = { fn: async c => { await nails(c, 5 + c.power * 1, { gap: 30 }); c.to.forEach(t => say('ダダダ', { x: t.x, y: t.y - 66 }, { c: '#c8a0ff', size: 32 })); } };
  M.nail_storm = M.tree_nail_storm = { kana: '爪弾', fn: async c => {
    if (c.tier >= 3) title('ACT4 · 爪弾', 'NAIL STORM', '#ffd84a', 900); else say('爪弾の嵐', { x: c.from.x, y: c.from.y - 90 }, { c: '#c8a0ff', size: 30 });
    await Promise.all(c.to.map(t => stream(null, t, 5 + c.power, 40, () => { const s = { x: t.x + rnd(-120, 120), y: t.y - rnd(260, 340) }, e = { x: t.x + rnd(-40, 40), y: t.y + rnd(-30, 30) }; return fly(s, e, 0.26, (cx, k, p) => { cx.translate(p.x, p.y); cx.rotate(p.rot); nailShape(cx, 8); }, { spin: 30, linear: true }).then(() => F.ring(e.x, e.y, '#b070ff', 30, 4, 0.3)); })));
    c.to.forEach(t => { F.spiral(t.x, t.y, '#b070ff', 70, 5, 0.9, 3); F.debris(t.x, t.y, '#c8a070', 6); });
  } };
  M.nail_bloom = { fn: async c => {
    await nails(c, 2 + (c.power >> 1));
    c.to.forEach(t => { for (let i = 0; i < 6; i++) { const a = i * TAU / 6; setTimeout(() => F.spiral(t.x + Math.cos(a) * 36, t.y + Math.sin(a) * 36, '#b070ff', 30, 3, 0.8, 2), i * 50 / spd()); } say('咲け', { x: t.x, y: t.y - 76 }, { c: '#c8a0ff', size: 40 }); });
    await wait(300);
  } };
  M.spinning_hole = { color: '#b070ff', fn: async c => {
    say('ACT2', { x: c.from.x, y: c.from.y - 80 }, { c: '#c8a0ff', size: 28 });
    await nails(c, 1 + (c.power >> 1));
    c.to.forEach(t => { draw(0.9, (cx, k) => { const a = k * TAU * 1.5, x = t.x + Math.cos(a) * 34, y = t.y + Math.sin(a) * 40; cx.globalAlpha = fade(k); cx.fillStyle = '#12081c'; cx.strokeStyle = '#b070ff'; cx.lineWidth = 3; cx.beginPath(); cx.ellipse(x, y, 12, 8, a, 0, TAU); cx.fill(); cx.stroke(); cx.strokeStyle = '#c8a0ff'; cx.lineWidth = 2; cx.beginPath(); cx.arc(x, y, 5 + 3 * Math.sin(k * 40), a * 4, a * 4 + 4); cx.stroke(); }); say('ギャルルル', { x: t.x + 40, y: t.y - 66 }, { c: '#c8a0ff', size: 32 }); });
    await wait(500);
  } };
  M.loose_hole = { fn: async c => { const o = c.from; draw(0.9, (cx, k) => { cx.globalAlpha = fade(k); cx.fillStyle = '#12081c'; cx.strokeStyle = '#b070ff'; cx.lineWidth = 3; cx.beginPath(); cx.ellipse(o.x, o.y + 54, 30 * ease(Math.min(1, k * 3)), 10, 0, 0, TAU); cx.fill(); cx.stroke(); }); F.spiral(o.x, o.y + 54, '#b070ff', 40, 3, 0.8, 2); say('ACT2', { x: o.x, y: o.y - 80 }, { c: '#c8a0ff', size: 30 }); await wait(400); } };
  M.wormhole = { color: '#b070ff', kana: 'ACT3', fn: async c => {
    const t = c.t0, dir = side(c.from, t);
    say('ACT3', { x: c.from.x, y: c.from.y - 90 }, { c: '#c8a0ff', size: 32 });
    const hole = (p, k) => { const cx = C(); cx.globalAlpha = fade(k); cx.fillStyle = '#12081c'; cx.strokeStyle = '#b070ff'; cx.lineWidth = 4; cx.beginPath(); cx.ellipse(p.x, p.y, 22 * ease(Math.min(1, k * 3)), 30 * ease(Math.min(1, k * 3)), 0, 0, TAU); cx.fill(); cx.stroke(); };
    draw(0.9, (cx, k) => hole(c.from, k)); F.spiral(c.from.x, c.from.y, '#b070ff', 50, 4, 0.7);
    jolt(c.from, [{ transform: 'scale(1)', opacity: 0 }, { transform: 'scale(.4)', opacity: -0.8, offset: 0.4 }, { transform: 'scale(1)', opacity: 0 }], 700);
    await wait(260);
    const exit = { x: t.x - dir * 50, y: t.y - 30 };
    draw(0.8, (cx, k) => hole(exit, k)); F.spiral(exit.x, exit.y, '#b070ff', 40, 4, 0.6);
    await wait(120);
    await fly(exit, t, 0.12, (cx, k, p) => { cx.translate(p.x, p.y); cx.rotate(k * 20); nailShape(cx, 9); }, { linear: true });
    burst(t, '#c8a0ff', 60); F.spiral(t.x, t.y, '#b070ff', 60, 5, 0.8, 3); say('ズギュン', { x: t.x, y: t.y - 70 }, { c: '#c8a0ff', size: 38 });
  } };
  M.infinite_rotation = M.infinite_seed = { key: 'tusk4', color: '#ffd84a', kana: '無限の回転', fn: async c => {
    screen('gold', 1900);
    title('無限の回転', 'TUSK ACT4 · INFINITE ROTATION', '#ffd84a', 1300);
    F.goldRect(innerWidth / 2, innerHeight / 2, Math.min(innerWidth, innerHeight) * 0.34, '#ffd84a', 1.3); snd('spin');
    await wait(360);
    await barrage(Object.assign({}, c, { key: 'tusk4', color: '#ffd84a' }), Object.assign(STYLE.tusk4.style(c), { finish: async (t, p, dir) => {
      uppercut(t, '#ffd84a', dir, 'ORAAAA!');
      draw(1.6, (cx, k) => { cx.globalAlpha = fade(k, 0.8); cx.translate(t.x, t.y); cx.rotate(k * 40); ink(cx, q => { for (let s = 0; s < 90; s++) { const th = s / 90 * TAU * 4, r = 6 + s * 0.9; q.lineTo(Math.cos(th) * r, Math.sin(th) * r * 0.7); } }, '#ffd84a', 3, '#fff'); });
      say('∞', { x: t.x + 50, y: t.y - 40 }, { c: '#ffd84a', size: 60 });
    } }));
  } };
  M.golden_nail = M.tree_golden_nail = { color: '#ffd84a', kana: '黄金回転', fn: async c => {
    F.spiral(c.from.x, c.from.y, '#ffd84a', 60, 5, 0.6);
    await nails(c, 1 + (c.power >> 1), { gold: true, dur: 0.3 });
    c.to.forEach(t => { F.goldRect(t.x, t.y, 90 + c.power * 12, '#ffd84a', 1); F.stars(t.x, t.y, '#ffd84a', 10, 260); say('黄金回転', { x: t.x, y: t.y - 76 }, { c: '#ffd84a', size: 34 }); });
    await wait(200);
  } };

  /* ---------- Gyro: Ball Breaker ---------- */
  M.ball_breaker = { key: 'ballbreaker', color: '#ffd84a', kana: 'ボール・ブレイカー', fn: async c => {
    const dir = side(c.from, c.t0);
    const sk = dom('sfx-skel', skelSvg(), { x: c.from.x + dir * 40, y: c.from.y - 40 }, 1800, { '--flip': dir });
    title('ボール・ブレイカー', 'BALL BREAKER', '#ffd84a', 1200); snd('spin');
    await wait(420);
    await Promise.all(c.to.map(t => KIT.projectile('golden', c.from, t, { dur: 0.5 })));
    c.to.forEach(t => {
      F.goldRect(t.x, t.y, 110, '#fff3a0', 1); F.stars(t.x, t.y, '#f2c14e', 16, 320);
      dom('sfx-age', '', t, 1200);
      draw(1.1, (cx, k) => { cx.globalAlpha = fade(k, 0.6); cx.strokeStyle = '#6a5a4a'; cx.lineWidth = 2; for (let i = 0; i < 7; i++) { const y = t.y - 40 + i * 13; cx.beginPath(); for (let x = -40; x <= 40; x += 8) cx.lineTo(t.x + x, y + Math.sin(x * 0.3 + i) * 3 * Math.min(1, k * 3)); cx.stroke(); } });
      say('老化', { x: t.x, y: t.y - 80 }, { c: '#e8d8b0', size: 44, cls: 'big' });
    });
    shake(true); await wait(420); sk && sk.classList.add('out');
  } };
  const skelSvg = () => `<svg viewBox="0 0 120 170"><g fill="none" stroke="#ffd84a" stroke-width="4" stroke-linecap="round"><circle cx="60" cy="24" r="16"/><path d="M60 40v58M36 56h48M40 66h40M42 76h36M44 86h32M60 58L22 96L14 128M60 58L98 96L106 128M60 98L40 164M60 98L80 164"/></g><g fill="#1a1020"><circle cx="54" cy="22" r="4"/><circle cx="66" cy="22" r="4"/></g><rect x="6" y="6" width="108" height="158" fill="none" stroke="#fff3a0" stroke-width="2" stroke-dasharray="8 6"/></svg>`;

  /* ---------- Oh! Lonesome Me (Mountain Tim) ---------- */
  async function lonesome(c, mode) {
    const o = c.from;
    if (mode === 'self') {
      for (let i = 0; i < 6; i++) { const y = o.y - 40 + i * 16; draw(0.9, (cx, k) => { const s = Math.sin(Math.PI * Math.min(1, k * 1.2)) * (i % 2 ? 50 : -50); cx.globalAlpha = fade(k); cx.fillStyle = '#e8b890'; cx.strokeStyle = K; cx.lineWidth = 1.6; cx.fillRect(o.x + s - 12, y - 6, 24, 12); cx.strokeRect(o.x + s - 12, y - 6, 24, 12); }); }
      draw(0.9, (cx, k) => { cx.globalAlpha = fade(k); ink(cx, q => { q.moveTo(o.x - 90, o.y - 60); q.lineTo(o.x + 90, o.y + 60); }, '#c8a070', 3); });
      say('バラバラ', { x: o.x, y: o.y - 90 }, { c: '#e8c890', size: 32 }); await wait(650); return;
    }
    c.to.forEach(t => {
      KIT.add({ a: [o.x, o.y], b: [t.x, t.y - 20], c1: [(o.x + t.x) / 2, Math.min(o.y, t.y) - 110], c: '#c8a070', w: 4, life: 0.9, draw: KIT.D.curve, update() {} });
      for (let i = 0; i < 4; i++) KIT.add({ x: o.x, y: o.y, life: 0.7, update(p, dt, k) { const u = Math.min(1, k * 1.4 - i * 0.12); if (u < 0) return; const a = 1 - u; p.x = a * a * o.x + 2 * a * u * (o.x + t.x) / 2 + u * u * t.x; p.y = a * a * o.y + 2 * a * u * (Math.min(o.y, t.y) - 110) + u * u * (t.y - 20); }, draw: (p, k) => { const cx = C(); cx.globalAlpha = fade(k); cx.fillStyle = '#e8b890'; cx.strokeStyle = K; cx.lineWidth = 1.5; cx.fillRect(p.x - 7, p.y - 5, 14, 10); cx.strokeRect(p.x - 7, p.y - 5, 14, 10); } });
    });
    await wait(300);
    c.to.forEach(t => { KIT.add({ x: t.x, y: t.y, c: '#c8a070', r: 34, w: 5, r0: 80, life: 0.5, draw: KIT.D.ring, update() {} }); say(mode === 'reel' ? 'グイッ' : 'ヒュン', { x: t.x, y: t.y - 66 }, { c: '#e8c890', size: 32 }); if (mode === 'reel') pull(t, o, 0.35); });
    snd('whistle'); await wait(260);
  }
  ['rope_bind', 'lasso_arrest', 'split_lash', 'lasso_sweep', 'tree_rope_puppet', 'rope_decoy'].forEach(id => { M[id] = { fn: c => lonesome(c, 'bind') }; });
  M.reel_in = { fn: c => lonesome(c, 'reel') };
  ['lasso_split', 'rope_slip'].forEach(id => { M[id] = { fn: c => lonesome(c, 'self') }; });

  /* ---------- Cream Starter (Hot Pants) ---------- */
  async function cream(c, mode) {
    const o = c.from, heal = mode === 'heal';
    dom('sfx-can', `<svg viewBox="0 0 30 60"><rect x="4" y="14" width="22" height="42" rx="4" fill="#f0a8c8" stroke="${K}" stroke-width="3"/><rect x="9" y="4" width="12" height="10" fill="#c8c8d8" stroke="${K}" stroke-width="3"/><path d="M21 7h7" stroke="${K}" stroke-width="3"/></svg>`, { x: o.x + (heal ? 0 : side(o, c.t0) * 50), y: o.y }, 800, { '--flip': side(o, c.t0) });
    say('プシュー', { x: o.x, y: o.y - 80 }, { c: '#f0a8c8', size: 30 }); snd('miss');
    await Promise.all(c.to.map(t => stream(o, t, 8 + c.power * 2, 22, () => fly({ x: o.x + side(o, t) * 60, y: o.y - 4 }, { x: t.x + rnd(-28, 28), y: t.y + rnd(-34, 20) }, 0.3, (cx, k, p) => { cx.fillStyle = '#f0a8c8'; cx.strokeStyle = K; cx.lineWidth = 1.4; cx.beginPath(); cx.arc(p.x, p.y, 6 - k * 2, 0, TAU); cx.fill(); cx.stroke(); }, { arc: rnd(-40, 10) }))));
    c.to.forEach(t => {
      if (heal) { for (let i = 0; i < 6; i++) { const x = t.x + rnd(-30, 30), y = t.y + rnd(-30, 30); draw(0.8, (cx, k) => { cx.globalAlpha = fade(k, 0.5); cx.fillStyle = '#f6c0d0'; cx.strokeStyle = K; cx.lineWidth = 1.4; cx.beginPath(); cx.ellipse(x, y, 9, 6, i, 0, TAU); cx.fill(); cx.stroke(); cx.strokeStyle = '#c86a8a'; cx.beginPath(); cx.moveTo(x - 5, y); cx.lineTo(x + 5, y); cx.stroke(); }); } F.regen(t); }
      else { draw(0.9, (cx, k) => { cx.globalAlpha = fade(k, 0.6) * 0.9; cx.fillStyle = '#f0a8c8'; cx.strokeStyle = K; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(t.x, t.y - 26, 30 * Math.min(1, k * 3), 20 * Math.min(1, k * 3), 0, 0, TAU); cx.fill(); cx.stroke(); }); say(mode === 'crucible' ? 'ドロドロ' : 'ムグッ', { x: t.x + 40, y: t.y - 60 }, { c: '#f0a8c8', size: 32 }); }
    });
    await wait(260);
  }
  ['flesh_spray', 'prayer_mend', 'flesh_patch', 'first_napkin'].forEach(id => { M[id] = { fn: c => cream(c, 'heal') }; });
  ['flesh_blind', 'flesh_lash', 'flesh_flood', 'flesh_choke', 'flesh_double'].forEach(id => { M[id] = { fn: c => cream(c, 'smother') }; });
  M.flesh_crucible = { kana: 'クリーム・スターター', fn: c => cream(c, 'crucible') };
  M.first_napkin = { fn: async c => { c.to.forEach(t => { F.pillar(t.x, t.y, 'rgba(255,240,180,.9)', 30, 0.7); F.cross(t.x, t.y - 50, '#ffd84a', 24, 6); F.regen(t); }); say('聖なる布', { x: c.from.x, y: c.from.y - 90 }, { c: '#fff3a0', size: 30 }); await wait(400); } };

  /* ---------- Wrecking Ball (Wekapipo) ---------- */
  async function wrecking(c, left) {
    const n = 4 + (c.power >> 1);
    await Promise.all(c.to.map(t => fly(c.from, t, 0.45, (cx, k, p) => { cx.translate(p.x, p.y); const g = cx.createRadialGradient(-4, -4, 1, 0, 0, 13); g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#c8c8d8'); g.addColorStop(1, '#6a6a7a'); cx.fillStyle = g; cx.strokeStyle = K; cx.lineWidth = 2.5; cx.beginPath(); cx.arc(0, 0, 13, 0, TAU); cx.fill(); cx.stroke(); for (let i = 0; i < n; i++) { const a = i * TAU / n + k * 18; cx.fillStyle = '#9aa0b0'; cx.beginPath(); cx.arc(Math.cos(a) * 24, Math.sin(a) * 24 * 0.6, 4.5, 0, TAU); cx.fill(); cx.stroke(); } }, { arc: -30 })));
    c.to.forEach(t => {
      for (let i = 0; i < n; i++) { const a = rnd(0, TAU); setTimeout(() => fly(t, { x: t.x + Math.cos(a) * 60, y: t.y + Math.sin(a) * 50 }, 0.25, (cx, k, p) => { cx.fillStyle = '#9aa0b0'; cx.strokeStyle = K; cx.lineWidth = 2; cx.beginPath(); cx.arc(p.x, p.y, 5, 0, TAU); cx.fill(); cx.stroke(); }).then(() => F.starBurst(t.x + Math.cos(a) * 60, t.y + Math.sin(a) * 50, '#fff', 26, 8, 0.2)), i * 40 / spd()); }
      F.ring(t.x, t.y, '#3fb8a9', 90, 7, 0.5); F.debris(t.x, t.y, '#c8c8d8', 8);
      if (left) { dom('sfx-leftside', '', t, 1100); say('左半身失調', { x: t.x, y: t.y - 80 }, { c: '#9fe8d0', size: 26 }); }
    });
    snd('spin'); await wait(300);
  }
  ['wrecking_ball', 'ricochet', 'satellites'].forEach(id => { M[id] = { fn: c => wrecking(c, id === 'wrecking_ball') }; });

  /* ---------- Hey Ya! (Pocoloco), Ticket to Ride (Lucy) ---------- */
  async function heyYa(c, line) {
    const o = c.from;
    const st = standAt('heyya', { x: o.x + 50, y: o.y - 40 }, { cls: 'pop', size: 80, color: '#f2c14e' });
    say(line, { x: o.x + 80, y: o.y - 110 }, { c: K, size: 22, cls: 'bubble', rot: 0, ms: 1100 });
    c.to.forEach(t => { for (let i = 0; i < 5; i++) KIT.add({ x: t.x + rnd(-40, 40), y: t.y + 30, vx: rnd(-20, 20), vy: rnd(-140, -80), rot: rnd(0, TAU), life: 0.9, drag: 0.98, draw: (p, k) => { const cx = C(); cx.globalAlpha = fade(k); cx.translate(p.x, p.y); cx.rotate(p.rot + k * 3); clover(cx, 9); } }); F.stars(t.x, t.y, '#f2c14e', 5, 120); });
    snd('buff'); await wait(700); gone(st);
  }
  M.hey_ya = { fn: c => heyYa(c, 'Hey Ya! You can do it!') };
  M.heyya_tag = { fn: c => heyYa(c, 'Hey Ya! Follow me!') };
  M.lucky_day = M.lucky_breeze = { fn: c => heyYa(c, "You're lucky today!") };
  M.fortune = { fn: async c => { await heyYa(c, 'Aim right THERE!'); c.to.forEach(t => { F.starBurst(t.x, t.y, '#f2c14e', 60, 10, 0.3); }); } };
  M.ticket_ride = { fn: async c => {
    await Promise.all(c.to.map(t => stream(c.from, t, 3, 70, () => fly({ x: c.from.x, y: c.from.y - 30 }, t, 0.3, (cx, k, p) => { cx.translate(p.x, p.y); cx.rotate(Math.atan2(t.y - c.from.y, t.x - c.from.x) + Math.PI / 2); KIT.D.drop({ x: 0, y: 0, vx: 0, vy: 1, r: 6, c: '#bfe6ff' }, 0); }, { linear: true }))));
    c.to.forEach(t => { for (let i = 0; i < 5; i++) { const x = t.x - 50 + i * 24; draw(0.8, (cx, k) => { const fall = Math.min(1, Math.max(0, k * 3 - i * 0.3)); cx.globalAlpha = fade(k); cx.save(); cx.translate(x, t.y + 50); cx.rotate(fall * 1.2); cx.fillStyle = '#f6ecd8'; cx.strokeStyle = K; cx.lineWidth = 1.6; cx.fillRect(-4, -26, 8, 26); cx.strokeRect(-4, -26, 8, 26); cx.restore(); }); } say('偶然', { x: t.x, y: t.y - 76 }, { c: '#bfe6ff', size: 36 }); });
    await wait(400);
  } };

  /* ---------- Scary Monsters (Diego, Ferdinand) ---------- */
  async function claws(c, big) {
    c.to.forEach(t => { for (let i = 0; i < 3; i++) setTimeout(() => draw(0.5, (cx, k) => { const pr = Math.min(1, k * 3); cx.globalAlpha = fade(k, 0.4); const x0 = t.x - 50 + i * 26, y0 = t.y - 60; ink(cx, q => { q.moveTo(x0, y0); q.quadraticCurveTo(x0 + 40, t.y, x0 + 20 + 50 * pr, y0 + 130 * pr); }, '#fff', big ? 7 : 5, '#c8323c'); }), i * 40 / spd()); setTimeout(() => F.blood(t.x, t.y, 10), 140 / spd()); });
    say('ガアアッ', { x: c.t0.x, y: c.t0.y - 80 }, { c: '#8adf6a', size: 40 }); snd('hit');
    await wait(260);
  }
  M.raptor_claw = M.raptor_rake = { fn: c => claws(c, false) };
  M.primal_surge = { fn: c => claws(c, true) };
  M.dino_pack = { fn: async c => {
    const dir = c.from.x < innerWidth / 2 ? 1 : -1, n = 5 + c.power;
    for (let i = 0; i < n; i++) { const y = c.from.y + rnd(-40, 60), el = dom('sfx-raptor', raptorSvg(), { x: c.from.x, y }, 900, { '--flip': dir }); setTimeout(() => moveEl(el, { x: c.from.x + dir * rnd(300, 600), y: y + rnd(-20, 20) }, 700), 20); }
    say('ギャアア', { x: c.from.x + dir * 80, y: c.from.y - 90 }, { c: '#8adf6a', size: 36 }); snd('hit');
    await wait(600);
  } };
  const raptorSvg = () => `<svg viewBox="0 0 60 40"><path d="M4 24q10-10 24-8l10-8q8-4 14 0l6 4-6 3-6-1-4 6q8 6 6 16h-5l-3-8-10 2-2 8h-5l1-10q-12 0-20-4z" fill="#6aa04a" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="46" cy="10" r="1.8" fill="${K}"/></svg>`;
  async function reptileEye(c, line = '動体視力') {
    dom('sfx-eye reptile', `<svg viewBox="0 0 120 60"><path d="M4 30Q60-14 116 30Q60 74 4 30z" fill="#e8d84a" stroke="${K}" stroke-width="4"/><ellipse cx="60" cy="30" rx="5" ry="22" fill="${K}"/></svg>`, { x: c.from.x, y: c.from.y - 100 }, 1000);
    say(line, { x: c.from.x + 60, y: c.from.y - 140 }, { c: '#8adf6a', size: 28, ms: 1000 });
    c.to.forEach(t => { for (let i = 1; i <= 3; i++) draw(0.7, (cx, k) => { cx.globalAlpha = (1 - k) * 0.35; cx.strokeStyle = '#8adf6a'; cx.lineWidth = 2; cx.strokeRect(t.x - 40 - i * 10 * k, t.y - 50, 80, 100); }); });
    await wait(600);
  }
  M.kinetic_vision = { fn: c => reptileEye(c) };

  /* ---------- crafted Stand powers (the enemy Stands' techniques) ---------- */
  async function ironSand(c) {
    c.to.forEach(t => { for (let i = 0; i < 26; i++) { const a0 = rnd(0, TAU), r0 = rnd(80, 150); KIT.add({ x: t.x, y: t.y, r: rnd(1.5, 3.2), c: i % 3 ? '#4a4a5a' : '#8a8a9a', rot: 0, life: 0.7, draw: KIT.D.square, update: (p, dt, k) => { const r = r0 * (1 - ease(k)), a = a0 + k * 6; p.x = t.x + Math.cos(a) * r; p.y = t.y + Math.sin(a) * r * 0.7; p.rot += dt * 9; } }); } say('ズズズ', { x: t.x, y: t.y - 76 }, { c: '#9aa8c8', size: 34 }); });
    await wait(480);
    c.to.forEach(t => { F.debris(t.x, t.y, '#6a7a9a', 10); F.ring(t.x, t.y, '#9aa8c8', 60, 6, 0.4, 60); });
    snd('block'); await wait(120);
  }
  async function pinTrap(c) {
    await Promise.all(c.to.map(t => KIT.projectile('pin', c.from, t)));
    c.to.forEach(t => say('ピン', { x: t.x, y: t.y - 60 }, { c: '#f2c14e', size: 30 }));
    await wait(220);
    c.to.forEach((t, i) => setTimeout(() => { F.boom(t.x, t.y); }, i * 70 / spd())); snd('boom');
    await wait(200);
  }
  async function wired(c) {
    c.to.forEach((t, j) => { const x = t.x + rnd(-10, 10); draw(0.9, (cx, k) => { const down = ease(Math.min(1, k * 3)), up = k > 0.55 ? (k - 0.55) / 0.45 : 0, y = -20 + (t.y - 20 + 20) * down - up * 60; cx.globalAlpha = fade(k, 0.8); cx.strokeStyle = '#d8d8e8'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, y); cx.stroke(); cx.save(); cx.translate(x, y); hookShape(cx, 14); cx.restore(); }); });
    say('ワイヤード', { x: c.t0.x, y: c.t0.y - 110 }, { c: '#d8d8e8', size: 30 }); snd('whistle');
    await wait(420);
    c.to.forEach(t => { F.blood(t.x, t.y - 20, 6); jolt(t, [{ transform: 'translate(0,0)' }, { transform: 'translate(0,-34px)', offset: 0.4 }, { transform: 'translate(0,0)' }], 520); say('グイッ', { x: t.x + 40, y: t.y - 60 }, { c: '#d8d8e8', size: 30 }); });
    await wait(260);
  }
  async function rainBlades(c) {
    const drops = [];
    c.to.forEach(t => { for (let i = 0; i < 18; i++) drops.push({ t, x: t.x + rnd(-80, 80), y0: t.y - rnd(260, 360), y1: t.y + rnd(-90, 40) }); });
    screen('rain', 1300);
    say('キャッチ・ザ・レインボー', { x: c.from.x, y: c.from.y - 100 }, { c: '#bfe6ff', size: 26, ms: 1100 });
    let hold = true, relK = null;
    drops.forEach(d => { d.st = rnd(0, 0.6); });
    draw(1.3, (cx, k) => {
      const fall = Math.min(1, k * 2.8);
      drops.forEach(d => {
        let x = d.x, y = d.y0 + (d.y1 - d.y0) * fall, ang = Math.PI / 2;
        if (!hold) { if (relK === null) relK = k; const u = Math.min(1, Math.max(0, (k - relK) * 6 - d.st)); x = d.x + (d.t.x - d.x) * u; y = d.y1 + (d.t.y - d.y1) * u; ang = Math.atan2(d.t.y - d.y1, d.t.x - d.x); if (u >= 1) return; }
        cx.save(); cx.translate(x, y); cx.rotate(ang - Math.PI / 2); cx.fillStyle = hold && fall >= 1 ? '#e8f6ff' : '#9fc7e8'; cx.strokeStyle = K; cx.lineWidth = 1.3;
        cx.beginPath(); cx.moveTo(0, 9); cx.quadraticCurveTo(4, 0, 0, -5); cx.quadraticCurveTo(-4, 0, 0, 9); cx.fill(); cx.stroke();
        if (hold && fall >= 1 && Math.sin(k * 40 + x) > 0.8) { cx.strokeStyle = '#fff'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(-6, 0); cx.lineTo(6, 0); cx.moveTo(0, -6); cx.lineTo(0, 6); cx.stroke(); }
        cx.restore();
      });
    });
    snd('miss'); await wait(560);
    say('ピタッ', { x: c.t0.x + 50, y: c.t0.y - 120 }, { c: '#e8f6ff', size: 34 });
    await wait(200);
    hold = false; snd('hit');
    await wait(220);
    c.to.forEach(t => { F.shards(t.x, t.y, '#bfe6ff', 12, 280); F.blood(t.x, t.y, 8); F.slash(t.x, t.y, '#e8f6ff', 3, 50); say('ザシュッ', { x: t.x, y: t.y - 70 }, { c: '#bfe6ff', size: 34 }); });
    await wait(160);
  }
  async function soundLetters(c, word = 'ドゴォォン') {
    const chars = [...word];
    say('イン・ア・サイレント・ウェイ', { x: c.from.x, y: c.from.y - 100 }, { c: '#e8508a', size: 22 });
    await Promise.all(c.to.map(t => stream(c.from, t, Math.min(chars.length, 3 + c.power), 60, i => new Promise(res => {
      const el = dom('sfx-3d', chars[i % chars.length], { x: c.from.x, y: c.from.y - 20 }, 900, { '--rot': rnd(-20, 20) + 'deg' });
      requestAnimationFrame(() => { moveEl(el, { x: t.x + rnd(-30, 30), y: t.y + rnd(-30, 20) }, 280); });
      setTimeout(() => { if (el) el.classList.add('hit'); F.starBurst(t.x, t.y, '#e8508a', 50, 10, 0.25); F.ring(t.x, t.y, '#e8508a', 60, 5, 0.4); res(); }, 290 / spd());
    }))));
    c.to.forEach(t => { F.boom(t.x, t.y); }); snd('boom'); shake(true);
    await wait(180);
  }
  async function stamp(c) {
    await Promise.all(c.to.map(t => fly(c.from, t, 0.3, (cx, k, p) => { cx.font = '900 30px "Noto Sans JP", sans-serif'; cx.textAlign = 'center'; cx.lineWidth = 5; cx.strokeStyle = K; cx.fillStyle = '#e8508a'; cx.strokeText('ジュウ', p.x, p.y); cx.fillText('ジュウ', p.x, p.y); }, { arc: -60 })));
    c.to.forEach(t => { dom('sfx-sticker', 'ジュウ', { x: t.x + rnd(-20, 20), y: t.y + rnd(-20, 10) }, 1100, { '--rot': rnd(-20, 20) + 'deg' }); F.flames(t.x, t.y, 8, 20, -100, 16); });
    snd('hit'); await wait(300);
  }
  async function century(c) {
    const o = c.from;
    say('ガキィン!', { x: o.x, y: o.y - 100 }, { c: '#c8b070', size: 44, cls: 'big' }); snd('block');
    for (let i = 0; i < 8; i++) { const a = i * TAU / 8; draw(1, (cx, k) => { const e = ease(Math.min(1, k * 3)); cx.globalAlpha = fade(k, 0.8); const r = 110 - e * 60; cx.save(); cx.translate(o.x + Math.cos(a) * r, o.y + Math.sin(a) * r * 0.8); cx.rotate(a + Math.PI / 2); cx.fillStyle = '#a89868'; cx.strokeStyle = K; cx.lineWidth = 2; cx.beginPath(); for (let j = 0; j < 6; j++) { const b = j * TAU / 6; cx.lineTo(Math.cos(b) * 16, Math.sin(b) * 16); } cx.closePath(); cx.fill(); cx.stroke(); cx.restore(); }); }
    await wait(360);
    KIT.hexShield(o.x, o.y, '#c8b070', 80);
    KIT.arrows(o.x, o.y + 40, '#c8b070', false, 3);
    say('20th Century BOY', { x: o.x, y: o.y + 70 }, { c: '#e8d8a0', size: 22 });
    await wait(360);
  }
  async function grid(c, lock) {
    const L0 = c.to.length ? mid(c.to) : c.from;
    const cols = 'ABCDEF', cells = 6, cw = 44;
    const ox = L0.x - cw * 3, oy = L0.y + 20;
    let hit = null;
    draw(1.3, (cx, k) => {
      const e = ease(Math.min(1, k * 3)); cx.globalAlpha = fade(k, 0.8);
      cx.save(); cx.translate(L0.x, oy); cx.transform(1, 0, -0.35, 0.45, 0, 0); cx.translate(-L0.x, -oy);
      cx.fillStyle = 'rgba(40,20,10,.45)'; cx.fillRect(ox, oy, cells * cw, cells * cw * e); cx.strokeStyle = K; cx.lineWidth = 6; cx.strokeRect(ox, oy, cells * cw, cells * cw * e); cx.strokeStyle = '#ff9a4a'; cx.lineWidth = 3;
      for (let i = 0; i <= cells; i++) { cx.beginPath(); cx.moveTo(ox + i * cw, oy); cx.lineTo(ox + i * cw, oy + cells * cw * e); cx.stroke(); cx.beginPath(); cx.moveTo(ox, oy + i * cw * e); cx.lineTo(ox + cells * cw, oy + i * cw * e); cx.stroke(); }
      if (hit) { cx.fillStyle = 'rgba(232,116,42,.5)'; cx.fillRect(ox + hit[0] * cw, oy + hit[1] * cw, cw, cw); }
      cx.fillStyle = '#fff3d0'; cx.font = 'bold 14px Oswald, sans-serif'; cx.textAlign = 'center';
      for (let i = 0; i < cells; i++) { cx.fillText(cols[i], ox + i * cw + cw / 2, oy - 6); cx.fillText(String(i + 1), ox - 12, oy + i * cw * e + cw / 2); }
      cx.restore();
    });
    say('チョコレイト・ディスコ', { x: c.from.x, y: c.from.y - 100 }, { c: '#e8742a', size: 24 }); snd('block');
    await wait(360);
    hit = [4, 4];
    if (!lock) {
      say('F-5!', { x: L0.x + 60, y: L0.y - 110 }, { c: '#e8742a', size: 44, cls: 'big' });
      await Promise.all(c.to.map(t => fly({ x: t.x, y: t.y - 280 }, t, 0.26, (cx, k, p) => { cx.translate(p.x, p.y); cx.rotate(Math.PI / 2); knife(cx, 16); }, { linear: true })));
      c.to.forEach(t => { burst(t, '#e8742a', 60); F.blood(t.x, t.y, 6); });
    } else { c.to.forEach(t => { KIT.hexShield(t.x, t.y, '#e8742a', 60); say('ロック', { x: t.x, y: t.y - 70 }, { c: '#e8742a', size: 30 }); }); }
    await wait(220);
  }
  async function balloons(c, self) {
    const tg = self ? [{ x: c.from.x + (c.from.x < innerWidth / 2 ? 120 : -120), y: c.from.y - 30 }] : c.to;
    const els = tg.map((t, i) => dom('sfx-balloon', balloonSvg(), { x: c.from.x, y: c.from.y - 30 }, 1200));
    say('チューブラー・ベルズ', { x: c.from.x, y: c.from.y - 100 }, { c: '#d8d8e8', size: 24 });
    await wait(60);
    els.forEach((el, i) => moveEl(el, { x: tg[i].x, y: tg[i].y - 20 }, 560));
    await wait(580);
    if (!self) { els.forEach(el => el && el.remove()); tg.forEach(t => { F.starBurst(t.x, t.y, '#fff', 50, 12, 0.25); say('パンッ', { x: t.x, y: t.y - 60 }, { c: '#d8d8e8', size: 34 }); draw(0.6, (cx, k) => { cx.globalAlpha = fade(k); cx.save(); cx.translate(t.x, t.y); cx.rotate(-0.6); cx.fillStyle = '#9aa0b0'; cx.strokeStyle = K; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(-24, -3); cx.lineTo(20, -2); cx.lineTo(28, 0); cx.lineTo(20, 2); cx.lineTo(-24, 3); cx.closePath(); cx.fill(); cx.stroke(); cx.fillRect(-28, -6, 5, 12); cx.restore(); }); F.blood(t.x, t.y, 8); }); snd('hit'); }
    await wait(200);
  }
  const balloonSvg = () => `<svg viewBox="0 0 80 60"><defs><linearGradient id="bl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#b8bcc8"/><stop offset="1" stop-color="#6a6e7a"/></linearGradient></defs><g fill="url(#bl)" stroke="${K}" stroke-width="2.4"><ellipse cx="38" cy="30" rx="18" ry="9"/><ellipse cx="62" cy="20" rx="9" ry="8"/><ellipse cx="72" cy="22" rx="7" ry="4"/><ellipse cx="24" cy="46" rx="4" ry="10"/><ellipse cx="50" cy="46" rx="4" ry="10"/><ellipse cx="14" cy="22" rx="8" ry="3.5" transform="rotate(-35 14 22)"/><ellipse cx="60" cy="10" rx="3" ry="6"/></g><circle cx="64" cy="18" r="1.6" fill="${K}"/></svg>`;
  async function civilWar(c) {
    screen('guilt', 1300);
    say('シビル・ウォー', { x: c.from.x, y: c.from.y - 100 }, { c: '#c8506a', size: 28 });
    c.to.forEach(t => {
      for (let i = 0; i < 3 + (c.power >> 1); i++) { const x0 = t.x + rnd(-70, 70); draw(1.1, (cx, k) => { const e = ease(Math.min(1, k * 1.5)); cx.globalAlpha = fade(k, 0.7) * 0.8; cx.save(); cx.translate(x0 + (t.x - x0) * e * 0.8, t.y + 70 - e * 60); ghostShape(cx, 18 + i * 2, 'rgba(90,30,50,.75)'); cx.restore(); }); }
      draw(1.1, (cx, k) => { if (k < 0.35) return; const u = (k - 0.35) / 0.65; cx.globalAlpha = (1 - u * 0.6) * 0.55; cx.fillStyle = '#c8a0b0'; cx.strokeStyle = K; cx.lineWidth = 2; cx.beginPath(); cx.ellipse(t.x, t.y, 64 - u * 30, 76 - u * 34, 0, 0, TAU); cx.fill(); cx.stroke(); });
      setTimeout(() => say('罪', { x: t.x, y: t.y - 90 }, { c: '#e86a8a', size: 48, cls: 'big' }), 360 / spd());
    });
    snd('debuff'); await wait(900);
  }
  async function mandom(c) {
    screen('sepia rewind', 1300); snd('rewind');
    dom('sfx-watch', `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#f6ecd8" stroke="${K}" stroke-width="6"/><circle cx="50" cy="50" r="38" fill="none" stroke="#c8a060" stroke-width="3"/>${[...Array(12)].map((_, i) => `<path d="M50 ${i % 3 ? 14 : 12}V${i % 3 ? 20 : 24}" stroke="${K}" stroke-width="${i % 3 ? 2 : 4}" transform="rotate(${i * 30} 50 50)"/>`).join('')}<path class="hand" d="M50 50V16" stroke="#c8323c" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="50" r="4" fill="${K}"/><rect x="42" y="-2" width="16" height="10" rx="3" fill="#c8a060" stroke="${K}" stroke-width="3"/></svg><b>6秒</b>`, { x: c.from.x, y: c.from.y - 110 }, 1200);
    say('マンダム', { x: c.from.x + 80, y: c.from.y - 150 }, { c: '#c8a0ff', size: 30, ms: 1100 });
    await wait(900);
  }
  async function d4cFlag(c, summon) {
    const o = c.from;
    const fl = dom('sfx-flag', flagSvg(), { x: o.x, y: o.y - 10 }, 1300);
    say('どジャアアァーン', { x: o.x, y: o.y - 120 }, { c: '#fff', size: 36, cls: 'big', ms: 1200 }); snd('d4c');
    await wait(420);
    if (summon) { const dir = o.x < innerWidth / 2 ? 1 : -1; for (let i = 1; i <= 2; i++) { const g = standAt('d4c', { x: o.x + dir * i * 70, y: o.y - 10 }, { cls: 'ghost solid', size: 130, color: '#8ab0ff', flip: dir < 0 }); setTimeout(() => gone(g), 700 / spd()); } say('並行世界', { x: o.x + dir * 100, y: o.y - 60 }, { c: '#8ab0ff', size: 30 }); }
    else jolt(o, [{ opacity: 0 }, { opacity: -1, offset: 0.3 }, { opacity: -1, offset: 0.6 }, { opacity: 0 }], 700);
    await wait(520); fl && fl.classList.add('out');
  }
  const flagSvg = () => `<svg viewBox="0 0 150 100"><path class="pole" d="M6 2V100" stroke="${K}" stroke-width="5"/><g class="cloth"><path d="M8 6h136v74H8z" fill="#f6ecd8" stroke="${K}" stroke-width="3"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="8" y="${6 + i * 10.6}" width="136" height="5.3" fill="#c8323c"/>`).join('')}<rect x="8" y="6" width="58" height="37" fill="#2a4a9a" stroke="${K}" stroke-width="2"/>${[...Array(12)].map((_, i) => `<circle cx="${15 + (i % 4) * 14}" cy="${13 + Math.floor(i / 4) * 11}" r="2.2" fill="#fff"/>`).join('')}</g></svg>`;
  async function loveTrain(c, wall) {
    const o = c.from;
    screen('light', 1300); snd('d4c');
    lightRays(o, 1.1, 18);
    say('ラブトレイン', { x: o.x, y: o.y - 110 }, { c: '#fff8d0', size: 32 });
    await wait(300);
    if (wall) {
      const xs = c.to.map(t => t.x), x0 = Math.min(...xs) - 80, x1 = Math.max(...xs) + 80;
      draw(0.8, (cx, k) => { const x = x0 + (x1 - x0) * Math.min(1, k * 1.8); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = fade(k, 0.6); const g = cx.createLinearGradient(x - 30, 0, x + 30, 0); g.addColorStop(0, 'rgba(255,250,220,0)'); g.addColorStop(0.5, '#fffbe8'); g.addColorStop(1, 'rgba(255,250,220,0)'); cx.fillStyle = g; cx.fillRect(x - 30, 0, 60, innerHeight); });
      await wait(360);
      c.to.forEach(t => { F.slash(t.x, t.y, '#fffbe8', 2, 60); F.starBurst(t.x, t.y, '#fffbe8', 60, 14, 0.3); });
    } else {
      await Promise.all(c.to.map(t => stream(o, t, 6 + c.power, 40, () => { const s = { x: o.x + rnd(-40, 40), y: o.y + rnd(-60, 40) }; return fly(s, t, 0.3, (cx, k, p) => { cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillStyle = K; cx.strokeStyle = '#fffbe8'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(8, 0); cx.lineTo(-4, 5); cx.lineTo(-2, -6); cx.closePath(); cx.fill(); cx.stroke(); }, { spin: 12, arc: rnd(-60, 60) }); })));
      c.to.forEach(t => { F.lightning({ x: t.x, y: t.y - 200 }, t, '#f6ecd8'); F.starBurst(t.x, t.y, '#1a1020', 50, 10, 0.3); say('不幸', { x: t.x, y: t.y - 76 }, { c: '#fffbe8', size: 36 }); });
    }
    await wait(180);
  }
  async function accelerate(c) {
    screen('accel', 1300);
    title('メイド・イン・ヘブン', 'TIME ACCELERATES', '#e8f0ff', 1100);
    F.clock(c.from.x, c.from.y, '#e8f0ff', 100, 1.1);
    for (let i = 0; i < 4; i++) setTimeout(() => draw(0.4, (cx, k) => { cx.globalAlpha = 1 - k; const x = innerWidth * (k * 1.4 - 0.2), y = innerHeight * 0.18 + Math.sin(k * Math.PI) * -60; cx.fillStyle = i % 2 ? '#e8f0ff' : '#ffd84a'; cx.strokeStyle = K; cx.lineWidth = 2; cx.beginPath(); cx.arc(x, y, 16, 0, TAU); cx.fill(); cx.stroke(); }), i * 200 / spd());
    c.to.forEach(t => F.speedLines(t.x, t.y, '#e8f0ff', 200, 30));
    await wait(900);
  }
  async function knifeVolley(c) {
    await timeStop(c, 'theworld', '#f2c14e', 'ザ・ワールド', 'THE WORLD · KNIVES', true);
  }
  async function zaWarudo(c) {
    await timeStop(c, 'theworld', '#f2c14e', 'ザ・ワールド!', 'ZA WARUDO', c.power < 3);
    if (c.power >= 3) { const t = c.t0; const rr = dom('sfx-roller', rollerSvg(), { x: t.x, y: -120 }, 900); await wait(30); moveEl(rr, { x: t.x, y: t.y - 30 }, 260); await wait(270); F.boom(t.x, t.y); say('ロードローラーだッ!', { x: t.x, y: t.y - 120 }, { c: '#f2c14e', size: 40, cls: 'big' }); shake(true); await wait(300); }
  }
  const rollerSvg = () => `<svg viewBox="0 0 120 90"><rect x="10" y="10" width="80" height="44" rx="6" fill="#e8c84a" stroke="${K}" stroke-width="4"/><rect x="60" y="0" width="30" height="24" fill="#c8a830" stroke="${K}" stroke-width="4"/><rect x="4" y="50" width="112" height="36" rx="18" fill="#6a6a7a" stroke="${K}" stroke-width="4"/><text x="50" y="40" font-family="Oswald" font-size="14" font-weight="700" text-anchor="middle" fill="${K}">ROAD ROLLER</text></svg>`;

  Object.assign(M, {
    iron_sand: { fn: ironSand }, plant_pin: { fn: pinTrap }, hook_reel: { fn: wired }, raindrop_blades: { kana: 'キャッチ・ザ・レインボー', fn: rainBlades },
    sound_stamp: { fn: stamp }, kneel: { fn: century }, grid_teleport: { fn: c => grid(c, false) }, balloon_needle: { fn: c => balloons(c, false) },
    transfer_sin: { fn: civilWar }, sb_accelerate: { fn: accelerate }, sb_zawarudo: { key: 'theworld', kana: 'ザ・ワールド', fn: zaWarudo },
  });

  /* ---------- enemy moves, by name ---------- */
  const N = {
    // Mandom (Ringo)
    "duelist's calm": { fn: mandom }, 'mandom': { fn: mandom },
    // Catch the Rainbow (Blackmore)
    'catch the rainbow': { fn: async c => { screen('rain', 1100); c.to.forEach(t => { for (let i = 0; i < 14; i++) { const x = t.x + rnd(-90, 90), y = t.y + rnd(-120, 60); draw(1, (cx, k) => { cx.globalAlpha = fade(k); const yy = y - 200 * Math.max(0, 1 - k * 3); cx.save(); cx.translate(x, yy); cx.fillStyle = k > 0.33 ? '#e8f6ff' : '#9fc7e8'; cx.strokeStyle = K; cx.lineWidth = 1.3; cx.beginPath(); cx.moveTo(0, 9); cx.quadraticCurveTo(4, 0, 0, -5); cx.quadraticCurveTo(-4, 0, 0, 9); cx.fill(); cx.stroke(); cx.restore(); }); } }); say('ピタッ', { x: c.from.x, y: c.from.y - 100 }, { c: '#e8f6ff', size: 36 }); snd('miss'); await wait(700); } },
    'raindrop blades': { fn: rainBlades }, 'rain stop': { fn: rainBlades }, 'frozen drops': { fn: rainBlades },
    // In a Silent Way (Sandman)
    'sound stamp': { fn: stamp }, 'dogooon': { fn: c => soundLetters(c, 'ドゴォォン') }, 'speaking stones': { fn: async c => { say('ヒュウウ', { x: c.from.x, y: c.from.y - 90 }, { c: '#e8508a', size: 32 }); for (let i = 0; i < 3; i++) setTimeout(() => F.ring(c.from.x, c.from.y, '#e8508a', 50 + i * 26, 4, 0.5), i * 100 / spd()); await wait(400); } },
    // 20th Century Boy (Magent)
    '20th century boy': { fn: century },
    // Civil War (Axl RO)
    'civil war': { fn: civilWar }, 'burden of sin': { fn: civilWar }, 'cleansing water': { fn: async c => { c.to.forEach(t => { KIT.bubbles(t.x, t.y, '#9fd0f0', 12); for (let i = 0; i < 16; i++) KIT.add({ x: t.x + rnd(-30, 30), y: t.y - 80, vx: rnd(-60, 60), vy: rnd(40, 160), g: 700, r: rnd(3, 6), c: '#9fd0f0', life: 0.7, draw: KIT.D.drop }); }); say('ザバァ', { x: c.from.x, y: c.from.y - 90 }, { c: '#9fd0f0', size: 36 }); await wait(400); } },
    // Chocolate Disco (D-I-S-C-O)
    'grid teleport': { fn: c => grid(c, false) }, 'grid lock': { fn: c => grid(c, true) }, 'chocolate disco': { fn: c => grid(c, true) },
    // Tubular Bells (Mike O.)
    'balloon animals': { fn: c => balloons(c, true) },
    // Tomb of the Boom (Boom Boom family)
    'magnetize': { fn: ironSand }, 'magnetic crush': { fn: ironSand }, 'iron sand clamp': { fn: ironSand }, 'magnetic pull': { fn: ironSand }, 'iron filings': { fn: ironSand }, 'scrap barrage': { fn: ironSand },
    // Wired (Pork Pie Hat Kid)
    'wired hook': { fn: wired }, 'hooks in the rock': { fn: wired },
    // Boku no Rhythm (Oyecomova)
    'press pin': { fn: pinTrap }, 'trap detonation': { fn: pinTrap }, 'pin the whole village': { fn: pinTrap },
    // Wrecking Ball (Wekapipo)
    'wrecking ball': { fn: c => wrecking(c, false) }, 'left side crush': { fn: c => wrecking(c, true) }, 'satellite spheres': { fn: c => wrecking(c, false) },
    // Scary Monsters
    'raptor slash': { fn: c => claws(c, false) }, 'raptor pounce': { fn: c => claws(c, true) }, 'call the pack': { fn: M.dino_pack.fn }, 'kinetic dodge': { fn: c => reptileEye(c, '見えるぞ') },
    'infection': { fn: async c => { c.to.forEach(t => { for (let i = 0; i < 10; i++) { const x = t.x + rnd(-36, 36), y = t.y + rnd(-40, 40); draw(0.9, (cx, k) => { cx.globalAlpha = fade(k) * Math.min(1, k * 4); cx.fillStyle = '#6aa04a'; cx.strokeStyle = K; cx.lineWidth = 1.2; cx.beginPath(); for (let j = 0; j < 6; j++) { const b = j * TAU / 6; cx.lineTo(x + Math.cos(b) * 6, y + Math.sin(b) * 6); } cx.closePath(); cx.fill(); cx.stroke(); }); } say('恐竜化', { x: t.x, y: t.y - 76 }, { c: '#8adf6a', size: 34 }); }); snd('debuff'); await wait(500); } },
    'scary monsters': { fn: c => reptileEye(c, 'スケアリー・モンスターズ') },
    // D4C / Love Train (Valentine)
    'parallel summons': { fn: c => d4cFlag(c, true) }, 'between the flags': { fn: c => d4cFlag(c, false) },
    'd4c barrage': { key: 'd4c', color: '#6a8ad8', fn: c => barrage(Object.assign({}, c, { key: 'd4c' }), STYLE.d4c.style(c)) },
    'misfortune stream': { fn: c => loveTrain(c, false) }, 'light wall slash': { fn: c => loveTrain(c, true) },
    // THE WORLD (Diego from another world)
    'muda muda': { key: 'theworld', color: '#f2c14e', fn: c => barrage(Object.assign({}, c, { key: 'theworld' }), STYLE.theworld.style(c)) },
    'knife volley': { fn: knifeVolley }, 'za warudo': { fn: zaWarudo },
  };
  const NAMED = {}; for (const k in N) NAMED[norm(k)] = N[k];
  // every party move also answers to its display name, so enemies sharing a technique get the same look
  const MOVES = M;
  try { for (const id in M) { const a = SBR.ABILITIES && SBR.ABILITIES[id]; if (a && a.name && !NAMED[norm(a.name)]) NAMED[norm(a.name)] = M[id]; } } catch (e) { /* data not loaded */ }

  /** run a move directly, e.g. for the compendium or tests: play('ora_rush', from, [to], { tier, lvl, via:'rush', key }) */
  async function play(id, from, tos, o = {}) {
    const def = MOVES[id] || NAMED[norm(id)];
    if (!def || !def.fn) return false;
    const c = ctxOf(from, tos, o, o.via || 'fx', def, { key: o.key || def.key });
    if (def.color) c.color = def.color;
    if (c.via === 'rush' && !c.key) c.key = def.key;
    await def.fn(c);
    return true;
  }
  /** swap a drawn Stand element's SVG for a registered sprite sheet (used by strike.js barrages) */
  function applySprite(el, key, anim) { const sp = spriteFor(key, anim); if (!el || !sp) return false; el.innerHTML = ''; el.style.backgroundRepeat = 'no-repeat'; playSprite(el, sp); return true; }
  return { MOVES, NAMED, STYLE, sprites, loadSprites, applySprite, lookup, rush, play, list: () => ({ moves: Object.keys(MOVES), named: Object.keys(NAMED), styles: Object.keys(STYLE) }) };
})();
