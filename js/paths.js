/* Paths: this game's subclasses. Each lead character (Johnny, Gyro, Mountain Tim, Hot Pants) can walk one of three
   Paths per run. A Path is learned from a trainer met on the road (see the events at the bottom), gives a passive,
   innate resistances, and three abilities that unlock at levels 1, 3 and 5. Taking one closes the other two. */
'use strict';

/* ---------------- Path abilities ---------------- */
(() => {
  const A = SBR.ABILITIES;
  const hpPct = t => t.hp / t.maxHp;

  // Johnny — Jockey
  A.gallop_charge = { name: 'Gallop Charge', cost: 1, cd: 1, target: 'enemy', tags: [], dtype: 'phys', fx: 'hit',
    desc: l => `Ride straight through them. ${l > 1 ? 10 : 8} base, scales with RIDING. Gain Evasive 1.`,
    run(x) { x.dmg(x.target, x.lvl > 1 ? 10 : 8, { ride: 0.05 }); x.status(x.user, 'evasive', 0, 1); } };
  A.trample = { name: 'Trample', cost: 2, cd: 2, target: 'allEnemies', tags: [], dtype: 'phys', fx: 'aoe',
    desc: l => `Hooves come down on everyone. Hits all enemies and Weakens them for ${l > 1 ? 2 : 1} turn.`,
    run(x) { x.enemies.forEach(e => { const r = x.dmg(e, 6, { ride: 0.04 }); if (r.hit) x.status(e, 'weak', 0, x.lvl > 1 ? 2 : 1); }); } };
  A.dancer_leap = { name: 'Slow Dancer\'s Leap', cost: 2, cd: 4, target: 'self', tags: [], fx: 'buff',
    desc: l => `The horse clears the ravine. Heal ${l > 1 ? 12 : 8}, gain Evasive 2 and Second Wind 2.`,
    run(x) { x.heal(x.user, x.lvl > 1 ? 12 : 8, { ride: 0.05 }); x.status(x.user, 'evasive', 0, 2); x.status(x.user, 'secondwind', 0, 2); } };
  // Johnny — Nail Gunner
  A.ten_nails = { name: 'Ten-Nail Volley', cost: 1, cd: 1, target: 'enemy', tags: ['gun', 'stand'], fx: 'nail',
    desc: l => `Fire every finger. ${l > 1 ? 4 : 3} nails at random enemies, each with a 35% chance to leave a Nail Hole.`,
    run(x) { for (let i = 0; i < (x.lvl > 1 ? 4 : 3); i++) { const t = x.randomEnemy(); if (!t) break; const r = x.dmg(t, 3, { aim: 0.03 }, { label: 'NAIL' }); if (r.hit && x.roll(0.35)) x.status(t, 'holed', 1); } } };
  A.nail_storm = { name: 'Fingernail Storm', cost: 2, cd: 3, target: 'allEnemies', tags: ['gun', 'stand'], fx: 'nail',
    desc: l => `A spinning hail of nails. Hits all enemies and leaves ${l > 1 ? 2 : 1} Nail Hole on each.`,
    run(x) { x.enemies.forEach(e => { const r = x.dmg(e, 5, { aim: 0.04 }); if (r.hit) x.status(e, 'holed', x.lvl > 1 ? 2 : 1); }); } };
  A.nail_bloom = { name: 'Nail Bloom', cost: 2, cd: 3, target: 'enemy', tags: ['gun', 'stand', 'spin'], fx: 'nail', dtype: 'spin',
    desc: l => `Every hole spins at once. Deals ${l > 1 ? 6 : 5}× the target's Nail Holes, then the holes close.`,
    run(x) { const h = x.stacks(x.target, 'holed'); x.dmg(x.target, Math.max(4, h * (x.lvl > 1 ? 6 : 5)), { aim: 0.02 }, { noDodge: true, label: h ? 'BLOOM' : undefined }); if (h) x.removeStatus(x.target, 'holed'); } };
  // Johnny — Heir to the Golden Spin
  A.golden_nail = { name: 'Golden Nail', cost: 1, cd: 1, target: 'enemy', tags: ['gun', 'stand', 'spin'], fx: 'golden', dtype: 'spin',
    desc: l => `A nail fired along the Golden Rectangle. Gain ${l > 1 ? 2 : 1} Rotation.`,
    run(x) { x.dmg(x.target, 7, { aim: 0.03, spin: 0.04 }); x.status(x.user, 'rotation', x.lvl > 1 ? 2 : 1); } };
  A.rectangle_sight = { name: 'Rectangle Sight', cost: 1, cd: 3, target: 'self', tags: ['stand'], fx: 'buff',
    desc: l => `The ratio is in everything. Gain Golden Heart ${l > 1 ? 3 : 2} and Lucky 2.`,
    run(x) { x.status(x.user, 'goldenheart', 0, x.lvl > 1 ? 3 : 2); x.status(x.user, 'lucky', 0, 2); } };
  A.infinite_seed = { name: 'Seed of Infinity', cost: 3, cd: 5, target: 'enemy', tags: ['gun', 'stand', 'spin'], fx: 'act4', dtype: 'spin', pierce: true,
    desc: () => 'Piercing Spin. If the target is below half HP, it is caught in Infinite Rotation.',
    run(x) { x.dmg(x.target, 16, { spin: 0.05, aim: 0.03 }, { pierce: true, noDodge: true }); if (!x.target.dead && hpPct(x.target) < 0.5) x.status(x.target, 'infinite', 1); } };

  // Gyro — Executioner
  A.executioner_mark = { name: 'Executioner\'s Mark', cost: 1, cd: 1, target: 'enemy', tags: ['spin'], fx: 'ball',
    desc: l => `A ball aimed at the arteries. Inflicts ${l > 1 ? 4 : 3} Bleed.`,
    run(x) { const r = x.dmg(x.target, 6, { spin: 0.04 }); if (r.hit) x.status(x.target, 'bleed', x.lvl > 1 ? 4 : 3); } };
  A.gallows_spin = { name: 'Gallows Spin', cost: 2, cd: 2, target: 'enemy', tags: ['spin'], fx: 'ball',
    desc: l => `The sentence is carried out. Triple damage against targets below 35% HP${l > 1 ? ', and refunds 1 Energy if it kills' : ''}.`,
    run(x) { const low = hpPct(x.target) < 0.35; x.dmg(x.target, low ? 30 : 10, { spin: 0.05 }, { label: low ? 'EXECUTE' : undefined }); if (x.lvl > 1 && x.target.dead) x.energy(x.user, 1); } };
  A.royal_sentence = { name: 'Royal Sentence', cost: 3, cd: 5, target: 'enemy', tags: ['spin'], fx: 'ballbreaker', pierce: true,
    desc: () => 'The Zeppeli family\'s final duty. Piercing Spin that Ages the target; below half HP it is also Spun.',
    run(x) { x.dmg(x.target, 18, { spin: 0.07 }, { pierce: true, noDodge: true }); if (!x.target.dead) { x.status(x.target, 'aged', 0, 2); if (hpPct(x.target) < 0.5) x.status(x.target, 'stun', 0, 1); } } };
  // Gyro — Physician
  A.suture_spin = { name: 'Suture Spin', cost: 1, cd: 1, target: 'ally', tags: ['spin', 'heal'], fx: 'heal',
    desc: l => `Stitches pulled by rotation. Heal an ally and give Regen ${l > 1 ? 3 : 2}.`,
    run(x) { x.heal(x.target, 6, { res: 0.05, spin: 0.02 }); x.status(x.target, 'regen', 0, x.lvl > 1 ? 3 : 2); } };
  A.nerve_block = { name: 'Nerve Block', cost: 1, cd: 3, target: 'allAllies', tags: ['spin', 'heal'], fx: 'buff',
    desc: l => `A ball against the spine numbs the pain. All allies gain Rider's Calm ${l > 1 ? 3 : 2} and lose 1 debuff.`,
    run(x) { x.allies.forEach(a => { x.status(a, 'calm', 0, x.lvl > 1 ? 3 : 2); x.cleanse(a, 1); }); } };
  A.zeppeli_surgery = { name: 'Zeppeli Surgery', cost: 3, cd: 5, target: 'allAllies', tags: ['spin', 'heal'], fx: 'heal',
    desc: () => 'Field surgery for everyone. Heals all allies and gives each an 8-point Shield.',
    run(x) { x.allies.forEach(a => { x.heal(a, 10, { res: 0.05 }); x.status(a, 'shield', 8); }); } };
  // Gyro — Golden Rider
  A.horse_rotation = { name: 'Horse Rotation', cost: 1, cd: 1, target: 'self', tags: ['spin'], fx: 'buff',
    desc: l => `Borrow the horse's stride. Gain ${l > 1 ? 4 : 3} Rotation.`,
    run(x) { x.status(x.user, 'rotation', x.lvl > 1 ? 4 : 3); } };
  A.spin_gallop = { name: 'Spinning Gallop', cost: 2, cd: 2, target: 'allEnemies', tags: ['spin'], fx: 'aoe',
    desc: l => `Two balls orbit the horse's legs. Hits all enemies${l > 1 ? ' and Spins one at random' : ''}.`,
    run(x) { x.enemies.forEach(e => x.dmg(e, 7, { spin: 0.04, ride: 0.02 })); if (x.lvl > 1) { const t = x.randomEnemy(); if (t) x.status(t, 'stun', 0, 1); } } };
  A.rider_breaker = { name: 'Rider\'s Breaker', cost: 3, cd: 4, target: 'enemy', tags: ['spin'], fx: 'golden', pierce: true,
    desc: () => 'Consume all Rotation. Piercing Spin that gains +4 base per stack consumed.',
    run(x) { const rot = x.stacks(x.user, 'rotation'); if (rot) x.removeStatus(x.user, 'rotation'); x.dmg(x.target, 12 + rot * 4, { spin: 0.06, ride: 0.03 }, { pierce: true }); } };

  // Mountain Tim — Sheriff
  A.quickdraw = { name: 'Quickdraw', cost: 1, cd: 1, target: 'enemy', tags: ['gun'], fx: 'gun',
    desc: l => `Faster than a blink. Cannot be dodged${l > 1 ? ', and always crits against Exposed targets' : ''}.`,
    run(x) { x.dmg(x.target, 7, { aim: 0.05 }, { noDodge: true, forceCrit: x.lvl > 1 && x.has(x.target, 'vuln') }); } };
  A.lasso_arrest = { name: 'Lasso Arrest', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], fx: 'rope',
    desc: l => `"You're under arrest." Spins the target for 1 turn and Exposes it for ${l > 1 ? 3 : 2}.`,
    run(x) { x.status(x.target, 'stun', 0, 1); x.status(x.target, 'vuln', 0, x.lvl > 1 ? 3 : 2); } };
  A.high_noon = { name: 'High Noon', cost: 3, cd: 5, target: 'allEnemies', tags: ['gun'], fx: 'gun',
    desc: () => 'The clock strikes twelve. Shoots every enemy; cannot be dodged.',
    run(x) { x.enemies.forEach(e => x.dmg(e, 9, { aim: 0.05 }, { noDodge: true })); } };
  // Mountain Tim — Lonesome Rope
  A.rope_slip = { name: 'Rope Slip', cost: 1, cd: 2, target: 'self', tags: ['stand'], fx: 'buff',
    desc: l => `Tim's body comes apart along the rope. Gain Evasive 2 and Empowered ${l > 1 ? 2 : 1}.`,
    run(x) { x.status(x.user, 'evasive', 0, 2); x.status(x.user, 'empower', 0, x.lvl > 1 ? 2 : 1); } };
  A.split_lash = { name: 'Split Lash', cost: 2, cd: 2, target: 'enemy', tags: ['stand'], fx: 'rope',
    desc: l => `Pieces of Tim strike from ${l > 1 ? 4 : 3} directions at once.`,
    run(x) { for (let i = 0; i < (x.lvl > 1 ? 4 : 3); i++) { if (x.target.dead) break; x.dmg(x.target, 4, { ride: 0.03, grit: 0.02 }, { label: 'LASH' }); } } };
  A.reel_in = { name: 'Reel In', cost: 2, cd: 4, target: 'enemy', tags: ['stand'], fx: 'rope',
    desc: l => `The rope runs through their body. Hooks the target for ${l > 1 ? 3 : 2} turns (no natural Energy).`,
    run(x) { x.dmg(x.target, 10, { ride: 0.03, aim: 0.03 }); x.status(x.target, 'hooked', 0, x.lvl > 1 ? 3 : 2); } };
  // Mountain Tim — Rancher
  A.corral_guard = { name: 'Corral Guard', cost: 1, cd: 2, target: 'ally', tags: ['stand'], fx: 'buff',
    desc: l => `Rope pens an ally in. Give a ${l > 1 ? 14 : 10}-point Shield and Guard 1.`,
    run(x) { x.status(x.target, 'shield', x.lvl > 1 ? 14 : 10); x.status(x.target, 'guard', 0, 1); } };
  A.stampede = { name: 'Stampede', cost: 2, cd: 3, target: 'allEnemies', tags: [], dtype: 'phys', fx: 'aoe',
    desc: l => `Tim's herd comes over the hill. Hits all enemies and Weakens them for ${l > 1 ? 2 : 1} turn.`,
    run(x) { x.enemies.forEach(e => { const r = x.dmg(e, 7, { grit: 0.04 }); if (r.hit) x.status(e, 'weak', 0, x.lvl > 1 ? 2 : 1); }); } };
  A.last_stand = { name: 'Last Stand', cost: 2, cd: 5, target: 'self', tags: [], fx: 'buff',
    desc: () => 'Plant your boots. Gain Taunt 2, Braced Leather 3 and Regen 3.',
    run(x) { x.status(x.user, 'taunt', 0, 2); x.status(x.user, 'armored', 0, 3); x.status(x.user, 'regen', 0, 3); } };

  // Hot Pants — Sister
  A.prayer_mend = { name: 'Prayer Mend', cost: 1, cd: 1, target: 'ally', tags: ['stand', 'heal'], fx: 'heal',
    desc: l => `Flesh laid over the wound with a prayer. Heal and Sanctify for ${l > 1 ? 3 : 2} turns.`,
    run(x) { x.heal(x.target, 7, { res: 0.05 }); x.status(x.target, 'sanctified', 0, x.lvl > 1 ? 3 : 2); } };
  A.confession = { name: 'Confession', cost: 2, cd: 3, target: 'allAllies', tags: ['heal'], fx: 'heal',
    desc: l => `"Tell me your sins." All allies lose ${l > 1 ? 2 : 1} debuff and heal a little.`,
    run(x) { x.allies.forEach(a => { x.cleanse(a, x.lvl > 1 ? 2 : 1); x.heal(a, 5, { res: 0.03 }); }); } };
  A.benediction = { name: 'Benediction', cost: 3, cd: 5, target: 'allAllies', tags: ['heal'], fx: 'heal', dtype: 'holy',
    desc: () => 'The Saint\'s blessing on everyone: heal, Sanctified 3 and Golden Heart 2.',
    run(x) { x.allies.forEach(a => { x.heal(a, 8, { res: 0.05 }); x.status(a, 'sanctified', 0, 3); x.status(a, 'goldenheart', 0, 2); }); } };
  // Hot Pants — Flesh Sprayer
  A.flesh_lash = { name: 'Flesh Lash', cost: 1, cd: 1, target: 'enemy', tags: ['stand'], fx: 'spray',
    desc: l => `A whip of sprayed meat. ${l > 1 ? 50 : 30}% chance to Blind.`,
    run(x) { const r = x.dmg(x.target, 7, { aim: 0.04, res: 0.02 }); if (r.hit && x.roll(x.lvl > 1 ? 0.5 : 0.3)) x.status(x.target, 'blind', 0, 1); } };
  A.flesh_flood = { name: 'Flesh Flood', cost: 2, cd: 3, target: 'allEnemies', tags: ['stand'], fx: 'spray',
    desc: l => `Fill the room with flesh. Hits all enemies and Blinds them for ${l > 1 ? 2 : 1} turn.`,
    run(x) { x.enemies.forEach(e => { const r = x.dmg(e, 5, { aim: 0.03 }); if (r.hit) x.status(e, 'blind', 0, x.lvl > 1 ? 2 : 1); }); } };
  A.flesh_crucible = { name: 'Flesh Crucible', cost: 3, cd: 4, target: 'enemy', tags: ['stand'], fx: 'spray',
    desc: () => 'Seal them inside living meat. Heavy Stand damage, then Exposed 2 and Weakened 2.',
    run(x) { const r = x.dmg(x.target, 14, { aim: 0.05, res: 0.03 }); if (r.hit) { x.status(x.target, 'vuln', 0, 2); x.status(x.target, 'weak', 0, 2); } } };
  // Hot Pants — Corpse Hunter
  A.relic_strike = { name: 'Relic Strike', cost: 1, cd: 1, target: 'enemy', tags: [], dtype: 'holy', fx: 'hit',
    desc: l => `Strike with a sliver of the Corpse. Holy damage${l > 1 ? '; heals you for half the damage dealt' : ''}.`,
    run(x) { const r = x.dmg(x.target, 8, { luck: 0.04, res: 0.03 }); if (x.lvl > 1 && r.hit && r.amount) x.heal(x.user, Math.round(r.amount / 2), {}); } };
  A.saints_judgement = { name: 'Saint\'s Judgement', cost: 2, cd: 3, target: 'enemy', tags: [], dtype: 'holy', fx: 'crit',
    desc: l => `Misfortune falls on the unworthy. +${l > 1 ? 75 : 50}% damage against elites and bosses.`,
    run(x) { const big = x.target.tier === 'elite' || x.target.tier === 'boss'; x.dmg(x.target, 12 * (big ? (x.lvl > 1 ? 1.75 : 1.5) : 1), { luck: 0.05 }); } };
  A.vatican_rite = { name: 'Vatican Rite', cost: 3, cd: 5, target: 'allEnemies', tags: [], dtype: 'holy', fx: 'aoe',
    desc: () => 'An old rite of exorcism. Holy damage to every enemy; every ally gains Sanctified 2.',
    run(x) { x.enemies.forEach(e => x.dmg(e, 10, { luck: 0.04, res: 0.03 })); x.allies.forEach(a => x.status(a, 'sanctified', 0, 2)); } };
})();

