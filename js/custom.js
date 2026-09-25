'use strict';
SBR.isPU = id => id === 'custom' || id === 'sukuna';
/* The custom rider: a racer you name and draw yourself. They start with nothing but a gun and a fist, and can earn one
   power on the road, borrowed from the other parts of JoJo: Hamon breathing, a Stone Mask, German science, or the
   Stand Arrow (12 famous Stands from Parts 3-6). Hamon and Vampire riders can go further with the Red Stone of Aja.
   Each power is a Path with char 'custom', so it reuses the Path system (takePath, pathAbilities, emblems). */

/* ---------------- 1. The rider ---------------- */
SBR.CUSTOM_DEFAULT = {
  name: 'The Drifter', title: 'Nobody from Nowhere',
  portrait: { skin: '#f0c8a0', hair: '#3a2a1a', hairStyle: 'short', hat: 'cowboy', hatColor: '#6a4a2a', hat2: '#c8323c', outfit: '#4a5a8a', outfit2: '#e8d8b8', eye: '#3a6a9a', lip: '#b06060', bg: ['#e8742a', '#3a2a6a'], extra: null },
};
SBR.customRider = () => { const c = SBR.meta.custom || {}; return { name: c.name || SBR.CUSTOM_DEFAULT.name, title: c.title || SBR.CUSTOM_DEFAULT.title, portrait: Object.assign({}, SBR.CUSTOM_DEFAULT.portrait, c.portrait || {}) }; };
SBR.applyCustom = () => {
  const c = SBR.customRider();
  SBR.art.addPortrait({ custom: c.portrait });
  const short = c.name.replace(/^the\s+/i, '').split(/\s+/)[0].slice(0, 12) || 'Drifter';
  const prev = SBR.CHARS.custom || {};
  SBR.CHARS.custom = Object.assign(prev, {
    name: c.name, short, title: c.title, portrait: 'custom', color: '#e8742a',
    hp: 36, stats: { spin: 2, aim: 5, grit: 4, ride: 5, res: 4, luck: 3 }, growth: { aim: 2, grit: 2, ride: 1, res: 2, spin: 1 },
    abilities: [{ id: 'drifter_shot' }, { id: 'haymaker' }, { id: 'dig_in' }, { id: 'aja_beam', flag: 'ajaHamon' }, { id: 'flesh_blades', flag: 'ajaVampire' }, { id: 'light_mode', flag: 'ajaVampire' }],
    passive: { name: 'Nobody Special', desc: 'Learns fast: +10% XP until they find a power. Every power in this world can be theirs, if they survive it.' },
    bio: `${c.name}. Nobody knows where they came from, and they aren't saying. They signed up for the Steel Ball Run with a borrowed horse and a very old gun.`,
  });
  if (!Object.getOwnPropertyDescriptor(SBR.CHARS.custom, 'stand')) Object.defineProperty(SBR.CHARS.custom, 'stand', { get: () => { const m = SBR.run && SBR.run.party.concat(SBR.run.reserve || []).find(x => SBR.isPU(x.id)); const P = m && SBR.pathOf(m); return P ? P.name : 'None, yet'; } });
};
SBR.applyCustom();
if (!SBR.LEADS.includes('custom')) SBR.LEADS.push('custom');

/* ---------------- 2. Statuses ---------------- */
Object.assign(SBR.STATUS, {
  burn:      { name: 'Burning', glyph: '炎', color: '#e8742a', kind: 'debuff', mode: 'stacks', max: 12, tick: 'burn', desc: s => `Magician's Red fire: ${3 * s} damage at turn start, then the fire dies down by 1.` },
  disclock:  { name: 'Disc Stolen', glyph: '盤', color: '#c8c8d8', kind: 'debuff', mode: 'turns', desc: () => 'Whitesnake took a disc: can only use its most basic attack.' },
  epitaph:   { name: 'Epitaph', glyph: '予', color: '#c8323c', kind: 'buff', mode: 'turns', desc: () => 'King Crimson saw it coming: the next hit misses.' },
  crimson:   { name: 'Time Erased', glyph: '紅', color: '#c8323c', kind: 'buff', mode: 'turns', desc: () => 'The next attack is a critical hit that cannot be dodged.' },
  sha:       { name: 'Sheer Heart Attack', glyph: '戦', color: '#6a6a7a', kind: 'debuff', mode: 'turns', tick: 'sha', desc: () => '"LOOK OVER HERE!" A tank bomb hunts the warmest body: 6 damage every turn.' },
  bitesdust: { name: 'Bites the Dust', glyph: '塵', color: '#e8508a', kind: 'buff', mode: 'turns', desc: () => 'If they fall, time rewinds once: back at 50% HP.' },
});
(() => {
  const I = SBR.icons, st = I.st, K = I.K;
  const glyph = (c, g) => `<circle cx="24" cy="24" r="18" fill="${c}" ${st}/><text x="24" y="31" font-size="20" text-anchor="middle" font-family="serif" fill="#fff" stroke="${K}" stroke-width="1" paint-order="stroke">${g}</text>`;
  Object.entries({ burn: ['#e8742a', '炎'], disclock: ['#8a8aa0', '盤'], epitaph: ['#c8323c', '予'], crimson: ['#8a1a2a', '紅'], sha: ['#6a6a7a', '戦'], bitesdust: ['#e8508a', '塵'] }).forEach(([id, [c, g]]) => I.define('status', id, () => glyph(c, g)));
})();

