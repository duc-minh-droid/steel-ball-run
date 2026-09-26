/* Illustrated encounter scenes (see js/evscene.js for the toolkit) */
'use strict';
(() => {
  if (!SBR.evs) return;
  const K = '#1a1020';
  const add = SBR.evs.add;
  /* ---------- who is riding ---------- */
  const lead = () => (SBR.run && SBR.run.lead) || 'johnny';
  const has = id => !!(SBR.run && SBR.run.party && SBR.run.party.some(m => m.id === id));
  const LK = () => { const l = lead(); return (SBR.CHARS && SBR.CHARS[l] && SBR.CHARS[l].portrait) || l; };
  const PC = k => (SBR.art.P && SBR.art.P[k]) || {};
  /** the companion who stands next to the lead: Gyro if he rides with you, else Johnny, else nobody */
  const pal = () => { const l = lead(); if (l !== 'gyro' && has('gyro')) return 'gyro'; if (l !== 'johnny' && has('johnny')) return 'johnny'; return null; };
  const you = (S, x, y, s = 0.9, pose = 'stand', flip = false) => S.person(LK(), x, y, s, pose, flip);
  const buddy = (S, x, y, s = 0.85, pose = 'stand', flip = false) => { const b = pal(); return b ? S.person(b, x, y, s, pose, flip) : ''; };
  const gyro = (S, x, y, s = 0.85, pose = 'stand', flip = false) => has('gyro') || lead() === 'gyro' ? S.person('gyro', x, y, s, pose, flip) : '';
  const mount = () => { const h = (SBR.HORSES && SBR.run && SBR.HORSES[SBR.run.horse]) || {}; return { coat: h.coat || '#7a4a2a', mane: h.mane || '#e8e0d0', wrap: h.wrap || '#8a5ad0', marks: h.marks }; };
  /** a horse with a rider whose head is the given portrait (the lead by default) */
  const rider = (S, x, y, s = 1, flip = false, key, horse) => {
    const k = key || LK(), p = PC(k), o = Object.assign({}, horse || mount());
    o.rider = { body: p.outfit || '#6a4a2a', cape: p.outfit2 || '#3a2a1a', hat: 'none', skin: p.skin || '#e8c0a0', legs: '#3a2a3a' };
    const hx = x + (flip ? -6 : 6) * s;
    return S.horse(x, y, s, o, flip) + S.bust(k, hx, y - 92 * s, 0.4 * s, flip);
  };
  const H = (S, x, y, s = 1, flip = false, horse) => S.horse(x, y, s, horse || mount(), flip);

  /* ---------- props not in the scenery set ---------- */
  const fire = (x, y, s = 1, lit = true) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 0L22 -12M-24 -12L30 0" stroke="${K}" stroke-width="10" stroke-linecap="round"/><path d="M-30 0L22 -12M-24 -12L30 0" stroke="#7a4a2a" stroke-width="6" stroke-linecap="round"/>${lit ? `<path d="M-18 -8Q-22 -40 -4 -62Q-6 -40 6 -36Q4 -54 16 -70Q30 -40 18 -8Z" fill="#e8742a" stroke="${K}" stroke-width="2.6" stroke-linejoin="round"/><path d="M-8 -8Q-10 -30 2 -40Q4 -26 12 -22Q14 -14 10 -8Z" fill="#ffd84a"/>` : `<path d="M-6 -14q-8 -20 4 -34q-4 18 10 30" fill="none" stroke="#8a8090" stroke-width="3" opacity=".8"/>`}</g>`;
  const well = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-52 -18V-120M52 -18V-120" stroke="${K}" stroke-width="9"/><path d="M-52 -18V-120M52 -18V-120" stroke="#7a5230" stroke-width="5"/><path d="M-64 -120L0 -150L64 -120Z" fill="#8a4a2a" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M-56 -104H56" stroke="${K}" stroke-width="7"/><path d="M-56 -104H56" stroke="#a87a4a" stroke-width="3"/><path d="M-60 0V-40Q0 -52 60 -40V0Q0 12 -60 0Z" fill="#b8a080" stroke="${K}" stroke-width="3"/><path d="M-60 -40Q0 -28 60 -40" fill="none" stroke="${K}" stroke-width="2.5"/><ellipse cx="0" cy="-40" rx="52" ry="7" fill="#0a0610"/>${[-40, -12, 16, 44].map(bx => `<path d="M${bx} -30v26" stroke="${K}" stroke-width="1.5" opacity=".4"/>`).join('')}</g>`;
  const tent = (x, y, s = 1, c = '#e8dcc0', c2 = '#c8323c') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-110 0L0 -150L110 0Z" fill="${c}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M-70 0L0 -150L-30 0ZM30 0L0 -150L70 0Z" fill="${c2}" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/><path d="M-22 0L0 -64L22 0Z" fill="#2a1a20" stroke="${K}" stroke-width="2.4"/><path d="M0 -150V-176" stroke="${K}" stroke-width="3"/><path d="M0 -176l24 6-24 6z" fill="${c2}" stroke="${K}" stroke-width="2"/></g>`;
  const fence = (x0, x1, y, h = 44) => { let s = ''; for (let x = x0; x <= x1; x += 60) s += `<path d="M${x} ${y}V${y - h}" stroke="${K}" stroke-width="8"/><path d="M${x} ${y}V${y - h}" stroke="#8a6a4a" stroke-width="4"/>`; return s + `<path d="M${x0 - 6} ${y - h + 10}H${x1 + 6}M${x0 - 6} ${y - h + 28}H${x1 + 6}" stroke="${K}" stroke-width="7"/><path d="M${x0 - 6} ${y - h + 10}H${x1 + 6}M${x0 - 6} ${y - h + 28}H${x1 + 6}" stroke="#a88a5a" stroke-width="3"/>`; };
  const paper = (x, y, w, h, rot = 0, lines = [], fill = '#f6ecd8', fs = 13) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="${fill}" stroke="${K}" stroke-width="2.6"/>${lines.map((l, i) => `<text x="0" y="${-h / 2 + 20 + i * (fs + 5)}" font-size="${i ? fs : fs + 3}" font-family="Oswald,'Arial Narrow',sans-serif" font-weight="700" text-anchor="middle" fill="${K}">${S0.esc(l)}</text>`).join('')}</g>`;
  const S0 = { esc: t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;') };
  const seal = (x, y, r = 10) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#c8323c" stroke="${K}" stroke-width="2"/><path d="M${x - r * .5} ${y}h${r}M${x} ${y - r * .5}v${r}" stroke="#f2c14e" stroke-width="2"/>`;
  const card = (x, y, rot, face, red) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-16" y="-23" width="32" height="46" rx="4" fill="#fff" stroke="${K}" stroke-width="2.4"/>${face ? `<text x="0" y="8" font-size="22" font-family="Oswald,sans-serif" font-weight="700" text-anchor="middle" fill="${red ? '#c8323c' : K}">${face}</text>` : `<rect x="-11" y="-18" width="22" height="36" rx="2" fill="#3b5bb5" stroke="${K}" stroke-width="1.4"/>`}</g>`;
  const table = (x, y, w = 260, c = '#3a7a4a') => `<path d="M${x - w / 2 + 20} ${y}V${y + 70}M${x + w / 2 - 20} ${y}V${y + 70}" stroke="${K}" stroke-width="10"/><path d="M${x - w / 2 + 20} ${y}V${y + 70}M${x + w / 2 - 20} ${y}V${y + 70}" stroke="#6a3a1a" stroke-width="5"/><path d="M${x - w / 2} ${y}Q${x} ${y - 30} ${x + w / 2} ${y}Q${x} ${y + 18} ${x - w / 2} ${y}Z" fill="${c}" stroke="${K}" stroke-width="3"/><path d="M${x - w / 2} ${y}Q${x} ${y + 18} ${x + w / 2} ${y}V${y + 10}Q${x} ${y + 28} ${x - w / 2} ${y + 10}Z" fill="#6a3a1a" stroke="${K}" stroke-width="2.6"/>`;
  const rope = (x1, y1, x2, y2, sag = 20) => `<path d="M${x1} ${y1}Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}" fill="none" stroke="${K}" stroke-width="5"/><path d="M${x1} ${y1}Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}" fill="none" stroke="#c8a86a" stroke-width="2.4" stroke-dasharray="5 3"/>`;
  const ball = (x, y, r = 12) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#c8ccd8" stroke="${K}" stroke-width="2.4"/><path d="M${x - r * .7} ${y - r * .2}Q${x} ${y - r * .8} ${x + r * .7} ${y - r * .2}M${x - r * .7} ${y + r * .3}Q${x} ${y + r} ${x + r * .7} ${y + r * .3}" fill="none" stroke="${K}" stroke-width="1.4"/><circle cx="${x - r * .35}" cy="${y - r * .4}" r="${r * .22}" fill="#fff"/>`;
  const spiral = (x, y, r = 40, c = '#3fb8a9', w = 3) => { let d = ''; for (let i = 0; i <= 60; i++) { const a = i * 0.32, rr = r * i / 60; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1); } return `<path d="${d}" fill="none" stroke="${K}" stroke-width="${w + 3}"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>`; };
  const poolFront = () => `<path d="M156 304Q420 296 684 300Q620 330 420 330Q200 330 156 304Z" fill="#8ac8d8" stroke="${K}" stroke-width="3" opacity=".92"/><path d="M220 312q60 -6 120 0M470 316q70 -6 140 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>`;
  const steam = (x, y, n = 3) => [...Array(n)].map((_, i) => `<path d="M${x + i * 26} ${y}q-14 -20 0 -40q14 -20 0 -40" fill="none" stroke="#fff" stroke-width="6" opacity=".7" stroke-linecap="round"/>`).join('');
  const bedroll = (x, y, c = '#8a3a2a') => `<g transform="translate(${x} ${y})"><path d="M-40 0Q-44 -14 -30 -16H36Q44 -8 36 0Z" fill="${c}" stroke="${K}" stroke-width="2.4"/><path d="M-20 -16V0M10 -16V0" stroke="${K}" stroke-width="1.6" opacity=".6"/></g>`;
  const satchel = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-26 0V-30H26V0Z" fill="#6a4a2a" stroke="${K}" stroke-width="2.6"/><path d="M-26 -30Q0 -46 26 -30L24 -14H-24Z" fill="#8a5a34" stroke="${K}" stroke-width="2.4"/><path d="M-18 -30Q0 -60 18 -30" fill="none" stroke="${K}" stroke-width="3"/>${seal(0, -18, 7)}</g>`;
  const boulder = (x, y, r = 30, c = '#9a7a5a') => `<path d="M${x - r} ${y}Q${x - r * 1.1} ${y - r * 1.2} ${x - r * .1} ${y - r * 1.4}Q${x + r * 1.1} ${y - r * 1.3} ${x + r} ${y}Q${x} ${y + r * .3} ${x - r} ${y}Z" fill="${c}" stroke="${K}" stroke-width="2.6"/><path d="M${x - r * .4} ${y - r * .9}q${r * .3} ${r * .2} ${r * .6} 0" stroke="${K}" stroke-width="1.6" fill="none" opacity=".5"/>`;
  const cougar = (x, y, s = 1, awake = false, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">${awake
    ? `<path d="M-70 0L-62 -36Q-60 -56 -30 -58H30Q50 -62 58 -80L66 -94L72 -78Q92 -76 96 -60L88 -46L62 -44L50 -30L52 0H42L36 -28L-40 -28L-44 0H-54L-56 -26Q-80 -30 -96 -50Q-84 -34 -70 0Z" fill="#c8904a" stroke="${K}" stroke-width="2.6" stroke-linejoin="round"/><path d="M90 -58L66 -50" stroke="${K}" stroke-width="2.4"/><path d="M72 -56l4 8 4 -8M80 -56l4 8" fill="#fff" stroke="${K}" stroke-width="1.4"/><circle cx="76" cy="-72" r="3.4" fill="#ffd84a" stroke="${K}" stroke-width="1.4"/>`
    : `<path d="M-80 0Q-86 -28 -50 -34Q0 -44 50 -32Q64 -40 76 -34L82 -44L86 -32Q98 -24 92 -10Q80 -2 60 -2Z" fill="#c8904a" stroke="${K}" stroke-width="2.6" stroke-linejoin="round"/><path d="M-80 0Q-110 -2 -112 -20" fill="none" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="M-80 0Q-110 -2 -112 -20" fill="none" stroke="#c8904a" stroke-width="3.5" stroke-linecap="round"/><path d="M74 -22q6 3 12 0" stroke="${K}" stroke-width="2" fill="none"/>`}</g>`;
  const flash = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-22" y="-16" width="44" height="30" fill="#2a2a3a" stroke="${K}" stroke-width="2.4"/><circle cy="-1" r="9" fill="#8a9ab0" stroke="${K}" stroke-width="2"/><path d="M-12 -16V-24H12V-16" fill="#2a2a3a" stroke="${K}" stroke-width="2"/><path d="M0 14V60M-10 60L0 44L10 60" stroke="${K}" stroke-width="3" fill="none"/></g>`;
  const cube = (x, y, r = 12, c = '#9fd0f0') => `<path d="M${x} ${y - r}L${x + r} ${y - r / 2}L${x + r} ${y + r / 2}L${x} ${y + r}L${x - r} ${y + r / 2}L${x - r} ${y - r / 2}Z" fill="${c}" stroke="${K}" stroke-width="2"/><path d="M${x - r} ${y - r / 2}L${x} ${y}L${x + r} ${y - r / 2}M${x} ${y}V${y + r}" stroke="${K}" stroke-width="1.6" fill="none"/>`;
  const feather = (x, y, rot = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0Q-10 -30 0 -60Q10 -30 0 0Z" fill="#f6ecd8" stroke="${K}" stroke-width="2"/><path d="M0 -52Q-6 -56 0 -60Q6 -56 0 -52Z" fill="#1a1020"/><path d="M0 4V-58" stroke="${K}" stroke-width="1.4"/></g>`;
  const cracks = (x, y, n = 6, r = 90, c = K) => { let d = ''; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + 0.3; let px = x, py = y; d += `M${px} ${py}`; for (let k = 1; k <= 3; k++) { px = x + Math.cos(a + (k % 2 ? 0.2 : -0.2)) * r * k / 3; py = y + Math.sin(a + (k % 2 ? 0.2 : -0.2)) * r * k / 3 * 0.45; d += `L${px.toFixed(1)} ${py.toFixed(1)}`; } } return `<path d="${d}" fill="none" stroke="${c}" stroke-width="3"/>`; };
  const ghost = (x, y, s = 1, c = '#b8a0e0') => `<g transform="translate(${x} ${y}) scale(${s})" opacity=".75"><path d="M-30 0Q-40 -60 -26 -100Q0 -130 26 -100Q40 -60 30 0L20 -14L10 0L0 -14L-10 0L-20 -14Z" fill="${c}" stroke="${K}" stroke-width="2.4" stroke-dasharray="6 3"/><circle cx="-10" cy="-92" r="6" fill="#fff" stroke="${K}" stroke-width="2"/><circle cx="12" cy="-92" r="6" fill="#fff" stroke="${K}" stroke-width="2"/><circle cx="-10" cy="-92" r="2.4" fill="${K}"/><circle cx="12" cy="-92" r="2.4" fill="${K}"/><path d="M-30 -60Q-56 -70 -60 -40M30 -60Q56 -70 60 -40" fill="none" stroke="${K}" stroke-width="2.4"/></g>`;
  /** the Saint's Corpse as nine separate glowing parts */
  const corpseFig = (x, y, s = 1, c = '#f2c14e') => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}" stroke="${K}" stroke-width="${2.6 / s}" stroke-linejoin="round"><circle cx="0" cy="-198" r="20"/><path d="M-20 -170h40l6 40h-52z"/><path d="M-18 -122h36l-4 44h-28z"/><path d="M-28 -166l-34 44 10 8 34 -38z"/><path d="M28 -166l34 44 -10 8 -34 -38z"/><path d="M-64 -110l-10 30 12 4 10 -30z"/><path d="M64 -110l10 30 -12 4 -10 -30z"/><path d="M-14 -70l-6 70h14l6 -70z"/><path d="M14 -70l6 70h-14l-6 -70z"/></g>`;
  const eyeGlow = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="#ffd84a" stroke="${K}" stroke-width="1.4"/>`;
  const X = (x, y, r = 14, c = '#c8323c') => `<path d="M${x - r} ${y - r}L${x + r} ${y + r}M${x + r} ${y - r}L${x - r} ${y + r}" stroke="${K}" stroke-width="9" stroke-linecap="round"/><path d="M${x - r} ${y - r}L${x + r} ${y + r}M${x + r} ${y - r}L${x - r} ${y + r}" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
  const zz = (x, y) => `<text x="${x}" y="${y}" font-size="30" font-family="Anton,sans-serif" fill="#fff" stroke="${K}" stroke-width="3" paint-order="stroke">Z<tspan dx="4" dy="-14" font-size="22">z</tspan><tspan dx="3" dy="-10" font-size="16">z</tspan></text>`;
  const speedLines = (y0, y1, dir = 1, op = 0.5) => `<g stroke="${K}" opacity="${op}">${[...Array(14)].map((_, i) => { const y = y0 + (y1 - y0) * i / 13, x = (i * 137) % 700; return `<path d="M${x} ${y}h${dir * (80 + (i % 4) * 30)}" stroke-width="${2 + (i % 3)}"/>`; }).join('')}</g>`;
  const silh = (x, y, s = 1, c = '#2a1a2a') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0L-10 -60Q-18 -64 -16 -80Q-12 -96 0 -96Q12 -96 16 -80Q18 -64 10 -60L14 0Z" fill="${c}" stroke="${K}" stroke-width="2"/><path d="M-20 -90H20L10 -100H-10Z" fill="${c}"/></g>`;

  /* ================= ANY ACT ================= */
  add('hotspring', {
    scene: S => S.bg({ horizon: 230 }) + boulder(80, 300, 60, '#8a6a5a') + boulder(760, 290, 50, '#8a6a5a')
      + `<path d="M150 300Q140 250 260 244H600Q700 250 690 300Q620 330 420 330Q200 330 150 300Z" fill="#8ac8d8" stroke="${K}" stroke-width="3"/><path d="M200 276q60 -10 120 0M420 290q80 -10 160 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>`
      + steam(280, 240, 4) + S.bust('sandman', 520, 318, 1.1, true) + poolFront() + S.fx('blood', 480, 268, 0.6)
      + `<path d="M560 250l40 -30" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="M566 246l34 -26" stroke="#c8ccd8" stroke-width="3"/>`
      + you(S, 130, 300, 0.95) + buddy(S, 60, 304, 0.85)
      + S.bubble('This water belongs to my people.', 560, 30, 220, 540, 180) + S.kana('ジャキ', 640, 230, 38, 10),
    out: {
      0: S => S.bg({ horizon: 230 }) + `<path d="M150 300Q140 250 260 244H600Q700 250 690 300Q620 330 420 330Q200 330 150 300Z" fill="#8ac8d8" stroke="${K}" stroke-width="3"/>` + steam(220, 240, 5)
        + S.bust('sandman', 470, 318, 1.1, true) + (has('gyro') ? S.person('gyro', 360, 310, 0.9, 'kneel') : you(S, 360, 310, 0.9, 'kneel')) + poolFront()
        + spiral(420, 250, 26) + boulder(680, 300, 44, '#8a6a5a') + feather(660, 250, -30) + feather(690, 252, 20)
        + S.bubble('I will remember this.', 520, 40, 200, 500, 170) + S.kana('ギュルッ', 330, 150, 34, -10, '#3fb8a9'),
      '0:fail': S => S.bg({ horizon: 230 }) + `<path d="M150 300Q140 250 260 244H600Q700 250 690 300Q620 330 420 330Q200 330 150 300Z" fill="#8ac8d8" stroke="${K}" stroke-width="3"/>` + steam(260, 240, 4)
        + S.bust(LK(), 380, 326, 1, false) + poolFront()
        + S.person('sandman', 720, 292, 0.7, 'stand', true) + S.fx('dust', 770, 290, 0.6) + speedLines(200, 280, 1, 0.3)
        + S.caption('He slips away into the rocks. The spring is yours.', 12, 12, 280),
      1: S => S.bg({ horizon: 230 }) + `<path d="M150 300Q140 250 260 244H600Q700 250 690 300Q620 330 420 330Q200 330 150 300Z" fill="#8ac8d8" stroke="${K}" stroke-width="3"/>` + steam(300, 240, 4)
        + S.bust(LK(), 400, 326, 1, false) + poolFront() + S.person('sandman', 700, 296, 0.75, 'stand', false) + S.fx('blood', 660, 290, 0.7)
        + silh(80, 230, 0.55) + silh(120, 228, 0.5) + silh(160, 232, 0.55) + eyeGlow(76, 186) + eyeGlow(84, 186) + eyeGlow(116, 186) + eyeGlow(156, 188)
        + S.kana('ゴゴゴ', 120, 120, 40, -6, '#c8323c') + S.caption('His brothers hear what you did.', 500, 12, 280),
    },
  });

  add('poker', {
    scene: S => S.bg({ inside: true, horizon: 270, pal: 'inside' })
      + `<rect x="330" y="30" width="140" height="120" fill="#bcd8e8" stroke="${K}" stroke-width="4"/><rect x="322" y="22" width="156" height="136" fill="none" stroke="#c8a040" stroke-width="6"/><path d="M350 60l40 -20M380 120l60 -40" stroke="#fff" stroke-width="4" opacity=".7"/>`
      + ghost(470, 170, 1.1) + S.bust('gunslinger', 400, 250, 1.3)
      + table(400, 260, 380) + card(340, 250, -10, null) + card(372, 252, 6, null) + card(470, 250, 8, null) + S.fx('coins', 420, 252, 0.8)
      + S.bust(LK(), 120, 360, 1.3) + S.bubble('Bet your gear, cowboy.', 560, 60, 180, 470, 170) + S.kana('ザワ…', 690, 230, 36, 8),
    out: {
      0: S => S.bg({ inside: true, horizon: 270, pal: 'inside' }) + S.lines(400, 230, K, 36, 0.25)
        + table(400, 260, 380) + card(360, 244, -8, 'A', true) + card(400, 240, 6, 'A') + `<path d="M470 250q30 -16 60 0q-30 10 -60 0Z" fill="#e8508a" stroke="${K}" stroke-width="2.4"/>`
        + S.person('gunslinger', 660, 290, 0.9, 'stand', false) + ghost(720, 160, 0.9, '#e8a0c0') + S.kana('ギャアア', 720, 70, 38, 10, '#e8508a')
        + S.bust(LK(), 140, 360, 1.3) + S.kana('ドン', 400, 150, 60, -8, '#ffd84a'),
      '0:fail': S => S.bg({ inside: true, horizon: 270, pal: 'inside' })
        + ghost(470, 170, 1.1) + S.bust('gunslinger', 400, 250, 1.3) + table(400, 260, 380) + card(380, 246, -4, 'K', true) + card(410, 248, 8, 'K') + S.fx('coins', 330, 252, 1)
        + S.bust(LK(), 140, 360, 1.3) + `<path d="M90 260q30 12 60 0" stroke="${K}" stroke-width="3" fill="none"/>`
        + S.tone('M0 0H800V360H0Z', 0.12) + S.bubble('House wins.', 520, 70, 140, 450, 170),
      1: S => S.bg({ inside: true, horizon: 270, pal: 'inside' })
        + `<rect x="330" y="30" width="140" height="120" fill="#bcd8e8" stroke="${K}" stroke-width="4"/>` + cracks(400, 90, 8, 110) + S.fx('bang', 400, 90, 1.4)
        + ghost(500, 180, 1.1) + S.kana('ギャン', 560, 80, 44, 12, '#b8a0e0') + S.bust('gunslinger', 400, 250, 1.3) + table(400, 260, 380)
        + S.person(LK(), 130, 330, 1, 'draw') + S.kana('パリーン', 250, 60, 44, -10) + S.fx('coins', 460, 250, 0.7),
      '1:fail': S => S.bg({ inside: true, horizon: 270, pal: 'inside' }) + table(400, 280, 320)
        + S.person('bandit', 560, 300, 0.9, 'draw', true) + S.person('bandit', 680, 300, 0.9, 'draw', true) + S.bust('gunslinger', 400, 270, 1.1)
        + S.person(LK(), 130, 310, 0.95, 'stand') + S.kana('ガタッ', 620, 80, 46, 10),
      2: S => S.bg({ inside: true, horizon: 270, pal: 'inside' }) + S.lines(400, 180, K, 40, 0.3)
        + `<g transform="rotate(-25 400 280)">${table(400, 280, 300)}</g>` + card(300, 120, 30, 'A', true) + card(520, 90, -40, 'J') + card(600, 150, 20, null)
        + S.person(LK(), 140, 310, 1, 'draw') + S.fx('bang', 210, 196, 0.8) + S.person('gunslinger', 660, 310, 1, 'draw', true) + S.fx('bang', 588, 196, 0.8)
        + S.kana('ドギュウン', 400, 70, 50, -6, '#ffd84a'),
    },
  });

  add('wounded', {
    scene: S => S.bg({}) + `<path d="M0 320Q200 290 420 300T800 310V360H0Z" fill="#b8905a" stroke="${K}" stroke-width="3"/>`
      + `<g transform="translate(470 340) rotate(-8)">${S.horse(0, 0, 1.1, { coat: '#a8784a', mane: '#3a2a1a', wrap: '#3b5bb5' })}</g>` + S.fx('spark', 548, 318, 0.8) + S.kana('ヒヒン…', 620, 200, 30, 6)
      + S.person('marco', 330, 330, 0.8, 'down', true) + rider(S, 110, 300, 0.9)
      + S.bubble('Please... just to the next checkpoint.', 250, 40, 240, 320, 160),
    out: {
      0: S => S.bg({}) + speedLines(160, 280, -1, 0.3) + rider(S, 420, 310, 1.2) + S.bust('marco', 395, 204, 0.44)
        + S.prop('marker', 700, 300, 1.2, 'CP') + S.fx('dust', 250, 300, 1) + S.caption('Riding double. Slow, but you get there.', 12, 12, 280),
      1: S => S.bg({}) + S.person('marco', 600, 300, 0.8, 'stand', false) + `<rect x="620" y="200" width="16" height="22" rx="4" fill="#3b5bb5" stroke="${K}" stroke-width="2"/>` + paper(560, 210, 40, 30, -8, ['MAP'], '#e8d8a0', 10)
        + you(S, 200, 300, 0.95, 'stand', false) + buddy(S, 120, 304, 0.85)
        + S.caption('He limps off toward the trail.', 520, 12, 260) + S.kana('…', 200, 90, 50, 0),
      2: S => S.bg({}) + speedLines(180, 290, 1, 0.3) + rider(S, 600, 300, 1, false) + `<path d="M500 230q20 -14 40 0v20h-40z" fill="#8a5a34" stroke="${K}" stroke-width="2.4"/>`
        + S.person('marco', 180, 310, 0.85, 'point', false) + S.bubble('My brother will find you!', 60, 40, 220, 170, 150) + S.kana('ドドド', 700, 120, 40, 10),
      3: S => S.bg({}) + S.prop('wagon', 560, 300, 1.2) + S.bust('marco', 540, 236, 0.5) + S.fx('coins', 330, 220, 0.8) + you(S, 250, 312, 0.95, 'point') + buddy(S, 150, 312, 0.85)
        + S.bubble('Thank you, mister!', 520, 30, 170, 540, 150) + S.kana('ガラガラ', 700, 140, 36, 10),
    },
  });

  add('spinschool', {
    scene: S => S.bg({}) + fence(420, 780, 300) + [460, 540, 620, 700].map(x => `<rect x="${x - 10}" y="226" width="20" height="30" fill="#c8ccd8" stroke="${K}" stroke-width="2.4"/>`).join('')
      + S.person('gyro', 250, 310, 1, 'point') + ball(318, 196, 14) + spiral(318, 196, 34, '#3fb8a9', 2)
      + (lead() !== 'gyro' ? you(S, 100, 310, 0.85) : buddy(S, 100, 310, 0.85))
      + S.bubble('I\'m not teaching. I\'m practising. Loudly.', 60, 30, 260, 230, 110) + S.kana('ギュルル', 420, 150, 36, -8, '#3fb8a9'),
    out: {
      0: S => S.bg({}) + fence(420, 780, 300) + S.lines(540, 240, K, 30, 0.25) + [460, 540, 620, 700].map((x, i) => `<rect x="${x - 10}" y="${180 - i * 20}" width="20" height="30" fill="#c8ccd8" stroke="${K}" stroke-width="2.4" transform="rotate(${i * 40 + 20} ${x} ${190 - i * 20})"/>`).join('')
        + ball(470, 220, 14) + spiral(470, 220, 40) + S.person(LK(), 180, 310, 1, 'point') + S.kana('カン！カン！', 600, 90, 44, -8),
      1: S => S.bg({ pal: 'dusk' }) + S.person(LK(), 400, 312, 1, 'kneel') + spiral(400, 150, 110, '#3fb8a9', 3) + spiral(400, 150, 60, '#f2c14e', 2)
        + S.caption('Rotation, breath, rotation.', 12, 12, 230),
      2: S => S.bg({ pal: 'night', stars: true }) + fire(400, 312, 1.1) + S.person('gyro', 520, 312, 0.9, 'kneel', true)
        + (lead() !== 'gyro' ? you(S, 280, 312, 0.9, 'kneel') : buddy(S, 280, 312, 0.9, 'kneel'))
        + `<g opacity=".55">${S.bust('marco', 400, 210, 0.9)}</g>` + S.bubble('Naples. The boy. Marco.', 540, 40, 200, 530, 150),
    },
  });

  add('gunrange', {
    scene: S => S.bg({}) + S.prop('saguaro', 720, 300, 1) + fence(560, 680, 300, 40) + [580, 620, 660].map(x => `<path d="M${x - 5} 258v-18h10v18z" fill="#5a9a6a" stroke="${K}" stroke-width="2"/>`).join('')
      + S.person('gunslinger', 470, 310, 1, 'point', true) + S.fx('coins', 420, 150, 0.6) + `<path d="M420 190q2 -20 0 -30" stroke="${K}" stroke-width="2" stroke-dasharray="3 3" fill="none"/>`
      + you(S, 180, 310, 0.95) + buddy(S, 90, 312, 0.85) + S.bubble('Show me you deserve to.', 520, 30, 200, 470, 110),
    out: {
      0: S => S.bg({}) + S.lines(420, 130, K, 36, 0.25) + S.fx('spark', 420, 130, 1.4) + `<path d="M430 124l120 -60" stroke="#f2c14e" stroke-width="4"/>`
        + S.person(LK(), 180, 310, 1, 'draw') + S.fx('bang', 250, 196, 0.6) + S.person('gunslinger', 600, 310, 0.95, 'stand', true)
        + `<path d="M500 230L620 210" stroke="${K}" stroke-width="9" stroke-linecap="round"/><path d="M500 230L620 210" stroke="#8a5a34" stroke-width="5" stroke-linecap="round"/>` + S.kana('キィン', 460, 80, 46, 8),
      '0:fail': S => S.bg({ pal: 'night', stars: true }) + S.person('gunslinger', 600, 310, 0.95, 'stand', true) + S.person(LK(), 220, 310, 1, 'draw')
        + `<g transform="translate(560 120) rotate(30)"><path d="M-40 10Q0 -30 40 10Z" fill="#2a2a2a" stroke="${K}" stroke-width="2.6"/></g>` + S.fx('spark', 580, 110, 0.7)
        + S.bubble('Again.', 620, 60, 100, 610, 150) + S.caption('Until dawn.', 12, 12, 140),
      1: S => S.bg({}) + [480, 540, 600, 660].map(x => `<path d="M${x - 6} 300v-28h12v28z" fill="#5a9a6a" stroke="${K}" stroke-width="2"/>`).join('') + fence(460, 700, 300, 30)
        + S.person(LK(), 220, 310, 1, 'draw') + S.person('gunslinger', 300, 310, 0.9, 'point', true) + S.kana('カチッ カチッ', 420, 110, 36, -6)
        + S.caption('Three hours of dry-firing.', 12, 12, 220),
    },
  });

  add('fortune', {
    scene: S => S.bg({ inside: true, pal: 'night', horizon: 280 }) + `<path d="M0 0L400 -40L800 0V360H0Z" fill="#4a2a5a" opacity=".6"/>`
      + [...Array(10)].map((_, i) => `<circle cx="${40 + i * 80}" cy="${30 + (i % 3) * 14}" r="4" fill="#f2c14e"/>`).join('')
      + S.bust('axl', 520, 300, 1.8)
      + table(430, 290, 300, '#6a2a5a') + `<circle cx="430" cy="250" r="34" fill="#c8e8ff" stroke="${K}" stroke-width="3" opacity=".9"/><path d="M414 236q10 -8 20 -2" stroke="#fff" stroke-width="4" fill="none"/>`
      + S.bust(LK(), 130, 360, 1.3) + S.bubble('Something holy, and something guilty.', 540, 20, 240, 540, 120) + S.kana('ゴゴゴ', 720, 250, 40, 8, '#b8a0e0'),
    out: {
      0: S => S.bg({ pal: 'night', stars: true }) + S.lines(400, 170, '#f2c14e', 40, 0.35)
        + corpseFig(400, 290, 1)
        + S.person('lucy', 640, 310, 0.85) + `<path d="M612 300L620 214H660L668 300Z" fill="#fff" stroke="${K}" stroke-width="2.4" opacity=".9"/>` + S.bust('axl', 150, 360, 1.2)
        + S.bubble('Nine pieces. One vessel.', 20, 20, 190, 120, 230) + `<circle cx="250" cy="300" r="9" fill="#ffd84a" stroke="${K}" stroke-width="2"/>`,
      '0:fail': S => S.bg({ inside: true, pal: 'night', horizon: 280 }) + S.tone('M0 0H800V360H0Z', 0.3) + S.bust('axl', 520, 300, 1.8)
        + `<path d="M300 250Q380 230 440 260" stroke="${K}" stroke-width="22" stroke-linecap="round"/><path d="M300 250Q380 230 440 260" stroke="#e8d0c0" stroke-width="16" stroke-linecap="round"/>`
        + `<path d="M280 250q-40 30 -90 20q30 30 -10 60M300 270q-20 40 10 80" fill="none" stroke="#6a3a8a" stroke-width="6" opacity=".8"/>`
        + `<circle cx="290" cy="250" r="16" fill="#e8d0c0" stroke="${K}" stroke-width="3"/>` + S.bust(LK(), 180, 360, 1.3) + S.kana('ギャアアア', 560, 80, 50, 8, '#c8323c'),
      1: S => S.bg({ inside: true, pal: 'night', horizon: 280 }) + `<circle cx="400" cy="170" r="130" fill="#c8e8ff" stroke="${K}" stroke-width="4"/>`
        + `<g transform="translate(400 170)">${rider(S, 30, 90, 0.9, false, 'nicholas', { coat: '#f6ecd8', mane: '#c8a060', wrap: '#6a7a9a' })}<path d="M-80 70q10 -16 24 -8q10 4 10 12h-34z" fill="#fff" stroke="${K}" stroke-width="2"/><circle cx="-52" cy="66" r="2" fill="#c8323c"/><path d="M-84 74q-14 4 -20 -6" stroke="${K}" stroke-width="2" fill="none"/></g>`
        + S.caption('A white mouse. A brother on a horse.', 12, 12, 280) + S.kana('ドクン', 680, 90, 44, 10, '#c8323c'),
      2: S => S.bg({ pal: 'night', stars: true }) + tent(560, 300, 1, '#4a2a5a', '#6a3a8a') + S.person(LK(), 220, 310, 0.95, 'stand', true)
        + S.bubble('A man in a cabin who turns back time.', 440, 30, 240, 540, 200) + S.prop('cabin', 90, 300, 0.6),
    },
  });

  add('camp', {
    scene: S => S.bg({ pal: 'dusk' }) + fire(400, 300, 1, false) + bedroll(260, 312) + bedroll(540, 312, '#3a4a6a') + bedroll(400, 336, '#5a5a3a')
      + satchel(470, 300, 1.2) + S.kana('ジリ…', 400, 200, 32, 0, '#e8742a') + you(S, 120, 312, 0.95) + buddy(S, 700, 312, 0.85, 'stand', true)
      + S.caption('Bedrolls for three. A Presidential seal.', 12, 12, 260),
    out: {
      0: S => S.bg({ pal: 'dusk' }) + fire(620, 300, 0.8, false) + satchel(560, 300, 1) + paper(330, 180, 260, 200, -4, ['BY ORDER OF THE PRESIDENT', 'racers to be removed:', 'Blackwood', 'Pocoloco', (SBR.CHARS && SBR.CHARS[lead()] ? SBR.CHARS[lead()].name : 'Joestar'), 'route: north fork'], '#f6ecd8', 14)
        + `<ellipse cx="330" cy="172" rx="78" ry="14" fill="none" stroke="#c8323c" stroke-width="4" transform="rotate(-4 330 234)"/>` + seal(440, 290, 14) + S.kana('ドキッ', 620, 100, 44, 10),
      1: S => S.bg({ pal: 'night', stars: true }) + fire(400, 300, 1, false) + boulder(140, 320, 60, '#5a4a4a') + S.bust(LK(), 150, 240, 0.8)
        + S.person('agent', 560, 300, 0.8, 'stand', true) + S.person('agent', 640, 296, 0.75, 'stand', true) + S.person('agent', 720, 300, 0.8, 'stand', true)
        + S.kana('ザッ ザッ', 640, 80, 40, 8) + S.caption('Three shapes return.', 12, 12, 190),
      2: S => S.bg({ pal: 'dusk' }) + S.fx('smoke', 400, 150, 2) + fire(400, 300, 2.2) + fire(270, 312, 1.2) + fire(540, 312, 1.3)
        + rider(S, 700, 312, 0.8, false) + S.kana('ボオオ', 400, 80, 54, -6, '#e8742a'),
    },
  });

  add('checkpoint', {
    scene: S => S.bg({}) + tent(560, 300, 1.2, '#f6ecd8', '#3b5bb5') + S.prop('banner', 160, 300, 0.9)
      + S.person('steven', 470, 310, 0.95, 'point', true) + paper(390, 196, 34, 44, 10, ['?'], '#fff', 10) + flash(640, 230, 1) + S.fx('spark', 640, 200, 1.4)
      + S.person('snakeoil', 740, 310, 0.8, 'stand', true) + you(S, 240, 312, 0.95) + S.bubble('Why are you still in this race?!', 460, 30, 220, 470, 110) + S.kana('パシャ', 690, 150, 36, 10),
    out: {
      0: S => S.bg({}) + paper(400, 180, 360, 250, -3, ['THE DAILY TRAIL', `${(SBR.CHARS && SBR.CHARS[lead()] ? SBR.CHARS[lead()].name : 'JOESTAR').toUpperCase()}: "I WILL WIN"`, 'Sponsors line up'], '#f6ecd8', 18)
        + `<rect x="300" y="210" width="90" height="100" fill="#fff" stroke="${K}" stroke-width="2" transform="rotate(-3 400 180)"/>` + S.bust(LK(), 345, 314, 0.8) + S.kana('バーン', 650, 100, 56, 10, '#ffd84a'),
      '0:fail': S => S.bg({}) + S.person('bandit', 420, 310, 0.9, 'stand', true) + S.person('gunslinger', 540, 310, 0.9, 'draw', true) + paper(360, 180, 70, 50, -20, ['THREAT'], '#f6ecd8', 10)
        + rider(S, 130, 310, 0.9) + S.kana('ニヤ', 480, 80, 40, 6) + S.caption('Someone read the paper.', 560, 12, 220),
      1: S => S.bg({}) + tent(600, 300, 1, '#f6ecd8', '#3b5bb5') + you(S, 300, 312, 0.95) + [[480, 80, 10], [560, 140, -14], [640, 60, 20], [420, 150, -6], [700, 150, 8]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-22" y="-14" width="44" height="28" fill="#fff" stroke="${K}" stroke-width="2.4"/><path d="M-22 -14L0 2L22 -14" fill="none" stroke="${K}" stroke-width="2"/></g>`).join('')
        + S.bubble('I want to walk again.', 60, 40, 180, 280, 130),
      2: S => S.bg({}) + S.person('steven', 520, 310, 0.95, 'stand', true) + S.bust(LK(), 330, 360, 1.3) + paper(640, 170, 160, 110, 6, ['DIG SITES'], '#e8d8a0', 12)
        + [[600, 170], [650, 190], [690, 160]].map(([x, y]) => X(x, y, 8)).join('') + S.bubble('The President\'s men are digging.', 60, 30, 220, 330, 150),
      '2:fail': S => S.bg({}) + S.person('steven', 460, 310, 0.9, 'stand', true) + S.person('agent', 660, 300, 1, 'stand', true) + S.bust(LK(), 250, 360, 1.3)
        + `<path d="M620 170q-20 -10 -30 6" stroke="${K}" stroke-width="3" fill="none"/>` + S.kana('ピクッ', 700, 90, 44, 10) + S.lines(660, 190, K, 28, 0.2),
    },
  });

  add('horsetrader', {
    scene: S => S.bg({}) + `<path d="M500 300V110L640 60L780 110V300Z" fill="#7a4a2a" stroke="${K}" stroke-width="3"/><path d="M560 300V180H720V300Z" fill="#2a1a20" stroke="${K}" stroke-width="3"/>` + fire(640, 296, 0.8)
      + `<path d="M330 300l10 -40h60l10 40z" fill="#3a3a4a" stroke="${K}" stroke-width="2.6"/><path d="M310 262h110q10 -20 -10 -24h-90q-20 4 -10 24z" fill="#5a5a6a" stroke="${K}" stroke-width="2.6"/>`
      + S.person('nellyville', 450, 310, 0.95, 'point', true) + `<path d="M340 224a14 14 0 1 1 28 0" fill="none" stroke="#e8742a" stroke-width="7"/>` + S.kana('カーン', 360, 170, 40, -8)
      + H(S, 150, 310, 0.9) + S.bubble('Do one thing for me.', 540, 20, 170, 470, 110),
    out: {
      0: S => S.bg({}) + S.lines(250, 270, '#f2c14e', 30, 0.3) + H(S, 280, 310, 1.1) + S.person('nellyville', 420, 310, 0.9, 'kneel', true) + `<path d="M340 290a12 12 0 1 1 24 0" fill="none" stroke="#f2c14e" stroke-width="7"/>` + S.fx('spark', 350, 284, 1)
        + you(S, 620, 310, 0.95, 'stand', true) + S.bubble('I promise.', 580, 30, 120, 610, 110) + S.kana('キラッ', 350, 200, 34, 0, '#f2c14e'),
      1: S => S.bg({}) + S.person('nellyville', 460, 310, 0.95, 'stand', true) + you(S, 280, 312, 0.95, 'point') + S.fx('coins', 360, 210, 1)
        + [0, 1, 2, 3].map(i => `<path d="M${540 + i * 40} 300a14 14 0 1 1 28 0" fill="none" stroke="#9a9aa8" stroke-width="6"/>`).join('') + S.caption('$40. Lighter for every horse.', 12, 12, 230),
      2: S => S.bg({}) + S.person('nellyville', 480, 310, 0.95, 'point', true) + `<path d="M330 250l6 -60h56l6 60q-34 10 -68 0z" fill="#8a8aa0" stroke="${K}" stroke-width="3"/>` + [346, 364, 382].map(x => `<circle cx="${x}" cy="220" r="3" fill="${K}"/>`).join('')
        + S.fx('spark', 364, 190, 1.2) + you(S, 180, 312, 0.95) + S.kana('ガキン', 370, 120, 42, -6),
    },
  });

  /* ================= ACT I ================= */
  add('drywell', {
    act: 1,
    scene: S => S.bg({}) + S.prop('saguaro', 690, 290, 1.1) + S.prop('skull', 90, 330, 0.8) + well(420, 310, 1.1)
      + S.bubble('Help! The Boomboom boys threw me down here!', 460, 20, 250, 440, 230) + S.kana('オーイ！', 420, 160, 30, 0)
      + you(S, 250, 312, 0.95, 'point') + buddy(S, 160, 312, 0.85),
    out: {
      0: S => S.bg({}) + well(420, 310, 1.1) + rope(420, 160, 250, 200, 10) + S.person(LK(), 230, 312, 0.95, 'arms') + S.person('miner', 560, 310, 0.9, 'stand', true)
        + `<path d="M600 214h24v6h-18l-2 8h-6z" fill="#7a7a8a" stroke="${K}" stroke-width="2"/><path d="M640 170l10 -10 10 10 -10 10z" fill="#c8323c" stroke="${K}" stroke-width="2"/>` + S.bubble('They use magnets. Iron in your blood.', 480, 30, 240, 560, 140),
      '0:fail': S => S.bg({ inside: true, horizon: 330, pal: 'inside' }) + `<path d="M160 0V360M640 0V360" stroke="${K}" stroke-width="6"/><rect x="0" y="0" width="160" height="360" fill="#8a6a4a"/><rect x="640" y="0" width="160" height="360" fill="#8a6a4a"/>`
        + S.tone('M0 0H160V360H0ZM640 0H800V360H640Z', 0.4) + `<path d="M400 0V80" stroke="#c8a86a" stroke-width="4"/><path d="M400 80q10 10 -6 20" stroke="#c8a86a" stroke-width="4" fill="none"/>`
        + S.fx('dust', 420, 336, 0.7) + S.person(LK(), 330, 330, 0.9, 'down') + S.person('miner', 540, 330, 0.8, 'kneel', true) + S.kana('ブチッ', 460, 60, 44, 10),
      1: S => S.bg({}) + well(250, 310, 1) + S.kana('呪われろ！', 250, 130, 30, -6, '#c8323c') + rider(S, 600, 310, 1) + `<path d="M520 230q20 -14 44 0v24h-44z" fill="#b8a080" stroke="${K}" stroke-width="2.4"/>`
        + speedLines(200, 290, 1, 0.3),
    },
  });

  add('poco', {
    act: 1,
    scene: S => S.bg({}) + S.fx('coins', 360, 300, 1) + S.fx('coins', 460, 310, 0.8) + S.fx('coins', 540, 296, 0.7)
      + rider(S, 560, 310, 1.1, true, 'pocoloco', { coat: '#e8d8b0', mane: '#e8742a', wrap: '#f2c14e' }) + S.stand('heyya', 640, 190, 0.6, true)
      + you(S, 170, 312, 0.95) + buddy(S, 80, 312, 0.85) + S.bubble('This is my lucky month!', 330, 20, 200, 470, 130) + S.kana('ラッキー', 660, 60, 36, 10, '#f2c14e'),
    out: {
      0: S => S.bg({}) + S.lines(400, 180, '#f2c14e', 40, 0.3) + S.person('pocoloco', 470, 310, 1, 'arms', true) + S.stand('heyya', 580, 170, 0.6, true) + you(S, 300, 312, 0.95, 'arms')
        + S.bubble('Hey Ya says you\'re lucky!', 540, 20, 200, 540, 120) + S.kana('イエーイ', 200, 90, 40, -8, '#f2c14e'),
      '0:fail': S => S.bg({}) + rider(S, 620, 310, 1, false, 'pocoloco', { coat: '#e8d8b0', mane: '#e8742a', wrap: '#f2c14e' }) + `<path d="M560 180Q420 60 330 180" fill="none" stroke="${K}" stroke-width="2" stroke-dasharray="4 5"/>` + S.fx('coins', 330, 190, 0.7)
        + you(S, 250, 312, 0.95, 'point') + S.bubble('...not today!', 600, 30, 140, 640, 160),
      1: S => S.bg({}) + fire(400, 312, 0.8) + S.person('pocoloco', 520, 312, 0.95, 'kneel', true) + you(S, 280, 312, 0.95, 'kneel')
        + `<circle cx="470" cy="244" r="7" fill="#c8323c" stroke="${K}" stroke-width="2"/><circle cx="482" cy="248" r="7" fill="#c8323c" stroke="${K}" stroke-width="2"/>` + S.bubble('Food AND friends?', 560, 40, 160, 540, 150),
      2: S => S.bg({}) + speedLines(180, 300, -1, 0.35) + rider(S, 520, 310, 1) + rider(S, 300, 320, 0.9, false, 'pocoloco', { coat: '#e8d8b0', mane: '#e8742a', wrap: '#f2c14e' })
        + `<path d="M640 180a18 18 0 1 1 36 0" fill="none" stroke="#f2c14e" stroke-width="8"/>` + S.kana('勝った！', 650, 100, 40, 8, '#ffd84a'),
      '2:fail': S => S.bg({}) + S.prop('rock', 400, 300, 3) + rider(S, 680, 300, 0.8, false, 'pocoloco', { coat: '#e8d8b0', mane: '#e8742a', wrap: '#f2c14e' }) + S.stand('heyya', 740, 170, 0.5)
        + rider(S, 160, 310, 0.95) + `<path d="M560 290Q420 360 240 300" stroke="#f2c14e" stroke-width="3" stroke-dasharray="6 4" fill="none"/>` + S.kana('えっ', 200, 100, 40, -6),
    },
  });

  add('dothan', {
    act: 1,
    scene: S => S.bg({}) + S.prop('rock', 720, 300, 2.4) + `<ellipse cx="400" cy="300" rx="280" ry="40" fill="none" stroke="${K}" stroke-width="2" stroke-dasharray="8 8" opacity=".5"/>`
      + rider(S, 560, 300, 0.9, true, 'dothan', { coat: '#a8784a', mane: '#1a1020', wrap: '#e8742a' }) + S.fx('dust', 640, 296, 0.8) + rider(S, 220, 316, 1)
      + S.bubble('Race me to that rock.', 440, 30, 170, 540, 180) + S.kana('ドドド', 700, 120, 40, 10),
    out: {
      0: S => S.bg({}) + S.prop('rock', 650, 300, 2.4) + speedLines(150, 300, -1, 0.35) + rider(S, 520, 300, 1) + rider(S, 380, 312, 0.9, false, 'dothan', { coat: '#a8784a', mane: '#1a1020', wrap: '#e8742a' })
        + S.kana('ハナ差！', 400, 90, 48, -6, '#ffd84a') + paper(720, 110, 90, 70, 10, ['MAP'], '#e8d8a0', 12),
      '0:fail': S => S.bg({}) + S.prop('rock', 700, 300, 2.4) + S.fx('dust', 600, 290, 2) + rider(S, 740, 290, 0.6, false, 'dothan', { coat: '#a8784a', mane: '#1a1020', wrap: '#e8742a' })
        + rider(S, 200, 316, 1) + S.kana('ポツン', 220, 110, 36, 0) + S.caption('He\'s gone before you\'ve started.', 300, 12, 250),
      1: S => S.bg({}) + speedLines(160, 300, -1, 0.3) + rider(S, 330, 310, 1) + `<path d="M300 180l-20 -30M360 180l20 -30" stroke="${K}" stroke-width="10" stroke-linecap="round"/>`
        + rider(S, 600, 300, 0.9, false, 'dothan', { coat: '#a8784a', mane: '#1a1020', wrap: '#e8742a' }) + S.bubble('No reins. Ride with your legs.', 480, 30, 220, 590, 160),
    },
  });

  add('sheriff', {
    act: 1,
    scene: S => S.bg({ inside: true, horizon: 260, pal: 'inside' }) + `<rect x="480" y="40" width="260" height="120" fill="#6a4a2a" stroke="${K}" stroke-width="3"/>` + [520, 580, 640, 700].map(x => `<path d="M${x} 40V160" stroke="${K}" stroke-width="6"/>`).join('')
      + table(400, 270, 340, '#8a5a34') + paper(400, 240, 110, 130, -6, ['WANTED', 'cutthroat', 'racer', '$500'], '#f6ecd8', 13)
      + S.bust('mountaintim', 620, 290, 1.5, true) + `<path d="M570 220l20 6" stroke="#f2c14e" stroke-width="7"/>` + S.bust(LK(), 140, 360, 1.3) + S.kana('バン！', 400, 120, 48, -8),
    out: {
      0: S => S.bg({}) + `<path d="M0 250Q200 200 300 260L360 360H0Z M800 250Q600 210 520 260L460 360H800Z" fill="#b8784a" stroke="${K}" stroke-width="3"/>`
        + S.person('kansasgun', 420, 320, 0.9, 'draw', true) + S.person('bandit', 540, 310, 0.8, 'draw', true) + S.person(LK(), 200, 320, 0.95, 'draw')
        + S.fx('bang', 270, 206, 0.7) + S.fx('bang', 350, 206, 0.7) + S.kana('ドン ドン', 400, 80, 44, -6),
      1: S => S.bg({}) + S.person('kansasgun', 480, 310, 0.95, 'point', true) + `<path d="M420 210q-40 20 -80 -10" fill="none" stroke="#5a9a3a" stroke-width="5"/>` + you(S, 260, 312, 0.95)
        + `<g opacity=".5">${S.person('agent', 700, 300, 0.8, 'stand', true)}</g>` + S.bubble('Framed. By the President\'s men.', 520, 30, 220, 490, 110),
      '1:fail': S => S.bg({}) + S.person('kansasgun', 520, 310, 1, 'draw', true) + S.fx('bang', 450, 196, 1) + S.lines(450, 196, K, 30, 0.3) + S.person(LK(), 180, 310, 0.95, 'kneel')
        + S.kana('ズキューン', 400, 70, 50, -6),
    },
  });

  /* ================= ACT II ================= */
  add('cliffruins', {
    act: 2,
    scene: S => S.bg({ horizon: 320, far: false }) + `<path d="M0 20H800V320H0Z" fill="#b8604a" stroke="${K}" stroke-width="3"/><rect y="320" width="800" height="40" fill="#d8a070" stroke="${K}" stroke-width="3"/>` + S.tone('M0 20H800V320H0Z', 0.2)
      + [[60, 60], [150, 50], [640, 60], [720, 110]].map(([x, y]) => `<path d="M${x} ${y + 50}V${y}H${x + 60}V${y + 50}Z" fill="#d8905a" stroke="${K}" stroke-width="2.4"/><path d="M${x + 20} ${y + 50}V${y + 22}H${x + 40}V${y + 50}Z" fill="#2a1a20"/>`).join('')
      + `<rect x="250" y="40" width="330" height="190" fill="#e8c090" stroke="${K}" stroke-width="3"/>`
      + corpseFig(415, 222, 0.8, '#c8323c')
      + `<path d="M270 200q50 -40 90 0t100 -10" fill="none" stroke="#6a3a2a" stroke-width="3" stroke-dasharray="6 5"/>`
      + cougar(600, 314, 0.9) + `<path d="M560 314l10 -10h30l6 10z" fill="#f2c14e" stroke="${K}" stroke-width="2"/>` + S.fx('spark', 600, 306, 0.8) + you(S, 150, 320, 0.9),
    out: {
      0: S => S.bg({ horizon: 320, far: false }) + `<path d="M0 20H800V320H0Z" fill="#b8604a" stroke="${K}" stroke-width="3"/><rect y="320" width="800" height="40" fill="#d8a070" stroke="${K}" stroke-width="3"/>` + S.lines(415, 140, '#f2c14e', 40, 0.4)
        + `<rect x="250" y="40" width="330" height="190" fill="#e8c090" stroke="${K}" stroke-width="3"/>` + corpseFig(415, 222, 0.8, '#ffd84a')
        + S.person(LK(), 160, 320, 0.95, 'point') + S.kana('ドクン', 660, 100, 44, 10, '#ffd84a') + S.caption('The map matches the Corpse.', 12, 250, 230),
      '0:fail': S => S.bg({ horizon: 320, far: false }) + `<path d="M0 20H800V320H0Z" fill="#b8604a" stroke="${K}" stroke-width="3"/><rect y="320" width="800" height="40" fill="#d8a070" stroke="${K}" stroke-width="3"/><rect x="250" y="40" width="330" height="190" fill="#e8c090" stroke="${K}" stroke-width="3"/>`
        + S.tone('M250 40H580V230H250Z', 0.5) + S.fx('dust', 380, 260, 1.2) + S.fx('dust', 460, 280, 1) + S.person(LK(), 180, 320, 0.95, 'point') + S.kana('ボロッ', 520, 120, 44, 10),
      1: S => S.bg({ horizon: 320, far: false }) + `<path d="M0 20H800V320H0Z" fill="#b8604a" stroke="${K}" stroke-width="3"/><rect y="320" width="800" height="40" fill="#d8a070" stroke="${K}" stroke-width="3"/>` + S.lines(560, 220, K, 36, 0.3)
        + cougar(560, 320, 1.4, true, true) + cougar(700, 320, 0.9, true, true) + S.person(LK(), 180, 320, 0.95, 'draw') + S.kana('ガアアッ', 540, 80, 54, 8, '#c8323c'),
    },
  });

  add('avalanche', {
    act: 2,
    scene: S => S.bg({ far: false, horizon: 320 }) + `<path d="M0 320L0 230L520 110L800 140V320Z" fill="#9a7a5a" stroke="${K}" stroke-width="3"/>` + S.tone('M0 320L0 230L520 110L800 140V320Z', 0.2)
      + S.person('agent', 530, 112, 0.45, 'arms') + boulder(470, 124, 30) + boulder(380, 146, 24) + boulder(270, 170, 28) + boulder(600, 124, 20) + S.fx('dust', 330, 170, 0.6)
      + rider(S, 160, 330, 0.9) + S.kana('ゴロゴロ', 380, 60, 44, -12) + S.bubble('Somebody\'s pushing them!', 560, 20, 200, 500, 70),
    out: {
      0: S => S.bg({}) + S.fx('dust', 180, 250, 2.6) + S.fx('dust', 300, 280, 1.8) + speedLines(160, 300, -1, 0.4) + rider(S, 560, 310, 1.1) + S.kana('抜けた！', 660, 90, 44, 8, '#ffd84a'),
      '0:fail': S => S.bg({ far: false, horizon: 320 }) + `<path d="M0 320L0 230L520 110L800 140V320Z" fill="#9a7a5a" stroke="${K}" stroke-width="3"/>` + S.fx('dust', 300, 280, 2)
        + boulder(360, 300, 40) + boulder(220, 250, 30) + S.person(LK(), 480, 320, 0.9, 'down') + S.fx('boom', 300, 230, 0.8) + S.kana('ドガガ', 520, 140, 50, 8),
      1: S => S.bg({ far: false, horizon: 320 }) + `<path d="M0 360L0 300L420 170L800 190V360Z" fill="#9a7a5a" stroke="${K}" stroke-width="3"/>` + boulder(640, 186, 34)
        + S.person('agent', 540, 178, 0.8, 'arms', true) + S.person(LK(), 330, 204, 0.85, 'point') + S.kana('捕まえた', 600, 300, 36, 8) + S.lines(540, 110, K, 30, 0.25),
    },
  });

  add('letter', {
    act: 2,
    scene: S => S.bg({}) + H(S, 640, 310, 0.9, true, { coat: '#6a5a4a', mane: '#1a1020', wrap: '#c8323c' }) + S.person('marco', 520, 310, 0.85, 'stand', true)
      + S.person('gyro', 300, 312, 1, 'point') + paper(356, 196, 60, 40, -10, [''], '#f6ecd8') + seal(356, 196, 9)
      + (lead() !== 'gyro' ? you(S, 140, 312, 0.9) : buddy(S, 140, 312, 0.9)) + S.bubble('If it\'s already done... I don\'t want to know.', 60, 20, 280, 290, 110),
    out: {
      0: S => S.bg({}) + S.lines(400, 160, '#f2c14e', 40, 0.3) + S.person('gyro', 400, 312, 1.05, 'arms') + paper(440, 100, 90, 70, 10, ['MARCO', 'lives'], '#f6ecd8', 12)
        + S.kana('ニョホホ', 600, 90, 44, 10, '#3fb8a9') + `<path d="M380 138l-6 20M420 138l6 20" stroke="#9fd0f0" stroke-width="4"/>`,
      1: S => S.bg({ pal: 'dusk' }) + speedLines(150, 290, -1, 0.3) + rider(S, 380, 310, 1.1, false, 'gyro', { coat: '#5a3a2a', mane: '#1a1020', wrap: '#f2c14e' })
        + (lead() !== 'gyro' ? rider(S, 180, 320, 0.9) : '') + S.bubble('After New York.', 480, 40, 150, 420, 150),
      2: S => S.bg({}) + S.person('marco', 600, 310, 0.85, 'stand', false) + S.fx('dust', 680, 300, 0.8) + speedLines(210, 290, 1, 0.3)
        + `<path d="M500 300q20 -16 40 0z" fill="#6a4a2a" stroke="${K}" stroke-width="2.4"/>` + [505, 515, 525].map(x => `<path d="M${x} 296l4 -14" stroke="#c8ccd8" stroke-width="3"/>`).join('')
        + S.person(LK(), 200, 312, 0.95, 'draw') + S.kana('スパイか', 300, 90, 36, -6),
      '2:fail': S => S.bg({}) + S.person('marco', 520, 310, 0.85, 'stand', true) + S.person('agent', 620, 310, 0.9, 'draw', true) + S.person('bandit', 720, 310, 0.85, 'draw', true)
        + S.person(LK(), 200, 312, 0.95, 'draw') + S.kana('一人じゃない', 600, 80, 34, 8),
    },
  });

  /* ================= ACT III ================= */
  const funnel = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-110 -300Q-20 -240 -40 -150Q-30 -60 -6 0H10Q-4 -60 20 -150Q60 -240 120 -300Z" fill="#6a7a6a" stroke="${K}" stroke-width="3"/>${[-260, -200, -140, -80, -30].map((yy, i) => `<path d="M${-90 + i * 18} ${yy}q${90 - i * 16} 20 ${180 - i * 34} 0" fill="none" stroke="${K}" stroke-width="2" opacity=".6"/>`).join('')}</g>`;
  const greenSky = S => S.bg({ pal: 3, sun: false }) + `<rect width="800" height="250" fill="#6a8a5a" opacity=".55"/>`;
  add('tornado', {
    act: 3,
    scene: S => greenSky(S) + funnel(560, 300, 1) + S.prop('farmhouse', 380, 300, 1.2) + S.person('baron', 340, 330, 0.6, 'arms') + S.person('dixie', 420, 330, 0.55, 'arms')
      + S.fx('dust', 560, 290, 1.2) + rider(S, 120, 330, 0.9) + S.kana('ゴオオオ', 640, 60, 50, 8),
    out: {
      0: S => greenSky(S) + funnel(700, 300, 0.8) + `<path d="M300 300l20 -30h160l20 30z" fill="#6a4a2a" stroke="${K}" stroke-width="3"/><path d="M320 270l-30 -60" stroke="${K}" stroke-width="8"/>`
        + S.person(LK(), 260, 300, 0.95, 'arms') + S.bust('baron', 380, 300, 0.7) + S.bust('dixie', 440, 300, 0.6)
        + `<path d="M520 210q20 -20 60 -10l10 50q-40 10 -70 -10z" fill="#8a8aa0" stroke="${K}" stroke-width="2.4"/>` + S.caption('Into the storm cellar.', 12, 12, 190),
      '0:fail': S => greenSky(S) + funnel(560, 300, 1) + S.lines(360, 200, K, 30, 0.3) + `<path d="M280 150l60 -20 10 30 -60 20z" fill="#8a5a34" stroke="${K}" stroke-width="2.4"/>` + S.fx('boom', 300, 200, 0.5)
        + S.person(LK(), 300, 320, 0.95, 'kneel') + S.kana('ガンッ', 400, 100, 48, -8),
      1: S => greenSky(S) + funnel(160, 300, 0.9) + speedLines(160, 300, 1, 0.4) + rider(S, 520, 310, 1.1) + S.kana('追い風だ！', 640, 80, 38, 8, '#ffd84a'),
      '1:fail': S => greenSky(S) + funnel(360, 300, 1) + [[260, 120], [460, 80], [520, 200]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="40" height="18" fill="#8a5a34" stroke="${K}" stroke-width="2" transform="rotate(${i * 30} ${x} ${y})"/>`).join('')
        + `<path d="M620 120q20 -20 40 0v24h-40z" fill="#6a4a2a" stroke="${K}" stroke-width="2.4"/>` + rider(S, 160, 320, 0.9) + S.kana('あっ！', 640, 90, 40, 8),
    },
  });

  const herd = (x, y, n = 5, s = 0.9) => [...Array(n)].map((_, i) => `<g transform="translate(${x + i * 70 - (i % 2) * 20} ${y + (i % 2) * 18}) scale(${s})">${SBR.scenery.P.cow(i % 3 ? '#8a4a2a' : '#3a2a2a')}</g>`).join('');
  add('cattle', {
    act: 3,
    scene: S => S.bg({}) + herd(360, 290, 6) + S.person('bandit', 700, 280, 0.7, 'draw', true) + S.person('passbandit', 760, 290, 0.7, 'draw', true)
      + S.person('baron', 250, 312, 0.95, 'arms') + you(S, 110, 312, 0.9) + S.bubble('Rustlers! Help us!', 200, 30, 170, 250, 130) + S.kana('モォォ', 500, 180, 36, 0),
    out: {
      0: S => S.bg({}) + S.person('bandit', 560, 310, 0.9, 'draw', true) + S.person('passbandit', 680, 310, 0.9, 'draw', true) + S.person('thug', 760, 310, 0.8, 'draw', true)
        + S.person(LK(), 200, 312, 0.95, 'draw') + S.fx('bang', 270, 198, 0.7) + buddy(S, 100, 312, 0.85, 'draw') + S.kana('バキューン', 400, 80, 46, -6),
      1: S => S.bg({}) + S.fx('dust', 300, 280, 2.4) + herd(260, 300, 6, 1.1) + speedLines(160, 300, 1, 0.35) + `<path d="M680 300l20 -40 30 40z" fill="#e8dcc0" stroke="${K}" stroke-width="2.4" transform="rotate(20 700 280)"/>`
        + S.bust('passbandit', 740, 250, 0.6) + S.kana('ドドドドド', 400, 80, 54, -6),
      '1:fail': S => S.bg({}) + S.fx('dust', 400, 260, 2.8) + herd(300, 290, 5, 1) + S.person(LK(), 400, 330, 0.9, 'down') + S.kana('グシャ', 560, 100, 50, 10),
    },
  });

  add('revival', {
    act: 3,
    scene: S => S.bg({ pal: 'dusk' }) + tent(400, 300, 2, '#f6ecd8', '#c8323c') + `<path d="M470 220h70v80h-70z" fill="#8a5a34" stroke="${K}" stroke-width="2.6"/>` + S.person('steven', 505, 230, 0.7, 'arms')
      + S.bust('dixie', 180, 350, 0.8) + S.bust('baron', 260, 350, 0.75) + S.bust('snakeoil', 700, 350, 0.8, true) + you(S, 90, 320, 0.9)
      + S.bubble('A Saint walks this land in pieces!', 540, 20, 230, 520, 150) + S.kana('ハレルヤ', 300, 120, 36, -8),
    out: {
      0: S => S.bg({ inside: true, horizon: 260, pal: 'inside' }) + `<rect x="200" y="210" width="400" height="60" fill="#f6ecd8" stroke="${K}" stroke-width="3"/><rect x="180" y="170" width="30" height="110" fill="#8a5a34" stroke="${K}" stroke-width="3"/>`
        + S.bust(LK(), 280, 240, 0.7) + `<path d="M300 212q120 -20 290 0v20h-290z" fill="#6a8ac8" stroke="${K}" stroke-width="2.6"/>` + zz(520, 150) + S.person('steven', 700, 290, 0.8, 'stand', true) + S.fx('coins', 640, 190, 0.8),
      1: S => S.bg({ pal: 'dusk' }) + S.person('steven', 520, 320, 0.95, 'kneel', true) + `<path d="M440 220l30 -10 6 20 -30 10z" fill="#8aa05a" stroke="${K}" stroke-width="2.4"/>` + S.person(LK(), 260, 312, 1, 'point') + S.lines(520, 200, K, 30, 0.25)
        + S.bubble('I never saw you!', 560, 40, 160, 540, 160) + S.kana('ゴゴゴ', 150, 90, 40, -6, '#c8323c'),
      '1:fail': S => S.bg({ pal: 'dusk' }) + `<path d="M620 300V100L680 60L740 100V300Z" fill="#f6ecd8" stroke="${K}" stroke-width="3"/><path d="M665 120a15 18 0 0 1 30 0v14h-30z" fill="#c8a040" stroke="${K}" stroke-width="2.4"/>`
        + S.person('soldier', 480, 312, 0.9, 'draw', true) + S.person('soldier', 560, 312, 0.85, 'draw', true) + S.person(LK(), 180, 312, 0.95, 'draw') + S.kana('カラーン', 680, 40, 36, 8),
    },
  });

  add('telegraph', {
    act: 3,
    scene: S => S.bg({}) + S.prop('telegraph', 0, 0, 1, 100, 780, 300, 230, 150) + S.person(LK(), 330, 300, 0.9, 'arms') + buddy(S, 480, 312, 0.85, 'point', true)
      + S.kana('ジジジ', 560, 120, 36, 8, '#9fd0f0') + S.caption('The line runs straight to Washington.', 12, 12, 280),
    out: {
      0: S => S.bg({}) + `<rect x="300" y="220" width="200" height="60" fill="#8a5a34" stroke="${K}" stroke-width="3"/><path d="M380 220v-20h40v20" fill="#3a3a4a" stroke="${K}" stroke-width="2.4"/>` + S.person(LK(), 300, 312, 0.95, 'point')
        + paper(610, 130, 200, 110, 6, ['TO ALL AGENTS', 'target seen', '50 mi NORTH'], '#f6ecd8', 14) + S.kana('トン ツー トン', 420, 90, 34, -6),
      '0:fail': S => S.bg({}) + S.prop('telegraph', 0, 0, 1, 100, 780, 300, 230, 150) + S.person('agent', 560, 310, 0.9, 'draw', true) + S.person('agent', 640, 310, 0.85, 'draw', true) + S.person('soldier', 730, 310, 0.85, 'draw', true)
        + S.person(LK(), 200, 312, 0.95, 'draw') + S.bubble('That\'s a fake.', 560, 40, 140, 580, 130),
      1: S => S.bg({}) + S.prop('pole', 300, 300, 1.4) + S.prop('pole', 600, 300, 1.4) + `<path d="M300 150q60 30 90 60M600 150q-60 30 -90 60" stroke="${K}" stroke-width="3" fill="none"/>`
        + S.person(LK(), 450, 312, 0.95, 'arms') + S.fx('spark', 410, 210, 0.8) + `<circle cx="160" cy="290" r="26" fill="none" stroke="${K}" stroke-width="5"/><circle cx="160" cy="290" r="18" fill="none" stroke="#c8a040" stroke-width="3"/>` + S.kana('ブチン', 450, 80, 48, -6),
    },
  });

  /* ================= ACT IV ================= */
  const iceBg = S => S.bg({ pal: 4, horizon: 200 }) + `<path d="M0 200H800V360H0Z" fill="#dff2ff"/><path d="M40 230h160M300 250h220M560 226h180M100 300h260M480 320h240" stroke="#9fd0f0" stroke-width="3"/>`;
  add('frozenlake', {
    act: 4,
    scene: S => iceBg(S) + `<ellipse cx="420" cy="300" rx="130" ry="36" fill="#9fc8e8" stroke="${K}" stroke-width="2"/>` + `<g opacity=".75" transform="translate(420 300) scale(1 .5)">${S.bust('tattoo', 0, 60, 1.2)}</g>`
      + `<circle cx="408" cy="290" r="3" fill="#c8323c"/><circle cx="432" cy="290" r="3" fill="#c8323c"/>` + rider(S, 200, 290, 0.9) + H(S, 640, 280, 0.8, true)
      + S.kana('ギョロ', 420, 230, 40, 0, '#c8323c'),
    out: {
      0: S => iceBg(S) + cracks(420, 300, 9, 180) + S.fx('splash', 420, 300, 1.3) + S.person('tattoo', 440, 300, 1, 'arms') + S.person('tattoo', 600, 300, 0.85, 'draw', true)
        + S.person(LK(), 180, 312, 0.95, 'draw') + S.kana('バリーン', 440, 80, 50, -6),
      1: S => iceBg(S) + speedLines(210, 330, -1, 0.35) + rider(S, 440, 300, 1.1) + cracks(200, 320, 6, 120) + S.kana('ツルッ', 600, 120, 40, 8, '#9fd0f0') + S.fx('spark', 520, 300, 0.6),
      '1:fail': S => iceBg(S) + `<path d="M260 300Q420 250 580 300Q420 350 260 300Z" fill="#2a4a7a" stroke="${K}" stroke-width="3"/>` + S.fx('splash', 420, 290, 1.6)
        + S.bust(LK(), 400, 330, 0.8) + S.kana('ザブーン', 420, 110, 54, -6) + S.kana('冷た！', 640, 200, 32, 10, '#9fd0f0'),
    },
  });

  const aurora = S => S.bg({ pal: 'night', stars: true, horizon: 250 }) + `<path d="M0 250H800V360H0Z" fill="#eef4f8"/>`
    + [['#3ad8a0', 60], ['#8a5ad8', 110], ['#3ab8d8', 150]].map(([c, y], i) => `<path d="M0 ${y}Q200 ${y - 60 + i * 10} 400 ${y}T800 ${y - 20}V${y + 30}Q600 ${y + 10} 400 ${y + 40}T0 ${y + 30}Z" fill="${c}" opacity=".45"/>`).join('')
    + S.prop('pine', 60, 250, 1, 90, '#1f3a4a', true) + S.prop('pine', 740, 250, 1, 110, '#1f3a4a', true);
  add('aurora', {
    act: 4,
    scene: S => aurora(S) + you(S, 250, 320, 0.95, 'point') + (has('gyro') && lead() !== 'gyro' ? S.person('gyro', 520, 330, 0.9, 'kneel', true) : '')
      + `<rect x="560" y="300" width="130" height="80" fill="none" stroke="#9fd0f0" stroke-width="3"/><rect x="560" y="300" width="80" height="50" fill="none" stroke="#9fd0f0" stroke-width="3"/>`
      + S.bubble('Did the Saint see lights like this?', 40, 30, 240, 230, 130),
    out: {
      0: S => aurora(S) + S.lines(400, 300, '#f2c14e', 40, 0.3) + spiral(420, 310, 70, '#f2c14e', 4) + `<rect x="300" y="270" width="240" height="80" fill="none" stroke="#f2c14e" stroke-width="3"/>`
        + you(S, 170, 330, 0.9, 'kneel') + gyro(S, 650, 330, 0.9, 'kneel', true) + S.kana('黄金長方形', 400, 220, 36, 0, '#f2c14e'),
      1: S => aurora(S) + fire(400, 330, 0.8) + S.person(LK(), 290, 340, 0.9, 'down') + (pal() ? S.person(pal(), 560, 340, 0.85, 'down', true) : '') + zz(340, 250) + zz(600, 250),
    },
  });

  const chasm = S => `<path d="M330 360L360 250H460L490 360Z" fill="#1a1020"/><path d="M360 250L330 360M460 250L490 360" stroke="${K}" stroke-width="3"/>`;
  add('pocorace', {
    act: 4,
    scene: S => S.bg({ pal: 4, horizon: 250 }) + chasm(S) + rider(S, 200, 290, 0.95) + rider(S, 640, 330, 0.8, false, 'pocoloco', { coat: '#e8d8b0', mane: '#e8742a', wrap: '#f2c14e' })
      + S.stand('heyya', 720, 220, 0.5) + `<path d="M620 330Q560 200 480 250" stroke="#f2c14e" stroke-width="3" stroke-dasharray="6 5" fill="none"/>` + S.kana('ゴクリ', 410, 200, 40, 0),
    out: {
      0: S => S.bg({ pal: 4, horizon: 250 }) + chasm(S) + rope(300, 220, 540, 220, 16) + ball(300, 220, 14) + spiral(300, 220, 30) + ball(540, 220, 14) + spiral(540, 220, 30)
        + rider(S, 420, 220, 0.8) + S.kana('ギャルルル', 420, 80, 44, -6, '#3fb8a9'),
      '0:fail': S => S.bg({ pal: 4, horizon: 250 }) + chasm(S) + `<path d="M300 220Q340 260 370 330" stroke="#c8a86a" stroke-width="4" fill="none"/>` + S.person(LK(), 330, 270, 0.8, 'arms') + S.kana('ズルッ', 500, 140, 48, 8),
      1: S => S.bg({ pal: 4, horizon: 250 }) + S.stand('heyya', 580, 230, 0.6) + `<path d="M480 300l10 -30h60l10 30z" fill="#8a5a34" stroke="${K}" stroke-width="2.6"/><path d="M500 272l-6 -30 12 0z" fill="#8aa05a" stroke="${K}" stroke-width="2"/>`
        + S.person('pocoloco', 420, 312, 0.95, 'point', false) + you(S, 250, 312, 0.9) + S.bubble('Lucky, lucky!', 600, 40, 140, 580, 140),
    },
  });

  /* ================= ACT V & VI ================= */
  const city = S => S.bg({ pal: 5, horizon: 290, far: false }) + S.prop('skyline', 0, 290, 1, (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(), 0, 800, 0, '#7a4a4a', 'philly', true);
  add('mirror', {
    act: 5,
    scene: S => city(S) + S.prop('flag', 330, 300, 1.4, '#c8323c') + `<path d="M430 50Q470 180 430 300Q540 180 520 50Z" fill="#c8c0e8" stroke="${K}" stroke-width="3"/>`
      + `<ellipse cx="480" cy="210" rx="46" ry="100" fill="#8a7ad8" opacity=".45"/><g opacity=".85">${S.person(LK(), 480, 300, 0.8, 'stand', true)}</g>` + S.tone('M430 50Q470 180 430 300Q540 180 520 50Z', 0.3)
      + you(S, 200, 312, 0.95) + S.kana('ゴゴゴ', 650, 90, 44, 8, '#b8a0e0') + S.caption('The other one never touched the steel ball.', 560, 250, 230),
    out: {
      0: S => city(S) + S.lines(400, 180, K, 40, 0.3) + S.person(LK(), 300, 312, 1, 'draw') + `<ellipse cx="500" cy="210" rx="56" ry="116" fill="#8a7ad8" opacity=".45"/><g transform="translate(800 0) scale(-1 1)">${S.person(LK(), 300, 312, 1, 'draw')}</g>`
        + S.fx('boom', 400, 200, 0.7) + S.kana('ドドドド', 400, 70, 50, 0),
      1: S => city(S) + `<path d="M430 50Q470 180 430 300Q540 180 520 50Z" fill="#c8c0e8" stroke="${K}" stroke-width="3"/>` + S.person(LK(), 280, 312, 1, 'point')
        + cube(470, 180, 22) + S.lines(470, 180, '#9fd0f0', 30, 0.35) + S.kana('パシッ', 560, 80, 44, 8),
      '1:fail': S => city(S) + S.person(LK(), 300, 312, 1, 'point') + [[360, 196], [384, 190], [406, 184], [390, 164], [420, 206], [440, 170]].map(([x, y], i) => cube(x, y, 8 - i % 3, '#c8c0e8')).join('')
        + S.kana('ボロボロ', 500, 100, 48, 8, '#c8c0e8'),
    },
  });

  const sewer = S => S.bg({ inside: true, horizon: 270, pal: 'night' }) + `<path d="M0 0H800V360H0Z" fill="#3a3a4a"/><path d="M60 360V160Q400 -60 740 160V360Z" fill="#2a2a3a" stroke="${K}" stroke-width="4"/>`
    + [...Array(8)].map((_, i) => `<path d="M${80 + i * 90} ${150 - Math.sin(i / 7 * Math.PI) * 110}v20" stroke="${K}" stroke-width="2" opacity=".4"/>`).join('')
    + `<rect x="60" y="270" width="680" height="90" fill="#3a5a4a" stroke="${K}" stroke-width="3"/><path d="M100 300h120M380 320h160M560 296h120" stroke="#8ab89a" stroke-width="3"/>`;
  add('sewer', {
    act: 5,
    scene: S => sewer(S) + `<path d="M520 300h200l-20 20h-170z" fill="#6a4a2a" stroke="${K}" stroke-width="3"/>` + S.person('agent', 460, 272, 0.85, 'point', true) + S.person('abbess', 360, 278, 0.8, 'kneel', true)
      + S.bust(LK(), 140, 270, 0.9) + S.kana('ピチャ…', 620, 120, 36, 8, '#8ab89a'),
    out: {
      0: S => sewer(S) + S.person('agent', 520, 272, 0.9, 'arms', true) + S.kana('ピーーッ', 600, 100, 44, 8) + S.person(LK(), 260, 272, 0.95, 'draw') + S.person('abbess', 380, 280, 0.75, 'kneel'),
      1: S => sewer(S) + `<path d="M60 250H740" stroke="${K}" stroke-width="6"/>` + S.person(LK(), 200, 256, 0.8, 'stand') + `<g opacity=".4">${S.person('agent', 620, 256, 0.8, 'stand', true)}</g>`
        + S.kana('こそ…', 300, 120, 36, -6) + S.caption('Disgusting, but fast.', 520, 12, 200),
      '1:fail': S => sewer(S) + S.fx('splash', 300, 290, 1.4) + S.bust(LK(), 300, 330, 0.8) + S.person('agent', 560, 272, 0.9, 'draw', true) + S.person('agent', 660, 272, 0.85, 'draw', true) + S.kana('バシャ', 300, 160, 48, -6),
    },
  });

  add('newsboy', {
    act: 5,
    scene: S => city(S) + S.prop('lamp', 620, 300, 1.2) + S.person('marco', 420, 312, 0.85, 'point', true) + paper(350, 200, 60, 70, -10, ['EXTRA!'], '#f6ecd8', 10)
      + `<path d="M370 300l-10 -40h50l-10 40z" fill="#f6ecd8" stroke="${K}" stroke-width="2.4"/>` + you(S, 220, 312, 0.95) + S.bubble('EXTRA! Diego Brando leads!', 460, 30, 210, 440, 110),
    out: {
      0: S => city(S) + paper(400, 180, 300, 200, -3, ['for Johnny Joestar:', '"The Heart is with him.', 'The Head is with me.', 'Hurry."', '— L.'], '#fff6f8', 16)
        + S.bust('lucy', 660, 330, 1, true) + S.kana('ドキン', 140, 90, 44, -8, '#e8508a'),
      1: S => city(S) + S.person('marco', 480, 312, 0.85, 'point', true) + paper(390, 200, 80, 60, 8, ['PATROLS', '9 · 12 · 3'], '#f6ecd8', 10) + S.fx('coins', 330, 230, 0.8)
        + you(S, 220, 312, 0.95) + S.bubble('Like clockwork, mister.', 520, 40, 180, 500, 120),
    },
  });

  /* ================= PAYOFFS ================= */
  add('brother', {
    scene: S => S.bg({ pal: 'dusk' }) + rider(S, 520, 300, 0.9, true, 'kansasgun', { coat: '#3a2a2a', mane: '#1a1020', wrap: '#c8323c' }) + rider(S, 700, 296, 0.8, true, 'bandit', { coat: '#8a6a4a', mane: '#1a1020', wrap: '#3a3a4a' })
      + S.person('gunslinger', 380, 310, 1, 'draw', true) + you(S, 140, 312, 0.95) + S.bubble('You left my brother in a ditch.', 380, 20, 230, 400, 110) + S.kana('ゴゴゴ', 250, 80, 40, -6, '#c8323c'),
    out: {
      0: S => S.bg({ pal: 'dusk' }) + S.lines(400, 180, K, 40, 0.3) + S.person(LK(), 200, 312, 1, 'draw') + S.fx('bang', 270, 198, 0.9) + S.person('gunslinger', 600, 312, 1, 'draw', true) + S.fx('bang', 530, 198, 0.9)
        + S.kana('ダン！', 400, 90, 60, 0, '#ffd84a'),
      1: S => S.bg({ pal: 'dusk' }) + S.person('gunslinger', 500, 312, 1, 'stand', true) + `<path d="M476 250h-22v6h16z" fill="#7a7a8a" stroke="${K}" stroke-width="2"/>` + S.person(LK(), 260, 320, 0.95, 'kneel')
        + `<path d="M330 290h50v16h-50z" fill="#8a5a34" stroke="${K}" stroke-width="2.4"/>` + S.bubble('You still have a conscience.', 520, 30, 210, 510, 110),
      '1:fail': S => S.bg({ pal: 'dusk' }) + S.person('gunslinger', 520, 312, 1, 'draw', true) + S.fx('bang', 450, 198, 1) + S.person(LK(), 220, 320, 0.95, 'kneel') + S.kana('問答無用', 420, 80, 44, -6),
    },
  });

  add('repaid', {
    scene: S => S.bg({}) + rider(S, 480, 300, 0.95, true, 'marco', { coat: '#a8784a', mane: '#3a2a1a', wrap: '#3b5bb5' }) + rider(S, 660, 296, 1, true, 'kansasgun', { coat: '#3a2a2a', mane: '#1a1020', wrap: '#c8323c' })
      + `<path d="M600 190l90 -10" stroke="${K}" stroke-width="6"/>` + you(S, 180, 312, 0.95, 'arms') + S.bubble('We Blackwoods pay our debts!', 400, 20, 220, 470, 150),
    out: {
      0: S => S.bg({}) + S.person('kansasgun', 520, 312, 0.95, 'point', true) + `<path d="M380 220L480 200" stroke="${K}" stroke-width="9" stroke-linecap="round"/><path d="M380 220L480 200" stroke="#8a5a34" stroke-width="5" stroke-linecap="round"/>`
        + paper(640, 160, 70, 90, 8, ['BOINGO'], '#f2c14e', 12) + you(S, 260, 312, 0.95, 'point') + S.kana('ガシッ', 420, 120, 40, -6),
      1: S => S.bg({}) + S.prop('peak', 560, 250, 1, 400, 140, '#8a6a5a', '#6a4a3a', false) + `<path d="M800 300Q600 260 520 200Q480 160 420 150" fill="none" stroke="#f2c14e" stroke-width="5" stroke-dasharray="10 6"/>`
        + S.person('marco', 300, 312, 0.85, 'point') + you(S, 150, 312, 0.95) + S.caption('A route no map shows.', 560, 12, 200),
    },
  });

  add('scoutreturns', {
    scene: S => S.bg({}) + `<path d="M0 290h800v70H0z" fill="#b8b050"/>` + [...Array(30)].map((_, i) => `<path d="M${i * 28} 300q4 -26 10 -40M${i * 28 + 10} 300q-2 -20 -8 -30" stroke="${K}" stroke-width="2" fill="none"/>`).join('')
      + S.person('sandman', 520, 312, 1, 'point', true) + you(S, 200, 312, 0.95) + buddy(S, 110, 312, 0.85) + S.bubble('Listen for the sound. Do not touch what speaks.', 460, 20, 260, 500, 110),
    out: {
      0: S => S.bg({}) + S.person('sandman', 500, 312, 1, 'point', true) + feather(420, 220, -40, 1.3) + you(S, 250, 312, 0.95)
        + S.kana('ドグォン', 650, 120, 34, 8, '#8a6a4a') + `<g opacity=".5">${S.kana('ドグォン', 680, 170, 26, 8, '#8a6a4a')}</g>` + S.caption('Flag: you know how Silent Way works.', 12, 12, 270),
      1: S => S.bg({ pal: 'dusk' }) + `<path d="M0 330Q300 280 500 300T800 250" fill="none" stroke="#f2c14e" stroke-width="5" stroke-dasharray="10 6"/>` + S.prop('totem', 640, 290, 0.9)
        + S.person('sandman', 500, 300, 0.85, 'point') + rider(S, 280, 320, 0.9) + S.caption('Paths older than the country.', 12, 12, 230),
    },
  });

  add('warpaint', {
    scene: S => S.bg({ pal: 'dusk' }) + [0, 1, 2, 3, 4].map(i => rider(S, 380 + i * 90, 296 - (i % 2) * 10, 0.8, true, i === 2 ? 'sandman' : 'whisperer', { coat: ['#8a5a3a', '#f6ecd8', '#5a3a2a', '#c8a070', '#3a2a2a'][i], mane: '#1a1020', wrap: '#3fb8a9' })).join('')
      + you(S, 140, 312, 0.95) + S.bubble('These are the ones who took our water.', 360, 20, 260, 560, 160),
    out: {
      0: S => S.bg({ pal: 'dusk' }) + [[300, 120], [380, 90], [460, 140]].map(([x, y]) => `<path d="M${x + 120} ${y - 30}L${x} ${y}" stroke="${K}" stroke-width="4"/><path d="M${x} ${y}l12 -8 -2 10z" fill="${K}"/>`).join('')
        + S.person(LK(), 200, 312, 1, 'draw') + S.fx('bang', 270, 198, 0.7) + cougar(560, 312, 1, true, true) + S.person('whisperer', 700, 312, 0.9, 'draw', true) + S.kana('ヒュン', 420, 60, 40, -6),
      1: S => S.bg({ pal: 'dusk' }) + S.person('sandman', 520, 312, 1, 'stand', true) + `<path d="M400 250h40v24h-40z" fill="#f6ecd8" stroke="${K}" stroke-width="2.4"/><path d="M414 254h12M420 248v12" stroke="#c8323c" stroke-width="4"/>`
        + S.person(LK(), 280, 312, 0.95, 'point') + S.caption('He nods. The debt is paid.', 540, 12, 220),
      '1:fail': S => S.bg({ pal: 'dusk' }) + S.person('sandman', 520, 312, 1, 'draw', true) + `<path d="M400 290l-20 20h40z" fill="#f6ecd8" stroke="${K}" stroke-width="2"/>` + S.person(LK(), 240, 312, 0.95, 'stand')
        + S.bubble('We don\'t want your charity.', 520, 30, 200, 520, 110) + S.kana('ザッ', 680, 200, 44, 8),
    },
  });

  const cage = (x, y, inner = '') => `<g transform="translate(${x} ${y})"><path d="M-120 -20H120V-150H-120Z" fill="#3a2a20" stroke="${K}" stroke-width="3"/></g>${inner}<g transform="translate(${x} ${y})"><path d="M-120 -20H120V-150H-120Z" fill="none" stroke="${K}" stroke-width="3"/><path d="M-126 -150H126V-160H-126Z" fill="#5a4a3a" stroke="${K}" stroke-width="2.6"/><path d="M-126 -20H126V-10H-126Z" fill="#5a4a3a" stroke="${K}" stroke-width="2.6"/>${[-90, -60, -30, 0, 30, 60, 90].map(bx => `<path d="M${bx} -150V-20" stroke="${K}" stroke-width="5"/>`).join('')}<circle cx="-80" cy="0" r="24" fill="#8a6a4a" stroke="${K}" stroke-width="3"/><circle cx="80" cy="0" r="24" fill="#8a6a4a" stroke="${K}" stroke-width="3"/></g>`;
  add('farrierpay', {
    scene: S => S.bg({}) + cage(470, 300, S.bust('miner', 470, 282, 1)) + S.person('soldier', 650, 300, 0.85, 'stand', true) + S.person('soldier', 290, 300, 0.85, 'stand')
      + you(S, 110, 312, 0.95) + S.bubble('My daughter shod your horse, didn\'t she?', 520, 20, 240, 490, 150),
    out: {
      0: S => S.bg({}) + cage(470, 300) + S.fx('boom', 470, 200, 0.6) + S.person('soldier', 660, 312, 0.85, 'down', true) + S.person(LK(), 230, 312, 1, 'draw') + S.person('miner', 470, 312, 0.9, 'arms')
        + S.kana('ガシャーン', 470, 70, 48, -6),
      1: S => S.bg({}) + cage(500, 300, S.bust('miner', 500, 282, 1)) + S.person(LK(), 280, 312, 0.95, 'stand')
        + `<path d="M140 290v-26a14 14 0 1 1 28 0v26M130 290h20M158 290h20" fill="none" stroke="#9a9aa8" stroke-width="6"/>` + S.bubble('Under the forge, third stone.', 560, 20, 200, 520, 150),
    },
  });

  /* ================= DETOURS (js/areas.js entry encounters) ================= */
  add('area_devilspalm', {
    act: 1,
    scene: S => S.bg({ pal: 'dusk' }) + spiral(400, 310, 260, '#e8b36a', 5) + S.prop('hand', 400, 300, 1.1) + S.prop('skull', 170, 330, 0.8) + rider(S, 110, 320, 0.8)
      + S.kana('ザザザ…', 620, 120, 40, 8, '#e8b36a'),
    out: {
      0: S => S.bg({ pal: 'dusk' }) + S.prop('hand', 420, 320, 1.6) + S.lines(420, 200, '#e8b36a', 40, 0.3) + rider(S, 420, 330, 0.7) + S.kana('ゴゴゴ', 650, 100, 44, 8, '#c8323c'),
      1: S => S.bg({ pal: 'dusk' }) + S.prop('hand', 640, 300, 0.7) + you(S, 250, 312, 0.95, 'kneel') + `<path d="M300 300q20 -10 40 0z" fill="#e8b36a" stroke="${K}" stroke-width="2"/>` + S.caption('Picking up what the Palm leaves at its edge.', 12, 12, 280),
    },
  });
  add('area_silvermine', {
    act: 3,
    scene: S => S.bg({ horizon: 300 }) + S.prop('mineMouth', 480, 300, 1.8) + S.prop('lantern', 390, 160, 1.4) + S.prop('lantern', 570, 160, 1.4) + S.prop('mineCart', 250, 310, 0.9)
      + `<path d="M620 70h120v40h-120z" fill="#e8d8a0" stroke="${K}" stroke-width="2.4"/><text x="680" y="96" font-size="15" font-family="Oswald,sans-serif" font-weight="700" text-anchor="middle" fill="${K}">ABANDONED</text>`
      + S.person('miner', 680, 312, 0.85, 'point', true) + you(S, 110, 312, 0.95) + S.kana('ゴロン…', 480, 210, 30, 0, '#f2c14e'),
    out: {
      0: S => S.bg({ inside: true, horizon: 300, pal: 'night' }) + `<path d="M0 0H800V360H0Z" fill="#241a30"/>` + S.prop('lantern', 400, 60, 1.6) + S.prop('crystal', 620, 300, 1.4) + S.prop('mineCart', 220, 310, 0.9)
        + S.person(LK(), 400, 312, 0.95, 'point') + S.caption('Deeper in, something turns over.', 12, 12, 240),
      1: S => S.bg({ horizon: 300 }) + S.prop('mineMouth', 600, 300, 1.4) + you(S, 260, 312, 0.95, 'kneel') + S.prop('crates', 360, 310, 1) + S.fx('coins', 330, 290, 0.6),
    },
  });
  add('area_lakeice', {
    act: 4,
    scene: S => iceBg(S) + S.prop('wolf', 520, 230, 0.8) + S.prop('wolf', 600, 226, 0.7) + `<g transform="translate(420 236) scale(1.4)">${SBR.scenery.P.wolf().replace(/#3a4a6a/g, '#f6fbff')}</g>`
      + S.person('trapper', 250, 320, 0.95, 'point') + you(S, 110, 320, 0.9) + S.bubble('The white one\'s bigger than your horse.', 300, 20, 240, 280, 150),
    out: {
      0: S => iceBg(S) + speedLines(210, 330, -1, 0.3) + rider(S, 400, 310, 1) + `<g transform="translate(680 240) scale(1.6)">${SBR.scenery.P.wolf().replace(/#3a4a6a/g, '#f6fbff')}</g>` + S.kana('アオーン', 640, 100, 40, 8, '#9fd0f0'),
      1: S => iceBg(S) + S.person('trapper', 540, 320, 0.9, 'stand', true) + you(S, 300, 320, 0.95, 'kneel') + `<path d="M360 318l12 -24 20 4 -6 20z" fill="#dff2ff" stroke="${K}" stroke-width="2"/>`,
    },
  });
  add('area_railyard', {
    act: 5,
    scene: S => S.bg({ pal: 5, horizon: 280 }) + `<path d="M0 312H800M0 330H800" stroke="${K}" stroke-width="4"/>` + S.prop('boxcar', 250, 300, 1.2) + S.prop('boxcar', 560, 300, 1.2, '#3a3a4a', 'U.S.')
      + S.person('tattoo', 420, 320, 0.8, 'stand', true) + S.person('tattoo', 480, 320, 0.8, 'stand', true) + S.person('tattoo', 540, 320, 0.8, 'stand', true) + you(S, 110, 330, 0.9)
      + S.kana('ザッ ザッ ザッ', 620, 80, 34, 8),
    out: {
      0: S => S.bg({ pal: 5, horizon: 280 }) + `<path d="M0 312H800M0 330H800" stroke="${K}" stroke-width="4"/>` + S.prop('boxcar', 460, 300, 1.4, '#3a3a4a', 'U.S.') + S.person(LK(), 460, 180, 0.7, 'kneel') + S.caption('Into the yard.', 12, 12, 140),
      1: S => S.bg({ pal: 5, horizon: 280 }) + S.prop('boxcar', 600, 300, 1) + you(S, 260, 312, 0.95, 'kneel') + `<path d="M310 300h30v-6h-10v-20h-10v20h-10z" fill="#7a7a8a" stroke="${K}" stroke-width="2"/>`,
    },
  });
})();
