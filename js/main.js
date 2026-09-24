/* Game flow, run state, event API and meta screens */
'use strict';
SBR.game = (() => {
  const { el, sleep, fmtMoney, pick, randInt, shuffle, weighted } = SBR.util;
  const ui = SBR.ui, art = SBR.art;

  /* ---------- members ---------- */
  function makeMember(id, level = 1) {
    const c = SBR.CHARS[id];
    const m = { id, equip: SBR.emptyEquip(), level: 1, xp: 0, stats: Object.assign({}, c.stats), maxHp: c.hp + c.stats.grit * 2, hp: 0, points: 0, exhaustion: 0, upgrades: {} };
    const b = SBR.bonus();
    m.maxHp += b.maxHp || 0;
    if (id === (SBR.run.lead || 'johnny')) m.maxHp += SBR.HORSES[SBR.run.horse].bonus.maxHp || 0;
    if (id === 'johnny' && b.johnnyAll) m.maxHp += 20;
    // catch up to party level
    while (m.level < level) { levelUp(m); autoAssign(m); }
    m.hp = m.maxHp;
    return m;
  }
  function memberAbilities(m) {
    const c = SBR.CHARS[m.id];
    const f = SBR.run ? SBR.run.flags : {};
    const base = c.abilities.filter(a => (!a.flag || f[a.flag]) && (!a.notFlag || !f[a.notFlag]) && (!a.level || m.level >= a.level)).map(a => a.id);
    const P = SBR.pathOf(m);
    SBR.pathAbilities(m).forEach(id => { if (!base.includes(id)) base.push(id); });
    if (P && P.drop) P.drop.forEach(id => { const i = base.indexOf(id); if (i >= 0) base.splice(i, 1); });
    SBR.equipBonus(m).abilities.forEach(id => { if (!base.includes(id)) base.push(id); });
    return base;
  }
  const xpToNext = lvl => 20 + lvl * 18;
  function levelUp(m) { m.level++; m.points += 3; m.maxHp += 3; m.hp += 3; }
  function autoAssign(m) {
    const g = SBR.CHARS[m.id].growth;
    const keys = Object.keys(g);
    while (m.points > 0) { const k = weighted(keys, x => g[x]); m.stats[k]++; if (k === 'grit') { m.maxHp += 2; m.hp += 2; } m.points--; }
  }
  function gainXp(m, n) {
    let leveled = false;
    m.xp += n;
    while (m.xp >= xpToNext(m.level)) { m.xp -= xpToNext(m.level); levelUp(m); leveled = true; }
    return leveled;
  }
  const partyLevel = () => Math.max(...SBR.run.party.map(m => m.level));
  const beltSize = () => 4 + (SBR.bonus().belt || 0);

  /* ---------- achievements ---------- */
  function achieve(id) {
    const a = SBR.ACHIEVEMENTS[id];
    if (!a || SBR.meta.achievements[id]) return;
    SBR.meta.achievements[id] = Date.now();
    SBR.meta.rp += a.rp; SBR.meta.totalRp += a.rp;
    let extra = '';
    if (a.unlockHorse && !SBR.meta.unlockedHorses.includes(a.unlockHorse)) { SBR.meta.unlockedHorses.push(a.unlockHorse); extra = `<br>Horse unlocked: <b>${SBR.HORSES[a.unlockHorse].name}</b>`; }
    SBR.meta.unlockedLeads = SBR.meta.unlockedLeads || ['johnny', 'gyro'];
    if (a.unlockLead && !SBR.meta.unlockedLeads.includes(a.unlockLead)) { SBR.meta.unlockedLeads.push(a.unlockLead); extra += `<br>Lead rider unlocked: <b>${SBR.CHARS[a.unlockLead].name}</b>`; }
    if (a.unlockItem && !SBR.meta.unlockedItems.includes(a.unlockItem)) { SBR.meta.unlockedItems.push(a.unlockItem); extra = `<br>Starting item unlocked: <b>${SBR.EQUIPMENT[a.unlockItem].name}</b>`; }
    Object.entries(SBR.TECHNIQUES).forEach(([k, t]) => { if (t.unlock === id && !SBR.meta.unlockedTech.includes(k)) { SBR.meta.unlockedTech.push(k); extra += `<br>Technique available: <b>${t.name}</b>`; } });
    SBR.saveMeta();
    SBR.toast(`${art.icon('trophy', 22)} <div><b>Achievement: ${a.name}</b><br><small>${a.desc} · +${a.rp} RP</small>${extra}</div>`, 'achv');
    SBR.audio.play('level');
  }
  function addRp(n) { SBR.meta.rp += n; SBR.meta.totalRp += n; SBR.run.rp = (SBR.run.rp || 0) + n; SBR.saveMeta(); }

  /* ---------- standings ---------- */
  function standings() {
    const r = SBR.run;
    const lead = SBR.CHARS[r.lead || 'johnny'];
    const list = [{ key: 'player', name: lead.name, portrait: lead.portrait, points: r.points.player || 0, player: true }];
    Object.entries(SBR.RIVALS).forEach(([k, rv]) => list.push({ key: k, name: rv.name, portrait: rv.portrait, points: r.points[k] || 0 }));
    return list.sort((a, b) => b.points - a.points || (a.player ? -1 : 1));
  }
  const playerRank = () => standings().findIndex(s => s.player) + 1;

  /* ---------- the event API (g) ---------- */
  let pending = [];
  const later = fn => pending.push(fn);
  async function flushPending() { while (pending.length) { const f = pending.shift(); await f(); } }
  /** the lead rider never leaves: story departures become a wound or a changed heart */
  const LEAD_SPARED = {
    mountaintim: 'Mountain Tim took three bullets getting Lucy out of Kansas City. He ties the wounds shut with his own rope and rides on. (Tim gains 1 Exhaustion.)',
    hotpants: 'The Vatican agents wait for the Corpse Parts. Hot Pants hands them over... then turns her horse around. "I made a promise to ride with you."',
    gyro: 'The Love Train should have taken Gyro. It didn\'t. Barely breathing, he grins with golden teeth. "Nyo-ho... not yet." (Gyro gains 2 Exhaustion.)',
    johnny: 'Johnny grits his teeth and keeps riding.',
  };
  function leadSpared(m) {
    const n = m.id === 'gyro' ? 2 : m.id === 'mountaintim' ? 1 : 0;
    m.exhaustion = Math.min(3, (m.exhaustion || 0) + n);
    m.hp = Math.max(1, Math.round(m.hp * 0.6));
    SBR.toast(`<div class="toast-port">${art.portrait(SBR.CHARS[m.id].portrait)}</div><div><b>${SBR.CHARS[m.id].short} is your lead.</b><br><small>${LEAD_SPARED[m.id] || ''}</small></div>`, 'ally');
  }
  function findMember(id) { const r = SBR.run; return r.party.find(m => m.id === id) || r.reserve.find(m => m.id === id); }
  const G = {
    recruit(id, silent) {
      const r = SBR.run;
      if (findMember(id)) return;
      const m = makeMember(id, Math.max(1, partyLevel() - 1));
      SBR.meta.seen.allies[id] = true;
      if (r.party.length < 4) r.party.push(m); else r.reserve.push(m);
      SBR.toast(`<div class="toast-port">${art.portrait(SBR.CHARS[id].portrait)}</div><div><b>${SBR.CHARS[id].name}</b> joins${r.party.includes(m) ? ' the party' : ' the reserve (party full)'}!</div>`, 'ally');
      SBR.audio.play('success');
    },
    dismiss(id, msg, permanent) {
      const r = SBR.run;
      const m = findMember(id);
      if (!m) return;
      if (id === r.lead) return leadSpared(m);
      r.party = r.party.filter(x => x !== m); r.reserve = r.reserve.filter(x => x !== m);
      r.gone = (r.gone || []).concat(id);
      Object.values(m.equip || {}).forEach(e => { if (e) r.gear.push(e); });
      if (r.party.length < 4 && r.reserve.length) r.party.push(r.reserve.shift());
      SBR.toast(`<div class="toast-port grey">${art.portrait(SBR.CHARS[id].portrait)}</div><div>${msg || SBR.CHARS[id].name + ' left the party.'}</div>`, 'loss');
    },
    achieve,
    flag(k) { SBR.run.flags[k] = true; },
    enterArea(id) { const r = SBR.run; r.area = { id, stage: 0, used: [] }; r.stageCards = null; r.areasSeen = (r.areasSeen || []).concat(id); SBR.audio.play('detour'); },
    /** Paths (subclasses) */
    canTakePath(charId) { const m = SBR.run.party.find(x => x.id === charId); return !!m && !m.path; },
    takePath(pathId) {
      const P = SBR.PATHS[pathId], m = findMember(P.char);
      if (!m || m.path) return;
      m.path = pathId;
      if (P.bonus && P.bonus.maxHp) { m.maxHp += P.bonus.maxHp; m.hp += P.bonus.maxHp; }
      later(() => ui.pathUnlock(m, pathId));
      SBR.saveRun();
    },
    inParty: id => SBR.run.party.some(m => m.id === id),
    hasAlly: id => !!findMember(id) || (SBR.run.gone || []).includes(id),
    money(n) {
      const r = SBR.run;
      const v = n > 0 ? Math.round(n * (1 + (SBR.bonus().money || 0))) : n;
      r.money = Math.max(0, r.money + v);
      if (r.money >= 400) achieve('rich');
      if (v) SBR.toast(`${art.icon('coin', 20)} ${v > 0 ? '+' : ''}${fmtMoney(v)}`, v > 0 ? 'good' : 'bad');
      if (v > 0) SBR.audio.play('coin');
    },
    pace(n) { const r = SBR.run; r.pace = SBR.util.clamp(r.pace + n, 0, 100); if (n) SBR.toast(`${art.icon('horseshoe', 20)} Pace ${n > 0 ? '+' : ''}${n}`, n > 0 ? 'good' : 'bad'); },
    healAll(pct) { SBR.run.party.concat(SBR.run.reserve).forEach(m => { m.hp = Math.min(m.maxHp, Math.max(m.hp, 0) + Math.ceil(m.maxHp * pct)); }); SBR.audio.play('heal'); },
    unexhaust(n) { SBR.run.party.concat(SBR.run.reserve).forEach(m => { m.exhaustion = Math.max(0, m.exhaustion - n); }); },
    hurt(id, pct) { const m = findMember(id); if (m) m.hp = Math.max(1, m.hp - Math.ceil(m.maxHp * pct)); },
    hurtAll(pct) { SBR.run.party.forEach(m => { m.hp = Math.max(1, m.hp - Math.ceil(m.maxHp * pct)); }); SBR.audio.play('hit'); },
    hurtAllFlat(n) { SBR.run.party.forEach(m => { m.hp = Math.max(1, m.hp - n); }); SBR.audio.play('hit'); },
    hurtRandom(n) { const m = pick(SBR.run.party); m.hp = Math.max(1, m.hp - n); SBR.audio.play('hit'); },
    hurtRandomPct(p) { const m = pick(SBR.run.party); m.hp = Math.max(1, m.hp - Math.ceil(m.maxHp * p)); SBR.audio.play('hit'); },
    maxHp(id, n) { const m = findMember(id); if (m) { m.maxHp += n; m.hp += n; } },
    item(id) {
      const r = SBR.run;
      if (r.items.length >= beltSize()) { SBR.toast(`Belt full — ${SBR.ITEMS[id].name} left behind.`, 'bad'); return; }
      r.items.push(id); SBR.toast(`<span class="toast-ico">${SBR.icons.item(id)}</span> ${SBR.ITEMS[id].name}`, 'good');
    },
    itemRandom() { G.item(pick(Object.keys(SBR.ITEMS))); },
    useItem(id) { const i = SBR.run.items.indexOf(id); if (i >= 0) SBR.run.items.splice(i, 1); },
    loseItem() { const r = SBR.run; if (r.items.length) { const it = r.items.splice(randInt(0, r.items.length - 1), 1)[0]; SBR.toast(`Lost ${SBR.ITEMS[it].name}`, 'bad'); } },
    duplicateItem() { const r = SBR.run; if (r.items.length) G.item(pick(r.items)); else G.itemRandom(); },
    /** grant an item by id: holy Corpse materials, or equipment (old relics included) */
    relic(id) {
      const r = SBR.run;
      const M = SBR.MATERIALS[id];
      if (M && M.holy) {
        if (r.mats[id] > 0) return;
        r.mats[id] = 1;
        if (id === 'c_eyes') r.flags.eyes = true;
        if (Object.keys(r.mats).filter(k => SBR.MATERIALS[k] && SBR.MATERIALS[k].holy && r.mats[k] > 0).length >= 5) achieve('corpse5');
        SBR.toast(`<span class="toast-ico">${SBR.matIcon(id)}</span><div><b>${M.name}</b><br><small>${M.desc}</small></div>`, 'corpse');
        SBR.audio.play('success');
        return;
      }
      const E = SBR.EQUIPMENT[id];
      if (!E) return;
      if (E.onGain) E.onGain(r);
      G.gear(id);
      SBR.audio.play('success');
    },
    relicRandom(rarity = 'common') { const id = randomRelic([rarity]); if (id) G.relic(id); else G.mat(pick(SBR.SCAVENGE_MATS[SBR.run.act] || ['scrap']), 2); },
    removeRelic(id) { const r = SBR.run; if (r.mats[id]) delete r.mats[id]; const i = r.gear.indexOf(id); if (i >= 0) r.gear.splice(i, 1); },
    loseCorpse(keep = []) {
      const r = SBR.run;
      const lost = Object.keys(r.mats).filter(x => SBR.MATERIALS[x] && SBR.MATERIALS[x].holy && r.mats[x] > 0 && !keep.includes(x));
      lost.forEach(id => { G.removeRelic(id); if (id === 'c_leftarm') { const j = findMember('johnny'); if (j) { j.maxHp -= 12; j.hp = Math.min(j.hp, j.maxHp); } } });
      if (lost.length) SBR.toast(`${art.icon('corpse', 22)} <div><b>Corpse Parts lost:</b><br><small>${lost.map(x => SBR.MATERIALS[x].name.replace('Corpse: ', '')).join(', ')}</small></div>`, 'loss');
    },
    xp(n) { SBR.run.party.forEach(m => gainXp(m, n)); SBR.toast(`${art.icon('star', 20)} +${n} XP`, 'good'); },
    statUp(who, stat, n) {
      later(async () => {
        const m = who === 'choose' ? await ui.chooseMember(`Who gains +${n} ${SBR.STATS[stat].name}?`) : findMember(who);
        if (!m) return;
        m.stats[stat] += n; if (stat === 'grit') { m.maxHp += 2 * n; m.hp += 2 * n; }
        SBR.toast(`${SBR.CHARS[m.id].short}: +${n} ${SBR.STATS[stat].name}`, 'good');
      });
    },
    statUpAll(stat, n) { SBR.run.party.forEach(m => { m.stats[stat] += n; if (stat === 'grit') { m.maxHp += 2 * n; m.hp += 2 * n; } }); SBR.toast(`Party: +${n} ${SBR.STATS[stat].name}`, 'good'); },
    train() { later(() => ui.chooseAbility()); },
    scene(id) { later(() => playScene(id)); },
    say(id, text) { SBR.toast(`<div class="toast-port">${ui.portraitOf(id)}</div><div><i>"${text}"</i></div>`, 'say'); },
    mat(id, n = 1, silent) {
      const r = SBR.run;
      r.mats[id] = (r.mats[id] || 0) + n;
      if (!silent) SBR.toast(`<span class="toast-ico">${SBR.matIcon(id)}</span> +${n} ${SBR.MATERIALS[id].name}`, 'good');
    },
    exhaust(id, n = 1) { const m = id === 'random' ? pick(SBR.run.party) : findMember(id); if (m) { m.exhaustion = (m.exhaustion || 0) + n; SBR.toast(`${SBR.CHARS[m.id].short} gains ${n} Exhaustion`, 'bad'); } },
    hasItem: id => SBR.run.items.includes(id),
    hasMat: (id, n = 1) => (SBR.run.mats[id] || 0) >= n,
    spendMat(id, n) { const r = SBR.run; r.mats[id] = Math.max(0, (r.mats[id] || 0) - n); },
    hasFlag: k => !!SBR.run.flags[k],
    gear(id) { SBR.run.gear.push(id); SBR.toast(`<span class="toast-ico">${SBR.icons.equip(id)}</span><div><b>${SBR.EQUIPMENT[id].name}</b><br><small>${SBR.equipDesc(id)}</small></div>`, 'good'); },
    sugar() {
      const r = SBR.run;
      r.money += 600;
      G.relic('c_ears'); G.relic('c_rightarm');
      r.sugar = { left: 2 };
      later(() => openShop('sugar'));
    },
  };

  function randomRelic(rarities) {
    const want = rarities.includes('rare') ? ['uncommon', 'rare'] : ['common', 'uncommon'];
    const pool = Object.keys(SBR.EQUIPMENT).filter(k => { const E = SBR.EQUIPMENT[k]; return want.includes(E.rarity) && !E.remnant && !E.starter; });
    return pool.length ? pick(pool) : null;
  }

  /* ---------- run lifecycle ---------- */
  function newRun(horse, starter, lead = 'johnny') {
    SBR.run = {
      version: 1, act: 0, stage: 0, horse, starter, lead, tech: SBR.meta.equippedTech.slice(),
      party: [], reserve: [], money: 30, items: ['canteen'], flags: {}, pace: 50,
      points: {}, usedEvents: [], mats: {}, gear: [], stageCards: null, rp: 0, battles: 0, started: Date.now(),
    };
    SBR.run.party.push(makeMember(lead));
    if (lead !== 'johnny') SBR.run.party.push(makeMember('johnny'));
    G.relic(starter);
    const si = SBR.run.gear.indexOf(starter);
    if (si >= 0) equip(SBR.run.party[0], freeSlot(SBR.run.party[0], SBR.EQUIPMENT[starter].slot), si);
    SBR.meta.stats.runs++;
    SBR.saveMeta();
  }
  function toTitle() { ui.closeAllModals(); titleScreen(); }

  async function playScene(id) {
    const s = SBR.STORY[id];
    if (!s) return;
    await ui.dialogue(id);
    if (s.fx) { s.fx(G); await flushPending(); }
    if (s.choices) {
      const last = s.lines[s.lines.length - 1];
      const speaker = [...s.lines].reverse().find(l => l.who);
      const ch = await ui.eventPanel({ title: s.card ? s.card.title : 'Your Choice', text: last.who ? `"${last.text}"` : last.narr, choices: s.choices, art: speaker ? speaker.who : null, icon: 'question' });
      await resolveChoice(ch);
    }
    if (s.fight) {
      const win = await fight(s.fight.enemies, { elite: s.fight.elite, boss: s.fight.boss });
      if (!win) return false;
    }
    if (s.after) { s.after(G); await flushPending(); }
    return true;
  }

  async function startAct(n) {
    const r = SBR.run;
    r.act = n; r.stage = 1; r.stageCards = null;
    r.pace = SBR.util.clamp(50 + (SBR.bonus().pace || 0), 0, 100);
    SBR.meta.stats.bestAct = Math.max(SBR.meta.stats.bestAct, n); SBR.saveMeta();
    SBR.saveRun();
    await actCard(n);
    await playScene(SBR.ACTS[n].intro);
    if (n === 6 && r.party.length < 2) G.recruit('pocoloco');
    SBR.saveRun();
    showStage();
  }

  function actCard(n) {
    return new Promise(res => {
      const a = SBR.ACTS[n];
      ui.transition(scr => {
        scr.className = 'screen-actcard';
        scr.innerHTML = `<div class="actcard-scene">${art.scene(a.scene)}</div><div class="actcard">
          <div class="ac-num">${a.name}</div><div class="ac-title">${a.title}</div><div class="ac-sub">${a.sub}</div>
          <div class="ac-map">${art.usMap(a.route)}</div></div>`;
        ui.menacing(scr, 5, 'ド');
        SBR.audio.play('menace');
        setTimeout(res, 2600 / SBR.settings.speed);
        scr.addEventListener('click', res, { once: true });
      }, 'slash');
    });
  }

  function drawAreaCards() {
    const r = SBR.run, A = SBR.AREAS[r.area.id];
    if (r.area.stage >= A.stages) return [{ id: 'areaboss', type: 'boss', title: A.boss.name, blurb: `The heart of ${A.name}. There is no way around.`, icon: 'crown', forced: true, areaBoss: true, art: (SBR.ENEMIES[A.boss.enemies[0]].art || {}).key }];
    const out = [];
    const fights = shuffle(A.fights.slice());
    out.push({ id: 'af0', type: 'fight', title: 'Something Moves', blurb: `The ${A.name} does not want you here.`, icon: 'sword', pace: -2, areaFight: fights[0] });
    const evs = Object.entries(SBR.AREA_EVENTS).filter(([k, e]) => e.area === r.area.id && !r.area.used.includes(k));
    if (evs.length) { const [k, e] = pick(evs); out.push({ id: k, type: 'event', title: e.title, blurb: e.blurb, icon: e.icon, pace: -2, areaEvent: k, art: e.art }); }
    out.push({ id: 'af1', type: 'elite', title: 'Deeper In', blurb: 'Tougher, and better loot.', icon: 'skull', pace: -2, areaFight: fights[1].concat(fights[2] ? [fights[2][0]] : []), elite: true });
    const trainers = SBR.EVENTS.filter(e => e.pathOffer && !r.usedEvents.includes(e.id) && e.cond(G));
    if (trainers.length && Math.random() < 0.6) { const t = pick(trainers); out.push({ id: t.id, type: t.type, title: t.title, blurb: t.blurb, icon: t.icon, pace: t.pace, art: t.art }); }
    return out.slice(0, 3 + (SBR.bonus().cards || 0));
  }
  async function exitArea() {
    const r = SBR.run, A = SBR.AREAS[r.area.id];
    A.reward(G);
    await ui.resultPanel(A.name, A.rewardText + ' You ride back to the race route, behind the pack. (−10 pace)', 'star');
    await flushPending();
    r.area = null; r.stageCards = null;
    G.pace(-10);
    SBR.saveRun();
    showStage();
  }
  function drawCards() {
    const r = SBR.run;
    if (r.area) return drawAreaCards();
    const act = SBR.ACTS[r.act];
    if (r.stage === act.stages) return [{ id: 'boss', type: 'boss', title: act.boss.name, blurb: 'The stage\'s final obstacle. There is no way around.', icon: 'crown', forced: true, art: SBR.ENEMIES[act.boss.enemies[0]].art.key }];
    const storyId = act.story[r.stage];
    if (storyId && !(SBR.STORY[storyId].leadSkip || []).includes(r.lead)) { const s = SBR.STORY[storyId]; return [Object.assign({ id: storyId, type: 'story', forced: true, story: true }, s.card)]; }
    const pool = SBR.EVENTS.filter(e => e.acts.includes(r.act) && !(e.once && r.usedEvents.includes(e.id)) && (!e.cond || e.cond(G)));
    const n = 3 + (SBR.bonus().cards || 0);
    const out = [];
    const bag = pool.slice();
    while (out.length < n && bag.length) {
      const e = weighted(bag, x => x.weight || 1);
      bag.splice(bag.indexOf(e), 1);
      if (out.some(o => o.type === 'shop') && e.type === 'shop') continue;
      out.push({ id: e.id, type: e.type, title: e.title, blurb: e.blurb, icon: e.icon, pace: e.pace, art: e.art });
    }
    return out;
  }

  function showStage() {
    const r = SBR.run;
    SBR.music.play(SBR.music.themeForStage());
    if (!r.stageCards) { r.stageCards = drawCards(); SBR.saveRun(); }
    ui.stageScreen(r.stageCards, {
      pick: card => resolveCard(card),
      scavenge: () => scavenge(),
      rest: () => rest(),
    });
  }

  async function advanceStage() {
    const r = SBR.run;
    const act = SBR.ACTS[r.act];
    if (r.area) { r.area.stage++; r.stageCards = null; addRp(1); SBR.saveRun(); return showStage(); }
    r.stage++;
    r.stageCards = null;
    addRp(1);
    const b = SBR.bonus();
    r.pace = SBR.util.clamp(r.pace + 3 + (b.paceStage || 0), 0, 100);
    if (r.sugar) {
      r.sugar.left--;
      if (r.sugar.left <= 0) await sugarSunset();
    }
    SBR.saveRun();
    if (r.stage > act.stages) return actFinish();
    showStage();
  }

  async function sugarSunset() {
    const r = SBR.run;
    const honest = r.money <= 25;
    r.sugar = null;
    G.loseCorpse(Object.keys(r.mats).filter(x => !['c_ears', 'c_rightarm'].includes(x)));
    if (honest) {
      await ui.resultPanel('Sunset at Sugar Mountain', 'Every coin is spent. Johnny trades the Ears and Right Arm for a bottle of wine — the last thing to use up. The tree releases its grip. Sugar Mountain, freed at last, salutes two honest men.', 'star');
      achieve('sugar');
      G.healAll(0.5);
    } else {
      await ui.resultPanel('The Tree Hungers', `You still carry ${fmtMoney(r.money)}. Roots crawl up the horses' legs. Johnny trades the Corpse Parts away and throws the money into the spring just in time — but the tree takes its toll. (Party loses 30% HP, money lost.)`, 'skull');
      r.money = 0;
      G.hurtAll(0.3);
    }
  }

  /* ---------- card resolution ---------- */
  async function resolveCard(card) {
    const r = SBR.run;
    if (card.areaBoss) {
      const A = SBR.AREAS[r.area.id];
      const win = await fight(A.boss.enemies, { boss: true, bossName: A.boss.name });
      if (!win) return;
      return exitArea();
    }
    if (card.areaFight) {
      if (card.pace) G.pace(card.pace);
      const win = await fight(card.areaFight, { elite: !!card.elite });
      if (!win) return;
      return advanceStage();
    }
    if (card.areaEvent) {
      if (card.pace) G.pace(card.pace);
      r.area.used.push(card.areaEvent);
      const ev = SBR.AREA_EVENTS[card.areaEvent];
      const ch = await ui.eventPanel(ev);
      const cont = await resolveChoice(ch);
      if (cont === false) return;
      return advanceStage();
    }
    if (card.type === 'boss') return bossStage();
    if (card.story) {
      const ok = await playScene(card.id);
      if (ok === false) return;
      return advanceStage();
    }
    const ev = SBR.EVENTS.find(e => e.id === card.id);
    if (ev.once) r.usedEvents.push(ev.id);
    if (ev.pace) G.pace(ev.pace);
    if (ev.fight) {
      const win = await fight(ev.fight.random ? pick(SBR.FIGHTS[r.act]) : ev.fight.enemies, { elite: ev.type === 'elite', loot: ev.fight.loot });
      if (!win) return;
      return advanceStage();
    }
    if (ev.shop) { await openShop(ev.shop, ev.art); return advanceStage(); }
    const ch = await ui.eventPanel(ev);
    const cont = await resolveChoice(ch);
    if (cont === false) return;
    advanceStage();
  }

  async function resolveChoice(ch) {
    if (!ch) return true;
    if (ch.cost && ch.cost.money) SBR.run.money -= ch.cost.money;
    let outcome = ch.ok;
    if (ch.check) {
      const who = (ch.check.who && SBR.run.party.find(m => m.id === ch.check.who && m.hp > 0)) || bestFor(ch.check.stat);
      const ok = await ui.diceCheck({ stat: ch.check.stat, dc: ch.check.dc, who, mod: checkMod(who, ch.check.stat) });
      outcome = ok ? ch.ok : ch.fail;
    }
    if (!outcome) return true;
    if (outcome.fx) outcome.fx(G);
    if (outcome.text) await ui.resultPanel(ch.label, outcome.text, ch.check ? 'dice' : 'star');
    await flushPending();
    if (outcome.fight) {
      const f = outcome.fight;
      const win = await fight(f.random ? pick(SBR.FIGHTS[SBR.run.act]) : f.enemies, { elite: f.elite });
      if (!win) return false;
      if (f.bounty) G.money(f.bounty);
      if (f.after) { f.after(G); await flushPending(); }
    }
    SBR.saveRun();
    return true;
  }
  function bestFor(stat) { return SBR.run.party.filter(m => m.hp > 0).sort((a, b) => b.stats[stat] - a.stats[stat])[0] || SBR.run.party[0]; }
  function checkMod(m, stat) { return Math.floor(m.stats[stat] / 2) + (SBR.bonus().check || 0); }

  async function scavenge() {
    const r = SBR.run;
    G.pace(-8);
    const b = SBR.bonus();
    const roll = Math.random() - (b.scavenge ? 0.1 : 0);
    if (roll < 0.22) {
      await ui.resultPanel('Scavenge', 'You weren\'t the only ones looking. Ambush!', 'skull');
      const win = await fight(r.area ? pick(SBR.AREAS[r.area.id].fights) : pick(SBR.FIGHTS[r.act]), {});
      if (!win) return;
    } else {
      const got = [];
      const cash = randInt(8, 22) + r.act * 4; G.money(cash); got.push(fmtMoney(cash));
      const pool = (r.area && SBR.SCAVENGE_MATS['area_' + r.area.id]) || SBR.SCAVENGE_MATS[r.act] || SBR.SCAVENGE_MATS[1];
      for (let i = 0; i < 2 + (b.scavenge ? 1 : 0); i++) { const mt = pick(pool); const n = randInt(1, 2); G.mat(mt, n, true); got.push(`${n}× ${SBR.MATERIALS[mt].name}`); }
      if (Math.random() < 0.55) { const it = pick(Object.keys(SBR.ITEMS)); G.item(it); got.push(SBR.ITEMS[it].name); }
      if (Math.random() < 0.08 + (b.scavenge ? 0.08 : 0)) { const id = randomRelic(['common']); if (id) { G.relic(id); got.push(SBR.EQUIPMENT[id].name); } }
      await ui.resultPanel('Scavenge', 'You search the area and find: ' + got.join(', ') + '.', 'search');
    }
    advanceStage();
  }
  async function rest() {
    const r = SBR.run;
    G.pace(-12);
    const b = SBR.bonus();
    G.healAll(0.35 * (1 + (b.restHeal || 0)));
    G.unexhaust(1);
    SBR.audio.play('heal');
    await ui.resultPanel('Short Rest', 'You make camp. Coffee, beans, and the sound of horses breathing. Everyone recovers.', 'fire');
    if (r.stageCards && r.stageCards[0] && r.stageCards[0].forced) { SBR.saveRun(); return showStage(); }
    advanceStage();
  }

  /* ---------- shops ---------- */
  function buildStock(kind) {
    const def = SBR.SHOPS[kind];
    const stock = [];
    const itemKeys = shuffle(Object.keys(SBR.ITEMS));
    for (let i = 0; i < def.items; i++) stock.push({ kind: 'item', id: itemKeys[i], price: SBR.ITEMS[itemKeys[i]].price + SBR.run.act * 2 });
    const used = new Set();
    def.rarities.slice(0, def.relics).forEach(rar => {
      const pool = Object.keys(SBR.EQUIPMENT).filter(k => SBR.EQUIPMENT[k].fromRelic && !SBR.EQUIPMENT[k].starter && (rar === 'rare' ? SBR.EQUIPMENT[k].rarity === 'rare' : SBR.EQUIPMENT[k].rarity !== 'rare') && !used.has(k));
      if (!pool.length) return;
      const id = pick(pool); used.add(id);
      stock.push({ kind: 'equip', id, price: SBR.EQUIPMENT[id].price + SBR.run.act * 5 });
    });
    const eqPool = shuffle(Object.keys(SBR.EQUIPMENT).filter(k => !SBR.EQUIPMENT[k].remnant && (SBR.run.act > 2 || SBR.EQUIPMENT[k].rarity !== 'rare')));
    eqPool.slice(0, kind === 'trapper' ? 1 : 2).forEach(id => stock.push({ kind: 'equip', id, price: SBR.EQUIPMENT[id].price + SBR.run.act * 4 }));
    const mp = SBR.SCAVENGE_MATS[SBR.run.act] || SBR.SCAVENGE_MATS[1];
    shuffle(mp).slice(0, 2).forEach(id => stock.push({ kind: 'mat', id, n: 2, price: { common: 12, uncommon: 20, rare: 34 }[SBR.MATERIALS[id].rarity] || 15 }));
    stock.push({ kind: 'service', name: 'Doctor\'s Visit', desc: 'Heal the party 50%.', price: 25 + SBR.run.act * 3, icon: 'heart', run: () => G.healAll(0.5) });
    stock.push({ kind: 'service', name: 'Hot Bath & Bed', desc: 'Remove all Exhaustion.', price: 40, icon: 'fire', run: () => G.unexhaust(9) });
    if (kind === 'sugar') stock.push({ kind: 'service', name: 'Casino Chips', desc: 'Lose $50 at the tables. It\'s about spending, not winning.', price: 50, icon: 'dice', repeat: true, run: () => {} });
    return stock;
  }
  async function openShop(kind, keeper) {
    const r = SBR.run;
    SBR.music.play('shop');
    const stock = r.shop && r.shop.stage === `${r.act}-${r.stage}-${kind}` ? r.shop.stock : buildStock(kind);
    r.shop = { stage: `${r.act}-${r.stage}-${kind}`, stock };
    SBR.saveRun();
    await ui.shopScreen(stock, SBR.SHOPS[kind].name, keeper || (kind === 'sugar' ? 'sugar' : null));
    SBR.saveRun();
  }

  async function fieldUseItem(idx) {
    const r = SBR.run;
    const id = r.items[idx];
    const it = SBR.ITEMS[id];
    let target = null;
    if (it.target === 'ally') target = await ui.chooseMember(`Use ${it.name} on whom?`);
    r.items.splice(idx, 1);
    const fx = {
      target: target ? { m: target } : null,
      allies: r.party.map(m => ({ m })),
      heal: (t, n) => { t.m.hp = Math.min(t.m.maxHp, Math.max(1, t.m.hp) + n); },
      cleanse: () => {}, energy: () => {}, status: () => {},
      pace: n => G.pace(n),
    };
    it.use(fx);
    SBR.audio.play('heal');
    SBR.saveRun();
  }

  /* ---------- battles ---------- */
  async function fight(enemies, opts = {}) {
    const r = SBR.run;
    const act = SBR.ACTS[r.act];
    const { result, combat } = await SBR.battle.run(enemies, Object.assign({ title: opts.boss ? act.boss && opts.bossName : null, hazard: SBR.curHazard() }, opts));
    // persist hp
    combat.party().forEach(u => {
      const m = u.ref;
      if (u.removed) return;
      if (u.dead) { m.exhaustion = (m.exhaustion || 0) + 1; m.hp = Math.max(1, Math.round(m.maxHp * 0.1)); u._fell = true; }
      else m.hp = Math.max(1, Math.min(m.maxHp, u.hp));
    });
    if (result !== 'win') { await gameOver(); return false; }
    r.battles++;
    achieve('first_blood');
    const b = SBR.bonus();
    if (b.postHeal) r.party.forEach(m => { m.hp = Math.min(m.maxHp, m.hp + b.postHeal); });
    const xp = Math.round(combat.loot.xp * (1 + (b.xp || 0)));
    const money = Math.round(combat.loot.money * (1 + (b.money || 0)));
    r.money += money;
    if (r.money >= 400) achieve('rich');
    const loot = [];
    const relicChance = opts.loot === 'relic' || opts.boss ? 1 : opts.elite ? 0.5 : 0;
    if (Math.random() < relicChance) { const id = randomRelic(opts.boss || opts.elite ? ['common', 'rare'] : ['common']); if (id) { r.gear.push(id); loot.push({ kind: 'equip', id }); } }
    if (Math.random() < (opts.elite || opts.boss ? 0.6 : 0.25)) { const it = pick(Object.keys(SBR.ITEMS)); if (r.items.length < beltSize()) { r.items.push(it); loot.push({ kind: 'item', id: it }); } }
    const mats = rollDrops(combat);
    Object.entries(mats).forEach(([k, n]) => { r.mats[k] = (r.mats[k] || 0) + n; });
    if ((opts.elite || opts.boss) && Math.random() < 0.35) { const eqPool = Object.keys(SBR.EQUIPMENT).filter(k => !SBR.EQUIPMENT[k].remnant && SBR.EQUIPMENT[k].rarity !== 'common'); const eid = pick(eqPool); r.gear.push(eid); loot.push({ kind: 'equip', id: eid }); }
    const rp = opts.boss ? 10 : opts.elite ? 3 : 1;
    addRp(rp);
    const members = combat.party().filter(u => !u.removed).map(u => ({ id: u.id, leveled: gainXp(u.ref, xp), fell: !!u._fell }));
    SBR.saveRun();
    await ui.rewardsScreen({ money, xp, rp, loot, members, boss: opts.boss, mats });
    return true;
  }

  function rollDrops(combat) {
    const out = {};
    const luck = Math.max(...SBR.run.party.map(m => m.stats.luck)) * 0.01;
    combat.units.filter(u => u.side === 'enemy' && u.dead).forEach(u => {
      (SBR.DROPS[u.id] || []).forEach(([mat, ch, a, b]) => { if (Math.random() < ch + luck) out[mat] = (out[mat] || 0) + randInt(a, b); });
      const rem = SBR.REMNANT_DROPS[u.id];
      if (rem) out[rem] = (out[rem] || 0) + 1;
    });
    return out;
  }
  function canCraft(en) {
    const r = SBR.run;
    const need = Object.assign({}, en.rec, en.remnant ? { [en.remnant]: 1 } : {});
    if (en.kind === 'item' && r.items.length >= beltSize()) return false;
    return Object.entries(need).every(([k, n]) => (r.mats[k] || 0) >= n);
  }
  function craft(en) {
    const r = SBR.run;
    const need = Object.assign({}, en.rec, en.remnant ? { [en.remnant]: 1 } : {});
    Object.entries(need).forEach(([k, n]) => { r.mats[k] -= n; });
    if (en.kind === 'item') r.items.push(en.id); else r.gear.push(en.id);
    r.crafted = (r.crafted || []).concat(en.id);
    SBR.saveRun();
  }
  /** first slot on a member that takes this item type (an empty one if possible) */
  function freeSlot(m, type) {
    const ok = SBR.SLOTS.filter(s => s.type === type);
    return (ok.find(s => !m.equip[s.key]) || ok[0]).key;
  }
  function equip(m, slot, gearIdx) {
    const r = SBR.run;
    const id = r.gear[gearIdx];
    if (!id) return;
    unequip(m, slot, true);
    r.gear.splice(gearIdx, 1);
    m.equip[slot] = id;
    SBR.audio.play('equip');
    const hp = (SBR.EQUIPMENT[id].bonus || {}).maxHp || 0;
    if (hp) { m.maxHp += hp; m.hp += hp; }
    SBR.saveRun();
  }
  function unequip(m, slot, silent) {
    const r = SBR.run;
    const id = m.equip && m.equip[slot];
    if (!id) return;
    m.equip[slot] = null;
    r.gear.push(id);
    const hp = (SBR.EQUIPMENT[id].bonus || {}).maxHp || 0;
    if (hp) { m.maxHp -= hp; m.hp = Math.max(1, Math.min(m.hp, m.maxHp)); }
    if (!silent) SBR.saveRun();
  }

  async function bossStage() {
    const r = SBR.run;
    const act = SBR.ACTS[r.act];
    await ui.dialogue(act.boss.pre);
    const pre = SBR.STORY[act.boss.pre];
    if (pre && pre.fx) { pre.fx(G); await flushPending(); }
    const win = await fight(act.boss.enemies, { boss: true, bossName: act.boss.name, midRound: act.boss.midRound });
    if (!win) return;
    await playScene(act.boss.post);
    r.stage = act.stages + 1;
    SBR.saveRun();
    actFinish();
  }

  async function actFinish() {
    const r = SBR.run;
    const act = SBR.ACTS[r.act];
    achieve('act' + r.act);
    if (r.act === 3) achieve('act3');
    const res = await SBR.sprint.run({ name: act.finish.name, act: r.act, favourite: act.finish.favourite });
    applySprint(res);
    await standingsScreen(res.place);
    if (act.finish.final) return ending();
    SBR.saveRun();
    startAct(r.act + 1);
  }
  function applySprint(res) {
    const r = SBR.run;
    res.order.forEach((k, i) => { r.points[k] = (r.points[k] || 0) + (SBR.POINTS[i] || 3); });
    Object.keys(SBR.RIVALS).forEach(k => { if (!res.order.includes(k)) r.points[k] = (r.points[k] || 0) + randInt(0, 12); });
    const money = [110, 70, 45, 30, 20, 15][res.place - 1] || 10;
    r.money += money;
    if (res.place === 1) { SBR.meta.stats.sprintsWon++; achieve('sprint1'); }
    if (res.place <= 3) { SBR.meta.stats.top3++; if (SBR.meta.stats.top3 >= 3) achieve('top3x3'); }
    addRp([8, 5, 3][res.place - 1] || 1);
    r.lastPrize = money;
    SBR.saveMeta(); SBR.saveRun();
  }
  function standingsScreen(place) {
    return new Promise(res => {
      const r = SBR.run;
      const box = el('div', { class: 'standings-screen' });
      box.appendChild(el('div', { class: 'ss-head', html: `<div class="ss-place">${SBR.util.ordinal(place)}</div><div>Stage prize: <b>${fmtMoney(r.lastPrize || 0)}</b></div>` }));
      box.appendChild(ui.standingsTable('player'));
      const w = ui.modal(box, { title: 'Race Standings', size: 'wide', noClose: true });
      box.appendChild(ui.btn('Onward ▸', () => { ui.closeModal(w); res(); }, 'btn-primary'));
    });
  }

  /* ---------- end states ---------- */
  async function gameOver() {
    const r = SBR.run;
    if (!r) return;
    SBR.music.stop(); SBR.audio.play('defeat');
    await SBR.toBeContinued();
    achieve('wipe');
    const act = SBR.ACTS[r.act];
    ui.transition(scr => {
      scr.className = 'screen-end lose';
      scr.innerHTML = `<div class="end-scene">${art.scene(act ? act.scene : 1, { still: true })}</div><div class="end-box">
        <div class="end-kicker">RETIRED FROM THE RACE</div><h1>The journey ends here.</h1>
        <p>Act ${r.act}, Stage ${r.stage}. ${r.battles} battles fought.</p>
        <p class="end-rp">${art.icon('trophy', 26)} ${r.rp || 0} Race Points earned this run</p>
        <p class="muted">Spend RP at the Saloon to buy Techniques that make future runs easier.</p></div>`;
      const box = scr.querySelector('.end-box');
      box.appendChild(ui.btn('Return to the Saloon', () => lobbyScreen(), 'btn-primary'));
      ui.menacing(scr, 6);
    });
    SBR.clearRun();
  }
  async function ending() {
    const r = SBR.run;
    const rank = playerRank();
    const champ = rank === 1;
    achieve('win');
    SBR.audio.play('victory'); SBR.music.play('title');
    if (champ) achieve('champion');
    SBR.meta.stats.wins++; SBR.saveMeta();
    await ui.dialogue(champ ? 'epilogue_champion' : 'epilogue_canon');
    ui.transition(scr => {
      scr.className = 'screen-end win';
      scr.innerHTML = `<div class="end-scene">${art.scene(5, { still: true })}</div><div class="end-box">
        <div class="end-kicker">THE END</div><h1>${champ ? 'Johnny Joestar — Champion' : 'The Race Is Over'}</h1>
        <p>Final standing: <b>${SBR.util.ordinal(rank)}</b> with ${r.points.player || 0} points.</p>
        <p class="end-rp">${art.icon('trophy', 26)} ${r.rp || 0} Race Points earned</p>
        <p class="muted">Thank you for riding. New horses and Techniques may be waiting at the Saloon.</p></div>`;
      scr.querySelector('.end-box').appendChild(ui.btn('Return to the Saloon', () => lobbyScreen(), 'btn-primary'));
    });
    SBR.clearRun();
  }

  /* ---------- Title ---------- */
  function titleScreen() {
    SBR.music.play('title');
    ui.transition(scr => {
      scr.className = 'screen-title';
      const has = !!SBR.loadRun();
      scr.innerHTML = `<div class="title-scene">${art.scene(2)}</div>
        <div class="title-horse">${art.horse({ coat: '#7a4a2a', mane: '#e8e0d0', wrap: '#8a5ad0', rider: { cape: '#3a8c4a', body: '#5b3a8c', hat: '#3a2a4a' } })}</div>
        <div class="title-logo"><div class="tl-jojo">JoJo's Bizarre Campaign · Part 7</div>${art.logo()}<div class="tl-sub">THE CORPSE ROAD</div></div>
        <div class="title-menu"></div>
        <div class="title-foot">A fan-made roguelite. Deliberately difficult. Click anywhere to enable sound.</div>`;
      const menu = scr.querySelector('.title-menu');
      if (has) menu.appendChild(ui.btn('Continue Race', () => { SBR.run = SBR.loadRun(); resumeRun(); }, 'btn-title primary'));
      menu.appendChild(ui.btn(has ? 'New Race (abandon current)' : 'New Race', () => { SBR.clearRun(); lobbyScreen(); }, 'btn-title' + (has ? '' : ' primary')));
      menu.appendChild(ui.btn('Saloon & Stable', () => lobbyScreen(), 'btn-title'));
      menu.appendChild(ui.btn('Settings', () => ui.settingsScreen(false), 'btn-title'));
      ui.menacing(scr, 5);
    }, 'fade');
  }
  function resumeRun() {
    const r = SBR.run;
    if (!r || !r.act) { SBR.clearRun(); return titleScreen(); }
    r.mats = r.mats || {}; r.gear = r.gear || [];
    (r.relics || []).forEach(id => G.relic(id)); delete r.relics;
    r.party.concat(r.reserve).forEach(m => SBR.migrateEquip(m));
    const act = SBR.ACTS[r.act];
    if (r.stage > act.stages) return actFinish();
    showStage();
  }

  /* ---------- Lobby (Saloon/Stable/Achievements/Compendium) ---------- */
  function lobbyScreen(tab = 'saloon') {
    SBR.music.play('shop');
    ui.transition(scr => {
      scr.className = 'screen-lobby';
      scr.innerHTML = `<div class="lobby-scene">${art.scene(1, { still: true })}</div>`;
      const box = el('div', { class: 'lobby' });
      const head = el('div', { class: 'lobby-head', html: `<div class="lh-title">The Starting Line Saloon</div><div class="lh-rp">${art.icon('trophy', 26)} <b>${SBR.meta.rp}</b> RP</div>` });
      const tabs = el('div', { class: 'lobby-tabs' });
      const body = el('div', { class: 'lobby-body' });
      const TABS = [['saloon', 'Techniques'], ['stable', 'Stable'], ['achievements', 'Achievements'], ['compendium', 'Compendium']];
      TABS.forEach(([k, label]) => {
        const t = el('button', { class: 'lobby-tab' + (k === tab ? ' active' : '') }, label);
        t.onclick = () => { SBR.audio.play('click'); tab = k; tabs.querySelectorAll('.lobby-tab').forEach(x => x.classList.toggle('active', x === t)); renderBody(); };
        tabs.appendChild(t);
      });
      function renderBody() {
        body.innerHTML = '';
        ({ saloon: techTab, stable: stableTab, achievements: achvTab, compendium: compTab })[tab](body, () => { head.querySelector('.lh-rp b').textContent = SBR.meta.rp; renderBody(); });
      }
      renderBody();
      const foot = el('div', { class: 'lobby-foot' });
      foot.appendChild(ui.btn('◂ Title', () => titleScreen(), 'btn-ghost'));
      foot.appendChild(ui.btn('Enter the Race ▸', () => setupScreen(), 'btn-primary big'));
      box.append(head, tabs, body, foot);
      scr.appendChild(box);
    });
  }
  function techTab(body, refresh) {
    const m = SBR.meta;
    const used = m.equippedTech.reduce((s, k) => s + SBR.TECHNIQUES[k].slots, 0);
    body.appendChild(el('p', { class: 'muted' }, `Techniques are passive boons for every run. Buy them with RP, then equip up to 5 slots. Used: ${used}/5`));
    const slots = el('div', { class: 'tech-slots' });
    for (let i = 0; i < 5; i++) slots.appendChild(el('div', { class: 'tslot' + (i < used ? ' on' : '') }));
    body.appendChild(slots);
    const grid = el('div', { class: 'tech-grid' });
    Object.entries(SBR.TECHNIQUES).forEach(([k, t]) => {
      const avail = m.unlockedTech.includes(k);
      const owned = (m.ownedTech || []).includes(k);
      const eq = m.equippedTech.includes(k);
      const card = el('div', { class: 'tech-card' + (eq ? ' equipped' : '') + (!avail ? ' locked' : '') });
      card.innerHTML = `<div class="tc-slots">${'◆'.repeat(t.slots)}</div><div class="tc-name">${t.name}</div><div class="tc-desc">${avail ? t.desc : '???'}</div><div class="tc-unlock">${avail ? '' : art.icon('lock', 14) + ' ' + t.unlockText}</div>`;
      if (avail && !owned) card.appendChild(ui.btn(`Buy · ${t.cost} RP`, () => { if (m.rp < t.cost) return SBR.toast('Not enough RP', 'bad'); m.rp -= t.cost; m.ownedTech = (m.ownedTech || []).concat(k); SBR.saveMeta(); SBR.audio.play('coin'); refresh(); }, 'btn-small' + (m.rp < t.cost ? ' disabled' : '')));
      if (owned) card.appendChild(ui.btn(eq ? 'Unequip' : 'Equip', () => {
        if (eq) m.equippedTech = m.equippedTech.filter(x => x !== k);
        else { if (used + t.slots > 5) return SBR.toast('Not enough slots', 'bad'); m.equippedTech.push(k); }
        SBR.saveMeta(); SBR.audio.play('select'); refresh();
      }, 'btn-small' + (eq ? ' btn-ghost' : '')));
      grid.appendChild(card);
    });
    body.appendChild(grid);
  }
  function stableTab(body) {
    const grid = el('div', { class: 'horse-grid' });
    Object.entries(SBR.HORSES).forEach(([k, h]) => {
      const un = SBR.meta.unlockedHorses.includes(k);
      grid.appendChild(horseCard(k, h, un));
    });
    body.appendChild(grid);
    body.appendChild(el('div', { class: 'cs-sub' }, 'STARTING ITEMS'));
    const ig = el('div', { class: 'starter-grid' });
    Object.entries(SBR.EQUIPMENT).filter(([, R]) => R.starter).forEach(([k, R]) => {
      const un = SBR.meta.unlockedItems.includes(k);
      const ach = Object.values(SBR.ACHIEVEMENTS).find(a => a.unlockItem === k);
      const c = el('div', { class: 'starter-card' + (un ? '' : ' locked') }, ui.equipChip(k), el('div', { html: `<b>${un ? R.name : '???'}</b><p>${un ? R.descText : (ach ? 'Unlock: ' + ach.desc : '')}</p>` }));
      ig.appendChild(c);
    });
    body.appendChild(ig);
  }
  function horseCard(k, h, un, onPick, selected) {
    const ach = Object.values(SBR.ACHIEVEMENTS).find(a => a.unlockHorse === k);
    const c = el('div', { class: 'horse-card' + (un ? '' : ' locked') + (selected ? ' selected' : '') });
    c.innerHTML = `<div class="hc-art">${art.horse({ coat: un ? h.coat : '#3a3040', mane: un ? h.mane : '#1a1020', wrap: un ? h.wrap : '#3a3040', spots: un ? h.spots : null })}</div>
      <div class="hc-name">${un ? h.name : '???'}</div><div class="hc-breed">${un ? h.breed : 'Locked'}</div>
      <div class="hc-bars"><span>SPEED</span><div class="bar"><div style="width:${h.speed * 10}%"></div></div><span>STAMINA</span><div class="bar"><div style="width:${h.stamina * 10}%"></div></div></div>
      <div class="hc-perk">${un ? h.perk : art.icon('lock', 14) + ' ' + (h.unlock || (ach && ach.desc) || '')}</div>${un && h.res ? `<div class="hc-res">${SBR.resChips(h.res)}</div>` : ''}`;
    if (un && onPick) c.addEventListener('click', () => { SBR.audio.play('select'); onPick(k); });
    return c;
  }
  function achvTab(body) {
    const list = el('div', { class: 'achv-list' });
    Object.entries(SBR.ACHIEVEMENTS).forEach(([k, a]) => {
      const got = SBR.meta.achievements[k];
      list.appendChild(el('div', { class: 'achv' + (got ? ' got' : ''), html: `${art.icon(got ? 'trophy' : 'lock', 28)}<div><b>${a.name}</b><p>${a.desc}</p></div><span class="achv-rp">+${a.rp} RP</span>` }));
    });
    const n = Object.keys(SBR.meta.achievements).length;
    body.appendChild(el('p', { class: 'muted' }, `${n} / ${Object.keys(SBR.ACHIEVEMENTS).length} unlocked · Runs: ${SBR.meta.stats.runs} · Wins: ${SBR.meta.stats.wins} · Kills: ${SBR.meta.stats.kills}`));
    body.appendChild(list);
  }
  function compTab(body) {
    const seen = SBR.meta.seen;
    body.appendChild(el('div', { class: 'cs-sub' }, 'RIDERS'));
    const ag = el('div', { class: 'comp-grid' });
    Object.entries(SBR.CHARS).forEach(([k, c]) => {
      const s = k === 'johnny' || k === 'gyro' || seen.allies[k];
      const card = el('div', { class: 'comp-card' + (s ? '' : ' locked'), html: `${s ? art.portrait(c.portrait) : '<div class="comp-q">?</div>'}<b>${s ? c.name : '???'}</b>` });
      if (s) SBR.tip.bind(card, `<b>${c.name}</b> — 「${c.stand}」<br>${c.bio}`);
      ag.appendChild(card);
    });
    body.appendChild(ag);
    body.appendChild(el('div', { class: 'cs-sub' }, 'ENEMIES & STANDS'));
    const eg = el('div', { class: 'comp-grid' });
    Object.entries(SBR.ENEMIES).filter(([k]) => k !== 'outlawish').forEach(([k, e]) => {
      const s = seen.enemies[k];
      const card = el('div', { class: 'comp-card' + (s ? '' : ' locked') + (e.tier ? ' tier-' + e.tier : ''), html: `${s ? ui.artFor(e.art) : '<div class="comp-q">?</div>'}<b>${s ? e.name : '???'}</b>` });
      if (s) SBR.tip.bind(card, `<b>${e.name}</b>${e.stand ? ' — 「' + e.stand + '」' : ''}<br>HP ${e.hp}${e.passive ? '<br>' + e.passive : ''}<br><i>${e.abilities.map(a => a.name).join(', ')}</i>`);
      eg.appendChild(card);
    });
    body.appendChild(eg);
    body.appendChild(el('div', { class: 'cs-sub' }, 'STATUS EFFECTS'));
    const sg = el('div', { class: 'status-glossary' });
    Object.entries(SBR.STATUS).forEach(([k, d]) => sg.appendChild(el('div', { class: 'sgl', html: `<span class="st-chip ${d.kind}" style="--c:${d.color}"><span class="g">${d.glyph}</span></span><div><b>${d.name}</b><p>${d.desc(2)}</p></div>` })));
    body.appendChild(sg);
  }

  /* ---------- Setup (horse + item) ---------- */
  function setupScreen() {
    SBR.meta.unlockedLeads = SBR.meta.unlockedLeads || ['johnny', 'gyro'];
    let lead = SBR.meta.lastLead && SBR.meta.unlockedLeads.includes(SBR.meta.lastLead) ? SBR.meta.lastLead : 'johnny';
    let horse = SBR.meta.lastHorse && SBR.meta.unlockedHorses.includes(SBR.meta.lastHorse) ? SBR.meta.lastHorse : 'slowdancer';
    let item = SBR.meta.lastItem && SBR.meta.unlockedItems.includes(SBR.meta.lastItem) ? SBR.meta.lastItem : 'colt';
    ui.transition(scr => {
      scr.className = 'screen-setup';
      scr.innerHTML = `<div class="lobby-scene">${art.scene(1, { still: true })}</div>`;
      const box = el('div', { class: 'setup' });
      const render = () => {
        box.innerHTML = '';
        const L = SBR.CHARS[lead];
        box.appendChild(el('div', { class: 'setup-head', html: `<div class="setup-port">${art.portrait(L.portrait)}</div><div><div class="lh-title">Registration</div><p>Lead rider: <b>${L.name}</b> — ${L.title}. ${lead === 'johnny' ? '' : 'Johnny rides with you from the start. '}Choose your horse and one item to bring.</p></div>` }));
        box.appendChild(el('div', { class: 'cs-sub' }, 'CHOOSE YOUR LEAD RIDER'));
        const lg = el('div', { class: 'lead-grid' });
        SBR.LEADS.forEach(k => {
          const C = SBR.CHARS[k], un = SBR.meta.unlockedLeads.includes(k);
          const ach = Object.values(SBR.ACHIEVEMENTS).find(a => a.unlockLead === k);
          const paths = SBR.pathsFor(k).map(pid => `<span class="lead-path" style="--pc:${SBR.PATHS[pid].color}">${SBR.PATHS[pid].name}</span>`).join('');
          const c = el('div', { class: 'lead-card' + (un ? '' : ' locked') + (k === lead ? ' selected' : '') }, el('div', { class: 'lead-port', html: art.portrait(C.portrait) }), el('div', { class: 'lead-info', html: `<b>${un ? C.name : '???'}</b><small>${un ? C.stand : art.icon('lock', 12) + ' ' + (ach ? ach.desc : '')}</small>${un ? `<div class="lead-paths">${paths}</div>` : ''}` }));
          if (un) { c.onclick = () => { SBR.audio.play('select'); lead = k; render(); }; SBR.tip.bind(c, () => `<b>${C.name}</b><br>${C.passive.name}: ${C.passive.desc}<br><i>Paths: ${SBR.pathsFor(k).map(pid => SBR.PATHS[pid].name).join(' · ')}</i>`); }
          lg.appendChild(c);
        });
        box.appendChild(lg);
        box.appendChild(el('div', { class: 'cs-sub' }, 'CHOOSE YOUR HORSE'));
        const hg = el('div', { class: 'horse-grid' });
        Object.entries(SBR.HORSES).forEach(([k, h]) => hg.appendChild(horseCard(k, h, SBR.meta.unlockedHorses.includes(k), kk => { horse = kk; render(); }, k === horse)));
        box.appendChild(hg);
        box.appendChild(el('div', { class: 'cs-sub' }, 'CHOOSE ONE ITEM'));
        const ig = el('div', { class: 'starter-grid' });
        Object.entries(SBR.EQUIPMENT).filter(([, R]) => R.starter).forEach(([k, R]) => {
          const un = SBR.meta.unlockedItems.includes(k);
          const ach = Object.values(SBR.ACHIEVEMENTS).find(a => a.unlockItem === k);
          const c = el('div', { class: 'starter-card' + (un ? '' : ' locked') + (k === item ? ' selected' : '') }, ui.equipChip(k), el('div', { html: `<b>${un ? R.name : '???'}</b><p>${un ? R.descText : (ach ? art.icon('lock', 12) + ' ' + ach.desc : '')}</p>` }));
          if (un) c.onclick = () => { SBR.audio.play('select'); item = k; render(); };
          ig.appendChild(c);
        });
        box.appendChild(ig);
        const eq = SBR.meta.equippedTech.map(k => SBR.TECHNIQUES[k].name).join(', ') || 'none';
        box.appendChild(el('p', { class: 'muted' }, `Techniques equipped: ${eq}`));
        const foot = el('div', { class: 'lobby-foot' });
        foot.appendChild(ui.btn('◂ Saloon', () => lobbyScreen(), 'btn-ghost'));
        foot.appendChild(ui.btn('RIDE! ▸', () => beginRace(horse, item, lead), 'btn-primary big'));
        box.appendChild(foot);
      };
      render();
      scr.appendChild(box);
    });
  }
  async function beginRace(horse, item, lead = 'johnny') {
    SBR.meta.lastHorse = horse; SBR.meta.lastItem = item; SBR.meta.lastLead = lead; SBR.saveMeta();
    newRun(horse, item, lead);
    await ui.dialogue('prologue');
    // 1st Stage sprint (tutorial)
    const res = await SBR.sprint.run({ name: '1st Stage — San Diego Beach, 15,000 m', act: 1, favourite: 'gyro', tutorial: true });
    applySprint(res);
    await standingsScreen(res.place);
    startAct(1);
  }

  /* ---------- global keys ---------- */
  document.addEventListener('keydown', e => {
    if (SBR.inBattle || document.querySelector('.dlg-wrap') || document.querySelector('.sprint')) return;
    const onStage = document.querySelector('.screen-stage');
    if (!onStage) return;
    if (document.querySelector('.modal-wrap')) { if (e.key === 'Escape') { const w = [...document.querySelectorAll('.modal-wrap')].pop(); const x = w.querySelector('.modal-x'); x && x.click(); } return; }
    const k = e.key.toLowerCase();
    if (k === 'p') ui.partyScreen();
    if (k === 'b') ui.bagScreen();
    if (k === 'm') ui.mapScreen();
    if (k === 'c') ui.craftScreen();
    if (k === 'escape') ui.settingsScreen(true);
    const n = parseInt(e.key, 10);
    const cards = document.querySelectorAll('.enc-card');
    if (n >= 1 && n <= cards.length) cards[n - 1].click();
  });

  const _debug = { newRun, startAct, fight, bossStage, playScene, showStage, actFinish };
  return { canCraft, craft, equip, unequip, freeSlot, _debug, makeMember, memberAbilities, xpToNext, autoAssign, beltSize, achieve, standings, playerRank, G, bestFor, checkMod, fieldUseItem, toTitle, titleScreen, lobbyScreen };
})();

/* boot */
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.toggle('reduced', !!SBR.settings.reducedMotion);
  document.addEventListener('pointerdown', () => SBR.audio.unlock(), { once: true });
  SBR.game.titleScreen();
});