/* ---------------- 3. Abilities ---------------- */
(() => {
  const A = SBR.ABILITIES;
  const lv = (x, a, b) => (x.lvl > 1 ? b : a);
  Object.assign(A, {
    // the Drifter
    drifter_shot: { name: 'Old Six-Shooter', cost: 0, target: 'enemy', tags: ['gun'], fx: 'gun', desc: l => `A borrowed gun, fired straight. ${l > 1 ? 7 : 5} base, scales with AIM.`, run(x) { x.dmg(x.target, lv(x, 5, 7), { aim: 0.04 }); } },
    haymaker: { name: 'Haymaker', cost: 1, cd: 2, target: 'enemy', tags: [], dtype: 'phys', fx: 'hit', desc: l => `A saloon punch. ${l > 1 ? 9 : 7} base, ${l > 1 ? 45 : 30}% chance to stun.`, run(x) { const r = x.dmg(x.target, lv(x, 7, 9), { grit: 0.04 }); if (r.hit && x.roll(lv(x, 0.3, 0.45))) x.status(x.target, 'stun', 0, 1); } },
    dig_in: { name: 'Dig In', cost: 1, cd: 3, target: 'self', tags: [], fx: 'buff', desc: l => `Find cover. Guard 2 turns and heal ${l > 1 ? 10 : 6}.`, run(x) { x.status(x.user, 'guard', 0, 2); x.heal(x.user, lv(x, 6, 10), { res: 0.04 }); } },
    // Hamon
    hamon_overdrive: { name: 'Sendo Ripple Overdrive', cost: 1, cd: 1, target: 'enemy', tags: [], dtype: 'holy', fx: 'golden', desc: l => `Breathe, and strike with sunlight. ${l > 1 ? 9 : 7} Holy, scales with RESOLVE. Double against the undead.`, run(x) { x.dmg(x.target, lv(x, 7, 9), { res: 0.05 }); } },
    zoom_punch: { name: 'Zoom Punch', cost: 2, cd: 2, target: 'enemy', tags: [], dtype: 'phys', fx: 'hit', desc: l => `Dislocate your own arm to reach. ${l > 1 ? 13 : 10} base, cannot be dodged.`, run(x) { x.dmg(x.target, lv(x, 10, 13), { grit: 0.04, res: 0.02 }, { noDodge: true, label: 'ZOOM' }); } },
    sunlight_yellow: { name: 'Sunlight Yellow Overdrive', cost: 3, cd: 4, target: 'enemy', tags: [], dtype: 'holy', fx: 'golden', desc: l => `The ripple at full strength. ${l > 1 ? 22 : 18} Holy damage, and you heal half of it.`, run(x) { const r = x.dmg(x.target, lv(x, 18, 22), { res: 0.05 }); if (r.hit) x.heal(x.user, Math.round((r.amount || 0) / 2)); } },
    aja_beam: { name: 'Aja Amplifier', cost: 3, cd: 4, target: 'allEnemies', tags: [], dtype: 'holy', fx: 'golden', desc: () => 'Breathe through the Red Stone of Aja: a beam of amplified sunlight hits every enemy for 14 Holy.', run(x) { x.enemies.forEach(e => x.dmg(e, 14, { res: 0.04 })); } },
    // Vampire
    blood_drain: { name: 'Blood Drain', cost: 1, cd: 1, target: 'enemy', tags: [], dtype: 'bleed', fx: 'claw', desc: l => `Drink through the fingertips. ${l > 1 ? 9 : 7} Bleed damage; heal all of it.`, run(x) { const r = x.dmg(x.target, lv(x, 7, 9), { grit: 0.04 }); if (r.hit) x.heal(x.user, r.amount || 0); } },
    vamp_freeze: { name: 'Vaporization Freeze', cost: 2, cd: 3, target: 'enemy', tags: [], dtype: 'cold', fx: 'rain', desc: l => `Freeze the blood in their body. ${l > 1 ? 10 : 8} Cold, Chilled 2 and ${l > 1 ? 60 : 40}% stun.`, run(x) { const r = x.dmg(x.target, lv(x, 8, 10), { spin: 0.04 }); if (r.hit) { x.status(x.target, 'chilled', 0, 2); if (x.roll(lv(x, 0.4, 0.6))) x.status(x.target, 'stun', 0, 1); } } },
    space_ripper: { name: 'Space Ripper Stingy Eyes', cost: 3, cd: 4, target: 'enemy', tags: [], dtype: 'true', fx: 'gun', pierce: true, desc: l => `Fluid fired from the eyes at the speed of a bullet. ${l > 1 ? 20 : 16} True damage, cannot be dodged.`, run(x) { x.dmg(x.target, lv(x, 16, 20), { aim: 0.04 }, { noDodge: true, label: 'SPACE RIPPER' }); } },
    flesh_blades: { name: 'Flesh Blades', cost: 2, cd: 2, target: 'allEnemies', tags: [], dtype: 'bleed', fx: 'claw', desc: () => 'Blades erupt from the Ultimate Life Form\'s body. 8 to every enemy and Bleed 2.', run(x) { x.enemies.forEach(e => { const r = x.dmg(e, 8, { grit: 0.03 }); if (r.hit) x.status(e, 'bleed', 2); }); } },
    light_mode: { name: 'Light Mode', cost: 3, cd: 5, target: 'self', tags: [], fx: 'buff', desc: () => 'The Ultimate shines. Heal 30% max HP, Empowered 3 and Evasive 2.', run(x) { x.heal(x.user, Math.round(x.user.maxHp * 0.3)); x.status(x.user, 'empower', 0, 3); x.status(x.user, 'evasive', 0, 2); } },
    // Cyborg
    chest_gun: { name: 'Chest Machine Gun', cost: 1, cd: 1, target: 'enemy', tags: ['gun'], fx: 'gun', desc: l => `A heavy gun behind the ribs. ${l > 1 ? 4 : 3} shots of 4 at random enemies.`, run(x) { for (let i = 0; i < lv(x, 3, 4); i++) { const t = x.randomEnemy(); if (!t) break; x.dmg(t, 4, { aim: 0.03 }); } } },
    uv_lamp: { name: 'Ultraviolet Lamp', cost: 2, cd: 3, target: 'allEnemies', tags: [], dtype: 'holy', fx: 'golden', desc: l => `Built for hunting Pillar Men. ${l > 1 ? 8 : 6} Holy to every enemy and Blinded 1.`, run(x) { x.enemies.forEach(e => { const r = x.dmg(e, lv(x, 6, 8), { res: 0.03 }); if (r.hit) x.status(e, 'blind', 0, 1); }); } },
    german_science: { name: 'German Science Is the Best!', cost: 2, cd: 4, target: 'self', tags: [], fx: 'buff', desc: l => `"MEIN KÖRPER IST DAS STOLZ DER DEUTSCHEN WISSENSCHAFT!" Shield ${l > 1 ? 24 : 18} and Empowered 2.`, run(x) { x.status(x.user, 'shield', lv(x, 18, 24)); x.status(x.user, 'empower', 0, 2); x.say(x.user, 'German science is the best in the world!'); } },
  });

  /* Stands: rush attacks share one shape */
  const rush = (name, cry, fx) => ({ name, cost: 1, cd: 1, target: 'enemy', tags: ['stand'], fx, desc: l => `${cry} ${l > 1 ? 4 : 3} rapid hits of 3, scales with SPIN.`, run(x) { for (let i = 0; i < lv(x, 3, 4); i++) { if (x.target.dead) break; x.dmg(x.target, 3, { spin: 0.03 }, { label: i === 0 ? cry.split(' ')[0] : undefined }); } } });
  Object.assign(A, {
    // Star Platinum
    ora_rush: rush('ORA ORA Rush', 'ORA ORA ORA!', 'ora'),
    star_finger: { name: 'Star Finger', cost: 2, cd: 2, target: 'enemy', tags: ['stand'], fx: 'nail', desc: l => `Two fingers stretch across the room. ${l > 1 ? 13 : 10} base, +20% crit.`, run(x) { x.dmg(x.target, lv(x, 10, 13), { aim: 0.05 }, { forceCrit: x.roll(0.2) }); } },
    sp_the_world: { name: 'Star Platinum: The World', cost: 3, cd: 5, target: 'allEnemies', tags: ['stand'], fx: 'debuff', desc: () => '"Time has stopped." Every enemy is frozen for their next turn.', run(x) { x.c.push({ t: 'timestop', on: true }); x.enemies.forEach(e => x.status(e, 'timestop', 0, 1)); x.c.push({ t: 'timestop', on: false }); x.say(x.user, 'Za Warudo.'); } },
    // Magician's Red
    crossfire: { name: 'Crossfire Hurricane', cost: 1, cd: 1, target: 'enemy', tags: ['stand'], dtype: 'phys', fx: 'boom', desc: l => `An ankh of flame. ${l > 1 ? 7 : 5} base and Burning ${l > 1 ? 3 : 2}.`, run(x) { const r = x.dmg(x.target, lv(x, 5, 7), { spin: 0.04 }); if (r.hit) x.status(x.target, 'burn', lv(x, 2, 3)); } },
    red_bind: { name: 'Red Bind', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], dtype: 'phys', fx: 'rope', desc: l => `Chains of fire. Stun 1, Burning 2${l > 1 ? ', Exposed 2' : ''}.`, run(x) { x.status(x.target, 'stun', 0, 1); x.status(x.target, 'burn', 2); if (x.lvl > 1) x.status(x.target, 'vuln', 0, 2); } },
    life_detector: { name: 'Life Detector', cost: 1, cd: 4, target: 'allEnemies', tags: ['stand'], fx: 'scan', desc: () => 'Six flames that sense every living thing. Every enemy is Scanned 2; you gain Evasive 2.', run(x) { x.enemies.forEach(e => x.status(e, 'marked', 0, 2)); x.status(x.user, 'evasive', 0, 2); } },
    // Hierophant Green
    emerald_splash: { name: 'Emerald Splash', cost: 1, cd: 1, target: 'allEnemies', tags: ['stand'], fx: 'spray', desc: l => `Emeralds fired from the palms. ${l > 1 ? 5 : 4} to every enemy.`, run(x) { x.enemies.forEach(e => x.dmg(e, lv(x, 4, 5), { aim: 0.03 })); } },
    tentacle_bind: { name: 'Tentacle Bind', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], fx: 'rope', desc: l => `Hierophant unravels into the target's body. Hooked 2, Weakened 2${l > 1 ? ' and Scanned 2' : ''}.`, run(x) { x.status(x.target, 'hooked', 0, 2); x.status(x.target, 'weak', 0, 2); if (x.lvl > 1) x.status(x.target, 'marked', 0, 2); } },
    emerald_barrier: { name: '20m Emerald Splash', cost: 2, cd: 4, target: 'self', tags: ['stand'], fx: 'buff', desc: () => 'A web of tentacles across the whole field. Reflect 40% of damage for 2 turns and Guard 2.', run(x) { x.status(x.user, 'reflect', 0, 2); x.status(x.user, 'guard', 0, 2); } },
    // Silver Chariot
    rapier_flurry: { name: 'Rapier Flurry', cost: 1, cd: 1, target: 'enemy', tags: ['stand'], dtype: 'phys', fx: 'claw', desc: l => `${l > 1 ? 5 : 4} thrusts of 2, scales with RIDING. Each has a 20% chance to Bleed.`, run(x) { for (let i = 0; i < lv(x, 4, 5); i++) { if (x.target.dead) break; const r = x.dmg(x.target, 2, { ride: 0.04 }); if (r.hit && x.roll(0.2)) x.status(x.target, 'bleed', 1); } } },
    armor_off: { name: 'Armour Off', cost: 1, cd: 4, target: 'self', tags: ['stand'], fx: 'buff', desc: () => 'Drop the armour. Evasive 3, +1 Energy, Empowered 2.', run(x) { x.status(x.user, 'evasive', 0, 3); x.energy(x.user, 1); x.status(x.user, 'empower', 0, 2); } },
    afterimages: { name: 'Afterimages', cost: 2, cd: 3, target: 'allEnemies', tags: ['stand'], dtype: 'phys', fx: 'aoe', desc: l => `Seven Chariots at once. ${l > 1 ? 8 : 6} to every enemy, cannot be dodged.`, run(x) { x.enemies.forEach(e => x.dmg(e, lv(x, 6, 8), { ride: 0.04 }, { noDodge: true })); } },
    // Crazy Diamond
    dora_rush: rush('DORA Rush', 'DORARARA!', 'dora'),
    cd_restore: { name: 'Restoration', cost: 1, cd: 2, target: 'ally', tags: ['stand'], fx: 'heal', desc: l => `Crazy Diamond fixes what is broken. Heal ${l > 1 ? 16 : 12} and cleanse 2 debuffs.`, run(x) { x.heal(x.target, lv(x, 12, 16), { res: 0.04 }); x.cleanse(x.target, 2); } },
    cd_reverse: { name: 'Reverse Restore', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], fx: 'gun', desc: l => `Fix a broken bullet back into the gun that fired it. ${l > 1 ? 14 : 11} base, homing: cannot be dodged.`, run(x) { x.dmg(x.target, lv(x, 11, 14), { spin: 0.04 }, { noDodge: true }); } },
    // Killer Queen
    kq_bomb: { name: 'First Bomb', cost: 1, cd: 2, target: 'enemy', tags: ['stand'], fx: 'pin', desc: () => 'Anything Killer Queen touches becomes a bomb. Primed: explodes for 18 in 2 turns.', run(x) { x.dmg(x.target, 3, { spin: 0.02 }); x.status(x.target, 'primed', 0, 2); } },
    kq_sha: { name: 'Sheer Heart Attack', cost: 2, cd: 4, target: 'enemy', tags: ['stand'], fx: 'boom', desc: l => `"LOOK OVER HERE!" A tank bomb that never stops hunting: ${l > 1 ? 4 : 3} turns of 6 damage.`, run(x) { x.status(x.target, 'sha', 0, lv(x, 3, 4)); } },
    kq_btd: { name: 'Bites the Dust', cost: 3, cd: 99, target: 'self', tags: ['stand'], fx: 'buff', desc: () => 'Once per battle: if you fall, time rewinds to 50% HP.', run(x) { x.status(x.user, 'bitesdust', 0, 99); x.say(x.user, 'Killer Queen: Bites the Dust.'); } },
    // The Hand
    hand_erase: { name: 'Erase', cost: 2, cd: 2, target: 'enemy', tags: ['stand'], dtype: 'true', fx: 'claw', pierce: true, desc: l => `The right hand scrapes away space. ${l > 1 ? 14 : 11} True damage.`, run(x) { x.dmg(x.target, lv(x, 11, 14), { grit: 0.04 }, { label: 'GAOON' }); } },
    hand_pull: { name: 'Scrape Space', cost: 1, cd: 2, target: 'enemy', tags: ['stand'], fx: 'wormhole', desc: () => 'Erase the gap and pull them in. 5 base, Exposed 2, cannot be dodged.', run(x) { x.dmg(x.target, 5, { grit: 0.03 }, { noDodge: true }); x.status(x.target, 'vuln', 0, 2); } },
    hand_shield: { name: 'Erase the Bullets', cost: 1, cd: 3, target: 'self', tags: ['stand'], fx: 'buff', desc: l => `Erase what is coming. Shield ${l > 1 ? 16 : 12} and Guard 1.`, run(x) { x.status(x.user, 'shield', lv(x, 12, 16)); x.status(x.user, 'guard', 0, 1); } },
    // Gold Experience
    muda_rush: rush('MUDA Rush', 'MUDA MUDA MUDA!', 'muda'),
    life_giver: { name: 'Life Giver', cost: 2, cd: 3, target: 'ally', tags: ['stand'], fx: 'heal', desc: l => `Give life to a stone: it becomes a frog. Regen 3 and Reflect 2 on an ally${l > 1 ? ', heal 8' : ''}.`, run(x) { x.status(x.target, 'regen', 0, 3); x.status(x.target, 'reflect', 0, 2); if (x.lvl > 1) x.heal(x.target, 8); } },
    sense_overload: { name: 'Sense Overload', cost: 2, cd: 4, target: 'enemy', tags: ['stand'], fx: 'hit', desc: () => 'Too much life, all at once. 8 base, stun 1 and Blinded 2.', run(x) { const r = x.dmg(x.target, 8, { spin: 0.04 }); if (r.hit) { x.status(x.target, 'stun', 0, 1); x.status(x.target, 'blind', 0, 2); } } },
    // Sticky Fingers
    ari_rush: rush('ARI Rush', 'ARI ARI ARI!', 'ari'),
    zipper_escape: { name: 'Zipper Escape', cost: 1, cd: 3, target: 'self', tags: ['stand'], fx: 'wormhole', desc: () => 'Unzip the ground and hide in it. Evasive 2 and Guard 2.', run(x) { x.status(x.user, 'evasive', 0, 2); x.status(x.user, 'guard', 0, 2); } },
    arrivederci: { name: 'Arrivederci', cost: 3, cd: 4, target: 'enemy', tags: ['stand'], fx: 'claw', desc: l => `Zip them to pieces. ${l > 1 ? 18 : 15} base, Weakened and Exposed 2.`, run(x) { const r = x.dmg(x.target, lv(x, 15, 18), { spin: 0.04 }, { label: 'ARRIVEDERCI' }); if (r.hit) { x.status(x.target, 'weak', 0, 2); x.status(x.target, 'vuln', 0, 2); } } },
    // King Crimson
    heart_punch: { name: 'Heart Punch', cost: 1, cd: 1, target: 'enemy', tags: ['stand'], fx: 'hit', desc: l => `Straight through the chest. ${l > 1 ? 10 : 8} base, +50% damage on anyone below half HP.`, run(x) { const lo = x.target.hp < x.target.maxHp / 2; x.dmg(x.target, lv(x, 8, 10) * (lo ? 1.5 : 1), { grit: 0.04 }); } },
    epitaph: { name: 'Epitaph', cost: 1, cd: 3, target: 'self', tags: ['stand'], fx: 'scan', desc: () => 'See ten seconds into the future. The next hit on you misses, and you gain +1 Energy.', run(x) { x.status(x.user, 'epitaph', 0, 3); x.energy(x.user, 1); } },
    time_erase: { name: 'Time Erase', cost: 2, cd: 4, target: 'allEnemies', tags: ['stand'], fx: 'debuff', desc: () => 'Only King Crimson moves in erased time. Every enemy loses its next turn to confusion (50%), and your next attack crits and cannot be dodged.', run(x) { x.enemies.forEach(e => { if (x.roll(0.5)) x.status(e, 'timestop', 0, 1); }); x.status(x.user, 'crimson', 0, 3); } },
    // Stone Free
    string_net: { name: 'String Net', cost: 1, cd: 2, target: 'enemy', tags: ['stand'], fx: 'rope', desc: l => `Unravel into string and catch them. ${l > 1 ? 7 : 5} base and Hooked 2.`, run(x) { const r = x.dmg(x.target, lv(x, 5, 7), { aim: 0.03 }); if (r.hit) x.status(x.target, 'hooked', 0, 2); } },
    unravel: { name: 'Unravel', cost: 1, cd: 3, target: 'self', tags: ['stand'], fx: 'buff', desc: () => 'Come apart into a web of string. Evasive 3 and Regen 2.', run(x) { x.status(x.user, 'evasive', 0, 3); x.status(x.user, 'regen', 0, 2); } },
    mobius: { name: 'Möbius Strike', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], fx: 'ora', desc: l => `A loop of string that bends space. ${l > 1 ? 15 : 12} base; triple damage against a Hooked target.`, run(x) { const h = x.has(x.target, 'hooked'); x.dmg(x.target, lv(x, 12, 15) * (h ? 3 : 1), { spin: 0.04 }, { label: h ? 'ORA!' : undefined }); } },
    // Whitesnake
    disc_steal: { name: 'Disc Steal', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], fx: 'debuff', desc: l => `Pull out their Stand disc. 6 base; they can only use basic attacks for ${l > 1 ? 3 : 2} turns.`, run(x) { const r = x.dmg(x.target, 6, { res: 0.03 }); if (r.hit) x.status(x.target, 'disclock', 0, lv(x, 2, 3)); } },
    ws_melt: { name: 'Melting Hallucination', cost: 1, cd: 1, target: 'enemy', tags: ['stand'], fx: 'spray', desc: l => `The world melts around them. ${l > 1 ? 7 : 5} base and Weakened 2.`, run(x) { const r = x.dmg(x.target, lv(x, 5, 7), { res: 0.04 }); if (r.hit) x.status(x.target, 'weak', 0, 2); } },
    command_disc: { name: 'Command Disc', cost: 3, cd: 4, target: 'enemy', tags: ['stand'], fx: 'debuff', desc: () => 'Slot a command into their head: they lose their next 2 turns.', run(x) { x.status(x.target, 'timestop', 0, 2); x.status(x.target, 'stun', 0, 1); } },
  });
})();

