/* Run structure: forks in the road and rivals who remember you.
   - Every act is pre-rolled into a small branching graph (r.route[act]): stage 1 is the race route, the last stage is the boss,
     and every stage between offers 2-3 roads you reach from the one you are on. The road you take biases that stage's
     3-card deal (still exactly three cards; forced story, consequence and boss cards keep priority).
   - Four racers (Diego, Pocoloco, Sandman, Norisuke) run recurring 3-4 meeting storylines through the consequence queue.
     What you do moves their stance (rival / respect / ally), which changes how hard they ride at you in the sprints,
     who gets bonus standings points, and whether they turn up to help in a boss fight.
   main.js calls: startAct -> SBR.route.startAct, showStage -> needsPick/pickRoad, drawCards -> weight/stars, applySprint -> sprintBias.
   ui.js calls: strip() on the stage screen, mapGraph()/rivalPanel()/decorateStandings() on the Map tab. sprint.js: pickAttacker. */
'use strict';

SBR.route = (() => {
  const U = SBR.util;
  const CFG = {
    width3: 0.55,          // chance a fork stage has three roads instead of two
    allLinks: 0.3,         // chance a road links to all three roads of the next stage (else two neighbours)
    hidden: 0.18,          // chance a fork stage hides one road behind a "?"
    shortcutPace: 6,       // pace gained taking a Shortcut
    mysteryMoney: [15, 35],// what an unmarked trail may turn up
    mysteryHeal: 0.15,
    tagOdds: { canyon: 1, town: 1, sacred: 1, shortcut: 0.8 },
    // card-type weight multipliers per road (type 'trainer' also covers path-offer events)
    weights: {
      canyon:   { fight: 4, elite: 2.4, event: 0.6, shop: 0.3, trainer: 0.5, recruit: 0.6, rest: 0.4, detour: 1 },
      town:     { shop: 6, event: 1.5, recruit: 2.5, rest: 1.6, fight: 0.35, elite: 0.35, trainer: 0.8, detour: 0.5 },
      sacred:   { trainer: 3, detour: 5, rest: 2, event: 1, fight: 0.5, elite: 0.6, shop: 0.4, recruit: 1 },
      shortcut: { elite: 1.6, fight: 1.3, event: 1, rest: 0.3, shop: 0.5, trainer: 0.7, detour: 0.6, recruit: 0.8 },
    },
    // star bumps (danger and pay) per road: type -> +stars ('all' = every card but shops and rests)
    stars: { canyon: { fight: 1, elite: 1 }, shortcut: { all: 1 } },
    // sprint: how likely a rival picks you as the target, by stance
    attack: { rival: 2.5, neutral: 1, respect: 0.6, ally: 0.15 },
    // standings points after each stage finish, by stance: rivals ride to beat you, allies ride interference for you
    sprintPts: { rival: 6, ally: 5 },
    cameo: true,           // allies may turn up in boss fights (once per act)
  };

  const TAGS = {
    trail:    { name: 'The Race Route', short: 'Route', color: '#f2c14e', blurb: 'The marked course, with every other rider on it.', chips: [] },
    canyon:   { name: 'Canyon Trail', short: 'Canyon', color: '#d0643a', kana: 'ドドド', blurb: 'Ambushes behind every rock, and whatever the dead were carrying.', chips: ['More fights', 'Better loot'] },
    town:     { name: 'Frontier Town', short: 'Town', color: '#3fb8a9', kana: 'ワイワイ', blurb: 'Saloons, traders and loose talk. Someone always wants to hire a rider.', chips: ['Shops', 'Events', 'Recruits'] },
    sacred:   { name: 'Sacred Ground', short: 'Sacred', color: '#7b5bd6', kana: 'シーン', blurb: 'Old paths the Saint walked. Teachers and strange places wait here.', chips: ['Trainers', 'Detours', 'Rest'] },
    shortcut: { name: 'Shortcut', short: 'Shortcut', color: '#e8508a', kana: 'ビュン', blurb: 'Cut the corner through bad country. Gain ground, court danger.', chips: ['+6 pace', 'Riskier ★'] },
    mystery:  { name: 'Unmarked Trail', short: '???', color: '#2a1a3a', kana: '？？？', blurb: 'No sign, no tracks. Nobody knows where it comes out. Fortune favours the bold.', chips: ['Unknown', 'A stroke of fortune?'] },
    boss:     { name: 'Stage Boss', short: 'Boss', color: '#c8323c', blurb: 'There is no way around.', chips: [] },
  };
  const ICON = {
    trail: '<path d="M6 4C3 10 4 18 12 20C20 18 21 10 18 4L15 5C17 10 16 15 12 16C8 15 7 10 9 5Z"/>',
    canyon: '<path d="M1 21L5 11H9L11 6H16L18 12H20L23 21Z"/><path d="M9 21L12 14L14 21" fill="none" stroke-width="1.6"/>',
    town: '<path d="M3 21V10H6V5H18V10H21V21Z"/><rect x="10" y="14" width="4" height="7" class="ri-hole"/><rect x="8" y="7" width="8" height="2" class="ri-hole"/>',
    sacred: '<path d="M19 2C11 4 6 10 6 19L8 19C9 13 12 8 19 2Z"/><path d="M6 19L4 23" fill="none" stroke-width="2"/><path d="M9 14L13 12M8 11L12 9M11 8L15 6" fill="none" stroke-width="1.4" class="ri-line"/>',
    shortcut: '<path d="M14 1L4 14H11L9 23L20 9H13Z"/>',
    mystery: '<text x="12" y="20" text-anchor="middle" font-size="20" font-family="Bangers, Impact, sans-serif">?</text>',
    boss: '<path d="M2 19L4 7L9 12L12 4L15 12L20 7L22 19Z"/><rect x="2" y="19" width="20" height="3"/>',
  };
  const icon = (tag, size = 22, cls = '') => `<svg class="r-ico ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${ICON[tag] || ICON.trail}</svg>`;

  /* ---------------- the graph ---------------- */
  const run = () => SBR.run;
  function pickTag(avoid) {
    const keys = Object.keys(CFG.tagOdds).filter(k => !avoid.includes(k));
    return U.weighted(keys, k => CFG.tagOdds[k]);
  }
  function generate(act) {
    const A = SBR.ACTS[act], N = A.stages;
    const stages = [null];
    for (let s = 1; s <= N; s++) {
      if (s === 1) { stages.push([{ tag: 'trail' }]); continue; }
      if (s === N) { stages.push([{ tag: 'boss' }]); continue; }
      const n = Math.random() < CFG.width3 ? 3 : 2, row = [], used = [];
      for (let i = 0; i < n; i++) { const t = pickTag(used); used.push(t); row.push({ tag: t }); }
      if (Math.random() < CFG.hidden) row[U.randInt(0, n - 1)].hidden = true;
      stages.push(row);
    }
    // links: every road reaches 2-3 roads of the next stage (all of them when it has only one or two)
    for (let s = 1; s < N; s++) {
      const cur = stages[s], nx = stages[s + 1], m = nx.length;
      cur.forEach((node, i) => {
        if (m <= 2 || cur.length === 1 || Math.random() < CFG.allLinks) { node.links = nx.map((_, j) => j); return; }
        const p = cur.length === 1 ? 1 : Math.round(i * (m - 1) / (cur.length - 1));
        const q = p === 0 ? 1 : p === m - 1 ? m - 2 : p + (Math.random() < 0.5 ? -1 : 1);
        node.links = [p, q].sort((a, b) => a - b);
      });
      nx.forEach((_, j) => { if (!cur.some(c => c.links.includes(j))) { const c = cur[Math.min(cur.length - 1, Math.round(j * (cur.length - 1) / Math.max(1, m - 1)))]; c.links.push(j); c.links.sort((a, b) => a - b); } });
    }
    return { v: 1, act, stages, pick: { 1: 0 } };
  }
  /** saves from before this file existed have no route: build it the first time it is asked for */
  function ensure(act) {
    const r = run(); if (!r) return null;
    act = act || r.act;
    if (!SBR.ACTS[act]) return null;
    r.route = r.route || {};
    const g = r.route[act];
    if (!g || !g.stages || g.stages.length !== SBR.ACTS[act].stages + 1) r.route[act] = generate(act);
    return r.route[act];
  }
  /** index of the road you are on at stage s (the first reachable one when you never chose) */
  function posAt(g, s) {
    if (g.pick[s] != null) return g.pick[s];
    return 0;
  }
  /** roads you may take into stage s, from the one you took at s-1 */
  function offered(g, s) {
    if (s <= 1 || !g.stages[s]) return [];
    const prev = g.stages[s - 1][posAt(g, s - 1)] || g.stages[s - 1][0];
    return (prev.links || g.stages[s].map((_, j) => j)).slice();
  }
  function nodeNow() {
    const r = run(); if (!r || r.area) return null;
    const g = ensure(); if (!g || !g.stages[r.stage]) return null;
    if (g.pick[r.stage] == null) return null;
    return g.stages[r.stage][g.pick[r.stage]] || null;
  }
  const tagNow = () => { const n = nodeNow(); return n ? n.tag : null; };

  /* ---------------- the deal ---------------- */
  const typeOf = e => (e.pathOffer ? 'trainer' : e.type);
  function weight(e) {
    const t = tagNow(); const W = t && CFG.weights[t];
    if (!W) return 1;
    const m = W[typeOf(e)];
    return m == null ? 1 : m;
  }
  function stars(e, s) {
    const t = tagNow(); const S = t && CFG.stars[t];
    if (!S || !s || e.type === 'shop' || e.type === 'rest') return s;
    const up = (S[typeOf(e)] || 0) + (S.all || 0);
    return Math.min(5, s + up);
  }

  /* ---------------- choosing a road ---------------- */
  function forcedStage() {
    const r = run();
    const plan = SBR.actPlan(r.act), sid = plan.story && plan.story[r.stage];
    if (sid && SBR.STORY[sid] && SBR.STORY[sid].required && !(SBR.STORY[sid].leadSkip || []).includes(r.lead) && !r.flags['skipped_' + sid]) return true;
    try { if (SBR.campaign && SBR.campaign.dueCard()) return true; } catch (e) { /* not ready */ }
    return false;
  }
  function needsPick() {
    const r = run();
    if (!r || r.area || r.stageCards) return false;
    const A = SBR.ACTS[r.act]; if (!A || r.stage <= 1 || r.stage >= A.stages) return false;
    const g = ensure();
    if (g.pick[r.stage] != null) return false;
    if (offered(g, r.stage).length <= 1 || forcedStage()) { g.pick[r.stage] = offered(g, r.stage)[0] || 0; g.auto = Object.assign({}, g.auto, { [r.stage]: true }); SBR.saveRun(); return false; }
    return true;
  }
  const labelOf = node => (node.hidden ? TAGS.mystery : TAGS[node.tag]);
  /** the road-sign art: a post, a board shaped like an arrow, the road's glyph and name */
  function signSVG(node, dir = 0, big = true) {
    const T = labelOf(node), tg = node.hidden ? 'mystery' : node.tag;
    const flip = dir < 0 ? 'transform="translate(200 0) scale(-1 1)"' : '';
    const tilt = dir === 0 ? -2 : dir < 0 ? -5 : 4;
    return `<svg class="rs-svg" viewBox="0 0 200 150" ${big ? '' : 'width="120"'} aria-hidden="true">
      <g ${flip}><rect x="92" y="54" width="16" height="96" fill="#6a4020" stroke="#1a1020" stroke-width="4"/>
      <path d="M92 150h16" stroke="#1a1020" stroke-width="6"/>
      <g transform="rotate(${tilt} 100 50)">
        <path d="M18 18H158L190 50L158 82H18Z" fill="${T.color}" stroke="#1a1020" stroke-width="6" stroke-linejoin="round"/>
        <path d="M26 26H154L178 50L154 74H26Z" fill="none" stroke="#f6ecd8" stroke-width="2" stroke-dasharray="6 5" opacity=".7"/>
        <circle cx="28" cy="28" r="3.5" fill="#1a1020"/><circle cx="28" cy="72" r="3.5" fill="#1a1020"/>
        <g transform="translate(${dir < 0 ? 150 : 48} 50) ${dir < 0 ? 'scale(-1 1)' : ''}"><circle r="24" fill="#f6ecd8" stroke="#1a1020" stroke-width="4"/>
        <g transform="translate(-15 -15) scale(1.25)" class="rs-glyph">${ICON[tg]}</g></g>
        <path d="M18 82L40 82" stroke="#1a1020" stroke-width="3"/>
      </g></g>
      <text x="118" y="58" text-anchor="middle" class="rs-kana" transform="rotate(${tilt} 100 50)">${T.kana || ''}</text>
    </svg>`;
  }
  /** after a stage resolves: the fork. Resolves when a road is taken. */
  function pickRoad(G) {
    const r = run(), g = ensure(), s = r.stage, N = SBR.ACTS[r.act].stages;
    const opts = offered(g, s);
    return new Promise(resolve => {
      const el = U.el;
      const box = el('div', { class: 'road-pick' });
      box.appendChild(el('div', { class: 'rp-head', html: `<div class="rp-kicker">STAGE ${s} / ${N} · ${SBR.ACTS[r.act].title.toUpperCase()}</div><h2 class="rp-title">FORK IN THE ROAD<span class="rp-kana">ゴゴゴ</span></h2><p class="rp-sub">The trail splits. Which way does ${(SBR.CHARS[r.lead] || SBR.CHARS.johnny).short || 'the lead'} ride?</p>` }));
      const row = el('div', { class: 'rp-roads rp-n' + opts.length });
      const dirs = opts.length === 2 ? [-1, 1] : [-1, 0, 1];
      let done = false;
      const take = i => {
        if (done) return; done = true;
        document.removeEventListener('keydown', onKey);
        SBR.audio.play('select');
        SBR.ui.closeModal(w);
        resolve(choose(opts[i], G));
      };
      opts.forEach((j, i) => {
        const node = g.stages[s][j], T = labelOf(node);
        const next = s + 1 < N ? (node.links || []).map(k => g.stages[s + 1][k]) : [g.stages[N][0]];
        const b = el('button', { class: 'choice road-sign', style: { '--rc': T.color } });
        b.innerHTML = `<span class="choice-n">${i + 1}</span>${signSVG(node, dirs[i])}
          <span class="rs-name">${T.name}</span><span class="rs-blurb">${T.blurb}</span>
          <span class="rs-chips">${T.chips.map(c => `<i>${c}</i>`).join('')}</span>
          <span class="rs-next"><small>LEADS TO</small>${next.map(n => `<b style="--rc:${labelOf(n).color}" title="${labelOf(n).name}">${icon(n.hidden ? 'mystery' : n.tag, 18)}</b>`).join('')}</span>`;
        b.addEventListener('click', () => take(i));
        b.addEventListener('mouseenter', () => SBR.audio.play('hover'));
        row.appendChild(b);
      });
      box.appendChild(row);
      box.appendChild(el('div', { class: 'rp-foot', html: `${icon('trail', 14)} The road shapes what you meet on this stage. It is not an encounter: nobody in the party minds which way you go.` }));
      const w = SBR.ui.modal(box, { noClose: true, size: 'xl', cls: 'event-modal road-modal' });
      function onKey(e) { const n = parseInt(e.key, 10); if (n >= 1 && n <= opts.length) take(n - 1); }
      document.addEventListener('keydown', onKey);
    });
  }
  /** take road j at the current stage: record it, apply what it does on arrival */
  async function choose(j, G) {
    const r = run(), g = ensure(), s = r.stage, node = g.stages[s][j];
    g.pick[s] = j;
    const tag = node.tag;
    applyConseq('road:' + tag, G);
    if (tag === 'shortcut' && G) G.pace(CFG.shortcutPace);
    if (node.hidden) {
      node.revealed = true;
      const T = TAGS[tag];
      let extra = '';
      if (G && Math.random() < 0.5) { const m = U.randInt(CFG.mysteryMoney[0], CFG.mysteryMoney[1]); G.money(m); extra = ' Along the way: an abandoned saddlebag with a few dollars in it.'; }
      else if (G) { G.healAll(CFG.mysteryHeal); extra = ' Along the way: a clear spring. (Party healed a little.)'; }
      await SBR.ui.resultPanel('The Unmarked Trail', `It comes out onto ${T.name === 'Shortcut' ? 'a Shortcut' : 'a ' + T.name}.${extra}`, 'map');
    } else SBR.toast(`<div class="road-toast" style="--rc:${TAGS[tag].color}">${icon(tag, 20)} <b>${TAGS[tag].name}</b></div>`, 'good');
    SBR.saveRun();
    return node;
  }
  /** road picks are not event choices (affinity must not read them), so their table entries apply here */
  function applyConseq(key, G) {
    const C = SBR.CONSEQ[key]; if (!C || !SBR.campaign) return;
    const w = SBR.campaign.world(); if (w.keys[key]) return; w.keys[key] = true;
    Object.entries(C.rep || {}).forEach(([f, n]) => SBR.campaign.rep(f, n));
    if (C.flag && G) [].concat(C.flag).forEach(f => G.flag(f));
    if (C.deed) SBR.campaign.deed(key, C.deed);
  }

  /* ---------------- stage-screen look-ahead strip ---------------- */
  function strip() {
    const r = run(); if (!r || r.area) return null;
    const g = ensure(); if (!g) return null;
    const s = r.stage, N = SBR.ACTS[r.act].stages;
    const here = g.pick[s] != null ? g.stages[s][g.pick[s]] : null;
    const cell = (nodes, cls = '') => `<span class="rstrip-cell ${cls}">${nodes.map(n => `<b style="--rc:${labelOf(n).color}" title="${labelOf(n).name}">${icon(n.hidden && !n.revealed ? 'mystery' : n.tag, 16)}</b>`).join('')}</span>`;
    const nextIdx = here ? (here.links || []) : (g.stages[s + 1] || []).map((_, i) => i);
    const n1 = s + 1 <= N ? nextIdx.map(k => g.stages[s + 1][k]) : [];
    const set2 = new Set(); if (s + 2 <= N) nextIdx.forEach(k => (g.stages[s + 1][k].links || []).forEach(x => set2.add(x)));
    const n2 = s + 2 <= N ? [...set2].sort().map(k => g.stages[s + 2][k]) : [];
    const box = U.el('div', { class: 'road-strip' });
    const T = here ? labelOf(here.hidden && here.revealed ? { tag: here.tag } : here) : null;
    box.innerHTML = `${here ? `<span class="rstrip-now" style="--rc:${T.color}">${icon(here.tag, 18)}<span>${T.name}</span></span>` : ''}${n1.length ? `<i class="rstrip-arrow">▶</i>${cell(n1)}` : ''}${n2.length ? `<i class="rstrip-arrow">▶</i>${cell(n2, 'far')}` : ''}`;
    if (SBR.tip) SBR.tip.bind(box, `<b>The road ahead</b><br>${here ? `You are on <b>${T.name}</b>: ${T.blurb}<br>` : ''}Next stages: the roads you can reach. <i>Map (M)</i> shows the whole act.`);
    return box;
  }

  /* ---------------- the Map tab graph ---------------- */
  function mapGraph() {
    const r = run(); if (!r) return U.el('div');
    const g = ensure(); const N = SBR.ACTS[r.act].stages;
    const colW = 78, rowH = 62, padX = 40, top = 34, H = top + rowH * 3 + 30, W = padX * 2 + colW * (N - 1);
    const pos = (s, i) => { const n = g.stages[s].length; return [padX + (s - 1) * colW, top + rowH * 1.5 + (i - (n - 1) / 2) * rowH]; };
    // the path you have ridden, and the node you are on now
    const taken = new Set(); for (let s = 1; s <= Math.min(r.stage, N); s++) if (g.pick[s] != null) taken.add(s + ':' + g.pick[s]);
    const cur = r.stage <= N && g.pick[r.stage] != null ? r.stage + ':' + g.pick[r.stage] : null;
    const reach = new Set();
    if (r.stage <= N) { const start = g.pick[r.stage] != null ? [g.pick[r.stage]] : offered(g, r.stage); let fr = start; for (let s = r.stage; s <= N; s++) { fr.forEach(i => reach.add(s + ':' + i)); const nx = new Set(); fr.forEach(i => (g.stages[s][i].links || []).forEach(k => nx.add(k))); fr = [...nx]; } }
    let edges = '', nodes = '';
    for (let s = 1; s < N; s++) g.stages[s].forEach((nd, i) => (nd.links || []).forEach(k => {
      const [x1, y1] = pos(s, i), [x2, y2] = pos(s + 1, k);
      const rode = taken.has(s + ':' + i) && taken.has((s + 1) + ':' + k);
      const open = reach.has(s + ':' + i) && reach.has((s + 1) + ':' + k);
      const mx = (x1 + x2) / 2;
      edges += `<path d="M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" class="rg-edge${rode ? ' rode' : open ? ' open' : ''}"/>`;
    }));
    for (let s = 1; s <= N; s++) g.stages[s].forEach((nd, i) => {
      const [x, y] = pos(s, i), key = s + ':' + i;
      const hid = nd.hidden && !nd.revealed && !taken.has(key);
      const T = hid ? TAGS.mystery : TAGS[nd.tag];
      const cls = 'rg-node' + (taken.has(key) ? ' rode' : '') + (key === cur ? ' cur' : '') + (!reach.has(key) && !taken.has(key) ? ' dim' : '') + (nd.tag === 'boss' ? ' boss' : '');
      nodes += `<g class="${cls}" transform="translate(${x} ${y})"><title>Stage ${s}: ${nd.tag === 'boss' ? SBR.actPlan(r.act).boss.name : T.name}</title>
        ${key === cur ? '<circle r="27" class="rg-ring"/>' : ''}
        <path d="${nd.tag === 'boss' ? 'M0 -24L24 0L0 24L-24 0Z' : 'M-20 -16H14L24 0L14 16H-20Z'}" fill="${T.color}" class="rg-shape"/>
        <g transform="translate(${nd.tag === 'boss' ? -11 : -13} -11) scale(.92)" class="rg-glyph">${ICON[hid ? 'mystery' : nd.tag]}</g></g>`;
    });
    let labels = '';
    for (let s = 1; s <= N; s++) { const [x] = pos(s, 0); labels += `<text x="${x}" y="18" class="rg-lbl${s === r.stage ? ' now' : ''}">${s === N ? 'BOSS' : 'S' + s}</text>`; }
    const box = U.el('div', { class: 'route-graph' });
    box.innerHTML = `<div class="rg-head"><b>THE ROAD</b><span>${SBR.ACTS[r.act].name} · ${SBR.ACTS[r.act].title}</span><em>ドドド</em></div>
      <svg viewBox="0 0 ${W} ${H}" class="rg-svg" role="img" aria-label="Branching route of this act">${labels}${edges}${nodes}</svg>
      <div class="rg-legend">${['canyon', 'town', 'sacred', 'shortcut', 'mystery'].map(t => `<span style="--rc:${TAGS[t].color}">${icon(t, 14)}${TAGS[t].short === '???' ? 'Unmarked' : TAGS[t].short}<small>${TAGS[t].chips.join(' · ')}</small></span>`).join('')}</div>`;
    return box;
  }

  /* ================= rivals ================= */
  const STANCE = {
    neutral: { name: 'Stranger', color: '#8a8070', desc: 'You have not crossed paths in earnest yet.' },
    rival:   { name: 'Rival', color: '#c8323c', desc: 'Rides to beat you, and will go after you in the sprints.' },
    respect: { name: 'Respect', color: '#f2c14e', desc: 'A worthy opponent. Rides clean against you.' },
    ally:    { name: 'Ally', color: '#3fb8a9', desc: 'Watches your back: rarely attacks you in sprints, gives you standings help, may turn up in a boss fight.' },
  };
  const CHAINS = {
    diego:    { name: 'Diego Brando', portrait: 'diego', meetings: 4, start: [1, 2], first: 'rv_diego_1',
      cameo: { text: 'Diego’s raptors burst from the brush and tear into the enemy line!', run: (c, P, E) => E.forEach(e => c.addStatus(e, 'vuln', 0, 2, true)) } },
    pocoloco: { name: 'Pocoloco', portrait: 'pocoloco', meetings: 3, start: [1, 2], first: 'rv_poco_1',
      cameo: { text: 'Pocoloco gallops past, laughing. “Hey Ya! says today is YOUR lucky day!”', run: (c, P) => P.forEach(u => c.addStatus(u, 'lucky', 0, 3, true)) } },
    sandman:  { name: 'Sandman', portrait: 'sandman', meetings: 3, start: [1, 2], first: 'rv_sand_1',
      cameo: { text: 'Sandman runs alongside for a moment, and the sand shifts in your favour.', run: (c, P) => P.forEach(u => c.addStatus(u, 'evasive', 0, 2, true)) } },
    norisuke: { name: 'Norisuke Higashikata', portrait: 'norisuke', meetings: 3, start: [2, 3], first: 'rv_nori_1',
      cameo: { text: 'Old Norisuke tosses you a basket of strange fruit. “My family always had luck with these!”', run: (c, P) => P.forEach(u => c.addStatus(u, 'regen', 0, 3, true)) } },
  };
  const world = () => SBR.campaign.world();
  const rivalsW = () => { const w = world(); w.rivals = w.rivals || {}; return w.rivals; };
  const stanceFor = score => (score <= -1 ? 'rival' : score >= 3 ? 'ally' : score >= 1 ? 'respect' : 'neutral');
  function rival(id) { const R = rivalsW(); return R[id] || null; }
  const stanceOf = id => { const v = rival(id); return v ? v.stance : null; };
  /** a racer can meet you only while they are in the race and not riding with you */
  function free(id) {
    const r = run(); if (!r) return false;
    if (r.lead === id || r.party.some(m => m.id === id) || (r.reserve || []).some(m => m.id === id)) return false;
    const rv = SBR.RIVALS[id]; if (rv && rv.outAfter && r.act > rv.outAfter) return false;
    if (rv && rv.out && rv.out(r)) return false;
    return true;
  }
  function shift(id, n, g) {
    const R = rivalsW(); const v = R[id] = R[id] || { stance: 'neutral', score: 0, meetings: 0 };
    const before = v.stance;
    v.score = Math.max(-4, Math.min(5, (v.score || 0) + n));
    v.stance = stanceFor(v.score);
    if (v.stance !== before) {
      const S = STANCE[v.stance];
      SBR.toast(`<div class="rival-toast" style="--rc:${S.color}">${SBR.art.portrait(CHAINS[id].portrait)}<div><small>RIVALRY</small><b>${CHAINS[id].name}: ${S.name}</b></div></div>`, v.stance === 'rival' ? 'bad' : 'good');
      // the existing world state listens for these
      if (id === 'sandman' && v.stance === 'ally') SBR.campaign.npc('sandman', 'friend');
      if (id === 'pocoloco' && v.stance === 'ally') SBR.campaign.npc('pocoloco', 'friend');
      if (id === 'diego' && v.stance === 'rival' && g) g.flag('diegoGrudge');
    }
  }
  function startAct(n) {
    ensure(n);
    if (!SBR.campaign) return;
    const R = rivalsW();
    Object.entries(CHAINS).forEach(([id, C]) => {
      if (R[id] || !C.start.includes(n) || !free(id)) return;
      R[id] = { stance: 'neutral', score: 0, meetings: 0 };
      SBR.campaign.later(C.first, 1, 3, null);
    });
  }
  /** sprint.js: who a rival goes after. Stance changes the odds of it being you */
  function pickAttacker(list) {
    if (!list || !list.length) return null;
    return U.weighted(list, x => { const st = x && x.key && CHAINS[x.key] ? (stanceOf(x.key) || 'neutral') : 'neutral'; return CFG.attack[st] || 1; });
  }
  /** after the stage finish: rivals find extra points, allies ride interference for you */
  function sprintBias(res) {
    const r = run(); if (!r || !SBR.campaign) return;
    const notes = [];
    Object.keys(CHAINS).forEach(id => {
      const st = stanceOf(id); if (!st || !SBR.RIVALS[id]) return;
      const rv = SBR.RIVALS[id];
      if ((rv.outAfter && r.act > rv.outAfter) || (rv.out && rv.out(r)) || !free(id)) return;
      if (st === 'rival' && CFG.sprintPts.rival) { r.points[id] = (r.points[id] || 0) + CFG.sprintPts.rival; notes.push(`${CHAINS[id].name} rode to beat you (+${CFG.sprintPts.rival} pts to them)`); }
      if (st === 'ally' && CFG.sprintPts.ally) { r.points.player = (r.points.player || 0) + CFG.sprintPts.ally; notes.push(`${CHAINS[id].name} rode interference for you (+${CFG.sprintPts.ally} pts)`); }
    });
    r.rivalNotes = notes;
    if (notes.length) SBR.toast(`<div><b>Rivals on the road</b><br><small>${notes.join('<br>')}</small></div>`, 'whisper');
  }
  /** boss fights: an ally still in the race may turn up (once per act) */
  function cameo(combat) {
    const r = run(); if (!CFG.cameo || !r || !combat.opts || !combat.opts.boss || !SBR.campaign) return;
    const R = rivalsW();
    const foes = combat.enemies().map(e => e.id || '');
    // nobody turns up to help against themselves (Diego at the Pass, Sandman at the river)
    const id = Object.keys(CHAINS).find(k => R[k] && R[k].stance === 'ally' && R[k].helped !== r.act && free(k) && !foes.some(f => f.startsWith(k)));
    if (!id) return;
    R[id].helped = r.act;
    const P = combat.party(), E = combat.enemies();
    try { CHAINS[id].cameo.run(combat, P, E); } catch (e) { console.error('[route] cameo', e); return; }
    combat.storyNotes = (combat.storyNotes || []).concat(`<span class="rival-cameo">${SBR.art.portrait(CHAINS[id].portrait)}</span>${CHAINS[id].cameo.text}`);
    if (!r.flags['cameo_' + id]) { r.flags['cameo_' + id] = true; SBR.campaign.deed('cameo_' + id + '_' + r.act, `${CHAINS[id].name} turned up to help against ${combat.opts.bossName || 'a boss'}.`); }
  }

  /* ---------------- rivals on the Map tab, the standings and the Chronicle ---------------- */
  function rivalPanel() {
    const box = U.el('div', { class: 'rival-panel' });
    if (!run() || !SBR.campaign) return box;
    const R = rivalsW();
    box.appendChild(U.el('div', { class: 'cs-sub' }, 'RIVALS ON THE ROAD'));
    const row = U.el('div', { class: 'rv-row' });
    Object.entries(CHAINS).forEach(([id, C]) => {
      const v = R[id]; const st = v ? v.stance : null; const S = STANCE[st || 'neutral'];
      const c = U.el('div', { class: 'rv-card' + (v ? '' : ' unmet') + ' st-' + (st || 'none'), style: { '--rc': S.color } });
      c.innerHTML = `<div class="rv-port">${SBR.art.portrait(C.portrait)}</div><div class="rv-name">${C.name.split(' ')[0]}</div><div class="rv-stance">${v ? S.name : '—'}</div><div class="rv-meet">${[...Array(C.meetings)].map((_, i) => `<i class="${v && i < (v.meetings || 0) ? 'on' : ''}"></i>`).join('')}</div>`;
      if (SBR.tip) SBR.tip.bind(c, `<b>${C.name}</b> — ${v ? S.name : 'not met yet'}<br>${v ? S.desc : 'Your paths have not crossed.'}<br><small>Meetings: ${v ? v.meetings || 0 : 0} / ${C.meetings}${!free(id) ? ' · not racing against you now' : ''}</small>`);
      row.appendChild(c);
    });
    box.appendChild(row);
    return box;
  }
  function decorateStandings(root) {
    if (!root || !run() || !SBR.campaign) return;
    const R = rivalsW();
    root.querySelectorAll('.stand-row').forEach(row => {
      const nm = (row.querySelector('.sr-name') || {}).textContent;
      const id = Object.keys(CHAINS).find(k => SBR.RIVALS[k] && SBR.RIVALS[k].name === nm);
      if (!id || !R[id] || R[id].stance === 'neutral') return;
      const S = STANCE[R[id].stance];
      row.querySelector('.sr-name').insertAdjacentHTML('beforeend', ` <span class="sr-stance" style="--rc:${S.color}">${S.name}</span>`);
    });
  }

  /* ---------------- hooks into files that load later ---------------- */
  function hook() {
    // stance deltas live in SBR.CONSEQ as `rv: { id: n }`; meetings are counted from the rv_<id>_<n> event keys
    const baseOC = SBR.campaign.onChoice;
    SBR.campaign.onChoice = (key, g) => {
      const out = baseOC(key, g);
      try {
        const C = SBR.CONSEQ[key] || SBR.CONSEQ[key.replace(/:fail$/, '')];
        const w = world();
        if (C && C.rv && !w.keys['rv:' + key]) { w.keys['rv:' + key] = true; Object.entries(C.rv).forEach(([id, n]) => shift(id, n, g)); }
        const m = /^rv_([a-z]+)_\d+:/.exec(key);
        if (m) { const id = Object.keys(CHAINS).find(k => CHAINS[k].first.startsWith('rv_' + m[1] + '_')); if (id) { const R = rivalsW(); R[id] = R[id] || { stance: 'neutral', score: 0, meetings: 0 }; R[id].meetings = (R[id].meetings || 0) + 1; } }
      } catch (e) { console.error('[route]', e); }
      return out;
    };
  }
  hook();
  window.addEventListener('load', () => {
    if (SBR.Combat && SBR.Combat.prototype.applyStoryFlags) {
      const base = SBR.Combat.prototype.applyStoryFlags;
      SBR.Combat.prototype.applyStoryFlags = function () { const out = base.apply(this, arguments); try { cameo(this); } catch (e) { console.error('[route] cameo', e); } return out; };
    }
    if (SBR.chronicleUI) {
      const baseOpen = SBR.chronicleUI.open;
      SBR.chronicleUI.open = () => {
        baseOpen();
        const pages = document.querySelectorAll('#overlay .chronicle'); const pg = pages[pages.length - 1];
        const rel = pg && pg.querySelector('.chr-rel');
        if (rel && SBR.run && Object.keys(rivalsW()).length) rel.insertAdjacentElement('afterend', rivalPanel());
      };
    }
  });

  return { CFG, TAGS, STANCE, CHAINS, ensure, generate, offered, needsPick, pickRoad, choose, weight, stars, tagNow, nodeNow, strip, mapGraph, rivalPanel, decorateStandings,
    startAct, pickAttacker, sprintBias, stanceOf, shift, free, icon };
})();

