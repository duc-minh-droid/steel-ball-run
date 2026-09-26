/* Strange travellers: Stand users from JoJolion (Part 8) met on the trail as optional encounters.
   Every Part 7 Stand is already in the game (see sbr.js / enemies.js), so the next closest cast are the Rock
   Humans and the Wonder of U: people from a seaside town called Morioh who have somehow ended up on the Corpse Road.
     Wu Tomoki        Doctor Wu        Acts I-II    crumbles into gravel, possesses your bones
     Tamaki Damo      Vitamin C        Acts II-III  handprints soften you until you melt
     Yotsuyu Yagiyama I Am a Rock      Acts II-III  whoever he touches attracts flying objects
     Aisho            Doobie Wah!      Acts III-IV  a tornado that chases whoever breathes (Brace = hold your breath)
     Dolomite         Blue Hawaii      Acts III-IV  thralls who walk in a straight line; their blood spreads it
     Poor Tom         Ozon Baby        Acts IV-V    the air thins every round, then bursts
     Urban Guerrilla  Brain Storm      Acts V-VI    burr puzzles that melt flesh; punching him melts your fist
     Toru             Wonder of U      Acts V-VI    pursuing him is punished by calamity; only Spin gets through
   Same shape as sides.js: portraits, Stand figures, statuses, enemies, drops, then the encounters (SBR.EVENTS +
   SBR.CONSEQ). Loads after superbosses.js and before combat.js: data and wrappers only. */
'use strict';