/* ---------------- 4. The Paths ---------------- */
(() => {
  const P = SBR.PATHS;
  const ab = ids => ids.map((id, i) => ({ id, level: [1, 3, 5][i] }));
  const add = (id, o) => { P[id] = Object.assign({ char: 'custom', acts: [1, 2, 3, 4, 5, 6] }, o); };
  add('hamon', { line: 'hamon', name: 'Hamon Warrior', color: '#f2c14e', stats: { res: 2 }, bonus: { regen: 1, holyDmg: 0.2 }, res: { holy: -0.2 },
    passive: '+2 RESOLVE, regen 1 per turn, +20% Holy damage. Double damage to the undead. -20% Holy damage taken.', desc: 'Breathe in rhythm with the sun. The ripple runs through blood, water, and anything alive.', abilities: ab(['hamon_overdrive', 'zoom_punch', 'sunlight_yellow']) });
  add('vampire', { line: 'vampire', name: 'Vampire', color: '#8a1a2a', stats: { grit: 3, spin: 2 }, bonus: { lifesteal: 0.2, regen: 2, maxHp: 10, sunburn: 1 }, res: { holy: 0.5, spin: 0.25, bleed: -0.3, cold: -0.3 },
    passive: '+3 GRIT, +2 SPIN, +10 HP, regen 2, heal 20% of damage dealt. Weak to Holy (+50%) and Spin (+25%). Burns in scorching sun.', desc: 'The Stone Mask pierced your skull with bone needles. You are stronger than any man now, and you cannot stand the sun.', abilities: ab(['blood_drain', 'vamp_freeze', 'space_ripper']) });
  add('cyborg', { line: 'cyborg', name: 'German Cyborg', color: '#8a8aa0', stats: { grit: 4 }, bonus: { block: 0.12, maxHp: 8 }, res: { bullet: -0.2, phys: -0.2, bleed: -0.3, holy: 0.1 },
    passive: '+4 GRIT, +8 HP, +12% block. -20% Gunshot and Physical damage taken, -30% Bleed.', desc: 'The field surgeons rebuilt you out of steel and German stubbornness. Half of you is a machine gun.', abilities: ab(['chest_gun', 'uv_lamp', 'german_science']) });
  const stand = (id, name, part, color, stats, bonus, res, passive, desc, abilities, key) => add(id, { line: 'stand', part, stand: key || id, name, color, stats, bonus, res, passive, desc, abilities: ab(abilities) });
  stand('star_platinum', 'Star Platinum', 3, '#7a5ad0', { spin: 2, aim: 2 }, { crit: 0.05, standDmg: 0.1 }, { stand: -0.1 }, '+2 SPIN, +2 AIM, +5% crit, +10% Stand damage.', 'Close range, and faster and more precise than anything. It can even catch a bullet between two fingers.', ['ora_rush', 'star_finger', 'sp_the_world']);
  stand('magicians_red', 'Magician\'s Red', 3, '#e8742a', { spin: 2, res: 1 }, { standDmg: 0.1 }, { cold: -0.3 }, '+2 SPIN, +1 RESOLVE, +10% Stand damage, -30% Cold damage taken.', 'A bird-headed Stand of fire. It sets things alight from a distance, and it can tell where every living thing is.', ['crossfire', 'red_bind', 'life_detector']);
  stand('hierophant', 'Hierophant Green', 3, '#3aa05a', { aim: 3 }, { dodge: 0.04 }, { stand: -0.1 }, '+3 AIM, +4% dodge.', 'A long-range Stand that can unravel into tentacles and hide inside people. It fires emeralds.', ['emerald_splash', 'tentacle_bind', 'emerald_barrier']);
  stand('silver_chariot', 'Silver Chariot', 3, '#c8ccd8', { ride: 3, aim: 1 }, { dodge: 0.05, init: 3 }, { phys: -0.1 }, '+3 RIDING, +1 AIM, +5% dodge, +3 initiative.', 'A knight in silver armour with a rapier. Take the armour off and it moves faster than the eye.', ['rapier_flurry', 'armor_off', 'afterimages']);
  stand('crazy_diamond', 'Crazy Diamond', 4, '#e89ac8', { spin: 2, grit: 1 }, { heal: 0.2 }, { phys: -0.1 }, '+2 SPIN, +1 GRIT, +20% healing.', 'It can fix anything, and put anything back the way it was. It cannot fix its own user.', ['dora_rush', 'cd_restore', 'cd_reverse']);
  stand('killer_queen', 'Killer Queen', 4, '#e8a0c8', { spin: 2, luck: 1 }, { dmg: 0.06 }, { stand: -0.1 }, '+2 SPIN, +1 LUCK, +6% damage.', 'Anything it touches can become a bomb. Its user only wants to live a quiet life.', ['kq_bomb', 'kq_sha', 'kq_btd']);
  stand('the_hand', 'The Hand', 4, '#3a6ac8', { grit: 3 }, { critDmg: 0.15 }, {}, '+3 GRIT, +15% crit damage.', 'Its right hand scrapes away whatever it touches, and the space around it. Where it goes, nobody knows.', ['hand_erase', 'hand_pull', 'hand_shield']);
  stand('gold_experience', 'Gold Experience', 5, '#f2c14e', { spin: 1, res: 2 }, { heal: 0.15, regen: 1 }, { bleed: -0.15 }, '+1 SPIN, +2 RESOLVE, +15% healing, regen 1.', 'It gives life to whatever it hits. A stone becomes a frog; a bullet becomes a fly.', ['muda_rush', 'life_giver', 'sense_overload']);
  stand('sticky_fingers', 'Sticky Fingers', 5, '#5a8ad0', { spin: 2, ride: 1 }, { dodge: 0.04 }, { phys: -0.1 }, '+2 SPIN, +1 RIDING, +4% dodge.', 'It puts zippers on anything: walls, floors, people.', ['ari_rush', 'zipper_escape', 'arrivederci']);
  stand('king_crimson', 'King Crimson', 5, '#c8323c', { spin: 2, grit: 2 }, { crit: 0.04, dmg: 0.05 }, { stand: -0.1 }, '+2 SPIN, +2 GRIT, +4% crit, +5% damage.', 'It erases time, and only its user remembers what happened. The face on its forehead sees the future.', ['heart_punch', 'epitaph', 'time_erase']);
  stand('stone_free', 'Stone Free', 6, '#4a7ad0', { aim: 2, grit: 1 }, { block: 0.05 }, { bleed: -0.15 }, '+2 AIM, +1 GRIT, +5% block, -15% Bleed.', 'Its user can come apart into string. The string can catch, bind and listen.', ['string_net', 'unravel', 'mobius']);
  stand('whitesnake', 'Whitesnake', 6, '#e8e8f0', { res: 3 }, { energyChance: 0.05 }, { stand: -0.15 }, '+3 RESOLVE, +5% chance of extra Energy, -15% Stand damage taken.', 'It pulls discs from people\'s heads: their memories, and their Stands.', ['disc_steal', 'ws_melt', 'command_disc']);
  // emblems for the new Paths (paths.js only built them for its own)
  const I = SBR.icons, st = I.st;
  const ring = (c, inner) => `<circle cx="24" cy="24" r="20" fill="${c}" ${st}/><circle cx="24" cy="24" r="15" fill="#fbf4e4" ${st} stroke-width="1.4"/>${inner}`;
  const mini = (id, s = 0.6) => `<g transform="translate(${24 - 24 * s} ${24 - 24 * s}) scale(${s})">${I.ability(id).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>`;
  Object.entries(SBR.PATHS).filter(([, p]) => p.char === 'custom').forEach(([id, p]) => { SBR.PATH_EMBLEM[id] = () => I.wrap(ring(p.color, mini(p.abilities[0].id))); });
})();
SBR.CUSTOM_STANDS = Object.keys(SBR.PATHS).filter(k => SBR.PATHS[k].line === 'stand');
/* ability icons: a badge in the power's colour with its battle cry or glyph */
(() => {
  const I = SBR.icons, st = I.st, K = I.K;
  const badge = (c, t, fs = 12, c2 = '#fff') => `<circle cx="24" cy="24" r="19" fill="${c}" ${st}/><circle cx="24" cy="24" r="14" fill="none" stroke="#fff" stroke-width="1.2" opacity=".5"/><text x="24" y="${24 + fs * 0.36}" font-size="${fs}" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${c2}" stroke="${K}" stroke-width="1.6" paint-order="stroke">${t}</text>`;
  const pathOf = id => Object.values(SBR.PATHS).find(p => p.char === 'custom' && p.abilities.some(a => a.id === id));
  const T = { drifter_shot: ['#8a6a4a', 'BANG'], haymaker: ['#c8323c', 'POW'], dig_in: ['#6a8ad0', '守', 18], aja_beam: ['#c8323c', 'AJA'], flesh_blades: ['#8a1a2a', '刃', 18], light_mode: ['#ffd84a', '光', 18, '#8a1a2a'],
    hamon_overdrive: [null, 'コォォ', 10], zoom_punch: [null, 'ZOOM', 11], sunlight_yellow: [null, '山吹', 14], blood_drain: [null, '吸', 18], vamp_freeze: [null, '凍', 18], space_ripper: [null, '眼', 18],
    chest_gun: [null, 'MG', 14], uv_lamp: [null, 'UV', 14], german_science: [null, 'JA!', 13], ora_rush: [null, 'ORA', 13], star_finger: [null, '指', 18], sp_the_world: [null, '止', 18],
    crossfire: [null, '炎', 18], red_bind: [null, '縛', 18], life_detector: [null, '探', 18], emerald_splash: [null, '翠', 18], tentacle_bind: [null, '触', 18], emerald_barrier: [null, '20m', 12],
    rapier_flurry: [null, '剣', 18], armor_off: [null, '脱', 18], afterimages: [null, '七', 18], dora_rush: [null, 'DORA', 11], cd_restore: [null, '治', 18], cd_reverse: [null, '戻', 18],
    kq_bomb: [null, '爆', 18], kq_sha: [null, 'SHA', 12], kq_btd: [null, 'BTD', 12], hand_erase: [null, '削', 18], hand_pull: [null, 'ガオン', 9], hand_shield: [null, '盾', 18],
    muda_rush: [null, 'MUDA', 11], life_giver: [null, '命', 18], sense_overload: [null, '感', 18], ari_rush: [null, 'ARI', 13], zipper_escape: [null, 'ZIP', 12], arrivederci: [null, 'ciao', 11],
    heart_punch: [null, '心', 18], epitaph: [null, '予', 18], time_erase: [null, '消', 18], string_net: [null, '糸', 18], unravel: [null, '解', 18], mobius: [null, '∞', 18],
    disc_steal: [null, 'DISC', 11], ws_melt: [null, '溶', 18], command_disc: [null, '令', 18] };
  Object.entries(T).forEach(([id, [c, t, fs]]) => { const P = pathOf(id); I.define('ability', id, () => badge(c || (P && P.color) || '#8a6a4a', t, fs || 12, P && P.color === '#e8e8f0' || P && P.color === '#f2c14e' ? '#1a1020' : '#fff')); });
})();

