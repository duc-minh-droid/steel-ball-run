/* Detour areas: optional side regions, like AAC's Mines and Sewer. An encounter on the main route opens one; inside,
   you ride a few stages with their own enemies, a hazard that affects every battle, unique materials and a boss.
   When you come out you rejoin the race at the stage you left, a little behind the pack. */
'use strict';

/* ---------------- Materials & gear ---------------- */
Object.assign(SBR.MATERIALS, {
  palmsand:   { name: 'Devil\'s Palm Sand', rarity: 'rare', desc: 'Sand from the place that gives people Stands. It never lies still.' },
  sunbone:    { name: 'Sun-Bleached Bone', rarity: 'uncommon', desc: 'Something walked into the Palm and did not walk out.' },
  deepsilver: { name: 'Deep-Vein Silver', rarity: 'rare', desc: 'Silver from below the last lantern. Cold to the touch.' },
  lakeice:    { name: 'Lake Michigan Ice', rarity: 'uncommon', desc: 'Clear as glass. It hasn\'t melted in your pocket.' },
  alphapelt:  { name: 'Alpha Wolf Pelt', rarity: 'rare', desc: 'White as the lake. The pack followed this one.' },
  railspike:  { name: 'Rail Spike', rarity: 'common', desc: 'Pulled from the Philadelphia line.' },
  tattooink:  { name: 'Eleven Men Ink', rarity: 'rare', desc: 'Tattoo You!\'s ink. It shifts when you look away.' },
});
Object.assign(SBR.EQUIPMENT, {
  sunbone_knife:   { slot: 'weapon', name: 'Sun-Bone Knife', rarity: 'rare', stats: { aim: 4, luck: 3 }, bonus: { bleedOnBasic: 0.35, res: { holy: -0.1 } }, recipe: { sunbone: 2, leather: 1 }, price: 120, area: 'devilspalm' },
  palm_charm:      { slot: 'charm', family: 'holy', name: 'Palm-Sand Locket', rarity: 'rare', stats: { res: 3, luck: 2 }, bonus: { palm: 1 }, recipe: { palmsand: 2, silver: 1 }, price: 140, area: 'devilspalm', note: 'Start each battle with a random blessing.' },
  fossil_cuirass:  { slot: 'coat', name: 'Fossil-Bone Cuirass', rarity: 'rare', stats: { grit: 6 }, bonus: { res: { phys: -0.15, stand: -0.1 }, immune: ['fossil'] }, recipe: { fossil: 3, deepsilver: 1 }, price: 140, area: 'silvermine' },
  deepvein_spurs:  { slot: 'boots', name: 'Deep-Vein Spurs', rarity: 'rare', stats: { ride: 4 }, bonus: { init: 3, crit: 0.04, res: { cold: -0.1 } }, recipe: { deepsilver: 2, leather: 1 }, price: 120, area: 'silvermine' },
  frost_monocle:   { slot: 'hat', name: 'Frost-Glass Monocle', rarity: 'rare', stats: { aim: 4 }, bonus: { crit: 0.06, res: { cold: -0.3 } }, recipe: { lakeice: 2, silver: 1 }, price: 120, area: 'lakeice' },
  alpha_mantle:    { slot: 'coat', name: 'Alpha Pelt Mantle', rarity: 'rare', stats: { grit: 5 }, bonus: { maxHp: 14, res: { cold: -0.35, bleed: -0.1 } }, recipe: { alphapelt: 1, wolfpelt: 2 }, price: 150, area: 'lakeice' },
  spike_knuckles:  { slot: 'weapon', name: 'Rail-Spike Knuckles', rarity: 'rare', stats: { grit: 4, aim: 3 }, bonus: { dmg: 0.1, res: { bullet: -0.1 } }, recipe: { railspike: 3, scrap: 2 }, price: 120, area: 'railyard' },
  ink_charm:       { slot: 'charm', family: 'trophy', name: 'Eleven Men Ink', rarity: 'rare', stats: { ride: 3 }, bonus: { dodge: 0.08, res: { stand: -0.15 } }, recipe: { tattooink: 1, cloth: 1 }, price: 140, area: 'railyard' },
});

