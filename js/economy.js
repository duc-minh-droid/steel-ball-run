/* Economy, the AAC way: a small set of materials reused everywhere, Stand Remnants as Souls (recipe keys that are
   never used up), upgrade recipes that turn a piece you own into a better one, reinforcement, salvage, selling,
   sell-only trinkets, and plenty of things to spend money on. Loaded after every file that defines recipes or drops,
   so it can fold the old material ids into the new set in one place. */
'use strict';

/* ---------------- 1. Materials: 16 of them ---------------- */
SBR.MAT_ALIAS = {
  wire: 'scrap', railspike: 'scrap', venom: 'herb', deepsilver: 'silver',
  pelt: 'hide', wolfpelt: 'hide', alphapelt: 'hide', feather: 'hide', horsehair: 'hide',
  fang: 'bone', claw: 'bone', scale: 'bone', sunbone: 'bone', needle: 'bone', lakeice: 'rainvial',
};
SBR.matId = id => SBR.MAT_ALIAS[id] || id;
(() => {
  const M = SBR.MATERIALS;
  Object.assign(M, {
    scrap:   { name: 'Cyborg Scrap', rarity: 'common', group: 'generic', desc: 'Rivets, gears, rail spikes and telegraph wire. Stroheim would call it German science. Every smith wants it.' },
    leather: { name: 'SPW Saddle Leather', rarity: 'common', group: 'generic', desc: 'Speedwagon Foundation stock, stamped SPW. Tanned and tough; smells like saddle.' },
    cloth:   { name: 'Satiporoja Silk', rarity: 'common', group: 'generic', desc: 'Woven from Satiporoja beetle hair, like Lisa Lisa\'s scarf. It carries Hamon. The cheap bolts are half cotton.' },
    powder:  { name: 'German Army Powder', rarity: 'common', group: 'generic', desc: 'From Stroheim\'s supply crates, packed tight. Keep it dry. Keep it away from Oyecomova.' },
    herb:    { name: 'Trussardi Herbs', rarity: 'common', group: 'generic', desc: 'Basil, oregano and a little rattler venom. Tonio Trussardi could make any of it medicine; you have to be careful with the dose.' },
    hide:    { name: 'Pet Shop Feathers', rarity: 'common', group: 'generic', desc: 'Feathers molted by DIO\'s guard falcon, frost still on the quills, bundled with fur and horsehair. Anything that once kept an animal warm.' },
    bone:    { name: 'Vampire Fang', rarity: 'uncommon', group: 'generic', desc: 'Fangs from DIO\'s zombies, cougar teeth, cactus needles, dinosaur scales. Sharp things.' },
    silver:  { name: 'Chariot Silver', rarity: 'uncommon', group: 'generic', desc: 'Melted down from a rapier blade that was fired across a room and never found. Polnareff wants it back.' },
    gold:    { name: 'Aztec Gold', rarity: 'rare', group: 'generic', desc: 'From the ruins where the Pillar Men\'s Stone Masks were found. Might be cursed.' },
    ballfrag: { name: 'Steel Ball Shard', rarity: 'uncommon', group: 'special', desc: 'A chip of Zeppeli steel. It still hums.' },
    sap:     { name: 'Golden Sap', rarity: 'rare', group: 'special', desc: 'Resin from the Sugar Mountain tree.' },
    menger:  { name: 'Menger Dust', rarity: 'rare', group: 'special', desc: 'What\'s left when two copies of a person meet.' },
    rainvial: { name: 'Frozen Water', rarity: 'rare', group: 'special', desc: 'Blackmore\'s raindrops and Lake Michigan ice. Neither ever melts.' },
    fossil:  { name: 'Fossil Shard', rarity: 'uncommon', group: 'special', desc: 'Scary Monsters leaves these behind.' },
    palmsand: { name: 'Devil\'s Palm Sand', rarity: 'rare', group: 'detour', desc: 'Sand from the place that gives people Stands. Only found in the Devil\'s Palm.' },
    tattooink: { name: 'Eleven Men Ink', rarity: 'rare', group: 'detour', desc: 'Tattoo You!\'s ink. It shifts when you look away. Only found in the Philadelphia rail yard.' },
  });
  Object.keys(SBR.MAT_ALIAS).forEach(k => { delete M[k]; });
  Object.values(M).forEach(m => { if (m.remnant) { m.group = 'soul'; m.desc = m.desc.replace('Crafts their signature gear.', 'A Soul: owning it unlocks their signature gear for the rest of the run. Crafting never uses it up.'); } else if (m.holy) m.group = 'holy'; });

  const fold = rec => { if (!rec) return rec; const o = {}; Object.entries(rec).forEach(([k, n]) => { const j = SBR.matId(k); o[j] = (o[j] || 0) + n; }); return o; };
  SBR.foldRecipe = fold;
  Object.values(SBR.EQUIPMENT).forEach(e => { if (e.recipe) e.recipe = fold(e.recipe); });
  Object.keys(SBR.ITEM_RECIPES).forEach(k => { SBR.ITEM_RECIPES[k] = fold(SBR.ITEM_RECIPES[k]); });
  // drop tables: merge rows that now name the same material
  Object.keys(SBR.DROPS).forEach(k => {
    const rows = {};
    SBR.DROPS[k].forEach(([m, ch, a, b]) => { const j = SBR.matId(m); const o = rows[j]; rows[j] = o ? [j, Math.min(1, Math.max(o[1], ch) + 0.1), o[2], Math.max(o[3], b)] : [j, ch, a, b]; });
    SBR.DROPS[k] = Object.values(rows);
  });
  const uniq = a => [...new Set(a.map(SBR.matId))];
  Object.keys(SBR.SCAVENGE_MATS).forEach(k => { SBR.SCAVENGE_MATS[k] = uniq(SBR.SCAVENGE_MATS[k]); });
  // each act leans on a few generic materials and one special
  Object.assign(SBR.SCAVENGE_MATS, {
    1: ['scrap', 'leather', 'cloth', 'powder', 'herb', 'bone'],
    2: ['scrap', 'leather', 'hide', 'herb', 'bone', 'ballfrag'],
    3: ['cloth', 'powder', 'hide', 'silver', 'fossil', 'bone'],
    4: ['hide', 'silver', 'gold', 'leather', 'rainvial', 'sap'],
    5: ['scrap', 'silver', 'gold', 'cloth', 'menger'],
    6: ['gold', 'silver', 'menger', 'sap'],
  });
  Object.values(SBR.AREAS).forEach(a => { a.mats = uniq(a.mats); });
  Object.entries(SBR.AREAS).forEach(([id, a]) => { SBR.SCAVENGE_MATS['area_' + id] = a.mats; });
})();

