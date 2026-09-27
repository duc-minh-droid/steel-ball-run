/* Two travellers from other Parts of JoJo as playable lead riders: Giorno Giovanna (Part 5) and Jolyne Cujoh (Part 6).
   How they got to 1890 is kept light: an old arrowhead and a gust of golden wind for Giorno; for Jolyne, a universe that
   Made in Heaven spun once too far. Johnny and Gyro still ride with them, as with every other lead.
   Each has a base kit, a passive, three Paths (learned from trainers on the road, like the SBR leads), a Legacy tree,
   a race power, a lead ending, and an achievement-style quest that unlocks them (no Race Point purchase):
     Giorno: "Golden Wind" — finish the Steel Ball Run holding 3 or more Corpse Parts.
     Jolyne: "Stone Ocean" — win a boss battle while your lead rider is below 20% HP.
   Everything lives in this file: registries are only appended to, and systems that load later (combat, fx, standfx,
   sprint, trees, battle-ui) are hooked on DOMContentLoaded, after every script has run. */
'use strict';

/* ================= 1. Portraits ================= */
(() => {
  const A = SBR.art, K = A.INK, PT = A.PARTS;
  const SW = 2.2;
  const MIR = s => `${s}<g transform="matrix(-1 0 0 1 100 0)">${s}</g>`;
  const BODY = 'M8 120 Q12 94 50 88 Q88 94 92 120 Z';
  let n = 0;
  const shade = (hex, f = 0.72) => { const v = parseInt(hex.slice(1), 16); const c = s => Math.round(((v >> s) & 255) * f).toString(16).padStart(2, '0'); return '#' + c(16) + c(8) + c(0); };
  const curl = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${K}" stroke-width="1.9"/>`
    + `<path d="M${x - r * 0.5} ${y + r * 0.1} a${r * 0.5} ${r * 0.5} 0 1 1 ${r * 0.62} ${r * 0.42} a${r * 0.26} ${r * 0.26} 0 0 1 ${-r * 0.3} ${-r * 0.3}" fill="none" stroke="${K}" stroke-width="1.1" stroke-linecap="round"/>`
    + `<path d="M${x - r * 0.7} ${y - r * 0.35} a${r * 0.8} ${r * 0.8} 0 0 1 ${r * 0.8} ${-r * 0.45}" fill="none" stroke="#fff" stroke-width="1.1" opacity=".7" stroke-linecap="round"/>`;
  /** a braid: overlapping lobes from (x0,y0) to (x1,y1) */
  const braid = (x0, y0, x1, y1, c, nSeg = 7, w = 5) => {
    let s = '';
    for (let i = 0; i < nSeg; i++) {
      const t = (i + 0.5) / nSeg, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      const ang = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI + (i % 2 ? 28 : -28);
      s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(w * 1.05).toFixed(1)}" ry="${(w * 0.62).toFixed(1)}" transform="rotate(${ang.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${c}" stroke="${K}" stroke-width="1.5"/>`;
    }
    return s;
  };

  /* ---- Giorno: slicked-back gold hair, three curls on the forehead, a long braid; pink suit with a heart cut-out and ladybug brooches ---- */
  PT.hairStyle.gio_back = c => `<path d="M26.8 50 Q25.4 21.6 50 18.4 Q74.6 21.6 73.2 50 L72.8 61 Q67.4 57 66.4 46 L33.6 46 Q32.6 57 27.2 61Z" fill="${c}"/>`
    + `<g fill="none" stroke="${K}" stroke-width=".8" opacity=".45"><path d="M36 26 Q30 34 31 48"/><path d="M64 26 Q70 34 69 48"/><path d="M44 22.4 Q36 28 34.4 40"/><path d="M56 22.4 Q64 28 65.6 40"/></g>`;
  PT.style.gio_suit = (p, id) => ({
    u: `<path d="${BODY}" fill="${p.outfit}"/>`
      + `<clipPath id="${id}gs"><path d="${BODY}"/></clipPath><g clip-path="url(#${id}gs)">`
      + `<path d="M8 120 Q12 104 20 100 L26 120Z M92 120 Q88 104 80 100 L74 120Z" fill="${shade(p.outfit, 0.82)}" stroke="none"/>`
      + MIR(`<path d="M42.4 88.6 L26 95 Q30 104 38 110 L44.6 106 L41 100 L47.4 97Z" fill="${p.outfit2}" stroke-width="1.6"/>`)
      + `<path d="M43 89 L50 97 L57 89Z" fill="${p.skin}" stroke-width="1.4"/>`
      + `<path d="M50 104 C47.6 99.6 41 100.2 41 105 C41 109 45.6 112.4 50 116.2 C54.4 112.4 59 109 59 105 C59 100.2 52.4 99.6 50 104Z" fill="${p.skin}" stroke-width="1.8"/>`
      + `<path d="M46 107 Q48 110 50 111" fill="none" stroke="${K}" stroke-width=".7" opacity=".5"/>`
      + `<path d="M50 97 V101.6 M50 116.2 V120" stroke-width="1.2"/>`
      + `</g>`,
    o: MIR(`<path d="M41.2 80.4 L36.6 92.6 Q41.4 91 45.6 87 L44 82Z" fill="${p.outfit}" stroke-width="1.6"/>`),
  });
  PT.acc.gio_braid = { body: p => braid(66, 76, 79, 116, p.hair, 7, 4.6) + `<path d="M76.4 113.6 l6 5.4" stroke="${K}" stroke-width="3.6" stroke-linecap="round"/><path d="M76.4 113.6 l6 5.4" stroke="#c8323c" stroke-width="1.8" stroke-linecap="round"/>` };
  PT.acc.gio_bugs = { body: () => [[34.6, 100.4, -18], [65.4, 100.4, 18]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse cx="0" cy="-3.6" rx="2.1" ry="1.7" fill="${K}"/><ellipse cx="0" cy=".6" rx="3.6" ry="4.2" fill="#d8303c" stroke="${K}" stroke-width="1.2"/><path d="M0 -3 V4.8" stroke="${K}" stroke-width=".9"/><circle cx="-1.6" cy="-.4" r=".75" fill="${K}"/><circle cx="1.6" cy="-.4" r=".75" fill="${K}"/><circle cx="-1.8" cy="2.4" r=".75" fill="${K}"/><circle cx="1.8" cy="2.4" r=".75" fill="${K}"/><ellipse cx="-1.4" cy="-1.6" rx=".8" ry=".45" fill="#fff" opacity=".7"/></g>`).join('') };
  PT.acc.gio_curls = { top: p => `<path d="M31 47 Q30.4 30 42 26.6 Q50 25 58 26.6 Q69.6 30 69 47 Q67.4 40 61 38 Q50 35 39 38 Q32.6 40 31 47Z" fill="${p.hair}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>`
    + `<path d="M34 42 Q36 36 42 34 M66 42 Q64 36 58 34" fill="none" stroke="${K}" stroke-width=".8" opacity=".5"/>`
    + curl(39.4, 36.4, 5.4, p.hair) + curl(60.6, 36.4, 5.4, p.hair) + curl(50, 34.2, 6, p.hair) };

  /* ---- Jolyne: dark hair dyed green, two buns and a braid; spider-web top; the Joestar star; a butterfly tattoo ---- */
  PT.hairStyle.jol_back = (c, p) => `<path d="M28.6 52 Q26.6 24 50 20.6 Q73.4 24 71.4 52 L72.4 64 Q67.4 62 66.4 52 L33.6 52 Q32.6 62 27.6 64Z" fill="${c}"/>`
    + [[37.4, 21.4], [62.6, 21.4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7.8" fill="${c}"/><path d="M${x - 5.4} ${y + 1} Q${x - 3} ${y - 5.6} ${x + 3} ${y - 5} M${x - 3} ${y + 4.4} Q${x + 2} ${y + 3} ${x + 5} ${y - 2}" fill="none" stroke="${(p && p.hair2) || '#6ad08a'}" stroke-width="1.6" stroke-linecap="round"/><path d="M${x - 4} ${y - 1} Q${x} ${y - 4} ${x + 4} ${y - 1}" fill="none" stroke="${K}" stroke-width=".7" opacity=".6"/>`).join('');
  PT.style.jol_web = (p, id) => {
    const cx = 50, cy = 124, spokes = [...Array(11)].map((_, i) => { const a = Math.PI + (i + 0.5) * Math.PI / 11; return `M${cx} ${cy}L${(cx + Math.cos(a) * 60).toFixed(1)} ${(cy + Math.sin(a) * 60).toFixed(1)}`; }).join('');
    const rings = [10, 18, 27, 37].map(r => { let d = ''; for (let i = 0; i <= 11; i++) { const a = Math.PI + i * Math.PI / 11, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; d += i ? `Q${(cx + Math.cos(a - Math.PI / 22) * r * 0.86).toFixed(1)} ${(cy + Math.sin(a - Math.PI / 22) * r * 0.86).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}` : `M${x.toFixed(1)} ${y.toFixed(1)}`; } return d; }).join('');
    return {
      u: `<path d="${BODY}" fill="${p.outfit}"/><clipPath id="${id}jw"><path d="${BODY}"/></clipPath><g clip-path="url(#${id}jw)">`
        + `<path d="M8 120 Q12 104 20 100 L26 120Z M92 120 Q88 104 80 100 L74 120Z" fill="${shade(p.outfit, 0.8)}" stroke="none"/>`
        + `<path d="${spokes}${rings}" fill="none" stroke="${p.outfit2}" stroke-width="1" opacity=".85"/>`
        + `<path d="M39 88.4 Q50 103 61 88.4Z" fill="${p.skin}" stroke-width="1.6"/>`
        + [[29, 106, 3.4, 2.4], [71, 104, 3, 2.2], [40, 115, 2.4, 1.8]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${p.skin}" stroke-width="1.3"/>`).join('')
        + MIR(`<path d="M22 97 L30 94" stroke="#f2c14e" stroke-width="2.2"/>`) + `</g>`,
    };
  };
  PT.acc.jol_braid = { body: p => braid(33, 72, 20, 116, p.hair, 8, 5.2) + `<path d="M18.8 113.6 q-3 4 -1 7 M21 114 q0 4 2 6" fill="none" stroke="${p.hair2 || '#6ad08a'}" stroke-width="2.4" stroke-linecap="round"/><path d="M20.4 110.6 l3.6 2" stroke="#f2c14e" stroke-width="2.4"/>` };
  PT.acc.jol_tattoo = { body: () => `<g transform="translate(82 106) rotate(-12)"><path d="M0 0 Q-6 -8 -8 -3 Q-9 2 0 1 Q-7 4 -5 8 Q-2 9 0 2 Q2 9 5 8 Q7 4 0 1 Q9 2 8 -3 Q6 -8 0 0Z" fill="#6a4ab0" stroke="${K}" stroke-width="1.1" stroke-linejoin="round"/><path d="M0 -1 V4 M0 -1 l-1.6 -2.6 M0 -1 l1.6 -2.6" stroke="${K}" stroke-width=".9" fill="none"/><circle cx="-4.4" cy="-2.6" r=".9" fill="#f6ecd8"/><circle cx="4.4" cy="-2.6" r=".9" fill="#f6ecd8"/></g>` };
  PT.acc.jol_bangs = { top: p => `<path d="M30.6 48 Q29.4 29 50 25.6 Q70.6 29 69.4 48 L66.4 41 L64 47 L61.4 37.4 Q56 34.4 52 35.4 L50 31 L48 35.4 Q44 34.4 38.6 37.4 L36 47 L33.6 41Z" fill="${p.hair}" stroke="${K}" stroke-width="${SW}" stroke-linejoin="round"/>`
    + MIR(`<path d="M31.4 44 Q29 56 32.2 68 L34 62 L34.6 50Z" fill="${p.hair}" stroke="${K}" stroke-width="1.6" stroke-linejoin="round"/>`)
    + `<path d="M40 30 Q46 27.4 50 27.6 M56 29.4 Q62 31 66 36" fill="none" stroke="${p.hair2 || '#6ad08a'}" stroke-width="1.8" stroke-linecap="round" opacity=".9"/>` };

  A.addPortrait({
    giorno: { skin: '#f8dcc4', hair: '#f6cf4a', hairStyle: 'gio_back', hat: null, outfit: '#e0609e', outfit2: '#b83a7a', eye: '#3aa0c8', lip: '#d86a8a', bg: ['#e0609e', '#f2c14e'], eyes: 'sharp', brows: 'thin', style: 'gio_suit', acc: ['gio_braid', 'gio_bugs', 'gio_curls'] },
    jolyne: { skin: '#f6d6c0', hair: '#2e5444', hair2: '#6ad08a', hairStyle: 'jol_back', hat: null, outfit: '#3aa86a', outfit2: '#16301f', eye: '#3a8a6a', lip: '#c8507a', bg: ['#3aa86a', '#4a7ad0'], eyes: 'sharp', brows: 'angry', style: 'jol_web', marks: ['star'], acc: ['jol_braid', 'jol_tattoo', 'jol_bangs'] },
    // Path trainers met on the road
    padrone:      { skin: '#e8c0a0', hair: '#2a1a1a', hairStyle: 'slicked', hat: 'bowler', hatColor: '#2a2a2a', hat2: '#c8323c', outfit: '#2a2a3a', outfit2: '#f6ecd8', eye: '#3a2a1a', lip: '#9a5a5a', bg: ['#c8323c', '#2a2a3a'], facial: 'handlebar', brows: 'thick' },
    orchard:      { skin: '#f0d0b8', hair: '#e8e8e8', hairStyle: 'bob', hat: 'bonnet', hatColor: '#e8d8a0', hat2: '#6ac85a', outfit: '#6a8a3a', outfit2: '#f6ecd8', eye: '#5a7a3a', lip: '#b07070', bg: ['#6ac85a', '#f2c14e'], eyes: 'round', acc: ['flower'] },
    stargazer:    { skin: '#e8c8a8', hair: '#d8d8e8', hairStyle: 'long', hat: 'tophat', hatColor: '#2a2a4a', hat2: '#b070e0', outfit: '#2a2a4a', outfit2: '#b070e0', eye: '#8a6ad0', lip: '#8a6a7a', bg: ['#1a1030', '#b070e0'], facial: 'fullbeard', acc: ['glasses'] },
    linewoman:    { skin: '#e0b890', hair: '#8a4a2a', hairStyle: 'ponytail', hat: 'cowboy', hatColor: '#8a6a4a', hat2: '#4a7ad0', outfit: '#4a6a8a', outfit2: '#e8d8b0', eye: '#3a5a7a', lip: '#b06060', bg: ['#4a7ad0', '#e8d8b0'], marks: ['freckles'] },
    warden:       { skin: '#e0b088', hair: '#6a6a6a', hairStyle: 'short', hat: 'peaked', hatColor: '#3a3a4a', hat2: '#c0a040', outfit: '#3a3a4a', outfit2: '#c0a040', eye: '#3a3a3a', lip: '#8a5a4a', bg: ['#3a3a4a', '#e8e0c0'], facial: 'mustache', brows: 'angry', acc: ['badge'] },
    prizefighter: { skin: '#f0c8a8', hair: '#c8323c', hairStyle: 'bob', hat: null, outfit: '#f6ecd8', outfit2: '#c8323c', eye: '#3a6a3a', lip: '#c8406a', bg: ['#c8323c', '#f2c14e'], brows: 'angry', mouth: 'gritted', acc: ['bandage'] },
  });
})();

/* ================= 2. The riders ================= */
SBR.CHARS.giorno = {
  name: 'Giorno Giovanna', short: 'Giorno', stand: 'Gold Experience', title: 'The Gang-Star from Naples', portrait: 'giorno', color: '#f2b83a', aggro: 0.95,
  hp: 32, stats: { spin: 5, aim: 3, grit: 3, ride: 4, res: 6, luck: 3 }, growth: { res: 2, spin: 2, grit: 1, luck: 1 },
  abilities: [{ id: 'gio_punch' }, { id: 'gio_muda' }, { id: 'gio_frog' }, { id: 'gio_organ' }, { id: 'gio_dream', level: 4 }],
  passive: { name: 'Golden Wind', desc: 'Healing he does is increased by 15%. At the start of every battle, every ally gains Regen 2.' },
  bio: 'A fifteen-year-old from Naples with a dream of becoming a Gang-Star. An old arrowhead, a gust of golden wind, and he woke up on San Diego beach in 1890. He entered the race because fifty million dollars is a very good start for a dream.',
};
SBR.CHARS.jolyne = {
  name: 'Jolyne Cujoh', short: 'Jolyne', stand: 'Stone Free', title: 'The Girl Who Broke Out of Green Dolphin Street', portrait: 'jolyne', color: '#3aa870', aggro: 1.2,
  hp: 36, stats: { spin: 3, aim: 5, grit: 5, ride: 4, res: 4, luck: 2 }, growth: { aim: 2, grit: 2, spin: 1, res: 1 },
  abilities: [{ id: 'jol_string' }, { id: 'jol_ora' }, { id: 'jol_unravel' }, { id: 'jol_net' }, { id: 'jol_yare', level: 4 }],
  passive: { name: 'Kujo Tenacity', desc: 'The more she is hurt, the harder she hits: up to +30% damage at 25% HP or less, and below 25% HP she takes 15% less damage.' },
  bio: 'Jotaro Kujo\'s daughter, framed and jailed, who broke out of the hardest prison in Florida. When the universe was spun around once too many times she came out the other side on a beach in 1890, still in her prison clothes. Good grief.',
};
if (!SBR.LEADS.includes('giorno')) SBR.LEADS.push('giorno');
if (!SBR.LEADS.includes('jolyne')) SBR.LEADS.push('jolyne');
// Giorno's healing bonus rides with him like gear
(() => {
  const base = SBR.equipBonus;
  SBR.equipBonus = m => { const o = base(m); if (m && m.id === 'giorno') o.bonus.heal = (o.bonus.heal || 0) + 0.15; return o; };
})();

/* ================= 3. Statuses ================= */
Object.assign(SBR.STATUS, {
  zero: { name: 'Return to Zero', glyph: '零', color: '#f6e08a', kind: 'buff', mode: 'turns', desc: () => 'The next enemy attack on this unit returns to zero: its damage never lands, and neither do the debuffs that come with it.' },
  endless: { name: 'Endless Death', glyph: '∞', color: '#b070e0', kind: 'debuff', mode: 'turns', desc: () => 'Caught by Gold Experience Requiem. Loses 6% of max HP every turn (3% for bosses), and 30% of its turns never reach the truth (20% for bosses).' },
});

/* ================= 4. Abilities ================= */
(() => {
  const A = SBR.ABILITIES;
  const lv = (x, a, b) => (x.lvl > 1 ? b : a);
  const pct = t => t.hp / t.maxHp;
  const stripBuff = (x, t) => { const s = t.statuses.find(q => SBR.STATUS[q.id] && SBR.STATUS[q.id].kind === 'buff' && !SBR.STATUS[q.id].permanent); if (s) { x.removeStatus(t, s.id); x.c.push({ t: 'float', uid: t.uid, text: 'ZERO', cls: 'debuff' }); } return !!s; };
  const rush = (x, n, base, scale, o = {}) => { for (let i = 0; i < n; i++) { if (!x.target || x.target.dead) break; const last = i === n - 1; x.dmg(x.target, base, scale, Object.assign({}, o.each || {}, last && o.last ? o.last : {}, { label: i === 0 ? o.first : last ? o.finish : undefined })); } };
  Object.assign(A, {
    /* ---- Giorno ---- */
    gio_punch: { name: 'Gold Experience', cost: 0, cd: 0, target: 'enemy', tags: ['stand'], fx: 'hit',
      desc: l => `A Stand punch that pours in more life than the body can hold. ${l > 1 ? 40 : 25}% chance of Sense Overload: Blinded 1.`,
      run(x) { const r = x.dmg(x.target, 5, { spin: 0.045 }); if (r.hit && x.roll(x.lvl > 1 ? 0.4 : 0.25)) x.status(x.target, 'blind', 0, 1); } },
    gio_muda: { name: 'MUDA MUDA MUDA', cost: 1, cd: 1, target: 'enemy', tags: ['stand'], fx: 'hit',
      desc: l => `"MUDA MUDA MUDA!" ${l > 1 ? 4 : 3} rapid hits of 3, scales with SPIN.`,
      run(x) { rush(x, lv(x, 3, 4), 3, { spin: 0.035 }, { first: 'MUDA' }); } },
    gio_frog: { name: 'Life Giver: Frog', cost: 1, cd: 3, target: 'ally', tags: ['stand'], fx: 'heal',
      desc: l => `A pebble at an ally's feet becomes a frog. Whatever hits them bounces back: Mirror Grid (40% of damage returned) for 2 turns${l > 1 ? ', and Regen 2' : ''}.`,
      run(x) { x.status(x.target, 'reflect', 0, 2); if (x.lvl > 1) x.status(x.target, 'regen', 0, 2); } },
    gio_organ: { name: 'Life Giver: Flesh', cost: 2, cd: 2, target: 'ally', tags: ['stand', 'heal'], fx: 'heal',
      desc: l => `A button becomes new flesh, a shoelace a vein. Heal an ally (RESOLVE) and remove ${l > 1 ? 2 : 1} debuff.`,
      run(x) { x.heal(x.target, 10, { res: 0.06, spin: 0.02 }); x.cleanse(x.target, lv(x, 1, 2)); } },
    gio_dream: { name: 'I Have a Dream', cost: 2, cd: 5, target: 'allAllies', tags: [], fx: 'buff',
      desc: l => `"I, Giorno Giovanna, have a dream." Every ally gains Empowered 2 and +1 Energy${l > 1 ? ', and Rider\'s Calm 2' : ''}.`,
      run(x) { x.say(x.user, 'I, Giorno Giovanna, have a dream.'); x.allies.filter(a => !a.summon).forEach(a => { x.status(a, 'empower', 0, 2); if (a !== x.user) x.energy(a, 1); if (x.lvl > 1) x.status(a, 'calm', 0, 2); }); } },
    // Gang-Star
    gs_fly: { name: 'Bullet to Life', cost: 1, cd: 3, target: 'self', tags: ['stand'], fx: 'buff',
      desc: l => `Gold Experience touches the bullet in flight and it becomes a fly that goes home to its shooter. Mirror Grid 2 and Evasive ${l > 1 ? 2 : 1}.`,
      run(x) { x.status(x.user, 'reflect', 0, 2); x.status(x.user, 'evasive', 0, lv(x, 1, 2)); } },
    gs_passione: { name: 'Passione\'s Oath', cost: 2, cd: 4, target: 'allAllies', tags: [], fx: 'buff',
      desc: l => `The gang closes ranks around its boss. Every ally gains Lucky 2 and Guard ${l > 1 ? 2 : 1}; Giorno gains Empowered 2.`,
      run(x) { x.allies.forEach(a => { x.status(a, 'lucky', 0, 2); x.status(a, 'guard', 0, lv(x, 1, 2)); }); x.status(x.user, 'empower', 0, 2); } },
    gs_finisher: { name: 'MUDA MUDA MUDAAA!', cost: 3, cd: 4, target: 'enemy', tags: ['stand'], fx: 'hit',
      desc: l => `The full barrage. ${l > 1 ? 7 : 6} hits of 3 (SPIN) that cannot be dodged; the last one always crits.`,
      run(x) { x.say(x.user, 'MUDA MUDA MUDA MUDA MUDAAA!'); rush(x, lv(x, 6, 7), 3, { spin: 0.035 }, { each: { noDodge: true }, last: { forceCrit: true }, first: 'MUDA', finish: 'MUDAAA!' }); } },
    // Life Giver
    lg_tree: { name: 'Sprouting Tree', cost: 1, cd: 2, target: 'enemy', tags: ['stand'], fx: 'hit',
      desc: l => `A seed in the dirt becomes a tree under their feet. 6 base (RESOLVE, SPIN), and the roots hold them: Hooked ${l > 1 ? 2 : 1}.`,
      run(x) { const r = x.dmg(x.target, 6, { res: 0.04, spin: 0.02 }); if (r.hit) x.status(x.target, 'hooked', 0, lv(x, 1, 2)); } },
    lg_frogs: { name: 'Frog Guardians', cost: 2, cd: 4, target: 'none', tags: ['stand'], fx: 'buff', summon: 'ge_frog',
      desc: l => `Two pebbles become frogs (12 HP, ${l > 1 ? 4 : 3} rounds). They Taunt, anything that hits a frog takes 40% of it back, and each round they spit at an enemy.`,
      run(x) { x.summonAlly('ge_frog', { life: lv(x, 3, 4) }); x.summonAlly('ge_frog', { life: lv(x, 3, 4) }); } },
    lg_transplant: { name: 'Organ Transplant', cost: 3, cd: 5, target: 'ally', tags: ['stand', 'heal'], fx: 'heal',
      desc: l => `Gold Experience makes new organs and puts them where the old ones were. Heal ${l > 1 ? 16 : 12} (RESOLVE) plus 20% of max HP, remove every debuff and give an 8 Shield.`,
      run(x) { x.heal(x.target, lv(x, 12, 16) + Math.round(x.target.maxHp * 0.2), { res: 0.05 }); x.cleanse(x.target, 9); x.status(x.target, 'shield', 8); } },
    // Requiem
    rq_rush: { name: 'Requiem Barrage', cost: 1, cd: 1, target: 'enemy', tags: ['stand'], fx: 'hit',
      desc: l => `${l > 1 ? 4 : 3} hits of 3 (SPIN). Whatever strength the target had returns to zero: it loses 1 buff.`,
      run(x) { rush(x, lv(x, 3, 4), 3, { spin: 0.04 }, { first: 'MUDA' }); if (x.target && !x.target.dead) stripBuff(x, x.target); } },
    rq_zero: { name: 'Return to Zero', cost: 2, cd: 4, target: 'ally', tags: ['stand'], fx: 'buff',
      desc: l => `The next enemy attack on this ally never reaches them: its damage and its debuffs return to zero. Lasts ${l > 1 ? 3 : 2} turns.`,
      run(x) { x.status(x.target, 'zero', 0, lv(x, 2, 3)); } },
    rq_ger: { name: 'Gold Experience Requiem', cost: 3, cd: 99, target: 'enemy', tags: ['stand'], fx: 'hit', dtype: 'true', pierce: true,
      desc: l => `The Arrow pierces the Stand. Once per battle: ${l > 1 ? 20 : 16} True damage that pierces, and the target is caught in Endless Death for 3 turns (6% max HP a turn, 3% for bosses; 30% of its turns never reach the truth, 20% for bosses). Every ally gains Return to Zero.`,
      run(x) { x.say(x.user, 'This is... Requiem.'); x.dmg(x.target, lv(x, 16, 20), { spin: 0.04 }, { noDodge: true, label: 'REQUIEM' }); if (x.target && !x.target.dead) x.status(x.target, 'endless', 0, 3); x.allies.filter(a => !a.summon).forEach(a => x.status(a, 'zero', 0, 2)); } },

    /* ---- Jolyne ---- */
    jol_string: { name: 'String Lash', cost: 0, cd: 0, target: 'enemy', tags: ['stand'], fx: 'rope',
      desc: l => `A whip of unravelled string. ${l > 1 ? 45 : 25}% chance to Hook them (no natural Energy) for 1 turn.`,
      run(x) { const r = x.dmg(x.target, 4, { aim: 0.045 }); if (r.hit && x.roll(x.lvl > 1 ? 0.45 : 0.25)) x.status(x.target, 'hooked', 0, 1); } },
    jol_ora: { name: 'ORA ORA', cost: 1, cd: 1, target: 'enemy', tags: ['stand'], fx: 'hit',
      desc: l => `"ORA ORA ORA!" ${l > 1 ? 4 : 3} rapid hits of 3, scales with SPIN and AIM.`,
      run(x) { rush(x, lv(x, 3, 4), 3, { spin: 0.025, aim: 0.015 }, { first: 'ORA' }); } },
    jol_unravel: { name: 'Unravel', cost: 1, cd: 3, target: 'self', tags: ['stand'], fx: 'buff',
      desc: l => `Jolyne comes apart into string and the blow goes straight through. Evasive 2 and a ${l > 1 ? 10 : 6} Shield.`,
      run(x) { x.status(x.user, 'evasive', 0, 2); x.status(x.user, 'shield', lv(x, 6, 10)); } },
    jol_net: { name: 'String Net', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], fx: 'rope',
      desc: l => `A net of string. 5 base (AIM) and Hooked 2${l > 1 ? ', plus Weakened 1' : ''}.`,
      run(x) { const r = x.dmg(x.target, 5, { aim: 0.04 }); if (r.hit) { x.status(x.target, 'hooked', 0, 2); if (x.lvl > 1) x.status(x.target, 'weak', 0, 1); } } },
    jol_yare: { name: 'Yare Yare Dawa', cost: 1, cd: 4, target: 'self', tags: [], fx: 'buff',
      desc: l => `"Good grief." Remove every debuff, heal ${l > 1 ? 12 : 8} (RESOLVE) and gain Rider's Calm 2.`,
      run(x) { x.say(x.user, 'Yare yare dawa.'); x.cleanse(x.user, 9); x.heal(x.user, lv(x, 8, 12), { res: 0.05 }); x.status(x.user, 'calm', 0, 2); } },
    // Stone Free
    sf_radar: { name: 'String Radar', cost: 1, cd: 3, target: 'allEnemies', tags: ['stand'], fx: 'scan',
      desc: l => `A web of string across the ground feels every step. Every enemy is Scanned for 2 turns; Jolyne gains Evasive ${l > 1 ? 2 : 1}.`,
      run(x) { x.enemies.forEach(e => x.status(e, 'marked', 0, 2)); x.status(x.user, 'evasive', 0, lv(x, 1, 2)); } },
    sf_stitch: { name: 'String Stitches', cost: 1, cd: 2, target: 'ally', tags: ['stand', 'heal'], fx: 'heal',
      desc: l => `Jolyne sews the wound shut with her own string. Heal 7 (RESOLVE), stop the Bleeding and give Regen ${l > 1 ? 3 : 2}.`,
      run(x) { x.heal(x.target, 7, { res: 0.05, aim: 0.02 }); if (x.has(x.target, 'bleed')) x.removeStatus(x.target, 'bleed'); x.status(x.target, 'regen', 0, lv(x, 2, 3)); } },
    sf_mobius: { name: 'Möbius Strip', cost: 3, cd: 4, target: 'enemy', tags: ['stand'], fx: 'hit',
      desc: l => `A loop of string that turns inside out and comes back from the other side. ${l > 1 ? 15 : 12} base that cannot be dodged, ×2.5 against a Hooked target. Jolyne gains Evasive 2.`,
      run(x) { const h = x.has(x.target, 'hooked'); x.dmg(x.target, lv(x, 12, 15) * (h ? 2.5 : 1), { spin: 0.04, aim: 0.03 }, { noDodge: true, label: h ? 'MÖBIUS!' : undefined }); x.status(x.user, 'evasive', 0, 2); } },
    // Green Dolphin Street
    gd_whip: { name: 'String Whip', cost: 1, cd: 1, target: 'enemy', tags: [], dtype: 'stand', fx: 'rope',
      desc: l => `6 base (AIM). The string rips away 1 buff from the target${l > 1 ? ' and Exposes it for 1 turn' : ''}.`,
      run(x) { const r = x.dmg(x.target, 6, { aim: 0.05 }); if (r.hit && !x.target.dead) { stripBuff(x, x.target); if (x.lvl > 1) x.status(x.target, 'vuln', 0, 1); } } },
    gd_trap: { name: 'Tripwire', cost: 2, cd: 3, target: 'allEnemies', tags: ['stand'], fx: 'rope',
      desc: l => `String strung across the prison yard. Every enemy takes 4 base and is Hooked 1, with a ${l > 1 ? 40 : 30}% chance each to be tripped (Spun).`,
      run(x) { x.enemies.forEach(e => { const r = x.dmg(e, 4, { aim: 0.03 }); if (r.hit && !e.dead) { x.status(e, 'hooked', 0, 1); if (x.roll(x.lvl > 1 ? 0.4 : 0.3)) x.status(e, 'stun', 0, 1); } }); } },
    gd_break: { name: 'Jailbreak', cost: 2, cd: 5, target: 'allAllies', tags: [], fx: 'buff',
      desc: l => `"Everyone out!" Every ally loses all debuffs, gains Evasive 2 and +1 Energy${l > 1 ? '; every enemy is Exposed 1' : ''}.`,
      run(x) { x.say(x.user, 'Everyone out. Now!'); x.allies.filter(a => !a.summon).forEach(a => { x.cleanse(a, 9); x.status(a, 'evasive', 0, 2); if (a !== x.user) x.energy(a, 1); }); if (x.lvl > 1) x.enemies.forEach(e => x.status(e, 'vuln', 0, 1)); } },
    // Stone Ocean
    so_barrier: { name: 'String Barrier', cost: 1, cd: 3, target: 'allAllies', tags: ['stand'], fx: 'buff',
      desc: l => `A web strung across the front of the party. Every ally gains Guard 2 and a ${l > 1 ? 8 : 5} Shield.`,
      run(x) { x.allies.forEach(a => { x.status(a, 'guard', 0, 2); x.status(a, 'shield', lv(x, 5, 8)); }); } },
    so_resolve: { name: 'Kujo Resolve', cost: 1, cd: 4, target: 'self', tags: [], fx: 'buff',
      desc: l => `Jolyne plants her feet and dares them. Taunt 2, Empowered 2 and Braced Leather ${l > 1 ? 3 : 2}; below half HP she also gains +1 Energy.`,
      run(x) { x.status(x.user, 'taunt', 0, 2); x.status(x.user, 'empower', 0, 2); x.status(x.user, 'armored', 0, lv(x, 2, 3)); if (pct(x.user) < 0.5) x.energy(x.user, 1); } },
    so_oraora: { name: 'ORA ORA ORAAA!', cost: 3, cd: 4, target: 'enemy', tags: ['stand'], fx: 'hit',
      desc: l => `The whole rush, and it gets harder the more she bleeds: 5 hits of 3 (SPIN, AIM), +1 hit for every 20% HP she is missing${l > 1 ? '; the last hit Exposes the target' : ''}.`,
      run(x) { const n = 5 + Math.min(4, Math.floor((1 - pct(x.user)) / 0.2)); x.say(x.user, 'ORA ORA ORA ORA ORAAA!'); rush(x, n, 3, { spin: 0.03, aim: 0.015 }, { first: 'ORA', finish: 'ORAAA!' }); if (x.lvl > 1 && x.target && !x.target.dead) x.status(x.target, 'vuln', 0, 2); } },
  });

  /* Gold Experience's frogs (summons.js loads after this file) */
  const addFrog = () => { if (!SBR.SUMMONS || SBR.SUMMONS.ge_frog) return;
  SBR.SUMMONS.ge_frog = { name: 'Gold Experience Frog', short: 'Frog', color: '#6ac85a', kana: 'ゲロゲロ', hp: 12, aggro: 1.3, dodge: 0.1, block: 0.1, life: 3, max: 2, taunt: 2, res: { stand: -0.2 },
    move: 'Spit', fx: 'spray', target: 'enemy', pick: 'random', dtype: 'phys',
    desc: 'A pebble given life. It Taunts, and whatever hits it takes 40% of the damage back. Each round it spits at an enemy.',
    onSummon(x) { x.status(x.user, 'reflect', 0, 99); },
    act(x) { x.dmg(x.target, 3, { res: 0.02 }); } };
  const baseArt = SBR.summonArt;
  const frogArt = () => `<svg class="portrait summon-art" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="gefrogbg" cx="50%" cy="58%" r="70%"><stop offset="0" stop-color="#e8f8a0"/><stop offset="1" stop-color="#3a8a3a"/></radialGradient></defs><rect width="100" height="120" fill="url(#gefrogbg)"/>`
    + `<g stroke="#1a1020" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="104" rx="36" ry="7" fill="#1a1020" opacity=".3" stroke="none"/>`
    + `<path d="M16 100 Q14 84 28 86 L34 96 Z M84 100 Q86 84 72 86 L66 96 Z" fill="#4aa84a"/>`
    + `<path d="M22 88 Q20 58 50 56 Q80 58 78 88 Q76 102 50 102 Q24 102 22 88Z" fill="#6ac85a"/><path d="M30 92 Q50 100 70 92 Q64 98 50 98 Q36 98 30 92Z" fill="#e8f0a0" stroke-width="1.6"/>`
    + `<circle cx="34" cy="54" r="11" fill="#6ac85a"/><circle cx="66" cy="54" r="11" fill="#6ac85a"/><circle cx="34" cy="53" r="6.4" fill="#fff"/><circle cx="66" cy="53" r="6.4" fill="#fff"/><circle cx="35" cy="54" r="3" fill="#1a1020"/><circle cx="65" cy="54" r="3" fill="#1a1020"/>`
    + `<path d="M36 74 Q50 82 64 74" fill="none" stroke-width="2"/><circle cx="44" cy="68" r="1.4" fill="#1a1020"/><circle cx="56" cy="68" r="1.4" fill="#1a1020"/>`
    + `<g transform="translate(70 30)"><ellipse cx="0" cy="-4" rx="2.4" ry="2" fill="#1a1020"/><ellipse cx="0" cy="1" rx="4.4" ry="5" fill="#d8303c" stroke-width="1.4"/><path d="M0 -3 V6" stroke-width="1"/><circle cx="-2" cy="0" r=".9" fill="#1a1020" stroke="none"/><circle cx="2" cy="2.6" r=".9" fill="#1a1020" stroke="none"/></g>`
    + `<path d="M14 28 l4 3 M20 20 l2 5 M86 44 l-5 2" stroke="#f2c14e" stroke-width="2.2"/></g>`
    + `<text x="50" y="24" font-size="15" text-anchor="middle" font-family="'Zen Antique','Noto Sans JP',sans-serif" font-weight="900" fill="#f2c14e" stroke="#1a1020" stroke-width="2.4" paint-order="stroke">ゲロ</text></svg>`;
  SBR.summonArt = Object.assign(key => (key === 'ge_frog' ? frogArt() : baseArt(key)), { has: key => key === 'ge_frog' || (baseArt.has && baseArt.has(key)) });
  };
  if (SBR.SUMMONS) addFrog(); else window.addEventListener('DOMContentLoaded', addFrog);
})();

/* ================= 5. Paths ================= */
(() => {
  const P = SBR.PATHS;
  const ab = ids => ids.map((id, i) => ({ id, level: [1, 3, 5][i] }));
  Object.assign(P, {
    gangstar:     { char: 'giorno', name: 'Gang-Star', color: '#e8508a', acts: [1, 2, 3], stats: { spin: 2, luck: 1 }, bonus: { standDmg: 0.1, crit: 0.03 }, res: { bullet: -0.1 },
      passive: '+2 SPIN, +1 LUCK, +10% Stand damage, +3% crit. -10% Gunshot damage taken.', desc: 'A dream needs a gang. The boss of Passione leads from the front, and his men would follow him anywhere.',
      abilities: ab(['gs_fly', 'gs_passione', 'gs_finisher']) },
    lifegiver:    { char: 'giorno', name: 'Life Giver', color: '#5ab85a', acts: [2, 3, 4], stats: { res: 3 }, bonus: { heal: 0.2, regen: 1 }, res: { bleed: -0.15 },
      passive: '+3 RESOLVE, +20% healing, regen 1 per turn. -15% Bleed damage taken.', desc: 'Gold Experience gives life. Trees from seeds, frogs from pebbles, new organs from buttons and shoelaces.',
      abilities: ab(['lg_tree', 'lg_frogs', 'lg_transplant']) },
    requiem:      { char: 'giorno', name: 'Requiem', color: '#c8a0f0', acts: [4, 5, 6], stats: { spin: 2, res: 1 }, bonus: { dmg: 0.05 }, res: { stand: -0.15 },
      passive: '+2 SPIN, +1 RESOLVE, +5% damage. -15% Stand damage taken.', desc: 'The Arrow pierces the Stand itself. What comes out can return anything to zero, even an action that already happened.',
      abilities: ab(['rq_rush', 'rq_zero', 'rq_ger']) },
    stonefree:    { char: 'jolyne', name: 'Stone Free', color: '#4a7ad0', acts: [1, 2, 3], stats: { aim: 2, ride: 1 }, bonus: { dodge: 0.06 }, res: { phys: -0.1 },
      passive: '+2 AIM, +1 RIDING, +6% dodge. -10% Physical damage taken.', desc: 'Her body comes apart into string. The string can catch, bind, sew and listen.',
      abilities: ab(['sf_radar', 'sf_stitch', 'sf_mobius']) },
    greendolphin: { char: 'jolyne', name: 'Green Dolphin Street', color: '#3a9a6a', acts: [2, 3, 4], stats: { aim: 2, luck: 2 }, bonus: { crit: 0.04, init: 2 }, res: { bullet: -0.1 },
      passive: '+2 AIM, +2 LUCK, +4% crit, +2 initiative. -10% Gunshot damage taken.', desc: 'Everything she learned breaking out of prison: tripwires, stolen keys, and never waiting for permission.',
      abilities: ab(['gd_whip', 'gd_trap', 'gd_break']) },
    stoneocean:   { char: 'jolyne', name: 'Stone Ocean', color: '#2a6aaa', acts: [4, 5, 6], stats: { grit: 3, spin: 1 }, bonus: { maxHp: 10, block: 0.06 }, res: { stand: -0.1 },
      passive: '+3 GRIT, +1 SPIN, +10 HP, +6% block. -10% Stand damage taken.', desc: 'Jotaro Kujo\'s daughter. Knock her down and she gets up angrier, every single time.',
      abilities: ab(['so_barrier', 'so_resolve', 'so_oraora']) },
  });
})();

/* ================= 6. Icons ================= */
(() => {
  const I = SBR.icons, st = I.st, K = I.K;
  const def = (id, fn) => I.define('ability', id, fn);
  const badge = (c, t, fs = 12, c2 = '#fff') => `<circle cx="24" cy="24" r="19" fill="${c}" ${st}/><circle cx="24" cy="24" r="14" fill="none" stroke="#fff" stroke-width="1.2" opacity=".5"/><text x="24" y="${24 + fs * 0.36}" font-size="${fs}" text-anchor="middle" font-family="Anton,Impact,'Noto Sans JP',sans-serif" fill="${c2}" stroke="${K}" stroke-width="1.6" paint-order="stroke">${t}</text>`;
  const bug = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="-5" rx="3" ry="2.4" fill="${K}"/><ellipse cx="0" cy="1" rx="5.6" ry="6.4" fill="#d8303c" ${st} stroke-width="1.6"/><path d="M0 -4 V7" stroke="${K}" stroke-width="1.2"/><circle cx="-2.4" cy="-.4" r="1.1" fill="${K}"/><circle cx="2.4" cy="-.4" r="1.1" fill="${K}"/><circle cx="-2.6" cy="3.6" r="1.1" fill="${K}"/><circle cx="2.6" cy="3.6" r="1.1" fill="${K}"/></g>`;
  const frog = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 8 Q-15 -6 0 -7 Q15 -6 14 8 Q12 14 0 14 Q-12 14 -14 8Z" fill="#6ac85a" ${st}/><circle cx="-7" cy="-7" r="5" fill="#6ac85a" ${st}/><circle cx="7" cy="-7" r="5" fill="#6ac85a" ${st}/><circle cx="-7" cy="-7.4" r="2" fill="${K}"/><circle cx="7" cy="-7.4" r="2" fill="${K}"/><path d="M-6 5 Q0 9 6 5" fill="none" stroke="${K}" stroke-width="1.6"/></g>`;
  const heart = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -4 C-3 -10 -12 -9 -12 -2 C-12 4 -5 8 0 13 C5 8 12 4 12 -2 C12 -9 3 -10 0 -4Z" fill="${c}" ${st}/>`;
  const str = (d, c = '#8ab0f0') => `<path d="${d}" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`;
  const web = (c = '#fff', r = 18) => [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M24 24L${(24 + Math.cos(i * 0.785) * r).toFixed(1)} ${(24 + Math.sin(i * 0.785) * r).toFixed(1)}" stroke="${c}" stroke-width="1.4"/>`).join('') + [6, 11, 16].map(q => `<polygon points="${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `${(24 + Math.cos(i * 0.785) * q).toFixed(1)},${(24 + Math.sin(i * 0.785) * q).toFixed(1)}`).join(' ')}" fill="none" stroke="${c}" stroke-width="1.2"/>`).join('');
  const portal = `<g transform="translate(35 35)"><circle r="8" fill="#b070ff" ${st} stroke-width="1.6"/><path d="M-4 0h8M0 -4v8" stroke="#fff" stroke-width="2.2"/></g>`;
  const arrowhead = (x, y, s, c = '#f2c14e') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -14 L9 4 L3 2 L3 12 L-3 12 L-3 2 L-9 4Z" fill="${c}" ${st}/><path d="M0 -9 V6" stroke="#fff" stroke-width="1.4" opacity=".6"/></g>`;

  def('gio_punch', () => `<circle cx="24" cy="24" r="19" fill="#f2c14e" ${st}/><path d="M13 22q0-6 6-6h12q6 0 6 6v8q0 9-12 10-12-1-12-10z" fill="#f6e08a" ${st}/><path d="M19 16v9M25 16v9M31 17v8M13 25h24" stroke="${K}" stroke-width="1.5"/>` + bug(37, 11, 0.55));
  def('gio_muda', () => badge('#f2c14e', '無駄', 13, K) + `<path d="M4 8l6 4M3 18h7M44 8l-6 4M45 18h-7" stroke="${K}" stroke-width="2" stroke-linecap="round"/>`);
  def('gio_frog', () => `<circle cx="24" cy="24" r="19" fill="#bde88a" ${st}/>` + frog(24, 27, 1.05) + `<path d="M6 10q3 4 0 8M42 10q-3 4 0 8" fill="none" stroke="#e8742a" stroke-width="2.2"/>`);
  def('gio_organ', () => `<circle cx="24" cy="24" r="19" fill="#f6d8e0" ${st}/>` + heart(24, 24, 1.05, '#e8508a') + `<path d="M12 36 q6-4 10 0 t10 0" fill="none" stroke="#6ac85a" stroke-width="2.4"/><circle cx="36" cy="12" r="3" fill="#f6ecd8" ${st} stroke-width="1.2"/><circle cx="35" cy="11.4" r=".6" fill="${K}"/><circle cx="37" cy="12.6" r=".6" fill="${K}"/>`);
  def('gio_dream', () => badge('#e8508a', '夢', 18) + `<path d="M24 2l2 5 5 .4-4 3 1.4 5-4.4-3-4.4 3 1.4-5-4-3 5-.4z" fill="#f2c14e" ${st} stroke-width="1.2"/>`);
  def('gs_fly', () => `<circle cx="24" cy="24" r="19" fill="#f6ecd8" ${st}/><path d="M6 30h14" stroke="${K}" stroke-width="4" stroke-linecap="round"/><path d="M6 30h14" stroke="#c8c8d8" stroke-width="2" stroke-linecap="round"/><path d="M20 27l8 3-8 3z" fill="#c0a040" ${st} stroke-width="1.4"/><ellipse cx="33" cy="20" rx="4" ry="5" fill="#3a3a4a" ${st} stroke-width="1.4"/><ellipse cx="29" cy="15" rx="4" ry="2.4" fill="#cfe6f4" ${st} stroke-width="1.2" transform="rotate(-30 29 15)"/><ellipse cx="37" cy="15" rx="4" ry="2.4" fill="#cfe6f4" ${st} stroke-width="1.2" transform="rotate(30 37 15)"/><path d="M30 28q-6 8-16 6" fill="none" stroke="${K}" stroke-width="1.4" stroke-dasharray="2 2"/>`);
  def('gs_passione', () => badge('#e8508a', '誓', 18) + bug(10, 12, 0.5) + bug(38, 12, 0.5));
  def('gs_finisher', () => badge('#c8323c', '無駄ァ', 11) + `<path d="M3 24h6M39 24h6M24 3v6M24 39v6M9 9l4 4M39 9l-4 4M9 39l4-4M39 39l-4-4" stroke="#f2c14e" stroke-width="2.4" stroke-linecap="round"/>`);
  def('lg_tree', () => `<circle cx="24" cy="24" r="19" fill="#e8d8a8" ${st}/><path d="M22 42V26M26 42V26" stroke="${K}" stroke-width="5"/><path d="M22 42V26M26 42V26" stroke="#8a5a30" stroke-width="3"/><circle cx="24" cy="18" r="10" fill="#4aa84a" ${st}/><circle cx="16" cy="24" r="6" fill="#5ab85a" ${st}/><circle cx="32" cy="24" r="6" fill="#5ab85a" ${st}/><path d="M12 42q6-6 12-2 6-4 12 2" fill="none" stroke="#8a5a30" stroke-width="2.4"/>`);
  def('lg_frogs', () => `<circle cx="24" cy="24" r="19" fill="#bde88a" ${st}/>` + frog(16, 22, 0.7) + frog(30, 28, 0.8) + portal);
  def('lg_transplant', () => `<circle cx="24" cy="24" r="19" fill="#fff" ${st}/>` + heart(22, 22, 1, '#c8323c') + `<path d="M34 28h8M38 24v8" stroke="${K}" stroke-width="5" stroke-linecap="round"/><path d="M34 28h8M38 24v8" stroke="#6ad08a" stroke-width="2.6" stroke-linecap="round"/><path d="M8 34q6 6 14 2" fill="none" stroke="#f2c14e" stroke-width="2.2" stroke-dasharray="3 2"/>`);
  def('rq_rush', () => badge('#f6e08a', '無駄', 13, K) + arrowhead(38, 12, 0.5));
  def('rq_zero', () => `<circle cx="24" cy="24" r="19" fill="#1a1030" ${st}/><circle cx="24" cy="24" r="13" fill="none" stroke="#f6e08a" stroke-width="2.4"/><path d="M24 24V13M24 24l7 4" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M11 20a13 13 0 0 1 5-8" fill="none" stroke="#f2c14e" stroke-width="3"/><path d="M14 9l3 3-4 1z" fill="#f2c14e" ${st} stroke-width="1"/><text x="24" y="42" font-size="10" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="#f6e08a" stroke="${K}" stroke-width="1.4" paint-order="stroke">0</text>`);
  def('rq_ger', () => `<circle cx="24" cy="24" r="19" fill="#2a1a40" ${st}/><circle cx="24" cy="24" r="15" fill="none" stroke="#c8a0f0" stroke-width="1.6" stroke-dasharray="3 2"/>` + arrowhead(24, 22, 1.25) + `<path d="M8 38l6-6M40 38l-6-6" stroke="#f6e08a" stroke-width="2.4" stroke-linecap="round"/>`);
  def('jol_string', () => `<circle cx="24" cy="24" r="19" fill="#cfe0f8" ${st}/>` + str('M8 36 Q18 8 28 24 T42 12') + `<path d="M38 8l6 2-3 5z" fill="#4a7ad0" ${st} stroke-width="1.2"/>`);
  def('jol_ora', () => badge('#4a7ad0', 'オラ', 14) + `<path d="M4 8l6 4M3 18h7M44 8l-6 4M45 18h-7" stroke="${K}" stroke-width="2" stroke-linecap="round"/>`);
  def('jol_unravel', () => `<circle cx="24" cy="24" r="19" fill="#4a7ad0" ${st}/>` + str('M24 24 q8 -2 8 -8 t-8 -10', '#bcd4f8') + str('M24 24 q-8 2 -8 8 t8 10', '#bcd4f8') + str('M24 24 q2 8 8 8 t10 -8', '#bcd4f8') + `<circle cx="24" cy="24" r="3" fill="#fff" ${st} stroke-width="1.2"/>`);
  def('jol_net', () => `<circle cx="24" cy="24" r="19" fill="#2a4a8a" ${st}/>` + web('#bcd4f8', 17));
  def('jol_yare', () => badge('#3aa870', 'やれやれ', 9) + `<path d="M17 38l1.6 3.4 3.6.4-2.7 2.4.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.4 3.6-.4z" fill="#f2c14e" ${st} stroke-width="1"/>`);
  def('sf_radar', () => `<circle cx="24" cy="24" r="19" fill="#1a2a4a" ${st}/>` + web('#8ab0f0', 17) + `<path d="M12 24q12-10 24 0-12 10-24 0z" fill="#fff" ${st} stroke-width="1.4"/><circle cx="24" cy="24" r="4" fill="#4a7ad0" ${st} stroke-width="1.2"/>`);
  def('sf_stitch', () => `<circle cx="24" cy="24" r="19" fill="#f6d6c0" ${st}/><path d="M10 34 Q24 14 38 16" fill="none" stroke="#c8323c" stroke-width="2.4"/>` + [0, 1, 2, 3, 4].map(i => `<path d="M${13 + i * 5.4} ${27 - i * 3.4}l4 5" stroke="#4a7ad0" stroke-width="2.4" stroke-linecap="round"/>`).join('') + `<path d="M36 8l-4 12" stroke="#c8c8d8" stroke-width="2.6"/><ellipse cx="36.4" cy="7.4" rx="1.6" ry="2.4" fill="none" stroke="${K}" stroke-width="1.2"/>`);
  def('sf_mobius', () => `<circle cx="24" cy="24" r="19" fill="#cfe0f8" ${st}/><path d="M8 24q0-9 8-9t16 18 8-9-8-9-16 18-8-9z" fill="none" stroke="${K}" stroke-width="6.4"/><path d="M8 24q0-9 8-9t16 18 8-9-8-9-16 18-8-9z" fill="none" stroke="#4a7ad0" stroke-width="3.6"/><path d="M8 24q0-9 8-9t16 18 8-9-8-9-16 18-8-9z" fill="none" stroke="#bcd4f8" stroke-width="1" stroke-dasharray="3 2"/>`);
  def('gd_whip', () => `<circle cx="24" cy="24" r="19" fill="#3a9a6a" ${st}/>` + str('M10 40 Q12 18 26 16 Q38 14 40 26', '#bcd4f8') + `<path d="M36 30l6 4M40 24l6 0" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`);
  def('gd_trap', () => `<circle cx="24" cy="24" r="19" fill="#e8d8a8" ${st}/><path d="M8 32h32" stroke="${K}" stroke-width="3"/><path d="M8 32h32" stroke="#4a7ad0" stroke-width="1.4"/><path d="M8 26v10M40 26v10" stroke="${K}" stroke-width="4"/><path d="M8 26v10M40 26v10" stroke="#8a5a30" stroke-width="2"/><path d="M20 30q2-12 10-14" fill="none" stroke="${K}" stroke-width="2"/><circle cx="31" cy="15" r="3.4" fill="#f2c14e" ${st} stroke-width="1.2"/><path d="M14 20l3 3M34 22l3-2" stroke="#c8323c" stroke-width="2"/>`);
  def('gd_break', () => `<circle cx="24" cy="24" r="19" fill="#3a3a4a" ${st}/>` + [12, 20, 28, 36].map((x, i) => `<path d="M${x} 8V${i === 1 ? 20 : 40}" stroke="${K}" stroke-width="5"/><path d="M${x} 8V${i === 1 ? 20 : 40}" stroke="#a8a8b8" stroke-width="2.6"/>`).join('') + `<path d="M20 26l2 14" stroke="${K}" stroke-width="5"/><path d="M20 26l2 14" stroke="#a8a8b8" stroke-width="2.6"/><path d="M16 22l8 2M22 18l-4 6" stroke="#f2c14e" stroke-width="2.4"/>`);
  def('so_barrier', () => `<path d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10z" fill="#2a6aaa" ${st}/>` + `<g transform="translate(24 23) scale(.75) translate(-24 -24)">${web('#bcd4f8', 16)}</g>`);
  def('so_resolve', () => `<circle cx="24" cy="24" r="19" fill="#2a6aaa" ${st}/><path d="M24 8l4.4 9.4 10.2 1.2-7.6 6.8 2.2 10-9.2-5.4-9.2 5.4 2.2-10-7.6-6.8 10.2-1.2z" fill="#f2c14e" ${st}/>`);
  def('so_oraora', () => badge('#2a6aaa', 'ORA', 14) + `<path d="M3 24h6M39 24h6M24 3v6M24 39v6M9 9l4 4M39 9l-4 4M9 39l4-4M39 39l-4-4" stroke="#f2c14e" stroke-width="2.4" stroke-linecap="round"/>`);
  I.define('status', 'zero', () => `<circle cx="24" cy="24" r="18" fill="#f6e08a" ${st}/><ellipse cx="24" cy="24" rx="7" ry="10" fill="none" stroke="${K}" stroke-width="4"/><path d="M8 40L40 8" stroke="${K}" stroke-width="2" opacity=".35"/>`);
  I.define('status', 'endless', () => `<circle cx="24" cy="24" r="18" fill="#2a1a40" ${st}/><path d="M10 24q0-7 6-7t16 14 6-7-6-7-16 14-6-7z" fill="none" stroke="#c8a0f0" stroke-width="3"/>`);

  /* path emblems */
  const ring = (c, inner) => `<circle cx="24" cy="24" r="20" fill="${c}" ${st}/><circle cx="24" cy="24" r="15" fill="#fbf4e4" ${st} stroke-width="1.4"/>${inner}`;
  const mini = (id, s = 0.6) => `<g transform="translate(${24 - 24 * s} ${24 - 24 * s}) scale(${s})">${I.ability(id).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>`;
  ['gangstar', 'lifegiver', 'requiem', 'stonefree', 'greendolphin', 'stoneocean'].forEach(id => { const p = SBR.PATHS[id]; SBR.PATH_EMBLEM[id] = () => I.wrap(ring(p.color, mini(p.abilities[p.abilities.length - 1].id))); });
})();

/* ================= 7. Stands: Gold Experience Requiem, and which figure each lead manifests ================= */
(() => {
  const S = SBR.stands, K = '#1a1020';
  const REQ = ['rq_rush', 'rq_zero', 'rq_ger'];
  S.DEFS.ger = { name: 'Gold Experience Requiem', entity: true, draw: () => {
    const ge = S.svg('gold_experience');
    if (!ge) return '';
    const body = ge.replace(/#f2c14e/gi, '#f8ecb4').replace(/#3a8c4a/gi, '#d8a020');
    const extra = `<g stroke="${K}" stroke-width="2.2" stroke-linejoin="round">`
      + `<path d="M60 1 L67.4 13.4 L63 12.4 L63 20 L57 20 L57 12.4 L52.6 13.4Z" fill="#f2c14e"/><path d="M60 5 V17" stroke="#fff" stroke-width="1.2" opacity=".7"/>`
      + `<path d="M44 26 Q36 18 40 8 M76 26 Q84 18 80 8" fill="none" stroke-width="4"/><path d="M44 26 Q36 18 40 8 M76 26 Q84 18 80 8" fill="none" stroke="#f2c14e" stroke-width="2"/>`
      + `<g transform="translate(60 66)"><ellipse cx="-6" cy="0" rx="6" ry="9" fill="#c8a0f0"/><ellipse cx="6" cy="0" rx="6" ry="9" fill="#c8a0f0"/><circle cx="0" cy="-10" r="3.4" fill="#f2c14e"/><path d="M0 -7 V9" stroke-width="1.4"/></g>`
      + `</g><g fill="none" stroke="#f6e08a" stroke-width="1.4" opacity=".75"><ellipse cx="60" cy="84" rx="56" ry="74" stroke-dasharray="4 6"/></g>`;
    return body.replace('</svg>', extra + '</svg>');
  } };
  const baseKey = S.keyFor;
  S.keyFor = (u, abilityId) => {
    if (u && u.side === 'party' && (u.id === 'giorno' || u.id === 'jolyne')) {
      if (u.id === 'jolyne') return 'stone_free';
      const P = SBR.pathOf && SBR.pathOf(u.ref);
      return (abilityId && REQ.includes(abilityId)) || (!abilityId && P && P === SBR.PATHS.requiem && u.ref && u.ref.level >= 5) ? 'ger' : 'gold_experience';
    }
    return baseKey(u, abilityId);
  };
})();

/* ================= 8. Trainers who teach the Paths ================= */
(() => {
  const port = key => ({ kind: 'portrait', key });
  const E = SBR.ENEMIES;
  const trainer = (id, o) => { E[id] = Object.assign({ tier: 'elite', xp: 18, money: [20, 35], trainer: true }, o); };
  trainer('t_padrone', { name: 'Don Vittorio Ferrante', title: 'Padrone of the Railroad Crews', art: port('padrone'), hp: 68, stats: { aim: 7, grit: 5 }, res: { bullet: -0.2, phys: -0.1 },
    abilities: [{ name: 'Lupara', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 7, { aim: 0.05 }) },
      { name: 'Call the Crew', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'guard', 0, 2); x.status(x.user, 'shield', 10); } },
      { name: 'Vendetta', w: 1, cd: 3, target: 'enemy', fx: 'debuff', run: x => { x.dmg(x.target, 4, { aim: 0.03 }); x.status(x.target, 'fear', 0, 1); } }] });
  trainer('t_orchard', { name: 'Mother Chapman', title: 'Keeper of the Impossible Orchard', art: port('orchard'), hp: 62, stats: { res: 9 }, res: { bleed: -0.3, cold: 0.1 },
    abilities: [{ name: 'Apple Toss', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 5, { res: 0.04 }) },
      { name: 'Bramble Hedge', w: 1, cd: 3, target: 'enemy', fx: 'rope', run: x => { x.dmg(x.target, 4, {}); x.status(x.target, 'hooked', 0, 1); } },
      { name: 'Cider Rest', w: 1, cd: 3, target: 'self', fx: 'heal', run: x => { x.heal(x.user, 12, { res: 0.05 }); x.status(x.user, 'regen', 0, 2); } }] });
  trainer('t_stargazer', { name: 'Professor Absalom Pike', title: 'Stargazer of Crater Flats', art: port('stargazer'), hp: 80, stats: { spin: 7, res: 6 }, dtype: 'stand', res: { stand: -0.3, holy: -0.2 },
    abilities: [{ name: 'Meteor Shard', w: 3, target: 'enemy', fx: 'nail', run: x => x.dmg(x.target, 7, { spin: 0.04 }) },
      { name: 'The Arrow Hums', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'empower', 0, 2); x.status(x.user, 'evasive', 0, 1); } },
      { name: 'Falling Star', w: 1, cd: 4, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => x.dmg(e, 5, { spin: 0.03 })) }] });
  trainer('t_linewoman', { name: 'Hattie Wire', title: 'Telegraph Linewoman', art: port('linewoman'), hp: 60, stats: { aim: 8, ride: 4 }, res: { phys: -0.1, sound: -0.3 },
    abilities: [{ name: 'Wire Snap', w: 3, target: 'enemy', fx: 'rope', run: x => x.dmg(x.target, 6, { aim: 0.04 }) },
      { name: 'Tangle', w: 1, cd: 3, target: 'enemy', fx: 'rope', run: x => x.status(x.target, 'hooked', 0, 2) },
      { name: 'Climb the Pole', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => x.status(x.user, 'evasive', 0, 2) }] });
  trainer('t_warden', { name: 'Warden Silas Crowe', title: 'Yuma Territorial Prison', art: port('warden'), hp: 78, stats: { aim: 6, grit: 7 }, res: { bullet: -0.2, phys: -0.15 },
    abilities: [{ name: 'Nightstick', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 6, { grit: 0.04 }) },
      { name: 'Lockdown', w: 1, cd: 3, target: 'enemy', fx: 'debuff', run: x => { x.status(x.target, 'weak', 0, 2); x.status(x.target, 'hooked', 0, 1); } },
      { name: 'Guard Tower', w: 1, cd: 4, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 10, { aim: 0.05 }, { noDodge: true }) }] });
  trainer('t_prizefighter', { name: 'Hurricane Kate', title: 'Bare-Knuckle Champion of the Barbary Coast', art: port('prizefighter'), hp: 84, stats: { grit: 9, spin: 3 }, res: { phys: -0.25 },
    abilities: [{ name: 'Haymaker', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, x.user.hp / x.user.maxHp < 0.5 ? 9 : 6, { grit: 0.04 }) },
      { name: 'Get Up', w: 1, cd: 3, target: 'self', fx: 'heal', run: x => { x.heal(x.user, 10, { grit: 0.04 }); x.status(x.user, 'empower', 0, 2); } },
      { name: 'Clinch', w: 1, cd: 3, target: 'enemy', fx: 'hit', run: x => { x.dmg(x.target, 4, { grit: 0.03 }); x.status(x.target, 'stun', 0, 1); } }] });

  const T = [
    { path: 'gangstar', foe: 't_padrone', art: 'padrone', title: 'The Padrone', blurb: 'An Italian boss in a bowler hat is paying a railroad crew in cash.', fav: 'naples',
      text: '"From Naples? Then you know how it works, ragazzo. In this country a gang is a railroad crew and a star is a tin badge. You want to be a Gang-Star? Show me men would follow you."',
      check: { stat: 'res', dc: 14, label: 'Win the crew over with your dream' }, duel: 'Make him respect you', decline: { label: 'Share an espresso and news of home', text: 'He talks about Naples until the pot is cold, and presses a lucky coin into your hand. (Giorno +2 LUCK.)', fx: g => g.statUp('giorno', 'luck', 2) } },
    { path: 'lifegiver', foe: 't_orchard', art: 'orchard', title: 'The Impossible Orchard', blurb: 'Apple trees are blooming in the middle of the desert.', fav: 'natives',
      text: '"Folks say Johnny Appleseed planted these. Nonsense. I did, with my own hands and forty years of patience. You can do it with a touch, can\'t you? Then show me you know what life costs."',
      check: { stat: 'res', dc: 13, label: 'Bring her dead tree back to life' }, duel: 'Let her orchard test you', decline: { label: 'Help with the harvest', text: 'A long day in the branches. She sends you off with full bags. (Party heals 30%, a Canteen.)', fx: g => { g.healAll(0.3); g.item('canteen'); } } },
    { path: 'requiem', foe: 't_stargazer', art: 'stargazer', title: 'The Arrow from the Sky', blurb: 'A hermit on a crater rim is polishing an arrowhead that hums.', fav: 'naples',
      text: '"This fell from the sky ten thousand years ago. It chose you once already, didn\'t it, boy? Let it pierce the thing that stands behind you, and see what it becomes."',
      check: { stat: 'spin', dc: 15, label: 'Take hold of the Arrow' }, duel: 'Take it from him', decline: { label: 'Leave the Arrow where it is', text: 'He nods, as if that was the right answer too, and shows you the stars instead. (+25 XP.)', fx: g => g.xp(25) } },
    { path: 'stonefree', foe: 't_linewoman', art: 'linewoman', title: 'The Linewoman', blurb: 'A woman is stringing telegraph wire across the plains, alone.', fav: 'racers',
      text: '"Two hundred miles of wire, and I can feel every bird that lands on it. Heard you come apart into string, girl. String listens, same as wire. Want to learn to hear with it?"',
      check: { stat: 'aim', dc: 13, label: 'String a line across the canyon' }, duel: 'Wrestle her for the spool', decline: { label: 'Help her splice the line', text: 'The line hums back to life. The company pays in silver. ($30, +2 pace.)', fx: g => { g.money(30); g.pace(2); } } },
    { path: 'greendolphin', foe: 't_warden', art: 'warden', title: 'The Warden of Yuma', blurb: 'Men in stripes are breaking rocks beside the trail.', fav: 'law',
      text: '"Escaped convict, by the look of those tattoos. Green Dolphin Street? Never heard of it. Out here you break out or you break rocks, and nobody has ever broken out of my yard."',
      check: { stat: 'luck', dc: 14, label: 'Break out of his yard before sundown' }, duel: 'Fight your way past the guards', decline: { label: 'Teach the chain gang a work song', text: 'The guards look the other way while the prisoners sing. You break a few rocks yourself. (Jolyne +2 GRIT.)', fx: g => g.statUp('jolyne', 'grit', 2) } },
    { path: 'stoneocean', foe: 't_prizefighter', art: 'prizefighter', title: 'Hurricane Kate', blurb: 'A crowd is betting on a fist fight on the back of a wagon.', fav: 'racers',
      text: '"Nobody beats me while I\'m still standing, sugar, and I\'m always still standing. Hit me. Then get hit, and get up. That\'s the whole secret."',
      check: { stat: 'grit', dc: 14, label: 'Last ten rounds with her' }, duel: 'Climb up on the wagon', decline: { label: 'Bet on Kate', text: 'She wins in the third. So do you. ($40.)', fx: g => g.money(40) } },
  ];
  T.forEach(t => {
    const P = SBR.PATHS[t.path], who = P.char, short = SBR.CHARS[who].short;
    SBR.EVENTS.push({
      id: 'path_' + t.path, acts: P.acts, type: 'trainer', title: t.title, blurb: t.blurb, icon: 'train', weight: 3, once: true, pace: -4, art: t.art,
      pathOffer: t.path,
      cond: g => g.canTakePath(who),
      text: t.text,
      html: `${t.text}<span class="ev-path" style="--pc:${P.color}"><b>Path: ${P.name}</b> (${short}) — ${P.desc}<br><i>${P.passive}</i></span>`,
      choices: [
        { label: `${t.check.label} (${short}'s ${SBR.STATS[t.check.stat].name})`, check: { stat: t.check.stat, dc: t.check.dc, who },
          ok: { text: `${short} walks the Path of the ${P.name}.`, fx: g => g.takePath(t.path) },
          fail: { text: 'Not good enough. Not yet. The trainer turns away, but offers a duel instead.', fight: { enemies: [t.foe], elite: true, after: g => g.takePath(t.path) } } },
        { label: t.duel, ok: { text: 'Fists settle it.', fight: { enemies: [t.foe], elite: true, after: g => g.takePath(t.path) } } },
        { label: t.decline.label, ok: { text: t.decline.text, fx: t.decline.fx } },
      ],
    });
    const C = SBR.CONSEQ;
    C['path_' + t.path + ':0'] = { rep: { [t.fav]: 1 }, deed: `Earned the Path of the ${P.name}.` };
    C['path_' + t.path + ':0:fail'] = { rep: { [t.fav]: 1 }, deed: `Failed a trainer’s test for the ${P.name}.` };
    C['path_' + t.path + ':1'] = { rep: { [t.fav]: 1 }, deed: `Won the Path of the ${P.name} in a duel.` };
    C['path_' + t.path + ':2'] = { rep: { [t.fav]: -1 }, deed: `Turned down the ${P.name} trainer.`, later: ['trainer_rival', 5, 10] };
  });
})();

