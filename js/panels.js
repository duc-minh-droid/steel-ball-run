/* Manga panels: story scenes drawn as coloured manga pages.
   SBR.ui.dialogue(id) hands a scene to SBR.panels.play(id, scene) when SBR.panels.wants(id, scene) says so:
   boss pre/mid/post scenes, the fight-talk scenes below (ft_*), story scenes that open a fight, and any scene with `panels: true`.
   Each page holds 2-5 panels (slanted borders, tall close-ups, insets) on black gutters. Speakers get a colour wash,
   cropped art (eyes for intense lines, bust otherwise), a Stand behind them, a bubble (round / spiky / cloud) and kana SFX.
   Click / Space / Enter: next page. Escape: skip the scene.
   SBR.fightTalk(enemyIds, opts) -> { pre, mid: { round: sceneId }, post } adds talk to fights (called by main.js fight()). */
'use strict';

SBR.panels = (() => {
  const INK = '#120a18';
  const set = () => SBR.settings || {};
  const reduced = () => !!set().reducedMotion;
  const speed = () => Math.max(0.3, +set().speed || 1);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- seeded randomness (layouts stay stable per scene) ---------- */
  function hash(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    let a = hash(seed) || 1;
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  /* ---------- who is speaking ---------- */
  const NAMES = { steven: 'Steven Steel', sugar: 'Sugar Mountain', marco: 'Marco', valentine: 'Funny Valentine', diegodino: 'Diego Brando', diegoworld: 'Diego (Another World)', laboom: 'L.A. Boomboom', tattoo: 'Tattoo You!', lucy: 'Lucy Steel' };
  const STAND = { robinson: 'insect', robinson_boss: 'insect', benjamin: 'tomboom', andre: 'tomboom', laboom: 'tomboom', oyecomova: 'boku', oyecomova_boss: 'boku', porkpie: 'wired',
    diego_rival: 'scarymonsters', diegodino: 'scarymonsters', ferdinand: 'scarymonsters_f', hotpants_foe: 'creamstarter', ringo: 'mandom', blackmore: 'catchrainbow', sandman: 'silentway',
    magent: 'century', wekapipo_foe: 'wreckingball', axl: 'civilwar', disco: 'chocolatedisco', mikeo: 'tubular', valentine1: 'd4c', valentine: 'd4c', lovetrain: 'lovetrain', diego_world: 'theworld', diegoworld: 'theworld' };
  const COLOR = { ringo: '#c89a3a', blackmore: '#6a8ad0', sandman: '#d89a48', valentine1: '#e8508a', valentine: '#e8508a', lovetrain: '#f2c14e', diego_world: '#f2c14e', diegoworld: '#f2c14e',
    diego_rival: '#5ab070', diegodino: '#5ab070', axl: '#8a6ab0', ferdinand: '#8ab04a', oyecomova: '#e8742a', oyecomova_boss: '#e8742a', porkpie: '#9a8a5a', magent: '#b8b8c8', wekapipo_foe: '#6a8ad0',
    disco: '#b07040', mikeo: '#e86a8a', robinson: '#8a9a3a', robinson_boss: '#8a9a3a', benjamin: '#b0703a', andre: '#b0703a', laboom: '#c8843a', hotpants_foe: '#e8508a', stroheim: '#7a8a6a',
    arrow_collector: '#c8a0e8', mack_knife: '#c8323c', dixie_gun: '#e8a04a', steven: '#f2c14e', tattoo_boss: '#c8323c', tattoo: '#c8323c', palm_echo: '#e8742a', fossil_colossus: '#c8e04a', wolf_alpha: '#9fd0f0' };
  const PALETTE = ['#e8742a', '#6b5bd6', '#3fb8a9', '#e8508a', '#c8323c', '#f2c14e', '#6a8ad0', '#8ab04a'];

  function info(who) {
    const C = SBR.CHARS[who], E = SBR.ENEMIES[who];
    let name, artHtml, color;
    if (C) { name = C.name; artHtml = SBR.art.portrait(C.portrait); color = C.color; }
    else if (E) { name = E.name; artHtml = SBR.ui.artFor(E.art); color = E.sigilColor; }
    else {
      const byKey = Object.keys(SBR.ENEMIES).find(k => SBR.ENEMIES[k].art && SBR.ENEMIES[k].art.key === who);
      name = NAMES[who] || (byKey && SBR.ENEMIES[byKey].name) || who.replace(/^./, c => c.toUpperCase());
      artHtml = SBR.art.portrait(who);
    }
    color = COLOR[who] || color;
    if (!color) { const P = SBR.art.P && SBR.art.P[E && E.art && E.art.key || who]; color = P && P.bg ? P.bg[0] : PALETTE[hash(who) % PALETTE.length]; }
    return { who, name, art: artHtml, color, stand: standOf(who) };
  }
  function standOf(who) {
    const D = SBR.stands && SBR.stands.DEFS; if (!D) return null;
    let k = null;
    try {
      if (SBR.CHARS[who]) {
        const ref = SBR.run && SBR.run.party && SBR.run.party.find(m => m.id === who);
        if (SBR.run) k = SBR.stands.keyFor({ side: 'party', id: who, ref: ref || { id: who } });
      } else k = STAND[who] || (SBR.ENEMIES[who] ? SBR.stands.keyFor({ side: 'enemy', id: who }) : null);
    } catch (e) { k = null; }
    return k && D[k] ? k : null;
  }
  /** strip a portrait's painted background and crop it with a new viewBox */
  function cutout(svg, vb, par) {
    return svg
      .replace(/<rect width="100" height="120" fill="url\(#[^)]*\)"\/>/g, '')
      .replace(/<path d="M62 0 L100 0 L100 120 L28 120Z"[^>]*\/>/, '')
      .replace(/<g fill="#fff" opacity="\.35">[\s\S]*?<\/g>/, '')
      .replace(/<g stroke="#fff" stroke-width="1" opacity="\.25">[\s\S]*?<\/g>/, '')
      .replace('viewBox="0 0 100 120"', `viewBox="${vb}" preserveAspectRatio="${par}"`);
  }

  /* ---------- line classification ---------- */
  const textOf = L => (L.who ? L.text : L.narr) || '';
  const isThought = t => /^\s*\(.*\)\s*$/.test(t);
  const endsBang = t => /!\s*[)"'”’~]*\s*$/.test(t);
  function classify(L) {
    const t = textOf(L);
    const think = !!L.who && isThought(t);
    const mood = L.mood || '';
    const menace = mood === 'menace';
    const loud = mood === 'shout' || mood === 'angry' || (!think && endsBang(t) && (/\b[A-Z]{3,}/.test(t.replace(/\bI\b/g, '')) || t.length < 60));
    const intense = !think && (menace || loud || mood === 'angry' || endsBang(t));
    return { think, menace, loud, intense, angry: mood === 'angry' };
  }
  const SFX_WORDS = [[/nyo-?ho/i, 'ニョホ'], [/\bmuda\b/i, 'ムダムダ'], [/WRY+/, 'ウリィィ'], [/dojyaa+n/i, 'ドジャァァン'], [/\btick\b/i, 'チッ チッ'], [/AROO+/i, 'ウオオォ'], [/GRR+/i, 'グルル'], [/\bhahaha|hehehe/i, 'ハハハ'], [/THE WORLD/, 'ドォン'], [/\bpop\b/i, 'パンッ'], [/\bboom\b/i, 'ドカン'], [/rain|drop/i, 'ザアア']];
  function sfxFor(c, t) {
    for (const [re, k] of SFX_WORDS) if (re.test(t)) return k;
    if (c.menace) return 'ゴゴゴゴ';
    if (c.angry) return 'ドドドド';
    if (c.loud) return 'ドンッ';
    if (c.intense) return 'ドン';
    return null;
  }
  const NARR_STAND = [[/TUSK ACT ?4/i, 'tusk4'], [/TUSK ACT ?3/i, 'tusk3'], [/TUSK ACT ?2/i, 'tusk2'], [/TUSK ACT ?1|TUSK\b/i, 'tusk1'], [/THE WORLD/, 'theworld'], [/Love Train/i, 'lovetrain'], [/D4C/, 'd4c'], [/BALL BREAKER/i, 'ballbreaker']];
  const AMBIENT = { 1: 'ヒュウウ', 2: 'ゴオオ', 3: 'ザアア', 4: 'ビュウウ', 5: 'ガタン', 6: 'ザワッ' };

  /* ---------- page templates: polygons in 0..100 page space, clockwise, reading order ---------- */
  const R = [[0, 0], [100, 0], [100, 100], [0, 100]];
  const WIDE = {
    1: [[R]],
    2: [
      [[[0, 0], [58, 0], [50, 100], [0, 100]], [[58, 0], [100, 0], [100, 100], [50, 100]]],
      [[[0, 0], [100, 0], [100, 42], [0, 54]], [[0, 54], [100, 42], [100, 100], [0, 100]]],
      [[[0, 0], [40, 0], [34, 100], [0, 100]], [[40, 0], [100, 0], [100, 100], [34, 100]]],
    ],
    3: [
      [[[0, 0], [100, 0], [100, 44], [0, 50]], [[0, 50], [52, 47.4], [46, 100], [0, 100]], [[52, 47.4], [100, 44], [100, 100], [46, 100]]],
      [[[0, 0], [36, 0], [30, 100], [0, 100]], [[36, 0], [100, 0], [100, 52], [33, 50]], [[33, 50], [100, 52], [100, 100], [30, 100]]],
      [[[0, 0], [36, 0], [28, 100], [0, 100]], [[36, 0], [70, 0], [62, 100], [28, 100]], [[70, 0], [100, 0], [100, 100], [62, 100]]],
      [[[0, 0], [46, 0], [52, 50], [0, 50]], [[46, 0], [100, 0], [100, 50], [52, 50]], [[0, 50], [100, 50], [100, 100], [0, 100]]],
      [[[0, 0], [62, 0], [62, 100], [0, 100]], [[62, 0], [100, 0], [100, 46], [62, 54]], [[62, 54], [100, 46], [100, 100], [62, 100]]],
    ],
    4: [
      [[[0, 0], [100, 0], [100, 40], [0, 46]], [[0, 46], [35, 43.9], [31, 100], [0, 100]], [[35, 43.9], [68, 41.9], [66, 100], [31, 100]], [[68, 41.9], [100, 40], [100, 100], [66, 100]]],
      [[[0, 0], [56, 0], [52, 48], [0, 52]], [[56, 0], [100, 0], [100, 44], [52, 48]], [[0, 52], [52, 48], [46, 100], [0, 100]], [[52, 48], [100, 44], [100, 100], [46, 100]]],
      [[[0, 0], [34, 0], [34, 100], [0, 100]], [[34, 0], [100, 0], [100, 50], [34, 50]], [[34, 50], [70, 50], [62, 100], [34, 100]], [[70, 50], [100, 50], [100, 100], [62, 100]]],
      [[[0, 0], [62, 0], [58, 47], [0, 47]], [[62, 0], [100, 0], [100, 47], [58, 47]], [[0, 47], [38, 47], [42, 100], [0, 100]], [[38, 47], [100, 47], [100, 100], [42, 100]]],
    ],
    5: [
      [[[0, 0], [34, 0], [30, 44], [0, 44]], [[34, 0], [100, 0], [100, 40], [30, 44]], [[0, 44], [33, 43.8], [30, 100], [0, 100]], [[33, 43.8], [67, 41.9], [64, 100], [30, 100]], [[67, 41.9], [100, 40], [100, 100], [64, 100]]],
      [[[0, 0], [30, 0], [26, 100], [0, 100]], [[30, 0], [64, 0], [62, 50], [28, 50]], [[64, 0], [100, 0], [100, 50], [62, 50]], [[28, 50], [62, 50], [60, 100], [26, 100]], [[62, 50], [100, 50], [100, 100], [60, 100]]],
    ],
  };
  const TALL = {
    1: [[R]],
    2: [
      [[[0, 0], [100, 0], [100, 44], [0, 54]], [[0, 54], [100, 44], [100, 100], [0, 100]]],
      [[[0, 0], [100, 0], [100, 58], [0, 50]], [[0, 50], [100, 58], [100, 100], [0, 100]]],
    ],
    3: [
      [[[0, 0], [100, 0], [100, 30], [0, 36]], [[0, 36], [100, 30], [100, 64], [0, 70]], [[0, 70], [100, 64], [100, 100], [0, 100]]],
      [[[0, 0], [100, 0], [100, 38], [0, 44]], [[0, 44], [54, 40.8], [48, 100], [0, 100]], [[54, 40.8], [100, 38], [100, 100], [48, 100]]],
      [[[0, 0], [52, 0], [46, 50.2], [0, 52]], [[52, 0], [100, 0], [100, 48], [46, 50.2]], [[0, 52], [100, 48], [100, 100], [0, 100]]],
    ],
    4: [
      [[[0, 0], [100, 0], [100, 26], [0, 30]], [[0, 30], [55, 27.8], [50, 62], [0, 64]], [[55, 27.8], [100, 26], [100, 60], [50, 62]], [[0, 64], [100, 60], [100, 100], [0, 100]]],
      [[[0, 0], [100, 0], [100, 22], [0, 27]], [[0, 27], [100, 22], [100, 50], [0, 52]], [[0, 52], [100, 50], [100, 74], [0, 78]], [[0, 78], [100, 74], [100, 100], [0, 100]]],
    ],
    5: [
      [[[0, 0], [100, 0], [100, 20], [0, 24]], [[0, 24], [100, 20], [100, 44], [0, 48]], [[0, 48], [52, 46.8], [48, 74], [0, 76]], [[52, 46.8], [100, 44], [100, 72], [48, 74]], [[0, 76], [100, 72], [100, 100], [0, 100]]],
    ],
  };

  /* ---------- geometry ---------- */
  function inset(poly, d) {
    const n = poly.length; let area = 0;
    for (let i = 0; i < n; i++) { const a = poly[i], b = poly[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
    const s = area > 0 ? 1 : -1;
    const lines = poly.map((p, i) => {
      const q = poly[(i + 1) % n]; let dx = q[0] - p[0], dy = q[1] - p[1]; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
      return [p[0] - dy * s * d, p[1] + dx * s * d, dx, dy];
    });
    return lines.map((l, i) => {
      const m = lines[(i + n - 1) % n];
      const cr = m[2] * l[3] - m[3] * l[2];
      if (Math.abs(cr) < 1e-9) return [l[0], l[1]];
      const t = ((l[0] - m[0]) * l[3] - (l[1] - m[1]) * l[2]) / cr;
      return [m[0] + t * m[2], m[1] + t * m[3]];
    });
  }
  const bbox = poly => { const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]); const x = Math.min(...xs), y = Math.min(...ys); return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }; };
  const clip = (poly, b) => `polygon(${poly.map(p => `${(p[0] - b.x).toFixed(1)}px ${(p[1] - b.y).toFixed(1)}px`).join(',')})`;
  const polyArea = poly => { let a = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a / 2); };

  /* ---------- drawn backgrounds ---------- */
  function focusLines(r, cx, cy, color, n = 84) {
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + r() * 0.07, rin = 26 + r() * 18, w = 0.35 + r() * 1.7;
      const ox = cx + Math.cos(a) * 130, oy = cy + Math.sin(a) * 130, ix = cx + Math.cos(a) * rin, iy = cy + Math.sin(a) * rin * 0.9;
      const px = -Math.sin(a) * w, py = Math.cos(a) * w;
      d += `M${(ox + px).toFixed(1)} ${(oy + py).toFixed(1)}L${ix.toFixed(1)} ${iy.toFixed(1)}L${(ox - px).toFixed(1)} ${(oy - py).toFixed(1)}Z`;
    }
    return `<svg class="pn-fl" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="${color}"/></svg>`;
  }
  function speedLines(r, color, ang = -8) {
    let d = '';
    for (let i = 0; i < 44; i++) {
      const y = r() * 110 - 5, x0 = r() * 50 - 30, len = 50 + r() * 90, w = 0.25 + r() * 0.9;
      d += `M${x0.toFixed(1)} ${y.toFixed(1)}L${(x0 + len).toFixed(1)} ${(y - w).toFixed(1)}L${(x0 + len).toFixed(1)} ${(y + w).toFixed(1)}Z`;
    }
    return `<svg class="pn-sl" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g transform="rotate(${ang} 50 50)"><path d="${d}" fill="${color}"/></g></svg>`;
  }
  const BUB = { round: { kx: 20, ky: 24 }, spiky: { kx: 26, ky: 36 }, cloud: { kx: 20, ky: 28 }, none: { kx: 0, ky: 0 } };
  function bubbleSvg(type, tail, r) {
    const st = 'vector-effect="non-scaling-stroke"';
    const open = '<svg class="pn-bsvg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">';
    if (type === 'spiky') {
      const N = 22, pts = [], ta = tail === 'l' ? Math.PI * 0.74 : Math.PI * 0.26;
      let best = -1, bd = 9;
      for (let i = 0; i < N * 2; i += 2) { const a = i / (N * 2) * Math.PI * 2; const dd = Math.abs(Math.atan2(Math.sin(a - ta), Math.cos(a - ta))); if (dd < bd) { bd = dd; best = i; } }
      for (let i = 0; i < N * 2; i++) {
        const a = i / (N * 2) * Math.PI * 2;
        let rr = i % 2 ? 0.76 + r() * 0.05 : 0.97 + r() * 0.07;
        if (tail && i === best) rr = 1.42;
        pts.push(`${(50 + Math.cos(a) * 50 * rr).toFixed(1)},${(50 + Math.sin(a) * 50 * rr).toFixed(1)}`);
      }
      return `${open}<polygon points="${pts.join(' ')}" fill="var(--bf)" stroke="var(--bs)" stroke-width="3" stroke-linejoin="miter" ${st}/></svg>`;
    }
    if (type === 'cloud') {
      const K = 14, cs = [];
      for (let k = 0; k < K; k++) { const a = k / K * Math.PI * 2 + r() * 0.1; cs.push([50 + Math.cos(a) * 41, 50 + Math.sin(a) * 39, 12 + r() * 4]); }
      const tx = tail === 'l' ? -1 : 1;
      const puffs = tail ? [[50 + tx * 26, 103, 5.5], [50 + tx * 36, 115, 3.6], [50 + tx * 42, 124, 2.4]] : [];
      const circ = (arr, s) => arr.map(([x, y, rr]) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rr.toFixed(1)}" ry="${(rr * 1.05).toFixed(1)}" ${s}/>`).join('');
      return `${open}<g fill="var(--bf)" stroke="var(--bs)" stroke-width="2.6" ${st}>${circ(cs, st)}${circ(puffs, st)}</g><g fill="var(--bf)">${circ(cs, '')}</g><ellipse cx="50" cy="50" rx="41" ry="39" fill="var(--bf)"/></svg>`;
    }
    const bx = tail === 'l' ? 32 : 68, tx = tail === 'l' ? 8 : 92;
    const tailS = tail ? `<path d="M${bx - 8} 86 L${tx} 126 L${bx + 8} 88 Z" fill="var(--bf)" stroke="var(--bs)" stroke-width="3" stroke-linejoin="round" ${st}/>` : '';
    const tailF = tail ? `<path d="M${bx - 6.2} 85 L${tx + (tail === 'l' ? 2.2 : -2.2)} 121 L${bx + 6.2} 87 Z" fill="var(--bf)"/>` : '';
    return `${open}${tailS}<ellipse cx="50" cy="50" rx="49" ry="48" fill="var(--bf)" stroke="var(--bs)" stroke-width="3" ${st}/>${tailF}</svg>`;
  }

  /* ---------- scene -> pages ---------- */
  function prepLines(scene) {
    let lines = (scene.lines || []).filter(L => L && (L.who ? L.text : L.narr));
    const party = SBR.run && SBR.run.party;
    if (party) {
      const inP = w => party.some(m => m.id === w);
      const f = lines.filter(L => !(L.who && (L.who === 'johnny' || L.who === 'gyro') && !inP(L.who)));
      if (f.length) lines = f;
    }
    return lines;
  }
  function paginate(lines, mobile, hasBg) {
    const cap = mobile ? 3 : 4;
    const weight = L => 1 + (textOf(L).length > 150 ? 0.7 : textOf(L).length > 105 ? 0.35 : 0);
    const total = lines.reduce((s, L) => s + weight(L), 0);
    const nPages = Math.max(1, Math.ceil(total / cap - 0.01));
    const pages = []; let cur = [], acc = 0; const per = total / nPages;
    lines.forEach((L, i) => {
      const w = weight(L);
      const left = lines.length - i;
      if (cur.length && (acc + w > per + 0.51 || cur.length >= cap) && pages.length < nPages - 1 && left >= 1) { pages.push(cur); cur = []; acc = 0; }
      cur.push(L); acc += w;
    });
    if (cur.length) pages.push(cur);
    // a lone line on the last page borrows from the one before
    if (pages.length > 1 && pages[pages.length - 1].length === 1 && pages[pages.length - 2].length > 2) pages[pages.length - 1].unshift(pages[pages.length - 2].pop());
    return pages.map((pg, pi) => {
      const cells = pg.map(L => ({ kind: L.who ? 'talk' : 'narr', L, c: classify(L) }));
      const first = cells[0];
      if (hasBg && (pi === 0 || cells.length === 1) && cells.length < cap && !(first.kind === 'narr' && !first.c.loud)) cells.unshift({ kind: 'silent' });
      return cells;
    });
  }

  /* ---------- playing ---------- */
  let last = null; // last scene seen by wants(): tells fightTalk when a story scene already opened the fight
  let bossSet = null;
  function bossScenes() {
    if (bossSet) return bossSet;
    const s = new Set();
    const addB = B => { if (!B) return; ['pre', 'post'].forEach(k => B[k] && s.add(B[k])); if (B.midRound) Object.values(B.midRound).forEach(v => s.add(v)); };
    Object.values(SBR.ACTS || {}).forEach(A => addB(A.boss));
    Object.values(SBR.LINEUPS || {}).forEach(L => (L || []).forEach(v => addB(v.boss)));
    Object.entries(SBR.STORY || {}).forEach(([id, sc]) => { if (sc && sc.fight && (sc.fight.boss || sc.fight.elite)) { s.add(id); if (sc.fight.midRound) Object.values(sc.fight.midRound).forEach(v => s.add(v)); } });
    ['knight_post', 'sand_parley_post'].forEach(id => s.add(id));
    return (bossSet = s);
  }
  function wants(id, scene) {
    last = { id, t: Date.now() };
    if (set().panels === false || !scene) return false;
    if (scene.panels === false) return false;
    return !!scene.panels || /^ft_/.test(id) || bossScenes().has(id);
  }

  function play(id, scene) {
    return new Promise(resolve => {
      const lines = prepLines(scene);
      if (!lines.length) return resolve();
      const scene_ = scene;
      const $ov = document.getElementById('overlay') || document.body;
      const act = scene.bg || (SBR.run && SBR.run.act) || 1;
      const wrap = document.createElement('div');
      wrap.className = 'dlg-wrap panels-wrap' + (reduced() ? ' pn-still' : '');
      wrap.style.setProperty('--pn-spd', speed());
      wrap.innerHTML = `<div class="pn-back">${SBR.art.scene(act, { still: true })}</div>
        <div class="pn-sheet"><div class="pn-page"></div><div class="pn-bubbles"></div><div class="pn-folio"></div><div class="pn-next" aria-hidden="true">▶</div></div>
        <button class="pn-skip" type="button" title="Skip (Esc)">Skip ▸▸</button>`;
      $ov.appendChild(wrap);
      const sheet = wrap.querySelector('.pn-sheet'), pageEl = wrap.querySelector('.pn-page'), bubEl = wrap.querySelector('.pn-bubbles');
      const folio = wrap.querySelector('.pn-folio');
      const mobile = () => pageEl.clientWidth < pageEl.clientHeight * 0.9 || pageEl.clientWidth < 620;
      const pages = paginate(lines, mobile(), true);
      let pi = -1, timers = [], revealing = false, done = false, tplPrev = null;
      const sides = {}; const seen = new Set();
      requestAnimationFrame(() => wrap.classList.add('show'));

      function clearTimers() { timers.forEach(clearTimeout); timers = []; }
      function later(fn, ms) { if (reduced()) { fn(); return; } timers.push(setTimeout(fn, ms / speed())); }

      function chooseTpl(cells, W, H, tall, seed) {
        const lib = (tall ? TALL : WIDE)[Math.min(5, cells.length)];
        const r = rng(seed);
        let best = null, bs = -1e9;
        lib.forEach((t, ti) => {
          const px = t.map(p => p.map(([x, y]) => [x / 100 * W, y / 100 * H]));
          const areas = px.map(polyArea); const bi = areas.indexOf(Math.max(...areas));
          let sc = r() * 0.8;
          cells.forEach((c, i) => { if (c.c && c.c.intense && i === bi) sc += 2; });
          const b0 = bbox(px[0]);
          if (cells[0].kind !== 'talk' && b0.w / b0.h > 1.7) sc += 1.4;
          if (cells[0].kind === 'talk' && b0.w / b0.h > 2.4) sc -= 0.6;
          if (tplPrev === cells.length + ':' + ti) sc -= 1.2;
          if (sc > bs) { bs = sc; best = { t: px, key: cells.length + ':' + ti }; }
        });
        return best;
      }

      function sideOf(who) {
        if (sides[who]) return sides[who];
        const party = !!SBR.CHARS[who] && who !== 'lucy' && who !== 'steven';
        sides[who] = party ? 'l' : 'r';
        return sides[who];
      }

      function render(animate) {
        clearTimers();
        pageEl.innerHTML = ''; bubEl.innerHTML = '';
        const W = pageEl.clientWidth, H = pageEl.clientHeight;
        const tall = W < H * 0.9;
        const small = W < 620;
        const g = small ? 7 : 11, key = small ? 2 : 3;
        const cells = pages[pi];
        const T = chooseTpl(cells, W, H, tall, id + ':' + pi);
        tplPrev = T.key;
        const r = rng(id + ':p' + pi);
        const items = [];
        cells.forEach((cell, i) => {
          const outer = inset(T.t[i], g / 2), inner = inset(T.t[i], g / 2 + key);
          const el = buildCell(cell, outer, inner, r, small, i);
          pageEl.appendChild(el.node);
          items.push(el);
          if (el.inset) { pageEl.appendChild(el.inset.node); items.push(el.inset); }
        });
        folio.textContent = pages.length > 1 ? `${pi + 1} / ${pages.length}` : '';
        // bubbles after layout
        items.forEach(it => { if (it.bubble) { bubEl.appendChild(it.bubble); fitBubble(it); } });
        wrap.classList.remove('pn-ready');
        if (!animate || reduced()) { items.forEach(it => { it.node.classList.add('in'); if (it.bubble) it.bubble.classList.add('in'); }); revealing = false; wrap.classList.add('pn-ready'); return; }
        revealing = true;
        const step = 430;
        items.forEach((it, k) => {
          const t0 = 40 + k * step * (it.isInset ? 0.6 : 1);
          later(() => {
            it.node.classList.add('in');
            if (it.cell && it.cell.c) {
              if (it.cell.c.menace) SBR.audio.play('menace');
              else if (it.cell.c.loud) { SBR.audio.play('success'); if (set().shake) { sheet.classList.remove('pn-shake'); void sheet.offsetWidth; sheet.classList.add('pn-shake'); } }
            }
          }, t0);
          if (it.bubble) later(() => it.bubble.classList.add('in'), t0 + 170);
        });
        later(() => { revealing = false; wrap.classList.add('pn-ready'); }, 40 + items.length * step + 200);
      }
      function revealAll() {
        clearTimers();
        pageEl.querySelectorAll('.pn-cell').forEach(n => n.classList.add('in'));
        bubEl.querySelectorAll('.pn-bub').forEach(n => n.classList.add('in'));
        revealing = false; wrap.classList.add('pn-ready');
      }

      function buildCell(cell, outer, inner, r, small, idx) {
        const b = bbox(outer), bi = bbox(inner);
        const node = document.createElement('div');
        node.className = 'pn-cell pn-' + cell.kind + (idx % 2 ? ' odd' : '');
        Object.assign(node.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px' });
        const ix = bi.x - b.x, iy = bi.y - b.y, cw = bi.w, ch = bi.h;
        const inClip = clip(inner, { x: b.x + 0, y: b.y + 0 });
        const aspect = cw / Math.max(1, ch);
        let body = '', bubble = null, insetCell = null;
        const who = cell.L && cell.L.who;
        const I = who ? info(who) : null;
        const color = I ? I.color : '#c8b89a';
        node.style.setProperty('--c', color);
        const c = cell.c || {};
        const t = cell.L ? textOf(cell.L) : '';
        const scene = act => `<div class="pn-scene">${SBR.art.scene(act, { still: true })}</div>`;
        const sfxHtml = (txt, cls, x, y, size, rot) => {
          const n = [...txt].length, vert = cls === 'menace';
          size = Math.min(size, vert ? ch * (aspect < 0.9 ? 0.42 : 0.72) / n : cw * 0.8 / (n * 1.05));
          const ext = vert ? [size * (1 + n * 0.32), size * n * 0.92] : [size * n * 1.05, size];
          const mx = cw * 0.1 + 4; x = Math.max(mx, Math.min(cw - ext[0] - mx, x)); y = Math.max(6, Math.min(ch - ext[1] - 6, y));
          return sfxRaw(txt, cls, x, y, size, rot);
        };
        const sfxRaw = (txt, cls, x, y, size, rot) => `<div class="pn-sfx ${cls}" style="left:${x}px;top:${y}px;font-size:${size}px;--rot:${rot}deg">${[...txt].map((ch2, k) => `<span style="--k:${k}">${ch2 === ' ' ? '&nbsp;' : ch2}</span>`).join('')}</div>`;
        const sfxSize = Math.max(26, Math.min(small ? 64 : 110, Math.min(cw, ch) * 0.3));

        if (cell.kind === 'silent') {
          const kana = AMBIENT[act] || 'ヒュウウ';
          body = `${scene(act)}<div class="pn-wash"></div><div class="pn-tone"></div>${sfxHtml(kana, 'amb', cw * 0.62, ch * 0.18, sfxSize * 0.8, -8)}`;
          node.classList.add('bg-scene');
        } else if (cell.kind === 'narr') {
          const standK = (NARR_STAND.find(([re]) => re.test(t)) || [])[1];
          const hasStand = standK && SBR.stands.DEFS[standK];
          if (c.loud) {
            node.classList.add('bg-burst');
            body = `<div class="pn-bgc"></div>${focusLines(r, 50, 50, INK)}${hasStand ? `<div class="pn-stand solo">${SBR.stands.svg(standK)}</div>` : ''}${sfxHtml(sfxFor(c, t) || 'ドンッ', 'loud', cw * 0.08, ch * 0.62, sfxSize, -10)}`;
          } else if (c.menace) {
            node.classList.add('bg-scene', 'dark');
            body = `${scene(act)}<div class="pn-wash"></div><div class="pn-tone"></div>${sfxHtml('ゴゴゴゴ', 'menace', cw * 0.74, ch * 0.2, sfxSize, 8)}`;
          } else if (aspect > 1.25 || idx === 0) {
            node.classList.add('bg-scene');
            body = `${scene(act)}<div class="pn-wash"></div><div class="pn-tone"></div>`;
          } else {
            node.classList.add('bg-paper');
            body = `<div class="pn-bgc"></div>${speedLines(r, 'rgba(18,10,24,.55)', -4)}<div class="pn-tone"></div>`;
          }
          bubble = caption(t, c, cw, ch, bi, small);
        } else {
          // speech / thought
          const side = sideOf(who);
          const fx = side === 'l' ? 32 : 68;
          node.style.setProperty('--fx', fx + '%');
          const first = !seen.has(who); seen.add(who);
          const big = cw * ch > pageEl.clientWidth * pageEl.clientHeight * 0.26;
          let mode = 'bust', showStand = false;
          if (c.intense) {
            if (I.stand && (big || first || r() < 0.5)) { mode = 'bust'; showStand = true; }
            else mode = aspect >= 1.6 ? 'eyes' : 'face';
          } else if (I.stand && first && !SBR.CHARS[who]) showStand = true;
          if (c.think) mode = aspect >= 2 ? 'face' : 'bust';
          // background
          let bg;
          if (c.think) { node.classList.add('bg-soft'); bg = `<div class="pn-bgc"></div><div class="pn-tone big"></div>`; }
          else if (c.menace) { node.classList.add('bg-dark'); bg = `<div class="pn-bgc"></div>${focusLines(r, fx, 44, 'rgba(255,255,255,.62)')}<div class="pn-tone"></div>`; }
          else if (c.intense) { node.classList.add('bg-burst'); bg = `<div class="pn-bgc"></div>${focusLines(r, fx, 44, INK)}`; }
          else if (scene_.mid || r() < 0.3) { node.classList.add('bg-wash'); bg = `<div class="pn-bgc"></div>${speedLines(r, 'rgba(255,255,255,.55)', side === 'l' ? -9 : 9)}<div class="pn-tone"></div>`; }
          else { node.classList.add('bg-wash'); bg = `<div class="pn-bgc"></div><div class="pn-tone"></div>`; }
          // figure
          let fig, figBox;
          if (mode === 'eyes') {
            figBox = { x: 0, y: 0, w: cw, h: ch };
            fig = cutout(I.art, '16 39 68 26', 'xMidYMid slice');
          } else if (mode === 'face') {
            const w = aspect < 0.9 ? cw : Math.min(cw * 0.5, Math.max(cw * 0.42, ch * 0.95));
            figBox = { x: side === 'l' ? 0 : cw - w, y: 0, w, h: ch };
            fig = cutout(I.art, '14 20 72 70', 'xMidYMid slice');
          } else {
            let h = ch * 1.04, w = h * 100 / 110;
            const maxW = cw * (aspect < 0.85 ? 0.95 : aspect < 1.3 ? 0.58 : 0.5);
            if (w > maxW) { w = maxW; h = w * 110 / 100; }
            figBox = { x: side === 'l' ? cw * 0.03 : cw - w - cw * 0.03, y: ch - h + ch * 0.02, w, h };
            fig = cutout(I.art, '0 10 100 110', 'xMidYMax meet');
          }
          let stand = '';
          if (showStand) {
            const sw = Math.min(cw * 0.7, figBox.w * 1.25), sh = sw * 160 / 120;
            const sx = side === 'l' ? figBox.x + figBox.w * 0.42 : figBox.x + figBox.w * 0.58 - sw;
            stand = `<div class="pn-stand" style="left:${sx}px;top:${Math.max(-sh * 0.12, ch - sh * 0.98)}px;width:${sw}px;height:${sh}px">${SBR.stands.svg(I.stand)}</div>`;
          }
          const sfx = !c.think && sfxFor(c, t);
          const narrowP = aspect < 0.9;
          const sfxX = c.menace ? (side === 'l' ? cw * 0.7 : cw * 0.05) : (side === 'l' ? cw * 0.04 : cw * 0.55);
          const sfxY = (mode === 'face' || mode === 'eyes') && !c.menace ? ch * 0.8 : narrowP ? ch * 0.66 : ch * (c.menace ? 0.3 : 0.64);
          body = `${bg}${stand}<div class="pn-fig ${mode} ${c.think ? 'think' : ''}" style="left:${figBox.x}px;top:${figBox.y}px;width:${figBox.w}px;height:${figBox.h}px">${fig}</div>${sfx ? sfxHtml(sfx, c.menace ? 'menace' : c.angry ? 'angry' : 'loud', sfxX, sfxY, sfxSize, side === 'l' ? 9 : -9) : ''}`;
          bubble = speech(I, t, c, side, cw, ch, bi, small, r);
          // inset close-up on the eyes for a big dramatic panel
          if (c.intense && mode === 'bust' && big && !small) {
            const iw = Math.min(cw * 0.34, 260), ih = Math.min(ch * 0.24, iw * 0.42);
            const ixp = side === 'l' ? bi.x + cw - iw - 14 : bi.x + 14, iyp = bi.y + ch - ih - (side === 'l' ? 48 : 14);
            const sk = 4;
            const poly = [[ixp, iyp + sk], [ixp + iw, iyp], [ixp + iw, iyp + ih - sk], [ixp, iyp + ih]];
            insetCell = buildInset(I, poly, small, side);
          }
        }
        node.innerHTML = `<div class="pn-key"></div><div class="pn-in" style="clip-path:${inClip}"><div class="pn-inbox" style="left:${ix}px;top:${iy}px;width:${cw}px;height:${ch}px">${body}</div></div>`;
        node.querySelector('.pn-key').style.clipPath = clip(outer, b);
        return { node, bubble, cell, box: bi, inset: insetCell };
      }
      function buildInset(I, poly, small, side) {
        const outer = inset(poly, -5), b = bbox(outer), inner = poly, bi = bbox(inner);
        const node = document.createElement('div');
        node.className = 'pn-cell pn-insetcell';
        node.style.setProperty('--c', I.color);
        Object.assign(node.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px' });
        const keyP = inset(poly, -2);
        node.innerHTML = `<div class="pn-ink" style="clip-path:${clip(outer, b)}"></div><div class="pn-key" style="clip-path:${clip(keyP, b)}"></div>
          <div class="pn-in" style="clip-path:${clip(inner, b)}"><div class="pn-inbox" style="left:${bi.x - b.x}px;top:${bi.y - b.y}px;width:${bi.w}px;height:${bi.h}px">
          <div class="pn-bgc dark"></div><div class="pn-fig eyes" style="left:0;top:0;width:100%;height:100%">${cutout(I.art, '18 42 64 18', 'xMidYMid slice')}</div></div></div>`;
        return { node, isInset: true };
      }
      function speech(I, t, c, side, cw, ch, bi, small, r) {
        const type = c.think ? 'cloud' : c.loud ? 'spiky' : 'round';
        const el = document.createElement('div');
        el.className = `pn-bub ${type}${c.menace ? ' dark' : ''}${c.angry ? ' angry' : ''}`;
        el.style.setProperty('--c', I.color);
        const txt = c.think ? t.trim().replace(/^\(/, '').replace(/\)$/, '') : t;
        const tail = side === 'l' ? 'l' : 'r';
        el.innerHTML = `${bubbleSvg(type, tail, r)}<span class="pn-nm">${esc(I.name)}</span><span class="pn-tx">${esc(txt)}</span>`;
        el._fit = { type, side, cw, ch, bi, small, base: small ? 13 : 17, mul: c.loud ? 1.12 : 1 };
        return el;
      }
      function caption(t, c, cw, ch, bi, small) {
        const el = document.createElement('div');
        el.className = 'pn-bub pn-cap' + (c.loud ? ' loud' : '') + (c.menace ? ' dark' : '');
        el.innerHTML = `<span class="pn-tx">${esc(t)}</span>`;
        el._fit = { type: 'none', cap: true, loud: c.loud, cw, ch, bi, small, base: small ? 12.5 : 16, mul: c.loud ? 1.5 : 1 };
        return el;
      }
      function fitBubble(it) {
        const el = it.bubble, F = el._fit, bi = F.bi;
        const k = BUB[F.type];
        const Wp = pageEl.clientWidth, Hp = pageEl.clientHeight;
        let fs = F.base * F.mul;
        const narrow = F.cw / F.ch < 0.9;
        const vis = 1 + 2 * k.kx / 100;
        const maxWfrac = F.cap ? (F.loud ? 0.86 : 0.78) : (narrow ? 0.9 : 0.54);
        let w = Math.max(F.small ? 110 : 140, Math.min(F.cw * maxWfrac / vis, F.cap ? 520 : 380));
        const wCap = F.cap ? w : Math.min(F.cw * (narrow ? 0.96 : 0.7) / vis, 440);
        const fitsH = () => el.offsetHeight * (1 + 2 * k.ky / 100) <= F.ch * (F.cap ? 0.9 : 0.78);
        const apply = () => { el.style.fontSize = fs + 'px'; el.style.width = w + 'px'; };
        apply();
        let guard = 0;
        while (!fitsH() && guard++ < 40) {
          if (w + 16 <= wCap) w += 16;
          else if (fs > (F.small ? 9.5 : 11)) fs -= 0.75;
          else break;
          apply();
        }
        // shrink width to the text when short
        const h = el.offsetHeight;
        const ox = w * k.kx / 100, oy = h * k.ky / 100;
        const pad = F.small ? 6 : 10;
        let x, y;
        if (F.cap) {
          if (F.loud) { x = bi.x + (F.cw - w) / 2; y = bi.y + (F.ch - h) * 0.4; }
          else { x = bi.x + pad; y = bi.y + pad; }
        } else {
          x = F.side === 'l' ? bi.x + F.cw - w - ox - pad : bi.x + ox + pad;
          y = bi.y + oy + pad;
          if (F.cw / F.ch < 0.9) x = bi.x + (F.cw - w) / 2 + (F.side === 'l' ? ox * 0.4 : -ox * 0.4);
        }
        x = Math.max(ox + 2, Math.min(Wp - w - ox - 2, x));
        y = Math.max(oy + 2, Math.min(Hp - h - oy - 2, y));
        el.style.left = x + 'px'; el.style.top = y + 'px';
      }

      function next() {
        if (done) return;
        if (revealing) return revealAll();
        pi++;
        if (pi >= pages.length) return finish();
        SBR.audio.play('page');
        if (pi > 0 && !reduced()) {
          sheet.classList.add('turn');
          timers.push(setTimeout(() => { sheet.classList.remove('turn'); render(true); }, 170 / speed()));
        } else render(true);
      }
      function finish() {
        if (done) return; done = true;
        clearTimers();
        document.removeEventListener('keydown', onKey, true);
        window.removeEventListener('resize', onResize);
        wrap.classList.remove('show');
        setTimeout(() => { wrap.remove(); resolve(); }, reduced() ? 0 : 260);
      }
      function onKey(e) {
        if (!wrap.isConnected) { done = true; document.removeEventListener('keydown', onKey, true); window.removeEventListener('resize', onResize); resolve(); return; }
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); next(); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(); }
      }
      let rt = null;
      function onResize() { clearTimeout(rt); rt = setTimeout(() => { if (!done && pi >= 0 && wrap.isConnected) render(false); }, 120); }
      wrap.addEventListener('click', e => { if (e.target.closest('.pn-skip')) { SBR.audio.play('click'); finish(); return; } next(); });
      wrap.addEventListener('keydown', onKey);
      document.addEventListener('keydown', onKey, true);
      window.addEventListener('resize', onResize);
      next();
    });
  }

  return { wants, play, info, _last: () => last, _bossScenes: bossScenes };
})();