/* ---------------- Paths ---------------- */
SBR.PATHS = {
  jockey:       { char: 'johnny', name: 'Jockey', color: '#e8742a', acts: [1, 2, 3], stats: { ride: 3 }, bonus: { dodge: 0.06, init: 3 }, res: { phys: -0.1 },
    passive: '+3 RIDING, +6% dodge, +3 initiative. -10% Physical damage taken.', desc: 'Johnny was a genius jockey before he was anything else. The horse is the weapon.',
    abilities: [{ id: 'gallop_charge', level: 1 }, { id: 'trample', level: 3 }, { id: 'dancer_leap', level: 5 }] },
  nailgunner:   { char: 'johnny', name: 'Nail Gunner', color: '#8a5ad0', acts: [2, 3, 4], stats: { aim: 3 }, bonus: { bulletDmg: 0.1 }, res: { bullet: -0.1 },
    passive: '+3 AIM, +10% Gunshot damage. -10% Gunshot damage taken.', desc: 'Ten fingers, ten bullets. Tusk as a gatling gun.',
    abilities: [{ id: 'ten_nails', level: 1 }, { id: 'nail_storm', level: 3 }, { id: 'nail_bloom', level: 5 }] },
  goldenheir:   { char: 'johnny', name: 'Heir to the Golden Spin', color: '#f2c14e', acts: [4, 5, 6], stats: { spin: 3 }, bonus: { spinDmg: 0.12 }, res: { stand: -0.1 },
    passive: '+3 SPIN, +12% Spin damage. -10% Stand damage taken.', desc: 'What Gyro taught, Johnny inherits. The rotation that reaches infinity.',
    abilities: [{ id: 'golden_nail', level: 1 }, { id: 'rectangle_sight', level: 3 }, { id: 'infinite_seed', level: 5 }] },
  executioner:  { char: 'gyro', name: 'Royal Executioner', color: '#c8323c', acts: [1, 2, 3], stats: { spin: 2, luck: 2 }, bonus: { executeBonus: 0.3 }, res: { bleed: -0.15 },
    passive: '+2 SPIN, +2 LUCK. +30% damage to targets below 35% HP. -15% Bleed damage taken.', desc: 'The duty of the Zeppeli family: to carry out the sentence cleanly.',
    abilities: [{ id: 'executioner_mark', level: 1 }, { id: 'gallows_spin', level: 3 }, { id: 'royal_sentence', level: 5 }] },
  physician:    { char: 'gyro', name: 'Zeppeli Physician', color: '#6ad08a', acts: [2, 3, 4], stats: { res: 3 }, bonus: { heal: 0.2 }, res: { holy: -0.1, bleed: -0.1 },
    passive: '+3 RESOLVE, +20% healing. -10% Holy and Bleed damage taken.', desc: 'The Spin was medicine before it was a weapon.',
    abilities: [{ id: 'suture_spin', level: 1 }, { id: 'nerve_block', level: 3 }, { id: 'zeppeli_surgery', level: 5 }] },
  goldenrider:  { char: 'gyro', name: 'Golden Rider', color: '#f2c14e', acts: [4, 5, 6], stats: { ride: 3, spin: 2 }, bonus: { spinDmg: 0.08, init: 2 }, res: { phys: -0.1 },
    passive: '+3 RIDING, +2 SPIN, +8% Spin damage, +2 initiative. -10% Physical damage taken.', desc: 'The perfect rotation comes from the horse\'s stride.',
    abilities: [{ id: 'horse_rotation', level: 1 }, { id: 'spin_gallop', level: 3 }, { id: 'rider_breaker', level: 5 }] },
  sheriff:      { char: 'mountaintim', name: 'Sheriff', color: '#f2c14e', acts: [1, 2, 3], stats: { aim: 2 }, bonus: { bulletDmg: 0.08, crit: 0.04 }, res: { bullet: -0.1 },
    passive: '+2 AIM, +8% Gunshot damage, +4% crit. -10% Gunshot damage taken.', desc: 'Tim wears a star now. Outlaws hear the spurs and run.',
    abilities: [{ id: 'quickdraw', level: 1 }, { id: 'lasso_arrest', level: 3 }, { id: 'high_noon', level: 5 }] },
  lonesome:     { char: 'mountaintim', name: 'Lonesome Rope', color: '#e8742a', acts: [2, 3, 4], stats: { ride: 3 }, bonus: { dodge: 0.08 }, res: { stand: -0.1 },
    passive: '+3 RIDING, +8% dodge. -10% Stand damage taken.', desc: 'Oh! Lonesome Me, all the way: a body that comes apart and strikes from everywhere.',
    abilities: [{ id: 'rope_slip', level: 1 }, { id: 'split_lash', level: 3 }, { id: 'reel_in', level: 5 }] },
  rancher:      { char: 'mountaintim', name: 'Rancher', color: '#8a5a30', acts: [3, 4, 5], stats: { grit: 4 }, bonus: { maxHp: 12, block: 0.08 }, res: { phys: -0.1, cold: -0.15 },
    passive: '+4 GRIT, +12 max HP, +8% block. -10% Physical and -15% Cold damage taken.', desc: 'A cowboy who guards the herd. The party is the herd.',
    abilities: [{ id: 'corral_guard', level: 1 }, { id: 'stampede', level: 3 }, { id: 'last_stand', level: 5 }] },
  sister:       { char: 'hotpants', name: 'Sister of the Vatican', color: '#f6ecd8', acts: [1, 2, 3, 4], stats: { res: 3 }, bonus: { heal: 0.15 }, res: { holy: -0.2 },
    passive: '+3 RESOLVE, +15% healing. -20% Holy damage taken.', desc: 'Hot Pants took vows before she took a racehorse.',
    abilities: [{ id: 'prayer_mend', level: 1 }, { id: 'confession', level: 3 }, { id: 'benediction', level: 5 }] },
  fleshsprayer: { char: 'hotpants', name: 'Flesh Sprayer', color: '#e8508a', acts: [2, 3, 4, 5], stats: { aim: 2 }, bonus: { standDmg: 0.12 }, res: { bleed: -0.15 },
    passive: '+2 AIM, +12% Stand damage. -15% Bleed damage taken.', desc: 'Cream Starter as a weapon first and a bandage second.',
    abilities: [{ id: 'flesh_lash', level: 1 }, { id: 'flesh_flood', level: 3 }, { id: 'flesh_crucible', level: 5 }] },
  corpsehunter: { char: 'hotpants', name: 'Corpse Hunter', color: '#ffd84a', acts: [3, 4, 5, 6], stats: { luck: 2 }, bonus: { holyDmg: 0.15 }, res: { holy: -0.1, stand: -0.1 },
    passive: '+2 LUCK, +15% Holy damage. -10% Holy and Stand damage taken.', desc: 'The Vatican wants the Corpse. So does she, for her own reasons.',
    abilities: [{ id: 'relic_strike', level: 1 }, { id: 'saints_judgement', level: 3 }, { id: 'vatican_rite', level: 5 }] },
};
SBR.LEADS = ['johnny', 'gyro', 'mountaintim', 'hotpants'];
SBR.pathOf = m => (m && m.path && SBR.PATHS[m.path]) || null;
SBR.pathsFor = charId => Object.entries(SBR.PATHS).filter(([, p]) => p.char === charId).map(([id]) => id);
/** path ability ids a member has unlocked at their level */
SBR.pathAbilities = m => { const p = SBR.pathOf(m); return p ? p.abilities.filter(a => m.level >= a.level).map(a => a.id) : []; };

