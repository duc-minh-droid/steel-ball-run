/* The manga, squeezed: every run takes a different road through Steel Ball Run.
   - Story beats are offered, not forced. Skipping one has consequences (SBR.onStorySkip) and some come back later.
   - Major beats branch: fight, talk, trick, flee, side with the villain. Each choice is keyed scene:<id>:<i> in SBR.CONSEQ.
   - Four or more act variants per act, each with its own boss and core beats, plus a random handful of optional beats.
   - A run omen, a route choice at the start of each act, boss twists driven by what you skipped or did,
     and world-state encounters that only appear when a faction loves or hates you.
   Loaded after sbr.js. Lines are {who, text, mood?} or {narr, mood?}. */
'use strict';

(() => {
  const S = SBR.STORY, E = SBR.ENEMIES, CQ = SBR.CONSEQ;
  const run = () => SBR.run;
  const F = () => (SBR.run && SBR.run.flags) || {};
  const inParty = id => !!(SBR.run && SBR.run.party.some(m => m.id === id));
  const lead = () => SBR.run && SBR.run.lead;
  const rep = f => (SBR.campaign && SBR.run ? SBR.campaign.repOf(f) : 0);
  const npcIs = (id, st) => !!(SBR.campaign && SBR.run && SBR.campaign.npcIs(id, st));
  const holyCount = () => { const r = SBR.run; return r ? Object.keys(r.mats || {}).filter(k => SBR.MATERIALS[k] && SBR.MATERIALS[k].holy && r.mats[k] > 0).length : 0; };
  const unflag = k => { if (SBR.run) delete SBR.run.flags[k]; };
  const port = key => ({ kind: 'portrait', key });
  SBR.manga = { inParty, rep, npcIs, holyCount, unflag };

  /* ---------------- helpers ---------------- */
  const routes = () => (SBR.run ? (SBR.run.routes = SBR.run.routes || {}) : {});
  /** add consequences for a scene's choices: C[i] belongs to choices[i], C[i].fail to its failed check */
  const conseq = (id, list) => list.forEach((c, i) => { if (!c) return; const { fail, ...ok } = c; CQ['scene:' + id + ':' + i] = ok; if (fail) CQ['scene:' + id + ':' + i + ':fail'] = fail; });
  /** turn a scene into a branch: each outcome can pick a route; the scene's fight and after depend on the route taken */
  function branch(id, o) {
    const s = S[id];
    if (!s) { console.warn('[manga] no scene', id); return; }
    const baseFx = 'fx' in o ? o.fx : s.fx;
    s.fx = g => { routes()[id] = null; if (baseFx) baseFx(g); };
    s.choices = o.choices.map(c => {
      ['ok', 'fail'].forEach(k => {
        const out = c[k];
        if (!out || out.route === undefined) return;
        const f = out.fx, rt = out.route;
        out.fx = g => { routes()[id] = rt; if (f) f(g); };
      });
      return c;
    });
    const fights = o.fights || {};
    Object.defineProperty(s, 'fight', { configurable: true, enumerable: true,
      get() { const rt = routes()[id]; const f = rt && fights[rt]; return (typeof f === 'function' ? f() : f) || null; }, set() {} });
    Object.defineProperty(s, '_fights', { value: fights, enumerable: false, configurable: true });
    const afters = o.after || {};
    s.after = g => { const rt = routes()[id]; if (rt && afters[rt]) afters[rt](g); if (afters['*']) afters['*'](g); };
    if (o.conseq) conseq(id, o.conseq);
    ['foe', 'when', 'required', 'skip'].forEach(k => { if (o[k] !== undefined) s[k] = o[k]; });
  }
  /** a plain scene with choices (no routes) */
  const scene = (id, o, C) => { S[id] = o; if (C) conseq(id, C); return o; };
  SBR.manga.branch = branch; SBR.manga.conseq = conseq;

  /* ================= Portraits ================= */
  const P = SBR.art.P || {};
  SBR.art.addPortrait({
    saintlucy: Object.assign({}, P.lucy || {}, { bg: ['#fff3c0', '#f6ecd8'], extra: 'halo' }),
    diegomother: { skin: '#f0d0b8', hair: '#c8a040', hairStyle: 'long', hat: 'bandana', hatColor: '#6a5a4a', hat2: '#c8b8a0', outfit: '#6a5a4a', outfit2: '#c8b8a0', eye: '#3a6a9a', lip: '#a06060', bg: ['#3a2a2a', '#8a7a6a'] },
  });

  /* ================= Boss variants ================= */
  /** Johnny's Tusk ACT3 awakens in fights that aren't Axl RO's, once he's hurt enough */
  const withTusk3 = def => {
    const H = Object.assign({}, def.hooks || {}); const base = H.damaged;
    H.damaged = x => { const res = base ? base(x) : undefined; if (!x.flag('t3go') && x.user.hp < x.user.maxHp * 0.5) { x.setFlag('t3go'); if (!SBR.run.flags.tusk3) { x.dialogue('tusk3_awaken'); x.unlockFlag('tusk3'); } } return res; };
    return Object.assign(def, { hooks: H });
  };
  /** Ball Breaker and Tusk ACT4 come from whichever Valentine you finally face */
  const withFinale = def => {
    const H = Object.assign({}, def.hooks || {}); const rs = H.roundStart, dm = H.damaged;
    H.roundStart = x => { if (rs) rs(x); if (x.round === 2 && !x.flag('bbUnlocked') && !SBR.run.flags.ballbreaker) { x.setFlag('bbUnlocked'); x.dialogue('ball_breaker_learn'); x.unlockFlag('ballbreaker'); } };
    H.damaged = x => { const res = dm ? dm(x) : undefined; if (!x.flag('gyroFalls') && !SBR.run.flags.tusk4 && x.user.hp <= x.user.maxHp * 0.55) { x.setFlag('gyroFalls'); x.dialogue('gyro_falls'); x.killAlly('gyro'); x.unlockFlag('tusk4'); x.heal(x.user, 30, {}); } return res; };
    return Object.assign(def, { hooks: H });
  };
  const variant = (id, base, o) => { if (!E[base]) { console.warn('[manga] no base enemy', base); return; } E[id] = Object.assign({}, E[base], o); SBR.ENEMY_BASE[id] = base;
    if (SBR.DROPS && SBR.DROPS[base] && !SBR.DROPS[id]) SBR.DROPS[id] = SBR.DROPS[base];
    if (SBR.REMNANT_DROPS && SBR.REMNANT_DROPS[base] && !SBR.REMNANT_DROPS[id]) SBR.REMNANT_DROPS[id] = SBR.REMNANT_DROPS[base]; return E[id]; };
  SBR.ENEMY_BASE = SBR.ENEMY_BASE || { robinson_boss: 'robinson', oyecomova_boss: 'oyecomova' };
  if (SBR.REMNANT_DROPS) { SBR.REMNANT_DROPS.robinson_boss = SBR.REMNANT_DROPS.robinson_boss || 'rem_robinson'; SBR.REMNANT_DROPS.oyecomova_boss = SBR.REMNANT_DROPS.oyecomova_boss || 'rem_oyecomova'; }

  // Act I / II — Pork Pie Hat Kid as the act boss
  variant('porkpie_boss', 'porkpie', { tier: 'boss', hp: 112, stats: { aim: 6, ride: 6 }, xp: 48, money: [50, 70], title: 'Valentine’s Hunter, in His Canyon',
    quote: 'The whole canyon’s strung, kid. Every rock is a reel.',
    passive: 'Hides in the rocks (Evasive unless Scanned). Hooks riders, then reels every hooked rider in at once. Burn his lines with Spin.',
    abilities: E.porkpie.abilities.concat([
      { name: 'Reel Them All', w: 2, cd: 4, target: 'allEnemies', fx: 'rope', cond: x => x.count('hooked') >= 2, run: x => { x.enemies.filter(e => x.has(e, 'hooked')).forEach(e => { x.removeStatus(e, 'hooked'); x.dmg(e, 8, {}, { noDodge: true, label: 'REEL' }); }); x.say(x.user, 'Reel, reel, REEL!'); } },
    ]) });
  variant('porkpie_boss2', 'porkpie_boss', { hp: 150, stats: { aim: 7, ride: 7 }, xp: 62, money: [60, 85], title: 'Wired — The Rockies Are His Reel' });
  // Act I — Oyecomova, early and angrier
  variant('oyecomova_boss1', 'oyecomova_boss', { hp: 100, stats: { aim: 5, grit: 4 }, xp: 46, money: [45, 65], title: 'The Terrorist from Naples, at the Relay Station' });
  // Act II — Diego with Scary Monsters, hunting the Eye
  variant('diego_boss', 'diego_rival', { tier: 'boss', hp: 150, stats: { aim: 7, ride: 10 }, xp: 62, money: [60, 85], title: 'Scary Monsters, Hunting the Saint’s Eye',
    quote: 'You found it first. That only means you carried it to me.',
    passive: 'Dodges unless Marked, calls raptors and executes the weakest rider. Below half HP he becomes a full dinosaur: Empowered and regenerating.',
    hooks: Object.assign({}, E.diego_rival.hooks, { damaged: x => { if (!x.flag('fullDino') && x.user.hp < x.user.maxHp * 0.5) { x.setFlag('fullDino'); x.status(x.user, 'empower', 0, 3); x.status(x.user, 'regen', 0, 3); x.summon('raptor'); x.say(x.user, 'WRYYY! This is what nature made me!'); } } }) });
  // Act III — Blackmore over Kansas City; and the rain that follows you if you skip him
  variant('blackmore_boss', 'blackmore', { hp: 140, xp: 64, money: [65, 85], title: 'Catch the Rainbow over Kansas City',
    abilities: E.blackmore.abilities.concat([{ name: 'Rain Curtain', w: 1, cd: 4, target: 'allEnemies', fx: 'rain', run: x => x.enemies.forEach(e => { x.dmg(e, 3, {}, { dtype: 'cold' }); x.status(e, 'soaked', 0, 2); }) }]) });
  variant('rain_blackmore', 'blackmore', { name: 'Blackmore’s Rain', tier: 'elite', hp: 56, xp: 22, money: [20, 30], title: 'He Followed You',
    passive: 'You skipped the storm over Kansas. The storm did not skip you. Soaks and stuns; only Spin reaches him in the rain.' });
  // Act III — Hot Pants, agent of the Vatican
  variant('hotpants_boss', 'hotpants_foe', { tier: 'boss', hp: 128, stats: { aim: 7, res: 7 }, xp: 60, money: [55, 80], title: 'Cream Starter — Agent of the Vatican',
    quote: 'The Saint belongs to God. You are only carrying Him.',
    passive: 'Sprays flesh to heal and to blind. Below 40% HP she seals her wounds behind a thick shield. Heavy hits beat her healing.',
    abilities: E.hotpants_foe.abilities.concat([{ name: 'Flesh Plug', w: 2, cd: 3, target: 'allEnemies', fx: 'spray', run: x => x.enemies.forEach(e => { x.dmg(e, 4, {}); x.status(e, 'blind', 0, 1); }) }]),
    hooks: { damaged: x => { if (!x.flag('hpSeal') && x.user.hp < x.user.maxHp * 0.4) { x.setFlag('hpSeal'); x.status(x.user, 'shield', 22); x.say(x.user, 'I will not be forgiven by losing to you.'); } } } });
  // Act IV — Tattoo You!, Wekapipo and Mike O. as act bosses (each can awaken Tusk ACT3)
  if (E.tattoo_boss) withTusk3(variant('tattoo_act', 'tattoo_boss', { title: 'The Eleven Men, as One — Act Boss' }));
  withTusk3(variant('wekapipo_boss', 'wekapipo_foe', { hp: 118, xp: 55 }));
  withTusk3(variant('mikeo_boss', 'mikeo', { tier: 'boss', hp: 132, stats: { aim: 7 }, xp: 66, money: [60, 90], title: 'Tubular Bells — Head of Presidential Security',
    quote: 'Every bullet you fire comes home to you as a balloon.',
    passive: 'Fills the room with balloon animals that burst into needles. Every 3rd round they all come home at once.',
    abilities: E.mikeo.abilities.concat([{ name: 'Menagerie', w: 1, cd: 4, target: 'self', fx: 'buff', cond: x => x.allies.length < 5, run: x => { x.summon('balloon'); x.summon('balloon'); x.summon('balloon'); } }]),
    hooks: { start: x => { x.summon('balloon'); x.summon('balloon'); }, roundStart: x => { if (x.round % 3 === 0) { x.enemies.forEach(e => x.status(e, 'bleed', 2)); x.log('Every balloon comes home at once.'); } } } }));
  // Act V — Valentine with every world at once, D-I-S-C-O's grid, and Lucy as the Saint's vessel
  withFinale(variant('valentine_d4c', 'valentine1', { hp: 175, xp: 110, money: [100, 130], title: 'D4C — Every World at Once',
    passive: 'D4C: copies from parallel worlds soak half the hits on him. Swaps with another Valentine the first time he falls. Kill the copies first.' }));
  variant('disco_boss', 'disco', { tier: 'boss', hp: 150, xp: 80, money: [80, 110], title: 'Chocolate Disco — The Grid of Philadelphia',
    passive: 'Every 2nd round he reappears behind the weakest rider and cuts them (cannot be dodged). Reflects when the grid is lit.',
    hooks: { roundStart: x => { if (x.round % 2 === 0) { const t = x.enemies.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]; if (t) { x.dmg(t, 8, {}, { noDodge: true, label: 'GRID' }); x.log('D-I-S-C-O steps out of the square behind the weakest rider.'); } } } } });
  E.saint_lucy = { name: 'Lucy Steel', title: 'The Saint’s Vessel — Ticket to Ride', art: port('saintlucy'), tier: 'boss', hp: 150, stats: { res: 8, luck: 8 }, xp: 85, money: [30, 50], dtype: 'holy',
    res: { holy: -0.5, stand: -0.2, spin: 0.15 }, stand: 'Ticket to Ride', sigil: 'heart', sigilColor: '#f6ecd8', quote: 'Johnny... it isn’t me moving. It’s the Saint.',
    passive: 'TICKET TO RIDE: the President’s guards shield her, and she heals every round while one of them stands. Misfortune bends toward whoever hurts her. Break the guards first.',
    abilities: [
      { name: 'Misfortune', w: 3, target: 'allEnemies', fx: 'debuff', run: x => x.enemies.forEach(e => { x.dmg(e, 3, {}, { dtype: 'holy' }); x.status(e, 'vuln', 0, 1); }) },
      { name: 'Thorned Halo', w: 3, target: 'enemy', fx: 'hit', run: x => { const r = x.dmg(x.target, 7, { res: 0.03 }, { dtype: 'holy' }); if (r.hit) x.status(x.target, 'bleed', 2); } },
      { name: 'The Saint Answers', w: 1, cd: 3, target: 'self', fx: 'heal', run: x => x.heal(x.user, 14, {}) },
    ],
    hooks: { start: x => { x.summon('vguard'); x.summon('vguard'); }, turnStart: x => { if (x.allies.some(a => a !== x.user)) x.heal(x.user, 6, {}); } } };
  SBR.DROPS.saint_lucy = [['sap', 1, 1, 2], ['gold', 1, 1, 1]];
  // Act VI — both of them at once
  withFinale(variant('valentine_last', 'valentine1', { hp: 185, stats: { aim: 9, grit: 8, res: 7 }, xp: 150, money: [120, 150], title: 'Blessed by the Whole Corpse',
    passive: 'D4C with the Corpse behind it: copies soak half his hits, and he swaps with another Valentine the first time he falls. Ball Breaker and Infinite Rotation are born in this fight if they have not been already.' }));
  variant('diego_parallel', 'diego_world', { hp: 165, xp: 110, title: 'Brought From Another World',
    passive: 'THE WORLD (a lesser copy): every 3rd round the party is frozen for a turn. Only one Diego can stop time in this world, and it isn’t him.',
    hooks: { roundStart: x => { if (x.round % 3 === 0) { x.enemies.forEach(e => x.status(e, 'stun', 0, 1)); x.say(x.user, 'THE WORLD! ...Or near enough.'); } } } });
})();

