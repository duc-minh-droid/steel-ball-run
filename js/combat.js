/* Combat engine: pure state + event log. The battle UI replays events as animations. */
'use strict';

SBR.Combat = class Combat {
  constructor(enemyIds, opts = {}) {
    const U = SBR.util;
    this.opts = opts;
    this.events = [];
    this.units = [];
    this.round = 0;
    this.turnIdx = -1;
    this.order = [];
    this.flags = {};
    this.snaps = {};
    this.loot = { xp: 0, money: 0 };
    this.result = null;
    this.bonus = SBR.bonus();
    this.firstAttackDone = false;
    this.stitchUsed = false;
    this.maxHit = 0;

    const run = SBR.run;
    run.party.forEach(m => { if (m.hp > 0 || true) this.units.push(this.makePartyUnit(m)); });
    const partySize = this.party().length;
    // every rider you bring makes the other side tougher: ~0.9x alone, ~1.7x with four, ~2x with five
    this.partySize = partySize;
    this.hpScale = 0.62 + 0.28 * partySize;
    enemyIds.forEach(id => this.units.push(this.makeEnemyUnit(id)));
    if (SBR.applyTraits) SBR.applyTraits(this, opts);

    // initiative
    this.units.forEach(u => { u.init = this.rollInit(u); });
    this.order = this.units.slice().sort((a, b) => b.init - a.init || (a.side === 'party' ? -1 : 1)).map(u => u.uid);

    // combat-start effects
    const b = this.bonus;
    this.party().forEach(u => {
      u.energy = Math.min(u.maxEnergy, 1 + (b.energyStart || 0) + this.eq(u, 'energyStart'));
      if (u.id === 'gyro') this.addStatus(u, 'rotation', 1 + (b.rotationStart || 0), 0, true);
      if (b.guardStart) this.addStatus(u, 'guard', 0, b.guardStart + 1, true);
      if (b.shieldStart) this.addStatus(u, 'shield', b.shieldStart, 0, true);
      if (b.palm) this.addStatus(u, U.pick(['empower', 'evasive', 'lucky', 'regen', 'guard']), 0, 2, true);
    });
    this.enemies().forEach(u => { const h = u.def.hooks; if (h && h.start) h.start(this.ctx(u, null)); });
    this.applyStoryFlags();
    this.events = []; // setup events are not animated
  }

  /** Choices made on the road change how certain battles begin */
  applyStoryFlags() {
    const f = SBR.run.flags, ids = this.enemies().map(e => e.id), P = this.party();
    const note = t => { this.storyNotes = (this.storyNotes || []).concat(t); };
    const any = list => list.some(i => ids.includes(i));
    if (f.boomWarning && any(['benjamin'])) { P.forEach(u => this.addStatus(u, 'guard', 0, 2, true)); this.enemies().forEach(e => this.addStatus(e, 'vuln', 0, 2, true)); note('The prospector warned you about the magnets.'); }
    if (f.silentWarning && any(['sandman'])) { P.forEach(u => this.addStatus(u, 'calm', 0, 3, true)); note('The scout\'s warning: do not touch what speaks.'); }
    if (f.agentOrders && any(['agent', 'vguard', 'soldier'])) { this.enemies().forEach(e => this.addStatus(e, 'stun', 0, 1, true)); note('You know their orders. They\'re caught off guard.'); }
    if (f.presidentPlan && any(['valentine1', 'lovetrain'])) { P.forEach(u => this.addStatus(u, 'secondwind', 0, 3, true)); note('You know what the President wants.'); }
    if (f.corpseVision && any(['ferdinand', 'lovetrain', 'diego_world'])) { P.filter(u => u.id === 'johnny').forEach(u => this.addStatus(u, 'goldenheart', 0, 3, true)); note('The Saint\'s vision guides Johnny.'); }
    if (f.savedNun && any(['diego_world', 'lovetrain'])) { P.forEach(u => this.addStatus(u, 'regen', 0, 3, true)); note('The nun you saved is praying for you.'); }
    const tier = SBR.threatTier ? SBR.threatTier() : 0;
    const boss = this.enemies().find(e => e.tier === 'boss');
    if (boss && tier >= 2) { boss.energy += 1; this.addStatus(boss, 'guard', 0, 2, true); note(`You are ${SBR.THREAT_TIERS[tier].name}. ${boss.name} was expecting you.`); }
    if (boss && tier >= 3 && this.opts.boss) { this.addStatus(boss, 'empower', 0, 2, true); this.enemies().filter(e => e !== boss).forEach(e => this.addStatus(e, 'shield', 8, 0, true)); }
    if (SBR.campaignFightFlags) SBR.campaignFightFlags(this, note, any, P);
    if (f.scoutEnemy && any(['sandman'])) { this.enemies().forEach(e => this.addStatus(e, 'empower', 0, 3, true)); note('Sandman heard what you did to his people.'); }
  }

  /* ---------- unit factories ---------- */
  makePartyUnit(m) {
    const def = SBR.CHARS[m.id];
    const b = this.bonus || SBR.bonus();
    const stats = Object.assign({}, m.stats);
    const eb = SBR.equipBonus(m);
    for (const k in eb.stats) stats[k] = (stats[k] || 0) + eb.stats[k];
    if (m.id === 'johnny' && b.johnnyAll) for (const k in stats) stats[k] += b.johnnyAll;
    if (m.id === (SBR.run.lead || 'johnny') && SBR.HORSES[SBR.run.horse].bonus.ride) stats.ride += SBR.HORSES[SBR.run.horse].bonus.ride;
    const exh = m.exhaustion || 0;
    const maxHp = Math.max(1, Math.round(m.maxHp * (1 - 0.15 * exh)));
    return {
      uid: SBR.util.uid('p'), id: m.id, name: def.short, fullName: def.name, side: 'party', ref: m, def,
      art: { kind: 'portrait', key: def.portrait }, stats, maxHp, hp: Math.min(m.hp, maxHp), energy: 2, maxEnergy: 6,
      cds: {}, statuses: [], dead: m.hp <= 0, exhaustion: exh, eqb: eb.bonus, baseRes: SBR.memberRes ? SBR.memberRes(m) : (SBR.HORSES[SBR.run.horse].res || {}), abilities: SBR.game.memberAbilities(m), upgrades: m.upgrades || {},
    };
  }
  makeEnemyUnit(id) {
    const def = SBR.ENEMIES[id];
    const maxHp = Math.round(def.hp * (this.hpScale || 1));
    SBR.meta.seen.enemies[id] = true;
    return {
      uid: SBR.util.uid('e'), id, name: def.name, side: 'enemy', def, art: def.art,
      stats: Object.assign({ spin: 0, aim: 0, grit: 0, ride: 0, res: 0, luck: 0 }, def.stats),
      maxHp, hp: maxHp, cds: {}, statuses: [], dead: false, baseRes: Object.assign({}, def.res), tier: def.tier || 'mob', energy: def.tier === 'boss' ? 2 : 1, maxEnergy: 6,
    };
  }

  /* ---------- queries ---------- */
  /** the riders only: summons fight on the party side but are never party members (HP/XP sync, revives, game over) */
  party() { return this.units.filter(u => u.side === 'party' && !u.removed && !u.summon); }
  summons(owner) { return this.units.filter(u => u.summon && !u.dead && !u.removed && (!owner || u.owner === owner.uid)); }
  enemies() { return this.units.filter(u => u.side === 'enemy' && !u.dead); }
  alive(side) { return this.units.filter(u => u.side === side && !u.dead && !u.removed); }
  unit(uid) { return this.units.find(u => u.uid === uid); }
  foes(u) { return this.alive(u.side === 'party' ? 'enemy' : 'party'); }
  friends(u) { return this.alive(u.side); }
  st(u, id) { return u.statuses.find(s => s.id === id); }
  has(u, id) { return !!this.st(u, id); }
  stacks(u, id) { const s = this.st(u, id); return s ? s.stacks : 0; }
  current() { return this.unit(this.order[this.turnIdx]); }

  eq(u, k) { return (u.eqb && u.eqb[k]) || 0; }

  /* ---------- damage types ---------- */
  dtypeOf(src, ability, opts, tags) {
    if (opts.dtype) return opts.dtype;
    if (ability && ability.dtype) return ability.dtype;
    if (tags.includes('spin')) return 'spin';
    if (tags.includes('gun')) return 'bullet';
    const fx = ability && ability.fx;
    if (fx === 'gun' || fx === 'nail') return 'bullet';
    if (['ball', 'golden', 'ballbreaker', 'wormhole'].includes(fx)) return 'spin';
    if (fx === 'sound') return 'sound';
    if (fx === 'rain') return 'cold';
    if (src && src.def && src.def.dtype && src.side === 'enemy') return src.def.dtype;
    if (tags.includes('stand')) return 'stand';
    return 'phys';
  }
  /** all resistances on a unit: innate (enemy def / horse), equipment, statuses */
  resOf(u) {
    const r = {};
    const add = o => { if (o) for (const k in o) r[k] = (r[k] || 0) + o[k]; };
    add(u.baseRes);
    if (u.side === 'party') { add(u.eqb && u.eqb.res); add(this.bonus && this.bonus.res); }
    for (const s of u.statuses) { const d = SBR.STATUS[s.id]; if (d && d.res) add(d.res); }
    return r;
  }
  resMult(u, type) {
    if (type === 'true') return 1;
    return Math.max(0, 1 + (this.resOf(u)[type] || 0));
  }
  /** attacker's bonus for a damage type (party only) */
  typeBonus(src, type) {
    if (!src || src.side !== 'party') return 1;
    const b = this.bonus;
    let v = (b[type + 'Dmg'] || 0) + this.eq(src, type + 'Dmg');
    if (type === 'bullet') v += (b.gunDmg || 0) + this.eq(src, 'gunDmg');
    if (type === 'spin') v += this.stacks(src, 'rotation') * 0.08;
    return 1 + v;
  }
  /** damage-over-time and other sourceless damage still respects resistances */
  typedHp(u, amount, type, label) {
    const m = this.resMult(u, type);
    if (m <= 0) { this.push({ t: 'float', uid: u.uid, text: 'IMMUNE', cls: 'block' }); return; }
    this.applyHp(u, Math.max(1, Math.round(amount * m)), false, label, null, false, { dtype: type, eff: m });
  }
  /* ---------- derived stats ---------- */
  statMod(u, key, mode = 'add') {
    let v = mode === 'mul' ? 1 : 0;
    for (const s of u.statuses) {
      const d = SBR.STATUS[s.id];
      if (!d.mods) continue;
      if (key === 'dodge' && d.mods.dodgePer) v += d.mods.dodgePer * s.stacks;
      if (d.mods[key] === undefined) continue;
      if (mode === 'mul') v *= d.mods[key]; else v += d.mods[key];
    }
    return v;
  }
  dodgeChance(u) {
    if (this.has(u, 'marked') || this.has(u, 'stun') || this.has(u, 'timestop')) return 0;
    if (u.summon) return SBR.util.clamp((u.def.dodge || 0.03) + this.statMod(u, 'dodge'), 0, 0.6);
    let d = 0.04 + u.stats.ride * 0.006 + this.statMod(u, 'dodge');
    if (u.side === 'party') {
      d += (this.bonus.dodge || 0) + this.eq(u, 'dodge');
      if (u.id === 'johnny') d += 0.08;
      if (u.id === (SBR.run.lead || 'johnny')) d += SBR.HORSES[SBR.run.horse].bonus.dodge || 0;
      if (u.id === 'diego') d += 0.15;
    }
    return SBR.util.clamp(d, 0, 0.6);
  }
  blockChance(u) {
    if (u.id === 'johnny') return 0;
    if (u.summon) return SBR.util.clamp((u.def.block || 0.05) + this.statMod(u, 'block'), 0, 0.75);
    let b = 0.05 + u.stats.grit * 0.006 + this.statMod(u, 'block');
    if (u.side === 'party') { b += (this.bonus.block || 0) + this.eq(u, 'block'); if (u.id === 'mountaintim') b += 0.1; }
    return SBR.util.clamp(b, 0, 0.75);
  }
  blockDR(u) { return SBR.util.clamp(0.35 + u.stats.grit * 0.008, 0, 0.7); }
  critChance(u) {
    let c = 0.05 + u.stats.aim * 0.005 + u.stats.luck * 0.006 + this.statMod(u, 'crit');
    if (u.side === 'party') { c += (this.bonus.crit || 0) + this.eq(u, 'crit'); if (u.id === 'pocoloco') c += 0.1; }
    return c;
  }
  critDmg(u) { return 1.5 + u.stats.spin * 0.008 + u.stats.luck * 0.005 + (u.side === 'party' ? (this.bonus.critDmg || 0) + this.eq(u, 'critDmg') : 0); }
  rollInit(u) {
    let i = SBR.util.randInt(1, 10) + Math.floor(u.stats.ride / 2);
    if (u.side === 'party') { i += (this.bonus.init || 0) + this.eq(u, 'init'); if (u.id === 'diego') i += 3; }
    return i;
  }

  /* ---------- events ---------- */
  push(e) { this.events.push(e); return e; }
  flush() { const e = this.events; this.events = []; return e; }
  log(text, kind = '') { this.push({ t: 'log', text, kind }); }

  /* ---------- core mechanics ---------- */
  addStatus(t, id, stacks = 0, turns = 0, silent = false) {
    if (!t || t.dead) return;
    const d = SBR.STATUS[id];
    if (!d) return;
    if (t.side === 'party' && d.kind === 'debuff') {
      if ((this.bonus.immune || []).concat((t.eqb && t.eqb.immune) || []).includes(id)) return this.push({ t: 'float', uid: t.uid, text: 'IMMUNE', cls: 'buff' });
      if (id === 'fossil' && t.id === 'johnny' && this.bonus.fossilImmune) return this.push({ t: 'float', uid: t.uid, text: 'SAINT\'S ARM', cls: 'buff' });
      if (t.id === 'pocoloco' && Math.random() < 0.15) return this.push({ t: 'float', uid: t.uid, text: 'LUCKY!', cls: 'buff' });
    }
    let s = this.st(t, id);
    if (!s) { s = { id, stacks: 0, turns: 0 }; t.statuses.push(s); }
    if (d.mode === 'stacks') s.stacks = Math.min(d.max || 99, s.stacks + Math.max(1, stacks));
    if (turns) s.turns = Math.max(s.turns, turns);
    if (d.mode === 'turns' && !turns) s.turns = Math.max(s.turns, stacks || 1);
    if (!silent) this.push({ t: 'status', uid: t.uid, id, kind: d.kind });
    if (id === 'fossil' && s.stacks >= 5) {
      this.removeStatus(t, 'fossil');
      this.addStatus(t, 'raptor', 0, 2);
      this.push({ t: 'float', uid: t.uid, text: 'DINOSAURIFIED!', cls: 'debuff big' });
    }
  }
  removeStatus(t, id) { t.statuses = t.statuses.filter(s => s.id !== id); this.push({ t: 'statusGone', uid: t.uid, id }); }
  cleanse(t, n = 1) {
    let removed = 0;
    for (const s of t.statuses.slice()) {
      const d = SBR.STATUS[s.id];
      if (d.kind === 'debuff' && !d.permanent && removed < n) { this.removeStatus(t, s.id); removed++; }
    }
    if (removed) this.push({ t: 'float', uid: t.uid, text: 'CLEANSED', cls: 'buff' });
  }

  scaleVal(u, base, scale = {}) {
    let v = base;
    let m = 1;
    for (const [k, s] of Object.entries(scale || {})) m += (u.stats[k] || 0) * s;
    return v * m;
  }

  damage(src, tgt, base, scale, opts = {}, ability = null) {
    if (!tgt || tgt.dead) return { hit: false };
    const tags = opts.tags || (ability && ability.tags) || [];
    const pierce = opts.pierce || (ability && ability.pierce && opts.pierce !== false);
    let raw = src ? this.scaleVal(src, base, scale) : base;
    const dtype = this.dtypeOf(src, ability, opts, tags);
    let mult = this.typeBonus(src, dtype);
    if (src) {
      mult *= this.statMod(src, 'dmgOut', 'mul');
      if (src.side === 'party') {
        const b = this.bonus;
        mult *= 1 + (b.dmg || 0) + this.eq(src, 'dmg');
        if (this.eq(src, 'executeBonus') && tgt.hp / tgt.maxHp < 0.35) mult *= 1 + this.eq(src, 'executeBonus');
        mult *= 1 - 0.15 * (src.exhaustion || 0);
      }
      // miss from blindness
      const miss = this.statMod(src, 'miss');
      if (miss && Math.random() < miss) { this.push({ t: 'float', uid: tgt.uid, text: 'MISS', cls: 'miss' }); return { hit: false }; }
    }
    mult *= this.statMod(tgt, 'dmgIn', 'mul');
    if (tgt.side === 'party' && tgt.id === 'wekapipo') mult *= 0.9;

    if (src && this.has(src, 'crimson')) { opts = Object.assign({}, opts, { noDodge: true, forceCrit: true }); this.removeStatus(src, 'crimson'); }
    if (src && this.has(tgt, 'epitaph')) { this.removeStatus(tgt, 'epitaph'); this.push({ t: 'float', uid: tgt.uid, text: 'EPITAPH', cls: 'miss' }); return { hit: false, dodged: true }; }
    // dodge
    if (src && !opts.noDodge && Math.random() < this.dodgeChance(tgt)) {
      this.push({ t: 'float', uid: tgt.uid, text: 'DODGE', cls: 'miss' });
      return { hit: false, dodged: true };
    }
    // stand defences
    if (this.has(tgt, 'rainveil')) {
      if (!tags.includes('spin') && !pierce) { this.push({ t: 'float', uid: tgt.uid, text: 'RAIN VEIL', cls: 'block' }); return { hit: false }; }
      this.removeStatus(tgt, 'rainveil');
      this.push({ t: 'float', uid: tgt.uid, text: 'RAIN EVAPORATES!', cls: 'buff big' });
    }
    let crit = false;
    if (src && !opts.noCrit) {
      let cc = this.critChance(src) + (this.has(tgt, 'marked') ? 0.2 : 0);
      if (src.side === 'party' && this.bonus.firstCrit && !this.firstAttackDone) cc = 1;
      crit = opts.forceCrit || Math.random() < cc;
    }
    if (src && src.side === 'party') this.firstAttackDone = true;
    let amount = raw * mult * (crit ? this.critDmg(src) : 1);

    if (this.has(tgt, 'invuln') && !pierce) {
      if (tgt.id === 'lovetrain') {
        const victims = this.alive('party');
        const v = SBR.util.pick(victims);
        this.push({ t: 'float', uid: tgt.uid, text: 'REDIRECTED', cls: 'block' });
        if (v) {
          const mis = Math.max(1, Math.round(amount * 0.3));
          this.push({ t: 'float', uid: v.uid, text: 'MISFORTUNE', cls: 'debuff' });
          this.applyHp(v, mis, false, 'misfortune', null);
        }
      } else this.push({ t: 'float', uid: tgt.uid, text: 'NO EFFECT', cls: 'block' });
      return { hit: false };
    }
    let blocked = false;
    if (src && !pierce && Math.random() < this.blockChance(tgt)) { blocked = true; amount *= 1 - this.blockDR(tgt); }

    // Tattoo You phasing
    if (this.has(tgt, 'phase') && Math.random() < 0.5) {
      const others = this.friends(tgt).filter(o => o !== tgt && this.has(o, 'phase'));
      if (others.length) {
        const o = SBR.util.pick(others);
        this.push({ t: 'float', uid: tgt.uid, text: 'PHASED', cls: 'miss' });
        tgt = o;
      }
    }
    // D4C: another Valentine steps in from a parallel world
    if (tgt.id === 'valentine1' && !pierce) {
      const copy = this.friends(tgt).find(o => o.id === 'parallel');
      if (copy && Math.random() < 0.5) { this.push({ t: 'float', uid: tgt.uid, text: 'DOJYAAAN~', cls: 'block' }); tgt = copy; }
    }
    // damage type vs resistances (after redirects, so the unit that actually takes the hit decides)
    let eff = this.resMult(tgt, dtype);
    if (dtype === 'holy' && tgt.def && tgt.def.undead) eff *= 2;
    if (eff <= 0) { this.push({ t: 'float', uid: tgt.uid, text: 'IMMUNE', cls: 'block' }); this.push({ t: 'resist', uid: tgt.uid, dtype, eff: 0 }); return { hit: false, immune: true }; }
    amount *= eff;
    amount = Math.max(1, Math.round(amount));
    if (src && this.has(tgt, 'reflect') && src !== tgt) { const back = Math.max(1, Math.round(amount * 0.4)); this.push({ t: 'float', uid: tgt.uid, text: 'REFLECTED', cls: 'block' }); this.applyHp(src, back, false, 'GRID', null); }
    const res = this.applyHp(tgt, amount, crit, opts.label, src, blocked, { dtype, eff });
    // notoriety: big hits draw eyes, taking hits makes you look like less of a threat
    if (src && src.side === 'party' && src !== tgt) this.notoriety(src, SBR.util.clamp(amount / 40, 0.02, 0.35));
    if (src && tgt.side === 'party' && src.side !== 'party') this.notoriety(tgt, -0.08);
    if (src && src.side === 'party' && this.eq(src, 'lifesteal') && !src.dead) this.heal(null, src, Math.max(1, Math.round(amount * this.eq(src, 'lifesteal'))));
    if (SBR.traitHooks && (src && src.traits || tgt.traits)) SBR.traitHooks.hit(this, src, tgt);
    // magnet share
    if (this.has(tgt, 'magnet') && !opts.noShare) {
      this.friends(tgt).filter(o => o !== tgt && this.has(o, 'magnet')).forEach(o => this.applyHp(o, Math.max(1, Math.round(amount * 0.4)), false, 'MAGNET', src));
    }
    if (src && src.side === 'party' && amount >= 40) SBR.game.achieve('crit_big');
    this.maxHit = Math.max(this.maxHit, src && src.side === 'party' ? amount : 0);
    return Object.assign({ hit: true, crit, blocked }, res);
  }

  applyHp(tgt, amount, crit, label, src, blocked, info) {
    const sh = this.st(tgt, 'shield');
    let absorbed = 0;
    if (sh) {
      absorbed = Math.min(sh.stacks, amount);
      sh.stacks -= absorbed; amount -= absorbed;
      if (sh.stacks <= 0) this.removeStatus(tgt, 'shield');
    }
    tgt.hp = Math.max(0, tgt.hp - amount);
    this.push({ t: 'dmg', uid: tgt.uid, amount, absorbed, crit, blocked, label, hp: tgt.hp, src: src && src.uid, dtype: info && info.dtype, eff: info && info.eff });
    if (tgt.side === 'enemy' && tgt.def.hooks && tgt.def.hooks.damaged && tgt.hp > 0) tgt.def.hooks.damaged(this.ctx(tgt, null));
    if (tgt.hp <= 0) this.onDeath(tgt, src);
    return { amount };
  }

  heal(src, tgt, base, scale) {
    if (!tgt || tgt.dead) return 0;
    let amt = src ? this.scaleVal(src, base, scale) : base;
    if (src && src.side === 'party') { amt *= 1 + (this.bonus.heal || 0) + this.eq(src, 'heal'); if (src.id === 'hotpants') amt *= 1.2; amt *= 1 - 0.15 * (src.exhaustion || 0); }
    amt = Math.round(amt);
    const before = tgt.hp;
    tgt.hp = Math.min(tgt.maxHp, tgt.hp + amt);
    this.push({ t: 'heal', uid: tgt.uid, amount: tgt.hp - before, hp: tgt.hp });
    if (src && src.side === 'party' && tgt.hp > before) this.notoriety(src, Math.min(0.2, (tgt.hp - before) / 60));
    return tgt.hp - before;
  }

  onDeath(u, src) {
    if (u.dead) return;
    if (u.side === 'enemy') {
      const h = u.def.hooks;
      if (h && h.death) { const prevented = h.death(this.ctx(u, null)); if (prevented && u.hp > 0) return; }
      u.dead = true;
      const lm = u.lootMul || 1;
      this.loot.xp += Math.round((u.def.xp || 0) * lm);
      const [a, b] = u.def.money || [0, 0];
      const C = SBR.curCondition && SBR.curCondition();
      this.loot.money += Math.round(SBR.util.randInt(a, b) * lm * (C && C.eliteMoney && (this.opts.elite || this.opts.boss) ? C.eliteMoney : 1));
      if (SBR.traitHooks) SBR.traitHooks.death(this, u);
      SBR.meta.stats.kills++;
      this.push({ t: 'death', uid: u.uid });
    } else if (u.summon) {
      // summons just break apart: never a party death, never a revive target
      const h = u.def.onDeath;
      this.dismissSummon(u, null);
      if (h) h(this.ctx(u, src && !src.dead ? src : null), src);
      return;
    } else {
      if (this.eq(u, 'selfRewind') && !u.rewound) {
        u.rewound = true;
        u.hp = Math.ceil(u.maxHp * 0.4);
        this.push({ t: 'fx', kind: 'rewind', uid: u.uid });
        this.push({ t: 'float', uid: u.uid, text: 'MANDOM!', cls: 'buff big' });
        this.push({ t: 'revive', uid: u.uid, hp: u.hp });
        return;
      }
      if (this.has(u, 'bitesdust')) {
        u.statuses = u.statuses.filter(s => s.id !== 'bitesdust');
        u.hp = Math.ceil(u.maxHp * 0.5);
        this.push({ t: 'fx', kind: 'rewind', uid: u.uid });
        this.push({ t: 'float', uid: u.uid, text: 'BITES THE DUST!', cls: 'buff big' });
        this.push({ t: 'revive', uid: u.uid, hp: u.hp });
        return;
      }
      if ((this.bonus.stitch) && !this.stitchUsed) {
        this.stitchUsed = true;
        u.hp = Math.ceil(u.maxHp * 0.28);
        this.push({ t: 'float', uid: u.uid, text: 'STITCHED BACK!', cls: 'buff big' });
        this.push({ t: 'revive', uid: u.uid, hp: u.hp });
        return;
      }
      u.dead = true;
      u.statuses = [];
      this.push({ t: 'death', uid: u.uid });
      this.summons(u).forEach(s => this.dismissSummon(s, 'GONE'));
    }
    this.checkEnd();
  }

  revive(u, pct) {
    if (!u) return;
    u.dead = false;
    u.hp = Math.max(1, Math.ceil(u.maxHp * pct));
    if (u.side === 'enemy') u.statuses = u.statuses.filter(s => SBR.STATUS[s.id].kind === 'buff');
    this.push({ t: 'revive', uid: u.uid, hp: u.hp });
  }

  checkEnd() {
    if (this.result) return;
    if (!this.alive('enemy').length) this.result = 'win';
    else if (!this.alive('party').some(p => !p.summon)) {
      if (this.bonus.dojyaan && !SBR.run.dojyaanUsed) {
        SBR.run.dojyaanUsed = true;
        this.push({ t: 'banner', text: 'DOJYAAAN~', sub: 'A parallel you steps in.' });
        this.party().filter(u => !u.removed).forEach(u => this.revive(u, 0.5));
      } else this.result = 'lose';
    }
  }

  /* ---------- turn flow ---------- */
  nextTurn() {
    if (this.result) return null;
    for (let guard = 0; guard < 200; guard++) {
      this.turnIdx++;
      if (this.turnIdx >= this.order.length || this.turnIdx === 0 && this.round === 0) {
        if (this.turnIdx >= this.order.length) this.turnIdx = 0;
        this.startRound();
        if (this.result) return null;
      }
      const u = this.unit(this.order[this.turnIdx]);
      if (u && !u.dead && !u.removed) return u;
    }
    return null;
  }
  startRound() {
    this.round++;
    this.push({ t: 'round', round: this.round });
    const mid = this.opts.midRound && this.opts.midRound[this.round];
    if (mid) {
      this.push({ t: 'dialogue', id: mid });
      const flag = { tusk_awaken: 'tusk1', tusk2_awaken: 'tusk2' }[mid];
      if (flag && this.party().some(p => p.id === 'johnny')) this.unlockFlag(flag);
    }
    this.enemies().forEach(u => { const h = u.def.hooks; if (h && h.roundStart) h.roundStart(this.ctx(u, null)); });
    { const C = SBR.curCondition && SBR.curCondition(); const sun = this.opts.hazard === 'heat' || (C && ['drought', 'sandstorm'].includes(SBR.run.conditions[SBR.run.act])); if (sun) this.alive('party').filter(u => this.eq(u, 'sunburn') > 0).forEach(u => { this.push({ t: 'float', uid: u.uid, text: 'SUNLIGHT', cls: 'debuff' }); this.typedHp(u, Math.max(2, Math.round(u.maxHp * 0.03)), 'holy', 'SUN'); }); }
    const hz = this.opts.hazard && SBR.HAZARDS && SBR.HAZARDS[this.opts.hazard];
    if (hz) { if (this.round === 1) this.log(`Hazard — ${hz.name}: ${hz.desc}`); hz.round(this); this.checkEnd(); }
  }

  /** Begin a unit's turn. Returns {skip} */
  beginTurn(u) {
    this.push({ t: 'turn', uid: u.uid });
    u.usedItem = false;
    if (u.noto) { u.noto *= 0.7; if (Math.abs(u.noto) < 0.02) u.noto = 0; }
    for (const k in u.cds) if (u.cds[k] > 0) u.cds[k]--;
    // Energy: every unit gains 1 per turn naturally, modified by effects
    {
      const blocked = u.statuses.some(s => SBR.STATUS[s.id].noEnergy);
      let gain = 0;
      if (!blocked) {
        gain = 1 + (this.has(u, 'secondwind') ? 1 : 0);
        const chance = (u.side === 'party' ? u.stats.res * 0.02 + (this.bonus.energyChance || 0) : 0) + this.statMod(u, 'energyChance');
        if (chance > 0 && Math.random() < chance) { gain++; this.push({ t: 'float', uid: u.uid, text: '+1 ENERGY', cls: 'energy' }); }
      } else this.push({ t: 'float', uid: u.uid, text: 'NO ENERGY', cls: 'debuff' });
      if (this.has(u, 'goldenheart')) gain++;
      u.energy = Math.min(u.maxEnergy || 6, (u.energy || 0) + gain);
    }
    if (u.side === 'party' && !u.summon) {
      const rg = (this.bonus.regen || 0) + this.eq(u, 'regen');
      if (rg) this.heal(null, u, rg);
    }
    // status ticks
    for (const s of u.statuses.slice()) {
      if (u.dead) break;
      const d = SBR.STATUS[s.id];
      if (!d.tick) continue;
      switch (d.tick) {
        case 'bleed': this.typedHp(u, 2 * s.stacks, 'bleed', 'BLEED'); s.stacks--; if (s.stacks <= 0) this.removeStatus(u, s.id); break;
        case 'holed': this.typedHp(u, 3 * s.stacks, 'spin', 'HOLE'); break;
        case 'guilt': this.typedHp(u, 2 * s.stacks, 'stand', 'GUILT'); s.stacks = Math.min(d.max, s.stacks + 1); break;
        case 'infinite': this.typedHp(u, Math.max(3, Math.round(u.maxHp * (u.tier !== 'boss' ? 0.08 : u.def && u.def.secret ? 0.025 : 0.04))), 'true', '∞'); break;
        case 'regen': this.heal(null, u, 4); break;
        case 'burn': this.typedHp(u, 3 * s.stacks, 'phys', 'BURN'); s.stacks--; if (s.stacks <= 0) this.removeStatus(u, s.id); break;
        case 'sha': this.push({ t: 'fx', kind: 'boom', uid: u.uid }); this.typedHp(u, 6, 'phys', 'SHA!'); break;
        case 'primed':
          s.turns--;
          if (s.turns <= 0) { this.removeStatus(u, 'primed'); this.push({ t: 'fx', kind: 'boom', uid: u.uid }); this.typedHp(u, 18, 'phys', 'BOOM'); }
          else this.push({ t: 'float', uid: u.uid, text: `PIN ${s.turns}`, cls: 'debuff' });
          break;
      }
    }
    if (u.dead) { this.checkEnd(); return { skip: true }; }
    if (u.side === 'enemy' && u.def.hooks && u.def.hooks.turnStart) {
      u.def.hooks.turnStart(this.ctx(u, null));
      if (u.dead) return { skip: true };
    }
    const stun = this.st(u, 'stun') || this.st(u, 'timestop');
    if (stun) {
      this.push({ t: 'float', uid: u.uid, text: stun.id === 'stun' ? 'SPUN!' : 'FROZEN', cls: 'debuff big' });
      this.endTurn(u);
      return { skip: true };
    }
    return { skip: false };
  }

  endTurn(u) {
    for (const s of u.statuses.slice()) {
      const d = SBR.STATUS[s.id];
      if (d.tick === 'primed') continue;
      if (s.turns > 0 && s.turns < 900) {
        s.turns--;
        if (s.turns <= 0 && d.mode === 'turns') this.removeStatus(u, s.id);
      }
    }
    this.push({ t: 'endTurn', uid: u.uid });
    this.checkEnd();
  }

  /** pre-action checks shared by party & enemies; returns false if the action fizzles */
  preAction(u) {
    const snd = this.st(u, 'sound');
    if (snd) {
      this.removeStatus(u, 'sound');
      this.push({ t: 'fx', kind: 'sound', uid: u.uid });
      this.applyHp(u, 6 * snd.stacks, false, 'DOGOOON');
      if (u.dead) return false;
    }
    if (this.has(u, 'leftblind') && Math.random() < 0.35) {
      this.push({ t: 'float', uid: u.uid, text: 'CAN\'T SEE LEFT!', cls: 'debuff' });
      return false;
    }
    return true;
  }

  canUse(u, abId) {
    const ab = SBR.ABILITIES[abId];
    if (!ab) return false;
    if ((u.cds[abId] || 0) > 0) return false;
    if (u.energy < ab.cost) return false;
    if (this.has(u, 'raptor') && ab.cost > 0) return false;
    if (ab.target === 'allyDead' && !this.party().some(p => p.dead && !p.removed)) return false;
    return true;
  }

  useAbility(u, abId, targetUid) {
    const ab = SBR.ABILITIES[abId];
    if (!this.canUse(u, abId)) return false;
    u.energy -= ab.cost;
    if (ab.cd) u.cds[abId] = ab.cd + 1;
    // multi-pick abilities get a list of uids
    let picks = Array.isArray(targetUid) ? targetUid.map(id => this.unit(id)).filter(t => t && !t.removed).slice(0, ab.pick || 1) : null;
    let target = picks ? picks[0] || null : targetUid ? this.unit(targetUid) : null;
    // an enemy's Taunt: single-target attacks must go to a taunter
    if (ab.target === 'enemy') {
      const T = this.tauntersAgainst(u);
      if (T.length) {
        if (picks) { picks = picks.filter(t => T.includes(t)); if (!picks.length) picks = T.slice(0, ab.pick || 1); target = picks[0]; }
        else if (!target || !T.includes(target)) target = T[0];
      }
    }
    if (u.side === 'party') this.notoriety(u, 0.08 * ab.cost + ((ab.tags || []).includes('stand') && ab.cost ? 0.1 : 0));
    const tgtList = ab.target === 'allEnemies' ? this.foes(u).map(t => t.uid) : ab.target === 'allAllies' ? this.friends(u).map(t => t.uid) : picks ? picks.map(t => t.uid) : target ? [target.uid] : [];
    this.push({ t: 'act', uid: u.uid, name: ab.name, fx: ab.fx, targets: tgtList, cost: ab.cost, abId, pierce: !!ab.pierce, special: (ab.tags || []).includes('stand') || abId === 'ball_breaker' });
    if (!this.preAction(u)) { this.endTurn(u); return true; }
    const lvl = (u.upgrades && u.upgrades[abId]) || 1;
    this.runPicked(u, ab, lvl, target, picks);
    const bob = (this.bonus.bleedOnBasic || 0) + this.eq(u, 'bleedOnBasic');
    if (ab.cost === 0 && u.side === 'party' && bob && target && !target.dead && Math.random() < bob) this.addStatus(target, 'bleed', 1);
    this.endTurn(u);
    return true;
  }

  /** run an ability on one target, or once per picked target (split damage when ab.spread) */
  runPicked(u, ab, lvl, target, picks) {
    if (!picks || picks.length <= 1 || ab.multi) {
      const x = this.ctx(u, target, ab, lvl); x.targets = picks || (target ? [target] : []);
      return ab.run(x);
    }
    const mul = ab.spread ? (SBR.SPREAD || [1, 1, 0.7, 0.55, 0.45, 0.4])[Math.min(5, picks.length)] : 1;
    picks.forEach(t => {
      if (t.dead && ab.target !== 'allyDead') return;
      if (this.result || u.dead) return;
      const x = this.ctx(u, t, ab, lvl); x.targets = picks; x.spread = mul;
      ab.run(x);
    });
  }

  brace(u) {
    this.push({ t: 'act', uid: u.uid, name: 'Brace', fx: 'buff', targets: [u.uid] });
    u.energy = Math.min(u.maxEnergy, u.energy + 1);
    // Guard lasts through the enemy turns until this rider's next turn (a 1-turn Guard would expire at once)
    this.addStatus(u, 'guard', 0, 2);
    if (this.has(u, 'primed')) { this.removeStatus(u, 'primed'); this.push({ t: 'float', uid: u.uid, text: 'PIN PULLED!', cls: 'buff big' }); }
    this.endTurn(u);
  }

  useItem(u, itemId, targetUid) {
    const it = SBR.ITEMS[itemId];
    if (!it || u.usedItem) return false;
    const idx = SBR.run.items.indexOf(itemId);
    if (idx < 0) return false;
    SBR.run.items.splice(idx, 1);
    u.usedItem = true;
    let target = targetUid ? this.unit(targetUid) : null;
    if (it.target === 'enemy') { const T = this.tauntersAgainst(u); if (T.length && !T.includes(target)) target = T[0]; }
    this.push({ t: 'act', uid: u.uid, name: it.name, fx: 'item', targets: target ? [target.uid] : [], item: true });
    it.use(this.ctx(u, target, { tags: [] }, 1));
    this.checkEnd();
    return true;
  }

  /** Party unit acting on its own (dinosaurified) */
  autoRaptor(u) {
    const basic = u.abilities[0];
    const targets = this.units.filter(t => !t.dead && !t.removed && t !== u);
    const t = SBR.util.pick(targets);
    this.push({ t: 'float', uid: u.uid, text: 'RAAARGH!', cls: 'debuff' });
    const ab = SBR.ABILITIES[basic];
    this.push({ t: 'act', uid: u.uid, name: ab.name + ' (feral)', fx: ab.fx, targets: [t.uid] });
    ab.run(this.ctx(u, t, ab, 1));
    this.endTurn(u);
  }

  /* ---------- aggro (AAC-style): single-target enemy attacks pick a party unit weighted by aggro ---------- */
  notoriety(u, d) {
    if (!u || u.dead || u.side !== 'party' || !d) return;
    u.noto = SBR.util.clamp((u.noto || 0) + d, -0.6, 1.5);
  }
  /** a unit's aggro and where it comes from: [{label, v, mul?}] */
  aggroInfo(u) {
    const parts = [];
    const base = u.summon ? (u.def.aggro != null ? u.def.aggro : 1) : ((u.def && u.def.aggro) || 1);
    parts.push({ label: u.summon ? 'Summon' : 'Rider', v: base });
    let a = base;
    if (!u.summon && u.stats) {
      // GRIT makes you a presence on the field; RESOLVE keeps you composed and unremarkable
      const s = SBR.util.clamp((u.stats.grit - 4) * 0.025 - (u.stats.res - 4) * 0.02, -0.25, 0.35);
      if (Math.abs(s) >= 0.01) { parts.push({ label: 'GRIT / RESOLVE', v: s }); a += s; }
    }
    const g = this.eq(u, 'aggro') + (u.side === 'party' && !u.summon ? (this.bonus.aggro || 0) : 0);
    if (g) { parts.push({ label: 'Gear', v: g }); a += g; }
    a = Math.max(0.1, a);
    if (u.noto) { parts.push({ label: u.noto > 0 ? 'Notoriety' : 'Overlooked', mul: 1 + u.noto }); a *= 1 + u.noto; }
    for (const s of u.statuses) { const d = SBR.STATUS[s.id]; if (d && d.aggro && s.id !== 'taunt') { parts.push({ label: d.name, mul: d.aggro }); a *= d.aggro; } }
    return { aggro: Math.max(0.05, a), parts };
  }
  aggroOf(u) { return u.dead ? 0 : this.aggroInfo(u).aggro; }
  /** foes of u that are taunting it (party must hit these with single-target moves) */
  tauntersAgainst(u) { return this.foes(u).filter(t => this.has(t, 'taunt')); }
  /** how likely each living party unit is to be picked by a single-target enemy attack */
  targetWeights(cands = this.alive('party')) {
    const smart = SBR.threatTier ? SBR.threatTier() : 0;
    const list = cands.map(p => {
      let w = this.aggroOf(p);
      // at higher threat enemies focus the wounded and the Scanned, and see through decoys
      if (smart) { w *= 1 + smart * 0.6 * (1 - p.hp / p.maxHp); if (this.has(p, 'marked')) w *= 1 + smart * 0.5; if (p.summon && !this.has(p, 'taunt')) w /= 1 + smart * 0.15; }
      if (p.hp < p.maxHp * 0.4) w *= 1.3;
      return { u: p, w: Math.max(0.001, w) };
    });
    // Taunt: taunters draw 85% of single-target attacks between them
    const T = list.filter(e => this.has(e.u, 'taunt')), N = list.filter(e => !this.has(e.u, 'taunt'));
    if (T.length && N.length) {
      const sT = T.reduce((s, e) => s + e.w, 0), sN = N.reduce((s, e) => s + e.w, 0);
      const k = (sN * 0.85 / 0.15) / sT;
      T.forEach(e => { e.w *= k; });
    }
    const tot = list.reduce((s, e) => s + e.w, 0) || 1;
    list.forEach(e => { e.p = e.w / tot; });
    return list;
  }
  /** Enemy AI */
  pickPartyTarget(exclude = []) {
    const list = this.targetWeights(this.alive('party').filter(p => !exclude.includes(p)));
    if (!list.length) return null;
    return SBR.util.weighted(list, e => e.w).u;
  }
  enemyAct(u, free = false) {
    const def = u.def;
    const x0 = this.ctx(u, null);
    const cost = a => (a.cost != null ? a.cost : a.cd >= 3 ? 2 : a.cd >= 1 ? 1 : 0);
    const abl = u.xAbilities || def.abilities;
    let opts = abl.filter((a, i) => !(u.cds['a' + i] > 0) && cost(a) <= (u.energy || 0) && (!a.cond || a.cond(x0)));
    if (this.has(u, 'disclock')) { const basic = abl.filter(a => cost(a) === 0 && !a.cd); opts = basic.length ? basic : [abl[0]]; }
    if (!opts.length) opts = abl.filter(a => cost(a) === 0);
    if (!opts.length) opts = [abl[abl.length - 1]];
    // smarter at higher threat: favour the costliest move it can afford, and AoE into a full party
    const smart = SBR.threatTier ? SBR.threatTier() : 0;
    const ab = SBR.util.weighted(opts, a => (a.w || 1) * (1 + smart * 0.35 * cost(a)) * (a.target === 'allEnemies' && this.alive('party').length >= 3 ? 1 + smart * 0.3 : 1));
    const idx = abl.indexOf(ab);
    if (ab.cd) u.cds['a' + idx] = ab.cd + 1;
    if (!free) u.energy = Math.max(0, (u.energy || 0) - cost(ab));
    let target = null, picks = null;
    if (ab.target === 'enemy') target = this.pickPartyTarget();
    else if (ab.target === 'self') target = u;
    else if (ab.target === 'ally') target = this.friends(u).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    if (ab.pick > 1 && target && (ab.target === 'enemy' || ab.target === 'ally')) {
      // how many it spreads over: a coin flip between focusing and fanning out
      const n = Math.random() < 0.5 ? 1 : SBR.util.randInt(2, ab.pick);
      if (ab.target === 'enemy') {
        // further picks are drawn by aggro too, without repeats
        picks = [target];
        while (picks.length < n) { const t = this.pickPartyTarget(picks); if (!t) break; picks.push(t); }
      } else {
        const pool = this.friends(u).filter(t => t !== target).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
        picks = [target].concat(pool.slice(0, n - 1));
      }
      if (picks.length < 2) picks = null;
    }
    const tl = ab.target === 'allEnemies' ? this.alive('party').map(t => t.uid) : ab.target === 'allAllies' ? this.friends(u).map(t => t.uid) : picks ? picks.map(t => t.uid) : target ? [target.uid] : [];
    this.push({ t: 'act', uid: u.uid, name: ab.name, fx: ab.fx, targets: tl, enemy: true, special: cost(ab) > 0, cost: cost(ab) });
    if (!this.preAction(u)) { if (!free) this.endTurn(u); return; }
    if (this.has(u, 'raptor')) { target = this.pickPartyTarget(); picks = null; }
    this.runPicked(u, ab, 1, target, picks);
    if (!free) this.endTurn(u);
  }

  /* ---------- special mechanics used by boss hooks ---------- */
  summon(id) {
    if (this.alive('enemy').length >= 5) return null;
    const u = this.makeEnemyUnit(id);
    u.init = 0;
    this.units.push(u);
    this.order.push(u.uid);
    const h = u.def.hooks; if (h && h.start) h.start(this.ctx(u, null));
    this.push({ t: 'summon', uid: u.uid });
    return u;
  }
  /* ---------- party summons (SBR.SUMMONS in summons.js) ---------- */
  /** owner calls a summon onto the party side. It acts at the end of each round (appended to the order). */
  summonAlly(owner, key, o = {}) {
    const D = SBR.SUMMONS && SBR.SUMMONS[key];
    if (!D || !owner || owner.dead || this.result) return null;
    const mine = this.summons().filter(s => s.key === key && s.owner === owner.uid);
    if (mine.length >= (D.max || 1)) this.dismissSummon(mine[0], 'RECALLED');
    const all = this.summons();
    if (all.length >= (SBR.SUMMON_CAP || 4)) this.dismissSummon(all[0], 'RECALLED');
    const lvl = (owner.ref && owner.ref.level) || 1;
    const maxHp = Math.max(1, Math.round((D.hp || 10) * (1 + 0.05 * (lvl - 1)) * (o.hpMul || 1)));
    const u = {
      uid: SBR.util.uid('s'), id: 'sum_' + key, key, name: D.name, fullName: D.name, side: 'party', summon: true, owner: owner.uid, def: D, tier: 'summon',
      art: { kind: 'summon', key }, stats: Object.assign({ spin: 0, aim: 0, grit: 0, ride: 0, res: 0, luck: 0 }, owner.stats), maxHp, hp: maxHp,
      energy: 0, maxEnergy: 0, cds: {}, statuses: [], dead: false, baseRes: Object.assign({}, D.res), abilities: [], upgrades: {}, eqb: null,
      life: o.life != null ? o.life : D.life || 0, lvl: o.lvl || 1, init: 0,
    };
    this.units.push(u);
    this.order.push(u.uid);
    this.push({ t: 'summon', uid: u.uid, ally: true });
    if (D.taunt) this.addStatus(u, 'taunt', 0, D.taunt, true);
    if (D.onSummon) D.onSummon(this.ctx(u, null, null, u.lvl));
    return u;
  }
  dismissSummon(u, text) {
    if (!u || u.removed) return;
    if (text && !u.dead) this.push({ t: 'float', uid: u.uid, text, cls: 'miss' });
    u.dead = true; u.removed = true; u.hp = 0; u.statuses = [];
    this.push({ t: 'death', uid: u.uid, permanent: true, summon: true });
  }
  /** a summon's turn: its one move, then it ticks down if temporary */
  summonAct(u) {
    const D = u.def;
    let target = null;
    const foes = this.foes(u);
    const T = this.tauntersAgainst(u);
    const pool = T.length ? T : foes;
    if (D.target === 'enemy' && pool.length) {
      if (D.pick === 'lowest') target = pool.slice().sort((a, b) => a.hp - b.hp)[0];
      else if (D.pick === 'highest') target = pool.slice().sort((a, b) => b.hp - a.hp)[0];
      else if (D.pick === 'holed') target = pool.slice().sort((a, b) => this.stacks(b, 'holed') - this.stacks(a, 'holed') || a.hp - b.hp)[0];
      else target = SBR.util.pick(pool);
    } else if (D.target === 'owner') target = this.unit(u.owner);
    else if (D.target === 'ally') {
      const riders = this.alive('party').filter(p => !p.summon);
      target = (D.prefer ? riders.filter(p => !this.has(p, D.prefer)) : []).concat(riders.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp))[0] || null;
    }
    const tl = D.target === 'allEnemies' ? foes.map(t => t.uid) : target ? [target.uid] : [];
    if (D.target !== 'none' && !tl.length) { this.endTurn(u); return; }
    this.push({ t: 'act', uid: u.uid, name: D.move || D.name, fx: D.fx || 'hit', targets: tl, cost: 0, summonAct: true });
    if (this.preAction(u) && !u.dead) {
      const x = this.ctx(u, target, { tags: D.tags || [], dtype: D.dtype }, u.lvl);
      D.act(x);
    }
    if (!u.dead && u.life) {
      u.life--;
      if (u.life <= 0) { this.dismissSummon(u, D.fade || 'FADES'); this.push({ t: 'endTurn', uid: u.uid }); this.checkEnd(); return; }
    }
    this.endTurn(u);
  }
  kill(u) { if (!u.dead) { u.hp = 0; this.push({ t: 'setHp', uid: u.uid, hp: 0 }); this.onDeathRaw(u); } }
  onDeathRaw(u) { u.dead = true; this.push({ t: 'death', uid: u.uid }); this.checkEnd(); }
  killAlly(id) {
    const u = this.units.find(p => p.side === 'party' && p.id === id && !p.removed);
    if (!u) return;
    u.dead = true; u.removed = true; u.hp = 0;
    this.push({ t: 'death', uid: u.uid, permanent: true });
    this.summons(u).forEach(s => this.dismissSummon(s, 'GONE'));
  }
  unlockFlag(flag) {
    SBR.run.flags[flag] = true;
    this.party().forEach(p => { p.abilities = SBR.game.memberAbilities(p.ref); });
    this.push({ t: 'abilities' });
  }
  snapshot(key) { this.snaps[key] = this.units.map(u => ({ uid: u.uid, hp: u.hp, dead: u.dead })); }
  rewind(key) {
    const s = this.snaps[key];
    if (!s) return;
    this.push({ t: 'rewind' });
    s.forEach(r => { const u = this.unit(r.uid); if (u && !u.dead && !r.dead) { u.hp = Math.max(1, Math.min(u.maxHp, r.hp)); this.push({ t: 'setHp', uid: u.uid, hp: u.hp }); } });
    this.log('MANDOM — six seconds rewind. Only Ringo remembers.', 'boss');
  }
  timeStop(n) {
    const u = this.alive('enemy').find(e => e.id === 'diego_world');
    if (!u) return;
    this.push({ t: 'timestop', on: true });
    for (let i = 0; i < n && !this.result; i++) this.enemyAct(u, true);
    this.push({ t: 'timestop', on: false });
  }

  /* ---------- ability context ---------- */
  ctx(user, target, ability = null, lvl = 1) {
    const c = this;
    // split-damage abilities scale every number by x.spread
    const sm = (s, m) => { if (m === 1 || !s) return s; const o = {}; for (const k in s) o[k] = s[k] * m; return o; };
    const x = {
      c, user, target, lvl, round: c.round, spread: 1, targets: target ? [target] : [],
      get enemies() { return c.foes(user); },
      get allies() { return c.friends(user); },
      dmg: (t, base, scale, o = {}) => c.damage(user, t, base * x.spread, sm(scale, x.spread), o, ability),
      heal: (t, base, scale) => c.heal(user, t, base * x.spread, sm(scale, x.spread)),
      status: (t, id, stacks = 0, turns = 0) => c.addStatus(t, id, stacks, turns),
      removeStatus: (t, id) => c.removeStatus(t, id),
      cleanse: (t, n) => c.cleanse(t, n),
      stacks: (t, id) => c.stacks(t, id),
      has: (t, id) => c.has(t, id),
      roll: p => Math.random() < p,
      energy: (t, n) => { if (t) { t.energy = Math.min(t.maxEnergy, t.energy + n); c.push({ t: 'float', uid: t.uid, text: `+${n} ENERGY`, cls: 'energy' }); } },
      log: text => c.log(text),
      say: (u, text) => u && c.push({ t: 'say', uid: u.uid, text }),
      summon: id => c.summon(id),
      summonAlly: (key, o) => c.summonAlly(user.summon ? c.unit(user.owner) : user, key, Object.assign({ lvl }, o)),
      get owner() { return user.summon ? c.unit(user.owner) : user; },
      taunters: () => c.tauntersAgainst(user),
      kill: u => c.kill(u),
      killAlly: id => c.killAlly(id),
      revive: (t, pct) => c.revive(t, pct),
      randomEnemy: () => SBR.util.pick(c.foes(user)),
      money: n => { c.loot.money += n; },
      achieve: id => SBR.game.achieve(id),
      flag: k => c.flags[k],
      setFlag: k => { c.flags[k] = true; },
      unlockFlag: f => c.unlockFlag(f),
      dialogue: id => c.push({ t: 'dialogue', id }),
      snapshot: k => c.snapshot(k),
      getSnapshot: k => c.snaps[k],
      rewind: k => c.rewind(k),
      timeStop: n => c.timeStop(n),
      extraAction: () => { if (!c.result && !user.dead) { c.push({ t: 'float', uid: user.uid, text: 'EXTRA ACTION', cls: 'debuff big' }); c.enemyAct(user, true); } },
      count: id => c.alive(user.side === 'party' ? 'enemy' : 'party').filter(t => c.has(t, id)).length,
    };
    return x;
  }
};
