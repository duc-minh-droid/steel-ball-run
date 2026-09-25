/* Stage-finish sprint minigame: time presses to the Golden Rectangle ring.
   The course is one long drawn map from the start line to the goal (no looping backgrounds), and rivals play dirty:
   they shoot, lasso, throw dust and use their Stands on you. A telegraphed attack is dodged by hitting GOLD in time. */
'use strict';
SBR.sprint = (() => {
  const { el, sleep } = SBR.util;
  const art = SBR.art;
  const K = '#1a1020';

  /* ---------- the course: long parallax layers that end at the goal ---------- */
  const PAL = {
    1: { sky: ['#f6b26b', '#fde9c9'], far: '#d08a6a', mid: '#b86a44', ground: '#e8c080', dirt: '#c89a5a', deco: 'cactus' },
    2: { sky: ['#8ab8e8', '#e8f4ff'], far: '#8a9ab8', mid: '#4a6a4a', ground: '#9aaa5a', dirt: '#8a7a4a', deco: 'pine', snowcap: true },
    3: { sky: ['#7ab0e0', '#f6f0d0'], far: '#9ab870', mid: '#6a9a4a', ground: '#b8c870', dirt: '#a08a50', deco: 'fence' },
    4: { sky: ['#9ab0c8', '#eef4fa'], far: '#b8c8d8', mid: '#6a8a9a', ground: '#eef4f8', dirt: '#c8d4e0', deco: 'snowpine', snowcap: true },
    5: { sky: ['#e8a070', '#f8e0c0'], far: '#a88a7a', mid: '#7a6a5a', ground: '#9aa860', dirt: '#8a7a50', deco: 'farm' },
    6: { sky: ['#6a5a9a', '#f0b890'], far: '#5a5070', mid: '#3a3050', ground: '#8a8a8a', dirt: '#6a6a70', deco: 'city' },
  };
  function seeded(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  const DECO = {
    cactus: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-5 0V-40a5 5 0 0 1 10 0V0zM-5-18h-8v-12a4 4 0 0 1 8 0M5-24h8v-10a4 4 0 0 0-8 0" fill="#5a8a3a" stroke="${K}" stroke-width="2.4"/></g>`,
    pine: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0-60L-16-20h8L-20 0h40L8-20h8z" fill="#2a5a3a" stroke="${K}" stroke-width="2.4"/><rect x="-3" y="0" width="6" height="8" fill="#5a3a2a"/></g>`,
    snowpine: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0-60L-16-20h8L-20 0h40L8-20h8z" fill="#3a6a5a" stroke="${K}" stroke-width="2.4"/><path d="M0-60l-8 20 8-4 8 4zM-12-20l12 6 12-6" fill="#fff" stroke="${K}" stroke-width="1.4"/></g>`,
    fence: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30-14h60M-30-26h60" stroke="#8a6a4a" stroke-width="4"/><path d="M-26 0v-32M0 0v-32M26 0v-32" stroke="#6a4a2a" stroke-width="5"/></g>`,
    farm: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-24 0v-26l24-16 24 16V0z" fill="#b8423a" stroke="${K}" stroke-width="2.4"/><path d="M-8 0v-14h16V0" fill="#f6ecd8" stroke="${K}" stroke-width="2"/></g>`,
    city: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0v-44" stroke="${K}" stroke-width="3"/><circle cx="0" cy="-46" r="5" fill="#fff3a0" stroke="${K}" stroke-width="2"/></g>`,
  };
  /** build the course; returns layers [{node, rate}] and the goal's x in near-layer coordinates */
  function buildCourse(host, act, W, H, LEN, PRE, scale) {
    const P = PAL[act] || PAL[1];
    const rnd = seeded(act * 977 + 13);
    host.innerHTML = `<div class="sw-sky" style="background:linear-gradient(${P.sky[1]}, ${P.sky[0]})"><div class="sw-sun"></div></div>`;
    const worldW = rate => Math.ceil(W * 1.6 + (LEN + PRE + 400) * scale * rate);
    const mk = (rate, inner, w, cls) => { const d = el('div', { class: 'sw-layer ' + cls, html: `<svg width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>` }); host.appendChild(d); return { node: d, rate }; };
    const layers = [];
    // far: mountains / skyline and clouds
    { const w = worldW(0.12), base = H * 0.36; let d = `M0 ${H}L0 ${base}`; let x = 0; const peaks = [];
      while (x < w) { const pw = 80 + rnd() * 140, ph = 30 + rnd() * (P.deco === 'city' ? 50 : 90); if (P.deco === 'city') { d += `L${x} ${base - ph}L${x + pw * 0.6} ${base - ph}L${x + pw * 0.6} ${base - ph * 0.6}`; } else { d += `L${x + pw / 2} ${base - ph}L${x + pw} ${base}`; peaks.push([x + pw / 2, base - ph]); } x += pw * (P.deco === 'city' ? 0.6 : 0.8); }
      d += `L${w} ${base}L${w} ${H}z`;
      const snow = P.snowcap ? peaks.map(([px, py]) => `<path d="M${px - 12} ${py + 16}L${px} ${py}L${px + 12} ${py + 16}l-6-3-6 5-6-5z" fill="#fff" opacity=".9"/>`).join('') : '';
      const clouds = [...Array(Math.ceil(w / 260))].map((_, i) => { const cx = i * 260 + rnd() * 120, cy = H * (0.08 + rnd() * 0.18); return `<g opacity=".85"><ellipse cx="${cx}" cy="${cy}" rx="46" ry="14" fill="#fff"/><ellipse cx="${cx + 24}" cy="${cy - 8}" rx="26" ry="14" fill="#fff"/></g>`; }).join('');
      layers.push(mk(0.12, clouds + `<path d="${d}" fill="${P.far}" stroke="${K}" stroke-width="2"/>` + snow, w, 'far')); }
    // mid: hills and landmarks
    { const w = worldW(0.4), base = H * 0.43; let d = `M0 ${H}L0 ${base}`; for (let x = 0; x <= w; x += 60) d += `Q${x + 30} ${base - 10 - rnd() * 34} ${x + 60} ${base - rnd() * 8}`; d += `L${w} ${H}z`;
      const deco = [...Array(Math.ceil(w / 170))].map((_, i) => (DECO[P.deco] || DECO.cactus)(i * 170 + rnd() * 90, base + 4, 0.55 + rnd() * 0.3)).join('');
      layers.push(mk(0.4, `<path d="${d}" fill="${P.mid}" stroke="${K}" stroke-width="2"/>${deco}`, w, 'mid')); }
    // near: the track itself, distance posts, and the goal
    { const w = worldW(1), top = H * 0.47;
      const X = p => W * 0.38 + (p + PRE) * scale;
      let s = `<rect x="0" y="${top}" width="${w}" height="${H - top}" fill="${P.ground}"/><path d="M0 ${top}H${w}" stroke="${K}" stroke-width="3"/>`;
      s += [...Array(6)].map((_, i) => `<path d="M0 ${top + 24 + i * 34}H${w}" stroke="${P.dirt}" stroke-width="${3 + i}" stroke-dasharray="${30 + i * 10} ${40 + i * 12}" opacity=".6"/>`).join('');
      for (let p = 0; p <= LEN; p += 100) { const x = X(p); const left = LEN - p; s += `<g transform="translate(${x} ${top})"><path d="M0 0v-40" stroke="#6a4a2a" stroke-width="5"/><rect x="-22" y="-58" width="44" height="18" fill="#f6ecd8" stroke="${K}" stroke-width="2"/><text x="0" y="-45" font-size="11" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${K}">${left ? left * 15 + 'm' : 'GOAL'}</text></g>`; }
      for (let i = 0; i < w / 90; i++) { const x = i * 90 + rnd() * 60; s += `<ellipse cx="${x}" cy="${top + 10 + rnd() * (H - top - 20)}" rx="${4 + rnd() * 6}" ry="${2 + rnd() * 3}" fill="${K}" opacity=".18"/>`; }
      // start line
      s += `<rect x="${X(0) - 6}" y="${top}" width="10" height="${H - top}" fill="#fff" opacity=".8"/>`;
      // goal: checkered arch, banner and a crowd
      const gx = X(LEN) + 80;
      const crowd = [...Array(26)].map((_, i) => { const cx = gx - 160 + i * 14 + rnd() * 6, cy = top - 6 - rnd() * 8; const c = ['#c8323c', '#3b5bb5', '#f2c14e', '#3a8c4a', '#e8508a', '#f6ecd8'][i % 6]; return `<path d="M${cx - 6} ${cy + 6}q6-18 12 0z" fill="${c}" stroke="${K}" stroke-width="1.4"/><circle cx="${cx}" cy="${cy - 12}" r="4.4" fill="#f0c8a0" stroke="${K}" stroke-width="1.4"/>`; }).join('');
      s += crowd + `<g transform="translate(${gx} ${top})"><path d="M-70 0v-150M70 0v-150" stroke="${K}" stroke-width="10"/><path d="M-70 0v-150M70 0v-150" stroke="#f6ecd8" stroke-width="6" stroke-dasharray="12 12"/><rect x="-90" y="-176" width="180" height="36" fill="#c8323c" stroke="${K}" stroke-width="3"/><text x="0" y="-150" font-size="26" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="#f2c14e" stroke="${K}" stroke-width="1.4" paint-order="stroke">GOAL</text>${[...Array(8)].map((_, i) => `<path d="M${-90 + i * 24} -140l12 14 12-14" fill="${i % 2 ? '#fff' : '#3b5bb5'}" stroke="${K}" stroke-width="1.4"/>`).join('')}</g>`;
      layers.push(mk(1, s, w, 'near'));
    }
    return layers;
  }

  /* ---------- dirty tricks ---------- */
  const TRICKS = {
    shot:  { warn: 'draws a revolver on you', hit: 'BANG! Your horse rears.', fx: s => { s.stumble = 1.3; s.stamina -= 15; } },
    lasso: { warn: 'swings a lasso at your horse', hit: 'Roped! Your horse is dragging.', fx: s => { s.slow = 2.2; } },
    dust:  { warn: 'kicks up a cloud of dust', hit: 'Sand in your eyes!', fx: s => { s.blind = 2; } },
    knife: { warn: 'throws a knife', hit: 'A cut on the flank. Stamina drains.', fx: s => { s.stamina -= 26; } },
    shove: { warn: 'rides in close to shove you', hit: 'Shoved off the line!', fx: s => { s.me.pos -= 14; s.stumble = 0.6; } },
    stand: { warn: 'uses a Stand on you', hit: 'The Stand hits home.', fx: s => { s.stumble = 1.6; s.stamina -= 12; } },
    gust:  { warn: 'a gust', hit: 'The wind stops your horse dead.', fx: s => { s.slow = 1.8; s.stamina -= 6; } },
    obstacle: { warn: 'an obstacle', hit: 'Your horse crashes through it!', fx: s => { s.stumble = 1.4; s.stamina -= 8; } },
    sound: { warn: 'stamps a sound onto your saddle', hit: 'DOGOOON! Your next press will misfire.', fx: s => { s.misfire = true; } },
  };
  // Stand-skill hits (the plain tricks above are what a rider does without a Stand, or when they hold it back)
  Object.assign(TRICKS, {
    bite:  { warn: 'lunges with raptor jaws', hit: 'The raptor\'s jaws catch your horse! It rears in panic.', fx: s => { s.stumble = 1.5; s.stamina -= 16; } },
    flesh: { warn: 'sprays flesh at you', hit: 'Flesh spray! You can\'t see the ring.', fx: s => { s.blind = 2.2; } },
    ball:  { warn: 'throws a steel ball', hit: 'The steel ball spins into your horse\'s leg. It locks up!', fx: s => { s.stumble = 1.4; s.stamina -= 10; } },
    nails: { warn: 'fires his nails', hit: 'Spin holes bore through your saddle!', fx: s => { s.stumble = 1.1; s.stamina -= 18; } },
    bolas: { warn: 'whirls his bolas', hit: 'The bolas wrap your horse\'s legs!', fx: s => { s.slow = 2; s.stumble = 0.4; } },
    luck:  { warn: 'gets lucky', hit: 'A flying horseshoe clips you. What luck. His, not yours.', fx: s => { s.stumble = 0.9; s.stamina -= 6; } },
    numb:  { warn: 'hurls a wrecking ball', hit: 'Your left side vanishes! The horse veers off the line.', fx: s => { s.slow = 1.6; s.stumble = 0.8; } },
  });

  /* ---------- rival Stand skills: what each rider throws at you, and what they do for themselves ---------- */
  const JAWS = `<svg viewBox="0 0 70 44"><g class="jup"><path d="M4 22Q14 4 40 6L66 14L62 18L56 16L52 20L46 17L42 21L36 18L30 22z" fill="#5aa84a" stroke="${K}" stroke-width="2.6" stroke-linejoin="round"/><circle cx="26" cy="12" r="3" fill="#f2c14e" stroke="${K}" stroke-width="1.5"/></g><g class="jlo"><path d="M6 24L30 24L36 27L42 24L48 27L54 25L60 28Q40 40 10 32z" fill="#3f8a3a" stroke="${K}" stroke-width="2.6" stroke-linejoin="round"/></g></svg>`;
  const RAPTOR = `<svg viewBox="0 0 120 80"><path d="M4 34Q28 28 46 36L64 30Q70 16 84 14L108 18L114 24L100 26L106 30L90 32Q84 44 74 48L72 60L80 74L70 74L64 60L58 50L50 60L56 74L46 74L42 58Q26 48 4 34z" fill="#4a9a3a" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><circle cx="92" cy="21" r="2.6" fill="#f2c14e" stroke="${K}" stroke-width="1"/><path d="M60 38l6 6M52 40l5 6M44 40l4 5" stroke="#2a5a2a" stroke-width="2"/></svg>`;
  const RUNNER = `<svg viewBox="0 0 60 80"><path d="M30 8Q14 6 6 16" stroke="${K}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M26 44L40 56L36 72M26 44L16 58L4 60M30 26L44 32L50 24M30 26L18 34L12 28M32 20L26 44" stroke="${K}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 44L40 56L36 72M26 44L16 58L4 60M30 26L44 32L50 24M30 26L18 34L12 28M32 20L26 44" stroke="#b8784a" stroke-width="4.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="34" cy="12" r="7" fill="#b8784a" stroke="${K}" stroke-width="2.4"/><path d="M27 10h14" stroke="#c8323c" stroke-width="3"/></svg>`;
  const svgI = (vb, inner) => `<svg viewBox="${vb}">${inner}</svg>`;
  /** projectile visuals. shots: [launch, arrive] as fractions of the telegraph window; arc: height in px */
  const PROJ = {
    bite:   { shots: [[0.5, 1]], arc: 16, noRot: true, flip: true, html: JAWS, hitK: 'ガブッ', burst: 'bite' },
    word:   { shots: [[0, 1]], arc: 46, noRot: true, html: '<b>DOGOOON</b>', hitK: 'ドゴォォン', burst: 'word' },
    ball:   { shots: [[0.12, 1]], arc: 95, noRot: true, html: '<i></i>', hitK: 'ギャルルル', burst: 'star' },
    rope:   { shots: [[0.18, 1]], arc: 34, tether: 'rope', noRot: true, html: svgI('0 0 40 30', `<ellipse cx="20" cy="15" rx="16" ry="11" fill="none" stroke="${K}" stroke-width="5"/><ellipse cx="20" cy="15" rx="16" ry="11" fill="none" stroke="#c89a5a" stroke-width="3"/>`), hitK: 'ギュン', burst: 'rope' },
    nail:   { shots: [[0.2, 1], [0.3, 1], [0.4, 1]], arc: 14, html: svgI('0 0 30 10', `<path d="M0 5L22 2L30 5L22 8z" fill="#d8d0f0" stroke="${K}" stroke-width="1.6"/>`) + '<u></u>', hitK: 'ズババッ', burst: 'star' },
    bullet: { shots: [[0.8, 1]], arc: 0, tether: 'aim', flash: true, html: '<i></i>', hitK: 'バキュン', burst: 'star' },
    knife:  { shots: [[0.3, 1], [0.48, 1]], arc: 26, spin: true, html: svgI('0 0 40 12', `<rect x="0" y="4" width="12" height="4" fill="#5a3a2a" stroke="${K}" stroke-width="1.4"/><path d="M12 2h4v8h-4z" fill="#8a8a9a" stroke="${K}" stroke-width="1"/><path d="M16 3L40 6L16 9z" fill="#eeeef6" stroke="${K}" stroke-width="1.4"/>`), hitK: 'ザクッ', burst: 'star' },
    bolas:  { shots: [[0.15, 1]], arc: 54, noRot: true, html: svgI('0 0 40 40', `<path d="M8 8L20 20L32 30M20 20L10 32" stroke="#8a6a3a" stroke-width="2.4"/><circle cx="8" cy="8" r="5" fill="#6a5a4a" stroke="${K}" stroke-width="2"/><circle cx="32" cy="30" r="5" fill="#6a5a4a" stroke="${K}" stroke-width="2"/><circle cx="10" cy="32" r="5" fill="#6a5a4a" stroke="${K}" stroke-width="2"/>`), hitK: 'ビシィッ', burst: 'rope' },
    ash:    { shots: [[0.35, 1]], arc: 64, noRot: true, html: svgI('0 0 24 24', `<path d="M6 10Q4 22 12 22Q20 22 18 10z" fill="#8a7a6a" stroke="${K}" stroke-width="2"/><path d="M7 10h10l-2-4h-6z" fill="#6a2a4a" stroke="${K}" stroke-width="1.6"/>`), hitK: 'ボフッ', burst: 'ash' },
    flesh:  { shots: [[0.4, 1], [0.47, 1], [0.54, 1]], arc: 22, noRot: true, html: '<i></i>', hitK: 'ブシュッ', burst: 'flesh' },
    shoe:   { shots: [[0.3, 1]], arc: 80, noRot: true, html: svgI('0 0 32 32', `<path d="M6 4v12a10 10 0 0 0 20 0V4" fill="none" stroke="${K}" stroke-width="8"/><path d="M6 4v12a10 10 0 0 0 20 0V4" fill="none" stroke="#b8b8c8" stroke-width="4.6"/>`), hitK: 'カーン', burst: 'star' },
    cut:    { shots: [[0.55, 1]], arc: 0, html: '<i></i>', hitK: 'ズザァッ', burst: 'star' },
    wball:  { shots: [[0.1, 1]], arc: 74, noRot: true, html: '<i></i>', hitK: 'ドグシャア', burst: 'star' },
  };
  const GENERIC = { shot: 'bullet', lasso: 'rope', dust: 'ash', shove: 'cut', knife: 'knife', stand: 'ball', sound: 'word' };
  const PLAIN_K = { shot: 'チャキッ', lasso: 'ヒュンヒュン', dust: 'ザザッ', shove: 'ドッ', knife: 'シュッ' };
  /** per-rival skills. atk: the attack you must dodge (stand: true means a Stand, with a cut-in). self: what they do for themselves. plain: the trick used when they hold the Stand back. */
  const SKILL = {
    diego: { stand: 'Scary Monsters', fig: 'scarymonsters', color: '#4aa84a', kana: 'ドドドド', plain: 'shove',
      atk: { stand: true, kind: 'bite', proj: 'bite', line: 'DIEGO turns into a raptor and lunges at your horse!', durMul: 0.95, start: (rn, X) => { X.skin(rn, 'sk-raptor', 2.4, RAPTOR); rn.surge = Math.max(rn.surge, 1.6); rn.bigSurge = 1.6; } },
      self: { stand: true, line: 'DIEGO: 「Scary Monsters」! Raptor legs!', kana: 'ドドドド', run: (rn, X) => { X.skin(rn, 'sk-raptor', 2.8, RAPTOR); rn.surge = 2.8; rn.bigSurge = 2.8; } } },
    sandman: { stand: 'In a Silent Way', fig: 'silentway', color: '#c8a040', kana: 'ゴゴゴゴ', plain: 'shove',
      atk: { stand: true, kind: 'sound', proj: 'word', line: 'SANDMAN carves a sound into the air: DOGOOON!', durMul: 1.15, hit: 'DOGOOON! The sound lands on your saddle. Your next press will misfire.' },
      self: { line: 'SANDMAN leaves his horse and runs on foot!', kana: 'ダッダッダッ', run: (rn, X) => { X.skin(rn, 'sk-onfoot', 3.2, RUNNER); rn.surge = 3.2; rn.bigSurge = 3.2; } } },
    hotpants: { stand: 'Cream Starter', fig: 'creamstarter', color: '#f09ac0', kana: 'ゴゴゴ', plain: 'dust',
      atk: { stand: true, kind: 'flesh', proj: 'flesh', line: 'HOT PANTS sprays flesh over your eyes!' },
      self: { stand: true, line: 'HOT PANTS patches her horse with 「Cream Starter」!', kana: 'ジュルッ', run: (rn, X) => { X.skin(rn, 'sk-heal', 2); rn.surge = 2.2; rn.bigSurge = 1.4; } } },
    gyro: { stand: 'Steel Ball: The Spin', fig: null, color: '#3fb8a9', kana: 'ギャルルル', plain: 'shove',
      atk: { stand: true, kind: 'ball', proj: 'ball', line: 'GYRO throws a spinning steel ball at your horse!' },
      self: { stand: true, line: 'GYRO: the Spin runs through his horse\'s legs!', kana: 'ギュルルル', run: (rn, X) => { X.skin(rn, 'sk-spin', 2.4, '<i></i>'); rn.surge = 2.4; rn.bigSurge = 2; } } },
    mountaintim: { stand: 'Oh! Lonesome Me', fig: 'lonesome', color: '#e8742a', kana: 'ゴゴゴ', plain: 'lasso',
      atk: { stand: true, kind: 'lasso', proj: 'rope', line: 'MOUNTAIN TIM\'s rope splits and drags your horse!', hit: 'The rope splits apart around you and drags! You\'re slowed.' },
      self: { stand: true, line: 'MOUNTAIN TIM ropes a rock ahead and reels himself in!', kana: 'ヒュン', run: (rn, X) => { X.child(rn, 'sk-ropeout', '', 0.8); rn.pos += 16; rn.surge = 2; rn.bigSurge = 1.2; } } },
    pocoloco: { stand: 'Hey Ya!', fig: 'heyya', color: '#f2c14e', kana: 'ドドド', plain: 'shove',
      atk: { stand: true, kind: 'luck', proj: 'shoe', line: 'POCOLOCO\'s horse throws a shoe, luckily, right at you!', start: (rn, X) => X.heyYa(rn, 'Kick it!') },
      self: { stand: true, line: '', kana: 'ラッキー', run: (rn, X) => { const j = Math.random() < 0.15; rn.pos += j ? 60 : 18 + Math.random() * 26; X.heyYa(rn, j ? 'JACKPOT!' : 'You can do it!'); X.skin(rn, 'sk-lucky', 1.6, '<i>★</i><i>★</i><i>★</i>'); X.say(j ? 'POCOLOCO: 「Hey Ya!」 JACKPOT! A whole shortcut!' : 'POCOLOCO: 「Hey Ya!」 a lucky shortcut!'); } } },
    johnny: { stand: 'Tusk', fig: act => (act >= 6 ? 'tusk4' : act >= 5 ? 'tusk3' : act >= 4 ? 'tusk2' : 'tusk1'), color: '#6b5bd6', kana: 'ドドドド', plain: 'shot',
      atk: { stand: true, kind: 'nails', proj: 'nail', line: 'JOHNNY fires his spinning nails at you!' },
      self: { stand: true, line: 'JOHNNY spins his horse\'s hooves with 「Tusk」!', kana: 'ギュルル', run: (rn, X) => { X.skin(rn, 'sk-spin', 2, '<i></i>'); rn.surge = 2.2; rn.bigSurge = 1.6; } } },
    wekapipo: { stand: 'Wrecking Ball', fig: 'wreckingball', color: '#9aa0b8', kana: 'ゴゴゴゴ', plain: 'shot',
      atk: { stand: true, kind: 'numb', proj: 'wball', line: 'WEKAPIPO hurls a Wrecking Ball!' } },
    magent: { stand: '20th Century BOY', fig: 'century', color: '#8a8aa0', kana: 'ゴゴゴ', plain: 'shot',
      self: { stand: true, line: 'MAGENT MAGENT: 「20th Century BOY」! Nothing can touch him!', kana: 'ガキィン', run: (rn, X) => { X.skin(rn, 'sk-armour', 3); rn.immune = 3; rn.surge = 1.5; } } },
    dothan: { color: '#e8a040', atk: { kind: 'shot', proj: 'bullet', line: 'DOT HAN draws and fires from the saddle!', durMul: 0.9, kana: 'チャキッ' } },
    dixie: { color: '#e8508a', atk: { kind: 'shot', proj: 'bullet', line: 'DIXIE CHICKEN lines up a trick shot!', durMul: 0.9, kana: 'チャキッ' } },
    mackknife: { color: '#c8c8d8', atk: { kind: 'knife', proj: 'knife', line: 'MACK THE KNIFE throws a pair of blades!', kana: 'シュッ' } },
    gaucho: { color: '#c8323c', atk: { kind: 'bolas', proj: 'bolas', line: 'GAUCHO whirls his bolas at your horse!', kana: 'ヒュンヒュン' } },
    babayaga: { color: '#8a3a8a', atk: { kind: 'dust', proj: 'ash', line: 'BABA YAGA throws a pouch of ash!', hit: 'Ash in your eyes! The ring goes grey.', kana: 'ケケケ' } },
    norisuke: { color: '#f6ecd8', atk: { kind: 'shove', proj: 'cut', line: 'NORISUKE cuts right across your line!', kana: 'ズザッ' } },
  };
  // riders who like to follow each other up
  const PAIR = { dothan: 'dixie', dixie: 'dothan', diego: 'hotpants', hotpants: 'diego', gyro: 'johnny', johnny: 'gyro', sandman: 'mountaintim', mountaintim: 'sandman' };

  /* ---------- weather: every leg of the race has its own, and it gets worse each stage ---------- */
  const WEATHER = {
    heat:     { name: 'SCORCHING HEAT', desc: 'Stamina drains faster.', cls: 'w-heat', drain: 1.45, obstacles: 'rock' },
    gale:     { name: 'MOUNTAIN GALE', desc: 'Headwinds and rockslides.', cls: 'w-wind', gusts: true, drain: 1.1, obstacles: 'rock' },
    storm:    { name: 'THUNDERSTORM', desc: 'Slick mud makes every stumble longer. Lightning blinds.', cls: 'w-rain', slick: 1.5, lightning: true, obstacles: 'mud' },
    blizzard: { name: 'BLIZZARD', desc: 'Snow blots out the ring. The cold saps stamina.', cls: 'w-snow', drain: 1.35, fogRing: true, gusts: true, obstacles: 'ice' },
    fog:      { name: 'SEA FOG', desc: 'The gold zone fades in and out of the fog.', cls: 'w-fog', hideGold: true, obstacles: 'cart' },
    night:    { name: 'NIGHT RIDE', desc: 'Darkness: the gold zone flickers, and there are tripwires in the road.', cls: 'w-night', hideGold: true, lightning: true, drain: 1.15, obstacles: 'trap' },
  };
  const ACT_WEATHER = { 1: 'heat', 2: 'gale', 3: 'storm', 4: 'blizzard', 5: 'fog', 6: 'night' };
  const COND_WEATHER = { sandstorm: 'heat', drought: 'heat', coldsnap: 'blizzard', night: 'night' };
  const OBST = { rock: 'ROCKSLIDE AHEAD', mud: 'DEEP MUD AHEAD', ice: 'CRACKED ICE AHEAD', cart: 'AN OVERTURNED CART', trap: 'A TRIPWIRE ACROSS THE ROAD' };

  /* ---------- Stand powers you can use in the race (once each), from whoever rides with you ---------- */
  const POWER = {
    nails:     { name: 'Nail Shot', glyph: '爪', color: '#6b5bd6', desc: 'Tusk shoots the rider ahead: they stall for 2s.', use: A => A.stunAhead(2) },
    steelball: { name: 'Steel Ball', glyph: '球', color: '#3fb8a9', desc: 'Knock the rider ahead back and stall them.', use: A => { const t = A.ahead(); if (t) { t.pos -= 20; t.stun = 1.4; } } },
    cream:     { name: 'Cream Starter', glyph: '肉', color: '#f09ac0', desc: 'Patch up your horse: +50 stamina.', use: A => A.stamina(50) },
    lasso:     { name: 'Oh! Lonesome Me', glyph: '縄', color: '#e8742a', desc: 'Rope the rider ahead and pull yourself up to them.', use: A => { const t = A.ahead(); A.me.pos = t ? Math.max(A.me.pos, t.pos - 4) : A.me.pos + 25; } },
    heyya:     { name: 'Hey Ya!', glyph: '運', color: '#f2c14e', desc: '"You can do it!" Your next 4 presses are all GOLD.', use: A => { A.S.autoGold = 4; } },
    wrecking:  { name: 'Wrecking Ball', glyph: '鉄', color: '#c8c8d8', desc: 'Every rider close ahead is numbed and stalls.', use: A => A.rivals().filter(x => x.pos > A.me.pos && x.pos - A.me.pos < 160).forEach(x => { x.stun = 1.6; }) },
    ticket:    { name: 'Ticket to Ride', glyph: '幸', color: '#f09ac0', desc: 'Misfortune slides off you: every attack misses for 5s.', use: A => { A.S.shield = 5; } },
    timestop:  { name: 'Star Platinum: The World', glyph: '止', color: '#7a5ad0', desc: 'Stop time for 3 seconds. Only you move.', use: A => A.freeze(3, 'STAR PLATINUM: THE WORLD!') },
    crimson:   { name: 'King Crimson', glyph: '紅', color: '#c8323c', desc: 'Erase time: skip ahead, and nothing can hit you for 4s.', use: A => { A.me.pos += 22; A.S.shield = 4; A.flash('#c8323c'); } },
    fire:      { name: 'Crossfire Hurricane', glyph: '炎', color: '#e8742a', desc: 'A ring of fire: every rider near you stalls.', use: A => A.rivals().filter(x => Math.abs(x.pos - A.me.pos) < 90).forEach(x => { x.stun = 1.4; }) },
    emerald:   { name: 'Emerald Splash', glyph: '翠', color: '#3aa05a', desc: 'Emeralds at everyone ahead of you.', use: A => A.rivals().filter(x => x.pos > A.me.pos && x.pos - A.me.pos < 240).forEach(x => { x.stun = 1.1; }) },
    armoroff:  { name: 'Armour Off', glyph: '脱', color: '#c8ccd8', desc: 'Silver Chariot drops its armour: +50% speed for 4s.', use: A => { A.S.boostT = 4; } },
    restore:   { name: 'Crazy Diamond', glyph: '治', color: '#e89ac8', desc: 'Fix your horse: full stamina, no stumble, no rope.', use: A => { A.stamina(100); A.S.stumble = 0; A.S.slow = 0; } },
    bomb:      { name: 'Killer Queen', glyph: '爆', color: '#e8a0c8', desc: 'Turn the rider ahead\'s saddle into a bomb.', use: A => { const t = A.ahead(); if (t) { t.pos -= 40; t.stun = 1.2; A.flash('#e8508a'); } } },
    erase:     { name: 'The Hand', glyph: '削', color: '#3a6ac8', desc: 'Erase the space in front of you: jump 40 ahead.', use: A => { A.me.pos += 40; } },
    life:      { name: 'Gold Experience', glyph: '命', color: '#f2c14e', desc: 'Life floods your horse: +60 stamina and 2s untouchable.', use: A => { A.stamina(60); A.S.shield = 2; } },
    zipper:    { name: 'Sticky Fingers', glyph: '開', color: '#5a8ad0', desc: 'Zip open a shortcut through the ground: +30.', use: A => { A.me.pos += 30; } },
    string:    { name: 'Stone Free', glyph: '糸', color: '#4a7ad0', desc: 'String the rider ahead to your saddle: they stall 2s, you gain on them.', use: A => { const t = A.ahead(); if (t) { t.stun = 2; A.me.pos += 10; } } },
    disc:      { name: 'Whitesnake', glyph: '盤', color: '#e8e8f0', desc: 'Steal the rider ahead\'s disc: they stall for 3s.', use: A => A.stunAhead(3) },
    ripple:    { name: 'Hamon Breathing', glyph: '波', color: '#f2c14e', desc: 'Breathe with the sun: full stamina.', use: A => A.stamina(100) },
    vamp:      { name: 'Inhuman Speed', glyph: '血', color: '#8a1a2a', desc: 'Vampire legs: +50% speed for 5s.', use: A => { A.S.boostT = 5; } },
    chestgun:  { name: 'Chest Machine Gun', glyph: '銃', color: '#8a8aa0', desc: 'Spray the road ahead: two riders stall.', use: A => A.rivals().filter(x => x.pos > A.me.pos).sort((a, b) => a.pos - b.pos).slice(0, 2).forEach(x => { x.stun = 1.5; }) },
  };
  const PATH_POWER = { star_platinum: 'timestop', king_crimson: 'crimson', magicians_red: 'fire', hierophant: 'emerald', silver_chariot: 'armoroff', crazy_diamond: 'restore', killer_queen: 'bomb', the_hand: 'erase', gold_experience: 'life', sticky_fingers: 'zipper', stone_free: 'string', whitesnake: 'disc', hamon: 'ripple', vampire: 'vamp', cyborg: 'chestgun' };
  const ALLY_POWER = { gyro: 'steelball', hotpants: 'cream', mountaintim: 'lasso', pocoloco: 'heyya', wekapipo: 'wrecking', lucy: 'ticket' };
  SBR.racePowers = r => {
    const out = [];
    r.party.filter(m => m.hp > 0).forEach(m => {
      let k = null;
      if (m.id === 'custom') k = PATH_POWER[m.path];
      else if (m.id === 'johnny') k = r.flags.tusk1 ? 'nails' : null;
      else k = ALLY_POWER[m.id];
      if (k && !out.some(o => o.id === k)) out.push(Object.assign({ id: k, who: m.id }, POWER[k]));
    });
    return out.slice(0, 4);
  };

  function run({ name, act, favourite, tutorial }) {
    SBR.music.play('sprint');
    return new Promise(resolve => {
      const r = SBR.run;
      const horse = SBR.HORSES[r.horse];
      const b = SBR.bonus();
      const leadId = r.lead || 'johnny';
      const L = SBR.CHARS[leadId] || SBR.CHARS.johnny;
      const leadM = r.party.find(m => m.id === leadId) || r.party[0];
      const ride = leadM ? leadM.stats.ride + (horse.bonus.ride || 0) : 6;
      // difficulty climbs with every stage finish: the 1st Stage is gentle, the 9th is brutal
      const hard = tutorial ? 0 : act * 1.2 - 0.6 + (SBR.threatTier ? SBR.threatTier() * 0.5 : 0);

      // participants
      const rivalKeys = Object.keys(SBR.RIVALS).filter(k => {
        const rv = SBR.RIVALS[k];
        if (k === leadId || r.party.some(m => m.id === k)) return false;
        if (rv.outAfter && act > rv.outAfter) return false;
        if (rv.out && rv.out(r)) return false;
        if (k === 'gyro' && r.flags.valDead) return false;
        if (k === 'diego' && act === 5 && r.flags.valDead) return false;
        return true;
      });
      let chosen = SBR.util.shuffle(rivalKeys.filter(k => k !== favourite)).slice(0, 4);
      if (favourite && rivalKeys.includes(favourite)) chosen.unshift(favourite); else chosen = SBR.util.shuffle(rivalKeys).slice(0, 5);
      chosen = chosen.slice(0, 5);
      const LEN = 1000, PRE = 250;
      const startOffset = (r.pace - 50) * 1.6;
      const actScale = tutorial ? 1.05 : 1.1 + act * 0.07;
      const riderCol = L.color || '#5b3a8c';
      const runners = [{ key: 'player', name: L.short, coat: horse.coat, mane: horse.mane, wrap: horse.wrap, spots: horse.spots, pos: startOffset, speed: 0, base: 44 + horse.speed * 2.2 + ride * 0.25, player: true }]
        .concat(chosen.map((k, i) => {
          const rv = SBR.RIVALS[k];
          const coats = ['#c8c8d0', '#6a4a2a', '#e8d8c0', '#3a2a1a', '#8a5a30', '#b8703a'];
          return { key: k, name: rv.name.split(' ')[0], coat: coats[i % coats.length], mane: '#1a1020', wrap: ['#3fb8a9', '#e8508a', '#f2c14e', '#c8323c', '#6b5bd6'][i % 5], pos: SBR.util.randInt(-30, 20), speed: 0, base: (47 + horse.speed * 0.4) * rv.speed * actScale * (k === favourite ? 1.12 : 1), surge: 0 };
        }));

      // DOM
      const wrap = el('div', { class: 'sprint' });
      wrap.innerHTML = `<div class="sprint-scene sprint-world"></div>
        <div class="sprint-head"><div class="sprint-name">${name}</div><div class="sprint-sub">Press <b>SPACE</b> / click when the needle hits <span class="gold">GOLD</span>. Hit GOLD while a rival attacks to <b>dodge</b>.</div></div>
        <div class="sprint-track"></div>
        <div class="sprint-progress"><div class="sp-line"></div></div>
        <div class="sprint-ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="rgba(26,16,32,.75)" stroke="#1a1020" stroke-width="10"/><circle cx="100" cy="100" r="80" fill="none" stroke="#f6ecd8" stroke-width="4" opacity=".3"/><path class="zone-good" fill="none" stroke="#6b5bd6" stroke-width="16"/><path class="zone-gold" fill="none" stroke="#f2c14e" stroke-width="16"/><g class="needle"><line x1="100" y1="100" x2="100" y2="26" stroke="#e8508a" stroke-width="6" stroke-linecap="round"/><circle cx="100" cy="100" r="10" fill="#e8508a" stroke="#1a1020" stroke-width="3"/></g></svg><div class="ring-feedback"></div><div class="ring-combo"></div></div>
        <div class="sprint-stamina"><span>STAMINA</span><div class="stam-bar"><div></div></div></div>
        <div class="sprint-warn"><b></b><span></span><i></i></div>
        <div class="sprint-weather"></div><div class="sprint-powers"></div><div class="sprint-wname"></div>
        <div class="sprint-count"></div><div class="sprint-hazard"></div><div class="sprint-fx"></div>`;
      document.getElementById('overlay').appendChild(wrap);
      requestAnimationFrame(() => wrap.classList.add('show'));
      const track = wrap.querySelector('.sprint-track');
      const prog = wrap.querySelector('.sprint-progress');
      runners.forEach((rn, i) => {
        rn.node = el('div', { class: 'runner' + (rn.player ? ' me' : ''), style: { top: (i * 15) + '%', zIndex: 10 + i, '--sc': (0.78 + i * 0.07).toFixed(2) } });
        rn.node.innerHTML = `<div class="runner-tag">${rn.player ? 'YOU' : rn.name}</div>${art.horse({ coat: rn.coat, mane: rn.mane, wrap: rn.wrap, spots: rn.spots, rider: { cape: rn.player ? riderCol : rn.wrap, body: rn.player ? '#3b5bb5' : '#6a4a2a', hat: rn.player ? riderCol : '#3a2a1a' } })}`;
        track.appendChild(rn.node);
        rn.dot = el('div', { class: 'sp-dot' + (rn.player ? ' me' : ''), title: rn.name });
        prog.appendChild(rn.dot);
      });
      const W0 = track.clientWidth || innerWidth, scale0 = W0 / 360;
      const layers = buildCourse(wrap.querySelector('.sprint-world'), act, W0, wrap.clientHeight || innerHeight, LEN, PRE, scale0);
      const finishLine = el('div', { class: 'finish-line' }, el('span', {}, 'GOAL'));
      track.appendChild(finishLine);

      // ring state (harder every act)
      const needle = wrap.querySelector('.needle');
      const goldEl = wrap.querySelector('.zone-gold'), goodEl = wrap.querySelector('.zone-good');
      const fb = wrap.querySelector('.ring-feedback'), comboEl = wrap.querySelector('.ring-combo');
      const stamFill = wrap.querySelector('.stam-bar div');
      const goldSize = Math.max(14, 26 + ride * 0.5 - hard * 1.4 + (b.sprint || horse.bonus.sprint ? 6 : 0));
      const S = { stamina: 100, stumble: 0, slow: 0, blind: 0, misfire: false, me: runners[0], shield: 0, boostT: 0, autoGold: 0, frozen: 0 };
      // weather for this leg: the act's own, or the race condition's; stronger every stage
      const wKey = tutorial ? null : (COND_WEATHER[r.conditions && r.conditions[act]] || ACT_WEATHER[act]);
      const WX = wKey ? WEATHER[wKey] : null;
      const wPow = Math.min(1.6, 0.4 + hard * 0.2);
      const slick = WX && WX.slick ? 1 + (WX.slick - 1) * wPow : 1;
      let gustT = 6, boltT = 5, fogT = 5, obstT = 7;
      if (WX) { wrap.classList.add(WX.cls); wrap.querySelector('.sprint-wname').innerHTML = `<b>${WX.name}</b><span>${WX.desc}</span>`; }
      let angle = 0, rot = 200 + hard * 14, zone = 90, combo = 0, cool = 0, boost = 0;
      const arc = (a0, a1) => {
        const p = a => [100 + 80 * Math.sin(a * Math.PI / 180), 100 - 80 * Math.cos(a * Math.PI / 180)];
        const [x0, y0] = p(a0), [x1, y1] = p(a1);
        return `M${x0} ${y0} A80 80 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
      };
      const placeZone = () => {
        zone = 40 + Math.random() * 280;
        goldEl.setAttribute('d', arc(zone - goldSize / 2, zone + goldSize / 2));
        goodEl.setAttribute('d', arc(zone - goldSize * 1.25, zone + goldSize * 1.25));
      };
      placeZone();
      const feedback = (t, cls) => { fb.textContent = t; fb.className = 'ring-feedback show ' + cls; clearTimeout(fb._t); fb._t = setTimeout(() => fb.classList.remove('show'), 500); };

      let started = false, finished = false, finishOrder = [], last = 0, elapsed = 0, hazardT = 3;
      const hazEl = wrap.querySelector('.sprint-hazard');
      const ringEl = wrap.querySelector('.sprint-ring');
      const warnEl = wrap.querySelector('.sprint-warn');
      const say = t => { hazEl.innerHTML = t; hazEl.classList.remove('show'); void hazEl.offsetWidth; hazEl.classList.add('show'); SBR.audio.play('menace'); };
      let threat = null, pending = null;
      /* ---- Stand-skill effects: DOM nodes in .sprint-fx, moved with transforms and removed when done ---- */
      const fxL = wrap.querySelector('.sprint-fx');
      const timers = [];                       // game-time timers: they stop with time stop
      const later = (t, fn) => timers.push({ t, fn });
      let loose = [];                          // missed / deflected projectiles still flying off
      let camShift = 0, prevCam = null, cutEl = null;
      // escalation: the harder the stage, the more often a rider reaches for their Stand, and the more they gang up
      const standChance = tutorial ? 0 : Math.min(0.95, 0.4 + hard * 0.09);
      const selfChance = tutorial ? 0.5 : Math.min(0.95, 0.55 + hard * 0.07);
      const maxChain = tutorial ? 0 : hard >= 6 ? 2 : hard >= 3 ? 1 : 0;
      const comboChance = Math.max(0, Math.min(0.55, (hard - 2.5) * 0.13));
      const colorOf = rn => (SKILL[rn.key] && SKILL[rn.key].color) || rn.wrap || '#c8323c';
      const wrapBox = () => wrap.getBoundingClientRect();
      /** a runner's centre in .sprint coordinates */
      const at = (rn, wr = wrapBox()) => { const r = rn.node.getBoundingClientRect(); return { x: r.left - wr.left + r.width * 0.5, y: r.top - wr.top + r.height * 0.45 }; };
      const place = (n, x, y, a, flip) => { n.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)${a ? ` rotate(${a.toFixed(1)}deg)` : ''}${flip ? ' scaleX(-1)' : ''}`; };
      /** a short-lived effect at a point (kana, bursts, muzzle flashes) */
      function spot(cls, html, p, life, color) {
        const d = el('div', { class: 'sk-fx ' + cls, html: `<div>${html}</div>` });
        if (color) d.style.setProperty('--skc', color);
        place(d, p.x, p.y); fxL.appendChild(d); later(life, () => d.remove()); return d;
      }
      const kana = (p, text, color) => spot('sk-kana', text, { x: p.x + (Math.random() * 30 - 15), y: p.y - 50 }, 0.9, color);
      const burst = (p, kind, color) => spot('sk-burst sk-b-' + kind, kind === 'word' ? 'ドゴォォン' : '', p, 0.6, color);
      /** a timed look on a runner (raptor, on foot, spinning, ...), with an optional overlay child */
      function skin(rn, cls, t, html) {
        if (rn.skinCls && rn.skinCls !== cls) endSkin(rn);
        rn.node.classList.add(cls); rn.skinCls = cls; rn.skinT = Math.max(rn.skinT || 0, t);
        if (html && !rn.skinNode) { rn.skinNode = el('div', { class: 'sk-skin', html }); rn.node.appendChild(rn.skinNode); }
      }
      function endSkin(rn) { if (rn.skinCls) rn.node.classList.remove(rn.skinCls); if (rn.skinNode) rn.skinNode.remove(); rn.skinCls = null; rn.skinNode = null; rn.skinT = 0; }
      function child(rn, cls, html, life) { const c = el('div', { class: cls, html }); rn.node.appendChild(c); later(life, () => c.remove()); return c; }
      /** the Stand itself appears beside its user for a moment */
      function figure(rn, sk, life) {
        const key = typeof sk.fig === 'function' ? sk.fig(act) : sk.fig;
        if (!key || !SBR.stands) return;
        child(rn, 'sk-fig', SBR.stands.svg(key), life || 1.5).style.setProperty('--skc', sk.color);
      }
      const heyYa = (rn, line) => child(rn, 'sk-fig sk-heyya', (SBR.stands ? SBR.stands.svg('heyya') : '') + `<span class="sk-bubble">${line}</span>`, 1.8);
      /** manga-style cut-in: portrait, the Stand's name in 「」 and a kana sound effect */
      function cutIn(rn, sk, sub) {
        if (cutEl) cutEl.remove();
        const rv = SBR.RIVALS[rn.key];
        const c = cutEl = el('div', { class: 'sk-cutin', html: `<div class="sk-cport">${rv ? art.portrait(rv.portrait) : ''}</div><div class="sk-ctxt"><small>${rv ? rv.name : rn.name}</small><b>「${sk.stand}」</b>${sub ? `<i>${sub}</i>` : ''}</div><em>${sk.kana || 'ゴゴゴ'}</em>` });
        c.style.setProperty('--skc', sk.color);
        wrap.appendChild(c); setTimeout(() => { c.remove(); if (cutEl === c) cutEl = null; }, 1500);
      }
      const X = { skin, child, heyYa, say, figure };

      /** a rival telegraphs an attack; hit GOLD before the bar runs out to dodge it */
      function attack(rn, chain = 0) {
        const sk = SKILL[rn.key];
        let spec;
        if (sk && sk.atk && (!sk.atk.stand || Math.random() < standChance)) spec = sk.atk;
        else {
          const kind = (sk && sk.plain) || SBR.util.pick(['shot', 'lasso', 'dust', 'shove']);
          spec = { kind, proj: GENERIC[kind], line: `${rn.name.toUpperCase()} ${TRICKS[kind].warn}!`, kana: PLAIN_K[kind] };
        }
        const me = runners[0];
        if (spec.kind === 'shove' && Math.abs(rn.pos - me.pos) > 40) rn.pos = me.pos + 10;
        const T = TRICKS[spec.kind];
        // the window shrinks every stage, but never below 0.75s
        const dur = Math.max(0.75, (tutorial ? 1.7 : 1.6 - hard * 0.11) * (spec.durMul || 1));
        const color = colorOf(rn);
        threat = { rn, kind: spec.kind, spec, color, t: dur, dur, chain, line: (chain ? `COMBO ×${chain + 1}! ` : '') + (spec.line || `${rn.name.toUpperCase()} ${T.warn}!`) };
        threat.combo = chain < maxChain && Math.random() < comboChance;
        warnEl.querySelector('b').textContent = '⚠ ' + threat.line;
        warnEl.querySelector('span').textContent = spec.stand ? `「${sk.stand}」 Hit GOLD to dodge!` : 'Hit GOLD to dodge!';
        warnEl.classList.add('show');
        warnEl.style.setProperty('--skc', color);
        warnEl.classList.toggle('sk-standwarn', !!spec.stand);
        rn.node.style.setProperty('--skc', color);
        rn.node.classList.add('attacking', 'sk-glow');
        // the projectiles for this attack (each is drawn once it launches)
        const P = PROJ[spec.proj];
        if (P) {
          threat.P = P;
          threat.projs = P.shots.map(([l0, l1], i) => ({ l0, l1, arc: P.arc * (1 + i * 0.3) * (Math.random() < 0.5 ? 1 : 0.8), node: null }));
          if (P.tether) { threat.teth = el('div', { class: 'sk-tether sk-t-' + P.tether }); threat.teth.style.opacity = 0; fxL.appendChild(threat.teth); }
        }
        const A = at(rn);
        if (spec.stand) { cutIn(rn, sk, chain ? `COMBO ×${chain + 1}` : ''); figure(rn, sk, dur + 0.4); kana(A, sk.kana || 'ゴゴゴ', color); }
        else if (spec.kana) kana(A, spec.kana, color);
        if (spec.start) spec.start(rn, X);
        SBR.audio.play('menace');
      }
      /** how = 'dodge' | 'land' | 'shield' | undefined (race over) */
      function clearThreat(how) {
        if (!threat) return;
        const th = threat;
        if (th.rn) th.rn.node.classList.remove('attacking', 'sk-glow');
        if (th.teth) th.teth.remove();
        if (th.projs) {
          const A = th.A, B = th.B;
          th.projs.forEach(q => {
            if (!q.node) return;
            if ((how === 'dodge' || how === 'shield') && A && B) {
              // it keeps going past you, or bounces back off the shield
              const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, sp = how === 'shield' ? -520 : 620;
              q.vx = dx / L * sp; q.vy = dy / L * sp - (how === 'shield' ? 260 : 180); q.life = 0.45; q.x = q.rx; q.y = q.ry; q.noRot = th.P.noRot;
              q.node.classList.add(how === 'shield' ? 'sk-deflect' : 'sk-miss'); loose.push(q);
            } else q.node.remove();
          });
        }
        threat = null;
        warnEl.classList.remove('show', 'sk-standwarn');
        // at higher stages a second rider follows straight up on the first
        if (how && th.rn && th.combo && !finished) {
          const cands = runners.slice(1).filter(x => !x.done && x !== th.rn);
          const mate = cands.find(x => x.key === PAIR[th.rn.key]);
          const near = cands.filter(x => Math.abs(x.pos - runners[0].pos) < 160);
          const o = mate || (near.length ? SBR.util.pick(near) : cands.length ? SBR.util.pick(cands) : null);
          if (o) pending = { rn: o, t: 0.35, chain: th.chain + 1 };
        }
      }
      function obstacle(kind, line, dur) {
        threat = { rn: null, kind, t: dur, dur, line };
        warnEl.querySelector('b').textContent = '⚠ ' + line;
        warnEl.querySelector('span').textContent = kind === 'gust' ? 'Hit GOLD to duck the wind!' : 'Hit GOLD to jump it!';
        warnEl.classList.add('show');
        SBR.audio.play('whistle');
      }
      function landThreat() {
        const B = threat.B || at(runners[0]);
        if (S.shield > 0) { feedback('MISSED!', 'gold'); say('It slides right off you.'); if (threat.P) spot('sk-burst sk-b-shield', '', B, 0.5, '#fff3a0'); clearThreat('shield'); return; }
        const T = TRICKS[threat.kind] || TRICKS.shot;
        T.fx(S); S.stumble *= slick; S.stamina = Math.max(0, S.stamina);
        if (S.blind > 0) { ringEl.classList.add('blinded'); ringEl.classList.toggle('sk-ash', !!(threat.spec && threat.spec.proj === 'ash')); }
        say((threat.spec && threat.spec.hit) || T.hit); feedback('HIT!', 'bad'); SBR.audio.play(threat.kind === 'shot' ? 'gun' : 'hit');
        if (threat.P) {
          burst(B, threat.P.burst, threat.color); kana(B, threat.P.hitK, threat.color);
          const me = runners[0];
          if (threat.spec.proj === 'nail') child(me, 'sk-holes', '<i></i><i></i><i></i>', 2.2);
          if (threat.spec.proj === 'rope' || threat.spec.proj === 'bolas') child(me, 'sk-tied', '', S.slow || 1.5);
        }
        wrap.classList.remove('struck'); void wrap.offsetWidth; wrap.classList.add('struck');
        clearThreat('land');
      }
      /** called at the top of every frame: reads layout first, then moves the projectiles */
      function updateFx(dt) {
        const live = threat && threat.projs;
        if (!live && !loose.length) return;
        const frozen = S.frozen > 0;
        if (live) {
          const th = threat, P = th.P;
          if (frozen) {
            // time is stopped: everything in flight hangs in the air and slides with the world
            th.projs.forEach(q => { if (q.node) { q.rx += camShift; place(q.node, q.rx, q.ry, P.noRot ? 0 : q.ang, q.flip); q.resync = true; } });
            if (th.teth) th.teth.style.opacity = 0;
          } else {
            const wr = wrapBox(), A = th.A = at(th.rn, wr), B = th.B = at(runners[0], wr);
            const p = 1 - th.t / th.dur;
            let head = null;
            th.projs.forEach(q => {
              if (p < q.l0) return;
              if (!q.node) {
                q.node = el('div', { class: 'sk-proj sk-p-' + th.spec.proj + (P.spin ? ' sk-spinning' : ''), html: `<div class="sk-body">${P.html}</div>` });
                q.node.style.setProperty('--skc', th.color);
                fxL.appendChild(q.node);
                if (P.flash) { spot('sk-burst sk-b-flash', '', A, 0.3, '#fff3a0'); kana(A, 'バン', '#fff3a0'); SBR.audio.play('gun'); }
              }
              const e = Math.min(1, (p - q.l0) / Math.max(0.01, q.l1 - q.l0));
              const x = A.x + (B.x - A.x) * e, y = A.y + (B.y - A.y) * e - Math.sin(Math.PI * e) * q.arc;
              if (q.resync) { q.ox = q.rx - x; q.oy = q.ry - y; q.resync = false; }
              const k = Math.exp(-dt * 10); q.ox = (q.ox || 0) * k; q.oy = (q.oy || 0) * k;
              const nx = x + q.ox, ny = y + q.oy;
              if (!P.noRot && (q.rx == null || Math.hypot(nx - q.rx, ny - q.ry) > 0.5)) q.ang = Math.atan2(ny - (q.ry == null ? A.y : q.ry), nx - (q.rx == null ? A.x : q.rx)) * 180 / Math.PI;
              q.rx = nx; q.ry = ny;
              q.flip = !!P.flip && B.x < A.x; place(q.node, nx, ny, P.noRot ? 0 : q.ang, q.flip);
              if (!head) head = q;
            });
            if (th.teth) {
              // a red aim line before the shot; a rope from the thrower to its loop
              const to = P.tether === 'aim' ? (head ? null : B) : head ? { x: head.rx, y: head.ry } : null;
              if (to) { const dx = to.x - A.x, dy = to.y - A.y; th.teth.style.width = Math.hypot(dx, dy).toFixed(1) + 'px'; place(th.teth, A.x, A.y, Math.atan2(dy, dx) * 180 / Math.PI); th.teth.style.opacity = 1; }
              else th.teth.style.opacity = 0;
            }
          }
        }
        loose = loose.filter(q => {
          if (frozen) { q.x += camShift; place(q.node, q.x, q.y, q.noRot ? 0 : q.ang, q.flip); return true; }
          q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 900 * dt;
          if (q.life <= 0) { q.node.remove(); return false; }
          place(q.node, q.x, q.y, q.noRot ? 0 : q.ang, q.flip); return true;
        });
      }
      /* rivals push themselves too */
      function selfBoost(rn) {
        const sk = SKILL[rn.key];
        if (sk && sk.self && Math.random() < selfChance) {
          const s = sk.self, color = colorOf(rn);
          rn.node.style.setProperty('--skc', color);
          s.run(rn, X);
          if (s.line) say(s.line);
          if (s.kana) kana(at(rn), s.kana, color);
          if (s.stand) { cutIn(rn, sk); if (rn.key !== 'pocoloco') figure(rn, sk, 1.4); }
          return;
        }
        rn.surge = 2; rn.bigSurge = 1.5; say(rn.name.toUpperCase() + ' makes a break for it!');
      }
      function hazard() {
        const cands = runners.slice(1).filter(x => !x.done);
        if (!cands.length) return;
        // attackers are the ones close to you, ahead or behind
        const near = cands.filter(x => Math.abs(x.pos - runners[0].pos) < 120);
        if (!threat && !pending && (near.length || Math.random() < 0.7) && Math.random() < (tutorial ? 0.35 : 0.7 + hard * 0.05)) attack(SBR.util.pick(near.length ? near : cands));
        else if (threat && hard >= 4) { const o = SBR.util.pick(cands); o.surge = 2.4; o.bigSurge = 2; say(`${o.name.toUpperCase()} uses the chaos to pull ahead!`); }
        else if (!pending) selfBoost(SBR.util.pick(cands));
      }
      function press() {
        if (!started || finished || cool > 0) return;
        cool = 0.28;
        const d = Math.abs(((angle - zone + 540) % 360) - 180);
        const forced = S.autoGold > 0; if (forced) S.autoGold--;
        if (S.misfire && !forced) { S.misfire = false; combo = 0; S.stumble = 0.8; feedback('MISFIRE', 'bad'); SBR.audio.play('boom'); placeZone(); return; }
        if (forced || d <= goldSize / 2) {
          combo++; boost = Math.min(2.2, 0.9 + combo * 0.18); S.stamina = Math.min(100, S.stamina + 6);
          if (threat) { feedback(threat.rn ? 'DODGED!' : 'CLEARED!', 'gold'); say(threat.rn ? `You slip past ${threat.rn.name}!` : 'Over it!'); if (threat.P && threat.B) kana(threat.B, 'スカッ', '#ffffff'); clearThreat('dodge'); boost += 0.4; }
          else feedback(combo >= 3 ? 'GOLDEN!' : 'PERFECT', 'gold');
          SBR.audio.play('spin');
          if (combo >= 3) wrap.classList.add('golden'); setTimeout(() => wrap.classList.remove('golden'), 300);
        } else if (d <= goldSize * 1.25) {
          combo = 0; boost = 0.55; feedback('GOOD', 'good'); SBR.audio.play('gallop');
        } else {
          combo = 0; S.stumble = 0.7 * slick; S.stamina = Math.max(0, S.stamina - 12); feedback('STUMBLE', 'bad'); SBR.audio.play('miss');
        }
        comboEl.textContent = combo > 1 ? `×${combo}` : '';
        rot = Math.min(440 + hard * 10, rot + 12);
        placeZone();
      }
      // race powers
      const powers = tutorial ? [] : SBR.racePowers(r);
      const pwBar = wrap.querySelector('.sprint-powers');
      const API = {
        S, me: runners[0],
        rivals: () => runners.slice(1).filter(x => !x.done),
        ahead: () => runners.slice(1).filter(x => !x.done && x.pos > runners[0].pos).sort((a, b) => a.pos - b.pos)[0] || runners.slice(1).filter(x => !x.done).sort((a, b) => b.pos - a.pos)[0],
        stunAhead: s => { const t = API.ahead(); if (t) t.stun = s; },
        stamina: n => { S.stamina = Math.min(100, S.stamina + n); },
        freeze: (s, line) => { S.frozen = s; wrap.classList.add('timestop'); say(line || 'TIME HAS STOPPED.'); SBR.audio.play('menace'); },
        flash: c => { wrap.style.setProperty('--flash', c); wrap.classList.remove('pflash'); void wrap.offsetWidth; wrap.classList.add('pflash'); },
      };
      function usePower(i) {
        const p = powers[i]; if (!p || p.used || !started || finished) return;
        p.used = true; p.btn.classList.add('used');
        p.use(API);
        if (p.id !== 'timestop') say(`「${p.name}」!`);
        SBR.audio.play('spin');
        API.flash(p.color);
      }
      powers.forEach((p, i) => {
        p.btn = el('button', { class: 'sp-power', style: { '--pc': p.color }, html: `<kbd>${i + 1}</kbd><b>${p.glyph}</b><span>${p.name}</span>` });
        SBR.tip.bind(p.btn, `<b>${p.name}</b> (${SBR.CHARS[p.who].short})<br>${p.desc}<br><i>Once per race. Key ${i + 1}.</i>`);
        p.btn.addEventListener('mousedown', e => { e.stopPropagation(); usePower(i); });
        pwBar.appendChild(p.btn);
      });
      const onKey = e => { if (e.code === 'Space') { e.preventDefault(); press(); } const d = /^Digit([1-4])$/.exec(e.code); if (d) usePower(+d[1] - 1); };
      document.addEventListener('keydown', onKey);
      wrap.addEventListener('mousedown', press);

      function frame(t) {
        if (!last) last = t;
        const dt = Math.min(0.05, (t - last) / 1000) * SBR.settings.speed;
        last = t;
        const me = runners[0];
        if (started && !finished) updateFx(dt);
        if (started && !finished) {
          elapsed += dt;
          angle = (angle + rot * dt) % 360;
          needle.setAttribute('transform', `rotate(${angle} 100 100)`);
          cool = Math.max(0, cool - dt);
          boost = Math.max(0, boost - dt * 0.9);
          S.stumble = Math.max(0, S.stumble - dt);
          S.shield = Math.max(0, S.shield - dt); S.boostT = Math.max(0, S.boostT - dt);
          if (S.frozen > 0) { S.frozen -= dt; if (S.frozen <= 0) { wrap.classList.remove('timestop'); say('...and time moves again.'); } }
          wrap.classList.toggle('shielded', S.shield > 0);
          if (S.frozen <= 0) {
            for (let i = timers.length - 1; i >= 0; i--) if ((timers[i].t -= dt) <= 0) { const f = timers[i].fn; timers.splice(i, 1); f(); }
            if (pending && !threat && (pending.t -= dt) <= 0) { const pc = pending; pending = null; if (!pc.rn.done && me.pos < LEN - 40) attack(pc.rn, pc.chain); }
          }
          ringEl.classList.toggle('sk-sound', !!S.misfire);
          if (WX) {
            if (WX.gusts && !threat && !pending && (gustT -= dt) <= 0) { gustT = Math.max(3, 8 - hard * 0.6) + Math.random() * 3; obstacle('gust', WX.name === 'BLIZZARD' ? 'A WALL OF SNOW' : 'A HEADWIND', Math.max(0.9, 1.5 - hard * 0.07)); }
            if (WX.lightning && (boltT -= dt) <= 0) { boltT = Math.max(2.5, 7 - hard * 0.6) + Math.random() * 3; wrap.classList.remove('bolt'); void wrap.offsetWidth; wrap.classList.add('bolt'); S.blind = Math.max(S.blind, 0.3 + wPow * 0.35); ringEl.classList.add('blinded'); SBR.audio.play('boom'); }
            if (WX.fogRing && (fogT -= dt) <= 0) { fogT = Math.max(3, 8 - hard * 0.5) + Math.random() * 2; S.blind = Math.max(S.blind, 0.6 + wPow * 0.5); ringEl.classList.add('blinded'); }
            if (WX.hideGold) { const on = (elapsed % 2.6) < 2.6 - wPow * 1.1; goldEl.style.opacity = on ? 1 : 0.05; goodEl.style.opacity = on ? 1 : 0.1; }
            if (WX.obstacles && !threat && !pending && me.pos < LEN - 80 && (obstT -= dt) <= 0) { obstT = Math.max(3.2, 9 - hard * 0.7) + Math.random() * 3; obstacle('obstacle', OBST[WX.obstacles], Math.max(0.85, 1.5 - hard * 0.08)); }
          }
          S.slow = Math.max(0, S.slow - dt);
          if (S.blind > 0) { S.blind -= dt; if (S.blind <= 0) ringEl.classList.remove('blinded', 'sk-ash'); }
          S.stamina = Math.max(0, S.stamina - dt * (3.2 + hard * 0.25) * (WX && WX.drain ? 1 + (WX.drain - 1) * wPow : 1));
          stamFill.style.width = S.stamina + '%';
          wrap.classList.toggle('roped', S.slow > 0);
          me.speed = me.base * (0.72 + S.stamina / 100 * 0.35) * (1 + boost * 0.45) * (S.stumble > 0 ? 0.55 : 1) * (S.slow > 0 ? 0.62 : 1) * (S.boostT > 0 ? 1.5 : 1);
          runners.slice(1).forEach(rn => {
            rn.surge = Math.max(0, rn.surge - dt);
            if (Math.random() < dt * 0.7) rn.surge = 0.7 + Math.random() * 1;
            const fatigue = 1 - Math.min(0.06, elapsed * 0.002);
            const rubber = rn.pos < me.pos - 60 ? 1.15 : 1;
            rn.speed = rn.base * fatigue * rubber * (1 + (rn.surge > 0 ? (rn.bigSurge > 0 ? 0.6 : 0.32) : 0)) * (0.96 + Math.random() * 0.08);
            rn.bigSurge = Math.max(0, (rn.bigSurge || 0) - dt);
            if (rn.stun > 0) { rn.stun -= dt; rn.speed *= 0.2; }
            if (rn.immune > 0) { rn.stun = 0; if (S.frozen <= 0) rn.immune -= dt; }
            if (S.frozen > 0) rn.speed = 0;
            else if (rn.skinT > 0 && (rn.skinT -= dt) <= 0) endSkin(rn);
            rn.node.classList.toggle('stalled', rn.stun > 0);
          });
          if (threat && S.frozen <= 0) { threat.t -= dt; warnEl.querySelector('i').style.width = Math.max(0, threat.t / threat.dur * 100) + '%'; if (threat.t <= 0) landThreat(); }
          hazardT -= dt;
          if (S.frozen <= 0 && hazardT <= 0 && me.pos < LEN - 60) { hazardT = threat || pending ? 0.8 : Math.max(1.8, 4.2 - hard * 0.35) + Math.random() * 1.6; if (!threat) hazard(); }
          runners.forEach(rn => {
            if (rn.done) return;
            rn.pos += rn.speed * dt;
            if (rn.pos >= LEN) { rn.done = true; finishOrder.push(rn); if (rn.player) SBR.audio.play('whistle'); }
          });
          if (me.done && finishOrder.length >= 1) {
            clearThreat(); pending = null;
            loose.forEach(q => q.node.remove()); loose = []; fxL.innerHTML = '';
            runners.forEach(endSkin);
            // let the rest resolve instantly by projected time
            const remaining = runners.filter(x => !x.done).sort((a, b) => (LEN - a.pos) / a.speed - (LEN - b.pos) / b.speed);
            remaining.forEach(x => { x.done = true; finishOrder.push(x); });
            end();
          }
        }
        // camera: one long course, never wrapped, clamped at both ends
        const W = track.clientWidth || W0, scale = W / 360;
        const camPos = Math.max(-PRE + 20, Math.min(LEN + 60, me.pos));
        camShift = prevCam == null ? 0 : (prevCam - camPos) * scale; prevCam = camPos;
        runners.forEach(rn => {
          const x = W * 0.38 + (rn.pos - camPos) * scale;
          rn.node.style.transform = `translateX(${x}px) scale(var(--sc))`;
          rn.node.classList.toggle('boosting', rn.player ? boost > 0.8 : rn.surge > 0);
          rn.dot.style.left = Math.max(0, Math.min(100, rn.pos / LEN * 100)) + '%';
        });
        finishLine.style.transform = `translateX(${W * 0.38 + (LEN - camPos) * scale + 80}px)`;
        layers.forEach(l => { l.node.style.transform = `translate3d(${-((camPos + PRE) * scale0 * l.rate)}px,0,0)`; });
        if (!finished) requestAnimationFrame(frame);
      }

      async function countdown() {
        const cd = wrap.querySelector('.sprint-count');
        // real seconds, independent of game speed: 3, 2, 1, GO!
        for (const n of ['3', '2', '1', 'GO!']) {
          cd.textContent = n; cd.classList.remove('pop'); void cd.offsetWidth; cd.classList.add('pop');
          SBR.audio.play(n === 'GO!' ? 'whistle' : 'click');
          await new Promise(res => setTimeout(res, n === 'GO!' ? 450 : 1000));
        }
        cd.textContent = '';
        started = true;
      }

      async function end() {
        finished = true;
        if (SBR.sprint.live && SBR.sprint.live.wrap === wrap) SBR.sprint.live = null;
        document.removeEventListener('keydown', onKey);
        const place = finishOrder.findIndex(x => x.player) + 1;
        await sleep(400);
        const res = el('div', { class: 'sprint-results' });
        res.innerHTML = `<div class="sr-title">${place === 1 ? 'STAGE WINNER!' : SBR.util.ordinal(place) + ' PLACE'}</div>
          <div class="podium">${finishOrder.map((x, i) => `<div class="pod-row ${x.player ? 'me' : ''}" style="animation-delay:${i * 0.12}s"><span class="pod-pos">${i + 1}</span><span class="pod-port">${x.player ? art.portrait(L.portrait) : art.portrait(SBR.RIVALS[x.key].portrait)}</span><span class="pod-name">${x.player ? L.name : SBR.RIVALS[x.key].name}</span><span class="pod-pts">+${SBR.POINTS[i] || 3}</span></div>`).join('')}</div>`;
        const go = SBR.ui.btn('Continue ▸', () => { wrap.classList.remove('show'); setTimeout(() => wrap.remove(), 300); resolve({ place, order: finishOrder.map(x => x.key) }); }, 'btn-primary');
        res.appendChild(go);
        wrap.appendChild(res);
        SBR.audio.play(place <= 3 ? 'level' : 'coin');
      }

      // debug handle for the live race (used by tests and SBR.debug): force a rival skill
      SBR.sprint.live = { wrap, S, runners, hard, attack: (rn, combo) => { clearThreat(); pending = null; attack(rn); if (threat) threat.combo = !!combo; }, self: rn => selfBoost(rn) };
      requestAnimationFrame(frame);
      (async () => {
        // the race starts straight away; first-timers get a hint banner instead of a blocking dialogue
        if (tutorial || !SBR.meta.sprintHintSeen3) {
          const tip = el('div', { class: 'sprint-tip', html: '<b>HOW TO RACE</b> Press <b>SPACE</b> or click when the needle crosses the <span class="gold">GOLD</span> zone to surge. Miss and your horse stumbles. When a rival attacks or the road is blocked (<b>⚠</b>), hit GOLD before the bar runs out to dodge. Keys <b>1-4</b> use your party&#39;s Stand powers, once each. Your act PACE is your head start.' });
          wrap.appendChild(tip);
          setTimeout(() => tip.classList.add('out'), 7000);
          setTimeout(() => tip.remove(), 7600);
          SBR.meta.sprintHintSeen3 = true; SBR.saveMeta();
        }
        await countdown();
      })();
    });
  }
  return { run };
})();
