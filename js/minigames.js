/* Minigames: short skill games that can stand in for a dice check.

   SBR.minigames[id](opts) -> Promise<{ win, score, fate? }>
   A choice can carry  minigame: { id, stat, dc, who, opts }  instead of  check: {...}.
   resolveChoice (js/main.js) plays it and maps win/lose onto ok/fail exactly like a check, so SBR.CONSEQ
   keys 'event:idx[:fail]', outcome strips and fights all keep working.
   Every game offers "Let fate decide", which rolls the ordinary d20 check (stat + dc) instead.

   Games: darby (D'Arby's Gamble), quickdraw (Quickdraw at High Noon), lasso (Lasso Rodeo),
          river (River Ford), golden (Golden Rectangle Training).
   Difficulty (0..1) comes from the act, the card's star risk and the best rider's stat; knobs on SBR.minigames.CFG.
   Tests: SBR.minigames.CFG.autoplay = 'win' | 'lose' (or opts.autoplay) makes a game play itself. */
'use strict';
SBR.minigames = (() => {
  const { el } = SBR.util;
  const K = '#1a1020', PINK = '#e8508a', GOLD = '#f2c14e', VIOLET = '#6b5bd6', PAPER = '#f6ecd8', RED = '#c8323c', TEAL = '#3fb8a9';
  const W = 800, H = 400;
  const CFG = {
    base: 0.2, actStep: 0.1, riskStep: 0.08, statStep: 0.025, bias: 0,
    autoplay: null,            // 'win' | 'lose': every minigame plays itself (tests)
    fate: true,                // offer the "Let fate decide" button
    speed: 1,                  // game clock multiplier
    darby: { rounds: 5, chips: 5, think: 6, bluff: [0.12, 0.42] },
    quickdraw: { rounds: 3, need: 2, react: [0.55, 0.28], fakes: [1, 3] },
    lasso: { throws: 5, need: 3, time: 22, tol: [15, 7], charge: [1.4, 0.95], wobble: [2.0, 4.0] },
    river: { time: 15, hearts: 3, speed: [190, 320], gap: [0.85, 0.48], lanes: 5 },
    golden: { time: 12, tol: [40, 24], need: [0.55, 0.75] },
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const L = (pair, d) => lerp(pair[0], pair[1], d);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const DEFS = {};

  /* ---------------- sound ---------------- */
  const A = SBR.audio;
  const syn = (name, fn) => A.define(name, () => { const c = A.ctx, o = A.master; if (!c || !o) return; try { fn(c, o, c.currentTime); } catch (e) { /* no audio */ } });
  const tone = (c, o, t, f, d, type = 'square', v = 0.12, slide = 0) => {
    const s = c.createOscillator(), g = c.createGain(); s.type = type; s.frequency.setValueAtTime(f, t);
    if (slide) s.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d); s.connect(g); g.connect(o); s.start(t); s.stop(t + d + 0.02);
  };
  syn('mgx_slam', (c, o, t) => { tone(c, o, t, 90, 0.35, 'sawtooth', 0.2, -50); tone(c, o, t + 0.02, 1200, 0.12, 'square', 0.06, -900); });
  syn('mgx_tick', (c, o, t) => tone(c, o, t, 1400, 0.04, 'square', 0.05));
  syn('mgx_cue', (c, o, t) => { tone(c, o, t, 1760, 0.18, 'square', 0.1); tone(c, o, t + 0.09, 2350, 0.25, 'square', 0.1); });
  syn('mgx_whoosh', (c, o, t) => tone(c, o, t, 300, 0.3, 'triangle', 0.1, 900));
  syn('mgx_splash', (c, o, t) => { tone(c, o, t, 500, 0.25, 'sine', 0.12, -380); tone(c, o, t + 0.05, 900, 0.2, 'triangle', 0.05, -600); });
  syn('mgx_chip', (c, o, t) => { tone(c, o, t, 2100, 0.05, 'square', 0.05); tone(c, o, t + 0.05, 2500, 0.06, 'square', 0.04); });
  const sfx = n => { try { SBR.audio.play(n); } catch (e) { /* muted */ } };

  /* ---------------- canvas drawing kit ---------------- */
  let tonePat = null;
  function halftone(g) {
    if (tonePat) return tonePat;
    const c = document.createElement('canvas'); c.width = c.height = 8; const x = c.getContext('2d');
    x.fillStyle = K; x.beginPath(); x.arc(4, 4, 1.5, 0, 7); x.fill();
    tonePat = g.createPattern(c, 'repeat'); return tonePat;
  }
  const D = {
    text(g, s, x, y, o = {}) {
      const size = o.size || 40;
      g.save(); g.font = `${o.weight || ''} ${size}px ${o.font || "Bangers, Impact, sans-serif"}`;
      g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'middle'; g.lineJoin = 'round';
      g.translate(x, y); if (o.rot) g.rotate(o.rot); if (o.scale) g.scale(o.scale, o.scale);
      if (o.alpha != null) g.globalAlpha = o.alpha;
      const lw = o.stroke != null ? o.stroke : Math.max(3, size / 7);
      if (o.shadow !== false && lw) { g.fillStyle = K; g.fillText(s, size / 14, size / 14); }
      if (lw) { g.lineWidth = lw; g.strokeStyle = o.sc || K; g.strokeText(s, 0, 0); }
      g.fillStyle = o.color || '#fff'; g.fillText(s, 0, 0); g.restore();
    },
    kana(g, s, x, y, size = 34, rot = -0.14, color = '#b89ae8', alpha = 1) { D.text(g, s, x, y, { size, rot, color, font: "'Noto Sans JP', sans-serif", weight: 900, alpha }); },
    lines(g, cx, cy, color = K, n = 44, r0 = 120, alpha = 0.3, seed = 0) {
      g.save(); g.globalAlpha = alpha; g.strokeStyle = color;
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + ((i * 7 + seed) % 5) * 0.015; const r = r0 + ((i * 13 + seed) % 6) * 16; g.lineWidth = 1.5 + (i % 4); g.beginPath(); g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.lineTo(cx + Math.cos(a) * 900, cy + Math.sin(a) * 900); g.stroke(); }
      g.restore();
    },
    tone(g, x, y, w, h, alpha = 0.15) { g.save(); g.globalAlpha = alpha; g.fillStyle = halftone(g); g.fillRect(x, y, w, h); g.restore(); },
    ink(g, lw = 3) { g.lineWidth = lw; g.strokeStyle = K; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); },
    circle(g, x, y, r, fill, lw = 3) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) D.ink(g, lw); },
    ball(g, x, y, r, rot = 0) {
      D.circle(g, x, y, r, '#c8ccd8', 3);
      g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); g.moveTo(-r * 0.75, -r * 0.2); g.quadraticCurveTo(0, -r * 0.85, r * 0.75, -r * 0.2); g.moveTo(-r * 0.75, r * 0.3); g.quadraticCurveTo(0, r, r * 0.75, r * 0.3); D.ink(g, 1.6); g.restore();
      D.circle(g, x - r * 0.35, y - r * 0.4, r * 0.22, '#fff', 0);
    },
    heart(g, x, y, s, fill) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(-14, -4, -8, -16, 0, -8); g.bezierCurveTo(8, -16, 14, -4, 0, 6); g.fillStyle = fill; g.fill(); D.ink(g, 2.4 / s); g.restore(); },
    panel(g, x, y, w, h, fill = PAPER) { g.beginPath(); g.rect(x, y, w, h); g.fillStyle = K; g.fillRect(x + 4, y + 4, w, h); g.fillStyle = fill; g.fill(); D.ink(g, 3); },
    wrapText(g, s, x, y, maxW, lh, font = "600 16px Oswald, 'Arial Narrow', sans-serif", color = K) {
      g.save(); g.font = font; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
      const words = String(s).split(' '); let line = '', lines = [];
      words.forEach(w => { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
      if (line) lines.push(line);
      lines.forEach((l, i) => g.fillText(l, x, y + (i - (lines.length - 1) / 2) * lh)); g.restore();
    },
  };
  const leadKey = () => { const l = (SBR.run && SBR.run.lead) || 'johnny'; return (SBR.CHARS && SBR.CHARS[l] && SBR.CHARS[l].portrait) || l; };

  /* ---------------- difficulty ---------------- */
  function bestMember(stat) { const r = SBR.run; if (!r || !r.party || !r.party.length) return null; try { return SBR.game.bestFor(stat); } catch (e) { return r.party[0]; } }
  function difficulty(def, o = {}) {
    if (o.diff != null) return clamp(o.diff, 0, 1);
    const r = SBR.run || {};
    let d = CFG.base + ((r.act || 1) - 1) * CFG.actStep + (r.risk ? (r.risk - 3) * CFG.riskStep : 0) + CFG.bias + (o.harder || 0);
    const stat = o.stat || def.stat;
    const m = stat && ((o.who && r.party && r.party.find(x => x.id === o.who && x.hp > 0)) || bestMember(stat));
    if (m && m.stats && m.stats[stat] != null) d -= (m.stats[stat] - 4) * CFG.statStep;
    return clamp(d, 0, 1);
  }
  const stars = d => 1 + Math.round(d * 4);

  /* ---------------- the frame every game runs in ---------------- */
  function run(id, opts = {}) {
    const def = DEFS[id];
    if (!def) return Promise.resolve({ win: false, score: 0 });
    return new Promise(resolve => {
      const autoOf = () => opts.autoplay || CFG.autoplay || null;
      const calm = !!(SBR.settings && SBR.settings.reducedMotion);
      const diff = difficulty(def, opts);
      const foe = opts.foe || def.foe;
      const wrap = el('div', { class: 'mg-wrap' + (calm ? ' mg-calm' : '') + ' mg-' + id });
      wrap.style.setProperty('--mc', def.color);
      const lk = leadKey();
      wrap.innerHTML = `<div class="mg-bg"></div><div class="mg-speed"></div>
        <div class="mg-kana l">ゴ<br>ゴ<br>ゴ</div><div class="mg-kana r">ド<br>ド<br>ド</div>
        <div class="mg-panel">
          <div class="mg-head"><span class="mg-tag">MINIGAME</span><b class="mg-title">${esc(opts.title || def.name)}</b><span class="mg-diff" title="Difficulty">${'★'.repeat(stars(diff))}${'☆'.repeat(5 - stars(diff))}</span></div>
          <div class="mg-stage"><canvas class="mg-canvas" width="${W}" height="${H}"></canvas>
            <div class="mg-intro">
              <div class="mg-slam"><small>MINIGAME</small><b>${esc(opts.title || def.name)}</b><i>${def.kana || 'ゴゴゴ'}</i></div>
              <div class="mg-card">
                <div class="mg-vs"><div class="mg-port">${SBR.art.portrait(lk)}</div>${foe ? `<span>VS</span><div class="mg-port foe">${SBR.art.portrait(foe)}</div>` : ''}</div>
                <p class="mg-blurb">${esc(opts.blurb || def.blurb)}</p>
                <ul class="mg-how">${def.how.map(h => `<li>${h}</li>`).join('')}</ul>
                <div class="mg-btns"><button class="btn btn-primary mg-start">Start ▸ <kbd>Enter</kbd></button></div>
              </div>
            </div>
            <div class="mg-splash"></div>
          </div>
          <div class="mg-hud"><div class="mg-info"></div><div class="mg-timer"><i></i></div></div>
          <div class="mg-bar"></div>
          <div class="mg-foot"><span class="mg-keys">${def.keys}</span>${CFG.fate ? '<button class="btn btn-ghost mg-fate" title="Skip the minigame and roll the usual dice check">🎲 Let fate decide</button>' : ''}</div>
        </div>`;
      document.getElementById('overlay').appendChild(wrap);
      const canvas = wrap.querySelector('canvas'), g = canvas.getContext('2d');
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = W * dpr; canvas.height = H * dpr;
      const $ = s => wrap.querySelector(s);
      const fx = { shake: 0, flash: 0, flashC: '#fff', pops: [] };
      let phase = 'intro', running = false, raf = 0, last = 0, T = 0, endAt = 0, result = null, finished = false;
      const keys = {}, ptr = { x: W / 2, y: H / 2, down: false, moved: false };

      const ctx = {
        W, H, g, diff, opts, calm, def, lead: lk, foe, D, K, PINK, GOLD, VIOLET, PAPER, RED, TEAL, cfg: CFG[id] || {},
        keys, ptr, sfx,
        get t() { return T; },
        get auto() { return autoOf(); },
        hud(html) { $('.mg-info').innerHTML = html; },
        timer(frac) { const i = $('.mg-timer i'); i.style.width = (clamp(frac, 0, 1) * 100).toFixed(1) + '%'; i.classList.toggle('low', frac < 0.25); },
        bar(list) {
          const b = $('.mg-bar'); b.innerHTML = '';
          (list || []).forEach(o => {
            const n = el('button', { class: 'btn mg-act ' + (o.cls || ''), html: `${o.label}${o.key ? ` <kbd>${o.key}</kbd>` : ''}` });
            n.addEventListener('click', e => { e.stopPropagation(); if (!finished && phase === 'play') o.fn(); });
            b.appendChild(n);
          });
          return b;
        },
        shake(n = 8) { if (!calm) fx.shake = Math.max(fx.shake, n); },
        flash(c = '#fff', n = 0.7) { fx.flash = calm ? Math.min(n, 0.25) : n; fx.flashC = c; },
        pop(text, x, y, o = {}) { fx.pops.push(Object.assign({ text, x, y, t: 0, life: o.life || 1.1, size: o.size || 46, color: o.color || GOLD, rot: o.rot != null ? o.rot : rnd(-0.18, 0.18) }, o)); },
        finish(win, score = 0, line = '') { if (finished) return; finished = true; result = { win: !!win, score: Math.round(score) }; ctx.bar([]); endAt = T + (calm ? 0.35 : 0.8); ctx._line = line; },
      };
      const game = def.make(ctx);

      function render() {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, W, H);
        g.save();
        if (fx.shake > 0.3) g.translate(rnd(-fx.shake, fx.shake), rnd(-fx.shake, fx.shake));
        game.draw(g, T);
        fx.pops.forEach(p => {
          const k = p.t / p.life, s = calm ? 1 : (k < 0.15 ? 0.4 + k / 0.15 * 0.8 : 1.2 - Math.min(0.2, (k - 0.15)));
          D.text(g, p.text, p.x, p.y - (calm ? 0 : k * 26), { size: p.size, color: p.color, rot: p.rot, scale: s, alpha: k > 0.75 ? (1 - k) / 0.25 : 1, font: p.font, weight: p.weight });
        });
        g.restore();
        if (fx.flash > 0.01) { g.save(); g.globalAlpha = fx.flash; g.fillStyle = fx.flashC; g.fillRect(0, 0, W, H); g.restore(); }
      }
      function frame(ts) {
        if (!running) return;
        const dt = Math.min(0.05, (ts - (last || ts)) / 1000) * (CFG.speed || 1); last = ts;
        T += dt;
        if (phase === 'play') {
          const auto = autoOf();
          if (auto && game.auto && !finished) game.auto(dt, auto);
          game.update(dt, T);
        } else if (game.idle) game.idle(dt, T);
        fx.shake *= Math.pow(0.02, dt); fx.flash *= Math.pow(0.03, dt);
        fx.pops.forEach(p => { p.t += dt; }); fx.pops = fx.pops.filter(p => p.t < p.life);
        render();
        if (finished && phase === 'play' && T >= endAt) splash();
        raf = requestAnimationFrame(frame);
      }
      function startLoop() { running = true; last = 0; raf = requestAnimationFrame(frame); }
      function stopLoop() { running = false; cancelAnimationFrame(raf); }

      // intro: the title slams in, the canvas idles dimmed behind it
      startLoop();
      requestAnimationFrame(() => wrap.classList.add('show'));
      sfx('menace'); setTimeout(() => sfx('mgx_slam'), calm ? 0 : 260);
      let prevMusic = null;
      try { prevMusic = SBR.music && SBR.music.current; const th = SBR.MUSIC_THEMES || {}; const key = th['mg_' + id] ? 'mg_' + id : th.minigame ? 'minigame' : null; if (key) SBR.music.play(key); } catch (e) { /* no music */ }

      function begin() {
        if (phase !== 'intro') return;
        phase = 'play'; sfx('select');
        wrap.classList.add('playing');
        if (game.start) game.start();
      }
      function splash() {
        phase = 'result';
        const win = result.win;
        const sp = $('.mg-splash');
        const words = win ? (def.winText || ['YOU WIN!', 'ドン!']) : (def.loseText || ['DEFEAT', 'ガーン']);
        sp.innerHTML = `<div class="mg-stamp ${win ? 'ok' : 'bad'}"><small>${win ? 'SUCCESS' : 'FAILURE'}</small><b>${words[0]}</b><i>${words[1]}</i>${ctx._line ? `<p>${esc(ctx._line)}</p>` : ''}<button class="btn btn-primary mg-cont">Continue ▸ <kbd>Enter</kbd></button></div>`;
        sp.classList.add('show', win ? 'ok' : 'bad');
        sp.querySelector('.mg-cont').addEventListener('click', close);
        sfx(win ? 'success' : 'fail'); if (win) setTimeout(() => sfx('level'), 250);
        if (autoOf()) setTimeout(close, 450);
      }
      function cleanup() {
        stopLoop();
        window.removeEventListener('keydown', onKey, true); window.removeEventListener('keyup', onKeyUp, true);
        try { if (prevMusic && SBR.music.current !== prevMusic) SBR.music.play(prevMusic); } catch (e) { /* no music */ }
      }
      let closed = false;
      function close() {
        if (closed) return; closed = true;
        cleanup();
        wrap.classList.add('out');
        api.last = Object.assign({ id }, result);
        setTimeout(() => { wrap.remove(); resolve(result); }, calm ? 60 : 320);
      }
      function fate() {
        if (closed || phase === 'result') return; closed = true;
        cleanup(); wrap.remove();
        const r = SBR.run, g2 = SBR.game, stat = opts.stat || def.stat;
        if (!r || !r.party || !r.party.length || !g2 || !SBR.ui || !SBR.ui.diceCheck) { const ok = Math.random() < 0.5; api.last = { id, win: ok, score: 0, fate: true }; resolve(api.last); return; }
        const who = (opts.who && r.party.find(m => m.id === opts.who && m.hp > 0)) || g2.bestFor(stat);
        const dc = (opts.dc || def.dc) + (g2.riskDC ? g2.riskDC() : 0);
        SBR.ui.diceCheck({ stat, dc, who, mod: g2.checkMod(who, stat) }).then(ok => { api.last = { id, win: ok, score: 0, fate: true }; resolve(api.last); });
      }
      const fateBtn = $('.mg-fate'); if (fateBtn) fateBtn.addEventListener('click', fate);
      $('.mg-start').addEventListener('click', begin);

      // keys: everything goes to the minigame while it is open (no Chronicle, no card hotkeys underneath)
      function onKey(e) {
        if (!wrap.isConnected) return;
        e.stopImmediatePropagation();
        if (e.key === 'Tab') return;
        e.preventDefault();
        if (phase === 'intro') { if (e.key === 'Enter' || e.key === ' ') begin(); else if ((e.key === 'f' || e.key === 'F') && CFG.fate) fate(); return; }
        if (phase === 'result') { if (!e.repeat && (e.key === 'Enter' || e.key === ' ')) close(); return; }
        if (finished) return;
        keys[e.code] = true;
        if (game.key) game.key(e, true);
      }
      function onKeyUp(e) {
        if (!wrap.isConnected) return;
        e.stopImmediatePropagation();
        keys[e.code] = false;
        if (phase === 'play' && !finished && game.key) game.key(e, false);
      }
      window.addEventListener('keydown', onKey, true);
      window.addEventListener('keyup', onKeyUp, true);
      const toCanvas = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };
      canvas.addEventListener('pointerdown', e => { const p = toCanvas(e); Object.assign(ptr, p, { down: true, moved: true }); if (phase === 'play' && !finished && game.pointer) game.pointer('down', p); try { canvas.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } e.preventDefault(); });
      canvas.addEventListener('pointermove', e => { const p = toCanvas(e); Object.assign(ptr, p, { moved: true }); if (phase === 'play' && !finished && game.pointer) game.pointer('move', p); });
      const up = e => { const p = toCanvas(e); ptr.down = false; if (phase === 'play' && !finished && game.pointer) game.pointer('up', p); };
      canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
      canvas.addEventListener('contextmenu', e => e.preventDefault());
      if (autoOf()) setTimeout(begin, 250);
    });
  }

  /** choice badge for the event panel */
  function badge(spec) {
    const def = DEFS[spec.id] || {};
    const n = el('span', { class: 'choice-check choice-mg', style: { '--c': def.color || PINK } }, `▶ MINIGAME · ${def.short || def.name || spec.id}`);
    if (SBR.tip) SBR.tip.bind(n, `<b>${def.name || spec.id}</b><br>${def.blurb || ''}<br><i>Win to succeed. You can also let fate decide (a ${SBR.STATS[spec.stat || def.stat] ? SBR.STATS[spec.stat || def.stat].name : ''} roll).</i>`);
    return n;
  }
  /** play the minigame a choice asks for */
  function play(spec, ch) {
    return run(spec.id, Object.assign({}, spec.opts || {}, { stat: spec.stat || (DEFS[spec.id] || {}).stat, dc: spec.dc || (DEFS[spec.id] || {}).dc, who: spec.who, label: ch && ch.label }));
  }
  function define(id, def) { DEFS[id] = def; api[id] = o => run(id, o || {}); }

  const api = { CFG, DEFS, define, run, play, badge, difficulty, last: null, D };
  return api;
})();