/* ---------------- Hazards: one per area, applied at the start of every round in its battles ---------------- */
SBR.HAZARDS = {
  heat: { name: 'Scorching Palm', desc: 'Every round, anyone not Refreshed loses 4% max HP. The Palm\'s own creatures are used to it.',
    round(c) { if (c.round < 2) return; c.units.filter(u => !u.dead && !u.removed && !(u.def && u.def.native) && !c.has(u, 'refreshed')).forEach(u => c.typedHp(u, Math.max(1, Math.round(u.maxHp * 0.04)), 'true', 'HEAT')); } },
  cavein: { name: 'Cave-In', desc: 'Every third round the ceiling gives: one unit on each side is struck and Spun.',
    round(c) { if (c.round % 3) return; c.push({ t: 'float', uid: (c.alive('party')[0] || {}).uid, text: 'CAVE-IN!', cls: 'debuff big' });
      ['party', 'enemy'].forEach(side => { const v = SBR.util.pick(c.alive(side)); if (v) { c.typedHp(v, 6, 'phys', 'ROCKS'); c.addStatus(v, 'stun', 0, 1); } }); } },
  blizzard: { name: 'Lake Blizzard', desc: 'Every round, the party is Chilled (+20% Cold and +10% Physical damage taken).',
    round(c) { c.alive('party').forEach(u => c.addStatus(u, 'chilled', 0, 1, c.round > 1)); } },
  cramped: { name: 'Crowded Train Cars', desc: 'No room to move: everyone has -10% dodge. Tattoo soldiers slip between bodies.',
    round(c) { c.units.filter(u => !u.dead && !u.removed).forEach(u => c.addStatus(u, 'cramped', 0, 1, true)); } },
};
SBR.STATUS.cramped = { name: 'Cramped', glyph: '狭', color: '#8a7a6a', kind: 'debuff', mode: 'turns', desc: () => 'No room in the train car: -10% dodge.', mods: { dodge: -0.1 } };