/* ================= 9. Story: how they got here, and how their race ends ================= */
(() => {
  const S = SBR.STORY;
  const pro = S.prologue;
  pro.leadLines = pro.leadLines || {};
  pro.leadLines.giorno = pro.lines.concat([
    { narr: 'Further down the beach, the tide leaves something behind: a boy in a pink suit, fast asleep, with a ladybug on his chest.' },
    { who: 'giorno', text: 'This is not Naples. And that... is not a car. An arrowhead, a gust of wind... and now a horse race?' },
    { who: 'giorno', text: 'Fifty million dollars. A dream needs money, and people who believe in it. I, Giorno Giovanna, am entering.' },
  ]);
  pro.leadLines.jolyne = pro.lines.concat([
    { narr: 'Further down the beach, a girl in prison clothes crawls out of the surf, coughing up seawater. The last thing she remembers is the whole universe spinning faster and faster.' },
    { who: 'jolyne', text: 'Where am I? When am I? ...Great. No walls, no guards, and nobody to tell me no.' },
    { who: 'jolyne', text: 'A race to New York. Fine. Yare yare dawa. If I have to cross a whole continent to get home, I might as well win something.' },
  ]);
  const a1 = S.act1_intro;
  a1.leadLines = a1.leadLines || {};
  a1.leadLines.giorno = [
    { narr: 'Gyro took the 1st Stage, and was immediately penalised for endangering Sandman. The 2nd Stage stretches 1,200 kilometres across the Arizona Desert.' },
    { who: 'gyro', text: 'Oi, the kid in the pink suit. You ride like you\'ve never seen a horse before. Where are you even from?' },
    { who: 'giorno', text: 'Naples. About a hundred years from now. It doesn\'t matter. I need to reach New York, and you two look like you know the way.' },
    { who: 'johnny', text: 'He\'s strange. But there\'s something standing behind him, Gyro. Like the thing behind Mountain Tim.' },
    { narr: 'JOHNNY and GYRO ride with you. Each stage, choose an encounter.' },
  ];
  a1.leadLines.jolyne = [
    { narr: 'Gyro took the 1st Stage, and was immediately penalised for endangering Sandman. The 2nd Stage stretches 1,200 kilometres across the Arizona Desert.' },
    { who: 'johnny', text: 'Joestar? You said your name was Cujoh, but... that star on your shoulder. I have the same one.' },
    { who: 'jolyne', text: 'Figures. My family turns up everywhere. Even a hundred years too early.' },
    { who: 'gyro', text: 'Nyo-ho~. A prisoner and a jockey. Fine, ride with us. Just don\'t tie my horse up with that string.' },
    { narr: 'JOHNNY and GYRO ride with you. Each stage, choose an encounter.' },
  ];
  Object.assign(S, {
    ending_goldenwind: { bg: 6, lines: [
      { narr: 'Giorno Giovanna crosses the finish line in a pink suit nobody in New York has ever seen before, with the Saint\'s Corpse wrapped in his saddlebags.' },
      { who: 'giorno', text: 'The Corpse belongs to no president and no church. I will keep it safe until it can be put somewhere nobody will ever misuse it.' },
      { narr: 'That night a ladybug lands on Johnny\'s hand. When he looks up, the boy from Naples is gone, and a warm golden wind is blowing east, toward the sea and a century that has not happened yet.' },
    ] },
    ending_stoneocean: { bg: 6, lines: [
      { narr: 'Jolyne Cujoh finishes the race with her knuckles split and her braid half unravelled.' },
      { who: 'jolyne', text: 'Yare yare dawa. A whole continent, and not one wall that could hold me.' },
      { narr: 'She sends a telegram to a man who won\'t be born for eighty years. The line goes dead. Somewhere, a thread is still tied around her finger, pulling her home.' },
    ] },
  });
  // lead endings go before the champion and canon endings (whichever test passes first wins)
  const EN = SBR.ENDINGS;
  if (EN && EN.champion && EN.canon) {
    const ch = EN.champion, ca = EN.canon; delete EN.champion; delete EN.canon;
    EN.goldenwind = { name: 'Golden Wind', scene: 'ending_goldenwind', test: () => SBR.run.lead === 'giorno' };
    EN.stoneocean = { name: 'Stone Ocean', scene: 'ending_stoneocean', test: () => SBR.run.lead === 'jolyne' };
    EN.champion = ch; EN.canon = ca;
  }
})();

