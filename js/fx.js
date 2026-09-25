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
  /* amp scales emitter particle counts by the move's power tier; timeScale gives the tier-3 slow-motion beat */
  let amp = 1, timeScale = 1;
  const CAP = () => (reduced() ? 90 : 850);
  // projectiles (p.done) are never dropped, or the awaiting move would hang
  function add(p) { init(); if (!p.done && parts.length > CAP()) return p; p.t = 0; p.life = (p.life || 0.8) * (p.done ? 1 : 1.35); p.sp = p.done ? spd() : Math.sqrt(spd()); parts.push(p); if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); } return p; }
  let last = 0;
  function loop(now) {
    const rdt = Math.min(0.05, (now - last) / 1000) * timeScale;
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
    /* --- added: elemental and Stand-specific shapes --- */
    shard: (p, k) => { ctx.globalAlpha = 1 - k * k; ctx.translate(p.x, p.y); ctx.rotate(p.rot != null ? p.rot : Math.atan2(p.vy, p.vx)); ctx.fillStyle = p.c; ctx.strokeStyle = INK; ctx.lineWidth = 1.5; const r = p.r; ctx.beginPath(); ctx.moveTo(r * 2.2, 0); ctx.lineTo(0, r * 0.6); ctx.lineTo(-r * 1.2, 0); ctx.lineTo(0, -r * 0.6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.moveTo(r * 1.6, 0); ctx.lineTo(0, -r * 0.4); ctx.lineTo(-r * 0.4, 0); ctx.closePath(); ctx.fill(); },
    gem: (p, k) => { ctx.globalAlpha = 1 - k; ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0); const r = p.r; ctx.fillStyle = p.c; ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * TAU / 6; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 1.3); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.6); ctx.lineTo(r * 0.2, -r * 0.8); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); },
    flame: (p, k) => { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - k) * 0.9; const r = p.r * (1 - k * 0.6); const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); g.addColorStop(0, k < 0.3 ? '#fff6c0' : '#ffd84a'); g.addColorStop(0.45, k < 0.5 ? '#ff9a2a' : '#e8502a'); g.addColorStop(1, 'rgba(200,40,20,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill(); },
    pillar: (p, k) => { const a = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8; ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter'; const w = p.w * (0.6 + 0.4 * Math.sin(k * 20)); const g = ctx.createLinearGradient(p.x - w, 0, p.x + w, 0); g.addColorStop(0, 'rgba(255,240,160,0)'); g.addColorStop(0.5, p.c); g.addColorStop(1, 'rgba(255,240,160,0)'); ctx.fillStyle = g; ctx.fillRect(p.x - w, 0, w * 2, p.y + 30); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(p.x - w * 0.15, 0, w * 0.3, p.y + 30); },
    cross: (p, k) => { ctx.globalAlpha = 1 - k; ctx.translate(p.x, p.y - k * 30); const s = p.r * (0.6 + k * 0.5); ctx.lineCap = 'square'; for (const [lw, col] of [[p.w + 5, INK], [p.w, p.c]]) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s * 1.3); ctx.moveTo(-s * 0.7, -s * 0.25); ctx.lineTo(s * 0.7, -s * 0.25); ctx.stroke(); } },
    clock: (p, k) => { const e = 1 - Math.pow(1 - Math.min(1, k * 1.6), 3); ctx.globalAlpha = k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25; ctx.translate(p.x, p.y); const r = p.r * (0.3 + e * 0.7); ctx.strokeStyle = INK; ctx.lineWidth = p.w + 4; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); ctx.strokeStyle = p.c; ctx.lineWidth = p.w; ctx.stroke(); for (let i = 0; i < 12; i++) { const a = i * TAU / 12; const r1 = r * (i % 3 ? 0.88 : 0.78); ctx.lineWidth = i % 3 ? 2 : 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.lineTo(Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98); ctx.stroke(); } const ha = -Math.PI / 2 + Math.min(1, k * 1.4) * TAU * (p.rev ? -1 : 1); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ha) * r * 0.75, Math.sin(ha) * r * 0.75); ctx.stroke(); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ha / 12 - 1) * r * 0.45, Math.sin(ha / 12 - 1) * r * 0.45); ctx.stroke(); },
    beam: (p, k) => { const a = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85; ctx.globalAlpha = a; ctx.lineCap = 'round'; const w = p.w * (1 - k * 0.5); for (const [lw, col] of [[w + 6, INK], [w, p.c], [w * 0.35, '#fff']]) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(p.a[0], p.a[1]); ctx.lineTo(p.b[0], p.b[1]); ctx.stroke(); } },
    streak: (p, k) => { const prog = Math.min(1, k * 3); ctx.globalAlpha = 1 - k; ctx.lineCap = 'round'; const x1 = p.a[0] + (p.b[0] - p.a[0]) * prog, y1 = p.a[1] + (p.b[1] - p.a[1]) * prog; const t0 = Math.max(0, prog - 0.5); const x0 = p.a[0] + (p.b[0] - p.a[0]) * t0, y0 = p.a[1] + (p.b[1] - p.a[1]) * t0; for (const [lw, col] of [[p.w + 3, INK], [p.w, p.c]]) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); } },
    zipper: (p, k) => {
      const prog = Math.min(1, k * 2.2), open = Math.max(0, (k - 0.45) / 0.55), fade = k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25;
      ctx.globalAlpha = fade; ctx.translate(p.x, p.y); ctx.rotate(p.ang);
      const L = p.len, n = 16, gap = open * 22; ctx.scale(1.3, 1.3);
      ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.moveTo(-L / 2, 0); ctx.quadraticCurveTo(0, -gap * 2, L / 2 * (2 * prog - 1), 0); ctx.quadraticCurveTo(0, gap * 2, -L / 2, 0); ctx.fill();
      for (let i = 0; i < n * prog; i++) { const x = -L / 2 + (i / n) * L, off = gap * Math.sin(Math.PI * i / n); ctx.fillStyle = p.c; ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.fillRect(x - 3, -off - (i % 2 ? 7 : 3), 6, 5); ctx.strokeRect(x - 3, -off - (i % 2 ? 7 : 3), 6, 5); ctx.fillRect(x - 3, off + (i % 2 ? -2 : 2), 6, 5); ctx.strokeRect(x - 3, off + (i % 2 ? -2 : 2), 6, 5); }
      const hx = -L / 2 + prog * L; ctx.fillStyle = '#e8e8f0'; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.rect(hx - 6, -8, 12, 16); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(hx, 16, 5, 0, TAU); ctx.stroke();
    },
    scrape: (p, k) => { const prog = Math.min(1, k * 3), fade = k < 0.5 ? 1 : 1 - (k - 0.5) / 0.5; ctx.globalAlpha = fade; ctx.translate(p.x, p.y); ctx.rotate(p.ang); const L = p.len * prog; ctx.fillStyle = INK; ctx.fillRect(-p.len / 2, -p.w / 2 - 3, L, p.w + 6); ctx.fillStyle = '#05030a'; ctx.fillRect(-p.len / 2, -p.w / 2, L, p.w); ctx.strokeStyle = p.c; ctx.lineWidth = 2; ctx.strokeRect(-p.len / 2, -p.w / 2, L, p.w); ctx.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 5; i++) ctx.fillRect(-p.len / 2 + L - 4, -p.w / 2 + i * p.w / 5, 8, 2); },
    disc: (p, k) => { ctx.globalAlpha = 1 - k * k; ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0); ctx.scale(1, 0.55 + 0.45 * Math.cos((p.rot || 0) * 0.5)); const r = p.r; const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, '#f6f6ff'); g.addColorStop(0.35, '#a8e8ff'); g.addColorStop(0.6, '#f0a8e8'); g.addColorStop(1, '#fff8b0'); ctx.fillStyle = g; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, TAU); ctx.fill(); },
    petal: (p, k) => { ctx.globalAlpha = 1 - k; ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0); ctx.fillStyle = p.c; ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.45, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-p.r, 0); ctx.lineTo(p.r, 0); ctx.stroke(); },
    hex: (p, k) => { const e = 1 - Math.pow(1 - Math.min(1, k * 2), 3); ctx.globalAlpha = (1 - k) * 0.9; ctx.translate(p.x, p.y); ctx.rotate(k * 0.5); const r = p.r * (0.5 + e * 0.5); ctx.strokeStyle = p.c; ctx.lineWidth = p.w; ctx.fillStyle = p.fill || 'rgba(255,240,160,.12)'; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + Math.PI / 6; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); },
    arrow: (p, k) => { ctx.globalAlpha = 1 - k; ctx.translate(p.x, p.y); ctx.rotate(p.up ? Math.PI : 0); ctx.fillStyle = p.c; ctx.strokeStyle = INK; ctx.lineWidth = 2; const s = p.r; ctx.beginPath(); ctx.moveTo(-s * 0.35, -s); ctx.lineTo(s * 0.35, -s); ctx.lineTo(s * 0.35, 0); ctx.lineTo(s * 0.8, 0); ctx.lineTo(0, s); ctx.lineTo(-s * 0.8, 0); ctx.lineTo(-s * 0.35, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); },
    bubble: (p, k) => { ctx.globalAlpha = (1 - k) * 0.9; ctx.strokeStyle = p.c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.22, 0, TAU); ctx.fill(); },
    chain: (p, k) => { ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3; ctx.translate(p.x, p.y); ctx.rotate(p.ang); const n = 7, L = p.len * Math.min(1, k * 3); for (let i = 0; i < n; i++) { const x = -p.len / 2 + i * p.len / n; if (x > -p.len / 2 + L) break; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(x, 0, 9, i % 2 ? 3 : 6, 0, 0, TAU); ctx.stroke(); ctx.strokeStyle = p.c; ctx.lineWidth = 3; ctx.stroke(); } },
    radial: (p, k) => { ctx.globalAlpha = (k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8) * (p.a || 0.8); ctx.fillStyle = p.c; for (let i = 0; i < p.n; i++) { const a = p.seed[i], wA = p.wd[i]; const r0 = p.r0 * (1 - k * 0.4), r1 = p.r; ctx.beginPath(); ctx.moveTo(p.x + Math.cos(a - wA) * r1, p.y + Math.sin(a - wA) * r1); ctx.lineTo(p.x + Math.cos(a) * r0, p.y + Math.sin(a) * r0); ctx.lineTo(p.x + Math.cos(a + wA) * r1, p.y + Math.sin(a + wA) * r1); ctx.fill(); } },
  };

  /* ---------- emitters ---------- */
  const burstOf = (x, y, n, mk) => { n = Math.max(1, Math.round(n * amp)); for (let i = 0; i < n; i++) add(mk(i)); };
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

  /* new emitters */
  function flames(x, y, n = 14, spread = 30, rise = -160, r = 22) { burstOf(x, y, n, () => ({ x: x + rnd(-spread, spread), y: y + rnd(-spread * 0.5, spread * 0.6), vx: rnd(-40, 40), vy: rise * rnd(0.5, 1.1), r: rnd(r * 0.6, r * 1.2), life: rnd(0.4, 0.75), draw: D.flame, drag: 0.95 })); }
  function shards(x, y, c = '#bfe6ff', n = 12, sp = 320) { burstOf(x, y, n, () => { const a = rnd(0, TAU), v = rnd(sp * 0.4, sp); return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 300, r: rnd(4, 8), c, life: rnd(0.45, 0.8), draw: D.shard, drag: 0.93 }; }); }
  function gems(x, y, c = '#3ad07a', n = 12, sp = 300) { burstOf(x, y, n, () => { const a = rnd(0, TAU), v = rnd(sp * 0.3, sp); return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, g: 700, r: rnd(4, 7), c, rot: rnd(0, TAU), vr: rnd(-8, 8), life: rnd(0.5, 0.9), draw: D.gem, drag: 0.95 }; }); }
  function petals(x, y, c = '#f09ac0', n = 10) { burstOf(x, y, n, () => ({ x: x + rnd(-40, 40), y: y + rnd(-50, 10), vx: rnd(-50, 50), vy: rnd(-60, 20), g: 60, r: rnd(5, 9), c, rot: rnd(0, TAU), vr: rnd(-5, 5), life: rnd(0.7, 1.1), draw: D.petal, drag: 0.96 })); }
  function bubbles(x, y, c = '#9fe8d0', n = 8) { burstOf(x, y, n, () => ({ x: x + rnd(-40, 40), y: y + rnd(0, 40), vx: rnd(-15, 15), vy: rnd(-120, -60), r: rnd(4, 10), c, life: rnd(0.6, 1), draw: D.bubble, drag: 0.99 })); }
  const pillar = (x, y, c = '#fff3a0', w = 34, life = 0.6) => add({ x, y, c, w, life, draw: D.pillar, update: () => {} });
  const cross = (x, y, c = '#ffd84a', r = 30, w = 6) => add({ x, y, c, r, w, life: 0.7, draw: D.cross, update: () => {} });
  const clock = (x, y, c = '#ffd84a', r = 120, life = 0.9, rev = false) => add({ x, y, c, r, w: 6, rev, life, draw: D.clock, update: () => {} });
  const beam = (a, b, c = '#fff', w = 12, life = 0.35) => add({ a: [a.x, a.y], b: [b.x, b.y], c, w, life, draw: D.beam, update: () => {} });
  const streak = (a, b, c = '#fff', w = 3, life = 0.28) => add({ a: [a.x, a.y], b: [b.x, b.y], c, w, life, draw: D.streak, update: () => {} });
  const arrows = (x, y, c, up, n = 3) => burstOf(x, y, n, i => ({ x: x + (i - (n - 1) / 2) * 30, y: y + (up ? 30 : -30), vx: 0, vy: up ? -90 : 90, r: 13, c, up, life: 0.6, draw: D.arrow, drag: 1 }));
  const hexShield = (x, y, c = '#f2c14e', r = 70) => add({ x, y, c, r, w: 4, life: 0.7, draw: D.hex, update: () => {} });
  const radialLines = (x, y, c = '#fff', n = 40, r = 0, a = 0.75, life = 0.55) => { const R = r || Math.hypot(W, H); const nn = Math.round(n * (reduced() ? 0.4 : 1)); add({ x, y, c, n: nn, r: R, r0: R * 0.28, a, seed: Array.from({ length: nn }, () => rnd(0, TAU)), wd: Array.from({ length: nn }, () => rnd(0.004, 0.018)), life, draw: D.radial, update: () => {} }); };
  const angTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);

  function flash(color = '#fff', dur = 180, alpha = 0.85) {
    const f = document.createElement('div');
    f.className = 'fx-flash'; f.style.background = color;
    document.getElementById('fx-layer').appendChild(f);
    f.animate([{ opacity: reduced() ? Math.min(0.35, alpha) : alpha }, { opacity: 0 }], { duration: dur / spd(), easing: 'ease-out' }).onfinish = () => f.remove();
  }
  /* DOM overlays (styled in css/vfx.css); duration in ms at speed 1 */
  function overlay(cls, dur, style = {}, html = '') {
    const layer = document.getElementById('fx-layer'); if (!layer) return null;
    const o = document.createElement('div');
    o.className = cls; o.innerHTML = html;
    Object.assign(o.style, style);
    o.style.setProperty('--d', Math.round(dur / spd()) + 'ms');
    layer.appendChild(o);
    setTimeout(() => o.remove(), dur / spd() + 40);
    return o;
  }
  function kana(x, y, txt, c = '#f2c14e', size = 96, dur = 850) { overlay('vfx-kana', dur, { left: x + 'px', top: y + 'px', color: c, fontSize: size + 'px' }, txt); }
  function menace(x, y, c = '#b070e0', n = 4) {
    const nn = Math.max(2, Math.round(n * amp));
    for (let i = 0; i < nn; i++) setTimeout(() => overlay('vfx-menace', 800, { left: (x + rnd(-80, 80)) + 'px', top: (y + rnd(-70, 30)) + 'px', color: c, fontSize: rnd(26, 44) + 'px' }, 'ゴ'), i * 70 / spd());
  }
  function invert(dur = 140) { overlay('vfx-invert', dur); if (!reduced()) setTimeout(() => overlay('vfx-invert', dur * 0.7), dur * 1.4 / spd()); }
  function grade(c, dur = 700) { overlay('vfx-grade', dur, { background: c }); }
  function zoomPunch() {
    if (reduced() || !SBR.settings.shake) return;
    const f = document.querySelector('.battle-field'); if (!f) return;
    f.classList.remove('vfx-zoom'); void f.offsetWidth; f.classList.add('vfx-zoom');
    f.style.setProperty('--d', Math.round(520 / spd()) + 'ms');
    setTimeout(() => f.classList.remove('vfx-zoom'), 560 / spd());
  }

  /* ---------- projectiles ---------- */
  function projectile(kind, a, b, opts = {}) {
    return new Promise(res => {
      const dur = (opts.dur || { ball: 0.42, golden: 0.5, nail: 0.26, bullet: 0.14, spray: 0.36, pin: 0.3, magnet: 0.4, gem: 0.3, disc: 0.4, fireball: 0.34, bomb: 0.4, shard: 0.22, sun: 0.3 }[kind] || 0.3);
      const arc = opts.arc != null ? opts.arc : (kind === 'spray' || kind === 'pin' || kind === 'bomb' ? -80 : kind === 'ball' || kind === 'disc' ? -30 : 0);
      const col = opts.c;
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
          if (kind === 'fireball') add({ x: p.x + rnd(-6, 6), y: p.y + rnd(-6, 6), vx: rnd(-30, 30), vy: rnd(-80, -20), r: rnd(10, 18), life: 0.35, draw: D.flame, drag: 0.95 });
          if (kind === 'gem' && Math.random() < 0.5) add({ x: p.x, y: p.y, vx: rnd(-30, 30), vy: rnd(-30, 30), r: rnd(1.5, 3), c: '#b8ffd0', life: 0.25, draw: D.dot, shrink: true });
          if (kind === 'sun') add({ x: p.x, y: p.y, vx: 0, vy: 0, r: 10, c: 'rgba(255,230,120,.45)', life: 0.22, draw: D.dot, shrink: true });
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
          else if (kind === 'gem') { ctx.rotate(p.rot * 0.4); D.gem({ x: 0, y: 0, r: opts.r || 7, c: col || '#3ad07a' }, 0); }
          else if (kind === 'shard') { ctx.rotate(Math.atan2(b.y - a.y, b.x - a.x)); D.shard({ x: 0, y: 0, r: 8, c: col || '#bfe6ff', rot: 0 }, 0); }
          else if (kind === 'disc') { D.disc({ x: 0, y: 0, r: 14, rot: p.rot }, 0); }
          else if (kind === 'fireball') { D.flame({ x: 0, y: 0, r: 22 }, 0.1); }
          else if (kind === 'sun') { ctx.globalCompositeOperation = 'lighter'; D.flame({ x: 0, y: 0, r: 16 }, 0); }
          else if (kind === 'bomb') { ctx.rotate(p.rot * 0.2); ctx.fillStyle = col || '#e8a0c8'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.font = 'bold 13px Bangers, Impact'; ctx.textAlign = 'center'; ctx.fillText('☠', 0, 5); }
        },
        done: res,
      };
      add(p);
    });
  }
  const wait = ms => new Promise(r => setTimeout(r, ms / spd()));

  /* ---------- composite move animations ----------
     play(fx, from, [targets], meta) → resolves when the projectile lands (impact FX keep playing).
     meta: { enemy, self, tier 0-3, lvl, dtype, color, variant, ucolor, kana }
       tier 0 subtle · 1 normal · 2 bigger + flash · 3 cinematic (letterbox, radial lines, kana, slow-mo beat) */
  const TIER_AMP = [0.55, 1, 1.4, 1.8];
  const dtColor = dt => (SBR.DMG && SBR.DMG[dt] && SBR.DMG[dt].color) || '#fff';
  const KANA3 = { ora: 'オラオラオラ', muda: '無駄無駄無駄', dora: 'ドラララ', ari: 'アリアリアリ', golden: '黄金回転', act4: 'ACT4', ballbreaker: 'ボール・ブレイカー', fire: 'ゴオオオッ', ripple: '山吹色の波紋', uv: 'コォォォ', timestop: '時よ止まれ', timeskip: '時は消し飛ぶ', zipper: 'アリーヴェデルチ', erase: 'ガオン', bomb: 'ドグォォン', prime: 'カチッ', emerald: 'エメラルド', rapier: 'シュバババ', string: 'シュルルル', disc: 'ズズズッ', blood: 'ズギュウン', ice: 'ピキィィン', beam: 'ビシュウッ', rewind: 'バイツァ・ダスト', boom: 'ドグォォン', gun: 'ドドドン', gatling: 'ダダダダ', nail: 'ズキュウン', ball: 'ギャルギャル', lasso: 'ヒュン', heal: 'キラァ', life: '生命', restore: 'ドララ', buff: 'ドドドド', debuff: 'ゴゴゴゴ' };

  async function play(kind, from, tos, meta = {}) {
    init();
    const tier = Math.max(0, Math.min(3, meta.tier == null ? 1 : meta.tier | 0));
    const dt = meta.dtype;
    const dcol = meta.color || (dt ? dtColor(dt) : meta.ucolor || '#fff');
    const prevAmp = amp;
    amp = TIER_AMP[tier] * (meta.lvl > 1 ? 1.15 : 1) * (reduced() ? 0.6 : 1);
    meta = Object.assign({}, meta, { tier, dcol, v: (meta.variant | 0) >>> 0 });
    if (!tos.length) tos = [from];
    const mid = { x: tos.reduce((s, t) => s + t.x, 0) / tos.length, y: tos.reduce((s, t) => s + t.y, 0) / tos.length };
    try {
      if (tier >= 3 && kind !== 'act4' && kind !== 'ballbreaker') await cinematic(from, meta);
      else if (tier === 2) { ring(from.x, from.y, dcol, 12, 5, 0.3, 110); sparks(from.x, from.y, dcol, 8, 4, 2); }
      const mv = MOVES[kind];
      const handled = mv ? (await mv(from, tos, meta), true) : await baseMove(kind, from, tos, meta);
      if (!handled) await generic(from, tos, meta);
      // damage-type accent on every struck target
      if (!meta.self && dt) tos.forEach((t, i) => accent(dt, from, t, meta, i));
      if (tier >= 2) flash(dcol, tier >= 3 ? 220 : 140, tier >= 3 ? 0.38 : 0.3);
      if (tier >= 3) {
        grade(dcol, 650);
        kana(mid.x, mid.y - 70, meta.kana || KANA3[kind] || (meta.enemy ? 'ゴゴゴゴ' : 'ドドドド'), dcol, Math.min(110, 70 + tos.length * 6), 900);
        radialLines(mid.x, mid.y, '#fff', 34, 0, 0.55, 0.5);
        zoomPunch();
        if (!reduced()) { timeScale = 0.3; await wait(150); timeScale = 1; }
      }
    } finally { amp = prevAmp; timeScale = 1; }
  }

  /* tier-3 wind-up: letterbox + darken, radial lines converging on the user */
  async function cinematic(from, meta) {
    const o = overlay('vfx-cine' + (meta.enemy ? ' enemy' : ''), 980, {}, '<i class="lb t"></i><i class="lb b"></i>');
    if (o) o.style.setProperty('--c', meta.dcol);
    radialLines(from.x, from.y, meta.dcol, 44, 0, 0.5, 0.42);
    ring(from.x, from.y, meta.dcol, 16, 9, 0.28, 160);
    ring(from.x, from.y, '#fff', 10, 4, 0.3, 110);
    await wait(190);
  }

  /* hit sparks by damage type */
  function accent(dt, from, t, meta, i) {
    const tier = meta.tier, c = meta.dcol;
    switch (dt) {
      case 'bullet': {
        const a = angTo(from, t);
        for (let k = 0; k < (tier >= 2 ? 3 : 1); k++) { const off = rnd(-14, 14); streak({ x: t.x - Math.cos(a) * 130, y: t.y - Math.sin(a) * 130 + off }, { x: t.x + Math.cos(a) * 60, y: t.y + Math.sin(a) * 60 + off }, '#fff3a0', 3); }
        starBurst(t.x, t.y, c, 30 + tier * 6, 8, 0.2);
        if (i === 0 && tier >= 1) starBurst(from.x + Math.cos(a) * 55, from.y + Math.sin(a) * 55, '#fff3a0', 30, 8, 0.18);
        break;
      }
      case 'spin': spiral(t.x, t.y, c, 46 + tier * 14, 4, 0.8, 2.5); if (tier >= 2) goldRect(t.x, t.y, 60 + tier * 12, '#ffd84a', 0.9); break;
      case 'stand': menace(t.x, t.y - 20, c, 1 + tier); smoke(t.x, t.y, '#6a3a9a', 4, 0.35, -30); ring(t.x, t.y, c, 56 + tier * 12, 5, 0.45); break;
      case 'bleed': blood(t.x, t.y - 10, 5 + tier * 3, '#c8323c'); if (tier >= 2) ring(t.x, t.y, '#8a1a2a', 70, 6, 0.4); break;
      case 'cold': shards(t.x, t.y, '#bfe6ff', 5 + tier * 3, 260); ring(t.x, t.y, '#d8f0ff', 46 + tier * 10, 4, 0.4); smoke(t.x, t.y, '#e8f6ff', 3, 0.4, -10); break;
      case 'sound': {
        glyph(t.x + rnd(-20, 20), t.y - 44, ['ドン', 'バン', 'ズン', 'ゴン'][(i + meta.v) % 4], c, 30 + tier * 6);
        for (let k = 0; k < 1 + tier; k++) setTimeout(() => ring(t.x, t.y, c, 40 + k * 22, 4, 0.4), k * 70 / spd());
        break;
      }
      case 'holy': pillar(t.x, t.y, 'rgba(255,240,160,.9)', 20 + tier * 8, 0.55); if (tier >= 1) cross(t.x, t.y - 54, c, 18 + tier * 5, 5); break;
      case 'true': if (i === 0 && tier >= 1) invert(tier >= 3 ? 150 : 100); ring(t.x, t.y, '#05030a', 64, 12, 0.35); ring(t.x, t.y, '#fff', 44, 4, 0.4); break;
      default: smoke(t.x, t.y + 30, '#e8d0a0', 2 + tier, 0.45, -20); starBurst(t.x, t.y, c, 28 + tier * 8, 10, 0.22);
    }
  }

  /* unknown kinds: a hit tinted by damage type */
  async function generic(from, tos, meta) {
    await wait(140);
    tos.forEach(t => { starBurst(t.x, t.y, meta.dcol, 50, 10, 0.28); ring(t.x, t.y, meta.dcol, 60, 5, 0.35); sparks(t.x, t.y, '#fff', 10, 6); });
  }

  /* the original move set, with variations for the generic kinds (meta.v picks one per ability) */
  async function baseMove(kind, from, tos, meta) {
    const t0 = tos[0] || from, v = meta.v % 4, tint = meta.dcol;
    const muzzle = () => { starBurst(from.x + (t0.x > from.x ? 60 : -60), from.y, '#fff3a0', 46, 9, 0.2); smoke(from.x + (t0.x > from.x ? 50 : -50), from.y, '#e8e0d0', 3, 0.35, -20); };
    switch (kind) {
      case 'nail':
        await Promise.all(tos.map(t => projectile('nail', from, t)));
        tos.forEach(t => { ring(t.x, t.y, '#b070ff', 80, 7, 0.5); starBurst(t.x, t.y, '#c8a0ff', 60, 8, 0.3); sparks(t.x, t.y, '#c8a0ff', 18, 7); spiral(t.x, t.y, '#b070ff', 60, 5, 1, 2.5); });
        break;
      case 'gun':
        muzzle();
        if (meta.tier >= 2 && tos.length === 1) { await projectile('bullet', from, t0); muzzle(); }
        await Promise.all(tos.map(t => projectile('bullet', from, t)));
        tos.forEach(t => { sparks(t.x, t.y, '#fff3a0', 18, 9, 3); starBurst(t.x, t.y, v % 2 ? tint : '#fff', 54, 10, 0.3); ring(t.x, t.y, '#fff3a0', 60, 5, 0.35); });
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
      case 'ora': case 'muda': case 'dora': case 'ari': {
        const col = { ora: '#b070ff', muda: '#f2c14e', dora: '#e89ac8', ari: '#5a8ad0' }[kind];
        const n = 4 + meta.tier + (meta.lvl > 1 ? 1 : 0);
        for (let i = 0; i < n; i++) { tos.forEach(t => { const x = t.x + (Math.random() * 60 - 30), y = t.y + (Math.random() * 60 - 30); starBurst(x, y, col, 40, 8, 0.2); ring(x, y, col, 40, 4, 0.25); if (meta.tier >= 2) streak({ x: from.x + rnd(-20, 20), y: from.y + rnd(-30, 30) }, { x, y }, '#fff', 2, 0.18); }); await wait(Math.max(40, 300 / n)); }
        tos.forEach(t => { speedLines(t.x, t.y, col); sparks(t.x, t.y, '#fff', 20, 9); });
        break;
      }
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
      case 'claw': {
        const col = meta.enemy ? '#fff' : (tint !== '#fff' && tint !== '#d8c8a8' ? tint : '#8adf6a');
        await wait(120);
        tos.forEach(t => {
          if (v === 0) slash(t.x, t.y, col, 3 + (meta.tier >= 2 ? 1 : 0), 48);
          else if (v === 1) { streak({ x: t.x - 60, y: t.y - 60 }, { x: t.x + 60, y: t.y + 60 }, col, 7, 0.4); setTimeout(() => streak({ x: t.x + 60, y: t.y - 60 }, { x: t.x - 60, y: t.y + 60 }, col, 7, 0.4), 70 / spd()); }
          else if (v === 2) add({ x: t.x, y: t.y + 10, r: 72, a0: -2.9, a1: -0.2, c: col, w: 11, life: 0.5, draw: D.slash, update: () => {} });
          else { add({ x: t.x, y: t.y - 8, r: 44, a0: Math.PI * 1.1, a1: Math.PI * 1.9, c: '#fff', w: 6, life: 0.45, draw: D.slash, update: () => {} }); add({ x: t.x, y: t.y + 8, r: 44, a0: Math.PI * 0.9, a1: Math.PI * 0.1, ccw: true, c: '#fff', w: 6, life: 0.45, draw: D.slash, update: () => {} }); }
          setTimeout(() => blood(t.x, t.y, 8), 120 / spd());
        });
        break;
      }
      case 'hit':
        await wait(120);
        tos.forEach(t => {
          if (v === 0) { starBurst(t.x, t.y, '#fff', 56, 12, 0.3); debris(t.x, t.y, '#c8a070', 6); speedLines(t.x, t.y, '#fff', 120, 14); }
          else if (v === 1) { starBurst(t.x, t.y + 10, tint, 52, 10, 0.3); for (let k = 0; k < 5; k++) streak({ x: t.x + rnd(-40, 40), y: t.y + 50 }, { x: t.x + rnd(-40, 40), y: t.y - 110 }, '#fff', 3, 0.3); debris(t.x, t.y, '#c8a070', 4); }
          else if (v === 2) { streak({ x: t.x - 70, y: t.y - 50 }, { x: t.x + 70, y: t.y + 50 }, '#fff', 6, 0.35); streak({ x: t.x + 70, y: t.y - 50 }, { x: t.x - 70, y: t.y + 50 }, '#fff', 6, 0.35); starBurst(t.x, t.y, tint, 46, 8, 0.28); }
          else { ring(t.x, t.y, '#fff', 90, 7, 0.4); ring(t.x, t.y, tint, 60, 5, 0.5, 20); starBurst(t.x, t.y, '#fff', 40, 12, 0.25); debris(t.x, t.y + 20, '#c8a070', 8); }
        });
        break;
      case 'aoe':
        ring(from.x, from.y, v === 1 ? tint : '#fff', 120, 8, 0.4);
        if (v === 1 && tos.length > 1) { const xs = tos.map(t => t.x); streak({ x: Math.min(...xs) - 80, y: midY(tos) }, { x: Math.max(...xs) + 80, y: midY(tos) }, '#fff', 8, 0.35); }
        if (v === 2) tos.forEach(t => { for (let k = 0; k < 6; k++) add({ x: t.x + rnd(-50, 50), y: t.y - rnd(150, 260), vx: rnd(-20, 20), vy: 700, r: rnd(4, 8), c: '#a08060', rot: rnd(0, TAU), vr: 8, life: 0.3, draw: D.square, drag: 1 }); });
        await wait(160);
        tos.forEach((t, i) => setTimeout(() => {
          starBurst(t.x, t.y, v === 3 ? tint : '#fff3a0', 50, 10, 0.3); debris(t.x, t.y, '#c8a070', 5); ring(t.x, t.y, '#fff', 60, 5, 0.4);
          if (v === 3) { speedLines(t.x, t.y + 30, '#3a2a1a', 90, 10); smoke(t.x, t.y + 30, '#e8d0a0', 4, 0.5, -20); }
        }, i * 70 / spd()));
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
      case 'scan': {
        const sc = meta.scanColor || '#3fb8a9';
        tos.forEach(t => { add({ x: t.x, y: t.y, life: 0.7, draw: (p, k) => { ctx.globalAlpha = 1 - k; ctx.strokeStyle = sc; ctx.lineWidth = 2; for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(p.x - 60, p.y + i * 12 + (k * 24 % 12)); ctx.lineTo(p.x + 60, p.y + i * 12 + (k * 24 % 12)); ctx.stroke(); } ctx.lineWidth = 3; ctx.strokeRect(p.x - 60 + k * 10, p.y - 60 + k * 10, 120 - k * 20, 120 - k * 20); }, update: () => {} }); });
        await wait(250);
        break;
      }
      case 'heal':
        tos.forEach(t => {
          if (v === 1) petals(t.x, t.y, '#8affa0', 10);
          else if (v === 2) { cross(t.x, t.y - 10, '#8affa0', 26, 7); add({ x: t.x, y: t.y, c: 'rgba(138,255,160,.35)', r: 40, life: 0.6, draw: D.smoke, a: 0.8, update: () => {} }); }
          else if (v === 3) bubbles(t.x, t.y, '#8affc8', 10);
          if (v !== 1) for (let i = 0; i < (v ? 6 : 14); i++) add({ x: t.x + rnd(-40, 40), y: t.y + rnd(0, 50), vx: rnd(-10, 10), vy: rnd(-140, -70), r: rnd(4, 8), c: i % 3 ? '#8affa0' : '#fff', rot: 0, life: rnd(0.6, 1), draw: D.star, drag: 0.98 });
          ring(t.x, t.y, '#6ad08a', 60, 5, 0.6, 50);
        });
        await wait(200);
        break;
      case 'buff': case 'item': {
        const bc = kind === 'item' ? '#f2c14e' : (meta.ucolor || '#f2c14e');
        tos.forEach(t => {
          if (v === 0 || kind === 'item') { ring(t.x, t.y, bc, 70, 5, 0.5, 70); ring(t.x, t.y, '#fff3a0', 50, 3, 0.6, 20); for (let i = 0; i < 8; i++) add({ x: t.x + rnd(-40, 40), y: t.y + 30, vx: 0, vy: rnd(-180, -100), c: bc, w: 4, life: 0.5, draw: D.spark, drag: 1 }); }
          else if (v === 1) { smoke(t.x, t.y + 30, bc, 8, 0.4, -120); for (let i = 0; i < 10; i++) add({ x: t.x + rnd(-45, 45), y: t.y + 40, vx: 0, vy: rnd(-260, -140), c: '#fff', w: 3, life: 0.45, draw: D.spark, drag: 1 }); }
          else if (v === 2) { hexShield(t.x, t.y, bc, 72); hexShield(t.x, t.y, '#fff', 56); }
          else { ring(t.x, t.y, bc, 64, 4, 0.6, 64); for (let i = 0; i < 6; i++) { const a0 = i * TAU / 6; add({ x: t.x, y: t.y, r: 7, c: bc, rot: 0, life: 0.6, draw: D.star, update: (p, dt, k) => { const a = a0 + k * 5; p.x = t.x + Math.cos(a) * 60; p.y = t.y + Math.sin(a) * 26 - k * 20; p.rot += dt * 6; } }); } }
        });
        await wait(180);
        break;
      }
      case 'debuff':
        tos.forEach(t => {
          if (v === 0) { smoke(t.x, t.y, '#6a3a8a', 8, 0.55, 30); ring(t.x, t.y, '#b070ff', 20, 5, 0.5, 80); }
          else if (v === 1) { arrows(t.x, t.y, '#8a5ad0', false, 3); smoke(t.x, t.y, '#3a2a4a', 4, 0.4, 30); }
          else if (v === 2) { add({ x: t.x, y: t.y, ang: 0.6, len: 140, c: '#9aa8c8', life: 0.7, draw: D.chain, update: () => {} }); add({ x: t.x, y: t.y, ang: -0.6, len: 140, c: '#9aa8c8', life: 0.7, draw: D.chain, update: () => {} }); }
          else { spiral(t.x, t.y, '#3a1a4a', 60, 6, 0.8, 3); ring(t.x, t.y, '#b070ff', 20, 5, 0.5, 80); }
        });
        await wait(180);
        break;
      default:
        return false;
    }
    return true;
  }
  const midY = tos => tos.reduce((s, t) => s + t.y, 0) / tos.length;

  /* ---------- new, named moves ---------- */
  const MOVES = {
    fire: async (from, tos, m) => {
      await Promise.all(tos.map(t => projectile('fireball', from, t)));
      tos.forEach(t => { flames(t.x, t.y, 16, 30, -170, 24); ring(t.x, t.y, '#e8742a', 80 + m.tier * 16, 7, 0.45); smoke(t.x, t.y - 20, '#4a3a3a', 6, 0.45, -70); if (m.tier >= 2) cross(t.x, t.y - 30, '#ff9a2a', 34, 7); });
    },
    firebind: async (from, tos, m) => {
      tos.forEach(t => { add({ x: (from.x + t.x) / 2, y: (from.y + t.y) / 2, ang: angTo(from, t), len: Math.hypot(t.x - from.x, t.y - from.y), c: '#ff9a2a', life: 0.7, draw: D.chain, update: () => {} }); });
      await wait(220);
      tos.forEach(t => { flames(t.x, t.y, 12, 40, -120, 18); ring(t.x, t.y, '#e8742a', 50, 6, 0.5, 50); });
    },
    ripple: async (from, tos, m) => {
      ring(from.x, from.y, '#ffd84a', 60, 4, 0.4, 10);
      await Promise.all(tos.map(t => projectile('sun', from, t)));
      tos.forEach(t => { for (let i = 0; i < 3 + (m.tier >= 2 ? 1 : 0); i++) setTimeout(() => ring(t.x, t.y, i % 2 ? '#fff3a0' : '#f2a020', 50 + i * 26, 5, 0.45), i * 60 / spd()); sparks(t.x, t.y, '#ffd84a', 14, 6); glyph(t.x, t.y - 44, 'コォォ', '#ffd84a', 34); });
    },
    uv: async (from, tos, m) => {
      tos.forEach(t => beam(from, t, '#e8d0ff', 10 + m.tier * 3, 0.4));
      await wait(160);
      tos.forEach(t => { pillar(t.x, t.y, 'rgba(230,210,255,.9)', 26, 0.5); sparks(t.x, t.y, '#fff3a0', 10, 6); });
    },
    beam: async (from, tos, m) => {
      tos.forEach(t => { beam(from, t, '#bff4ff', 7, 0.3); setTimeout(() => beam({ x: from.x, y: from.y - 6 }, { x: t.x, y: t.y - 6 }, '#fff', 4, 0.25), 60 / spd()); });
      await wait(120);
      tos.forEach(t => { starBurst(t.x, t.y, '#fff', 60, 14, 0.25); ring(t.x, t.y, '#bff4ff', 70, 4, 0.3); sparks(t.x, t.y, '#bff4ff', 16, 9, 2); });
    },
    timestop: async (from, tos, m) => {
      overlay('vfx-grey', 900);
      clock(W / 2, H * 0.45, '#ffd84a', Math.min(W, H) * 0.3, 1);
      ring(from.x, from.y, '#ffd84a', Math.max(W, H) * 0.6, 12, 0.8);
      await wait(300);
      tos.forEach(t => { ring(t.x, t.y, '#ffd84a', 50, 5, 0.4, 50); glyph(t.x, t.y - 40, 'ピタッ', '#ffd84a', 30); });
    },
    timeskip: async (from, tos, m) => {
      overlay('vfx-grey red', 800);
      clock(W / 2, H * 0.45, '#c8323c', Math.min(W, H) * 0.28, 0.9, true);
      await wait(260);
      tos.forEach(t => { for (let i = 0; i < 8; i++) add({ x: t.x + rnd(-50, 50), y: t.y + rnd(-50, 50), vx: rnd(-160, 160), vy: rnd(-160, 160), r: rnd(6, 12), c: i % 2 ? '#c8323c' : '#f6ecd8', rot: rnd(0, TAU), vr: rnd(-6, 6), life: 0.6, draw: D.square, drag: 0.92 }); ring(t.x, t.y, '#c8323c', 60, 6, 0.4); });
    },
    rewind: async (from, tos, m) => {
      tos.forEach(t => { clock(t.x, t.y, '#e8508a', 80, 0.8, true); spiral(t.x, t.y, '#e8508a', 70, 4, 0.8, 3); });
      await wait(260);
      tos.forEach(t => { stars(t.x, t.y, '#e8508a', 8, 200); glyph(t.x, t.y - 50, 'カチッ', '#e8508a', 32); });
    },
    zipper: async (from, tos, m) => {
      await wait(80);
      tos.forEach(t => { const self = m.self; add({ x: t.x, y: self ? t.y + 50 : t.y, ang: self ? 0 : -0.5 + (m.v % 3) * 0.5, len: self ? 130 : 170, c: '#c8ccd8', life: 0.8, draw: D.zipper, update: () => {} }); });
      await wait(260);
      if (!m.self) tos.forEach(t => { debris(t.x, t.y, '#5a8ad0', 8); starBurst(t.x, t.y, '#5a8ad0', 50, 10, 0.25); glyph(t.x, t.y - 44, 'ジィッ', '#5a8ad0', 32); });
    },
    erase: async (from, tos, m) => {
      await wait(80);
      tos.forEach(t => { add({ x: t.x, y: t.y, ang: 0.35 - (m.v % 2) * 0.7, len: 170, w: 26, c: '#3a6ac8', life: 0.7, draw: D.scrape, update: () => {} }); });
      await wait(160);
      tos.forEach(t => { glyph(t.x, t.y - 48, 'ガオン', '#3a6ac8', 42); ring(t.x, t.y, '#05030a', 70, 12, 0.35); stars(t.x, t.y, '#f6ecd8', 6, 160); });
    },
    bomb: async (from, tos, m) => {
      await Promise.all(tos.map(t => projectile('bomb', from, t)));
      tos.forEach(t => glyph(t.x, t.y - 44, 'カチッ', '#e8a0c8', 30));
      await wait(110);
      tos.forEach((t, i) => setTimeout(() => { boom(t.x, t.y); if (m.tier >= 2) flames(t.x, t.y, 10, 40, -140, 24); }, i * 80 / spd()));
    },
    prime: async (from, tos, m) => {
      await Promise.all(tos.map(t => projectile('pin', from, t)));
      tos.forEach(t => { ring(t.x, t.y, '#e8a0c8', 46, 5, 0.5, 46); glyph(t.x, t.y - 44, 'カチッ', '#e8a0c8', 34); stars(t.x, t.y, '#e8a0c8', 5, 120); });
    },
    emerald: async (from, tos, m) => {
      if (m.self) { tos.forEach(t => { hexShield(t.x, t.y, '#3ad07a', 80); gems(t.x, t.y, '#3ad07a', 10, 200); }); await wait(200); return; }
      const n = 3 + m.tier;
      const shots = [];
      for (let i = 0; i < n; i++) tos.forEach(t => shots.push(new Promise(r => setTimeout(() => projectile('gem', { x: from.x + rnd(-20, 20), y: from.y + rnd(-20, 20) }, { x: t.x + rnd(-24, 24), y: t.y + rnd(-24, 24) }, { arc: rnd(-60, 30) }).then(r), i * 35 / spd()))));
      await Promise.all(shots);
      tos.forEach(t => { gems(t.x, t.y, '#3ad07a', 10, 280); ring(t.x, t.y, '#3ad07a', 60, 5, 0.4); });
    },
    rapier: async (from, tos, m) => {
      const n = 5 + m.tier * 2;
      for (let i = 0; i < n; i++) { tos.forEach(t => { const a = rnd(0, TAU); const x = t.x + rnd(-22, 22), y = t.y + rnd(-22, 22); streak({ x: x - Math.cos(a) * 90, y: y - Math.sin(a) * 90 }, { x, y }, '#e8ecf8', 3, 0.22); if (i % 2) sparks(x, y, '#fff', 3, 4, 2); }); await wait(Math.max(28, 260 / n)); }
      tos.forEach(t => { starBurst(t.x, t.y, '#c8ccd8', 44, 16, 0.25); glyph(t.x, t.y - 44, 'シュバ', '#c8ccd8', 30); });
    },
    string: async (from, tos, m) => {
      if (m.self) { tos.forEach(t => { for (let i = 0; i < 6; i++) { const a = i * TAU / 6; add({ a: [t.x, t.y], b: [t.x + Math.cos(a) * 80, t.y + Math.sin(a) * 80], c1: [t.x + Math.cos(a + 0.6) * 50, t.y + Math.sin(a + 0.6) * 50], c: '#4a7ad0', w: 2, life: 0.8, draw: D.curve, update: () => {} }); } ring(t.x, t.y, '#4a7ad0', 70, 3, 0.6, 70); }); await wait(200); return; }
      tos.forEach(t => { for (let i = 0; i < 3; i++) add({ a: [from.x, from.y + (i - 1) * 10], b: [t.x, t.y + (i - 1) * 12], c1: [(from.x + t.x) / 2, Math.min(from.y, t.y) - 50 - i * 30], c: i === 1 ? '#8ab0f0' : '#4a7ad0', w: 2.5, life: 0.75, draw: D.curve, update: () => {} }); });
      await wait(240);
      tos.forEach(t => { ring(t.x, t.y, '#4a7ad0', 40, 4, 0.5, 40); ring(t.x, t.y, '#8ab0f0', 30, 3, 0.5, 30); sparks(t.x, t.y, '#fff', 8, 4, 2); });
    },
    lasso: async (from, tos, m) => {
      tos.forEach(t => add({ a: [from.x, from.y], b: [t.x, t.y - 20], c1: [(from.x + t.x) / 2, Math.min(from.y, t.y) - 120], c: '#c8a070', w: 4, life: 0.8, draw: D.curve, update: () => {} }));
      await wait(220);
      tos.forEach(t => { add({ x: t.x, y: t.y, c: '#c8a070', r: 36, w: 5, r0: 70, life: 0.5, draw: D.ring, update: () => {} }); glyph(t.x, t.y - 50, 'ヒュン', '#c8a070', 28); sparks(t.x, t.y, '#f6ecd8', 6, 4); });
    },
    disc: async (from, tos, m) => {
      const steal = m.v % 2 === 0 && !m.command;
      await Promise.all(tos.map(t => steal ? projectile('disc', t, from, { dur: 0.45 }) : projectile('disc', from, t)));
      tos.forEach(t => { ring(t.x, t.y, '#e8e8f0', 60, 5, 0.45); stars(t.x, t.y, '#a8e8ff', 6, 160); glyph(t.x, t.y - 46, 'ズズッ', '#e8e8f0', 30); });
      if (steal) { ring(from.x, from.y, '#e8e8f0', 50, 4, 0.4); }
    },
    blood: async (from, tos, m) => {
      tos.forEach(t => { for (let i = 0; i < 2 + m.tier; i++) add({ a: [from.x, from.y], b: [t.x + rnd(-15, 15), t.y + rnd(-15, 15)], c1: [(from.x + t.x) / 2 + rnd(-40, 40), (from.y + t.y) / 2 + rnd(-80, 80)], c: '#8a1a2a', w: 4, life: 0.5, draw: D.curve, update: () => {} }); });
      await wait(200);
      tos.forEach(t => { blood(t.x, t.y, 12); ring(t.x, t.y, '#c8323c', 50, 6, 0.4); for (let i = 0; i < 6; i++) { const sx = t.x + rnd(-20, 20), sy = t.y + rnd(-20, 20); add({ x: sx, y: sy, r: rnd(3, 5), c: '#c8323c', ink: true, life: 0.55, draw: D.dot, update: (p, dt, k) => { const e = k * k; p.x = sx + (from.x - sx) * e; p.y = sy + (from.y - sy) * e - Math.sin(Math.PI * k) * 40; } }); } });
    },
    ice: async (from, tos, m) => {
      await Promise.all(tos.map(t => projectile('shard', from, t)));
      tos.forEach(t => { shards(t.x, t.y, '#bfe6ff', 14, 300); ring(t.x, t.y, '#d8f0ff', 70, 6, 0.45); smoke(t.x, t.y, '#e8f6ff', 6, 0.5, -10); glyph(t.x, t.y - 44, 'ピキッ', '#9fd0f0', 30); });
    },
    gatling: async (from, tos, m) => {
      const n = 4 + m.tier;
      for (let i = 0; i < n; i++) { const t = tos[i % tos.length]; starBurst(from.x + (t.x > from.x ? 55 : -55), from.y + rnd(-8, 8), '#fff3a0', 30, 8, 0.15); projectile('bullet', from, { x: t.x + rnd(-20, 20), y: t.y + rnd(-20, 20) }).then(() => sparks(t.x, t.y, '#fff3a0', 5, 6, 2)); await wait(45); }
      await wait(100);
      tos.forEach(t => starBurst(t.x, t.y, '#fff', 48, 10, 0.25));
    },
    life: async (from, tos, m) => {
      tos.forEach(t => { petals(t.x, t.y, '#8adf6a', 8); petals(t.x, t.y, '#f2c14e', 4); ring(t.x, t.y, '#8adf6a', 60, 5, 0.6, 30); });
      await wait(220);
      tos.forEach(t => { stars(t.x, t.y, '#fff3a0', 6, 120); glyph(t.x, t.y - 50, '生', '#8adf6a', 32); });
    },
    restore: async (from, tos, m) => {
      tos.forEach(t => { for (let i = 0; i < 12; i++) { const a = rnd(0, TAU), d = rnd(70, 120), sx = t.x + Math.cos(a) * d, sy = t.y + Math.sin(a) * d; add({ x: sx, y: sy, r: rnd(3, 6), c: i % 2 ? '#e89ac8' : '#f6ecd8', rot: rnd(0, TAU), life: 0.4, draw: D.square, update: (p, dt, k) => { p.x = sx + (t.x - sx) * k; p.y = sy + (t.y - sy) * k; p.rot += dt * 8; } }); } });
      await wait(260);
      tos.forEach(t => { hexShield(t.x, t.y, '#e89ac8', 60); for (let i = 0; i < 8; i++) add({ x: t.x + rnd(-40, 40), y: t.y + rnd(0, 40), vx: 0, vy: rnd(-120, -70), r: rnd(4, 7), c: '#8affa0', rot: 0, life: 0.7, draw: D.star, drag: 0.98 }); });
    },
  };
  function boom(x, y) {
    flash('#ffb040', 120);
    starBurst(x, y, '#ffd84a', 90, 14, 0.35);
    add({ x, y, c: '#e8742a', r: 50, life: 0.5, draw: D.smoke, a: 0.9, update: () => {} });
    ring(x, y, '#fff3a0', 150, 8, 0.5);
    debris(x, y, '#3a2a2a', 12); smoke(x, y, '#5a4a4a', 12, 0.6, -60); sparks(x, y, '#ffd84a', 18, 9);
  }
  /* hit reactions */
  function impact(pt, crit, blocked, dtype) {
    if (blocked) { ring(pt.x, pt.y, '#9fc7e8', 50, 6, 0.35); sparks(pt.x, pt.y, '#d8ecff', 8, 5); return; }
    const dc = dtype ? dtColor(dtype) : '#fff';
    if (crit) { flash('#fff', 120); starBurst(pt.x, pt.y, dtype && dtype !== 'phys' ? dc : '#f2c14e', 110, 16, 0.4); speedLines(pt.x, pt.y, '#fff', 220, 28); stars(pt.x, pt.y, '#e8508a', 8, 300); }
    else { sparks(pt.x, pt.y, '#fff', 6, 5, 2.5); if (dtype) sparks(pt.x, pt.y, dc, 4, 5, 2.5); }
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

  return { init, play, impact, flames, shards, gems, petals, pillar, cross, clock, beam, kana, menace, invert, dot, regen, death, summon, sparks, blood, debris, smoke, stars, ring, starBurst, speedLines, slash, spiral, goldRect, glyph, flash, boom, dust, lightning };
})();
