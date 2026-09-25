/* The Saint's Corpse matters to every lead, not just Johnny and Gyro.
   1. Every Corpse Part you carry gives the current LEAD a battle ability (SBR.extraAbilities).
   2. Corpse encounters: give a part to the Vatican, sell one for a pardon, bury one, fuse two, follow a part that
      calls to another, and a hound who tracks what you carry.
   3. Carrying many parts matters: the President hunts harder, and at 3 / 5 / 7 parts the Saint blesses the party
      (SBR.bonus), battles open Sanctified, and the lead gets a Corpse power in the stage sprint.
   Loads before combat.js / ui.js / sprint.js / main.js: anything that wraps those is installed on DOMContentLoaded. */
'use strict';

SBR.corpse = (() => {
  const PARTS = ['c_leftarm', 'c_eyes', 'c_spine', 'c_ears', 'c_rightarm', 'c_legs', 'c_heart'];
  const ABIL = { c_leftarm: 'corpse_hand', c_eyes: 'corpse_sight', c_spine: 'corpse_spine', c_ears: 'corpse_ears', c_rightarm: 'corpse_touch', c_legs: 'corpse_stride', c_heart: 'corpse_heart' };
  const short = id => (SBR.MATERIALS[id] ? SBR.MATERIALS[id].name.replace('Corpse: ', '') : id);
  const run = () => SBR.run;
  /** separate Corpse Parts you carry (the fused relic is not in this list) */
  const held = () => { const r = run(); if (!r || !r.mats) return []; return PARTS.filter(id => r.mats[id] > 0); };
  const fused = () => { const r = run(); return r && r.mats && r.mats.c_fused > 0 && Array.isArray(r.corpseFused) ? r.corpseFused : null; };
  /** every part you carry, counting the two inside a fused relic */
  const all = () => held().concat(fused() || []);
  const count = () => all().length;
  const missing = () => PARTS.filter(id => !all().includes(id));
  const tier = () => { const n = count(); return n >= 7 ? 3 : n >= 5 ? 2 : n >= 3 ? 1 : 0; };
  const TIERS = [null,
    { name: 'Saint\'s Blessing I', desc: 'Three parts. The party regenerates 1 HP a turn, heals 10% more, and takes 10% less Stand damage. Battles open Sanctified.' },
    { name: 'Saint\'s Blessing II', desc: 'Five parts. +10% damage, +5% crit, and a 6 Shield at the start of every battle. The President\'s men are waiting for you.' },
    { name: 'Saint\'s Blessing III', desc: 'The whole Saint. +1 starting Energy, immune to Fear, and once per battle the first rider to fall is stitched back.' },
  ];
  const G = () => SBR.game && SBR.game.G;

  function removePart(id) {
    const r = run();
    if (!r.mats[id]) return false;
    delete r.mats[id];
    if (id === 'c_leftarm') { const j = r.party.concat(r.reserve || []).find(m => m.id === 'johnny'); if (j) { j.maxHp = Math.max(1, j.maxHp - 12); j.hp = Math.min(j.hp, j.maxHp); } }
    SBR.toast(`<span class="toast-ico">${SBR.matIcon(id)}</span><div><b>${SBR.MATERIALS[id].name}</b> is gone.</div>`, 'loss');
    return true;
  }
  function givePart(id) { const g = G(); if (g) g.relic(id); }

  /** a modal to choose one of your Corpse Parts */
  function pickPart(title, exclude = []) {
    const list = held().filter(id => !exclude.includes(id));
    if (!list.length) return Promise.resolve(null);
    if (!SBR.ui || !SBR.ui.modal) return Promise.resolve(list[0]);
    const { el } = SBR.util;
    return new Promise(resolve => {
      const box = el('div', { class: 'chooser corpse-pick' });
      box.appendChild(el('p', {}, title));
      const ul = el('div', { class: 'chooser-list' });
      list.forEach(id => {
        const A = SBR.ABILITIES[ABIL[id]];
        const b = el('button', { class: 'chooser-ab', html: `<span class="pt-port cp-ico">${SBR.matIcon(id)}</span><div><b>${SBR.MATERIALS[id].name}</b><p>${SBR.RELICS[id] ? SBR.RELICS[id].desc : ''}</p><p class="up">Lead ability: ${A ? A.name : '—'}</p></div>` });
        b.onclick = () => { SBR.audio.play('select'); SBR.ui.closeModal(w); resolve(id); };
        ul.appendChild(b);
      });
      box.appendChild(ul);
      const w = SBR.ui.modal(box, { title: 'The Saint\'s Corpse', size: 'wide', noClose: true });
    });
  }

  /** announce a change of blessing tier */
  function checkTier() {
    const r = run(); if (!r) return;
    const t = tier(), before = r.corpseTier || 0;
    if (t === before) return;
    r.corpseTier = t;
    if (t > before && TIERS[t]) {
      SBR.toast(`<span class="toast-ico">${SBR.icons.relic('c_heart')}</span><div><b style="color:#ffd84a">${TIERS[t].name}</b><br><small>${TIERS[t].desc}</small></div>`, 'corpse');
      if (SBR.audio) SBR.audio.play('success');
    } else if (t < before) SBR.toast(`<div><b>The Saint's blessing fades.</b><br><small>${t ? TIERS[t].name + ' remains.' : 'You carry too few parts to be blessed.'}</small></div>`, 'loss');
  }
  return { PARTS, ABIL, held, fused, all, count, missing, tier, TIERS, removePart, givePart, pickPart, checkTier, short };
})();

