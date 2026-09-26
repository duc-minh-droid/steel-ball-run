/* Boss director: makes act bosses, detour bosses and Strange Auras feel overwhelming but readable.
   Loads after trees.js and wraps SBR.Combat the same way (subclass + prototype wrappers), so boons, trees,
   summons, aggro and the Stand choreography keep working untouched.

   What a boss gets (the lead boss of a boss fight; other boss-tier units get the stat parts only):
     - HP and damage that grow with the act and with every rider you bring (on top of Combat.hpScale)
     - initiative: a big bonus, so it usually moves first
     - OVERWHELMING PRESENCE: an extra move at the end of the round (every round against 4+ riders,
       every other round against 3), skipped while it is Spun or frozen
     - TELEGRAPHS: it announces its next big move ("Ringo is aiming Quickdraw at Johnny"). The telegraphed
       move hits much harder next turn, but: Brace/Guard halves it, Taunt pulls a single-target one,
       and a stun interrupts it outright. Area telegraphs also drain 1 Energy from unguarded riders.
     - STEELED: after being Spun or frozen it shrugs off the next ones for two of its turns
     - a hit cap, so a single burst can't delete it (15% of max HP per hit; 10% for Strange Auras)
     - SECOND WIND at half HP (not Strange Auras, which have their own phases): cleanses, shields, enrages
     - FURY: an enrage timer, so stalling never wins
   Elites get act-scaled HP and a little initiative.
   Tuning lives in SBR.bossTuning.CFG; SBR.bossTuning.enabled = false switches the whole director off. */
'use strict';