/* ---------------- 5. Mechanics: evolution bonuses, XP, lifesteal, sunlight, undead ---------------- */
(() => {
  const base = SBR.equipBonus;
  SBR.equipBonus = m => {
    const out = base(m);
    if (!SBR.isPU(m.id) || !SBR.run) return out;
    const f = SBR.run.flags, add = (k, v) => { out.bonus[k] = (out.bonus[k] || 0) + v; };
    if (f.ajaHamon) { add('holyDmg', 0.4); add('regen', 1); }
    if (f.ajaVampire) { add('sunburn', -1); add('dmg', 0.15); add('regen', 2); out.bonus.res = Object.assign({}, out.bonus.res); out.bonus.res.holy = (out.bonus.res.holy || 0) - 0.5; out.bonus.res.spin = (out.bonus.res.spin || 0) - 0.25; }
    return out;
  };
  const bonus = SBR.bonus;
  SBR.bonus = () => { const b = bonus(); const r = SBR.run; if (r && SBR.isPU(r.lead)) { const m = r.party.find(x => SBR.isPU(x.id)); if (m && !m.path) b.xp = (b.xp || 0) + 0.1; } return b; };
})();
/* undead enemies: Hamon and every Holy hit does double to them */
['ghost', 'dust_wraith', 'mask_zombie', 'dino_horse'].forEach(id => { if (SBR.ENEMIES[id]) SBR.ENEMIES[id].undead = true; });

/* ---------------- 6. The people who hand out power ---------------- */
SBR.art.addPortrait({
  breather:  { skin: '#e8c8a8', hair: '#e8e8e8', hairStyle: 'bald', hat: null, outfit: '#e8d8b8', outfit2: '#f2c14e', eye: '#3a3a3a', lip: '#a07060', bg: ['#f2c14e', '#fff3c0'], extra: 'beard' },
  hamonkid:  { skin: '#f0c8a0', hair: '#2a2a3a', hairStyle: 'spiky', hat: 'headband', hatColor: '#f2c14e', hat2: '#c8323c', outfit: '#3a3a4a', outfit2: '#f2c14e', eye: '#3a6a3a', lip: '#b06060', bg: ['#f2c14e', '#3a3a4a'] },
  smuggler:  { skin: '#d8a880', hair: '#1a1020', hairStyle: 'long', hat: 'cowboy', hatColor: '#3a2a1a', hat2: '#e8742a', outfit: '#6a4a2a', outfit2: '#e8742a', eye: '#3a2a1a', lip: '#8a4a3a', bg: ['#e8742a', '#3a2a1a'], extra: 'scar' },
  maskzombie:{ skin: '#9ab88a', hair: '#3a3a2a', hairStyle: 'shaggy', hat: null, outfit: '#5a4a3a', outfit2: '#8a1a2a', eye: '#c8323c', lip: '#4a2a2a', bg: ['#1a1020', '#8a1a2a'], extra: 'grin' },
  collector: { skin: '#e8d0c0', hair: '#c8c8c8', hairStyle: 'swept', hat: 'bowler', hatColor: '#1a1020', hat2: '#f2c14e', outfit: '#1a1020', outfit2: '#f2c14e', eye: '#f2c14e', lip: '#8a5a6a', bg: ['#f2c14e', '#1a1020'], extra: 'monocle' },
  surgeon:   { skin: '#f0d0b8', hair: '#c8b070', hairStyle: 'short', hat: 'kepi', hatColor: '#4a5a3a', hat2: '#c8c8c8', outfit: '#e8e8e0', outfit2: '#c8323c', eye: '#3a6a9a', lip: '#a06060', bg: ['#4a5a3a', '#c8c8c8'], extra: 'monocle' },
});
(() => {
  const port = key => ({ kind: 'portrait', key });
  Object.assign(SBR.ENEMIES, {
    t_hamon: { name: 'The Breathing Man\'s Student', title: 'Ripple Apprentice', art: port('hamonkid'), tier: 'elite', trainer: true, hp: 64, stats: { res: 8, grit: 5 }, xp: 20, money: [20, 30], dtype: 'holy', res: { holy: -0.4, cold: -0.2 },
      passive: 'Breathes in a rhythm you can almost hear. His punches are warm.',
      abilities: [{ name: 'Ripple Punch', w: 3, target: 'enemy', fx: 'golden', run: x => x.dmg(x.target, 7, { res: 0.04 }) },
        { name: 'Clacker Volley', w: 2, cd: 2, target: 'allEnemies', fx: 'ball', run: x => x.enemies.forEach(e => x.dmg(e, 4, {}, { dtype: 'holy' })) },
        { name: 'Deep Breath', w: 1, cd: 3, target: 'self', fx: 'heal', run: x => { x.heal(x.user, 14); x.status(x.user, 'guard', 0, 1); } }] },
    mask_zombie: { name: 'Stone Mask Zombie', art: port('maskzombie'), hp: 26, stats: { grit: 5 }, xp: 9, money: [4, 10], dtype: 'bleed', res: { holy: 1, bleed: -0.5, cold: -0.3 }, undead: true,
      passive: 'A smuggler who got too close to the mask. Holy damage and the Ripple destroy it.',
      abilities: [{ name: 'Starving Bite', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 6, { grit: 0.03 }); if (r.hit) x.heal(x.user, 3); } }] },
    arrow_collector: { name: 'The Arrow Collector', title: 'He Keeps the Meteorite', art: port('collector'), tier: 'elite', hp: 120, stats: { aim: 9, res: 9, luck: 6 }, xp: 50, money: [60, 90], dtype: 'stand', res: { stand: -0.3, bullet: -0.2, holy: 0.1 },
      stand: 'The Arrow', passive: 'He has been pierced by the Arrow more than once. Every second round a new Stand flickers into him: he empowers, then shields.',
      abilities: [{ name: 'Meteorite Point', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 9, { aim: 0.04 }); if (r.hit) x.status(x.target, 'bleed', 2); } },
        { name: 'Borrowed Stand', w: 2, cd: 2, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => x.dmg(e, 6, { res: 0.03 }, { dtype: 'stand' })) },
        { name: 'The Arrow Chooses', w: 1, cd: 4, target: 'enemy', fx: 'debuff', run: x => { x.status(x.target, 'weak', 0, 2); x.status(x.target, 'fear', 0, 1); x.say(x.user, 'It did not choose you.'); } }],
      hooks: { roundStart: x => { if (x.round % 2 === 0) { x.status(x.user, x.round % 4 ? 'empower' : 'shield', x.round % 4 ? 0 : 15, x.round % 4 ? 2 : 0); x.log('Another Stand flickers inside the Collector.'); } } } },
  });
  Object.assign(SBR.DROPS, { t_hamon: [['herb', 1, 1, 2]], mask_zombie: [['bone', 0.5, 1, 1]], arrow_collector: [['silver', 1, 1, 2], ['gold', 0.6, 1, 1]] });
})();
/* the Arrow, the Mask, and the Aja stone are kept like trinkets but can't be sold */
Object.assign(SBR.TRINKETS, {
  stand_arrow: { name: 'The Stand Arrow', value: 0, keep: true, rarity: 'rare', color: '#f2c14e', desc: 'An arrowhead of meteorite stone. It hums near living things. Only one of you can use it.' },
  aja_stone: { name: 'Red Stone of Aja', value: 0, keep: true, rarity: 'rare', color: '#c8323c', desc: 'A red jewel that focuses light into a beam. The Pillar Men searched for it for ten thousand years.' },
});
(() => {
  const st = SBR.icons.st;
  const ti = SBR.trinketIcon;
  SBR.trinketIcon = id => id === 'stand_arrow' ? `<svg viewBox="0 0 48 48" class="ico"><path d="M8 40L30 18" stroke="#8a6a4a" stroke-width="5" stroke-linecap="round"/><path d="M30 18l4-12 8 8-12 4z" fill="#f2c14e" ${st}/><path d="M34 10l-6 10M8 40l-4-2M8 40l2 4" stroke="#1a1020" stroke-width="1.6"/><path d="M12 36l-6 0M12 36v6" stroke="#c8323c" stroke-width="2"/></svg>`
    : id === 'aja_stone' ? `<svg viewBox="0 0 48 48" class="ico"><path d="M24 6l14 10-4 20-10 6-10-6-4-20z" fill="#c8323c" ${st}/><path d="M24 6v36M10 16h28M14 36l10-20 10 20" stroke="#ff8a8a" stroke-width="1.4" fill="none"/><ellipse cx="18" cy="16" rx="3" ry="2" fill="#fff" opacity=".8"/></svg>` : ti(id);
})();

