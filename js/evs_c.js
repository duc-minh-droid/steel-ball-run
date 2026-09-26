/* Illustrated encounter scenes (see js/evscene.js for the toolkit) */
'use strict';
/* Part C: side encounters (sd_*), Saint's Corpse encounters, custom-rider encounters, horse encounters, checkpoints. */
(() => {
  const E = SBR.evs, K = '#1a1020';
  const st = `stroke="${K}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const s2 = `stroke="${K}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
  const gT = (x, y, s, inner) => `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
  const lead = () => (SBR.run && SBR.run.lead) || 'johnny';
  const has = id => !!(SBR.run && SBR.run.party.some(m => m.id === id));
  /** one companion to stand behind the lead, if the party has one */
  const buddy = () => { const L = lead(); return ['gyro', 'johnny', 'hotpants', 'mountaintim', 'pocoloco', 'wekapipo', 'lucy'].find(id => id !== L && has(id)) || null; };
  const hk = h => (h ? { coat: h.coat, mane: h.mane, wrap: h.wrap, spots: h.spots } : {});
  const myHorse = () => hk(SBR.HORSES && SBR.run && SBR.HORSES[SBR.run.horse]);
  const horseByName = label => { const H = SBR.HORSES || {}; const k = Object.keys(H).find(k => label && label.includes(H[k].name)); return k ? hk(H[k]) : { coat: '#c89a5a', mane: '#6a3a1a' }; };
  const choiceLabel = (id, i) => { try { const e = SBR.EVENTS.find(x => x.id === id); return e && e.choices[i] ? e.choices[i].label : ''; } catch (e) { return ''; } };
  /** the lead (and one companion behind them) */
  const us = (S, x, y, s = 0.85, pose = 'stand', flip = false, bpose = 'stand') => {
    const b = buddy();
    return (b ? S.person(b, x + (flip ? 64 : -64) * s, y - 8, s * 0.9, bpose, flip) : '') + S.person(lead(), x, y, s, pose, flip);
  };
  const me = (S, x, y, s = 0.85, pose = 'stand', flip = false) => S.person(lead(), x, y, s, pose, flip);
  /** a rider on a horse: horse art plus the portrait head */
  const rider = (S, key, x, y, s = 1, flip = false, ho) => {
    const pc = (SBR.art.P && SBR.art.P[key]) || {};
    const o = Object.assign({}, ho || myHorse(), { rider: { body: pc.outfit || '#3b5bb5', cape: pc.outfit2 || '#3a8c4a', hat: pc.hatColor || pc.hair || '#5b3a8c', skin: pc.skin } });
    return S.horse(x, y, s, o, flip) + S.bust(key, x + (flip ? -6 : 6) * s, y - 96 * s, 0.42 * s, flip);
  };

  /* ---------- small drawings ---------- */
  const fire = (S, x, y, s = 1) => S.T(x, y, s, `<path d="M-32 0L30 -12M-32 -12L30 0" stroke="${K}" stroke-width="11" stroke-linecap="round"/><path d="M-32 0L30 -12M-32 -12L30 0" stroke="#7a4a24" stroke-width="6" stroke-linecap="round"/>
    <path d="M-24 -6Q-30 -44 -8 -62Q-10 -38 4 -46Q0 -74 16 -90Q34 -52 26 -6Z" fill="#e8742a" ${st}/><path d="M-12 -8Q-14 -30 0 -42Q4 -26 12 -32Q18 -18 12 -8Z" fill="#ffd84a"/>`);
  const tent = (S, x, y, s = 1, c = '#f6ecd8') => S.T(x, y, s, `<path d="M-100 0L0 -130L100 0Z" fill="${c}" ${st}/><path d="M0 -130L-26 0H26Z" fill="${K}" opacity=".75"/><path d="M0 -130V-150M-4 -150h14l-4 5 4 5H0" fill="#c8323c" ${s2}/>`);
  const relic = (...a) => { if (typeof a[0] === 'object') a.shift(); const [x, y, s = 1, glow = true] = a; return gT(x, y, s, (glow ? `<g opacity=".8"><circle r="52" fill="#ffd84a" opacity=".3"/><circle r="32" fill="#fff3c0" opacity=".5"/>${[...Array(10)].map((_, i) => { const a = i * Math.PI / 5; return `<path d="M${Math.cos(a) * 40} ${Math.sin(a) * 40}L${Math.cos(a) * 62} ${Math.sin(a) * 62}" stroke="#ffd84a" stroke-width="4"/>`; }).join('')}</g>` : '') +
    `<path d="M-34 6Q-42 -8 -26 -14L22 -20Q34 -22 36 -10Q38 2 26 6Z" fill="#8a5a34" ${st}/><path d="M-22 -14L-16 6M-8 -17L-2 6M6 -19L12 6" stroke="#e8d8b0" stroke-width="4"/>
    <path d="M36 -12l14 -9M37 -5l17 -3M35 1l13 6" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="M36 -12l14 -9M37 -5l17 -3M35 1l13 6" stroke="#b08050" stroke-width="3.5" stroke-linecap="round"/>`); };
  const stoneMask = (S, x, y, s = 1, eye = K) => S.T(x, y, s, `<path d="M-26 -30L-40 -46M-14 -38L-22 -56M0 -40V-60M14 -38L22 -56M26 -30L40 -46" stroke="${K}" stroke-width="4" stroke-linecap="round"/>
    <path d="M-28 -20Q-28 -44 0 -44Q28 -44 28 -20Q28 14 0 30Q-28 14 -28 -20Z" fill="#b8a888" ${st}/><path d="M6 -42Q28 -40 26 -14Q24 16 2 28Z" fill="${K}" opacity=".12"/>
    <path d="M-19 -18Q-11 -27 -4 -18Q-11 -12 -19 -18ZM4 -18Q11 -27 19 -18Q11 -12 4 -18Z" fill="${eye}" ${s2}/><path d="M-11 10Q0 2 11 10Q0 20 -11 10Z" fill="${K}"/><path d="M-4 -12L-2 2H2L4 -12" fill="none" ${s2}/>`);
  const bullet = (x, y, rot = 0, s = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-9 -4H3Q10 -4 13 0Q10 4 3 4H-9Z" fill="#d8b050" ${s2}/><path d="M-9 -4V4" stroke="${K}" stroke-width="2"/></g>`;
  const coins = (x, y, s = 1, n = 14) => `<g>${[...Array(n)].map((_, i) => { const r = Math.floor(Math.sqrt(i)); const dx = ((i * 37) % 9 - 4) * 9 * s * (1 + r * 0.2), dy = -r * 9 * s; return `<ellipse cx="${x + dx}" cy="${y + dy - (i % 3) * 2}" rx="${10 * s}" ry="${6 * s}" fill="#f2c14e" stroke="${K}" stroke-width="2"/>`; }).join('')}</g>`;
  const pile = (x, y, w, h) => `<path d="M${x - w} ${y}Q${x - w * 0.5} ${y - h} ${x} ${y - h}Q${x + w * 0.5} ${y - h} ${x + w} ${y}Z" fill="#f2c14e" ${st}/>${[...Array(12)].map((_, i) => `<ellipse cx="${x - w * 0.75 + (i * 53) % (w * 1.5)}" cy="${y - 8 - (i * 29) % (h * 0.7)}" rx="9" ry="5" fill="#ffe08a" stroke="${K}" stroke-width="1.5"/>`).join('')}`;
  const arrowhead = (x, y, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 -34L14 -2L5 -5V26H-5V-5L-14 -2Z" fill="#f2c14e" ${st}/><path d="M-3 -18Q0 -24 3 -18Q0 -10 -3 -18Z" fill="${K}"/><path d="M-5 6H5M-5 14H5" stroke="${K}" stroke-width="2"/></g>`;
  const hum = (x, y, r = 40, c = '#c8a0e8') => `<g fill="none" stroke="${c}" stroke-width="3" opacity=".8">${[1, 1.5, 2].map(k => `<circle cx="${x}" cy="${y}" r="${r * k}" stroke-dasharray="${8 * k} ${6 * k}"/>`).join('')}</g>`;
  const ripple = (x, y, r = 50, c = '#ffd84a') => `<g fill="none" stroke="${c}" stroke-width="4" opacity=".9">${[0.6, 1, 1.4].map(k => `<ellipse cx="${x}" cy="${y}" rx="${r * k}" ry="${r * k * 0.34}"/>`).join('')}</g>`;
  const sparkles = (x, y, w, h, c = '#ffd84a', n = 8) => [...Array(n)].map((_, i) => { const px = x + (i * 71) % w, py = y + (i * 43) % h, r = 6 + (i % 3) * 3; return `<path d="M${px} ${py - r}L${px + r * 0.3} ${py - r * 0.3}L${px + r} ${py}L${px + r * 0.3} ${py + r * 0.3}L${px} ${py + r}L${px - r * 0.3} ${py + r * 0.3}L${px - r} ${py}L${px - r * 0.3} ${py - r * 0.3}Z" fill="${c}" ${s2}/>`; }).join('');
  const paper = (x, y, w, h, rot = 0, lines = 4, head) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#f6ecd8" ${st}/>${head ? `<text x="0" y="${-h / 2 + 18}" font-size="14" font-family="Anton,Oswald,sans-serif" text-anchor="middle" fill="${K}">${S0.esc(head)}</text>` : ''}${[...Array(lines)].map((_, i) => `<path d="M${-w / 2 + 8} ${-h / 2 + (head ? 30 : 12) + i * 9}H${w / 2 - 8 - (i % 2) * 14}" stroke="${K}" stroke-width="1.6" opacity=".6"/>`).join('')}</g>`;
  const S0 = { esc: t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;') };
  const zzz = (x, y) => `<text x="${x}" y="${y}" font-size="26" font-family="Anton,Oswald,sans-serif" fill="#fff" stroke="${K}" stroke-width="3" paint-order="stroke">z<tspan dx="4" dy="-12" font-size="20">z</tspan><tspan dx="4" dy="-10" font-size="15">z</tspan></text>`;
  const sweat = (x, y) => `<path d="M${x} ${y}q-6 10 0 14q6 -4 0 -14z" fill="#9fd0f0" ${s2}/>`;
  const speed = (x0, x1, y0, y1, n = 7, c = K) => `<g stroke="${c}" stroke-width="3" opacity=".45">${[...Array(n)].map((_, i) => { const y = y0 + (y1 - y0) * i / Math.max(1, n - 1); const l = (x1 - x0) * (0.5 + (i % 3) * 0.2); return `<path d="M${x0} ${y}h${l}"/>`; }).join('')}</g>`;
  const table = (x, y, w, c = '#6a4a2a', top = '#3a7a4a') => `<path d="M${x - w / 2 + 10} ${y - 44}V${y}M${x + w / 2 - 10} ${y - 44}V${y}" stroke="${K}" stroke-width="8"/><path d="M${x - w / 2 + 10} ${y - 44}V${y}M${x + w / 2 - 10} ${y - 44}V${y}" stroke="${c}" stroke-width="4"/><rect x="${x - w / 2}" y="${y - 56}" width="${w}" height="14" fill="${top}" ${st}/>`;
  const card = (x, y, rot = 0, face = '♠', red) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-10" y="-14" width="20" height="28" rx="3" fill="#fff" ${s2}/><text x="0" y="5" font-size="14" text-anchor="middle" fill="${red ? '#c8323c' : K}">${face}</text></g>`;
  const building = (x, y, w, h, c = '#b8784a', sign) => `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${c}" ${st}/><rect x="${x - 8}" y="${y - h - 16}" width="${w + 16}" height="18" fill="${c}" ${st}/>${sign ? `<rect x="${x + w * 0.15}" y="${y - h + 10}" width="${w * 0.7}" height="24" fill="#f6ecd8" ${s2}/><text x="${x + w / 2}" y="${y - h + 28}" font-size="15" font-family="Anton,Oswald,sans-serif" text-anchor="middle" fill="${K}">${S0.esc(sign)}</text>` : ''}<path d="M${x} ${y - h + 44}H${x + w}" stroke="${K}" stroke-width="2" opacity=".5"/>`;
  const win = (x, y, w, h, c = '#9fc7e8') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" ${st}/><path d="M${x + w / 2} ${y}V${y + h}M${x} ${y + h / 2}H${x + w}" stroke="${K}" stroke-width="2.5"/>`;
  const door = (x, y, w, h) => `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="#4a2a1a" ${st}/><circle cx="${x + w - 8}" cy="${y - h / 2}" r="3" fill="#f2c14e"/>`;
  const rope = (x0, y0, x1, y1, sag = 20) => `<path d="M${x0} ${y0}Q${(x0 + x1) / 2} ${Math.max(y0, y1) + sag} ${x1} ${y1}" fill="none" stroke="${K}" stroke-width="5"/><path d="M${x0} ${y0}Q${(x0 + x1) / 2} ${Math.max(y0, y1) + sag} ${x1} ${y1}" fill="none" stroke="#c8a060" stroke-width="2.5" stroke-dasharray="5 3"/>`;
  const whiteFlag = (x, y, h = 120) => `<path d="M${x} ${y}V${y - h}" stroke="${K}" stroke-width="5"/><path d="M${x} ${y - h}Q${x + 30} ${y - h - 10} ${x + 60} ${y - h}V${y - h + 38}Q${x + 30} ${y - h + 28} ${x} ${y - h + 38}Z" fill="#fff" ${st}/>`;
  const barrel = (S, x, y, s = 1) => S.prop('barrel', x, y, s);
  const hayloft = (x, y) => `<path d="M${x} ${y}V${y - 150}L${x + 110} ${y - 210}L${x + 220} ${y - 150}V${y}Z" fill="#b8423a" ${st}/><rect x="${x + 80}" y="${y - 170}" width="60" height="50" fill="${K}"/><path d="M${x + 84} ${y - 122}q26 -18 52 0z" fill="#e8c860" ${s2}/>`;
  const star = (x, y, r, c = '#ffd84a') => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1); } return `<path d="${d}Z" fill="${c}" ${s2}/>`; };

  /* ---------- Stand stand-ins for Stands without art in stands.js ---------- */
  const hangedMan = (S, x, y, s = 1, flip) => S.T(x, y, s, `<path d="M-10 0L-8 -56M10 0L8 -56" stroke="${K}" stroke-width="10" stroke-linecap="round"/><path d="M-10 0L-8 -56M10 0L8 -56" stroke="#d8d0c0" stroke-width="6" stroke-linecap="round"/>
    <path d="M-20 -120Q0 -128 20 -120L14 -54H-14Z" fill="#d8d0c0" ${st}/><path d="M-18 -110L18 -100M-17 -96L16 -86M-15 -80L15 -72M-14 -66L14 -60" stroke="${K}" stroke-width="1.6" opacity=".7"/>
    <path d="M-16 -156Q0 -168 16 -156L18 -128Q0 -118 -18 -128Z" fill="#d8d0c0" ${st}/><path d="M-17 -148H17M-18 -136H18" stroke="${K}" stroke-width="1.5" opacity=".7"/><circle cx="-6" cy="-142" r="3" fill="#c8323c"/><circle cx="6" cy="-142" r="3" fill="#c8323c"/>
    <path d="M18 -112L50 -92" stroke="${K}" stroke-width="10" stroke-linecap="round"/><path d="M18 -112L50 -92" stroke="#d8d0c0" stroke-width="6" stroke-linecap="round"/><path d="M50 -94L88 -80L52 -86Z" fill="#e8eef8" ${st}/>`, flip);
  const reaper = (S, x, y, s = 1, flip) => S.T(x, y, s, `<path d="M70 -200Q110 -210 130 -170Q100 -186 72 -180Z" fill="#c8c8d8" ${st}/><path d="M72 -196L40 20" stroke="${K}" stroke-width="9"/><path d="M72 -196L40 20" stroke="#8a5a34" stroke-width="5"/>
    <path d="M-50 0Q-40 -110 0 -130Q40 -110 50 0Z" fill="#4a2a6a" ${st}/><path d="M-30 -10L-20 -90M20 -10L10 -90" stroke="${K}" stroke-width="2" opacity=".4"/>
    <circle cx="0" cy="-150" r="34" fill="#f6f2f8" ${st}/><path d="M-24 -174L-14 -210L0 -180L14 -210L24 -174" fill="#c8323c" ${st}/><circle cx="-12" cy="-156" r="7" fill="${K}"/><circle cx="12" cy="-156" r="7" fill="${K}"/><circle cx="0" cy="-142" r="6" fill="#c8323c" ${s2}/>
    <path d="M-18 -130Q0 -118 18 -130" fill="none" stroke="${K}" stroke-width="3"/><path d="M-14 -128l4 5 4 -5 4 5 4 -5 4 5" fill="none" stroke="${K}" stroke-width="1.6"/>
    <path d="M40 -90L66 -110" stroke="${K}" stroke-width="10" stroke-linecap="round"/><path d="M40 -90L66 -110" stroke="#4a2a6a" stroke-width="6" stroke-linecap="round"/>`, flip);
  const blob = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-60 0Q-70 -40 -40 -56Q-36 -90 0 -86Q34 -94 42 -58Q72 -44 62 0Z" fill="#f2c830" ${st}/>${[[-30, -30, 7], [24, -20, 5], [10, -60, 6], [-44, -10, 4]].map(([a, b, r]) => `<circle cx="${a}" cy="${b}" r="${r}" fill="#fff8c0" stroke="${K}" stroke-width="1.4"/>`).join('')}<circle cx="-14" cy="-50" r="7" fill="#fff" ${s2}/><circle cx="12" cy="-52" r="7" fill="#fff" ${s2}/><circle cx="-13" cy="-49" r="3" fill="${K}"/><circle cx="11" cy="-51" r="3" fill="${K}"/><path d="M-18 -30Q0 -14 20 -30Q0 -22 -18 -30Z" fill="#8a2a2a" ${s2}/></g>`;
  const plane = (x, y, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-40 -2Q-10 -14 30 -8Q44 -4 44 2Q30 8 -10 8Q-34 8 -40 -2Z" fill="#5a8a3a" ${st}/><path d="M-8 -2L-20 -34H-6L12 -2Z" fill="#4a7a30" ${st}/><path d="M-8 4L-18 30H-4L12 4Z" fill="#4a7a30" ${st}/><path d="M-40 -2L-50 -18H-40L-30 -4Z" fill="#4a7a30" ${st}/><circle cx="16" cy="-4" r="5" fill="#9fd0f0" ${s2}/><path d="M30 2l6 -3 0 6z" fill="#fff" ${s2}/><path d="M44 -14V18" stroke="${K}" stroke-width="4"/><ellipse cx="44" cy="2" rx="3" ry="18" fill="#c8c8d8" opacity=".6"/><circle cx="-12" cy="-16" r="4" fill="#c8323c"/></g>`;
  const pistol = (x, y, s = 1, n = 1, mood = 'cry') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-8 0L-10 12M8 0L10 12" stroke="${K}" stroke-width="3"/><ellipse cx="0" cy="-2" rx="8" ry="7" fill="#f2c14e" ${s2}/><circle cx="0" cy="-16" r="10" fill="#f2c14e" ${s2}/><path d="M-10 -18Q0 -32 10 -18Z" fill="#e8e0c8" ${s2}/><text x="0" y="-21" font-size="8" text-anchor="middle" font-family="Anton,sans-serif" fill="${K}">${n}</text><circle cx="-4" cy="-15" r="1.8" fill="${K}"/><circle cx="4" cy="-15" r="1.8" fill="${K}"/>${mood === 'cry' ? `<path d="M-5 -12v6M5 -12v6" stroke="#6ab0e8" stroke-width="2"/><path d="M-3 -9q3 -2 6 0" fill="none" stroke="${K}" stroke-width="1.4"/>` : mood === 'scream' ? `<ellipse cx="0" cy="-9" rx="3" ry="3.5" fill="${K}"/>` : `<path d="M-4 -10q4 4 8 0" fill="none" stroke="${K}" stroke-width="1.6"/>`}</g>`;
  const toySoldier = (x, y, s = 1, flash) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-3 0V-10M3 0V-10" stroke="${K}" stroke-width="3"/><rect x="-5" y="-22" width="10" height="13" fill="#4a6a3a" ${s2}/><circle cy="-27" r="5" fill="#e8c0a0" ${s2}/><path d="M-6 -29Q0 -36 6 -29Z" fill="#3a4a2a" ${s2}/><path d="M4 -18L16 -24" stroke="${K}" stroke-width="3"/>${flash ? `<circle cx="19" cy="-25" r="4" fill="#fff3c0" ${s2}/>` : ''}</g>`;
  const tank = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-20" y="-10" width="40" height="10" rx="5" fill="#3a3a2a" ${s2}/><rect x="-16" y="-20" width="32" height="10" fill="#5a6a3a" ${s2}/><rect x="-8" y="-28" width="14" height="8" fill="#5a6a3a" ${s2}/><path d="M6 -24H26" stroke="${K}" stroke-width="3"/></g>`;
  const heli = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="14" ry="8" fill="#5a6a3a" ${s2}/><path d="M12 0H34M34 -6V6" stroke="${K}" stroke-width="3"/><path d="M-26 -12H26M0 -12V-8" stroke="${K}" stroke-width="3"/><circle cx="-6" cy="-1" r="4" fill="#9fd0f0" ${s2}/></g>`;
  const bug = (x, y, s = 1, coin = true) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-6 -2l-6 -4M-6 3l-7 2M6 -2l6 -4M6 3l7 2" stroke="${K}" stroke-width="1.6"/><ellipse cx="0" cy="0" rx="7" ry="9" fill="#f2c14e" ${s2}/><path d="M-7 -2h14M-7 3h14" stroke="${K}" stroke-width="1.8"/><circle cx="-2.5" cy="-5" r="1.4" fill="${K}"/><circle cx="2.5" cy="-5" r="1.4" fill="${K}"/>${coin ? `<ellipse cx="0" cy="-15" rx="6" ry="4" fill="#ffe08a" ${s2}/>` : ''}</g>`;
  const moody = (S, x, y, s = 1, face, flip, t = '12:07') => S.T(x, y, s, `<path d="M-10 0L-12 -56M10 0L12 -56" stroke="${K}" stroke-width="12" stroke-linecap="round"/><path d="M-10 0L-12 -56M10 0L12 -56" stroke="#8a5ac8" stroke-width="7" stroke-linecap="round"/>
    <path d="M-22 -120Q0 -130 22 -120L16 -54H-16Z" fill="#8a5ac8" ${st}/><path d="M-6 -110h12v30h-12z" fill="#c8a0e8" ${s2}/><path d="M-20 -112L-40 -70M20 -112L44 -86" stroke="${K}" stroke-width="11" stroke-linecap="round"/><path d="M-20 -112L-40 -70M20 -112L44 -86" stroke="#8a5ac8" stroke-width="6" stroke-linecap="round"/>
    ${face ? '' : `<ellipse cx="0" cy="-150" rx="22" ry="28" fill="#8a5ac8" ${st}/><rect x="-18" y="-176" width="36" height="14" fill="#1a1020" stroke="#c8a0e8" stroke-width="2"/><text x="0" y="-165" font-size="11" text-anchor="middle" font-family="monospace" fill="#8aff8a">${t}</text><path d="M-12 -150h8M4 -150h8" stroke="#fff" stroke-width="3"/>`}`, flip)
    + (face ? S.bust(face, x, y - 108 * s, 0.62 * s, flip) + `<rect x="${x - 18 * s}" y="${y - 186 * s}" width="${36 * s}" height="${14 * s}" fill="#1a1020" stroke="#c8a0e8" stroke-width="2"/><text x="${x}" y="${y - 175 * s}" font-size="${11 * s}" text-anchor="middle" font-family="monospace" fill="#8aff8a">${t}</text><rect x="${x - 30 * s}" y="${y - 176 * s}" width="${60 * s}" height="${70 * s}" fill="#8a5ac8" opacity=".35"/>` : '');
  const pillar = (x, y, s = 1, crack, open) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-44 0V-210H44V0Z" fill="#a8a098" ${st}/><rect x="-54" y="-226" width="108" height="18" fill="#b8b0a8" ${st}/><rect x="-54" y="-14" width="108" height="14" fill="#b8b0a8" ${st}/>
    ${[-170, -40].map(yy => `<circle cx="-26" cy="${yy}" r="9" fill="none" stroke="${K}" stroke-width="2"/><path d="M-26 ${yy - 16}v6M-26 ${yy + 10}v6M-42 ${yy}h6M-16 ${yy}h6" stroke="${K}" stroke-width="2"/><circle cx="26" cy="${yy + 20}" r="9" fill="none" stroke="${K}" stroke-width="2"/><path d="M26 ${yy + 4}v6M26 ${yy + 30}v6M10 ${yy + 20}h6M36 ${yy + 20}h6" stroke="${K}" stroke-width="2"/>`).join('')}
    ${open ? '' : `<path d="M-20 -130Q-20 -150 0 -150Q20 -150 20 -130Q20 -100 0 -92Q-20 -100 -20 -130Z" fill="#b8b0a0" ${s2}/><path d="M-12 -128h8M4 -128h8M-6 -108q6 4 12 0" stroke="${K}" stroke-width="2.4" fill="none"/>`}
    ${crack ? `<path d="M-6 -210L6 -170L-8 -130L10 -90L-4 -40L6 0" fill="none" stroke="${K}" stroke-width="4"/>` : ''}<path d="M18 -210V0" stroke="${K}" stroke-width="2" opacity=".3"/></g>`;
  const emperorGun = (x, y, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 -6H44V4H12L8 18H-4Z" fill="#f2c14e" ${st}/><circle cx="14" cy="-1" r="6" fill="#e8a820" ${s2}/><path d="M44 -8v14" stroke="${K}" stroke-width="3"/></g>`;
  const zHorse = (S, x, y, s = 1, flip) => S.horse(x, y, s, { coat: '#8a8a78', mane: '#2a2a1a', wrap: '#3a1a1a' }, flip) + `<circle cx="${x + (flip ? -1 : 1) * 64 * s}" cy="${y - 110 * s}" r="${6 * s}" fill="#ff3040" stroke="${K}" stroke-width="2"/><path d="M${x - 30 * s} ${y - 90 * s}l10 8 10 -8 10 8 10 -8" fill="none" stroke="${K}" stroke-width="2.4"/>`;
  const trough = (x, y, w = 150, refl = '') => `<path d="M${x - w / 2 + 10} ${y}V${y + 12}M${x + w / 2 - 10} ${y}V${y + 12}" stroke="${K}" stroke-width="6"/><path d="M${x - w / 2} ${y - 46}H${x + w / 2}L${x + w / 2 - 10} ${y}H${x - w / 2 + 10}Z" fill="#8a5a34" ${st}/><rect x="${x - w / 2 + 8}" y="${y - 44}" width="${w - 16}" height="12" fill="#9fd0f0" ${s2}/>${refl}`;
  const waterfall = (x, w, y0, y1) => `<rect x="${x - w / 2}" y="${y0}" width="${w}" height="${y1 - y0}" fill="#9fd0f0" ${st}/>${[...Array(6)].map((_, i) => `<path d="M${x - w / 2 + 8 + i * (w - 16) / 5} ${y0 + 4}V${y1 - 4}" stroke="#fff" stroke-width="3" opacity=".8" stroke-dasharray="30 12" stroke-dashoffset="${i * 9}"/>`).join('')}`;
  const cliff = (x, w, y) => `<path d="M${x - w / 2 - 60} ${y}H${x + w / 2 + 60}V360H${x - w / 2 - 60}Z" fill="#8a7a6a" ${st}/>`;
  const iceHole = (x, y, rx = 40) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.32}" fill="#2a4a6a" ${st}/><ellipse cx="${x}" cy="${y - 2}" rx="${rx * 0.6}" ry="${rx * 0.15}" fill="#3a6a8a"/>`;
  const barn = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0V-110L70 -160L140 -110V0Z" fill="#b8423a" ${st}/><path d="M30 0V-60H110V0M30 -60L110 0M110 -60L30 0" fill="none" stroke="#f6ecd8" stroke-width="5"/><path d="M0 -110L70 -160L140 -110" fill="none" stroke="#f6ecd8" stroke-width="4"/><path d="M-6 -106L70 -166L146 -106" fill="none" stroke="#fff" stroke-width="8" opacity=".9"/></g>`;
  const snowGround = () => `<path d="M0 262Q200 250 400 262T800 258V360H0Z" fill="#f6fbff" ${st}/>`;
  const fence = (x0, x1, y, c = '#9a6a3a') => { let s = ''; for (let x = x0; x <= x1; x += 44) s += `<rect x="${x - 4}" y="${y - 54}" width="8" height="56" fill="${c}" ${s2}/>`; return s + `<path d="M${x0} ${y - 44}H${x1}M${x0} ${y - 22}H${x1}" stroke="${K}" stroke-width="8"/><path d="M${x0} ${y - 44}H${x1}M${x0} ${y - 22}H${x1}" stroke="${c}" stroke-width="4"/>`; };
  const bundle = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 0Q-36 -20 -20 -26H20Q36 -20 30 0Z" fill="#c8b890" ${st}/><path d="M-20 -26L-10 0M0 -26L8 0M16 -26L22 0" stroke="${K}" stroke-width="1.6" opacity=".6"/></g>`;
  const cot = (x, y, w = 120) => `<rect x="${x - w / 2}" y="${y - 30}" width="${w}" height="14" fill="#e8e0c8" ${st}/><path d="M${x - w / 2 + 6} ${y - 16}L${x - w / 2 + 16} ${y}M${x + w / 2 - 6} ${y - 16}L${x + w / 2 - 16} ${y}" stroke="${K}" stroke-width="4"/>`;
  const camera = (x, y, s = 1, flash) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-20 0L-4 -60M20 0L4 -60M0 0V-60" stroke="${K}" stroke-width="4"/><rect x="-22" y="-92" width="44" height="34" fill="#3a2a1a" ${st}/><circle cx="24" cy="-76" r="9" fill="#c8c8d8" ${st}/><path d="M-8 -92V-110M-16 -110H0" stroke="${K}" stroke-width="4"/>${flash ? `<path d="M-8 -126l10 -20 4 14 16 -6 -10 18z" fill="#fff3c0" ${st}/>` : ''}</g>`;
  const clock = (x, y, r = 30, hrs = 0) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f6ecd8" ${st}/><path d="M${x} ${y}V${y - r * 0.7}M${x} ${y}L${x + Math.cos(hrs) * r * 0.5} ${y + Math.sin(hrs) * r * 0.5}" stroke="${K}" stroke-width="3"/><path d="M${x} ${y - r}v6M${x + r} ${y}h-6M${x} ${y + r}v-6M${x - r} ${y}h6" stroke="${K}" stroke-width="2"/>`;
  const stove = (x, y) => `<rect x="${x - 30}" y="${y - 70}" width="60" height="70" rx="6" fill="#3a3a4a" ${st}/><rect x="${x - 18}" y="${y - 50}" width="36" height="26" fill="#e8742a" ${s2}/><path d="M${x - 10} ${y - 24}q2 -20 10 -24q2 12 8 6q2 10 -4 18z" fill="#ffd84a"/><rect x="${x - 8}" y="${y - 130}" width="16" height="60" fill="#3a3a4a" ${st}/>`;
  const halberd = (x, y, h = 170) => `<path d="M${x} ${y}V${y - h}" stroke="${K}" stroke-width="6"/><path d="M${x} ${y}V${y - h}" stroke="#8a5a34" stroke-width="3"/><path d="M${x} ${y - h - 20}L${x + 5} ${y - h}H${x - 5}Z M${x} ${y - h + 4}Q${x + 26} ${y - h - 4} ${x + 24} ${y - h + 24}Q${x + 12} ${y - h + 14} ${x} ${y - h + 20}Z" fill="#d0d4e0" ${s2}/>`;
  const carriage = (x, y, s = 1, c = '#3a2a4a') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-80 -30V-110Q0 -130 80 -110V-30Z" fill="${c}" ${st}/>${win(-60, -100, 40, 34, '#f6d8a0')}${win(20, -100, 40, 34, '#f6d8a0')}<path d="M-90 -30H90" stroke="${K}" stroke-width="6"/><circle cx="-54" cy="-18" r="24" fill="none" stroke="${K}" stroke-width="7"/><circle cx="-54" cy="-18" r="24" fill="none" stroke="#c8a040" stroke-width="3"/><circle cx="54" cy="-18" r="24" fill="none" stroke="${K}" stroke-width="7"/><circle cx="54" cy="-18" r="24" fill="none" stroke="#c8a040" stroke-width="3"/><path d="M-12 -126h24M0 -138v24" stroke="#f2c14e" stroke-width="5"/></g>`;
  const reliquary = (x, y, s = 1, full) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 -34L-44 -64H44L40 -34Z" fill="#d0d4e0" ${st}/><rect x="-40" y="-34" width="80" height="34" fill="#c8c8d8" ${st}/><rect x="-34" y="-30" width="68" height="24" fill="#8a1a2a" ${s2}/><path d="M-6 -56h12M0 -62v12" stroke="${K}" stroke-width="3"/>${full ? '' : ''}</g>`;
  const grave = (x, y, num = '') => `<path d="M${x - 50} ${y}Q${x} ${y - 36} ${x + 50} ${y}Z" fill="#8a7a6a" ${st}/>${[[-30, -6], [-10, -16], [12, -14], [30, -6], [0, -24]].map(([a, b]) => `<ellipse cx="${x + a}" cy="${y + b}" rx="12" ry="8" fill="#a8a098" ${s2}/>`).join('')}<rect x="${x - 16}" y="${y - 86}" width="32" height="70" fill="#b8844a" ${st}/><path d="M${x - 30} ${y - 70}H${x + 30}" stroke="${K}" stroke-width="11"/><path d="M${x - 30} ${y - 70}H${x + 30}" stroke="#b8844a" stroke-width="7"/>${num ? `<text x="${x}" y="${y - 40}" font-size="16" text-anchor="middle" font-family="Anton,sans-serif" fill="${K}">${num}</text>` : ''}`;
  const anvil = (x, y) => `<path d="M${x - 40} ${y - 44}H${x + 30}Q${x + 50} ${y - 44} ${x + 56} ${y - 36}H${x + 20}L${x + 14} ${y - 22}H${x + 24}V${y}H${x - 30}V${y - 22}H${x - 20}L${x - 26} ${y - 34}Q${x - 40} ${y - 36} ${x - 40} ${y - 44}Z" fill="#4a4a5a" ${st}/>`;
  const horseshoe = (x, y, s = 1, c = '#c8c8d8') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 12Q-20 -16 0 -18Q20 -16 14 12" fill="none" stroke="${K}" stroke-width="10" stroke-linecap="round"/><path d="M-14 12Q-20 -16 0 -18Q20 -16 14 12" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/></g>`;
  const saddlebag = (x, y, s = 1, open) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 -40H30L34 0H-34Z" fill="#8a5a30" ${st}/><path d="M-30 -40Q0 ${open ? -64 : -20} 30 -40" fill="#6a4020" ${st}/><circle cx="0" cy="-22" r="4" fill="#f2c14e" ${s2}/></g>`;
  const lanternGlow = (x, y) => `<circle cx="${x}" cy="${y}" r="60" fill="#ffd84a" opacity=".22"/><circle cx="${x}" cy="${y}" r="30" fill="#fff3c0" opacity=".3"/>`;
  const night = S => S.bg({ pal: 'night', stars: true });
  const fx2 = (S, k, x, y, s) => S.fx(k, x, y, s);
  void fx2; void barrel;

  /* =================================================================== SIDE ENCOUNTERS */

  /* ----- The Emperor: a card sharp with a gun that grows from his palm ----- */
  {
    const base = S => S.bg({ horizon: 250 }) + tent(S, 400, 250, 2.4, '#e8d8b0') + `<rect x="0" y="250" width="800" height="110" fill="#c89a5a" opacity=".5"/>` + S.prop('lantern', 300, 120, 1) + S.prop('pole', 170, 300, 1.8);
    const laramie = (S, pose = 'stand', x = 480) => S.person('sd_laramie', x, 300, 0.9, pose, true);
    E.add('sd_emperor', {
      act: 1,
      scene: S => base(S) + laramie(S, 'draw') + emperorGun(410, 190, 1.2, 180) + table(470, 330, 220) + card(420, 280, -10) + card(450, 278, 6, '♥', true) + card(500, 280, -4, 'A') +
        S.person('thug', 690, 316, 0.9, 'draw', true) + `<path d="M396 186Q250 170 180 130Q140 100 220 70Q420 40 650 124" fill="none" stroke="${K}" stroke-width="3" stroke-dasharray="10 7"/>` + bullet(650, 124, 20, 1.4) +
        `<path d="M690 136l30 -30 16 10" fill="#3a2a1a" ${st}/>` + S.kana('ギュン', 260, 60, 42, -10, '#f2c14e') + S.bubble('Anyone else?', 520, 42, 130, 500, 110),
      out: {
        0: S => base(S) + laramie(S, 'arms') + table(430, 330, 300) + card(360, 280, -12, 'A') + card(390, 278, 4, 'A', true) + card(420, 280, 10, 'A') + coins(560, 280, 1.2) + S.person(lead(), 250, 316, 0.9, 'point') +
          S.lines(420, 250, '#fff', 30, 0.5) + S.kana('リバー!', 330, 80, 46, -8, '#ffd84a') + S.bubble('Won \'em off a Frenchman. Nobody\'s beaten me since!', 520, 42, 230, 500, 118),
        '0:fail': S => base(S) + S.lines(480, 200, K, 40, 0.3) + laramie(S, 'draw', 560) + emperorGun(620, 190, 1.3) + `<path d="M660 188Q560 80 420 110Q300 140 290 190" fill="none" stroke="${K}" stroke-width="3" stroke-dasharray="10 7"/>` + bullet(294, 190, 110, 1.4) +
          us(S, 250, 316, 0.9, 'draw') + card(420, 320, 30) + card(460, 330, -40) + S.kana('ドン!', 420, 80, 60, -10, '#fff'),
        1: S => base(S) + laramie(S, 'draw') + emperorGun(410, 190, 1.2, 180) + table(470, 330, 220) + us(S, 230, 316, 0.9, 'point') + S.lines(420, 170, K, 30, 0.25) + S.bubble('Big words.', 540, 42, 110, 520, 110) + S.kana('ゴゴゴ', 700, 110, 36, 8, '#c8a0e8'),
        2: S => base(S) + laramie(S, 'stand') + table(420, 330, 260) + `<rect x="330" y="258" width="22" height="18" fill="#fff" ${s2}/><rect x="470" y="258" width="22" height="18" fill="#fff" ${s2}/><path d="M336 252q3 -8 0 -14M476 252q3 -8 0 -14" stroke="#8a8090" stroke-width="2" fill="none"/>` + S.person(lead(), 250, 316, 0.9, 'stand') +
          S.bubble('Never be Number One. Number Two lives longer.', 460, 42, 240, 480, 112) + S.kana('2', 740, 200, 70, 10, '#f2c14e'),
      },
    });
  }

  /* ----- Harvest: a boy and five hundred coin-carrying Stands ----- */
  {
    const church = `<path d="M470 250V120L560 60L650 120V250Z" fill="#e8d8c0" ${st}/><path d="M540 60V20H580V60" fill="#e8d8c0" ${st}/><path d="M560 0V20M552 8H568" stroke="${K}" stroke-width="4"/>${door(535, 250, 50, 80)}<path d="M450 250H670V270H450Z" fill="#b8a890" ${st}/><path d="M440 270H680V290H440Z" fill="#b8a890" ${st}/>`;
    const swarm = (x0, y0, x1, y1, n = 18, coin = true) => [...Array(n)].map((_, i) => bug(x0 + ((x1 - x0) * ((i * 37) % n)) / n, y0 + ((y1 - y0) * ((i * 53) % n)) / n, 0.9 + (i % 3) * 0.15, coin)).join('');
    E.add('sd_harvest', {
      act: 1,
      scene: S => S.bg({}) + church + `<path d="M0 300H800" stroke="${K}" stroke-width="2" opacity=".3"/>` + pile(560, 290, 70, 50) + S.person('sd_coinboy', 560, 262, 0.7, 'kneel') + swarm(80, 290, 440, 340, 22) + `<path d="M40 330H440" stroke="#8a5a34" stroke-width="16"/>` +
        me(S, 150, 310, 0.8, 'stand') + S.kana('ワラワラ', 260, 230, 36, -6, '#f2c14e') + S.bubble('They find things. It\'s different.', 610, 42, 180, 590, 130),
      out: {
        0: S => S.bg({}) + S.prop('mineMouth', 180, 260, 1.2) + swarm(200, 250, 480, 330, 26) + pile(620, 310, 110, 70) + S.person('sd_coinboy', 560, 316, 0.75, 'arms') + me(S, 700, 316, 0.8, 'arms', true) + S.fx('coins', 630, 220, 1.4) + S.kana('ジャラ', 620, 110, 50, -6, '#f2c14e'),
        1: S => S.bg({}) + church + S.person('sd_coinboy', 560, 262, 0.7, 'point', true) + swarm(200, 150, 480, 330, 34, false) + us(S, 150, 316, 0.85, 'draw') + S.lines(150, 220, K, 30, 0.3) + S.kana('ザワザワ', 330, 110, 48, -8, '#f2c14e'),
        2: S => S.bg({}) + church + pile(560, 290, 90, 55) + S.person('sd_coinboy', 520, 262, 0.7, 'kneel') + S.person('pocoloco', 610, 270, 0.78, 'arms') + [0, 1, 2, 3, 4].map(i => bug(560 + i * 22, 120 + (i % 2) * 20, 1)).join('') + S.fx('coins', 610, 190, 1.2) + me(S, 180, 316, 0.85, 'stand') +
          S.bubble('It\'s just my lucky day! Every day is!', 250, 42, 200, 580, 130),
      },
    });
  }

  /* ----- Hanged Man: a Stand that lives in reflections ----- */
  {
    const street = S => S.bg({ horizon: 240 }) + building(540, 240, 240, 150, '#a8784a', 'SALOON') + `<path d="M530 240H800V252H530Z" fill="#6a4a2a" ${st}/>` + building(0, 240, 200, 130, '#8a6a4a', 'GOODS') + win(40, 150, 60, 50) + win(120, 150, 60, 50);
    E.add('sd_hanged', {
      act: 2,
      scene: S => street(S) + trough(350, 306, 150) + `<path d="M350 268L330 200" stroke="${K}" stroke-width="2.5" stroke-dasharray="5 4"/><circle cx="320" cy="150" r="54" fill="#9fd0f0" stroke="${K}" stroke-width="3"/><clipPath id="hmc"><circle cx="320" cy="150" r="52"/></clipPath><g clip-path="url(#hmc)">${hangedMan(S, 310, 240, 0.6)}<path d="M270 180q25 -8 50 0t50 0M270 120q25 -8 50 0t50 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/></g>` + S.person('ghost', 250, 330, 0.8, 'down') + S.fx('blood', 240, 316, 0.8) +
        S.person('sd_mirror', 680, 250, 0.72, 'point', true) + `<rect x="598" y="150" width="12" height="18" fill="#e8b040" ${s2}/>` + me(S, 460, 330, 0.8, 'stand') + S.T(350, 230, 1, S.kana('!?', 0, 0, 30, 0, '#fff')) +
        S.caption('In the still water: a bandaged figure with a blade in its wrist.', 14, 40, 280),
      out: {
        0: S => street(S) + `<g transform="rotate(-28 350 300)">${trough(350, 306, 150, '')}</g>` + S.fx('splash', 350, 312, 1.6) + `<rect x="36" y="146" width="148" height="58" fill="#6a4a2a" ${st}/>` + S.person('sd_mirror', 610, 330, 0.8, 'point', true) + `<path d="M560 214L590 206" stroke="#c8c8d8" stroke-width="5"/>` +
          us(S, 460, 330, 0.85, 'point') + S.kana('バシャ!', 300, 220, 50, -10, '#9fd0f0') + S.bubble('No reflections left.', 20, 42, 180),
        '0:fail': S => street(S) + trough(350, 306, 150) + win(560, 120, 90, 80, '#c8e0f0') + hangedMan(S, 560, 250, 0.7) + S.lines(520, 180, K, 30, 0.25) + us(S, 330, 330, 0.85, 'draw', true) + S.kana('ズズッ', 690, 90, 44, 8, '#e8eef8'),
        1: S => street(S) + S.person('sd_mirror', 640, 330, 0.85, 'stand', true) + me(S, 260, 330, 0.9, 'point') + `<circle cx="400" cy="130" r="80" fill="#f6ecd8" ${st}/><circle cx="400" cy="130" r="44" fill="#6a8ab8" ${st}/><circle cx="400" cy="130" r="22" fill="${K}"/><clipPath id="hme"><circle cx="400" cy="130" r="44"/></clipPath><g clip-path="url(#hme)">${hangedMan(S, 400, 196, 0.42)}</g>` +
          S.caption('He looks into your eyes. At his own reflection in them.', 14, 40, 250),
        2: S => street(S) + S.person('sd_mirror', 600, 330, 0.85, 'point', true) + me(S, 330, 330, 0.85, 'stand') + S.fx('coins', 470, 230, 1.2) + `<path d="M0 360L120 270H200L150 360Z" fill="#c89a5a" ${st}/>` + S.prop('sign', 110, 300, 0.8, 'ARROYO', 'NO WATER') +
          S.bubble('Shortcut through the arroyo. No water there, so no me.', 460, 42, 250, 590, 120),
      },
    });
  }

  /* ----- Zombie horses ----- */
  {
    const ranch = S => S.prop('farmhouse', 700, 250, 0.9) + S.prop('windmill', 610, 250, 0.7);
    const herd = (S, x, y, s = 0.6, n = 4, flip = false) => [...Array(n)].map((_, i) => zHorse(S, x + i * 90 * s * (flip ? -1 : 1), y + (i % 2) * 18, s, flip)).join('');
    E.add('sd_zhorses', {
      act: 2,
      scene: S => S.bg({ pal: 'dusk', sunX: 120, sunY: 210 }) + ranch(S) + herd(S, 120, 240, 0.55, 5) + S.fx('dust', 60, 250, 1.2) + S.kana('ドドドド', 300, 120, 48, -8, '#e8323c') + zzz(690, 190) +
        S.caption('No breath, red eyes, stitched hides. Heading for a sleeping ranch.', 14, 40, 290),
      out: {
        0: S => S.bg({ pal: 'dusk', sunX: 120, sunY: 210 }) + ranch(S) + herd(S, 110, 330, 0.8, 3) + S.fx('boom', 330, 230, 0.8) + us(S, 560, 330, 0.9, 'draw', true) + S.fx('bang', 500, 214, 1) + S.lines(330, 230, K, 30, 0.25) + S.kana('ドドド', 200, 90, 54, -8, '#e8323c'),
        1: S => S.bg({ pal: 5, sunX: 720, sunY: 230 }) + herd(S, 120, 320, 0.6, 3) + `<g opacity=".6">${S.fx('dust', 150, 280, 1.4)}${S.fx('dust', 250, 290, 1.2)}</g>` + rider(S, lead(), 560, 320, 1.1) + speed(420, 520, 220, 300, 6) + S.kana('夜明け', 700, 120, 44, 6, '#fff3c0') + S.caption('At first light they fall apart in the grass like old saddles.', 14, 40, 280),
        '1:fail': S => S.bg({ pal: 'night', stars: true }) + herd(S, 60, 320, 0.7, 3) + rider(S, lead(), 560, 320, 1.1) + S.lines(560, 220, '#e8323c', 30, 0.3) + S.kana('追いつかれた', 420, 90, 36, -6, '#e8323c'),
        2: S => S.bg({ pal: 'dusk', sunX: 120, sunY: 210 }) + ranch(S) + zHorse(S, 300, 330, 0.85) + rope(560, 180, 380, 200, 10) + `<ellipse cx="380" cy="210" rx="40" ry="16" fill="none" stroke="#c8a060" stroke-width="4" stroke-dasharray="6 5"/>` + S.person('mountaintim', 600, 330, 0.9, 'point', true) + me(S, 720, 330, 0.8, 'stand', true) +
          S.bubble('Could use a hand, stranger.', 480, 42, 200, 600, 140),
      },
    });
  }

  /* ----- Death 13: the baby by the fire ----- */
  {
    const basket = (x, y, s = 1, face = 'sly') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 0Q-44 -30 -36 -34H36Q44 -30 40 0Z" fill="#c8a060" ${st}/><path d="M-36 -24H36M-38 -12H38" stroke="${K}" stroke-width="1.6" opacity=".6"/><circle cx="0" cy="-44" r="20" fill="#f6d8c0" ${st}/><path d="M-20 -46Q0 -80 20 -46" fill="#f6ecd8" ${st}/>${face === 'sly' ? `<path d="M-11 -44h8M3 -44h8" stroke="${K}" stroke-width="3"/><path d="M-6 -34q6 3 12 -2" fill="none" stroke="${K}" stroke-width="2"/>` : `<path d="M-11 -46l6 3M11 -46l-6 3" stroke="${K}" stroke-width="3"/><ellipse cx="0" cy="-34" rx="6" ry="5" fill="${K}"/><path d="M-12 -40v8M12 -40v8" stroke="#6ab0e8" stroke-width="3"/>`}</g>`;
    const fair = S => `<rect width="800" height="360" fill="#2a1040"/>` + [...Array(30)].map((_, i) => `<circle cx="${(i * 131) % 800}" cy="${(i * 61) % 200}" r="2" fill="#ffd84a"/>`).join('') +
      `<g transform="translate(160 190)"><circle r="120" fill="none" stroke="${K}" stroke-width="8"/><circle r="120" fill="none" stroke="#e8508a" stroke-width="4"/>${[...Array(8)].map((_, i) => { const a = i * Math.PI / 4; return `<path d="M0 0L${Math.cos(a) * 120} ${Math.sin(a) * 120}" stroke="#f2c14e" stroke-width="3"/><rect x="${Math.cos(a) * 120 - 12}" y="${Math.sin(a) * 120}" width="24" height="18" fill="#3fb8a9" ${s2}/>`; }).join('')}</g><path d="M100 360L160 190L220 360" fill="none" stroke="${K}" stroke-width="8"/>` +
      `<path d="M500 300L580 200L660 300Z" fill="#c8323c" ${st}/><path d="M580 200L560 300M580 200L600 300" stroke="#f6ecd8" stroke-width="10"/><rect y="300" width="800" height="60" fill="#3a2a4a" ${st}/>`;
    E.add('sd_death13', {
      act: 2,
      scene: S => night(S) + `<rect y="250" width="800" height="110" fill="${K}" opacity=".3"/>` + lanternGlow(420, 280) + fire(S, 420, 320, 1) + basket(560, 326, 1.1) + me(S, 280, 330, 0.8, 'kneel') + zzz(300, 150) + S.T(560, 240, 1, S.kana('じー', 0, 0, 26, 0, '#fff')) +
        S.caption('It looks at you like an old man looks at a chessboard.', 14, 40, 280),
      out: {
        0: S => fair(S) + reaper(S, 560, 300, 0.95, true) + us(S, 250, 320, 0.85, 'draw') + S.bubble('Lali-ho! Welcome to my dream!', 400, 42, 220, 540, 110) + S.kana('夢', 90, 90, 60, -8, '#e8508a'),
        1: S => S.bg({ pal: 'dusk', sunX: 700, sunY: 230 }) + `<path d="M420 320q0 -20 10 -30q4 14 10 6q2 16 -6 24z" fill="#8a8090" opacity=".7"/>` + basket(560, 326, 1.1, 'cry') + me(S, 330, 330, 0.85, 'stand') + `<path d="M302 178l10 4M318 178l-4 6" stroke="#c8323c" stroke-width="2"/>` + S.kana('オギャー', 620, 190, 36, 8, '#fff') + S.caption('Pinched yourself until dawn. Just a baby now, cross and hungry.', 14, 40, 270),
        '1:fail': S => fair(S) + me(S, 300, 320, 0.8, 'down') + zzz(250, 250) + reaper(S, 520, 300, 1.05, true) + S.lines(300, 290, '#e8508a', 30, 0.3) + S.kana('ラリホー', 640, 60, 40, 8, '#f2c14e'),
        2: S => `<rect width="800" height="360" fill="#2a1040"/>` + reaper(S, 650, 320, 0.8, true) + `<g opacity=".45">${S.lines(400, 180, '#e8508a', 30, 0.5)}</g>` + `<path d="M-10 250Q200 190 480 200L520 230Q540 280 480 290Q200 310 -10 330Z" fill="#f0c8a0" ${st}/><path d="M480 200Q560 180 600 214Q620 250 580 270L520 272" fill="#f0c8a0" ${st}/>` +
          `<text x="250" y="270" font-size="36" font-family="Anton,Oswald,sans-serif" text-anchor="middle" fill="#c8323c" stroke="${K}" stroke-width="1.5" transform="rotate(-4 250 270)">IT IS THE BABY</text>` + S.fx('blood', 420, 290, 0.8) + S.kana('ハッ', 700, 80, 44, 8, '#fff'),
      },
    });
  }

  /* ----- Yellow Temperance: the man who eats what he likes ----- */
  {
    const camp = S => S.bg({}) + S.prop('wagon', 560, 300, 1.3) + `<path d="M430 290Q450 270 470 290" fill="#f2c830" ${st}/>` + S.prop('saguaro', 90, 260, 0.8);
    const ike = (S, x = 420, pose = 'stand') => S.person('sd_glutton', x, 316, 0.95, pose, true);
    E.add('sd_temperance', {
      act: 3,
      scene: S => camp(S) + `<path d="M680 300L760 260M680 300L770 300" stroke="${K}" stroke-width="4"/><path d="M700 270Q720 250 740 272" fill="none" stroke="#6a3a1a" stroke-width="5"/>` + ike(S, 420, 'point') + `<ellipse cx="480" cy="210" rx="26" ry="10" fill="#8a5a34" ${st}/><path d="M462 206q18 -12 36 0" fill="#c8603a"/>` + me(S, 200, 316, 0.85, 'stand') +
        S.bubble('You look delicious. I mean hungry.', 430, 42, 200, 440, 120) + S.T(760, 250, 1, S.kana('?', 0, 0, 36, 0, '#fff')),
      out: {
        0: S => camp(S) + S.lines(400, 200, K, 36, 0.3) + blob(420, 320, 1.8) + S.person('sd_glutton', 420, 240, 0.7, 'arms', true) + me(S, 230, 316, 0.9, 'point') + `<circle cx="300" cy="200" r="16" fill="#f0c8a0" ${st}/>` + S.kana('ズブッ', 320, 90, 54, -10, '#f2c830') + S.bubble('Ha ha ha!', 560, 42, 110, 520, 110),
        1: S => S.bg({ pal: 4 }) + `<path d="M0 290Q400 260 800 290V360H0Z" fill="#9fd0f0" ${st}/>` + `<path d="M300 300Q380 250 460 300Z" fill="#f2c830" ${st}/><path d="M290 300Q380 240 470 300" fill="none" stroke="#fff" stroke-width="5" opacity=".7"/>` + S.bust('sd_glutton', 380, 300, 0.9) + sweat(420, 200) + me(S, 640, 280, 0.85, 'point', true) + S.fx('coins', 540, 200, 1) +
          S.kana('カチコチ', 200, 250, 44, -8, '#e8f6ff') + S.bubble('Pull me out! I\'ll pay!', 40, 42, 180, 330, 180),
        '1:fail': S => camp(S) + blob(420, 320, 1.6) + me(S, 240, 316, 0.9, 'draw') + `<path d="M290 216Q360 180 380 240" fill="#f2c830" ${st}/>` + S.fx('blood', 300, 216, 1) + S.kana('ガブッ', 360, 90, 54, -8, '#f2c830'),
        2: S => camp(S) + ike(S, 460, 'arms') + saddlebag(460, 150, 0.8) + `<path d="M430 170l-10 -10M490 170l10 -10" stroke="${K}" stroke-width="2"/>` + me(S, 200, 316, 0.85, 'arms') + speed(60, 150, 220, 290, 4) + S.kana('モグモグ', 620, 100, 40, 8, '#f2c830'),
      },
    });
  }

  /* ----- The Red Lantern Saloon: Stone Mask vampires ----- */
  {
    const inside = (S, dark = true) => S.bg({ pal: 'inside', inside: true, horizon: 270 }) + `<rect x="80" y="40" width="300" height="130" fill="#6a8aa8" ${st}/><rect x="90" y="50" width="280" height="110" fill="#3a4a6a"/>` + stoneMask(S, 230, 60, 0.8) +
      `<rect x="40" y="200" width="720" height="70" fill="#5a2a1a" ${st}/><rect x="30" y="192" width="740" height="14" fill="#7a3a2a" ${st}/>` + [440, 480, 520, 560].map((x, i) => `<rect x="${x}" y="${150 - (i % 2) * 8}" width="16" height="${42 + (i % 2) * 8}" fill="${i % 2 ? '#8a1a2a' : '#3a6a3a'}" ${s2}/>`).join('') + `<circle cx="700" cy="60" r="20" fill="#e8323c" ${st}/>` + (dark ? `<rect width="800" height="360" fill="#1a0010" opacity=".25"/>` : '');
    E.add('sd_vampnest', {
      act: 5,
      scene: S => inside(S) + S.person('sd_vampire', 520, 290, 0.75, 'stand', true) + S.person('sd_zombie', 640, 296, 0.75, 'stand', true) + S.person('sd_vampboss', 360, 250, 0.8, 'arms', true) + `<rect x="304" y="140" width="14" height="22" fill="#c8323c" ${s2}/>` + me(S, 120, 340, 0.85, 'stand') +
        S.bubble('Stay for a drink. Stay for good.', 420, 60, 190, 380, 150) + S.kana('ゾォォ', 700, 150, 36, 8, '#e8323c'),
      out: {
        0: S => inside(S, false) + `<path d="M0 0L260 0L520 360H0Z" fill="#fff3c0" opacity=".55"/>` + S.person('sd_vampire', 430, 300, 0.75, 'arms', true) + S.fx('smoke', 420, 170, 1.4) + S.person('sd_vampboss', 620, 300, 0.85, 'point', true) + us(S, 120, 340, 0.9, 'draw') + S.kana('ジュウウ', 400, 90, 48, -8, '#ffd84a'),
        1: S => night(S) + `<path d="M260 250V110H560V250Z" fill="#6a2a1a" ${st}/><rect x="240" y="96" width="340" height="20" fill="#6a2a1a" ${st}/>` + [300, 380, 460].map(x => `<path d="M${x} 110Q${x - 30} 40 ${x + 10} -10Q${x + 40} 50 ${x + 40} 110Z" fill="#e8742a" ${st}/><path d="M${x + 5} 110Q${x} 60 ${x + 14} 40Q${x + 26} 80 ${x + 24} 110Z" fill="#ffd84a"/>`).join('') + S.fx('smoke', 420, 30, 1.5) +
          me(S, 680, 330, 0.85, 'point', true) + S.caption('By morning: ash, and a cracked stone mask.', 14, 40, 260) + S.kana('ゴォォ', 150, 200, 48, -8, '#e8742a'),
        '1:fail': S => night(S) + `<path d="M260 250V110H560V250Z" fill="#6a2a1a" ${st}/>` + S.fx('smoke', 360, 140, 1.8) + S.fx('smoke', 480, 130, 1.5) + S.person('sd_vampboss', 400, 320, 0.95, 'arms') + S.person('sd_vampire', 520, 320, 0.8, 'point', true) + me(S, 700, 330, 0.85, 'draw', true) + S.kana('バァン', 420, 60, 52, -8, '#e8323c'),
        2: S => S.bg({ pal: 'night', stars: true }) + `<path d="M40 250V210H120V250Z" fill="#6a2a1a" ${s2}/><circle cx="80" cy="200" r="6" fill="#e8323c"/>` + rider(S, lead(), 480, 330, 1.2) + stoneMask(S, 400, 250, 0.55) + S.caption('Two miles gone before they notice.', 14, 40, 220) + speed(200, 360, 240, 310, 6) + S.kana('ダダッ', 700, 100, 44, 8, '#fff'),
      },
    });
  }

  /* ----- The Hamon monk under the waterfall ----- */
  {
    const falls = S => S.bg({ horizon: 250 }) + `<path d="M280 0H520V70H280Z" fill="#8a7a6a" ${st}/>` + waterfall(400, 90, 60, 280) + `<ellipse cx="400" cy="300" rx="260" ry="36" fill="#6ab0d8" ${st}/>` + `<path d="M0 250L280 60V250Z M800 250L520 60V250Z" fill="#8a9a6a" ${st}/>`;
    E.add('sd_hamon', {
      act: 3,
      scene: S => falls(S) + S.person('sd_monk', 400, 310, 0.85, 'kneel') + ripple(400, 150, 60) + `<path d="M340 200Q400 160 460 200" fill="none" stroke="#fff" stroke-width="6"/>` + me(S, 660, 330, 0.8, 'stand', true) + S.kana('コォォォ', 170, 110, 44, -8, '#ffd84a') +
        S.bubble('The breath of the sun.', 520, 42, 170, 450, 120),
      out: {
        0: S => falls(S) + S.person('sd_monk', 520, 310, 0.75, 'kneel') + me(S, 330, 320, 0.9, 'arms') + ripple(330, 200, 70) + sparkles(250, 110, 180, 120) + S.lines(330, 180, '#ffd84a', 30, 0.5) + S.kana('波紋!', 150, 90, 56, -8, '#ffd84a'),
        '0:fail': S => falls(S) + S.person('sd_monk', 520, 310, 0.75, 'kneel') + me(S, 340, 330, 0.85, 'kneel') + S.fx('splash', 380, 180, 1.2) + S.bubble('Breathe. Just breathe.', 560, 42, 170, 540, 140) + S.kana('ゲホッ', 250, 120, 44, -8, '#9fd0f0'),
        1: S => falls(S) + S.person('sd_monk', 450, 330, 0.85, 'point', true) + us(S, 300, 330, 0.85, 'stand') + ripple(300, 240, 60) + `<path d="M280 180l-10 40M310 180l10 40M300 240v60" stroke="#ffd84a" stroke-width="4" opacity=".8"/>` + sparkles(220, 120, 160, 120) + S.kana('キラキラ', 640, 110, 40, 8, '#ffd84a'),
        2: S => falls(S) + S.person('sd_monk', 470, 320, 0.9, 'point', true) + ripple(410, 200, 34) + S.fx('spark', 400, 200, 1.2) + me(S, 300, 330, 0.9, 'point') + S.lines(400, 200, K, 30, 0.25) + S.kana('ズムッ', 620, 90, 50, 8, '#ffd84a') + S.bubble('The Ripple learns best from a fist.', 20, 42, 220),
      },
    });
  }

  /* ----- Beach Boy: fishing through walls ----- */
  {
    const lake = S => S.bg({ pal: 4, horizon: 240 }) + snowGround() + `<ellipse cx="300" cy="310" rx="300" ry="40" fill="#cfe6f4" ${st}/>` + barn(560, 280, 1.1) + S.prop('pine', 60, 262, 1, 150, '#1f5a4a', true);
    const line = (x0, y0, extra = '') => `<path d="M${x0} ${y0}Q430 120 610 210" fill="none" stroke="${K}" stroke-width="2.5"/>${extra}`;
    E.add('sd_beachboy', {
      act: 4,
      scene: S => lake(S) + iceHole(200, 316) + S.person('sd_angler', 150, 320, 0.8, 'kneel') + `<path d="M170 250L260 110" stroke="${K}" stroke-width="5"/><path d="M170 250L260 110" stroke="#8a5a34" stroke-width="2.5"/>` + line(260, 110) + `<path d="M200 316Q230 200 260 110" fill="none" stroke="${K}" stroke-width="1.5" opacity=".6"/>` +
        S.kana('ギャー!', 650, 100, 36, 8, '#fff') + me(S, 420, 330, 0.8, 'stand') + S.bubble('Beach Boy. Goes through anything.', 20, 42, 210),
      out: {
        0: S => lake(S) + iceHole(260, 316) + S.person('sd_angler', 130, 320, 0.8, 'point') + me(S, 300, 330, 0.85, 'draw') + `<path d="M350 226L420 120" stroke="${K}" stroke-width="5"/><path d="M350 226L420 120" stroke="#8a5a34" stroke-width="2.5"/>` + line(420, 120, `<path d="M420 120Q500 140 610 210" fill="none" stroke="#ffd84a" stroke-width="3" stroke-dasharray="4 6"/>`) + S.kana('ドクン', 520, 100, 40, 6, '#ffd84a'),
        '0:fail': S => lake(S) + S.person('sd_angler', 200, 320, 0.8, 'arms') + S.kana('ハハハ', 200, 90, 40, -8, '#fff') + me(S, 420, 330, 0.9, 'stand') + `<path d="M440 160q14 -4 16 10q-2 10 -10 6" fill="none" stroke="${K}" stroke-width="3"/>` + S.fx('blood', 450, 170, 0.5) + fire(S, 300, 330, 0.5) + S.kana('イテッ', 500, 120, 36, 8, '#fff'),
        1: S => lake(S) + S.person('sd_angler', 180, 320, 0.85, 'point') + `<path d="M230 220Q360 140 470 180" fill="none" stroke="${K}" stroke-width="2.5"/><path d="M470 180q10 10 0 18q-8 -2 -6 -10" fill="none" stroke="${K}" stroke-width="3"/>` + us(S, 520, 330, 0.9, 'draw', true) + S.lines(470, 180, K, 30, 0.25) + S.bubble('Then take his place on the hook.', 20, 42, 210),
        2: S => lake(S) + fire(S, 320, 330, 0.8) + `<path d="M280 250L360 250" stroke="${K}" stroke-width="4"/>` + [290, 320, 350].map(x => `<path d="M${x - 12} 250q12 -10 24 0q-12 10 -24 0z" fill="#c8a080" ${s2}/>`).join('') + S.person('sd_angler', 180, 320, 0.8, 'kneel') + us(S, 480, 330, 0.8, 'kneel', true) + S.kana('ウマイ', 640, 110, 44, 8, '#e8742a'),
      },
    });
  }

  /* ----- Bad Company: the toy fort ----- */
  {
    const hill = S => S.bg({}) + `<path d="M180 300Q420 100 800 150V300Z" fill="#8aa05a" ${st}/>` + `<path d="M520 160H700V130H520Z" fill="#8a6a4a" ${s2}/>${[520, 550, 580, 610, 640, 670, 700].map(x => `<rect x="${x - 5}" y="120" width="10" height="14" fill="#8a6a4a" ${s2}/>`).join('')}` + `<path d="M610 118V70" stroke="${K}" stroke-width="3"/><path d="M610 70h26v14h-26z" fill="#3b5bb5" ${s2}/>`;
    const army = flash => [[330, 230], [370, 210], [410, 196], [450, 184], [490, 176], [540, 164], [590, 160], [650, 158], [700, 160], [440, 220], [520, 196]].map(([x, y], i) => toySoldier(x, y, 1.1, flash && i % 2)).join('') + tank(480, 210, 0.9) + tank(620, 180, 0.9) + heli(400, 110, 1) + heli(560, 80, 0.9);
    E.add('sd_badco', {
      act: 4,
      scene: S => hill(S) + army(false) + S.person('sd_sergeant', 740, 160, 0.6, 'point', true) + me(S, 110, 330, 0.85, 'stand') + S.kana('ザッ ザッ', 420, 60, 36, -6, '#fff') + S.caption('Two hundred riflemen the size of your thumb.', 14, 40, 250),
      out: {
        0: S => hill(S) + army(true) + S.person('sd_sergeant', 740, 160, 0.6, 'point', true) + us(S, 250, 330, 0.9, 'point') + [...Array(8)].map((_, i) => `<path d="M${340 + i * 30} ${200 - i * 6}L${270 - i * 4} ${230 + i * 6}" stroke="#ffd84a" stroke-width="2"/>`).join('') + S.bubble('FIRE AT WILL!', 580, 42, 150, 700, 90) + S.kana('パパパパ', 400, 330, 36, -4, '#ffd84a'),
        1: S => hill(S) + [[330, 230], [370, 214], [410, 200]].map(([x, y]) => toySoldier(x, y, 1.1)).join('') + S.person('sd_sergeant', 470, 300, 0.85, 'point', true) + me(S, 290, 320, 0.85, 'point') + `<path d="M282 170L300 158" stroke="${K}" stroke-width="5"/>` + `<rect x="200" y="280" width="30" height="40" rx="6" fill="#6a8a5a" ${st}/>` + S.bubble('Kit! Boots! Canteen!', 540, 42, 170, 500, 130),
        '1:fail': S => hill(S) + army(false) + me(S, 280, 330, 0.9, 'arms') + `<path d="M500 206Q400 150 300 250" fill="none" stroke="${K}" stroke-width="2" stroke-dasharray="6 4"/>` + S.fx('boom', 290, 260, 0.9) + S.kana('ドカーン', 150, 120, 50, -8, '#ffd84a') + S.kana('ハハ…', 380, 330, 26, 0, '#fff'),
        2: S => hill(S) + army(true) + `<path d="M0 250Q40 180 90 250Z M40 250Q100 150 160 250Z" fill="#3a6a3a" ${st}/>` + S.person('wekapipo', 130, 330, 0.9, 'point') + `<path d="M170 208l30 -6" stroke="${K}" stroke-width="8"/><path d="M170 208l30 -6" stroke="#c8a040" stroke-width="4"/>` + me(S, 250, 330, 0.8, 'draw') + S.bubble('An army that small still has officers. Aim for him.', 360, 250, 260, 180, 220) + `<circle cx="740" cy="120" r="30" fill="none" stroke="#c8323c" stroke-width="4"/><path d="M740 80v80M700 120h80" stroke="#c8323c" stroke-width="2"/>` + S.person('sd_sergeant', 740, 160, 0.6, 'point', true),
      },
    });
  }

  /* ----- Aerosmith: a Stand fighter plane ----- */
  {
    const valley = S => S.bg({}) + `<path d="M500 250L620 150L800 170V250Z" fill="#9a8a6a" ${st}/>` + `<path d="M0 310Q400 290 800 310V330Q400 310 0 330Z" fill="#8a6a4a" opacity=".5"/>`;
    const boy = S => S.person('sd_pilot', 680, 170, 0.55, 'arms', true);
    E.add('sd_aerosmith', {
      act: 4,
      scene: S => valley(S) + boy(S) + plane(330, 110, 1.3, 12) + [...Array(7)].map((_, i) => S.fx('dust', 120 + i * 50, 300 + (i % 2) * 6, 0.4)).join('') + `<path d="M380 120L130 300" stroke="#ffd84a" stroke-width="2" stroke-dasharray="10 12"/>` + S.person('gunslinger', 200, 330, 0.7, 'down') + S.person('bandit', 360, 330, 0.7, 'kneel') +
        S.kana('ブーン', 200, 70, 44, -10, '#fff') + S.bubble('Stay in the ditch!', 560, 42, 150, 660, 110),
      out: {
        0: S => valley(S) + boy(S) + plane(420, 90, 1.1, -10) + `<g fill="none" stroke="#6aff8a" stroke-width="2" opacity=".7"><circle cx="420" cy="90" r="50"/><circle cx="420" cy="90" r="90"/></g>` + me(S, 260, 330, 0.8, 'down') + `<circle cx="202" cy="318" r="12" fill="#f0c8a0" ${s2}/>` + sweat(230, 280) + S.kana('シーン', 560, 250, 40, 0, '#fff') + S.caption('No breath, no blip.', 14, 40, 170),
        '0:fail': S => valley(S) + boy(S) + plane(420, 140, 1.3, 25) + `<g fill="none" stroke="#ff4a4a" stroke-width="3"><circle cx="300" cy="300" r="30"/><circle cx="300" cy="300" r="56"/></g>` + me(S, 300, 330, 0.8, 'down') + S.kana('ピッ!', 380, 230, 44, 0, '#ff4a4a') + S.lines(300, 290, K, 30, 0.25),
        1: S => valley(S) + boy(S) + plane(470, 110, 1.3, 30) + S.fx('boom', 470, 110, 0.6) + S.fx('smoke', 530, 80, 0.8) + us(S, 250, 330, 0.9, 'draw') + S.fx('bang', 330, 214, 1.1) + `<path d="M330 214L460 116" stroke="#ffd84a" stroke-width="3" stroke-dasharray="8 6"/>` + S.kana('ブルルルッ', 230, 70, 44, -8, '#fff'),
        2: S => valley(S) + boy(S) + plane(240, 80, 0.9, -5) + `<path d="M240 90L60 200" stroke="#9fd0f0" stroke-width="2" stroke-dasharray="4 6"/>` + S.prop('tree', 90, 250, 0.8, 60, '#6a5a3a') + me(S, 420, 330, 0.85, 'point') + whiteFlag(480, 210, 90) + S.fx('coins', 560, 200, 1) + S.bubble('Canyon\'s clear. Left at the dead tree.', 540, 230, 230, 660, 180),
      },
    });
  }

  /* ----- Sex Pistols: six little bullets ----- */
  {
    const road = S => S.bg({}) + `<path d="M300 250L0 360H800L500 250Z" fill="#c8a870" ${st}/>` + S.prop('rock', 100, 300, 1) + S.prop('saguaro', 720, 260, 0.7);
    const dutch = (S, pose = 'kneel', x = 420) => S.person('sd_sixgun', x, 330, 0.9, pose);
    const onHat = (x, y, mood) => [1, 2, 3, 6, 7].map((n, i) => pistol(x - 40 + i * 20, y - (i % 2) * 6, 0.9, n, mood)).join('');
    E.add('sd_pistols', {
      act: 4,
      scene: S => road(S) + dutch(S) + onHat(420, 172, 'cry') + bullet(450, 172, -40, 1) + S.prop('rock', 530, 330, 0.5) + me(S, 180, 330, 0.8, 'stand') + S.bubble('No. 5 is missing. Don\'t count past three.', 520, 42, 220, 470, 150) + S.kana('エーン', 300, 120, 36, -8, '#9fd0f0'),
      out: {
        0: S => road(S) + dutch(S, 'arms') + me(S, 250, 330, 0.85, 'point') + `<path d="M330 218H360Q366 222 360 226H330Z" fill="#d8b050" ${s2}/>` + pistol(346, 206, 1.1, 5, 'happy') + onHat(420, 150, 'happy') + S.kana('ワーイ', 600, 100, 48, 8, '#f2c14e') + S.fx('spark', 346, 200, 1),
        '0:fail': S => road(S) + dutch(S, 'draw', 520) + onHat(520, 150, 'scream') + S.lines(520, 150, K, 30, 0.3) + me(S, 230, 330, 0.85, 'arms') + S.bubble('One, two, three, four--', 30, 42, 190, 230, 150) + S.kana('ギャー!!', 520, 70, 50, 8, '#fff'),
        1: S => road(S) + S.person('sd_sixgun', 600, 330, 0.9, 'draw', true) + me(S, 200, 330, 0.9, 'draw') + [0, 1, 2].map(i => bullet(480 - i * 70, 200 + i * 6, 180, 1.3) + pistol(480 - i * 70, 190 + i * 6, 0.8, [1, 2, 3][i], 'happy')).join('') + S.kana('ドン', 420, 90, 50, -8, '#fff') + S.bubble('Boys, we\'re dueling!', 560, 42, 170, 600, 110),
        2: S => road(S) + dutch(S, 'kneel', 500) + me(S, 260, 330, 0.85, 'kneel') + `<path d="M330 290Q380 270 420 290L410 300H340Z" fill="#c8323c" ${st}/>` + [1, 2, 3, 5, 6, 7].map((n, i) => pistol(330 + i * 16, 280 - (i % 2) * 4, 0.8, n, i === 2 ? 'scream' : 'happy')).join('') + S.kana('モグモグ', 380, 180, 36, -4, '#f2c14e') + zzz(500, 140),
      },
    });
  }

  /* ----- Kraft Work: the man who stops things ----- */
  {
    const bank = S => S.bg({ horizon: 240 }) + building(220, 250, 360, 170, '#c8b898', 'BANK') + `<path d="M260 250V110M540 250V110" stroke="${K}" stroke-width="16"/><path d="M260 250V110M540 250V110" stroke="#e8e0d0" stroke-width="10"/>` + door(370, 250, 60, 90);
    const hang = (x, y) => [0, 1, 2, 3, 4, 5].map(i => bullet(x + (i % 3) * 26, y + Math.floor(i / 3) * 26, 180, 1.2) + `<path d="M${x + (i % 3) * 26 + 10} ${y + Math.floor(i / 3) * 26 - 8}v-6M${x + (i % 3) * 26 + 16} ${y + Math.floor(i / 3) * 26 - 8}v-6" stroke="#a0c040" stroke-width="2"/>`).join('');
    E.add('sd_kraft', {
      act: 5,
      scene: S => bank(S) + S.person('sd_fixer', 400, 330, 0.9, 'point', true) + hang(250, 190) + S.person('bandit', 120, 330, 0.85, 'draw') + S.person('thug', 40, 336, 0.8, 'draw') + me(S, 690, 330, 0.8, 'stand', true) + S.kana('ピタッ', 280, 140, 44, -8, '#a0c040') +
        S.bubble('Would anyone else like to make a withdrawal?', 470, 42, 230, 430, 140),
      out: {
        0: S => bank(S) + S.person('sd_fixer', 480, 330, 0.85, 'draw', true) + us(S, 330, 330, 0.85, 'draw') + S.person('bandit', 100, 330, 0.8, 'down') + hang(140, 220) + `<path d="M470 160l-30 -20" stroke="#a0c040" stroke-width="3"/>` + S.bubble('You look like a robber too.', 560, 42, 190, 500, 130) + S.kana('!?', 330, 110, 40, 0, '#fff'),
        1: S => bank(S) + S.lines(400, 180, '#a0c040', 30, 0.35) + `<path d="M310 220Q370 150 440 200L450 240Q380 250 330 260Z" fill="#e8e8d0" ${st}/>` + `<g transform="translate(400 206)">${bullet(0, 0, 180, 2.2)}${[0, 1, 2].map(i => `<ellipse cx="${-18 + i * 4}" cy="0" rx="${6 + i * 5}" ry="${12 + i * 5}" fill="none" stroke="#fff" stroke-width="2"/>`).join('')}</g>` + S.kana('ギュルルル', 420, 90, 44, -6, '#f2c14e') + S.fx('coins', 640, 280, 1.3) + S.bust('sd_fixer', 640, 220, 1.1, true) + S.kana('ハハ!', 700, 70, 36, 8, '#fff'),
        '1:fail': S => bank(S) + S.person('sd_fixer', 470, 330, 0.9, 'point', true) + me(S, 330, 330, 0.9, 'draw') + `<rect x="260" y="130" width="140" height="210" fill="#a0c040" opacity=".2"/>` + [...Array(6)].map((_, i) => `<path d="M${270 + i * 24} 130v210" stroke="#a0c040" stroke-width="2" opacity=".5"/>`).join('') + bullet(420, 210, 180, 1.2) + S.kana('ピタ', 330, 100, 50, 0, '#a0c040'),
        2: S => bank(S) + S.horse(360, 330, 1.4, myHorse()) + [300, 420].map(x => horseshoe(x, 322, 0.9, '#a0c040') + `<circle cx="${x}" cy="318" r="22" fill="none" stroke="#a0c040" stroke-width="3" stroke-dasharray="5 4"/>`).join('') + S.person('sd_fixer', 600, 330, 0.85, 'point', true) + S.kana('ガチッ', 420, 110, 44, -6, '#a0c040') + S.bubble('Never throw, crack or slip again.', 20, 42, 200),
      },
    });
  }

  /* ----- Moody Blues: the replay ----- */
  {
    const town = S => S.bg({ horizon: 240 }) + building(20, 250, 220, 140, '#a88a6a', 'STAGE CO.') + building(560, 250, 220, 150, '#8a6a5a') + win(600, 150, 50, 50) + win(690, 150, 50, 50);
    E.add('sd_moody', {
      act: 5,
      scene: S => town(S) + moody(S, 380, 330, 0.9, null, false, '-23:52') + `<path d="M420 216L460 204" stroke="${K}" stroke-width="4"/><path d="M460 196h24v8h-18l-2 6h-6z" fill="#8a8aa0" ${s2}/>` + S.person('sd_replay', 580, 330, 0.85, 'point', true) + `<rect x="620" y="210" width="26" height="32" fill="#f6ecd8" ${s2}/>` + me(S, 180, 330, 0.8, 'stand') + S.kana('ピッピッ', 380, 100, 36, -6, '#8aff8a') +
        S.bubble('Twelve-oh-seven, yesterday.', 560, 42, 180, 600, 130),
      out: {
        0: S => town(S) + hayloft(460, 330) + moody(S, 380, 330, 0.8, null, false, '-22:10') + S.person('bandit', 570, 180, 0.5, 'kneel') + S.fx('coins', 590, 160, 0.8) + us(S, 220, 330, 0.85, 'draw') + S.kana('いたぞ', 600, 60, 40, 8, '#fff'),
        '0:fail': S => town(S) + [180, 260, 340, 420, 500, 580].map((x, i) => S.person(['coach', 'miner', 'mason', 'thug', 'doctor', 'ghost'][i], x, 330 + (i % 2) * 6, 0.7, 'stand', i % 2 === 1)).join('') + `<path d="M380 130q10 -30 30 -10" fill="none" stroke="#8a5ac8" stroke-width="4" opacity=".5"/>` + S.kana('見失った', 400, 80, 40, -4, '#8a5ac8'),
        1: S => town(S) + moody(S, 300, 330, 0.9, lead(), false, '-168:00') + moody(S, 560, 336, 0.8, 'agent', true, '-166:30') + `<path d="M380 280L480 280" stroke="#8a5ac8" stroke-width="3" stroke-dasharray="8 5"/>` + S.person('sd_replay', 720, 330, 0.75, 'point', true) + S.caption('The man in a government coat who followed you for three days.', 14, 40, 300),
        2: S => town(S) + moody(S, 430, 330, 0.95, lead(), true) + S.lines(430, 200, '#8a5ac8', 30, 0.3) + me(S, 220, 330, 0.9, 'draw') + S.person('sd_replay', 650, 330, 0.8, 'point', true) + S.bubble('Obstruction.', 560, 42, 120, 640, 130) + S.kana('ゴゴゴ', 120, 90, 40, -8, '#8a5ac8'),
      },
    });
  }

  /* ----- A Pillar Man in the quarry ----- */
  {
    const quarry = (S, pal) => S.bg({ pal: pal || 6, horizon: 200, far: false, stars: pal === 'night', sun: pal !== 3 }) + `<path d="M0 200H240L280 260H520L560 200H800V360H0Z" fill="#b8a898" ${st}/>` + `<path d="M0 230H220M600 230H800M0 280H260M560 290H800" stroke="${K}" stroke-width="2" opacity=".4"/>`;
    E.add('sd_pillar', {
      act: 6,
      scene: S => quarry(S) + pillar(400, 320, 0.95, false) + S.person('miner', 220, 330, 0.8, 'point') + S.person('mason', 600, 330, 0.8, 'stand', true) + me(S, 700, 336, 0.75, 'stand', true) + S.kana('ドクン', 400, 60, 40, 0, '#f2c14e') + S.caption('The stone is warm.', 14, 40, 160),
      out: {
        0: S => quarry(S, 'night') + [160, 640].map(x => lanternGlow(x, 200) + S.prop('lantern', x, 220, 1)).join('') + pillar(400, 320, 0.95, true, true) + S.person('sd_pillarman', 400, 300, 0.95, 'arms') + S.lines(400, 180, '#f2c14e', 36, 0.4) + me(S, 700, 336, 0.8, 'draw', true) + S.kana('ゴゴゴゴ', 170, 70, 44, -8, '#f2c14e'),
        1: S => quarry(S, 3) + `<circle cx="400" cy="40" r="44" fill="#fff3c0" ${st}/>` + S.lines(400, 40, '#ffd84a', 30, 0.5) + `<path d="M300 330Q400 250 500 330Z" fill="#e8d8a8" ${st}/>` + `<circle cx="400" cy="300" r="14" fill="#e8323c" ${st}/>` + sparkles(360, 270, 80, 30, '#fff3c0', 4) + us(S, 180, 330, 0.85, 'arms') + S.person('miner', 640, 330, 0.8, 'arms', true) + S.kana('ザァァ', 580, 180, 44, 6, '#e8d8a8'),
        '1:fail': S => quarry(S) + `<path d="M0 0H560L360 360H0Z" fill="${K}" opacity=".35"/>` + `<g transform="rotate(80 420 300)">${pillar(420, 300, 0.7, true)}</g>` + S.person('sd_pillarman', 350, 330, 0.9, 'point') + me(S, 620, 330, 0.85, 'draw', true) + S.kana('ピシッ', 300, 110, 48, -8, '#fff'),
        2: S => quarry(S) + `<path d="M280 262H520L500 300H300Z" fill="#8a7a6a" ${st}/>` + S.person('cardinal', 400, 330, 0.85, 'arms') + S.person('miner', 230, 330, 0.75, 'stand') + us(S, 620, 330, 0.8, 'stand', true) + `<path d="M400 120v-40M384 96h32" stroke="#f2c14e" stroke-width="6"/>` + S.caption('The hole is filled. A priest blesses the spot.', 14, 40, 260),
      },
    });
  }
  /* =================================================================== SAINT'S CORPSE */

  const flagUS = (x, y, w = 70, h = 44) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f6ecd8" ${st}/>${[1, 3, 5].map(i => `<rect x="${x}" y="${y + i * h / 7}" width="${w}" height="${h / 7}" fill="#c8323c"/>`).join('')}<rect x="${x}" y="${y}" width="${w * 0.42}" height="${h * 0.5}" fill="#2a4a8a" ${s2}/>`;
  const monastery = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-60" y="-90" width="120" height="90" fill="#e8d8c0" ${st}/><path d="M-70 -90L0 -140L70 -90Z" fill="#b8423a" ${st}/><path d="M0 -140V-170M-10 -160H10" stroke="${K}" stroke-width="4"/>${door(-14, 0, 28, 44)}</g>`;
  const candle = (x, y) => `<rect x="${x - 4}" y="${y - 18}" width="8" height="18" fill="#f6ecd8" ${s2}/><path d="M${x} ${y - 20}q-4 -6 0 -12q4 6 0 12z" fill="#ffd84a" ${s2}/>`;
  const well = (x, y) => `<ellipse cx="${x}" cy="${y - 50}" rx="54" ry="14" fill="#2a4a6a" ${st}/><path d="M${x - 54} ${y - 50}V${y}H${x + 54}V${y - 50}" fill="#a8a098" ${st}/>${[0, 1, 2].map(r => `<path d="M${x - 54} ${y - 36 + r * 14}H${x + 54}" stroke="${K}" stroke-width="1.5" opacity=".5"/>`).join('')}<path d="M${x - 50} ${y - 50}V${y - 130}M${x + 50} ${y - 50}V${y - 130}" stroke="${K}" stroke-width="7"/><path d="M${x - 66} ${y - 124}L${x} ${y - 160}L${x + 66} ${y - 124}Z" fill="#8a5a34" ${st}/>`;
  const mag = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="26" fill="#cfe6f4" opacity=".7" ${st}/><path d="M18 18L44 44" stroke="${K}" stroke-width="10" stroke-linecap="round"/><path d="M18 18L44 44" stroke="#8a5a34" stroke-width="5" stroke-linecap="round"/></g>`;
  const bone = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-24 -4H24M-24 4H24" stroke="${K}" stroke-width="3"/><rect x="-24" y="-4" width="48" height="8" fill="#e8dcc0"/><circle cx="-26" cy="-5" r="6" fill="#e8dcc0" ${s2}/><circle cx="-26" cy="5" r="6" fill="#e8dcc0" ${s2}/><circle cx="26" cy="-5" r="6" fill="#e8dcc0" ${s2}/><circle cx="26" cy="5" r="6" fill="#e8dcc0" ${s2}/></g>`;
  const saint = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" opacity=".9"><circle cx="0" cy="-150" r="36" fill="none" stroke="#ffd84a" stroke-width="6"/><circle cx="0" cy="-130" r="20" fill="#f6ecd8" ${st}/><path d="M-26 -108Q0 -116 26 -108L34 0H-34Z" fill="#f6ecd8" ${st}/><path d="M-22 -104L-80 -130M22 -104L80 -130" stroke="${K}" stroke-width="12" stroke-linecap="round"/><path d="M-22 -104L-80 -130M22 -104L80 -130" stroke="#f6ecd8" stroke-width="7" stroke-linecap="round"/></g>`;
  const dog = (S, x, y, s = 1) => S.prop('wolf', x, y, s * 1.7);
  const rod = (x, y, bend = 0.6, spear) => spear ? `<path d="M${x} ${y}L${x + 140} ${y - 60}" stroke="${K}" stroke-width="7"/><path d="M${x} ${y}L${x + 140} ${y - 60}" stroke="#a8743e" stroke-width="3.5"/><path d="M${x + 136} ${y - 72}L${x + 170} ${y - 72}L${x + 144} ${y - 50}Z" fill="#d0d4e0" ${st}/>`
    : `<path d="M${x} ${y}L${x - 20} ${y + 30}M${x} ${y}L${x + 20} ${y + 30}M${x} ${y}Q${x + 60} ${y - 60 * (1 - bend)} ${x + 110} ${y + 60 * bend}" fill="none" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="M${x} ${y}Q${x + 60} ${y - 60 * (1 - bend)} ${x + 110} ${y + 60 * bend}" fill="none" stroke="#a8743e" stroke-width="3.5"/>`;

  {
    const base = S => S.bg({}) + carriage(640, 320, 1.1, '#8a1a2a') + `<path d="M520 300L560 300" stroke="${K}" stroke-width="4"/>`;
    const card = (S, pose = 'kneel') => S.person('cv_cardinal', 420, 320, 0.9, pose, true);
    E.add('corpse_cardinal', {
      act: 3,
      scene: S => base(S) + card(S) + reliquary(360, 330, 0.9) + me(S, 170, 330, 0.85) + S.bubble('Only one piece of Him.', 420, 42, 170, 430, 140) + S.caption('The reliquary is lined with velvet, and empty.', 14, 40, 250),
      out: {
        0: S => base(S) + card(S, 'arms') + reliquary(360, 330, 0.9) + relic(360, 290, 0.55) + us(S, 170, 330, 0.85, 'kneel') + sparkles(100, 110, 180, 90, '#fff3c0', 6) + S.kana('聖', 260, 90, 60, -6, '#ffd84a'),
        1: S => base(S) + S.person('cv_cardinal', 420, 320, 0.9, 'point', true) + me(S, 260, 330, 0.85, 'kneel') + `<circle cx="260" cy="150" r="40" fill="#fff3c0" opacity=".5"/>` + S.lines(260, 180, '#ffd84a', 24, 0.4) + S.bubble('Perhaps He chose you to carry Him.', 470, 42, 210, 460, 140),
        '1:fail': S => S.bg({}) + carriage(640, 320, 1.1, '#8a1a2a') + speed(740, 800, 220, 300, 5) + S.fx('dust', 730, 310, 1) + me(S, 260, 330, 0.85) + S.bubble('A blessing is not a toll you can skip.', 380, 42, 230, 600, 150),
        2: S => night(S) + carriage(640, 320, 1.1, '#8a1a2a') + S.person('cv_cardinal', 420, 330, 0.9, 'down') + zzz(400, 280) + me(S, 220, 330, 0.85, 'kneel') + S.fx('coins', 290, 290, 1) + `<ellipse cx="280" cy="270" rx="16" ry="18" fill="#8a1a2a" ${st}/>` + S.kana('コソ…', 200, 110, 40, -6, '#fff'),
        '2:fail': S => night(S) + carriage(640, 320, 1.1, '#8a1a2a') + S.person('cv_guard', 430, 330, 0.9, 'point', true) + halberd(470, 330) + S.person('cv_guard', 560, 330, 0.9, 'stand', true) + halberd(600, 330) + me(S, 220, 330, 0.85, 'arms') + S.kana('ガシャ', 500, 80, 48, 6, '#fff'),
      },
    });
  }
  {
    const base = S => S.bg({});
    const riders = S => S.person('agent', 620, 320, 0.8, 'stand', true) + S.person('agent', 720, 316, 0.78, 'stand', true);
    E.add('corpse_pardon', {
      act: 4,
      scene: S => base(S) + riders(S) + S.person('cv_envoy', 460, 330, 0.9, 'point', true) + whiteFlag(520, 330, 190) + paper(390, 200, 70, 90, -8, 4, 'PARDON') + me(S, 180, 330, 0.85) + S.bubble('Every crime on this trail, forgiven.', 30, 42, 210, 180, 150),
      out: {
        0: S => base(S) + riders(S) + S.person('cv_envoy', 460, 330, 0.9, 'arms', true) + flagUS(400, 150, 90, 56) + relic(445, 180, 0.5, false) + me(S, 180, 330, 0.85) + `<g transform="translate(90 90) rotate(-10)"><rect x="-40" y="-50" width="40" height="100" fill="#f6ecd8" ${st}/><text x="-20" y="-30" font-size="12" text-anchor="middle" font-family="Anton,sans-serif">WAN</text></g><g transform="translate(110 100) rotate(14)"><rect x="0" y="-50" width="40" height="100" fill="#f6ecd8" ${st}/><text x="20" y="-30" font-size="12" text-anchor="middle" font-family="Anton,sans-serif">TED</text></g>` + S.kana('ビリッ', 150, 250, 36, -6, '#fff'),
        1: S => base(S) + S.person('agent', 600, 330, 0.85, 'draw', true) + S.person('pres_sniper' in (SBR.art.P || {}) ? 'pres_sniper' : 'soldier', 720, 324, 0.8, 'draw', true) + S.person('cv_envoy', 460, 330, 0.9, 'stand', true) + `<path d="M520 330L560 180" stroke="${K}" stroke-width="5"/>` + paper(250, 170, 36, 60, -30, 3) + paper(310, 150, 36, 60, 24, 3) + us(S, 200, 330, 0.85, 'arms') + S.bubble('A pity.', 420, 42, 90, 460, 140) + S.lines(600, 200, K, 30, 0.2),
        2: S => base(S) + riders(S) + S.person('cv_envoy', 460, 330, 0.9, 'point', true) + bone(380, 210, 1) + mag(360, 200, 1.1) + S.fx('coins', 260, 280, 1.2) + me(S, 180, 330, 0.85) + sweat(210, 150) + S.kana('ジー', 390, 110, 40, 0, '#fff'),
        '2:fail': S => base(S) + S.person('agent', 600, 330, 0.85, 'draw', true) + S.person('soldier', 720, 324, 0.8, 'draw', true) + S.person('cv_envoy', 460, 330, 0.9, 'point', true) + bone(360, 220, 1) + me(S, 180, 330, 0.85, 'arms') + S.bubble('Goat.', 420, 42, 80, 460, 140) + S.kana('ザッ', 680, 90, 48, 8, '#fff'),
      },
    });
  }
  {
    const sick = (S, green) => S.bg({ horizon: 250 }) + `<rect y="250" width="800" height="110" fill="${green ? '#7ab84a' : '#9a9a8a'}"/><path d="M0 250H800" stroke="${K}" stroke-width="3"/>` + `<ellipse cx="400" cy="300" rx="120" ry="24" fill="#6ab0d8" ${st}/>` + (green ? [...Array(16)].map((_, i) => `<path d="M${30 + i * 50} 340l6 -18 6 18M${50 + i * 50} 280l4 -12 4 12" fill="none" stroke="#3a6a2a" stroke-width="3"/>`).join('') : '');
    const deadCow = (S, x, y) => `<g transform="translate(${x} ${y}) rotate(180)">${S.prop('cow', 0, 0, 0.8, '#8a8a80', '#c8c8c0')}</g>`;
    E.add('corpse_burial', {
      act: 2,
      scene: S => sick(S) + deadCow(S, 130, 250) + deadCow(S, 680, 256) + S.person('cv_elder', 520, 320, 0.9, 'stand', true) + me(S, 250, 330, 0.85) + S.bubble('The land remembers him.', 540, 42, 170, 530, 140) + S.caption('Grey grass for a mile around the spring.', 14, 40, 250),
      out: {
        0: S => sick(S, true) + S.prop('cow', 130, 290, 0.8) + S.prop('cow', 680, 296, 0.8, '#3a2a2a') + relic(400, 300, 0.6) + S.person('cv_elder', 520, 330, 0.9, 'point', true) + us(S, 260, 330, 0.85) + S.kana('芽吹き', 400, 110, 50, -6, '#7ab84a'),
        1: S => S.bg({ pal: 'night', stars: true }) + `<ellipse cx="400" cy="300" rx="120" ry="24" fill="#3a6a9a" ${st}/>` + S.person('cv_elder', 520, 330, 0.85, 'kneel', true) + us(S, 280, 330, 0.85, 'kneel') + `<circle cx="400" cy="300" r="30" fill="#9fe8ff" opacity=".35"/>` + S.caption('The water tastes sweet again.', 14, 40, 200),
        '1:fail': S => S.bg({ pal: 'night', stars: true }) + `<ellipse cx="400" cy="300" rx="120" ry="24" fill="#3a6a9a" ${st}/>` + S.person('cv_elder', 520, 330, 0.85, 'kneel', true) + me(S, 280, 330, 0.8, 'down') + zzz(230, 280),
        2: S => sick(S) + deadCow(S, 130, 250) + S.person('cv_elder', 470, 330, 0.9, 'point', true) + `<path d="M400 216q-10 -20 0 -34q10 14 0 34zM410 216q6 -20 20 -24q-4 18 -20 24z" fill="#5a9a3a" ${s2}/>` + me(S, 280, 330, 0.85, 'point') + S.bubble('He is for carrying. We will see where.', 540, 42, 220, 490, 150),
      },
    });
  }
  {
    const camp = S => night(S) + fire(S, 640, 330, 0.6);
    const joined = (x, y, s = 1) => relic(S0, x - 40 * s, y, s, false) + `<g transform="translate(${x + 40 * s} ${y}) scale(${-s} ${s})">${relic(S0, 0, 0, 1, false)}</g>`;
    const S0 = { T: (x, y, s, inner) => `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>` };
    E.add('corpse_fusion', {
      act: 3,
      scene: S => camp(S) + joined(380, 316, 1.4) + `<path d="M366 306Q380 296 394 306Q380 318 366 306Z" fill="#e8a888" ${st}/>` + me(S, 190, 330, 0.8, 'kneel') + S.kana('!?', 230, 130, 40, 0, '#fff') + S.caption('They want to be one body again.', 14, 40, 220) + S.kana('ズル…', 400, 240, 36, -6, '#e8a888'),
      out: {
        0: S => camp(S) + relic(400, 280, 1.2) + me(S, 220, 330, 0.85, 'kneel') + S.lines(400, 280, '#ffd84a', 30, 0.4) + S.kana('ドクン', 560, 110, 50, 6, '#ffd84a'),
        '0:fail': S => camp(S) + relic(300, 300, 0.9, false) + `<g transform="translate(520 300) scale(-0.9 0.9)">${relic(S0, 0, 0, 1, false)}</g>` + S.fx('blood', 410, 300, 1.2) + S.lines(410, 300, '#c8323c', 30, 0.3) + S.kana('ビリビリ', 410, 180, 44, -6, '#c8323c') + `<rect x="580" y="20" width="200" height="120" fill="#e8e0d0" ${st}/>` + S.bust('valentine', 680, 140, 0.9) + `<text x="680" y="36" font-size="12" text-anchor="middle" font-family="Oswald,sans-serif" fill="${K}">WASHINGTON</text>`,
        1: S => camp(S) + bundle(180, 320, 1.2) + bundle(620, 320, 1.2) + me(S, 400, 330, 0.8, 'down') + zzz(360, 280),
        2: S => S.bg({ pal: 'dusk', far: true }) + saint(420, 300, 1) + S.lines(420, 150, '#ffd84a', 30, 0.35) + me(S, 180, 340, 0.75, 'down') + zzz(140, 290) + S.caption('A man walking across a desert with his arms open.', 14, 40, 260),
      },
    });
  }
  {
    const hills = S => S.bg({ act: 1 }) + `<path d="M420 250Q520 150 600 190Q680 130 800 180V250Z" fill="#c8503a" ${st}/>`;
    E.add('corpse_calling', {
      act: 1,
      scene: S => hills(S) + S.fx('dust', 640, 150, 1) + me(S, 200, 330, 0.9, 'point') + relic(300, 210, 0.55) + `<path d="M330 205L470 170" stroke="#ffd84a" stroke-width="4" stroke-dasharray="10 6"/><path d="M470 170l-16 -2 6 12z" fill="#ffd84a" ${s2}/>` + S.kana('グイッ', 380, 120, 40, -6, '#ffd84a') + S.caption('Somebody with shovels got there first.', 14, 40, 240),
      out: {
        0: S => hills(S) + `<path d="M420 330Q500 290 580 330Z" fill="#a86a3a" ${st}/>` + S.person('soldier', 530, 330, 0.85, 'draw', true) + S.person('agent', 650, 330, 0.85, 'draw', true) + `<path d="M470 300L440 250" stroke="${K}" stroke-width="5"/>` + us(S, 220, 330, 0.9, 'draw') + relic(310, 200, 0.45) + S.kana('ジャキ', 600, 110, 44, 6, '#fff'),
        1: S => night(S) + `<path d="M420 250Q520 150 600 190Q680 130 800 180V250Z" fill="#6a3a3a" ${st}/>` + `<ellipse cx="400" cy="320" rx="60" ry="16" fill="#3a2a1a" ${st}/>` + relic(400, 316, 0.6) + me(S, 280, 330, 0.85, 'kneel') + S.kana('ここだ', 420, 200, 36, -6, '#ffd84a'),
        '1:fail': S => night(S) + `<ellipse cx="400" cy="320" rx="60" ry="16" fill="#3a2a1a" ${st}/>` + me(S, 280, 330, 0.85, 'kneel') + lanternGlow(560, 200) + S.person('soldier', 600, 330, 0.85, 'point', true) + S.prop('lantern', 548, 230, 1) + `<path d="M540 200L300 220L300 300Z" fill="#ffd84a" opacity=".25"/>` + S.kana('誰だ!', 640, 90, 44, 6, '#fff'),
        2: S => hills(S) + rider(S, lead(), 260, 330, 1.1, true) + speed(360, 460, 230, 300, 5) + S.person('agent', 620, 250, 0.45, 'arms') + bundle(620, 170, 0.6) + S.caption('Somewhere behind you, a government man holds something up.', 14, 40, 280),
      },
    });
  }
  {
    const base = S => S.bg({});
    const vane = (S, pose = 'point') => S.person('cv_hound', 560, 330, 0.9, pose, true);
    E.add('corpse_hound', {
      act: 4,
      scene: S => base(S) + vane(S) + rod(500, 210, 0.9).replace(/translate/, 'translate') + dog(S, 420, 330, 0.8) + me(S, 200, 330, 0.85) + relic(260, 270, 0.3) + S.bubble('I smell two of them on you.', 560, 42, 190, 570, 130) + S.kana('ピクッ', 440, 150, 36, -6, '#fff'),
      out: {
        0: S => base(S) + vane(S, 'draw') + `<g transform="translate(1000 0) scale(-1 1)">${rod(500, 220, 0, true)}</g>` + S.lines(360, 160, K, 30, 0.25) + us(S, 200, 330, 0.9, 'draw') + S.kana('シャキン', 380, 90, 48, -6, '#d0d4e0'),
        1: S => base(S) + monastery(140, 260, 0.8) + [...Array(8)].map((_, i) => candle(220 + i * 44, 300 + (i % 2) * 10)).join('') + S.person('cv_hound', 620, 330, 0.85, 'stand', true) + `<circle cx="560" cy="200" r="40" fill="none" stroke="${K}" stroke-width="2" stroke-dasharray="6 6"/>` + rod(540, 190, 0.4).replace(/M(\d+) /, 'M$1 ') + S.kana('クルクル', 580, 110, 40, 6, '#fff') + S.caption('Holy water and church candles, all the way to the wrong monastery.', 14, 40, 280),
        '1:fail': S => base(S) + vane(S, 'stand') + `<g transform="rotate(-20 360 280)">${dog(S, 360, 300, 1)}</g>` + me(S, 220, 330, 0.85, 'arms') + S.lines(300, 240, K, 30, 0.25) + S.kana('ガウッ', 380, 120, 48, -6, '#fff'),
        2: S => base(S) + vane(S, 'point') + dog(S, 460, 330, 0.7) + S.fx('coins', 380, 230, 1.2) + paper(450, 170, 80, 60, 6, 4) + me(S, 220, 330, 0.85, 'point') + S.bubble('Where they ride, how they signal.', 560, 42, 200, 570, 130),
      },
    });
    E.add('corpse_hound_back', {
      act: 4,
      scene: S => base(S) + monastery(700, 250, 0.6) + S.person('agent', 660, 330, 0.8, 'draw', true) + vane(S, 'point') + dog(S, 420, 330, 0.8) + me(S, 200, 330, 0.85) + S.bubble('Forty monks. I searched forty monks.', 440, 42, 220, 560, 130),
      out: {
        0: S => base(S) + S.person('agent', 660, 330, 0.8, 'draw', true) + vane(S, 'draw') + dog(S, 420, 330, 0.8) + us(S, 200, 330, 0.9, 'draw') + S.lines(400, 200, K, 30, 0.25) + S.kana('ドン!', 400, 90, 56, -6, '#fff'),
        1: S => base(S) + S.person('agent', 660, 330, 0.8, 'stand', true) + vane(S, 'arms') + relic(500, 150, 0.45) + dog(S, 420, 330, 0.8) + me(S, 220, 330, 0.85) + S.bubble('Pleasure doing business.', 20, 42, 180),
      },
    });
  }

  /* =================================================================== CUSTOM RIDER */
  const ghostStand = (x, y, s = 1, c = '#9a7ad0', op = 0.6) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}"><path d="M-40 0Q-50 -80 -30 -130Q0 -160 30 -130Q50 -80 40 0Z" fill="${c}" ${st}/><circle cx="0" cy="-150" r="26" fill="${c}" ${st}/><circle cx="-9" cy="-152" r="5" fill="#fff"/><circle cx="9" cy="-152" r="5" fill="#fff"/><text x="0" y="-60" font-size="50" text-anchor="middle" font-family="Anton,sans-serif" fill="#fff" stroke="${K}" stroke-width="2">?</text></g>`;
  {
    const cross = S => S.bg({}) + `<path d="M0 320L800 280M380 250L420 360" stroke="#c8a870" stroke-width="30" opacity=".6"/>` + S.prop('sign', 110, 300, 1, 'NORTH', 'SOUTH');
    E.add('cust_arrow', {
      act: 1,
      scene: S => cross(S) + S.person('collector', 520, 330, 0.9, 'point', true) + arrowhead(456, 210, 1.2, -80) + hum(456, 210, 20, '#f2c14e') + me(S, 280, 330, 0.85) + S.bubble('It hums near you. Interesting.', 540, 42, 200, 540, 140) + S.kana('ブゥゥン', 400, 110, 36, -6, '#f2c14e'),
      out: {
        0: S => cross(S) + S.person('collector', 620, 330, 0.85, 'stand', true) + `<g opacity=".55">${S.stand('star_platinum', 250, 300, 1.1)}${S.stand('killer_queen', 400, 290, 1.1)}${S.stand('gold_experience', 550, 300, 1.1)}</g>` + me(S, 400, 340, 0.85, 'arms') + arrowhead(440, 200, 0.8, 30) + S.fx('blood', 430, 210, 0.6) + S.lines(400, 180, '#c8a0e8', 30, 0.4) + S.kana('ズキュウゥン', 400, 60, 44, -4, '#c8a0e8'),
        '0:fail': S => night(S) + me(S, 400, 330, 0.85, 'down') + arrowhead(540, 320, 0.8, 80) + S.fx('blood', 380, 320, 0.8) + S.caption('You black out.', 14, 40, 140) + S.kana('ドサッ', 600, 150, 40, 6, '#fff'),
        1: S => cross(S) + ghostStand(560, 330, 1.1, '#6a8ad0', 0.55) + S.person('collector', 540, 330, 0.9, 'draw', true) + us(S, 250, 330, 0.9, 'draw') + S.lines(400, 180, K, 30, 0.25) + S.bubble('Then earn it.', 580, 42, 120, 560, 130),
        2: S => cross(S) + S.person('collector', 620, 330, 0.9, 'point', true) + arrowhead(420, 200, 1.1, -90) + speed(450, 560, 190, 210, 3) + S.fx('coins', 520, 300, 1) + me(S, 260, 330, 0.9, 'arms') + S.lines(300, 200, K, 30, 0.25) + S.kana('ビュッ', 420, 110, 50, -6, '#fff'),
        3: S => cross(S) + `<g opacity=".3">${S.person('collector', 620, 330, 0.9, 'stand', true)}</g>` + me(S, 200, 330, 0.85, 'stand', true) + S.bubble('Some people are wiser than they look.', 460, 42, 220, 610, 140),
      },
    });
  }
  {
    const desert = S => S.bg({}) + S.prop('saguaro', 700, 260, 0.9) + well(400, 310);
    const J = (S, x, y, s, flip) => rider(S, 'johnny', x, y, s, flip, { coat: '#2a2a3a', mane: '#1a1020', wrap: '#3b5bb5' });
    const G = (S, x, y, s, flip) => rider(S, 'gyro', x, y, s, flip, { coat: '#e8e0d0', mane: '#8a8a8a', wrap: '#3a8c4a' });
    const balls = (x, y) => [[-20, 0], [0, -30], [20, -6]].map(([a, b]) => `<circle cx="${x + a}" cy="${y + b}" r="9" fill="#c8c8d8" ${st}/><path d="M${x + a - 5} ${y + b}h10" stroke="${K}" stroke-width="1.5"/>`).join('');
    E.add('cust_companions', {
      act: 1,
      scene: S => desert(S) + S.person('gyro', 520, 330, 0.9, 'arms', true) + balls(520, 150) + J(S, 660, 330, 1, true) + me(S, 200, 330, 0.85) + S.bubble('Nyo-ho~. It kills idiots.', 280, 42, 170, 480, 150) + S.kana('GO GO', 560, 90, 30, 6, '#f2c14e'),
      out: {
        0: S => S.bg({}) + S.prop('saguaro', 700, 260, 0.9) + G(S, 250, 330, 0.95) + rider(S, lead(), 420, 336, 1) + J(S, 590, 330, 0.95) + S.fx('dust', 110, 320, 1) + S.caption('Three riders leave the well. Gyro complains all day.', 14, 40, 260),
        1: S => S.bg({}) + rider(S, lead(), 560, 330, 1.1) + G(S, 330, 330, 0.95) + J(S, 180, 336, 0.9) + speed(20, 180, 220, 300, 6) + S.bubble('Fine! You ride with us, stray.', 30, 42, 200, 330, 180),
        '1:fail': S => S.bg({}) + G(S, 620, 290, 0.6) + J(S, 710, 296, 0.6) + S.fx('dust', 560, 290, 0.8) + rider(S, lead(), 220, 330, 1) + sweat(260, 200) + S.bubble('Come find us when you can keep up.', 440, 42, 220, 680, 190),
        2: S => desert(S) + S.person('gyro', 520, 330, 0.85, 'stand', true) + J(S, 660, 330, 1, true) + rider(S, lead(), 150, 330, 1, true) + S.bubble('Suit yourself.', 420, 42, 130, 510, 150),
      },
    });
  }
  {
    const mesa = S => S.bg({ horizon: 270 }) + `<path d="M100 270L160 160H640L700 270Z" fill="#c07a5a" ${st}/>` + `<path d="M400 160V40" stroke="${K}" stroke-width="10"/><path d="M400 160V40" stroke="#8a5a34" stroke-width="5"/>`;
    const old = S => `<g transform="translate(400 38) rotate(180)">${S.person('breather', 0, 0, 0.6, 'stand')}</g>` + ripple(400, 42, 18);
    E.add('cust_hamon', {
      act: 1,
      scene: S => mesa(S) + old(S) + me(S, 180, 336, 0.85) + S.bubble('You breathe like a frightened horse.', 470, 60, 210, 420, 120) + S.kana('コォォ', 560, 200, 36, 6, '#ffd84a'),
      out: {
        0: S => mesa(S) + `<path d="M520 160V60" stroke="${K}" stroke-width="10"/><path d="M520 160V60" stroke="#8a5a34" stroke-width="5"/>` + old(S) + `<g transform="translate(520 58) rotate(180)">${S.person(lead(), 0, 0, 0.6)}</g>` + ripple(520, 62, 26) + sparkles(470, 100, 110, 60) + S.kana('波紋', 660, 120, 50, 6, '#ffd84a'),
        '0:fail': S => mesa(S) + old(S) + `<g transform="rotate(-60 300 200)">${S.person(lead(), 300, 260, 0.7)}</g>` + speed(250, 330, 60, 140, 4) + S.person('hamonkid', 600, 340, 0.85, 'point', true) + S.kana('ハハハ', 640, 120, 40, 6, '#fff') + S.kana('ドテッ', 300, 330, 36, 0, '#fff'),
        1: S => mesa(S) + old(S) + S.person('hamonkid', 520, 340, 0.9, 'point', true) + ripple(460, 230, 24) + S.fx('spark', 440, 230, 1.2) + me(S, 300, 340, 0.9, 'point') + S.bubble('Learn it the hard way, then.', 560, 42, 190, 540, 150) + S.lines(440, 230, K, 30, 0.25),
        2: S => mesa(S) + old(S) + me(S, 300, 340, 0.9, 'arms') + ripple(300, 250, 50) + sparkles(230, 140, 150, 100, '#ffd84a', 5) + S.kana('スゥゥ', 180, 140, 40, -6, '#ffd84a'),
      },
    });
  }
  {
    const base = S => S.bg({}) + S.prop('wagon', 600, 310, 1.3) + `<rect x="330" y="270" width="110" height="60" fill="#b8844a" ${st}/><text x="385" y="306" font-size="16" text-anchor="middle" font-family="Anton,sans-serif" fill="#c8323c">FRAGILE</text>`;
    const zombie = (S, x, flip = true, pose = 'stand') => S.person('maskzombie', x, 330, 0.85, pose, flip) + `<path d="M${x - 10} ${330 - 176 * 0.85}l-4 -14M${x} ${330 - 180 * 0.85}v-16M${x + 10} ${330 - 176 * 0.85}l4 -14" stroke="#f6ecd8" stroke-width="3"/>`;
    E.add('cust_mask', {
      act: 3,
      scene: S => base(S) + stoneMask(S, 385, 250, 0.8) + zombie(S, 540) + S.fx('blood', 520, 230, 0.5) + me(S, 200, 330, 0.85) + S.caption('He is not breathing, and he is still standing.', 14, 40, 250),
      out: {
        0: S => base(S) + zombie(S, 560, true, 'arms') + zombie(S, 680, true, 'arms') + me(S, 300, 330, 0.95, 'arms') + stoneMask(S, 300, 200, 0.9, '#e8323c') + [...Array(6)].map((_, i) => `<path d="M${270 + i * 12} 170l${-8 + i * 3} -26" stroke="#f6ecd8" stroke-width="3"/>`).join('') + S.fx('blood', 320, 240, 0.8) + S.lines(300, 180, '#e8323c', 36, 0.4) + S.kana('WRYYY', 460, 80, 50, -6, '#e8323c'),
        1: S => S.bg({}) + building(460, 280, 280, 150, '#a88a6a', 'CURIOS') + S.person('cardsharp', 560, 330, 0.85, 'point', true) + stoneMask(S, 440, 220, 0.6) + S.fx('coins', 360, 250, 1.4) + me(S, 260, 330, 0.85) + S.caption('He pays in gold and asks no questions.', 14, 40, 240),
        2: S => base(S) + zombie(S, 600, true, 'arms') + me(S, 250, 330, 0.9, 'arms') + stoneMask(S, 385, 250, 0.8) + `<path d="M372 190L390 230L378 260L396 290" fill="none" stroke="${K}" stroke-width="4"/>` + S.prop('rock', 320, 150, 1.2) + S.fx('boom', 385, 230, 0.6) + S.kana('パキィン', 450, 100, 48, -6, '#fff'),
      },
    });
  }
  {
    const base = S => S.bg({}) + S.prop('wagon', 560, 310, 1.3) + `<path d="M470 280L500 250" stroke="${K}" stroke-width="3"/>`;
    const doc = (S, pose = 'point', x = 460) => S.person('surgeon', x, 330, 0.9, pose, true) + `<circle cx="${x - 12}" cy="${330 - 150}" r="8" fill="none" stroke="#f2c14e" stroke-width="2.5"/>`;
    E.add('cust_surgeons', {
      act: 3,
      scene: S => base(S) + doc(S) + me(S, 260, 330, 0.85, 'down') + S.fx('blood', 240, 320, 0.8) + S.bubble('Ja. We can rebuild you. Better.', 470, 42, 210, 470, 140),
      out: {
        0: S => base(S) + doc(S, 'arms') + me(S, 260, 330, 0.9, 'draw') + `<rect x="300" y="210" width="50" height="16" fill="#8a8a9a" ${st}/><circle cx="352" cy="218" r="6" fill="${K}"/><circle cx="260" cy="250" r="14" fill="#c8c8d8" ${st}/><path d="M260 240v20M250 250h20" stroke="${K}" stroke-width="2"/>` + S.kana('カチ カチ', 200, 150, 30, -6, '#fff') + S.bubble('German science is the best in the world!', 460, 42, 230, 460, 140),
        1: S => base(S) + doc(S, 'stand') + me(S, 260, 330, 0.9) + `<path d="M232 200l56 12M232 230l56 -8" stroke="#fff" stroke-width="7"/><path d="M232 200l56 12M232 230l56 -8" stroke="${K}" stroke-width="1" fill="none"/>` + S.caption('Morphine, stitches, and a lecture about hygiene.', 14, 40, 250),
        2: S => night(S) + S.prop('wagon', 560, 310, 1.3) + S.person('surgeon', 460, 330, 0.85, 'down') + zzz(430, 280) + me(S, 260, 330, 0.85, 'kneel') + S.prop('crates', 340, 330, 0.8) + S.kana('コソコソ', 200, 130, 36, -6, '#fff'),
        '2:fail': S => night(S) + S.prop('wagon', 560, 310, 1.3) + doc(S, 'draw') + me(S, 260, 330, 0.85, 'arms') + S.bubble('Undankbar.', 470, 42, 110, 460, 140) + S.lines(360, 200, K, 30, 0.25),
      },
    });
  }
  {
    const shop = S => S.bg({ pal: 'inside', inside: true, horizon: 260 }) + `<rect x="250" y="220" width="320" height="50" fill="#6a3a2a" ${st}/>` + win(620, 60, 120, 110, '#f6d8a0');
    const box = (open = true) => `<rect x="380" y="196" width="60" height="26" fill="#6a1a3a" ${st}/>${open ? `<circle cx="410" cy="196" r="10" fill="#e8323c" ${st}/>` : ''}`;
    E.add('cust_aja', {
      act: 4,
      scene: S => shop(S) + S.person('cardsharp', 440, 220, 0.75, 'point', true) + box() + `<path d="M680 110L416 192" stroke="#fff3c0" stroke-width="4" opacity=".7"/><path d="M404 190L60 110" stroke="#ff3040" stroke-width="7"/><circle cx="56" cy="108" r="16" fill="${K}"/>` + S.fx('smoke', 56, 100, 0.6) + me(S, 180, 340, 0.85) + S.bubble('It is not for sale.', 530, 200, 140, 470, 170),
      out: {
        0: S => shop(S) + S.person('cardsharp', 480, 220, 0.7, 'stand', true) + me(S, 300, 340, 0.95, 'point') + `<circle cx="360" cy="236" r="40" fill="#ff3040" opacity=".3"/><circle cx="356" cy="236" r="12" fill="#e8323c" ${st}/>` + S.lines(356, 236, '#e8323c', 30, 0.35) + S.fx('coins', 420, 200, 1) + S.kana('ドクン', 560, 100, 44, 6, '#e8323c'),
        1: S => shop(S) + `<path d="M620 60L740 170M740 60L620 170" stroke="${K}" stroke-width="3"/>` + [...Array(6)].map((_, i) => `<path d="M${600 + i * 30} ${90 + (i % 3) * 30}l12 8 -6 10z" fill="#cfe6f4" ${s2}/>`).join('') + `<g transform="rotate(-30 680 170)">${S.person(lead(), 680, 250, 0.7, 'arms')}</g>` + S.person('cardsharp', 400, 220, 0.75, 'arms', true) + S.kana('ガシャーン', 400, 90, 44, -6, '#fff'),
        '1:fail': S => shop(S) + S.person('thug', 470, 340, 0.85, 'draw', true) + S.person('thug', 600, 340, 0.85, 'draw', true) + me(S, 220, 340, 0.85, 'arms') + box() + S.lines(300, 200, K, 30, 0.25) + S.kana('ジャキッ', 540, 90, 44, 6, '#fff'),
        2: S => shop(S) + S.person('cardsharp', 440, 220, 0.75, 'stand', true) + box() + me(S, 160, 340, 0.85, 'stand', true) + S.caption('Some power is not meant to be held.', 14, 40, 240),
      },
    });
  }
  E.add('arrow_chooses', {
    scene: S => night(S) + fire(S, 620, 330, 0.5) + me(S, 260, 330, 0.85, 'kneel') + arrowhead(420, 170, 1.4, -90) + hum(420, 170, 26, '#c8a0e8') + `<path d="M400 170H320" stroke="#c8a0e8" stroke-width="3" stroke-dasharray="6 6"/>` + S.kana('ブゥゥン', 520, 100, 40, 6, '#c8a0e8') + S.caption('It points. Always at you.', 14, 40, 200),
    out: {
      0: S => night(S) + ghostStand(420, 320, 1.3, '#9a7ad0', 0.6) + me(S, 280, 330, 0.9, 'arms') + arrowhead(300, 200, 0.8, 20) + S.fx('blood', 300, 214, 0.5) + S.lines(400, 180, '#c8a0e8', 36, 0.4) + S.kana('ズキュン', 600, 90, 48, 6, '#c8a0e8'),
      '0:fail': S => night(S) + me(S, 360, 330, 0.85, 'down') + S.fx('blood', 330, 322, 1) + arrowhead(520, 310, 0.9, 80) + hum(520, 300, 16, '#c8a0e8') + S.caption('It will ask again.', 14, 40, 160),
      1: S => night(S) + fire(S, 620, 330, 0.5) + me(S, 260, 330, 0.85, 'kneel') + bundle(400, 330, 1.2) + hum(400, 310, 22, '#c8a0e8') + S.kana('ブゥン', 440, 200, 30, 0, '#c8a0e8'),
    },
  });

  /* =================================================================== HORSES */
  {
    const corral = S => S.bg({}) + S.prop('barn', 690, 250, 0.8) + fence(20, 520, 300) + S.horse(140, 290, 0.8, { coat: '#c8a878', mane: '#5a3a1a', wrap: '#6a8a5a' }) + S.horse(330, 286, 0.8, { coat: '#4a3a3a', mane: '#1a1020', wrap: '#c8323c' }, true) + fence(20, 520, 336);
    const trader = (S, pose = 'stand') => S.person('trapper', 610, 330, 0.9, pose, true);
    const traded = i => S => corral(S) + trader(S, 'point') + S.horse(470, 336, 1.1, horseByName(choiceLabel('horsedealer', i))) + rope(560, 222, 530, 250, 6) + me(S, 300, 336, 0.85, 'stand') + S.fx('coins', 640, 240, 1) + S.bubble('Their horses still want to run.', 20, 42, 200) + S.kana('ヒヒーン', 480, 110, 40, -6, '#fff');
    E.add('horsedealer', {
      scene: S => corral(S) + trader(S) + me(S, 470, 340, 0.85) + S.horse(300, 348, 0.9, myHorse()) + sweat(330, 240) + S.bubble('Yours looks tired. Want to trade?', 560, 42, 200, 600, 140),
      out: {
        0: traded(0),
        1: traded(1),
        2: S => corral(S) + S.horse(300, 340, 1.1, myHorse()) + anvil(530, 336) + S.person('trapper', 610, 330, 0.9, 'point', true) + horseshoe(520, 280, 1.2, '#e8742a') + S.fx('spark', 500, 276, 1.2) + S.kana('カーン', 520, 150, 44, 6, '#fff') + me(S, 150, 340, 0.8),
      },
    });
  }
  {
    const trail = S => S.bg({}) + S.prop('saguaro', 90, 260, 0.8) + grave(560, 330);
    const stray = () => horseByName(choiceLabel('riderless', 0));
    E.add('riderless', {
      scene: S => trail(S) + S.horse(380, 330, 1.2, stray()) + `<path d="M430 290Q460 320 480 336" fill="none" stroke="#6a3a1a" stroke-width="4"/>` + me(S, 170, 336, 0.8) + S.T(420, 150, 1, S.kana('…', 0, 0, 40, 0, '#fff')) + S.caption('Its rider fell on the trail. Nobody came back for the horse.', 14, 40, 270),
      out: {
        0: S => trail(S) + rider(S, lead(), 370, 336, 1.15, false, stray()) + `<g opacity=".8">${S.horse(130, 290, 0.6, myHorse(), true)}</g>` + S.caption('Your old horse wanders off toward the grass.', 14, 40, 250),
        1: S => S.bg({ pal: 'dusk' }) + grave(420, 330, '#' + ((SBR.run && SBR.run.stage) || 7) * 13) + me(S, 270, 336, 0.85, 'kneel') + `<g opacity=".85">${S.horse(660, 300, 0.7, stray())}</g>` + S.kana('南無', 560, 120, 40, 6, '#fff'),
        2: S => trail(S) + S.horse(420, 330, 1.1, stray()) + saddlebag(250, 330, 1.2, true) + S.fx('coins', 250, 270, 1.2) + paper(320, 300, 40, 30, 12, 2) + me(S, 170, 336, 0.85, 'kneel') + S.kana('ガサ', 280, 150, 36, -6, '#fff'),
      },
    });
  }

  /* =================================================================== CHECKPOINTS */
  {
    const post = S => S.bg({}) + S.prop('banner', 400, 170, 0.9, 180, 'STEEL BALL RUN') + tent(S, 660, 300, 1.2, '#f6ecd8') + S.prop('flag', 90, 300, 1);
    const official = (S, x = 470, pose = 'stand') => S.person('steven', x, 330, 0.85, pose, true) + `<path d="M${x - 16} ${330 - 96 * 0.85}h14" stroke="#fff" stroke-width="7"/>`;
    const desk = () => table(430, 340, 200, '#6a4a2a', '#e8e0c8');
    E.add('checkpoint_toll', {
      scene: S => post(S) + official(S) + desk() + paper(420, 276, 50, 26, 0, 2) + us(S, 230, 336, 0.85) + S.bubble('Stage fee. You pay for Mr. Steel.', 470, 200, 200, 480, 190),
      out: {
        0: S => post(S) + official(S, 470, 'point') + desk() + `<g transform="rotate(-12 400 270)"><rect x="370" y="256" width="70" height="30" fill="none" stroke="#c8323c" stroke-width="4"/><text x="405" y="279" font-size="20" text-anchor="middle" font-family="Anton,sans-serif" fill="#c8323c">PAID</text></g>` + paper(330, 200, 60, 70, 8, 5, 'RANK') + S.fx('coins', 460, 276, 0.8) + us(S, 230, 336, 0.85, 'point'),
        1: S => night(S) + tent(S, 560, 300, 1.2, '#b8b0a0') + lanternGlow(560, 250) + rider(S, lead(), 220, 336, 1) + speed(80, 150, 240, 300, 4) + S.kana('シーッ', 160, 110, 40, -6, '#fff') + S.caption('Nobody sees you.', 14, 40, 160),
        '1:fail': S => night(S) + tent(S, 660, 300, 1.2, '#b8b0a0') + rider(S, lead(), 240, 336, 1) + lanternGlow(470, 230) + S.person('deputy', 470, 336, 0.85, 'point', true) + paper(420, 230, 40, 50, -6, 3) + S.bubble('Number noted.', 480, 42, 130, 480, 150),
        2: S => S.bg({ pal: 'inside', inside: true, horizon: 270 }) + cot(260, 320, 180) + cot(560, 320, 180) + S.person('doctor', 420, 330, 0.85, 'point', true) + me(S, 250, 300, 0.7, 'down') + zzz(200, 250) + `<path d="M500 250h24M512 238v24" stroke="#c8323c" stroke-width="8"/>` + S.caption('A real doctor, real bandages, real sleep.', 14, 40, 240),
      },
    });
    const station = S => S.bg({}) + tent(S, 620, 300, 1.4, '#f6ecd8') + [120, 170, 145].map((x, i) => S.prop('barrel', x, 300 - (i === 2 ? 50 : 0), 0.9)).join('') + S.prop('banner', 380, 160, 0.7, 140, 'RELIEF');
    E.add('checkpoint_water', {
      scene: S => station(S) + camera(420, 336, 1) + S.person('bounty', 480, 336, 0.8, 'point', true) + us(S, 260, 336, 0.85) + S.caption('No fee here. Water, oats and cots.', 14, 40, 230),
      out: {
        0: S => S.bg({ pal: 'inside', inside: true, horizon: 270 }) + cot(260, 320, 200) + cot(560, 320, 200) + me(S, 260, 300, 0.7, 'down') + (buddy() ? S.person(buddy(), 560, 300, 0.7, 'down') : '') + zzz(210, 250) + zzz(510, 250) + S.kana('グー', 400, 120, 40, 0, '#fff'),
        1: S => station(S) + camera(560, 336, 1, true) + S.person('bounty', 620, 336, 0.8, 'stand', true) + us(S, 300, 336, 0.9, 'point') + `<circle cx="300" cy="200" r="120" fill="#fff" opacity=".35"/>` + S.kana('パシャ!', 460, 90, 50, -6, '#fff') + S.fx('coins', 400, 290, 0.9),
        2: S => station(S) + rider(S, lead(), 330, 336, 1.1, true) + `<rect x="240" y="226" width="24" height="30" rx="6" fill="#6a8a5a" ${st}/>` + speed(440, 560, 230, 300, 5) + S.kana('ダッ', 200, 110, 44, -6, '#fff'),
      },
    });
    const insp = S => S.bg({}) + S.prop('banner', 400, 150, 0.7, 160, 'INSPECTION') + desk() + saddlebag(420, 286, 0.9, true);
    const pinned = (S, x, pose = 'stand') => S.person('agent', x, 330, 0.85, pose, true) + star(x - 14, 330 - 100 * 0.85, 7, '#f2c14e');
    const held = () => SBR.run && Object.keys(SBR.run.mats || {}).some(k => /^c_/.test(k) && SBR.run.mats[k] > 0);
    E.add('checkpoint_search', {
      scene: S => insp(S) + official(S, 520) + pinned(S, 640) + us(S, 220, 336, 0.85) + (held() ? relic(420, 250, 0.35, false) : '') + S.caption(held() ? 'They are looking for something that doesn\'t rot.' : 'Saddlebags, "for contraband."', 14, 40, 250),
      out: {
        0: S => insp(S) + pinned(S, 560, 'point') + (held() ? `<path d="M470 210q14 -20 30 -8q-10 20 -30 8z" fill="#8a5a34" ${st}/>` : '') + S.T(560, 120, 1, S.kana('?', 0, 0, 40, 0, '#fff')) + me(S, 240, 336, 0.85) + sweat(270, 190),
        '0:fail': S => insp(S) + pinned(S, 560, 'draw') + pinned(S, 680, 'draw') + relic(460, 230, 0.5) + `<path d="M480 240q-20 -10 -40 0" stroke="${K}" stroke-width="12" stroke-linecap="round"/>` + rider(S, lead(), 220, 336, 1, true) + S.fx('bang', 520, 230, 0.8) + S.bubble('Well now.', 580, 42, 100, 560, 140),
        1: S => insp(S) + official(S, 500, 'point') + pinned(S, 650) + S.fx('coins', 440, 270, 1) + me(S, 300, 336, 0.85, 'point') + S.bubble('Clean!', 520, 42, 80, 500, 140) + S.T(650, 120, 1, S.kana('ムッ', 0, 0, 30, 0, '#fff')),
        2: S => S.bg({}) + `<path d="M380 290H560" stroke="${K}" stroke-width="4"/><path d="M380 270V300M560 270V300" stroke="${K}" stroke-width="5"/>` + `<g transform="rotate(-14 470 300)">${rider(S, lead(), 470, 300, 1.1)}</g>` + pinned(S, 680, 'arms') + speed(240, 360, 200, 270, 5) + S.kana('ヒラリ', 480, 80, 44, -6, '#fff'),
        '2:fail': S => S.bg({}) + pinned(S, 460, 'point') + S.person('agent', 560, 330, 0.85, 'arms', true) + me(S, 330, 336, 0.85, 'down') + S.horse(660, 300, 0.7, myHorse(), true) + S.fx('dust', 330, 320, 1.1) + S.kana('ドサッ', 300, 150, 44, -6, '#fff'),
      },
    });
    const hall = S => S.bg({}) + S.prop('banner', 400, 150, 0.7, 160, 'PROTEST') + desk();
    E.add('checkpoint_penalty', {
      scene: S => hall(S) + official(S, 480) + paper(420, 262, 60, 36, -4, 3, 'PROTEST') + S.person('gunslinger', 640, 336, 0.85, 'point', true) + me(S, 220, 336, 0.85) + S.bubble('Cut across private land!', 560, 42, 180, 640, 140),
      out: {
        0: S => hall(S) + official(S, 480) + stove(640, 336) + paper(620, 220, 40, 26, 30, 2) + S.fx('coins', 420, 276, 0.8) + me(S, 240, 336, 0.85) + S.kana('ボッ', 660, 160, 40, 6, '#e8742a'),
        1: S => hall(S) + official(S, 520, 'point') + paper(410, 250, 110, 70, -4, 0) + `<path d="M370 260Q400 230 420 262T460 250" fill="none" stroke="#c8323c" stroke-width="4"/><path d="M372 270l10 -10" stroke="${K}" stroke-width="3"/>` + me(S, 260, 336, 0.9, 'point') + S.kana('ビリッ', 620, 100, 40, 6, '#fff'),
        '1:fail': S => hall(S) + official(S, 480, 'point') + clock(620, 150, 44, 1) + `<text x="620" y="230" font-size="28" text-anchor="middle" font-family="Anton,sans-serif" fill="#c8323c" stroke="${K}" stroke-width="1.5">+10</text>` + me(S, 260, 336, 0.85, 'arms') + S.person('gunslinger', 700, 336, 0.8, 'arms', true),
        2: S => hall(S) + official(S, 480) + clock(620, 150, 44, 0.5) + `<text x="620" y="230" font-size="28" text-anchor="middle" font-family="Anton,sans-serif" fill="#c8323c" stroke="${K}" stroke-width="1.5">+6</text>` + me(S, 260, 336, 0.85) + S.bubble('Add it. I\'ll make it up.', 20, 42, 180),
      },
    });
    const crowd = S => S.bg({}) + tent(S, 400, 260, 2, '#f6ecd8') + ['marco', 'coach', 'doctor', 'mason'].map((k, i) => S.person(k, 420 + i * 90, 336 + (i % 2) * 6, 0.75, i % 2 ? 'point' : 'stand', true)).join('') + camera(760, 336, 0.8, true);
    const news = (head, x = 400, y = 170) => `<g transform="translate(${x} ${y}) rotate(-6)"><rect x="-150" y="-110" width="300" height="200" fill="#f6ecd8" ${st}/><text x="0" y="-80" font-size="14" text-anchor="middle" font-family="Oswald,sans-serif" fill="${K}">THE DAILY TRAIL</text><path d="M-140 -72H140" stroke="${K}" stroke-width="2"/><text x="0" y="-38" font-size="26" text-anchor="middle" font-family="Anton,sans-serif" fill="${K}">${head}</text>${[...Array(6)].map((_, i) => `<path d="M-130 ${-10 + i * 14}H${i % 2 ? 40 : 130}" stroke="${K}" stroke-width="2" opacity=".5"/>`).join('')}</g>`;
    E.add('checkpoint_press', {
      scene: S => crowd(S) + me(S, 240, 336, 0.9) + S.bubble('Who\'s going to win? Who\'s cheating?', 440, 42, 220, 470, 140) + S.kana('パシャ', 720, 100, 40, 6, '#fff'),
      out: {
        0: S => S.bg({}) + news('A GENTLEMAN!') + S.bust(lead(), 520, 250, 0.7) + S.person('gunslinger', 700, 336, 0.8, 'arms', true),
        1: S => S.bg({}) + news('PRESIDENT BUYING RACE?') + S.bust(lead(), 530, 250, 0.7) + `<rect x="620" y="30" width="160" height="110" fill="#e8e0d0" ${st}/>` + S.bust('valentine', 700, 140, 0.8) + S.kana('ムッ', 740, 60, 30, 6, '#fff'),
        2: S => crowd(S) + me(S, 300, 336, 0.9, 'point') + S.fx('coins', 380, 250, 1.1) + S.bubble('...and then it grew legs.', 20, 42, 190) + S.kana('ヒソヒソ', 360, 110, 36, -6, '#fff'),
      },
    });
  }
})();