/* ---------------- Area enemies ---------------- */
(() => {
  const port = key => ({ kind: 'portrait', key });
  const beast = (type, color, bg) => ({ kind: 'creature', type, color, bg });
  Object.assign(SBR.ENEMIES, {
    // Devil's Palm
    dust_wraith: { name: 'Dust Wraith', art: port('palmghost'), hp: 20, stats: { ride: 6 }, xp: 8, money: [4, 10], native: true, dtype: 'stand', res: { phys: -0.4, bullet: -0.4, spin: 0.3, holy: 0.3 },
      passive: 'A traveller the Palm swallowed. Bullets and fists pass through it.',
      abilities: [{ name: 'Grasping Sand', w: 3, target: 'enemy', fx: 'claw', run: x => x.dmg(x.target, 5, { ride: 0.03 }) },
        { name: 'Sand in the Lungs', w: 1, cd: 3, target: 'enemy', fx: 'spray', run: x => x.status(x.target, 'blind', 0, 1) }] },
    sidewinder: { name: 'Palm Sidewinder', art: beast('snake', '#e8c078', ['#c8323c', '#f6c27a']), hp: 14, stats: { ride: 8 }, xp: 5, money: [0, 4], native: true, dtype: 'bleed', res: { cold: 0.4 },
      abilities: [{ name: 'Sidewinder Strike', w: 1, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 4, {}); if (r.hit) x.status(x.target, 'bleed', 3); } }] },
    palm_echo: { name: 'Echo of the Palm', title: 'The Place That Gives Stands', art: port('palmecho'), tier: 'boss', hp: 150, stats: { aim: 6, res: 6, luck: 6 }, xp: 70, money: [60, 80], native: true, dtype: 'stand',
      stand: 'The Devil\'s Palm', sigil: 'dmark', sigilColor: '#e8742a', quote: 'You came looking for a Stand. The Palm decides what you are given... and what you are not.',
      passive: 'Every round the Palm shifts: immune to one damage type and weak (+50%) to the next. Read the tooltip, change your attacks.',
      abilities: [
        { name: 'Borrowed Power', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 8, { aim: 0.04 }, { dtype: x.user.shiftType || 'stand' }) },
        { name: 'Sandstorm', w: 2, cd: 2, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => { x.dmg(e, 4, {}, { dtype: 'phys' }); if (x.roll(0.5)) x.status(e, 'blind', 0, 1); }) },
        { name: 'The Palm Takes', w: 2, cd: 3, target: 'enemy', fx: 'debuff', run: x => { x.status(x.target, 'weak', 0, 2); x.status(x.target, 'fear', 0, 1); x.say(x.user, 'This is not yours.'); } },
        { name: 'Call the Lost', w: 1, cd: 4, target: 'self', fx: 'buff', cond: x => x.allies.length < 3, run: x => x.summon('dust_wraith') },
      ],
      hooks: { roundStart: x => {
        const T = ['phys', 'bullet', 'spin', 'stand'];
        const i = ((x.user.shiftIdx == null ? -1 : x.user.shiftIdx) + 1) % T.length;
        x.user.shiftIdx = i; x.user.shiftType = T[i];
        x.user.baseRes = { [T[i]]: -1, [T[(i + 1) % T.length]]: 0.5, holy: 0.2 };
        x.c.push({ t: 'float', uid: x.user.uid, text: `IMMUNE: ${SBR.DMG[T[i]].name.toUpperCase()}`, cls: 'block big' });
        x.log(`The Palm shifts. Immune to ${SBR.DMG[T[i]].name}, weak to ${SBR.DMG[T[(i + 1) % T.length]].name}.`);
      } } },
    // Silver Mine
    claim_jumper: { name: 'Claim Jumper', art: port('miner'), hp: 28, stats: { aim: 5, grit: 4 }, xp: 9, money: [14, 26], res: { phys: -0.1, cold: -0.1 },
      abilities: [{ name: 'Pickaxe', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 6, { grit: 0.03 }) },
        { name: 'Blasting Cap', w: 1, cd: 3, target: 'allEnemies', fx: 'boom', run: x => x.enemies.forEach(e => x.dmg(e, 4, {})) }] },
    cave_bat: { name: 'Cave Bat Swarm', art: beast('crow', '#4a3a5a', ['#1a1020', '#6a5a7a']), hp: 12, stats: { ride: 9 }, xp: 4, money: [0, 2], native: true, dtype: 'bleed', res: { sound: 0.5, bullet: 0.2 },
      abilities: [{ name: 'Swarm Bite', w: 1, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 3, {}); if (r.hit) x.status(x.target, 'bleed', 1); } }] },
    fossil_colossus: { name: 'Fossil Colossus', title: 'Scary Monsters\' Forgotten Beast', art: beast('grizzly', '#d8d0b8', ['#3a2a1a', '#c8e04a']), tier: 'boss', hp: 175, stats: { grit: 9 }, xp: 72, money: [60, 85], native: true,
      dtype: 'phys', res: { phys: -0.3, stand: -0.1, cold: 0.3, holy: 0.4 },
      stand: 'Scary Monsters (remnant)', sigil: 'claw', sigilColor: '#c8e04a', quote: 'A grizzly skeleton, dinosaurified long after death. The walls of the mine are full of its children.',
      passive: 'Every second round, a fossil in the wall wakes up as a raptor. Its bite spreads Fossilizing. Weak to Holy and Cold.',
      abilities: [
        { name: 'Bone Slam', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 9, { grit: 0.04 }); if (r.hit) x.status(x.target, 'fossil', 1); } },
        { name: 'Primal Roar', w: 2, cd: 2, target: 'allEnemies', fx: 'debuff', run: x => x.enemies.forEach(e => { x.status(e, 'fossil', 1); x.status(e, 'fear', 0, 1); }) },
        { name: 'Tail Sweep', w: 2, cd: 3, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => x.dmg(e, 6, { grit: 0.02 })) },
      ],
      hooks: { roundStart: x => { if (x.round % 2 === 0 && x.allies.length < 4) { x.summon('raptor'); x.log('A fossil tears itself out of the wall!'); } } } },
    // Lake Michigan
    ice_trapper: { name: 'Ice Trapper', art: port('trapper'), hp: 30, stats: { aim: 6 }, xp: 10, money: [12, 22], native: true, res: { cold: -0.5, bullet: -0.1 },
      abilities: [{ name: 'Trapper\'s Rifle', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 6, { aim: 0.04 }) },
        { name: 'Bear Trap', w: 1, cd: 3, target: 'enemy', fx: 'claw', run: x => { x.dmg(x.target, 4, {}, { dtype: 'bleed' }); x.status(x.target, 'hooked', 0, 1); } }] },
    wolf_alpha: { name: 'The White Alpha', title: 'Pack Leader of the Frozen Lake', art: beast('wolf', '#f6fbff', ['#1a2a4a', '#9fd0f0']), tier: 'boss', hp: 160, stats: { ride: 10, grit: 5 }, xp: 72, money: [55, 80], native: true,
      dtype: 'bleed', res: { cold: -1, phys: -0.1, bullet: 0.2, holy: 0.1 },
      stand: 'The Pack', sigil: 'claw', sigilColor: '#9fd0f0', quote: 'The ice groans. Eyes in the snow, dozens of them. One pair is higher than the rest.',
      passive: 'Howls every round to empower the pack. Calls wolves when alone and enrages when its pack is gone. Immune to Cold.',
      abilities: [
        { name: 'Alpha Bite', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 8, { ride: 0.04 }); if (r.hit) x.status(x.target, 'bleed', 3); } },
        { name: 'Blizzard Howl', w: 2, cd: 2, target: 'allEnemies', fx: 'sound', run: x => x.enemies.forEach(e => { x.dmg(e, 5, {}, { dtype: 'cold' }); x.status(e, 'chilled', 0, 2); }) },
        { name: 'Call the Pack', w: 2, cd: 3, target: 'self', fx: 'buff', cond: x => x.allies.length < 3, run: x => { x.summon('wolf'); x.summon('wolf'); } },
      ],
      hooks: { roundStart: x => {
        const pack = x.allies.filter(a => a !== x.user);
        if (pack.length) pack.forEach(a => x.status(a, 'empower', 0, 1));
        else if (!x.flag('alphaRage')) { x.setFlag('alphaRage'); x.status(x.user, 'empower', 0, 99); x.status(x.user, 'evasive', 0, 2); x.say(x.user, 'AROOOOO!'); }
      } } },
    // Philadelphia Rail Yard
    rail_detective: { name: 'Railroad Detective', art: port('agent'), hp: 30, stats: { aim: 6, grit: 3 }, xp: 10, money: [14, 24], res: { bullet: -0.15 },
      abilities: [{ name: 'Derringer', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 6, { aim: 0.04 }) },
        { name: 'Cuffs', w: 1, cd: 3, target: 'enemy', fx: 'debuff', run: x => x.status(x.target, 'weak', 0, 2) }] },
    tattoo_boss: { name: 'Tattoo You!', title: 'The Eleven Men, as One', art: port('tattoo'), tier: 'boss', hp: 140, stats: { aim: 8, ride: 6 }, xp: 72, money: [60, 85], dtype: 'stand',
      res: { stand: -0.2, spin: 0.25, holy: 0.1 },
      stand: 'Tattoo You!', sigil: 'dmark', sigilColor: '#c8323c', quote: 'Eleven men breathe as one. Hit one of us and you hit a stranger. There is always another body.',
      passive: 'Every soldier Phases: half the damage aimed at any of them slips into another. Refills the ranks every other round. Kill the soldiers to pin down the leader.',
      abilities: [
        { name: 'Eleven Blades', w: 3, target: 'enemy', fx: 'hit', run: x => { const n = x.allies.length; x.dmg(x.target, 3 + n * 2, { aim: 0.03 }); } },
        { name: 'Swap Bodies', w: 2, cd: 3, target: 'self', fx: 'heal', cond: x => x.allies.length > 1, run: x => { const d = x.allies.find(a => a !== x.user); if (d) { const n = Math.min(d.hp - 1, 18); if (n > 0) { d.hp -= n; x.c.push({ t: 'setHp', uid: d.uid, hp: d.hp }); x.heal(x.user, n, {}); } } } },
        { name: 'Surround the Car', w: 2, cd: 2, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => { x.dmg(e, 4, {}); x.status(e, 'vuln', 0, 1); }) },
      ],
      hooks: {
        start: x => x.allies.forEach(a => x.status(a, 'phase', 0, 99)),
        roundStart: x => { if (x.round % 2 === 0 && x.allies.length < 4) { const s = x.summon('tattoo'); if (s) x.status(s, 'phase', 0, 99); x.log('Another tattooed body steps out of the crowd.'); } },
      } },
  });
  Object.assign(SBR.DROPS, {
    dust_wraith: [['palmsand', 0.35, 1, 1], ['cloth', 0.3, 1, 1]], sidewinder: [['sunbone', 0.4, 1, 1], ['venom', 0.5, 1, 1]], palm_echo: [['palmsand', 1, 2, 3], ['sunbone', 1, 1, 2]],
    claim_jumper: [['deepsilver', 0.3, 1, 1], ['scrap', 0.6, 1, 2], ['powder', 0.4, 1, 1]], cave_bat: [['fang', 0.3, 1, 1]], fossil_colossus: [['fossil', 1, 2, 3], ['deepsilver', 1, 1, 2]],
    ice_trapper: [['lakeice', 0.5, 1, 1], ['wolfpelt', 0.4, 1, 1]], wolf_alpha: [['alphapelt', 1, 1, 1], ['lakeice', 1, 1, 2], ['wolfpelt', 1, 1, 2]],
    rail_detective: [['railspike', 0.6, 1, 2], ['silver', 0.2, 1, 1]], tattoo_boss: [['tattooink', 1, 1, 2], ['railspike', 1, 2, 3]],
  });
  SBR.DROPS.tattoo = (SBR.DROPS.tattoo || []).concat([['tattooink', 0.12, 1, 1]]);
  SBR.DROPS.wolf = (SBR.DROPS.wolf || []).concat([['lakeice', 0.2, 1, 1]]);
})();

