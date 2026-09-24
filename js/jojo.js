/* JoJo presentation layer: themed encounter-card illustrations, the manga cut-in used for big moves,
   "To Be Continued", and the title logo. Everything is drawn here; nothing is loaded. */
'use strict';

(() => {
  const INK = '#1a1020';
  const st = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const I = SBR.icons, P = I.P;

  /* ---------------- encounter card illustrations (200 × 150) ---------------- */
  const PAL = {
    fight: ['#c8323c', '#f2c14e'], elite: ['#3a1a4a', '#c8323c'], event: ['#3fb8a9', '#f6ecd8'], trainer: ['#3fb8a9', '#f2c14e'],
    recruit: ['#6ad08a', '#f2c14e'], shop: ['#e8742a', '#f6ecd8'], rest: ['#1f2a6a', '#e8742a'], detour: ['#e8742a', '#8a1a10'],
    story: ['#5b3a8c', '#f2c14e'], boss: ['#1a1020', '#c8323c'],
  };
  const kana = (t, x, y, sz, c = '#fff', rot = -8) => `<text x="${x}" y="${y}" transform="rotate(${rot} ${x} ${y})" font-family="'Noto Sans JP',sans-serif" font-weight="900" font-size="${sz}" fill="${c}" stroke="${INK}" stroke-width="2.4" paint-order="stroke">${t}</text>`;
  const sun = (c1, c2, id) => `<defs><radialGradient id="${id}r" cx=".5" cy=".55" r=".75"><stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></radialGradient>
      <pattern id="${id}h" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.4" fill="${INK}" opacity=".16"/></pattern></defs>
    <rect width="200" height="150" fill="url(#${id}r)"/>
    <g class="ca-rays">${Array.from({ length: 18 }, (_, k) => { const a = k / 18 * Math.PI * 2; return `<path d="M100 82 L${100 + Math.cos(a) * 260} ${82 + Math.sin(a) * 260} L${100 + Math.cos(a + 0.12) * 260} ${82 + Math.sin(a + 0.12) * 260}Z" fill="#fff" opacity=".12"/>`; }).join('')}</g>
    <rect width="200" height="150" fill="url(#${id}h)"/>`;
  const speed = (y0 = 0) => `<g stroke="#fff" stroke-width="2" opacity=".5">${[20, 40, 110, 128].map(y => `<path d="M${y % 3 ? 4 : 150} ${y + y0} h46"/>`).join('')}</g>`;
  const ground = c => `<path d="M0 124 Q100 112 200 124 V150 H0Z" fill="${c}" ${st}/>`;
  let n = 0;
  const ART = {
    fight: (id, c) => sun(c[0], c[1], id) + speed() + ground('#e8b36a') +
      `<g transform="translate(58 38) scale(1.6) rotate(-18 24 24)">${P.revolver('#9aa0b0', '#6a4a2a')}</g>` +
      `<g transform="translate(142 38) scale(-1.6 1.6) rotate(-18 24 24)">${P.revolver('#9aa0b0', '#6a4a2a')}</g>` +
      `<path d="M100 52 l6 14 16 -4 -10 12 12 10 -16 0 -2 16 -8 -12 -12 8 4 -14 -14 -6 14 -4z" fill="#fff3c0" ${st} stroke-width="2"/>` + kana('バン', 138, 40, 26, '#f2c14e'),
    elite: (id, c) => sun(c[0], c[1], id) +
      `<g transform="translate(60 30)"><path d="M40 8 Q10 8 8 40 Q6 60 20 66 L22 82 L58 82 L60 66 Q74 60 72 40 Q70 8 40 8Z" fill="#f6ecd8" ${st}/><ellipse cx="27" cy="44" rx="9" ry="11" fill="${INK}"/><ellipse cx="53" cy="44" rx="9" ry="11" fill="${INK}"/><circle cx="27" cy="44" r="3" fill="#c8323c"/><circle cx="53" cy="44" r="3" fill="#c8323c"/><path d="M40 52 l-5 10 h10z" fill="${INK}"/><path d="M28 72 v10 M36 72 v10 M44 72 v10 M52 72 v10" stroke="${INK}" stroke-width="2.4"/><path d="M-8 18 Q40 -10 88 18 Q80 26 40 20 Q0 26 -8 18Z" fill="#4a3a2a" ${st}/><path d="M12 12 Q40 -26 68 12Z" fill="#4a3a2a" ${st}/></g>` +
      kana('ゴ', 18, 48, 30, '#b070e0', -12) + kana('ゴ', 158, 70, 26, '#b070e0', 10) + kana('ゴ', 30, 128, 22, '#b070e0', -4),
    event: (id, c) => sun(c[0], c[1], id) + ground('#c8a070') +
      `<path d="M86 150 Q98 110 100 86 Q102 110 114 150Z" fill="#e8d8b0" ${st} stroke-width="2"/><path d="M72 124 V56" stroke="${INK}" stroke-width="7"/><path d="M72 124 V56" stroke="#8a6a4a" stroke-width="4"/>` +
      `<path d="M72 34 l9 20 22 2 -17 14 6 22 -20 -12 -20 12 6 -22 -17 -14 22 -2z" fill="#f2c14e" ${st}/>` + `<path d="M132 60 q8 -18 20 -6 q8 -14 18 0 q10 -2 6 12 h-44z" fill="#fff" ${st} stroke-width="2"/>`,
    trainer: (id, c) => sun(c[0], c[1], id) + speed() +
      `<g transform="translate(40 26) scale(1.1)"><path d="M20 10 Q10 50 30 80 L44 76 Q30 50 36 14Z M80 10 Q90 50 70 80 L56 76 Q70 50 64 14Z" fill="#9aa0b0" ${st}/><path d="M20 10 Q50 -8 80 10 L64 14 Q50 4 36 14Z" fill="#9aa0b0" ${st}/>${[18, 26, 34].map(y => `<circle cx="${22 + y * .2}" cy="${y + 6}" r="2" fill="${INK}"/><circle cx="${78 - y * .2}" cy="${y + 6}" r="2" fill="${INK}"/>`).join('')}</g>` +
      `<g transform="translate(116 60) scale(.9)">${P.ball('#d0d4e0', '#3fb8a9')}</g>` + kana('修行', 18, 138, 22, '#f2c14e', -6),
    recruit: (id, c) => sun(c[0], c[1], id) + ground('#e8b36a') +
      `<g transform="translate(30 50) scale(1.3)">${P.hat('#6a4a2a', '#c8323c')}</g><g transform="translate(96 44) scale(1.3)">${P.hat('#3a8c4a', '#f2c14e')}</g>` +
      `<path d="M40 108 Q100 70 160 108" fill="none" stroke="${INK}" stroke-width="6"/><path d="M40 108 Q100 70 160 108" fill="none" stroke="#c8a070" stroke-width="3" stroke-dasharray="6 3"/>` + kana('仲間', 122, 136, 22, '#fff', -6),
    shop: (id, c) => sun(c[0], c[1], id) + ground('#d8b070') +
      `<g transform="translate(34 40)"><path d="M10 50 Q10 10 60 8 Q110 10 110 50Z" fill="#f6ecd8" ${st}/><path d="M26 50 Q28 18 60 16 M94 50 Q92 18 60 16 M60 16 V50" stroke="${INK}" stroke-width="1.6" fill="none"/><rect x="6" y="50" width="108" height="22" fill="#8a5a30" ${st}/><circle cx="26" cy="80" r="12" fill="#c8a070" ${st}/><circle cx="96" cy="80" r="12" fill="#c8a070" ${st}/><path d="M26 70 v20 M16 80 h20 M96 70 v20 M86 80 h20" stroke="${INK}" stroke-width="1.6"/><path d="M114 60 l30 -8" stroke="${INK}" stroke-width="3"/></g>` +
      `<g transform="translate(150 20) scale(.8)">${P.coin('#f2c14e', '$')}</g>`,
    rest: (id, c) => sun(c[0], c[1], id) + ground('#4a3a3a') +
      `<g transform="translate(70 60)"><path d="M10 60 L50 44 M50 60 L10 44" stroke="#6a4a2a" stroke-width="8" stroke-linecap="round"/><path d="M30 50 Q14 30 26 8 Q30 22 36 16 Q44 30 38 20 Q50 34 30 50Z" fill="#f2c14e" ${st}/><path d="M30 48 Q22 36 28 24 Q34 36 30 48Z" fill="#e8742a"/></g>` +
      `<g fill="#fff">${[[30, 20], [60, 34], [150, 26], [172, 50], [120, 14]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join('')}</g>` + `<path d="M150 30 a14 14 0 1 0 12 22 a11 11 0 1 1 -12 -22z" fill="#f6ecd8" ${st} stroke-width="2"/>`,
    detour: (id, c) => sun(c[0], c[1], id) + ground('#c8844a') +
      `<path d="M100 130 V40" stroke="${INK}" stroke-width="8"/><path d="M100 130 V40" stroke="#8a6a4a" stroke-width="5"/>` +
      `<path d="M104 44 H168 L182 56 L168 68 H104Z" fill="#f6ecd8" ${st}/><text x="140" y="61" text-anchor="middle" font-family="Oswald,sans-serif" font-weight="700" font-size="13" fill="${INK}">DETOUR</text>` +
      `<path d="M96 74 H32 L18 86 L32 98 H96Z" fill="#e8742a" ${st}/><text x="58" y="91" text-anchor="middle" font-family="Oswald,sans-serif" font-weight="700" font-size="13" fill="${INK}">RACE</text>` + kana('？', 160, 118, 28, '#f2c14e', 10),
    story: (id, c) => sun(c[0], c[1], id) +
      `<g transform="translate(46 22)"><path d="M0 12 Q54 0 54 12 V108 Q54 96 0 108Z" fill="#f6ecd8" ${st}/><path d="M108 12 Q54 0 54 12 V108 Q54 96 108 108Z" fill="#efe0bf" ${st}/>${[30, 44, 58, 72].map(y => `<path d="M10 ${y} q20 -3 36 0 M62 ${y} q20 -3 36 0" stroke="${INK}" stroke-width="1.2" opacity=".4" fill="none"/>`).join('')}</g>` +
      `<g transform="translate(118 56) scale(.9)">${P.arm('#e8d8a8')}</g>` + kana('運命', 16, 42, 22, '#f2c14e', -8),
    boss: (id, c) => sun(c[0], c[1], id) +
      `<g transform="translate(50 24)"><path d="M0 70 L10 16 L32 40 L50 4 L68 40 L90 16 L100 70Z" fill="#f2c14e" ${st}/><path d="M0 70 H100 V86 H0Z" fill="#c8323c" ${st}/>${[20, 50, 80].map(x => `<circle cx="${x}" cy="78" r="4" fill="#3fb8a9" ${st} stroke-width="1.4"/>`).join('')}<path d="M20 86 q2 14 0 20 M60 86 q3 18 0 26 M84 86 q2 10 0 14" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></g>` +
      kana('ゴ', 16, 50, 32, '#b070e0', -12) + kana('ゴ', 164, 44, 30, '#b070e0', 8) + kana('ゴ', 150, 132, 24, '#b070e0', -6) + kana('ゴ', 20, 132, 22, '#b070e0', 6),
  };
  SBR.art.cardArt = type => {
    const f = ART[type] || ART.event;
    const id = 'ca' + (n++);
    return `<svg class="card-art" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${f(id, PAL[type] || PAL.event)}</svg>`;
  };

  /* ---------------- manga cut-in ----------------
     A diagonal panel slams across the screen with the attacker's portrait and the move name. */
  let lastCut = 0;
  SBR.cutin = async ({ portrait, name, sub, color = '#f2c14e', enemy = false, kanaText = 'ドドドド' }) => {
    const now = Date.now();
    if (now - lastCut < 900 || SBR.settings.reducedMotion) return;
    lastCut = now;
    const layer = document.getElementById('fx-layer');
    const el = document.createElement('div');
    el.className = 'cutin' + (enemy ? ' enemy' : '');
    el.style.setProperty('--cc', color);
    el.innerHTML = `<div class="ci-band"><div class="ci-lines"></div><div class="ci-port">${portrait || ''}</div><div class="ci-text"><div class="ci-sub">${sub || ''}</div><div class="ci-name">${name}</div></div><div class="ci-kana">${kanaText}</div></div>`;
    layer.appendChild(el);
    const sp = SBR.settings.speed || 1;
    await new Promise(r => setTimeout(r, 820 / sp));
    el.classList.add('out');
    setTimeout(() => el.remove(), 320 / sp);
  };

  /* ---------------- To Be Continued ---------------- */
  SBR.toBeContinued = (container = document.getElementById('fx-layer')) => new Promise(resolve => {
    const el = document.createElement('div');
    el.className = 'tbc';
    el.innerHTML = `<svg class="tbc-arrow" viewBox="0 0 420 90" xmlns="http://www.w3.org/2000/svg"><path d="M60 8 L8 45 L60 82 L60 60 L412 60 L412 30 L60 30Z" fill="#d8c8a0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><text x="236" y="54" text-anchor="middle" font-family="Oswald,'Arial Narrow',sans-serif" font-weight="700" font-size="26" letter-spacing="1" fill="${INK}">TO BE CONTINUED</text></svg>`;
    container.appendChild(el);
    document.getElementById('screen').classList.add('tbc-freeze');
    SBR.audio.play('menace');
    setTimeout(() => { el.classList.add('out'); document.getElementById('screen').classList.remove('tbc-freeze'); setTimeout(() => { el.remove(); resolve(); }, 400); }, 2300);
  });

  /* ---------------- title logo ---------------- */
  SBR.art.logo = () => `<svg class="sbr-logo" viewBox="0 0 900 300" xmlns="http://www.w3.org/2000/svg" aria-label="Steel Ball Run">
    <defs>
      <linearGradient id="lgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a0"/><stop offset=".5" stop-color="#f2c14e"/><stop offset="1" stop-color="#e8742a"/></linearGradient>
      <linearGradient id="lgB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f8ff"/><stop offset=".55" stop-color="#a8b0c8"/><stop offset="1" stop-color="#5a6280"/></linearGradient>
      <pattern id="lgH" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.2" fill="${INK}" opacity=".25"/></pattern>
    </defs>
    <path d="M40 150 Q450 40 860 150 Q450 250 40 150Z" fill="#5b3a8c" opacity=".55"/>
    <g font-family="Rye, Georgia, serif" font-size="118" text-anchor="middle">
      <text x="456" y="176" fill="${INK}" transform="translate(10 10)">STEEL</text>
      <text x="456" y="176" fill="url(#lgG)" stroke="${INK}" stroke-width="7" paint-order="stroke">STEEL</text>
      <text x="456" y="176" fill="url(#lgH)">STEEL</text>
    </g>
    <g font-family="Rye, Georgia, serif" font-size="92" text-anchor="middle">
      <text x="300" y="276" fill="${INK}" transform="translate(8 8)">B</text><text x="300" y="276" fill="#e8508a" stroke="${INK}" stroke-width="6" paint-order="stroke">B</text>
      <text x="470" y="276" fill="${INK}" transform="translate(8 8)">LL</text><text x="470" y="276" fill="#e8508a" stroke="${INK}" stroke-width="6" paint-order="stroke">LL</text>
      <text x="660" y="276" fill="${INK}" transform="translate(8 8)">RUN</text><text x="660" y="276" fill="#3fb8a9" stroke="${INK}" stroke-width="6" paint-order="stroke">RUN</text>
    </g>
    <g class="logo-ball" style="transform-origin:382px 244px"><circle cx="382" cy="244" r="36" fill="url(#lgB)" stroke="${INK}" stroke-width="6"/><path d="M350 234 Q382 250 414 234 M350 254 Q382 238 414 254" stroke="#3fb8a9" stroke-width="5" fill="none"/>${[0, 1, 2, 3, 4, 5].map(k => `<circle cx="${382 + Math.cos(k * 1.047) * 22}" cy="${244 + Math.sin(k * 1.047) * 22}" r="3.4" fill="#5a6280"/>`).join('')}<ellipse cx="370" cy="230" rx="9" ry="5" fill="#fff" opacity=".8"/></g>
    <g transform="translate(70 60)"><path d="M20 10 Q6 50 26 82 L40 78 Q26 50 34 14Z M80 10 Q94 50 74 82 L60 78 Q74 50 66 14Z M20 10 Q50 -8 80 10 L66 14 Q50 4 34 14Z" fill="#c8c8d8" stroke="${INK}" stroke-width="5"/></g>
    <g transform="translate(760 40)"><path d="M40 4 l11 24 26 3 -20 17 6 26 -23 -14 -23 14 6 -26 -20 -17 26 -3z" fill="#f2c14e" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/></g>
  </svg>`;
})();
