/* Data: stats, statuses, abilities, characters, horses, items, relics, techniques, achievements */
'use strict';

SBR.STATS = {
  spin:  { name: 'SPIN',    short: 'SPN', color: '#3fb8a9', desc: 'Mastery of the rotation. Scales Spin techniques. +0.8% crit damage per point.' },
  aim:   { name: 'AIM',     short: 'AIM', color: '#e8742a', desc: 'Eye and trigger finger. Scales guns and nails. +0.5% crit chance per point.' },
  grit:  { name: 'GRIT',    short: 'GRT', color: '#c8323c', desc: 'Frontier toughness. +2 max HP per point, better block chance and block reduction.' },
  ride:  { name: 'RIDING',  short: 'RID', color: '#6b5bd6', desc: 'Horsemanship. Improves initiative, dodge chance and sprint control.' },
  res:   { name: 'RESOLVE', short: 'RES', color: '#e8508a', desc: 'The will to keep walking. Scales healing. Chance for bonus Energy each turn.' },
  luck:  { name: 'LUCK',    short: 'LCK', color: '#f2c14e', desc: 'Fortune favours you. Crit chance, crit damage, better loot and dice rolls.' },
};

/* ---------------- Status effects ---------------- */
SBR.STATUS = {
  bleed:     { name: 'Bleed', glyph: '滴', color: '#c8323c', kind: 'debuff', mode: 'stacks', max: 20, desc: s => `Takes ${2 * s} damage at turn start. Loses 1 stack per turn.`, tick: 'bleed' },
  holed:     { name: 'Nail Hole', glyph: '穴', color: '#8a5ad0', kind: 'debuff', mode: 'stacks', max: 12, desc: s => `Tusk's hole burrows: ${3 * s} damage at turn start. Does not fade. Spinning Hole makes it chase.`, tick: 'holed' },
  stun:      { name: 'Spun', glyph: '痺', color: '#f2c14e', kind: 'debuff', mode: 'turns', desc: () => 'Nerves scrambled by rotation. Skips next turn.', skip: true },
  fear:      { name: 'Fear', glyph: '恐', color: '#5a3a6a', kind: 'debuff', mode: 'turns', desc: () => 'Deals 10% less damage and cannot gain Energy naturally.', mods: { dmgOut: 0.9 }, noEnergy: true },
  hooked:    { name: 'Hooked', glyph: '鉤', color: '#6a5a8a', kind: 'debuff', mode: 'turns', desc: () => 'Reeled in by wire. Cannot gain Energy naturally.', noEnergy: true },
  secondwind:{ name: 'Second Wind', glyph: '風', color: '#f2c14e', kind: 'buff', mode: 'turns', desc: () => 'When gaining Energy naturally, gain 1 more.' },
  goldenheart:{ name: 'Golden Heart', glyph: '心', color: '#ffd84a', kind: 'buff', mode: 'turns', desc: () => 'Gain 1 extra Energy at the start of each turn. Does not stack.' },
  refreshed: { name: 'Refreshed', glyph: '泉', color: '#6ad0c8', kind: 'buff', mode: 'turns', desc: () => 'Deal 10% more damage and +10% chance for bonus Energy.', mods: { dmgOut: 1.1, energyChance: 0.1 } },
  calm:      { name: 'Rider\'s Calm', glyph: '静', color: '#9fc7e8', kind: 'buff', mode: 'turns', desc: () => 'Take 15% less damage and +35% chance for bonus Energy.', mods: { dmgIn: 0.85, energyChance: 0.35 } },
  weak:      { name: 'Weakened', glyph: '弱', color: '#7a7a8a', kind: 'debuff', mode: 'turns', desc: () => 'Deals 25% less damage.', mods: { dmgOut: 0.75 } },
  vuln:      { name: 'Exposed', glyph: '裂', color: '#e8742a', kind: 'debuff', mode: 'turns', desc: () => 'Takes 30% more damage.', mods: { dmgIn: 1.3 } },
  blind:     { name: 'Blinded', glyph: '盲', color: '#3a3a3a', kind: 'debuff', mode: 'turns', desc: () => '40% chance for attacks to miss.', mods: { miss: 0.4 } },
  marked:    { name: 'Scanned', glyph: '視', color: '#3fb8a9', kind: 'debuff', mode: 'turns', desc: () => 'Every weak point is visible. Cannot dodge; attackers gain +20% crit chance.', mods: { noDodge: true, critTaken: 0.2 } },
  fossil:    { name: 'Fossilizing', glyph: '竜', color: '#6aa04a', kind: 'debuff', mode: 'stacks', max: 5, desc: s => `Scary Monsters infection (${s}/5). At 5 stacks, turns into a dinosaur for 2 turns. -3% dodge per stack.`, mods: { dodgePer: -0.03 } },
  raptor:    { name: 'Dinosaurified', glyph: '恐', color: '#4a8a3a', kind: 'debuff', mode: 'turns', desc: () => 'Mind of a raptor: can only use basic attacks, at random targets. +20% damage.', mods: { dmgOut: 1.2 } },
  primed:    { name: 'Bomb Pin', glyph: '爆', color: '#c8323c', kind: 'debuff', mode: 'turns', desc: s => `A pin has been pressed into the body. Explodes when the timer hits 0 (18 dmg). Brace to pull it out.`, tick: 'primed' },
  magnet:    { name: 'Magnetized', glyph: '磁', color: '#6a7a9a', kind: 'debuff', mode: 'turns', desc: () => 'Iron in the blood. 40% of damage taken is also dealt to other magnetized allies.' },
  soaked:    { name: 'Soaked', glyph: '雨', color: '#6a8ad0', kind: 'debuff', mode: 'turns', desc: () => 'Raindrops cling to the body. Takes 25% more damage and -10% dodge.', mods: { dmgIn: 1.25, dodge: -0.1 } },
  sound:     { name: 'Sound Stamp', glyph: '音', color: '#e8508a', kind: 'debuff', mode: 'stacks', max: 6, desc: s => `Silent Way onomatopoeia. When this unit acts, it takes ${6 * s} damage and the stamp is removed.` },
  leftblind: { name: 'Left-Side Blind', glyph: '左', color: '#4a5a8a', kind: 'debuff', mode: 'turns', desc: () => 'Cannot perceive the left. 35% chance for actions to fail. -15% dodge.', mods: { dodge: -0.15 } },
  guilt:     { name: 'Guilt', glyph: '罪', color: '#8a1a2a', kind: 'debuff', mode: 'stacks', max: 15, desc: s => `Buried sins resurface: ${2 * s} damage at turn start, grows by 1 each turn.`, tick: 'guilt' },
  infinite:  { name: 'Infinite Rotation', glyph: '∞', color: '#f2c14e', kind: 'debuff', mode: 'stacks', max: 1, desc: () => 'Caught in the Golden Rectangle. Loses 8% of max HP every turn. Cannot be removed or redirected.', tick: 'infinite', permanent: true },
  timestop:  { name: 'Time Stopped', glyph: '止', color: '#ffd84a', kind: 'debuff', mode: 'turns', desc: () => 'Frozen in stopped time.', skip: true },
  aged:      { name: 'Aged', glyph: '老', color: '#b0a080', kind: 'debuff', mode: 'turns', desc: () => 'Ball Breaker withered half the body. Deals 30% less damage and takes 20% more.', mods: { dmgOut: 0.7, dmgIn: 1.2 } },
  // buffs
  guard:     { name: 'Guard', glyph: '守', color: '#6a8ad0', kind: 'buff', mode: 'turns', desc: () => '+35% block chance.', mods: { block: 0.35 } },
  evasive:   { name: 'Evasive', glyph: '避', color: '#3fb8a9', kind: 'buff', mode: 'turns', desc: () => '+30% dodge chance.', mods: { dodge: 0.3 } },
  empower:   { name: 'Empowered', glyph: '力', color: '#e8742a', kind: 'buff', mode: 'turns', desc: () => 'Deals 30% more damage.', mods: { dmgOut: 1.3 } },
  lucky:     { name: 'Lucky', glyph: '幸', color: '#f2c14e', kind: 'buff', mode: 'turns', desc: () => '+25% crit chance.', mods: { crit: 0.25 } },
  regen:     { name: 'Regen', glyph: '癒', color: '#6ad08a', kind: 'buff', mode: 'turns', desc: () => 'Heals 4 HP at turn start.', tick: 'regen' },
  taunt:     { name: 'Taunt', glyph: '挑', color: '#c8323c', kind: 'buff', mode: 'turns', desc: () => 'Enemies are far more likely to target this unit.' },
  rotation:  { name: 'Rotation', glyph: '回', color: '#3fb8a9', kind: 'buff', mode: 'stacks', max: 10, desc: s => `Spin abilities deal +${8 * s}% damage. Golden Spin consumes stacks.`, permanentCombat: true },
  shield:    { name: 'Shield', glyph: '盾', color: '#9fc7e8', kind: 'buff', mode: 'stacks', max: 99, desc: s => `Absorbs the next ${s} damage.`, permanentCombat: true },
  invuln:    { name: 'Untouchable', glyph: '無', color: '#f6ecd8', kind: 'buff', mode: 'turns', desc: () => 'All damage is redirected elsewhere. Only piercing attacks (Spin with perfect rotation, Infinite Rotation) connect.' },
  rainveil:  { name: 'Rain Veil', glyph: '虹', color: '#9fc7e8', kind: 'buff', mode: 'turns', desc: () => 'Hides inside frozen raindrops. Immune to non-Spin attacks. Spin evaporates the rain.' },
  reflect:   { name: 'Mirror Grid', glyph: '返', color: '#e8742a', kind: 'buff', mode: 'turns', desc: () => '40% of damage taken is sent back to the attacker.' },
  phase:     { name: 'Phasing', glyph: '入', color: '#c8323c', kind: 'buff', mode: 'turns', desc: () => '50% chance that damage slips into another Tattoo You soldier.' },
};

