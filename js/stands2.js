/* More Stands for the Drifter: ten more the Arrow can give, from Parts 3-6 and 8.
   Everything here is appended to the shared registries (SBR.STATUS, SBR.ABILITIES, SBR.PATHS, SBR.CUSTOM_STANDS,
   SBR.stands.DEFS, the ability/status icons). Hooks into files that load later (combat.js, standfx.js, strike.js,
   sprint.js) wait for DOMContentLoaded, by which time every classic script has run.
   Rarity: each Stand path has a `weight` for the Arrow's draw (default 10); the strongest are drawn far less often. */
'use strict';

/* ---------------- 1. Statuses ---------------- */
Object.assign(SBR.STATUS, {
  virus:   { name: 'Virus', glyph: '菌', color: '#9a4ac8', kind: 'debuff', mode: 'stacks', max: 8, tick: 'virus', desc: s => `Purple Haze's flesh-eating virus: ${3 * s} damage at turn start, then it weakens by 1. Healing on the infected is halved.` },
  freeze3: { name: 'Three Freeze', glyph: '重', color: '#4aa04a', kind: 'debuff', mode: 'turns', desc: () => 'Echoes ACT3 made them impossibly heavy: deals 40% less damage, -50% dodge.', mods: { dmgOut: 0.6, dodge: -0.5 } },
  written: { name: 'Safety Lock', glyph: '書', color: '#f2c14e', kind: 'debuff', mode: 'turns', desc: () => 'Heaven\'s Door wrote into their pages: "Cannot attack Rohan Kishibe." Deals 50% less damage.', mods: { dmgOut: 0.5 } },
});
(() => {
  const I = SBR.icons, st = I.st, K = I.K;
  const glyph = (c, g) => `<circle cx="24" cy="24" r="18" fill="${c}" ${st}/><text x="24" y="31" font-size="20" text-anchor="middle" font-family="serif" fill="#fff" stroke="${K}" stroke-width="1" paint-order="stroke">${g}</text>`;
  Object.entries({ virus: ['#9a4ac8', '菌'], freeze3: ['#3a8c4a', '重'], written: ['#c89a2a', '書'] }).forEach(([id, [c, g]]) => I.define('status', id, () => glyph(c, g)));
})();