/* ================= Scenes: Acts I and II ================= */
(() => {
  const S = SBR.STORY, M = SBR.manga, { branch, conseq } = M;
  const scene = (id, o, C) => { S[id] = o; if (C) conseq(id, C); return o; };
  const hasGyro = g => M.inParty('gyro');

  /* ---------- tusk3 outside of Civil War ---------- */
  scene('tusk3_awaken', { bg: 4, lines: [
    { narr: 'Johnny is pinned. The nail won’t reach. Then he remembers what Gyro said: don’t fire with doubt in your heart.', mood: 'menace' },
    { who: 'johnny', text: 'The hole doesn’t have to go through them. It can go through ME.' },
    { narr: 'Johnny shoots his own shoulder and falls into the wormhole. STAND EVOLVED — TUSK ACT3. Johnny learns Wormhole.', mood: 'shout' },
  ] });

  /* ---------- Act I: Mrs. Robinson ---------- */
  branch('st_robinson', { foe: 'robinson',
    choices: [
      { label: 'Charge the swarm', ok: { text: 'Gyro spins a ball through the cloud. The insects part. Mrs. Robinson draws.', route: 'fight' } },
      { label: 'Burn the cactus garden first (AIM)', check: { stat: 'aim', dc: 12 }, ok: { text: 'One shot into the oil drum by the trail. The cacti go up like torches. Half his hive burns before he knows you are there.', route: 'burned', fx: g => g.flag('robinsonBurned') }, fail: { text: 'The fire catches the wind and comes your way. You fight him in the smoke. (Party loses 10% HP.)', route: 'fight', fx: g => g.hurtAll(0.1) } },
      { label: 'Cover your eyes and ride straight through (RIDING)', check: { stat: 'ride', dc: 13 }, ok: { text: 'Bandanas over your faces, heads down, horses at a gallop. The buzzing fades behind you. Mrs. Robinson is still out here, and he saw which way you went. (+6 pace.)', route: 'fled', fx: g => g.pace(6) }, fail: { text: 'An insect gets under Gyro’s eyelid. You have to stop, and he finds you.', route: 'fight' } },
      { label: 'Offer him a share of the prize ($40)', cost: { money: 40 }, ok: { text: 'He counts the money twice. "Smart. A racer who pays is worth more alive." He tells you who hired the Boomboom family: men with a white-house seal.', route: 'bribed' } },
    ],
    fights: { fight: { enemies: ['robinson'], elite: true }, burned: { enemies: ['robinson'], elite: true } },
    after: { fight: g => g.scene('robinson_fate'), burned: g => g.scene('robinson_fate') },
    conseq: [
      { rep: { racers: 1 }, deed: 'Charged Mrs. Robinson’s swarm head-on.' },
      { rep: { natives: -1 }, flag: 'robinsonBurned', deed: 'Burned Mrs. Robinson’s cactus garden to the ground.', fail: { deed: 'Set a desert fire that turned back on you.', rep: { natives: -1 } } },
      { rep: { racers: -1 }, npc: { robinson: 'hunting' }, deed: 'Rode blind through Mrs. Robinson’s garden.', later: ['robinson_ambush', 2, 5], fail: { deed: 'Tried to ride past Mrs. Robinson and failed.', rep: { racers: -1 } } },
      { rep: { law: -1, president: 1 }, npc: { robinson: 'paid' }, flag: 'presidentPlan', deed: 'Paid Mrs. Robinson to leave you alone.', later: ['robinson_returns', 6, 12] },
    ] });

  /* ---------- Act I: Mountain Tim (the recruit is now a choice) ---------- */
  S.st_tim.fx = g => g.achieve('tim');
  const notTimLead = g => SBR.run.lead !== 'mountaintim';
  S.st_tim.choices = [
    { label: 'Ride together, and watch each other’s backs', ok: { text: 'Tim listens. "I’ll keep one eye over my shoulder, then." He falls in beside you.', fx: g => g.recruit('mountaintim') } },
    { label: 'Ride together', ok: { text: '"A cowboy doesn’t need looking after." He tips his hat and falls in beside you.', fx: g => g.recruit('mountaintim') } },
    { label: 'Ask him to ride ahead and guard Lucy Steel', req: notTimLead, reqText: 'Tim is your lead', ok: { text: '"The organiser’s wife? Somebody should." He rides for Kansas City. You will see him there, and so will anyone who comes for her.', fx: g => g.flag('timGuardsLucy') } },
    { label: 'Part ways', req: notTimLead, reqText: 'Tim is your lead', ok: { text: 'He shrugs, coils his rope and rides off alone. Something about the way he looks back stays with you.', fx: g => g.flag('timAlone') } },
  ];
  S.st_tim.foe = 'tim';
  conseq('st_tim', [
    { rep: { law: 1 }, npc: { mountaintim: 'warned' }, deed: 'Warned Mountain Tim about the President’s men, and rode with him.' },
    { rep: { law: 1 }, npc: { mountaintim: 'friend' }, deed: 'Rode with Mountain Tim.' },
    { rep: { law: 2 }, npc: { mountaintim: 'warned', lucy: 'guarded' }, flag: 'timGuardsLucy', deed: 'Sent Mountain Tim to guard Lucy Steel in Kansas City.' },
    { rep: { law: -1 }, npc: { mountaintim: 'alone' }, flag: 'timAlone', deed: 'Let Mountain Tim ride on alone.', later: ['tim_alone', 4, 8] },
  ]);

  /* ---------- Act I: the Boomboom family as a beat ---------- */
  branch('st_boom', { foe: 'boom',
    choices: [
      { label: 'Stand and fight in the iron storm', ok: { text: 'Horseshoes and nails lift out of the sand around you.', route: 'fight' } },
      { label: 'Find the old man and shoot him first (AIM)', check: { stat: 'aim', dc: 14 }, ok: { text: 'Benjamin Boomboom goes down behind his dune before the magnet ever closes. His sons scream and come at you anyway.', route: 'snipe' }, fail: { text: 'Your shot is pulled sideways by the magnetism. They know where you are now.', route: 'fight' } },
      { label: 'Bury yourselves in the sand until the storm passes', ok: { text: 'You lie under your coats for six hours while iron hums overhead. By morning the Boomboom family has moved on. So has most of the race. (−8 pace.)', route: 'hide', fx: g => g.pace(-8) } },
    ],
    fights: { fight: { enemies: ['benjamin', 'andre', 'laboom'], elite: true, midRound: { 2: 'tusk_awaken' } }, snipe: { enemies: ['andre', 'laboom'], elite: true, midRound: { 2: 'tusk_awaken' } } },
    after: { fight: g => g.scene('boom_post'), snipe: g => g.scene('boom_post') },
    conseq: [
      { rep: { racers: 1 }, deed: 'Stood in the Boomboom family’s iron storm.' },
      { rep: { law: 1 }, npc: { boomboom: 'orphaned' }, deed: 'Shot Benjamin Boomboom before his magnet closed.', fail: { deed: 'Missed Benjamin Boomboom in the sandstorm.', rep: { racers: 1 } } },
      { npc: { boomboom: 'fled' }, deed: 'Hid under the sand from the Boomboom family.', later: ['boom_return', 5, 10] },
    ] });

  /* ---------- Act I/II: optional manga beats ---------- */
  scene('st_marco', { card: { title: 'The Boy in Naples', blurb: 'Gyro is writing a letter he won’t send.', icon: 'book' }, bg: 1, when: hasGyro, lines: [
    { narr: 'By the fire, Gyro is writing in a small hand. He covers the page when Johnny looks.' },
    { who: 'gyro', text: 'A boy called Marco. Nine years old. He was sentenced to die for a crime a nobleman’s son committed.' },
    { who: 'gyro', text: 'The Zeppeli family carries out the King’s sentences. My father. His father. Me. We are not allowed to care who is on the block.' },
    { who: 'gyro', text: 'If I win, the King grants an amnesty to one prisoner. I told nobody. Now I told you. Don’t make that face.' },
  ], choices: [
    { label: 'Tell him Marco is worth the whole race', ok: { text: 'Gyro looks at the fire for a long time. "Then we’d better win it." (Gyro +1 RESOLVE.)', fx: g => g.statUp('gyro', 'res', 1) } },
    { label: 'Tell him kings never keep promises', ok: { text: '"Then I’ll make him keep this one." Something hardens in him. (Gyro +1 SPIN.)', fx: g => g.statUp('gyro', 'spin', 1) } },
    { label: 'Ask about his father', ok: { text: 'Gregorio Zeppeli. A physician who kills by law, and hands his son the ball. "He taught me a man must not feel for the condemned. He was wrong about that. Maybe about more." (+20 XP.)', fx: g => g.xp(20) } },
  ] }, [
    { rep: { naples: 2 }, flag: 'marcoStory', deed: 'Told Gyro that Marco was worth the whole race.' },
    { rep: { naples: -1 }, flag: 'gyroDefiant', deed: 'Told Gyro kings never keep their promises.' },
    { rep: { naples: 1 }, flag: 'zeppeliLaw', deed: 'Heard about Gregorio Zeppeli, the executioner physician.', later: ['gregorio_letter', 6, 12] },
  ]);
  scene('st_poco', { card: { title: 'Hey Ya! Lucky Day', blurb: 'A racer who is never wrong about luck.', icon: 'star' }, bg: 1, lines: [
    { narr: 'A rider from Georgia, grinning, keeps pace with you. A tiny Stand on his shoulder shouts in his ear.' },
    { who: 'pocoloco', text: 'Hey Ya says today’s my lucky day! He says the lucky thing is to ride with you for a bit. So, hello!' },
    { who: 'gyro', text: 'He’s either the luckiest man alive or the stupidest. Could be both.' },
  ], choices: [
    { label: 'Follow wherever his luck points', ok: { text: 'He takes a left nobody else takes. There is a spring there, and nobody else. (Party +1 LUCK.)', fx: g => g.statUpAll('luck', 1) } },
    { label: 'Ask him to ride with you', ok: { text: '"Hey Ya says yes! Hey Ya says also: pack sandwiches." Pocoloco joins you.', fx: g => g.recruit('pocoloco') } },
    { label: 'Bet him he’s not that lucky (LUCK)', check: { stat: 'luck', dc: 15 }, ok: { text: 'Somehow you win. Hey Ya looks personally offended. (+$80.)', fx: g => g.money(80) }, fail: { text: 'Of course you lose. Hey Ya dances. (−$30.)', fx: g => g.money(-30) } },
  ] }, [
    { rep: { racers: 1 }, npc: { pocoloco: 'friend' }, deed: 'Followed Pocoloco’s luck.' },
    { rep: { racers: 1 }, npc: { pocoloco: 'ally' }, deed: 'Invited Pocoloco to ride with you.' },
    { npc: { pocoloco: 'rival' }, deed: 'Out-bet Pocoloco’s luck.', fail: { npc: { pocoloco: 'rival' }, deed: 'Bet against Pocoloco’s luck, and lost.' } },
  ]);
  scene('st_sandrun', { card: { title: 'The Runner Who Beat the Horses', blurb: 'A barefoot man is ahead of the entire race.', icon: 'horseshoe' }, bg: 1, lines: [
    { narr: 'On the flats, a man on foot passes a thousand horses. He runs like water running downhill.' },
    { who: 'sandman', text: 'My people’s land is being sold by the acre. The prize buys it back. I am not racing you. I am racing the men who sell it.' },
    { who: 'johnny', text: 'Nobody runs that far.' }, { who: 'sandman', text: 'Then watch.' },
  ], choices: [
    { label: 'Share your water with him', ok: { text: 'He drinks, nods once, and is gone. You feel you will meet him again, and that it matters how. (+10 XP.)', fx: g => g.xp(10) } },
    { label: 'Race him to the ridge (RIDING)', check: { stat: 'ride', dc: 15 }, ok: { text: 'Slow Dancer beats him by a nose. He laughs out loud. (+12 pace.)', fx: g => g.pace(12) }, fail: { text: 'He wins. On foot. (−5 pace.)', fx: g => g.pace(-5) } },
    { label: 'Report him: runners on foot aren’t in the rules', ok: { text: 'The officials write him up. He looks at you once, and his eyes say he is writing you up too. (+$30 finder’s fee.)', fx: g => g.money(30) } },
  ] }, [
    { rep: { natives: 2 }, npc: { sandman: 'friend' }, deed: 'Shared your water with Sandman on the flats.' },
    { rep: { natives: 1, racers: 1 }, deed: 'Raced Sandman to the ridge and won.', fail: { rep: { natives: 1 }, deed: 'Lost a race to Sandman, on foot.' } },
    { rep: { natives: -3, law: 1 }, npc: { sandman: 'enemy' }, flag: 'sandmanGrudge', deed: 'Reported Sandman to the race officials.' },
  ]);
  scene('st_steel', { card: { title: 'The Organiser’s Wife', blurb: 'Lucy Steel is fourteen. Her husband is fifty.', icon: 'flag' }, bg: 1, lines: [
    { narr: 'Behind the press tent, Steven Steel is teaching a girl to read a race map. His wife.' },
    { who: 'lucy', text: 'Everyone stares. Steven found me when men were going to sell me. He married me so no one could. He has never once asked me for anything.' },
    { who: 'steven', text: 'The race is a crazy idea. I know. But crazy ideas are how a man keeps his promises in this country.' },
  ], choices: [
    { label: 'Promise Lucy you’ll look out for her', ok: { text: 'She doesn’t laugh. "I’ll hold you to it." (+10 XP.)', fx: g => g.xp(10) } },
    { label: 'Sell the story to a reporter', ok: { text: '"THE CHILD BRIDE OF THE STEEL BALL RUN." Fifty dollars. Steven sees the paper the next morning. (+$50.)', fx: g => g.money(50) } },
    { label: 'Warn Steven that Washington is watching his race', ok: { text: 'Steven goes pale, then very calm. "Then we will give them a good race to watch." (+2 pace.)', fx: g => g.pace(2) } },
  ] }, [
    { npc: { lucy: 'friend' }, flag: 'lucyPromise', deed: 'Promised Lucy Steel you would look out for her.' },
    { rep: { racers: -1, law: -1 }, npc: { steven: 'wary' }, deed: 'Sold Lucy Steel’s story to the newspapers.' },
    { rep: { president: -1 }, npc: { steven: 'friend' }, flag: 'stevenWarned', deed: 'Warned Steven Steel that Washington was watching.' },
  ]);

  /* ---------- Act I: boss pre/post for new variants ---------- */
  scene('pph1_pre', { bg: 1, lines: [
    { narr: 'A narrow canyon at dusk. Fishing line glints between every pair of rocks, strung like a harp.', mood: 'menace' },
    { who: 'porkpie', text: 'Heheh! The President pays by the pound, and you boys are heavy with whatever’s in your saddlebags!' },
    { who: 'gyro', text: 'Hooks. Hundreds of them. Johnny, do NOT reach for your reins.' },
  ] });
  scene('pph1_post', { bg: 1, lines: [
    { narr: 'The wire goes slack. The hat kid is hanging upside down from his own line, crying.' },
    { who: 'johnny', text: 'When he pulled me in... my fingernails spun. Something is standing next to me, Gyro.' },
  ], fx: g => g.flag('tusk1'), choices: [
    { label: 'Make him talk', ok: { text: 'He talks: the President hires Stand users from every state. You get a list of names, and a very frightened fisherman.', fx: g => g.xp(10) } },
    { label: 'Cut him down and let him go', ok: { text: 'He runs. He will tell everyone you were kind, or that you were soft.', fx: g => g.pace(2) } },
    { label: 'Leave him hanging', ok: { text: 'The wire hums in the wind behind you for a mile.', fx: g => g.threat(0.5) } },
  ] }, [
    { rep: { president: -1 }, flag: 'agentOrders', deed: 'Made the Pork Pie Hat Kid give up the President’s list.' },
    { rep: { racers: 1 }, npc: { porkpie: 'spared' }, deed: 'Cut the Pork Pie Hat Kid down and let him go.' },
    { rep: { law: -1 }, npc: { porkpie: 'dead' }, deed: 'Left the Pork Pie Hat Kid hanging in his own wire.' },
  ]);
  scene('oye1_pre', { bg: 1, lines: [
    { narr: 'The relay station at the edge of the desert. Every water barrel, every harness buckle, every coin in the till has a pin in it.', mood: 'menace' },
    { who: 'oyecomova', text: 'Zeppeli. I crossed an ocean to find you. The crown’s dog dies in the desert, where no one will sing for him.' },
    { who: 'gyro', text: 'He came all the way from Naples. That means someone paid for his ticket.' },
  ] });
  scene('oye1_post', { bg: 1, lines: [
    { narr: 'Oyecomova is on his knees, pins scattered in the dust. The station is still standing, barely.' },
    { who: 'johnny', text: 'When the blast hit, my nails SPUN. I didn’t even think. Something moved for me.' },
    { who: 'oyecomova', text: 'Well, Zeppeli? Carry out the sentence. It is what your family does.' },
  ], fx: g => g.flag('tusk1'), choices: [
    { label: 'Hand him to the Naples consul', ok: { text: 'Gyro binds his hands. "The King can judge you. I won’t."', fx: g => g.money(30) } },
    { label: 'Carry out the sentence', ok: { text: 'Gyro does his family’s duty. He does not speak for the rest of the day.', fx: g => g.xp(20) } },
    { label: 'Let him go home', ok: { text: '"Naples needs builders more than bombers." Oyecomova walks away without looking back.', fx: g => g.pace(2) } },
  ] }, [
    { rep: { naples: 2, law: 1 }, npc: { oyecomova: 'jailed' }, deed: 'Handed Oyecomova to the consul of Naples.', later: ['oye_debt', 10, 18] },
    { rep: { naples: -1 }, npc: { oyecomova: 'dead' }, deed: 'Gyro executed Oyecomova in the desert.', later: ['bomber', 8, 14] },
    { rep: { naples: 1, law: -1 }, npc: { oyecomova: 'freed' }, deed: 'Let Oyecomova go home.', later: ['oye_debt', 8, 14] },
  ]);

  /* ---------- Act II beats ---------- */
  branch('st_oyecomova', { foe: 'oyecomova',
    choices: [
      { label: 'Fight him before he pins anything else', ok: { text: 'Every step is a note. You make it a short song.', route: 'fight' } },
      { label: 'Pull the pins out of the village first (SPIN)', check: { stat: 'spin', dc: 13 }, ok: { text: 'Gyro’s ball ricochets off twenty doorknobs, popping a pin out of each one. Oyecomova has to fight you with nothing primed.', route: 'defused', fx: g => g.flag('oyeDefused') }, fail: { text: 'A pin you missed goes off under your boot. (Party loses 12 HP.)', route: 'fight', fx: g => g.hurtAllFlat(12) } },
      { label: 'Let Gyro speak to him about Naples', req: g => SBR.campaign.repOf('naples') >= 1 || !!SBR.run.flags.marcoStory, reqText: 'Needs Naples’ favour', ok: { text: 'They argue in Neapolitan for an hour. When it’s done, Oyecomova pulls the pins out himself. "You are not your father, Zeppeli. That will have to be enough."', route: 'talked' } },
      { label: 'Ride around the village', ok: { text: 'The long way. Behind you, you hear the church bell go off like a cannon. (−6 pace.)', route: 'fled', fx: g => g.pace(-6) } },
    ],
    fights: { fight: { enemies: ['oyecomova'], elite: true }, defused: { enemies: ['oyecomova'], elite: true } },
    after: { fight: g => g.scene('oye_fate'), defused: g => g.scene('oye_fate') },
    conseq: [
      { rep: { naples: 1 }, deed: 'Fought Oyecomova in the pinned village.' },
      { rep: { law: 1, naples: 1 }, flag: 'oyeDefused', deed: 'Pulled every pin out of Oyecomova’s village.', fail: { deed: 'Stepped on one of Oyecomova’s pins.', rep: { naples: 1 } } },
      { rep: { naples: 2 }, npc: { oyecomova: 'spared' }, deed: 'Gyro talked Oyecomova down in Neapolitan.', later: ['oye_debt', 8, 14] },
      { rep: { law: -1 }, npc: { oyecomova: 'free' }, deed: 'Rode around Oyecomova’s village and let it burn.', later: ['oye_bomb', 3, 7] },
    ] });
  branch('st_zombiehorse', { fx: null,
    choices: [
      { label: 'Thread everyone’s wounds', ok: { text: 'It stings like the devil. Every cut on the party knits shut. You keep a length of the thread.', route: 'heal', fx: g => { g.healAll(1); g.relic('zombiehorse'); } } },
      { label: 'Harvest the whole cliff to sell', ok: { text: 'You strip the cliff bare. A trader in the next town pays well, and asks where you found it. (+$90.)', route: 'sell', fx: g => g.money(90) } },
      { label: 'Leave it for the racers behind you', ok: { text: 'You mark the cliff with a ribbon so the next riders find it. (Party heals 40%.)', route: 'leave', fx: g => g.healAll(0.4) } },
    ],
    conseq: [
      { rep: { naples: 1 }, deed: 'Threaded the Zombie Horse through your wounds.' },
      { rep: { natives: -2 }, deed: 'Stripped the Zombie Horse cliff bare and sold it.' },
      { rep: { racers: 2 }, deed: 'Marked the Zombie Horse cliff for the racers behind you.', later: ['thread_thanks', 4, 9] },
    ] });
  branch('st_leftarm', { foe: 'stroheim',
    choices: [
      { label: 'Fight the German', ok: { text: 'He shouts about German science the entire time.', route: 'fight' } },
      { label: 'Bribe him to go away ($40)', cost: { money: 40 }, ok: { text: '"German precision has a price, ja." He leaves with your money. In the quiet, Johnny notices his arm.', route: 'bribe' } },
      { label: 'Let him take the strange arm from the rocks', ok: { text: 'Stroheim carries a mummified arm away in a crate, laughing. Gyro watches it go. "That was holy, Johnny. We just handed a saint to a soldier."', route: 'lost' } },
    ],
    fights: { fight: { enemies: ['stroheim'], elite: true } },
    after: { fight: g => { g.relic('c_leftarm'); g.maxHp('johnny', 12); }, bribe: g => { g.relic('c_leftarm'); g.maxHp('johnny', 12); } },
    conseq: [
      { rep: { president: -1 }, deed: 'Fought Stroheim for the Left Arm.' },
      { rep: { law: -1 }, deed: 'Bribed Stroheim, and kept the Left Arm.' },
      { rep: { vatican: -2, president: 1 }, flag: 'leftArmLost', deed: 'Let Stroheim carry the Saint’s Left Arm away.', later: ['leftarm_hunt', 3, 8] },
    ] });
  branch('st_porkpie', { foe: 'porkpie',
    choices: [
      { label: 'Cut Gyro free and fight', ok: { text: 'Hooks in the rock, hooks in the air.', route: 'fight' } },
      { label: 'Burn the lines with a steel ball (SPIN)', check: { stat: 'spin', dc: 13 }, ok: { text: 'The ball runs along the wire like a bead and saws it through. The kid has no line left to reel.', route: 'cut', fx: g => g.flag('porkpieCut') }, fail: { text: 'The wire snaps back across Gyro’s face. (Gyro loses 20% HP.)', route: 'fight', fx: g => g.hurt('gyro', 0.2) } },
      { label: 'Let him reel Gyro in, then grab the line (GRIT)', check: { stat: 'grit', dc: 13 }, ok: { text: 'He pulls, you pull harder. The hat kid is yanked out from behind his boulder and lands at your feet.', route: 'caught' }, fail: { text: 'He reels you both in. It hurts. (Party loses 15% HP.)', route: 'fight', fx: g => g.hurtAll(0.15) } },
    ],
    fights: { fight: { enemies: ['porkpie'], elite: true }, cut: { enemies: ['porkpie'], elite: true } },
    after: { fight: g => g.scene('porkpie_fate'), cut: g => g.scene('porkpie_fate'), caught: g => g.scene('porkpie_fate') },
    conseq: [
      { rep: { racers: 1 }, deed: 'Fought the Pork Pie Hat Kid in the rocks.' },
      { rep: { naples: 1 }, flag: 'porkpieCut', deed: 'Sawed through the Pork Pie Hat Kid’s lines with a steel ball.', fail: { deed: 'Got whipped by the Pork Pie Hat Kid’s wire.', rep: { racers: 1 } } },
      { rep: { law: 1 }, deed: 'Pulled the Pork Pie Hat Kid out of the rocks by his own line.', fail: { deed: 'Got reeled in by the Pork Pie Hat Kid.', rep: { racers: 1 } } },
    ] });
  branch('st_ferdinand', { foe: 'ferdinand',
    choices: [
      { label: 'Fight for the Saint’s Eyes', ok: { text: 'Scales creep up Gyro’s wrist. There is no time.', route: 'fight' } },
      { label: 'Salt the village well first ($15)', cost: { money: 15 }, ok: { text: 'The villagers’ scales stop spreading. Ferdinand’s fossils will crack more easily now.', route: 'fight', fx: g => g.flag('ferdWeakness') } },
      { label: 'Let Diego have the Eyes and get Gyro out', ok: { text: 'You drag Gyro down the mountain as the scales recede. Behind you, Diego walks out of the smoke with both of the Saint’s Eyes. (Party heals 50%.)', route: 'yield', fx: g => g.healAll(0.5) } },
    ],
    fights: { fight: { enemies: ['ferdinand'], boss: true } },
    after: { fight: g => g.scene('ferd_post') },
    conseq: [
      { rep: { natives: 1 }, deed: 'Fought Dr. Ferdinand in the extinct village.' },
      { rep: { natives: 1, law: 1 }, flag: 'ferdWeakness', deed: 'Salted the dinosaur village’s well before the fight.' },
      { rep: { president: 1, vatican: -1 }, npc: { diego: 'rival' }, flag: 'diegoEyes', deed: 'Left the Saint’s Eyes to Diego Brando.' },
    ] });

  /* ---------- Act II optional beats ---------- */
  scene('st_diego_mother', { card: { title: 'Dio’s Mother', blurb: 'Diego is standing at a grave nobody tends.', icon: 'skull' }, bg: 2, lines: [
    { narr: 'In a mining town, Diego Brando stands at a pauper’s grave with his hat in his hands. He doesn’t hear you ride up.' },
    { who: 'diego', text: 'She worked in the fields until her hands bled so I could eat. One day a rich man threw a coin in the mud for her to pick up. She picked it up.' },
    { who: 'diego', text: 'I will never bend down for a coin. I will take the whole purse. The whole country, if I must.' },
  ], choices: [
    { label: 'Tell him she’d be proud of him', ok: { text: 'He laughs, ugly and short. "She would be ashamed of me. That’s why I don’t stop." But he remembers you said it. (+15 XP.)', fx: g => g.xp(15) } },
    { label: 'Tell him he’s still picking coins out of the mud', ok: { text: 'His eyes go reptile-slit for a moment. "Say that on the track, Joestar." (+3 pace.)', fx: g => g.pace(3) } },
    { label: 'Offer him a deal: help each other against the President', ok: { text: '"...Maybe. When it suits me." He puts his hat back on. It’s not a no. (+10 XP.)', fx: g => g.xp(10) } },
  ] }, [
    { rep: { racers: 1 }, npc: { diego: 'wary' }, flag: 'diegoPitied', deed: 'Found Diego Brando at his mother’s grave, and spoke kindly.' },
    { rep: { racers: -1 }, npc: { diego: 'enemy' }, flag: 'diegoGrudge', deed: 'Mocked Diego Brando at his mother’s grave.' },
    { rep: { president: -1 }, npc: { diego: 'deal' }, flag: 'diegoDeal', deed: 'Offered Diego Brando a deal against the President.' },
  ]);
  scene('st_nicholas', { card: { title: 'Nicholas and the White Mouse', blurb: 'Johnny won’t say why he hates mice.', icon: 'skull' }, bg: 2, when: g => M.inParty('johnny'), lines: [
    { narr: 'A white mouse runs across the camp. Johnny goes grey.' },
    { who: 'johnny', text: 'My brother Nicholas was the best jockey in Kentucky. I had a white mouse. I let it out. His horse saw it and threw him.' },
    { who: 'johnny', text: 'At the funeral my father said God took the wrong son. He was probably right.' },
    { who: 'gyro', text: '...' },
  ], choices: [
    { label: 'Let Johnny say it all, out loud', ok: { text: 'He talks until the fire burns down. Something that was locked comes open. (Johnny +1 RESOLVE.)', fx: g => g.statUp('johnny', 'res', 1) } },
    { label: 'Tell him to bury it and ride', ok: { text: 'He nods and wipes his face and rides harder the next day. It is still down there. (Johnny +1 AIM.)', fx: g => g.statUp('johnny', 'aim', 1) } },
    { label: 'Ask Gyro to sing the cheese song', ok: { text: 'Gyro sings. It is terrible. Johnny laughs for the first time in two stages. (Party heals 30%.)', fx: g => g.healAll(0.3) } },
  ] }, [
    { rep: { racers: 1 }, flag: 'facedGuilt', deed: 'Heard Johnny tell the story of Nicholas.' },
    { flag: 'buriedGuilt', deed: 'Told Johnny to bury Nicholas and ride.' },
    { rep: { naples: 1 }, deed: 'Gyro sang the cheese song to cheer Johnny up.' },
  ]);

  /* ---------- Act II: Diego and the hat kid as act bosses ---------- */
  scene('diego2_pre', { bg: 2, lines: [
    { narr: 'The top of the pass. Snow, thin air, and a racer waiting on the road with the patience of a predator.', mood: 'menace' },
    { who: 'diegodino', text: 'Ferdinand was a fool. He gave me his Stand and thought I’d serve him. I only serve the finish line.' },
    { who: 'diegodino', text: 'The Eye, Joestar. Give it to me, or I’ll take it out of your saddlebag with my teeth.' },
  ] });
  scene('diego2_post', { bg: 2, lines: [
    { narr: 'Diego staggers back, half-lizard, bleeding from a nail wound. Silver Bullet rears.' },
    { who: 'diegodino', text: 'This isn’t the end of the race. It’s barely the start.' },
  ], choices: [
    { label: 'Take the Saint’s Eye from his saddlebag', ok: { text: 'You tear it out of the bag as he flees. Gyro presses it to his own eye and sees through stone.', fx: g => { g.relic('c_eyes'); g.flag('eyes'); } } },
    { label: 'Let him go. It’s a race, not a war.', ok: { text: 'He looks back once, surprised. "You’ll regret being fair." (+20 XP.)', fx: g => g.xp(20) } },
  ] }, [
    { rep: { president: -1 }, npc: { diego: 'enemy' }, deed: 'Tore the Saint’s Eye out of Diego Brando’s saddlebag.' },
    { rep: { racers: 2 }, npc: { diego: 'respect' }, flag: 'diegoRespect', deed: 'Let Diego Brando ride away from the pass.' },
  ]);
  scene('pph2_pre', { bg: 2, lines: [
    { narr: 'A gorge in the Rockies. Every ledge is strung with fishing line. Something heavy has been hauled up to the top.', mood: 'menace' },
    { who: 'porkpie', text: 'I got the whole gorge wired this time! You come up, you come up on MY line!' },
    { who: 'gyro', text: 'The hat kid again. He must be getting paid very well.' },
  ] });
  scene('pph2_post', { bg: 2, lines: [
    { narr: 'The last line snaps. The Pork Pie Hat Kid slides down a rope into the river and floats away, still swearing.' },
    { who: 'johnny', text: 'Tusk... it whispered again. Move your legs, it said.' },
  ] });
})();

