/* ゴゴゴ gauge and team-up attacks.
   - The gauge: every hit the party lands fills it (a capped amount per action, half for summons, a bonus on crits and
     kills), and so does every enemy hit a rider takes. It fills at 70% speed in boss fights. It drains a little on every
     enemy turn, except when it is full: a full gauge holds.
   - A full gauge lets the active rider call a team-up with another rider who is still standing. It costs the whole
     gauge and 1 Energy from each rider, ends only the caller's turn, and each team-up works once per battle.
   - SBR.TEAMUPS holds the named pairs; Pocoloco pairs with anyone; every other pair gets a generic Double Rush.
   - Engine: P.useTeamUp(u, partnerUid, id, targetUid), P.canTeamUp, P.teamUpsFor(u). Events: {t:'combo'}, {t:'teamup'}.
   - UI: the gauge sits in .battle-top; the TEAM-UP button (key T) opens a tray in the action panel (SBR.battle.hooks).
   - Balance knobs: SBR.teamups.CFG. Team-up hits on an act boss still go through the boss hit cap (js/bosstuning.js). */
'use strict';
SBR.teamups = (() => {
  const CFG = {
    max: 100,          // gauge size
    perHit: 6,         // gauge per party hit that lands...
    perDmg: 0.5,       // ...plus this much per point of damage...
    hitCap: 14,        // ...at most this much per hit
    crit: 5,           // extra on a critical hit
    kill: 8,           // extra when a hit takes an enemy down
    actCap: 34,        // most one rider's turn can add
    hurt: 3,           // gauge when an enemy hit lands on a rider (tension builds)...
    hurtCap: 9,        // ...at most this much per enemy turn
    summonMul: 0.5,    // summons fill it at half rate
    decay: 4,          // drained on every enemy turn
    decayFull: 0,      // drained per enemy turn while the gauge is full (0: a full gauge holds)
    energy: 1,         // Energy each rider pays
    power: 1,          // multiplier on every team-up's damage
    bossMul: 0.7,      // team-up damage against boss-tier foes
    perBattle: 3,      // most team-ups in one battle
    startBoss: 0,      // gauge at the start of a boss fight
    bossFill: 0.7,     // how fast the gauge fills in boss fights
  };
  const U = SBR.util;
  const pw = (t) => CFG.power * (t && t.tier === 'boss' ? CFG.bossMul : 1);
  const alive = list => list.filter(t => t && !t.dead && !t.removed);

  /* ---------- helpers team-ups use ---------- */
  // one hit from rider x on t. base is scaled by the rider's own stats (scale), then by CFG.power
  const hit = (x, t, base, scale, o = {}) => (t && !t.dead ? x.dmg(t, base * pw(t), scale, o) : { hit: false });
  const hits = (x, t, n, base, scale, o) => { let tot = 0; for (let i = 0; i < n && t && !t.dead; i++) { const r = hit(x, t, base, scale, o); tot += (r && r.amount) || 0; } return tot; };
  const mainStat = u => { const s = u.stats || {}; return ['spin', 'aim', 'grit', 'ride', 'luck', 'res'].sort((a, b) => (s[b] || 0) - (s[a] || 0))[0]; };
  const dtypeOf = u => ({ spin: 'spin', aim: 'bullet' })[mainStat(u)] || (u.def && u.def.stand ? 'stand' : 'phys');

  /* ---------- the pairs ---------- */
  // who: ids in the pair ('*' = anyone). A = first id, B = second. run(T): T.a / T.b are ability contexts for A and B.
  // looks: [A's look, B's look] (an fx kind, or 'rush:<standKey>' for a close-range Stand barrage). finale: optional fx.
  const TEAMUPS = {
    tusk_ball: { who: ['johnny', 'gyro'], name: 'Golden Spin Tandem', sub: 'Tusk × Steel Ball', kana: '黄金回転', target: 'enemy', looks: ['nail', 'ball'], finale: 'golden',
      desc: 'Gyro\'s ball and Johnny\'s nail on the same line: two piercing Spin hits (9 each, SPIN / AIM), 2 Nail Holes, and Gyro gains 1 Rotation.',
      run(T) { hit(T.b, T.target, 9, { spin: 0.05 }, { dtype: 'spin', pierce: true, label: '回転' }); hit(T.a, T.target, 9, { aim: 0.05, spin: 0.02 }, { dtype: 'spin', pierce: true, label: 'NAIL' }); if (!T.target.dead) T.a.status(T.target, 'holed', 2); T.b.status(T.b.user, 'rotation', 1); } },
    rope_ball: { who: ['mountaintim', 'gyro'], name: 'Rope & Rotation', sub: 'Oh! Lonesome Me × Steel Ball', kana: 'ヒュン', target: 'enemy', looks: ['rope', 'ball'],
      desc: 'Tim\'s rope pins the target (Spun 1; a boss is Weakened instead), then Gyro\'s ball hits it for 13 Spin (SPIN). Always crits a pinned target.',
      run(T) { const boss = T.target.tier === 'boss'; if (boss) T.a.status(T.target, 'weak', 0, 2); else T.a.status(T.target, 'stun', 0, 1); hit(T.b, T.target, 13, { spin: 0.05 }, { dtype: 'spin', forceCrit: !boss, noDodge: true }); } },
    cream_nail: { who: ['hotpants', 'johnny'], name: 'Sealed Nail Shot', sub: 'Cream Starter × Tusk', kana: 'ズキュン', target: 'enemy', looks: ['spray', 'nail'],
      desc: 'Hot Pants seals both riders in flesh spray (Shield 8, GRIT) and Johnny fires through the gap: 14 piercing Gunshot damage (AIM).',
      run(T) { const sh = Math.round(8 * (1 + (T.a.user.stats.grit || 0) * 0.03)); [T.a.user, T.b.user].forEach(r => T.a.status(r, 'shield', sh)); hit(T.b, T.target, 14, { aim: 0.05 }, { dtype: 'bullet', pierce: true }); } },
    star_diamond: { who: ['jotaro', 'josuke'], name: 'DORARARA × ORAORA', sub: 'Star Platinum × Crazy Diamond', kana: 'オラドラ', target: 'enemy', looks: ['rush:star_platinum', 'rush:crazy_diamond'],
      desc: 'Two Stands, one target: 5 ORA punches of 3.5 and 5 DORA punches of 3.5 (SPIN), then Crazy Diamond fixes everyone up for 8% max HP.',
      run(T) { hits(T.a, T.target, 5, 3.5, { spin: 0.03 }, { dtype: 'stand', label: 'ORA' }); hits(T.b, T.target, 5, 3.5, { spin: 0.03 }, { dtype: 'stand', label: 'DORA' }); T.b.allies.filter(p => !p.summon).forEach(p => T.b.heal(p, Math.round(p.maxHp * 0.08), {})); } },
    life_string: { who: ['giorno', 'jolyne'], name: 'Life-String Snare', sub: 'Gold Experience × Stone Free', kana: '無駄オラ', target: 'enemy', looks: ['rush:gold_experience', 'string'],
      desc: 'Jolyne\'s string snares every enemy (Weakened 1), Giorno\'s MUDA rush lands 6 blows of 3 (SPIN), and the party heals for a quarter of the damage.',
      run(T) { T.b.enemies.forEach(e => T.b.status(e, 'weak', 0, 1)); const d = hits(T.a, T.target, 6, 3, { spin: 0.03 }, { dtype: 'stand', label: 'MUDA' }); const per = Math.max(1, Math.round(d * 0.25 / Math.max(1, T.a.allies.length))); T.a.allies.filter(p => !p.summon).forEach(p => T.a.heal(p, per, {})); } },
    stampede: { who: ['diego', 'johnny'], name: 'Rival Stampede', sub: 'Scary Monsters × Tusk', kana: 'ドドドド', target: 'allEnemies', looks: ['claw', 'nail'],
      desc: 'Diego\'s raptors tear through the whole line (6 each, RIDE, 2 Bleed), then Johnny nails whoever is weakest for 11 piercing Spin (AIM).',
      run(T) { T.a.enemies.forEach(e => { const r = hit(T.a, e, 6, { ride: 0.04 }, { dtype: 'phys', label: 'CLAW' }); if (r && r.hit) T.a.status(e, 'bleed', 2); }); const low = alive(T.b.enemies).sort((x, y) => x.hp - y.hp)[0]; if (low) hit(T.b, low, 11, { aim: 0.05 }, { dtype: 'spin', pierce: true }); } },
    lucky_day: { who: ['pocoloco', '*'], name: 'It\'s Your Lucky Day!', sub: 'Hey Ya! × a friend', kana: 'ラッキー', target: 'enemy', looks: ['buff', 'hit'],
      desc: 'Hey Ya! cheers the partner on: their hit (12, best stat) always crits and cannot be dodged, and every rider is Lucky for 2 turns.',
      run(T) { const s = mainStat(T.b.user); hit(T.b, T.target, 12, { [s]: 0.05 }, { dtype: dtypeOf(T.b.user), forceCrit: true, noDodge: true }); T.a.allies.filter(p => !p.summon).forEach(p => T.a.status(p, 'lucky', 0, 2)); } },
    twin_wreck: { who: ['wekapipo', 'gyro'], name: 'Twin Wrecking Balls', sub: 'Wrecking Ball × Steel Ball', kana: 'ギャルギャル', target: 'allEnemies', looks: ['ball', 'ball'], finale: 'golden',
      desc: 'Both Zeppeli-trained balls sweep the line: 6 Spin from each on every enemy (SPIN), and each enemy loses its left side for a turn.',
      run(T) { T.a.enemies.forEach(e => { hit(T.a, e, 6, { spin: 0.04 }, { dtype: 'spin' }); hit(T.b, e, 6, { spin: 0.04 }, { dtype: 'spin' }); if (!e.dead) T.a.status(e, 'leftblind', 0, 1); }); } },
    sanctuary: { who: ['lucy', 'hotpants'], name: 'Sanctuary of the Saint', sub: 'Ticket to Ride × Cream Starter', kana: '聖なる', target: 'none', looks: ['heal', 'spray'],
      desc: 'Lucy\'s luck and Hot Pants\' flesh spray: every rider heals 18% max HP, loses a debuff and gains Shield 6.',
      run(T) { T.a.allies.filter(p => !p.summon).forEach(p => { T.b.heal(p, Math.round(p.maxHp * 0.18), {}); T.a.cleanse(p, 1); T.b.status(p, 'shield', 6); }); } },
    father_daughter: { who: ['jotaro', 'jolyne'], name: 'Father & Daughter', sub: 'Star Platinum × Stone Free', kana: 'オラオラオラ', target: 'enemy', looks: ['rush:star_platinum', 'rush:stone_free'],
      desc: 'Jotaro and Jolyne, side by side at last: 6 ORA punches of 3 each (SPIN), and the target is Exposed for 2 turns.',
      run(T) { hits(T.b, T.target, 6, 3, { spin: 0.03 }, { dtype: 'stand', label: 'ORA' }); hits(T.a, T.target, 6, 3, { spin: 0.03 }, { dtype: 'stand', label: 'ORA' }); if (!T.target.dead) T.a.status(T.target, 'vuln', 0, 2); } },
    restored_round: { who: ['josuke', 'johnny'], name: 'Restored Round', sub: 'Crazy Diamond × Tusk', kana: 'ドララ', target: 'enemy', looks: ['restore', 'nail'],
      desc: 'Johnny fires a nail (12 Spin, AIM); Crazy Diamond fixes it back into his finger and he fires again (12). Johnny gains 1 Energy.',
      run(T) { const j = T.b; hit(j, T.target, 12, { aim: 0.05 }, { dtype: 'spin', label: 'NAIL' }); hit(j, T.target, 12, { aim: 0.05 }, { dtype: 'spin', label: 'FIXED' }); j.energy(j.user, 1); } },
    golden_spirit: { who: ['giorno', 'gyro'], name: 'Golden Spirit', sub: 'Gold Experience × Golden Rotation', kana: '黄金の精神', target: 'enemy', looks: ['life', 'golden'],
      desc: 'Gyro\'s golden rotation (14 Spin, SPIN) with a ball Giorno brought to life: the hit also heals the most hurt rider for 14.',
      run(T) { hit(T.b, T.target, 14, { spin: 0.05 }, { dtype: 'spin', label: '黄金' }); const low = alive(T.a.allies).filter(p => !p.summon).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0]; if (low) T.a.heal(low, 14, { res: 0.02 }); } },
    bloodline: { who: ['johnny', 'jotaro'], name: 'Joestar Bloodline', sub: 'Tusk × Star Platinum', kana: 'ジョースター', target: 'enemy', looks: ['nail', 'rush:star_platinum'],
      desc: 'The star-shaped birthmark answers itself: Star Platinum lands 5 punches of 3 (SPIN), then Tusk fires a 12 piercing Spin nail (AIM).',
      run(T) { hits(T.b, T.target, 5, 3, { spin: 0.03 }, { dtype: 'stand', label: 'ORA' }); hit(T.a, T.target, 12, { aim: 0.05 }, { dtype: 'spin', pierce: true }); } },
    blood_of_dio: { who: ['diego', 'giorno'], name: 'Blood of DIO', sub: 'Scary Monsters × Gold Experience', kana: 'WRYYYY', target: 'enemy', looks: ['claw', 'rush:gold_experience'],
      desc: 'Two heirs of DIO: raptor jaws (10, RIDE, 3 Bleed) then a MUDA rush of 5 blows of 3 (SPIN).',
      run(T) { const r = hit(T.a, T.target, 10, { ride: 0.05 }, { dtype: 'phys', label: 'WRYYY' }); if (r && r.hit && !T.target.dead) T.a.status(T.target, 'bleed', 3); hits(T.b, T.target, 5, 3, { spin: 0.03 }, { dtype: 'stand', label: 'MUDA' }); } },
    frontier_justice: { who: ['mountaintim', 'hotpants'], name: 'Frontier Justice', sub: 'Oh! Lonesome Me × Cream Starter', kana: 'バン', target: 'allEnemies', looks: ['gun', 'spray'],
      desc: 'Tim\'s shots from behind the rope (8 Gunshot each, AIM) and Hot Pants\' spray in their eyes (Blinded 1) across the whole line.',
      run(T) { T.a.enemies.forEach(e => { hit(T.a, e, 8, { aim: 0.05 }, { dtype: 'bullet' }); if (!e.dead) T.b.status(e, 'blind', 0, 1); }); } },
    rival_riders: { who: ['diego', 'gyro'], name: 'Rival Riders', sub: 'Scary Monsters × Steel Ball', kana: 'ギャルギャル', target: 'enemy', looks: ['claw', 'ball'],
      desc: 'Rivals racing for the same prize: a raptor lunge (10, RIDE) and a steel ball (10 Spin, SPIN). Both riders gain Empowered 1.',
      run(T) { hit(T.a, T.target, 10, { ride: 0.05 }, { dtype: 'phys' }); hit(T.b, T.target, 10, { spin: 0.05 }, { dtype: 'spin' }); [T.a.user, T.b.user].forEach(r => T.a.status(r, 'empower', 0, 1)); } },
    double_rush: { who: ['*', '*'], name: 'Double Rush', sub: 'Side by side', kana: 'ドドドド', target: 'enemy', looks: ['hit', 'hit'], generic: true,
      desc: 'Both riders go all in on one target: 8 damage each, scaled by each rider\'s best stat.',
      run(T) { [T.a, T.b].forEach(x => { const s = mainStat(x.user); hit(x, T.target, 8, { [s]: 0.05 }, { dtype: dtypeOf(x.user) }); }); } },
  };

  /** the team-up a pair gets: a named pair first, then Pocoloco's, then Double Rush. Returns { id, def, a, b } with a/b in def order */
  function forPair(u, p) {
    if (!u || !p || u === p) return null;
    for (const [id, d] of Object.entries(TEAMUPS)) {
      if (d.who[1] === '*' || d.who[0] === '*') continue;
      if (d.who[0] === u.id && d.who[1] === p.id) return { id, def: d, a: u, b: p };
      if (d.who[0] === p.id && d.who[1] === u.id) return { id, def: d, a: p, b: u };
    }
    if (u.id === 'pocoloco' || p.id === 'pocoloco') { const a = u.id === 'pocoloco' ? u : p; return { id: 'lucky_day:' + (a === u ? p.id : u.id), def: TEAMUPS.lucky_day, a, b: a === u ? p : u }; }
    const key = [u.id, p.id].sort().join('+');
    return { id: 'double_rush:' + key, def: TEAMUPS.double_rush, a: u, b: p };
  }

  /* ---------- engine ---------- */
  const P = SBR.Combat.prototype;
  const gaugeOf = c => (c.combo || 0);
  function setGauge(c, v, gain) {
    const before = gaugeOf(c);
    c.combo = U.clamp(Math.round(v), 0, CFG.max);
    if (c.combo !== before) c.push({ t: 'combo', v: c.combo, max: CFG.max, gain: c.combo - before, full: c.combo >= CFG.max, fill: gain });
  }
  api0();
  function api0() {
    const damage = P.damage;
    P.damage = function (src, tgt, base, scale, opts, ability) {
      const wasDead = tgt ? tgt.dead : true;
      const r = damage.call(this, src, tgt, base, scale, opts, ability);
      if (r && r.hit && src && src.side === 'party' && tgt && tgt.side === 'enemy' && !this._tuActive && !this.result) {
        let g = Math.min(CFG.hitCap, CFG.perHit + (r.amount || 0) * CFG.perDmg) + (r.crit ? CFG.crit : 0) + (!wasDead && tgt.dead ? CFG.kill : 0);
        if (src.summon) g *= CFG.summonMul;
        if (this.opts && this.opts.boss) g *= CFG.bossFill;
        const room = Math.max(0, CFG.actCap - (this._comboAct || 0));
        g = Math.min(g, room);
        if (g > 0) { this._comboAct = (this._comboAct || 0) + g; setGauge(this, gaugeOf(this) + g, true); }
      } else if (r && r.hit && src && src.side === 'enemy' && tgt && tgt.side === 'party' && !tgt.summon && !this.result) {
        const g = Math.min(CFG.hurt * (this.opts && this.opts.boss ? CFG.bossFill : 1), Math.max(0, CFG.hurtCap - (this._comboHurt || 0)));
        if (g > 0) { this._comboHurt = (this._comboHurt || 0) + g; setGauge(this, gaugeOf(this) + g, true); }
      }
      return r;
    };
    const beginTurn = P.beginTurn;
    P.beginTurn = function (u) {
      this._comboAct = 0; this._comboHurt = 0;
      if (u && u.side === 'enemy' && !u.dead && gaugeOf(this) > 0) {
        const d = gaugeOf(this) >= CFG.max ? CFG.decayFull : CFG.decay;
        if (d) setGauge(this, gaugeOf(this) - d, false);
      }
      return beginTurn.call(this, u);
    };
  }

  /** every team-up this rider could call right now, one per living partner: [{ id, def, a, b, partner, ok, why }] */
  P.teamUpsFor = function (u) {
    if (!u || u.side !== 'party' || u.summon) return [];
    return this.party().filter(p => p !== u && !p.removed && !p.dead).map(p => {
      const tu = forPair(u, p);
      if (!tu) return null;
      tu.partner = p;
      tu.why = this.canTeamUp(u, p, tu.id);
      tu.ok = !tu.why;
      return tu;
    }).filter(Boolean).sort((x, y) => (x.def.generic ? 1 : 0) - (y.def.generic ? 1 : 0));
  };
  /** '' when the pair can team up now, otherwise why not */
  P.canTeamUp = function (u, p, id) {
    this.tuUsed = this.tuUsed || {};
    if (this.result) return 'The battle is over.';
    if (!u || !p || u.dead || p.dead || p.removed || u.summon || p.summon) return 'Both riders must be standing.';
    if (gaugeOf(this) < CFG.max) return 'The ゴゴゴ gauge must be full.';
    if (this.tuUsed[id]) return 'Already used this battle.';
    if ((this.tuCount || 0) >= CFG.perBattle) return `No more than ${CFG.perBattle} team-ups a battle.`;
    if ((u.energy || 0) < CFG.energy) return `${u.name} needs ${CFG.energy} Energy.`;
    if ((p.energy || 0) < CFG.energy) return `${p.name} needs ${CFG.energy} Energy.`;
    if (this.has(u, 'raptor') || this.has(p, 'raptor')) return 'A dinosaur can\'t team up.';
    if (this.has(p, 'stun') || this.has(p, 'timestop')) return `${p.name} can't move.`;
    return '';
  };
  /** the caller spends its turn; the partner pays Energy but keeps its own turn */
  P.useTeamUp = function (u, partnerUid, id, targetUid) {
    const p = this.unit(partnerUid);
    const tu = forPair(u, p);
    if (!tu || tu.id !== id || this.canTeamUp(u, p, id)) return false;
    const d = tu.def;
    this.tuUsed[id] = true;
    this.tuCount = (this.tuCount || 0) + 1;
    u.energy -= CFG.energy; p.energy -= CFG.energy;
    setGauge(this, 0, false);
    let target = targetUid ? this.unit(targetUid) : null;
    if (d.target === 'enemy') {
      const T = this.tauntersAgainst(u), foes = this.foes(u);
      if (T.length && !T.includes(target)) target = T[0];
      if (!target || target.dead || target.side !== 'enemy') target = T[0] || foes.slice().sort((x, y) => x.hp - y.hp)[0] || null;
      if (!target) { this.endTurn(u); return true; }
    }
    const targets = d.target === 'allEnemies' ? this.foes(u).map(t => t.uid) : d.target === 'none' ? this.party().filter(q => !q.dead && !q.removed).map(q => q.uid) : [target.uid];
    this.notoriety(u, 0.3); this.notoriety(p, 0.3);
    this.push({ t: 'teamup', uid: u.uid, partner: p.uid, a: tu.a.uid, b: tu.b.uid, id, base: id.split(':')[0], name: d.name, sub: d.sub, kana: d.kana, targets, looks: d.looks, finale: d.finale || null, energyA: u.energy, energyB: p.energy });
    SBR.meta.stats.teamups = (SBR.meta.stats.teamups || 0) + 1;
    if (!this.preAction(u)) { this.endTurn(u); return true; }
    const pseudo = { name: d.name, tags: ['teamup'], fx: 'hit' };
    const T = { c: this, target, a: this.ctx(tu.a, target, pseudo, 1), b: this.ctx(tu.b, target, pseudo, 1) };
    this._tuActive = true;
    try { d.run(T); } finally { this._tuActive = false; }
    this.log(`Team-up: ${tu.a.name} & ${tu.b.name} — ${d.name}!`, 'good');
    this.endTurn(u);
    return true;
  };

  // a boss fight can start with some gauge (CFG.startBoss)
  const Base = SBR.Combat;
  SBR.Combat = class extends Base {
    constructor(e, o) { super(e, o); this.combo = (o && o.boss) ? CFG.startBoss : 0; this.tuUsed = {}; this.tuCount = 0; }
  };

  /* ---------- UI (through SBR.battle.hooks) ---------- */
  const { el, sleep } = U;
  const spd = () => SBR.settings.speed || 1;
  const calm = () => !!SBR.settings.reducedMotion;
  function gaugeHtml(v, max) {
    const pct = Math.round(v / max * 100);
    return `<span class="gg-kana" aria-hidden="true">ゴゴゴ</span><div class="gg-bar"><div class="gg-fill" style="width:${pct}%"></div><div class="gg-ticks"></div></div><span class="gg-state">${v >= max ? 'TEAM-UP READY <kbd class="ux-kbd">T</kbd>' : pct + '%'}</span>`;
  }
  function drawGauge(api, e) {
    const root = api.root; if (!root) return;
    const g = root.querySelector('.gogo-gauge'); if (!g) return;
    const c = api.c, v = e ? e.v : gaugeOf(c);
    const was = g.classList.contains('full');
    g.innerHTML = gaugeHtml(v, CFG.max);
    g.classList.toggle('full', v >= CFG.max);
    if (e && e.gain > 0) { g.classList.remove('gain'); void g.offsetWidth; g.classList.add('gain'); }
    if (v >= CFG.max && !was) {
      SBR.audio.play('menace');
      const r = g.getBoundingClientRect();
      if (!calm() && SBR.fx && SBR.fx.kana) SBR.fx.kana(r.left + r.width / 2, r.bottom + 30, 'ゴゴゴゴ', '#b070e0', 46, 900);
      api.addLog('<b>ゴゴゴ gauge full!</b> A team-up is ready (T).', 'good');
      // refresh the action panel so the button lights up
      const u = api.activeUid && c.unit(api.activeUid);
      if (u && u.side === 'party' && api.waitingInput) api.showActions(u);
    }
  }
  function tip() {
    return `<b>ゴゴゴ gauge</b><br>Every hit your riders land fills it (up to ${CFG.actCap}% a turn; crits and kills add more), and so does taking hits. Each enemy turn drains ${CFG.decay}%, but a full gauge holds. It fills slower against a boss.<br>When it's full, the active rider can call a <b>team-up</b> with another rider: it costs the whole gauge and ${CFG.energy} Energy from each. Each team-up works once per battle (at most ${CFG.perBattle}).`;
  }
  function onRender(root, api) {
    const top = root.querySelector('.battle-top'); if (!top) return;
    const g = el('div', { class: 'gogo-gauge', html: gaugeHtml(gaugeOf(api.c), CFG.max) });
    SBR.tip.bind(g, tip);
    const title = top.querySelector('.battle-title');
    if (title && title.nextSibling) top.insertBefore(g, title.nextSibling); else top.appendChild(g);
    g.classList.toggle('full', gaugeOf(api.c) >= CFG.max);
  }
  function tuTip(tu, c) {
    const pair = `${tu.a.name} + ${tu.b.name}`;
    return `<b>${tu.def.name}</b> <small>${tu.def.sub}</small><br><i>${pair}</i><br>${tu.def.desc}<br><small>Costs the full ゴゴゴ gauge and ${CFG.energy} Energy from each rider. Once per battle.</small>${tu.why ? `<br><b class="tip-no">${tu.why}</b>` : ''}`;
  }
  function openTray(u, api) {
    const c = api.c, box = api.actionBox;
    box.querySelectorAll('.tu-tray, .item-tray').forEach(t => t.remove());
    const list = c.teamUpsFor(u);
    const tray = el('div', { class: 'tu-tray' });
    tray.appendChild(el('div', { class: 'tu-head', html: '<b>TEAM-UP</b> <span>pick a partner</span>' }));
    if (!list.length) tray.appendChild(el('div', { class: 'tu-empty' }, 'No other rider is standing.'));
    list.forEach((tu, i) => {
      const b = el('button', { class: 'tu-pick' + (tu.ok ? '' : ' disabled') + (tu.def.generic ? ' generic' : ''), dataset: { id: tu.id } });
      b.innerHTML = `<span class="tu-ports"><i>${api.artOf(tu.a)}</i><i>${api.artOf(tu.b)}</i></span><span class="tu-txt"><b>${tu.def.name}</b><small>${tu.partner.name} · ${tu.def.sub}</small></span><span class="tu-key">${i + 1}</span>`;
      SBR.tip.bind(b, () => tuTip(tu, c));
      b.onclick = () => { if (!tu.ok) { SBR.audio.play('back'); return; } tray.remove(); choose(u, tu, api); };
      tray.appendChild(b);
    });
    tray.appendChild(el('button', { class: 'tray-x' }, '✕')).onclick = () => tray.remove();
    box.appendChild(tray);
    SBR.audio.play('click');
  }
  function choose(u, tu, api) {
    const c = api.c;
    SBR.audio.play('select');
    if (tu.def.target !== 'enemy') return api.finishInput(() => c.useTeamUp(u, tu.partner.uid, tu.id, null));
    const foes = c.tauntersAgainst(u).length ? c.tauntersAgainst(u) : c.foes(u);
    if (foes.length === 1) return api.finishInput(() => c.useTeamUp(u, tu.partner.uid, tu.id, foes[0].uid));
    api.startTargeting(u, 'foe', tuid => api.finishInput(() => c.useTeamUp(u, tu.partner.uid, tu.id, tuid)));
  }
  function actionButton(u, extra, api) {
    const c = api.c;
    const list = c.teamUpsFor(u);
    if (!list.length) return;
    const ready = list.some(t => t.ok);
    const full = gaugeOf(c) >= CFG.max;
    const b = SBR.ui.btn(el('span', { html: `<b>T</b> Team-up${full ? ' <em>ゴゴゴ</em>' : ` <small>${Math.round(gaugeOf(c) / CFG.max * 100)}%</small>`}` }), () => { if (ready) openTray(u, api); else { openTray(u, api); } }, 'btn-teamup' + (ready ? ' ready' : ' disabled'));
    SBR.tip.bind(b, () => ready ? `<b>Team-up</b><br>Call a combined attack with another rider. ${list.filter(t => t.ok).map(t => t.def.name).join(' · ')}` : `<b>Team-up</b><br>${full ? list.map(t => `${t.def.name}: ${t.why}`).join('<br>') : 'Fill the ゴゴゴ gauge by landing hits.'}`);
    extra.appendChild(b);
  }
  function onKey(e, u, api) {
    if (e.key === 't' || e.key === 'T') { if (api.c.teamUpsFor(u).length) openTray(u, api); return true; }
    const tray = api.actionBox && api.actionBox.querySelector('.tu-tray');
    if (tray && /^[1-9]$/.test(e.key)) { const b = tray.querySelectorAll('.tu-pick')[+e.key - 1]; if (b) b.click(); return true; }
    if (tray && e.key === 'Escape') { tray.remove(); return true; }
    return false;
  }

  /** the dual cut-in, both riders lunging, both looks at once, then a finale */
  async function playTeamUp(e, u, api) {
    const c = api.c, A = c.unit(e.a), B = c.unit(e.b), cards = api.cards();
    api.addLog(`<b>TEAM-UP!</b> ${A.name} & ${B.name}: ${e.name}`, 'good');
    const g = api.root.querySelector('.gogo-gauge'); if (g) { g.innerHTML = gaugeHtml(0, CFG.max); g.classList.remove('full'); }
    api.renderEnergy(A); api.renderEnergy(B);
    SBR.audio.play('stand');
    await SBR.cutin({ portrait: SBR.ui.artFor(A.art), portrait2: SBR.ui.artFor(B.art), name: e.name, sub: `${A.name} × ${B.name} — ${e.sub}`, color: (A.def && A.def.color) || '#f2c14e', color2: (B.def && B.def.color) || '#e8508a', kanaText: e.kana || 'ドドドド', dual: true });
    [A, B].forEach(x => { const k = cards[x.uid]; if (k) { k.classList.remove('lunge', 'tu-lunge'); void k.offsetWidth; k.classList.add('tu-lunge'); setTimeout(() => k.classList.remove('tu-lunge'), 700 / spd()); } });
    const tpts = e.targets.filter(t => cards[t]).slice(0, 5).map(api.center);
    const self = e.targets.every(t => { const x = c.unit(t); return x && x.side === 'party'; });
    const look = async (x, lk, delay) => {
      await sleep(delay);
      const from = api.center(x.uid);
      const color = (x.def && x.def.color) || '#f2c14e';
      if (lk && lk.startsWith('rush:') && SBR.strike && !self && tpts.length) {
        return SBR.strike.rush({ key: lk.slice(5), name: e.name, from, to: tpts.slice(0, 4), tier: 2, lvl: 2, enemy: false, color });
      }
      return SBR.fx.play(lk && !lk.startsWith('rush:') ? lk : 'hit', from, self ? [from] : tpts, { tier: 2, self, ucolor: color, variant: 7, name: e.name, noStandFx: true });
    };
    await Promise.all([look(A, e.looks[0], 0), look(B, e.looks[1], 140)]);
    if (e.finale && tpts.length && !self) { SBR.audio.play('spin'); await SBR.fx.play(e.finale, api.center(e.uid), tpts, { tier: 3, ucolor: '#f2c14e', variant: 3, name: e.name, noStandFx: true, kana: e.kana }); }
    else if (!calm()) {
      const pt = tpts[0] || api.center(e.uid);
      SBR.fx.flash('#fff3a0', 160, 0.35);
      SBR.fx.kana(pt.x, pt.y - 80, e.kana || 'ドドドド', '#f2c14e', 84, 900);
      SBR.fx.ring(pt.x, pt.y, '#f2c14e', 150, 10, 0.5);
    }
    api.quake(true);
    await sleep(160);
  }

  function hook() {
    const H = SBR.battle && SBR.battle.hooks;
    if (!H) return false;
    H.render.push(onRender);
    H.actions.push(actionButton);
    H.keys.push(onKey);
    H.events.combo = async (e, u, api) => drawGauge(api, e);
    H.events.teamup = playTeamUp;
    H.sync.push(api => drawGauge(api, null));
    return true;
  }
  if (!hook()) window.addEventListener('load', hook);

  return { CFG, TEAMUPS, forPair, gauge: c => gaugeOf(c) };
})();
SBR.TEAMUPS = SBR.teamups.TEAMUPS;
