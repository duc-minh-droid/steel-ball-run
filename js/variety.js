/* Run variety and story-driven difficulty.
   - Threat ("the Hunt"): the more you provoke the President and the other racers, the harder the road gets.
   - Generated encounters: each act has an enemy pool with costs and roles; fights are built to a budget.
   - Traits: story-flavoured modifiers rolled onto enemies (Swift, Armoured, Valentine's Agent...).
   - Race conditions: one twist per act.
   - Lineups: each act rolls one of several boss/story variants, and story beats float between stages. */
'use strict';

/* ================= Threat ================= */
SBR.THREAT_TIERS = [
  { name: 'Unnoticed', min: 0, color: '#8a9a8a', desc: 'Nobody important knows your name yet.' },
  { name: 'Marked', min: 3, color: '#f2c14e', desc: 'Your name is on a list. Encounters are larger and enemies carry more traits.' },
  { name: 'Hunted', min: 6, color: '#e8742a', desc: 'The President\'s men are hunting you. Hunters ambush the trail, elites bring two traits, enemies fight smarter.' },
  { name: 'The President\'s Target', min: 9, color: '#c8323c', desc: 'Every Stand user in America wants what you carry. Bosses come prepared. Drops are richer.' },
];
SBR.threatTier = () => { const t = (SBR.run && SBR.run.threat) || 0; let i = 0; SBR.THREAT_TIERS.forEach((T, k) => { if (t >= T.min) i = k; }); return i; };
/** story flags that move the Hunt when they are set */
SBR.FLAG_THREAT = { robbed: 1, scoutEnemy: 1, agentOrders: 0.5, presidentPlan: 1, trapperGrudge: 0.5, huntedByValentine: 1.5, diegoGrudge: 1, helpedRacer: -0.5, scoutFriend: -0.5, savedNun: -0.5, farrierPromise: -0.5 };

