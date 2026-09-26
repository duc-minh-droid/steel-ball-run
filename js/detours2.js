/* More detour content: new events, enemies, elites and exclusive gear for the four detours, an alternate boss or a
   hidden deeper stage in each, and a fifth detour, the Pillar Tomb under the Rockies (Wamuu and Esidisi).
     Devil's Palm       alternate boss: the Pilgrim Who Stayed (pray over the pilgrim's bones, or carry 2+ Corpse Parts)
     Silver Mine        hidden deeper stage (the skull in the wall) -> a Strange Aura (js/superbosses.js)
     Frozen Lake        alternate boss: White Album, walking empty (break the frozen rider out)
     Philadelphia Yard  hidden deeper stage (follow the quiet passenger) -> a Strange Aura
     Pillar Tomb        Wamuu and Esidisi; hidden deeper stage behind the sealed door -> a Strange Aura
   Area bosses marked `custom` are resolved by SBR.customCard in js/superbosses.js. Loads after areas.js / sides.js. */
'use strict';

(() => {
  const port = key => ({ kind: 'portrait', key });
  const beast = (type, color, bg) => ({ kind: 'creature', type, color, bg });
  const U = SBR.util;
  const R = () => SBR.run;
  const inArea = () => (R() && R().area) || {};

  /* ================= 1. Portraits and creatures ================= */
  SBR.art.addPortrait({
    dt_mirage:    { skin: '#f0c8a0', hair: '#e8b36a', hairStyle: 'shaggy', hat: 'cowboy', hatColor: '#e8742a', hat2: '#fff0a0', outfit: '#e8a04a', outfit2: '#fff0a0', eye: '#fff8d0', lip: '#c8804a', bg: ['#ffd08a', '#e8742a'], eyes: 'closed', deco: ['bib:214'] },
    dt_pilgrim:   { skin: '#c8b890', hair: '#e8e0c8', hairStyle: 'verylong', hat: 'hood', hatColor: '#a89070', hat2: '#f2c14e', outfit: '#a89070', outfit2: '#f6ecd8', eye: '#fff3a0', lip: '#7a6a5a', bg: ['#f2c14e', '#8a1a10'], eyes: 'closed', facial: 'fullbeard', deco: ['necklace:cross'] },
    dt_foreman:   { skin: '#8ab86a', hair: '#5a3a2a', hairStyle: 'short', hat: 'helm', hatColor: '#c8a040', hat2: '#f2c14e', outfit: '#6a5a3a', outfit2: '#c8a040', eye: '#f2c14e', lip: '#4a3a2a', bg: ['#3a2e28', '#c8e04a'], eyes: 'sharp', mouth: 'teeth', extra: 'scales' },
    dt_drowned:   { skin: '#a8c8d8', hair: '#3a4a5a', hairStyle: 'shaggy', hat: 'stetson', hatColor: '#4a5a6a', hat2: '#9fd0f0', outfit: '#4a5a6a', outfit2: '#9fd0f0', eye: '#f6fbff', lip: '#5a6a8a', bg: ['#1a2a4a', '#9fd0f0'], eyes: 'glare', deco: ['bib:88'] },
    dt_yardbull:  { skin: '#e0b090', hair: '#3a2a1a', hairStyle: 'short', hat: 'cap', hatColor: '#2a2a3a', hat2: '#c8a040', outfit: '#3a3a4a', outfit2: '#c8a040', eye: '#1a1020', lip: '#8a4a3a', bg: ['#5a2a2a', '#c86a3a'], brows: 'angry', facial: 'mustache' },
    dt_pinkerton: { skin: '#f0d0b8', hair: '#6a4a2a', hairStyle: 'swept', hat: 'bowler', hatColor: '#3a3a3a', hat2: '#8a8a8a', outfit: '#3a3a3a', outfit2: '#f6ecd8', eye: '#3a5a8a', lip: '#9a6a6a', bg: ['#1a1018', '#c86a3a'], eyes: 'narrow', deco: ['collar', 'badge'] },
    dt_thrall:    { skin: '#d8d0e0', hair: '#1a1020', hairStyle: 'long', hat: 'headband', hatColor: '#6a1a2a', hat2: '#c8a040', outfit: '#3a1a2a', outfit2: '#c8a040', eye: '#e8323c', lip: '#6a1a2a', bg: ['#1a1020', '#8a6a3a'], extra: 'grin' },
    dt_knight:    { skin: '#b8b0c0', hair: '#1a1020', hairStyle: 'verylong', hat: 'helm', hatColor: '#3a3a4a', hat2: '#c8323c', outfit: '#3a3a4a', outfit2: '#8a8a9a', eye: '#e8323c', lip: '#4a3a4a', bg: ['#1a1020', '#6a5a4a'], eyes: 'glare', brows: 'angry' },
    pm_wamuu:     { skin: '#d8b890', hair: '#1a1020', hairStyle: 'long', hat: 'headband', hatColor: '#c8a040', hat2: '#3fb8a9', outfit: '#8a6a4a', outfit2: '#c8a040', eye: '#3fb8a9', lip: '#6a3a2a', bg: ['#3fb8a9', '#e8e0c8'], eyes: 'sharp', brows: 'thick', mouth: 'gritted', facial: 'goatee' },
    pm_esidisi:   { skin: '#e0b088', hair: '#f6ecd8', hairStyle: 'braids', hat: 'headband', hatColor: '#c8323c', hat2: '#f2c14e', outfit: '#c8323c', outfit2: '#f2c14e', eye: '#e8742a', lip: '#8a3a2a', bg: ['#c8323c', '#f2c14e'], eyes: 'sharp', mouth: 'teeth', deco: ['earring:#f2c14e'] },
  });
  (() => {
    const INK = '#1a1020';
    const S = `stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
    let n = 0;
    const draw = {
      scorpion: c => `<path d="M50 96 Q40 70 44 50 Q48 30 64 22 Q80 16 82 30 Q84 40 74 42 L70 36" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M50 96 Q40 70 44 50 Q48 30 64 22 Q80 16 82 30 Q84 40 74 42 L70 36" fill="none" stroke="${c}" stroke-width="5.5" stroke-linecap="round"/>
        <path d="M70 36 l-6 -4 4 8z" fill="#c8323c" ${S}/>
        <ellipse cx="50" cy="96" rx="20" ry="12" fill="${c}" ${S}/><path d="M34 92 h32 M36 100 h28" stroke="${INK}" stroke-width="1.4"/>
        <path d="M32 90 Q14 84 12 70 Q20 74 24 70 Q22 80 34 86 M68 90 Q86 84 88 70 Q80 74 76 70 Q78 80 66 86" fill="${c}" ${S}/>
        ${[-1, 1].map(s => [0, 1, 2].map(i => `<path d="M${50 + s * 16} ${98 + i * 3} l${s * 14} ${6 + i * 4}" ${S}/>`).join('')).join('')}
        <circle cx="45" cy="88" r="2" fill="${INK}"/><circle cx="55" cy="88" r="2" fill="${INK}"/>`,
      tommy: c => `<ellipse cx="50" cy="70" rx="26" ry="34" fill="${c}" opacity=".55"/><path d="M34 110 Q30 70 38 52 Q44 36 50 34 Q56 36 62 52 Q70 70 66 110 Q58 102 50 110 Q42 102 34 110Z" fill="#3a3040" ${S}/>
        <circle cx="44" cy="56" r="4" fill="${c}" ${S}/><circle cx="56" cy="56" r="4" fill="${c}" ${S}/><path d="M44 70 q6 4 12 0" stroke="${c}" stroke-width="2" fill="none"/>
        <path d="M66 70 L82 58" ${S}/><rect x="76" y="44" width="14" height="18" rx="3" fill="#f2c14e" ${S}/><path d="M78 50 h10 M78 56 h10" stroke="${INK}" stroke-width="1"/>
        <path d="M34 72 L20 60 l-4 -8 8 2" fill="#8a8a9a" ${S}/><text x="6" y="30" font-family="Bangers,Impact" font-size="14" fill="${c}" stroke="${INK}" stroke-width=".8">KNOCK KNOCK</text>`,
      suit: c => `<path d="M30 118 L34 70 Q36 46 50 42 Q64 46 66 70 L70 118 L58 118 L56 90 L44 90 L42 118Z" fill="${c}" ${S}/>
        <ellipse cx="50" cy="30" rx="14" ry="16" fill="${c}" ${S}/><path d="M38 28 Q50 20 62 28 L60 36 Q50 32 40 36Z" fill="#9fd0f0" ${S}/><path d="M42 30 h16" stroke="#fff" stroke-width="2"/>
        <path d="M34 66 L18 84 L22 88 L36 76 M66 66 L82 84 L78 88 L64 76" fill="${c}" ${S}/>
        <path d="M38 118 h-10 l2 -4 h10 M62 118 h10 l-2 -4 h-10" fill="#c8d8e8" ${S}/>
        ${[[24, 50], [78, 40], [16, 100], [84, 104], [50, 60]].map(([x, y]) => `<g stroke="#fff" stroke-width="1.6"><path d="M${x} ${y - 5} v10 M${x - 4} ${y - 3} l8 6 M${x + 4} ${y - 3} l-8 6"/></g>`).join('')}
        <text x="50" y="112" text-anchor="middle" font-family="Bangers,Impact" font-size="11" fill="#fff" stroke="${INK}" stroke-width=".7">GENTLY WEEPS</text>`,
    };
    const orig = SBR.art.creature;
    SBR.art.creature = (kind, color, bg = ['#5b3a8c', '#e8742a']) => {
      if (!draw[kind]) return orig(kind, color, bg);
      const id = 'dtc' + (++n);
      return `<svg class="portrait" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>
        <pattern id="${id}d" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="${INK}" opacity=".18"/></pattern></defs>
        <rect width="100" height="120" fill="url(#${id}g)"/><rect width="100" height="120" fill="url(#${id}d)"/>${draw[kind](color)}</svg>`;
    };
  })();

  /* ================= 2. Materials and exclusive gear ================= */
  SBR.MATERIALS.pillarstone = { name: 'Pillar Stone', rarity: 'rare', group: 'detour', desc: 'A chip of the columns the Pillar Men slept in. Warm on one side, cold on the other.' };
  Object.assign(SBR.EQUIPMENT, {
    pilgrim_rosary:  { slot: 'charm', family: 'holy', name: 'Pilgrim\'s Rosary', rarity: 'rare', stats: { res: 3, luck: 2 }, bonus: { heal: 0.12, res: { stand: -0.1, holy: -0.2 } }, recipe: { palmsand: 1, sunbone: 2 }, price: 140, area: 'devilspalm', note: 'Beads of bone from a pilgrim who walked the Saint\'s road long before the race.' },
    mirage_veil:     { slot: 'hat', name: 'Heat-Haze Veil', rarity: 'rare', stats: { ride: 3, luck: 2 }, bonus: { dodge: 0.08 }, recipe: { palmsand: 1, cloth: 2 }, price: 120, area: 'devilspalm', note: 'Woven from the air above the Palm. People keep aiming a little to your left.' },
    miner_lamp:      { slot: 'hat', name: 'Deep-Shaft Lamp Helmet', rarity: 'rare', stats: { aim: 3, grit: 2 }, bonus: { crit: 0.04, immune: ['blind'] }, recipe: { deepsilver: 1, scrap: 2 }, price: 120, area: 'silvermine', note: 'The lamp never goes out. Neither does whatever is knocking on the walls.' },
    tommy_hammer:    { slot: 'weapon', name: 'Tommyknocker\'s Hammer', rarity: 'rare', stats: { grit: 4, aim: 2 }, bonus: { dmg: 0.06, res: { sound: -0.25 } }, recipe: { deepsilver: 2, scrap: 1 }, price: 130, area: 'silvermine' },
    gently_weeps:    { slot: 'coat', name: 'White Album Suit', rarity: 'rare', stats: { grit: 4, res: 2 }, bonus: { res: { bullet: -0.25, cold: -0.4 } }, recipe: { lakeice: 3, silver: 1 }, price: 150, area: 'lakeice', note: 'Ghiaccio\'s armour, still skating on its own until someone stopped it. Bullets freeze in the air in front of it.' },
    pinkerton_badge: { slot: 'charm', family: 'trophy', name: 'Pinkerton Shield', rarity: 'rare', stats: { aim: 3 }, bonus: { crit: 0.06, init: 2 }, recipe: { railspike: 2, silver: 1 }, price: 130, area: 'railyard', note: 'The eye that never sleeps.' },
    wamuu_headdress: { slot: 'hat', name: 'Wamuu\'s Headdress', rarity: 'rare', stats: { ride: 4, grit: 2 }, bonus: { dodge: 0.06, res: { phys: -0.1 } }, recipe: { pillarstone: 2, gold: 1 }, price: 150, area: 'pillartomb', note: 'The horned band of a warrior who respected his enemies.' },
    esidisi_veins:   { slot: 'weapon', name: 'Esidisi\'s Heat Veins', rarity: 'rare', stats: { spin: 4, aim: 3 }, bonus: { bleedOnBasic: 0.25, res: { cold: -0.2 } }, recipe: { pillarstone: 2, fang: 1 }, price: 150, area: 'pillartomb', note: 'Boiling blood in a whip of vessels. Wear gloves.' },
  });
  (() => {
    const I = SBR.icons, P = I.P, K = I.K, st = I.st, shine = I.shine;
    I.define('mat', 'pillarstone', () => `<path d="M14 42 L16 10 Q24 4 32 10 L34 42Z" fill="#c8a888" ${st}/><path d="M18 18 h12 M18 26 h12 M18 34 h12" stroke="${K}" stroke-width="1.2" opacity=".5"/><circle cx="24" cy="14" r="2.4" fill="#c8323c"/>${shine(20, 20, 2)}`);
    const e = (id, fn) => I.define('equip', id, fn);
    e('pilgrim_rosary', () => `${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i / 8 * Math.PI * 2; return `<circle cx="${(24 + Math.cos(a) * 12).toFixed(1)}" cy="${(20 + Math.sin(a) * 12).toFixed(1)}" r="3" fill="#efe4c8" ${st} stroke-width="1.4"/>`; }).join('')}<path d="M24 32 V44 M19 37 H29" stroke="${K}" stroke-width="4" stroke-linecap="round"/><path d="M24 32 V44 M19 37 H29" stroke="#f2c14e" stroke-width="2" stroke-linecap="round"/>`);
    e('mirage_veil', () => `<path d="M8 22 Q24 6 40 22 L44 40 Q24 32 4 40Z" fill="#ffd08a" opacity=".85" ${st}/><path d="M10 30 q6 -4 12 0 t12 0" stroke="#e8742a" stroke-width="1.6" fill="none"/>`);
    e('miner_lamp', () => P.hat('#c8a040', '#6a5a3a') + `<circle cx="24" cy="14" r="5" fill="#fff3a0" ${st}/><path d="M24 8 v-5 M18 10 l-3 -3 M30 10 l3 -3" stroke="#f2c14e" stroke-width="2"/>`);
    e('tommy_hammer', () => `<path d="M10 40 L30 20" stroke="${K}" stroke-width="6" stroke-linecap="round"/><path d="M10 40 L30 20" stroke="#8a5a30" stroke-width="3" stroke-linecap="round"/><path d="M24 12 L36 24 L42 18 L30 6Z" fill="#c8d0e0" ${st}/>`);
    e('gently_weeps', () => P.coat('#e8f4ff', '#9fd0f0') + `<g stroke="#6aa0d0" stroke-width="1.6"><path d="M24 22 v10 M20 24 l8 6 M28 24 l-8 6"/></g>`);
    e('pinkerton_badge', () => P.badge('#c8c8d8') + `<circle cx="24" cy="21" r="3" fill="${K}"/>`);
    e('wamuu_headdress', () => `<path d="M6 30 Q24 18 42 30 Q24 24 6 36z" fill="#c8a040" ${st}/><path d="M24 22 L22 4 L28 20" fill="#f6ecd8" ${st}/><circle cx="24" cy="26" r="3" fill="#3fb8a9" ${st} stroke-width="1.2"/>`);
    e('esidisi_veins', () => `<path d="M8 40 Q16 26 24 30 Q32 34 40 8" stroke="${K}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M8 40 Q16 26 24 30 Q32 34 40 8" stroke="#c8323c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M14 34 l-4 -4 M30 30 l4 -2" stroke="#e8742a" stroke-width="2"/>`);
  })();

  /* ================= 3. Hazard for the new detour ================= */
  SBR.STATUS.entombed = { name: 'Sunless', glyph: '闇', color: '#4a2a3a', kind: 'buff', mode: 'turns', desc: () => 'No sunlight reaches here: takes 40% less Holy damage.', res: { holy: -0.4 } };
  SBR.icons.define('status', 'entombed', () => `<circle cx="24" cy="24" r="18" fill="#2a1a2a" ${SBR.icons.st}/><path d="M24 12 A12 12 0 1 0 24 36 A9 12 0 1 1 24 12Z" fill="#f2c14e" ${SBR.icons.st} stroke-width="1.4"/>`);
  SBR.HAZARDS.sunless = { name: 'No Sunlight', desc: 'No daylight reaches the tomb. The undead regenerate 3 HP every round and take 40% less Holy damage.',
    round(c) { c.units.filter(u => u.side === 'enemy' && !u.dead && u.def && u.def.undead).forEach(u => { c.addStatus(u, 'entombed', 0, 1, true); if (c.round > 1) c.heal(null, u, 3); }); } };

  /* ================= 4. Enemies ================= */
  const E = SBR.ENEMIES;
  Object.assign(E, {
    // ---- Devil's Palm ----
    palm_scorpion: { name: 'Palm Scorpion', art: beast('scorpion', '#c8843a', ['#e8742a', '#f6c27a']), hp: 18, stats: { ride: 6, grit: 4 }, xp: 6, money: [0, 4], native: true, dtype: 'bleed', res: { phys: -0.2, cold: 0.4 },
      abilities: [{ name: 'Stinger', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 4, {}); if (r.hit) x.status(x.target, 'bleed', 2); } },
        { name: 'Pincer Lock', w: 1, cd: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 5, {}, { dtype: 'phys' }); if (r.hit && x.roll(0.3)) x.status(x.target, 'stun', 0, 1); } }] },
    palm_mirage_copy: { name: 'Heat Haze', art: port('dt_mirage'), hp: 12, stats: { ride: 9 }, xp: 2, money: [0, 0], native: true, dtype: 'stand', res: { phys: -0.5, bullet: -0.5, holy: 0.5 },
      abilities: [{ name: 'Shimmer Strike', w: 1, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 4, { ride: 0.02 }) }] },
    palm_mirage: { name: 'Rider #214', title: 'Still Riding the First Stage', art: port('dt_mirage'), tier: 'elite', hp: 46, stats: { ride: 9, aim: 5 }, xp: 22, money: [20, 35], native: true, dtype: 'stand', res: { phys: -0.3, bullet: -0.3, holy: 0.3 },
      quote: 'Day one! Day one of the race! Why does it keep being day one?', passive: 'Half of him is heat haze: starts Evasive, and splits off a copy when hurt. Holy burns the haze away.',
      abilities: [
        { name: 'Heat-Haze Lasso', w: 3, target: 'enemy', fx: 'rope', run: x => { const r = x.dmg(x.target, 6, { ride: 0.03 }); if (r.hit) x.status(x.target, 'hooked', 0, 1); } },
        { name: 'Shimmer', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => x.status(x.user, 'evasive', 0, 2) },
        { name: 'Mirage Charge', w: 2, cd: 2, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => x.dmg(e, 4, { ride: 0.02 })) },
      ],
      hooks: { start: x => x.status(x.user, 'evasive', 0, 2), damaged: x => { if (!x.flag('mirageSplit') && x.user.hp < x.user.maxHp * 0.5) { x.setFlag('mirageSplit'); x.summon('palm_mirage_copy'); x.summon('palm_mirage_copy'); x.log('The rider splits into three shimmering copies.'); } } } },
    palm_pilgrim: { name: 'The Pilgrim Who Stayed', title: 'Keeper of the Saint\'s Road', art: port('dt_pilgrim'), tier: 'boss', hp: 150, stats: { res: 8, luck: 6 }, xp: 72, money: [55, 80], native: true, dtype: 'holy',
      res: { holy: -1, stand: -0.2, phys: 0.2, bullet: 0.2 },
      stand: 'The Palm\'s Blessing', sigil: 'cross', sigilColor: '#f2c14e', quote: 'Nineteen centuries ago He was carried through this sand, and I stayed to keep the road. What do you carry, rider?',
      passive: 'Immune to Holy. Heals and Sanctifies his dead each round, and raises another from the sand. Physical and Gunshot damage hurt him more.',
      abilities: [
        { name: 'Staff of the Road', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 8, { res: 0.04 }, { dtype: 'phys' }) },
        { name: 'Sermon of the Sun', w: 2, cd: 2, target: 'allEnemies', fx: 'golden', run: x => x.enemies.forEach(e => { x.dmg(e, 5, { res: 0.02 }); if (x.roll(0.4)) x.status(e, 'blind', 0, 1); }) },
        { name: 'Prayer of Dust', w: 2, cd: 2, target: 'ally', fx: 'heal', run: x => { const t = x.target || x.user; x.heal(t, 12, { res: 0.03 }); x.status(t, 'sanctified', 0, 2); } },
        { name: 'Raise the Faithful', w: 1, cd: 3, target: 'self', fx: 'buff', cond: x => x.allies.length < 4, run: x => x.summon('dust_wraith') },
      ],
      hooks: { roundStart: x => x.allies.filter(a => a !== x.user).forEach(a => x.status(a, 'sanctified', 0, 1)) } },
    // ---- Silver Mine ----
    tommyknocker: { name: 'Tommyknocker', art: beast('tommy', '#9fe0ff', ['#0a0810', '#3a3040']), hp: 16, stats: { ride: 7 }, xp: 6, money: [2, 8], native: true, dtype: 'sound', res: { phys: -0.4, bullet: -0.4, sound: 0.3, holy: 0.3 },
      passive: 'A mine spirit. Its knocking stamps a sound on you that hurts when you act.',
      abilities: [{ name: 'Knock Knock', w: 3, target: 'enemy', fx: 'sound', run: x => { const r = x.dmg(x.target, 4, {}); if (r.hit && x.roll(0.5)) x.status(x.target, 'sound', 1); } },
        { name: 'Snuff the Lantern', w: 1, cd: 3, target: 'allEnemies', fx: 'debuff', run: x => x.enemies.forEach(e => { if (x.roll(0.5)) x.status(e, 'blind', 0, 1); }) }] },
    dino_foreman: { name: 'Foreman Halloran', title: 'The Dinosaurified Shift Boss', art: port('dt_foreman'), tier: 'elite', hp: 58, stats: { grit: 8, aim: 5 }, xp: 26, money: [30, 45], dtype: 'bleed', res: { phys: -0.2, cold: 0.3, holy: 0.2 },
      quote: 'Shift\'s not over till I say. And I say NEVER. Ssss.', passive: 'Bites Fossilize. Calls the rest of the shift out of the walls.',
      abilities: [
        { name: 'Pickaxe Jaw', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 8, { grit: 0.03 }); if (r.hit) x.status(x.target, 'fossil', 1); } },
        { name: 'Blasting Order', w: 1, cd: 3, target: 'allEnemies', fx: 'boom', run: x => x.enemies.forEach(e => x.dmg(e, 5, {}, { dtype: 'phys' })) },
        { name: 'Call the Shift', w: 1, cd: 4, target: 'self', fx: 'buff', cond: x => x.allies.length < 3, run: x => x.summon('raptor') },
      ] },
    // ---- Frozen Lake ----
    drowned_racer: { name: 'Drowned Racer', art: port('dt_drowned'), undead: true, hp: 26, stats: { grit: 5 }, xp: 9, money: [6, 14], native: true, dtype: 'cold', res: { cold: -0.6, bleed: -0.3, holy: 0.3 },
      passive: 'Went through the ice in the last race. Undead: Holy deals double.',
      abilities: [{ name: 'Frozen Grip', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 5, {}); if (r.hit) x.status(x.target, 'chilled', 0, 1); } },
        { name: 'Pull Under', w: 1, cd: 3, target: 'enemy', fx: 'rope', run: x => { const r = x.dmg(x.target, 7, {}); if (r.hit) x.status(x.target, 'hooked', 0, 1); } }] },
    white_album: { name: 'White Album', title: 'Ghiaccio\'s Suit, Walking Empty', art: beast('suit', '#e8f4ff', ['#1a2a4a', '#9fd0f0']), tier: 'boss', hp: 165, stats: { ride: 9, grit: 7 }, xp: 74, money: [55, 80], native: true, dtype: 'cold',
      res: { cold: -1, bullet: -0.6, phys: -0.2, spin: 0.3, sound: 0.4, holy: 0.1 },
      stand: 'White Album: Gently Weeps', sigil: 'claw', sigilColor: '#9fd0f0', quote: 'Its wearer is gone. The suit kept skating anyway, round and round the lake, freezing everything that came near.',
      passive: 'Immune to Cold, nearly bulletproof. GENTLY WEEPS: every other round it freezes the air and reflects 40% of the damage it takes. Spin and Sound crack its ice.',
      abilities: [
        { name: 'Skate Charge', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 9, { ride: 0.03 }, { dtype: 'phys' }) },
        { name: 'Absolute Zero', w: 2, cd: 2, target: 'allEnemies', fx: 'rain', run: x => x.enemies.forEach(e => { x.dmg(e, 5, {}); x.status(e, 'chilled', 0, 2); }) },
        { name: 'Ice Armour', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => x.status(x.user, 'shield', 18) },
      ],
      hooks: { roundStart: x => { if (x.round % 2 === 0) { x.status(x.user, 'reflect', 0, 1); x.c.push({ t: 'float', uid: x.user.uid, text: 'GENTLY WEEPS', cls: 'block big' }); x.log('The air around the suit freezes solid. Hits bounce back.'); } } } },
    // ---- Philadelphia Rail Yard ----
    yard_bull: { name: 'Yard Bull', art: port('dt_yardbull'), hp: 32, stats: { grit: 6, aim: 4 }, xp: 10, money: [12, 22], res: { phys: -0.1 },
      abilities: [{ name: 'Nightstick', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 7, { grit: 0.03 }) },
        { name: 'Lantern Swing', w: 1, cd: 3, target: 'enemy', fx: 'hit', run: x => { x.dmg(x.target, 4, {}); if (x.roll(0.5)) x.status(x.target, 'blind', 0, 1); } }] },
    pinkerton: { name: 'Pinkerton Agent', title: 'The Eye That Never Sleeps', art: port('dt_pinkerton'), tier: 'elite', hp: 62, stats: { aim: 9, ride: 5 }, xp: 28, money: [35, 50], res: { bullet: -0.2 },
      quote: 'The Agency has a file on you. It is thicker than the Bible.', passive: 'Scans a rider and focuses fire on them.',
      abilities: [
        { name: 'Detective Special', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 9, { aim: 0.04 }) },
        { name: 'Case File', w: 1, cd: 3, target: 'enemy', fx: 'scan', run: x => { x.status(x.target, 'marked', 0, 2); x.status(x.user, 'empower', 0, 2); } },
        { name: 'Twin Shot', w: 2, cd: 2, target: 'enemy', fx: 'gun', run: x => { x.dmg(x.target, 5, { aim: 0.03 }); const o = x.randomEnemy(); if (o) x.dmg(o, 5, { aim: 0.03 }); } },
      ] },
    // ---- The Pillar Tomb ----
    tomb_thrall: { name: 'Tomb Thrall', art: port('dt_thrall'), undead: true, hp: 24, stats: { grit: 5, ride: 6 }, xp: 9, money: [6, 14], dtype: 'bleed', res: { bleed: -0.3, bullet: -0.1, holy: 0.3 },
      passive: 'A Stone Mask vampire made to guard the tomb. Undead: Holy deals double.',
      abilities: [{ name: 'Blood Drink', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 5, {}); if (r.hit) x.heal(x.user, Math.ceil((r.amount || 0) / 2)); } },
        { name: 'Eye Beams', w: 1, cd: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 7, {}, { dtype: 'stand' }) }] },
    black_knight: { name: 'The Black Knight', title: 'Guardian of the Sleeping Pillar', art: port('dt_knight'), tier: 'elite', undead: true, hp: 62, stats: { grit: 9, spin: 5 }, xp: 28, money: [30, 45], dtype: 'phys', res: { phys: -0.3, bullet: -0.3, bleed: -0.5, holy: 0.3, spin: 0.2 },
      quote: 'Three hundred years I have kept this door. My hair is longer than my patience.', passive: 'Armoured and undead: -30% Physical and Gunshot, Holy deals double. His hair binds and bleeds.',
      abilities: [
        { name: 'Greatsword', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 10, { grit: 0.03 }) },
        { name: 'Hair Needles', w: 2, cd: 3, target: 'enemy', fx: 'rope', run: x => { const r = x.dmg(x.target, 5, {}, { dtype: 'bleed' }); if (r.hit) { x.status(x.target, 'hooked', 0, 1); x.status(x.target, 'bleed', 3); } } },
      ],
      hooks: { damaged: x => { if (!x.flag('knightStand') && x.user.hp < x.user.maxHp * 0.3) { x.setFlag('knightStand'); x.status(x.user, 'empower', 0, 3); x.say(x.user, 'I will not fall twice!'); } } } },
    pm_wamuu: { name: 'Wamuu', title: 'Warrior of the Wind', art: port('pm_wamuu'), tier: 'boss', undead: true, hp: 120, stats: { ride: 10, grit: 8, aim: 6 }, xp: 60, money: [45, 65], dtype: 'phys',
      res: { phys: -0.2, bullet: -0.3, bleed: -0.4, holy: 0.3, sound: 0.3 },
      stand: 'Wind Mode', sigil: 'star', sigilColor: '#3fb8a9', quote: 'I have never refused a warrior\'s challenge. You woke us. Fight with everything you have.',
      passive: 'Pillar Man: Holy deals double. WIND PROTECTOR keeps him Evasive. When Esidisi falls, Wamuu fights with everything: Divine Sandstorm every turn it can.',
      abilities: [
        { name: 'Horn Strike', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 9, { ride: 0.03 }) },
        { name: 'Divine Sandstorm', w: 2, cd: 3, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => { x.dmg(e, 7, { ride: 0.02 }); if (x.roll(0.4)) x.status(e, 'blind', 0, 1); }) },
        { name: 'Wind Protector', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'evasive', 0, 2); x.status(x.user, 'shield', 12); } },
      ],
      hooks: {
        start: x => { if (R() && R().flags.pillarLore) x.status(x.user, 'marked', 0, 2); },
        roundStart: x => { if (!x.flag('wamuuAlone') && !x.allies.some(a => a.id === 'pm_esidisi')) { x.setFlag('wamuuAlone'); x.user.cds = {}; x.status(x.user, 'empower', 0, 99); x.say(x.user, 'Esidisi... I will fight for both of us now.'); } },
      } },
    pm_esidisi: { name: 'Esidisi', title: 'Flame of the Pillar', art: port('pm_esidisi'), tier: 'boss', undead: true, hp: 105, stats: { spin: 8, grit: 7 }, xp: 55, money: [40, 60], dtype: 'phys',
      res: { phys: -0.2, bleed: -0.4, cold: 0.4, holy: 0.3 },
      passive: 'Pillar Man: Holy deals double, Cold hurts his boiling blood. When badly hurt, he weeps loudly, cleanses himself and calms down.',
      abilities: [
        { name: 'Heat Mode', w: 3, target: 'enemy', fx: 'boom', run: x => { const r = x.dmg(x.target, 8, { spin: 0.03 }); if (r.hit) x.status(x.target, 'burn', 2); } },
        { name: 'Boiling Vessels', w: 2, cd: 2, target: 'allEnemies', fx: 'spray', run: x => x.enemies.forEach(e => { x.dmg(e, 4, { spin: 0.02 }); x.status(e, 'burn', 1); }) },
      ],
      hooks: {
        start: x => { if (R() && R().flags.pillarLore) x.status(x.user, 'marked', 0, 2); },
        damaged: x => { if (!x.flag('esidisiCry') && x.user.hp < x.user.maxHp * 0.4) { x.setFlag('esidisiCry'); x.cleanse(x.user, 99); x.heal(x.user, Math.round(x.user.maxHp * 0.2)); x.say(x.user, 'AAAAHHH! AAHHH! ...Ah. I\'m calm now. I cry when I\'m upset.'); } },
      } },
  });
  Object.assign(SBR.DROPS, {
    palm_scorpion: [['venom', 0.5, 1, 1], ['palmsand', 0.2, 1, 1]], palm_mirage: [['palmsand', 0.8, 1, 2], ['cloth', 0.6, 1, 2]], palm_pilgrim: [['palmsand', 1, 2, 3], ['sunbone', 1, 2, 3], ['gold', 0.6, 1, 1]],
    tommyknocker: [['deepsilver', 0.3, 1, 1], ['scrap', 0.4, 1, 1]], dino_foreman: [['deepsilver', 0.8, 1, 2], ['fossil', 0.8, 1, 2], ['scale', 0.5, 1, 1]],
    drowned_racer: [['lakeice', 0.5, 1, 1], ['horsehair', 0.4, 1, 1]], white_album: [['lakeice', 1, 2, 3], ['silver', 1, 1, 2], ['rainvial', 0.5, 1, 1]],
    yard_bull: [['railspike', 0.6, 1, 2], ['scrap', 0.3, 1, 1]], pinkerton: [['railspike', 0.8, 1, 2], ['silver', 0.6, 1, 1], ['wire', 0.5, 1, 1]],
    tomb_thrall: [['pillarstone', 0.2, 1, 1], ['fang', 0.4, 1, 1]], black_knight: [['pillarstone', 0.7, 1, 1], ['silver', 0.6, 1, 1], ['gold', 0.3, 1, 1]],
    pm_wamuu: [['pillarstone', 1, 1, 2], ['gold', 1, 1, 2]], pm_esidisi: [['pillarstone', 1, 1, 2], ['fang', 1, 1, 2]],
  });

  // economy.js folded the old material ids before this file loaded: fold ours the same way
  ['palm_scorpion', 'palm_mirage', 'palm_pilgrim', 'tommyknocker', 'dino_foreman', 'drowned_racer', 'white_album', 'yard_bull', 'pinkerton', 'tomb_thrall', 'black_knight', 'pm_wamuu', 'pm_esidisi'].forEach(k => {
    const rows = {}; (SBR.DROPS[k] || []).forEach(([m, ch, a, b]) => { const j = SBR.matId(m); const o = rows[j]; rows[j] = o ? [j, Math.min(1, Math.max(o[1], ch) + 0.1), o[2], Math.max(o[3], b)] : [j, ch, a, b]; }); SBR.DROPS[k] = Object.values(rows); });
  ['pilgrim_rosary', 'mirage_veil', 'miner_lamp', 'tommy_hammer', 'gently_weeps', 'pinkerton_badge', 'wamuu_headdress', 'esidisi_veins'].forEach(k => { const e = SBR.EQUIPMENT[k]; if (e.recipe && SBR.foldRecipe) e.recipe = SBR.foldRecipe(e.recipe); });

  /* ================= 5. The detours: new fights, materials, bosses ================= */
  const A = SBR.AREAS;
  A.devilspalm.fights.push(['palm_scorpion', 'palm_scorpion', 'dust_wraith'], ['palm_mirage', 'sidewinder']);
  A.devilspalm.mats.push('venom');
  A.devilspalm.altBoss = { enemies: ['palm_pilgrim', 'dust_wraith'], name: 'The Pilgrim Who Stayed', blurb: 'A robed figure waits at the centre of the Palm, leaning on a staff. The sand bows around him.',
    when: () => !!inArea().pilgrim || (SBR.corpse && SBR.corpse.count() >= 2 && Math.random() < 0.5),
    reward: g => { g.gear('pilgrim_rosary'); g.mat('palmsand', 1); }, rewardText: 'The pilgrim lays down his staff and becomes sand. His rosary stays behind, warm, on top of the dune.' };
  A.silvermine.fights.push(['tommyknocker', 'tommyknocker', 'claim_jumper'], ['dino_foreman', 'cave_bat']);
  A.silvermine.deepText = 'The colossus falls through the floor, and the floor keeps going. Far below, in the dark, something enormous turns its head. The skull in the wall was only the beginning.';
  A.lakeice.fights.push(['drowned_racer', 'drowned_racer', 'wolf'], ['drowned_racer', 'ice_trapper']);
  A.lakeice.mats.push('horsehair');
  A.lakeice.altBoss = { enemies: ['white_album'], name: 'White Album, Walking Empty', blurb: 'An empty armoured suit skates in circles at the middle of the lake. Everything near it is frozen solid.',
    when: () => !!inArea().wa || Math.random() < 0.2,
    reward: g => { g.gear('gently_weeps'); g.mat('lakeice', 2); g.pace(8); }, rewardText: 'The suit stops skating and falls over, empty. It is still cold enough to stop a bullet. You take it, and take the straight road east across the ice.' };
  A.railyard.fights.push(['yard_bull', 'yard_bull', 'rail_detective'], ['pinkerton', 'yard_bull']);
  A.railyard.mats.push('wire');
  A.railyard.deepText = 'Tattoo You! scatter. On the next track, a single sleeper car is waiting with its lamps lit, coupled to nothing. Someone inside is turning the pages of a newspaper.';

  A.pillartomb = { name: 'The Pillar Tomb', sub: 'Ruins under the Rockies, carved before Rome. Something in the columns is breathing', acts: [2, 3], stages: 3, scene: 11, hazard: 'sunless', color: '#c8323c',
    fights: [['tomb_thrall', 'tomb_thrall'], ['sd_zombie', 'sd_zombie', 'tomb_thrall'], ['black_knight', 'tomb_thrall'], ['tomb_thrall', 'sd_vampire', 'sd_zombie']],
    mats: ['pillarstone', 'gold', 'fang', 'silver'], boss: { enemies: ['pm_wamuu', 'pm_esidisi'], name: 'The Warriors in the Pillars' },
    deepText: 'Wamuu and Esidisi crumble to ash. Behind their pillars, the sealed door you opened stands wide, and a red light is pulsing down there like a heartbeat.',
    reward: g => { g.mat('pillarstone', 2); g.mat('gold', 1); g.threat(-0.5); }, rewardText: 'The two warriors turn to stone, and the stone to sand. You climb back into the sun carrying a chip of their pillars.' };
  Object.entries(A).forEach(([id, a]) => { a.mats = [...new Set(a.mats.map(SBR.matId))]; SBR.SCAVENGE_MATS['area_' + id] = a.mats; });

  // entry encounter on the main route, like the other detours
  (() => {
    const id = 'pillartomb', T = A[id];
    const text = 'A landslide has opened the mountain. Behind it: carved columns older than anything in America, each with a man-shaped hollow in it. Two of the hollows are not empty. A cold draught comes up from below.';
    SBR.EVENTS.push({ id: 'area_' + id, acts: T.acts, type: 'detour', title: 'The Pillars in the Mountain', blurb: 'A landslide has uncovered ruins that should not exist.', icon: 'map', weight: 3, once: true, pace: 0, art: 'pm_wamuu', detour: id,
      cond: g => !SBR.run.area && SBR.run.stage < SBR.ACTS[SBR.run.act].stages - 1, text,
      html: `${text}<span class="ev-path" style="--pc:${T.color}"><b>Detour: ${T.name}</b> — ${T.stages} stages and a boss, then back to the race (−10 pace).<br><i>Hazard: ${SBR.HAZARDS[T.hazard].name}. ${SBR.HAZARDS[T.hazard].desc}</i></span>`,
      choices: [
        { label: `Enter ${T.name}`, ok: { text: 'You light a lantern and climb down between the pillars.', fx: g => g.enterArea(id) } },
        { label: 'Take what the landslide uncovered and ride on', ok: { text: 'Chips of carved stone and an old gold ornament. The draught from below follows you for a mile.', fx: g => { g.mat('pillarstone', 1); g.mat('gold', 1); } } },
      ] });
    SBR.CONSEQ['area_pillartomb:0'] = { rep: { vatican: 1 }, deed: 'Went down into the Pillar Tomb under the Rockies.' };
    SBR.CONSEQ['area_pillartomb:1'] = { rep: { racers: 1 }, deed: 'Looted the mouth of the Pillar Tomb and rode on.' };
  })();

  // the tomb's backdrop: the Silver Mine's dark, with carved pillars and a red glow
  SBR.art.SCENES[11] = Object.assign({}, SBR.art.SCENES[8], { name: 'The Pillar Tomb' });
  (() => {
    const base = SBR.art.scene;
    const K = '#1a1020';
    const pillar = (x, h, face) => `<g transform="translate(${x} 0)"><path d="M-34 600 L-30 ${600 - h} L30 ${600 - h} L34 600Z" fill="#8a6a50" stroke="${K}" stroke-width="4"/><path d="M-40 ${600 - h} H40 V${580 - h} H-40Z" fill="#a8866a" stroke="${K}" stroke-width="4"/>` +
      [0.25, 0.5, 0.75].map(t => `<path d="M-30 ${Math.round(600 - h * t)} H30" stroke="${K}" stroke-width="2" opacity=".5"/>`).join('') +
      (face ? `<path d="M-14 ${640 - h} Q0 ${620 - h} 14 ${640 - h} L12 ${700 - h} Q0 ${712 - h} -12 ${700 - h}Z" fill="#c8a888" stroke="${K}" stroke-width="3"/><path d="M-8 ${656 - h} h5 M3 ${656 - h} h5" stroke="#c8323c" stroke-width="3"/><path d="M-6 ${684 - h} q6 4 12 0" stroke="${K}" stroke-width="2" fill="none"/>` : '') + '</g>';
    const over = `<div class="dt-tomb-over"><svg viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="dtTombGlow" cx="50%" cy="80%" r="55%"><stop offset="0" stop-color="#ff4a3a" stop-opacity=".55"/><stop offset="1" stop-color="#ff4a3a" stop-opacity="0"/></radialGradient></defs>
      <rect width="1600" height="600" fill="url(#dtTombGlow)"/>${pillar(150, 420, true)}${pillar(470, 360, false)}${pillar(1130, 380, true)}${pillar(1450, 440, false)}
      <path d="M640 600 L700 470 H900 L960 600Z" fill="#6a4a3a" stroke="${K}" stroke-width="4"/><path d="M720 470 L760 420 H840 L880 470Z" fill="#8a6a50" stroke="${K}" stroke-width="4"/><circle cx="800" cy="444" r="12" fill="#c8323c" stroke="${K}" stroke-width="3"/></svg></div>`;
    SBR.art.scene = (id, opts = {}) => {
      if (+id !== 11) return base(id, opts);
      return base(8, opts).replace('class="scene scn act8', 'class="scene scn act8 act11').replace('<div class="scene-vignette">', over + '<div class="scene-vignette">');
    };
    if (SBR.music && SBR.music.themeForStage) {
      const t = SBR.music.themeForStage;
      SBR.music.themeForStage = () => (SBR.run && SBR.run.area && SBR.run.area.id === 'pillartomb' ? 'silvermine' : t());
    }
  })();

  /* ================= 6. Detour events (every choice leaves a mark) ================= */
  /** an event whose last choice only appears when `hidden(g)` holds */
  const hiddenEv = o => { const all = o.choices; delete o.choices; Object.defineProperty(o, 'choices', { enumerable: true, get() { const g = SBR.game && SBR.game.G; return all.filter(c => { if (!c.hidden) return true; try { return !!c.hidden(g); } catch (e) { return false; } }); } }); o.allChoices = all; return o; };
  const owns = id => { const r = R(); if (!r) return false; if ((r.gear || []).some(x => SBR.gearBase ? SBR.gearBase(x)[0] === id : x === id)) return true; return r.party.concat(r.reserve || []).some(m => Object.values(m.equip || {}).some(x => x && (SBR.gearBase ? SBR.gearBase(x)[0] === id : x === id))); };
  const setSecret = key => { const a = inArea(); a.secret = key; };
  const EV = {
    // ---- Devil's Palm ----
    palm_bones: { area: 'devilspalm', type: 'event', title: 'Bones Facing East', blurb: 'A skeleton kneels in the sand, still holding a staff.', icon: 'skull', art: 'dt_pilgrim',
      text: 'A skeleton in a pilgrim\'s robe kneels in the sand, facing east. Scratched down the length of its staff is a route across the desert, and four words: HE WAS CARRIED HERE. The sand around it has not moved in a very long time.',
      choices: [
        { label: 'Pray beside him (RESOLVE)', check: { stat: 'res', dc: 12 }, ok: { text: 'When you open your eyes, the skull has turned to look at you. Somewhere at the heart of the Palm, something has started waiting for you. (Party heals 20%.)', fx: g => { inArea().pilgrim = true; g.healAll(0.2); } },
          fail: { text: 'The bones crumble. What rises out of the sand is not the pilgrim.', fight: { enemies: ['dust_wraith', 'dust_wraith'] } } },
        { label: 'Take the staff', ok: { text: 'It is lighter than it looks and hums faintly. You break the head off to sell. (+$30, 2 Vampire Fang.)', fx: g => { g.money(30); g.mat('sunbone', 2); } } },
        { label: 'Bury him properly', ok: { text: 'It takes an hour in the heat. Nobody thanks you, but the wind drops while you ride on. (+12 XP, party heals 15%.)', fx: g => { g.xp(12); g.healAll(0.15); } } },
      ] },
    palm_rider: { area: 'devilspalm', type: 'event', title: 'The Rider in the Heat', blurb: 'A racer riding in circles, calling out the date.', icon: 'horseshoe', art: 'dt_mirage',
      text: 'Racer #214 gallops past for the third time, shouting "Day one! Day one of the race!" His horse is a skeleton. When the heat shimmers, so does he.',
      choices: [
        { label: 'Lead him out of the Palm (RIDING)', check: { stat: 'ride', dc: 13 }, ok: { text: 'You ride beside him until the circle breaks. At the edge he finally stops, looks at the sun, and fades, leaving a map of shortcuts in your hand. (+6 pace, 1 item.)', fx: g => { g.pace(6); g.itemRandom(); } },
          fail: { text: 'He doesn\'t like being told it isn\'t day one any more.', fight: { enemies: ['palm_mirage'], elite: true } } },
        { label: 'Ride alongside and listen', ok: { text: 'He talks about the Palm like a man talks about a woman: it gives, it takes, it never stays in one place. You learn a lot. (+15 XP.)', fx: g => g.xp(15) } },
        { label: 'Take his canteens while he circles', ok: { text: 'Two full canteens. He never notices. You do, all day. (2 SPW Canteens.)', fx: g => { g.item('canteen'); g.item('canteen'); } } },
      ] },
    // ---- Silver Mine ----
    mine_canary: { area: 'silvermine', type: 'event', title: 'The Canary Stopped Singing', blurb: 'The bird in the cage has fallen off its perch.', icon: 'skull',
      text: 'Someone left a canary in a cage at the junction. It is lying on the bottom of the cage. The air smells sweet, and from somewhere in the rock comes a slow knock, knock, knock.',
      choices: [
        { label: 'Hold your breath and push through (GRIT)', check: { stat: 'grit', dc: 13 }, ok: { text: 'You come out the far side dizzy and rich: an untouched vein of deep silver. (2 Chariot Silver.)', fx: g => g.mat('deepsilver', 2) },
          fail: { text: 'You make it through, barely, coughing. (Party loses 15% HP, 1 Exhaustion.)', fx: g => { g.hurtAll(0.15); g.exhaust('random'); } } },
        { label: 'Blow the gas pocket with powder', ok: { text: 'The blast clears the air... and wakes whatever was knocking.', fight: { enemies: ['tommyknocker', 'tommyknocker', 'tommyknocker'], after: g => g.mat('deepsilver', 1) } } },
        { label: 'Take the long tunnel around', ok: { text: 'An hour lost. On a dead miner\'s belt in the long tunnel: his tools, and a lamp that is still lit. (−4 pace, Deep-Shaft Lamp Helmet.)', fx: g => { g.pace(-4); g.gear('miner_lamp'); } } },
      ] },
    mine_skull: hiddenEv({ area: 'silvermine', type: 'event', title: 'The Skull in the Wall', blurb: 'A fossil skull the size of a wagon, set in the rock.', icon: 'skull', art: null,
      text: 'The tunnel ends at a fossil skull the size of a wagon, set into the rock like a door. Its eye sockets are empty, as if they were waiting for eyes. Claw marks lead around it and down, and someone has scratched a single letter beside it: D.',
      choices: [
        { label: 'Dig the skull out of the wall (GRIT)', check: { stat: 'grit', dc: 15 }, ok: { text: 'The skull comes loose and rolls aside. Behind it, a tunnel goes down, steep and warm. Something down there breathes. You will find out what after the colossus. (2 Fossil Shards.)', fx: g => { setSecret('sb_trex'); g.mat('fossil', 2); } },
          fail: { text: 'The ceiling doesn\'t like the digging. (Party loses 12% HP.)', fx: g => g.hurtAll(0.12) } },
        { label: 'Chip fossils off and leave', ok: { text: 'Good shards, and scales that were never on any lizard you know. (2 Fossil Shards, 1 Vampire Fang.)', fx: g => { g.mat('fossil', 2); g.mat('scale', 1); } } },
        { label: 'Leave it alone', ok: { text: 'Some doors are better left shut. You back away. (+10 XP.)', fx: g => g.xp(10) } },
        { label: 'Set the Saint\'s Eyes in its sockets', hidden: () => (SBR.corpse && SBR.corpse.all().includes('c_eyes')) || (R().mats.fossil || 0) >= 5,
          ok: { text: 'The skull sees. The whole wall shudders, the skull swings open like a gate, and far below, something enormous wakes up hungry.', fx: g => { setSecret('sb_trex'); g.xp(10); } } },
      ] }),
    // ---- Frozen Lake ----
    lake_frozen: { area: 'lakeice', type: 'event', title: 'The Rider Under the Ice', blurb: 'A man frozen under clear ice, eyes open.', icon: 'star', art: null,
      text: 'Under a sheet of perfectly clear ice lies a man in a strange white armoured suit, skates on his boots, eyes open. His glasses are frosted over. The ice around him is colder than the rest of the lake.',
      choices: [
        { label: 'Break him out (GRIT)', check: { stat: 'grit', dc: 14 }, ok: { text: 'The ice comes away in a slab. The suit is empty. It sits up on its own, stands, and skates off toward the middle of the lake. (2 Frozen Water.)', fx: g => { inArea().wa = true; g.mat('lakeice', 2); } },
          fail: { text: 'The cold bites back through your gloves. (A rider gains 1 Exhaustion.)', fx: g => g.exhaust('random') } },
        { label: 'Mark the spot and ride on', ok: { text: 'You plant a stick with a rag on it. Someone should know he\'s here. (+10 XP.)', fx: g => g.xp(10) } },
        { label: 'Fish through the ice for what he dropped', ok: { text: 'A purse of coins and a pair of frosted glasses with round lenses. (+$40, Ghiaccio\'s Glasses.)', fx: g => { g.money(40); g.gear('frost_monocle'); } } },
      ] },
    lake_fishers: { area: 'lakeice', type: 'event', title: 'The Ice Fishers\' Hut', blurb: 'Smoke from a stovepipe in the middle of the lake.', icon: 'fire',
      text: 'Two old Ojibwe fishermen have a hut on the ice, a stove, and a line through a hole. They wave you in out of the wind and ask what you are doing out here.',
      choices: [
        { label: 'Trade two bundles of furs and feathers for supplies', req: g => g.hasMat('hide', 2), reqText: 'Needs 2 Pet Shop Feathers', ok: { text: 'Smoked fish, a bottle of something, and advice about thin ice. (2 items, party heals 30%.)', fx: g => { g.spendMat('hide', 2); g.itemRandom(); g.itemRandom(); g.healAll(0.3); } } },
        { label: 'Sit by their stove for an hour', ok: { text: 'Warm for the first time in days. (Party heals 35%, −3 pace.)', fx: g => { g.healAll(0.35); g.pace(-3); } } },
        { label: 'Ask about the White Alpha', ok: { text: '"He leads from behind. Kill the pack around him and he goes mad, but he stops thinking." You will know where to aim. (The White Alpha starts Scanned.)', fx: g => g.flag('alphaLore') } },
      ] },
    // ---- Philadelphia Rail Yard ----
    rail_passenger: hiddenEv({ area: 'railyard', type: 'event', title: 'The Quiet Passenger', blurb: 'A man in a purple suit boards the last car.', icon: 'question', art: 'sb_kira',
      text: 'A man in a well-cut purple suit steps off a platform and onto the last car of a freight that isn\'t going anywhere. He has beautiful hands. He looks at you, then at your hands, for a long moment. His tie has little skulls on it.',
      choices: [
        { label: 'Follow him to the last car (LUCK)', check: { stat: 'luck', dc: 16 }, ok: { text: 'You catch a glimpse of him through the car window, reading a newspaper, completely calm. The car is further down the line than any train should be. You will reach it after Tattoo You.', fx: () => setSecret('sb_kira') },
          fail: { text: 'He is gone. Two railroad detectives are standing where he was, asking what you want.', fight: { enemies: ['rail_detective', 'rail_detective'] } } },
        { label: 'Warn the conductor about him', ok: { text: 'The conductor laughs. "Mr. Kira? Quietest passenger we ever had." (+12 XP.)', fx: g => g.xp(12) } },
        { label: 'Leave him alone', ok: { text: 'You keep your head down. Some men you don\'t want to have seen you. (+2 pace.)', fx: g => g.pace(2) } },
        { label: 'Straighten your own skull tie where he can see it', hidden: () => owns('telegraph_coil'),
          ok: { text: 'He stops. He smiles, very slightly. "Good taste. Come and find me in the last car." It is not a friendly invitation.', fx: () => setSecret('sb_kira') } },
      ] }),
    rail_mail: { area: 'railyard', type: 'event', title: 'The President\'s Mail', blurb: 'A mail car full of sealed government letters.', icon: 'question',
      text: 'A mail car stands open and unguarded. Half the letters carry the Presidential seal. One is addressed to "the officer in charge of the Corpse, Philadelphia."',
      choices: [
        { label: 'Steam the seals and read them (RESOLVE)', check: { stat: 'res', dc: 13 }, ok: { text: 'You read what the President plans to do with the Corpse, and with Lucy Steel. You put every seal back perfectly.', fx: g => g.flag('presidentPlan') },
          fail: { text: 'A Pinkerton was watching the car the whole time.', fight: { enemies: ['pinkerton'], elite: true } } },
        { label: 'Burn the mail car', ok: { text: 'The President\'s orders go up in smoke, and a lot of other people\'s letters with them. (+$30 from a strongbox.)', fx: g => { g.money(30); g.threat(1); } } },
        { label: 'Deliver the ordinary letters yourself', ok: { text: 'Mothers, sweethearts and a very angry landlord get their post. The postmaster pays you for the trouble. (+$25, +10 XP.)', fx: g => { g.money(25); g.xp(10); } } },
      ] },
    // ---- The Pillar Tomb ----
    tomb_mural: { area: 'pillartomb', type: 'event', title: 'The Mural of the Four', blurb: 'A wall painting of four giants and a red stone.', icon: 'star', art: null,
      text: 'The wall is painted with four giants: one with a horn, one with boiling veins, one with blades on his arms, and an old one who is already crumbling. Above them, a red stone shines. Below, tiny people run from the sun, and the giants run from it too.',
      choices: [
        { label: 'Study how they fight (RESOLVE)', check: { stat: 'res', dc: 13 }, ok: { text: 'The horned one rides the wind; the burning one weeps when hurt. You know where to look when they move. (The tomb\'s warriors start Scanned.)', fx: g => { g.flag('pillarLore'); g.xp(10); } },
          fail: { text: 'The paint makes your eyes swim. A thrall steps out of the dark while you stare.', fight: { enemies: ['tomb_thrall', 'tomb_thrall'] } } },
        { label: 'Copy it into your journal', ok: { text: 'Somebody at the Vatican will want to see this. (+15 XP.)', fx: g => g.xp(15) } },
        { label: 'Chisel the gold leaf off the red stone', ok: { text: 'Real gold. The giants on the wall seem to watch you do it. (1 Aztec Gold, 1 Pillar Stone.)', fx: g => { g.mat('gold', 1); g.mat('pillarstone', 1); } } },
      ] },
    tomb_masks: { area: 'pillartomb', type: 'event', title: 'A Rack of Stone Masks', blurb: 'Dozens of grinning stone masks on the walls.', icon: 'skull', art: null,
      text: 'A side chamber is lined with stone masks, dozens of them, each with spikes folded under its brow. A dried stain runs down the wall under every one. One of them is still wet.',
      choices: [
        { label: 'Smash every one of them', ok: { text: 'It takes a long time. When you are done the chamber is quieter than it has been in two thousand years. (+15 XP, party heals 15%.)', fx: g => { g.xp(15); g.healAll(0.15); } } },
        { label: 'Take one with you', ok: { text: 'You wrap it in cloth and don\'t look at it again. It feels heavier every mile. (The Stone Mask.)', fx: g => g.trinket('sd_stonemask') } },
        { label: 'Pry the gold from their eyes', ok: { text: 'Every mask had gold in its eyes. Now none do. (2 Aztec Gold.)', fx: g => g.mat('gold', 2) } },
      ] },
    tomb_door: hiddenEv({ area: 'pillartomb', type: 'event', title: 'The Sealed Door', blurb: 'A stone door carved with a sun. A hollow sits in the middle.', icon: 'question', art: null,
      text: 'At the bottom of a stair: a stone door carved with a blazing sun, with a hand-shaped hollow in the middle of it. The air coming through the cracks is warm, and it smells of iron. Something behind it has been waiting for the Red Stone for two thousand years.',
      choices: [
        { label: 'Force the door (GRIT)', check: { stat: 'grit', dc: 17 }, ok: { text: 'It grinds open a hand\'s width, then all the way. Red light pulses somewhere far below. You will go down after the warriors of the pillars... if you still want to.', fx: () => setSecret('sb_kars') },
          fail: { text: 'It doesn\'t move. The effort leaves everyone bruised. (Party loses 10% HP.)', fx: g => g.hurtAll(0.1) } },
        { label: 'Scratch a warning into it and leave', ok: { text: '"DO NOT OPEN." Maybe the next rider will listen. (+10 XP.)', fx: g => g.xp(10) } },
        { label: 'Pry the gold sun off the door', ok: { text: 'The sun comes away in your hands. The door stays shut. Good. (1 Aztec Gold, $25.)', fx: g => { g.mat('gold', 1); g.money(25); } } },
        { label: 'Press what you carry into the hollow', hidden: () => (SBR.corpse && SBR.corpse.count() >= 3) || (R().trinkets || []).includes('sd_stonemask') || R().flags.ajaHamon || R().flags.ajaVampire,
          ok: { text: 'The hollow fits your hand exactly. The door opens by itself, silently, the way a mouth does. Far below, a red light starts to pulse.', fx: () => setSecret('sb_kars') } },
      ] }),
  };
  Object.assign(SBR.AREA_EVENTS, EV);

  // consequences (deed + faction marks) for every choice, ':fail' where the check matters
  const C = (id, list) => list.forEach((c, i) => { if (!c) return; const { fail, ...ok } = c; SBR.CONSEQ[`areaev_${id}:${i}`] = ok; if (fail) SBR.CONSEQ[`areaev_${id}:${i}:fail`] = fail; });
  C('palm_bones', [{ deed: 'Prayed beside a pilgrim\'s bones in the Devil\'s Palm.', rep: { vatican: 1, natives: 1 }, fail: { deed: 'Disturbed a pilgrim\'s bones in the Devil\'s Palm.', rep: { natives: -1 } } },
    { deed: 'Took a dead pilgrim\'s staff from the Devil\'s Palm.', rep: { vatican: -1 } }, { deed: 'Buried a pilgrim who died on the Saint\'s road.', rep: { vatican: 1, racers: 1 } }]);
  C('palm_rider', [{ deed: 'Led a lost racer\'s ghost out of the Devil\'s Palm.', rep: { racers: 2 }, fail: { deed: 'Fought a racer the Devil\'s Palm had kept.', rep: { racers: -1 } } },
    { deed: 'Listened to the ghost of Racer #214.', rep: { natives: 1 } }, { deed: 'Stole canteens from a ghost in the Devil\'s Palm.', rep: { racers: -1 } }]);
  C('mine_canary', [{ deed: 'Pushed through the gas in the Silver Mine.', rep: { law: 1 }, fail: { deed: 'Nearly choked on the gas in the Silver Mine.' } },
    { deed: 'Blew a gas pocket in the Silver Mine and woke the Tommyknockers.', rep: { law: -1 } }, { deed: 'Found a dead miner\'s lamp in the Silver Mine.', rep: { racers: 1 } }]);
  C('mine_skull', [{ deed: 'Dug out the skull in the Silver Mine\'s deepest wall.', rep: { natives: -1 }, fail: { deed: 'Brought down the ceiling digging at a giant skull.' } },
    { deed: 'Chipped fossils from the giant skull in the Silver Mine.' }, { deed: 'Left the skull in the Silver Mine alone.', rep: { natives: 1 } }, { deed: 'Gave the skull in the Silver Mine eyes to see with.', threat: 0.5 }]);
  C('lake_frozen', [{ deed: 'Broke an empty Stand suit out of the ice of Lake Michigan.', rep: { racers: 1 }, fail: { deed: 'Froze trying to free a man from the ice.' } },
    { deed: 'Marked a frozen rider\'s grave on Lake Michigan.', rep: { law: 1 } }, { deed: 'Fished a frozen man\'s purse out of Lake Michigan.', rep: { racers: -1 } }]);
  C('lake_fishers', [{ deed: 'Traded pelts with Ojibwe fishermen on the lake.', rep: { natives: 2 } }, { deed: 'Warmed up in the ice fishers\' hut.', rep: { natives: 1 } }, { deed: 'Learned how the White Alpha hunts.', rep: { natives: 1 } }]);
  C('rail_passenger', [{ deed: 'Followed a quiet man in a purple suit down the rail yard.', threat: 0.5, fail: { deed: 'Lost the quiet passenger and met two detectives instead.', rep: { law: -1 } } },
    { deed: 'Warned a conductor about a passenger nobody else noticed.', rep: { law: 1 } }, { deed: 'Kept your head down around Mr. Kira.' }, { deed: 'Showed Yoshikage Kira your skull tie.', threat: 0.5 }]);
  C('rail_mail', [{ deed: 'Read the President\'s mail in Philadelphia.', rep: { president: -1 }, fail: { deed: 'Caught reading the President\'s mail by a Pinkerton.', rep: { president: -2, law: -1 } } },
    { deed: 'Burned the President\'s mail car.', rep: { president: -2, law: -1 } }, { deed: 'Delivered Philadelphia\'s ordinary mail.', rep: { law: 2 } }]);
  C('tomb_mural', [{ deed: 'Studied the mural of the Pillar Men.', rep: { vatican: 1 }, fail: { deed: 'Stared too long at the Pillar Men\'s mural.' } },
    { deed: 'Copied the mural of the Pillar Men for the Vatican.', rep: { vatican: 2 } }, { deed: 'Stripped the gold from the Pillar Men\'s mural.', rep: { vatican: -1 } }]);
  C('tomb_masks', [{ deed: 'Smashed a chamber full of Stone Masks.', rep: { vatican: 2 } }, { deed: 'Took a Stone Mask from the Pillar Tomb.', rep: { vatican: -2 }, threat: 0.5 }, { deed: 'Pried the gold out of the Stone Masks\' eyes.', rep: { naples: 1 } }]);
  C('tomb_door', [{ deed: 'Forced open the sealed door under the Pillar Tomb.', threat: 0.5, fail: { deed: 'Failed to force the sealed door in the Pillar Tomb.' } },
    { deed: 'Scratched a warning on the sealed door in the Pillar Tomb.', rep: { vatican: 1 } }, { deed: 'Stole the gold sun from the Pillar Tomb\'s door.', rep: { naples: 1 } }, { deed: 'Opened the sealed door under the Pillar Tomb.', threat: 0.5 }]);

  // the fishermen's advice about the White Alpha
  (() => {
    const W = E.wolf_alpha; if (!W) return;
    W.hooks = W.hooks || {};
    const s = W.hooks.start;
    W.hooks.start = x => { if (s) s(x); if (R() && R().flags.alphaLore) x.status(x.user, 'marked', 0, 2); };
  })();

  /* ================= 7. Fight talk for the new foes (registered by js/superbosses.js) ================= */
  SBR.EXTRA_TALK = Object.assign(SBR.EXTRA_TALK || {}, {
    palm_pilgrim: {
      pre: [['palm_pilgrim', 'Nineteen centuries I have kept this road. What do you carry, rider?'], [{ l: 'He can feel it... the Corpse. He knows.', h: 'A pilgrim who never left. God rest you, old man, but get out of our way.', any: 'He\'s been dead for centuries. The sun won\'t hurt him, he IS the sun here.' }]],
      mid: { 3: [['palm_pilgrim', 'Rise, faithful. The road is not finished with you.', 'menace']] },
      post: [['palm_pilgrim', 'Carry Him further than I could...'], ['>', 'The pilgrim becomes sand, and the Palm is still for the first time.']] },
    white_album: {
      pre: [['>', 'The suit skates to a stop in front of you. The air cracks as it freezes.', 'menace'], [{ g: 'An empty suit that moves on its own? Spin it. Ice hates rotation.', j: '(My nails won\'t go through that ice... unless they\'re spinning.)', any: 'Bullets bounce off! We need Spin or something loud!' }]],
      mid: { 2: [['>', 'GENTLY WEEPS. The air around it turns into a wall of ice.', 'menace']] },
      post: [['>', 'The suit topples onto the ice, empty and silent.']] },
    pm_wamuu: {
      pre: [['pm_wamuu', 'You woke us. I do not hold it against you. I will simply kill you with respect.'], ['pm_esidisi', 'Ohh, Wamuu, look at their faces! I love it when they\'re scared!'],
        [{ c: 'Pillar Men! Two of them! Don\'t let them touch you!', g: 'Two giants who hate the sun. Nyo-ho, too bad we\'re underground.', any: 'Two Pillar Men... sunlight, Holy, anything like it!' }]],
      mid: { 3: [['pm_wamuu', 'WIND MODE! Divine Sandstorm!', 'shout']] },
      post: [['pm_wamuu', 'A worthy fight... I have no regrets...'], ['>', 'The warriors of the pillars crumble into sand.']] },
    black_knight: {
      pre: [['black_knight', 'Three hundred years I have kept this door. None pass.'], [{ any: 'A dead knight. Aim for the gaps in the armour.' }]],
      post: [['black_knight', 'At last... I can rest...']] },
    pinkerton: {
      pre: [['pinkerton', 'The Agency has a file on you. It is thicker than the Bible.'], [{ any: 'A Pinkerton. Great. Now the whole East Coast knows our faces.' }]],
      post: [['pinkerton', 'The Agency... never forgets...']] },
    dino_foreman: {
      pre: [['dino_foreman', 'Shift\'s not over till I say. And I say NEVER. Ssss.'], [{ any: 'He\'s half lizard! Watch the teeth!' }]],
      post: [['dino_foreman', 'Clock... out...']] },
    palm_mirage: {
      pre: [['palm_mirage', 'Day one! Day one of the race! Why does it keep being day one?'], [{ any: 'He\'s been riding in circles since the start. Put him to rest.' }]],
      post: [['>', 'Racer #214 finally stops riding. His horse lies down in the sand.']] },
  });
})();
