/* Battle strikes, drawn before the hit lands:
   - rush(): a close-range Stand leaves its user, flies to each target and pummels it (ORA ORA / DORA / MUDA / ARI...),
     then snaps back. More hits, afterimages and speed lines the higher the move's power tier and level.
   - weapon(): the attacker's weapon appears at their card: a revolver that kicks and flashes, a spinning steel ball,
     Tusk's nails, a whirling lasso, a knife, dynamite. It grows with the move's tier and level. */
'use strict';
SBR.strike = (() => {
  const K = '#1a1020';
  const spd = () => SBR.settings.speed || 1;
  const wait = ms => new Promise(r => setTimeout(r, ms / spd()));
  const layer = () => document.getElementById('fx-layer');
  const rel = p => { const L = layer().getBoundingClientRect(); return { x: p.x - L.left, y: p.y - L.top }; };
  const mk = (cls, html, p) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html || ''; const q = rel(p); d.style.left = q.x + 'px'; d.style.top = q.y + 'px'; layer().appendChild(d); return d; };
  const calm = () => SBR.settings.reducedMotion;

  /* ---------- close-range Stands ---------- */
  const CLOSE = {
    star_platinum: ['オラ', 'ORA'], crazy_diamond: ['ドラ', 'DORA'], gold_experience: ['無駄', 'MUDA'], sticky_fingers: ['アリ', 'ARI'],
    king_crimson: ['ドン', 'DON'], killer_queen: ['シバ', 'SHIBA'], the_hand: ['ガオン', 'GAOON'], silver_chariot: ['ホラ', 'HORA'],
    stone_free: ['オラ', 'ORA'], whitesnake: ['ズギュ', 'ZUGYU'], tusk4: ['オラ', 'ORA'], d4c: ['ドジャ', 'DOJYAAN'], theworld: ['無駄', 'MUDA'],
  };
  const isClose = key => !!CLOSE[key];

  /* rush(opts): battle-ui calls this for close-range Stands. js/standfx.js may take the move over with its own
     choreography (per ability id / Stand key); it calls back here with plain:true and a `style` to reuse the barrage.
     style: { cry:[kana,word], fist:(color)=>svg, fistColor, fan:n afterimage fists per beat, hits:(power)=>n,
              blink:true (no travel frames), onArrive(t,stop,dir,power), onHit(t,i,power,dir), finish:async(t,power,dir,stand),
              noFinishFlash, stay:true (leave the Stand where it is; caller removes it via the returned element) } */
  async function rush(opts) {
    const { key, from, to, tier = 1, lvl = 1, color = '#f2c14e', enemy = false, style = {} } = opts;
    if (!opts.plain && SBR.standfx) { const r = SBR.standfx.rush(opts); if (r) return r; }
    if (!to.length || !SBR.stands || !SBR.stands.DEFS[key]) return;
    const [kana, word] = style.cry || CLOSE[key] || ['ドド', 'DODO'];
    const power = Math.min(5, tier + (lvl - 1));             // 0-5
    const hits = calm() ? 3 : style.hits ? style.hits(power) : 5 + power * 3;   // fists per target
    const fc = style.fistColor || color;
    const stand = mk('stk-stand' + (enemy ? ' enemy' : ''), SBR.stands.svg(key), from);
    stand.style.setProperty('--sc', color);
    stand.style.setProperty('--size', (150 + power * 18) + 'px');
    if (SBR.standfx && SBR.standfx.applySprite) SBR.standfx.applySprite(stand, key, 'rush');
    const place = (p, ms, extra = '') => { const q = rel(p); stand.style.transition = ms ? `left ${ms / spd()}ms cubic-bezier(.5,0,.3,1), top ${ms / spd()}ms cubic-bezier(.5,0,.3,1), transform ${ms / spd()}ms` : 'none'; stand.style.left = q.x + 'px'; stand.style.top = q.y + 'px'; stand.style.transform = extra; };
    // speed lines behind everything for the big ones
    let lines = null;
    if (power >= 3 && !calm()) { lines = mk('stk-lines' + (power >= 5 ? ' max' : ''), '', { x: innerWidth / 2, y: innerHeight / 2 }); lines.style.setProperty('--sc', color); }
    SBR.audio.play('stand');
    await wait(60);
    stand.classList.add('go');
    for (let ti = 0; ti < to.length; ti++) {
      const t = to[ti];
      const dir = t.x >= from.x ? -1 : 1;                      // stand stops just in front of the target
      const stop = { x: t.x + dir * 58, y: t.y - 6 };
      if (style.blink) { place(stop, 0, `scaleX(${dir > 0 ? -1 : 1})`); await wait(40); }
      else {
        if (power >= 2 && !calm()) afterimages(stand, from, stop, key, color, power);
        place(stop, 170, `scaleX(${dir > 0 ? -1 : 1})`);
        await wait(170);
      }
      if (style.onArrive) await style.onArrive(t, stop, dir, power, stand);
      stand.classList.add('punching');
      const cry = word ? mk('stk-cry' + (power >= 4 ? ' big' : ''), `<b>${word}${power >= 2 ? ' ' + word : ''}${power >= 4 ? ' ' + word + '!!' : '!'}</b><i>${kana.repeat(Math.min(4, 2 + (power >> 1)))}</i>`, { x: (stop.x + t.x) / 2, y: t.y - 90 }) : null;
      if (cry) cry.style.setProperty('--sc', color);
      const per = Math.max(24, 70 - power * 8);
      const fan = calm() ? 0 : (style.fan != null ? style.fan : 0);
      for (let i = 0; i < hits; i++) {
        const fp = { x: t.x + (Math.random() * 70 - 35), y: t.y + (Math.random() * 80 - 40) };
        const f = mk('stk-fist' + (power >= 3 ? ' heavy' : ''), (style.fist || fist)(fc), fp);
        const r0 = Math.random() * 60 - 30;
        f.style.setProperty('--r', r0 + 'deg');
        f.style.setProperty('--dx', (dir * 26) + 'px');
        setTimeout(() => f.remove(), 380 / spd());
        // afterimage fists: a fanned blur of copies behind the real one
        for (let g = 1; g <= fan; g++) {
          const gf = mk('stk-fist ghost', (style.fist || fist)(fc), { x: fp.x - dir * g * 16, y: fp.y + (g % 2 ? -1 : 1) * g * 9 });
          gf.style.setProperty('--r', (r0 + (g % 2 ? -1 : 1) * g * 7) + 'deg');
          gf.style.setProperty('--dx', (dir * 26) + 'px');
          gf.style.animationDelay = (g * 18 / spd()) + 'ms';
          setTimeout(() => gf.remove(), 420 / spd());
        }
        if (style.onHit) style.onHit(t, i, power, dir);
        if (i % 3 === 0) SBR.audio.play('hit');
        await wait(per);
      }
      // the last blow
      if (!style.noFinishFlash) { const fin = mk('stk-finish', '', t); fin.style.setProperty('--sc', color); setTimeout(() => fin.remove(), 600 / spd()); }
      SBR.audio.play(power >= 3 ? 'boom' : 'crit');
      if (cry) setTimeout(() => cry.remove(), 500 / spd());
      stand.classList.remove('punching');
      if (style.finish) await style.finish(t, power, dir, stand);
      await wait(90);
    }
    if (style.stay) { if (lines) setTimeout(() => lines.remove(), 200 / spd()); return stand; }
    place(from, 200, 'scale(.6)');
    stand.classList.add('back');
    await wait(160);
    setTimeout(() => { stand.remove(); if (lines) lines.remove(); }, 260 / spd());
  }
  function afterimages(stand, a, b, key, color, power) {
    const n = Math.min(4, power);
    for (let i = 1; i <= n; i++) {
      const p = { x: a.x + (b.x - a.x) * (i / (n + 1)), y: a.y + (b.y - a.y) * (i / (n + 1)) };
      const g = mk('stk-ghost', SBR.stands.svg(key), p);
      g.style.setProperty('--size', stand.style.getPropertyValue('--size'));
      g.style.setProperty('--sc', color);
      g.style.animationDelay = (i * 25 / spd()) + 'ms';
      setTimeout(() => g.remove(), 450 / spd());
    }
  }
  const fist = c => `<svg viewBox="0 0 40 40"><path d="M6 14q0-6 6-6h14q8 0 8 8v8q0 8-8 8H14q-8 0-8-8z" fill="${c}" stroke="${K}" stroke-width="3"/><path d="M14 8v10M20 8v10M26 9v9" stroke="${K}" stroke-width="2.4"/><path d="M-6 14h10M-8 22h12M-6 30h10" stroke="#fff" stroke-width="3" opacity=".8"/></svg>`;

  /* ---------- weapons ---------- */
  const REV = (c = '#8a8a9a') => `<svg viewBox="0 0 80 44"><path d="M8 6h52l6 4v6H22l-4 6H8z" fill="${c}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M22 16q4 14 0 24H8q-2-12 6-24" fill="#6a4a2a" stroke="${K}" stroke-width="3"/><circle cx="30" cy="16" r="7" fill="#b8b8c8" stroke="${K}" stroke-width="2.4"/><path d="M26 22q2 6 8 4" fill="none" stroke="${K}" stroke-width="2.4"/><path d="M60 8h14" stroke="${K}" stroke-width="4"/></svg>`;
  const WEAPON = {
    gun:     { html: () => REV(), cls: 'gun', shots: p => 1 + (p >> 1), kana: 'バン' },
    gatling: { html: () => REV('#5a5a6a'), cls: 'gun', shots: p => 4 + p * 2, kana: 'ダダダ' },
    nail:    { html: () => `<svg viewBox="0 0 70 50"><path d="M4 30q0-14 14-16l30-2q8 0 8 6t-8 6l-18 2 2 10q0 8-10 10H18Q4 46 4 30z" fill="#f6d2b0" stroke="${K}" stroke-width="3"/><path d="M56 16l10-4-2 10z" fill="#d8d0f0" stroke="${K}" stroke-width="2"/><circle cx="60" cy="16" r="9" fill="none" stroke="#6b5bd6" stroke-width="2.5" stroke-dasharray="6 4"/></svg>`, cls: 'nail', shots: p => 1 + p, kana: 'ギャルル' },
    ball:    { html: () => ball('#c8c8d8'), cls: 'ball', shots: () => 0, kana: 'ギャルルル' },
    golden:  { html: () => ball('#f2c14e', true), cls: 'ball gold', shots: () => 0, kana: 'ギャルルル' },
    ballbreaker: { html: () => ball('#f2c14e', true), cls: 'ball gold', shots: () => 0, kana: 'ゴゴゴ' },
    rope:    { html: () => `<svg viewBox="0 0 70 70"><ellipse cx="35" cy="30" rx="28" ry="12" fill="none" stroke="${K}" stroke-width="6"/><ellipse cx="35" cy="30" rx="28" ry="12" fill="none" stroke="#c89a5a" stroke-width="3.4"/><path d="M35 42q-4 14 4 26" fill="none" stroke="#c89a5a" stroke-width="4"/></svg>`, cls: 'rope', shots: () => 0, kana: 'ヒュンヒュン' },
    lasso:   { alias: 'rope' },
    rapier:  { html: () => `<svg viewBox="0 0 80 20"><rect x="2" y="7" width="16" height="6" rx="2" fill="#6a4a2a" stroke="${K}" stroke-width="2"/><path d="M18 3v14" stroke="${K}" stroke-width="4"/><path d="M20 8L78 10L20 12z" fill="#eeeef6" stroke="${K}" stroke-width="2"/></svg>`, cls: 'blade', shots: () => 0, kana: 'シャキン' },
    bomb:    { html: () => `<svg viewBox="0 0 40 60"><rect x="8" y="16" width="24" height="40" rx="4" fill="#c8323c" stroke="${K}" stroke-width="3"/><path d="M8 26h24M8 44h24" stroke="#f6ecd8" stroke-width="3"/><path d="M20 16q2-8 10-10" fill="none" stroke="${K}" stroke-width="3"/><circle cx="31" cy="5" r="4" fill="#ffd84a"/></svg>`, cls: 'bomb', shots: () => 0, kana: 'シュウウ' },
  };
  function ball(c, gold) {
    return `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="20" fill="${c}" stroke="${K}" stroke-width="3.4"/><path d="M14 30q16-16 32 0q-16 16-32 0" fill="none" stroke="${K}" stroke-width="2" opacity=".55"/><circle cx="24" cy="23" r="5" fill="#fff" opacity=".8"/>${gold ? `<rect x="4" y="12" width="52" height="36" fill="none" stroke="#ffd84a" stroke-width="2" opacity=".9"/><path d="M30 12v36M4 30h52" stroke="#ffd84a" stroke-width="1.2" opacity=".7"/>` : ''}<path d="M30 2a28 28 0 0 1 28 28" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="6 6" class="spin-arc"/></svg>`;
  }
  const hasWeapon = look => !!WEAPON[look];

  async function weapon({ look, from, to, tier = 1, lvl = 1, enemy = false }) {
    let W = WEAPON[look]; if (!W) return; if (W.alias) W = WEAPON[W.alias];
    const power = Math.min(5, tier + (lvl - 1));
    const right = !to || to.x >= from.x;
    const ang = to ? Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI : 0;
    const off = { x: from.x + (right ? 86 : -86), y: from.y + 18 };
    const w = mk('stk-weapon ' + W.cls + (power >= 3 ? ' power' : ''), W.html(), off);
    w.style.setProperty('--size', (72 + power * 16) + 'px');
    // guns aim along the shot; everything else just faces the target
    const rot = W.cls === 'gun' || W.cls === 'nail' ? (right ? ang : 180 - ang) : 0;
    w.style.setProperty('--rot', (right ? rot : -rot) + 'deg');
    w.style.setProperty('--flip', right ? 1 : -1);
    const k = mk('stk-wkana', W.kana, { x: off.x, y: off.y - 46 });
    SBR.audio.play(W.cls === 'gun' ? 'click' : W.cls.startsWith('ball') ? 'spin' : 'whistle');
    await wait(W.cls.startsWith('ball') ? 260 + power * 60 : 200);
    const shots = W.shots(power);
    for (let i = 0; i < shots; i++) {
      w.classList.remove('kick'); void w.offsetWidth; w.classList.add('kick');
      const q = mk('stk-flash' + (power >= 3 ? ' big' : ''), '', { x: off.x + (right ? 40 : -40) * Math.cos(ang * Math.PI / 180), y: off.y + 40 * Math.sin(ang * Math.PI / 180) });
      setTimeout(() => q.remove(), 180 / spd());
      await wait(Math.max(45, 110 - power * 12));
    }
    w.classList.add('out'); k.classList.add('out');
    setTimeout(() => { w.remove(); k.remove(); }, 260 / spd());
  }
  return { rush, weapon, isClose, hasWeapon, afterimages, fist, mk, rel, CLOSE, WEAPON };
})();