/* ---------------- Trainer enemies ---------------- */
(() => {
  const port = key => ({ kind: 'portrait', key });
  const E = SBR.ENEMIES;
  const trainer = (id, o) => { E[id] = Object.assign({ tier: 'elite', xp: 18, money: [20, 35], trainer: true }, o); };
  trainer('t_coach', { name: 'Old Harlan', title: 'Retired Derby Champion', art: port('coach'), hp: 60, stats: { ride: 9, aim: 3 }, dtype: 'phys', res: { phys: -0.2, bullet: 0.1 },
    abilities: [{ name: 'Crop Snap', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 6, { ride: 0.04 }) },
      { name: 'Outride', w: 2, cd: 2, target: 'self', fx: 'buff', run: x => x.status(x.user, 'evasive', 0, 2) },
      { name: 'Derby Charge', w: 2, cd: 3, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => x.dmg(e, 5, { ride: 0.03 })) }] });
  trainer('t_bounty', { name: 'Wade "Tenfinger" Colby', title: 'Bounty Hunter', art: port('bounty'), hp: 62, stats: { aim: 9 }, res: { bullet: -0.25 },
    abilities: [{ name: 'Fan the Hammer', w: 3, target: 'enemy', fx: 'gun', run: x => { for (let i = 0; i < 3; i++) x.dmg(x.target, 2, { aim: 0.03 }, { label: 'BANG' }); } },
      { name: 'Called Shot', w: 1, cd: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 12, { aim: 0.05 }, { noDodge: true }) }] });
  trainer('t_mason', { name: 'The Stonemason', title: 'Keeper of the Golden Ratio', art: port('mason'), hp: 78, stats: { spin: 6, grit: 6 }, dtype: 'spin', res: { spin: -0.3, phys: -0.2 },
    abilities: [{ name: 'Chisel Spin', w: 3, target: 'enemy', fx: 'ball', run: x => x.dmg(x.target, 7, { spin: 0.04 }) },
      { name: 'Perfect Ratio', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'empower', 0, 2); x.status(x.user, 'shield', 12); } }] });
  trainer('t_gregorio', { name: 'Gregorio Zeppeli', title: 'Royal Executioner of Naples', art: port('gregorio'), hp: 70, stats: { spin: 9, res: 5 }, dtype: 'spin', res: { spin: -0.3, bleed: -0.3 },
    abilities: [{ name: 'Iron Ball', w: 3, target: 'enemy', fx: 'ball', run: x => { const r = x.dmg(x.target, 6, { spin: 0.04 }); if (r.hit) x.status(x.target, 'bleed', 2); } },
      { name: 'Sentence', w: 1, cd: 3, target: 'enemy', fx: 'ball', run: x => x.dmg(x.target, x.target.hp / x.target.maxHp < 0.4 ? 18 : 8, { spin: 0.05 }) }] });
  trainer('t_doctor', { name: 'Dr. Abernathy', title: 'Frontier Surgeon', art: port('doctor'), hp: 55, stats: { res: 8 }, res: { bleed: -0.4, holy: -0.1 },
    abilities: [{ name: 'Scalpel', w: 3, target: 'enemy', fx: 'claw', run: x => x.dmg(x.target, 5, {}, { dtype: 'bleed' }) },
      { name: 'Tonic', w: 2, cd: 2, target: 'self', fx: 'heal', run: x => x.heal(x.user, 12, { res: 0.05 }) }] });
  trainer('t_whisperer', { name: 'Walking Wind', title: 'Horse Whisperer of the Plains', art: port('whisperer'), hp: 76, stats: { ride: 10, spin: 3 }, res: { phys: -0.2, sound: -0.2 },
    abilities: [{ name: 'Hoofbeat', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 7, { ride: 0.04 }) },
      { name: 'Herd Call', w: 1, cd: 3, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => x.dmg(e, 6, { ride: 0.03 })) }] });
  trainer('t_marshal', { name: 'Marshal Eli Crane', title: 'U.S. Marshal', art: port('marshal'), hp: 64, stats: { aim: 9, grit: 4 }, res: { bullet: -0.2 },
    abilities: [{ name: 'Peacemaker', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 7, { aim: 0.05 }) },
      { name: 'Warrant', w: 1, cd: 3, target: 'enemy', fx: 'debuff', run: x => x.status(x.target, 'vuln', 0, 2) }] });
  trainer('t_rodeo', { name: 'Lariat Lou', title: 'Rodeo Rope Artist', art: port('rodeo'), hp: 60, stats: { ride: 8, aim: 4 }, res: { phys: -0.1, stand: 0.1 },
    abilities: [{ name: 'Lariat Snap', w: 3, target: 'enemy', fx: 'rope', run: x => x.dmg(x.target, 6, { ride: 0.04 }) },
      { name: 'Hogtie', w: 1, cd: 3, target: 'enemy', fx: 'rope', run: x => x.status(x.target, 'hooked', 0, 1) }] });
  trainer('t_baron', { name: 'Cattle Baron Hollis', title: 'Owner of Half of Kansas', art: port('baron'), hp: 90, stats: { grit: 9 }, res: { phys: -0.25, cold: -0.2, bullet: 0.15 },
    abilities: [{ name: 'Cane Strike', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 6, { grit: 0.04 }) },
      { name: 'Hired Hands', w: 1, cd: 4, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'guard', 0, 2); x.status(x.user, 'shield', 14); } }] });
  trainer('t_abbess', { name: 'Mother Agatha', title: 'Abbess of the Order', art: port('abbess'), hp: 58, stats: { res: 9 }, dtype: 'holy', res: { holy: -0.5, stand: -0.2 },
    abilities: [{ name: 'Rod of Discipline', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 5, { res: 0.04 }) },
      { name: 'Vespers', w: 2, cd: 2, target: 'self', fx: 'heal', run: x => { x.heal(x.user, 10, { res: 0.05 }); x.status(x.user, 'sanctified', 0, 2); } }] });
  trainer('t_inquisitor', { name: 'Brother Silvio', title: 'Vatican Inquisitor', art: port('inquisitor'), hp: 66, stats: { aim: 7, res: 4 }, dtype: 'stand', res: { stand: -0.25, holy: -0.2 },
    abilities: [{ name: 'Flesh Nail', w: 3, target: 'enemy', fx: 'spray', run: x => x.dmg(x.target, 6, { aim: 0.04 }) },
      { name: 'Smother', w: 1, cd: 3, target: 'enemy', fx: 'spray', run: x => x.status(x.target, 'blind', 0, 2) }] });
  trainer('t_cardinal', { name: 'The Cardinal\'s Emissary', title: 'Seeker of Relics', art: port('cardinal'), hp: 80, stats: { luck: 8, res: 6 }, dtype: 'holy', res: { holy: -0.6, bleed: -0.2 },
    abilities: [{ name: 'Reliquary', w: 3, target: 'enemy', fx: 'crit', run: x => x.dmg(x.target, 7, { luck: 0.04 }) },
      { name: 'Anathema', w: 1, cd: 3, target: 'enemy', fx: 'debuff', run: x => { x.status(x.target, 'weak', 0, 2); x.status(x.target, 'fear', 0, 1); } }] });
})();