/* ================= Road table entries (applied by SBR.route, not by resolveChoice) ================= */
Object.assign(SBR.CONSEQ, {
  'road:canyon': { deed: 'Took the canyon trails, where the ambushes are.' },
  'road:town': { rep: { law: 1 }, deed: 'Rode through the frontier towns and let them see you.' },
  'road:sacred': { rep: { natives: 1 }, deed: 'Rode across sacred ground, and kept to the old paths.' },
  'road:shortcut': { rep: { racers: -1 }, deed: 'Cut the corner off the marked course.' },
});

/* ================= Rival storylines: they arrive only through the consequence queue ================= */
(() => {
  const st = id => SBR.route.stanceOf(id) || 'neutral';
  const free = id => () => SBR.route.free(id);
  const byStance = (id, T) => () => T[st(id)] || T.neutral;
  SBR.CAMPAIGN_EVENTS.push(
    /* ---- Diego Brando ---- */
    { id: 'rv_diego_1', acts: [1, 2], type: 'event', title: 'Dio Cuts the Corner', blurb: 'A pale horse slams into your flank at the creek.', icon: 'skull', art: 'diego', cond: free('diego'), reveals: 'Diego Brando has decided you are worth watching.',
      text: 'Silver Bullet hits your horse shoulder-first at the creek crossing. Diego Brando doesn’t even look back. “Out of my way. This race is for people who can stand on their own.”',
      choices: [
        { label: 'Race him to the ford (RIDE)', check: { stat: 'ride', dc: 13 }, ok: { text: 'You hit the ford a length ahead. Diego’s eyes narrow. For the first time he looks at you properly. (+6 pace)', fx: g => g.pace(6) }, fail: { text: 'He splashes past, laughing, and throws mud in your face. (−4 pace)', fx: g => g.pace(-4) } },
        { label: 'Shove him back', ok: { text: 'Silver Bullet stumbles. Diego wipes the mud off his cheek and smiles. He won’t forget this. (+3 pace)', fx: g => g.pace(3) } },
        { label: 'Let him pass', ok: { text: 'He rides on. Your horse gets a breather at the water. (Party heals a little.)', fx: g => g.healAll(0.1) } },
      ] },
    { id: 'rv_diego_2', acts: [2, 3], type: 'event', title: 'Dinosaur Tracks', blurb: 'Three-toed prints circle your camp.', icon: 'skull', art: 'diego', cond: free('diego'), reveals: 'Diego came back for you, with teeth.',
      get text() { return byStance('diego', { rival: 'Three-toed prints circle your camp. Diego steps out of the dark, pupils slit like a lizard’s. “You shoved me at the creek. My little ones remember faces.”', respect: 'Three-toed prints circle your camp. Diego steps out of the dark, pupils slit like a lizard’s. “You’re faster than you look. You’ve felt the Corpse too, haven’t you? Let’s talk.”', neutral: 'Three-toed prints circle your camp. Diego steps out of the dark, pupils slit like a lizard’s. “The Corpse Parts. Tell me what you know and my pets leave you alone.”' })(); },
      choices: [
        { label: 'Trade what you know about the Corpse', ok: { text: 'You tell him about the Parts. He tells you where the President’s men are digging. A fair trade, for now. (+8 pace)', fx: g => { g.pace(8); g.flag('presidentPlan'); } } },
        { label: 'Tell him to crawl back to his swamp', ok: { text: 'He clicks his tongue. The brush explodes with teeth.', fight: { enemies: ['raptor', 'raptor'], after: g => g.money(20) } } },
        { label: 'Drive the raptors off with fire (GRIT)', check: { stat: 'grit', dc: 13 }, ok: { text: 'You swing a burning branch until the things scatter. Diego claps, slowly. “Not bad, Joestar.”', fx: g => g.statUpAll('grit', 1) }, fail: { text: 'They don’t scare. They bite.', fight: { enemies: ['raptor', 'raptor', 'raptor'] } } },
      ] },
    { id: 'rv_diego_3', acts: [3, 4], type: 'event', title: 'Silver Bullet Is Lame', blurb: 'Diego kneels in the snow beside his horse.', icon: 'heart', art: 'diego', cond: free('diego'), reveals: 'What you did beside Silver Bullet stayed with Diego.',
      text: 'Diego is kneeling in the snow beside Silver Bullet. The foreleg is swollen. For once he looks like what he is: a boy from the gutter with one thing in the world. He hears you and doesn’t turn around.',
      choices: [
        { label: 'Treat the leg with your liniment ($30)', cost: { money: 30 }, ok: { text: 'You work in silence. When the horse stands, Diego says nothing. He doesn’t have to.', fx: g => g.rep('racers', 1) } },
        { label: 'Take the lead while he’s down', ok: { text: 'You ride past. You feel his stare on your back for a mile. (+10 pace)', fx: g => g.pace(10) } },
        { label: '“Get up. I want to beat you when you’re whole.”', ok: { text: 'He laughs, a real one. “Then don’t fall behind, Joestar.” (+4 pace)', fx: g => g.pace(4) } },
      ] },
    { id: 'rv_diego_4', acts: [4, 5], type: 'event', title: 'Across the Line', blurb: 'Diego waits at the crossroads.', icon: 'crown', art: 'diego', cond: free('diego'), reveals: 'You and Diego settled your rivalry at the crossroads.',
      get text() { return byStance('diego', { rival: 'Diego blocks the crossroads, Scary Monsters already stretching his jaw. “Three times you’ve crossed me. There won’t be a fourth.”', ally: 'Diego is waiting at the crossroads with two cups of coffee. “Valentine wants us both dead. I’d rather that didn’t happen before I beat you properly.”', respect: 'Diego waits at the crossroads. “One more race, Joestar. No Stands, no tricks. Just riders.”', neutral: 'Diego waits at the crossroads, bored. “You again. Let’s settle this.”' })(); },
      choices: [
        { label: 'Shake his hand', ok: { text: 'His grip is cold and strong. “Don’t make me regret this.” (If he trusts you, he’ll be there when it counts.)', fx: g => { if (st('diego') === 'ally') g.flag('diegoTruce'); } } },
        { label: 'Settle it here', ok: { text: 'He smiles like a lizard in the sun.', fight: { enemies: ['diego_rival'], elite: true, after: g => { g.money(60); g.threat(0.5); } } } },
        { label: 'Race him to the next town (RIDE)', check: { stat: 'ride', dc: 15 }, ok: { text: 'Neck and neck for three miles, and you win by a nose. Diego doesn’t say a word, but he tips his hat. (+10 pace)', fx: g => g.pace(10) }, fail: { text: 'He wins by a length and doesn’t look back. (−6 pace)', fx: g => g.pace(-6) } },
      ] },

    /* ---- Pocoloco ---- */
    { id: 'rv_poco_1', acts: [1, 2], type: 'event', title: 'The Luckiest Man Alive', blurb: 'A grinning racer finds gold in a horse pie.', icon: 'coin', art: 'pocoloco', cond: free('pocoloco'), reveals: 'Pocoloco told everyone about you. Everyone.',
      text: 'Pocoloco is sitting by the trail, eating beans, holding a gold nugget he found in a horse pie. Hey Ya! whispers on his shoulder: “Share today, and tomorrow the world shares with you!”',
      choices: [
        { label: 'Share his lunch', ok: { text: 'Beans, coffee and a hundred stories. You ride on warm. (Party heals a little.)', fx: g => g.healAll(0.15) } },
        { label: 'Bet him on a coin toss (LUCK)', check: { stat: 'luck', dc: 12 }, ok: { text: 'Heads. Pocoloco howls with laughter and pays up. “You’re lucky too!” (+$40)', fx: g => g.money(40) }, fail: { text: 'Tails. Of course it’s tails. (−$20)', fx: g => g.money(-20) } },
        { label: 'Tell him luck always runs out', ok: { text: '“Not today!” he says, and rides off whistling. You keep moving. (+4 pace)', fx: g => g.pace(4) } },
      ] },
    { id: 'rv_poco_2', acts: [2, 3, 4], type: 'event', title: 'Hey Ya! Says Go Left', blurb: 'Pocoloco waits where the trail splits.', icon: 'star', art: 'pocoloco', cond: free('pocoloco'), reveals: 'Hey Ya! was right about the left road. It usually is.',
      get text() { return byStance('pocoloco', { rival: 'Pocoloco is at the split in the trail, arguing with his Stand. He sees you and grins. “Hey Ya! says you’re unlucky. Go right!”', neutral: 'Pocoloco is at the split in the trail. “Hey Ya! says the left road is lucky. Come on, ride with me!”', respect: 'Pocoloco waves from the split in the trail. “Friend! Hey Ya! says the left road is lucky, for BOTH of us!”' })(); },
      choices: [
        { label: 'Follow Pocoloco left', ok: { text: 'A dry riverbed, flat as a table. You fly. (+8 pace)', fx: g => g.pace(8) } },
        { label: 'Take the right road alone', ok: { text: 'A dead man’s saddlebag in the rocks. (+$30)', fx: g => g.money(30) } },
        { label: 'Ask Hey Ya! about your own luck (LUCK)', check: { stat: 'luck', dc: 13 }, ok: { text: '“You… will find what you lost.” Everyone feels a little luckier. (Party +1 LUCK)', fx: g => g.statUpAll('luck', 1) }, fail: { text: 'Hey Ya! looks at you for a long time and says nothing.', fx: g => g.threat(0.25) } },
      ] },
    { id: 'rv_poco_3', acts: [4, 5, 6], type: 'event', title: 'Pocoloco’s Unlucky Day', blurb: 'Rain, a thrown shoe, and bandits.', icon: 'skull', art: 'pocoloco', cond: free('pocoloco'), reveals: 'Even the luckiest man alive needs a friend some days.',
      text: 'Rain. Pocoloco’s horse has thrown a shoe, and three outlaws are circling him. Hey Ya! is shouting encouragement, which is not helping.',
      choices: [
        { label: 'Ride in beside him', ok: { text: 'Guns out, back to back.', fight: { enemies: ['outlaw', 'bandit', 'bandit'], after: g => g.money(30) } } },
        { label: 'Lend him your spare shoe ($25)', cost: { money: 25 }, ok: { text: 'He is back in the saddle in a minute and the outlaws think better of it. “I owe you!”', fx: g => g.rep('racers', 1) } },
        { label: 'Ride past', ok: { text: 'You don’t look back. (+6 pace)', fx: g => g.pace(6) } },
      ] },

    /* ---- Sandman ---- */
    { id: 'rv_sand_1', acts: [1, 2], type: 'event', title: 'The Running Man', blurb: 'A man on foot keeps pace with the horses.', icon: 'recruit', art: 'sandman', cond: free('sandman'), reveals: 'Sandman remembered the well.',
      text: 'A native runner, no horse, keeps pace with the riders across the flats. He stops at the well to drink. Two riders spit at his feet and jeer.',
      choices: [
        { label: 'Share your water with him', ok: { text: 'He drinks, nods once, and is gone before you have corked the canteen.', fx: g => g.rep('natives', 1) } },
        { label: 'Race him to the ridge (RIDE)', check: { stat: 'ride', dc: 13 }, ok: { text: 'You reach the ridge together. He almost smiles. (+6 pace)', fx: g => g.pace(6) }, fail: { text: 'He is waiting at the top when you arrive, not even breathing hard. (−4 pace)', fx: g => g.pace(-4) } },
        { label: 'Laugh with the others', ok: { text: 'He looks at you, only once. (+2 pace)', fx: g => g.pace(2) } },
      ] },
    { id: 'rv_sand_2', acts: [2, 3], type: 'event', title: 'Lines in the Sand', blurb: 'The running man draws a map in the dust.', icon: 'map', art: 'sandman', cond: free('sandman'), reveals: 'What you told Sandman about his land changed his mind about you.',
      text: 'The running man, Sandman, crouches by your fire and draws his people’s land in the dust. “The prize could buy it back. And the President’s men are digging on it, for something they won’t name.”',
      choices: [
        { label: 'Tell him what they are digging for', ok: { text: 'He listens to every word about the Corpse. “Then it is not theirs, either.”', fx: g => { g.rep('natives', 1); g.rep('vatican', -1); } } },
        { label: 'Promise to speak for his people if you win', ok: { text: '“Words are cheap in this country,” he says. But he writes your name in the sand.', fx: g => g.rep('natives', 2) } },
        { label: 'Keep your own counsel', ok: { text: 'He rubs the map out with his palm and leaves. (+4 pace)', fx: g => g.pace(4) } },
      ] },
    { id: 'rv_sand_3', acts: [3], type: 'event', title: 'Before the River', blurb: 'Sandman on the ridge, spear lowered.', icon: 'skull', art: 'sandman', cond: free('sandman'), reveals: 'What you said on the ridge decided how Sandman met you at the river.',
      get text() { return byStance('sandman', { rival: 'Sandman on the ridge above the river. “The man who hired me wants you dead in that water. I think I will enjoy it.”', ally: 'Sandman on the ridge above the river. “The man who hired me wants you dead in that water. I have not decided to do it.”', respect: 'Sandman on the ridge above the river. “The man who hired me wants you dead in that water. Tell me why I shouldn’t.”', neutral: 'Sandman on the ridge above the river. “The man who hired me wants you dead in that water.”' })(); },
      choices: [
        { label: 'Ask him not to fight you (RESOLVE)', check: { stat: 'res', dc: 14 }, ok: { text: 'He is quiet a long time. “We will see, at the river.”', fx: g => g.rep('natives', 1) }, fail: { text: '“Pretty words,” he says, and is gone.', fx: g => g.threat(0.25) } },
        { label: 'Warn him about the President', ok: { text: '“I know what he is.” He hands you a smooth stone. “If the ground speaks, don’t answer.”', fx: g => g.flag('silentWarning') } },
        { label: 'Draw on him', ok: { text: 'He’s already gone. Something tells you he won’t talk at the river.', fx: g => g.flag('sandmanGrudge') } },
      ] },

    /* ---- Norisuke Higashikata ---- */
    { id: 'rv_nori_1', acts: [2, 3], type: 'event', title: 'The Old Man and the Pack', blurb: 'An old racer eats a peach beside his fallen packhorse.', icon: 'heart', art: 'norisuke', cond: free('norisuke'), reveals: 'Old Norisuke tells everyone he meets about you.',
      text: 'Norisuke Higashikata, far too old for this race, sits beside his collapsed packhorse eating a peach. “My family has always had strange luck with fruit,” he says, as if that explains everything.',
      choices: [
        { label: 'Help him spread the load', ok: { text: 'An hour of work and the horse is up. He presses a peach on each of you. (Party heals a little, −3 pace.)', fx: g => { g.healAll(0.12); g.pace(-3); } } },
        { label: 'Buy his spare supplies ($20)', cost: { money: 20 }, ok: { text: 'He haggles like a merchant and throws in something extra.', fx: g => g.itemRandom() } },
        { label: '“Go home, grandpa.”', ok: { text: '“I am going home. It’s on the other side of the country.” (+4 pace)', fx: g => g.pace(4) } },
      ] },
    { id: 'rv_nori_2', acts: [3, 4, 5], type: 'event', title: 'A Seed for the Road', blurb: 'Norisuke has something he wants you to carry.', icon: 'star', art: 'norisuke', cond: free('norisuke'), reveals: 'Norisuke’s seed was meant for someone who needed it.',
      get text() { return byStance('norisuke', { rival: 'Norisuke rides up, stiff and formal. “You were rude to me. But my family pays its debts, even to the rude.” He holds out a strange seed.', neutral: 'Norisuke rides up and holds out a strange, heavy seed. “Plant this for someone who needs it more than you.”', respect: 'Norisuke rides up, delighted. “Young friend! Take this seed. It is for someone who needs it more than you.”' })(); },
      choices: [
        { label: 'Take it, and promise to pass it on', ok: { text: 'It is warm in your palm, like fruit in the sun. (Party +1 RESOLVE)', fx: g => g.statUpAll('res', 1) } },
        { label: 'Offer to buy it outright ($30)', cost: { money: 30 }, ok: { text: '“It isn’t for sale,” he says, and takes the money anyway. It sprouts in the saddlebag overnight.', fx: g => g.itemRandom() } },
        { label: 'Refuse politely', ok: { text: '“Then I’ll find someone else.” He tips his hat. (+3 pace)', fx: g => g.pace(3) } },
      ] },
    { id: 'rv_nori_3', acts: [5, 6], type: 'event', title: 'The Last Mile Together', blurb: 'Norisuke has fallen behind, and he is not alone.', icon: 'book', art: 'norisuke', cond: free('norisuke'), reveals: 'Norisuke made it to New York. His family remembers who helped.',
      text: 'Norisuke has fallen behind the pack. Two men in dark coats ride a little too close to him. He sees you and holds up a letter. “For my family in New York, in case I don’t get there.”',
      choices: [
        { label: 'Carry the letter', ok: { text: 'You tuck it inside your coat. It is addressed to a house that doesn’t exist yet.', fx: g => { g.flag('norisukeLetter'); g.rep('law', 1); } } },
        { label: 'Escort him past the agents', ok: { text: 'You ride between the old man and the coats.', fight: { enemies: ['agent', 'agent'], after: g => g.rep('president', -1) } } },
        { label: 'Leave him to it', ok: { text: 'You ride on. When you look back he is very small. (+8 pace)', fx: g => g.pace(8) } },
      ] },
  );

  const CQ = SBR.CONSEQ;
  Object.assign(CQ, {
    'rv_diego_1:0': { rv: { diego: 1 }, deed: 'Beat Diego Brando to the ford.', later: ['rv_diego_2', 4, 8] },
    'rv_diego_1:0:fail': { rv: { diego: -1 }, deed: 'Diego Brando threw mud in your face at the creek.', later: ['rv_diego_2', 4, 8] },
    'rv_diego_1:1': { rv: { diego: -2 }, deed: 'Shoved Diego Brando off the trail.', later: ['rv_diego_2', 4, 8] },
    'rv_diego_1:2': { rv: { diego: 0 }, deed: 'Let Diego Brando pass at the creek.', later: ['rv_diego_2', 4, 8] },
    'rv_diego_2:0': { rv: { diego: 2 }, rep: { vatican: -1 }, deed: 'Traded secrets about the Corpse with Diego.', later: ['rv_diego_3', 4, 8] },
    'rv_diego_2:1': { rv: { diego: -2 }, deed: 'Told Diego to crawl back to his swamp.', later: ['rv_diego_3', 4, 8] },
    'rv_diego_2:2': { rv: { diego: 1 }, deed: 'Drove off Diego’s raptors with fire.', later: ['rv_diego_3', 4, 8] },
    'rv_diego_2:2:fail': { rv: { diego: -1 }, deed: 'Diego’s raptors got their teeth into you.', later: ['rv_diego_3', 4, 8] },
    'rv_diego_3:0': { rv: { diego: 2 }, rep: { racers: 1 }, deed: 'Treated Silver Bullet’s leg in the snow.', later: ['rv_diego_4', 4, 8] },
    'rv_diego_3:1': { rv: { diego: -2 }, deed: 'Rode past Diego while his horse was lame.', later: ['rv_diego_4', 4, 8] },
    'rv_diego_3:2': { rv: { diego: 1 }, deed: 'Told Diego to get up so you could beat him whole.', later: ['rv_diego_4', 4, 8] },
    'rv_diego_4:0': { rv: { diego: 1 }, deed: 'Shook Diego Brando’s hand at the crossroads.' },
    'rv_diego_4:1': { rv: { diego: -3 }, threat: 0.5, deed: 'Fought Diego Brando at the crossroads.' },
    'rv_diego_4:2': { rv: { diego: 1 }, deed: 'Beat Diego Brando in a race to the next town.' },
    'rv_diego_4:2:fail': { rv: { diego: -1 }, deed: 'Lost a race to Diego Brando.' },
    'rv_poco_1:0': { rv: { pocoloco: 2 }, rep: { racers: 1 }, deed: 'Shared beans with Pocoloco.', later: ['rv_poco_2', 4, 9] },
    'rv_poco_1:1': { rv: { pocoloco: 1 }, deed: 'Won a coin toss against the luckiest man alive.', later: ['rv_poco_2', 4, 9] },
    'rv_poco_1:1:fail': { rv: { pocoloco: 1 }, deed: 'Lost a coin toss to Pocoloco. Of course.', later: ['rv_poco_2', 4, 9] },
    'rv_poco_1:2': { rv: { pocoloco: -1 }, deed: 'Told Pocoloco his luck would run out.', later: ['rv_poco_2', 4, 9] },
    'rv_poco_2:0': { rv: { pocoloco: 1 }, deed: 'Followed Hey Ya!’s advice down the left road.', later: ['rv_poco_3', 5, 10] },
    'rv_poco_2:1': { rv: { pocoloco: -1 }, deed: 'Ignored Hey Ya! and took the right road alone.', later: ['rv_poco_3', 5, 10] },
    'rv_poco_2:2': { rv: { pocoloco: 1 }, deed: 'Asked Hey Ya! about your luck.', later: ['rv_poco_3', 5, 10] },
    'rv_poco_2:2:fail': { deed: 'Hey Ya! had nothing to say about your luck.', later: ['rv_poco_3', 5, 10] },
    'rv_poco_3:0': { rv: { pocoloco: 2 }, rep: { racers: 1 }, deed: 'Fought outlaws back to back with Pocoloco.' },
    'rv_poco_3:1': { rv: { pocoloco: 2 }, deed: 'Lent Pocoloco a horseshoe in the rain.' },
    'rv_poco_3:2': { rv: { pocoloco: -2 }, rep: { racers: -1 }, deed: 'Rode past Pocoloco when outlaws had him.' },
    'rv_sand_1:0': { rv: { sandman: 2 }, rep: { natives: 1 }, deed: 'Shared your water with a running man.', later: ['rv_sand_2', 3, 7] },
    'rv_sand_1:1': { rv: { sandman: 1 }, deed: 'Raced the running man to the ridge.', later: ['rv_sand_2', 3, 7] },
    'rv_sand_1:1:fail': { rv: { sandman: 0 }, deed: 'The running man beat your horse to the ridge.', later: ['rv_sand_2', 3, 7] },
    'rv_sand_1:2': { rv: { sandman: -2 }, rep: { natives: -1 }, deed: 'Laughed at the running man with the others.', later: ['rv_sand_2', 3, 7] },
    'rv_sand_2:0': { rv: { sandman: 1 }, deed: 'Told Sandman what the President’s men are digging for.', later: ['rv_sand_3', 2, 5] },
    'rv_sand_2:1': { rv: { sandman: 2 }, deed: 'Promised to speak for Sandman’s people.', later: ['rv_sand_3', 2, 5] },
    'rv_sand_2:2': { rv: { sandman: -1 }, deed: 'Kept your own counsel with Sandman.', later: ['rv_sand_3', 2, 5] },
    'rv_sand_3:0': { rv: { sandman: 1 }, deed: 'Asked Sandman not to fight you at the river.' },
    'rv_sand_3:0:fail': { rv: { sandman: -1 }, deed: 'Sandman wasn’t moved by your words.' },
    'rv_sand_3:1': { rv: { sandman: 1 }, flag: 'silentWarning', deed: 'Warned Sandman about the President.' },
    'rv_sand_3:2': { rv: { sandman: -3 }, rep: { natives: -2 }, deed: 'Drew on Sandman on the ridge.' },
    'rv_nori_1:0': { rv: { norisuke: 2 }, deed: 'Helped old Norisuke get his packhorse up.', later: ['rv_nori_2', 5, 10] },
    'rv_nori_1:1': { rv: { norisuke: 1 }, deed: 'Bought old Norisuke’s spare supplies.', later: ['rv_nori_2', 5, 10] },
    'rv_nori_1:2': { rv: { norisuke: -1 }, deed: 'Told old Norisuke to go home.', later: ['rv_nori_2', 5, 10] },
    'rv_nori_2:0': { rv: { norisuke: 2 }, deed: 'Promised Norisuke you would pass his seed on.', later: ['rv_nori_3', 5, 10] },
    'rv_nori_2:1': { rv: { norisuke: -1 }, deed: 'Tried to buy Norisuke’s seed.', later: ['rv_nori_3', 5, 10] },
    'rv_nori_2:2': { rv: { norisuke: 0 }, deed: 'Politely refused Norisuke’s seed.', later: ['rv_nori_3', 5, 10] },
    'rv_nori_3:0': { rv: { norisuke: 1 }, flag: 'norisukeLetter', deed: 'Carried Norisuke’s letter for his family in New York.' },
    'rv_nori_3:1': { rv: { norisuke: 2 }, rep: { president: -1 }, deed: 'Escorted Norisuke past the President’s agents.' },
    'rv_nori_3:2': { rv: { norisuke: -2 }, deed: 'Left old Norisuke behind.' },
  });
})();