/* ================= Scenes: Acts III and IV ================= */
(() => {
  const S = SBR.STORY, M = SBR.manga, { branch, conseq } = M;
  const scene = (id, o, C) => { S[id] = o; if (C) conseq(id, C); return o; };
  const F = () => SBR.run.flags;
  const hpAround = () => M.inParty('hotpants') || SBR.run.lead === 'hotpants';
  /** Gyro teaches the Golden Rectangle before whichever Act III boss you meet */
  const GOLDEN = [
    { who: 'gyro', text: 'Johnny. Before this. The Golden Rectangle: a ratio in leaves, in shells, in a horse’s stride. Draw the spin along it and the rotation never ends.' },
    { narr: 'GOLDEN RECTANGLE LEARNED — Gyro gains GOLDEN SPIN.', mood: 'shout' },
  ];
  const learnGolden = g => { g.flag('golden'); g.achieve('golden'); };

  /* ---------- Hot Pants: a fourth way to meet her ---------- */
  S.st_hotpants.choices.push({ label: 'Leave her with her cow', ok: { text: 'You ride off while she is still shouting. She watches you go, very still, the way a hawk watches a field.', fx: g => g.pace(3) } });
  conseq('st_hotpants', [null, null, null, { rep: { vatican: -1 }, npc: { hotpants: 'rival' }, flag: 'hpRival', deed: 'Left Hot Pants standing over her dead cow.', later: ['hp_steals', 3, 7] }]);

  /* ---------- Ringo Roadagain ---------- */
  const ringoWin = g => { g.flag('ringoDead'); g.say('ringo', 'You have walked the path of the Man’s World. Go on... the way is open.'); };
  branch('st_ringo', { foe: 'ringo',
    choices: [
      { label: 'Let Gyro duel him alone', ok: { text: 'Gyro steps off his horse. "If I can’t win this with my own will, I don’t deserve the race."', route: 'duel' } },
      { label: 'Face him together', ok: { text: '"Two against one," Ringo says. "Then neither of you walks the Man’s World. A pity."', route: 'together' } },
      { label: 'Burn the cabin and ride out of the loop (RIDING)', check: { stat: 'ride', dc: 14 }, ok: { text: 'Smoke, a gallop, and the trail finally goes somewhere else. Ringo’s voice follows you: "The inferior always run." (+4 pace.)', route: 'fled', fx: g => g.pace(4) }, fail: { text: 'You gallop for a mile and come out on his porch again.', route: 'duel' } },
      { label: 'Ask him what the Man’s World is (RESOLVE)', check: { stat: 'res', dc: 14 }, ok: { text: 'He tells you, and he means it: a place where a man tests his will without excuses. You understand him. That will matter in six seconds.', route: 'duel', fx: g => g.flag('ringoLesson') }, fail: { text: '"You would not understand." He draws.', route: 'duel' } },
    ],
    fights: { duel: { enemies: ['ringo'], boss: true }, together: { enemies: ['ringo'], boss: true } },
    after: { duel: g => { ringoWin(g); g.statUp('gyro', 'res', 1); }, together: ringoWin },
    conseq: [
      { rep: { naples: 1 }, flag: 'manWorld', deed: 'Let Gyro walk the Man’s World alone against Ringo Roadagain.' },
      { rep: { racers: 1 }, deed: 'Faced Ringo Roadagain together.' },
      { rep: { naples: -1 }, flag: 'ringoAvoided', deed: 'Burned Ringo Roadagain’s cabin and escaped his loop.', later: ['ringo_loop', 2, 5], fail: { deed: 'Tried to escape Ringo’s loop and failed.', rep: { racers: 1 } } },
      { rep: { naples: 1 }, flag: 'ringoLesson', deed: 'Asked Ringo Roadagain what the Man’s World means.', fail: { deed: 'Ringo Roadagain would not explain himself.', rep: { racers: 1 } } },
    ] });

  /* ---------- Blackmore, Mountain Tim and Lucy ---------- */
  const timFate = S.st_blackmore.fx; // campaign.js: Tim lives if warned, dies otherwise
  const blackFx = g => {
    const f = F();
    if (f.timGuardsLucy) g.flag('timWarned');
    timFate(g);
    if (f.timGuardsLucy && SBR.run.lead !== 'mountaintim') g.recruit('mountaintim');
  };
  S.st_blackmore.variants = () => (SBR.run.flags.lucyCaptured ? [
    { narr: 'News by telegraph: Mountain Tim was found dead in a Kansas City street. The girl he died for was carried off in a closed carriage.' },
    { who: 'blackmore', text: 'Sumimasen. You are looking for Mrs. Steel. She is in my carriage, and the rain is on my side.' },
    { who: 'gyro', text: 'The raindrops are frozen in place. A steel ball could evaporate a path to her...' },
  ] : (SBR.run.flags.timGuardsLucy ? [
    { narr: 'Kansas City. Mountain Tim stands in a doorway with a girl behind him and three dead agents in the street.' },
    { who: 'mountaintim', text: 'You sent me, and I came. But the one in the rain is still coming, and bullets go around him.' },
    { who: 'blackmore', text: 'Sumimasen, cowboy. The rain has been following her all night.' },
  ] : null));
  branch('st_blackmore', { foe: 'blackmore', fx: blackFx,
    choices: [
      { label: 'Evaporate a path through the rain', ok: { text: 'Gyro’s ball screams through the frozen drops, boiling a tunnel through the storm.', route: 'fight' } },
      { label: 'Hand Blackmore a fake Spine (LUCK)', check: { stat: 'luck', dc: 14 }, ok: { text: 'A bundle of cow bones in Lucy’s shawl. Blackmore bows, takes it, and walks into the rain. He will find out. Not today.', route: 'fooled' }, fail: { text: 'He unwraps it on the spot. "Sumimasen. That was rude." The rain hardens.', route: 'fight' } },
      { label: 'Let him take Lucy, and the Spine with her', ok: { text: 'You step aside. Blackmore bows deeply. The next morning there is an envelope in your saddlebag with the President’s seal. (+$100.)', route: 'yield', fx: g => g.money(100) } },
    ],
    fights: { fight: { enemies: ['blackmore'], boss: true } },
    after: {
      fight: g => { g.relic('c_spine'); M.unflag('lucyCaptured'); g.npc('lucy', 'friend'); g.say('lucy', 'The Spine shows where the other parts are... Please. Take it. I’ll find a way to help from inside.'); },
      fooled: g => { g.relic('c_spine'); M.unflag('lucyCaptured'); g.npc('lucy', 'friend'); },
      yield: g => g.flag('lucyCaptured'),
    },
    conseq: [
      { rep: { president: -1 }, deed: 'Fought Blackmore in the frozen rain over Kansas.' },
      { rep: { president: -1, racers: 1 }, flag: 'blackmoreFooled', deed: 'Fooled Blackmore with a bundle of cow bones.', later: ['blackmore_returns', 3, 7], fail: { deed: 'Tried to fool Blackmore, and he noticed.', rep: { president: -1 } } },
      { rep: { president: 2, law: -2, vatican: -2 }, npc: { lucy: 'betrayed' }, flag: 'lucyCaptured', deed: 'Stood aside while Blackmore took Lucy Steel to the President.', later: ['lucy_letter', 6, 12] },
    ] });

  /* ---------- Sandman as a beat ---------- */
  branch('st_sandman', { foe: 'sandman',
    choices: [
      { label: 'Fight him in the singing cottage', ok: { text: 'Every sound cuts.', route: 'fight' } },
      { label: 'Offer his people the prize money', req: g => SBR.campaign.repOf('natives') >= 1 || SBR.campaign.npcIs('sandman', 'friend'), reqText: 'Needs his people’s trust', ok: { text: 'Sandman listens with his spear lowered. "Then run your race. I will run mine." He is gone before the water settles.', route: 'parley' } },
      { label: 'Plug your ears and cross the river (GRIT)', check: { stat: 'grit', dc: 15 }, ok: { text: 'Wax in your ears, water to your chest. The words on the walls shout at nothing. He will be ahead of you now.', route: 'fled' }, fail: { text: 'A word stamps itself on your coat. DOGOOON. You have to fight.', route: 'fight' } },
    ],
    fights: { fight: { enemies: ['sandman'], boss: true } },
    after: { fight: g => g.scene('sand_post'), parley: g => g.scene('sand_post') },
    conseq: [
      { rep: { natives: -1 }, deed: 'Fought Sandman in the singing cottage.' },
      { rep: { natives: 3 }, npc: { sandman: 'friend' }, flag: 'sandParley', deed: 'Promised Sandman’s people the prize money.' },
      { rep: { natives: 1 }, flag: 'sandmanAhead', deed: 'Crossed the river past Sandman with wax in your ears.', later: ['sandman_hunt', 3, 7], fail: { deed: 'Sandman stamped a word on your coat.', rep: { natives: -1 } } },
    ] });
  // Sandman's aftermath if Hot Pants never rode with you
  S.sand_post.variants = () => (!hpAround() ? [
    { narr: 'Sandman falls into the river.' },
    { narr: 'That night a rider in a nun’s habit crosses your camp without waking the horses. In the morning the Corpse Parts are gone.', mood: 'menace' },
    { who: 'gyro', text: 'The Vatican. That racer with the dead cow was one of theirs. We should have listened to her.' },
  ] : null);

  /* ---------- Act III optional beats ---------- */
  scene('st_lucy_secret', { card: { title: 'Lucy’s Secret', blurb: 'The organiser’s wife is copying letters in a hotel.', icon: 'book' }, bg: 3, when: g => !SBR.run.flags.lucyCaptured, lines: [
    { narr: 'A Kansas City hotel. Lucy Steel is at a writing desk in the dark, copying a telegram by candlelight.' },
    { who: 'lucy', text: 'The President’s agents send reports through this hotel. If I read them, I can warn you. If they catch me, they will kill Steven.' },
    { who: 'lucy', text: 'Everyone thinks I’m a child. That’s why nobody watches me.' },
  ], choices: [
    { label: 'Help her read the reports', ok: { text: 'You keep watch. She copies three pages of names and routes. (+15 XP.)', fx: g => g.xp(15) } },
    { label: 'Tell her to go home to Steven', ok: { text: '"He’s the one who told me to be brave." But she goes. (Lucy will be safer, for now.)', fx: g => g.pace(2) } },
    { label: 'Report her to the hotel manager for the reward', ok: { text: 'Forty dollars and a handshake. You see her face through the window as they take her away. (+$40.)', fx: g => g.money(40) } },
  ] }, [
    { rep: { president: -1 }, npc: { lucy: 'friend' }, flag: 'lucySpy', deed: 'Kept watch while Lucy Steel read the President’s reports.' },
    { npc: { lucy: 'safe' }, flag: 'lucySafe', deed: 'Sent Lucy Steel home to her husband.' },
    { rep: { president: 2, law: -1, racers: -1 }, npc: { lucy: 'betrayed' }, flag: 'lucyCaptured', deed: 'Sold Lucy Steel to the hotel manager.', later: ['lucy_letter', 6, 12] },
  ]);
  scene('st_golden', { card: { title: 'Lessons of the Golden Rectangle', blurb: 'Gyro draws in the dirt with a stick.', icon: 'star' }, bg: 3, when: g => M.inParty('gyro'), lines: [
    { narr: 'Gyro draws rectangles inside rectangles in the dirt. Then a spiral through all of them.' },
    { who: 'gyro', text: 'Nature does it without thinking. A leaf. A shell. The way a horse puts down its feet. Rotation that follows this line doesn’t stop.' },
    { who: 'johnny', text: 'And if it doesn’t stop...?' }, { who: 'gyro', text: 'Then nothing can stop it. Not a wall. Not a gun. Maybe not even a President.' },
  ], choices: [
    { label: 'Study the leaves until dark', ok: { text: 'By nightfall Johnny sees the rectangle in everything. (Party +1 SPIN.)', fx: g => g.statUpAll('spin', 1) } },
    { label: 'Fire nails until your fingers bleed', ok: { text: 'The nails start to curve along the spiral. It hurts. (Johnny +2 AIM, loses 20% HP.)', fx: g => { g.statUp('johnny', 'aim', 2); g.hurt('johnny', 0.2); } } },
    { label: 'Ask about the horse’s stride', ok: { text: '"The horse is the real teacher. Watch Valkyrie run." You watch her all the next day. (Party +1 RIDING.)', fx: g => g.statUpAll('ride', 1) } },
  ] }, [
    { rep: { naples: 1 }, flag: 'rectangleLeaf', deed: 'Studied the Golden Rectangle in the leaves.' },
    { rep: { naples: 1 }, deed: 'Fired nails along the golden spiral until your fingers bled.' },
    { rep: { naples: 1 }, flag: 'horseGait', deed: 'Learned the Golden Rectangle from a horse’s stride.' },
  ]);
  scene('st_tim_rope', { card: { title: 'Oh! Lonesome Me', blurb: 'Tim is reading a letter he keeps folding up.', icon: 'recruit' }, bg: 3, when: g => M.inParty('mountaintim') && !SBR.run.flags.timWarned && SBR.run.lead !== 'mountaintim', lines: [
    { narr: 'Mountain Tim rereads a telegram. He folds it. He unfolds it.' },
    { who: 'mountaintim', text: 'The organiser’s wife. Somebody’s after her in Kansas City. I told her I’d be there. I’m a fool for a promise.' },
  ], choices: [
    { label: 'Ride to Kansas City with him, fast', ok: { text: 'You push the horses through the night. Whatever is waiting, you’ll meet it together, and early. (−5 pace.)', fx: g => { g.flag('timWarned'); g.pace(-5); } } },
    { label: 'Let him go alone', ok: { text: 'He rides off at dawn, rope coiled on his saddle.', fx: g => g.dismiss('mountaintim', 'Mountain Tim rides ahead to Kansas City alone.') } },
  ] }, [
    { rep: { law: 1 }, npc: { mountaintim: 'warned' }, flag: 'timWarned', deed: 'Rode through the night with Mountain Tim to Kansas City.' },
    { rep: { law: -1 }, npc: { mountaintim: 'alone' }, deed: 'Let Mountain Tim ride to Kansas City alone.' },
  ]);

  /* ---------- Act III: new boss pre/post ---------- */
  S.ringo_pre = { bg: 3, lines: S.st_ringo.lines.concat(GOLDEN), fx: learnGolden };
  scene('bm_pre', { bg: 3, lines: [
    { narr: 'Kansas City under a storm. The rain has stopped falling. It hangs in the air like glass beads, and it is sharp.', mood: 'menace' },
    { who: 'blackmore', text: 'Sumimasen. The girl, the Spine, and your lives. In that order, if you please.' },
  ].concat(GOLDEN), fx: g => { blackFx(g); learnGolden(g); } });
  scene('bm_post', { bg: 3, lines: [
    { narr: 'The rain falls again, ordinarily, all at once. Blackmore is on his back in a puddle, smiling politely.' },
    { who: 'blackmore', text: 'You are very rude people. The President will be... disappointed.' },
  ], choices: [
    { label: 'Take the Spine from his coat', ok: { text: 'It is warm, and it points east. Lucy squeezes your hand.', fx: g => { g.relic('c_spine'); M.unflag('lucyCaptured'); } } },
    { label: 'Ask him where the President is going', ok: { text: '"Philadelphia. Then the sea." He dies with his manners intact. You take the Spine as well.', fx: g => { g.relic('c_spine'); M.unflag('lucyCaptured'); } } },
  ] }, [
    { rep: { president: -1 }, npc: { lucy: 'friend' }, deed: 'Took the Spine from Blackmore’s coat.' },
    { rep: { president: -1 }, flag: 'agentOrders', npc: { lucy: 'friend' }, deed: 'Made Blackmore tell you where the President was going.' },
  ]);
  scene('hpb_pre', { bg: 3, lines: [
    { narr: 'A bridge over the Mississippi at dawn. A rider in a hood blocks it. Beneath the hood, something like a nun’s habit.', mood: 'menace' },
    { who: 'hotpants', text: 'The Vatican asks for the Saint’s remains. I am not asking.' },
  ].concat(GOLDEN), fx: learnGolden, when: () => true });
  scene('hpb_post', { bg: 3, lines: [
    { narr: 'Hot Pants kneels on the bridge, the flesh on her arms still knitting. She doesn’t reach for the spray again.' },
    { who: 'hotpants', text: 'I let a bear take my brother, to save myself. The Corpse is the only forgiveness I will accept. You understand nothing.' },
  ], choices: [
    { label: 'Ask her to ride with you instead', ok: { text: 'A long silence. "...Then I will watch the Corpse from closer." She rides with you.', fx: g => { g.recruit('hotpants'); g.achieve('hotpants'); } } },
    { label: 'Take what she carries', ok: { text: 'A sliver of the Spine, wrapped in a rosary. She watches you take it without a word.', fx: g => g.relic('c_spine') } },
    { label: 'Let her go to Rome', ok: { text: 'She stands, bows once, and crosses the bridge the other way. (+25 XP.)', fx: g => g.xp(25) } },
  ] }, [
    { rep: { vatican: 1 }, npc: { hotpants: 'trusts' }, deed: 'Beat Hot Pants on the bridge and asked her to ride with you.' },
    { rep: { vatican: -3 }, npc: { hotpants: 'enemy' }, deed: 'Took the Vatican’s relic from Hot Pants.' },
    { rep: { vatican: 2 }, npc: { hotpants: 'freed' }, deed: 'Let Hot Pants go to Rome.' },
  ]);

  /* ---------- Act IV beats ---------- */
  S.st_sugar.lines = S.st_sugar.lines.filter(l => !(l.narr && /You receive \$600/.test(l.narr)));
  branch('st_sugar', { fx: null,
    choices: [
      { label: 'Say it was the plain steel ball', ok: { text: 'She smiles. "You are honest. Take all three: gold, diamond, and two parts of the Saint. Spend everything before the second sunset, or the tree takes you."', route: 'honest', fx: g => g.sugar() } },
      { label: 'Say it was the gold', ok: { text: 'She hands you the gold without smiling. The tree creaks. Roots have wrapped the horses’ ankles by morning. (+$250, a random rider gains Exhaustion.)', route: 'greed', fx: g => { g.money(250); g.exhaust('random'); } } },
      { label: 'Ask how she came to live in the tree (RESOLVE)', check: { stat: 'res', dc: 13 }, ok: { text: '"My parents gave me to it, to keep the Saint’s Ears safe." She lowers her voice: "Spend everything. Down to the last coin. That is the only way out." You understand the rules now.', route: 'honest', fx: g => g.sugar() }, fail: { text: 'She only smiles and holds out the three gifts.', route: 'honest', fx: g => g.sugar() } },
    ],
    conseq: [
      { rep: { vatican: 1 }, deed: 'Told Sugar Mountain the truth at her spring.' },
      { rep: { vatican: -1 }, flag: 'sugarGreed', deed: 'Lied to Sugar Mountain for the gold.' },
      { rep: { vatican: 1 }, flag: 'sugarKnows', deed: 'Asked Sugar Mountain how she came to live in the tree.', fail: { rep: { vatican: 1 }, deed: 'Accepted Sugar Mountain’s gifts.' } },
    ] });
  branch('st_tattoo', { foe: 'tattoo',
    choices: [
      { label: 'Fight all of them', ok: { text: 'Eleven men. One heartbeat.', route: 'fight' } },
      { label: 'Find the one who breathes first (AIM)', check: { stat: 'aim', dc: 14 }, ok: { text: 'One of them inhales a heartbeat early. The leader. You put a bullet near him and the formation stumbles. Only two keep coming.', route: 'split', fx: g => g.flag('tattooIntel') }, fail: { text: 'They breathe exactly together. There is no leader to find.', route: 'fight' } },
      { label: 'Take the ice road to lose them', ok: { text: 'You go north over the lake. They don’t follow. Yet. (−6 pace.)', route: 'fled', fx: g => g.pace(-6) } },
    ],
    fights: { fight: { enemies: ['tattoo', 'tattoo', 'tattoo', 'tattoo'] }, split: { enemies: ['tattoo', 'tattoo'] } },
    conseq: [
      { rep: { president: -1 }, deed: 'Fought the eleven men of Tattoo You!.' },
      { rep: { president: -1 }, flag: 'tattooIntel', deed: 'Found the leader of the eleven by his breathing.', fail: { deed: 'Could not find the leader of the eleven.', rep: { president: -1 } } },
      { flag: 'tattooHunting', deed: 'Fled from Tattoo You! over the ice.', later: ['tattoo_ambush', 2, 5] },
    ] });
  S.st_mikeo.variants = () => (SBR.run.flags.lucyCaptured ? [
    { narr: 'Chicago. The hotel where the President’s prisoner is kept. Balloon animals drift up and down the corridor outside her door.' },
    { who: 'mikeo', text: 'Mrs. Steel is the President’s guest. Tubular Bells makes sure nobody visits.' },
    { who: 'lucy', text: '(through the door) Johnny...? Is that you?' },
  ] : null);
  branch('st_mikeo', { foe: 'mikeo',
    choices: [
      { label: 'Shoot your way to Lucy', ok: { text: 'Every bullet you fire becomes a balloon. You keep firing anyway.', route: 'fight' } },
      { label: 'Pop the balloons before they come home (AIM)', check: { stat: 'aim', dc: 13 }, ok: { text: 'A hat pin, a candle, a steady hand. Half the menagerie bursts harmlessly against the wallpaper.', route: 'popped', fx: g => g.flag('balloonsPopped') }, fail: { text: 'A balloon dog noses into Gyro’s sleeve. You have to fight now.', route: 'fight' } },
      { label: 'Walk away and leave Lucy to them', ok: { text: 'You take the service stairs. Mike O. tips his hat to you through the window. (+$80 from an envelope under your door.)', route: 'yield', fx: g => g.money(80) } },
    ],
    fights: { fight: { enemies: ['mikeo'], elite: true }, popped: { enemies: ['mikeo'], elite: true } },
    after: { fight: g => { g.recruit('lucy'); M.unflag('lucyCaptured'); }, popped: g => { g.recruit('lucy'); M.unflag('lucyCaptured'); }, yield: g => g.flag('lucyCaptured') },
    conseq: [
      { rep: { president: -1 }, npc: { lucy: 'friend' }, deed: 'Fought Mike O. for Lucy Steel in Chicago.' },
      { rep: { president: -1 }, npc: { lucy: 'friend' }, flag: 'balloonsPopped', deed: 'Popped Mike O.’s balloon animals before they came home.', fail: { deed: 'A balloon dog found Gyro’s sleeve.', rep: { president: -1 } } },
      { rep: { president: 2, law: -1, vatican: -1 }, npc: { lucy: 'betrayed' }, flag: 'lucyCaptured', deed: 'Left Lucy Steel to Mike O. in Chicago.', later: ['lucy_letter', 6, 12] },
    ] });
  scene('weka_talk', { bg: 4, lines: [
    { narr: 'Wekapipo lowers the steel ball. The satellites stop spinning.' },
    { who: 'wekapipo', text: 'Alive. My sister. They told me she was dead so I would never go back.' },
    { who: 'wekapipo', text: 'I owe you a debt I cannot pay in money. Tell me how to repay it.' },
  ], choices: S.weka_spare.choices });
  CQ_link('weka_talk', 'weka_spare');
  function CQ_link(a, b) { for (let i = 0; i < 4; i++) { if (SBR.CONSEQ['scene:' + b + ':' + i]) SBR.CONSEQ['scene:' + a + ':' + i] = SBR.CONSEQ['scene:' + b + ':' + i]; } }
  branch('st_wekapipo', { foe: 'wekapipo',
    choices: [
      { label: 'Fight the Royal Guard', ok: { text: 'The left side of the world disappears.', route: 'fight' } },
      { label: 'Tell him his sister is alive (RESOLVE)', check: { stat: 'res', dc: 14 }, ok: { text: 'Gyro shouts it across the ice. Wekapipo freezes. Magent keeps shooting until Wekapipo turns and breaks his rifle in half.', route: 'talk' }, fail: { text: 'The wind takes the words. The ball comes screaming.', route: 'fight' } },
      { label: 'Turn back across the strait', ok: { text: 'You leave them on the ice. The Corpse’s legs stay inside a wolf somewhere out there. (−4 pace.)', route: 'fled', fx: g => g.pace(-4) } },
    ],
    fights: { fight: { enemies: ['wekapipo_foe', 'magent'], boss: true } },
    after: { fight: g => { g.relic('c_legs'); g.scene('weka_spare'); }, talk: g => { g.relic('c_legs'); g.scene('weka_talk'); } },
    conseq: [
      { rep: { naples: -1 }, deed: 'Fought Wekapipo and Magent Magent on the frozen strait.' },
      { rep: { naples: 2 }, flag: 'wekaTruth', deed: 'Told Wekapipo across the ice that his sister was alive.', fail: { deed: 'Shouted to Wekapipo, and the wind took it.', rep: { naples: -1 } } },
      { npc: { wekapipo: 'stranger' }, deed: 'Turned back from the frozen strait.', later: ['magent_returns', 3, 7] },
    ] });
  branch('st_axl', { foe: 'axl',
    choices: [
      { label: 'Face what he returns to you', ok: { text: 'The dump fills with the things you left behind.', route: 'fight' } },
      { label: 'Confess before he can return it (RESOLVE)', check: { stat: 'res', dc: 15 }, ok: { text: 'Johnny says his brother’s name first. Civil War has nothing left to hand back to him.', route: 'fight', fx: g => g.flag('facedGuilt') }, fail: { text: 'The words stick. Nicholas is already standing in the garbage.', route: 'fight' } },
    ],
    fights: { fight: { enemies: ['axl'], boss: true } },
    after: { fight: g => g.scene('axl_post') },
    conseq: [
      { rep: { vatican: 1 }, deed: 'Walked into Axl RO’s garbage dump.' },
      { rep: { vatican: 2 }, flag: 'facedGuilt', deed: 'Confessed before Civil War could return your sin.', fail: { deed: 'Could not confess to Civil War.', rep: { vatican: 1 } } },
    ] });
  S.axl_pre.variants = () => (!(M.inParty('hotpants') || SBR.run.lead === 'hotpants') ? [
    { narr: 'Ninety miles west of Philadelphia. A garbage dump. A woman in a nun’s habit crouched among the rubbish, praying.', mood: 'menace' },
    { who: 'axl', text: 'Civil War. I return to each of you what you discarded. I carry none of my own sins anymore.' },
    { who: 'johnny', text: 'Nicholas...?' },
  ] : null);

  /* ---------- Act IV optional beats ---------- */
  scene('st_weka_exile', { card: { title: 'The Exile', blurb: 'Wekapipo is sharpening nothing.', icon: 'recruit' }, bg: 4, when: g => M.inParty('wekapipo'), lines: [
    { narr: 'Wekapipo sits apart from the fire, turning a steel ball over and over.' },
    { who: 'wekapipo', text: 'My sister’s husband beat her. I challenged him. The duel was fair. I crippled him. He was a nobleman, and I was not.' },
    { who: 'wekapipo', text: 'The King exiled me. They told me she died in childbirth. The Zeppeli family knew the truth, and said nothing.' },
  ], choices: [
    { label: 'Promise to help him find her', ok: { text: 'He nods once. It is the most he has said to anyone in years. (Wekapipo +2 RESOLVE.)', fx: g => g.statUp('wekapipo', 'res', 2) } },
    { label: 'Ask him to teach the Wrecking Ball', ok: { text: 'He shows Gyro how the satellites break off. "Not for use on Zeppelis." (Gyro +1 SPIN.)', fx: g => g.statUp('gyro', 'spin', 1) } },
    { label: 'Tell him Gyro’s family lied to protect the King', ok: { text: 'Gyro doesn’t deny it. The two of them don’t speak for a day. Then they do. (+20 XP.)', fx: g => g.xp(20) } },
  ] }, [
    { rep: { naples: 1 }, npc: { wekapipo: 'friend' }, flag: 'wekaPromise', deed: 'Promised Wekapipo you would help him find his sister.' },
    { rep: { naples: 1 }, deed: 'Learned the Wrecking Ball from Wekapipo.' },
    { rep: { naples: -2 }, flag: 'wekaTruth', deed: 'Told Wekapipo the House of Naples had lied to him.' },
  ]);
  scene('st_hp_brother', { card: { title: 'Cream Starter’s Sin', blurb: 'Hot Pants will not sleep near the trees.', icon: 'skull' }, bg: 4, when: g => M.inParty('hotpants') && SBR.run.lead !== 'hotpants', lines: [
    { narr: 'Bear tracks in the snow. Hot Pants sees them, and sits down very suddenly.' },
    { who: 'hotpants', text: 'My little brother and I were lost in the woods. A bear found us. I ran. I pushed him toward it so I could run.' },
    { who: 'hotpants', text: 'The Church took me in. I became their agent. If I bring them the Saint, perhaps God will look at me again.' },
  ], choices: [
    { label: 'Tell her she was a child', ok: { text: 'She doesn’t answer. But she sleeps that night, for the first time you’ve seen. (Hot Pants +1 RESOLVE.)', fx: g => g.statUp('hotpants', 'res', 1) } },
    { label: 'Tell her the Corpse won’t forgive her. Only she can.', ok: { text: '"Then I am damned." She rides ahead alone for a while. (+20 XP.)', fx: g => g.xp(20) } },
    { label: 'Tell her about Nicholas', ok: { text: 'Johnny tells her about the white mouse. She listens. Two people who killed their brothers, by a fire, in the snow. (Party heals 30%.)', fx: g => g.healAll(0.3) } },
  ] }, [
    { rep: { vatican: 2 }, flag: 'hpLoyal', npc: { hotpants: 'trusts' }, deed: 'Told Hot Pants she was only a child.' },
    { rep: { vatican: -1 }, npc: { hotpants: 'wary' }, deed: 'Told Hot Pants the Corpse would not forgive her.' },
    { rep: { vatican: 1 }, flag: ['facedGuilt', 'hpLoyal'], deed: 'Told Hot Pants about Nicholas and the white mouse.' },
  ]);
  const act4BossIsAxl = () => { const L = SBR.run.lineup && SBR.run.lineup[4]; if (!L) return false; const b = (L && L.boss) || SBR.ACTS[4].boss; return b.enemies.includes('axl') || !!(L && Object.values(L.story || {}).includes('st_axl')); };
  scene('st_axl_chapel', { card: { title: 'The Deserter’s Chapel', blurb: 'A man in a rosary sweeps an empty church.', icon: 'skull' }, bg: 4, when: g => !act4BossIsAxl(), lines: [
    { narr: 'A tiny chapel outside Philadelphia. A man with a rosary sweeps the floor that is already clean.' },
    { who: 'axl', text: 'At Gettysburg I ran, and two hundred men died because of the gap I left. I have not been able to carry it. So I found a way to put it down.' },
    { who: 'axl', text: 'You look like someone carrying something too.' },
  ], choices: [
    { label: 'Pray with him', ok: { text: 'You kneel on the clean floor. Nothing happens. It feels like something did. (Party +1 RESOLVE.)', fx: g => g.statUpAll('res', 1) } },
    { label: 'Report the deserter to the army', ok: { text: 'Soldiers take him away. He goes quietly. The sins he put down stay behind in the chapel. (+$40 reward.)', fx: g => g.money(40) } },
    { label: 'Take his rosary', ok: { text: 'He lets you. "Be careful. It is heavier than it looks."', fx: g => g.mat('rem_axl', 1) } },
  ] }, [
    { rep: { vatican: 2 }, flag: 'axlForgiven', deed: 'Prayed with Axl RO in his chapel.' },
    { rep: { law: 1, vatican: -1 }, deed: 'Reported Axl RO to the army.', later: ['guilt_ghosts', 4, 9] },
    { rep: { vatican: -1 }, deed: 'Took Axl RO’s rosary.' },
  ]);
  scene('st_corpse_map', { card: { title: 'Where the Saint Lies', blurb: 'The Spine’s map, drawn out at last.', icon: 'map' }, bg: 4, lines: [
    { narr: 'Spread out on a table in a trapper’s cabin, the old map from Arimathea. Nine marks along the race route.' },
    { narr: 'The Left Arm in the Arizona desert. The Eyes in the Rockies. The Spine in Kansas. The Ears and Right Arm by Lake Michigan. The Legs on the frozen strait. The Heart in Philadelphia. The Head... with Lucy Steel.' },
    { who: 'gyro', text: 'The race was never a race. It was a map with prize money on it.' },
  ], choices: [
    { label: 'Ride for the nearest mark', ok: { text: 'Under a lakeside cairn, wrapped in rotted linen: the Saint’s Ears. Someone saw you dig. (Corpse: Ears, +1 Threat.)', fx: g => { g.relic('c_ears'); g.threat(1); } } },
    { label: 'Sell a copy to the Vatican', ok: { text: 'A priest in Chicago pays in gold and blesses you twice. (+$120.)', fx: g => g.money(120) } },
    { label: 'Burn the map', ok: { text: 'Now only the President and the dead know the way. (−1.5 Threat.)', fx: g => g.threat(-1.5) } },
  ] }, [
    { rep: { president: -1 }, flag: 'corpseMap', deed: 'Dug up the Saint’s Ears with the Arimathea map.' },
    { rep: { vatican: 2, president: -1 }, deed: 'Sold a copy of the Corpse map to the Vatican.' },
    { rep: { vatican: -1 }, deed: 'Burned the map of the Saint’s remains.' },
  ]);

  /* ---------- Act IV: new boss pre/post ---------- */
  scene('tattoo_pre', { bg: 4, lines: [
    { narr: 'A frozen rail line north of Philadelphia. Eleven riders stand across the tracks, breathing in unison. Their breath rises as one cloud.', mood: 'menace' },
    { who: 'tattoo', text: 'Tattoo You! We are eleven. We are one. Strike one of us and you strike a stranger.' },
  ] });
  scene('tattoo_post', { bg: 4, lines: [
    { narr: 'The last of the eleven falls, and the tattoos on the others’ skin fade like frost on a window.' },
    { who: 'johnny', text: 'I shot through myself back there. The hole went through me, and came out behind them.' },
  ], choices: [
    { label: 'Search the leader’s coat', ok: { text: 'Orders with the President’s seal, and a train timetable. (+$40.)', fx: g => g.money(40) } },
    { label: 'Bury all eleven', ok: { text: 'It takes all night. (+20 XP, −4 pace.)', fx: g => { g.xp(20); g.pace(-4); } } },
  ] }, [
    { rep: { president: -1 }, flag: 'agentOrders', deed: 'Took the President’s orders from Tattoo You!’s leader.' },
    { rep: { vatican: 1, law: 1 }, deed: 'Buried the eleven men of Tattoo You!.' },
  ]);
  scene('mikeo_pre', { bg: 4, lines: [
    { narr: 'A Chicago hotel ballroom. Hundreds of balloon animals bob against the ceiling. Every one of them used to be a bullet.', mood: 'menace' },
    { who: 'mikeo', text: 'The President’s security is my responsibility. Tubular Bells has never failed to bring a bullet home.' },
  ] });
  scene('mikeo_post', { bg: 4, lines: [
    { narr: 'The last balloon pops. Mike O. slumps against a pillar, very surprised.' },
    { who: 'lucy', text: 'Johnny! I was hiding in the laundry the whole time. I can get you into the President’s rooms.' },
  ], choices: [
    { label: 'Bring Lucy with you', ok: { text: 'She ties back her hair and takes the reins of a spare horse.', fx: g => { g.recruit('lucy'); M.unflag('lucyCaptured'); } } },
    { label: 'Send her back to Steven', ok: { text: '"He’ll be worried sick." She goes. (+15 pace, you ride light.)', fx: g => { g.pace(15); M.unflag('lucyCaptured'); } } },
  ] }, [
    { rep: { president: -1 }, npc: { lucy: 'friend' }, deed: 'Rescued Lucy Steel from Mike O.’s hotel.' },
    { npc: { lucy: 'safe', steven: 'friend' }, flag: 'lucySafe', deed: 'Sent Lucy Steel back to her husband.' },
  ]);
})();