/* ---------------- Trainer encounters ----------------
   Each appears only while its character rides with you and has not yet walked a Path.
   Win the check or the duel and the Path is yours; turning it down still gives something. */
(() => {
  const T = [
    { path: 'jockey', foe: 't_coach', art: 'coach', title: 'The Old Derby Champion', blurb: 'An old man in racing silks is timing riders with a pocket watch.',
      text: '"I rode against your father, boy. You sit a horse like you were born on one... and you ride like you\'re afraid of falling." Harlan snaps his watch shut.',
      check: { stat: 'ride', dc: 13, label: 'Race him to the ridge' }, duel: 'Let him test you the hard way', decline: { label: 'Just ask about Johnny\'s father', text: 'He tells stories until the fire is embers. (Johnny +2 RIDING.)', fx: g => g.statUp('johnny', 'ride', 2) } },
    { path: 'nailgunner', foe: 't_bounty', art: 'bounty', title: 'Tenfinger Colby', blurb: 'A bounty hunter who shoots with both hands is using a fence post for practice.',
      text: '"They call me Tenfinger. Heard you shoot with your nails. That\'s ten guns, kid. Stop firing them one at a time."',
      check: { stat: 'aim', dc: 14, label: 'Match him shot for shot' }, duel: 'Draw on him', decline: { label: 'Trade for his ammunition', text: 'He sells you a powder horn at a fair price. Mostly fair.', fx: g => g.gear('powder_horn') } },
    { path: 'goldenheir', foe: 't_mason', art: 'mason', title: 'The Stonemason\'s Ratio', blurb: 'A mason carves spirals into a cathedral cornerstone.',
      text: '"1 to 1.618. The ratio is in the snail, the storm, the horse\'s stride. Your friend throws it. You... you could fire it."',
      check: { stat: 'spin', dc: 14, label: 'Find the spiral in the stone' }, duel: 'Prove it against his chisel', decline: { label: 'Buy his sketches', text: 'He draws the rectangle for you on a scrap of paper. (Johnny +2 SPIN.)', fx: g => g.statUp('johnny', 'spin', 2) } },
    { path: 'executioner', foe: 't_gregorio', art: 'gregorio', title: 'A Letter From Naples', blurb: 'A carriage bearing the Zeppeli crest waits by the trail.',
      text: 'Gregorio Zeppeli steps down. He does not greet his son. "You left Naples over one boy. Show me you can still carry out a sentence, Julius."',
      check: { stat: 'spin', dc: 15, label: 'Show him the family technique' }, duel: 'Face your father', decline: { label: 'Tell him about Marco', text: 'Gregorio listens without a word, then hands Gyro a ball of old Neapolitan steel.', fx: g => g.gear('steel_sphere') } },
    { path: 'physician', foe: 't_doctor', art: 'doctor', title: 'The Frontier Surgeon', blurb: 'A doctor is sawing a leg off a racer in the back of a wagon.',
      text: '"Zeppeli? The spinning-ball family? Then help me, dammit. This one\'s bleeding out and I\'ve got whiskey and a saw."',
      check: { stat: 'res', dc: 13, label: 'Save the racer with the Spin' }, duel: '"Prove you\'re not a quack" — he draws a scalpel', decline: { label: 'Leave him your supplies', text: 'The racer lives. The doctor presses a bottle into your hands.', fx: g => { g.item('snakeoil'); g.xp(15); } } },
    { path: 'goldenrider', foe: 't_whisperer', art: 'whisperer', title: 'The Horse Whisperer', blurb: 'A rider without a saddle circles your camp at a full gallop.',
      text: 'Walking Wind speaks to Gyro\'s horse before Gyro. "Your spin is weak because it starts in the arm. It should start in the ground."',
      check: { stat: 'ride', dc: 14, label: 'Ride bareback beside him' }, duel: 'Challenge him in the saddle', decline: { label: 'Let him tend the horses', text: 'The horses are calmer. So are you. (Party heals 30%.)', fx: g => g.healAll(0.3) } },
    { path: 'sheriff', foe: 't_marshal', art: 'marshal', title: 'The Marshal\'s Star', blurb: 'A U.S. Marshal is pinning wanted posters to a tree.',
      text: '"Mountain Tim. Half the territory says you\'re the best tracker alive. I\'m short a deputy and long on outlaws."',
      check: { stat: 'aim', dc: 13, label: 'Take the deputy\'s test' }, duel: 'Settle it the old way', decline: { label: 'Hand over the bandits you caught', text: 'The bounty is paid in silver. ($40.)', fx: g => g.money(40) } },
    { path: 'lonesome', foe: 't_rodeo', art: 'rodeo', title: 'Lariat Lou\'s Rodeo', blurb: 'A rope artist is lassoing flies out of the air for a crowd.',
      text: '"A man who can split himself along a rope? Buddy, that\'s the greatest act in the West. Show me what else it does."',
      check: { stat: 'ride', dc: 13, label: 'Perform for the crowd' }, duel: 'Rope-duel for the prize belt', decline: { label: 'Pass the hat around', text: 'The crowd pays well. ($30, a Canteen.)', fx: g => { g.money(30); g.item('canteen'); } } },
    { path: 'rancher', foe: 't_baron', art: 'baron', title: 'The Cattle Baron', blurb: 'Two thousand head of cattle block the trail.',
      text: '"These are my cows on my land, cowboy. You want through, you work a drive. Or you try your luck with my men."',
      check: { stat: 'grit', dc: 14, label: 'Work the cattle drive' }, duel: 'Fight your way through', decline: { label: 'Ride the long way round', text: 'It costs time, but a grateful drover gives you a buffalo coat for the cold ahead.', fx: g => { g.pace(-4); g.gear('buffalo_coat'); } } },
    { path: 'sister', foe: 't_abbess', art: 'abbess', title: 'The Abbess on the Road', blurb: 'Nuns are singing in a burned-out church.',
      text: 'Mother Agatha looks at Hot Pants for a long time. "You still wear the cross under that jacket, child. Have you forgotten how to pray?"',
      check: { stat: 'res', dc: 13, label: 'Pray with the sisters' }, duel: '"Then let the Lord judge it" — spar with her', decline: { label: 'Help rebuild the church', text: 'Hard work. The sisters give you a veil blessed at the altar.', fx: g => g.gear('nun_veil') } },
    { path: 'fleshsprayer', foe: 't_inquisitor', art: 'inquisitor', title: 'The Inquisitor', blurb: 'A Vatican agent in red is waiting at the crossroads.',
      text: '"Sister. The Cardinal is displeased. You were sent to take the Corpse, not to make friends. Show me Cream Starter still has teeth."',
      check: { stat: 'aim', dc: 14, label: 'Demonstrate on a target' }, duel: 'Show him on him', decline: { label: 'Send him away', text: 'He leaves, but he will report you. Hot Pants spends the night sharpening her will. (Hot Pants +2 RESOLVE.)', fx: g => g.statUp('hotpants', 'res', 2) } },
    { path: 'corpsehunter', foe: 't_cardinal', art: 'cardinal', title: 'The Cardinal\'s Emissary', blurb: 'A man with a gold-trimmed hat and a reliquary box.',
      text: '"The Holy See would reward whoever brings the Saint home. You have seen a part of Him, haven\'t you? Then you know what it can do."',
      check: { stat: 'luck', dc: 15, label: 'Read the omen in the reliquary' }, duel: 'Take the reliquary by force', decline: { label: 'Refuse him politely', text: 'He smiles and leaves a strip of burial linen. "For when you change your mind."', fx: g => g.gear('saint_bandage') } },
  ];
  T.forEach(t => {
    const P = SBR.PATHS[t.path], who = P.char, short = SBR.CHARS[who].short;
    SBR.EVENTS.push({
      id: 'path_' + t.path, acts: P.acts, type: 'trainer', title: t.title, blurb: t.blurb, icon: 'train', weight: 3, once: true, pace: -4, art: t.art,
      pathOffer: t.path,
      cond: g => g.canTakePath(who),
      text: t.text,
      html: `${t.text}<span class="ev-path" style="--pc:${P.color}">${SBR.PATH_EMBLEM ? '' : ''}<b>Path: ${P.name}</b> (${short}) — ${P.desc}<br><i>${P.passive}</i></span>`,
      choices: [
        { label: `${t.check.label} (${short}'s ${SBR.STATS[t.check.stat].name})`, check: { stat: t.check.stat, dc: t.check.dc, who },
          ok: { text: `${short} walks the Path of the ${P.name}.`, fx: g => g.takePath(t.path) },
          fail: { text: 'Not good enough. Not yet. The trainer turns away — but offers a duel instead.', fight: { enemies: [t.foe], elite: true, after: g => g.takePath(t.path) } } },
        { label: t.duel, ok: { text: 'Steel settles it.', fight: { enemies: [t.foe], elite: true, after: g => g.takePath(t.path) } } },
        { label: t.decline.label, ok: { text: t.decline.text, fx: t.decline.fx } },
      ],
    });
  });
})();