/* ============================================================================================
   Fight talk: lines before, during and after fights.
   Each line spec is one of:
     ['who', 'text', mood?]      a fixed speaker (party members only speak if they ride with you)
     ['>', 'narration', mood?]
     [{ johnny, gyro, mountaintim, hotpants, custom, sukuna, wekapipo, diego, lucy, pocoloco, any }, mood?]
                                 a reply: the lead answers if they have a line, else the first party member who does, else `any` (spoken by the lead)
   '{L}' in a text becomes the lead's short name.
   ============================================================================================ */
(() => {
  const S = SBR.STORY;
  const run = () => SBR.run;
  const party = () => (run() && run().party ? run().party.map(m => m.id) : ['johnny', 'gyro']);
  const lead = () => (run() && run().lead) || 'johnny';
  const shortOf = id => (SBR.CHARS[id] && SBR.CHARS[id].short) || id;
  const fill = s => String(typeof s === 'function' ? s() : s).replace(/\{L\}/g, shortOf(lead()));
  const AL = { j: 'johnny', g: 'gyro', t: 'mountaintim', h: 'hotpants', c: 'custom', s: 'sukuna', w: 'wekapipo', d: 'diego', l: 'lucy', p: 'pocoloco' };

  function resolve(spec, forStatic) {
    const P = forStatic ? [] : party();
    const ld = forStatic ? null : lead();
    const out = [];
    spec.forEach(item => {
      const [a, b, c] = item;
      if (a === '>') { out.push(c ? { narr: fill(b), mood: c } : { narr: fill(b) }); return; }
      if (typeof a === 'string') {
        if (SBR.CHARS[a] && !P.includes(a)) return;
        out.push(c ? { who: a, text: fill(b), mood: c } : { who: a, text: fill(b) });
        return;
      }
      if (forStatic) return;
      const map = {}; Object.entries(a).forEach(([k, v]) => { map[AL[k] || k] = v; });
      const order = [ld].concat(P.filter(id => id !== ld));
      const who = order.find(id => map[id] != null);
      const speaker = who || (map.any != null ? ld : null);
      if (!speaker) return;
      const txt = who ? map[who] : map.any;
      out.push(b ? { who: speaker, text: fill(txt), mood: b } : { who: speaker, text: fill(txt) });
    });
    return out;
  }
  function scene(id, spec, extra = {}) {
    const lines = resolve(spec, true);
    const sc = Object.assign({ panels: true, lines: lines.length ? lines : [{ narr: '...' }], variants: () => { const v = resolve(spec, false); return v.length ? v : null; } }, extra);
    Object.defineProperty(sc, 'bg', { enumerable: true, get: () => (SBR.run && SBR.run.act) || 1 });
    S[id] = sc;
  }

  /* ---------------- the talk ---------------- */
  const T = {
    /* ---- act bosses (their own pre/post scenes already play; these add mid-fight pages) ---- */
    boom: { mid: {
      3: [['>', 'Every nail and horseshoe in the dunes lifts at once. The whole desert is pulling toward them.', 'menace'],
        ['benjamin', 'Magnetism is the family trade, boys. Pull them INTO the iron!', 'shout'],
        [{ j: 'My blood... it\'s being dragged toward the sand. Gyro, don\'t stand next to me!', g: 'Spread out! If two of us touch, the magnet drags us both down!', t: 'My rope\'s coming apart in their pull. Spread out!', any: 'Spread out! Don\'t let them pull us together!' }]] } },
    robinson_boss: { mid: {
      3: [['robinson_boss', 'Hear that buzzing, amigo? That\'s the hive. It\'s already in your ears.', 'menace'],
        [{ g: 'Burn the cacti! The swarm is feeding on them!', j: '(He aims with his eyes... if I can see where he\'s looking, I can shoot first.)', any: 'Burn the cacti! He\'s growing the swarm off them!' }]] } },
    ferdinand: { mid: {
      2: [['ferdinand', 'Do you feel it? Your spine lengthening. Your teeth sharpening. Return to nature.', 'menace'],
        [{ j: '(My hands are turning to scales... I have to finish this before I forget how to think.)', g: 'Oi, Johnny, your face is changing. Don\'t let it reach your head!', h: 'The Left Arm protects whoever carries it. Stay close to the Corpse!', s: 'A lizard curse? Cute. I have eaten worse than dinosaurs.', any: '(My skin is turning to scales. I need to end this fast.)' }]],
      4: [['ferdinand', 'This land doesn\'t belong to your railroads or your race! It belongs to the BEASTS!', 'shout']] } },
    oyecomova_boss: { mid: {
      2: [['oyecomova_boss', 'Tick... tick... can you hear it, Zeppeli? That is the rhythm of Naples!', 'menace'],
        [{ g: 'Brace and pull the pins out! Don\'t let him finish the song!', any: 'Brace! Pull the pins before they go off!' }]],
      4: [['oyecomova_boss', 'CRESCENDO! The whole village sings at once!', 'shout']] } },
    sandman: { mid: {
      3: [['sandman', 'Shhh. DOGOOON. A sound, stamped onto you. Take one step and it takes you.', 'menace'],
        [{ j: '(The sounds are written on us like letters. If we move, they cut. If we don\'t, he wins.)', g: 'The sound travels through what it touches. Spin something that isn\'t touching it, Johnny!', any: '(A sound that cuts... whatever I do, I do it once and I do it right.)' }]],
      5: [['sandman', 'I ran here from Arizona for my people. You ride for money. Do you understand the difference?', 'angry']] } },
    ringo: { mid: {
      2: [['ringo', 'You are still on the path of the inferior. Hesitation. Anger. They make a man slow.'],
        [{ g: 'I\'m not hesitating, Ringo. I\'m listening to my own will.', j: '(Gyro is deciding this with his own will. I can\'t interfere.)', any: 'We didn\'t ride this far to be judged by a pocket watch!' }]],
      3: [['>', 'Tick. The second hand turns back. Six seconds, undone.', 'menace'],
        ['ringo', 'MANDOM! Every wound you gave me, returned. Draw again, if you still have the resolve!', 'shout'],
        [{ g: 'Six seconds. Then I strike in the first one.', any: 'Right after the rewind: hit him NOW!' }]] } },
    blackmore: { mid: {
      2: [['blackmore', 'Sumimasen... every drop you walk through is a blade. Please, keep walking.', 'menace']],
      3: [['>', 'Steam hisses where the rotation cuts through the rain.'],
        ['blackmore', 'The raindrops... they are evaporating?! Sumimasen... SUMIMASEN!', 'shout'],
        [{ g: 'Nyo-ho! Rotation boils rain, Blackmore. Your umbrella has holes in it now!', j: 'His veil is breaking! The Spin gets through!', any: 'The rain veil is breaking! Hit him with Spin!' }]] } },
    weka: { mid: {
      2: [['magent', 'While I kneel, NOTHING can touch me! Twentieth Century BOY! Hahaha!', 'shout'],
        [{ g: 'Leave the kneeling idiot. Wekapipo is the real threat.', any: 'He can\'t attack while he\'s kneeling. Ignore him!' }]],
      3: [['wekapipo_foe', 'Look to your left. ...You can\'t, can you? That is the Wrecking Ball.', 'menace']] },
      pre: [['wekapipo_foe', 'I was exiled for a crime I did not commit. The President promised me a home. For that, I will break you.'],
        [{ g: 'Wekapipo. You\'re from Naples. You know my family.', any: 'We\'re not your enemy!' }]],
      post: [['wekapipo_foe', '...The Zeppeli spin. So it\'s true. I was fighting on the wrong side.']] },
    axl: {
      pre: [['axl', 'Everyone carries something they abandoned. Let me return it to you.', 'menace'],
        [{ h: 'Axl RO. I know what you are. I came here to end it.', any: 'Get away from us, priest.' }]],
      mid: {
        2: [['axl', 'Look behind you. That is the one you abandoned. Do you recognise the face?', 'menace'],
          [{ j: '(Nicholas... no. Not him. Not now.)', g: '(Marco... I left him in that cell. That sin is mine to carry, not yours.)', h: '(My brother... the bear... I ran. I RAN.)', t: '(...the ones I couldn\'t save in Arizona.)', c: '(I know that face. I left it behind a long time ago.)', s: 'Sin? I devoured a thousand of your sins before breakfast. Try harder.', any: '(I know that face...)' }]],
        4: [['axl', 'The sin never dies. It only moves. When I fall, it will find the one who killed me.', 'menace'],
          [{ h: 'Then I\'ll carry it. I\'ve carried worse.', any: 'Then I\'ll carry it. Draw, Axl!' }]] },
      post: [['axl', '...Thank you. It was so heavy.'], ['>', 'Axl RO\'s ghosts fade with him, one by one.']] },
    valentine1: { mid: {
      2: [['>', 'A flag flutters between two worlds. DOJYAAAN~', 'menace'],
        ['valentine1', 'Did you truly think there was only one of me? Kill a copy and another Valentine steps through.'],
        [{ j: 'Kill the copies first! As long as they live, they take his hits!', g: 'Copies first, Johnny. He\'s hiding behind himself.', any: 'The copies are taking his hits. Clear them out!' }]],
      4: [['valentine1', 'I took the first napkin! Everything at this table belongs to me. THAT is what a nation is!', 'shout']] } },
    lovetrain: { mid: {
      2: [['lovetrain', 'You feel it, don\'t you? Your bullets never arrive. Somewhere in the world, a stranger pays for them.', 'menace'],
        [{ j: '(The light sends every attack somewhere else. Only the infinite rotation can cross it.)', g: 'Perfect rotation, Johnny. Nothing less gets through that wall of light.', any: 'Only a perfect rotation can pierce the light!' }]],
      4: [['lovetrain', 'All misfortune flows elsewhere! I am protected by the light itself!', 'shout'],
        [{ j: 'Then I\'ll send it back to you. TUSK ACT4!', any: 'Then we\'ll spin until it breaks!' }, 'shout']] } },
    diego_world: { mid: {
      2: [['diego_world', 'Muda. MUDA! You\'re a step behind, Joestar. You always were.', 'angry']],
      3: [['>', 'The world turns grey. The river stops in mid-splash.', 'menace'], ['diego_world', 'THE WORLD! Toki wo tomare!', 'shout']],
      5: [['diego_world', 'I crawled out of the gutter in my world too. I will NOT crawl again!', 'angry'],
        [{ j: 'Then stand still, Diego. Tusk ACT4 doesn\'t care about time.', any: 'Then stand still and take it!' }]] } },

    /* ---- detour bosses (no scenes of their own) ---- */
    palm_echo: {
      pre: [['>', 'The sand folds inward like a closing hand. At its centre stands something wearing the shape of every rider it swallowed.', 'menace'],
        ['palm_echo', 'You came looking for a Stand. The Palm decides what you are given... and what you are not.'],
        [{ t: 'I\'ve stood here before. It gave me my rope, and it took my partner.', j: '(Is this where Tusk came from?)', g: 'Don\'t listen to it. Read it. It changes every round, so we change with it.', s: 'A cursed patch of sand deciding things about me? How quaint.', any: 'It changes every round. Watch what it resists!' }]],
      mid: { 3: [['palm_echo', 'Shifting... shifting... what will you be when the sand is finished with you?', 'menace']] },
      post: [['>', 'The hand of sand opens and lets go. The wind carries the echo away, one grain at a time.'],
        [{ t: 'The Palm doesn\'t give things back. It just stops taking.', any: 'The Palm let us go. For now.' }]] },
    fossil_colossus: {
      pre: [['>', 'The mine shaft breathes. The bones in the walls turn to look at the lamp.', 'menace'], ['fossil_colossus', 'GRRROOOOOHHH!', 'shout'],
        [{ d: 'A remnant of Scary Monsters. That beast was infected long after it died.', g: 'A dead bear, dinosaurified. Dinosaurs hate the cold, and they hate the Spin.', any: 'It\'s a skeleton! Something made the bones get up!' }]],
      mid: { 2: [['>', 'KRAKK. A raptor tears itself out of the rock wall.', 'menace'], [{ any: 'There are more of them in the walls! Take the big one down before the whole mine wakes up!' }]] },
      post: [['>', 'The colossus collapses into a heap of ordinary bones. The walls are quiet.'], [{ any: 'Just bones again. Let\'s take the silver and get out of this hole.' }]] },
    wolf_alpha: {
      pre: [['>', 'The ice groans. Eyes in the snow, dozens of them. One pair sits higher than the rest.', 'menace'], ['wolf_alpha', 'AROOOOOOO!', 'shout'],
        [{ t: 'Easy... a pack follows its leader. Put the white one down and the rest scatter.', j: '(The cold doesn\'t touch it at all...)', any: 'The white one leads. Everything else follows it.' }]],
      mid: { 3: [['wolf_alpha', 'GRRRRR...', 'angry'], ['>', 'The pack circles tighter. The alpha waits for the ice to crack.', 'menace']] },
      post: [['>', 'The White Alpha lies still in the snow. Far off, the pack howls and moves on without it.']] },
    tattoo_boss: {
      pre: [['>', 'Eleven men step into the rail car. They breathe in one rhythm.', 'menace'], ['tattoo_boss', 'Hit one of us and you hit a stranger. There is always another body.'],
        [{ w: 'Tattoo You! The President\'s old unit. They were never eleven men. They are one.', g: 'They pass wounds between each other. Cut the soldiers down first.', any: 'Take down the soldiers first. Then the leader has nowhere to hide!' }]],
      mid: { 2: [['tattoo_boss', 'Swap. Swap. Which face was the one you stabbed?', 'menace']] },
      post: [['tattoo_boss', 'Eleven men... one... left...'], ['>', 'The last tattoo fades from the last arm. The car rolls on in silence.']] },

    /* ---- elites and encounters ---- */
    diego_rival: {
      pre: [['>', 'Dust at your heels. Something is running beside the horses on two legs.', 'menace'],
        ['diego_rival', 'The best way to win a race is to make sure nobody else finishes it. WRYYY!', 'shout'],
        [{ j: 'Diego! You\'d infect the whole trail just to take first place?', g: 'Dio. You smell like a lizard, you know that?', h: 'Dio Brando. So you\'re the President\'s dog now?', t: 'Brando. I saw what you did to those horses in Arizona.', c: 'So you\'re the famous Dio. I expected someone taller.', s: 'A little dinosaur. Adorable. Come here, lizard.', any: 'Diego!' }]],
      mid: { 2: [['diego_rival', 'Watch my eyes. Dinosaurs only see what moves. So... don\'t move. Heh.', 'menace'],
        [{ g: 'Freeze, Johnny! Raptors hunt by motion!', any: 'Don\'t move! They hunt by motion!' }]] },
      post: [['diego_rival', 'Tch... you got lucky. The race isn\'t over, and neither am I.', 'angry'], ['>', 'Diego vaults onto Silver Bullet and is gone in a cloud of dust.']] },
    oyecomova: {
      pre: [['>', 'A doorknob. A fence post. A pebble on the road. Every one has a tiny pin pressed into it.', 'menace'],
        ['oyecomova', 'Naples will hear this! Zeppeli... can you hear my rhythm?'],
        [{ g: 'Oyecomova. You tried to kill the King\'s men, and now you want his executioner. Get in line.', any: 'Don\'t touch anything! It\'s all rigged!' }]],
      mid: { 2: [['oyecomova', 'Tick, tick, BOOM! Boku no rhythm wo kiitekure!', 'shout']] },
      post: [['oyecomova', 'You... are still... the King\'s dog...'],
        [{ g: 'Maybe. But the boy I ride for is nobody\'s dog. Think about that in prison.', any: 'Tie him up. Carefully. He might still have pins on him.' }]] },
    porkpie: {
      pre: [['>', 'A fishing line glints across the canyon. The rocks themselves are giggling.', 'menace'],
        ['porkpie', 'Hooks in the rock, hooks in your mouth! Reel, reel, REEL!', 'shout'],
        [{ g: 'He\'s inside the stone! Follow the wire, Johnny, and scan him out!', any: 'He\'s hiding in the rocks! Find the wire!' }]],
      mid: { 2: [['porkpie', 'Hehehe... you can\'t see me, can you? Hooked, hooked, HOOKED!']] },
      post: [['porkpie', 'M-my line... you cut my line...'], ['>', 'The Pork Pie Hat Kid scrambles off into the rocks, reeling in nothing.']] },
    hotpants_foe: {
      pre: [['hotpants_foe', 'That cow was my dinner. Whoever killed it answers to me.', 'angry'],
        [{ j: 'Wait, we didn\'t kill anything! Hot Pants, listen to me!', g: 'A cow? You\'re going to shoot us over a cow?', t: 'Easy, stranger. Nobody here wants your supper.', any: 'We didn\'t touch your cow!' }],
        ['hotpants_foe', 'Cream Starter doesn\'t care who\'s lying.', 'menace']],
      mid: { 2: [['hotpants_foe', 'Flesh can be sprayed into any shape. Including your mouth, shut.', 'menace']] },
      post: [['hotpants_foe', '...Fine. You fight like people with something to confess. So do I.'], ['>', 'Hot Pants lowers the spray can. There is a rosary wrapped around the trigger.']] },
    stroheim: {
      pre: [['stroheim', 'Achtung! German marksmanship is the FINEST in the world! Prepare yourselves!', 'shout'],
        [{ j: '...Is he even on the right continent?', g: 'A German soldier in the middle of the desert. Nyo-ho. This race keeps getting stranger.', c: 'Wait. Are you... part machine?', s: 'Loud. I like loud. It makes the silence afterwards sweeter.', any: 'Who IS this guy?!' }]],
      mid: { 2: [['stroheim', 'You think this is my limit?! My body is the pinnacle of German science!', 'shout']] },
      post: [['stroheim', 'Hmph! A tactical retreat! Remember the name: STROHEIM!'], ['>', 'He marches off into the dust, still shouting about Germany.']] },
    magent: {
      pre: [['magent', 'You can\'t hurt me while I kneel. Nothing can! Hahaha!', 'shout'], [{ any: 'Then we\'ll wait for you to stand up.' }]],
      post: [['magent', 'Oi, oi... this wasn\'t in the plan...']] },
    wekapipo_foe: {
      pre: [['wekapipo_foe', 'I was exiled for a crime I did not commit. The President promised me a home. For that, I will break you.'],
        [{ g: 'Wekapipo. You\'re from Naples. You know my family.', any: 'We\'re not your enemy!' }]],
      mid: { 2: [['wekapipo_foe', 'Left-side crush. You won\'t even see which side you lost.', 'menace']] },
      post: [['wekapipo_foe', '...The Zeppeli spin. So it\'s true. I was fighting on the wrong side.']] },
    disco: {
      pre: [['>', 'A chessboard of light spreads across the ground beneath your feet.', 'menace'], ['disco', '...', 'menace'],
        [{ g: 'He doesn\'t talk. Great. The quiet ones always have the worst Stands.', any: 'The ground... it\'s turned into a grid!' }]],
      mid: { 2: [['disco', 'A-4. B-7. ...Chocolate Disco.', 'menace'], [{ any: 'Whatever lands on a square, he can move! Watch the grid!' }]] },
      post: [['disco', '...'], ['>', 'D-I-S-C-O slumps over the board on his arm. Every square of light goes out.']] },
    mikeo: {
      pre: [['mikeo', 'Every bullet becomes a balloon animal. And every balloon finds its way home.'],
        [{ j: 'Balloons? ...Don\'t touch them. Anything that cute out here is lethal.', any: 'Don\'t touch the balloons!' }]],
      mid: { 2: [['mikeo', 'Pop goes the weasel! TUBULAR BELLS!', 'shout']] },
      post: [['mikeo', 'The balloons... are all... going home...'], ['>', 'The last balloon animal drifts upward and bursts without a sound.']] },
    robinson: {
      pre: [['robinson', 'The desert is my garden. Every cactus answers to me.'], [{ g: 'The bug-eyed man. Johnny, protect your eyes!', any: 'Watch the cacti!' }]],
      mid: { 2: [['robinson', 'Insect Swarm! Into their eyes, my little ones!', 'shout']] },
      post: [['robinson', 'Aiee... my eyes... my beautiful swarm...']] },
    arrow_collector: {
      pre: [['>', 'An old man sits among glass cases. In each one lies an arrowhead of meteorite stone.', 'menace'],
        ['arrow_collector', 'You want my Arrow? It has pierced me six times. A different Stand each time. A different man each time.'],
        [{ c: 'I want it. Whatever it chooses, I\'ll make it choose me.', s: 'Keep your arrow. I\'ll take the arm that holds it.', j: 'That arrowhead... it\'s the same stone as the Devil\'s Palm.', any: 'We\'re not leaving without it.' }]],
      mid: { 2: [['arrow_collector', 'Ah... there. A new one wakes inside me. Can you feel it looking at you?', 'menace']],
        4: [['arrow_collector', 'The Arrow chooses! And it did NOT choose you!', 'shout']] },
      post: [['arrow_collector', 'Take it... and pray it cuts you, and not your fate.'], ['>', 'The Arrow is cold in your hand. It hums faintly, as if it is thinking.']] },
    racers: {
      pre: [['mack_knife', 'Racer 0773, Mack the Knife. First place is a knife\'s width away, friends.'],
        ['dixie_gun', 'And Racer 1102, Dixie Chicken, Georgia\'s finest. Hold still, sugar. I never miss twice.'],
        [{ j: 'Neither do I. Ten fingers, ten shots.', g: 'Knives and trick shots? I carry steel balls. Let\'s see which spins better.', t: 'Ma\'am. I\'d rather not draw on a lady. But I will.', any: 'Then make the first one count.' }]],
      mid: { 2: [['dixie_gun', 'Ricochet! Mind the rocks, darlin\'!', 'shout'], ['mack_knife', 'Every cut makes the next one easier!', 'angry']] },
      post: [['mack_knife', 'Blast it... there goes my standing.'], ['dixie_gun', 'Well, shoot. Y\'all ride on. We\'ll see you in New York.']] },
    mack_knife: {
      pre: [['mack_knife', 'Racer 0773, Mack the Knife. First place is a knife\'s width away, friend.'], [{ g: 'Knives? I carry steel balls. Which do you think spins better?', any: 'Try it, and see whose edge is sharper.' }]],
      mid: { 2: [['mack_knife', 'Every cut makes the next one easier. You\'re already bleeding for me!', 'angry']] },
      post: [['mack_knife', 'Blast it... there goes my standing.']] },
    dixie_gun: {
      pre: [['dixie_gun', 'Racer 1102, Dixie Chicken, Georgia\'s finest. Hold still, sugar. I never miss twice.'], [{ j: 'Neither do I. Ten fingers, ten shots.', t: 'Ma\'am. I\'d rather not draw on a lady. But I will.', any: 'Then make the first one count.' }]],
      mid: { 2: [['dixie_gun', 'Ricochet! Mind the rocks, darlin\'!', 'shout']] },
      post: [['dixie_gun', 'Well, shoot. Y\'all ride on. I\'ll see you in New York.']] },
    gunslingerboss: {
      pre: [['gunslingerboss', 'Somebody here owes me, stranger. I came to collect. Draw.', 'angry'], [{ t: 'Son, you don\'t want to do this.', s: 'Finally. Someone who wants to die quickly.', any: 'You picked the wrong riders.' }]],
      post: [['gunslingerboss', '...Should\'ve stayed home.']] },
    t_hamon: {
      pre: [['t_hamon', 'Breathe in... hold it... feel the Ripple? Now try and take it from me.'], [{ c: 'Show me that breathing trick.', s: 'Breathing exercises? I\'ll humour you.', any: 'Let\'s see this Ripple of yours.' }]],
      mid: { 2: [['t_hamon', 'Overdrive! Feel the sunlight in my fists!', 'shout']] },
      post: [['t_hamon', 'Your breathing is ragged... but it\'s there. Keep it.']] },

    /* ---- trainers ---- */
    t_coach: {
      pre: [['t_coach', 'I rode against your father, boy. You sit a horse like you were born on one... and ride like you\'re scared of falling.'], [{ j: 'I already fell, old man. That\'s why I\'m not scared of it anymore.', any: 'Then let\'s see who falls first.' }]],
      mid: { 2: [['t_coach', 'Soft hands! Heels down! A horse feels your fear before you do!', 'shout']] },
      post: [['t_coach', 'Hah! There it is. Your father never rode like that. Go on, jockey.']] },
    t_bounty: {
      pre: [['t_bounty', 'They call me Tenfinger. Ten guns, kid. Stop firing them one at a time.'], [{ j: 'Ten fingers. Ten nails. Let\'s count.', any: 'Draw, then.' }]],
      mid: { 2: [['t_bounty', 'Faster! A man with ten guns doesn\'t reload, he keeps SHOOTING!', 'shout']] },
      post: [['t_bounty', '...Heh. All ten. You\'ve earned the name more than I have.']] },
    t_mason: {
      pre: [['t_mason', 'One to one-point-six-one-eight. The ratio lives in the snail, the storm, the horse\'s stride. Find it, or be crushed by stone.'], [{ j: '(The Golden Rectangle... it\'s in every stroke of his chisel.)', g: 'He talks like my father\'s old books.', any: 'Show us, then.' }]],
      mid: { 2: [['t_mason', 'Look at the spiral! Not at me!', 'shout']] },
      post: [['t_mason', 'You saw it. The infinite, inside a stone. Never forget the ratio.']] },
    t_gregorio: {
      pre: [['t_gregorio', 'You left Naples over one boy, Julius. Show me you can still carry out a sentence.', 'menace'], [{ g: 'I didn\'t come to argue with you, Father. I came to win.', any: 'He\'s... Gyro\'s father?' }]],
      mid: { 2: [['t_gregorio', 'Emotion in the wrist! That is why you fail! An executioner feels NOTHING!', 'shout'], [{ g: 'Wrong. I feel all of it... and I spin anyway.' }]] },
      post: [['t_gregorio', '...Hmph. Your rotation is your own now. Do not disgrace the name.']] },
    t_doctor: {
      pre: [['t_doctor', 'A healer with steel balls? Let\'s see if your hands mend as well as they break.'], [{ g: 'The Zeppeli were doctors before they were executioners. Watch closely.', any: 'Put the scalpel down, doc.' }]],
      mid: { 2: [['t_doctor', 'Steady! A surgeon who shakes kills his patient!', 'shout']] },
      post: [['t_doctor', 'Clean work. Take my notes. They\'re better off in your hands.']] },
    t_whisperer: {
      pre: [['t_whisperer', 'The horse carries the wind. You only borrow it. Show me you know the difference.'], [{ g: 'Valkyrie and I understand each other just fine.', any: 'Let\'s ride, then.' }]],
      mid: { 2: [['t_whisperer', 'Listen to the hooves, not to your pride.']] },
      post: [['t_whisperer', 'The wind remembers you now. Ride with it.']] },
    t_marshal: {
      pre: [['t_marshal', 'Marshal Eli Crane. I hear you call yourself a sheriff, cowboy. Earn the star.'], [{ t: 'I never asked for a star, Marshal. Just a fair draw.', any: 'Fine by us.' }]],
      mid: { 2: [['t_marshal', 'A lawman doesn\'t flinch! Hold your ground!', 'shout']] },
      post: [['t_marshal', 'Keep the star. The frontier needs a man who shoots like that.']] },
    t_rodeo: {
      pre: [['t_rodeo', 'A rope that comes apart and puts itself back together? Honey, I have got to see that.'], [{ t: 'Oh! Lonesome Me. Mind your fingers, Lou.', any: 'Watch the rope!' }]],
      mid: { 2: [['t_rodeo', 'Yee-haw! Hogtied and tuckered!', 'shout']] },
      post: [['t_rodeo', 'Now THAT\'s a lariat. The rodeo circuit would kill to have you.']] },
    t_baron: {
      pre: [['t_baron', 'Half of Kansas is mine, cowboy. Show me why the other half should be yours.'], [{ t: 'I don\'t want land, Mr. Hollis. Just the herd you\'re about to lose.', any: 'Nobody owns this road.' }]],
      mid: { 2: [['t_baron', 'Hired hands! Earn your wages!', 'shout']] },
      post: [['t_baron', 'Ha! A rancher after all. Take a few head of cattle, and my respect.']] },
    t_abbess: {
      pre: [['t_abbess', 'Sister. You carry the Vatican\'s trust and a spray can of other people\'s flesh. Let us see which weighs more.'], [{ h: 'Mother Agatha. I\'ve confessed enough for one lifetime.', any: 'We\'re not here to confess.' }]],
      mid: { 2: [['t_abbess', 'Penance is not a word! It is a DISCIPLINE!', 'shout']] },
      post: [['t_abbess', 'Go with God, child. He goes with you whether you like it or not.']] },
    t_inquisitor: {
      pre: [['t_inquisitor', 'The Vatican wants the Corpse, Sister. Not your guilt. Show me you still serve.', 'menace'], [{ h: 'Brother Silvio. I serve. I just don\'t kneel to you.', any: 'She doesn\'t answer to you.' }]],
      mid: { 2: [['t_inquisitor', 'Flesh to flesh! Cream Starter is a gift of the Church!', 'shout']] },
      post: [['t_inquisitor', '...The Church chose well. Go with the Saint, Sister.']] },
    t_cardinal: {
      pre: [['t_cardinal', 'Every relic has a price. The Corpse has the highest. Are you prepared to pay it?'], [{ h: 'I\'ve paid it already. Every night.', any: 'We\'ll see.' }]],
      mid: { 2: [['t_cardinal', 'Anathema upon you!', 'shout']] },
      post: [['t_cardinal', 'The Saint walks with you. I will tell the Cardinal so.']] },
  };

  /* ---- boss variants from js/variety.js (their pre/post scenes exist; these are mid-fight) ---- */
  Object.assign(T, {
    porkpie_boss: { mid: {
      3: [['porkpie_boss', 'The whole canyon\'s strung, kid! Every rock is a reel! REEL, REEL, REEL!', 'shout'],
        [{ g: 'Burn the wire! Cut the line and he has to come out of the stone!', j: '(Every hook leads back to him... follow the line.)', any: 'Cut the lines! Every hook leads back to him!' }]] } },
    diego_boss: { mid: {
      2: [['diego_boss', 'You found the Eye first. That only means you carried it to me.', 'menace']],
      4: [['>', 'Scales ripple up Diego\'s neck. His jaw splits wide.', 'menace'], ['diego_boss', 'WRYYYYY! The Saint belongs to the fittest!', 'shout'],
        [{ j: 'He\'s gone full dinosaur! Don\'t move, he tracks motion!', g: 'Stay still! Let him come to us!', any: 'Don\'t move! He\'s hunting by motion now!' }]] } },
    rain_blackmore: {
      pre: [['>', 'The rain stops in mid-air, one drop at a time, all around you.', 'menace'], ['rain_blackmore', 'Sumimasen. You avoided Kansas. The rain did not forget you.'],
        [{ g: 'He followed us. Keep the balls spinning, the rotation boils those drops.', any: 'Only Spin gets through that rain!' }]],
      mid: { 3: [['rain_blackmore', 'The drops... evaporating again? Sumimasen... SUMIMASEN!', 'shout']] },
      post: [['rain_blackmore', 'Sumimasen... the rain... stops here...'], ['>', 'Every hanging drop falls at once. It is only water now.']] },
    hotpants_boss: { mid: {
      2: [['hotpants_boss', 'The Saint belongs to God. You are only carrying Him.', 'menace'],
        [{ j: 'Hot Pants! Is the Vatican worth this much to you?', g: 'She\'s sealing herself in flesh. Hit hard, one big blow!', any: 'Break through that flesh with one heavy hit!' }]],
      4: [['hotpants_boss', 'Cream Starter! I will not bleed for you!', 'angry']] } },
    mikeo_boss: { mid: {
      3: [['>', 'Every balloon animal in the room turns its head at the same moment.', 'menace'], ['mikeo_boss', 'Home time! Every balloon comes home at once!', 'shout'],
        [{ any: 'Get down! They\'re all bursting!' }]] } },
    saint_lucy: { mid: {
      2: [['saint_lucy', 'Johnny... it isn\'t me moving. It\'s the Saint.', 'menace'],
        [{ j: 'Lucy! Hold on! We\'ll get it out of you!', g: 'Her guards are feeding her. Take the guards first, then she stops healing.', any: 'Take down the guards! They keep her healing!' }]],
      4: [['>', 'The misfortune has to go somewhere. The Saint decides where.', 'menace']] } },
    both: { mid: {
      2: [['valentine_last', 'Two worlds, and the two greatest men either ever made. Kneel, and I may let one of you finish.', 'menace'],
        ['diego_parallel', 'Don\'t order me around, Mr. President. I\'m only here for the Corpse.', 'angry']],
      3: [['diego_parallel', 'THE WORLD! Time stops for everyone but me!', 'shout'],
        [{ j: '(Two of them. One stops time, the other hides behind every world. One at a time.)', any: 'One at a time! Pick one and bring him down!' }]] } },

    /* ---- side encounters from js/sides.js and js/corpse.js ---- */
    sd_emperor: {
      pre: [['sd_emperor', 'Never bet against a man whose bullets can turn corners, partner.'], [{ t: 'Bullets that turn corners. I\'ve heard of stranger. Rarely.', j: 'Then I\'ll shoot before they turn.', s: 'A gun that is a Stand. How charming.', any: 'Then we won\'t bet. We\'ll just shoot.' }]],
      mid: { 2: [['sd_emperor', 'Emperor! Round the corner and into your back! Hahaha!', 'shout']] },
      post: [['sd_emperor', 'Seven... always my lucky number... until now.']] },
    sd_hanged: {
      pre: [['>', 'The water in the trough holds perfectly still. Something in it is looking back.', 'menace'], ['sd_hanged', 'Every puddle, every window, every eye. I am in all of them.'],
        [{ g: 'He lives in reflections. Spin shatters glass. Bullets just pass through.', any: 'Don\'t look into the water!' }]],
      mid: { 2: [['sd_hanged', 'Look into my eyes... no, into YOURS. I\'m in there too.', 'menace']] },
      post: [['>', 'The trough cracks down the middle. The reflection in it is only yours again.']] },
    sd_temperance: {
      pre: [['sd_temperance', 'Go on, punch me. It all just goes down the gullet.'], [{ g: 'It eats everything. Freeze it, don\'t feed it.', s: 'You eat? So do I. Let\'s see who is hungrier.', any: 'Hitting it only feeds it! We need something cold!' }]],
      mid: { 2: [['sd_temperance', 'Yellow Temperance swallows anything! Anything at ALL!', 'shout']] },
      post: [['sd_temperance', 'Awright, awright! I give up! Mercy, mercy!']] },
    sd_death13: {
      pre: [['>', 'Fairground lights. A calliope plays somewhere. You are fast asleep.', 'menace'], ['sd_death13', 'Lali-ho! Nobody brings a weapon into a dream. Nobody but me!', 'shout'],
        [{ j: '(This is a dream... then I just have to remember I\'m dreaming.)', g: 'Nyo-ho... a dream where I lose? Not a chance.', any: '(A dream. Remember it\'s a dream.)' }]],
      mid: { 2: [['sd_death13', 'Tick tock, the scythe is sharp! When you wake, you\'ll wake up dead!', 'menace']] },
      post: [['>', 'You wake by the campfire. The baby is crying, the way babies do. There is a scratch on your arm you don\'t remember.']] },
    sd_harvest: {
      pre: [['sd_harvest', 'Five hundred of them, mister. They\'ll find every cent you\'ve got.'], [{ j: 'Hey! Those bugs are taking my money!', t: 'Son, that is no way to make a living.', any: 'Those things are stealing our money!' }]],
      mid: { 2: [['sd_harvest', 'Harvest! Bring it all to me! Every coin!', 'shout']] },
      post: [['sd_harvest', 'Okay, okay! Take it back! It was only a little bit!']] },
    sd_badco: {
      pre: [['sd_badco', 'Platoon! Fix bayonets! These trespassers are on MY hill!', 'shout'], [{ t: 'A whole army the size of my hand. Watch your boots.', g: 'Little soldiers, little tanks. Nyo-ho, this race never gets boring.', any: 'An entire army... the size of ants!' }]],
      mid: { 2: [['sd_badco', 'Reinforcements! March, march, MARCH!', 'shout']] },
      post: [['sd_badco', 'Retreat... the 7th... retreats...'], ['>', 'The tiny army sinks into the grass like a fading drumroll.']] },
    sd_pistols: {
      pre: [['sd_pistols', 'One, two, three, five, six, seven. Don\'t say the other number. They hate it.'], [{ j: 'Six little Stands on six bullets. Then I\'ll use ten nails.', any: 'What happened to four?' }]],
      mid: { 2: [['sd_pistols', 'Kick it, boys! Change the angle! YEEHAW!', 'shout']] },
      post: [['sd_pistols', 'Aw... Number Five is crying again.']] },
    sd_beachboy: {
      pre: [['sd_beachboy', 'The line feels your heartbeat through the ice, son. It always knows where you are.'], [{ t: 'A line through solid ice. I know a thing or two about rope, old man.', any: 'Watch the line! It goes through anything!' }]],
      mid: { 2: [['sd_beachboy', 'Got a bite! Reel her in slow!', 'shout']] },
      post: [['sd_beachboy', 'Heh. The big one got away. It always does.']] },
    sd_aerosmith: {
      pre: [['sd_aerosmith', 'My radar sees your breath, mister! Hold it as long as you like!', 'shout'], [{ j: 'A plane... a Stand shaped like a plane?!', g: 'It sees breath. So breathe slow and hit hard.', any: 'A flying machine! Take cover!' }]],
      mid: { 2: [['>', 'BRRRRRT. A toy-sized fighter plane strafes the dirt.', 'menace'], ['sd_aerosmith', 'Volare! You can\'t hide from the radar!', 'shout']] },
      post: [['sd_aerosmith', 'Grounded... I\'ve been grounded...']] },
    sd_kraft: {
      pre: [['sd_kraft', 'Your bullet is quite still now. So, in a moment, will you be.', 'menace'], [{ j: 'My nail... it stopped in the air!', g: 'He can\'t fix what never touches him. Spin from a distance.', any: 'Our bullets are hanging in the air!' }]],
      mid: { 2: [['sd_kraft', 'Kraft Work. Everything stays exactly where I put it.', 'menace']] },
      post: [['sd_kraft', 'How... unfixed of me.']] },
    sd_moody: {
      pre: [['sd_moody', 'I\'ve already watched you do it. Twelve-oh-seven, on the dot.'], [{ h: 'A Pinkerton with a Stand. The Vatican would love to meet you.', any: 'She\'s replaying our own moves!' }]],
      mid: { 2: [['sd_moody', 'Replay! Your own strongest blow, right back at you!', 'shout']] },
      post: [['sd_moody', 'Case closed... for now. My report will be very long.']] },
    sd_vampboss: {
      pre: [['>', 'Every window of the Red Lantern Saloon is painted black.', 'menace'], ['sd_vampboss', 'I put on a mask in Mexico and never saw the sun again. I do not miss it.'],
        [{ g: 'A vampire? Spin burns them. Holy things too.', h: 'Undead. Then the Saint\'s light will hurt you.', c: 'A Stone Mask... I know what that is.', s: 'A leech who thinks he is a king. I have killed kings.', any: 'He\'s not alive! Bullets won\'t do it!' }]],
      mid: { 2: [['sd_vampboss', 'WRYYY! Your blood is so WARM!', 'shout']] },
      post: [['sd_vampboss', 'The sun... I can almost... remember it...'], ['>', 'Lucien Marrow crumbles to ash as the first light slides under the door.']] },
    sd_monk: {
      pre: [['sd_monk', 'Breathe with me. If you still want to fight when your lungs are full, we will fight.'], [{ c: 'My lungs are full. Show me.', s: 'Breathing exercises. Adorable. Come.', any: 'Then let\'s spar.' }]],
      mid: { 2: [['sd_monk', 'Sunlight Yellow Overdrive!', 'shout']] },
      post: [['sd_monk', 'Good. Your breathing is steadier than your fists. Keep it that way.']] },
    sd_pillarman: {
      pre: [['>', 'The stone column splits. A man older than Rome stretches his arms.', 'menace'], ['sd_pillarman', 'Humans. Still so small. Still so warm.', 'menace'],
        [{ c: 'A Pillar Man! Sunlight, the Ripple, anything like it!', s: 'Finally. Something that has lived nearly as long as I have.', any: 'Stay away from his skin! He absorbs whatever he touches!' }]],
      mid: { 2: [['sd_pillarman', 'You wound me? YOU?!', 'angry']], 4: [['>', 'Dawn creeps over the quarry. The Pillar Man looks east for the first time.', 'menace']] },
      post: [['sd_pillarman', 'The sun... after so many centuries...'], ['>', 'He turns back to stone, and the stone to sand.']] },
    cv_hound: {
      pre: [['cv_hound', 'The rod never lies. It just points at whoever is carrying God.'], [{ h: 'A relic hunter for the President. Back off, dog.', l: 'He can feel the Corpse... he\'s pointing at me!', any: 'He can sense the Corpse!' }]],
      mid: { 2: [['cv_hound', 'The rod bends! Closer... closer... there you are!', 'shout']] },
      post: [['cv_hound', 'The rod... still points... at you...']] },
  });
  // enemy -> talk key when it isn't the id itself
  const ALIAS = { benjamin: 'boom', andre: 'boom', laboom: 'boom', porkpie_boss2: 'porkpie_boss', oyecomova_boss1: 'oyecomova_boss', blackmore_boss: 'blackmore', tattoo_act: 'tattoo_boss',
    wekapipo_boss: 'weka', valentine_d4c: 'valentine1', valentine_last: 'valentine1', disco_boss: 'disco', diego_parallel: 'diego_world', sd_blob: 'sd_temperance' };
  const AREA_BOSS = ['palm_echo', 'fossil_colossus', 'wolf_alpha', 'tattoo_boss'];

  /** generic lines for trainers without their own entry, and for side-encounter foes added later */
  function generic(id) {
    const E = SBR.ENEMIES[id]; if (!E) return null;
    if (E.trainer || /^t_/.test(id)) return {
      pre: [[id, `${E.title ? E.title + '. ' : ''}Words won't teach you anything. Show me.`], [{ any: 'Then watch closely.' }]],
      post: [[id, 'Good. You\'ve earned it. Keep riding.']] };
    return null;
  }
  function register(key, t) {
    const out = {};
    if (t.pre) { scene(`ft_${key}_pre`, t.pre); out.pre = `ft_${key}_pre`; }
    if (t.mid) { out.mid = {}; Object.entries(t.mid).forEach(([r, spec]) => { scene(`ft_${key}_m${r}`, spec, { mid: true }); out.mid[r] = `ft_${key}_m${r}`; }); }
    if (t.post) { scene(`ft_${key}_post`, t.post); out.post = `ft_${key}_post`; }
    return out;
  }
  const REG = {};
  Object.entries(T).forEach(([k, t]) => { REG[k] = register(k, t); });
  /** other files (js/sides.js) may add talk: SBR.addFightTalk(enemyId, { pre, mid: { round: spec }, post }) */
  SBR.addFightTalk = (key, t) => { T[key] = t; REG[key] = register(key, t); };
  SBR.FIGHT_TALK = T;

  function keyFor(ids) {
    if (ids.includes('mack_knife') && ids.includes('dixie_gun')) return 'racers';
    if ((ids.includes('wekapipo_foe') || ids.includes('wekapipo_boss')) && ids.includes('magent')) return 'weka';
    if (ids.includes('valentine_last') && ids.includes('diego_parallel')) return 'both';
    const E = SBR.ENEMIES;
    const rank = id => (E[id] && E[id].tier === 'boss' ? 0 : E[id] && E[id].tier === 'elite' ? 1 : 2);
    const sorted = ids.slice().sort((a, b) => rank(a) - rank(b));
    for (const id of sorted) { const k = ALIAS[id] || id; if (REG[k]) return k; }
    for (const id of sorted) { const gt = generic(id); if (gt) { REG[id] = register(id, gt); return id; } }
    return null;
  }
  /** did a story scene that opens this very fight just play? (its own lines are the "pre") */
  function fromStory(ids) {
    const L = SBR.panels._last();
    if (!L || Date.now() - L.t > 10 * 60 * 1000) return null;
    const sc = SBR.STORY[L.id];
    if (!sc || !sc.fight || !sc.fight.enemies) return null;
    return sc.fight.enemies.join(',') === ids.join(',') ? sc : null;
  }

  SBR.fightTalk = (enemies, opts = {}) => {
    if (!enemies || !enemies.length) return null;
    const ids = enemies.map(e => (typeof e === 'string' ? e : e && e.id)).filter(Boolean);
    const key = keyFor(ids);
    if (!key) return null;
    const t = REG[key];
    const res = { mid: t.mid };
    if (ids.some(id => AREA_BOSS.includes(id))) return Object.assign(res, { pre: t.pre, post: t.post });
    if (opts.boss) return res;
    const st = fromStory(ids);
    if (st) { if (!st.after) res.post = t.post; return res; }
    return Object.assign(res, { pre: t.pre, post: t.post });
  };
})();
