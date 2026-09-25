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
  /* the current stretch of the race shows behind every card: a landmark strip and that region's ground */
  let curScene = 0;
  const BACK = {
    1: ['#c86a3a', '#e8b36a', () => `<path d="M8 124 L14 92 H48 L54 124Z M140 124 L146 100 H176 L182 124Z" /><path d="M96 124 V96 q4-6 8 0 V124 M96 108 h-8 v-8 q2-3 4 0 v4 h4" />`],
    2: ['#9a3a2a', '#e0782e', () => `<path d="M20 124 L26 84 H54 L60 124Z M66 124 L70 70 Q74 66 78 70 L80 124Z M130 124 L138 90 H170 L178 124Z M150 90 L152 66 Q156 62 160 66 L162 90Z" />`],
    3: ['#3a5a3a', '#8aaa4a', () => `<path d="M30 124 V100 L42 90 L54 100 V124Z M150 124 L153 84 H157 L160 124Z" /><path d="M155 84 l-12 -8 M155 84 l12 -8 M155 84 l-8 12 M155 84 l10 10" stroke-width="2.4" fill="none"/><path d="M66 124 V94 Q72 86 78 94 V124Z" />`],
    4: ['#2a5a5a', '#e8f0f8', () => `<path d="M0 124 L30 80 L60 124Z M50 124 L90 70 L130 124Z M120 124 L160 86 L200 124Z" /><path d="M30 80 l-8 12 h16Z M90 70 l-10 14 h20Z" fill="#fff" stroke="none"/>`],
    5: ['#3a2a2a', '#b8e0f0', () => `<path d="M0 124 V106 H20 V98 H34 V110 H52 V94 H64 V124Z M150 124 L154 84 H162 L166 124Z M148 84 H168 L158 74Z" /><path d="M154 94 h12 M154 104 h12" stroke="#c8323c" stroke-width="3" fill="none"/>`],
    6: ['#1a1438', '#3a3050', () => `<path d="M0 124 V96 H14 V84 H26 V100 H40 V76 H50 V124Z M150 124 V90 H162 V70 L168 60 L174 70 V90 H186 V124Z" /><path d="M56 124 V94 H64 V124 M110 124 V94 H118 V124 M60 94 Q88 116 114 94" stroke-width="2.4" fill="none"/>`],
    7: ['#5a1a1a', '#f0c070', () => `<path d="M20 124 Q18 96 28 84 Q34 80 38 86 Q42 100 40 124Z M150 124 Q152 100 160 90 Q166 86 168 92 Q172 106 170 124Z M60 124 Q60 108 66 102 Q70 100 72 106 L72 124Z" />`],
    8: ['#2a2230', '#5a4a40', () => `<path d="M10 124 V80 H18 V124Z M150 124 V80 H158 V124Z M4 76 H164 V84 H4Z" /><path d="M0 0 L8 14 L16 0Z M60 0 L66 10 L72 0Z M130 0 L138 16 L146 0Z" />`],
    9: ['#6a8ab0', '#e8f4ff', () => `<path d="M0 124 L40 88 L80 124Z M120 124 L160 92 L200 124Z" /><path d="M150 124 V108 H166 V124Z M146 110 L158 100 L170 110Z" />`],
    10: ['#4a2020', '#6a5a50', () => `<path d="M0 124 V98 H30 V92 H34 V98 H44 V124Z M48 124 V92 H80 V124Z M124 124 V96 H158 V124Z M162 124 V88 H200 V124Z" /><path d="M96 124 V86 H104 V124Z M94 86 L100 70 L106 86Z" />`],
  };
  const backdrop = () => { const B = BACK[curScene]; return B ? `<g fill="${B[0]}" stroke="${INK}" stroke-width="2" stroke-linejoin="round" opacity=".55">${B[2]()}</g>` : ''; };
  const ground = c => { const B = BACK[curScene]; return backdrop() + `<path d="M0 124 Q100 112 200 124 V150 H0Z" fill="${B ? B[1] : c}" ${st}/><path d="M18 136 h26 M120 140 h34 M70 146 h20" stroke="${INK}" stroke-width="1.4" opacity=".25"/>`; };
  const holes = (pts) => pts.map(([x, y]) => `<g><circle cx="${x}" cy="${y}" r="4" fill="${INK}"/><path d="M${x - 7} ${y}h3M${x + 4} ${y}h3M${x} ${y - 7}v3M${x} ${y + 4}v3" stroke="${INK}" stroke-width="1.4"/></g>`).join('');
  const figure = (x, y, s, body, hat, eyes) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 60 Q-24 22 0 18 Q24 22 22 60Z" fill="${body}" ${st}/><circle cx="0" cy="8" r="13" fill="${body}" ${st}/><path d="M-26 2 Q0 -6 26 2 Q10 6 0 5 Q-10 6 -26 2Z M-12 0 Q-12 -18 0 -18 Q12 -18 12 0Z" fill="${hat}" ${st}/>${eyes ? `<path d="M-7 9 l5 1 M7 9 l-5 1" stroke="${eyes}" stroke-width="3" stroke-linecap="round"/>` : ''}</g>`;
  const ART2 = {
    fight: (id, c) => sun(c[0], c[1], id) + speed(4) + ground('#e8b36a') + figure(64, 58, 1.05, '#3a2a2a', '#6a4a2a', '#f2c14e') +
      `<g transform="translate(70 56) rotate(-10) scale(1.5)">${P.revolver('#9aa0b0', '#6a4a2a')}</g><path d="M128 76 l10 -4 -4 10 12 2 -10 6 6 10 -12 -4 -2 12 -6 -10 -8 8 0 -12 -12 0 10 -8 -8 -8 12 0z" fill="#fff3c0" ${st} stroke-width="2"/>` +
      holes([[160, 40], [176, 62], [150, 104]]) + kana('ドン', 128, 34, 24, '#f2c14e', 8),
    elite: (id, c) => sun(c[0], c[1], id) + ground('#3a2a3a') +
      `<g transform="translate(100 88)"><path d="M-60 40 Q-70 -30 0 -50 Q70 -30 60 40Z" fill="#b070e0" opacity=".5" ${st} stroke-width="2"/><path d="M-30 40 Q-34 0 0 -8 Q34 0 30 40Z" fill="${INK}"/><circle cy="-22" r="18" fill="${INK}"/><path d="M-10 -24 l7 2 M10 -24 l-7 2" stroke="#ff4a4a" stroke-width="4" stroke-linecap="round" class="ca-anim ca-blink"/><path d="M-40 -2 Q-56 -30 -42 -48 M40 -2 Q56 -30 42 -48" stroke="#b070e0" stroke-width="3" fill="none"/></g>` +
      kana('ゴ', 16, 44, 28, '#b070e0', -12) + kana('ゴ', 160, 60, 26, '#b070e0', 10) + kana('ゴ', 150, 132, 20, '#b070e0', -4),
    event: (id, c) => sun(c[0], c[1], id) + ground('#c8a070') +
      `<g transform="translate(56 34)"><path d="M0 8 H88 V70 H0Z" fill="#f6ecd8" ${st}/><path d="M0 8 L44 44 L88 8" fill="#efe0bf" ${st}/><circle cx="44" cy="44" r="10" fill="#c8323c" ${st} stroke-width="2"/><path d="M40 44 h8 M44 40 v8" stroke="#f6ecd8" stroke-width="2"/></g>` +
      kana('？', 150, 44, 30, '#f2c14e', 12) + kana('！', 22, 60, 26, '#fff', -10) + `<g fill="#fff">${[[30, 20], [172, 90], [20, 104]].map(([x, y]) => `<path d="M${x} ${y - 6} l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z"/>`).join('')}</g>`,
    trainer: (id, c) => sun(c[0], c[1], id) + speed() + ground('#c8a070') +
      `<g transform="translate(100 70)"><g class="ca-anim ca-spin"><circle r="30" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 6" opacity=".7"/><circle r="42" fill="none" stroke="#f2c14e" stroke-width="2" stroke-dasharray="3 9" opacity=".8"/></g></g>` +
      `<g transform="translate(70 40) scale(1.25)">${P.ball('#d0d4e0', '#3fb8a9')}</g>` + `<g transform="translate(12 60) scale(1.1)" opacity=".8">${P.spiral('#fff', 2)}</g><g transform="translate(140 20) scale(.9)">${P.goldrect('#f2c14e')}</g>` + kana('回転', 130, 138, 22, '#f2c14e', -6),
    recruit: (id, c) => sun(c[0], c[1], id) + ground('#e8b36a') +
      `<g transform="translate(100 78)"><path d="M-70 10 Q-44 -6 -14 2 L0 10 L14 2 Q44 -6 70 10 L70 26 Q44 16 16 22 L0 30 L-16 22 Q-44 16 -70 26Z" fill="#f0c8a0" ${st}/><path d="M-70 10 v16 M70 10 v16" stroke="${INK}" stroke-width="3"/><path d="M-90 4 h20 v26 h-20Z" fill="#3b5bb5" ${st}/><path d="M90 4 h-20 v26 h20Z" fill="#4f8a3a" ${st}/><path d="M-10 6 l4 10 M0 4 l4 12 M10 6 l4 10" stroke="${INK}" stroke-width="1.6"/></g>` +
      kana('仲間', 66, 46, 26, '#fff', -6) + `<g fill="#fff">${[[40, 30], [160, 34]].map(([x, y]) => `<path d="M${x} ${y - 7} l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"/>`).join('')}</g>`,
    shop: (id, c) => sun(c[0], c[1], id) + ground('#d8b070') +
      `<g transform="translate(40 30)"><path d="M0 22 H120 V94 H0Z" fill="#b8844a" ${st}/><path d="M-6 22 H126 L120 4 H0Z" fill="#8a3a2a" ${st}/><rect x="10" y="30" width="100" height="16" fill="#f6ecd8" ${st} stroke-width="2"/><text x="60" y="42" text-anchor="middle" font-family="Rye,serif" font-size="11" fill="${INK}">GENERAL STORE</text>${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${-6 + i * 20} 4 v18" stroke="#f6ecd8" stroke-width="6" opacity=".6"/>`).join('')}<rect x="14" y="54" width="30" height="24" fill="#9fc7e8" ${st} stroke-width="2"/><rect x="76" y="54" width="30" height="24" fill="#9fc7e8" ${st} stroke-width="2"/><rect x="50" y="56" width="20" height="38" fill="#5a3a20" ${st} stroke-width="2"/><path d="M20 70 h6 v6 h-6z M84 68 q4 -6 8 0 v8 h-8z" fill="#c8323c"/></g>` +
      `<g transform="translate(152 96) scale(.7)">${P.bottle('#b8844a', '#c8742a')}</g><g transform="translate(8 96) scale(.6)">${P.coin('#f2c14e', '$')}</g>`,
    rest: (id, c) => sun(c[0], c[1], id) + ground('#4a3a3a') +
      `<g transform="translate(24 54)"><path d="M0 70 L40 0 L80 70Z" fill="#e8d8b0" ${st}/><path d="M40 0 V70 M28 70 L40 40 L52 70" fill="#3a2a2a" ${st} stroke-width="2"/><path d="M40 0 l-6 -8 M40 0 l6 -8" stroke="${INK}" stroke-width="2"/></g>` +
      `<g transform="translate(120 74)"><path d="M10 50 L50 34 M50 50 L10 34" stroke="#6a4a2a" stroke-width="7" stroke-linecap="round"/><g class="ca-anim ca-flicker" style="transform-origin:30px 46px"><path d="M30 44 Q16 26 28 6 Q32 20 38 14 Q46 28 40 18 Q50 32 30 44Z" fill="#f2c14e" ${st}/><path d="M30 42 Q24 32 29 22 Q35 32 30 42Z" fill="#e8742a"/></g><path d="M52 30 h12 l-2 14 h-8z" fill="#5a5a6a" ${st} stroke-width="2"/><path d="M56 26 q-2 -8 2 -12" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/></g>` +
      `<g fill="#fff">${[[20, 22], [70, 14], [110, 30], [178, 20], [150, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join('')}</g><path d="M150 14 a14 14 0 1 0 12 22 a11 11 0 1 1 -12 -22z" fill="#f6ecd8" ${st} stroke-width="2"/>`,
    detour: (id, c) => sun(c[0], c[1], id) + ground('#c8844a') +
      `<g transform="translate(30 26) rotate(-4)"><path d="M0 6 L46 0 L92 6 L140 0 V92 L92 98 L46 92 L0 98Z" fill="#f0dcae" ${st}/><path d="M46 0 V92 M92 6 V98" stroke="${INK}" stroke-width="1.4" opacity=".5"/><path d="M14 80 Q40 40 70 60 T122 24" stroke="#c8323c" stroke-width="3" stroke-dasharray="5 4" fill="none"/><path d="M116 18 l12 12 M128 18 l-12 12" stroke="#c8323c" stroke-width="4"/><circle cx="14" cy="80" r="5" fill="#3fb8a9" ${st} stroke-width="1.6"/><path d="M26 22 q10 -6 18 2 q6 -8 14 0" stroke="#6aa0c8" stroke-width="3" fill="none"/></g>` + kana('近道', 132, 140, 20, '#f2c14e', -6),
    story: (id, c) => sun(c[0], c[1], id) +
      `<g transform="translate(100 74)"><circle r="46" fill="#fff3c0" opacity=".5" class="ca-anim ca-pulse"/><ellipse cx="0" cy="-44" rx="24" ry="7" fill="none" stroke="#f2c14e" stroke-width="4"/></g><g transform="translate(64 30) scale(1.5)">${P.arm('#e8d8a8')}</g>` +
      kana('聖なる遺体', 12, 140, 18, '#f2c14e', -4),
    boss: (id, c) => sun(c[0], c[1], id) + ground('#2a1a38') +
      `<g transform="translate(100 60)"><path d="M-80 70 Q-90 -20 0 -40 Q90 -20 80 70Z" fill="#c8323c" opacity=".35"/>${figure(0, 4, 1.3, INK, '#3a2a4a', '#ff4a4a')}<path d="M-50 70 L-40 40 M50 70 L40 40" stroke="#f2c14e" stroke-width="3"/></g>` +
      `<g transform="translate(86 12) scale(.6)"><path d="M0 40 L6 10 L18 24 L24 0 L30 24 L42 10 L48 40Z" fill="#f2c14e" ${st}/></g>` +
      kana('ゴ', 14, 48, 32, '#b070e0', -12) + kana('ゴ', 164, 44, 30, '#b070e0', 8) + kana('ゴ', 156, 132, 24, '#b070e0', -6) + kana('ゴ', 16, 134, 22, '#b070e0', 6),
  };
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
    const k = n;
    const f = (k % 2 && ART2[type]) || ART[type] || ART.event;
    const id = 'ca' + (n++);
    try { curScene = SBR.run && SBR.sceneId ? SBR.sceneId() : 0; } catch (e) { curScene = 0; }
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

  /* ---------------- Wanted poster (threat tier 0-3) ---------------- */
  SBR.art.wanted = tier => {
    const bounty = ['$50', '$500', '$5,000', '$50,000'][tier] || '$50';
    const ink = ['#6a5a4a', '#8a5a1a', '#a03a10', '#8a1010'][tier];
    const stamp = tier >= 2 ? `<g transform="rotate(-18 30 44)"><rect x="6" y="36" width="48" height="16" fill="none" stroke="#c8323c" stroke-width="3" opacity=".85"/><text x="30" y="48.5" text-anchor="middle" font-family="Oswald,sans-serif" font-weight="700" font-size="11" fill="#c8323c" opacity=".9">${tier >= 3 ? 'DEAD' : 'ALIVE'}</text></g>` : '';
    return `<svg class="wanted-svg" viewBox="0 0 60 76" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 3 L57 2 L58 72 L2 74Z" fill="#f0dcaa" stroke="${INK}" stroke-width="2.4"/>
      <path d="M3 3 L10 8 M57 2 L50 7 M58 72 L52 66 M2 74 L9 68" stroke="${INK}" stroke-width="1" opacity=".4"/>
      <text x="30" y="16" text-anchor="middle" font-family="Rye,serif" font-size="11" fill="${ink}">WANTED</text>
      <rect x="14" y="20" width="32" height="28" fill="#e0c890" stroke="${ink}" stroke-width="1.6"/>
      <path d="M22 44 Q22 30 30 28 Q38 30 38 44Z" fill="${ink}" opacity=".85"/><circle cx="30" cy="30" r="6" fill="${ink}" opacity=".85"/>
      <path d="M20 26 Q30 18 40 26 L42 28 H18Z" fill="${ink}" opacity=".85"/>
      <path d="M26 33 l3 1 M34 33 l-3 1" stroke="#f0dcaa" stroke-width="1.2" opacity=".9"/><path d="M24 40 Q30 42 36 40" stroke="#f0dcaa" stroke-width=".8" fill="none" opacity=".6"/>
      <path d="M16 51 H44" stroke="${ink}" stroke-width=".8"/>
      <text x="30" y="60" text-anchor="middle" font-family="Oswald,sans-serif" font-weight="700" font-size="10" fill="${ink}">${bounty}</text>
      <text x="30" y="69" text-anchor="middle" font-family="Oswald,sans-serif" font-size="6" letter-spacing=".5" fill="${ink}">REWARD</text>
      <path d="M8 57 l1 2 2 .3 -1.5 1.4 .4 2 -1.9 -1 -1.9 1 .4 -2 -1.5 -1.4 2 -.3z M52 57 l1 2 2 .3 -1.5 1.4 .4 2 -1.9 -1 -1.9 1 .4 -2 -1.5 -1.4 2 -.3z" fill="${ink}" opacity=".7"/>
      <path d="M58 72 L50 74 L57 64Z" fill="#d8c090" stroke="${INK}" stroke-width="1"/>
      <circle cx="30" cy="5.5" r="1.8" fill="#8a8a9a" stroke="${INK}" stroke-width=".8"/>
      ${tier >= 1 ? `<circle cx="48" cy="26" r="2.2" fill="${INK}"/><path d="M45 26 h-2 M51 26 h2 M48 23 v-2 M48 29 v2" stroke="${INK}" stroke-width=".7"/>` : ''}
      ${tier >= 3 ? `<circle cx="12" cy="40" r="1.8" fill="${INK}"/><path d="M4 30 Q8 34 6 40" stroke="#8a1010" stroke-width="1.4" fill="none" opacity=".7"/>` : ''}
      ${stamp}</svg>`;
  };

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
