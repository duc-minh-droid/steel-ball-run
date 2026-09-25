/* Steel Ball Run canon: the other racers, the side stories of the manga told as encounters, and the objects that
   matter in them. Every choice here writes to the campaign (SBR.CONSEQ), and several come back later. */
'use strict';

/* ---------------- Racers: portraits, the leaderboard, a couple of rival fights ---------------- */
SBR.art.addPortrait({
  sloop:      { skin: '#e8c0a0', hair: '#3a2a1a', hairStyle: 'shaggy', hat: 'bandana', hatColor: '#2a4a8a', hat2: '#f6ecd8', outfit: '#2a4a8a', outfit2: '#f6ecd8', eye: '#3a6a9a', lip: '#a06050', bg: ['#2a4a8a', '#9fc7e8'], extra: 'beard' },
  georgy:     { skin: '#f6d8c0', hair: '#c8603a', hairStyle: 'curls', hat: 'cap', hatColor: '#3a8c4a', hat2: '#f2c14e', outfit: '#3a8c4a', outfit2: '#c8323c', eye: '#3a8c4a', lip: '#c07070', bg: ['#3a8c4a', '#f6ecd8'] },
  nellyville: { skin: '#8a5a3a', hair: '#1a1020', hairStyle: 'short', hat: 'cowboy', hatColor: '#e8d8b8', hat2: '#c8323c', outfit: '#e8d8b8', outfit2: '#c8323c', eye: '#3a2a1a', lip: '#6a3a2a', bg: ['#c8323c', '#e8d8b8'], extra: 'scarf' },
  gaucho:     { skin: '#d8a880', hair: '#1a1020', hairStyle: 'long', hat: 'cowboy', hatColor: '#1a1020', hat2: '#c8323c', outfit: '#c8323c', outfit2: '#f2c14e', eye: '#3a2a1a', lip: '#8a4a3a', bg: ['#6aa0c8', '#f6ecd8'], extra: 'mustache' },
  mackknife:  { skin: '#e8c8b0', hair: '#1a1020', hairStyle: 'swept', hat: 'bowler', hatColor: '#3a2a3a', hat2: '#c8323c', outfit: '#3a2a3a', outfit2: '#c8c8d8', eye: '#6a2a2a', lip: '#8a4a4a', bg: ['#3a2a3a', '#c8c8d8'], extra: 'scar' },
  dixie:      { skin: '#f6d0b8', hair: '#f2c14e', hairStyle: 'bob', hat: 'cowboy', hatColor: '#e8508a', hat2: '#fff', outfit: '#e8508a', outfit2: '#fff', eye: '#3a8ad0', lip: '#e0506a', bg: ['#f2c14e', '#e8508a'] },
  babayaga:   { skin: '#e0c8b0', hair: '#c8c8c8', hairStyle: 'verylong', hat: 'bandana', hatColor: '#6a2a4a', hat2: '#f2c14e', outfit: '#3a2a4a', outfit2: '#6a2a4a', eye: '#8a3a8a', lip: '#8a5a6a', bg: ['#1a1020', '#8a3a8a'], extra: 'grin' },
  // Norisuke: small dark spectacles, short beard, cropped hair in patches, a jacket of chainmail-like patches
  norisuke:   { skin: '#f0d0a8', hair: '#3a3a3a', hairStyle: 'patchy', hat: null, outfit: '#8a8a7a', outfit2: '#c8c0a0', eye: '#1a1020', lip: '#a06050', bg: ['#f6ecd8', '#c8323c'], facial: 'shortbeard', special: 'norisuke' },
  urmd:       { skin: '#8a5a3a', hair: '#1a1020', hairStyle: 'short', hat: 'bandana', hatColor: '#e8742a', hat2: '#f2c14e', outfit: '#c8323c', outfit2: '#f2c14e', eye: '#3a2a1a', lip: '#5a2a1a', bg: ['#e8742a', '#f2c14e'], extra: 'goldteeth' },
  roocatugo:  { skin: '#f0c8a8', hair: '#8a6a4a', hairStyle: 'bald', hat: 'aviator', hatColor: '#6a4a2a', hat2: '#c8c8d8', outfit: '#6a4a2a', outfit2: '#f2c14e', eye: '#3a3a3a', lip: '#a05a5a', bg: ['#8a8aa0', '#f2c14e'], extra: 'mustache' },
  // Dot Han: shaved scalp with a narrow front mohawk and a ponytail, a cut-out band low on the forehead, yellow riding jacket
  dothan:     { skin: '#d8a070', hair: '#8a7a6a', hairStyle: 'dothan', hat: 'dotband', hatColor: '#1a1020', hat2: '#e8742a', outfit: '#f2c14e', outfit2: '#d8502a', eye: '#3a2a1a', lip: '#8a4a3a', bg: ['#c8a070', '#3a3a3a'], face: 'broad', eyes: 'small', brows: 'thick', special: 'dothan' },
  scarlet:    { skin: '#fbe0cc', hair: '#c8a040', hairStyle: 'verylong', hat: 'ribbon', hatColor: '#c8323c', hat2: '#f2c14e', outfit: '#c8323c', outfit2: '#f6ecd8', eye: '#3a6a3a', lip: '#c8323c', bg: ['#c8323c', '#f6ecd8'] },
});
SBR.RIVALS.norisuke.name = 'Norisuke Higashikata';
SBR.RIVALS.norisuke.portrait = 'norisuke';
SBR.RIVALS.dothan.portrait = 'dothan';
Object.assign(SBR.RIVALS, {
  sloop: { name: 'Sloop John B', portrait: 'sloop', speed: 0.84 },
  georgy: { name: 'Georgy Porgy', portrait: 'georgy', speed: 0.8 },
  nellyville: { name: 'Nellyville', portrait: 'nellyville', speed: 0.83 },
  gaucho: { name: 'Gaucho', portrait: 'gaucho', speed: 0.86, out: r => r.act > 3 && !r.flags.gauchoSaved },
  mackknife: { name: 'Mack the Knife', portrait: 'mackknife', speed: 0.85 },
  dixie: { name: 'Dixie Chicken', portrait: 'dixie', speed: 0.84 },
  babayaga: { name: 'Baba Yaga', portrait: 'babayaga', speed: 0.83 },
});
(() => {
  const port = key => ({ kind: 'portrait', key });
  Object.assign(SBR.ENEMIES, {
    mack_knife: { name: 'Mack the Knife', title: 'Racer No. 0773', art: port('mackknife'), hp: 58, stats: { aim: 8, ride: 7 }, xp: 22, money: [30, 45], tier: 'elite', dtype: 'bleed', res: { bleed: -0.3, bullet: 0.1 },
      passive: 'Throws knives from the saddle. Every cut makes the next one easier.',
      abilities: [{ name: 'Saddle Knife', w: 3, target: 'enemy', fx: 'hit', run: x => { const r = x.dmg(x.target, 6, { aim: 0.04 }); if (r.hit) x.status(x.target, 'bleed', 2); } },
        { name: 'Fan of Blades', w: 2, cd: 3, target: 'allEnemies', fx: 'spray', run: x => x.enemies.forEach(e => { x.dmg(e, 3, {}, { dtype: 'bleed' }); x.status(e, 'bleed', 1); }) }] },
    dixie_gun: { name: 'Dixie Chicken', title: 'Racer No. 1102', art: port('dixie'), hp: 50, stats: { aim: 9, luck: 6 }, xp: 20, money: [30, 45], tier: 'elite', dtype: 'bullet', res: { bullet: -0.2 },
      passive: 'Trick shooter from Georgia. She never misses twice.',
      abilities: [{ name: 'Trick Shot', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 7, { aim: 0.04 }) },
        { name: 'Ricochet', w: 2, cd: 2, target: 'allEnemies', fx: 'gun', run: x => x.enemies.forEach(e => x.dmg(e, 3, { aim: 0.02 })) }] },
  });
  Object.assign(SBR.DROPS, { mack_knife: [['bone', 0.6, 1, 2], ['leather', 0.5, 1, 1]], dixie_gun: [['powder', 0.8, 1, 2], ['silver', 0.3, 1, 1]] });
})();