/** fold old ids in a saved run's bag into the new set, summing quantities */
SBR.migrateMats = r => {
  const out = {};
  Object.entries(r.mats || {}).forEach(([k, n]) => { const j = SBR.matId(k); if (!SBR.MATERIALS[j] || !n) return; out[j] = (out[j] || 0) + n; });
  r.mats = out;
};

/* ---------------- 2. New gear from the manga, and upgrade chains ---------------- */
Object.assign(SBR.EQUIPMENT, {
  golden_sphere:   { slot: 'weapon', name: 'Golden Rectangle Ball', rarity: 'rare', stats: { spin: 8 }, bonus: { spinDmg: 0.18, crit: 0.03 }, recipe: { ballfrag: 2, gold: 1 }, from: 'steel_sphere', price: 130, note: 'Thrown along the ratio found in nature. It curves where it should not.' },
  executioner_gorget: { slot: 'hat', name: 'Executioner\'s Gorget', rarity: 'rare', stats: { spin: 3, res: 2 }, bonus: { crit: 0.04, res: { bleed: -0.2 } }, recipe: { silver: 2, leather: 1 }, price: 110, note: 'The steel collar of the Zeppeli family. Worn at the neck; it says what you are.' },
  buckle_plates:   { slot: 'charm', family: 'device', name: 'Golden Rectangle Buckle', rarity: 'rare', stats: { spin: 4 }, bonus: { spinDmg: 0.1 }, recipe: { gold: 1, scrap: 2 }, price: 115, note: 'Gyro\'s belt buckle. Its plates are cut to the Golden Rectangle.' },
  kuma_chan:       { slot: 'charm', family: 'totem', name: 'Kuma-chan', rarity: 'rare', stats: { res: 4, luck: 2 }, bonus: { immune: ['guilt'], regen: 1 }, recipe: { hide: 2, cloth: 2 }, price: 100, note: 'A little teddy bear. Somebody lost it, and somebody else was blamed.' },
  nicholas_boots:  { slot: 'boots', name: 'Nicholas\'s Riding Boots', rarity: 'rare', stats: { ride: 5, luck: 2 }, bonus: { dodge: 0.06, init: 2 }, recipe: { leather: 2, gold: 1 }, from: 'cavalry_boots', price: 120, note: 'His brother\'s boots. Johnny never wore them, until now.' },
  tim_stetson:     { slot: 'hat', name: 'Mountain Tim\'s Stetson', rarity: 'rare', stats: { aim: 4, ride: 2 }, bonus: { res: { bullet: -0.15, phys: -0.05 } }, recipe: { leather: 1, hide: 2 }, from: 'sheriff_hat', price: 115, note: 'A cowboy\'s hat with the brim worn soft. Oh! Lonesome Me.' },
  war_bonnet:      { slot: 'charm', family: 'totem', name: 'Eagle War Bonnet', rarity: 'rare', stats: { ride: 4, res: 2 }, bonus: { dodge: 0.07, res: { sound: -0.2 } }, recipe: { hide: 3, bone: 1 }, from: 'eagle_feather', price: 105 },
  bone_knife:      { slot: 'weapon', name: 'Anubis Sword', rarity: 'uncommon', stats: { aim: 3, grit: 2 }, bonus: { bleedOnBasic: 0.25, crit: 0.03 }, recipe: { bone: 2 }, from: 'knife', price: 70, note: 'A Stand lives in this blade. Whatever it cuts once, it remembers.' },
  raptor_claws:    { slot: 'weapon', name: 'Scary Monsters Claws', rarity: 'rare', stats: { aim: 4, ride: 6 }, bonus: { dmg: 0.12, bleedOnBasic: 0.2 }, recipe: { fossil: 2, bone: 2 }, from: 'raptor_knuckles', price: 130 },
  fossil_mask:     { slot: 'hat', name: 'Stone Mask', rarity: 'uncommon', stats: { grit: 3, ride: 1 }, bonus: { maxHp: 6, immune: ['fossil'], res: { phys: -0.1, holy: 0.1 } }, recipe: { fossil: 2, bone: 1 }, price: 85, note: 'Carved by the Pillar Men. Keep blood off the rim, and the spikes stay folded. The sun does not like whoever wears it.' },
  amber_charm:     { slot: 'charm', family: 'totem', name: 'Amber Fossil', rarity: 'uncommon', stats: { grit: 2, res: 2 }, bonus: { maxHp: 8, res: { stand: -0.05 } }, recipe: { fossil: 1, sap: 1 }, price: 90 },
  rain_lens:       { slot: 'charm', family: 'device', name: 'Raindrop Lens', rarity: 'rare', stats: { aim: 4 }, bonus: { crit: 0.06, res: { cold: -0.15 } }, recipe: { rainvial: 1, silver: 1 }, price: 110, note: 'A frozen raindrop ground into a lens. The world through it is very still.' },
  frost_rounds:    { slot: 'charm', family: 'ammo', name: 'Frozen Rounds', rarity: 'rare', stats: { aim: 2 }, bonus: { bulletDmg: 0.12, coldDmg: 0.1 }, recipe: { rainvial: 1, powder: 2 }, from: 'powder_horn', price: 115 },
  menger_lining:   { slot: 'coat', name: 'Menger-Lined Coat', rarity: 'rare', stats: { grit: 5, res: 3 }, bonus: { res: { stand: -0.2 } }, recipe: { menger: 2, cloth: 2 }, from: 'duster', price: 140, note: 'Stitched with dust from the other America. Stands slide off it.' },
  menger_boots:    { slot: 'boots', name: 'Parallel Boots', rarity: 'rare', stats: { ride: 4 }, bonus: { dodge: 0.08, res: { stand: -0.1 } }, recipe: { menger: 1, leather: 2 }, from: 'riding_boots', price: 120 },
  sand_hood:       { slot: 'hat', name: 'Palm-Sand Hood', rarity: 'rare', stats: { res: 3, luck: 3 }, bonus: { res: { stand: -0.15, holy: -0.1 } }, recipe: { palmsand: 1, cloth: 2 }, price: 125, area: 'devilspalm' },
  sand_rounds:     { slot: 'charm', family: 'ammo', name: 'Palm-Sand Shot', rarity: 'rare', stats: { aim: 3, luck: 2 }, bonus: { bulletDmg: 0.1, standDmg: 0.1 }, recipe: { palmsand: 1, powder: 2 }, from: 'powder_horn', price: 125, area: 'devilspalm' },
  ink_duster:      { slot: 'coat', name: 'Tattooed Duster', rarity: 'rare', stats: { grit: 4, ride: 3 }, bonus: { dodge: 0.06, res: { stand: -0.1, bullet: -0.1 } }, recipe: { tattooink: 1, leather: 2 }, from: 'duster', price: 135, area: 'railyard' },
  ink_gloves:      { slot: 'weapon', name: 'Eleven Men Gloves', rarity: 'rare', stats: { aim: 5, ride: 3 }, bonus: { dmg: 0.1, crit: 0.04 }, recipe: { tattooink: 1, scrap: 2 }, from: 'knife', price: 130, area: 'railyard' },
  ink_boots:       { slot: 'boots', name: 'Silent Soles', rarity: 'rare', stats: { ride: 4 }, bonus: { dodge: 0.07, res: { sound: -0.2 } }, recipe: { tattooink: 1, hide: 1 }, price: 120, area: 'railyard' },
});
/* upgrade chains: these recipes also consume the named piece you own */
Object.entries({
  winchester: ['colt_navy', { powder: 2, scrap: 1 }], cavalry_boots: ['riding_boots', { scrap: 1, silver: 1 }], irontoe_boots: ['chaps', { scrap: 3 }],
  oilskin: ['duster', { leather: 1, cloth: 1 }], buffalo_coat: ['poncho', { hide: 2, bone: 1 }], wolf_cloak: ['pelt_coat', { hide: 2, cloth: 1 }],
  gold_ring: ['silver_dollar', { gold: 1 }], sheriff_hat: ['straw_hat', { leather: 1, silver: 1 }], rattle_totem: ['sage_bundle', { hide: 1, herb: 1 }],
  silver_rounds: ['powder_horn', { silver: 2 }], moccasins: ['riding_boots', { hide: 1, herb: 1 }], menger_cube: ['telegraph_coil', { menger: 2 }],
  bear_mantle: ['pelt_coat', { bone: 2, hide: 1 }], sunbone_knife: ['knife', { bone: 2, palmsand: 1 }],
}).forEach(([id, [from, rec]]) => { const E = SBR.EQUIPMENT[id]; if (!E) return; E.upgrades = { from, rec }; });
Object.values(SBR.EQUIPMENT).forEach(E => { if (E.from) { E.upgrades = { from: E.from, rec: E.recipe }; E.recipe = null; } });
/* every material gets used in several places: extra recipes where the old ones were thin */
Object.assign(SBR.ITEM_RECIPES, { rainwater: { rainvial: 1, herb: 1 }, sandwich: { cloth: 1, herb: 2 }, tarcoffee: { herb: 2, powder: 1 } });

