/* Enemy tactics: enemies weigh what each of their moves would actually do before they pick one.
   Loads after bosstuning.js. combat.js enemyAct asks three hooks (aiChooseAbility, aiPickTarget, aiPickAlly);
   without this file it falls back to weights alone.

   How a move is judged: each candidate ability is dry-run against a recording context (no state changes) that
   tallies expected damage (dodge, block, crit, resistances, shields, Exposed/Guard/Evasive all priced in),
   statuses, heals, cleanses and summons, and converts it into one number:
     - damage is worth more on wounded, dangerous riders (damage dealt so far, Energy banked, healers), a likely kill
       is worth a lot, damage past a kill is wasted, riders a bleed will finish anyway are left alone
     - a debuff already on the target is worth little; control (Spun) is worth more on a rider sitting on Energy;
       Exposed/Scanned are worth more the more allies can follow up on them
     - heals, shields and guards are worth little above ~70% HP and a lot below 40% (scaled to the body's size);
       cleanses scale with the debuffs they remove; hits into Guard/Evasive/Shield are discounted
     - Energy and cooldown cost a little, so a cheap move that finishes a rider beats the big one
   The final pick is still a weighted draw: weight (flavour) x exp(smartness x K x (score / best - 1)).
   Smartness grows with the act (0.2 at act 1 up to 1 at act 6) plus elite/boss/Strange Aura bonuses that ramp in
   from act 2; the lead boss of a boss fight is capped (leadCap) because its telegraphs already carry its threat.
   Team play: every round the enemies share a focus (the rider easiest to take down for the threat they pose),
   and follow-ups onto an Exposed/Scanned rider come naturally from the expected-damage maths.
   Fair play: no hidden information (only what the player also sees), Taunt keeps its 85% pull, no damage bonus,
   and telegraphed boss moves are left to the boss director.
   Tuning: SBR.enemyAI.CFG; SBR.enemyAI.enabled = false restores the old weight-only behaviour. */
'use strict';