/* ---------------- The areas ---------------- */
SBR.AREAS = {
  devilspalm: { name: 'The Devil\'s Palm', sub: 'A hollow in the desert that is never in the same place twice', acts: [1, 2], stages: 3, scene: 7, hazard: 'heat', color: '#e8742a',
    fights: [['dust_wraith', 'sidewinder'], ['dust_wraith', 'dust_wraith'], ['sidewinder', 'sidewinder', 'bandit'], ['dust_wraith', 'coyote', 'sidewinder']],
    mats: ['palmsand', 'sunbone', 'needle'], boss: { enemies: ['palm_echo'], name: 'The Palm Closes' },
    reward: g => { g.mat('palmsand', 1); g.relic('c_leftarm'); }, rewardText: 'At the centre of the Palm, half-buried: a mummified arm. It is warm.' },
  silvermine: { name: 'The Silver Mine', sub: 'Abandoned shafts under the Rockies. Something is still digging', acts: [2, 3], stages: 3, scene: 8, hazard: 'cavein', color: '#8a8aa0',
    fights: [['claim_jumper', 'claim_jumper'], ['cave_bat', 'cave_bat', 'cave_bat'], ['claim_jumper', 'cave_bat', 'raptor'], ['raptor', 'raptor', 'cave_bat']],
    mats: ['deepsilver', 'silver', 'scrap', 'fossil'], boss: { enemies: ['fossil_colossus'], name: 'The Thing in the Deep Vein' },
    reward: g => { g.mat('deepsilver', 2); g.money(80); }, rewardText: 'The colossus crumbles into a vein of pure silver.' },
  lakeice: { name: 'Frozen Lake Michigan', sub: 'A shortcut across the ice. The wolves know it too', acts: [4], stages: 3, scene: 9, hazard: 'blizzard', color: '#9fd0f0',
    fights: [['wolf', 'wolf', 'ice_trapper'], ['ice_trapper', 'ice_trapper'], ['wolf', 'wolf', 'wolf'], ['crow', 'ice_trapper', 'wolf']],
    mats: ['lakeice', 'wolfpelt'], boss: { enemies: ['wolf_alpha', 'wolf'], name: 'The White Alpha' },
    reward: g => { g.mat('alphapelt', 1); g.pace(10); }, rewardText: 'With the pack gone, the ice is a straight road east. You make up ground.' },
  railyard: { name: 'Philadelphia Rail Yard', sub: 'Freight cars, detectives, and eleven men who move as one', acts: [5], stages: 3, scene: 10, hazard: 'cramped', color: '#c8323c',
    fights: [['rail_detective', 'rail_detective'], ['tattoo', 'tattoo', 'rail_detective'], ['rail_detective', 'vguard'], ['tattoo', 'tattoo']],
    mats: ['railspike', 'scrap', 'silver'], boss: { enemies: ['tattoo_boss', 'tattoo', 'tattoo'], name: 'Eleven Men, One Body' },
    reward: g => { g.mat('tattooink', 1); g.flag('agentOrders'); }, rewardText: 'On the leader\'s body: the President\'s orders for the final stage. You know what his guards will do.' },
};
SBR.inArea = () => !!(SBR.run && SBR.run.area);
SBR.curArea = () => (SBR.run && SBR.run.area ? SBR.AREAS[SBR.run.area.id] : null);
SBR.sceneId = () => { const a = SBR.curArea(); return a ? a.scene : (SBR.ACTS[SBR.run.act] || {}).scene || 1; };
SBR.curHazard = () => { const a = SBR.curArea(); return a ? a.hazard : null; };
Object.entries(SBR.AREAS).forEach(([id, a]) => { SBR.SCAVENGE_MATS['area_' + id] = a.mats; });