/* ---------------- 2. Abilities ---------------- */
(() => {
  const A = SBR.ABILITIES;
  const lv = (x, a, b) => (x.lvl > 1 ? b : a);
  const S = ['stand'];
  const buffsOf = t => t.statuses.filter(s => SBR.STATUS[s.id] && SBR.STATUS[s.id].kind === 'buff').map(s => s.id);
  const strip = (x, t) => { const b = buffsOf(t); b.forEach(id => x.removeStatus(t, id)); return b.length; };
  Object.assign(A, {
    /* THE WORLD (Part 3, DIO) */
    tw_muda: { name: 'MUDA MUDA Rush', cost: 1, cd: 1, target: 'enemy', tags: S, fx: 'muda', desc: l => `"MUDA MUDA MUDA!" ${l > 1 ? 4 : 3} rapid hits of 3, scales with SPIN. Every hit on a Time-Stopped target is a critical hit.`,
      run(x) { for (let i = 0; i < lv(x, 3, 4); i++) { if (x.target.dead) break; x.dmg(x.target, 3, { spin: 0.03 }, { forceCrit: x.has(x.target, 'timestop'), label: i === 0 ? 'MUDA' : undefined }); } } },
    tw_knives: { name: 'Knives in Stopped Time', cost: 2, cd: 2, target: 'enemy', tags: S, dtype: 'phys', fx: 'gun', desc: l => `Stop time for a second and leave knives hanging in the air. ${l > 1 ? 6 : 5} knives of 3 at random enemies; they cannot be dodged, and deal double to the Time-Stopped.`,
      run(x) { for (let i = 0; i < lv(x, 5, 6); i++) { const t = i === 0 && !x.target.dead ? x.target : x.randomEnemy(); if (!t) break; x.dmg(t, 3 * (x.has(t, 'timestop') ? 2 : 1), { aim: 0.03 }, { noDodge: true }); } } },
    tw_zawarudo: { name: 'ZA WARUDO: Road Roller', cost: 3, cd: 5, target: 'allEnemies', tags: S, fx: 'timestop', desc: l => `"THE WORLD! Time, stop!" Every enemy is frozen for its next turn. Then a road roller lands on the healthiest one: ${l > 1 ? 19 : 16} base, cannot be dodged.`,
      run(x) {
        x.c.push({ t: 'timestop', on: true });
        x.enemies.forEach(e => x.status(e, 'timestop', 0, 1));
        const t = x.enemies.slice().sort((a, b) => b.hp - a.hp)[0];
        if (t) x.dmg(t, lv(x, 16, 19), { grit: 0.04, spin: 0.02 }, { noDodge: true, label: 'ROAD ROLLER' });
        x.c.push({ t: 'timestop', on: false });
        x.say(x.user, 'ROAD ROLLER DA!');
      } },
    /* HERMIT PURPLE (Part 3, Joseph) */
    hp_vines: { name: 'Thorn Vines', cost: 1, cd: 1, target: 'enemy', tags: S, dtype: 'holy', fx: 'rope', desc: l => `Purple vines with the Ripple running through them. ${l > 1 ? 7 : 5} Holy, scales with RESOLVE, and Hooked ${l > 1 ? 2 : 1}.`,
      run(x) { const r = x.dmg(x.target, lv(x, 5, 7), { res: 0.04 }); if (r.hit) x.status(x.target, 'hooked', 0, lv(x, 1, 2)); } },
    hp_spirit: { name: 'Spirit Photography', cost: 1, cd: 4, target: 'allEnemies', tags: S, fx: 'scan', desc: () => 'Smash a camera and the photo shows everything. Every enemy is Scanned 2; you gain Lucky 2 and +1 Energy. "Your next line is..."',
      run(x) { x.enemies.forEach(e => x.status(e, 'marked', 0, 2)); x.status(x.user, 'lucky', 0, 2); x.energy(x.user, 1); x.say(x.user, 'Your next line is... "What?!"'); } },
    hp_overdrive: { name: 'Hermit Purple Overdrive', cost: 3, cd: 4, target: 'allEnemies', tags: S, dtype: 'holy', fx: 'ripple', desc: l => `Send the Ripple down every vine at once. ${l > 1 ? 11 : 9} Holy to every enemy and Hooked 2; you heal 6. Double against the undead.`,
      run(x) { x.enemies.forEach(e => { const r = x.dmg(e, lv(x, 9, 11), { res: 0.04 }); if (r.hit) x.status(e, 'hooked', 0, 2); }); x.heal(x.user, 6, { res: 0.03 }); } },
    /* THE FOOL (Part 3, Iggy) */
    fool_fangs: { name: 'Sand Fangs', cost: 1, cd: 1, target: 'enemy', tags: S, dtype: 'phys', fx: 'claw', desc: l => `A dog made of sand bites, and sprays grit in their eyes. ${l > 1 ? 7 : 5} base, scales with RIDING, and Blinded 1.`,
      run(x) { const r = x.dmg(x.target, lv(x, 5, 7), { ride: 0.04 }); if (r.hit) x.status(x.target, 'blind', 0, 1); } },
    fool_dome: { name: 'Sand Dome', cost: 2, cd: 4, target: 'allAllies', tags: S, fx: 'buff', desc: l => `The Fool spreads into a dome of hard sand over everyone. Every ally gains Shield ${l > 1 ? 10 : 8} and Guard 1.`,
      run(x) { x.allies.forEach(a => { x.status(a, 'shield', lv(x, 8, 10)); x.status(a, 'guard', 0, 1); }); } },
    fool_storm: { name: 'Sand Glider Storm', cost: 3, cd: 4, target: 'allEnemies', tags: S, dtype: 'phys', fx: 'spray', desc: l => `Spread sand wings, glide over them and let the storm fall. ${l > 1 ? 10 : 8} to every enemy and Blinded 2; you gain Evasive 2.`,
      run(x) { x.enemies.forEach(e => { const r = x.dmg(e, lv(x, 8, 10), { ride: 0.03 }); if (r.hit) x.status(e, 'blind', 0, 2); }); x.status(x.user, 'evasive', 0, 2); } },
    /* ECHOES (Part 4, Koichi) */
    ec_act1: { name: 'ACT 1: Sound Stamp', cost: 1, cd: 1, target: 'enemy', tags: S, dtype: 'sound', fx: 'sound', desc: l => `Stick a sound effect to them. 3 Sound damage and Sound Stamp ${l > 1 ? 2 : 1}: it goes off for 6 per stamp the moment they act.`,
      run(x) { const r = x.dmg(x.target, 3, { aim: 0.03 }); if (r.hit || !x.target.dead) x.status(x.target, 'sound', lv(x, 1, 2)); } },
    ec_act2: { name: 'ACT 2: "BOING"', cost: 2, cd: 3, target: 'ally', tags: S, fx: 'buff', desc: l => `ACT2's tail plants the word BOYOYOING on an ally: whatever hits them bounces back. Reflect 2 and Guard 1${l > 1 ? ', Evasive 1' : ''}.`,
      run(x) { x.status(x.target, 'reflect', 0, 2); x.status(x.target, 'guard', 0, 1); if (x.lvl > 1) x.status(x.target, 'evasive', 0, 1); } },
    ec_act3: { name: 'ACT 3: THREE FREEZE', cost: 3, cd: 4, target: 'enemy', tags: S, dtype: 'stand', fx: 'hit', desc: l => `"S-H-I-T!" ACT3 punches and makes them impossibly heavy. ${l > 1 ? 15 : 12} base, stun 1, then Three Freeze 2 (40% less damage, can barely dodge).`,
      run(x) { const r = x.dmg(x.target, lv(x, 12, 15), { aim: 0.03, res: 0.02 }, { label: '3 FREEZE' }); if (r.hit) { x.status(x.target, 'stun', 0, 1); x.status(x.target, 'freeze3', 0, 3); } } },
    /* HEAVEN'S DOOR (Part 4, Rohan) */
    hd_read: { name: 'Read Them Like a Book', cost: 1, cd: 1, target: 'enemy', tags: S, fx: 'claw', desc: l => `Their face peels open into pages. ${l > 1 ? 6 : 4} base, Scanned 2${l > 1 ? ' and Weakened 1' : ''}.`,
      run(x) { const r = x.dmg(x.target, lv(x, 4, 6), { res: 0.04 }); if (r.hit || !x.target.dead) { x.status(x.target, 'marked', 0, 2); if (x.lvl > 1) x.status(x.target, 'weak', 0, 1); } } },
    hd_lock: { name: 'Safety Lock', cost: 2, cd: 3, target: 'enemy', tags: S, fx: 'debuff', base: true, desc: l => `Write "Cannot attack Rohan Kishibe" into their pages, and tear one out. ${l > 1 ? 8 : 6} base and Safety Lock ${l > 1 ? 3 : 2} (50% less damage).`,
      run(x) { x.dmg(x.target, lv(x, 6, 8), { res: 0.03 }, { noDodge: true }); x.status(x.target, 'written', 0, lv(x, 2, 3) + 1); } },
    hd_command: { name: 'Write: "Fly Backwards at 70 km/h"', cost: 3, cd: 4, target: 'enemy', tags: S, dtype: 'stand', fx: 'hit', desc: l => `Rohan writes a command and the body obeys. ${l > 1 ? 17 : 14} base, cannot be dodged, strips every buff and stuns 1.`,
      run(x) { const n = strip(x, x.target); const r = x.dmg(x.target, lv(x, 14, 17), { res: 0.04 }, { noDodge: true, label: n ? 'REWRITTEN' : 'WRITTEN' }); if (r.hit) x.status(x.target, 'stun', 0, 1); } },
    /* PURPLE HAZE (Part 5, Fugo) */
    ph_rush: { name: 'UBASHAAA Rush', cost: 1, cd: 1, target: 'enemy', tags: S, fx: 'hit', desc: l => `"UBASHAAA!" ${l > 1 ? 4 : 3} hits of 3, scales with GRIT. The first hit that lands breaks a capsule: Virus ${l > 1 ? 2 : 1}.`,
      run(x) { let cap = false; for (let i = 0; i < lv(x, 3, 4); i++) { if (x.target.dead) break; const r = x.dmg(x.target, 3, { grit: 0.03 }, { label: i === 0 ? 'UBASHAAA' : undefined }); if (r.hit && !cap) { cap = true; x.status(x.target, 'virus', lv(x, 1, 2)); } } } },
    ph_capsule: { name: 'Capsule Shot', cost: 2, cd: 3, target: 'enemy', tags: S, fx: 'boom', desc: l => `Punch a capsule loose and let it burst on them. 6 base and Virus ${l > 1 ? 4 : 3}; the cloud drifts: Virus 1 on one other enemy.`,
      run(x) { const t = x.target; x.dmg(t, 6, { grit: 0.03 }); if (!t.dead) x.status(t, 'virus', lv(x, 3, 4)); const o = x.enemies.filter(e => e !== t); if (o.length) x.status(SBR.util.pick(o), 'virus', 1); } },
    ph_outbreak: { name: 'Purple Haze Unleashed', cost: 3, cd: 5, target: 'allEnemies', tags: S, fx: 'spray', desc: l => `Break every capsule at once. 5 base to every enemy and Virus ${l > 1 ? 4 : 3}. The virus does not choose: each other ally has a 25% chance of Virus 1.`,
      run(x) { x.enemies.forEach(e => { x.dmg(e, 5, { grit: 0.03 }, { noDodge: true }); if (!e.dead) x.status(e, 'virus', lv(x, 3, 4)); }); x.allies.filter(a => a !== x.user && !a.summon).forEach(a => { if (x.roll(0.25)) x.status(a, 'virus', 1); }); x.say(x.user, 'Don\'t breathe in!'); } },
    /* AEROSMITH (Part 5, Narancia) */
    ae_volare: { name: 'Volare Via', cost: 1, cd: 1, target: 'allEnemies', tags: ['stand', 'gun'], fx: 'gatling', desc: l => `"Volare via!" The little fighter strafes the whole field. ${l > 1 ? 4 : 3} Gunshot to every enemy, scales with AIM.`,
      run(x) { x.enemies.forEach(e => x.dmg(e, lv(x, 3, 4), { aim: 0.04 })); } },
    ae_radar: { name: 'CO2 Radar', cost: 1, cd: 3, target: 'allEnemies', tags: ['stand', 'gun'], fx: 'scan', base: true, desc: l => `The radar finds whoever is breathing hardest. The most wounded enemy takes ${l > 1 ? 10 : 8} Gunshot (cannot be dodged) and Scanned 2; everyone else Scanned 1.`,
      run(x) { const t = x.enemies.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]; x.enemies.forEach(e => x.status(e, 'marked', 0, e === t ? 2 : 1)); if (t) x.dmg(t, lv(x, 8, 10), { aim: 0.04 }, { noDodge: true }); } },
    ae_bomb: { name: 'Bomb Drop', cost: 3, cd: 4, target: 'enemy', tags: S, dtype: 'phys', fx: 'boom', desc: l => `A bomb from the belly of the plane. ${l > 1 ? 19 : 16} to the target and Burning 2; 6 to every other enemy.`,
      run(x) { const t = x.target; const r = x.dmg(t, lv(x, 16, 19), { aim: 0.04 }, { label: 'BOMB' }); if (r.hit) x.status(t, 'burn', 2); x.enemies.filter(e => e !== t).forEach(e => x.dmg(e, 6, { aim: 0.02 })); } },
    /* WEATHER REPORT (Part 6, Weather) */
    wr_rain: { name: 'Downpour', cost: 1, cd: 1, target: 'allEnemies', tags: S, dtype: 'cold', fx: 'rain', desc: l => `A cloud forms over them. ${l > 1 ? 4 : 3} Cold to every enemy and Soaked 2.`,
      run(x) { x.enemies.forEach(e => { x.dmg(e, lv(x, 3, 4), { res: 0.03 }); if (!e.dead) x.status(e, 'soaked', 0, 2); }); } },
    wr_lightning: { name: 'Lightning', cost: 2, cd: 2, target: 'enemy', tags: S, dtype: 'stand', fx: 'beam', desc: l => `Call a bolt down. ${l > 1 ? 13 : 10} base, +60% against the Soaked, and a ${l > 1 ? 35 : 25}% stun (doubled if Soaked).`,
      run(x) { const s = x.has(x.target, 'soaked'); const r = x.dmg(x.target, lv(x, 10, 13) * (s ? 1.6 : 1), { res: 0.04 }, { label: s ? 'CONDUCTED' : undefined }); if (r.hit && x.roll(lv(x, 0.25, 0.35) * (s ? 2 : 1))) x.status(x.target, 'stun', 0, 1); } },
    wr_heavy: { name: 'Heavy Weather', cost: 3, cd: 5, target: 'allEnemies', tags: S, fx: 'debuff', base: true, desc: l => `The rainbow that turns people into snails. Every enemy takes 4, is Weakened 2 and Fear 1, and has a ${l > 1 ? 45 : 35}% chance to be stunned.`,
      run(x) { x.enemies.forEach(e => { x.dmg(e, 4, { res: 0.03 }, { noDodge: true }); if (e.dead) return; x.status(e, 'weak', 0, 2); x.status(e, 'fear', 0, 1); if (x.roll(lv(x, 0.35, 0.45))) { x.status(e, 'stun', 0, 1); x.c.push({ t: 'float', uid: e.uid, text: 'SNAIL!', cls: 'debuff' }); } }); } },
    /* MADE IN HEAVEN (Part 6, Pucci) */
    mih_blitz: { name: 'Accelerated Strikes', cost: 1, cd: 1, target: 'enemy', tags: S, fx: 'hit', desc: l => `Time runs faster for everyone but you. ${l > 1 ? 4 : 3} hits of 3, scales with RIDING, cannot be dodged.`,
      run(x) { for (let i = 0; i < lv(x, 3, 4); i++) { if (x.target.dead) break; x.dmg(x.target, 3, { ride: 0.03, spin: 0.01 }, { noDodge: true }); } } },
    mih_accel: { name: 'Time Acceleration', cost: 1, cd: 4, target: 'self', tags: S, fx: 'buff', desc: l => `The sun races across the sky. Evasive 2, +1 extra Energy each turn for ${l > 1 ? 3 : 2} turns, and cleanse 1 debuff.`,
      run(x) { x.status(x.user, 'evasive', 0, 2); x.status(x.user, 'goldenheart', 0, lv(x, 2, 3)); x.cleanse(x.user, 1); } },
    mih_reset: { name: 'The Universe Resets', cost: 3, cd: 99, target: 'allEnemies', tags: S, dtype: 'true', fx: 'timeskip', pierce: true, desc: () => 'Once per battle. Time reaches its end and begins again: every enemy loses all its buffs and takes 14 True damage; every ally heals 20% and cleanses 2.',
      run(x) { x.enemies.forEach(e => { strip(x, e); x.dmg(e, 14, { spin: 0.02 }, { noDodge: true, label: 'RESET' }); }); x.allies.forEach(a => { x.heal(a, Math.round(a.maxHp * 0.2)); x.cleanse(a, 2); }); x.say(x.user, 'Made in Heaven.'); } },
    /* SOFT & WET (Part 8, Josuke Higashikata) */
    sw_plunder: { name: 'Plunder Bubble', cost: 1, cd: 1, target: 'enemy', tags: S, fx: 'spray', desc: l => `A bubble pops and takes something away. ${l > 1 ? 7 : 5} base, and it steals one: their sight (Blinded 1), their heat (Chilled 2) or their strength (Weakened 2).`,
      run(x) { const t = x.target, r = x.dmg(t, lv(x, 5, 7), { spin: 0.04 }); if (!r.hit || t.dead) return; const k = SBR.util.pick([['blind', 1, 'SIGHT'], ['chilled', 2, 'HEAT'], ['weak', 2, 'STRENGTH']]); x.status(t, k[0], 0, k[1]); x.c.push({ t: 'float', uid: t.uid, text: 'STOLE ' + k[2], cls: 'debuff' }); } },
    sw_energy: { name: 'Plunder: Energy', cost: 1, cd: 3, target: 'enemy', tags: S, fx: 'debuff', base: true, desc: l => `A bubble drifts into them and comes back full. ${l > 1 ? 6 : 4} base; steal up to 2 of their Energy and gain 1.`,
      run(x) { const t = x.target; x.dmg(t, lv(x, 4, 6), { spin: 0.03 }); const took = Math.min(2, t.energy || 0); if (took) { t.energy -= took; x.c.push({ t: 'float', uid: t.uid, text: `-${took} ENERGY`, cls: 'debuff' }); } x.energy(x.user, 1); } },
    sw_beyond: { name: 'Go Beyond', cost: 3, cd: 4, target: 'enemy', tags: ['stand', 'spin'], dtype: 'spin', fx: 'golden', pierce: true, desc: l => `A bubble that does not exist: an infinitely thin spinning line. ${l > 1 ? 22 : 18} Spin damage that cannot be dodged and passes through every defence.`,
      run(x) { x.dmg(x.target, lv(x, 18, 22), { spin: 0.05 }, { noDodge: true, pierce: true, label: 'GO BEYOND' }); } },
  });
})();