/* ---------------- 7. Encounters: how each power is found ---------------- */
(() => {
  const isCustom = g => SBR.isPU(SBR.run.lead) && g.canTakePath(SBR.run.lead);
  const E = [];
  const ev = (o, C) => { E.push(Object.assign({ type: 'event', icon: 'star', weight: 4, once: true, pace: -3 }, o)); C.forEach((c, i) => { if (!c) return; const { fail, ...ok } = c; SBR.CONSEQ[o.id + ':' + i] = ok; if (fail) SBR.CONSEQ[o.id + ':' + i + ':fail'] = fail; }); };
  const html = (text, pid) => { const P = SBR.PATHS[pid]; return `${text}<span class="ev-path" style="--pc:${P.color}"><b>Power: ${P.name}</b> — ${P.desc}<br><i>${P.passive}</i><br><small>You can only ever carry one power. Taking it closes the others.</small></span>`; };

  ev({ id: 'cust_hamon', acts: [1, 2, 3], type: 'trainer', title: 'The Breathing Man', blurb: 'An old man balanced on one finger on top of a pole.', icon: 'train', art: 'breather', cond: isCustom,
    text: 'On a mesa above the trail, an old man is standing on one finger on top of a wooden pole. He has been there since sunrise. "You breathe like a frightened horse," he calls down. "Come up here and I will teach you to breathe like the sun."',
    get html() { return html(this.text, 'hamon'); },
    choices: [
      { label: 'Climb the pole and breathe with him (RESOLVE)', check: { stat: 'res', dc: 13, who: 'custom' }, ok: { text: 'Hours pass. Your breath and your heartbeat fall into a rhythm, and your fingers glow. The Ripple.', fx: g => g.takePath('hamon') }, fail: { text: 'You fall off the pole. His student laughs, then offers to knock the breath into you instead.', fight: { enemies: ['t_hamon'], elite: true, after: g => g.takePath('hamon') } } },
      { label: 'Fight his student', ok: { text: '"Learn it the hard way, then."', fight: { enemies: ['t_hamon'], elite: true, after: g => g.takePath('hamon') } } },
      { label: 'Just ask for a breathing lesson', ok: { text: 'He teaches you to breathe out the pain. It helps. (Party heals 40%, lead +1 RESOLVE.)', fx: g => { g.healAll(0.4); g.statUp(SBR.run.lead, 'res', 1); } } },
    ] }, [
    { deed: 'Learned the Ripple from the Breathing Man.', rep: { naples: 1 }, fail: { deed: 'Fell off the Breathing Man\'s pole, and learned the Ripple from his student\'s fists.' } },
    { deed: 'Beat the Breathing Man\'s student, and learned the Ripple.', rep: { naples: 1 } },
    { deed: 'Took a breathing lesson from an old man on a pole.' },
  ]);
  ev({ id: 'cust_mask', acts: [2, 3, 4], title: 'The Stone Mask', blurb: 'A smuggler\'s wagon, and something wrapped in sackcloth.', icon: 'skull', art: 'smuggler', cond: isCustom,
    text: 'Smugglers from Mexico have a crate marked FRAGILE. Inside, wrapped in sackcloth: a stone mask with a screaming face. One of the smugglers has blood on his hand and bone needles sticking out of his forehead. He is not breathing, and he is still standing.',
    get html() { return html(this.text, 'vampire'); },
    choices: [
      { label: 'Put on the mask, and bleed on it', ok: { text: 'Needles pierce your skull. The world goes red and very sharp. The smugglers who touched it turn on you, hungry.', fx: g => g.takePath('vampire'), fight: { enemies: ['mask_zombie', 'mask_zombie', 'outlaw'] } } },
      { label: 'Sell the mask to a collector in town (+$150)', ok: { text: 'He pays in gold and asks no questions. You feel better when it\'s gone.', fx: g => g.money(150) } },
      { label: 'Smash it with a rock', ok: { text: 'It cracks like an egg. Something inside the stone screams. A priest in the next town hears about it and blesses you.', fx: g => g.healAll(0.3), fight: { enemies: ['mask_zombie', 'mask_zombie'] } } },
    ] }, [
    { deed: 'Put on a Stone Mask and became a vampire.', rep: { vatican: -3, law: -1 }, flag: 'vampire' },
    { deed: 'Sold a Stone Mask to a collector.', rep: { law: -1 } },
    { deed: 'Smashed a Stone Mask.', rep: { vatican: 2 } },
  ]);
  ev({ id: 'cust_surgeons', acts: [2, 3, 4, 5], title: 'The Field Surgeons', blurb: 'German doctors with a wagon full of steel parts.', icon: 'heart', art: 'surgeon', weight: 6,
    cond: g => isCustom(g) && (SBR.run.flags.customFell || (() => { const m = SBR.run.party.find(x => SBR.isPU(x.id)); return m && m.hp < m.maxHp * 0.3; })()),
    text: 'You are in bad shape. A wagon stops beside you, and a man in a Prussian cap and a monocle looks down. "Ja. This one is broken in a very interesting way. Colonel von Stroheim would approve. We can rebuild you. Better."',
    get html() { return html(this.text, 'cyborg'); },
    choices: [
      { label: 'Let them rebuild you', ok: { text: 'You wake up three days later. Something in your chest ticks. Your arm has a gun in it. "German science," the surgeon says, "is the best in the world."', fx: g => { g.takePath('cyborg'); g.healAll(1); g.pace(-10); } } },
      { label: 'Just let them patch you up ($40)', cost: { money: 40 }, ok: { text: 'Morphine, stitches, and a lecture about hygiene. (Party heals 60%.)', fx: g => g.healAll(0.6) } },
      { label: 'Steal their supplies while they sleep (LUCK)', check: { stat: 'luck', dc: 14 }, ok: { text: 'Bandages, steel, and a strange lamp. (3 Cyborg Scrap, 2 Tonio’s Mineral Water.)', fx: g => { g.mat('scrap', 3); g.item('bandage'); g.item('bandage'); } }, fail: { text: 'The surgeon wakes up with a pistol. "Undankbar."', fight: { enemies: ['soldier', 'soldier'] } } },
    ] }, [
    { deed: 'Was rebuilt by German field surgeons.', rep: { president: -1 }, flag: 'cyborg' },
    { deed: 'Was patched up by German field surgeons.' },
    { deed: 'Robbed the German field surgeons.', rep: { law: -1 }, fail: { deed: 'Was caught robbing German surgeons.', rep: { law: -1 } } },
  ]);
  ev({ id: 'cust_rumour', acts: [2, 3, 4, 5], title: 'The Meteorite Rumour', blurb: 'A dying prospector wants someone to hear his story.', icon: 'search', art: 'miner', weight: 1,
    cond: g => isCustom(g) && !SBR.run.flags.arrowRumour,
    text: '"Six arrowheads," the prospector wheezes. "Cut from a meteorite that fell in Greenland. Get cut by one, you get a... a ghost that fights for you. Or you die. Most die." He grips your sleeve. "A man in a bowler hat has one. He\'s riding the race."',
    choices: [
      { label: 'Stay with him until the end', ok: { text: 'He dies at dawn. In his pocket: a sketch of the arrowhead and the name of a town.', fx: g => { g.flag('arrowRumour'); g.xp(15); } } },
      { label: 'Take his map and ride on', ok: { text: 'He curses you, weakly. The map is good.', fx: g => { g.flag('arrowRumour'); g.pace(3); } } },
      { label: 'It\'s a fever dream', ok: { text: 'You leave him water and ride on. Some doors stay closed.', fx: g => g.item('canteen') } },
    ] }, [
    { deed: 'Heard a dying prospector\'s story about the Arrow.', rep: { racers: 1 }, flag: 'arrowRumour' },
    { deed: 'Took a dying prospector\'s map.', rep: { racers: -1 }, flag: 'arrowRumour' },
    { deed: 'Ignored a story about a meteorite arrow.' },
  ]);
  ev({ id: 'cust_collector', acts: [3, 4, 5], type: 'elite', title: 'The Man in the Bowler Hat', blurb: 'The Arrow Collector. He knows why you\'re here.', icon: 'skull', art: 'collector', weight: 5,
    cond: g => isCustom(g) && SBR.run.flags.arrowRumour && !(SBR.run.trinkets || []).includes('stand_arrow') && !SBR.run.flags.arrowGone,
    text: 'He is waiting at the crossroads, holding a golden arrowhead in a gloved hand. "The prospector talked. They always do." He smiles. "I have been cut by this Arrow four times, and I have had four different Stands. It will not choose you. But you are welcome to try and take it."',
    choices: [
      { label: 'Take it from him', ok: { text: 'Four Stands, one after another.', fight: { enemies: ['arrow_collector', 'agent'], elite: true, after: g => { g.trinket('stand_arrow'); g.later('arrow_chooses', 1, 2); } } } },
      { label: 'Buy it ($300)', cost: { money: 300 }, ok: { text: '"Everything has a price," he says, sadly, and hands it over. "It will still choose."', fx: g => { g.trinket('stand_arrow'); g.later('arrow_chooses', 1, 2); } } },
      { label: 'Walk away', ok: { text: 'He tips his hat. "Another time, perhaps. Or never."', fx: g => g.pace(2) } },
    ] }, [
    { deed: 'Took the Stand Arrow from the Arrow Collector.', rep: { racers: 1 } },
    { deed: 'Bought the Stand Arrow from the Arrow Collector.' },
    { deed: 'Walked away from the Stand Arrow.' },
  ]);
  ev({ id: 'cust_aja', acts: [3, 4, 5], title: 'The Red Stone of Aja', blurb: 'A jeweller with a red stone he won\'t sell.', icon: 'star', art: 'cardsharp', weight: 2,
    cond: g => { const m = SBR.run.party.find(x => SBR.isPU(x.id)); return SBR.isPU(SBR.run.lead) && m && ['hamon', 'vampire'].includes(m.path) && !(SBR.run.trinkets || []).includes('aja_stone'); },
    text: 'A jeweller in a railroad town keeps a red stone in a velvet box. When sunlight touches it, a beam of red light burns a hole in the wall. "The Red Stone of Aja," he says. "From Rome. It is not for sale." Then he sees your eyes, and names a price.',
    choices: [
      { label: 'Buy it ($280)', cost: { money: 280 }, ok: { text: 'The stone is warm in your hand. Something in your blood answers it.', fx: g => { g.trinket('aja_stone'); g.flag(SBR.run.party.find(x => SBR.isPU(x.id)).path === 'hamon' ? 'ajaHamon' : 'ajaVampire'); } } },
      { label: 'Steal it (LUCK)', check: { stat: 'luck', dc: 16 }, ok: { text: 'Out of the window, stone in hand, before the jeweller has finished shouting.', fx: g => { g.trinket('aja_stone'); g.flag(SBR.run.party.find(x => SBR.isPU(x.id)).path === 'hamon' ? 'ajaHamon' : 'ajaVampire'); } }, fail: { text: 'His guards have shotguns.', fight: { enemies: ['casino_thug', 'casino_thug', 'outlaw'], elite: true } } },
      { label: 'Leave it', ok: { text: 'Some power is not meant to be held.', fx: g => g.xp(10) } },
    ] }, [
    { deed: 'Bought the Red Stone of Aja.', rep: { racers: 0 } },
    { deed: 'Stole the Red Stone of Aja.', rep: { law: -2 }, fail: { deed: 'Tried to steal the Red Stone of Aja.', rep: { law: -1 } } },
    { deed: 'Left the Red Stone of Aja where it was.' },
  ]);
  SBR.EVENTS.push(...E);
  SBR.FLAG_THREAT = SBR.FLAG_THREAT || {};
})();