/* ================= Scenes: Acts V and VI ================= */
(() => {
  const S = SBR.STORY, M = SBR.manga, { branch, conseq } = M;
  const scene = (id, o, C) => { S[id] = o; if (C) conseq(id, C); return o; };

  /* ---------- D-I-S-C-O ---------- */
  branch('st_disco', { foe: 'disco',
    choices: [
      { label: 'Fight on the grid', ok: { text: 'Every square is a trap door.', route: 'fight' } },
      { label: 'Ride off the grid entirely (RIDING)', check: { stat: 'ride', dc: 14 }, ok: { text: 'Slow Dancer jumps the last line of light. D-I-S-C-O watches you go and says nothing, which is worse. (−2 pace.)', route: 'fled', fx: g => g.pace(-2) }, fail: { text: 'The square under you lights up. You are back where you started, and he is behind you.', route: 'fight' } },
      { label: 'Stand perfectly still in one square (RESOLVE)', check: { stat: 'res', dc: 13 }, ok: { text: 'He can only move what crosses a line. You don’t. When he comes to you, you are ready.', route: 'still', fx: g => g.flag('discoStill') }, fail: { text: 'Someone flinches. The grid takes them.', route: 'fight' } },
    ],
    fights: { fight: { enemies: ['disco'], elite: true }, still: { enemies: ['disco'], elite: true } },
    conseq: [
      { rep: { president: -1 }, deed: 'Fought D-I-S-C-O on the checkered grid.' },
      { flag: 'discoHunting', deed: 'Jumped off D-I-S-C-O’s grid and rode on.', later: ['disco_grid', 2, 5], fail: { deed: 'D-I-S-C-O’s grid caught you.', rep: { president: -1 } } },
      { rep: { president: -1 }, flag: 'discoStill', deed: 'Stood still until D-I-S-C-O had to come to you.', fail: { deed: 'Flinched on D-I-S-C-O’s grid.', rep: { president: -1 } } },
    ] });

  /* ---------- Valentine: fight, trick, or listen ---------- */
  branch('st_valentine', { foe: 'valentine',
    choices: [
      { label: 'Fight the President', ok: { text: 'He steps between two flags and there are two of him.', route: 'fight' } },
      { label: 'Shoot the flag, not the man (AIM)', check: { stat: 'aim', dc: 15 }, ok: { text: 'The nail tears the flag he was about to step behind. For one second, there is only one Valentine, and he is surprised.', route: 'fight', fx: g => g.flag('flagShot') }, fail: { text: 'The nail goes through the flag and out of this world.', route: 'fight' } },
      { label: 'Lower your guns and hear what he has to say', ok: { text: 'Valentine smiles, and sits down on a bench, and folds a napkin very carefully.', route: 'listen' } },
    ],
    fights: { fight: { enemies: ['valentine1'], boss: true } },
    after: { fight: g => g.scene('diego_alliance'), listen: g => g.scene('napkin_speech') },
    conseq: [
      { rep: { president: -2 }, deed: 'Fought President Valentine between the flags.' },
      { rep: { president: -2 }, flag: 'flagShot', deed: 'Shot the flag the President was hiding behind.', fail: { deed: 'Your nail went into another world.', rep: { president: -2 } } },
      { rep: { president: 1 }, flag: 'valentineUnhurt', deed: 'Lowered your guns to hear President Valentine out.' },
    ] });
  scene('napkin_speech', { bg: 5, lines: [
    { who: 'valentine', text: 'When I was a boy, my father was captured in a war. They tortured him for the location of his unit. He swallowed his handkerchief so he would not have to speak.' },
    { who: 'valentine', text: 'He died, and that handkerchief came home to me. I understood then: a man can carry his country inside him.' },
    { who: 'valentine', text: 'At a table, whoever takes the first napkin sets the rules for everyone. America will take the first napkin. The Corpse is how.' },
  ], choices: [
    { label: 'Say nothing, and remember every word', ok: { text: 'He nods, as if you agreed. He leaves you alive. Diego is nowhere to be seen. (+30 XP.)', fx: g => g.xp(30) } },
    { label: 'Tell him no country is worth a saint', ok: { text: '"Then you have never loved one." He stands. The bench is empty before you blink. (Threat rises.)', fx: g => g.threat(1) } },
    { label: 'Ask what his father would think of him', ok: { text: 'For the first time, Valentine has no answer ready. He leaves without folding the napkin. (+20 XP.)', fx: g => g.xp(20) } },
  ] }, [
    { rep: { president: 1 }, flag: 'heardNapkin', deed: 'Listened to President Valentine’s napkin speech.' },
    { rep: { president: -2, vatican: 1 }, deed: 'Told the President no country is worth a saint.' },
    { rep: { president: -1 }, flag: 'valFather', deed: 'Asked Valentine what his father would think of him.' },
  ]);

  /* ---------- Act V optional beats ---------- */
  scene('st_heart', { card: { title: 'The Heart in Philadelphia', blurb: 'Something beats under Independence Hall.', icon: 'corpse' }, bg: 5, lines: [
    { narr: 'Under the floorboards of a Philadelphia church, a slow beat, once a minute. The Saint’s Heart.' },
    { who: 'gyro', text: 'Valentine’s men will be here by nightfall. Whatever we do, we do it now.' },
  ], choices: [
    { label: 'Take the Heart', ok: { text: 'It is warm in your hands. Every agent in the city felt you pick it up. (Corpse: Heart, +2 Threat.)', fx: g => { g.relic('c_heart'); g.threat(2); } } },
    { label: 'Leave it hidden, and hide the church too', ok: { text: 'You pry up a second set of boards and lay a false trail to the river. (−1 Threat.)', fx: g => g.threat(-1) } },
    { label: 'Tell the Vatican where it is', ok: { text: 'A priest in grey nods, and you never see him again. The Heart will be gone before Valentine arrives. (+$60.)', fx: g => g.money(60) } },
  ] }, [
    { rep: { president: -2 }, flag: 'heartTaken', deed: 'Took the Saint’s Heart from under a Philadelphia church.' },
    { rep: { president: -1 }, deed: 'Hid the Saint’s Heart from the President.' },
    { rep: { vatican: 3 }, deed: 'Gave the Saint’s Heart to the Vatican.' },
  ]);
  scene('st_ballbreaker', { card: { title: 'Valkyrie’s Gait', blurb: 'Gyro is watching his horse run, and nothing else.', icon: 'horseshoe' }, bg: 5, when: g => M.inParty('gyro') && !SBR.run.flags.ballbreaker, lines: [
    { narr: 'On the Atlantic sand, Gyro rides Valkyrie in long straight lines, over and over, looking down at her hooves.' },
    { who: 'gyro', text: 'A human arm can’t make the perfect spin. The horse can. Her stride is the rectangle. Throw the ball from her rhythm and it becomes... something else.' },
  ], choices: [
    { label: 'Ride beside him until it works (RIDING)', check: { stat: 'ride', dc: 14 }, ok: { text: 'On the forty-first pass the ball leaves his hand and a shape rises out of the rotation itself. BALL BREAKER is available.', fx: g => g.flag('ballbreaker') }, fail: { text: 'Valkyrie stumbles. So does Gyro. (Gyro loses 25% HP.)', fx: g => g.hurt('gyro', 0.25) } },
    { label: 'Tell him to rest. The ball can wait.', ok: { text: 'He sleeps for twelve hours. (Party heals fully.)', fx: g => g.healAll(1) } },
  ] }, [
    { rep: { naples: 2 }, flag: 'horseGait', deed: 'Rode beside Gyro until Ball Breaker was born.', fail: { deed: 'Watched Valkyrie stumble on the Atlantic sand.', rep: { naples: 1 } } },
    { rep: { naples: 1 }, deed: 'Made Gyro rest before the end.' },
  ]);
  scene('st_steven', { card: { title: 'Steven Steel’s Nerve', blurb: 'The organiser is marching into the President’s hotel.', icon: 'flag' }, bg: 5, lines: [
    { narr: 'Steven Steel, in his best suit, walks up the steps of the President’s hotel with a pistol he has never fired.' },
    { who: 'steven', text: 'My wife is somewhere in there. I have been a coward in business my whole life. I don’t intend to be one in marriage.' },
  ], choices: [
    { label: 'Walk in with him', ok: { text: 'The guards laugh at him, then see you behind him, and stop laughing. Nobody gets Lucy tonight, but nobody gets Steven either. (+20 XP.)', fx: g => g.xp(20) } },
    { label: 'Tell him the truth about the Corpse', ok: { text: 'He sits down on the steps. "Then the race was his idea all along." He gives you his pistol. (A random rare item.)', fx: g => g.relicRandom('rare') } },
    { label: 'Charge him for protection ($100)', ok: { text: 'He pays without a word. It is the saddest money you have ever made. (+$100.)', fx: g => g.money(100) } },
  ] }, [
    { rep: { racers: 1, president: -1 }, npc: { steven: 'friend' }, flag: 'stevenBrave', deed: 'Walked into the President’s hotel beside Steven Steel.' },
    { rep: { vatican: 1 }, npc: { steven: 'friend' }, deed: 'Told Steven Steel the truth about his race.' },
    { rep: { racers: -2, law: -1 }, npc: { steven: 'wary' }, deed: 'Made Steven Steel pay you to protect him.' },
  ]);
  scene('st_lovetrain_omen', { card: { title: 'Light Around the Train', blurb: 'Lucy’s shadow is the wrong shape.', icon: 'corpse' }, bg: 5, when: g => !SBR.run.flags.valDead, lines: [
    { narr: 'Lucy Steel, sitting on a crate, with a hand on her stomach. The Saint’s Head went into her. Something is growing.' },
    { who: 'lucy', text: 'When the President touches the Corpse, the light around him bends. Bullets curve away from him. Misfortune goes somewhere else. To someone else.' },
    { who: 'johnny', text: 'Then the only thing that can reach him is something that never stops turning.' },
  ], choices: [
    { label: 'Promise Lucy you’ll get it out of her', ok: { text: '"You can’t promise that." She lets you anyway. (+20 XP.)', fx: g => g.xp(20) } },
    { label: 'Ask her to use it against him', ok: { text: 'She goes pale, then nods. "If I have to be his vessel, I’ll be a bad one." (Love Train will be weaker.)', fx: g => g.pace(2) } },
  ] }, [
    { npc: { lucy: 'friend' }, flag: 'lucyPromise', deed: 'Promised Lucy you would free her from the Saint’s Head.' },
    { rep: { president: -1 }, flag: 'lucySabotage', deed: 'Asked Lucy Steel to turn the Saint against the President.' },
  ]);

  /* ---------- Act V: new boss pre/post ---------- */
  scene('d4c_pre', { bg: 5, lines: [
    { narr: 'Independence Hall at noon. Valentine walks out between two flags, and then between two more, and then there are six of him.', mood: 'menace' },
    { who: 'valentine', text: 'Every world has a Valentine, and every Valentine is loyal to America. You are not fighting a man. You are fighting a country.' },
  ] });
  scene('d4c_post', { bg: 5, lines: [
    { narr: 'The last copy crumbles into cubes. The real Valentine is bleeding, and smiling, and stepping backwards between two flags.' },
    { who: 'valentine', text: 'This world is finished with me for today. The Corpse is not. I will be waiting at the finish line, Joestar.' },
    { narr: 'He is gone. So is the Heart.', mood: 'menace' },
  ], fx: g => { g.flag('valEscaped'); if (SBR.run.flags.tusk4) g.scene('gyro_farewell'); } });
  scene('disco_pre', { bg: 5, lines: [
    { narr: 'A park in Philadelphia. The lamp posts are exactly the same distance apart. The grass is squares. Somebody made it that way.', mood: 'menace' },
    { who: 'disco', text: '...' },
    { who: 'gyro', text: 'He guards the President’s train. If we want Valentine, we go through him first.' },
  ] });
  scene('disco_post', { bg: 5, lines: [
    { narr: 'The grid flickers out. D-I-S-C-O lies in the centre of a square that is only grass now.' },
    { who: 'johnny', text: 'The train left while we fought. Valentine is taking the Corpse to New York.' },
  ], choices: [
    { label: 'Search his coat', ok: { text: 'A ticket for the President’s train and a map of Manhattan. (+$50.)', fx: g => g.money(50) } },
    { label: 'Ride for the next station at once', ok: { text: 'No rest. You ride through the night. (+12 pace.)', fx: g => g.pace(12) } },
  ] }, [
    { rep: { president: -1 }, flag: 'agentOrders', deed: 'Took the President’s train ticket from D-I-S-C-O.' },
    { rep: { racers: 1 }, deed: 'Rode straight from D-I-S-C-O’s grid after the President’s train.' },
  ]);
  scene('lucy_pre', { bg: 5, lines: [
    { narr: 'A private rail car. Lucy Steel floats a foot above the floor, eyes closed, wrapped in light. Presidential guards stand around her like pallbearers.', mood: 'menace' },
    { who: 'lucy', text: 'Johnny... it isn’t me moving. It’s the Saint. It wants to go where it’s needed. I don’t think that’s you.' },
    { who: 'gyro', text: 'Don’t shoot her. Shoot the light.' },
  ] });
  scene('lucy_post', { bg: 5, lines: [
    { narr: 'The guards are down. The light around Lucy flickers, and she drops into Johnny’s arms, heavy and real.' },
    { who: 'lucy', text: 'It’s still inside me. But it listened to you. I felt it listen.' },
  ], fx: g => M.unflag('lucyCaptured'), choices: [
    { label: 'Draw the Saint out of her', ok: { text: 'It comes out as a warm stone in your palm. Lucy sleeps for a day. (Corpse: Heart.)', fx: g => g.relic('c_heart') } },
    { label: 'Let the Saint decide where it goes', ok: { text: 'It stays with Lucy. She opens her eyes, and they are calm. She rides with you.', fx: g => g.recruit('lucy') } },
    { label: 'Take her home to Steven', ok: { text: 'Steven Steel runs down the platform to meet the train. (+$80 from a grateful husband.)', fx: g => g.money(80) } },
  ] }, [
    { rep: { vatican: -1, president: -1 }, deed: 'Drew the Saint out of Lucy Steel.' },
    { rep: { vatican: 3 }, npc: { lucy: 'friend' }, flag: 'saintChose', deed: 'Let the Saint choose to stay with Lucy Steel.' },
    { rep: { racers: 1 }, npc: { lucy: 'safe', steven: 'friend' }, flag: 'lucySafe', deed: 'Brought Lucy Steel home to Steven.' },
  ]);

  /* ---------- Gyro's farewell can only happen once ---------- */
  const fare = S.gyro_farewell.fx;
  S.gyro_farewell.fx = g => { const f = SBR.run.flags; if (f.gyroFarewell) return; f.gyroFarewell = true; fare(g); };
  S.gyro_farewell.variants = () => (SBR.run.flags.gyroFarewell ? [{ narr: 'The shore is quiet. The sea keeps turning.' }] : null);

  /* ---------- Act VI ---------- */
  S.st_gasoline.required = true; S.st_gasoline.foe = 'diego_world';
  scene('st_trinity', { card: { title: 'The Crypt Under Trinity', blurb: 'The finish line of the race is a church.', icon: 'corpse' }, bg: 6, required: true, lines: [
    { narr: 'Trinity Church, Manhattan. The finish. Steven Steel meets you in the churchyard, looking older than a week ago.' },
    { who: 'steven', text: 'There’s a crypt under the altar nobody has opened in a century. If you bring the Corpse this far, put it where no President can reach.' },
  ], choices: [
    { label: 'Promise the Corpse will rest here', ok: { text: 'Steven shakes your hand. It is the first time he has looked afraid. (+$50.)', fx: g => g.money(50) } },
    { label: 'Tell Steven to get out of the city', ok: { text: '"And miss the finish of my own race?" But he takes Lucy and goes to the harbour. (−1 Threat.)', fx: g => g.threat(-1) } },
    { label: 'Pray in the empty church', ok: { text: 'Nobody answers. The party rises feeling lighter. (Party heals 40%.)', fx: g => g.healAll(0.4) } },
  ] }, [
    { rep: { vatican: 2, president: -1 }, flag: 'trinityPromise', deed: 'Promised Steven Steel the Corpse would rest under Trinity Church.' },
    { rep: { racers: 1 }, npc: { steven: 'safe' }, deed: 'Sent Steven Steel out of New York before the end.' },
    { rep: { vatican: 1 }, deed: 'Prayed in Trinity Church before the final ride.' },
  ]);
  scene('st_bridge', { card: { title: 'The Mined Bridge', blurb: 'Wires run along the Brooklyn Bridge cables.', icon: 'skull' }, bg: 6, required: true, lines: [
    { narr: 'The Brooklyn Bridge. The President’s men wired it before they died. Now Diego’s raptors are herding the racers onto it.', mood: 'menace' },
  ], choices: [
    { label: 'Cut the wires (SPIN)', check: { stat: 'spin', dc: 14 }, ok: { text: 'A steel ball runs the cable and saws every wire. The bridge holds. (+20 XP.)', fx: g => g.xp(20) }, fail: { text: 'One charge goes off under you. (Party loses 20% HP.)', fx: g => g.hurtAll(0.2) } },
    { label: 'Ride the ferry instead ($40)', cost: { money: 40 }, ok: { text: 'You cross the East River on a coal barge while the bridge smokes behind you. (+10 pace.)', fx: g => g.pace(10) } },
    { label: 'Race across before it blows (RIDING)', check: { stat: 'ride', dc: 15 }, ok: { text: 'The explosions chase you all the way. You beat them. (+15 pace.)', fx: g => g.pace(15) }, fail: { text: 'The blast throws Slow Dancer sideways. (Party loses 25% HP.)', fx: g => g.hurtAll(0.25) } },
  ] }, [
    { rep: { law: 1 }, deed: 'Cut the wires under the Brooklyn Bridge.', fail: { deed: 'Set off a charge on the Brooklyn Bridge.', rep: { law: 1 } } },
    { rep: { racers: -1 }, deed: 'Took the ferry around the mined bridge.' },
    { rep: { racers: 1 }, deed: 'Raced across the Brooklyn Bridge ahead of the charges.', fail: { deed: 'Were thrown by the blast on the Brooklyn Bridge.', rep: { racers: 1 } } },
  ]);
  scene('ltf_pre', { bg: 6, lines: [
    { narr: 'Trinity Church. Valentine is standing on the steps with the whole Corpse gathered around him in a halo of light. Every misfortune in New York is flowing away from him.', mood: 'menace' },
    { who: 'valentine', text: 'You followed me to the finish line. Good. Let the whole nation watch what happens to those who chase their President.' },
    { narr: 'LOVE TRAIN — Only piercing attacks connect. Golden Spin pierces at 5 Rotation. Status damage still hurts him.', mood: 'shout' },
  ], fx: g => { g.dismiss('diego', 'Diego vanishes into the crowd at Trinity.'); } });
  scene('both_pre', { bg: 6, lines: [
    { narr: 'The Brooklyn Bridge. Valentine, bleeding from the last fight, and beside him a Diego Brando from another world, with a golden figure at his shoulder.', mood: 'menace' },
    { who: 'valentine', text: 'This Diego was loyal in his own world. He will be loyal in mine. Two worlds, one finish.' },
    { who: 'diegoworld', text: 'I serve nobody. But I’ll take his Corpse when you’re dead, Joestar.' },
  ] });
  scene('both_post', { bg: 6, lines: [
    { narr: 'The parallel Diego crumbles into cubes; he did not belong to this world. Valentine falls to his knees on the bridge.' },
    { who: 'valentine', text: 'Nullify the rotation, Joestar, and I will bring you another Gyro. I swear it on my father’s handkerchief.' },
    { who: 'johnny', text: 'Then pick up your gun. If you’re honest, you won’t.' },
  ], fx: g => { g.flag('valDead'); if (SBR.run.flags.tusk4) g.scene('gyro_farewell'); }, choices: [
    { label: 'Trust him', ok: { text: 'He reaches, and a gun from another world is in his hand. You barely survive (party loses 30% HP). The rotation takes him anyway.', fx: g => g.hurtAll(0.3) } },
    { label: 'Keep your guard up', ok: { text: 'He draws from another world. Johnny is faster. The infinite rotation drags the President beneath the bridge.', fx: g => g.xp(30) } },
  ] }, [
    { deed: 'Trusted the President on the Brooklyn Bridge, for one second.', rep: { president: 1 } },
    { rep: { president: -1, naples: 1 }, flag: 'sawThroughValentine', deed: 'Kept your guard up when Valentine offered a deal on the bridge.' },
  ]);
})();