/* ---------------- 3. The Paths ---------------- */
(() => {
  const P = SBR.PATHS;
  const ab = ids => ids.map((id, i) => ({ id, level: [1, 3, 5][i] }));
  const stand = (id, o) => { P[id] = Object.assign({ char: 'custom', acts: [1, 2, 3, 4, 5, 6], line: 'stand', stand: id }, o, { abilities: ab(o.abilities) }); if (!SBR.CUSTOM_STANDS.includes(id)) SBR.CUSTOM_STANDS.push(id); };
  stand('the_world', { stand: 'dio_world', name: 'The World', part: 3, color: '#e8b62a', arcana: ['XXI', 'THE WORLD'], weight: 3, rarity: 'LEGENDARY', stats: { spin: 2, grit: 2 }, bonus: { dmg: 0.08, crit: 0.05 }, res: { stand: -0.1 },
    passive: '+2 SPIN, +2 GRIT, +8% damage, +5% crit. Rarely drawn.', desc: 'The strongest Stand of Part 3. It is faster and stronger than anything, and for a few seconds it can stop time.', abilities: ['tw_muda', 'tw_knives', 'tw_zawarudo'] });
  stand('hermit_purple', { name: 'Hermit Purple', part: 3, color: '#8a4ab0', arcana: ['IX', 'THE HERMIT'], stats: { luck: 2, res: 2 }, bonus: { holyDmg: 0.15, crit: 0.03 }, res: { holy: -0.15 },
    passive: '+2 LUCK, +2 RESOLVE, +15% Holy damage, +3% crit. Its vines carry the Ripple: double damage to the undead.', desc: 'Thorny purple vines that grow from its user\'s hands. They can take spirit photographs, and they carry the Ripple.', abilities: ['hp_vines', 'hp_spirit', 'hp_overdrive'] });
  stand('the_fool', { name: 'The Fool', part: 3, color: '#d8a83a', arcana: ['0', 'THE FOOL'], stats: { ride: 2, luck: 1 }, bonus: { dodge: 0.06, block: 0.04 }, res: { phys: -0.15 },
    passive: '+2 RIDING, +1 LUCK, +6% dodge, +4% block, -15% Physical damage taken.', desc: 'A Stand made of sand, shaped like a dog with wheels for hind legs. It can become a dome, a pair of wings, or a copy of anyone.', abilities: ['fool_fangs', 'fool_dome', 'fool_storm'] });
  stand('echoes', { name: 'Echoes', part: 4, color: '#5ab84a', arcana: ['IV', 'PINK FLOYD'], stats: { aim: 2, res: 1 }, bonus: { soundDmg: 0.2, dodge: 0.04 }, res: { sound: -0.3 },
    passive: '+2 AIM, +1 RESOLVE, +20% Sound damage, +4% dodge, -30% Sound damage taken.', desc: 'It grows as its user does: ACT1 sticks sounds to things, ACT2 plants words that come true, ACT3 makes things heavy.', abilities: ['ec_act1', 'ec_act2', 'ec_act3'] });
  stand('heavens_door', { name: 'Heaven\'s Door', part: 4, color: '#e8c05a', arcana: ['IV', 'BOB DYLAN'], stats: { res: 3, luck: 1 }, bonus: { crit: 0.05, critDmg: 0.1 }, res: { stand: -0.1 },
    passive: '+3 RESOLVE, +1 LUCK, +5% crit, +10% crit damage.', desc: 'A little figure out of a manga. It opens people up like books: you can read everything they are, and write anything you like.', abilities: ['hd_read', 'hd_lock', 'hd_command'] });
  stand('purple_haze', { name: 'Purple Haze', part: 5, color: '#9a4ac8', arcana: ['V', 'JIMI HENDRIX'], weight: 7, stats: { grit: 3, spin: 1 }, bonus: { standDmg: 0.08 }, res: { phys: -0.1 },
    passive: '+3 GRIT, +1 SPIN, +8% Stand damage. Its virus melts flesh, halves healing, and does not care whose side you are on.', desc: 'A savage, drooling Stand. The capsules on its fists hold a virus that kills in thirty seconds. Even its user is afraid of it.', abilities: ['ph_rush', 'ph_capsule', 'ph_outbreak'] });
  stand('aerosmith', { name: 'Aerosmith', part: 5, color: '#e8642a', arcana: ['V', 'AEROSMITH'], stats: { aim: 3 }, bonus: { bulletDmg: 0.1, init: 3 }, res: { bullet: -0.1 },
    passive: '+3 AIM, +10% Gunshot damage, +3 initiative.', desc: 'A little fighter plane with machine guns and a bomb. Its radar sees the breath of everything alive.', abilities: ['ae_volare', 'ae_radar', 'ae_bomb'] });
  stand('weather_report', { name: 'Weather Report', part: 6, color: '#8ab0d8', arcana: ['VI', 'WEATHER REPORT'], weight: 6, rarity: 'RARE', stats: { res: 2, aim: 1 }, bonus: { coldDmg: 0.15, block: 0.05 }, res: { cold: -0.3 },
    passive: '+2 RESOLVE, +1 AIM, +15% Cold damage, +5% block, -30% Cold damage taken.', desc: 'A Stand made of cloud. It controls the weather within a few kilometres: rain, lightning, and the rainbow that turns men into snails.', abilities: ['wr_rain', 'wr_lightning', 'wr_heavy'] });
  stand('made_in_heaven', { name: 'Made in Heaven', part: 6, color: '#f2e8d0', arcana: ['VI', 'QUEEN'], weight: 2, rarity: 'LEGENDARY', stats: { ride: 3, spin: 2 }, bonus: { init: 8, dodge: 0.08 }, res: { stand: -0.1 },
    passive: '+3 RIDING, +2 SPIN, +8 initiative, +8% dodge. The rarest thing the Arrow can give.', desc: 'A centaur with a speedometer for a face. It accelerates time until the universe ends and begins again.', abilities: ['mih_blitz', 'mih_accel', 'mih_reset'] });
  stand('soft_wet', { name: 'Soft & Wet', part: 8, color: '#7ab8e0', arcana: ['VIII', 'PRINCE'], stats: { spin: 2, luck: 1, grit: 1 }, bonus: { spinDmg: 0.1, dodge: 0.04 }, res: { stand: -0.1 },
    passive: '+2 SPIN, +1 LUCK, +1 GRIT, +10% Spin damage, +4% dodge.', desc: 'Its bubbles steal whatever they touch: sound, sight, heat, friction. At its limit they are not bubbles at all, but infinitely thin spinning lines.', abilities: ['sw_plunder', 'sw_energy', 'sw_beyond'] });

  // emblems, as custom.js builds them for the first twelve
  const I = SBR.icons, st = I.st;
  const ring = (c, inner) => `<circle cx="24" cy="24" r="20" fill="${c}" ${st}/><circle cx="24" cy="24" r="15" fill="#fbf4e4" ${st} stroke-width="1.4"/>${inner}`;
  const mini = (id, s = 0.6) => `<g transform="translate(${24 - 24 * s} ${24 - 24 * s}) scale(${s})">${I.ability(id).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>`;
  SBR.STANDS2 = ['the_world', 'hermit_purple', 'the_fool', 'echoes', 'heavens_door', 'purple_haze', 'aerosmith', 'weather_report', 'made_in_heaven', 'soft_wet'];
  SBR.STANDS2.forEach(id => { const p = P[id]; SBR.PATH_EMBLEM[id] = () => I.wrap(ring(p.color, mini(p.abilities[0].id))); });

  // ability icons: the same badge as custom.js
  const K = I.K;
  const badge = (c, t, fs = 12, c2 = '#fff') => `<circle cx="24" cy="24" r="19" fill="${c}" ${st}/><circle cx="24" cy="24" r="14" fill="none" stroke="#fff" stroke-width="1.2" opacity=".5"/><text x="24" y="${24 + fs * 0.36}" font-size="${fs}" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${c2}" stroke="${K}" stroke-width="1.6" paint-order="stroke">${t}</text>`;
  const T = { tw_muda: ['MUDA', 11], tw_knives: ['刃', 18], tw_zawarudo: ['止', 18], hp_vines: ['茨', 18], hp_spirit: ['念写', 13], hp_overdrive: ['波紋', 13],
    fool_fangs: ['牙', 18], fool_dome: ['砂', 18], fool_storm: ['翼', 18], ec_act1: ['ACT1', 11], ec_act2: ['ACT2', 11], ec_act3: ['S·H·I·T', 8],
    hd_read: ['本', 18], hd_lock: ['書', 18], hd_command: ['命', 18], ph_rush: ['UBA', 12], ph_capsule: ['菌', 18], ph_outbreak: ['毒', 18],
    ae_volare: ['VIA', 12], ae_radar: ['CO2', 12], ae_bomb: ['爆', 18], wr_rain: ['雨', 18], wr_lightning: ['雷', 18], wr_heavy: ['虹', 18],
    mih_blitz: ['速', 18], mih_accel: ['加', 18], mih_reset: ['天国', 13], sw_plunder: ['泡', 18], sw_energy: ['奪', 18], sw_beyond: ['∞', 20] };
  const dark = ['made_in_heaven', 'heavens_door', 'the_fool'];
  Object.entries(T).forEach(([id, [t, fs]]) => { const p = SBR.STANDS2.map(k => P[k]).find(q => q.abilities.some(a => a.id === id)); I.define('ability', id, () => badge(p.color, t, fs, dark.includes(SBR.STANDS2.find(k => P[k] === p)) ? '#1a1020' : '#fff')); });

  /* the Arrow's draw: weighted, without repeats */
  SBR.standWeight = id => { const p = SBR.PATHS[id]; return p && p.weight != null ? p.weight : 10; };
  SBR.standDraw = (n = 3, pool = SBR.CUSTOM_STANDS) => {
    const left = pool.slice(), out = [];
    while (out.length < n && left.length) {
      const tot = left.reduce((s, id) => s + SBR.standWeight(id), 0);
      let r = Math.random() * tot, i = 0;
      for (; i < left.length - 1; i++) { r -= SBR.standWeight(left[i]); if (r < 0) break; }
      out.push(left.splice(i, 1)[0]);
    }
    return out;
  };
})();