/* ================= 1. The fused relic (a holy material) ================= */
SBR.RELICS.c_fused = { name: 'Corpse: Joined Relic', glyph: '聖', color: '#ffd84a', rarity: 'corpse', desc: 'Two Corpse Parts grown back together. Each part\'s blessing is half again as strong, and the lead learns Saint\'s Union.', bonus: {}, corpse: true };
SBR.MATERIALS.c_fused = { name: 'Corpse: Joined Relic', rarity: 'holy', holy: true, group: 'holy', bonus: {}, desc: SBR.RELICS.c_fused.desc + ' Blesses the whole party while you carry it.' };
SBR.icons.define('relic', 'c_fused', () => {
  const I = SBR.icons, st = I.st;
  return `<path d="M12 40 L20 16 Q24 8 28 16 L36 40" fill="none" stroke="${I.K}" stroke-width="7" stroke-linecap="round"/><path d="M12 40 L20 16 Q24 8 28 16 L36 40" fill="none" stroke="#e8d8a8" stroke-width="3.6" stroke-linecap="round"/><circle cx="24" cy="26" r="6" fill="#ffd84a" ${st}/>` + I.P.halo('#f2c14e').replace('cy="10"', 'cy="6"');
});

/* ================= 2. Lead abilities, one per part ================= */
(() => {
  const lv = (x, a, b) => (x.lvl > 1 ? b : a);
  const note = id => ` <i>(from the ${SBR.corpse.short(id)})</i>`;
  Object.assign(SBR.ABILITIES, {
    corpse_hand: { name: 'Left Arm: Hand of the Saint', cost: 1, cd: 2, target: 'enemy', tags: [], dtype: 'holy', fx: 'golden',
      desc: l => `The Saint's hand guides the blow. ${l > 1 ? 12 : 9} Holy damage that cannot be dodged. Double against the undead.` + note('c_leftarm'),
      run(x) { x.dmg(x.target, lv(x, 9, 12), { res: 0.04, spin: 0.02 }, { noDodge: true, label: 'HOLY' }); } },
    corpse_sight: { name: 'Right Eye: The Saint\'s Sight', cost: 1, cd: 3, target: 'allEnemies', tags: [], fx: 'scan',
      desc: l => `See every weak point. All enemies are Scanned ${l > 1 ? 3 : 2}; you gain Lucky 2.` + note('c_eyes'),
      run(x) { x.enemies.forEach(e => x.status(e, 'marked', 0, lv(x, 2, 3))); x.status(x.user, 'lucky', 0, 2); } },
    corpse_spine: { name: 'Spine: Upright Spirit', cost: 0, cd: 4, target: 'self', tags: [], fx: 'buff',
      desc: l => `Stand straight. Gain ${l > 1 ? 3 : 2} Energy and cleanse 2 debuffs.` + note('c_spine'),
      run(x) { x.energy(x.user, lv(x, 2, 3)); x.cleanse(x.user, 2); } },
    corpse_ears: { name: 'Ears: Hear What Is Coming', cost: 1, cd: 3, target: 'allAllies', tags: [], fx: 'buff',
      desc: l => `The Saint hears the shot before it is fired. The whole party gains Evasive ${l > 1 ? 3 : 2}.` + note('c_ears'),
      run(x) { x.allies.forEach(a => x.status(a, 'evasive', 0, lv(x, 2, 3))); } },
    corpse_touch: { name: 'Right Arm: Laying On of Hands', cost: 2, cd: 3, target: 'allAllies', tags: [], fx: 'heal',
      desc: l => `Heal every ally ${l > 1 ? 14 : 10} (scales with RESOLVE) and cleanse 1 debuff each.` + note('c_rightarm'),
      run(x) { x.allies.forEach(a => { x.heal(a, lv(x, 10, 14), { res: 0.03 }); x.cleanse(a, 1); }); } },
    corpse_stride: { name: 'Legs: Pilgrim\'s Stride', cost: 1, cd: 3, target: 'self', tags: [], fx: 'buff',
      desc: l => `Walk as the Saint walked. Second Wind ${l > 1 ? 3 : 2}, Evasive 1 and Empowered 1.` + note('c_legs'),
      run(x) { x.status(x.user, 'secondwind', 0, lv(x, 2, 3)); x.status(x.user, 'evasive', 0, 1); x.status(x.user, 'empower', 0, 1); } },
    corpse_heart: { name: 'Heart: The Sacred Heart', cost: 3, cd: 5, target: 'allEnemies', tags: [], dtype: 'holy', fx: 'golden',
      desc: l => `The heart beats once, and everything unholy hears it. ${l > 1 ? 18 : 14} Holy to every enemy; the party is Sanctified 2.` + note('c_heart'),
      run(x) { x.enemies.forEach(e => x.dmg(e, lv(x, 14, 18), { res: 0.04 }, { label: 'SACRED' })); x.allies.forEach(a => x.status(a, 'sanctified', 0, 2)); } },
    corpse_union: { name: 'Saint\'s Union', cost: 3, cd: 5, target: 'enemy', tags: [], dtype: 'holy', fx: 'golden', pierce: true,
      desc: l => `The joined relic burns with light. ${l > 1 ? 30 : 24} piercing Holy damage; you heal 12 and the party gains Regen 2.`,
      run(x) { x.dmg(x.target, lv(x, 24, 30), { res: 0.05 }, { noDodge: true, pierce: true, label: 'UNION' }); x.heal(x.user, 12); x.allies.forEach(a => x.status(a, 'regen', 0, 2)); } },
  });
  // tell the player on each part what it does for the lead
  Object.entries(SBR.corpse.ABIL).forEach(([id, ab]) => { const M = SBR.MATERIALS[id]; if (M && !/Lead ability/.test(M.desc)) M.desc += ` Lead ability: ${SBR.ABILITIES[ab].name}.`; });

  /* lead-only: main.js's memberAbilities calls this when it exists */
  const prev = SBR.extraAbilities;
  SBR.extraAbilities = m => {
    const out = prev ? (prev(m) || []).slice() : [];
    const r = SBR.run;
    if (!r || !m || m.id !== r.lead) return out;
    SBR.corpse.all().forEach(id => { const a = SBR.corpse.ABIL[id]; if (a && !out.includes(a)) out.push(a); });
    if (SBR.corpse.fused() && !out.includes('corpse_union')) out.push('corpse_union');
    return out;
  };

  /* icons: a haloed disc with the part's motif */
  const I = SBR.icons, st = I.st, K = I.K;
  const disc = (c, inner) => `<circle cx="24" cy="24" r="19" fill="${c}" ${st}/><ellipse cx="24" cy="8" rx="11" ry="3.6" fill="none" stroke="#ffd84a" stroke-width="2.4"/>` + inner;
  const ray = (n, r0, r1, c = '#fff3a0') => [...Array(n)].map((_, i) => { const a = i * 2 * Math.PI / n; return `<path d="M${(24 + Math.cos(a) * r0).toFixed(1)} ${(26 + Math.sin(a) * r0).toFixed(1)}L${(24 + Math.cos(a) * r1).toFixed(1)} ${(26 + Math.sin(a) * r1).toFixed(1)}" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`; }).join('');
  const draw = {
    corpse_hand: () => disc('#c8a040', `<path d="M16 38l3-12q-2-6 1-10l3-5 2.4 1.6-1.6 5 4.8-5 2.4 1.6-4 5.6 5.6-3.2 1.6 2.4-5.6 4.8 4.8-.8.8 2.4-8 4-1.6 10z" fill="#f6ecd8" ${st} stroke-width="1.6"/>` + ray(6, 14, 17)),
    corpse_sight: () => disc('#3fb8a9', `<path d="M8 26q16-16 32 0-16 16-32 0z" fill="#f6ecd8" ${st} stroke-width="1.8"/><circle cx="24" cy="26" r="6" fill="#ffd84a" ${st} stroke-width="1.6"/><circle cx="24" cy="26" r="2.4" fill="${K}"/>`),
    corpse_spine: () => disc('#6b5bd6', `<g fill="#f6ecd8" ${st} stroke-width="1.4">${[0, 1, 2, 3, 4].map(i => `<rect x="${19 + (i % 2)}" y="${13 + i * 5.4}" width="9" height="4.2" rx="1.6"/>`).join('')}</g><path d="M34 16l4 -4M34 24h5" stroke="#ffd84a" stroke-width="2.2" stroke-linecap="round"/>`),
    corpse_ears: () => disc('#3a6ac8', `<path d="M17 14q8-3 8 8t-6 14q-5 0-3-5 5-3 3-8t-2-9z" fill="#f6ecd8" ${st} stroke-width="1.6"/><path d="M30 18q4 6 0 12M34 14q7 10 0 20" stroke="#ffd84a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`),
    corpse_touch: () => disc('#3a9a5a', `<g transform="translate(48 0) scale(-1 1)"><path d="M16 38l3-12q-2-6 1-10l3-5 2.4 1.6-1.6 5 4.8-5 2.4 1.6-4 5.6 5.6-3.2 1.6 2.4-5.6 4.8 4.8-.8.8 2.4-8 4-1.6 10z" fill="#f6ecd8" ${st} stroke-width="1.6"/></g><path d="M34 14v8M30 18h8" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`),
    corpse_stride: () => disc('#e8742a', `<path d="M17 12h5v14l-1.4 9h4.2v3H14l2-12zM24 12h5l.8 14 2 12H23l1.4-3-.8-9z" fill="#f6ecd8" ${st} stroke-width="1.4"/><path d="M34 22h6M33 28h7M34 34h5" stroke="#fff3a0" stroke-width="2" stroke-linecap="round"/>`),
    corpse_heart: () => disc('#c8323c', ray(10, 13, 18) + `<path d="M24 36s-10-6.6-10-13a5 5 0 0 1 10-1.6 5 5 0 0 1 10 1.6c0 6.4-10 13-10 13z" fill="#f6ecd8" ${st} stroke-width="1.6"/><path d="M24 22v8M20.5 25h7" stroke="#c8323c" stroke-width="2"/>`),
    corpse_union: () => disc('#ffd84a', ray(12, 12, 18, '#fff') + `<path d="M14 36 L20 18 Q24 10 28 18 L34 36" fill="none" stroke="${K}" stroke-width="5.4" stroke-linecap="round"/><path d="M14 36 L20 18 Q24 10 28 18 L34 36" fill="none" stroke="#f6ecd8" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="26" r="4.4" fill="#fff" ${st} stroke-width="1.4"/>`),
  };
  Object.entries(draw).forEach(([id, fn]) => I.define('ability', id, fn));
})();

