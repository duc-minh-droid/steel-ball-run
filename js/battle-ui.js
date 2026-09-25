/* Battle UI: renders the Combat engine and replays its events as animations */
'use strict';
SBR.battle = (() => {
  const { el, sleep } = SBR.util;
  const ui = SBR.ui, art = SBR.art;
  let c = null, root = null, cards = {}, actionBox = null, orderBox = null, logBox = null, roundBox = null;
  let inputResolve = null, targeting = null, activeUid = null, keyHandler = null;

  const SFX_WORDS = { ora: ['オラオラ', 'ORA ORA'], muda: ['無駄無駄', 'MUDA MUDA'], dora: ['ドラララ', 'DORARARA'], ari: ['アリアリ', 'ARI ARI'], nail: ['ズキュン', 'ZUKYUN'], ball: ['ギャルギャル', 'GYARU'], gun: ['BANG!', 'ドン'], claw: ['ザシュ', 'SLASH'], hit: ['ドゴォ', 'WHAM'], boom: ['ドグォン', 'KA-BOOM'], aoe: ['ドドド', 'DODODO'], golden: ['黄金', 'GOLDEN'], act4: ['ドララ', 'ORA ORA'], ballbreaker: ['ボール', 'BREAK'], spray: ['ブシュ', 'SPLRT'], rope: ['シュル', 'SNAP'],
    fire: ['ゴオッ', 'FWOOSH'], firebind: ['ジュウ', 'SIZZLE'], ripple: ['コォォ', 'RIPPLE'], uv: ['コォォ', 'SHINE'], beam: ['ビシュ', 'ZHOOM'], timestop: ['ドォーン', 'THE WORLD'], timeskip: ['ドォン', 'SKIP'], rewind: ['カチッ', 'CLICK'],
    zipper: ['ジィッ', 'ZZIP'], erase: ['ガオン', 'GAOON'], bomb: ['ドグォン', 'KA-BOOM'], prime: ['カチッ', 'CLICK'], emerald: ['バシバシ', 'SPLASH'], rapier: ['シュバ', 'SHING'], string: ['シュルル', 'THWIP'],
    lasso: ['ヒュン', 'WHIP'], disc: ['ズズッ', 'SHLUK'], blood: ['ズギュン', 'SLURP'], ice: ['ピキッ', 'KRAK'], gatling: ['ダダダ', 'RAT-TAT'], restore: ['ドララ', 'FIXED'] };

  /* ---------- VFX look & power tier for an 'act' event ---------- */
  // a named look for abilities whose engine fx is shared with many others
  const LOOKS = {
    crossfire: 'fire', red_bind: 'firebind', hamon_overdrive: 'ripple', sunlight_yellow: 'ripple', aja_beam: 'uv', uv_lamp: 'uv', space_ripper: 'beam',
    blood_drain: 'blood', flesh_blades: 'blood', vamp_freeze: 'ice', chest_gun: 'gatling', sp_the_world: 'timestop', time_erase: 'timeskip',
    emerald_splash: 'emerald', emerald_barrier: 'emerald', rapier_flurry: 'rapier', afterimages: 'rapier', cd_restore: 'restore',
    kq_bomb: 'prime', kq_sha: 'bomb', kq_btd: 'rewind', hand_erase: 'erase', hand_pull: 'erase', life_giver: 'life',
    arrivederci: 'zipper', zipper_escape: 'zipper', string_net: 'string', unravel: 'string', mobius: 'string', disc_steal: 'disc', command_disc: 'disc',
  };
  // name keywords → look, only applied over the generic engine fx listed
  const LOOK_WORDS = [
    [/fire|flame|burn|gasoline|blaze|ignite/i, 'fire', ['hit', 'claw', 'aoe', 'boom', 'spray', 'debuff']],
    [/ripple|hamon|sunlight|overdrive/i, 'ripple', ['hit', 'golden', 'claw']],
    [/frost|frozen|ice\b|icicle|snow|freez/i, 'ice', ['hit', 'claw', 'aoe', 'gun', 'spray']],
    [/lariat|lasso|hogtie|lasso/i, 'lasso', ['rope', 'hit']],
    [/bomb|blasting|dynamite|detonat/i, 'bomb', ['boom', 'hit']],
    [/gatling|machine gun|fan the hammer|volley|barrage/i, 'gatling', ['gun']],
    [/blade|knife|sabre|saber|scalpel|rapier|bayonet|needle/i, 'rapier', ['hit', 'claw', 'aoe']],
    [/blood|drain|vampir/i, 'blood', ['claw', 'hit']],
    [/eyes|beam|laser/i, 'beam', ['gun', 'hit']],
    [/disc/i, 'disc', ['debuff', 'hit']],
  ];
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  let pathLvl = null;
  const pathLevelOf = id => {
    if (!pathLvl) { pathLvl = {}; Object.values(SBR.PATHS || {}).forEach(p => (p.abilities || []).forEach(a => { pathLvl[a.id] = Math.max(pathLvl[a.id] || 0, a.level || 0); })); }
    return pathLvl[id] || 0;
  };
  function enemyAbility(u, e) {
    const list = (u && (u.xAbilities || (u.def && u.def.abilities))) || [];
    return list.find(a => a.name === e.name) || null;
  }
  function lookOf(e) {
    if (e.abId && LOOKS[e.abId]) return LOOKS[e.abId];
    const fx = e.fx || 'hit';
    if (e.item || e.name === 'Brace') return fx;
    for (const [re, look, over] of LOOK_WORDS) if (over.includes(fx) && re.test(e.name || '')) return look;
    return fx;
  }
  /** 0 subtle (free basics) · 1 normal · 2 strong · 3 ultimate/cinematic */
  function powerTier(u, e) {
    if (!u || e.item || e.name === 'Brace') return 0;
    const a = e.abId ? SBR.ABILITIES[e.abId] : null;
    const cost = (e.cost != null ? e.cost : a && a.cost) || 0;
    if (e.enemy) {
      let t = cost >= 2 ? 2 : cost >= 1 ? 1 : 0;
      if (u.tier === 'boss') t = cost >= 2 ? 3 : t + 1;
      else if (u.tier === 'elite' && cost >= 1) t = Math.min(2, t + 1);
      return Math.min(3, t);
    }
    const cd = (a && a.cd) || 0;
    if (cost >= 3 || cd >= 4 || (e.abId && pathLevelOf(e.abId) >= 5)) return 3;
    let t = cost >= 2 ? 2 : cost >= 1 ? 1 : 0;
    if (e.abId && u.upgrades && u.upgrades[e.abId] > 1) t++;
    if (a && (a.tags || []).includes('stand')) t = Math.max(t, 1);
    if (e.pierce) t++;
    return Math.min(2, t);
  }
  function dtypeOfAct(u, e) {
    try {
      if (e.item || e.name === 'Brace') return null;
      const noDmg = ['buff', 'heal', 'debuff', 'scan', 'item'];
      if (e.enemy) { const a = enemyAbility(u, e); if (!a || noDmg.includes(a.fx) || a.target === 'self' || a.target === 'ally') return null; return c.dtypeOf(u, a, {}, a.tags || []); }
      const a = e.abId ? SBR.ABILITIES[e.abId] : null;
      if (!a || !SBR.abilityDtype(a)) return null;
      if (a.target === 'self' || a.target === 'ally' || a.target === 'allAllies' || a.target === 'allyDead') return null;
      return c.dtypeOf(u, a, {}, a.tags || []);
    } catch (err) { return null; }
  }
  function vfxQuake(strong) {
    if (!SBR.settings.shake || SBR.settings.reducedMotion) return;
    const n = document.getElementById('app'); if (!n) return;
    n.classList.remove('vfx-quake'); void n.offsetWidth; n.classList.add('vfx-quake');
    n.style.setProperty('--d', Math.round((strong ? 560 : 400) / (SBR.settings.speed || 1)) + 'ms');
    setTimeout(() => n.classList.remove('vfx-quake'), 600 / (SBR.settings.speed || 1));
  }

  /* ---------- render ---------- */
  function render(container, opts) {
    root = el('div', { class: 'battle' + (opts.boss ? ' boss-battle' : '') });
    root.appendChild(el('div', { class: 'battle-bg', html: art.scene(SBR.sceneId(), { still: true }) }));
    root.appendChild(el('div', { class: 'battle-vignette' }));
    const top = el('div', { class: 'battle-top' });
    roundBox = el('div', { class: 'round-box' }, 'ROUND 1');
    orderBox = el('div', { class: 'order-ribbon' });
    const flee = el('div', { class: 'battle-title' }, opts.title || (opts.boss ? 'BOSS BATTLE' : opts.elite ? 'ELITE BATTLE' : 'BATTLE'));
    top.append(flee, orderBox, roundBox);
    const field = el('div', { class: 'battle-field' });
    const pside = el('div', { class: 'side party-side' });
    const eside = el('div', { class: 'side enemy-side' });
    field.append(pside, el('div', { class: 'vs-mark' }, 'VS'), eside);
    cards = {};
    c.units.forEach(u => { if (!u.removed) (u.side === 'party' ? pside : eside).appendChild(unitCard(u)); });
    actionBox = el('div', { class: 'action-panel' });
    logBox = el('div', { class: 'battle-log' });
    const logToggle = el('button', { class: 'log-toggle' }, 'LOG');
    logToggle.onclick = () => logBox.classList.toggle('open');
    root.append(top, field, actionBox, logBox, logToggle);
    container.appendChild(root);
    renderOrder();
  }

  function unitCard(u) {
    const card = el('div', { class: `unit-card ${u.side} tier-${u.tier || 'ally'}` + (u.dead ? ' dead' : '') + (u.traits && u.traits.length ? ' traited' : ''), dataset: { uid: u.uid } });
    card.innerHTML = `
      <div class="uc-frame"><div class="uc-art">${ui.artFor(u.art)}</div><div class="uc-flash"></div></div>
      <div class="uc-name">${u.name}${u.def && u.def.stand ? `<small>「${u.def.stand}」</small>` : ''}</div>
      <div class="hpbar"><div class="hpghost"></div><div class="hpfill"></div><div class="shieldfill"></div><span class="hptext"></span></div>
      <div class="energy-pips"></div>
      <div class="uc-status"></div>
      <div class="uc-floats"></div>`;
    cards[u.uid] = card;
    setHp(u, u.hp, true);
    renderStatus(u);
    renderEnergy(u);
    updateCompanion(u, card);
    card.addEventListener('click', () => onCardClick(u));
    card.addEventListener('mouseenter', () => { if (targeting && isValidTarget(u)) card.classList.add('target-hover'); });
    card.addEventListener('mouseleave', () => card.classList.remove('target-hover'));
    SBR.tip.bind(card.querySelector('.uc-frame'), () => unitTip(u));
    return card;
  }
  function unitTip(u) {
    const lines = [`<b>${u.fullName || u.name}</b>${u.def && u.def.title ? ` — <i>${u.def.title}</i>` : ''}`];
    lines.push(`HP ${u.hp}/${u.maxHp}`);
    lines.push(`Dodge ${Math.round(c.dodgeChance(u) * 100)}% · Block ${Math.round(c.blockChance(u) * 100)}% · Crit ${Math.round(c.critChance(u) * 100)}%`);
    if (u.traits && u.traits.length) lines.push(`<span class="tip-traits">${u.traits.map(k => SBR.traitBadge(k) + ' <small>' + SBR.TRAITS[k].desc + '</small>').join('<br>')}</span>`);
    const rc = SBR.resChips(c.resOf(u));
    if (rc) lines.push(`<span class="tip-res">${rc}</span>`);
    if (u.side === 'enemy' && u.def.dtype) lines.push(`<span class="tip-dt">Attacks deal <b style="color:${SBR.DMG[u.def.dtype].color}">${SBR.DMG[u.def.dtype].name}</b></span>`);
    if (u.side === 'enemy' && u.def.passive) lines.push(`<span class="tip-passive">${u.def.passive}</span>`);
    if (u.side === 'party' && u.def.passive) lines.push(`<span class="tip-passive">${u.def.passive.name}: ${u.def.passive.desc}</span>`);
    return lines.join('<br>');
  }
  function setHp(u, hp, instant) {
    const card = cards[u.uid]; if (!card) return;
    const pct = Math.max(0, Math.min(100, hp / u.maxHp * 100));
    const fill = card.querySelector('.hpfill'), ghost = card.querySelector('.hpghost');
    fill.style.width = pct + '%';
    fill.classList.toggle('low', pct < 30);
    if (instant) ghost.style.width = pct + '%';
    else setTimeout(() => { ghost.style.width = pct + '%'; }, 380);
    const sh = c.stacks(u, 'shield');
    card.querySelector('.shieldfill').style.width = Math.min(100, sh / u.maxHp * 100) + '%';
    card.querySelector('.hptext').textContent = `${Math.max(0, hp)}/${u.maxHp}${sh ? ` +${sh}` : ''}`;
  }
  function renderStatus(u) {
    const card = cards[u.uid]; if (!card) return;
    const box = card.querySelector('.uc-status');
    box.innerHTML = '';
    u.statuses.forEach(s => {
      const d = SBR.STATUS[s.id];
      const n = d.mode === 'stacks' ? s.stacks : (s.turns > 900 ? '' : s.turns);
      const chip = el('div', { class: 'st-chip ' + d.kind, style: { '--c': d.color }, html: SBR.icons.status(s.id) }, n !== '' ? el('span', { class: 'n' }, String(n)) : '');
      SBR.tip.bind(chip, () => ui.statusTip(s.id, s));
      box.appendChild(chip);
    });
  }
  function updateCompanion(u, card = cards[u.uid]) {
    if (!card) return;
    const key = SBR.stands.keyFor(u);
    let comp = card.querySelector('.uc-stand');
    if (!key || !SBR.stands.isEntity(key)) { if (comp) comp.remove(); return; }
    if (comp && comp.dataset.key === key) return;
    if (comp) comp.remove();
    comp = el('div', { class: 'uc-stand', dataset: { key }, html: SBR.stands.svg(key) });
    SBR.tip.bind(comp, `<b>「${SBR.stands.name(key)}」</b><br>This Stand manifests beside its user.`);
    card.insertBefore(comp, card.firstChild);
  }
  async function standFlash(uid, key) {
    const card = cards[uid]; if (!card) return;
    const comp = card.querySelector('.uc-stand');
    if (comp) { comp.classList.remove('strike'); void comp.offsetWidth; comp.classList.add('strike'); }
    const pt = center(uid);
    const f = el('div', { class: 'stand-flash ' + (c.unit(uid).side), style: { left: pt.x + 'px', top: pt.y + 'px' }, html: SBR.stands.svg(key) + `<div class="sf-name">「${SBR.stands.name(key)}」</div>` });
    document.getElementById('fx-layer').appendChild(f);
    SBR.audio.play(key === 'd4c' || key === 'lovetrain' ? 'd4c' : key === 'mandom' ? 'rewind' : key === 'theworld' ? 'timestop' : 'stand');
    setTimeout(() => f.remove(), 1300 / SBR.settings.speed);
    await sleep(420);
  }
  function renderEnergy(u) {
    const card = cards[u.uid]; if (!card) return;
    const box = card.querySelector('.energy-pips'); if (!box) return;
    box.innerHTML = '';
    for (let i = 0; i < u.maxEnergy; i++) box.appendChild(el('span', { class: 'pip' + (i < u.energy ? ' on' : '') }));
  }
  function crowding() {
    root.querySelectorAll('.side').forEach(s => {
      const n = [...s.children].filter(k => !k.classList.contains('gone')).length;
      s.classList.toggle('crowd-3', n === 3);
      s.classList.toggle('crowd-4', n >= 4);
    });
  }
  function renderOrder() {
    if (root) crowding();
    orderBox.innerHTML = '';
    const n = c.order.length;
    let shown = 0;
    for (let k = 0; k < n && shown < 9; k++) {
      const idx = ((c.turnIdx < 0 ? 0 : c.turnIdx) + k) % n;
      const u = c.unit(c.order[idx]);
      if (!u || u.dead || u.removed) continue;
      const chip = el('div', { class: 'order-chip ' + u.side + (k === 0 && c.turnIdx >= 0 ? ' now' : ''), html: ui.artFor(u.art) });
      SBR.tip.bind(chip, `${u.name} · initiative ${u.init}`);
      orderBox.appendChild(chip);
      shown++;
    }
  }
  function syncAll() {
    c.units.forEach(u => {
      if (u.removed) { if (cards[u.uid]) cards[u.uid].classList.add('gone'); return; }
      if (!cards[u.uid]) { const side = root.querySelector(u.side === 'party' ? '.party-side' : '.enemy-side'); side.appendChild(unitCard(u)); }
      setHp(u, u.hp);
      renderStatus(u);
      renderEnergy(u);
      updateCompanion(u);
      cards[u.uid].classList.toggle('dead', !!u.dead);
    });
    renderOrder();
  }

  /* ---------- animation helpers ---------- */
  function center(uid) {
    const card = cards[uid];
    if (!card) return { x: innerWidth / 2, y: innerHeight / 2 };
    const r = card.querySelector('.uc-frame').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function floatText(uid, text, cls = '') {
    const card = cards[uid]; if (!card) return;
    const f = el('div', { class: 'float ' + cls, style: { '--dx': (Math.random() * 40 - 20) + 'px' } }, text);
    card.querySelector('.uc-floats').appendChild(f);
    setTimeout(() => f.remove(), 1400);
  }
  function projectile(fromUid, toUid, kind) {
    const a = center(fromUid), b = center(toUid);
    const p = el('div', { class: 'proj proj-' + kind });
    p.style.left = a.x + 'px'; p.style.top = a.y + 'px';
    document.getElementById('fx-layer').appendChild(p);
    const dur = kind === 'ball' || kind === 'golden' ? 380 : 240;
    const anim = p.animate([{ transform: 'translate(-50%,-50%) rotate(0deg)', left: a.x + 'px', top: a.y + 'px' }, { transform: 'translate(-50%,-50%) rotate(720deg)', left: b.x + 'px', top: b.y + 'px' }], { duration: dur / SBR.settings.speed, easing: 'cubic-bezier(.3,.1,.6,1)' });
    return new Promise(res => { anim.onfinish = () => { p.remove(); res(); }; });
  }
  function burstAt(uid, kind) {
    const pt = center(uid);
    const b = el('div', { class: 'burst burst-' + kind, style: { left: pt.x + 'px', top: pt.y + 'px' } });
    document.getElementById('fx-layer').appendChild(b);
    setTimeout(() => b.remove(), 900);
  }
  function sfxWord(uid, kind, tier = 1) {
    const w = SFX_WORDS[kind]; if (!w) return;
    const pt = center(uid);
    ui.sfxText(Math.random() < 0.6 ? w[0] : w[1], pt.x + (Math.random() * 60 - 30), pt.y - 70, 'k-' + kind + ' vfx-t' + tier);
  }
  function actBanner(u, name, enemy) {
    const b = el('div', { class: 'act-banner ' + (enemy ? 'enemy' : 'party') }, el('span', {}, name));
    root.appendChild(b);
    setTimeout(() => b.classList.add('out'), 900 / SBR.settings.speed);
    setTimeout(() => b.remove(), 1300 / SBR.settings.speed);
  }
  function speech(uid, text) {
    const card = cards[uid]; if (!card) return;
    const s = el('div', { class: 'speech' }, text);
    card.appendChild(s);
    setTimeout(() => s.remove(), 2200);
  }
  async function bigFx(kind) {
    const o = el('div', { class: 'bigfx bigfx-' + kind });
    if (kind === 'act4' || kind === 'ballbreaker' || kind === 'golden') o.innerHTML = art.sigil('spiral', kind === 'act4' ? '#ffd84a' : '#f2c14e');
    root.appendChild(o);
    await sleep(700);
    o.classList.add('out');
    setTimeout(() => o.remove(), 500);
  }

  /* ---------- event playback ---------- */
  // what lands on a target after a multi-target act; played on every target at once
  const WAVE = new Set(['dmg', 'heal', 'status', 'statusGone', 'float', 'setHp', 'death']);
  async function play(events) {
    let multi = null;
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      if (e.t === 'act') multi = e.targets && e.targets.length > 1 ? new Set(e.targets) : null;
      else if (!WAVE.has(e.t)) multi = null;
      if (multi && WAVE.has(e.t) && multi.has(e.uid)) {
        const by = new Map();
        while (i < events.length && WAVE.has(events[i].t) && multi.has(events[i].uid)) { const x = events[i++]; if (!by.has(x.uid)) by.set(x.uid, []); by.get(x.uid).push(x); }
        i--;
        if (by.size > 1) { flashWave([...by.keys()]); await Promise.all([...by.values()].map(async list => { for (const x of list) await playOne(x); })); }
        else for (const x of [...by.values()][0]) await playOne(x);
        continue;
      }
      await playOne(e);
    }
  }
  /** one shared flash across every card an area attack hits */
  function flashWave(uids) {
    uids.forEach(uid => { const k = cards[uid]; if (!k) return; k.classList.remove('aoe-hit'); void k.offsetWidth; k.classList.add('aoe-hit'); setTimeout(() => k.classList.remove('aoe-hit'), 600); });
    if (uids.length >= 3) ui.shake(undefined, uids.length >= 4);
  }
  async function playOne(e) {
    const u = e.uid ? c.unit(e.uid) : null;
    if ('uid' in e && !u) { console.warn('event for unknown unit', JSON.stringify(e)); return; }
    switch (e.t) {
      case 'round':
        roundBox.textContent = 'ROUND ' + e.round;
        roundBox.classList.remove('pulse'); void roundBox.offsetWidth; roundBox.classList.add('pulse');
        break;
      case 'turn':
        Object.values(cards).forEach(k => k.classList.remove('active'));
        if (cards[e.uid]) cards[e.uid].classList.add('active');
        activeUid = e.uid;
        renderOrder();
        if (u) renderEnergy(u);
        await sleep(160);
        break;
      case 'act': {
        const card = cards[e.uid];
        actBanner(u, e.name, e.enemy);
        if (card) { card.classList.remove('lunge'); void card.offsetWidth; card.classList.add('lunge'); }
        if (u) renderEnergy(u);
        if (u && ((!e.enemy && (e.cost >= 3 || e.pierce)) || (e.enemy && u.tier === 'boss' && e.cost >= 2))) {
          const sk = SBR.stands.keyFor(u, e.abId);
          await SBR.cutin({ portrait: ui.artFor(u.art), name: e.name, sub: sk ? `「${SBR.stands.name(sk)}」` : (u.fullName || u.name), color: e.enemy ? '#c8323c' : (u.def && u.def.color) || '#f2c14e', enemy: !!e.enemy, kanaText: e.enemy ? 'ゴゴゴゴ' : 'ドドドド' });
        }
        const fx = lookOf(e);
        const tier = powerTier(u, e);
        const dtype = dtypeOfAct(u, e);
        const slvl = (u && u.upgrades && e.abId && u.upgrades[e.abId]) || 1;
        // close-range Stands fly over and pummel; the rest flash behind their user. Weapons show in the attacker's hand.
        let rushed = false;
        const skKey = e.special && u ? SBR.stands.keyFor(u, e.abId) : null;
        const foeT = u ? e.targets.filter(t => t !== e.uid && cards[t] && c.unit(t) && c.unit(t).side !== u.side) : [];
        if (skKey && SBR.strike && SBR.strike.isClose(skKey) && foeT.length && dtype) {
          rushed = true;
          await SBR.strike.rush({ key: skKey, from: center(e.uid), to: foeT.slice(0, 4).map(center), tier, lvl: slvl, enemy: !!e.enemy, color: (dtype && SBR.DMG[dtype] ? SBR.DMG[dtype].color : (u.def && u.def.color)) || '#f2c14e' });
        } else if (skKey) await standFlash(e.uid, skKey);
        if (!rushed && u && SBR.strike && SBR.strike.hasWeapon(fx) && e.targets.length && !(e.targets.length === 1 && e.targets[0] === e.uid)) {
          await SBR.strike.weapon({ look: fx, from: center(e.uid), to: center(e.targets.find(t => t !== e.uid) || e.targets[0]), tier, lvl: slvl, enemy: !!e.enemy });
        }
        if (['act4', 'ballbreaker'].includes(fx)) { SBR.audio.play('spin'); await bigFx(fx); }
        const snd = { gun: 'gun', nail: 'gun', ball: 'spin', golden: 'spin', act4: 'spin', ballbreaker: 'spin', heal: 'heal', buff: 'buff', item: 'buff', debuff: 'debuff', boom: 'boom', claw: 'hit', hit: 'hit', aoe: 'hit', rope: 'whistle', sound: 'boom', rain: 'miss', magnet: 'block', grid: 'block', pin: 'click', spray: 'miss', scan: 'spin', wormhole: 'rewind',
          fire: 'boom', firebind: 'whistle', ripple: 'spin', uv: 'spin', beam: 'gun', timestop: 'timestop', timeskip: 'rewind', rewind: 'rewind', zipper: 'click', erase: 'rewind', bomb: 'click', prime: 'click', emerald: 'gun', rapier: 'hit', string: 'whistle', lasso: 'whistle', disc: 'debuff', blood: 'hit', ice: 'miss', gatling: 'gun', life: 'heal', restore: 'heal' }[fx];
        if (snd) SBR.audio.play(snd);
        if ((fx === 'wormhole' || fx === 'erase') && card) { card.classList.add('warp'); setTimeout(() => card.classList.remove('warp'), 700); }
        if (card && tier >= 2) { card.classList.remove('vfx-charge', 'vfx-charge3'); void card.offsetWidth; card.classList.add(tier >= 3 ? 'vfx-charge3' : 'vfx-charge'); card.style.setProperty('--vc', (dtype && SBR.DMG[dtype] ? SBR.DMG[dtype].color : (u && u.def && u.def.color) || '#f2c14e')); setTimeout(() => card.classList.remove('vfx-charge', 'vfx-charge3'), 1000 / SBR.settings.speed); }
        const tpts = e.targets.filter(t => cards[t]).slice(0, 5).map(center);
        const selfOnly = e.targets.length === 1 && e.targets[0] === e.uid;
        if (!rushed) await SBR.fx.play(fx || 'hit', center(e.uid), tpts.length ? tpts : [center(e.uid)], {
          enemy: e.enemy, self: selfOnly, tier, dtype, abId: e.abId,
          lvl: (u && u.upgrades && e.abId && u.upgrades[e.abId]) || 1,
          variant: hash(e.abId || e.name || fx), ucolor: u && u.def && u.def.color,
          scanColor: e.abId === 'life_detector' ? '#e8742a' : e.abId === 'epitaph' ? '#c8323c' : undefined,
          command: e.abId === 'command_disc',
        });
        if (tier >= 3) vfxQuake(true);
        else if (fx === 'boom' || fx === 'bomb' || fx === 'act4' || fx === 'ballbreaker') ui.shake(undefined, true);
        else if (tier === 2 && !selfOnly) ui.shake();
        if (tier < 3 && e.targets[0] && e.targets[0] !== e.uid) sfxWord(e.targets[0], fx, tier);
        await sleep(tier >= 3 ? 160 : 120);
        break;
      }
      case 'dmg': {
        setHp(u, e.hp);
        const card = cards[e.uid];
        if (e.amount > 0 || e.absorbed) {
          const dcol = e.dtype && SBR.DMG[e.dtype] ? SBR.DMG[e.dtype].color : null;
          if (dcol && card) card.style.setProperty('--dmgc', dcol);
          if (e.eff !== undefined && e.eff !== null && e.eff !== 1 && e.dtype !== 'true') floatText(e.uid, e.eff >= 1.2 ? 'WEAK!' : e.eff > 1 ? 'weak' : e.eff <= 0.6 ? 'RESIST' : 'resist', 'eff ' + (e.eff > 1 ? 'weak' : 'resist') + (e.eff >= 1.2 || e.eff <= 0.6 ? ' big' : ''));
          if (card) { card.classList.remove('hit'); void card.offsetWidth; card.classList.add('hit'); }
          if (e.label) SBR.fx.dot(e.label, center(e.uid)); else SBR.fx.impact(center(e.uid), e.crit, e.blocked, e.dtype);
          if (e.crit) { floatText(e.uid, e.amount, 'dmg crit' + (e.dtype ? ' dt' : '')); floatText(e.uid, 'CRITICAL!', 'critword'); SBR.audio.play('crit'); ui.shake(undefined, true); }
          else if (e.blocked) { floatText(e.uid, e.amount, 'dmg blocked'); floatText(e.uid, 'BLOCK', 'block'); SBR.audio.play('block'); }
          else { floatText(e.uid, e.amount, 'dmg' + (e.label ? ' dot' : '') + (e.dtype ? ' dt' : '')); SBR.audio.play(e.dtype ? 'hit_' + e.dtype : 'hit'); if (u && u.side === 'party') ui.shake(); }
          if (e.absorbed) floatText(e.uid, `(${e.absorbed} shielded)`, 'block');
          if (e.label && !['BLEED', 'HOLE', 'GUILT', '∞'].includes(e.label)) floatText(e.uid, e.label, 'label');
          else if (e.label) floatText(e.uid, e.label, 'label small');
        }
        await sleep(e.label ? 220 : 170);
        break;
      }
      case 'heal':
        setHp(u, e.hp);
        if (e.amount > 0) { floatText(e.uid, '+' + e.amount, 'heal'); SBR.fx.regen(center(e.uid)); }
        await sleep(120);
        break;
      case 'setHp': setHp(u, e.hp); await sleep(60); break;
      case 'status':
        renderStatus(u);
        if (cards[e.uid]) { const d = SBR.STATUS[e.id]; floatText(e.uid, d.name, 'st ' + e.kind); SBR.audio.play(e.kind === 'buff' ? 'st_buff' : 'st_debuff'); }
        await sleep(90);
        break;
      case 'statusGone': renderStatus(u); break;
      case 'float': floatText(e.uid, e.text, e.cls); if (e.text === 'DODGE') SBR.audio.play('dodge'); else if (e.text === 'IMMUNE') SBR.audio.play('immune'); else if (e.cls && e.cls.includes('miss')) SBR.audio.play('miss'); await sleep(140); break;
      case 'death': {
        const card = cards[e.uid];
        if (card) { card.classList.add('dying'); setTimeout(() => { card.classList.remove('dying'); card.classList.add(e.permanent ? 'gone' : 'dead'); if (u.side === 'enemy') card.classList.add('gone'); }, 700); }
        SBR.audio.play('death'); SBR.fx.death(center(e.uid));
        if (u && u.side === 'enemy') { const pt = center(e.uid); ui.sfxText('RETIRED', pt.x, pt.y, 'retire'); }
        await sleep(450);
        break;
      }
      case 'revive': { const card = cards[e.uid]; if (card) card.classList.remove('dead', 'gone'); setHp(u, e.hp); floatText(e.uid, 'REVIVED', 'heal'); SBR.audio.play('heal'); await sleep(300); break; }
      case 'summon': {
        const side = root.querySelector('.enemy-side');
        const card = unitCard(u); card.classList.add('summoned');
        side.appendChild(card);
        requestAnimationFrame(() => SBR.fx.summon(center(e.uid)));
        renderOrder();
        await sleep(350);
        break;
      }
      case 'say': speech(e.uid, e.text); await sleep(500); break;
      case 'log': addLog(e.text, e.kind); break;
      case 'dialogue': { const sc = SBR.STORY[e.id]; const inFight = id => c.party().some(p => p.id === id && !p.removed); const absent = sc && (sc.lines || []).some(l => ['johnny', 'gyro'].includes(l.who) && !inFight(l.who)); if (!absent) await ui.dialogue(e.id); break; }
      case 'abilities': c.party().forEach(p => updateCompanion(p)); if (inputResolve && activeUid) showActions(c.unit(activeUid)); break;
      case 'fx': {
        const pt = center(e.uid);
        if (e.kind === 'boom') { SBR.audio.play('boom'); SBR.fx.boom(pt.x, pt.y); ui.shake(undefined, true); }
        else if (e.kind === 'sound') { SBR.audio.play('boom'); SBR.fx.dot('DOGOOON', pt); }
        else if (e.kind === 'rewind') { SBR.audio.play('rewind'); SBR.fx.spiral(pt.x, pt.y, '#e8c070', 80, 5, 0.9); }
        await sleep(250); break;
      }
      case 'banner': await banner(e.text, e.sub); break;
      case 'timestop':
        if (e.on) { root.classList.add('timestop'); SBR.audio.play('timestop'); SBR.fx.ring(innerWidth * 0.75, innerHeight * 0.45, '#ffd84a', Math.max(innerWidth, innerHeight), 14, 1.2); await banner('THE WORLD!', 'Time has stopped.'); }
        else { await sleep(300); root.classList.remove('timestop'); ui.sfxText('時は動き出す', innerWidth / 2, innerHeight / 2, 'k-golden'); }
        break;
      case 'rewind':
        root.classList.add('rewinding'); SBR.audio.play('rewind'); SBR.fx.spiral(innerWidth / 2, innerHeight / 2, '#e8c070', 220, 8, 1, 3);
        ui.sfxText('MANDOM', innerWidth / 2, innerHeight / 2 - 40, 'k-golden');
        await sleep(900);
        root.classList.remove('rewinding');
        break;
      case 'endTurn': if (cards[e.uid]) renderStatus(u); break;
    }
    // log important events
    if (e.t === 'act') addLog(`<b>${u ? u.name : '?'}</b> uses ${e.name}`);
    if (e.t === 'dmg' && e.amount) addLog(`${u.name} takes ${e.amount}${e.crit ? ' (crit)' : ''}${e.label ? ' [' + e.label + ']' : ''}`, 'dmg');
    if (e.t === 'death') addLog(`<b>${u.name}</b> is down!`, 'death');
  }
  function addLog(text, kind = '') {
    logBox.insertBefore(el('div', { class: 'log-line ' + kind, html: text }), logBox.firstChild);
    while (logBox.children.length > 80) logBox.lastChild.remove();
  }
  async function banner(text, sub) {
    const b = el('div', { class: 'big-banner' }, el('div', { class: 'bb-text' }, text), sub ? el('div', { class: 'bb-sub' }, sub) : '');
    root.appendChild(b);
    await sleep(1300);
    b.classList.add('out');
    setTimeout(() => b.remove(), 400);
  }

  /* ---------- player input ---------- */
  function showActions(u) {
    actionBox.innerHTML = '';
    actionBox.classList.add('show');
    const head = el('div', { class: 'ap-head', html: `<div class="ap-port">${art.portrait(u.def.portrait)}</div><div><div class="ap-name">${u.fullName}</div><div class="ap-energy">${[...Array(u.maxEnergy)].map((_, i) => `<span class="pip ${i < u.energy ? 'on' : ''}"></span>`).join('')}<small>${u.energy}/${u.maxEnergy} Energy</small></div></div>` });
    actionBox.appendChild(head);
    const list = el('div', { class: 'ap-abilities' });
    u.abilities.forEach((id, i) => {
      const a = SBR.ABILITIES[id];
      const lvl = (u.upgrades || {})[id] || 1;
      const cd = u.cds[id] || 0;
      const ok = c.canUse(u, id);
      const b = el('button', { class: 'ab-btn' + (ok ? '' : ' disabled') + (a.pierce ? ' pierce' : '') + (a.tags.includes('spin') ? ' spin' : ''), dataset: { id } });
      b.innerHTML = `<span class="ab-key">${i + 1}</span><span class="ab-icon">${SBR.icons.ability(id)}</span><span class="ab-name">${a.name}</span>${a.pick > 1 ? `<span class="ab-pick">×${a.pick}</span>` : a.target === 'allEnemies' || a.target === 'allAllies' ? '<span class="ab-pick all">ALL</span>' : ''}<span class="ab-costs">${a.cost ? [...Array(a.cost)].map(() => '<i></i>').join('') : '<em>FREE</em>'}</span>${cd ? `<span class="ab-cd">${cd}</span>` : ''}`;
      SBR.tip.bind(b, () => ui.abilityTip(id, lvl, u));
      b.addEventListener('click', () => { if (ok) chooseAbility(u, id); else SBR.audio.play('back'); });
      list.appendChild(b);
    });
    actionBox.appendChild(list);
    const extra = el('div', { class: 'ap-extra' });
    const brace = ui.btn(el('span', { html: '<b>Q</b> Brace' }), () => { finishInput(() => c.brace(u)); }, 'btn-brace');
    SBR.tip.bind(brace, '<b>Brace</b><br>Skip your action: +1 Energy and Guard for 1 turn. Pulls out bomb pins.');
    const items = ui.btn(el('span', { html: `<b>E</b> Items (${SBR.run.items.length})` }), () => itemTray(u), 'btn-items' + (u.usedItem || !SBR.run.items.length ? ' disabled' : ''));
    SBR.tip.bind(items, '<b>Items</b><br>Use one item per turn. Doesn\'t end your turn.');
    extra.append(brace, items);
    actionBox.appendChild(extra);
  }
  function itemTray(u) {
    if (u.usedItem || !SBR.run.items.length) return;
    const tray = el('div', { class: 'item-tray' });
    SBR.run.items.forEach(id => {
      const it = SBR.ITEMS[id];
      if (it.fieldOnly) return;
      const chip = ui.itemChip(id, () => {
        tray.remove();
        const tt = it.target;
        const doUse = tuid => { c.useItem(u, id, tuid); play(c.flush()).then(() => { syncAll(); if (!c.result) showActions(u); else { inputResolve && inputResolve(); } }); };
        if (tt === 'ally' || tt === 'enemy' || tt === 'allyDead') startTargeting(u, tt, doUse);
        else doUse(null);
      });
      tray.appendChild(chip);
    });
    tray.appendChild(el('button', { class: 'tray-x' }, '✕')).onclick = () => tray.remove();
    actionBox.appendChild(tray);
  }
  function chooseAbility(u, id) {
    const a = SBR.ABILITIES[id];
    SBR.audio.play('click');
    actionBox.querySelectorAll('.ab-btn').forEach(b => b.classList.toggle('selected', b.dataset.id === id));
    const t = a.target;
    if (t === 'self' || t === 'allEnemies' || t === 'allAllies' || t === 'none') return finishInput(() => c.useAbility(u, id, t === 'self' ? u.uid : null));
    const valid = targetsFor(u, t);
    if (valid.length === 1 && t === 'enemy') return finishInput(() => c.useAbility(u, id, valid[0].uid));
    if (a.pick > 1 && valid.length > 1) return startTargeting(u, t, uids => finishInput(() => c.useAbility(u, id, uids)), Math.min(a.pick, valid.length), a);
    startTargeting(u, t, tuid => finishInput(() => c.useAbility(u, id, tuid)));
  }
  function targetsFor(u, t) {
    if (t === 'enemy') return c.foes(u);
    if (t === 'ally') return c.friends(u);
    if (t === 'allyDead') return c.party().filter(p => p.dead && !p.removed);
    return [];
  }
  function startTargeting(u, t, cb, pick = 0, ab = null) {
    actionBox.querySelectorAll('.target-hint').forEach(h => h.remove());
    const valid = targetsFor(u, t);
    targeting = { u, t, cb, valid, pick, picked: [], ab };
    root.classList.add('targeting');
    Object.values(cards).forEach(k => k.classList.remove('targetable', 'target-picked'));
    valid.forEach(v => cards[v.uid] && cards[v.uid].classList.add('targetable'));
    const hint = el('div', { class: 'target-hint' + (pick ? ' multi' : '') });
    actionBox.appendChild(hint);
    renderHint();
  }
  const SPLIT = n => Math.round(((SBR.SPREAD || [])[n] || 1) * 100);
  function renderHint() {
    const h = actionBox.querySelector('.target-hint'); if (!h || !targeting) return;
    const T = targeting;
    if (!T.pick) { h.textContent = T.t === 'enemy' ? 'Choose a target · Esc to cancel' : 'Choose an ally · Esc to cancel'; return; }
    const k = T.picked.length, who = T.t === 'enemy' ? 'enemies' : 'allies';
    h.innerHTML = `<span class="th-count">${[...Array(T.pick)].map((_, i) => `<i class="${i < k ? 'on' : ''}"></i>`).join('')}</span>
      <span class="th-text">Pick up to <b>${T.pick}</b> ${who}${T.ab && T.ab.spread && k > 1 ? ` · <em>${SPLIT(k)}% each</em>` : T.ab && T.ab.spread ? ' · split damage' : ''}</span>`;
    const go = el('button', { class: 'th-btn go' + (k ? '' : ' disabled') }, k ? `Go (${k}) ↵` : 'Go ↵');
    go.onclick = ev => { ev.stopPropagation(); confirmPicks(); };
    const all = el('button', { class: 'th-btn' }, `Max (${T.pick})`);
    all.onclick = ev => { ev.stopPropagation(); T.picked = T.valid.slice().sort((a, b) => T.t === 'enemy' ? a.hp - b.hp : a.hp / a.maxHp - b.hp / b.maxHp).slice(0, T.pick); confirmPicks(); };
    h.append(go, all, el('span', { class: 'th-esc' }, 'Esc'));
  }
  function confirmPicks() {
    if (!targeting || !targeting.picked.length) return;
    const { cb, picked } = targeting;
    SBR.audio.play('select');
    stopTargeting();
    cb(picked.map(p => p.uid));
  }
  function stopTargeting() {
    targeting = null;
    if (!root) return;
    root.classList.remove('targeting');
    Object.values(cards).forEach(k => { k.classList.remove('targetable', 'target-hover', 'target-picked'); delete k.dataset.pickn; });
    const h = actionBox.querySelector('.target-hint'); if (h) h.remove();
    actionBox.querySelectorAll('.ab-btn').forEach(b => b.classList.remove('selected'));
  }
  function isValidTarget(u) { return targeting && targeting.valid.includes(u); }
  function onCardClick(u) {
    if (!targeting || !isValidTarget(u)) return;
    const T = targeting;
    if (T.pick) {
      const i = T.picked.indexOf(u);
      if (i >= 0) T.picked.splice(i, 1); else if (T.picked.length < T.pick) T.picked.push(u);
      SBR.audio.play(i >= 0 ? 'back' : 'click');
      T.valid.forEach(v => { const k = cards[v.uid]; if (!k) return; const n = T.picked.indexOf(v); k.classList.toggle('target-picked', n >= 0); if (n >= 0) k.dataset.pickn = n + 1; else delete k.dataset.pickn; });
      if (T.picked.length >= T.pick) return confirmPicks();
      return renderHint();
    }
    const cb = T.cb;
    SBR.audio.play('select');
    stopTargeting();
    cb(u.uid);
  }
  function finishInput(fn) {
    stopTargeting();
    actionBox.classList.remove('show');
    fn();
    const r = inputResolve; inputResolve = null;
    r && r();
  }
  function playerTurn(u) {
    return new Promise(resolve => { inputResolve = resolve; showActions(u); });
  }
  function onKey(e) {
    if (document.querySelector('.dlg-wrap') || document.querySelector('.modal-wrap')) return;
    if (!inputResolve) return;
    const u = c.unit(activeUid); if (!u || u.side !== 'party') return;
    if (e.key === 'Escape' && targeting) { stopTargeting(); return; }
    if (e.key === 'Tab' && targeting) {
      e.preventDefault();
      const v = targeting.valid; const cur = root.querySelector('.target-hover');
      let i = cur ? v.findIndex(x => cards[x.uid] === cur) : -1;
      Object.values(cards).forEach(k => k.classList.remove('target-hover'));
      i = (i + 1) % v.length; cards[v[i].uid].classList.add('target-hover');
      return;
    }
    if (e.key === 'Enter' && targeting) { const cur = root.querySelector('.target-hover'); if (targeting.pick) { if (targeting.picked.length) confirmPicks(); else if (cur) onCardClick(c.unit(cur.dataset.uid)); return; } if (cur) onCardClick(c.unit(cur.dataset.uid)); return; }
    if (e.key === ' ' && targeting && targeting.pick) { e.preventDefault(); const cur = root.querySelector('.target-hover'); if (cur) onCardClick(c.unit(cur.dataset.uid)); return; }
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= u.abilities.length) { const id = u.abilities[n - 1]; if (c.canUse(u, id)) chooseAbility(u, id); return; }
    if (e.key === 'q' || e.key === 'Q') finishInput(() => c.brace(u));
    if (e.key === 'e' || e.key === 'E') itemTray(u);
  }

  /* ---------- boss intro ---------- */
  function bossIntro(enemy) {
    return new Promise(resolve => {
      const d = enemy.def;
      const o = el('div', { class: 'boss-intro' });
      o.innerHTML = `
        <div class="bi-slash bi-slash-a"></div><div class="bi-slash bi-slash-b"></div>
        <div class="bi-sigil">${art.sigil(d.sigil || 'star', d.sigilColor || '#f2c14e')}</div>
        <div class="bi-portrait">${ui.artFor(d.art)}</div>
        <div class="bi-text">
          <div class="bi-kicker">${d.tier === 'boss' ? 'BOSS' : 'ELITE'}</div>
          <div class="bi-name">${d.name}</div>
          ${d.title ? `<div class="bi-title">${d.title}</div>` : ''}
          ${d.stand ? `<div class="bi-stand"><span>STAND</span>「${d.stand}」</div>` : ''}
          ${d.quote ? `<div class="bi-quote">“${d.quote}”</div>` : ''}
          ${d.passive ? `<div class="bi-passive">${d.passive}</div>` : ''}
          <div class="bi-hint">Click to fight ▸</div>
        </div>`;
      ui.menacing(o, 9);
      document.getElementById('overlay').appendChild(o);
      SBR.audio.play('menace');
      requestAnimationFrame(() => o.classList.add('show'));
      let done = false;
      const end = () => { if (done) return; done = true; o.classList.add('out'); setTimeout(() => { o.remove(); resolve(); }, 450); };
      o.addEventListener('click', end);
      setTimeout(() => { const h = o.querySelector('.bi-hint'); h && h.classList.add('show'); }, 900);
    });
  }

  /* ---------- main loop ---------- */
  async function run(enemies, opts = {}) {
    SBR.music.play(SBR.music.themeForBattle(enemies, opts));
    c = new SBR.Combat(enemies, opts);
    SBR.inBattle = true;
    await new Promise(res => ui.transition(scr => { scr.className = 'screen-battle'; render(scr, opts); res(); }, 'burst'));
    keyHandler = onKey;
    document.addEventListener('keydown', keyHandler);
    const lead = c.enemies().find(e => e.tier === 'boss' || e.tier === 'elite');
    if (lead && lead.def.quote) await bossIntro(lead);
    else { await banner(opts.title || 'BATTLE START', enemies.length > 1 ? `${enemies.length} enemies` : ''); }
    if (c.storyNotes) for (const n of c.storyNotes) SBR.toast(`<b>Your choices matter:</b> ${n}`, 'good');
    if (!SBR.meta.tutorialDone) { await tutorial(); }
    let safety = 0;
    while (!c.result && safety++ < 2000) {
      const u = c.nextTurn();
      await play(c.flush());
      if (c.result || !u) break;
      const b = c.beginTurn(u);
      await play(c.flush());
      if (c.result) break;
      if (b.skip) { syncAll(); continue; }
      if (u.side === 'party') {
        if (c.has(u, 'raptor')) { await sleep(300); c.autoRaptor(u); }
        else await playerTurn(u);
      } else { await sleep(260); c.enemyAct(u); }
      await play(c.flush());
      syncAll();
    }
    document.removeEventListener('keydown', keyHandler);
    SBR.inBattle = false;
    if (c.result === 'win') { SBR.audio.play('victory'); await banner(opts.boss ? 'BOSS DEFEATED!' : 'VICTORY!'); }
    else { root.classList.add('defeat'); SBR.audio.play('defeat'); await banner('RETIRED', 'Your party has fallen.'); }
    const combat = c;
    return { result: c.result, combat };
  }

  async function tutorial() {
    SBR.meta.tutorialDone = true; SBR.saveMeta();
    await ui.resultPanel('How to fight', 'Each turn, your active rider gains 2 Energy (max 6). Spend it on abilities — ◆ pips show the cost. Free abilities cost nothing. BRACE (Q) skips your action for +1 Energy and Guard. You can use one item per turn without ending it. Hover anything for details: statuses, enemies, abilities. Spin-tagged abilities matter against some Stands.', 'sword');
  }

  return { run };
})();
