/* Affinity: every ally has a mind of their own.
   - Each ally (not the lead, not a custom rider) likes and dislikes kinds of roads, particular encounters, and kinds of choices.
   - Picking a card they like raises their bond; picking one they dislike, or passing up one they wanted, lowers it.
   - Event and story choices are read by their label, the deed they record, and the faction reputation they move (SBR.CONSEQ).
   - Bond 0-100, 55 on joining. Devoted (80+) fight harder; Wary (30 or less) start battles with 1 less Energy and ask to talk;
     10 or less and they leave the party at the next safe point (before the next stage's cards are drawn).
   - Johnny and Gyro are bound to the story: their bond never drops below 15. They sulk, they never leave.
     In the final act nobody leaves either: everyone has come too far.
   Also here: SBR.partyPicker, the "party full" chooser that G.recruit defers when a newcomer would make five.
   State lives in SBR.run.affinity (saved with the run). */
'use strict';

SBR.affinity = (() => {
  const { el, clamp, pick } = SBR.util;
  const START = 55, REJOIN = 40, FLOOR = 15, LEAVE = 10, WARY = 30, DEVOTED = 80;
  const BOUND = ['johnny', 'gyro'];
  const DEVOTED_BONUS = { dmg: 0.06, crit: 0.03 };

  /* ---------------- who likes what ----------------
     cards: like/dislike { types, ids, re (tested on title + blurb) }  -> encounter cards on the stage
     choices: like/dislike regexes tested on the choice label + the deed it records; rep: weight per faction reputation change */
  const PREFS = {
    gyro: {
      likes: 'Naples and cheese, the Spin, trainers, doctoring the sick and wounded', dislikes: 'cruelty, robbing the helpless, the President’s bargains',
      cards: { like: { types: ['trainer'], ids: ['spinschool', 'letter', 'sbr_tarcoffee', 'ws_envoy', 'path_executioner', 'path_physician', 'path_goldenrider', 'gregorio_letter', 'wounded', 'cust_surgeons', 'aurora'], re: /naples|cheese|zeppeli|\bspin|surgeon|doctor|wounded|sick|coffee|marco/i },
        dislike: { ids: ['ws_pardon', 'corpse_pardon'], re: /president|pardon/i } },
      choices: { like: /\bhelp|treat|\bheal|\bsave|carry|\bfree\b|cut (him|her|it) (loose|free)|cheese|naples|marco|\bspin|golden|share/i,
        dislike: /\brob|steal|take (his|their|what|the saddle)|drive (him )?off|leave (him|them)|burn|pick the pockets|threaten/i, rep: { naples: 1, racers: 0.5, natives: 0.5 } },
      say: { like: ['Nyo-ho! Now that’s a road worth riding.', 'Good. My father would call that the right rotation.'], dislike: ['That wasn’t very Neapolitan of you.', 'Hmph. I didn’t become a doctor to watch that.'], missed: ['There was a better road back there, you know.'] },
      devoted: 'You ride like a Zeppeli now. Every ball I throw, I throw for you.',
      wary: 'Gyro hums the cheese song, but he won’t look at you.',
      talk: { title: 'Gyro Won’t Share His Cheese', blurb: 'Gyro is eating alone, facing away from the fire.',
        text: 'An executioner has to tell the guilty from the innocent. My father taught me that. Lately I can’t tell which one you are.',
        hear: 'You sit down beside him and own up to it. Gyro breaks the cheese in half and holds out a piece. “...Fine. Don’t make me say it twice.”',
        gift: 'Buy him a whole wheel of real cheese', giftText: 'He sniffs it, pretends to be offended, and eats a third of it on the spot. “Bribery. Very Neapolitan. Accepted.”',
        firm: 'Gyro stares, then laughs through gold teeth. “At least you’ve got guts. Nyo-ho.”', fail: 'Gyro spits into the fire and walks to his horse. He comes back. He doesn’t forgive you.' },
    },
    johnny: {
      likes: 'the Corpse, winning, big fights, story beats, gunplay and nails', dislikes: 'resting, slowing down, giving the Corpse away',
      cards: { like: { types: ['elite', 'story'], ids: ['corpse_calling', 'corpse_hound', 'gunrange', 'path_jockey', 'path_nailgunner', 'path_goldenheir', 'checkpoint', 'sbr_arimathea', 'diego_card'], re: /corpse|saint|tusk|\bnail|derby|shortcut/i },
        dislike: { types: ['rest'], ids: ['corpse_burial', 'ws_pardon', 'corpse_pardon'], re: /surrender/i } },
      choices: { like: /corpse|saint|\bwin\b|\brace\b|faster|shortcut|chase|gallop|follow the pull|tusk|\bnail/i,
        dislike: /sell (him|every|one)|\bbury\b|surrender|turn yourself in|walk away|let it call|go to ground|give back/i, rep: {} },
      say: { like: ['That’s the way forward. Toward the Corpse.', 'Yeah. That’s how we win this.'], dislike: ['We don’t have time for that. The Corpse won’t wait.', 'I didn’t crawl this far to go slower.'], missed: ['We could have gone for it. Why didn’t we?'] },
      devoted: 'I’ll follow you to the next Corpse Part. And the one after that.',
      wary: 'Johnny rides a length ahead and doesn’t look back.',
      talk: { title: 'Johnny Wants Answers', blurb: 'Johnny has stopped his horse in the middle of the trail.',
        text: 'I’m not here to make friends. I’m here to walk again. Every time you turn off the road, I get further from that. Are you racing or not?',
        hear: 'You tell him you want the Corpse as badly as he does. He studies your face for a long time. “...Then prove it tomorrow.”',
        gift: 'Buy him a better strap for his legs', giftText: 'He cinches it and his knees stop slipping. He says nothing, but he rides beside you again.',
        firm: 'He glares, then nods once. “Fine. But I’m not waiting for you.”', fail: 'Johnny spurs Slow Dancer past you without a word.' },
    },
    mountaintim: {
      likes: 'the law, bounties and posses, cattle and rodeos, protecting Lucy', dislikes: 'theft, bribes, cheats and lies',
      cards: { like: { types: ['fight'], ids: ['sheriff', 'cattle', 'ws_posse', 'path_sheriff', 'path_lonesome', 'path_rancher', 'sd_zhorses', 'tim_alone', 'sbr_scarlet', 'newsboy', 'banditcamp', 'ws_wanted', 'sbr_steel'], re: /sheriff|marshal|posse|bounty|cattle|rustler|rodeo|lucy|outlaw|bandit|cowboy/i },
        dislike: { ids: ['sbr_milwaukee', 'sewer', 'sbr_newspaper'], re: /casino|pickpocket|cheat/i } },
      choices: { like: /\blaw\b|sheriff|marshal|deputy|justice|trial|protect|lucy|\bwarn|bounty|framed|stop (him|the)|\brope|free him/i,
        dislike: /\brob|steal|pick the pockets|bribe|pay them (to|more)|take his|fake|plant a story|sell (him|every)/i, rep: { law: 1, racers: 0.5 } },
      say: { like: ['Now that’s how an honest man rides.', 'Heh. My rope’s itching for this one.'], dislike: ['That ain’t right, partner. There’s a law out here, even with nobody wearing the star.', 'I didn’t sign on to ride with outlaws.'], missed: ['There was folks back there needed a cowboy.'] },
      devoted: 'You’re a straight shooter, partner. My rope’s yours.',
      wary: 'Tim keeps his hat low and his rope coiled on the far side from you.',
      talk: { title: 'The Cowboy Draws a Line', blurb: 'Mountain Tim is coiling his rope very slowly.',
        text: 'I rode with thieves once, back when I was young and stupid. Swore I wouldn’t again. Tell me I didn’t just break that promise.',
        hear: 'You tell him straight what you did and why. He listens like a judge. “A man who owns up can still be honest. I’ll ride on.”',
        gift: 'Pay for the damage you left behind', giftText: '“Restitution. That’s a lawman’s word.” He tips his hat. “Alright.”',
        firm: '“Hah. You sound like a marshal.” He falls in beside you, still frowning.', fail: 'He hangs the rope back on his saddle and rides wide of you all afternoon.' },
      leave: [{ narr: 'At dawn, Mountain Tim’s bedroll is already packed.' }, { who: 'mountaintim', text: 'I tried, partner. But a cowboy has to be able to look at himself in the water trough.' }, { who: 'mountaintim', text: 'There’s a lady back east who needs a man with a clean conscience watching her back. That ain’t you, and it ain’t me if I stay.' }, { narr: 'He tips his hat once and rides off alone.' }],
    },
    hotpants: {
      likes: 'the Vatican, churches and prayer, holy relics, honest answers', dislikes: 'robbery, the President’s deals, gambling and greed',
      cards: { like: { ids: ['ws_safehouse', 'path_sister', 'path_fleshsprayer', 'path_corpsehunter', 'corpse_cardinal', 'sbr_trinity', 'sbr_hp_stand', 'sbr_independence', 'revival', 'corpse_burial', 'corpse_fusion', 'ws_inquisition'], re: /vatican|church|abbess|cardinal|holy|saint|\bnun\b|corpse|reliquary|pray|revival|sister|trinity|inquisitor/i },
        dislike: { ids: ['ws_pardon', 'corpse_pardon', 'sbr_milwaukee', 'poker'], re: /president|casino|gambl|pardon/i } },
      choices: { like: /vatican|\bpray|bless|church|cardinal|holy|saint|confess|\bsin\b|reliquary|abbess|sister|trinity|hot pants/i,
        dislike: /\brob|steal|sell (him|every|one)|\bfake|president|spend everything|cheat|\bbet\b|gambl/i, rep: { vatican: 1, president: -1 } },
      say: { like: ['The Lord sees this. So do I.', 'Good. This is what the Saint would want.'], dislike: ['That is a sin. I will confess it for both of us.', 'Is this what you want the Corpse for?'], missed: ['There was a church back there. You rode past it.'] },
      devoted: 'I will spray flesh for you, and I will not ask why.',
      wary: 'Hot Pants prays apart from the fire. You are not in her prayers.',
      talk: { title: 'Confession by the Fire', blurb: 'Hot Pants is holding her rosary like a knife.',
        text: 'I carry a sin I will never wash off. I rode with you because I thought you could carry the Saint without making things worse. Now I am not sure.',
        hear: 'You tell her you have doubts too. She is quiet, then nods. “Doubt is honest. Greed is not. Stay honest.”',
        gift: 'Give to the next church on the road', giftText: '“The Vatican does not need your money.” She takes it anyway, for the orphans. “...Thank you.”',
        firm: '“You don’t bend. Neither do I.” Something like respect crosses her face.', fail: '“Then God keep you, because I will not.” She rides at the back, watching you.' },
      leave: [{ narr: 'Hot Pants is gone before sunrise. A little spray of flesh has sealed the buckles of her saddlebags.' }, { who: 'hotpants', text: 'The Vatican wants the Corpse. I wanted to believe you did not want it for yourself.' }, { who: 'hotpants', text: 'I was wrong. I will find it without you.' }, { narr: 'Her tracks turn east, toward the churches.' }],
    },
    pocoloco: {
      likes: 'luck, gambling, coins, racing, shops and scavenging', dislikes: 'creepy tombs, curses and vampires, playing it safe',
      cards: { like: { types: ['shop', 'scavenge'], ids: ['poker', 'pocorace', 'sbr_milwaukee', 'sd_emperor', 'sd_harvest', 'sd_pistols', 'fortune', 'dothan', 'sbr_dothan', 'sbr_photo', 'horsedealer'], re: /luck|gambl|\bcard|casino|poker|\bbet\b|fortune|\bcoin|\brace\b/i },
        dislike: { ids: ['sd_pillar', 'sd_vampnest', 'sd_death13', 'cust_mask'], re: /\btomb|pillar|curse|vampire|\bmask|haunt/i } },
      choices: { like: /luck|\bbet\b|gambl|\brace\b|\bcoin|fortune|tables|\bhand\b|dice|pocoloco|\bplay\b/i,
        dislike: /refuse and leave|walk away|\bburn|go to ground|stay awake/i, rep: { racers: 1 } },
      say: { like: ['Hey Ya says: GREAT pick! Lucky, lucky!', 'Ohh, I can feel the luck on this one!'], dislike: ['Hey Ya says... that was a bit of bad luck, huh?', 'Uhh, that gives me the creeps, amigo.'], missed: ['Hey Ya says we left a lucky coin back there!'] },
      devoted: 'Hey Ya says you’re the luckiest rider in the race! And I’m with you!',
      wary: 'Pocoloco isn’t smiling. Hey Ya keeps whispering in his ear.',
      talk: { title: 'Hey Ya Has an Opinion', blurb: 'Pocoloco is arguing with his own Stand.',
        text: 'Hey Ya says you’re bad luck, amigo. I told him to hush! But... he’s never been wrong before. What do I tell him?',
        hear: 'You promise him better luck ahead. Hey Ya thinks it over. “Hey Ya says... okay! One more chance!”',
        gift: 'Give him a lucky silver dollar', giftText: '“A LUCKY COIN! Hey Ya, look!” Pocoloco kisses it and pockets it. All is forgiven.',
        firm: '“Wow, strong words! Hey Ya says that’s the lucky kind of stubborn.”', fail: '“Hey Ya says... uh-oh.” Pocoloco rides a long way off.' },
      leave: [{ narr: 'Pocoloco is already in the saddle, packed, flipping a coin.' }, { who: 'pocoloco', text: 'Hey Ya says it’s time, amigo. Every coin I flip near you lands on its edge.' }, { who: 'pocoloco', text: 'No hard feelings! I’m just gonna go be lucky somewhere else!' }, { narr: 'He waves his hat all the way to the horizon.' }],
    },
    wekapipo: {
      likes: 'honour, duels, protecting the weak and families, hard fights', dislikes: 'running away, bribes, gambling, leaving people behind',
      cards: { like: { types: ['elite'], ids: ['ws_envoy', 'letter', 'sd_badco', 'brother', 'wounded', 'sbr_dinovillage', 'drywell', 'tornado', 'sbr_gaucho', 'sd_kraft'], re: /guard|\bking|naples|protect|family|\bgirl|child|\bboy\b|soldier|\bfort\b|duel|brother/i },
        dislike: { ids: ['poker', 'sbr_milwaukee', 'sbr_newspaper'], re: /casino|gambl|newsboy|poker/i } },
      choices: { like: /protect|\bsave|guard|\bhelp|duel|honou?r|escort|family|\bgirl|\bboy\b|\bdraw\b|challenge/i,
        dislike: /leave (him|them)|\brun\b|surrender|bribe|steal|\brob|pick the pockets|not our business|ride past|let him go|\bbet\b|gambl/i, rep: { naples: 0.5, racers: 0.5, natives: 0.5 } },
      say: { like: ['This is a road a guard can walk with pride.', 'Good. There are people here who need a shield.'], dislike: ['There is no honour in that.', 'I was exiled for less than this.'], missed: ['Someone back there needed protecting. We rode past.'] },
      devoted: 'My Wrecking Ball is yours. I will guard you as I once guarded the king.',
      wary: 'Wekapipo keeps his watch facing you, not the dark.',
      talk: { title: 'The Guard’s Question', blurb: 'Wekapipo is waiting for you with his arms crossed.',
        text: 'In Naples I served a king I could not respect. I will not do it twice. Tell me why I should stand guard over you.',
        hear: 'You answer without excuses. He weighs it like a verdict. “...An honest answer. I will keep my watch.”',
        gift: 'Pay a courier to carry his letter to his sister', giftText: 'He writes three careful lines and seals them. “She will know I am alive. Thank you.”',
        firm: '“A commander who does not waver. Good.” He salutes, stiffly.', fail: '“Orders, from you?” He turns his back on you: a guard’s worst insult.' },
      leave: [{ narr: 'Wekapipo waits by the road with his horse, the way a guard waits for the change of watch.' }, { who: 'wekapipo', text: 'I have guarded a man without honour before. It cost me my country.' }, { who: 'wekapipo', text: 'I will not let it cost me my soul. Farewell.' }, { narr: 'The Wrecking Ball hangs silent on his saddle as he rides away.' }],
    },
    lucy: {
      likes: 'rest and quiet camps, talking things out, kindness, Steven and the press', dislikes: 'violence, big fights, threats and robbery',
      cards: { like: { types: ['rest', 'shop'], ids: ['sbr_steel', 'newsboy', 'sbr_scarlet', 'sbr_independence', 'lucy_letter', 'sbr_greentomb', 'hotspring', 'revival', 'farm_family', 'ws_racerscamp', 'ws_safehouse'], re: /lucy|steel|\bpress|letter|church|family|\bcamp|spring/i },
        dislike: { types: ['elite'], ids: ['banditcamp', 'trainheist', 'sd_vampnest'], re: /ambush|bandit|hideout|wanted|arrows|swarm|revenge/i } },
      choices: { like: /\btalk|\bask\b|\bhelp|share|\bwarn|\bfree\b|\brest|gift|\bgive|apolog|\bpray|treat|sleep|trade stories|\bpool/i,
        dislike: /\bfight|\bdraw\b|\bkill|shoot|storm|\bburn|threaten|\brob|steal|duel|go straight at/i, rep: { law: 0.5, racers: 0.5, president: -0.5 } },
      say: { like: ['Thank you. That was kinder than I expected.', 'This is better. Nobody has to get hurt.'], dislike: ['Did it have to be so violent?', 'I... I didn’t want to see that.'], missed: ['We could have stopped there. Just for a while.'] },
      devoted: 'I trust you. I’ll carry whatever I have to.',
      wary: 'Lucy stays close to the horses, and far from you.',
      talk: { title: 'Lucy Can’t Sleep', blurb: 'Lucy is sitting up, hugging her knees.',
        text: 'I married a man to survive. I lie to the President every day to survive. I thought that with you I could stop being afraid. Was I wrong?',
        hear: 'You sit with her until she stops shaking. “...Thank you. Nobody ever just listened.”',
        gift: 'Buy her a new dress in the next town', giftText: 'She laughs for the first time in days. “Steven would be jealous.” She puts it on right away.',
        firm: '“You sound like my husband.” She almost smiles. “That’s a compliment.”', fail: 'Lucy flinches, and says nothing else all night.' },
      leave: [{ narr: 'There is a note under your saddle, in careful handwriting.' }, { who: 'lucy', text: 'I have spent my whole life beside dangerous men, pretending not to be afraid.' }, { who: 'lucy', text: 'I don’t want to pretend any more. I’m going back to Steven. Please don’t follow me.' }, { narr: 'Lucy Steel has gone.' }],
    },
    diego: {
      likes: 'winning, money, racing and shortcuts, big fights, taking what he wants', dislikes: 'charity, churches, resting, helping the weak',
      cards: { like: { types: ['elite', 'fight', 'scavenge'], ids: ['diego_card', 'sbr_storm', 'diego_hat', 'dothan', 'sbr_dothan', 'sbr_milwaukee', 'horsedealer', 'sbr_mackdixie', 'checkpoint', 'pocorace', 'trainheist', 'sbr_photo'], re: /\brace\b|\bwin\b|money|shortcut|prize|dinosaur|casino|\bgold|champion|derby/i },
        dislike: { types: ['rest'], ids: ['revival', 'ws_safehouse', 'path_sister', 'hotspring', 'farm_family', 'corpse_burial'], re: /church|\bpray|abbess|revival|charity|safehouse|\bnun\b|sister/i } },
      choices: { like: /\brace\b|\bwin\b|take (his|the|it|what)|steal|\bsell|faster|ride past|\brob|\bbet\b|tables|pick the pockets|strip|it's a race|competition/i,
        dislike: /\bgive\b|share|\bhelp|carry|pay (a|him fairly|him for)|\bfree\b|\bbury|\bpray|apolog|canteen|treat|\bsave/i, rep: { racers: -0.5, law: -0.5 } },
      say: { like: ['Hah. Now you’re thinking like a winner.', 'Money and first place. Everything else is garbage.'], dislike: ['Charity. How pathetic.', 'You waste time on the weak. That’s why you’ll lose.'], missed: ['You left a prize lying in the road, you fool.'] },
      devoted: 'You’re almost worth riding beside. Almost. My claws are yours.',
      wary: 'Diego files his fingernails and watches your back a little too closely.',
      talk: { title: 'Dio Makes Terms', blurb: 'Diego is waiting on a hill, smirking.',
        text: 'I don’t ride with losers. Give me one reason to stay, one real reason, and make it worth money.',
        hear: 'You tell him the prize money splits better with him alive. He laughs. “Finally, a sensible argument.”',
        gift: 'Pay Dio his “share”', giftText: 'He counts it twice in front of you. “The only language worth speaking.”',
        firm: '“Hah! You have a spine after all. I’ll stay, just to watch it break.”', fail: '“Threats? From YOU?” His pupils narrow into a raptor’s.' },
      leave: [{ narr: 'Diego Brando is standing over your saddlebags when you wake. He is holding nothing. This time.' }, { who: 'diego', text: 'You are soft. Soft people finish third, then fourth, then nowhere.' }, { who: 'diego', text: 'I am going to win this race. Pray we don’t meet on the last stage.' }, { narr: 'Silver Bullet’s hoofbeats fade toward the east.' }],
    },
  };
  const GIFT = 40;

  /* ---------------- state ---------------- */
  const run = () => SBR.run;
  const store = () => { const r = run(); if (!r.affinity) r.affinity = {}; return r.affinity; };
  /** an ally with opinions: not the lead, not a custom rider */
  const tracked = id => { const r = run(); return !!r && !!PREFS[id] && id !== r.lead && !SBR.isPU(id); };
  const inParty = id => run().party.some(m => m.id === id);
  const active = () => run().party.map(m => m.id).filter(tracked);
  function get(id) { const a = store(); if (a[id] == null) a[id] = START; return a[id]; }
  const floorOf = id => (BOUND.includes(id) || run().act >= 6 ? FLOOR : 0);
  function tierOf(v) {
    if (v >= DEVOTED) return { key: 'devoted', name: 'Devoted', color: '#e8508a', kana: '愛' };
    if (v > WARY) return { key: 'friendly', name: 'Friendly', color: '#3fb8a9', kana: '友' };
    if (v > LEAVE) return { key: 'wary', name: 'Wary', color: '#e8742a', kana: '疑' };
    return { key: 'leaving', name: 'Fed Up', color: '#c8323c', kana: '去' };
  }
  const tier = id => tierOf(get(id));
  const short = id => SBR.CHARS[id].short;
  const port = id => SBR.art.portrait(SBR.CHARS[id].portrait);

  /** a rider joins (or comes back): fresh start, or a cautious one if they walked out on you before */
  function joined(id) {
    if (!run() || !PREFS[id]) return;
    const a = store();
    if (a[id] == null || a[id] <= LEAVE) a[id] = (run().gone || []).includes(id) ? REJOIN : START;
  }

  /* ---------------- changing the bond ---------------- */
  let notes = [], timer = null;
  function change(id, n, mood, quote) {
    if (!n || !tracked(id) || !inParty(id)) return 0;
    const a = store(), old = get(id);
    const v = clamp(old + n, floorOf(id), 100);
    a[id] = v;
    const d = v - old;
    if (d) notes.push({ id, d, mood: mood || (d > 0 ? 'like' : 'dislike'), quote });
    const t0 = tierOf(old).key, t1 = tierOf(v).key;
    if (t0 !== t1) crossed(id, t0, t1);
    if (!timer) timer = setTimeout(flushNotes, 30);
    return d;
  }
  function crossed(id, from, to) {
    const P = PREFS[id];
    later(() => {
      if (to === 'devoted') { SBR.toast(`<div class="toast-port">${port(id)}</div><div><b class="aff-hot">${short(id)} is DEVOTED to you!</b><br><small><i>“${P.devoted}”</i><br>+${DEVOTED_BONUS.dmg * 100}% damage, +${DEVOTED_BONUS.crit * 100}% crit in battle.</small></div>`, 'aff aff-tt devoted'); SBR.audio.play('level'); }
      else if (to === 'wary' && from !== 'leaving') { SBR.toast(`<div class="toast-port">${port(id)}</div><div><b>${short(id)} is WARY of you.</b><br><small>${P.wary} (−1 starting Energy in battle.)</small></div>`, 'aff aff-tt wary'); SBR.audio.play('menace'); }
      else if (to === 'leaving') { SBR.toast(`<div class="toast-port grey">${port(id)}</div><div><b>${short(id)} has had enough.</b><br><small>They will leave the party before the next stage.</small></div>`, 'aff aff-tt leaving'); SBR.audio.play('menace'); }
    });
    // a first slide into Wary: they ask to talk, a stage or two from now (once per run per ally)
    if (to === 'wary' || to === 'leaving') { if (SBR.campaign && SBR.campaign.later) SBR.campaign.later('aff_talk_' + id, 1, 2); }
  }
  const later = fn => setTimeout(fn, 60);
  function flushNotes() {
    timer = null;
    const list = notes; notes = [];
    if (!list.length) return;
    const merged = {};
    list.forEach(x => { const m = merged[x.id] = merged[x.id] || { id: x.id, d: 0, mood: x.mood, quote: x.quote }; m.d += x.d; if (x.mood === 'dislike' || !m.quote) { m.mood = x.mood; m.quote = x.quote || m.quote; } });
    const rows = Object.values(merged).filter(x => x.d);
    if (!rows.length) return;
    const verb = x => x.d > 0 ? 'likes this' : x.mood === 'missed' ? 'wanted another road' : 'disapproves';
    SBR.toast(`<div class="aff-toast">${rows.map(x => `<div class="aff-t-row ${x.d > 0 ? 'up' : 'down'}"><span class="aff-t-port">${port(x.id)}<i>${x.d > 0 ? '♥' : '✗'}</i></span><div><b>${short(x.id)}</b> ${verb(x)} <em>${x.d > 0 ? '+' : ''}${x.d}</em>${x.quote ? `<small>“${x.quote}”</small>` : ''}</div></div>`).join('')}</div>`, 'aff');
    SBR.saveRun();
    if (SBR.ui && SBR.ui.refreshStage && document.querySelector('.screen-stage')) SBR.ui.refreshStage();
  }
  const quote = (id, kind) => { const s = PREFS[id].say[kind]; return s && s.length ? pick(s) : ''; };

  /* ---------------- reading an encounter card ---------------- */
  function cardScore(id, card) {
    if (!card || card.secret) return 0;
    const C = PREFS[id].cards, type = card.story ? 'story' : card.type, text = (card.title || '') + ' ' + (card.blurb || '');
    let s = 0;
    [[C.like, 1], [C.dislike, -1]].forEach(([p, w]) => {
      if (!p) return;
      if ((p.types || []).includes(type)) s += w;
      if ((p.ids || []).includes(card.id)) s += 2 * w;
      if (p.re && p.re.test(text)) s += w;
    });
    return s;
  }
  const kindScore = (id, kind) => { const C = PREFS[id].cards; return ((C.like.types || []).includes(kind) ? 1 : 0) - ((C.dislike && C.dislike.types || []).includes(kind) ? 1 : 0); };
  /** who in the active party likes / dislikes a card */
  function opinions(card) {
    if (!run()) return { like: [], dislike: [] };
    const out = { like: [], dislike: [] };
    active().forEach(id => { const s = cardScore(id, card); if (s > 0) out.like.push(id); else if (s < 0) out.dislike.push(id); });
    return out;
  }
  /** the stage choice: a card, or Scavenge / Short Rest (kind) */
  function onPick(cards, card, kind) {
    lastChoice = null; // a panel opened outside resolveChoice must not colour the next event's reading
    if (!run() || !cards || !cards.length || cards[0].forced) return;
    active().forEach(id => {
      const s = kind ? kindScore(id, kind) : cardScore(id, card);
      if (s > 0) return change(id, s >= 2 ? 6 : 4, 'like', quote(id, 'like'));
      const missed = cards.some(c => c !== card && cardScore(id, c) > 0);
      if (s < 0) return change(id, missed ? -6 : -4, 'dislike', quote(id, 'dislike'));
      if (missed) change(id, -3, 'missed', quote(id, 'missed'));
    });
  }

  /* ---------------- reading an event choice ---------------- */
  let lastChoice = null;
  function choiceScore(id, text, rep) {
    const C = PREFS[id].choices;
    let s = 0;
    if (C.like && C.like.test(text)) s += 1;
    if (C.dislike && C.dislike.test(text)) s -= 1;
    let rs = 0; Object.entries(rep || {}).forEach(([f, n]) => { rs += n * ((C.rep || {})[f] || 0); });
    return s + clamp(rs, -2, 2);
  }
  function onChoice(key) {
    if (!run() || !key || /^aff_/.test(key)) { lastChoice = null; return; }
    const C = (SBR.CONSEQ && (SBR.CONSEQ[key] || SBR.CONSEQ[key.replace(/:fail$/, '')])) || {};
    const text = ((lastChoice && lastChoice.label) || '') + ' · ' + (C.deed || '');
    lastChoice = null;
    active().forEach(id => {
      const s = choiceScore(id, text, C.rep);
      if (s >= 1) change(id, s >= 2 ? 8 : 5, 'like', quote(id, 'like'));
      else if (s <= -1) change(id, s <= -2 ? -8 : -5, 'dislike', quote(id, 'dislike'));
    });
  }

  /* ---------------- the safe point: riders who have had enough leave ---------------- */
  async function safePoint(G) {
    const r = run(); if (!r || !r.party) return;
    const going = r.party.map(m => m.id).filter(id => tracked(id) && floorOf(id) === 0 && get(id) <= LEAVE && PREFS[id].leave);
    for (const id of going) {
      const sid = 'aff_leave_' + id;
      await SBR.ui.dialogue(sid);
      G.dismiss(id, `<b>${SBR.CHARS[id].name}</b> left the party. <small>You never gave them a reason to stay.</small>`);
      r.flags['affLeft_' + id] = true;
      if (SBR.campaign) SBR.campaign.deed(sid, `${SBR.CHARS[id].name} lost faith in you and rode off alone.`);
    }
    if (going.length) SBR.saveRun();
  }

  /* ---------------- combat: Devoted fight harder, Wary hang back ---------------- */
  const baseEB = SBR.equipBonus;
  SBR.equipBonus = m => {
    const out = baseEB(m);
    const r = run();
    if (!m || !r || !r.party || !tracked(m.id) || !r.party.includes(m)) return out;
    const t = tier(m.id).key;
    if (t === 'devoted') for (const k in DEVOTED_BONUS) out.bonus[k] = (out.bonus[k] || 0) + DEVOTED_BONUS[k];
    else if (t === 'wary' || t === 'leaving') out.bonus.energyStart = (out.bonus.energyStart || 0) - 1;
    return out;
  };

  /* ---------------- hooks: remember the label of the choice just made; read it when the campaign hears the key ---------------- */
  const baseEP = SBR.ui.eventPanel;
  SBR.ui.eventPanel = ev => baseEP(ev).then(ch => { lastChoice = ch ? { label: ch.label, ev: ev && ev.id } : null; return ch; });
  const baseOC = SBR.campaign.onChoice;
  SBR.campaign.onChoice = (key, g) => { const out = baseOC(key, g); try { onChoice(key); } catch (e) { console.error('[affinity]', e); } return out; };

  /* ---------------- UI bits ---------------- */
  /** portrait badges on an encounter card: who would like or dislike this road */
  function decorate(node, card) {
    if (!run() || !node || !card || card.forced) return;
    const o = opinions(card);
    if (!o.like.length && !o.dislike.length) return;
    const box = el('div', { class: 'aff-badges' });
    o.like.forEach(id => { const b = el('span', { class: 'aff-b like', html: `${port(id)}<i>♥</i>` }); SBR.tip.bind(b, `<b>${SBR.CHARS[id].short}</b> would like this.<br><small>Likes: ${PREFS[id].likes}.</small>`); box.appendChild(b); });
    o.dislike.forEach(id => { const b = el('span', { class: 'aff-b dislike', html: `${port(id)}<i>✗</i>` }); SBR.tip.bind(b, `<b>${SBR.CHARS[id].short}</b> would not like this.<br><small>Dislikes: ${PREFS[id].dislikes}.</small>`); box.appendChild(b); });
    node.appendChild(box);
  }
  /** a tiny heart in the corner of a party tab / party strip card */
  function pip(node, id) {
    if (!run() || !tracked(id)) return;
    const v = get(id), T = tierOf(v);
    const p = el('span', { class: 'aff-pip ' + T.key, style: { '--ac': T.color }, html: '♥' });
    node.appendChild(p);
    node.classList.add('has-aff');
  }
  /** the bond bar on the character sheet */
  function sheetRow(m) {
    if (!run() || !PREFS[m.id]) return null;
    if (!tracked(m.id)) return el('div', { class: 'aff-row lead', html: `<div class="aff-label">BOND</div><span class="aff-tier" style="--ac:#f2c14e">LEAD</span><small>The lead rider sets the road. Allies judge it.</small>` });
    const v = get(m.id), T = tierOf(v), P = PREFS[m.id];
    const fx = T.key === 'devoted' ? `+${DEVOTED_BONUS.dmg * 100}% damage, +${DEVOTED_BONUS.crit * 100}% crit` : T.key === 'wary' ? '−1 starting Energy' : T.key === 'leaving' ? (floorOf(m.id) ? '−1 starting Energy' : 'will leave the party') : 'no effect in battle';
    const row = el('div', { class: 'aff-row ' + T.key, style: { '--ac': T.color } });
    row.innerHTML = `<div class="aff-label">BOND</div><span class="aff-tier"><i>${T.kana}</i>${T.name}</span>
      <div class="aff-bar"><div class="aff-fill" style="width:${v}%"></div><span class="aff-tick t-leave" style="left:${LEAVE}%"></span><span class="aff-tick t-wary" style="left:${WARY}%"></span><span class="aff-tick t-dev" style="left:${DEVOTED}%"></span><b>${Math.round(v)}</b></div>
      <div class="aff-fx">${fx}${BOUND.includes(m.id) ? ' · <i>bound to the story: never leaves</i>' : ''}</div>
      <div class="aff-prefs"><span class="aff-l">♥ ${P.likes}</span><span class="aff-d">✗ ${P.dislikes}</span></div>`;
    SBR.tip.bind(row, `<b>Bond with ${SBR.CHARS[m.id].short}: ${Math.round(v)}/100</b><br>Choosing roads and answers they like raises it; picking what they dislike, or passing up what they wanted, lowers it.<br>80+ Devoted: fights harder. 30 or less Wary: −1 starting Energy. ${BOUND.includes(m.id) ? 'Never leaves (story).' : '10 or less: leaves the party.'}`);
    return row;
  }

  /* ---------------- the talk: a second chance when someone turns Wary ---------------- */
  const ACTS = [1, 2, 3, 4, 5, 6];
  Object.entries(PREFS).forEach(([id, P]) => {
    const T = P.talk, eid = 'aff_talk_' + id, name = SBR.CHARS[id].name;
    SBR.CAMPAIGN_EVENTS.push({ id: eid, acts: ACTS, type: 'event', title: T.title, blurb: T.blurb, icon: 'question', art: id,
      cond: g => g.inParty(id) && tracked(id) && get(id) <= 45,
      get text() { return `“${T.text}”`; },
      reveals: `${name} said what was on their mind.`,
      choices: [
        { label: `Hear ${SBR.CHARS[id].short} out, and own up to it`, ok: { text: T.hear, fx: () => change(id, 18, 'like') } },
        { label: `${T.gift} ($${GIFT})`, cost: { money: GIFT }, ok: { text: T.giftText, fx: () => change(id, 14, 'like') } },
        { label: '“Ride with me, or ride alone.” (RESOLVE)', check: { stat: 'res', dc: 12 }, ok: { text: T.firm, fx: () => change(id, 8, 'like') }, fail: { text: T.fail, fx: () => change(id, -12, 'dislike') } },
      ] });
    Object.assign(SBR.CONSEQ, {
      [eid + ':0']: { deed: `Heard ${name} out when they doubted you.` },
      [eid + ':1']: { deed: `Made it up to ${name} with a gift.` },
      [eid + ':2']: { deed: `Told ${name} to ride or go, and they stayed.` },
      [eid + ':2:fail']: { deed: `Told ${name} to ride or go. It went badly.` },
    });
    if (P.leave) SBR.STORY['aff_leave_' + id] = { bg: 3, panels: true, lines: P.leave };
  });

  return { PREFS, get, tier, tierOf, tracked, joined, change, onPick, onChoice, opinions, cardScore, safePoint, decorate, pip, sheetRow,
    _set: (id, v) => { store()[id] = v; } };
})();

