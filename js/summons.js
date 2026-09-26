/* Aggro, Taunt and party-side summons (An Average Campaign style).
   AGGRO: every unit has an aggro weight. A single-target enemy attack picks a party unit at random,
   weighted by (unit aggro / total party aggro). Aggro comes from:
     - the rider (CHARS[id].aggro: front-liners high, Lucy and Hot Pants low) or the summon (SUMMONS[key].aggro)
     - GRIT raises it a little, RESOLVE lowers it a little
     - gear (EQUIPMENT bonus.aggro, e.g. +0.3)
     - Notoriety, a temporary multiplier: big hits, heals and Stand moves raise it, getting hit lowers it; it fades each turn
     - statuses (STATUS[id].aggro multiplies: Evasive 0.7, Lying Low 0.3, Braced Leather 1.2 ...)
     - Taunt: taunters take 85% of single-target attacks between them. An ENEMY's Taunt is absolute:
       the party's single-target moves can only pick the taunter.
   SUMMONS: SBR.SUMMONS[key] defines a unit the party calls in. It gets a small card on the party side,
   acts at the end of each round, can be targeted (by aggro), dies with its summoner or after `life` turns,
   and never counts as a party member (no HP/XP sync, no revives, no game over).
   Engine: combat.js (aggroInfo, targetWeights, summonAlly, summonAct); UI: battle-ui.js; CSS: css/summons.css */
'use strict';

SBR.SUMMON_CAP = 4;

/* ---------------- aggro sources ---------------- */
(() => {
  const AG = { wekapipo: 1.45, mountaintim: 1.4, gyro: 1.1, diego: 1.15, johnny: 1, custom: 1.05, sukuna: 1.3, pocoloco: 0.9, hotpants: 0.8, lucy: 0.6 };
  Object.entries(AG).forEach(([id, v]) => { if (SBR.CHARS[id]) SBR.CHARS[id].aggro = v; });
  const S = SBR.STATUS;
  S.taunt.desc = () => 'Draws enemy attention. A taunting ally takes 85% of single-target enemy attacks; a taunting enemy must be the target of your single-target moves.';
  S.lowprofile = { name: 'Lying Low', glyph: '潜', color: '#5a6a7a', kind: 'buff', mode: 'turns', aggro: 0.3, desc: () => 'Keeping your head down. Aggro ×0.3: enemies rarely pick you.' };
  const mul = { evasive: 0.7, armored: 1.2, guard: 1.1, marked: 1.25, raptor: 1.3, invuln: 0.5, reflect: 1.15, empower: 1.1 };
  Object.entries(mul).forEach(([id, v]) => { if (S[id]) S[id].aggro = v; });

  // gear that makes you a bigger or smaller target
  const GEAR = { plated_vest: 0.3, bear_mantle: 0.35, scale_vest: 0.2, century_plate: 0.4, medal: 0.2, sheriff_hat: 0.15, irontoe_boots: 0.15,
    silks: -0.2, moccasins: -0.2, chaps: -0.1, nun_veil: -0.15, cassock: -0.1, straw_hat: -0.1 };
  Object.entries(GEAR).forEach(([id, v]) => { const e = SBR.EQUIPMENT[id]; if (e) e.bonus = Object.assign({}, e.bonus, { aggro: v }); });
  const desc = SBR.equipDesc;
  if (desc) SBR.equipDesc = id => { const s = desc(id); const e = SBR.EQUIPMENT[id]; const a = e && e.bonus && e.bonus.aggro; return a ? `${s}${s ? ', ' : ''}${a > 0 ? '+' : ''}${Math.round(a * 100)}% aggro` : s; };
})();

