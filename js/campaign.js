/* The campaign: the world remembers.
   Every choice feeds a hidden world state: faction reputation, what recurring people think of you, a list of deeds,
   and a queue of consequences that come back later as their own encounters. Nothing is shown when you choose;
   the Chronicle (J) records what you did, and fills in what it caused once it happens. Endings are chosen from it. */
'use strict';

SBR.FACTIONS = {
  president: { name: 'The President', portrait: 'valentine' },
  vatican:   { name: 'The Vatican', portrait: 'hotpants' },
  racers:    { name: 'The Racers', portrait: 'pocoloco' },
  natives:   { name: 'Sandman’s People', portrait: 'sandman' },
  naples:    { name: 'The House of Naples', portrait: 'gregorio' },
  law:       { name: 'The Law', portrait: 'marshal' },
};

SBR.campaign = (() => {
  const W = () => {
    const r = SBR.run;
    if (!r.world) r.world = { rep: { president: 0, vatican: 0, racers: 0, natives: 0, naples: 0, law: 0 }, npc: {}, deeds: [], queue: [], clock: 0, keys: {} };
    return r.world;
  };
  const clamp = v => Math.max(-5, Math.min(5, v));
  const api = {
    world: W,
    rep(f, n) { const w = W(); w.rep[f] = clamp((w.rep[f] || 0) + n); if (f === 'president' && n < 0 && SBR.game && SBR.game._debug) SBR.game._debug.G.threat(-n * 0.5); },
    repOf: f => W().rep[f] || 0,
    npc(id, state) { const w = W(); w.npc[id] = { state, act: SBR.run.act }; },
    npcIs: (id, state) => { const n = W().npc[id]; return !!n && (state ? n.state === state : true); },
    /** record something you did; id links it to the consequence that may reveal it later */
    deed(id, text) { const w = W(); if (w.deeds.some(d => d.id === id)) return; w.deeds.push({ id, act: SBR.run.act, text, reveal: null }); },
    reveal(id, text) { const d = W().deeds.find(x => x.id === id); if (d && !d.reveal) d.reveal = text; },
    /** queue a follow-up encounter a few stages from now */
    later(event, min = 3, max = 8, from) { const w = W(); if (w.queue.some(q => q.event === event) || w.keys['done:' + event]) return; w.queue.push({ event, at: w.clock + SBR.util.randInt(min, max), from: from || null }); },
    tick() { W().clock++; },
    /** the next consequence that is due, as an encounter card */
    dueCard() {
      const w = W(); const q = w.queue.find(x => x.at <= w.clock && SBR.CAMPAIGN_EVENTS.find(e => e.id === x.event && (!e.acts || e.acts.includes(SBR.run.act)) && (!e.cond || e.cond(SBR.game._debug.G))));
      if (!q) return null;
      const e = SBR.CAMPAIGN_EVENTS.find(x => x.id === q.event);
      return { id: e.id, type: e.type || 'event', title: e.title, blurb: e.blurb, icon: e.icon || 'question', pace: e.pace || 0, art: e.art, forced: true, consequence: true };
    },
    fired(eventId) { const w = W(); const i = w.queue.findIndex(x => x.event === eventId); if (i >= 0) { const q = w.queue[i]; w.queue.splice(i, 1); const e = SBR.CAMPAIGN_EVENTS.find(x => x.id === eventId); if (q.from && e && e.reveals) api.reveal(q.from, e.reveals); } w.keys['done:' + eventId] = true; },
    merge(o) { const w = W(); Object.assign(w.rep, o.rep || {}); Object.assign(w.npc, o.npc || {}); (o.deeds || []).forEach(d => w.deeds.push(d)); },
    /** called by resolveChoice with a stable key: eventId:index[:fail] or scene:id:index[:fail] */
    onChoice(key, g) {
      const w = W();
      const C = SBR.CONSEQ[key] || SBR.CONSEQ[key.replace(/:fail$/, '')];
      if (!C) { if (!/^(hunt_|area_)/.test(key)) console.warn('[campaign] no consequence for', key); return; }
      const first = !w.keys[key]; w.keys[key] = true;
      if (!first && C.once !== false) return; // repeated trainers etc. only count once
      Object.entries(C.rep || {}).forEach(([f, n]) => api.rep(f, n));
      Object.entries(C.npc || {}).forEach(([id, st]) => api.npc(id, st));
      if (C.flag) [].concat(C.flag).forEach(f => g.flag(f));
      if (C.threat) g.threat(C.threat);
      if (C.deed) api.deed(key, C.deed);
      if (C.later) { const [e, a, b] = C.later; api.later(e, a, b, key); whisper(); }
    },
  };
  let lastWhisper = 0;
  const LINES = ['Somewhere, someone takes note.', 'The trail will remember this.', 'You will hear about this again.', 'Word travels faster than horses.'];
  function whisper() { if (Date.now() - lastWhisper < 4000) return; lastWhisper = Date.now(); SBR.toast(`<div class="whisper">✒ <i>${SBR.util.pick(LINES)}</i></div>`, 'whisper'); }
  return api;
})();

/* ================= Consequences of every side-encounter choice =================
   key: eventId:choiceIndex (":fail" when a skill check fails). rep = hidden faction deltas, later = [event, minStages, maxStages]. */