SBR.bossTuning = (() => {
  const CFG = {
    hpAct: { 1: 0.75, 2: 0.75, 3: 0.8, 4: 0.8, 5: 0.9, 6: 0.95 },
    dmgAct: { 1: 0.75, 2: 0.83, 3: 1.06, 4: 1.02, 5: 1.1, 6: 1.06 },
    hpPerRider: 0.10,          // +10% boss HP per rider beyond three (on top of Combat.hpScale)
    dmgPerRider: 0.06,         // +6% boss damage per rider beyond three
    second: 0.8,               // damage of the other boss-tier units in a boss fight (the lead's lieutenants)
    crowd: 0.15,               // the lead's damage is divided by 1 + crowd per extra unit it starts the fight with
    init: 8,                   // initiative bonus, +1 per act (the lead gets +2 more)
    cap: 0.15, capSuper: 0.10, // max share of max HP a single party hit can take
    single: 2.6, aoe: 2.0,     // telegraphed move power: most of a boss's threat lives here, where it can be answered
    braced: 0.3,               // what Guard leaves of a telegraphed hit (a braced telegraph lands softer than a normal hit)
    stagger: 2,                // Exposed turns on a boss whose telegraph was fully braced or interrupted
    holes: 6,                  // most Nail Holes a boss can carry
    summonVsBoss: 0.75,        // party summons' damage against bosses
    furyAt: 9, furyAtSuper: 13, fury: 0.12,
    // elite fights: every enemy gets eliteAll HP and eliteDmg damage; elite-tier units get eliteHp on top
    eliteAll: { 1: 0.7, 2: 0.75, 3: 0.65, 4: 0.95, 5: 1.1, 6: 1.2 },
    eliteHp: { 1: 1.1, 2: 1.3, 3: 1.25, 4: 1.4, 5: 2.0, 6: 1.9 },
    eliteDmg: { 1: 1.4, 2: 1.5, 3: 1.9, 4: 2.0, 5: 2.2, 6: 2.2 },
    // per-boss adjustments by enemy id (or its base id): hp / dmg multipliers, echo: how often Overwhelming Presence fires (0 = never)
    tune: {
      benjamin: { hp: 0.8, dmg: 0.9 }, andre: { hp: 0.8, dmg: 0.9 }, laboom: { hp: 0.8, dmg: 0.9 },
      robinson_boss: { dmg: 1.7 }, porkpie_boss: { dmg: 1.6 }, oyecomova_boss1: { dmg: 1.55 },
      ferdinand: { hp: 0.75, dmg: 1.2 }, oyecomova_boss: { dmg: 1.7 }, porkpie_boss2: { dmg: 1.45 }, diego_boss: { hp: 0.8, dmg: 1.85 },
      sandman: { dmg: 1.3 }, ringo: { dmg: 2.2 }, blackmore: { dmg: 3.0 }, hotpants_boss: { dmg: 2.8 },
      axl: { hp: 0.75, dmg: 0.8, echo: 2 }, wekapipo_foe: { dmg: 1.35 }, tattoo_boss: { dmg: 2.4 }, 'tattoo_boss@5': { dmg: 1.7 }, mikeo_boss: { dmg: 3.0 },
      // Love Train is a piercing puzzle: piercing hits are what the fight is about, so they may land harder
      lovetrain: { hp: 0.6, dmg: 0.9, cap: 0.35 }, 'lovetrain@6': { hp: 0.8, dmg: 1.7, cap: 0.3 },
      valentine_d4c: { hp: 0.9, dmg: 1.3 }, disco_boss: { hp: 1.2, dmg: 1.95 }, saint_lucy: { dmg: 2.2 },
      diego_rival: { hp: 0.75 }, diego_world: { dmg: 1.1 }, valentine_last: { hp: 0.4, dmg: 0.85 }, diego_parallel: { hp: 0.65, dmg: 0.7 },
      // detour bosses are optional: a notch gentler than the act bosses
      palm_echo: { hp: 0.8, dmg: 0.8 }, palm_pilgrim: { hp: 0.8, dmg: 0.6 }, dust_wraith: { dmg: 0.7 }, fossil_colossus: { hp: 0.6, dmg: 0.55 },
      white_album: { dmg: 1.6 }, pm_wamuu: { hp: 0.6, dmg: 0.55 }, pm_esidisi: { hp: 0.6, dmg: 0.55 },
      // Strange Auras bring their own extra moves (time stops, acceleration, frenzy), so their presence is rarer
      sb_kars: { hp: 0.11, dmg: 1.2, echo: 2 }, sb_trex: { hp: 0.16, dmg: 1.05, echo: 2 }, sb_kira: { hp: 0.55, dmg: 1.2, echo: 2 },
      sb_pucci: { dmg: 0.68, echo: 2 }, sb_dio: { hp: 1.3, dmg: 0.8, echo: 0 },
    },
  };
  const api = { CFG, enabled: true };
  const U = SBR.util;
  const actOf = () => (SBR.run && SBR.run.act) || 1;
  const baseOf = id => (SBR.ENEMY_BASE && SBR.ENEMY_BASE[id]) || id;
  const tuneOf = u => CFG.tune[u.id + '@' + actOf()] || CFG.tune[u.id] || CFG.tune[baseOf(u.id)] || {};
  const costOf = a => (a.cost != null ? a.cost : a.cd >= 3 ? 2 : a.cd >= 1 ? 1 : 0);

  /* ---------- statuses the director shows ---------- */
  Object.assign(SBR.STATUS, {
    steeled: { name: 'Steeled', glyph: '鋼', color: '#c8c8d8', kind: 'buff', mode: 'turns', desc: () => 'Just shook off a stun. Immune to Spun and Time Stop until this fades.' },
    windup: { name: 'Winding Up', glyph: '溜', color: '#ff5a3a', kind: 'buff', mode: 'turns', desc: () => 'Its next move is telegraphed and hits much harder. Brace or Guard cuts it to a third, Taunt draws a single-target one, and a stun interrupts it.' },
    bossrage: { name: 'Second Wind', glyph: '怒', color: '#c8323c', kind: 'buff', mode: 'turns', desc: () => 'Wounded and furious: deals 15% more damage.', mods: { dmgOut: 1.15 } },
    fury: { name: 'Fury', glyph: '憤', color: '#8a1a2a', kind: 'buff', mode: 'stacks', max: 12, desc: s => `The fight has gone on too long: deals ${Math.round(s * CFG.fury * 100)}% more damage, and more every round.`, permanentCombat: true },
  });
  try {
    const I = SBR.icons, st = I.st, K = I.K;
    const glyph = (c, g) => `<circle cx="24" cy="24" r="18" fill="${c}" ${st}/><text x="24" y="31" font-size="20" text-anchor="middle" font-family="serif" fill="#fff" stroke="${K}" stroke-width="1" paint-order="stroke">${g}</text>`;
    Object.entries({ steeled: ['#6a6a7a', '鋼'], windup: ['#c83a1a', '溜'], bossrage: ['#c8323c', '怒'], fury: ['#5a0a1a', '憤'] }).forEach(([id, [c, g]]) => I.define('status', id, () => glyph(c, g)));
  } catch (e) { /* icons are cosmetic */ }

  /* ---------- counter hints per boss (by base id) ---------- */
  const HINT = {
    blackmore: 'Only Spin reaches him inside the rain.',
    ringo: 'Every third round Mandom rewinds HP: hit him hard right after.',
    valentine1: 'Kill the parallel copies first.',
    lovetrain: 'Only piercing Spin reaches him.',
    diego_world: 'THE WORLD stops time every few rounds.',
    axl: 'Healing Spin and cleanses wash off Guilt.',
    sandman: 'Acting while Sound-stamped hurts: Brace to wait it out.',
    oyecomova: 'Brace to pull a pin before it blows.',
    ferdinand: 'Kill the raptors before they multiply.',
    porkpie: 'Scan him or he hides in the rocks.',
    mikeo: 'Pop the balloons before they come home.',
    saint_lucy: 'Break her guards and her healing stops.',
    sb_pucci: 'Kill him before Acceleration reaches 15.',
    sb_kira: 'Freeze Sheer Heart Attack with Cold to stop Bites the Dust.',
    sb_kars: 'Change damage types between his lives.',
    sb_dio: 'Finish him with Holy or Spin or he gets back up.',
    sb_trex: 'Cold and Holy hurt him; thin the raptors.',
  };
  const hintOf = u => HINT[u.id] || HINT[baseOf(u.id)] || '';

  /* ---------- the Combat subclass: scale and mark bosses ---------- */
  const Base = SBR.Combat;
  SBR.Combat = class extends Base {
    constructor(e, o) {
      super(e, o);
      if (!api.enabled) return;
      const act = actOf(), n = this.party().length;
      const bossFight = !!(this.opts.boss);
      const bosses = this.enemies().filter(u => u.tier === 'boss' && bossFight);
      const lead = bosses.slice().sort((a, b) => b.maxHp - a.maxHp)[0] || null;
      // lineup twists and packs that ride in with the boss share its menace: the lead hits a little softer per extra body
      const crowd = this.enemies().filter(u => u.tier !== 'boss' && !u.btAdd).length;
      bosses.forEach(u => {
        const sup = !!u.def.secret, T = tuneOf(u);
        const hpM = (sup ? 1 : CFG.hpAct[act] || 1) * (1 + CFG.hpPerRider * Math.max(0, n - 3)) * (T.hp || 1);
        u.maxHp = Math.max(1, Math.round(u.maxHp * hpM)); u.hp = u.maxHp;
        u.btPow = (sup ? 1 : CFG.dmgAct[act] || 1) * (1 + CFG.dmgPerRider * Math.max(0, n - 3)) * (T.dmg || 1) * (u === lead ? 1 / (1 + CFG.crowd * crowd) : CFG.second);
        u.bt = { lead: u === lead, sup, turns: 0, intent: null, last: null, phased: false, echo: T.echo != null ? T.echo : null, cap: T.cap || 0 };
        u.init += CFG.init + act + (u === lead ? 2 : 0);
      });
      // elite fights hit harder; elite-tier units (and boss-tier units outside boss fights) are sturdier later in the race
      if (this.opts.elite && !bossFight) this.enemies().forEach(u => {
        const big = u.tier === 'elite' || u.tier === 'boss';
        const m = (CFG.eliteAll[act] || 1) * (big ? CFG.eliteHp[act] || 1 : 1) * (big && tuneOf(u).hp || 1);
        u.maxHp = Math.max(1, Math.round(u.maxHp * m)); u.hp = u.maxHp;
        u.btPow = CFG.eliteDmg[act] || 1;
        if (big) u.init += 3;
      });
      this.btLead = lead;
      // the strongest elite of an elite fight telegraphs its big move too (no presence, cap, second wind or fury)
      if (this.opts.elite && !bossFight) {
        const top = this.enemies().filter(u => u.tier === 'elite').sort((a, b) => b.maxHp - a.maxHp)[0];
        if (top) { top.bt = { lead: true, elite: true, sup: false, turns: 0, intent: null, last: null, phased: true, echo: 0, cap: 0 }; this.btLead = top; }
      }
      const init = uid => { const u = this.unit(uid); return u ? u.init || 0 : 0; };
      this.order.sort((a, b) => init(b) - init(a));
    }
  };
  const P = SBR.Combat.prototype;

  /* ---------- telegraphs ---------- */
  const riders = c => c.alive('party').filter(p => !p.summon);
  function chooseIntent(c, u) {
    const abl = u.xAbilities || u.def.abilities || [];
    const x0 = c.ctx(u, null);
    let cands = abl.filter(a => (a.target === 'enemy' || a.target === 'allEnemies') && !['buff', 'heal'].includes(a.fx) && (!a.cond || safe(() => a.cond(x0))));
    if (!cands.length) return null;
    const score = a => (a.cd || 0) + costOf(a) * 1.5 + (a.target === 'allEnemies' ? 1 : 0) - (a.name === u.bt.last ? 10 : 0) + Math.random();
    if (cands.some(a => a.fx !== 'debuff')) cands = cands.filter(a => a.fx !== 'debuff');
    cands = cands.slice().sort((a, b) => score(b) - score(a));
    const ab = cands[0];
    const aoe = ab.target === 'allEnemies';
    const tgt = aoe ? null : riders(c).slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] || null;
    if (!aoe && !tgt) return null;
    return { name: ab.name, aoe, target: tgt ? tgt.uid : null };
  }
  const safe = (fn, d = false) => { try { return fn(); } catch (e) { return d; } };
  function declare(c, u, why) {
    if (!u.bt || !u.bt.lead || u.dead || c.result) return;
    const it = chooseIntent(c, u);
    if (!it) return;
    u.bt.intent = it;
    c.addStatus(u, 'windup', 0, 999, true);
    const t = it.target && c.unit(it.target);
    const who = u.name.length <= 16 ? u.name : u.name.split(' ')[0];
    const counter = it.aoe ? 'Brace: take a third, keep your Energy · Stun: interrupt · all braced: they’re left Exposed.' : 'Brace/Guard: take a third · Taunt: draw it · Stun: interrupt · answered: they’re left Exposed.';
    const text = it.aoe ? `${who} is winding up ${it.name} on the whole party.` : `${who} is aiming ${it.name} at ${t ? t.name : 'the weakest rider'}.`;
    c.push({ t: 'intent', uid: u.uid, name: it.name, target: it.target, aoe: it.aoe, text, counter, hint: hintOf(u), why: why || null });
    c.push({ t: 'float', uid: u.uid, text: 'WINDING UP', cls: 'debuff big' });
    c.log(`<b>${text}</b> ${counter}`, 'boss');
  }
  function clearIntent(c, u, text) {
    if (!u.bt || !u.bt.intent) return;
    u.bt.last = u.bt.intent.name; u.bt.intent = null;
    if (c.has(u, 'windup')) c.removeStatus(u, 'windup');
    c.push({ t: 'intentClear', uid: u.uid });
    if (text) { c.push({ t: 'float', uid: u.uid, text, cls: 'buff big' }); c.log(`${u.name}'s ${u.bt.last} is ${text === 'INTERRUPTED!' ? 'interrupted' : 'called off'}.`, 'good'); }
  }
  api.declare = declare;

  /** the telegraphed move, forced: enemyAct's second half with a chosen ability and target */
  function forcedAct(c, u) {
    const it = u.bt.intent;
    const abl = u.xAbilities || u.def.abilities || [];
    const ab = abl.find(a => a.name === it.name);
    const x0 = c.ctx(u, null);
    if (!ab || (ab.cond && !safe(() => ab.cond(x0))) || c.has(u, 'disclock')) { clearIntent(c, u, 'CHANGES PLANS'); return false; }
    const idx = abl.indexOf(ab);
    if (ab.cd) u.cds['a' + idx] = ab.cd + 1;
    u.energy = Math.max(0, (u.energy || 0) - costOf(ab));
    let target = null;
    if (ab.target === 'enemy') {
      const T = c.alive('party').filter(p => c.has(p, 'taunt'));
      const want = it.target && c.unit(it.target);
      target = T.length ? U.pick(T) : want && !want.dead && !want.removed ? want : c.pickPartyTarget();
      if (T.length && want && !T.includes(want)) c.push({ t: 'float', uid: target.uid, text: 'TAUNTED IT!', cls: 'buff big' });
    }
    clearIntent(c, u, null);
    const tl = ab.target === 'allEnemies' ? c.alive('party').map(t => t.uid) : target ? [target.uid] : [];
    c.push({ t: 'act', uid: u.uid, name: ab.name, fx: ab.fx, targets: tl, enemy: true, special: true, cost: Math.max(2, costOf(ab)), intent: true });
    if (!c.preAction(u)) { c.endTurn(u); return true; }
    if (c.has(u, 'raptor')) target = c.pickPartyTarget();
    const ch = c._charge = { src: u, mult: ab.target === 'allEnemies' ? CFG.aoe : CFG.single, aoe: ab.target === 'allEnemies', hits: 0, guarded: 0 };
    try { c.runPicked(u, ab, 1, target, null); } finally { c._charge = null; }
    // answered in full (every rider it reached had braced): the boss overreaches and is left open
    if (ch.hits && ch.guarded >= ch.hits && !u.dead) stagger(c, u);
    c.endTurn(u);
    return true;
  }

  function stagger(c, u) {
    c.addStatus(u, 'vuln', 0, CFG.stagger, true);
    c.push({ t: 'status', uid: u.uid, id: 'vuln', kind: 'debuff' });
    c.push({ t: 'float', uid: u.uid, text: 'STAGGERED!', cls: 'buff big' });
    c.log(`${u.name} overreaches and is left wide open (Exposed).`, 'good');
  }
  const enemyAct = P.enemyAct;
  P.enemyAct = function (u, free = false) {
    if (!u.bt || !u.bt.lead || free) return enemyAct.call(this, u, free);
    if (u.bt.intent && forcedAct(this, u)) { u.bt.turns = 0; return; }
    enemyAct.call(this, u, free);
    u.bt.turns++;
    const cadence = actOf() >= 3 && !u.bt.sup && !u.bt.elite ? 1 : 2;
    if (!this.result && !u.dead && u.bt.turns >= cadence) { u.bt.turns = 0; declare(this, u); }
  };

  /* ---------- turn flow: presence, interrupts, fury ---------- */
  const startRound = P.startRound;
  P.startRound = function () {
    const lead = this.btLead;
    if (lead && lead.bt && !lead.dead && this.round >= 1 && !this.result) {
      const n = this.party().length;
      const base = n >= 4 ? 1 : n === 3 ? 2 : 0;
      const every = lead.bt.echo == null ? base : lead.bt.echo && base ? Math.max(base, lead.bt.echo) : 0;
      const frozen = this.has(lead, 'stun') || this.has(lead, 'timestop');
      const ambush = this.bonus.ambush && this.round <= 1;
      if (every && this.round % every === 0 && !frozen && !ambush && riders(this).length) {
        this.push({ t: 'turn', uid: lead.uid });
        this.push({ t: 'float', uid: lead.uid, text: 'OVERWHELMING PRESENCE', cls: 'debuff big' });
        this.enemyAct(lead, true);
        this.push({ t: 'endTurn', uid: lead.uid });
      }
    }
    if (this.result) return;
    startRound.call(this);
    if (!lead || !lead.bt || lead.dead || this.result) return;
    // the opener: the fight starts with a telegraph, so the first big hit is always readable
    if (this.round === 1 && !lead.bt.intent) declare(this, lead, 'opener');
    const at = lead.bt.sup ? CFG.furyAtSuper : CFG.furyAt;
    if (this.round === at - 2 && !lead.bt.elite) { this.push({ t: 'float', uid: lead.uid, text: 'LOSING PATIENCE', cls: 'debuff big' }); this.log(`${lead.name} is losing patience. In two rounds they start to rage.`, 'boss'); }
    if (this.round >= at && !lead.bt.elite) this.enemies().filter(e => e.bt).forEach(e => this.addStatus(e, 'fury', 1, 0, e !== lead));
  };

  const beginTurn = P.beginTurn;
  P.beginTurn = function (u) {
    const frozen = !!(u.bt && u.bt.intent && (this.has(u, 'stun') || this.has(u, 'timestop') || (this.bonus.ambush && this.round <= 1)));
    const res = beginTurn.call(this, u);
    // the stun has already been spent by the time the turn is skipped, so check it before
    if (frozen && res && res.skip && !u.dead && u.bt.intent) { clearIntent(this, u, 'INTERRUPTED!'); stagger(this, u); }
    return res;
  };

  /* ---------- stun resistance, hole cap ---------- */
  const addStatus = P.addStatus;
  P.addStatus = function (t, id, stacks = 0, turns = 0, silent = false) {
    if (t && t.bt && !t.dead && (id === 'stun' || id === 'timestop')) {
      if (this.has(t, 'steeled')) { this.push({ t: 'float', uid: t.uid, text: 'STEELED', cls: 'block big' }); return; }
      const r = addStatus.call(this, t, id, stacks, turns, silent);
      if (this.has(t, id)) addStatus.call(this, t, 'steeled', 0, 3, true);
      return r;
    }
    const r = addStatus.call(this, t, id, stacks, turns, silent);
    if (t && t.bt && !t.bt.elite && id === 'holed') { const s = this.st(t, 'holed'); if (s && s.stacks > CFG.holes) s.stacks = CFG.holes; }
    return r;
  };

  /* ---------- damage: boss power, telegraph power, counters ---------- */
  const damage = P.damage;
  P.damage = function (src, tgt, base, scale, opts = {}, ability = null) {
    const ch = this._charge;
    let guarded = false;
    if (src && src.btPow) base *= src.btPow * (1 + CFG.fury * this.stacks(src, 'fury'));
    // bosses pay the small fry little mind: party summons hit them softer
    if (src && src.summon && tgt && tgt.bt && !tgt.bt.elite) base *= CFG.summonVsBoss;
    if (ch && src === ch.src && tgt && tgt.side === 'party') {
      base *= ch.mult;
      if (!tgt.summon) ch.hits++;
      if (this.has(tgt, 'guard')) { guarded = true; if (!tgt.summon) ch.guarded++; base *= CFG.braced; this.push({ t: 'float', uid: tgt.uid, text: 'BRACED', cls: 'buff' }); }
    }
    const r = damage.call(this, src, tgt, base, scale, opts, ability);
    if (ch && src === ch.src && ch.aoe && tgt && tgt.side === 'party' && !tgt.summon && !guarded && r && r.hit && !tgt.dead && (tgt.energy || 0) > 0) {
      tgt.energy--; this.push({ t: 'float', uid: tgt.uid, text: '-1 ENERGY', cls: 'debuff' });
    }
    return r;
  };

  const applyHp = P.applyHp;
  P.applyHp = function (tgt, amount, crit, label, src, blocked, info) {
    if (tgt && tgt.bt && !tgt.bt.elite && src && src.side === 'party' && amount > 0) {
      const cap = Math.max(4, Math.round(tgt.maxHp * (tgt.bt.cap || (tgt.bt.sup ? CFG.capSuper : CFG.cap))));
      if (amount > cap) { amount = cap; this.push({ t: 'float', uid: tgt.uid, text: 'WITHSTOOD', cls: 'block' }); }
    }
    const r = applyHp.call(this, tgt, amount, crit, label, src, blocked, info);
    // second wind at half HP (Strange Auras have their own phases)
    if (tgt && tgt.bt && tgt.bt.lead && !tgt.bt.sup && !tgt.bt.phased && !tgt.dead && tgt.hp > 0 && tgt.hp < tgt.maxHp * 0.5 && !this.result) {
      tgt.bt.phased = true;
      this.cleanse(tgt, 99);
      this.addStatus(tgt, 'shield', Math.round(tgt.maxHp * 0.05));
      this.addStatus(tgt, 'bossrage', 0, 999);
      this.push({ t: 'float', uid: tgt.uid, text: 'SECOND WIND!', cls: 'debuff big' });
      this.log(`${tgt.name} catches a second wind: debuffs gone, a shield up, and angrier.`, 'boss');
      if (!tgt.bt.intent) declare(this, tgt, 'phase');
    }
    return r;
  };

  // whatever the boss called onto the field scatters when the boss truly falls
  const summon = P.summon;
  P.summon = function (id) { const u = summon.call(this, id); if (u && (this.opts.boss || this.opts.elite)) u.btAdd = true; return u; };
  const onDeath = P.onDeath;
  P.onDeath = function (u, src) {
    const r = onDeath.call(this, u, src);
    if (u.bt && u.dead && u.bt.intent) clearIntent(this, u, null);
    if (u.dead && u === this.btLead && !this.result) {
      const adds = this.enemies().filter(e => e.btAdd && !e.dead);
      if (adds.length) { this.log(`With ${u.name} gone, the rest scatter.`, 'good'); adds.forEach(e => { this.push({ t: 'float', uid: e.uid, text: 'FLEES', cls: 'miss' }); this.kill(e); }); }
    }
    return r;
  };

  return api;
})();
