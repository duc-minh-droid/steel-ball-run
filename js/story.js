/* Story: acts, race stages and dialogue scenes (original dialogue inspired by SBR) */
'use strict';

SBR.ACTS = {
  1: { name: 'Act I', title: 'The West', sub: '1st & 2nd Stage — San Diego Beach to the Arizona Desert', stages: 6, route: 1, scene: 1,
    intro: 'act1_intro',
    story: { 3: 'st_robinson', 4: 'st_tim' },
    boss: { enemies: ['benjamin', 'andre', 'laboom'], name: 'Tomb of the Boom', pre: 'boom_pre', post: 'boom_post', midRound: { 2: 'tusk_awaken' } },
    finish: { name: '2nd Stage Finish — Monument Valley Road', favourite: 'diego' } },
  2: { name: 'Act II', title: 'The Rockies', sub: '3rd Stage — Monument Valley to the Rocky Mountains', stages: 7, route: 3, scene: 2,
    intro: 'act2_intro',
    story: { 2: 'st_oyecomova', 3: 'st_zombiehorse', 4: 'st_leftarm', 5: 'st_porkpie' },
    boss: { enemies: ['ferdinand'], name: 'Scary Monsters', pre: 'ferd_pre', post: 'ferd_post' },
    finish: { name: '3rd Stage Finish — Rocky Mountain Pass', favourite: 'hotpants' } },
  3: { name: 'Act III', title: 'The Midwest', sub: '4th & 5th Stage — Kansas City to the Mississippi', stages: 7, route: 5, scene: 3,
    intro: 'act3_intro',
    story: { 2: 'st_hotpants', 4: 'st_ringo', 5: 'st_blackmore' },
    boss: { enemies: ['sandman'], name: 'In a Silent Way', pre: 'sand_pre', post: 'sand_post', midRound: { 2: 'tusk2_awaken' } },
    finish: { name: '5th Stage Finish — Across the Mississippi', favourite: 'diego' } },
  4: { name: 'Act IV', title: 'The North', sub: '6th & 7th Stage — Lake Michigan to Philadelphia', stages: 7, route: 6, scene: 4,
    intro: 'act4_intro',
    story: { 2: 'st_sugar', 3: 'st_tattoo', 5: 'st_wekapipo' },
    boss: { enemies: ['axl'], name: 'Civil War', pre: 'axl_pre', post: 'axl_post' },
    finish: { name: '7th Stage Finish — Philadelphia', favourite: 'diego' } },
  5: { name: 'Act V', title: 'The East Coast', sub: '8th Stage — Philadelphia to the Atlantic Shore', stages: 7, route: 7, scene: 5,
    intro: 'act5_intro',
    story: { 2: 'st_disco', 3: 'st_mikeo', 5: 'st_valentine' },
    boss: { enemies: ['lovetrain'], name: 'Love Train', pre: 'lt_pre', post: 'lt_post' },
    finish: { name: '8th Stage Finish — New Jersey Shore', favourite: 'pocoloco' } },
  6: { name: 'Act VI', title: 'New York', sub: '9th Stage — The Final Stretch', stages: 3, route: 8, scene: 6,
    intro: 'act6_intro',
    story: { 2: 'st_gasoline' },
    boss: { enemies: ['diego_world'], name: 'THE WORLD', pre: 'world_pre', post: 'world_post' },
    finish: { name: 'FINAL STAGE — Brooklyn Bridge to Trinity Church', favourite: 'diego', final: true } },
};

/* Race rivals for the leaderboard */
SBR.RIVALS = {
  diego: { name: 'Diego Brando', portrait: 'diego', speed: 0.95 },
  pocoloco: { name: 'Pocoloco', portrait: 'pocoloco', speed: 0.9 },
  hotpants: { name: 'Hot Pants', portrait: 'hotpants', speed: 0.9 },
  gyro: { name: 'Gyro Zeppeli', portrait: 'gyro', speed: 0.92 },
  sandman: { name: 'Sandman', portrait: 'sandman', speed: 0.93, outAfter: 3 },
  mountaintim: { name: 'Mountain Tim', portrait: 'mountaintim', speed: 0.86, outAfter: 3 },
  dothan: { name: 'Dot Han', portrait: 'gunslinger', speed: 0.85 },
  norisuke: { name: 'Norisuke Higashikata IV', portrait: 'steven', speed: 0.82 },
};
SBR.POINTS = [100, 50, 25, 20, 17, 15, 12, 10, 8, 5];