/* ---------------- 4. Stand figures (viewBox 0 0 120 160, the same ink and shared body as js/stands.js) ---------------- */
(() => {
  const K = '#1a1020';
  const st = `stroke="${K}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
  const th = `stroke="${K}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"`;
  const F = (c, s = st) => `fill="${c}" ${s}`;
  let n = 0;
  const starPts = (cx, cy, R, r = R * 0.45) => [...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; return `${(cx + Math.cos(a) * q).toFixed(1)},${(cy + Math.sin(a) * q).toFixed(1)}`; }).join(' ');
  const star = (x, y, R, c, s = th) => `<polygon points="${starPts(x, y, R)}" fill="${c}" ${s}/>`;
  const heart = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 4C-4-1-9-1-9 3c0 4 9 9 9 9s9-5 9-9c0-4-5-4-9 1z" fill="${c}" ${th}/>`;
  const shine = (x, y, r = 3) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="#fff" opacity=".8" transform="rotate(-30 ${x} ${y})"/>`;
  const rope = (d, c, w = 3) => `<path d="${d}" fill="none" stroke="${K}" stroke-width="${w + 2.4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  /** halftone dots, clipped by the caller */
  const tone = (c = K, op = 0.18, x0 = 0, y0 = 0, w = 120, h = 160, gap = 5) => { let s = ''; for (let y = y0; y < y0 + h; y += gap) for (let x = x0 + ((y / gap) % 2 ? gap / 2 : 0); x < x0 + w; x += gap) s += `<circle cx="${x}" cy="${y}" r="1" />`; return `<g fill="${c}" opacity="${op}">${s}</g>`; };
  const wrap = (inner, aura = '#fff') => { const id = 's2o' + (++n); return `<svg class="stand-svg" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="${id}"><stop offset="0" stop-color="${aura}" stop-opacity=".55"/><stop offset="1" stop-color="${aura}" stop-opacity="0"/></radialGradient></defs><ellipse cx="60" cy="84" rx="58" ry="76" fill="url(#${id})"/>${inner}</svg>`; };
  const BODY = 'M40 50 Q60 42 80 50 L93 58 Q100 74 101 92 L92 96 L85 72 L82 104 L90 152 L75 152 L62 112 L58 112 L45 152 L30 152 L38 104 L35 72 L28 96 L19 92 Q20 74 27 58 Z';
  const SLIM = 'M46 52Q60 46 74 52L84 58Q90 76 90 94L84 96L78 72L76 106L82 152L70 152L62 112L58 112L50 152L38 152L44 106L42 72L36 96L30 94Q30 76 36 58z';
  function human({ c, pat = '', front = '', head = '', behind = '', aura, slim, shade = true }) {
    const id = 's2b' + (++n), P = slim ? SLIM : BODY;
    return wrap(`<defs><clipPath id="${id}"><path d="${P}"/></clipPath></defs>${behind}
      <path d="${P}" ${F(c)}/><g clip-path="url(#${id})">${pat}${shade ? `<path d="M60 40h60v120H60z" fill="${K}" opacity=".10"/>${tone(K, 0.16, 62, 44, 58, 112)}` : ''}</g><path d="${P}" fill="none" ${st}/>
      <path d="M44 62q16 6 32 0M48 80q12 4 24 0M60 50v56" stroke="${K}" stroke-width="1.3" fill="none" opacity=".4"/>
      ${front}${head}`, aura || c);
  }
  /** points (and tangents) along a chain of quadratic curves [[x0,y0],[cx,cy],[x1,y1],[cx,cy],[x2,y2]...] */
  function along(pts, per = 6) {
    const out = [];
    for (let i = 0; i + 2 < pts.length; i += 2) {
      const [a, c, b] = [pts[i], pts[i + 1], pts[i + 2]];
      for (let k = 0; k < per; k++) { const t = (k + 0.5) / per, u = 1 - t; out.push({ x: u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], y: u * u * a[1] + 2 * u * t * c[1] + t * t * b[1], dx: 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0]), dy: 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1]) }); }
    }
    return out;
  }
  const qd = pts => 'M' + pts[0].join(' ') + pts.slice(1).reduce((s, p, i) => s + (i % 2 ? ' ' + p.join(' ') : 'Q' + p.join(' ')), '');
  const thornVine = (pts, c = '#9a5ad0', w = 4) => {
    const thorns = along(pts, 5).map((p, i) => { const L = Math.hypot(p.dx, p.dy) || 1, nx = -p.dy / L, ny = p.dx / L, sd = i % 2 ? 1 : -1, tx = p.dx / L, ty = p.dy / L; const bx = p.x + nx * sd * w * 0.5, by = p.y + ny * sd * w * 0.5; return `<path d="M${(bx - tx * 2.4).toFixed(1)} ${(by - ty * 2.4).toFixed(1)}L${(bx + nx * sd * 5 + tx * 2).toFixed(1)} ${(by + ny * sd * 5 + ty * 2).toFixed(1)}L${(bx + tx * 2.4).toFixed(1)} ${(by + ty * 2.4).toFixed(1)}z" fill="${c}" ${th} stroke-width="1"/>`; }).join('');
    return thorns + rope(qd(pts), c, w) + `<path d="${qd(pts)}" fill="none" stroke="#e0b8ff" stroke-width="1" opacity=".7"/>`;
  };

  /* ---------- THE WORLD (Part 3): gold, crown-peaked mask, twin tanks, treads over the shoulders, hearts, clocks on the hands ---------- */
  const dioWorld = () => {
    const Y = '#f2c14e', A = '#fbe59a', G = '#3a9a6a';
    const clock = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" ${F('#f6ecd8', th)}/><path d="M${x} ${y}v-${r - 1.4}M${x} ${y}l${r / 2} ${r / 4}" stroke="${K}" stroke-width="1.2"/>`;
    const tread = d => `<path d="${d}" fill="none" stroke="${K}" stroke-width="8"/><path d="${d}" fill="none" stroke="#2a5a4a" stroke-width="5.4"/><path d="${d}" fill="none" stroke="${A}" stroke-width="5.4" stroke-dasharray="1.6 2.4"/>`;
    return human({ c: Y,
      behind: `<rect x="28" y="30" width="12" height="28" rx="6" ${F(A)}/><rect x="80" y="30" width="12" height="28" rx="6" ${F(A)}/><path d="M28 38h12M80 38h12" ${th}/>${rope('M34 30Q36 18 50 20', G, 2.4)}${rope('M86 30Q84 18 70 20', G, 2.4)}`,
      pat: `<path d="M36 98h48v10H36z" fill="${A}"/><path d="M40 118l-4 32h12zM80 118l4 32H72z" fill="${A}"/>`,
      front: `${tread('M46 104L40 54Q40 46 48 44')}${tread('M74 104l6-50Q80 46 72 44')}
        <path d="M36 98h48" stroke="${K}" stroke-width="1.6"/><path d="M36 108h48" stroke="${K}" stroke-width="1.6"/>
        ${heart(60, 100, 0.6, G)}${heart(60, 112, 0.55, G)}${heart(42, 126, 0.55, G)}${heart(78, 126, 0.55, G)}
        <path d="M36 134l6-4 6 4-2 14h-8zM72 134l6-4 6 4-2 14h-8z" ${F(A, th)}/>
        <path d="M30 152h15l10 5H34zM75 152h15l-4 5H65z" ${F(A)}/>
        <ellipse cx="30" cy="58" rx="10" ry="7" ${F(A)}/><ellipse cx="90" cy="58" rx="10" ry="7" ${F(A)}/>${shine(28, 55)}${shine(88, 55)}
        ${clock(22, 90)}${clock(98, 90)}`,
      head: `<path d="M44 44Q40 20 54 12L88 0Q78 18 76 42L70 48H50z" ${F(A)}/>
        <path d="M49 22L71 22L60 40z" ${F(Y, th)}/>
        <path d="M51 26l7 2.4M69 26l-7 2.4" stroke="${K}" stroke-width="3.2" stroke-linecap="round"/><path d="M52.4 26.5l4 1.3M67.6 26.5l-4 1.3" stroke="#ffe86a" stroke-width="1.3"/>
        <path d="M60 30v6" ${th}/><path d="M50 44q10 4 20 0" ${th} fill="none"/>${heart(60, 45, 0.35, G)}
        <path d="M56 12q14-6 30-11" stroke="#fff" stroke-width="1.6" opacity=".7" fill="none"/>` , aura: '#ffd84a' });
  };

  /* ---------- HERMIT PURPLE (Part 3): thorny vines out of a gloved hand, a smashed camera ---------- */
  const hermitPurple = () => {
    const V = '#9a5ad0';
    const photo = `<g transform="translate(20 26) rotate(-12)"><rect x="-14" y="-10" width="30" height="22" rx="3" ${F('#3a3a4a')}/><circle cx="1" cy="1" r="7" ${F('#8ab0d8')}/><circle cx="1" cy="1" r="3" fill="${K}"/><rect x="6" y="-14" width="8" height="5" ${F('#c8c8d8', th)}/><path d="M-6-6l6 8 3-5 5 9" stroke="#fff" stroke-width="1.4" fill="none"/></g>
      <g transform="translate(92 22) rotate(10)"><rect x="-12" y="-14" width="24" height="28" ${F('#f6f4ee', th)}/><rect x="-9" y="-11" width="18" height="17" fill="#3a2a4a"/><path d="M-5 6q5-10 10 0M-3-3a3 3 0 1 0 6 0a3 3 0 1 0-6 0" stroke="#e8c8ff" stroke-width="1.2" fill="none"/></g>`;
    return wrap(`${photo}
      ${thornVine([[62, 118], [26, 100], [36, 70], [46, 40], [22, 30]], V, 4)}
      ${thornVine([[64, 116], [96, 96], [84, 66], [74, 40], [92, 26]], V, 4)}
      ${thornVine([[60, 112], [58, 80], [66, 58], [72, 36], [56, 10]], V, 3.4)}
      ${thornVine([[58, 118], [18, 128], [10, 150]], V, 3)}
      <path d="M44 160L50 124Q52 112 62 110L74 110Q84 112 82 122L78 160z" ${F('#3a3a5a')}/>
      <path d="M50 118q12-6 30 0" stroke="#6a6a8a" stroke-width="2" fill="none"/>
      <path d="M52 112q-4-10 4-12l4 8M60 108q0-10 6-10l2 10M68 108q2-9 8-8l-1 10M76 112q5-6 9-3l-4 8" ${F('#4a4a6a', th)}/>
      <path d="M50 140h30" stroke="#6a6a8a" stroke-width="3"/>
      ${[[40, 60], [80, 84], [64, 44], [30, 110], [96, 120]].map(([x, y]) => `<path d="M${x} ${y}l2-6 2 6 6 2-6 2-2 6-2-6-6-2z" fill="#fff3a0" ${th} stroke-width="1"/>`).join('')}
    `, '#c89aff');
  };

  /* ---------- THE FOOL (Part 3): sand dog-car, tribal mask, eight feathers, paws on cables, orange wheels ---------- */
  const theFool = () => {
    const Y = '#e8c05a', Y2 = '#c89a3a', B = '#2a3a6a';
    const feathers = [...Array(8)].map((_, i) => { const a = -Math.PI / 2 + (i - 3.5) * 0.3, x = 50 + Math.cos(a) * 44, y = 58 + Math.sin(a) * 50; const rot = a * 180 / Math.PI + 90; return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})"><path d="M0-16Q7-4 0 16Q-7-4 0-16z" ${F('#f6f4ee', th)}/><path d="M0-16Q4-10 0-6Q-4-10 0-16z" fill="#c8323c"/><path d="M0-12v26" stroke="${K}" stroke-width="1"/></g>`; }).join('');
    const wheel = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" ${F('#2a2a2a')}/><circle cx="${x}" cy="${y}" r="${r * 0.62}" ${F('#e8742a')}/><circle cx="${x}" cy="${y}" r="${r * 0.22}" ${F('#f6ecd8', th)}/>${[0, 1, 2, 3, 4].map(i => { const a = i * 1.2566; return `<path d="M${x} ${y}L${(x + Math.cos(a) * r * 0.6).toFixed(1)} ${(y + Math.sin(a) * r * 0.6).toFixed(1)}" stroke="${K}" stroke-width="1.4"/>`; }).join('')}`;
    const cable = (d, c) => rope(d, c, 1.6);
    const sand = [...Array(30)].map((_, i) => `<circle cx="${(i * 41) % 116 + 2}" cy="${120 + (i * 17) % 38}" r="${0.8 + (i % 3) * 0.5}" fill="${Y2}"/>`).join('');
    return wrap(`${sand}${feathers}
      ${wheel(96, 134, 18)}
      <path d="M30 86Q40 72 70 74L104 84Q112 98 104 116L64 120Q34 118 30 100z" ${F(Y)}/>
      <path d="M58 76L86 80 82 96 56 94zM90 86l12 4-2 16-10-2z" ${F(B)}/>
      <path d="M40 100q20 8 60 4" stroke="${Y2}" stroke-width="2" fill="none"/>
      ${cable('M40 104Q30 116 34 128', '#c8323c')}${cable('M48 106Q52 120 58 128', '#3a6ac8')}${cable('M44 106Q40 120 44 128', '#3a6ac8')}
      <path d="M28 126h14l2 18h-16zM50 126h14l2 18H50z" ${F(B)}/>
      <path d="M24 144q10-6 20 0l2 8H22zM48 144q10-6 20 0l2 8H46z" ${F(Y)}/><path d="M28 150v-4M34 150v-5M40 150v-4M52 150v-4M58 150v-5M64 150v-4" ${th}/>
      ${wheel(84, 130, 12)}
      <path d="M26 58Q24 36 50 34Q76 36 74 58L70 80Q60 92 50 92Q40 92 30 80z" ${F(Y)}/>
      <path d="M30 54h40l-4 10H34z" ${F(B)}/>
      <path d="M36 58l10 3M64 58l-10 3" stroke="#fff3a0" stroke-width="2.4"/><circle cx="41" cy="60" r="1.6" fill="#c8323c"/><circle cx="59" cy="60" r="1.6" fill="#c8323c"/>
      <path d="M44 70h12l-6 6z" ${F(K, th)}/>
      <path d="M36 80l4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6" fill="#f6f4ee" ${th}/>
      <path d="M34 84q16 10 32 0" stroke="${K}" stroke-width="2" fill="none"/>
      <path d="M28 44q-6 4-8 14M72 44q6 4 8 14" stroke="#c8323c" stroke-width="3" fill="none"/>
      <path d="M40 40l4 8M60 40l-4 8M50 36v10" stroke="${Y2}" stroke-width="2"/>
    `, '#f2c14e');
  };

  /* ---------- ECHOES ACT3 (Part 4): green, striped muscle ridges, crested head with X holes, shorts with a 3 ---------- */
  const echoes = () => {
    const G = '#6ac85a', D = '#2a6a3a';
    return human({ c: G, slim: true,
      behind: `${rope('M60 110Q90 126 104 108Q112 98 106 90', G, 3.4)}<path d="M104 92l6-10 2 12z" ${F('#f2c14e', th)}/>`,
      pat: [...Array(10)].map((_, i) => `<path d="M20 ${58 + i * 9}q20 -4 40 0t40 0" stroke="${D}" stroke-width="2.4" fill="none"/>`).join('') + `<path d="M36 104h48v18H36z" fill="#f6f4ee"/><path d="M36 136h48v16H36z" fill="#f2c14e"/>`,
      front: `<text x="60" y="120" font-size="16" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${G}" stroke="${K}" stroke-width="1.2">3</text>
        <path d="M44 104h32" ${th}/><path d="M38 136h44" ${th}/>
        <ellipse cx="40" cy="58" rx="8" ry="6" ${F('#f6f4ee')}/><ellipse cx="80" cy="58" rx="8" ry="6" ${F('#f6f4ee')}/>
        <text x="40" y="61" font-size="7" text-anchor="middle" font-family="Anton,Impact" fill="${D}">S</text><text x="80" y="61" font-size="7" text-anchor="middle" font-family="Anton,Impact" fill="${D}">3</text>`,
      head: `<path d="M60 4Q70 8 70 20L66 22H54L50 20Q50 8 60 4z" ${F(D)}/>
        <path d="M46 32Q46 14 60 13Q74 14 74 32L70 44Q60 48 50 44z" ${F(G)}/>
        <path d="M44 24l-6-2v10l6-2zM76 24l6-2v10l-6-2z" ${F('#f6f4ee', th)}/><path d="M39 24l4 5M43 24l-4 5M77 24l4 5M81 24l-4 5" stroke="${K}" stroke-width="1.4"/>
        <path d="M51 30h7M62 30h7" stroke="${K}" stroke-width="4" stroke-linecap="round"/><path d="M52 29.4h5M63 29.4h5" stroke="#bdf0a0" stroke-width="1.2"/>
        <path d="M60 32v5M56 41h8" ${th}/><path d="M50 36q2 4 0 8M70 36q-2 4 0 8" stroke="${D}" stroke-width="1.4" fill="none"/>`, aura: '#9aff7a' });
  };

  /* ---------- HEAVEN'S DOOR (Part 4): a little manga figure, see-through top hat, overcoat, bow tie, loose pages ---------- */
  const heavensDoor = () => {
    const W = '#f6f4ee', Gd = '#d8a830';
    const page = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-10-13h20v26h-20z" ${F('#fffdf4', th)}/><path d="M-6-8h12M-6-4h12M-6 0h9M-6 4h12M-6 8h7" stroke="#6a5a4a" stroke-width="1"/></g>`;
    return wrap(`${page(20, 40, -18)}${page(100, 50, 14)}${page(16, 110, 10)}${page(104, 118, -12)}
      <path d="M40 84Q60 76 80 84L88 150H32z" ${F(W)}/>
      <path d="M40 84Q60 76 80 84" stroke="${Gd}" stroke-width="2" fill="none"/><path d="M60 88v62" stroke="${Gd}" stroke-width="2"/>
      <path d="M32 150h56" stroke="${Gd}" stroke-width="2.4"/>
      ${[100, 114, 128].map(y => `<circle cx="64" cy="${y}" r="2" fill="${Gd}" ${th} stroke-width="1"/>`).join('')}
      <path d="M40 90L30 122l6 2 8-24M80 90l10 32-6 2-8-24" ${F(W)}/><circle cx="32" cy="124" r="4" ${F(W)}/><circle cx="88" cy="124" r="4" ${F(W)}/>
      <path d="M40 150v6h14v-6M66 150v6h14v-6" ${F('#e8742a')}/>
      <path d="M50 80l10 5 10-5-4 9-6-3-6 3z" ${F('#e8742a')}/>
      <circle cx="60" cy="56" r="23" ${F(W)}/>
      <path d="M40 60q-2 12 6 18M80 60q2 12-6 18" stroke="${Gd}" stroke-width="1.6" fill="none"/>
      <circle cx="51" cy="56" r="5" fill="#3aa05a" ${th}/><circle cx="69" cy="56" r="5" fill="#3aa05a" ${th}/><circle cx="51" cy="56" r="2" fill="${K}"/><circle cx="69" cy="56" r="2" fill="${K}"/><circle cx="52" cy="55" r=".9" fill="#fff"/><circle cx="70" cy="55" r=".9" fill="#fff"/>
      <path d="M44 50l-6-4M44 56h-7M44 62l-6 3M76 50l6-4M76 56h7M76 62l6 3" stroke="${Gd}" stroke-width="1.4"/>
      <path d="M55 68q5 3 10 0" ${th} fill="none"/>
      <path d="M38 38h44l-4-4H42z" ${F('#bfe6ff')} opacity=".95"/>
      <rect x="44" y="6" width="32" height="30" rx="2" fill="#bfe6ff" fill-opacity=".35" ${st}/>
      <path d="M44 28h32v6H44z" fill="${K}"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${44 + i * 4}" y="${i % 2 ? 31 : 28}" width="4" height="3" fill="${W}"/>`).join('')}
      <path d="M48 10v16" stroke="#fff" stroke-width="2" opacity=".8"/>
    `, '#ffe89a');
  };

  /* ---------- PURPLE HAZE (Part 5): lozenges, beaked visor, stitched mouth, three capsules on each fist ---------- */
  const purpleHaze = () => {
    const P1 = '#9a5ac8', P2 = '#efe4f6';
    const loz = []; for (let y = 36; y < 160; y += 12) for (let x = 12; x < 112; x += 12) loz.push(`<path d="M${x} ${y - 6}l6 6-6 6-6-6z" fill="${((x + y) / 12) % 2 ? P1 : P2}"/>`);
    const caps = (x, y, d) => [0, 1, 2].map(i => `<ellipse cx="${x + d * (i - 1) * 5}" cy="${y - 7 - (i === 1 ? 2 : 0)}" rx="3" ry="4.4" ${F('#b8e05a', th)}/><path d="M${x + d * (i - 1) * 5 - 2} ${y - 8}h4" stroke="#6a8a2a" stroke-width="1"/>`).join('') + `<path d="M${x - 8} ${y + 4}l2 4 2-4 2 4 2-4 2 4 2-4 2 4" stroke="${K}" stroke-width="1.2" fill="#e8e0f0"/>`;
    return human({ c: P2,
      behind: [[34, 54], [44, 48], [76, 48], [86, 54]].map(([x, y]) => `<path d="M${x - 5} ${y + 4}L${x} ${y - 10}L${x + 5} ${y + 4}z" ${F(P1, th)}/>`).join(''),
      pat: loz.join('') + `<path d="M36 102h48v16H36z" fill="#6a2a9a"/><path d="M52 118h16l-2 20h-12z" fill="#6a2a9a"/>`,
      front: `<path d="M36 102h48M52 118l2 20h12l2-20" ${th} fill="none"/>
        <ellipse cx="30" cy="58" rx="11" ry="8" ${F('#c8a0e8')}/><ellipse cx="90" cy="58" rx="11" ry="8" ${F('#c8a0e8')}/>
        <ellipse cx="42" cy="128" rx="6" ry="5" ${F('#c8a0e8', th)}/><ellipse cx="78" cy="128" rx="6" ry="5" ${F('#c8a0e8', th)}/>
        <path d="M26 82l6 2M94 82l-6 2" ${th}/>
        ${caps(23, 94, 1)}${caps(97, 94, -1)}`,
      head: `<path d="M44 32Q42 12 60 10Q78 12 76 32L72 46Q60 50 48 46z" ${F(P2)}/>
        <path d="M44 22Q60 4 76 22L74 30Q60 24 46 30z" ${F(P1)}/><path d="M60 8v18" stroke="${K}" stroke-width="1.6"/>
        <ellipse cx="53" cy="31" rx="4" ry="3.4" fill="#fff" ${th}/><ellipse cx="67" cy="31" rx="4" ry="3.4" fill="#fff" ${th}/><circle cx="53" cy="31" r="1.2" fill="#c8323c"/><circle cx="67" cy="31" r="1.2" fill="#c8323c"/>
        <path d="M50 26l7 3M70 26l-7 3" stroke="${K}" stroke-width="2.2"/>
        <path d="M56 30L60 42L64 30z" fill="#bfe6ff" fill-opacity=".6" ${th}/>
        <path d="M51 44h18" stroke="${K}" stroke-width="1.8"/><path d="M53 41l2 6M57 41l2 6M61 41l2 6M65 41l2 6" stroke="${K}" stroke-width="1.1"/>
        <path d="M66 46q2 6 0 10q-2-4 0-10z" fill="#bfe6ff" ${th} stroke-width="1"/>`, aura: '#c07aff' });
  };

  /* ---------- AEROSMITH (Part 5): a propeller fighter, machine guns blazing, the CO2 radar ---------- */
  const aerosmith = () => {
    const R = '#e8642a', Y = '#f2c14e', B = '#3a6ac8';
    const flash = (x, y) => `<path d="M${x} ${y}l-3-9 3 4 3-4z" fill="#fff3a0" ${th}/><path d="M${x} ${y - 6}l-6-10M${x} ${y - 6}l6-10" stroke="#ffd84a" stroke-width="1.6"/>`;
    return wrap(`<g transform="translate(62 70) rotate(28)">
      <path d="M-4 44l-16 6v-8l16-10zM4 44l16 6v-8l-16-10z" ${F(Y)}/><path d="M0 30l0 22" stroke="${K}" stroke-width="3"/><path d="M-3 52h6l-3-26z" ${F(R, th)}/>
      <path d="M-56 -2L-8-10L8-10L56-2L54 10L8 8L-8 8L-54 10z" ${F(Y)}/>
      <path d="M-46 0v9M46 0v9" stroke="${B}" stroke-width="4"/><path d="M-40 0v9M40 0v9" stroke="${K}" stroke-width="1"/>
      <circle cx="-28" cy="0" r="5" ${F(B, th)}/><circle cx="28" cy="0" r="5" ${F(B, th)}/>${star(-28, 0, 3.4, '#fff')}${star(28, 0, 3.4, '#fff')}
      <path d="M-18-10v-8M18-10v-8" stroke="${K}" stroke-width="3"/>${flash(-18, -18)}${flash(18, -18)}
      <path d="M0-50Q10-40 10-14L8 34Q0 40-8 34L-10-14Q-10-40 0-50z" ${F(R)}/>
      <path d="M-9-26h18" stroke="${Y}" stroke-width="3"/><path d="M-8 20h16" stroke="${B}" stroke-width="3"/>
      <ellipse cx="0" cy="-8" rx="5" ry="10" ${F('#bfe6ff')}/><path d="M0-17v18" stroke="${K}" stroke-width="1"/>${shine(-2, -12, 2)}
      <path d="M-6 30Q0 36 6 30" stroke="${K}" stroke-width="1.2" fill="none"/>
      <ellipse cx="0" cy="-52" rx="22" ry="4.5" fill="#e8e0d0" fill-opacity=".6" ${th}/><path d="M-20-52h40" stroke="${K}" stroke-width="2.6"/>
      <circle cx="0" cy="-52" r="4" ${F('#8a8aa0')}/>
      <path d="M-30 -60l6 4M30-60l-6 4M-34-50l6 1M34-50l-6 1" stroke="${K}" stroke-width="1.2"/>
    </g>
      <g transform="translate(26 132)"><circle r="18" ${F('#1a3a2a')}/><circle r="12" fill="none" stroke="#6ae08a" stroke-width="1"/><circle r="6" fill="none" stroke="#6ae08a" stroke-width="1"/><path d="M0 0L14-10" stroke="#9aff9a" stroke-width="2"/><path d="M0 0L14-10A18 18 0 0 1 17 3z" fill="#6ae08a" opacity=".35"/><circle cx="8" cy="-4" r="2" fill="#ff5a5a"/><circle cx="-6" cy="6" r="1.6" fill="#ff5a5a"/><text x="0" y="16" font-size="6" text-anchor="middle" font-family="Anton,Impact" fill="#9aff9a">CO2</text></g>
      ${[[96, 124], [108, 134], [88, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#f2c14e" ${th}/>`).join('')}
    `, '#ffb070');
  };

  /* ---------- WEATHER REPORT (Part 6): a body of cloud, spiked mask with striped eyes, knuckle braces, winged cloud feet ---------- */
  const weatherReport = () => {
    const W = '#eef2f8', S = '#6a8ab8';
    const puff = (x, y, r, c = W) => `<circle cx="${x}" cy="${y}" r="${r}" ${F(c, th)}/>`;
    return human({ c: W,
      behind: puff(14, 120, 10) + puff(24, 132, 12) + puff(104, 110, 11) + puff(96, 128, 9) + puff(18, 40, 8) + puff(30, 34, 10) + `<path d="M24 44l-4 10 6-2-4 10" stroke="#f2c14e" stroke-width="2.4" fill="none"/>`,
      pat: [[40, 70], [70, 64], [52, 92], [80, 96], [44, 124], [74, 132], [28, 80], [92, 80]].map(([x, y]) => `<path d="M${x - 10} ${y}a6 6 0 0 1 10-4a6 6 0 0 1 10 4" stroke="${S}" stroke-width="1.6" fill="none"/><path d="M${x - 4} ${y + 6}q6 3 12-1" stroke="${S}" stroke-width="1.4" fill="none"/>`).join(''),
      front: `<rect x="17" y="86" width="12" height="7" rx="2" ${F('#4a5a7a')}/><rect x="91" y="86" width="12" height="7" rx="2" ${F('#4a5a7a')}/>
        ${puff(28, 58, 8)}${puff(92, 58, 8)}
        <path d="M26 150q-6-8-2-12l4 6M94 150q6-8 2-12l-4 6" ${F(W, th)}/><path d="M28 146l-10-6 4 8M92 146l10-6-4 8" ${F('#dfe8f4', th)}/>`,
      head: `<path d="M48 16l2-12 4 10 6-12 6 12 4-10 2 12" ${F(W)}/>
        <path d="M46 32Q44 14 60 13Q76 14 74 32L70 44Q60 50 50 44z" ${F(W)}/>
        <path d="M48 26h24l-2 8H50z" ${F('#4a5a7a', th)}/>
        <ellipse cx="54" cy="30" rx="4" ry="3" fill="#e8508a"/><ellipse cx="66" cy="30" rx="4" ry="3" fill="#e8508a"/>
        <path d="M52 27v6M54 27v6M56 27v6M64 27v6M66 27v6M68 27v6" stroke="${K}" stroke-width=".9"/>
        <path d="M54 40h12M56 43h8" ${th}/><path d="M48 36q-2 6 2 10M72 36q2 6-2 10" stroke="${S}" stroke-width="1.2" fill="none"/>`, aura: '#b8d8ff' });
  };

  /* ---------- MADE IN HEAVEN (Part 6): the humanoid fused to a horse's front, speedometer face, vine, pink feathers, clocks ---------- */
  const madeInHeaven = () => {
    const W = '#f4f0e6', Gd = '#e8b62a', Pk = '#f09ac0';
    const clock = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" ${F('#fff8dc', th)}/><path d="M${x} ${y}v-${r - 1.4}M${x} ${y}l${r / 2} ${r / 3}" stroke="${K}" stroke-width="1.1"/>`;
    return wrap(`
      ${rope('M40 112Q16 114 12 96', '#8a8aa0', 3)}<path d="M4 90h14v10H4z" ${F(W)}/>
      <path d="M36 96Q58 86 88 96L94 118Q70 128 40 122z" ${F(W)}/>
      <path d="M48 118l-4 30h8l4-26M76 120l2 28h8l-2-30" ${F(W)}/>
      <path d="M42 148h12v6H42zM76 148h12v6H76z" ${F('#8a8aa0')}/><path d="M44 152q4 3 8 0M78 152q4 3 8 0" stroke="${Gd}" stroke-width="1.6" fill="none"/>
      <path d="M80 100Q84 80 96 70Q100 62 108 64L116 76Q118 84 112 86L104 84L98 98z" ${F(W)}/>
      <path d="M86 84l6-10 2 8 6-12 2 8 6-10" fill="none" stroke="${K}" stroke-width="1.4"/>
      <path d="M96 66l2-8 4 6z" ${F(W, th)}/>
      <path d="M84 96l6-6" stroke="${K}" stroke-width="4"/><path d="M84 96l6-6" stroke="#3a3a4a" stroke-width="2.4"/>
      <path d="M100 68h9v9h-9z" ${F('#3a3a4a', th)}/>${clock(104.5, 72.5, 3.2)}
      <circle cx="112" cy="80" r="1.4" fill="${K}"/><path d="M84 84Q98 92 111 82M40 88Q70 100 111 82" stroke="#8a4ab0" stroke-width="1.4" fill="none"/>
      ${clock(52, 104, 5)}${clock(86, 106, 4)}
      ${rope('M58 100Q70 104 96 90', '#c8a070', 1.4)}
      <path d="M50 96L46 60Q60 52 74 60L70 96z" ${F(W)}/>
      <path d="M46 62L36 84l6 4 8-18M74 62l12 18-4 6-10-14" ${F(W)}/>
      ${clock(40, 86, 4)}${clock(84, 82, 4)}${clock(48, 64, 5)}${clock(72, 64, 5)}
      <path d="M52 58q-6-4-8-12 4 2 6 0-4-6-2-12 4 6 8 8M68 58q6-4 8-12-4 2-6 0 4-6 2-12-4 6-8 8" ${F(Pk, th)}/>
      <path d="M50 44Q48 16 60 12Q72 16 70 44Q60 52 50 44z" ${F(W)}/>
      <path d="M52 24Q60 20 68 24L68 40Q60 44 52 40z" ${F(K)}/>
      <circle cx="60" cy="32" r="7" fill="#f6f4ee" stroke="${Gd}" stroke-width="1.6"/>${[0, 1, 2, 3, 4, 5, 6].map(i => { const a = Math.PI * (0.8 + i * 0.233); return `<path d="M${(60 + Math.cos(a) * 5.5).toFixed(1)} ${(32 + Math.sin(a) * 5.5).toFixed(1)}L${(60 + Math.cos(a) * 7).toFixed(1)} ${(32 + Math.sin(a) * 7).toFixed(1)}" stroke="${K}" stroke-width=".8"/>`; }).join('')}
      <path d="M60 32l4-4" stroke="#c8323c" stroke-width="1.6"/>
      ${rope('M49 36Q46 22 54 16Q62 10 68 16Q74 22 70 30', '#3a9a4a', 1.6)}${rope('M52 18Q60 20 70 16', '#3a9a4a', 1.4)}${[[52, 16, -30], [64, 12, 20], [71, 24, 70], [48, 28, -80]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2" transform="rotate(${r} ${x} ${y})" fill="#6ad06a" ${th} stroke-width="1"/>`).join('')}
    `, '#fff3c0');
  };

  /* ---------- SOFT & WET (Part 8): baby blue, star on the crown, sail-horns, screw eyes, anchor chest, heart pauldrons, bubbles ---------- */
  const softWet = () => {
    const Bl = '#a8d8f2', Pu = '#8a5ac8', Ys = '#fff0a0';
    const bub = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#eaf8ff" fill-opacity=".45" ${th}/>${shine(x - r * 0.35, y - r * 0.35, r * 0.3)}`;
    const joint = (x, y) => `<circle cx="${x}" cy="${y}" r="3.4" ${F('#2a2a4a', th)}/>`;
    return human({ c: Bl, slim: true,
      behind: bub(14, 50, 7) + bub(106, 40, 9) + bub(104, 124, 6) + bub(16, 128, 8) + bub(96, 20, 4),
      pat: `<path d="M20 100h80v10H20z" fill="#7aa8d0"/>`,
      front: `<path d="M48 58l12 4 12-4-4 16-8 6-8-6z" ${F('#dff2ff')}/><path d="M60 62v18M54 72q6 6 12 0" stroke="${K}" stroke-width="1.6" fill="none"/><circle cx="60" cy="62" r="2" fill="none" ${th}/>
        ${rope('M40 66Q34 80 36 92', Pu, 1.6)}${rope('M80 66Q86 80 84 92', Pu, 1.6)}${rope('M48 110Q46 124 46 134', Pu, 1.6)}${rope('M72 110Q74 124 74 134', Pu, 1.6)}
        ${joint(38, 76)}${joint(82, 76)}${joint(46, 128)}${joint(74, 128)}
        <path d="M36 54c-10-6-14 6-6 12l8 4 4-10c0-4-3-6-6-6z" ${F(Bl)}/><path d="M84 54c10-6 14 6 6 12l-8 4-4-10c0-4 3-6 6-6z" ${F(Bl)}/>
        ${star(36, 61, 3.6, Ys)}${star(84, 61, 3.6, Ys)}`,
      head: `<path d="M46 20L40 10L44 30zM74 20L80 10L76 30z" ${F('#dff2ff')}/>
        <path d="M47 32Q46 14 60 13Q74 14 73 32L70 44Q60 48 50 44z" ${F(Bl)}/>
        <path d="M60 14v32" stroke="${K}" stroke-width="2.4"/>
        <circle cx="60" cy="9" r="6" ${F('#dff2ff', th)}/>${star(60, 9, 4.6, Ys)}
        <circle cx="53" cy="29" r="3.8" fill="#fff" ${th}/><circle cx="67" cy="29" r="3.8" fill="#fff" ${th}/><path d="M51 29h4M65 29h4" stroke="${K}" stroke-width="1.4"/><circle cx="53" cy="29" r="1" fill="${Pu}"/><circle cx="67" cy="29" r="1" fill="${Pu}"/>
        <path d="M54 40h4M62 40h4" ${th}/>`, aura: '#bfe8ff' });
  };

  Object.assign(SBR.stands.DEFS, {
    dio_world: { name: 'The World', entity: true, draw: dioWorld },
    hermit_purple: { name: 'Hermit Purple', entity: false, draw: hermitPurple },
    the_fool: { name: 'The Fool', entity: true, draw: theFool },
    echoes: { name: 'Echoes ACT3', entity: true, draw: echoes },
    heavens_door: { name: 'Heaven\'s Door', entity: true, draw: heavensDoor },
    purple_haze: { name: 'Purple Haze', entity: true, draw: purpleHaze },
    aerosmith: { name: 'Aerosmith', entity: true, draw: aerosmith },
    weather_report: { name: 'Weather Report', entity: true, draw: weatherReport },
    made_in_heaven: { name: 'Made in Heaven', entity: true, draw: madeInHeaven },
    soft_wet: { name: 'Soft & Wet', entity: true, draw: softWet },
  });
})();

