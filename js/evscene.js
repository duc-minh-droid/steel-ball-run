/* Illustrated encounters. An event with an entry in SBR.EVS shows a wide drawn scene of what is happening
   instead of a portrait, and each choice continues the strip with a new panel showing what came of it.

   SBR.evs.add(id, {
     act: 2,                                  // optional: palette/backdrop (defaults to the run's act)
     scene: S => '...svg...',                 // the situation, drawn in an 800x360 box
     out: { 0: S => '...', '0:fail': S => '...', 1: ..., 2: ... },   // one panel per outcome (missing ones fall back)
   });

   S is the toolkit below: S.bg(opts), S.prop(name, x, y, scale, ...args), S.person(key, x, y, scale, pose),
   S.horse(x, y, scale, opts), S.stand(key, x, y, scale), S.bust(key, x, y, scale), S.kana(text, x, y, size, rot),
   S.lines(cx, cy, color), S.bubble(text, x, y, w), S.caption(text), S.fx(kind, x, y, scale), S.tone(d, op), S.T(x, y, s, inner, flip).
   Coordinates: ground line is around y=300; x runs 0..800. */
'use strict';
SBR.evs = (() => {
  const K = '#1a1020';
  const REG = {};
  let uid = 0;
  const sc = () => SBR.scenery;
  const T = (x, y, s, inner, flip) => `<g transform="translate(${x} ${y})${s !== 1 || flip ? ` scale(${flip ? -s : s} ${s})` : ''}">${inner}</g>`;
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  /** nest another SVG string (portrait, stand, horse) as a positioned box */
  const nest = (svg, x, y, w, h, flip) => {
    if (!svg) return '';
    const m = /viewBox="([^"]+)"/.exec(svg); const vb = m ? m[1] : '0 0 100 100';
    const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    const body = `<svg x="${flip ? -w / 2 : x - w / 2}" y="${y - h}" width="${w}" height="${h}" viewBox="${vb}" overflow="visible">${inner}</svg>`;
    return flip ? `<g transform="translate(${x} 0) scale(-1 1)">${body}</g>` : body;
  };

  const PALS = {
    1: { sky: ['#f2a65a', '#fbe3b0'], ground: '#e8c080', far: '#c07a5a' },
    2: { sky: ['#7aa8d8', '#e8f0ff'], ground: '#9aaa5a', far: '#7a8aa8' },
    3: { sky: ['#6ab0d8', '#f6f0c8'], ground: '#c8c870', far: '#8ab070' },
    4: { sky: ['#8aa0c0', '#eef4fa'], ground: '#eef4f8', far: '#a8b8c8' },
    5: { sky: ['#e8906a', '#f8dcc0'], ground: '#a0a868', far: '#9a7a70' },
    6: { sky: ['#5a4a8a', '#e8a888'], ground: '#8a8a90', far: '#4a4468' },
    night: { sky: ['#1a1a3a', '#4a3a6a'], ground: '#3a3a4a', far: '#2a2440' },
    dusk: { sky: ['#6b3a7a', '#f2a65a'], ground: '#a08060', far: '#5a3a5a' },
    inside: { sky: ['#5a3a2a', '#8a6040'], ground: '#6a4a30', far: '#4a3020' },
  };
  const act = () => (SBR.run && SBR.run.act) || 1;
  function makeS(defAct) {
    const id = 'ev' + (++uid);
    const S = {
      id, T, K, esc,
      P: () => sc().P,
      /** sky, horizon and ground. opts: {pal: act|'night'|'dusk'|'inside', horizon: y, far: true, sun: true, stars: false} */
      bg(o = {}) {
        const P = PALS[o.pal || defAct || act()] || PALS[1], hz = o.horizon || 250;
        let s = `<defs><linearGradient id="${id}sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky[0]}"/><stop offset="1" stop-color="${P.sky[1]}"/></linearGradient>
          <pattern id="${id}d" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="3.5" cy="3.5" r="1.4" fill="${K}"/></pattern>
          <pattern id="${id}h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)"><path d="M0 0V6" stroke="${K}" stroke-width="1.3"/></pattern></defs>
          <rect width="800" height="360" fill="url(#${id}sk)"/>`;
        if (o.inside) return s + `<rect width="800" height="360" fill="url(#${id}h)" opacity=".12"/><rect y="${hz}" width="800" height="${360 - hz}" fill="${P.ground}" stroke="${K}" stroke-width="3"/>`;
        if (o.sun !== false && !o.stars) s += `<g opacity=".9"><circle cx="${o.sunX || 640}" cy="${o.sunY || 80}" r="38" fill="#fff3c0" stroke="${K}" stroke-width="2.5"/>${[...Array(12)].map((_, i) => { const a = i * Math.PI / 6; const cx = o.sunX || 640, cy = o.sunY || 80; return `<path d="M${cx + Math.cos(a) * 48} ${cy + Math.sin(a) * 48}L${cx + Math.cos(a) * 64} ${cy + Math.sin(a) * 64}" stroke="#fff3c0" stroke-width="4"/>`; }).join('')}</g>`;
        if (o.stars) s += [...Array(40)].map((_, i) => `<circle cx="${(i * 197) % 800}" cy="${(i * 73) % (hz - 30)}" r="${1 + (i % 3) * 0.6}" fill="#fff" opacity=".8"/>`).join('') + `<path d="M640 50a26 26 0 1 0 22 40a20 20 0 1 1 -22 -40z" fill="#fff3c0" stroke="${K}" stroke-width="2"/>`;
        if (o.far !== false) { let d = `M0 ${hz}`; for (let x = 0; x <= 800; x += 80) d += `L${x + 40} ${hz - 30 - ((x * 37) % 50)}L${x + 80} ${hz}`; s += `<path d="${d}V${hz}H0z" fill="${P.far}" stroke="${K}" stroke-width="2.5"/><path d="${d}V${hz}H0z" fill="url(#${id}d)" opacity=".18"/>`; }
        s += `<rect y="${hz}" width="800" height="${360 - hz}" fill="${P.ground}"/><path d="M0 ${hz}H800" stroke="${K}" stroke-width="3"/><rect y="${hz + 40}" width="800" height="${320 - hz}" fill="url(#${id}d)" opacity=".1"/>`;
        return s;
      },
      /** a scenery prop from SBR.scenery.P, base at (x, y) */
      prop(name, x, y, s = 1, ...args) { const f = sc() && sc().P[name]; if (!f) return ''; return T(x, y, s, f(...args).replace(/url\(#@/g, `url(#${id}`), args.flip); },
      /** a portrait head-and-shoulders, no backdrop */
      bust(key, x, y, s = 1, flip) { return nest(SBR.art.portrait(key, { nobg: true }), x, y, 100 * s, 120 * s, flip); },
      /** a standing figure: body drawn from the portrait's colours, the portrait's head on top.
          pose: 'stand' | 'point' | 'draw' (gun out) | 'down' (lying) | 'kneel' | 'arms' (arms up) */
      person(key, x, y, s = 1, pose = 'stand', flip = false) {
        const pc = (SBR.art.P && SBR.art.P[key]) || {};
        const body = pc.outfit || '#6a4a2a', b2 = pc.outfit2 || '#3a2a1a', skin = pc.skin || '#e8c0a0', legs = '#3a2a3a';
        if (pose === 'down') return T(x, y, s, `<ellipse cx="0" cy="4" rx="70" ry="8" fill="${K}" opacity=".25"/><path d="M-60 -6h80l10 10h-90z" fill="${body}" stroke="${K}" stroke-width="3"/><path d="M20 -2h40v8H20z" fill="${legs}" stroke="${K}" stroke-width="3"/>` + `<g transform="translate(-62 -2) rotate(-90)">${nest(SBR.art.portrait(key, { nobg: true }), 0, 30, 50, 60)}</g>`, flip);
        const kneel = pose === 'kneel';
        const armR = pose === 'point' || pose === 'draw' ? `<path d="M14 -104L52 -112" stroke="${K}" stroke-width="13" stroke-linecap="round"/><path d="M14 -104L52 -112" stroke="${body}" stroke-width="8" stroke-linecap="round"/><circle cx="54" cy="-112" r="6" fill="${skin}" stroke="${K}" stroke-width="2.5"/>${pose === 'draw' ? `<path d="M56 -118h22v6H62l-2 8h-6z" fill="#7a7a8a" stroke="${K}" stroke-width="2.5"/>` : ''}`
          : pose === 'arms' ? `<path d="M14 -104L30 -150" stroke="${K}" stroke-width="13" stroke-linecap="round"/><path d="M14 -104L30 -150" stroke="${body}" stroke-width="8" stroke-linecap="round"/>` : `<path d="M16 -104L24 -62" stroke="${K}" stroke-width="13" stroke-linecap="round"/><path d="M16 -104L24 -62" stroke="${body}" stroke-width="8" stroke-linecap="round"/>`;
        const armL = pose === 'arms' ? `<path d="M-14 -104L-30 -150" stroke="${K}" stroke-width="13" stroke-linecap="round"/><path d="M-14 -104L-30 -150" stroke="${body}" stroke-width="8" stroke-linecap="round"/>` : `<path d="M-16 -104L-24 -62" stroke="${K}" stroke-width="13" stroke-linecap="round"/><path d="M-16 -104L-24 -62" stroke="${body}" stroke-width="8" stroke-linecap="round"/>`;
        const legsSvg = kneel ? `<path d="M-10 -56L-26 -24L-4 -2M10 -56L14 -2" stroke="${K}" stroke-width="15" stroke-linecap="round" fill="none"/><path d="M-10 -56L-26 -24L-4 -2M10 -56L14 -2" stroke="${legs}" stroke-width="10" stroke-linecap="round" fill="none"/>`
          : `<path d="M-9 -58L-14 -2M9 -58L14 -2" stroke="${K}" stroke-width="15" stroke-linecap="round"/><path d="M-9 -58L-14 -2M9 -58L14 -2" stroke="${legs}" stroke-width="10" stroke-linecap="round"/><path d="M-24 0h18M8 0h18" stroke="${K}" stroke-width="7" stroke-linecap="round"/>`;
        const torso = `<path d="M-22 -112Q0 -122 22 -112L18 -56H-18Z" fill="${body}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M-8 -114L0 -96L8 -114" fill="${b2}" stroke="${K}" stroke-width="2"/><path d="M-18 -60H18" stroke="${K}" stroke-width="5"/>`;
        const head = nest(SBR.art.portrait(key, { nobg: true }), 0, -96, 74, 89);
        return T(x, y + (kneel ? 16 : 0), s, `<ellipse cx="0" cy="2" rx="30" ry="6" fill="${K}" opacity=".25"/>${legsSvg}${armL}${torso}${armR}${head}`, flip);
      },
      /** a horse from SBR.art.horse; opts {coat, mane, wrap, rider:{...}} */
      horse(x, y, s = 1, o = {}, flip) { return nest(SBR.art.horse(o), x, y, 190 * s, 140 * s, flip); },
      /** a Stand figure */
      stand(key, x, y, s = 1, flip) { return SBR.stands && SBR.stands.DEFS[key] ? nest(SBR.stands.svg(key), x, y, 120 * s, 160 * s, flip) : ''; },
      /** manga sound effect */
      kana(text, x, y, size = 40, rot = -8, color = '#fff') { return `<text x="${x}" y="${y}" font-size="${size}" font-family="'Zen Antique','Noto Sans JP',Anton,sans-serif" font-weight="900" fill="${color}" stroke="${K}" stroke-width="${Math.max(2, size / 12)}" paint-order="stroke" transform="rotate(${rot} ${x} ${y})" text-anchor="middle">${esc(text)}</text>`; },
      /** focus lines radiating from a point */
      lines(cx = 400, cy = 180, c = K, n = 40, op = 0.35) { return `<g stroke="${c}" opacity="${op}">${[...Array(n)].map((_, i) => { const a = i / n * Math.PI * 2 + (i % 3) * 0.02; const r0 = 120 + (i % 5) * 18; return `<path d="M${cx + Math.cos(a) * r0} ${cy + Math.sin(a) * r0}L${cx + Math.cos(a) * 700} ${cy + Math.sin(a) * 700}" stroke-width="${2 + (i % 4)}"/>`; }).join('')}</g>`; },
      /** a speech bubble; tail points down-left to (tx, ty) if given */
      bubble(text, x, y, w = 200, tx, ty) {
        const lines = wrap(text, Math.max(10, Math.floor(w / 8.4)));
        const h = 16 + lines.length * 17;
        const tail = tx != null ? `<path d="M${x + w * 0.3} ${y + h - 2}L${tx} ${ty}L${x + w * 0.45} ${y + h - 2}" fill="#fff" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/>` : '';
        return `${tail}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2.4}" fill="#fff" stroke="${K}" stroke-width="3"/>${tx != null ? `<path d="M${x + w * 0.3 + 2} ${y + h - 3}L${x + w * 0.45 - 2} ${y + h - 3}" stroke="#fff" stroke-width="4"/>` : ''}<text x="${x + w / 2}" y="${y + 22}" font-size="14" font-family="Oswald,'Arial Narrow',sans-serif" font-weight="700" text-anchor="middle" fill="${K}">${lines.map((l, i) => `<tspan x="${x + w / 2}" dy="${i ? 17 : 0}">${esc(l)}</tspan>`).join('')}</text>`;
      },
      /** a narration box in the top-left corner */
      caption(text, x = 12, y = 12, w = 300) {
        const lines = wrap(text, Math.floor(w / 7.6)); const h = 12 + lines.length * 16;
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f6ecd8" stroke="${K}" stroke-width="3"/><text x="${x + 10}" y="${y + 19}" font-size="13" font-family="Oswald,'Arial Narrow',sans-serif" fill="${K}">${lines.map((l, i) => `<tspan x="${x + 10}" dy="${i ? 16 : 0}">${esc(l)}</tspan>`).join('')}</text>`;
      },
      /** effects: 'boom' 'bang' (muzzle flash) 'dust' 'spark' 'blood' 'smoke' 'splash' 'coins' */
      fx(kind, x, y, s = 1) {
        const star = (r1, r2, n, c) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? r2 : r1; d += (i ? 'L' : 'M') + (x + Math.cos(a) * r * s).toFixed(1) + ' ' + (y + Math.sin(a) * r * s).toFixed(1); } return `<path d="${d}z" fill="${c}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>`; };
        if (kind === 'boom') return star(70, 34, 12, '#ffd84a') + star(40, 18, 10, '#fff3c0');
        if (kind === 'bang') return star(26, 10, 8, '#fff3c0');
        if (kind === 'spark') return star(16, 5, 6, '#fff');
        if (kind === 'blood') return `<g fill="#c8323c" stroke="${K}" stroke-width="2">${[[0, 0, 9], [18, -10, 6], [-14, 8, 5], [26, 10, 4]].map(([dx, dy, r]) => `<circle cx="${x + dx * s}" cy="${y + dy * s}" r="${r * s}"/>`).join('')}</g>`;
        if (kind === 'coins') return `<g>${[[0, 0], [16, -8], [-14, -4], [6, -20]].map(([dx, dy]) => `<ellipse cx="${x + dx * s}" cy="${y + dy * s}" rx="${9 * s}" ry="${6 * s}" fill="#f2c14e" stroke="${K}" stroke-width="2"/>`).join('')}</g>`;
        if (kind === 'splash') return `<g fill="#9fd0f0" stroke="${K}" stroke-width="2">${[-30, -12, 8, 26].map((dx, i) => `<path d="M${x + dx * s} ${y}q${6 * s} ${-30 * s - i * 6} ${12 * s} 0z"/>`).join('')}</g>`;
        // dust / smoke
        const c = kind === 'smoke' ? '#8a8090' : '#d8c09a';
        return `<g fill="${c}" stroke="${K}" stroke-width="2" opacity=".9">${[[0, 0, 22], [26, -8, 16], [-24, -4, 18], [8, -22, 14]].map(([dx, dy, r]) => `<circle cx="${x + dx * s}" cy="${y + dy * s}" r="${r * s}"/>`).join('')}</g>`;
      },
      tone(d, op = 0.3) { return `<path d="${d}" fill="url(#${id}d)" opacity="${op}"/>`; },
    };
    return S;
  }
  function wrap(text, n) { const out = []; let cur = ''; String(text).split(/\s+/).forEach(w => { if ((cur + ' ' + w).trim().length > n) { if (cur) out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }); if (cur) out.push(cur); return out; }
  const frame = inner => `<svg class="evs-svg" viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${inner}<rect x="1.5" y="1.5" width="797" height="357" fill="none" stroke="${K}" stroke-width="3"/></svg>`;

  function draw(fn, a) { try { return frame(fn(makeS(a))); } catch (e) { console.warn('[evs]', e); return ''; } }
  return {
    add(id, def) { REG[id] = def; },
    has: id => !!REG[id],
    ids: () => Object.keys(REG),
    /** the opening scene of an event, or '' */
    scene(id) { const d = REG[id]; return d && d.scene ? draw(d.scene, d.act) : ''; },
    /** the scene for an outcome key 'eventId:idx[:fail]', or '' */
    outcome(key) {
      const m = /^(.*):(\d+)(:fail)?$/.exec(key || ''); if (!m) return '';
      const d = REG[m[1]]; if (!d || !d.out) return '';
      const f = m[3] ? d.out[m[2] + ':fail'] : d.out[m[2]];
      return f ? draw(f, d.act) : '';
    },
    frame, makeS, REG,
  };
})();
