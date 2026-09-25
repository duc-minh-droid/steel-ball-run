/* Debug tool: jump to any point in the game.
   Open the panel with the backtick key (`) or load the page with ?debug. Everything is also scriptable:
     SBR.debug.setup({ lead, act, stage, party, level, threat, money, flags, world })
     SBR.debug.goto(act, stage)        stage screen at that point
     SBR.debug.event(id)               play a side encounter (SBR.EVENTS id)
     SBR.debug.scene(id)               play a story scene (SBR.STORY id)
     SBR.debug.fight([ids], opts)      any battle; SBR.debug.randomFight(act, stage, kind)
     SBR.debug.boss(act)               the act's rolled boss (pre-scene, fight, post-scene)
     SBR.debug.area(id, stage)         inside a detour
     SBR.debug.sprint(act)             a stage-finish race
     SBR.debug.ending(id)              an ending (campaign endings when present)
     SBR.debug.state()                 compact dump of the run
   Jumps return promises that resolve when that piece of the game finishes. */
'use strict';

SBR.debug = (() => {
  const D = () => SBR.game._debug;
  const G = () => SBR.game._debug.G;
  const LEVEL_FOR_ACT = { 1: 1, 2: 3, 3: 5, 4: 7, 5: 9, 6: 11 };
  const ACT_FLAGS = { 2: ['tusk1'], 3: ['tusk1', 'eyes'], 4: ['tusk1', 'eyes', 'golden', 'tusk2'], 5: ['tusk1', 'eyes', 'golden', 'tusk2', 'tusk3'], 6: ['tusk1', 'eyes', 'golden', 'tusk2', 'tusk3', 'ballbreaker', 'tusk4'] };
  const ACT_PARTY = { 1: ['gyro'], 2: ['gyro', 'mountaintim'], 3: ['gyro', 'hotpants'], 4: ['gyro', 'hotpants', 'wekapipo'], 5: ['gyro', 'lucy', 'diego'], 6: ['gyro', 'pocoloco'] };

  function closeAll() {
    try { SBR.ui.closeAllModals(); } catch (e) {}
    document.querySelectorAll('.dlg-wrap, .sprint, .boss-intro, .cutin, .tbc').forEach(n => n.remove());
    SBR.inBattle = false;
  }
  /** make (or reshape) a run at a given point */
  function setup(o = {}) {
    closeAll();
    const act = o.act || (SBR.run && SBR.run.act) || 1;
    if (!SBR.run || o.fresh !== false) {
      SBR.meta.tutorialDone = true;
      D().newRun(o.horse || 'slowdancer', o.item || 'colt', o.lead || 'johnny');
    }
    const r = SBR.run;
    r.act = act; r.stage = o.stage || 1; r.stageCards = null; r.area = null;
    r.lineup = r.lineup || {}; r.conditions = r.conditions || {};
    if (o.lineup) r.lineup[act] = o.lineup; else if (!r.lineup[act]) r.lineup[act] = SBR.rollLineup(act);
    if (o.condition) r.conditions[act] = o.condition; else if (!r.conditions[act]) r.conditions[act] = SBR.rollCondition(act);
    (o.flags || ACT_FLAGS[act] || []).forEach(f => { r.flags[f] = true; });
    (o.party || ACT_PARTY[act] || []).forEach(id => { if (!r.party.some(m => m.id === id)) G().recruit(id, true); });
    const lvl = o.level || LEVEL_FOR_ACT[act] || 1;
    r.party.forEach(m => { while (m.level < lvl) { m.level++; m.points += 3; m.maxHp += 3; } SBR.game.autoAssign(m); m.hp = m.maxHp; m.exhaustion = 0; });
    if (o.threat != null) r.threat = o.threat;
    if (o.money != null) r.money = o.money;
    if (o.power) { const m = r.party.find(x => x.id === 'custom'); if (m) m.path = o.power; }
    if (o.evo) r.flags[o.evo === 'hamon' ? 'ajaHamon' : 'ajaVampire'] = true;
    if (o.paths) Object.entries(o.paths).forEach(([cid, p]) => { const m = r.party.find(x => x.id === cid); if (m) m.path = p; });
    if (o.world && SBR.campaign) SBR.campaign.merge(o.world);
    if (o.pace != null) r.pace = o.pace;
    SBR.saveRun();
    return r;
  }
  const settle = (ms = 50) => new Promise(res => setTimeout(res, ms));
  async function goto(act, stage = 1, o = {}) { setup(Object.assign({}, o, { act, stage, fresh: o.fresh != null ? o.fresh : !SBR.run })); D().showStage(); await settle(); }
  function cardFor(ev) { return { id: ev.id, type: ev.type, title: ev.title, blurb: ev.blurb, icon: ev.icon, pace: ev.pace, art: ev.art, enemies: ev.fight && ev.fight.random ? SBR.buildFight(SBR.run.act, SBR.run.stage, ev.type === 'elite' ? 'elite' : 'fight') : null }; }
  async function event(id, o = {}) {
    if (!SBR.run || o.act) setup(Object.assign({ act: o.act || 1, stage: o.stage || 2 }, o));
    const ev = SBR.EVENTS.find(e => e.id === id) || (SBR.CAMPAIGN_EVENTS && SBR.CAMPAIGN_EVENTS.find(e => e.id === id));
    if (!ev) throw new Error('no event ' + id);
    return D().resolveCard(cardFor(ev));
  }
  async function scene(id, o = {}) {
    if (!SBR.run || o.act) setup(Object.assign({ act: o.act || 1, stage: o.stage || 2 }, o));
    if (!SBR.STORY[id]) throw new Error('no scene ' + id);
    return D().playScene(id);
  }
  async function fight(ids, opts = {}) { if (!SBR.run) setup({ act: opts.act || 1 }); return D().fight(ids, opts); }
  async function randomFight(act, stage = 3, kind = 'fight', o = {}) { setup(Object.assign({ act, stage, fresh: !SBR.run }, o)); return D().fight(SBR.buildFight(act, stage, kind), { elite: kind === 'elite' }); }
  async function boss(act, o = {}) { setup(Object.assign({ act, stage: SBR.ACTS[act].stages }, o)); return D().bossStage(); }
  async function area(id, stage = 1, o = {}) { const A = SBR.AREAS[id]; setup(Object.assign({ act: A.acts[0], stage: 2 }, o)); G().enterArea(id); SBR.run.area.stage = stage; D().showStage(); await settle(); }
  async function sprint(act = 1, o = {}) { setup(Object.assign({ act }, o)); const A = SBR.ACTS[act]; return SBR.sprint.run({ name: A.finish.name, act, favourite: A.finish.favourite }); }
  async function ending(id, o = {}) { setup(Object.assign({ act: 6, stage: 3 }, o)); if (SBR.campaign && id) SBR.run.forceEnding = id; return D().ending(); }
  function state() {
    const r = SBR.run; if (!r) return null;
    return { lead: r.lead, act: r.act, stage: r.stage, area: r.area, threat: r.threat, money: r.money, party: r.party.map(m => `${m.id} L${m.level} ${m.hp}/${m.maxHp}${m.path ? ' ' + m.path : ''}`),
      lineup: r.lineup && r.lineup[r.act], condition: r.conditions && r.conditions[r.act], flags: Object.keys(r.flags), world: r.world };
  }

  /* ---------------- panel ---------------- */
  function panel() {
    const old = document.querySelector('.debug-panel'); if (old) { old.remove(); return; }
    const p = document.createElement('div');
    p.className = 'debug-panel';
    const opt = (list, fmt = x => x) => list.map(x => `<option value="${x}">${fmt(x)}</option>`).join('');
    const evs = SBR.EVENTS.concat(SBR.CAMPAIGN_EVENTS || []).map(e => e.id);
    p.innerHTML = `<div class="dbg-head">DEBUG <small>\` to close</small></div>
      <div class="dbg-row"><label>Lead</label><select data-k="lead">${opt(SBR.LEADS)}</select><label>Act</label><input data-k="act" type="number" min="1" max="6" value="${(SBR.run && SBR.run.act) || 1}"><label>Stage</label><input data-k="stage" type="number" min="1" max="7" value="${(SBR.run && SBR.run.stage) || 1}"></div>
      <div class="dbg-row"><label>Threat</label><input data-k="threat" type="number" step="0.5" value="${(SBR.run && SBR.run.threat) || 0}"><label>Level</label><input data-k="level" type="number" min="1" max="20" placeholder="auto"><button data-a="goto">Go to stage</button><button data-a="new">Fresh run</button></div>
      <div class="dbg-row"><label>Event</label><select data-k="event">${opt(evs)}</select><button data-a="event">Play</button></div>
      <div class="dbg-row"><label>Scene</label><select data-k="scene">${opt(Object.keys(SBR.STORY))}</select><button data-a="scene">Play</button></div>
      <div class="dbg-row"><label>Fight</label><input data-k="foes" placeholder="bandit,coyote (blank = generated)"><select data-k="kind"><option>fight</option><option>elite</option></select><button data-a="fight">Fight</button></div>
      <div class="dbg-row"><label>Boss</label><button data-a="boss">Act boss</button><select data-k="lineup"><option value="">rolled lineup</option>${[1, 2, 3, 4, 5].map(a => (SBR.LINEUPS[a] || []).map(v => `<option value="${a}:${v.id}">Act ${a}: ${v.id}</option>`).join('')).join('')}</select><button data-a="sprint">Sprint</button></div>
      <div class="dbg-row"><label>Detour</label><select data-k="area">${opt(Object.keys(SBR.AREAS))}</select><input data-k="astage" type="number" min="1" max="3" value="1"><button data-a="area">Enter</button></div>
      <div class="dbg-row"><label>Ending</label><select data-k="ending">${opt(SBR.ENDINGS ? Object.keys(SBR.ENDINGS) : ['canon'])}</select><button data-a="ending">Play</button></div>
      <div class="dbg-row"><button data-a="heal">Heal all</button><button data-a="rich">+$500</button><button data-a="gear">All gear</button><button data-a="mats">All mats</button><button data-a="state">Log state</button></div>`;
    document.body.appendChild(p);
    const v = k => p.querySelector(`[data-k="${k}"]`).value;
    const base = () => { const o = { act: +v('act') || 1, stage: +v('stage') || 1, lead: v('lead'), threat: +v('threat') || 0 }; if (v('level')) o.level = +v('level'); return o; };
    const lineupOf = () => { const s = v('lineup'); if (!s) return null; const [a, id] = s.split(':'); const L = SBR.LINEUPS[+a].find(x => x.id === id); return { act: +a, id: L.id, story: null, boss: L.boss || null, beats: L.beats }; };
    p.addEventListener('click', async e => {
      const a = e.target.dataset && e.target.dataset.a; if (!a) return;
      try {
        if (a === 'goto') await goto(+v('act'), +v('stage'), Object.assign(base(), { fresh: false }));
        if (a === 'new') await goto(+v('act'), +v('stage'), Object.assign(base(), { fresh: true }));
        if (a === 'event') event(v('event'), base());
        if (a === 'scene') scene(v('scene'), base());
        if (a === 'fight') { const ids = v('foes').split(',').map(s => s.trim()).filter(Boolean); setup(Object.assign(base(), { fresh: !SBR.run })); fight(ids.length ? ids : SBR.buildFight(+v('act'), +v('stage'), v('kind')), { elite: v('kind') === 'elite' }); }
        if (a === 'boss') { const L = lineupOf(); const o = base(); if (L) { o.act = L.act; o.lineup = { id: L.id, story: {}, boss: L.boss }; } boss(o.act, o); }
        if (a === 'sprint') sprint(+v('act'), base());
        if (a === 'area') area(v('area'), +v('astage'), base());
        if (a === 'ending') ending(v('ending'), base());
        if (a === 'heal') { SBR.run.party.forEach(m => { m.hp = m.maxHp; m.exhaustion = 0; }); SBR.ui.refreshStage && SBR.ui.refreshStage(); }
        if (a === 'rich') { SBR.run.money += 500; SBR.ui.refreshStage && SBR.ui.refreshStage(); }
        if (a === 'gear') Object.keys(SBR.EQUIPMENT).forEach(id => SBR.run.gear.push(id));
        if (a === 'mats') Object.keys(SBR.MATERIALS).forEach(id => { if (!SBR.MATERIALS[id].holy) SBR.run.mats[id] = (SBR.run.mats[id] || 0) + 5; });
        if (a === 'state') console.log('[debug]', JSON.stringify(state(), null, 1));
      } catch (err) { console.error('[debug]', err); SBR.toast('Debug: ' + err.message, 'bad'); }
    });
  }
  document.addEventListener('keydown', e => { if (e.key === '`') { e.preventDefault(); panel(); } });
  if (/[?&]debug\b/.test(location.search)) window.addEventListener('load', () => setTimeout(panel, 500));

  return { setup, goto, event, scene, fight, randomFight, boss, area, sprint, ending, state, panel, closeAll };
})();