/* ---------------- Abilities (party) ---------------- */
const A = SBR.ABILITIES = {};
// Johnny — Tusk
A.nail_shot = { name: 'Nail Shot', cost: 0, cd: 0, target: 'enemy', tags: ['gun', 'stand'], fx: 'nail',
  desc: l => `Fire a fingernail. ${l > 1 ? 50 : 25}% chance to leave a Nail Hole.`, base: 4, scale: { aim: 0.045 },
  run(x) { const r = x.dmg(x.target, 4, { aim: 0.045 }); if (r.hit && x.roll(x.lvl > 1 ? 0.5 : 0.25)) x.status(x.target, 'holed', 1); } };
A.nail_bullet = { name: 'Tusk ACT1: Nail Bullet', cost: 1, cd: 0, target: 'enemy', tags: ['gun', 'stand'], fx: 'nail',
  desc: l => `Spinning nail bullet. Always leaves ${l > 1 ? 2 : 1} Nail Hole.`,
  run(x) { const r = x.dmg(x.target, 7, { aim: 0.05, spin: 0.02 }); if (r.hit) x.status(x.target, 'holed', x.lvl > 1 ? 2 : 1); } };
A.spinning_hole = { name: 'ACT2: Spinning Hole', cost: 2, cd: 1, target: 'enemy', tags: ['gun', 'stand', 'spin'], fx: 'nail',
  desc: l => `The hole chases its prey. +2 Nail Holes, then deals bonus damage equal to ${l > 1 ? 3 : 2}× the target's holes.`,
  run(x) { x.dmg(x.target, 6, { aim: 0.05, spin: 0.03 }); x.status(x.target, 'holed', 2); const h = x.stacks(x.target, 'holed'); if (h > 0) x.dmg(x.target, h * (x.lvl > 1 ? 3 : 2), {}, { noCrit: true, noDodge: true, label: 'CHASE' }); } };
A.wormhole = { name: 'ACT3: Wormhole', cost: 2, cd: 3, target: 'enemy', tags: ['gun', 'stand', 'spin'], fx: 'wormhole',
  desc: l => `Johnny shoots himself and slips through the hole. Gains Evasive 2 and strikes from behind: ${l > 1 ? 14 : 10} base, cannot be dodged.`,
  run(x) { x.status(x.user, 'evasive', 0, 2); x.dmg(x.target, x.lvl > 1 ? 14 : 10, { aim: 0.05, spin: 0.04 }, { noDodge: true }); } };
A.infinite_rotation = { name: 'ACT4: Infinite Rotation', cost: 3, cd: 4, target: 'enemy', tags: ['gun', 'stand', 'spin'], fx: 'act4', pierce: true,
  desc: () => 'The Golden Rectangle made manifest. Massive piercing damage that ignores every defence, and inflicts Infinite Rotation.',
  run(x) { x.dmg(x.target, 20, { spin: 0.06, aim: 0.035 }, { pierce: true, noDodge: true }); x.status(x.target, 'infinite', 1); } };
// Gyro — Steel Balls
A.steel_ball = { name: 'Steel Ball', cost: 0, cd: 0, target: 'enemy', tags: ['spin'], fx: 'ball',
  desc: l => `Throw a spinning Steel Ball. Gain ${l > 1 ? 2 : 1} Rotation.`,
  run(x) { x.dmg(x.target, 5, { spin: 0.045 }); x.status(x.user, 'rotation', x.lvl > 1 ? 2 : 1); } };
