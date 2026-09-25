/* Horses of the Steel Ball Run: the racers' mounts from the manga, a passive and a once-per-race ability for every horse,
   unlocks, and two trail encounters that let you change horses mid-run.
   race.use(A) is called by the sprint minigame: A.S (race state), A.me, A.rivals(), A.ahead(), A.stunAhead(s), A.stamina(n), A.flash(c). */
'use strict';
(() => {
  const H = SBR.HORSES;
  const boost = (S, n) => { S.boostT = Math.max(0, S.boostT || 0) + n; };
  const shield = (S, n) => { S.shield = Math.max(0, S.shield || 0) + n; };
  const steady = S => { S.stumble = 0; S.slow = 0; };
  const near = (A, from, to) => A.rivals().filter(r => !r.done && r.pos - A.me.pos >= from && r.pos - A.me.pos <= to);

  /* ---------- new horses (names, owners and breeds as given in the manga; unnamed ones are "X's horse") ---------- */
  Object.assign(H, {
    valkyrie: { name: 'Valkyrie', breed: 'Stock Horse', owner: 'gyro', coat: '#5a3a2a', mane: '#1a1020', wrap: '#f2c14e', marks: { blaze: '#f6ecd8' }, res: { spin: -0.15, sound: 0.1 }, speed: 8, stamina: 7,
      desc: 'Gyro Zeppeli\'s horse, with Australian roots. Every eight breaths it lurches to its left.', bonus: { spinDmg: 0.1, rotationStart: 1 },
      perk: 'Zeppeli Stride: Spin abilities deal +10% damage. Gyro starts battles with +1 Rotation.',
      race: { name: 'Eighth Breath', glyph: '八', color: '#f2c14e', desc: 'Lurch left on the eighth breath: 2.5s of attacks miss and you slip 12m ahead.', use: A => { shield(A.S, 2.5); A.me.pos += 12; A.flash('#f2c14e'); } } },
    ghostrider: { name: 'Ghost Rider in the Sky', breed: 'Cow Pony', owner: 'mountaintim', coat: '#d8d2c4', mane: '#8a8a9a', wrap: '#c8a070', marks: { socks: '#8a8a9a' }, res: { bullet: -0.1, holy: 0.1 }, speed: 6, stamina: 8,
      desc: 'Mountain Tim\'s horse. It knows the desert as well as he does.', bonus: { guardStart: 1, dodge: 0.03 },
      perk: 'Cowboy\'s Mount: party starts battles with Guard for 1 turn. +3% dodge.',
      race: { name: 'Lasso Pull', glyph: '縄', color: '#c8a070', desc: 'Rope the rider ahead: they are stunned for 2s and you haul yourself 15m closer.', use: A => { A.stunAhead(2); A.me.pos += 15; A.flash('#c8a070'); } } },
    heyya: { name: 'Hey! Ya!', breed: 'Quarter Horse', owner: 'pocoloco', coat: '#c8843a', mane: '#f2c14e', wrap: '#e8508a', marks: { blaze: '#fff' }, res: { phys: 0.05, stand: -0.1 }, speed: 7, stamina: 6,
      desc: 'Pocoloco\'s horse. Neither of them is a great racer. Both of them are very lucky.', bonus: { check: 1, crit: 0.05 },
      perk: 'Beginner\'s Luck: +1 to every skill check, +5% crit chance.',
      race: { name: 'Lucky Break', glyph: '運', color: '#e8508a', desc: 'Luck decides: a 3s sprint burst, 3 automatic GOLD strides, or +40 stamina.', use: A => { const n = Math.floor(Math.random() * 3); if (n === 0) boost(A.S, 3); else if (n === 1) A.S.autoGold = (A.S.autoGold || 0) + 3; else A.stamina(40); A.flash('#e8508a'); } } },
    getsup: { name: 'Gets Up', breed: 'Mustang', owner: 'hotpants', coat: '#6a4a3a', mane: '#2a1a1a', wrap: '#e8a0c0', marks: { socks: '#f6ecd8' }, res: { bleed: -0.2, cold: 0.1 }, speed: 7, stamina: 7,
      desc: 'Hot Pants\' young mustang. However hard it falls, it gets up.', bonus: { heal: 0.15, restHeal: 0.25 },
      perk: 'Field Medic\'s Mount: healing +15%. Resting heals 25% more.',
      race: { name: 'Gets Back Up', glyph: '起', color: '#e8a0c0', desc: 'Shake off stumbles, slowdowns and blindness, +20 stamina and 1.5s of attacks miss.', use: A => { steady(A.S); A.S.blind = 0; A.stamina(20); shield(A.S, 1.5); A.flash('#e8a0c0'); } } },
    hono: { name: 'Hono', breed: 'Bavarian Warmblood', owner: 'norisuke', coat: '#3a2a24', mane: '#0e0a0a', wrap: '#c8323c', marks: { blaze: '#f6ecd8', socks: '#f6ecd8' }, res: { cold: -0.2, sound: 0.1 }, speed: 6, stamina: 8,
      desc: 'Norisuke Higashikata IV\'s horse. Big-boned, well fed and never in a hurry until it matters.', bonus: { money: 0.2, discount: 0.1 },
      perk: 'Merchant\'s Horse: +20% money, shop prices 10% cheaper.',
      race: { name: 'Warm Blood', glyph: '暖', color: '#c8323c', desc: 'A heavy horse finds its rhythm: 2s sprint burst and +15 stamina.', use: A => { boost(A.S, 2); A.stamina(15); A.flash('#c8323c'); } } },
    europeexpress: { name: 'Europe Express', breed: 'Trakehner', owner: 'stroheim', coat: '#a0a0a8', mane: '#4a4a52', wrap: '#1a1a1a', spots: '#6a6a74', res: { phys: -0.1, holy: 0.1 }, speed: 8, stamina: 6,
      desc: 'Fritz von Stroheim\'s horse. It runs on a timetable.', bonus: { init: 4, paceStage: 2 },
      perk: 'Precision Timetable: +4 initiative. +2 Pace every stage.',
      race: { name: 'On Schedule', glyph: '急', color: '#8a8a9a', desc: 'Cut the corner exactly where the map says: jump 20m ahead.', use: A => { A.me.pos += 20; A.flash('#c8c8d0'); } } },
    peg: { name: 'Peg', breed: 'Criollo', owner: 'gaucho', coat: '#b89a70', mane: '#3a2a1a', wrap: '#3a8cc8', marks: { socks: '#3a2a1a' }, res: { cold: -0.15, bullet: 0.1 }, speed: 5, stamina: 10,
      desc: 'The Gaucho\'s horse, bred on the pampas. Eats anything, walks forever.', bonus: { bleedOnBasic: 0.25, scavenge: 1 },
      perk: 'Pampas Hunter: basic attacks have 25% chance to Bleed. Scavenging finds more.',
      race: { name: 'Bolas', glyph: '縛', color: '#3a8cc8', desc: 'Throw bolas down the trail: every rival up to 120m ahead is tangled for 1.5s.', use: A => { near(A, 0, 120).forEach(r => { r.stun = Math.max(r.stun || 0, 1.5); }); A.flash('#3a8cc8'); } } },
    ramblinman: { name: 'Ramblin\' Man', breed: 'Pinto', owner: 'dixiechicken', coat: '#8a4a2a', mane: '#f6ecd8', wrap: '#3fa05a', marks: { patches: '#f6ecd8' }, res: { sound: -0.15, spin: 0.1 }, speed: 7, stamina: 6,
      desc: 'Dixie Chicken\'s pinto. It has seen a lot of road.', bonus: { xp: 0.2, pace: 8 },
      perk: 'Well-Travelled: +20% experience. +8 Pace every act.',
      race: { name: 'Slipstream', glyph: '流', color: '#3fa05a', desc: 'Tuck in behind the rider ahead: close up to 35m on them (15m if nobody is ahead).', use: A => { const a = A.ahead(); const gap = a ? a.pos - A.me.pos - 4 : 15; A.me.pos += Math.max(8, Math.min(35, gap)); A.flash('#3fa05a'); } } },
    elcondorpasa: { name: 'El Condor Pasa', breed: 'Appaloosa', owner: 'mrsrobinson', coat: '#e8e0d0', mane: '#6a5a4a', wrap: '#e8508a', spots: '#3a2a24', res: { stand: -0.1, bleed: 0.1 }, speed: 6, stamina: 7,
      desc: 'Mrs. Robinson\'s appaloosa. "TRUE LOVE" is stitched on its reins.', bonus: { postHeal: 5, regen: 1 },
      perk: 'True Love: party heals 1 HP each turn and 5 HP after every battle.',
      race: { name: 'True Love', glyph: '愛', color: '#e8508a', desc: 'It runs for its rider: +30 stamina and 1.5s of attacks miss.', use: A => { A.stamina(30); shield(A.S, 1.5); A.flash('#e8508a'); } } },
    blackrose: { name: 'Black Rose', breed: 'Big Black Horse', owner: 'nicholas', coat: '#1e1a22', mane: '#0a080c', wrap: '#8a1a2a', res: { holy: -0.15, cold: 0.1 }, speed: 7, stamina: 7,
      desc: 'Nicholas Joestar\'s horse. Big, black, and a bit sensitive.', bonus: { critDmg: 0.25, crit: 0.02 },
      perk: 'Temperamental: +25% crit damage, +2% crit chance.',
      race: { name: 'Rear Up', glyph: '薔', color: '#8a1a2a', desc: 'It spooks and rears: every rival within 50m (ahead or behind) is stunned for 2s.', use: A => { near(A, -50, 50).forEach(r => { r.stun = Math.max(r.stun || 0, 2); }); A.flash('#8a1a2a'); } } },
    wekacharger: { name: 'Wekapipo\'s Horse', breed: 'Neapolitan Charger', owner: 'wekapipo', coat: '#6a6a70', mane: '#e8e0d0', wrap: '#2a4a8a', marks: { socks: '#1a1020' }, res: { phys: -0.15, spin: -0.05, sound: 0.15 }, speed: 6, stamina: 8,
      desc: 'Wekapipo\'s horse, trained for the guard of a king.', bonus: { shieldStart: 5, block: 0.03 },
      perk: 'Royal Guard: every party member starts battles with a 5 Shield. +3% block.',
      race: { name: 'Cavalry Charge', glyph: '騎', color: '#2a4a8a', desc: 'Lower your head and charge: 2s sprint burst and 2s of attacks miss.', use: A => { boost(A.S, 2); shield(A.S, 2); A.flash('#2a4a8a'); } } },
    raptor: { name: 'Scary Monster', breed: 'Dinosaurised Horse', owner: 'diego', coat: '#6a8a4a', mane: '#3a4a2a', wrap: '#3fb8a9', marks: { scales: '#2a3a1a' }, res: { holy: 0.15, phys: -0.1, bleed: -0.1 }, speed: 9, stamina: 4,
      desc: 'A horse caught in Scary Monsters\' infection. Half of it is something much older now.', bonus: { dmg: 0.08, init: 2 },
      perk: 'Predator: +8% damage for the party, +2 initiative.',
      race: { name: 'Raptor Leap', glyph: '恐', color: '#3fb8a9', desc: 'Pounce: leap 15m ahead and stun the rider in front for 1s.', use: A => { A.me.pos += 15; A.stunAhead(1); A.flash('#3fb8a9'); } } },
    zombie: { name: 'Zombie Horse', breed: 'Stitched Mare', coat: '#8a9a88', mane: '#3a3a2a', wrap: '#6ad08a', marks: { stitches: true }, res: { bleed: -0.3, holy: 0.15 }, speed: 5, stamina: 9,
      desc: 'A racer\'s mare that fell on the trail, stitched back together with Zombie Horse thread. It does not tire the way living horses do.', bonus: { stitch: 1 },
      perk: 'Stitched Together: once per battle, the first ally to fall is stitched back up at 25% HP.',
      race: { name: 'Undying Stride', glyph: '縫', color: '#6ad08a', desc: 'Stamina below 35: refill to 75. Otherwise +25. Clears stumbles.', use: A => { if ((A.S.stamina || 0) < 35) A.stamina(75 - (A.S.stamina || 0)); else A.stamina(25); steady(A.S); A.flash('#6ad08a'); } } },
  });

  /* ---------- race abilities for the original six ---------- */
  const RACE = {
    slowdancer: { name: 'Slow Dance', glyph: '穏', color: '#8a5ad0', desc: 'An old horse\'s calm: your next 3 strides are automatic GOLD, +10 stamina.', use: A => { A.S.autoGold = (A.S.autoGold || 0) + 3; A.stamina(10); A.flash('#8a5ad0'); } },
    mustang: { name: 'Kick Dust', glyph: '塵', color: '#c8323c', desc: 'Kick up a dust devil: every rival up to 80m behind is stunned for 2.5s.', use: A => { near(A, -80, -1).forEach(r => { r.stun = Math.max(r.stun || 0, 2.5); }); A.flash('#b8703a'); } },
    ironhoof: { name: 'Plough Through', glyph: '鉄', color: '#f2c14e', desc: 'Nothing stops a draft horse: clear stumbles and slowdowns, 3.5s of attacks miss.', use: A => { steady(A.S); shield(A.S, 3.5); A.flash('#f2c14e'); } },
    desertrose: { name: 'Second Wind', glyph: '砂', color: '#3fb8a9', desc: 'The heat means nothing to her: +40 stamina and clear blindness.', use: A => { A.stamina(40); A.S.blind = 0; A.flash('#3fb8a9'); } },
    silverbullet: { name: 'Silver Bullet', glyph: '弾', color: '#c8c8d0', desc: 'The finest sprint money can buy: +50% speed for 3.5s.', use: A => { boost(A.S, 3.5); A.flash('#c8c8d0'); } },
    steppe: { name: 'Nomad\'s Pace', glyph: '草', color: '#e8742a', desc: 'The steppe pony never stops: +20 stamina, 1.5s sprint burst, clear slowdowns.', use: A => { A.stamina(20); boost(A.S, 1.5); A.S.slow = 0; A.flash('#e8742a'); } },
  };
  Object.entries(RACE).forEach(([k, r]) => { if (H[k] && !H[k].race) H[k].race = r; });
  if (H.slowdancer) H.slowdancer.owner = 'johnny';
  if (H.silverbullet) H.silverbullet.owner = 'diego';

  /* perk text shown on cards and in the bag: passive + the race ability */
  const css = document.createElement('style');
  css.textContent = '.hc-race{display:block;margin-top:5px;padding:3px 6px;border:2px solid var(--ink,#1a1020);background:#fff8e0;font-size:12px;line-height:1.3}.hc-race .hr-g{display:inline-block;min-width:18px;text-align:center;color:#fff;text-shadow:0 0 2px #1a1020,0 0 2px #1a1020;background:var(--c);border:1.5px solid var(--ink,#1a1020);margin-right:3px;font-size:12px}';
  document.head.appendChild(css);
  SBR.horseRaceHtml = h => h && h.race ? `<span class="hc-race"><b class="hr-g" style="--c:${h.race.color}">${h.race.glyph}</b><b>RACE · ${h.race.name}</b> — ${h.race.desc}</span>` : '';
  Object.values(H).forEach(h => { if (h.passive == null) h.passive = h.perk; h.perk = h.passive + SBR.horseRaceHtml(h); });

  /* ---------- unlocks: each new horse comes from an existing achievement ---------- */
  const UNLOCK = { valkyrie: 'golden', ghostrider: 'tim', heyya: 'poco', getsup: 'hotpants', wekacharger: 'weka', raptor: 'act2', hono: 'act4', europeexpress: 'act5', peg: 'sprint1', ramblinman: 'nat20', elcondorpasa: 'rich', blackrose: 'valentine', zombie: 'corpse5' };
  Object.entries(UNLOCK).forEach(([k, a]) => { if (SBR.ACHIEVEMENTS[a] && !SBR.ACHIEVEMENTS[a].unlockHorse) SBR.ACHIEVEMENTS[a].unlockHorse = k; });
  // players who earned these achievements before the horses existed get them now
  const M = SBR.meta;
  let grew = false;
  Object.entries(SBR.ACHIEVEMENTS).forEach(([id, a]) => { if (a.unlockHorse && M.achievements[id] && !M.unlockedHorses.includes(a.unlockHorse)) { M.unlockedHorses.push(a.unlockHorse); grew = true; } });
  if (grew) SBR.saveMeta();

  /* ---------- changing horses mid-run ---------- */
  /** mirrors makeMember: a horse's maxHp bonus goes to everyone via SBR.bonus() plus once more to the lead */
  SBR.swapHorse = key => {
    const r = SBR.run, from = H[r.horse] || {}, to = H[key];
    if (!to || key === r.horse) return;
    const d = ((to.bonus || {}).maxHp || 0) - ((from.bonus || {}).maxHp || 0);
    const lead = r.lead || 'johnny';
    if (d) r.party.concat(r.reserve || []).forEach(m => {
      const n = d * (m.id === lead ? 2 : 1);
      m.maxHp = Math.max(1, m.maxHp + n);
      if (m.hp > 0) m.hp = Math.max(1, Math.min(m.maxHp, m.hp + Math.max(0, n)));
    });
    r.horse = key;
    SBR.toast(`<div class="toast-horse" style="width:60px">${SBR.art.horse({ coat: to.coat, mane: to.mane, wrap: to.wrap, spots: to.spots })}</div><div>You now ride <b>${to.name}</b>.<br><small>${to.passive}</small></div>`, 'good');
    SBR.audio.play('select');
  };
  const price = k => 50 + (H[k].speed + H[k].stamina) * 4;
  const inParty = id => SBR.run.party.concat(SBR.run.reserve || []).some(m => m.id === id);
  const small = h => `<span style="flex:0 0 92px;width:92px">${SBR.art.horse({ coat: h.coat, mane: h.mane, wrap: h.wrap, spots: h.spots })}</span>`;
  const brief = (h, tail = '') => `<span style="display:flex;gap:10px;align-items:center;margin-top:6px">${small(h)}<span><b>${h.name}</b> <i>(${h.breed})</i>${tail}<br>${h.passive}<br><i>Race: ${h.race.name}. ${h.race.desc}</i></span></span>`;
  /** one offer per stage, remembered so the panel and resolveChoice see the same choice objects */
  const KEEPS = ['johnny', 'gyro', 'diego']; // they ride their own horses the whole race
  const offers = {};
  const offer = (id, n, pool) => {
    const r = SBR.run, at = [id, r.act, r.stage, r.area ? r.area.stage : '', r.horse].join(':');
    if (offers[id] && offers[id].at === at) return offers[id];
    const keys = SBR.util.shuffle(pool().filter(k => k !== r.horse && H[k].race && !(H[k].owner && (KEEPS.includes(H[k].owner) || inParty(H[k].owner))))).slice(0, n);
    return (offers[id] = { at, keys, choices: null });
  };

  const TRADER = () => offer('horsedealer', 2, () => Object.keys(H));
  const traderChoices = () => {
    const o = TRADER();
    if (!o.choices) {
      o.choices = o.keys.map(k => ({ label: `Trade your horse for ${H[k].name}`, cost: { money: price(k) },
        ok: { text: `The trader looks over ${H[SBR.run.horse].name}, spits, and hands you the reins of ${H[k].name}. "Racers drop out every day. Their horses still want to run."`, fx: () => SBR.swapHorse(k) } }));
      while (o.choices.length < 2) o.choices.push({ label: 'Ask what else he has', ok: { text: '"That\'s all the stock I\'ve got today, friend."' } });
      o.choices.push({ label: 'Just have your horse re-shod (+8 pace)', cost: { money: 12 }, ok: { text: 'New shoes, a trimmed hoof and an apple. Your horse steps lighter.', fx: g => g.pace(8) } });
    }
    return o.choices;
  };
  const RIDERLESS = () => offer('riderless', 1, () => ['mustang', 'ironhoof', 'desertrose', 'steppe'].filter(k => H[k]));
  const riderlessChoices = () => {
    const o = RIDERLESS();
    if (!o.choices) {
      const k = o.keys[0];
      o.choices = [
        k ? { label: `Take ${H[k].name} and leave your own horse to graze`, ok: { text: `${H[k].name} sniffs your hand and lets you mount. Your old horse wanders off toward the grass. It will find someone.`, fx: () => SBR.swapHorse(k) } }
          : { label: 'Look for the horse', ok: { text: 'It has already run off. You ride on.' } },
        { label: 'Bury the rider and send the horse home', ok: { text: 'You dig a shallow grave and carve the race number into a board. The horse follows you a mile before turning back. (+20 XP)', fx: g => g.xp(20) } },
        { label: 'Take the saddlebags', ok: { text: 'Cash, jerky and a letter home you don\'t read. (+$45)', fx: g => g.money(45) } },
      ];
    }
    return o.choices;
  };

  // events.js and campaign.js load after this file
  window.addEventListener('DOMContentLoaded', () => {
  SBR.EVENTS.push(
    { id: 'horsedealer', acts: [1, 2, 3, 4, 5], type: 'event', title: 'Horse Trader', blurb: 'A checkpoint corral full of horses whose racers gave up.', icon: 'horseshoe', weight: 2, pace: -2,
      get html() { const o = TRADER(); return `A trader leans on the corral rail at the checkpoint. "Half the field quits before the Rockies, and they sell me their horses for train fare. Yours looks tired. Want to trade?"<br>${o.keys.map(k => brief(H[k], ` · <b>${SBR.util.fmtMoney(price(k))}</b>`)).join('')}`; },
      get choices() { return traderChoices(); } },
    { id: 'riderless', acts: [1, 2, 3, 4, 5], type: 'event', title: 'The Riderless Horse', blurb: 'A saddled horse stands alone by the trail, reins dragging.', icon: 'horseshoe', weight: 1, once: true, pace: -2,
      get html() { const o = RIDERLESS(); const k = o.keys[0]; return `A saddled horse grazes beside a fresh mound of stones. Its rider fell on the trail, and nobody came back for the horse. It looks up at you.${k ? brief(H[k]) : ''}`; },
      get choices() { return riderlessChoices(); } },
  );
  Object.assign(SBR.CONSEQ, {
    'horsedealer:0': { rep: { racers: 1 }, deed: 'Traded horses with a checkpoint horse trader.' },
    'horsedealer:1': { rep: { racers: 1 }, deed: 'Traded horses with a checkpoint horse trader.' },
    'horsedealer:2': { deed: 'Had your horse re-shod at a checkpoint.' },
    'riderless:0': { rep: { racers: -1 }, deed: 'Took a fallen racer\'s horse and left your own.' },
    'riderless:1': { rep: { racers: 2 }, deed: 'Buried a fallen racer and sent the horse home.' },
    'riderless:2': { rep: { racers: -2, law: -1 }, deed: 'Robbed a fallen racer\'s saddlebags.' },
  });
  });
})();
