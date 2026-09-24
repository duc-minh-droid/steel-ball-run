/* Core: namespace, utilities, persistence, audio */
'use strict';
const SBR = window.SBR = {};

/* ---------- Utilities ---------- */
SBR.util = {
  rand: () => Math.random(),
  randInt: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  chance: p => Math.random() < p,
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
  weighted(list, wFn) {
    const total = list.reduce((s, x) => s + Math.max(0, wFn(x)), 0);
    if (total <= 0) return list[0];
    let r = Math.random() * total;
    for (const x of list) { r -= Math.max(0, wFn(x)); if (r <= 0) return x; }
    return list[list.length - 1];
  },
  uid: (() => { let n = 0; return (p = 'u') => `${p}${++n}_${Date.now().toString(36)}`; })(),
  sleep(ms) {
    const speed = SBR.settings ? SBR.settings.speed : 1;
    return new Promise(r => setTimeout(r, ms / speed));
  },
  el(tag, attrs = {}, ...children) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') {
        for (const [sk, sv] of Object.entries(v)) {
          if (sk.startsWith('--')) e.style.setProperty(sk, sv); else e.style[sk] = sv;
        }
      }
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(e.dataset, v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    }
    return e;
  },
  html(str) {
    const t = document.createElement('template');
    t.innerHTML = str.trim();
    return t.content.firstElementChild;
  },
  fmtMoney: n => '$' + Math.round(n).toLocaleString(),
  ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  },
  deepClone: o => JSON.parse(JSON.stringify(o)),
};

/* ---------- Settings ---------- */
SBR.settings = Object.assign({
  speed: 1, sfx: 0.6, music: 0.35, shake: true, reducedMotion: false, typewriter: true,
}, (() => { try { return JSON.parse(localStorage.getItem('sbr_settings')) || {}; } catch (e) { return {}; } })());
SBR.saveSettings = () => { try { localStorage.setItem('sbr_settings', JSON.stringify(SBR.settings)); } catch (e) {} };

/* ---------- Persistence ---------- */
SBR.store = {
  get(key, def) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
  set(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} },
  del(key) { try { localStorage.removeItem(key); } catch (e) {} },
};

SBR.defaultMeta = () => ({
  rp: 0, totalRp: 0,
  unlockedHorses: ['slowdancer', 'mustang'],
  unlockedItems: ['colt', 'horseshoe', 'provisions'],
  unlockedLeads: ['johnny', 'gyro'],
  unlockedTech: [],
  equippedTech: [],
  achievements: {},
  stats: { runs: 0, wins: 0, kills: 0, sprintsWon: 0, top3: 0, bestAct: 1 },
  seen: { enemies: {}, relics: {}, allies: {} },
  tutorialDone: false,
});
SBR.meta = Object.assign(SBR.defaultMeta(), SBR.store.get('sbr_meta', {}));
SBR.saveMeta = () => SBR.store.set('sbr_meta', SBR.meta);
SBR.run = null;
SBR.saveRun = () => { if (SBR.run) SBR.store.set('sbr_run', SBR.run); };
SBR.loadRun = () => SBR.store.get('sbr_run', null);
SBR.clearRun = () => { SBR.run = null; SBR.store.del('sbr_run'); };