/* ================= New regular enemies ================= */
(() => {
  const port = key => ({ kind: 'portrait', key });
  const beast = (type, color, bg) => ({ kind: 'creature', type, color, bg });
  SBR.art.addPortrait({
    snakeoil:   { skin: '#f0c8a8', hair: '#8a6a4a', hairStyle: 'swept', hat: 'tophat', hatColor: '#6a2a4a', hat2: '#f2c14e', outfit: '#6a2a4a', outfit2: '#f2c14e', eye: '#3a6a3a', lip: '#a05a5a', bg: ['#6ad08a', '#6a2a4a'], extra: 'mustache' },
    boomscout:  { skin: '#e0b090', hair: '#3a2a1a', hairStyle: 'short', hat: 'bandana', hatColor: '#6a7a9a', hat2: '#f2c14e', outfit: '#5a5a6a', outfit2: '#9aa8c8', eye: '#2a2a2a', lip: '#8a4a3a', bg: ['#9aa8c8', '#3a3a4a'], extra: 'scar' },
    passbandit: { skin: '#d8a880', hair: '#2a1a10', hairStyle: 'shaggy', hat: 'cowboy', hatColor: '#3a3a3a', hat2: '#8a3a3a', outfit: '#5a3a2a', outfit2: '#8a3a3a', eye: '#1a1020', lip: '#7a4a3a', bg: ['#b04a2a', '#3a2270'], extra: 'mask' },
    deputy:     { skin: '#e8c0a0', hair: '#5a4a3a', hairStyle: 'short', hat: 'cowboy', hatColor: '#4a5a6a', hat2: '#f2c14e', outfit: '#3a4a5a', outfit2: '#9fc7e8', eye: '#3a5a7a', lip: '#9a5a5a', bg: ['#4a6a6a', '#1f3440'], extra: 'rain' },
    kansasgun:  { skin: '#d0a078', hair: '#1a1010', hairStyle: 'long', hat: 'porkpie', hatColor: '#2a2a2a', hat2: '#c8a070', outfit: '#2a2020', outfit2: '#c8a070', eye: '#1a1020', lip: '#7a4a3a', bg: ['#c8a070', '#2a2020'], extra: 'sideburns' },
    cardsharp:  { skin: '#f0d0b8', hair: '#2a1a2a', hairStyle: 'swept', hat: 'bowler', hatColor: '#1a1a2a', hat2: '#c8323c', outfit: '#1a1a2a', outfit2: '#c8323c', eye: '#6a2a6a', lip: '#a04060', bg: ['#c8323c', '#1a1a2a'], extra: 'monocle' },
    frozenracer:{ skin: '#c8d8e8', hair: '#8aa0c0', hairStyle: 'shaggy', hat: 'jockey', hatColor: '#6a8ab0', hat2: '#fff', outfit: '#6a8ab0', outfit2: '#e8f4ff', eye: '#e8f8ff', lip: '#6a7a9a', bg: ['#b8d8f0', '#1a2a4a'], extra: 'scarf' },
    parsoldier: { skin: '#c8c0e8', hair: '#3a3a6a', hairStyle: 'short', hat: 'kepi', hatColor: '#3a3a8a', hat2: '#c8c8f0', outfit: '#3a3a8a', outfit2: '#c8c8f0', eye: '#e8e8ff', lip: '#6a5a9a', bg: ['#3a3a8a', '#c8c8f0'] },
    sniper:     { skin: '#e8c8b0', hair: '#1a1020', hairStyle: 'short', hat: 'aviator', hatColor: '#2a2a3a', hat2: '#c8323c', outfit: '#1a1a2a', outfit2: '#c8323c', eye: '#1a1020', lip: '#8a5a5a', bg: ['#1f2a6a', '#c8323c'] },
    paragent:   { skin: '#c8c0e8', hair: '#1a1020', hairStyle: 'short', hat: 'bowler', hatColor: '#2a2a5a', hat2: '#8a8ac8', outfit: '#1a1a3a', outfit2: '#c8c8f0', eye: '#e8e8ff', lip: '#6a5a9a', bg: ['#8a8ac8', '#1a1a3a'], extra: 'shades' },
  });
  Object.assign(SBR.ENEMIES, {
    snakeoil: { name: 'Snake-Oil Salesman', art: port('snakeoil'), hp: 20, stats: { res: 5 }, xp: 7, money: [14, 24], res: { holy: 0.2, bleed: -0.1 },
      passive: 'Patches up his friends with tonics of questionable origin.',
      abilities: [{ name: 'Miracle Tonic', w: 3, cd: 2, target: 'ally', fx: 'heal', run: x => x.heal(x.target, 8, { res: 0.04 }) },
        { name: 'Bad Batch', w: 2, cd: 2, target: 'enemy', fx: 'spray', run: x => { x.status(x.target, 'weak', 0, 2); x.dmg(x.target, 3, {}, { dtype: 'bleed' }); } },
        { name: 'Cane Swat', w: 1, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 3, {}) }] },
    boom_scout: { name: 'Boomboom Scout', art: port('boomscout'), hp: 22, stats: { aim: 4 }, xp: 7, money: [8, 16], dtype: 'stand', res: { bullet: -0.15, spin: 0.15 },
      passive: 'A cousin of the Boomboom family. Iron sand clings to whatever he shoots.',
      abilities: [{ name: 'Iron Sand Shot', w: 3, target: 'enemy', fx: 'gun', run: x => { const r = x.dmg(x.target, 4, { aim: 0.03 }); if (r.hit) x.status(x.target, 'magnet', 0, 2); } },
        { name: 'Pull Together', w: 1, cd: 3, cond: x => x.count('magnet') >= 2, target: 'allEnemies', fx: 'magnet', run: x => x.enemies.filter(e => x.has(e, 'magnet')).forEach(e => x.dmg(e, 5, {}, { noShare: true, label: 'CLANG' })) }] },
    dino_horse: { name: 'Dinosaurified Horse', art: beast('raptor', '#a0702a', ['#2a5a3a', '#e0782e']), hp: 26, stats: { ride: 8 }, xp: 7, money: [0, 4], dtype: 'bleed', res: { phys: -0.15, cold: 0.3, holy: 0.2 },
      abilities: [{ name: 'Stampede Bite', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 5, { ride: 0.02 }); if (r.hit && x.roll(0.5)) x.status(x.target, 'fossil', 1); } },
        { name: 'Rear Up', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => x.status(x.user, 'evasive', 0, 2) }] },
    pass_bandit: { name: 'Mountain Pass Bandit', art: port('passbandit'), hp: 26, stats: { aim: 5, grit: 3 }, xp: 8, money: [12, 22], res: { cold: -0.1 },
      abilities: [{ name: 'Rifle Shot', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 5, { aim: 0.04 }) },
        { name: 'Rockslide', w: 1, cd: 3, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => x.dmg(e, 4, {}, { dtype: 'phys' })) }] },
    storm_deputy: { name: 'Storm Deputy', art: port('deputy'), hp: 30, stats: { aim: 6 }, xp: 9, money: [12, 22], dtype: 'cold', res: { cold: -0.4, bullet: -0.1 },
      passive: 'Rides with the Kansas storm. His shots leave you soaked.',
      abilities: [{ name: 'Rainshot', w: 3, target: 'enemy', fx: 'gun', run: x => { const r = x.dmg(x.target, 5, { aim: 0.04 }, { dtype: 'cold' }); if (r.hit) x.status(x.target, 'soaked', 0, 2); } },
        { name: 'Deputize', w: 1, cd: 3, target: 'ally', fx: 'buff', run: x => x.status(x.target, 'guard', 0, 2) }] },
    kansas_gun: { name: 'Kansas Gunfighter', art: port('kansasgun'), hp: 28, stats: { aim: 8, luck: 5 }, xp: 10, money: [18, 30], res: { bullet: -0.2 },
      passive: 'Duellist. Draws first and aims for the heart.',
      abilities: [{ name: 'Quick Draw', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 6, { aim: 0.05 }, { noDodge: x.round === 1 }) },
        { name: 'High Noon Duel', w: 1, cd: 4, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 12, { aim: 0.05 }, { forceCrit: x.target.hp < x.target.maxHp * 0.5 }) }] },
    card_sharp: { name: 'Casino Card Sharp', art: port('cardsharp'), hp: 24, stats: { luck: 9 }, xp: 9, money: [24, 40], dtype: 'stand', res: { stand: -0.15 },
      passive: 'A minor Stand that stacks the deck. Every draw is a curse or a blessing.',
      abilities: [{ name: 'Draw a Card', w: 3, target: 'enemy', fx: 'debuff', run: x => { const c = SBR.util.pick(['weak', 'vuln', 'blind', 'fear']); x.status(x.target, c, 0, 2); x.dmg(x.target, 3, {}); } },
        { name: 'Ace Up the Sleeve', w: 1, cd: 3, target: 'allAllies', fx: 'buff', run: x => x.allies.forEach(a => x.status(a, 'lucky', 0, 2)) }] },
    frozen_racer: { name: 'Frozen Racer', art: port('frozenracer'), hp: 36, stats: { grit: 6, ride: 5 }, xp: 10, money: [8, 18], dtype: 'cold', res: { cold: -1, phys: -0.1, holy: 0.3, spin: 0.2 },
      passive: 'A racer who never made it across the lake. He still wants first place.',
      abilities: [{ name: 'Frostbitten Grip', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 6, { grit: 0.03 }, { dtype: 'cold' }); if (r.hit) x.status(x.target, 'chilled', 0, 2); } },
        { name: 'Last Lap', w: 1, cd: 4, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'empower', 0, 2); x.status(x.user, 'shield', 10); } }] },
    par_soldier: { name: 'Parallel Soldier', art: port('parsoldier'), hp: 26, stats: { aim: 6 }, xp: 8, money: [6, 14], dtype: 'stand', res: { holy: -0.2, stand: -0.1 },
      passive: 'Pulled from another world by D4C. When he falls, another may step in.',
      abilities: [{ name: 'Rifle Volley', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 5, { aim: 0.04 }) }],
      hooks: { death: x => { if (x.roll(0.3) && !x.flag('parStep' + x.round)) { x.setFlag('parStep' + x.round); x.summon('par_soldier'); x.log('DOJYAAAN~ Another soldier steps out of the next world.'); } } } },
    pres_sniper: { name: 'Presidential Sniper', art: port('sniper'), hp: 24, stats: { aim: 10 }, xp: 10, money: [16, 26], res: { bullet: -0.2, phys: 0.2 },
      passive: 'Marks a rider, then fires a shot that cannot miss.',
      abilities: [{ name: 'Mark Target', w: 2, cd: 2, target: 'enemy', fx: 'scan', run: x => x.status(x.target, 'marked', 0, 2) },
        { name: 'Long Shot', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, x.has(x.target, 'marked') ? 13 : 6, { aim: 0.05 }, { noDodge: x.has(x.target, 'marked') }) }] },
    rat_swarm: { name: 'Subway Rat Swarm', art: beast('coyote', '#7a7a8a', ['#1a1438', '#6a4a9a']), hp: 16, stats: { ride: 7 }, xp: 5, money: [0, 3], dtype: 'bleed', res: { holy: 0.2, sound: 0.4, phys: -0.2 },
      abilities: [{ name: 'Gnaw', w: 1, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 3, {}); if (r.hit) x.status(x.target, 'bleed', 2); } }] },
    par_agent: { name: 'Parallel Agent', art: port('paragent'), hp: 32, stats: { aim: 7, ride: 6 }, xp: 11, money: [16, 28], dtype: 'stand', res: { stand: -0.2, holy: -0.2, spin: 0.2 },
      abilities: [{ name: 'Between Worlds', w: 2, cd: 3, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'evasive', 0, 2); x.status(x.user, 'phase', 0, 2); } },
        { name: 'Silenced Pistol', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 7, { aim: 0.04 }) }] },
  });
  Object.assign(SBR.DROPS, {
    snakeoil: [['herb', 0.6, 1, 2], ['venom', 0.3, 1, 1]], boom_scout: [['scrap', 0.6, 1, 2], ['wire', 0.3, 1, 1]], dino_horse: [['scale', 0.5, 1, 1], ['horsehair', 0.5, 1, 2]],
    pass_bandit: [['powder', 0.4, 1, 1], ['leather', 0.4, 1, 1]], storm_deputy: [['cloth', 0.4, 1, 1], ['rainvial', 0.06, 1, 1]], kansas_gun: [['powder', 0.5, 1, 2], ['silver', 0.2, 1, 1]],
    card_sharp: [['silver', 0.3, 1, 1], ['gold', 0.1, 1, 1]], frozen_racer: [['lakeice', 0.4, 1, 1], ['horsehair', 0.4, 1, 1]], par_soldier: [['menger', 0.2, 1, 1], ['scrap', 0.4, 1, 1]],
    pres_sniper: [['powder', 0.5, 1, 2], ['silver', 0.2, 1, 1]], rat_swarm: [['fang', 0.3, 1, 1]], par_agent: [['menger', 0.3, 1, 1], ['silver', 0.2, 1, 1]],
  });
})();