/* ---------------- Encounters ---------------- */
(() => {
  const E = [];
  /** add an event and its consequences in one go: C[i] belongs to choices[i]; C[i].fail to its failed check */
  const ev = (o, C) => {
    E.push(Object.assign({ type: 'event', icon: 'question', weight: 3, once: true, pace: -2 }, o));
    C.forEach((c, i) => { if (!c) return; const { fail, ...ok } = c; SBR.CONSEQ[o.id + ':' + i] = ok; if (fail) SBR.CONSEQ[o.id + ':' + i + ':fail'] = fail; });
  };

  /* ===== Act I: San Diego to Monument Valley ===== */
  ev({ id: 'sbr_steel', acts: [1], title: 'Mr. Steel\'s Press Tent', blurb: 'The organiser of the race, surrounded by reporters.', icon: 'flag', art: 'steven', weight: 4, pace: -1,
    cond: g => SBR.run.stage <= 3,
    text: 'Steven Steel shakes hands with anyone holding a camera. Three thousand eight hundred and fifty-two riders, a twelve-hundred-dollar entry fee, fifty million to the winner. Behind him, a girl of fourteen is holding his hat: his wife, Lucy.',
    choices: [
      { label: 'Give an interview ($20 for the photographer)', cost: { money: 20 }, ok: { text: 'Your face is on the front page in three states. Somebody in Washington cuts it out and pins it to a wall.', fx: g => g.pace(4) } },
      { label: 'Talk to Lucy instead', ok: { text: '"Everyone says he\'s a fool," she says. "He isn\'t. He\'s just brave in a way that looks silly." She remembers your name.', fx: g => { g.npc('lucy', 'friend'); g.xp(10); } } },
      { label: 'Pick the pockets of the crowd (LUCK)', check: { stat: 'luck', dc: 12 }, ok: { text: 'Wallets, a ladybug brooch, a pencil. Nobody notices. (+$45, Giorno\'s Ladybug Brooch.)', fx: g => { g.money(45); g.trinket('pocketwatch'); } }, fail: { text: 'A reporter notices. So does a deputy.', fight: { enemies: ['outlaw', 'bandit'] } } },
    ] }, [
    { deed: 'Gave an interview at Mr. Steel\'s press tent.', rep: { racers: 1 } },
    { deed: 'Spoke to Lucy Steel at the start line.', npc: { lucy: 'friend' } },
    { deed: 'Picked pockets at the start line.', rep: { law: -1 }, fail: { deed: 'Was caught picking pockets at the start.', rep: { law: -2 } } },
  ]);
  ev({ id: 'sbr_sandman_pay', acts: [1], title: 'The Runner Who Pays in Stones', blurb: 'A barefoot runner at a trading post counter.', icon: 'star', art: 'sandman',
    text: 'The Native runner who outran the horses on the first day is at the counter, trying to buy boots with an emerald. The shopkeeper stares at it as if it might bite him. "Money," the runner says patiently. "This is money."',
    choices: [
      { label: 'Buy the emerald from him at a fair price ($60)', cost: { money: 60 }, ok: { text: 'He counts the bills twice, nods once. You now own a very large emerald. (Sandman\'s Emerald: sells for $150.)', fx: g => g.trinket('emerald') } },
      { label: 'Tell the shopkeeper to take it', ok: { text: 'The shopkeeper takes the emerald for a pair of boots. The runner looks at you a long time. "You think it is worth nothing too."', fx: g => g.item('jerky') } },
      { label: 'Race him to the next well', check: { stat: 'ride', dc: 14 }, ok: { text: 'You win, barely, on horseback. He laughs. "Then you understand." He tells you where the next water is. (+10 pace.)', fx: g => g.pace(10) }, fail: { text: 'He wins on foot. You don\'t hear the end of it from Gyro.', fx: g => g.pace(-4) } },
    ] }, [
    { deed: 'Paid Sandman a fair price for his emerald.', rep: { natives: 2 }, npc: { sandman: 'friend' } },
    { deed: 'Let a shopkeeper cheat Sandman out of an emerald.', rep: { natives: -2 }, npc: { sandman: 'enemy' } },
    { deed: 'Raced Sandman to the well, and won.', rep: { natives: 1, racers: 1 }, fail: { deed: 'Lost a race to a man on foot.', rep: { natives: 1 } } },
  ]);
  ev({ id: 'sbr_avdul', acts: [1], title: 'The Fortune Teller of the Cacti', blurb: 'A racer called Urmd Avdul, who is having a bad day.', icon: 'star', art: 'urmd', weight: 2, pace: -1,
    text: 'Racer No. 1234, Urmd Avdul, is tangled in a cactus with his horse. "I foresaw this," he says, with dignity. "I simply did not foresee it happening to me."',
    choices: [
      { label: 'Cut him loose', ok: { text: 'He reads your palm in thanks. "You will meet a man who can return six seconds. Do not stand still in front of him."', fx: g => { g.flag('fortuneRingo'); g.xp(8); } } },
      { label: 'Take his spare canteens and ride on', ok: { text: '"This, too, I foresaw," he calls after you.', fx: g => { g.item('canteen'); g.mat('bone', 2); } } },
    ] }, [
    { deed: 'Freed the fortune teller Urmd Avdul from a cactus.', rep: { racers: 1 }, flag: 'fortuneRingo' },
    { deed: 'Robbed Urmd Avdul while he was stuck in a cactus.', rep: { racers: -1 } },
  ]);
  ev({ id: 'sbr_roocatugo', acts: [1, 2], title: 'The Automobile', blurb: 'A racer who entered in a motor car. It has stopped.', icon: 'gear', art: 'roocatugo', weight: 2, pace: -1,
    text: 'Baron Roocatugo is sitting in his motor car in the middle of the desert. "There is nothing in the rules against it," he says. There is also nothing in the desert to put in the tank.',
    choices: [
      { label: 'Tow him to town (−8 pace)', ok: { text: 'He pays in gold coins and gives you his driving goggles as a souvenir. (+$70.)', fx: g => { g.pace(-8); g.money(70); } } },
      { label: 'Strip the car for parts', ok: { text: 'He weeps as you take the brass. (4 Cyborg Scrap, 2 SPW Saddle Leather.)', fx: g => { g.mat('scrap', 4); g.mat('leather', 2); } } },
      { label: 'Sell him a packhorse', ok: { text: 'You sell him a packhorse at four times its value. He is delighted. (+$90.)', fx: g => g.money(90) } },
    ] }, [
    { deed: 'Towed Baron Roocatugo\'s car out of the desert.', rep: { racers: 1 } },
    { deed: 'Stripped Baron Roocatugo\'s car for parts.', rep: { racers: -1, law: -1 } },
    { deed: 'Sold Baron Roocatugo a packhorse at four times the price.', rep: { racers: 0 }, flag: 'soldBaron' },
  ]);
  ev({ id: 'sbr_horseshoe', acts: [1], title: 'The Dented Horseshoe', blurb: 'Mountain Tim is studying tracks by a dead rider.', icon: 'search', art: 'mountaintim',
    cond: g => !SBR.run.flags.timInvestigated && SBR.run.lead !== 'mountaintim',
    text: 'A rider lies dead beside the trail, stung all over. Mountain Tim is crouched over the hoofprints. "Horseshoe with a dent in the left side. And this." He holds up a torn coat button. "Somebody\'s killing racers out here. I mean to know who."',
    choices: [
      { label: 'Help him follow the tracks (SPIN)', check: { stat: 'spin', dc: 12 }, ok: { text: 'The dented shoe leads to a camp full of dead bees. "He\'s ahead of us," Tim says. "But now I know how he fights." (Mrs. Robinson starts his fight Weakened.)', fx: g => { g.flag('timInvestigated'); g.npc('mountaintim', 'friend'); } }, fail: { text: 'You lose the trail in the rocks. Tim rides on alone.', fx: g => g.pace(-3) } },
      { label: 'Give him the button you found near your own camp', ok: { text: 'Tim turns it over. "Same coat." He tips his hat. "I owe you one, stranger."', fx: g => { g.flag('timInvestigated'); g.npc('mountaintim', 'friend'); } } },
      { label: 'Not our business', ok: { text: 'He watches you go. "Everything out here is your business, son. Sooner or later."', fx: g => g.pace(3) } },
    ] }, [
    { deed: 'Tracked a racer-killer with Mountain Tim.', rep: { law: 1 }, flag: 'timInvestigated', npc: { mountaintim: 'friend' }, fail: { deed: 'Lost the killer\'s trail in the rocks.' } },
    { deed: 'Gave Mountain Tim evidence against the racer-killer.', rep: { law: 1 }, flag: 'timInvestigated', npc: { mountaintim: 'friend' } },
    { deed: 'Rode past a murdered racer.', rep: { law: -1 } },
  ]);
  ev({ id: 'sbr_disguise', acts: [1], title: 'A Johnny Who Isn\'t Johnny', blurb: 'Someone who looks like you shot a sheriff\'s deputy.', icon: 'skull', art: 'benjamin',
    cond: g => SBR.run.stage >= 3,
    text: 'A deputy levels a rifle at you. "Witnesses say a blond kid in a star hat shot my partner an hour ago." On the ridge behind him, an old man with iron sand on his fingers is smiling. The Boomboom family is very good at disguises.',
    choices: [
      { label: 'Point at the old man on the ridge (RESOLVE)', check: { stat: 'res', dc: 13 }, ok: { text: 'The deputy turns just in time to see Benjamin Boomboom run. "...I\'ll be damned." He lets you go, and tells the next town you\'re clean.', fx: g => { g.flag('boomExposed'); } }, fail: { text: 'He doesn\'t believe you. Guns come out.', fight: { enemies: ['storm_deputy', 'outlaw'] } } },
      { label: 'Surrender and let the law sort it out (−10 pace)', ok: { text: 'A day in a cell. The real killer is gone, but you have a clean record and a sheriff who owes you an apology. (+1 RESOLVE to the lead.)', fx: g => { g.pace(-10); g.statUp(SBR.run.lead, 'res', 1); } } },
      { label: 'Run', ok: { text: 'Now there are two wanted posters with your face on them.', fx: g => g.pace(4) } },
    ] }, [
    { deed: 'Exposed the Boomboom family\'s disguise to the law.', rep: { law: 2 }, flag: 'boomExposed', fail: { deed: 'Fought a deputy who thought you were a murderer.', rep: { law: -2 } } },
    { deed: 'Spent a night in a cell for a murder you didn\'t commit.', rep: { law: 2 } },
    { deed: 'Fled from a deputy, framed for murder.', rep: { law: -2 }, threat: 0.5 },
  ]);
  ev({ id: 'sbr_tarcoffee', acts: [1, 2], title: 'Gyro Makes Coffee', blurb: 'It is black. It is thick. It smells like the road.', icon: 'fire', art: 'gyro', weight: 2, pace: -2,
    cond: g => g.inParty('gyro'),
    text: 'Gyro boils coffee until it looks like tar and pours it into two tin cups. "Drink it. In Naples we call this breakfast." He sings a song about cheese while it cools.',
    choices: [
      { label: 'Drink it', ok: { text: 'It is terrible. You are extremely awake. (+2 Gyro\'s Tar Coffee.)', fx: g => { g.item('tarcoffee'); g.item('tarcoffee'); } } },
      { label: 'Ask about the cheese song', ok: { text: 'He sings the whole thing. It is about pizza mozzarella. It goes on for some time. (Party +1 RESOLVE... from endurance.)', fx: g => g.statUpAll('res', 1) } },
    ] }, [
    { deed: 'Drank Gyro\'s coffee. All of it.', rep: { naples: 1 } },
    { deed: 'Heard the whole Pizza Mozzarella song.', rep: { naples: 1 } },
  ]);
  ev({ id: 'sbr_photo', acts: [1, 3], title: 'The Photograph of the Mountains', blurb: 'A stage finish in the distance, and a trick.', icon: 'star', art: 'johnny', weight: 2, pace: 0,
    cond: g => SBR.run.stage >= SBR.ACTS[SBR.run.act].stages - 2,
    text: 'Johnny has a photograph of the next ridge. Hold it at arm\'s length and the peaks line up with the real ones: the finish is straight ahead, not around the long bend everyone else is taking.',
    choices: [
      { label: 'Trust the photograph (RIDING)', check: { stat: 'ride', dc: 13 }, ok: { text: 'You cut across the flats and come out ahead of the pack. (+18 pace.)', fx: g => g.pace(18) }, fail: { text: 'The flats are a salt marsh. The horses hate you. (−6 pace.)', fx: g => g.pace(-6) } },
      { label: 'Sell the trick to another racer ($40)', ok: { text: 'Sloop John B pays you in cash and a promise to return the favour.', fx: g => { g.money(40); } } },
    ] }, [
    { deed: 'Found a shortcut using a photograph of the mountains.', rep: { racers: 1 }, fail: { deed: 'Rode into a salt marsh following a photograph.' } },
    { deed: 'Sold a shortcut to Sloop John B.', npc: { sloop: 'friend' }, later: ['sloop_repays', 5, 10] },
  ]);

  /* ===== Act II: the Rockies ===== */
  ev({ id: 'sbr_arimathea', acts: [2], title: 'Joseph of Arimathea\'s Map', blurb: 'A government surveyor is copying a very old map.', icon: 'map', art: 'agent',
    text: 'In a mining office, a man in a government coat is copying a map onto fresh paper. The original is older than the United States. On it, marked in a hand that isn\'t English, is a route that matches the race exactly. "The President will want this," he says, and then sees you.',
    choices: [
      { label: 'Steal the copy (LUCK)', check: { stat: 'luck', dc: 13 }, ok: { text: 'You know where the next Corpse Parts should be. So does Valentine, but now you know he knows. (−1 Threat.)', fx: g => { g.threat(-1); g.flag('arimatheaMap'); } }, fail: { text: 'He shouts. Soldiers come running.', fight: { enemies: ['agent', 'soldier', 'soldier'] } } },
      { label: 'Burn both maps', ok: { text: 'Nobody gets it now. The surveyor looks relieved, which is strange.', fx: g => { g.xp(15); } } },
      { label: 'Let him go and follow him', ok: { text: 'He leads you to a government camp. You count the rifles and leave.', fx: g => { g.pace(-4); g.flag('campCounted'); } } },
    ] }, [
    { deed: 'Stole the President\'s copy of the Corpse map.', rep: { president: -2 }, flag: 'arimatheaMap', fail: { deed: 'Tried to steal the President\'s map and failed.', rep: { president: -1 } } },
    { deed: 'Burned the Corpse map so nobody could use it.', rep: { vatican: 1, president: -1 } },
    { deed: 'Followed a surveyor to a government camp.', rep: { president: -1 } },
  ]);
  ev({ id: 'sbr_dinovillage', acts: [2], title: 'The Quiet Village', blurb: 'Everyone here walks on their toes.', icon: 'skull', art: 'ferdinand',
    text: 'The village has no dogs. The people blink sideways and turn their whole heads to look at you. A girl slips a note into your hand: "HE IS UP THE CANYON. THE BITE SPREADS. SALT WATER SLOWS IT."',
    choices: [
      { label: 'Buy salt and ride on', cost: { money: 15 }, ok: { text: 'You pack salt in every saddlebag. (Ferdinand\'s fossils will break more easily.)', fx: g => g.flag('ferdWeakness') } },
      { label: 'Get the girl out of the village (GRIT)', check: { stat: 'grit', dc: 13 }, ok: { text: 'You carry her past three villagers who try to bite. She has an older brother in the next town who thanks you with a fossil he found.', fx: g => { g.mat('fossil', 2); g.xp(15); } }, fail: { text: 'The village wakes up.', fight: { enemies: ['raptor', 'raptor', 'raptor'] } } },
    ] }, [
    { deed: 'Took a warning about Dr. Ferdinand from a girl in a quiet village.', flag: 'ferdWeakness' },
    { deed: 'Carried a girl out of Ferdinand\'s village.', rep: { law: 1, natives: 1 }, fail: { deed: 'Woke a village of dinosaurs.', rep: { law: -1 } } },
  ]);
  ev({ id: 'sbr_mackdixie', acts: [2], type: 'elite', title: 'Mack & Dixie', blurb: 'Two racers who work as a team, on a narrow trail.', icon: 'skull', art: 'mackknife', pace: -3,
    text: 'Mack the Knife and Dixie Chicken are blocking the pass. "Racers only get as far as they\'re allowed," Mack says, turning a knife through his fingers. "Toll\'s your horse, or your ribs."',
    choices: [
      { label: 'Fight them', ok: { text: 'Steel on the mountain pass.', fight: { enemies: ['mack_knife', 'dixie_gun'], elite: true, after: g => { g.gear('bone_knife'); g.trinket('racer_medal'); } } } },
      { label: 'Pay the toll ($50)', cost: { money: 50 }, ok: { text: 'Dixie counts it and winks. "Pleasure doing business."', fx: g => g.pace(2) } },
      { label: 'Tell them the President is paying more for them than for you', check: { stat: 'res', dc: 14 }, ok: { text: 'They look at each other. They ride off, arguing. Later you hear they rode into a government camp.', fx: g => g.threat(-0.5) }, fail: { text: '"Nice try."', fight: { enemies: ['mack_knife', 'dixie_gun'], elite: true } } },
    ] }, [
    { deed: 'Beat Mack the Knife and Dixie Chicken on the mountain pass.', rep: { racers: 1 }, npc: { mackknife: 'enemy' } },
    { deed: 'Paid a toll to Mack the Knife and Dixie Chicken.', rep: { racers: -1 } },
    { deed: 'Tricked two racers into riding into a government camp.', rep: { president: -1 }, fail: { deed: 'Tried to talk down Mack and Dixie.' } },
  ]);

  /* ===== Act III: Kansas City to the Mississippi ===== */
  ev({ id: 'sbr_gaucho', acts: [3], title: 'The Cabin in the Woods', blurb: 'The racer Gaucho is heading for a cabin with smoke in the chimney.', icon: 'skull', art: 'gaucho',
    cond: g => !SBR.run.flags.ringoDead,
    text: 'Gaucho, the Argentine racer, waves you down. "A cabin, a fire, a man offering stew. I\'m going in. Come?" Through the trees you see the cabin. There is a watch on the porch rail. Its hands are moving backwards.',
    choices: [
      { label: 'Stop him (RESOLVE)', check: { stat: 'res', dc: 13 }, ok: { text: 'He laughs at you, and then doesn\'t. He rides the long way round. "If you\'re wrong, you owe me a stew." You\'re not wrong.', fx: g => { g.flag('gauchoSaved'); g.npc('gaucho', 'friend'); } }, fail: { text: 'He goes in. You hear one shot, then silence, then one shot again.', fx: g => { g.flag('gauchoDead'); } } },
      { label: 'Go in with him', ok: { text: 'A quiet man in a dark coat offers stew. Your watch jumps. Gaucho falls. The man says, "You are on the path of the inferior." You barely get out.', fight: { enemies: ['kansas_gun', 'outlaw'], after: g => { g.flag('gauchoDead'); g.flag('ringoMet'); } } } },
      { label: 'Let him go, it\'s a race', ok: { text: 'He rides on without you. He does not come out.', fx: g => { g.flag('gauchoDead'); g.pace(5); } } },
    ] }, [
    { deed: 'Talked Gaucho out of entering Ringo Roadagain\'s cabin.', rep: { racers: 2 }, flag: 'gauchoSaved', npc: { gaucho: 'friend' }, later: ['gaucho_returns', 5, 10], fail: { deed: 'Failed to stop Gaucho entering a cabin.', flag: 'gauchoDead' } },
    { deed: 'Walked into Ringo Roadagain\'s cabin beside Gaucho.', flag: ['gauchoDead', 'ringoMet'], rep: { racers: -1 } },
    { deed: 'Let Gaucho ride into a stranger\'s cabin.', flag: 'gauchoDead', rep: { racers: -2 } },
  ]);
  ev({ id: 'sbr_greentomb', acts: [3], title: 'The Green Tomb', blurb: 'A pigeon carrying a message for the President.', icon: 'book', art: 'lucy',
    text: 'At a cemetery with a green-roofed tomb, Lucy Steel is crouched behind a headstone. "The President\'s agents use pigeons. The message for him lands here. I need to read it before he does." A pigeon is circling.',
    choices: [
      { label: 'Catch the pigeon (AIM)', check: { stat: 'aim', dc: 13 }, ok: { text: 'You catch it without a scratch. Lucy copies the message and lets it go. It names the next Stand user sent after you. (Coded Pigeon Message.)', fx: g => { g.trinket('pigeon_note'); g.flag('pigeonRead'); } }, fail: { text: 'The pigeon flies off. An agent at the gate sees the feathers on your coat.', fight: { enemies: ['agent', 'agent'] } } },
      { label: 'Keep watch while she does it', ok: { text: 'She is braver than she looks. She gets the message, and a new ally: you.', fx: g => { g.npc('lucy', 'friend'); g.flag('pigeonRead'); } } },
      { label: 'Tell her it\'s too dangerous', ok: { text: '"I know," she says, and does it anyway, alone. You don\'t see her again for a long time.', fx: g => g.pace(2) } },
    ] }, [
    { deed: 'Caught the President\'s pigeon at the Green Tomb.', rep: { president: -1, vatican: 1 }, flag: 'pigeonRead', fail: { deed: 'Scared off the President\'s pigeon.', rep: { president: -1 } } },
    { deed: 'Kept watch for Lucy Steel at the Green Tomb.', npc: { lucy: 'friend' }, flag: 'pigeonRead' },
    { deed: 'Left Lucy Steel to spy on the President alone.', npc: { lucy: 'wary' } },
  ]);
  ev({ id: 'sbr_norisuke', acts: [3], title: 'Norisuke Higashikata', blurb: 'The winner of the 4th Stage is buying everyone drinks.', icon: 'coin', art: 'norisuke',
    text: 'Norisuke Higashikata, a Japanese racer who won the 4th Stage on a horse nobody believed in, is celebrating in a Kansas saloon. "I trade in fruit," he tells you. "Also, advice. Advice is cheaper."',
    choices: [
      { label: 'Buy his advice ($30)', cost: { money: 30 }, ok: { text: '"Sprint on the downhill. Rest on the uphill. Horses remember." (Party +1 RIDING.)', fx: g => g.statUpAll('ride', 1) } },
      { label: 'Offer him a partnership', ok: { text: 'He shakes your hand. "When this is over, look for the Higashikata family. We remember friends for a very long time." (+$30.)', fx: g => g.money(30) } },
      { label: 'Challenge him to a drinking contest (GRIT)', check: { stat: 'grit', dc: 14 }, ok: { text: 'You win. He pays for everyone and gives you his lucky gold tooth.', fx: g => { g.trinket('gold_tooth'); g.money(20); } }, fail: { text: 'You lose badly. (Exhaustion +1.)', fx: g => g.exhaust('random') } },
    ] }, [
    { deed: 'Paid Norisuke Higashikata for a racer\'s advice.', rep: { racers: 1 } },
    { deed: 'Shook hands with Norisuke Higashikata.', npc: { norisuke: 'friend' }, rep: { racers: 1 } },
    { deed: 'Out-drank Norisuke Higashikata.', rep: { racers: 1 }, fail: { deed: 'Lost a drinking contest to Norisuke Higashikata.' } },
  ]);
  ev({ id: 'sbr_dothan', acts: [3], title: 'DOGOOON', blurb: 'A racer frozen mid-stride, a word written on his back.', icon: 'skull', art: 'dothan',
    cond: g => !SBR.run.flags.dothanDead,
    text: 'Dot Han, the rival racer, is standing in the grass. On his back someone has painted a word: "DOGOOON". Every time the wind moves him, the word shouts and he screams. Sandman\'s In a Silent Way. Somewhere, a runner is watching.',
    choices: [
      { label: 'Cut the word off his coat (SPIN)', check: { stat: 'spin', dc: 13 }, ok: { text: 'The sound dies with the cloth. Dot Han collapses, alive. "I owe you. And I know where Diego sleeps." (Diego\'s fights start Marked.)', fx: g => { g.flag('dothanSpied'); g.npc('dothan', 'friend'); } }, fail: { text: 'The sound goes off in your hands. Everyone is hurt. (Party loses 15% HP.)', fx: g => { g.hurtAll(0.15); g.flag('dothanDead'); } } },
      { label: 'Go after the runner', ok: { text: 'Sand shifts. A figure turns, and the word comes for you instead.', fight: { enemies: ['sandman'], elite: true, after: g => g.flag('dothanDead') } } },
      { label: 'Leave him. He\'s the competition.', ok: { text: 'You hear him for a mile.', fx: g => { g.flag('dothanDead'); g.pace(4); } } },
    ] }, [
    { deed: 'Saved Dot Han from In a Silent Way.', rep: { racers: 2, natives: -1 }, flag: 'dothanSpied', npc: { dothan: 'friend' }, fail: { deed: 'Set off Sandman\'s sound on Dot Han.', flag: 'dothanDead' } },
    { deed: 'Hunted Sandman instead of saving Dot Han.', rep: { natives: -2 }, npc: { sandman: 'enemy' }, flag: 'dothanDead' },
    { deed: 'Left Dot Han to In a Silent Way.', rep: { racers: -2 }, flag: 'dothanDead' },
  ]);
  ev({ id: 'sbr_storm', acts: [3], title: 'Diego in the Storm', blurb: 'Lightning over the plains. Someone was thrown from his horse.', icon: 'skull', art: 'diego',
    text: 'In the downpour, Diego Brando is face down in the mud, Silver Bullet circling him. He isn\'t moving. His hat is ten feet away.',
    choices: [
      { label: 'Help him up', ok: { text: 'He takes your hand, stands, and doesn\'t say thank you. "Don\'t think this makes us anything." But he remembers.', fx: g => { g.npc('diego', 'wary'); g.pace(-4); } } },
      { label: 'Take his hat', ok: { text: 'You leave him in the rain. You have a jockey\'s hat and a new enemy.', fx: g => { g.gear('jockey_cap'); } } },
      { label: 'Ride past, faster', ok: { text: 'Someone has to win. (+10 pace.)', fx: g => g.pace(10) } },
    ] }, [
    { deed: 'Pulled Diego Brando out of the mud.', rep: { racers: 1 }, npc: { diego: 'wary' }, flag: 'helpedDiego' },
    { deed: 'Stole Diego Brando\'s hat while he lay in the mud.', rep: { racers: -1 }, npc: { diego: 'enemy' }, later: ['diego_hat', 4, 9] },
    { deed: 'Rode past Diego lying in a storm.' },
  ]);

  /* ===== Act IV: the North ===== */
  ev({ id: 'sbr_milwaukee', acts: [4], type: 'event', title: 'The Milwaukee Casino', blurb: 'Money must be spent. Sugar Mountain said so.', icon: 'dice', art: 'cardsharp', weight: 5, pace: -2,
    text: 'A riverboat casino outside Milwaukee. If you still carry the tree\'s riches, they must be spent before sunset. Men in matching coats are playing cards at every table. Eleven of them. They all look up at once.',
    choices: [
      { label: 'Spend everything at the tables', req: g => SBR.run.money > 0, reqText: 'Needs money', ok: { text: 'You bet like a king and lose like one. Every dollar is gone, which is exactly what the tree wanted. You win one thing: a steamboat ticket. The eleven men follow you out.', fx: g => { g.money(-SBR.run.money); g.trinket('ticket'); }, fight: { enemies: ['tattoo', 'tattoo', 'card_sharp'], after: g => g.trinket('diamond') } } },
      { label: 'Play one careful hand (LUCK)', check: { stat: 'luck', dc: 13 }, ok: { text: 'You clean out a whole table and leave by the kitchen. (+$120.)', fx: g => g.money(120) }, fail: { text: 'You lose $40 and the eleven men notice you.', fx: g => { g.money(-40); g.flag('elevenNoticed'); } } },
      { label: 'Watch the eleven men instead', ok: { text: 'They breathe together. They blink together. When one scratches his arm, they all do. (Tattoo You! fights start Marked.)', fx: g => g.flag('tattooIntel') } },
    ] }, [
    { deed: 'Spent a fortune at the Milwaukee casino.', rep: { racers: 1 }, threat: 0.5 },
    { deed: 'Cleaned out a table at the Milwaukee casino.', rep: { law: -1 }, fail: { deed: 'Lost at cards in Milwaukee, and was noticed.', threat: 0.5 } },
    { deed: 'Studied the eleven men at the casino.', flag: 'tattooIntel' },
  ]);
  ev({ id: 'sbr_logroute', acts: [4], title: 'The Log Road Under the Ice', blurb: 'An old Native trail beneath the frozen river.', icon: 'map', art: 'whisperer',
    text: 'A Lakota guide shows you a road of logs laid under the frozen river decades ago. "My grandfather built it for running from soldiers. It will run you east faster than any horse on the ice."',
    choices: [
      { label: 'Pay him fairly ($40)', cost: { money: 40 }, ok: { text: 'He leads you through the dark under the ice. You come out ahead of half the race. (+22 pace.)', fx: g => g.pace(22) } },
      { label: 'Ask him to take you for free', check: { stat: 'res', dc: 14 }, ok: { text: '"You ride with Sandman\'s people\'s blessing, I hear." He takes you. (+15 pace.)', fx: g => g.pace(15) }, fail: { text: 'He shakes his head and walks away.', fx: g => g.pace(-2) } },
      { label: 'Follow him secretly', ok: { text: 'You find the road, and use it. He finds your tracks, and never guides a white man again.', fx: g => g.pace(18) } },
    ] }, [
    { deed: 'Paid a Lakota guide for the log road under the ice.', rep: { natives: 2 } },
    { deed: 'Was guided under the ice by a Lakota elder.', rep: { natives: 1 }, fail: { deed: 'Asked a guide for a favour he wouldn\'t give.' } },
    { deed: 'Stole the secret of the log road under the ice.', rep: { natives: -3 } },
  ]);
  ev({ id: 'sbr_wolf', acts: [4], title: 'The Wolf and the Legs', blurb: 'A wolf is carrying something that glows.', icon: 'corpse', art: null,
    text: 'A grey wolf trots across the snow with something in its jaws: a pair of mummified legs, wrapped in cloth. The Corpse\'s legs. Behind it, three Presidential riders are closing in.',
    choices: [
      { label: 'Shoot the riders first (AIM)', check: { stat: 'aim', dc: 14 }, ok: { text: 'One shot, one horse down, two riders thrown. The wolf vanishes into the trees. Someday someone else will find the legs. Not the President.', fx: g => { g.threat(-1); g.xp(20); } }, fail: { text: 'You miss. They turn on you.', fight: { enemies: ['vguard', 'agent', 'wolf'] } } },
      { label: 'Chase the wolf', ok: { text: 'You get close enough to see its eyes. It is not afraid. It drops a single wrapped bone at your feet and runs.', fx: g => { g.mat('bone', 3); g.mat('hide', 2); } } },
    ] }, [
    { deed: 'Stopped the President\'s riders from catching the wolf with the Corpse\'s legs.', rep: { president: -2, vatican: 1 }, fail: { deed: 'Fought the President\'s riders in the snow.', rep: { president: -1 } } },
    { deed: 'Followed a wolf carrying the Corpse\'s legs.' },
  ]);
  ev({ id: 'sbr_gettysburg', acts: [4], title: 'A Dream of Gettysburg', blurb: 'A teddy bear and a pair of boots on the side of the road.', icon: 'skull', art: 'nicholas',
    cond: g => !SBR.run.flags.facedGuilt,
    text: 'A small teddy bear is sitting in the snow. Next to it: a pair of child\'s riding boots. Johnny\'s hands start shaking. They are Nicholas\'s boots. There is no way they can be here. Something is pulling your guilt up out of the ground.',
    choices: [
      { label: 'Pick up the boots (RESOLVE)', check: { stat: 'res', dc: 14 }, ok: { text: 'Johnny holds them and says his brother\'s name. The weight lifts. When Civil War comes, you will already have faced this. (Nicholas\'s Riding Boots.)', fx: g => { g.flag('facedGuilt'); g.gear('nicholas_boots'); } }, fail: { text: 'You can\'t. You ride on with your hands shaking. (Party gains Guilt at the start of the Axl RO fight.)', fx: g => g.flag('leftFamily') } },
      { label: 'Take the bear to the nearest town', ok: { text: 'A girl at the church runs to it. "Kuma-chan!" Her mother presses a charm into your hand. (Kuma-chan... she insists you keep his twin.)', fx: g => g.gear('kuma_chan') } },
      { label: 'Burn them both', ok: { text: 'The smoke smells like a summer that never happened. Something in the woods is angry.', fx: g => g.threat(0.5) } },
    ] }, [
    { deed: 'Faced Nicholas\'s boots in the snow.', flag: 'facedGuilt', fail: { deed: 'Could not pick up Nicholas\'s boots.', flag: 'leftFamily' } },
    { deed: 'Returned a lost teddy bear called Kuma-chan.', rep: { law: 1, vatican: 1 } },
    { deed: 'Burned a child\'s boots and a teddy bear in the snow.', flag: 'leftFamily' },
  ]);
  ev({ id: 'sbr_scarlet', acts: [4], title: 'The First Lady\'s Hotel', blurb: 'Scarlet Valentine is in Chicago. So is Lucy.', icon: 'crown', art: 'scarlet',
    text: 'The First Lady has taken a whole floor of a Chicago hotel. Lucy Steel is working there as a maid, with a sleeping draught Hot Pants gave her. "I have to get into her room. If I don\'t, she\'ll find out who I am."',
    choices: [
      { label: 'Create a distraction in the lobby (LUCK)', check: { stat: 'luck', dc: 13 }, ok: { text: 'A fire in the kitchen, some shouting, and Lucy slips upstairs. She comes back pale, but she has the President\'s letters.', fx: g => { g.npc('lucy', 'friend'); g.flag('scarletLetters'); } }, fail: { text: 'The guards see through it.', fight: { enemies: ['vguard', 'vguard'] } } },
      { label: 'Take the risk yourself', ok: { text: 'You climb four storeys of brick. The letters are yours; so is a long cut from a balcony railing. (Party loses 10% HP.)', fx: g => { g.hurtAll(0.1); g.flag('scarletLetters'); } } },
      { label: 'Tell Lucy to run', ok: { text: 'She doesn\'t. She never does.', fx: g => g.npc('lucy', 'wary') } },
    ] }, [
    { deed: 'Helped Lucy Steel into Scarlet Valentine\'s rooms in Chicago.', rep: { president: -2 }, npc: { lucy: 'friend' }, flag: 'scarletLetters', fail: { deed: 'Fought the First Lady\'s guards in a Chicago hotel.', rep: { president: -1, law: -1 } } },
    { deed: 'Stole the First Lady\'s letters from a Chicago hotel.', rep: { president: -2 }, flag: 'scarletLetters' },
    { deed: 'Told Lucy Steel to run from Chicago.' },
  ]);

  /* ===== Act V: Philadelphia to the Atlantic ===== */
  ev({ id: 'sbr_delaware', acts: [5], title: 'The Man in the River', blurb: 'Someone is tied to a post in the Delaware, up to his neck.', icon: 'skull', art: 'magent',
    cond: g => !SBR.run.flags.magentDealt,
    text: 'Magent Magent, the President\'s agent, is tied to a pier post in the freezing Delaware River. Wekapipo put him there. The tide is coming in. "Hey. Hey, you. Get me out and I\'ll tell you what the President is guarding."',
    choices: [
      { label: 'Cut him free, get the information', ok: { text: 'He talks fast, shivering. The President\'s guards, their positions, the train. Then he runs. You know he will be back.', fx: g => { g.flag('agentOrders'); g.flag('magentFreed'); } } },
      { label: 'Leave him to the tide', ok: { text: '"You\'ll regret—" The water rises. You don\'t look back.', fx: g => { g.flag('magentDealt'); g.npc('wekapipo', 'friend'); } } },
      { label: 'Question him, then leave him (RESOLVE)', check: { stat: 'res', dc: 14 }, ok: { text: 'He tells you everything, hoping. You keep walking. Wekapipo nods at you from the bank.', fx: g => { g.flag('agentOrders'); g.flag('magentDealt'); } }, fail: { text: 'He laughs at you through chattering teeth and tells you nothing.', fx: g => g.flag('magentDealt') } },
    ] }, [
    { deed: 'Cut Magent Magent free from the Delaware River.', rep: { president: 1 }, flag: ['agentOrders', 'magentFreed'], later: ['magent_returns', 3, 6] },
    { deed: 'Left Magent Magent to the Delaware tide.', flag: 'magentDealt', rep: { president: -1 }, npc: { wekapipo: 'friend' } },
    { deed: 'Interrogated Magent Magent in the river and left him there.', flag: ['agentOrders', 'magentDealt'], rep: { president: -1 }, fail: { deed: 'Could not make Magent Magent talk.', flag: 'magentDealt' } },
  ]);
  ev({ id: 'sbr_independence', acts: [5], title: 'Independence Hall', blurb: 'Lucy is inside, and so is something holy.', icon: 'corpse', art: 'lucy',
    text: 'The bell tower of Independence Hall. Lucy Steel is on the steps, holding her stomach. Something inside her has been growing since she touched the Corpse\'s head. "I can feel it moving," she whispers. "Don\'t tell Steven."',
    choices: [
      { label: 'Get her to Hot Pants', ok: { text: 'The nun takes one look and crosses herself. "She is carrying a Saint." Hot Pants stays with her. The Vatican will not forget.', fx: g => { g.npc('hotpants', 'friend'); g.healAll(0.3); } } },
      { label: 'Stand guard at the door', ok: { text: 'All night. At dawn, three agents try the door and find you.', fight: { enemies: ['vguard', 'par_soldier', 'agent'], after: g => g.npc('lucy', 'friend') } } },
      { label: 'Tell Steven', ok: { text: 'Steven Steel goes white, then goes to his wife. He is braver than anyone thinks.', fx: g => { g.npc('steven', 'friend'); g.money(60); } } },
    ] }, [
    { deed: 'Took Lucy Steel to the Vatican\'s nun at Independence Hall.', rep: { vatican: 2 }, npc: { hotpants: 'friend' } },
    { deed: 'Guarded Lucy Steel through the night at Independence Hall.', rep: { president: -1, vatican: 1 }, npc: { lucy: 'friend' } },
    { deed: 'Told Steven Steel what was happening to his wife.', rep: { racers: 1 }, npc: { steven: 'friend' } },
  ]);
  ev({ id: 'sbr_bluehawaii', acts: [5], title: 'The Blue Hawaii', blurb: 'A steamboat down the coast, and some very lucky people.', icon: 'star', art: null,
    text: 'The steamboat Blue Hawaii is taking racers and their horses down the coast. On board, everyone is winning at dice. Too much. Every coin lands heads. Somewhere below deck, a Stand is making luck flow in one direction.',
    choices: [
      { label: 'Buy passage ($50, or use a Steamboat Ticket)', get cost() { return { money: SBR.run && (SBR.run.trinkets || []).includes('ticket') ? 0 : 50 }; }, ok: { text: 'A night on the water and a morning far down the coast. (+20 pace, party heals 30%.)', fx: g => { const r = SBR.run, i = (r.trinkets || []).indexOf('ticket'); if (i >= 0) r.trinkets.splice(i, 1); g.pace(20); g.healAll(0.3); } } },
      { label: 'Find the Stand below deck (LUCK)', check: { stat: 'luck', dc: 14 }, ok: { text: 'A frightened stoker whose Stand pushes luck around like water. You make him push it your way. (+1 LUCK to everyone.)', fx: g => g.statUpAll('luck', 1) }, fail: { text: 'The luck turns against you. You lose $40 and your footing.', fx: g => { g.money(-40); g.hurtAll(0.1); } } },
      { label: 'Ride the coast road instead', ok: { text: 'Slow, but honest.', fx: g => g.pace(-2) } },
    ] }, [
    { deed: 'Took the steamboat Blue Hawaii down the coast.', rep: { racers: 1 } },
    { deed: 'Found the Stand user steering luck aboard the Blue Hawaii.', rep: { law: 1 }, fail: { deed: 'Lost to a Stand on the Blue Hawaii.' } },
    { deed: 'Refused to board the Blue Hawaii.' },
  ]);
  ev({ id: 'sbr_hp_stand', acts: [5], title: 'Hot Pants\' Last Supper', blurb: 'She has packed sandwiches. Too many.', icon: 'fire', art: 'hotpants',
    cond: g => !SBR.run.flags.hpDead && SBR.run.lead !== 'hotpants',
    text: 'Hot Pants sits by your fire with a basket of sandwiches. "The President\'s guard is waiting at the coast. I intend to face them." She offers you one. "Eat. I made too many. I always make too many."',
    choices: [
      { label: 'Eat, and promise to ride with her', ok: { text: 'She almost smiles. (3 Hot Pants\' Sandwiches.)', fx: g => { g.item('sandwich'); g.item('sandwich'); g.item('sandwich'); g.npc('hotpants', 'friend'); } } },
      { label: 'Ask about her sin', ok: { text: 'She tells you about her brother, and the bear. Then she is quiet. "The Saint\'s Corpse is the only forgiveness I will accept."', fx: g => { g.xp(20); g.flag('hpLoyal'); } } },
    ] }, [
    { deed: 'Shared Hot Pants\' sandwiches and promised to ride with her.', rep: { vatican: 1 }, npc: { hotpants: 'friend' } },
    { deed: 'Heard Hot Pants\' confession.', rep: { vatican: 2 }, flag: 'hpLoyal' },
  ]);

  /* ===== Act VI: New York ===== */
  ev({ id: 'sbr_trinity', acts: [6], title: 'Trinity Church', blurb: 'The finish line of the race, and something older.', icon: 'corpse', art: 'steven', weight: 4, pace: -1,
    text: 'The final goal is Trinity Church in Manhattan. The crowds are enormous. Under the church, Steven Steel tells you quietly, is a crypt nobody has opened in a hundred years. "If this Corpse is what they say, it should rest where no President can reach it."',
    choices: [
      { label: 'Promise to bring the Corpse here', ok: { text: 'Steven shakes your hand. It is the first time he has looked afraid. (+$50 from the organisers\' purse.)', fx: g => { g.money(50); g.flag('trinityPromise'); } } },
      { label: 'Say the Corpse belongs to whoever wins', ok: { text: '"That\'s what the President says, too," Steven says.', fx: g => g.threat(0.5) } },
    ] }, [
    { deed: 'Promised Steven Steel the Corpse would rest under Trinity Church.', rep: { vatican: 2, president: -1 }, flag: 'trinityPromise' },
    { deed: 'Told Steven Steel the Corpse belongs to the winner.', rep: { vatican: -1 } },
  ]);
  ev({ id: 'sbr_newspaper', acts: [5, 6], title: 'The Newsboys', blurb: 'Your name is in the headlines.', icon: 'book', art: null, weight: 2, pace: 0,
    text: 'Newsboys shout the standings on every corner. For a dime, they\'ll print whatever you tell them. For a dollar, they\'ll print it on the front page.',
    choices: [
      { label: 'Buy the front page ($40)', cost: { money: 40 }, ok: { text: '"JOESTAR TEAM TO WIN." The crowd cheers when you ride by. (+10 pace.)', fx: g => g.pace(10) } },
      { label: 'Plant a story about the President ($30)', cost: { money: 30 }, ok: { text: '"PRESIDENT\'S MEN SEEN IN RACE." Some of his agents lose their nerve. (−1 Threat.)', fx: g => g.threat(-1) } },
      { label: 'Just buy a paper', ok: { text: 'You read the standings. Sloop John B is still in it, somehow.', fx: g => g.xp(5) } },
    ] }, [
    { deed: 'Bought the front page of a New York paper.', rep: { racers: 1 } },
    { deed: 'Planted a story about the President\'s agents.', rep: { president: -1, law: 1 } },
    { deed: 'Read the race standings in a New York paper.' },
  ]);

  SBR.EVENTS.push(...E);
})();

