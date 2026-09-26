/* Illustrated encounter scenes (see js/evscene.js for the toolkit) */
'use strict';
(() => {
  const K = '#1a1020';
  const lead = () => (SBR.run && SBR.run.lead) || 'johnny';
  const has = id => !!(SBR.run && SBR.run.party.some(m => m.id === id));
  const add = (id, act, fn, keys) => {
    const out = {}; keys.forEach(k => { out[k] = S => fn(S, k); });
    SBR.evs.add(id, { act, scene: S => fn(S, 's'), out });
  };
  const me = (S, x, y, s = 0.8, pose = 'stand', flip) => S.person(lead(), x, y, s, pose, flip);
  const friend = () => ['gyro', 'johnny', 'mountaintim', 'hotpants', 'lucy', 'diego', 'wekapipo', 'pocoloco'].find(id => id !== lead() && has(id));
  const pal = (S, x, y, s = 0.78, pose = 'stand', flip) => { const f = friend(); return f ? S.person(f, x, y, s, pose, flip) : ''; };
  const ride = (S, x, y, s = 1, flip, o = {}) => { const H = (SBR.HORSES && SBR.run && SBR.HORSES[SBR.run.horse]) || {}; return S.horse(x, y, s, Object.assign({ coat: H.coat, mane: H.mane, wrap: H.wrap }, o), flip); };

  /* ---------- inline props ---------- */
  const st = `stroke="${K}" stroke-width="3" stroke-linejoin="round"`;
  const fire = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 0l60 -6M-30 -6l60 6" stroke="${K}" stroke-width="10" stroke-linecap="round"/><path d="M-30 0l60 -6M-30 -6l60 6" stroke="#7a4a2a" stroke-width="6" stroke-linecap="round"/><path d="M-22 -4Q-26 -40 -6 -60Q-10 -36 4 -34Q2 -60 14 -76Q30 -40 22 -4Z" fill="#f2743a" ${st}/><path d="M-10 -6Q-12 -28 0 -38Q2 -22 12 -24Q16 -14 10 -6Z" fill="#ffd84a" stroke="${K}" stroke-width="2"/></g>`;
  const cup = (x, y, s = 1, c = '#8a8a9a') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-10 -24h20l-2 24h-16z" fill="${c}" ${st}/><path d="M10 -18q10 0 8 8t-9 4" fill="none" ${st}/><ellipse cx="0" cy="-24" rx="10" ry="3" fill="#2a1a10" stroke="${K}" stroke-width="2"/></g>`;
  const letter = (x, y, s = 1, rot = -8, seal = '#c8323c') => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><rect x="-34" y="-22" width="68" height="44" fill="#f6ecd8" ${st}/><path d="M-34 -22L0 4L34 -22" fill="none" stroke="${K}" stroke-width="2.5"/><circle cx="0" cy="4" r="8" fill="${seal}" stroke="${K}" stroke-width="2"/></g>`;
  const paper = (x, y, w, h, rot = 0, lines = 4, c = '#f6ecd8') => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="${c}" ${st}/>${[...Array(lines)].map((_, i) => `<path d="M${-w / 2 + 8} ${-h / 2 + 12 + i * (h - 18) / Math.max(1, lines - 1)}h${w - 16 - (i % 2) * 12}" stroke="${K}" stroke-width="2" opacity=".55"/>`).join('')}</g>`;
  const pigeon = (x, y, s = 1, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><path d="M-22 0q4 -18 22 -16q12 -12 22 -2q-8 2 -10 6q6 12 -8 16q-18 4 -26 -4z" fill="#b8b8c8" ${st}/><path d="M-6 -10q10 -22 26 -24q-6 14 -20 26z" fill="#8a8aa0" ${st}/><circle cx="14" cy="-10" r="2" fill="${K}"/><path d="M22 -8l7 2l-7 2" fill="#f2c14e" stroke="${K}" stroke-width="1.5"/></g>`;
  const gem = (x, y, s = 1, c = '#3ac87a') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-16 -8l8 -10h16l8 10l-16 22z" fill="${c}" ${st}/><path d="M-16 -8h32M-8 -18l8 32l8 -32" fill="none" stroke="${K}" stroke-width="1.8"/><path d="M-4 -14l-4 6" stroke="#fff" stroke-width="3"/></g>`;
  const ball = (x, y, r = 12) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#c8c8d8" ${st}/><path d="M${x - r * .7} ${y - r * .2}q${r * .7} ${r * .8} ${r * 1.4} 0M${x - r * .5} ${y + r * .4}q${r * .5} ${r * .4} ${r} 0" fill="none" stroke="${K}" stroke-width="1.6"/><circle cx="${x - r * .35}" cy="${y - r * .4}" r="${r * .22}" fill="#fff"/>`;
  const whirl = (x, y, r = 30, c = '#f2c14e') => `<path d="M${x + r} ${y}A${r} ${r} 0 1 1 ${x} ${y - r}M${x + r * .6} ${y}A${r * .6} ${r * .6} 0 1 1 ${x} ${y - r * .6}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
  const corpse = (x, y, s = 1, part = 'arm') => `<g transform="translate(${x} ${y}) scale(${s})"><g fill="#a88a5a" ${st}>${part === 'legs' ? '<path d="M-14 -40h10l2 40h-12zM4 -40h10l-2 40h-10z"/>' : part === 'eyes' ? '<ellipse cx="-10" cy="-10" rx="8" ry="6"/><ellipse cx="10" cy="-10" rx="8" ry="6"/>' : '<path d="M-30 -8q20 -8 50 -4l10 -6q8 2 6 8l-6 4q2 6 -6 8q-30 6 -54 2z"/>'}</g><path d="M-26 -4h40M-8 -12v12" stroke="#f6ecd8" stroke-width="2" opacity=".7"/>${part === 'eyes' ? '<circle cx="-10" cy="-10" r="2" fill="#1a1020"/><circle cx="10" cy="-10" r="2" fill="#1a1020"/>' : ''}<circle cx="0" cy="-10" r="44" fill="#fff3c0" opacity=".18"/></g>`;
  const glow = (x, y, r = 50, c = '#fff3c0', op = 0.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${op}"/><circle cx="${x}" cy="${y}" r="${r * .6}" fill="${c}" opacity="${op}"/>`;
  const tent = (x, y, s = 1, c = '#e8d8b8') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-70 0L0 -90L70 0Z" fill="${c}" ${st}/><path d="M0 -90L-16 0H16Z" fill="#3a2a1a" ${st}/><path d="M0 -90v-16" ${st}/><path d="M0 -106l20 6l-20 6" fill="#c8323c" stroke="${K}" stroke-width="2"/></g>`;
  const fence = (x0, x1, y, h = 40, c = '#9a6a3a') => { let s = `<path d="M${x0} ${y - h * .7}H${x1}M${x0} ${y - h * .3}H${x1}" stroke="${K}" stroke-width="7"/><path d="M${x0} ${y - h * .7}H${x1}M${x0} ${y - h * .3}H${x1}" stroke="${c}" stroke-width="4"/>`; for (let x = x0; x <= x1; x += 44) s += `<rect x="${x - 4}" y="${y - h}" width="8" height="${h}" fill="${c}" stroke="${K}" stroke-width="2.5"/>`; return s; };
  const table = (x, y, w = 160, c = '#7a4a2a') => `<path d="M${x - w / 2} ${y}h${w}v10h${-w}z" fill="${c}" ${st}/><path d="M${x - w / 2 + 10} ${y + 10}v40M${x + w / 2 - 10} ${y + 10}v40" stroke="${K}" stroke-width="7"/><path d="M${x - w / 2 + 10} ${y + 10}v40M${x + w / 2 - 10} ${y + 10}v40" stroke="${c}" stroke-width="3.5"/>`;
  const bottle = (x, y, s = 1, c = '#4a8a4a') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-8 0v-26q0 -6 5 -9v-10h6v10q5 3 5 9v26z" fill="${c}" ${st}/><path d="M-4 -24v16" stroke="#fff" stroke-width="2.4" opacity=".6"/></g>`;
  const bees = (x, y, n = 14, r = 60) => [...Array(n)].map((_, i) => { const a = i * 2.4, d = r * (0.3 + (i * 37 % 70) / 100); const bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d * 0.7; return `<g transform="translate(${bx.toFixed(1)} ${by.toFixed(1)}) rotate(${i * 40})"><ellipse rx="6" ry="4" fill="#f2c14e" stroke="${K}" stroke-width="1.8"/><path d="M-1 -4v8M3 -3v6" stroke="${K}" stroke-width="1.6"/><ellipse cx="-2" cy="-6" rx="4" ry="2.6" fill="#fff" stroke="${K}" stroke-width="1.2" opacity=".85"/></g>`; }).join('');
  const rain = (op = 0.5, hang) => `<g stroke="#9fc7e8" stroke-width="2.4" opacity="${op}" stroke-linecap="round">${[...Array(70)].map((_, i) => { const x = (i * 131) % 800, y = (i * 67) % 340; return hang ? `<path d="M${x} ${y}q-3 6 0 9q3 -3 0 -9z" fill="#9fc7e8" stroke="${K}" stroke-width="1"/>` : `<path d="M${x} ${y}l-8 22"/>`; }).join('')}</g>`;
  const snow = (op = 0.8) => `<g fill="#fff" opacity="${op}">${[...Array(50)].map((_, i) => `<circle cx="${(i * 151) % 800}" cy="${(i * 89) % 330}" r="${1.5 + i % 3}"/>`).join('')}</g>`;
  const fog = (y = 220, op = 0.75) => `<g opacity="${op}">${[...Array(7)].map((_, i) => `<ellipse cx="${i * 130 + 40}" cy="${y + (i % 2) * 30}" rx="140" ry="36" fill="#e8eef4"/>`).join('')}</g>`;
  const river = (y = 290, h = 70, c = '#5a8ac8') => `<rect x="0" y="${y}" width="800" height="${h}" fill="${c}" stroke="${K}" stroke-width="3"/>${[...Array(10)].map((_, i) => `<path d="M${i * 84 + 10} ${y + 16 + (i % 3) * 16}q14 -8 28 0t28 0" fill="none" stroke="#e8f6ff" stroke-width="2.5"/>`).join('')}`;
  const crate = (x, y, w = 70, h = 54, c = '#b8844a', glowing) => `${glowing ? glow(x, y - h / 2, 70, '#fff3c0', 0.35) : ''}<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" fill="${c}" ${st}/><path d="M${x - w / 2} ${y - h}L${x + w / 2} ${y}M${x - w / 2} ${y - h / 2}H${x + w / 2}" stroke="${K}" stroke-width="2.5"/>`;
  const poster = (x, y, s = 1, face) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-40" y="-56" width="80" height="112" fill="#f2e2b0" ${st}/><text x="0" y="-38" font-size="15" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${K}">WANTED</text><rect x="-24" y="-30" width="48" height="50" fill="#e8d8a8" stroke="${K}" stroke-width="2"/><text x="0" y="40" font-size="13" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="#c8323c">$200</text></g>${face ? S_bust(face, x, y - 2 * s, 0.42 * s) : ''}`;
  let S_bust = () => '';
  const pin = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-12" r="5" fill="#c8323c" stroke="${K}" stroke-width="2"/><path d="M0 -7v14" stroke="${K}" stroke-width="2.4"/></g>`;
  const headstone = (x, y, s = 1, c = '#a8a8b0') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 0v-44q0 -18 22 -18t22 18v44z" fill="${c}" ${st}/><path d="M0 -48v20M-8 -40h16" stroke="${K}" stroke-width="2.5"/></g>`;
  const swarm = (x, y, r) => bees(x, y, 18, r);
  const hat = (x, y, s = 1, c = '#e8d8b8', rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><ellipse cx="0" cy="0" rx="30" ry="8" fill="${c}" ${st}/><path d="M-16 -2q0 -22 16 -22t16 22z" fill="${c}" ${st}/><path d="M-16 -6h32" stroke="#c8323c" stroke-width="4"/></g>`;
  const note = (S, t, x, y, w) => S.bubble(t, x, y, w);
  const stoneWord = (x, y, w = 'DOGOOON', s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-34 0q-4 -30 14 -38q24 -6 44 4q10 14 6 34z" fill="#a8a098" ${st}/><text x="0" y="-12" font-size="13" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="#c8323c">${w}</text></g>`;
  const car = (x, y, s = 1, broken) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-90 -20v-26h40l14 -26h60l10 26h50v26z" fill="#c8323c" ${st}/><path d="M-40 -48l10 -18h40l6 18z" fill="#9fc7e8" stroke="${K}" stroke-width="2.5"/><path d="M60 -46h24" stroke="${K}" stroke-width="3"/><rect x="74" y="-44" width="12" height="18" fill="#f2c14e" stroke="${K}" stroke-width="2"/>${[-58, 54].map(cx => `<circle cx="${cx}" cy="-16" r="18" fill="#3a2a2a" ${st}/><circle cx="${cx}" cy="-16" r="7" fill="#f2c14e" stroke="${K}" stroke-width="2"/>`).join('')}${broken ? '' : ''}</g>`;
  const gridFloor = (hz = 250, c = '#e8508a') => `<g stroke="${c}" stroke-width="3" opacity=".9">${[...Array(13)].map((_, i) => `<path d="M${400 + (i - 6) * 40} ${hz}L${400 + (i - 6) * 190} 360"/>`).join('')}${[0, 18, 42, 76, 110].map(d => `<path d="M0 ${hz + d}H800"/>`).join('')}</g>`;
  const building = (x, y, w, h, c = '#b85a3a', win = 3, rows = 3) => { let s = `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" fill="${c}" ${st}/>`; for (let r = 0; r < rows; r++) for (let i = 0; i < win; i++) s += `<rect x="${x - w / 2 + (i + 0.5) * w / win - 8}" y="${y - h + 14 + r * (h - 30) / rows}" width="16" height="22" fill="#fff3c0" stroke="${K}" stroke-width="2"/>`; return s; };
  const ice = (y = 280) => `<rect x="0" y="${y}" width="800" height="${360 - y}" fill="#cfe6f4" stroke="${K}" stroke-width="3"/>${[...Array(8)].map((_, i) => `<path d="M${i * 100 + 20} ${y + 20 + (i % 3) * 14}l30 8l20 -6" fill="none" stroke="#8ab0c8" stroke-width="2.5"/>`).join('')}`;
  const logs = (y = 300) => [...Array(9)].map((_, i) => `<rect x="${i * 90}" y="${y}" width="84" height="22" rx="10" fill="#8a5a30" ${st}/>`).join('');
  const bear = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-14" cy="-58" r="9" fill="#b8844a" ${st}/><circle cx="14" cy="-58" r="9" fill="#b8844a" ${st}/><circle cx="0" cy="-44" r="20" fill="#b8844a" ${st}/><ellipse cx="0" cy="-12" rx="22" ry="18" fill="#b8844a" ${st}/><ellipse cx="0" cy="-38" rx="8" ry="6" fill="#e8c890" stroke="${K}" stroke-width="2"/><circle cx="-7" cy="-48" r="2.4" fill="${K}"/><circle cx="7" cy="-48" r="2.4" fill="${K}"/><path d="M-6 -26l6 6l6 -6" fill="#c8323c" stroke="${K}" stroke-width="2"/></g>`;
  const boots = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${[-14, 14].map(dx => `<path d="M${dx - 8} -40h14v30h10q6 0 6 10h-30z" fill="#6a3a1a" ${st}/>`).join('')}</g>`;
  const mule = (x, y, s = 1, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><path d="M-40 -30h60l14 -24l8 -16l6 14l-2 8l6 6l-8 8h-10l-6 12v22" fill="#8a7a6a" ${st}/><path d="M-40 -30v30M-28 -8v8M8 -8v8M20 -8v8M-40 -30q-6 -2 -10 10" fill="none" ${st}/><path d="M34 -70l4 -16l4 16" fill="#8a7a6a" ${st}/><circle cx="40" cy="-52" r="2" fill="${K}"/></g>`;
  const briefcase = (x, y, s = 1, open) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-40" y="-30" width="80" height="30" fill="#5a3a2a" ${st}/>${open ? `<path d="M-40 -30l6 -34h68l6 34" fill="#3a2a1a" ${st}/><g fill="#8ac070" stroke="${K}" stroke-width="1.5">${[-26, -8, 10].map(dx => `<rect x="${dx}" y="-40" width="18" height="12"/>`).join('')}</g>` : `<path d="M-10 -30v-8h20v8" fill="none" ${st}/>`}</g>`;
  const wordOn = (x, y, w, c = '#c8323c', size = 22, rot = 0) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${c}" stroke="${K}" stroke-width="1.2" transform="rotate(${rot} ${x} ${y})">${w}</text>`;
  const cactusCrowd = (S, y = 300) => S.prop('saguaro', 90, y, 0.8) + S.prop('saguaro', 720, y, 0.9) + S.prop('pear', 200, y, 1) + S.prop('pear', 610, y, 1);

  const mounted = (S, key, x, y, s0 = 1, flip, ho = {}) => {
    const s = s0 * 1.2, pc = (SBR.art.P && SBR.art.P[key]) || {};
    const hopt = Object.assign({ rider: { body: pc.outfit || '#6a4a2a', cape: pc.outfit2 || '#3a2a1a', hat: pc.outfit || '#6a4a2a', skin: pc.skin } }, ho);
    return S.horse(x, y, s, hopt, flip) + S.bust(key, x + (flip ? -1 : 1) * 6 * s, y - 86 * s, 0.46 * s, flip);
  };
  const myHorse = () => { const H = (SBR.HORSES && SBR.run && SBR.HORSES[SBR.run.horse]) || {}; return { coat: H.coat, mane: H.mane, wrap: H.wrap }; };
  const meRide = (S, x, y, s = 1, flip) => mounted(S, lead(), x, y, s, flip, myHorse());
  const crowd = (S, keys, x0, x1, y, s = 0.55) => keys.map((k, i) => S.bust(k, x0 + (x1 - x0) * (keys.length > 1 ? i / (keys.length - 1) : 0.5), y, s, i % 2)).join('');
  const ready = fn => { if (SBR.evs) fn(); };
  ready(() => {
    S_bust = () => '';
    /* =========================================================== */
    /* =============== js/sbr.js : Steel Ball Run canon ============= */
    /* =========================================================== */

    const raptor = (x, y, s = 1, flip, c = '#6a8a4a') => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><path d="M-70 -60q30 -6 50 4l30 -2q14 -30 36 -30q16 0 18 10l-4 6l-16 2q-8 8 -18 22l-6 20l8 30h-12l-10 -26l-18 0l-4 26h-12l2 -30q-30 -8 -44 -32z" fill="${c}" ${st}/><circle cx="36" cy="-80" r="3.4" fill="#f2c14e" stroke="${K}" stroke-width="1.6"/><path d="M36 -83v6" stroke="${K}" stroke-width="1.6"/><path d="M44 -70l4 4l4 -4l4 4" fill="none" stroke="#fff" stroke-width="2"/><path d="M-10 -40l-8 -10M0 -42l-6 -12" stroke="${K}" stroke-width="2"/></g>`;
    const shelves = () => `<rect x="40" y="60" width="720" height="150" fill="#7a5230" ${st}/>${[100, 150, 200].map(y => `<path d="M40 ${y}H760" stroke="${K}" stroke-width="5"/>`).join('')}${[...Array(16)].map((_, i) => bottle(70 + i * 44, 98 + (i % 3) * 50, 0.8, ['#4a8a4a', '#c8603a', '#3a6ab8', '#f2c14e'][i % 4])).join('')}`;
    const counter = (x0 = 120, x1 = 520, y = 250) => `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="80" fill="#9a6a3a" ${st}/><path d="M${x0} ${y + 14}H${x1}" stroke="${K}" stroke-width="2.5"/>${[...Array(Math.floor((x1 - x0) / 60))].map((_, i) => `<path d="M${x0 + 30 + i * 60} ${y + 24}v46" stroke="${K}" stroke-width="2" opacity=".5"/>`).join('')}`;
    const saloon = S => S.bg({ inside: true, pal: 'inside', horizon: 290 }) + `<rect x="0" y="0" width="800" height="290" fill="#8a5a34"/>${[...Array(9)].map((_, i) => `<path d="M${i * 100} 0V290" stroke="${K}" stroke-width="2" opacity=".35"/>`).join('')}<rect x="300" y="30" width="200" height="90" fill="#f2e2b0" ${st}/><text x="400" y="88" font-size="34" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="#c8323c">SALOON</text>` + [80, 720].map(x => `<g><path d="M${x - 14} 160h28v-40h-28z" fill="#ffd84a" ${st}/><path d="M${x} 120v-30" ${st}/></g>`).join('');
    const bars = (x0, x1, y0 = 30, y1 = 330) => `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="12" fill="#5a5a6a" ${st}/>` + [...Array(Math.floor((x1 - x0) / 34) + 1)].map((_, i) => `<rect x="${x0 + i * 34 - 5}" y="${y0}" width="10" height="${y1 - y0}" fill="#6a6a7a" ${st}/>`).join('');
    const tomb = (x, y) => `<rect x="${x - 70}" y="${y - 110}" width="140" height="110" fill="#c8c0b0" ${st}/><path d="M${x - 90} ${y - 110}L${x} ${y - 170}L${x + 90} ${y - 110}Z" fill="#3a9a5a" ${st}/><path d="M${x - 26} ${y}v-70q26 -26 52 0v70z" fill="#3a2a2a" ${st}/><path d="M${x} ${y - 170}v-24M${x - 10} ${y - 184}h20" ${st}/>`;
    const watch = (x, y, s = 1, back) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="20" fill="#f2c14e" ${st}/><circle r="14" fill="#fff" stroke="${K}" stroke-width="2"/><path d="M0 0V-10M0 0L-8 4" stroke="${K}" stroke-width="2.4"/>${back ? `<path d="M22 -14a26 26 0 0 0 -30 -12" fill="none" stroke="#c8323c" stroke-width="3"/><path d="M-10 -30l2 6l6 -3" fill="#c8323c"/>` : ''}<path d="M0 -20v-8" ${st}/></g>`;
    const rope = (d, c = '#c8a070') => `<path d="${d}" fill="none" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 3"/>`;
    const knife = (x, y, rot = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0h10v-6h34l12 3l-12 3h-34" fill="#d8d8e0" ${st}/><rect x="-18" y="-6" width="18" height="10" fill="#6a3a1a" ${st}/></g>`;
    const bills = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${[[-14, 0, -12], [0, -6, 4], [14, 2, 16]].map(([dx, dy, r]) => `<rect x="${dx - 18}" y="${dy - 10}" width="36" height="20" fill="#8ac070" stroke="${K}" stroke-width="2" transform="rotate(${r} ${dx} ${dy})"/>`).join('')}</g>`;

    /* =========================== ACT 1 =========================== */
    add('sbr_steel', 1, (S, k) => {
      const s = S.bg({ pal: 1, far: false }) + S.prop('bunting', 0, 0, 1, 0, 800, 40, 22) + tent(70, 290, 1.1) + tent(740, 290, 1, '#f6ecd8') + S.prop('banner', 400, 215, 0.8, 300, 'STEEL BALL RUN');
      const camera = (x, y) => `<path d="M${x - 16} ${y}l16 -70l16 70M${x} ${y - 70}v70" fill="none" ${st}/><rect x="${x - 24}" y="${y - 100}" width="48" height="34" fill="#3a2a2a" ${st}/><circle cx="${x + 24}" cy="${y - 84}" r="10" fill="#8a8aa0" ${st}/>`;
      if (k === 's') return s + crowd(S, ['georgy', 'sloop', 'nellyville', 'dixie', 'urmd'], 120, 680, 300, 0.5) + camera(170, 345) + S.fx('bang', 200, 240, 1.4) + S.person('steven', 360, 348, 1.15, 'arms') + S.person('lucy', 470, 348, 0.85) + me(S, 650, 350, 1.05, 'stand', true) + S.bubble('Fifty million dollars to the winner!', 250, 20, 230, 350, 120) + S.kana('パシャ', 150, 200, 38, -10);
      if (k === 0) return s + camera(220, 345) + S.fx('bang', 250, 240, 2.4) + S.lines(420, 200, K, 30, 0.25) + me(S, 420, 350, 1.2, 'point') + paper(650, 250, 150, 110, 8, 6) + wordOn(650, 222, 'RACE DAILY', K, 20, 8) + S.kana('パシャッ', 260, 110, 50) + S.caption('Front page, three states.');
      if (k === 1) return s + crowd(S, ['georgy', 'sloop', 'nellyville'], 120, 680, 300, 0.45) + S.person('lucy', 330, 348, 1) + me(S, 480, 350, 1.1, 'stand', true) + S.person('steven', 700, 346, 0.8, 'arms') + S.bubble("He isn't a fool. He's brave in a way that looks silly.", 110, 24, 250, 300, 150);
      if (k === 2) return s + crowd(S, ['georgy', 'sloop', 'nellyville', 'dixie'], 120, 680, 300, 0.5) + S.person('steven', 300, 348, 1.05, 'arms') + me(S, 520, 350, 1.05, 'point') + S.fx('coins', 600, 220, 1.6) + `<circle cx="630" cy="190" r="10" fill="#c8323c" stroke="${K}" stroke-width="2.5"/><circle cx="626" cy="186" r="2" fill="${K}"/>` + S.kana('スッ', 600, 140, 50, -12) + S.caption('Wallets, a brooch, a pencil.');
      return s + S.person('deputy', 220, 350, 1.05, 'draw') + me(S, 410, 350, 1.1, 'arms') + S.person('georgy', 600, 348, 0.95, 'point', true) + S.lines(410, 200, K, 36, 0.3) + S.kana('ドドド', 410, 70, 56, -6, '#e8508a') + S.bubble('Thief!', 620, 40, 90, 610, 150);
    }, [0, 1, 2, '2:fail']);

    add('sbr_sandman_pay', 1, (S, k) => {
      const shop = S.bg({ inside: true, pal: 'inside', horizon: 300 }) + shelves() + counter(80, 480, 250);
      if (k === 2 || k === '2:fail') {
        const s = S.bg({ pal: 1 }) + S.prop('saguaro', 90, 300, 0.7) + `<g transform="translate(700 300)"><ellipse cx="0" cy="0" rx="46" ry="12" fill="#6a8ac8" ${st}/><path d="M-40 0v-40h80v40" fill="#a88a6a" ${st}/><path d="M-50 -40h100M-30 -40v-40h60v40M0 -80v-10" fill="none" ${st}/></g>` + `<g stroke="${K}" stroke-width="3" opacity=".5">${[...Array(8)].map((_, i) => `<path d="M${20 + i * 30} ${200 + i * 16}h${100 + i * 10}"/>`).join('')}</g>`;
        if (k === 2) return s + S.person('sandman', 360, 340, 1, 'point') + meRide(S, 520, 345, 1.3) + S.kana('ダダダ', 400, 90, 50) + S.bubble('Then you understand.', 170, 40, 170, 330, 160);
        return s + meRide(S, 300, 345, 1.1) + S.person('sandman', 620, 340, 1.05, 'arms') + S.kana('ビュン', 600, 110, 50, 8) + (has('gyro') ? S.bust('gyro', 150, 250, 0.9) + S.bubble('On FOOT! Nyo-ho-ho!', 40, 30, 180, 150, 160) : S.bubble('Too slow.', 520, 40, 120, 600, 150));
      }
      if (k === 's') return shop + S.bust('trapper', 200, 262, 1.3) + S.person('sandman', 420, 345, 1.1, 'point') + gem(478, 228, 1.4) + glow(478, 228, 40, '#9ff0c0', 0.35) + me(S, 650, 348, 1.05, 'stand', true) + S.bubble('This is money.', 330, 30, 150, 420, 150) + S.kana('キラッ', 520, 190, 36, 10, '#9ff0c0');
      if (k === 0) return shop + S.bust('trapper', 200, 262, 1.3) + S.person('sandman', 400, 345, 1.1, 'stand') + bills(470, 210, 1.2) + me(S, 610, 348, 1.1, 'point', true) + gem(560, 200, 1.6) + glow(560, 200, 50, '#9ff0c0', 0.4) + S.caption('A very large emerald. Yours now.');
      if (k === 1) return shop + S.bust('trapper', 200, 262, 1.3) + gem(250, 180, 1.2) + boots(330, 250, 1) + S.person('sandman', 470, 345, 1.1, 'stand', true) + me(S, 660, 348, 1, 'stand', true) + S.bubble('You think it is worth nothing too.', 360, 26, 220, 460, 150);
    }, [0, 1, 2, '2:fail']);

    add('sbr_avdul', 1, (S, k) => {
      const s = S.bg({ pal: 1 }) + S.prop('rock', 720, 300, 2);
      if (k === 's') return s + S.horse(170, 340, 1.1, { coat: '#b8703a', mane: '#3a1a10' }) + S.prop('saguaro', 330, 340, 1.3) + S.person('urmd', 360, 345, 1.05, 'arms') + S.prop('pear', 290, 345, 1.5) + S.prop('saguaro', 420, 350, 0.9) + me(S, 620, 348, 1.05, 'stand', true) + S.bubble('I foresaw this. I did not foresee it happening to me.', 440, 26, 260, 390, 150) + S.kana('チクチク', 300, 110, 34, -10, '#9ff0a0');
      if (k === 0) return s + S.prop('saguaro', 140, 340, 1.1) + S.person('urmd', 360, 345, 1.05, 'point') + me(S, 520, 348, 1.05, 'point', true) + `<circle cx="450" cy="230" r="30" fill="#f6ecd8" opacity=".6" ${st}/>` + S.bubble('A man who can return six seconds. Do not stand still before him.', 90, 24, 280, 350, 150) + watch(450, 230, 1.2, true);
      if (k === 1) return s + S.prop('saguaro', 200, 340, 1.3) + S.person('urmd', 220, 345, 1, 'arms') + meRide(S, 580, 345, 1.2) + `<g>${[0, 1, 2].map(i => `<ellipse cx="${560 + i * 26}" cy="250" rx="11" ry="15" fill="#6a8ac8" ${st}/>`).join('')}</g>` + S.bubble('This, too, I foresaw.', 60, 30, 190, 200, 150);
    }, [0, 1]);

    add('sbr_roocatugo', 1, (S, k) => {
      const s = S.bg({ pal: 1 }) + S.prop('saguaro', 740, 300, 0.8) + S.prop('skull', 80, 320, 0.8);
      if (k === 's') return s + car(330, 340, 1.4) + S.bust('roocatugo', 330, 260, 0.95) + me(S, 620, 348, 1.05, 'stand', true) + S.bubble('Nothing in the rules against it.', 120, 26, 220, 300, 150) + S.kana('プスン', 460, 170, 40, 8, '#8a8090') + S.fx('smoke', 460, 230, 1);
      if (k === 0) return s + rope('M290 250Q360 270 440 250') + car(180, 340, 1.1) + S.bust('roocatugo', 180, 280, 0.75) + meRide(S, 540, 345, 1.2) + S.fx('coins', 700, 220, 1.4) + `<g transform="translate(700 150)"><circle cx="-14" r="12" fill="#9fc7e8" ${st}/><circle cx="14" r="12" fill="#9fc7e8" ${st}/><path d="M-2 0h4" ${st}/></g>` + S.kana('ズルズル', 400, 110, 40);
      if (k === 1) return s + `<g transform="translate(300 340) scale(1.4)"><path d="M-90 -20v-26h40l14 -26h60l10 26h50v26z" fill="#8a2a2a" ${st}/><path d="M-60 -20v8M60 -20v8" ${st}/></g>` + S.person('roocatugo', 290, 345, 0.9, 'kneel') + S.kana('シクシク', 230, 120, 36, -8, '#9fc7e8') + me(S, 560, 348, 1, 'stand', true) + crate(680, 345, 80, 60, '#c8a060') + `<circle cx="690" cy="270" r="14" fill="#f2c14e" ${st}/>`;
      if (k === 2) return s + car(170, 340, 0.9) + S.horse(420, 340, 1.1, { coat: '#b89a70', mane: '#3a2a1a' }) + S.bust('roocatugo', 420, 250, 0.7) + S.kana('ワーイ', 400, 110, 44, -6, '#f2c14e') + me(S, 640, 348, 1.05, 'point', true) + S.fx('coins', 560, 200, 1.5);
    }, [0, 1, 2]);

    add('sbr_horseshoe', 1, (S, k) => {
      const s = S.bg({ pal: 1 }) + S.prop('saguaro', 740, 300, 0.9) + S.prop('rock', 60, 300, 1.6);
      const prints = (x0, x1, y) => [...Array(6)].map((_, i) => `<path d="M${x0 + (x1 - x0) * i / 5 - 7} ${y + (i % 2) * 14}q0 -12 7 -12t7 12h-4q0 -6 -3 -6t-3 6z" fill="${K}"/>`).join('');
      if (k === 's') return s + S.person('bandit', 230, 330, 1.1, 'down') + bees(230, 300, 10, 50) + prints(360, 720, 320) + S.person('mountaintim', 470, 350, 1.1, 'kneel') + `<circle cx="520" cy="220" r="10" fill="#6a4a2a" ${st}/><circle cx="517" cy="218" r="1.6" fill="#fff"/><circle cx="523" cy="222" r="1.6" fill="#fff"/>` + me(S, 660, 350, 1, 'stand', true) + S.bubble("Somebody's killing racers out here.", 300, 30, 220, 470, 150);
      if (k === 0) return s + prints(60, 460, 330) + S.person('mountaintim', 380, 350, 1.05, 'point') + me(S, 250, 350, 1, 'stand') + `<g transform="translate(640 300)">${fire(0, 0, 0.6).replace('#f2743a', '#8a8090').replace('#ffd84a', '#6a6a70')}</g>` + bees(640, 310, 10, 60).replace(/#f2c14e/g, '#6a6a60') + S.bubble('Now I know how he fights.', 420, 40, 200, 400, 150);
      if (k === '0:fail') return s + S.prop('rock', 300, 330, 3) + S.prop('rock', 500, 340, 2.4) + mounted(S, 'mountaintim', 660, 340, 1, false, { coat: '#6a4a3a', mane: '#2a1a1a' }) + me(S, 180, 350, 1, 'kneel') + S.bubble('Lost it in the rocks.', 60, 40, 170, 180, 160);
      if (k === 1) return s + S.person('bandit', 150, 330, 0.9, 'down') + S.person('mountaintim', 360, 350, 1.1, 'point') + me(S, 500, 350, 1.05, 'point', true) + `<circle cx="432" cy="222" r="10" fill="#6a4a2a" ${st}/>` + S.bubble('Same coat. I owe you one, stranger.', 180, 30, 230, 350, 150);
      if (k === 2) return s + S.person('mountaintim', 250, 350, 1.1, 'stand') + meRide(S, 600, 345, 1.1) + S.bubble('Everything out here is your business, son.', 60, 30, 240, 240, 150);
    }, [0, '0:fail', 1, 2]);

    add('sbr_disguise', 1, (S, k) => {
      const s = S.bg({ pal: 1, horizon: 260 }) + `<path d="M0 180Q120 120 260 170L300 260H0z" fill="#c07a5a" ${st}/>` + S.prop('saguaro', 700, 300, 0.8);
      const ben = (x = 150, y = 170, pose = 'stand', f) => S.person('benjamin', x, y, 0.5, pose, f) + `<g fill="#3a3a4a">${[...Array(8)].map((_, i) => `<circle cx="${x + 18 + i * 3}" cy="${y - 50 + (i % 3) * 3}" r="1.6"/>`).join('')}</g>`;
      if (k === 's') return s + ben() + S.person('deputy', 380, 348, 1.1, 'draw') + me(S, 600, 350, 1.05, 'arms', true) + S.bubble('A blond kid in a star hat shot my partner!', 360, 24, 240, 400, 150) + S.kana('ニヤリ', 150, 90, 30, -8, '#f2c14e');
      if (k === 0) return s + ben(210, 180, 'stand', true) + `<g stroke="${K}" stroke-width="3" opacity=".5"><path d="M240 140h60M240 160h50"/></g>` + S.person('deputy', 400, 348, 1.1, 'stand', true) + me(S, 580, 350, 1.05, 'point', true) + S.bubble("...I'll be damned.", 420, 30, 140, 400, 150) + S.kana('ダッ', 260, 110, 40);
      if (k === '0:fail') return s + S.person('deputy', 300, 348, 1.1, 'draw') + S.person('deputy', 180, 348, 0.95, 'draw') + S.fx('bang', 360, 236, 1.2) + me(S, 580, 350, 1.05, 'draw', true) + S.lines(580, 220, K, 30, 0.3) + S.kana('バン', 400, 120, 50, -8, '#f2c14e');
      if (k === 1) return S.bg({ inside: true, pal: 'inside', horizon: 300 }) + me(S, 300, 348, 1.05, 'kneel') + bars(120, 520) + S.person('deputy', 660, 348, 1, 'stand', true) + S.caption('A day in a cell. A clean record by morning.');
      if (k === 2) return s + ben() + S.person('deputy', 160, 348, 0.9, 'draw') + meRide(S, 480, 345, 1.2) + poster(700, 180, 0.9) + poster(620, 150, 0.7) + S.kana('ダダダ', 430, 90, 44);
    }, [0, '0:fail', 1, 2]);

    add('sbr_tarcoffee', 1, (S, k) => {
      const s = S.bg({ pal: 'dusk', sunY: 215, sunX: 660 }) + fire(400, 330, 1.1) + `<path d="M370 250l30 -24l30 24z" fill="none" ${st}/><path d="M384 238h32v18h-32z" fill="#3a3a4a" ${st}/>`;
      const gyro = has('gyro') ? 'gyro' : lead();
      if (k === 's') return s + S.person(gyro, 240, 348, 1.1, 'point') + `<path d="M296 230q20 20 60 -2" fill="none" stroke="#1a0a00" stroke-width="7"/>` + cup(560, 320, 1.4, '#9a9aa8') + me(S, 640, 350, 1, 'stand', true) + S.kana('♪', 200, 110, 40, 0, '#f2c14e') + S.kana('♪', 260, 80, 30, 10, '#f2c14e') + S.bubble('In Naples we call this breakfast.', 50, 20, 210, 230, 150);
      if (k === 0) return s + S.person(gyro, 220, 348, 1, 'arms') + me(S, 560, 350, 1.2, 'point', true) + cup(488, 238, 1.2) + S.lines(560, 200, K, 36, 0.35) + S.kana('ギンッ', 620, 90, 60, 8, '#ffd84a') + S.caption('It is terrible. You are extremely awake.');
      if (k === 1) return s + S.person(gyro, 260, 348, 1.15, 'arms') + [...Array(7)].map((_, i) => S.kana(i % 2 ? '♪' : '♫', 150 + i * 90, 60 + (i % 3) * 30, 34, i * 7, '#f2c14e')).join('') + me(S, 600, 350, 1, 'kneel', true) + S.bubble('Pizza! Mozzarella! Pizza mozzarella!', 330, 90, 220, 320, 170);
    }, [0, 1]);

    add('sbr_photo', 1, (S, k) => {
      const s = S.bg({ pal: 1, horizon: 240, far: false }) + [[160, 150, 130], [360, 220, 170], [600, 180, 140]].map(([x, w, h]) => `<g transform="translate(${x} 240)">${S.P().peak(w, h, '#c07a5a', '#8a4a3a', false)}</g>`).join('');
      if (k === 's') return s + `<g transform="rotate(-5 470 170)"><rect x="330" y="70" width="280" height="190" fill="#f6ecd8" ${st}/><rect x="345" y="85" width="250" height="150" fill="#d8c8a8" stroke="${K}" stroke-width="2"/><path d="M345 235l60 -80l40 50l60 -110l40 70l50 -30v100z" fill="#8a7a6a" stroke="${K}" stroke-width="2"/></g>` + `<path d="M470 60v-40" stroke="#c8323c" stroke-width="3" stroke-dasharray="6 4"/>` + me(S, 140, 350, 1.2, 'point') + S.kana('ピタッ', 690, 110, 44, 8) + S.caption('Hold it at arm\'s length: the peaks line up.');
      if (k === 0) return s + `<path d="M0 340Q400 250 800 290" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="14 10"/>` + meRide(S, 460, 340, 1.3) + `<g opacity=".7">${[0, 1, 2].map(i => mounted(S, ['sloop', 'georgy', 'nellyville'][i], 90 + i * 70, 290, 0.45)).join('')}</g>` + S.kana('ドギャーン', 520, 90, 50, -6, '#f2c14e') + S.lines(460, 250, K, 30, 0.25);
      if (k === '0:fail') return s + `<rect x="0" y="270" width="800" height="90" fill="#dce8e8" stroke="${K}" stroke-width="3"/>` + meRide(S, 400, 370, 1.3) + S.fx('splash', 400, 330, 2) + S.kana('ズボッ', 560, 120, 50, 8, '#9fc7e8') + S.caption('Salt marsh. The horses hate you.');
      if (k === 1) return s + S.person('sloop', 300, 350, 1.1, 'point') + me(S, 520, 350, 1.05, 'stand', true) + bills(410, 220, 1.2) + `<rect x="540" y="200" width="60" height="44" fill="#f6ecd8" stroke="${K}" stroke-width="2.5" transform="rotate(10 570 222)"/>` + S.bubble("I'll return the favour!", 120, 30, 180, 290, 150);
    }, [0, '0:fail', 1]);

    /* =========================== ACT 2 =========================== */
    add('sbr_arimathea', 2, (S, k) => {
      const office = S.bg({ inside: true, pal: 'inside', horizon: 290 }) + `<rect x="560" y="50" width="160" height="120" fill="#9fc7e8" ${st}/><path d="M640 50v120M560 110h160" ${st}/>` + table(330, 240, 300) + paper(260, 234, 140, 18, 0, 0, '#c8a870') + paper(410, 234, 120, 16, 0, 0, '#f6ecd8');
      const map = (x, y, s = 1, rot = -6, c = '#c8a870') => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><rect x="-60" y="-40" width="120" height="80" fill="${c}" ${st}/><path d="M-48 20q20 -30 40 -10t30 -30t30 10" fill="none" stroke="#c8323c" stroke-width="3" stroke-dasharray="6 4"/>${[-30, 6, 36].map((dx, i) => `<path d="M${dx - 5} ${-12 + i * 6}l10 10M${dx + 5} ${-12 + i * 6}l-10 10" stroke="${K}" stroke-width="2.4"/>`).join('')}</g>`;
      if (k === 's') return office + map(260, 190, 1, -6) + glow(260, 190, 60, '#fff3c0', 0.25) + map(430, 196, 0.9, 4, '#f6ecd8') + S.person('agent', 520, 350, 1.1, 'stand', true) + me(S, 120, 350, 1.05) + S.bubble('The President will want this.', 470, 190, 180) + S.kana('!?', 560, 90, 50, 10, '#ffd84a');
      if (k === 0) return office + S.person('agent', 520, 350, 1.05, 'arms', true) + meRide(S, 180, 345, 1.1, true).replace(/^/, '') + map(80, 170, 0.7, -20, '#f6ecd8') + S.kana('サッ', 200, 90, 44);
      if (k === '0:fail') return office + S.person('agent', 520, 350, 1.05, 'point', true) + S.person('soldier', 680, 350, 1, 'draw', true) + S.person('soldier', 760, 350, 0.9, 'draw', true) + me(S, 150, 350, 1.05, 'draw') + S.bubble('Guards! GUARDS!', 380, 30, 150, 500, 150);
      if (k === 1) return office + fire(330, 236, 1.1) + S.fx('smoke', 330, 120, 1.4) + S.person('agent', 560, 350, 1, 'stand', true) + me(S, 120, 350, 1.05) + S.bubble('...Thank God.', 560, 60, 120, 580, 160);
      if (k === 2) { const c = S.bg({ pal: 2 }) + [220, 380, 540].map(x => tent(x, 290, 0.8, '#8a8a6a')).join('') + S.prop('flag', 680, 290, 1, '#3a4a8a'); return c + [180, 320, 470, 600].map((x, i) => S.person('soldier', x, 300, 0.6, i % 2 ? 'draw' : 'stand')).join('') + S.prop('rock', 110, 360, 3) + me(S, 110, 360, 1.05, 'kneel') + S.bubble('Forty rifles. Maybe more.', 20, 20, 180, 110, 180); }
    }, [0, '0:fail', 1, 2]);

    add('sbr_dinovillage', 2, (S, k) => {
      const s = S.bg({ pal: 2, horizon: 260 }) + building(140, 280, 150, 130, '#a8784a', 2, 2) + building(640, 280, 170, 150, '#8a6a4a', 3, 2);
      const villager = (x, y, s2, f) => S.person('miner', x, y, s2, 'stand', f) + `<path d="M${x - 10} ${y}q-30 10 -50 -4" fill="none" stroke="${K}" stroke-width="7"/><path d="M${x - 10} ${y}q-30 10 -50 -4" fill="none" stroke="#6a8a4a" stroke-width="4"/>`;
      if (k === 's') return s + villager(150, 330, 0.8) + villager(640, 330, 0.8, true) + villager(250, 300, 0.55, true) + S.person('hamonkid', 380, 345, 0.85) + me(S, 530, 350, 1.05, 'stand', true) + paper(460, 150, 190, 90, -4, 0) + `<text x="460" y="138" font-size="14" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${K}" transform="rotate(-4 460 150)"><tspan x="460">HE IS UP THE CANYON.</tspan><tspan x="460" dy="18">THE BITE SPREADS.</tspan><tspan x="460" dy="18" fill="#c8323c">SALT WATER SLOWS IT.</tspan></text>` + S.kana('ジロッ', 150, 120, 34, -8, '#f2c14e');
      if (k === 0) return s + villager(150, 330, 0.8) + meRide(S, 440, 345, 1.2) + [0, 1, 2].map(i => `<path d="M${380 + i * 40} 240q20 -30 40 0v30h-40z" fill="#f6ecd8" ${st}/><text x="${400 + i * 40}" y="262" font-size="11" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${K}">SALT</text>`).join('') + S.caption('Salt in every saddlebag.');
      if (k === 1) return s + villager(120, 330, 0.8, false) + villager(260, 330, 0.75) + meRide(S, 520, 345, 1.2) + S.bust('hamonkid', 575, 232, 0.5) + S.kana('ダダッ', 600, 100, 44) + S.lines(520, 230, K, 30, 0.2);
      if (k === '1:fail') return s + raptor(170, 340, 1.1) + raptor(640, 340, 1, true) + raptor(360, 290, 0.6) + me(S, 420, 350, 1.05, 'draw') + S.person('hamonkid', 500, 345, 0.7, 'arms') + S.kana('ガアッ', 200, 110, 50, -8, '#9ff0a0') + S.lines(420, 220, K, 36, 0.3);
    }, [0, 1, '1:fail']);

    add('sbr_mackdixie', 2, (S, k) => {
      const s = S.bg({ pal: 2, horizon: 290, far: false }) + `<path d="M0 0H240L200 290H0zM800 0H560L600 290H800z" fill="#8a6a5a" ${st}/>` + S.tone('M0 0H240L200 290H0z', 0.25) + S.tone('M800 0H560L600 290H800z', 0.25);
      if (k === 's') return s + S.person('mackknife', 330, 340, 1.05, 'point') + knife(390, 226, -20, 1.1) + S.person('dixie', 470, 340, 1, 'stand', true) + me(S, 680, 350, 1.05, 'stand', true) + S.bubble("Toll's your horse, or your ribs.", 240, 30, 210, 330, 150) + S.kana('クルクル', 430, 170, 30, 10);
      if (k === 0) return s + S.fx('boom', 420, 190, 1.2) + S.person('mackknife', 280, 340, 1.05, 'draw') + knife(360, 180, 30) + knife(470, 150, -40) + me(S, 560, 350, 1.1, 'draw', true) + S.person('dixie', 180, 340, 0.9, 'point') + S.kana('ギャン', 420, 90, 56, -6, '#e8508a');
      if (k === 1) return s + S.person('dixie', 360, 340, 1.1, 'point') + bills(420, 216, 1.1) + S.person('mackknife', 240, 340, 0.95) + me(S, 580, 350, 1.05, 'stand', true) + S.bubble('Pleasure doing business.', 250, 30, 190, 360, 150) + S.kana('パチッ', 350, 130, 30, 0, '#e8508a');
      if (k === 2) return s + mounted(S, 'mackknife', 250, 330, 0.8, true) + mounted(S, 'dixie', 390, 330, 0.8, true) + S.bubble('You said it was safe!', 60, 30, 170, 230, 170) + S.bubble('YOU said!', 330, 60, 110, 390, 190) + me(S, 640, 350, 1.05, 'stand', true);
      if (k === '2:fail') return s + S.person('mackknife', 330, 340, 1.05, 'point') + S.person('dixie', 470, 340, 1, 'stand', true) + me(S, 680, 350, 1.05, 'arms', true) + S.bubble('Nice try.', 280, 30, 120, 330, 150) + knife(420, 200, 10);
    }, [0, 1, 2, '2:fail']);

    /* =========================== ACT 3 =========================== */
    add('sbr_gaucho', 3, (S, k) => {
      const s = S.bg({ pal: 3, horizon: 270 }) + S.prop('pine', 60, 290, 1, 200) + S.prop('pine', 760, 290, 1, 220) + S.prop('pine', 150, 270, 0.7, 170) + S.prop('cabin', 520, 280, 1.1) + S.fx('smoke', 560, 110, 0.7) + watch(470, 250, 0.8, true);
      if (k === 's') return s + mounted(S, 'gaucho', 240, 345, 1.15, false, { coat: '#6a4a3a', mane: '#1a1020' }) + me(S, 720, 350, 0.95, 'stand', true) + S.bubble('Stew! A fire! Come?', 60, 30, 170, 220, 170) + S.kana('チクタク', 470, 190, 28, 0, '#c8323c');
      if (k === 0) return s + mounted(S, 'gaucho', 250, 345, 1.1, true, { coat: '#6a4a3a', mane: '#1a1020' }) + me(S, 390, 350, 1.05, 'point', true) + S.bubble('If you are wrong, you owe me a stew.', 40, 30, 220, 200, 160);
      if (k === '0:fail' || k === 2) return s + S.horse(200, 345, 1, { coat: '#6a4a3a', mane: '#1a1020' }) + S.kana(k === 2 ? '…' : 'バン', 540, 130, 56, -8, '#f2c14e') + (k === '0:fail' ? S.kana('……バン', 660, 200, 40, 6, '#f2c14e') : '') + me(S, 110, 350, 0.95, 'stand') + S.caption(k === 2 ? 'He went in. He did not come out.' : 'One shot. Silence. One shot again.');
      if (k === 1) return S.bg({ inside: true, pal: 'inside', horizon: 290 }) + table(420, 250, 260) + `<ellipse cx="420" cy="246" rx="40" ry="10" fill="#8a5a30" ${st}/>` + S.person('ringo', 560, 345, 1.1, 'point', true) + S.person('gaucho', 280, 330, 0.95, 'down') + me(S, 150, 350, 1.05, 'draw') + watch(360, 110, 1.2, true) + S.bubble('You are on the path of the inferior.', 480, 20, 220, 560, 150) + S.kana('ドドド', 200, 90, 40, -6, '#e8508a');
    }, [0, '0:fail', 1, 2]);

    add('sbr_greentomb', 3, (S, k) => {
      const s = S.bg({ pal: 3 }) + tomb(560, 300) + headstone(140, 310, 1.1) + headstone(280, 305, 0.9) + headstone(720, 310, 1);
      if (k === 's') return s + pigeon(420, 70, 1.3) + `<path d="M330 60a90 30 0 1 0 180 0" fill="none" stroke="${K}" stroke-width="2" stroke-dasharray="6 6"/>` + S.person('lucy', 250, 345, 0.95, 'kneel') + headstone(250, 345, 1.2) + me(S, 400, 350, 1, 'kneel') + S.bubble('The message for the President lands here.', 40, 30, 230, 240, 190) + S.kana('バサッ', 420, 30, 30, 0);
      if (k === 0) return s + me(S, 330, 350, 1.05, 'arms') + pigeon(330, 170, 1.4) + S.person('lucy', 480, 345, 0.95, 'stand', true) + paper(420, 220, 70, 46, -8, 3) + S.kana('ガシッ', 240, 110, 44);
      if (k === '0:fail') return s + pigeon(640, 60, 1.2) + `<g fill="#b8b8c8" ${st}><path d="M340 190l8 -14l6 14z"/><path d="M380 210l8 -14l6 14z"/></g>` + me(S, 350, 350, 1.05, 'arms') + S.person('agent', 700, 350, 0.9, 'point', true) + S.bubble('Feathers on your coat...', 520, 40, 180, 690, 160);
      if (k === 1) return s + me(S, 180, 350, 1.05, 'draw') + S.person('lucy', 420, 345, 0.95, 'kneel') + pigeon(460, 250, 0.9) + paper(360, 250, 60, 40, 6, 3) + S.caption('She is braver than she looks.', 500, 20, 260);
      if (k === 2) return s + S.person('lucy', 520, 345, 0.85, 'stand') + pigeon(560, 90, 1.1) + me(S, 150, 350, 1.05, 'stand') + S.bubble('I know.', 440, 60, 90, 520, 160);
    }, [0, '0:fail', 1, 2]);

    add('sbr_norisuke', 3, (S, k) => {
      const s = saloon(S) + table(400, 270, 340) + bottle(300, 270) + bottle(500, 270, 1, '#c8603a');
      if (k === 's') return s + crowd(S, ['sloop', 'georgy', 'dixie'], 120, 680, 250, 0.55) + S.person('norisuke', 330, 345, 1.1, 'arms') + me(S, 560, 350, 1.05, 'stand', true) + S.bubble('I trade in fruit. Also advice. Advice is cheaper.', 60, 150, 240) + S.kana('カンパーイ', 400, 50, 34, -4, '#f2c14e');
      if (k === 0) return s + S.person('norisuke', 330, 345, 1.1, 'point') + me(S, 560, 350, 1.05, 'stand', true) + S.bubble('Sprint on the downhill. Rest on the uphill. Horses remember.', 180, 140, 280, 330, 230);
      if (k === 1) return s + S.person('norisuke', 360, 345, 1.1, 'point') + me(S, 470, 350, 1.05, 'point', true) + S.kana('ガシッ', 415, 150, 44) + S.bubble('Look for the Higashikata family. We remember friends.', 60, 140, 240);
      if (k === 2 || k === '2:fail') {
        const row = [...Array(10)].map((_, i) => `<g transform="translate(${260 + i * 28} 270)"><path d="M-8 0v-22h16v22z" fill="#f2c14e" opacity=".85" ${st}/></g>`).join('');
        if (k === 2) return s + row + S.person('norisuke', 250, 330, 1, 'down') + me(S, 560, 350, 1.1, 'arms') + `<g transform="translate(580 150)"><path d="M-8 0l4 14h8l4 -14z" fill="#f2c14e" ${st}/></g>` + S.kana('勝', 620, 100, 60, 0, '#f2c14e');
        return s + row + S.person('norisuke', 250, 345, 1.05, 'arms') + me(S, 590, 262, 0.9, 'down') + S.kana('グルグル', 580, 120, 40, 8, '#9fc7e8');
      }
    }, [0, 1, 2, '2:fail']);

    add('sbr_dothan', 3, (S, k) => {
      const s = S.bg({ pal: 3 }) + S.prop('wheat', 150, 330, 1.4) + S.prop('wheat', 620, 330, 1.2) + S.person('sandman', 720, 250, 0.4, 'stand', true);
      const back = (x) => `<g transform="translate(${x} 250) rotate(-4)"><rect x="-30" y="-14" width="60" height="28" fill="#f6ecd8" stroke="${K}" stroke-width="2"/>${wordOn(0, 8, 'DOGOOON', '#c8323c', 16)}</g>`;
      if (k === 's') return s + S.person('dothan', 360, 345, 1.15, 'arms') + back(360) + S.kana('ドゴォォン', 400, 100, 52, -8, '#e8508a') + S.lines(360, 200, K, 30, 0.3) + me(S, 600, 350, 1, 'stand', true) + S.bubble('Aaaagh!', 170, 40, 100, 330, 150);
      if (k === 0) return s + S.person('dothan', 300, 335, 1.05, 'down') + me(S, 460, 350, 1.05, 'point') + back(520).replace('rotate(-4)', 'rotate(24)') + ball(470, 150, 14) + whirl(470, 150, 26) + S.bubble('I know where Diego sleeps.', 100, 30, 200, 230, 280);
      if (k === '0:fail') return s + S.fx('boom', 400, 200, 1.8) + S.kana('ドゴォォン', 400, 210, 70, -8, '#e8508a') + S.person('dothan', 220, 345, 0.9, 'arms') + me(S, 580, 350, 1, 'arms', true);
      if (k === 1) return S.bg({ pal: 3 }) + S.prop('wheat', 150, 330, 1.2) + S.person('sandman', 560, 345, 1.1, 'point', true) + me(S, 260, 350, 1.05, 'arms') + wordOn(400, 180, 'SHHHHH', '#e8508a', 40, -10) + S.lines(260, 220, K, 30, 0.3) + S.fx('dust', 560, 330, 1.5);
      if (k === 2) return s + S.person('dothan', 200, 300, 0.6, 'arms') + meRide(S, 520, 345, 1.2) + S.kana('ドゴォン', 190, 150, 30, -8, '#e8508a') + S.kana('ドゴ…', 330, 120, 22, -8, '#e8508a');
    }, [0, '0:fail', 1, 2]);

    add('sbr_storm', 3, (S, k) => {
      const s = S.bg({ pal: 'night', sun: false }) + `<path d="M470 0l-40 90h30l-50 110" fill="none" stroke="#fff3c0" stroke-width="8"/><path d="M470 0l-40 90h30l-50 110" fill="none" stroke="${K}" stroke-width="2"/>` + rain(0.7);
      const silver = { coat: '#c8c8d0', mane: '#f6ecd8', wrap: '#3a8c4a' };
      if (k === 's') return s + S.horse(620, 330, 1.1, silver, true) + S.person('diego', 330, 340, 1.1, 'down') + hat(160, 330, 1, '#3a8c4a', -20) + me(S, 100, 350, 0.9) + S.kana('ゴロゴロ', 560, 70, 44, 6, '#fff3c0');
      if (k === 0) return s + S.horse(660, 330, 1, silver, true) + S.person('diego', 380, 345, 1.1, 'stand') + me(S, 230, 350, 1.05, 'point') + S.bubble("Don't think this makes us anything.", 420, 30, 230, 400, 150);
      if (k === 1) return s + S.person('diego', 300, 340, 1.1, 'down') + me(S, 560, 350, 1.1, 'arms', true) + `<circle cx="590" cy="130" r="1" fill="none"/>` + hat(530, 172, 1, '#3a8c4a') + S.kana('ギロッ', 250, 180, 44, -8, '#e8508a') + `<g transform="translate(252 300)"><ellipse rx="7" ry="3" fill="#f2c14e" stroke="${K}" stroke-width="2"/><path d="M0 -3v6" stroke="${K}" stroke-width="2.5"/></g>`;
      if (k === 2) return s + S.person('diego', 200, 330, 0.8, 'down') + meRide(S, 540, 345, 1.3) + S.lines(540, 250, '#fff', 30, 0.25) + S.kana('ダダダッ', 560, 90, 50);
    }, [0, 1, 2]);

    /* =========================== ACT 4 =========================== */
    add('sbr_milwaukee', 4, (S, k) => {
      const s = S.bg({ inside: true, pal: 'inside', horizon: 300 }) + `<rect x="0" y="0" width="800" height="300" fill="#5a2a3a"/>` + [120, 400, 680].map(x => `<path d="M${x - 30} 0v40l30 20l30 -20v-40" fill="#f2c14e" ${st}/><circle cx="${x}" cy="66" r="10" fill="#fff3c0" ${st}/>`).join('') + `<ellipse cx="400" cy="290" rx="260" ry="36" fill="#2a7a4a" ${st}/>`;
      const eleven = (y = 255, s2 = 0.55, n = 11, x0 = 60, x1 = 740) => [...Array(n)].map((_, i) => S.bust('tattoo', x0 + (x1 - x0) * i / (n - 1), y, s2)).join('');
      if (k === 's') return s + eleven() + S.person('cardsharp', 400, 345, 1, 'point') + me(S, 620, 350, 1.05, 'stand', true) + S.kana('ジッ', 200, 130, 40, -6, '#e8508a') + S.caption('Eleven men. They all look up at once.');
      if (k === 0) return s + eleven(220, 0.36) + me(S, 400, 350, 1.15, 'arms') + S.fx('coins', 320, 250, 2) + S.fx('coins', 490, 240, 1.6) + `<g transform="translate(560 170) rotate(12)"><rect x="-44" y="-20" width="88" height="40" fill="#f6ecd8" ${st}/><text x="0" y="6" font-size="14" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="#c8323c">STEAMBOAT</text></g>` + S.kana('ジャラジャラ', 400, 90, 46, -4, '#f2c14e');
      if (k === 1) return s + S.person('cardsharp', 250, 345, 1, 'arms') + me(S, 520, 350, 1.1, 'point') + `<g>${[0, 1, 2, 3, 4].map(i => `<rect x="${430 + i * 22}" y="200" width="30" height="44" rx="4" fill="#fff" ${st} transform="rotate(${-20 + i * 10} ${445 + i * 22} 244)"/>`).join('')}</g>` + S.fx('coins', 620, 270, 1.8) + S.kana('ロイヤル', 520, 110, 40, -6, '#f2c14e');
      if (k === '1:fail') return s + eleven(250, 0.46, 5, 80, 300) + eleven(250, 0.46, 6, 480, 740) + me(S, 400, 350, 1.1, 'arms') + S.lines(400, 200, K, 40, 0.35) + S.kana('ゾクッ', 400, 80, 50, 0, '#9fc7e8');
      if (k === 2) return s + eleven(260, 0.5, 11, 60, 740).replace(/<svg/g, '<svg') + me(S, 400, 350, 1.1, 'stand') + [...Array(11)].map((_, i) => `<path d="M${60 + i * 68 - 10} 150q10 -12 20 0" fill="none" stroke="#fff" stroke-width="3"/>`).join('') + S.caption('They breathe together. They blink together.');
    }, [0, 1, '1:fail', 2]);

    add('sbr_logroute', 4, (S, k) => {
      const s = S.bg({ pal: 4, horizon: 230 }) + S.prop('pine', 80, 240, 0.8, 150, undefined, true) + S.prop('pine', 720, 240, 0.9, 160, undefined, true) + snow(0.6);
      const under = `<rect x="0" y="230" width="800" height="30" fill="#e8f4fa" stroke="${K}" stroke-width="3"/><rect x="0" y="260" width="800" height="100" fill="#3a5a7a"/>` + logs(300);
      if (k === 's') return s + ice(230) + `<rect x="200" y="240" width="220" height="60" fill="#3a5a7a" ${st}/>` + logs(270).split('</rect>').slice(2, 4).join('</rect>') + '</rect>' + S.person('whisperer', 320, 330, 1.05, 'point') + me(S, 560, 340, 1.05, 'stand', true) + S.bubble('My grandfather built it for running from soldiers.', 60, 30, 250, 300, 150);
      if (k === 0 || k === 1) return s + under + mounted(S, 'whisperer', 560, 305, 0.8, false, { coat: '#8a6a4a', mane: '#1a1020' }) + meRide(S, 300, 305, 0.8) + `<g stroke="#fff" stroke-width="3" opacity=".6">${[0, 1, 2, 3].map(i => `<path d="M${40 + i * 20} ${250 + i * 12}h80"/>`).join('')}</g>` + S.kana('ドドド', 430, 200, 40, -4) + S.caption(k === 0 ? 'Under the ice, ahead of half the race.' : "With Sandman's people's blessing.");
      if (k === '1:fail') return s + ice(230) + S.person('whisperer', 600, 330, 1, 'stand', true) + me(S, 300, 340, 1.05, 'arms') + S.caption('He shakes his head and walks away.');
      if (k === 2) return s + ice(230) + [...Array(5)].map((_, i) => `<path d="M${120 + i * 70} ${300 + (i % 2) * 10}q0 -10 8 -10t8 10z" fill="${K}"/>`).join('') + S.person('whisperer', 650, 330, 1.05, 'point', true) + me(S, 200, 340, 1, 'kneel') + S.bubble('Never again.', 560, 40, 120, 640, 150);
    }, [0, 1, '1:fail', 2]);

    add('sbr_wolf', 4, (S, k) => {
      const s = S.bg({ pal: 4 }) + S.prop('pine', 700, 290, 1, 200, undefined, true) + S.prop('pine', 760, 290, 0.8, 170, undefined, true) + snow(0.7);
      const wolfLegs = (x, y, s2 = 2.4, f) => S.T(x, y, s2, S.P().wolf(), f) + corpse(x + (f ? -30 : 30) * s2, y - 24 * s2, 0.5 * s2, 'legs');
      const riders = (x0) => [0, 1, 2].map(i => mounted(S, 'agent', x0 + i * 110, 330 - i * 10, 0.8, false, { coat: '#3a3a42', mane: '#1a1020', wrap: '#3a4a8a' })).join('');
      if (k === 's') return s + riders(40) + wolfLegs(560, 330) + glow(610, 280, 60, '#fff3c0', 0.35) + S.kana('ザッザッ', 560, 170, 36) + S.caption('The Corpse\'s legs, in a wolf\'s jaws.');
      if (k === 0) return s + S.horse(130, 340, 1, { coat: '#3a3a42', mane: '#1a1020' }, true) + S.person('agent', 230, 340, 0.9, 'down') + mounted(S, 'agent', 340, 320, 0.7, true, { coat: '#3a3a42' }) + S.fx('bang', 560, 190, 1.4) + me(S, 620, 348, 1.05, 'draw', true) + S.kana('ズキューン', 420, 100, 46, -6, '#f2c14e') + wolfLegs(760, 250, 0.7);
      if (k === '0:fail') return s + riders(160) + S.fx('bang', 250, 230, 1) + S.fx('bang', 360, 220, 1) + me(S, 650, 348, 1.05, 'arms', true) + S.lines(650, 220, K, 30, 0.3) + S.kana('バババ', 470, 110, 44, 0, '#f2c14e');
      if (k === 1) return s + S.T(250, 330, 2.6, S.P().wolf()) + me(S, 520, 348, 1.05, 'kneel', true) + `<g transform="translate(400 330)"><rect x="-24" y="-10" width="48" height="14" rx="6" fill="#e8d8b0" ${st}/></g>` + glow(400, 325, 34, '#fff3c0', 0.4) + S.caption('It is not afraid. It drops one bone and runs.');
    }, [0, '0:fail', 1]);

    add('sbr_gettysburg', 4, (S, k) => {
      const s = S.bg({ pal: 4, sun: false }) + snow(0.8) + S.prop('pine', 90, 290, 0.9, 190, undefined, true) + S.prop('pine', 720, 290, 1, 200, undefined, true);
      const j = has('johnny') ? 'johnny' : lead();
      const ghostKid = (x, op = 0.35) => `<g opacity="${op}">${S.person('nicholas', x, 330, 0.8)}</g>`;
      if (k === 's') return s + bear(320, 330, 1.3) + boots(430, 330, 1.3) + ghostKid(600) + S.person(j, 200, 345, 1.05, 'stand') + S.kana('ブルブル', 200, 110, 36, -8, '#9fc7e8') + S.caption('Nicholas\'s boots. They cannot be here.', 460, 20, 300);
      if (k === 0) return s + bear(560, 330, 1.2) + S.person(j, 360, 345, 1.1, 'arms') + boots(360, 175, 1) + ghostKid(520, 0.25) + S.lines(360, 200, '#fff3c0', 34, 0.4) + S.bubble('Nicholas...', 160, 40, 110, 320, 150);
      if (k === '0:fail') return s + bear(320, 330, 1.3) + boots(430, 330, 1.3) + ghostKid(600, 0.5) + meRide(S, 180, 345, 1) + S.kana('ガタガタ', 200, 110, 40, -8, '#9fc7e8');
      if (k === 1) return S.bg({ pal: 4 }) + building(560, 290, 160, 180, '#c8c0b0', 2, 2) + `<path d="M480 110l80 -60l80 60z" fill="#8a5a4a" ${st}/>` + S.person('hamonkid', 380, 345, 0.8, 'arms') + bear(430, 250, 0.8) + me(S, 220, 348, 1.05, 'stand') + S.bubble('Kuma-chan!', 300, 40, 120, 380, 150);
      if (k === 2) return s + fire(360, 330, 1.4) + bear(360, 300, 0.7).replace(/#b8844a/g, '#6a5a4a') + S.fx('smoke', 360, 150, 1.6) + me(S, 580, 348, 1.05, 'stand', true) + `<g opacity=".4">${[0, 1, 2, 3].map(i => `<circle cx="${60 + i * 50}" cy="${200 + (i % 2) * 20}" r="6" fill="#c8323c"/>`).join('')}</g>` + S.kana('ザワ…', 120, 150, 40, 0, '#c8323c');
    }, [0, '0:fail', 1, 2]);

    add('sbr_scarlet', 4, (S, k) => {
      const s = S.bg({ inside: true, pal: 'inside', horizon: 300 }) + `<rect x="0" y="0" width="800" height="300" fill="#7a3a4a"/>` + [100, 300, 500, 700].map(x => `<rect x="${x - 10}" y="0" width="20" height="300" fill="#c8a060" ${st}/>`).join('') + `<path d="M0 300h800" ${st}/><rect x="560" y="80" width="120" height="220" fill="#5a2a2a" ${st}/><circle cx="660" cy="200" r="6" fill="#f2c14e" ${st}/>`;
      if (k === 's') return s + S.person('lucy', 360, 345, 1, 'stand') + bottle(420, 250, 0.8, '#8a5ad0') + me(S, 200, 348, 1.05) + S.bust('scarlet', 620, 60, 0.6).replace('', '') + S.bubble("If I don't get in, she'll find out who I am.", 300, 20, 250, 360, 150) + S.kana('ゴクリ', 470, 120, 34, 8);
      if (k === 0) return s + fire(220, 330, 1.2) + S.fx('smoke', 220, 190, 1.4) + S.person('soldier', 120, 345, 0.9, 'arms') + S.person('lucy', 620, 345, 0.95, 'stand', true) + letter(600, 200, 1, 10, '#3a4a8a') + S.kana('ワーッ', 250, 90, 44, -6, '#f2743a');
      if (k === '0:fail') return s + S.person('soldier', 420, 345, 1, 'draw', true) + S.person('soldier', 540, 345, 1, 'draw', true) + S.person('lucy', 250, 345, 0.95, 'arms') + me(S, 120, 348, 1, 'arms') + S.bubble('Nobody goes up.', 450, 40, 150, 480, 150);
      if (k === 1) { const b = S.bg({ pal: 'night' }) + building(400, 360, 420, 360, '#8a4a3a', 4, 4) + `<path d="M190 150h420M190 240h420" stroke="${K}" stroke-width="8"/>`; return b + S.T(0, 0, 1, me(S, 470, 240, 0.8, 'arms')) + S.fx('blood', 500, 150, 1) + letter(520, 110, 0.8, 10, '#3a4a8a') + S.kana('ガリッ', 620, 110, 40, 8); }
      if (k === 2) return s + S.person('lucy', 400, 345, 1.05, 'stand', true) + me(S, 220, 348, 1.05, 'point') + S.bubble("She doesn't. She never does.", 460, 50, 180) ;
    }, [0, '0:fail', 1, 2]);

    /* =========================== ACT 5 =========================== */
    add('sbr_delaware', 5, (S, k) => {
      const s = S.bg({ pal: 5, horizon: 220, sunX: 470, sunY: 60 }) + `<rect x="0" y="220" width="800" height="140" fill="#4a6a8a"/>` + [...Array(12)].map((_, i) => `<path d="M${i * 70} ${250 + (i % 3) * 30}q16 -8 32 0t32 0" fill="none" stroke="#e8f6ff" stroke-width="2.5"/>`).join('') + `<path d="M0 220h800" ${st}/><path d="M560 360V200h260v160" fill="#7a5a3a" ${st}/>` + [600, 660, 720, 780].map(x => `<rect x="${x - 8}" y="200" width="16" height="160" fill="#6a4a2a" ${st}/>`).join('');
      const post = `<rect x="352" y="140" width="22" height="220" fill="#6a4a2a" ${st}/>`;
      const mag = (y = 290) => post + S.bust('magent', 363, y, 0.95) + `<path d="M300 ${y - 10}q60 -16 130 0" fill="#4a6a8a" ${st}/>` + rope(`M335 ${y - 40}h60`);
      if (k === 's') return s + mag() + me(S, 640, 205, 0.95, 'stand', true) + S.person('wekapipo', 760, 205, 0.7, 'stand', true) + S.bubble("Get me out and I'll tell you what the President guards.", 40, 30, 260, 330, 190) + S.kana('ガチガチ', 230, 230, 34, -8, '#9fc7e8');
      if (k === 0) return s + post + S.person('magent', 200, 330, 1, 'point') + me(S, 640, 205, 0.95, 'point', true) + S.bubble('The guards, the train, the positions—', 40, 40, 220, 200, 150) + `<path d="M80 300h60" stroke="#fff" stroke-width="3"/>` + S.kana('ダッ', 110, 250, 40);
      if (k === 1) return s + post + `<rect x="0" y="260" width="800" height="100" fill="#4a6a8a" opacity=".8"/>` + S.bust('magent', 363, 252, 0.6) + `<path d="M310 250q60 -16 110 0" fill="#4a6a8a" ${st}/>` + S.person(lead(), 660, 205, 0.95, 'stand') + S.bubble("You'll regret—", 220, 60, 140, 350, 190) + S.kana('ゴボゴボ', 400, 320, 36, 0, '#e8f6ff');
      if (k === 2) return s + mag(300) + me(S, 610, 205, 0.95, 'stand') + S.person('wekapipo', 740, 205, 0.8, 'point', true) + S.bubble('Wait! I told you everything!', 60, 40, 200, 340, 200);
      if (k === '2:fail') return s + mag() + me(S, 640, 205, 0.95, 'arms', true) + S.kana('ケケケ', 230, 150, 46, -8, '#e8508a');
    }, [0, 1, 2, '2:fail']);

    add('sbr_independence', 5, (S, k) => {
      const s = S.bg({ pal: 5 }) + S.prop('indHall', 400, 270, 1.2);
      if (k === 's') return s + S.person('lucy', 360, 345, 1.05, 'kneel') + glow(372, 250, 50, '#fff3c0', 0.5) + me(S, 580, 348, 1.05, 'stand', true) + S.bubble("I can feel it moving. Don't tell Steven.", 90, 30, 230, 330, 150) + S.kana('ドクン', 250, 220, 40, -6, '#f2c14e');
      if (k === 0) return s + S.person('lucy', 330, 345, 1, 'kneel') + glow(342, 250, 50) + S.person('hotpants', 460, 345, 1.05, 'point', true) + S.person('abbess', 600, 345, 0.95, 'arms', true) + S.bubble('She is carrying a Saint.', 560, 30, 180, 600, 150);
      if (k === 1) return S.bg({ pal: 'night', stars: true }) + S.prop('indHall', 400, 270, 1.2) + me(S, 400, 348, 1.1, 'draw') + [150, 640, 720].map((x, i) => S.person('agent', x, 345, 0.85, 'draw', x > 400)).join('') + S.caption('All night. At dawn, three agents.');
      if (k === 2) return s + S.person('steven', 300, 345, 1.05, 'point') + S.person('lucy', 450, 345, 1, 'kneel', true) + glow(438, 250, 40) + me(S, 650, 348, 0.95, 'stand', true) + S.kana('ハッ', 280, 110, 44, -6, '#9fc7e8');
    }, [0, 1, 2]);

    add('sbr_bluehawaii', 5, (S, k) => {
      const deck = S.bg({ pal: 5, horizon: 220 }) + river(220, 140, '#3a6a9a') + `<path d="M0 270h800v90H0z" fill="#c8a070" ${st}/>` + [...Array(10)].map((_, i) => `<path d="M${i * 80} 270v90" stroke="${K}" stroke-width="2" opacity=".5"/>`).join('') + `<path d="M0 250h800" stroke="#f6ecd8" stroke-width="6"/><path d="M0 250h800" stroke="${K}" stroke-width="2"/>` + [60, 740].map(x => `<rect x="${x - 20}" y="60" width="40" height="190" fill="#c8323c" ${st}/><rect x="${x - 26}" y="46" width="52" height="18" fill="${K}"/>`).join('');
      const coin = (x, y) => `<circle cx="${x}" cy="${y}" r="12" fill="#f2c14e" ${st}/><text x="${x}" y="${y + 5}" font-size="13" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${K}">H</text>`;
      if (k === 's') return deck + crowd(S, ['georgy', 'sloop', 'nellyville', 'dixie'], 160, 640, 275, 0.6) + [220, 300, 380, 460, 540].map((x, i) => coin(x, 150 - (i % 2) * 20)).join('') + S.kana('オモテ！', 400, 90, 44, -4, '#f2c14e') + me(S, 690, 350, 1, 'stand', true);
      if (k === 0) return S.bg({ pal: 'dusk', sunY: 215, sunX: 660, horizon: 250 }) + river(250, 110, '#3a5a8a') + S.prop('steamer', 400, 290, 1.4) + S.caption('A night on the water, far down the coast.');
      if (k === 1) return S.bg({ inside: true, pal: 'inside', horizon: 300 }) + fire(640, 320, 1.2) + `<rect x="580" y="120" width="120" height="180" fill="#3a3a42" ${st}/>` + S.person('miner', 420, 345, 1, 'kneel', true) + S.stand('ticket', 320, 300, 1.1) + me(S, 160, 348, 1.05, 'point') + S.kana('ゴゴゴ', 300, 80, 44, -6, '#e8508a');
      if (k === '1:fail') return deck + me(S, 400, 330, 1, 'down') + [300, 380, 460].map(x => `<circle cx="${x}" cy="200" r="12" fill="#c8c8d0" ${st}/>`).join('') + S.kana('ツルッ', 520, 150, 50, 10);
      if (k === 2) return S.bg({ pal: 5 }) + `<rect x="0" y="250" width="800" height="30" fill="#5a8ac8"/>` + meRide(S, 400, 345, 1.1) + S.prop('lighthouse', 700, 260, 0.6) + S.caption('Slow, but honest.');
    }, [0, 1, '1:fail', 2]);

    add('sbr_hp_stand', 5, (S, k) => {
      const s = S.bg({ pal: 'night', stars: true }) + fire(400, 330, 1.2);
      const basket = (x, y) => `<path d="M${x - 40} ${y - 30}h80l-8 30h-64z" fill="#c8a060" ${st}/><path d="M${x - 30} ${y - 30}q30 -40 60 0" fill="none" ${st}/>` + [...Array(4)].map((_, i) => `<path d="M${x - 30 + i * 16} ${y - 30}l8 -12l8 12z" fill="#f6ecd8" stroke="${K}" stroke-width="2"/>`).join('');
      if (k === 's') return s + S.person('hotpants', 240, 345, 1.1, 'point') + basket(300, 250) + me(S, 580, 348, 1.05, 'stand', true) + S.bubble('Eat. I always make too many.', 60, 30, 200, 240, 150);
      if (k === 0) return s + S.person('hotpants', 260, 345, 1.1, 'stand') + me(S, 540, 348, 1.05, 'point', true) + basket(400, 250) + S.kana('ニコ', 240, 110, 36, -6, '#f09ac0');
      if (k === 1) return s + S.person('hotpants', 300, 345, 1.1, 'kneel') + `<g opacity=".35">${bear(560, 200, 1.4)}${S.bust('hotpants', 660, 200, 0.6)}</g>` + S.bubble('The Corpse is the only forgiveness I will accept.', 40, 30, 250, 280, 170);
    }, [0, 1]);

    /* =========================== ACT 6 =========================== */
    add('sbr_trinity', 6, (S, k) => {
      const church = `<rect x="330" y="120" width="140" height="170" fill="#b8a898" ${st}/><path d="M360 120l40 -110l40 110z" fill="#8a7a6a" ${st}/><path d="M380 290v-60q20 -24 40 0v60z" fill="#3a2a2a" ${st}/><circle cx="400" cy="160" r="14" fill="#fff3c0" ${st}/>`;
      const s = S.bg({ pal: 6 }) + S.prop('skyline', 0, 0, 1, SBR.scenery.seeded(7), 0, 800, 290, '#4a4468', 'plain', true, 60, 120) + church + S.prop('bunting', 0, 0, 1, 0, 800, 30, 20);
      if (k === 's') return s + crowd(S, ['georgy', 'sloop', 'nellyville', 'dixie', 'norisuke', 'urmd'], 60, 740, 330, 0.55) + S.person('steven', 250, 348, 1.05, 'point') + me(S, 560, 350, 1.05, 'stand', true) + S.bubble('It should rest where no President can reach it.', 60, 40, 240, 250, 150);
      if (k === 0) return s + S.person('steven', 340, 348, 1.05, 'point') + me(S, 460, 350, 1.05, 'point', true) + S.kana('ガシッ', 400, 190, 44) + S.fx('coins', 600, 260, 1.4) + S.caption('The first time he has looked afraid.');
      if (k === 1) return s + S.person('steven', 300, 348, 1.05, 'stand') + me(S, 520, 350, 1.05, 'stand', true) + S.bubble("That's what the President says, too.", 60, 40, 220, 290, 150);
    }, [0, 1]);

    add('sbr_newspaper', 6, (S, k) => {
      const s = S.bg({ pal: 5 }) + building(120, 300, 220, 220, '#9a5a4a', 3, 3) + building(680, 300, 240, 240, '#6a5a7a', 3, 3) + S.prop('lamp', 400, 300, 1);
      const paperH = (t, x = 560, y = 210, rot = 6) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-90" y="-60" width="180" height="120" fill="#f6ecd8" ${st}/><text x="0" y="-30" font-size="11" text-anchor="middle" font-family="Oswald,sans-serif" fill="${K}">THE DAILY STANDINGS</text><path d="M-80 -24h160" stroke="${K}" stroke-width="2"/>${t.split('|').map((l, i) => `<text x="0" y="${-2 + i * 24}" font-size="20" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${K}">${l}</text>`).join('')}</g>`;
      if (k === 's') return s + S.person('hamonkid', 260, 345, 0.85, 'point') + paperH('EXTRA!|EXTRA!', 420, 150, -8) + me(S, 560, 348, 1.05, 'stand', true) + S.bubble('A dollar for the front page!', 80, 30, 200, 250, 170);
      if (k === 0) return s + S.person('hamonkid', 220, 345, 0.85, 'arms') + paperH('JOESTAR TEAM|TO WIN') + crowd(S, ['georgy', 'dixie', 'sloop'], 100, 360, 300, 0.5) + S.kana('ワーッ', 250, 100, 44, -6, '#f2c14e');
      if (k === 1) return s + paperH("PRESIDENT'S MEN|SEEN IN RACE", 400, 180, -4) + S.person('agent', 180, 345, 0.95, 'arms') + S.person('agent', 660, 345, 0.95, 'arms', true) + S.kana('ギクッ', 180, 110, 40, -8, '#9fc7e8');
      if (k === 2) return s + me(S, 300, 348, 1.05, 'stand') + paperH('1. ???|2. SLOOP JOHN B', 520, 200, 4);
    }, [0, 1, 2]);

    /* ---------- consequences in sbr.js ---------- */
    add('sloop_repays', 3, (S, k) => {
      const s = S.bg({ pal: 3 }) + river(290, 70) + `<path d="M560 300h180v-14h-180z" fill="#8a5a30" ${st}/>` + S.person('miner', 650, 290, 0.6, 'stand', true);
      if (k === 's') return s + S.person('sloop', 280, 300, 1.05, 'point') + me(S, 460, 300, 1, 'stand', true) + S.bubble('The ferryman takes bribes. His brother sells horseshoes.', 40, 30, 260, 260, 110);
      if (k === 0) return s + meRide(S, 400, 300, 1.1) + S.person('sloop', 150, 300, 0.9, 'arms') + S.kana('ダダッ', 500, 100, 44);
      if (k === 1) return s + mounted(S, 'sloop', 240, 300, 0.9, false, { coat: '#b8703a', mane: '#3a1a10' }) + meRide(S, 470, 300, 0.9) + `<ellipse cx="360" cy="170" rx="11" ry="15" fill="#6a8ac8" ${st}/>` + S.bubble('...and then Dixie says—', 330, 30, 180, 300, 110);
    }, [0, 1]);

    add('gaucho_returns', 3, (S, k) => {
      const s = S.bg({ pal: 3 }) + S.prop('pine', 80, 290, 0.8, 170) + S.prop('pine', 740, 290, 0.9, 180);
      if (k === 's') return s + mounted(S, 'gaucho', 280, 345, 1.1, false, { coat: '#6a4a3a', mane: '#1a1020' }) + meRide(S, 560, 345, 1.1, true) + S.bubble('Seven went in. None came out. I owe you everything!', 40, 30, 260, 280, 150);
      if (k === 0) return s + S.person('gaucho', 300, 345, 1.05, 'point') + `<path d="M${400} 190l60 -10l10 50l-60 10z" fill="#c8323c" ${st}/><path d="M405 200l60 -10M408 214l60 -10" stroke="#f2c14e" stroke-width="3"/>` + me(S, 560, 348, 1.05, 'stand', true) + S.caption('Thick Argentine wool.');
      if (k === 1) return s + mounted(S, 'gaucho', 400, 345, 1.15, false, { coat: '#6a4a3a', mane: '#1a1020' }) + S.bubble('HE SAVED MY LIFE! TELL EVERYONE!', 360, 30, 230, 420, 150) + crowd(S, ['sloop', 'georgy', 'dixie'], 90, 250, 300, 0.45);
    }, [0, 1]);

    add('diego_hat', 3, (S, k) => {
      const s = S.bg({ pal: 3 }) + S.fx('dust', 180, 310, 2);
      const silver = { coat: '#c8c8d0', mane: '#f6ecd8', wrap: '#3a8c4a' };
      if (k === 's') return s + mounted(S, 'diegodino', 280, 345, 1.2, false, silver) + me(S, 600, 348, 1.05, 'stand', true) + hat(560, 200, 0.9, '#3a8c4a') + S.bubble('You took my hat. Do you know how that looked?', 40, 30, 250, 280, 150) + S.kana('ギロリ', 300, 190, 30, 0, '#e8508a');
      if (k === 0) return s + S.person('diegodino', 250, 345, 1.1, 'arms') + raptor(420, 340, 1.1, true) + me(S, 640, 348, 1.05, 'draw', true) + S.stand('scarymonsters', 130, 300, 1.2) + S.kana('ギャオオ', 420, 100, 50, -6, '#9ff0a0') + S.lines(420, 220, K, 36, 0.3);
      if (k === 1) return s + mounted(S, 'diego', 330, 345, 1.1, true, silver) + hat(320, 175, 0.9, '#3a8c4a') + me(S, 600, 348, 1.05, 'stand', true) + S.caption('He puts it on without a word.');
    }, [0, 1]);

    add('magent_returns', 5, (S, k) => {
      const s = S.bg({ pal: 5 }) + S.prop('rock', 300, 300, 2.5);
      if (k === 's') return s + S.person('magent', 280, 345, 1.1, 'kneel') + `<path d="M320 214l110 -20" stroke="${K}" stroke-width="8"/><path d="M320 214l110 -20" stroke="#6a4a2a" stroke-width="4"/>` + S.stand('century', 200, 330, 1.2) + me(S, 620, 348, 1.05, 'stand', true) + S.bubble('Nobody sees me like that and lives.', 40, 30, 230, 270, 150);
      if (k === 0) return s + S.person('magent', 240, 345, 1.1, 'draw') + S.fx('bang', 330, 230, 1.4) + `<rect x="170" y="140" width="140" height="210" rx="40" fill="#c8c8d8" opacity=".35" stroke="${K}" stroke-width="3" stroke-dasharray="8 6"/>` + me(S, 560, 348, 1.1, 'draw', true) + S.kana('カキィン', 250, 110, 44, -6, '#9fc7e8') + S.lines(560, 220, K, 30, 0.3);
    }, [0]);

    /* =========================================================== */
    /* ======= js/campaign.js : consequences that come back ======= */
    /* =========================================================== */
    const road = (S, o = {}) => S.bg(o) + S.prop('rock', 80, 300, 1.4) + S.prop('tumble', 700, 300, 1.2) + S.prop('pole', 740, 300, 0.9);

    add('gambler_revenge', undefined, (S, k) => {
      const s = road(S);
      const cards = (x, y) => [...Array(6)].map((_, i) => `<rect x="${x + (i * 47) % 160 - 80}" y="${y + (i * 31) % 70 - 35}" width="26" height="36" rx="3" fill="#fff" ${st} transform="rotate(${i * 33 - 60} ${x + (i * 47) % 160 - 80} ${y})"/>`).join('');
      if (k === 's') return s + S.person('thug', 120, 345, 0.9, 'draw') + S.person('gunslinger', 280, 348, 1.1, 'point') + S.stand('sd_emperor', 330, 230, 0.8) + S.person('bandit', 420, 345, 0.9, 'draw') + me(S, 640, 348, 1.05, 'stand', true) + S.bubble('Nobody embarrasses me at my own table.', 40, 20, 240, 270, 150);
      if (k === 0) return s + cards(400, 150) + S.person('gunslinger', 250, 348, 1.05, 'draw') + S.fx('bang', 330, 238, 1.2) + me(S, 580, 348, 1.1, 'draw', true) + S.fx('bang', 510, 238, 1.2) + S.kana('ドン', 420, 90, 56, -8, '#f2c14e') + S.lines(420, 200, K, 36, 0.3);
      if (k === 1 || k === '1:fail') return S.bg({ inside: true, pal: 'inside', horizon: 290 }) + table(400, 260, 300) + `<g>${[0, 1, 2, 3, 4].map(i => `<rect x="${330 + i * 30}" y="224" width="26" height="36" rx="3" fill="#fff" ${st}/>`).join('')}</g>` + S.person('gunslinger', 200, 345, 1.05, k === 1 ? 'arms' : 'point') + me(S, 600, 348, 1.05, k === 1 ? 'arms' : 'kneel', true) + (k === 1 ? S.bubble('Ha! Drinks on me.', 80, 40, 160, 200, 150) + S.fx('coins', 520, 250, 1.4) : S.kana('ガーン', 600, 100, 50, 8, '#9fc7e8') + S.fx('coins', 260, 250, 1.4));
    }, [0, 1, '1:fail']);

    add('gambler_marker', undefined, (S, k) => {
      const s = road(S);
      const ledger = `<g transform="translate(360 230) rotate(-6)"><rect x="-30" y="-22" width="60" height="44" fill="#6a2a2a" ${st}/><path d="M0 -22v44" ${st}/></g>`;
      if (k === 's') return s + mounted(S, 'thug', 260, 345, 1.05, false, { coat: '#4a4a52', mane: '#1a1020' }) + ledger + me(S, 620, 348, 1.05, 'stand', true) + S.bubble('Cash, or blood.', 360, 40, 140, 320, 170);
      if (k === 0) return s + S.person('thug', 300, 348, 1.05, 'point') + bills(420, 220, 1.2) + me(S, 560, 348, 1.05, 'point', true) + S.bubble('Pleasure.', 160, 40, 110, 290, 150);
      if (k === 1) return s + S.person('thug', 280, 348, 1, 'arms') + S.kana('ピーッ', 280, 110, 40, -6) + S.person('bandit', 140, 348, 0.9, 'draw') + S.person('bandit', 420, 348, 0.9, 'draw') + me(S, 650, 348, 1.05, 'draw', true) + S.prop('pear', 90, 350, 1.6);
    }, [0, 1]);

    add('marksman_help', undefined, (S, k) => {
      const s = S.bg({ horizon: 270 }) + `<path d="M500 270Q640 150 800 170V270z" fill="#b8784a" ${st}/>`;
      if (k === 's') return s + S.person('gunslinger', 660, 200, 0.7, 'draw', true) + `<circle cx="615" cy="118" r="5" fill="#fff"/>` + S.fx('spark', 615, 118, 1) + me(S, 260, 345, 1.1, 'stand') + S.bubble("Tim would've wanted me here.", 330, 40, 200, 620, 120);
      if (k === 0) return s + S.person('gunslinger', 660, 200, 0.7, 'draw', true) + me(S, 300, 345, 1.1, 'draw') + `<circle cx="120" cy="190" r="36" fill="none" stroke="#c8323c" stroke-width="3"/><path d="M120 146v88M76 190h88" stroke="#c8323c" stroke-width="2"/>` + S.kana('ピタッ', 400, 110, 40);
      if (k === 1) return s + mounted(S, 'gunslinger', 540, 300, 0.8, false, { coat: '#8a6a4a' }) + me(S, 200, 345, 1.05, 'point') + S.caption('He rides for Kansas City.');
    }, [0, 1]);

    add('fortune_curse', undefined, (S, k) => {
      const s = S.bg({ pal: 'dusk', sunY: 215, sunX: 660 }) + fog(260, 0.6);
      const ghosts = (op = 0.45, x0 = 80) => `<g opacity="${op}">${[0, 1, 2, 3].map(i => S.person('ghost', x0 + i * 120, 340 - (i % 2) * 10, 0.9 - (i % 2) * 0.1)).join('')}</g>`;
      if (k === 's') return s + ghosts() + meRide(S, 640, 345, 1.05, true) + S.bust('urmd', 120, 120, 0.7) + S.bubble('Some things should not be asked.', 170, 20, 220);
      if (k === 0) return s + ghosts(0.6, 60) + me(S, 620, 348, 1.1, 'draw', true) + S.lines(620, 220, K, 30, 0.3) + S.kana('ヒュォォ', 300, 90, 44, -6, '#e8eef4');
      if (k === 1) return s + ghosts(0.18) + me(S, 420, 348, 1.1, 'kneel') + S.lines(420, 200, '#fff3c0', 30, 0.5) + S.caption('They fade.');
      if (k === '1:fail') return s + ghosts(0.7, 200) + me(S, 150, 348, 1, 'kneel') + S.kana('ザワザワ', 480, 90, 44, 0, '#e8eef4');
    }, [0, 1, '1:fail']);

    add('agents_revenge', undefined, (S, k) => {
      const s = road(S);
      const line = [120, 220, 320, 420].map((x, i) => S.person('agent', x, 345 - (i % 2) * 8, 0.9, i % 2 ? 'draw' : 'stand')).join('');
      if (k === 's') return s + line + me(S, 650, 348, 1.05, 'stand', true) + S.bubble('You killed Harris and Cole at that camp.', 60, 20, 240, 220, 170);
      if (k === 0) return s + line + [150, 250, 350, 450].map(x => S.fx('bang', x + 40, 240, 0.8)).join('') + me(S, 650, 348, 1.1, 'draw', true) + S.kana('バババババ', 400, 90, 44, -4, '#f2c14e');
      if (k === 1) return s + mounted(S, 'agent', 250, 345, 1, true, { coat: '#3a3a42' }) + paper(160, 170, 70, 50, -10, 3, '#c8a870') + me(S, 600, 348, 1.05, 'arms', true) + S.caption('They take the map to report.');
    }, [0, 1]);

    add('burned_farm', undefined, (S, k) => {
      const s = S.bg({ pal: 'dusk', sunY: 215, sunX: 660 }) + `<rect x="0" y="250" width="800" height="110" fill="#4a3a30"/>` + [...Array(14)].map((_, i) => `<path d="M${i * 60 + 10} 300l6 -30l6 30" fill="#2a1a10" stroke="${K}" stroke-width="2"/>`).join('') + S.fx('smoke', 200, 120, 1.6) + S.fx('smoke', 560, 100, 1.2) + S.prop('farmhouse', 680, 250, 0.6);
      if (k === 's') return s + S.person('miner', 300, 345, 1.05, 'point') + me(S, 540, 348, 1.05, 'stand', true) + `<g fill="#2a2a2a" opacity=".6"><circle cx="572" cy="238" r="5"/><circle cx="560" cy="250" r="4"/></g>` + S.bubble('From that government camp.', 80, 30, 200, 300, 150);
      if (k === 0) return s + S.person('miner', 320, 345, 1.05, 'stand') + bills(390, 230, 1.1) + me(S, 520, 348, 1.05, 'point', true) + S.caption('He says nothing, but he takes it.');
      if (k === 1) return s + S.person('miner', 260, 345, 1.05, 'point') + meRide(S, 600, 345, 1) + S.bubble('The sheriff will hear of this.', 60, 30, 200, 250, 150);
    }, [0, 1]);

    add('fan_letters', undefined, (S, k) => {
      const s = S.bg({ inside: true, pal: 'inside', horizon: 300 });
      const j = has('johnny') ? 'johnny' : lead();
      const pile = [...Array(9)].map((_, i) => letter(250 + (i * 53) % 300, 300 - (i % 3) * 18, 0.7, (i * 23) % 40 - 20, ['#c8323c', '#3a6ab8', '#3a8c4a'][i % 3])).join('');
      if (k === 's') return s + `<path d="M280 300q-10 -80 60 -100q70 20 60 100z" fill="#c8a070" ${st}/>` + pile + S.person(j, 600, 348, 1.05, 'stand', true);
      if (k === 0) return S.bg({ pal: 'night', stars: true }) + fire(600, 330, 0.8) + pile + S.person(j, 400, 348, 1.1, 'kneel') + paper(460, 190, 80, 60, 8, 4) + S.caption('He reads until dawn.');
      if (k === 1) return s + pile + S.fx('coins', 420, 250, 1.8) + bills(360, 220, 1.2) + me(S, 600, 348, 1.05, 'point', true);
    }, [0, 1]);

    add('prospector_curse', undefined, (S, k) => {
      const s = S.bg({ horizon: 260 });
      const iron = `<g fill="#3a3a4a">${[...Array(40)].map((_, i) => `<circle cx="${(i * 97) % 800}" cy="${270 + (i * 13) % 70}" r="2.4"/>`).join('')}</g>`;
      if (k === 's') return s + iron + `<circle cx="400" cy="160" r="120" fill="#fff" ${st}/><path d="M400 40v240M280 160h240" stroke="${K}" stroke-width="2"/>` + `<svg x="280" y="40" width="240" height="240" viewBox="0 0 240 240"><circle cx="120" cy="120" r="118" fill="#e8c080"/>${S.person('miner', 70, 210, 0.7, 'point')}${S.person('andre', 150, 210, 0.7)}${S.person('laboomboom', 210, 210, 0.6)}</svg>` + me(S, 100, 348, 1, 'kneel') + S.caption('The prospector, pointing your way.', 520, 20, 260);
      if (k === 0) return s + iron + S.prop('rock', 400, 300, 3) + meRide(S, 170, 335, 0.8) + `<path d="M150 330Q400 180 650 330" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="12 8"/>` + S.caption('The long way round.');
      if (k === 1) return s + iron + meRide(S, 400, 345, 1.1) + `<g fill="#3a3a4a">${[...Array(30)].map((_, i) => `<circle cx="${320 + (i * 37) % 180}" cy="${220 + (i * 23) % 120}" r="3"/>`).join('')}</g>` + S.kana('ジャリジャリ', 400, 90, 40, -4, '#8a8aa0');
    }, [0, 1]);

    add('dothan_sabotage', undefined, (S, k) => {
      const s = road(S);
      const trough = `<rect x="200" y="290" width="200" height="40" fill="#8a5a30" ${st}/><rect x="206" y="284" width="188" height="12" fill="#6a8a4a" stroke="${K}" stroke-width="2"/>`;
      if (k === 's') return s + trough + ride(S, 300, 330, 1.1) + me(S, 520, 348, 1.05, 'point', true) + [...Array(5)].map((_, i) => `<path d="M${560 + i * 40} ${320 + (i % 2) * 10}q0 -8 7 -8t7 8z" fill="${K}"/>`).join('') + S.kana('プイッ', 300, 150, 40);
      if (k === 0) return s + S.person('dothan', 300, 345, 1.05, 'arms') + bottle(420, 200, 1.1, '#8a5a30') + me(S, 560, 348, 1.05, 'point', true) + S.bubble('Fair. You find me, you drink.', 60, 30, 210, 290, 150);
      if (k === 1) return s + river(300, 60) + meRide(S, 400, 330, 1) + S.caption('Slow going.');
    }, [0, 1]);

    add('dothan_help', undefined, (S, k) => {
      const s = S.bg({ horizon: 260 }) + S.prop('wheat', 120, 330, 1.4) + S.prop('wheat', 660, 330, 1.2);
      if (k === 's') return s + mounted(S, 'dothan', 260, 345, 1, false, { coat: '#8a6a4a', mane: '#2a1a10' }) + meRide(S, 540, 345, 1) + S.bubble('A good rival is worth two friends.', 60, 30, 230, 260, 170);
      if (k === 0) return s + `<path d="M0 320Q300 250 800 300" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="12 8"/>` + mounted(S, 'dothan', 480, 330, 0.95, false, { coat: '#8a6a4a', mane: '#2a1a10' }) + meRide(S, 270, 330, 0.95) + S.kana('ビュン', 620, 110, 50);
      if (k === 1) return s + S.person('dothan', 300, 345, 1.05, 'point') + me(S, 520, 348, 1.05, 'stand', true) + S.bubble('Diego is not as fast as he thinks.', 60, 30, 220, 290, 150) + S.bust('diego', 700, 150, 0.6);
    }, [0, 1]);

    add('framed_truth', undefined, (S, k) => {
      const s = S.bg({ horizon: 270 }) + building(640, 290, 200, 180, '#9a6a4a', 2, 2);
      const news = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-110" y="-70" width="220" height="140" fill="#f6ecd8" ${st}/><text x="0" y="-40" font-size="20" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${K}">AGENT CONFESSES</text><path d="M-96 -24h192M-96 -8h150M-96 8h180M-96 24h120" stroke="${K}" stroke-width="2" opacity=".5"/></g>`;
      if (k === 's') return s + news(330, 170, -4) + me(S, 160, 348, 1.05, 'stand') + S.kana('ズン…', 480, 110, 40, 6, '#9fc7e8');
      if (k === 0) return s + letter(360, 200, 1.3, -6) + bills(360, 150, 1) + me(S, 200, 348, 1.05, 'point') + S.caption("It doesn't bring him back.");
      if (k === 1) return s + fire(360, 320, 1) + news(360, 220, 12).replace('#f6ecd8', '#e8c890') + me(S, 180, 348, 1.05, 'stand');
    }, [0, 1]);

    add('framed_gang_help', undefined, (S, k) => {
      const s = S.bg({});
      const gang = (x0, flip) => [0, 1, 2].map(i => mounted(S, ['bandit', 'thug', 'kansasgun'][i], x0 + i * 120, 340 - i * 6, 0.75, flip, { coat: ['#8a6a4a', '#4a4a52', '#b8703a'][i] })).join('');
      if (k === 's') return s + gang(110) + `<path d="M150 180v-60" ${st}/><path d="M150 120q30 10 50 0v26q-20 10 -50 0z" fill="#fff" ${st}/>` + me(S, 660, 348, 1.05, 'stand', true) + S.bubble('We owe you.', 470, 40, 120, 440, 170);
      if (k === 0) return s + gang(420, true) + [0, 1].map(i => mounted(S, 'agent', 120 + i * 110, 320, 0.6, true, { coat: '#3a3a42' })).join('') + S.kana('コッチダ！', 400, 90, 40, -4) + S.caption('They draw the President\'s men off.');
      if (k === 1) return s + S.person('bandit', 280, 345, 1.05, 'point') + paper(420, 210, 150, 100, -4, 0, '#c8a870') + [...Array(5)].map((_, i) => `<path d="M${370 + i * 24} ${196 + (i % 2) * 20}l8 8m0 -8l-8 8" stroke="#c8323c" stroke-width="3"/>`).join('') + me(S, 600, 348, 1.05, 'stand', true);
    }, [0, 1]);

    add('agent_captive', undefined, (S, k) => {
      const s = S.bg({ pal: 'dusk', sunY: 215, sunX: 660 }) + fire(620, 330, 0.8);
      if (k === 's') return s + S.person('agent', 300, 345, 1, 'kneel') + rope('M280 250q20 20 50 0') + me(S, 480, 348, 1.05, 'draw', true) + S.bubble("Let me go and I'll talk.", 90, 40, 190, 300, 150);
      if (k === 0) return s + S.person('agent', 180, 345, 0.9, 'point', true) + me(S, 440, 348, 1.05, 'stand', true) + S.bubble('Next ambush is at the pass. Early.', 200, 40, 220, 200, 150) + S.kana('タタタ', 90, 120, 36);
      if (k === 1) return S.bg({}) + building(560, 300, 220, 170, '#9a6a4a', 2, 2) + wordOn(560, 150, 'SHERIFF', '#f2c14e', 26) + S.person('deputy', 460, 345, 1, 'point') + S.person('agent', 330, 345, 0.95, 'kneel') + me(S, 160, 348, 1.05);
    }, [0, 1]);

    add('farm_family', undefined, (S, k) => {
      const s = S.bg({ pal: 'dusk', sunY: 215, sunX: 660 }) + S.prop('farmhouse', 560, 290, 1.1) + fence(40, 360, 320);
      const drawing = `<g transform="translate(300 200) rotate(-6)"><rect x="-44" y="-32" width="88" height="64" fill="#fff" ${st}/><path d="M-30 14h40l8 -14l6 -6v20M-24 14v10M4 14v10" fill="none" stroke="#7a4a2a" stroke-width="4"/><circle cx="26" cy="-18" r="7" fill="#f2c14e"/></g>`;
      if (k === 's') return s + S.person('hamonkid', 230, 340, 0.75, 'arms') + drawing + S.person('miner', 400, 345, 1, 'point') + me(S, 640, 348, 1.05, 'stand', true);
      if (k === 0) return S.bg({ inside: true, pal: 'inside', horizon: 290 }) + table(400, 240, 360) + [300, 400, 500].map(x => `<ellipse cx="${x}" cy="238" rx="26" ry="7" fill="#f6ecd8" ${st}/>`).join('') + S.person('miner', 180, 345, 1) + S.person('hamonkid', 300, 345, 0.7) + me(S, 620, 348, 1.05, 'stand', true) + S.kana('ホッ', 620, 100, 40, 0, '#f2c14e');
      if (k === 1) return s + S.fx('coins', 400, 260, 1.4) + S.person('miner', 330, 345, 1) + meRide(S, 620, 345, 1) + S.person('hamonkid', 230, 340, 0.75, 'arms');
    }, [0, 1]);

    add('trailboss_drive', undefined, (S, k) => {
      const s = S.bg({ horizon: 250 });
      const herd = (gap) => [...Array(10)].map((_, i) => { const x = 60 + i * 76, left = x < 400; const dx = gap ? (left ? -60 : 60) : 0; return S.T(x + dx, 270 + (i % 3) * 30, 0.9, S.P().cow(), !left); }).join('');
      if (k === 's') return s + herd(false) + mounted(S, 'rodeo', 660, 230, 0.7, false) + me(S, 100, 348, 1, 'stand') + S.bubble('Clear the road for my friends!', 450, 20, 220, 640, 110);
      if (k === 0) return s + herd(true) + meRide(S, 400, 345, 1.1) + S.kana('モォォ', 200, 110, 40) + S.caption('Like the Red Sea.');
      if (k === 1) return S.bg({ pal: 'dusk', sunY: 215, sunX: 660 }) + fire(400, 330, 1.2) + `<path d="M340 250h120" stroke="${K}" stroke-width="6"/><ellipse cx="400" cy="240" rx="40" ry="16" fill="#a0522d" ${st}/>` + me(S, 220, 348, 1.05) + pal(S, 600, 348, 1, 'stand', true);
    }, [0, 1]);

    add('preacher_report', undefined, (S, k) => {
      const s = road(S);
      const soldiers = [120, 230, 340].map(x => S.person('soldier', x, 345, 0.95, 'draw')).join('');
      if (k === 's') return s + soldiers + S.person('snakeoil', 470, 345, 0.9, 'point') + me(S, 660, 348, 1.05, 'stand', true) + S.bubble('Search that one.', 380, 30, 150, 460, 150);
      if (k === 0) return s + soldiers + S.fx('boom', 450, 200, 1) + me(S, 620, 348, 1.1, 'draw', true) + S.kana('ドドド', 420, 70, 50, -6, '#e8508a');
      if (k === 1) return s + S.person('soldier', 300, 345, 1, 'point') + me(S, 480, 348, 1.05, 'arms', true) + S.prop('rock', 700, 340, 2) + glow(700, 320, 30, '#fff3c0', 0.4) + S.bubble('Nothing here.', 180, 40, 130, 300, 150);
      if (k === '1:fail') return s + S.person('soldier', 300, 345, 1, 'point') + corpse(420, 220, 1.2) + glow(420, 210, 60) + me(S, 580, 348, 1.05, 'arms', true) + S.kana('ハッ', 420, 110, 50, 0, '#f2c14e');
    }, [0, 1, '1:fail']);

    add('robinson_returns', 2, (S, k) => {
      const s = S.bg({ horizon: 260 }) + S.prop('saguaro', 90, 300, 0.8);
      if (k === 's') return s + bees(330, 200, 40, 120) + S.person('robinson', 330, 345, 1.05, 'point') + me(S, 600, 348, 1.05, 'stand', true) + S.bubble('The rain in Kansas will stop falling. Stay dry.', 360, 20, 250, 360, 150) + S.kana('ブゥゥン', 160, 90, 40, -6, '#f2c14e');
      if (k === 0) return s + S.person('robinson', 300, 345, 1, 'stand') + `<g opacity=".4">${S.bust('blackmore', 600, 180, 0.9)}</g>` + rain(0.5, true).replace(/<g /, '<g clip-path="none" ') + me(S, 480, 348, 1.05, 'stand', true);
      if (k === 1) return s + bees(300, 200, 20, 70) + S.person('robinson', 300, 345, 1, 'arms') + `<g transform="translate(470 230)">${[0, 1].map(i => `<rect x="${i * 18}" y="0" width="14" height="22" fill="#6a6a52" ${st}/>`).join('')}</g>` + me(S, 580, 348, 1.05, 'stand', true) + S.bubble('I race alone.', 160, 40, 130, 300, 150);
    }, [0, 1]);

    add('robinson_swarm', undefined, (S, k) => {
      const s = S.bg({}) + [120, 280, 520, 680].map((x, i) => S.prop('saguaro', x, 300, 0.8 + (i % 2) * 0.2)).join('');
      if (k === 's') return s + [120, 280, 520, 680].map(x => bees(x, 200, 8, 40)).join('') + meRide(S, 400, 345, 1.05) + S.kana('ブブブ', 400, 80, 44, 0, '#f2c14e');
      if (k === 0) return s + fire(280, 300, 1.4) + fire(520, 300, 1.2) + me(S, 400, 348, 1.05, 'point') + bees(600, 150, 10, 60) + S.kana('ボォッ', 300, 100, 50, -6, '#f2743a');
      if (k === 1) return s + `<path d="M0 340Q400 200 800 340" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="12 8"/>` + meRide(S, 400, 250, 0.7) + S.caption('The long way round.');
    }, [0, 1]);

    add('boom_return', undefined, (S, k) => {
      const s = S.bg({});
      const iron = (x, y) => `<g fill="#3a3a4a">${[...Array(24)].map((_, i) => `<circle cx="${x + Math.cos(i) * (20 + i * 3)}" cy="${y + Math.sin(i * 1.7) * 30}" r="2.6"/>`).join('')}</g>`;
      if (k === 's') return s + S.person('andre', 240, 345, 1.05, 'arms') + S.person('laboomboom', 380, 345, 0.95, 'arms') + iron(310, 170) + me(S, 640, 348, 1.05, 'stand', true) + S.bubble('The President pays better than revenge.', 60, 20, 240, 280, 150) + S.kana('ズズズ', 520, 120, 40, 0, '#8a8aa0');
      if (k === 0) return s + S.person('andre', 220, 345, 1.05, 'arms') + iron(420, 220) + S.fx('boom', 470, 220, 1) + me(S, 620, 348, 1.1, 'draw', true) + S.kana('バリバリ', 400, 80, 50, -6, '#8a8aa0');
      if (k === 1) return s + mounted(S, 'andre', 200, 345, 0.9, true) + mounted(S, 'laboomboom', 330, 345, 0.8, true) + me(S, 600, 348, 1.05, 'point', true) + S.bubble('...For nothing.', 480, 40, 130, 590, 150);
      if (k === '1:fail') return s + S.person('andre', 240, 345, 1.1, 'arms') + iron(430, 230) + iron(560, 200) + me(S, 620, 348, 1.05, 'arms', true) + S.kana('ゴゴゴ', 300, 80, 56, -6, '#e8508a');
    }, [0, 1, '1:fail']);

    add('bomber', undefined, (S, k) => {
      const s = S.bg({ pal: 'night', stars: true }) + fire(620, 330, 0.8);
      const saddle = `<path d="M320 290q40 -40 100 0v20h-100z" fill="#7a4a2a" ${st}/>`;
      if (k === 's') return s + saddle + pin(370, 270, 1.6) + S.lines(370, 260, '#fff', 30, 0.3) + me(S, 180, 348, 1.05) + S.kana('カチ…カチ…', 450, 150, 36, 0, '#f2c14e') + S.person('bounty', 740, 300, 0.5, 'stand', true);
      if (k === 0) return s + saddle + me(S, 330, 348, 1.1, 'arms') + pin(380, 170, 2) + S.person('bounty', 700, 345, 0.8, 'stand', true) + S.kana('スポッ', 450, 120, 44);
      if (k === '0:fail') return s + S.fx('boom', 380, 250, 2) + S.kana('ドグォォン', 400, 110, 60, -8, '#f2743a') + me(S, 160, 348, 1, 'down');
      if (k === 1) return S.bg({ pal: 'night', stars: true }) + meRide(S, 250, 345, 1.1) + S.person('bounty', 620, 345, 1, 'arms', true) + S.lines(620, 220, K, 30, 0.3) + S.kana('ダダダ', 420, 90, 44);
    }, [0, '0:fail', 1]);

    add('oye_debt', undefined, (S, k) => {
      const s = road(S);
      if (k === 's') return s + S.person('oyecomova', 300, 345, 1.05, 'point') + me(S, 580, 348, 1.05, 'stand', true) + S.kana('♪ピン♪', 200, 100, 36, -8, '#f2c14e') + S.bubble("They mine the bridges before the finish.", 60, 20, 230, 300, 150);
      if (k === 0) return S.bg({}) + S.prop('bridge', 400, 300, 0.8) + [260, 400, 540].map(x => pin(x, 250, 1.4)).join('') + me(S, 120, 348, 1.05, 'point') + S.caption('The final stretch will be safer.');
      if (k === 1) return s + S.person('oyecomova', 300, 345, 1.05, 'arms') + rope('M270 250q30 20 60 0') + me(S, 500, 348, 1.05, 'draw', true) + S.bubble('Again? Really?', 90, 40, 140, 290, 150);
    }, [0, 1]);

    add('guilt_ghosts', 5, (S, k) => {
      const s = S.bg({ pal: 'night', stars: true }) + fog(270, 0.5);
      const soldiers = (op) => `<g opacity="${op}">${[100, 210, 320, 430].map((x, i) => S.person('soldier', x, 345 - (i % 2) * 10, 0.95, 'draw')).join('')}</g>`;
      if (k === 's') return s + soldiers(0.5) + S.stand('civilwar', 560, 180, 0.9) + me(S, 660, 348, 1.05, 'stand', true) + S.caption('His guilt needs somewhere to go.');
      if (k === 0) return s + soldiers(0.7) + S.fx('boom', 520, 220, 1) + me(S, 640, 348, 1.1, 'draw', true) + S.kana('ドドドド', 350, 80, 50, -6, '#e8508a');
      if (k === 1) return s + soldiers(0.15) + me(S, 400, 348, 1.1, 'kneel') + S.lines(400, 200, '#fff3c0', 34, 0.5) + S.caption('They go quiet.');
      if (k === '1:fail') return s + soldiers(0.8) + me(S, 650, 348, 1.05, 'arms', true) + S.kana('ザッザッ', 300, 80, 50);
    }, [0, 1, '1:fail']);

    /* ---------------- js/variety.js : the hunters ---------------- */
    const hunter = (id, act, draw) => add(id, act, (S, k) => {
      const s = S.bg({ horizon: 260 }) + S.prop('rock', 60, 300, 1.6);
      if (k === 's') return s + draw(S, 's') + me(S, 660, 348, 1.05, 'stand', true);
      if (k === 0) return s + draw(S, 0) + S.fx('boom', 470, 210, 1) + me(S, 640, 348, 1.1, 'draw', true) + S.kana('ドドド', 400, 70, 50, -6, '#e8508a');
      if (k === 1) return S.bg({ horizon: 200 }) + `<path d="M0 260Q400 220 800 270V360H0z" fill="#b8905a" ${st}/><path d="M0 200L0 260Q400 220 800 270V200z" fill="#8a6a4a"/>` + meRide(S, 420, 330, 0.9) + `<g opacity=".7">${draw(S, 'far')}</g>` + S.caption('A dry creek bed. They ride past.');
      if (k === '1:fail') return s + draw(S, 'cut') + meRide(S, 620, 345, 1, true) + S.kana('!!', 560, 100, 60, 0, '#ffd84a');
      if (k === 2) return s + draw(S, 'pay') + bills(470, 220, 1.3) + me(S, 580, 348, 1.05, 'point', true) + S.caption("For now, they didn't see you.");
    }, [0, 1, '1:fail', 2]);
    hunter('hunt_agents', 1, (S, k) => k === 'far' ? [0, 1, 2].map(i => mounted(S, 'agent', 80 + i * 90, 190, 0.45, false, { coat: '#3a3a42' })).join('') : k === 'pay' ? S.person('agent', 350, 345, 1.05, 'point') : [0, 1, 2].map(i => mounted(S, 'agent', 120 + i * 130, 345 - i * 8, 0.8, false, { coat: '#3a3a42', mane: '#1a1020' })).join('') + (k === 's' ? S.bubble('Hand over what you found in the desert.', 60, 20, 240, 200, 170) : ''));
    hunter('hunt_dinos', 2, (S, k) => k === 'far' ? [0, 1, 2].map(i => raptor(90 + i * 90, 200, 0.45)).join('') : k === 'pay' ? raptor(330, 340, 1.1) + S.kana('…？', 330, 190, 40, 0, '#9ff0a0') : [0, 1, 2].map(i => raptor(120 + i * 150, 340 - (i % 2) * 20, 1 - (i % 2) * 0.2)).join('') + (k === 's' ? S.kana('シュルル', 250, 100, 40, -6, '#9ff0a0') + S.bust('diegodino', 720, 110, 0.6) : ''));
    hunter('hunt_parallel', 4, (S, k) => { const trees = [150, 300, 450].map(x => S.prop('tree', x, 330, 1.6, 90, '#4a7a3a')).join(''); return k === 'far' ? [0, 1, 2].map(i => S.person('parsoldier', 90 + i * 90, 200, 0.4)).join('') : trees + [0, 1, 2].map(i => S.person('parsoldier', 190 + i * 150, 345, 0.95, k === 'pay' ? 'stand' : 'draw')).join('') + (k === 's' ? S.bubble('There is always another one of us.', 60, 20, 230, 200, 160) + S.stand('d4c', 560, 180, 0.7) : ''); });
    hunter('hunt_snipers', 3, (S, k) => { const ridge = `<path d="M0 200Q200 120 420 180L420 260H0z" fill="#b8784a" ${st}/>`; return k === 'far' ? '' : ridge + [100, 220, 340].map(x => S.person('sniper', x, 180, 0.4, 'draw') + S.fx('spark', x + 30, 136, 0.8)).join('') + (k === 's' ? `<circle cx="660" cy="220" r="10" fill="#c8323c" opacity=".8"/>` + S.caption('One shot to mark you. One to finish.', 450, 20, 300) : ''); });

    /* =========================================================== */
    /* ====== js/manga.js : follow-ups from skips and branches ===== */
    /* =========================================================== */
    const gyroOr = () => has('gyro') ? 'gyro' : lead();

    add('robinson_ambush', 1, (S, k) => {
      const s = S.bg({ pal: 1, horizon: 300, far: false }) + `<path d="M0 110H230L180 300H0zM800 110H570L620 300H800z" fill="#c07a5a" ${st}/>` + S.tone('M0 110H230L180 300H0z', 0.2) + S.tone('M800 110H570L620 300H800z', 0.2) + [60, 150, 650, 740].map(x => S.prop('saguaro', x, 112, 0.5)).join('');
      if (k === 's') return s + S.person('robinson', 700, 112, 0.5, 'point', true) + bees(400, 170, 30, 110) + meRide(S, 400, 345, 1.05) + S.bubble('You rode past me once, amigos. Not twice.', 330, 14, 230, 680, 40);
      if (k === 0) return s + S.person('robinson', 540, 345, 1, 'point', true) + bees(470, 180, 30, 100) + S.prop('saguaro', 330, 345, 1) + me(S, 220, 348, 1.05, 'draw') + S.kana('ブブブブ', 400, 80, 50, -6, '#f2c14e');
      if (k === 1) return s + (has('mountaintim') ? S.person('mountaintim', 260, 348, 1.05, 'arms') : me(S, 260, 348, 1.05, 'arms')) + rope('M290 190Q480 60 680 100') + S.person('robinson', 640, 170, 0.6, 'down') + S.kana('ヒュン', 480, 150, 44);
      if (k === 2) return s + meRide(S, 640, 345, 1.2) + bees(250, 200, 24, 100) + S.fx('blood', 640, 200, 0.8) + S.lines(640, 230, K, 30, 0.3) + S.kana('ダダダッ', 420, 90, 44);
      if (k === '2:fail') return s + [460, 540, 620, 700].map(x => S.prop('saguaro', x, 345, 0.9)).join('') + meRide(S, 300, 345, 1) + S.kana('!?', 400, 100, 56, 0, '#ffd84a');
    }, [0, 1, 2, '2:fail']);

    add('tim_alone', 2, (S, k) => {
      const s = S.bg({ pal: 2 }) + S.prop('waterTower', 260, 300, 1.6) + S.prop('telegraph', 0, 0, 1, 420, 800, 300);
      if (k === 's') return s + S.person('mountaintim', 340, 348, 1.05, 'point') + `<ellipse cx="400" cy="244" rx="11" ry="15" fill="#6a8ac8" ${st}/>` + me(S, 600, 348, 1.05, 'stand', true) + S.bubble('A girl in Kansas City is going to need help.', 40, 20, 240, 330, 150);
      if (k === 0) return s + mounted(S, 'mountaintim', 330, 345, 1, false, { coat: '#6a4a3a', mane: '#2a1a1a' }) + meRide(S, 560, 345, 1) + S.kana('ニッ', 330, 120, 40, 0, '#f2c14e');
      if (k === 1) return s + mounted(S, 'mountaintim', 560, 345, 1.1, false, { coat: '#6a4a3a', mane: '#2a1a1a' }) + me(S, 180, 348, 1.05, 'point') + S.bubble("Now that's advice.", 460, 30, 160, 560, 150) + S.bust('lucy', 740, 120, 0.5);
      if (k === 2) return s + S.person('mountaintim', 360, 348, 1, 'arms') + meRide(S, 620, 345, 1) + S.caption('He tips his hat. You don\'t see him again.');
    }, [0, 1, 2]);

    add('hp_steals', 3, (S, k) => {
      const s = S.bg({ pal: 'night', stars: true }) + fire(620, 330, 0.6).replace('#f2743a', '#8a4a2a');
      const bags = `<path d="M300 330v-50q40 -20 80 0v50z" fill="#7a4a2a" ${st}/>`;
      if (k === 's') return s + bags + S.person('hotpants', 380, 345, 1.05, 'point', true) + corpse(310, 220, 0.9) + glow(310, 210, 40) + S.stand('creamstarter', 480, 280, 0.8) + me(S, 150, 350, 0.9, 'kneel') + S.bubble('The Saint belongs to God.', 440, 30, 190, 400, 150) + S.kana('シューッ', 560, 170, 34, 8, '#f09ac0');
      if (k === 0) return s + S.person('hotpants', 480, 345, 1.05, 'draw', true) + `<path d="M400 230q-60 -20 -120 10" fill="none" stroke="#f09ac0" stroke-width="16" stroke-linecap="round"/><path d="M400 230q-60 -20 -120 10" fill="none" stroke="${K}" stroke-width="2"/>` + me(S, 220, 348, 1.05, 'draw') + S.kana('ブシュッ', 350, 110, 44, -6, '#f09ac0');
      if (k === 1) return s + bags + S.person('hotpants', 700, 300, 0.6, 'stand', true) + glow(740, 220, 24) + me(S, 250, 348, 1.05, 'stand') + S.caption('She vanishes into the dark.');
      if (k === 2) return S.bg({ pal: 'night', stars: true }) + fire(400, 330, 1.1) + S.person('hotpants', 250, 345, 1.05, 'kneel') + me(S, 560, 348, 1.05, 'stand', true) + S.bubble('...Nobody has ever asked.', 60, 30, 200, 250, 160);
      if (k === '2:fail') return s + S.person('hotpants', 400, 345, 1.1, 'draw', true) + S.stand('creamstarter', 520, 280, 1) + me(S, 180, 348, 1.05, 'arms') + S.bubble('Not your concern.', 440, 30, 150, 420, 150);
    }, [0, 1, 2, '2:fail']);

    add('leftarm_hunt', 3, (S, k) => {
      const s = S.bg({ pal: 4 }) + snow(0.6) + S.prop('pine', 740, 290, 0.9, 180, undefined, true);
      const troop = (x0) => [0, 1, 2].map(i => S.person('soldier', x0 + i * 70, 340 - (i % 2) * 6, 0.8, i % 2 ? 'draw' : 'stand')).join('');
      if (k === 's') return s + troop(80) + mule(420, 340, 1.2) + crate(410, 300, 70, 44, '#8a8a6a', true) + S.person('stroheim', 560, 345, 1.05, 'arms') + S.bubble('German science will unlock the Saint!', 480, 20, 220, 560, 150) + S.kana('ゴゴゴ', 400, 150, 36, 0, '#fff3c0');
      if (k === 0) return s + troop(60) + S.person('stroheim', 360, 345, 1, 'point') + S.fx('boom', 470, 220, 1) + me(S, 620, 348, 1.1, 'draw', true) + S.kana('ドドドド', 400, 70, 50, -6, '#e8508a');
      if (k === 1) return S.bg({ pal: 'night', stars: true }) + snow(0.5) + mule(420, 340, 1.2, true) + crate(430, 300, 70, 44, '#8a8a6a', true) + me(S, 560, 348, 1.05, 'point', true) + S.person('soldier', 150, 330, 0.8, 'down') + S.kana('コソコソ', 420, 100, 36);
      if (k === '1:fail') return S.bg({ pal: 'night', stars: true }) + mule(420, 340, 1.2) + S.kana('ヒヒーン', 440, 150, 44, -6, '#f2c14e') + troop(120) + me(S, 640, 348, 1.05, 'arms', true);
      if (k === 2) return s + S.prop('loco', 330, 290, 0.8) + S.prop('boxcar', 520, 290, 0.8) + S.fx('smoke', 280, 120, 1.2) + me(S, 160, 348, 1.05) + S.fx('coins', 700, 320, 1);
    }, [0, 1, '1:fail', 2]);

    add('porkpie_hooks', 2, (S, k) => {
      const s = S.bg({ pal: 2 }) + [240, 520].map(x => S.prop('rock', x, 300, 2.2)).join('');
      const lines = `<g stroke="#e8f6ff" stroke-width="2">${[150, 180, 215].map((y, i) => `<path d="M0 ${y}L800 ${y + 20 - i * 10}"/>`).join('')}</g>`;
      const g = gyroOr();
      if (k === 's') return s + lines + S.person(g, 360, 348, 1.05, 'arms') + hat(420, 150, 0.9, '#3a8c4a', 20) + S.person('porkpie', 680, 345, 0.9, 'point', true) + S.bubble('Heheh! So I moved the rocks!', 480, 20, 200, 680, 160);
      if (k === 0) return s + lines + S.person('porkpie', 560, 345, 1, 'arms', true) + me(S, 260, 348, 1.05, 'draw') + S.fx('boom', 420, 220, 0.8) + S.kana('ドドド', 400, 80, 50, -6, '#e8508a');
      if (k === 1) return s + `<g stroke="#e8f6ff" stroke-width="2">${[150, 180, 215].map(y => `<path d="M0 ${y}L340 ${y + 8}M420 ${y + 12}L800 ${y + 18}"/>`).join('')}</g>` + S.person(g, 260, 348, 1.05, 'point') + ball(380, 190, 13) + whirl(380, 190, 28) + S.person('porkpie', 700, 345, 0.8, 'stand', true) + S.kana('プツッ', 400, 110, 44);
      if (k === '1:fail') return s + rope('M700 120L360 190', '#e8f6ff') + S.person(g, 330, 348, 1.05, 'arms') + S.fx('blood', 360, 200, 0.8) + S.person('porkpie', 680, 345, 0.9, 'arms', true) + S.kana('グイッ', 520, 100, 44, 0, '#e8508a');
    }, [0, 1, '1:fail']);

    add('oye_bomb', 2, (S, k) => {
      const s = S.bg({ pal: 2 }) + S.prop('barn', 400, 280, 1.1);
      const bell = `<path d="M130 160h40v-60h-40z" fill="none" ${st}/><path d="M150 100v-20" ${st}/><path d="M136 150q0 -36 14 -36t14 36z" fill="#f2c14e" ${st}/>`;
      if (k === 's') return s + bell + S.horse(560, 345, 1, { coat: '#8a4a2a' }) + pin(640, 270, 1.4) + pin(600, 290, 1.2) + me(S, 280, 348, 1.05, 'stand') + S.kana('♪ブーン♪', 150, 60, 30, -8, '#f2c14e') + S.caption('Every bridle has a tiny pin in it.', 450, 20, 300);
      if (k === 0) return s + bell + S.horse(560, 345, 1, { coat: '#8a4a2a' }) + me(S, 420, 348, 1.05, 'point') + [...Array(8)].map((_, i) => pin(250 + i * 16, 330, 0.9)).join('') + S.person('miner', 150, 345, 0.9, 'kneel') + S.kana('ホッ', 420, 110, 40, 0, '#9ff0c0');
      if (k === '0:fail') return s + S.fx('boom', 560, 240, 2) + S.kana('ドカーン', 540, 120, 60, -8, '#f2743a') + me(S, 250, 348, 1.05, 'arms');
      if (k === 1) return S.bg({ pal: 2 }) + S.prop('barn', 150, 280, 0.7) + S.fx('boom', 150, 200, 0.9) + meRide(S, 520, 345, 1.1) + S.kana('ゴーン', 170, 90, 44, -8, '#f2c14e');
    }, [0, '0:fail', 1]);

    add('ringo_loop', 3, (S, k) => {
      const s = S.bg({ pal: 3, horizon: 270 }) + S.prop('pine', 70, 290, 1, 200) + S.prop('pine', 760, 290, 1, 200) + S.prop('cabin', 400, 280, 1.3);
      if (k === 's') return s + S.person('ringo', 470, 330, 0.9, 'point', true) + watch(400, 230, 1) + S.stand('mandom', 560, 280, 0.8) + me(S, 180, 348, 1.05) + S.bubble('I have all the time in the world. You do not.', 440, 20, 240, 470, 140) + whirl(400, 230, 36, '#c8323c');
      if (k === 0) return s + S.person('ringo', 520, 348, 1.05, 'draw', true) + S.fx('bang', 440, 236, 1) + me(S, 220, 348, 1.05, 'draw') + S.fx('bang', 290, 236, 1) + S.lines(400, 220, K, 36, 0.35) + S.kana('ドンッ', 400, 90, 56, -6, '#f2c14e');
      if (k === 1) return S.bg({ pal: 3, horizon: 270 }) + S.prop('pine', 70, 290, 1, 200) + `<g opacity=".3">${S.prop('cabin', 400, 280, 1.3)}</g>` + watch(600, 160, 1) + `<path d="M260 220Q420 100 580 160" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="8 6"/>` + me(S, 220, 348, 1.05, 'point') + S.bust('ringo', 450, 140, 0.5) + S.bubble('Perhaps you are not inferior.', 470, 240, 200);
      if (k === '1:fail') return s + me(S, 300, 348, 1.1, 'point') + watch(354, 230, 1) + S.kana('6秒前', 520, 110, 50, -6, '#c8323c') + S.person('ringo', 600, 330, 0.8, 'arms', true);
    }, [0, 1, '1:fail']);

    add('blackmore_returns', 3, (S, k) => {
      const s = S.bg({ pal: 'night', sun: false }) + rain(0.9, true);
      if (k === 's') return s + S.person('blackmore', 400, 345, 1.1, 'arms') + S.stand('catchrainbow', 300, 280, 0.9) + mounted(S, 'deputy', 620, 345, 0.8, true, { coat: '#3a3a42' }) + me(S, 150, 348, 1, 'stand') + S.bubble('Sumimasen. It was cow bones. Very rude.', 430, 20, 230, 420, 150);
      if (k === 0) return s + S.person('blackmore', 540, 345, 1.05, 'point', true) + `<g stroke="#9fc7e8" stroke-width="4">${[0, 1, 2, 3].map(i => `<path d="M${480 - i * 30} ${190 + i * 16}L${300 - i * 20} ${220 + i * 10}"/>`).join('')}</g>` + me(S, 220, 348, 1.05, 'draw') + S.fx('blood', 240, 220, 1) + S.kana('ザシュッ', 400, 100, 50, -6, '#9fc7e8');
      if (k === 1) return s + S.person('blackmore', 450, 345, 1.05, 'stand') + paper(380, 220, 80, 60, -10, 0, '#c8a870') + me(S, 220, 348, 1.05, 'point') + S.caption('He bows, and walks away.', 480, 20, 240);
    }, [0, 1]);

    add('sandman_hunt', 3, (S, k) => {
      const s = S.bg({ pal: 3 }) + stoneWord(120, 320, 'DOGOOON') + stoneWord(700, 330, 'BAAANG') + stoneWord(260, 300, 'ZAAAN', 0.7) + stoneWord(560, 300, 'DOGOOON', 0.7) + S.person('sandman', 400, 250, 0.4);
      if (k === 's') return s + meRide(S, 400, 345, 1.05) + S.caption('Every stone for a mile has a word on it.');
      if (k === 0) return S.bg({ pal: 3 }) + [120, 700].map(x => `<g opacity=".7">${S.fx('dust', x, 300, 1.4)}</g>`).join('') + S.person('sandman', 560, 345, 1, 'point', true) + S.stand('silentway', 650, 280, 0.9) + me(S, 280, 348, 1.05, 'draw') + S.kana('バキッ', 120, 150, 50, -8);
      if (k === 1) return s + meRide(S, 400, 345, 1.05) + `<rect x="340" y="120" width="120" height="24" fill="${K}"/>` + S.kana('シーン…', 400, 90, 40, 0, '#fff');
      if (k === '1:fail') return s + meRide(S, 400, 345, 1.05) + S.fx('boom', 180, 250, 1.2) + S.kana('ドゴォォン', 400, 110, 60, -8, '#e8508a') + S.kana('ハクション', 520, 200, 26, 8);
    }, [0, 1, '1:fail']);

    add('tattoo_ambush', 4, (S, k) => {
      const s = S.bg({ pal: 4 }) + fog(250, 0.85);
      const breaths = (op) => [...Array(11)].map((_, i) => { const a = i / 11 * Math.PI * 2; const x = 400 + Math.cos(a) * 330, y = 220 + Math.sin(a) * 90; return `<g opacity="${op}">${S.bust('tattoo', x, y + 40, 0.5)}</g><ellipse cx="${x + 20}" cy="${y - 30}" rx="16" ry="9" fill="#fff" opacity=".85"/>`; }).join('');
      if (k === 's') return s + breaths(0.5) + me(S, 400, 348, 1.05, 'stand') + S.kana('スゥ…ハァ…', 400, 60, 36, 0, '#e8eef4');
      if (k === 0) return s + breaths(0.85) + me(S, 360, 348, 1.05, 'draw') + pal(S, 450, 348, 1, 'draw', true) + S.kana('ドドド', 400, 60, 50, -6, '#e8508a');
      if (k === 1) return S.bg({ pal: 4 }) + [...Array(10)].map((_, i) => S.bust('tattoo', 60 + i * 76, 300, 0.45)).join('') + `<path d="M${gyroOr() ? 200 : 200} 220L380 150L520 250L640 170" fill="none" stroke="#c8c8d8" stroke-width="3" stroke-dasharray="6 4"/>` + ball(640, 170, 12) + S.person('tattoo', 660, 345, 1, 'arms', true) + S.person(gyroOr(), 160, 348, 1.05, 'point') + S.kana('カンッ', 660, 100, 40);
      if (k === '1:fail') return s + [...Array(11)].map((_, i) => S.bust('tattoo', 400 + Math.cos(i * 0.57) * 200, 300 + Math.sin(i * 0.57) * 40, 0.6)).join('') + me(S, 400, 348, 1.05, 'arms') + S.kana('ジリ…', 400, 80, 44);
    }, [0, 1, '1:fail']);

    add('disco_grid', 5, (S, k) => {
      const s = S.bg({ pal: 'dusk', sunY: 215, sunX: 660, horizon: 250 }) + gridFloor(250);
      if (k === 's') return s + S.person('disco', 400, 320, 1, 'arms') + S.stand('chocolatedisco', 520, 260, 0.8) + me(S, 150, 350, 1.05) + S.kana('ディスコ', 400, 80, 40, -4, '#e8508a');
      if (k === 0) return s + S.person('disco', 540, 320, 1, 'point', true) + S.stand('chocolatedisco', 640, 260, 0.8) + me(S, 220, 350, 1.05, 'draw') + `<rect x="200" y="300" width="60" height="30" fill="#e8508a" opacity=".6"/>` + S.kana('B-4', 230, 120, 44, 0, '#e8508a');
      if (k === 1) return S.bg({ pal: 'dusk', sunY: 215, sunX: 660 }) + `<g opacity=".5">${gridFloor(250)}</g>` + `<path d="M0 340Q400 200 800 340" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="12 8"/>` + meRide(S, 400, 270, 0.7) + S.caption('The long way round.');
    }, [0, 1]);

    add('lucy_letter', 4, (S, k) => {
      const s = S.bg({ pal: 4 });
      if (k === 's') return s + pigeon(470, 280, 1.5, true) + paper(400, 140, 300, 110, -3, 0) + `<text x="400" y="120" font-size="17" text-anchor="middle" font-family="'Zen Antique',serif" fill="${K}" transform="rotate(-3 400 140)"><tspan x="400">They keep me on a train.</tspan><tspan x="400" dy="22">I can feel it. Please.</tspan><tspan x="400" dy="22">—L.</tspan></text>` + me(S, 160, 348, 1.05);
      if (k === 0) return s + S.prop('waterTower', 700, 300, 1) + S.prop('loco', 260, 300, 0.9) + S.prop('boxcar', 480, 300, 0.9) + S.bust('lucy', 470, 250, 0.5) + meRide(S, 640, 345, 0.9, true) + S.kana('ガタンゴトン', 360, 100, 36);
      if (k === 1) return s + S.person('steven', 360, 345, 1.05, 'point') + letter(440, 200, 1) + `<rect x="520" y="220" width="70" height="36" fill="#f2c14e" ${st}/><text x="555" y="243" font-size="12" text-anchor="middle" font-family="Anton,sans-serif" fill="${K}">TICKET</text>` + me(S, 160, 348, 1.05);
      if (k === 2) return s + fire(360, 330, 0.8) + pigeon(560, 90, 1.2) + me(S, 220, 348, 1.05);
    }, [0, 1, 2]);

    add('thread_thanks', 2, (S, k) => {
      const s = S.bg({ pal: 3 });
      const ribbon = (x, y) => `<path d="M${x} ${y}q20 -10 40 0q-10 20 -20 30q-10 -10 -20 -30z" fill="#e8508a" ${st}/>`;
      const racers = () => ['georgy', 'nellyville', 'dixie'].map((kk, i) => mounted(S, kk, 150 + i * 150, 345 - i * 6, 0.8, false, { coat: ['#b8703a', '#6a4a3a', '#e8d8c0'][i] })).join('');
      if (k === 's') return s + racers() + ribbon(160, 140) + me(S, 660, 348, 1.05, 'stand', true) + S.bubble("You could have taken it all. You didn't.", 260, 20, 230, 300, 170) + `<path d="M290 280q10 -10 20 0t20 0" fill="none" stroke="#e8508a" stroke-width="2.5" stroke-dasharray="3 3"/>`;
      if (k === 0) return s + S.person('georgy', 300, 345, 1, 'point') + crate(430, 345, 70, 50) + bottle(400, 290, 0.9) + me(S, 600, 348, 1.05, 'stand', true);
      if (k === 1) return s + meRide(S, 560, 345, 1) + racers().replace(/<svg/g, '<svg') + S.caption('The President\'s men keep their distance.');
    }, [0, 1]);

    add('gregorio_letter', 3, (S, k) => {
      const s = S.bg({ pal: 'dusk', sunY: 215, sunX: 660 }) + fire(620, 330, 0.8);
      if (k === 's') return s + S.person(gyroOr(), 300, 348, 1.1, 'point') + letter(370, 200, 1.2, -6, '#3a4a8a') + me(S, 520, 348, 1, 'stand', true) + S.bust('gregorio', 140, 130, 0.8) + S.caption('"Do not be late."', 20, 20, 180);
      if (k === 0) return s + S.person(gyroOr(), 300, 348, 1.1, 'stand') + me(S, 480, 348, 1.05, 'point', true) + S.bubble('He believes in the law.', 60, 30, 190, 290, 150);
      if (k === 1) return s + S.person(gyroOr(), 330, 348, 1.1, 'kneel') + paper(420, 290, 90, 60, 6, 1) + S.caption('He writes one line, and seals it.');
    }, [0, 1]);

    /* ---------------- world-state encounters ---------------- */
    add('ws_posse', undefined, (S, k) => {
      const s = S.bg({});
      const posse = (x0, n = 4, s2 = 0.75) => [...Array(n)].map((_, i) => mounted(S, i ? 'deputy' : 'marshal', x0 + i * 110, 345 - (i % 2) * 10, s2, false, { coat: ['#6a4a3a', '#8a6a4a', '#4a4a52', '#b8703a'][i % 4] })).join('');
      if (k === 's') return s + posse(90) + meRide(S, 640, 345, 0.85, true) + S.bubble("The President's men are ahead. We ride that way anyway.", 200, 20, 260, 140, 170);
      if (k === 0) return s + `<path d="M0 220Q200 150 400 190V250H0z" fill="#b8784a" ${st}/>` + [80, 180, 280].map(x => S.person('deputy', x, 200, 0.5, 'draw') + S.fx('bang', x + 30, 146, 0.6)).join('') + me(S, 600, 348, 1.05, 'draw', true) + S.person('agent', 450, 345, 0.9, 'down');
      if (k === 1) return s + posse(420, 3, 0.7) + [100, 200].map(x => S.person('agent', x, 345, 0.9, 'arms')).join('') + S.caption('They ride ahead and make arrests.');
      if (k === 2) return s + S.person('marshal', 300, 345, 1.05, 'point') + crate(420, 345) + me(S, 580, 348, 1.05, 'stand', true);
    }, [0, 1, 2]);

    add('ws_wanted', undefined, (S, k) => {
      const s = road(S);
      const four = [100, 200, 300, 400].map((x, i) => S.person(i ? 'bounty' : 'bounty', x, 345 - (i % 2) * 8, 0.9, i % 2 ? 'draw' : 'stand')).join('');
      if (k === 's') return s + four + poster(560, 140, 0.9) + S.bust(lead(), 560, 145, 0.36) + me(S, 680, 348, 1.05, 'stand', true) + S.bubble("Nothing personal. You're worth two hundred dollars.", 40, 20, 250, 200, 170);
      if (k === 0) return s + four + [150, 350].map(x => S.fx('bang', x + 40, 240, 0.8)).join('') + me(S, 640, 348, 1.1, 'draw', true) + S.kana('バンバン', 420, 80, 50, -6, '#f2c14e');
      if (k === 1) return s + S.person('bounty', 300, 345, 1.05, 'arms') + poster(330, 150, 0.7).replace('<g ', '<g opacity=".8" ') + `<path d="M330 90v120" stroke="#fff" stroke-width="5"/>` + bills(440, 230, 1.1) + me(S, 580, 348, 1.05, 'point', true) + S.kana('ビリッ', 330, 80, 44);
      if (k === 2) return S.bg({ pal: 'night', stars: true }) + building(300, 300, 300, 200, '#8a6a4a', 2, 1) + bars(200, 300, 160, 240) + meRide(S, 600, 345, 1.1) + S.kana('ニヤッ', 600, 100, 40, 0, '#f2c14e');
      if (k === '2:fail') return S.bg({ inside: true, pal: 'inside', horizon: 300 }) + me(S, 300, 348, 1.05, 'kneel') + bars(120, 520) + S.person('deputy', 660, 348, 1, 'point', true) + S.bubble('Fifty dollars. Pay up.', 540, 40, 170, 650, 150);
    }, [0, 1, 2, '2:fail']);

    add('ws_guides', 1, (S, k) => {
      const s = S.bg({});
      if (k === 's') return s + S.person('whisperer', 250, 345, 1, 'point') + S.person('sandman', 380, 345, 0.95, 'stand') + meRide(S, 620, 345, 1, true) + S.bubble("Sandman's people remember you.", 40, 20, 220, 250, 150);
      if (k === 0) return s + `<path d="M0 340Q200 260 400 300T800 280" fill="none" stroke="#5a8ac8" stroke-width="16"/><path d="M0 340Q200 260 400 300T800 280" fill="none" stroke="${K}" stroke-width="2"/>` + S.person('whisperer', 560, 330, 0.8, 'point') + S.person('sandman', 660, 330, 0.8, 'stand') + meRide(S, 330, 345, 1) + S.kana('タッタッ', 600, 100, 40);
      if (k === 1) return S.bg({ pal: 'night', stars: true }) + fire(400, 330, 1.1) + S.person('whisperer', 250, 345, 1, 'kneel') + me(S, 560, 348, 1, 'down') + cup(340, 320, 1, '#a8784a') + S.kana('Zzz', 600, 200, 36, 0, '#fff');
    }, [0, 1]);

    add('ws_warparty', 1, (S, k) => {
      const s = S.bg({ pal: 'dusk', sunY: 215, sunX: 660, horizon: 270 }) + `<path d="M0 200Q300 130 600 190L620 270H0z" fill="#8a4a3a" ${st}/>`;
      const riders = [...Array(4)].map((_, i) => mounted(S, 'whisperer', 100 + i * 120, 200, 0.55, false, { coat: ['#8a6a4a', '#e8d8c0', '#5a3a2a', '#b8703a'][i] })).join('');
      const arrow = (x, y) => `<path d="M${x - 60} ${y - 30}L${x} ${y}" stroke="${K}" stroke-width="4"/><path d="M${x - 64} ${y - 36}l-6 -6M${x - 60} ${y - 30}l-10 0" stroke="#c8323c" stroke-width="3"/>`;
      if (k === 's') return s + riders + ride(S, 560, 345, 1.05) + arrow(560, 260) + me(S, 330, 348, 1.05, 'arms') + S.kana('トスッ', 620, 190, 40);
      if (k === 0) return s + riders + [180, 300, 420].map((x, i) => arrow(x + 200, 180 + i * 30)).join('') + me(S, 650, 348, 1.1, 'draw', true) + S.kana('ヒュンヒュン', 400, 90, 44);
      if (k === 1) return s + riders + meRide(S, 600, 345, 1) + S.fx('coins', 460, 240, 1.3) + S.caption("It isn't forgiveness.");
    }, [0, 1]);

    add('ws_safehouse', 3, (S, k) => {
      const s = S.bg({ pal: 'night', stars: true }) + S.prop('farmhouse', 520, 290, 1.3);
      const cross = (x, y) => `<path d="M${x} ${y - 20}v40M${x - 12} ${y - 8}h24" stroke="#fff" stroke-width="5"/>`;
      if (k === 's') return s + cross(440, 200) + glow(600, 200, 30, '#ffd84a', 0.6) + S.person('abbess', 330, 345, 1, 'point') + me(S, 150, 348, 1.05);
      if (k === 0) return S.bg({ inside: true, pal: 'inside', horizon: 290 }) + fire(620, 320, 0.8) + me(S, 330, 330, 1, 'down') + S.person('abbess', 500, 345, 0.95, 'stand', true) + S.kana('Zzz', 330, 170, 36, 0, '#fff');
      if (k === 1) return s + S.person('abbess', 350, 345, 1, 'point') + me(S, 470, 348, 1.05, 'kneel', true) + S.fx('splash', 440, 200, 0.7) + S.lines(470, 200, '#fff3c0', 30, 0.4);
    }, [0, 1]);

    add('ws_inquisition', 3, (S, k) => {
      const s = S.bg({ pal: 'dusk', sunY: 215, sunX: 660 }) + S.prop('sign', 400, 300, 1, 'ROME', 'HERE');
      if (k === 's') return s + S.person('inquisitor', 320, 345, 1.1, 'point') + me(S, 600, 348, 1.05, 'stand', true) + S.bubble('Rome has sent me to correct one of those things.', 40, 20, 250, 320, 150);
      if (k === 0) return s + S.person('inquisitor', 280, 345, 1.1, 'draw') + S.fx('boom', 420, 220, 1) + me(S, 580, 348, 1.1, 'draw', true) + S.kana('ドドド', 420, 70, 50, -6, '#e8508a');
      if (k === 1) return s + S.person('inquisitor', 320, 345, 1.1, 'stand') + corpse(400, 230, 0.9) + `<path d="M360 222h80" stroke="#f6ecd8" stroke-width="10" opacity=".8"/>` + me(S, 580, 348, 1.05, 'stand', true) + S.caption('He leaves without another word.');
    }, [0, 1]);

    add('ws_racerscamp', 2, (S, k) => {
      const s = S.bg({ pal: 'night', stars: true }) + fire(400, 330, 1.2) + tent(90, 300, 0.9) + tent(720, 300, 0.9, '#f6ecd8');
      const ring = crowd(S, ['sloop', 'nellyville', 'dixie', 'georgy'], 170, 630, 300, 0.7);
      if (k === 's') return s + ring + me(S, 640, 348, 1, 'stand', true) + S.bubble("Here's the one who keeps helping people!", 60, 30, 240, 200, 200);
      if (k === 0) return s + ring + paper(400, 140, 200, 100, -3, 0, '#c8a870') + `<path d="M320 170q40 -40 80 0t80 -20" fill="none" stroke="#c8323c" stroke-width="3" stroke-dasharray="6 4"/>`;
      if (k === 1) return s + ring + crate(560, 340) + bottle(250, 340) + cup(300, 345) + S.caption('Everyone pools what they have.');
      if (k === 2) return s + S.person('sloop', 280, 345, 1, 'point') + S.person('dixie', 520, 345, 0.95, 'stand', true) + [0, 1, 2].map(i => S.bust('agent', 300 + i * 100, 130, 0.45)).join('') + S.bubble('Those three. Paid by Washington.', 40, 20, 220);
    }, [0, 1, 2]);

    add('ws_sabotage', 2, (S, k) => {
      const s = S.bg({});
      const girth = `<path d="M280 300q120 -30 240 0" fill="none" stroke="${K}" stroke-width="16"/><path d="M280 300q120 -30 240 0" fill="none" stroke="#8a5a30" stroke-width="10"/><path d="M392 280l20 20" stroke="#fff" stroke-width="4"/>`;
      if (k === 's') return s + girth + me(S, 180, 348, 1.05, 'kneel') + crowd(S, ['georgy', 'nellyville'], 600, 720, 300, 0.6) + S.kana('ギクッ', 400, 180, 44, 0, '#9fc7e8');
      if (k === 0) return s + S.person('georgy', 480, 345, 1, 'arms') + S.person('nellyville', 620, 345, 1, 'stand', true) + me(S, 250, 348, 1.05, 'point') + S.bubble("Prove it.", 500, 40, 100, 520, 150);
      if (k === 1) return s + girth.replace('stroke="#fff"', 'stroke="#f2c14e"') + me(S, 180, 348, 1.05, 'kneel') + S.kana('チクチク', 420, 200, 36);
    }, [0, 1]);

    add('ws_envoy', 2, (S, k) => {
      const s = S.bg({});
      const carriage = `<g transform="translate(300 330)"><path d="M-100 -30v-90h200v90z" fill="#2a3a6a" ${st}/><path d="M-110 -120h220l-10 -20h-200z" fill="#f2c14e" ${st}/><circle cx="0" cy="-80" r="20" fill="#f2c14e" ${st}/><path d="M-8 -86l8 -8l8 8v12h-16z" fill="#c8323c" stroke="${K}" stroke-width="1.5"/>${[-70, 70].map(x => `<circle cx="${x}" cy="-20" r="24" fill="#6a4a2a" ${st}/>`).join('')}</g>`;
      if (k === 's') return s + carriage + S.person('gregorio', 470, 345, 0.95, 'point') + me(S, 650, 348, 1.05, 'stand', true) + S.bubble('His Majesty has sent... encouragement.', 380, 20, 230, 470, 150);
      if (k === 0) return s + carriage + S.person('gregorio', 470, 345, 0.95, 'stand') + `<rect x="530" y="200" width="60" height="40" fill="#6a2a5a" ${st}/>` + glow(560, 220, 40, '#f2c14e', 0.4) + me(S, 650, 348, 1.05, 'point', true);
      if (k === 1) return s + carriage + S.person(gyroOr(), 560, 348, 1.1, 'stand', true) + S.bubble('The boy is alive. For now.', 400, 20, 200, 460, 170) + S.bust('marco', 700, 120, 0.5);
    }, [0, 1]);

    add('ws_pardon', 3, (S, k) => {
      const s = S.bg({ inside: true, pal: 'inside', horizon: 290 }) + table(400, 260, 300);
      if (k === 's') return s + briefcase(400, 258, 1.4, true) + S.person('agent', 220, 345, 1.05, 'point') + me(S, 600, 348, 1.05, 'stand', true) + S.bubble('Handsomely. And he will remember your name, kindly.', 40, 20, 260, 220, 150);
      if (k === 0) return s + briefcase(260, 258, 1.4) + [0, 1, 2].map(i => corpse(380 + i * 70, 250, 0.6, ['arm', 'eyes', 'legs'][i])).join('') + S.person('agent', 180, 345, 1, 'arms') + me(S, 620, 348, 1.05, 'stand', true) + (has('gyro') && lead() !== 'gyro' ? S.person('gyro', 730, 348, 0.95, 'stand') : '');
      if (k === 1) return s + briefcase(400, 258, 1.4) + S.person('agent', 220, 345, 1.05, 'stand') + me(S, 600, 348, 1.05, 'arms', true) + S.bubble('A pity.', 150, 40, 100, 220, 150) + S.kana('パタン', 400, 150, 40);
    }, [0, 1]);

    add('ws_marksmen', 3, (S, k) => {
      const s = S.bg({ horizon: 260 }) + [150, 400, 650].map(x => `<path d="M${x - 130} 260Q${x} 130 ${x + 130} 260z" fill="#b8784a" ${st}/>`).join('');
      if (k === 's') return s + [150, 400, 650].map(x => S.fx('spark', x, 170, 1.2)).join('') + me(S, 400, 348, 1.1, 'arms') + S.caption("These are not hired guns. They are his.");
      if (k === 0) return s + [150, 400, 650].map(x => S.person('sniper', x, 190, 0.4, 'draw') + S.fx('bang', x + 22, 146, 0.7)).join('') + me(S, 400, 348, 1.1, 'draw') + S.kana('ズドン', 400, 80, 50, -6, '#f2c14e');
      if (k === 1) return S.bg({ pal: 'night', stars: true }) + S.prop('mineMouth', 400, 300, 1.4) + me(S, 400, 330, 0.8, 'kneel') + S.caption('A day underground.');
    }, [0, 1]);

    /* ---------------- js/paths.js : trainers (one generator) ---------------- */
    const PATH_SET = {
      jockey: S => fence(0, 800, 320, 44, '#f6ecd8') + S.prop('flag', 700, 300, 1, '#c8323c'),
      nailgunner: S => `<rect x="560" y="200" width="24" height="100" fill="#9a6a3a" ${st}/>` + [0, 1, 2, 3, 4, 5].map(i => `<circle cx="${566 + (i % 2) * 12}" cy="${214 + i * 13}" r="3" fill="${K}"/>`).join(''),
      goldenheir: S => `<rect x="520" y="170" width="200" height="130" fill="#c8c0b0" ${st}/><path d="M680 240a40 40 0 1 1 -40 -40a25 25 0 1 1 25 25a15 15 0 1 1 -15 -15" fill="none" stroke="#f2c14e" stroke-width="4"/>`,
      executioner: S => `<g transform="translate(640 330)"><path d="M-90 -30v-80h180v80z" fill="#2a3a6a" ${st}/><circle cx="0" cy="-70" r="18" fill="#f2c14e" ${st}/>${[-60, 60].map(x => `<circle cx="${x}" cy="-20" r="22" fill="#6a4a2a" ${st}/>`).join('')}</g>`,
      physician: S => S.prop('wagon', 640, 320, 1.1),
      goldenrider: S => `<ellipse cx="400" cy="300" rx="360" ry="40" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>`,
      sheriff: S => S.prop('tree', 640, 310, 1.8, 90) + poster(640, 200, 0.5) + poster(690, 230, 0.4),
      lonesome: S => crowd(S, ['georgy', 'dixie', 'sloop', 'nellyville', 'miner'], 60, 760, 280, 0.45) + fence(0, 800, 330, 36),
      rancher: S => [...Array(6)].map((_, i) => S.T(470 + (i % 3) * 110, 270 + Math.floor(i / 3) * 40, 0.9, S.P().cow(), true)).join(''),
      sister: S => `<path d="M520 300v-140l80 -60l80 60v140z" fill="#8a7a6a" ${st}/><path d="M580 300v-60q20 -20 40 0v60z" fill="${K}"/>` + S.fx('smoke', 640, 80, 0.8) + [0, 1].map(i => S.person('abbess', 540 + i * 110, 330, 0.6)).join(''),
      fleshsprayer: S => S.prop('sign', 620, 300, 1, 'ROME', 'WEST'),
      corpsehunter: S => `<g transform="translate(600 300)"><rect x="-40" y="-60" width="80" height="60" fill="#f2c14e" ${st}/><path d="M-40 -60l40 -20l40 20" fill="#c8a040" ${st}/><path d="M0 -50v30M-10 -40h20" stroke="#c8323c" stroke-width="4"/></g>` + glow(600, 260, 50, '#fff3c0', 0.35),
    };
    Object.keys(PATH_SET).forEach(pid => {
      const ev = () => SBR.EVENTS.find(e => e.id === 'path_' + pid);
      if (!SBR.PATHS || !SBR.PATHS[pid]) return;
      add('path_' + pid, SBR.PATHS[pid].acts ? SBR.PATHS[pid].acts[0] : undefined, (S, k) => {
        const P = SBR.PATHS[pid], who = P.char, tr = (ev() && ev().art) || 'coach', c = P.color || '#f2c14e';
        const s = S.bg({}) + PATH_SET[pid](S);
        const trainer = (pose = 'stand', x = 520, f = true) => pid === 'goldenrider' ? mounted(S, tr, x, 345, 1, f, { coat: '#e8d8c0', mane: '#6a5a4a' }) : S.person(tr, x, 345, 1.05, pose, f);
        if (k === 's') return s + trainer('point') + S.person(who, 220, 348, 1.05) + S.bubble((ev() && ev().text || '').replace(/^[^"]*"|".*$/g, '').split(/(?<=[.!?])\s/)[0].slice(0, 70), 250, 20, 250, 500, 150);
        if (k === 0) return s + trainer('arms', 600) + `<circle cx="300" cy="250" r="120" fill="${c}" opacity=".25"/>` + S.lines(300, 220, c, 40, 0.5) + S.person(who, 300, 348, 1.2, 'point') + S.kana('覚醒', 300, 80, 60, -6, c) + S.caption('Path of the ' + P.name + '.', 520, 20, 260);
        if (k === '0:fail' || k === 1) return s + trainer('draw', 540) + S.person(who, 260, 348, 1.1, 'draw') + S.lines(400, 220, K, 36, 0.3) + S.kana(k === 1 ? '勝負' : 'まだだ', 400, 90, 56, -6, '#e8508a');
        if (k === 2) return s + trainer('stand', 500) + S.person(who, 300, 348, 1.05, 'point') + S.fx('spark', 400, 200, 1.4) + S.caption(ev() && ev().choices[2] ? ev().choices[2].ok.text.split(/(?<=[.!?])\s/)[0] : '', 20, 20, 300);
      }, [0, '0:fail', 1, 2]);
    });

    /* @@END */
  });
})();