/* ---------- Audio (synthesized, no assets) ---------- */
SBR.audio = (() => {
  let ctx = null, master = null;
  const ensure = () => {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.connect(ctx.destination);
      } catch (e) { return false; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    master.gain.value = SBR.settings.sfx;
    return true;
  };
  const tone = (freq, dur, type = 'square', vol = 0.2, slide = 0, delay = 0) => {
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  };
  const noise = (dur, vol = 0.2, filterFreq = 1200, delay = 0) => {
    const t = ctx.currentTime + delay;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ctx.createBufferSource(); s.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filterFreq;
    const g = ctx.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  };
  const sounds = {
    click: () => tone(660, 0.05, 'square', 0.08),
    hover: () => tone(880, 0.03, 'sine', 0.04),
    select: () => { tone(520, 0.07, 'square', 0.1); tone(780, 0.09, 'square', 0.1, 0, 0.06); },
    back: () => tone(300, 0.08, 'triangle', 0.1, -80),
    hit: () => { noise(0.12, 0.35, 900); tone(140, 0.12, 'sawtooth', 0.15, -60); },
    crit: () => { noise(0.2, 0.4, 2400); tone(90, 0.3, 'sawtooth', 0.2, -40); tone(1200, 0.1, 'square', 0.1, 400, 0.02); },
    gun: () => { noise(0.18, 0.5, 3000); tone(200, 0.08, 'square', 0.15, -150); },
    spin: () => { tone(300, 0.35, 'sine', 0.14, 900); tone(450, 0.35, 'triangle', 0.08, 1200, 0.05); },
    miss: () => tone(900, 0.15, 'sine', 0.08, -600),
    block: () => { tone(220, 0.1, 'square', 0.14); noise(0.05, 0.2, 5000); },
    heal: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.18, 'sine', 0.1, 0, i * 0.06)); },
    buff: () => { tone(440, 0.12, 'triangle', 0.1, 220); tone(660, 0.12, 'triangle', 0.1, 330, 0.08); },
    debuff: () => { tone(330, 0.2, 'sawtooth', 0.08, -150); },
    coin: () => { tone(988, 0.07, 'square', 0.08); tone(1319, 0.2, 'square', 0.08, 0, 0.07); },
    level: () => { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'square', 0.09, 0, i * 0.08)); },
    menace: () => { tone(55, 1.4, 'sawtooth', 0.12, 5); tone(58, 1.4, 'sawtooth', 0.1, -3); },
    boom: () => { noise(0.6, 0.6, 400); tone(60, 0.5, 'sine', 0.3, -30); },
    dice: () => { for (let i = 0; i < 6; i++) noise(0.03, 0.2, 4000, i * 0.05); },
    success: () => { [523, 784, 1047].forEach((f, i) => tone(f, 0.2, 'square', 0.09, 0, i * 0.09)); },
    fail: () => { [392, 330, 262].forEach((f, i) => tone(f, 0.22, 'sawtooth', 0.08, 0, i * 0.1)); },
    gallop: () => { [0, 0.09, 0.3, 0.39].forEach(d => noise(0.05, 0.25, 500, d)); },
    death: () => { tone(200, 0.6, 'sawtooth', 0.12, -170); },
    timestop: () => { tone(1800, 0.8, 'sine', 0.12, -1700); noise(0.8, 0.15, 800); },
    rewind: () => { tone(200, 0.7, 'triangle', 0.12, 1200); tone(1400, 0.7, 'triangle', 0.06, -1000); },
    whistle: () => { tone(1500, 0.5, 'sine', 0.1, 300); },
    page: () => noise(0.12, 0.12, 6000),
  };
  return {
    play(name) {
      if (SBR.settings.sfx <= 0) return;
      if (!ensure()) return;
      try { sounds[name] && sounds[name](); } catch (e) {}
    },
    unlock: ensure,
    define(name, fn) { sounds[name] = fn; },
    get ctx() { return ctx; },
    get master() { return master; },
  };
})();

/* ---------- Tooltip ---------- */
SBR.tip = (() => {
  let tipEl;
  const show = (html, x, y) => {
    tipEl = tipEl || document.getElementById('tooltip');
    tipEl.innerHTML = html;
    tipEl.classList.add('show');
    const r = tipEl.getBoundingClientRect();
    let tx = x + 16, ty = y + 16;
    if (tx + r.width > window.innerWidth - 8) tx = x - r.width - 12;
    if (ty + r.height > window.innerHeight - 8) ty = y - r.height - 12;
    tipEl.style.left = Math.max(8, tx) + 'px';
    tipEl.style.top = Math.max(8, ty) + 'px';
  };
  const hide = () => { tipEl = tipEl || document.getElementById('tooltip'); tipEl.classList.remove('show'); };
  const bind = (node, htmlOrFn) => {
    node.addEventListener('mouseenter', e => show(typeof htmlOrFn === 'function' ? htmlOrFn() : htmlOrFn, e.clientX, e.clientY));
    node.addEventListener('mousemove', e => show(typeof htmlOrFn === 'function' ? htmlOrFn() : htmlOrFn, e.clientX, e.clientY));
    node.addEventListener('mouseleave', hide);
    return node;
  };
  return { show, hide, bind };
})();

SBR.toast = (msg, kind = '') => {
  const box = document.getElementById('toasts');
  const t = SBR.util.el('div', { class: 'toast ' + kind, html: msg });
  box.appendChild(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3100);
};