/* ================= Enemy pools & the fight builder ================= */
// cost = how much of the budget an enemy uses; role keeps groups coherent
SBR.POOLS = {
  1: [['bandit', 2, 'gunner'], ['coyote', 1, 'swarm'], ['rattlesnake', 1, 'swarm'], ['rival_racer', 2, 'gunner'], ['cactus', 0.8, 'swarm'], ['snakeoil', 2, 'support'], ['boom_scout', 2.2, 'caster']],
  2: [['cougar', 2, 'brute'], ['agent', 2, 'gunner'], ['raptor', 1.6, 'swarm'], ['dino_horse', 2.2, 'brute'], ['pass_bandit', 2.2, 'gunner'], ['snakeoil', 2, 'support']],
  3: [['outlaw', 2.6, 'gunner'], ['soldier', 2.6, 'gunner'], ['crow', 1, 'swarm'], ['grizzly', 4, 'brute'], ['storm_deputy', 2.6, 'caster'], ['kansas_gun', 3, 'gunner'], ['snakeoil', 2, 'support']],
  4: [['tattoo', 2.6, 'swarm'], ['wolf', 2, 'brute'], ['casino_thug', 2.6, 'brute'], ['card_sharp', 2.6, 'support'], ['frozen_racer', 3, 'brute'], ['crow', 1, 'swarm']],
  5: [['vguard', 3, 'gunner'], ['parallel', 2, 'swarm'], ['agent', 2, 'gunner'], ['par_soldier', 2.6, 'swarm'], ['pres_sniper', 3.2, 'caster'], ['card_sharp', 2.6, 'support']],
  6: [['nypd', 3, 'gunner'], ['worldraptor', 3, 'brute'], ['rat_swarm', 1.6, 'swarm'], ['par_agent', 3.4, 'caster'], ['pres_sniper', 3.2, 'gunner']],
};
const BUDGET_BASE = { 1: 3.6, 2: 4.6, 3: 5.6, 4: 6.4, 5: 7, 6: 7.6 };
/** build an enemy group for this act and stage; kind is 'fight' or 'elite' */
SBR.buildFight = (act, stage = 1, kind = 'fight', tierOverride) => {
  const pool = (SBR.POOLS[act] || SBR.POOLS[1]).filter(([id]) => SBR.ENEMIES[id]);
  const tier = tierOverride != null ? tierOverride : SBR.threatTier();
  const C = SBR.curCondition && SBR.curCondition();
  let budget = (BUDGET_BASE[act] || 4) + stage * 0.45 + tier * 1.1 + (C && C.budget || 0);
  if (kind === 'elite') budget *= 1.45;
  budget *= 0.9 + Math.random() * 0.2;
  const out = [];
  let supports = 0;
  // an anchor that isn't a support, then fill
  const anchorPool = pool.filter(p => p[2] !== 'support' && p[1] <= budget);
  const anchor = SBR.util.pick(anchorPool.length ? anchorPool : pool);
  out.push(anchor[0]); budget -= anchor[1];
  // themed groups: a second copy of the anchor is likely (packs, gangs)
  for (let guard = 0; guard < 12 && out.length < 4; guard++) {
    const fits = pool.filter(p => p[1] <= budget + 0.3 && !(p[2] === 'support' && supports >= 1));
    if (!fits.length) break;
    const p = Math.random() < 0.35 && anchor[1] <= budget + 0.3 ? anchor : SBR.util.weighted(fits, q => (q[2] === 'swarm' ? 1.3 : 1));
    out.push(p[0]); budget -= p[1];
    if (p[2] === 'support') supports++;
  }
  return out;
};