/* =====================================================================
   1. D'ARBY'S GAMBLE: a card duel for soul chips. Read his tell, call or fold.
   ===================================================================== */
(() => {
  const M = SBR.minigames, D = M.D;
  const K = '#1a1020', GOLD = '#f2c14e', PINK = '#e8508a', VIOLET = '#6b5bd6', PAPER = '#f6ecd8';
  const RANK = r => ({ 11: 'J', 12: 'Q', 13: 'K', 14: 'A' }[r] || String(r));
  const SUITS = ['♠', '♥', '♦', '♣'];
  const TELLS = {
    strong: { text: 'He smiles and blows a perfect smoke ring.', kana: 'フゥー' },
    weak: { text: 'A bead of sweat rolls down his temple.', kana: 'タラ…' },
    mid: { text: 'He taps the deck. Tap. Tap. Nothing else.', kana: 'トン トン' },
  };
  function card(g, x, y, w, h, c, faceUp, rot = 0, glow) {
    g.save(); g.translate(x, y); g.rotate(rot);
    g.fillStyle = K; g.fillRect(-w / 2 + 4, -h / 2 + 4, w, h);
    g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.fillStyle = faceUp ? '#fffaf0' : '#3a2466'; g.fill(); D.ink(g, 3);
    if (glow) { g.strokeStyle = glow; g.lineWidth = 4; g.strokeRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10); }
    if (faceUp && c) {
      const red = c.s === '♥' || c.s === '♦';
      g.fillStyle = red ? '#c8323c' : K; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `${Math.round(h * 0.42)}px Bangers, Impact, sans-serif`; g.fillText(RANK(c.r), 0, -h * 0.05);
      g.font = `${Math.round(h * 0.22)}px serif`; g.fillText(c.s, 0, h * 0.3);
      g.font = `${Math.round(h * 0.15)}px Oswald, sans-serif`; g.fillText(RANK(c.r) + c.s, -w * 0.3, -h * 0.38);
    } else {
      g.strokeStyle = GOLD; g.lineWidth = 2; g.strokeRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12);
      g.fillStyle = GOLD; g.font = `${Math.round(h * 0.3)}px 'Noto Sans JP', sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('魂', 0, 2);
    }
    g.restore();
  }
  function chip(g, x, y, col) {
    g.beginPath(); g.ellipse(x, y + 3, 17, 7, 0, 0, Math.PI * 2); g.fillStyle = K; g.fill();
    g.beginPath(); g.ellipse(x, y, 17, 7, 0, 0, Math.PI * 2); g.fillStyle = col; g.fill(); D.ink(g, 2.2);
    g.beginPath(); g.ellipse(x, y, 9, 3.6, 0, 0, Math.PI * 2); g.strokeStyle = '#fff'; g.lineWidth = 1.6; g.stroke();
  }
  function stack(g, x, y, n, col, label) {
    for (let i = 0; i < n; i++) chip(g, x + (i % 2) * 3, y - i * 6, col);
    // a soul face on the top chip: D'Arby keeps souls in his chips
    if (n) { const ty = y - (n - 1) * 6; g.fillStyle = K; g.beginPath(); g.arc(x - 3, ty - 1, 1.3, 0, 7); g.arc(x + 3, ty - 1, 1.3, 0, 7); g.fill(); }
    D.text(g, `${label} ${n}`, x, y + 26, { size: 18, color: col, font: 'Oswald, sans-serif', weight: 700, stroke: 4, shadow: false });
  }
  M.define('darby', {
    name: 'D\'Arby\'s Gamble', short: 'Gamble', color: '#9a5ad8', stat: 'luck', dc: 14, foe: 'cardsharp', kana: 'グッド!',
    blurb: 'Soul chips on the felt. He bets, you read his tell, then call or fold. End with more chips than you started with.',
    how: ['Each round you see your card. His stays face down, but <b>his face gives him away</b>: a smoke ring means a strong card, sweat means a weak one. Sometimes he bluffs.', '<b>Call</b> to compare cards: the higher card takes his bet. <b>Fold</b> to lose only one chip.', 'Five rounds. Finish with more soul chips than you started with.'],
    keys: '<kbd>C</kbd>/<kbd>1</kbd> Call · <kbd>X</kbd>/<kbd>2</kbd> Fold · or click', winText: ['GOOD!', 'グッド!'], loseText: ['SOUL TAKEN', 'ガシャン'],
    make(c) {
      const C = c.cfg, d = c.diff;
      const st = { round: 0, me: C.chips, him: C.chips, phase: 'wait', t: 0, my: null, his: null, bet: 0, tell: 'mid', shown: false, res: null, think: 0 };
      let deck = [];
      const draw = () => { if (deck.length < 2) { deck = []; for (let r = 2; r <= 14; r++) SUITS.forEach(s => deck.push({ r, s })); deck.sort(() => Math.random() - 0.5); } return deck.pop(); };
      function deal() {
        st.round++; st.my = draw(); st.his = draw(); st.shown = false; st.res = null;
        if (c.auto) { // tests rig the deck so the scripted player's choices decide it
          const want = c.auto === 'win' ? st.round !== 3 : st.round === 3;
          if ((st.my.r > st.his.r) !== want || st.my.r === st.his.r) { if (st.my.r === st.his.r) st.his = { r: st.his.r === 14 ? 13 : st.his.r + 1, s: st.his.s }; if ((st.my.r > st.his.r) !== want) { const t = st.my; st.my = st.his; st.his = t; } }
        }
        const truth = st.his.r >= 10 ? 'strong' : st.his.r <= 6 ? 'weak' : 'mid';
        const bluff = Math.random() < L2(C.bluff, d);
        st.tell = !bluff ? truth : truth === 'strong' ? 'weak' : truth === 'weak' ? 'strong' : (Math.random() < 0.5 ? 'strong' : 'weak');
        st.bet = truth === 'strong' ? (Math.random() < 0.6 ? 3 : 2) : truth === 'weak' ? (Math.random() < 0.35 ? 3 : Math.random() < 0.5 ? 2 : 1) : 2;
        st.bet = Math.min(st.bet, st.me, st.him);
        st.phase = 'deal'; st.t = 0; st.think = 0;
        c.sfx('page'); setTimeout(() => c.sfx('page'), 120);
      }
      const L2 = (p, t) => p[0] + (p[1] - p[0]) * t;
      function decide(call) {
        if (st.phase !== 'think') return;
        c.bar([]);
        st.phase = 'reveal'; st.t = 0; st.shown = true;
        if (!call) { st.me -= 1; st.him += 1; st.res = { text: 'FOLD', sub: '−1 chip', col: '#b8a0e0' }; c.sfx('mgx_chip'); }
        else if (st.my.r > st.his.r) { st.me += st.bet; st.him -= st.bet; st.res = { text: 'YOU WIN THE HAND', sub: `+${st.bet} chips`, col: GOLD }; c.sfx('coin'); c.pop('ドン!', 400, 200, { size: 60 }); c.shake(6); }
        else if (st.my.r < st.his.r) { st.me -= st.bet; st.him += st.bet; st.res = { text: 'HE TAKES IT', sub: `−${st.bet} chips`, col: PINK }; c.sfx('fail'); c.pop('GOOD!', 560, 110, { size: 44, color: '#b8a0e0' }); }
        else st.res = { text: 'PUSH', sub: 'no chips move', col: PAPER };
        c.sfx('spin');
      }
      function hud() { c.hud(`Round <b>${Math.min(st.round, C.rounds)}/${C.rounds}</b> · Your soul chips <b style="color:${PINK}">${st.me}</b> · His <b style="color:#b8a0e0">${st.him}</b> <small>(start ${C.chips})</small>${st.phase === 'think' ? ` · <i>${TELLS[st.tell].text}</i>` : ''}`); }
      return {
        start() { deal(); hud(); },
        update(dt) {
          st.t += dt;
          if (st.phase === 'deal' && st.t > 0.9) { st.phase = 'think'; st.t = 0; hud(); c.bar([{ label: 'Call', key: 'C', cls: 'btn-primary', fn: () => decide(true) }, { label: 'Fold', key: 'X', fn: () => decide(false) }]); c.sfx('mgx_tick'); }
          if (st.phase === 'think') { st.think += dt; c.timer(1 - st.think / C.think); if (st.think >= C.think) decide(false); }
          else c.timer(1 - (st.round - 1) / C.rounds);
          if (st.phase === 'reveal' && st.t > 1.5) {
            if (st.me <= 0 || st.him <= 0 || st.round >= C.rounds) { const win = st.me > C.chips; c.finish(win, st.me, win ? `You leave with ${st.me} soul chips. D'Arby's cigarette falls out of his mouth.` : `You end with ${st.me} soul chips. "Good," he says, and pockets your soul.`); }
            else deal();
            hud();
          }
        },
        auto(dt, mode) { if (st.phase === 'think' && st.think > 0.5) { const better = st.my.r > st.his.r; decide(mode === 'win' ? better : !better); } },
        key(e, down) { if (!down) return; const k = e.key.toLowerCase(); if (k === 'c' || k === '1' || k === 'arrowleft') decide(true); if (k === 'x' || k === 'f' || k === '2' || k === 'arrowright') decide(false); },
        draw(g, T) {
          // saloon back room
          const bg = g.createLinearGradient(0, 0, 0, 400); bg.addColorStop(0, '#2a1438'); bg.addColorStop(1, '#4a2440'); g.fillStyle = bg; g.fillRect(0, 0, 800, 400);
          D.lines(g, 400, 110, '#9a5ad8', 40, 130, 0.18);
          D.tone(g, 0, 0, 800, 400, 0.12);
          // lamp
          g.beginPath(); g.moveTo(400, 0); g.lineTo(400, 20); D.ink(g, 3); g.beginPath(); g.moveTo(360, 34); g.lineTo(440, 34); g.lineTo(420, 20); g.lineTo(380, 20); g.closePath(); g.fillStyle = GOLD; g.fill(); D.ink(g, 3);
          // D'Arby
          const px = 330, py = 26, pw = 140, ph = 168;
          const im = portraitImgSafe(c.foe || 'cardsharp');
          if (im && im.complete && im.naturalWidth) g.drawImage(im, px, py, pw, ph); else { D.circle(g, 400, 100, 48, '#e8c0a0', 3); }
          const tellOn = st.phase === 'think' || (st.phase === 'deal' && st.t > 0.5);
          if (tellOn) {
            const k = (T * 1.2) % 1;
            if (st.tell === 'weak') { const sy = py + ph * 0.34 + k * 34; g.beginPath(); g.moveTo(px + pw * 0.8, sy - 12); g.quadraticCurveTo(px + pw * 0.8 + 9, sy + 4, px + pw * 0.8, sy + 6); g.quadraticCurveTo(px + pw * 0.8 - 9, sy + 4, px + pw * 0.8, sy - 12); g.fillStyle = '#9fd8ff'; g.fill(); D.ink(g, 2); D.kana(g, TELLS.weak.kana, 540, 70, 30, 0.12, '#9fd8ff'); }
            if (st.tell === 'strong') { g.save(); g.fillStyle = '#6a4a2a'; g.translate(px + pw * 0.62, py + ph * 0.7); g.rotate(-0.25); g.fillRect(0, -3, 34, 7); g.strokeStyle = K; g.lineWidth = 2; g.strokeRect(0, -3, 34, 7); g.fillStyle = '#e8742a'; g.fillRect(32, -3, 5, 7); g.restore();
              for (let i = 0; i < 3; i++) { const kk = (k + i / 3) % 1; g.save(); g.globalAlpha = 1 - kk; g.beginPath(); g.ellipse(px + pw * 0.9 + kk * 30, py + ph * 0.55 - kk * 80, 8 + kk * 16, 4 + kk * 7, 0, 0, Math.PI * 2); g.strokeStyle = '#e8e0f0'; g.lineWidth = 3; g.stroke(); g.restore(); }
              D.kana(g, TELLS.strong.kana, 560, 60, 30, 0.12, '#e8e0f0'); }
            if (st.tell === 'mid') { const up = Math.sin(T * 14) > 0; g.save(); g.translate(250, 188 + (up ? -6 : 0)); g.beginPath(); g.ellipse(0, 0, 16, 10, -0.3, 0, Math.PI * 2); g.fillStyle = '#e8c0a0'; g.fill(); D.ink(g, 2.4); g.restore(); if (up) D.kana(g, 'トン', 222, 160, 24, -0.2, PAPER); }
            // the tell caption, so it never relies on the drawing alone
            D.panel(g, 560, 118, 220, 58, PAPER);
            D.wrapText(g, TELLS[st.tell].text, 670, 147, 200, 18, "600 15px Oswald, 'Arial Narrow', sans-serif");
          }
          // felt table
          g.beginPath(); g.ellipse(400, 330, 430, 150, 0, Math.PI, 0); g.lineTo(830, 420); g.lineTo(-30, 420); g.closePath(); g.fillStyle = '#2f7a4a'; g.fill(); D.ink(g, 4);
          g.beginPath(); g.ellipse(400, 330, 400, 128, 0, Math.PI, 0); g.strokeStyle = '#f2c14e88'; g.lineWidth = 2; g.stroke();
          D.tone(g, 0, 200, 800, 200, 0.08);
          // cards
          const dk = st.phase === 'deal' ? Math.min(1, st.t / 0.5) : 1;
          if (st.my) card(g, lerp(400, 330, dk), lerp(230, 312, dk), 76, 108, st.my, true, -0.06, st.shown && st.res && st.my.r > st.his.r ? GOLD : null);
          if (st.his) {
            const flip = st.shown ? Math.min(1, st.t / 0.3) : 0;
            const w = 76 * Math.abs(Math.cos(flip * Math.PI));
            card(g, lerp(400, 470, dk), lerp(230, 252, dk), Math.max(2, w), 108, st.his, flip > 0.5, 0.05, st.shown && st.res && st.his.r > st.my.r ? PINK : null);
          }
          D.text(g, 'YOU', 330, 378, { size: 18, color: PAPER, stroke: 4 }); D.text(g, "D'ARBY", 470, 318, { size: 18, color: '#b8a0e0', stroke: 4 });
          // bet in the pot
          if (st.bet && st.phase !== 'wait') { for (let i = 0; i < st.bet; i++) chip(g, 400 + (i - (st.bet - 1) / 2) * 22, 214, '#b8a0e0'); D.text(g, `BET ${st.bet}`, 400, 190, { size: 20, color: GOLD, stroke: 4 }); }
          stack(g, 130, 350, st.me, PINK, 'YOUR SOUL');
          stack(g, 680, 290, st.him, '#b8a0e0', 'HIS');
          if (st.phase === 'reveal' && st.res) {
            D.text(g, st.res.text, 400, 150, { size: 42, color: st.res.col, rot: -0.04 });
            D.text(g, st.res.sub, 400, 186, { size: 22, color: PAPER, stroke: 4 });
          }
          if (st.phase === 'think') D.kana(g, 'ゴゴゴ', 120, 120, 44, -0.2, '#b89ae8', 0.6 + 0.4 * Math.sin(T * 4));
        },
      };
      function lerp(a, b, t) { return a + (b - a) * t; }
    },
  });
  function portraitImgSafe(k) { return SBR.minigames._img(k); }
})();

/* =====================================================================
   2. QUICKDRAW AT HIGH NOON: fire on DRAW!, not on the fake-outs.
   ===================================================================== */
(() => {
  const M = SBR.minigames, D = M.D;
  const K = '#1a1020', GOLD = '#f2c14e', PINK = '#e8508a', PAPER = '#f6ecd8', RED = '#c8323c';
  const FAKES = ['DRAT!', 'DRAWL…', 'DRAPE!', 'DREW?', 'DRAIN!', 'DAWN!', 'DRAWER!'];
  /** a gunslinger silhouette, feet at (x, y), facing +1 right or -1 left */
  function slinger(g, x, y, s, face, col, pose, t) {
    g.save(); g.translate(x, y); g.scale(s * face, s);
    if (pose === 'down') { g.rotate(-1.35); g.translate(-10, 0); }
    const sway = pose === 'ready' ? Math.sin(t * 2) * 1.5 : 0;
    // legs
    g.beginPath(); g.moveTo(-14, 0); g.lineTo(-8, -58); g.lineTo(8, -58); g.lineTo(16, 0); g.lineTo(6, 0); g.lineTo(0, -40); g.lineTo(-4, 0); g.closePath(); g.fillStyle = '#3a2a3a'; g.fill(); D.ink(g, 3);
    // duster coat
    g.beginPath(); g.moveTo(-20, -112 + sway); g.quadraticCurveTo(0, -122 + sway, 20, -112 + sway); g.lineTo(26, -36); g.lineTo(-24, -34); g.closePath(); g.fillStyle = col.body; g.fill(); D.ink(g, 3);
    g.beginPath(); g.moveTo(-6, -114 + sway); g.lineTo(0, -92 + sway); g.lineTo(6, -114 + sway); g.fillStyle = col.body2; g.fill(); D.ink(g, 2);
    // gun belt + holster
    g.fillStyle = '#5a3a1a'; g.fillRect(-22, -62, 46, 7); g.strokeStyle = K; g.lineWidth = 2; g.strokeRect(-22, -62, 46, 7);
    if (pose !== 'fire') { g.beginPath(); g.rect(16, -60, 10, 22); g.fillStyle = '#6a4a2a'; g.fill(); D.ink(g, 2); g.fillStyle = '#7a7a8a'; g.fillRect(17, -66, 7, 7); }
    // arm
    if (pose === 'fire') {
      g.beginPath(); g.moveTo(10, -104 + sway); g.lineTo(58, -100); D.ink(g, 13); g.strokeStyle = col.body; g.lineWidth = 8; g.stroke();
      g.beginPath(); g.moveTo(56, -106); g.lineTo(84, -106); g.lineTo(84, -99); g.lineTo(64, -99); g.lineTo(62, -90); g.lineTo(55, -90); g.closePath(); g.fillStyle = '#8a8a9a'; g.fill(); D.ink(g, 2.4);
    } else {
      g.beginPath(); g.moveTo(14, -104 + sway); g.lineTo(22, -70); D.ink(g, 13); g.strokeStyle = col.body; g.lineWidth = 8; g.stroke();
      D.circle(g, 22, -68, 6, col.skin, 2.4);
    }
    g.beginPath(); g.moveTo(-14, -104 + sway); g.lineTo(-22, -66); D.ink(g, 13); g.strokeStyle = col.body; g.lineWidth = 8; g.stroke();
    // head + hat
    D.circle(g, 0, -128 + sway, 15, col.skin, 3);
    g.beginPath(); g.ellipse(0, -138 + sway, 32, 7, 0, 0, Math.PI * 2); g.fillStyle = col.hat; g.fill(); D.ink(g, 3);
    g.beginPath(); g.moveTo(-15, -140 + sway); g.quadraticCurveTo(-14, -162 + sway, 0, -160 + sway); g.quadraticCurveTo(14, -162 + sway, 15, -140 + sway); g.closePath(); g.fill(); D.ink(g, 3);
    // eyes: a narrow glare, or crosses when down
    if (pose === 'down') { g.beginPath(); g.moveTo(3, -131); g.lineTo(9, -125); g.moveTo(9, -131); g.lineTo(3, -125); D.ink(g, 2); }
    else { g.beginPath(); g.moveTo(3, -129 + sway); g.lineTo(11, -130 + sway); D.ink(g, 2.4); }
    g.restore();
  }
  M.define('quickdraw', {
    name: 'Quickdraw at High Noon', short: 'Quickdraw', color: '#e8742a', stat: 'aim', dc: 13, foe: 'gunslinger', kana: 'ドドドド',
    blurb: 'Two shadows, one street. Fire the instant the word is DRAW! Anything else and you shot too early.',
    how: ['Wait with your hand on the gun. The word <b>DRAW!</b> flashes up. Fire faster than he does.', 'Other words flash first: <b>DRAT!</b>, <b>DRAWL…</b>, <b>DREW?</b>. Fire on those and it counts as a foul.', 'Best of three. Win two duels.'],
    keys: '<kbd>Space</kbd> / click to fire', winText: ['BANG!', 'ドギュウン'], loseText: ['SHOT DOWN', 'ガーン'],
    make(c) {
      const Q = c.cfg, d = c.diff;
      const me = SBR.minigames._colors(c.lead), him = Object.assign(SBR.minigames._colors(c.foe || 'gunslinger'), c.foe ? {} : { body: '#3a3440', body2: '#1a1020', hat: '#1a1020' });
      const st = { round: 0, wins: 0, losses: 0, phase: 'wait', t: 0, cueAt: 0, t0: 0, fakes: [], rt: 0.4, res: null, tw: -60, lastMs: [] };
      function newRound() {
        st.round++; st.phase = 'wait'; st.t = 0; st.res = null;
        st.cueAt = rnd(1.6, 3.6);
        const nf = Math.round(rnd(Q.fakes[0], Q.fakes[0] + (Q.fakes[1] - Q.fakes[0]) * (0.3 + d)));
        st.fakes = [];
        for (let i = 0; i < nf; i++) { const at = rnd(0.6, st.cueAt - 0.55); if (st.fakes.every(f => Math.abs(f.at - at) > 0.6)) st.fakes.push({ at, word: FAKES[Math.floor(Math.random() * FAKES.length)] }); }
        st.rt = Q.react[0] + (Q.react[1] - Q.react[0]) * d + rnd(0, 0.05);
        st.tw = -60;
        hud();
      }
      const rnd = (a, b) => a + Math.random() * (b - a);
      function hud() { c.hud(`Duel <b>${st.round}/${Q.rounds}</b> · You <b style="color:${GOLD}">${st.wins}</b> – <b style="color:${PINK}">${st.losses}</b> Him${st.lastMs.length ? ` · last draw <b>${st.lastMs[st.lastMs.length - 1]}</b>` : ''}`); }
      function resolve(win, label, ms) {
        st.phase = 'shot'; st.t = 0; st.res = { win, label, ms };
        if (win) st.wins++; else st.losses++;
        if (ms != null) st.lastMs.push((ms * 1000 | 0) + ' ms');
        c.sfx('gun'); if (!win && label !== 'FOUL!') setTimeout(() => c.sfx('gun'), 60);
        c.shake(10); c.flash(win ? '#fff3c0' : '#c8323c', 0.5);
        hud();
      }
      function fire() {
        if (st.phase === 'wait') { resolve(false, 'FOUL!'); c.pop('TOO EARLY', 400, 250, { size: 34, color: PINK }); return; }
        if (st.phase === 'cue') { const ms = st.t - st.t0; resolve(ms < st.rt, ms < st.rt ? 'BANG!' : 'TOO SLOW', ms); }
      }
      const fakeNow = () => st.phase === 'wait' && st.fakes.find(f => st.t >= f.at && st.t < f.at + 0.5);
      return {
        start() { newRound(); },
        update(dt) {
          st.t += dt; st.tw += dt * 90;
          const f = fakeNow(); if (f && !f.played) { f.played = true; c.sfx('mgx_tick'); }
          if (st.phase === 'wait' && st.t >= st.cueAt) { st.phase = 'cue'; st.t0 = st.t; c.sfx('mgx_cue'); c.flash('#fff', 0.35); }
          if (st.phase === 'cue' && st.t - st.t0 >= st.rt) resolve(false, 'TOO SLOW', null);
          if (st.phase === 'shot' && st.t > 1.6) {
            if (st.wins >= Q.need) c.finish(true, st.wins * 100, `You cleared leather first. Draws: ${st.lastMs.join(', ') || '—'}.`);
            else if (st.losses > Q.rounds - Q.need) c.finish(false, st.wins * 100, 'His bullet found you first.');
            else newRound();
          }
          c.timer(st.phase === 'cue' ? 1 - (st.t - st.t0) / st.rt : st.phase === 'wait' ? 1 : 0);
        },
        auto(dt, mode) {
          if (mode === 'win' && st.phase === 'cue' && st.t - st.t0 > 0.12) fire();
          if (mode === 'lose' && st.phase === 'wait' && st.t > 0.9) fire();
        },
        key(e, down) { if (down && !e.repeat && (e.code === 'Space' || e.key === 'Enter' || e.key.toLowerCase() === 'f')) fire(); },
        pointer(type) { if (type === 'down') fire(); },
        draw(g, T) {
          // noon sky, the sun straight overhead
          const sky = g.createLinearGradient(0, 0, 0, 280); sky.addColorStop(0, '#f7b84a'); sky.addColorStop(1, '#fbe3b0'); g.fillStyle = sky; g.fillRect(0, 0, 800, 280);
          const cueOn = st.phase === 'cue' || (st.phase === 'shot' && st.t < 0.4);
          D.lines(g, 400, 70, cueOn ? '#c8323c' : '#e8742a', 48, 70, cueOn ? 0.5 : 0.22, Math.floor(T * (c.calm ? 0 : 8)));
          D.circle(g, 400, 70, 46, '#fff3c0', 3);
          // false fronts
          const front = (x, w, h, sign, col) => { g.beginPath(); g.moveTo(x, 290); g.lineTo(x, 290 - h); g.lineTo(x + w * 0.2, 290 - h); g.lineTo(x + w * 0.2, 290 - h - 16); g.lineTo(x + w * 0.8, 290 - h - 16); g.lineTo(x + w * 0.8, 290 - h); g.lineTo(x + w, 290 - h); g.lineTo(x + w, 290); g.closePath(); g.fillStyle = col; g.fill(); D.ink(g, 3); if (sign) { D.panel(g, x + w * 0.15, 290 - h + 8, w * 0.7, 24, '#e8d8b0'); D.text(g, sign, x + w / 2, 290 - h + 21, { size: 16, color: K, stroke: 0, shadow: false, font: "Rye, serif" }); } g.fillStyle = '#2a1a20'; g.fillRect(x + w * 0.35, 290 - 52, w * 0.3, 52); };
          front(-10, 150, 150, 'SALOON', '#8a5a3a'); front(130, 110, 110, 'BANK', '#6a4a5a');
          front(560, 110, 120, 'JAIL', '#6a5a4a'); front(660, 150, 160, 'HOTEL', '#8a4a3a');
          // street
          g.fillStyle = '#d9a55a'; g.fillRect(0, 280, 800, 120); g.beginPath(); g.moveTo(0, 280); g.lineTo(800, 280); D.ink(g, 3);
          D.tone(g, 0, 280, 800, 120, 0.1);
          // tumbleweed
          if (st.phase === 'wait') { const x = (st.tw % 900) - 50, y = 318 - Math.abs(Math.sin(st.tw / 22)) * 18; g.save(); g.translate(x, y); g.rotate(st.tw / 20); g.beginPath(); for (let i = 0; i < 7; i++) { g.moveTo(0, 0); g.arc(0, 0, 16, i, i + 2.4); } D.ink(g, 2); g.restore(); }
          // the duel
          const r = st.res;
          const mePose = st.phase === 'shot' ? (r.win ? 'fire' : 'down') : 'ready';
          const himPose = st.phase === 'shot' ? (r.win ? 'down' : 'fire') : 'ready';
          g.beginPath(); g.ellipse(190, 344, 40, 8, 0, 0, 7); g.fillStyle = '#1a102033'; g.fill();
          g.beginPath(); g.ellipse(610, 344, 40, 8, 0, 0, 7); g.fill();
          slinger(g, 190, 344, 1.25, 1, me, mePose, T);
          slinger(g, 610, 344, 1.25, -1, him, himPose, T + 1);
          if (st.phase === 'shot' && st.t < 0.25 && r.label !== 'FOUL!') { if (r.win) D.text(g, '✦', 300, 216, { size: 60, color: '#fff3c0' }); else D.text(g, '✦', 500, 216, { size: 60, color: '#fff3c0' }); }
          // the word
          const f = fakeNow();
          if (st.phase === 'wait' && !f) { D.text(g, '…', 400, 170, { size: 60, color: PAPER }); D.text(g, 'hand on the gun', 400, 212, { size: 20, color: K, stroke: 0, shadow: false, font: 'Oswald, sans-serif', weight: 600 }); }
          if (f) D.text(g, f.word, 400, 180, { size: 84, color: '#e8e0d0', rot: -0.05 });
          if (st.phase === 'cue') D.text(g, 'DRAW!', 400, 180, { size: 110, color: RED, sc: K, rot: -0.06, scale: c.calm ? 1 : 1 + Math.max(0, 0.25 - (st.t - st.t0)) });
          if (st.phase === 'shot') { D.text(g, r.label, 400, 170, { size: 70, color: r.win ? GOLD : PINK, rot: -0.05 }); if (r.ms != null) D.text(g, `${(r.ms * 1000) | 0} ms  vs  ${(st.rt * 1000) | 0} ms`, 400, 226, { size: 24, color: PAPER, stroke: 4 }); }
          // round pips
          for (let i = 0; i < Q.rounds; i++) { const won = i < st.wins, lost = i >= st.wins && i < st.wins + st.losses; D.circle(g, 740 - (Q.rounds - 1 - i) * 28, 28, 10, won ? GOLD : lost ? PINK : '#fff8', 3); }
          if (st.phase === 'wait') D.kana(g, 'ゴゴゴ', 90, 90, 40, -0.2, '#6b3a7a', 0.5 + 0.3 * Math.sin(T * 5));
        },
      };
    },
  });
})();

/* =====================================================================
   3. LASSO RODEO: hold to spin the loop, let go when it matches the ring on the bucking steer.
   ===================================================================== */
(() => {
  const M = SBR.minigames, D = M.D;
  const K = '#1a1020', GOLD = '#f2c14e', PINK = '#e8508a', PAPER = '#f6ecd8', TEAL = '#3fb8a9';
  M.define('lasso', {
    name: 'Lasso Rodeo', short: 'Rodeo', color: '#c8903a', stat: 'ride', dc: 13, foe: 'rodeo', kana: 'ヒュンヒュン',
    blurb: 'A bucking steer and a crowd that wants a show. Spin the loop, match it to the ring, and let fly.',
    how: ['<b>Hold</b> to spin your lasso. A rope ring closes in on the steer\'s head.', '<b>Let go</b> when the rope ring sits on the gold ring. The steer bucks, so the gold ring keeps changing size.', 'Hold too long and the rope tangles. Catch the steer <b>three</b> times before you run out of throws.'],
    keys: 'Hold <kbd>Space</kbd> or the mouse button, release to throw', winText: ['YEEHAW!', 'ヒーハー!'], loseText: ['BUCKED OFF', 'ドサッ'],
    make(c) {
      const Q = c.cfg, d = c.diff;
      const tol = Q.tol[0] + (Q.tol[1] - Q.tol[0]) * d, charge = Q.charge[0] + (Q.charge[1] - Q.charge[0]) * d, wob = Q.wobble[0] + (Q.wobble[1] - Q.wobble[0]) * d;
      const me = SBR.minigames._colors(c.lead);
      const st = { t: 0, left: Q.throws, catches: 0, hold: false, holdT: 0, ra: 150, ph: 0, buck: 0, nextBuck: 1.2, cool: 0.4, throwT: -1, judged: null, tx: 0, ty: 0, caughtT: -9, crowd: [] };
      for (let i = 0; i < 60; i++) st.crowd.push({ x: i * 14 + (i % 3) * 3, y: 70 + (i % 2) * 12, c: ['#e8508a', '#f2c14e', '#6b5bd6', '#3fb8a9', '#e8742a'][i % 5] });
      const RA0 = 150;
      const steer = () => { const t = st.t; return { x: 555 + Math.sin(t * 0.8) * 70 + Math.sin(t * 2.1) * 18, y: 262 + Math.sin(t * 1.4) * 10 - Math.abs(Math.sin(st.ph)) * (st.buck > 0 ? 26 : 8) }; };
      const rt = () => 30 + 15 * Math.sin(st.ph);
      function hud() { c.hud(`Catches <b style="color:${GOLD}">${st.catches}/${Q.need}</b> · Throws left <b>${st.left}</b>`); }
      function press() { if (st.cool > 0 || st.throwT >= 0 || st.hold || st.left <= 0) return; st.hold = true; st.holdT = 0; c.sfx('mgx_whoosh'); }
      function release() {
        if (!st.hold) return;
        st.hold = false; st.left--;
        const s = steer(), diff = Math.abs(st.ra - rt());
        st.judged = diff <= tol ? (diff <= tol * 0.45 ? 'PERFECT!' : 'CAUGHT!') : st.ra > rt() ? 'TOO WIDE' : 'TOO TIGHT';
        st.throwT = 0; st.tx = s.x + 44; st.ty = s.y - 34; c.sfx('mgx_whoosh');
      }
      function land() {
        const ok = st.judged === 'PERFECT!' || st.judged === 'CAUGHT!';
        if (ok) { st.catches++; st.caughtT = st.t; c.pop(st.judged, st.tx, st.ty - 40, { color: st.judged === 'PERFECT!' ? GOLD : '#fff' }); c.pop('ヒーハー', 400, 120, { size: 38, font: "'Noto Sans JP', sans-serif", weight: 900, color: PINK }); c.sfx('success'); c.shake(6); }
        else { c.pop(st.judged, st.tx, st.ty - 40, { color: PINK, size: 36 }); c.sfx('miss'); }
        st.throwT = -1; st.cool = 0.55; hud();
        if (st.catches >= Q.need) c.finish(true, st.catches * 100 + st.left * 30, `Roped ${st.catches} times. The crowd throws hats.`);
        else if (st.left <= 0 || st.left < Q.need - st.catches) c.finish(false, st.catches * 100, `Roped ${st.catches} of ${Q.need}. The steer trots off, unbothered.`);
      }
      return {
        start() { hud(); },
        idle(dt) { st.t += dt * 0.5; st.ph += dt * wob * 0.5; },
        update(dt) {
          st.t += dt; st.cool -= dt;
          st.nextBuck -= dt; if (st.nextBuck <= 0) { st.buck = 0.5; st.nextBuck = 0.9 + Math.random() * 1.6; }
          st.buck -= dt;
          st.ph += dt * wob * (st.buck > 0 ? 1.8 : 1);
          if (st.hold) { st.holdT += dt; st.ra = RA0 * (1 - st.holdT / charge); if (st.ra <= 3) { st.hold = false; st.left--; st.judged = 'TANGLED'; st.throwT = 0; const s = steer(); st.tx = s.x + 44; st.ty = s.y - 34; } }
          if (st.throwT >= 0) { st.throwT += dt; if (st.throwT > 0.32) land(); }
          c.timer(1 - st.t / Q.time);
          if (st.t >= Q.time && !st.hold && st.throwT < 0) c.finish(st.catches >= Q.need, st.catches * 100, 'Time. The steer wins this one.');
        },
        auto(dt, mode) {
          if (!st.hold && st.throwT < 0 && st.cool <= 0) press();
          if (st.hold) {
            if (mode === 'win' && Math.abs(st.ra - rt()) < tol * 0.35) release();
            if (mode === 'lose' && st.holdT > 0.08) release();
          }
        },
        key(e, down) { if (e.code !== 'Space' && e.key !== 'Enter') return; if (down && !e.repeat) press(); if (!down) release(); },
        pointer(type) { if (type === 'down') press(); if (type === 'up') release(); },
        draw(g, T) {
          // arena under a dusk sky, bleachers, bunting
          const sky = g.createLinearGradient(0, 0, 0, 150); sky.addColorStop(0, '#6b3a7a'); sky.addColorStop(1, '#f2a65a'); g.fillStyle = sky; g.fillRect(0, 0, 800, 150);
          g.fillStyle = '#7a4a3a'; g.fillRect(0, 60, 800, 70); g.beginPath(); g.moveTo(0, 60); g.lineTo(800, 60); D.ink(g, 3);
          st.crowd.forEach((p, i) => { const b = c.calm ? 0 : Math.abs(Math.sin(T * 6 + i)) * (st.t - st.caughtT < 1.2 ? 8 : 2); D.circle(g, p.x, p.y - b, 6, p.c, 2); });
          for (let i = 0; i < 16; i++) { g.beginPath(); g.moveTo(i * 52, 40); g.lineTo(i * 52 + 26, 58); g.lineTo(i * 52 + 52, 40); g.closePath(); g.fillStyle = i % 2 ? '#c8323c' : PAPER; g.fill(); D.ink(g, 2); }
          g.beginPath(); g.moveTo(0, 40); g.lineTo(800, 40); D.ink(g, 3);
          g.fillStyle = '#c8905a'; g.fillRect(0, 130, 800, 270); D.tone(g, 0, 130, 800, 270, 0.1);
          for (let y = 136; y <= 152; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(800, y); D.ink(g, 6); g.strokeStyle = '#a87a4a'; g.lineWidth = 3; g.stroke(); }
          for (let x = 20; x < 800; x += 80) { g.beginPath(); g.moveTo(x, 128); g.lineTo(x, 160); D.ink(g, 7); }
          // steer
          const s = steer(), rot = (st.buck > 0 ? 0.28 : 0.08) * Math.sin(st.ph * 2);
          g.save(); g.translate(s.x, s.y); g.rotate(rot);
          g.beginPath(); g.ellipse(0, 0, 62, 34, 0, 0, 7); g.fillStyle = '#6a3a1a'; g.fill(); D.ink(g, 3);
          g.beginPath(); g.ellipse(-12, -6, 20, 12, 0.3, 0, 7); g.fillStyle = '#f6ecd8'; g.fill();
          [-40, -18, 18, 40].forEach((lx, i) => { const k = Math.sin(st.ph * 2 + i) * (st.buck > 0 ? 10 : 3); g.beginPath(); g.moveTo(lx, 22); g.lineTo(lx + k, 56); D.ink(g, 9); g.strokeStyle = '#5a2a10'; g.lineWidth = 5; g.stroke(); });
          g.beginPath(); g.moveTo(-60, -6); g.quadraticCurveTo(-82, -20 + Math.sin(T * 8) * 6, -76, 10); D.ink(g, 3);
          g.beginPath(); g.ellipse(58, -22, 22, 18, 0.2, 0, 7); g.fillStyle = '#5a2a10'; g.fill(); D.ink(g, 3);
          g.beginPath(); g.moveTo(48, -36); g.quadraticCurveTo(40, -62, 24, -60); g.moveTo(64, -38); g.quadraticCurveTo(76, -64, 92, -60); g.strokeStyle = K; g.lineWidth = 7; g.stroke(); g.strokeStyle = '#f6ecd8'; g.lineWidth = 4; g.stroke();
          D.circle(g, 66, -24, 3, '#fff', 1.5);
          g.restore();
          if (st.buck > 0) { D.kana(g, 'ブルル', s.x - 60, s.y - 80, 28, -0.2, PAPER); for (let i = 0; i < 3; i++) D.circle(g, s.x - 50 + i * 40, s.y + 58, 10 + i * 3, '#d8c09a', 2); }
          // target ring on the head
          const hx = s.x + 44, hy = s.y - 34, R = rt();
          g.save(); g.beginPath(); g.arc(hx, hy, R, 0, 7); g.strokeStyle = K; g.lineWidth = 9; g.stroke(); g.strokeStyle = GOLD; g.lineWidth = 5; g.stroke();
          g.globalAlpha = 0.25; g.beginPath(); g.arc(hx, hy, R + tol, 0, 7); g.arc(hx, hy, Math.max(1, R - tol), 0, 7, true); g.fillStyle = GOLD; g.fill('evenodd'); g.restore();
          // horse + rider on the left
          const rx = 170, ry = 330;
          g.beginPath(); g.ellipse(rx, ry - 50, 70, 28, 0, 0, 7); g.fillStyle = '#8a5a34'; g.fill(); D.ink(g, 3);
          [-44, -24, 24, 44].forEach((lx, i) => { const k = c.calm ? 0 : Math.sin(T * 5 + i) * 3; g.beginPath(); g.moveTo(rx + lx, ry - 30); g.lineTo(rx + lx + k, ry); D.ink(g, 9); g.strokeStyle = '#6a3a1a'; g.lineWidth = 5; g.stroke(); });
          g.beginPath(); g.moveTo(rx + 56, ry - 66); g.quadraticCurveTo(rx + 80, ry - 110, rx + 100, ry - 96); g.lineTo(rx + 94, ry - 70); g.closePath(); g.fillStyle = '#8a5a34'; g.fill(); D.ink(g, 3);
          g.beginPath(); g.moveTo(rx - 14, ry - 76); g.lineTo(rx - 4, ry - 132); g.lineTo(rx + 16, ry - 132); g.lineTo(rx + 20, ry - 76); g.closePath(); g.fillStyle = me.body; g.fill(); D.ink(g, 3);
          D.circle(g, rx + 6, ry - 148, 14, me.skin, 3);
          g.beginPath(); g.ellipse(rx + 6, ry - 158, 28, 6, 0, 0, 7); g.fillStyle = me.hat; g.fill(); D.ink(g, 3);
          g.beginPath(); g.moveTo(rx - 6, ry - 160); g.quadraticCurveTo(rx + 6, ry - 180, rx + 18, ry - 160); g.fill(); D.ink(g, 3);
          const hand = { x: rx + 30, y: ry - 170 };
          g.beginPath(); g.moveTo(rx + 14, ry - 126); g.lineTo(hand.x, hand.y); D.ink(g, 10); g.strokeStyle = me.body; g.lineWidth = 6; g.stroke();
          // the loop: spinning overhead while held, flying during a throw, a rope line on a catch
          if (st.hold) {
            const a = T * 18; g.save(); g.translate(hand.x, hand.y - 20); g.beginPath(); g.ellipse(0, 0, 40, 12, Math.sin(a) * 0.2, 0, 7); g.strokeStyle = K; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#d8b070'; g.lineWidth = 3; g.setLineDash([6, 4]); g.lineDashOffset = -a * 4; g.stroke(); g.restore();
            const ok = Math.abs(st.ra - R) <= tol;
            g.save(); g.beginPath(); g.arc(hx, hy, Math.max(2, st.ra), 0, 7); g.strokeStyle = K; g.lineWidth = 8; g.stroke(); g.strokeStyle = ok ? TEAL : '#e8d8b0'; g.lineWidth = 4; g.setLineDash([10, 6]); g.lineDashOffset = -T * 60; g.stroke(); g.restore();
            if (ok) D.text(g, 'NOW!', hx, hy - R - 34, { size: 28, color: TEAL, stroke: 5 });
            D.kana(g, 'ヒュンヒュン', hand.x + 20, hand.y - 60, 24, -0.15, PAPER);
          }
          if (st.throwT >= 0) {
            const k = Math.min(1, st.throwT / 0.32), x = hand.x + (st.tx - hand.x) * k, y = hand.y + (st.ty - hand.y) * k - Math.sin(k * Math.PI) * 60;
            g.beginPath(); g.moveTo(hand.x, hand.y); g.quadraticCurveTo((hand.x + x) / 2, Math.min(hand.y, y) - 50, x, y); g.strokeStyle = K; g.lineWidth = 5; g.stroke(); g.strokeStyle = '#d8b070'; g.lineWidth = 2.5; g.stroke();
            g.beginPath(); g.ellipse(x, y, 26, 10, 0, 0, 7); g.strokeStyle = K; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#d8b070'; g.lineWidth = 3; g.stroke();
          }
          if (st.t - st.caughtT < 1) { g.beginPath(); g.moveTo(hand.x, hand.y); g.quadraticCurveTo((hand.x + hx) / 2, hand.y - 30, hx, hy); g.strokeStyle = K; g.lineWidth = 5; g.stroke(); g.strokeStyle = '#d8b070'; g.lineWidth = 2.5; g.stroke(); D.lines(g, hx, hy, '#fff', 30, 60, 0.35); }
          // throws left as coiled ropes
          for (let i = 0; i < Q.throws; i++) { g.beginPath(); g.arc(30 + i * 30, 380, 10, 0, 7); g.strokeStyle = K; g.lineWidth = 6; g.stroke(); g.strokeStyle = i < st.left ? '#d8b070' : '#6a5a4a'; g.lineWidth = 3; g.stroke(); }
          for (let i = 0; i < Q.need; i++) D.text(g, i < st.catches ? '★' : '☆', 690 + i * 34, 380, { size: 30, color: GOLD, stroke: 4 });
        },
      };
    },
  });
})();

/* =====================================================================
   4. RIVER FORD: steer horse and rider across a flooded river. Logs, rocks, rapids and a gator.
   ===================================================================== */
(() => {
  const M = SBR.minigames, D = M.D;
  const K = '#1a1020', GOLD = '#f2c14e', PINK = '#e8508a', PAPER = '#f6ecd8';
  M.define('river', {
    name: 'River Ford', short: 'River Ford', color: '#3a8ac8', stat: 'ride', dc: 13, kana: 'ザバァ',
    blurb: 'The river is high and full of trouble. Swim your horse across without going under.',
    how: ['The current carries logs, rocks and a gator toward you. <b>Change lanes</b> to dodge them.', 'White rapids don\'t hurt, but they shove you sideways.', 'Reach the far bank with at least one heart left.'],
    keys: '<kbd>←</kbd><kbd>→</kbd> or <kbd>A</kbd><kbd>D</kbd> · or click a lane', winText: ['ACROSS!', 'ザバァ!'], loseText: ['SWEPT AWAY', 'ゴボゴボ'],
    make(c) {
      const Q = c.cfg, d = c.diff, N = Q.lanes;
      const X0 = 150, LW = 100, HY = 318;
      const speed = Q.speed[0] + (Q.speed[1] - Q.speed[0]) * d, gap = Q.gap[0] + (Q.gap[1] - Q.gap[0]) * d;
      const horse = (SBR.HORSES && SBR.run && SBR.HORSES[SBR.run.horse]) || {};
      const coat = horse.coat || '#7a4a2a', mane = horse.mane || '#e8e0d0', me = SBR.minigames._colors(c.lead);
      const st = { t: 0, lane: 2, pos: 2, hearts: Q.hearts, inv: 0, obs: [], spawn: 0.4, flow: 0, lastPattern: -1 };
      const laneX = l => X0 + LW * (l + 0.5);
      function spawnRow() {
        const free = new Set([...Array(N).keys()]);
        const row = [];
        const take = (l, w, kind) => { for (let i = 0; i < w; i++) free.delete(l + i); row.push({ lane: l, w, kind, y: -50, hit: false, vx: 0 }); };
        const n = Math.random() < 0.35 + d * 0.3 ? 2 : 1;
        for (let k = 0; k < n; k++) {
          const opts = [...free].filter(l => l < N);
          if (opts.length <= 2) break;
          const roll = Math.random(), l = opts[Math.floor(Math.random() * opts.length)];
          if (roll < 0.35 && free.has(l + 1) && l + 1 < N && opts.length > 3) take(l, 2, 'log');
          else if (roll < 0.6) take(l, 1, 'rock');
          else if (roll < 0.78) take(l, 1, 'rapid');
          else { take(l, 1, 'gator'); row[row.length - 1].vx = (Math.random() < 0.5 ? -1 : 1) * (0.25 + d * 0.35); }
        }
        st.obs.push(...row);
      }
      function hud() { c.hud(`${[...Array(Q.hearts)].map((_, i) => `<span class="mg-heart${i < st.hearts ? '' : ' off'}">♥</span>`).join('')} · Distance <b>${Math.min(100, Math.round(st.t / Q.time * 100))}%</b>`); }
      function move(dir) { st.lane = Math.max(0, Math.min(N - 1, st.lane + dir)); }
      const span = o => { const lx = X0 + LW * (o.lane + (o.kind === 'gator' ? o.off || 0 : 0)); return [lx + 8, lx + LW * o.w - 8]; };
      return {
        start() { hud(); },
        idle(dt) { st.flow += dt * speed * 0.4; },
        update(dt) {
          st.t += dt; st.flow += dt * speed; st.inv -= dt;
          st.pos += Math.sign(st.lane - st.pos) * Math.min(Math.abs(st.lane - st.pos), dt * 9);
          const ending = st.t > Q.time - 1.6;
          st.spawn -= dt; if (st.spawn <= 0 && !ending) { spawnRow(); st.spawn = gap * (0.8 + Math.random() * 0.4); }
          const hx = laneX(st.pos);
          st.obs.forEach(o => {
            o.y += speed * dt * (o.kind === 'rapid' ? 1.1 : 1);
            if (o.kind === 'gator') { o.off = (o.off || 0) + o.vx * dt; if (o.lane + o.off < 0 || o.lane + o.off > N - 1) o.vx *= -1; }
            if (o.hit) return;
            const [a, b] = span(o);
            if (o.y > HY - 40 && o.y < HY + 30 && hx + 22 > a && hx - 22 < b) {
              o.hit = true;
              if (o.kind === 'rapid') { move(st.lane === 0 ? 1 : st.lane === N - 1 ? -1 : (Math.random() < 0.5 ? -1 : 1)); c.sfx('mgx_splash'); c.pop('SPLASH', hx, HY - 60, { size: 30, color: '#9fd0f0' }); return; }
              if (st.inv > 0) return;
              st.hearts--; st.inv = 1.1; c.shake(10); c.flash('#c8323c', 0.35); c.sfx('hit');
              c.pop(o.kind === 'gator' ? 'CHOMP!' : o.kind === 'log' ? 'THUD!' : 'CRACK!', hx, HY - 70, { color: PINK });
              hud();
              if (st.hearts <= 0) c.finish(false, Math.round(st.t / Q.time * 100), 'The current takes you downstream. You crawl out on the wrong bank.');
            }
          });
          st.obs = st.obs.filter(o => o.y < 460);
          c.timer(1 - st.t / Q.time);
          if (Math.floor(st.t * 2) !== Math.floor((st.t - dt) * 2)) hud();
          if (st.t >= Q.time) { c.sfx('mgx_splash'); c.finish(true, st.hearts * 100, st.hearts === Q.hearts ? 'Not a scratch. Your horse shakes the river off like a dog.' : 'Soaked and bruised, but across.'); }
        },
        auto(dt, mode) {
          if (Math.abs(st.pos - st.lane) > 0.05) return;
          const danger = l => { let best = 999; st.obs.forEach(o => { if (o.hit || o.kind === 'rapid') return; const [a, b] = span(o); const x = laneX(l); if (x + 24 > a && x - 24 < b && o.y < HY + 30 && o.y > HY - 260) best = Math.min(best, HY - o.y); }); return best; };
          const cand = [st.lane - 1, st.lane, st.lane + 1].filter(l => l >= 0 && l < N);
          if (mode === 'win') { const cur = danger(st.lane); if (cur > 170) return; const b = cand.sort((p, q) => danger(q) - danger(p))[0]; if (b !== st.lane && danger(b) > cur) st.lane = b; }
          else { const b = cand.sort((p, q) => danger(p) - danger(q))[0]; if (danger(b) < 999) st.lane = b; }
        },
        key(e, down) { if (!down) return; const k = e.key.toLowerCase(); if (k === 'arrowleft' || k === 'a') move(-1); if (k === 'arrowright' || k === 'd') move(1); },
        pointer(type, p) { if (type === 'down' || (type === 'move' && c.ptr.down)) { const l = Math.floor((p.x - X0) / LW); st.lane = Math.max(0, Math.min(N - 1, l)); } },
        draw(g, T) {
          // banks
          g.fillStyle = '#d8b070'; g.fillRect(0, 0, 800, 400); D.tone(g, 0, 0, 800, 400, 0.12);
          for (let i = 0; i < 12; i++) { const y = ((i * 60 + st.flow * 0.5) % 480) - 40; [40, 90, 720, 760].forEach((x, j) => { g.beginPath(); g.moveTo(x + j * 3, y + 20); g.lineTo(x + j * 3 - 6, y - 12); g.moveTo(x + j * 3 + 6, y + 20); g.lineTo(x + j * 3 + 10, y - 8); D.ink(g, 2.4); }); }
          // water
          const wg = g.createLinearGradient(X0, 0, X0 + LW * N, 0); wg.addColorStop(0, '#2a68a8'); wg.addColorStop(0.5, '#3a88c8'); wg.addColorStop(1, '#2a68a8');
          g.fillStyle = wg; g.fillRect(X0, 0, LW * N, 400);
          g.beginPath(); g.moveTo(X0, 0); g.lineTo(X0, 400); g.moveTo(X0 + LW * N, 0); g.lineTo(X0 + LW * N, 400); D.ink(g, 4);
          g.strokeStyle = '#9fd0f0'; g.lineWidth = 2.5; g.globalAlpha = 0.7;
          for (let i = 0; i < 22; i++) { const y = ((i * 37 + st.flow) % 440) - 20, x = X0 + ((i * 131) % (LW * N - 40)) + 10; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y + 8, x + 22, y); g.stroke(); }
          g.globalAlpha = 1;
          for (let l = 1; l < N; l++) { g.save(); g.setLineDash([8, 14]); g.lineDashOffset = -st.flow; g.strokeStyle = '#ffffff30'; g.lineWidth = 2; g.beginPath(); g.moveTo(X0 + l * LW, 0); g.lineTo(X0 + l * LW, 400); g.stroke(); g.restore(); }
          // far bank arrives at the end
          const endK = Math.max(0, (st.t - (c.cfg.time - 1.6)) / 1.6);
          if (endK > 0) { const by = -90 + endK * 190; g.fillStyle = '#9aaa5a'; g.fillRect(X0 - 2, by - 400, LW * N + 4, 400); g.beginPath(); g.moveTo(X0, by); for (let x = X0; x <= X0 + LW * N; x += 25) g.lineTo(x, by + ((x / 25) % 2) * 8); D.ink(g, 3); g.fillStyle = '#9aaa5a'; D.text(g, 'FAR BANK', 400, by - 30, { size: 28, color: GOLD, stroke: 5 }); }
          // obstacles
          st.obs.forEach(o => {
            const [a, b] = span(o), cx = (a + b) / 2, y = o.y;
            if (o.kind === 'log') { g.beginPath(); g.rect(a, y - 18, b - a, 36); g.fillStyle = '#8a5a34'; g.fill(); D.ink(g, 3); for (let x = a + 20; x < b - 10; x += 34) { g.beginPath(); g.moveTo(x, y - 18); g.lineTo(x + 10, y + 18); D.ink(g, 1.6); } g.beginPath(); g.ellipse(b, y, 9, 18, 0, 0, 7); g.fillStyle = '#c8a070'; g.fill(); D.ink(g, 3); g.beginPath(); g.ellipse(b, y, 4, 9, 0, 0, 7); D.ink(g, 1.4); }
            if (o.kind === 'rock') { g.beginPath(); g.moveTo(cx - 34, y + 16); g.lineTo(cx - 26, y - 14); g.lineTo(cx - 4, y - 24); g.lineTo(cx + 24, y - 16); g.lineTo(cx + 34, y + 14); g.closePath(); g.fillStyle = '#8a8898'; g.fill(); D.ink(g, 3); g.beginPath(); g.moveTo(cx - 10, y - 12); g.lineTo(cx + 6, y); D.ink(g, 1.6); g.strokeStyle = '#fff8'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - 40, y + 22); g.quadraticCurveTo(cx, y + 34, cx + 40, y + 22); g.stroke(); }
            if (o.kind === 'rapid') { g.save(); g.globalAlpha = 0.9; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(cx - 30 + i * 15, y + Math.sin(T * 10 + i) * 4, 10, Math.PI, 0); g.fillStyle = '#f0f8ff'; g.fill(); D.ink(g, 2); } g.restore(); D.text(g, '≈', cx, y + 16, { size: 22, color: '#fff', stroke: 3 }); }
            if (o.kind === 'gator') { g.save(); g.translate(cx, y); g.beginPath(); g.ellipse(0, 6, 22, 34, 0, 0, 7); g.fillStyle = '#4a7a3a'; g.fill(); D.ink(g, 3); const jaw = Math.abs(Math.sin(T * 5)) * 8; g.beginPath(); g.moveTo(-12, 30); g.lineTo(-8 - jaw / 2, 58); g.lineTo(0, 44); g.lineTo(8 + jaw / 2, 58); g.lineTo(12, 30); g.fillStyle = '#5a8a4a'; g.fill(); D.ink(g, 3); D.circle(g, -8, 24, 4, '#f2c14e', 2); D.circle(g, 8, 24, 4, '#f2c14e', 2); for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 7, -18); g.lineTo(i * 7, -8); D.ink(g, 2); } g.restore(); }
          });
          // horse + rider, top-down, swimming upstream
          const hx = laneX(st.pos), blink = st.inv > 0 && Math.floor(T * 12) % 2 === 0;
          if (!blink) {
            g.save(); g.translate(hx, HY);
            g.strokeStyle = '#e8f6ff'; g.lineWidth = 3; g.beginPath(); g.moveTo(-26, 40); g.quadraticCurveTo(-40, 64, -30, 84); g.moveTo(26, 40); g.quadraticCurveTo(40, 64, 30, 84); g.stroke();
            g.beginPath(); g.ellipse(0, 10, 22, 40, 0, 0, 7); g.fillStyle = coat; g.fill(); D.ink(g, 3);
            g.beginPath(); g.ellipse(0, -38, 11, 20, 0, 0, 7); g.fillStyle = coat; g.fill(); D.ink(g, 3);
            g.beginPath(); g.moveTo(0, -24); g.lineTo(0, 0); g.strokeStyle = mane; g.lineWidth = 6; g.stroke();
            D.circle(g, 0, 16, 13, me.body, 3); D.circle(g, 0, 14, 9, me.hat, 2.4);
            const paddle = c.calm ? 0 : Math.sin(T * 10) * 6;
            [-1, 1].forEach(sd => { g.beginPath(); g.moveTo(sd * 18, -10); g.lineTo(sd * (30 + paddle), -24); D.ink(g, 6); });
            g.restore();
          }
          // progress: a flag at the top of the rail
          g.beginPath(); g.moveTo(780, 30); g.lineTo(780, 370); D.ink(g, 6); g.strokeStyle = PAPER; g.lineWidth = 3; g.stroke();
          const py = 370 - 340 * Math.min(1, st.t / c.cfg.time); D.circle(g, 780, py, 9, GOLD, 3);
          g.beginPath(); g.moveTo(780, 30); g.lineTo(780, 6); g.lineTo(800, 14); g.lineTo(780, 22); g.fillStyle = PINK; g.fill(); D.ink(g, 2);
          for (let i = 0; i < c.cfg.hearts; i++) D.heart(g, 34 + i * 34, 30, 1.2, i < st.hearts ? '#c8323c' : '#5a4a50');
          D.kana(g, 'ザザザ', 70, 360, 30, -0.15, '#2a68a8', 0.8);
        },
      };
    },
  });
})();

/* =====================================================================
   5. GOLDEN RECTANGLE TRAINING: follow Gyro's ball down the golden spiral.
   ===================================================================== */
(() => {
  const M = SBR.minigames, D = M.D;
  const K = '#1a1020', GOLD = '#f2c14e', PINK = '#e8508a', PAPER = '#f6ecd8', TEAL = '#3fb8a9';
  const PHI = (1 + Math.sqrt(5)) / 2;
  /** squares and the quarter arcs of a golden spiral inside a golden rectangle */
  function build() {
    const h = 316, w = h * PHI;
    let x = (800 - w) / 2, y = 50, rw = w, rh = h;
    const squares = [], arcs = [];
    for (let i = 0; i < 9; i++) {
      const dir = i % 4;
      if (dir === 0) { const s = rh; squares.push([x, y, s]); arcs.push([x + s, y + s, s, Math.PI, Math.PI * 1.5]); x += s; rw -= s; }
      else if (dir === 1) { const s = rw; squares.push([x, y, s]); arcs.push([x, y + s, s, Math.PI * 1.5, Math.PI * 2]); y += s; rh -= s; }
      else if (dir === 2) { const s = rh; squares.push([x + rw - s, y, s]); arcs.push([x + rw - s, y, s, 0, Math.PI * 0.5]); rw -= s; }
      else { const s = rw; squares.push([x, y + rh - s, s]); arcs.push([x + s, y + rh - s, s, Math.PI * 0.5, Math.PI]); rh -= s; }
    }
    const pts = [];
    arcs.forEach(([cx, cy, r, a0, a1]) => { const n = Math.max(6, Math.round(r * 0.9)); for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }); } });
    let len = 0; pts.forEach((p, i) => { if (i) len += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y); p.s = len; });
    return { squares, arcs, pts, len, rect: [(800 - w) / 2, 50, w, h] };
  }
  const FIB = [34, 21, 13, 8, 5, 3, 2, 1, 1];
  M.define('golden', {
    name: 'Golden Rectangle Training', short: 'Golden Spiral', color: '#d8a820', stat: 'spin', dc: 14, foe: 'gyro', kana: 'ギャルルル',
    blurb: 'Gyro sets his steel ball rolling down the golden spiral. Keep your eye, and your finger, on it all the way to the centre.',
    how: ['The steel ball rolls along the golden spiral from the outside in.', '<b>Keep your cursor inside its ring</b> by moving the mouse, or steer with the arrow keys / WASD.', 'Stay on it for enough of the spiral to pass. The target is shown on the meter.'],
    keys: 'Mouse, or <kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd> / <kbd>WASD</kbd>', winText: ['GOLDEN SPIN!', 'ギャルルル!'], loseText: ['OFF THE RATIO', 'グラッ'],
    make(c) {
      const Q = c.cfg, d = c.diff;
      const G = build(), tol = Q.tol[0] + (Q.tol[1] - Q.tol[0]) * d, need = Q.need[0] + (Q.need[1] - Q.need[0]) * d;
      const st = { t: -1.2, s: 0, on: 0, tot: 0, cur: { x: G.pts[0].x, y: G.pts[0].y }, vel: { x: 0, y: 0 }, useMouse: false, trace: [], streak: 0 };
      const at = s => { const P = G.pts; let lo = 0, hi = P.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (P[m].s < s) lo = m + 1; else hi = m; } const b = P[lo], a = P[Math.max(0, lo - 1)]; const k = b.s - a.s ? (s - a.s) / (b.s - a.s) : 0; return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }; };
      function hud() { const acc = st.tot ? st.on / st.tot : 1; c.hud(`On the ball <b style="color:${acc >= need ? TEAL : PINK}">${Math.round(acc * 100)}%</b> · need <b>${Math.round(need * 100)}%</b>`); }
      return {
        start() { hud(); },
        update(dt) {
          st.t += dt;
          // steer the cursor: the mouse wins when it moves, keys otherwise
          if (c.ptr.moved) { st.useMouse = true; c.ptr.moved = false; }
          const kx = (c.keys.ArrowRight || c.keys.KeyD ? 1 : 0) - (c.keys.ArrowLeft || c.keys.KeyA ? 1 : 0), ky = (c.keys.ArrowDown || c.keys.KeyS ? 1 : 0) - (c.keys.ArrowUp || c.keys.KeyW ? 1 : 0);
          if (kx || ky) st.useMouse = false;
          if (st.useMouse) { st.cur.x = c.ptr.x; st.cur.y = c.ptr.y; }
          else { const acc = 1400; st.vel.x = (st.vel.x + kx * acc * dt) * Math.pow(0.004, dt); st.vel.y = (st.vel.y + ky * acc * dt) * Math.pow(0.004, dt); st.cur.x = Math.max(0, Math.min(800, st.cur.x + st.vel.x * dt)); st.cur.y = Math.max(0, Math.min(400, st.cur.y + st.vel.y * dt)); }
          if (st.t < 0) { c.timer(1); return; }
          // ease: a little slower as the spiral tightens so the centre stays readable
          const k = Math.min(1, st.t / Q.time), eased = 1 - Math.pow(1 - k, 1.35);
          st.s = eased * G.len;
          const b = at(st.s), inside = Math.hypot(st.cur.x - b.x, st.cur.y - b.y) <= tol;
          st.tot += dt; if (inside) { st.on += dt; st.streak += dt; } else st.streak = 0;
          st.trace.push({ s: st.s, ok: inside });
          if (Math.floor(st.t * 4) !== Math.floor((st.t - dt) * 4)) hud();
          if (inside && Math.floor(st.t * 3) !== Math.floor((st.t - dt) * 3)) c.sfx('mgx_tick');
          c.timer(1 - k);
          if (k >= 1) { const acc = st.on / st.tot; c.shake(acc >= need ? 8 : 0); if (acc >= need) c.sfx('spin'); c.finish(acc >= need, Math.round(acc * 100), `You stayed on the ball for ${Math.round(acc * 100)}% of the spiral (needed ${Math.round(need * 100)}%).`); }
        },
        auto(dt, mode) {
          const b = at(st.s);
          if (mode === 'win') { st.useMouse = true; c.ptr.x = b.x + Math.sin(st.t * 3) * tol * 0.3; c.ptr.y = b.y; c.ptr.moved = true; }
          else { st.useMouse = true; c.ptr.x = 60; c.ptr.y = 360; c.ptr.moved = true; }
        },
        draw(g, T) {
          g.fillStyle = '#f3e6c4'; g.fillRect(0, 0, 800, 400); D.tone(g, 0, 0, 800, 400, 0.08);
          D.lines(g, G.arcs[8][0], G.arcs[8][1], '#d8a820', 36, 140, 0.16);
          const [rx, ry, rw, rh] = G.rect;
          g.fillStyle = '#fff6dc'; g.fillRect(rx, ry, rw, rh);
          G.squares.forEach(([x, y, s], i) => { g.beginPath(); g.rect(x, y, s, s); D.ink(g, 2); if (s > 26) { g.save(); g.globalAlpha = 0.28; g.fillStyle = K; g.font = `${Math.max(12, s * 0.28)}px Bangers, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(FIB[i]), x + s / 2, y + s / 2); g.restore(); } });
          g.beginPath(); g.rect(rx, ry, rw, rh); D.ink(g, 4);
          // the full spiral, faint
          g.save(); g.setLineDash([4, 6]); g.beginPath(); G.pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.strokeStyle = '#b8903a'; g.lineWidth = 2.5; g.stroke(); g.restore();
          // what you traced: gold where you held on, pink where you slipped
          if (st.trace.length > 1) {
            g.lineWidth = 7; g.lineCap = 'round';
            let prev = at(st.trace[0].s);
            st.trace.forEach((tp, i) => { if (!i) return; const p = at(tp.s); g.beginPath(); g.moveTo(prev.x, prev.y); g.lineTo(p.x, p.y); g.strokeStyle = tp.ok ? GOLD : PINK; g.stroke(); prev = p; });
          }
          D.text(g, '1 : 1.618', rx + rw - 60, ry + rh + 18, { size: 18, color: '#b8903a', stroke: 3, shadow: false });
          D.kana(g, '黄金長方形', 70, 60, 26, -0.2, GOLD);
          // the ball and its ring
          const b = at(Math.max(0, st.s));
          const inside = Math.hypot(st.cur.x - b.x, st.cur.y - b.y) <= tol;
          g.save(); g.beginPath(); g.arc(b.x, b.y, tol, 0, 7); g.fillStyle = inside ? '#3fb8a922' : '#e8508a18'; g.fill(); g.setLineDash([6, 5]); g.lineDashOffset = -T * 30; g.strokeStyle = inside ? TEAL : PINK; g.lineWidth = 2.5; g.stroke(); g.restore();
          D.ball(g, b.x, b.y, 13, T * (c.calm ? 2 : 14));
          if (!c.calm) for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(b.x, b.y, 18 + i * 5, T * 9 + i * 2, T * 9 + i * 2 + 1.4); g.strokeStyle = TEAL; g.lineWidth = 2; g.stroke(); }
          // your cursor: a spinning nail
          g.save(); g.translate(st.cur.x, st.cur.y); g.rotate(T * 6);
          g.beginPath(); g.moveTo(0, -12); g.lineTo(5, 0); g.lineTo(0, 12); g.lineTo(-5, 0); g.closePath(); g.fillStyle = inside ? '#e8d8f0' : PINK; g.fill(); D.ink(g, 2.4); g.restore();
          if (st.streak > 1.2) D.kana(g, 'ギャルルル', Math.min(700, b.x + 70), Math.max(40, b.y - 40), 28, -0.2, TEAL);
          if (st.t < 0) { D.text(g, st.t < -0.6 ? 'READY…' : 'FOLLOW THE BALL!', 400, 200, { size: 54, color: GOLD, rot: -0.04 }); }
          // meter
          const acc = st.tot ? st.on / st.tot : 1;
          g.beginPath(); g.rect(20, 110, 18, 200); g.fillStyle = '#fff'; g.fill(); D.ink(g, 3);
          g.fillStyle = acc >= need ? TEAL : PINK; g.fillRect(22, 110 + 200 * (1 - acc), 14, 200 * acc);
          g.beginPath(); g.moveTo(14, 110 + 200 * (1 - need)); g.lineTo(44, 110 + 200 * (1 - need)); D.ink(g, 3);
        },
      };
    },
  });
})();

