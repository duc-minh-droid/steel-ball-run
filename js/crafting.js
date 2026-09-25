/* Crafting data: materials, Stand Remnants, equipment, recipes, enemy drop tables */
'use strict';

SBR.MATERIALS = {
  scrap:     { name: 'Cyborg Scrap', rarity: 'common', desc: 'Rivets, plates and gears. Stroheim would call it German science.' },
  leather:   { name: 'SPW Saddle Leather', rarity: 'common', desc: 'Speedwagon Foundation stock. Tanned and tough.' },
  cloth:     { name: 'Satiporoja Silk', rarity: 'common', desc: 'Woven from Satiporoja beetle hair, like Lisa Lisa\'s scarf.' },
  powder:    { name: 'German Army Powder', rarity: 'common', desc: 'From Stroheim\'s supply crates. Keep it away from Oyecomova.' },
  needle:    { name: 'Cactus Needle', rarity: 'common', desc: 'Sharp enough to sew leather.' },
  venom:     { name: 'Rattler Venom', rarity: 'uncommon', desc: 'Milked from a very unhappy snake.' },
  pelt:      { name: 'Coyote Pelt', rarity: 'common', desc: 'Warm, scruffy, a little bloody.' },
  fang:      { name: 'Cougar Fang', rarity: 'uncommon', desc: 'Curved like a sabre.' },
  scale:     { name: 'Dino Scale', rarity: 'uncommon', desc: 'Shed by a villager who is no longer human.' },
  fossil:    { name: 'Fossil Shard', rarity: 'uncommon', desc: 'Scary Monsters leaves these behind.' },
  feather:   { name: 'Eagle Feather', rarity: 'uncommon', desc: 'Found on the high mesas.' },
  rainvial:  { name: 'Frozen Raindrop', rarity: 'rare', desc: 'A raindrop that never melts. Razor-edged.' },
  wolfpelt:  { name: 'Wolf Pelt', rarity: 'uncommon', desc: 'Thick northern fur.' },
  claw:      { name: 'Grizzly Claw', rarity: 'uncommon', desc: 'Longer than your fingers.' },
  silver:    { name: 'Chariot Silver', rarity: 'uncommon', desc: 'Silver from a rapier blade that was fired and never found.' },
  gold:      { name: 'Aztec Gold', rarity: 'rare', desc: 'From the ruins where the Stone Masks were carved.' },
  wire:      { name: 'Telegraph Wire', rarity: 'common', desc: 'Copper line cut from a government pole.' },
  horsehair: { name: 'Horsehair', rarity: 'common', desc: 'Brushed from a racehorse\'s tail.' },
  herb:      { name: 'Trussardi Herbs', rarity: 'common', desc: 'Basil and oregano from Tonio Trussardi\'s garden.' },
  sap:       { name: 'Golden Sap', rarity: 'rare', desc: 'Resin from the Sugar Mountain tree.' },
  menger:    { name: 'Menger Dust', rarity: 'rare', desc: 'What\'s left when two copies of a person meet.' },
  ballfrag:  { name: 'Steel Ball Shard', rarity: 'uncommon', desc: 'A chip of Zeppeli steel. It still hums.' },
};

/* Stand Remnants: this game's "Souls". Dropped by elites and bosses, used for their signature gear. */
SBR.REMNANTS = {
  rem_robinson:  { name: 'Hive Heart', from: 'Mrs. Robinson', color: '#a0c040', motif: 'claw' },
  rem_boom:      { name: 'Magnet Core', from: 'Tomb of the Boom', color: '#9aa8c8', motif: 'magnet' },
  rem_stroheim:  { name: 'Prussian Medal', from: 'Fritz von Stroheim', color: '#c0a040', motif: 'cross' },
  rem_oyecomova: { name: 'Detonator Pin', from: 'Oyecomova', color: '#f2c14e', motif: 'bomb' },
  rem_porkpie:   { name: 'Wired Hook', from: 'Pork Pie Hat Kid', color: '#c8c8d8', motif: 'hook' },
  rem_diego:     { name: 'Tooth of Dio', from: 'Diego Brando', color: '#8adf6a', motif: 'claw' },
  rem_ferdinand: { name: 'Primal Fossil', from: 'Dr. Ferdinand', color: '#c8e04a', motif: 'claw' },
  rem_hotpants:  { name: 'Cream Starter Flesh', from: 'Hot Pants', color: '#f09ac0', motif: 'spiral' },
  rem_ringo:     { name: 'Mandom Watch', from: 'Ringo Roadagain', color: '#e8c070', motif: 'clock' },
  rem_blackmore: { name: 'Rainbow Drop', from: 'Blackmore', color: '#9fc7e8', motif: 'drops' },
  rem_sandman:   { name: 'Silent Stamp', from: 'Sandman', color: '#e8508a', motif: 'sound' },
  rem_magent:    { name: '20th Century Plate', from: 'Magent Magent', color: '#9fc7e8', motif: 'ball' },
  rem_weka:      { name: 'Wrecking Core', from: 'Wekapipo', color: '#c8c8d8', motif: 'ball' },
  rem_axl:       { name: 'Civil War Rosary', from: 'Axl RO', color: '#e8d8c8', motif: 'cross' },
  rem_disco:     { name: 'Disco Tile', from: 'D-I-S-C-O', color: '#e8742a', motif: 'grid' },
  rem_mikeo:     { name: 'Tubular Needle', from: 'Mike O.', color: '#e8508a', motif: 'balloon' },
  rem_valentine: { name: 'The First Napkin', from: 'Funny Valentine', color: '#f6ecd8', motif: 'flag' },
};
Object.entries(SBR.REMNANTS).forEach(([k, r]) => { SBR.MATERIALS[k] = { name: r.name, rarity: 'remnant', desc: `Stand Remnant from ${r.from}. Crafts their signature gear.`, remnant: true, color: r.color, motif: r.motif }; });
SBR.matIcon = id => { const m = SBR.MATERIALS[id]; return m && m.remnant ? SBR.icons.remnant(m.color, m.motif) : m && m.holy ? SBR.icons.relic(id) : SBR.icons.mat(id); };

