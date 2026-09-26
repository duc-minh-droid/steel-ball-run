/* Secret superbosses: hidden 7-star "Strange Aura" fights, like the hidden bosses of An Average Campaign.
   Each is optional, brutal, found only under particular conditions, drops a unique Soul and a legendary piece,
   and unlocks a Technique (through an achievement) for every later run.

     Kars, the Ultimate Life Form   deepest chamber of the Pillar Tomb detour (a hidden choice opens it)
     Enrico Pucci, Made in Heaven    main route, Acts V-VI, only while you carry 4+ Corpse Parts
     DIO, from another world         main route, Acts IV-VI, only when the President hunts you hardest
     Yoshikage Kira, Bites the Dust  below the Philadelphia Rail Yard (a hidden choice opens it)
     Diego, Tyrant of the Cretaceous the Silver Mine's deepest vein (a hidden choice opens it)

   Superbosses scale to the act you meet them in (about 2-3x that act's boss). Losing one ends the run, as in AAC,
   so the card asks first. Loads before combat.js / ui.js / main.js: everything here is data, hooks on enemy defs,
   and wrappers installed once the page has loaded. main.js calls SBR.extraCards / SBR.customCard for the cards. */
'use strict';

(() => {
  const U = SBR.util;
  const port = key => ({ kind: 'portrait', key });
  const beast = (type, color, bg) => ({ kind: 'creature', type, color, bg });

  /* ================= 1. Portraits ================= */
  SBR.art.addPortrait({
    sb_kars:    { skin: '#e2b890', hair: '#2a1438', hairStyle: 'verylong', hat: 'headband', hatColor: '#e8e0c8', hat2: '#c8323c', outfit: '#e8e0c8', outfit2: '#c8a040', eye: '#c8323c', lip: '#6a3a4a', bg: ['#2a1438', '#f2c14e'], eyes: 'sharp', brows: 'thick', mouth: 'smirk', deco: ['earring:#f2c14e'] },
    sb_pucci:   { skin: '#8a5a3a', hair: '#f6f2ea', hairStyle: 'short', hat: null, outfit: '#f6ecd8', outfit2: '#1a1020', eye: '#8a6ab0', lip: '#5a3a3a', bg: ['#1a1a3a', '#8adf6a'], eyes: 'narrow', brows: 'thick', style: 'priest', mouth: 'flat', deco: ['necklace:cross'] },
    sb_dio:     { skin: '#f6e0c8', hair: '#ffd84a', hairStyle: 'flowing', hat: 'headband', hatColor: '#3a8a4a', hat2: '#e8508a', outfit: '#f2c14e', outfit2: '#1a1020', eye: '#c8323c', lip: '#8a3aa0', bg: ['#f2c14e', '#2a1438'], eyes: 'sharp', brows: 'arched', mouth: 'smirk', extra: 'heart', deco: ['collar:#1a1020'] },
    sb_kira:    { skin: '#f6dcc8', hair: '#e8e0b8', hairStyle: 'swept', hat: null, outfit: '#6a4a8a', outfit2: '#f6ecd8', eye: '#6a4a8a', lip: '#a06a7a', bg: ['#e8508a', '#3a2a5a'], eyes: 'narrow', brows: 'thin', mouth: 'flat', deco: ['collar:#f6ecd8', 'bowtie:#3a2a5a'] },
    sb_diegorex:{ skin: '#7aa85a', hair: '#f8e08a', hairStyle: 'diego', hat: 'dio', hatColor: '#2a4a2a', hat2: '#c8e04a', outfit: '#2a4a2a', outfit2: '#c8e04a', eye: '#f2c14e', lip: '#4a2a1a', bg: ['#1a2a1a', '#c8e04a'], eyes: 'sharp', brows: 'angry', mouth: 'teeth', style: 'turtleneck', extra: 'scales' },
  });

  /* ================= 2. Creatures: a Tyrannosaur and a burning skull-bomb ================= */
  (() => {
    const INK = '#1a1020';
    const S = `stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
    let n = 0;
    const draw = {
      trex: c => `<path d="M8 120 L18 92 Q10 80 16 64 Q22 42 44 34 L50 20 Q58 8 76 10 Q94 12 96 26 L92 40 Q84 44 72 42 L70 48 Q78 50 80 56 L70 58 Q66 72 72 88 L84 120Z" fill="${c}" ${S}/>
        <path d="M52 22 Q70 16 94 24 L92 32 Q72 30 54 32Z" fill="#f6ecd8" ${S}/>${[58, 64, 70, 76, 82, 88].map(x => `<path d="M${x} 24 l2 5 2 -5" fill="#fff" stroke="${INK}" stroke-width="1"/>`).join('')}
        <circle cx="66" cy="18" r="4.6" fill="#f2c14e" ${S}/><path d="M64 18 h4" stroke="${INK}" stroke-width="2"/>
        <path d="M60 12 Q66 8 72 12" stroke="${INK}" stroke-width="2.4" fill="none"/>
        <path d="M44 60 L30 66 L34 70 M40 64 L28 74" ${S} fill="none"/>
        ${[[24, 80], [30, 96], [40, 70], [46, 90], [56, 76], [22, 106]].map(([x, y]) => `<path d="M${x} ${y} q4 -4 8 0" stroke="${INK}" stroke-width="1.4" fill="none" opacity=".5"/>`).join('')}
        <path d="M18 92 Q34 102 50 96" stroke="${INK}" stroke-width="1.4" fill="none" opacity=".4"/>
        <text x="6" y="22" font-family="Bangers,Impact" font-size="15" fill="#c8e04a" stroke="${INK}" stroke-width=".8">GRAAH</text>`,
      shabomb: c => `<g transform="translate(50 68)">
        <path d="M-30 20 Q-34 -14 0 -22 Q34 -14 30 20 Q0 30 -30 20Z" fill="${c}" ${S}/>
        <path d="M-22 -6 Q0 -14 22 -6" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/>
        <circle cx="-10" cy="0" r="7" fill="#fff" ${S}/><circle cx="10" cy="0" r="7" fill="#fff" ${S}/><circle cx="-9" cy="1" r="3" fill="${INK}"/><circle cx="11" cy="1" r="3" fill="${INK}"/>
        <path d="M-12 12 h24 M-8 12 v6 M0 12 v6 M8 12 v6" stroke="${INK}" stroke-width="1.8"/>
        <path d="M-40 24 q-6 10 4 14 M40 24 q6 10 -4 14" stroke="#3a3a4a" stroke-width="6" fill="none"/>
        <path d="M-6 -22 v-10 h12 v10" fill="#8a8a9a" ${S}/><text x="0" y="-26" font-family="Bangers,Impact" font-size="8" text-anchor="middle" fill="${INK}">KQ</text></g>
        <text x="8" y="112" font-family="Bangers,Impact" font-size="13" fill="#f2c14e" stroke="${INK}" stroke-width=".8">LOOK OVER HERE!</text>`,
    };
    const orig = SBR.art.creature;
    SBR.art.creature = (kind, color, bg = ['#5b3a8c', '#e8742a']) => {
      if (!draw[kind]) return orig(kind, color, bg);
      const id = 'sbc' + (++n);
      return `<svg class="portrait" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>
        <pattern id="${id}d" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="${INK}" opacity=".18"/></pattern></defs>
        <rect width="100" height="120" fill="url(#${id}g)"/><rect width="100" height="120" fill="url(#${id}d)"/>${draw[kind](color)}</svg>`;
    };
  })();

  /* ================= 3. Stand figures (120x160, thick ink like stands.js) ================= */
  (() => {
    const K = '#1a1020';
    const st = `stroke="${K}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
    const th = `stroke="${K}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"`;
    const F = (c, s = st) => `fill="${c}" ${s}`;
    let n = 0;
    const wrap = (inner, aura = '#fff') => { const id = 'sbs' + (++n); return `<svg class="stand-svg" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="${id}"><stop offset="0" stop-color="${aura}" stop-opacity=".55"/><stop offset="1" stop-color="${aura}" stop-opacity="0"/></radialGradient></defs><ellipse cx="60" cy="84" rx="58" ry="76" fill="url(#${id})"/>${inner}</svg>`; };
    const BODY = 'M40 50 Q60 42 80 50 L93 58 Q100 74 101 92 L92 96 L85 72 L82 104 L90 152 L75 152 L62 112 L58 112 L45 152 L30 152 L38 104 L35 72 L28 96 L19 92 Q20 74 27 58 Z';
    // C-Moon: a green-and-white figure covered in downward arrows, gravity pointing the wrong way
    function cmoon() {
      const arrows = [[48, 66], [72, 66], [60, 86], [44, 100], [76, 100], [60, 124]].map(([x, y]) => `<path d="M${x} ${y - 6} v9 m-4 -4 l4 5 4 -5" stroke="${K}" stroke-width="2" fill="none"/>`).join('');
      return wrap(`<path d="${BODY}" ${F('#e8f4e0')}/><path d="M40 50 Q60 42 80 50 L82 104 L38 104Z" fill="#6ac86a" opacity=".55"/>${arrows}
        <ellipse cx="60" cy="30" rx="16" ry="18" ${F('#e8f4e0')}/><path d="M44 26 Q60 8 76 26 L72 20 Q60 10 48 20Z" ${F('#6ac86a')}/>
        <path d="M50 30 h8 M62 30 h8" stroke="${K}" stroke-width="2.6"/><path d="M54 40 Q60 43 66 40" stroke="${K}" stroke-width="1.6" fill="none"/>
        <circle cx="60" cy="22" r="4" ${F('#fff', th)}/><path d="M60 18 v8 M56 22 h8" stroke="#6ac86a" stroke-width="1.4"/>
        ${[0, 1, 2, 3].map(i => `<circle cx="60" cy="84" r="${62 + i * 7}" fill="none" stroke="#6ac86a" stroke-width="1.4" stroke-dasharray="4 7" opacity="${0.6 - i * 0.12}"/>`).join('')}
        <text x="10" y="150" font-family="Bangers,Impact" font-size="15" fill="#e8f4e0" stroke="${K}" stroke-width="1" transform="rotate(180 30 145)">C-MOON</text>`, '#8adf6a');
    }
    // Made in Heaven: a centaur-like Stand, horse body striped with clock faces, galloping out of the frame
    function mih() {
      const clocks = [[34, 116], [58, 122], [82, 116]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" ${F('#fff', th)}/><path d="M${x} ${y} v-5 M${x} ${y} l4 2" stroke="${K}" stroke-width="1.4"/>`).join('');
      return wrap(`<path d="M16 104 Q18 92 36 94 H86 Q104 92 106 106 L100 132 L94 132 L92 118 L82 124 L80 150 L72 150 L70 124 H48 L46 150 L38 150 L36 124 L24 118 L22 132 L16 132Z" ${F('#f6f6f6')}/>
        <path d="M24 100 H100" stroke="#1a1020" stroke-width="4" stroke-dasharray="6 5"/>${clocks}
        <path d="M44 96 L42 60 Q60 50 78 60 L76 96Z" ${F('#f6f6f6')}/><path d="M48 70 Q60 76 72 70" stroke="#1a1020" stroke-width="3" fill="none"/>
        <path d="M42 64 L24 82 L30 86 L44 72 M78 64 L96 80 L90 86 L76 72" ${F('#f6f6f6')}/>
        <ellipse cx="60" cy="40" rx="13" ry="15" ${F('#f6f6f6')}/><path d="M48 32 Q60 18 72 32 L70 22 Q60 14 50 22Z" ${F('#1a1020')}/>
        <path d="M60 25 V56" stroke="#1a1020" stroke-width="2"/><circle cx="54" cy="40" r="2.2" fill="#1a1020"/><circle cx="66" cy="40" r="2.2" fill="#1a1020"/>
        ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${6 + i * 4} ${30 + i * 16} h${30 - i * 3}" stroke="#fff" stroke-width="3" opacity=".7"/>`).join('')}
        <text x="84" y="30" font-family="Bangers,Impact" font-size="13" fill="#fff" stroke="${K}" stroke-width="1">∞</text>`, '#c8e8ff');
    }
    // the Ultimate Life Form: wings, blades from the forearms, the Red Stone blazing at the brow
    function kars() {
      const wing = `<path d="M40 60 Q10 30 4 70 Q14 60 20 72 Q12 84 22 92 Q28 80 36 86 Z" ${F('#e8e0c8')}/><path d="M36 64 Q20 56 10 68 M34 74 Q22 72 16 82" stroke="${K}" stroke-width="1.3" fill="none"/>`;
      return wrap(`${wing}<g transform="translate(120 0) scale(-1 1)">${wing}</g>
        <path d="${BODY}" ${F('#e2b890')}/><path d="M38 96 Q60 104 82 96 L84 112 Q60 118 36 112Z" ${F('#e8e0c8')}/>
        <path d="M28 92 L6 60 L12 58 L32 88" ${F('#fff8d0')}/><path d="M92 92 L114 60 L108 58 L88 88" ${F('#fff8d0')}/>
        <path d="M8 60 L30 90 M112 60 L90 90" stroke="#f2c14e" stroke-width="1.4"/>
        <ellipse cx="60" cy="30" rx="15" ry="17" ${F('#e2b890')}/><path d="M44 24 Q40 60 36 80 L46 56 Q46 34 60 20 Q74 34 74 56 L84 80 Q80 60 76 24 Q60 6 44 24Z" ${F('#2a1438')}/>
        <path d="M46 22 H74" stroke="#e8e0c8" stroke-width="4"/><path d="M60 16 l4 6 -4 5 -4 -5z" ${F('#c8323c', th)}/>
        <path d="M52 30 l6 2 M68 30 l-6 2" stroke="${K}" stroke-width="2.4"/><circle cx="55" cy="33" r="1.8" fill="#c8323c"/><circle cx="65" cy="33" r="1.8" fill="#c8323c"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4; return `<path d="M${(60 + Math.cos(a) * 66).toFixed(1)} ${(84 + Math.sin(a) * 70).toFixed(1)} l${(Math.cos(a) * 10).toFixed(1)} ${(Math.sin(a) * 10).toFixed(1)}" stroke="#f2c14e" stroke-width="3" stroke-linecap="round"/>`; }).join('')}`, '#f2c14e');
    }
    Object.assign(SBR.stands.DEFS, {
      sb_cmoon: { name: 'C-Moon', entity: true, draw: cmoon },
      sb_mih: { name: 'Made in Heaven', entity: true, draw: mih },
      sb_kars: { name: 'Ultimate Life Form', draw: kars },
    });
    const base = SBR.stands.keyFor;
    SBR.stands.keyFor = (u, abilityId) => {
      if (u && u.side === 'enemy') {
        if (u.id === 'sb_pucci') return u.sbPhase === 3 ? 'sb_mih' : u.sbPhase === 2 ? 'sb_cmoon' : 'whitesnake';
        const M = { sb_kars: 'sb_kars', sb_dio: 'theworld', sb_kira: 'killer_queen', sb_sha: 'killer_queen', sb_trex: 'scarymonsters' };
        if (M[u.id] && SBR.stands.DEFS[M[u.id]]) return M[u.id];
      }
      return base(u, abilityId);
    };
  })();

  /* ================= 4. Statuses shown on superbosses ================= */
  Object.assign(SBR.STATUS, {
    sb_accel: { name: 'Acceleration', glyph: '速', color: '#8adf6a', kind: 'buff', mode: 'stacks', max: 20, desc: s => `Time accelerates. ${s} / ${ACCEL_LIMIT}: one free action for every 4 stacks. At ${ACCEL_LIMIT} the universe completes its cycle.` },
    sb_adapt: { name: 'Adapted', glyph: '適', color: '#c8323c', kind: 'buff', mode: 'stacks', max: 3, desc: s => `The Ultimate Life Form has adapted ${s} time${s > 1 ? 's' : ''}: much tougher against the damage that hurt it most.` },
    sb_btd: { name: 'Bites the Dust', glyph: '塵', color: '#e8508a', kind: 'buff', mode: 'turns', desc: () => 'While Sheer Heart Attack lives, every third round Kira rewinds time to heal the damage of the last three.' },
  });
  (() => {
    const I = SBR.icons, st = I.st, K = I.K;
    const glyph = (c, g) => `<circle cx="24" cy="24" r="18" fill="${c}" ${st}/><text x="24" y="31" font-size="20" text-anchor="middle" font-family="serif" fill="#fff" stroke="${K}" stroke-width="1" paint-order="stroke">${g}</text>`;
    Object.entries({ sb_accel: ['#3a8a4a', '速'], sb_adapt: ['#c8323c', '適'], sb_btd: ['#e8508a', '塵'] }).forEach(([id, [c, g]]) => I.define('status', id, () => glyph(c, g)));
  })();
  const ACCEL_LIMIT = 15;

  /* ================= 5. Shared mechanics ================= */
  // superbosses match the act they're met in: about 2-3x that act's boss
  const ACT_SCALE = { 1: 0.5, 2: 0.6, 3: 0.72, 4: 0.85, 5: 1, 6: 1.1 };
  const D = (x, n) => Math.max(1, Math.round(n * (x.user.sbMul || 1)));
  const sbStart = x => {
    const u = x.user, f = ACT_SCALE[(SBR.run && SBR.run.act) || 5] || 1;
    u.maxHp = Math.max(1, Math.round(u.maxHp * f)); u.hp = u.maxHp;
    u.sbMul = Math.pow(f, 0.8);
    u.energy = 3;
    u.sbTally = {};
  };
  // stun-locking a superboss doesn't work: after being stopped once, it shrugs off the next two rounds of stuns
  const unshaken = x => {
    const u = x.user;
    if (!(x.has(u, 'stun') || x.has(u, 'timestop'))) return;
    if (u.sbLastStun != null && x.c.round - u.sbLastStun < 3) {
      if (x.has(u, 'stun')) x.removeStatus(u, 'stun');
      if (x.has(u, 'timestop')) x.removeStatus(u, 'timestop');
      x.c.push({ t: 'float', uid: u.uid, text: 'UNSHAKEN', cls: 'block big' });
    } else u.sbLastStun = x.c.round;
  };
  /** the damage event that just hit this unit (hooks run right after it is pushed) */
  const lastHit = x => { const ev = x.c.events; for (let i = ev.length - 1; i >= 0 && i >= ev.length - 8; i--) if (ev[i].t === 'dmg' && ev[i].uid === x.user.uid) return ev[i]; return null; };
  const tally = x => { const e = lastHit(x); if (e && e.dtype && e.amount > 0) { const t = x.user.sbTally || (x.user.sbTally = {}); t[e.dtype] = (t[e.dtype] || 0) + e.amount; } return e; };
  const float = (x, text, cls = 'debuff big', u = x.user) => x.c.push({ t: 'float', uid: u.uid, text, cls });
  const pick = a => U.pick(a);
  const others = (x, t) => x.enemies.filter(e => e !== t);

  /* ================= 6. The superbosses ================= */
  const E = SBR.ENEMIES;

  /* ---- Kars: three lives, and he adapts to whatever hurt him ---- */
  const KARS_ULT = [
    { name: 'Ultimate Blade Storm', w: 2, cd: 2, target: 'allEnemies', fx: 'claw', run: x => x.enemies.forEach(e => { const r = x.dmg(e, D(x, 9), { spin: 0.02 }, { dtype: 'bleed' }); if (r.hit) x.status(e, 'bleed', 2); }) },
    { name: 'Hamon Mimicry', w: 2, cd: 3, target: 'enemy', fx: 'golden', run: x => { const r = x.dmg(x.target, D(x, 16), { spin: 0.03 }, { dtype: 'holy' }); if (r.hit && x.roll(0.5)) x.status(x.target, 'stun', 0, 1); x.say(x.user, 'The Ripple? I can make that too.'); } },
    { name: 'Creature Mimicry', w: 2, cd: 2, target: 'self', fx: 'buff', run: x => {
      const k = U.randInt(0, 2);
      if (k === 0) { x.enemies.forEach(e => x.status(e, 'blind', 0, 2)); x.log('Kars sprays squid ink across the chamber.'); }
      else if (k === 1) { x.status(x.user, 'evasive', 0, 2); const t = x.randomEnemy(); if (t) x.dmg(t, D(x, 12), { ride: 0.03 }); x.log('Hawk wings burst from his back.'); }
      else { x.status(x.user, 'shield', D(x, 24)); x.log('His skin hardens like a beetle\'s shell.'); }
    } },
    { name: 'Absorb', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, D(x, 14), { grit: 0.03 }); if (r.hit) x.heal(x.user, Math.ceil((r.amount || 0) / 2)); } },
  ];
  E.sb_kars = { name: 'Kars', title: 'The Ultimate Life Form', art: port('sb_kars'), tier: 'boss', secret: true, undead: true, native: true, hp: 210, stats: { spin: 10, grit: 10, ride: 10, aim: 8 }, xp: 260, money: [160, 220], dtype: 'phys',
    res: { bullet: -0.25, phys: -0.15, bleed: -0.5, cold: 0.1, holy: 0.2 },
    stand: 'Brilliant Blades / The Red Stone of Aja', sigil: 'star', sigilColor: '#f2c14e',
    quote: 'Two thousand years I waited for this stone. You came all this way to watch me become perfect. How kind.',
    passive: 'THREE LIVES. Each time he falls, Kars ADAPTS: he becomes much tougher (-55%) against the damage type that hurt him most, and grows new powers. Change your damage between his lives. His first body still fears the sun: Holy deals double.',
    abilities: [
      { name: 'Brilliant Blades', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, D(x, 11), { spin: 0.03 }, { dtype: 'bleed' }); if (r.hit) x.status(x.target, 'bleed', 2); const o = pick(others(x, x.target)); if (o) x.dmg(o, D(x, 7), { spin: 0.02 }, { dtype: 'bleed' }); } },
      { name: 'Flesh Absorption', w: 2, cd: 2, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, D(x, 13), { grit: 0.03 }); if (r.hit) x.heal(x.user, r.amount || 0); } },
      { name: 'Light Mode', w: 1, cd: 3, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => { x.dmg(e, D(x, 8), { spin: 0.02 }); if (x.roll(0.5)) x.status(e, 'blind', 0, 1); }) },
      { name: 'Two Thousand Years of Patience', w: 1, cd: 4, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'shield', D(x, 20)); x.cleanse(x.user, 99); } },
    ],
    hooks: {
      start: x => { sbStart(x); x.user.sbLives = 0; x.user.sbAdapted = []; },
      turnStart: x => { unshaken(x); if (x.user.sbLives >= 2) { const h = Math.max(1, Math.round(x.user.maxHp * 0.05)); x.heal(x.user, h); } },
      damaged: x => { tally(x); },
      death: x => {
        const u = x.user; tally(x);
        u.sbLives = (u.sbLives || 0) + 1;
        if (u.sbLives > 2) { x.log('Kars is thrown into the sky and cannot come down. Eventually, he stops thinking.'); return false; }
        // adapt to the type that hurt him most this life
        const types = Object.entries(u.sbTally || {}).filter(([k]) => k !== 'true' && !u.sbAdapted.includes(k)).sort((a, b) => b[1] - a[1]);
        const t = types.length ? types[0][0] : pick(['phys', 'bullet', 'spin', 'stand'].filter(k => !u.sbAdapted.includes(k)));
        u.sbAdapted.push(t);
        u.baseRes = Object.assign({}, u.baseRes, { [t]: Math.min((u.baseRes || {})[t] || 0, -0.55) });
        u.sbTally = {};
        if (u.sbLives === 1) {
          u.def = Object.assign({}, u.def, { undead: false });
          u.baseRes.holy = -0.3;
          u.xAbilities = KARS_ULT;
          x.revive(u, 0.7);
          x.status(u, 'evasive', 0, 2);
          x.dialogue('ft_sb_kars_ult_pre');
        } else {
          x.revive(u, 0.5);
          x.status(u, 'empower', 0, 99);
          x.dialogue('ft_sb_kars_last_pre');
        }
        x.status(u, 'sb_adapt', 1);
        float(x, `ADAPTED: ${SBR.DMG[t] ? SBR.DMG[t].name.toUpperCase() : t}`, 'block big');
        x.log(`Kars adapts. ${SBR.DMG[t] ? SBR.DMG[t].name : t} barely scratches him now.`);
        return true;
      },
    } };

  /* ---- Pucci: time accelerates every round, three Stands ---- */
  const PUCCI = {
    1: [
      { name: 'Disc Theft', w: 2, cd: 2, target: 'enemy', fx: 'debuff', run: x => { x.dmg(x.target, D(x, 9), { res: 0.03 }); x.status(x.target, 'disclock', 0, 2); x.say(x.user, 'Your Stand. Your memories. I will keep them safe.'); } },
      { name: 'Melting Your Heart', w: 1, cd: 3, target: 'allEnemies', fx: 'spray', run: x => x.enemies.forEach(e => { x.dmg(e, D(x, 6), {}); x.status(e, 'weak', 0, 2); }) },
      { name: 'Whitesnake Strike', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, D(x, 12), { aim: 0.03 }) },
    ],
    2: [
      { name: 'Gravity Inversion', w: 2, cd: 2, target: 'enemy', fx: 'hit', run: x => { const inside = x.has(x.target, 'vuln'); x.dmg(x.target, D(x, 15), { res: 0.03 }); if (inside) { float(x, 'INSIDE OUT!', 'debuff big', x.target); x.dmg(x.target, D(x, 8), {}, { dtype: 'true', noDodge: true }); } } },
      { name: 'Surface Inversion', w: 1, cd: 3, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => { x.dmg(e, D(x, 7), {}); x.status(e, 'vuln', 0, 2); }) },
      { name: 'C-Moon Strike', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, D(x, 12), { aim: 0.03 }) },
    ],
    3: [
      { name: 'Accelerated Knives', w: 3, target: 'enemy', fx: 'hit', run: x => { for (let i = 0; i < 3; i++) { const t = x.randomEnemy(); if (t) x.dmg(t, D(x, 5), { aim: 0.02 }); } } },
      { name: 'Blur of Heaven', w: 2, cd: 2, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => x.dmg(e, D(x, 8), { ride: 0.02 }, { noDodge: true })) },
      { name: 'Disc Theft', w: 1, cd: 3, target: 'enemy', fx: 'debuff', run: x => { x.dmg(x.target, D(x, 9), {}); x.status(x.target, 'disclock', 0, 2); } },
    ],
  };
  E.sb_pucci = { name: 'Enrico Pucci', title: 'Priest of the Accelerating Heaven', art: port('sb_pucci'), tier: 'boss', secret: true, hp: 520, stats: { aim: 9, res: 9, ride: 9, grit: 7 }, xp: 280, money: [170, 230], dtype: 'stand',
    res: { stand: -0.25, holy: -0.3, bullet: -0.1, spin: 0.2 },
    stand: 'Whitesnake → C-Moon → Made in Heaven', sigil: 'clock', sigilColor: '#8adf6a',
    quote: 'Spiral staircase. Rhinoceros beetle. Desolation Row. Fig tart... You carry the bones of a Saint. I only need a few of them to reach Heaven.',
    passive: `TIME ACCELERATES: every round he gains Acceleration, and one free action for every 4 stacks. At ${ACCEL_LIMIT} the universe completes its cycle and your party is erased. Whitesnake steals discs; below 2/3 HP C-Moon turns gravity inside out (Exposed riders take extra true damage); below 1/3 Made in Heaven doubles the acceleration. Kill him fast.`,
    abilities: PUCCI[1],
    hooks: {
      start: x => { sbStart(x); x.user.sbPhase = 1; x.user.xAbilities = PUCCI[1]; },
      turnStart: x => unshaken(x),
      roundStart: x => {
        const u = x.user, c = x.c;
        x.status(u, 'sb_accel', u.sbPhase === 3 ? 2 : 1);
        const s = x.stacks(u, 'sb_accel');
        float(x, s >= ACCEL_LIMIT ? 'HEAVEN!' : `ACCELERATION ${s}/${ACCEL_LIMIT}`, s >= ACCEL_LIMIT - 4 ? 'debuff big' : 'buff big');
        if (s >= ACCEL_LIMIT) {
          c.push({ t: 'banner', text: 'MADE IN HEAVEN', sub: 'Time reaches its end. The universe begins again without you.' });
          c.alive('party').forEach(p => c.typedHp(p, p.maxHp * 3, 'true', 'HEAVEN'));
          return;
        }
        if (s >= ACCEL_LIMIT - 4) x.log(`Acceleration ${s}/${ACCEL_LIMIT}. The sun streaks across the sky like a comet.`);
        const extra = Math.min(3, Math.floor(s / 4));
        for (let i = 0; i < extra && !c.result && !u.dead; i++) c.enemyAct(u, true);
      },
      damaged: x => {
        const u = x.user;
        if (u.sbPhase === 1 && u.hp < u.maxHp * 0.66) { u.sbPhase = 2; u.xAbilities = PUCCI[2]; x.dialogue('ft_sb_pucci_cmoon_pre'); x.cleanse(u, 99); x.enemies.forEach(e => x.status(e, 'vuln', 0, 1)); float(x, 'C-MOON', 'buff big'); }
        else if (u.sbPhase === 2 && u.hp < u.maxHp * 0.33) { u.sbPhase = 3; u.xAbilities = PUCCI[3]; x.dialogue('ft_sb_pucci_mih_pre'); x.status(u, 'evasive', 0, 2); float(x, 'MADE IN HEAVEN', 'buff big'); }
      },
    } };

  /* ---- DIO: stops time for longer and longer; a vampire who only stays dead to the sun or the Spin ---- */
  const zaWarudo = (x, n) => {
    const c = x.c, u = x.user;
    if (c.result || u.dead || !c.alive('party').length) return;
    c.push({ t: 'timestop', on: true });
    x.say(u, n >= 3 ? 'ZA WARUDO! Time stops... for as long as I please!' : 'ZA WARUDO! TOKI WO TOMARE!');
    for (let i = 0; i < n && !c.result; i++) c.enemyAct(u, true);
    c.push({ t: 'timestop', on: false });
    x.log(`THE WORLD stops time: DIO moves ${n} time${n > 1 ? 's' : ''} while nobody else can.`);
  };
  E.sb_dio = { name: 'DIO', title: 'From the World Next Door', art: port('sb_dio'), tier: 'boss', secret: true, undead: true, hp: 420, stats: { aim: 10, ride: 10, grit: 9, spin: 6 }, xp: 290, money: [180, 240], dtype: 'stand',
    res: { phys: -0.2, bullet: -0.35, stand: -0.2, bleed: -0.5, cold: -0.2, holy: 0.2, spin: 0.3 },
    stand: 'THE WORLD', sigil: 'clock', sigilColor: '#ffd84a',
    quote: 'So this is the world Valentine keeps dragging his flags through. Another Joestar, another horse, another Corpse. Come closer. I want to see you struggle.',
    passive: 'THE WORLD: every other round he stops time, and each stop lasts longer (more free moves). Below half HP: ROAD ROLLER. A vampire: Holy deals double, and unless the killing blow is Holy or Spin he regenerates once and gets back up.',
    abilities: [
      { name: 'MUDA MUDA MUDA', w: 3, target: 'enemy', fx: 'hit', run: x => { for (let i = 0; i < 4; i++) x.dmg(x.target, D(x, 4), { aim: 0.02 }); } },
      { name: 'Knife Barrage', w: 2, cd: 2, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => { const r = x.dmg(e, D(x, 6), { aim: 0.02 }, { dtype: 'bullet' }); if (r.hit) x.status(e, 'bleed', 1); }) },
      { name: 'Vampiric Drain', w: 2, cd: 2, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, D(x, 13), { grit: 0.03 }, { dtype: 'bleed' }); if (r.hit) x.heal(x.user, r.amount || 0); } },
      { name: 'Space Ripper Stingy Eyes', w: 1, cd: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, D(x, 19), { aim: 0.03 }, { noDodge: true, pierce: true }) },
    ],
    hooks: {
      start: x => sbStart(x),
      turnStart: x => unshaken(x),
      roundStart: x => { if (x.round % 2 === 0) zaWarudo(x, Math.min(4, 1 + Math.floor(x.round / 4) + (x.user.sbRage ? 1 : 0))); },
      damaged: x => {
        const u = x.user;
        if (!u.sbRage && u.hp < u.maxHp * 0.5) {
          u.sbRage = true;
          x.dialogue('ft_sb_dio_roller_pre');
          x.c.push({ t: 'timestop', on: true });
          x.enemies.forEach(e => { x.dmg(e, D(x, 16), {}, { noDodge: true, label: 'ROAD ROLLER' }); if (x.roll(0.5)) x.status(e, 'stun', 0, 1); });
          x.c.push({ t: 'timestop', on: false });
          x.status(u, 'empower', 0, 3);
        }
      },
      death: x => {
        const u = x.user, e = lastHit(x);
        const fatal = e && ['holy', 'spin'].includes(e.dtype);
        if (!fatal && !u.sbRevived) {
          u.sbRevived = true;
          x.revive(u, 0.3);
          float(x, 'WRYYYYY!', 'buff big');
          x.log('DIO\'s flesh knits itself back together. Only sunlight or the Spin can finish a vampire.');
          x.dialogue('ft_sb_dio_revive_pre');
          return true;
        }
        x.log(fatal ? 'The light gets inside him. DIO crumbles like a statue in the sun.' : 'Even a vampire can only get up so many times.');
        return false;
      },
    } };

  /* ---- Kira: bombs, Sheer Heart Attack, and Bites the Dust rewinding his wounds ---- */
  E.sb_sha = { name: 'Sheer Heart Attack', title: 'Killer Queen\'s Second Bomb', art: beast('shabomb', '#8a8a9a', ['#3a2a5a', '#e8742a']), tier: 'elite', native: true, hp: 50, stats: { grit: 12, ride: 6 }, xp: 20, money: [0, 0], dtype: 'phys',
    res: { phys: -0.7, bullet: -0.7, stand: -0.5, spin: -0.3, bleed: -1, cold: 0.6 },
    passive: 'Chases whoever burns hottest (the rider with the most Energy). Almost indestructible, but the cold stops it. While it lives, Kira can Bite the Dust.',
    abilities: [{ name: 'Look Over Here!', w: 1, target: 'enemy', fx: 'boom', run: x => { const t = x.enemies.slice().sort((a, b) => (b.energy || 0) - (a.energy || 0))[0] || x.target; x.dmg(t, D(x, 10), {}, { dtype: 'phys', label: 'KOTCHI WO MIRO' }); x.status(t, 'burn', 1); } }],
    hooks: { start: x => { const f = ACT_SCALE[(SBR.run && SBR.run.act) || 5] || 1; x.user.sbMul = Math.pow(f, 0.8); x.user.maxHp = Math.round(x.user.maxHp * f); x.user.hp = x.user.maxHp; } } };
  E.sb_kira = { name: 'Yoshikage Kira', title: 'A Quiet Man From Another Morioh', art: port('sb_kira'), tier: 'boss', secret: true, hp: 400, stats: { aim: 9, grit: 7, luck: 8 }, xp: 270, money: [170, 230], dtype: 'stand',
    res: { stand: -0.25, phys: -0.1, bullet: 0.1, spin: 0.2, holy: 0.1 },
    stand: 'Killer Queen: Bites the Dust', sigil: 'dmark', sigilColor: '#e8508a',
    quote: 'All I want is a quiet life. No stress, eight hours of sleep, no enemies. And yet here you are, on my train, looking at me. I cannot allow that.',
    passive: 'KILLER QUEEN primes riders to explode (Brace to pull the pin). BITES THE DUST: every third round he rewinds time and heals what the last three rounds cost him, but only while Sheer Heart Attack lives. It returns every four rounds. It is weak to Cold. Below 40% HP he primes the whole party.',
    abilities: [
      { name: 'First Bomb', w: 3, target: 'enemy', fx: 'pin', run: x => { const r = x.dmg(x.target, D(x, 9), { aim: 0.03 }); if (r.hit && !x.has(x.target, 'primed')) x.status(x.target, 'primed', 0, 2); } },
      { name: 'Killer Queen', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, D(x, 13), { grit: 0.03 }) },
      { name: 'Stray Cat\'s Air Bombs', w: 1, cd: 3, target: 'allEnemies', fx: 'boom', run: x => x.enemies.forEach(e => x.dmg(e, D(x, 7), {}, { dtype: 'phys' })) },
      { name: 'Hand Fetish', w: 1, cd: 4, target: 'self', fx: 'heal', run: x => { x.heal(x.user, D(x, 22)); x.cleanse(x.user, 2); x.say(x.user, 'Such a lovely hand. It calms me down.'); } },
    ],
    hooks: {
      start: x => { sbStart(x); x.user.sbHist = {}; x.status(x.user, 'sb_btd', 0, 999); x.summon('sb_sha'); },
      turnStart: x => unshaken(x),
      roundStart: x => {
        const u = x.user, r = x.round;
        const sha = x.allies.find(a => a.id === 'sb_sha');
        if (!sha && r > 1 && r % 4 === 0) { x.summon('sb_sha'); x.log('Sheer Heart Attack rolls back out of Killer Queen\'s left hand.'); }
        if (r >= 3 && r % 3 === 0 && sha) {
          const past = u.sbHist[r - 3];
          if (past != null && past > u.hp) {
            const amt = Math.min(past - u.hp, Math.round(u.maxHp * 0.25));
            x.c.push({ t: 'rewind' });
            float(x, 'BITES THE DUST!', 'buff big');
            x.heal(u, amt);
            x.log('BITES THE DUST. The last three rounds never happened... for Kira.');
          }
        } else if (r >= 3 && r % 3 === 0) x.log('Without Sheer Heart Attack, Bites the Dust has nothing to hold on to.');
        u.sbHist[r] = u.hp;
      },
      damaged: x => {
        const u = x.user;
        if (!u.sbLast && u.hp < u.maxHp * 0.4) {
          u.sbLast = true;
          x.dialogue('ft_sb_kira_last_pre');
          x.enemies.forEach(e => { if (!x.has(e, 'primed')) x.status(e, 'primed', 0, 2); });
          float(x, 'ANOTHER ONE BITES THE DUST', 'debuff big');
        }
      },
      death: x => { x.allies.filter(a => a.id === 'sb_sha').forEach(a => x.kill(a)); return false; },
    } };

  /* ---- Diego, Tyrant of the Cretaceous: a T-Rex with a raptor horde ---- */
  E.sb_raptor = { name: 'Cretaceous Raptor', art: beast('raptor', '#8a9a3a', ['#1a2a1a', '#c8e04a']), hp: 26, stats: { ride: 9 }, xp: 8, money: [0, 4], native: true, dtype: 'bleed', res: { phys: -0.2, cold: 0.3, holy: 0.3 },
    abilities: [{ name: 'Sickle Claw', w: 1, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, D(x, 6), { ride: 0.02 }); if (r.hit) x.status(x.target, 'fossil', 1); } }],
    hooks: { start: x => { const f = ACT_SCALE[(SBR.run && SBR.run.act) || 5] || 1; x.user.sbMul = Math.pow(f, 0.8); x.user.maxHp = Math.max(1, Math.round(x.user.maxHp * Math.max(0.7, f))); x.user.hp = x.user.maxHp; } } };
  E.sb_trex = { name: 'Diego Brando', title: 'Tyrant of the Cretaceous', art: beast('trex', '#6a9a4a', ['#1a2a1a', '#c8e04a']), tier: 'boss', secret: true, native: true, hp: 430, stats: { grit: 10, ride: 8, aim: 6 }, xp: 270, money: [160, 220], dtype: 'bleed',
    res: { phys: -0.3, bullet: -0.2, bleed: -0.3, cold: 0.35, holy: 0.3 },
    stand: 'Scary Monsters: Tyrannosaurus', sigil: 'claw', sigilColor: '#c8e04a',
    quote: 'Every bone in this mountain used to be a king. Now they are my army. You smell of the Saint... and of fear. Both smell delicious.',
    passive: 'THE HORDE: a raptor tears out of the walls every round (two once he is wounded), and each living raptor shields him. Below half HP the whole pack stampedes; below a quarter he goes into a frenzy and acts twice. His bites Fossilize: at 5 stacks a rider turns into a dinosaur. Weak to Cold and Holy.',
    abilities: [
      { name: 'Tyrant Bite', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, D(x, 14), { grit: 0.03 }); if (r.hit) x.status(x.target, 'fossil', 2); } },
      { name: 'Tail Whip', w: 2, cd: 2, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => { const r = x.dmg(e, D(x, 8), { grit: 0.02 }, { dtype: 'phys' }); if (r.hit) x.status(e, 'fossil', 1); }) },
      { name: 'Kinetic Vision', w: 1, cd: 3, target: 'self', fx: 'scan', run: x => { x.status(x.user, 'evasive', 0, 2); x.enemies.forEach(e => x.status(e, 'marked', 0, 1)); x.say(x.user, 'Move. Go on. I can see every twitch.'); } },
      { name: 'Primal Roar', w: 1, cd: 4, target: 'allEnemies', fx: 'sound', run: x => x.enemies.forEach(e => { x.status(e, 'fear', 0, 1); x.status(e, 'weak', 0, 1); }) },
    ],
    hooks: {
      start: x => sbStart(x),
      turnStart: x => unshaken(x),
      roundStart: x => {
        const u = x.user, raps = () => x.allies.filter(a => a.id === 'sb_raptor');
        const n = u.sbPhase >= 2 ? 2 : 1;
        for (let i = 0; i < n && x.allies.length < 4; i++) x.summon('sb_raptor');
        const k = raps().length;
        if (k) { x.status(u, 'shield', D(x, 3) * k); x.log(`${k} raptor${k > 1 ? 's' : ''} circle the Tyrant, guarding him.`); }
        if (u.sbPhase >= 3 && !x.c.result) x.extraAction();
      },
      damaged: x => {
        const u = x.user;
        if (!u.sbPhase || u.sbPhase < 2) {
          if (u.hp < u.maxHp * 0.5) {
            u.sbPhase = 2;
            x.dialogue('ft_sb_trex_stampede_pre');
            const pack = x.allies.filter(a => a.id === 'sb_raptor');
            pack.forEach(a => { const t = x.randomEnemy(); if (t) x.c.damage(a, t, D(x, 9), {}, { label: 'STAMPEDE' }); x.kill(a); });
            if (pack.length) x.heal(u, Math.round(u.maxHp * 0.04 * pack.length));
            float(x, 'EXTINCTION STAMPEDE', 'debuff big');
          }
        } else if (u.sbPhase === 2 && u.hp < u.maxHp * 0.25) {
          u.sbPhase = 3;
          x.status(u, 'empower', 0, 99);
          float(x, 'FRENZY', 'debuff big');
          x.say(u, 'WRYYYYYY! I am the apex! The top of the food chain!');
        }
      },
    } };

  /* ================= 7. Souls, legendary gear and their abilities ================= */
  Object.assign(SBR.REMNANTS, {
    rem_sb_kars: { name: 'The Red Stone of Aja', from: 'Kars', color: '#c8323c', motif: 'spiral' },
    rem_sb_pucci: { name: 'DISC of Heaven', from: 'Enrico Pucci', color: '#8adf6a', motif: 'clock' },
    rem_sb_dio: { name: 'DIO\'s Stopped Watch', from: 'DIO', color: '#ffd84a', motif: 'clock' },
    rem_sb_kira: { name: 'Killer Queen\'s Detonator', from: 'Yoshikage Kira', color: '#e8508a', motif: 'bomb' },
    rem_sb_trex: { name: 'Tyrant Fang', from: 'Diego, Tyrant of the Cretaceous', color: '#c8e04a', motif: 'claw' },
  });
  ['rem_sb_kars', 'rem_sb_pucci', 'rem_sb_dio', 'rem_sb_kira', 'rem_sb_trex'].forEach(k => { const r = SBR.REMNANTS[k]; SBR.MATERIALS[k] = { name: r.name, rarity: 'remnant', group: 'soul', desc: `Soul of a Strange Aura: ${r.from}. A Soul: owning it unlocks their legendary gear for the rest of the run. Crafting never uses it up.`, remnant: true, color: r.color, motif: r.motif }; });
  Object.assign(SBR.REMNANT_DROPS, { sb_kars: 'rem_sb_kars', sb_pucci: 'rem_sb_pucci', sb_dio: 'rem_sb_dio', sb_kira: 'rem_sb_kira', sb_trex: 'rem_sb_trex' });
  Object.assign(SBR.DROPS, {
    sb_kars: [['gold', 1, 2, 4], ['sap', 1, 1, 2]], sb_pucci: [['menger', 1, 2, 3], ['silver', 1, 2, 3]], sb_dio: [['gold', 1, 3, 4], ['fang', 1, 2, 3]],
    sb_kira: [['powder', 1, 3, 4], ['menger', 1, 1, 2]], sb_trex: [['fossil', 1, 3, 5], ['scale', 1, 2, 4]], sb_sha: [['scrap', 0.8, 1, 2]], sb_raptor: [['scale', 0.4, 1, 1], ['fossil', 0.2, 1, 1]],
  });

  Object.assign(SBR.ABILITIES, {
    sb_light_blade: { name: 'Brilliant Blade', cost: 2, cd: 2, target: 'allEnemies', tags: [], fx: 'claw', dtype: 'bleed', desc: () => 'Blades of light fan out from the arm: 6 Bleed damage to every enemy, and Bleed 2.', run(x) { x.enemies.forEach(e => { const r = x.dmg(e, 6, { spin: 0.03 }); if (r.hit) x.status(e, 'bleed', 2); }); } },
    sb_accelerate: { name: 'Accelerate', cost: 1, cd: 3, target: 'ally', tags: ['stand'], fx: 'buff', desc: () => 'Time runs faster for one ally: +2 Energy and Evasive 2.', run(x) { const t = x.target || x.user; x.energy(t, 2); x.status(t, 'evasive', 0, 2); } },
    sb_zawarudo: { name: 'ZA WARUDO', cost: 3, cd: 4, target: 'enemy', tags: ['stand'], fx: 'hit', desc: () => 'Stop time on one enemy: it loses its next turn, then take 5 hits of 3 (knives).', run(x) { x.status(x.target, 'timestop', 0, 1); for (let i = 0; i < 5; i++) x.dmg(x.target, 3, { aim: 0.02 }, { noDodge: true }); } },
    sb_primary_bomb: { name: 'Primary Bomb', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], fx: 'boom', desc: () => 'Touch, and it\'s a bomb: 8 damage now, and it explodes for 18 two turns later.', run(x) { const r = x.dmg(x.target, 8, { grit: 0.03 }, { dtype: 'phys' }); if (r.hit) x.status(x.target, 'primed', 0, 2); } },
    sb_tyrant_roar: { name: 'Tyrant\'s Roar', cost: 1, cd: 3, target: 'allEnemies', tags: [], fx: 'sound', desc: () => 'Every enemy is Frightened and Weakened for a turn.', run(x) { x.enemies.forEach(e => { x.status(e, 'fear', 0, 1); x.status(e, 'weak', 0, 2); }); } },
  });
  Object.assign(SBR.EQUIPMENT, {
    sb_kars_blade:  { slot: 'weapon', name: 'Kars\' Brilliant Blade', rarity: 'remnant', stats: { spin: 6, grit: 4 }, bonus: { bleedOnBasic: 0.35, lifesteal: 0.12, dmg: 0.08 }, ability: 'sb_light_blade', recipe: { gold: 2, sap: 1 }, remnant: 'rem_sb_kars', price: 400, note: 'A blade of bone and light that grew out of the Ultimate Life Form\'s forearm. It still hums with the Red Stone.' },
    sb_heaven_disc: { slot: 'charm', family: 'device', name: 'DISC of Made in Heaven', rarity: 'remnant', stats: { ride: 5, res: 3 }, bonus: { init: 6, dodge: 0.08, energyStart: 1 }, ability: 'sb_accelerate', recipe: { menger: 2, silver: 2 }, remnant: 'rem_sb_pucci', price: 400, note: 'Slide it into your head and time feels thinner.' },
    sb_dio_band:    { slot: 'hat', name: 'DIO\'s Heart Headband', rarity: 'remnant', stats: { aim: 5, grit: 3 }, bonus: { critDmg: 0.3, lifesteal: 0.15, res: { holy: 0.15 } }, ability: 'sb_zawarudo', recipe: { gold: 2, fang: 2 }, remnant: 'rem_sb_dio', price: 420, note: 'Green, with little hearts. Wearing it makes the sun feel a little too warm.' },
    sb_kira_tie:    { slot: 'charm', family: 'trophy', name: 'Bites the Dust Button', rarity: 'remnant', stats: { luck: 5 }, bonus: { selfRewind: 1, crit: 0.05 }, ability: 'sb_primary_bomb', recipe: { powder: 3, menger: 1 }, remnant: 'rem_sb_kira', price: 400, note: 'A cufflink shaped like a skull. Once per battle, the wearer\'s death is rewound.' },
    sb_tyrant_hide: { slot: 'coat', name: 'Tyrant Hide', rarity: 'remnant', stats: { grit: 8 }, bonus: { maxHp: 20, res: { phys: -0.2, bleed: -0.2 }, immune: ['fossil'] }, ability: 'sb_tyrant_roar', recipe: { fossil: 3, scale: 2 }, remnant: 'rem_sb_trex', price: 400, note: 'Scaled, thick, and warm. The raptors in the mine bow to whoever wears it.' },
  });
  // economy.js folded the old material ids before this file loaded: fold ours the same way
  const foldDrops = ids => ids.forEach(k => { const rows = {}; (SBR.DROPS[k] || []).forEach(([m, ch, a, b]) => { const j = SBR.matId(m); const o = rows[j]; rows[j] = o ? [j, Math.min(1, Math.max(o[1], ch) + 0.1), o[2], Math.max(o[3], b)] : [j, ch, a, b]; }); SBR.DROPS[k] = Object.values(rows); });
  foldDrops(['sb_kars', 'sb_pucci', 'sb_dio', 'sb_kira', 'sb_trex', 'sb_sha', 'sb_raptor']);
  ['sb_kars_blade', 'sb_heaven_disc', 'sb_dio_band', 'sb_kira_tie', 'sb_tyrant_hide'].forEach(k => { const e = SBR.EQUIPMENT[k]; if (e.recipe && SBR.foldRecipe) e.recipe = SBR.foldRecipe(e.recipe); });
  (() => {
    const I = SBR.icons, P = I.P, K = I.K, st = I.st, shine = I.shine;
    const e = (id, fn) => I.define('equip', id, fn);
    e('sb_kars_blade', () => `<path d="M8 42 Q18 22 42 4 Q34 20 14 44z" fill="#fff8d0" ${st}/><path d="M14 38 Q22 24 36 12" stroke="#f2c14e" stroke-width="1.6" fill="none"/><path d="M4 40 l8 -6 6 8 -8 6z" fill="#e2b890" ${st}/><circle cx="10" cy="41" r="2" fill="#c8323c"/>`);
    e('sb_heaven_disc', () => `<circle cx="24" cy="24" r="18" fill="#dff2e8" ${st}/><circle cx="24" cy="24" r="5" fill="#fff" ${st}/><path d="M24 8 A16 16 0 0 1 40 24" stroke="#8adf6a" stroke-width="3" fill="none"/><path d="M24 24 v-9 M24 24 l6 3" stroke="${K}" stroke-width="2"/>${shine(15, 14, 3)}`);
    e('sb_dio_band', () => `<path d="M4 24 Q24 12 44 24 Q24 18 4 30z" fill="#3a8a4a" ${st}/>${[12, 24, 36].map(x => `<path transform="translate(${x} 21) scale(.5)" d="M0 4C-4-1-9-1-9 3c0 4 9 9 9 9s9-5 9-9c0-4-5-4-9 1z" fill="#e8508a" ${st} stroke-width="2"/>`).join('')}`);
    e('sb_kira_tie', () => `<path d="M20 6 h8 l4 8 -8 30 -8 -30z" fill="#6a4a8a" ${st}/><circle cx="24" cy="24" r="5" fill="#f6ecd8" ${st} stroke-width="1.4"/><circle cx="22.5" cy="23" r="1" fill="${K}"/><circle cx="25.5" cy="23" r="1" fill="${K}"/><path d="M22 27 h4" stroke="${K}" stroke-width="1"/>`);
    e('sb_tyrant_hide', () => P.coat('#6a9a4a', '#c8e04a') + [14, 22, 30].map(y => `<path d="M16 ${y} q4 -4 8 0 q4 -4 8 0" stroke="${K}" stroke-width="1.4" fill="none"/>`).join(''));
    const ab = (id, eq) => I.define('ability', id, () => SBR.icons.equip(eq).replace(/^<svg[^>]*>|<\/svg>$/g, ''));
    ab('sb_light_blade', 'sb_kars_blade'); ab('sb_accelerate', 'sb_heaven_disc'); ab('sb_zawarudo', 'sb_dio_band'); ab('sb_primary_bomb', 'sb_kira_tie'); ab('sb_tyrant_roar', 'sb_tyrant_hide');
  })();

  /* ================= 8. Techniques and achievements ================= */
  Object.assign(SBR.TECHNIQUES, {
    sb_ultimate: { name: 'Ultimate Adaptation', slots: 3, cost: 90, tag: 'AURA', desc: 'Your riders regenerate 3 HP every turn and are immune to Bleed and Burning.', bonus: { regen: 3, immune: ['bleed', 'burn'] }, unlock: 'sb_kars', unlockText: 'Defeat a Strange Aura beneath the Rockies.' },
    sb_heaven: { name: 'Time Acceleration', slots: 3, cost: 90, tag: 'AURA', desc: '+6 initiative, +6% dodge, and +4 Pace every stage.', bonus: { init: 6, dodge: 0.06, paceStage: 4 }, unlock: 'sb_pucci', unlockText: 'Defeat a Strange Aura that wants the Saint\'s bones.' },
    sb_knives: { name: 'Stopped-Time Knives', slots: 2, cost: 70, tag: 'AURA', desc: 'Critical hits deal +35% damage, and +5% crit chance.', bonus: { critDmg: 0.35, crit: 0.05 }, unlock: 'sb_dio', unlockText: 'Defeat a Strange Aura that hunts the hunted.' },
    sb_quiet: { name: 'A Quiet Life', slots: 2, cost: 70, tag: 'AURA', desc: 'Healing +20%, +6% block, and every rider heals 6 HP after each battle.', bonus: { heal: 0.2, block: 0.06, postHeal: 6 }, unlock: 'sb_kira', unlockText: 'Defeat a Strange Aura below Philadelphia.' },
    sb_dinovision: { name: 'Dinosaur Kinetic Vision', slots: 2, cost: 70, tag: 'AURA', desc: '+8% dodge and +3 initiative. Your riders can\'t be turned into dinosaurs.', bonus: { dodge: 0.08, init: 3, immune: ['fossil'] }, unlock: 'sb_trex', unlockText: 'Defeat a Strange Aura in the deepest vein.' },
  });
  Object.assign(SBR.ACHIEVEMENTS, {
    sb_kars: { name: 'The Ultimate Life Form', desc: 'Defeat Kars in the innermost chamber.', rp: 60 },
    sb_pucci: { name: 'Made in Heaven', desc: 'Defeat Enrico Pucci before time ends.', rp: 60 },
    sb_dio: { name: 'THE WORLD', desc: 'Defeat DIO, from the world next door.', rp: 60 },
    sb_kira: { name: 'Bites the Dust', desc: 'Defeat Yoshikage Kira.', rp: 60 },
    sb_trex: { name: 'Tyrant of the Cretaceous', desc: 'Defeat Diego in the deepest vein.', rp: 60 },
    sb_all: { name: 'Strange Aura', desc: 'Defeat all five Strange Auras (lifetime).', rp: 150 },
  });

  /* ================= 9. The secrets: where each one is, and its card ================= */
  const SUPER = SBR.SUPERBOSSES = {
    sb_kars: { enemies: ['sb_kars'], name: 'Kars, the Ultimate Life Form', gear: 'sb_kars_blade',
      blurb: 'Behind the sealed door, something breathes that has not breathed in two thousand years.',
      warn: 'The chamber is lit red. A man stands on the altar with a stone mask in one hand and a red jewel in the other. When he turns, your horses scream.',
      after: 'Kars is gone, flung up into the dark above the tomb. In the dust of the altar: a blade of bone that still glows, and a red stone with a star of light inside it.',
      deed: 'Stopped Kars from becoming the Ultimate Life Form under the Rockies.' },
    sb_pucci: { enemies: ['sb_pucci'], name: 'Enrico Pucci, Made in Heaven', gear: 'sb_heaven_disc',
      blurb: 'A priest walks beside the trail, counting under his breath. The shadows are moving too fast.',
      warn: '"Spiral staircase. Rhinoceros beetle. Desolation Row." A priest with a cross on his collar walks toward you. The sun is already setting, and it was noon a minute ago.',
      after: 'Time slows back to a walk. The priest is gone. On the ground: a white DISC that shows your own face, and a DISC that shows the sky spinning.',
      deed: 'Stopped a priest from another world from reaching Heaven with the Saint\'s bones.' },
    sb_dio: { enemies: ['sb_dio'], name: 'DIO, From the World Next Door', gear: 'sb_dio_band',
      blurb: 'The President hunts you so hard that D4C has dragged in something that should have stayed in its own world.',
      warn: 'A flag is planted in the road, still flapping. Between it and a tree, a door into another world has been left open. A man in yellow steps through it, stretching like he just woke up. "Ah. A Joestar. Even here."',
      after: 'DIO crumbles to ash in the light. Where he stood: a pocket watch stopped at the exact second you won, and a green headband with little hearts on it.',
      deed: 'Put DIO back in his grave, in a world that wasn\'t his.' },
    sb_kira: { enemies: ['sb_kira'], name: 'Yoshikage Kira, Bites the Dust', gear: 'sb_kira_tie',
      blurb: 'A quiet man in a purple suit is waiting in the last car. He has been waiting for you, specifically.',
      warn: 'The last car of the night freight is a velvet-lined sleeper. A man in a purple suit is reading the Philadelphia Inquirer. "You looked at me," he says, folding it. "I saw you look. That was a mistake."',
      after: 'The train rolls to a stop at a platform nobody built. Kira is gone. On his seat: a skull cufflink, warm, and a detonator switch that clicks by itself when nobody is touching it.',
      deed: 'Ended a quiet murderer\'s time loop in the Philadelphia rail yard.' },
    sb_trex: { enemies: ['sb_trex', 'sb_raptor'], name: 'Diego, Tyrant of the Cretaceous', gear: 'sb_tyrant_hide',
      blurb: 'The deepest vein is full of fossils, and every one of them is turning its head toward you.',
      warn: 'The tunnel opens into a cavern full of bones. A Diego who has given himself completely to Scary Monsters stands up. He is thirty feet tall. Every skeleton in the walls starts to twitch.',
      after: 'The Tyrant shrinks back into a man, and the man into dust and scales. The raptors crumble with him. In the rubble: a fang as long as your forearm, and a hide that is still warm.',
      deed: 'Brought down Scary Monsters\' Tyrant in the deepest vein of the Silver Mine.' },
  };
  /** main-route secrets: rare, and only when their condition holds */
  const MAIN = [
    { key: 'sb_pucci', acts: [5, 6], chance: 0.3, cond: () => SBR.corpse && SBR.corpse.count() >= 4 },
    { key: 'sb_dio', acts: [4, 5, 6], chance: 0.3, cond: () => SBR.threatTier() >= 3 || (SBR.run.act === 6 && SBR.threatTier() >= 2) },
  ];
  const secretCard = key => ({ id: 'sb_card_' + key, type: 'boss', custom: 'secret', sb: key, secret: true, stars: 7, title: '??? STRANGE AURA', blurb: SUPER[key].blurb, icon: 'crown', pace: 0, art: null });
  SBR.secretCard = secretCard;
  SBR.sbDone = key => !!(SBR.run && SBR.run.flags['sbDone_' + key]);

  /** main.js: every fresh deal of cards passes through here */
  SBR.extraCards = (cards, G) => {
    const r = SBR.run;
    if (!r || !cards || !cards.length) return cards;
    if (r.area) {
      const A = SBR.AREAS[r.area.id];
      if (!A) return cards;
      // after the detour boss, a hidden deeper stage
      if (r.area.deep && r.area.secret && SUPER[r.area.secret] && !SBR.sbDone(r.area.secret)) {
        return [Object.assign(secretCard(r.area.secret), { forced: true }),
          { id: 'sb_leave', type: 'event', custom: 'leave', forced: true, title: 'Leave While You Can', blurb: `Ride out of ${A.name} now. Whatever is down there stays down there.`, icon: 'map', pace: 0, art: null }];
      }
      if (cards[0] && cards[0].areaBoss) {
        if (r.area.alt == null) r.area.alt = !!(A.altBoss && (!A.altBoss.when || A.altBoss.when(G)));
        const alt = r.area.alt && A.altBoss;
        if (alt || r.area.secret) {
          const B = alt || A.boss, lead = SBR.ENEMIES[B.enemies[0]];
          return [Object.assign({}, cards[0], { areaBoss: false, custom: 'areaboss', altBoss: !!alt, title: B.name, blurb: alt ? (alt.blurb || cards[0].blurb) : cards[0].blurb, art: lead && lead.art && lead.art.kind === 'portrait' ? lead.art.key : null })];
        }
      }
      return cards;
    }
    if (cards[0] && cards[0].forced) return cards;
    for (const M of MAIN) {
      if (!M.acts.includes(r.act) || SBR.sbDone(M.key)) continue;
      let ok = false; try { ok = M.cond(); } catch (e) { ok = false; }
      if (ok && Math.random() < M.chance) return cards.concat([secretCard(M.key)]);
    }
    return cards;
  };

  /** fight a superboss; true on a win */
  async function superFight(key, api) {
    const S = SUPER[key], r = SBR.run, G = api.G, ui = SBR.ui;
    const ch = await ui.eventPanel({ title: '??? STRANGE AURA ★★★★★★★', text: S.warn + ' This is a fight you cannot run from, and if your party falls here the race is over.', icon: 'skull',
      choices: [{ label: 'Step into the aura' }, { label: 'Back away quietly' }] });
    if (!ch || ch.label !== 'Step into the aura') return null;
    r.risk = 5;
    const win = await api.fight(S.enemies, { boss: true, bossName: S.name, strangeAura: key });
    if (!win) return false;
    r.flags['sbDone_' + key] = true;
    SBR.meta.sbBeaten = Object.assign({}, SBR.meta.sbBeaten, { [key]: Date.now() }); SBR.saveMeta();
    G.gear(S.gear);
    G.deed('sb_' + key, S.deed);
    G.achieve(key);
    if (Object.keys(SUPER).every(k => SBR.meta.sbBeaten[k])) G.achieve('sb_all');
    await ui.resultPanel(S.name, S.after, 'star');
    await api.flushPending();
    SBR.saveRun();
    return true;
  }

  /** main.js: cards with `custom` resolve here */
  SBR.customCard = async (card, api) => {
    const r = SBR.run;
    if (card.custom === 'secret') {
      const res = await superFight(card.sb, api);
      if (res === null) { // backed away: the card goes, the stage stays
        r.stageCards = (r.stageCards || []).filter(c => c.id !== card.id);
        if (r.area) { r.area.deep = false; return api.exitArea(); }
        if (!r.stageCards.length) return api.advanceStage();
        SBR.saveRun();
        return api.showStage();
      }
      if (!res) return;
      if (r.area) return api.exitArea();
      return api.advanceStage();
    }
    if (card.custom === 'leave') return api.exitArea();
    if (card.custom === 'areaboss') {
      const A = SBR.AREAS[r.area.id];
      const B = card.altBoss && A.altBoss ? A.altBoss : A.boss;
      const win = await api.fight(B.enemies, { boss: true, bossName: B.name });
      if (!win) return;
      if (card.altBoss && A.altBoss.reward) { A.altBoss.reward(api.G); if (A.altBoss.rewardText) await SBR.ui.resultPanel(B.name, A.altBoss.rewardText, 'star'); await api.flushPending(); }
      if (r.area.secret && SUPER[r.area.secret] && !SBR.sbDone(r.area.secret)) {
        await SBR.ui.resultPanel('Something Below', A.deepText || 'The floor gives way to a passage going further down. A pressure in the air makes every rider\'s ears ring. Something down there has noticed you.', 'skull');
        r.area.deep = true; r.stageCards = null; SBR.saveRun();
        return api.showStage();
      }
      return api.exitArea();
    }
  };

  /* ================= 10. Manga fight talk (before / during / after) ================= */
  const TALK = {
    sb_kars: {
      pre: [['>', 'Red light pours out of the altar. The mask on the pedestal has been waiting for this.', 'menace'], ['sb_kars', 'Wamuu. Esidisi. They were warriors. I am something else.', 'menace'],
        [{ c: 'A Pillar Man with the Red Stone... that\'s the one thing that must never happen!', h: 'God help us. That thing isn\'t a man.', g: 'Nyo-ho... I don\'t like the look of that jewel.', j: '(Every hair on my arms is standing up.)', any: 'Whatever he\'s about to become, stop him before he finishes!' }]],
      mid: { 3: [['sb_kars', 'Your weapons are interesting. Show me more of them. I learn from everything.', 'menace']] },
      post: [['sb_kars', 'Impossible... the Ultimate... Life Form... cannot...'], ['>', 'He is thrown upward, through the rock, into the sky. He does not come down.']] },
    sb_kars_ult: { pre: [['>', 'The Red Stone flares. The mask\'s spikes sink in, and a light explodes out of the tomb.', 'menace'], ['sb_kars', 'I have surpassed all life! I stand in the sun, and I ADAPT to anything you throw at me!', 'shout'],
      [{ any: 'He shrugged it off... hit him with something different!' }]] },
    sb_kars_last: { pre: [['sb_kars', 'Again?! Then I will become THAT, too!', 'angry'], [{ any: 'He\'s changing again! Switch it up!' }]] },
    sb_pucci: {
      pre: [['sb_pucci', 'Do you believe in gravity? I do. I believe in fate the same way.'], ['>', 'The priest opens his hand. The shadows of the trees swing around like clock hands.', 'menace'],
        [{ l: 'He wants the Corpse... the bones! Don\'t give him anything!', h: 'A priest? You are no priest of the Vatican.', j: '(Time is speeding up. We have to end this before it runs out.)', any: 'Something is wrong with the sun. Take him down fast!' }]],
      mid: { 4: [['sb_pucci', 'Faster. And faster. Only I can keep up.', 'menace']] },
      post: [['sb_pucci', 'Heaven was... right there... Why do you stand in the way of everyone\'s happiness?'], ['>', 'The sun stops racing. It settles in the sky, exactly where it should be.']] },
    sb_pucci_cmoon: { pre: [['sb_pucci', 'C-MOON. Gravity is mine now. Your insides will fall outward.', 'menace'], [{ any: 'The ground is on the ceiling! Hang on to something!' }]] },
    sb_pucci_mih: { pre: [['>', 'The priest holds up the bones and begins to pray. Something with a horse\'s body stamps out of him.', 'menace'], ['sb_pucci', 'MADE IN HEAVEN! Time accelerates for everything but me!', 'shout'],
      [{ any: 'The days are flashing by! Hit him NOW!' }]] },
    sb_dio: {
      pre: [['sb_dio', 'Tell me. Of all the worlds, do you know how many of them have a Joestar in them? All of them.', 'menace'], ['>', 'The flag behind him flutters, and stops flapping. Everything has stopped. Then it starts again.', 'menace'],
        [{ j: '(Joestar... he\'s talking about me. I don\'t know him. Why do I hate him already?)', g: 'He\'s a vampire. Steel balls and daylight. We have plenty of both.', h: 'Undead. The Lord\'s light will burn you.', c: 'A vampire... I know the Ripple. I know exactly how to kill you.', any: 'He\'s a vampire! Holy light or the Spin, nothing else will finish him!' }]],
      mid: { 3: [['sb_dio', 'MUDA MUDA MUDA! You\'re slow! Everything in this world is slow!', 'shout']] },
      post: [['sb_dio', 'This... in a world that isn\'t even mine... to a JOESTAR...'], ['>', 'The door between the flag and the tree swings shut.']] },
    sb_dio_roller: { pre: [['sb_dio', 'ROAD ROLLER DA!', 'shout'], ['>', 'Time stops. A steamroller falls out of the sky.', 'menace']] },
    sb_dio_revive: { pre: [['sb_dio', 'Did you think a vampire dies that easily?! Only the sun gets to kill me!', 'angry'], [{ any: 'He got back up! Holy light or the Spin, it has to be that!' }]] },
    sb_kira: {
      pre: [['sb_kira', 'My name is Yoshikage Kira. I don\'t smoke. I don\'t drink. I go to bed at eleven. And you have seen my face.'], ['>', 'A little tank with a skull on it rolls out from under his seat.', 'menace'],
        [{ j: '(A Stand that turns things into bombs... don\'t let him touch us.)', g: 'He wants us to go quietly. Nyo-ho, we are never quiet.', any: 'Stay away from his hands! Anything he touches explodes!' }]],
      mid: { 3: [['sb_kira', 'Killer Queen has already touched something. Can you guess what?', 'menace'], [{ any: 'Brace! Pull the pin before it blows!' }]] },
      post: [['sb_kira', 'All I wanted... was to sleep... soundly...'], ['>', 'The train pulls into a station with no name. Nobody gets off.']] },
    sb_kira_last: { pre: [['sb_kira', 'KILLER QUEEN! BITES THE DUST! Every one of you is a bomb now!', 'shout'], [{ any: 'We\'re all primed! Brace and pull the pins!' }]] },
    sb_trex: {
      pre: [['>', 'The skull in the wall opens its eyes. So do the other hundred.', 'menace'], ['sb_trex', 'Scary Monsters... give me EVERYTHING. The whole Cretaceous!', 'shout'],
        [{ d: 'That\'s... me? I\'d never let it take me that far.', j: '(Diego... what did you do to yourself?)', t: 'That\'s one big lizard. Keep the little ones off me.', any: 'Kill the raptors or he\'ll hide behind them forever!' }]],
      mid: { 3: [['sb_trex', 'Kinetic vision. I see your heart beating. I see your hands shaking.', 'menace']] },
      post: [['sb_trex', 'The top... of the food chain... is ME...'], ['>', 'The Tyrant crumbles into a hill of fossils, and the mine goes quiet.']] },
    sb_trex_stampede: { pre: [['sb_trex', 'STAMPEDE! Every last one of you, RUN THEM DOWN!', 'shout'], ['>', 'The whole pack charges at once.', 'menace']] },
  };
  SBR.SB_TALK = TALK;

  /* ================= 11. Wrappers installed once every file has loaded ================= */
  window.addEventListener('DOMContentLoaded', () => {
    // fight talk: register the scenes, and make sure superboss fights get their pre / post even as bosses
    if (SBR.addFightTalk) Object.entries(TALK).forEach(([k, t]) => SBR.addFightTalk(k, t));
    Object.entries(SBR.EXTRA_TALK || {}).forEach(([k, t]) => { if (SBR.addFightTalk) SBR.addFightTalk(k, t); });
    const baseTalk = SBR.fightTalk;
    SBR.fightTalk = (enemies, opts = {}) => {
      const ids = (enemies || []).map(e => (typeof e === 'string' ? e : e && e.id)).filter(Boolean);
      const all = Object.assign({}, SBR.EXTRA_TALK || {}, TALK);
      const k = ids.find(id => all[id] && (all[id].pre || all[id].post));
      if (k) {
        const t = all[k], out = {};
        if (t.pre) out.pre = `ft_${k}_pre`;
        if (t.post) out.post = `ft_${k}_post`;
        if (t.mid) { out.mid = {}; Object.keys(t.mid).forEach(rd => { out.mid[rd] = `ft_${k}_m${rd}`; }); }
        return out;
      }
      return baseTalk ? baseTalk(enemies, opts) : null;
    };
    // boss music for the auras
    const baseBattle = SBR.music.themeForBattle;
    SBR.music.themeForBattle = (enemies, opts) => {
      const ids = enemies || [];
      if (ids.includes('sb_dio') || ids.includes('sb_trex')) return 'boss_diego';
      if (ids.some(id => SBR.ENEMIES[id] && SBR.ENEMIES[id].secret)) return 'boss_valentine';
      return baseBattle(enemies, opts);
    };
    // debug jumps
    if (SBR.debug) {
      const ACT = { sb_kars: 3, sb_pucci: 5, sb_dio: 6, sb_kira: 5, sb_trex: 3 };
      const AREA = { sb_kars: 'pillartomb', sb_kira: 'railyard', sb_trex: 'silvermine' };
      /** fight a superboss straight away (at its usual act unless o.act) */
      SBR.debug.superboss = (key, o = {}) => { SBR.debug.setup(Object.assign({ act: ACT[key] || 5, stage: 2 }, o)); SBR.run.risk = 5; return SBR.game._debug.fight(SUPER[key].enemies, { boss: true, bossName: SUPER[key].name }); };
      /** the stage screen with the secret card dealt (main route), or the detour's hidden deep stage */
      SBR.debug.secret = async (key, o = {}) => {
        if (AREA[key]) {
          await SBR.debug.area(AREA[key], SBR.AREAS[AREA[key]].stages, o);
          SBR.run.area.secret = key; SBR.run.area.deep = true; SBR.run.stageCards = null;
          SBR.game._debug.showStage(); return;
        }
        SBR.debug.setup(Object.assign({ act: ACT[key] || 5, stage: 2 }, o));
        const d = SBR.game._debug;
        SBR.run.stageCards = d.drawCards().concat([secretCard(key)]);
        d.showStage();
      };
    }
  });

  /* the card art for a Strange Aura, and a louder boss intro */
  (() => {
    const base = SBR.art.cardArt;
    const INK = '#1a1020';
    let n = 0;
    SBR.art.cardArt = type => {
      if (type !== 'secret') return base(type);
      const id = 'sba' + (++n);
      const rays = [...Array(16)].map((_, i) => { const a = i / 16 * Math.PI * 2; return `<path d="M100 78 L${(100 + Math.cos(a) * 190).toFixed(1)} ${(78 + Math.sin(a) * 190).toFixed(1)} L${(100 + Math.cos(a + 0.12) * 190).toFixed(1)} ${(78 + Math.sin(a + 0.12) * 190).toFixed(1)}Z" fill="#b070e0" opacity="${i % 2 ? 0.18 : 0.32}"/>`; }).join('');
      return `<svg class="card-art sb-card-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs><radialGradient id="${id}" cx="50%" cy="52%" r="60%"><stop offset="0" stop-color="#f6e0ff"/><stop offset=".35" stop-color="#8a3ad0"/><stop offset="1" stop-color="#12061e"/></radialGradient></defs>
        <rect width="200" height="150" fill="url(#${id})"/>${rays}
        <path d="M100 26 Q126 30 128 62 Q130 80 120 92 L140 150 H60 L80 92 Q70 80 72 62 Q74 30 100 26Z" fill="${INK}"/>
        <path d="M86 58 l10 4 M114 58 l-10 4" stroke="#f2c14e" stroke-width="3" stroke-linecap="round"/><circle cx="92" cy="64" r="2.4" fill="#ff5a5a"/><circle cx="108" cy="64" r="2.4" fill="#ff5a5a"/>
        <text x="100" y="140" text-anchor="middle" font-family="Bangers,Impact" font-size="30" fill="#f2c14e" stroke="${INK}" stroke-width="1.6" letter-spacing="3">? ? ?</text>
        ${['ゴ', 'ゴ', 'ゴ', 'ゴ'].map((k, i) => `<text x="${[18, 176, 22, 170][i]}" y="${[40, 50, 112, 118][i]}" font-family="'Noto Sans JP',sans-serif" font-weight="900" font-size="${[26, 22, 20, 24][i]}" fill="#d8a0ff" stroke="${INK}" stroke-width="1.2" transform="rotate(${[-12, 10, -6, 8][i]} ${[18, 176, 22, 170][i]} ${[40, 50, 112, 118][i]})">${k}</text>`).join('')}</svg>`;
    };
    // the boss intro of a Strange Aura says so, with seven stars
    const names = () => Object.values(SBR.ENEMIES).filter(e => e.secret).map(e => e.name);
    const mo = new MutationObserver(list => list.forEach(m => m.addedNodes.forEach(nd => {
      if (!nd.classList) return;
      if (nd.classList.contains('boss-intro')) {
        const nm = nd.querySelector('.bi-name');
        if (nm && names().includes(nm.textContent.trim())) { nd.classList.add('sb-intro'); const k = nd.querySelector('.bi-kicker'); if (k) k.innerHTML = '<span class="sb-stars">★★★★★★★</span> STRANGE AURA'; }
      }
    })));
    const start = () => { const ov = document.getElementById('overlay'); if (ov) mo.observe(ov, { childList: true }); };
    if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', start); else start();
    // a Strange Aura card on the table makes itself felt
    const mo2 = new MutationObserver(() => {
      const c = document.querySelector('.enc-card.secret:not(.sb-felt)');
      if (!c) return;
      c.classList.add('sb-felt');
      setTimeout(() => { if (SBR.ui && SBR.ui.menacing) SBR.ui.menacing(c, 4, 'ゴ'); if (SBR.audio) SBR.audio.play('menace'); }, 1400);
    });
    const start2 = () => { const s = document.getElementById('screen'); if (s) mo2.observe(s, { childList: true, subtree: true }); };
    if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', start2); else start2();
  })();
})();