/* ---------------- Icons ---------------- */
(() => {
  const I = SBR.icons, P = I.P, K = I.K, st = I.st, shine = I.shine;
  const def = (id, fn) => I.define('ability', id, fn);
  const star5 = (x, y, r, c) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1); } return `<path d="${d}z" fill="${c}" ${st} stroke-width="1.6"/>`; };
  const nail = (x, y, rot, c = '#e8d8f0') => `<g transform="rotate(${rot} ${x} ${y})"><path d="M${x - 3} ${y - 8}q3-3 6 0v12l-3 5-3-5z" fill="${c}" ${st} stroke-width="1.4"/></g>`;
  const hoof = (x, y, c = '#8a8a9a') => `<path d="M${x - 7} ${y + 6}q-2-14 7-14t7 14h-4q0-8-3-8t-3 8z" fill="${c}" ${st} stroke-width="1.6"/>`;
  const speed = c => `<path d="M2 16h10M4 24h12M2 32h10" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`;
  const rope = (d, c = '#c8a070') => `<path d="${d}" fill="none" stroke="${K}" stroke-width="6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="4 2"/>`;
  const flesh = (c = '#f09ac0') => `<path d="M10 28q-4-14 10-16 4-8 12-4 10 2 8 12 6 8-2 14-8 6-16 2-12-2-12-8z" fill="${c}" ${st}/><path d="M16 24q4-4 8 0t8 0M18 32q4-3 8 0" stroke="#c8407a" stroke-width="1.8" fill="none"/>`;
  const sm = (inner, x, y, sc) => `<g transform="translate(${x} ${y}) scale(${sc})">${inner}</g>`;
  const cross = (c = '#ffd84a', x = 24, y = 24, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -14v28M-9 -5h18" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="M0 -14v28M-9 -5h18" stroke="${c}" stroke-width="4" stroke-linecap="round"/></g>`;

  def('gallop_charge', () => speed('#e8742a') + hoof(26, 22, '#b8703a') + hoof(36, 34, '#b8703a'));
  def('trample', () => hoof(14, 18) + hoof(30, 14) + hoof(22, 34) + `<path d="M4 44h40" stroke="${K}" stroke-width="2.4"/><path d="M8 40l4 4M20 40l2 4M34 40l-2 4" stroke="#b8905a" stroke-width="2"/>`);
  def('dancer_leap', () => `<path d="M6 40q18-40 36 0" fill="none" stroke="#8a5ad0" stroke-width="3" stroke-dasharray="4 3"/>` + hoof(24, 14, '#7a4a2a') + `<path d="M4 42h10M34 42h10" stroke="${K}" stroke-width="3"/>`);
  def('ten_nails', () => [0, 1, 2, 3, 4].map(i => nail(8 + i * 8, 24 + (i % 2 ? 6 : -4), 90)).join(''));
  def('nail_storm', () => [[10, 10, 135], [24, 8, 160], [38, 12, 200], [14, 26, 120], [30, 26, 180], [22, 40, 150]].map(([x, y, r]) => nail(x, y, r, '#c8b0e8')).join(''));
  def('nail_bloom', () => `<circle cx="24" cy="24" r="14" fill="#6a3a9a" ${st}/>` + [0, 60, 120, 180, 240, 300].map(a => nail(24 + Math.cos(a * Math.PI / 180) * 12, 24 + Math.sin(a * Math.PI / 180) * 12, a + 90, '#f2c14e')).join('') + `<circle cx="24" cy="24" r="4" fill="${K}"/>`);
  def('golden_nail', () => P.spiral('#f2c14e', 2.6) + nail(24, 22, 45, '#f2c14e'));
  def('rectangle_sight', () => `<rect x="4" y="12" width="40" height="25" fill="none" stroke="#f2c14e" stroke-width="3"/><path d="M29 12v25M29 27h15" stroke="#f2c14e" stroke-width="2"/>` + sm(P.eye('#f6ecd8', '#f2c14e'), 8, 8, 0.66));
  def('infinite_seed', () => `<path d="M8 24q0-10 8-10t16 20 8-10-8-10-16 20-8-10z" fill="none" stroke="${K}" stroke-width="6"/><path d="M8 24q0-10 8-10t16 20 8-10-8-10-16 20-8-10z" fill="none" stroke="#f2c14e" stroke-width="3.4"/><circle cx="24" cy="24" r="3.4" fill="#fff" ${st} stroke-width="1.2"/>`);
  def('executioner_mark', () => P.ball('#c8c8d8', '#c8323c') + `<path d="M34 30q2 6 0 12M38 28q3 5 2 10" stroke="#c8323c" stroke-width="3" stroke-linecap="round"/>`);
  def('gallows_spin', () => `<path d="M10 44V6h24v6" fill="none" stroke="#6a4a2a" stroke-width="5"/><path d="M10 44V6h24v6" fill="none" stroke="${K}" stroke-width="1.4"/>` + sm(P.ball('#c8c8d8', '#c8323c'), 22, 14, 0.55));
  def('royal_sentence', () => `<path d="M8 38l4-20 8 8 4-14 4 14 8-8 4 20z" fill="#f2c14e" ${st}/><path d="M8 38h32v5H8z" fill="#c8323c" ${st}/>` + [16, 24, 32].map(x => `<circle cx="${x}" cy="31" r="2" fill="#c8323c"/>`).join('') + shine(18, 26, 2));
  def('suture_spin', () => `<path d="M8 36q16-26 32 0" fill="none" stroke="#6ad08a" stroke-width="3"/>` + [12, 18, 24, 30, 36].map((x, i) => `<path d="M${x} ${30 - Math.sin(i / 4 * Math.PI) * 10 - 4}v8" stroke="${K}" stroke-width="2"/>`).join('') + `<path d="M36 10l-10 12" stroke="#c8c8d8" stroke-width="3"/><circle cx="37" cy="9" r="2.5" fill="none" stroke="${K}" stroke-width="1.4"/>`);
  def('nerve_block', () => `<path d="M24 4v40" stroke="${K}" stroke-width="7"/><path d="M24 4v40" stroke="#f6ecd8" stroke-width="4"/>` + [10, 18, 26, 34].map(y => `<path d="M16 ${y}q8 3 16 0" fill="none" stroke="${K}" stroke-width="2"/>`).join('') + sm(P.ball('#c8c8d8', '#6ad08a'), 24, 12, 0.5));
  def('zeppeli_surgery', () => `<path d="M6 16h36v22H6z" fill="#f6ecd8" ${st}/><path d="M24 20v14M17 27h14" stroke="#c8323c" stroke-width="4"/><path d="M16 16v-6h16v6" fill="none" ${st}/>`);
  def('horse_rotation', () => hoof(24, 26, '#6a4a2a') + `<path d="M38 18A15 15 0 1 0 39 28" fill="none" stroke="#f2c14e" stroke-width="3.4"/><path d="M34 12l6 6-8 2z" fill="#f2c14e" ${st} stroke-width="1.2"/>`);
  def('spin_gallop', () => speed('#3fb8a9') + sm(P.ball('#c8c8d8', '#3fb8a9'), 10, 6, 0.55) + sm(P.ball('#c8c8d8', '#3fb8a9'), 22, 20, 0.55));
  def('rider_breaker', () => `<rect x="4" y="10" width="40" height="28" fill="none" stroke="#f2c14e" stroke-width="3"/>` + P.spiral('#f2c14e', 2.4) + hoof(38, 34, '#6a4a2a'));
  def('quickdraw', () => P.revolver('#8a8a9a', '#6a4a2a') + `<path d="M40 14l6-4M42 20h6M40 26l6 3" stroke="#f2c14e" stroke-width="2.4" stroke-linecap="round"/>`);
  def('lasso_arrest', () => rope('M24 8a14 8 0 1 1-.1 0M24 24v20') + star5(24, 30, 8, '#f2c14e'));
  def('high_noon', () => `<circle cx="24" cy="24" r="18" fill="#f6ecd8" ${st}/><path d="M24 24V9M24 24V10" stroke="${K}" stroke-width="3" stroke-linecap="round"/>` + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<circle cx="${24 + Math.cos(i * Math.PI / 6) * 14}" cy="${24 + Math.sin(i * Math.PI / 6) * 14}" r="1.4" fill="${K}"/>`).join('') + `<circle cx="24" cy="24" r="2.5" fill="#c8323c"/>`);
  def('rope_slip', () => rope('M8 10q16 4 8 14t16 14', '#e8742a') + `<path d="M28 8l6 4-6 4M14 30l-6 4 6 4" fill="none" stroke="${K}" stroke-width="2.4" opacity=".6"/>`);
  def('split_lash', () => rope('M6 8q18 12 36 4') + rope('M4 26h40') + rope('M6 42q18-12 36-4'));
  def('reel_in', () => rope('M4 40q10-30 30-30') + `<path d="M34 6q10 0 8 10t-8 4" fill="none" stroke="#c8c8d8" stroke-width="3.4"/><path d="M34 20l-3 5" stroke="#c8c8d8" stroke-width="3"/>`);
  def('corral_guard', () => `<path d="M4 20h40M4 32h40" stroke="#8a5a30" stroke-width="4"/>` + [8, 20, 32, 44].map(x => `<path d="M${x - 2} 12v28" stroke="${K}" stroke-width="5"/><path d="M${x - 2} 12v28" stroke="#b8844a" stroke-width="3"/>`).join('') + `<path d="M24 14l10 4v8c0 6-5 10-10 12-5-2-10-6-10-12v-8z" fill="#9fc7e8" ${st} stroke-width="1.6"/>`);
  def('stampede', () => [[12, 18], [28, 14], [20, 32], [36, 30]].map(([x, y]) => `<path d="M${x - 8} ${y}q0-6 8-6t8 6v4H${x - 8}z" fill="#6a4a2a" ${st} stroke-width="1.4"/><path d="M${x - 8} ${y - 2}l-3-4M${x + 8} ${y - 2}l3-4" stroke="#f6ecd8" stroke-width="2"/>`).join('') + `<path d="M2 44h44" stroke="#b8905a" stroke-width="2"/>`);
  def('last_stand', () => I.BOOT('#6a4a2a', '#c8a070') + `<path d="M4 44h40" stroke="${K}" stroke-width="3"/><path d="M34 6l10 4v8c0 6-5 10-10 12" fill="#c8323c" ${st} stroke-width="1.4"/>`);
  def('prayer_mend', () => `<path d="M16 42V22q0-8 8-14 8 6 8 14v20z" fill="#f6ecd8" ${st}/><path d="M24 8v34" stroke="${K}" stroke-width="1.4"/>` + cross('#6ad08a', 24, 26, 0.5));
  def('confession', () => `<path d="M6 8h36v34H6z" fill="#6a4a2a" ${st}/>` + [12, 18, 24, 30, 36].map(x => `<path d="M${x} 14v22" stroke="${K}" stroke-width="2"/>`).join('') + `<path d="M6 8l18-6 18 6" fill="#8a5a30" ${st}/>`);
  def('benediction', () => P.halo('#ffd84a').replace('cy="10"', 'cy="8"') + cross('#ffd84a', 24, 28, 1) + `<path d="M6 16l6 4M42 16l-6 4M4 30h6M38 30h6" stroke="#ffd84a" stroke-width="2.4" stroke-linecap="round"/>`);
  def('flesh_lash', () => flesh() + `<path d="M40 8q-16 6-18 18" fill="none" stroke="#f09ac0" stroke-width="5" stroke-linecap="round"/><path d="M40 8q-16 6-18 18" fill="none" stroke="${K}" stroke-width="1.2"/>`);
  def('flesh_flood', () => `<path d="M2 30q6-8 12 0t12 0 12 0 10 0v14H2z" fill="#f09ac0" ${st}/><path d="M2 20q6-8 12 0t12 0 12 0 10 0" fill="none" stroke="#f09ac0" stroke-width="4"/><path d="M2 20q6-8 12 0t12 0 12 0 10 0" fill="none" stroke="${K}" stroke-width="1.4"/>`);
  def('flesh_crucible', () => flesh('#e8709a') + `<circle cx="24" cy="26" r="6" fill="${K}"/><circle cx="22" cy="24" r="1.6" fill="#fff"/>`);
  def('relic_strike', () => I.dmg('holy').replace(/<svg[^>]*>|<\/svg>/g, '') + `<path d="M36 34l8 8" stroke="${K}" stroke-width="5" stroke-linecap="round"/><path d="M36 34l8 8" stroke="#e8d8a8" stroke-width="2.6" stroke-linecap="round"/>`);
  def('saints_judgement', () => `<path d="M24 2l4 20h-8z" fill="#ffd84a" ${st} stroke-width="1.4"/><path d="M12 28h24l-4 16H16z" fill="#6a4a2a" ${st}/>` + cross('#ffd84a', 24, 34, 0.45) + `<path d="M6 6l8 8M42 6l-8 8" stroke="#ffd84a" stroke-width="2.4"/>`);
  def('vatican_rite', () => `<path d="M24 4l14 10v28H10V14z" fill="#f6ecd8" ${st}/><path d="M18 42V28a6 6 0 0 1 12 0v14" fill="#c8323c" ${st} stroke-width="1.6"/>` + cross('#f2c14e', 24, 16, 0.4));

  /* path emblems (party screen / trainer cards) */
  const E = SBR.PATH_EMBLEM = {};
  const ring = (c, inner) => `<circle cx="24" cy="24" r="20" fill="${c}" ${st}/><circle cx="24" cy="24" r="15" fill="#fbf4e4" ${st} stroke-width="1.4"/>${inner}`;
  const mini = (id, s = 0.6) => `<g transform="translate(${24 - 24 * s} ${24 - 24 * s}) scale(${s})">${I.ability(id).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>`;
  Object.entries(SBR.PATHS).forEach(([id, p]) => { E[id] = () => I.wrap(ring(p.color, mini(p.abilities[0].id))); });
})();