SBR.CONSEQ = {
  'hotspring:0': { rep: { natives: 2 }, npc: { scout: 'friend' }, deed: 'Treated the wounded scout at the hot spring.' },
  'hotspring:0:fail': { rep: { natives: 1 }, deed: 'Shared the hot spring with a scout who didn’t trust you.' },
  'hotspring:1': { rep: { natives: -3 }, npc: { scout: 'enemy' }, deed: 'Drove a wounded scout away from the hot spring.' },
  'poker:0': { rep: { racers: 1 }, deed: 'Won a Stand user’s silks at the card table.', later: ['gambler_revenge', 4, 9] },
  'poker:0:fail': { deed: 'Lost a bet to a Stand-using gambler.', later: ['gambler_marker', 4, 8] },
  'poker:1': { rep: { law: 1 }, deed: 'Exposed a cheating gambler’s Stand.', later: ['gambler_revenge', 5, 10] },
  'poker:1:fail': { rep: { law: -1 }, deed: 'Started a gunfight in a saloon.' },
  'poker:2': { rep: { law: -1 }, deed: 'Called a gambler a cheat and drew on him.', later: ['gambler_revenge', 4, 9] },
  'wounded:0': { rep: { racers: 2 }, npc: { blackwoods: 'owed' }, deed: 'Carried the boy from the ditch to the checkpoint.' },
  'wounded:1': { rep: { racers: 1 }, npc: { blackwoods: 'owed' }, deed: 'Gave the boy in the ditch your canteen.' },
  'wounded:2': { rep: { racers: -2, law: -1 }, npc: { blackwoods: 'enemy' }, deed: 'Robbed a wounded boy in a ditch.' },
  'spinschool:0': { rep: { naples: 1 }, deed: 'Trained with Gyro.' },
  'spinschool:1': { rep: { naples: 1 }, deed: 'Meditated on the rotation.' },
  'spinschool:2': { rep: { naples: 2 }, flag: 'marcoStory', deed: 'Listened to Gyro’s story about Marco.' },
  'gunrange:0': { rep: { law: 1 }, npc: { marksman: 'friend' }, deed: 'Impressed Mountain Tim’s old shooting partner.', later: ['marksman_help', 6, 12] },
  'gunrange:0:fail': { rep: { law: 1 }, npc: { marksman: 'friend' }, deed: 'Drilled all night with the old marksman.' },
  'gunrange:1': { rep: { law: 1 }, deed: 'Took lessons from the old marksman.' },
  'fortune:0': { rep: { vatican: 1 }, flag: 'corpseVision', deed: 'Asked the blind fortune teller about the Saint.' },
  'fortune:0:fail': { rep: { vatican: -1 }, deed: 'Something cold crawled out of the fortune teller’s hand.', later: ['fortune_curse', 6, 12] },
  'fortune:1': { flag: 'facedGuilt', deed: 'Let the fortune teller speak of Nicholas.' },
  'fortune:2': { flag: 'fortuneRingo', deed: 'Walked away from the fortune teller’s warning about a cabin.' },
  'camp:0': { rep: { president: -1 }, flag: 'agentOrders', deed: 'Read the orders in a government agent’s satchel.' },
  'camp:1': { rep: { president: -2, law: 1 }, deed: 'Ambushed three of the President’s agents at their camp.', later: ['agents_revenge', 5, 10] },
  'camp:2': { rep: { president: -1, law: -1 }, deed: 'Burned an agents’ camp. The fire spread.', later: ['burned_farm', 3, 7] },
  'checkpoint:0': { rep: { racers: -1 }, threat: 0.5, deed: 'Told the newspapers you would win.' },
  'checkpoint:0:fail': { rep: { racers: -1 }, deed: 'Your boast made you a target.' },
  'checkpoint:1': { rep: { law: 1, racers: 1 }, deed: 'Told the reporters about your legs.', later: ['fan_letters', 5, 10] },
  'checkpoint:2': { rep: { president: -1 }, flag: 'presidentPlan', deed: 'Learned the President’s men are digging along the route.' },
  'checkpoint:2:fail': { rep: { president: -1 }, deed: 'Asked about Valentine in front of his agent.' },
  'horsetrader:0': { rep: { law: 1, president: -1 }, npc: { farrier: 'owed' }, deed: 'Promised the farrier’s daughter you would find her father.' },
  'horsetrader:1': { rep: { law: 1 }, npc: { farrier: 'friend' }, deed: 'Paid the farrier’s daughter fairly for her shoes.' },
  'horsetrader:2': { npc: { farrier: 'friend' }, deed: 'Traded scrap iron to the farrier’s daughter.' },
  'drywell:0': { rep: { law: 1 }, npc: { prospector: 'friend' }, flag: 'boomWarning', deed: 'Hauled a prospector out of a dry well.' },
  'drywell:0:fail': { npc: { prospector: 'friend' }, deed: 'Fell into a dry well trying to save a prospector.' },
  'drywell:1': { rep: { law: -2 }, npc: { prospector: 'enemy' }, flag: 'prospectorRobbed', deed: 'Left a prospector at the bottom of a well and took his sack.', later: ['prospector_curse', 2, 5] },
  'poco:0': { rep: { racers: 1 }, npc: { pocoloco: 'friend' }, deed: 'Invited Pocoloco along.' },
  'poco:0:fail': { rep: { racers: 1 }, deed: 'Pocoloco’s Stand said not today.' },
  'poco:1': { rep: { racers: 2 }, npc: { pocoloco: 'friend' }, deed: 'Shared your food with Pocoloco.' },
  'poco:2': { rep: { racers: -1 }, npc: { pocoloco: 'rival' }, deed: 'Raced Pocoloco for his lucky horseshoe.' },
  'dothan:0': { rep: { racers: 1 }, npc: { dothan: 'respect' }, deed: 'Raced Dot Han of the steppe.', later: ['dothan_help', 8, 14] },
  'dothan:0:fail': { rep: { racers: -1 }, npc: { dothan: 'scorn' }, deed: 'Lost a race to Dot Han.', later: ['dothan_sabotage', 5, 10] },
  'dothan:1': { rep: { racers: 1 }, npc: { dothan: 'friend' }, deed: 'Learned steppe riding from Dot Han.', later: ['dothan_help', 8, 14] },
  'sheriff:0': { rep: { law: 2, racers: -1 }, npc: { framed: 'dead' }, deed: 'Collected a bounty on a racer.', later: ['framed_truth', 5, 10] },
  'sheriff:1': { rep: { law: -1, racers: 1, president: -1 }, npc: { framed: 'friend' }, deed: 'Warned a framed racer before the sheriff reached him.', later: ['framed_gang_help', 8, 14] },
  'sheriff:1:fail': { rep: { law: -1 }, deed: 'Tried to warn a racer who shot first.' },
  'cliffruins:0': { rep: { natives: 1 }, flag: 'corpseVision', deed: 'Read the painting of the Saint on the cliff.' },
  'cliffruins:0:fail': { rep: { natives: -1 }, deed: 'Crumbled an ancient painting with your hands.' },
  'cliffruins:1': { rep: { natives: -1 }, deed: 'Took what a cougar guarded in the cliff dwellings.' },
  'avalanche:0': { threat: 0.5, deed: 'Outran a rockslide the President’s man started.' },
  'avalanche:0:fail': { deed: 'Rode through a rockslide the hard way.' },
  'avalanche:1': { rep: { president: -1 }, deed: 'Caught the man pushing rocks down on the racers.', later: ['agent_captive', 3, 7] },
  'letter:0': { rep: { naples: 2 }, flag: 'marcoAlive', deed: 'Convinced Gyro to read the letter from Naples.' },
  'letter:1': { rep: { naples: 1 }, flag: 'letterSealed', deed: 'Let Gyro keep the letter from Naples sealed.' },
  'letter:2': { rep: { naples: 1 }, npc: { oyecomova: 'enemy' }, deed: 'Exposed the courier as one of Oyecomova’s spies.' },
  'letter:2:fail': { rep: { naples: -1 }, deed: 'Let Oyecomova’s spy get the better of you.' },
  'tornado:0': { rep: { law: 2 }, npc: { farmfamily: 'friend' }, deed: 'Pulled a family out of a tornado’s path.', later: ['farm_family', 6, 12] },
  'tornado:0:fail': { rep: { law: 1 }, npc: { farmfamily: 'friend' }, deed: 'Got a family out of a tornado, barely.' },
  'tornado:1': { rep: { law: -1 }, flag: 'leftFamily', deed: 'Outran a tornado while a family was still inside the farmhouse.' },
  'tornado:1:fail': { rep: { law: -1 }, flag: 'leftFamily', deed: 'Fled a tornado and left a family behind.' },
  'cattle:0': { rep: { law: 1 }, npc: { trailboss: 'friend' }, deed: 'Fought rustlers for a trail boss.', later: ['trailboss_drive', 6, 12] },
  'cattle:1': { rep: { law: 1 }, npc: { trailboss: 'friend' }, deed: 'Turned a stampede on the rustlers.' },
  'cattle:1:fail': { rep: { law: -1 }, deed: 'Lost a trail boss’s herd to rustlers.' },
  'revival:0': { rep: { vatican: -1 }, deed: 'Paid a false preacher for his silence.', later: ['preacher_report', 4, 9] },
  'revival:1': { rep: { vatican: 1, law: -1 }, deed: 'Threatened a preacher who spies for the President.' },
  'revival:1:fail': { rep: { president: -1 }, deed: 'A preacher rang the bell on you.' },
  'telegraph:0': { rep: { president: -2 }, flag: 'agentOrders', deed: 'Sent the President’s agents the wrong way by telegraph.' },
  'telegraph:0:fail': { rep: { president: -1 }, deed: 'Got caught forging a telegraph.' },
  'telegraph:1': { rep: { law: -1 }, threat: -0.5, deed: 'Cut the telegraph line.' },
  'frozenlake:0': { flag: 'tattooIntel', deed: 'Freed one of the eleven synchronised riders from the ice.' },
  'frozenlake:1': { threat: 0.5, deed: 'Raced across the frozen lake past a man in the ice.' },
  'frozenlake:1:fail': { deed: 'Fell through the ice of the frozen lake.' },
  'aurora:0': { rep: { naples: 1 }, flag: 'rectangleSnow', deed: 'Drew the Golden Rectangle with Gyro under the northern lights.' },
  'aurora:1': { flag: 'restedAurora', deed: 'Slept under the northern lights.' },
  'pocorace:0': { rep: { racers: -1 }, deed: 'Crossed the chasm and beat Pocoloco’s luck.' },
  'pocorace:0:fail': { deed: 'Slipped on the rope across the chasm.' },
  'pocorace:1': { rep: { racers: 1 }, npc: { pocoloco: 'friend' }, deed: 'Followed Pocoloco’s luck.' },
  'mirror:0': { flag: 'killedParallel', deed: 'Fought your own parallel self.' },
  'mirror:1': { rep: { president: -1 }, deed: 'Stole from your parallel self.' },
  'mirror:1:fail': { deed: 'Your arm began to crumble into cubes.' },
  'sewer:0': { rep: { vatican: 2, president: -1 }, npc: { nun: 'friend' }, flag: 'savedNun', deed: 'Stopped a guard dragging a nun through the sewers.' },
  'sewer:1': { rep: { vatican: -1 }, npc: { nun: 'taken' }, flag: 'nunTaken', deed: 'Slipped past while a nun was taken.' },
  'sewer:1:fail': { rep: { vatican: -1 }, deed: 'Fell into the sewer and had to fight.' },
  'newsboy:0': { npc: { lucy: 'trusts' }, flag: 'lucyNote', deed: 'Read Lucy’s secret note.' },
  'newsboy:1': { rep: { law: -1 }, deed: 'Paid a newsboy to spy on Presidential guards.' },
  'brother:0': { rep: { racers: -1 }, npc: { blackwoods: 'dead' }, deed: 'Shot the brother of the boy you robbed.' },
  'brother:1': { rep: { racers: 2 }, npc: { blackwoods: 'reconciled' }, deed: 'Apologised to the Blackwood brothers.' },
  'brother:1:fail': { rep: { racers: -1 }, deed: 'The Blackwood brother wouldn’t hear an apology.' },
  'repaid:0': { rep: { racers: 1 }, deed: 'Accepted the Blackwoods’ rifle.' },
  'repaid:1': { rep: { racers: 1 }, deed: 'The Blackwoods scouted a road for you.' },
  'scoutreturns:0': { rep: { natives: 1 }, flag: 'silentWarning', deed: 'The scout warned you about his brother Sandman.' },
  'scoutreturns:1': { rep: { natives: 2 }, deed: 'The scout guided you along his people’s paths.' },
  'warpaint:0': { rep: { natives: -2 }, npc: { scout: 'dead' }, deed: 'Fought the scout’s war party at dusk.' },
  'warpaint:1': { rep: { natives: 2 }, npc: { scout: 'friend' }, deed: 'Paid your debt to the scout’s people.' },
  'warpaint:1:fail': { rep: { natives: -1 }, deed: 'The scout’s people refused your charity.' },
  'farrierpay:0': { rep: { law: 2, president: -1 }, npc: { farrier: 'freed' }, deed: 'Freed the farrier’s father from a government wagon.' },
  'farrierpay:1': { rep: { law: 1 }, npc: { farrier: 'owed' }, deed: 'Promised to carry word to the farrier’s daughter.' },
  // hunters
  'hunt_agents:0': { rep: { president: -1 }, deed: 'Fought off riders on your trail.' }, 'hunt_agents:1': { deed: 'Lost your pursuers in a creek bed.' }, 'hunt_agents:2': { rep: { law: -1 }, deed: 'Bribed the President’s men.' },
  'hunt_dinos:0': { rep: { president: -1 }, deed: 'Broke through Diego’s dinosaurs.' }, 'hunt_dinos:1': { deed: 'Slipped Diego’s dinosaurs.' }, 'hunt_dinos:2': { deed: 'Fed Diego’s dinosaurs your money, somehow.' },
  'hunt_parallel:0': { rep: { president: -1 }, deed: 'Killed soldiers from another world.' }, 'hunt_parallel:1': { deed: 'Outran D4C’s soldiers.' }, 'hunt_parallel:2': { rep: { law: -1 }, deed: 'Paid off men from another world.' },
  'hunt_snipers:0': { rep: { president: -1 }, deed: 'Dealt with the President’s marksmen.' }, 'hunt_snipers:1': { deed: 'Dodged a sniper’s nest.' }, 'hunt_snipers:2': { rep: { law: -1 }, deed: 'Bought off a sniper.' },
  // detours
  'area_devilspalm:0': { rep: { natives: 1 }, deed: 'Entered the Devil’s Palm.' }, 'area_devilspalm:1': { rep: { natives: -1 }, deed: 'Scavenged the edge of the Devil’s Palm.' },
  'area_silvermine:0': { rep: { law: 1 }, deed: 'Went down into the Silver Mine.' }, 'area_silvermine:1': { rep: { law: -1 }, deed: 'Picked over an abandoned mine’s entrance.' },
  'area_lakeice:0': { deed: 'Took the frozen shortcut across Lake Michigan.' }, 'area_lakeice:1': { deed: 'Stayed off the lake ice.' },
  'area_railyard:0': { rep: { president: -1 }, deed: 'Cut through the Philadelphia rail yard.' }, 'area_railyard:1': { deed: 'Kept clear of the rail yard.' },
};
// Path trainers: taking a Path wins favour; turning a trainer down can make an enemy
Object.entries(SBR.PATHS).forEach(([pid, P]) => {
  const fav = { johnny: 'racers', gyro: 'naples', mountaintim: 'law', hotpants: 'vatican' }[P.char];
  const name = P.name;
  SBR.CONSEQ['path_' + pid + ':0'] = { rep: { [fav]: 1 }, deed: `Earned the Path of the ${name}.` };
  SBR.CONSEQ['path_' + pid + ':0:fail'] = { rep: { [fav]: 1 }, deed: `Failed a trainer’s test for the ${name}.` };
  SBR.CONSEQ['path_' + pid + ':1'] = { rep: { [fav]: 1 }, deed: `Won the Path of the ${name} in a duel.` };
  SBR.CONSEQ['path_' + pid + ':2'] = { rep: { [fav]: -1 }, deed: `Turned down the ${name} trainer.`, later: ['trainer_rival', 5, 10] };
});