/* The Arrow Chooses: a follow-up card that arrives the stage after you get the Arrow */
SBR.CAMPAIGN_EVENTS.push({ id: 'arrow_chooses', type: 'event', title: 'The Arrow Chooses', blurb: 'The arrowhead is humming in your saddlebag.', icon: 'star', get art() { return SBR.run ? SBR.run.lead : 'custom'; }, reveals: 'The Arrow made its choice.',
  cond: g => SBR.isPU(SBR.run.lead) && (SBR.run.trinkets || []).includes('stand_arrow') && g.canTakePath(SBR.run.lead),
  text: 'At night the arrowhead hums louder, and it points. Always at you. You know what it wants. Most of the people it cuts, it kills.',
  choices: [
    { label: 'Cut yourself with the Arrow (RESOLVE)', check: { stat: 'res', dc: 15, who: 'custom' },
      ok: { text: 'The Arrow goes in, and something comes out. A figure stands behind you, and it moves when you think.', fx: g => g.defer(() => SBR.standPick(g)) },
      fail: { text: 'The Arrow rejects you. You wake up bleeding in the dirt, alive, barely. It is still humming. It will ask again.', fx: g => { const m = SBR.run.party.find(x => SBR.isPU(x.id)); if (m) m.hp = Math.max(1, Math.round(m.hp - m.maxHp * 0.4)); g.exhaust(SBR.run.lead); SBR.campaign.world().keys['done:arrow_chooses'] = false; g.later('arrow_chooses', 4, 7); } } },
    { label: 'Not yet', ok: { text: 'You wrap it in three layers of cloth. It keeps humming.', fx: g => { SBR.campaign.world().keys['done:arrow_chooses'] = false; g.later('arrow_chooses', 3, 6); } } },
  ] });
Object.assign(SBR.CONSEQ, {
  'arrow_chooses:0': { deed: 'Was chosen by the Stand Arrow.', rep: { racers: 1 }, once: false },
  'arrow_chooses:0:fail': { deed: 'Was rejected by the Stand Arrow, and lived.', once: false },
  'arrow_chooses:1': { deed: 'Kept the Stand Arrow wrapped in cloth.', once: false },
});
/** the Arrow shows three Stands; the rider takes one */
SBR.standPick = g => {
  const pool = SBR.util.shuffle(SBR.CUSTOM_STANDS.slice()).slice(0, 3);
  const ev = { title: 'Your Stand', art: SBR.run.lead, text: 'Three shapes flicker behind you, one after another. Only one of them will stay.',
    html: 'Three shapes flicker behind you, one after another. Only one of them will stay.' + pool.map(id => { const P = SBR.PATHS[id]; return `<span class="ev-path" style="--pc:${P.color}"><b>${P.name}</b> (Part ${P.part}): ${P.desc}<br><i>${P.passive}</i></span>`; }).join(''),
    choices: pool.map(id => ({ label: `「${SBR.PATHS[id].name}」`, id })) };
  return SBR.ui.eventPanel(ev).then(ch => {
    const r = SBR.run; const i = (r.trinkets || []).indexOf('stand_arrow'); if (i >= 0) r.trinkets.splice(i, 1);
    r.flags.arrowGone = true;
    g.takePath(ch.id);
  });
};
/* the Arrow can also turn up at the heart of a detour, once you know it exists */
Object.values(SBR.AREAS).forEach(A => {
  const rw = A.reward;
  A.reward = g => { rw(g); const r = SBR.run; if (SBR.isPU(r.lead) && r.flags.arrowRumour && !r.flags.arrowGone && !(r.trinkets || []).includes('stand_arrow') && g.canTakePath(SBR.run.lead) && Math.random() < 0.4) { g.trinket('stand_arrow'); g.later('arrow_chooses', 1, 2); } };
});