/* Equipment-granted abilities */
Object.assign(SBR.ABILITIES, {
  insect_volley: { name: 'Insect Volley', cost: 1, cd: 2, target: 'enemy', tags: ['gun'], fx: 'spray', desc: () => 'Bullets full of bugs. Blind 2 and Bleed 2.', run(x) { const r = x.dmg(x.target, 4, { aim: 0.03 }); if (r.hit) { x.status(x.target, 'blind', 0, 2); x.status(x.target, 'bleed', 2); } } },
  iron_sand: { name: 'Iron Sand Pull', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], fx: 'magnet', desc: () => 'Magnetised iron clamps the target. 55% stun.', run(x) { const r = x.dmg(x.target, 5, { grit: 0.04 }); if (r.hit && x.roll(0.55)) x.status(x.target, 'stun', 0, 1); } },
  plant_pin: { name: 'Plant a Pin', cost: 1, cd: 3, target: 'enemy', tags: ['stand'], fx: 'pin', desc: () => 'Press a bomb pin into the target. It explodes for 18 in 2 turns.', run(x) { x.status(x.target, 'primed', 0, 2); } },
  hook_reel: { name: 'Hook & Reel', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], fx: 'rope', desc: () => 'Hook, drag, stun 1 and Bleed 2.', run(x) { const r = x.dmg(x.target, 5, { aim: 0.03 }); if (r.hit) { x.status(x.target, 'stun', 0, 1); x.status(x.target, 'bleed', 2); } } },
  raindrop_blades: { name: 'Raindrop Blades', cost: 2, cd: 2, target: 'allEnemies', tags: ['stand'], fx: 'rain', desc: () => 'Frozen rain slices every enemy and Soaks them.', run(x) { x.enemies.forEach(e => { x.dmg(e, 4, { aim: 0.03 }); x.status(e, 'soaked', 0, 2); }); } },
  sound_stamp: { name: 'Sound Stamp', cost: 1, cd: 1, target: 'enemy', tags: ['stand'], fx: 'sound', desc: () => 'Stamp "DOGOOON" onto the target: 2 Sound stacks detonate when it acts.', run(x) { x.dmg(x.target, 3, { ride: 0.03 }); x.status(x.target, 'sound', 2); } },
  kneel: { name: '20th Century BOY', cost: 1, cd: 5, target: 'self', tags: ['stand'], fx: 'buff', desc: () => 'Kneel. Untouchable until your next turn ends.', run(x) { x.status(x.user, 'invuln', 0, 2); } },
  grid_teleport: { name: 'Grid Teleport', cost: 2, cd: 2, target: 'enemy', tags: ['stand'], fx: 'grid', desc: () => 'Appear inside the target\'s square. 10 base, cannot be dodged.', run(x) { x.dmg(x.target, 10, { aim: 0.04 }, { noDodge: true }); } },
  balloon_needle: { name: 'Balloon Needle', cost: 1, cd: 2, target: 'enemy', tags: ['stand'], fx: 'spray', desc: () => 'A balloon animal pops into needles. Bleed 3.', run(x) { const r = x.dmg(x.target, 4, { aim: 0.03 }); if (r.hit) x.status(x.target, 'bleed', 3); } },
  first_napkin: { name: 'The First Napkin', cost: 2, cd: 4, target: 'self', tags: ['stand'], fx: 'heal', desc: () => 'Take what is yours first: heal 25% max HP and gain Evasive 2.', run(x) { x.heal(x.user, Math.round(x.user.maxHp * 0.25), {}); x.status(x.user, 'evasive', 0, 2); } },
  primal_surge: { name: 'Primal Surge', cost: 2, cd: 3, target: 'allEnemies', tags: ['stand'], fx: 'claw', desc: () => 'Every enemy starts fossilizing (+2) and takes a scratch.', run(x) { x.enemies.forEach(e => { x.dmg(e, 3, { ride: 0.03 }); x.status(e, 'fossil', 2); }); } },
  transfer_sin: { name: 'Transfer Sin', cost: 1, cd: 3, target: 'enemy', tags: ['stand'], fx: 'debuff', desc: () => 'Pass your burdens on: cleanse yourself, the target gains Bleed 3 and Weakened 2.', run(x) { x.cleanse(x.user, 99); x.status(x.target, 'bleed', 3); x.status(x.target, 'weak', 0, 2); } },
});