A.nerve_spin = { name: 'Nerve Spin', cost: 1, cd: 1, target: 'enemy', tags: ['spin'], fx: 'ball',
  desc: l => `Rotation seizes the nerves. ${l > 1 ? 65 : 45}% chance to Spin (stun) the target.`,
  run(x) { const r = x.dmg(x.target, 5, { spin: 0.035 }); if (r.hit && x.roll(x.lvl > 1 ? 0.65 : 0.45)) x.status(x.target, 'stun', 0, 1); } };
A.healing_spin = { name: 'Healing Spin', cost: 2, cd: 2, target: 'ally', tags: ['spin', 'heal'], fx: 'heal',
  desc: l => `Zeppeli medicine. Heal an ally and remove ${l > 1 ? 2 : 1} debuff.`,
  run(x) { x.heal(x.target, 10, { res: 0.06, spin: 0.03 }); x.cleanse(x.target, x.lvl > 1 ? 2 : 1); } };
A.scan = { name: 'Scan', cost: 1, cd: 2, target: 'enemy', tags: ['stand'], fx: 'scan',
  desc: l => `The Saint's eye sees through flesh. Scan the target for ${l > 1 ? 4 : 3} turns: it cannot dodge and is easier to crit.`,
  run(x) { x.status(x.target, 'marked', 0, x.lvl > 1 ? 4 : 3); x.energy(x.user, 1); } };
A.golden_spin = { name: 'Golden Spin', cost: 2, cd: 3, target: 'enemy', tags: ['spin'], fx: 'golden',
  desc: () => 'A rotation drawn from the Golden Rectangle. Consumes all Rotation for +15% damage per stack. At 5+ stacks it pierces.',
  run(x) { const rot = x.stacks(x.user, 'rotation'); x.removeStatus(x.user, 'rotation'); x.dmg(x.target, 16 * (1 + rot * 0.15), { spin: 0.07 }, { pierce: rot >= 5 }); } };
A.ball_breaker = { name: 'Ball Breaker', cost: 3, cd: 99, target: 'enemy', tags: ['spin'], fx: 'ballbreaker', pierce: true,
  desc: () => 'The perfect Spin, drawn from the horse. Pierces all dimensions. Ages the target. Once per battle.',
  run(x) { x.dmg(x.target, 40, { spin: 0.08 }, { pierce: true, noDodge: true }); x.status(x.target, 'aged', 0, 3); } };
// Mountain Tim — Oh! Lonesome Me
A.rifle = { name: 'Winchester', cost: 0, cd: 0, target: 'enemy', tags: ['gun'], fx: 'gun',
  desc: () => 'A cowboy\'s rifle shot.', run(x) { x.dmg(x.target, 5, { aim: 0.045 }); } };
A.lasso_split = { name: 'Lonesome Split', cost: 1, cd: 2, target: 'self', tags: ['stand'], fx: 'buff',
  desc: l => `Tim splits his body along the rope. Gains Evasive ${l > 1 ? 3 : 2} and Taunt 2.`,
  run(x) { x.status(x.user, 'evasive', 0, x.lvl > 1 ? 3 : 2); x.status(x.user, 'taunt', 0, 2); } };
A.rope_bind = { name: 'Rope Bind', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], fx: 'rope',
  desc: l => `Lasso through the body. ${l > 1 ? 90 : 70}% chance to stun.`,
  run(x) { const r = x.dmg(x.target, 4, { aim: 0.03 }); if (r.hit && x.roll(x.lvl > 1 ? 0.9 : 0.7)) x.status(x.target, 'stun', 0, 1); } };
A.rope_wall = { name: 'Rope Corral', cost: 2, cd: 3, target: 'allAllies', tags: ['stand'], fx: 'buff',
  desc: l => `Ropes shield the whole party. Guard ${l > 1 ? 3 : 2} turns and Rider's Calm.`,
  run(x) { x.allies.forEach(a => { x.status(a, 'guard', 0, x.lvl > 1 ? 3 : 2); x.status(a, 'calm', 0, 2); }); } };
// Pocoloco — Hey Ya!
A.pitchfork = { name: 'Pitchfork Poke', cost: 0, cd: 0, target: 'enemy', tags: [], fx: 'hit',
  desc: () => 'A farmer\'s jab. Scales with Luck.', run(x) { x.dmg(x.target, 4, { luck: 0.06 }); } };
A.hey_ya = { name: 'Hey Ya! Pep Talk', cost: 1, cd: 2, target: 'allAllies', tags: ['stand'], fx: 'buff',
  desc: l => `"It's your lucky day!" Party gains Lucky ${l > 1 ? 3 : 2} turns and Second Wind.`,
  run(x) { x.allies.forEach(a => { x.status(a, 'lucky', 0, x.lvl > 1 ? 3 : 2); x.status(a, 'secondwind', 0, 2); }); x.say(x.user, 'Go for it, go for it!'); } };
A.lucky_day = { name: 'Lucky Break', cost: 2, cd: 3, target: 'none', tags: ['stand'], fx: 'buff',
  desc: () => 'Fortune rolls the dice: heal the party, grant energy, trip an enemy, or find cash.',
  run(x) {
    const r = Math.random();
    if (r < 0.3) { x.allies.forEach(a => x.heal(a, 8, { luck: 0.04 })); x.log('Fortune heals the party!'); }
    else if (r < 0.55) { x.allies.forEach(a => x.energy(a, 1)); x.log('Everyone catches their breath: +1 Energy!'); }
    else if (r < 0.85) { const e = x.randomEnemy(); if (e) { x.status(e, 'stun', 0, 1); x.dmg(e, 6, { luck: 0.05 }); x.log(`${e.name} trips over a rock!`); } }
    else { x.money(20 + Math.floor(Math.random() * 30)); x.log('A lost wallet lands at Pocoloco\'s feet!'); }
  } };
A.fortune = { name: 'Fortune\'s Favour', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], fx: 'crit',
  desc: () => 'A strike that luck guides home. Guaranteed crit if Lucky.',
  run(x) { x.dmg(x.target, 11, { luck: 0.08 }, { forceCrit: x.has(x.user, 'lucky') }); } };
// Hot Pants — Cream Starter
A.hp_revolver = { name: 'Revolver', cost: 0, cd: 0, target: 'enemy', tags: ['gun'], fx: 'gun',
  desc: () => 'A clean shot.', run(x) { x.dmg(x.target, 4, { aim: 0.05 }); } };
A.flesh_spray = { name: 'Cream Starter: Mend', cost: 1, cd: 1, target: 'ally', tags: ['stand', 'heal'], fx: 'heal',
  desc: l => `Spray flesh into wounds. Heal and Regen ${l > 1 ? 3 : 2} turns.`,
  run(x) { x.heal(x.target, 8, { res: 0.05 }); x.status(x.target, 'regen', 0, x.lvl > 1 ? 3 : 2); } };