/* ================= Traits ================= */
SBR.STATUS.rallied = { name: 'Rallied', glyph: '旗', color: '#c8323c', kind: 'buff', mode: 'turns', desc: () => 'A leader drives them on: +15% damage.', mods: { dmgOut: 1.15 } };
SBR.STATUS.mighty = { name: 'Hulking', glyph: '巨', color: '#8a5a30', kind: 'buff', mode: 'turns', desc: () => 'Massive: +15% damage.', mods: { dmgOut: 1.15 } };
SBR.TRAITS = {
  swift:      { name: 'Swift', color: '#3fb8a9', desc: '+5 initiative and starts Evasive.', apply: (c, u) => { u.stats.ride += 6; c.addStatus(u, 'evasive', 0, 2, true); } },
  armoured:   { name: 'Armoured', color: '#8a8a9a', desc: '-25% Physical and Gunshot damage taken.', apply: (c, u) => { u.baseRes.phys = (u.baseRes.phys || 0) - 0.25; u.baseRes.bullet = (u.baseRes.bullet || 0) - 0.25; } },
  sharpshooter:{ name: 'Sharpshooter', color: '#e8742a', desc: '+4 AIM, +4 LUCK: crits far more often.', apply: (c, u) => { u.stats.aim += 4; u.stats.luck += 4; } },
  regenerating:{ name: 'Regenerating', color: '#6ad08a', desc: 'Heals 4 HP at the start of each turn.', apply: (c, u) => c.addStatus(u, 'regen', 0, 99, true) },
  leader:     { name: 'Leader', color: '#c8323c', desc: 'Allies deal +15% damage while it lives.', apply: (c, u) => c.enemies().filter(e => e !== u).forEach(e => c.addStatus(e, 'rallied', 0, 99, true)),
    death: (c, u) => c.enemies().forEach(e => { if (c.has(e, 'rallied')) c.removeStatus(e, 'rallied'); }) },
  hulking:    { name: 'Hulking', color: '#8a5a30', desc: '+50% HP and +15% damage.', apply: (c, u) => { u.maxHp = Math.round(u.maxHp * 1.5); u.hp = u.maxHp; c.addStatus(u, 'mighty', 0, 99, true); } },
  valentine:  { name: 'Valentine\'s Agent', color: '#1f2a6a', desc: 'Starts with a 12-point Shield. -30% Cold damage taken.', apply: (c, u) => { c.addStatus(u, 'shield', 12, 0, true); u.baseRes.cold = (u.baseRes.cold || 0) - 0.3; } },
  corpse:     { name: 'Corpse-blessed', color: '#ffd84a', desc: '-50% Holy damage taken and Sanctified. Heals when an ally falls.', apply: (c, u) => { u.baseRes.holy = (u.baseRes.holy || 0) - 0.5; c.addStatus(u, 'sanctified', 0, 99, true); },
    allyDeath: (c, u) => c.heal(null, u, Math.round(u.maxHp * 0.15)) },
  standtouched:{ name: 'Stand-touched', color: '#b070e0', desc: 'The Devil\'s Palm gave it a minor Stand: an extra Stand attack.', apply: (c, u) => {
    u.xAbilities = (u.def.abilities || []).concat([{ name: 'Stand Rush', w: 2, cd: 2, target: 'enemy', fx: 'hit', dtype: 'stand', run: x => { for (let i = 0; i < 3; i++) x.dmg(x.target, 2, { aim: 0.02 }, { dtype: 'stand', label: 'ORA' }); } }]);
    u.baseRes.stand = (u.baseRes.stand || 0) - 0.15; } },
  vengeful:   { name: 'Vengeful', color: '#8a1a2a', desc: 'On death, curses the party (Weakened 1) and empowers its allies.', death: (c, u) => { c.alive('party').forEach(p => c.addStatus(p, 'weak', 0, 1)); c.enemies().forEach(e => c.addStatus(e, 'empower', 0, 2)); } },
  fossil:     { name: 'Fossil-infected', color: '#6aa04a', desc: 'Its hits spread Fossilizing.', onHit: (c, u, t) => c.addStatus(t, 'fossil', 1) },
  greedy:     { name: 'Gold-Rush Greedy', color: '#f2c14e', desc: 'Steals $4 with every hit. Drops double money.', onHit: (c, u, t) => { if (SBR.run.money > 0) { SBR.run.money = Math.max(0, SBR.run.money - 4); c.loot.money += 4; c.push({ t: 'float', uid: t.uid, text: '-$4', cls: 'debuff' }); } }, lootMul: 2 },
  thorny:     { name: 'Sound-stamped', color: '#e8508a', desc: 'Whoever hits it gets a Sound Stamp.', onHurt: (c, u, src) => { if (src && src.side === 'party' && Math.random() < 0.5) c.addStatus(src, 'sound', 1); } },
  rainsoaked: { name: 'Rainsoaked', color: '#6a8ad0', desc: 'Immune to Cold, weak to Spin (+30%). Starts Evasive.', apply: (c, u) => { u.baseRes.cold = -1; u.baseRes.spin = (u.baseRes.spin || 0) + 0.3; c.addStatus(u, 'evasive', 0, 1, true); } },
};
/** roll traits onto a combat's enemies; called before initiative */
SBR.applyTraits = (c, opts = {}) => {
  const r = SBR.run; if (!r) return;
  const tier = SBR.threatTier(), act = r.act || 1;
  const C = SBR.curCondition && SBR.curCondition();
  const keys = Object.keys(SBR.TRAITS);
  const give = (u, n) => {
    const pool = keys.filter(k => !(u.traits || []).includes(k));
    // conditions and regions bias the traits
    const bias = k => (C && C.traitBias && C.traitBias.includes(k) ? 3 : 1) * (act >= 5 && (k === 'valentine' || k === 'corpse') ? 2 : 1) * (act === 2 && k === 'fossil' ? 2 : 1) * (act === 3 && k === 'rainsoaked' ? 2 : 1);
    for (let i = 0; i < n && pool.length; i++) {
      const k = SBR.util.weighted(pool, bias); pool.splice(pool.indexOf(k), 1);
      u.traits = (u.traits || []).concat(k);
    }
  };
  const enemies = c.enemies();
  if (opts.boss) {
    if (tier >= 3) { const b = enemies.find(e => e.tier === 'boss'); if (b) give(b, 1); }
  } else {
    const chance = 0.05 + 0.07 * tier + 0.03 * act + (C && C.traitChance || 0);
    enemies.forEach(u => { if (Math.random() < chance) give(u, 1); });
    if (opts.elite) {
      const strongest = enemies.slice().sort((a, b) => b.maxHp - a.maxHp)[0];
      if (strongest) give(strongest, Math.max(0, (tier >= 2 ? 2 : 1) - (strongest.traits || []).length));
    }
  }
  enemies.forEach(u => {
    if (!u.traits || !u.traits.length) return;
    u.traits.forEach(k => { const T = SBR.TRAITS[k]; if (T.apply) T.apply(c, u); if (T.lootMul) u.lootMul = (u.lootMul || 1) * T.lootMul; });
    u.name = SBR.TRAITS[u.traits[0]].name.replace(/'s Agent$/, '\'s') + ' ' + u.name;
    u.lootMul = (u.lootMul || 1) * (1 + 0.25 * u.traits.length);
  });
  if (C && C.enemyStatus) enemies.forEach(u => c.addStatus(u, C.enemyStatus[0], 0, C.enemyStatus[1], true));
};
SBR.traitHooks = {
  hit(c, src, tgt) { (src && src.traits || []).forEach(k => { const T = SBR.TRAITS[k]; if (T.onHit && !tgt.dead) T.onHit(c, src, tgt); }); (tgt.traits || []).forEach(k => { const T = SBR.TRAITS[k]; if (T.onHurt) T.onHurt(c, tgt, src); }); },
  death(c, u) { (u.traits || []).forEach(k => { const T = SBR.TRAITS[k]; if (T.death) T.death(c, u); }); c.enemies().forEach(e => (e.traits || []).forEach(k => { const T = SBR.TRAITS[k]; if (T.allyDeath && e !== u) T.allyDeath(c, e); })); },
};