/* Equipment. slot: weapon | gear | charm. stats add to the wearer, bonus uses the same keys as relics but applies to the wearer only. */
SBR.EQUIPMENT = {
  // ---- weapons
  knife:          { slot: 'weapon', name: 'DIO\'s Throwing Knife', rarity: 'common', stats: { aim: 2, grit: 1 }, bonus: { bleedOnBasic: 0.15 }, recipe: { scrap: 2, leather: 1 }, price: 35, note: 'One of the hundred that hung in stopped time. This one missed.' },
  colt_navy:      { slot: 'weapon', name: 'Colt Navy', rarity: 'common', stats: { aim: 4 }, bonus: { gunDmg: 0.1 }, recipe: { scrap: 3, powder: 2 }, price: 55 },
  steel_sphere:   { slot: 'weapon', name: 'Tempered Steel Ball', rarity: 'uncommon', stats: { spin: 5 }, bonus: { spinDmg: 0.1 }, recipe: { scrap: 2, ballfrag: 2 }, price: 70 },
  cactus_whip:    { slot: 'weapon', name: 'Cactus Whip', rarity: 'common', stats: { ride: 3, aim: 1 }, bonus: { bleedOnBasic: 0.3 }, recipe: { needle: 3, leather: 2 }, price: 45 },
  winchester:     { slot: 'weapon', name: 'Winchester \'73', rarity: 'uncommon', stats: { aim: 7 }, bonus: { crit: 0.05 }, recipe: { scrap: 4, powder: 3, leather: 1 }, price: 90 },
  raptor_knuckles:{ slot: 'weapon', name: 'Raptor Knuckles', rarity: 'uncommon', stats: { aim: 3, ride: 4 }, bonus: { dmg: 0.08 }, recipe: { scale: 3, fang: 2 }, price: 85 },
  hive_pistol:    { slot: 'weapon', name: 'Hive Six-Shooter', rarity: 'remnant', stats: { aim: 6 }, bonus: {}, ability: 'insect_volley', recipe: { scrap: 2, powder: 1 }, remnant: 'rem_robinson' },
  lodestone:      { slot: 'weapon', name: 'Boomboom Lodestone', rarity: 'remnant', stats: { grit: 4, aim: 3 }, bonus: {}, ability: 'iron_sand', recipe: { scrap: 3 }, remnant: 'rem_boom' },
  rhythm_pins:    { slot: 'weapon', name: 'Rhythm Pins', rarity: 'remnant', stats: { aim: 5 }, bonus: { dmg: 0.05 }, ability: 'plant_pin', recipe: { powder: 3, scrap: 1 }, remnant: 'rem_oyecomova' },
  wired_rod:      { slot: 'weapon', name: 'Wired Fishing Rod', rarity: 'remnant', stats: { aim: 4, ride: 3 }, bonus: {}, ability: 'hook_reel', recipe: { wire: 2, leather: 1 }, remnant: 'rem_porkpie' },
  parasol:        { slot: 'weapon', name: 'Rainbow Parasol', rarity: 'remnant', stats: { aim: 5, res: 3 }, bonus: {}, ability: 'raindrop_blades', recipe: { cloth: 2, rainvial: 1 }, remnant: 'rem_blackmore' },
  sound_spear:    { slot: 'weapon', name: 'Silent Way Spear', rarity: 'remnant', stats: { aim: 6, ride: 5 }, bonus: {}, ability: 'sound_stamp', recipe: { leather: 2, feather: 2 }, remnant: 'rem_sandman' },
  wrecking_core:  { slot: 'weapon', name: 'Wrecking Core', rarity: 'remnant', stats: { spin: 8, grit: 3 }, bonus: { spinDmg: 0.15 }, ability: 'satellites', recipe: { scrap: 3, ballfrag: 2 }, remnant: 'rem_weka' },
  tubular_needle: { slot: 'weapon', name: 'Tubular Needle', rarity: 'remnant', stats: { aim: 7 }, bonus: { crit: 0.05 }, ability: 'balloon_needle', recipe: { wire: 2, silver: 1 }, remnant: 'rem_mikeo' },
  // ---- clothing: hats, coats, boots
  duster:         { slot: 'coat', name: 'Jotaro\'s Gakuran', rarity: 'common', stats: { grit: 2 }, bonus: { maxHp: 8 }, recipe: { cloth: 3, leather: 1 }, price: 40, note: 'A long school coat with a gold chain at the collar.' },
  chaps:          { slot: 'boots', name: 'Leather Chaps', rarity: 'common', stats: { ride: 3 }, bonus: { dodge: 0.04 }, recipe: { leather: 3 }, price: 40 },
  poncho:         { slot: 'coat', name: 'Wool Poncho', rarity: 'common', stats: { res: 3 }, bonus: { maxHp: 6 }, recipe: { cloth: 2, pelt: 1 }, price: 40 },
  pelt_coat:      { slot: 'coat', name: 'Coyote Pelt Coat', rarity: 'uncommon', stats: { grit: 4 }, bonus: { maxHp: 12 }, recipe: { pelt: 3, leather: 2 }, price: 70 },
  scale_vest:     { slot: 'coat', name: 'Dino-Scale Vest', rarity: 'uncommon', stats: { grit: 5 }, bonus: { block: 0.08 }, recipe: { scale: 4, leather: 2 }, price: 85 },
  silks:          { slot: 'coat', name: 'Racing Silks', rarity: 'uncommon', stats: { ride: 5 }, bonus: { init: 3, dodge: 0.06 }, recipe: { cloth: 3, horsehair: 2, silver: 1 }, price: 90 },
  plated_vest:    { slot: 'coat', name: 'Iron-Plated Vest', rarity: 'uncommon', stats: { grit: 6 }, bonus: { block: 0.1, dodge: -0.03 }, recipe: { scrap: 5, leather: 2 }, price: 90 },
  wolf_cloak:     { slot: 'coat', name: 'Wolf Fur Cloak', rarity: 'rare', stats: { grit: 6, res: 2 }, bonus: { maxHp: 18 }, recipe: { wolfpelt: 3, cloth: 2 }, price: 120 },
  bear_mantle:    { slot: 'coat', name: 'Grizzly Mantle', rarity: 'rare', stats: { grit: 8 }, bonus: { block: 0.1, maxHp: 10 }, recipe: { claw: 2, wolfpelt: 2, leather: 1 }, price: 130 },
  century_plate:  { slot: 'coat', name: '20th Century Plate', rarity: 'remnant', stats: { grit: 7 }, bonus: { block: 0.08 }, ability: 'kneel', recipe: { scrap: 4 }, remnant: 'rem_magent' },
  // ---- charms
  silver_dollar:  { slot: 'charm', family: 'coin', name: 'D\'Arby\'s Poker Chip', rarity: 'common', stats: { luck: 4 }, bonus: {}, recipe: { silver: 2 }, price: 45, note: 'Somebody bet their soul on this one. Somebody lost.' },
  eagle_feather:  { slot: 'charm', family: 'totem', name: 'Eagle Feather', rarity: 'common', stats: { ride: 3 }, bonus: { dodge: 0.05 }, recipe: { feather: 2, horsehair: 1 }, price: 50 },
  sage_bundle:    { slot: 'charm', family: 'totem', name: 'Sage Bundle', rarity: 'common', stats: { res: 4 }, bonus: { regen: 1 }, recipe: { herb: 3 }, price: 45 },
  telegraph_coil: { slot: 'charm', family: 'device', name: 'Kira\'s Skull Tie', rarity: 'uncommon', stats: { res: 2 }, bonus: { energyStart: 1 }, recipe: { wire: 3, scrap: 1 }, price: 80, note: 'Yoshikage Kira only wants a quiet life. He is always ready anyway.' },
  gold_ring:      { slot: 'charm', family: 'coin', name: 'Polnareff\'s Earrings', rarity: 'rare', stats: { luck: 3 }, bonus: { crit: 0.06, critDmg: 0.1 }, recipe: { gold: 2 }, price: 110, note: 'He never takes them off, not even for a duel.' },
  sap_amulet:     { slot: 'charm', family: 'holy', name: 'Golden Sap Amulet', rarity: 'rare', stats: { spin: 2, aim: 2, grit: 2, ride: 2, res: 2, luck: 2 }, bonus: {}, recipe: { sap: 2, gold: 1 }, price: 140 },
  menger_cube:    { slot: 'charm', family: 'device', name: 'Menger Cube', rarity: 'rare', stats: {}, bonus: { dmg: 0.12 }, recipe: { menger: 3, silver: 1 }, price: 130 },
  medal:          { slot: 'charm', family: 'trophy', name: 'Prussian Medal', rarity: 'remnant', stats: { grit: 4 }, bonus: { block: 0.06 }, recipe: { cloth: 1 }, remnant: 'rem_stroheim' },
  dio_tooth:      { slot: 'charm', family: 'trophy', name: 'Tooth of Dio', rarity: 'remnant', stats: { ride: 6 }, bonus: { dodge: 0.08, init: 2 }, recipe: { leather: 1, fang: 1 }, remnant: 'rem_diego' },
  fossil_charm:   { slot: 'charm', family: 'totem', name: 'Primal Fossil', rarity: 'remnant', stats: { ride: 3 }, bonus: { immune: ['fossil', 'raptor'] }, ability: 'primal_surge', recipe: { fossil: 2 }, remnant: 'rem_ferdinand' },
  flesh_charm:    { slot: 'charm', family: 'holy', name: 'Cream Starter Flesh', rarity: 'remnant', stats: { res: 5 }, bonus: { heal: 0.2, regen: 2 }, recipe: { herb: 2 }, remnant: 'rem_hotpants' },
  mandom_watch:   { slot: 'charm', family: 'device', name: 'Mandom Watch', rarity: 'remnant', stats: { aim: 3 }, bonus: { selfRewind: 1 }, recipe: { silver: 1, scrap: 1 }, remnant: 'rem_ringo', note: 'Once per battle, when the wearer falls, time rewinds: back at 40% HP.' },
  guilt_rosary:   { slot: 'charm', family: 'holy', name: 'Civil War Rosary', rarity: 'remnant', stats: { res: 4 }, bonus: { immune: ['guilt'] }, ability: 'transfer_sin', recipe: { silver: 1 }, remnant: 'rem_axl' },
  disco_tile:     { slot: 'charm', family: 'trophy', name: 'Disco Tile', rarity: 'remnant', stats: { aim: 4 }, bonus: { crit: 0.05 }, ability: 'grid_teleport', recipe: { scrap: 2 }, remnant: 'rem_disco' },
  napkin:         { slot: 'charm', family: 'trophy', name: 'The First Napkin', rarity: 'remnant', stats: { grit: 3, luck: 3 }, bonus: { dmg: 0.15, dodge: 0.08 }, ability: 'first_napkin', recipe: { cloth: 2, gold: 1 }, remnant: 'rem_valentine' },
  // new clothing (resistances live here)
  straw_hat:      { slot: 'hat', name: 'Zeppeli\'s Top Hat', rarity: 'common', stats: { res: 2 }, bonus: { dodge: 0.03, res: { cold: 0.1, holy: -0.1 } }, recipe: { cloth: 2, herb: 1 }, price: 35, note: 'Will A. Zeppeli\'s hat. Sunlight suits it.' },
  fur_cap:        { slot: 'hat', name: 'Trapper\'s Fur Cap', rarity: 'uncommon', stats: { grit: 2 }, bonus: { maxHp: 4, res: { cold: -0.25 } }, recipe: { pelt: 2, leather: 1 }, price: 60 },
  sheriff_hat:    { slot: 'hat', name: 'Mista\'s Hat', rarity: 'uncommon', stats: { aim: 3 }, bonus: { res: { bullet: -0.12 } }, recipe: { leather: 2, cloth: 1, silver: 1 }, price: 70, note: 'He keeps his spare bullets in it. Not four of them.' },
  jockey_cap:     { slot: 'hat', name: 'Jockey\'s Helmet', rarity: 'uncommon', stats: { ride: 3 }, bonus: { init: 2, res: { phys: -0.1 } }, recipe: { leather: 2, horsehair: 2 }, price: 65 },
  starred_cap:    { slot: 'hat', name: 'Starred Beanie', rarity: 'rare', stats: { luck: 3, aim: 2 }, bonus: { crit: 0.05, res: { stand: -0.1 } }, recipe: { cloth: 2, gold: 1 }, price: 110, note: 'Knitted with five-pointed stars. Someone else wears one just like it.' },
  nun_veil:       { slot: 'hat', name: 'Lisa Lisa\'s Scarf', rarity: 'rare', stats: { res: 4 }, bonus: { heal: 0.1, res: { holy: -0.2, stand: -0.1 } }, recipe: { cloth: 3, silver: 1 }, price: 115, note: 'Satiporoja silk carries Hamon without losing a drop.' },
  riding_boots:   { slot: 'boots', name: 'Riding Boots', rarity: 'common', stats: { ride: 2 }, bonus: { dodge: 0.03 }, recipe: { leather: 3 }, price: 35 },
  snowshoes:      { slot: 'boots', name: 'White Album Skates', rarity: 'uncommon', stats: { grit: 2 }, bonus: { dodge: 0.03, res: { cold: -0.2 } }, recipe: { wolfpelt: 1, leather: 2 }, price: 60, note: 'Ghiaccio skated on his own frost. These still leave ice behind.' },
  moccasins:      { slot: 'boots', name: 'Runner\'s Moccasins', rarity: 'uncommon', stats: { ride: 5 }, bonus: { dodge: 0.06, res: { sound: -0.2 } }, recipe: { leather: 2, feather: 1 }, price: 75, note: 'Sandman\'s people run in these. Silent on stone.' },
  cavalry_boots:  { slot: 'boots', name: 'Cavalry Boots', rarity: 'rare', stats: { aim: 3, ride: 3 }, bonus: { bulletDmg: 0.08, res: { phys: -0.05 } }, recipe: { leather: 3, scrap: 2, silver: 1 }, price: 105 },
  irontoe_boots:  { slot: 'boots', name: 'Stroheim\'s Cyborg Legs', rarity: 'rare', stats: { grit: 5 }, bonus: { block: 0.06, res: { phys: -0.1, bleed: -0.1 } }, recipe: { scrap: 4, leather: 2 }, price: 100, note: 'German science is the greatest in the world!' },
  oilskin:        { slot: 'coat', name: 'Oilskin Slicker', rarity: 'uncommon', stats: { grit: 3 }, bonus: { immune: ['soaked'], res: { cold: -0.15 } }, recipe: { cloth: 2, leather: 2 }, price: 75, note: 'Blackmore\'s rain slides right off.' },
  buffalo_coat:   { slot: 'coat', name: 'Buffalo Hide Coat', rarity: 'rare', stats: { grit: 5 }, bonus: { maxHp: 10, res: { cold: -0.25, bleed: -0.1 } }, recipe: { wolfpelt: 2, claw: 1, leather: 2 }, price: 125 },
  cassock:        { slot: 'coat', name: 'Pucci\'s Vestments', rarity: 'rare', stats: { res: 5 }, bonus: { regen: 1, res: { holy: -0.2, stand: -0.15 } }, recipe: { cloth: 4, gold: 1 }, price: 130, note: 'A prison chaplain\'s robes. He prays for a friend, and for Heaven.' },
  // new charms
  powder_horn:    { slot: 'charm', family: 'ammo', name: 'Mista\'s Bullet Pouch', rarity: 'common', stats: { aim: 2 }, bonus: { bulletDmg: 0.08 }, recipe: { powder: 2, fang: 1 }, price: 45, note: 'Loose rounds, counted twice. Never four.' },
  silver_rounds:  { slot: 'charm', family: 'ammo', name: 'Sex Pistols Rounds', rarity: 'rare', stats: { aim: 2 }, bonus: { bulletDmg: 0.15, crit: 0.03 }, recipe: { silver: 2, powder: 2 }, price: 120, note: 'Six little gunmen ride the bullets and kick them onto target. Feed them.' },
  rattle_totem:   { slot: 'charm', family: 'totem', name: 'Echoes Egg', rarity: 'uncommon', stats: { ride: 2, res: 2 }, bonus: { res: { sound: -0.2, bleed: -0.1 } }, recipe: { venom: 1, feather: 1, herb: 1 }, price: 70, note: 'Koichi\'s Stand before it hatched. It hums back at any noise.' },
  saint_bandage:  { slot: 'charm', family: 'holy', name: 'Linen of the Saint', rarity: 'rare', stats: { res: 3 }, bonus: { res: { holy: -0.25, stand: -0.1 }, heal: 0.1 }, recipe: { cloth: 2, sap: 1 }, price: 130, note: 'A strip of burial cloth. It is warm.' },
};