/* ---------------- Area stage cards ---------------- */
SBR.AREA_EVENTS = {
  // one-off story events inside areas: every choice matters
  palm_well: { area: 'devilspalm', type: 'event', title: 'A Well That Should Not Be', blurb: 'Fresh water, in the middle of the Palm.', icon: 'star', art: null,
    text: 'The rope is new. The water is cold. Someone has carved a spiral into the stone rim, and below it: "DRINK AND BE GIVEN."',
    choices: [
      { label: 'Drink (RESOLVE)', check: { stat: 'res', dc: 12 }, ok: { text: 'Visions of a man with holes in his palms. You wake up stronger. (Party +1 all stats... for the lead.)', fx: g => { const l = SBR.run.lead || 'johnny'; ['spin', 'aim', 'grit', 'ride', 'res', 'luck'].forEach(s => g.statUp(l, s, 1)); } }, fail: { text: 'The water tastes of sand. Something climbs out after you.', fight: { enemies: ['dust_wraith', 'dust_wraith', 'dust_wraith'] } } },
      { label: 'Fill every canteen', ok: { text: 'You leave with water for days. (2 Canteens, party heals 30%.)', fx: g => { g.item('canteen'); g.item('canteen'); g.healAll(0.3); } } },
      { label: 'Break the rope and move on', ok: { text: 'The well collapses into itself. Under the stones: Palm sand, bone, and a wrapped knife.', fx: g => { g.mat('palmsand', 1); g.mat('sunbone', 2); } } },
    ] },
  mine_cart: { area: 'silvermine', type: 'event', title: 'The Runaway Cart', blurb: 'A loaded ore cart and a long, dark track.', icon: 'star',
    text: 'The cart is full of silver ore. The track slopes down into the dark. Voices echo from below: claim jumpers, and they have heard you.',
    choices: [
      { label: 'Ride the cart down (RIDING)', check: { stat: 'ride', dc: 13 }, ok: { text: 'You scream down the shaft and crash into their camp before they can draw.', fight: { enemies: ['claim_jumper', 'claim_jumper'], after: g => g.mat('deepsilver', 2) } }, fail: { text: 'The cart jumps the rails. Everyone is bruised. (Party loses 15% HP.)', fx: g => g.hurtAll(0.15) } },
      { label: 'Push the ore up to daylight', ok: { text: 'Hours of work. The silver is yours. (2 Silver, 1 Deep-Vein Silver, 1 Exhaustion.)', fx: g => { g.mat('silver', 2); g.mat('deepsilver', 1); g.exhaust('random'); } } },
      { label: 'Send it down empty as a warning', ok: { text: 'The crash echoes for a minute. When you go down, they have fled, leaving their dynamite.', fx: g => { g.item('dynamite'); g.item('dynamite'); } } },
    ] },
  lake_crack: { area: 'lakeice', type: 'event', title: 'The Ice Cracks', blurb: 'A long black line runs under your horses.', icon: 'star',
    text: 'The ice groans. A crack races ahead of you, and on the far side a trapper\'s sled has already gone through. Someone is still holding onto the edge.',
    choices: [
      { label: 'Pull him out (GRIT)', check: { stat: 'grit', dc: 13 }, ok: { text: 'He coughs up lake water and presses his fur cap into your hands. "Take the long way round the east bank." (Fur Cap, +5 pace.)', fx: g => { g.gear('fur_cap'); g.pace(5); } }, fail: { text: 'You get him out, barely. You are soaked through. (Party Exhaustion +1 to one rider.)', fx: g => g.exhaust('random') } },
      { label: 'Salvage the sled from the edge', ok: { text: 'Pelts, lake ice, and a rifle. He curses you as you ride off.', fx: g => { g.mat('wolfpelt', 2); g.mat('lakeice', 2); g.flag('trapperGrudge'); } } },
      { label: 'Ride around the crack', ok: { text: 'It costs time, but nobody gets wet.', fx: g => g.pace(-3) } },
    ] },
  rail_car: { area: 'railyard', type: 'event', title: 'The Sealed Boxcar', blurb: 'A boxcar marked with the Presidential seal.', icon: 'star',
    text: 'Two guards, one padlock, and a car that hums. Through the slats: crates of rifles, and a single glass case with something inside wrapped in white cloth.',
    choices: [
      { label: 'Pick the lock (LUCK)', check: { stat: 'luck', dc: 14 }, ok: { text: 'In the glass case: burial linen. The Saint\'s? It feels warm. (Linen of the Saint.)', fx: g => g.gear('saint_bandage') }, fail: { text: 'The lock clanks. The guards turn.', fight: { enemies: ['vguard', 'rail_detective'] } } },
      { label: 'Take them head on', ok: { text: 'Fast and loud.', fight: { enemies: ['vguard', 'vguard'], after: g => { g.gear('silver_rounds'); } } } },
      { label: 'Leave a note for the Vatican', ok: { text: 'Someone collects it within the hour. Later, an unmarked horse is waiting for you, loaded with supplies. (Party heals 40%, 2 items.)', fx: g => { g.healAll(0.4); g.itemRandom(); g.itemRandom(); } } },
    ] },
};