/* ================= Follow-up encounters (only arrive through the consequence queue) ================= */
SBR.CAMPAIGN_EVENTS = [
  { id: 'gambler_revenge', type: 'elite', title: 'The Gambler Wants His Due', blurb: 'The card sharp from the saloon, and friends.', icon: 'skull', art: 'gunslinger', reveals: 'The gambler came back with hired guns.',
    text: 'The gambler from the saloon, his Stand hovering at his shoulder. "Nobody embarrasses me at my own table." Three men with him.',
    choices: [
      { label: 'Draw', ok: { text: 'Cards scatter across the road.', fight: { enemies: ['card_sharp', 'outlaw', 'outlaw'], elite: true, after: g => { g.money(50); g.rep('law', 1); } } } },
      { label: 'Offer him a rematch (LUCK)', check: { stat: 'luck', dc: 14 }, ok: { text: 'You win again. He laughs, finally, and buys you a drink. (+$60)', fx: g => { g.money(60); g.rep('racers', 1); } }, fail: { text: 'You lose, and pay. (-$40)', fx: g => { g.money(-40); } } },
    ] },
  { id: 'gambler_marker', type: 'event', title: 'A Marker Comes Due', blurb: 'A man with a ledger rides up.', icon: 'book', art: 'thug', reveals: 'Your lost bet was sold to a debt collector.',
    text: 'The gambler sold your debt. The collector wants it in cash, or in blood.',
    choices: [
      { label: 'Pay ($40)', cost: { money: 40 }, ok: { text: 'He tips his hat. "Pleasure."', fx: g => g.rep('law', 1) } },
      { label: 'Refuse', ok: { text: 'He whistles. His boys come out of the brush.', fight: { enemies: ['casino_thug', 'bandit'], after: g => g.rep('law', -1) } } },
    ] },
  { id: 'marksman_help', type: 'recruit', title: 'The Old Marksman Rides In', blurb: 'A familiar rifle on the ridge.', icon: 'recruit', art: 'gunslinger', reveals: 'The old marksman rode two states to cover your back.',
    text: 'The marksman you impressed. "Heard the President’s men are after you. Tim would’ve wanted me here."',
    choices: [
      { label: 'Let him cover you', ok: { text: 'Every shot you fire this act feels steadier. (Party +2 AIM.)', fx: g => g.statUpAll('aim', 2) } },
      { label: 'Send him to warn Mountain Tim', ok: { text: 'He rides for Kansas City. (Tim will be ready.)', fx: g => { g.flag('timWarned'); g.npc('mountaintim', 'warned'); } } },
    ] },
  { id: 'fortune_curse', type: 'elite', title: 'The Fortune Teller’s Curse', blurb: 'Pale figures walk beside your horses.', icon: 'skull', art: 'ghost', reveals: 'The fortune teller’s cold hand left ghosts on your trail.',
    text: 'Faces you half-remember. The fortune teller’s voice: "I told you some things should not be asked."',
    choices: [
      { label: 'Face them', ok: { text: 'They want to be seen.', fight: { enemies: ['ghost', 'ghost', 'ghost'], elite: true, after: g => { g.rep('vatican', 1); g.mat('sap', 1); } } } },
      { label: 'Pray (RESOLVE)', check: { stat: 'res', dc: 14 }, ok: { text: 'They fade. (Party +1 RESOLVE.)', fx: g => g.statUpAll('res', 1) }, fail: { text: 'They don’t listen.', fight: { enemies: ['ghost', 'ghost'] } } },
    ] },
  { id: 'agents_revenge', type: 'elite', title: 'The Agents Remember', blurb: 'Men in dark coats, and they know your face.', icon: 'skull', art: 'agent', reveals: 'The agents you ambushed reported you. Their friends came looking.',
    text: '"You killed Harris and Cole at that camp." More of them, this time.',
    choices: [
      { label: 'Fight', ok: { text: 'You were right to worry.', fight: { enemies: ['agent', 'agent', 'pres_sniper'], elite: true, after: g => g.rep('president', -1) } } },
      { label: 'Surrender your map to buy time', ok: { text: 'They take it and ride off to report. (-15 pace, Threat +1.)', fx: g => { g.pace(-15); g.threat(1); } } },
    ] },
  { id: 'burned_farm', type: 'event', title: 'Ashes on the Wind', blurb: 'A farmer stands in front of a burned field.', icon: 'fire', reveals: 'The fire you set at the agents’ camp burned a farmer’s harvest.',
    text: '"The fire came down the valley. From that government camp." He looks at the soot on your sleeves.',
    choices: [
      { label: 'Pay for his seed ($50)', cost: { money: 50 }, ok: { text: 'He says nothing, but he takes it.', fx: g => g.rep('law', 2) } },
      { label: 'Ride on', ok: { text: 'He’ll tell the sheriff what he saw. (Threat +0.5.)', fx: g => { g.rep('law', -1); g.threat(0.5); } } },
    ] },
  { id: 'fan_letters', type: 'event', title: 'Letters at the Checkpoint', blurb: 'A sack of mail with your name on it.', icon: 'book', reveals: 'Readers across America wrote back after your interview.',
    text: 'Letters from readers: a boy with polio, a widow, a veteran with one leg. Some sent money. One sent a bandage.',
    choices: [
      { label: 'Read them all', ok: { text: 'Johnny reads until dawn. (Johnny +2 RESOLVE, +1 GRIT.)', fx: g => { g.statUp('johnny', 'res', 2); g.statUp('johnny', 'grit', 1); } } },
      { label: 'Keep the money for the race', ok: { text: '(+$70.)', fx: g => { g.money(70); g.rep('law', -1); } } },
    ] },
  { id: 'prospector_curse', type: 'event', title: 'The Prospector Talks', blurb: 'A familiar voice in a Boomboom camp.', icon: 'skull', reveals: 'The prospector you left in the well sold your route to the Boomboom family.',
    text: 'Through the scope: the prospector you left in the well, pointing your way for the Boomboom brothers. They are magnetising the road.',
    choices: [
      { label: 'Ride around the magnets', ok: { text: 'It takes time. (-10 pace.)', fx: g => g.pace(-10) } },
      { label: 'Charge through', ok: { text: 'Iron sand clings to you. (The Boomboom family will start with the advantage.)', fx: g => g.flag('boomMagnetised') } },
    ] },
  { id: 'dothan_sabotage', type: 'event', title: 'Dot Han’s Grudge', blurb: 'Your horse won’t drink.', icon: 'horseshoe', art: 'gunslinger', reveals: 'Dot Han couldn’t stand losing to you and fouled your water.',
    text: 'Someone fouled the trough. Steppe-pony tracks lead away.',
    choices: [
      { label: 'Track him down', ok: { text: 'He laughs and throws you his flask. "Fair. You find me, you drink." (+10 pace.)', fx: g => { g.pace(10); g.npc('dothan', 'respect'); g.rep('racers', 1); } } },
      { label: 'Find clean water (-12 pace)', ok: { text: 'Slow going.', fx: g => g.pace(-12) } },
    ] },
  { id: 'dothan_help', type: 'event', title: 'Dot Han Returns the Favour', blurb: 'A stocky pony falls in beside you.', icon: 'horseshoe', art: 'gunslinger', reveals: 'Dot Han remembered the race and came back to help.',
    text: '"The steppe teaches that a good rival is worth two friends. There is a trail through here nobody else knows."',
    choices: [
      { label: 'Follow his trail', ok: { text: '(+25 pace.)', fx: g => g.pace(25) } },
      { label: 'Ask him to spy on Diego', ok: { text: 'He grins. "Diego is not as fast as he thinks." (Diego’s next fight starts Scanned.)', fx: g => g.flag('dothanSpied') } },
    ] },
  { id: 'framed_truth', type: 'event', title: 'The Real Killer', blurb: 'A confession in a Kansas newspaper.', icon: 'book', reveals: 'The racer you brought in for the bounty was innocent.',
    text: 'A government agent confesses to the murders you were paid to avenge. The racer you brought in was hanged last week.',
    choices: [
      { label: 'Send the bounty money to his family ($40)', cost: { money: 40 }, ok: { text: 'It doesn’t bring him back.', fx: g => { g.rep('racers', 2); g.statUp('johnny', 'res', 1); } } },
      { label: 'Burn the paper', ok: { text: 'You ride on. The racers read it too.', fx: g => g.rep('racers', -2) } },
    ] },
  { id: 'framed_gang_help', type: 'recruit', title: 'The Framed Man’s Friends', blurb: 'Riders flying a white rag.', icon: 'recruit', reveals: 'The racer you warned came back with his friends.',
    text: 'The racer you warned. "They set me up because I saw them digging. My friends and I owe you."',
    choices: [
      { label: 'Ask them to ride interference', ok: { text: 'They draw the President’s men off your trail. (Threat -1.5.)', fx: g => g.threat(-1.5) } },
      { label: 'Ask what they saw', ok: { text: 'Maps of every dig site. (+20 pace, you know the President’s plan.)', fx: g => { g.pace(20); g.flag('presidentPlan'); } } },
    ] },
  { id: 'agent_captive', type: 'event', title: 'The Man From the Ridge Talks', blurb: 'The agent you caught wants to deal.', icon: 'question', art: 'agent', reveals: 'The man who started the rockslide traded you secrets for his life.',
    text: '"Let me go and I’ll tell you who else is out here."',
    choices: [
      { label: 'Let him go', ok: { text: 'He tells you about the next ambush. (Next boss fight: you strike first.)', fx: g => { g.flag('agentOrders'); g.rep('president', 1); } } },
      { label: 'Hand him to the sheriff', ok: { text: '(Law approves.)', fx: g => { g.rep('law', 2); g.rep('president', -1); } } },
    ] },
  { id: 'farm_family', type: 'rest', title: 'A Family Waves You In', blurb: 'The farmhouse you saved from the tornado.', icon: 'fire', reveals: 'The family you saved from the tornado took you in.',
    text: 'They set extra plates without asking. The youngest has drawn a picture of Slow Dancer.',
    choices: [
      { label: 'Stay the night', ok: { text: '(Full heal, remove all Exhaustion.)', fx: g => { g.healAll(1); g.unexhaust(9); } } },
      { label: 'Leave them your spare coin', ok: { text: '(-$20, law +2.)', fx: g => { g.money(-20); g.rep('law', 2); } } },
    ] },
  { id: 'trailboss_drive', type: 'event', title: 'The Trail Boss’s Herd', blurb: 'A cattle drive blocks the road, and the boss waves.', icon: 'horseshoe', reveals: 'The trail boss you helped moved his whole herd aside for you.',
    text: '"Clear the road for my friends!" Two thousand head of cattle part like the Red Sea.',
    choices: [
      { label: 'Ride through', ok: { text: '(+20 pace.)', fx: g => g.pace(20) } },
      { label: 'Take a steer for supplies', ok: { text: '(Party heals 40%, +2 Leather.)', fx: g => { g.healAll(0.4); g.mat('leather', 2); } } },
    ] },
  { id: 'preacher_report', type: 'event', title: 'The Preacher’s Silence Runs Out', blurb: 'Soldiers asking about a racer with a holy relic.', icon: 'skull', reveals: 'The preacher you paid took your money, then reported you anyway.',
    text: 'He took your money and told them anyway. They know what you carry.',
    choices: [
      { label: 'Fight', ok: { text: 'Soldiers.', fight: { enemies: ['soldier', 'soldier', 'storm_deputy'], after: g => g.rep('president', -1) } } },
      { label: 'Hide the Corpse Parts and bluff (RESOLVE)', check: { stat: 'res', dc: 14 }, ok: { text: 'They search you and find nothing.', fx: g => g.threat(-1) }, fail: { text: 'They find it.', fight: { enemies: ['soldier', 'soldier'] } } },
    ] },
  { id: 'robinson_returns', type: 'event', title: 'A Buzz in the Grass', blurb: 'Insects gather into the shape of a man.', icon: 'question', art: 'robinson', acts: [2, 3, 4], reveals: 'Mrs. Robinson, whom you spared, came back with a warning.',
    text: 'Mrs. Robinson, half his face still scarred. "You spared me. So I’ll tell you: the rain in Kansas will stop falling, and it will cut you. Stay dry."',
    choices: [
      { label: 'Thank him', ok: { text: '(You know how Blackmore fights.)', fx: g => { g.flag('robinsonWarning'); g.npc('robinson', 'friend'); } } },
      { label: 'Ask him to ride with you', ok: { text: 'He shakes his head. "I race alone." He gives you his hive pistol’s spare rounds. (+2 Gunpowder, flag: warned.)', fx: g => { g.flag('robinsonWarning'); g.mat('powder', 2); } } },
    ] },
  { id: 'robinson_swarm', type: 'elite', title: 'The Swarm Remembers', blurb: 'Insects, without a master.', icon: 'skull', reveals: 'Mrs. Robinson’s insects outlived him and found you.',
    text: 'Without Mrs. Robinson to guide them, his insects nest in cacti along the trail, and in anyone who comes near.',
    choices: [
      { label: 'Burn through', ok: { text: 'Fire and buzzing.', fight: { enemies: ['cactus', 'cactus', 'bandit', 'rattlesnake'], elite: true } } },
      { label: 'Go around (-10 pace)', ok: { text: '', fx: g => g.pace(-10) } },
    ] },
  { id: 'boom_return', type: 'elite', title: 'The Boomboom Family Returns', blurb: 'Iron rises from the ground again.', icon: 'skull', reveals: 'The Boomboom brothers you let flee joined the President’s men.',
    text: 'Andre and L.A. Boomboom, in government coats now. "The President pays better than revenge."',
    choices: [
      { label: 'Fight', ok: { text: '', fight: { enemies: ['andre', 'laboom', 'agent'], elite: true } } },
      { label: 'Tell them their father died for nothing (RESOLVE)', check: { stat: 'res', dc: 15 }, ok: { text: 'They lower their magnets and ride off. (President -1.)', fx: g => g.rep('president', -1) }, fail: { text: 'It makes them angrier.', fight: { enemies: ['andre', 'laboom'] } } },
    ] },
  { id: 'bomber', type: 'elite', title: 'Oyecomova’s Student', blurb: 'A pin, pressed into your saddle overnight.', icon: 'skull', reveals: 'Oyecomova’s student came for revenge after his execution.',
    text: '"You executed my teacher. Naples will hear this too."',
    choices: [
      { label: 'Find the pin first (AIM)', check: { stat: 'aim', dc: 14 }, ok: { text: 'You pull it before it blows. He runs.', fx: g => g.rep('naples', 1) }, fail: { text: 'BOOM. (Everyone -12 HP.)', fx: g => g.hurtAllFlat(12) } },
      { label: 'Hunt him down', ok: { text: '', fight: { enemies: ['pass_bandit', 'boom_scout', 'bandit'], elite: true } } },
    ] },
  { id: 'oye_debt', type: 'event', title: 'A Tune You Know', blurb: 'Someone hums Oyecomova’s rhythm on the road.', icon: 'question', art: 'oyecomova', reveals: 'Oyecomova, handed to the consul, bought his freedom with a secret.',
    text: 'Oyecomova, free, in a traveller’s coat. "The consul let me go, for a price. Here is yours: the President’s men mine the bridges before the finish."',
    choices: [
      { label: 'Listen', ok: { text: '(+15 pace; the final stretch will be safer.)', fx: g => { g.pace(15); g.flag('bridgeWarning'); } } },
      { label: 'Arrest him again', ok: { text: '', fight: { enemies: ['oyecomova'], elite: true, after: g => g.rep('naples', 1) } } },
    ] },
  { id: 'trainer_rival', type: 'elite', title: 'A Trainer Scorned', blurb: 'Someone who offered to teach you, and was refused.', icon: 'skull', reveals: 'A trainer you turned down became a rival.',
    text: '"You thought you didn’t need what I had to teach. Let’s see."',
    choices: [
      { label: 'Duel', ok: { text: '', fight: { enemies: ['t_marshal', 'outlaw'], elite: true, after: g => g.xp(40) } } },
      { label: 'Apologise (RESOLVE)', check: { stat: 'res', dc: 13 }, ok: { text: 'He lowers his guard. (Party +1 all... to one stat: +1 RESOLVE.)', fx: g => g.statUpAll('res', 1) }, fail: { text: 'Too late for that.', fight: { enemies: ['t_marshal'], elite: true } } },
    ] },
  { id: 'guilt_ghosts', type: 'elite', title: 'The Soldiers of Gettysburg', blurb: 'Axl RO’s sins, without Axl.', icon: 'skull', art: 'ghost', acts: [5, 6], reveals: 'You condemned Axl RO, and the sins he carried came looking for a new home.',
    text: 'You condemned him. His guilt did not die with him. It needs somewhere to go.',
    choices: [
      { label: 'Face them', ok: { text: '', fight: { enemies: ['ghost', 'ghost', 'ghost', 'ghost'], elite: true } } },
      { label: 'Forgive him, now (RESOLVE)', check: { stat: 'res', dc: 16 }, ok: { text: 'They go quiet. (Johnny +2 RESOLVE.)', fx: g => g.statUp('johnny', 'res', 2) }, fail: { text: '', fight: { enemies: ['ghost', 'ghost', 'ghost'] } } },
    ] },
];
// every follow-up choice also moves something (they call g.rep/flag/stat inline); log them as deeds too
SBR.CAMPAIGN_EVENTS.forEach(e => e.choices.forEach((c, i) => { SBR.CONSEQ[e.id + ':' + i] = SBR.CONSEQ[e.id + ':' + i] || { deed: `${e.title}: ${c.label.replace(/ \(.*\)$/, '')}.` }; }));

