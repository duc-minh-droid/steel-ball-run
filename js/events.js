/* Side encounters. Every choice changes something that matters: an ally, gear, a Remnant, a fight, a stat,
   or a story flag that comes back later (see the "payoff" events at the bottom). */
'use strict';

const ALL = [1, 2, 3, 4, 5, 6];
SBR.EVENTS = [
  /* ---------- battles & shops ---------- */
  { id: 'ambush', acts: ALL, type: 'fight', title: 'Trail Ambush', blurb: 'Dust on the horizon. Riders who want your spot in the race.', icon: 'sword', weight: 5, pace: -4, fight: { random: true } },
  { id: 'ambush2', acts: ALL, type: 'fight', title: 'Blocked Pass', blurb: 'Someone has piled rocks across the trail and is waiting behind them.', icon: 'sword', weight: 4, pace: -4, fight: { random: true } },
  { id: 'merchant', acts: [1, 2, 3, 4, 5], type: 'shop', title: 'Travelling Merchant', blurb: 'A wagon full of oddities waves you down.', icon: 'tent', weight: 3, pace: -3, art: 'steven', shop: 'general' },

  /* ---------- any act ---------- */
  { id: 'hotspring', acts: [1, 2, 3, 4], type: 'rest', title: 'The Scout at the Spring', blurb: 'Steam rises from the rocks. Someone got there first.', icon: 'fire', weight: 2, once: true, pace: -6, art: 'sandman',
    text: 'A young scout from Sandman\'s tribe is washing a bullet wound in the hot spring. He reaches for his knife when he sees you. "This water belongs to my people. White racers have been shooting at us for sport."',
    choices: [
      { label: 'Share the spring and treat his wound', check: { stat: 'res', dc: 11 }, ok: { text: 'He lets Gyro stitch him with a Zeppeli technique. "I will remember this." He leaves two eagle feathers on a rock. (Party heals 40%.)', fx: g => { g.healAll(0.4); g.mat('feather', 2); g.flag('scoutFriend'); } }, fail: { text: 'He doesn\'t trust you and slips away, but leaves the spring to you. (Party heals 40%.)', fx: g => g.healAll(0.4) } },
      { label: 'Drive him off and take the water', ok: { text: 'He runs, bleeding. You soak until the aches are gone — and somewhere, his brothers hear what you did. (Party heals 70%, remove 1 Exhaustion.)', fx: g => { g.healAll(0.7); g.unexhaust(1); g.flag('scoutEnemy'); } } },
    ] },
  { id: 'poker', acts: [1, 2, 3, 4, 5], type: 'event', title: 'A Game Against a Stand User', blurb: 'The dealer never loses. Everyone says so.', icon: 'dice', weight: 2, once: true, pace: -3, art: 'gunslinger',
    text: 'A saloon gambler flips cards without looking at them. A faint figure hangs over his shoulder, whispering. "My friend here reads every card in the deck. Bet your gear, cowboy — or bet your horse."',
    choices: [
      { label: 'Bet Slow Dancer\'s saddle for his silks (LUCK)', check: { stat: 'luck', dc: 14 }, ok: { text: 'Pocket aces. His Stand shrieks. He slides his racing silks across the table and storms out.', fx: g => g.gear('silks') }, fail: { text: 'He wins. You keep your saddle only by handing over supplies — and a night without sleep. (Johnny gains 1 Exhaustion, lose an item.)', fx: g => { g.exhaust('johnny', 1); g.loseItem(); } } },
      { label: 'Spot what the Stand is doing (AIM)', check: { stat: 'aim', dc: 13 }, ok: { text: 'You shoot the mirror behind him. The Stand was reading reflections. The house hands you his lucky silver dollar to keep things quiet.', fx: g => g.gear('silver_dollar') }, fail: { text: 'You miss, and his hired guns stand up.', fight: { enemies: ['outlaw', 'outlaw'] } } },
      { label: 'Call him a cheat and draw', ok: { text: 'Chairs scatter.', fight: { enemies: ['gunslingerboss', 'outlaw'], after: g => g.gear('colt_navy') } } },
    ] },
  { id: 'wounded', acts: [1, 2, 3, 4], type: 'event', title: 'Racer in the Ditch', blurb: 'A boy lies beside a horse with a broken leg.', icon: 'question', weight: 3, once: true, pace: -2, art: 'marco',
    text: 'He can\'t be older than fifteen. "My brother and I entered together — he rode ahead. Please... I just need to reach the next checkpoint."',
    choices: [
      { label: 'Put him on your horse and ride double (−12 pace)', ok: { text: 'You lose time, but get him to the checkpoint. "I\'ll tell my brother. We Blackwoods pay our debts."', fx: g => { g.pace(-12); g.flag('helpedRacer'); g.xp(20); } } },
      { label: 'Give him your Canteen and a map', req: g => g.hasItem('canteen'), reqText: 'Needs a Canteen', ok: { text: 'He limps off toward the trail. Johnny watches him go, thinking about Nicholas. (Johnny +1 RESOLVE.)', fx: g => { g.useItem('canteen'); g.statUp('johnny', 'res', 1); g.flag('helpedRacer'); } } },
      { label: 'Take his saddlebag — this is a race', ok: { text: 'Leather, powder, a little cash. He screams a name after you: "My brother will find you!"', fx: g => { g.mat('leather', 2); g.mat('powder', 2); g.flag('robbed'); } } },
    ] },
  { id: 'spinschool', acts: [1, 2, 3, 4, 5], type: 'trainer', title: 'Zeppeli Practice', blurb: 'Gyro stops to "teach nothing" for an hour.', icon: 'train', weight: 2, pace: -6, art: 'gyro', cond: g => g.inParty('gyro'),
    text: 'Gyro sets tin cans along a fence. "I\'m not teaching you. I\'m practising. Loudly. Near you." He glances at Johnny\'s nails.',
    choices: [
      { label: 'Train an ability (upgrade to Lv.2)', ok: { text: 'Something clicks. The rotation feels different now.', fx: g => g.train() } },
      { label: 'Spin meditation (+2 SPIN to one rider)', ok: { text: 'Rotation, breath, rotation.', fx: g => g.statUp('choose', 'spin', 2) } },
      { label: 'Ask about Naples and Marco', ok: { text: 'Gyro is quiet for a long time. Then he tells you everything. (Gyro +2 RESOLVE.)', fx: g => { g.statUp('gyro', 'res', 2); g.xp(15); } } },
    ] },
  { id: 'gunrange', acts: [1, 2, 3, 4, 5], type: 'trainer', title: 'The Old Marksman', blurb: 'A retired gunfighter who once shot with Mountain Tim.', icon: 'train', weight: 2, once: true, pace: -5, art: 'gunslinger',
    text: '"Tim was the fastest I ever saw. You boys ride with him? Then show me you deserve to."',
    choices: [
      { label: 'Shoot a coin out of the air (AIM)', check: { stat: 'aim', dc: 13 }, ok: { text: 'The coin spins off into the brush. He laughs and hands over his old Winchester.', fx: g => g.gear('winchester') }, fail: { text: 'You clip his hat. "Again," he says, and drills you until dawn. (Chosen rider +2 AIM, Johnny gains 1 Exhaustion.)', fx: g => { g.statUp('choose', 'aim', 2); g.exhaust('johnny', 1); } } },
      { label: 'Ask him to train you properly', ok: { text: 'Three hours of dry-firing. Your hands stop shaking.', fx: g => g.train() } },
    ] },
  { id: 'fortune', acts: ALL, type: 'event', title: 'The Blind Fortune Teller', blurb: 'She knows your name before you say it.', icon: 'star', weight: 2, once: true, pace: -2, art: 'axl',
    text: 'Her eyes are white. "Johnny Joestar. You carry something holy, and something guilty. Which one do you want to hear about?"',
    choices: [
      { label: 'Ask about the Saint\'s Corpse (RES)', check: { stat: 'res', dc: 13 }, ok: { text: '"Nine pieces. One vessel. The vessel is a girl in a white dress." She presses a bead of golden sap into your palm.', fx: g => { g.mat('sap', 1); g.flag('corpseVision'); g.xp(25); } }, fail: { text: 'She screams and grabs your wrist. Something cold crawls into you. (Johnny gains 1 Exhaustion.)', fx: g => g.exhaust('johnny', 1) } },
      { label: 'Ask about your guilt', ok: { text: '"A white mouse. A brother on a horse." Johnny can\'t breathe for a moment, then he can. (Johnny +2 RESOLVE, but −10 pace from the long night.)', fx: g => { g.statUp('johnny', 'res', 2); g.pace(-10); } } },
      { label: 'Refuse and leave', ok: { text: 'She calls after you: "You will meet a man in a cabin who turns back time." (Your party gains +1 LUCK.)', fx: g => g.statUpAll('luck', 1) } },
    ] },
  { id: 'camp', acts: ALL, type: 'event', title: 'An Agent\'s Camp', blurb: 'A campfire still smoulders. A government satchel lies beside it.', icon: 'search', weight: 3, pace: -3,
    text: 'Bedrolls for three. A satchel stamped with the Presidential seal. Whoever camped here left in a hurry — and will be back.',
    choices: [
      { label: 'Read the orders inside', ok: { text: 'A list of racers to be "removed". Your name is on it. You memorise their route and avoid it. (+12 pace, and you take their spare wire.)', fx: g => { g.pace(12); g.mat('wire', 2); g.flag('agentOrders'); } } },
      { label: 'Wait in ambush for the agents', ok: { text: 'Three shapes return at dusk.', fight: { enemies: ['agent', 'agent', 'agent'], after: g => g.gear('plated_vest') } } },
      { label: 'Burn the camp to slow them down', ok: { text: 'Smoke rises behind you. The agents won\'t be following anyone tonight — but you lost time. (−5 pace, gain Gunpowder ×2.)', fx: g => { g.pace(-5); g.mat('powder', 2); } } },
    ] },
  { id: 'checkpoint', acts: ALL, type: 'event', title: 'The Press Tent', blurb: 'Reporters swarm the checkpoint.', icon: 'flag', weight: 2, pace: 4, art: 'steven',
    text: 'A reporter shoves a notebook at Johnny. "The wheelchair jockey! Our readers want to know — why are you still in this race?"',
    choices: [
      { label: 'Tell them you\'re going to win (LUCK)', check: { stat: 'luck', dc: 12 }, ok: { text: 'The headline sells out. A sponsor wires you a set of racing gear. (Gain Leather Chaps.)', fx: g => g.gear('chaps') }, fail: { text: 'Every rival reads that you\'re a threat. Someone is waiting on the next trail.', fight: { enemies: ['rival_racer', 'rival_racer'] } } },
      { label: 'Tell them the truth about your legs', ok: { text: 'You don\'t mention the Corpse, but you talk about walking again. Readers send letters. (Johnny +1 RESOLVE, +1 GRIT.)', fx: g => { g.statUp('johnny', 'res', 1); g.statUp('johnny', 'grit', 1); } } },
      { label: 'Ask what they know about Valentine', check: { stat: 'res', dc: 14 }, ok: { text: 'An old reporter whispers: the President\'s men are digging along the route. (+15 pace, flag: you know the President\'s plan.)', fx: g => { g.pace(15); g.flag('presidentPlan'); } }, fail: { text: 'An agent in the crowd overhears.', fight: { enemies: ['agent', 'agent'] } } },
    ] },
  { id: 'horsetrader', acts: ALL, type: 'event', title: 'The Farrier\'s Daughter', blurb: 'A blacksmith who shoes racehorses — and hates the President.', icon: 'horseshoe', weight: 2, once: true, pace: -3,
    text: '"Valentine\'s men took my father for questioning. He never came back." She hammers a horseshoe flat. "I\'ll shoe your horse for free if you do one thing for me."',
    choices: [
      { label: 'Promise to find out what happened to him', ok: { text: 'She shoes Slow Dancer with steel from her father\'s forge. (+20 pace; flag: you owe her the truth.)', fx: g => { g.pace(20); g.flag('farrierPromise'); } } },
      { label: 'Buy iron-shod racing shoes ($40)', cost: { money: 40 }, ok: { text: 'Every horse in the party rides lighter. (+1 RIDING for everyone.)', fx: g => g.statUpAll('ride', 1) } },
      { label: 'Trade her materials for a plated vest', req: g => g.hasMat('scrap', 3), reqText: 'Needs 3 Scrap Iron', ok: { text: 'She works fast. You leave with a vest that turns bullets.', fx: g => { g.spendMat('scrap', 3); g.gear('plated_vest'); } } },
    ] },

  /* ---------- Act I ---------- */
  { id: 'banditcamp', acts: [1], type: 'elite', title: 'Bandit Hideout', blurb: 'A canyon camp full of stolen saddles.', icon: 'skull', weight: 2, pace: -5, fight: { enemies: ['bandit', 'bandit', 'rival_racer'], loot: 'relic' } },
  { id: 'drywell', acts: [1], type: 'event', title: 'A Voice in the Well', blurb: 'Someone is shouting from the bottom of a dry well.', icon: 'search', weight: 2, once: true, pace: -3,
    text: '"Help! The Boomboom boys threw me down here!" A prospector, thirty feet down, clutching a sack.',
    choices: [
      { label: 'Haul him up (GRIT)', check: { stat: 'grit', dc: 11 }, ok: { text: 'He\'s grateful — and he knows the Boomboom family\'s tricks. "They use magnets. Iron in your blood." He gives you his lodestone scrap and a revolver.', fx: g => { g.gear('colt_navy'); g.flag('boomWarning'); } }, fail: { text: 'The rope snaps. You fall in too, and climb out bruised hours later. (Random rider −12 HP, −8 pace.)', fx: g => { g.hurtRandom(12); g.pace(-8); } } },
      { label: 'Take his sack and leave him', ok: { text: 'Scrap iron and powder. His curses echo up the well long after you ride off.', fx: g => { g.mat('scrap', 3); g.mat('powder', 1); g.flag('robbed'); } } },
    ] },
  { id: 'poco', acts: [1, 2], type: 'recruit', title: 'The Luckiest Farmer', blurb: 'A cheerful racer is picking money up off the road.', icon: 'recruit', weight: 2, once: true, pace: -2, art: 'pocoloco', cond: g => !g.hasAlly('pocoloco'),
    text: 'A grinning farmer rides up, a tiny figure on his shoulder pointing in every direction. "A fortune teller said this is my lucky month! You look like lucky people too!"',
    choices: [
      { label: 'Invite him along', check: { stat: 'luck', dc: 11 }, ok: { text: '"Hey Ya says you\'re lucky! I\'m in!" POCOLOCO joins.', fx: g => { g.recruit('pocoloco'); g.achieve('poco'); } }, fail: { text: '"Hey Ya says... not today!" He rides off, but tosses you a lucky coin. (Gain Silver Dollar.)', fx: g => g.gear('silver_dollar') } },
      { label: 'Share your food with him first', req: g => g.hasItem('jerky') || g.hasItem('canteen'), reqText: 'Needs Jerky or a Canteen', ok: { text: '"Food AND friends? Lucky, lucky!" POCOLOCO joins.', fx: g => { g.useItem(g.hasItem('jerky') ? 'jerky' : 'canteen'); g.recruit('pocoloco'); g.achieve('poco'); } } },
      { label: 'Challenge him to a race for his horseshoe', check: { stat: 'ride', dc: 15 }, ok: { text: 'You beat luck itself. He hands over his lucky horseshoe, laughing.', fx: g => g.gear('horseshoe') }, fail: { text: 'His horse finds a shortcut nobody else could see. (−8 pace.)', fx: g => g.pace(-8) } },
    ] },
  { id: 'dothan', acts: [1, 2], type: 'event', title: 'Rider from the Steppe', blurb: 'Dot Han, a race favourite, circles you on a stocky pony.', icon: 'horseshoe', weight: 2, once: true, pace: 0, art: 'gunslinger',
    text: '"You ride like a child with a broken toy. Race me to that rock. Lose, and you give me your horse\'s oats for a week."',
    choices: [
      { label: 'Race him (RIDING)', check: { stat: 'ride', dc: 13 }, ok: { text: 'By a nose! He grunts, impressed, and hands you his hand-drawn trail map.', fx: g => { g.gear('dotmap'); g.pace(8); } }, fail: { text: 'He\'s gone before you\'ve started. Slow Dancer is winded for days. (−10 pace, Johnny gains 1 Exhaustion.)', fx: g => { g.pace(-10); g.exhaust('johnny', 1); } } },
      { label: 'Ask him to teach you steppe riding', ok: { text: 'He shows you how to ride without reins. (Johnny +2 RIDING.)', fx: g => g.statUp('johnny', 'ride', 2) } },
    ] },
  { id: 'snakenest', acts: [1], type: 'fight', title: 'Rattlesnake Gulch', blurb: 'The rocks are rattling.', icon: 'sword', weight: 2, pace: -3, fight: { enemies: ['rattlesnake', 'rattlesnake', 'rattlesnake'] } },
  { id: 'sheriff', acts: [1, 3], type: 'event', title: 'The Sheriff\'s Bounty', blurb: 'WANTED: a racer who shoots others off their horses.', icon: 'flag', weight: 2, once: true, pace: -4, art: 'mountaintim',
    text: 'The sheriff slaps a poster down. "Cutthroat racer and his gang. Bring him in and I\'ll deputise you — badge and all."',
    choices: [
      { label: 'Take the bounty', ok: { text: 'You track him to a gully.', fight: { enemies: ['rival_racer', 'rival_racer', 'bandit'], after: g => g.gear('badge') } } },
      { label: 'Warn the racer instead — he might be framed', check: { stat: 'res', dc: 12 }, ok: { text: 'He was framed — by Valentine\'s agents. He rides with you for one stage and gives you his whip. (Gain Cactus Whip.)', fx: g => { g.gear('cactus_whip'); g.flag('framedRacer'); } }, fail: { text: 'He shoots first and asks questions never.', fight: { enemies: ['rival_racer', 'bandit'] } } },
    ] },

  /* ---------- Act II ---------- */
  { id: 'cliffruins', acts: [2], type: 'event', title: 'The Painted Cliff', blurb: 'Ancient homes carved into red stone. A painting of a man in nine pieces.', icon: 'search', weight: 2, once: true, pace: -4,
    text: 'The painting shows a figure broken into nine glowing parts, scattered across a map of this land. Beneath it, a cougar is sleeping on something shiny.',
    choices: [
      { label: 'Study the painting (RES)', check: { stat: 'res', dc: 12 }, ok: { text: 'The map matches what the Corpse whispers to Johnny\'s arm. You understand where the next part lies. (+15 pace, Johnny +1 RESOLVE.)', fx: g => { g.pace(15); g.statUp('johnny', 'res', 1); g.flag('corpseVision'); } }, fail: { text: 'The paint crumbles as you touch it. (Gain Fossil Shard ×1.)', fx: g => g.mat('fossil', 1) } },
      { label: 'Take what the cougar is guarding', ok: { text: 'It wakes up.', fight: { enemies: ['cougar', 'cougar'], after: g => g.gear('scope') } } },
    ] },
  { id: 'avalanche', acts: [2, 4], type: 'event', title: 'Rockslide', blurb: 'Pebbles tumble down the slope. Then boulders.', icon: 'hourglass', weight: 2, pace: 0,
    text: 'The mountain groans. Up on the ridge, a man in a bowler hat is pushing the rocks.',
    choices: [
      { label: 'Gallop through (RIDING)', check: { stat: 'ride', dc: 13 }, ok: { text: 'You burst out ahead of the dust. +15 pace.', fx: g => g.pace(15) }, fail: { text: 'Rocks batter the party. (Everyone −8 HP.)', fx: g => g.hurtAllFlat(8) } },
      { label: 'Climb up and catch the man pushing them', ok: { text: 'He\'s one of the President\'s men.', fight: { enemies: ['agent', 'agent'], after: g => g.mat('wire', 2) } } },
    ] },
  { id: 'dinovillage', acts: [2], type: 'fight', title: 'Silent Farmstead', blurb: 'Clawed footprints in the chicken coop.', icon: 'sword', weight: 2, pace: -3, fight: { enemies: ['raptor', 'raptor', 'cougar'] } },
  { id: 'diego_card', acts: [2, 3], type: 'elite', title: 'Dio Blocks the Trail', blurb: 'Diego Brando wants you out of the race.', icon: 'crown', weight: 1.5, once: true, pace: -5, art: 'diego', fight: { enemies: ['diego_rival'], loot: 'relic' } },
  { id: 'trapper', acts: [2, 4], type: 'shop', title: 'Trapper\'s Cabin', blurb: 'Furs, traps, and questionable medicine.', icon: 'tent', weight: 2, pace: -3, art: 'benjamin', shop: 'trapper' },
  { id: 'letter', acts: [2, 3], type: 'event', title: 'A Letter from Naples', blurb: 'A courier has been chasing Gyro for three stages.', icon: 'book', weight: 2, once: true, pace: -2, cond: g => g.inParty('gyro'), art: 'marco',
    text: 'The envelope carries the royal seal of Naples. Gyro turns it over and over without opening it. "If Marco\'s sentence has been carried out already... I don\'t want to know."',
    choices: [
      { label: 'Convince Gyro to read it', ok: { text: 'Marco is still alive. The execution is delayed until the race ends. Gyro laughs until he cries. (Gyro +2 SPIN, +2 RESOLVE.)', fx: g => { g.statUp('gyro', 'spin', 2); g.statUp('gyro', 'res', 2); } } },
      { label: 'Let him keep it sealed', ok: { text: 'He tucks it into his hat. "After New York." You ride on in silence — faster. (+10 pace, Gyro +2 GRIT.)', fx: g => { g.pace(10); g.statUp('gyro', 'grit', 2); } } },
      { label: 'Question the courier — who sent him?', check: { stat: 'aim', dc: 13 }, ok: { text: 'He\'s a spy for Oyecomova\'s people. He runs, and drops a pouch of pins.', fx: g => g.mat('powder', 3) }, fail: { text: 'He\'s a spy — and he isn\'t alone.', fight: { enemies: ['agent', 'bandit'] } } },
    ] },

  /* ---------- Act III ---------- */
  { id: 'tornado', acts: [3], type: 'event', title: 'Twister', blurb: 'A funnel cloud touches down behind you.', icon: 'hourglass', weight: 2, pace: 0,
    text: 'The sky goes green. A tornado tears toward a farmhouse — a family is still inside.',
    choices: [
      { label: 'Save the family (GRIT)', check: { stat: 'grit', dc: 12 }, ok: { text: 'You pull them into the storm cellar. The father gives you his late son\'s wolf-fur cloak.', fx: g => g.gear('wolf_cloak') }, fail: { text: 'You get them out, but debris hits hard. (Everyone −6 HP, Johnny gains 1 Exhaustion.)', fx: g => { g.hurtAllFlat(6); g.exhaust('johnny', 1); } } },
      { label: 'Outrun it (RIDING)', check: { stat: 'ride', dc: 14 }, ok: { text: 'The wind pushes you forward. +20 pace.', fx: g => g.pace(20) }, fail: { text: 'Debris everywhere. You lose an item and time.', fx: g => { g.loseItem(); g.pace(-6); } } },
    ] },
  { id: 'cattle', acts: [3], type: 'event', title: 'Rustlers at the Drive', blurb: 'Cowboys fight to keep their herd from thieves.', icon: 'question', weight: 2, once: true, pace: -5,
    text: 'A trail boss waves his hat at you. "Rustlers! They\'re cutting out half my herd! Help us and you can have your pick of my gear."',
    choices: [
      { label: 'Ride against the rustlers', ok: { text: 'Guns out.', fight: { enemies: ['outlaw', 'outlaw', 'bandit'], after: g => g.gear('pelt_coat') } } },
      { label: 'Turn the stampede onto them (RIDING)', check: { stat: 'ride', dc: 13 }, ok: { text: 'The herd flattens the rustlers\' camp. The boss gives you a Coyote Pelt Coat and a steak dinner. (Party heals 25%.)', fx: g => { g.gear('pelt_coat'); g.healAll(0.25); } }, fail: { text: 'Trampled. (Random rider −14 HP.) The rustlers escape with the herd.', fx: g => g.hurtRandom(14) } },
    ] },
  { id: 'grizzly', acts: [3], type: 'fight', title: 'Grizzly Country', blurb: 'Fresh claw marks on the pines.', icon: 'sword', weight: 2, pace: -3, fight: { enemies: ['grizzly', 'crow'] } },
  { id: 'revival', acts: [3, 4], type: 'rest', title: 'The Revival Tent', blurb: 'A preacher promises healing — and whispers about a holy relic.', icon: 'fire', weight: 2, once: true, pace: -6, art: 'steven',
    text: '"Brothers! A Saint walks this land in pieces!" After the sermon he pulls you aside. "The President pays me to watch for anyone carrying a holy relic. You look like you\'re carrying one."',
    choices: [
      { label: 'Pay him for his silence ($30) and rest', cost: { money: 30 }, ok: { text: 'He takes the money and gives you a real bed. (Remove all Exhaustion, heal 50%.)', fx: g => { g.unexhaust(9); g.healAll(0.5); } } },
      { label: 'Threaten him (GRIT)', check: { stat: 'grit', dc: 12 }, ok: { text: 'He hands over a Sage Bundle and swears he never saw you. (Heal 30%.)', fx: g => { g.gear('sage_bundle'); g.healAll(0.3); } }, fail: { text: 'He rings the church bell. Soldiers come running.', fight: { enemies: ['soldier', 'soldier'] } } },
    ] },
  { id: 'trainheist', acts: [3, 5], type: 'elite', title: 'Government Supply Train', blurb: 'A train guarded by soldiers — carrying digging equipment.', icon: 'skull', weight: 2, pace: -5, fight: { enemies: ['soldier', 'soldier', 'outlaw'], loot: 'relic' } },
  { id: 'telegraph', acts: [3, 4], type: 'event', title: 'The Telegraph Line', blurb: 'The wires hum with government messages.', icon: 'search', weight: 2, once: true, pace: -3,
    text: 'The line runs straight to Washington. With the right touch, you could read — or change — what the President\'s men are told.',
    choices: [
      { label: 'Send false orders to Valentine\'s agents (AIM)', check: { stat: 'aim', dc: 14 }, ok: { text: 'You send every agent in the region fifty miles in the wrong direction. (+20 pace; flag: agents misdirected.)', fx: g => { g.pace(20); g.flag('agentOrders'); } }, fail: { text: 'An operator at the other end recognises the fake.', fight: { enemies: ['agent', 'agent', 'soldier'] } } },
      { label: 'Cut the wire and take it', ok: { text: 'Nobody gets messages about you for a while. (Gain Telegraph Wire ×4.)', fx: g => g.mat('wire', 4) } },
    ] },
  { id: 'riverboat', acts: [3], type: 'shop', title: 'Riverboat Market', blurb: 'A paddle steamer selling everything.', icon: 'tent', weight: 2, pace: -3, art: 'ringo', shop: 'general' },

  /* ---------- Act IV ---------- */
  { id: 'frozenlake', acts: [4], type: 'event', title: 'Frozen Lake', blurb: 'The shortcut is across the ice. Something moves beneath it.', icon: 'hourglass', weight: 2, pace: 0,
    text: 'Halfway across, you see a man frozen in the ice below you — one of the eleven synchronised riders. His eyes open.',
    choices: [
      { label: 'Break him out and question him', ok: { text: 'He fights the moment he\'s free.', fight: { enemies: ['tattoo', 'tattoo'], after: g => g.mat('wolfpelt', 2) } } },
      { label: 'Race across before the ice cracks (RIDING)', check: { stat: 'ride', dc: 13 }, ok: { text: 'Hooves skate, but hold. +18 pace.', fx: g => g.pace(18) }, fail: { text: 'The ice gives way. Freezing water. (Everyone −10 HP.)', fx: g => g.hurtAllFlat(10) } },
    ] },
  { id: 'wolfpack', acts: [4], type: 'fight', title: 'Howls in the Snow', blurb: 'Yellow eyes between the pines.', icon: 'sword', weight: 2, pace: -3, fight: { enemies: ['wolf', 'wolf', 'wolf'] } },
  { id: 'lumber', acts: [4], type: 'shop', title: 'Lumber Camp Store', blurb: 'Lumberjacks sell supplies to racers.', icon: 'tent', weight: 2, pace: -3, art: 'benjamin', shop: 'general' },
  { id: 'aurora', acts: [4], type: 'event', title: 'Northern Lights', blurb: 'The sky ripples green and violet.', icon: 'star', weight: 1.5, once: true, pace: -4,
    text: 'Johnny stares up for a long time. "Gyro... do you think the Saint saw lights like this?" Gyro doesn\'t answer. He\'s drawing rectangles in the snow.',
    choices: [
      { label: 'Draw the Golden Rectangle together', ok: { text: 'The lines spiral inward forever. (Party +1 SPIN; Johnny +1 AIM.)', fx: g => { g.statUpAll('spin', 1); g.statUp('johnny', 'aim', 1); } } },
      { label: 'Sleep beneath the lights', ok: { text: 'The best sleep of the race. (Heal 50%, remove 1 Exhaustion.)', fx: g => { g.healAll(0.5); g.unexhaust(1); } } },
    ] },
  { id: 'pocorace', acts: [4], type: 'event', title: 'Pocoloco\'s Shortcut', blurb: 'The lucky farmer swerves toward a chasm.', icon: 'horseshoe', weight: 2, once: true, pace: 0, art: 'pocoloco',
    text: 'Pocoloco veers around a deep chasm, following his Stand. The direct route is a sheer drop.',
    choices: [
      { label: 'Rope across the chasm with steel balls (SPIN)', check: { stat: 'spin', dc: 14 }, ok: { text: 'You beat luck itself. +25 pace, and a steel ball shard stays embedded in the rock for you to take.', fx: g => { g.pace(25); g.mat('ballfrag', 2); } }, fail: { text: 'The rope slips. (Everyone −6 HP.)', fx: g => g.hurtAllFlat(6) } },
      { label: 'Follow Pocoloco\'s luck', ok: { text: 'Hey Ya leads you past a buried trapper\'s cache. (+8 pace, gain Sage Bundle.)', fx: g => { g.pace(8); g.gear('sage_bundle'); } } },
    ] },

  /* ---------- Act V & VI ---------- */
  { id: 'market', acts: [5], type: 'shop', title: 'Philadelphia Market', blurb: 'Stalls crowd the cobblestones.', icon: 'tent', weight: 2, pace: -3, art: 'steven', shop: 'city' },
  { id: 'mirror', acts: [5, 6], type: 'event', title: 'A Crack Between Worlds', blurb: 'Two flags overlap. Your reflection moves on its own.', icon: 'question', weight: 2, once: true, pace: -2,
    text: 'Between a flag and a wall, the air folds. On the other side stands another Johnny Joestar — one who never touched the steel ball. He looks at your legs with hatred.',
    choices: [
      { label: 'Fight your parallel self', ok: { text: 'Two of the same person can\'t share a world for long.', fight: { enemies: ['parallel', 'parallel'], after: g => g.mat('menger', 3) } } },
      { label: 'Reach through and take his gear (LUCK)', check: { stat: 'luck', dc: 13 }, ok: { text: 'You pull back a Menger Cube before the fold snaps shut.', fx: g => g.gear('menger_cube') }, fail: { text: 'Your arm starts crumbling into tiny cubes. (Johnny −30% HP, gains 1 Exhaustion.)', fx: g => { g.hurt('johnny', 0.3); g.exhaust('johnny', 1); } } },
    ] },
  { id: 'sewer', acts: [5, 6], type: 'event', title: 'Sewer Detour', blurb: 'A manhole offers a shortcut under the city.', icon: 'search', weight: 2, pace: 0,
    text: 'Down in the sewers, a Presidential guard is dragging a woman in a nun\'s habit toward a boat.',
    choices: [
      { label: 'Stop the guard', ok: { text: 'He whistles for help.', fight: { enemies: ['vguard', 'vguard'], after: g => { g.flag('savedNun'); g.gear('guilt_rosary'); } } } },
      { label: 'Slip past unseen (GRIT)', check: { stat: 'grit', dc: 12 }, ok: { text: 'Disgusting, but fast. +15 pace.', fx: g => g.pace(15) }, fail: { text: 'You slip into the water. The guards spot you.', fight: { enemies: ['vguard', 'vguard'] } } },
    ] },
  { id: 'newsboy', acts: [5, 6], type: 'event', title: 'Extra! Extra!', blurb: 'A newsboy who knows too much.', icon: 'book', weight: 1.5, once: true, pace: 0, art: 'marco',
    text: '"EXTRA! Diego Brando leads!" He lowers his voice. "Mister, a lady with the President\'s wife\'s face gave me this for Johnny Joestar."',
    choices: [
      { label: 'Read Lucy\'s note', ok: { text: '"The Heart is with him. The Head is with me. Hurry." (+15 pace; your party gains Refreshed-like resolve: +1 RESOLVE to all.)', fx: g => { g.pace(15); g.statUpAll('res', 1); } } },
      { label: 'Pay him to spy on the guards ($15)', cost: { money: 15 }, ok: { text: 'He comes back with their patrol times. (+25 pace.)', fx: g => g.pace(25) } },
    ] },
  { id: 'lastsaloon', acts: [6], type: 'shop', title: 'Bowery Saloon', blurb: 'The last bar before the finish line.', icon: 'tent', weight: 3, pace: -3, art: 'thug', shop: 'city' },

  /* ---------- payoffs: earlier choices come back ---------- */
  { id: 'brother', acts: [2, 3, 4], type: 'elite', title: 'The Brother\'s Revenge', blurb: 'A rider has been following your trail since the desert.', icon: 'skull', weight: 4, once: true, pace: -4, art: 'gunslinger', cond: g => g.hasFlag('robbed'),
    text: '"You left my little brother in a ditch and stole everything he had." He isn\'t alone.',
    choices: [
      { label: 'Draw', ok: { text: 'No talking your way out of this one.', fight: { enemies: ['gunslingerboss', 'rival_racer', 'rival_racer'], after: g => g.gear('winchester') } } },
      { label: 'Give back what you took and apologise (RES)', check: { stat: 'res', dc: 15 }, ok: { text: 'He spits, but lowers his gun. "You\'re lucky you still have a conscience." (Johnny +2 RESOLVE.)', fx: g => { g.statUp('johnny', 'res', 2); g.spendMat('leather', 2); } }, fail: { text: 'He doesn\'t want apologies.', fight: { enemies: ['gunslingerboss', 'rival_racer'] } } },
    ] },
  { id: 'repaid', acts: [3, 4, 5], type: 'recruit', title: 'A Debt Repaid', blurb: 'Two brothers ride up beside you — one of them waving.', icon: 'recruit', weight: 4, once: true, pace: 6, art: 'marco', cond: g => g.hasFlag('helpedRacer'),
    text: 'The boy from the ditch — and his older brother, a racer with a hunter\'s scope on his rifle. "We Blackwoods pay our debts."',
    choices: [
      { label: 'Accept the brother\'s rifle', ok: { text: 'A Winchester with a hunter\'s scope. (Gain Winchester \'73 and Hunter\'s Scope.)', fx: g => { g.gear('winchester'); g.gear('scope'); } } },
      { label: 'Ask them to scout ahead for you', ok: { text: 'They find a route no map shows. (+25 pace, and every later sprint starts with extra pace this act.)', fx: g => g.pace(25) } },
    ] },
  { id: 'scoutreturns', acts: [3, 4], type: 'event', title: 'The Scout Returns', blurb: 'The young scout from the spring rides out of the grass.', icon: 'recruit', weight: 4, once: true, pace: 5, art: 'sandman', cond: g => g.hasFlag('scoutFriend'),
    text: '"My brother Sandman runs for our land. He will come for you one day. When he does — listen for the sound. Do not touch what speaks."',
    choices: [
      { label: 'Accept his warning and his gift', ok: { text: 'He gives you an Eagle Feather charm blessed by his people. (Flag: you know how Silent Way works.)', fx: g => { g.gear('eagle_feather'); g.flag('silentWarning'); } } },
      { label: 'Ask him to guide you', ok: { text: 'He leads you along paths older than the country. (+20 pace, party +1 RIDING.)', fx: g => { g.pace(20); g.statUpAll('ride', 1); } } },
    ] },
  { id: 'warpaint', acts: [2, 3], type: 'elite', title: 'Riders at Dusk', blurb: 'Five riders block the trail. The scout from the spring is with them.', icon: 'skull', weight: 4, once: true, pace: -4, art: 'sandman', cond: g => g.hasFlag('scoutEnemy'),
    text: '"These are the ones who took our water." There\'s no way around them.',
    choices: [
      { label: 'Fight', ok: { text: 'Arrows and rifles.', fight: { enemies: ['outlaw', 'outlaw', 'cougar'], after: g => g.mat('feather', 3) } } },
      { label: 'Offer your healing supplies (RES)', check: { stat: 'res', dc: 14 }, ok: { text: 'You hand over bandages and water. The scout nods — the debt is paid. (Lose an item, flag cleared.)', fx: g => { g.loseItem(); g.flag('scoutFriend'); } }, fail: { text: 'They don\'t want your charity.', fight: { enemies: ['outlaw', 'outlaw', 'cougar'] } } },
    ] },
  { id: 'farrierpay', acts: [3, 4, 5], type: 'event', title: 'The Farrier\'s Father', blurb: 'A prisoner in a government wagon shouts your name.', icon: 'question', weight: 4, once: true, pace: -3, cond: g => g.hasFlag('farrierPromise'),
    text: 'An old blacksmith in chains. "My daughter shod your horse, didn\'t she? I recognise my own work." Two guards drive the wagon.',
    choices: [
      { label: 'Free him', ok: { text: 'Keeping a promise.', fight: { enemies: ['soldier', 'soldier'], after: g => { g.gear('bear_mantle'); g.statUpAll('grit', 1); } } } },
      { label: 'Tell him you\'ll send word to his daughter', ok: { text: 'He tells you where he hid his best work. (Gain Iron Stirrups.)', fx: g => g.gear('stirrups') } },
    ] },
];
// helper enemy aliases
SBR.ENEMIES.outlawish = SBR.ENEMIES.outlaw;
SBR.ENEMIES.gunslingerboss = Object.assign({}, SBR.ENEMIES.outlaw, { name: 'Vengeful Gunslinger', tier: 'elite', hp: 44, xp: 18, money: [15, 25] });

/* Shop stock definitions */
SBR.SHOPS = {
  general: { name: 'Travelling Merchant', items: 3, relics: 2, rarities: ['common', 'common', 'rare'] },
  trapper: { name: 'Trapper\'s Cabin', items: 4, relics: 1, rarities: ['common'] },
  city: { name: 'City Market', items: 3, relics: 3, rarities: ['common', 'rare', 'rare'] },
  sugar: { name: 'Sugar Mountain Casino Town', items: 5, relics: 4, rarities: ['common', 'rare', 'rare', 'rare'] },
};