/* entry encounters on the main route */
(() => {
  const E = [
    { area: 'devilspalm', title: 'The Devil\'s Palm', blurb: 'The sand ahead is moving in a slow spiral.', art: null,
      text: 'Mountain Tim told you about this place. People walk in and come out with Stands, or they don\'t come out at all. The hollow opens in front of you like a hand.' },
    { area: 'silvermine', title: 'A Mine Nobody Works', blurb: 'Fresh lantern light in an abandoned shaft.', art: 'miner',
      text: 'The claim sign says ABANDONED 1881. The lanterns are lit. From deep inside comes a sound like something big turning over in its sleep.' },
    { area: 'lakeice', title: 'The Frozen Shortcut', blurb: 'Lake Michigan, frozen solid. Mostly.', art: 'trapper',
      text: 'An ice trapper points across the lake. "Straight across saves you two days. The wolves own the middle, though. White one\'s bigger than your horse."' },
    { area: 'railyard', title: 'The Rail Yard', blurb: 'Freight cars and too many men with the same tattoo.', art: 'tattoo',
      text: 'The President\'s men are loading something at the Philadelphia yard. Cut through and you might learn what. Or you might meet all eleven of them.' },
  ];
  E.forEach(e => {
    const A = SBR.AREAS[e.area];
    SBR.EVENTS.push({
      id: 'area_' + e.area, acts: A.acts, type: 'detour', title: e.title, blurb: e.blurb, icon: 'map', weight: 3, once: true, pace: 0, art: e.art, detour: e.area,
      cond: g => !SBR.run.area && SBR.run.stage < SBR.ACTS[SBR.run.act].stages - 1,
      text: e.text,
      html: `${e.text}<span class="ev-path" style="--pc:${A.color}"><b>Detour: ${A.name}</b> — ${A.stages} stages and a boss, then back to the race (−10 pace).<br><i>Hazard: ${SBR.HAZARDS[A.hazard].name}. ${SBR.HAZARDS[A.hazard].desc}</i></span>`,
      choices: [
        { label: `Enter ${A.name}`, ok: { text: 'You leave the race route behind.', fx: g => g.enterArea(e.area) } },
        { label: 'Scout the edge and ride on', ok: { text: 'You pick up what the area leaves at its border.', fx: g => { A.mats.slice(0, 2).forEach(m => g.mat(m, 1)); } } },
      ],
    });
  });
})();