/* ---------------- Follow-ups: what those choices come back as ---------------- */
SBR.CAMPAIGN_EVENTS.push(
  { id: 'sloop_repays', type: 'event', title: 'Sloop John B Repays You', blurb: 'The racer you sold a shortcut to.', icon: 'coin', art: 'sloop', reveals: 'Sloop John B remembered the shortcut, and paid it back.',
    text: '"The mountain trick worked," Sloop John B says, grinning through his beard. "Here\'s mine: the river ferry at the next town takes bribes, and the ferryman\'s brother sells horseshoes."',
    choices: [
      { label: 'Take the tip', ok: { text: '(+15 pace.)', fx: g => g.pace(15) } },
      { label: 'Ask him to ride with you a while', ok: { text: 'He shares his water and his gossip. (Party heals 25%.)', fx: g => g.healAll(0.25) } },
    ] },
  { id: 'gaucho_returns', type: 'event', title: 'Gaucho Pays His Debt', blurb: 'The Argentine racer, alive.', icon: 'recruit', art: 'gaucho', reveals: 'Gaucho lived, and came to find you.',
    text: 'Gaucho rides up beside you, alive and loud. "I asked around. That cabin: seven racers went in. None came out. You owe me no stew. I owe you everything."',
    choices: [
      { label: 'Accept his poncho', ok: { text: 'Thick Argentine wool. (Wool Poncho, +$40.)', fx: g => { g.gear('poncho'); g.money(40); } } },
      { label: 'Ask him to spread the word', ok: { text: 'Every racer on the road hears about it by nightfall.' } },
    ] },
  { id: 'diego_hat', type: 'elite', title: 'Diego Wants His Hat', blurb: 'Silver Bullet, and a man without a hat.', icon: 'skull', art: 'diegodino', reveals: 'Diego Brando came back for his hat.',
    text: 'Diego rides out of the dust, and his eyes are slitted like a lizard\'s. "You left me in the mud. You took my hat. Do you know how that looked?"',
    choices: [
      { label: 'Fight', ok: { text: 'Scary Monsters, on the open plain.', fight: { enemies: ['diego_rival', 'raptor'], elite: true } } },
      { label: 'Give it back', req: g => SBR.run.gear.includes('jockey_cap'), reqText: 'Needs the hat, unequipped', ok: { text: 'He puts it on without a word, and rides off.', fx: g => { const i = SBR.run.gear.indexOf('jockey_cap'); if (i >= 0) SBR.run.gear.splice(i, 1); } } },
    ] },
  { id: 'magent_returns', type: 'elite', title: 'Magent Remembers', blurb: 'The man you cut from the river.', icon: 'skull', art: 'magent', reveals: 'Magent Magent came back for the people who saw him beg.',
    text: 'Magent Magent, dry now, with a rifle. "Nobody sees me like that and lives. Nothing personal." He kneels. 20th Century Boy.',
    choices: [
      { label: 'Fight', ok: { text: 'He should have stayed in the river.', fight: { enemies: ['magent', 'agent'], elite: true } } },
    ] },
);
Object.assign(SBR.CONSEQ, {
  'sloop_repays:0': { deed: 'Took Sloop John B\'s tip about the ferry.', rep: { racers: 1 } },
  'sloop_repays:1': { deed: 'Rode a while with Sloop John B.', rep: { racers: 1 }, npc: { sloop: 'friend' } },
  'gaucho_returns:0': { deed: 'Accepted Gaucho\'s poncho.', rep: { racers: 1 } },
  'gaucho_returns:1': { deed: 'Gaucho told every racer what you did.', rep: { racers: 2 } },
  'diego_hat:0': { deed: 'Fought Diego Brando over a hat.', npc: { diego: 'enemy' } },
  'diego_hat:1': { deed: 'Gave Diego Brando his hat back.', npc: { diego: 'wary' } },
  'magent_returns:0': { deed: 'Fought Magent Magent again.', rep: { president: -1 } },
});