/* ================= Main story branches ================= */
(() => {
  const S = SBR.STORY;
  const scene = (id, o) => { S[id] = o; };
  // Act I — Mrs. Robinson: spare or finish
  S.st_robinson.after = g => g.scene('robinson_fate');
  scene('robinson_fate', { bg: 1, lines: [{ narr: 'Mrs. Robinson lies in the sand, insects crawling out of his sleeves. He can still reach his gun.' }, { who: 'robinson', text: 'Go on, then. The desert is watching.' }],
    choices: [{ label: 'Spare him', ok: { text: 'You kick the gun away and ride on. He watches you go.' } }, { label: 'Finish it', ok: { text: 'The swarm scatters with his last breath.' } }] });
  Object.assign(SBR.CONSEQ, {
    'scene:robinson_fate:0': { rep: { racers: 1 }, npc: { robinson: 'spared' }, deed: 'Spared Mrs. Robinson in the desert.', later: ['robinson_returns', 6, 12] },
    'scene:robinson_fate:1': { rep: { law: 1, racers: -1 }, npc: { robinson: 'dead' }, deed: 'Killed Mrs. Robinson.', later: ['robinson_swarm', 2, 5] },
  });
  // Act I — Boomboom aftermath
  const boomPost = S.boom_post.fx;
  S.boom_post.choices = [
    { label: 'Take their list of targets', ok: { text: 'Names. Dates. A seal you don’t recognise yet: a white house.' } },
    { label: 'Let them run', ok: { text: 'Andre and L.A. scatter into the dunes.' } },
    { label: 'Turn them over to the sheriff', ok: { text: 'The sheriff of Arizona is very glad to see them.' } },
  ];
  S.boom_post.fx = g => { if (boomPost) boomPost(g); };
  Object.assign(SBR.CONSEQ, {
    'scene:boom_post:0': { rep: { president: -1 }, flag: 'presidentPlan', deed: 'Took the Boomboom family’s list of targets.' },
    'scene:boom_post:1': { rep: { racers: 1 }, npc: { boomboom: 'fled' }, deed: 'Let the Boomboom brothers run.', later: ['boom_return', 6, 12] },
    'scene:boom_post:2': { rep: { law: 2 }, npc: { boomboom: 'jailed' }, deed: 'Handed the Boomboom brothers to the sheriff.' },
  });
  // Act II — Oyecomova
  S.st_oyecomova.after = g => g.scene('oye_fate');
  scene('oye_fate', { bg: 2, lines: [{ who: 'oyecomova', text: 'Well, Zeppeli? Your family’s office. Carry out the sentence.' }, { who: 'gyro', text: '...' }],
    choices: [{ label: 'Hand him to the Naples consul', ok: { text: 'Gyro binds his hands. "The King can judge you."' } }, { label: 'Carry out the sentence', ok: { text: 'Gyro does his family’s duty. He doesn’t speak for an hour.' } }, { label: 'Let him go', ok: { text: '"Go home, Oyecomova. Naples needs builders more than bombers."' } }] });
  Object.assign(SBR.CONSEQ, {
    'scene:oye_fate:0': { rep: { naples: 2, law: 1 }, npc: { oyecomova: 'jailed' }, deed: 'Handed Oyecomova to the consul of Naples.', later: ['oye_debt', 10, 18] },
    'scene:oye_fate:1': { rep: { naples: -1 }, npc: { oyecomova: 'dead' }, deed: 'Gyro executed Oyecomova.', later: ['bomber', 8, 14] },
    'scene:oye_fate:2': { rep: { naples: 1, law: -1 }, npc: { oyecomova: 'freed' }, deed: 'Let Oyecomova go free.', later: ['oye_debt', 8, 14] },
  });
  // Act II — Pork Pie Hat Kid
  S.st_porkpie.after = g => g.scene('porkpie_fate');
  scene('porkpie_fate', { bg: 2, lines: [{ narr: 'The hat kid dangles from his own wire over the gorge.' }, { who: 'porkpie', text: 'Pull me up! I’ll tell you anything!' }],
    choices: [{ label: 'Interrogate him', ok: { text: 'He tells you where Dr. Ferdinand keeps his fossils, and how to break them.' } }, { label: 'Cut the wire', ok: { text: 'The wire hums, then goes slack.' } }] });
  Object.assign(SBR.CONSEQ, {
    'scene:porkpie_fate:0': { rep: { law: 1 }, flag: 'ferdWeakness', deed: 'Interrogated the Pork Pie Hat Kid.' },
    'scene:porkpie_fate:1': { rep: { president: -1, law: -1 }, npc: { porkpie: 'dead' }, deed: 'Cut the Pork Pie Hat Kid’s wire.', threat: 0.5 },
  });
  // Act I — warn Tim (he dies in Kansas City otherwise)
  S.st_tim.choices = [
    { label: 'Warn him about the President’s men', ok: { text: 'Tim listens. "I’ll keep one eye over my shoulder, then."' } },
    { label: 'Let him ride his own way', ok: { text: '"A cowboy doesn’t need looking after." He tips his hat.' } },
  ];
  Object.assign(SBR.CONSEQ, {
    'scene:st_tim:0': { rep: { law: 1 }, npc: { mountaintim: 'warned' }, deed: 'Warned Mountain Tim about the President’s men.' },
    'scene:st_tim:1': { rep: { law: 1 }, deed: 'Let Mountain Tim ride his own way.' },
  });
  // Act III — Hot Pants
  S.st_hotpants.choices.push({ label: 'Ask what the Vatican wants', check: { stat: 'res', dc: 12 }, ok: { text: 'A long silence. "The Saint belongs to God, not to Washington." She rides with you.', fx: g => { g.recruit('hotpants'); g.achieve('hotpants'); } }, fail: { text: 'She tells you nothing, but rides with you anyway.', fx: g => { g.recruit('hotpants'); g.achieve('hotpants'); } } });
  Object.assign(SBR.CONSEQ, {
    'scene:st_hotpants:0': { rep: { vatican: 1 }, npc: { hotpants: 'trusts' }, deed: 'Talked Hot Pants down over the dead cow.' },
    'scene:st_hotpants:0:fail': { rep: { vatican: 0 }, npc: { hotpants: 'wary' }, deed: 'Hot Pants didn’t believe you.' },
    'scene:st_hotpants:1': { rep: { vatican: -1 }, npc: { hotpants: 'wary' }, deed: 'Drew on Hot Pants.' },
    'scene:st_hotpants:2': { rep: { vatican: 2 }, npc: { hotpants: 'trusts' }, deed: 'Asked Hot Pants what the Vatican wants.' },
    'scene:st_hotpants:2:fail': { rep: { vatican: 1 }, npc: { hotpants: 'wary' }, deed: 'Asked Hot Pants about the Vatican.' },
  });
  // Act III — Sandman aftermath: Hot Pants may refuse to betray you
  const sandPost = S.sand_post.fx;
  S.sand_post.fx = g => {
    if (SBR.campaign.npcIs('hotpants', 'trusts') && SBR.campaign.repOf('vatican') >= 2) { g.scene('hp_stays'); return; }
    sandPost(g);
    SBR.campaign.deed('hp_betrayal', 'Hot Pants took the Corpse Parts.');
  };
  scene('hp_stays', { bg: 3, lines: [
    { narr: 'In the dark, Johnny feels hands on the Corpse Parts. Then they stop.' },
    { who: 'hotpants', text: 'The Vatican sent me to take these from you. I’m not going to.' },
    { who: 'gyro', text: '...Why?' }, { who: 'hotpants', text: 'Because you asked what I wanted. Nobody asks.' },
  ], fx: g => { SBR.campaign.deed('hp_loyal', 'Hot Pants refused the Vatican’s orders and stayed.'); SBR.campaign.reveal('scene:st_hotpants:2', 'Hot Pants remembered you asked, and refused to betray you.'); SBR.campaign.reveal('scene:st_hotpants:0', 'Hot Pants trusted you, and refused to betray you.'); g.flag('hpLoyal'); } });
  // Act III — Mountain Tim can survive Kansas City
  const blackFx = S.st_blackmore.fx;
  S.st_blackmore.fx = g => {
    if (SBR.campaign.npcIs('mountaintim', 'warned') || SBR.run.flags.timWarned) {
      SBR.campaign.deed('tim_lives', 'Mountain Tim survived Kansas City.');
      SBR.campaign.reveal('scene:st_tim:0', 'Tim kept one eye over his shoulder, and lived.');
      g.say('mountaintim', 'They came at me from three sides. I was ready. Lucy’s safe.');
      g.flag('timLives');
      return;
    }
    blackFx(g);
  };
  // Act IV — Wekapipo: add killing him
  const W0 = S.weka_spare.choices;
  if (!W0.some(c => c.label === 'Finish him')) W0.push({ label: 'Finish him', ok: { text: 'The Royal Guard falls into the snow. Nobody is left to guard Lucy Steel.', fx: g => g.flag('wekaDead') } });
  Object.assign(SBR.CONSEQ, {
    'scene:weka_spare:0': { rep: { naples: 1 }, npc: { wekapipo: 'friend' }, deed: 'Spared Wekapipo, and he rode with you.' },
    'scene:weka_spare:1': { rep: { naples: 1 }, npc: { wekapipo: 'guarding' }, flag: 'wekaLucy', deed: 'Sent Wekapipo to protect Lucy Steel.' },
    'scene:weka_spare:2': { rep: { naples: -2 }, npc: { wekapipo: 'dead' }, deed: 'Killed Wekapipo on the frozen strait.' },
  });
  SBR.CONSEQ['scene:weka_post:0'] = SBR.CONSEQ['scene:weka_spare:0']; SBR.CONSEQ['scene:weka_post:1'] = SBR.CONSEQ['scene:weka_spare:1']; SBR.CONSEQ['scene:weka_post:2'] = SBR.CONSEQ['scene:weka_spare:2'];
  if (S.weka_post && S.weka_post.choices !== W0) S.weka_post.choices = W0;
  // Act IV — Axl RO: forgive or condemn
  S.axl_post.choices = [
    { label: 'Forgive Axl RO', ok: { text: 'Johnny kneels by the dying man. "You ran. I did too." Axl RO closes his eyes.' } },
    { label: 'Condemn him', ok: { text: '"You carried nothing. Now carry this." His Stand’s rosary breaks in your hand.', fx: g => g.mat('rem_axl', 1) } },
  ];
  Object.assign(SBR.CONSEQ, {
    'scene:axl_post:0': { rep: { vatican: 2 }, flag: 'axlForgiven', deed: 'Forgave Axl RO as he died.' },
    'scene:axl_post:1': { rep: { vatican: -1 }, deed: 'Condemned Axl RO.', later: ['guilt_ghosts', 4, 9] },
  });
  // Act V — Diego truce
  Object.assign(SBR.CONSEQ, {
    'scene:diego_alliance:0': { rep: { racers: 1, president: -1 }, npc: { diego: 'ally' }, flag: 'diegoTruce', deed: 'Accepted Diego Brando’s truce.' },
    'scene:diego_alliance:1': { rep: { racers: -1 }, npc: { diego: 'enemy' }, deed: 'Refused Diego Brando’s truce.' },
    'scene:lt_post:0': { deed: 'Trusted the President, for one second.' },
    'scene:lt_post:1': { rep: { president: -1, naples: 1 }, flag: 'sawThroughValentine', deed: 'Kept your guard up when Valentine offered a deal.' },
    'scene:st_gasoline:0': { deed: 'Dived into a sewer to escape the fire.' },
    'scene:st_gasoline:0:fail': { deed: 'Burned in Diego’s trap.' },
    'scene:st_gasoline:1': { deed: 'Shot the falling match out of the air.', flag: 'shotMatch' },
    'scene:st_gasoline:1:fail': { deed: 'Missed the falling match.' },
    'scene:hp_stays:0': { deed: 'Hot Pants stayed.' },
  });
  // Act V — Gyro can survive Love Train
  const farewell = S.gyro_farewell.fx;
  S.gyro_farewell.fx = g => {
    const P = SBR.run.party.find(m => m.id === 'gyro');
    const lives = SBR.run.lead === 'gyro' || (SBR.campaign.repOf('naples') >= 3 && (SBR.run.flags.rectangleSnow || SBR.run.flags.rectangleLeaf || SBR.run.flags.horseGait || SBR.run.flags.marcoAlive || (P && P.path === 'goldenrider')));
    if (lives) { g.scene('gyro_lives'); return; }
    farewell(g);
    SBR.campaign.deed('gyro_dies', 'Gyro Zeppeli died on the shore.');
  };
  scene('gyro_lives', { bg: 5, lines: [
    { narr: 'Johnny carries Gyro to the shore. Then Gyro coughs. Then he laughs.' },
    { who: 'gyro', text: 'Nyo-ho... the Golden Rectangle. I drew it in the snow, remember? It held.' },
    { who: 'johnny', text: 'You idiot. You absolute idiot.' },
  ], fx: g => { g.flag('gyroLives'); SBR.campaign.deed('gyro_lives', 'Gyro Zeppeli survived the Love Train.'); SBR.campaign.reveal('aurora:0', 'The rectangle you drew in the snow saved Gyro’s life.'); SBR.campaign.reveal('spinschool:2', 'Hearing about Marco kept Gyro fighting to live.'); } });
})();