/* ================= Line fixes for beats that now branch ================= */
(() => {
  const S = SBR.STORY;
  S.st_zombiehorse.lines = S.st_zombiehorse.lines.filter(l => !(l.narr && /fully healed/.test(l.narr)));
  S.st_leftarm.lines = [
    { who: 'stroheim', text: 'HALT! In the name of German precision, your belongings are forfeit!' },
    { narr: 'Behind the soldier, wedged between two rocks, a mummified arm wrapped in linen. Johnny’s own left arm aches when he looks at it.' },
    { who: 'gyro', text: 'That’s not a relic, Johnny. That’s a piece of a SAINT. Everyone who is trying to kill us wants it.' },
  ];
  S.st_ringo.card.blurb = 'You’ve passed this cabin four times now. Someone inside wants a duel.';
})();

/* ================= Skipping story beats: what happens instead ================= */
(() => {
  const S = SBR.STORY, M = SBR.manga;
  /** per beat: deed text, rep, flags, npc states, a follow-up [event, min, max], and an optional fx(g) */
  const SKIP = {
    st_robinson: { deed: 'Left Mrs. Robinson’s cactus garden alone. Racers kept dying in it.', rep: { racers: -1, law: -1 }, npc: { robinson: 'hunting' }, later: ['robinson_ambush', 2, 5] },
    st_tim: { deed: 'Never met Mountain Tim on the trail.', flag: 'timAlone', npc: { mountaintim: 'alone' }, later: ['tim_alone', 3, 7] },
    st_boom: { deed: 'Rode around the Boomboom family’s sandstorm.', npc: { boomboom: 'fled' }, later: ['boom_return', 4, 9] },
    st_marco: { deed: 'Never asked Gyro what he was writing.' },
    st_poco: { deed: 'Passed Pocoloco on the road.' },
    st_sandrun: { deed: 'Never met the runner who beat the horses.' },
    st_steel: { deed: 'Never spoke to Lucy Steel at the start.' },
    st_oyecomova: { deed: 'Left Oyecomova to his pinned village.', rep: { naples: -1 }, npc: { oyecomova: 'free' }, later: ['oye_bomb', 2, 6] },
    st_zombiehorse: { deed: 'Rode past the Zombie Horse cliff.' },
    st_leftarm: { deed: 'Never found the Saint’s Left Arm. Stroheim did.', rep: { vatican: -1 }, flag: 'leftArmLost', later: ['leftarm_hunt', 3, 7] },
    st_porkpie: { deed: 'Went around the Pork Pie Hat Kid’s rocks. His lines stayed strung.', later: ['porkpie_hooks', 2, 5] },
    st_ferdinand: { deed: 'Let Dr. Ferdinand’s extinct village spread.', rep: { natives: -1 }, flag: 'diegoEyes', npc: { diego: 'rival' } },
    st_diego_mother: { deed: 'Rode past Diego Brando at a grave.' },
    st_nicholas: { deed: 'Never asked Johnny about the white mouse.' },
    st_hotpants: { deed: 'Ignored the racer with the dead cow. She was the Vatican’s agent.', rep: { vatican: -2 }, npc: { hotpants: 'enemy' }, flag: 'hpRival', later: ['hp_steals', 2, 5] },
    st_ringo: { deed: 'Never went into Ringo Roadagain’s cabin. Others did.', flag: 'gauchoDead', later: ['ringo_loop', 2, 5] },
    st_blackmore: { deed: 'Was not in Kansas City when the rain stopped falling.', rep: { president: 1, law: -1 }, flag: 'lucyCaptured', npc: { lucy: 'captured' },
      fx: g => { if (!SBR.campaign.npcIs('mountaintim', 'warned') && !SBR.run.flags.timWarned) g.dismiss('mountaintim', 'News by telegraph: Mountain Tim died in a Kansas City street, alone.'); }, later: ['lucy_letter', 5, 10] },
    st_sandman: { deed: 'Let Sandman run ahead of the race.', flag: 'sandmanAhead', later: ['sandman_hunt', 2, 6] },
    st_lucy_secret: { deed: 'Did not see Lucy Steel in Kansas City.' },
    st_golden: { deed: 'Skipped Gyro’s lesson in the dirt.' },
    st_tim_rope: { deed: 'Let Mountain Tim ride to Kansas City alone.', fx: g => g.dismiss('mountaintim', 'Mountain Tim rides ahead to Kansas City alone.') },
    st_sugar: { deed: 'Rode past Sugar Mountain’s spring.', rep: { vatican: -1 } },
    st_tattoo: { deed: 'Outran the eleven synchronised riders, for a while.', flag: 'tattooHunting', later: ['tattoo_ambush', 2, 5] },
    st_mikeo: { deed: 'Did not go to the Chicago hotel. Lucy Steel was taken.', rep: { president: 1 }, flag: 'lucyCaptured', npc: { lucy: 'captured' }, later: ['lucy_letter', 4, 9] },
    st_wekapipo: { deed: 'Went around the frozen strait. Wekapipo never learned his sister lived.', npc: { wekapipo: 'stranger' }, later: ['magent_returns', 3, 7] },
    st_axl: { deed: 'Stayed away from the garbage dump outside Philadelphia.', later: ['guilt_ghosts', 4, 9] },
    st_weka_exile: { deed: 'Never asked Wekapipo why he was exiled.' },
    st_hp_brother: { deed: 'Never asked Hot Pants about the bear.' },
    st_axl_chapel: { deed: 'Rode past a deserter’s chapel.' },
    st_corpse_map: { deed: 'Left the map of the Saint’s remains unread.' },
    st_disco: { deed: 'Stayed off the checkered grid. D-I-S-C-O is still out there.', flag: 'discoHunting', later: ['disco_grid', 2, 5] },
    st_valentine: { deed: 'Avoided the President at Independence Hall. He was not hurt.', rep: { president: 1 }, flag: 'valentineUnhurt' },
    st_heart: { deed: 'Left the Saint’s Heart for someone else to find.', rep: { president: 1 } },
    st_ballbreaker: { deed: 'Never watched Valkyrie run the golden stride.' },
    st_steven: { deed: 'Let Steven Steel walk into the President’s hotel alone.', npc: { steven: 'hurt' } },
    st_lovetrain_omen: { deed: 'Never asked Lucy what the Saint was doing to her.' },
  };
  SBR.STORY_SKIPS = SKIP;
  Object.entries(SKIP).forEach(([id, k]) => { if (S[id]) S[id].skip = k; });
  /** main.js calls this when a stage offered a story beat and the player picked another card */
  SBR.onStorySkip = (id, g) => {
    const r = SBR.run; if (!r) return;
    const k = (S[id] && S[id].skip) || SKIP[id] || {};
    g.flag('skipped_' + id);
    r.skippedBeats = (r.skippedBeats || []).concat(id);
    const C = SBR.campaign;
    Object.entries(k.rep || {}).forEach(([f, n]) => C.rep(f, n));
    Object.entries(k.npc || {}).forEach(([n, st]) => C.npc(n, st));
    [].concat(k.flag || []).forEach(f => g.flag(f));
    C.deed('skip:' + id, k.deed || `Rode past “${(S[id] && S[id].card && S[id].card.title) || id}”.`);
    if (k.fx) k.fx(g);
    if (k.later) C.later(k.later[0], k.later[1], k.later[2], 'skip:' + id);
  };
})();