(() => {
  const INK = '#1a1020';
  const port = key => ({ kind: 'portrait', key });
  const U = SBR.util;

  /* ================= 1. Portraits ================= */
  // custom head pieces (drawn over the hair inside the ink group; `id` is the portrait's unique id)
  const BODYP = 'M8 120 Q12 94 50 88 Q88 94 92 120 Z';
  const clipBody = (id, k, inner) => `<clipPath id="${id}${k}"><path d="${BODYP}"/></clipPath><g clip-path="url(#${id}${k})" stroke="none">${inner}</g>`;
  Object.assign(SBR.art.PARTS.hat, {
    // Tamaki Damo: a blond comb-over across a bald dome
    jl_combover: (c, c2, p) => `<path d="M31 50 Q29 27 50 26 Q71 27 69 50 Q67 40 60 36 Q50 33 40 36 Q33 40 31 50Z" fill="${p.skin}"/>
      <path d="M30 47 Q31 31 46 29 Q62 27 70 38 Q66 36 58 35 Q44 34 36 40 Q32 43 30 47Z" fill="${c}"/>
      <path d="M34 42 Q44 32 64 33 M36 38 Q48 30 62 31" fill="none" stroke-width=".9"/>
      <path d="M40 34 Q48 31 56 31" fill="none" stroke="#fff" stroke-width="1.2" opacity=".6"/>
      <g stroke-width="1.2"><path d="M40 96 q4 -2 8 0 l-2 6 q-2 1 -4 0z" fill="#f2c14e"/><path d="M44 96 v-4" /></g>
      ${clipBody(p._id || 'x', 'dm', `<path d="M8 104 Q50 96 92 104 L92 108 Q50 100 8 108Z" fill="${c2}"/><path d="M8 110 Q50 102 92 110 L92 112 Q50 104 8 112Z" fill="#f6ecd8"/>`)}
      <path d="M40 88 L44 96 L50 90 L56 96 L60 88" fill="#8a5a30" stroke-width="1.4"/><path d="M42 90 l2 3 M46 92 l2 -1 M54 92 l2 1 M58 90 l-2 3" stroke-width=".7"/>
      <path d="M12 112 l4 -6 2 6 M84 112 l2 -6 4 6" fill="#3a2a8a" stroke-width="1.2"/>`,
    // Yotsuyu Yagiyama: black bangs and a big leaf for a hat, studded leather on the shoulders, an H pin
    jl_leaf: (c, c2, p) => `<path d="M40 32 Q48 2 82 8 Q76 30 46 36Z" fill="${c}"/><path d="M44 34 Q60 18 80 9 M52 27 l-2 -8 M60 21 l-1 -8 M68 15 l1 -6 M56 25 l8 2 M64 19 l8 1" fill="none" stroke-width="1"/>
      <path d="M31 48 Q29 26 50 25 Q71 26 69 48 L66 42 L62 45 L58 39 L54 44 L50 38 L46 44 L42 39 L38 45 L34 42Z" fill="${p.hair}"/>
      <path d="M38 30 Q46 27 54 28" fill="none" stroke="#fff" stroke-width="1.2" opacity=".5"/>
      <path d="M46 92 h8 v6 h-8z" fill="#f2c14e" stroke-width="1.1"/><path d="M48 93 v4 M52 93 v4 M48 95 h4" stroke-width=".9"/>
      ${[[16, 108], [20, 102], [26, 98], [84, 108], [80, 102], [74, 98], [18, 116], [82, 116]].map(([x, y]) => `<path d="M${x - 2} ${y + 1.4} L${x} ${y - 2.6} L${x + 2} ${y + 1.4}Z" fill="#d0d4e0" stroke-width=".8"/>`).join('')}
      ${clipBody(p._id || 'x', 'yl', [[40, 112], [60, 110], [30, 118], [70, 118], [50, 118]].map(([x, y]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<ellipse cy="-2.4" rx="1.8" ry="2.4" transform="rotate(${a})" fill="${c2}"/>`).join('')}<circle r="1.2" fill="#f2c14e"/></g>`).join(''))}`,
    // Dolomite: long unkempt silver hair, a cracked rock face with a triangle above the nose, a striped jacket
    jl_dolo: (c, c2, p) => `<path d="M30 52 Q27 23 50 23 Q73 23 70 52 L67 40 L63 48 L59 36 L55 46 L50 34 L45 46 L41 36 L37 48 L33 40Z" fill="${c}"/>
      <path d="M36 30 l4 10 M46 26 l2 10 M58 27 l-1 10 M64 31 l-3 9" fill="none" stroke-width=".8"/>
      <path d="M47 51 L53 51 L50 46Z" fill="none" stroke-width="1.2"/>
      <path d="M35 60 l4 2 l-1 4 l3 2 M64 58 l-3 3 l2 3 M56 78 l2 -3 l3 1" fill="none" stroke-width="1"/>
      ${clipBody(p._id || 'x', 'do', [16, 28, 40, 60, 72, 84].map(x => `<path d="M${x} 88 L${x - 6} 120" stroke="${c2}" stroke-width="3.4"/>`).join(''))}
      <path d="M30 94 L38 76 L46 92Z" fill="${p.outfit}"/><path d="M70 94 L62 76 L54 92Z" fill="${p.outfit}"/><path d="M34 88 l6 -8 M66 88 l-6 -8" stroke="${c2}" stroke-width="2"/>`,
    // Poor Tom: a shaved, spiked scalp with one round cyan patch, a tie with his name, a Led Zeppelin pin
    jl_tomhair: (c, c2, p) => `<path d="M31 48 Q30 27 50 26 Q70 27 69 48 Q60 40 50 40 Q40 40 31 48Z" fill="${p.skin}"/>
      ${[[33, 42, -3, -3], [36, 36, -2, -4], [41, 31, -1, -4], [59, 31, 1, -4], [64, 36, 2, -4], [67, 42, 3, -3]].map(([x, y, dx, dy]) => `<path d="M${x} ${y} l${dx} ${dy}" stroke="${c}" stroke-width="2.4"/><path d="M${x} ${y} l${dx} ${dy}" stroke-width=".6"/>`).join('')}
      <circle cx="50" cy="31" r="7.5" fill="${c}"/><path d="M46 36 Q50 42 54 36" fill="${c}"/>
      <path d="M36 50 q3 2 6 0 M58 50 q3 2 6 0 M38 66 q3 2 5 1 M57 67 q3 -1 5 -2" fill="none" stroke-width=".8"/>
      <path d="M48 90 L52 90 L55 110 L50 116 L45 110Z" fill="${c2}" stroke-width="1.4"/><text x="50" y="104" font-size="3.4" text-anchor="middle" font-family="Oswald,Impact,sans-serif" fill="#fff" stroke="none">TOM</text>
      <circle cx="33" cy="104" r="3.4" fill="#e8e0c8" stroke-width="1"/><path d="M31 104 h4 M33 102 v4" stroke-width=".6"/>
      <path d="M58 106 Q66 112 70 106" fill="none" stroke="#c8a040" stroke-width="1.2"/><circle cx="71" cy="108" r="3" fill="#f2c14e" stroke-width="1"/>`,
    // Wu Tomoki: a ring of pale beads for hair over dark spiked bangs; a white coat with three DoCToR tags
    jl_wuhair: (c, c2, p) => `${[[30, 50], [30, 41], [33, 33], [38, 27], [44, 23], [50, 22], [56, 23], [62, 27], [67, 33], [70, 41], [70, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${c}"/><circle cx="${x - 1.4}" cy="${y - 1.6}" r="1.3" fill="#fff" stroke="none" opacity=".8"/>`).join('')}
      <path d="M33 47 L36 32 L40 43 L44 29 L47 42 L50 28 L53 42 L56 29 L60 43 L64 32 L67 47 Q58 38 50 38 Q42 38 33 47Z" fill="${c2}"/>
      ${[[27, 102], [64, 102], [16, 94]].map(([x, y], i) => `<g transform="translate(${x} ${y}) rotate(${i === 2 ? -30 : 0})"><rect width="12" height="5" rx="1" fill="#fff" stroke-width=".9"/><text x="6" y="3.8" font-size="3.2" text-anchor="middle" font-family="Oswald,Impact,sans-serif" fill="${INK}" stroke="none">DoCToR</text></g>`).join('')}
      <path d="M44 88 L50 100 L56 88" fill="none" stroke-width="1.2"/>`,
    // Aisho: knitted sleeves tied round his head and neck, a black bodysuit with a hole in the chest
    jl_aisho: (c, c2, p) => `<path d="M31 48 Q30 28 50 27 Q70 28 69 48 L64 42 L58 46 L54 40 L48 46 L42 40 L36 46Z" fill="${p.hair}"/>
      <path d="M29 40 Q50 28 71 40 L71 46 Q50 34 29 46Z" fill="${c}"/><path d="M31 41 l3 3 3 -3 3 3 3 -3 3 3 3 -3 3 3 3 -3 3 3 3 -3 3 3 3 -3 3 3" fill="none" stroke="${c2}" stroke-width="1.1"/>
      <path d="M70 42 Q84 46 88 64 Q84 68 80 64 Q80 52 70 46Z" fill="${c}"/><path d="M76 48 l4 4 M80 52 l4 4 M82 58 l3 3" stroke="${c2}" stroke-width="1"/>
      <ellipse cx="50" cy="108" rx="7" ry="6" fill="${p.skin}"/><path d="M46 106 q4 3 8 0" fill="none" stroke-width=".7"/>
      <path d="M36 86 Q50 96 64 86 L66 94 Q50 104 34 94Z" fill="${c}"/><path d="M37 90 l3 3 3 -3 3 3 3 -3 3 3 3 -3 3 3 3 -3 3 3" fill="none" stroke="${c2}" stroke-width="1"/>
      <path d="M36 94 Q30 106 32 118 L38 118 Q37 106 42 97Z" fill="${c}"/><path d="M34 102 h6 M33 108 h5 M33 114 h5" stroke="${c2}" stroke-width="1"/>`,
    // Urban Guerrilla: a purple hood with a breathing apparatus and blue goggles with six-pronged lashes
    jl_gasmask: (c, c2, p) => `<path d="M26 62 Q23 22 50 20 Q77 22 74 62 L70 80 Q50 90 30 80Z" fill="${c}"/>
      <path d="M30 34 Q50 24 70 34 M28 48 Q50 40 72 48" fill="none" stroke-width="1" opacity=".6"/>
      ${[40, 60].map(x => `<circle cx="${x}" cy="54" r="8.4" fill="#2a3a5a"/><circle cx="${x}" cy="54" r="6" fill="${c2}"/><path d="M${x - 3} ${51} a4 4 0 0 1 4 -1.5" fill="none" stroke="#fff" stroke-width="1.2"/>
        ${[0, 1, 2, 3, 4, 5].map(i => { const a = Math.PI + i * Math.PI / 5; return `<path d="M${(x + Math.cos(a) * 8.4).toFixed(1)} ${(54 + Math.sin(a) * 8.4).toFixed(1)} l${(Math.cos(a) * 4).toFixed(1)} ${(Math.sin(a) * 4).toFixed(1)}" stroke-width="1.4"/>`; }).join('')}`).join('')}
      <path d="M34 52 L46 58" stroke-width="1.6"/><path d="M50 50 v8" stroke-width="2"/>
      <rect x="40" y="64" width="20" height="16" rx="6" fill="#6a6a7a"/><path d="M44 68 v8 M48 68 v8 M52 68 v8 M56 68 v8" stroke-width="1"/>
      <circle cx="34" cy="76" r="5" fill="#8a8a9a"/><circle cx="66" cy="76" r="5" fill="#8a8a9a"/><circle cx="34" cy="76" r="2" fill="${INK}" stroke="none"/><circle cx="66" cy="76" r="2" fill="${INK}" stroke="none"/>
      <path d="M36 104 Q43 110 50 104 Q57 110 64 104 M50 104 V116 M40 114 h6 M54 114 h6" fill="none" stroke-width="1.1" opacity=".7"/>`,
    // Toru: a round afro with a swirl on either side, earphones, teddy bears on the shoulders
    jl_afro: (c, c2, p) => `<path d="M31 45 Q30 26 50 25 Q70 26 69 45 Q66 38 62 41 Q58 34 54 39 Q50 33 46 39 Q42 34 38 41 Q34 38 31 45Z" fill="${c}"/>
      <path d="M22 50 a3.4 3.4 0 1 1 3.4 3.4 a6 6 0 1 1 -6 -6" fill="none" stroke-width="1.5"/><path d="M78 50 a3.4 3.4 0 1 0 -3.4 3.4 a6 6 0 1 0 6 -6" fill="none" stroke-width="1.5"/>
      <circle cx="31.5" cy="58" r="2.8" fill="#f6f6f6" stroke-width="1.1"/><circle cx="68.5" cy="58" r="2.8" fill="#f6f6f6" stroke-width="1.1"/>
      <path d="M31.5 61 Q34 80 44 92 L48 106 M68.5 61 Q66 80 56 92 L52 106" fill="none" stroke="#f6f6f6" stroke-width="1.6"/><path d="M31.5 61 Q34 80 44 92 L48 106 M68.5 61 Q66 80 56 92 L52 106" fill="none" stroke-width=".5"/>
      <rect x="45" y="104" width="10" height="13" rx="2" fill="#e8508a" stroke-width="1.2"/><circle cx="50" cy="112" r="2.4" fill="#f6f6f6" stroke-width=".8"/>
      ${[[22, 104], [78, 104]].map(([x, y]) => `<g transform="translate(${x} ${y})"><circle cx="-3.4" cy="-3.4" r="2" fill="#b8844a" stroke-width=".9"/><circle cx="3.4" cy="-3.4" r="2" fill="#b8844a" stroke-width=".9"/><circle r="4.2" fill="#b8844a" stroke-width="1"/><circle cx="-1.4" cy="-.6" r=".6" fill="${INK}" stroke="none"/><circle cx="1.4" cy="-.6" r=".6" fill="${INK}" stroke="none"/><ellipse cy="1.4" rx="1.6" ry="1.1" fill="#f6ecd8" stroke-width=".5"/></g>`).join('')}
      <path d="M42 96 h6 M52 98 h6 M40 112 h4 M58 112 h4" stroke-width="2.2"/>`,
    // Satoru Akefu: long hair swept back, a fur collar on a long dark coat
    jl_akefu: (c, c2, p) => `<path d="M31 47 Q29 22 50 22 Q71 22 69 47 Q66 33 50 31 Q34 33 31 47Z" fill="${c}"/>
      <path d="M36 38 Q44 26 58 26 M40 34 Q50 28 64 32 M34 44 Q38 32 48 28" fill="none" stroke-width=".8"/>
      <path d="M38 50 q4 -1 7 1 M55 51 q3 -2 7 -1" fill="none" stroke-width=".8"/><path d="M40 64 q2 3 1 6 M60 64 q-2 3 -1 6" fill="none" stroke-width=".8"/>
      <path d="M16 100 q3 -7 8 -3 q2 -8 8 -4 q3 -7 8 -1 L42 92 L36 108 Q24 110 16 100Z" fill="${c2}"/><path d="M84 100 q-3 -7 -8 -3 q-2 -8 -8 -4 q-3 -7 -8 -1 L58 92 L64 108 Q76 110 84 100Z" fill="${c2}"/>`,
  });
  // the portrait function doesn't pass its id to hats as a config field; wrap to hand it through for clip paths
  (() => {
    const H = SBR.art.PARTS.hat;
    ['jl_combover', 'jl_leaf', 'jl_dolo'].forEach(k => { const f = H[k]; H[k] = (c, c2, p, id) => f(c, c2, Object.assign({}, p, { _id: id + k }), id); });
  })();

  SBR.art.addPortrait({
    jl_wu:       { skin: '#f6dcc8', hair: '#2a2a2a', hairStyle: 'short', hat: 'jl_wuhair', hatColor: '#d8d8e0', hat2: '#2a2a30', outfit: '#f6f6f0', outfit2: '#d8d8e0', eye: '#3a9a5a', lip: '#b87a7a', bg: ['#8ab86a', '#f6f6f0'], eyes: 'narrow', brows: 'thin', mouth: 'smirk', acc: ['earring'] },
    jl_damo:     { skin: '#f0c8a0', hair: '#f2d060', hairStyle: 'bald', hat: 'jl_combover', hatColor: '#f2d060', hat2: '#e8742a', outfit: '#6a2a6a', outfit2: '#8a3a8a', eye: '#3a2a1a', lip: '#b8605a', bg: ['#e8742a', '#6a2a6a'], face: 'round', acc: ['shades'], facial: ['horseshoe', 'goatee'], mouth: 'smirk', brows: 'thick' },
    jl_yotsuyu:  { skin: '#e8d0c0', hair: '#1a1020', hairStyle: 'bob', hat: 'jl_leaf', hatColor: '#6aa04a', hat2: '#e8508a', outfit: '#2a2a30', outfit2: '#3a3a44', eye: '#1a1020', lip: '#9a6a7a', bg: ['#a0c040', '#3a2a4a'], face: 'long', eyes: 'void', brows: 'thin', mouth: 'flat' },
    jl_aisho:    { skin: '#e8c8a8', hair: '#1a1020', hairStyle: 'short', hat: 'jl_aisho', hatColor: '#c8a060', hat2: '#6a3a2a', outfit: '#1a1a22', outfit2: '#2a2a34', eye: '#4a2a1a', lip: '#9a6a6a', bg: ['#9fd0f0', '#5a6a8a'], eyes: 'sharp', brows: 'angry', mouth: 'gritted' },
    jl_dolomite: { skin: '#c0b0a0', hair: '#e8e8f0', hairStyle: 'verylong', hat: 'jl_dolo', hatColor: '#e8e8f0', hat2: '#1a1020', outfit: '#f2c14e', outfit2: '#1a1020', eye: '#3a8ad0', lip: '#7a5a5a', bg: ['#3a8ad0', '#9fe0f0'], eyes: 'glare', brows: 'bushy', mouth: 'teeth' },
    jl_thrall:   { skin: '#d8c8b8', hair: '#5a3a2a', hairStyle: 'short', hat: 'straw', hatColor: '#d8b870', hat2: '#3a8ad0', outfit: '#8a9ab0', outfit2: '#f6ecd8', eye: '#9fe0f0', lip: '#6a5a6a', bg: ['#1a4a8a', '#9fe0f0'], eyes: 'void', mouth: 'flat', brows: 'none' },
    jl_poortom:  { skin: '#c89060', hair: '#3fc8d8', hairStyle: 'bald', hat: 'jl_tomhair', hatColor: '#3fc8d8', hat2: '#c8323c', outfit: '#f6ecd8', outfit2: '#f6ecd8', eye: '#2a3a8a', lip: '#9a5a4a', bg: ['#f6ecd8', '#3a6ac8'], face: 'round', eyes: 'round', mouth: 'frown', brows: 'worried' },
    jl_guerrilla:{ skin: '#e0a880', hair: '#d8742a', hairStyle: 'short', hat: 'jl_gasmask', hatColor: '#6a3a9a', hat2: '#3fb8e8', outfit: '#e0a880', outfit2: '#8a4ab0', eye: '#6a8a7a', lip: '#9a5a4a', bg: ['#6a3a9a', '#f2c14e'], face: 'broad' },
    jl_toru:     { skin: '#f0d0b8', hair: '#3a2828', hairStyle: 'afro', hat: 'jl_afro', hatColor: '#3a2828', hat2: '#e8508a', outfit: '#2a2a3a', outfit2: '#f6ecd8', eye: '#3a2a2a', lip: '#b8707a', bg: ['#e8508a', '#2a1438'], style: 'vest', eyes: 'small', brows: 'thin', mouth: 'smile' },
    jl_akefu:    { skin: '#e8d0bc', hair: '#d8d8e0', hairStyle: 'flowing', hat: 'jl_akefu', hatColor: '#d8d8e0', hat2: '#a89880', outfit: '#2a2238', outfit2: '#5a4a6a', eye: '#6a6a8a', lip: '#9a7a7a', bg: ['#1a1020', '#8a3a8a'], style: 'duster', eyes: 'narrow', brows: 'thick', mouth: 'flat', face: 'long' },
  });

  /* ================= 2. Stand figures (120x160, thick ink like stands.js) ================= */
  (() => {
    const K = INK;
    const st = `stroke="${K}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
    const th = `stroke="${K}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"`;
    const F = (c, s = st) => `fill="${c}" ${s}`;
    const BODY = 'M40 50 Q60 42 80 50 L93 58 Q100 74 101 92 L92 96 L85 72 L82 104 L90 152 L75 152 L62 112 L58 112 L45 152 L30 152 L38 104 L35 72 L28 96 L19 92 Q20 74 27 58 Z';
    let n = 0;
    const wrap = (inner, aura = '#fff') => { const id = 'jls' + (++n); return `<svg class="stand-svg" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="${id}"><stop offset="0" stop-color="${aura}" stop-opacity=".55"/><stop offset="1" stop-color="${aura}" stop-opacity="0"/></radialGradient></defs><ellipse cx="60" cy="84" rx="58" ry="76" fill="url(#${id})"/>${inner}</svg>`; };
    const human = (c, pat, head, extra = '', behind = '', aura) => { const id = 'jlh' + (++n); return wrap(`${behind}<defs><clipPath id="${id}"><path d="${BODY}"/></clipPath></defs><path d="${BODY}" ${F(c)}/><g clip-path="url(#${id})">${pat}</g><path d="${BODY}" fill="none" ${st}/><path d="M44 62q16 6 32 0M48 80q12 4 24 0M60 50v56" stroke="${K}" stroke-width="1.3" fill="none" opacity=".4"/>${extra}${head}`, aura || c); };
    const kana = (t, x, y, s, c, r = 0) => `<text x="${x}" y="${y}" font-family="Bangers,Impact" font-size="${s}" fill="${c}" stroke="${K}" stroke-width="1" transform="rotate(${r} ${x} ${y})">${t}</text>`;
    const whorl = (x, y, s, c = K) => `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${c}" stroke-width="1.2" stroke-linecap="round">${[2.5, 5, 7.5, 10].map(r => `<path d="M${-r} 1 Q${-r} ${-r * 1.2} 0 ${-r * 1.2} Q${r} ${-r * 1.2} ${r} 1 Q${r} ${r * 0.9} ${r * 0.3} ${r * 1.1}"/>`).join('')}</g>`;

    // Vitamin C: a soft, dough-coloured figure covered in fingerprints, dripping, one palm held out
    function vitaminC() {
      const c = '#f2a860', c2 = '#d8783a';
      return wrap(`${[34, 50, 70, 88].map((x, i) => `<path d="M${x} ${144 + (i % 2) * 4} q4 10 0 14 q-4 -4 0 -14z" ${F(c, th)}/>`).join('')}
        <path d="M30 150 Q24 120 34 100 Q28 82 38 68 Q44 56 60 55 Q76 56 82 68 Q92 82 86 100 Q96 120 90 150 Q84 142 78 150 Q72 140 66 150 Q60 142 54 150 Q48 140 42 150 Q36 142 30 150Z" ${F(c)}/>
        ${whorl(48, 88, 1, c2)}${whorl(72, 104, 0.9, c2)}${whorl(52, 126, 0.8, c2)}${whorl(76, 78, 0.6, c2)}
        <path d="M38 72 Q18 88 14 112 Q12 122 20 122 Q24 104 40 90" ${F(c)}/><path d="M16 114 q-2 8 2 12 M20 118 q0 8 4 10" ${F('none', th)}/>
        <path d="M82 72 Q98 66 102 50" fill="none" stroke="${K}" stroke-width="12" stroke-linecap="round"/><path d="M82 72 Q98 66 102 50" fill="none" stroke="${c}" stroke-width="7.6" stroke-linecap="round"/>
        <g transform="translate(104 38)"><path d="M-10 8 Q-12 -4 -8 -12 L-6 -20 Q-4 -22 -2 -20 L-2 -12 L0 -24 Q2 -26 4 -24 L4 -12 L7 -22 Q9 -24 11 -21 L9 -8 Q13 -10 14 -6 Q10 4 6 10 Q-2 14 -10 8Z" ${F(c)}/>${whorl(1, -2, 0.7, c2)}</g>
        <ellipse cx="60" cy="38" rx="19" ry="21" ${F(c)}/><path d="M42 42 Q40 56 48 60 M78 42 Q80 56 72 60" fill="none" ${th}/>
        ${whorl(60, 26, 0.9, c2)}
        <ellipse cx="52" cy="40" rx="4.4" ry="6" fill="#fff" ${th}/><ellipse cx="68" cy="40" rx="4.4" ry="6" fill="#fff" ${th}/><circle cx="53" cy="42" r="2" fill="${K}"/><circle cx="67" cy="42" r="2" fill="${K}"/>
        <path d="M50 52 q3 3 5 0 q3 3 5 0 q3 3 5 0 q3 3 5 0" fill="none" stroke="${K}" stroke-width="1.6"/>
        ${kana('ドロ…', 6, 30, 16, '#f2a860', -8)}`, '#f2a860');
    }
    // I Am a Rock: a pebble-skinned humanoid with a boulder for a head; loose stones hurtle toward one point
    function iAmARock() {
      const pebbles = [[40, 60, 5], [58, 66, 6], [76, 58, 5], [48, 84, 6], [70, 86, 5], [38, 100, 4], [60, 100, 6], [80, 102, 4], [44, 124, 5], [70, 128, 5], [52, 144, 4], [80, 142, 4], [24, 80, 4], [96, 80, 4]]
        .map(([x, y, r], i) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.75}" transform="rotate(${i * 23} ${x} ${y})" fill="${i % 3 ? '#a8b0a0' : '#7a8a78'}" ${th}/>`).join('');
      const flying = [[8, 20, 10], [106, 14, 8], [112, 120, 9], [6, 128, 7]].map(([x, y, r]) => `<path d="M${x - r} ${y} L${x - r * 0.3} ${y - r} L${x + r * 0.8} ${y - r * 0.6} L${x + r} ${y + r * 0.4} L${x} ${y + r}Z" ${F('#8a9a88')}/><path d="M${x} ${y} L${60 + (x - 60) * 0.55} ${84 + (y - 84) * 0.55}" stroke="${K}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".6"/>`).join('');
      return human('#c8ccbc', pebbles,
        `<path d="M42 32 Q40 14 56 10 Q76 8 80 24 Q84 40 72 48 Q58 54 46 46 Q40 40 42 32Z" ${F('#9aa890')}/><path d="M50 16 l6 6 M70 14 l-4 8 M76 34 l-6 2" stroke="${K}" stroke-width="1.2"/>
         <path d="M48 20 Q54 12 64 14" stroke="#6aa04a" stroke-width="4" fill="none" stroke-linecap="round"/>
         <circle cx="54" cy="32" r="3.6" fill="#fff" ${th}/><circle cx="68" cy="32" r="3.6" fill="#fff" ${th}/><path d="M53 31 l3 3 M52.6 34 l3.2 -3.2 M67 31 l3 3 M66.6 34 l3.2 -3.2" stroke="${K}" stroke-width="1"/>
         <path d="M54 42 Q61 46 68 42" stroke="${K}" stroke-width="1.6" fill="none"/>`,
        `${flying}<path d="M58 80 l6 4 -6 4 -6 -4z" fill="#f2c14e" ${th}/>${kana('I AM A ROCK', 18, 156, 13, '#c8ccbc')}`, '', '#a0c040');
    }
    // Blue Hawaii: a curling wave of blue water with hollow eyes and hibiscus, footprints marching in a straight line
    function blueHawaii() {
      const hib = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map(a => `<ellipse cy="-6" rx="4.6" ry="6.4" transform="rotate(${a})" fill="#e8508a" ${th}/>`).join('')}<circle r="2.6" fill="#f2c14e" ${th}/><path d="M0 0 l6 -8" stroke="#f2c14e" stroke-width="1.6"/></g>`;
      const steps = [0, 1, 2, 3, 4].map(i => `<ellipse cx="${22 + i * 18}" cy="${150 - (i % 2) * 5}" rx="4" ry="2.4" fill="#1a4a8a" opacity=".7"/>`).join('');
      return wrap(`${steps}
        <path d="M10 140 Q8 90 36 60 Q60 36 90 40 Q112 46 110 70 Q108 88 90 88 Q78 86 80 74 Q82 64 92 66 Q88 56 76 58 Q52 66 46 96 Q42 122 60 140Z" ${F('#3a8ad0')}/>
        <path d="M18 132 Q18 96 40 70 Q60 50 84 50" fill="none" stroke="#9fe0f0" stroke-width="4" stroke-linecap="round"/>
        <path d="M30 120 Q30 100 44 84" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>
        ${[[98, 30], [110, 50], [20, 50], [16, 30]].map(([x, y]) => `<path d="M${x} ${y} q-4 7 0 10 q4 -3 0 -10z" ${F('#9fe0f0', th)}/>`).join('')}
        <ellipse cx="62" cy="96" rx="6" ry="8" fill="${K}"/><ellipse cx="80" cy="100" rx="5" ry="7" fill="${K}"/><circle cx="63" cy="94" r="1.6" fill="#9fe0f0"/><circle cx="81" cy="98" r="1.4" fill="#9fe0f0"/>
        <path d="M60 118 Q72 126 86 116 Q74 120 60 118Z" fill="${K}"/>
        ${hib(96, 76, 1)}${hib(24, 104, 0.8)}
        ${kana('BLUE HAWAII', 14, 24, 15, '#9fe0f0')}`, '#3a8ad0');
    }
    // Ozon Baby: a toy-brick White House half-buried in soil, the air bending inward toward it
    function ozonBaby() {
      const rings = [70, 58, 46].map((r, i) => `<ellipse cx="60" cy="96" rx="${r}" ry="${r * 0.8}" fill="none" stroke="#3a6ac8" stroke-width="${2.4 - i * 0.4}" stroke-dasharray="6 5" opacity="${0.45 + i * 0.15}"/>`).join('');
      const arrows = [[12, 50, 1, 1], [108, 50, -1, 1], [12, 142, 1, -1], [108, 142, -1, -1]].map(([x, y, dx, dy]) => `<path d="M${x} ${y} l${dx * 14} ${dy * 12} m${-dx * 6} 0 l${dx * 6} 0 0 ${-dy * 6}" stroke="${K}" stroke-width="2" fill="none"/>`).join('');
      return wrap(`${rings}${arrows}
        <path d="M6 132 Q60 120 114 132 L114 160 L6 160Z" ${F('#8a6a4a')}/><path d="M16 140 q6 -3 10 0 M84 144 q6 -3 12 0 M50 150 q5 -2 8 0" stroke="${K}" stroke-width="1.2" fill="none"/>
        <path d="M22 132 L22 96 L98 96 L98 132Z" ${F('#f6f6f0')}/>
        ${[30, 44, 58, 72, 86].map(x => `<rect x="${x}" y="100" width="5" height="30" fill="#e0e0e8" ${th}/>`).join('')}
        <path d="M40 96 L60 80 L80 96Z" ${F('#f6f6f0')}/><path d="M50 80 Q50 66 60 64 Q70 66 70 80Z" ${F('#f6f6f0')}/><path d="M60 64 V56" ${st}/><path d="M60 56 l8 2 -8 3" ${F('#c8323c', th)}/>
        ${[28, 40, 52, 64, 76, 88].map(x => `<ellipse cx="${x + 2}" cy="95" rx="3.4" ry="1.6" fill="#f6f6f0" ${th}/>`).join('')}
        <path d="M92 104 l6 -4 M96 116 l-5 6 M28 110 l-5 -3" stroke="${K}" stroke-width="1.4"/>
        <circle cx="54" cy="116" r="1.8" fill="${K}"/><circle cx="66" cy="116" r="1.8" fill="${K}"/><path d="M56 123 q4 3 8 0" stroke="${K}" stroke-width="1.4" fill="none"/>
        ${kana('PSSHHH', 34, 30, 16, '#9fc7e8', -6)}`, '#9fc7e8');
    }
    // Doctor Wu: a stone figure in a doctor's coat breaking apart into gravel from the feet up
    function doctorWu() {
      const grit = [...Array(26)].map((_, i) => { const x = 20 + ((i * 37) % 86), y = 118 + ((i * 53) % 40), r = 1.6 + (i % 4) * 0.8; return `<path d="M${x - r} ${y} L${x} ${y - r} L${x + r} ${y + r * 0.2} L${x + r * 0.2} ${y + r}Z" fill="${i % 2 ? '#b8b0a4' : '#8a8078'}" ${th}/>`; }).join('');
      const stream = [...Array(10)].map((_, i) => `<circle cx="${96 + i * 2.4}" cy="${70 + i * 5 - (i % 3) * 4}" r="${2.2 - i * 0.12}" fill="#a8a098" ${th}/>`).join('');
      const tags = [[44, 64], [70, 64]].map(([x, y]) => `<rect x="${x}" y="${y}" width="14" height="6" rx="1" fill="#fff" ${th}/><text x="${x + 7}" y="${y + 4.6}" font-size="4" text-anchor="middle" font-family="Oswald,Impact,sans-serif" fill="${K}">DoCToR</text>`).join('');
      const cracks = `<path d="M44 80 l6 6 -2 8 6 4 M74 90 l-4 8 4 6 M52 104 l8 4 6 -2" stroke="${K}" stroke-width="1.3" fill="none"/>`;
      const beads = [[42, 30], [42, 22], [46, 15], [53, 10], [60, 8], [67, 10], [74, 15], [78, 22], [78, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#d8d8e0" ${th}/>`).join('');
      return human('#d8d4cc', `<path d="M20 44 H100 V120 H20Z" fill="#f6f6f0" opacity=".85"/><path d="M60 50 L50 104 M60 50 L70 104" stroke="${K}" stroke-width="1.4"/>`,
        `${beads}<path d="M46 32 Q46 14 60 13 Q74 14 74 32 L70 44 Q60 48 50 44z" ${F('#c8c0b4')}/>
         <path d="M46 30 L50 20 L53 28 L57 18 L60 27 L63 18 L67 28 L70 20 L74 30 Q60 24 46 30Z" ${F('#2a2a30', th)}/>
         <path d="M51 33 l6 1.4 M69 33 l-6 1.4" stroke="${K}" stroke-width="2.6" stroke-linecap="round"/><circle cx="54" cy="34.6" r="1.2" fill="#3a9a5a"/><circle cx="66" cy="34.6" r="1.2" fill="#3a9a5a"/>
         <path d="M54 41 q6 3 12 -1" stroke="${K}" stroke-width="1.4" fill="none"/><path d="M48 24 l-3 6 M72 38 l3 4" stroke="${K}" stroke-width="1"/>`,
        `${tags}${cracks}${grit}${stream}${kana('ザラ ザラ', 84, 20, 12, '#d8d4cc', 8)}`, '', '#c8c0b4');
    }
    // Doobie Wah!: a knee-high tornado with two holes for eyes, cutting at its base
    function doobieWah() {
      const layers = [[60, 18, 44, 11], [62, 38, 36, 10], [60, 58, 30, 9], [58, 78, 24, 8], [60, 98, 18, 7], [62, 116, 13, 6], [60, 132, 9, 5]];
      const funnel = layers.map(([x, y, rx, ry], i) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${i % 2 ? '#c8d8e8' : '#e8f0f8'}" ${st}/>`).join('');
      const swirl = layers.slice(0, -1).map(([x, y, rx], i) => `<path d="M${x - rx * 0.8} ${y + 3} Q${x} ${y + 12} ${x + rx * 0.8} ${y + 3}" stroke="${K}" stroke-width="1.2" fill="none" opacity=".55"/>`).join('');
      const debris = [[24, 140], [96, 138], [34, 152], [86, 154], [16, 124], [104, 120]].map(([x, y], i) => `<path d="M${x} ${y} l${i % 2 ? 6 : -6} -3 l2 5z" fill="${i % 2 ? '#c8a060' : '#8a6a4a'}" ${th}/>`).join('');
      return wrap(`${funnel}${swirl}
        <ellipse cx="50" cy="40" rx="5" ry="6" fill="${K}"/><ellipse cx="72" cy="40" rx="5" ry="6" fill="${K}"/><circle cx="51" cy="38" r="1.4" fill="#fff"/><circle cx="73" cy="38" r="1.4" fill="#fff"/>
        <path d="M52 146 l-8 8 M60 146 v10 M68 146 l8 8" stroke="${K}" stroke-width="2.2"/><path d="M44 142 Q60 150 76 142" stroke="#c8323c" stroke-width="2.4" fill="none"/>
        ${debris}
        ${[0, 1, 2].map(i => `<path d="M${10 + i * 6} ${60 + i * 24} q10 -6 20 0" stroke="#fff" stroke-width="2.4" fill="none" opacity=".8"/><path d="M${110 - i * 6} ${70 + i * 20} q-10 -6 -20 0" stroke="#fff" stroke-width="2.4" fill="none" opacity=".8"/>`).join('')}
        ${kana('DOOBIE WAH!', 22, 154, 14, '#e8f0f8', -4)}`, '#9fd0f0');
    }
    // Brain Storm: three golden six-piece burr puzzles, eating holes in the air, dripping
    function brainStorm() {
      const burr = (x, y, s, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">
        <rect x="-18" y="-5" width="36" height="10" ${F('#f2c14e')}/><rect x="-5" y="-18" width="10" height="36" ${F('#e8a020')}/>
        <path d="M-12 -12 L12 12 M-12 12 L12 -12" stroke="${K}" stroke-width="7.4" stroke-linecap="square"/><path d="M-12 -12 L12 12 M-12 12 L12 -12" stroke="#8a4ab0" stroke-width="4.6" stroke-linecap="square"/>
        <rect x="-5" y="-5" width="10" height="10" ${F('#fff3a0', th)}/><path d="M-16 -3 h8 M8 3 h8 M-3 -16 v8" stroke="#fff" stroke-width="1.2" opacity=".7"/></g>`;
      const drips = [[38, 70], [78, 102], [52, 130]].map(([x, y]) => `<path d="M${x} ${y} q-4 10 0 16 q4 -6 0 -16z" ${F('#c8323c', th)}/>`).join('');
      const holes = [[20, 40], [100, 30], [96, 140], [18, 118]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#2a1438" ${th}/><circle cx="${x}" cy="${y}" r="8" fill="none" stroke="#8a4ab0" stroke-width="1.4" stroke-dasharray="2 2"/>`).join('');
      return wrap(`${holes}${burr(40, 52, 1.2, 12)}${burr(80, 86, 1.4, -20)}${burr(46, 116, 1, 40)}${drips}
        ${kana('BRAIN STORM', 18, 156, 14, '#f2c14e')}`, '#8a4ab0');
    }
    // Wonder of U: the old hospital director, long hair flowing, calamities falling all around him
    function wonderOfU() {
      const drops = [[18, 40], [30, 20], [98, 26], [108, 60], [14, 90], [104, 112]].map(([x, y]) => `<path d="M${x} ${y} l3 12 -6 0z" ${F('#9fd0f0', th)}/>`).join('');
      const sign = `<g transform="translate(94 20) rotate(24)"><rect x="-16" y="-8" width="32" height="16" ${F('#f2c14e')}/><text x="0" y="4" font-size="8" text-anchor="middle" font-family="Oswald,Impact,sans-serif" fill="${K}">SALOON</text><path d="M-12 -8 v-8 M12 -8 v-8" stroke="${K}" stroke-width="1.4"/></g>`;
      const splinter = `<path d="M10 128 L30 112 L32 115 L13 131Z" ${F('#b8844a', th)}/>`;
      return human('#2a2238', `<path d="M20 60 H100 V160 H20Z" fill="#3a3050"/><path d="M60 50 V150" stroke="#5a4a6a" stroke-width="3"/><path d="M40 70 L60 90 L80 70" fill="none" stroke="#a89880" stroke-width="3"/>`,
        `<path d="M44 34 Q40 12 60 10 Q80 12 76 34 Q86 50 84 70 L76 58 Q76 40 70 30 Q60 26 50 30 Q44 40 44 58 L36 70 Q34 50 44 34Z" ${F('#d8d8e0')}/>
         <path d="M48 34 Q48 18 60 17 Q72 18 72 34 L69 46 Q60 50 51 46z" ${F('#e8d0bc')}/>
         <path d="M48 26 Q60 14 72 26 Q64 20 60 21 Q56 20 48 26Z" ${F('#d8d8e0', th)}/>
         <path d="M52 33 h6 M62 33 h6" stroke="${K}" stroke-width="2.2"/><path d="M52 29 q3 -2 6 0 M62 29 q3 -2 6 0" stroke="${K}" stroke-width="1.6" fill="none"/>
         <path d="M55 42 h10" stroke="${K}" stroke-width="1.4"/><path d="M52 38 q1 3 0 5 M68 38 q-1 3 0 5" stroke="${K}" stroke-width=".9" fill="none"/>`,
        `<path d="M30 58 q6 -8 12 -2 q4 -8 10 -2 L50 66 Q40 70 30 58Z M90 58 q-6 -8 -12 -2 q-4 -8 -10 -2 L70 66 Q80 70 90 58Z" ${F('#a89880')}/>${drops}${sign}${splinter}
         ${kana('厄災', 84, 150, 18, '#e8508a', -10)}`, '', '#8a3a8a');
    }
    Object.assign(SBR.stands.DEFS, {
      jl_vitaminc: { name: 'Vitamin C', entity: true, draw: vitaminC },
      jl_iamarock: { name: 'I Am a Rock', entity: true, draw: iAmARock },
      jl_bluehawaii: { name: 'Blue Hawaii', draw: blueHawaii },
      jl_ozonbaby: { name: 'Ozon Baby', draw: ozonBaby },
      jl_doctorwu: { name: 'Doctor Wu', entity: true, draw: doctorWu },
      jl_doobiewah: { name: 'Doobie Wah!', entity: true, draw: doobieWah },
      jl_brainstorm: { name: 'Brain Storm', draw: brainStorm },
      jl_wonderofu: { name: 'Wonder of U', entity: true, draw: wonderOfU },
    });
    const MAP = { jl_damo: 'jl_vitaminc', jl_yotsuyu: 'jl_iamarock', jl_dolomite: 'jl_bluehawaii', jl_thrall: 'jl_bluehawaii', jl_poortom: 'jl_ozonbaby',
      jl_wu: 'jl_doctorwu', jl_aisho: 'jl_doobiewah', jl_guerrilla: 'jl_brainstorm', jl_akefu: 'jl_wonderofu', jl_toru: 'jl_wonderofu' };
    const base = SBR.stands.keyFor;
    SBR.stands.keyFor = (u, abilityId) => (u && u.side === 'enemy' && MAP[u.id]) || base(u, abilityId);
  })();

  /* ================= 3. Statuses ================= */
  Object.assign(SBR.STATUS, {
    jl_soft: { name: 'Softened', glyph: '柔', color: '#f2a860', kind: 'debuff', mode: 'stacks', max: 3, mods: { dodgePer: -0.08 }, res: { phys: 0.2, bullet: 0.2 },
      desc: s => `Vitamin C handprints (${s}/3): the body is soft as dough. -${8 * s}% dodge, +20% Physical and Gunshot damage taken. At 3 the rider melts into a puddle for a turn.` },
    jl_attract: { name: 'Attracting', glyph: '引', color: '#a0c040', kind: 'debuff', mode: 'turns',
      desc: () => 'I Am a Rock: loose objects are drawn to this rider. At the start of each round, while Yotsuyu stands, something heavy flies at them.' },
    jl_hawaii: { name: 'Blue Hawaii', glyph: '青', color: '#3a8ad0', kind: 'debuff', mode: 'turns', mods: { dmgOut: 0.8, dodge: -0.15 },
      desc: () => 'Splashed with a thrall\'s blood: the body keeps trying to walk in a straight line. -20% damage dealt, -15% dodge.' },
    jl_pressure: { name: 'Low Pressure', glyph: '圧', color: '#3a6ac8', kind: 'debuff', mode: 'stacks', max: 6, mods: { dodgePer: -0.03 },
      desc: s => `Ozon Baby thins the air (${s}/6): -${3 * s}% dodge. Poor Tom's Depressurize bursts every stack at once.` },
    jl_pursued: { name: 'Pursued', glyph: '渦', color: '#9fd0f0', kind: 'debuff', mode: 'turns',
      desc: () => 'Doobie Wah! follows this rider\'s breath. At the start of each round the tornado cuts them, unless they Brace (hold their breath).' },
  });
  (() => {
    const I = SBR.icons, st = I.st, K = I.K;
    const glyph = (c, g) => `<circle cx="24" cy="24" r="18" fill="${c}" ${st}/><text x="24" y="31" font-size="20" text-anchor="middle" font-family="serif" fill="#fff" stroke="${K}" stroke-width="1" paint-order="stroke">${g}</text>`;
    Object.entries({ jl_soft: ['#d8783a', '柔'], jl_attract: ['#6a8a3a', '引'], jl_hawaii: ['#3a8ad0', '青'], jl_pressure: ['#3a6ac8', '圧'], jl_pursued: ['#5a8ab0', '渦'] })
      .forEach(([id, [c, g]]) => I.define('status', id, () => glyph(c, g)));
  })();

  /* ================= 4. Enemies ================= */
  /** the damage event that just hit this unit (hooks run right after it is pushed) */
  const lastHit = x => { const ev = x.c.events; for (let i = ev.length - 1; i >= 0 && i >= ev.length - 8; i--) if (ev[i].t === 'dmg' && ev[i].uid === x.user.uid) return ev[i]; return null; };
  const srcOf = (x, e) => (e && e.src != null ? x.c.unit(e.src) : null);
  const float = (x, u, text, cls = 'debuff big') => u && x.c.push({ t: 'float', uid: u.uid, text, cls });
  const soften = (x, t) => {
    if (!t || t.dead) return;
    x.status(t, 'jl_soft', 1);
    if (x.stacks(t, 'jl_soft') >= 3) { x.removeStatus(t, 'jl_soft'); x.status(t, 'stun', 0, 1); float(x, t, 'MELTED'); x.log(`${t.name} slumps into a puddle of flesh.`); }
  };
  const mostSoft = x => x.enemies.slice().sort((a, b) => x.stacks(b, 'jl_soft') - x.stacks(a, 'jl_soft'))[0] || x.target;
  const THINGS = ['A flowerpot', 'A sack of chestnuts', 'A horseshoe', 'A milk churn', 'A rusted plough blade', 'A church-bell clapper', 'A tin of pesticide', 'A fence post', 'A dead crow'];
  const CALAMITY = ['A shop sign drops off its bracket', 'A splinter drives under a fingernail', 'A drop of rain hits like a bullet', 'A horse kicks out of nowhere', 'A loose nail flies from a boardwalk', 'A pane of glass slips from a window', 'A wagon wheel rolls downhill'];

  Object.assign(SBR.ENEMIES, {
    /* ---- Wu Tomoki: Doctor Wu ---- */
    jl_wu: { name: 'Wu Tomoki', title: 'The Doctor With Three Name Tags', art: port('jl_wu'), tier: 'elite', hp: 52, stats: { aim: 4, grit: 5 }, xp: 24, money: [30, 45], dtype: 'stand',
      res: { bullet: 0.3, phys: 0.2, spin: -0.2, cold: -0.1 },
      stand: 'Doctor Wu', sigil: 'grid', sigilColor: '#d8d4cc', quote: 'I am a doctor. That part is true. Now hold still while I get into your bones.',
      passive: 'A Rock Human who crumbles into gravel at will: bullets and fists scatter the stones (resists Gunshot and Physical), Spin grinds them. The first time he is badly hurt he bursts apart and reforms.',
      abilities: [
        { name: 'Gravel Scalpel', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 5, { grit: 0.03 }); if (r.hit) x.status(x.target, 'bleed', 1); } },
        { name: 'Allergic Reaction', w: 2, cd: 3, target: 'allEnemies', fx: 'spray', run: x => { x.enemies.forEach(e => { x.dmg(e, 2, {}); x.status(e, 'vuln', 0, 1); }); x.log('Stone dust gets under everyone\'s skin. Hives, streaming eyes.'); } },
        { name: 'Bone Possession', w: 2, cd: 3, target: 'enemy', fx: 'debuff', run: x => { const r = x.dmg(x.target, 7, { grit: 0.03 }, { noDodge: true, label: 'BONE' }); if (r.hit) { x.status(x.target, 'weak', 0, 2); x.log(`Gravel fuses with ${x.target.name}'s skeleton. Their own arm swings back at them.`); } } },
        { name: 'Scatter', w: 1, cd: 4, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'evasive', 0, 2); x.status(x.user, 'shield', 8); } },
      ],
      hooks: { damaged: x => { if (!x.flag('jlWuBurst') && x.user.hp < x.user.maxHp * 0.5) { x.setFlag('jlWuBurst'); x.cleanse(x.user, 99); x.status(x.user, 'evasive', 0, 2); float(x, x.user, 'GRAVEL', 'buff big'); x.log('Wu bursts into a cloud of gravel and pulls himself back together behind you.'); } } } },

    /* ---- Tamaki Damo: Vitamin C ---- */
    jl_damo: { name: 'Tamaki Damo', title: 'The Man in the Velvet Tracksuit', art: port('jl_damo'), tier: 'elite', hp: 62, stats: { grit: 6, luck: 5 }, xp: 28, money: [45, 70], dtype: 'stand',
      res: { phys: 0.15, holy: -0.1 },
      stand: 'Vitamin C', sigil: 'drops', sigilColor: '#f2a860', quote: 'I\'m twenty-three years old. Say otherwise and I\'ll fold you up and post you home.',
      passive: 'Vitamin C: every handprint he leaves makes you softer (Softened: less dodge, more Physical and Gunshot damage taken). Softened three times, a rider melts into a puddle for a turn. His prints are on everything.',
      abilities: [
        { name: 'Handprint', w: 3, target: 'enemy', fx: 'hit', run: x => { const r = x.dmg(x.target, 4, { grit: 0.03 }); if (r.hit) soften(x, x.target); } },
        { name: 'Prints on Everything', w: 2, cd: 3, target: 'allEnemies', fx: 'spray', run: x => { x.enemies.forEach(e => { if (x.roll(0.5)) soften(x, e); }); x.log('His fingerprints are on the saddle horn, the canteen, the reins.'); } },
        { name: 'Slide a Banknote Through', w: 2, cd: 2, target: 'enemy', fx: 'claw', run: x => { const t = mostSoft(x); const s = x.stacks(t, 'jl_soft'); x.dmg(t, 5 + 4 * s, { grit: 0.03 }, { label: s ? 'FLATTEN' : null }); } },
        { name: 'Twenty-Three Years Old', w: 1, cd: 4, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'shield', 10); x.status(x.user, 'empower', 0, 2); x.say(x.user, 'Twenty-three! Don\'t you dare laugh.'); } },
      ] },

    /* ---- Yotsuyu Yagiyama: I Am a Rock ---- */
    jl_yotsuyu: { name: 'Yotsuyu Yagiyama', title: 'The Rock Human With a Leaf Hat', art: port('jl_yotsuyu'), tier: 'elite', hp: 58, stats: { aim: 6, grit: 4 }, xp: 26, money: [35, 55], dtype: 'stand',
      res: { bullet: 0.2, phys: 0.1, spin: -0.1 },
      stand: 'I Am a Rock', sigil: 'magnet', sigilColor: '#a0c040', quote: 'I only touched your shoulder. Everything else that happens now is just nature.',
      passive: 'I Am a Rock: whoever he touches starts attracting things. At the start of every round, while he stands, something heavy flies at each Attracting rider. He can pull stones through anyone in the way.',
      abilities: [
        { name: 'A Touch on the Shoulder', w: 3, target: 'enemy', fx: 'hit', run: x => { const r = x.dmg(x.target, 4, { aim: 0.03 }); if (r.hit) x.status(x.target, 'jl_attract', 0, 3); } },
        { name: 'Rocks to Me', w: 2, cd: 2, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => x.dmg(e, x.has(e, 'jl_attract') ? 6 : 3, { aim: 0.02 }, { dtype: 'phys' })) },
        { name: 'Pesticide Can', w: 2, cd: 3, target: 'enemy', fx: 'spray', run: x => { const t = x.enemies.find(e => x.has(e, 'jl_attract')) || x.target; x.dmg(t, 5, {}); x.status(t, 'blind', 0, 1); x.status(t, 'weak', 0, 1); } },
        { name: 'Stone Skin', w: 1, cd: 4, target: 'self', fx: 'buff', run: x => x.status(x.user, 'shield', 12) },
      ],
      hooks: { roundStart: x => x.enemies.filter(e => x.has(e, 'jl_attract')).forEach(e => { x.dmg(e, 4, {}, { noDodge: true, dtype: 'phys', label: 'THUNK' }); x.log(`${U.pick(THINGS)} flies across the road and hits ${e.name}.`); }) } },

    /* ---- Aisho Dainenjiyama: Doobie Wah! ---- */
    jl_aisho: { name: 'Aisho Dainenjiyama', title: 'The Man on the Fence Post', art: port('jl_aisho'), tier: 'elite', hp: 50, stats: { ride: 6, luck: 6 }, xp: 28, money: [40, 60], dtype: 'stand',
      res: { phys: 0.2, bullet: 0.2, cold: -0.2 },
      stand: 'Doobie Wah!', sigil: 'spiral', sigilColor: '#9fd0f0', quote: 'I don\'t have to do anything. It follows your breath. Try not breathing.',
      passive: 'Doobie Wah! is automatic: a small tornado that chases whoever is breathing hardest (the rider with the most Energy). At the start of each round it cuts the Pursued rider, unless they Brace and hold their breath.',
      abilities: [
        { name: 'Breath Trail', w: 3, target: 'enemy', fx: 'claw', run: x => { x.dmg(x.target, 4, { luck: 0.02 }); x.status(x.target, 'jl_pursued', 0, 2); } },
        { name: 'The Tornado\'s Base', w: 2, cd: 2, target: 'enemy', fx: 'aoe', run: x => { const t = x.enemies.find(e => x.has(e, 'jl_pursued')) || x.target; const r = x.dmg(t, 7, { luck: 0.03 }, { dtype: 'bleed', label: 'ZUOOO' }); if (r.hit) x.status(t, 'bleed', 2); } },
        { name: 'Twin Vortex', w: 1, cd: 4, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => { x.dmg(e, 3, {}, { dtype: 'bleed' }); if (x.roll(0.3)) x.status(e, 'jl_pursued', 0, 2); }) },
        { name: 'Sit Very Still', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'evasive', 0, 2); x.status(x.user, 'guard', 0, 1); } },
      ],
      hooks: {
        start: x => x.status(x.user, 'evasive', 0, 2),
        roundStart: x => {
          if (!x.enemies.some(e => x.has(e, 'jl_pursued'))) { const t = x.enemies.slice().sort((a, b) => (b.energy || 0) - (a.energy || 0))[0]; if (t) x.status(t, 'jl_pursued', 0, 2); }
          x.enemies.filter(e => x.has(e, 'jl_pursued')).forEach(e => {
            if (x.has(e, 'guard')) { float(x, e, 'HELD BREATH', 'buff'); return; }
            const r = x.dmg(e, 5, {}, { noDodge: true, dtype: 'bleed', label: 'DOOBIE WAH!' }); if (r.hit) x.status(e, 'bleed', 1);
          });
        },
      } },

    /* ---- Dolomite: Blue Hawaii ---- */
    jl_dolomite: { name: 'Dolomite', title: 'The Man in the Blue Bathtub', art: port('jl_dolomite'), tier: 'elite', hp: 64, stats: { res: 7, grit: 5 }, xp: 30, money: [40, 60], dtype: 'stand',
      res: { phys: 0.1, bullet: 0.1, cold: -0.1, spin: -0.1 },
      stand: 'Blue Hawaii', sigil: 'drops', sigilColor: '#3a8ad0', quote: 'They\'ll walk through walls for me. Through rivers. Through you.',
      passive: 'Blue Hawaii: anyone who touches his water, or a victim\'s blood, walks at his target and will not stop. He hides behind his thralls (a 6-point Shield every turn while one stands). Kill a thrall and its blood splashes you.',
      abilities: [
        { name: 'Blue Water', w: 3, target: 'enemy', fx: 'spray', run: x => { const r = x.dmg(x.target, 4, { res: 0.03 }); if (r.hit && x.roll(0.4)) x.status(x.target, 'jl_hawaii', 0, 2); } },
        { name: 'Another Walker', w: 2, cd: 3, target: 'self', fx: 'buff', cond: x => x.allies.length < 4, run: x => { x.summon('jl_thrall'); x.log('A farmhand puts down his pitchfork and starts walking toward you in a perfectly straight line.'); } },
        { name: 'Cracked Teeth', w: 2, target: 'enemy', fx: 'claw', run: x => x.dmg(x.target, 6, { grit: 0.03 }) },
        { name: 'All in a Line', w: 1, cd: 3, target: 'allAllies', fx: 'buff', run: x => { x.allies.forEach(a => x.status(a, 'empower', 0, 2)); x.log('Every thrall turns its head toward the same rider.'); } },
      ],
      hooks: { turnStart: x => { if (x.allies.some(a => a !== x.user && !a.dead && a.id === 'jl_thrall')) x.status(x.user, 'shield', 6); } } },
    jl_thrall: { name: 'Blue Hawaii Walker', art: port('jl_thrall'), hp: 22, stats: { grit: 4 }, xp: 6, money: [2, 8], dtype: 'phys', res: { phys: 0.1, cold: -0.1 },
      passive: 'Controlled by Blue Hawaii. It walks in a straight line and will not stop. Its blood carries the control to whoever kills it.',
      abilities: [
        { name: 'Walk Straight Through', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 5, { grit: 0.02 }, { noDodge: true, label: 'STEP' }) },
        { name: 'Grab and Hold', w: 1, cd: 2, target: 'enemy', fx: 'hit', run: x => { x.dmg(x.target, 3, {}); x.status(x.target, 'hooked', 0, 1); } },
      ],
      hooks: { death: x => { const k = srcOf(x, lastHit(x)); if (k && k.side === 'party' && !k.dead) { x.status(k, 'jl_hawaii', 0, 2); x.log(`The walker's blood splashes ${k.name}. Their feet want to walk somewhere.`); } } } },

    /* ---- Poor Tom: Ozon Baby ---- */
    jl_poortom: { name: 'Poor Tom', title: 'The Boy With a Toy White House', art: port('jl_poortom'), tier: 'elite', hp: 70, stats: { res: 8, luck: 5 }, xp: 34, money: [45, 70], dtype: 'stand',
      res: { bullet: 0.15, phys: 0.1, cold: 0.2 },
      stand: 'Ozon Baby', sigil: 'clock', sigilColor: '#3a6ac8', quote: 'I buried it. You\'ll never find it. The air goes away the closer you get.',
      passive: 'Ozon Baby is buried somewhere in this clearing. Every round the air thins: every rider gains Low Pressure (and Poor Tom, inside his own zone, takes 2). Depressurize bursts every stack at once.',
      abilities: [
        { name: 'Pressure Pop', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 4 + 1.5 * x.stacks(x.target, 'jl_pressure'), { res: 0.03 }) },
        { name: 'Depressurize', w: 2, cd: 3, target: 'allEnemies', fx: 'boom', cond: x => x.enemies.some(e => x.stacks(e, 'jl_pressure') >= 2),
          run: x => { x.enemies.forEach(e => { const s = x.stacks(e, 'jl_pressure'); if (!s) return; x.dmg(e, 2 + 1.6 * s, {}, { noDodge: true, dtype: 'true', label: 'BURST' }); x.removeStatus(e, 'jl_pressure'); }); x.log('Ears pop. Noses bleed. The air rushes back all at once.'); } },
        { name: 'Tantrum', w: 2, cd: 2, target: 'enemy', fx: 'hit', run: x => { const r = x.dmg(x.target, 6, { luck: 0.03 }); if (r.hit && x.roll(0.3)) x.status(x.target, 'stun', 0, 1); } },
        { name: 'Pat the Soil Flat', w: 1, cd: 4, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'shield', 14); x.log('Poor Tom pats the earth flat over something small and white.'); } },
      ],
      hooks: { roundStart: x => { x.enemies.forEach(e => x.status(e, 'jl_pressure', 1)); if (x.user.hp > 3) x.c.applyHp(x.user, 2, false, 'PRESSURE', null); } } },

    /* ---- Urban Guerrilla: Brain Storm ---- */
    jl_guerrilla: { name: 'Urban Guerrilla', title: 'The Surgeon Who Makes Holes', art: port('jl_guerrilla'), tier: 'elite', hp: 80, stats: { grit: 9, aim: 6 }, xp: 38, money: [55, 80], dtype: 'bleed',
      res: { phys: 0.2, bleed: 0.3, bullet: 0.1, holy: -0.1 },
      stand: 'Brain Storm', sigil: 'grid', sigilColor: '#f2c14e', quote: 'Bacteria don\'t hate you. They\'re just hungry. So am I.',
      passive: 'Brain Storm: burr puzzles that melt flesh like bacteria. Hit him with your body (Physical) and the Stand eats your hand. The holes it bores keep burrowing.',
      abilities: [
        { name: 'Burr Puzzle', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 5, { grit: 0.03 }, { dtype: 'bleed' }); if (r.hit) x.status(x.target, 'bleed', 2); } },
        { name: 'Hemolysis', w: 2, cd: 2, target: 'enemy', fx: 'claw', run: x => { const t = x.enemies.slice().sort((a, b) => x.stacks(b, 'bleed') - x.stacks(a, 'bleed'))[0] || x.target; x.dmg(t, 4 + 2 * x.stacks(t, 'bleed'), { grit: 0.03 }, { dtype: 'bleed', label: 'HEMOLYSIS' }); } },
        { name: 'Bore a Hole', w: 1, cd: 3, target: 'enemy', fx: 'spray', run: x => { const r = x.dmg(x.target, 3, {}, { dtype: 'bleed' }); if (r.hit) x.status(x.target, 'holed', 1); } },
        { name: 'Rock Human Patience', w: 1, cd: 4, target: 'self', fx: 'buff', run: x => { x.cleanse(x.user, 99); x.status(x.user, 'shield', 12); } },
      ],
      hooks: { damaged: x => { const e = lastHit(x), s = srcOf(x, e); if (!s || s.side !== 'party' || s.dead || !e || e.dtype !== 'phys' || !(e.amount > 0)) return; x.dmg(s, 3, {}, { noDodge: true, noCrit: true, dtype: 'bleed', label: 'MELT' }); x.status(s, 'bleed', 1); } } },

    /* ---- Toru and Satoru Akefu: Wonder of U ---- */
    jl_akefu: { name: 'Satoru Akefu', title: 'Wonder of U', art: port('jl_akefu'), tier: 'elite', hp: 90, stats: { res: 9, grit: 6 }, xp: 40, money: [40, 60], dtype: 'stand',
      res: { bullet: 0.1, phys: 0.1, stand: 0.1 },
      stand: 'Wonder of U', sigil: 'clock', sigilColor: '#8a3a8a', quote: 'Everyone chases something. The fruit. The Corpse. The finish line. Chasing is what brings calamity.',
      passive: 'WONDER OF U: pursuing him or Toru is punished. Whoever damages either of them suffers a calamity (true damage). Spin that never stops is not pursuit: Spin damage slips past it. Wounds over time do not count.',
      abilities: [
        { name: 'Calamity', w: 3, target: 'enemy', fx: 'debuff', run: x => { x.dmg(x.target, 7, { res: 0.03 }, { label: 'CALAMITY' }); x.log(`${U.pick(CALAMITY)}.`); } },
        { name: 'Rain Like Needles', w: 2, cd: 2, target: 'allEnemies', fx: 'rain', run: x => x.enemies.forEach(e => x.dmg(e, 4, { res: 0.02 }, { noDodge: true })) },
        { name: 'The Director\'s Rounds', w: 1, cd: 3, target: 'allAllies', fx: 'heal', cond: x => x.allies.some(a => a.hp < a.maxHp * 0.7), run: x => x.allies.forEach(a => x.heal(a, Math.round(a.maxHp * 0.12), {})) },
        { name: 'Do Not Follow', w: 1, cd: 4, target: 'allEnemies', fx: 'debuff', run: x => { x.enemies.forEach(e => x.status(e, 'fear', 0, 1)); x.say(x.user, 'Stop following us.'); } },
      ] },
    jl_toru: { name: 'Toru', title: 'The Young Man With Earphones', art: port('jl_toru'), tier: 'elite', hp: 56, stats: { luck: 10, res: 6 }, xp: 40, money: [60, 90], dtype: 'phys',
      res: { stand: 0.1 },
      stand: 'Wonder of U', sigil: 'heart', sigilColor: '#e8508a', quote: 'You can\'t catch me. Nobody can. It\'s just a law, like gravity.',
      passive: 'The Wonder of U\'s user. Chasing him brings calamity; he is never quite where you look (starts Evasive). If he falls, the Wonder of U fades with him.',
      abilities: [
        { name: 'Pruning Shears', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 5, { luck: 0.03 }, { dtype: 'bleed' }); if (r.hit) x.status(x.target, 'bleed', 1); } },
        { name: 'Earphones In', w: 2, cd: 3, target: 'self', fx: 'buff', run: x => x.status(x.user, 'evasive', 0, 2) },
        { name: 'Locacaca', w: 1, cd: 4, target: 'self', fx: 'heal', cond: x => x.user.hp < x.user.maxHp * 0.6, run: x => { x.heal(x.user, Math.round(x.user.maxHp * 0.3), {}); x.status(x.user, 'vuln', 0, 1); x.log('He bites into a strange fruit. His wounds close, and something else opens.'); } },
      ],
      hooks: { start: x => x.status(x.user, 'evasive', 0, 2),
        death: x => { x.allies.filter(a => a.id === 'jl_akefu' && !a.dead).forEach(a => { x.kill(a); x.log('The old man is simply not there any more, like a rumour nobody repeats.'); }); } } },
  });
  // the law of calamity: both halves of the Wonder of U punish whoever hurts them (Spin and damage-over-time excepted)
  const calamity = x => {
    const e = lastHit(x), s = srcOf(x, e);
    if (!s || s.side !== 'party' || s.dead || !e || !(e.amount > 0)) return;
    if (e.dtype === 'spin') { if (!x.flag('jlSpinNote')) { x.setFlag('jlSpinNote'); float(x, s, 'NOT PURSUIT', 'buff big'); x.log('A rotation that never ends never arrives. The calamity can\'t find a pursuer.'); } return; }
    if (!x.roll(0.65)) return;
    x.dmg(s, Math.min(5, 1 + e.amount * 0.12), {}, { noDodge: true, noCrit: true, dtype: 'true', label: 'CALAMITY' });
    x.log(`${U.pick(CALAMITY)}, and ${s.name} is hurt.`);
  };
  ['jl_akefu', 'jl_toru'].forEach(k => { const E = SBR.ENEMIES[k]; E.hooks = Object.assign({}, E.hooks, { damaged: calamity }); });

  Object.assign(SBR.DROPS, {
    jl_wu: [['bone', 0.7, 1, 2], ['herb', 0.6, 1, 2], ['scrap', 0.4, 1, 1]],
    jl_damo: [['cloth', 0.8, 1, 2], ['gold', 0.4, 1, 1], ['silver', 0.5, 1, 1]],
    jl_yotsuyu: [['fossil', 0.6, 1, 2], ['scrap', 0.6, 1, 2], ['herb', 0.4, 1, 1]],
    jl_aisho: [['cloth', 0.8, 1, 2], ['leather', 0.5, 1, 1], ['rainvial', 0.25, 1, 1]],
    jl_dolomite: [['rainvial', 0.5, 1, 1], ['bone', 0.6, 1, 2], ['silver', 0.4, 1, 1]],
    jl_thrall: [['cloth', 0.3, 1, 1]],
    jl_poortom: [['scrap', 0.8, 1, 2], ['silver', 0.5, 1, 2], ['menger', 0.2, 1, 1]],
    jl_guerrilla: [['bone', 0.8, 1, 2], ['sap', 0.4, 1, 1], ['gold', 0.4, 1, 1]],
    jl_akefu: [['cloth', 0.7, 1, 2], ['gold', 0.5, 1, 1]],
    jl_toru: [['sap', 0.6, 1, 2], ['gold', 0.6, 1, 2], ['menger', 0.3, 1, 1]],
  });

  /* ================= 5. The encounters ================= */
  const E = [];
  /** event + its consequences: C[i] belongs to choices[i]; C[i].fail to its failed check */
  const ev = (o, C) => {
    E.push(Object.assign({ type: 'event', icon: 'question', weight: 1.5, once: true, pace: -2, side: true }, o));
    C.forEach((c, i) => { if (!c) return; const { fail, ...ok } = c; SBR.CONSEQ[o.id + ':' + i] = ok; if (fail) SBR.CONSEQ[o.id + ':' + i + ':fail'] = fail; });
  };

  /* ----- Acts I-II: Doctor Wu ----- */
  ev({ id: 'jl_wu', acts: [1, 2], title: 'The Doctor With Three Name Tags', blurb: 'A travelling doctor is curing a racer\'s allergies. The racer is screaming.', icon: 'skull', art: 'jl_wu',
    text: 'A medicine wagon with foreign lettering on the side. The doctor wears a long white coat with a tag reading DoCToR on each breast and a third on his shoulder, and his hair is a ring of little pale stones. The racer on his table has come out in hives from head to foot, and his left arm is moving on its own. "Allergies," the doctor says pleasantly. "I can cure anything that\'s in the bones."',
    choices: [
      { label: 'Let him examine you (RESOLVE)', check: { stat: 'res', dc: 12 }, ok: { text: 'His fingers are cold and gritty, but they know what they are doing. He sets a sprain Gyro missed and grinds you a powder for the road. "I am a doctor. That part is true." (Party heals 40%, +2 Herbs.)', fx: g => { g.healAll(0.4); g.mat('herb', 2); } },
        fail: { text: 'Something gritty slides under your skin and grips your collarbone. You tear free, and the doctor comes apart into a cloud of gravel.', fight: { enemies: ['jl_wu'], elite: true, after: g => g.money(25) } } },
      { label: '"You\'re not a doctor. Let him go."', ok: { text: '"Rude." The doctor\'s face cracks like a dry riverbed and falls away into stones.', fight: { enemies: ['jl_wu', 'bandit'], elite: true, after: g => { g.gear('sage_bundle'); g.money(30); } } } },
      { label: 'Buy a bottle of his tonic ($15) and move on', cost: { money: 15 }, ok: { text: 'It tastes of chalk and iron. It works, too. (Snake Oil, +10 XP.)', fx: g => { g.item('snakeoil'); g.xp(10); } } },
    ] }, [
    { deed: 'Was examined by a Rock Human doctor, and lived.', npc: { jl_wu: 'friend' }, fail: { deed: 'Fought a gravel man in a doctor\'s coat.', rep: { racers: 1 } } },
    { deed: 'Stopped a Rock Human doctor from possessing a racer\'s bones.', rep: { racers: 2 } },
    { deed: 'Bought tonic from a doctor with three name tags.' },
  ]);

  /* ----- Acts II-III: Vitamin C ----- */
  ev({ id: 'jl_damo', acts: [2, 3], title: 'The Man in the Velvet Tracksuit', blurb: 'A racer at the trading post has gone soft as bread dough.', icon: 'skull', art: 'jl_damo',
    text: 'At the trading post counter a short, heavy man in aviator glasses and a purple velvet suit with orange trim is counting banknotes. He says he is twenty-three. He looks fifty. On the bench beside him a racer has gone soft as bread dough: his face is sliding off the side of his head, and the man is slowly pushing a folded banknote into his cheek. "Where\'s the fruit, eh? Where\'s the tree?"',
    choices: [
      { label: 'Buy the racer\'s debt ($40)', cost: { money: 40 }, ok: { text: 'He counts your money twice, then pats the racer on the head. The man firms up like cooling wax. Later, still shaking, he tells you a shortcut through the canyon. (+20 XP, +5 Pace.)', fx: g => { g.xp(20); g.pace(5); } } },
      { label: 'Knock the banknote out of his hand', ok: { text: 'He sighs and stands up. There\'s a handprint glowing on the counter where you leaned.', fight: { enemies: ['jl_damo', 'rival_racer'], elite: true, after: g => { g.gear('goldteeth'); g.money(40); } } } },
      { label: 'Touch nothing he has touched and lift his wallet (LUCK)', check: { stat: 'luck', dc: 13 }, ok: { text: 'You step over the prints on the floorboards and brush past him at the door. His wallet is very fat. (+$70.)', fx: g => g.money(70) },
        fail: { text: 'You grab the doorframe. It\'s warm. Your fingers sink into your own palm.', fight: { enemies: ['jl_damo'], elite: true, after: g => g.money(30) } } },
    ] }, [
    { deed: 'Paid off a racer\'s debt to a man whose Stand melts people.', rep: { racers: 2 } },
    { deed: 'Fought Tamaki Damo in a trading post.', rep: { racers: 1, law: 1 } },
    { deed: 'Picked the pocket of a man with Vitamin C.', rep: { law: -1 }, fail: { deed: 'Tried to rob a Stand user and was nearly melted.' } },
  ]);

  /* ----- Acts II-III: I Am a Rock ----- */
  ev({ id: 'jl_yotsuyu', acts: [2, 3], title: 'Chestnuts Falling Sideways', blurb: 'Flowerpots are flying off windowsills at a girl in the street.', icon: 'skull', art: 'jl_yotsuyu',
    text: 'Every flowerpot on the street is sliding off its sill and flying at one girl. So are the chestnuts from a vendor\'s cart, a tin of pesticide and a milk churn. Leaning on a hitching post, a slim young man with a leaf for a hat, spiked leather on his arms and flowered bloomers is watching with no expression at all. "I only touched her shoulder," he says. "Everything else is nature."',
    choices: [
      { label: 'Step in front of her and take the hits (GRIT)', check: { stat: 'grit', dc: 13 }, ok: { text: 'You catch a flowerpot on your back and a milk churn on your shoulder. He tilts his head. "Rock Humans don\'t fight what they don\'t need to." He leaves. The girl\'s father runs the livery stable. (Party loses 10% HP, +$40, +20 XP.)', fx: g => { g.hurtAll(0.1); g.money(40); g.xp(20); } },
        fail: { text: 'A fence post catches you across the knees. He touches your shoulder as you get up.', fight: { enemies: ['jl_yotsuyu'], elite: true, after: g => g.money(25) } } },
      { label: 'Draw on him', ok: { text: 'He sighs. Every loose stone in the street lifts an inch off the ground.', fight: { enemies: ['jl_yotsuyu', 'bandit'], elite: true, after: g => { g.gear('lodestone'); g.money(30); } } } },
      { label: 'Ask him what he is', ok: { text: '"A Rock Human. We sleep for months at a time. We are patient." He tells you about a fruit that trades one person\'s injury to another, and hands you a pair of fossils as if they were business cards. (+2 Fossil Shards, +15 XP.)', fx: g => { g.mat('fossil', 2); g.xp(15); } } },
    ] }, [
    { deed: 'Shielded a girl from Yotsuyu Yagiyama\'s Stand.', rep: { law: 1, racers: 1 }, fail: { deed: 'Fought a Rock Human in the street.' } },
    { deed: 'Fought a Rock Human whose Stand attracts objects.', rep: { law: 1 } },
    { deed: 'Talked with a Rock Human about the Locacaca fruit.', npc: { jl_yotsuyu: 'neutral' } },
  ]);

  /* ----- Acts III-IV: Doobie Wah! ----- */
  ev({ id: 'jl_aisho', acts: [3, 4], title: 'The Tornado That Follows Breath', blurb: 'A knee-high tornado is chasing a rider through the wheat.', icon: 'skull', art: 'jl_aisho',
    text: 'A tornado no taller than a fence is weaving through the wheat after a rider, cutting the stalks flat, then his horse\'s legs, then him. It turns whenever he gasps. On a fence post nearby sits a thin man in a black bodysuit with a hole over the chest, knitted sleeves tied round his head and neck. He is breathing very, very slowly.',
    choices: [
      { label: 'Hold your breath and walk up to him (GRIT)', check: { stat: 'grit', dc: 14 }, ok: { text: 'Forty steps without a breath. The tornado circles you, confused, and collapses. You haul him off the post and he gives up his purse and his coat without a word. (+$60, Oilskin Coat.)', fx: g => { g.money(60); g.gear('oilskin'); } },
        fail: { text: 'Your lungs give out halfway. You gasp. The wind turns toward you.', fight: { enemies: ['jl_aisho'], elite: true, after: g => g.money(30) } } },
      { label: 'Shoot the man on the fence', ok: { text: 'He rolls off the post before your hammer falls. Your own breathing is very loud.', fight: { enemies: ['jl_aisho', 'crow', 'crow'], elite: true, after: g => { g.gear('eagle_feather'); g.money(40); } } } },
      { label: 'Ride away downwind, breathing through a wet rag', ok: { text: 'The tornado loses you in the corn. Not before it nicks everyone\'s ankles. (Party loses 10% HP, +15 XP.)', fx: g => { g.hurtAll(0.1); g.xp(15); } } },
    ] }, [
    { deed: 'Beat Doobie Wah! by holding your breath.', rep: { racers: 2 }, fail: { deed: 'Fought a Stand user whose tornado follows breath.', rep: { racers: 1 } } },
    { deed: 'Fought Aisho Dainenjiyama in the wheat.', rep: { racers: 1 } },
    { deed: 'Outran a tornado that follows breath.' },
  ]);

  /* ----- Acts III-IV: Blue Hawaii ----- */
  ev({ id: 'jl_dolomite', acts: [3, 4], title: 'Water That Walks', blurb: 'Townsfolk are walking through walls in a straight line. Toward you.', icon: 'skull', art: 'jl_dolomite',
    text: 'A farmhand walks straight through a picket fence without slowing. A washerwoman wades into the horse trough and out the other side. Six of them, bloody, eyes blank, all walking in a perfectly straight line, and the line ends at you. On a porch at the end of the street, in a bathtub full of bright blue water, sits a cracked grey man with silver hair and stumps for arms.',
    choices: [
      { label: 'Fight through the walkers to the bathtub', ok: { text: '"Keep walking," he says, and they do.', fight: { enemies: ['jl_dolomite', 'jl_thrall', 'jl_thrall'], elite: true, after: g => { g.gear('rain_lens'); g.money(40); } } } },
      { label: 'Wash the walkers in clean well water (RESOLVE)', check: { stat: 'res', dc: 13 }, ok: { text: 'Bucket after bucket. One by one the walkers stop, blink, and sit down in the mud crying. The bathtub is empty when you reach it. The town feeds you for a week\'s worth of thanks. (Party heals 30%, +25 XP.)', fx: g => { g.healAll(0.3); g.xp(25); } },
        fail: { text: 'You splash the wrong one. His blood hits your arm, and your feet start walking.', fight: { enemies: ['jl_dolomite', 'jl_thrall'], elite: true, after: g => g.money(30) } } },
      { label: 'Let them walk past you into the river', ok: { text: 'You stand aside at the last second. They walk into the river and keep going. You don\'t look back. (Party loses 10% HP to shoving, +15 XP.)', fx: g => { g.hurtAll(0.1); g.xp(15); } } },
    ] }, [
    { deed: 'Fought Dolomite and his Blue Hawaii walkers.', rep: { law: 1, racers: 1 } },
    { deed: 'Washed a town free of Blue Hawaii.', rep: { law: 2 }, fail: { deed: 'Was splashed with a Blue Hawaii walker\'s blood.' } },
    { deed: 'Let Blue Hawaii\'s walkers go into the river.', rep: { law: -1 } },
  ]);

  /* ----- Acts IV-V: Ozon Baby ----- */
  ev({ id: 'jl_poortom', acts: [4, 5], title: 'The Air Is Wrong Here', blurb: 'In one clearing your ears pop and the horses\' noses bleed.', icon: 'skull', art: 'jl_poortom',
    text: 'The snow in this clearing is sunk in a perfect bowl. Your ears pop. Slow Dancer snorts blood. In the middle, a small wrinkled man in shorts and sandals, his tie and shirt looking as if someone drew them on, is patting down fresh soil with both hands. "Don\'t come closer," he says. "The closer you get, the less air there is. That\'s not me. That\'s Ozon Baby."',
    choices: [
      { label: 'Dig where he was patting (GRIT)', check: { stat: 'grit', dc: 14 }, ok: { text: 'Your head is pounding, but your shovel hits it: a toy White House made of little bricks. You stamp on it. The air rushes back and he runs, crying, into the pines. (+$50, +2 Scrap, +20 XP.)', fx: g => { g.money(50); g.mat('scrap', 2); g.xp(20); } },
        fail: { text: 'You black out for a second. When you look up he is standing over you with a rock.', fight: { enemies: ['jl_poortom'], elite: true, after: g => g.money(30) } } },
      { label: 'Go for him instead', ok: { text: 'He squeals and scuttles backward. Each step toward him is harder to breathe.', fight: { enemies: ['jl_poortom', 'wolf'], elite: true, after: g => { g.gear('pocket_watch'); g.money(40); } } } },
      { label: 'Back out of the clearing, slowly', ok: { text: 'Leaving is worse than arriving. The pressure comes back into your joints like knives. (Party loses 15% HP, +15 XP.)', fx: g => { g.hurtAll(0.15); g.xp(15); } } },
    ] }, [
    { deed: 'Dug up Ozon Baby and broke it.', rep: { racers: 1 }, fail: { deed: 'Blacked out in Poor Tom\'s low-pressure clearing.' } },
    { deed: 'Fought Poor Tom in a clearing with no air.', rep: { racers: 1 } },
    { deed: 'Backed out of an Ozon Baby zone.' },
  ]);

  /* ----- Acts V-VI: Brain Storm ----- */
  ev({ id: 'jl_guerrilla', acts: [5, 6], type: 'elite', title: 'The Field Surgeon', blurb: 'A doctor at a race hospital. His patients all have neat round holes.', icon: 'skull', art: 'jl_guerrilla', pace: -3,
    text: 'The race committee\'s field hospital is a barn full of cots. Every patient has the same wound: neat round holes, as if something ate its way in. The surgeon on duty is a big man in glasses who smiles with all his teeth. When he sees you looking at the holes he takes the glasses off, and pulls a purple hood with goggles and a breathing mask over his head. Little golden puzzles slide out of his palms.',
    choices: [
      { label: 'Fight him before he gets to another patient', ok: { text: 'He cracks his knuckles. The puzzles lock together with a click.', fight: { enemies: ['jl_guerrilla'], elite: true, after: g => { g.gear('spike_knuckles'); g.money(60); g.xp(30); } } } },
      { label: 'Burn every bandage and sheet in the barn (RESOLVE)', check: { stat: 'res', dc: 15 }, ok: { text: 'The fire takes the rot with it. When the smoke clears the hood is lying on the floor, and the patients stop getting worse. A nun from Philadelphia blesses you on the way out. (Party heals 30%, +30 XP.)', fx: g => { g.healAll(0.3); g.xp(30); } },
        fail: { text: 'He steps through the smoke, grinning.', fight: { enemies: ['jl_guerrilla'], elite: true, after: g => { g.money(40); g.xp(20); } } } },
      { label: 'Carry your wounded out and never come back', ok: { text: 'One of your riders has a small hole in his hand by the time you reach the horses. It stops spreading at dawn. (A random rider loses 20% HP, +15 XP.)', fx: g => { g.hurtRandomPct(0.2); g.xp(15); } } },
    ] }, [
    { deed: 'Fought Urban Guerrilla in a field hospital.', rep: { racers: 2 } },
    { deed: 'Burned out Brain Storm\'s infection.', rep: { vatican: 1, racers: 1 }, fail: { deed: 'Fought a Rock Human surgeon through smoke.', rep: { racers: 1 } } },
    { deed: 'Fled a field hospital full of holes.' },
  ]);

  /* ----- Acts V-VI: Wonder of U ----- */
  ev({ id: 'jl_toru', acts: [5, 6], type: 'elite', title: 'Do Not Follow Them', blurb: 'Everyone who walks behind a young man and an old doctor gets hurt.', icon: 'skull', art: 'jl_toru', pace: -3, weight: 1,
    text: 'A young man with a round afro and earphones strolls down the boardwalk, and beside him an old hospital director in a long coat with a fur collar. Behind them the street is chaos. A newsboy has a splinter through his hand. A Pinkerton is on his back under a fallen shop sign. A man who only turned to look at them has been hit in the eye by a raindrop, and it is not raining. The old man glances back at you. "Please. Don\'t follow us."',
    choices: [
      { label: 'Follow them', ok: { text: 'The first step costs you a twisted ankle. The second, a roof tile. The old man sighs and turns around.', fight: { enemies: ['jl_akefu', 'jl_toru'], elite: true, after: g => { g.gear('kuma_chan'); g.money(90); g.xp(40); } } } },
      { label: 'Turn your back and walk the other way (RESOLVE)', check: { stat: 'res', dc: 14 }, ok: { text: 'Every instinct says look back. You don\'t. On the next corner an old woman presses a strange knobbly fruit into your hand for no reason at all. It closes wounds when you eat it. (Party heals 60%, +20 XP.)', fx: g => { g.healAll(0.6); g.xp(20); } },
        fail: { text: 'You glance back once. That\'s enough. A wagon loses a wheel, a horse spooks, and a window comes down. (Party loses 20% HP.)', fx: g => g.hurtAll(0.2) } },
      { label: 'Ask the old man what they are running from', ok: { text: '"Running? We are the ones who are chased. Everyone chases. Your Corpse, the fruit, the prize money. Chasing is what brings calamity. Remember that at the finish line." He tips his hat and is gone. (+30 XP.)', fx: g => g.xp(30) } },
    ] }, [
    { deed: 'Pursued the Wonder of U and survived its calamities.', rep: { racers: 1 } },
    { deed: 'Stopped pursuing the Wonder of U.', npc: { jl_akefu: 'neutral' }, fail: { deed: 'Looked back at the Wonder of U, and paid for it.' } },
    { deed: 'Spoke with Satoru Akefu about pursuit and calamity.', npc: { jl_akefu: 'friend' } },
  ]);

  SBR.EVENTS.push(...E);
  if (SBR.SIDE_EVENTS) SBR.SIDE_EVENTS.push(...E.map(e => e.id));
})();