/* ================= Boss-time branches: parley with Sandman, Valentine's napkin ================= */
SBR.campaign.preBoss = async (B, ui, G) => {
  const r = SBR.run, C = SBR.campaign;
  // Sandman can be talked to if his people trust you
  if (B.enemies.includes('sandman') && C.repOf('natives') > -3 && !r.flags.sandmanGrudge && (C.repOf('natives') >= 2 || C.npcIs('scout', 'friend') || C.npcIs('sandman', 'friend'))) {
    const ch = await ui.eventPanel({ title: 'Sandman Waits', art: 'sandman', text: 'Sandman stands in the river, spear lowered. "My brother says you shared the water. Speak, then."', choices: [
      { label: 'Offer him the land-deed money from the race', ok: {} }, { label: 'Fight', ok: {} }] });
    if (ch && ch.label.startsWith('Offer')) {
      C.deed('sand_parley', 'Talked Sandman out of the fight at the river.'); C.reveal('hotspring:0', 'Sandman spared you because his brother remembered the spring.'); C.rep('natives', 2);
      await ui.resultPanel('The River', 'Sandman plants his spear in the mud. "Then run your race. I will run mine." He is gone before the water settles. The President’s men, who were watching from the trees, are not so patient.', 'star');
      G.flag('golden'); G.achieve('golden');
      return { enemies: ['soldier', 'storm_deputy', 'pres_sniper'], name: 'The President’s Cleanup Crew', elite: true, post: 'sand_parley_post' };
    }
  }
  // Valentine offers the first napkin before Love Train
  if (B.enemies.includes('lovetrain') && !r.flags.napkinOffered) {
    r.flags.napkinOffered = true;
    await ui.dialogue('napkin_offer');
    const ch = await ui.eventPanel({ title: 'The First Napkin', art: 'valentine', text: '"Take the napkin, Joestar. Walk beside me. The Corpse will make America first among nations, and you will walk. Gyro can go home."', choices: [
      { label: 'Take the napkin', ok: {} }, { label: 'Refuse', ok: {} }] });
    if (ch && ch.label.startsWith('Take')) {
      C.deed('napkin', 'Took the President’s napkin.'); G.flag('knight'); C.rep('president', 5); C.rep('vatican', -3); C.rep('naples', -3);
      G.dismiss('gyro', 'Gyro rides away without a word. He does not look back.');
      await ui.resultPanel('The President’s Knight', 'Valentine smiles. The Saint’s light gathers around you instead. Across the tracks, Diego Brando and a Vatican inquisitor are coming for what you now hold.', 'crown');
      return { enemies: ['diego_rival', 't_inquisitor'], name: 'Enemies of the Nation', boss: true, post: 'knight_post' };
    }
    C.deed('refused_napkin', 'Refused the President’s napkin.');
  }
  return null;
};
Object.assign(SBR.STORY, {
  sand_parley_post: { bg: 3, lines: [
    { narr: 'The President’s men lie in the mud. Across the river, a figure is already running west, faster than any horse.' },
    { narr: 'That night, Johnny dreams of hands reaching for the Corpse.', mood: 'menace' },
  ], fx: g => SBR.STORY.sand_post.fx(g) },
  knight_post: { bg: 5, lines: [
    { narr: 'Diego flees into another world. The inquisitor does not get up. The President lays a hand on your shoulder.' },
    { who: 'valentine', text: 'My Knight. The last stage is yours. Bring me the rest of the Saint.' },
  ], fx: g => { g.flag('valAlive'); g.relic('c_heart'); } },
});
SBR.STORY.act6_intro.variants = () => (SBR.run.flags.knight ? [
  { narr: 'New York. The President’s flags hang from every window. Your face is on the front page: THE NATION’S KNIGHT.' },
  { who: 'valentine', text: 'One Diego escaped into another world. Another has come from it. Finish them both.' },
] : null);
SBR.STORY.world_pre.variants = () => (SBR.run.flags.knight ? [
  { narr: 'The Brooklyn Bridge. Diego, from another world, blocks the road.', mood: 'menace' },
  { who: 'diegoworld', text: 'So the Joestar became the President’s dog. In my world you at least died proud.' },
] : null);
SBR.STORY.napkin_offer = { bg: 5, lines: [
  { narr: 'The train stops. Valentine steps down alone, holding a white napkin folded into a perfect square.' },
  { who: 'valentine', text: 'At a dinner table, whoever takes the first napkin decides the rules for everyone else. I am offering it to you.' },
] };