/* ================= 3. The Saint's blessing: party bonuses by part count ================= */
(() => {
  const base = SBR.bonus;
  const add = (b, k, v) => {
    if (typeof v === 'number') b[k] = (b[k] || 0) + v;
    else if (Array.isArray(v)) b[k] = (b[k] || []).concat(v);
    else if (v && typeof v === 'object') { const o = b[k] = Object.assign({}, b[k]); for (const t in v) o[t] = (o[t] || 0) + v[t]; }
  };
  SBR.bonus = () => {
    const b = base();
    const r = SBR.run;
    if (!r || !r.mats || !SBR.corpse) return b;
    // the joined relic: each fused part's blessing at 150%
    const F = SBR.corpse.fused();
    if (F) F.forEach(id => { const R = SBR.RELICS[id]; if (R && R.bonus) Object.entries(R.bonus).forEach(([k, v]) => add(b, k, typeof v === 'number' ? (k === 'fossilImmune' ? v : v * 1.5) : v)); });
    const t = SBR.corpse.tier();
    if (t >= 1) { add(b, 'regen', 1); add(b, 'heal', 0.1); add(b, 'res', { stand: -0.1 }); }
    if (t >= 2) { add(b, 'dmg', 0.1); add(b, 'crit', 0.05); add(b, 'shieldStart', 6); }
    if (t >= 3) { add(b, 'energyStart', 1); add(b, 'immune', ['fear']); add(b, 'stitch', 1); }
    const f = r.flags || {};
    if (f.corpseBuried) { add(b, 'regen', 1); add(b, 'res', { bleed: -0.1 }); }
    if (f.saintBlessed) { add(b, 'heal', 0.1); add(b, 'res', { stand: -0.1, holy: -0.2 }); }
    if (f.corpseToVatican) add(b, 'check', 1);
    return b;
  };

  /* battles: the blessing shows, and the President's men expect you */
  const baseFlags = SBR.campaignFightFlags;
  const PRES = ['agent', 'soldier', 'vguard', 'pres_sniper', 'par_soldier', 'par_agent', 'cv_hound'];
  SBR.campaignFightFlags = (c, note, any, P) => {
    if (baseFlags) baseFlags(c, note, any, P);
    const t = SBR.corpse.tier();
    if (t >= 1) { P.forEach(u => c.addStatus(u, 'sanctified', 0, t + 1, true)); note(`${SBR.corpse.TIERS[t].name}: the party starts Sanctified.`); }
    if (t >= 2 && any(PRES)) { c.enemies().filter(e => PRES.includes(e.id)).forEach(e => c.addStatus(e, 'empower', 0, 2, true)); note('The President\'s men know exactly what you carry. They came ready.'); }
  };
})();