/* ================= Race conditions (one per act) ================= */
SBR.CONDITIONS = {
  drought:   { name: 'Drought', color: '#e8742a', desc: 'Short Rests heal half as much. Water is precious.', bonus: { restHeal: -0.5 } },
  bounty:    { name: 'Bounty Posters', color: '#c8323c', desc: 'Your face is on every post: +1 Threat, larger fights, but elites and bosses pay double.', threat: 1, budget: 0.6, eliteMoney: 2 },
  sandstorm: { name: 'Sandstorm Season', color: '#e8b36a', desc: 'Every battle on the route suffers the Scorching Palm hazard.', hazard: 'heat', acts: [1, 2] },
  coldsnap:  { name: 'Cold Snap', color: '#9fd0f0', desc: 'Every battle on the route suffers a blizzard. Cold-resistant gear is worth its weight.', hazard: 'blizzard', acts: [3, 4, 5] },
  goldfever: { name: 'Gold Fever', color: '#f2c14e', desc: 'Shops charge 30% more, but money from all sources is +30%. Greedy bandits roam.', bonus: { discount: -0.3, money: 0.3 }, traitBias: ['greedy'] },
  night:     { name: 'Night Riding', color: '#3a2a6a', desc: 'You race through the night. Enemies start Evasive; you gain +25% experience.', bonus: { xp: 0.25 }, enemyStatus: ['evasive', 1] },
  vatican:   { name: 'Vatican Escort', color: '#f6ecd8', desc: 'The Church watches over you: the party heals fully at the start of the act. The President sends blessed men after you.', heal: true, traitBias: ['corpse', 'valentine'], traitChance: 0.08 },
  telegraph: { name: 'Telegraph Lines Cut', color: '#6a8ad0', desc: 'Nobody knows where you are: -1 Threat and one extra encounter card, but you start the act behind (-15 pace).', threat: -1, bonus: { cards: 1 }, pace: -15 },
  stampede:  { name: 'Stampede Country', color: '#8a5a30', desc: 'Herds everywhere. Beasts are Hulking more often; fights give +1 material.', traitBias: ['hulking', 'swift'], traitChance: 0.06 },
  rivals:    { name: 'Rival\'s Gambit', color: '#8adf6a', desc: 'The favourites ride hard this leg. Enemies are Stand-touched more often; sprint prizes are +50%.', traitBias: ['standtouched'], traitChance: 0.06, sprintMoney: 1.5 },
};
SBR.curCondition = () => { const r = SBR.run; return r && r.conditions && r.conditions[r.act] ? SBR.CONDITIONS[r.conditions[r.act]] : null; };
SBR.rollCondition = act => {
  const keys = Object.keys(SBR.CONDITIONS).filter(k => !SBR.CONDITIONS[k].acts || SBR.CONDITIONS[k].acts.includes(act));
  const r = SBR.run; const prev = r.conditions && r.conditions[act - 1];
  return SBR.util.pick(keys.filter(k => k !== prev));
};