/* ================= Follow-up encounters from skips and branches ================= */
(() => {
  const M = SBR.manga, CQ = SBR.CONSEQ;
  const ev = (o, C) => { SBR.CAMPAIGN_EVENTS.push(o); C.forEach((c, i) => { if (!c) return; const { fail, ...ok } = c; CQ[o.id + ':' + i] = ok; if (fail) CQ[o.id + ':' + i + ':fail'] = fail; }); };
  ev({ id: 'robinson_ambush', type: 'elite', title: 'The Swarm Found You', blurb: 'Insects in your canteen. Cacti where there were none.', icon: 'skull', art: 'robinson', acts: [1, 2], reveals: 'Mrs. Robinson, left alone, found you again in a worse place.',
    text: 'A dry wash with walls on both sides. Cacti on the rim, all twitching. Mrs. Robinson’s voice from somewhere above: "You rode past me once, amigos. Not twice."',
    choices: [
      { label: 'Fight your way up the wash', ok: { text: 'Bugs in your eyes, needles in the air.', fight: { enemies: ['robinson', 'cactus', 'cactus'], elite: true, after: g => g.money(30) } } },
      { label: 'Let Tim rope him off the rim', req: g => g.inParty('mountaintim'), reqText: 'Needs Mountain Tim', ok: { text: 'Tim’s rope goes up, Mrs. Robinson comes down. The swarm scatters without him. (+25 XP.)', fx: g => g.xp(25) } },
      { label: 'Gallop out the far end (RIDING)', check: { stat: 'ride', dc: 14 }, ok: { text: 'Stung and bleeding, you’re out. (Party loses 10% HP.)', fx: g => g.hurtAll(0.1) }, fail: { text: 'The far end is full of cacti too.', fight: { enemies: ['robinson', 'cactus', 'cactus', 'cactus'], elite: true } } },
    ] }, [
    { rep: { law: 1 }, npc: { robinson: 'dead' }, deed: 'Killed Mrs. Robinson in a dry wash.' },
    { rep: { law: 2 }, npc: { robinson: 'jailed' }, deed: 'Mountain Tim roped Mrs. Robinson off a cliff.' },
    { deed: 'Galloped out of Mrs. Robinson’s ambush.', fail: { deed: 'Fought Mrs. Robinson’s ambush in a cactus-choked wash.', rep: { law: 1 } } },
  ]);
  ev({ id: 'tim_alone', type: 'recruit', title: 'The Cowboy, Again', blurb: 'Mountain Tim, alone at a water tower.', icon: 'recruit', art: 'mountaintim', acts: [2, 3], cond: g => !g.inParty('mountaintim') && SBR.run.lead !== 'mountaintim', reveals: 'Mountain Tim gave you a second chance at a water tower.',
    text: 'Mountain Tim is filling his canteen at a water tower. "Riding alone is lonesome work," he says. "There’s a girl in Kansas City who’s going to need help. I could use company, or I could go alone."',
    choices: [
      { label: 'Ride with him now', ok: { text: 'He grins and swings into the saddle beside you.', fx: g => { g.recruit('mountaintim'); M.unflag('timAlone'); } } },
      { label: 'Tell him to guard the girl, and watch his back', ok: { text: '"Now that’s advice." He rides for Kansas City at a gallop.', fx: g => { g.flag('timGuardsLucy'); g.flag('timWarned'); M.unflag('timAlone'); } } },
      { label: 'Wish him luck', ok: { text: 'He tips his hat. You don’t see him again. (+10 pace.)', fx: g => g.pace(10) } },
    ] }, [
    { rep: { law: 1 }, npc: { mountaintim: 'friend' }, deed: 'Rode with Mountain Tim after all.' },
    { rep: { law: 2 }, npc: { mountaintim: 'warned' }, flag: ['timGuardsLucy', 'timWarned'], deed: 'Sent Mountain Tim to guard Lucy Steel.' },
    { rep: { law: -1 }, npc: { mountaintim: 'alone' }, flag: 'timAlone', deed: 'Wished Mountain Tim luck, and let him go.' },
  ]);
  ev({ id: 'hp_steals', type: 'elite', title: 'A Nun in the Night', blurb: 'Someone is going through your saddlebags.', icon: 'skull', art: 'hotpants', acts: [3, 4], cond: g => !g.inParty('hotpants') && SBR.run.lead !== 'hotpants', reveals: 'Hot Pants, whom you turned away, came for the Corpse in the dark.',
    text: 'You wake to flesh spray hissing and a hooded figure at your saddlebags. Hot Pants, with a Corpse Part in her hand. "The Saint belongs to God. Not to boys playing at horses."',
    choices: [
      { label: 'Stop her', ok: { text: 'She doesn’t let go easily.', fight: { enemies: ['hotpants_foe'], elite: true, after: g => { g.say('hotpants', '...You fight for it honestly. Keep it, then. For now.'); g.npc('hotpants', 'wary'); } } } },
      { label: 'Let her take one', req: g => M.holyCount() > 0, reqText: 'You carry no Corpse Parts', ok: { text: 'She takes the first thing her hand closes on and vanishes into the dark.', fx: g => { const r = SBR.run; const k = Object.keys(r.mats).filter(x => SBR.MATERIALS[x] && SBR.MATERIALS[x].holy && r.mats[x] > 0); if (k.length) g.loseCorpse(k.slice(1)); } } },
      { label: 'Ask her what the Vatican wants (RESOLVE)', check: { stat: 'res', dc: 14 }, ok: { text: 'She stops. "...Nobody has ever asked." She puts it back. And then she stays by your fire.', fx: g => { g.recruit('hotpants'); g.achieve('hotpants'); } }, fail: { text: '"Not your concern." She draws.', fight: { enemies: ['hotpants_foe'], elite: true } } },
    ] }, [
    { rep: { vatican: -1 }, deed: 'Fought Hot Pants off your saddlebags.' },
    { rep: { vatican: 2 }, npc: { hotpants: 'enemy' }, flag: 'hpTookPart', deed: 'Let Hot Pants take a Corpse Part for the Vatican.' },
    { rep: { vatican: 2 }, npc: { hotpants: 'trusts' }, deed: 'Asked Hot Pants what the Vatican wanted, and she stayed.', fail: { rep: { vatican: -1 }, deed: 'Hot Pants would not talk.' } },
  ]);
  ev({ id: 'leftarm_hunt', type: 'elite', title: 'The Soldier With the Crate', blurb: 'German boots in the snow, and a crate that glows.', icon: 'corpse', art: 'stroheim', acts: [2, 3, 4], reveals: 'Stroheim was still carrying the Saint’s Left Arm when you caught up.',
    text: 'Stroheim again, with six soldiers and the crate strapped to a mule. "German science will unlock the Saint! In about two hundred years!"',
    choices: [
      { label: 'Take the crate by force', ok: { text: 'Soldiers everywhere.', fight: { enemies: ['stroheim', 'soldier', 'soldier'], elite: true, after: g => { g.relic('c_leftarm'); g.maxHp('johnny', 12); } } } },
      { label: 'Steal the mule at night (LUCK)', check: { stat: 'luck', dc: 14 }, ok: { text: 'The mule was never loyal to Germany. (Corpse: Left Arm.)', fx: g => { g.relic('c_leftarm'); g.maxHp('johnny', 12); } }, fail: { text: 'The mule brays. Everyone wakes up.', fight: { enemies: ['stroheim', 'soldier'], elite: true } } },
      { label: 'Let it go for good', ok: { text: 'The crate disappears east on a German train. (+$20 in dropped marks.)', fx: g => g.money(20) } },
    ] }, [
    { rep: { president: -1 }, deed: 'Took the Saint’s Left Arm back from Stroheim by force.' },
    { rep: { racers: 1 }, deed: 'Stole Stroheim’s mule and the Saint’s Left Arm with it.', fail: { deed: 'Stroheim’s mule gave you away.', rep: { president: -1 } } },
    { rep: { vatican: -1 }, deed: 'Let the Left Arm leave America in a German crate.' },
  ]);
  ev({ id: 'porkpie_hooks', type: 'elite', title: 'Hooks in the Road', blurb: 'Fishing line strung across the trail at neck height.', icon: 'skull', art: 'porkpie', acts: [2, 3], reveals: 'The Pork Pie Hat Kid kept his lines strung and waited for you.',
    text: 'A line catches Gyro’s hat off his head. Then another catches his throat. "Heheh! You went around my rocks! So I moved the rocks!"',
    choices: [
      { label: 'Fight him on the road', ok: { text: '', fight: { enemies: ['porkpie', 'agent'], elite: true } } },
      { label: 'Cut every line with a spinning ball (SPIN)', check: { stat: 'spin', dc: 14 }, ok: { text: 'Snip. Snip. Snip. He runs. (+20 XP.)', fx: g => g.xp(20) }, fail: { text: 'Gyro gets reeled. (Gyro loses 25% HP.)', fx: g => g.hurt('gyro', 0.25) } },
    ] }, [
    { rep: { president: -1 }, deed: 'Fought the Pork Pie Hat Kid on the open road.' },
    { rep: { naples: 1 }, deed: 'Cut the Pork Pie Hat Kid’s lines one by one.', fail: { deed: 'Got caught in the Pork Pie Hat Kid’s lines.', rep: { naples: 1 } } },
  ]);
  ev({ id: 'oye_bomb', type: 'event', title: 'The Relay Station Bell', blurb: 'The station bell is humming a rhythm.', icon: 'skull', art: 'oyecomova', acts: [2, 3], reveals: 'Oyecomova, left free, pinned the next relay station.',
    text: 'The relay station you need is quiet. Too quiet. The bell hums. Every horse’s bridle in the stable has a tiny pin in it.',
    choices: [
      { label: 'Pull the pins, one by one (AIM)', check: { stat: 'aim', dc: 13 }, ok: { text: 'Forty-two pins. None go off. The station master weeps. (+$40.)', fx: g => g.money(40) }, fail: { text: 'BOOM. (Everyone loses 14 HP.)', fx: g => g.hurtAllFlat(14) } },
      { label: 'Skip the station (−10 pace)', ok: { text: 'Behind you, the bell goes off like a cannon.', fx: g => g.pace(-10) } },
    ] }, [
    { rep: { law: 2 }, deed: 'Defused Oyecomova’s relay station.', fail: { deed: 'Oyecomova’s relay station went off in your face.', rep: { law: -1 } } },
    { rep: { law: -1 }, deed: 'Rode around a pinned relay station and let it blow.' },
  ]);
  ev({ id: 'ringo_loop', type: 'elite', title: 'The Same Cabin, Again', blurb: 'Smoke from a chimney you already burned.', icon: 'crown', art: 'ringo', acts: [3, 4], cond: g => !SBR.run.flags.ringoDead, reveals: 'Ringo Roadagain’s six seconds caught up with you.',
    text: 'The trail loops. The cabin is standing again, unburned, and Ringo is on the porch with his watch open. "Six seconds, and six seconds, and six seconds. I have all the time in the world. You do not."',
    choices: [
      { label: 'Duel him', ok: { text: 'This time there is no running.', fight: { enemies: ['ringo'], elite: true, after: g => { g.flag('ringoDead'); g.xp(20); } } } },
      { label: 'Throw your watch away (RESOLVE)', check: { stat: 'res', dc: 15 }, ok: { text: 'Without a watch to turn back, the loop has nothing to hold. The cabin fades. Ringo tips his hat. "Perhaps you are not inferior."', fx: g => g.statUpAll('res', 1) }, fail: { text: 'Six seconds later, you are holding it again.', fight: { enemies: ['ringo'], elite: true, after: g => g.flag('ringoDead') } } },
    ] }, [
    { rep: { naples: 1 }, deed: 'Duelled Ringo Roadagain on his porch at last.' },
    { rep: { naples: 1 }, deed: 'Threw your watch into Ringo’s loop and walked free.', fail: { deed: 'Could not escape Ringo’s six seconds.', rep: { naples: 1 } } },
  ]);
  ev({ id: 'blackmore_returns', type: 'elite', title: 'The Rain Remembers', blurb: 'It stops raining. The drops hang.', icon: 'skull', art: 'blackmore', acts: [3, 4], reveals: 'Blackmore found the cow bones, and came back apologising.',
    text: '"Sumimasen. It was cow bones. That was very rude." Blackmore stands inside a storm that isn’t falling. Storm deputies ride beside him now.',
    choices: [
      { label: 'Fight him in the rain', ok: { text: '', fight: { enemies: ['rain_blackmore', 'storm_deputy', 'storm_deputy'], elite: true, after: g => g.money(40) } } },
      { label: 'Give him Lucy’s map instead', ok: { text: 'He bows, takes the copy of the map, and walks away. The President will know where you’re going. (+1.5 Threat.)', fx: g => g.threat(1.5) } },
    ] }, [
    { rep: { president: -1 }, deed: 'Fought Blackmore’s storm a second time.' },
    { rep: { president: 1 }, deed: 'Gave Blackmore Lucy’s map.' },
  ]);
  ev({ id: 'sandman_hunt', type: 'elite', title: 'Words on the Trail', blurb: 'Stones by the road are speaking.', icon: 'skull', art: 'sandman', acts: [3, 4], cond: g => SBR.campaign.repOf('natives') < 3, reveals: 'Sandman, left ahead of you, set the road to speak.',
    text: 'Every stone for a mile has a word written on it. When your horses pass, the words shout. Somewhere ahead, a runner is watching.',
    choices: [
      { label: 'Break the stones', ok: { text: '', fight: { enemies: ['soundstone', 'soundstone', 'soundstone', 'outlaw'], elite: true } } },
      { label: 'Ride in total silence (RESOLVE)', check: { stat: 'res', dc: 14 }, ok: { text: 'Not a word, not a hoofbeat out of place, for a mile. The stones stay silent. (+20 XP.)', fx: g => g.xp(20) }, fail: { text: 'Someone sneezes. DOGOOON. (Party loses 15% HP.)', fx: g => g.hurtAll(0.15) } },
    ] }, [
    { rep: { natives: -1 }, deed: 'Smashed Sandman’s speaking stones.' },
    { rep: { natives: 1 }, deed: 'Rode past Sandman’s speaking stones in total silence.', fail: { deed: 'Set off Sandman’s speaking stones.', rep: { natives: 1 } } },
  ]);
  ev({ id: 'tattoo_ambush', type: 'elite', title: 'Eleven Breaths in the Fog', blurb: 'The riders you outran caught up.', icon: 'skull', art: 'tattoo', acts: [4, 5], reveals: 'Tattoo You! followed your tracks off the ice.',
    text: 'Fog on the lake shore. Eleven clouds of breath, perfectly in time, all around you.',
    choices: [
      { label: 'Back to back, and fight', ok: { text: '', fight: { enemies: ['tattoo', 'tattoo', 'tattoo', 'tattoo', 'tattoo'], elite: true } } },
      { label: 'Throw a steel ball into the fog and listen (SPIN)', check: { stat: 'spin', dc: 14 }, ok: { text: 'It ricochets off ten men and hits the eleventh. The fog clears around a very surprised leader. They scatter.', fx: g => g.xp(25) }, fail: { text: 'They close in.', fight: { enemies: ['tattoo', 'tattoo', 'tattoo'], elite: true } } },
    ] }, [
    { rep: { president: -1 }, deed: 'Fought Tattoo You! in the lakeside fog.' },
    { rep: { naples: 1 }, deed: 'Found the leader of the eleven with a ricochet.', fail: { deed: 'Tattoo You! closed in through the fog.', rep: { president: -1 } } },
  ]);
  ev({ id: 'disco_grid', type: 'elite', title: 'The Grid Moves', blurb: 'Lines of light across the road ahead.', icon: 'skull', art: 'disco', acts: [5, 6], reveals: 'D-I-S-C-O laid his grid across the road you took.',
    text: 'The road is checkered with light for a mile in every direction. D-I-S-C-O stands in the middle square.',
    choices: [
      { label: 'Fight him on his grid', ok: { text: '', fight: { enemies: ['disco', 'vguard'], elite: true } } },
      { label: 'Go the long way round (−12 pace)', ok: { text: '', fx: g => g.pace(-12) } },
    ] }, [
    { rep: { president: -1 }, deed: 'Fought D-I-S-C-O on a grid across the road.' },
    { deed: 'Rode around D-I-S-C-O’s grid.', rep: { racers: -1 } },
  ]);
  ev({ id: 'lucy_letter', type: 'event', title: 'A Letter in a Pigeon’s Leg', blurb: 'Handwriting you know.', icon: 'book', art: 'lucy', acts: [4, 5], cond: g => !!SBR.run.flags.lucyCaptured, reveals: 'Lucy Steel got a letter out of the President’s custody.',
    text: '"They keep me on a train. They say I am carrying something holy. I can feel it. Please. —L." The pigeon is looking at you.',
    choices: [
      { label: 'Ride for the train (−8 pace)', ok: { text: 'You catch it at a water stop. Two guards, a locked car, and Lucy.', fight: { enemies: ['vguard', 'vguard', 'agent'], elite: true, after: g => { SBR.manga.unflag('lucyCaptured'); g.recruit('lucy'); g.pace(-8); } } } },
      { label: 'Send the letter to Steven Steel', ok: { text: 'Steven reads it and buys a train ticket. He is braver than anyone thinks. (+15 XP.)', fx: g => g.xp(15) } },
      { label: 'Burn it', ok: { text: 'The pigeon flies off, empty. (+10 pace.)', fx: g => g.pace(10) } },
    ] }, [
    { rep: { president: -2, law: 1 }, npc: { lucy: 'friend' }, deed: 'Pulled Lucy Steel off the President’s train.' },
    { npc: { steven: 'friend' }, flag: 'stevenBrave', deed: 'Sent Lucy’s letter to her husband.' },
    { rep: { vatican: -2 }, npc: { lucy: 'abandoned' }, deed: 'Burned Lucy Steel’s letter.' },
  ]);
  ev({ id: 'thread_thanks', type: 'event', title: 'The Racers Remember', blurb: 'A rider waves a ribbon at you.', icon: 'recruit', acts: [2, 3, 4], reveals: 'The racers you left the Zombie Horse for came back to thank you.',
    text: 'Three racers, stitched up with Zombie Horse thread, ride up waving your ribbon. "You could have taken it all. You didn’t."',
    choices: [
      { label: 'Accept their supplies', ok: { text: '(+2 Leather, +2 Herbs, party heals 30%.)', fx: g => { g.mat('leather', 2); g.mat('herb', 2); g.healAll(0.3); } } },
      { label: 'Ask them to watch your back', ok: { text: 'They ride behind you for a stage, and the President’s men keep their distance. (−1 Threat.)', fx: g => g.threat(-1) } },
    ] }, [
    { rep: { racers: 1 }, deed: 'Took supplies from racers you had helped.' },
    { rep: { racers: 1 }, deed: 'Racers you had helped rode guard for you.' },
  ]);
  ev({ id: 'gregorio_letter', type: 'event', title: 'A Letter From Naples', blurb: 'Gregorio Zeppeli’s seal.', icon: 'book', art: 'gregorio', acts: [3, 4, 5], cond: g => g.inParty('gyro'), reveals: 'Gyro’s father wrote to him after all.',
    text: 'A letter from Gregorio Zeppeli, delivered by the Naples consulate. Gyro reads it twice and hands it to you. It says: "Marco’s sentence is postponed until the race ends. Do not be late."',
    choices: [
      { label: 'Tell Gyro his father believes in him', ok: { text: '"He believes in the law." But he keeps the letter in his coat. (Gyro +1 RESOLVE.)', fx: g => g.statUp('gyro', 'res', 1) } },
      { label: 'Tell Gyro to write back', ok: { text: 'He writes one line and seals it. He won’t say what. (+20 XP.)', fx: g => g.xp(20) } },
    ] }, [
    { rep: { naples: 2 }, flag: 'marcoAlive', deed: 'Read Gregorio Zeppeli’s letter with Gyro.' },
    { rep: { naples: 1 }, flag: 'marcoAlive', deed: 'Gyro wrote back to his father.' },
  ]);
})();