/* ================= Party full: choose who makes room =================
   G.recruit puts the newcomer in the reserve and defers this (so it opens after the current panel closes).
   forced: a story-bound rider (Johnny, Gyro) is joining, so someone has to step back. */
SBR.partyPicker = (m, o = {}) => new Promise(resolve => {
  const r = SBR.run, { el } = SBR.util, ui = SBR.ui, art = SBR.art;
  if (!r || !r.reserve.includes(m)) return resolve();
  if (r.party.length < 4) { r.reserve.splice(r.reserve.indexOf(m), 1); r.party.push(m); SBR.saveRun(); return resolve(); }
  const BOUND = ['johnny', 'gyro'];
  const lockOf = x => x.id === r.lead ? 'LEAD' : BOUND.includes(x.id) ? 'STORY' : '';
  const C = SBR.CHARS[m.id];
  let chosen = null;
  const box = el('div', { class: 'pp' });
  box.appendChild(el('div', { class: 'pp-head', html: `<div class="pp-kicker">PARTY FULL!</div><h2>Who rides on?</h2><p>${C.name} ${o.forced ? 'rides with you no matter what' : 'wants to join'}. Four riders is all the trail can feed. Pick one to send to the reserve${o.forced ? '.' : ', or let the newcomer wait there.'}</p>` }));
  const card = (x, isNew) => {
    const c = SBR.CHARS[x.id], lock = isNew ? '' : lockOf(x);
    const aff = SBR.affinity && SBR.affinity.tracked(x.id) && !isNew ? SBR.affinity.tierOf(SBR.affinity.get(x.id)) : null;
    const b = el('button', { class: 'pp-card' + (isNew ? ' new' : '') + (lock ? ' locked' : ''), html: `<div class="pp-port">${art.portrait(c.portrait)}</div><div class="pp-name">${c.short}</div><div class="pp-sub">Lv${x.level} · ${Math.max(0, x.hp)}/${x.maxHp} HP</div>${aff ? `<div class="pp-aff" style="--ac:${aff.color}">♥ ${aff.name}</div>` : ''}${isNew ? '<div class="pp-stamp new">NEW!</div>' : lock ? `<div class="pp-stamp lock">${lock}</div>` : '<div class="pp-stamp out">RESERVE</div>'}` });
    if (lock) SBR.tip.bind(b, lock === 'LEAD' ? 'Your lead rider never leaves.' : 'Story character — always rides with you.');
    else if (!isNew) b.onclick = () => { SBR.audio.play('select'); chosen = x; box.querySelectorAll('.pp-card').forEach(n => n.classList.toggle('chosen', n === b)); go.classList.remove('disabled'); go.querySelector('span').textContent = `Send ${c.short} to the reserve ▸`; };
    return b;
  };
  const row = el('div', { class: 'pp-row' });
  row.appendChild(el('div', { class: 'pp-newcol' }, card(m, true), el('div', { class: 'pp-vs' }, 'VS')));
  const partyRow = el('div', { class: 'pp-party' });
  r.party.forEach(x => partyRow.appendChild(card(x, false)));
  row.appendChild(partyRow);
  box.appendChild(row);
  const foot = el('div', { class: 'pp-foot' });
  const done = () => { ui.closeModal(w); SBR.saveRun(); if (ui.refreshStage) ui.refreshStage(); resolve(); };
  const go = ui.btn(el('span', {}, 'Choose a rider above'), () => {
    if (!chosen) return;
    const i = r.party.indexOf(chosen);
    r.party.splice(i, 1, m); r.reserve.splice(r.reserve.indexOf(m), 1); r.reserve.push(chosen);
    SBR.toast(`<div class="toast-port">${art.portrait(C.portrait)}</div><div><b>${C.name}</b> joins the party!<br><small>${SBR.CHARS[chosen.id].short} moves to the reserve.</small></div>`, 'ally');
    SBR.audio.play('success');
    done();
  }, 'btn-primary disabled', { 'data-kana': 'ドドド' });
  foot.appendChild(go);
  if (!o.forced) foot.appendChild(ui.btn(`${C.short} waits in the reserve`, () => { SBR.toast(`<div class="toast-port">${art.portrait(C.portrait)}</div><div><b>${C.name}</b> rides in the reserve. <small>Swap riders any time from the Party screen (P).</small></div>`, 'ally'); done(); }, 'btn-ghost pp-decline'));
  box.appendChild(foot);
  const w = ui.modal(box, { title: 'Party Full', noClose: true, size: 'wide', cls: 'pp-modal' });
});