/* ---------------- 8. Character creator ---------------- */
SBR.customUI = (() => {
  const SWATCH = {
    skin: ['#fff0e4', '#fbe0cc', '#f6d2b0', '#f0c8a0', '#e0b088', '#c8905a', '#a0683a', '#7a4a2a', '#5a3420', '#9ab88a', '#c8c0e8'],
    hair: ['#1a1020', '#3a2a1a', '#6a3a1a', '#a0602a', '#c86a2a', '#c8a060', '#f4d35e', '#e8e8e8', '#c8323c', '#e8508a', '#5b3a8c', '#2a3a8a', '#3fb8a9', '#3a8c4a'],
    eye: ['#3a6a9a', '#4aa3df', '#3fb8a9', '#3a8c4a', '#6a3a1a', '#1a1020', '#8a3ac8', '#e8508a', '#c8323c', '#f2c14e', '#ffffff'],
    lip: ['#b06060', '#d9607a', '#e0407a', '#c8506a', '#a0306a', '#8a4a3a', '#5a2a3a', '#e8742a', '#5b3a8c', '#3a8c4a'],
    color: ['#1a1020', '#3a2a1a', '#6a4a2a', '#8a1a2a', '#c8323c', '#e8742a', '#f2c14e', '#3a8c4a', '#3fb8a9', '#9fc7e8', '#3b5bb5', '#5b3a8c', '#e8508a', '#8a8aa0', '#e8d8b8', '#f6f4ee'],
  };
  const BGS = [['#e8742a', '#3a2a6a'], ['#6b5bd6', '#e8508a'], ['#3fb8a9', '#f2c14e'], ['#2a7a8a', '#8adf6a'], ['#1f2a6a', '#c8323c'], ['#f2c14e', '#1a1020'], ['#e8508a', '#6b5bd6'], ['#c8323c', '#e8b36a'], ['#1a1a1a', '#c8323c'], ['#9fc7e8', '#e8e0c0'], ['#3a6a3a', '#c8e04a'], ['#f09ac0', '#fff3c0'], ['#5a3a2a', '#e8c070'], ['#2a2a3a', '#8a9ab0']];
  const o = s => s.split(',').map(x => { const [v, l] = x.split(':'); return [v === '-' ? null : v, l || v.replace(/^./, c => c.toUpperCase())]; });
  // each part: tab, key, label, options [value, label], thumbnail crop, colour rows shown with it
  const PARTS = [
    { tab: 'face', key: 'face', label: 'Shape', opts: o('-:Classic,square,long,round,pointed,broad:Broad Jaw'), view: '18 22 64 64', pal: ['skin'] },
    { tab: 'face', key: 'eyes', label: 'Eyes', opts: o('-:Classic,sharp,round:Big,sleepy,lashes:JoJo Lashes,narrow:Squint,glare,closed'), view: '28 38 44 34', pal: ['eye'] },
    { tab: 'face', key: 'brows', label: 'Brows', opts: o('-:Classic,thick,thin,angry,worried,arched,bushy,scarred'), view: '28 36 44 32' },
    { tab: 'face', key: 'nose', label: 'Nose', opts: o('-:Classic,button,hook,broad,pointed,none:Minimal'), view: '36 48 28 28', pal: ['skin'] },
    { tab: 'face', key: 'mouth', label: 'Mouth', opts: o('-:Lips,smirk,smile,teeth:Grin,gritted,frown,flat:Stoic,shout,tongue:Cheeky,gogo:GO! GO!'), view: '36 62 28 24', pal: ['lip'] },
    { tab: 'face', key: 'marks', label: 'Marks', opts: o('-:None,scar:Cheek X,eyescar:Eye Scar,freckles,blush,jojolines:Ink Lines,star:Star Mark,warpaint:War Paint,facetat:Tattoo,mole:Beauty Mark,stitches,tears'), view: '20 30 60 60' },
    { tab: 'hair', key: 'hairStyle', label: 'Style', opts: o('short,shaggy,long,swept,curls,bob,bobbang:Bangs,afro,verylong:Very Long,bald,spiky,bowl,pompadour,braids,mohawk,flowing,ponytail,slicked:Slicked,dreads,gyrostyle:Zeppeli,topknot:Top Knot'), view: '2 0 96 110', pal: ['hair'], noHat: true },
    { tab: 'hair', key: 'facial', label: 'Facial Hair', opts: o('-:Clean,stubble,mustache,handlebar,horseshoe,goatee,beard,fullbeard:Full Beard,chops:Mutton Chops,soulpatch:Soul Patch'), view: '24 46 52 54', pal: ['hair'] },
    { tab: 'hat', key: 'hat', label: 'Headwear', opts: o('-:Bare,cowboy,stetson,fedora,gaucho,straw,sombrero,bowler,tophat:Top Hat,porkpie:Pork Pie,newsboy,beret,cap,kepi,pickel:Pickelhaube,coonskin,cavalier,turban,hood,bandana,headband,jockey,aviator,goggles,helm,dome,bonnet,veil,ribbon,checker,johnny:Johnny,gyro:Gyro'), view: '0 0 100 96', pal: ['hatColor', 'hat2'] },
    { tab: 'acc', key: 'acc', label: 'Accessories', multi: 3, opts: o('earring:Hoops,dangle:Gem Drops,mask:Bandana Mask,eyepatch,glasses,shades,monocle,cigar,cigarette,straw:Wheat Straw,badge:Sheriff Star,bolo:Bolo Tie,scarf,kerchief,cross:Cross,beads,pendant,goggles:Neck Goggles,bowtie:Bow Tie,bandolier,medal,starpin:Star Pin,bandage,feather,flower:Rose'), view: '12 26 76 86', pal: ['accColor'] },
    { tab: 'outfit', key: 'style', label: 'Cut', opts: o('-:Shirt,duster,poncho,vest,jockey:Silks,priest:Clergy,military,turtleneck'), view: '8 60 84 60', pal: ['outfit', 'outfit2'] },
  ];
  const PAL = { skin: ['Skin', 'skin'], hair: ['Hair', 'hair'], eye: ['Eyes', 'eye'], lip: ['Lips', 'lip'], hatColor: ['Hat', 'color'], hat2: ['Hat band', 'color'], accColor: ['Accessory', 'color'], outfit: ['Outfit', 'color'], outfit2: ['Trim', 'color'] };
  const TABS = [['face', 'Face', '顔'], ['hair', 'Hair', '髪'], ['hat', 'Headwear', '帽'], ['acc', 'Accessories', '飾'], ['outfit', 'Outfit', '服'], ['colors', 'Colours', '色'], ['name', 'Name', '名']];
  const LOOKS = [
    ['Outlaw', { hat: 'cowboy', hatColor: '#3a2a1a', hat2: '#c8323c', acc: ['mask', 'bandolier'], facial: 'stubble', style: 'duster', outfit: '#6a4a2a', outfit2: '#e8d8b8', accColor: '#c8323c', eyes: 'sharp', brows: 'angry' }],
    ['Gambler', { hat: 'fedora', hatColor: '#1a1020', hat2: '#c8323c', acc: ['cigar', 'bowtie'], facial: 'mustache', style: 'vest', outfit: '#1a1020', outfit2: '#f6f4ee', accColor: '#c8323c', eyes: 'sleepy', mouth: 'smirk' }],
    ['Lawman', { hat: 'stetson', hatColor: '#e8d8b8', hat2: '#3a2a1a', acc: ['badge', 'kerchief'], facial: 'horseshoe', style: 'vest', outfit: '#3a2a1a', outfit2: '#e8d8b8', accColor: '#3b5bb5', brows: 'thick', mouth: 'flat' }],
    ['Padre', { hat: null, hairStyle: 'slicked', acc: ['cross', 'glasses'], style: 'priest', outfit: '#1a1020', outfit2: '#f2c14e', eyes: 'closed', mouth: 'smile' }],
    ['Jockey', { hat: 'jockey', hatColor: '#e8508a', hat2: '#f2c14e', acc: ['goggles'], style: 'jockey', outfit: '#e8508a', outfit2: '#f2c14e', eyes: 'round', mouth: 'teeth' }],
    ['Dandy', { hat: null, hairStyle: 'pompadour', acc: ['starpin', 'earring', 'flower'], style: 'turtleneck', outfit: '#5b3a8c', outfit2: '#f2c14e', eyes: 'lashes', marks: 'jojolines', mouth: 'smirk', lip: '#a0306a' }],
    ['Drifter', Object.assign({}, SBR.CUSTOM_DEFAULT.portrait, { skin: undefined, hair: undefined, eye: undefined })],
  ];
  const TITLES = ['Nobody from Nowhere', 'The Fastest Gun in Kansas', 'Stray of the Desert', 'Ex-Jockey, Ex-Con', 'Ripple in the Dust', 'Heir to Nothing', 'The Silent Rider', 'Bounty on Their Head', 'Last of the Line', 'The Gambler'];
  const FIRST = ['Jesse', 'Calamity', 'Doc', 'Wyatt', 'Belle', 'Django', 'Rosa', 'Hank', 'Ezra', 'Luz', 'Silas', 'Nell', 'Cash', 'Dolores'], LAST = ['Wilde', 'Vargas', 'Blackwood', 'Steele', "O'Hara", 'Moreau', 'Cassidy', 'Kane', 'Duquesne', 'Ramírez'];
  const OLD = { mustache: ['facial', 'mustache'], beard: ['facial', 'beard'], sideburns: ['facial', 'chops'], scar: ['marks', 'eyescar'], goldteeth: ['mouth', 'gogo'], grin: ['mouth', 'teeth'], tattoo: ['marks', 'facetat'], shades: ['acc'], monocle: ['acc'], scarf: ['acc'], feather: ['acc'], cross: ['acc'], mask: ['acc'] };
  /** old saves used a single `extra`; move it onto the new parts so the creator can edit it */
  const migrate = p => {
    const m = p.extra && OLD[p.extra];
    if (m) { if (m[0] === 'acc') p.acc = (p.acc || []).concat(p.extra).slice(-3); else if (!p[m[0]]) p[m[0]] = m[1]; p.extra = null; }
    p.acc = (p.acc || []).slice(); if (!p.bg) p.bg = SBR.CUSTOM_DEFAULT.portrait.bg.slice();
    return p;
  };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  // accessories that sit in the same place: taking one drops the others
  const CLASH = [['glasses', 'shades', 'monocle', 'eyepatch'], ['cigar', 'cigarette', 'straw', 'mask'], ['scarf', 'kerchief'], ['cross', 'beads', 'pendant'], ['bolo', 'bowtie']];
  const addAcc = (list, v, max = 3) => { const g = CLASH.find(c => c.includes(v)) || []; return list.filter(a => a === v || !g.includes(a)).filter(a => a !== v).concat(v).slice(-max); };
  const vals = k => PARTS.find(x => x.key === k).opts.map(x => x[0]);
  const randomPart = (p, k) => {
    if (k === 'acc') { const n = pick([0, 1, 1, 2, 2, 3]); p.acc = []; SBR.util.shuffle(vals('acc').slice()).forEach(a => { if (p.acc.length < n && !p.acc.some(b => CLASH.some(c => c.includes(a) && c.includes(b)))) p.acc.push(a); }); return; }
    if (k === 'facial' && Math.random() < 0.45) { p.facial = null; return; }
    if (k === 'marks' && Math.random() < 0.5) { p.marks = null; return; }
    p[k] = pick(vals(k));
  };
  const randomColors = p => Object.assign(p, { skin: pick(SWATCH.skin.slice(0, 9)), hair: pick(SWATCH.hair), eye: pick(SWATCH.eye), lip: pick(SWATCH.lip), hatColor: pick(SWATCH.color), hat2: pick(SWATCH.color), outfit: pick(SWATCH.color), outfit2: pick(SWATCH.color), accColor: pick(SWATCH.color), bg: pick(BGS).slice() });
  const randomPortrait = () => { const p = randomColors({}); PARTS.forEach(x => randomPart(p, x.key)); return p; };
  const thumb = (p, view, noHat) => SBR.art.portrait('custom', { override: Object.assign({}, p, noHat ? { hat: null } : {}) }).replace('viewBox="0 0 100 120"', `viewBox="${view}" preserveAspectRatio="xMidYMid slice"`);

  function creator(onDone) {
    const el = SBR.util.el, ui = SBR.ui;
    const cur = SBR.customRider();
    const p = migrate(cur.portrait);
    let tab = 'face', sub = 'face';
    const box = el('div', { class: 'creator' });
    const stage = el('div', { class: 'cr-stage' }), side = el('div', { class: 'cr-side' });
    const prev = el('div', { class: 'cr-prev' }), plate = el('div', { class: 'cr-plate' });
    const click = () => SBR.audio.play('click');
    const drawPrev = () => { SBR.art.addPortrait({ custom: p }); prev.innerHTML = SBR.art.portrait('custom'); drawPlate(); };
    const drawPlate = () => { plate.innerHTML = ''; plate.append(el('b', {}, (cur.name || '').trim() || SBR.CUSTOM_DEFAULT.name), el('i', {}, (cur.title || '').trim() || SBR.CUSTOM_DEFAULT.title)); };
    const update = () => { drawPrev(); drawSide(); };
    const palRow = k => {
      const [label, list] = PAL[k];
      const row = el('div', { class: 'cr-pal' }, el('span', {}, label));
      const sw = el('div', { class: 'cr-sw' });
      SWATCH[list].forEach(c => { const b = el('button', { class: 'cr-dot' + ((p[k] || '').toLowerCase() === c ? ' on' : ''), style: { background: c }, title: label + ' ' + c, 'aria-label': label + ' ' + c }); b.onclick = () => { p[k] = c; click(); update(); }; sw.appendChild(b); });
      row.appendChild(sw); return row;
    };
    const grid = part => {
      const g = el('div', { class: 'cr-grid' + (part.key === 'hat' || part.key === 'hairStyle' || part.key === 'acc' ? ' big' : '') });
      const chosen = part.multi ? p.acc : null;
      part.opts.forEach(([v, label]) => {
        const on = part.multi ? chosen.includes(v) : (p[part.key] || null) === v || (part.key === 'hairStyle' && !p.hairStyle && v === 'short');
        const tp = Object.assign({}, p, part.multi ? { acc: [v] } : { [part.key]: v });
        const t = el('button', { class: 'cr-tile' + (on ? ' on' : ''), title: label, 'aria-pressed': on ? 'true' : 'false' },
          el('div', { class: 'cr-th', html: thumb(tp, part.view, part.tab === 'face' || part.tab === 'hair') }), el('span', {}, label));
        if (part.multi && on) t.appendChild(el('em', {}, String(chosen.indexOf(v) + 1)));
        t.onclick = () => {
          if (part.multi) { p.acc = on ? chosen.filter(a => a !== v) : addAcc(chosen, v, part.multi); }
          else p[part.key] = v;
          click(); update();
        };
        g.appendChild(t);
      });
      return g;
    };
    const drawSide = () => {
      const keep = side.querySelector('.cr-panel'), top = keep ? keep.scrollTop : 0;
      side.innerHTML = '';
      const tabs = el('div', { class: 'cr-tabs', role: 'tablist' });
      TABS.forEach(([id, label, kj]) => { const b = el('button', { class: 'cr-tab' + (tab === id ? ' on' : ''), role: 'tab', 'aria-selected': tab === id ? 'true' : 'false', html: `<i>${kj}</i><span>${label}</span>` }); b.onclick = () => { if (tab === id) return; tab = id; const f = PARTS.find(x => x.tab === id); sub = f ? f.key : null; click(); drawSide(); side.querySelector('.cr-panel').scrollTop = 0; }; tabs.appendChild(b); });
      side.appendChild(tabs);
      const parts = PARTS.filter(x => x.tab === tab);
      const panel = el('div', { class: 'cr-panel' });
      if (parts.length) {
        const part = parts.find(x => x.key === sub) || parts[0];
        const head = el('div', { class: 'cr-head' });
        if (parts.length > 1) { const subs = el('div', { class: 'cr-subs' }); parts.forEach(x => { const b = el('button', { class: 'cr-sub' + (x === part ? ' on' : '') }, x.label); b.onclick = () => { sub = x.key; click(); drawSide(); side.querySelector('.cr-panel').scrollTop = 0; }; subs.appendChild(b); }); head.appendChild(subs); }
        else head.appendChild(el('div', { class: 'cr-h' }, part.label + (part.multi ? ` · pick up to ${part.multi}` : '')));
        const dice = el('button', { class: 'cr-dice', title: 'Shuffle ' + part.label }, '⚄ Shuffle');
        dice.onclick = () => { randomPart(p, part.key); click(); update(); };
        head.appendChild(dice);
        if (part.multi) { const clr = el('button', { class: 'cr-dice' }, `✕ Clear (${p.acc.length}/${part.multi})`); clr.onclick = () => { p.acc = []; click(); update(); }; head.appendChild(clr); }
        panel.appendChild(head);
        (part.pal || []).forEach(k => panel.appendChild(palRow(k)));
        panel.appendChild(grid(part));
      } else if (tab === 'colors') {
        Object.keys(PAL).forEach(k => panel.appendChild(palRow(k)));
        panel.appendChild(el('div', { class: 'cr-h' }, 'Backdrop'));
        const bgs = el('div', { class: 'cr-bgs' });
        BGS.forEach(([a, b]) => { const on = p.bg[0] === a && p.bg[1] === b; const t = el('button', { class: 'cr-bg' + (on ? ' on' : ''), style: { background: `linear-gradient(135deg, ${a} 50%, ${b} 50%)` }, 'aria-label': 'Backdrop ' + a + ' ' + b }); t.onclick = () => { p.bg = [a, b]; click(); update(); }; bgs.appendChild(t); });
        panel.appendChild(bgs);
        [0, 1].forEach(i => { const row = el('div', { class: 'cr-pal' }, el('span', {}, i ? 'Backdrop 2' : 'Backdrop 1')); const sw = el('div', { class: 'cr-sw' }); SWATCH.color.concat(['#6b5bd6', '#2a7a8a']).forEach(c => { const b = el('button', { class: 'cr-dot' + (p.bg[i] === c ? ' on' : ''), style: { background: c }, 'aria-label': 'Backdrop ' + c }); b.onclick = () => { p.bg = i ? [p.bg[0], c] : [c, p.bg[1]]; click(); update(); }; sw.appendChild(b); }); row.appendChild(sw); panel.appendChild(row); });
      } else {
        const name = el('input', { type: 'text', maxlength: 24, value: cur.name, placeholder: SBR.CUSTOM_DEFAULT.name });
        const title = el('input', { type: 'text', maxlength: 32, value: cur.title, placeholder: SBR.CUSTOM_DEFAULT.title });
        name.oninput = () => { cur.name = name.value; drawPlate(); }; title.oninput = () => { cur.title = title.value; drawPlate(); };
        const dn = el('button', { class: 'cr-dice' }, '⚄ Random name'); dn.onclick = () => { cur.name = pick(FIRST) + ' ' + pick(LAST); name.value = cur.name; click(); drawPlate(); };
        panel.append(el('label', { class: 'cr-field' }, el('span', {}, 'Name'), name), el('div', { class: 'cr-chips' }, dn),
          el('label', { class: 'cr-field' }, el('span', {}, 'Title'), title));
        const chips = el('div', { class: 'cr-chips' });
        TITLES.forEach(t => { const b = el('button', { class: 'cr-chip' + (cur.title === t ? ' on' : '') }, t); b.onclick = () => { cur.title = t; title.value = t; click(); drawPlate(); chips.querySelectorAll('.cr-chip').forEach(c => c.classList.toggle('on', c === b)); }; chips.appendChild(b); });
        panel.appendChild(chips);
      }
      side.appendChild(panel);
      panel.scrollTop = top;
    };
    const acts = el('div', { class: 'cr-acts' },
      ui.btn('⚄ Randomise', () => { Object.assign(p, randomPortrait()); click(); update(); }, 'btn-ghost btn-small'),
      ui.btn('Save rider ▸', () => { SBR.meta.custom = { name: (cur.name || '').trim() || SBR.CUSTOM_DEFAULT.name, title: (cur.title || '').trim() || SBR.CUSTOM_DEFAULT.title, portrait: p }; SBR.saveMeta(); SBR.applyCustom(); SBR.audio.play('select'); ui.closeModal(w); if (onDone) onDone(); }, 'btn-primary'));
    const looks = el('div', { class: 'cr-looks' }, el('span', {}, 'Quick looks'));
    LOOKS.forEach(([n, L]) => { const b = el('button', { class: 'cr-chip' }, n); b.onclick = () => { PARTS.forEach(x => { p[x.key] = x.multi ? [] : x.key === 'hairStyle' ? p.hairStyle : null; }); Object.entries(L).forEach(([k, v]) => { if (v !== undefined) p[k] = Array.isArray(v) ? v.slice() : v; }); click(); update(); }; looks.appendChild(b); });
    stage.append(el('div', { class: 'cr-frame' }, prev, plate), looks, acts);
    box.append(stage, side);
    drawPrev(); drawSide();
    const w = SBR.ui.modal(box, { title: 'Create Your Rider', size: 'xl', cls: 'creator-modal', onClose: () => { SBR.applyCustom(); } });
  }
  return { creator, PARTS, SWATCH, randomPortrait, migrate };
})();