/* ================= 4. Corpse encounters ================= */
(() => {
  const E = [];
  const ev = (o, C) => {
    E.push(Object.assign({ type: 'event', icon: 'corpse', weight: 2.5, once: true, pace: -2 }, o));
    C.forEach((c, i) => { if (!c) return; const { fail, ...ok } = c; SBR.CONSEQ[o.id + ':' + i] = ok; if (fail) SBR.CONSEQ[o.id + ':' + i + ':fail'] = fail; });
  };
  const K = SBR.corpse;
  const has = n => K.held().length >= n;
  /** choose a part, remove it, then run fn(id) */
  const sacrifice = (g, title, fn) => g.defer(async () => { const id = await K.pickPart(title); if (!id) return; K.removePart(id); await fn(id); K.checkTier(); SBR.saveRun && SBR.saveRun(); });

  SBR.art.addPortrait({
    cv_cardinal: { skin: '#f0d0b8', hair: '#e8e8e8', hairStyle: 'short', hat: 'dome', hatColor: '#c8323c', hat2: '#f2c14e', outfit: '#c8323c', outfit2: '#f6ecd8', eye: '#3a6a9a', lip: '#a06050', bg: ['#f6ecd8', '#c8323c'], deco: ['necklace:cross'] },
    cv_elder:    { skin: '#a86a44', hair: '#e8e8e8', hairStyle: 'verylong', hat: 'headband', hatColor: '#c8323c', hat2: '#3fb8a9', outfit: '#c8844a', outfit2: '#3fb8a9', eye: '#3a2a1a', lip: '#6a3a2a', bg: ['#e8742a', '#f6c27a'], extra: 'feather', deco: ['necklace:beads'] },
    cv_envoy:    { skin: '#f0d0b8', hair: '#3a2a1a', hairStyle: 'short', hat: 'tophat', hatColor: '#1f2a6a', hat2: '#f6ecd8', outfit: '#1f2a6a', outfit2: '#f6ecd8', eye: '#3a3a6a', lip: '#a06060', bg: ['#1f2a6a', '#f6ecd8'], extra: 'mustache', deco: ['collar', 'medal'] },
  });

  /* ---- Offer a part to the Vatican ---- */
  ev({ id: 'corpse_cardinal', acts: [2, 3, 4, 5, 6], title: 'The Cardinal\'s Reliquary', blurb: 'A red-robed cardinal on the road, with an empty silver box.', art: 'cv_cardinal', weight: 3,
    cond: () => has(1),
    text: 'A cardinal from Rome has come a long way in a very dusty carriage. On his knees is a silver reliquary lined with velvet, and it is empty. "The Holy See does not ask you to give up the race," he says. "Only one piece of Him. Give it to the Church, and the Church will bless you in return. The President cannot follow what Rome keeps."',
    choices: [
      { label: 'Place a Corpse Part in the reliquary', ok: { text: 'The cardinal closes the lid and prays over it, and over each of you. Something old and warm settles in your bones.', fx: g => sacrifice(g, 'Which part do you give to the Church?', () => {
        g.flag('corpseToVatican'); SBR.run.party.concat(SBR.run.reserve || []).forEach(m => { m.maxHp += 10; m.hp = m.maxHp; }); g.unexhaust(3); g.gear('nun_veil'); g.threat(-1.5);
        SBR.toast('<b>The Church\'s blessing:</b> every rider +10 max HP, fully healed, and +1 to every skill check.', 'corpse'); }) } },
      { label: 'Ask only for his blessing (RESOLVE)', check: { stat: 'res', dc: 13 }, ok: { text: 'He hesitates, then blesses you anyway. "Perhaps He chose you to carry Him." (For the rest of the race: +10% healing, less Stand and Holy damage taken.)', fx: g => { g.flag('saintBlessed'); g.healAll(0.5); } },
        fail: { text: '"A blessing is not a toll you can skip." He rides on. You feel watched. (+15 XP.)', fx: g => g.xp(15) } },
      { label: 'Rob the cardinal (LUCK)', check: { stat: 'luck', dc: 14 }, ok: { text: 'His purse, his rings and his cassock, while he sleeps. You are going to hell, but you are going there rich. (+$120, Priest\'s Cassock.)', fx: g => { g.money(120); g.gear('cassock'); } },
        fail: { text: 'His guards are Swiss, and they are awake.', fight: { enemies: ['cv_guard', 'cv_guard'], after: g => g.money(40) } } },
    ] }, [
    { deed: 'Gave a Corpse Part to a cardinal of the Vatican.', rep: { vatican: 3, president: -1 } },
    { deed: 'Was blessed by a Vatican cardinal for carrying the Saint.', rep: { vatican: 1 }, fail: { deed: 'Was refused a blessing by a cardinal.' } },
    { deed: 'Robbed a cardinal of the Vatican.', rep: { vatican: -3, law: -1 }, fail: { deed: 'Tried to rob a cardinal, and met his Swiss Guard.', rep: { vatican: -2 } } },
  ]);

  /* ---- Sell a part to the President for a pardon ---- */
  ev({ id: 'corpse_pardon', acts: [3, 4, 5, 6], title: 'A Pardon, Signed in Advance', blurb: 'A man in a top hat under a white flag, holding a presidential pardon.', icon: 'flag', art: 'cv_envoy', weight: 2.5,
    cond: () => has(1) && (SBR.run.threat || 0) >= 1,
    text: 'The President\'s envoy rides in under a white flag. In his hand is a pardon with the President\'s signature already on it and your name left blank. "Every crime on this trail, forgiven. Every agent recalled. And a purse, for your trouble. All the President asks is one piece of what you carry. He will find the rest himself."',
    choices: [
      { label: 'Sell him one part', ok: { text: 'He wraps it in a flag and rides off. By the next town the wanted posters with your face on them have been torn down.', fx: g => sacrifice(g, 'Which part do you sell to the President?', () => { g.flag('soldCorpse'); g.threat(-3); g.money(160); }) } },
      { label: 'Tear up the pardon', ok: { text: '"A pity." He lowers the white flag. The riders behind him were not there to escort him.', fight: { enemies: ['agent', 'agent', 'pres_sniper'], after: g => { g.money(60); g.gear('scope'); } } } },
      { label: 'Sell him a fake: a mummified goat bone (LUCK)', check: { stat: 'luck', dc: 15 }, ok: { text: 'He checks it with a magnifying glass, nods, and pays. The President will be very angry in about a week. (+$160, −1 Threat.)', fx: g => { g.money(160); g.threat(-1); } },
        fail: { text: 'He sniffs it. "Goat." He signals his riders.', fight: { enemies: ['agent', 'soldier', 'pres_sniper'], after: g => g.money(40) } } },
    ] }, [
    { deed: 'Sold a Corpse Part to the President for a pardon.', rep: { president: 2, law: 2, vatican: -2 } },
    { deed: 'Tore up a presidential pardon.', rep: { president: -2 } },
    { deed: 'Sold the President a goat bone as a Corpse Part.', rep: { president: -2, racers: 1 }, fail: { deed: 'Was caught selling the President a fake relic.', rep: { president: -1 } } },
  ]);

  /* ---- Bury a part to heal the land ---- */
  ev({ id: 'corpse_burial', acts: [1, 2, 3, 4, 5, 6], title: 'The Ground That Is Sick', blurb: 'Dead grass, dead cattle, and an elder waiting for you.', art: 'cv_elder', weight: 2.5,
    cond: () => has(1),
    text: 'For a mile around the spring, the grass is grey and the cattle lie where they fell. An old woman of Sandman\'s people is waiting by the water, as if she knew you would come. "The Saint walked here once. The land remembers him and is sick without him. Give one piece back to the ground. It will not come back to you. But the ground will."',
    choices: [
      { label: 'Bury a Corpse Part at the spring', ok: { text: 'By morning there is green at the water\'s edge. By noon, the cattle are standing. The elder presses her palm to your chest. "The land will carry you now."', fx: g => sacrifice(g, 'Which part do you give back to the land?', () => {
        g.flag('corpseBuried'); g.healAll(1); g.unexhaust(3); g.statUpAll('res', 2); g.statUpAll('grit', 1);
        SBR.toast('<b>The land\'s gift:</b> party +2 RESOLVE, +1 GRIT, and +1 regeneration in every battle for the rest of the race.', 'corpse'); }) } },
      { label: 'Pray with her at the spring (RESOLVE)', check: { stat: 'res', dc: 12 }, ok: { text: 'You pray all night. The grass does not grow, but the water tastes sweet again, and you sleep like the dead. (Party heals 60%, +20 XP.)', fx: g => { g.healAll(0.6); g.xp(20); } },
        fail: { text: 'You fall asleep in the middle of it. She lets you. (Party heals 30%.)', fx: g => g.healAll(0.3) } },
      { label: 'Refuse. The Saint is not for burying.', ok: { text: '"No," she agrees. "He is for carrying. We will see where you carry him." She gives you sage for the road. (+2 Frontier Herbs, +10 XP.)', fx: g => { g.mat('herb', 2); g.xp(10); } } },
    ] }, [
    { deed: 'Buried a Corpse Part to heal a sick land.', rep: { natives: 3, vatican: -1 }, npc: { cv_elder: 'friend' } },
    { deed: 'Prayed all night at a sick spring.', rep: { natives: 1 }, fail: { deed: 'Fell asleep praying at a sick spring.' } },
    { deed: 'Refused to bury the Saint.', rep: { natives: -1 } },
  ]);

  /* ---- Two parts that want to be one ---- */
  ev({ id: 'corpse_fusion', acts: [2, 3, 4, 5, 6], title: 'The Parts Remember Each Other', blurb: 'At night, two of your relics are lying closer together than you left them.', art: null, weight: 2.5, pace: -1,
    cond: () => has(2) && !K.fused(),
    text: 'You wake in the night. Two of the Corpse Parts have crawled out of their wrappings and are lying together in the dirt, and between them the cloth has grown into something like skin. They want to be one body again. You could let them. It is not clear you could undo it.',
    choices: [
      { label: 'Let two parts grow together (RESOLVE)', check: { stat: 'res', dc: 14 }, ok: { text: 'You hold them together until dawn. When you let go, they are one relic, and it is warm like a living thing.', fx: g => g.defer(async () => {
        const a = await K.pickPart('Choose the first part to join.'); if (!a) return;
        const b = await K.pickPart(`Join the ${K.short(a)} with which part?`, [a]); if (!b) return;
        delete SBR.run.mats[a]; delete SBR.run.mats[b];
        SBR.run.corpseFused = [a, b]; SBR.run.mats.c_fused = 1;
        SBR.toast(`<span class="toast-ico">${SBR.matIcon('c_fused')}</span><div><b>Corpse: Joined Relic</b><br><small>${K.short(a)} and ${K.short(b)}: both blessings at 150%, both lead abilities kept, and the lead learns Saint's Union.</small></div>`, 'corpse');
        SBR.audio.play('success'); K.checkTier(); SBR.saveRun && SBR.saveRun(); }) },
        fail: { text: 'They pull apart with a sound like tearing leather. Something that is not quite pain goes through all of you, and far away, somebody in Washington looks up from his desk. (Party −20% HP, +1 Threat.)', fx: g => { g.hurtAll(0.2); g.threat(1); } } },
      { label: 'Wrap them in separate cloths, far apart', ok: { text: 'They stop moving. You sleep badly, but you sleep. (+10 XP, the trail cools a little.)', fx: g => { g.xp(10); g.threat(-0.5); } } },
      { label: 'Lie down between them and listen', ok: { text: 'You dream of a man walking across a desert with his arms open. When you wake, you know things you have no way of knowing. (+25 XP; the Saint\'s vision will help the lead in the fights that matter.)', fx: g => { g.flag('corpseVision'); g.xp(25); } } },
    ] }, [
    { deed: 'Let two Corpse Parts grow back together.', rep: { vatican: -1 }, fail: { deed: 'Tried to join two Corpse Parts, and felt them tear.', rep: { president: 0 } } },
    { deed: 'Kept the Corpse Parts apart.', rep: {} },
    { deed: 'Listened to the Corpse Parts in the night.', rep: { vatican: 1 } },
  ]);

  /* ---- A part that calls to another: a detour ---- */
  ev({ id: 'corpse_calling', acts: [1, 2, 3, 4, 5, 6], title: 'A Part Calls Out', blurb: 'One of your relics is pulling, hard, toward the hills.', art: null, weight: 2, pace: 0,
    cond: () => has(1) && K.missing().length > 0,
    text: 'The relic in your saddlebag has been warm all day. Now it is hot, and when you hold it, it pulls, like a compass needle, toward a line of red hills off the trail. Another piece of the Saint is out there. You can see dust over the hills: somebody with shovels got there first.',
    choices: [
      { label: 'Follow the pull, whatever is there (−15 Pace)', ok: { text: 'At the dig site, government men in shirtsleeves drop their shovels and pick up rifles.', fight: { enemies: ['soldier', 'agent', 'pres_sniper'], after: g => { g.pace(-15); const m = K.missing(); if (m.length) K.givePart(SBR.util.pick(m)); K.checkTier(); } } } },
      { label: 'Circle around and dig at night (SPIN)', check: { stat: 'spin', dc: 15 }, ok: { text: 'You let the relic lead your hands in the dark, two hundred yards from their dig. It is there, a foot down, wrapped in cloth older than the country. (−20 Pace.)', fx: g => { g.pace(-20); const m = K.missing(); if (m.length) K.givePart(SBR.util.pick(m)); g.defer(async () => K.checkTier()); } },
        fail: { text: 'A sentry\'s lantern swings your way.', fight: { enemies: ['soldier', 'soldier', 'agent'], after: g => { g.pace(-20); const m = K.missing(); if (m.length) K.givePart(SBR.util.pick(m)); K.checkTier(); } } } },
      { label: 'Let it call. The race comes first.', ok: { text: 'The heat fades by evening. Somewhere behind you, a government man holds up something wrapped in cloth. (+6 Pace.)', fx: g => { g.pace(6); g.threat(0.5); } } },
    ] }, [
    { deed: 'Followed a Corpse Part to another, and fought for it.', rep: { president: -2 } },
    { deed: 'Stole a Corpse Part from under a government dig.', rep: { president: -1 }, fail: { deed: 'Fought a government dig crew for a Corpse Part.', rep: { president: -2 } } },
    { deed: 'Left a Corpse Part for the President\'s diggers.', rep: { president: 1 } },
  ]);

  /* ---- The Relic Hound ---- */
  ev({ id: 'corpse_hound', acts: [2, 3, 4, 5, 6], type: 'elite', title: 'The Relic Hound', blurb: 'A bounty hunter with a forked rod that twitches toward you.', icon: 'skull', art: 'cv_hound', weight: 2.5, pace: -3,
    cond: () => K.count() >= 2,
    text: 'Ezra Vane hunts holy things for whoever pays, and right now the President pays best. His Stand is a forked hazel rod that bends toward anything blessed, and it is bent almost double pointing at you. His dog has already found your trail. "I smell two of them on you," he says. "Maybe more. Hand them over and I\'ll tell Washington you\'re dead."',
    choices: [
      { label: 'Fight him', ok: { text: 'The rod snaps straight up and becomes a spear.', fight: { enemies: ['cv_hound', 'cv_dog'], elite: true, after: g => { g.gear('scope'); g.money(60); g.threat(-1); g.mat('silver', 2); } } } },
      { label: 'Throw him off the scent (LUCK)', check: { stat: 'luck', dc: 14 }, ok: { text: 'You leave a trail of holy water and church candles all the way to a monastery in the wrong direction. His rod spins like a weathervane. (−1.5 Threat, +6 Pace. He will not stay fooled forever.)', fx: g => { g.threat(-1.5); g.pace(6); } },
        fail: { text: 'The dog is smarter than you are.', fight: { enemies: ['cv_hound', 'cv_dog'], elite: true, after: g => g.money(30) } } },
      { label: 'Pay him to tell you what the President knows ($60)', cost: { money: 60 }, ok: { text: 'He takes the money and talks: where the agents ride, how they signal, what they are told to do when they find you. (The next time you fight the President\'s agents, they are caught off guard.)', fx: g => { g.flag('agentOrders'); g.threat(-0.5); } } },
    ] }, [
    { deed: 'Fought the Relic Hound, a Stand user who hunts holy things.', rep: { president: -1 } },
    { deed: 'Sent the Relic Hound to the wrong monastery.', rep: { vatican: 1 }, later: ['corpse_hound_back', 4, 8], fail: { deed: 'Was run down by the Relic Hound\'s dog.' } },
    { deed: 'Bought the President\'s secrets from the Relic Hound.', npc: { cv_hound: 'friend' } },
  ]);

  SBR.EVENTS.push(...E);
  SBR.CORPSE_EVENTS = E.map(e => e.id);

  /* the Hound comes back, angry */
  SBR.CAMPAIGN_EVENTS.push({ id: 'corpse_hound_back', type: 'elite', title: 'The Hound Found the Monastery', blurb: 'Ezra Vane is back, and so is his dog.', icon: 'skull', art: 'cv_hound', pace: -2, reveals: 'The Relic Hound found the monastery empty, and came back for you.',
    cond: () => K.count() >= 1,
    text: '"Forty monks," Ezra Vane says. "I searched forty monks. Do you know what that does to a man\'s reputation?" The rod is pointing at you again. This time he brought friends.',
    choices: [
      { label: 'Finish it', ok: { text: 'He draws.', fight: { enemies: ['cv_hound', 'cv_dog', 'agent'], elite: true, after: g => { g.gear('journal'); g.money(70); g.threat(-1); } } } },
      { label: 'Give him a part to end it', req: () => K.held().length >= 1, reqText: 'No separate part to give', ok: { text: 'He weighs it in his hand and tips his hat. "Pleasure doing business." He does not come back.', fx: g => sacrifice(g, 'Which part do you give the Hound?', () => { g.money(50); }) } },
    ] });
  SBR.CONSEQ['corpse_hound_back:0'] = { deed: 'Finished things with the Relic Hound.', rep: { president: -1 } };
  SBR.CONSEQ['corpse_hound_back:1'] = { deed: 'Bought off the Relic Hound with a Corpse Part.', rep: { president: 1, vatican: -1 } };

  /* enemies for these encounters */
  const port = key => ({ kind: 'portrait', key });
  SBR.art.addPortrait({ cv_guard: { skin: '#f0d0b0', hair: '#6a4a2a', hairStyle: 'short', hat: 'helm', hatColor: '#c8c8d8', hat2: '#c8323c', outfit: '#f2c14e', outfit2: '#2a4a8a', eye: '#3a6a9a', lip: '#a06050', bg: ['#f6ecd8', '#c8323c'] } });
  Object.assign(SBR.ENEMIES, {
    cv_guard: { name: 'Swiss Guard', title: 'Of the Holy See', art: port('cv_guard'), hp: 34, stats: { grit: 6, aim: 4 }, xp: 11, money: [12, 22], dtype: 'phys', res: { holy: -0.5, phys: -0.1 },
      passive: 'Halberd and breastplate. Blessed: resists Holy damage.',
      abilities: [{ name: 'Halberd', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 6, { grit: 0.03 }) },
        { name: 'Shield Wall', w: 1, cd: 3, target: 'allAllies', fx: 'buff', run: x => x.allies.forEach(a => x.status(a, 'guard', 0, 2)) }] },
    cv_hound: { name: 'Ezra Vane', title: 'The Relic Hound', art: port('cv_hound'), tier: 'elite', hp: 66, stats: { aim: 8, luck: 6, ride: 6 }, xp: 32, money: [50, 70], dtype: 'stand', res: { holy: -0.3, bullet: -0.1 },
      stand: 'Divining Rod', sigil: 'hook', sigilColor: '#c8a040', quote: 'The rod never lies. It just points at whoever is carrying God.',
      passive: 'His Stand bends toward holy things: he hits harder the more Corpse Parts you carry, and his shots find the rider holding them.',
      abilities: [
        { name: 'Dowsing Shot', w: 3, target: 'enemy', fx: 'gun', run: x => x.dmg(x.target, 5 + SBR.corpse.count(), { aim: 0.04 }, { noDodge: SBR.corpse.count() >= 3 }) },
        { name: 'The Rod Points', w: 1, cd: 3, target: 'allEnemies', fx: 'scan', run: x => x.enemies.forEach(e => x.status(e, 'marked', 0, 2)) },
        { name: 'Rod Spear', w: 2, cd: 2, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 9, { aim: 0.03 }, { dtype: 'stand' }); if (r.hit) x.status(x.target, 'bleed', 2); } },
      ] },
    cv_dog: { name: 'Vane\'s Bloodhound', art: { kind: 'creature', type: 'wolf', color: '#8a5a30', bg: ['#3a2a1a', '#c8a040'] }, hp: 26, stats: { ride: 8 }, xp: 7, money: [0, 4], dtype: 'bleed',
      abilities: [{ name: 'Maul', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 5, { ride: 0.03 }); if (r.hit) x.status(x.target, 'bleed', 1); } },
        { name: 'Howl', w: 1, cd: 3, target: 'allAllies', fx: 'buff', run: x => x.allies.forEach(a => x.status(a, 'empower', 0, 1)) }] },
  });
  Object.assign(SBR.DROPS, {
    cv_guard: [['cloth', 0.6, 1, 2], ['silver', 0.4, 1, 1], ['scrap', 0.4, 1, 1]],
    cv_hound: [['silver', 0.8, 1, 2], ['gold', 0.4, 1, 1], ['powder', 0.6, 1, 2]],
    cv_dog: [['hide', 0.7, 1, 1], ['bone', 0.5, 1, 1]],
  });
})();