/* ---------------- Consequences that change fights ---------------- */
(() => {
  const base = SBR.campaignFightFlags;
  SBR.campaignFightFlags = (c, note, any, P) => {
    base(c, note, any, P);
    const f = SBR.run.flags;
    if (f.timInvestigated && any(['robinson', 'robinson_boss'])) { c.enemies().forEach(e => c.addStatus(e, 'weak', 0, 2, true)); note('Mountain Tim tracked the killer here first.'); }
    if (f.boomExposed && any(['benjamin', 'andre', 'laboom'])) { P.forEach(u => c.addStatus(u, 'evasive', 0, 2, true)); note('The Boomboom family can\'t hide behind your face any more.'); }
    if (f.gauchoDead && any(['ringo'])) { c.enemies().forEach(e => c.addStatus(e, 'empower', 0, 2, true)); note('Ringo has killed here before. Gaucho was the last.'); }
    if (f.gauchoSaved && any(['ringo'])) { P.forEach(u => c.addStatus(u, 'lucky', 0, 2, true)); note('Gaucho told you how the man in the cabin fights.'); }
    if (f.pigeonRead && any(['blackmore', 'sandman', 'ringo'])) { P.forEach(u => c.addStatus(u, 'guard', 0, 1, true)); note('The pigeon’s message told you who was coming.'); }
    if (f.scarletLetters && any(['mikeo', 'valentine1'])) { c.enemies().forEach(e => c.addStatus(e, 'marked', 0, 2, true)); note('The First Lady’s letters told you where they would be.'); }
    if (f.magentFreed && any(['wekapipo_foe'])) { P.forEach(u => c.addStatus(u, 'weak', 0, 1, true)); note('Wekapipo saw you free his prisoner.'); }
  };
})();

/* ---------------- Canon order: Mike O. and Tubular Bells belong to Chicago, Act IV ---------------- */
(() => {
  SBR.ACTS[4].story = { 2: 'st_sugar', 3: 'st_tattoo', 4: 'st_mikeo', 5: 'st_wekapipo' };
  SBR.ACTS[5].story = { 2: 'st_disco', 5: 'st_valentine' };
  // the lineups themselves (with Mike O. in Act IV) live in manga.js
  const M = SBR.STORY.st_mikeo;
  M.bg = 4;
  M.lines = [
    { narr: 'Chicago. Lucy Steel, in a maid\'s apron, runs down a hotel corridor. Balloon animals drift after her.' },
    { who: 'mikeo', text: 'Tubular Bells always finds its way home. Home is inside your body.' },
    { who: 'lucy', text: 'Johnny! Gyro! Over here!' },
  ];
})();