/* ---------------- 9. Story: the custom rider's own opening ---------------- */
(() => {
  const S = SBR.STORY;
  const wrapVar = (id, fn) => { const s = S[id]; if (!s) return; const prev = s.variants; s.variants = () => { const r = SBR.run; const v = r && SBR.isPU(r.lead) ? fn(r) : null; return v || (prev ? prev() : null); }; };
  const me = () => SBR.CHARS.custom.short;
  wrapVar('act1_intro', r => r.solo ? [
    { narr: 'Gyro took the 1st Stage, and was immediately penalised for endangering Sandman. The 2nd Stage stretches 1,200 kilometres across the Arizona Desert.' },
    { narr: `${me()} rides alone. Ahead, a man with steel balls and a boy on a black horse ride together. They are rivals now, like everyone else.` },
    { who: 'custom', text: 'Fifty million dollars. Nobody\'s going to hand it to me.' },
    { narr: 'You ride your own race. Each stage, choose an encounter.' },
  ] : [
    { narr: 'Gyro took the 1st Stage, and was immediately penalised for endangering Sandman. The 2nd Stage stretches 1,200 kilometres across the Arizona Desert.' },
    { who: 'johnny', text: `You too? Fine. ${me()}, right? Stay close. Gyro doesn't wait for anyone.` },
    { who: 'gyro', text: 'Nyo-ho~. A stray and a wheelchair boy. What a team.' },
    { who: 'custom', text: 'I don\'t need a team. But I\'ll take one.' },
    { narr: 'JOHNNY and GYRO ride with you. Each stage, choose an encounter.' },
  ]);
})();
/* riding your own race: Johnny becomes one more rival on the leaderboard */
SBR.RIVALS.johnny = { name: 'Johnny Joestar', portrait: 'johnny', speed: 0.9, out: r => !(r && r.solo) };

/* ---------------- 10. Ride with Johnny and Gyro, or ride alone: the custom rider's first choice ---------------- */
(() => {
  // the opening scene is the same either way now; the choice comes on the road
  const S = SBR.STORY.act1_intro, prev = S.variants;
  S.variants = () => { const r = SBR.run; if (r && SBR.isPU(r.lead)) return [
    { narr: 'Gyro took the 1st Stage, and was immediately penalised for endangering Sandman. The 2nd Stage stretches 1,200 kilometres across the Arizona Desert.' },
    { narr: `${SBR.CHARS[r.lead].short} rides alone into the heat. Somewhere ahead, a man with steel balls and a boy on a black horse are riding together.` },
    { who: r.lead, text: r.lead === 'sukuna' ? 'A horse race. How quaint. Entertain me, then.' : 'Fifty million dollars. Nobody\'s going to hand it to me.' },
  ]; return prev ? prev() : null; };
  const join = g => { SBR.run.solo = false; g.recruit('johnny'); g.recruit('gyro'); };
  SBR.CAMPAIGN_EVENTS.push({ id: 'cust_companions', acts: [1], type: 'event', title: 'Two Riders at the Well', blurb: 'A man with steel balls and a boy on a black horse.', icon: 'recruit', art: 'gyro',
    cond: g => SBR.isPU(SBR.run.lead) && SBR.run.solo && !SBR.run.flags.companionsChosen,
    text: 'At a well in the Arizona desert, a man in a strange hat is juggling steel balls for no one. The boy beside him sits on a black horse with his legs strapped to the saddle. "Johnny Joestar," the boy says. "That\'s Gyro. He says the desert kills people who ride it alone." Gyro grins, gold teeth spelling GO GO ZEPPELI. "Nyo-ho~. I said it kills idiots. It\'s not the same thing."',
    choices: [
      { label: 'Ride with them', ok: { text: 'Three riders leave the well together. Gyro complains about it for the rest of the day.', fx: g => { SBR.run.flags.companionsChosen = true; join(g); } } },
      { label: 'Race them to the next town. If you win, they ride with you (RIDING)', check: { stat: 'ride', dc: 12, who: 'custom' },
        ok: { text: 'You beat them by a length. Gyro laughs until he chokes. "Fine! Fine. You ride with us, stray." (+8 pace.)', fx: g => { SBR.run.flags.companionsChosen = true; g.pace(8); join(g); } },
        fail: { text: 'They beat you by a mile. "Come find us when you can keep up," Johnny calls back. You ride your own race.', fx: g => { SBR.run.flags.companionsChosen = true; g.pace(-4); } } },
      { label: 'Ride your own race', ok: { text: '"Suit yourself," Gyro says. Johnny watches you go. From now on, they are rivals like everyone else.', fx: g => { SBR.run.flags.companionsChosen = true; g.xp(20); g.pace(4); } } },
    ] });
  Object.assign(SBR.CONSEQ, {
    'cust_companions:0': { deed: 'Rode out of the Arizona desert with Johnny Joestar and Gyro Zeppeli.', rep: { naples: 1, racers: 1 } },
    'cust_companions:1': { deed: 'Beat Johnny and Gyro in a race to the next town, and rode with them.', rep: { naples: 1, racers: 2 }, fail: { deed: 'Lost a race to Johnny and Gyro, and rode alone.', rep: { racers: 1 } } },
    'cust_companions:2': { deed: 'Turned down Johnny Joestar and Gyro Zeppeli at a desert well.', rep: { racers: 1 } },
  });
})();

/* ---------------- 11. The Stand Arrow, in one encounter (Acts I-II) ---------------- */
(() => {
  // the old three-step chain is retired
  ['cust_rumour', 'cust_collector'].forEach(id => { const e = SBR.EVENTS.find(x => x.id === id); if (e) e.cond = () => false; });
  const can = g => SBR.isPU(SBR.run.lead) && g.canTakePath(SBR.run.lead) && !SBR.run.flags.arrowGone;
  const fate = g => { const id = SBR.util.pick(SBR.CUSTOM_STANDS); SBR.run.flags.arrowGone = true; g.takePath(id); if (SBR.tarotFate) g.defer(() => SBR.tarotFate(id)); return id; };
  const E = { id: 'cust_arrow', acts: [1, 2], type: 'event', title: 'The Meteorite Arrow', blurb: 'A man in a bowler hat, holding a golden arrowhead.', icon: 'star', art: 'collector', weight: 6, once: true, pace: -3, cond: can,
    text: 'At a crossroads a man in a bowler hat is turning a golden arrowhead over in his gloved fingers. "Cut from a meteorite," he says. "It gives some people a ghost that fights for them. It kills the rest." He holds it out, point first. "It hums near you. Interesting."',
    html: 'At a crossroads a man in a bowler hat is turning a golden arrowhead over in his gloved fingers. "Cut from a meteorite," he says. "It gives some people a ghost that fights for them. It kills the rest." He holds it out, point first. "It hums near you. Interesting."<span class="ev-path" style="--pc:#7a5ad0"><b>The Stand Arrow</b>: a chance at one of 12 Stands from Parts 3-6 (Star Platinum, Killer Queen, Gold Experience, King Crimson...). You can only ever carry one power.</span>',
    choices: [
      { label: 'Cut yourself with the Arrow (RESOLVE)', check: { stat: 'res', dc: 11 },
        ok: { text: 'The point goes in. Something steps out of you, and three shapes flicker, waiting for you to choose.', fx: g => { SBR.run.flags.arrowGone = true; g.defer(() => SBR.standPick(g)); } },
        fail: { text: 'You black out.', fx: g => { const m = SBR.run.party.find(x => SBR.isPU(x.id)); if (Math.random() < 0.5) { const id = fate(g); SBR.toast(`The Arrow chose for you: <b>${SBR.PATHS[id].name}</b>.`, 'good'); } else { if (m) m.hp = Math.max(1, Math.round(m.hp - m.maxHp * 0.4)); g.exhaust(SBR.run.lead); SBR.run.flags.arrowGone = true; SBR.toast('The Arrow rejected you, and crumbled to dust.', 'bad'); } } } },
      { label: 'Take it from him by force', ok: { text: '"Then earn it," he says, and a Stand flickers into him.', fight: { enemies: ['arrow_collector'], elite: true, after: g => { SBR.run.flags.arrowGone = true; g.defer(() => SBR.standPick(g)); } } } },
      { label: 'Buy it and let fate decide ($80)', cost: { money: 80 }, ok: { text: 'He takes the money and throws the Arrow at you before you can blink.', fx: g => { if (Math.random() < 0.7) { const id = fate(g); SBR.toast(`The Arrow chose: <b>${SBR.PATHS[id].name}</b>.`, 'good'); } else { SBR.run.flags.arrowGone = true; g.xp(25); SBR.toast('Nothing. The Arrow did not choose you. (+25 XP for the scare.)', 'bad'); } } } },
      { label: 'Walk away', ok: { text: '"Some people are wiser than they look," he says, and is gone.', fx: g => g.pace(3) } },
    ] };
  SBR.EVENTS.push(E);
  Object.assign(SBR.CONSEQ, {
    'cust_arrow:0': { deed: 'Cut yourself with the Stand Arrow, and chose your Stand.', rep: { racers: 1 } },
    'cust_arrow:0:fail': { deed: 'Cut yourself with the Stand Arrow, and let fate decide.' },
    'cust_arrow:1': { deed: 'Took the Stand Arrow from its keeper by force.', rep: { racers: 1 } },
    'cust_arrow:2': { deed: 'Bought a chance from the Stand Arrow.' },
    'cust_arrow:3': { deed: 'Walked away from the Stand Arrow.' },
  });
})();
