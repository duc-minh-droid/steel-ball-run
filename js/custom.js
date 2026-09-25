/* The custom rider: a racer you name and draw yourself. They start with nothing but a gun and a fist, and can earn one
   power on the road, borrowed from the other parts of JoJo: Hamon breathing, a Stone Mask, German science, or the
   Stand Arrow (12 famous Stands from Parts 3-6). Hamon and Vampire riders can go further with the Red Stone of Aja.
   Each power is a Path with char 'custom', so it reuses the Path system (takePath, pathAbilities, emblems). */
'use strict';

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
  if (!Object.getOwnPropertyDescriptor(SBR.CHARS.custom, 'stand')) Object.defineProperty(SBR.CHARS.custom, 'stand', { get: () => { const m = SBR.run && SBR.run.party.concat(SBR.run.reserve || []).find(x => x.id === 'custom'); const P = m && SBR.pathOf(m); return P ? P.name : 'None, yet'; } });
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
    if (m.id !== 'custom' || !SBR.run) return out;
    const f = SBR.run.flags, add = (k, v) => { out.bonus[k] = (out.bonus[k] || 0) + v; };
    if (f.ajaHamon) { add('holyDmg', 0.4); add('regen', 1); }
    if (f.ajaVampire) { add('sunburn', -1); add('dmg', 0.15); add('regen', 2); out.bonus.res = Object.assign({}, out.bonus.res); out.bonus.res.holy = (out.bonus.res.holy || 0) - 0.5; out.bonus.res.spin = (out.bonus.res.spin || 0) - 0.25; }
    return out;
  };
  const bonus = SBR.bonus;
  SBR.bonus = () => { const b = bonus(); const r = SBR.run; if (r && r.lead === 'custom') { const m = r.party.find(x => x.id === 'custom'); if (m && !m.path) b.xp = (b.xp || 0) + 0.1; } return b; };
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
  const isCustom = g => SBR.run.lead === 'custom' && g.canTakePath('custom');
  const E = [];
  const ev = (o, C) => { E.push(Object.assign({ type: 'event', icon: 'star', weight: 4, once: true, pace: -3 }, o)); C.forEach((c, i) => { if (!c) return; const { fail, ...ok } = c; SBR.CONSEQ[o.id + ':' + i] = ok; if (fail) SBR.CONSEQ[o.id + ':' + i + ':fail'] = fail; }); };
  const html = (text, pid) => { const P = SBR.PATHS[pid]; return `${text}<span class="ev-path" style="--pc:${P.color}"><b>Power: ${P.name}</b> — ${P.desc}<br><i>${P.passive}</i><br><small>You can only ever carry one power. Taking it closes the others.</small></span>`; };

  ev({ id: 'cust_hamon', acts: [1, 2, 3], type: 'trainer', title: 'The Breathing Man', blurb: 'An old man balanced on one finger on top of a pole.', icon: 'train', art: 'breather', cond: isCustom,
    text: 'On a mesa above the trail, an old man is standing on one finger on top of a wooden pole. He has been there since sunrise. "You breathe like a frightened horse," he calls down. "Come up here and I will teach you to breathe like the sun."',
    get html() { return html(this.text, 'hamon'); },
    choices: [
      { label: 'Climb the pole and breathe with him (RESOLVE)', check: { stat: 'res', dc: 13, who: 'custom' }, ok: { text: 'Hours pass. Your breath and your heartbeat fall into a rhythm, and your fingers glow. The Ripple.', fx: g => g.takePath('hamon') }, fail: { text: 'You fall off the pole. His student laughs, then offers to knock the breath into you instead.', fight: { enemies: ['t_hamon'], elite: true, after: g => g.takePath('hamon') } } },
      { label: 'Fight his student', ok: { text: '"Learn it the hard way, then."', fight: { enemies: ['t_hamon'], elite: true, after: g => g.takePath('hamon') } } },
      { label: 'Just ask for a breathing lesson', ok: { text: 'He teaches you to breathe out the pain. It helps. (Party heals 40%, lead +1 RESOLVE.)', fx: g => { g.healAll(0.4); g.statUp('custom', 'res', 1); } } },
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
    cond: g => isCustom(g) && (SBR.run.flags.customFell || (() => { const m = SBR.run.party.find(x => x.id === 'custom'); return m && m.hp < m.maxHp * 0.3; })()),
    text: 'You are in bad shape. A wagon stops beside you, and a man in a Prussian cap and a monocle looks down. "Ja. This one is broken in a very interesting way. Colonel von Stroheim would approve. We can rebuild you. Better."',
    get html() { return html(this.text, 'cyborg'); },
    choices: [
      { label: 'Let them rebuild you', ok: { text: 'You wake up three days later. Something in your chest ticks. Your arm has a gun in it. "German science," the surgeon says, "is the best in the world."', fx: g => { g.takePath('cyborg'); g.healAll(1); g.pace(-10); } } },
      { label: 'Just let them patch you up ($40)', cost: { money: 40 }, ok: { text: 'Morphine, stitches, and a lecture about hygiene. (Party heals 60%.)', fx: g => g.healAll(0.6) } },
      { label: 'Steal their supplies while they sleep (LUCK)', check: { stat: 'luck', dc: 14 }, ok: { text: 'Bandages, steel, and a strange lamp. (3 Scrap Iron, 2 Bandages.)', fx: g => { g.mat('scrap', 3); g.item('bandage'); g.item('bandage'); } }, fail: { text: 'The surgeon wakes up with a pistol. "Undankbar."', fight: { enemies: ['soldier', 'soldier'] } } },
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
    cond: g => { const m = SBR.run.party.find(x => x.id === 'custom'); return SBR.run.lead === 'custom' && m && ['hamon', 'vampire'].includes(m.path) && !(SBR.run.trinkets || []).includes('aja_stone'); },
    text: 'A jeweller in a railroad town keeps a red stone in a velvet box. When sunlight touches it, a beam of red light burns a hole in the wall. "The Red Stone of Aja," he says. "From Rome. It is not for sale." Then he sees your eyes, and names a price.',
    choices: [
      { label: 'Buy it ($280)', cost: { money: 280 }, ok: { text: 'The stone is warm in your hand. Something in your blood answers it.', fx: g => { g.trinket('aja_stone'); g.flag(SBR.run.party.find(x => x.id === 'custom').path === 'hamon' ? 'ajaHamon' : 'ajaVampire'); } } },
      { label: 'Steal it (LUCK)', check: { stat: 'luck', dc: 16 }, ok: { text: 'Out of the window, stone in hand, before the jeweller has finished shouting.', fx: g => { g.trinket('aja_stone'); g.flag(SBR.run.party.find(x => x.id === 'custom').path === 'hamon' ? 'ajaHamon' : 'ajaVampire'); } }, fail: { text: 'His guards have shotguns.', fight: { enemies: ['casino_thug', 'casino_thug', 'outlaw'], elite: true } } },
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
SBR.CAMPAIGN_EVENTS.push({ id: 'arrow_chooses', type: 'event', title: 'The Arrow Chooses', blurb: 'The arrowhead is humming in your saddlebag.', icon: 'star', art: 'custom', reveals: 'The Arrow made its choice.',
  cond: g => SBR.run.lead === 'custom' && (SBR.run.trinkets || []).includes('stand_arrow') && g.canTakePath('custom'),
  text: 'At night the arrowhead hums louder, and it points. Always at you. You know what it wants. Most of the people it cuts, it kills.',
  choices: [
    { label: 'Cut yourself with the Arrow (RESOLVE)', check: { stat: 'res', dc: 15, who: 'custom' },
      ok: { text: 'The Arrow goes in, and something comes out. A figure stands behind you, and it moves when you think.', fx: g => g.defer(() => SBR.standPick(g)) },
      fail: { text: 'The Arrow rejects you. You wake up bleeding in the dirt, alive, barely. It is still humming. It will ask again.', fx: g => { const m = SBR.run.party.find(x => x.id === 'custom'); if (m) m.hp = Math.max(1, Math.round(m.hp - m.maxHp * 0.4)); g.exhaust('custom'); SBR.campaign.world().keys['done:arrow_chooses'] = false; g.later('arrow_chooses', 4, 7); } } },
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
  const ev = { title: 'Your Stand', art: 'custom', text: 'Three shapes flicker behind you, one after another. Only one of them will stay.',
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
  A.reward = g => { rw(g); const r = SBR.run; if (r.lead === 'custom' && r.flags.arrowRumour && !r.flags.arrowGone && !(r.trinkets || []).includes('stand_arrow') && g.canTakePath('custom') && Math.random() < 0.4) { g.trinket('stand_arrow'); g.later('arrow_chooses', 1, 2); } };
});

/* ---------------- 8. Character creator ---------------- */
SBR.customUI = (() => {
  const OPT = {
    skin: ['#fbe0cc', '#f6d2b0', '#f0c8a0', '#e0b088', '#c8905a', '#a0683a', '#7a4a2a', '#5a3420'],
    hair: ['#1a1020', '#3a2a1a', '#6a3a1a', '#a0602a', '#c8a060', '#f4d35e', '#e8e8e8', '#c8323c', '#5b3a8c', '#3a8c4a'],
    hairStyle: ['short', 'shaggy', 'long', 'swept', 'curls', 'bob', 'bobbang', 'afro', 'verylong', 'bald', 'spiky', 'bowl'],
    hat: [null, 'cowboy', 'bowler', 'tophat', 'bandana', 'cap', 'headband', 'jockey', 'porkpie', 'kepi', 'aviator', 'goggles', 'ribbon', 'veil', 'checker', 'helm', 'pickel', 'dome', 'johnny', 'gyro'],
    color: ['#1a1020', '#3a2a1a', '#6a4a2a', '#8a1a2a', '#c8323c', '#e8742a', '#f2c14e', '#3a8c4a', '#3fb8a9', '#3b5bb5', '#5b3a8c', '#e8508a', '#e8d8b8', '#f6f4ee'],
    eye: ['#3a6a9a', '#4aa3df', '#3a8c4a', '#6a3a1a', '#1a1020', '#8a3ac8', '#c8323c', '#f2c14e'],
    extra: [null, 'mustache', 'beard', 'sideburns', 'scar', 'shades', 'monocle', 'scarf', 'feather', 'goldteeth', 'grin', 'tattoo', 'cross', 'mask'],
  };
  function creator(onDone) {
    const el = SBR.util.el, ui = SBR.ui;
    const cur = SBR.customRider();
    const p = cur.portrait;
    const box = el('div', { class: 'creator' });
    const render = () => {
      box.innerHTML = '';
      SBR.art.addPortrait({ custom: p });
      const prev = el('div', { class: 'cr-prev', html: SBR.art.portrait('custom') });
      const form = el('div', { class: 'cr-form' });
      const name = el('input', { type: 'text', maxlength: 24, value: cur.name, placeholder: 'Name' });
      const title = el('input', { type: 'text', maxlength: 32, value: cur.title, placeholder: 'Title' });
      name.oninput = () => { cur.name = name.value; }; title.oninput = () => { cur.title = title.value; };
      form.append(el('label', { class: 'cr-row' }, el('span', {}, 'NAME'), name), el('label', { class: 'cr-row' }, el('span', {}, 'TITLE'), title));
      const swatch = (label, get, set, list) => {
        const row = el('div', { class: 'cr-row' }, el('span', {}, label));
        const sw = el('div', { class: 'cr-sw' });
        list.forEach(c => { const b = el('button', { class: 'cr-dot' + (get() === c ? ' on' : ''), style: { background: c }, 'aria-label': label + ' ' + c }); b.onclick = () => { set(c); SBR.audio.play('click'); render(); }; sw.appendChild(b); });
        row.appendChild(sw); form.appendChild(row);
      };
      const cycle = (label, key, list) => {
        const i = Math.max(0, list.indexOf(p[key]));
        const row = el('div', { class: 'cr-row' }, el('span', {}, label));
        const mk = d => { const b = el('button', { class: 'cr-arrow' }, d < 0 ? '◂' : '▸'); b.onclick = () => { p[key] = list[(i + d + list.length) % list.length]; SBR.audio.play('click'); render(); }; return b; };
        row.append(mk(-1), el('b', { class: 'cr-val' }, p[key] || 'none'), mk(1));
        form.appendChild(row);
      };
      swatch('SKIN', () => p.skin, v => { p.skin = v; }, OPT.skin);
      cycle('HAIR', 'hairStyle', OPT.hairStyle);
      swatch('HAIR COLOUR', () => p.hair, v => { p.hair = v; }, OPT.hair);
      swatch('EYES', () => p.eye, v => { p.eye = v; }, OPT.eye);
      cycle('HAT', 'hat', OPT.hat);
      swatch('HAT COLOUR', () => p.hatColor, v => { p.hatColor = v; }, OPT.color);
      swatch('OUTFIT', () => p.outfit, v => { p.outfit = v; }, OPT.color);
      swatch('TRIM', () => p.outfit2, v => { p.outfit2 = v; p.hat2 = v; }, OPT.color);
      cycle('DETAIL', 'extra', OPT.extra);
      swatch('BACKDROP', () => p.bg[0], v => { p.bg = [v, p.bg[1]]; }, OPT.color);
      swatch('BACKDROP 2', () => p.bg[1], v => { p.bg = [p.bg[0], v]; }, OPT.color);
      const pick = a => a[Math.floor(Math.random() * a.length)];
      const foot = el('div', { class: 'cr-foot' });
      foot.append(ui.btn('Randomise', () => { Object.assign(p, { skin: pick(OPT.skin), hair: pick(OPT.hair), hairStyle: pick(OPT.hairStyle), hat: pick(OPT.hat), hatColor: pick(OPT.color), outfit: pick(OPT.color), outfit2: pick(OPT.color), eye: pick(OPT.eye), extra: pick(OPT.extra), bg: [pick(OPT.color), pick(OPT.color)] }); p.hat2 = p.outfit2; render(); }, 'btn-ghost'),
        ui.btn('Save rider ▸', () => { SBR.meta.custom = { name: (cur.name || '').trim() || SBR.CUSTOM_DEFAULT.name, title: (cur.title || '').trim() || SBR.CUSTOM_DEFAULT.title, portrait: p }; SBR.saveMeta(); SBR.applyCustom(); SBR.audio.play('select'); ui.closeModal(w); if (onDone) onDone(); }, 'btn-primary'));
      box.append(el('div', { class: 'cr-main' }, prev, form), foot);
    };
    render();
    const w = SBR.ui.modal(box, { title: 'Create Your Rider', size: 'wide', onClose: () => { SBR.applyCustom(); } });
  }
  return { creator, OPT };
})();