/* ---------------- Scenes & art ---------------- */
(() => {
  const I = SBR.icons, P = I.P, K = I.K, st = I.st, shine = I.shine;
  const m = (id, fn) => I.define('mat', id, fn);
  m('palmsand', () => `<path d="M6 36q18-22 36 0z" fill="#e8b36a" ${st}/>` + P.spiral('#c8323c', 1.6).replace('<path', '<path transform="translate(12 10) scale(.5)"'));
  m('sunbone', () => P.bone('#f6ecd8') + `<circle cx="36" cy="10" r="5" fill="#f2c14e" ${st} stroke-width="1.4"/>`);
  m('deepsilver', () => P.nugget('#c8d0e0') + `<path d="M8 8l4 4M40 8l-4 4" stroke="#9fd0f0" stroke-width="2"/>`);
  m('lakeice', () => `<path d="M12 10l20-4 10 16-8 20-22-2-6-18z" fill="#dff2ff" ${st}/><path d="M12 10l14 12 16 0M26 22l-2 20" stroke="#9fd0f0" stroke-width="1.6" fill="none"/>${shine(18, 16, 3)}`);
  m('alphapelt', () => P.pelt('#f6fbff', '#c8d8e8') + `<path d="M18 12l2 4M30 12l-2 4" stroke="#9fd0f0" stroke-width="2"/>`);
  m('railspike', () => `<path d="M20 4h14v6H28v32l-4 4-4-4V10h-6z" fill="#7a7a8a" ${st}/>${shine(26, 20, 2)}`);
  m('tattooink', () => P.bottle('#2a2a3a', '#c8323c') + `<path d="M20 30l4-4 4 4-4 4z" fill="#1a1020"/>`);
  const e = (id, fn) => I.define('equip', id, fn);
  e('sunbone_knife', () => P.blade('#f6ecd8', '#c8323c'));
  e('palm_charm', () => P.coin('#e8b36a', '✋'));
  e('fossil_cuirass', () => `<path d="M14 6h20l6 10-4 28H12L8 16z" fill="#d8d0b8" ${st}/>` + [18, 24, 30, 36].map(y => `<path d="M12 ${y}q12 4 24 0" stroke="${K}" stroke-width="1.8" fill="none"/>`).join('') + `<path d="M24 8v34" stroke="${K}" stroke-width="2"/>`);
  e('deepvein_spurs', () => I.BOOT('#3a3a4a', '#c8d0e0') + `<circle cx="8" cy="40" r="4" fill="none" stroke="#9fd0f0" stroke-width="2.4"/>`);
  e('frost_monocle', () => `<circle cx="22" cy="22" r="14" fill="#dff2ff" opacity=".85" ${st}/><circle cx="22" cy="22" r="14" fill="none" stroke="#c8c8d8" stroke-width="3"/><path d="M34 32q6 6 4 14" stroke="#c8a040" stroke-width="2" fill="none"/>${shine(16, 16, 3.5)}`);
  e('alpha_mantle', () => `<path d="M24 4q-12 0-16 12L4 44h40L40 16Q36 4 24 4z" fill="#f6fbff" ${st}/><path d="M16 14l-4-8 8 4M32 14l4-8-8 4" fill="#f6fbff" ${st}/><circle cx="19" cy="14" r="1.6" fill="#6a9ac8"/><circle cx="29" cy="14" r="1.6" fill="#6a9ac8"/>`);
  e('spike_knuckles', () => `<rect x="8" y="16" width="32" height="14" rx="4" fill="#7a7a8a" ${st}/>` + [13, 21, 29, 37].map(x => `<path d="M${x - 3} 16l3-10 3 10" fill="#9a9aaa" ${st} stroke-width="1.4"/>`).join('') + `<path d="M12 30v10h24V30" fill="none" ${st}/>`);
  e('ink_charm', () => P.coin('#2a2a3a', '11').replace('fill="#1a1020">11', 'fill="#c8323c">11'));
  I.define('status', 'cramped', () => `<rect x="6" y="10" width="36" height="28" fill="#8a6a4a" ${st}/><path d="M14 10v28M34 10v28" stroke="${K}" stroke-width="2"/><path d="M18 24h12M18 24l4-4M18 24l4 4M30 24l-4-4M30 24l-4 4" stroke="#fff" stroke-width="2"/>`);
})();