/* ================= Lineups: act variants and floating story beats =================
   Each act has several variants (SBR.LINEUPS[act]): a different act boss and a different set of core beats.
   On top of the core beats, a random handful of optional manga beats is drawn from SBR.BEAT_POOL[act].
   Variants can have cond(g) / weight(g) (earlier decisions pick the road), tags (the run's omen favours some),
   and foe tags (a Stand user you already met in an earlier act is not met again).
   The full data lives in manga.js; these two variants are the fallback. */
SBR.LINEUPS = {
  1: [{ id: 'canon', beats: [['st_robinson', 2, 4], ['st_tim', 3, 5]] }],
  5: [{ id: 'canon', beats: [['st_disco', 2, 3], ['st_valentine', 5, 6]] }],
};
SBR.BEAT_POOL = SBR.BEAT_POOL || {};
SBR.BOSS_TWISTS = SBR.BOSS_TWISTS || {};
(() => {
  const HIST = 'sbr.lineupHist';
  const hist = () => { try { return JSON.parse(localStorage.getItem(HIST) || '{}') || {}; } catch (e) { return {}; } };
  const remember = (act, id) => { try { const h = hist(); h[act] = [id].concat((h[act] || []).filter(x => x !== id)).slice(0, 2); localStorage.setItem(HIST, JSON.stringify(h)); } catch (e) { /* private mode */ } };
  const gApi = () => (SBR.game && SBR.game._debug && SBR.game._debug.G) || null;
  const safe = (fn, dflt) => { try { return fn(); } catch (e) { console.warn('[lineup]', e); return dflt; } };
  const foesOf = id => { const s = SBR.STORY[id]; return s && s.foe ? [].concat(s.foe) : []; };
  SBR.lineupSafe = safe;
  /** place beats on stages: sorted by window, one per stage, never on stage 1 or the boss stage; beats that don't fit are dropped */
  function placeBeats(beats, stages) {
    const story = {}; let prev = 1;
    const list = beats.slice().sort((a, b) => a[1] - b[1]);
    list.forEach(([id, lo, hi], i) => {
      const remaining = list.length - i - 1;
      const min = Math.max(lo, prev + 1), max = Math.min(hi, stages - 1 - remaining);
      const st = min <= max ? SBR.util.randInt(min, max) : Math.min(prev + 1, stages - 1);
      if (st <= prev || st > stages - 1 || story[st]) return;
      story[st] = id; prev = st;
    });
    return story;
  }
  SBR.placeBeats = placeBeats;
  SBR.rollLineup = act => {
    const A = SBR.ACTS[act], L = SBR.LINEUPS[act], r = SBR.run, g = gApi();
    if (!L || !L.length) return { id: 'canon', story: Object.assign({}, A.story) };
    if (r && SBR.rollOmen && !r.omen) safe(() => SBR.rollOmen(), null);
    const met = (r && r.metFoes) || [], seen = (r && r.seenBeats) || [];
    const H = hist()[act] || [];
    const omen = r && r.omen && SBR.OMENS && SBR.OMENS[r.omen];
    const metFoe = f => [].concat(f || []).some(x => met.includes(x));
    const ok = L.filter(v => (!v.cond || safe(() => v.cond(g), false)) && !metFoe(v.foe));
    const cands = ok.length ? ok : L.filter(v => !v.cond || safe(() => v.cond(g), false));
    const v = SBR.util.weighted(cands.length ? cands : L, x => {
      let w = typeof x.weight === 'function' ? safe(() => x.weight(g), 1) : (x.weight == null ? 1 : x.weight);
      (x.tags || []).forEach(t => { if (omen && omen.bias && omen.bias[t]) w *= omen.bias[t]; });
      if (H[0] === x.id) w *= 0.25; else if (H.includes(x.id)) w *= 0.55;
      return Math.max(0.02, w);
    });
    const core = v.beats.filter(([id]) => SBR.STORY[id] && !metFoe(foesOf(id)));
    const coreIds = core.map(b => b[0]);
    const cap = act === 6 ? 1 : A.stages - 3;
    const pool = SBR.util.shuffle ? SBR.util.shuffle((SBR.BEAT_POOL[act] || []).slice()) : (SBR.BEAT_POOL[act] || []).slice().sort(() => Math.random() - 0.5);
    const extrasOk = pool.filter(([id]) => { const s = SBR.STORY[id]; return s && !coreIds.includes(id) && !seen.includes(id) && !(v.noPool || []).includes(id) && !metFoe(foesOf(id)) && (!s.when || safe(() => s.when(g), false)); });
    const n = Math.max(0, Math.min(cap - core.length, v.extras != null ? v.extras : SBR.util.randInt(1, 2)));
    const beats = core.concat(extrasOk.slice(0, n));
    const story = placeBeats(beats, A.stages);
    if (r) {
      r.metFoes = met.concat([].concat(v.foe || []), ...Object.values(story).map(foesOf)).filter((x, i, a) => a.indexOf(x) === i);
      r.seenBeats = seen.concat(Object.values(story));
    }
    remember(act, v.id);
    return { id: v.id, name: v.name || null, rumor: v.rumor || null, story, boss: v.boss || null, core: coreIds };
  };
  /** the act as this run sees it: beats whose scene has when(g) are hidden while it fails; boss twists apply from what you did */
  SBR.actPlan = act => {
    const A = SBR.ACTS[act], r = SBR.run, g = gApi();
    const L = r && r.lineup && r.lineup[act];
    const raw = (L && L.story) || A.story;
    const story = {};
    Object.entries(raw || {}).forEach(([st, id]) => { const s = SBR.STORY[id]; if (s && (!s.when || !g || safe(() => s.when(g), true))) story[st] = id; });
    let boss = (L && L.boss) || A.boss;
    const tw = g && (SBR.BOSS_TWISTS[act] || []).find(t => safe(() => t.when(g, boss), false));
    if (tw) boss = Object.assign({}, boss, { enemies: boss.enemies.concat(tw.add || []), name: tw.name ? tw.name(boss) : boss.name, twist: tw.id });
    return { story, boss, variant: (L && L.id) || 'canon', twist: tw ? tw.id : null, name: L && L.name };
  };
})();