/* ================= Lineups: four or more roads through every act ================= */
(() => {
  const F = () => (SBR.run && SBR.run.flags) || {};
  const rep = f => SBR.manga.rep(f), npcIs = SBR.manga.npcIs;
  const notLead = id => () => !SBR.run || SBR.run.lead !== id;
  const valAlive = () => !F().valDead && !F().knight;
  SBR.LINEUPS = {
    1: [
      { id: 'canon', name: 'Tomb of the Boom', rumor: 'Three riders with iron sand on their boots were seen buying nails by the barrel.', tags: ['boom'], foe: 'boom',
        beats: [['st_robinson', 2, 4], ['st_tim', 3, 5]] },
      { id: 'robinson', name: 'The Insect Queen', rumor: 'Racers are turning up blind in the cactus country. Something buzzes out there.', tags: ['robinson'], foe: 'robinson',
        beats: [['st_tim', 2, 3], ['st_boom', 3, 5]], boss: { enemies: ['robinson_boss'], name: 'The Insect Queen', pre: 'rob_pre', post: 'rob_post', midRound: { 2: 'tusk_awaken' } } },
      { id: 'porkpie', name: 'Wired Canyon', rumor: 'A kid in a pork pie hat has been seen stringing fishing line between canyon walls.', tags: ['porkpie', 'president'], foe: 'porkpie',
        beats: [['st_robinson', 2, 3], ['st_tim', 3, 5]], boss: { enemies: ['porkpie_boss'], name: 'Hooks in the Canyon', pre: 'pph1_pre', post: 'pph1_post', midRound: { 2: 'tusk_awaken' } } },
      { id: 'oyecomova', name: 'The Relay Station', rumor: 'A man with a Naples accent was asking which rider wears a hat with a Z on it.', tags: ['naples', 'oyecomova'], foe: 'oyecomova',
        beats: [['st_tim', 2, 3], ['st_boom', 3, 5]], weight: () => (SBR.run && SBR.run.lead === 'gyro' ? 1.6 : 1), boss: { enemies: ['oyecomova_boss1'], name: 'The Relay Station Bomber', pre: 'oye1_pre', post: 'oye1_post', midRound: { 2: 'tusk_awaken' } } },
    ],
    2: [
      { id: 'canon', name: 'Scary Monsters', rumor: 'In the mountain villages the people have started walking on their toes.', tags: ['ferdinand'], foe: 'ferdinand',
        beats: [['st_oyecomova', 2, 3], ['st_leftarm', 3, 5], ['st_porkpie', 4, 6]] },
      { id: 'oyecomova', name: 'The Rhythm of Naples', rumor: 'Church bells in the pass have been ringing on their own. Somebody is humming.', tags: ['naples', 'oyecomova'], foe: 'oyecomova',
        beats: [['st_leftarm', 2, 4], ['st_ferdinand', 3, 5], ['st_porkpie', 4, 6]], boss: { enemies: ['oyecomova_boss'], name: 'The Rhythm of Naples', pre: 'oye_pre', post: 'oye_post' } },
      { id: 'porkpie', name: 'The Wired Gorge', rumor: 'Racers keep going missing from the gorge trail, hats and all.', tags: ['porkpie', 'president'], foe: 'porkpie',
        beats: [['st_oyecomova', 2, 3], ['st_leftarm', 3, 4], ['st_ferdinand', 4, 6]], boss: { enemies: ['porkpie_boss2'], name: 'Wired: The Gorge', pre: 'pph2_pre', post: 'pph2_post' } },
      { id: 'diego', name: 'Dio at the Pass', rumor: 'A jockey on a silver horse has been seen at the top of the pass, not racing. Waiting.', tags: ['diego'], foe: 'diego',
        weight: () => (npcIs('diego', 'enemy') || F().diegoGrudge ? 2.5 : 1),
        beats: [['st_oyecomova', 2, 3], ['st_ferdinand', 3, 4], ['st_leftarm', 4, 6]], boss: { enemies: ['diego_boss'], name: 'Scary Monsters at the Pass', pre: 'diego2_pre', post: 'diego2_post' } },
    ],
    3: [
      { id: 'canon', name: 'In a Silent Way', rumor: 'A cottage by the Mississippi where the walls talk.', tags: ['sandman', 'natives'], foe: 'sandman',
        beats: [['st_hotpants', 2, 3], ['st_ringo', 3, 5], ['st_blackmore', 4, 6]] },
      { id: 'ringo', name: 'The Man’s World', rumor: 'Seven racers went into a cabin in the woods. None came out. The cabin is still there.', tags: ['ringo'], foe: 'ringo',
        weight: () => (F().fortuneRingo ? 1.8 : 1),
        beats: [['st_hotpants', 2, 3], ['st_blackmore', 3, 4], ['st_sandman', 5, 6]], boss: { enemies: ['ringo'], name: 'The Man’s World', pre: 'ringo_pre', post: 'ringo_post', midRound: { 2: 'tusk2_awaken' } } },
      { id: 'blackmore', name: 'Catch the Rainbow', rumor: 'In Kansas City the rain stopped falling last night. It is still in the air.', tags: ['blackmore', 'president', 'rain'], foe: 'blackmore',
        beats: [['st_hotpants', 2, 3], ['st_ringo', 3, 4], ['st_sandman', 4, 6]], boss: { enemies: ['blackmore_boss'], name: 'Catch the Rainbow over Kansas City', pre: 'bm_pre', post: 'bm_post', midRound: { 2: 'tusk2_awaken' } } },
      { id: 'hotpants', name: 'Cream Starter', rumor: 'The Vatican has sent someone to collect what you carry.', tags: ['vatican', 'hotpants'], foe: 'hotpants', cond: notLead('hotpants'),
        weight: () => (npcIs('hotpants', 'enemy') || F().hpRival ? 3 : 1),
        beats: [['st_ringo', 2, 4], ['st_blackmore', 3, 5]], boss: { enemies: ['hotpants_boss'], name: 'Cream Starter on the Mississippi', pre: 'hpb_pre', post: 'hpb_post', midRound: { 2: 'tusk2_awaken' } } },
    ],
    4: [
      { id: 'canon', name: 'Civil War', rumor: 'A nun has been seen in a garbage dump outside Philadelphia, praying to nothing.', tags: ['axl'], foe: 'axl',
        beats: [['st_tattoo', 2, 3], ['st_mikeo', 3, 4], ['st_wekapipo', 4, 6]] },
      { id: 'wekapipo', name: 'The Frozen Strait', rumor: 'A man with a steel ball and satellites crossed the lake ice. The Royal Guard of Naples.', tags: ['naples', 'wekapipo'], foe: 'wekapipo',
        beats: [['st_tattoo', 2, 3], ['st_mikeo', 3, 4], ['st_axl', 4, 5]], boss: { enemies: ['wekapipo_boss', 'magent'], name: 'The Frozen Strait', pre: 'weka_pre', post: 'weka_post' } },
      { id: 'tattoo', name: 'The Eleven', rumor: 'Eleven riders with the same tattoo, moving in step, have been following the race for a week.', tags: ['tattoo', 'president'], foe: 'tattoo',
        beats: [['st_sugar', 2, 3], ['st_mikeo', 3, 4], ['st_wekapipo', 4, 6]], boss: { enemies: ['tattoo_act'], name: 'Tattoo You!: Eleven as One', pre: 'tattoo_pre', post: 'tattoo_post' } },
      { id: 'mikeo', name: 'Tubular Bells', rumor: 'The President’s head of security has taken over a Chicago hotel. The ballroom is full of balloons.', tags: ['mikeo', 'president'], foe: 'mikeo',
        weight: () => (F().lucyCaptured ? 2.5 : 1),
        beats: [['st_sugar', 2, 3], ['st_tattoo', 3, 4], ['st_wekapipo', 4, 6]], boss: { enemies: ['mikeo_boss'], name: 'Tubular Bells in Chicago', pre: 'mikeo_pre', post: 'mikeo_post' } },
    ],
    5: [
      { id: 'canon', name: 'Love Train', rumor: 'A private train runs along the coast. The light around it bends.', tags: ['valentine'], foe: 'lovetrain',
        beats: [['st_disco', 2, 3], ['st_valentine', 4, 6]] },
      { id: 'd4c', name: 'Every World at Once', rumor: 'Witnesses in Philadelphia swear they saw the President in six places at once.', tags: ['parallel', 'president'], foe: 'd4c',
        beats: [['st_disco', 2, 4]], boss: { enemies: ['valentine_d4c'], name: 'D4C: Every World at Once', pre: 'd4c_pre', post: 'd4c_post' } },
      { id: 'disco', name: 'The Grid of Philadelphia', rumor: 'A silent man guards the President’s train. The park around it is squares now.', tags: ['disco', 'president'], foe: 'disco',
        beats: [['st_valentine', 3, 6]], boss: { enemies: ['disco_boss'], name: 'Chocolate Disco', pre: 'disco_pre', post: 'disco_post' } },
      { id: 'lucy', name: 'Ticket to Ride', rumor: 'The President’s private car carries a girl wrapped in light.', tags: ['lucy', 'vatican'], foe: 'lucy',
        weight: () => (F().lucyCaptured ? 4 : 0.6),
        beats: [['st_disco', 2, 3], ['st_valentine', 4, 6]], boss: { enemies: ['saint_lucy'], name: 'Ticket to Ride: The Saint’s Vessel', pre: 'lucy_pre', post: 'lucy_post' } },
    ],
    6: [
      { id: 'world', name: 'THE WORLD', rumor: 'A second Diego Brando has been seen in Manhattan. He moves between heartbeats.', tags: ['diego'], cond: () => !valAlive(),
        beats: [['st_gasoline', 2, 2]] },
      { id: 'world_pack', name: 'THE WORLD and His Pack', rumor: 'Golden raptors on the Brooklyn Bridge, and a man who stops time behind them.', tags: ['diego', 'parallel'], cond: () => !valAlive(),
        beats: [['st_bridge', 2, 2]], boss: { enemies: ['diego_world', 'worldraptor', 'worldraptor'], name: 'THE WORLD and the Parallel Pack', pre: 'world_pre', post: 'world_post' } },
      { id: 'lovetrain', name: 'Love Train at Trinity', rumor: 'The President is waiting at the finish line, with the whole Saint.', tags: ['valentine'], cond: () => valAlive() && !F().tusk4,
        beats: [['st_trinity', 2, 2]], boss: { enemies: ['lovetrain'], name: 'Love Train at Trinity', pre: 'ltf_pre', post: 'lt_post' } },
      { id: 'both', name: 'Two Worlds, One Finish', rumor: 'The President has brought a Diego from another world to guard the bridge.', tags: ['parallel', 'diego', 'valentine'], cond: () => valAlive(),
        beats: [['st_gasoline', 2, 2]], boss: { enemies: ['valentine_last', 'diego_parallel'], name: 'Two Worlds, One Finish', pre: 'both_pre', post: 'both_post' } },
    ],
  };
  // optional manga beats: a random one or two of these join each act; some only appear if their people are with you
  SBR.BEAT_POOL = {
    1: [['st_marco', 2, 5], ['st_poco', 2, 5], ['st_sandrun', 2, 4], ['st_steel', 2, 3]],
    2: [['st_zombiehorse', 2, 5], ['st_marco', 2, 6], ['st_diego_mother', 2, 6], ['st_nicholas', 2, 6], ['st_poco', 2, 5]],
    3: [['st_lucy_secret', 2, 4], ['st_golden', 2, 6], ['st_tim_rope', 2, 3], ['st_nicholas', 2, 6], ['st_diego_mother', 3, 6]],
    4: [['st_sugar', 2, 4], ['st_weka_exile', 2, 6], ['st_hp_brother', 2, 6], ['st_axl_chapel', 3, 6], ['st_corpse_map', 2, 6]],
    5: [['st_heart', 2, 5], ['st_ballbreaker', 3, 6], ['st_steven', 2, 5], ['st_lovetrain_omen', 2, 5], ['st_mikeo', 2, 4]],
  };
  // the road ahead changes with what you left behind
  const hasFoe = (B, id) => B.enemies.includes(id);
  SBR.BOSS_TWISTS = {
    1: [
      { id: 'swarm', when: (g, B) => F().skipped_st_robinson && !hasFoe(B, 'robinson_boss') && !npcIs('robinson', 'dead'), add: ['cactus', 'cactus'], name: B => B.name + ' — and the Swarm' },
      { id: 'boomsons', when: (g, B) => F().skipped_st_boom && hasFoe(B, 'robinson_boss'), add: ['andre'], name: B => B.name + ' — with a Boomboom' },
    ],
    2: [
      { id: 'pins', when: (g, B) => F().skipped_st_oyecomova && !B.enemies.some(e => /oyecomova/.test(e)), add: ['oyecomova'], name: B => B.name + ' — and a Pinned Village' },
      { id: 'dinos', when: (g, B) => F().skipped_st_ferdinand && !hasFoe(B, 'ferdinand'), add: ['raptor', 'raptor'], name: B => B.name + ' — Extinction Spreads' },
      { id: 'eyes', when: (g, B) => F().diegoEyes && hasFoe(B, 'diego_boss'), add: ['raptor'], name: B => B.name + ' — With Both Eyes' },
    ],
    3: [
      { id: 'rain', when: (g, B) => F().skipped_st_blackmore && !B.enemies.some(e => /blackmore/.test(e)), add: ['rain_blackmore'], name: B => B.name + ' — in the Rain' },
      { id: 'vatican', when: (g, B) => (F().skipped_st_hotpants || npcIs('hotpants', 'enemy')) && !hasFoe(B, 'hotpants_boss') && !SBR.manga.inParty('hotpants') && SBR.run.lead !== 'hotpants', add: ['hotpants_foe'], name: B => B.name + ' — and the Vatican' },
      { id: 'stones', when: (g, B) => hasFoe(B, 'sandman') && rep('natives') <= -3, add: ['soundstone', 'soundstone'], name: B => B.name + ' — the Land Speaks Against You' },
    ],
    4: [
      { id: 'eleven', when: (g, B) => (F().skipped_st_tattoo || F().tattooHunting) && !hasFoe(B, 'tattoo_act'), add: ['tattoo', 'tattoo'], name: B => B.name + ' — and the Eleven' },
      { id: 'magent', when: (g, B) => F().skipped_st_wekapipo && !hasFoe(B, 'magent'), add: ['magent'], name: B => B.name + ' — and 20th Century Boy' },
      { id: 'balloons', when: (g, B) => F().skipped_st_mikeo && !hasFoe(B, 'mikeo_boss'), add: ['balloon', 'balloon'], name: B => B.name + ' — Balloons Come Home' },
    ],
    5: [
      { id: 'grid', when: (g, B) => (F().skipped_st_disco || F().discoHunting) && !hasFoe(B, 'disco_boss'), add: ['disco'], name: B => B.name + ' — on the Grid' },
      { id: 'guards', when: (g, B) => rep('president') <= -4 && !hasFoe(B, 'saint_lucy'), add: ['vguard'], name: B => B.name + ' — the Full Guard' },
    ],
    6: [
      { id: 'posse', when: (g, B) => rep('president') <= -4 && hasFoe(B, 'diego_world'), add: ['nypd'], name: B => B.name + ' — the City Turns on You' },
    ],
  };
})();

/* ================= Run omens: every run starts under a different sky ================= */
(() => {
  SBR.OMENS = {
    dinohunt:  { name: 'Scales in the Grass', text: 'Diego Brando has noticed you before the race even starts. His animals will be watching.', bias: { diego: 3 }, fx: g => g.threat(1) },
    naples:    { name: 'A Price From Naples', text: 'Someone in Naples has paid for Gyro Zeppeli to die in America. Neapolitan killers are on the boats.', bias: { naples: 2.5, oyecomova: 2, wekapipo: 2 }, fx: g => g.rep('naples', -1) },
    vatican:   { name: 'The Vatican Is Watching', text: 'Rome knows the Saint is in America. Its agents are already in the race.', bias: { vatican: 3, hotpants: 2.5, lucy: 1.5 }, fx: g => g.rep('vatican', 1) },
    list:      { name: 'Your Name on a List', text: 'A telegram reached Washington with your name on it. The President’s hunters start early this year.', bias: { president: 2, porkpie: 1.5, blackmore: 1.5, mikeo: 1.5 }, fx: g => { g.threat(2); g.rep('president', -1); } },
    heyya:     { name: 'Hey Ya! Lucky Year', text: 'Pocoloco’s Stand told everyone at the start line that this is the luckiest race in history.', bias: {}, fx: g => { g.statUpAll('luck', 1); g.money(30); } },
    dust:      { name: 'The Year of Dust', text: 'Drought on the plains. The runners of Sandman’s people are the only ones who know where water is.', bias: { sandman: 2.5, natives: 2 }, fx: g => g.pace(-5) },
    rain:      { name: 'The Rain Won’t Fall', text: 'In Kansas the rain hangs in the air for days. Farmers call it the President’s weather.', bias: { rain: 3, blackmore: 2.5 }, fx: g => g.xp(10) },
    eleven:    { name: 'Eleven Riders', text: 'Eleven identical riders registered at San Diego under eleven names.', bias: { tattoo: 3 }, fx: g => g.threat(0.5) },
    parallel:  { name: 'Faces From Another World', text: 'People keep meeting their own doubles on the trail. The doubles never come back.', bias: { parallel: 3 }, fx: g => g.threat(0.5) },
    lawman:    { name: 'The Marshals Ride', text: 'Federal marshals are policing the race this year, and they don’t like the President’s men any more than you do.', bias: { boom: 1.5, robinson: 1.5 }, fx: g => g.rep('law', 2) },
  };
  SBR.rollOmen = () => {
    const r = SBR.run; if (!r || r.omen) return;
    const k = SBR.util.pick(Object.keys(SBR.OMENS)); const O = SBR.OMENS[k];
    r.omen = k;
    const g = SBR.game && SBR.game._debug && SBR.game._debug.G;
    if (g) { try { O.fx(g); } catch (e) { console.warn('[omen]', e); } }
    if (SBR.campaign) SBR.campaign.deed('omen:' + k, `Omen of the race: ${O.name}.`);
    setTimeout(() => { try { SBR.toast(`<div><b>OMEN — ${O.name}</b><br><small>${O.text}</small></div>`, 'whisper'); } catch (e) { /* no toasts yet */ } }, 400);
  };
})();

/* ================= Routes: a fork at the start of every act ================= */
(() => {
  const S = SBR.STORY, CQ = SBR.CONSEQ;
  /** beat: a scene that joins the act; bonus applies to the whole act; req(g) gates the choice */
  SBR.ROUTES = {
    1: [
      { id: 'trail', label: 'Ride the main trail with the pack', text: 'Safety in numbers. Everyone sees you, and everyone sees what you do.', beat: 'st_poco', rep: { racers: 1 } },
      { id: 'palm', label: 'Cut across the edge of the Devil’s Palm', text: 'The ground is wrong out there, and faster. Things that ride it come back changed. (+8 pace, +15% XP this act, +1 Threat.)', beat: 'st_sandrun', pace: 8, threat: 1, bonus: { xp: 0.15 } },
      { id: 'rail', label: 'Follow the railway and the marshals', text: 'Slower, but lawmen patrol the line. (−6 pace, −1 Threat, shops 10% cheaper this act.)', beat: 'st_steel', pace: -6, threat: -1, rep: { law: 1 }, bonus: { discount: 0.1 } },
    ],
    2: [
      { id: 'pass', label: 'Take the high pass', text: 'Snow and thin air, and the shortest way over. (+8 pace, Short Rests heal 25% less.)', beat: 'st_diego_mother', pace: 8, bonus: { restHeal: -0.25 } },
      { id: 'canyon', label: 'Follow the canyon villages', text: 'Slower, full of strangers, and full of trouble. (+30% money this act.)', beat: ['st_nicholas', 'st_zombiehorse'], pace: -4, bonus: { money: 0.3 } },
      { id: 'mines', label: 'Ride the mining road', text: 'The miners sell cheap, and Naples’ agents buy their dynamite here. (Shops 15% cheaper, +1 Threat.)', beat: ['st_marco', 'st_zombiehorse'], threat: 1, bonus: { discount: 0.15 } },
    ],
    3: [
      { id: 'plains', label: 'Cross the open plains', text: 'Sandman’s people’s country. Treat it well. (Natives +1, +1 encounter card.)', beat: ['st_golden', 'st_nicholas'], rep: { natives: 1 }, bonus: { cards: 1 } },
      { id: 'city', label: 'Ride through Kansas City', text: 'Telegraphs, newspapers, Lucy Steel, and the President’s agents. (+1.5 Threat, +20% XP.)', beat: ['st_lucy_secret', 'st_diego_mother'], threat: 1.5, bonus: { xp: 0.2 } },
      { id: 'river', label: 'Take a riverboat down the Missouri ($30)', text: 'Pay the fare and save your horses. (+12 pace, party heals 30%.)', beat: ['st_tim_rope', 'st_golden'], cost: 30, pace: 12, heal: 0.3 },
    ],
    4: [
      { id: 'lake', label: 'Hug the Lake Michigan shore', text: 'Cold and quiet. (−1 Threat, Short Rests heal 20% more.)', beat: ['st_weka_exile', 'st_axl_chapel', 'st_sugar'], threat: -1, bonus: { restHeal: 0.2 } },
      { id: 'chicago', label: 'Ride through Chicago', text: 'Casinos, hotels, the First Lady. Money moves fast here. (+25% money, +1 Threat.)', beat: 'st_corpse_map', threat: 1, bonus: { money: 0.25 } },
      { id: 'woods', label: 'Cut through the north woods', text: 'Bears, snow, and old sins. (+6 pace.)', beat: ['st_hp_brother', 'st_axl_chapel', 'st_corpse_map'], pace: 6 },
    ],
    5: [
      { id: 'philly', label: 'Search Philadelphia for the Heart', text: 'The Saint is in this city somewhere. So is everyone who wants it. (+1 Threat.)', beat: 'st_heart', threat: 1 },
      { id: 'coast', label: 'Ride the Atlantic sand', text: 'Long straight beaches, good for horses and for thinking. (+8 pace.)', beat: ['st_ballbreaker', 'st_lovetrain_omen'], pace: 8 },
      { id: 'hotel', label: 'Go to the President’s hotel', text: 'Straight into his shadow. (+2 Threat, −1 President.)', beat: 'st_steven', threat: 2, rep: { president: -1 } },
    ],
  };
  const addBeat = (act, id) => {
    const r = SBR.run, L = r.lineup && r.lineup[act], A = SBR.ACTS[act];
    if (!L || !S[id] || Object.values(L.story || {}).includes(id)) return;
    L.story = L.story || {};
    for (let st = 2; st <= A.stages - 1; st++) if (!L.story[st] && st >= (r.stage || 1)) { L.story[st] = id; return; }
    // no free stage: replace the latest optional beat
    const core = L.core || [];
    const opt = Object.keys(L.story).map(Number).sort((a, b) => b - a).find(st => !core.includes(L.story[st]));
    if (opt) L.story[opt] = id;
  };
  SBR.chooseRoute = (act, id, g) => {
    const R = (SBR.ROUTES[act] || []).find(x => x.id === id); if (!R) return;
    const r = SBR.run; r.routeOf = Object.assign({}, r.routeOf, { [act]: id });
    if (R.pace) g.pace(R.pace);
    if (R.threat) g.threat(R.threat);
    if (R.heal) g.healAll(R.heal);
    Object.entries(R.rep || {}).forEach(([f, n]) => g.rep(f, n));
    const gg = g; const ok = id => S[id] && (!S[id].when || SBR.lineupSafe(() => S[id].when(gg), false));
    const beat = [].concat(R.beat || []).find(ok);
    if (beat) addBeat(act, beat);
  };
  /** route bonuses and faction standing both feed the run's passive bonuses */
  const base = SBR.bonus;
  SBR.bonus = () => {
    const b = base();
    const r = SBR.run; if (!r) return b;
    const add = o => Object.entries(o || {}).forEach(([k, v]) => { b[k] = (b[k] || 0) + v; });
    const R = r.routeOf && (SBR.ROUTES[r.act] || []).find(x => x.id === r.routeOf[r.act]);
    if (R && !r.area) add(R.bonus);
    const w = r.world && r.world.rep; if (!w) return b;
    if (w.law >= 3) add({ discount: 0.1 }); else if (w.law <= -3) add({ discount: -0.15 });
    if (w.racers >= 3) add({ paceStage: 1 }); else if (w.racers <= -3) add({ paceStage: -1 });
    if (w.natives >= 3) add({ restHeal: 0.25 });
    if (w.naples >= 3) add({ spinDmg: 0.05 });
    if (w.vatican >= 3) add({ heal: 0.1 });
    if (w.president >= 3) add({ money: 0.15 });
    return b;
  };
  // each act intro offers the fork; lines stay as they are, the choice comes after
  for (let act = 1; act <= 5; act++) {
    const id = 'act' + act + '_intro', sc = S[id]; if (!sc) continue;
    sc.choices = SBR.ROUTES[act].map(R => ({ label: R.label + (R.cost ? ` ($${R.cost})` : ''), cost: R.cost ? { money: R.cost } : undefined,
      ok: { text: R.text, fx: g => SBR.chooseRoute(act, R.id, g) } }));
    SBR.ROUTES[act].forEach((R, i) => { CQ['scene:' + id + ':' + i] = { rep: Object.assign({}, R.rep || {}), deed: `${SBR.ACTS[act].name}: ${R.label.replace(/ \(.*\)$/, '')}.`, flag: 'route_' + R.id }; });
  }
})();