/** base id and reinforcement level of an equipment id ("winchester+2" gives ["winchester", 2]) */
SBR.gearBase = id => { const m = /^(.*)\+(\d)$/.exec(id || ''); return m ? [m[1], +m[2]] : [id, 0]; };
/** create the "+1" / "+2" version of a piece on first use: stats up, numeric bonuses up 15% per level */
SBR.ensureGear = id => {
  if (!id || SBR.EQUIPMENT[id]) return SBR.EQUIPMENT[id];
  const [base, lv] = SBR.gearBase(id);
  const B = SBR.EQUIPMENT[base];
  if (!B || !lv) return null;
  const mul = 1 + 0.15 * lv;
  const stats = {}; Object.entries(B.stats || {}).forEach(([k, v]) => { stats[k] = v + (v > 0 ? Math.max(1, Math.round(v * 0.2)) * lv : 0); });
  if (!Object.keys(stats).length) stats.grit = lv;
  const bonus = {};
  Object.entries(B.bonus || {}).forEach(([k, v]) => {
    if (Array.isArray(v)) bonus[k] = v.slice();
    else if (v && typeof v === 'object') { bonus[k] = {}; for (const t in v) bonus[k][t] = Math.round(v[t] * mul * 100) / 100; }
    else if (typeof v === 'number' && !SBR.RUN_KEYS.includes(k) && k !== 'selfRewind' && k !== 'energyStart') bonus[k] = k === 'maxHp' || k === 'regen' || k === 'init' ? Math.round(v * mul) : Math.round(v * mul * 1000) / 1000;
    else bonus[k] = v;
  });
  SBR.EQUIPMENT[id] = Object.assign({}, B, { name: `${B.name} +${lv}`, stats, bonus, recipe: null, upgrades: null, from: null, derived: true, base, plus: lv, price: Math.round((B.price || 80) * (1 + 0.3 * lv)) });
  return SBR.EQUIPMENT[id];
};
(() => { // icons fall back to the base piece
  const I = SBR.icons, eq = I.equip;
  I.equip = (id, ...a) => { const [b, lv] = SBR.gearBase(id); const s = eq(b, ...a); return lv && s ? s.replace('</svg>', `<text x="46" y="14" text-anchor="end" font-family="Anton,Impact,sans-serif" font-size="13" fill="#f2c14e" stroke="#1a1020" stroke-width="3" paint-order="stroke">+${lv}</text></svg>`) : s; };
})();

/* reinforcement cost: slot-matched generic materials plus money */
SBR.REINFORCE_MATS = { weapon: { scrap: 2, powder: 1 }, hat: { cloth: 2, leather: 1 }, coat: { leather: 2, hide: 1 }, boots: { leather: 2, hide: 1 }, charm: { silver: 1, bone: 1 } };
SBR.reinforceCost = id => {
  const E = SBR.EQUIPMENT[id]; if (!E) return null;
  const [, lv] = SBR.gearBase(id); if (lv >= 2) return null;
  const rank = SBR.RARITY_RANK[E.rarity] || 0;
  const mats = {}; Object.entries(SBR.REINFORCE_MATS[E.slot] || {}).forEach(([k, n]) => { mats[k] = n * (lv + 1); });
  if (lv === 1 && rank >= 2) mats.gold = 1;
  return { mats, money: (25 + rank * 15) * (lv + 1), smith: (45 + rank * 25) * (lv + 1), next: `${SBR.gearBase(id)[0]}+${lv + 1}` };
};
/** what salvaging gives back: half the recipe (at least one of something) */
SBR.salvageYield = id => {
  const [base] = SBR.gearBase(id); const B = SBR.EQUIPMENT[base]; if (!B) return {};
  const rec = B.recipe || (B.upgrades && B.upgrades.rec) || (B.slot === 'weapon' ? { scrap: 2 } : B.slot === 'charm' ? { silver: 1 } : { leather: 2 });
  const out = {}; Object.entries(rec).forEach(([k, n]) => { const h = Math.floor(n / 2); if (h) out[k] = h; });
  if (!Object.keys(out).length) { const k = Object.keys(rec)[0]; out[k] = 1; }
  const [, lv] = SBR.gearBase(id); if (lv) { const R = SBR.REINFORCE_MATS[B.slot] || {}; Object.entries(R).forEach(([k, n]) => { out[k] = (out[k] || 0) + Math.floor(n * lv / 2); }); }
  return out;
};
SBR.sellValue = (kind, id) => {
  if (kind === 'equip') { const E = SBR.EQUIPMENT[id]; return Math.max(8, Math.round((E.price || (E.rarity === 'remnant' ? 150 : 60)) * 0.4)); }
  if (kind === 'item') return Math.max(3, Math.round((SBR.ITEMS[id].price || 20) * 0.3));
  if (kind === 'trinket') return SBR.TRINKETS[id].value;
  return 0;
};