/* ================= Variant bosses and scenes ================= */
(() => {
  const E = SBR.ENEMIES;
  E.robinson_boss = Object.assign({}, E.robinson, { tier: 'boss', hp: 115, stats: { aim: 6, ride: 5 }, xp: 45, money: [50, 70], title: 'The Insect Queen of the Desert',
    quote: 'Every cactus, every fly, every eye in this desert is mine. And you walked in blind.',
    passive: 'Plants exploding cacti, blinds with swarms and gets faster as the hive grows. Burn the cacti first.',
    abilities: E.robinson.abilities.concat([
      { name: 'Hive Surge', w: 2, cd: 3, target: 'allEnemies', fx: 'spray', run: x => x.enemies.forEach(e => { x.dmg(e, 3, {}, { dtype: 'bleed' }); x.status(e, 'blind', 0, 1); }) },
      { name: 'Swarm Cloak', w: 1, cd: 4, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'evasive', 0, 2); x.status(x.user, 'shield', 4 + x.allies.length * 4); } },
    ]) });
  E.oyecomova_boss = Object.assign({}, E.oyecomova, { tier: 'boss', hp: 125, stats: { aim: 6, grit: 5 }, xp: 55, money: [55, 80], title: 'The Terrorist from Naples, Unleashed',
    quote: 'The whole village is a bomb, Zeppeli. Every step you take is a note in my song.',
    passive: 'Pins the entire battlefield. Brace to pull pins; he detonates them all at half HP.',
    abilities: E.oyecomova.abilities.concat([{ name: 'Crescendo', w: 1, cd: 5, target: 'allEnemies', fx: 'boom', cond: x => x.user.hp < x.user.maxHp * 0.5, run: x => x.enemies.forEach(e => { if (x.has(e, 'primed')) { x.removeStatus(e, 'primed'); x.dmg(e, 14, {}, { noDodge: true, label: 'BOOM' }); } }) }]) });
  const S = SBR.STORY;
  S.st_boom = { card: { title: 'Iron in the Sand', blurb: 'Nails and horseshoes rise out of the dunes.', icon: 'skull' }, bg: 1, lines: S.boom_pre.lines,
    fight: { enemies: ['benjamin', 'andre', 'laboom'], elite: true, midRound: { 2: 'tusk_awaken' } }, after: g => { g.scene('boom_post'); } };
  S.rob_pre = { bg: 1, lines: [
    { narr: 'The cacti along the trail are twitching. The air is black with insects. Mrs. Robinson has grown her garden all the way to the horizon.', mood: 'menace' },
    { who: 'robinson', text: 'Two favourites, one desert. Only one of us rides out, amigos.' },
    { who: 'gyro', text: 'Johnny, stay behind me. And whatever you do, don\'t let them into your eyes.' },
  ] };
  S.rob_post = { bg: 1, lines: [
    { narr: 'The swarm scatters. Mrs. Robinson crashes into the sand, still clutching his revolver.' },
    { who: 'johnny', text: 'My nails... when he came at us, they SPUN. Something stood beside me.' },
    { who: 'gyro', text: 'Then the desert gave you something too. Don\'t waste it.' },
  ], fx: g => g.flag('tusk1') };
  S.st_ferdinand = { card: { title: 'The Extinct Village', blurb: 'The villagers are gone. Dinosaurs wear their clothes.', icon: 'crown' }, bg: 2, lines: S.ferd_pre.lines,
    fight: { enemies: ['ferdinand'], boss: true }, after: g => g.scene('ferd_post') };
  S.oye_pre = { bg: 2, lines: [
    { narr: 'The relay village at the top of the pass. Every doorknob, every rock, every pebble has a tiny pin pressed into it. Even the church bell.', mood: 'menace' },
    { who: 'oyecomova', text: 'Zeppeli. The Neapolitan crown\'s dog. This time the whole mountain is my instrument.' },
    { who: 'gyro', text: 'Don\'t touch anything he\'s touched. Not the reins. Not the ground. Not me, if he got to me first.' },
  ] };
  S.oye_post = { bg: 2, lines: [
    { narr: 'Oyecomova falls silent. The pins go still, one by one.' },
    { who: 'gyro', text: 'He hated my family for serving the King. Maybe he wasn\'t wrong. But Marco didn\'t choose any of this.' },
  ] };
  S.st_sandman = { card: { title: 'The Cottage by the River', blurb: 'The walls speak. Every sound cuts.', icon: 'crown' }, bg: 3, lines: S.sand_pre.lines,
    fx: g => { g.flag('golden'); g.achieve('golden'); }, fight: { enemies: ['sandman'], boss: true }, after: g => g.scene('sand_post') };
  S.ringo_pre = { bg: 3, lines: S.st_ringo.lines };
  S.ringo_post = { bg: 3, lines: [
    { who: 'ringo', text: 'You have walked the path of the Man\'s World. Go on... the way is open.' },
    { narr: 'The cabin fades behind you. Six seconds, turned back again and again — and still you came through.' },
  ] };
  S.st_axl = { card: { title: 'The Garbage Dump', blurb: 'A nun in a dump, and Hot Pants frozen in terror.', icon: 'crown' }, bg: 4, lines: S.axl_pre.lines,
    fight: { enemies: ['axl'], boss: true }, after: g => g.scene('axl_post') };
  S.weka_pre = { bg: 4, lines: S.st_wekapipo.lines };
  S.weka_post = Object.assign({}, S.weka_spare, { fx: g => g.relic('c_legs') });
  // hunters: story ambushes when the President is after you
  S.hunt_intro = { bg: 1, lines: [{ narr: 'Riders on the ridge. They have been following your tracks for a day.', mood: 'menace' }] };
})();