/* Relics no longer exist as a category: each old relic becomes equipment, and the Saint's Corpse parts become holy materials. */
(() => {
  const SLOT = { colt: 'weapon', spareballs: 'weapon', cavalry: 'weapon', hat: 'hat', badge: 'hat', stirrups: 'boots', spurs: 'boots', bandolier: 'coat' };
  Object.entries(SBR.RELICS).forEach(([id, R]) => {
    if (R.corpse) {
      SBR.MATERIALS[id] = { name: R.name, rarity: 'holy', holy: true, bonus: R.bonus, desc: R.desc + ' Blesses the whole party while you carry it.' };
    } else {
      SBR.EQUIPMENT[id] = { slot: SLOT[id] || 'charm', name: R.name, rarity: R.rarity === 'rare' ? 'rare' : R.rarity === 'starter' ? 'uncommon' : 'common', stats: {}, bonus: R.bonus || {}, price: R.price || 60, starter: !!R.starter, onGain: R.onGain, descText: R.desc, fromRelic: true };
    }
  });
})();
/* Bonus keys that apply to the whole run/party when the item is equipped by anyone */
SBR.RUN_KEYS = ['pace', 'money', 'belt', 'cards', 'scavenge', 'discount', 'xp', 'postHeal', 'restHeal', 'paceStage', 'stitch', 'rotationStart', 'guardStart', 'shieldStart', 'palm', 'fossilImmune', 'firstCrit'];