A.flesh_blind = { name: 'Cream Starter: Smother', cost: 1, cd: 2, target: 'enemy', tags: ['stand'], fx: 'spray',
  desc: l => `Spray flesh over the eyes. Blind ${l > 1 ? 3 : 2} turns.`,
  run(x) { const r = x.dmg(x.target, 4, { aim: 0.03 }); if (r.hit) x.status(x.target, 'blind', 0, x.lvl > 1 ? 3 : 2); } };
A.flesh_disguise = { name: 'Flesh Disguise', cost: 2, cd: 4, target: 'self', tags: ['stand'], fx: 'buff',
  desc: () => 'Reshape into someone else. Evasive 3 and a 10 Shield.',
  run(x) { x.status(x.user, 'evasive', 0, 3); x.status(x.user, 'shield', 10); } };
// Wekapipo — Wrecking Ball
A.weka_ball = { name: 'Steel Sphere', cost: 0, cd: 0, target: 'enemy', tags: ['spin'], fx: 'ball',
  desc: () => 'Royal Guard spin technique.', run(x) { x.dmg(x.target, 5, { spin: 0.045 }); } };
A.wrecking_ball = { name: 'Wrecking Ball', cost: 1, cd: 1, target: 'enemy', tags: ['spin', 'stand'], fx: 'ball',
  desc: l => `The ball splits the senses. Left-Side Blind ${l > 1 ? 3 : 2} turns.`,
  run(x) { const r = x.dmg(x.target, 6, { spin: 0.05 }); if (r.hit) x.status(x.target, 'leftblind', 0, x.lvl > 1 ? 3 : 2); } };
A.satellites = { name: 'Satellite Spheres', cost: 2, cd: 2, target: 'allEnemies', tags: ['spin', 'stand'], fx: 'aoe',
  desc: () => 'Fourteen tiny satellites burst from the ball. Hits all enemies, 30% Left-Side Blind.',
  run(x) { x.enemies.forEach(e => { const r = x.dmg(e, 5, { spin: 0.04 }); if (r.hit && x.roll(0.3)) x.status(e, 'leftblind', 0, 2); }); } };
A.royal_guard = { name: 'Royal Guard', cost: 2, cd: 3, target: 'ally', tags: [], fx: 'buff',
  desc: () => 'Protect an ally with a 12 Shield and gain Taunt 2.',
  run(x) { x.status(x.target, 'shield', 12); x.status(x.user, 'taunt', 0, 2); } };
// Lucy Steel
A.hairpin = { name: 'Hairpin', cost: 0, cd: 0, target: 'enemy', tags: [], fx: 'hit',
  desc: () => 'Brave, if not strong.', run(x) { x.dmg(x.target, 3, { aim: 0.03, res: 0.02 }); } };
A.pray = { name: 'Pray', cost: 1, cd: 2, target: 'allAllies', tags: ['heal'], fx: 'heal',
  desc: () => 'A prayer for the whole party. Small heal and Refreshed for everyone.',
  run(x) { x.allies.forEach(a => { x.heal(a, 5, { res: 0.05 }); x.status(a, 'refreshed', 0, 2); }); } };
A.ticket_ride = { name: 'Ticket to Ride', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], fx: 'buff',
  desc: () => 'Misfortune diverts toward the target: Exposed 2, Bleed 3. The party gains +1 Energy.',
  run(x) { x.status(x.target, 'vuln', 0, 2); x.status(x.target, 'bleed', 3); x.allies.forEach(a => x.energy(a, 1)); } };
A.heart_resolve = { name: 'Lucy\'s Resolve', cost: 2, cd: 5, target: 'allyDead', tags: ['heal'], fx: 'heal',
  desc: () => 'Revive a fallen ally at 35% HP.',
  run(x) { x.revive(x.target, 0.35); } };
// Diego — Scary Monsters (ally)
A.raptor_claw = { name: 'Raptor Claw', cost: 0, cd: 0, target: 'enemy', tags: ['stand'], fx: 'claw',
  desc: () => 'Slash with dinosaur claws. Inflicts 1 Bleed.',
  run(x) { const r = x.dmg(x.target, 5, { aim: 0.03, ride: 0.03 }); if (r.hit) x.status(x.target, 'bleed', 1); } };
A.dino_pack = { name: 'Dinosaur Pack', cost: 2, cd: 2, target: 'allEnemies', tags: ['stand'], fx: 'aoe',
  desc: () => 'Tiny raptors swarm every enemy. Inflicts Fossilizing.',
  run(x) { x.enemies.forEach(e => { const r = x.dmg(e, 5, { ride: 0.04 }); if (r.hit) x.status(e, 'fossil', 1); }); } };
A.kinetic_vision = { name: 'Kinetic Vision', cost: 1, cd: 3, target: 'allEnemies', tags: ['stand'], fx: 'scan',
  desc: () => 'Dinosaur eyes track all motion. Scan every enemy for 2 turns.',
  run(x) { x.enemies.forEach(e => x.status(e, 'marked', 0, 2)); } };

