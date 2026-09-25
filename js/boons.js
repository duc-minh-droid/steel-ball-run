/* Techniques that change the rules, not just the numbers. Each is a trade-off, bought with RP
   in the Saloon like the others; the flags below are read by the hooks at the bottom of this file. */
'use strict';
Object.assign(SBR.TECHNIQUES, {
  requiem:    { name: 'Requiem', slots: 2, cost: 60, tag: 'RULE', desc: 'Everything you throw hits 35% harder. In battle, your riders fight at 70% of their max HP.', bonus: { dmg: 0.35, glass: 0.7 }, unlock: 'act3', unlockText: 'Clear Act III.' },
  discipline: { name: 'Golden Rectangle Discipline', slots: 3, cost: 80, tag: 'RULE', desc: 'No natural Energy each turn. Instead, every free attack you land gives +2 Energy. Rhythm is everything.', bonus: { discipline: 1 }, unlock: 'golden', unlockText: 'Learn the Golden Rectangle.' },
  gambler:    { name: 'D\'Arby\'s Wager', slots: 1, cost: 30, tag: 'RULE', desc: 'Every skill check rolls twice and keeps the better die. A failed check still costs the roller 15% HP. "Good!"', bonus: { gambler: 1 }, unlock: 'nat20', unlockText: 'Roll a natural 20.' },
  lonewolf:   { name: 'Lone Wolf', slots: 2, cost: 50, tag: 'RULE', desc: 'When your lead is the only rider still standing, they deal +60% damage, gain +1 Energy a turn and dodge 20% more.', bonus: { lonewolf: 1 }, unlock: 'tim', unlockText: 'Ride with Mountain Tim.' },
  hunted:     { name: 'Wanted Poster', slots: 2, cost: 40, tag: 'RULE', desc: 'The President\'s men know your face from day one (+2 Threat at the start). Money and XP +40%.', bonus: { money: 0.4, xp: 0.4, hunted: 2 }, unlock: 'act2', unlockText: 'Clear Act II.' },
  express:    { name: 'Express Rider', slots: 2, cost: 45, tag: 'RULE', desc: 'One fewer encounter card every stage, but +8 Pace each stage and +25% XP. Less choice, more road.', bonus: { cards: -1, paceStage: 8, xp: 0.25 }, unlock: 'top3x3', unlockText: 'Place top 3 in three sprints.' },
  bloodpact:  { name: 'Stone Mask Pact', slots: 3, cost: 75, tag: 'RULE', desc: 'All healing is halved. Every hit your riders land heals them for 20% of the damage.', bonus: { heal: -0.5, bloodpact: 0.2 }, unlock: 'corpse5', unlockText: 'Hold 5 Corpse Parts at once.' },
  ambush:     { name: 'THE WORLD\'s Opening', slots: 3, cost: 90, tag: 'RULE', desc: 'Enemies lose their first turn of every battle, frozen in time. Your riders start every battle with 1 less Energy.', bonus: { ambush: 1, energyStart: -1 }, unlock: 'diego', unlockText: 'Defeat Diego in a rival encounter.' },
});

(() => {
  // riders who already earned the unlock see the new techniques straight away
  const m = SBR.meta;
  if (m && m.achievements && m.unlockedTech) Object.entries(SBR.TECHNIQUES).forEach(([k, t]) => { if (t.unlock && m.achievements[t.unlock] && !m.unlockedTech.includes(k)) m.unlockedTech.push(k); });

  const P = SBR.Combat.prototype;
  const soloLead = c => { const alive = c.alive('party'); const lead = SBR.run && SBR.run.lead; return alive.length === 1 && alive[0].id === lead ? alive[0] : null; };

  // Requiem: riders fight at a fraction of their max HP; Wanted Poster: threat on the first fight
  const Base = SBR.Combat;
  SBR.Combat = class extends Base {
    constructor(e, o) {
      super(e, o);
      const b = this.bonus;
      if (b.glass) this.party().forEach(u => { u.maxHp = Math.max(1, Math.round(u.maxHp * b.glass)); u.hp = Math.min(u.hp, u.maxHp); });
      const r = SBR.run;
      if (b.hunted && r && !r.flags.huntedPoster) { r.flags.huntedPoster = true; if (SBR.game && SBR.game.G) SBR.game.G.threat(b.hunted); }
    }
  };

  const beginTurn = P.beginTurn;
  P.beginTurn = function (u) {
    const b = this.bonus;
    // THE WORLD's Opening: enemies lose round 1
    if (b.ambush && this.round <= 1 && u.side === 'enemy' && !u.dead) {
      this.push({ t: 'turn', uid: u.uid });
      this.push({ t: 'float', uid: u.uid, text: 'TIME STOPPED', cls: 'debuff big' });
      return { skip: true };
    }
    const before = u.energy || 0;
    const res = beginTurn.call(this, u);
    if (u.side === 'party') {
      // Golden Rectangle Discipline: the natural point is taken back
      if (b.discipline && (u.energy || 0) > before) u.energy = Math.max(before, u.energy - 1);
      if (b.lonewolf && soloLead(this) === u) { u.energy = Math.min(u.maxEnergy || 6, (u.energy || 0) + 1); this.push({ t: 'float', uid: u.uid, text: 'LONE WOLF', cls: 'buff' }); }
    }
    return res;
  };

  const useAbility = P.useAbility;
  P.useAbility = function (u, abId, t) {
    const ab = SBR.ABILITIES[abId];
    const ok = useAbility.call(this, u, abId, t);
    if (ok && this.bonus.discipline && u.side === 'party' && ab && ab.cost === 0 && !u.dead) {
      u.energy = Math.min(u.maxEnergy || 6, (u.energy || 0) + 2);
      this.push({ t: 'float', uid: u.uid, text: '+2 ENERGY', cls: 'energy' });
    }
    return ok;
  };

  const damage = P.damage;
  P.damage = function (src, tgt, base, scale, opts, ability) {
    const b = this.bonus;
    if (b.lonewolf && src && src.side === 'party' && soloLead(this) === src) base *= 1.6;
    const hp0 = tgt ? tgt.hp : 0;
    const r = damage.call(this, src, tgt, base, scale, opts, ability);
    if (b.bloodpact && r && r.hit && src && src.side === 'party' && !src.dead && tgt) {
      const dealt = Math.max(0, hp0 - tgt.hp);
      if (dealt > 0) this.heal(null, src, Math.max(1, Math.round(dealt * b.bloodpact / Math.max(0.1, 1 + (b.heal || 0)))));
    }
    return r;
  };

  // Lone Wolf dodge
  if (P.dodgeChance) {
    const dodge = P.dodgeChance;
    P.dodgeChance = function (u) { return dodge.call(this, u) + (this.bonus.lonewolf && soloLead(this) === u ? 0.2 : 0); };
  }

  // D'Arby's Wager: roll twice, keep the best; a failure costs 15% HP
  SBR.boonRoll = () => { const r1 = SBR.util.randInt(1, 20); if (!SBR.run || !SBR.bonus().gambler) return r1; return Math.max(r1, SBR.util.randInt(1, 20)); };
  const dice = SBR.ui.diceCheck;
  SBR.ui.diceCheck = function (o) {
    return dice.call(this, o).then(ok => {
      if (!ok && SBR.run && SBR.bonus().gambler && o.who) { const m = o.who; const loss = Math.max(1, Math.round(m.maxHp * 0.15)); m.hp = Math.max(1, m.hp - loss); SBR.toast(`D'Arby collects: <b>${SBR.CHARS[m.id].short}</b> loses ${loss} HP.`, 'bad'); }
      return ok;
    });
  };
})();