/* ================= Hunter encounters ================= */
(() => {
  const H = [
    { id: 'hunt_agents', acts: [1, 2, 3], title: 'Riders on Your Trail', blurb: 'Men in dark coats have been following your tracks.', text: 'They wear the President\'s pins. "Hand over what you found in the desert, and nobody gets hurt." Nobody believes that.', band: ['agent', 'agent'] },
    { id: 'hunt_dinos', acts: [2, 3, 4], title: 'Scales in the Grass', blurb: 'Something is running on two legs beside the trail.', text: 'Diego\'s dinosaurs. They don\'t attack. They herd you, toward the place Diego wants you.', band: ['raptor', 'raptor', 'dino_horse'] },
    { id: 'hunt_parallel', acts: [4, 5, 6], title: 'Faces From Another World', blurb: 'The same man steps out from behind three different trees.', text: 'D4C\'s soldiers. They have no fear of dying. There\'s always another one of them.', band: ['par_soldier', 'par_soldier', 'par_agent'] },
    { id: 'hunt_snipers', acts: [3, 4, 5, 6], title: 'A Glint on the Ridge', blurb: 'Sunlight flashes off a rifle scope.', text: 'The President sends marksmen now. One shot to mark you. One to finish you.', band: ['pres_sniper', 'vguard'] },
  ];
  H.forEach(h => SBR.EVENTS.push({ id: h.id, acts: h.acts, type: 'elite', title: h.title, blurb: h.blurb, icon: 'skull', weight: 4, pace: -3, hunter: true,
    cond: g => SBR.threatTier() >= 2,
    text: h.text,
    choices: [
      { label: 'Fight them off', ok: { text: 'You make a stand.', fight: { enemies: h.band, elite: true, after: g => { g.threat(-0.5); g.money(40); } } } },
      { label: 'Lose them in the rough country (RIDING)', check: { stat: 'ride', dc: 13 + SBR.threatTier() }, ok: { text: 'You vanish into a dry creek bed. They ride past. (-1 Threat)', fx: g => g.threat(-1) }, fail: { text: 'They cut you off.', fight: { enemies: h.band, elite: true } } },
      { label: 'Pay them to look the other way ($60)', cost: { money: 60 }, ok: { text: 'Money changes hands. For now, they didn\'t see you. (-1.5 Threat)', fx: g => g.threat(-1.5) } },
    ] }));
})();

/* ================= Icons for traits and threat ================= */
(() => {
  const I = SBR.icons, K = I.K, st = I.st;
  SBR.traitBadge = k => { const T = SBR.TRAITS[k]; return `<span class="trait-badge" style="--tc:${T.color}">${T.name}</span>`; };
  I.define('status', 'rallied', () => `<path d="M12 44V6" ${st}/><path d="M12 6h26l-6 8 6 8H12z" fill="#c8323c" ${st}/>`);
  I.define('status', 'mighty', () => `<path d="M14 22q0-8 6-8h10q6 0 6 8v8q0 10-10 12h-4q-8-2-8-10z" fill="#8a5a30" ${st}/><path d="M20 14v8M26 14v8M32 16v6" ${st}/>`);
})();