/* ---------------- Characters ---------------- */
SBR.CHARS = {
  johnny: { name: 'Johnny Joestar', short: 'Johnny', stand: 'Tusk', title: 'Fallen Genius Jockey', portrait: 'johnny', color: '#6b5bd6',
    hp: 34, stats: { spin: 2, aim: 6, grit: 2, ride: 6, res: 4, luck: 2 }, growth: { aim: 3, ride: 2, spin: 2, res: 1, grit: 1 },
    abilities: [{ id: 'nail_shot' }, { id: 'nail_bullet', flag: 'tusk1' }, { id: 'spinning_hole', flag: 'tusk2' }, { id: 'wormhole', flag: 'tusk3' }, { id: 'infinite_rotation', flag: 'tusk4' }],
    passive: { name: 'Paraplegic Rider', desc: 'Cannot block, but his mount carries him: +8% dodge. Horse bonuses apply to Johnny.' },
    bio: 'A former racing prodigy paralysed from the waist down. The touch of a spinning Steel Ball made his legs move — and he will follow that miracle across a continent.' },
  gyro: { name: 'Gyro Zeppeli', short: 'Gyro', stand: 'Steel Balls / Scan', title: 'Executioner of Naples', portrait: 'gyro', color: '#3fb8a9',
    hp: 38, stats: { spin: 7, aim: 3, grit: 4, ride: 5, res: 4, luck: 3 }, growth: { spin: 3, res: 2, grit: 1, ride: 1 },
    abilities: [{ id: 'steel_ball' }, { id: 'nerve_spin' }, { id: 'healing_spin' }, { id: 'scan', flag: 'eyes' }, { id: 'golden_spin', flag: 'golden' }, { id: 'ball_breaker', flag: 'ballbreaker' }],
    passive: { name: 'Nyo-ho!', desc: 'Starts every battle with 1 Rotation.' },
    bio: 'Heir to the Zeppeli family of royal executioners. He rides to win an amnesty for a boy named Marco — and grins with teeth that say GO! GO! ZEPPELI.' },
  mountaintim: { name: 'Mountain Tim', short: 'Tim', stand: 'Oh! Lonesome Me', title: 'Cowboy of Arizona', portrait: 'mountaintim', color: '#e8742a',
    hp: 40, stats: { spin: 1, aim: 5, grit: 6, ride: 6, res: 2, luck: 2 }, growth: { grit: 3, aim: 2, ride: 2 },
    abilities: [{ id: 'rifle' }, { id: 'lasso_split' }, { id: 'rope_bind' }, { id: 'rope_wall', level: 4 }],
    passive: { name: 'Lonesome Cowboy', desc: '+10% block chance.' },
    bio: 'A famous cowboy and race favourite who gained a Stand in the Devil\'s Palm. Honest, gallant, and a little too fond of the promoter\'s wife.' },
  pocoloco: { name: 'Pocoloco', short: 'Pocoloco', stand: 'Hey Ya!', title: 'The Luckiest Farmer', portrait: 'pocoloco', color: '#f2c14e',
    hp: 32, stats: { spin: 1, aim: 2, grit: 3, ride: 5, res: 3, luck: 9 }, growth: { luck: 4, ride: 1, res: 1 },
    abilities: [{ id: 'pitchfork' }, { id: 'hey_ya' }, { id: 'lucky_day' }, { id: 'fortune', level: 4 }],
    passive: { name: 'Born Lucky', desc: '+10% crit chance and 15% chance to shrug off debuffs.' },
    bio: 'A cheerful farmer told by a fortune teller that the next few months were his luckiest. His Stand is a tiny cheerleader who points the way.' },
  hotpants: { name: 'Hot Pants', short: 'Hot Pants', stand: 'Cream Starter', title: 'Agent of the Vatican', portrait: 'hotpants', color: '#e8508a',
    hp: 30, stats: { spin: 1, aim: 5, grit: 3, ride: 5, res: 7, luck: 3 }, growth: { res: 3, aim: 2, ride: 1 },
    abilities: [{ id: 'hp_revolver' }, { id: 'flesh_spray' }, { id: 'flesh_blind' }, { id: 'flesh_disguise', level: 4 }],
    passive: { name: 'Penitent', desc: 'Healing done is increased by 20%.' },
    bio: 'A mysterious racer who won the 3rd Stage. Seeks the Corpse to atone for a sin from childhood. Keeps secrets — even about who she is.' },
  wekapipo: { name: 'Wekapipo', short: 'Wekapipo', stand: 'Wrecking Ball', title: 'Exiled Royal Guard', portrait: 'wekapipo', color: '#6a8ad0',
    hp: 42, stats: { spin: 6, aim: 3, grit: 6, ride: 4, res: 3, luck: 2 }, growth: { spin: 2, grit: 3, res: 1 },
    abilities: [{ id: 'weka_ball' }, { id: 'wrecking_ball' }, { id: 'satellites' }, { id: 'royal_guard' }],
    passive: { name: 'Guard\'s Oath', desc: 'Takes 10% less damage.' },
    bio: 'Exiled from Naples after a duel defending his sister. His steel ball carries a variant of the Spin forbidden to all but the Royal Guard.' },
  lucy: { name: 'Lucy Steel', short: 'Lucy', stand: 'Ticket to Ride', title: 'The Promoter\'s Wife', portrait: 'lucy', color: '#f09ac0',
    hp: 26, stats: { spin: 0, aim: 3, grit: 2, ride: 3, res: 9, luck: 5 }, growth: { res: 4, luck: 2 },
    abilities: [{ id: 'hairpin' }, { id: 'pray' }, { id: 'ticket_ride' }, { id: 'heart_resolve' }],
    passive: { name: 'Blessed', desc: 'Enemies are 40% less likely to target her.' },
    bio: 'Fourteen years old and braver than any racer. The Saint\'s Corpse has chosen her as its vessel — whether she likes it or not.' },
  diego: { name: 'Diego Brando', short: 'Diego', stand: 'Scary Monsters', title: 'Dio — the Rival', portrait: 'diego', color: '#3fb8a9',
    hp: 38, stats: { spin: 1, aim: 5, grit: 4, ride: 9, res: 2, luck: 4 }, growth: { ride: 3, aim: 2, grit: 1 },
    abilities: [{ id: 'raptor_claw' }, { id: 'dino_pack' }, { id: 'kinetic_vision' }],
    passive: { name: 'Dinosaur Instincts', desc: '+15% dodge chance. Acts early.' },
    bio: 'The British racing genius, born in poverty and hungry for everything. An alliance with him lasts exactly as long as it benefits him.' },
};

/* ---------------- Horses (your "race") ---------------- */
SBR.HORSES = {
  slowdancer: { name: 'Slow Dancer', breed: 'Appaloosa-cross Mare', coat: '#7a4a2a', mane: '#e8e0d0', wrap: '#8a5ad0', speed: 6, stamina: 7,
    desc: 'Johnny\'s steady partner. Calm under fire.', bonus: { dodge: 0.05, ride: 2 }, perk: 'Steady Gait: +5% dodge for Johnny, +2 RIDING.' },
  mustang: { name: 'Dust Devil', breed: 'Wild Mustang', coat: '#b8703a', mane: '#3a1a10', wrap: '#c8323c', speed: 8, stamina: 4,
    desc: 'Caught in the badlands. Fast and headstrong.', bonus: { init: 3, sprint: 0.1 }, perk: 'Wild Start: +3 initiative for the party. Faster sprints.' },
  ironhoof: { name: 'Iron Hoof', breed: 'Percheron Draft', coat: '#4a4a52', mane: '#1a1020', wrap: '#f2c14e', speed: 4, stamina: 10,
    desc: 'A plough horse who refused to quit.', bonus: { maxHp: 12, block: 0.05 }, perk: 'Plough Strength: Johnny +12 max HP, +5% block for the party.', unlock: 'Clear Act I.' },
  desertrose: { name: 'Desert Rose', breed: 'Arabian Mare', coat: '#e8d8c0', mane: '#b8a080', wrap: '#3fb8a9', speed: 7, stamina: 6,
    desc: 'Graceful and tireless in heat.', bonus: { energyChance: 0.12 }, perk: 'Tireless: +12% chance for bonus Energy each turn, for everyone.', unlock: 'Reach Act III.' },
  silverbullet: { name: 'Silver Bullet', breed: 'Thoroughbred Stallion', coat: '#c8c8d0', mane: '#f6ecd8', wrap: '#1f2a6a', speed: 9, stamina: 5,
    desc: 'The finest horse money can buy — Diego\'s own bloodline.', bonus: { firstCrit: true, init: 2, sprint: 0.15 }, perk: 'Thoroughbred: first attack of each battle always crits. +2 initiative.', unlock: 'Defeat Diego in a rival encounter.' },
  steppe: { name: 'Khan', breed: 'Mongolian Steppe Pony', coat: '#8a6a4a', mane: '#2a1a10', wrap: '#e8742a', spots: '#6a4a2a', speed: 6, stamina: 9,
    desc: 'Crossed the steppes with Dot Han\'s clan.', bonus: { regen: 2, pace: 10 }, perk: 'Endurance: party heals 2 HP each turn. +10 pace every act.', unlock: 'Finish a full race.' },
};

