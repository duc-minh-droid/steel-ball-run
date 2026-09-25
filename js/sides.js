/* Side encounters: strangers on the trail who carry powers from other parts of JoJo. Stand users with famous Stands,
   a saloon of Stone Mask vampires, zombie horses, a Hamon monk and a Pillar Man asleep in a quarry.
   None of them are part of the story or the bosses: they are optional risks with good rewards.
   Loads before combat.js / ui.js / main.js, so everything here is data plus wrappers of files that loaded earlier. */
'use strict';

/* ================= 1. Portraits and creatures ================= */
SBR.art.addPortrait({
  sd_laramie:  { skin: '#f0c8a0', hair: '#3a2a1a', hairStyle: 'long', hat: 'stetson', hatColor: '#6a3a2a', hat2: '#f2c14e', outfit: '#6a3a2a', outfit2: '#f2c14e', eye: '#3a6a3a', lip: '#a05a4a', bg: ['#f2c14e', '#6a3a2a'], extra: 'mustache', deco: ['bandolier'] },
  sd_mirror:   { skin: '#d8c8b8', hair: '#6a6a7a', hairStyle: 'shaggy', hat: 'porkpie', hatColor: '#3a3a4a', hat2: '#c8c8d8', outfit: '#3a3a4a', outfit2: '#c8c8d8', eye: '#9fc7e8', lip: '#7a5a5a', bg: ['#c8d8e8', '#3a3a4a'], extra: 'scar', deco: ['stubble'] },
  sd_glutton:  { skin: '#f0d890', hair: '#c8a020', hairStyle: 'bowl', hat: null, outfit: '#c8a020', outfit2: '#f6ecd8', eye: '#6a3a1a', lip: '#c86040', bg: ['#f2c14e', '#e8742a'], extra: 'grin' },
  sd_death13:  { skin: '#ece4f4', hair: '#1a1020', hairStyle: 'spiky', hat: 'tophat', hatColor: '#3a1a4a', hat2: '#c8323c', outfit: '#3a1a4a', outfit2: '#f6ecd8', eye: '#c8323c', lip: '#c8323c', bg: ['#1a1020', '#8a3a8a'], extra: 'grin' },
  sd_coinboy:  { skin: '#e8b890', hair: '#6a3a1a', hairStyle: 'curls', hat: 'newsboy', hatColor: '#6a5a4a', hat2: '#3a2a1a', outfit: '#8a5a30', outfit2: '#f2c14e', eye: '#3a2a1a', lip: '#b8605a', bg: ['#f2c14e', '#6aa04a'], deco: ['freckles'] },
  sd_sergeant: { skin: '#e0b090', hair: '#8a8a8a', hairStyle: 'short', hat: 'kepi', hatColor: '#3a4a2a', hat2: '#f2c14e', outfit: '#3a4a2a', outfit2: '#c8a070', eye: '#2a2a2a', lip: '#8a4a3a', bg: ['#6a7a4a', '#c8a070'], extra: 'mustache', deco: ['medal'] },
  sd_sixgun:   { skin: '#f0c8a8', hair: '#1a1020', hairStyle: 'swept', hat: 'cowboy', hatColor: '#2a2a3a', hat2: '#c8323c', outfit: '#2a2a3a', outfit2: '#6a8ad0', eye: '#3a3a6a', lip: '#a05a5a', bg: ['#6a8ad0', '#f6ecd8'], deco: ['bandolier', 'stubble'] },
  sd_angler:   { skin: '#e8c0a0', hair: '#c8c8c8', hairStyle: 'short', hat: 'porkpie', hatColor: '#6a5a3a', hat2: '#3fb8a9', outfit: '#3a6a8a', outfit2: '#e8d8b8', eye: '#3a6a8a', lip: '#a06050', bg: ['#9fc7e8', '#3a6a8a'], extra: 'beard' },
  sd_pilot:    { skin: '#f6d8c0', hair: '#c8603a', hairStyle: 'shaggy', hat: 'aviator', hatColor: '#6a4a2a', hat2: '#9fc7e8', outfit: '#6a4a2a', outfit2: '#f6ecd8', eye: '#3a8c4a', lip: '#c07070', bg: ['#9fc7e8', '#f6ecd8'], extra: 'scarf', deco: ['freckles'] },
  sd_fixer:    { skin: '#e8d0b8', hair: '#4a4a4a', hairStyle: 'swept', hat: 'bowler', hatColor: '#4a5a4a', hat2: '#a0c040', outfit: '#4a5a4a', outfit2: '#e8e8d0', eye: '#6a8a3a', lip: '#8a5a5a', bg: ['#a0c040', '#2a3a2a'], extra: 'monocle', deco: ['bowtie:#a0c040'] },
  sd_replay:   { skin: '#f6d8c8', hair: '#6a2a8a', hairStyle: 'bob', hat: 'beret', hatColor: '#4a2a6a', hat2: '#c8a0e8', outfit: '#4a2a6a', outfit2: '#c8a0e8', eye: '#8a4ad0', lip: '#b04080', bg: ['#8a4ad0', '#f6ecd8'], deco: ['earring:#c8a0e8'] },
  sd_vampboss: { skin: '#e8e0e8', hair: '#1a1020', hairStyle: 'swept', hat: null, outfit: '#3a0a1a', outfit2: '#c8323c', eye: '#c8323c', lip: '#8a1a2a', bg: ['#3a0a1a', '#c8323c'], extra: 'grin', deco: ['collar:#c8323c'] },
  sd_vampire:  { skin: '#d8d0e0', hair: '#3a2a3a', hairStyle: 'shaggy', hat: 'bandana', hatColor: '#6a1a2a', hat2: '#1a1020', outfit: '#2a1a2a', outfit2: '#6a1a2a', eye: '#e8323c', lip: '#6a1a2a', bg: ['#1a1020', '#6a1a2a'], extra: 'grin' },
  sd_zombie:   { skin: '#a8b890', hair: '#4a4a3a', hairStyle: 'shaggy', hat: 'porkpie', hatColor: '#4a3a2a', hat2: '#2a2a1a', outfit: '#4a4a3a', outfit2: '#6a5a3a', eye: '#e8e8a0', lip: '#5a4a3a', bg: ['#3a4a2a', '#8a9a6a'], deco: ['bandage'] },
  sd_monk:     { skin: '#e0b088', hair: '#e8e8e8', hairStyle: 'bald', hat: 'headband', hatColor: '#f2c14e', hat2: '#e8742a', outfit: '#e8742a', outfit2: '#f2c14e', eye: '#6a4a2a', lip: '#a06050', bg: ['#f2c14e', '#fff3a0'], extra: 'beard', deco: ['necklace:beads'] },
  sd_pillarman:{ skin: '#c8a888', hair: '#2a1a10', hairStyle: 'verylong', hat: 'headband', hatColor: '#c8a040', hat2: '#3fb8a9', outfit: '#8a6a4a', outfit2: '#c8a040', eye: '#f2c14e', lip: '#6a3a2a', bg: ['#6a5a4a', '#e8d8a8'], extra: 'tattoo' },
  sd_swiss:    { skin: '#f0d0b0', hair: '#6a4a2a', hairStyle: 'short', hat: 'helm', hatColor: '#c8c8d8', hat2: '#c8323c', outfit: '#f2c14e', outfit2: '#2a4a8a', eye: '#3a6a9a', lip: '#a06050', bg: ['#f6ecd8', '#c8323c'] },
  sd_hound:    { skin: '#d8a880', hair: '#8a8a8a', hairStyle: 'long', hat: 'stetson', hatColor: '#3a2a1a', hat2: '#c8c8d8', outfit: '#5a4a3a', outfit2: '#c8c8d8', eye: '#c8a040', lip: '#8a4a3a', bg: ['#3a2a1a', '#e8d8a8'], extra: 'scar', deco: ['stubble', 'eyepatch'] },
});

