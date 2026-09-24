/* Enemies, bosses and their Stand mechanics */
'use strict';

// Extra Johnny abilities before Tusk awakens
SBR.ABILITIES.johnny_revolver = { name: 'Revolver', cost: 0, cd: 0, target: 'enemy', tags: ['gun'], fx: 'gun',
  desc: () => 'A borrowed six-shooter. Johnny can\'t walk, but he can aim.', run(x) { x.dmg(x.target, 4, { aim: 0.045 }); } };
SBR.ABILITIES.jockey_feint = { name: 'Jockey\'s Feint', cost: 1, cd: 2, target: 'self', tags: [], fx: 'buff',
  desc: l => `Slow Dancer sidesteps. Gain Evasive 2 and Empowered ${l > 1 ? 2 : 1}.`,
  run(x) { x.status(x.user, 'evasive', 0, 2); x.status(x.user, 'empower', 0, x.lvl > 1 ? 2 : 1); } };
SBR.CHARS.johnny.abilities = [{ id: 'johnny_revolver', notFlag: 'tusk1' }, { id: 'nail_shot', flag: 'tusk1' }, { id: 'jockey_feint' },
  { id: 'nail_bullet', flag: 'tusk1' }, { id: 'spinning_hole', flag: 'tusk2' }, { id: 'wormhole', flag: 'tusk3' }, { id: 'infinite_rotation', flag: 'tusk4' }];

const port = key => ({ kind: 'portrait', key });
const beast = (type, color, bg) => ({ kind: 'creature', type, color, bg });