/* ---------------- Consumable items ---------------- */
SBR.ITEMS = {
  canteen:   { name: 'Canteen', glyph: '水', color: '#6aa0c8', price: 18, target: 'ally', desc: 'Heal 14 HP.', field: true, use: x => x.heal(x.target, 14) },
  jerky:     { name: 'Beef Jerky', glyph: '肉', color: '#8a4a2a', price: 22, target: 'allAllies', desc: 'Heal the whole party 7 HP.', field: true, use: x => x.allies.forEach(a => x.heal(a, 7)) },
  coffee:    { name: 'Black Coffee', glyph: '珈', color: '#5a3a2a', price: 20, target: 'ally', desc: '+1 Energy now and Second Wind for 3 turns.', use: x => { x.energy(x.target, 1); x.status(x.target, 'secondwind', 0, 3); } },
  bandage:   { name: 'Bandage Roll', glyph: '包', color: '#f6ecd8', price: 15, target: 'ally', desc: 'Remove all debuffs (except Infinite Rotation) and heal 4.', field: true, use: x => { x.cleanse(x.target, 99); x.heal(x.target, 4); } },
  dynamite:  { name: 'Dynamite', glyph: '爆', color: '#c8323c', price: 30, target: 'allEnemies', desc: 'Deal 12 damage to all enemies.', use: x => x.enemies.forEach(e => x.dmg(e, 12, {}, { noCrit: true, label: 'BOOM' })) },
  salts:     { name: 'Smelling Salts', glyph: '醒', color: '#3fb8a9', price: 35, target: 'allyDead', desc: 'Revive a fallen ally at 30% HP.', use: x => x.revive(x.target, 0.3) },
  whiskey:   { name: 'Whiskey', glyph: '酒', color: '#c8844a', price: 16, target: 'ally', desc: 'Empowered 3 turns, but Blinded 1.', use: x => { x.status(x.target, 'empower', 0, 3); x.status(x.target, 'blind', 0, 1); } },
  snakeoil:  { name: 'Snake Oil', glyph: '蛇', color: '#6aa04a', price: 12, target: 'ally', desc: 'Might heal 25. Might poison you. Probably fine.', field: true, use: x => { if (Math.random() < 0.65) x.heal(x.target, 25); else x.status(x.target, 'bleed', 4); } },
  sugarcube: { name: 'Sugar Cubes', glyph: '糖', color: '#fff', price: 14, target: 'none', desc: 'Your horse perks up. +12 Pace (use outside battle).', field: true, fieldOnly: true, use: x => x.pace(12) },
  spareball: { name: 'Spare Steel Ball', glyph: '球', color: '#c8c8d8', price: 28, target: 'enemy', desc: 'Throw a Zeppeli spare: 10 Spin damage and 50% stun.', use: x => { const r = x.dmg(x.target, 10, {}, { tags: ['spin'] }); if (r.hit && Math.random() < 0.5) x.status(x.target, 'stun', 0, 1); } },
};

/* ---------------- Relics (passives) ----------------
 bonus keys: crit, critDmg, dodge, block, energyStart, energyChance, init, dmg, spinDmg, gunDmg, heal, money,
 belt, regen, rotationStart, bleedOnBasic, maxHp (flat to every member on pickup), pace, restHeal, xp, shieldStart, firstCrit */