/* ---------------- 3. Trinkets: loot that exists to be sold ---------------- */
SBR.TRINKETS = {
  emerald:      { name: 'Sandman\'s Emerald', value: 150, rarity: 'rare', color: '#3ac870', desc: 'He tried to pay his way with it. The shopkeeper did not know what to do.' },
  pocketwatch:  { name: 'Giorno\'s Ladybug Brooch', value: 60, rarity: 'uncommon', color: '#c8323c', desc: 'A gold ladybug pin. It looks like it might crawl away.' },
  racer_medal:  { name: 'Rohan\'s G-Pen', value: 45, rarity: 'uncommon', color: '#3a3a4a', desc: 'A manga artist\'s pen nib, still wet.' },
  conf_coin:    { name: 'Confederate Coin', value: 25, rarity: 'common', color: '#c8a070', desc: 'Worth more to collectors than to anyone who fought for it.' },
  bounty:       { name: 'Wanted Poster', value: 40, rarity: 'common', color: '#e8d8b8', desc: 'Torn from a post. The face on it matches the man you beat. Any sheriff pays.' },
  diamond:      { name: 'Diamond Stud', value: 90, rarity: 'rare', color: '#dff2ff', desc: 'From the cuff of a Presidential agent. Government issue, apparently.' },
  silver_spoon: { name: 'Engraved Silver Spoon', value: 30, rarity: 'common', color: '#d0d4e0', desc: 'Stolen from a railroad dining car, by someone before you.' },
  arrowhead:    { name: 'Obsidian Arrowhead', value: 20, rarity: 'common', color: '#3a3a4a', desc: 'Old, and very sharp. A trader in town collects them.' },
  gold_tooth:   { name: 'Gold Tooth', value: 35, rarity: 'common', color: '#f2c14e', desc: 'Don\'t ask.' },
  pigeon_note:  { name: 'Coded Pigeon Message', value: 70, rarity: 'uncommon', color: '#f6ecd8', desc: 'A message meant for the President. Someone at the Green Tomb will pay to read it.' },
  sugar_gold:   { name: 'Sugar Mountain Gold Leaf', value: 120, rarity: 'rare', color: '#f2c14e', desc: 'From the tree. It must be spent before the sun sets, or the tree takes it back.' },
  ticket:       { name: 'Steamboat Ticket', value: 55, rarity: 'uncommon', color: '#9fc7e8', desc: 'First class on the Blue Hawaii. Lucky, somehow.' },
};
SBR.TRINKET_DROPS = { common: ['conf_coin', 'silver_spoon', 'arrowhead', 'gold_tooth', 'bounty'], elite: ['pocketwatch', 'racer_medal', 'bounty', 'diamond'], boss: ['diamond', 'pocketwatch', 'racer_medal', 'ticket'] };
(() => {
  const I = SBR.icons, st = I.st;
  const gem = c => `<path d="M14 16h20l8 8-18 18L6 24z" fill="${c}" ${st}/><path d="M6 24h36M14 16l10 26 10-26" stroke="#1a1020" stroke-width="1.4" fill="none" opacity=".5"/>`;
  const coin = (c, t) => `<circle cx="24" cy="24" r="16" fill="${c}" ${st}/><circle cx="24" cy="24" r="11" fill="none" stroke="#1a1020" stroke-width="1.4" opacity=".5"/><text x="24" y="29" text-anchor="middle" font-family="Rye,serif" font-size="13" fill="#1a1020">${t}</text>`;
  const T = {
    emerald: () => gem('#3ac870'), diamond: () => gem('#dff2ff'),
    pocketwatch: () => `<circle cx="24" cy="28" r="14" fill="#f2c14e" ${st}/><circle cx="24" cy="28" r="10" fill="#f6ecd8" ${st} stroke-width="1.4"/><path d="M24 28V21M24 28l5 3" stroke="#1a1020" stroke-width="2"/><path d="M20 10h8v4h-8z" fill="#f2c14e" ${st}/>`,
    racer_medal: () => `<path d="M16 4h6l2 12-6 0zM26 4h6l-2 12h-6z" fill="#c8323c" ${st}/>` + coin('#e8c070', '1'),
    conf_coin: () => coin('#c8a070', '¢'), gold_tooth: () => `<path d="M14 12q10-6 20 0l-2 18q-2 10-5 10l-3-10-3 10q-3 0-5-10z" fill="#f2c14e" ${st}/>`,
    bounty: () => `<rect x="10" y="6" width="28" height="36" fill="#e8d8b8" ${st}/><text x="24" y="16" text-anchor="middle" font-family="Rye,serif" font-size="7" fill="#1a1020">WANTED</text><circle cx="24" cy="26" r="6" fill="#8a6a4a"/><text x="24" y="39" text-anchor="middle" font-family="Rye,serif" font-size="6" fill="#c8323c">$$$</text>`,
    silver_spoon: () => `<ellipse cx="18" cy="16" rx="7" ry="9" fill="#d0d4e0" ${st}/><path d="M22 23l16 18" stroke="#1a1020" stroke-width="6" stroke-linecap="round"/><path d="M22 23l16 18" stroke="#d0d4e0" stroke-width="3" stroke-linecap="round"/>`,
    arrowhead: () => `<path d="M24 4l12 26-12 12-12-12z" fill="#3a3a4a" ${st}/><path d="M24 8v30" stroke="#8a8aa0" stroke-width="1.4"/>`,
    pigeon_note: () => `<path d="M8 12h32v24H8z" fill="#f6ecd8" ${st}/><path d="M8 12l16 12 16-12" fill="none" ${st}/><circle cx="24" cy="30" r="4" fill="#c8323c" ${st} stroke-width="1.4"/>`,
    sugar_gold: () => `<path d="M24 4q14 10 12 24T24 44Q10 38 12 24T24 4z" fill="#f2c14e" ${st}/><path d="M24 8v34M24 18l7-5M24 26l8-4M24 34l-8-4M24 22l-7-4" stroke="#b8860b" stroke-width="1.6" fill="none"/>`,
    ticket: () => `<path d="M6 14h36v6a4 4 0 0 0 0 8v6H6v-6a4 4 0 0 0 0-8z" fill="#9fc7e8" ${st}/><text x="24" y="28" text-anchor="middle" font-family="Rye,serif" font-size="8" fill="#1a1020">BLUE HAWAII</text>`,
  };
  SBR.trinketIcon = id => `<svg viewBox="0 0 48 48" class="ico">${(T[id] || T.conf_coin)()}</svg>`;
  // merged materials
  const P = I.P, K = I.K;
  // Pet Shop Feathers: two falcon feathers, frost on the quills
  I.define('mat', 'hide', () => P.feather('#4a5a7a', '#e8f0f8').replace('<path', '<path transform="translate(-6 2)"') + P.feather('#6a4a2a', '#c8d8e8').replace('<path', '<path transform="translate(10 6) scale(.8)"') + `<g stroke="#9fd0f0" stroke-width="1.6" stroke-linecap="round"><path d="M38 34v8M34 36l8 4M42 36l-8 4"/></g>`);
  // Vampire Fang: a pair of fangs and a drop of blood
  I.define('mat', 'bone', () => P.fang('#f6f0e0').replace('<path', '<path transform="translate(-6 0) scale(.9)"') + P.fang('#f6f0e0').replace('<path', '<path transform="translate(14 2) scale(.8)"') + P.drop('#c8323c').replace('<path', '<path transform="translate(26 26) scale(.4)"'));
  I.define('mat', 'rainvial', () => `<path d="M12 12l20-4 10 16-8 18-20-2-6-16z" fill="#dff2ff" ${st}/>` + P.drop('#9fc7e8').replace('<path', '<path transform="translate(10 8) scale(.6)"'));
  // Trussardi Herbs: a basil sprig and one of Tonio's tomatoes
  I.define('mat', 'herb', () => P.herb('#3a9a3a', null) + `<circle cx="34" cy="36" r="8" fill="#e8483a" ${st}/><path d="M30 29l4 3 4-3" stroke="#3a6a2a" stroke-width="1.8" fill="none"/>${I.shine(31, 34, 2)}`);
  const e = (id, fn) => I.define('equip', id, fn);
  e('golden_sphere', () => `<circle cx="24" cy="24" r="16" fill="#f2c14e" ${st}/><path d="M14 16h20v16H14zM24 16v16M14 24h10" stroke="#8a5a10" stroke-width="1.6" fill="none"/>${I.shine(18, 18, 4)}`);
  e('executioner_gorget', () => `<path d="M8 18q16 14 32 0l-2 12q-14 10-28 0z" fill="#c8c8d8" ${st}/><circle cx="24" cy="30" r="4" fill="#f2c14e" ${st} stroke-width="1.4"/><path d="M12 22q12 8 24 0" stroke="${K}" stroke-width="1.2" fill="none"/>`);
  e('buckle_plates', () => `<rect x="6" y="14" width="36" height="20" rx="3" fill="#f2c14e" ${st}/><path d="M17 14v20M17 26h25M29 26v8" stroke="#8a5a10" stroke-width="1.8"/><circle cx="12" cy="24" r="2.5" fill="#1a1020"/>`);
  e('kuma_chan', () => `<circle cx="24" cy="28" r="13" fill="#b8804a" ${st}/><circle cx="13" cy="15" r="5" fill="#b8804a" ${st}/><circle cx="35" cy="15" r="5" fill="#b8804a" ${st}/><circle cx="19" cy="25" r="2" fill="#1a1020"/><circle cx="29" cy="25" r="2" fill="#1a1020"/><ellipse cx="24" cy="32" rx="5" ry="4" fill="#f6ecd8" ${st} stroke-width="1.2"/><path d="M14 40l20-6" stroke="#c8323c" stroke-width="3"/>`);
  e('nicholas_boots', () => I.BOOT('#5a3a2a', '#f2c14e') + `<path d="M16 8h8" stroke="#f2c14e" stroke-width="2"/>`);
  e('tim_stetson', () => `<path d="M4 30q20 8 40 0-6 6-20 6T4 30z" fill="#8a6a4a" ${st}/><path d="M12 30q0-20 12-20t12 20z" fill="#a07a4a" ${st}/><path d="M12 25h24" stroke="#c8323c" stroke-width="3"/>`);
  e('war_bonnet', () => [-30, -15, 0, 15, 30].map(a => `<g transform="rotate(${a} 24 40)">${P.feather('#f6ecd8', '#c8323c').replace('<path', '<path transform="translate(10 -6) scale(.6)"')}</g>`).join('') + `<path d="M10 38h28" stroke="#c8323c" stroke-width="4"/>`);
  // Anubis: a long single-edged blade with a round guard and a purple-wrapped grip
  e('bone_knife', () => `<path d="M15 33L41 5l2 2-26 30z" fill="#e8ecf6" ${st}/><path d="M18 32L41 7" stroke="#fff" stroke-width="1.2" opacity=".8"/><path d="M13 37l-8 8" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="M13 37l-8 8" stroke="#6a3a8a" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="2 1.5"/><ellipse cx="15" cy="35" rx="6" ry="3" fill="#c8a040" ${st} stroke-width="1.6" transform="rotate(45 15 35)"/><path d="M30 26q6 2 8 8M34 20q6 1 8 6" stroke="#b070e0" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>`);
  e('raptor_claws', () => `<g ${st} fill="#e0d0a8"><path d="M8 38q2-20 14-30-4 16-6 32z"/><path d="M18 40q2-20 14-30-4 16-6 32z"/><path d="M28 42q2-18 14-28-4 14-6 30z"/></g><path d="M6 40h36" stroke="#c8e04a" stroke-width="3"/>`);
  // the Stone Mask: grey stone face, heavy brow, bone spikes folded above
  e('fossil_mask', () => [[14, 12, -30], [20, 9, -12], [28, 9, 12], [34, 12, 30]].map(([x, y, r]) => `<path transform="rotate(${r} ${x} ${y + 6})" d="M${x - 1.6} ${y + 6}l1.6-9 1.6 9z" fill="#efe4c8" ${st} stroke-width="1.4"/>`).join('') + `<path d="M10 16q14-10 28 0 3 16-4 25-5 4-10 4t-10-4q-7-9-4-25z" fill="#a8a090" ${st}/><path d="M12 22q6-5 11 0M25 22q6-5 11 0" stroke="${K}" stroke-width="2" fill="none"/><path d="M15 25q3-2 6 0-3 3-6 0zM27 25q3-2 6 0-3 3-6 0z" fill="${K}"/><path d="M24 26v7" stroke="${K}" stroke-width="1.4" opacity=".5"/><path d="M17 36q7 4 14 0-7 2-14 0z" fill="#8a3a3a" ${st} stroke-width="1.4"/><path d="M14 30l2 2M34 30l-2 2" stroke="${K}" stroke-width="1.2" opacity=".4"/>`);
  e('amber_charm', () => `<path d="M24 6q14 8 12 22T24 44Q10 38 12 24T24 6z" fill="#e8a020" ${st}/>` + P.bone('#8a5a10').replace('<path', '<path transform="translate(12 12) scale(.5)"'));
  e('rain_lens', () => `<circle cx="24" cy="24" r="15" fill="#dff2ff" opacity=".9" ${st}/>` + P.drop('#9fc7e8').replace('<path', '<path transform="translate(12 10) scale(.5)"') + I.shine(18, 18, 3));
  e('frost_rounds', () => [12, 20, 28, 36].map(x => `<rect x="${x - 3}" y="12" width="6" height="24" rx="3" fill="#9fd0f0" ${st} stroke-width="1.6"/>`).join('') + `<path d="M6 38h36" stroke="#dff2ff" stroke-width="3"/>`);
  e('menger_lining', () => `<path d="M24 4l-12 6-6 34h36l-6-34z" fill="#5a4a7a" ${st}/>` + P.cube('#b8b0e8').replace('<path', '<path transform="translate(14 14) scale(.42)"'));
  e('menger_boots', () => I.BOOT('#5a4a7a', '#b8b0e8'));
  e('sand_hood', () => `<path d="M8 40q0-34 16-34t16 34z" fill="#e8b36a" ${st}/><path d="M16 40q0-20 8-20t8 20z" fill="#1a1020"/>`);
  e('sand_rounds', () => [14, 24, 34].map(x => `<rect x="${x - 3}" y="10" width="6" height="26" rx="3" fill="#e8b36a" ${st} stroke-width="1.6"/>`).join('') + `<path d="M6 38h36" stroke="#c8323c" stroke-width="3"/>`);
  e('ink_duster', () => `<path d="M24 4l-12 6-6 34h36l-6-34z" fill="#2a2a3a" ${st}/><path d="M16 20l4 4 4-4 4 4 4-4M16 30l4 4 4-4 4 4 4-4" stroke="#c8323c" stroke-width="2" fill="none"/>`);
  e('ink_gloves', () => `<path d="M10 22q0-8 6-8h14q8 0 8 8v14q0 6-6 6H16q-6 0-6-6z" fill="#e8d8c8" ${st}/><text x="24" y="34" text-anchor="middle" font-family="Anton,Impact" font-size="12" fill="#c8323c">11</text>`);
  e('ink_boots', () => I.BOOT('#2a2a3a', '#c8323c'));
})();