/* ================= 10. Unlock quests (achievements, no Race Point purchase) ================= */
Object.assign(SBR.ACHIEVEMENTS, {
  golden_wind: { name: 'Golden Wind', desc: 'Finish the Steel Ball Run holding 3 or more Corpse Parts.', rp: 40, unlockLead: 'giorno' },
  stone_ocean: { name: 'Stone Ocean', desc: 'Win a boss battle while your lead rider is below 20% HP.', rp: 30, unlockLead: 'jolyne' },
});
(() => {
  // anyone who already earned these (e.g. after a save migration) gets the rider
  const m = SBR.meta; if (!m || !m.achievements) return;
  m.unlockedLeads = m.unlockedLeads || ['johnny'];
  let ch = false;
  ['golden_wind', 'stone_ocean'].forEach(k => { const L = SBR.ACHIEVEMENTS[k].unlockLead; if (m.achievements[k] && !m.unlockedLeads.includes(L)) { m.unlockedLeads.push(L); ch = true; } });
  if (ch && SBR.saveMeta) SBR.saveMeta();
})();
// Golden Wind: checked when the race ends (pickEnding runs once, at the finish)
(() => {
  const base = SBR.campaign.pickEnding;
  SBR.campaign.pickEnding = () => {
    try {
      const r = SBR.run;
      const holy = r ? Object.keys(r.mats || {}).filter(k => SBR.MATERIALS[k] && SBR.MATERIALS[k].holy && r.mats[k] > 0).length : 0;
      if (r && r.act >= 6 && holy >= 3 && SBR.game && SBR.game.achieve) SBR.game.achieve('golden_wind');
    } catch (e) { console.warn(e); }
    return base();
  };
})();