SBR.RELICS = {
  colt:       { name: 'Colt Single Action', glyph: '銃', color: '#8a8a9a', rarity: 'starter', desc: 'Guns and nails deal +15% damage.', bonus: { gunDmg: 0.15 }, starter: true },
  horseshoe:  { name: 'Lucky Horseshoe', glyph: '蹄', color: '#aab', rarity: 'starter', desc: '+7% crit chance for the party.', bonus: { crit: 0.07 }, starter: true },
  provisions: { name: 'Trail Provisions', glyph: '糧', color: '#c8844a', rarity: 'starter', desc: 'Start with $60, a Canteen, Jerky and Coffee. +1 belt slot.', bonus: { belt: 1 }, starter: true, onGain: r => { r.money += 60; r.items.push('canteen', 'jerky', 'coffee'); } },
  spareballs: { name: 'Zeppeli Spare Balls', glyph: '球', color: '#c8c8d8', rarity: 'starter', desc: 'Spin abilities deal +12% damage. Gyro starts battles with +1 Rotation.', bonus: { spinDmg: 0.12, rotationStart: 1 }, starter: true },
  timsrope:   { name: 'Mountain Tim\'s Rope', glyph: '縄', color: '#c8a070', rarity: 'starter', desc: 'Party starts each battle with Guard for 1 turn and +5% block.', bonus: { block: 0.05, guardStart: 1 }, starter: true },
  dotmap:     { name: 'Dot Han\'s Trail Map', glyph: '図', color: '#e8742a', rarity: 'starter', desc: '+20 Pace at the start of every act. Scavenging finds more.', bonus: { pace: 20, scavenge: 1 }, starter: true },
  arimathea:  { name: 'Joseph\'s Map Fragment', glyph: '聖', color: '#f2c14e', rarity: 'starter', desc: 'See 4 encounter cards instead of 3.', bonus: { cards: 1 }, starter: true },
  // common
  badge:      { name: 'Sheriff\'s Badge', glyph: '章', color: '#f2c14e', rarity: 'common', price: 70, desc: '+6% block chance.', bonus: { block: 0.06 } },
  watch:      { name: 'Pocket Watch', glyph: '時', color: '#c8a040', rarity: 'common', price: 60, desc: '+3 initiative.', bonus: { init: 3 } },
  goldteeth:  { name: 'Gold Teeth', glyph: '歯', color: '#f2c14e', rarity: 'rare', price: 120, desc: 'Start battles with +1 Energy.', bonus: { energyStart: 1 } },
  spurs:      { name: 'Silver Spurs', glyph: '拍', color: '#c8c8d8', rarity: 'common', price: 65, desc: '+5% dodge chance.', bonus: { dodge: 0.05 } },
  cactusjuice:{ name: 'Cactus Juice', glyph: '汁', color: '#6aa04a', rarity: 'common', price: 75, desc: 'Party heals 1 HP each turn in battle.', bonus: { regen: 1 } },
  bandolier:  { name: 'Bandolier', glyph: '帯', color: '#8a5a30', rarity: 'common', price: 55, desc: '+2 belt slots for items.', bonus: { belt: 2 } },
  stirrups:   { name: 'Iron Stirrups', glyph: '鐙', color: '#6a6a7a', rarity: 'common', price: 80, desc: 'Every party member gains +6 max HP.', bonus: { maxHp: 6 } },
  scope:      { name: 'Hunter\'s Scope', glyph: '鏡', color: '#3fb8a9', rarity: 'common', price: 70, desc: '+5% crit chance, +15% crit damage.', bonus: { crit: 0.05, critDmg: 0.15 } },
  rosary:     { name: 'Neapolitan Rosary', glyph: '祈', color: '#c8323c', rarity: 'common', price: 60, desc: 'Heal 5 HP for everyone after each battle.', bonus: { postHeal: 5 } },
  rattle:     { name: 'Rattlesnake Tail', glyph: '尾', color: '#b8a060', rarity: 'common', price: 65, desc: 'Basic attacks have 30% chance to inflict Bleed.', bonus: { bleedOnBasic: 0.3 } },
  hat:        { name: 'Bullet-Riddled Hat', glyph: '帽', color: '#6a4a2a', rarity: 'common', price: 50, desc: '+3% dodge, +3% crit.', bonus: { dodge: 0.03, crit: 0.03 } },
  codebook:   { name: 'Telegraph Codebook', glyph: '電', color: '#6a8ad0', rarity: 'common', price: 55, desc: '+25% money from all sources.', bonus: { money: 0.25 } },
  cowbell:    { name: 'Stolen Cowbell', glyph: '鈴', color: '#f2c14e', rarity: 'common', price: 40, desc: 'Resting heals 20% more. The cow was not stolen by you.', bonus: { restHeal: 0.2 } },
  // rare
  sketch:     { name: 'Golden Rectangle Sketch', glyph: '黄', color: '#f2c14e', rarity: 'rare', price: 140, desc: 'Spin abilities deal +20% damage.', bonus: { spinDmg: 0.2 } },
  sombrero:   { name: 'Oyecomova\'s Pins', glyph: '針', color: '#c8323c', rarity: 'rare', price: 130, desc: 'Deal +10% damage to all enemies.', bonus: { dmg: 0.1 } },
  cavalry:    { name: 'Cavalry Sabre', glyph: '刀', color: '#aab', rarity: 'rare', price: 125, desc: 'Every party member starts battles with a 6 Shield.', bonus: { shieldStart: 6 } },
  zombiehorse:{ name: 'Zombie Horse Thread', glyph: '糸', color: '#6ad08a', rarity: 'rare', price: 150, desc: 'Once per battle, the first ally to fall is stitched back at 25% HP.', bonus: { stitch: 1 } },
  journal:    { name: 'Johnny\'s Journal', glyph: '記', color: '#f6ecd8', rarity: 'rare', price: 110, desc: '+25% experience.', bonus: { xp: 0.25 } },
  // Saint's Corpse parts (story relics)
  c_leftarm:  { name: 'Corpse: Left Arm', glyph: '聖', color: '#e8d8a8', rarity: 'corpse', desc: 'Johnny +12 max HP. Immune to Fossilizing. Tusk nails deal +10% damage.', bonus: { gunDmg: 0.1, fossilImmune: 1 }, corpse: true },
  c_eyes:     { name: 'Corpse: Right Eye', glyph: '聖', color: '#e8d8a8', rarity: 'corpse', desc: 'Grants Gyro the Scan ability. +6% crit chance.', bonus: { crit: 0.06 }, corpse: true },
  c_spine:    { name: 'Corpse: Spine', glyph: '聖', color: '#e8d8a8', rarity: 'corpse', desc: 'Start battles with +1 Energy.', bonus: { energyStart: 1 }, corpse: true },
  c_ears:     { name: 'Corpse: Ears', glyph: '聖', color: '#e8d8a8', rarity: 'corpse', desc: '+8% dodge chance.', bonus: { dodge: 0.08 }, corpse: true },
  c_rightarm: { name: 'Corpse: Right Arm', glyph: '聖', color: '#e8d8a8', rarity: 'corpse', desc: 'Healing +25%.', bonus: { heal: 0.25 }, corpse: true },
  c_legs:     { name: 'Corpse: Legs', glyph: '聖', color: '#e8d8a8', rarity: 'corpse', desc: '+4 initiative, +15 Pace per stage.', bonus: { init: 4, paceStage: 3 }, corpse: true },
  c_heart:    { name: 'Corpse: Heart', glyph: '聖', color: '#e8d8a8', rarity: 'corpse', desc: '+15% damage.', bonus: { dmg: 0.15 }, corpse: true },
};