/* ---------------- 4. Money sinks & sources ---------------- */
SBR.econ = {
  trainCost: () => 40 + 15 * SBR.run.act,
  rerollCost: () => 20 + 10 * SBR.run.act + 15 * ((SBR.run.rerolls && SBR.run.rerolls.stage === `${SBR.run.act}-${SBR.run.stage}`) ? SBR.run.rerolls.n : 0),
  feeCost: () => 20 + 10 * SBR.run.act,
  /** a trinket roll for each enemy killed */
  rollTrinkets(combat, opts) {
    const out = [];
    combat.units.filter(u => u.side === 'enemy' && u.dead).forEach(u => {
      const tier = u.tier === 'boss' ? 'boss' : u.tier === 'elite' || u.traits && u.traits.length ? 'elite' : 'common';
      const ch = { boss: 0.7, elite: 0.3, common: 0.08 }[tier];
      if (Math.random() < ch) out.push(SBR.util.pick(SBR.TRINKET_DROPS[tier]));
    });
    if (opts && opts.boss && !out.length) out.push(SBR.util.pick(SBR.TRINKET_DROPS.boss));
    return out.slice(0, 3);
  },
};
/* paying to train: the Old Marksman and the Path trainers' teaching choices cost money now. Gyro practises for free. */
(() => {
  SBR.EVENTS.forEach(ev => {
    if (ev.id === 'spinschool') return;
    (ev.choices || []).forEach(ch => {
      if (!ch.ok || !ch.ok.fx || !/g\.train\(\)/.test(String(ch.ok.fx)) || ch.cost) return;
      Object.defineProperty(ch, 'cost', { get: () => ({ money: SBR.run ? SBR.econ.trainCost() : 55 }), enumerable: true });
    });
  });
})();