/* ================= Endings =================
   Picked in order: the first whose test passes. Driven by faction standing, who lived and who rode with you,
   flags from story choices and skipped beats, the Corpse Parts you still carry, and your lead rider. */
(() => {
  const f = () => SBR.run.flags;
  const has = id => SBR.run.party.concat(SBR.run.reserve || []).some(m => m.id === id);
  const npc = (id, ...st) => st.some(s => SBR.campaign.npcIs(id, s));
  const holy = () => Object.keys(SBR.run.mats || {}).filter(k => SBR.MATERIALS[k] && SBR.MATERIALS[k].holy && SBR.run.mats[k] > 0).length;
  const tier = () => (SBR.threatTier ? SBR.threatTier() : 0);
  SBR.ENDINGS = {
    knight:   { name: 'The President’s Knight', scene: 'ending_knight', test: w => f().knight },
    lone:     { name: 'Lone Rider', scene: 'ending_lone', test: w => SBR.run.party.length <= 1 && Object.values(w.rep).filter(v => v <= -2).length >= 3 },
    sold:     { name: 'Thirty Pieces of Silver', scene: 'ending_sold', test: w => f().soldCorpse },
    vessel:   { name: 'The Saint’s Vessel', scene: 'ending_vessel', test: w => f().lucyCaptured && !has('lucy') },
    outlaw:   { name: 'Wanted Across America', scene: 'ending_outlaw', test: w => w.rep.law <= -3 && tier() >= 2 },
    saint:    { name: 'The Saint’s Return', scene: 'ending_saint', test: w => w.rep.vatican >= 3 && f().hpLoyal },
    zeppeli:  { name: 'Zeppeli’s Promise', scene: 'ending_zeppeli', test: w => f().gyroLives && w.rep.naples >= 2 },
    homeland: { name: 'Sandman’s Land', scene: 'ending_homeland', test: w => w.rep.natives >= 4 && (f().sandParley || npc('sandman', 'friend')) },
    sister:   { name: 'Wekapipo’s Sister', scene: 'ending_sister', test: w => has('wekapipo') && (f().wekaPromise || f().wekaTruth) },
    marshal:  { name: 'The Marshal of the West', scene: 'ending_marshal', test: w => (f().timLives || has('mountaintim')) && w.rep.law >= 3 },
    steels:   { name: 'The Steels of New York', scene: 'ending_steels', test: w => npc('steven', 'friend') && (npc('lucy', 'friend', 'safe') || has('lucy')) },
    keeper:   { name: 'Keeper of the Corpse', scene: 'ending_keeper', test: w => holy() >= 5 },
    rivals:   { name: 'Two Riders at the Line', scene: 'ending_rivals', test: w => npc('diego', 'ally', 'respect', 'deal') || f().diegoTruce },
    absolved: { name: 'Cream Starter’s Absolution', scene: 'ending_absolved', test: w => SBR.run.lead === 'hotpants' },
    cowboy:   { name: 'Oh! Lonesome Me', scene: 'ending_cowboy', test: w => SBR.run.lead === 'mountaintim' },
    pardon:   { name: 'The Executioner’s Pardon', scene: 'ending_pardon', test: w => SBR.run.lead === 'gyro' },
    champion: { name: 'Walking Again — Champion', scene: 'epilogue_champion', test: () => SBR.game.playerRank() === 1 },
    canon:    { name: 'Walking Again', scene: 'epilogue_canon', test: () => true },
  };
})();
SBR.campaign.pickEnding = () => { const w = SBR.campaign.world(); const f = SBR.run.forceEnding; if (f && SBR.ENDINGS[f]) return f; return Object.keys(SBR.ENDINGS).find(k => { try { return SBR.ENDINGS[k].test(w); } catch (e) { return false; } }); };
Object.assign(SBR.STORY, {
  ending_knight: { bg: 6, lines: [
    { narr: 'The Corpse rests in a vault beneath the White House. America prospers. Every misfortune in the world flows somewhere else.' },
    { narr: 'Johnny Joestar walks. He is decorated, photographed, and watched, always, by men in dark coats.' },
    { who: 'johnny', text: 'I got what I wanted. So why can’t I remember Gyro’s laugh?' },
  ] },
  ending_saint: { bg: 5, lines: [
    { narr: 'Hot Pants carries the Corpse to Rome in a plain wooden box. Nobody on the ship knows what it is.' },
    { who: 'hotpants', text: 'The Saint belongs to no nation. Thank you, Johnny. You asked me what I wanted.' },
    { narr: 'Johnny walks down the gangway on his own legs, and does not look back at the box.' },
  ] },
  ending_zeppeli: { bg: 5, lines: [
    { narr: 'A ship to Naples. Two men on deck: one walking, one grinning with golden teeth.' },
    { who: 'gyro', text: 'Marco will be pardoned. The King keeps his word when enough people are watching. And the whole world watched us, Johnny.' },
    { who: 'johnny', text: 'Then let’s go and make sure.' },
  ] },
  ending_lone: { bg: 6, lines: [
    { narr: 'Johnny Joestar crosses the finish line alone. There is no one waiting.' },
    { narr: 'Everyone he left behind on the trail is somewhere else now. Some of them are cursing his name.' },
    { who: 'johnny', text: 'I walked all the way here. For what?' },
  ] },
  ending_sold: { bg: 6, lines: [
    { narr: 'The President’s briefcase paid for a house on the Hudson, a stable of thoroughbreds, and a very good lawyer.' },
    { narr: 'Johnny walks, a little. Some mornings his legs forget how. The newspapers say the President is blessed. Every war goes well for America now.' },
    { who: 'johnny', text: 'Gyro would have spat on this money. I keep it in a drawer I never open.' },
  ] },
  ending_vessel: { bg: 5, lines: [
    { narr: 'Nobody ever got Lucy Steel off the President’s train.' },
    { narr: 'In a white room in Washington, a girl of fourteen sleeps with a Saint growing inside her. Doctors take notes. Steven Steel writes a letter every day. None are delivered.' },
    { who: 'johnny', text: 'I told her I’d look out for her. I told a lot of people a lot of things.' },
  ] },
  ending_outlaw: { bg: 6, lines: [
    { narr: 'Johnny crosses the finish line with a sheriff’s posse fifty yards behind him and his face on every post in New York.' },
    { narr: 'He doesn’t stop at Trinity Church. He rides straight through Manhattan and onto a coal barge heading south.' },
    { who: 'johnny', text: 'They can call me whatever they like. I’m walking, and I’m free, and I had neither in San Diego.' },
  ] },
  ending_homeland: { bg: 3, lines: [
    { narr: 'The prize money arrives in Arizona in a locked strongbox. Sandman’s sister counts it on a kitchen table.' },
    { who: 'sandman', text: 'Enough for the river, and the hills where my grandfather is buried. The land is ours on their paper now. That is the only kind they respect.' },
    { narr: 'Johnny walks along the river with him. Sandman does not run. For once, there is nowhere he has to be.' },
  ] },
  ending_sister: { bg: 4, lines: [
    { narr: 'A farmhouse in the Italian countryside. A woman opens the door and drops the basket she is carrying.' },
    { who: 'wekapipo', text: '...I was told you were dead. I believed it for eight years.' },
    { narr: 'Johnny waits by the gate and lets them have the afternoon. Later, over dinner, Wekapipo laughs. Nobody at the table has heard him do it before.' },
  ] },
  ending_marshal: { bg: 1, lines: [
    { narr: 'Mountain Tim takes the marshal’s star in Arizona the week after the race. The first thing he does is arrest every agent still wearing the President’s pin.' },
    { who: 'mountaintim', text: 'Out here we don’t have a Saint. We have a rope and a promise. That’ll do.' },
    { narr: 'Johnny visits every spring. They ride the old trail, slowly, and argue about horses.' },
  ] },
  ending_steels: { bg: 6, lines: [
    { narr: 'Steven Steel announces the second Steel Ball Run from the steps of Trinity Church, with his wife beside him holding his hat.' },
    { who: 'lucy', text: 'Everyone said he was a fool. He’s just brave in a way that looks silly. So am I, now.' },
    { who: 'steven', text: 'And the first entrant, ladies and gentlemen: a young man who walked here from San Diego!' },
  ] },
  ending_keeper: { bg: 5, lines: [
    { narr: 'Johnny Joestar keeps the Corpse. Nobody else would carry it the way it should be carried, so he does.' },
    { narr: 'He buries it piece by piece in places nobody will look: a desert, a lake bed, a church in Philadelphia. He tells no one, not even his children.' },
    { who: 'johnny', text: 'It isn’t mine. It isn’t anyone’s. That’s exactly why it has to be me.' },
  ] },
  ending_rivals: { bg: 6, lines: [
    { narr: 'Two riders at the line, neck and neck: Johnny Joestar and Diego Brando.' },
    { who: 'diego', text: 'Don’t think this makes us anything, Joestar.' },
    { narr: 'The judges can’t separate them. The newspapers print both names, and neither man ever agrees whose should have come first.' },
  ] },
  ending_absolved: { bg: 5, lines: [
    { narr: 'Hot Pants finishes the race and does not go to Rome. She goes back to the woods where the bear found them, and builds a small chapel there.' },
    { who: 'hotpants', text: 'I wanted the Saint to forgive me. I think I had to do it myself.' },
  ] },
  ending_cowboy: { bg: 1, lines: [
    { narr: 'Mountain Tim rides the last mile slowly, his rope coiled on the saddle, and tips his hat to the crowd.' },
    { who: 'mountaintim', text: 'Folks ask what I’ll do with the prize. Buy a ranch. Sit on a porch. Maybe learn to be lonesome properly.' },
  ] },
  ending_pardon: { bg: 5, lines: [
    { narr: 'The King of Naples keeps his word, because everyone is watching. Marco walks out of the prison into the sun.' },
    { who: 'gyro', text: 'Nyo-ho-ho! I told you, Johnny. Rotation. Everything comes back around, if you throw it right.' },
  ] },
});

