/* Battle UI: renders the Combat engine and replays its events as animations */
'use strict';
SBR.battle = (() => {
  const { el, sleep } = SBR.util;
  const ui = SBR.ui, art = SBR.art;
  let c = null, root = null, cards = {}, actionBox = null, orderBox = null, logBox = null, roundBox = null;
  let inputResolve = null, targeting = null, activeUid = null, keyHandler = null;

  const SFX_WORDS = { nail: ['ズキュン', 'ZUKYUN'], ball: ['ギャルギャル', 'GYARU'], gun: ['BANG!', 'ドン'], claw: ['ザシュ', 'SLASH'], hit: ['ドゴォ', 'WHAM'], boom: ['ドグォン', 'KA-BOOM'], aoe: ['ドドド', 'DODODO'], golden: ['黄金', 'GOLDEN'], act4: ['ドララ', 'ORA ORA'], ballbreaker: ['ボール', 'BREAK'], spray: ['ブシュ', 'SPLRT'], rope: ['シュル', 'SNAP'] };

  /* ---------- render ---------- */
  function render(container, opts) {
    root = el('div', { class: 'battle' + (opts.boss ? ' boss-battle' : '') });
    root.appendChild(el('div', { class: 'battle-bg', html: art.scene(SBR.ACTS[SBR.run.act].scene, { still: true }) }));
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
    const card = el('div', { class: `unit-card ${u.side} tier-${u.tier || 'ally'}` + (u.dead ? ' dead' : ''), dataset: { uid: u.uid } });
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
    if (u.def && u.def.passive) lines.push(`<span class="tip-passive">${u.def.passive}</span>`);
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
    SBR.audio.play('menace');
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
  function sfxWord(uid, kind) {
    const w = SFX_WORDS[kind]; if (!w) return;
    const pt = center(uid);
    ui.sfxText(Math.random() < 0.6 ? w[0] : w[1], pt.x + (Math.random() * 60 - 30), pt.y - 70, 'k-' + kind);
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
  async function play(events) {
    for (const e of events) await playOne(e);
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
        if (e.special && u) { const sk = SBR.stands.keyFor(u, e.abId); if (sk) await standFlash(e.uid, sk); }
        const fx = e.fx;
        if (['act4', 'ballbreaker'].includes(fx)) { SBR.audio.play('spin'); await bigFx(fx); }
        const snd = { gun: 'gun', nail: 'gun', ball: 'spin', golden: 'spin', act4: 'spin', ballbreaker: 'spin', heal: 'heal', buff: 'buff', item: 'buff', debuff: 'debuff', boom: 'boom', claw: 'hit', hit: 'hit', aoe: 'hit', rope: 'whistle', sound: 'boom', rain: 'miss', magnet: 'block', grid: 'block', pin: 'click', spray: 'miss', scan: 'spin', wormhole: 'rewind' }[fx];
        if (snd) SBR.audio.play(snd);
        if (fx === 'wormhole' && card) { card.classList.add('warp'); setTimeout(() => card.classList.remove('warp'), 700); }
        const tpts = e.targets.filter(t => cards[t]).slice(0, 5).map(center);
        const selfOnly = e.targets.length === 1 && e.targets[0] === e.uid;
        await SBR.fx.play(fx || 'hit', center(e.uid), tpts.length ? tpts : [center(e.uid)], { enemy: e.enemy, self: selfOnly });
        if (fx === 'boom' || fx === 'act4' || fx === 'ballbreaker') ui.shake(undefined, true);
        if (e.targets[0] && e.targets[0] !== e.uid) sfxWord(e.targets[0], fx);
        await sleep(120);
        break;
      }
      case 'dmg': {
        setHp(u, e.hp);
        const card = cards[e.uid];
        if (e.amount > 0 || e.absorbed) {
          if (card) { card.classList.remove('hit'); void card.offsetWidth; card.classList.add('hit'); }
          if (e.label) SBR.fx.dot(e.label, center(e.uid)); else SBR.fx.impact(center(e.uid), e.crit, e.blocked);
          if (e.crit) { floatText(e.uid, e.amount, 'dmg crit'); floatText(e.uid, 'CRITICAL!', 'critword'); SBR.audio.play('crit'); ui.shake(undefined, true); }
          else if (e.blocked) { floatText(e.uid, e.amount, 'dmg blocked'); floatText(e.uid, 'BLOCK', 'block'); SBR.audio.play('block'); }
          else { floatText(e.uid, e.amount, 'dmg' + (e.label ? ' dot' : '')); SBR.audio.play('hit'); if (u && u.side === 'party') ui.shake(); }
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
        if (cards[e.uid]) { const d = SBR.STATUS[e.id]; floatText(e.uid, d.name, 'st ' + e.kind); }
        await sleep(90);
        break;
      case 'statusGone': renderStatus(u); break;
      case 'float': floatText(e.uid, e.text, e.cls); if (e.cls && e.cls.includes('miss')) SBR.audio.play('miss'); await sleep(140); break;
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
      case 'dialogue': await ui.dialogue(e.id); break;
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
      b.innerHTML = `<span class="ab-key">${i + 1}</span><span class="ab-icon">${SBR.icons.ability(id)}</span><span class="ab-name">${a.name}</span><span class="ab-costs">${a.cost ? [...Array(a.cost)].map(() => '<i></i>').join('') : '<em>FREE</em>'}</span>${cd ? `<span class="ab-cd">${cd}</span>` : ''}`;
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
    startTargeting(u, t, tuid => finishInput(() => c.useAbility(u, id, tuid)));
  }
  function targetsFor(u, t) {
    if (t === 'enemy') return c.foes(u);
    if (t === 'ally') return c.friends(u);
    if (t === 'allyDead') return c.party().filter(p => p.dead && !p.removed);
    return [];
  }
  function startTargeting(u, t, cb) {
    const valid = targetsFor(u, t);
    targeting = { u, t, cb, valid };
    root.classList.add('targeting');
    Object.values(cards).forEach(k => k.classList.remove('targetable'));
    valid.forEach(v => cards[v.uid] && cards[v.uid].classList.add('targetable'));
    actionBox.appendChild(el('div', { class: 'target-hint' }, t === 'enemy' ? 'Choose a target · Esc to cancel' : 'Choose an ally · Esc to cancel'));
  }
  function stopTargeting() {
    targeting = null;
    if (!root) return;
    root.classList.remove('targeting');
    Object.values(cards).forEach(k => k.classList.remove('targetable', 'target-hover'));
    const h = actionBox.querySelector('.target-hint'); if (h) h.remove();
    actionBox.querySelectorAll('.ab-btn').forEach(b => b.classList.remove('selected'));
  }
  function isValidTarget(u) { return targeting && targeting.valid.includes(u); }
  function onCardClick(u) {
    if (!targeting || !isValidTarget(u)) return;
    const cb = targeting.cb;
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
    if (e.key === 'Enter' && targeting) { const cur = root.querySelector('.target-hover'); if (cur) onCardClick(c.unit(cur.dataset.uid)); return; }
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
    if (c.result === 'win') { SBR.audio.play('success'); await banner(opts.boss ? 'BOSS DEFEATED!' : 'VICTORY!'); }
    else { root.classList.add('defeat'); SBR.audio.play('fail'); await banner('RETIRED', 'Your party has fallen.'); }
    const combat = c;
    return { result: c.result, combat };
  }

  async function tutorial() {
    SBR.meta.tutorialDone = true; SBR.saveMeta();
    await ui.resultPanel('How to fight', 'Each turn, your active rider gains 2 Energy (max 6). Spend it on abilities — ◆ pips show the cost. Free abilities cost nothing. BRACE (Q) skips your action for +1 Energy and Guard. You can use one item per turn without ending it. Hover anything for details: statuses, enemies, abilities. Spin-tagged abilities matter against some Stands.', 'sword');
  }

  return { run };
})();