/* shared helpers the games above reach through the module */
(() => {
  const M = SBR.minigames;
  const IMG = {};
  M._img = key => {
    if (IMG[key]) return IMG[key];
    let svg = ''; try { svg = SBR.art.portrait(key, { nobg: true }); } catch (e) { svg = ''; }
    if (svg && !/xmlns=/.test(svg)) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    const im = new Image(); if (svg) im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    IMG[key] = im; return im;
  };
  M._colors = key => { const p = (SBR.art.P && SBR.art.P[key]) || {}; return { body: p.outfit || '#6a4a2a', body2: p.outfit2 || '#3a2a1a', skin: p.skin || '#e8c0a0', hat: p.hatColor || p.hair || '#3a2a1a' }; };
})();

/* =====================================================================
   Encounters that play a minigame. Each choice has an SBR.CONSEQ entry (Chronicle deed, faction moves),
   and each event has a drawn scene (js/evscene.js) with panels for the minigame's win and loss.
   ===================================================================== */
(() => {
  if (!SBR.EVENTS || !SBR.CONSEQ) return;
  const mg = (id, stat, dc, opts) => ({ id, stat, dc, opts: opts || {} });
  const EV = [
    { id: 'mg_noon', acts: [1, 2, 3, 4, 5], type: 'event', title: 'High Noon on Main Street', blurb: 'A gunslinger with a notched belt calls you out.', icon: 'sword', weight: 2, once: true, pace: -3, art: 'kansasgun',
      text: 'A gunslinger with eleven notches on his belt steps into the street. Shutters slam. "They say you\'re fast, racer. The whole town\'s watching. Noon, or you leave on foot."',
      choices: [
        { label: 'Meet him at noon', minigame: mg('quickdraw', 'aim', 14, { foe: 'kansasgun', title: 'High Noon on Main Street' }),
          ok: { text: 'He hits the dirt and his hat rolls to your boots. The sheriff pays the bounty on him and the saloon won\'t take your money. ($45, chosen rider +1 AIM.)', fx: g => { g.money(45); g.statUp('choose', 'aim', 1); } },
          fail: { text: 'His bullet grazes you and the town laughs. You leave the way he said you would: on foot, and lighter. (A rider is hurt, lose an item.)', fx: g => { g.hurtRandomPct(0.3); g.loseItem(); } } },
        { label: 'Pay him to find someone else ($25)', cost: { money: 25 }, ok: { text: 'He counts it twice, spits, and walks back into the saloon. Somebody in the crowd boos.', fx: g => g.pace(3) } },
        { label: 'Shoot the gun out of his hand before noon', ok: { text: 'You fire early. His friends come out of the saloon, and the town is on their side.', fight: { enemies: ['gunslingerboss', 'outlaw'], after: g => g.money(20) } } },
      ] },
    { id: 'mg_ford', acts: [1, 2, 3, 4, 5, 6], type: 'event', title: 'The Flooded Ford', blurb: 'Spring melt has turned the crossing into a brown torrent.', icon: 'horseshoe', weight: 3, once: true, pace: 0,
      text: 'The ford on the race map is gone under a brown torrent. Logs tumble past, and something with eyes floats by the far bank. The next bridge is ten miles upstream.',
      choices: [
        { label: 'Swim the horses across', minigame: mg('river', 'ride', 13),
          ok: { text: 'Your horse finds its footing on the far bank and shakes off like a dog. Everyone who went round by the bridge is behind you now. (+14 pace.)', fx: g => { g.pace(14); g.xp(10); } },
          fail: { text: 'The river takes a saddlebag and a lot of skin, but you crawl out on the right side. (Party takes damage, lose an item, +5 pace.)', fx: g => { g.hurtAll(0.15); g.loseItem(); g.pace(5); } } },
        { label: 'Ride upstream to the bridge (−10 pace)', ok: { text: 'Ten slow miles. The bridge is crowded with racers who had the same idea.', fx: g => g.pace(-10) } },
        { label: 'Pay the ferryman ($20)', cost: { money: 20 }, ok: { text: 'He poles you across without a word, and charges extra for the horse. (+4 pace.)', fx: g => g.pace(4) } },
      ] },
    { id: 'mg_steer', acts: [1, 2, 3, 4], type: 'event', title: 'Stampede on Market Street', blurb: 'A longhorn has broken loose in town.', icon: 'flag', weight: 2, once: true, pace: -2, art: 'baron',
      text: 'A longhorn has smashed out of the stockyard and is charging down Market Street, straight at a family\'s wagon. The rancher is shouting from the far end: "Somebody rope that animal!"',
      choices: [
        { label: 'Rope it before it hits the wagon', minigame: mg('lasso', 'ride', 13, { title: 'Rope the Runaway Longhorn' }),
          ok: { text: 'The loop lands and the steer skids to a stop a yard from the wagon. The father pumps your hand; the rancher pays for his animal. ($30, Leather ×2.)', fx: g => { g.money(30); g.mat('leather', 2); } },
          fail: { text: 'It drags you through a fruit stall before the rancher\'s boys pile on. The wagon survives, you mostly do. (A rider is hurt.)', fx: g => g.hurtRandomPct(0.3) } },
        { label: 'Shoot it', ok: { text: 'One shot, and the street goes quiet. The rancher sends you a bill. The family sends you a steak. (Hide ×2, −$15.)', fx: g => { g.mat('hide', 2); g.money(-15); } } },
        { label: 'Pull the family clear and let it run', ok: { text: 'The steer flattens the wagon. The family is fine, and presses their last tin of coffee on you.', fx: g => g.item('coffee') } },
      ] },
    { id: 'mg_spiral', acts: [1, 2, 3, 4, 5], type: 'trainer', title: 'The Snail on the Fencepost', blurb: 'Gyro holds up a snail shell like a holy relic.', icon: 'train', weight: 2, once: true, pace: -4, art: 'gyro', cond: g => g.inParty('gyro'),
      text: 'Gyro holds up a snail shell. "Nature\'s golden rectangle. Follow the spiral with your eyes, then your finger, then your soul." He sets his steel ball rolling along a spiral scratched in the dirt. "Nyoho. Keep up."',
      choices: [
        { label: 'Follow the ball down the spiral', minigame: mg('golden', 'spin', 14, { foe: 'gyro' }),
          ok: { text: '"You see it now. The ratio is everywhere." Gyro looks almost proud. (Chosen rider +2 SPIN.)', fx: g => g.statUp('choose', 'spin', 2) },
          fail: { text: '"Close. The spiral doesn\'t forgive, but it does repeat. Again tomorrow." (Chosen rider +1 SPIN.)', fx: g => g.statUp('choose', 'spin', 1) } },
        { label: 'Ask how the Steel Ball really works', ok: { text: 'He won\'t say. He shows you instead, very slowly, twice. (Train an ability.)', fx: g => g.train() } },
        { label: 'Eat the snail', ok: { text: 'Gyro stares at you for a long time. "...Okay." Nobody talks about it again. (Party heals 15%.)', fx: g => g.healAll(0.15) } },
      ] },
    { id: 'mg_soulbet', acts: [2, 3, 4, 5], type: 'event', title: 'The Soul Gambler', blurb: 'A dapper man plays cards for things money can\'t buy.', icon: 'dice', weight: 2, once: true, pace: -3, art: 'cardsharp',
      text: 'In the back room of a hotel, a dapper man shuffles a deck one-handed. His poker chips have tiny faces on them, and some of the faces are screaming. "I don\'t play for money. Money is boring. Wager your soul, and I\'ll wager a treasure."',
      choices: [
        { label: 'Wager your soul', minigame: mg('darby', 'luck', 15, { foe: 'cardsharp' }),
          ok: { text: 'His cigarette falls out of his mouth. He slides a velvet box across the felt and won\'t look at you. (Gain a rare relic.)', fx: g => g.relicRandom('rare') },
          fail: { text: 'Something cold is pulled out through your chest. You win most of it back by dawn, at a price. (A rider gains 1 Exhaustion, −$30.)', fx: g => { g.exhaust('random', 1); g.money(-30); } } },
        { label: 'Crack one of his chips open (RESOLVE)', check: { stat: 'res', dc: 14 }, ok: { text: 'The chip splits and a soul sighs out of it like steam. The gambler bolts through the window. (+25 XP.)', fx: g => g.xp(25) }, fail: { text: 'He snaps his fingers. The hotel\'s "security" has been standing behind you the whole time.', fight: { enemies: ['casino_thug', 'casino_thug'] } } },
        { label: 'Back out of the room slowly', ok: { text: '"Good," he says to nobody, and deals himself a hand. You feel lucky to be leaving. (Party +1 LUCK.)', fx: g => g.statUpAll('luck', 1) } },
      ] },
    { id: 'mg_fair', acts: [1, 2, 3, 4], type: 'event', title: 'The County Fair', blurb: 'Bunting, lemonade, and a prize table groaning with silver.', icon: 'star', weight: 2, once: true, pace: -3, art: 'rodeo',
      text: 'Bunting, lemonade, a brass band slightly out of tune. Two contests are open to racers: the roping ring and the quickdraw booth. The prize table glints in the sun.',
      choices: [
        { label: 'Enter the roping contest', minigame: mg('lasso', 'ride', 13, { foe: 'rodeo', title: 'County Fair Roping' }),
          ok: { text: 'Blue ribbon. The judges throw in a purse and a jar of preserves. ($40, +15 XP.)', fx: g => { g.money(40); g.xp(15); } },
          fail: { text: 'Last place, but the crowd is kind about it. A kid gives you his lemonade. (+5 XP.)', fx: g => g.xp(5) } },
        { label: 'Enter the quickdraw booth', minigame: mg('quickdraw', 'aim', 13, { foe: 'deputy', title: 'County Fair Quickdraw' }),
          ok: { text: 'Fastest hand in the county. The prize is a silver dollar that seems to bring luck. ($25, Silver Dollar.)', fx: g => { g.money(25); g.gear('silver_dollar'); } },
          fail: { text: 'The deputy running the booth beats you three times and kindly explains why. (+5 XP.)', fx: g => g.xp(5) } },
        { label: 'Buy lemonade and sit in the shade ($5)', cost: { money: 5 }, ok: { text: 'Cold lemonade, a brass band, an hour without anyone shooting at you. (Party heals 25%.)', fx: g => g.healAll(0.25) } },
      ] },
  ];
  EV.forEach(e => { if (!SBR.EVENTS.some(x => x.id === e.id)) SBR.EVENTS.push(e); });

  Object.assign(SBR.CONSEQ, {
    'mg_noon:0': { rep: { law: 1 }, deed: 'Outdrew a gunslinger at high noon on Main Street.' },
    'mg_noon:0:fail': { rep: { racers: -1 }, deed: 'Lost a high-noon duel and left town on foot.' },
    'mg_noon:1': { rep: { racers: -1 }, deed: 'Paid off a gunslinger rather than face him.' },
    'mg_noon:2': { rep: { law: -1 }, deed: 'Fired before noon in a called-out duel.', threat: 0.3 },
    'mg_ford:0': { rep: { racers: 1 }, deed: 'Swam the horses across a flooded ford.' },
    'mg_ford:0:fail': { deed: 'Nearly drowned crossing a flooded ford.' },
    'mg_ford:1': { deed: 'Rode ten miles round a flooded ford.' },
    'mg_ford:2': { rep: { natives: 1 }, deed: 'Paid a ferryman across the flood.' },
    'mg_steer:0': { rep: { law: 1 }, deed: 'Roped a runaway longhorn before it hit a family wagon.' },
    'mg_steer:0:fail': { rep: { law: 1 }, deed: 'Got dragged through a market trying to rope a longhorn.' },
    'mg_steer:1': { rep: { law: -1 }, deed: 'Shot a rancher’s runaway steer in the street.' },
    'mg_steer:2': { rep: { racers: 1 }, deed: 'Pulled a family clear of a stampeding steer.' },
    'mg_spiral:0': { rep: { naples: 1 }, deed: 'Followed Gyro’s ball down the golden spiral.' },
    'mg_spiral:0:fail': { rep: { naples: 1 }, deed: 'Lost the golden spiral halfway down.' },
    'mg_spiral:1': { rep: { naples: 1 }, deed: 'Asked Gyro how the Steel Ball really works.' },
    'mg_spiral:2': { deed: 'Ate the snail Gyro was using as a teaching aid.' },
    'mg_soulbet:0': { rep: { vatican: -1 }, deed: 'Bet your soul at cards, and won.' },
    'mg_soulbet:0:fail': { rep: { vatican: -1 }, deed: 'Bet your soul at cards, and lost part of it.' },
    'mg_soulbet:1': { rep: { vatican: 1 }, deed: 'Freed a soul from a gambler’s poker chip.' },
    'mg_soulbet:1:fail': { rep: { law: -1 }, deed: 'Brawled with a soul gambler’s hotel guards.' },
    'mg_soulbet:2': { deed: 'Walked away from a game played for souls.' },
    'mg_fair:0': { rep: { law: 1 }, deed: 'Won the roping contest at a county fair.' },
    'mg_fair:0:fail': { deed: 'Came last in a county-fair roping contest.' },
    'mg_fair:1': { rep: { law: 1 }, deed: 'Won the quickdraw booth at a county fair.' },
    'mg_fair:1:fail': { deed: 'Lost the county-fair quickdraw to the deputy.' },
    'mg_fair:2': { deed: 'Spent an hour at the county fair in the shade.' },
  });

  /* ---------- drawn scenes ---------- */
  if (!SBR.evs) return;
  const K = '#1a1020';
  const add = SBR.evs.add;
  const LK = () => { const l = (SBR.run && SBR.run.lead) || 'johnny'; return (SBR.CHARS && SBR.CHARS[l] && SBR.CHARS[l].portrait) || l; };
  const mount = () => { const h = (SBR.HORSES && SBR.run && SBR.HORSES[SBR.run.horse]) || {}; return { coat: h.coat || '#7a4a2a', mane: h.mane || '#e8e0d0', wrap: h.wrap || '#8a5ad0' }; };
  const street = S => S.bg({ pal: 1, far: false }) + `<path d="M0 250H800V360H0Z" fill="#d9a55a"/><path d="M0 250H800" stroke="${K}" stroke-width="3"/>`
    + [[0, 150, 'SALOON', '#8a5a3a'], [650, 150, 'HOTEL', '#8a4a3a']].map(([x, w, t, c]) => `<path d="M${x} 250V110H${x + w}V250Z" fill="${c}" stroke="${K}" stroke-width="3"/><rect x="${x + 20}" y="124" width="${w - 40}" height="26" fill="#e8d8b0" stroke="${K}" stroke-width="2.5"/><text x="${x + w / 2}" y="143" font-family="Rye,serif" font-size="17" text-anchor="middle" fill="${K}">${t}</text><rect x="${x + w / 2 - 20}" y="196" width="40" height="54" fill="#2a1a20" stroke="${K}" stroke-width="2.5"/>`).join('');
  const water = (y = 230, h = 90) => `<path d="M0 ${y}Q200 ${y - 12} 400 ${y}T800 ${y}V${y + h}H0Z" fill="#3a78b8" stroke="${K}" stroke-width="3"/>${[...Array(12)].map((_, i) => `<path d="M${(i * 71) % 780} ${y + 18 + (i % 4) * 16}q14 -8 28 0" stroke="#9fd0f0" stroke-width="3" fill="none"/>`).join('')}`;
  const spiral = (x, y, r, c = '#f2c14e') => { let d = ''; for (let i = 0; i <= 80; i++) { const a = i * 0.26, rr = r * Math.pow(0.95, 80 - i); d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr * 0.6).toFixed(1); } return `<path d="${d}" fill="none" stroke="${K}" stroke-width="7"/><path d="${d}" fill="none" stroke="${c}" stroke-width="4"/>`; };
  const ball = (x, y, r = 12) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#c8ccd8" stroke="${K}" stroke-width="2.4"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.22}" fill="#fff"/>`;
  const rope = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}Q${(x1 + x2) / 2} ${Math.min(y1, y2) - 50} ${x2} ${y2}" fill="none" stroke="${K}" stroke-width="5"/><path d="M${x1} ${y1}Q${(x1 + x2) / 2} ${Math.min(y1, y2) - 50} ${x2} ${y2}" fill="none" stroke="#d8b070" stroke-width="2.4" stroke-dasharray="5 3"/>`;
  const felt = () => `<path d="M40 360Q400 220 760 360Z" fill="#2f7a4a" stroke="${K}" stroke-width="4"/>`;
  const chips = (x, y, n, c) => [...Array(n)].map((_, i) => `<ellipse cx="${x}" cy="${y - i * 6}" rx="16" ry="6" fill="${c}" stroke="${K}" stroke-width="2"/>`).join('');
  const bunting = S => S.prop('bunting', 0, 0, 1, 0, 800, 40, 22);

  add('mg_noon', {
    scene: S => street(S) + S.lines(400, 90, '#e8742a', 30, 0.25) + S.prop('tumble', 400, 300, 1.2) + S.person(LK(), 190, 320, 1, 'stand') + S.person('kansasgun', 610, 320, 1, 'stand', true)
      + S.kana('ゴゴゴ', 400, 200, 44, -6, '#6b3a7a') + S.bubble('Noon. Or you leave on foot.', 470, 26, 230, 600, 150),
    out: {
      0: S => street(S) + S.lines(250, 190, K, 36, 0.3) + S.person(LK(), 190, 320, 1, 'draw') + S.fx('bang', 262, 204, 0.9) + S.person('kansasgun', 600, 320, 1, 'down', true) + S.kana('ドギュウン', 420, 90, 52, -6, '#ffd84a'),
      '0:fail': S => street(S) + S.person('kansasgun', 610, 320, 1, 'draw', true) + S.fx('bang', 538, 204, 0.9) + S.person(LK(), 190, 330, 1, 'kneel') + S.fx('blood', 200, 220, 0.8) + S.bubble('Too slow, racer.', 480, 30, 180, 600, 150),
    },
  });
  add('mg_ford', {
    scene: S => S.bg({}) + water() + S.prop('rock', 620, 262, 1.4) + `<g transform="rotate(-8 300 260)"><rect x="220" y="248" width="160" height="22" fill="#8a5a34" stroke="${K}" stroke-width="3"/></g>` + S.horse(130, 300, 0.9, mount()) + S.bust(LK(), 136, 218, 0.36) + S.kana('ザバァ', 470, 150, 44, -6, '#fff'),
    out: {
      0: S => S.bg({}) + water(250, 60) + S.fx('splash', 380, 270, 1.2) + S.horse(600, 250, 1, mount()) + S.bust(LK(), 606, 158, 0.4) + S.caption('Across, and everyone who took the bridge is behind you.', 12, 12, 320) + S.kana('ドドド', 700, 110, 40, 10),
      '0:fail': S => S.bg({}) + water(200, 160) + S.fx('splash', 400, 250, 2) + S.bust(LK(), 400, 280, 0.6) + S.fx('splash', 300, 280, 1) + S.caption('The river takes a saddlebag and a lot of skin.', 12, 12, 300) + S.kana('ゴボゴボ', 600, 150, 44, 8, '#9fd0f0'),
    },
  });
  add('mg_steer', {
    scene: S => street(S) + S.prop('wagon', 150, 300, 1.1) + S.prop('cow', 560, 300, 2.2, '#6a3a1a') + S.fx('dust', 660, 300, 1.2) + S.person(LK(), 360, 320, 0.95, 'arms') + S.kana('ドドドド', 600, 90, 46, 8) + S.bubble('Somebody rope that animal!', 470, 20, 230, 700, 120),
    out: {
      0: S => street(S) + S.prop('wagon', 150, 300, 1.1) + S.prop('cow', 470, 300, 2.2, '#6a3a1a') + rope(310, 200, 520, 250) + S.person(LK(), 290, 320, 0.95, 'point') + S.kana('ヒーハー!', 560, 90, 46, -6, '#e8508a'),
      '0:fail': S => street(S) + S.prop('cow', 600, 300, 2.2, '#6a3a1a') + S.fx('dust', 420, 300, 1.6) + S.person(LK(), 330, 320, 1, 'down') + S.kana('ドサッ', 330, 150, 46, -8),
    },
  });
  add('mg_spiral', {
    scene: S => S.bg({ pal: 'dusk' }) + spiral(480, 290, 150) + ball(480, 290) + S.person('gyro', 200, 320, 1, 'point') + S.bubble('Follow the spiral. Nyoho.', 40, 30, 210, 200, 150) + S.kana('ギャルルル', 620, 110, 40, -8, '#3fb8a9'),
    out: {
      0: S => S.bg({ pal: 'dusk' }) + S.lines(480, 260, '#f2c14e', 40, 0.35) + spiral(480, 280, 170) + ball(480, 280, 16) + S.person(LK(), 190, 320, 1, 'point') + S.kana('黄金長方形', 580, 90, 40, -6, '#f2c14e'),
      '0:fail': S => S.bg({ pal: 'dusk' }) + spiral(480, 290, 150, '#b8903a') + ball(720, 310) + S.person('gyro', 230, 320, 0.95, 'stand') + S.bubble('Close. Again tomorrow.', 70, 40, 190, 230, 150),
    },
  });
  add('mg_soulbet', {
    scene: S => S.bg({ inside: true, pal: 'inside', horizon: 270 }) + S.lines(400, 150, '#9a5ad8', 36, 0.25) + S.bust('cardsharp', 400, 260, 1.4) + felt() + chips(300, 330, 5, '#e8508a') + chips(500, 330, 5, '#b8a0e0')
      + S.kana('ゴゴゴ', 130, 110, 46, -8, '#b89ae8') + S.bubble('Wager your soul.', 560, 40, 170, 470, 150),
    out: {
      0: S => S.bg({ inside: true, pal: 'inside', horizon: 270 }) + S.bust('cardsharp', 420, 260, 1.4) + felt() + chips(300, 340, 9, '#e8508a') + S.fx('coins', 520, 330, 1) + S.kana('グッド…?', 620, 90, 42, 8, '#e8508a') + S.bust(LK(), 120, 360, 1.2),
      '0:fail': S => S.bg({ inside: true, pal: 'inside', horizon: 270 }) + S.bust('cardsharp', 400, 260, 1.4) + felt() + chips(500, 340, 10, '#b8a0e0') + S.tone('M0 0H800V360H0Z', 0.18) + S.bubble('Good.', 560, 50, 110, 470, 150) + S.kana('ガシャン', 170, 110, 46, -8, '#e8508a'),
    },
  });
  add('mg_fair', {
    scene: S => S.bg({ pal: 1, far: false }) + bunting(S) + S.prop('flag', 90, 300, 1, '#c8323c', 90) + S.prop('flag', 720, 300, 1, '#3b5bb5', 90)
      + S.person('rodeo', 540, 320, 1, 'arms', true) + S.person(LK(), 260, 320, 0.95, 'stand') + S.fx('coins', 400, 250, 1) + S.kana('ワイワイ', 400, 120, 44, -6, '#e8508a'),
    out: {
      0: S => S.bg({ pal: 1, far: false }) + bunting(S) + S.prop('cow', 560, 300, 2, '#6a3a1a') + rope(320, 200, 580, 240) + S.person(LK(), 290, 320, 1, 'point') + S.kana('ヒーハー!', 560, 110, 46, -6, '#e8508a'),
      '0:fail': S => S.bg({ pal: 1, far: false }) + bunting(S) + S.prop('cow', 640, 300, 2, '#6a3a1a') + S.person(LK(), 300, 320, 1, 'down') + S.fx('dust', 420, 300, 1.2),
      1: S => S.bg({ pal: 1, far: false }) + bunting(S) + S.person(LK(), 250, 320, 1, 'draw') + S.fx('bang', 322, 204, 0.8) + S.person('deputy', 560, 320, 0.95, 'arms', true) + S.fx('coins', 420, 200, 1) + S.kana('パァン', 420, 110, 46, -6, '#ffd84a'),
      '1:fail': S => S.bg({ pal: 1, far: false }) + bunting(S) + S.person('deputy', 560, 320, 1, 'draw', true) + S.person(LK(), 250, 320, 0.95, 'stand') + S.bubble('Again? Sure.', 470, 60, 150, 560, 150),
    },
  });
})();