/* extra money choices on existing events: bribes, fines, bail, information */
(() => {
  const E = id => SBR.EVENTS.find(e => e.id === id);
  const add = (id, choice) => { const ev = E(id); if (ev && !ev.choices.find(c => c.label === choice.label)) ev.choices.push(choice); };
  add('wounded', { label: 'Pay a passing wagon to carry him ($25)', cost: { money: 25 }, ok: { text: 'The driver takes the money and the boy. You keep your pace. "Blackwoods pay their debts," he calls back.', fx: g => { g.flag('helpedRacer'); } } });
  SBR.CONSEQ['wounded:3'] = { rep: { racers: 1 }, npc: { blackwoods: 'owed' }, deed: 'Paid a wagon to carry the boy from the ditch.' };
})();

/* the stage checkpoint fee: SBR rules allow weapons, not crime. Dodge the officials and the law remembers. */
SBR.checkpointEvent = n => ({
  id: 'checkpoint_' + n, title: `Checkpoint: ${SBR.ACTS[n].name}`, art: 'steel', icon: 'flag',
  text: `Race officials in white armbands check every rider through. "Stage fee, gentlemen. Mr. Steel pays for the water, the maps and the doctors. You pay for Mr. Steel."`,
  choices: [
    { label: `Pay the fee`, get cost() { return { money: SBR.econ.feeCost() }; }, ok: { text: 'Stamped and waved through. An official tips his hat and hands you the latest standings.', fx: g => g.pace(2) } },
    { label: 'Ride around the checkpoint at night', ok: { text: 'Nobody sees you. Nobody, except the sheriff\'s deputy who writes your number down.' } },
    { label: 'Pay double for the doctor\'s tent too', get cost() { return { money: SBR.econ.feeCost() * 2 }; }, ok: { text: 'A real doctor, real bandages, real sleep. (Party heals 50%.)', fx: g => g.healAll(0.5) } },
  ],
});
/* checkpoint consequences (the campaign remembers how you treat the race officials) */
Object.assign(SBR.CONSEQ, {
  'checkpoint:0': { deed: 'Paid the stage fee at the checkpoint.', rep: { racers: 1 } },
  'checkpoint:1': { deed: 'Rode around a race checkpoint at night.', rep: { law: -1 }, threat: 0.5 },
  'checkpoint:2': { deed: 'Paid for the doctor’s tent at a checkpoint.', rep: { racers: 1 } },
});