/* ================= 5. Wrappers for files that load later ================= */
window.addEventListener('DOMContentLoaded', () => {
  const K = SBR.corpse;
  /* abilities: if main.js's memberAbilities does not already ask SBR.extraAbilities, ask it here */
  if (SBR.game && SBR.game.memberAbilities && !/extraAbilities/.test(String(SBR.game.memberAbilities))) {
    const baseMA = SBR.game.memberAbilities;
    SBR.game.memberAbilities = m => { const out = baseMA(m); (SBR.extraAbilities ? SBR.extraAbilities(m) : []).forEach(id => { if (!out.includes(id)) out.push(id); }); return out; };
  }
  /* new parts can change the blessing tier */
  const G = SBR.game && SBR.game.G;
  if (G && G.relic && !G.relic._corpse) {
    const baseRelic = G.relic, baseLose = G.loseCorpse;
    G.relic = (...a) => { const r = baseRelic(...a); K.checkTier(); return r; };
    G.relic._corpse = true;
    if (baseLose) G.loseCorpse = (...a) => { const r = SBR.run; const keep = a[0] || []; if (r && r.mats && r.mats.c_fused > 0 && !keep.includes('c_fused')) { delete r.mats.c_fused; r.corpseFused = null; } const out = baseLose(...a); K.checkTier(); return out; };
  }
  /* the Hunt: every stage you carry 3+ parts, the President closes in */
  if (SBR.campaign && !SBR.campaign._corpseTick) {
    const baseTick = SBR.campaign.tick;
    SBR.campaign.tick = (...a) => {
      const out = baseTick(...a);
      const n = K.count(), add = n >= 7 ? 0.5 : n >= 5 ? 0.3 : n >= 3 ? 0.15 : 0;
      if (add && SBR.game && SBR.game.G) SBR.game.G.threat(add);
      K.checkTier();
      return out;
    };
    SBR.campaign._corpseTick = true;
  }
  /* the stage sprint: one Corpse power for the lead once you carry 3+ parts */
  if (SBR.racePowers && !SBR.racePowers._corpse) {
    const baseRP = SBR.racePowers;
    SBR.racePowers = r => {
      const out = baseRP(r) || [];
      const t = K.tier();
      if (!t || !r || !SBR.CHARS[r.lead]) return out;
      const pw = {
        id: 'saint', who: r.lead, name: t >= 3 ? 'The Saint Walks' : 'Saint\'s Stride', glyph: '聖', color: '#ffd84a',
        desc: ['', 'The Corpse carries your horse: +40 stamina and a 3s burst of speed.', 'The Corpse carries your horse: +60 stamina, a 4s burst of speed, and 3s untouchable.', 'Full stamina, a 5s burst of speed, 4s untouchable, and every rival near you stalls.'][t],
        use: A => {
          A.stamina([0, 40, 60, 100][t]);
          A.S.boostT = Math.max(A.S.boostT || 0, 2 + t);
          if (t >= 2) A.S.shield = Math.max(A.S.shield || 0, t + 1);
          if (t >= 3) A.rivals().filter(x => Math.abs(x.pos - A.me.pos) < 120).forEach(x => { x.stun = 1.6; });
          A.flash('#ffd84a');
        },
      };
      const list = out.filter(p => p.id !== 'saint');
      if (list.length >= 4) list.length = 3;
      list.push(pw);
      return list;
    };
    SBR.racePowers._corpse = true;
  }
});
