/* VFX engine: canvas particles + drawn strokes for every move, hit and damage-over-time tick */
'use strict';
SBR.fx = (() => {
  const INK = '#1a1020';
  let cv, ctx, W = 0, H = 0, running = false;
  const parts = [];
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const spd = () => SBR.settings.speed || 1;
  const reduced = () => SBR.settings.reducedMotion;

  function init() {
    if (cv) return;
    cv = document.createElement('canvas');
    cv.className = 'fx-canvas';
    document.getElementById('fx-layer').appendChild(cv);
    ctx = cv.getContext('2d');
    const rs = () => { const d = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(d, 0, 0, d, 0, 0); };
    rs();
    window.addEventListener('resize', rs);
  }
  function add(p) { init(); if (reduced() && parts.length > 60) return; p.t = 0; p.life = (p.life || 0.8) * (p.done ? 1 : 1.35); p.sp = p.done ? spd() : Math.sqrt(spd()); parts.push(p); if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); } return p; }
  let last = 0;
  function loop(now) {
    const rdt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      const dt = rdt * p.sp;
      p.t += dt;
      const k = p.t / p.life;
      if (k >= 1) { parts.splice(i, 1); if (p.done) p.done(); continue; }
      if (p.update) p.update(p, dt, k);
      else {
        p.vx *= p.drag || 0.98; p.vy = p.vy * (p.drag || 0.98) + (p.g || 0) * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; if (p.rot != null) p.rot += (p.vr || 0) * dt;
      }
      ctx.save();
      p.draw(p, k);
      ctx.restore();
    }
    if (parts.length) requestAnimationFrame(loop); else { running = false; ctx.clearRect(0, 0, W, H); }
  }

  /* ---------- particle drawers ---------- */
  const D = {
    spark: (p, k) => { ctx.globalAlpha = 1 - k; ctx.strokeStyle = p.c; ctx.lineWidth = p.w || 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); ctx.stroke(); },
    dot: (p, k) => { ctx.globalAlpha = 1 - k * k; ctx.fillStyle = p.c; ctx.strokeStyle = INK; ctx.lineWidth = p.ink ? 1.5 : 0; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (p.shrink ? 1 - k : 1), 0, TAU); ctx.fill(); if (p.ink) ctx.stroke(); },
    drop: (p, k) => { ctx.globalAlpha = 1 - k; ctx.fillStyle = p.c; ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx) - Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, -p.r * 2); ctx.quadraticCurveTo(p.r, 0, 0, p.r); ctx.quadraticCurveTo(-p.r, 0, 0, -p.r * 2); ctx.fill(); ctx.stroke(); },
    square: (p, k) => { ctx.globalAlpha = 1 - k; ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c; ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2); ctx.strokeRect(-p.r, -p.r, p.r * 2, p.r * 2); },
    smoke: (p, k) => { ctx.globalAlpha = (1 - k) * (p.a || 0.5); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + k * 1.6), 0, TAU); ctx.fill(); },
    star: (p, k) => { ctx.globalAlpha = 1 - k; ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0); ctx.fillStyle = p.c; ctx.strokeStyle = INK; ctx.lineWidth = 1.4; const r = p.r * (p.grow ? 0.4 + k : 1); ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.35 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke(); },
    ring: (p, k) => { const e = 1 - Math.pow(1 - k, 3); ctx.globalAlpha = 1 - k; ctx.strokeStyle = p.c; ctx.lineWidth = (p.w || 6) * (1 - k * 0.7); ctx.beginPath(); ctx.arc(p.x, p.y, (p.r0 || 4) + (p.r - (p.r0 || 4)) * e, 0, TAU); ctx.stroke(); },
    burst: (p, k) => { const e = 1 - Math.pow(1 - k, 2); ctx.globalAlpha = 1 - k; ctx.translate(p.x, p.y); ctx.fillStyle = p.c; ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); const n = p.n || 12; for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n + (p.rot || 0); const rr = (i % 2 ? p.r * 0.45 : p.r) * (0.3 + e * 0.9); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke(); },
    lines: (p, k) => { ctx.globalAlpha = (1 - k) * 0.9; ctx.strokeStyle = p.c; ctx.lineWidth = 3; for (let i = 0; i < p.n; i++) { const a = p.seed[i]; const r1 = p.r * (0.3 + k * 0.6), r2 = r1 + p.r * 0.5; ctx.beginPath(); ctx.moveTo(p.x + Math.cos(a) * r1, p.y + Math.sin(a) * r1); ctx.lineTo(p.x + Math.cos(a) * r2, p.y + Math.sin(a) * r2); ctx.stroke(); } },
    slash: (p, k) => {
      const prog = Math.min(1, k * 2.5), fade = k < 0.4 ? 1 : 1 - (k - 0.4) / 0.6;
      ctx.globalAlpha = fade; ctx.lineCap = 'round';
      for (const [lw, col] of [[p.w + 5, INK], [p.w, p.c], [p.w * 0.35, '#fff']]) {
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, p.a0, p.a0 + (p.a1 - p.a0) * prog, p.ccw); ctx.stroke();
      }
    },
    spiral: (p, k) => {
      const prog = Math.min(1, k * 1.6), fade = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
      ctx.globalAlpha = fade; ctx.translate(p.x, p.y); ctx.rotate(p.rot0 + k * (p.spin || 2));
      const turns = p.turns || 3, steps = 90;
      for (const [lw, col] of [[p.w + 4, INK], [p.w, p.c]]) {
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath();
        for (let i = 0; i <= steps * prog; i++) { const th = (i / steps) * turns * TAU; const r = p.r * Math.pow(0.618, (turns * TAU - th) / (Math.PI / 2)) ; ctx.lineTo(Math.cos(th) * r, Math.sin(th) * r); }
        ctx.stroke();
      }
    },
    goldrect: (p, k) => {
      const e = Math.min(1, k * 1.8), fade = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
      ctx.globalAlpha = fade; ctx.translate(p.x, p.y); ctx.rotate(p.rot0 + k * 0.6); ctx.scale(0.4 + e * 0.8, 0.4 + e * 0.8);
      let w = p.r * 1.618, h = p.r, x = -w / 2, y = -h / 2;
      ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(x, y, w, h); ctx.lineWidth = 2; ctx.strokeStyle = p.c; ctx.strokeRect(x, y, w, h);
      ctx.lineWidth = 5; ctx.strokeStyle = p.c; ctx.beginPath();
      for (let i = 0; i < 9; i++) {
        const dir = i % 4; let s0, cx, cy, a0;
        if (dir === 0) { s0 = h; cx = x + s0; cy = y + s0; a0 = Math.PI; x += s0; w -= s0; }
        else if (dir === 1) { s0 = w; cx = x; cy = y + s0; a0 = -Math.PI / 2; y += s0; h -= s0; }
        else if (dir === 2) { s0 = h; cx = x + w - s0; cy = y; a0 = 0; w -= s0; }
        else { s0 = w; cx = x + s0; cy = y + h - s0; a0 = Math.PI / 2; h -= s0; }
        if (s0 < 1) break;
        ctx.moveTo(cx + Math.cos(a0) * s0, cy + Math.sin(a0) * s0);
        ctx.arc(cx, cy, s0, a0, a0 + Math.PI / 2);
      }
      ctx.stroke();
    },
    bolt: (p, k) => { ctx.globalAlpha = 1 - k; ctx.strokeStyle = p.c; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.pts[0][0], p.pts[0][1]); p.pts.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.stroke(); },
    curve: (p, k) => {
      const prog = Math.min(1, k * 2), fade = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
      ctx.globalAlpha = fade; ctx.lineCap = 'round';
      const q = t => { const a = 1 - t; return [a * a * p.a[0] + 2 * a * t * p.c1[0] + t * t * p.b[0], a * a * p.a[1] + 2 * a * t * p.c1[1] + t * t * p.b[1]]; };
      for (const [lw, col] of [[p.w + 4, INK], [p.w, p.c]]) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(p.dash || []); ctx.beginPath(); for (let i = 0; i <= 30 * prog; i++) { const [x, y] = q(i / 30); ctx.lineTo(x, y); } ctx.stroke(); }
    },
    checker: (p, k) => { ctx.globalAlpha = (1 - k) * 0.85; const s = p.s; for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) { ctx.fillStyle = (r + c) & 1 ? p.c : '#f6ecd8'; ctx.fillRect(p.x + c * s - s / 2, p.y + r * s - s / 2, s * (1 - k * 0.5), s * (1 - k * 0.5)); } },
    glyph: (p, k) => { ctx.globalAlpha = 1 - k; ctx.font = `bold ${p.size}px Bangers, Impact`; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.fillStyle = p.c; ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0); ctx.scale(0.6 + k * 0.6, 0.6 + k * 0.6); ctx.strokeText(p.txt, 0, 0); ctx.fillText(p.txt, 0, 0); },
  };

  /* ---------- emitters ---------- */
  const burstOf = (x, y, n, mk) => { for (let i = 0; i < n; i++) add(mk(i)); };
  function sparks(x, y, c = '#fff3a0', n = 14, sp = 7, w = 3) { burstOf(x, y, n, () => { const a = rnd(0, TAU), v = rnd(sp * 30, sp * 70); return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c, w, life: rnd(0.3, 0.6), draw: D.spark, drag: 0.9 }; }); }
  function blood(x, y, n = 10, c = '#c8323c') { burstOf(x, y, n, () => { const a = rnd(-Math.PI, 0), v = rnd(120, 320); return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 900, r: rnd(3, 6), c, life: rnd(0.5, 0.9), draw: D.drop }; }); }
  function debris(x, y, c = '#c8a070', n = 10) { burstOf(x, y, n, () => { const a = rnd(0, TAU), v = rnd(150, 380); return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, g: 800, r: rnd(3, 7), c, rot: rnd(0, TAU), vr: rnd(-10, 10), life: rnd(0.6, 1), draw: D.square }; }); }
  function smoke(x, y, c = '#8a7a9a', n = 8, a = 0.45, rise = -40) { burstOf(x, y, n, () => ({ x: x + rnd(-20, 20), y: y + rnd(-14, 14), vx: rnd(-30, 30), vy: rise + rnd(-20, 20), r: rnd(10, 22), c, a, life: rnd(0.7, 1.2), draw: D.smoke, drag: 0.96 })); }
  function stars(x, y, c = '#f2c14e', n = 8, sp = 200) { burstOf(x, y, n, () => { const a = rnd(0, TAU), v = rnd(sp * 0.4, sp); return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: rnd(5, 10), c, rot: rnd(0, TAU), vr: rnd(-8, 8), life: rnd(0.5, 0.9), draw: D.star, drag: 0.92 }; }); }
  const ring = (x, y, c, r = 80, w = 6, life = 0.5, r0 = 6) => add({ x, y, c, r, w, r0, life, draw: D.ring, update: () => {} });
  const starBurst = (x, y, c = '#fff', r = 60, n = 12, life = 0.35) => add({ x, y, c, r, n, rot: rnd(0, 1), life, draw: D.burst, update: () => {} });
  const speedLines = (x, y, c = '#fff', r = 160, n = 22) => add({ x, y, c, r, n, seed: Array.from({ length: n }, () => rnd(0, TAU)), life: 0.45, draw: D.lines, update: () => {} });
  function slash(x, y, c = '#fff', n = 3, r = 50) {
    for (let i = 0; i < n; i++) setTimeout(() => {
      const a0 = rnd(-2.6, -1.6);
      add({ x: x + (i - 1) * 16, y: y + rnd(-6, 6), r: r + i * 6, a0, a1: a0 + rnd(1.6, 2.2), c, w: 6, life: 0.5, draw: D.slash, update: () => {} });
    }, i * 60 / spd());
  }
  const spiral = (x, y, c = '#f2c14e', r = 90, w = 6, life = 1, turns = 3) => add({ x, y, c, r, w, turns, rot0: rnd(0, TAU), spin: 3, life, draw: D.spiral, update: () => {} });
  const goldRect = (x, y, r = 140, c = '#ffd84a', life = 1.2) => add({ x, y, r, c, rot0: rnd(-0.3, 0.3), life, draw: D.goldrect, update: () => {} });
  const glyph = (x, y, txt, c = '#e8508a', size = 46) => add({ x, y, txt, c, size, rot: rnd(-0.3, 0.3), vx: rnd(-60, 60), vy: -120, drag: 0.95, life: 0.9, draw: D.glyph });
  const checker = (x, y, c = '#3a2a1a', s = 26) => add({ x, y, c, s, life: 0.6, draw: D.checker, update: () => {} });
  function lightning(a, b, c = '#fff3a0') { const pts = [[a.x, a.y]]; for (let i = 1; i < 8; i++) { const t = i / 8; pts.push([a.x + (b.x - a.x) * t + rnd(-18, 18), a.y + (b.y - a.y) * t + rnd(-18, 18)]); } pts.push([b.x, b.y]); add({ pts, c, life: 0.25, draw: D.bolt, update: () => {} }); }

  function flash(color = '#fff', dur = 180) {
    const f = document.createElement('div');
    f.className = 'fx-flash'; f.style.background = color;
    document.getElementById('fx-layer').appendChild(f);
    f.animate([{ opacity: 0.85 }, { opacity: 0 }], { duration: dur / spd(), easing: 'ease-out' }).onfinish = () => f.remove();
  }

  /* ---------- projectiles ---------- */
  function projectile(kind, a, b, opts = {}) {
    return new Promise(res => {
      const dur = (opts.dur || { ball: 0.42, golden: 0.5, nail: 0.26, bullet: 0.14, spray: 0.36, pin: 0.3, magnet: 0.4 }[kind] || 0.3);
      const arc = opts.arc != null ? opts.arc : (kind === 'spray' || kind === 'pin' ? -80 : kind === 'ball' ? -30 : 0);
      const p = {
        x: a.x, y: a.y, life: dur, rot: 0,
        update(p, dt, k) {
          const e = kind === 'bullet' ? k : 1 - Math.pow(1 - k, 2);
          p.px = p.x; p.py = p.y;
          p.x = a.x + (b.x - a.x) * e; p.y = a.y + (b.y - a.y) * e + arc * Math.sin(Math.PI * e);
          p.rot += dt * 30;
          if (kind === 'nail') add({ x: p.x, y: p.y, vx: rnd(-40, 40), vy: rnd(-40, 40), r: rnd(2, 4), c: '#c8a0ff', life: 0.3, draw: D.dot, shrink: true });
          if (kind === 'ball' || kind === 'golden') add({ x: p.x, y: p.y, vx: 0, vy: 0, r: kind === 'golden' ? 12 : 8, c: kind === 'golden' ? 'rgba(255,216,74,.5)' : 'rgba(63,184,169,.45)', life: 0.25, draw: D.dot, shrink: true });
          if (kind === 'magnet') for (let i = 0; i < 2; i++) add({ x: p.x + rnd(-14, 14), y: p.y + rnd(-14, 14), vx: rnd(-20, 20), vy: rnd(-20, 20), r: rnd(1.5, 3), c: '#6a7a9a', rot: 0, vr: 5, life: 0.35, draw: D.square });
        },
        draw(p) {
          ctx.translate(p.x, p.y);
          if (kind === 'nail') { ctx.rotate(p.rot); D.star({ x: 0, y: 0, r: 12, c: '#b070ff', rot: 0 }, 0); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, TAU); ctx.fill(); }
          else if (kind === 'ball' || kind === 'golden') {
            const R = kind === 'golden' ? 18 : 12;
            const g = ctx.createRadialGradient(-R * 0.3, -R * 0.3, 1, 0, 0, R);
            g.addColorStop(0, '#fff'); g.addColorStop(0.5, kind === 'golden' ? '#ffd84a' : '#c8c8d8'); g.addColorStop(1, kind === 'golden' ? '#c88010' : '#6a6a7a');
            ctx.fillStyle = g; ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill(); ctx.stroke();
            ctx.rotate(p.rot * 0.5); ctx.strokeStyle = kind === 'golden' ? '#fff3a0' : '#3fb8a9'; ctx.lineWidth = 2.5;
            for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.ellipse(0, 0, R + 8 + i * 6, (R + 8 + i * 6) * 0.35, i * 1.2, 0, TAU); ctx.stroke(); }
          } else if (kind === 'bullet') {
            ctx.rotate(Math.atan2(b.y - a.y, b.x - a.x));
            const gl = ctx.createLinearGradient(-60, 0, 0, 0); gl.addColorStop(0, 'rgba(255,240,160,0)'); gl.addColorStop(1, '#fff3a0');
            ctx.fillStyle = gl; ctx.fillRect(-60, -2, 60, 4); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill();
          } else if (kind === 'spray') { ctx.fillStyle = '#f09ac0'; ctx.strokeStyle = INK; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(i * -10, Math.sin(i + p.rot) * 5, 8 - i * 2, 0, TAU); ctx.fill(); ctx.stroke(); } }
          else if (kind === 'pin') { ctx.rotate(p.rot * 0.3); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 14); ctx.stroke(); ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill(); ctx.stroke(); }
          else if (kind === 'magnet') { ctx.fillStyle = '#9aa8c8'; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill(); ctx.stroke(); }
        },
        done: res,
      };
      add(p);
    });
  }
  const wait = ms => new Promise(r => setTimeout(r, ms / spd()));

  /* ---------- composite move animations ----------
     play(fx, from, [targets]) → resolves when the projectile lands (impact FX keep playing). */
  async function play(kind, from, tos, meta = {}) {
    init();
    const t0 = tos[0] || from;
    const muzzle = () => { starBurst(from.x + (t0.x > from.x ? 60 : -60), from.y, '#fff3a0', 46, 9, 0.2); smoke(from.x + (t0.x > from.x ? 50 : -50), from.y, '#e8e0d0', 3, 0.35, -20); };
    switch (kind) {
      case 'nail':
        await Promise.all(tos.map(t => projectile('nail', from, t)));
        tos.forEach(t => { ring(t.x, t.y, '#b070ff', 80, 7, 0.5); starBurst(t.x, t.y, '#c8a0ff', 60, 8, 0.3); sparks(t.x, t.y, '#c8a0ff', 18, 7); spiral(t.x, t.y, '#b070ff', 60, 5, 1, 2.5); });
        break;
      case 'gun':
        muzzle();
        await Promise.all(tos.map(t => projectile('bullet', from, t)));
        tos.forEach(t => { sparks(t.x, t.y, '#fff3a0', 18, 9, 3); starBurst(t.x, t.y, '#fff', 54, 10, 0.3); ring(t.x, t.y, '#fff3a0', 60, 5, 0.35); });
        break;
      case 'ball':
        await Promise.all(tos.map(t => projectile('ball', from, t)));
        tos.forEach(t => { ring(t.x, t.y, '#3fb8a9', 100, 8, 0.5); ring(t.x, t.y, '#3fb8a9', 66, 5, 0.6, 20); spiral(t.x, t.y, '#3fb8a9', 55, 5, 0.8, 2); sparks(t.x, t.y, '#e8fffa', 18, 8); debris(t.x, t.y, '#c8c8d8', 7); });
        break;
      case 'golden':
        spiral(from.x, from.y, '#ffd84a', 60, 5, 0.6);
        await Promise.all(tos.map(t => projectile('golden', from, t)));
        tos.forEach(t => { flash('#fff3a0', 160); spiral(t.x, t.y, '#ffd84a', 110, 7, 1.1, 3.4); stars(t.x, t.y, '#ffd84a', 14, 320); ring(t.x, t.y, '#fff3a0', 140, 8, 0.6); speedLines(t.x, t.y, '#fff3a0', 200); });
        break;
      case 'act4':
        flash('#fff8d0', 300);
        goldRect(W / 2, H / 2, Math.min(W, H) * 0.35, '#ffd84a', 1.4);
        await wait(350);
        await Promise.all(tos.map(t => projectile('golden', from, t, { dur: 0.35 })));
        tos.forEach(t => { flash('#ffd84a', 260); goldRect(t.x, t.y, 120, '#fff3a0', 1); spiral(t.x, t.y, '#ffd84a', 140, 8, 1.4, 4); stars(t.x, t.y, '#ffd84a', 26, 420); speedLines(t.x, t.y, '#ffd84a', 260, 30); ring(t.x, t.y, '#ffd84a', 200, 10, 0.8); });
        break;
      case 'ballbreaker':
        flash('#fff3a0', 260);
        await Promise.all(tos.map(t => projectile('golden', from, t, { dur: 0.6 })));
        tos.forEach(t => { for (let i = 0; i < 8; i++) lightning(t, { x: t.x + rnd(-140, 140), y: t.y + rnd(-140, 140) }, '#fff3a0'); stars(t.x, t.y, '#f2c14e', 20, 360); smoke(t.x, t.y, '#b0a080', 10, 0.5); ring(t.x, t.y, '#f2c14e', 180, 9, 0.7); });
        break;
      case 'wormhole':
        ring(from.x, from.y, '#2a1a38', 60, 14, 0.5); spiral(from.x, from.y, '#b070ff', 50, 4, 0.6);
        await wait(220);
        tos.forEach(t => { ring(t.x, t.y, '#b070ff', 70, 10, 0.5); spiral(t.x, t.y, '#b070ff', 60, 4, 0.7); starBurst(t.x, t.y, '#c8a0ff', 50, 10, 0.3); });
        break;
      case 'claw':
        await wait(120);
        tos.forEach(t => { slash(t.x, t.y, meta.enemy ? '#fff' : '#8adf6a', 3, 48); setTimeout(() => blood(t.x, t.y, 8), 120 / spd()); });
        break;
      case 'hit':
        await wait(120);
        tos.forEach(t => { starBurst(t.x, t.y, '#fff', 56, 12, 0.3); debris(t.x, t.y, '#c8a070', 6); speedLines(t.x, t.y, '#fff', 120, 14); });
        break;
      case 'aoe':
        ring(from.x, from.y, '#fff', 120, 8, 0.4);
        await wait(160);
        tos.forEach((t, i) => setTimeout(() => { starBurst(t.x, t.y, '#fff3a0', 50, 10, 0.3); debris(t.x, t.y, '#c8a070', 5); ring(t.x, t.y, '#fff', 60, 5, 0.4); }, i * 70 / spd()));
        break;
      case 'boom':
        await wait(80);
        tos.forEach((t, i) => setTimeout(() => boom(t.x, t.y), i * 90 / spd()));
        break;
      case 'spray':
        await Promise.all(tos.map(t => projectile('spray', from, t)));
        tos.forEach(t => { for (let i = 0; i < 10; i++) add({ x: t.x, y: t.y, vx: rnd(-200, 200), vy: rnd(-260, 40), g: 700, r: rnd(4, 8), c: '#f09ac0', ink: true, life: 0.7, draw: D.dot }); });
        break;
      case 'rope':
        tos.forEach(t => add({ a: [from.x, from.y], b: [t.x, t.y], c1: [(from.x + t.x) / 2, Math.min(from.y, t.y) - 90], c: '#c8a070', w: 5, dash: [10, 4], life: 0.8, draw: D.curve, update: () => {} }));
        await wait(260);
        tos.forEach(t => { ring(t.x, t.y, '#c8a070', 44, 6, 0.5, 40); sparks(t.x, t.y, '#f6ecd8', 6, 4); });
        break;
      case 'magnet':
        await Promise.all(tos.map(t => projectile('magnet', from, t)));
        tos.forEach(t => { debris(t.x, t.y, '#6a7a9a', 12); ring(t.x, t.y, '#9aa8c8', 60, 6, 0.4, 60); });
        break;
      case 'pin':
        await Promise.all(tos.map(t => projectile('pin', from, t)));
        tos.forEach(t => { sparks(t.x, t.y, '#f2c14e', 6, 4); glyph(t.x, t.y - 40, 'ピン', '#f2c14e', 30); });
        break;
      case 'sound':
        tos.forEach(t => { for (let i = 0; i < 3; i++) setTimeout(() => ring(t.x, t.y, '#e8508a', 50 + i * 24, 5, 0.5), i * 90 / spd()); glyph(t.x, t.y - 30, 'ドン', '#e8508a', 50); });
        await wait(200);
        break;
      case 'rain':
        tos.forEach(t => { for (let i = 0; i < 16; i++) add({ x: t.x + rnd(-60, 60), y: t.y - rnd(160, 320), vx: -40, vy: 900, r: rnd(3, 5), c: '#9fc7e8', life: 0.35, draw: D.drop, drag: 1 }); });
        await wait(300);
        tos.forEach(t => sparks(t.x, t.y, '#d8ecff', 12, 6));
        break;
      case 'grid':
        tos.forEach(t => checker(t.x, t.y, '#3a2a1a'));
        await wait(180);
        tos.forEach(t => { starBurst(t.x, t.y, '#e8742a', 50, 8, 0.3); sparks(t.x, t.y, '#fff', 10, 6); });
        break;
      case 'scan':
        tos.forEach(t => { add({ x: t.x, y: t.y, life: 0.7, draw: (p, k) => { ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#3fb8a9'; ctx.lineWidth = 2; for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(p.x - 60, p.y + i * 12 + (k * 24 % 12)); ctx.lineTo(p.x + 60, p.y + i * 12 + (k * 24 % 12)); ctx.stroke(); } ctx.lineWidth = 3; ctx.strokeRect(p.x - 60 + k * 10, p.y - 60 + k * 10, 120 - k * 20, 120 - k * 20); }, update: () => {} }); });
        await wait(250);
        break;
      case 'heal':
        tos.forEach(t => { for (let i = 0; i < 14; i++) add({ x: t.x + rnd(-40, 40), y: t.y + rnd(0, 50), vx: rnd(-10, 10), vy: rnd(-140, -70), r: rnd(4, 8), c: i % 3 ? '#8affa0' : '#fff', rot: 0, life: rnd(0.6, 1), draw: D.star, drag: 0.98 }); ring(t.x, t.y, '#6ad08a', 60, 5, 0.6, 50); });
        await wait(200);
        break;
      case 'buff': case 'item':
        tos.forEach(t => { ring(t.x, t.y, '#f2c14e', 70, 5, 0.5, 70); ring(t.x, t.y, '#fff3a0', 50, 3, 0.6, 20); for (let i = 0; i < 8; i++) add({ x: t.x + rnd(-40, 40), y: t.y + 30, vx: 0, vy: rnd(-180, -100), c: '#f2c14e', w: 4, life: 0.5, draw: D.spark, drag: 1 }); });
        await wait(180);
        break;
      case 'debuff':
        tos.forEach(t => { smoke(t.x, t.y, '#6a3a8a', 8, 0.55, 30); ring(t.x, t.y, '#b070ff', 20, 5, 0.5, 80); });
        await wait(180);
        break;
      default:
        await wait(150);
        tos.forEach(t => starBurst(t.x, t.y, '#fff', 44, 10, 0.25));
    }
  }
  function boom(x, y) {
    flash('#ffb040', 120);
    starBurst(x, y, '#ffd84a', 90, 14, 0.35);
    add({ x, y, c: '#e8742a', r: 50, life: 0.5, draw: D.smoke, a: 0.9, update: () => {} });
    ring(x, y, '#fff3a0', 150, 8, 0.5);
    debris(x, y, '#3a2a2a', 12); smoke(x, y, '#5a4a4a', 12, 0.6, -60); sparks(x, y, '#ffd84a', 18, 9);
  }
  /* hit reactions */
  function impact(pt, crit, blocked) {
    if (blocked) { ring(pt.x, pt.y, '#9fc7e8', 50, 6, 0.35); sparks(pt.x, pt.y, '#d8ecff', 8, 5); return; }
    if (crit) { flash('#fff', 120); starBurst(pt.x, pt.y, '#f2c14e', 110, 16, 0.4); speedLines(pt.x, pt.y, '#fff', 220, 28); stars(pt.x, pt.y, '#e8508a', 8, 300); }
    else sparks(pt.x, pt.y, '#fff', 8, 5, 2.5);
  }
  /* damage-over-time & status tick visuals */
  function dot(label, pt) {
    switch (label) {
      case 'BLEED': blood(pt.x, pt.y - 20, 10); break;
      case 'HOLE': spiral(pt.x, pt.y, '#b070ff', 40, 4, 0.7, 2.5); ring(pt.x, pt.y, '#2a1a38', 30, 8, 0.4); break;
      case 'GUILT': for (let i = 0; i < 2; i++) add({ x: pt.x + (i ? 30 : -30), y: pt.y, life: 0.7, draw: (p, k) => { ctx.globalAlpha = 1 - k; ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(p.x, p.y - 34); ctx.lineTo(p.x, p.y + 34); ctx.moveTo(p.x - 18, p.y - 14); ctx.lineTo(p.x + 18, p.y - 14); ctx.stroke(); ctx.strokeStyle = '#8a1a2a'; ctx.lineWidth = 4; ctx.stroke(); }, update: (p, dt) => { p.y += dt * 30; } }); smoke(pt.x, pt.y, '#3a1a2a', 5, 0.5, -20); break;
      case '∞': goldRect(pt.x, pt.y, 60, '#ffd84a', 0.8); stars(pt.x, pt.y, '#ffd84a', 6, 160); break;
      case 'BOOM': boom(pt.x, pt.y); break;
      case 'DOGOOON': glyph(pt.x, pt.y - 20, 'ドゴォン', '#e8508a', 44); ring(pt.x, pt.y, '#e8508a', 90, 6, 0.5); break;
      case 'MAGNET': debris(pt.x, pt.y, '#6a7a9a', 6); break;
      case 'misfortune': case 'MISFORTUNE': lightning({ x: pt.x, y: pt.y - 200 }, pt, '#f6ecd8'); starBurst(pt.x, pt.y, '#f6ecd8', 40, 10, 0.3); break;
      default: sparks(pt.x, pt.y, '#fff', 6, 4);
    }
  }
  function regen(pt) { for (let i = 0; i < 6; i++) add({ x: pt.x + rnd(-30, 30), y: pt.y + 30, vx: 0, vy: rnd(-100, -60), r: rnd(3, 6), c: '#8affa0', rot: 0, life: 0.7, draw: D.star, drag: 1 }); }
  function death(pt) { smoke(pt.x, pt.y, '#c8b8a0', 14, 0.6, -30); debris(pt.x, pt.y, '#f6ecd8', 10); }
  function summon(pt) { ring(pt.x, pt.y, '#b070ff', 90, 8, 0.5); smoke(pt.x, pt.y, '#6a3a8a', 10, 0.5, -20); stars(pt.x, pt.y, '#c8a0ff', 8, 200); }
  function dust(pt, n = 16) { for (let i = 0; i < n; i++) { const a = rnd(Math.PI * 0.9, Math.PI * 2.1); add({ x: pt.x + rnd(-60, 60), y: pt.y, vx: Math.cos(a) * rnd(80, 260), vy: Math.sin(a) * rnd(20, 120) - 30, r: rnd(8, 18), c: '#e8d0a0', a: 0.55, life: rnd(0.6, 1.1), draw: D.smoke, drag: 0.93 }); } }

  return { init, play, impact, dot, regen, death, summon, sparks, blood, debris, smoke, stars, ring, starBurst, speedLines, slash, spiral, goldRect, glyph, flash, boom, dust, lightning };
})();