/* ---------------- 5. Hooks into later files (combat, strike/standfx, the race) ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  /* combat: the virus ticks at turn start and halves healing on the infected */
  const C = SBR.Combat && SBR.Combat.prototype;
  if (C && !C._stands2) {
    C._stands2 = true;
    const bt = C.beginTurn;
    C.beginTurn = function (u) {
      const r = bt.call(this, u);
      const s = !u.dead && this.st(u, 'virus');
      if (s) {
        this.typedHp(u, 3 * s.stacks, 'stand', 'VIRUS');
        s.stacks--; if (s.stacks <= 0) this.removeStatus(u, 'virus');
        if (u.dead) { this.checkEnd(); return { skip: true }; }
      }
      return r;
    };
    const hl = C.heal;
    C.heal = function (src, t, base, scale) { if (t && this.has(t, 'virus')) base *= 0.5; return hl.call(this, src, t, base, scale); };
  }

  /* close-range Stands rush; each gets its own barrage cry */
  const SK = SBR.strike, FX = SBR.standfx, F = SBR.fx;
  if (SK && SK.CLOSE) Object.assign(SK.CLOSE, { dio_world: ['無駄', 'MUDA'], purple_haze: ['ウバシャア', 'UBASHAAA'], made_in_heaven: ['ドドド', 'DODODO'], soft_wet: ['オラ', 'ORA'] });
  if (!FX || !F) return;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const wait = ms => new Promise(r => setTimeout(r, ms / (SBR.settings.speed || 1)));
  const snd = s => { try { SBR.audio.play(s); } catch (e) { /* no audio */ } };
  const shake = () => { try { if (!SBR.settings.reducedMotion) SBR.ui.shake(undefined, true); } catch (e) { /* no ui */ } };
  const KIT = F.kit;
  const barrage = (c, style) => SK.rush({ key: c.key, from: c.from, to: c.to, tier: c.tier, lvl: c.lvl, color: c.color, enemy: c.enemy, plain: true, style });
  const up = (t, col, word) => { F.starBurst(t.x, t.y - 10, '#fff', 90, 14, 0.35); F.ring(t.x, t.y, col, 120, 8, 0.45); F.speedLines(t.x, t.y, '#fff', 200, 26); F.glyph(t.x, t.y - 70, word, col, 46); shake(); };
  Object.assign(FX.STYLE, {
    dio_world: { color: '#f2c14e', style: c => ({ cry: ['無駄', 'MUDA'], fan: Math.min(3, 1 + (c.power >> 1)), fistColor: '#f2d36a', finish: async t => up(t, '#f2c14e', '無駄ァッ!') }) },
    purple_haze: { color: '#9a5ac8', style: c => ({ cry: ['ウバシャア', 'UBASHAAA'], fan: Math.min(3, 1 + (c.power >> 1)), fistColor: '#c8a0e8', onHit: (t, i) => { if (i % 4 === 3) F.smoke(t.x + rnd(-20, 20), t.y, '#9a5ac8', 2, 0.5, -30); }, finish: async t => { up(t, '#9a5ac8', 'ウバシャアアッ!'); F.smoke(t.x, t.y, '#8a4ab0', 8, 0.55, -40); } }) },
    made_in_heaven: { color: '#f4f0e6', style: c => ({ cry: ['ドドド', 'DODODO'], blink: true, hits: p => 4 + p * 2, fistColor: '#f4f0e6', finish: async t => { F.clock(t.x, t.y, '#ffd84a', 70, 0.7); up(t, '#e8b62a', '加速!'); } }) },
    soft_wet: { color: '#a8d8f2', style: c => ({ cry: ['オラ', 'ORA'], fan: Math.min(3, 1 + (c.power >> 1)), fistColor: '#a8d8f2', onHit: (t, i) => { if (i % 3 === 1) KIT.bubbles(t.x, t.y, '#bfe8ff', 2); }, finish: async t => { up(t, '#7ab8e0', 'オラァ!'); KIT.bubbles(t.x, t.y, '#bfe8ff', 10); } }) },
  });
  const named = k => FX.NAMED[k] && FX.NAMED[k].fn;
  const M = {
    tw_knives: { key: 'dio_world', color: '#f2c14e', kana: 'ザ・ワールド', fn: c => named('knife volley')(Object.assign(c, { stand: 'dio_world' })) },
    tw_zawarudo: { key: 'dio_world', color: '#f2c14e', kana: '時よ止まれ', fn: c => named('za warudo')(Object.assign(c, { stand: 'dio_world', power: Math.max(3, c.power) })) },
    /* Purple Haze: a capsule arcs over and bursts into purple smoke */
    ph_capsule: { key: 'purple_haze', color: '#9a5ac8', kana: 'パキィ', fn: async c => {
      const t = c.t0; snd('click');
      await KIT.projectile('pin', c.from, t, { c: '#b8e05a' });
      F.ring(t.x, t.y, '#b8e05a', 60, 5, 0.4); F.smoke(t.x, t.y, '#9a5ac8', 14, 0.6, -30); F.glyph(t.x, t.y - 60, 'パキィン', '#c8a0e8', 38); snd('boom');
      await wait(300);
    } },
    ph_outbreak: { key: 'purple_haze', color: '#9a5ac8', kana: 'パープル・ヘイズ', fn: async c => {
      snd('boom'); KIT.overlay('vfx-invert', 120);
      for (const t of c.to) { F.smoke(t.x, t.y, '#9a5ac8', 18, 0.6, -20); F.ring(t.x, t.y, '#b8e05a', 90, 6, 0.5); await wait(90); }
      F.kana(innerWidth / 2, innerHeight * 0.35, 'ウバシャアアアッ', '#c8a0e8', 80, 900); shake();
      await wait(400);
    } },
    /* Echoes ACT3: the target is crushed by its own weight */
    ec_act3: { key: 'echoes', color: '#6ac85a', kana: 'スリーフリーズ', fn: async c => {
      const t = c.t0; snd('hit'); F.glyph(t.x, t.y - 80, 'S・H・I・T!', '#6ac85a', 40);
      await wait(200);
      F.ring(t.x, t.y + 30, '#2a6a3a', 110, 10, 0.5); F.dust && F.dust(t.x, t.y + 40); F.glyph(t.x, t.y, 'ズシィン', '#fff', 56); F.speedLines(t.x, t.y, '#6ac85a', 160, 20); shake();
      await wait(350);
    } },
    /* Weather Report: lightning from a cloud */
    wr_lightning: { key: 'weather_report', color: '#b8d8ff', kana: 'ゴロゴロ', fn: async c => {
      const t = c.t0; F.smoke(t.x, t.y - 140, '#6a7a9a', 10, 0.7, 0);
      await wait(250);
      for (let i = 0; i < 3 + Math.min(3, c.power); i++) { F.lightning({ x: t.x + rnd(-30, 30), y: t.y - 170 }, { x: t.x + rnd(-10, 10), y: t.y }, i % 2 ? '#fff' : '#fff3a0'); await wait(50); }
      F.flash('#e8f4ff', 140, 0.5); F.starBurst(t.x, t.y, '#fff3a0', 70, 12, 0.3); F.glyph(t.x, t.y - 70, 'バリバリッ', '#fff3a0', 42); snd('crit'); shake();
      await wait(250);
    } },
    /* Heaven's Door: the face peels into pages, a line of writing, and the body obeys */
    hd_command: { key: 'heavens_door', color: '#f2c14e', kana: 'ヘブンズ・ドアー', fn: async c => {
      const t = c.t0; snd('page');
      for (let i = 0; i < 8; i++) KIT.add({ x: t.x, y: t.y - 20, vx: rnd(-160, 160), vy: rnd(-220, -60), g: 260, rot: rnd(0, 6), vr: rnd(-6, 6), life: rnd(0.8, 1.2), drag: 0.97, draw: (p, k) => { const x = KIT.ctx; x.globalAlpha = 1 - k; x.translate(p.x, p.y); x.rotate(p.rot); x.fillStyle = '#fffdf4'; x.strokeStyle = '#1a1020'; x.lineWidth = 1.5; x.fillRect(-9, -12, 18, 24); x.strokeRect(-9, -12, 18, 24); x.fillStyle = '#6a5a4a'; for (let j = 0; j < 4; j++) x.fillRect(-6, -7 + j * 5, 12, 1.2); } });
      F.glyph(t.x, t.y - 90, '「時速70kmで後ろへ吹っ飛ぶ」', '#f2c14e', 22);
      await wait(420);
      F.speedLines(t.x, t.y, '#fff', 220, 26); F.ring(t.x, t.y, '#f2c14e', 100, 7, 0.4); snd('crit'); shake();
      await wait(250);
    } },
    /* Soft & Wet: bubbles float over and pop; Go Beyond is a spinning thread through everything */
    sw_plunder: { key: 'soft_wet', color: '#a8d8f2', kana: 'シャボン', fn: async c => {
      const t = c.t0; KIT.bubbles(c.from.x, c.from.y, '#bfe8ff', 8);
      await KIT.projectile('gem', c.from, t, { c: '#bfe8ff', dur: 0.45 });
      KIT.bubbles(t.x, t.y, '#bfe8ff', 10); F.ring(t.x, t.y, '#bfe8ff', 50, 4, 0.35); F.glyph(t.x, t.y - 60, 'パチン', '#7ab8e0', 36); snd('miss');
      await wait(250);
    } },
    sw_beyond: { key: 'soft_wet', color: '#a8d8f2', kana: 'ゴー・ビヨンド', fn: async c => {
      const t = c.t0;
      F.kana(innerWidth / 2, innerHeight * 0.3, 'ゴー・ビヨンド', '#bfe8ff', 70, 900);
      F.spiral(c.from.x, c.from.y, '#ffd84a', 60, 5, 0.8, 3);
      await wait(250);
      KIT.streak(c.from, t, '#fff', 3, 0.35); KIT.streak(c.from, t, '#ffd84a', 1.4, 0.4);
      await wait(150);
      F.spiral(t.x, t.y, '#ffd84a', 90, 6, 1.1, 4); F.starBurst(t.x, t.y, '#fff', 80, 14, 0.3); snd('crit'); shake();
      await wait(300);
    } },
    /* Made in Heaven: clocks everywhere spin, and the world resets */
    mih_reset: { key: 'made_in_heaven', color: '#f4f0e6', kana: 'メイド・イン・ヘブン', fn: async c => {
      snd('timestop'); KIT.overlay('vfx-invert', 200);
      F.clock(innerWidth / 2, innerHeight * 0.45, '#ffd84a', Math.min(innerWidth, innerHeight) * 0.3, 1.2);
      F.kana(innerWidth / 2, innerHeight * 0.3, '天国へ', '#fff3c0', 90, 1000);
      await wait(700);
      c.to.forEach(t => { F.ring(t.x, t.y, '#fff3c0', 120, 8, 0.5); F.starBurst(t.x, t.y, '#fff', 80, 12, 0.3); });
      F.flash('#fff8e0', 220, 0.7); shake();
      await wait(300);
    } },
  };
  Object.assign(FX.MOVES, M);

  /* the race: some of the new Stands help you ride */
  const rp = SBR.racePowers;
  if (rp && !rp._stands2) {
    const RACE = {
      the_world: { name: 'The World', glyph: '止', color: '#e8b62a', desc: '"ZA WARUDO!" Stop time for 3 seconds. Only you move.', use: A => A.freeze(3, 'ZA WARUDO!') },
      made_in_heaven: { name: 'Made in Heaven', glyph: '加', color: '#e8b62a', desc: 'Time accelerates for everyone but you: +50% speed for 6s and +40 stamina.', use: A => { A.S.boostT = 6; A.stamina(40); } },
      hermit_purple: { name: 'Hermit Purple', glyph: '茨', color: '#8a4ab0', desc: 'Vines catch the rider ahead and reel you up to them.', use: A => { const t = A.ahead(); A.me.pos = t ? Math.max(A.me.pos, t.pos - 4) : A.me.pos + 25; } },
      weather_report: { name: 'Weather Report', glyph: '風', color: '#8ab0d8', desc: 'A tailwind at your back: +50% speed for 4s.', use: A => { A.S.boostT = 4; } },
      soft_wet: { name: 'Soft & Wet', glyph: '泡', color: '#7ab8e0', desc: 'Steal the friction from the rider ahead\'s hooves: they slip and stall for 2s.', use: A => A.stunAhead(2) },
      the_fool: { name: 'The Fool', glyph: '翼', color: '#d8a83a', desc: 'Sand wings carry you over the rough ground: +25 and 2s untouchable.', use: A => { A.me.pos += 25; A.S.shield = 2; } },
    };
    SBR.racePowers = r => {
      const out = rp(r);
      r.party.filter(m => m.hp > 0 && SBR.isPU(m.id) && RACE[m.path]).forEach(m => { if (out.length < 4 && !out.some(o => o.id === m.path)) out.push(Object.assign({ id: m.path, who: m.id }, RACE[m.path])); });
      return out;
    };
    SBR.racePowers._stands2 = true;
  }
});