/* manga consumables */
Object.assign(SBR.ITEMS, {
  sandwich:  { name: 'Hot Pants\' Sandwiches', glyph: '食', color: '#f0c070', price: 24, target: 'allAllies', desc: 'Heal the whole party 9 HP. She made too many, apparently.', field: true, use: x => x.allies.forEach(a => x.heal(a, 9)) },
  tarcoffee: { name: 'Gyro\'s Tar Coffee', glyph: '黒', color: '#2a1a10', price: 22, target: 'ally', desc: '+2 Energy now, but Weakened 1. "It\'s supposed to taste like that."', use: x => { x.energy(x.target, 2); x.status(x.target, 'weak', 0, 1); } },
  rainwater: { name: 'Frozen Raindrop Water', glyph: '雨', color: '#9fc7e8', price: 26, target: 'ally', desc: 'Heal 10 and cleanse one debuff. Cold and clean.', field: true, use: x => { x.heal(x.target, 10); x.cleanse(x.target, 1); } },
});
(() => {
  const I = SBR.icons, P = I.P, st = I.st;
  I.define('item', 'sandwich', () => `<path d="M6 30L24 10l18 20z" fill="#f0c070" ${st}/><path d="M9 27h30" stroke="#6aa04a" stroke-width="3"/><path d="M11 24h26" stroke="#e8508a" stroke-width="2"/><path d="M6 30h36v6H6z" fill="#e0a850" ${st}/>`);
  I.define('item', 'tarcoffee', () => `<path d="M10 16h24v18q0 8-12 8T10 34z" fill="#f6ecd8" ${st}/><path d="M34 20q8 0 8 6t-8 6" fill="none" ${st}/><ellipse cx="22" cy="17" rx="11" ry="3" fill="#1a1020"/><path d="M16 10q2-4 0-8M24 10q2-4 0-8" stroke="#8a8aa0" stroke-width="2" fill="none"/>`);
  I.define('item', 'rainwater', () => P.flask('#dff2ff', '#9fc7e8'));
})();

/* town services: bought in shops, looked up by id so they survive a save */
SBR.SERVICES = {
  doctor:   { name: 'Doctor\'s Visit', icon: 'heart', desc: 'Heal the party 50%.', price: () => 25 + SBR.run.act * 3, run: g => g.healAll(0.5) },
  bath:     { name: 'Hot Bath & Bed', icon: 'fire', desc: 'Remove all Exhaustion.', price: () => 40, run: g => g.unexhaust(9) },
  farrier:  { name: 'Farrier & Stable', icon: 'horseshoe', desc: 'New shoes, oats, a rub-down. +15 pace.', price: () => 30 + SBR.run.act * 5, run: g => g.pace(15) },
  guide:    { name: 'Hire a Local Guide', icon: 'map', desc: 'He knows a shortcut. +20 pace.', price: () => 45 + SBR.run.act * 5, run: g => g.pace(20) },
  telegraph:{ name: 'Telegraph a False Sighting', icon: 'book', desc: 'Wire the President\'s men that you went north. -1 Threat.', price: () => 50 + SBR.run.act * 10, run: g => g.threat(-1) },
  church:   { name: 'Donate to the Church', icon: 'star', desc: 'The Vatican keeps a list of friends. Vatican +1, party heals 20%.', price: () => 35, run: g => { g.rep('vatican', 1); g.healAll(0.2); } },
  advert:   { name: 'Newspaper Advert', icon: 'flag', desc: 'Buy a column about your heroic ride. Racers +1, and a bigger prize at the next stage finish.', price: () => 40, run: g => { g.rep('racers', 1); SBR.run.flags.advert = true; } },
  smith:    { name: 'Blacksmith: Reinforce', icon: 'anvil', desc: 'Money only, no materials: raise one piece to +1 or +2.', price: () => 0, repeat: true, smith: true },
  casino:   { name: 'Casino Chips', icon: 'dice', desc: 'Lose $50 at the tables. It\'s about spending, not winning.', price: () => 50, repeat: true, run: () => {} },
};
SBR.shopServices = kind => {
  const pick = (a, n) => SBR.util.shuffle(a.slice()).slice(0, n);
  if (kind === 'trapper') return ['farrier', ...pick(['guide', 'bath', 'doctor'], 1)];
  if (kind === 'city') return ['doctor', 'smith', ...pick(['telegraph', 'church', 'advert', 'bath', 'farrier'], 2)];
  if (kind === 'sugar') return ['doctor', 'smith', 'bath', 'casino', ...pick(['telegraph', 'church', 'advert'], 1)];
  return ['doctor', ...pick(['bath', 'farrier', 'guide', 'smith', 'church'], 2)];
};

/* ---------------- 5. Tracking: where a material comes from, what it's for ---------------- */
SBR.matUses = id => {
  const out = [];
  Object.entries(SBR.EQUIPMENT).forEach(([k, e]) => {
    if (e.derived) return;
    if (e.recipe && e.recipe[id]) out.push({ kind: 'equip', id: k, n: e.recipe[id] });
    if (e.upgrades && e.upgrades.rec[id]) out.push({ kind: 'equip', id: k, n: e.upgrades.rec[id], up: e.upgrades.from });
    if (e.remnant === id) out.push({ kind: 'equip', id: k, n: 1, soul: true });
  });
  Object.entries(SBR.ITEM_RECIPES).forEach(([k, rec]) => { if (rec[id]) out.push({ kind: 'item', id: k, n: rec[id] }); });
  Object.entries(SBR.REINFORCE_MATS).forEach(([slot, rec]) => { if (rec[id]) out.push({ kind: 'reinforce', id: slot, n: rec[id] }); });
  return out;
};
SBR.matSources = id => {
  const acts = Object.entries(SBR.SCAVENGE_MATS).filter(([, v]) => v.includes(id)).map(([k]) => (/^area_/.test(k) ? SBR.AREAS[k.slice(5)].name : 'Act ' + ['', 'I', 'II', 'III', 'IV', 'V', 'VI'][k]));
  const foes = Object.entries(SBR.DROPS).filter(([, rows]) => rows.some(r => r[0] === id)).map(([k]) => (SBR.ENEMIES[k] || {}).name).filter(Boolean);
  Object.entries(SBR.REMNANT_DROPS).forEach(([k, v]) => { if (v === id && SBR.ENEMIES[k]) foes.push(SBR.ENEMIES[k].name); });
  return { acts, foes: [...new Set(foes)] };
};
SBR.matTip = (id, have) => {
  const m = SBR.MATERIALS[id];
  const grp = { generic: 'Generic material', special: 'Special material', detour: 'Detour material', soul: 'Soul: never used up', holy: 'Corpse Part' }[m.group] || m.rarity + ' material';
  let h = `<b>${m.name}</b> <i>${grp}</i>${have != null ? ` · you have <b>${have}</b>` : ''}<br>${m.desc}`;
  if (m.holy) return h;
  const S = SBR.matSources(id), U = SBR.matUses(id);
  if (S.acts.length || S.foes.length) h += `<div class="tip-src"><b>Found:</b> ${S.acts.join(', ')}${S.acts.length && S.foes.length ? ' · ' : ''}${S.foes.slice(0, 6).join(', ')}${S.foes.length > 6 ? ` +${S.foes.length - 6} more` : ''}</div>`;
  if (U.length) {
    const nm = u => u.kind === 'item' ? SBR.ITEMS[u.id].name : u.kind === 'reinforce' ? `Reinforce (${u.id})` : SBR.EQUIPMENT[u.id].name + (u.up ? ' ↑' : '');
    h += `<div class="tip-src"><b>Used in ${U.length}:</b> ${U.slice(0, 8).map(nm).join(', ')}${U.length > 8 ? ` +${U.length - 8} more` : ''}</div>`;
  }
  return h;
};
SBR.MAT_GROUPS = [['generic', 'GENERIC'], ['special', 'SPECIAL'], ['detour', 'DETOUR'], ['soul', 'SOULS'], ['holy', 'CORPSE PARTS']];