/* ================= Fight effects from consequences ================= */
SBR.campaignFightFlags = (c, note, any, P) => {
  const f = SBR.run.flags;
  if (f.boomMagnetised && any(['benjamin', 'andre'])) { P.forEach(u => c.addStatus(u, 'magnet', 0, 3, true)); note('The Boomboom family magnetised the road ahead of you.'); }
  if (f.robinsonWarning && any(['blackmore'])) { P.forEach(u => c.addStatus(u, 'evasive', 0, 2, true)); note('Mrs. Robinson warned you about the rain.'); }
  if (f.ferdWeakness && any(['ferdinand'])) { c.enemies().forEach(e => c.addStatus(e, 'vuln', 0, 3, true)); note('The hat kid told you how to break the fossils.'); }
  if (f.tattooIntel && any(['tattoo', 'tattoo_boss'])) { c.enemies().forEach(e => c.addStatus(e, 'marked', 0, 2, true)); note('The rider from the ice told you how they phase.'); }
  if (f.facedGuilt && any(['axl'])) { P.forEach(u => c.addStatus(u, 'calm', 0, 3, true)); note('You already faced Nicholas.'); }
  if (f.leftFamily && any(['axl'])) { P.forEach(u => c.addStatus(u, 'guilt', 2, 0, true)); note('A family in a tornado. Civil War remembers.'); }
  if (f.axlForgiven) P.forEach(u => { u.eqb = Object.assign({}, u.eqb, { immune: ((u.eqb && u.eqb.immune) || []).concat('guilt') }); });
  if (f.fortuneRingo && any(['ringo'])) { P.forEach(u => c.addStatus(u, 'lucky', 0, 3, true)); note('The fortune teller told you about the man in the cabin.'); }
  if (f.dothanSpied && any(['diego_rival', 'diego_world'])) { c.enemies().forEach(e => c.addStatus(e, 'marked', 0, 2, true)); note('Dot Han spied on Diego for you.'); }
  if (f.diegoTruce && any(['diego_world'])) { P.forEach(u => c.addStatus(u, 'empower', 0, 2, true)); note('You rode beside one Diego. You know how the other one moves.'); }
  if (f.nunTaken && any(['lovetrain', 'valentine1'])) { c.enemies().forEach(e => c.addStatus(e, 'shield', 20, 0, true)); note('The nun you left behind was taken to the President.'); }
  if (f.wekaDead && any(['mikeo'])) { c.enemies().forEach(e => c.addStatus(e, 'empower', 0, 3, true)); note('Nobody guarded Lucy. The President’s men were ready.'); }
  if (f.bridgeWarning && any(['diego_world'])) { P.forEach(u => c.addStatus(u, 'guard', 0, 2, true)); note('Oyecomova warned you about the mined bridges.'); }
};