SBR.enemyAI = (() => {
  const CFG = {
    act: { 1: 0.2, 2: 0.3, 3: 0.5, 4: 0.75, 5: 0.9, 6: 1 },   // base smartness per act
    elite: 0.15, boss: 0.2, secret: 0.3, perThreat: 0.02,     // added for rank / Threat tier (capped at 1); rank bonuses ramp in from act 2 to act 4
    statusW: 0.8,       // statuses pay off later (and can be cleansed): worth a bit less than damage now
    dotW: 1,            // extra weight on damage-over-time stacks (Bleed, Burn, Nail Hole, Guilt)
    summon: 9,          // value of calling a unit onto the field
    cleanse: 5,         // value per debuff an enemy cleanse removes from its own side
    leadCap: 0.6,       // ceiling for the lead boss of a boss fight (Strange Auras exempt): its telegraphs carry its threat
    tune: { axl: 0.15, ghost: 0.35 }, // per-enemy ceilings by id (Axl's Guilt snowballs when it is timed well)
    K: 3.2,             // how hard a fully smart enemy leans on the best move
    Kt: 2.0,            // ... and on the best target
    focus: 0.25,        // bonus on the round's shared focus target
    wounded: 0.5,       // extra value per point of damage on a rider at 0% HP (scaled linearly)
    braced: 0.6,        // value kept when hitting a rider under Guard / Evasive
    costE: 1.2, costCd: 0.5, // what a point of Energy / a turn of cooldown is worth (HP points)
  };
  const api = { CFG, enabled: true };
  const U = SBR.util;
  const actOf = () => (SBR.run && SBR.run.act) || 1;
  const bossCfg = () => (SBR.bossTuning && SBR.bossTuning.CFG) || { fury: 0.12 };

  /** how smart this unit plays right now: 0 = weights only, 1 = full */
  api.smartness = (c, u) => {
    let s = CFG.act[actOf()] != null ? CFG.act[actOf()] : 0.5;
    const ramp = U.clamp((actOf() - 1) / 3, 0, 1);
    if (u.tier === 'elite' || (c.opts && c.opts.elite)) s += CFG.elite * ramp;
    if (u.tier === 'boss' || (u.bt && u.bt.lead)) s += CFG.boss * ramp;
    if (u.def && u.def.secret) s += CFG.secret;
    s += CFG.perThreat * (SBR.threatTier ? SBR.threatTier() : 0);
    // an act boss already plays its big moves through telegraphs: its everyday moves stay a notch looser
    if (u.bt && u.bt.lead && !u.bt.elite && !(u.def && u.def.secret)) s = Math.min(s, CFG.leadCap);
    if (CFG.tune[u.id] != null) s = Math.min(s, CFG.tune[u.id]);
    return U.clamp(s, 0, 1);
  };

  /* ---------- which abilities can be dry-run safely ---------- */
  const safeCache = new WeakMap();
  function isSafe(ab) {
    if (safeCache.has(ab)) return safeCache.get(ab);
    let ok = false;
    try {
      // random picks and the superbosses' damage scaler / target helpers are pure reads
      let src = String(ab.run).replace(/\b(?:SBR\.util|U)\.(?:pick|randInt|clamp)\s*\(/g, 'Math.min(');
      const m = src.match(/^\s*(?:run\s*)?\(?\s*([A-Za-z_$][\w$]*)/);
      ok = !!m && m[1] === 'x' && !/x\.c\b|SBR\.|\b(?:window|document|this)\b|\.(?:push|splice|shift|pop|unshift)\s*\(/.test(src);
      if (ok) {
        // local declarations are fine; any other assignment could touch real state
        src = src.replace(/for\s*\(\s*let\s+(\w+)\s*=[^;]*;[^;]*;\s*\1\+\+\s*\)/g, 'for(;;)').replace(/\b(?:const|let|var)\s+[\w$]+\s*=/g, ' ').replace(/\b(?:const|let|var)\s*[{[][^}\]]*[}\]]\s*=/g, ' ');
        if (/[^=!<>+\-*/%&|^]=(?![=>])|\+\+|--|[-+*/%]=/.test(src)) ok = false;
        // calls to free functions (closure helpers) are opaque
        const calls = src.match(/(?:^|[^.\w$])([A-Za-z_$][\w$]*)\s*\(/g) || [];
        if (calls.some(s => !/(?:^|[^.\w$])(?:x|if|for|while|switch|return|function|run|typeof|Math|D|pick|others)\s*\($/.test(s) && !/^\W?\(/.test(s))) ok = false;
      }
    } catch (e) { ok = false; }
    safeCache.set(ab, ok);
    return ok;
  }

  /* ---------- expected damage (no rolls) ---------- */
  function estHit(c, src, tgt, base, scale, o = {}, ability = null) {
    const Z = { exp: 0, max: 0, crit: 0, hitP: 0 };
    if (!tgt || tgt.dead) return Z;
    const tags = o.tags || (ability && ability.tags) || [];
    const pierce = o.pierce || (ability && ability.pierce && o.pierce !== false);
    if (src && src.btPow) base *= src.btPow * (1 + (bossCfg().fury || 0.12) * c.stacks(src, 'fury'));
    let raw = src ? c.scaleVal(src, base, scale) : base;
    const dtype = c.dtypeOf(src, ability, o, tags);
    let mult = src ? c.statMod(src, 'dmgOut', 'mul') : 1;
    mult *= c.statMod(tgt, 'dmgIn', 'mul');
    if (tgt.side === 'party' && tgt.id === 'wekapipo') mult *= 0.9;
    let hitP = 1;
    if (src) hitP *= 1 - (c.statMod(src, 'miss') || 0);
    const crimson = src && c.has(src, 'crimson');
    if (src && c.has(tgt, 'epitaph')) return Z;
    if (src && !o.noDodge && !crimson) hitP *= 1 - c.dodgeChance(tgt);
    if (c.has(tgt, 'rainveil') && !tags.includes('spin') && !pierce) return Z;
    if (c.has(tgt, 'invuln') && !pierce) return Z;
    let cc = 0, cd = 1.5;
    if (src && !o.noCrit) { cc = crimson || o.forceCrit ? 1 : U.clamp(c.critChance(src) + (c.has(tgt, 'marked') ? 0.2 : 0), 0, 1); cd = c.critDmg(src); }
    let eff = c.resMult(tgt, dtype);
    if (dtype === 'holy' && tgt.def && tgt.def.undead) eff *= 2;
    if (eff <= 0) return Z;
    const bl = src && !pierce ? c.blockChance(tgt) * c.blockDR(tgt) : 0;
    const one = Math.max(1, raw * mult * eff);
    Z.max = one; Z.crit = one * cd; Z.hitP = hitP; Z.cc = cc;
    Z.exp = hitP * one * (1 + cc * (cd - 1)) * (1 - bl);
    if (src && c.has(tgt, 'reflect')) Z.reflect = Z.exp * 0.4;
    return Z;
  }

  /* ---------- how much a rider matters ---------- */
  function healerIds() {
    if (api._healers) return api._healers;
    const h = {};
    for (const id in SBR.ABILITIES) { const a = SBR.ABILITIES[id]; if ((a.target === 'ally' || a.target === 'allAllies' || a.target === 'allyDead') && ((a.tags || []).includes('heal') || a.fx === 'heal')) h[id] = true; }
    return (api._healers = h);
  }
  function threatRaw(c, p) {
    if (p.summon) return 0.5;
    const s = p.stats || {};
    let t = 1 + 0.02 * ((s.spin || 0) + (s.aim || 0)) + 0.1 * (p.energy || 0);
    if ((p.abilities || []).some(id => healerIds()[id])) t += 0.35;
    const D = c._aiDealt || {}, tot = Object.values(D).reduce((a, b) => a + b, 0);
    if (tot > 0) t += 1.2 * (D[p.uid] || 0) / tot;
    t *= c.statMod(p, 'dmgOut', 'mul');
    return t;
  }
  function threats(c) {
    const P = c.alive('party'), m = new Map();
    const R = P.filter(p => !p.summon), mean = R.reduce((s, p) => s + threatRaw(c, p), 0) / Math.max(1, R.length) || 1;
    P.forEach(p => m.set(p, threatRaw(c, p) / mean));
    return m;
  }
  const effHp = (c, t) => t.hp + c.stacks(t, 'shield');
  /** damage over time that lands on t's next turn start, before it can act */
  function pendingDot(c, t) {
    let d = 0;
    for (const s of t.statuses) {
      if (s.id === 'bleed') d += 2 * s.stacks; else if (s.id === 'holed') d += 3 * s.stacks; else if (s.id === 'burn') d += 3 * s.stacks;
      else if (s.id === 'guilt') d += 2 * s.stacks; else if (s.id === 'primed' && s.turns <= 1) d += 18;
    }
    return d;
  }
  /** a point of HP on a big body matters less than on a rider: heals and guards are scaled to the riders' pools */
  function poolNorm(c, a) {
    const R = c.party().filter(p => !p.dead);
    const avg = R.reduce((s, p) => s + p.maxHp, 0) / Math.max(1, R.length) || a.maxHp;
    return U.clamp(Math.sqrt(avg / Math.max(1, a.maxHp)), 0.4, 1.5);
  }
  /** how badly a unit needs help: little above 70% HP, a lot below 40% */
  const urgency = a => { const m = 1 - a.hp / a.maxHp; return 0.3 + 3.5 * m * m; };
  const killBonus = t => (t.summon ? 4 : 10 + 0.25 * t.maxHp);

  /* ---------- the round's shared plan ---------- */
  // the focus holds for the whole round (unless that rider falls); the threat read is refreshed every turn
  function plan(c) {
    const key = c.round + ':' + c.turnIdx, old = c._aiPlan;
    if (old && old.key === key) return old;
    const th = threats(c);
    let focus = old && old.round === c.round && old.focus && !old.focus.dead ? old.focus : null;
    if (!focus) {
      let best = -1;
      c.alive('party').filter(p => !p.summon).forEach(p => { const v = th.get(p) / Math.max(1, effHp(c, p) - pendingDot(c, p) * 0.5); if (v > best) { best = v; focus = p; } });
    }
    return (c._aiPlan = { key, round: c.round, focus, th });
  }

  /* ---------- status values ---------- */
  function immuneTo(c, t, id) {
    if (t.side !== 'party') return c.has(t, 'steeled') && (id === 'stun' || id === 'timestop');
    return (c.bonus.immune || []).concat((t.eqb && t.eqb.immune) || []).includes(id);
  }
  /** what adding a status is worth, before the "already has it" discount */
  const setup = (c, t) => (1 + 0.8 * (1 - t.hp / t.maxHp)) * (c._aiPlan && c._aiPlan.focus === t ? 1.3 : 1);
  function debuffVal(c, id, n, dur, t, th, E) {
    const T = th.get(t) || 1;
    switch (id) {
      case 'stun': case 'timestop': return (8 + 3 * (t.energy || 0)) * T * Math.min(dur, 2);
      // set-ups for the team: best on the rider everyone is about to hit (wounded, or the round's focus)
      case 'vuln': return dur * (2 + 2.2 * E) * setup(c, t);
      case 'marked': return dur * (1.5 + 1.4 * E) * setup(c, t);
      case 'weak': return dur * 4 * T;
      case 'aged': return dur * 5 * T;
      case 'fear': return dur * (3 + 1.5 * Math.min(2, t.energy || 0)) * T;
      case 'hooked': return dur * 2 * T;
      case 'blind': return dur * 4.5 * T;
      case 'leftblind': return dur * 3.5 * T;
      case 'bleed': return 2 * n * CFG.dotW;
      case 'burn': return 3 * n * CFG.dotW;
      case 'holed': return 6 * n * CFG.dotW;
      case 'guilt': return 4 * n * CFG.dotW;
      case 'infinite': return t.maxHp * 0.2;
      case 'primed': return 10;
      case 'fossil': return 3 * n + (c.stacks(t, 'fossil') + n >= 5 ? 15 : 0);
      case 'magnet': return dur * (c.alive('party').length >= 2 ? 3 : 0.5);
      case 'sound': return 4 * n;
      case 'soaked': case 'chilled': return dur * 1.5;
      default: return 3 * dur;
    }
  }
  function buffVal(c, id, n, dur, a) {
    const urg = urgency(a) * poolNorm(c, a), imp = a.tier === 'boss' ? 1.3 : a.tier === 'elite' ? 1.15 : 1;
    let v;
    switch (id) {
      case 'shield': v = Math.min(n, a.maxHp) * 0.6 * urg; break;
      case 'guard': v = dur * 1.5 * urg; break;
      case 'evasive': v = dur * 2 * urg; break;
      case 'calm': case 'armored': case 'sanctified': v = dur * 1.5 * urg; break;
      case 'regen': v = dur * 3 * (a.hp < a.maxHp ? 1 : 0.3); break;
      case 'empower': case 'refreshed': v = dur * 1.8 * (a.btPow || 1); break;
      case 'lucky': v = dur * 1; break;
      case 'secondwind': case 'goldenheart': v = dur * 1.5; break;
      case 'invuln': case 'rainveil': v = dur * 6 * urg; break;
      case 'reflect': v = dur * 4; break;
      case 'phase': v = dur * 3; break;
      case 'rotation': v = 2 * n; break;
      case 'taunt': {
        const worst = c.alive('enemy').filter(o => o !== a).reduce((m, o) => Math.max(m, (1 - o.hp / o.maxHp) * (o.tier === 'boss' ? 1.5 : 1)), 0);
        v = (3 + 12 * worst) * (a.hp / a.maxHp); break;
      }
      default: v = 2 * dur;
    }
    return v * imp;
  }
  function statusValue(c, u, t, id, stacks, turns, th) {
    const d = SBR.STATUS[id];
    if (!d || !t || t.dead) return 0;
    const n = Math.max(1, stacks || 0), dur = d.mode === 'turns' ? (turns || stacks || 1) : (turns || 2);
    const good = t.side === u.side;
    let v;
    if (d.kind === 'debuff') {
      if (good) return -3 * dur;   // a debuff on its own side is a cost
      if (immuneTo(c, t, id)) return 0;
      v = debuffVal(c, id, n, dur, t, th, c.alive('enemy').length) * CFG.statusW;
    } else {
      if (!good) return -buffVal(c, id, n, dur, t) * 0.5;
      v = buffVal(c, id, n, dur, t) * CFG.statusW;
    }
    // already there: only the extra part counts
    const s = c.st(t, id);
    if (s) {
      if (d.mode === 'stacks') { const room = (d.max || 99) - s.stacks; v *= room <= 0 ? 0.05 : Math.min(1, room / n); }
      else if (s.turns >= dur) v *= 0.08;
      else v *= Math.max(0.15, (dur - s.turns) / dur);
    }
    return v;
  }

  /* ---------- the dry run ---------- */
  /** dry-run ability ab for unit u against target t; returns a score in HP points, or null if it can't be judged */
  function evaluate(c, u, ab, t, th, pl) {
    if (!isSafe(ab)) return null;
    let w = 1;
    const dmgBy = new Map();
    let score = 0;
    const noop = () => {};
    const x = {
      user: u, target: t, lvl: 1, round: c.round, spread: 1, targets: t ? [t] : [],
      enemies: c.foes(u), allies: c.friends(u),
      dmg: (tg, base, scale, o = {}) => {
        if (!tg || tg.dead) return { hit: false };
        const h = estHit(c, u, tg, base, scale, o, ab);
        const r = dmgBy.get(tg) || { exp: 0, max: 0, crit: 0, hitP: 1, cc: 0, w: 1 };
        r.exp += h.exp * w; r.max += h.max; r.crit += h.crit; r.hitP = Math.min(r.hitP, h.hitP); r.cc = Math.max(r.cc, h.cc || 0); r.w = Math.min(r.w, w);
        if (h.reflect && u.side !== tg.side) score -= h.reflect * w * (1 + (1 - u.hp / u.maxHp));
        dmgBy.set(tg, r);
        return { hit: h.hitP > 0, amount: Math.round(h.max), crit: false, blocked: false };
      },
      heal: (tg, base, scale) => {
        if (!tg || tg.dead) return 0;
        const amt = Math.round(c.scaleVal(u, base, scale)), gain = Math.min(amt, tg.maxHp - tg.hp);
        const imp = tg.tier === 'boss' ? 1.3 : tg.tier === 'elite' ? 1.15 : 1;
        score += (tg.side === u.side ? 1 : -1) * gain * urgency(tg) * imp * poolNorm(c, tg) * w;
        return gain;
      },
      status: (tg, id, stacks = 0, turns = 0) => { score += statusValue(c, u, tg, id, stacks, turns, th) * w; },
      removeStatus: (tg, id) => { const d = SBR.STATUS[id]; if (!d || !tg || !c.has(tg, id)) return; const mine = tg.side === u.side; score += ((d.kind === 'debuff') === mine ? 4 : -4) * w; },
      cleanse: (tg, n = 1) => { if (!tg) return; const k = tg.statuses.filter(s => { const d = SBR.STATUS[s.id]; return d && d.kind === 'debuff' && !d.permanent; }).length; score += (tg.side === u.side ? 1 : -1) * CFG.cleanse * Math.min(n, k) * w; },
      stacks: (tg, id) => c.stacks(tg, id),
      has: (tg, id) => c.has(tg, id),
      roll: p => { w *= U.clamp(p, 0, 1); return true; },
      energy: (tg, n) => { if (!tg) return; score += (tg.side === u.side ? 2.5 * n : -4 * n * (th.get(tg) || 1)) * w; },
      log: noop, say: noop, dialogue: noop, achieve: noop, money: noop, setFlag: noop, unlockFlag: noop, snapshot: noop, rewind: noop,
      summon: () => { if (c.alive('enemy').length < 5) score += CFG.summon * w; return null; },
      summonAlly: () => null,
      owner: u,
      taunters: () => c.tauntersAgainst(u),
      kill: tg => { if (tg && tg.side !== u.side && !tg.dead) score += (effHp(c, tg) + killBonus(tg) * (th.get(tg) || 1)) * w; },
      killAlly: noop,
      revive: () => { score += 20 * w; },
      randomEnemy: () => t && t.side !== u.side ? t : c.foes(u)[0],
      flag: k => c.flags[k],
      getSnapshot: k => c.snaps[k],
      timeStop: () => { score += 25 * w; }, extraAction: () => { score += 10 * w; },
      count: id => c.alive(u.side === 'party' ? 'enemy' : 'party').filter(o => c.has(o, id)).length,
    };
    try { ab.run(x); } catch (e) { return null; }
    // damage: capped at what can be taken, weighted by threat and wounds, with a kill bonus
    dmgBy.forEach((r, tg) => {
      if (tg.side === u.side) { score -= r.exp * (tg.tier === 'boss' ? 1.5 : 1); return; }
      score += hitValue(c, tg, r, th, pl);
    });
    return score;
  }
  /** what landing r = {exp, max, crit, hitP, cc, w} on rider tg is worth */
  function hitValue(c, tg, r, th, pl) {
    const T = th.get(tg) || 1, sh = c.stacks(tg, 'shield'), eh = tg.hp + sh, frac = tg.hp / tg.maxHp;
    const dealt = Math.min(r.exp, eh), intoShield = Math.min(dealt, sh);
    // chipping a shield is worth a third; wounds make every point count for more
    let v = (dealt - intoShield * 0.65) * T * (1 + CFG.wounded * (1 - frac));
    const pk = r.max >= eh ? r.hitP : r.crit >= eh ? r.hitP * (r.cc || 0) : 0;
    v += pk * (r.w == null ? 1 : r.w) * killBonus(tg) * T;
    if (!tg.summon && pendingDot(c, tg) >= tg.hp) v *= 0.3;            // the bleed will finish them anyway
    if (c.has(tg, 'guard') || c.has(tg, 'evasive')) v *= CFG.braced;   // don't swing into a brace
    if (pl.focus === tg) v *= 1 + CFG.focus;
    return v;
  }
  const costOf = a => (a.cost != null ? a.cost : a.cd >= 3 ? 2 : a.cd >= 1 ? 1 : 0);
  const resCost = a => CFG.costE * costOf(a) + CFG.costCd * (a.cd || 0);

  /** a move's best score over its possible targets (and which target that was) */
  function judge(c, u, ab, th, pl) {
    let cands;
    if (ab.target === 'enemy') cands = c.alive('party');
    else if (ab.target === 'ally') cands = c.friends(u);
    else if (ab.target === 'self') cands = [u];
    else cands = [null];
    let best = null, bt = null;
    const per = new Map();
    for (const t of cands) {
      const v = evaluate(c, u, ab, t, th, pl);
      if (v == null) return { score: null, per: null };
      per.set(t, v);
      if (best == null || v > best) { best = v; bt = t; }
    }
    return { score: best == null ? null : best - resCost(ab), target: bt, per };
  }

  /* ---------- hooks used by combat.js enemyAct ---------- */
  const P = SBR.Combat.prototype;
  const on = (c, u) => api.enabled && u && u.side === 'enemy' && !c.has(u, 'raptor');

  P.aiChooseAbility = function (u, opts, cost) {
    if (!on(this, u) || !opts.length) return null;
    const s = api.smartness(this, u);
    const tier = SBR.threatTier ? SBR.threatTier() : 0;
    const n = this.alive('party').length;
    const prior = a => (a.w || 1) * (1 + tier * 0.35 * cost(a)) * (a.target === 'allEnemies' && n >= 3 ? 1 + tier * 0.3 : 1);
    if (opts.length === 1 || s <= 0) return null;
    const pl = plan(this), th = pl.th;
    const J = opts.map(a => ({ a, j: judge(this, u, a, th, pl) }));
    const known = J.filter(e => e.j.score != null).map(e => e.j.score).sort((a, b) => a - b);
    if (!known.length) return null;
    const med = known[Math.floor(known.length / 2)];
    const top = Math.max(1, known[known.length - 1]);
    u._aiJudged = { round: this.round, map: new Map(J.map(e => [e.a, e.j])) };
    const pick = U.weighted(J, e => {
      const sc = e.j.score == null ? med : e.j.score;
      const z = Math.max(0, sc) / top;
      return prior(e.a) * Math.exp(s * CFG.K * (z - 1));
    });
    api.stats.choices++;
    return pick.a;
  };

  /** single-target pick: aggro odds (Taunt kept at 85%) reshaped by what this move would do to each rider */
  P.aiPickTarget = function (u, ab, exclude = []) {
    if (!on(this, u)) return this.pickPartyTarget(exclude);
    const list = this.targetWeights(this.alive('party').filter(p => !exclude.includes(p)), { u, ab });
    if (!list.length) return null;
    return U.weighted(list, e => e.w).u;
  };

  /** ally-target moves: the ally this move helps most (heals the lowest, empowers the hardest hitter) */
  P.aiPickAlly = function (u, ab) {
    if (!on(this, u)) return null;
    const s = api.smartness(this, u);
    const pl = plan(this);
    const J = u._aiJudged && u._aiJudged.round === this.round && u._aiJudged.map.get(ab);
    const j = J && J.per ? J : judge(this, u, ab, pl.th, pl);
    if (!j.per) return null;
    const cands = [...j.per.entries()];
    const top = Math.max(1, ...cands.map(e => e[1]));
    const ws = cands.map(e => ({ t: e[0], w: Math.exp(s * CFG.Kt * (Math.max(0, e[1]) / top - 1)) }));
    return U.weighted(ws, e => e.w).t;
  };

  /** aggro odds with the tactical read folded in. ctx {u, ab} scores a specific move; without it a nominal hit is used
      (that is what the aggro badges on the party cards show) */
  const tw = P.targetWeights;
  P.targetWeights = function (cands = this.alive('party'), ctx = null) {
    const list = tw.call(this, cands);
    if (!api.enabled || list.length < 2) return list;
    const actor = ctx && ctx.u || this.enemies().find(e => e === this.current()) || this.enemies()[0];
    if (!actor) return list;
    const s = api.smartness(this, actor);
    if (s <= 0) return list;
    const pl = plan(this), th = pl.th;
    const vals = list.map(e => {
      let v = ctx && ctx.ab ? evaluate(this, actor, ctx.ab, e.u, th, pl) : null;
      if (v == null) {
        v = hitValue(this, e.u, estHit(this, actor, e.u, 6, {}, {}, null), th, pl);
      }
      return Math.max(0, v);
    });
    const top = Math.max(0.5, ...vals);
    list.forEach((e, i) => { e.w *= Math.exp(s * CFG.Kt * (vals[i] / top - 1)); });
    // Taunt: taunters keep drawing 85% of single-target attacks between them
    const T = list.filter(e => this.has(e.u, 'taunt')), N = list.filter(e => !this.has(e.u, 'taunt'));
    if (T.length && N.length) {
      const sT = T.reduce((a, e) => a + e.w, 0), sN = N.reduce((a, e) => a + e.w, 0);
      const k = (sN * 0.85 / 0.15) / sT;
      T.forEach(e => { e.w *= k; });
    }
    const tot = list.reduce((a, e) => a + e.w, 0) || 1;
    list.forEach(e => { e.p = e.w / tot; });
    return list;
  };

  /* ---------- what the table remembers: who has been dealing the damage ---------- */
  const damage = P.damage;
  P.damage = function (src, tgt, base, scale, opts = {}, ability = null) {
    const r = damage.call(this, src, tgt, base, scale, opts, ability);
    if (src && src.side === 'party' && tgt && tgt.side === 'enemy' && r && r.amount) {
      const who = src.summon ? src.owner : src.uid;
      (this._aiDealt || (this._aiDealt = {}))[who] = (this._aiDealt[who] || 0) + r.amount;
    }
    return r;
  };

  api.stats = { choices: 0 };
  api._evaluate = evaluate; api._isSafe = isSafe; api._estHit = estHit;
  return api;
})();