/* ---------------- Trinkets are gone: loot is now real gear, materials or money ---------------- */
Object.assign(SBR.EQUIPMENT, {
  sandman_emerald: { slot: 'charm', family: 'coin', name: 'Sandman\'s Emerald', rarity: 'rare', stats: { luck: 4, res: 3 }, bonus: { crit: 0.03 }, price: 150, note: 'He tried to pay with it. Now it pays you back.' },
  pocket_watch:    { slot: 'charm', family: 'device', name: 'Giorno\'s Ladybug Brooch', rarity: 'uncommon', stats: { ride: 2 }, bonus: { init: 3, crit: 0.03 }, price: 70, note: 'Gold Experience can make it a living ladybug. It is always first to move.' },
  stage_medal:     { slot: 'charm', family: 'trophy', name: 'Rohan\'s G-Pen', rarity: 'uncommon', stats: { ride: 3 }, bonus: { dodge: 0.04 }, price: 60, note: 'Kishibe Rohan inks a page faster than you can blink. So does whoever holds his pen.' },
});
(() => {
  const I = SBR.icons, st = I.st;
  const gem = c => `<path d="M14 16h20l8 8-18 18L6 24z" fill="${c}" ${st}/><path d="M6 24h36M14 16l10 26 10-26" stroke="#1a1020" stroke-width="1.4" fill="none" opacity=".5"/>`;
  I.define('equip', 'sandman_emerald', () => gem('#3ac870'));
  // Giorno's ladybug brooch
  I.define('equip', 'pocket_watch', () => `<ellipse cx="24" cy="27" rx="15" ry="16" fill="#f2c14e" ${st}/><ellipse cx="24" cy="29" rx="10" ry="11" fill="#c8323c" ${st}/><path d="M24 18v22" stroke="#1a1020" stroke-width="1.8"/><path d="M17 17q7-6 14 0" fill="#1a1020" ${st} stroke-width="1.6"/><g fill="#1a1020"><circle cx="19" cy="26" r="2"/><circle cx="29" cy="26" r="2"/><circle cx="20" cy="34" r="1.6"/><circle cx="28" cy="34" r="1.6"/></g><path d="M20 12l-3-6M28 12l3-6" stroke="#1a1020" stroke-width="1.6"/>${I.shine(19, 23, 2)}`);
  // Rohan's G-pen: holder, steel nib, a fresh blot of ink
  I.define('equip', 'stage_medal', () => `<path d="M16 32L40 8" stroke="#1a1020" stroke-width="8" stroke-linecap="round"/><path d="M16 32L40 8" stroke="#3a6a4a" stroke-width="4.6" stroke-linecap="round"/><path d="M34 14l4-4" stroke="#f2c14e" stroke-width="2"/><path d="M18 28l4 4-12 10-2-2z" fill="#c8ccd8" ${st}/><path d="M8 40l6-5" stroke="#1a1020" stroke-width="1.2"/><path d="M6 46q-2-4 2-5 4 1 3 5z" fill="#1a1020"/>`);
})();
/** what an old trinket id turns into */
SBR.TRINKET_AS = {
  emerald: { gear: 'sandman_emerald' }, pocketwatch: { gear: 'pocket_watch' }, racer_medal: { gear: 'stage_medal' },
  conf_coin: { mats: { silver: 1 } }, bounty: { money: 40 }, diamond: { mats: { gold: 1, silver: 1 } }, silver_spoon: { mats: { silver: 1 } },
  arrowhead: { mats: { bone: 2 } }, gold_tooth: { mats: { gold: 1 } }, pigeon_note: { money: 35, flag: 'pigeonRead' }, sugar_gold: { mats: { gold: 2, sap: 1 } },
};
/* a few ids stay as hidden key items that encounters check for */
['ticket', 'stand_arrow', 'aja_stone'].forEach(k => { if (SBR.TRINKETS[k]) SBR.TRINKETS[k].keep = true; });
/** give the real reward for a loot id; returns a loot entry for the rewards screen, if any */
SBR.trinketReward = (g, id, silent) => {
  const r = SBR.run, T = SBR.TRINKETS[id];
  if (T && T.keep) { r.trinkets = r.trinkets || []; if (!r.trinkets.includes(id)) r.trinkets.push(id); if (!silent) SBR.toast(`<span class="toast-ico">${SBR.trinketIcon(id)}</span> ${T.name}`, 'good'); return null; }
  const A = SBR.TRINKET_AS[id]; if (!A) return null;
  if (A.gear) { if (silent) { r.gear.push(A.gear); } else g.gear(A.gear); return { kind: 'equip', id: A.gear }; }
  if (A.mats) Object.entries(A.mats).forEach(([k, n]) => g.mat(k, n, silent));
  if (A.money) g.money(A.money);
  if (A.flag) g.flag(A.flag);
  return null;
};
SBR.TRINKET_DROPS = { common: ['conf_coin', 'silver_spoon', 'arrowhead', 'gold_tooth', 'bounty'], elite: ['pocketwatch', 'racer_medal', 'bounty', 'diamond'], boss: ['diamond', 'pocketwatch', 'racer_medal', 'emerald'] };