/* new creature kinds for enemy art (art.creature is looked up at call time, so wrapping it here is enough) */
(() => {
  const INK = '#1a1020', SW = 2.2;
  let n = 0;
  const S = `stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"`;
  const bug = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="7" ry="9" fill="${c}" ${S}/><path d="M-7 -2h14M-7 3h14" stroke="${INK}" stroke-width="1.6"/><circle cx="-3" cy="-6" r="2.2" fill="#fff" stroke="${INK}" stroke-width="1"/><circle cx="3" cy="-6" r="2.2" fill="#fff" stroke="${INK}" stroke-width="1"/><circle cx="-3" cy="-6" r="1" fill="${INK}"/><circle cx="3" cy="-6" r="1" fill="${INK}"/><path d="M-6 6l-5 4M6 6l5 4M-7 0l-6 0M7 0l6 0" stroke="${INK}" stroke-width="1.6"/><path d="M-2 -9l-2 -5M2 -9l2 -5" stroke="${INK}" stroke-width="1.4"/></g>`;
  const draw = {
    zhorse: c => `<path d="M58 120 L50 86 Q34 96 22 95 Q10 93 13 80 L25 52 Q33 31 52 23 L56 7 L64 19 L70 9 L72 24 Q88 32 92 54 Q97 82 96 120Z" fill="${c}" ${S}/>
      <path d="M72 24 L80 30 L76 36 L86 40 L80 46 L90 52 L84 58 L93 66 L86 72 L95 82 L88 88 L96 98" fill="none" stroke="#2a2a1a" stroke-width="5" stroke-linejoin="round"/>
      <path d="M26 56 Q36 40 50 34" stroke="${INK}" stroke-width="1.2" fill="none" opacity=".4"/>
      <path d="M30 62 l6 4 M34 58 l2 8 M38 56 l0 8 M42 55 l-2 8" stroke="#3a2a2a" stroke-width="1.4"/>
      <path d="M58 60 Q66 70 60 84" stroke="#6a2a2a" stroke-width="2" fill="none"/><path d="M56 64 h6 M56 70 h7 M57 76 h6" stroke="#e8e0c0" stroke-width="1.6"/>
      <circle cx="46" cy="42" r="5.5" fill="#e8323c" stroke="${INK}" stroke-width="1.8"/><circle cx="46" cy="42" r="1.8" fill="#fff3a0"/>
      <ellipse cx="20" cy="84" rx="3" ry="2" fill="${INK}"/><path d="M16 92 Q24 96 34 92" stroke="${INK}" stroke-width="1.4" fill="none"/>
      <path d="M18 93 l2 4 2 -4 2 4 2 -4 2 4" stroke="#e8e0c0" stroke-width="1.2" fill="none"/>
      <path d="M14 104 q6 6 2 14 M40 104 q-4 8 0 14" stroke="#c8c8a0" stroke-width="2" fill="none" opacity=".7"/>`,
    harvest: c => [[30, 40, 1.3], [66, 34, 1.1], [50, 70, 1.8], [22, 86, 1], [78, 80, 1.2], [44, 104, 0.9], [74, 108, 0.8]].map(([x, y, s]) => bug(x, y, s, c)).join('') +
      [[36, 62], [62, 96], [18, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#f2c14e" stroke="${INK}" stroke-width="1.4"/><text x="${x}" y="${y + 2.4}" font-size="6" text-anchor="middle" font-family="Rye,serif" fill="${INK}">¢</text>`).join(''),
    toysoldier: c => `<g transform="translate(50 64)">
      <rect x="-12" y="-6" width="24" height="30" rx="3" fill="${c}" ${S}/><path d="M-12 6h24" stroke="#f2c14e" stroke-width="2"/>
      <circle cx="0" cy="-16" r="10" fill="#e8c0a0" ${S}/><path d="M-12 -18 Q0 -34 12 -18 Z" fill="#3a4a2a" ${S}/>
      <circle cx="-4" cy="-15" r="1.6" fill="${INK}"/><circle cx="4" cy="-15" r="1.6" fill="${INK}"/>
      <path d="M-10 24 l-2 20 h8 l2 -18 M10 24 l2 20 h-8 l-2 -18" fill="#3a3a2a" ${S}/>
      <path d="M12 -2 L32 -30" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M12 -2 L32 -30" stroke="#8a6a4a" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M-12 0 Q-22 6 -14 14" fill="none" ${S}/></g>
      <g transform="translate(22 100)"><rect x="-14" y="-6" width="28" height="10" rx="3" fill="#3a4a2a" ${S}/><rect x="-6" y="-12" width="12" height="7" fill="#3a4a2a" ${S}/><path d="M6 -9 h14" ${S}/><circle cx="-8" cy="6" r="3" fill="${INK}"/><circle cx="0" cy="6" r="3" fill="${INK}"/><circle cx="8" cy="6" r="3" fill="${INK}"/></g>
      <g transform="translate(80 26)"><ellipse cx="0" cy="0" rx="12" ry="6" fill="#3a4a2a" ${S}/><path d="M-22 -8 h44" ${S}/><path d="M12 0 l12 2" ${S}/></g>`,
    blob: c => `<path d="M14 118 Q6 86 22 70 Q18 40 44 34 Q58 18 74 34 Q96 44 88 72 Q100 96 90 118Z" fill="${c}" ${S}/>
      ${[[30, 90, 6], [70, 96, 4], [60, 52, 5], [80, 70, 3], [40, 108, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff8c0" stroke="${INK}" stroke-width="1.2" opacity=".85"/>`).join('')}
      <circle cx="42" cy="62" r="7" fill="#fff" ${S}/><circle cx="66" cy="60" r="7" fill="#fff" ${S}/><circle cx="43" cy="63" r="3" fill="${INK}"/><circle cx="65" cy="61" r="3" fill="${INK}"/>
      <path d="M40 80 Q54 92 70 80 Q54 86 40 80Z" fill="#8a2a2a" ${S}/><path d="M44 81 l3 4 3 -4 3 4 3 -4 3 4 3 -4" stroke="#fff" stroke-width="1.2" fill="none"/>
      <path d="M22 118 q2 -10 6 -2 M84 118 q-2 -12 -8 -4" stroke="${INK}" stroke-width="1.4" fill="none"/>`,
  };
  const orig = SBR.art.creature;
  SBR.art.creature = (kind, color, bg = ['#5b3a8c', '#e8742a']) => {
    if (!draw[kind]) return orig(kind, color, bg);
    const id = 'sdc' + (++n);
    return `<svg class="portrait" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>
      <pattern id="${id}d" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="${INK}" opacity=".18"/></pattern></defs>
      <rect width="100" height="120" fill="url(#${id}g)"/><rect width="100" height="120" fill="url(#${id}d)"/>${draw[kind](color)}</svg>`;
  };
})();

/* ================= 2. Stand figures (120x160, thick ink like stands.js) ================= */
(() => {
  const K = '#1a1020';
  const st = `stroke="${K}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
  const th = `stroke="${K}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"`;
  const F = (c, s = st) => `fill="${c}" ${s}`;
  const BODY = 'M40 50 Q60 42 80 50 L93 58 Q100 74 101 92 L92 96 L85 72 L82 104 L90 152 L75 152 L62 112 L58 112 L45 152 L30 152 L38 104 L35 72 L28 96 L19 92 Q20 74 27 58 Z';
  let n = 0;
  const wrap = (inner, aura = '#fff') => { const id = 'sds' + (++n); return `<svg class="stand-svg" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="${id}"><stop offset="0" stop-color="${aura}" stop-opacity=".55"/><stop offset="1" stop-color="${aura}" stop-opacity="0"/></radialGradient></defs><ellipse cx="60" cy="84" rx="58" ry="76" fill="url(#${id})"/>${inner}</svg>`; };
  const rope = (d, c, w = 3) => `<path d="${d}" fill="none" stroke="${K}" stroke-width="${w + 2.4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const human = (c, pat, head, extra = '') => { const id = 'sdh' + (++n); return wrap(`<defs><clipPath id="${id}"><path d="${BODY}"/></clipPath></defs><path d="${BODY}" ${F(c)}/><g clip-path="url(#${id})">${pat}</g><path d="${BODY}" fill="none" ${st}/><path d="M44 62q16 6 32 0M48 80q12 4 24 0M60 50v56" stroke="${K}" stroke-width="1.3" fill="none" opacity=".4"/>${extra}${head}`, c); };
  const bullet = (x, y, a, c = '#c8a040') => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-3 -8 Q0 -14 3 -8 V6 H-3Z" fill="${c}" ${th}/><path d="M-3 4h6" ${th}/></g>`;

  function emperor() {
    const trail = rope('M16 140 Q20 90 60 96 Q100 102 104 60', '#fff3a0', 2);
    return wrap(`${trail}
      <g transform="translate(60 64) rotate(-24)">
        <path d="M-44 -10 H22 L28 -16 H40 V-2 H-44Z" ${F('#c8a040')}/>
        <path d="M-44 -10 H22" stroke="#fff3a0" stroke-width="1.6"/>
        <circle cx="-4" cy="0" r="13" ${F('#e8c060')}/><circle cx="-4" cy="0" r="4" ${F('#8a6a20', th)}/>
        ${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${(-4 + Math.cos(i * 1.047) * 8).toFixed(1)}" cy="${(Math.sin(i * 1.047) * 8).toFixed(1)}" r="2.2" fill="#6a4a10" ${th}/>`).join('')}
        <path d="M-2 12 L10 12 L2 44 L-16 44 Z" ${F('#6a2a4a')}/><path d="M-12 20 l10 0 M-14 30 l10 0" stroke="#f2c14e" stroke-width="2"/>
        <path d="M6 12 Q14 22 6 26" fill="none" ${st}/>
        <path d="M-44 -6 l-6 -2 v6z" ${F('#fff3a0', th)}/>
        <path d="M16 -18 l6 -10 6 10z" ${F('#c8323c', th)}/>
      </g>
      ${bullet(104, 58, 40, '#fff3a0')}
      <text x="18" y="30" font-family="Bangers,Impact" font-size="16" fill="#f2c14e" stroke="${K}" stroke-width="1">BANG</text>`, '#f2c14e');
  }
  function hangedMan() {
    return wrap(`<rect x="18" y="14" width="84" height="136" rx="40" ${F('#9fc7e8')}/><rect x="26" y="22" width="68" height="120" rx="32" ${F('#dff2ff', th)}/>
      <path d="M34 40 L50 34 M70 120 L88 110 M32 100 l12 -6" stroke="#fff" stroke-width="3" opacity=".8"/>
      <g transform="translate(60 84)">
        <path d="M-14 -28 Q0 -34 14 -28 L18 22 L8 52 L-8 52 L-18 22Z" ${F('#b8a888')}/>
        ${[-20, -10, 0, 10, 20, 30].map(y => `<path d="M-16 ${y} Q0 ${y + 5} 16 ${y}" stroke="#6a5a4a" stroke-width="1.6" fill="none"/>`).join('')}
        <ellipse cx="0" cy="-42" rx="13" ry="15" ${F('#b8a888')}/>
        <path d="M-12 -46 Q0 -40 12 -46 M-12 -38 Q0 -32 12 -38" stroke="#6a5a4a" stroke-width="1.4" fill="none"/>
        <circle cx="-5" cy="-44" r="3" fill="${K}"/><circle cx="5" cy="-44" r="3" fill="${K}"/><circle cx="-5" cy="-44" r="1" fill="#fff"/><circle cx="5" cy="-44" r="1" fill="#fff"/>
        <path d="M18 -8 L34 4 L28 10 L14 0" ${F('#b8a888')}/>
        <path d="M30 6 L44 -18" stroke="${K}" stroke-width="4" stroke-linecap="round"/><path d="M30 6 L44 -18" stroke="#e8e8f0" stroke-width="2" stroke-linecap="round"/>
        <path d="M-18 -8 L-30 12" ${F('none')}/>
      </g>
      <path d="M20 70 q-8 10 0 20 M100 70 q8 10 0 20" stroke="#fff" stroke-width="2" fill="none"/>`, '#9fc7e8');
  }
  function temperance() {
    const drips = [24, 44, 70, 92].map((x, i) => `<path d="M${x} ${120 + i * 3} q4 18 -2 26 q-6 -8 2 -26z" ${F('#e8c020')}/>`).join('');
    return wrap(`${drips}<path d="M14 124 Q4 88 24 70 Q18 34 50 28 Q66 8 86 28 Q112 42 102 76 Q116 104 102 128 Q60 142 14 124Z" ${F('#f2d040')}/>
      ${[[34, 98, 8], [80, 108, 6], [72, 52, 7], [94, 78, 4], [44, 118, 4], [28, 72, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff8c0" ${th}/>`).join('')}
      <path d="M40 38 Q56 30 70 38" stroke="#fff8c0" stroke-width="4" fill="none" opacity=".8"/>
      <ellipse cx="48" cy="70" rx="9" ry="10" fill="#fff" ${st}/><ellipse cx="76" cy="68" rx="9" ry="10" fill="#fff" ${st}/><circle cx="50" cy="72" r="4" fill="${K}"/><circle cx="74" cy="70" r="4" fill="${K}"/>
      <path d="M40 90 Q62 108 86 90 Q62 98 40 90Z" fill="#8a2a2a" ${st}/><path d="M44 91 l4 6 4 -6 4 6 4 -6 4 6 4 -6 4 6 4 -6 4 5" stroke="#fff" stroke-width="1.4" fill="none"/>`, '#f2c14e');
  }
  function death13() {
    return wrap(`<path d="M24 150 Q30 90 40 60 Q60 50 80 60 Q90 90 96 150 L84 142 L74 152 L62 142 L50 152 L38 142Z" ${F('#3a1a4a')}/>
      <path d="M40 60 Q60 76 80 60" stroke="#c8323c" stroke-width="3" fill="none"/>${[46, 60, 74].map(x => `<circle cx="${x}" cy="${86 + (x === 60 ? 6 : 0)}" r="3" fill="#f2c14e" ${th}/>`).join('')}
      <path d="M100 150 L100 20" stroke="${K}" stroke-width="6" stroke-linecap="round"/><path d="M100 150 L100 20" stroke="#8a6a4a" stroke-width="3" stroke-linecap="round"/>
      <path d="M100 22 Q70 6 34 26 Q66 22 100 36Z" ${F('#e8e8f0')}/><path d="M92 26 Q70 16 46 26" stroke="#fff" stroke-width="1.6" fill="none"/>
      <path d="M86 90 Q96 84 100 92" fill="none" ${st}/>
      <ellipse cx="60" cy="42" rx="17" ry="18" ${F('#f6f0f8')}/>
      <path d="M40 30 L36 8 L52 26 Z M80 30 L84 8 L68 26Z" ${F('#c8323c')}/><circle cx="36" cy="8" r="3" fill="#f2c14e" ${th}/><circle cx="84" cy="8" r="3" fill="#f2c14e" ${th}/>
      <path d="M50 36 l6 4 M70 36 l-6 4" stroke="${K}" stroke-width="2.6"/><circle cx="53" cy="42" r="2.6" fill="#c8323c"/><circle cx="67" cy="42" r="2.6" fill="#c8323c"/>
      <path d="M48 50 Q60 60 72 50 Q60 55 48 50Z" fill="#fff" ${th}/><path d="M50 51 l2 3 2 -3 2 3 2 -3 2 3 2 -3 2 3 2 -3 2 3" stroke="${K}" stroke-width=".9" fill="none"/>
      <path d="M46 46 l-2 6 M74 46 l2 6" stroke="#c8323c" stroke-width="1.4"/>
      <text x="14" y="112" font-family="Bangers,Impact" font-size="14" fill="#f6f0f8" stroke="${K}" stroke-width="1" transform="rotate(-12 14 112)">LALI-HO!</text>`, '#8a3a8a');
  }
  function harvest() {
    const bug = (x, y, s, a) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><ellipse cx="0" cy="2" rx="8" ry="10" ${F('#e8a020')}/><path d="M-8 -1h16M-8 5h16" stroke="${K}" stroke-width="1.8"/><path d="M-6 -6 Q0 -12 6 -6" ${F('#f6ecd8', th)}/><circle cx="-3" cy="-5" r="2.2" fill="${K}"/><circle cx="3" cy="-5" r="2.2" fill="${K}"/><circle cx="-2.4" cy="-5.6" r=".7" fill="#fff"/><circle cx="3.6" cy="-5.6" r=".7" fill="#fff"/><path d="M-8 6l-6 5M8 6l6 5M-8 0l-7 -1M8 0l7 -1M-3 -10l-3 -6M3 -10l3 -6" stroke="${K}" stroke-width="1.8"/></g>`;
    const coin = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="#f2c14e" ${th}/><text x="${x}" y="${y + 2.4}" font-size="6.5" text-anchor="middle" font-family="Rye,serif" fill="${K}">¢</text>`;
    return wrap([[60, 40, 1.4, 0], [30, 66, 1.1, -20], [88, 70, 1.2, 18], [48, 96, 1.3, -8], [80, 110, 1.1, 24], [26, 124, 1, -30], [62, 138, 0.9, 6], [96, 136, 0.8, 30]].map(a => bug(...a)).join('') +
      [[40, 50], [74, 90], [36, 110], [92, 48], [54, 124]].map(([x, y]) => coin(x, y)).join(''), '#e8a020');
  }
  function badCompany() {
    const soldier = (x, y) => `<g transform="translate(${x} ${y}) scale(.8)"><rect x="-5" y="-4" width="10" height="14" rx="2" ${F('#3a4a2a', th)}/><circle cx="0" cy="-9" r="5" fill="#e8c0a0" ${th}/><path d="M-6 -10 Q0 -18 6 -10Z" ${F('#3a4a2a', th)}/><path d="M5 0 L14 -12" stroke="${K}" stroke-width="2.4"/><path d="M-4 10v8M4 10v8" stroke="${K}" stroke-width="2.4"/></g>`;
    return wrap(`<g transform="translate(60 30)"><ellipse cx="0" cy="0" rx="22" ry="9" ${F('#4a5a3a')}/><path d="M-40 -12 H40" ${st}/><path d="M0 -12 V-6" ${st}/><path d="M20 2 L38 6 L36 10 L18 6" ${F('#4a5a3a')}/><rect x="-10" y="-4" width="10" height="6" rx="2" fill="#9fc7e8" ${th}/><path d="M-14 8 L-18 16 M10 8 L14 16 M-20 16 H18" ${th}/></g>
      <g transform="translate(40 76)"><rect x="-26" y="-8" width="52" height="18" rx="5" ${F('#5a6a3a')}/><rect x="-12" y="-20" width="24" height="14" rx="4" ${F('#5a6a3a')}/><path d="M12 -14 H44" stroke="${K}" stroke-width="6" stroke-linecap="round"/><path d="M12 -14 H44" stroke="#5a6a3a" stroke-width="3" stroke-linecap="round"/>${[-18, -6, 6, 18].map(x => `<circle cx="${x}" cy="12" r="5" fill="${K}"/><circle cx="${x}" cy="12" r="2" fill="#8a8a8a"/>`).join('')}<path d="M-6 -24 v-8 l8 3 -8 3" fill="#c8323c" ${th}/></g>
      ${[[18, 120], [34, 126], [50, 120], [66, 126], [82, 120], [98, 126], [26, 144], [42, 150], [58, 144], [74, 150], [90, 144]].map(([x, y]) => soldier(x, y)).join('')}
      <path d="M92 56 l10 -6 M96 64 l12 0" stroke="#e8742a" stroke-width="3"/>`, '#8a9a5a');
  }
  function sexPistols() {
    const pistol = (x, y, num, a) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-9 8 Q-10 -12 0 -16 Q10 -12 9 8 Q0 12 -9 8Z" ${F('#f2e0a0')}/><path d="M-8 -2 Q0 -6 8 -2" stroke="#c8a040" stroke-width="1.6" fill="none"/>
      <ellipse cx="-3.4" cy="-7" rx="2.6" ry="3.2" fill="#fff" ${th}/><ellipse cx="3.4" cy="-7" rx="2.6" ry="3.2" fill="#fff" ${th}/><circle cx="-3" cy="-6.4" r="1.3" fill="${K}"/><circle cx="3" cy="-6.4" r="1.3" fill="${K}"/>
      <path d="M-3 1 Q0 4 3 1" ${th} fill="none"/><path d="M-9 6 L-14 14 M9 6 L14 14 M-4 10 L-6 18 M4 10 L6 18" stroke="${K}" stroke-width="2"/>
      <text x="0" y="-18" font-family="Anton,Impact" font-size="8" text-anchor="middle" fill="#c8323c" stroke="${K}" stroke-width=".6">${num}</text></g>`;
    return wrap([[26, 40, 1, -12], [60, 30, 2, 0], [94, 44, 3, 14], [30, 100, 5, -8], [64, 118, 6, 6], [96, 96, 7, 18]].map(a => pistol(...a)).join('') +
      bullet(46, 72, 60) + bullet(78, 70, -50) + `<path d="M34 76 Q60 60 88 76" stroke="#fff3a0" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/>
      <text x="42" y="150" font-family="Bangers,Impact" font-size="14" fill="#f2e0a0" stroke="${K}" stroke-width="1">PASS!</text>`, '#f2e0a0');
  }
  function beachBoy() {
    return wrap(`${rope('M14 150 Q36 80 104 18', '#8a6a4a', 4)}
      <circle cx="30" cy="118" r="10" ${F('#c8c8d8')}/><circle cx="30" cy="118" r="4" ${F('#6a6a7a', th)}/><path d="M30 118 L40 112" ${th}/>
      ${[0, 1, 2, 3, 4].map(i => { const t = 0.3 + i * 0.16; const x = 14 + (104 - 14) * t, y = 150 - (150 - 18) * t - Math.sin(t * Math.PI) * 18; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#f2c14e" ${th}/>`; }).join('')}
      <path d="M104 18 Q110 60 96 98 Q88 118 70 122" stroke="#e8e8f0" stroke-width="1.6" fill="none"/>
      <path d="M70 122 Q62 128 64 138 Q68 146 76 140" fill="none" stroke="${K}" stroke-width="4.4" stroke-linecap="round"/><path d="M70 122 Q62 128 64 138 Q68 146 76 140" fill="none" stroke="#c8c8d8" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M76 140 l2 -6 l3 5" ${F('#c8c8d8', th)}/>
      <path d="M40 146 q10 -6 20 0 t20 0 t20 0" stroke="#9fc7e8" stroke-width="2.4" fill="none"/>
      <text x="58" y="100" font-family="Bangers,Impact" font-size="12" fill="#f6ecd8" stroke="${K}" stroke-width=".8" transform="rotate(-14 58 100)">BIIIN</text>`, '#6ad0c8');
  }
  function aerosmith() {
    return wrap(`<g transform="translate(60 78) rotate(-12)">
      <path d="M-50 -2 Q-40 -16 20 -12 Q44 -10 50 0 Q44 10 20 12 Q-40 16 -50 2Z" ${F('#6a8a4a')}/>
      <path d="M-6 -12 L-18 -48 L4 -48 L14 -12Z" ${F('#5a7a3a')}/><path d="M-6 12 L-18 48 L4 48 L14 12Z" ${F('#5a7a3a')}/>
      <path d="M-44 -2 L-56 -18 L-48 -18 L-36 -4Z" ${F('#5a7a3a')}/>
      <circle cx="-10" cy="-30" r="5" fill="#f6ecd8" ${th}/><circle cx="-10" cy="-30" r="2" fill="#c8323c"/>
      <path d="M22 -10 Q30 -18 36 -8" ${F('#9fc7e8', th)}/>
      <path d="M36 4 Q42 10 50 0 Q42 2 36 4Z" fill="#c8323c" ${th}/><path d="M38 4 l2 3 2 -3 2 3 2 -3" stroke="#fff" stroke-width="1" fill="none"/>
      <circle cx="40" cy="-4" r="2.4" fill="#fff" ${th}/><circle cx="40.6" cy="-4" r="1" fill="${K}"/>
      <path d="M52 -26 L54 26" stroke="${K}" stroke-width="4.4" stroke-linecap="round"/><path d="M52 -26 L54 26" stroke="#e8e8f0" stroke-width="2" stroke-linecap="round"/>
      <circle cx="53" cy="0" r="4" ${F('#f2c14e', th)}/>
      <path d="M-30 -2 H10" stroke="#f2c14e" stroke-width="2"/></g>
      <path d="M10 124 l20 6 M8 134 l24 4 M12 144 l18 2" stroke="#fff" stroke-width="2" opacity=".7"/>
      ${bullet(96, 120, 150, '#fff3a0')}${bullet(86, 132, 160, '#fff3a0')}
      <text x="12" y="30" font-family="Bangers,Impact" font-size="14" fill="#f6ecd8" stroke="${K}" stroke-width="1">BRRRT</text>`, '#9fc7e8');
  }
  function kraftWork() {
    const head = `<path d="M46 32Q44 12 60 11Q76 12 74 32L70 46Q60 50 50 46z" ${F('#8a9a6a')}/><path d="M46 20 H74 M50 12 V46 M70 12 V46" stroke="#4a5a3a" stroke-width="2"/>${[[53, 24], [67, 24], [60, 40]].map(([x, y]) => `<rect x="${x - 3}" y="${y - 3}" width="6" height="6" fill="#a0c040" ${th}/>`).join('')}<path d="M52 32 l6 1.4 M68 32 l-6 1.4" stroke="${K}" stroke-width="3" stroke-linecap="round"/>`;
    const pat = `<path d="M20 60 H100 M20 84 H100 M20 110 H100 M20 136 H100" stroke="#4a5a3a" stroke-width="2.4"/>${[[40, 72], [80, 72], [50, 98], [70, 98], [44, 124], [76, 124]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#a0c040" ${th}/>`).join('')}`;
    const stuck = [[14, 40, 90], [104, 36, -90], [10, 120, 60], [110, 110, -60], [20, 80, 80]].map(([x, y, a]) => bullet(x, y, a) + `<path d="M${x - 6} ${y - 6} l-4 -4 M${x + 6} ${y - 6} l4 -4" stroke="#a0c040" stroke-width="1.6"/>`).join('');
    return human('#8a9a6a', pat, head, stuck);
  }
  function moodyBlues() {
    const head = `<path d="M46 34Q44 12 60 11Q76 12 74 34L70 46Q60 50 50 46z" ${F('#8a6ad0')}/><path d="M42 20 Q60 2 78 20 L74 26 Q60 16 46 26Z" ${F('#5a3a9a')}/>
      <rect x="49" y="22" width="22" height="9" rx="2" fill="#1a1020" ${th}/><text x="60" y="29.4" font-family="Anton,Impact" font-size="7" text-anchor="middle" fill="#6af0a0">12:07</text>
      <circle cx="54" cy="37" r="2.6" fill="#fff" ${th}/><circle cx="66" cy="37" r="2.6" fill="#fff" ${th}/><path d="M56 43 q4 2 8 0" ${th} fill="none"/>`;
    const pat = `<path d="M20 58 H100" stroke="#5a3a9a" stroke-width="6"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<circle cx="${28 + i * 9}" cy="58" r="2.6" fill="#c8a0e8" ${th}/>`).join('')}<path d="M40 90 q20 10 40 0 M36 120 q24 10 48 0" stroke="#c8a0e8" stroke-width="2.4" fill="none"/>`;
    const ghost = `<g opacity=".35" transform="translate(-14 4)"><path d="${BODY}" fill="#c8a0e8"/></g>`;
    return human('#8a6ad0', pat, head, `<path d="M8 20 a10 10 0 1 1 0 .1" stroke="#c8a0e8" stroke-width="2" fill="none"/><path d="M8 12 v8 h6" stroke="#c8a0e8" stroke-width="2" fill="none"/>`).replace('<defs>', ghost + '<defs>');
  }
  function stoneMask() {
    const spikes = [[-40, 0], [-34, -24], [-18, -40], [0, -46], [18, -40], [34, -24], [40, 0]].map(([x, y]) => `<path d="M${60 + x * 0.6} ${70 + y * 0.6} L${60 + x * 1.35} ${70 + y * 1.35}" stroke="${K}" stroke-width="4.4" stroke-linecap="round"/><path d="M${60 + x * 0.6} ${70 + y * 0.6} L${60 + x * 1.35} ${70 + y * 1.35}" stroke="#e8e0d0" stroke-width="2" stroke-linecap="round"/>`).join('');
    return wrap(`${spikes}<path d="M32 50 Q30 22 60 18 Q90 22 88 50 Q90 94 60 112 Q30 94 32 50Z" ${F('#b8a888')}/>
      <path d="M40 40 Q60 30 80 40 M44 92 Q60 102 76 92 M36 64 Q30 70 36 78 M84 64 Q90 70 84 78" stroke="#8a7a5a" stroke-width="2" fill="none"/>
      <path d="M40 56 Q48 48 56 56 Q48 62 40 56Z M64 56 Q72 48 80 56 Q72 62 64 56Z" fill="${K}"/>
      <path d="M56 62 L60 78 L64 62" stroke="#8a7a5a" stroke-width="2" fill="none"/>
      <path d="M46 88 Q60 82 74 88 Q60 94 46 88Z" fill="#6a1a2a" ${th}/><path d="M50 88 l2 4 2 -4 M66 88 l2 4 2 -4" stroke="#fff" stroke-width="1.2" fill="none"/>
      ${[[20, 130], [44, 140], [78, 136], [100, 128]].map(([x, y]) => `<path d="M${x} ${y} q-4 8 0 12 q4 -4 0 -12z" fill="#c8323c" ${th}/>`).join('')}`, '#c8323c');
  }
  function ripple() {
    return wrap(`${[16, 30, 44, 58].map((r, i) => `<circle cx="60" cy="80" r="${r}" fill="none" stroke="${i % 2 ? '#fff3a0' : '#f2c14e'}" stroke-width="${5 - i}" opacity="${1 - i * 0.18}"/>`).join('')}
      <circle cx="60" cy="80" r="10" ${F('#fff3a0')}/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4; return `<path d="M${(60 + Math.cos(a) * 64).toFixed(1)} ${(80 + Math.sin(a) * 64).toFixed(1)} l${(Math.cos(a) * 12).toFixed(1)} ${(Math.sin(a) * 12).toFixed(1)}" stroke="#f2c14e" stroke-width="3" stroke-linecap="round"/>`; }).join('')}
      <text x="60" y="152" font-family="Bangers,Impact" font-size="14" text-anchor="middle" fill="#fff3a0" stroke="${K}" stroke-width="1">KOHHHH</text>`, '#f2c14e');
  }
  Object.assign(SBR.stands.DEFS, {
    sd_emperor: { name: 'Emperor', draw: emperor },
    sd_hanged: { name: 'Hanged Man', draw: hangedMan },
    sd_temperance: { name: 'Yellow Temperance', draw: temperance },
    sd_death13: { name: 'Death 13', entity: true, draw: death13 },
    sd_harvest: { name: 'Harvest', entity: true, draw: harvest },
    sd_badco: { name: 'Bad Company', draw: badCompany },
    sd_pistols: { name: 'Sex Pistols', entity: true, draw: sexPistols },
    sd_beachboy: { name: 'Beach Boy', draw: beachBoy },
    sd_aerosmith: { name: 'Aerosmith', entity: true, draw: aerosmith },
    sd_kraft: { name: 'Kraft Work', entity: true, draw: kraftWork },
    sd_moody: { name: 'Moody Blues', entity: true, draw: moodyBlues },
    sd_stonemask: { name: 'The Stone Mask', draw: stoneMask },
    sd_ripple: { name: 'Hamon', draw: ripple },
  });
  const MAP = { sd_emperor: 'sd_emperor', sd_hanged: 'sd_hanged', sd_temperance: 'sd_temperance', sd_blob: 'sd_temperance', sd_death13: 'sd_death13', sd_harvest: 'sd_harvest',
    sd_badco: 'sd_badco', sd_pistols: 'sd_pistols', sd_beachboy: 'sd_beachboy', sd_aerosmith: 'sd_aerosmith', sd_kraft: 'sd_kraft', sd_moody: 'sd_moody',
    sd_vampboss: 'sd_stonemask', sd_monk: 'sd_ripple' };
  const base = SBR.stands.keyFor;
  SBR.stands.keyFor = (u, abilityId) => (u && u.side === 'enemy' && MAP[u.id]) || base(u, abilityId);
})();

/* ================= 3. Enemies ================= */
(() => {
  const port = key => ({ kind: 'portrait', key });
  const beast = (type, color, bg) => ({ kind: 'creature', type, color, bg });
  const pick = a => SBR.util.pick(a);
  Object.assign(SBR.ENEMIES, {
    /* ---- Emperor: a card sharp whose gun is a Stand ---- */
    sd_emperor: { name: 'Laramie "Seven" Duvall', title: 'Card Sharp of the Pecos', art: port('sd_laramie'), tier: 'elite', hp: 56, stats: { aim: 8, luck: 7 }, xp: 26, money: [45, 65], dtype: 'bullet', res: { bullet: -0.1, stand: 0.1 },
      stand: 'Emperor', sigil: 'star', sigilColor: '#f2c14e', quote: 'Never bet against a man whose bullets can turn corners, partner.',
      passive: 'His revolver is a Stand. Its bullets turn corners in mid-air: they cannot be dodged.',
      abilities: [
        { name: 'Emperor: Homing Shot', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 7, { aim: 0.04 }, { noDodge: true, label: 'EMPEROR' }) },
        { name: 'Around the Corner', w: 2, cd: 2, target: 'allEnemies', fx: 'gun', run: x => x.enemies.forEach(e => x.dmg(e, 4, { aim: 0.03 }, { noDodge: true })) },
        { name: 'Deal Yourself an Ace', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'lucky', 0, 2); x.status(x.user, 'evasive', 0, 1); } },
      ] },
    /* ---- Hanged Man: a drifter who lives in reflections ---- */
    sd_hanged: { name: 'The Glass Drifter', title: 'Man in the Water Trough', art: port('sd_mirror'), tier: 'elite', hp: 60, stats: { aim: 6, ride: 7 }, xp: 28, money: [40, 60], dtype: 'stand', res: { bullet: 0.35, phys: 0.1, spin: -0.3, holy: -0.1 },
      stand: 'Hanged Man', sigil: 'claw', sigilColor: '#9fc7e8', quote: 'Every puddle, every window, every eye. I am in all of them.',
      passive: 'Hides inside reflections: bullets pass through the glass, Spin shatters it. Every other round it slips into a new reflection and the next hit misses.',
      abilities: [
        { name: 'Reflection Stab', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 6, { ride: 0.03 }, { noDodge: true }); if (r.hit) x.status(x.target, 'bleed', 2); } },
        { name: 'Leap Between Mirrors', w: 2, cd: 3, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'epitaph', 0, 3); x.status(x.user, 'evasive', 0, 2); } },
        { name: 'Hanged in the Glass', w: 1, cd: 4, target: 'enemy', fx: 'claw', run: x => x.dmg(x.target, 13, { ride: 0.04 }, { noDodge: true, label: 'HANGED MAN' }) },
      ],
      hooks: { roundStart: x => { if (x.round % 2 === 0 && !x.has(x.user, 'epitaph')) { x.status(x.user, 'epitaph', 0, 2); x.log('The Drifter slips into another reflection.'); } } } },
    /* ---- Yellow Temperance: a man whose Stand is an eating blob ---- */
    sd_temperance: { name: 'Honey-Mouth Ike', title: 'The Hungry Stranger', art: port('sd_glutton'), tier: 'elite', hp: 74, stats: { grit: 9 }, xp: 30, money: [40, 60], dtype: 'phys', res: { phys: 0.5, bullet: 0.4, bleed: 0.5, spin: 0.15, cold: -0.6, holy: -0.2 },
      stand: 'Yellow Temperance', sigil: 'claw', sigilColor: '#f2c14e', quote: 'Go on, punch me. It all just goes down the gullet.',
      passive: 'A Stand that eats. Physical hits, bullets and blood sink into it. Cold hardens it (weak to Cold).',
      abilities: [
        { name: 'Engulf', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 6, { grit: 0.03 }); if (r.hit) x.status(x.target, 'hooked', 0, 1); } },
        { name: 'Devour', w: 2, cd: 2, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 8, { grit: 0.03 }, { label: 'GULP' }); if (r.hit) x.heal(x.user, r.amount || 0); } },
        { name: 'Split Off', w: 1, cd: 4, target: 'self', fx: 'buff', cond: x => x.allies.length < 3, run: x => { x.summon('sd_blob'); x.log('A glob of Yellow Temperance splits off and crawls forward.'); } },
      ] },
    sd_blob: { name: 'Temperance Glob', art: beast('blob', '#f2d040', ['#e8742a', '#f2c14e']), hp: 14, stats: { grit: 4 }, xp: 4, money: [0, 4], res: { phys: 0.4, bullet: 0.4, cold: -0.6 },
      abilities: [{ name: 'Stick', w: 1, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 3, {}); if (r.hit) x.status(x.target, 'weak', 0, 1); } }] },
    /* ---- Death 13: a dream you fall into at a campfire ---- */
    sd_death13: { name: 'Death 13', title: 'The Dream at the Campfire', art: port('sd_death13'), tier: 'elite', hp: 64, stats: { spin: 6, luck: 6 }, xp: 30, money: [30, 50], dtype: 'stand', res: { bullet: 0.4, phys: 0.25, stand: -0.2, holy: -0.3 },
      stand: 'Death 13', sigil: 'clock', sigilColor: '#c8323c', quote: 'Lali-ho! Nobody brings a weapon into a dream. Nobody but me!',
      passive: 'You are asleep. The dream starts with everyone Weakened, and the reaper cannot be touched in the first round.',
      abilities: [
        { name: 'Scythe', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 7, { spin: 0.03 }); if (r.hit) x.status(x.target, 'bleed', 1); } },
        { name: 'Lali-Ho!', w: 2, cd: 3, target: 'allEnemies', fx: 'debuff', run: x => x.enemies.forEach(e => { x.dmg(e, 3, {}); x.status(e, 'blind', 0, 1); }) },
        { name: 'Nightmare Carousel', w: 1, cd: 4, target: 'enemy', fx: 'claw', run: x => { x.dmg(x.target, 11, { spin: 0.04 }, { noDodge: true, label: 'DEATH 13' }); x.status(x.target, 'fear', 0, 1); } },
      ],
      hooks: { start: x => { x.enemies.forEach(e => x.status(e, 'weak', 0, 2)); x.status(x.user, 'evasive', 0, 2); x.status(x.user, 'epitaph', 0, 2); }, death: x => x.log('You wake up by the fire, sweating. The baby is asleep.') } },
    /* ---- Harvest: a boy with a swarm that collects things ---- */
    sd_harvest: { name: 'Penny Callahan', title: 'The Boy Who Finds Coins', art: port('sd_coinboy'), tier: 'elite', hp: 44, stats: { luck: 8, aim: 4 }, xp: 22, money: [50, 80], dtype: 'stand', res: { stand: 0.1, phys: -0.1 },
      stand: 'Harvest', sigil: 'ball', sigilColor: '#f2c14e', quote: 'Five hundred of them, mister. They\'ll find every cent you\'ve got.',
      passive: 'Five hundred tiny Stands. They sting, and they carry off your money (you get it all back if you win).',
      abilities: [
        { name: 'Harvest Swarm', w: 3, target: 'enemy', fx: 'spray', run: x => { for (let i = 0; i < 3; i++) { if (x.target.dead) break; x.dmg(x.target, 2, { luck: 0.03 }); } } },
        { name: 'Pick Your Pockets', w: 2, cd: 2, target: 'enemy', fx: 'spray', run: x => { x.dmg(x.target, 3, {}); const n = Math.min(SBR.run.money, 6); if (n > 0) { SBR.run.money -= n; x.money(n * 2); x.c.push({ t: 'float', uid: x.target.uid, text: `-$${n}`, cls: 'debuff' }); } } },
        { name: 'More Harvest!', w: 1, cd: 3, target: 'self', fx: 'buff', cond: x => x.allies.length < 4, run: x => x.summon('sd_harvest_bug') },
      ] },
    sd_harvest_bug: { name: 'Harvest', art: beast('harvest', '#e8a020', ['#6aa04a', '#f2c14e']), hp: 7, stats: { ride: 8 }, xp: 2, money: [2, 6], dtype: 'stand', res: { phys: -0.2, bullet: 0.3 },
      abilities: [{ name: 'Sting', w: 1, target: 'enemy', fx: 'spray', run: x => x.dmg(x.target, 3, {}) }] },
    /* ---- Bad Company: a deserter with a toy army ---- */
    sd_badco: { name: 'Sergeant Amos Pike', title: 'Deserter of the 7th', art: port('sd_sergeant'), tier: 'elite', hp: 64, stats: { aim: 8, grit: 5 }, xp: 30, money: [45, 65], dtype: 'bullet', res: { bullet: -0.1, phys: 0.1 },
      stand: 'Bad Company', sigil: 'flag', sigilColor: '#8a9a5a', quote: 'Platoon! Fix bayonets! These trespassers are on MY hill!',
      passive: 'A whole miniature army: riflemen, tanks and helicopters. Every other round a new rifleman marches in.',
      abilities: [
        { name: 'Platoon Volley', w: 3, target: 'allEnemies', fx: 'gun', run: x => x.enemies.forEach(e => x.dmg(e, 3, { aim: 0.03 })) },
        { name: 'Apache Rocket', w: 2, cd: 2, target: 'enemy', fx: 'boom', run: x => { const r = x.dmg(x.target, 9, { aim: 0.03 }, { dtype: 'phys' }); if (r.hit) x.status(x.target, 'burn', 1); } },
        { name: 'Tank Shell', w: 1, cd: 3, target: 'enemy', fx: 'boom', run: x => x.dmg(x.target, 13, { aim: 0.04 }, { dtype: 'phys', label: 'BOOM' }) },
      ],
      hooks: { roundStart: x => { if (x.round % 2 === 1 && x.allies.length < 4) { x.summon('sd_toysoldier'); x.log('"Reinforcements, Sergeant!" A toy rifleman marches into the line.'); } } } },
    sd_toysoldier: { name: 'Bad Company Rifleman', art: beast('toysoldier', '#4a5a3a', ['#8a9a5a', '#e8d8a8']), hp: 8, stats: { aim: 5 }, xp: 2, money: [1, 4], dtype: 'bullet', res: { phys: -0.3 },
      abilities: [{ name: 'Tiny Rifle', w: 1, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 3, { aim: 0.03 }) }] },
    /* ---- Sex Pistols: six tiny Stands kick his bullets ---- */
    sd_pistols: { name: 'Dutch Rourke', title: 'The Six-Bullet Man', art: port('sd_sixgun'), tier: 'elite', hp: 70, stats: { aim: 10, luck: 6 }, xp: 34, money: [50, 75], dtype: 'bullet', res: { bullet: -0.15 },
      stand: 'Sex Pistols', sigil: 'star', sigilColor: '#f2e0a0', quote: 'One, two, three, five, six, seven. Don\'t say the other number. They hate it.',
      passive: 'Six little Stands ride his bullets and kick them mid-air. Shots cannot be dodged and often crit.',
      abilities: [
        { name: 'Pass! No. 1, 2, 3!', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 7, { aim: 0.04 }, { noDodge: true, forceCrit: x.roll(0.3), label: 'PASS!' }) },
        { name: 'Six Bullets', w: 2, cd: 2, target: 'allEnemies', fx: 'gun', run: x => { for (let i = 0; i < 6; i++) { const t = x.randomEnemy(); if (!t) break; x.dmg(t, 3, { aim: 0.03 }, { noDodge: true }); } } },
        { name: 'Kick It Back', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'reflect', 0, 2); x.log('No. 5 and No. 6 hover in front of him, ready to kick anything back.'); } },
      ] },
    /* ---- Beach Boy: a fisherman whose line goes through walls and ice ---- */
    sd_beachboy: { name: 'Old Galloway', title: 'The Ice Fisherman', art: port('sd_angler'), tier: 'elite', hp: 64, stats: { aim: 8, res: 6 }, xp: 30, money: [40, 60], dtype: 'stand', res: { cold: -0.3, phys: 0.1 },
      stand: 'Beach Boy', sigil: 'hook', sigilColor: '#6ad0c8', quote: 'The line feels your heartbeat through the ice, son. It always knows where you are.',
      passive: 'His line passes through walls and ice. Hooked riders cannot gain Energy, and Reel In hurts them far more.',
      abilities: [
        { name: 'Cast Through the Ice', w: 3, target: 'enemy', fx: 'rope', run: x => { const r = x.dmg(x.target, 5, { aim: 0.04 }, { noDodge: true }); if (r.hit) x.status(x.target, 'hooked', 0, 2); } },
        { name: 'Reel In', w: 2, cd: 2, target: 'enemy', fx: 'rope', run: x => x.dmg(x.target, x.has(x.target, 'hooked') ? 14 : 6, { aim: 0.04 }, { label: 'REEL' }) },
        { name: 'The Line Trembles', w: 1, cd: 3, target: 'allEnemies', fx: 'scan', run: x => x.enemies.forEach(e => x.status(e, 'marked', 0, 1)) },
      ] },
    /* ---- Aerosmith: a boy pilot with a Stand fighter plane ---- */
    sd_aerosmith: { name: 'Skip Harlan', title: 'The Barnstormer', art: port('sd_pilot'), tier: 'elite', hp: 56, stats: { aim: 9, ride: 8 }, xp: 32, money: [45, 65], dtype: 'bullet', res: { bullet: 0.2, phys: 0.2, cold: 0.1 },
      stand: 'Aerosmith', sigil: 'star', sigilColor: '#9fc7e8', quote: 'My radar sees your breath, mister! Hold it as long as you like!',
      passive: 'A Stand fighter plane. It starts in the air (Evasive), and its radar sees every breath: nobody hides from it.',
      abilities: [
        { name: 'Strafing Run', w: 3, target: 'allEnemies', fx: 'gun', run: x => x.enemies.forEach(e => x.dmg(e, 3, { aim: 0.03 })) },
        { name: 'Bomb Drop', w: 2, cd: 3, target: 'enemy', fx: 'boom', run: x => { const r = x.dmg(x.target, 11, { aim: 0.03 }, { dtype: 'phys', label: 'BOMB' }); if (r.hit) x.status(x.target, 'vuln', 0, 1); } },
        { name: 'CO2 Radar', w: 1, cd: 4, target: 'allEnemies', fx: 'scan', run: x => x.enemies.forEach(e => x.status(e, 'marked', 0, 2)) },
      ],
      hooks: { start: x => x.status(x.user, 'evasive', 0, 3) } },
    /* ---- Kraft Work: fixes anything he touches in place ---- */
    sd_kraft: { name: 'Mr. Stillwater', title: 'The Man Who Stops Things', art: port('sd_fixer'), tier: 'elite', hp: 84, stats: { grit: 9, res: 6 }, xp: 36, money: [55, 80], dtype: 'stand', res: { bullet: 0.5, phys: 0.1, spin: -0.1 },
      stand: 'Kraft Work', sigil: 'magnet', sigilColor: '#a0c040', quote: 'Your bullet is quite still now. So, in a moment, will you be.',
      passive: 'Anything he touches stays exactly where it is. Bullets hang in the air in front of him (resists Gunshot).',
      abilities: [
        { name: 'Fixed Punch', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 8, { grit: 0.04 }) },
        { name: 'Fix in Place', w: 2, cd: 2, target: 'enemy', fx: 'debuff', run: x => { x.dmg(x.target, 3, {}); x.status(x.target, 'hooked', 0, 2); if (x.roll(0.5)) x.status(x.target, 'stun', 0, 1); } },
        { name: 'Stopped Bullets', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'shield', 14); x.status(x.user, 'reflect', 0, 1); } },
      ] },
    /* ---- Moody Blues: an investigator whose Stand replays the past ---- */
    sd_moody: { name: 'Inspector Delia Marsh', title: 'Pinkerton Agency', art: port('sd_replay'), tier: 'elite', hp: 76, stats: { aim: 7, res: 8 }, xp: 34, money: [50, 70], dtype: 'stand', res: { stand: 0.1, bullet: -0.1 },
      stand: 'Moody Blues', sigil: 'star', sigilColor: '#8a4ad0', quote: 'I\'ve already watched you do it. Twelve-oh-seven, on the dot.',
      passive: 'Her Stand replays anyone\'s past. She copies your own strongest blows back at you.',
      abilities: [
        { name: 'Replay: Your Punch', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 4 + Math.round(x.target.maxHp * 0.08), {}, { label: 'REPLAY' }) },
        { name: 'Rewind the Scene', w: 1, cd: 4, target: 'self', fx: 'buff', run: x => { x.heal(x.user, 16); x.status(x.user, 'evasive', 0, 1); } },
        { name: 'Pinkerton Derringer', w: 2, cd: 1, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 7, { aim: 0.04 }) },
      ] },
    /* ---- Vampires ---- */
    sd_vampboss: { name: 'Lucien Marrow', title: 'Keeper of the Red Lantern Saloon', art: port('sd_vampboss'), tier: 'elite', undead: true, hp: 72, stats: { grit: 8, spin: 7, aim: 6 }, xp: 40, money: [60, 90], dtype: 'bleed', res: { bullet: 0.3, phys: 0.2, bleed: 0.3, cold: 0.3, spin: -0.25 },
      stand: 'Vampire · Stone Mask', sigil: 'drops', sigilColor: '#c8323c', quote: 'I put on a mask in Mexico and never saw the sun again. I do not miss it.',
      passive: 'Undead: Holy damage deals double, Spin burns. Heals 4 every turn. Bullets barely hurt him.',
      abilities: [
        { name: 'Blood Drain', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 7, { grit: 0.04 }, { dtype: 'bleed' }); if (r.hit) x.heal(x.user, r.amount || 0); } },
        { name: 'Vaporization Freeze', w: 2, cd: 3, target: 'enemy', fx: 'rain', run: x => { const r = x.dmg(x.target, 8, { spin: 0.04 }, { dtype: 'cold' }); if (r.hit) { x.status(x.target, 'chilled', 0, 2); if (x.roll(0.4)) x.status(x.target, 'stun', 0, 1); } } },
        { name: 'Space Ripper Stingy Eyes', w: 1, cd: 4, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 12, { aim: 0.04 }, { dtype: 'true', noDodge: true, pierce: true, label: 'STINGY EYES' }) },
      ],
      hooks: { turnStart: x => x.heal(x.user, 4), death: x => x.log('Lucien Marrow crumbles to ash. The Stone Mask cracks on the floorboards.') } },
    sd_vampire: { name: 'Masked Outlaw', art: port('sd_vampire'), undead: true, hp: 28, stats: { grit: 5, ride: 6 }, xp: 11, money: [10, 20], dtype: 'bleed', res: { bullet: 0.25, bleed: 0.3, spin: -0.25 },
      passive: 'Undead. Holy damage deals double.',
      abilities: [
        { name: 'Bite', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 5, { grit: 0.03 }); if (r.hit) { x.status(x.target, 'bleed', 1); x.heal(x.user, 3); } } },
        { name: 'Inhuman Lunge', w: 1, cd: 2, target: 'enemy', fx: 'claw', run: x => x.dmg(x.target, 9, { ride: 0.03 }, { noDodge: true }) },
      ] },
    sd_zombie: { name: 'Saloon Zombie', art: port('sd_zombie'), undead: true, hp: 22, stats: { grit: 4 }, xp: 6, money: [2, 8], dtype: 'phys', res: { bleed: 0.5, bullet: 0.2 },
      passive: 'Undead. Holy damage deals double.',
      abilities: [{ name: 'Dead Grip', w: 1, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 4, {}); if (r.hit && x.roll(0.4)) x.status(x.target, 'hooked', 0, 1); } }] },
    sd_zhorse: { name: 'Zombie Horse', art: beast('zhorse', '#8a9a7a', ['#2a3a2a', '#8a2a2a']), undead: true, hp: 30, stats: { ride: 8, grit: 4 }, xp: 9, money: [2, 8], dtype: 'phys', res: { bleed: 0.5, cold: 0.3, bullet: 0.1 },
      passive: 'Stitched back together by a vampire\'s blood. Undead: Holy damage deals double.',
      abilities: [
        { name: 'Dead Gallop', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 6, { ride: 0.03 }) },
        { name: 'Stampede', w: 1, cd: 3, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => x.dmg(e, 3, { ride: 0.02 })) },
      ] },
    /* ---- Hamon ---- */
    sd_monk: { name: 'Brother Caspar', title: 'The Breathing Monk', art: port('sd_monk'), tier: 'elite', hp: 62, stats: { grit: 7, res: 9 }, xp: 30, money: [20, 35], dtype: 'holy', res: { holy: -0.3, cold: -0.1, bleed: -0.2 },
      stand: 'Hamon (the Ripple)', sigil: 'spiral', sigilColor: '#f2c14e', quote: 'Breathe with me. If you still want to fight when your lungs are full, we will fight.',
      passive: 'A sparring match. He breathes the Ripple: heals 4 each turn and strikes with sunlight.',
      abilities: [
        { name: 'Ripple Palm', w: 3, target: 'enemy', fx: 'golden', run: x => x.dmg(x.target, 7, { res: 0.04 }, { dtype: 'holy' }) },
        { name: 'Zoom Punch', w: 2, cd: 2, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 10, { grit: 0.03 }, { noDodge: true, label: 'ZOOM' }) },
        { name: 'Sendo Overdrive', w: 1, cd: 3, target: 'allEnemies', fx: 'golden', run: x => x.enemies.forEach(e => { const r = x.dmg(e, 5, { res: 0.03 }, { dtype: 'holy' }); if (r.hit && x.roll(0.3)) x.status(e, 'stun', 0, 1); }) },
      ],
      hooks: { turnStart: x => x.heal(x.user, 4) } },
    /* ---- A Pillar Man, asleep in a quarry since before Rome ---- */
    sd_pillarman: { name: 'The Sleeper in the Pillar', title: 'Older Than Rome', art: port('sd_pillarman'), tier: 'elite', undead: true, hp: 150, stats: { grit: 12, spin: 9, ride: 8 }, xp: 70, money: [90, 130], dtype: 'phys', res: { bullet: 0.4, phys: 0.3, bleed: 0.5, cold: 0.2, stand: 0.1 },
      stand: 'Pillar Man', sigil: 'cross', sigilColor: '#e8d8a8', quote: 'Humans. Still so small. Still so warm.',
      passive: 'A Pillar Man. Stone skin (starts Shielded), absorbs flesh on contact, and grows furious when hurt. Sunlight is death: Holy deals double.',
      abilities: [
        { name: 'Absorb', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 9, { grit: 0.03 }); if (r.hit) x.heal(x.user, r.amount || 0); } },
        { name: 'Flesh Blades', w: 2, cd: 2, target: 'allEnemies', fx: 'claw', run: x => x.enemies.forEach(e => { const r = x.dmg(e, 6, { spin: 0.03 }, { dtype: 'bleed' }); if (r.hit) x.status(e, 'bleed', 2); }) },
        { name: 'Heat Mode', w: 1, cd: 4, target: 'allEnemies', fx: 'boom', run: x => x.enemies.forEach(e => { x.dmg(e, 8, { spin: 0.03 }); x.status(e, 'burn', 2); }) },
      ],
      hooks: {
        start: x => x.status(x.user, 'shield', 24),
        damaged: x => { if (!x.flag('pmRage') && x.user.hp < x.user.maxHp * 0.5) { x.setFlag('pmRage'); x.status(x.user, 'empower', 0, 3); x.status(x.user, 'evasive', 0, 2); x.say(x.user, 'You dare wound one of the Pillar Men?'); } },
        death: x => x.log('Dawn light reaches the quarry. The Pillar Man turns back into stone, and then into sand.'),
      } },
  });
  Object.assign(SBR.DROPS, {
    sd_emperor: [['powder', 1, 2, 3], ['silver', 0.6, 1, 2], ['gold', 0.3, 1, 1]],
    sd_hanged: [['silver', 0.8, 1, 2], ['cloth', 0.6, 1, 2], ['bone', 0.4, 1, 1]],
    sd_temperance: [['sap', 0.5, 1, 1], ['hide', 0.7, 1, 2], ['herb', 0.6, 1, 2]],
    sd_blob: [['sap', 0.15, 1, 1]],
    sd_death13: [['cloth', 0.8, 1, 2], ['silver', 0.5, 1, 1], ['menger', 0.2, 1, 1]],
    sd_harvest: [['silver', 1, 1, 3], ['gold', 0.5, 1, 1], ['scrap', 0.6, 1, 2]],
    sd_harvest_bug: [['scrap', 0.2, 1, 1]],
    sd_badco: [['scrap', 1, 2, 3], ['powder', 0.8, 1, 2], ['leather', 0.5, 1, 1]],
    sd_toysoldier: [['scrap', 0.3, 1, 1]],
    sd_pistols: [['powder', 1, 2, 3], ['silver', 0.6, 1, 2], ['ballfrag', 0.3, 1, 1]],
    sd_beachboy: [['hide', 0.8, 1, 2], ['bone', 0.6, 1, 2], ['rainvial', 0.3, 1, 1]],
    sd_aerosmith: [['scrap', 1, 2, 3], ['cloth', 0.6, 1, 2], ['powder', 0.6, 1, 2]],
    sd_kraft: [['scrap', 0.8, 1, 2], ['silver', 0.6, 1, 2], ['menger', 0.3, 1, 1]],
    sd_moody: [['cloth', 0.8, 1, 2], ['silver', 0.6, 1, 2], ['gold', 0.3, 1, 1]],
    sd_vampboss: [['bone', 1, 2, 3], ['gold', 0.6, 1, 2], ['silver', 0.6, 1, 2], ['sap', 0.3, 1, 1]],
    sd_vampire: [['bone', 0.6, 1, 1], ['cloth', 0.4, 1, 1]],
    sd_zombie: [['bone', 0.4, 1, 1], ['cloth', 0.3, 1, 1]],
    sd_zhorse: [['hide', 0.7, 1, 2], ['bone', 0.5, 1, 1], ['leather', 0.4, 1, 1]],
    sd_monk: [['herb', 1, 2, 3], ['sap', 0.4, 1, 1]],
    sd_pillarman: [['fossil', 1, 2, 3], ['gold', 1, 1, 2], ['sap', 0.7, 1, 2], ['menger', 0.5, 1, 1]],
  });
  void pick;
})();

/* ================= 4. The encounters ================= */
(() => {
  const E = [];
  /** event + its consequences: C[i] belongs to choices[i]; C[i].fail to its failed check */
  const ev = (o, C) => {
    E.push(Object.assign({ type: 'event', icon: 'question', weight: 2, once: true, pace: -2, side: true }, o));
    C.forEach((c, i) => { if (!c) return; const { fail, ...ok } = c; SBR.CONSEQ[o.id + ':' + i] = ok; if (fail) SBR.CONSEQ[o.id + ':' + i + ':fail'] = fail; });
  };
  const rnd = (a, b) => SBR.util.randInt(a, b);

  /* ----- Act I-II: Emperor ----- */
  ev({ id: 'sd_emperor', acts: [1, 2], title: 'The Gambler\'s Second Gun', blurb: 'A card sharp at a canvas saloon, winning every hand.', icon: 'dice', art: 'sd_laramie',
    text: 'Laramie "Seven" Duvall is dealing faro to a table of broke racers. A man calls him a cheat and draws. Laramie\'s hand is empty. A second later it isn\'t: a gold revolver has grown out of his palm. The shot curves around a tent pole and knocks the other man\'s hat off. "Anyone else?"',
    choices: [
      { label: 'Sit down and play him (LUCK)', check: { stat: 'luck', dc: 13 }, ok: { text: 'You beat him on the river card. He laughs, pays up, and throws in his lucky earrings. "Won \'em off a Frenchman. Nobody\'s beaten me since." (+$90, Polnareff\'s Earrings.)', fx: g => { g.money(90); g.gear('gold_ring'); } },
        fail: { text: 'You catch him bottom-dealing. He catches you catching him. The Emperor comes out.', fight: { enemies: ['sd_emperor', 'bandit'], elite: true, after: g => g.money(40) } } },
      { label: 'Call him out: a Stand user shouldn\'t fleece racers', ok: { text: '"Big words." He stands up and the gun grows back into his hand.', fight: { enemies: ['sd_emperor'], elite: true, after: g => { g.gear('silver_rounds'); g.money(30); } } } },
      { label: 'Tip your hat and ask for advice', ok: { text: '"Two things. Never be Number One: Number Two lives longer. And bullets that turn corners are worth more than bullets that hit hard." He buys your coffee. (+15 XP, +2 German Army Powder.)', fx: g => { g.xp(15); g.mat('powder', 2); } } },
    ] }, [
    { deed: 'Beat a Stand user at faro.', rep: { racers: 1 }, fail: { deed: 'Got into a gunfight over a crooked faro game.', rep: { law: -1 } } },
    { deed: 'Stopped a Stand user from fleecing broke racers.', rep: { racers: 2, law: 1 } },
    { deed: 'Took advice from a Stand-using card sharp.', npc: { sd_laramie: 'friend' } },
  ]);

  /* ----- Act I & III: Harvest (Pocoloco can join) ----- */
  ev({ id: 'sd_harvest', acts: [1, 3], title: 'Coins in the Grass', blurb: 'Something small is carrying off every coin in town.', icon: 'coin', art: 'sd_coinboy',
    text: 'Nobody in town can find a single coin. A boy of twelve sits on the church steps counting a mountain of them, while little striped creatures pour out of every crack in the boardwalk carrying one cent each. "I don\'t steal," he says. "They find things. It\'s different."',
    choices: [
      { label: 'Make a deal: he finds, you split ($20 stake)', cost: { money: 20 }, ok: { text: 'By sundown the swarm has emptied three abandoned mine shafts and a dead man\'s mattress. He keeps his word. (+$85, 2 Silver, 1 Gold.)', fx: g => { g.money(85); g.mat('silver', 2); g.mat('gold', 1); } } },
      { label: 'Make him give it back', ok: { text: 'He whistles. Five hundred tiny Stands turn toward you.', fight: { enemies: ['sd_harvest', 'sd_harvest_bug', 'sd_harvest_bug'], elite: true, after: g => { g.gear('silver_dollar'); g.rep('law', 1); } } } },
      { label: 'Let the lucky farmer talk to him', req: g => !g.hasAlly('pocoloco'), reqText: 'Pocoloco is already with you',
        ok: { text: 'A grinning farmer in a bib is sitting next to the boy, and the swarm keeps dropping coins in HIS lap too. "It\'s just my lucky day! Every day is." Pocoloco decides you look lucky as well, and rides along.', fx: g => { g.recruit('pocoloco'); g.money(25); } } },
    ] }, [
    { deed: 'Went into business with a boy whose Stand finds coins.', npc: { sd_coinboy: 'friend' } },
    { deed: 'Fought a boy with a swarm Stand to return a town\'s money.', rep: { law: 1, racers: 1 } },
    { deed: 'Met Pocoloco beside the boy with the coin swarm.', rep: { racers: 1 } },
  ]);

  /* ----- Act II-III: Hanged Man ----- */
  ev({ id: 'sd_hanged', acts: [2, 3], title: 'The Man in the Water Trough', blurb: 'A rider was stabbed. Nobody was standing near him.', icon: 'skull', art: 'sd_mirror',
    text: 'A racer lies beside a water trough with a knife wound in his back and nobody within twenty yards. In the still water, you see a bandaged figure with a blade in its wrist. It isn\'t there when you turn around. On the porch across the street, a drifter in a pork-pie hat raises his glass to you.',
    choices: [
      { label: 'Kick over every trough and cover every window (GRIT)', check: { stat: 'grit', dc: 13 }, ok: { text: 'No reflections left. The drifter\'s Stand has nowhere to live, and he comes out swinging a plain knife. You take it off him easily, and the spurs off his boots. (+$60, Hol Horse\'s Spurs.)', fx: g => { g.money(60); g.gear('spurs'); } },
        fail: { text: 'You miss a shop window. Something steps out of it.', fight: { enemies: ['sd_hanged'], elite: true, after: g => g.money(20) } } },
      { label: 'Go straight at the drifter', ok: { text: 'He smiles and looks at your eyes. At his own reflection in them.', fight: { enemies: ['sd_hanged', 'outlaw'], elite: true, after: g => { g.gear('starred_cap'); g.money(35); } } } },
      { label: 'Pay him to take the next train out ($35)', cost: { money: 35 }, ok: { text: 'He tips his hat. "Shortcut through the arroyo, since you\'re so polite. No water there, so no me." (+12 Pace.)', fx: g => g.pace(12) } },
    ] }, [
    { deed: 'Starved a mirror Stand of reflections.', rep: { racers: 1 }, fail: { deed: 'Fought a Stand that lives in reflections.' } },
    { deed: 'Fought the Glass Drifter to avenge a racer.', rep: { racers: 2 } },
    { deed: 'Paid off a racer-killer.', rep: { racers: -1, law: -1 } },
  ]);

  /* ----- Act II & IV: zombie horses (Mountain Tim can join) ----- */
  ev({ id: 'sd_zhorses', acts: [2, 4], title: 'Hoofbeats With No Heartbeat', blurb: 'A herd of horses that do not breathe.', icon: 'horseshoe', art: null,
    text: 'At dusk a herd comes over the ridge at full gallop, without a sound from their lungs. Their hides are stitched with black thread; their eyes shine red. Somewhere a vampire made them, fed them its blood, and let them loose. They are heading for a ranch full of sleeping people.',
    choices: [
      { label: 'Turn the herd (fight)', ok: { text: 'You ride into their path.', fight: { enemies: ['sd_zhorse', 'sd_zhorse', 'sd_zhorse'], after: g => { g.gear('zombiehorse'); g.mat('hide', 2); g.rep('law', 1); } } } },
      { label: 'Lead them east until the sun comes up (RIDING)', check: { stat: 'ride', dc: 14 }, ok: { text: 'You ride all night with the dead at your heels. At first light they fall apart in the grass like old saddles. The rancher gives you a horse blanket and a bag of silver. (+$50, 2 Silver, +8 Pace.)', fx: g => { g.money(50); g.mat('silver', 2); g.pace(8); } },
        fail: { text: 'They catch you an hour before dawn.', fight: { enemies: ['sd_zhorse', 'sd_zhorse'] } } },
      { label: 'Help the cowboy who is roping them', req: g => !g.hasAlly('mountaintim'), reqText: 'Mountain Tim is already with you',
        ok: { text: 'A cowboy in a tall hat is roping dead horses one at a time, and his rope goes through them like they are made of smoke. "Could use a hand, stranger."', fight: { enemies: ['sd_zhorse', 'sd_zhorse'], after: g => { g.recruit('mountaintim'); g.money(30); } } } },
    ] }, [
    { deed: 'Stopped a herd of zombie horses before it reached a ranch.', rep: { law: 1, racers: 1 } },
    { deed: 'Led a herd of zombie horses into the sunrise.', rep: { law: 1 }, fail: { deed: 'Was caught by zombie horses before dawn.' } },
    { deed: 'Roped zombie horses beside Mountain Tim.', npc: { mountaintim: 'friend' }, rep: { law: 1 } },
  ]);

  /* ----- Act II & IV: Death 13 ----- */
  ev({ id: 'sd_death13', acts: [2, 4], title: 'The Campfire Baby', blurb: 'An abandoned baby by a warm fire. It is watching you.', icon: 'fire', art: 'sd_death13', pace: -3,
    text: 'An empty camp, a fire still burning, and a baby in a basket who stops crying the moment you sit down. It is very small. It looks at you like an old man looks at a chessboard. Everybody is so tired. It would be easy to sleep here.',
    choices: [
      { label: 'Sleep by the fire', ok: { text: 'You dream of a fairground at night, and a clown with a scythe. "Lali-ho! Welcome to my dream!"', fight: { enemies: ['sd_death13'], elite: true, after: g => { g.healAll(0.6); g.unexhaust(1); g.gear('nun_veil'); g.xp(15); } } } },
      { label: 'Stay awake all night (RESOLVE)', check: { stat: 'res', dc: 14 }, ok: { text: 'You pinch yourself until dawn. At sunrise the baby is just a baby, cross and hungry. You leave it with a doctor\'s wife in the next town, who pays you for your trouble. (+$60, +20 XP.)', fx: g => { g.money(60); g.xp(20); } },
        fail: { text: 'You nod off for a second. The fairground lights come on.', fight: { enemies: ['sd_death13'], elite: true, after: g => g.xp(10) } } },
      { label: 'Carve a warning into your arm and sleep anyway', ok: { text: 'In the dream the words are there, bleeding: IT IS THE BABY. You wake yourself before the reaper finds you, and you ride on shaking, but rested. (Party heals 35%, one rider takes a small cut.)', fx: g => { g.healAll(0.35); g.hurtRandom(4); } } },
    ] }, [
    { deed: 'Fought a Stand inside a dream.', rep: {} },
    { deed: 'Stayed awake beside a baby with a Stand, and found it a home.', rep: { law: 1 }, fail: { deed: 'Fell asleep beside a baby with a Stand.' } },
    { deed: 'Carved a warning into your own arm to escape a dream.', rep: {} },
  ]);

  /* ----- Act III: Yellow Temperance ----- */
  ev({ id: 'sd_temperance', acts: [3], title: 'The Hungry Stranger', blurb: 'A friendly fat man at the chuckwagon. The mule is missing.', icon: 'skull', art: 'sd_glutton',
    text: 'A cheerful man with a yellow face offers you his supper. Behind him the chuckwagon mule is gone, harness and all, and there is a yellow smear on the wagon wheel that is still moving. "I eat what I like," Honey-Mouth Ike says pleasantly. "Sit down. You look delicious. I mean hungry. You look hungry."',
    choices: [
      { label: 'Fight him', ok: { text: 'Your fist sinks into his cheek up to the wrist, and he laughs.', fight: { enemies: ['sd_temperance'], elite: true, after: g => { g.gear('buffalo_coat'); g.money(40); } } } },
      { label: 'Lure him into the icy creek (SPIN)', check: { stat: 'spin', dc: 14 }, ok: { text: 'The cold water sets his Stand like candle wax. He begs you to pull him out, and pays you everything he\'s got to do it. (+$80, 2 Golden Sap.)', fx: g => { g.money(80); g.mat('sap', 2); } },
        fail: { text: 'He doesn\'t take the bait. He takes a bite.', fight: { enemies: ['sd_temperance', 'sd_blob'], elite: true, after: g => g.money(30) } } },
      { label: 'Give him all your food and back away slowly', ok: { text: 'He eats the jerky, the canteen, and the saddlebag. He is too full to chase you. You lose some supplies, but nobody gets eaten.', fx: g => { g.loseItem(); g.loseItem(); g.pace(4); g.xp(10); } } },
    ] }, [
    { deed: 'Fought a Stand that eats people.', rep: { racers: 1 } },
    { deed: 'Froze a Stand user in a creek, then fished him out for a price.', rep: {}, fail: { deed: 'Tried to trick a Stand that eats people. It bit.' } },
    { deed: 'Fed a monster to save your own skin.', rep: {} },
  ]);

  /* ----- Act III & V: a nest of vampires with a Stone Mask ----- */
  ev({ id: 'sd_vampnest', acts: [3, 5], type: 'elite', title: 'The Red Lantern Saloon', blurb: 'Open all night. Closed all day. Nobody leaves.', icon: 'skull', art: 'sd_vampboss', pace: -4,
    text: 'The Red Lantern only opens after dark. The piano plays itself, the whiskey is red, and every man at the bar has the same pale skin. Above the mirror hangs a stone mask with spikes folded under its brow. The keeper, Lucien Marrow, smiles with too many teeth. "Stay for a drink. Stay for good."',
    choices: [
      { label: 'Wait until dawn and storm it', ok: { text: 'You kick the shutters open as the sun comes up. Half of them burn. The other half come for you.', fight: { enemies: ['sd_vampboss', 'sd_vampire', 'sd_zombie'], elite: true, after: g => { g.gear('cassock'); g.money(60); g.mat('gold', 2); g.rep('vatican', 1); } } } },
      { label: 'Burn it down from outside (LUCK)', check: { stat: 'luck', dc: 14 }, ok: { text: 'Coal oil, a match, and the wind in your favour. By morning there is nothing but ash and a cracked stone mask, which you smash. In the cellar, an iron strongbox survived. (+$110, 1 Gold.)', fx: g => { g.money(110); g.mat('gold', 1); } },
        fail: { text: 'The wind turns. The doors burst open, and they are not afraid of a little smoke.', fight: { enemies: ['sd_vampboss', 'sd_vampire', 'sd_vampire'], elite: true, after: g => g.money(40) } } },
      { label: 'Steal the Stone Mask and ride', ok: { text: 'You grab it off the wall while Marrow is pouring. You are two miles away before they notice. A collector back East would pay a fortune for it, and nobody should wear it. (Stone Mask trinket, +1 Threat: they will tell someone.)', fx: g => { g.trinket('sd_stonemask'); g.threat(0.5); } } },
    ] }, [
    { deed: 'Cleared a saloon of Stone Mask vampires at dawn.', rep: { vatican: 2, law: 1 } },
    { deed: 'Burned a vampires\' saloon and smashed their Stone Mask.', rep: { vatican: 2 }, fail: { deed: 'Tried to burn out a vampire nest. They came out.' , rep: { vatican: 1 } } },
    { deed: 'Stole a Stone Mask from a vampire.', rep: { vatican: -1 }, flag: 'sdStoneMask' },
  ]);

  /* ----- Act II-V: the Hamon monk ----- */
  ev({ id: 'sd_hamon', acts: [2, 3, 4, 5], type: 'trainer', title: 'The Breathing Monk', blurb: 'An old monk sits under a waterfall, not getting wet.', icon: 'star', art: 'sd_monk', pace: -3, weight: 2,
    text: 'Water pours onto the old monk\'s shaved head and slides off him in rings, like sunlight on a pond. "The Ripple," he says without opening his eyes. "The breath of the sun. I am not a teacher. But I can show you how to breathe, and how to heal."',
    choices: [
      { label: 'Learn to breathe the Ripple (RESOLVE)', check: { stat: 'res', dc: 13 }, ok: { text: 'You breathe until your lungs burn gold. Your wounds close. When you stand, you feel lighter than you have since San Diego. (Party +1 RESOLVE and +1 GRIT, fully healed.)', fx: g => { g.statUpAll('res', 1); g.statUpAll('grit', 1); g.healAll(1); } },
        fail: { text: 'You cough water for ten minutes. He pats your back. "Breathe. Just breathe." (Party heals 50%.)', fx: g => g.healAll(0.5) } },
      { label: 'Ask him to heal the party', ok: { text: 'He lays a palm on each of you. Sunlight runs through your veins, and old aches leave you. (Full heal, −2 Exhaustion, and a flask of the waterfall.)', fx: g => { g.healAll(1); g.unexhaust(2); g.item('canteen'); } } },
      { label: 'Ask him to spar', ok: { text: '"Good. The Ripple learns best from a fist." He stands up out of the water, perfectly dry.', fight: { enemies: ['sd_monk'], elite: true, after: g => { g.gear('sap_amulet'); g.xp(25); g.healAll(0.5); } } } },
    ] }, [
    { deed: 'Learned to breathe the Ripple from a monk under a waterfall.', rep: { naples: 1 }, npc: { sd_monk: 'friend' }, fail: { deed: 'Nearly drowned trying to learn the Ripple.' } },
    { deed: 'Was healed by a Hamon monk.', npc: { sd_monk: 'friend' } },
    { deed: 'Sparred with a Hamon monk, and earned his respect.', rep: { naples: 1 }, npc: { sd_monk: 'friend' } },
  ]);

  /* ----- Act III-IV: Beach Boy ----- */
  ev({ id: 'sd_beachboy', acts: [3, 4], title: 'The Ice Fisherman', blurb: 'An old man fishing through a hole in the ice. His line goes into a barn.', icon: 'search', art: 'sd_angler',
    text: 'The old man\'s fishing line runs from the hole in the ice, across the snow, through the wall of a barn, and into the saddlebag of the racer who robbed him last week. He reels. Something screams inside the barn. "Beach Boy," he says. "Goes through anything. Wood, ice, men."',
    choices: [
      { label: 'Ask him to teach you his casting (AIM)', check: { stat: 'aim', dc: 13 }, ok: { text: 'You learn to feel a heartbeat through a line. He gives you his old sheriff\'s hat to keep the snow off. (Party +1 AIM, Sheriff\'s Stetson.)', fx: g => { g.statUpAll('aim', 1); g.gear('sheriff_hat'); } },
        fail: { text: 'You hook your own ear. He laughs for a long time, then fries you a trout. (Party heals 25%.)', fx: g => g.healAll(0.25) } },
      { label: 'Stop him: that racer has a right to a trial', ok: { text: '"Then you can take his place on the hook."', fight: { enemies: ['sd_beachboy'], elite: true, after: g => { g.gear('snowshoes'); g.money(45); g.rep('law', 1); } } } },
      { label: 'Buy a string of fish ($15)', cost: { money: 15 }, ok: { text: 'Hot trout on a frozen lake, and a bag of cherries for later. Nothing has ever tasted better. (Party heals 40%, 2 Kakyoin\'s Cherries.)', fx: g => { g.healAll(0.4); g.item('jerky'); g.item('jerky'); } } },
    ] }, [
    { deed: 'Learned to fish through walls from an old Stand user.', npc: { sd_angler: 'friend' }, fail: { deed: 'Hooked your own ear at an ice-fishing lesson.' } },
    { deed: 'Fought a fisherman to give a thief a fair trial.', rep: { law: 2 } },
    { deed: 'Bought fish from an old Stand user on the ice.', rep: {} },
  ]);

  /* ----- Act III-IV: Bad Company (Wekapipo can join) ----- */
  ev({ id: 'sd_badco', acts: [3, 4], type: 'elite', title: 'The Toy Fort', blurb: 'A deserter holds a hilltop with an army two inches tall.', icon: 'flag', art: 'sd_sergeant', pace: -4,
    text: 'The trail goes over a hill, and the hill belongs to Sergeant Amos Pike, who deserted the 7th Cavalry and never stopped fighting. His army is real: two hundred riflemen the size of your thumb, a dozen tanks, three helicopters. Their bullets are small. There are a lot of them.',
    choices: [
      { label: 'Storm the hill', ok: { text: '"PLATOON! Enemy on the ridge! FIRE AT WILL!"', fight: { enemies: ['sd_badco', 'sd_toysoldier', 'sd_toysoldier'], elite: true, after: g => { g.gear('cavalry_boots'); g.money(50); } } } },
      { label: 'Salute and report for inspection (RESOLVE)', check: { stat: 'res', dc: 14 }, ok: { text: 'You stand at attention for an hour while he inspects your kit. He drills you until sundown, then lets you pass with a real army canteen. (Party +1 AIM, 2 SPW Canteens.)', fx: g => { g.statUpAll('aim', 1); g.item('canteen'); g.item('canteen'); } },
        fail: { text: 'You laugh at the tiny tanks. That was a mistake.', fight: { enemies: ['sd_badco', 'sd_toysoldier', 'sd_toysoldier', 'sd_toysoldier'], elite: true, after: g => g.money(30) } } },
      { label: 'Join the soldier watching from the treeline', req: g => !g.hasAlly('wekapipo'), reqText: 'Wekapipo is already with you',
        ok: { text: 'A tall man in a Neapolitan coat has been watching the fort through a spyglass. "An army that small still has officers. Aim for him." He fights beside you, and afterwards he stays.', fight: { enemies: ['sd_badco', 'sd_toysoldier'], elite: true, after: g => { g.recruit('wekapipo'); g.money(30); } } } },
    ] }, [
    { deed: 'Took a hill held by a toy army.', rep: { law: 1 } },
    { deed: 'Passed inspection by a deserter with a Stand army.', rep: {}, fail: { deed: 'Laughed at a Stand army. It shot back.' } },
    { deed: 'Took the toy fort alongside Wekapipo.', npc: { wekapipo: 'friend' } },
  ]);

  /* ----- Act IV-V: Aerosmith ----- */
  ev({ id: 'sd_aerosmith', acts: [4, 5], title: 'Propeller in the Sky', blurb: 'A buzzing overhead. Racers ahead are diving for cover.', icon: 'skull', art: 'sd_pilot',
    text: 'A green fighter plane no bigger than a hawk comes screaming down the valley, strafing a line of racers. On the ridge, a freckled boy in flying goggles is steering it with his hands. "Stay in the ditch and you won\'t get hurt! I only want your stage points!"',
    choices: [
      { label: 'Hold your breath and hide (GRIT)', check: { stat: 'grit', dc: 14 }, ok: { text: 'His radar hunts for breath. You don\'t give it any. The plane circles, gives up, and you sneak up behind the boy and take his goggles. He cries. You give them back and he gives you his flying scarf. (+10 Pace, Racing Silks.)', fx: g => { g.pace(10); g.gear('silks'); } },
        fail: { text: 'You gasp. The radar blips.', fight: { enemies: ['sd_aerosmith'], elite: true, after: g => g.money(30) } } },
      { label: 'Shoot it down', ok: { text: 'You stand up in the road and draw. BRRRRT.', fight: { enemies: ['sd_aerosmith', 'rival_racer'], elite: true, after: g => { g.gear('winchester'); g.money(40); g.rep('racers', 1); } } } },
      { label: 'Wave a white flag and bribe him ($30)', cost: { money: 30 }, ok: { text: 'He takes the money and shows you a trick: the plane scouts the trail ahead. "Canyon\'s clear. Go left at the dead tree." (+15 Pace.)', fx: g => g.pace(15) } },
    ] }, [
    { deed: 'Outwitted a boy with a Stand fighter plane.', rep: { racers: 1 }, fail: { deed: 'Was found by a Stand plane\'s radar.' } },
    { deed: 'Shot down a Stand plane that was strafing racers.', rep: { racers: 2 } },
    { deed: 'Bribed a Stand user for a clear trail.', rep: { racers: -1 } },
  ]);

  /* ----- Act IV-V: Sex Pistols ----- */
  ev({ id: 'sd_pistols', acts: [4, 5], title: 'Six Little Bullets', blurb: 'A gunman is searching the road for something small.', icon: 'search', art: 'sd_sixgun',
    text: 'Dutch Rourke is on his knees in the road, turning over stones. "No. 5 is missing," he says. "Little fella, yellow, cries a lot." Five tiny creatures are riding on his hat brim, weeping. One of them is holding a bullet like a baby. "You seen him? And whatever you do, don\'t count past three."',
    choices: [
      { label: 'Help find No. 5 (LUCK)', check: { stat: 'luck', dc: 13 }, ok: { text: 'You find him asleep in a spent cartridge. The Pistols cheer and pile onto your hat. Dutch presses a box of rounds on you. "Specially made." (Sex Pistols Rounds, +$40.)', fx: g => { g.gear('silver_rounds'); g.money(40); } },
        fail: { text: 'You count them out loud. "One, two, three, four--" Every Pistol screams. Dutch draws.', fight: { enemies: ['sd_pistols'], elite: true, after: g => g.money(30) } } },
      { label: 'Challenge him to a duel', ok: { text: '"A duel? Boys, you hear that? We\'re dueling." The Pistols climb onto six bullets.', fight: { enemies: ['sd_pistols', 'outlaw'], elite: true, after: g => { g.gear('cavalry'); g.money(45); } } } },
      { label: 'Share your supper with the Pistols', ok: { text: 'They fight over the salami. No. 3 steals from No. 2. By the end they are asleep in your hat, and Dutch owes you. He teaches the whole party to shoot straighter. (Party +1 AIM, and one item is used up.)', fx: g => { g.statUpAll('aim', 1); g.loseItem(); } } },
    ] }, [
    { deed: 'Found a lost Sex Pistol for a gunman.', npc: { sd_sixgun: 'friend' }, fail: { deed: 'Said the number four in front of the Sex Pistols.' } },
    { deed: 'Duelled a Stand gunman.', rep: { racers: 1 } },
    { deed: 'Fed the Sex Pistols your supper.', npc: { sd_sixgun: 'friend' } },
  ]);

  /* ----- Act V: Kraft Work ----- */
  ev({ id: 'sd_kraft', acts: [5], title: 'The Man Who Stops Things', blurb: 'A clerk in a bowler hat. Every bullet fired at him is hanging in the air.', icon: 'hourglass', art: 'sd_fixer',
    text: 'Six bullets hang in the air in front of a bank clerk in a bowler hat, perfectly still. The robbers who fired them stare. He plucks one out of the air and flicks it back. "Kraft Work. Whatever I touch stays where it is. Would anyone else like to make a withdrawal?"',
    choices: [
      { label: 'Help him hold the bank against the robbers', ok: { text: 'You take the left door. He takes the right. It goes well until he decides you are a robber too.', fight: { enemies: ['sd_kraft', 'outlaw'], elite: true, after: g => { g.gear('irontoe_boots'); g.money(70); g.rep('law', 1); } } } },
      { label: 'Bet him he can\'t stop a spinning shot (SPIN)', check: { stat: 'spin', dc: 15 }, ok: { text: 'He stops the bullet. It keeps spinning in place, and drills slowly through his glove. He laughs until he cries, and pays up out of the vault. (+$120.)', fx: g => g.money(120) },
        fail: { text: 'He stops it dead, and then stops you dead too.', fight: { enemies: ['sd_kraft'], elite: true, after: g => g.money(40) } } },
      { label: 'Let him fix your horseshoes in place for the ride', ok: { text: 'Your horse\'s shoes will never throw, crack or slip again. It feels like riding on rails. (+14 Pace, and the party gains +1 RIDING.)', fx: g => { g.pace(14); g.statUpAll('ride', 1); } } },
    ] }, [
    { deed: 'Defended a bank with a Stand user who stops bullets.', rep: { law: 2 } },
    { deed: 'Beat Kraft Work with a spinning shot.', rep: { naples: 1 }, fail: { deed: 'Lost a bet to a man who stops things.' } },
    { deed: 'Had your horseshoes fixed in place by a Stand.', npc: { sd_fixer: 'friend' } },
  ]);

  /* ----- Act V-VI: Moody Blues ----- */
  ev({ id: 'sd_moody', acts: [5, 6], title: 'The Replay', blurb: 'A Pinkerton detective is replaying a robbery in the street.', icon: 'hourglass', art: 'sd_replay',
    text: 'In the middle of the street a purple figure is acting out a stagecoach robbery move by move, wearing the robber\'s face. A timer on its forehead runs backwards. Inspector Delia Marsh watches it, taking notes. "Moody Blues replays anyone\'s past. Twelve-oh-seven, yesterday. Now... where did he go?"',
    choices: [
      { label: 'Help her follow the replay (RESOLVE)', check: { stat: 'res', dc: 13 }, ok: { text: 'You follow the purple robber to a hayloft, where the real one is counting the money.', fight: { enemies: ['outlaw', 'outlaw', 'bandit'], after: g => { g.money(110); g.gear('sheriff_hat'); g.rep('law', 2); } } },
        fail: { text: 'You lose the replay in a crowd. The robbers are long gone. She thanks you anyway. (+15 XP.)', fx: g => g.xp(15) } },
      { label: 'Ask her to replay your own last week', ok: { text: 'Watching yourself is strange. Stranger is the man in a government coat who followed you for three days. Now you know his face, and how he works. (−1.5 Threat.)', fx: g => g.threat(-1.5) } },
      { label: 'Warn the robbers: they\'re racers, and they\'re broke', ok: { text: 'She sees you whisper to them. "Obstruction," she says calmly, and her Stand steps out of the replay wearing YOUR face.', fight: { enemies: ['sd_moody'], elite: true, after: g => { g.money(60); g.rep('racers', 2); g.gear('telegraph_coil'); } } } },
    ] }, [
    { deed: 'Caught stagecoach robbers with a Pinkerton\'s Stand.', rep: { law: 2 }, fail: { deed: 'Lost a replayed robber in the crowd.' } },
    { deed: 'Watched a replay of your own last week, and found a spy in it.', rep: { president: -1 } },
    { deed: 'Fought a Pinkerton to protect broke racers.', rep: { racers: 2, law: -2 } },
  ]);

  /* ----- Act V-VI: a Pillar Man ----- */
  ev({ id: 'sd_pillar', acts: [5, 6], type: 'elite', title: 'The Man in the Pillar', blurb: 'Quarrymen have found a stone column with a face in it.', icon: 'skull', art: 'sd_pillarman', pace: -4, weight: 1.5,
    text: 'The quarry foreman shows you what the dynamite uncovered: a stone pillar with a sleeping man inside it, older than anything on this continent. The miners want to chip him out and sell him to a museum. The stone is warm. On the pillar, in a language nobody can read, someone has carved a sun, over and over.',
    choices: [
      { label: 'Wake him, at night, and see what he is', ok: { text: 'You break the seal. The stone man opens his eyes and smiles at the lanterns.', fight: { enemies: ['sd_pillarman'], elite: true, after: g => { g.gear('menger_cube'); g.money(80); g.mat('sap', 2); g.xp(40); } } } },
      { label: 'Roll the pillar into the sun at noon (GRIT)', check: { stat: 'grit', dc: 15 }, ok: { text: 'It takes every man in the quarry and all morning. At noon the carving cracks and the thing inside screams once and turns to sand. In the sand: a red stone the size of a fist, and a gold armband. (+$90, 3 Gold, 2 Golden Sap.)', fx: g => { g.money(90); g.mat('gold', 3); g.mat('sap', 2); } },
        fail: { text: 'You drop it in the shade. The pillar splits.', fight: { enemies: ['sd_pillarman'], elite: true, after: g => { g.money(60); g.xp(25); } } } },
      { label: 'Tell them to fill the hole back in', ok: { text: 'The foreman grumbles, but he does it. That night a priest from the next town comes to bless the spot, and blesses you for it. (Party heals 50%, +20 XP.)', fx: g => { g.healAll(0.5); g.xp(20); } } },
    ] }, [
    { deed: 'Woke a Pillar Man in a quarry, and survived it.', rep: { vatican: 1 } },
    { deed: 'Rolled a Pillar Man into the noon sun.', rep: { vatican: 2 }, fail: { deed: 'Let a Pillar Man out of his pillar by accident.' } },
    { deed: 'Buried a Pillar Man again, unwoken.', rep: { vatican: 1 } },
  ]);

  SBR.EVENTS.push(...E);
  SBR.SIDE_EVENTS = E.map(e => e.id);

  /* the stolen Stone Mask: a trinket worth a fortune to a collector back East */
  if (SBR.TRINKETS) SBR.TRINKETS.sd_stonemask = { name: 'The Stone Mask', value: 140, rarity: 'rare', color: '#b8a888', desc: 'Spikes fold under its brow. Wear it and bleed on it, and you will never see the sun again. Better to sell it.' };
  if (SBR.trinketIcon) {
    const baseIcon = SBR.trinketIcon;
    const K = '#1a1020';
    SBR.trinketIcon = id => id !== 'sd_stonemask' ? baseIcon(id) : `<svg viewBox="0 0 48 48" class="ico"><path d="M12 20 L6 12 M16 14 L12 6 M24 12 V4 M32 14 L36 6 M36 20 L42 12" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/><path d="M12 20 Q12 10 24 10 Q36 10 36 20 Q36 36 24 42 Q12 36 12 20Z" fill="#b8a888" stroke="${K}" stroke-width="2.2"/><path d="M16 22 Q19 19 22 22 Q19 24 16 22Z M26 22 Q29 19 32 22 Q29 24 26 22Z" fill="${K}"/><path d="M19 33 Q24 30 29 33" stroke="${K}" stroke-width="1.6" fill="none"/></svg>`;
  }
})();
/* trinkets are gone: the stolen Stone Mask sells itself to a collector on the spot */
if (SBR.TRINKET_AS) SBR.TRINKET_AS.sd_stonemask = { money: 140, mats: { menger: 1 } };