/* ================= 11. Hooks into systems that load later ================= */
window.addEventListener('DOMContentLoaded', () => {
  if (SBR._gjHooked) return; SBR._gjHooked = true;
  const A = SBR.ABILITIES;
  const MUDA = ['gio_muda', 'gs_finisher', 'rq_rush'];

  /* ---- trees: a Legacy tree for each ---- */
  const TR = SBR.trees;
  const capOf = (u, cap) => { try { return !!(TR && u && u.side === 'party' && !u.summon && !u.removed && TR.NODES[u.id] && TR.bonusFor(u.id).caps.has(cap)); } catch (e) { return false; } };
  if (TR && TR.TREES && !TR.TREES.giorno) {
    const K = '#1a1020', st = `stroke="${K}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
    Object.assign(TR.ICON, {
      ladybug: () => `<ellipse cx="24" cy="12" rx="7" ry="5.6" fill="${K}"/><ellipse cx="24" cy="27" rx="14" ry="15" fill="#d8303c" ${st}/><path d="M24 13v29" stroke="${K}" stroke-width="2"/>${[[18, 22], [30, 22], [16, 32], [32, 32]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${K}"/>`).join('')}<ellipse cx="18" cy="17" rx="3" ry="1.6" fill="#fff" opacity=".7"/>`,
      frog: () => `<path d="M8 32 Q7 16 24 15 Q41 16 40 32 Q38 42 24 42 Q10 42 8 32Z" fill="#6ac85a" ${st}/><circle cx="15" cy="14" r="6" fill="#6ac85a" ${st}/><circle cx="33" cy="14" r="6" fill="#6ac85a" ${st}/><circle cx="15" cy="13.6" r="2.6" fill="${K}"/><circle cx="33" cy="13.6" r="2.6" fill="${K}"/><path d="M15 30 Q24 36 33 30" fill="none" stroke="${K}" stroke-width="2"/>`,
      sprout: () => `<path d="M24 44V22" stroke="${K}" stroke-width="5"/><path d="M24 44V22" stroke="#4a8a3a" stroke-width="2.6"/><path d="M24 26 Q10 26 8 12 Q22 10 24 26Z M24 22 Q34 18 40 6 Q26 6 24 22Z" fill="#6ac85a" ${st}/><path d="M10 44h28" stroke="#8a5a30" stroke-width="4" stroke-linecap="round"/>`,
      arrow: () => `<path d="M24 3 L37 28 L28 25 L28 44 L20 44 L20 25 L11 28Z" fill="#f2c14e" ${st}/><path d="M24 10 V38" stroke="#fff" stroke-width="2" opacity=".6"/>`,
      spool: () => `<rect x="10" y="8" width="28" height="6" rx="2" fill="#8a5a30" ${st}/><rect x="10" y="34" width="28" height="6" rx="2" fill="#8a5a30" ${st}/><rect x="14" y="14" width="20" height="20" fill="#4a7ad0" ${st}/>${[18, 22, 26, 30].map(y => `<path d="M14 ${y}h20" stroke="#bcd4f8" stroke-width="1.4"/>`).join('')}<path d="M34 24 Q44 30 40 44" fill="none" stroke="#4a7ad0" stroke-width="2.4"/>`,
      web: () => `<circle cx="24" cy="24" r="19" fill="#2a4a8a" ${st}/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M24 24L${(24 + Math.cos(i * 0.785) * 18).toFixed(1)} ${(24 + Math.sin(i * 0.785) * 18).toFixed(1)}" stroke="#bcd4f8" stroke-width="1.4"/>`).join('')}${[6, 11, 16].map(q => `<polygon points="${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `${(24 + Math.cos(i * 0.785) * q).toFixed(1)},${(24 + Math.sin(i * 0.785) * q).toFixed(1)}`).join(' ')}" fill="none" stroke="#bcd4f8" stroke-width="1.2"/>`).join('')}`,
      bars: () => `<rect x="6" y="6" width="36" height="36" rx="3" fill="#3a3a4a" ${st}/>${[13, 20, 28, 35].map(x => `<path d="M${x} 6V42" stroke="${K}" stroke-width="4.4"/><path d="M${x} 6V42" stroke="#b8b8c8" stroke-width="2.4"/>`).join('')}<path d="M6 16h36M6 34h36" stroke="${K}" stroke-width="2"/>`,
      butterfly: () => `<path d="M24 24 Q10 4 5 12 Q2 22 24 24 Q8 28 11 38 Q16 44 24 26 Q32 44 37 38 Q40 28 24 24 Q46 22 43 12 Q38 4 24 24Z" fill="#6a4ab0" ${st}/><path d="M24 14V36" stroke="${K}" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="14" r="2.4" fill="#f6ecd8"/><circle cx="36" cy="14" r="2.4" fill="#f6ecd8"/>`,
      starmark: () => `<circle cx="24" cy="24" r="19" fill="#f6d6c0" ${st}/><path d="M24 11l3.8 7.8 8.6 1-6.4 6 1.8 8.4L24 30l-7.8 4.2 1.8-8.4-6.4-6 8.6-1z" fill="#c89a80" ${st} stroke-width="1.6"/>`,
    });
    const SHAPE = [{ tier: 0, col: 1, req: [] }, { tier: 1, col: 0, req: [0] }, { tier: 1, col: 2, req: [0] }, { tier: 2, col: 0, req: [1] }, { tier: 2, col: 2, req: [2] }, { tier: 3, col: 1, req: [3, 4], any: true }, { tier: 4, col: 1, req: [5], cap: true }];
    const COST = [10, 18, 18, 30, 30, 45, 70];
    const add = (cid, T) => {
      TR.TREES[cid] = T; TR.NODES[cid] = {};
      T.branches.forEach(B => {
        B.list = B.nodes.map(([name, ico, fx], i) => {
          const S = SHAPE[i];
          const nd = { id: `${cid}_${B.key}_${i}`, cid, branch: B.key, idx: i, name, icon: ico, fx, tier: S.tier, col: S.col, any: !!S.any, cap: !!S.cap, cost: COST[i] };
          nd.req = S.req.map(r => `${cid}_${B.key}_${r}`);
          TR.NODES[cid][nd.id] = nd;
          return nd;
        });
      });
      if (!TR.RIDERS.includes(cid)) TR.RIDERS.push(cid);
    };
    add('giorno', { stand: () => 'gold_experience', kana: '金', branches: [
      { key: 'gold', name: 'Gold Experience', kana: '生', color: '#e8b030', nodes: [
        ['Ladybug Brooch', 'ladybug', { stats: { spin: 1 }, bonus: { standDmg: 0.05 } }],
        ['Life Punch', 'fist', { stats: { res: 1 }, bonus: { crit: 0.03 } }],
        ['Sense Overload', 'eye', { bonus: { critDmg: 0.1 } }],
        ['MUDA Training', 'fist', { bonus: { standDmg: 0.08 } }],
        ['Bullet to Fly', 'ladybug', { res: { bullet: -0.08 }, bonus: { dodge: 0.02 } }],
        ['Golden Wind', 'bolt', { bonus: { energyStart: 1 } }],
        ['MUDA MUDA MUDA', 'fist', { cap: 'gi_muda', text: 'Every MUDA rush Giorno throws (MUDA MUDA MUDA, the Gang-Star finisher, the Requiem Barrage) lands <b>2 extra hits</b>.' }],
      ] },
      { key: 'life', name: 'Life Giver', kana: '命', color: '#5ab85a', nodes: [
        ['Green Thumb', 'sprout', { bonus: { heal: 0.06 } }],
        ['Frog Skin', 'frog', { hp: 6 }],
        ['Organ Craft', 'heart', { stats: { res: 1 }, bonus: { heal: 0.06 } }],
        ['Sprouting Roots', 'sprout', { bonus: { regen: 1 } }],
        ['Living Flesh', 'med', { res: { bleed: -0.15 } }],
        ['Pulse of Life', 'heart', { stats: { res: 1 }, check: 1 }],
        ['Life Returns', 'frog', { cap: 'gi_life', text: 'Once per battle, when a rider (Giorno included) would fall, Gold Experience gives them life again at <b>25% HP</b>.' }],
      ] },
      { key: 'dream', name: 'Gang-Star', kana: '夢', color: '#e8508a', nodes: [
        ['Passione\'s Oath', 'crown', { stats: { luck: 1 } }],
        ['Boss\'s Charisma', 'hat', { check: 1 }],
        ['Coco Jumbo\'s Room', 'shield', { res: { stand: -0.06, phys: -0.04 } }],
        ['Mista\'s Luck', 'star', { bonus: { crit: 0.04 } }],
        ['Bucciarati\'s Resolve', 'shield', { hp: 6, bonus: { block: 0.03 } }],
        ['A Dream Worth Riding For', 'bolt', { stats: { spin: 1 }, bonus: { init: 2 } }],
        ['I Have a Dream', 'crown', { ability: 'gio_dream', cap: 'gi_dream', text: 'Giorno knows <b>I Have a Dream</b> from the first stage, and it also gives every ally <b>Lucky 2</b>.' }],
      ] },
    ] });
    add('jolyne', { stand: () => 'stone_free', kana: '糸', branches: [
      { key: 'free', name: 'Stone Free', kana: '糸', color: '#4a7ad0', nodes: [
        ['Loose Thread', 'spool', { stats: { aim: 1 } }],
        ['Come Apart', 'web', { bonus: { dodge: 0.03 } }],
        ['String Radar', 'eye', { bonus: { crit: 0.03 } }],
        ['Stitch the Wound', 'spool', { bonus: { regen: 1 } }],
        ['Hooked Line', 'rope', { bonus: { standDmg: 0.08 } }],
        ['Thread the Needle', 'bolt', { bonus: { energyStart: 1 } }],
        ['Möbius Loop', 'web', { cap: 'jo_free', text: 'Whenever Jolyne <b>dodges</b> a hit, the attacker is <b>Hooked</b> for 1 turn (once per round).' }],
      ] },
      { key: 'dolphin', name: 'Green Dolphin Street', kana: '獄', color: '#3a9a6a', nodes: [
        ['Prison Jumpsuit', 'bars', { res: { phys: -0.05 } }],
        ['Contraband', 'map', { check: 1 }],
        ['Lockpick String', 'spool', { stats: { luck: 1 }, bonus: { crit: 0.02 } }],
        ['Yard Brawler', 'fist', { bonus: { physDmg: 0.08, standDmg: 0.04 } }],
        ['Solitary', 'shield', { immune: ['fear'] }],
        ['Butterfly Tattoo', 'butterfly', { stats: { ride: 1 }, bonus: { init: 3 } }],
        ['Jailbreak', 'bars', { ability: 'gd_break', cap: 'jo_break', text: 'Jolyne always acts first in the opening round, and deals <b>+20% damage</b> to Hooked enemies.' }],
      ] },
      { key: 'ocean', name: 'Stone Ocean', kana: '海', color: '#2a6aaa', nodes: [
        ['Kujo Blood', 'starmark', { hp: 6 }],
        ['Star Birthmark', 'starmark', { stats: { grit: 1 } }],
        ['Bitter Tenacity', 'heart', { bonus: { block: 0.04 } }],
        ['Good Grief', 'fist', { res: { stand: -0.06 } }],
        ['Iron Will', 'shield', { stats: { grit: 1 }, bonus: { regen: 1 } }],
        ['Her Father\'s Daughter', 'star', { bonus: { critDmg: 0.12 } }],
        ['ORA ORA ORA!', 'fist', { cap: 'jo_ocean', text: 'Below half HP, Jolyne gains <b>+1 Energy</b> at the start of each of her turns.' }],
      ] },
    ] });
  }

  /* ---- combat: passives, Return to Zero, Endless Death and the Legacy capstones ---- */
  const Base = SBR.Combat;
  const lead = (c, id) => c.units.find(u => u.side === 'party' && !u.summon && !u.removed && !u.dead && u.id === id);
  SBR.Combat = class extends Base {
    constructor(e, o) {
      super(e, o);
      // Golden Wind: every ally starts with Regen 2 while Giorno rides
      if (lead(this, 'giorno')) this.party().filter(u => !u.dead).forEach(u => this.addStatus(u, 'regen', 0, 2, true));
    }
    rollInit(u) { return super.rollInit(u) + (capOf(u, 'jo_break') ? 15 : 0); }
    addStatus(t, id, stacks = 0, turns = 0, silent = false) {
      const d = SBR.STATUS[id];
      if (t && t._zeroBlock && d && d.kind === 'debuff') { this.push({ t: 'float', uid: t.uid, text: 'ZERO', cls: 'buff' }); return; }
      return super.addStatus(t, id, stacks, turns, silent);
    }
    damage(src, tgt, base, scale, opts = {}, ability = null) {
      if (!tgt || tgt.dead) return super.damage(src, tgt, base, scale, opts, ability);
      // Return to Zero: the attack never happened
      if (src && src !== tgt && src.side !== tgt.side && this.has(tgt, 'zero')) {
        this.removeStatus(tgt, 'zero'); tgt._zeroBlock = true;
        this.push({ t: 'float', uid: tgt.uid, text: 'RETURN TO ZERO', cls: 'buff big' });
        return { hit: false, zero: true };
      }
      if (src && src.side === 'party' && src.id === 'jolyne' && !src.summon) {
        const lost = SBR.util.clamp((1 - src.hp / src.maxHp) / 0.75, 0, 1);
        base *= 1 + 0.3 * lost;
        if (tgt.side === 'enemy' && this.has(tgt, 'hooked') && capOf(src, 'jo_break')) base *= 1.2;
      }
      if (tgt.side === 'party' && tgt.id === 'jolyne' && !tgt.summon && src && src.side !== 'party' && tgt.hp / tgt.maxHp < 0.25) base *= 0.85;
      const r = super.damage(src, tgt, base, scale, opts, ability);
      if (r && r.dodged && src && !src.dead && tgt && !tgt.dead && src.side !== tgt.side && capOf(tgt, 'jo_free') && tgt._joFree !== this.round) {
        tgt._joFree = this.round;
        this.addStatus(src, 'hooked', 0, 1);
        this.push({ t: 'float', uid: src.uid, text: 'SNAGGED', cls: 'debuff' });
      }
      return r;
    }
    endTurn(u) { this.units.forEach(x => { if (x._zeroBlock) delete x._zeroBlock; }); return super.endTurn(u); }
    beginTurn(u) {
      const res = super.beginTurn(u);
      if (!u || u.dead || (res && res.skip) || this.result) return res;
      if (this.has(u, 'endless')) {
        const boss = u.tier === 'boss';
        this.typedHp(u, Math.max(3, Math.round(u.maxHp * (boss ? 0.03 : 0.06))), 'true', '∞');
        if (u.dead) { this.checkEnd(); return { skip: true }; }
        if (Math.random() < (boss ? 0.2 : 0.3)) {
          this.push({ t: 'float', uid: u.uid, text: 'NEVER REACHES THE TRUTH', cls: 'debuff big' });
          this.endTurn(u);
          return { skip: true };
        }
      }
      if (capOf(u, 'jo_ocean') && u.hp < u.maxHp / 2) { u.energy = Math.min(u.maxEnergy || 6, (u.energy || 0) + 1); this.push({ t: 'float', uid: u.uid, text: '+1 ENERGY', cls: 'energy' }); }
      return res;
    }
    runPicked(u, ab, lvl, target, picks) {
      const r = super.runPicked(u, ab, lvl, target, picks);
      if (u && u.side === 'party' && !u.dead && !this.result) {
        if (MUDA.some(id => A[id] === ab) && capOf(u, 'gi_muda') && target && !target.dead) {
          for (let i = 0; i < 2 && !target.dead; i++) this.damage(u, target, 3, { spin: 0.035 }, { label: i ? undefined : 'MUDA!' }, ab);
        }
        if (ab === A.gio_dream && capOf(u, 'gi_dream')) this.friends(u).forEach(a => this.addStatus(a, 'lucky', 0, 2));
      }
      return r;
    }
    onDeath(u, src) {
      if (u && !u.dead && u.side === 'party' && !u.summon && !this._giLife) {
        const g = this.units.find(x => x.side === 'party' && x.id === 'giorno' && !x.removed && (!x.dead || x === u));
        if (g && capOf(g, 'gi_life')) {
          this._giLife = true;
          u.hp = Math.ceil(u.maxHp * 0.25);
          this.push({ t: 'fx', kind: 'heal', uid: u.uid });
          this.push({ t: 'float', uid: u.uid, text: 'LIFE RETURNS!', cls: 'buff big' });
          this.push({ t: 'revive', uid: u.uid, hp: u.hp });
          return;
        }
      }
      return super.onDeath(u, src);
    }
  };

  /* ---- Stone Ocean: win a boss fight with your lead below 20% HP ---- */
  if (SBR.battle && SBR.battle.run) {
    const baseRun = SBR.battle.run;
    SBR.battle.run = async (enemies, opts = {}) => {
      const out = await baseRun(enemies, opts);
      try {
        if (out && out.result === 'win' && opts.boss && out.combat && SBR.run) {
          const L = out.combat.party().find(u => u.id === SBR.run.lead);
          if (L && !L.dead && L.hp < L.maxHp * 0.2) SBR.game.achieve('stone_ocean');
        }
      } catch (e) { console.warn(e); }
      return out;
    };
  }

  /* ---- race powers ---- */
  if (SBR.racePowers) {
    const baseRP = SBR.racePowers;
    const POW = {
      giorno: { id: 'life', name: 'Gold Experience', glyph: '命', color: '#f2c14e', desc: 'Life floods your horse: +60 stamina and 2s untouchable.', use: A2 => { A2.stamina(60); A2.S.shield = 2; } },
      jolyne: { id: 'stringline', name: 'Stone Free: String Line', glyph: '糸', color: '#4a7ad0', desc: 'Shoot a line of string at the rider ahead and reel yourself up beside them; they stumble for 1s.', use: A2 => { const t = A2.ahead(); if (t) { A2.me.pos = Math.max(A2.me.pos, t.pos - 6); t.stun = Math.max(t.stun || 0, 1); } else A2.me.pos += 22; } },
    };
    SBR.racePowers = r => {
      const out = baseRP(r);
      ['giorno', 'jolyne'].forEach(id => {
        const m = r.party.find(x => x.id === id && x.hp > 0);
        if (!m || out.some(o => o.id === POW[id].id)) return;
        const at = out.length && out[0].id === 'horse' ? 1 : 0;
        out.splice(at, 0, Object.assign({ who: id }, POW[id]));
      });
      return out.slice(0, 4);
    };
  }

  /* ---- Stand choreography: reuse Gold Experience and Stone Free moves; Requiem gets its own ---- */
  const SF = SBR.standfx;
  if (SBR.strike && SBR.strike.CLOSE) SBR.strike.CLOSE.ger = ['無駄', 'MUDA'];
  if (SF && SF.MOVES) {
    const M = SF.MOVES;
    const alias = { gio_muda: 'muda_rush', gs_finisher: 'muda_rush', gio_frog: 'life_giver', gio_organ: 'life_giver', lg_tree: 'life_giver', lg_transplant: 'life_giver',
      jol_string: 'string_net', jol_net: 'string_net', sf_radar: 'string_net', gd_trap: 'string_net', jol_unravel: 'unravel', sf_mobius: 'mobius' };
    Object.entries(alias).forEach(([id, src]) => { if (M[src] && !M[id]) M[id] = M[src]; });
    if (SF.STYLE && SF.STYLE.gold_experience && !SF.STYLE.ger) SF.STYLE.ger = { color: '#f6e08a', style: c => Object.assign(SF.STYLE.gold_experience.style(c), { cry: ['無駄', 'MUDA'] }) };
    const spd = () => SBR.settings.speed || 1;
    const wait = ms => new Promise(r => setTimeout(r, ms / spd()));
    const plainRush = (c, key, style) => SBR.strike.rush({ key, from: c.from, to: c.to, tier: c.tier, lvl: c.lvl, color: c.color, enemy: c.enemy, plain: true, style });
    M.rq_rush = { key: 'ger', color: '#f6e08a', fn: c => plainRush(c, 'ger', SF.STYLE.ger.style(c)) };
    M.rq_ger = { key: 'ger', color: '#f6e08a', kana: 'レクイエム', fn: async c => {
      const lay = document.createElement('div');
      lay.className = 'gj-ger';
      lay.style.setProperty('--spd', spd());
      lay.innerHTML = `<div class="gj-ger-st">${SBR.stands.svg('ger')}</div><div class="gj-ger-t1">ゴールド・エクスペリエンス・レクイエム</div><div class="gj-ger-t2">GOLD EXPERIENCE REQUIEM</div><div class="gj-ger-t3">終わりがないのが「終わり」</div>`;
      document.body.appendChild(lay);
      try { SBR.audio.play('menace'); } catch (e) { /* no audio */ }
      await wait(1100);
      try { await plainRush(c, 'ger', Object.assign(SF.STYLE.ger.style(c), { hits: () => 9 })); } catch (e) { console.warn(e); }
      lay.classList.add('rewind');
      try { SBR.audio.play('rewind'); } catch (e) { /* no audio */ }
      await wait(700);
      lay.remove();
    } };
    M.rq_zero = { key: 'ger', color: '#f6e08a', fn: async c => {
      const F = SBR.fx;
      c.to.forEach(t => { try { F.ring(t.x, t.y, '#f6e08a', 70, 6, 0.6); F.kana(t.x, t.y - 80, '零', '#f6e08a', 70, 700); } catch (e) { /* no fx */ } });
      await wait(500);
    } };
  }
  if (!document.getElementById('gj-style')) {
    const s = document.createElement('style');
    s.id = 'gj-style';
    s.textContent = `
.gj-ger{position:fixed;inset:0;z-index:60;pointer-events:none;background:radial-gradient(circle at 50% 55%,rgba(246,224,138,.45),rgba(26,16,48,.92) 70%);animation:gjIn calc(.35s / var(--spd,1)) ease-out both;overflow:hidden}
.gj-ger::before{content:'';position:absolute;inset:-50%;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.08) 0 6deg,transparent 6deg 14deg);animation:gjSpin calc(6s / var(--spd,1)) linear infinite}
.gj-ger-st{position:absolute;left:50%;top:52%;width:min(46vh,340px);transform:translate(-50%,-50%);filter:drop-shadow(0 0 24px #f6e08a);animation:gjRise calc(.9s / var(--spd,1)) cubic-bezier(.2,1.4,.4,1) both}
.gj-ger-st svg{width:100%;height:auto}
.gj-ger-t1{position:absolute;top:10%;width:100%;text-align:center;font:900 clamp(18px,3.4vw,40px) 'Zen Antique','Noto Sans JP',sans-serif;color:#f6e08a;-webkit-text-stroke:2px #1a1020;paint-order:stroke;letter-spacing:.04em}
.gj-ger-t2{position:absolute;top:19%;width:100%;text-align:center;font:clamp(22px,4.6vw,56px) Anton,Impact,sans-serif;color:#fff;-webkit-text-stroke:2px #1a1020;paint-order:stroke;letter-spacing:.06em;animation:gjSlam calc(.5s / var(--spd,1)) calc(.25s / var(--spd,1)) both}
.gj-ger-t3{position:absolute;bottom:9%;width:100%;text-align:center;font:900 clamp(16px,2.6vw,30px) 'Zen Antique','Noto Sans JP',sans-serif;color:#c8a0f0;-webkit-text-stroke:1.5px #1a1020;paint-order:stroke}
.gj-ger.rewind{animation:gjOut calc(.7s / var(--spd,1)) ease-in both;filter:invert(1) hue-rotate(180deg)}
@keyframes gjIn{from{opacity:0}to{opacity:1}}@keyframes gjOut{from{opacity:1}to{opacity:0;transform:scale(1.15) rotate(-6deg)}}
@keyframes gjSpin{to{transform:rotate(360deg)}}@keyframes gjRise{from{opacity:0;transform:translate(-50%,-30%) scale(.6)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
@keyframes gjSlam{from{opacity:0;transform:scale(2.2)}to{opacity:1;transform:scale(1)}}
body.reduced .gj-ger::before,body.reduced .gj-ger-st,body.reduced .gj-ger-t2{animation:none}`;
    document.head.appendChild(s);
  }
});
