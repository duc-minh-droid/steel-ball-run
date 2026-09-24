/* UI: screens, modals, dialogue, HUD */
'use strict';
SBR.ui = (() => {
  const { el, html, sleep, fmtMoney } = SBR.util;
  const art = SBR.art;
  const $screen = () => document.getElementById('screen');
  const $overlay = () => document.getElementById('overlay');

  /* ---------- generic helpers ---------- */
  function btn(label, onClick, cls = '', attrs = {}) {
    const b = el('button', Object.assign({ class: 'btn ' + cls }, attrs), label);
    b.addEventListener('click', e => { SBR.audio.play('click'); onClick && onClick(e); });
    b.addEventListener('mouseenter', () => SBR.audio.play('hover'));
    return b;
  }
  function artFor(a) {
    if (!a) return art.portrait('bandit');
    if (a.kind === 'creature') return art.creature(a.type, a.color, a.bg);
    return art.portrait(a.key);
  }
  const portraitOf = key => SBR.CHARS[key] ? art.portrait(SBR.CHARS[key].portrait) : art.portrait(key);

  /** Manga-panel wipe transition, then render */
  async function transition(render, style = 'slash') {
    const fx = el('div', { class: 'wipe ' + style });
    document.getElementById('app').appendChild(fx);
    if (!SBR.settings.reducedMotion) { await sleep(360); }
    SBR.tip.hide();
    $screen().innerHTML = '';
    render($screen());
    fx.classList.add('out');
    setTimeout(() => fx.remove(), 600);
  }

  function modal(content, opts = {}) {
    if (opts.drawer) [...$overlay().querySelectorAll('.drawer-wrap')].forEach(closeModal);
    const wrap = el('div', { class: 'modal-wrap ' + (opts.drawer ? 'drawer-wrap ' : '') + (opts.cls || '') });
    const box = el('div', { class: 'modal ' + (opts.drawer ? 'drawer ' : '') + (opts.size || '') });
    if (opts.title) box.appendChild(el('div', { class: 'modal-title' }, el('span', {}, opts.title)));
    if (!opts.noClose) {
      const close = el('button', { class: 'modal-x', 'aria-label': 'Close' }, '✕');
      close.onclick = () => { SBR.audio.play('back'); closeModal(wrap); opts.onClose && opts.onClose(); };
      box.appendChild(close);
    }
    box.appendChild(content);
    wrap.appendChild(box);
    if (!opts.noClose) wrap.addEventListener('mousedown', e => { if (e.target === wrap) { closeModal(wrap); opts.onClose && opts.onClose(); } });
    $overlay().appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('show'));
    return wrap;
  }
  function closeModal(wrap) { if (!wrap) return; wrap.classList.remove('show'); setTimeout(() => wrap.remove(), 250); SBR.tip.hide(); }
  function closeAllModals() { [...$overlay().children].forEach(closeModal); }

  function sfxText(text, x, y, cls = '') {
    const s = el('div', { class: 'sfx-text ' + cls, style: { left: x + 'px', top: y + 'px' } }, text);
    document.getElementById('fx-layer').appendChild(s);
    setTimeout(() => s.remove(), 1800);
  }
  function menacing(container, n = 6, glyph = 'ゴ') {
    const m = el('div', { class: 'menacing' });
    for (let i = 0; i < n; i++) {
      const g = el('span', { style: { left: (8 + Math.random() * 84) + '%', top: (10 + Math.random() * 70) + '%', animationDelay: (i * 0.25) + 's', fontSize: (28 + Math.random() * 30) + 'px' } }, glyph);
      m.appendChild(g);
    }
    container.appendChild(m);
    return m;
  }
  function shake(node = document.getElementById('app'), strong = false) {
    if (!SBR.settings.shake || SBR.settings.reducedMotion) return;
    node.classList.remove('shake', 'shake-strong'); void node.offsetWidth;
    node.classList.add(strong ? 'shake-strong' : 'shake');
  }

  /* ---------- tooltips for game objects ---------- */
  function statusTip(id, s) {
    const d = SBR.STATUS[id];
    const n = s ? (d.mode === 'stacks' ? `${s.stacks} stack${s.stacks > 1 ? 's' : ''}` : (s.turns > 900 ? '' : `${s.turns} turn${s.turns > 1 ? 's' : ''}`)) : '';
    return `<span class="tip-st">${SBR.icons.status(id)}</span><b style="color:${d.color}">${d.name}</b> <i>${d.kind}</i>${n ? ` · ${n}` : ''}<br>${d.desc(s ? s.stacks : 1)}`;
  }
  function abilityTip(id, lvl = 1, unit) {
    const a = SBR.ABILITIES[id];
    const dt = SBR.abilityDtype(a);
    const tags = (dt ? `<span class="tag dtag" style="--dc:${SBR.DMG[dt].color}">${SBR.icons.dmg(dt)}${SBR.DMG[dt].name}</span> ` : '') + (a.tags || []).filter(t => t !== 'gun' && t !== 'spin').map(t => `<span class="tag tag-${t}">${t}</span>`).join(' ');
    return `<div class="tip-ab">${SBR.icons.ability(id)}<div><b>${a.name}</b>${lvl > 1 ? ' <span class="lv2">Lv.2</span>' : ''}<br><span class="tip-cost">${'◆'.repeat(a.cost) || 'Free'}</span>${a.cd ? ` · CD ${a.cd}` : ''}${a.pierce ? ' · <b class="pierce">PIERCING</b>' : ''}<br>${a.desc(lvl)}<br>${tags}</div></div>`;
  }
  function relicTip(id) {
    const r = SBR.RELICS[id];
    return `<b style="color:${r.color === '#fff' ? '#f6ecd8' : r.color}">${r.name}</b> <i>${r.rarity}</i><br>${r.desc}`;
  }
  function itemTip(id) { const it = SBR.ITEMS[id]; return `<b>${it.name}</b><br>${it.desc}`; }
  function relicChip(id, extra = '') {
    const r = SBR.RELICS[id];
    const c = el('div', { class: 'icon-chip relic rarity-' + r.rarity + ' ' + extra, html: SBR.icons.relic(id) });
    SBR.tip.bind(c, () => relicTip(id));
    return c;
  }
  function itemChip(id, onClick) {
    const c = el('div', { class: 'icon-chip item', html: SBR.icons.item(id) });
    SBR.tip.bind(c, () => itemTip(id));
    if (onClick) c.addEventListener('click', onClick);
    return c;
  }
  function matChip(id, n, extra = '') {
    const m = SBR.MATERIALS[id];
    const c = el('div', { class: 'icon-chip mat rarity-' + m.rarity + ' ' + extra, html: SBR.matIcon(id) + (n != null ? `<span class="chip-n">${n}</span>` : '') });
    SBR.tip.bind(c, () => `<b>${m.name}</b> <i>${m.rarity === 'remnant' ? 'Stand Remnant' : m.rarity + ' material'}</i><br>${m.desc}`);
    return c;
  }
  function equipTip(id) { const e = SBR.EQUIPMENT[id]; return `<b>${e.name}</b> <i>${e.rarity} ${e.slot}${e.family ? ' · ' + SBR.FAMILY[e.family] : ''}</i><br>${SBR.equipDesc(id)}`; }
  function equipChip(id, extra = '') {
    const e = SBR.EQUIPMENT[id];
    const c = el('div', { class: 'icon-chip equip rarity-' + e.rarity + ' ' + extra, html: SBR.icons.equip(id) });
    SBR.tip.bind(c, () => equipTip(id));
    return c;
  }

  /* ---------- Dialogue ---------- */
  function dialogue(sceneId) {
    const scene = SBR.STORY[sceneId];
    if (!scene || !scene.lines || !scene.lines.length) return Promise.resolve();
    return new Promise(resolve => {
      const wrap = el('div', { class: 'dlg-wrap' });
      const bg = el('div', { class: 'dlg-bg', html: art.scene(scene.bg || 1, { still: true }) });
      const left = el('div', { class: 'dlg-portrait left' });
      const right = el('div', { class: 'dlg-portrait right' });
      const box = el('div', { class: 'dlg-box' });
      const name = el('div', { class: 'dlg-name' });
      const text = el('div', { class: 'dlg-text' });
      const hint = el('div', { class: 'dlg-hint' }, 'Click / Space ▸');
      const skip = btn('Skip ▸▸', () => finish(), 'btn-ghost dlg-skip');
      box.append(name, text, hint);
      wrap.append(bg, left, right, box, skip);
      $overlay().appendChild(wrap);
      requestAnimationFrame(() => wrap.classList.add('show'));
      let i = -1, typing = null, full = '', lastSpeaker = null, side = 'left', menaceEl = null;
      const sides = {};
      function next() {
        if (typing) { clearInterval(typing); typing = null; text.textContent = full; return; }
        i++;
        if (i >= scene.lines.length) return finish();
        const L = scene.lines[i];
        SBR.audio.play('page');
        if (menaceEl) { menaceEl.remove(); menaceEl = null; }
        box.classList.toggle('narr', !L.who);
        box.classList.toggle('shout', L.mood === 'shout');
        wrap.classList.toggle('menace', L.mood === 'menace');
        if (L.mood === 'menace') { menaceEl = menacing(wrap, 7); SBR.audio.play('menace'); }
        if (L.mood === 'shout') { SBR.audio.play('success'); shake(wrap); }
        if (L.who) {
          const ch = SBR.CHARS[L.who];
          const pKey = ch ? ch.portrait : L.who;
          const nm = ch ? ch.name : (SBR.ENEMIES[L.who] && SBR.ENEMIES[L.who].name) || nameOf(L.who);
          if (!sides[L.who]) { side = lastSpeaker && sides[lastSpeaker] === 'left' ? 'right' : 'left'; sides[L.who] = side; }
          const slot = sides[L.who] === 'left' ? left : right;
          const other = sides[L.who] === 'left' ? right : left;
          if (slot.dataset.who !== L.who) { slot.innerHTML = art.portrait(pKey); slot.dataset.who = L.who; slot.classList.remove('enter'); void slot.offsetWidth; slot.classList.add('enter'); }
          slot.classList.add('active'); other.classList.remove('active');
          name.textContent = nm; name.style.display = '';
          name.className = 'dlg-name ' + sides[L.who];
          lastSpeaker = L.who;
        } else {
          name.style.display = 'none';
          left.classList.remove('active'); right.classList.remove('active');
        }
        full = L.who ? L.text : L.narr;
        if (SBR.settings.typewriter && !SBR.settings.reducedMotion) {
          text.textContent = '';
          let k = 0;
          typing = setInterval(() => {
            k += 2; text.textContent = full.slice(0, k);
            if (k >= full.length) { clearInterval(typing); typing = null; }
          }, 18 / SBR.settings.speed);
        } else text.textContent = full;
      }
      function finish() {
        if (typing) clearInterval(typing);
        document.removeEventListener('keydown', onKey, true);
        wrap.classList.remove('show');
        setTimeout(() => { wrap.remove(); resolve(); }, 300);
      }
      function onKey(e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); next(); } if (e.key === 'Escape') { e.stopPropagation(); finish(); } }
      wrap.addEventListener('click', e => { if (e.target.closest('.dlg-skip')) return; next(); });
      document.addEventListener('keydown', onKey, true);
      next();
    });
  }
  const NAMES = { steven: 'Steven Steel', sugar: 'Sugar Mountain', marco: 'Marco', diegodino: 'Diego Brando', diegoworld: 'Diego (Another World)', tattoo: 'Tattoo You!', laboom: 'L.A. Boomboom' };
  function nameOf(k) { return NAMES[k] || k; }

  /* ---------- Dice check ---------- */
  function diceCheck({ stat, dc, who, mod }) {
    return new Promise(resolve => {
      const roll = SBR.util.randInt(1, 20);
      const total = roll + mod;
      const ok = roll === 20 || (roll !== 1 && total >= dc);
      const box = el('div', { class: 'dice-panel' });
      const st = SBR.STATS[stat];
      box.innerHTML = `
        <div class="dice-who">${portraitOf(who.id)}<div><div class="dice-label">${st.name} CHECK</div><div class="dice-sub">${SBR.CHARS[who.id].short} rolls · DC ${dc}</div></div></div>
        <div class="d20"><svg viewBox="0 0 100 100"><polygon points="50,4 93,28 93,72 50,96 7,72 7,28" fill="#f6ecd8" stroke="#1a1020" stroke-width="4"/><polygon points="50,4 76,58 24,58" fill="none" stroke="#1a1020" stroke-width="2"/><path d="M24 58 L7 72 M76 58 L93 72 M24 58 L50 96 L76 58 M50 4 L7 28 M50 4 L93 28" stroke="#1a1020" stroke-width="2" fill="none"/></svg><span class="d20-num">?</span></div>
        <div class="dice-math"><span class="roll">–</span> + <span class="mod">${mod}</span> <small>(${st.short})</small> = <b class="total">–</b></div>
        <div class="dice-stamp"></div>`;
      const w = modal(box, { noClose: true, cls: 'dice-modal' });
      SBR.audio.play('dice');
      const num = box.querySelector('.d20-num');
      const d20 = box.querySelector('.d20');
      d20.classList.add('rolling');
      let t = 0;
      const iv = setInterval(() => { num.textContent = SBR.util.randInt(1, 20); if (++t > 14) done(); }, 60 / SBR.settings.speed);
      function done() {
        clearInterval(iv);
        d20.classList.remove('rolling');
        num.textContent = roll;
        box.querySelector('.roll').textContent = roll;
        box.querySelector('.total').textContent = total;
        const stamp = box.querySelector('.dice-stamp');
        stamp.textContent = roll === 20 ? 'CRITICAL!' : roll === 1 ? 'DISASTER!' : ok ? 'SUCCESS' : 'FAILURE';
        stamp.className = 'dice-stamp show ' + (ok ? 'ok' : 'bad');
        if (roll === 20) SBR.game.achieve('nat20');
        if (roll === 1) SBR.game.achieve('nat1');
        SBR.audio.play(ok ? 'success' : 'fail');
        if (!ok) shake(box);
        setTimeout(() => { closeModal(w); resolve(ok); }, 1400 / SBR.settings.speed);
      }
    });
  }

  /* ---------- Choice / event panel ---------- */
  function eventPanel(ev) {
    return new Promise(resolve => {
      const box = el('div', { class: 'event-panel' });
      const pic = el('div', { class: 'event-art', html: ev.art ? portraitOf(ev.art) : `<div class="event-icon">${art.icon(ev.icon || 'question', 96)}</div>` });
      const body = el('div', { class: 'event-body' });
      body.append(el('h2', {}, ev.title), el('p', { class: 'event-text' }, ev.text || ''));
      const list = el('div', { class: 'choices' });
      (ev.choices || []).forEach((ch, i) => {
        const g = SBR.game;
        const cost = ch.cost && ch.cost.money ? Math.round(ch.cost.money) : 0;
        const afford = !cost || SBR.run.money >= cost;
        const reqOk = !ch.req || ch.req(g.G);
        const b = el('button', { class: 'choice' + (!afford || !reqOk ? ' disabled' : '') });
        b.append(el('span', { class: 'choice-n' }, String(i + 1)), el('span', { class: 'choice-label' }, ch.label));
        if (ch.check) {
          const best = g.bestFor(ch.check.stat);
          const mod = g.checkMod(best, ch.check.stat);
          const pct = Math.round(Math.max(0.05, Math.min(0.95, (21 - (ch.check.dc - mod)) / 20)) * 100);
          b.append(el('span', { class: 'choice-check', style: { '--c': SBR.STATS[ch.check.stat].color } }, `${SBR.STATS[ch.check.stat].short} DC${ch.check.dc} · ${pct}%`));
        }
        if (cost) b.append(el('span', { class: 'choice-cost' + (afford ? '' : ' bad') }, fmtMoney(cost)));
        if (!reqOk && ch.reqText) b.append(el('span', { class: 'choice-cost bad' }, ch.reqText));
        if (afford && reqOk) b.addEventListener('click', () => { document.removeEventListener('keydown', onKey); SBR.audio.play('select'); closeModal(w); resolve(ch); });
        b.addEventListener('mouseenter', () => SBR.audio.play('hover'));
        list.appendChild(b);
      });
      body.appendChild(list);
      box.append(pic, body);
      const w = modal(box, { noClose: true, size: 'wide', cls: 'event-modal' });
      function onKey(e) {
        if (document.querySelector('.dice-modal')) return;
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= (ev.choices || []).length) { const b = list.children[n - 1]; if (!b.classList.contains('disabled')) b.click(); }
      }
      document.addEventListener('keydown', onKey);
    });
  }
  function resultPanel(title, text, icon = 'star') {
    return new Promise(resolve => {
      if (!text) return resolve();
      const box = el('div', { class: 'result-panel' }, el('div', { class: 'result-icon', html: art.icon(icon, 56) }), el('h3', {}, title), el('p', {}, text));
      const w = modal(box, { noClose: true, size: 'small' });
      box.appendChild(btn('Continue', () => { closeModal(w); resolve(); }, 'btn-primary'));
    });
  }

  /* ---------- HUD ---------- */
  function hud() {
    const r = SBR.run;
    const act = SBR.ACTS[r.act];
    const bar = el('div', { class: 'hud' });
    const left = el('div', { class: 'hud-left' },
      el('div', { class: 'hud-act' }, el('span', { class: 'hud-actnum' }, act.name), el('span', { class: 'hud-acttitle' }, act.title)),
      stageTrack());
    const pace = el('div', { class: 'hud-pace' });
    pace.innerHTML = `<div class="pace-label">PACE</div><div class="pace-bar"><div class="pace-fill" style="width:${r.pace}%"></div><div class="pace-horse">${art.icon('horseshoe', 18)}</div></div><div class="pace-val">${Math.round(r.pace)}</div>`;
    pace.querySelector('.pace-horse').style.left = r.pace + '%';
    SBR.tip.bind(pace, '<b>Pace</b><br>Your head start for this act\'s stage sprint. Resting, scavenging and long detours cost pace; riding hard, shortcuts and good horses gain it.');
    const rank = SBR.game.playerRank();
    const right = el('div', { class: 'hud-right' },
      el('div', { class: 'hud-stat money', html: `${art.icon('coin', 22)}<span>${fmtMoney(r.money)}</span>` }),
      el('div', { class: 'hud-stat rank', html: `${art.icon('trophy', 22)}<span>${SBR.util.ordinal(rank)}</span>` }),
      iconBtn('gear', 'Settings (Esc)', () => settingsScreen(true)));
    SBR.tip.bind(right.children[1], '<b>Overall standing</b><br>Based on points from stage sprints.');
    if (r.sugar) right.prepend(el('div', { class: 'hud-stat sugar', html: `${art.icon('hourglass', 20)}<span>Sunset: ${r.sugar.left} stage${r.sugar.left !== 1 ? 's' : ''}</span>` }));
    bar.append(left, pace, right);
    return bar;
  }
  function sideRail() {
    const rail = el('nav', { class: 'side-rail', 'aria-label': 'Saddlebags' });
    [['party', 'Party', 'P', () => partyScreen()], ['bag', 'Bag', 'B', () => bagScreen()], ['anvil', 'Craft', 'C', () => craftScreen()], ['map', 'Map', 'M', () => mapScreen()]].forEach(([ico, label, key, fn]) => {
      const b = el('button', { class: 'rail-tab', html: `${art.icon(ico, 26)}<span>${label}</span><kbd>${key}</kbd>` });
      b.onclick = () => { SBR.audio.play('click'); fn(); };
      rail.appendChild(b);
    });
    return rail;
  }
  function iconBtn(ico, label, fn) {
    const b = el('button', { class: 'icon-btn', 'aria-label': label, html: art.icon(ico, 24) });
    SBR.tip.bind(b, label);
    b.onclick = () => { SBR.audio.play('click'); fn(); };
    return b;
  }
  function stageTrack() {
    const r = SBR.run, act = SBR.ACTS[r.act];
    const t = el('div', { class: 'stage-track' });
    for (let i = 1; i <= act.stages; i++) {
      const cls = i < r.stage ? 'done' : i === r.stage ? 'current' : '';
      const isBoss = i === act.stages, isStory = act.story[i];
      const d = el('div', { class: `st-dot ${cls} ${isBoss ? 'boss' : ''} ${isStory ? 'story' : ''}` }, isBoss ? el('span', { html: art.icon('crown', 14) }) : '');
      SBR.tip.bind(d, `Stage ${i}${isBoss ? ' — BOSS: ' + act.boss.name : isStory ? ' — Story' : ''}`);
      t.appendChild(d);
    }
    return t;
  }
  function partyStrip() {
    const s = el('div', { class: 'party-strip' });
    SBR.run.party.forEach(m => {
      const c = SBR.CHARS[m.id];
      const pct = Math.max(0, m.hp / m.maxHp * 100);
      const card = el('div', { class: 'ps-card' + (m.hp <= 0 ? ' down' : '') + (m.points ? ' has-points' : '') });
      card.innerHTML = `<div class="ps-port">${art.portrait(c.portrait)}</div><div class="ps-info"><div class="ps-name">${c.short} <small>Lv${m.level}</small></div><div class="hpbar"><div class="hpfill" style="width:${pct}%"></div><span>${Math.max(0, m.hp)}/${m.maxHp}</span></div>${m.exhaustion ? `<div class="ps-exh">Exhaustion ×${m.exhaustion}</div>` : ''}</div>${m.points ? '<div class="ps-pts">+' + m.points + '</div>' : ''}`;
      card.onclick = () => partyScreen(m.id);
      SBR.tip.bind(card, `<b>${c.name}</b> — ${c.stand}<br>${m.points ? `<b style="color:#f2c14e">${m.points} stat points to spend!</b><br>` : ''}Click to open character sheet.`);
      s.appendChild(card);
    });
    return s;
  }

  /* ---------- Stage screen ---------- */
  function stageScreen(cards, rawHandlers) {
    // one choice per stage: ignore double clicks and clicks during the transition out
    let locked = false;
    const guard = fn => (...a) => { if (locked) return; locked = true; document.querySelectorAll('.enc-card, .btn-side').forEach(n => n.style.pointerEvents = 'none'); fn(...a); };
    const handlers = { pick: guard(rawHandlers.pick), scavenge: guard(rawHandlers.scavenge), rest: guard(rawHandlers.rest) };
    transition(root => {
      const r = SBR.run;
      const act = SBR.ACTS[r.act];
      const h = SBR.HORSES[r.horse];
      root.className = 'screen-stage';
      const sc = el('div', { class: 'stage-scene', html: art.scene(act.scene) });
      const rider = el('div', { class: 'stage-horse', html: art.horse({ coat: h.coat, mane: h.mane, wrap: h.wrap, spots: h.spots, rider: { cape: '#5b3a8c', body: '#3b5bb5', hat: '#5b3a8c' } }) });
      sc.appendChild(rider);
      if (r.party.some(m => m.id === 'gyro')) sc.appendChild(el('div', { class: 'stage-horse second', html: art.horse({ coat: '#5a3a2a', mane: '#1a1020', wrap: '#f2c14e', rider: { cape: '#3a8c4a', body: '#4f8a3a', hat: '#3a8c4a', skin: '#f0c8a0' } }) }));
      root.appendChild(sc);
      root.appendChild(hud());
      const title = el('div', { class: 'stage-title' },
        el('div', { class: 'stage-kicker' }, `STAGE ${r.stage} / ${act.stages}`),
        el('h1', {}, r.stage === act.stages ? act.boss.name : act.story[r.stage] ? 'A Fateful Encounter' : SBR.art.SCENES[act.scene].name),
        el('div', { class: 'stage-sub' }, act.sub.split('—')[0].trim() + ' · ' + (act.sub.split('—')[1] || '').trim()));
      root.appendChild(title);
      const deck = el('div', { class: 'card-deck' });
      cards.forEach((card, i) => deck.appendChild(encounterCard(card, i, () => handlers.pick(card))));
      root.appendChild(deck);
      const side = el('div', { class: 'stage-actions' });
      if (!cards[0] || !cards[0].forced) {
        const sc2 = btn(el('span', { html: `${art.icon('search', 20)} Scavenge <small>−8 pace</small>` }), handlers.scavenge, 'btn-side');
        SBR.tip.bind(sc2, '<b>Scavenge</b><br>Search the area for money, items or relics. You might find trouble instead. Costs pace.');
        const rs = btn(el('span', { html: `${art.icon('fire', 20)} Short Rest <small>−12 pace</small>` }), handlers.rest, 'btn-side');
        SBR.tip.bind(rs, `<b>Short Rest</b><br>Heal 35% HP${SBR.bonus().restHeal ? ' (+' + Math.round(SBR.bonus().restHeal * 100) + '%)' : ''} and remove 1 Exhaustion from everyone. Costs pace.`);
        side.append(sc2, rs);
      } else {
        const rs = btn(el('span', { html: `${art.icon('fire', 20)} Short Rest first <small>−12 pace</small>` }), handlers.rest, 'btn-side');
        side.append(rs);
      }
      root.appendChild(side);
      root.appendChild(partyStrip());
      root.appendChild(sideRail());
      encounterIntro(root, deck, cards);
    });
  }
  /** Dramatic entrance: slash banner, then cards fly in and slam down one by one */
  async function encounterIntro(root, deck, cards) {
    const kind = cards[0] && cards[0].type === 'boss' ? 'boss' : cards[0] && cards[0].story ? 'story' : 'normal';
    const label = { boss: 'BOSS AHEAD!!', story: 'FATEFUL ENCOUNTER', normal: 'ENCOUNTER!' }[kind];
    const kana = { boss: 'ゴゴゴゴ', story: 'ドドドド', normal: 'ドン！' }[kind];
    root.classList.add('intro-running');
    const band = el('div', { class: 'enc-intro ' + kind, html: `<div class="ei-band"><div class="ei-lines"></div><div class="ei-text">${label}</div><div class="ei-kana">${kana}</div></div>` });
    root.appendChild(band);
    if (kind === 'boss') { menacing(band, 10); SBR.audio.play('menace'); } else SBR.audio.play('whistle');
    shake(undefined, kind === 'boss');
    await sleep(kind === 'normal' ? 750 : 1100);
    band.classList.add('out');
    setTimeout(() => band.remove(), 400);
    root.classList.remove('intro-running');
    const els = [...deck.querySelectorAll('.enc-card')];
    for (let i = 0; i < els.length; i++) {
      const c = els[i];
      c.classList.add(kind === 'boss' ? 'from-top' : (i % 2 ? 'from-right' : 'from-left'));
      void c.offsetWidth;
      c.classList.add('flying');
      await sleep(kind === 'boss' ? 420 : 300);
      c.classList.add('dealt', 'landed');
      SBR.audio.play(kind === 'boss' ? 'boom' : 'block');
      const r = c.getBoundingClientRect();
      if (SBR.fx) { SBR.fx.dust({ x: r.left + r.width / 2, y: r.bottom - 6 }, kind === 'boss' ? 30 : 14); SBR.fx.ring(r.left + r.width / 2, r.top + r.height / 2, kind === 'boss' ? '#c8323c' : '#fff3c0', r.width * 0.9, 6, 0.45, r.width * 0.4); }
      if (kind === 'boss') { shake(undefined, true); SBR.fx && SBR.fx.flash('#c8323c', 200); } else shake();
      await sleep(90);
    }
    // 3D tilt following the mouse
    els.forEach(c => {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
        c.style.setProperty('--rx', (-dy * 14).toFixed(1) + 'deg'); c.style.setProperty('--ry', (dx * 16).toFixed(1) + 'deg');
        c.style.setProperty('--gx', ((dx + 0.5) * 100).toFixed(0) + '%'); c.style.setProperty('--gy', ((dy + 0.5) * 100).toFixed(0) + '%');
      });
      c.addEventListener('mouseleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
  }
  function encounterCard(card, i, onPick) {
    const typeLabel = { fight: 'Battle', elite: 'Elite', shop: 'Shop', event: 'Event', rest: 'Rest', trainer: 'Trainer', recruit: 'Ally', story: 'Story', boss: 'Boss' }[card.type] || 'Event';
    const c = el('div', { class: `enc-card type-${card.type}`, tabindex: 0, role: 'button' });
    const artHtml = card.art ? portraitOf(card.art) : `<div class="enc-icon">${art.icon(card.icon || 'question', 72)}</div>`;
    c.innerHTML = `
      <div class="enc-type">${typeLabel}</div>
      <div class="enc-art">${artHtml}</div>
      <div class="enc-title">${card.title}</div>
      <div class="enc-blurb">${card.blurb}</div>
      <div class="enc-foot">${card.pace ? `<span class="enc-pace ${card.pace > 0 ? 'up' : 'down'}">${card.pace > 0 ? '+' : ''}${card.pace} pace</span>` : '<span></span>'}<span class="enc-key">${i + 1}</span></div><div class="enc-gloss"></div>`;
    c.addEventListener('click', () => {
      if (c.parentNode && c.parentNode.dataset.picked) return;
      if (c.parentNode) c.parentNode.dataset.picked = '1';
      SBR.audio.play('select'); c.classList.add('picked'); setTimeout(onPick, 260);
    });
    c.addEventListener('keydown', e => { if (e.key === 'Enter') c.click(); });
    c.addEventListener('mouseenter', () => SBR.audio.play('hover'));
    return c;
  }

  /* ---------- Party screen ---------- */
  function partyScreen(focusId) {
    const r = SBR.run;
    const box = el('div', { class: 'party-screen' });
    const tabs = el('div', { class: 'party-tabs' });
    const sheet = el('div', { class: 'char-sheet' });
    let current = focusId || r.party[0].id;
    const all = () => r.party.concat(r.reserve);
    function renderTabs() {
      tabs.innerHTML = '';
      r.party.forEach(m => tabs.appendChild(tab(m, false)));
      if (r.reserve.length) { tabs.appendChild(el('div', { class: 'tab-sep' }, 'RESERVE')); r.reserve.forEach(m => tabs.appendChild(tab(m, true))); }
    }
    function tab(m, reserve) {
      const c = SBR.CHARS[m.id];
      const t = el('button', { class: 'party-tab' + (m.id === current ? ' active' : '') + (reserve ? ' reserve' : '') + (m.points ? ' pts' : ''), html: `<div class="pt-port">${art.portrait(c.portrait)}</div><span>${c.short}</span>` });
      t.onclick = () => { current = m.id; renderTabs(); renderSheet(); SBR.audio.play('click'); };
      return t;
    }
    function renderSheet() {
      const m = all().find(x => x.id === current);
      const c = SBR.CHARS[m.id];
      const inParty = r.party.includes(m);
      sheet.innerHTML = '';
      const head = el('div', { class: 'cs-head' });
      head.innerHTML = `<div class="cs-port">${art.portrait(c.portrait)}</div>
        <div class="cs-id"><div class="cs-title">${c.title}</div><h2>${c.name}</h2><div class="cs-stand">「${c.stand}」</div>
        <div class="cs-lv">Level ${m.level} <div class="xpbar"><div style="width:${Math.min(100, m.xp / SBR.game.xpToNext(m.level) * 100)}%"></div></div><small>${m.xp}/${SBR.game.xpToNext(m.level)} XP</small></div>
        <div class="hpbar big"><div class="hpfill" style="width:${Math.max(0, m.hp / m.maxHp * 100)}%"></div><span>${m.hp}/${m.maxHp} HP</span></div>
        ${m.exhaustion ? `<div class="cs-exh">Exhaustion ×${m.exhaustion}: −${15 * m.exhaustion}% max HP, damage and healing</div>` : ''}</div>`;
      sheet.appendChild(head);
      const statsBox = el('div', { class: 'cs-stats' });
      statsBox.appendChild(el('div', { class: 'cs-sub' }, m.points ? `STATS — ${m.points} point${m.points > 1 ? 's' : ''} to spend` : 'STATS'));
      for (const [k, s] of Object.entries(SBR.STATS)) {
        const row = el('div', { class: 'stat-row' });
        const v = m.stats[k];
        row.innerHTML = `<span class="stat-name" style="color:${s.color}">${s.name}</span><div class="stat-bar"><div style="width:${Math.min(100, v * 3.3)}%;background:${s.color}"></div></div><span class="stat-val">${v}</span>`;
        if (m.points) { const plus = btn('+', () => { m.stats[k]++; m.points--; if (k === 'grit') { m.maxHp += 2; m.hp += 2; } SBR.audio.play('buff'); SBR.saveRun(); renderTabs(); renderSheet(); }, 'btn-plus'); row.appendChild(plus); }
        SBR.tip.bind(row, `<b>${s.name}</b><br>${s.desc}`);
        statsBox.appendChild(row);
      }
      if (m.points) statsBox.appendChild(btn('Auto-assign', () => { SBR.game.autoAssign(m); SBR.saveRun(); renderTabs(); renderSheet(); }, 'btn-small'));
      const abil = el('div', { class: 'cs-abilities' }, el('div', { class: 'cs-sub' }, 'ABILITIES'));
      SBR.game.memberAbilities(m).forEach(id => {
        const a = SBR.ABILITIES[id];
        const lvl = (m.upgrades || {})[id] || 1;
        const row = el('div', { class: 'ab-row', html: `<span class="ab-ico">${SBR.icons.ability(id)}</span><span class="ab-cost">${a.cost}</span><b>${a.name}</b>${lvl > 1 ? '<span class="lv2">Lv.2</span>' : ''}<p>${a.desc(lvl)}</p>` });
        abil.appendChild(row);
      });
      const locked = c.abilities.filter(e => !SBR.game.memberAbilities(m).includes(e.id) && !e.notFlag);
      locked.forEach(e => abil.appendChild(el('div', { class: 'ab-row locked', html: `<span class="ab-ico">${SBR.icons.ability(e.id)}</span><span class="ab-cost">?</span><b>${SBR.ABILITIES[e.id].name}</b><p>${e.level ? 'Unlocks at level ' + e.level : 'Unlocked through the story.'}</p>` })));
      const passive = el('div', { class: 'cs-passive', html: `<div class="cs-sub">PASSIVE</div><b>${c.passive.name}</b><p>${c.passive.desc}</p><p class="cs-bio">${c.bio}</p>` });
      const eqBox = el('div', { class: 'cs-equip' }, el('div', { class: 'cs-sub' }, 'EQUIPMENT' + (SBR.inBattle ? '' : ' — click a slot to change')));
      const slots = el('div', { class: 'eq-slots' });
      SBR.migrateEquip(m);
      const off = SBR.suppressedCharms(m);
      SBR.SLOTS.forEach(({ key: slot, type, label }) => {
        const id = m.equip[slot];
        const sl = el('button', { class: 'eq-slot' + (id ? ' filled rarity-' + SBR.EQUIPMENT[id].rarity : '') + (off.includes(slot) ? ' suppressed' : ''), html: `<span class="eq-label">${label}</span>${id ? SBR.icons.equip(id) : `<span class="eq-empty">${SBR.icons.slot(type)}</span>`}<span class="eq-name">${id ? SBR.EQUIPMENT[id].name : 'Empty'}</span>${off.includes(slot) ? '<span class="eq-off">NO STACK</span>' : ''}` });
        if (id) SBR.tip.bind(sl, () => equipTip(id));
        if (!SBR.inBattle) sl.onclick = async () => { SBR.tip.hide(); await equipPicker(m, slot); renderTabs(); renderSheet(); };
        slots.appendChild(sl);
      });
      eqBox.appendChild(slots);
      const cols = el('div', { class: 'cs-cols' }, el('div', {}, eqBox, statsBox, passive), abil);
      sheet.appendChild(cols);
      // swapping
      const locked2 = ['johnny', 'gyro'].includes(m.id);
      if (!SBR.inBattle) {
        const actions = el('div', { class: 'cs-actions' });
        if (inParty && !locked2) actions.appendChild(btn('Move to reserve', () => { r.party.splice(r.party.indexOf(m), 1); r.reserve.push(m); SBR.saveRun(); renderTabs(); renderSheet(); refreshStage(); }, 'btn-small'));
        if (!inParty) {
          const full = r.party.length >= 4;
          actions.appendChild(btn(full ? 'Party full (max 4)' : 'Add to party', () => { if (full) return; r.reserve.splice(r.reserve.indexOf(m), 1); r.party.push(m); SBR.saveRun(); renderTabs(); renderSheet(); refreshStage(); }, 'btn-small' + (full ? ' disabled' : '')));
        }
        if (locked2) actions.appendChild(el('span', { class: 'cs-note' }, 'Story character — always rides with you.'));
        sheet.appendChild(actions);
      }
    }
    renderTabs(); renderSheet();
    box.append(tabs, sheet);
    modal(box, { title: 'Party', drawer: true, onClose: refreshStage });
  }
  function refreshStage() {
    const strip = document.querySelector('.party-strip');
    if (strip) strip.replaceWith(partyStrip());
    const h = document.querySelector('.hud');
    if (h) h.replaceWith(hud());
  }

  /* ---------- Bag ---------- */
  function bagScreen() {
    const r = SBR.run;
    const box = el('div', { class: 'bag-screen' });
    const render = () => {
      box.innerHTML = '';
      const belt = SBR.game.beltSize();
      box.appendChild(el('div', { class: 'cs-sub' }, `ITEMS — ${r.items.length}/${belt} belt slots`));
      const items = el('div', { class: 'bag-items' });
      r.items.forEach((id, idx) => {
        const it = SBR.ITEMS[id];
        const row = el('div', { class: 'bag-row' }, itemChip(id), el('div', { class: 'bag-info', html: `<b>${it.name}</b><p>${it.desc}</p>` }));
        if (it.field) row.appendChild(btn('Use', async () => { await SBR.game.fieldUseItem(idx); render(); refreshStage(); }, 'btn-small'));
        row.appendChild(btn('Drop', () => { r.items.splice(idx, 1); SBR.saveRun(); render(); }, 'btn-small btn-ghost'));
        items.appendChild(row);
      });
      if (!r.items.length) items.appendChild(el('p', { class: 'muted' }, 'Your saddlebags are empty.'));
      box.appendChild(items);
      box.appendChild(el('div', { class: 'cs-sub' }, `UNEQUIPPED GEAR — ${r.gear.length}`));
      const gl = el('div', { class: 'bag-grid' });
      r.gear.forEach(id => gl.appendChild(equipChip(id)));
      if (!r.gear.length) gl.appendChild(el('p', { class: 'muted' }, 'Craft gear at the bench (C), then equip it from the Party screen (P).'));
      box.appendChild(gl);
      box.appendChild(el('div', { class: 'cs-sub' }, 'MATERIALS'));
      const ml = el('div', { class: 'bag-grid' });
      Object.keys(r.mats).filter(k => r.mats[k] > 0).forEach(k => ml.appendChild(matChip(k, r.mats[k])));
      box.appendChild(ml);

      if (r.tech && r.tech.length) {
        box.appendChild(el('div', { class: 'cs-sub' }, 'TECHNIQUES'));
        const tl = el('div', { class: 'bag-relics' });
        r.tech.forEach(id => { const T = SBR.TECHNIQUES[id]; tl.appendChild(el('div', { class: 'relic-row' }, el('div', { class: 'tech-chip' }, T.slots), el('div', { class: 'bag-info', html: `<b>${T.name}</b><p>${T.desc}</p>` }))); });
        box.appendChild(tl);
      }
      const h = SBR.HORSES[r.horse];
      box.appendChild(el('div', { class: 'cs-sub' }, 'HORSE'));
      box.appendChild(el('div', { class: 'bag-horse', html: `<div class="bh-art">${art.horse({ coat: h.coat, mane: h.mane, wrap: h.wrap, spots: h.spots })}</div><div><b>${h.name}</b> <i>${h.breed}</i><p>${h.perk}</p></div>` }));
    };
    render();
    modal(box, { title: 'Saddlebags', drawer: true });
  }

  /* ---------- Map & standings ---------- */
  function mapScreen() {
    const r = SBR.run;
    const box = el('div', { class: 'map-screen' });
    box.appendChild(el('div', { class: 'map-wrap', html: art.usMap(SBR.ACTS[r.act].route) }));
    box.appendChild(standingsTable());
    modal(box, { title: 'The Route — 6,000 km', drawer: true });
  }
  function standingsTable(highlight) {
    const t = el('div', { class: 'standings' }, el('div', { class: 'cs-sub' }, 'OVERALL STANDINGS'));
    SBR.game.standings().slice(0, 8).forEach((s, i) => {
      t.appendChild(el('div', { class: 'stand-row' + (s.player ? ' me' : '') + (highlight === s.key ? ' hl' : ''), html: `<span class="sr-pos">${i + 1}</span><span class="sr-port">${art.portrait(s.portrait)}</span><span class="sr-name">${s.name}</span><span class="sr-pts">${s.points} pts</span>` }));
    });
    return t;
  }

  /* ---------- Shop ---------- */
  function shopScreen(stock, name, keeper) {
    return new Promise(resolve => {
      const r = SBR.run;
      const box = el('div', { class: 'shop-screen' });
      const disc = 1 - (SBR.bonus().discount || 0);
      const render = () => {
        box.innerHTML = '';
        box.appendChild(el('div', { class: 'shop-head', html: `<div class="shop-keeper">${keeper ? portraitOf(keeper) : art.icon('tent', 80)}</div><div><h2>${name}</h2><p class="muted">"Take a look. Everything's got a price out here."</p><div class="hud-stat money big">${art.icon('coin', 24)}<span>${fmtMoney(r.money)}</span></div></div>` }));
        const grid = el('div', { class: 'shop-grid' });
        stock.forEach(s => {
          const price = Math.round(s.price * disc);
          const def = s.kind === 'relic' ? SBR.RELICS[s.id] : s.kind === 'item' ? SBR.ITEMS[s.id] : s.kind === 'equip' ? { name: SBR.EQUIPMENT[s.id].name, desc: SBR.equipDesc(s.id) } : s.kind === 'mat' ? { name: SBR.MATERIALS[s.id].name + ' ×' + s.n, desc: SBR.MATERIALS[s.id].desc } : s;
          const card = el('div', { class: 'shop-card ' + (s.sold ? 'sold' : '') + ' kind-' + s.kind });
          const chip = s.kind === 'relic' ? relicChip(s.id) : s.kind === 'item' ? itemChip(s.id) : s.kind === 'equip' ? equipChip(s.id) : s.kind === 'mat' ? matChip(s.id, s.n) : el('div', { class: 'item-chip service', html: art.icon(s.icon || 'heart', 28) });
          card.append(chip, el('div', { class: 'shop-name' }, def.name), el('div', { class: 'shop-desc' }, def.desc));
          const canBuy = !s.sold && r.money >= price && (s.kind !== 'item' || r.items.length < SBR.game.beltSize());
          const b = btn(s.sold ? 'SOLD' : fmtMoney(price), () => {
            if (!canBuy) return;
            r.money -= price;
            if (s.kind === 'relic') SBR.game.G.relic(s.id);
            else if (s.kind === 'item') r.items.push(s.id);
            else if (s.kind === 'equip') r.gear.push(s.id);
            else if (s.kind === 'mat') r.mats[s.id] = (r.mats[s.id] || 0) + s.n;
            else s.run();
            if (!s.repeat) s.sold = true;
            SBR.audio.play('coin');
            SBR.saveRun(); render();
          }, 'btn-buy' + (canBuy ? '' : ' disabled'));
          card.appendChild(b);
          grid.appendChild(card);
        });
        box.appendChild(grid);
        box.appendChild(btn('Leave shop ▸', () => { closeModal(w); refreshStage(); resolve(); }, 'btn-primary'));
      };
      render();
      const w = modal(box, { title: 'Shop', size: 'wide', noClose: true });
    });
  }

  /* ---------- chooser (member / ability) ---------- */
  function chooseMember(title, filter = () => true) {
    return new Promise(resolve => {
      const box = el('div', { class: 'chooser' });
      box.appendChild(el('p', {}, title));
      const row = el('div', { class: 'chooser-row' });
      SBR.run.party.filter(filter).forEach(m => {
        const c = SBR.CHARS[m.id];
        const b = el('button', { class: 'chooser-card', html: `${art.portrait(c.portrait)}<span>${c.short}</span>` });
        b.onclick = () => { SBR.audio.play('select'); closeModal(w); resolve(m); };
        row.appendChild(b);
      });
      box.appendChild(row);
      const w = modal(box, { title: 'Choose', noClose: true });
    });
  }
  function chooseAbility() {
    return new Promise(resolve => {
      const box = el('div', { class: 'chooser' });
      box.appendChild(el('p', {}, 'Choose an ability to upgrade to Lv.2:'));
      const list = el('div', { class: 'chooser-list' });
      let any = false;
      SBR.run.party.forEach(m => {
        SBR.game.memberAbilities(m).forEach(id => {
          if ((m.upgrades || {})[id] > 1 || id === 'ball_breaker' || id === 'infinite_rotation' || id === 'golden_spin') return;
          any = true;
          const a = SBR.ABILITIES[id];
          const b = el('button', { class: 'chooser-ab', html: `<span class="pt-port">${art.portrait(SBR.CHARS[m.id].portrait)}</span><div><b>${a.name}</b><p><s>${a.desc(1)}</s></p><p class="up">▲ ${a.desc(2)}</p></div>` });
          b.onclick = () => { m.upgrades = m.upgrades || {}; m.upgrades[id] = 2; SBR.audio.play('level'); closeModal(w); resolve(true); };
          list.appendChild(b);
        });
      });
      if (!any) list.appendChild(el('p', {}, 'Everything is already mastered!'));
      box.appendChild(list);
      box.appendChild(btn('Skip', () => { closeModal(w); resolve(false); }, 'btn-ghost'));
      const w = modal(box, { title: 'Training', size: 'wide', noClose: true });
    });
  }

  /* ---------- Rewards ---------- */
  function rewardsScreen(res) {
    return new Promise(resolve => {
      const box = el('div', { class: 'rewards' });
      box.appendChild(el('div', { class: 'victory-banner' }, res.boss ? 'BOSS DEFEATED' : 'VICTORY'));
      const row = el('div', { class: 'reward-row' });
      row.appendChild(el('div', { class: 'reward', html: `${art.icon('coin', 36)}<b>+${fmtMoney(res.money)}</b>` }));
      row.appendChild(el('div', { class: 'reward', html: `${art.icon('star', 36)}<b>+${res.xp} XP</b>` }));
      if (res.rp) row.appendChild(el('div', { class: 'reward', html: `${art.icon('trophy', 36)}<b>+${res.rp} RP</b>` }));
      box.appendChild(row);
      if (res.loot && res.loot.length) {
        const lr = el('div', { class: 'loot-row' }, el('span', {}, 'Loot: '));
        res.loot.forEach(l => lr.appendChild(l.kind === 'relic' ? relicChip(l.id, 'pop') : l.kind === 'equip' ? equipChip(l.id, 'pop') : itemChip(l.id)));
        box.appendChild(lr);
      }
      if (res.mats && Object.keys(res.mats).length) {
        const mr = el('div', { class: 'loot-row mats' }, el('span', {}, 'Drops: '));
        Object.entries(res.mats).forEach(([k, n], i) => { const ch = matChip(k, n, 'drop-in'); ch.style.animationDelay = (0.25 + i * 0.12) + 's'; mr.appendChild(ch); });
        box.appendChild(mr);
      }
      const members = el('div', { class: 'reward-members' });
      res.members.forEach(m => {
        const c = SBR.CHARS[m.id];
        members.appendChild(el('div', { class: 'rm' + (m.leveled ? ' leveled' : '') + (m.fell ? ' fell' : ''), html: `${art.portrait(c.portrait)}<span>${c.short}</span>${m.leveled ? '<b class="lvup">LEVEL UP!</b>' : ''}${m.fell ? '<b class="exh">+1 Exhaustion</b>' : ''}` }));
      });
      box.appendChild(members);
      if (res.members.some(m => m.leveled)) SBR.audio.play('level'); else SBR.audio.play('coin');
      const w = modal(box, { noClose: true, size: 'wide', cls: 'rewards-modal' });
      box.appendChild(btn('Continue ▸', () => { closeModal(w); resolve(); }, 'btn-primary'));
    });
  }

  /* ---------- Equipment picker ---------- */
  function equipPicker(m, slot) {
    return new Promise(resolve => {
      const r = SBR.run;
      const box = el('div', { class: 'chooser' });
      const type = SBR.slotType(slot);
      box.appendChild(el('p', {}, `Equip ${type} for ${SBR.CHARS[m.id].short}:`));
      const list = el('div', { class: 'chooser-list' });
      const owned = r.gear.map((id, i) => ({ id, i })).filter(x => SBR.EQUIPMENT[x.id].slot === type);
      if (!owned.length) list.appendChild(el('p', { class: 'muted' }, 'No unequipped ' + type + ' in your saddlebags. Craft or buy some!'));
      owned.forEach(({ id, i }) => {
        const b = el('button', { class: 'chooser-ab eq-choice rarity-' + SBR.EQUIPMENT[id].rarity, html: `<span class="pt-port">${SBR.icons.equip(id)}</span><div><b>${SBR.EQUIPMENT[id].name}</b><p>${SBR.equipDesc(id)}</p></div>` });
        b.onclick = () => { SBR.game.equip(m, slot, i); SBR.audio.play('select'); closeModal(w); resolve(); };
        list.appendChild(b);
      });
      box.appendChild(list);
      if (m.equip[slot]) box.appendChild(btn('Unequip', () => { SBR.game.unequip(m, slot); closeModal(w); resolve(); }, 'btn-small'));
      box.appendChild(btn('Cancel', () => { closeModal(w); resolve(); }, 'btn-ghost btn-small'));
      const w = modal(box, { title: 'Equip', size: 'wide', noClose: true });
    });
  }

  /* ---------- Crafting ---------- */
  function craftScreen() {
    const r = SBR.run;
    const box = el('div', { class: 'craft-screen' });
    let tab = 'weapon';
    const render = () => {
      box.innerHTML = '';
      const inv = el('div', { class: 'craft-inv' }, el('div', { class: 'cs-sub' }, 'MATERIALS & REMNANTS'));
      const grid = el('div', { class: 'mat-grid' });
      const keys = Object.keys(r.mats).filter(k => r.mats[k] > 0);
      if (!keys.length) grid.appendChild(el('p', { class: 'muted' }, 'Defeat enemies and scavenge to collect materials.'));
      keys.sort((a, b) => (SBR.MATERIALS[a].remnant ? 1 : 0) - (SBR.MATERIALS[b].remnant ? 1 : 0)).forEach(k => grid.appendChild(matChip(k, r.mats[k])));
      inv.appendChild(grid);
      const tabs = el('div', { class: 'craft-tabs' });
      [['weapon', 'Weapons'], ['gear', 'Clothing'], ['charm', 'Charms'], ['item', 'Consumables']].forEach(([k, l]) => {
        const t = el('button', { class: 'lobby-tab' + (tab === k ? ' active' : '') }, l);
        t.onclick = () => { tab = k; SBR.audio.play('click'); render(); };
        tabs.appendChild(t);
      });
      const list = el('div', { class: 'recipe-grid' });
      const entries = tab === 'item'
        ? Object.entries(SBR.ITEM_RECIPES).map(([id, rec]) => ({ id, kind: 'item', rec, name: SBR.ITEMS[id].name, desc: SBR.ITEMS[id].desc, icon: SBR.icons.item(id), rarity: 'common' }))
        : Object.entries(SBR.EQUIPMENT).filter(([, e]) => (tab === 'gear' ? ['hat', 'coat', 'boots'].includes(e.slot) : e.slot === tab) && e.recipe).map(([id, e]) => ({ id, kind: 'equip', rec: e.recipe, remnant: e.remnant, name: e.name, desc: SBR.equipDesc(id), icon: SBR.icons.equip(id), rarity: e.rarity }));
      entries.sort((a, b) => SBR.game.canCraft(b) - SBR.game.canCraft(a));
      entries.forEach(en => {
        const known = !en.remnant || (r.mats[en.remnant] || 0) > 0 || (r.crafted || []).includes(en.id);
        const ok = SBR.game.canCraft(en);
        const card = el('div', { class: 'recipe rarity-' + en.rarity + (ok ? ' ready' : '') + (known ? '' : ' unknown') });
        card.innerHTML = `<div class="rc-icon">${en.icon}</div><div class="rc-body"><div class="rc-name">${known ? en.name : '??? — ' + SBR.REMNANTS[en.remnant].from}</div><div class="rc-desc">${known ? en.desc : 'Requires the Stand Remnant <b>' + SBR.REMNANTS[en.remnant].name + '</b>. Defeat ' + SBR.REMNANTS[en.remnant].from + '.'}</div></div>`;
        const ing = el('div', { class: 'rc-ing' });
        const all = Object.assign({}, en.rec, en.remnant ? { [en.remnant]: 1 } : {});
        Object.entries(all).forEach(([mat, n]) => {
          const have = r.mats[mat] || 0;
          ing.appendChild(el('div', { class: 'ing' + (have >= n ? ' ok' : ' no') }, matChip(mat), el('span', {}, `${have}/${n}`)));
        });
        card.appendChild(ing);
        const b = btn(ok ? 'CRAFT' : 'Missing', async () => {
          if (!SBR.game.canCraft(en)) return;
          SBR.game.craft(en);
          await craftFx(en.icon, en.name);
          render(); refreshStage();
        }, 'btn-small btn-craft' + (ok ? ' btn-primary' : ' disabled'));
        card.appendChild(b);
        list.appendChild(card);
      });
      box.append(inv, tabs, list);
    };
    render();
    modal(box, { title: 'Crafting Bench', drawer: true, onClose: refreshStage });
  }
  function craftFx(icon, name) {
    return new Promise(res => {
      const o = el('div', { class: 'craft-fx', html: `<div class="cf-rays"></div><div class="cf-item">${icon}</div><div class="cf-name">${name}</div><div class="cf-hammer">🔨</div>` });
      document.getElementById('overlay').appendChild(o);
      SBR.audio.play('block'); setTimeout(() => SBR.audio.play('block'), 220);
      setTimeout(() => { SBR.audio.play('level'); if (SBR.fx) SBR.fx.sparks(innerWidth / 2, innerHeight / 2, '#f2c14e', 50, 9); }, 480);
      setTimeout(() => { o.classList.add('out'); }, 1300);
      setTimeout(() => { o.remove(); res(); }, 1650);
    });
  }

  /* ---------- Settings ---------- */
  function settingsScreen(inRun) {
    const s = SBR.settings;
    const box = el('div', { class: 'settings' });
    const row = (label, input) => el('label', { class: 'set-row' }, el('span', {}, label), input);
    const speed = el('input', { type: 'range', min: 0.5, max: 2, step: 0.25, value: s.speed });
    speed.oninput = () => { s.speed = +speed.value; SBR.saveSettings(); };
    const vol = el('input', { type: 'range', min: 0, max: 1, step: 0.05, value: s.sfx });
    vol.oninput = () => { s.sfx = +vol.value; SBR.saveSettings(); SBR.audio.play('click'); };
    const chk = key => { const c = el('input', { type: 'checkbox' }); c.checked = !!s[key]; c.onchange = () => { s[key] = c.checked; SBR.saveSettings(); document.body.classList.toggle('reduced', !!s.reducedMotion); }; return c; };
    box.append(row('Game speed', speed), row('Sound volume', vol), row('Screen shake', chk('shake')), row('Typewriter text', chk('typewriter')), row('Reduced motion', chk('reducedMotion')));
    box.appendChild(el('div', { class: 'keys', html: '<b>Keys</b> — 1–7 abilities/cards · Q Brace · E End/Items · Tab cycle target · P Party · B Bag · M Map · Space advance dialogue' }));
    let w;
    if (inRun) box.appendChild(btn('Save & quit to title', () => { SBR.saveRun(); closeModal(w); SBR.game.toTitle(); }, 'btn-danger'));
    w = modal(box, { title: 'Settings', size: 'small' });
  }

  return { btn, artFor, portraitOf, transition, modal, closeModal, closeAllModals, sfxText, menacing, shake, statusTip, abilityTip, relicTip, itemTip, relicChip, itemChip,
    matChip, equipChip, equipTip, dialogue, diceCheck, eventPanel, resultPanel, hud, partyStrip, stageScreen, partyScreen, bagScreen, mapScreen, standingsTable, shopScreen,
    chooseMember, chooseAbility, craftScreen, equipPicker, rewardsScreen, settingsScreen, refreshStage };
})();
