/* Stand figures: drawn SVG for every Stand, redrawn from the manga's designs (colours from the colour manga and
   All-Star Battle). Shown briefly when a Stand ability fires; "entity" Stands also hover beside their user.
   Several SBR Stands are not figures at all (Wired, Tubular Bells, Chocolate Disco, Catch the Rainbow...), so they
   are drawn as the object or effect the manga shows. viewBox is always 0 0 120 160. */
'use strict';
SBR.stands = (() => {
  const K = '#1a1020';
  const st = `stroke="${K}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
  const th = `stroke="${K}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"`;
  const F = (c, s = st) => `fill="${c}" ${s}`;
  let n = 0;
  const starPts = (cx, cy, R, r = R * 0.45) => [...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; return `${(cx + Math.cos(a) * q).toFixed(1)},${(cy + Math.sin(a) * q).toFixed(1)}`; }).join(' ');
  const star = (x, y, R, c, s = th) => `<polygon points="${starPts(x, y, R)}" fill="${c}" ${s}/>`;
  const heart = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 4C-4-1-9-1-9 3c0 4 9 9 9 9s9-5 9-9c0-4-5-4-9 1z" fill="${c}" ${th}/>`;
  const shine = (x, y, r = 3) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="#fff" opacity=".8" transform="rotate(-30 ${x} ${y})"/>`;
  /** a double-stroked line: ink outline under a coloured core */
  const rope = (d, c, w = 3) => `<path d="${d}" fill="none" stroke="${K}" stroke-width="${w + 2.4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const wrap = (inner, aura = '#fff') => { const id = 'so' + (++n); return `<svg class="stand-svg" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="${id}"><stop offset="0" stop-color="${aura}" stop-opacity=".55"/><stop offset="1" stop-color="${aura}" stop-opacity="0"/></radialGradient></defs><ellipse cx="60" cy="84" rx="58" ry="76" fill="url(#${id})"/>${inner}</svg>`; };
  const mirror = s => `<g transform="translate(120 0) scale(-1 1)">${s}</g>`;

  /* ---------- Tusk: an axolotl-like critter that grows into a robot ---------- */
  const TP = '#f4a6c8', TP2 = '#d9709f';
  function tusk1() {
    const feelers = [0, 1, 2, 3].map(i => rope(`M34 ${56 + i * 8}q-6-5-11 0t-11 ${i - 1}`, TP, 2.6)).join('');
    const tendrils = [44, 54, 66, 76].map((x, i) => rope(`M${56 + i * 3} 116Q${x} 126 ${x - 2 + i * 1.5} 134`, TP, 2) + heart(x - 2 + i * 1.5, 132, 0.5, '#8a2040')).join('');
    return wrap(`
      <path d="M46 50Q32 22 38 6Q50 20 54 46z" ${F(TP)}/><path d="M74 50Q88 22 82 6Q70 20 66 46z" ${F(TP)}/>
      <path d="M44 42Q38 24 40 14M76 42Q82 24 80 14" stroke="${TP2}" stroke-width="2" fill="none"/>
      ${feelers}${mirror(feelers)}${tendrils}
      <ellipse cx="60" cy="104" rx="14" ry="13" ${F(TP)}/>
      <ellipse cx="45" cy="102" rx="5" ry="4" ${F(TP)}/><ellipse cx="75" cy="102" rx="5" ry="4" ${F(TP)}/>
      <path d="M60 116v8" ${st}/><ellipse cx="60" cy="126" rx="5" ry="3" ${F(TP)}/>
      ${star(54, 104, 3.2, '#fff3a0')}${star(66, 100, 2.6, '#fff3a0')}
      <ellipse cx="60" cy="66" rx="28" ry="24" ${F(TP)}/>
      ${star(60, 50, 7, '#fff3a0', st)}
      <path d="M45 63l9-4M75 63l-9-4" stroke="${K}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="51" cy="68" r="3.4" fill="${K}"/><circle cx="69" cy="68" r="3.4" fill="${K}"/><circle cx="52" cy="67" r="1" fill="#f2c14e"/><circle cx="70" cy="67" r="1" fill="#f2c14e"/>
      <path d="M54 74h12l-6 14z" ${F('#f2d060')}/>
    `, TP);
  }
  function tusk2() {
    const barrel = x => `<path d="M${x + 2} 64v8" ${st}/><rect x="${x - 6}" y="72" width="16" height="22" rx="6" ${F('#7a4ab0')}/><path d="M${x - 6} 79h16M${x - 6} 87h16" ${th}/>`;
    return wrap(`
      <path d="M48 46Q38 26 42 14Q52 24 56 44z" ${F(TP)}/><path d="M72 46Q82 26 78 14Q68 24 64 44z" ${F(TP)}/>
      ${barrel(22)}${barrel(94)}
      <path d="M56 124h8v14h-8z" ${F('#f2c14e')}/>
      <rect x="44" y="136" width="32" height="18" rx="7" ${F('#7a4ab0')}/><path d="M44 145h32" ${th}/><circle cx="60" cy="145" r="3" fill="#f2c14e" ${th}/>
      <path d="M40 102Q40 86 60 86Q80 86 80 102Q80 124 60 126Q40 124 40 102z" ${F(TP)}/>
      <path d="M40 98q-12 2-14 14l6 2q2-8 10-8z" ${F(TP)}/><path d="M80 98q12 2 14 14l-6 2q-2-8-10-8z" ${F(TP)}/>
      ${star(52, 106, 4, '#fff3a0', `stroke="#6ab8e8" stroke-width="1.6"`)}${star(68, 112, 3.4, '#fff3a0', `stroke="#6ab8e8" stroke-width="1.6"`)}
      <ellipse cx="60" cy="64" rx="30" ry="24" ${F(TP)}/>
      ${star(60, 48, 7, '#fff3a0', `stroke="#6ab8e8" stroke-width="2"`)}${star(38, 62, 3.4, '#fff3a0', `stroke="#6ab8e8" stroke-width="1.4"`)}${star(82, 62, 3.4, '#fff3a0', `stroke="#6ab8e8" stroke-width="1.4"`)}
      <path d="M46 62l8-3M74 62l-8-3" stroke="${K}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="51" cy="67" r="3.6" fill="${K}"/><circle cx="69" cy="67" r="3.6" fill="${K}"/><circle cx="52" cy="66" r="1.1" fill="#fff"/><circle cx="70" cy="66" r="1.1" fill="#fff"/>
      <path d="M54 72h12l-6 12z" ${F('#f2c14e')}/>
    `, TP);
  }
  function tusk3() {
    const shoulder = (x, y) => `<circle cx="${x}" cy="${y}" r="12" ${F('#b8a0e0')}/>${star(x, y, 8, 'none', `stroke="#f2c14e" stroke-width="2.4"`)}`;
    const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="7" ${F(TP)}/><path d="M${x - 3} ${y + 6}l-2 7M${x + 3} ${y + 6}l2 7" ${F('#f2c14e')}/>`;
    const foot = (x, d) => `<path d="M${x - 10} 150l${4 * d + 4} -10 ${-4 * d + 4} 0 ${4 * d + 4} 10z" ${F(TP)}/><path d="M${x - 10} 150l2 6M${x} 150l0 6M${x + 10} 150l-2 6" stroke="#f2c14e" stroke-width="2.4"/>`;
    return wrap(`
      <path d="M44 100l-4 42M76 100l4 42" stroke="${K}" stroke-width="10" stroke-linecap="round"/><path d="M44 100l-4 42M76 100l4 42" stroke="${TP}" stroke-width="6" stroke-linecap="round"/>
      ${foot(40, 1)}${foot(80, -1)}
      <path d="M30 64L22 98M90 64l8 34" stroke="${K}" stroke-width="9" stroke-linecap="round"/><path d="M30 64L22 98M90 64l8 34" stroke="${TP}" stroke-width="5" stroke-linecap="round"/>
      ${hand(22, 100)}${hand(98, 100)}
      <path d="M34 56Q60 40 86 56L88 96Q60 110 32 96z" ${F(TP)}/>
      <path d="M46 72q14 6 28 0M44 86q16 6 32 0" stroke="#f2c14e" stroke-width="2.6" fill="none"/>
      ${star(48, 96, 3.6, '#f2c14e')}${star(72, 96, 3.6, '#f2c14e')}
      ${shoulder(30, 58)}${shoulder(90, 58)}
      <path d="M58 70Q48 48 52 26Q58 8 72 18Q68 36 64 70z" ${F(TP2)}/><path d="M56 60Q52 40 58 22" stroke="#f2c14e" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="66" rx="12" ry="9" ${F(TP)}/>
      <circle cx="55" cy="64" r="2.8" fill="${K}"/><circle cx="65" cy="64" r="2.8" fill="${K}"/><path d="M56 71q4 2 8 0" ${th} fill="none"/>
      <g transform="translate(104 140)"><ellipse rx="14" ry="6" fill="#2a1a38" ${st}/><path d="M-8 0a8 3 0 1 0 16 0a5 2 0 1 0-10 0" fill="none" stroke="#e89ac8" stroke-width="1.6"/></g>
    `, TP);
  }
  function tusk4() {
    const ovals = [36, 48, 60, 72, 84].map(x => [0, 1, 2, 3, 4].map(j => `<ellipse cx="${x}" cy="${92 + j * 13}" rx="5.4" ry="7" ${F(TP, th)}/><path d="M${x} ${86 + j * 13}v12" stroke="#f2c14e" stroke-width="1" stroke-dasharray="2 2"/>`).join('')).join('');
    return wrap(`
      <path d="M22 60L14 104M98 60l8 44" stroke="${K}" stroke-width="13" stroke-linecap="round"/><path d="M22 60L14 104M98 60l8 44" stroke="${TP}" stroke-width="9" stroke-linecap="round"/>
      <rect x="6" y="100" width="16" height="16" rx="5" ${F('#f2c14e')}/><rect x="98" y="100" width="16" height="16" rx="5" ${F('#f2c14e')}/>
      <path d="M28 44H92L96 88H24z" ${F(TP)}/>
      <path d="M30 84q30 10 60 0" fill="none" stroke="${K}" stroke-width="2" stroke-dasharray="3 3"/>
      <rect x="30" y="148" width="18" height="8" rx="3" ${F('#f2c14e')}/><rect x="72" y="148" width="18" height="8" rx="3" ${F('#f2c14e')}/>
      ${ovals}
      <ellipse cx="22" cy="50" rx="14" ry="11" ${F('#b8a0e0')}/><ellipse cx="98" cy="50" rx="14" ry="11" ${F('#b8a0e0')}/>
      ${star(22, 50, 6, '#f2c14e')}${star(98, 50, 6, '#f2c14e')}${star(40, 30, 4, '#f2c14e')}${star(80, 30, 4, '#f2c14e')}
      <path d="M40 40Q40 20 60 18Q80 20 80 40" ${F(TP)}/>
      <circle cx="60" cy="58" r="16" ${F(TP)}/>
      <path d="M48 52a12 12 0 0 1 24 0" fill="none" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="M48 52a12 12 0 0 1 24 0" fill="none" stroke="#f2c14e" stroke-width="4" stroke-linecap="round"/>
      <circle cx="48" cy="52" r="1.6" fill="${K}"/><circle cx="72" cy="52" r="1.6" fill="${K}"/>
      <ellipse cx="60" cy="61" rx="6" ry="6" fill="${K}"/><circle cx="62" cy="59" r="2" fill="#fff"/>
      <path d="M52 69q8 4 16 0" ${th} fill="none"/>
    `, '#ffd84a');
  }

  /* ---------- Gyro, Pocoloco, Tim, Hot Pants, Wekapipo, Lucy ---------- */
  function ballbreaker() {
    const spots = [[50, 96], [62, 88], [74, 100], [46, 112], [66, 110], [58, 60], [70, 66]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="none" stroke="#e8508a" stroke-width="2"/>`).join('');
    const spiral = (x, y, d) => `<path d="M${x} ${y}m${-6 * d} 0a6 6 0 1 1 ${6 * d} 6a3.5 3.5 0 1 1 ${-3 * d}-4" fill="none" stroke="${K}" stroke-width="5"/><path d="M${x} ${y}m${-6 * d} 0a6 6 0 1 1 ${6 * d} 6a3.5 3.5 0 1 1 ${-3 * d}-4" fill="none" stroke="#f2c14e" stroke-width="2.6"/>`;
    const zap = [[14, 40], [104, 52], [10, 108], [108, 116], [30, 20], [92, 22]].map(([x, y]) => `<path d="M${x} ${y}l6 4-4 3 6 5" fill="none" stroke="#fff3a0" stroke-width="2"/>`).join('');
    return wrap(`${zap}
      <circle cx="60" cy="138" r="18" ${F('#b8bcc8')}/><path d="M52 132l8-5 8 5v8l-8 5-8-5z" fill="#8a8ea0" ${th}/>${shine(52, 128, 4)}
      <path d="M40 132Q30 104 44 82Q58 70 78 80Q92 96 82 132z" ${F('#a8e060')}/>
      <path d="M46 132l-4 8h10zM76 132l-2 8h10z" ${F('#3a8a3a')}/>
      <path d="M44 96q-12 8-12 22l6 2q2-12 10-16zM80 94q12 8 12 22l-6 2q-2-12-10-16z" ${F('#a8e060')}/>
      <ellipse cx="62" cy="54" rx="34" ry="11" ${F('#3a8a3a')}/>
      <circle cx="62" cy="64" r="15" ${F('#a8e060')}/>
      <path d="M44 52Q40 66 36 70M80 52q4 14 8 18" fill="none" stroke="${K}" stroke-width="1.4"/>
      ${spiral(40, 70, 1)}${spiral(84, 70, -1)}
      <path d="M54 64l5 1M70 64l-5 1" stroke="${K}" stroke-width="3" stroke-linecap="round"/><path d="M56 72q6 3 12 0" ${th} fill="none"/>
      ${spots}
    `, '#c8f080');
  }
  function heyya() {
    const hair = [48, 56, 64, 72].map((x, i) => `<rect x="${x - 3}" y="22" width="6" height="9" ${F('#3a9a5a', th)}/><path d="M${x} 22q${i % 2 ? 6 : -6}-6 ${i % 2 ? 2 : -2}-14" fill="none" stroke="#c8a070" stroke-width="2.4"/>`).join('');
    const chain = [0, 1, 2, 3].map(i => `<ellipse cx="60" cy="${82 + i * 7}" rx="3" ry="4" fill="none" stroke="${K}" stroke-width="2.4"/>`).join('');
    return wrap(`
      <path d="M54 110l-8 30M66 110l8 30" stroke="${K}" stroke-width="5" stroke-linecap="round"/><path d="M54 110l-8 30M66 110l8 30" stroke="#7a4ab0" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M38 140h14l2 6H36zM68 140h14l2 6H66z" ${F('#e8d8b8')}/>
      <path d="M46 80l-16 22M74 80l16 22" stroke="${K}" stroke-width="5" stroke-linecap="round"/><path d="M46 80l-16 22M74 80l16 22" stroke="#7a4ab0" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="28" cy="104" r="5" ${F('#e8d8b8')}/><circle cx="92" cy="104" r="5" ${F('#e8d8b8')}/>
      ${chain}
      <path d="M48 104h24l-3 10H51z" ${F('#7a4ab0')}/>
      <path d="M40 76h40l-6 8H46z" ${F('#7a4ab0')}/><ellipse cx="40" cy="78" rx="7" ry="5" ${F('#3a9a5a')}/><ellipse cx="80" cy="78" rx="7" ry="5" ${F('#3a9a5a')}/>
      <circle cx="40" cy="78" r="1.4" fill="${K}"/><circle cx="80" cy="78" r="1.4" fill="${K}"/>
      ${hair}
      <path d="M44 30H76L82 64H38z" ${F('#e8d8b8')}/><path d="M40 60h42" stroke="#3a9a5a" stroke-width="3"/>
      <ellipse cx="52" cy="44" rx="5" ry="7" fill="${K}"/><ellipse cx="69" cy="46" rx="4" ry="4" fill="${K}"/><circle cx="53" cy="42" r="1.4" fill="#fff"/>
      ${[46, 52, 58, 64, 70, 76].map(x => `<circle cx="${x}" cy="55" r="1.6" fill="#9a8a6a" ${th} stroke-width="1"/>`).join('')}
      <path d="M44 64h32v8q-16 5-32 0z" ${F('#e8d8b8')}/><circle cx="46" cy="66" r="1.6" fill="${K}"/><circle cx="74" cy="66" r="1.6" fill="${K}"/>
      <path d="M48 64l3 4 3-4 3 4 3-4 3 4 3-4 3 4 3-4" fill="#fff" ${th}/>
    `, '#f2c14e');
  }
  function lonesome() {
    const rp = 'M4 30Q30 20 46 44T78 96T116 140';
    const cut = (x, y, rx, ry, a) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${x} ${y})" fill="#5a2a7a" ${th}/>`;
    return wrap(`
      ${rope(rp, '#c8a070', 4)}<path d="${rp}" fill="none" stroke="#8a6a3a" stroke-width="1.4" stroke-dasharray="3 4"/>
      <g><circle cx="26" cy="24" r="11" ${F('#f0c8a0')}/><path d="M12 18q14-6 28 0-14 5-28 0z" ${F('#8a6a4a')}/><path d="M18 16q0-12 8-12t8 12z" ${F('#a07a4a')}/><circle cx="23" cy="25" r="1.6" fill="${K}"/><circle cx="30" cy="25" r="1.6" fill="${K}"/>${cut(28, 36, 9, 3.4, -20)}</g>
      <g><path d="M36 50l20-6 12 22-22 10z" ${F('#6a5a4a')}/><path d="M44 48l8 24" stroke="#e8d8b8" stroke-width="2"/>${cut(46, 47, 10, 3.4, -18)}${cut(57, 71, 12, 3.4, -24)}</g>
      <g><path d="M64 84l14-4 10 18-12 6z" ${F('#6a5a4a')}/>${cut(71, 82, 7, 3, -16)}${cut(82, 101, 7, 3, -28)}<circle cx="92" cy="104" r="5" ${F('#f0c8a0')}/></g>
      <g><path d="M92 116l10-2 8 20-10 4z" ${F('#3a3a5a')}/>${cut(97, 115, 5, 2.4, -10)}<path d="M100 138l12-2 2 8-14 2z" ${F('#5a3a2a')}/></g>
      <path d="M8 60q10 0 14 8M20 120q10-6 20-2" fill="none" stroke="#c8a070" stroke-width="1.6" stroke-dasharray="2 3"/>
    `, '#c8a070');
  }
  function creamstarter() {
    const can = (x, y, r) => `<g transform="rotate(${r} ${x + 12} ${y + 40})">
      <rect x="${x}" y="${y + 16}" width="24" height="56" rx="5" ${F('#f2c14e')}/>
      <path d="M${x} ${y + 26}h24M${x} ${y + 62}h24" ${th}/>${[0, 1, 2, 3].map(i => `<path d="M${x + 5 + i * 5} ${y + 64}v6" ${th}/>`).join('')}
      <path d="M${x + 3} ${y + 16}q9-10 18 0z" ${F('#e8b030')}/>
      <path d="M${x + 6} ${y + 8}h12a3 3 0 0 1 0 8h-12z" ${F('#e8d8b8')}/>${[0, 1, 2].map(i => `<circle cx="${x + 9 + i * 4}" cy="${y + 12}" r="1.2" fill="${K}"/>`).join('')}
      <path d="M${x + 24} ${y + 34}h7v20h-7" ${F('#c8a040')}/>${shine(x + 7, y + 34, 3)}</g>`;
    const puffs = [[92, 34, 9], [104, 26, 6], [100, 46, 7], [112, 40, 4], [84, 22, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${F('#d8a878', th)}/><circle cx="${x - r / 3}" cy="${y - r / 3}" r="${r / 3}" fill="#f0c8a0"/>`).join('');
    return wrap(`${can(18, 60, -8)}${can(52, 40, 12)}${puffs}<path d="M72 40l12-8" stroke="#d8a878" stroke-width="4" stroke-dasharray="2 3"/>`, '#f2c14e');
  }
  function wreckingball() {
    const id = 'wb' + (++n);
    const dimples = [[60, 60], [40, 74], [80, 74], [48, 98], [72, 98], [60, 82], [60, 114]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="9" fill="#6a7080" ${th}/><circle cx="${x + 0.5}" cy="${y + 0.5}" r="6" fill="url(#${id})" ${th}/>${i === 5 ? '' : shine(x - 2, y - 2, 1.6)}`).join('');
    const flying = [[104, 40], [14, 60], [100, 122]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.6" fill="url(#${id})" ${th}/><path d="M${x - (x > 60 ? 9 : -9)} ${y}h${x > 60 ? -12 : 12}M${x - (x > 60 ? 8 : -8)} ${y + 4}h${x > 60 ? -8 : 8}" stroke="#fff" stroke-width="1.6"/>`).join('');
    return wrap(`<defs><radialGradient id="${id}" cx=".35" cy=".35"><stop offset="0" stop-color="#f4f6fa"/><stop offset="1" stop-color="#8a90a0"/></radialGradient></defs>
      <path d="M8 86a52 52 0 0 1 104 0M16 86a44 44 0 0 1 88 0" fill="none" stroke="#c8c8d8" stroke-width="2" opacity=".7"/>
      <circle cx="60" cy="86" r="36" fill="url(#${id})" ${st}/>${dimples}${flying}`, '#c8c8d8');
  }
  function ticket() {
    const blade = (x, r) => `<g transform="rotate(${r} 60 58)"><path d="M${x - 3} 62Q${x - 5} 100 ${x} 136Q${x + 5} 100 ${x + 3} 62z" fill="#bdf0ff" ${th} opacity=".95"/><path d="M${x} 70v58" stroke="#fff" stroke-width="1.2"/></g>`;
    const rays = [...Array(14)].map((_, i) => `<path d="M60 50L${60 + Math.cos(i * 0.449) * 62} ${50 + Math.sin(i * 0.449) * 62}" stroke="#fff3a0" stroke-width="2" opacity=".6"/>`).join('');
    return wrap(`${rays}${blade(48, -8)}${blade(60, 0)}${blade(72, 8)}
      <path d="M26 50Q60 20 94 50Q60 76 26 50z" ${F('#fff')}/><circle cx="60" cy="50" r="12" fill="#5a8ad0" ${st}/><circle cx="60" cy="50" r="5" fill="${K}"/><circle cx="63" cy="46" r="2.4" fill="#fff"/>
      <path d="M26 50Q60 20 94 50" fill="none" stroke="${K}" stroke-width="4"/>${[32, 42, 52, 62, 72, 82].map(x => `<path d="M${x} ${x < 60 ? 42 - (x - 32) / 3 : 32 + (x - 62) / 3}l-2-7" stroke="${K}" stroke-width="2"/>`).join('')}
      <path d="M52 64q-2 6 0 10M68 64q2 6 0 10" stroke="#bdf0ff" stroke-width="3" fill="none"/>`, '#bdf0ff');
  }

  /* ---------- Diego ---------- */
  function scarymonsters(ferd) {
    const B = ferd ? '#9ac860' : '#7ec8f0', D = ferd ? '#4a7a3a' : '#2a4a9a';
    const spikes = [[80, 44, 70, 36], [82, 50, 70, 46], [84, 56, 74, 58]].map(([a, b, c, d]) => `<path d="M${a} ${b}L${c} ${d}" stroke="${K}" stroke-width="4"/><path d="M${a} ${b}L${c} ${d}" stroke="#fff3a0" stroke-width="2"/><circle cx="${c}" cy="${d}" r="3" fill="#fff3a0" ${th}/>`).join('');
    return wrap(`
      <path d="M50 102Q44 118 40 132L46 148L34 150L40 152" fill="none" stroke="${K}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 102Q44 118 40 132L46 148L34 150" fill="none" stroke="${D}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>
      <path d="M4 60Q24 80 44 86L42 100Q20 90 4 60z" ${F(D)}/><path d="M10 68Q26 84 42 94" stroke="#fff3a0" stroke-width="2.4" fill="none"/>
      <path d="M38 86Q52 72 74 76Q86 80 86 94Q78 110 56 112Q40 108 38 86z" ${F(B)}/>
      <path d="M44 102Q60 114 80 98Q70 110 56 110Q46 108 44 102z" fill="#fff3a0" ${th}/>
      ${[48, 56, 64].map(x => `<path d="M${x} 78l-2 10" stroke="${K}" stroke-width="3"/><path d="M${x + 3} 78l-2 9" stroke="#f2c14e" stroke-width="2"/>`).join('')}
      <path d="M74 84l8 6M72 90l8 6M78 82l-6 10M84 86l-6 10" stroke="#fff3a0" stroke-width="1.2"/>
      <path d="M72 78Q80 64 86 54L96 58Q90 74 84 90z" ${F(B)}/>
      <path d="M62 104Q74 108 70 122L64 136L72 146L86 148L66 152L54 138Q52 122 52 110z" ${F(D)}/><path d="M72 146q6-8 14 2" fill="none" stroke="#fff" stroke-width="2"/><path d="M70 144q-4 6 2 10" ${F('#fff', th)}/>
      <path d="M80 96q6 4 8 10M82 96q8 2 12 8" ${st} fill="none"/><path d="M88 106l2 3M94 104l3 2" stroke="#fff" stroke-width="2"/>
      ${spikes}
      <path d="M82 50Q94 40 112 50L118 56L100 58L114 62Q104 72 92 68Q82 64 82 50z" ${F(B)}/>
      <path d="M100 58l3 3 3-3 3 3 3-3M100 60l3-3 3 3 3-3 3 3" fill="none" stroke="#fff" stroke-width="1.6"/>
      <ellipse cx="96" cy="51" rx="4" ry="3.4" fill="#f2c14e" ${th}/><path d="M96 48v6" stroke="${K}" stroke-width="1.6"/>
      <path d="M90 46l10 2" stroke="${K}" stroke-width="2"/>
    `, ferd ? '#c8e04a' : '#7ec8f0');
  }
  /* muscular silhouette shared by the full-size humanoid Stands */
  const BODY = 'M40 50 Q60 42 80 50 L93 58 Q100 74 101 92 L92 96 L85 72 L82 104 L90 152 L75 152 L62 112 L58 112 L45 152 L30 152 L38 104 L35 72 L28 96 L19 92 Q20 74 27 58 Z';
  const SLIM = 'M46 52Q60 46 74 52L84 58Q90 76 90 94L84 96L78 72L76 106L82 152L70 152L62 112L58 112L50 152L38 152L44 106L42 72L36 96L30 94Q30 76 36 58z';
  function theworld() {
    const clock = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" ${F('#f6ecd8', th)}/><path d="M${x} ${y}v-${r - 1.5}M${x} ${y}l${r / 2} ${r / 3}" stroke="${K}" stroke-width="1.2"/>`;
    const hose = d => `<path d="${d}" fill="none" stroke="${K}" stroke-width="7"/><path d="${d}" fill="none" stroke="#c8a070" stroke-width="4.6" stroke-dasharray="2 1.4"/>`;
    return wrap(`
      <rect x="14" y="40" width="14" height="36" rx="7" ${F('#c8a070')}/><rect x="92" y="40" width="14" height="36" rx="7" ${F('#c8a070')}/>
      ${hose('M22 42Q24 26 46 26')}${hose('M98 42Q96 26 74 26')}
      <path d="${BODY}" ${F('#f2c14e')}/>
      <path d="M46 104L40 56M74 104l6-48" stroke="${K}" stroke-width="7"/><path d="M46 104L40 56M74 104l6-48" stroke="#c8a070" stroke-width="4.6" stroke-dasharray="3 1.4"/>
      <path d="M44 62q16 6 32 0M48 80q12 4 24 0" stroke="${K}" stroke-width="1.4" fill="none" opacity=".45"/>
      <rect x="36" y="100" width="48" height="8" ${F('#c8a070')}/>${heart(60, 100, 0.55, '#e8508a')}
      <path d="M38 128q6-8 12 0v6H38zM70 128q6-8 12 0v6H70z" ${F('#c8a070')}/>
      <path d="M18 88l10 4-2 8-10-3z" ${F('#c8a070')}/><path d="M102 88l-10 4 2 8 10-3z" ${F('#c8a070')}/>
      ${clock(22, 94, 4)}${clock(98, 94, 4)}${clock(30, 60)}${clock(90, 60)}${clock(40, 104, 3.4)}${clock(80, 104, 3.4)}
      <path d="M44 40Q44 16 60 12L86 0Q78 20 76 40L68 42L60 54L52 42z" ${F('#f2c14e')}/>
      <path d="M52 42L60 54L68 42z" fill="#f6d8b8" ${th}/>${heart(60, 45, 0.3, '#e8508a')}
      <path d="M49 30l8 2M71 30l-8 2" stroke="#e89a20" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M46 36h28" stroke="${K}" stroke-width="1.4"/>
    `, '#ffd84a');
  }

  /* ---------- Valentine ---------- */
  function d4c(love) {
    const B = '#a8d8f8', P = '#f09ac0';
    const seam = d => `<path d="${d}" fill="none" stroke="${P}" stroke-width="2.4"/><path d="${d}" fill="none" stroke="${K}" stroke-width="1" stroke-dasharray="1 3"/>`;
    const rays = love ? [...Array(13)].map((_, i) => `<rect x="${2 + i * 9}" y="0" width="${i % 2 ? 4 : 6}" height="160" fill="#ffe680" opacity="${0.25 + (i % 3) * 0.15}"/>`).join('') : '';
    const horns = love ? '' : `<path d="M50 22Q40 6 44 0Q54 6 56 20z" ${F(B)}/><path d="M70 22Q80 6 76 0Q66 6 64 20z" ${F(B)}/><path d="M48 14q2-6 0-10M72 14q-2-6 0-10" stroke="${P}" stroke-width="2" fill="none"/>`;
    return wrap(`${rays}
      <path d="${SLIM}" ${F(B)}/>
      ${seam('M44 62Q60 84 76 62')}${seam('M46 100Q60 86 74 100')}${seam('M40 74Q34 86 34 94M80 74q6 12 6 20')}${seam('M48 110Q46 130 44 150M72 110q2 20 4 40')}
      <path d="M48 104h24l4 14H44z" ${F(P)}/><path d="M60 104v14" ${th}/>
      <ellipse cx="38" cy="58" rx="9" ry="7" ${F(P)}/><ellipse cx="82" cy="58" rx="9" ry="7" ${F(P)}/>
      ${star(60, 76, 5, '#f6ecd8')}
      ${horns}
      <path d="${love ? 'M48 30Q48 14 60 14Q72 14 72 30L70 44Q60 50 50 44z' : 'M48 30Q48 16 60 16Q72 16 72 30L70 44Q60 50 50 44z'}" ${F(B)}/>
      ${love ? '<path d="M50 22l6 4-4 4M68 20l-4 6 6 2" stroke="#1a1020" stroke-width="1.4" fill="none"/>' : ''}
      <path d="M48 27q6-4 11-1M72 27q-6-4-11-1" stroke="${K}" stroke-width="2.6" stroke-linecap="round"/>
      <ellipse cx="54" cy="31" rx="3.4" ry="2.4" fill="${P}" ${th}/><ellipse cx="66" cy="31" rx="3.4" ry="2.4" fill="${P}" ${th}/><circle cx="54" cy="31" r="1" fill="${K}"/><circle cx="66" cy="31" r="1" fill="${K}"/>
      <path d="M50 36h20v7q-10 6-20 0z" ${F(P)}/><path d="M55 36v8M60 36v9M65 36v8" ${th}/>
    `, love ? '#ffe680' : '#a8d8f8');
  }

  /* ---------- The President's other Stand users ---------- */
  function mandom() {
    const tendril = (d, c) => rope(d, c, 3);
    const rivets = [26, 38, 50, 70, 82, 94].map(x => `<circle cx="${x}" cy="${96 + (x < 60 ? (60 - x) / 12 : (x - 60) / 12)}" r="1.8" fill="#6a6a7a"/>`).join('');
    return wrap(`
      ${tendril('M20 98Q4 70 18 44T12 8', '#f09ac0')}${tendril('M22 102Q8 124 20 146', '#f09ac0')}${tendril('M100 98Q116 70 102 44T108 8', '#f09ac0')}${tendril('M98 102q14 22 2 44', '#f09ac0')}
      <ellipse cx="22" cy="100" rx="9" ry="7" ${F('#f0a080')}/><ellipse cx="98" cy="100" rx="9" ry="7" ${F('#f0a080')}/>
      <path d="M20 90Q60 78 100 90L100 106Q60 94 20 106z" ${F('#c8ccd8')}/><path d="M20 98Q60 86 100 98" stroke="#8a90a0" stroke-width="1.4" fill="none"/>${rivets}
      <path d="M40 90Q40 58 60 56Q80 58 80 90z" ${F('#f09ac0')}/>
      <path d="M46 76L60 68L74 76L60 84zM46 76H34M74 76h12" fill="none" stroke="${K}" stroke-width="1.6"/>
      ${[[46, 76], [60, 68], [74, 76], [60, 84]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#f2c14e" ${th}/><circle cx="${x}" cy="${y}" r="1.4" fill="${K}"/>`).join('')}
      <path d="M50 60q10-4 20 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/>
    `, '#f09ac0');
  }
  function catchrainbow() {
    const id = 'cr' + (++n);
    const M = 'M30 40Q30 12 60 10Q90 12 90 40L88 96Q80 130 60 138Q40 130 32 96z';
    const drops = [[12, 30], [104, 24], [14, 96], [108, 90], [20, 140], [102, 146], [8, 62], [112, 58]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0-7Q-5 1-5 3a5 5 0 0 0 10 0Q5 1 0-7z" fill="#bde0f8" ${th}/><path transform="translate(${x} ${y})" d="M-2 1q0-3 2-5" stroke="#fff" stroke-width="1.2" fill="none"/>`).join('');
    return wrap(`<defs><clipPath id="${id}"><path d="${M}"/></clipPath></defs>${drops}
      <path d="${M}" ${F('#f6f4ee')}/>
      <g clip-path="url(#${id})"><path d="M36 50L96 118" stroke="#3a6ac8" stroke-width="7"/><path d="M30 60L90 128" stroke="#3aa05a" stroke-width="7"/><path d="M24 70L84 138" stroke="#c8323c" stroke-width="7"/></g>
      <path d="${M}" fill="none" ${st}/>
      <path d="M32 46Q46 36 58 46Q60 40 62 46Q74 36 88 46" fill="none" stroke="${K}" stroke-width="4"/>
      <path d="M38 54Q46 48 54 56Q46 64 38 54zM66 56Q74 48 82 54Q74 64 66 56z" fill="${K}"/>
      ${[42, 51, 60, 69, 78].map(x => `<path d="M${x - 3} 124L${x} ${104}L${x + 3} 124z" fill="${K}"/><circle cx="${x}" cy="96" r="1.8" fill="${K}"/>`).join('')}
      ${shine(44, 24, 4)}
    `, '#bde0f8');
  }
  function silentway() {
    const feathers = [...Array(11)].map((_, i) => { const a = Math.PI * (1.05 + i * 0.09); const x = 60 + Math.cos(a) * 30, y = 46 + Math.sin(a) * 30; const x2 = 60 + Math.cos(a) * 50, y2 = 46 + Math.sin(a) * 50; return `<path d="M${x.toFixed(1)} ${y.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${K}" stroke-width="8" stroke-linecap="round"/><path d="M${x.toFixed(1)} ${y.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#f6f4ee" stroke-width="5" stroke-linecap="round"/><circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="3" fill="${K}"/>`; }).join('');
    const rose = (x, y) => `<circle cx="${x}" cy="${y}" r="4.4" fill="#c8323c" ${th}/><path d="M${x - 2} ${y}a2 2 0 1 1 3 1" fill="none" stroke="#6a1a1a" stroke-width="1"/>`;
    return wrap(`${feathers}
      <path d="M28 150L32 76Q60 64 88 76L92 150z" ${F('#f2c14e')}/>
      ${[92, 108, 124].map(y => rose(50, y) + rose(70, y)).join('')}
      ${[...Array(18)].map((_, i) => `<circle cx="${34 + (i % 6) * 10.4}" cy="${84 + Math.floor(i / 6) * 28 + (i % 2) * 6}" r="1.2" fill="#8a6a2a"/>`).join('')}
      <path d="M22 72Q30 64 44 70L40 86Q28 88 22 72zM98 72Q90 64 76 70l4 16q12 2 18-14z" ${F('#e8742a')}/><path d="M26 76l12 4M94 76l-12 4" stroke="#8a8aa0" stroke-width="3"/>
      <path d="M42 44Q42 24 60 24Q78 24 78 44Q78 60 68 66H52Q42 60 42 44z" ${F('#a8a8b0')}/>
      ${[[48, 34], [56, 30], [64, 30], [72, 34], [46, 50], [74, 50], [52, 58], [68, 58]].map(([x, y]) => `<rect x="${x - 2.4}" y="${y - 2.4}" width="4.8" height="4.8" fill="${(x + y) % 3 ? '#7a7a84' : '#c8c8d0'}" ${th} stroke-width=".8"/>`).join('')}
      <ellipse cx="53" cy="44" rx="5" ry="6" fill="${K}"/><ellipse cx="67" cy="44" rx="5" ry="6" fill="${K}"/><circle cx="53" cy="44" r="1.4" fill="#e8508a"/><circle cx="67" cy="44" r="1.4" fill="#e8508a"/>
      <path d="M58 52l2 3 2-3" fill="${K}"/><path d="M52 60h16M54 60v4M58 60v5M62 60v5M66 60v4" stroke="${K}" stroke-width="1.4"/>
      <path d="M40 28Q60 18 80 28" fill="none" stroke="${K}" stroke-width="7"/><path d="M40 28Q60 18 80 28" fill="none" stroke="#f2c14e" stroke-width="4.4"/>
      <path d="M60 18l5 5-5 5-5-5z" ${F('#8a3ac8', th)}/>
    `, '#e8508a');
  }
  function civilwar() {
    const Y = '#f0e0a0', S = '#c8ccd8', R = '#c8323c', M = '#7a1a2a';
    const disc = (x, pt) => `<path d="M${x - 5} ${pt ? 16 : 18}Q${x - 6} 34 ${x - 4} 44${pt ? `L${x} 54L${x + 4} 44` : `Q${x} 48 ${x + 4} 44`}Q${x + 6} 34 ${x + 5} ${pt ? 16 : 18}Q${x} 8 ${x - 5} ${pt ? 16 : 18}z" ${F(S)}/>`;
    const root = (x, d) => `<path d="M${x - 8} 124Q${x - 10} 140 ${x - 14 * d} 154M${x} 124v30M${x + 8} 124Q${x + 10} 140 ${x + 12 * d} 154M${x - 4} 124l-6 26M${x + 4} 124l6 26" fill="none" stroke="${K}" stroke-width="5"/><path d="M${x - 8} 124Q${x - 10} 140 ${x - 14 * d} 154M${x} 124v30M${x + 8} 124Q${x + 10} 140 ${x + 12 * d} 154M${x - 4} 124l-6 26M${x + 4} 124l6 26" fill="none" stroke="${M}" stroke-width="2.6"/><path d="M${x - 10} 136l-6-4M${x + 10} 138l7-3" stroke="${S}" stroke-width="3" stroke-linecap="round"/>`;
    return wrap(`
      <path d="M46 96L44 124M74 96l2 28" stroke="${K}" stroke-width="12" stroke-linecap="round"/><path d="M46 96L44 124M74 96l2 28" stroke="${Y}" stroke-width="8" stroke-linecap="round"/>
      ${root(44, 1)}${root(76, -1)}
      <path d="M36 60L24 100M84 60l12 40" stroke="${K}" stroke-width="10" stroke-linecap="round"/><path d="M36 60L24 100M84 60l12 40" stroke="${Y}" stroke-width="6" stroke-linecap="round"/>
      <path d="M20 98l-4 10 8 2 6-8zM100 98l4 10-8 2-6-8z" ${F(S)}/>
      <path d="M38 56Q60 48 82 56L78 80Q60 86 42 80z" ${F(R)}/><path d="M60 52v30" stroke="${M}" stroke-width="2"/>
      ${[62, 68, 74].map(y => `<path d="M46 ${y}q14 5 28 0" fill="none" stroke="#f6ecd8" stroke-width="1.6" opacity=".7"/>`).join('')}
      ${[0, 1, 2, 3].map(i => `<rect x="56" y="${82 + i * 4}" width="8" height="3.4" rx="1" fill="#f6ecd8" ${th} stroke-width="1"/>`).join('')}
      <path d="M44 98Q60 92 76 98L74 104H46z" ${F(M)}/>
      <path d="M50 48h20l-2 8H52z" ${F('#8a4ab0')}/>
      ${[52, 60, 68].map(x => `<rect x="${x - 3}" y="44" width="6" height="7" rx="2" ${F(S, th)}/><path d="M${x - 3} 47h6" ${th}/>`).join('')}
      ${disc(46, false)}${disc(74, false)}${disc(53, true)}${disc(67, true)}${disc(60, true)}
      <path d="M52 30l4 3M68 30l-4 3" stroke="${K}" stroke-width="2.4"/>
    `, '#e8d8c8');
  }
  function century() {
    const B = '#3a6ac8', C = '#8ae0f0';
    return wrap(`
      <path d="M40 130h40l4 20H36z" ${F('#2a3a6a')}/>
      <path d="M44 104L30 136L50 140L58 114z" ${F(B)}/><path d="M76 104l16 26-6 22-10-2 4-18-14-14z" ${F(B)}/>
      <path d="M38 118l12 4M84 124l-6 8M36 132l14 2" stroke="${C}" stroke-width="3"/>
      <path d="M36 62Q60 52 84 62L82 108Q60 116 38 108z" ${F(B)}/>
      <path d="M44 70Q60 64 76 70M40 90q20 8 40 0" stroke="${C}" stroke-width="3" fill="none"/><path d="M60 64v46M48 84l-8 12M72 84l8 12" stroke="${C}" stroke-width="2.4"/>
      ${[[52, 80], [68, 80], [60, 98]].map(([x, y]) => `<path d="M${x - 4} ${y}h8l-4 6z" fill="${C}" ${th}/>`).join('')}
      <path d="M28 64L22 98M92 64l6 34" stroke="${K}" stroke-width="11" stroke-linecap="round"/><path d="M28 64L22 98M92 64l6 34" stroke="${B}" stroke-width="7" stroke-linecap="round"/>
      <path d="M22 100l6 8 8-4M98 100l-6 8-8-4" stroke="${C}" stroke-width="3" fill="none"/>
      <path d="M10 60H110" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="M10 60H110" stroke="#c8ccd8" stroke-width="4" stroke-linecap="round"/>
      <circle cx="10" cy="60" r="4" fill="#c8ccd8" ${th}/><circle cx="110" cy="60" r="4" fill="#c8ccd8" ${th}/>
      <path d="M16 62Q16 42 34 44Q42 48 42 62z" ${F(B)}/><path d="M104 62Q104 42 86 44Q78 48 78 62z" ${F(B)}/>
      <path d="M52 20L50 2M68 20l2-18" stroke="${K}" stroke-width="6" stroke-linecap="round"/><path d="M52 20L50 2M68 20l2-18" stroke="${C}" stroke-width="3" stroke-linecap="round"/>
      <path d="M44 50Q42 20 60 18Q78 20 76 50L70 56H50z" ${F(B)}/>
      <rect x="47" y="32" width="11" height="8" rx="2" ${F(C, th)}/><rect x="62" y="32" width="11" height="8" rx="2" ${F(C, th)}/>
      <path d="M50 46h20M54 46v6M60 46v7M66 46v6" ${th}/>
    `, C);
  }
  function chocolatedisco() {
    const cols = 6, rows = 5;
    const guard = `<g transform="rotate(-12 60 40)"><rect x="18" y="16" width="84" height="46" rx="10" ${F('#b8803a')}/>
      <rect x="26" y="22" width="68" height="34" rx="3" fill="#3a2410" ${th}/>
      ${[...Array(cols + 1)].map((_, i) => `<path d="M${26 + i * 68 / cols} 22v34" stroke="#fff3a0" stroke-width="1"/>`).join('')}${[...Array(rows + 1)].map((_, j) => `<path d="M26 ${22 + j * 34 / rows}h68" stroke="#fff3a0" stroke-width="1"/>`).join('')}
      ${'ABCDE'.split('').map((l, j) => `<text x="22" y="${27.5 + j * 6.8}" font-size="5" font-family="Anton,Impact,sans-serif" fill="#fff3a0" text-anchor="middle">${l}</text>`).join('')}
      <rect x="${26 + 3 * 68 / cols}" y="${22 + 2 * 34 / rows}" width="${68 / cols}" height="${34 / rows}" fill="#e8508a"/>
      <path d="M68 44q8-4 10 4l-2 10-8-2z" ${F('#f0c8a8', th)}/></g>`;
    const gx = (u, v) => [60 + (u - 0.5) * (40 + v * 60), 90 + v * 64];
    const ground = [...Array(7)].map((_, i) => { const [a, b] = gx(i / 6, 0), [c, d] = gx(i / 6, 1); return `<path d="M${a} ${b}L${c} ${d}" stroke="#fff3a0" stroke-width="1.4"/>`; }).join('') + [...Array(6)].map((_, j) => { const v = j / 5; const [a, b] = gx(0, v), [c, d] = gx(1, v); return `<path d="M${a} ${b}L${c} ${d}" stroke="#fff3a0" stroke-width="1.4"/>`; }).join('');
    const [p1, q1] = gx(3 / 6, 2 / 5), [p2, q2] = gx(4 / 6, 2 / 5), [p3, q3] = gx(4 / 6, 3 / 5), [p4, q4] = gx(3 / 6, 3 / 5);
    return wrap(`<path d="M${gx(0, 0).join(' ')}L${gx(1, 0).join(' ')}L${gx(1, 1).join(' ')}L${gx(0, 1).join(' ')}z" fill="#6a3a1a" ${st}/>${ground}
      <path d="M${p1} ${q1}L${p2} ${q2}L${p3} ${q3}L${p4} ${q4}z" fill="#e8508a" opacity=".85"/>
      <path d="M${(p1 + p3) / 2} ${q1 - 26}v18" stroke="#e8508a" stroke-width="4"/><path d="M${(p1 + p3) / 2 - 6} ${q1 - 12}l6 8 6-8" fill="none" stroke="#e8508a" stroke-width="4"/>${guard}`, '#e8742a');
  }
  function tubular() {
    const seg = (x, y, rx, ry, a, c) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${x} ${y})" fill="${c}" ${st}/>${shine(x - rx * 0.3, y - ry * 0.3, Math.min(rx, ry) * 0.35)}`;
    const D = '#b8603a';
    const dog = [seg(56, 104, 20, 9, 0, D), seg(38, 120, 5, 12, 10, D), seg(50, 122, 5, 12, -6, D), seg(64, 122, 5, 12, 6, D), seg(76, 120, 5, 12, -10, D), seg(82, 96, 5, 12, 50, D), seg(34, 88, 6, 12, -20, D), seg(36, 66, 12, 10, 0, D), seg(20, 66, 9, 6, 0, D), seg(30, 50, 4, 10, -20, D), seg(44, 50, 4, 10, 20, D)].join('');
    const S = '#8ad0f0';
    const swan = [seg(96, 64, 14, 8, 0, S), rope('M84 60Q78 40 88 30', K, 1), `<path d="M84 60Q78 40 88 30" fill="none" stroke="${S}" stroke-width="5" stroke-linecap="round"/>`, seg(90, 28, 5, 4, 0, S), `<path d="M94 28l6 1-6 2z" fill="#f2c14e" ${th}/>`, `<circle cx="91" cy="27" r="1.2" fill="#fff"/>`].join('');
    return wrap(`${swan}${dog}<circle cx="36" cy="64" r="2.2" fill="${K}"/><circle cx="37" cy="63" r="1" fill="#fff"/><path d="M12 66q-4 0-4 2" ${th} fill="none"/>
      <path d="M100 118l12 20M104 116l4 4" stroke="#c8c8d8" stroke-width="2"/><path d="M100 118l12 20" stroke="${K}" stroke-width="3.4" opacity=".4"/>
      ${[[96, 100], [108, 108], [90, 132]].map(([x, y]) => `<path d="M${x} ${y}l2-6 2 6" fill="#c8c8d8" ${th}/>`).join('')}`, '#e8508a');
  }
  function tomboom() {
    const one = (x, s, v) => {
      const skull = v === 1 ? `<path d="M-12 -22Q0 -34 12 -22" fill="none" stroke="#9a9aa8" stroke-width="3"/><path d="M-10-20v-6M0-24v-8M10-20v-6" stroke="#9a9aa8" stroke-width="2.4"/>` : `<path d="M-10 -20Q0 -30 10 -20Q4 -14 -4 -16z" fill="${v === 2 ? '#6ae0f0' : '#3aa0a0'}" ${th}/><ellipse cx="0" cy="-20" rx="3" ry="2" fill="#f2c14e" ${th}/>`;
      return `<g transform="translate(${x} 96) scale(${s})">
        <path d="M-18 40Q-22 10 -12 0Q0 -6 12 0Q22 10 18 40z" ${F(v === 2 ? '#f6f4ee' : '#8a4ab0')}/>
        ${v === 3 ? `<path d="M-20 4q8-6 14 0M6 4q8-6 14 0" ${F('#c8ccd8')}/>` : ''}
        <path d="M-12 -2Q-16 -22 -2 -24Q10 -24 10 -12L26 4Q20 8 8 2Q0 6 -12 -2z" ${F('#8a4ab0')}/>
        <path d="M24 4q8 2 10 10" stroke="#f08a8a" stroke-width="3" fill="none"/>${v === 1 ? `<ellipse cx="24" cy="4" rx="4" ry="3" fill="#c8a0e0" ${th}/>` : ''}
        <ellipse cx="0" cy="-10" rx="3" ry="2.4" fill="${v === 1 ? '#7a1a2a' : '#f08a8a'}" ${th}/>
        ${skull}
        <path d="M-16 10l-14-18M-14 14l-18-8M16 12l14-16M14 16l18-6" stroke="${K}" stroke-width="4" stroke-linecap="round"/><path d="M-16 10l-14-18M-14 14l-18-8M16 12l14-16M14 16l18-6" stroke="#8a4ab0" stroke-width="2" stroke-linecap="round"/>
        ${v === 2 ? `<path d="M-18 40l-8 10M-10 40l-4 12M10 40l4 12M18 40l8 10" stroke="#f6f4ee" stroke-width="3"/>` : ''}
      </g>`;
    };
    const sand = [...Array(40)].map((_, i) => `<circle cx="${(i * 37) % 118 + 1}" cy="${130 + (i * 13) % 28}" r="${1 + (i % 3) * 0.4}" fill="#3a3a4a"/>`).join('');
    return wrap(`${sand}<path d="M8 146q52-12 104 0" stroke="#5a5a6a" stroke-width="2" fill="none" stroke-dasharray="1 3"/>${one(24, 0.72, 1)}${one(96, 0.72, 3)}${one(60, 0.92, 2)}`, '#c8323c');
  }
  function boku() {
    const bomb = (x, y) => `<circle cx="${x}" cy="${y}" r="8" ${F('#f2c14e')}/><circle cx="${x}" cy="${y}" r="5.4" fill="#fff" ${th}/><path d="M${x} ${y}v-4M${x} ${y}l3 1" stroke="${K}" stroke-width="1.2"/><path d="M${x} ${y - 8}v-4" stroke="${K}" stroke-width="2"/>`;
    return wrap(`
      <path d="M24 150L36 80Q60 66 84 80L96 150L88 144L82 152L74 144L66 154L58 144L50 152L44 144L34 152z" ${F('#f09ac0')}/>
      <path d="M40 100q20 8 40 0M38 124q22 8 44 0" stroke="#c8407a" stroke-width="2" fill="none"/>
      <path d="M40 92Q26 100 20 116M80 92q14 8 20 24" stroke="${K}" stroke-width="10" stroke-linecap="round"/><path d="M40 92Q26 100 20 116M80 92q14 8 20 24" stroke="#c8b8e8" stroke-width="6" stroke-linecap="round"/>
      <path d="M28 100l4 4M24 108l4 3M92 100l-4 4M96 108l-4 3" stroke="${K}" stroke-width="1.4"/>
      ${bomb(20, 122)}${bomb(100, 122)}
      <path d="M40 60Q40 34 60 32Q78 34 80 52L104 62Q108 74 96 78L78 74Q70 82 58 80Q40 76 40 60z" ${F('#c8b8e8')}/>
      <path d="M78 58L102 64Q104 72 96 76L78 72" ${F('#a8a8b8', th)}/><path d="M96 70q4 0 6 3" fill="none" stroke="${K}" stroke-width="1.4"/>
      <path d="M78 68l14 2M82 70v4M88 71v4" stroke="#8ad0f0" stroke-width="1.6"/>
      <circle cx="42" cy="56" r="8" ${F('#f2c14e')}/><circle cx="42" cy="56" r="3.6" fill="none" stroke="${K}" stroke-width="1.4"/>
      <ellipse cx="66" cy="52" rx="4" ry="3.4" fill="#c8323c" ${th}/><circle cx="67" cy="51" r="1" fill="#fff"/>
      <path d="M50 38l4 4M58 36v5M48 68l6-2M56 74l2-4" stroke="${K}" stroke-width="1.2"/>
    `, '#f2c14e');
  }
  function wired() {
    const hook = (x, y, d) => `<path d="M${x} ${y}v14q0 8 ${7 * d} 8t${7 * d}-8l${-3 * d} 3" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round"/><path d="M${x} ${y}v14q0 8 ${7 * d} 8t${7 * d}-8l${-3 * d} 3" fill="none" stroke="#dde0ea" stroke-width="2.6" stroke-linecap="round"/>`;
    return wrap(`
      ${rope('M52 104Q40 60 34 0', '#c8ccd8', 1.6)}${rope('M68 104Q80 60 88 0', '#c8ccd8', 1.6)}
      ${hook(34, 22, 1)}${hook(88, 30, -1)}
      <path d="M86 12q10-4 14 4t-6 10" ${F('#f6ecd8', th)}/><path d="M92 14l4 8" ${th}/>
      <path d="M22 108Q24 90 60 90Q96 90 98 108Q96 138 60 140Q24 138 22 108z" ${F('#c86a6a')}/>
      <path d="M30 108Q32 98 60 98Q88 98 90 108Q88 130 60 132Q32 130 30 108z" fill="#3a1020" ${th}/>
      <rect x="44" y="100" width="32" height="10" rx="5" ${F('#8a90a0')}/><path d="M50 100v10M56 100v10M62 100v10M68 100v10" ${th}/>
      <path d="M36 120Q60 108 84 120Q80 132 60 132Q40 132 36 120z" ${F('#e87a8a')}/><path d="M60 114v12" stroke="#c8507a" stroke-width="1.6"/>
      ${hook(48, 104, 1).replace(/v14/g, 'v8')}${hook(72, 104, -1).replace(/v14/g, 'v8')}
    `, '#c8c8d8');
  }
  function insect() {
    const bugs = [...Array(22)].map((_, i) => { const a = i * 0.62, r = 10 + i * 2.6; const x = 34 + Math.cos(a) * r * 0.9 + i * 2.2, y = 40 + Math.sin(a) * r * 0.8 + i * 3; return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(i * 47) % 360})"><ellipse cx="-3" cy="-3" rx="4" ry="2.2" fill="#dff" opacity=".6" transform="rotate(-30)"/><ellipse cx="3" cy="-3" rx="4" ry="2.2" fill="#dff" opacity=".6" transform="rotate(30)"/><ellipse rx="2.6" ry="4.2" fill="#2a2a1a" stroke="#a0c040" stroke-width=".8"/><circle cy="-4.4" r="1.6" fill="#2a2a1a"/></g>`; }).join('');
    const needles = [[70, 110, 20], [90, 96, 40], [60, 130, 10], [100, 128, 55], [84, 140, 30]].map(([x, y, a]) => `<path transform="translate(${x} ${y}) rotate(${a})" d="M0-8L1.4 6H-1.4z" fill="#e8e0a0" ${th} stroke-width="1"/>`).join('');
    return wrap(`
      <path d="M8 26Q30 6 52 24Q40 44 22 40Q10 36 8 26z" ${F('#e8c0a0')}/><path d="M16 28Q30 16 44 26Q34 38 22 36Q14 34 16 28z" fill="#1a0a10" ${th}/>
      <path d="M8 26Q30 6 52 24" fill="none" stroke="${K}" stroke-width="3"/>
      ${bugs}${needles}
      <g transform="translate(96 138)"><path d="M-6 16V-10a6 6 0 0 1 12 0V16z" fill="#6aa04a" ${st}/><path d="M-6 0h-6v-8a3 3 0 0 1 6 0M6 4h6v-8a3 3 0 0 0-6 0" fill="#6aa04a" ${st}/></g>
    `, '#a0c040');
  }

  const DEFS = {
    tusk1: { name: 'Tusk ACT1', entity: true, draw: tusk1 },
    tusk2: { name: 'Tusk ACT2', entity: true, draw: tusk2 },
    tusk3: { name: 'Tusk ACT3', entity: true, draw: tusk3 },
    tusk4: { name: 'Tusk ACT4', entity: true, draw: tusk4 },
    ballbreaker: { name: 'Ball Breaker', draw: ballbreaker },
    heyya: { name: 'Hey Ya!', entity: true, draw: heyya },
    lonesome: { name: 'Oh! Lonesome Me', entity: false, draw: lonesome },
    creamstarter: { name: 'Cream Starter', draw: creamstarter },
    wreckingball: { name: 'Wrecking Ball', draw: wreckingball },
    ticket: { name: 'Ticket to Ride', draw: ticket },
    scarymonsters: { name: 'Scary Monsters', draw: () => scarymonsters(false) },
    scarymonsters_f: { name: 'Scary Monsters', draw: () => scarymonsters(true) },
    d4c: { name: 'D4C', entity: true, draw: () => d4c(false) },
    lovetrain: { name: 'D4C — Love Train', entity: true, draw: () => d4c(true) },
    theworld: { name: 'THE WORLD', entity: true, draw: theworld },
    mandom: { name: 'Mandom', entity: true, draw: mandom },
    catchrainbow: { name: 'Catch the Rainbow', entity: true, draw: catchrainbow },
    silentway: { name: 'In a Silent Way', draw: silentway },
    civilwar: { name: 'Civil War', entity: true, draw: civilwar },
    century: { name: '20th Century BOY', draw: century },
    chocolatedisco: { name: 'Chocolate Disco', draw: chocolatedisco },
    tubular: { name: 'Tubular Bells', draw: tubular },
    tomboom: { name: 'Tomb of the Boom', draw: tomboom },
    boku: { name: 'Boku no Rhythm wo Kiitekure', draw: boku },
    wired: { name: 'Wired', draw: wired },
    insect: { name: 'Insect Swarm', draw: insect },
  };

  /** which Stand a unit manifests */
  const PARTY = { mountaintim: 'lonesome', pocoloco: 'heyya', hotpants: 'creamstarter', wekapipo: 'wreckingball', lucy: 'ticket', diego: 'scarymonsters' };
  const ENEMY = { robinson: 'insect', benjamin: 'tomboom', andre: 'tomboom', laboom: 'tomboom', oyecomova: 'boku', porkpie: 'wired', diego_rival: 'scarymonsters', ferdinand: 'scarymonsters_f', hotpants_foe: 'creamstarter', ringo: 'mandom', blackmore: 'catchrainbow', sandman: 'silentway', magent: 'century', wekapipo_foe: 'wreckingball', axl: 'civilwar', disco: 'chocolatedisco', mikeo: 'tubular', valentine1: 'd4c', lovetrain: 'lovetrain', diego_world: 'theworld' };
  function keyFor(u, abilityId) {
    if (u.side === 'party') {
      if (u.id === 'gyro') return abilityId === 'ball_breaker' ? 'ballbreaker' : null;
      if (u.id === 'johnny') { const f = SBR.run.flags; return f.tusk4 ? 'tusk4' : f.tusk3 ? 'tusk3' : f.tusk2 ? 'tusk2' : f.tusk1 ? 'tusk1' : null; }
      return PARTY[u.id] || null;
    }
    return ENEMY[u.id] || null;
  }
  const svg = key => (DEFS[key] ? DEFS[key].draw() : '');
  return { DEFS, keyFor, svg, isEntity: key => !!(DEFS[key] && DEFS[key].entity), name: key => DEFS[key] && DEFS[key].name };
})();