/* ================= Act intros: progress guarantees and rumours of the road ahead ================= */
(() => {
  const S = SBR.STORY, M = SBR.manga;
  const NEED = { 2: ['tusk1'], 3: ['tusk1'], 4: ['tusk1', 'golden', 'tusk2'], 5: ['tusk1', 'golden', 'tusk2', 'tusk3'], 6: ['tusk1', 'golden', 'tusk2', 'tusk3'] };
  /** a skipped beat must never leave Johnny or Gyro without the powers the later acts assume */
  SBR.ensureProgress = act => {
    const f = SBR.run.flags; const need = (NEED[act] || []).slice();
    // Mountain Tim, left to ride alone, reaches Kansas City without you
    if (act === 3 && f.timAlone && !f.timGuardsLucy && !f.timWarned && !M.inParty('mountaintim') && SBR.run.lead !== 'mountaintim' && !f.lucyCaptured && !f.lucySafe) {
      f.lucyCaptured = true; f.timDiedAlone = true;
      SBR.campaign.npc('mountaintim', 'dead'); SBR.campaign.npc('lucy', 'captured');
      SBR.campaign.deed('tim_died_alone', 'Mountain Tim died alone in Kansas City, and Lucy Steel was taken.');
      SBR.campaign.reveal('scene:st_tim:3', 'Riding alone, Mountain Tim died in Kansas City. Lucy Steel was taken.');
      SBR.campaign.reveal('skip:st_tim', 'Riding alone, Mountain Tim died in Kansas City. Lucy Steel was taken.');
      SBR.campaign.later('lucy_letter', 5, 10, 'tim_died_alone');
    }
    if (act === 6 && (f.valDead || f.knight)) need.push('ballbreaker', 'tusk4');
    const miss = need.filter(k => !f[k]);
    miss.forEach(k => { f[k] = true; });
    if (miss.length) SBR.toast(`<div><b>On the road, things fell into place.</b><br><small>${miss.map(k => ({ tusk1: 'Tusk ACT1 stirs', tusk2: 'Tusk ACT2', tusk3: 'Tusk ACT3', tusk4: 'Tusk ACT4', golden: 'the Golden Rectangle', ballbreaker: 'Ball Breaker' }[k])).join(', ')}</small></div>`, 'good');
  };
  for (let act = 1; act <= 6; act++) {
    const sc = S['act' + act + '_intro']; if (!sc) continue;
    const fx = sc.fx, prevVariants = sc.variants;
    sc.fx = g => { SBR.ensureProgress(act); if (fx) fx(g); };
    sc.variants = () => {
      const r = SBR.run; if (!r) return null;
      const base = (prevVariants && prevVariants()) || (sc.leadLines && sc.leadLines[r.lead]) || sc.lines;
      const extra = [];
      if (act === 1 && r.omen && SBR.OMENS[r.omen]) extra.push({ narr: `OMEN — ${SBR.OMENS[r.omen].name}. ${SBR.OMENS[r.omen].text}`, mood: 'menace' });
      const L = r.lineup && r.lineup[act];
      const V = L && (SBR.LINEUPS[act] || []).find(v => v.id === L.id);
      if (V && V.rumor) extra.push({ narr: `Word on the trail: ${V.rumor}` });
      if (act > 1 && r.skippedBeats && r.skippedBeats.length) extra.push({ narr: `Behind you: ${r.skippedBeats.length} thing${r.skippedBeats.length > 1 ? 's' : ''} you rode past. Some of them are still following.` });
      if (act < 6) extra.push({ narr: 'The road forks ahead.' });
      return base.concat(extra);
    };
  }
})();

/* ================= The world answers: encounters that only appear when a faction loves or hates you ================= */
(() => {
  const CQ = SBR.CONSEQ, rep = f => SBR.manga.rep(f);
  const ev = (o, C) => { SBR.EVENTS.push(Object.assign({ type: 'event', icon: 'question', weight: 6, once: true, pace: -2, worldState: true }, o));
    C.forEach((c, i) => { if (!c) return; const { fail, ...ok } = c; CQ[o.id + ':' + i] = ok; if (fail) CQ[o.id + ':' + i + ':fail'] = fail; }); };
  const W = () => SBR.campaign.world();
  ev({ id: 'ws_posse', acts: [1, 2, 3, 4, 5, 6], type: 'recruit', title: 'The Marshal’s Posse', blurb: 'Lawmen tip their hats. They know your name.', icon: 'recruit', art: 'marshal',
    cond: g => rep('law') >= 3 || (SBR.run.omen === 'lawman' && rep('law') >= 2),
    text: 'A federal marshal and six deputies fall in beside you. "Word is you’ve been doing the law’s work out here. The President’s men are ahead. We ride that way anyway."',
    choices: [
      { label: 'Ride with the posse', ok: { text: 'For the next three fights, deputies open fire from the ridge before you do.', fx: g => { W().posse = 3; } } },
      { label: 'Ask them to clear the road', ok: { text: 'They ride ahead and make arrests. (−2 Threat.)', fx: g => g.threat(-2) } },
      { label: 'Ask for supplies', ok: { text: 'Army rations and a box of cartridges. (Party heals 40%, +3 Gunpowder.)', fx: g => { g.healAll(0.4); g.mat('powder', 3); } } },
    ] }, [
    { rep: { law: 1 }, deed: 'Rode with a federal marshal’s posse.' },
    { rep: { law: 1, president: -1 }, deed: 'Sent the marshal’s posse to clear the road.' },
    { rep: { law: 1 }, deed: 'Took supplies from the marshal’s posse.' },
  ]);
  ev({ id: 'ws_wanted', acts: [1, 2, 3, 4, 5, 6], type: 'elite', title: 'Wanted: Dead or Alive', blurb: 'Your face on a poster, and men who read it.', icon: 'skull', art: 'bounty', pace: -3,
    cond: g => rep('law') <= -3,
    text: 'Bounty hunters. Four of them, with your poster folded in a hatband. "Nothing personal. You’re worth two hundred dollars."',
    choices: [
      { label: 'Fight them', ok: { text: 'They came for money, not a fight.', fight: { random: true, elite: true, after: g => g.money(40) } } },
      { label: 'Pay them more to forget you ($70)', cost: { money: 70 }, ok: { text: 'They tear up the poster. It won’t be the last one. (+1 Law.)', fx: g => g.rep('law', 1) } },
      { label: 'Turn yourself in, then escape (LUCK)', check: { stat: 'luck', dc: 14 }, ok: { text: 'One night in a cell, one loose bar, and the sheriff’s best horse. (+10 pace.)', fx: g => g.pace(10) }, fail: { text: 'The bars hold. You pay a fine to get out. (−$50, −8 pace.)', fx: g => { g.money(-50); g.pace(-8); } } },
    ] }, [
    { rep: { law: -1 }, deed: 'Shot it out with bounty hunters.' },
    { rep: { law: 1 }, deed: 'Paid off bounty hunters.' },
    { rep: { law: -1 }, deed: 'Broke out of a sheriff’s cell.', fail: { deed: 'Paid a sheriff’s fine to get out of a cell.', rep: { law: 1 } } },
  ]);
  ev({ id: 'ws_guides', acts: [1, 2, 3, 4], type: 'event', title: 'Runners of the Plains', blurb: 'Two barefoot runners wave you off the road.', icon: 'horseshoe', art: 'whisperer', pace: 0,
    cond: g => rep('natives') >= 3,
    text: '"Sandman’s people remember you. There is a way through here that no map has." They are already running.',
    choices: [
      { label: 'Follow them', ok: { text: 'Dry creek beds, hidden springs, no one else. (+20 pace.)', fx: g => g.pace(20) } },
      { label: 'Camp with them', ok: { text: 'Roots and bitter tea. Everyone sleeps. (Full heal, all Exhaustion removed.)', fx: g => { g.healAll(1); g.unexhaust(9); } } },
    ] }, [
    { rep: { natives: 1 }, deed: 'Followed Sandman’s people on a road no map has.' },
    { rep: { natives: 1 }, deed: 'Camped with Sandman’s people.' },
  ]);
  ev({ id: 'ws_warparty', acts: [1, 2, 3, 4], type: 'elite', title: 'Arrows at Dusk', blurb: 'An arrow in your saddle. A warning.', icon: 'skull', art: 'whisperer', pace: -3,
    cond: g => rep('natives') <= -3,
    text: 'An arrow thuds into your saddle horn. On the ridge, riders who know exactly what you did on their land.',
    choices: [
      { label: 'Fight', ok: { text: 'They came to be seen, and now they are fighting.', fight: { random: true, elite: true } } },
      { label: 'Ride out with your hands up and offer everything you have ($50)', cost: { money: 50 }, ok: { text: 'They take it, and let you pass. It isn’t forgiveness. (+2 Natives.)', fx: g => g.rep('natives', 2) } },
    ] }, [
    { rep: { natives: -1 }, deed: 'Fought a war party on their own land.' },
    { rep: { natives: 1 }, deed: 'Paid a war party to let you pass.' },
  ]);
  ev({ id: 'ws_safehouse', acts: [3, 4, 5, 6], type: 'rest', title: 'A Vatican Safehouse', blurb: 'A candle in a window, and a cross painted on the shutter.', icon: 'fire', art: 'abbess', pace: -1,
    cond: g => rep('vatican') >= 3,
    text: 'An abbess opens the door before you knock. "Rome sends its thanks for what you carry, and for what you did not do with it."',
    choices: [
      { label: 'Rest here', ok: { text: '(Full heal, all Exhaustion removed.)', fx: g => { g.healAll(1); g.unexhaust(9); } } },
      { label: 'Ask for her blessing', ok: { text: 'Holy water on your brow. (Party +1 RESOLVE.)', fx: g => g.statUpAll('res', 1) } },
    ] }, [
    { rep: { vatican: 1 }, deed: 'Rested at a Vatican safehouse.' },
    { rep: { vatican: 1 }, deed: 'Took an abbess’s blessing.' },
  ]);
  ev({ id: 'ws_inquisition', acts: [3, 4, 5, 6], type: 'elite', title: 'The Inquisitor', blurb: 'A man in red at the crossroads.', icon: 'skull', art: 'inquisitor', pace: -3,
    cond: g => rep('vatican') <= -3,
    text: '"You carry the Saint and treat the Church as an enemy. Rome has sent me to correct one of those things."',
    choices: [
      { label: 'Fight him', ok: { text: '', fight: { enemies: SBR.ENEMIES.t_inquisitor ? ['t_inquisitor', 'soldier'] : ['soldier', 'soldier', 'outlaw'], elite: true } } },
      { label: 'Surrender a Corpse Part', req: g => SBR.manga.holyCount() > 0, reqText: 'You carry no Corpse Parts', ok: { text: 'He wraps it in linen and leaves without another word. (+3 Vatican.)', fx: g => { const r = SBR.run; const k = Object.keys(r.mats).filter(x => SBR.MATERIALS[x] && SBR.MATERIALS[x].holy && r.mats[x] > 0); g.loseCorpse(k.slice(1)); g.rep('vatican', 3); } } },
    ] }, [
    { rep: { vatican: -1 }, deed: 'Fought a Vatican inquisitor at a crossroads.' },
    { flag: 'gaveVatican', deed: 'Surrendered a Corpse Part to a Vatican inquisitor.' },
  ]);
  ev({ id: 'ws_racerscamp', acts: [2, 3, 4, 5, 6], type: 'event', title: 'The Racers’ Camp', blurb: 'Racers wave you over to their fire.', icon: 'fire', art: 'sloop', pace: -1,
    cond: g => rep('racers') >= 3,
    text: 'Sloop John B, Nellyville, Dixie Chicken and a dozen more. "Here’s the one who keeps helping people!" Somebody hands you a plate.',
    choices: [
      { label: 'Trade stories and routes', ok: { text: 'Everyone knows a shortcut. (+15 pace.)', fx: g => g.pace(15) } },
      { label: 'Pool your supplies', ok: { text: '(Party heals 50%, a random item.)', fx: g => { g.healAll(0.5); g.itemRandom(); } } },
      { label: 'Ask who’s been paid to hurt racers', ok: { text: 'They name names. (−1.5 Threat.)', fx: g => g.threat(-1.5) } },
    ] }, [
    { rep: { racers: 1 }, deed: 'Traded routes at the racers’ camp.' },
    { rep: { racers: 1 }, deed: 'Pooled supplies with the other racers.' },
    { rep: { racers: 1, president: -1 }, deed: 'Learned which racers the President had paid.' },
  ]);
  ev({ id: 'ws_sabotage', acts: [2, 3, 4, 5, 6], type: 'event', title: 'A Cut Girth', blurb: 'Your saddle strap has been sliced most of the way through.', icon: 'horseshoe', pace: -2,
    cond: g => rep('racers') <= -3,
    text: 'Somebody got to your saddle in the night. The other racers are very busy looking elsewhere.',
    choices: [
      { label: 'Find who did it', ok: { text: 'Two racers, and neither is sorry.', fight: { enemies: ['rival_racer', 'rival_racer', 'outlaw'], after: g => g.money(30) } } },
      { label: 'Fix it and ride (−10 pace)', ok: { text: '', fx: g => g.pace(-10) } },
    ] }, [
    { rep: { racers: -1 }, deed: 'Fought racers who cut your saddle girth.' },
    { deed: 'Repaired a sabotaged saddle.', rep: { racers: 0 }, flag: 'sabotaged' },
  ]);
  ev({ id: 'ws_envoy', acts: [2, 3, 4, 5], type: 'event', title: 'The Consul’s Envoy', blurb: 'A carriage with the arms of Naples.', icon: 'crown', art: 'gregorio', pace: -1,
    cond: g => rep('naples') >= 3 && g.inParty('gyro'),
    text: 'An envoy of the Kingdom of Naples, sweating in wool. "His Majesty follows the race with interest. He has sent... encouragement."',
    choices: [
      { label: 'Accept the King’s gift', ok: { text: 'A fine piece of Neapolitan work.', fx: g => g.relicRandom('rare') } },
      { label: 'Ask about Marco', ok: { text: '"The boy is alive. For now." Gyro closes his eyes. (Gyro +1 RESOLVE.)', fx: g => g.statUp('gyro', 'res', 1) } },
    ] }, [
    { rep: { naples: 1 }, deed: 'Accepted a gift from the King of Naples.' },
    { rep: { naples: 1 }, flag: 'marcoAlive', deed: 'Heard from the Naples envoy that Marco was still alive.' },
  ]);
  ev({ id: 'ws_pardon', acts: [3, 4, 5], type: 'event', title: 'A Presidential Offer', blurb: 'A man in a very good coat, and an open briefcase.', icon: 'coin', art: 'agent', pace: -1,
    cond: g => rep('president') >= 2 && SBR.manga.holyCount() > 0,
    text: '"The President has noticed your cooperation. He will pay for every piece of the Saint you are carrying. Handsomely. And he will remember your name, kindly."',
    choices: [
      { label: 'Sell him every Corpse Part', ok: { text: 'The briefcase is heavy. Your saddlebags are light. Gyro won’t look at you.', fx: g => { const n = SBR.manga.holyCount(); g.loseCorpse([]); g.money(120 * n); } } },
      { label: 'Refuse', ok: { text: '"A pity." He closes the briefcase. (+1 Threat.)', fx: g => g.threat(1) } },
    ] }, [
    { rep: { president: 3, vatican: -3, naples: -2 }, flag: 'soldCorpse', deed: 'Sold the Saint’s remains to the President.' },
    { rep: { president: -2 }, deed: 'Refused to sell the Saint to the President.' },
  ]);
  ev({ id: 'ws_marksmen', acts: [3, 4, 5, 6], type: 'elite', title: 'The President’s Best', blurb: 'Three glints on three ridges.', icon: 'skull', art: 'agent', pace: -3,
    cond: g => rep('president') <= -4,
    text: 'You have made the President truly angry. These are not hired guns. They are his.',
    choices: [
      { label: 'Fight', ok: { text: '', fight: { enemies: ['pres_sniper', 'pres_sniper', 'vguard'], elite: true, after: g => g.money(60) } } },
      { label: 'Go to ground for a day (−15 pace)', ok: { text: '', fx: g => { g.pace(-15); g.threat(-1); } } },
    ] }, [
    { rep: { president: -1 }, deed: 'Fought the President’s own marksmen.' },
    { deed: 'Hid from the President’s marksmen for a day.', rep: { racers: -1 } },
  ]);
})();

/* ================= Fights remember the story ================= */
(() => {
  const base = SBR.campaignFightFlags;
  SBR.campaignFightFlags = (c, note, any, P) => {
    const ids = c.enemies().map(e => e.id), bases = ids.map(i => SBR.ENEMY_BASE[i]).filter(Boolean);
    const any2 = list => any(list) || list.some(i => bases.includes(i));
    if (base) base(c, note, any2, P);
    const f = SBR.run.flags, w = SBR.campaign.world(), E = () => c.enemies();
    const st = (u, s, n, t) => c.addStatus(u, s, n, t, true);
    if (w.posse > 0) { w.posse--; E().forEach(e => { st(e, 'vuln', 0, 1); st(e, 'marked', 0, 2); }); note('The marshal’s posse opens fire from the ridge.'); }
    if (f.robinsonBurned && any2(['robinson'])) { E().forEach(e => st(e, 'weak', 0, 2)); note('Half of Mrs. Robinson’s hive burned with his garden.'); }
    if (f.oyeDefused && any2(['oyecomova'])) { E().forEach(e => st(e, 'weak', 0, 2)); note('You pulled his pins. He is fighting with nothing primed.'); }
    if (f.porkpieCut && any2(['porkpie'])) { E().forEach(e => st(e, 'marked', 0, 3)); note('His lines are cut. There is nowhere to hide in the rocks.'); }
    if (f.ringoLesson && any2(['ringo'])) { P.forEach(u => st(u, 'calm', 0, 3)); note('You understand the Man’s World. Six seconds won’t shake you.'); }
    if (f.balloonsPopped && any2(['mikeo'])) { P.forEach(u => st(u, 'guard', 0, 2)); note('Half the balloons burst before they came home.'); }
    if (f.discoStill && any2(['disco'])) { E().forEach(e => st(e, 'weak', 0, 2)); note('He had to come to you. He hates that.'); }
    if (f.flagShot && any2(['valentine1'])) { E().forEach(e => st(e, 'vuln', 0, 2)); note('The flag he hides behind is torn.'); }
    if (f.valentineUnhurt && any2(['lovetrain', 'valentine1'])) { E().filter(e => e.tier === 'boss').forEach(e => st(e, 'empower', 0, 2)); note('Valentine was never hurt at Independence Hall.'); }
    if (f.heardNapkin && any2(['lovetrain', 'valentine1'])) { P.forEach(u => st(u, 'calm', 0, 2)); note('You heard his speech. It doesn’t move you now.'); }
    if (f.lucySabotage && any2(['lovetrain', 'valentine1'])) { E().filter(e => e.tier === 'boss').forEach(e => st(e, 'weak', 0, 2)); note('Lucy is a bad vessel, on purpose.'); }
    if (f.lucyCaptured && any2(['lovetrain', 'valentine1'])) { E().filter(e => e.tier === 'boss').forEach(e => st(e, 'shield', 20, 0)); note('The Saint’s vessel is in the President’s hands.'); }
    if (f.sandmanGrudge && any2(['sandman'])) { E().forEach(e => st(e, 'empower', 0, 2)); note('Sandman remembers who reported him.'); }
    if (f.diegoEyes && any2(['diego_rival', 'diego_world'])) { E().filter(e => /diego/.test(e.id)).forEach(e => st(e, 'lucky', 0, 2)); note('Diego sees through stone with the Saint’s Eyes.'); }
    if ((f.diegoPitied || f.diegoRespect) && any2(['diego_world'])) { P.forEach(u => st(u, 'lucky', 0, 2)); note('Some Diego, in some world, remembers you were fair.'); }
    if (f.buriedGuilt && any2(['axl'])) { P.filter(u => u.id === 'johnny').forEach(u => st(u, 'guilt', 2, 0)); note('Nicholas is still buried. Civil War digs him up.'); }
    if (f.leftArmLost && any2(['ferdinand'])) { P.filter(u => u.id === 'johnny').forEach(u => st(u, 'fossil', 1, 0)); note('Without the Left Arm, the fossils take you too.'); }
    if (f.manWorld && any2(['sandman', 'blackmore'])) { P.filter(u => u.id === 'gyro').forEach(u => st(u, 'empower', 0, 2)); note('Gyro walked the Man’s World. He fights like it.'); }
    if (SBR.campaign.repOf('law') >= 4 && c.opts && c.opts.boss) { P.forEach(u => st(u, 'guard', 0, 1)); note('Deputies hold the flanks. The Law is on your side.'); }
  };
})();

/* ================= How dangerous each beat looks on its card (main.js reads s.stars) ================= */
(() => {
  const S = SBR.STORY;
  const set = (n, ids) => ids.forEach(id => { if (S[id] && S[id].stars == null) S[id].stars = n; });
  set(4, ['st_ringo', 'st_blackmore', 'st_sandman', 'st_ferdinand', 'st_wekapipo', 'st_axl', 'st_valentine']);
  set(3, ['st_robinson', 'st_boom', 'st_oyecomova', 'st_leftarm', 'st_porkpie', 'st_tattoo', 'st_mikeo', 'st_disco', 'st_hotpants', 'st_gasoline', 'st_bridge']);
  set(2, ['st_tim_rope', 'st_corpse_map', 'st_heart', 'st_ballbreaker', 'st_sugar', 'st_trinity']);
  set(1, ['st_tim', 'st_marco', 'st_poco', 'st_sandrun', 'st_steel', 'st_zombiehorse', 'st_diego_mother', 'st_nicholas', 'st_lucy_secret', 'st_golden', 'st_weka_exile', 'st_hp_brother', 'st_axl_chapel', 'st_steven', 'st_lovetrain_omen']);
})();