/* Consumable recipes */
SBR.ITEM_RECIPES = {
  canteen: { herb: 1, leather: 1 },
  jerky: { pelt: 1, herb: 1 },
  bandage: { cloth: 2 },
  coffee: { herb: 2 },
  dynamite: { powder: 2, wire: 1 },
  salts: { venom: 1, herb: 2 },
  whiskey: { sap: 1 },
  snakeoil: { venom: 2 },
  spareball: { scrap: 2, ballfrag: 1 },
  sugarcube: { sap: 1, herb: 1 },
};

/* Drop tables: [material, chance, min, max] */
SBR.DROPS = {
  bandit: [['scrap', 0.5, 1, 2], ['powder', 0.4, 1, 1], ['cloth', 0.3, 1, 1]],
  rattlesnake: [['venom', 0.6, 1, 1], ['leather', 0.3, 1, 1]],
  coyote: [['pelt', 0.7, 1, 1], ['fang', 0.1, 1, 1]],
  rival_racer: [['horsehair', 0.6, 1, 2], ['leather', 0.4, 1, 1], ['scrap', 0.3, 1, 1]],
  cactus: [['needle', 0.9, 1, 3]],
  robinson: [['needle', 1, 2, 3], ['venom', 0.5, 1, 1]],
  benjamin: [['scrap', 1, 2, 4], ['wire', 0.5, 1, 2]], andre: [['scrap', 1, 1, 3]], laboom: [['scrap', 1, 1, 2], ['powder', 0.6, 1, 2]],
  cougar: [['fang', 0.6, 1, 1], ['pelt', 0.5, 1, 1]],
  agent: [['cloth', 0.5, 1, 1], ['silver', 0.25, 1, 1], ['powder', 0.4, 1, 1], ['wire', 0.3, 1, 1]],
  raptor: [['scale', 0.6, 1, 2], ['fossil', 0.25, 1, 1]],
  stroheim: [['scrap', 1, 2, 3], ['powder', 1, 1, 2]],
  porkpie: [['wire', 1, 2, 3], ['feather', 0.5, 1, 1]],
  oyecomova: [['powder', 1, 2, 4], ['silver', 0.4, 1, 1]],
  diego_rival: [['scale', 1, 2, 3], ['horsehair', 1, 1, 2], ['fossil', 0.6, 1, 1]],
  ferdinand: [['fossil', 1, 2, 3], ['scale', 1, 2, 3], ['feather', 0.6, 1, 1]],
  outlaw: [['scrap', 0.4, 1, 2], ['powder', 0.5, 1, 2], ['silver', 0.2, 1, 1]],
  soldier: [['cloth', 0.5, 1, 1], ['scrap', 0.4, 1, 2], ['wire', 0.3, 1, 1]],
  grizzly: [['claw', 0.7, 1, 2], ['pelt', 0.5, 1, 1]],
  crow: [['feather', 0.6, 1, 1]],
  hotpants_foe: [['herb', 1, 2, 3], ['cloth', 0.5, 1, 1]],
  ringo: [['silver', 1, 1, 2], ['powder', 1, 2, 3]],
  blackmore: [['rainvial', 1, 1, 2], ['cloth', 0.5, 1, 1]],
  sandman: [['feather', 1, 2, 3], ['leather', 1, 1, 2]],
  tattoo: [['cloth', 0.4, 1, 1], ['scrap', 0.4, 1, 1], ['wolfpelt', 0.1, 1, 1]],
  wolf: [['wolfpelt', 0.7, 1, 1], ['fang', 0.2, 1, 1]],
  casino_thug: [['silver', 0.4, 1, 1], ['gold', 0.1, 1, 1], ['cloth', 0.3, 1, 1]],
  magent: [['scrap', 1, 2, 3], ['wire', 0.6, 1, 2]],
  wekapipo_foe: [['ballfrag', 1, 2, 3], ['wolfpelt', 0.6, 1, 1]],
  ghost: [['menger', 0.08, 1, 1]],
  axl: [['silver', 1, 1, 2], ['gold', 0.5, 1, 1]],
  vguard: [['scrap', 0.4, 1, 2], ['silver', 0.3, 1, 1], ['gold', 0.08, 1, 1]],
  parallel: [['menger', 0.5, 1, 1]],
  disco: [['wire', 1, 1, 2], ['menger', 0.5, 1, 1]],
  balloon: [['cloth', 0.3, 1, 1]],
  mikeo: [['silver', 1, 1, 2], ['wire', 0.5, 1, 1]],
  valentine1: [['menger', 1, 2, 3], ['gold', 1, 1, 2]],
  lovetrain: [['gold', 1, 2, 3], ['sap', 1, 1, 1]],
  nypd: [['scrap', 0.5, 1, 2], ['cloth', 0.3, 1, 1]],
  worldraptor: [['scale', 0.6, 1, 2], ['gold', 0.15, 1, 1]],
  diego_world: [['gold', 1, 2, 3]],
};
SBR.REMNANT_DROPS = {
  robinson: 'rem_robinson', benjamin: 'rem_boom', stroheim: 'rem_stroheim', oyecomova: 'rem_oyecomova', porkpie: 'rem_porkpie',
  diego_rival: 'rem_diego', ferdinand: 'rem_ferdinand', hotpants_foe: 'rem_hotpants', ringo: 'rem_ringo', blackmore: 'rem_blackmore',
  sandman: 'rem_sandman', magent: 'rem_magent', wekapipo_foe: 'rem_weka', axl: 'rem_axl', disco: 'rem_disco', mikeo: 'rem_mikeo', valentine1: 'rem_valentine',
};
/* Scavenging finds act-appropriate materials */
SBR.SCAVENGE_MATS = {
  1: ['scrap', 'leather', 'cloth', 'powder', 'needle', 'herb', 'horsehair'],
  2: ['scrap', 'leather', 'feather', 'herb', 'ballfrag', 'wire', 'fang'],
  3: ['cloth', 'powder', 'herb', 'wire', 'silver', 'horsehair', 'claw'],
  4: ['wolfpelt', 'silver', 'gold', 'sap', 'herb', 'cloth'],
  5: ['silver', 'gold', 'wire', 'menger', 'scrap'],
  6: ['gold', 'menger', 'silver', 'sap'],
};