/* Dialogue scenes: lines of {who, text, mood} or {narr} ; optional fx(g) at end */
SBR.STORY = {
  prologue: { bg: 1, lines: [
    { narr: 'San Diego, 1890. Three thousand eight hundred and fifty-two riders have come to cross an entire continent.' },
    { narr: 'Six thousand kilometres. Nine stages. A grand prize of fifty million dollars.' },
    { who: 'steven', text: 'Ladies and gentlemen! The greatest horse race in the history of mankind — the STEEL BALL RUN — begins tomorrow at dawn!' },
    { narr: 'At the registration tent, a man in a strange hat throws a steel ball at a thief. It spins in place on his shoulder... and the thief shoots himself.' },
    { who: 'gyro', text: 'Nyo-ho-ho~! Don\'t mind me. Just teaching a lesson about rotation.' },
    { narr: 'A young man in a wheelchair reaches out and touches the still-spinning ball.' },
    { narr: 'For one impossible second — his legs move. He STANDS.', mood: 'menace' },
    { who: 'johnny', text: 'W-what did you just do to me? My legs... I felt my legs!' },
    { who: 'gyro', text: 'I did nothing, wheelchair boy. The Spin did. And it\'s none of your business.' },
    { who: 'johnny', text: '(If I follow that ball... maybe I can walk again. I\'m entering this race. I\'m going to learn its secret.)' },
    { narr: 'This is the story of Johnny Joestar learning to walk — not with his legs, but from adolescence to adulthood.' },
  ] },
  sprint_tutorial: { bg: 1, lines: [
    { who: 'steven', text: 'The 1st Stage — fifteen thousand metres of beach! Riders, take your marks!' },
    { narr: 'TUTORIAL — At every stage finish you\'ll race. Watch the spinning ring. Press SPACE (or click) when the needle crosses the GOLDEN zone to surge ahead. Miss, and your horse stumbles.' },
    { narr: 'Your PACE from the act gives you a head start. Rest and scavenge too much and you\'ll start behind.' },
  ] },
  act1_intro: { bg: 1, lines: [
    { narr: 'Gyro took the 1st Stage... and was immediately penalised for endangering Sandman. The 2nd Stage stretches 1,200 kilometres across the Arizona Desert.' },
    { who: 'gyro', text: 'You again? You\'re like a stray dog, Johnny. Fine. Follow me if you can keep up. But I\'m not teaching you anything.' },
    { who: 'johnny', text: 'You don\'t have to teach me. I\'ll watch.' },
    { who: 'gyro', text: 'Heh. Rule one: what matters isn\'t the ball. It\'s the rotation. Remember that.' },
    { narr: 'GYRO ZEPPELI rides with you. Each stage, choose an encounter. The desert is deliberately unkind.' },
  ], fx: g => g.recruit('gyro', true) },
  st_robinson: { card: { title: 'Cacti That Twitch', blurb: 'The cacti along the trail are moving.', icon: 'skull' }, bg: 1, lines: [
    { narr: 'Something buzzes in the cactus flowers. Thousands of insects rise at once.' },
    { who: 'robinson', text: 'Leaving the favourites alive is bad business. Let\'s thin the herd, amigos.' },
    { who: 'gyro', text: 'He\'s putting bugs in people\'s eyes? Disgusting. Johnny, stay behind me.' },
  ], fight: { enemies: ['robinson'], elite: true } },
  st_tim: { card: { title: 'The Cowboy Tracker', blurb: 'A famous cowboy is studying horseshoe prints.', icon: 'recruit' }, bg: 1, lines: [
    { narr: 'Racers have been turning up dead along the trail. The sheriff has called in a man who can read hoofprints like a newspaper.' },
    { who: 'mountaintim', text: 'Mountain Tim. You boys have been riding the same trail as a murderer. These prints... they don\'t match Mrs. Robinson\'s horse.' },
    { who: 'johnny', text: 'Then the killer is still out here.' },
    { who: 'mountaintim', text: 'And you two are next on the list, I\'d wager. I\'ve got a... talent. From a place the natives call the Devil\'s Palm. Mind if I ride along?' },
  ], fx: g => { g.recruit('mountaintim'); g.achieve('tim'); } },
  boom_pre: { bg: 1, lines: [
    { narr: 'Night falls. A sandstorm. Three shadows approach — and every scrap of iron in the desert begins to rise.', mood: 'menace' },
    { who: 'benjamin', text: 'The Boomboom family was paid well to bury the Zeppeli boy. Nothing personal.' },
    { who: 'laboom', text: 'Papa, their blood is already on the sand. The magnet\'s got \'em!' },
    { who: 'mountaintim', text: 'Stay sharp. We\'re standing inside something... the ground is WARPED here.' },
  ] },
  tusk_awaken: { bg: 1, lines: [
    { narr: 'The ground beneath Johnny caves inward. The Devil\'s Palm has been moving under them the whole time.', mood: 'menace' },
    { who: 'johnny', text: 'My fingernails... they\'re SPINNING. Something is standing beside me.' },
    { narr: 'STAND AWAKENED — TUSK ACT1. Johnny learns Nail Shot and Nail Bullet.', mood: 'shout' },
  ] },
  boom_post: { bg: 1, lines: [
    { who: 'laboom', text: 'W-wait! We were hired! Somebody paid to have the Zeppeli boy killed before the race even started!' },
    { who: 'gyro', text: '...Then I suppose I should tell you why I\'m really here, Johnny.' },
    { narr: 'Gyro tells of Naples. Of his family\'s office as royal executioners. Of a boy named Marco, condemned to die for nothing.' },
    { who: 'gyro', text: 'If I win this race, the King may grant an amnesty. That\'s all. That\'s the whole reason.' },
    { who: 'johnny', text: 'Then we both have a reason to reach New York.' },
  ], fx: g => { g.flag('tusk1'); } },
  act2_intro: { bg: 2, lines: [
    { narr: 'Beyond the desert rise the red towers of Monument Valley. Someone has read the letter Gyro left behind.' },
    { who: 'gyro', text: 'There\'s a healing plant up in these mountains. The Zombie Horse. My family\'s notes say so.' },
    { who: 'johnny', text: 'Then why do I feel like we\'re being followed?' },
  ] },
  st_oyecomova: { card: { title: 'A Pin in the Ground', blurb: 'A man from Naples hums a rhythm.', icon: 'skull' }, bg: 2, lines: [
    { narr: 'A relay village. Every doorknob, every rock, every pebble has a tiny pin pressed into it.', mood: 'menace' },
    { who: 'oyecomova', text: 'Zeppeli. The dog of the Neapolitan crown. Do you hear it? That is the sound of the kingdom falling.' },
    { who: 'gyro', text: 'A terrorist. Of course they sent a terrorist. Don\'t touch anything he\'s touched!' },
  ], fight: { enemies: ['oyecomova'], elite: true } },
  st_zombiehorse: { card: { title: 'The Zombie Horse', blurb: 'A legendary healing plant grows on the cliffs.', icon: 'fire' }, bg: 2, lines: [
    { narr: 'High on the canyon wall, thin threads of a strange plant dangle in the wind.' },
    { who: 'gyro', text: 'The Zombie Horse. Thread it through a wound and the flesh knits itself shut. Stings like the devil.' },
    { narr: 'The party is fully healed. You keep a length of the thread.', mood: 'shout' },
  ], fx: g => { g.healAll(1); g.relic('zombiehorse'); } },
  st_leftarm: { card: { title: 'The Left Arm', blurb: 'Johnny\'s arm feels wrong. Heavy. Holy.', icon: 'corpse' }, bg: 2, lines: [
    { who: 'stroheim', text: 'HALT! In the name of German precision, your belongings are forfeit!' },
    { narr: 'The soldier is disposed of in moments. But during the struggle, Johnny notices something inside his own left arm.' },
    { who: 'johnny', text: 'There\'s... a mummified arm. Inside mine. It merged with me.' },
    { who: 'gyro', text: 'That\'s why everyone keeps trying to kill us. That\'s not a relic, Johnny. That\'s a piece of a SAINT.' },
    { narr: 'CORPSE PART OBTAINED — LEFT ARM. The Steel Ball Run\'s true purpose begins to show.', mood: 'shout' },
  ], fight: { enemies: ['stroheim'], elite: true }, after: g => { g.relic('c_leftarm'); g.maxHp('johnny', 12); } },
  st_porkpie: { card: { title: 'Hooks in the Rock', blurb: 'Fishing line glints between the boulders.', icon: 'skull' }, bg: 2, lines: [
    { narr: 'Gyro is yanked off his horse by an invisible line. Something reels him toward the rocks.' },
    { who: 'porkpie', text: 'Heheh! Got one! The President pays by the pound!' },
    { who: 'johnny', text: 'Tusk... I can hear it whispering. Movere crus. Move... your legs?' },
  ], fight: { enemies: ['porkpie'], elite: true } },
  ferd_pre: { bg: 2, lines: [
    { narr: 'A village in the Rockies. The villagers are gone. In their place — dinosaurs wearing their clothes.', mood: 'menace' },
    { who: 'diegodino', text: 'Welcome, Joestar. You and the Zeppeli fool are about to go extinct.' },
    { who: 'ferdinand', text: 'Man is a disease upon this land. My Scary Monsters returns you to nature. The Saint\'s eyes belong in its soil.' },
    { who: 'gyro', text: 'Johnny... my hand... it\'s growing scales...' },
  ] },
  ferd_post: { bg: 2, lines: [
    { narr: 'Dr. Ferdinand falls, and the cougars of the Rockies are not merciful to him.' },
    { who: 'johnny', text: 'Gyro! Catch!' },
    { narr: 'Johnny throws one of the Saint\'s Eyes. Gyro\'s scales melt away, and his vision sees straight through stone.' },
    { who: 'gyro', text: 'I can see... inside things. The bones, the veins. Nyo-ho, this is going to be useful.' },
    { who: 'diegodino', text: 'Keep that one. The other eye is MINE.' },
    { narr: 'Diego escapes with the left eye. Gyro gains SCAN. CORPSE PART OBTAINED — RIGHT EYE.', mood: 'shout' },
  ], fx: g => { g.flag('eyes'); g.relic('c_eyes'); } },
  act3_intro: { bg: 3, lines: [
    { narr: 'The 4th Stage: 1,250 kilometres of plains and forest toward Kansas City. Storm clouds gather over the grass.' },
    { who: 'gyro', text: 'The racer who won the last stage — Hot Pants. My Scan saw something in their spine. A map. A Corpse Part.' },
    { who: 'johnny', text: 'Then we\'re not the only ones hunting it.' },
  ] },
  st_hotpants: { card: { title: 'A Stolen Cow', blurb: 'A racer stands over a slaughtered cow.', icon: 'recruit' }, bg: 3, lines: [
    { who: 'hotpants', text: 'You. You killed my cow. That was my dinner for three days.' },
    { who: 'johnny', text: 'We didn\'t touch your cow!' },
    { who: 'hotpants', text: 'Then prove it. Or I spray the flesh off your bones.' },
  ], choices: [
    { label: 'Talk them down', check: { stat: 'res', dc: 13 }, ok: { text: 'Johnny shows the wound — a bullet, not a steel ball or nail. Hot Pants lowers the weapon. "...Fine. I\'ll ride with you. For now."', fx: g => { g.recruit('hotpants'); g.achieve('hotpants'); } }, fail: { text: 'Hot Pants doesn\'t believe a word. Flesh sprays across the trail!', fight: { enemies: ['hotpants_foe'], elite: true, after: g => { g.recruit('hotpants'); g.achieve('hotpants'); g.say('hotpants', 'You fight honestly. Fine. I\'ll ride with you.'); } } } },
    { label: 'Draw weapons', ok: { text: 'No time for words.', fight: { enemies: ['hotpants_foe'], elite: true, after: g => { g.recruit('hotpants'); g.achieve('hotpants'); g.say('hotpants', 'You didn\'t kill it. I can see that now. I\'ll ride with you.'); } } } },
  ] },
  st_ringo: { card: { title: 'The Same Cabin', blurb: 'You\'ve passed this cabin four times now.', icon: 'crown' }, bg: 3, lines: [
    { narr: 'No matter which way they ride, the trail loops back to the same cabin. Smoke rises from the chimney.', mood: 'menace' },
    { who: 'ringo', text: 'I apologise for the inconvenience. Nobody leaves the Man\'s World until the duel is settled.' },
    { who: 'ringo', text: 'My watch turns back six seconds. Only six. But six is enough to decide who lives.' },
    { who: 'gyro', text: 'Johnny. He\'s mine. If I can\'t win this with my own will, I don\'t deserve to win the race.' },
  ], fight: { enemies: ['ringo'], boss: true }, after: g => { g.say('ringo', 'You have walked the path of the Man\'s World. Go on... the way is open.'); } },
  st_blackmore: { card: { title: 'A Storm Over Kansas', blurb: 'The rain stops falling. It hangs in the air.', icon: 'crown' }, bg: 3, lines: [
    { narr: 'News arrives by telegraph: Mountain Tim has been found dead in a Kansas City street, helping a young woman escape the President\'s men.' },
    { who: 'lucy', text: 'Are you Johnny Joestar? Mr. Tim told me to find you. I have... something they want. The Spine.' },
    { who: 'blackmore', text: 'Sumimasen, young lady. The rain has been following you all night.' },
    { who: 'gyro', text: 'The raindrops are frozen in place. A steel ball could evaporate a path...' },
  ], fx: g => g.dismiss('mountaintim', 'Mountain Tim has fallen. His rope is all that\'s left.'), fight: { enemies: ['blackmore'], boss: true }, after: g => { g.relic('c_spine'); g.say('lucy', 'The Spine shows where the other parts are... Please. Take it. I\'ll find a way to help from inside.'); } },
  sand_pre: { bg: 3, lines: [
    { narr: 'A cottage by the Mississippi. The walls speak. Every touch makes a sound — and every sound cuts.', mood: 'menace' },
    { who: 'johnny', text: 'Nicholas... my brother died because of a white mouse. Because of me. Fate brings me to my happiest moment and then takes everything.' },
    { who: 'gyro', text: 'Oi. Look at me, Johnny. You haven\'t even begun to master the Spin. Listen: the Golden Rectangle. A ratio found in nature. A perfect, infinite rotation.' },
    { narr: 'GOLDEN RECTANGLE LEARNED — Gyro gains GOLDEN SPIN.', mood: 'shout' },
    { who: 'sandman', text: 'I ran here from Arizona. Faster than your horses. My people\'s land will be bought back with the Corpse. Step aside or be erased.' },
  ], fx: g => { g.flag('golden'); g.achieve('golden'); } },
  tusk2_awaken: { bg: 3, lines: [
    { who: 'johnny', text: 'The Golden Rectangle is everywhere... even in a white mouse. I see it.' },
    { narr: 'STAND EVOLVED — TUSK ACT2. The hole now chases its target. Johnny learns Spinning Hole.', mood: 'shout' },
  ] },
  sand_post: { bg: 3, lines: [
    { narr: 'Sandman falls into the river. A bullet made from Gyro\'s belt buckle found him.' },
    { narr: 'Then — darkness. When Johnny wakes, Hot Pants is gone. So are the Corpse Parts.', mood: 'menace' },
    { who: 'gyro', text: 'That snake. Hot Pants was an agent of the Vatican all along. They left us a sliver of the Spine and nothing else.' },
  ], fx: g => { g.loseCorpse(['c_spine']); g.dismiss('hotpants', 'Hot Pants vanished with the Corpse Parts.'); } },
  act4_intro: { bg: 4, lines: [
    { narr: 'The 6th Stage. The land turns cold and blue. Eleven horses follow at a distance, moving in perfect unison.', mood: 'menace' },
    { who: 'gyro', text: 'Eleven of them. Breathing at the same time. That\'s not natural, Johnny.' },
  ] },
  st_sugar: { card: { title: 'The Golden Axe', blurb: 'A girl asks: did you drop the gold, or the diamond?', icon: 'star' }, bg: 4, lines: [
    { narr: 'One of Gyro\'s steel balls rolls into a spring. A girl climbs out of a great tree holding it.' },
    { who: 'sugar', text: 'Did you drop this gold? Or this diamond? Or this plain steel ball?' },
    { who: 'gyro', text: '...The steel ball.' },
    { who: 'sugar', text: 'You are honest. Take all three. But everything you receive must be used up before sunset. Or the tree will take you.' },
    { narr: 'You receive $600 and two Corpse Parts — the EARS and the RIGHT ARM. Spend everything before the next stage ends, or be swallowed by the tree.', mood: 'menace' },
  ], fx: g => { g.sugar(); } },
  st_tattoo: { card: { title: 'The Eleven', blurb: 'The synchronised riders finally strike.', icon: 'skull' }, bg: 4, lines: [
    { who: 'tattoo', text: 'Tattoo You! We are eleven. We are one. We will phase through your flesh.' },
    { who: 'johnny', text: 'They slip in and out of each other\'s bodies!' },
  ], fight: { enemies: ['tattoo', 'tattoo', 'tattoo', 'tattoo'] } },
  st_wekapipo: { card: { title: 'The Frozen Strait', blurb: 'A wolf follows you across the ice.', icon: 'crown' }, bg: 4, lines: [
    { narr: 'A frozen strait. A steel ball with tiny satellites comes screaming out of nowhere — and the left side of the world disappears.', mood: 'menace' },
    { who: 'magent', text: 'Hahaha! Kneel and nothing can touch me! Isn\'t modern technology wonderful?' },
    { who: 'wekapipo', text: 'Gyro Zeppeli. The Royal Guard\'s technique is forbidden to your family. I will destroy every model of the Golden Rectangle you could use.' },
  ], fight: { enemies: ['wekapipo_foe', 'magent'], boss: true }, after: g => {
    g.relic('c_legs');
    g.scene('weka_spare');
  } },
  weka_spare: { bg: 4, lines: [
    { narr: 'Snow falls. Gyro reads the Golden Rectangle in the snowflakes, and the ball finds its mark. The Corpse\'s LEGS emerge from the wolf.' },
    { who: 'wekapipo', text: '...Finish it, Zeppeli.' },
    { who: 'gyro', text: 'No. Your sister is alive, Wekapipo. She\'s hiding in the countryside. Go and live.' },
    { who: 'wekapipo', text: '...Then I owe you a debt. Tell me how to repay it.' },
  ], choices: [
    { label: 'Ride with us', ok: { text: 'Wekapipo mounts up beside you. "I will guard your backs as I once guarded a king."', fx: g => { g.recruit('wekapipo'); g.achieve('weka'); } } },
    { label: 'Protect Lucy Steel instead', ok: { text: 'Wekapipo nods and rides east. "The girl will be safe." (You gain a Cavalry Sabre he leaves behind.)', fx: g => { g.relic('cavalry'); g.flag('wekaLucy'); } } },
  ] },
  axl_pre: { bg: 4, lines: [
    { narr: 'Ninety miles west of Philadelphia. A garbage dump. A woman in a nun\'s habit. And Hot Pants, frozen in terror.', mood: 'menace' },
    { who: 'hotpants', text: 'My brother... I let the bear take him. He\'s standing right there...' },
    { who: 'axl', text: 'Civil War. I return to each of you what you discarded. I carry none of my own sins anymore.' },
    { who: 'johnny', text: 'Nicholas...?' },
  ] },
  axl_revive: { bg: 4, lines: [
    { narr: 'Axl RO rises. His sins pour into Johnny — the soldiers of Gettysburg, dead because one man ran.', mood: 'menace' },
    { who: 'johnny', text: 'Don\'t shoot with doubt in your heart... I understand now. The hole goes through ME.' },
    { narr: 'Johnny shoots himself. STAND EVOLVED — TUSK ACT3. Johnny learns Wormhole.', mood: 'shout' },
  ] },
  axl_post: { bg: 4, lines: [
    { narr: 'Axl RO lunges — and is shot from behind.' },
    { who: 'valentine', text: 'I fired to protect another. His Stand has no hold on me.' },
    { narr: 'President Funny Valentine gathers every Corpse Part in the dump — yours included — and walks away untouched.', mood: 'menace' },
    { who: 'valentine', text: 'The napkin, Joestar. Whoever takes the first napkin decides the rules for everyone at the table.' },
  ], fx: g => g.loseCorpse([]) },
  act5_intro: { bg: 5, lines: [
    { narr: 'Philadelphia. The sky turns the colour of rust. Somewhere in Independence Hall, Lucy Steel is carrying the Saint\'s Head inside her.' },
    { who: 'gyro', text: 'Diego won the last stage. Valentine has almost everything. Johnny... we could stop here.' },
    { who: 'johnny', text: 'No. I stood up again, Gyro. For a moment. I\'m not stopping until I can walk.' },
  ] },
  st_disco: { card: { title: 'The Checkered Grid', blurb: 'Lines of light divide the park.', icon: 'skull' }, bg: 5, lines: [
    { narr: 'A grid appears on the ground. Anything that crosses a square vanishes and reappears exactly where D-I-S-C-O wants it.' },
    { who: 'disco', text: '...' },
    { who: 'gyro', text: 'A quiet one. I hate the quiet ones.' },
  ], fight: { enemies: ['disco'], elite: true } },
  st_mikeo: { card: { title: 'Balloon Animals', blurb: 'Bullets turn into balloons. Balloons turn into needles.', icon: 'recruit' }, bg: 5, lines: [
    { narr: 'In the President\'s mansion, a disguised Lucy is discovered. Balloon animals drift after her through the halls.' },
    { who: 'mikeo', text: 'Tubular Bells always finds its way home. Home is inside your body.' },
    { who: 'lucy', text: 'Johnny! Gyro! Over here!' },
  ], fight: { enemies: ['mikeo'], elite: true }, after: g => { g.recruit('lucy'); } },
  st_valentine: { card: { title: 'Dirty Deeds', blurb: 'The President steps out from between two flags.', icon: 'crown' }, bg: 5, lines: [
    { narr: 'Gunshots from three directions. Witnesses blame three different men. Only one of them was really there.', mood: 'menace' },
    { who: 'valentine', text: 'D4C. I travel between worlds. I am the only one who can exist in two places at once. That is the power of a nation.' },
    { who: 'johnny', text: 'Then we\'ll beat both of you.' },
  ], fight: { enemies: ['valentine1'], boss: true }, after: g => g.scene('diego_alliance') },
  diego_alliance: { bg: 5, lines: [
    { narr: 'Valentine slips away into another world with the eye. Diego limps out of the smoke, bleeding.' },
    { who: 'diego', text: 'Joestar. The Corpse exists in only ONE world. If Valentine gets it all, none of us win. A truce — until he\'s dead.' },
    { who: 'gyro', text: 'I\'d rather trust a rattlesnake.' },
  ], fx: g => g.dismiss('wekapipo', 'Wekapipo was dragged into a parallel world and did not return.'), choices: [
    { label: 'Accept the truce', ok: { text: 'Diego rides with you — for now. "Don\'t turn your back on me, Joestar."', fx: g => g.recruit('diego') } },
    { label: 'Refuse', ok: { text: 'Diego sneers and gallops off alone. You find a pouch of money he dropped.', fx: g => g.money(80) } },
  ] },
  lt_pre: { bg: 5, lines: [
    { who: 'gyro', text: 'Listen, Johnny. The perfect Spin can\'t be made by a human arm. It needs the horse. The horse\'s gait forms the Golden Rectangle. Only then is the rotation truly infinite.' },
    { narr: 'A train races along the coast. Lucy Steel\'s body has become one with the Corpse. Light gathers around the President.', mood: 'menace' },
    { who: 'valentine', text: 'The Saint has blessed me. Every misfortune in the world — every bullet aimed at me — will now travel somewhere else. Perhaps into you.' },
    { narr: 'LOVE TRAIN — Only piercing attacks connect. Golden Spin pierces at 5 Rotation. Status damage still hurts him.', mood: 'shout' },
  ], fx: g => { g.dismiss('diego', 'Diego was cut down beneath Valentine\'s train.'); g.dismiss('lucy', 'Lucy has been taken aboard the President\'s train.'); } },
  ball_breaker_learn: { bg: 5, lines: [
    { who: 'gyro', text: 'Now, Valkyrie! Show me the rectangle!' },
    { narr: 'Gyro\'s horse runs in a perfect golden gait. A Stand forms from the rotation itself. BALL BREAKER is now available.', mood: 'shout' },
  ] },
  gyro_falls: { bg: 5, lines: [
    { narr: 'Ball Breaker withers half of Valentine\'s body. But a sliver of the ball was scraped away. It wasn\'t perfect.', mood: 'menace' },
    { narr: 'Parallel Valentines fire from every angle. Gyro falls from his horse.' },
    { who: 'gyro', text: 'Johnny... the detour... it was the shortest path after all. Nyo... ho...' },
    { who: 'johnny', text: 'GYRO!!!' },
    { narr: 'Johnny picks up Gyro\'s steel ball and throws it at Slow Dancer\'s leg. The horse kicks him into the air. Horse and rider form the Golden Rectangle.', mood: 'menace' },
    { narr: 'STAND EVOLVED — TUSK ACT4. INFINITE ROTATION.', mood: 'shout' },
  ] },
  lt_post: { bg: 5, lines: [
    { who: 'valentine', text: 'Stop, Joestar. Nullify the rotation, and I will bring you another Gyro Zeppeli from a parallel world. I swear it on my father\'s handkerchief.' },
    { narr: 'Johnny throws Valentine\'s own gun onto the ground between them.' },
    { who: 'johnny', text: 'Then pick it up. If you\'re honest, you won\'t.' },
  ], choices: [
    { label: 'Trust him', ok: { text: 'Valentine reaches — and draws a gun from another world. You barely survive the shot (party loses 30% HP). The rotation takes him anyway.', fx: g => g.hurtAll(0.3) } },
    { label: 'Don\'t lower your guard', ok: { text: 'Valentine hesitates... then draws a gun from another world. Johnny is faster. The infinite rotation drags the President beneath the earth.' } },
  ], fx: g => { g.flag('valDead'); g.scene('gyro_farewell'); } },
  gyro_farewell: { bg: 5, lines: [
    { narr: 'Johnny carries Gyro\'s body to the shore. His legs hold him up. He is walking.' },
    { who: 'johnny', text: 'Thank you, Gyro. Thank you... so much.' },
    { narr: 'Gyro Zeppeli has left the party. His steel balls remain with you.', mood: 'shout' },
  ], fx: g => { g.dismiss('gyro', 'Gyro Zeppeli has passed on.', true); g.relic('spareballs'); } },
  act6_intro: { bg: 6, lines: [
    { narr: 'The Corpse is gone. Someone took it from the crater where Valentine died. The hoofprints belong to a racer... Diego Brando\'s horse.', mood: 'menace' },
    { who: 'lucy', text: 'But Diego died on the train... unless this Diego came from another world.' },
    { who: 'johnny', text: 'Then I\'ll end the race where it started for me. On horseback.' },
  ] },
  st_gasoline: { card: { title: 'Gasoline in the Streets', blurb: 'The air smells like fuel.', icon: 'skull' }, bg: 6, lines: [
    { narr: 'Time skips. Suddenly Johnny is soaked in gasoline and a lit match is falling.', mood: 'menace' },
    { who: 'diegoworld', text: 'You didn\'t even notice me move. That is the difference between us.' },
  ], choices: [
    { label: 'Dive into the sewer', check: { stat: 'ride', dc: 14 }, ok: { text: 'Slow Dancer leaps into an open drain. The fire roars overhead.', fx: g => g.pace(10) }, fail: { text: 'You burn before hitting the water. (Johnny loses 40% HP.)', fx: g => g.hurt('johnny', 0.4) } },
    { label: 'Shoot the match', check: { stat: 'aim', dc: 16 }, ok: { text: 'A nail splits the match mid-air. Diego\'s eyes widen for just a moment.', fx: g => { g.xp(40); g.pace(5); } }, fail: { text: 'Missed. The flames catch. (Party loses 25% HP.)', fx: g => g.hurtAll(0.25) } },
  ] },
  world_pre: { bg: 6, lines: [
    { narr: 'The Brooklyn Bridge. The final stretch. A golden figure stands behind Diego.', mood: 'menace' },
    { who: 'diegoworld', text: 'In my world, I lost everything too. Here, I will take it all. THE WORLD!' },
    { narr: 'THE WORLD stops time every third round. Survive it — and reach him with Infinite Rotation.', mood: 'shout' },
  ] },
  world_post: { bg: 6, lines: [
    { narr: 'THE WORLD shatters. Diego staggers back onto his horse, bleeding, and spurs toward the finish line.' },
    { who: 'johnny', text: 'It\'s not over. The race is still on. RIDE, Slow Dancer!' },
  ] },
  epilogue_champion: { bg: 6, lines: [
    { narr: 'Johnny Joestar crosses the finish line at Trinity Church.' },
    { narr: 'The crowd roars. Somewhere, a man in a strange hat is surely grinning with golden teeth.' },
    { who: 'steven', text: 'The winner of the Steel Ball Run... JOHNNY JOESTAR!' },
    { narr: 'Lucy seals the Corpse in the vault. It belongs to no one. Johnny boards a ship to Naples, carrying his friend home.' },
    { who: 'johnny', text: 'Gyro. I walked all the way here. Let\'s go home.' },
  ] },
  epilogue_canon: { bg: 6, lines: [
    { narr: 'Diego crosses the line first — and is disqualified for vanishing into Trinity Church. In the confusion, the official winner is announced...' },
    { who: 'pocoloco', text: 'Me?! I won?! Hey Ya, you were right! It really WAS my lucky day!' },
    { narr: 'Lucy seals the Corpse in the vault. It belongs to no one. Johnny boards a ship to Naples, carrying his friend home.' },
    { who: 'johnny', text: 'Gyro. I walked all the way here. Let\'s go home.' },
  ] },
  gameover: { bg: 1, lines: [
    { narr: 'The trail swallows another racer. Somewhere, a steel ball keeps spinning.' },
  ] },
};