/* detour story events: each choice leaves a mark */
Object.entries(SBR.AREA_EVENTS || {}).forEach(([id, e]) => e.choices.forEach((c, i) => {
  const base = { deed: `${e.title}: ${c.label.replace(/ \(.*\)$/, '')}.`, rep: {} };
  if (i === 0) base.rep.law = 1; else if (i === 1) base.rep.president = -1; else base.rep.racers = 1;
  SBR.CONSEQ['areaev_' + id + ':' + i] = base;
  SBR.CONSEQ['areaev_' + id + ':' + i + ':fail'] = { deed: `${e.title}: it went badly.`, rep: {} };
}));

/* ================= Chronicle (journal) UI ================= */
SBR.chronicleUI = (() => {
  const el = SBR.util.el;
  const mood = v => (v >= 2 ? 'warm' : v <= -2 ? 'cold' : 'neutral');
  const face = m => ({ warm: '\u263A', neutral: '\u2014', cold: '\u2639' }[m]);
  function page(w, opts = {}) {
    const box = el('div', { class: 'chronicle' + (opts.recap ? ' recap' : '') });
    const rel = el('div', { class: 'chr-rel' });
    Object.entries(SBR.FACTIONS).forEach(([k, F]) => {
      const m = mood(w.rep[k] || 0);
      const c = el('div', { class: 'chr-face ' + m, html: `<div class="chr-port">${SBR.art.portrait(F.portrait)}</div><span>${face(m)}</span>` });
      SBR.tip.bind(c, `<b>${F.name}</b><br>${m === 'warm' ? 'They speak well of you.' : m === 'cold' ? 'They speak of you with contempt.' : 'They have not made up their minds.'}`);
      rel.appendChild(c);
    });
    box.appendChild(el('div', { class: 'chr-sub' }, 'HOW THE WEST REMEMBERS YOU'));
    box.appendChild(rel);
    box.appendChild(el('div', { class: 'chr-sub' }, opts.recap ? 'WHAT YOU DID, AND WHAT IT CAUSED' : 'CHRONICLE OF THE RACE'));
    const list = el('div', { class: 'chr-list' });
    const deeds = w.deeds.slice().reverse();
    if (!deeds.length) list.appendChild(el('p', { class: 'muted' }, 'Nothing written yet. Every choice on the road ends up here.'));
    let lastAct = null;
    (opts.recap ? w.deeds : deeds).forEach(d => {
      if (d.act !== lastAct) { list.appendChild(el('div', { class: 'chr-act' }, SBR.ACTS[d.act] ? `${SBR.ACTS[d.act].name} \u2014 ${SBR.ACTS[d.act].title}` : '')); lastAct = d.act; }
      list.appendChild(el('div', { class: 'chr-entry' + (d.reveal ? ' revealed' : ''), html: `<span class="chr-text">${d.text}</span>${d.reveal ? `<span class="chr-reveal">\u2192 ${d.reveal}</span>` : ''}` }));
    });
    box.appendChild(list);
    return box;
  }
  function open() { if (!SBR.run) return; SBR.ui.modal(page(SBR.campaign.world()), { title: 'Chronicle', drawer: true }); }
  function recap(END) {
    return new Promise(res => {
      const w = SBR.campaign.world();
      const box = el('div', { class: 'chr-recap' }, el('div', { class: 'chr-ending' }, el('small', {}, 'ENDING'), el('h2', {}, END.name)));
      box.appendChild(page(w, { recap: true }));
      const m = SBR.ui.modal(box, { size: 'wide', onClose: res });
      box.appendChild(SBR.ui.btn('Ride into the sunset \u25B8', () => { SBR.ui.closeModal(m); res(); }, 'btn-primary'));
    });
  }
  return { open, recap, page };
})();