/* Aggregate one member's equipment into {stats, bonus, abilities} */
/* Six slots per rider. Two charms of the same family don't stack: only the rarer one counts. */
SBR.SLOTS = [
  { key: 'weapon', type: 'weapon', label: 'Weapon' },
  { key: 'hat', type: 'hat', label: 'Hat' },
  { key: 'coat', type: 'coat', label: 'Coat' },
  { key: 'boots', type: 'boots', label: 'Boots' },
  { key: 'charm1', type: 'charm', label: 'Charm' },
  { key: 'charm2', type: 'charm', label: 'Charm' },
];
SBR.emptyEquip = () => ({ weapon: null, hat: null, coat: null, boots: null, charm1: null, charm2: null });
SBR.slotType = key => (SBR.SLOTS.find(s => s.key === key) || {}).type;
SBR.RARITY_RANK = { common: 0, uncommon: 1, rare: 2, remnant: 3 };
SBR.FAMILY = { coin: 'Coin', totem: 'Totem', device: 'Device', holy: 'Holy', trophy: 'Trophy', ammo: 'Ammo' };
/** charm slots switched off because a stronger charm of the same family is worn */
SBR.suppressedCharms = m => {
  const a = m.equip && m.equip.charm1, b = m.equip && m.equip.charm2;
  const A = a && SBR.EQUIPMENT[a], B = b && SBR.EQUIPMENT[b];
  if (!A || !B || !A.family || A.family !== B.family) return [];
  return [(SBR.RARITY_RANK[B.rarity] || 0) > (SBR.RARITY_RANK[A.rarity] || 0) ? 'charm1' : 'charm2'];
};
/** move old 3-slot saves (weapon/gear/charm) onto the six slots */
SBR.migrateEquip = m => {
  const e = m.equip || {};
  if ('hat' in e && 'charm1' in e) return;
  const n = SBR.emptyEquip();
  n.weapon = e.weapon || null;
  if (e.gear) { const t = (SBR.EQUIPMENT[e.gear] || {}).slot; n[t && t in n ? t : 'coat'] = e.gear; }
  if (e.charm) n.charm1 = e.charm;
  m.equip = n;
};
SBR.equipBonus = m => {
  const out = { stats: {}, bonus: {}, abilities: [] };
  const off = SBR.suppressedCharms(m);
  Object.entries(m.equip || {}).forEach(([slot, id]) => {
    const e = id && SBR.EQUIPMENT[id];
    if (!e || off.includes(slot)) return;
    for (const [k, v] of Object.entries(e.stats || {})) out.stats[k] = (out.stats[k] || 0) + v;
    for (const [k, v] of Object.entries(e.bonus || {})) {
      if (Array.isArray(v)) out.bonus[k] = (out.bonus[k] || []).concat(v);
      else if (v && typeof v === 'object') { const o = out.bonus[k] = out.bonus[k] || {}; for (const t in v) o[t] = (o[t] || 0) + v[t]; }
      else out.bonus[k] = (out.bonus[k] || 0) + v;
    }
    if (e.ability) out.abilities.push(e.ability);
  });
  const P = SBR.pathOf && SBR.pathOf(m);
  if (P) {
    for (const [k, v] of Object.entries(P.stats || {})) out.stats[k] = (out.stats[k] || 0) + v;
    for (const [k, v] of Object.entries(P.bonus || {})) if (k !== 'maxHp') out.bonus[k] = (out.bonus[k] || 0) + v;
  }
  return out;
};
SBR.equipDesc = id => {
  const e = SBR.EQUIPMENT[id];
  if (e.descText) return e.descText + (e.ability ? ` · Grants <b>${SBR.ABILITIES[e.ability].name}</b>` : '');
  const parts = Object.entries(e.stats || {}).map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${SBR.STATS[k].short}`);
  const B = { crit: 'crit', critDmg: 'crit dmg', dodge: 'dodge', block: 'block', dmg: 'damage', spinDmg: 'Spin dmg', gunDmg: 'Gunshot dmg', bulletDmg: 'Gunshot dmg', standDmg: 'Stand dmg', coldDmg: 'Cold dmg', holyDmg: 'Holy dmg', bleedDmg: 'Bleed dmg', physDmg: 'Physical dmg', soundDmg: 'Sound dmg', heal: 'healing', bleedOnBasic: 'basic-attack Bleed' };
  for (const [k, v] of Object.entries(e.bonus || {})) {
    if (B[k]) parts.push(`${v > 0 ? '+' : ''}${Math.round(v * 100)}% ${B[k]}`);
    else if (k === 'maxHp') parts.push(`+${v} max HP`);
    else if (k === 'regen') parts.push(`regen ${v}/turn`);
    else if (k === 'init') parts.push(`+${v} initiative`);
    else if (k === 'energyStart') parts.push(`+${v} starting Energy`);
    else if (k === 'immune') parts.push(`immune: ${v.map(s => SBR.STATUS[s].name).join(', ')}`);
    else if (k === 'res') parts.push(Object.entries(v).map(([t, n]) => `<b style="color:${SBR.DMG[t].color}">${n < 0 ? '' : '+'}${Math.round(n * 100)}% ${SBR.DMG[t].name}</b> taken`).join(', '));
  }
  if (e.family) parts.push(`<i>${SBR.FAMILY[e.family]} charm: doesn't stack with another ${SBR.FAMILY[e.family]}</i>`);
  if (e.note) parts.push(e.note);
  if (e.ability) parts.push(`Grants <b>${SBR.ABILITIES[e.ability].name}</b>`);
  return parts.join(' · ');
};