/* ---------------- summon art: flat ink, outline #1a1020 ---------------- */
SBR.summonArt = (() => {
  const K = '#1a1020', st = `stroke="${K}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
  let n = 0;
  const bg = (a, b) => { const id = 'smbg' + (++n); return `<defs><radialGradient id="${id}" cx="50%" cy="58%" r="70%"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></radialGradient></defs><rect width="100" height="120" fill="url(#${id})"/>`
    + `<g stroke="${K}" stroke-width="1" opacity=".18">${[...Array(12)].map((_, i) => { const t = i / 12 * Math.PI * 2; return `<line x1="50" y1="66" x2="${50 + Math.cos(t) * 90}" y2="${66 + Math.sin(t) * 90}"/>`; }).join('')}</g>`; };
  const ground = c => `<ellipse cx="50" cy="104" rx="38" ry="7" fill="${c || K}" opacity=".3"/>`;
  const wrap = inner => `<svg class="portrait summon-art" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  const D = {
    cattle: () => bg('#8a5a30', '#f2c890') + ground() +
      `<path d="M22 70 Q20 54 38 52 L70 52 Q84 54 84 70 L82 84 Q70 90 50 88 Q32 90 24 84 Z" fill="#8a4a24" ${st}/>` +
      `<path d="M44 56 Q52 62 48 72 Q40 74 38 64 Z" fill="#f6ecd8" ${st} stroke-width="1.8"/><path d="M66 60 Q76 62 74 74 Q66 72 64 66 Z" fill="#f6ecd8" ${st} stroke-width="1.8"/>` +
      `<path d="M28 84 L26 102 M36 86 L36 102 M68 86 L68 102 M78 84 L80 102" ${st} stroke-width="5"/><path d="M28 84 L26 102 M36 86 L36 102 M68 86 L68 102 M78 84 L80 102" stroke="#6a3418" stroke-width="2.4" stroke-linecap="round"/>` +
      `<path d="M84 64 Q92 70 90 80" fill="none" ${st}/>` +
      `<path d="M12 40 Q2 30 4 20 Q12 32 24 36 Z" fill="#f6ecd8" ${st}/><path d="M40 36 Q50 32 58 20 Q60 30 50 40 Z" fill="#f6ecd8" ${st}/>` +
      `<path d="M18 36 Q30 28 42 36 L42 58 Q38 70 30 70 Q22 70 18 58 Z" fill="#a0582a" ${st}/><path d="M22 40 L30 46 L38 40" fill="none" stroke="#f6ecd8" stroke-width="3"/>` +
      `<ellipse cx="30" cy="64" rx="9" ry="6" fill="#e8a080" ${st} stroke-width="2"/><circle cx="27" cy="64" r="1.4" fill="${K}"/><circle cx="33" cy="64" r="1.4" fill="${K}"/>` +
      `<circle cx="24" cy="48" r="2.4" fill="${K}"/><circle cx="36" cy="48" r="2.4" fill="${K}"/><path d="M20 44 L27 46 M40 44 L33 46" stroke="${K}" stroke-width="2"/>`,
    rope_decoy: () => bg('#6a3a18', '#f2a860') + ground() +
      `<path d="M50 30 Q36 34 36 48 Q36 60 50 62 Q64 60 64 48 Q64 34 50 30 Z" fill="#d8b070" ${st}/>` +
      `<g fill="none" stroke="#8a6a3a" stroke-width="1.6">${[36, 42, 48, 54].map(y => `<path d="M38 ${y} Q50 ${y + 4} 62 ${y}"/>`).join('')}</g>` +
      `<path d="M26 26 Q50 18 74 26 L70 30 Q50 26 30 30 Z" fill="#6a4a2a" ${st}/><path d="M38 28 Q40 12 50 12 Q60 12 62 28 Z" fill="#7a5a34" ${st}/>` +
      `<path d="M50 62 Q46 72 50 80 Q54 72 50 62 M50 66 L24 58 M50 66 L76 58 M50 80 L38 102 M50 80 L62 102" fill="none" ${st} stroke-width="7"/>` +
      `<path d="M50 62 Q46 72 50 80 M50 66 L24 58 M50 66 L76 58 M50 80 L38 102 M50 80 L62 102" fill="none" stroke="#d8b070" stroke-width="3.6" stroke-dasharray="4 2"/>` +
      `<path d="M42 44 L46 48 M46 44 L42 48 M54 44 L58 48 M58 44 L54 48" stroke="${K}" stroke-width="2"/><path d="M44 55 Q50 52 56 55" fill="none" stroke="${K}" stroke-width="2"/>` +
      `<path d="M76 58 Q90 48 86 34 Q80 26 72 34" fill="none" stroke="#e8742a" stroke-width="2.4" stroke-dasharray="3 2"/>`,
    steel_ball: () => bg('#1a4a4a', '#9fe8d8') + ground('#0a2020') +
      `<g fill="none" stroke="#3fb8a9" stroke-width="2.4" opacity=".9"><path d="M14 70 Q50 44 86 70"/><path d="M18 80 Q50 100 82 80"/><path d="M20 58 Q50 30 80 58" stroke-dasharray="6 5"/></g>` +
      `<circle cx="50" cy="72" r="24" fill="#c8ccd8" ${st}/><circle cx="50" cy="72" r="24" fill="none" stroke="#fff" stroke-width="1.4" opacity=".4"/>` +
      `<path d="M28 64 Q50 56 72 64 M27 78 Q50 88 73 78" fill="none" stroke="${K}" stroke-width="2"/><path d="M50 48 Q42 72 50 96 M50 48 Q58 72 50 96" fill="none" stroke="${K}" stroke-width="1.6"/>` +
      `<ellipse cx="41" cy="62" rx="7" ry="4" fill="#fff" opacity=".85" transform="rotate(-25 41 62)"/>` +
      `<g fill="#f2c14e" ${st} stroke-width="1.6"><path d="M80 28 l3 7 7 1 -5 5 1 7 -6 -4 -6 4 1 -7 -5 -5 7 -1z"/></g>` +
      `<text x="14" y="30" font-size="15" font-family="Anton,Impact,sans-serif" fill="#f6ecd8" stroke="${K}" stroke-width="2.4" paint-order="stroke">GYARU</text>`,
    nail_hole: () => bg('#1a1030', '#b070e0') + ground('#0a0010') +
      `<ellipse cx="50" cy="80" rx="34" ry="14" fill="#2a1a40" ${st}/>` +
      `<g fill="none" stroke-width="3">${[30, 23, 16, 9].map((r, i) => `<ellipse cx="50" cy="80" rx="${r}" ry="${r * 0.42}" stroke="${['#e87aa8', '#b070e0', '#8a5ad0', '#f6ecd8'][i]}" stroke-dasharray="${10 - i * 2} 4" transform="rotate(${i * 20} 50 80)"/>`).join('')}</g>` +
      `<ellipse cx="50" cy="80" rx="6" ry="3" fill="${K}"/>` +
      `<g transform="translate(50 40) rotate(20)"><path d="M0 -24 L6 -6 L24 0 L6 6 L0 24 L-6 6 L-24 0 L-6 -6 Z" fill="#e87aa8" ${st}/><circle r="5" fill="#f6ecd8" ${st} stroke-width="1.8"/></g>` +
      `<path d="M50 62 Q44 70 50 76" fill="none" stroke="#f6ecd8" stroke-width="2" stroke-dasharray="3 3"/>`,
    flesh_doll: () => bg('#8a2a50', '#f8b0c8') + ground() +
      `<path d="M50 20 Q66 20 66 40 Q66 54 58 58 Q76 62 78 84 L76 102 L24 102 L22 84 Q24 62 42 58 Q34 54 34 40 Q34 20 50 20 Z" fill="#f0a0a8" ${st}/>` +
      `<path d="M38 70 Q46 78 42 92 M62 70 Q54 80 60 94 M50 58 L50 102" fill="none" stroke="#c86878" stroke-width="2"/>` +
      `<g stroke="${K}" stroke-width="1.6">${[64, 72, 80, 88, 96].map(y => `<line x1="47" y1="${y}" x2="53" y2="${y + 2}"/>`).join('')}</g>` +
      `<circle cx="44" cy="38" r="3.6" fill="#fff" ${st} stroke-width="1.8"/><circle cx="56" cy="38" r="3.6" fill="#fff" ${st} stroke-width="1.8"/><circle cx="44" cy="38" r="1.4" fill="${K}"/><circle cx="56" cy="38" r="1.4" fill="${K}"/>` +
      `<path d="M44 48 Q50 52 56 48" fill="none" stroke="${K}" stroke-width="2"/>` +
      `<path d="M16 34 Q10 20 22 14 M84 34 Q90 20 78 14" fill="none" stroke="#e8508a" stroke-width="3" stroke-dasharray="2 3"/>` +
      `<g fill="#e8508a" ${st} stroke-width="1.4"><circle cx="18" cy="40" r="3"/><circle cx="84" cy="44" r="2.4"/><circle cx="12" cy="56" r="2"/></g>`,
    raptor: () => bg('#2a4a1a', '#b8e07a') + ground() +
      `<path d="M14 74 Q28 60 46 62 L60 60 Q64 46 74 40 Q88 36 92 46 L86 50 L78 50 Q74 56 72 66 Q72 80 58 84 L40 84 Q24 84 14 74 Z" fill="#6a9a3a" ${st}/>` +
      `<path d="M14 74 L2 66 Q10 80 22 80" fill="#6a9a3a" ${st}/>` +
      `<path d="M30 70 Q40 64 52 70 M36 76 Q46 72 56 76" fill="none" stroke="#3a5a1a" stroke-width="2"/>` +
      `<path d="M44 84 L40 100 L32 102 M56 84 L60 100 L68 102" fill="none" ${st} stroke-width="4.5"/><path d="M44 84 L40 100 L32 102 M56 84 L60 100 L68 102" fill="none" stroke="#6a9a3a" stroke-width="2"/>` +
      `<path d="M70 64 L78 70 L76 74 M66 66 L72 74" fill="none" ${st} stroke-width="3"/>` +
      `<path d="M80 50 L82 54 L84 50 L86 54 L88 49" fill="#fff" stroke="${K}" stroke-width="1.2"/>` +
      `<circle cx="80" cy="44" r="3" fill="#f2c14e" ${st} stroke-width="1.6"/><path d="M79 44 L81 44" stroke="${K}" stroke-width="2"/>` +
      `<path d="M62 44 L66 38 L68 44 L72 38" fill="none" stroke="${K}" stroke-width="1.8"/>`,
    heyya: () => bg('#8a6a10', '#fff3a0') + ground() +
      `<path d="M50 60 Q62 60 64 74 L62 96 L38 96 L36 74 Q38 60 50 60 Z" fill="#f2c14e" ${st}/>` +
      `<path d="M40 96 L38 104 M60 96 L62 104" ${st} stroke-width="4"/>` +
      `<circle cx="50" cy="40" r="20" fill="#f2c14e" ${st}/><path d="M34 30 Q50 14 66 30 Q58 24 50 26 Q42 24 34 30 Z" fill="#e8742a" ${st} stroke-width="2"/>` +
      `<path d="M50 20 l2.4 5 5.4.6 -4 3.6 1.2 5.4 -5 -2.8 -5 2.8 1.2 -5.4 -4 -3.6 5.4 -.6z" fill="#fff" ${st} stroke-width="1.4"/>` +
      `<ellipse cx="43" cy="41" rx="3.4" ry="5" fill="#fff" ${st} stroke-width="1.6"/><ellipse cx="57" cy="41" rx="3.4" ry="5" fill="#fff" ${st} stroke-width="1.6"/><circle cx="43" cy="42" r="1.8" fill="${K}"/><circle cx="57" cy="42" r="1.8" fill="${K}"/>` +
      `<path d="M42 50 Q50 58 58 50 Z" fill="#c8323c" ${st} stroke-width="1.8"/>` +
      `<path d="M38 68 L22 54 M62 68 L78 54" ${st} stroke-width="4"/>` +
      `<g ${st} stroke-width="1.6"><circle cx="18" cy="50" r="8" fill="#e8508a"/><circle cx="82" cy="50" r="8" fill="#3fb8a9"/></g>` +
      `<g stroke="#fff" stroke-width="1.4">${[0, 60, 120, 180, 240, 300].map(a => `<line x1="18" y1="50" x2="${18 + Math.cos(a * Math.PI / 180) * 7}" y2="${50 + Math.sin(a * Math.PI / 180) * 7}"/><line x1="82" y1="50" x2="${82 + Math.cos(a * Math.PI / 180) * 7}" y2="${50 + Math.sin(a * Math.PI / 180) * 7}"/>`).join('')}</g>` +
      `<text x="50" y="116" font-size="12" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="#fff" stroke="${K}" stroke-width="2.2" paint-order="stroke">GO GO!</text>`,
    sha: () => bg('#3a3a4a', '#e8a0c8') + ground() +
      `<path d="M16 86 Q14 76 24 74 L76 74 Q86 76 84 86 Q84 98 76 98 L24 98 Q16 98 16 86 Z" fill="#4a4a5a" ${st}/>` +
      `<g fill="#8a8a9a" ${st} stroke-width="1.8">${[26, 40, 54, 68].map(x => `<circle cx="${x + 3}" cy="87" r="6"/>`).join('')}</g>` +
      `<path d="M28 74 Q28 44 50 44 Q72 44 72 74 Z" fill="#8a8a9a" ${st}/>` +
      `<path d="M36 62 Q36 50 50 50 Q64 50 64 62 Q64 70 58 72 L42 72 Q36 70 36 62 Z" fill="#f6ecd8" ${st} stroke-width="2"/>` +
      `<ellipse cx="44" cy="60" rx="4" ry="5" fill="${K}"/><ellipse cx="56" cy="60" rx="4" ry="5" fill="${K}"/><path d="M48 66 L50 63 L52 66 Z" fill="${K}"/>` +
      `<path d="M42 72 L42 68 M46 72 L46 68 M50 72 L50 68 M54 72 L54 68 M58 72 L58 68" stroke="${K}" stroke-width="1.4"/>` +
      `<path d="M50 44 L50 32" ${st} stroke-width="3"/><circle cx="50" cy="30" r="3" fill="#e8a0c8" ${st} stroke-width="1.6"/>` +
      `<path d="M62 50 Q70 44 76 48" fill="none" stroke="#e8a0c8" stroke-width="3"/>` +
      `<text x="50" y="22" font-size="11" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="#fff" stroke="${K}" stroke-width="2.2" paint-order="stroke">LOOK OVER HERE!</text>`,
    harvest: () => bg('#6a5a10', '#f8e890') + ground() +
      [[30, 70, 1], [62, 62, 0.9], [46, 88, 1.1], [74, 88, 0.8], [22, 94, 0.7]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})">` +
        `<ellipse cx="0" cy="0" rx="11" ry="9" fill="#f2c14e" ${st}/><path d="M0 -9 L0 9" stroke="${K}" stroke-width="1.6"/>` +
        `<circle cx="0" cy="-11" r="6" fill="#e8c040" ${st} stroke-width="2"/><circle cx="-2.4" cy="-12" r="1.4" fill="${K}"/><circle cx="2.4" cy="-12" r="1.4" fill="${K}"/>` +
        `<path d="M-10 -2 L-16 -6 M-10 3 L-16 5 M10 -2 L16 -6 M10 3 L16 5 M-3 -16 L-6 -21 M3 -16 L6 -21" stroke="${K}" stroke-width="1.8"/>` +
        `<path d="M-6 2 L-3 2 M3 2 L6 2" stroke="#c8323c" stroke-width="2"/></g>`).join('') +
      `<g ${st} stroke-width="1.4"><circle cx="80" cy="30" r="6" fill="#e8c878"/><circle cx="18" cy="40" r="5" fill="#e8c878"/></g><text x="80" y="33" font-size="7" text-anchor="middle" fill="${K}">¢</text>`,
    straycat: () => bg('#2a5a3a', '#c8f0b8') + ground() +
      `<path d="M34 104 L38 84 L62 84 L66 104 Z" fill="#c86a3a" ${st}/><rect x="34" y="80" width="32" height="6" fill="#a8542a" ${st} stroke-width="2"/>` +
      `<path d="M50 80 Q46 66 50 58" fill="none" stroke="#3a8a3a" stroke-width="4"/><path d="M48 72 Q36 70 32 60 Q44 60 48 70 Z M52 68 Q62 64 68 56 Q58 56 52 66 Z" fill="#5ab85a" ${st} stroke-width="2"/>` +
      `<path d="M28 44 L30 22 L40 32 Q50 28 60 32 L70 22 L72 44 Q72 60 50 62 Q28 60 28 44 Z" fill="#f6ecd8" ${st}/>` +
      `<g fill="#f2c14e" ${st} stroke-width="1.4">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<ellipse cx="${50 + Math.cos(a * Math.PI / 180) * 26}" cy="${44 + Math.sin(a * Math.PI / 180) * 24}" rx="6" ry="4" transform="rotate(${a} ${50 + Math.cos(a * Math.PI / 180) * 26} ${44 + Math.sin(a * Math.PI / 180) * 24})"/>`).join('')}</g>` +
      `<path d="M28 44 L30 22 L40 32 Q50 28 60 32 L70 22 L72 44 Q72 60 50 62 Q28 60 28 44 Z" fill="#f6ecd8" ${st}/>` +
      `<path d="M38 42 Q42 38 46 42 M54 42 Q58 38 62 42" fill="none" stroke="${K}" stroke-width="2.4"/><path d="M47 48 L50 51 L53 48 Z" fill="#e87aa8" ${st} stroke-width="1.4"/>` +
      `<path d="M50 51 Q46 55 42 52 M50 51 Q54 55 58 52 M36 48 L24 46 M36 51 L24 53 M64 48 L76 46 M64 51 L76 53" fill="none" stroke="${K}" stroke-width="1.4"/>` +
      `<circle cx="82" cy="30" r="7" fill="#dff4ff" stroke="#6aa0c8" stroke-width="2" opacity=".8"/><circle cx="16" cy="70" r="5" fill="#dff4ff" stroke="#6aa0c8" stroke-width="2" opacity=".8"/>`,
  };
  const fn = key => wrap(D[key] ? D[key]() : bg('#3a3a4a', '#aab'));
  fn.has = key => !!D[key];
  return fn;
})();

/* ---------------- the summons ---------------- */
(() => {
  const lv = (x, a, b) => (x.lvl > 1 ? b : a);
  SBR.SUMMONS = {
    cattle: { name: 'Longhorn Steer', short: 'Steer', color: '#8a4a24', kana: 'モォー', hp: 22, aggro: 1.6, dodge: 0.02, block: 0.15, life: 4, max: 2, res: { phys: -0.1 },
      move: 'Gore', fx: 'hit', target: 'enemy', pick: 'random', dtype: 'phys',
      desc: 'A half-ton of angry beef. Big and loud: enemies can\'t help looking at it. Gores a random enemy each round.',
      act(x) { const r = x.dmg(x.target, 5, { grit: 0.03 }); if (r.hit && x.roll(0.25)) x.status(x.target, 'vuln', 0, 1); } },
    rope_decoy: { name: 'Lonesome Scarecrow', short: 'Scarecrow', color: '#d8b070', kana: 'シュルル', hp: 14, aggro: 1.8, dodge: 0.1, block: 0.1, life: 3, taunt: 3, res: { bullet: -0.4 },
      move: 'Snag', fx: 'rope', target: 'enemy', pick: 'highest', dtype: 'stand', tags: ['stand'],
      desc: 'Oh! Lonesome Me ties rope into a man-shaped decoy wearing Tim\'s hat. Arrives Taunting; snags an enemy each round (40% Hooked).',
      act(x) { const r = x.dmg(x.target, 2, { aim: 0.02 }); if (r.hit && x.roll(0.4)) x.status(x.target, 'hooked', 0, 1); } },
    steel_ball: { name: 'Spinning Sentry', short: 'Sentry', color: '#3fb8a9', kana: 'ギャルギャル', hp: 10, aggro: 0.6, dodge: 0.25, block: 0.2, life: 3, res: { phys: -0.3, bullet: -0.2 },
      move: 'Ricochet', fx: 'ball', target: 'enemy', pick: 'lowest', dtype: 'spin', tags: ['spin'],
      desc: 'A Steel Ball left spinning in the dirt. Each round it leaps at the weakest enemy for Spin damage, and every hit feeds Gyro 1 Rotation.',
      act(x) { const r = x.dmg(x.target, lv(x, 4, 5), { spin: 0.045 }); const o = x.owner; if (r.hit && o && !o.dead) x.c.addStatus(o, 'rotation', 1, 0, true); } },
    nail_hole: { name: 'Wandering Nail Hole', short: 'Nail Hole', color: '#b070e0', kana: 'ズキュン', hp: 8, aggro: 0.35, dodge: 0.35, block: 0, life: 4, res: { phys: -0.5, stand: -0.3 },
      move: 'Chase', fx: 'nail', target: 'enemy', pick: 'holed', dtype: 'spin', tags: ['spin', 'stand'],
      desc: 'Tusk ACT2: a spinning hole that crawls across the ground on its own. Hard to see, harder to hit. Each round it chases the most-holed enemy: Spin damage and +1 Nail Hole.',
      act(x) { const r = x.dmg(x.target, 3, { aim: 0.03, spin: 0.02 }); if (r.hit) x.status(x.target, 'holed', 1); } },
    flesh_doll: { name: 'Flesh Double', short: 'Double', color: '#f0a0a8', kana: 'ブシュ', hp: 16, aggro: 1.5, dodge: 0.08, block: 0.05, life: 3, taunt: 3,
      move: 'Mimic', fx: 'heal', target: 'owner',
      desc: 'Cream Starter sprays a copy of Hot Pants. It arrives Taunting, mends her 3 HP each round, and bursts into blinding flesh when destroyed.',
      act(x) { const o = x.owner; if (o && !o.dead) x.heal(o, 3, { res: 0.04 }); },
      onDeath(x, src) { const t = src && !src.dead && src.side === 'enemy' ? src : x.randomEnemy(); if (t) { x.c.push({ t: 'float', uid: t.uid, text: 'FLESH BURST', cls: 'debuff' }); x.status(t, 'blind', 0, 1); } } },
    raptor: { name: 'Scary Monster', short: 'Raptor', color: '#6a9a3a', kana: 'ギャアッ', hp: 12, aggro: 1.0, dodge: 0.15, block: 0.05, life: 4, max: 3, res: { cold: 0.2 },
      move: 'Pounce', fx: 'claw', target: 'enemy', pick: 'random', dtype: 'stand', tags: ['stand'],
      desc: 'One of Diego\'s dinosaurs. Pounces on a random enemy each round; every hit spreads Fossilizing.',
      act(x) { const r = x.dmg(x.target, 4, { ride: 0.03, aim: 0.02 }); if (r.hit) x.status(x.target, 'fossil', 1); } },
    heyya: { name: 'Hey Ya!', short: 'Hey Ya!', color: '#f2c14e', kana: 'ヘイヤー', hp: 8, aggro: 0.4, dodge: 0.3, block: 0, life: 4,
      move: 'Cheer', fx: 'buff', target: 'ally', prefer: 'lucky',
      desc: 'Pocoloco\'s tiny cheerleader hops off his shoulder. Each round a rider without Lucky gets Lucky 2, with a 25% chance of +1 Energy.',
      act(x) { if (!x.target) return; x.status(x.target, 'lucky', 0, 2); if (x.roll(0.25)) x.energy(x.target, 1); if (x.roll(0.3)) x.say(x.user, 'You can do it!'); } },
    sha: { name: 'Sheer Heart Attack', short: 'SHA', color: '#8a8a9a', kana: 'コッチヲミロ', hp: 26, aggro: 0.8, dodge: 0, block: 0.35, life: 3, res: { phys: -0.5, bullet: -0.5, stand: -0.3, cold: 0.3 },
      move: 'LOOK OVER HERE!', fx: 'boom', target: 'enemy', pick: 'highest', dtype: 'phys',
      desc: 'Killer Queen\'s left-hand bomb. A little tank that never stops: each round it rams the warmest (highest HP) enemy and explodes for 7. Almost indestructible.',
      act(x) { x.c.push({ t: 'fx', kind: 'boom', uid: x.target.uid }); x.dmg(x.target, 7, { spin: 0.02 }, { noCrit: true, label: 'SHA!' }); } },
    harvest: { name: 'Harvest Swarm', short: 'Harvest', color: '#f2c14e', kana: 'ワラワラ', hp: 12, aggro: 0.7, dodge: 0.3, block: 0, life: 4,
      move: 'Swarm', fx: 'claw', target: 'enemy', pick: 'random', dtype: 'stand', tags: ['stand'],
      desc: 'Five hundred tiny Harvests from a jar. They nibble a random enemy each round, and 30% of the time come back with a coin ($4).',
      act(x) { x.dmg(x.target, 3, { luck: 0.03 }); if (x.roll(0.3)) { x.money(4); x.c.push({ t: 'float', uid: x.user.uid, text: '+$4', cls: 'buff' }); } } },
    straycat: { name: 'Stray Cat', short: 'Stray Cat', color: '#5ab85a', kana: 'ニャー', hp: 14, aggro: 0.8, dodge: 0.05, block: 0.1, life: 4,
      move: 'Air Bubble', fx: 'gun', target: 'enemy', pick: 'lowest', dtype: 'phys',
      desc: 'A cat reborn as a plant, potted and furious. Each round it fires an invisible air bubble at the weakest enemy: 6 damage that cannot be dodged.',
      act(x) { x.dmg(x.target, 6, { aim: 0.02 }, { noDodge: true }); } },
  };
})();

/* ---------------- abilities: taunts, lying low, summons ---------------- */
(() => {
  const A = SBR.ABILITIES;
  const lv = (x, a, b) => (x.lvl > 1 ? b : a);
  const S = SBR.SUMMONS;
  Object.assign(A, {
    // aggro
    tim_draw: { name: 'Draw!', cost: 1, cd: 3, target: 'self', tags: [], fx: 'buff',
      desc: l => `"Go on. Draw." Tim squares up: Taunt 2 and Guard 2${l > 1 ? ', plus a 6 Shield' : ''}. Taunting draws 85% of single-target attacks.`,
      run(x) { x.status(x.user, 'taunt', 0, 3); x.status(x.user, 'guard', 0, 3); if (x.lvl > 1) x.status(x.user, 'shield', 6); x.say(x.user, 'Draw!'); } },
    lie_low: { name: 'Lie Low', cost: 0, cd: 3, target: 'self', tags: [], fx: 'buff',
      desc: l => `Keep your head down: Lying Low ${l > 1 ? 3 : 2} (aggro ×0.3) and +1 Energy.`,
      run(x) { x.status(x.user, 'lowprofile', 0, lv(x, 3, 4)); x.energy(x.user, 1); } },
    royal_challenge: { name: 'Royal Challenge', cost: 1, cd: 3, target: 'self', tags: ['spin'], fx: 'buff',
      desc: l => `A Royal Guard's formal challenge. Taunt 2 and Braced Leather ${l > 1 ? 3 : 2}.`,
      run(x) { x.status(x.user, 'taunt', 0, 3); x.status(x.user, 'armored', 0, lv(x, 3, 4)); } },
    showboat: { name: 'Showboat', cost: 1, cd: 3, target: 'self', tags: [], fx: 'buff',
      desc: l => `Spin the pistol, tip the hat, shout your own name. Taunt 2 and Empowered ${l > 1 ? 2 : 1}.`,
      run(x) { x.status(x.user, 'taunt', 0, 3); x.status(x.user, 'empower', 0, lv(x, 2, 3)); x.say(x.user, 'Over here!'); } },
    // summons
    call_herd: { name: 'Call the Herd', cost: 2, cd: 4, target: 'none', tags: [], fx: 'buff', summon: 'cattle',
      desc: l => `A rancher's whistle brings ${l > 1 ? 'two Longhorn Steers' : 'a Longhorn Steer'} (${S.cattle.hp} HP, 4 rounds, high aggro). Each gores an enemy every round.`,
      run(x) { x.summonAlly('cattle'); if (x.lvl > 1) x.summonAlly('cattle'); x.say(x.user, 'Hyah! Move \'em out!'); } },
    rope_decoy: { name: 'Lonesome Scarecrow', cost: 1, cd: 4, target: 'none', tags: ['stand'], fx: 'rope', summon: 'rope_decoy',
      desc: l => `Tie a rope man in your hat. The decoy (${S.rope_decoy.hp} HP${l > 1 ? ' +50%' : ''}, 3 rounds) arrives Taunting and snags an enemy each round.`,
      run(x) { x.summonAlly('rope_decoy', { hpMul: x.lvl > 1 ? 1.5 : 1 }); } },
    ball_sentry: { name: 'Spinning Sentry', cost: 2, cd: 4, target: 'none', tags: ['spin'], fx: 'ball', summon: 'steel_ball',
      desc: l => `Leave a Steel Ball spinning in the dirt (${S.steel_ball.hp} HP, ${l > 1 ? 4 : 3} rounds). Each round it hits the weakest enemy for Spin damage and gives Gyro 1 Rotation.`,
      run(x) { x.summonAlly('steel_ball', { life: lv(x, 3, 4) }); } },
    loose_hole: { name: 'ACT2: Loose Hole', cost: 1, cd: 3, target: 'none', tags: ['stand', 'spin'], fx: 'nail', summon: 'nail_hole',
      desc: l => `Fire a nail into the ground and let the hole wander (${S.nail_hole.hp} HP, ${l > 1 ? 5 : 4} rounds, very low aggro). It chases the most-holed enemy each round.`,
      run(x) { x.summonAlly('nail_hole', { life: lv(x, 4, 5) }); } },
    flesh_double: { name: 'Cream Starter: Double', cost: 2, cd: 4, target: 'none', tags: ['stand'], fx: 'spray', summon: 'flesh_doll',
      desc: l => `Spray a flesh copy of yourself (${S.flesh_doll.hp} HP${l > 1 ? ' +50%' : ''}). It Taunts, heals you each round, and bursts into blinding flesh when it falls. You gain Lying Low 1.`,
      run(x) { x.summonAlly('flesh_doll', { hpMul: x.lvl > 1 ? 1.5 : 1 }); x.status(x.user, 'lowprofile', 0, 2); } },
    heyya_tag: { name: 'Hey Ya! Tag Along', cost: 1, cd: 4, target: 'none', tags: ['stand'], fx: 'buff', summon: 'heyya',
      desc: l => `Hey Ya! hops down to cheer on the whole party for ${l > 1 ? 5 : 4} rounds: Lucky 2 to a rider each round, sometimes +1 Energy.`,
      run(x) { x.summonAlly('heyya', { life: lv(x, 4, 5) }); } },
  });
  // Diego's Dinosaur Pack now calls two raptors onto the field
  if (A.dino_pack) Object.assign(A.dino_pack, { target: 'none', summon: 'raptor',
    desc: l => `Scary Monsters: two small raptors join the fight (${S.raptor.hp} HP, ${l > 1 ? 5 : 4} rounds). Each pounces on an enemy every round and spreads Fossilizing.`,
    run(x) { x.summonAlly('raptor', { life: lv(x, 4, 5) }); x.summonAlly('raptor', { life: lv(x, 4, 5) }); x.say(x.user, 'WRYYY! Go, my monsters!'); } });
  // Killer Queen's Sheer Heart Attack is a real little tank now
  if (A.kq_sha) Object.assign(A.kq_sha, { target: 'none', summon: 'sha',
    desc: l => `"LOOK OVER HERE!" The left-hand bomb rolls out (${S.sha.hp} HP, ${l > 1 ? 4 : 3} rounds, very tough). Each round it rams the highest-HP enemy for 7.`,
    run(x) { x.summonAlly('sha', { life: lv(x, 3, 4) }); } });
  // Hot Pants' disguise is stealth: nobody knows which one is her
  if (A.flesh_disguise) { const r = A.flesh_disguise.run, d = A.flesh_disguise.desc; A.flesh_disguise.run = function (x) { r.call(this, x); x.status(x.user, 'lowprofile', 0, 2); }; A.flesh_disguise.desc = l => `${d(l)} Also Lying Low 2.`; }

  /* ---- who learns them ---- */
  const learn = (char, list) => { const C = SBR.CHARS[char]; if (!C) return; list.forEach(a => { if (!C.abilities.some(b => b.id === a.id)) C.abilities.push(a); }); };
  learn('mountaintim', [{ id: 'tim_draw', level: 3 }, { id: 'rope_decoy', level: 4 }, { id: 'call_herd', level: 6 }]);
  learn('gyro', [{ id: 'ball_sentry', level: 4 }]);
  learn('johnny', [{ id: 'loose_hole', flag: 'tusk2' }, { id: 'lie_low', level: 4 }]);
  learn('hotpants', [{ id: 'flesh_double', level: 3 }]);
  learn('pocoloco', [{ id: 'heyya_tag', level: 3 }]);
  learn('lucy', [{ id: 'lie_low', level: 3 }]);
  learn('wekapipo', [{ id: 'royal_challenge', level: 4 }]);
  learn('custom', [{ id: 'showboat', level: 4 }]);

  /* ---- items ---- */
  Object.assign(SBR.ITEMS, {
    harvest_jar: { name: 'Shigechi\'s Harvest Jar', glyph: '群', color: '#f2c14e', price: 34, target: 'none', desc: 'Uncork it and a Harvest Swarm joins the fight for 4 rounds: it nibbles an enemy each round and picks up coins.', use: x => x.summonAlly('harvest') },
    straycat_pot: { name: 'Stray Cat in a Pot', glyph: '猫', color: '#5ab85a', price: 40, target: 'none', desc: 'Set the pot down. Stray Cat fights for 4 rounds, firing invisible air bubbles (6, cannot be dodged) at the weakest enemy.', use: x => x.summonAlly('straycat') },
    enigma_paper: { name: 'Enigma\'s Paper Fold', glyph: '紙', color: '#f6ecd8', price: 20, target: 'ally', desc: 'Fold yourself into paper for a moment. Lying Low 3 (aggro ×0.3) and Evasive 1. Terunosuke would be proud.', use: x => { x.status(x.target, 'lowprofile', 0, 3); x.status(x.target, 'evasive', 0, 1); } },
  });

  /* ---- enemies that taunt: the party must strike the taunter with single-target moves ---- */
  const give = (id, ab) => { const E = SBR.ENEMIES[id]; if (E && E.abilities && !E.abilities.some(a => a.name === ab.name)) E.abilities.push(ab); };
  const taunt = (name, line, extra, cond) => ({ name, w: 1.2, cd: 4, cost: 1, target: 'self', fx: 'buff', taunt: true, cond,
    run: x => { x.status(x.user, 'taunt', 0, 3); if (extra) extra(x); if (line) x.say(x.user, line); } });
  const hasFriends = x => x.allies.length > 1;
  give('stroheim', taunt('German Science Is Unbeatable!', 'Shoot me if you can! My body is the pinnacle of German science!', x => x.status(x.user, 'armored', 0, 3)));
  give('vguard', taunt('Protect the President!', 'Your fight is with me!', x => x.status(x.user, 'guard', 0, 2), hasFriends));
  give('wekapipo_foe', taunt('Royal Guard\'s Challenge', 'Face me, if you are a man.', x => x.status(x.user, 'armored', 0, 2)));
  give('sd_temperance', taunt('All You Can Eat', 'Go on, hit me. I\'ll just swallow it.', x => x.status(x.user, 'shield', 10)));
  give('sd_kraft', taunt('Fixed in Place', 'Everything stops where I say. Starting with your aim.', x => x.status(x.user, 'guard', 0, 2)));
  give('soldier', taunt('Hold the Line!', 'Over here, you dogs!', x => x.status(x.user, 'guard', 0, 2), hasFriends));

  /* ---- icons ---- */
  const I = SBR.icons, st = I.st, K = I.K;
  const badge = (c, t, fs = 12, c2 = '#fff') => `<circle cx="24" cy="24" r="19" fill="${c}" ${st}/><circle cx="24" cy="24" r="14" fill="none" stroke="#fff" stroke-width="1.2" opacity=".5"/><text x="24" y="${24 + fs * 0.36}" font-size="${fs}" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${c2}" stroke="${K}" stroke-width="1.6" paint-order="stroke">${t}</text>`;
  // summon moves get a little "+" portal tab
  const portal = `<g transform="translate(35 35)"><circle r="8" fill="#b070ff" ${st} stroke-width="1.6"/><path d="M-4 0h8M0 -4v8" stroke="#fff" stroke-width="2.2"/></g>`;
  const T = { tim_draw: ['#c8323c', '抜', 18], lie_low: ['#5a6a7a', '潜', 18], royal_challenge: ['#6a8ad0', '挑', 18], showboat: ['#e8742a', '見', 18],
    call_herd: ['#8a4a24', '牛', 18, 1], rope_decoy: ['#b8905a', '案', 18, 1], ball_sentry: ['#3fb8a9', '球', 18, 1], loose_hole: ['#b070e0', '穴', 18, 1],
    flesh_double: ['#e8a0a0', '分', 18, 1], heyya_tag: ['#f2c14e', 'GO', 13, 1], dino_pack: ['#6a9a3a', '竜', 18, 1], kq_sha: ['#8a8a9a', 'SHA', 12, 1] };
  Object.entries(T).forEach(([id, [c, t, fs, p]]) => I.define('ability', id, () => badge(c, t, fs, c === '#f2c14e' ? K : '#fff') + (p ? portal : '')));
  I.define('status', 'lowprofile', () => `<circle cx="24" cy="24" r="18" fill="#5a6a7a" ${st}/><path d="M10 26 Q24 14 38 26 Q24 36 10 26 Z" fill="#dfe6ee" ${st} stroke-width="1.8"/><circle cx="24" cy="26" r="4" fill="${K}"/><path d="M10 34 L38 18" stroke="${K}" stroke-width="3"/>`);
  const itemArt = (key, s = 0.44) => () => `<g transform="translate(${24 - 50 * s} ${24 - 62 * s}) scale(${s})">${SBR.summonArt(key).replace(/<svg[^>]*>|<\/svg>/g, '')}</g><rect x="2" y="2" width="44" height="44" rx="6" fill="none" ${st}/>`;
  I.define('item', 'harvest_jar', () => `<path d="M14 14h20v4q6 4 6 12v10q0 4-4 4H12q-4 0-4-4V30q0-8 6-12z" fill="#e8f4f8" ${st}/><rect x="13" y="8" width="22" height="7" rx="2" fill="#a8542a" ${st}/>${[[18, 30], [28, 34], [22, 38], [30, 26]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="#f2c14e" ${st} stroke-width="1.4"/>`).join('')}`);
  I.define('item', 'straycat_pot', itemArt('straycat'));
  I.define('item', 'enigma_paper', () => `<path d="M8 12 L40 8 L38 40 L10 42 Z" fill="#f6ecd8" ${st}/><path d="M8 12 L24 26 L40 8 M10 42 L24 26 L38 40" fill="none" stroke="${K}" stroke-width="1.6"/><text x="24" y="32" font-size="12" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="#c8323c" stroke="${K}" stroke-width="1" paint-order="stroke">?</text>`);
})();
/* summon moves deal no damage themselves (tooltips and hit VFX) */
(() => { const dt = SBR.abilityDtype; SBR.abilityDtype = a => (a && a.summon ? null : dt(a)); })();
