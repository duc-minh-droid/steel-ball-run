/* Stage-finish sprint minigame: time presses to the Golden Rectangle ring.
   The course is one long drawn map from the start line to the goal (no looping backgrounds), and rivals play dirty:
   they shoot, lasso, throw dust and use their Stands on you. A telegraphed attack is dodged by hitting GOLD in time. */
'use strict';
SBR.sprint = (() => {
  const { el, sleep } = SBR.util;
  const art = SBR.art;
  const K = '#1a1020';

  /* ---------- the course: long parallax layers that end at the goal ---------- */
  // drawn with the scenery props (js/scenery.js): Araki skies, ink outlines, screentone, and landmarks per act
  const PAL = {
    1: { sky: ['#3a2a9a', '#2fb8b0', '#ffe08a'], sun: '#fff2a8', cloud: '#ffd0e6', cloudSh: '#a878e0', far: '#b86ab8', farSh: '#7a3a8a', mid: '#e8843a', midSh: '#8a1a4a', ground: '#f0c070', dirt: '#c8904a', fence: '#8a6a4a', deco: 'desert' },
    2: { sky: ['#1e0a52', '#8a3ac8', '#ff9ac8'], sun: '#ffe8f8', cloud: '#fff0fa', cloudSh: '#c078e0', far: '#5a4ab8', farSh: '#2a1a6a', mid: '#5a9a4a', midSh: '#1f5a3a', ground: '#c0c860', dirt: '#8a8a4a', fence: '#7a5a3a', deco: 'rockies', snowcap: true },
    3: { sky: ['#0f4a5a', '#3ab8a0', '#f8f0a0'], sun: '#fffbd0', cloud: '#e8fff0', cloudSh: '#6a8ab8', far: '#3a8a8a', farSh: '#1a5a5a', mid: '#8ac840', midSh: '#4a7a2a', ground: '#d8c860', dirt: '#a8904a', fence: '#f6ecd8', deco: 'plains' },
    4: { sky: ['#1a2a7a', '#6ab0f0', '#ffd0e8'], sun: '#ffffff', cloud: '#ffffff', cloudSh: '#b0a0e8', far: '#8aa8e0', farSh: '#4a5aa8', mid: '#e4eeff', midSh: '#8aa8d8', ground: '#eef4fa', dirt: '#b8c8e0', fence: '#8a5a3a', deco: 'north', snowcap: true },
    5: { sky: ['#2a0a3a', '#d8305a', '#ffb040'], sun: '#fff0a0', cloud: '#ffb870', cloudSh: '#8a2a5a', far: '#6a2a5a', farSh: '#3a1030', mid: '#9aa860', midSh: '#5a6a3a', ground: '#b0a878', dirt: '#7a7050', fence: '#6a4a3a', deco: 'east' },
    6: { sky: ['#1a0a4a', '#8a2a8a', '#ff9a70'], sun: '#fff4c0', cloud: '#c89ae8', cloudSh: '#5a2a8a', far: '#3a2a6a', farSh: '#1e1446', mid: '#4a3a6a', midSh: '#2a1e4a', ground: '#a098b0', dirt: '#6a6078', fence: '#2a2a3a', deco: 'city' },
  };
  function seeded(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  const SC = () => SBR.scenery;
  const mesa = (w, h, c, sh) => `<path d="M${-w / 2} 0L${-w / 2 + 10} ${-h + 12}L${-w / 2 + 16} ${-h}H${w / 2 - 16}L${w / 2 - 8} ${-h + 14}L${w / 2} 0Z" fill="${c}" stroke="${K}" stroke-width="3"/><path d="M${w * .1} ${-h}H${w / 2 - 16}L${w / 2 - 8} ${-h + 14}L${w / 2} 0H${w * .05}Z" fill="${sh}" opacity=".6"/><path d="M${w * .1} ${-h}H${w / 2 - 16}L${w / 2 - 8} ${-h + 14}L${w / 2} 0H${w * .05}Z" fill="url(#@h)" opacity=".35"/><path d="M${-w / 2 + 16} ${-h + 1}H${w * .1}" stroke="#fff" stroke-width="2.4" opacity=".5"/>`;
  /** mid-layer landmarks per region: (P, x, base, s, rnd, pal) -> svg */
  const DECO = {
    desert: [(P, x, b, s) => SC().T(x, b, s, P.saguaro(150)), (P, x, b, s, r, c) => SC().T(x, b, s, mesa(160 + r() * 80, 90 + r() * 60, c.mid, c.midSh)), (P, x, b, s) => SC().T(x, b, s * .8, P.waterTower('#a86a3a')), (P, x, b, s) => SC().T(x, b, s * .8, P.windmill(140)), (P, x, b, s) => SC().T(x, b, s, P.wagon()), (P, x, b, s, r, c) => SC().T(x, b, s, mesa(120, 150, c.mid, c.midSh))],
    rockies: [(P, x, b, s) => SC().T(x, b, s, P.pine(150, '#1f6a5a') + SC().T(34, 4, .7, P.pine(150, '#1a5a4a')) + SC().T(-30, 2, .6, P.pine(150, '#246a55'))), (P, x, b, s, r, c) => SC().T(x, b, s, mesa(150, 130, '#c84a3a', '#6a1a3a')), (P, x, b, s) => SC().T(x, b, s, P.mineMouth()), (P, x, b, s) => SC().T(x, b, s * .8, P.cabin()), (P, x, b, s) => SC().T(x, b, s, P.pine(180, '#1a5a4a'))],
    plains: [(P, x, b, s) => SC().T(x, b, s, P.barn()), (P, x, b, s) => SC().T(x, b, s, P.farmhouse()), (P, x, b, s) => SC().T(x, b, s, P.silo() + SC().T(34, 0, 1, P.silo())), (P, x, b, s) => SC().T(x, b, s, P.windmill(150)), (P, x, b, s) => SC().T(x, b, s, P.tree(80) + SC().T(40, 2, .8, P.tree(80, '#6aaa3a'))), (P, x, b, s) => SC().T(x, b, s, P.waterTower('#9a6a3a'))],
    north: [(P, x, b, s) => SC().T(x, b, s, P.pine(160, '#1f5a6a', true) + SC().T(36, 4, .7, P.pine(160, '#2a6a6a', true))), (P, x, b, s) => SC().T(x, b, s, P.cabin()), (P, x, b, s) => SC().T(x, b, s * 1.2, P.hut(['#e8508a', '#3b5bb5', '#f2c14e', '#c8323c'][Math.floor(x) % 4])), (P, x, b, s) => SC().T(x, b, s, P.wolf() + SC().T(40, 2, .9, P.wolf(), true)), (P, x, b, s) => SC().T(x, b, s, P.pine(190, '#1f4a4a', true))],
    east: [(P, x, b, s, r) => SC().T(x, b, s, P.rowhouse('#9a3a2a', 90, 130, r) + SC().T(94, 0, 1, P.rowhouse('#a8462e', 84, 110, r))), (P, x, b, s) => SC().T(x, b, s, P.barn()), (P, x, b, s) => SC().T(x, b, s, P.tree(90)), (P, x, b, s) => SC().T(x, b, s * .9, P.lighthouse()), (P, x, b, s) => SC().T(x, b, s, P.farmhouse()), (P, x, b, s) => SC().T(x, b, s * .6, P.indHall())],
    city: [(P, x, b, s, r, c) => SC().T(x, b, 1, P.skyline(r, -160, 160, 0, c.mid, 'ny', true, 50 * s * 2, 80 * s * 2)), (P, x, b, s) => SC().T(x, b, s, P.lamp()), (P, x, b, s, r, c) => SC().T(x, b, 1, P.skyline(r, -120, 120, 0, c.midSh, 'ny', true, 40 * s * 2, 60 * s * 2) + SC().T(0, 0, s, P.lamp())), (P, x, b, s) => SC().T(x, b, s * .9, P.waterTower('#5a3a2a'))],
  };
  /** far-layer landmark every so often */
  const FAR_MARK = {
    desert: (P, c) => `<path d="M-90 0L-80 -120Q0 -190 80 -120L90 0H60L56 -96Q0 -146 -54 -96L-60 0Z" fill="${c.farSh}" stroke="${K}" stroke-width="2.4"/>`,
    rockies: (P, c) => P.peak(260, 190, c.far, c.farSh),
    plains: (P, c) => `<path d="M-8 0V-90L0 -120L8 -90V0Z" fill="${c.farSh}" stroke="${K}" stroke-width="2"/><path d="M0 -120V-132M-5 -127H5" stroke="${K}" stroke-width="2"/>` + SC().T(40, 0, .5, P.silo()) + SC().T(58, 0, .5, P.silo()),
    north: (P, c) => P.skyline(seeded(7), -120, 120, 0, c.farSh, 'chicago', true, 20, 60),
    east: (P, c) => SC().T(0, 0, .5, P.indHall()),
    city: (P, c) => SC().T(0, 0, .45, P.liberty('#4ab89a')),
  };
  /** trackside props: a fence pattern, telegraph poles, SBR flags and region props */
  const SIDE = {
    desert: P => [P.skull(), P.wheel(), P.tumble(), P.saguaro(90), P.pear(), P.mineCart()],
    rockies: P => [P.rock(20, '#9a8a8a'), P.pine(110, '#1f6a5a'), P.skull(), P.wheel(), P.cow('#6a3a2a')],
    plains: P => [P.hay(), P.wheat(90, 30), P.cow('#f6ecd8', '#1a1020'), P.cow('#8a4a2a'), P.hay()],
    north: P => [P.pine(110, '#1f4a4a', true), P.rock(16, '#c8d8f0'), P.hut('#c8323c'), P.lantern()],
    east: P => [P.crates(), P.barrel(), P.hay(), P.tree(70)],
    city: P => [P.lamp(), P.crates(), P.barrel(), P.lamp()],
  };
  /** build the course; returns layers [{node, rate}] and the goal's x in near-layer coordinates */
  function buildCourse(host, act, W, H, LEN, PRE, scale) {
    const P = PAL[act] || PAL[1];
    const L = SC().P, T = SC().T, circ = SC().circ;
    const rnd = seeded(act * 977 + 13);
    const uid = 'sc' + Math.floor(Math.random() * 1e9).toString(36);
    const defs = SC().DEFS.replace(/@/g, uid);
    const u = s => s.replace(/@/g, uid);
    const k = Math.max(.6, H / 720);
    // sky: gradient, bands, screentone and a rayed sun (static)
    const sx = W * .78, sy = H * .13;
    let rays = ''; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, a2 = a + .08; rays += `M${sx} ${sy}L${Math.round(sx + Math.cos(a) * 2400)} ${Math.round(sy + Math.sin(a) * 2400)}L${Math.round(sx + Math.cos(a2) * 2400)} ${Math.round(sy + Math.sin(a2) * 2400)}Z`; }
    const sun = P.deco === 'city' ? `<circle cx="${sx}" cy="${sy}" r="${70 * k}" fill="${P.sun}" opacity=".2"/><path d="M${sx} ${sy - 38 * k}A${38 * k} ${38 * k} 0 1 0 ${sx} ${sy + 38 * k}A${28 * k} ${38 * k} 0 1 1 ${sx} ${sy - 38 * k}Z" fill="${P.sun}" stroke="${K}" stroke-width="3.4"/>`
      : `<g class="sun-rays" style="transform-origin:${sx}px ${sy}px"><path d="${rays}" fill="${P.sun}" opacity=".2"/></g><circle cx="${sx}" cy="${sy}" r="${110 * k}" fill="${P.sun}" opacity=".16"/><circle cx="${sx}" cy="${sy}" r="${66 * k}" fill="none" stroke="${P.sun}" stroke-width="3" opacity=".6" stroke-dasharray="4 12"/><circle cx="${sx}" cy="${sy}" r="${42 * k}" fill="${P.sun}" stroke="${K}" stroke-width="3.6"/><circle cx="${sx}" cy="${sy}" r="${33 * k}" fill="none" stroke="${K}" stroke-width="1.2" opacity=".4"/>`;
    host.innerHTML = `<div class="sw-sky scn-sky" style="background:linear-gradient(${P.sky[0]}, ${P.sky[1]} 60%, ${P.sky[2]})"><svg class="sw-skyart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${defs}<rect y="${H * .1}" width="${W}" height="${H * .04}" fill="#fff" opacity=".1"/><rect y="${H * .2}" width="${W}" height="${H * .02}" fill="#fff" opacity=".12"/>${sun}<rect width="${W}" height="${H * .5}" fill="url(#${uid}d)" opacity=".12"/></svg></div>`;
    const worldW = rate => Math.ceil(W * 1.6 + (LEN + PRE + 400) * scale * rate);
    const mk = (rate, inner, w, cls) => { const d = el('div', { class: 'sw-layer ' + cls, html: `<svg width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" xmlns="http://www.w3.org/2000/svg">${defs}<g stroke-linejoin="round" stroke-linecap="round">${u(inner)}</g></svg>` }); host.appendChild(d); return { node: d, rate }; };
    const layers = [];
    // far: Araki clouds, mountains / skyline, and a landmark now and then
    { const w = worldW(0.12), base = H * 0.36; let d = `M0 ${H}L0 ${base}`, shd = '', snow = ''; let x = 0;
      const city = P.deco === 'city' || P.deco === 'east';
      while (x < w) { const pw = 80 + rnd() * 140, ph = 30 + rnd() * (city ? 50 : 90); if (city) { d += `L${x} ${base - ph}` + (rnd() < .3 ? `L${x + pw * .3 - 7} ${base - ph}L${x + pw * .3} ${base - ph - 44}L${x + pw * .3 + 7} ${base - ph}` : '') + `L${x + pw * 0.6} ${base - ph}L${x + pw * 0.6} ${base - ph * 0.6}`; } else { const px = x + pw / 2, py = base - ph; d += `L${px} ${py}L${x + pw} ${base}`; shd += `M${px} ${py}L${x + pw} ${base}L${px + pw * .08} ${base}L${px - pw * .04} ${py + ph * .5}Z`; if (P.snowcap) snow += `M${px - 12} ${py + 16}L${px} ${py}L${px + 12} ${py + 16}l-6-3-6 5-6-5z`; } x += pw * (city ? 0.6 : 0.8); }
      d += `L${w} ${base}L${w} ${H}z`;
      let clouds = ''; for (let i = 0; i < Math.ceil(w / 300); i++) clouds += L.cloud(i * 300 + rnd() * 120, H * (0.05 + rnd() * 0.16), (.28 + rnd() * .22) * k, P.cloud, P.cloudSh);
      let marks = ''; for (let mx = 500 + rnd() * 300; mx < w - 200; mx += 800 + rnd() * 500) marks += T(mx, base + 2, .5 * k, FAR_MARK[P.deco](L, P));
      layers.push(mk(0.12, clouds + `<path d="${d}" fill="${P.far}" stroke="${K}" stroke-width="2.4"/><path d="${shd}" fill="${P.farSh}" opacity=".7"/><path d="${shd}" fill="url(#@h)" opacity=".3"/>` + (snow ? `<path d="${snow}" fill="#fff" stroke="${K}" stroke-width="1.4"/>` : '') + `<path d="M0 ${base - 20}H${w}V${base + 40}H0Z" fill="url(#@d)" opacity=".14"/>` + marks, w, 'far')); }
    // mid: hills and landmarks
    { const w = worldW(0.4), base = H * 0.43; let d = `M0 ${H}L0 ${base}`; for (let x = 0; x <= w; x += 60) d += `Q${x + 30} ${base - 10 - rnd() * 34} ${x + 60} ${base - rnd() * 8}`; d += `L${w} ${H}z`;
      const list = DECO[P.deco] || DECO.desert;
      let deco = ''; for (let x = 60 + rnd() * 100; x < w - 60; x += 240 + rnd() * 260) deco += list[Math.floor(rnd() * list.length)](L, x, base + 6, (0.55 + rnd() * 0.25) * k, rnd, P);
      layers.push(mk(0.4, `<path d="${d}" fill="${P.mid}" stroke="${K}" stroke-width="2.4"/><path d="M0 ${base + 6}H${w}V${base + 30}H0Z" fill="url(#@d)" opacity=".16"/>${deco}`, w, 'mid')); }
    // near: the track itself, trackside dressing, checkpoints, distance posts, and the goal
    { const w = worldW(1), top = H * 0.47;
      const X = p => W * 0.38 + (p + PRE) * scale;
      const fenceP = P.deco === 'city' ? `<path d="M0 6H40M0 22H40" stroke="${K}" stroke-width="3"/><path d="M4 0V28M14 4V28M24 0V28M34 4V28" stroke="${K}" stroke-width="2.4"/>` : `<path d="M0 8H60M0 20H60" stroke="${K}" stroke-width="5"/><path d="M0 8H60M0 20H60" stroke="${P.fence}" stroke-width="2.6"/><path d="M8 0V30" stroke="${K}" stroke-width="7"/><path d="M8 0V30" stroke="${P.fence}" stroke-width="4"/>`;
      const fw = P.deco === 'city' ? 40 : 60;
      let s = `<defs><pattern id="${uid}fence" width="${fw}" height="30" patternUnits="userSpaceOnUse" y="${top - 30 * k}">${fenceP}</pattern>` +
        `<g id="${uid}pole">${L.pole(110)}</g><g id="${uid}fR">${L.flag('#c8323c', 80)}</g><g id="${uid}fB">${L.flag('#3b5bb5', 80)}</g><g id="${uid}fY">${L.flag('#f2c14e', 80)}</g>` +
        SIDE[P.deco](L).map((p, i) => `<g id="${uid}p${i}">${p}</g>`).join('') + `</defs>`;
      s += `<rect x="0" y="${top}" width="${w}" height="${H - top}" fill="${P.ground}"/><path d="M0 ${top}H${w}V${top + 40}H0Z" fill="url(#@d)" opacity=".16"/><path d="M0 ${H - 60}H${w}V${H}H0Z" fill="url(#@d)" opacity=".2"/>`;
      s += [...Array(6)].map((_, i) => `<path d="M0 ${top + 24 + i * 34}H${w}" stroke="${P.dirt}" stroke-width="${3 + i}" stroke-dasharray="${30 + i * 10} ${40 + i * 12}" opacity=".6"/>`).join('');
      let peb = '', hoof = ''; for (let i = 0; i < w / 90; i++) { const x = i * 90 + rnd() * 60, y = top + 10 + rnd() * (H - top - 20), r = 4 + rnd() * 6; peb += `M${Math.round(x - r)} ${Math.round(y)}q${r} ${-r} ${2 * r} 0z`; if (i % 2) hoof += `M${Math.round(x + 30)} ${Math.round(y + 12)}a6 5 0 1 1 10 0l-2 -1a3 3 0 0 0 -6 0z`; }
      s += `<path d="${peb}" fill="${P.dirt}" stroke="${K}" stroke-width="1.2" opacity=".8"/><path d="${hoof}" fill="${K}" opacity=".16"/>`;
      // trackside: fence, telegraph line, flags and props, all standing on the track's far edge
      const edge = top + 2;
      s += `<rect x="0" y="${top - 30 * k}" width="${w}" height="${30 * k}" fill="url(#${uid}fence)"/>`;
      let wire = ''; const px = []; for (let x = 120; x < w; x += 560) px.push(x);
      px.forEach(x => { s += `<use href="#${uid}pole" transform="translate(${x} ${edge - 26 * k}) scale(${k})"/>`; });
      for (let i = 0; i < px.length - 1; i++) [[-19, -104], [19, -104], [-13, -92]].forEach(([dx, dy]) => { const y = edge - 26 * k + dy * k; wire += `M${px[i] + dx * k} ${y}Q${(px[i] + px[i + 1]) / 2 + dx * k} ${y + 26} ${px[i + 1] + dx * k} ${y}`; });
      s += `<path d="${wire}" stroke="${K}" stroke-width="1.2" fill="none"/>`;
      const nProps = SIDE[P.deco](L).length;
      for (let x = 60 + rnd() * 80; x < w; x += 150 + rnd() * 170) { const r0 = rnd(); if (r0 < .35) s += `<use href="#${uid}${['fR', 'fB', 'fY'][Math.floor(rnd() * 3)]}" transform="translate(${Math.round(x)} ${edge}) scale(${(.7 * k).toFixed(2)})"/>`; else s += `<use href="#${uid}p${Math.floor(rnd() * nProps)}" transform="translate(${Math.round(x)} ${edge + 4 + rnd() * 10}) scale(${((.55 + rnd() * .25) * k).toFixed(2)})"/>`; }
      // checkpoints: SBR banners and a few spectators at each quarter
      const crowdAt = (cx0, n) => [...Array(n)].map((_, i) => { const cx = cx0 + i * 14 + rnd() * 6, cy = top - 6 - rnd() * 8; const c = ['#c8323c', '#3b5bb5', '#f2c14e', '#3a8c4a', '#e8508a', '#f6ecd8'][i % 6]; return `<path d="M${cx - 6} ${cy + 6}q6-18 12 0z" fill="${c}" stroke="${K}" stroke-width="1.4"/><circle cx="${cx}" cy="${cy - 12}" r="4.4" fill="#f0c8a0" stroke="${K}" stroke-width="1.4"/>`; }).join('');
      [[0, 'STEEL BALL RUN', '#c8323c'], [0.25, 'CHECKPOINT 1', '#3b5bb5'], [0.5, 'CHECKPOINT 2', '#c8323c'], [0.75, 'CHECKPOINT 3', '#3b5bb5']].forEach(([t, txt, col]) => { const bx = X(LEN * t) + (t ? 0 : 40); s += crowdAt(bx - 150, 8) + crowdAt(bx + 70, 7) + T(bx, edge, 1.25 * k, L.banner(220, txt, col, 140)) + L.bunting(bx - 290 * k, bx - 138 * k, edge - 150 * k, 18) + L.bunting(bx + 138 * k, bx + 290 * k, edge - 150 * k, 18); });
      for (let p = 0; p <= LEN; p += 100) { const x = X(p); const left = LEN - p; s += `<g transform="translate(${x} ${top})"><path d="M0 0v-40" stroke="#6a4a2a" stroke-width="5"/><rect x="-22" y="-58" width="44" height="18" fill="#f6ecd8" stroke="${K}" stroke-width="2"/><text x="0" y="-45" font-size="11" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${K}">${left ? left * 15 + 'm' : 'GOAL'}</text></g>`; }
      // start line
      s += `<rect x="${X(0) - 6}" y="${top}" width="10" height="${H - top}" fill="#fff" opacity=".8"/>`;
      // goal: checkered arch, banner and a crowd
      const gx = X(LEN) + 80;
      s += crowdAt(gx - 160, 26) + `<g transform="translate(${gx} ${top})"><path d="M-70 0v-150M70 0v-150" stroke="${K}" stroke-width="10"/><path d="M-70 0v-150M70 0v-150" stroke="#f6ecd8" stroke-width="6" stroke-dasharray="12 12"/><rect x="-90" y="-176" width="180" height="36" fill="#c8323c" stroke="${K}" stroke-width="3"/><text x="0" y="-150" font-size="26" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="#f2c14e" stroke="${K}" stroke-width="1.4" paint-order="stroke">GOAL</text>${[...Array(8)].map((_, i) => `<path d="M${-90 + i * 24} -140l12 14 12-14" fill="${i % 2 ? '#fff' : '#3b5bb5'}" stroke="${K}" stroke-width="1.4"/>`).join('')}</g>` + L.bunting(gx + 70, gx + 260, top - 150, 20) + L.bunting(gx - 260, gx - 70, top - 150, 20);
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

  // Stands are held back in a horse race unless they actually help someone ride: Scary Monsters' raptor legs,
  // Hey Ya's luck, Tim's rope, the Spin in a horse's gait and Cream Starter patching a horse. The rest ride like anyone.
  ['sandman', 'hotpants', 'gyro', 'johnny', 'wekapipo'].forEach(k => { if (SKILL[k]) delete SKILL[k].atk; });
  ['johnny', 'magent'].forEach(k => { if (SKILL[k]) delete SKILL[k].self; });
  SKILL.mountaintim.atk = { kind: 'lasso', proj: 'rope', line: 'MOUNTAIN TIM throws a lasso at your horse!', kana: 'ヒュンヒュン' };
  SKILL.wekapipo.plain = 'shove'; SKILL.sandman.plain = 'shove';

  /* ---------- the pack: 3,852 riders started. Most of them are nobodies, and the trail kills them ---------- */
  const FIRST = ['Hank', 'Jeb', 'Silas', 'Otis', 'Amos', 'Clem', 'Ezra', 'Wade', 'Luther', 'Abel', 'Rufus', 'Virgil', 'Hiram', 'Cyrus', 'Pierre', 'Hans', 'Ivan', 'Kenji', 'Tomás', 'Olaf', 'Nils', 'Moses', 'Eli', 'Boone'];
  const LAST = ['Voss', 'McCready', 'Tolliver', 'Pike', 'Hatch', 'Bramble', 'Crenshaw', 'Duval', 'Kessler', 'Lund', 'Morrow', 'Quint', 'Rourke', 'Stroud', 'Tanaka', 'Weller', 'Yancey', 'Colter', 'Grady', 'Haskell'];
  const FILL_PORT = ['gunslinger', 'bandit', 'thug', 'bounty', 'soldier'];
  const DEATHS = {
    1: ['collapses from heatstroke', 'is bitten by a rattlesnake', 'rides into a sinkhole in the Devil\'s Palm', 'is shot off his horse by a bandit in the rocks', 'goes down when his horse breaks a leg in a gopher hole', 'drinks from a poisoned waterhole'],
    2: ['falls from the canyon trail', 'is buried by a rockslide', 'freezes on the high pass', 'is dragged off the trail by something with claws', 'is thrown into a ravine', 'is crushed under his own horse'],
    3: ['is swept away crossing the river', 'is trampled in a cattle stampede', 'is shot by the President\'s men', 'rides into a stranger\'s Stand and never comes out', 'is struck by lightning', 'is sucked under in the mud'],
    4: ['falls through the ice', 'freezes solid in the blizzard', 'is lost in the whiteout', 'is picked off by a sniper in the pines', 'is dragged under the frozen lake', 'is torn apart by wolves'],
    5: ['is run down by a train', 'is caught in a crossfire in the streets', 'vanishes into the sea fog', 'is found in two pieces on the road', 'is shot by a man in a balloon'],
    6: ['is hit by a streetcar', 'is dragged into another world by a flag', 'falls from the bridge', 'is shot in the crowd', 'is found with a tiny hole through his skull'],
  };

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
  POWER.dismantle = { name: 'Dismantle', glyph: '解', color: '#c8323c', desc: 'Invisible slashes carve the road: every rival stalls 3s and falls back.', use: A => { A.rivals().forEach(x => { x.stun = 3; x.pos -= 25; }); A.freeze(1.2, '「DISMANTLE」'); } };
  // only powers that help you ride: moving, healing your horse, dodging misfortune, or stopping time
  POWER.spinstride = { name: 'Spin on the Reins', glyph: '回', color: '#3fb8a9', desc: 'Gyro spins the rhythm into your horse\'s gait: +50% speed for 3s and +20 stamina.', use: A => { A.S.boostT = 3; A.stamina(20); } };
  const PATH_POWER = { star_platinum: 'timestop', king_crimson: 'crimson', crazy_diamond: 'restore', the_hand: 'erase', gold_experience: 'life', sticky_fingers: 'zipper', hamon: 'ripple', vampire: 'vamp' };
  const ALLY_POWER = { gyro: 'spinstride', hotpants: 'cream', mountaintim: 'lasso', pocoloco: 'heyya', lucy: 'ticket' };
  SBR.racePowers = r => {
    const out = [];
    // your horse's own trick comes first (js/horses.js)
    const H = SBR.HORSES[r.horse];
    if (H && H.race && H.race.use) out.push(Object.assign({ id: 'horse', who: r.lead, whoName: H.name }, H.race));
    r.party.filter(m => m.hp > 0).forEach(m => {
      let k = null;
      if (m.id === 'custom' || m.id === 'sukuna') k = PATH_POWER[m.path] || (m.id === 'sukuna' ? 'dismantle' : null);
      else if (m.id === 'johnny') k = null;
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
      // nobodies: numbered riders who make up the pack, and who the trail kills off. More of them every stage.
      const nFill = tutorial ? 1 : Math.min(7, 1 + Math.round(act * 1.1 + (SBR.threatTier ? SBR.threatTier() * 0.3 : 0)));
      const fillers = [...Array(nFill)].map(() => {
        const nm = `${SBR.util.pick(FIRST)} ${SBR.util.pick(LAST)}`;
        return { key: 'filler', filler: true, num: SBR.util.randInt(12, 3852), full: nm, portrait: SBR.util.pick(FILL_PORT) };
      });
      const LEN = 1000, PRE = 250;
      const startOffset = (r.pace - 50) * 1.6;
      const actScale = tutorial ? 1.05 : 1.1 + act * 0.07;
      const riderCol = L.color || '#5b3a8c';
      const runners = [{ key: 'player', name: L.short, coat: horse.coat, mane: horse.mane, wrap: horse.wrap, spots: horse.spots, pos: startOffset, speed: 0, base: 44 + horse.speed * 2.2 + ride * 0.25, player: true }]
        .concat(chosen.map((k, i) => {
          const rv = SBR.RIVALS[k];
          const coats = ['#c8c8d0', '#6a4a2a', '#e8d8c0', '#3a2a1a', '#8a5a30', '#b8703a'];
          return { key: k, name: rv.name.split(' ')[0], coat: coats[i % coats.length], mane: '#1a1020', wrap: ['#3fb8a9', '#e8508a', '#f2c14e', '#c8323c', '#6b5bd6'][i % 5], pos: SBR.util.randInt(-30, 20), speed: 0, base: (47 + horse.speed * 0.4) * rv.speed * actScale * (k === favourite ? 1.12 : 1), surge: 0 };
        }))
        .concat(fillers.map((f, i) => Object.assign(f, { name: 'No.' + f.num, coat: ['#9a7a5a', '#5a4a3a', '#c8b098', '#7a5a3a'][i % 4], mane: '#2a1a10', wrap: '#8a8070', pos: SBR.util.randInt(-40, 10), speed: 0, base: (47 + horse.speed * 0.4) * (0.74 + Math.random() * 0.12 + act * 0.01) * actScale, surge: 0 })));

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
        const gap = Math.min(15, 84 / Math.max(1, runners.length - 1));
        rn.node = el('div', { class: 'runner' + (rn.player ? ' me' : '') + (rn.filler ? ' filler' : ''), style: { top: (i * gap) + '%', zIndex: 10 + i, '--sc': (0.78 + i * gap / 15 * 0.07).toFixed(2) } });
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

      let started = false, finished = false, finishOrder = [], last = 0, elapsed = 0, hazardT = 3, feudT = 2, deathT = 5;
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
      /** the trail kills a nobody. If he goes down right in front of you, his horse becomes your obstacle */
      const dead = [];
      function killFiller() {
        const live = runners.filter(x => x.filler && !x.done);
        if (!live.length) return;
        const me = runners[0];
        // the ones near you die where you can see it
        const near = live.filter(x => Math.abs(x.pos - me.pos) < 150);
        const v = SBR.util.pick(near.length ? near : live);
        const cause = SBR.util.pick(DEATHS[act] || DEATHS[1]);
        v.done = true; v.dead = cause; dead.push(v);
        v.node.classList.add('rn-dead');
        const P = at(v);
        spot('sk-kana', 'ドサッ', { x: P.x, y: P.y - 40 }, 1.1, '#f6ecd8');
        spot('sk-fx-cross', '✝', { x: P.x, y: P.y - 70 }, 1.6, '#c8323c');
        announce(`☠ No.${v.num} ${v.full.toUpperCase()}`, `${cause}.`, 'death');
        SBR.audio.play('boom');
        if (!threat && !pending && v.pos > me.pos && v.pos - me.pos < 70 && me.pos < LEN - 60) obstacle('obstacle', `No.${v.num}'s HORSE GOES DOWN IN FRONT OF YOU`, Math.max(0.8, 1.4 - hard * 0.07));
      }
      /** a race announcer's banner across the top */
      const annEl = el('div', { class: 'sp-announce' }); wrap.appendChild(annEl);
      let annT = null;
      function announce(big, small, cls = '') {
        annEl.className = 'sp-announce ' + cls;
        annEl.innerHTML = `<i>📣</i><b>${big}</b>${small ? `<span>${small}</span>` : ''}`;
        void annEl.offsetWidth; annEl.classList.add('show');
        clearTimeout(annT); annT = setTimeout(() => annEl.classList.remove('show'), 2600);
      }
      const leaderOf = () => runners.filter(x => !x.dead).sort((a, b) => b.pos - a.pos)[0];
      const nameOf = x => x.player ? L.short.toUpperCase() : x.filler ? `No.${x.num} ${x.full.toUpperCase()}` : SBR.RIVALS[x.key].name.toUpperCase();
      let lastLeader = null, called = {};
      function commentary() {
        const me = runners[0], ld = leaderOf();
        if (!ld) return;
        if (!called.half && ld.pos > LEN * 0.5) { called.half = 1; announce('HALFWAY!', `${nameOf(ld)} leads the pack!`); return; }
        if (!called.final && ld.pos > LEN * 0.82) { called.final = 1; announce('THE FINAL STRETCH!', me === ld ? 'And it\'s YOUR race to lose!' : `${nameOf(ld)} is in front, with ${Math.round((ld.pos - me.pos) / 10)} lengths to make up!`, 'hot'); return; }
        if (lastLeader && ld !== lastLeader && ld.pos > LEN * 0.15 && elapsed - (called.lead || 0) > 5) { called.lead = elapsed; announce(`${nameOf(ld)} TAKES THE LEAD!`, ld.player ? 'The crowd goes wild!' : ''); }
        lastLeader = ld;
      }
      /** rivals fight each other too: a shot, a rope or a Stand flies between two other riders */
      let feudSaid = 0;
      function feud(cands) {
        const pairs = [];
        cands.forEach(a => cands.forEach(b => { if (a !== b && PAIR[a.key] !== b.key && b.pos >= a.pos - 90 && b.pos - a.pos < 320) pairs.push([a, b]); }));
        if (!pairs.length) return false;
        const [a, b] = SBR.util.pick(pairs);
        const sk = SKILL[a.key];
        const useStand = sk && sk.atk && sk.atk.proj && Math.random() < standChance;
        const kind = useStand ? sk.atk.kind : (sk && sk.plain) || SBR.util.pick(['shot', 'lasso', 'dust', 'shove']);
        const proj = useStand ? sk.atk.proj : GENERIC[kind] || 'bullet';
        const P = PROJ[proj] || PROJ.bullet;
        const color = colorOf(a);
        const wr = wrapBox(), A = at(a, wr), B = at(b, wr);
        const q = el('div', { class: 'sk-proj sk-feud sk-p-' + proj + (P.spin ? ' sk-spinning' : ''), html: `<div class="sk-body">${P.html}</div>` });
        q.style.setProperty('--skc', color);
        const ang = P.noRot ? 0 : Math.atan2(B.y - A.y, B.x - A.x) * 180 / Math.PI;
        place(q, A.x, A.y, ang, !!P.flip && B.x < A.x); fxL.appendChild(q);
        a.node.classList.add('sk-glow'); a.node.style.setProperty('--skc', color);
        if (useStand) kana(A, sk.kana || 'ゴゴゴ', color); else if (PLAIN_K[kind]) kana(A, PLAIN_K[kind], color);
        requestAnimationFrame(() => requestAnimationFrame(() => { q.style.transition = 'transform .42s cubic-bezier(.3,.1,.6,1)'; const B2 = at(b); place(q, B2.x, B2.y, ang, !!P.flip && B.x < A.x); }));
        later(0.45, () => {
          q.remove(); a.node.classList.remove('sk-glow');
          if (b.done || finished) return;
          const P2 = at(b);
          if (b.immune > 0 || Math.random() < 0.2) { spot('sk-kana', 'MISS', { x: P2.x, y: P2.y - 40 }, 0.7, '#f6ecd8'); return; }
          b.stun = Math.max(b.stun || 0, useStand ? 1.6 : 1.1); b.pos -= useStand ? 12 : 6; b.surge = 0;
          burst(P2, P.burst || 'hit', color); kana(P2, P.hitK || 'ドッ', color);
          if (elapsed - feudSaid > 2.5) { feudSaid = elapsed; hazEl.innerHTML = `${a.name.toUpperCase()} ${useStand ? `「${sk.stand}」 ` : ''}hits ${b.name.toUpperCase()}!`; hazEl.classList.remove('show'); void hazEl.offsetWidth; hazEl.classList.add('show'); }
        });
        return true;
      }
      function hazard() {
        const cands = runners.slice(1).filter(x => !x.done);
        if (!cands.length) return;
        // rivals go after each other as often as after you, and that can happen while you are dodging
        if (!tutorial && cands.length >= 2 && Math.random() < 0.45 && feud(cands) && (threat || Math.random() < 0.5)) return;
        // attackers are the ones close to you, ahead or behind
        const near = cands.filter(x => Math.abs(x.pos - runners[0].pos) < 120);
        if (!threat && !pending && (near.length || Math.random() < 0.5) && Math.random() < (tutorial ? 0.35 : 0.5 + hard * 0.04)) attack(SBR.util.pick(near.length ? near : cands));
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
        const me = runners[0];
        const snap = { st: S.stamina, sh: S.shield, bo: S.boostT, ag: S.autoGold, bad: S.stumble + S.slow + S.blind, pos: me.pos, rv: runners.slice(1).map(x => ({ x, stun: x.stun || 0, pos: x.pos })) };
        p.use(API);
        if (p.id !== 'timestop') say(`「${p.name}」!`);
        SBR.audio.play('spin');
        API.flash(p.color);
        if (p.id === 'horse') horseCut(p);
        powerFx(p, snap);
      }
      /** a horse's trick gets its own cut-in: the horse gallops across a speed-lined band with the move's name */
      function horseCut(p) {
        const h = SBR.HORSES[r.horse] || {};
        const c = el('div', { class: 'hz-cut', html: `<div class="hz-lines"></div><div class="hz-horse">${art.horse({ coat: h.coat, mane: h.mane, wrap: h.wrap, spots: h.spots, marks: h.marks })}</div><div class="hz-txt"><small>${h.name || 'Your horse'}</small><b>「${p.name}」</b></div><em>${p.glyph || '馬'}</em>` });
        c.style.setProperty('--pc', p.color || '#f2c14e');
        wrap.appendChild(c); setTimeout(() => c.remove(), 1500 / (SBR.settings.speed || 1));
        SBR.audio.play('gallop');
      }
      /** read what the power changed and draw it: speed bursts, shields, gold rhythm, second wind, dashes, rivals hit */
      function powerFx(p, s) {
        const me = runners[0], col = p.color || '#f2c14e', P = at(me);
        let any = false;
        if (S.boostT > s.bo + 0.1) { any = true; skin(me, 'hz-boost', S.boostT, '<i></i><i></i><i></i><i></i>'); kana(P, 'ドドドド', col); burst(P, 'star', col); }
        if (S.shield > s.sh + 0.1) { any = true; const b = child(me, 'hz-shield', '<i></i>', S.shield); b.style.setProperty('--pc', col); kana(P, 'ガキィン', col); }
        if (S.autoGold > s.ag) { any = true; ringEl.classList.add('hz-goldring'); later(3.5, () => ringEl.classList.remove('hz-goldring')); child(me, 'hz-notes', '<i>♪</i><i>♫</i><i>♪</i>', 2.2); kana(P, 'スッ', '#f2c14e'); }
        if (S.stamina > s.st + 5) { any = true; child(me, 'hz-wind', '<i></i><i></i><i></i><i></i><i></i><i></i>', 1.6).style.setProperty('--pc', col); spot('sk-kana', `+${Math.round(S.stamina - s.st)}`, { x: P.x, y: P.y - 70 }, 1, '#7adf5a'); }
        if (S.stumble + S.slow + S.blind < s.bad - 0.2) { any = true; spot('sk-kana', 'CLEAR!', { x: P.x + 30, y: P.y - 40 }, 0.9, '#fff'); ringEl.classList.remove('blinded', 'sk-ash'); }
        if (me.pos > s.pos + 5) {
          any = true; const d = me.pos - s.pos;
          for (let i = 1; i <= 3; i++) { const g = child(me, 'hz-ghost', me.node.querySelector('svg') ? me.node.querySelector('svg').outerHTML : '', 0.5); g.style.setProperty('--gx', (-i * Math.min(60, d * 1.4)) + 'px'); g.style.opacity = 0.5 - i * 0.12; }
          kana(P, 'シュン', col);
        }
        s.rv.forEach(o => {
          if (o.x.done) return;
          if ((o.x.stun || 0) > o.stun + 0.2 || o.x.pos < o.pos - 3) {
            any = true; const Q = at(o.x);
            burst(Q, 'star', col); kana(Q, o.x.pos < me.pos ? 'ザザッ' : 'ドゴッ', col);
            if (o.x.pos < me.pos) spot('hz-dust', '<i></i><i></i><i></i>', { x: (P.x + Q.x) / 2, y: Q.y + 20 }, 1.1, '#d8c09a');
            else { const ln = el('div', { class: 'hz-streak' }); const wr = wrapBox(); ln.style.cssText = `left:${P.x}px;top:${P.y}px;width:${Math.hypot(Q.x - P.x, Q.y - P.y)}px;transform:rotate(${Math.atan2(Q.y - P.y, Q.x - P.x)}rad);--pc:${col}`; fxL.appendChild(ln); later(0.5, () => ln.remove()); }
          }
        });
        if (!any) { burst(P, 'star', col); kana(P, 'ゴゴゴ', col); }
      }
      powers.forEach((p, i) => {
        p.btn = el('button', { class: 'sp-power', style: { '--pc': p.color }, html: `<kbd>${i + 1}</kbd><b>${p.glyph}</b><span>${p.name}</span>` });
        SBR.tip.bind(p.btn, `<b>${p.name}</b> (${p.whoName || (SBR.CHARS[p.who] || {}).short || ''})<br>${p.desc}<br><i>Once per race. Key ${i + 1}.</i>`);
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
          if (S.frozen <= 0) {
            commentary();
            // deaths on the trail: rarer on the 1st Stage, constant by the end
            if (!tutorial && (deathT -= dt) <= 0) { deathT = Math.max(2.6, 9 - hard * 0.8) + Math.random() * 4; if (Math.random() < Math.min(0.9, 0.35 + hard * 0.08)) killFiller(); }
          }
          // riders fighting among themselves, on their own clock
          if (!tutorial && S.frozen <= 0 && (feudT -= dt) <= 0) { feudT = Math.max(1.8, 3.6 - hard * 0.2) + Math.random() * 1.5; const fc = runners.slice(1).filter(x => !x.done); if (fc.length >= 2) feud(fc); }
          if (S.frozen <= 0 && hazardT <= 0 && me.pos < LEN - 60) { hazardT = threat || pending ? 1.1 : Math.max(2.1, 4.4 - hard * 0.3) + Math.random() * 1.6; if (!threat) hazard(); }
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
        const win = finishOrder[0];
        // how many of the 3,852 are still in it
        r.fieldLeft = Math.max(40, (r.fieldLeft || 3852) - dead.length - SBR.util.randInt(90, 160) * (1 + act * 0.35));
        await sleep(300);
        await finishSplash(win, place);
        await finishPanels(win, place);
        const portOf = x => x.player ? art.portrait(L.portrait) : art.portrait(x.filler ? x.portrait : SBR.RIVALS[x.key].portrait);
        const res = el('div', { class: 'sprint-results' });
        res.innerHTML = `<div class="sr-title">${place === 1 ? 'STAGE WINNER!' : SBR.util.ordinal(place) + ' PLACE'}</div>
          <div class="podium">${finishOrder.map((x, i) => `<div class="pod-row ${x.player ? 'me' : ''} ${x.filler ? 'filler' : ''}" style="animation-delay:${i * 0.1}s"><span class="pod-pos">${i + 1}</span><span class="pod-port">${portOf(x)}</span><span class="pod-name">${x.player ? L.name : x.filler ? `No.${x.num} ${x.full}` : SBR.RIVALS[x.key].name}</span><span class="pod-pts">${x.filler ? '' : '+' + (SBR.POINTS[finishOrder.filter(y => !y.filler).indexOf(x)] || 3)}</span></div>`).join('')}
          ${dead.map(x => `<div class="pod-row dead"><span class="pod-pos">✝</span><span class="pod-port">${portOf(x)}</span><span class="pod-name">No.${x.num} ${x.full}<small>${x.dead}</small></span><span class="pod-pts">DNF</span></div>`).join('')}</div>
          <div class="sr-field">${dead.length ? `${dead.length} rider${dead.length > 1 ? 's' : ''} never reached the line. ` : ''}<b>${Math.round(r.fieldLeft).toLocaleString()}</b> of 3,852 still racing.</div>`;
        const go = SBR.ui.btn('Continue ▸', () => { wrap.classList.remove('show'); setTimeout(() => wrap.remove(), 300); resolve({ place, order: finishOrder.filter(x => !x.filler).map(x => x.key), dead: dead.length }); }, 'btn-primary');
        res.appendChild(go);
        wrap.appendChild(res);
        SBR.audio.play(place <= 3 ? 'level' : 'coin');
      }
      /** the finish: a full-screen announcer card with the winner's face */
      function finishSplash(win, place) {
        return new Promise(res => {
          const mine = place === 1;
          const nm = win.player ? L.name : win.filler ? `No.${win.num} ${win.full}` : SBR.RIVALS[win.key].name;
          const port = win.player ? art.portrait(L.portrait) : art.portrait(win.filler ? win.portrait : SBR.RIVALS[win.key].portrait);
          const stageName = name.split(/\s[—-]\s/)[0].replace(/ Finish$/, '');
          const o = el('div', { class: 'sp-finish' + (mine ? ' mine' : '') });
          o.innerHTML = `<div class="spf-lines"></div><div class="spf-burst"></div>
            <div class="spf-kicker">📣 THE WINNER OF THE ${stageName.toUpperCase()} IS...</div>
            <div class="spf-port">${port}</div>
            <div class="spf-name">${nm}!!</div>
            <div class="spf-sub">${mine ? 'FIRST ACROSS THE LINE!' : `You came in ${SBR.util.ordinal(place)}.`}</div>
            <div class="spf-kana">${mine ? 'ドォォォン' : 'ゴゴゴゴ'}</div>
            ${mine ? [...Array(40)].map((_, i) => `<i class="spf-conf" style="--x:${Math.random() * 100}%;--d:${(Math.random() * 1.2).toFixed(2)}s;--c:${['#f2c14e', '#e8508a', '#3fb8a9', '#f6ecd8', '#6b5bd6'][i % 5]}"></i>`).join('') : ''}`;
          wrap.appendChild(o);
          SBR.audio.play(mine ? 'level' : 'menace');
          requestAnimationFrame(() => o.classList.add('show'));
          let done = false;
          const fin = () => { if (done) return; done = true; o.classList.add('out'); setTimeout(() => { o.remove(); res(); }, 350); };
          setTimeout(() => o.addEventListener('mousedown', fin), 500);
          setTimeout(fin, 3200);
        });
      }
      /** then a manga page: the organiser calls it, the winner and you react */
      function finishPanels(win, place) {
        if (!SBR.panels || tutorial) return Promise.resolve();
        const speak = k => SBR.CHARS[k] && !['johnny', 'gyro'].includes(k) || r.party.some(m => m.id === k);
        const winName = win.player ? L.name : win.filler ? `rider No.${win.num}, ${win.full}` : SBR.RIVALS[win.key].name;
        const stageName = name.split(/\s[—-]\s/)[0].replace(/ Finish$/, '');
        const WIN = ['Nobody hands you fifty million dollars. You take it, one stage at a time.', 'Tha’ one. Wh’ next?', 'Did you see that?! First across!', 'Keep the champagne. Wher’ the next line?'];
        const LOSE = place <= 3 ? ['Close. Not close enough.', 'Points are points. ’l take them.', 'Next stage, that line is mine.'] : ['Eat my dust next time. I swear it.', 'The race is’ over. Not by a long way.', 'Keep riding. Just keep riding.'];
        const GLOAT = { diego: 'Did you really think a stable boy would lose to you? WRYYY... I mean, how quaint.', pocoloco: 'Hey Ya said today was my lucky day! I’ ALWAYS my lucky day!', hotpants: 'God rides with me. You only have a horse.', mountaintim: 'Ride hard, friend. The trail is long.', sandman: 'My peopl’ land. My peopl’ speed.', wekapipo: '...' };
        const lines = [
          { who: 'steven', text: place === 1 ? `LADIES AND GENTLEMEN! The ${stageName} goes to ${L.name.toUpperCase()}!!` : `LADIES AND GENTLEMEN! The ${stageName} goes to ${winName.toUpperCase()}!!` },
          { narr: place === 1 ? 'The crowd tears down the fences. Hats fly. Somebody fires a pistol into the air.' : 'The crowd roars for the winner. Your horse heaves under you, soaked in sweat.' },
        ];
        if (place === 1) lines.push({ who: leadId, text: SBR.util.pick(WIN) });
        else {
          if (!win.player && !win.filler && speak(win.key)) lines.push({ who: win.key, text: GLOAT[win.key] || 'Better luck next stage.' });
          else lines.push({ narr: `${winName} raises a fist and doesn't look back.` });
          lines.push({ who: leadId, text: SBR.util.pick(LOSE) });
        }
        if (dead.length) lines.push({ narr: `${dead.length} rider${dead.length > 1 ? 's' : ''} never reached the line. Nobody stops to bury them.` });
        const scene = { panels: true, bg: act, lines };
        return SBR.panels.play('race_finish_' + act, scene).catch(() => {});
      }

      // debug handle for the live race (used by tests and SBR.debug): force a rival skill
      SBR.sprint.live = { wrap, S, runners, hard, attack: (rn, combo) => { clearThreat(); pending = null; attack(rn); if (threat) threat.combo = !!combo; }, self: rn => selfBoost(rn) };
      requestAnimationFrame(frame);
      (async () => {
        // the race starts straight away; first-timers get a hint banner instead of a blocking dialogue
        if (tutorial || !SBR.meta.sprintHintSeen3) {
          const tip = el('div', { class: 'sprint-tip', html: '<b>HOW TO RACE</b> Press <b>SPACE</b> or click when the needle crosses the <span class="gold">GOLD</span> zone to surge. Miss and your horse stumbles. When a rival attacks or the road is blocked (<b>⚠</b>), hit GOLD before the bar runs out to dodge. Keys <b>1-4</b> use your horse&#39;s trick and your party&#39;s riding powers, once each. Your act PACE is your head start.' });
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