SBR.ENEMIES = {
  /* ===== ACT I — The West ===== */
  bandit: { name: 'Desert Bandit', art: port('bandit'), hp: 18, stats: { aim: 3, ride: 3 }, xp: 6, money: [6, 14],
    abilities: [
      { name: 'Six-Shooter', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 4, { aim: 0.04 }) },
      { name: 'Sand in the Eyes', w: 1, cd: 3, target: 'enemy', fx: 'spray', run: x => x.status(x.target, 'blind', 0, 1) },
    ] },
  rattlesnake: { name: 'Rattlesnake', art: beast('snake', '#b8a060', ['#e8b36a', '#c8323c']), hp: 10, stats: { ride: 6 }, xp: 4, money: [0, 3],
    abilities: [{ name: 'Venom Bite', w: 1, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 3, {}); if (r.hit) x.status(x.target, 'bleed', 2); } }] },
  coyote: { name: 'Coyote', art: beast('coyote', '#b8905a', ['#e8742a', '#f6c27a']), hp: 12, stats: { ride: 5 }, xp: 4, money: [0, 2],
    abilities: [
      { name: 'Pack Bite', w: 3, target: 'enemy', fx: 'claw', run: x => x.dmg(x.target, 3, {}) },
      { name: 'Howl', w: 1, cd: 3, target: 'allAllies', fx: 'buff', run: x => x.allies.forEach(a => x.status(a, 'empower', 0, 2)) },
    ] },
  rival_racer: { name: 'Cutthroat Racer', art: port('gunslinger'), hp: 22, stats: { aim: 4, ride: 5 }, xp: 7, money: [10, 20],
    abilities: [
      { name: 'Riding Crop', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 4, { ride: 0.03 }) },
      { name: 'Ride Them Down', w: 1, cd: 2, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 7, { ride: 0.04 }) },
    ] },
  cactus: { name: 'Exploding Cactus', art: beast('cactus', '#4a8a3a', ['#e8b36a', '#e8508a']), hp: 6, stats: {}, xp: 1, money: [0, 0],
    abilities: [{ name: 'Burst!', w: 1, target: 'allEnemies', fx: 'boom', run: x => { x.enemies.forEach(e => x.dmg(e, 5, {}, { noCrit: true })); x.kill(x.user); } }] },
  robinson: { name: 'Mrs. Robinson', title: 'Racer from Mexico', art: port('robinson'), tier: 'elite', hp: 58, stats: { aim: 5, ride: 4 }, xp: 22, money: [30, 45],
    stand: 'Insect Swarm', sigil: 'claw', sigilColor: '#a0c040', quote: 'The desert is my garden. Every cactus answers to me.',
    abilities: [
      { name: 'Insect Swarm', w: 2, cd: 2, target: 'enemy', fx: 'spray', run: x => { x.dmg(x.target, 3, {}); x.status(x.target, 'blind', 0, 2); x.status(x.target, 'bleed', 2); } },
      { name: 'Plant Cactus', w: 2, cd: 3, target: 'self', fx: 'buff', cond: x => x.allies.length < 3, run: x => x.summon('cactus') },
      { name: 'Needle Rain', w: 2, cd: 3, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => { x.dmg(e, 2, {}); x.status(e, 'bleed', 2); }) },
      { name: 'Revolver', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 5, { aim: 0.04 }) },
    ] },
  benjamin: { name: 'Benjamin Boomboom', title: 'Head of the Boomboom Family', art: port('benjamin'), tier: 'boss', hp: 48, stats: { aim: 3, grit: 4 }, xp: 20, money: [25, 35],
    stand: 'Tomb of the Boom 1', sigil: 'magnet', sigilColor: '#9aa8c8',
    abilities: [
      { name: 'Magnetize', w: 2, cd: 3, target: 'allEnemies', fx: 'debuff', run: x => x.enemies.forEach(e => x.status(e, 'magnet', 0, 3)) },
      { name: 'Magnetic Crush', w: 4, cd: 2, target: 'allEnemies', fx: 'magnet', cond: x => x.count('magnet') >= 2, run: x => { const n = x.count('magnet'); x.enemies.filter(e => x.has(e, 'magnet')).forEach(e => x.dmg(e, 3 * n, {}, { noDodge: true, noShare: true, label: 'CRUSH' })); x.log('Everyone magnetized is slammed together!'); } },
      { name: 'Iron Sand Clamp', w: 2, cd: 2, target: 'enemy', fx: 'hit', run: x => { const r = x.dmg(x.target, 5, { grit: 0.03 }); if (r.hit && x.roll(0.5)) x.status(x.target, 'stun', 0, 1); } },
      { name: 'Scrap Knife', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 5, {}) },
    ],
    hooks: { death: x => { x.allies.forEach(a => { x.status(a, 'empower', 0, 3); }); x.say(x.allies[0], 'PAPA! You\'ll pay for that!'); } } },
  andre: { name: 'Andre Boomboom', art: port('andre'), tier: 'boss', hp: 40, stats: { aim: 4 }, xp: 16, money: [15, 25], stand: 'Tomb of the Boom 2',
    abilities: [
      { name: 'Magnetic Pull', w: 2, cd: 2, target: 'enemy', fx: 'hit', run: x => { x.dmg(x.target, 6, { aim: 0.03 }); x.status(x.target, 'vuln', 0, 2); } },
      { name: 'Iron Filings', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 4, {}) },
    ] },
  laboom: { name: 'L.A. Boomboom', art: port('laboomboom'), tier: 'boss', hp: 34, stats: { aim: 4, ride: 4 }, xp: 14, money: [10, 20], stand: 'Tomb of the Boom 3',
    abilities: [
      { name: 'Scrap Barrage', w: 2, cd: 2, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => x.dmg(e, 3, {})) },
      { name: 'Railroad Spike', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 5, { aim: 0.03 }) },
    ] },

  /* ===== ACT II — Monument Valley & the Rockies ===== */
  cougar: { name: 'Mountain Cougar', art: beast('cougar', '#c8905a', ['#6a4ac0', '#e0782e']), hp: 24, stats: { ride: 6 }, xp: 8, money: [0, 4],
    abilities: [
      { name: 'Pounce', w: 2, target: 'enemy', fx: 'claw', run: x => x.dmg(x.target, 6, { ride: 0.03 }) },
      { name: 'Maul', w: 2, cd: 2, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 4, {}); if (r.hit) x.status(x.target, 'bleed', 3); } },
    ] },
  agent: { name: 'Valentine\'s Agent', art: port('agent'), hp: 28, stats: { aim: 5 }, xp: 9, money: [12, 22],
    abilities: [
      { name: 'Derringer', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 5, { aim: 0.04 }) },
      { name: 'Smoke Flare', w: 1, cd: 3, target: 'allAllies', fx: 'buff', run: x => x.allies.forEach(a => x.status(a, 'evasive', 0, 2)) },
    ] },
  raptor: { name: 'Dinosaurified Villager', art: beast('raptor', '#6aa04a', ['#2a5a3a', '#c8e04a']), hp: 20, stats: { ride: 7 }, xp: 7, money: [0, 5],
    abilities: [
      { name: 'Raptor Bite', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 5, { ride: 0.02 }); if (r.hit) x.status(x.target, 'fossil', 1); } },
      { name: 'Tail Lash', w: 1, cd: 2, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => x.dmg(e, 2, {})) },
    ] },
  stroheim: { name: 'Fritz von Stroheim', title: 'Oddly Familiar Soldier', art: port('stroheim'), tier: 'elite', hp: 50, stats: { aim: 5, grit: 5 }, xp: 18, money: [25, 40],
    quote: 'German marksmanship is the finest in the world!', sigil: 'cross', sigilColor: '#c0a040',
    abilities: [
      { name: 'Rifle Volley', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 6, { aim: 0.04 }) },
      { name: 'National Pride', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'empower', 0, 2); x.say(x.user, 'The pinnacle of humanity!'); } },
    ] },
  porkpie: { name: 'Pork Pie Hat Kid', title: 'Valentine\'s Hunter', art: port('porkpie'), tier: 'elite', hp: 60, stats: { aim: 5, ride: 5 }, xp: 24, money: [30, 45],
    stand: 'Wired', sigil: 'hook', sigilColor: '#c8c8d8', quote: 'Hooks in the rock, hooks in your mouth. Reel, reel, reel!',
    passive: 'Hides in the rocks: Evasive unless Scanned.',
    abilities: [
      { name: 'Wired Hook', w: 2, cd: 2, target: 'enemy', fx: 'rope', run: x => { const r = x.dmg(x.target, 4, {}); if (r.hit) { x.status(x.target, 'stun', 0, 1); x.status(x.target, 'bleed', 2); x.status(x.target, 'hooked', 0, 2); } } },
      { name: 'Reel In', w: 3, target: 'enemy', fx: 'hit', run: x => { const bonus = x.has(x.target, 'stun') || x.has(x.target, 'hooked') ? 7 : 0; x.dmg(x.target, 5 + bonus, { aim: 0.03 }); } },
      { name: 'Hooks in the Rock', w: 2, cd: 4, target: 'allEnemies', fx: 'rope', run: x => x.enemies.forEach(e => { x.status(e, 'hooked', 0, 2); x.dmg(e, 2, {}); }) },
    ],
    hooks: { turnStart: x => { if (!x.has(x.user, 'marked') && !x.has(x.user, 'evasive')) x.status(x.user, 'evasive', 0, 1); } } },
  oyecomova: { name: 'Oyecomova', title: 'The Terrorist from Naples', art: port('oyecomova'), tier: 'elite', hp: 64, stats: { aim: 5, grit: 3 }, xp: 26, money: [30, 50],
    stand: 'Boku no Rhythm wo Kiitekure', sigil: 'bomb', sigilColor: '#f2c14e', quote: 'Naples will hear this. Can you hear my rhythm?',
    passive: 'Presses bomb pins into targets. Brace to pull a pin before it detonates.',
    abilities: [
      { name: 'Press Pin', w: 3, cd: 1, target: 'enemy', fx: 'debuff', cond: x => x.enemies.some(e => !x.has(e, 'primed')), run: x => { const t = x.enemies.find(e => !x.has(e, 'primed')) || x.target; x.status(t, 'primed', 0, 3); } },
      { name: 'Trap Detonation', w: 1, cd: 4, target: 'allEnemies', fx: 'boom', run: x => x.enemies.forEach(e => x.dmg(e, 4, {}, { noCrit: true })) },
      { name: 'Pin the Whole Village', w: 2, cd: 5, target: 'allEnemies', fx: 'pin', run: x => { x.enemies.forEach(e => x.status(e, 'primed', 0, 4)); x.say(x.user, 'Every doorknob. Every stone. Listen...'); } },
      { name: 'Pistol', w: 2, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 5, { aim: 0.04 }) },
    ] },
  diego_rival: { name: 'Diego Brando', title: 'Rival — Scary Monsters', art: port('diegodino'), tier: 'elite', hp: 78, stats: { aim: 6, ride: 9 }, xp: 32, money: [40, 60],
    stand: 'Scary Monsters', sigil: 'claw', sigilColor: '#8adf6a', quote: 'The best way to win a race is to make sure nobody else finishes it.',
    abilities: [
      { name: 'Raptor Slash', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 6, { aim: 0.03, ride: 0.02 }); if (r.hit) x.status(x.target, 'bleed', 2); } },
      { name: 'Call the Pack', w: 1, cd: 4, target: 'self', fx: 'buff', cond: x => x.allies.length < 3, run: x => x.summon('raptor') },
      { name: 'Kinetic Dodge', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => x.status(x.user, 'evasive', 0, 2) },
      { name: 'Infection', w: 2, cd: 2, target: 'enemy', fx: 'debuff', run: x => x.status(x.target, 'fossil', 2) },
      { name: 'Raptor Pounce', w: 3, cd: 2, target: 'enemy', fx: 'claw', run: x => { const low = x.enemies.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]; const exec = low.hp < low.maxHp * 0.35; x.dmg(low, exec ? 14 : 7, { ride: 0.03 }); if (exec) x.say(x.user, 'The weak fall first. That is nature.'); } },
    ],
    hooks: {
      roundStart: x => { if (!x.has(x.user, 'marked')) x.status(x.user, 'evasive', 0, 1); },
      death: x => { x.achieve('diego'); },
    } },
  ferdinand: { name: 'Dr. Ferdinand', title: 'Paleontologist', art: port('ferdinand'), tier: 'boss', hp: 110, stats: { aim: 5, spin: 3, grit: 5 }, xp: 50, money: [60, 80],
    stand: 'Scary Monsters', sigil: 'claw', sigilColor: '#c8e04a', quote: 'This land belongs to nature. You will be returned to it — as fossils.',
    passive: 'Infects the party with Fossilizing. Summons dinosaurs. The Corpse\'s Left Arm grants immunity.',
    abilities: [
      { name: 'Mass Infection', w: 2, cd: 2, target: 'allEnemies', fx: 'debuff', run: x => x.enemies.forEach(e => x.status(e, 'fossil', 1)) },
      { name: 'Fossil Spike', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 7, { spin: 0.04 }) },
      { name: 'Primal Roar', w: 1, cd: 3, target: 'allAllies', fx: 'buff', run: x => x.allies.forEach(a => x.status(a, 'empower', 0, 2)) },
    ],
    hooks: {
      start: x => { x.summon('raptor'); x.summon('raptor'); },
      roundStart: x => { if (x.round % 3 === 0 && x.allies.length < 4) { x.summon('raptor'); x.log('More dinosaurs burst from the treeline!'); } },
      damaged: x => { if (!x.flag('extinct') && x.user.hp < x.user.maxHp * 0.5) { x.setFlag('extinct'); x.say(x.user, 'EXTINCTION EVENT!'); x.enemies.forEach(e => x.status(e, 'fossil', 2)); x.summon('raptor'); } },
    } },

  /* ===== ACT III — The Midwest ===== */
  outlaw: { name: 'Outlaw Gunslinger', art: port('gunslinger'), hp: 30, stats: { aim: 7, ride: 5 }, xp: 11, money: [15, 28],
    abilities: [
      { name: 'Quickdraw', w: 2, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 7, { aim: 0.04 }) },
      { name: 'Fan the Hammer', w: 2, cd: 2, target: 'enemy', fx: 'gun', run: x => { x.dmg(x.target, 3, {}); x.dmg(x.target, 3, {}); x.dmg(x.target, 3, {}); } },
    ] },
  soldier: { name: 'Government Soldier', art: port('soldier'), hp: 32, stats: { aim: 5, grit: 5 }, xp: 11, money: [12, 22],
    abilities: [
      { name: 'Rifle Volley', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 6, { aim: 0.04 }) },
      { name: 'Bayonet', w: 2, cd: 2, target: 'enemy', fx: 'hit', run: x => { const r = x.dmg(x.target, 5, {}); if (r.hit) x.status(x.target, 'bleed', 2); } },
    ] },
  grizzly: { name: 'Grizzly Bear', art: beast('grizzly', '#6a4a2a', ['#2c4a5a', '#8aaa4a']), hp: 46, stats: { grit: 8 }, xp: 14, money: [0, 5],
    abilities: [
      { name: 'Maul', w: 3, target: 'enemy', fx: 'claw', run: x => x.dmg(x.target, 8, { grit: 0.02 }) },
      { name: 'Roar', w: 1, cd: 3, target: 'allEnemies', fx: 'debuff', run: x => x.enemies.forEach(e => x.status(e, 'fear', 0, 2)) },
    ] },
  crow: { name: 'Storm Crow', art: beast('crow', '#2a2a3a', ['#4a6a6a', '#9fbf9a']), hp: 12, stats: { ride: 8 }, xp: 4, money: [0, 2],
    abilities: [{ name: 'Peck the Eyes', w: 1, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 3, {}); if (r.hit && x.roll(0.4)) x.status(x.target, 'blind', 0, 1); } }] },
  hotpants_foe: { name: 'Hot Pants', title: 'The Mysterious Racer', art: port('hotpants'), tier: 'elite', hp: 70, stats: { aim: 6, res: 6 }, xp: 28, money: [30, 40],
    stand: 'Cream Starter', sigil: 'spiral', sigilColor: '#f09ac0', quote: 'That cow was dinner. Whoever killed it answers to me.',
    abilities: [
      { name: 'Flesh Spray', w: 2, cd: 2, target: 'self', fx: 'heal', cond: x => x.user.hp < x.user.maxHp * 0.7, run: x => x.heal(x.user, 12, {}) },
      { name: 'Smother', w: 2, cd: 2, target: 'enemy', fx: 'spray', run: x => { x.dmg(x.target, 4, {}); x.status(x.target, 'blind', 0, 2); } },
      { name: 'Flesh Disguise', w: 2, cd: 4, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'evasive', 0, 3); x.status(x.user, 'shield', 12); x.say(x.user, 'Which one of us is the real one?'); } },
      { name: 'Revolver', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 6, { aim: 0.04 }) },
    ] },
  ringo: { name: 'Ringo Roadagain', title: 'The Gunslinger in the Cabin', art: port('ringo'), tier: 'boss', hp: 90, stats: { aim: 9, ride: 6 }, xp: 50, money: [50, 70],
    stand: 'Mandom', sigil: 'clock', sigilColor: '#e8c070', quote: 'Welcome... to the \'Man\'s World.\'',
    passive: 'MANDOM: every 3rd round, time rewinds six seconds — everyone\'s HP returns to where it was last round. Strike hard right after the rewind!',
    abilities: [
      { name: 'Quickdraw', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 8, { aim: 0.04 }) },
      { name: 'Cabin Ambush', w: 1, cd: 3, target: 'allEnemies', fx: 'gun', run: x => x.enemies.forEach(e => x.dmg(e, 4, { aim: 0.02 })) },
      { name: 'Duelist\'s Calm', w: 1, cd: 4, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'lucky', 0, 2); x.say(x.user, 'Is your will worthy of the Man\'s World?'); } },
    ],
    hooks: {
      roundStart: x => {
        if (x.round > 1) x.snapshot('mandomPrev');
        if (x.round % 3 === 0 && x.getSnapshot('mandom')) { x.rewind('mandom'); x.status(x.user, 'lucky', 0, 1); x.extraAction(); }
        x.snapshot('mandom');
      },
      death: x => x.achieve('ringo'),
    } },
  blackmore: { name: 'Blackmore', title: 'Valentine\'s Pursuer', art: port('blackmore'), tier: 'boss', hp: 88, stats: { aim: 6, spin: 4 }, xp: 50, money: [50, 70],
    stand: 'Catch the Rainbow', sigil: 'drops', sigilColor: '#9fc7e8', quote: 'Sumimasen... the rain will be your coffin.',
    passive: 'RAIN VEIL: hides inside frozen rain. Only Spin attacks can touch him while it lasts — and they evaporate it.',
    abilities: [
      { name: 'Catch the Rainbow', w: 3, cd: 3, target: 'self', fx: 'buff', cond: x => !x.has(x.user, 'rainveil'), run: x => x.status(x.user, 'rainveil', 0, 2) },
      { name: 'Raindrop Blades', w: 2, cd: 2, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => { x.dmg(e, 4, { aim: 0.02 }); x.status(e, 'soaked', 0, 2); }) },
      { name: 'Rain Stop', w: 3, cd: 5, target: 'allEnemies', fx: 'rain', cond: x => x.count('soaked') >= 2, run: x => { x.enemies.filter(e => x.has(e, 'soaked')).forEach(e => x.status(e, 'stun', 0, 1)); x.say(x.user, 'The rain has stopped... and so have you.'); } },
      { name: 'Frozen Drops', w: 2, target: 'enemy', fx: 'hit', run: x => { const r = x.dmg(x.target, 6, {}); if (r.hit && x.has(x.target, 'soaked') && x.roll(0.4)) x.status(x.target, 'stun', 0, 1); } },
    ],
    hooks: { turnStart: x => { if (x.has(x.user, 'rainveil')) x.heal(x.user, 6, {}); }, death: x => x.achieve('blackmore') } },
  sandman: { name: 'Sandman', title: 'The Runner — Sounman', art: port('sandman'), tier: 'boss', hp: 125, stats: { aim: 7, ride: 10, spin: 4 }, xp: 70, money: [70, 90],
    stand: 'In a Silent Way', sigil: 'sound', sigilColor: '#e8508a', quote: 'I run faster than any horse. I am not racing you. I am hunting you.',
    passive: 'Stamps sound onto the party. Acting while stamped detonates it. Runs faster than a horse below half HP.',
    abilities: [
      { name: 'Sound Stamp', w: 3, cd: 1, target: 'enemy', fx: 'debuff', run: x => { x.dmg(x.target, 4, {}); x.status(x.target, 'sound', 2); } },
      { name: 'DOGOOON!', w: 2, cd: 3, target: 'allEnemies', fx: 'boom', run: x => x.enemies.forEach(e => { x.dmg(e, 4, { spin: 0.02 }); x.status(e, 'sound', 1); }) },
      { name: 'Spear Throw', w: 2, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 9, { aim: 0.04 }) },
      { name: 'Speaking Stones', w: 2, cd: 4, target: 'self', fx: 'sound', cond: x => x.allies.length < 3, run: x => { x.summon('soundstone'); x.say(x.user, 'The stones will speak for me.'); } },
    ],
    hooks: { damaged: x => { if (!x.flag('sandRun') && x.user.hp < x.user.maxHp * 0.5) { x.setFlag('sandRun'); x.status(x.user, 'evasive', 0, 2); x.status(x.user, 'empower', 0, 3); x.say(x.user, 'My feet never tire!'); } } } },

  /* ===== ACT IV — The North ===== */
  tattoo: { name: 'Tattoo You! Soldier', art: port('tattoo'), hp: 24, stats: { aim: 5 }, xp: 9, money: [8, 16],
    passive: 'Phasing: 50% chance damage slips into another soldier.',
    abilities: [
      { name: 'Phase Strike', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 6, { aim: 0.03 }) },
      { name: 'Surround', w: 1, cd: 3, target: 'enemy', fx: 'debuff', run: x => x.status(x.target, 'vuln', 0, 2) },
    ],
    hooks: { start: x => x.status(x.user, 'phase', 0, 99) } },
  wolf: { name: 'Snow Wolf', art: beast('wolf', '#8a9ab0', ['#6a9ac8', '#f0f6ff']), hp: 22, stats: { ride: 7 }, xp: 8, money: [0, 3],
    abilities: [{ name: 'Snow Bite', w: 1, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 5, {}); if (r.hit) x.status(x.target, 'bleed', 2); } }] },
  casino_thug: { name: 'Casino Enforcer', art: port('thug'), hp: 30, stats: { grit: 6 }, xp: 9, money: [20, 35],
    abilities: [
      { name: 'Brass Knuckles', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 6, { grit: 0.02 }) },
      { name: 'Broken Bottle', w: 1, cd: 2, target: 'enemy', fx: 'hit', run: x => { x.dmg(x.target, 3, {}); x.status(x.target, 'weak', 0, 2); } },
    ] },
  magent: { name: 'Magent Magent', title: 'The Airplane Enthusiast', art: port('magent'), tier: 'boss', hp: 60, stats: { aim: 7 }, xp: 30, money: [30, 50],
    stand: '20th Century BOY', sigil: 'ball', sigilColor: '#9fc7e8', quote: 'You can\'t hurt me while I kneel. Nothing can! Hahaha!',
    abilities: [
      { name: '20th Century BOY', w: 2, cd: 3, target: 'self', fx: 'buff', run: x => x.status(x.user, 'invuln', 0, 1) },
      { name: 'Long Rifle', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 7, { aim: 0.04 }) },
      { name: 'Kneeling Snipe', w: 2, cd: 3, target: 'enemy', fx: 'gun', cond: x => x.has(x.user, 'invuln'), run: x => x.dmg(x.target, 12, { aim: 0.05 }, { noDodge: true }) },
    ] },
  wekapipo_foe: { name: 'Wekapipo', title: 'Exiled Royal Guard', art: port('wekapipo'), tier: 'boss', hp: 95, stats: { spin: 8, grit: 6 }, xp: 45, money: [40, 60],
    stand: 'Wrecking Ball', sigil: 'ball', sigilColor: '#c8c8d8', quote: 'Every model of the Golden Rectangle here... I will destroy.',
    abilities: [
      { name: 'Wrecking Ball', w: 3, target: 'enemy', fx: 'ball', run: x => { const r = x.dmg(x.target, 7, { spin: 0.04 }); if (r.hit) x.status(x.target, 'leftblind', 0, 2); } },
      { name: 'Satellite Spheres', w: 2, cd: 2, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => { x.dmg(e, 4, { spin: 0.03 }); if (x.roll(0.3)) x.status(e, 'leftblind', 0, 2); }) },
      { name: 'Guard Stance', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => x.status(x.user, 'guard', 0, 2) },
      { name: 'Left-Side Crush', w: 3, cd: 2, target: 'enemy', fx: 'ball', cond: x => x.count('leftblind') > 0, run: x => { const t = x.enemies.find(e => x.has(e, 'leftblind')) || x.target; x.dmg(t, 12, { spin: 0.05 }, { noDodge: true }); } },
    ] },
  ghost: { name: 'Ghost of Guilt', art: port('ghost'), hp: 16, stats: {}, xp: 3, money: [0, 0],
    passive: 'Killing a Ghost of Guilt passes 2 Guilt to your whole party.',
    abilities: [{ name: 'Accuse', w: 1, target: 'enemy', fx: 'debuff', run: x => { x.dmg(x.target, 4, {}); x.status(x.target, 'guilt', 1); } }],
    hooks: { death: x => { x.enemies.forEach(e => x.status(e, 'guilt', 1)); } } },
  soundstone: { name: 'Speaking Stone', art: beast('ball', '#a08a7a', ['#7a4a9a', '#e8508a']), hp: 14, stats: {}, xp: 3, money: [0, 0],
    passive: 'Stamps Sound onto a random rider every turn.',
    abilities: [{ name: 'ドドド', w: 1, target: 'enemy', fx: 'sound', run: x => x.status(x.target, 'sound', 1) }] },
  axl: { name: 'Axl RO', title: 'Deserter of Gettysburg', art: port('axl'), tier: 'boss', hp: 130, stats: { aim: 6, res: 6 }, xp: 80, money: [70, 100],
    stand: 'Civil War', sigil: 'cross', sigilColor: '#e8d8c8', quote: 'Everyone carries something they abandoned. Let me return it to you.',
    passive: 'Summons the ghosts of the party\'s guilt. When killed, his sins try to transfer to the killer.',
    abilities: [
      { name: 'Civil War', w: 2, cd: 2, target: 'allEnemies', fx: 'debuff', run: x => x.enemies.forEach(e => x.status(e, 'guilt', 2)) },
      { name: 'Burden of Sin', w: 2, cd: 3, target: 'self', fx: 'buff', cond: x => x.allies.length < 4, run: x => { x.summon('ghost'); x.summon('ghost'); } },
      { name: 'Cleansing Water', w: 1, cd: 3, target: 'self', fx: 'heal', run: x => { x.cleanse(x.user, 99); x.heal(x.user, 12, {}); } },
      { name: 'Pistol', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 7, { aim: 0.04 }) },
    ],
    hooks: { death: x => {
      if (!x.flag('axlRevived')) {
        x.setFlag('axlRevived');
        x.dialogue('axl_revive');
        x.revive(x.user, 0.45);
        x.enemies.forEach(e => x.status(e, 'guilt', 3));
        x.unlockFlag('tusk3');
        return true; // prevented death
      }
    } } },

  /* ===== ACT V — The East Coast ===== */
  vguard: { name: 'Presidential Guard', art: port('agent'), hp: 36, stats: { aim: 7, grit: 5 }, xp: 13, money: [18, 30],
    abilities: [
      { name: 'Rifle', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 7, { aim: 0.04 }) },
      { name: 'Formation', w: 1, cd: 3, target: 'allAllies', fx: 'buff', run: x => x.allies.forEach(a => x.status(a, 'guard', 0, 2)) },
    ] },
  parallel: { name: 'Parallel Valentine', art: port('parallel'), hp: 26, stats: { aim: 6 }, xp: 6, money: [0, 0],
    passive: 'A copy from another world. Merges away after 3 turns.',
    abilities: [{ name: 'Otherworld Shot', w: 1, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 6, { aim: 0.03 }) }],
    hooks: { turnStart: x => { x.user.age = (x.user.age || 0) + 1; if (x.user.age > 3) { x.log('The parallel copy crumbles into a Menger sponge.'); x.kill(x.user); } } } },
  disco: { name: 'D-I-S-C-O', title: 'Silent Assassin', art: port('disco'), tier: 'elite', hp: 72, stats: { aim: 7 }, xp: 30, money: [40, 55],
    stand: 'Chocolate Disco', sigil: 'grid', sigilColor: '#e8742a', quote: '...',
    abilities: [
      { name: 'Grid Teleport', w: 2, cd: 2, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 9, { aim: 0.04 }, { noDodge: true }) },
      { name: 'Grid Lock', w: 2, cd: 3, target: 'enemy', fx: 'debuff', run: x => x.status(x.target, 'stun', 0, 1) },
      { name: 'Chocolate Disco', w: 3, cd: 3, target: 'self', fx: 'grid', run: x => x.status(x.user, 'reflect', 0, 2) },
      { name: 'Sabre', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 6, {}) },
    ] },
  balloon: { name: 'Tubular Balloon', art: beast('crow', '#e8508a', ['#e8508a', '#9fc7e8']), hp: 8, stats: {}, xp: 2, money: [0, 0],
    passive: 'Popping it sprays needles: every rider takes 1 Bleed.',
    abilities: [{ name: 'Needle Burst', w: 1, target: 'enemy', fx: 'claw', run: x => { x.dmg(x.target, 5, {}); x.status(x.target, 'bleed', 3); x.kill(x.user); } }],
    hooks: { death: x => x.enemies.forEach(e => x.status(e, 'bleed', 1)) } },
  mikeo: { name: 'Mike O.', title: 'Head of Presidential Security', art: port('mikeo'), tier: 'elite', hp: 66, stats: { aim: 6 }, xp: 30, money: [40, 55],
    stand: 'Tubular Bells', sigil: 'balloon', sigilColor: '#e8508a', quote: 'Every bullet becomes a balloon animal. And every balloon finds its home.',
    abilities: [
      { name: 'Balloon Animals', w: 3, cd: 2, target: 'self', fx: 'buff', cond: x => x.allies.length < 4, run: x => { x.summon('balloon'); x.summon('balloon'); } },
      { name: 'Revolver', w: 2, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 6, { aim: 0.04 }) },
    ] },
  valentine1: { name: 'Funny Valentine', title: '23rd President of the United States', art: port('valentine'), tier: 'boss', hp: 140, stats: { aim: 8, grit: 7, res: 6 }, xp: 90, money: [90, 120],
    stand: 'Dirty Deeds Done Dirt Cheap', sigil: 'flag', sigilColor: '#f6ecd8', quote: 'I take the first napkin. That is what it means to lead a nation.',
    passive: 'D4C: pulls copies from parallel worlds. While a copy lives, half of the hits on him land on the copy instead (DOJYAAAN~). When defeated the first time, he swaps places with another Valentine. Kill the copies first.',
    abilities: [
      { name: 'Parallel Summons', w: 2, cd: 3, target: 'self', fx: 'buff', cond: x => x.allies.length < 3, run: x => { x.summon('parallel'); x.say(x.user, 'Dojyaaan~'); } },
      { name: 'D4C Barrage', w: 3, target: 'enemy', fx: 'hit', run: x => { x.dmg(x.target, 5, { grit: 0.02 }); x.dmg(x.target, 5, { grit: 0.02 }); } },
      { name: 'Between the Flags', w: 1, cd: 4, target: 'self', fx: 'buff', run: x => { x.cleanse(x.user, 99); x.status(x.user, 'evasive', 0, 2); } },
    ],
    hooks: { death: x => {
      if (!x.flag('valSwap')) { x.setFlag('valSwap'); x.dialogue('val_swap'); x.revive(x.user, 0.6); return true; }
      x.achieve('valentine');
    } } },
  lovetrain: { name: 'Funny Valentine', title: 'Blessed by the Saint — Love Train', art: port('valentine'), tier: 'boss', hp: 190, stats: { aim: 9, grit: 8, res: 7 }, xp: 150, money: [120, 150],
    stand: 'D4C — Love Train', sigil: 'heart', sigilColor: '#f6ecd8', quote: 'All misfortune in the world flows elsewhere. I am protected by the light itself.',
    passive: 'LOVE TRAIN: all non-piercing damage is redirected as misfortune onto a random member of your party. Only perfect rotation pierces (Golden Spin at 5 Rotation, Ball Breaker, Infinite Rotation). Status damage still works.',
    abilities: [
      { name: 'Misfortune Stream', w: 3, target: 'enemy', fx: 'hit', run: x => { x.dmg(x.target, 8, { grit: 0.02 }); x.status(x.target, 'vuln', 0, 1); } },
      { name: 'Light Wall Slash', w: 2, cd: 2, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => x.dmg(e, 5, {})) },
      { name: 'Parallel Summons', w: 1, cd: 4, target: 'self', fx: 'buff', cond: x => x.allies.length < 3, run: x => x.summon('parallel') },
    ],
    hooks: {
      start: x => x.status(x.user, 'invuln', 0, 999),
      roundStart: x => { if (x.round === 2 && !x.flag('bbUnlocked')) { x.setFlag('bbUnlocked'); x.dialogue('ball_breaker_learn'); x.unlockFlag('ballbreaker'); } },
      damaged: x => {
        if (!x.flag('gyroFalls') && x.user.hp <= x.user.maxHp * 0.55) {
          x.setFlag('gyroFalls');
          x.dialogue('gyro_falls');
          x.killAlly('gyro');
          x.unlockFlag('tusk4');
          x.heal(x.user, 30, {});
        }
      },
      death: x => x.achieve('valentine'),
    } },

  /* ===== ACT VI — New York ===== */
  nypd: { name: 'New York Patrolman', art: port('soldier'), hp: 34, stats: { aim: 6, grit: 6 }, xp: 12, money: [15, 25],
    abilities: [{ name: 'Nightstick', w: 1, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 7, {}) }] },
  worldraptor: { name: 'Parallel Raptor', art: beast('raptor', '#c8a020', ['#3a1a5a', '#f2c14e']), hp: 26, stats: { ride: 8 }, xp: 9, money: [0, 4],
    abilities: [{ name: 'Golden Bite', w: 1, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 6, {}); if (r.hit) x.status(x.target, 'bleed', 2); } }] },
  diego_world: { name: 'Diego Brando', title: 'From Another World', art: port('diegoworld'), tier: 'boss', hp: 270, stats: { aim: 9, ride: 11, grit: 7 }, xp: 200, money: [150, 200],
    stand: 'THE WORLD', sigil: 'clock', sigilColor: '#ffd84a', quote: 'THE WORLD! Time... has stopped.',
    passive: 'THE WORLD: every 3rd round, stops time — the party is frozen and Diego acts freely. Only Infinite Rotation can truly reach him.',
    abilities: [
      { name: 'MUDA MUDA', w: 3, target: 'enemy', fx: 'hit', run: x => { for (let i = 0; i < 3; i++) x.dmg(x.target, 4, { aim: 0.02 }); } },
      { name: 'Knife Volley', w: 2, cd: 2, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => { x.dmg(e, 5, { aim: 0.02 }); }) },
      { name: 'Scary Monsters', w: 1, cd: 4, target: 'self', fx: 'buff', cond: x => x.allies.length < 3, run: x => x.summon('worldraptor') },
      { name: 'Gasoline & Match', w: 1, cd: 4, target: 'allEnemies', fx: 'boom', run: x => x.enemies.forEach(e => x.status(e, 'bleed', 4)) },
    ],
    hooks: {
      roundStart: x => { if (x.round % (x.flag('worldRage') ? 2 : 3) === 0) x.timeStop(2); },
      damaged: x => {
        if (!x.flag('worldRage') && x.user.hp < x.user.maxHp * 0.5) {
          x.setFlag('worldRage');
          x.say(x.user, 'WRYYYYY! Time stops for as long as I wish!');
          x.status(x.user, 'empower', 0, 3);
          x.timeStop(3);
        }
      },
    } },
};

/* Normal fight groups per act */
SBR.FIGHTS = {
  1: [['bandit', 'bandit'], ['coyote', 'coyote', 'coyote'], ['rattlesnake', 'bandit'], ['rival_racer', 'bandit'], ['rattlesnake', 'rattlesnake', 'coyote']],
  2: [['cougar', 'cougar'], ['agent', 'agent'], ['raptor', 'raptor', 'raptor'], ['agent', 'cougar'], ['raptor', 'agent']],
  3: [['outlaw', 'outlaw'], ['soldier', 'soldier', 'crow'], ['grizzly'], ['crow', 'crow', 'outlaw'], ['soldier', 'outlaw']],
  4: [['tattoo', 'tattoo', 'tattoo'], ['wolf', 'wolf', 'wolf'], ['casino_thug', 'casino_thug'], ['tattoo', 'tattoo', 'wolf']],
  5: [['vguard', 'vguard'], ['vguard', 'parallel', 'parallel'], ['vguard', 'agent', 'agent']],
  6: [['nypd', 'nypd'], ['worldraptor', 'worldraptor', 'nypd']],
};