/* ---------------- Techniques (meta boons) ---------------- */
SBR.TECHNIQUES = {
  nyoho:     { name: 'Nyo-ho!', slots: 1, cost: 20, desc: 'Start every battle with +1 Energy.', bonus: { energyStart: 1 }, unlock: 'act1', unlockText: 'Clear Act I.' },
  instinct:  { name: 'Jockey\'s Instinct', slots: 1, cost: 20, desc: '+3 initiative for the party.', bonus: { init: 3 }, unlock: 'sprint1', unlockText: 'Win a stage sprint.' },
  grit:      { name: 'Cowboy Grit', slots: 1, cost: 25, desc: 'Every party member gains +8 max HP.', bonus: { maxHp: 8 }, unlock: 'tim', unlockText: 'Ride with Mountain Tim.' },
  purse:     { name: 'Prize Purse', slots: 1, cost: 15, desc: '+25% money.', bonus: { money: 0.25 }, unlock: 'rich', unlockText: 'Hold $400 at once.' },
  golden:    { name: 'Golden Ratio', slots: 2, cost: 50, desc: 'Spin abilities deal +18% damage.', bonus: { spinDmg: 0.18 }, unlock: 'golden', unlockText: 'Learn the Golden Rectangle.' },
  farmer:    { name: 'Farmer\'s Fortune', slots: 2, cost: 45, desc: '+8% crit chance and better skill check rolls (+1).', bonus: { crit: 0.08, check: 1 }, unlock: 'poco', unlockText: 'Recruit Pocoloco.' },
  pony:      { name: 'Pony Express', slots: 2, cost: 40, desc: '+15 Pace at the start of every act.', bonus: { pace: 15 }, unlock: 'top3x3', unlockText: 'Place top 3 in three sprints.' },
  mender:    { name: 'Flesh Mender', slots: 2, cost: 45, desc: 'Healing +25%.', bonus: { heal: 0.25 }, unlock: 'hotpants', unlockText: 'Ride with Hot Pants.' },
  rewind:    { name: 'Six Seconds Back', slots: 3, cost: 90, desc: 'Once per battle, the first ally to fall rewinds to 30% HP.', bonus: { stitch: 1 }, unlock: 'ringo', unlockText: 'Defeat Ringo Roadagain.' },
  rainwalk:  { name: 'Rain Walker', slots: 1, cost: 30, desc: 'Immune to Soaked and Blinded.', bonus: { immune: ['soaked', 'blind'] }, unlock: 'blackmore', unlockText: 'Defeat Blackmore.' },
  honest:    { name: 'Honest Man', slots: 2, cost: 50, desc: 'Shop prices are 20% cheaper.', bonus: { discount: 0.2 }, unlock: 'sugar', unlockText: 'Leave Sugar Mountain honestly.' },
  palm:      { name: 'Devil\'s Palm', slots: 3, cost: 80, desc: 'Each battle, every ally starts with a random buff.', bonus: { palm: 1 }, unlock: 'act2', unlockText: 'Clear Act II.' },
  dojyaan:   { name: 'Dojyaaan~', slots: 4, cost: 150, desc: 'Once per run, a total party wipe is undone: everyone returns at 50% HP.', bonus: { dojyaan: 1 }, unlock: 'valentine', unlockText: 'Defeat Funny Valentine.' },
  walker:    { name: 'Walking Again', slots: 5, cost: 200, desc: 'Johnny gains +3 to every stat and +20 max HP.', bonus: { johnnyAll: 3 }, unlock: 'win', unlockText: 'Finish the Steel Ball Run.' },
};

/* ---------------- Achievements ---------------- */
SBR.ACHIEVEMENTS = {
  first_blood: { name: 'The First 15,000 Meters', desc: 'Win your first battle.', rp: 5 },
  act1:        { name: 'Devil\'s Palm', desc: 'Clear Act I: The West.', rp: 20, unlockHorse: 'ironhoof' },
  act2:        { name: 'Scary Monsters', desc: 'Clear Act II: The Rockies.', rp: 25, unlockItem: 'spareballs' },
  act3:        { name: 'Silent Way', desc: 'Clear Act III: The Midwest.', rp: 30, unlockHorse: 'desertrose' },
  act4:        { name: 'Civil War', desc: 'Clear Act IV: The North.', rp: 35 },
  act5:        { name: 'Love Train', desc: 'Clear Act V: The East Coast.', rp: 45 },
  win:         { name: 'The World of Stars and Stripes', desc: 'Finish the Steel Ball Run.', rp: 80, unlockHorse: 'steppe' },
  champion:    { name: 'Walking Again', desc: 'Win the race overall in 1st place.', rp: 100 },
  sprint1:     { name: 'Photo Finish', desc: 'Win a stage sprint in 1st place.', rp: 10 },
  top3x3:      { name: 'Frontrunner', desc: 'Place top 3 in three sprints (lifetime).', rp: 15, unlockItem: 'dotmap' },
  tim:         { name: 'Oh! Lonesome Me', desc: 'Ride with Mountain Tim.', rp: 5, unlockItem: 'timsrope' },
  poco:        { name: 'Hey Ya!', desc: 'Recruit Pocoloco.', rp: 10 },
  hotpants:    { name: 'Cream Starter', desc: 'Ride with Hot Pants.', rp: 10 },
  weka:        { name: 'Wrecking Ball', desc: 'Recruit Wekapipo.', rp: 10 },
  golden:      { name: 'The Golden Rectangle', desc: 'Learn the Golden Spin.', rp: 15 },
  rich:        { name: 'Fifty Million Dollars', desc: 'Hold $400 at once.', rp: 10 },
  ringo:       { name: 'Mandom', desc: 'Defeat Ringo Roadagain.', rp: 15 },
  blackmore:   { name: 'Catch the Rainbow', desc: 'Defeat Blackmore.', rp: 15 },
  sugar:       { name: 'The Golden Axe', desc: 'Leave Sugar Mountain honestly.', rp: 15 },
  diego:       { name: 'Dio', desc: 'Defeat Diego in a rival encounter.', rp: 20, unlockHorse: 'silverbullet' },
  valentine:   { name: 'Dirty Deeds Done Dirt Cheap', desc: 'Defeat Funny Valentine.', rp: 50 },
  corpse5:     { name: 'The Saint\'s Corpse', desc: 'Hold 5 Corpse Parts at once.', rp: 25, unlockItem: 'arimathea' },
  crit_big:    { name: 'Recursive Rotation', desc: 'Deal 40+ damage in a single hit.', rp: 10 },
  nat20:       { name: 'Natural Talent', desc: 'Roll a natural 20 on a skill check.', rp: 5 },
  nat1:        { name: 'Deliberately Difficult', desc: 'Roll a natural 1 on a skill check.', rp: 5 },
  wipe:        { name: 'The Journey Is the Shortest Path', desc: 'Lose a run.', rp: 5 },
};

/* Aggregated passive bonuses from horse, relics and equipped techniques */
SBR.bonus = () => {
  const b = {};
  const add = src => {
    if (!src) return;
    for (const [k, v] of Object.entries(src)) {
      if (typeof v === 'number') b[k] = (b[k] || 0) + v;
      else if (Array.isArray(v)) b[k] = (b[k] || []).concat(v);
      else b[k] = v;
    }
  };
  const r = SBR.run;
  if (r) {
    add(SBR.HORSES[r.horse] && SBR.HORSES[r.horse].bonus);
    Object.keys(r.mats || {}).forEach(id => { const m = SBR.MATERIALS && SBR.MATERIALS[id]; if (m && m.holy && r.mats[id] > 0) add(m.bonus); });
    (r.party || []).forEach(m => Object.values(m.equip || {}).forEach(eid => {
      const e = eid && SBR.EQUIPMENT && SBR.EQUIPMENT[eid];
      if (!e) return;
      const runPart = {};
      Object.entries(e.bonus || {}).forEach(([k, v]) => { if ((SBR.RUN_KEYS || []).includes(k)) runPart[k] = v; });
      add(runPart);
    }));
    (r.tech || []).forEach(id => add(SBR.TECHNIQUES[id] && SBR.TECHNIQUES[id].bonus));
  }
  return b;
};
