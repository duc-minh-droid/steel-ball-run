/* Battlefield objects: powder barrels, dynamite, boulders, oil lamps, water troughs, train cars.
   - Units with side: 'field'. They never act (not in the turn order), are not foes or allies (combat.js alive/foes/
     enemies/checkEnd only look at 'party'/'enemy'), and can be picked by single-target attacks and items.
   - Each sits near one side. Breaking it sets off its effect on that side (explosives chain into other objects there).
     A rider who breaks an explosive sitting near the party kicks it across: it goes off among the enemies at half strength.
   - Spawns: an area or route hazard always brings 1-2 objects that fit it; other fights roll for them by act. Boss fights
     get at most one, always near the boss's side.
   - Enemies (people, not beasts or bosses) sometimes shoot or kick an explosive near the party when it is worth it.
   - The fight's hazard (SBR.HAZARDS) gets a visible banner and a chip in the top bar.
   - Balance knobs: SBR.fieldobjects.CFG; SBR.fieldobjects.enabled = false turns spawning off. */
'use strict';
SBR.fieldobjects = (() => {
  const CFG = {
    chance: { fight: 0.6, elite: 0.5, boss: 0.45 }, // chance a fight without a hazard gets objects
    max: { fight: 2, elite: 2, boss: 1 },
    nearEnemy: 0.65,  // chance an object sits on the enemy side (boss fights: always)
    hpAct: 0.2,       // object HP +20% per act
    blastAct: 0.25,   // blast damage +25% per act
    bossCap: 0.08,    // an object can take at most this share of an act boss's max HP
    kick: 0.5,        // strength of an explosive the party kicks across the field
    aiChance: 0.45,   // chance a willing enemy uses a worthwhile object instead of attacking
    aiRatio: 1.4,     // how much better than its own attack the object must look (total damage vs one hit)
    cover: 0.25,      // train car cover: less Gunshot damage taken on its side
  };
  const api = { CFG, enabled: true };
  const U = SBR.util;
  const INK = '#1a1020';
  const act = () => (SBR.run && SBR.run.act) || 1;
  const ST = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  let n = 0;

  /* ---------- statuses ---------- */
  SBR.STATUS.soaked = { name: 'Soaked', glyph: '濡', color: '#4a9ad8', kind: 'buff', mode: 'turns', res: { cold: 0.25 }, desc: () => 'Dripping wet: cannot be set on fire (Burn washed off), but takes 25% more Cold damage.' };
  SBR.STATUS.cover = { name: 'Train Cover', glyph: '盾', color: '#8a3a2a', kind: 'buff', mode: 'turns', res: { bullet: -CFG.cover }, desc: () => `Behind a train car: takes ${Math.round(CFG.cover * 100)}% less Gunshot damage while it stands.` };
  if (SBR.icons && SBR.icons.define) {
    const s = `stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"`;
    SBR.icons.define('status', 'soaked', () => `<path d="M24 6 Q36 22 36 30 A12 12 0 0 1 12 30 Q12 22 24 6Z" fill="#4a9ad8" ${s}/><path d="M18 30 q2 6 8 6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
    SBR.icons.define('status', 'cover', () => `<rect x="6" y="12" width="36" height="22" fill="#8a3a2a" ${s}/><circle cx="14" cy="38" r="4" fill="#4a4a52" ${s}/><circle cx="34" cy="38" r="4" fill="#4a4a52" ${s}/><path d="M12 18 h24" stroke="#f6ecd8" stroke-width="2"/>`);
  }

  /* ---------- art: flat colours, heavy ink, halftone shade, a little kana ---------- */
  const ht = id => `<defs><pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.05" fill="${INK}" opacity=".32"/></pattern></defs>`;
  const kana = (t, x, y, s, c, r = 0) => `<text x="${x}" y="${y}" font-family="'Noto Sans JP','Yu Gothic',sans-serif" font-weight="900" font-size="${s}" fill="${c}" stroke="${INK}" stroke-width="1.6" paint-order="stroke" transform="rotate(${r} ${x} ${y})">${t}</text>`;
  const ground = `<ellipse cx="50" cy="90" rx="36" ry="6" fill="${INK}" opacity=".28"/>`;
  const ART = {
    barrel: h => `${ground}<path d="M26 22 Q20 52 26 84 L74 84 Q80 52 74 22Z" fill="#b8783a" ${ST}/>
      <path d="M50 22 Q56 52 50 84 L74 84 Q80 52 74 22Z" fill="url(#${h})"/>
      <path d="M38 22 Q34 52 38 84 M62 22 Q66 52 62 84" stroke="${INK}" stroke-width="1.6" fill="none" opacity=".55"/>
      <path d="M24 34 Q50 40 76 34 M23 72 Q50 78 77 72" stroke="#4a4a52" stroke-width="6" fill="none"/><path d="M24 34 Q50 40 76 34 M23 72 Q50 78 77 72" stroke="${INK}" stroke-width="1.6" fill="none"/>
      <ellipse cx="50" cy="22" rx="24" ry="6" fill="#d8a060" ${ST}/>
      <rect x="37" y="46" width="26" height="16" fill="#f6ecd8" ${ST} stroke-width="2"/><text x="50" y="58" text-anchor="middle" font-family="Oswald,sans-serif" font-weight="700" font-size="10" fill="#c8323c">XXX</text>
      <path d="M56 18 Q62 8 70 10" stroke="${INK}" stroke-width="2.4" fill="none"/><circle cx="71" cy="10" r="3.2" fill="#ffd84a" ${ST} stroke-width="1.6"/>
      ${kana('火薬', 4, 18, 13, '#e8742a', -10)}`,
    dynamite: h => `${ground}<path d="M16 42 L84 42 L84 86 L16 86Z" fill="#c89a5a" ${ST}/><path d="M50 42 L84 42 L84 86 L50 86Z" fill="url(#${h})"/>
      <path d="M16 56 H84 M16 72 H84" stroke="${INK}" stroke-width="1.6" opacity=".55"/><path d="M16 42 L84 86 M84 42 L16 86" stroke="#8a6a3a" stroke-width="3" opacity=".7"/>
      <rect x="30" y="58" width="40" height="14" fill="#f6ecd8" ${ST} stroke-width="2"/><text x="50" y="69" text-anchor="middle" font-family="Oswald,sans-serif" font-weight="700" font-size="10" fill="#c8323c">DANGER</text>
      ${[30, 40, 50, 60].map((x, i) => `<rect x="${x}" y="${18 + (i % 2) * 4}" width="9" height="26" rx="3" fill="#c8323c" ${ST} stroke-width="2.2"/>`).join('')}
      <path d="M30 32 H70" stroke="${INK}" stroke-width="3"/><path d="M44 18 Q46 8 56 6" stroke="${INK}" stroke-width="2.2" fill="none"/>
      <path d="M57 6 l4 -4 M57 6 l5 1 M57 6 l1 -5" stroke="#ffd84a" stroke-width="2.4" stroke-linecap="round"/>
      ${kana('ジジ', 66, 18, 12, '#ffd84a', 8)}`,
    boulder: h => `${ground}<path d="M20 84 Q10 60 24 40 Q34 20 56 22 Q80 24 86 50 Q92 74 78 86Z" fill="#8a8494" ${ST}/>
      <path d="M56 22 Q80 24 86 50 Q92 74 78 86 L56 86 Q66 60 56 22Z" fill="url(#${h})"/>
      <path d="M34 40 L44 52 L40 64 M60 36 L64 48 M70 62 L58 70" stroke="${INK}" stroke-width="2.2" fill="none"/>
      <path d="M28 46 Q34 34 46 30" stroke="#c8c0d0" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M8 86 L22 78 L30 86 M76 86 L88 80 L94 88" fill="#6a6474" ${ST} stroke-width="2"/>
      ${kana('ゴロ', 64, 18, 13, '#c8c0d0', 10)}`,
    lamp: h => `${ground}<path d="M38 20 Q50 8 62 20" stroke="${INK}" stroke-width="3" fill="none"/><rect x="34" y="20" width="32" height="8" fill="#c8a040" ${ST}/>
      <path d="M36 28 Q30 52 38 72 L62 72 Q70 52 64 28Z" fill="#f6e8b0" ${ST} opacity=".95"/>
      <path d="M50 64 Q40 54 48 44 Q48 52 54 50 Q52 40 58 36 Q64 50 56 62Z" fill="#e8742a" ${ST} stroke-width="2"/><path d="M50 62 Q46 56 50 50 Q54 56 52 62Z" fill="#ffd84a"/>
      <path d="M50 28 L50 72" stroke="${INK}" stroke-width="1.4" opacity=".35"/><path d="M58 30 Q66 52 58 70" fill="url(#${h})"/>
      <rect x="30" y="72" width="40" height="10" fill="#c8a040" ${ST}/><path d="M34 82 L66 82" stroke="${INK}" stroke-width="2"/>
      ${kana('ボッ', 6, 30, 12, '#ffd84a', -8)}`,
    trough: h => `${ground}<path d="M10 44 L90 44 L82 82 L18 82Z" fill="#9a6a3a" ${ST}/><path d="M50 44 L90 44 L82 82 L50 82Z" fill="url(#${h})"/>
      <path d="M14 44 Q50 38 86 44 L84 52 Q50 48 16 52Z" fill="#4a9ad8" ${ST} stroke-width="2.2"/>
      <path d="M26 46 q6 -3 12 0 M52 45 q6 -3 12 0" stroke="#dff2ff" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M14 60 H86 M16 70 H84" stroke="${INK}" stroke-width="1.6" opacity=".5"/>
      <path d="M22 82 L20 92 M78 82 L80 92" stroke="${INK}" stroke-width="4"/>
      ${kana('チャプ', 54, 30, 12, '#9fd0f0', 6)}`,
    traincar: h => `<ellipse cx="50" cy="92" rx="46" ry="5" fill="${INK}" opacity=".28"/><path d="M4 26 L96 26 L96 78 L4 78Z" fill="#a8402e" ${ST}/>
      <path d="M50 26 L96 26 L96 78 L50 78Z" fill="url(#${h})"/><path d="M2 22 L98 22 L96 28 L4 28Z" fill="#6a2a1e" ${ST} stroke-width="2.4"/>
      <rect x="36" y="32" width="28" height="40" fill="#8a3226" ${ST} stroke-width="2.4"/><path d="M36 32 L64 72 M64 32 L36 72" stroke="${INK}" stroke-width="1.6" opacity=".5"/>
      <text x="20" y="50" text-anchor="middle" font-family="Rye,serif" font-size="9" fill="#f2c14e">S.B.R.</text><text x="80" y="50" text-anchor="middle" font-family="Oswald,sans-serif" font-weight="700" font-size="8" fill="#f6ecd8">No.7</text>
      <path d="M4 78 H96" stroke="${INK}" stroke-width="4"/>${[18, 34, 66, 82].map(x => `<circle cx="${x}" cy="84" r="7" fill="#4a4a52" ${ST} stroke-width="2.4"/><circle cx="${x}" cy="84" r="2" fill="${INK}"/>`).join('')}
      ${kana('ガタン', 8, 16, 11, '#f2c14e', -6)}`,
  };
  api.svg = key => { const h = 'foht' + (n++); const f = ART[key] || ART.barrel; return `<svg class="fo-art fo-${key}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ht(h)}${f(h)}</svg>`; };

  /* ---------- the objects ---------- */
  const scaleB = b => Math.round(b * (1 + CFG.blastAct * (act() - 1)));
  const others = (c, side) => c.units.filter(u => u.side === 'field' && !u.dead && u.near === side);
  function blast(c, t, amt, dtype, label) {
    if (!t || t.dead) return;
    if (t.bt && !t.bt.elite) amt = Math.min(amt, Math.max(3, Math.round(t.maxHp * CFG.bossCap)));
    c.damage(null, t, Math.max(1, Math.round(amt)), null, { dtype, noDodge: true, noCrit: true, label, noShare: true });
  }
  const DEFS = {
    barrel: { name: 'Powder Barrel', short: 'Barrel', hp: 7, explosive: true, kana: 'ドグォン', color: '#e8742a', blast: 9,
      desc: m => `Black powder. Break it and it goes up: ${scaleB(9 * m)} damage and Burn to everything on its side (other objects there too).`,
      effect(c, o, side, m) { const d = scaleB(9 * m); c.alive(side).forEach(t => { blast(c, t, d, 'phys', 'BOOM'); if (!t.dead) c.addStatus(t, 'burn', 1); }); others(c, side).forEach(x => blast(c, x, d, 'phys', 'BOOM')); } },
    dynamite: { name: 'Dynamite Crate', short: 'Dynamite', hp: 10, explosive: true, kana: 'ドドグォン', color: '#c8323c', blast: 13,
      desc: m => `A miner's crate of dynamite. ${scaleB(13 * m)} damage to its side and shrapnel (${scaleB(4 * m)}) across the field.`,
      effect(c, o, side, m) { const d = scaleB(13 * m), far = side === 'party' ? 'enemy' : 'party'; c.alive(side).forEach(t => blast(c, t, d, 'phys', 'KA-BOOM')); others(c, side).forEach(x => blast(c, x, d, 'phys', 'BOOM')); c.alive(far).forEach(t => blast(c, t, scaleB(4 * m), 'phys', 'SHRAPNEL')); } },
    boulder: { name: 'Loose Boulder', short: 'Boulder', hp: 14, explosive: true, kana: 'ゴロゴロ', color: '#8a8494', blast: 18,
      desc: m => `Knock it loose and it rolls into the biggest one on its side: ${scaleB(18 * m)} damage and Spun; ${scaleB(4 * m)} to the rest.`,
      effect(c, o, side, m) { const L = c.alive(side); const big = L.slice().sort((a, b) => b.hp - a.hp)[0]; L.forEach(t => { if (t === big) { blast(c, t, scaleB(18 * m), 'phys', 'CRUSH'); if (!t.dead && t.tier !== 'boss') c.addStatus(t, 'stun', 0, 1); } else blast(c, t, scaleB(4 * m), 'phys', 'ROCKS'); }); } },
    lamp: { name: 'Oil Lamp', short: 'Lamp', hp: 4, explosive: true, kana: 'ボワッ', color: '#ffd84a', blast: 3,
      desc: m => `Smash it and burning oil splashes its side: ${scaleB(3 * m)} damage and Burn 3.`,
      effect(c, o, side, m) { c.alive(side).forEach(t => { blast(c, t, scaleB(3 * m), 'phys', 'FIRE'); if (!t.dead) c.addStatus(t, 'burn', Math.max(1, Math.round(3 * m))); }); } },
    trough: { name: 'Water Trough', short: 'Trough', hp: 10, kana: 'バシャッ', color: '#4a9ad8',
      desc: () => 'Break it and everyone on its side is drenched: Burn washed off, 5 HP back, and Soaked for 3 turns (no Burn, +25% Cold damage taken).',
      effect(c, o, side) { c.alive(side).forEach(t => { if (c.has(t, 'burn')) c.removeStatus(t, 'burn'); c.addStatus(t, 'soaked', 0, 3); c.heal(null, t, 5); }); } },
    traincar: { name: 'Freight Car', short: 'Train Car', hp: 28, explosive: true, cover: true, kana: 'ガッシャーン', color: '#a8402e', blast: 15,
      desc: m => `Cover: its side takes ${Math.round(CFG.cover * 100)}% less Gunshot damage while it stands. Derail it and it falls on its side: ${scaleB(15 * m)} damage, 40% chance to be Spun.`,
      effect(c, o, side, m) { c.alive(side).forEach(t => { if (c.has(t, 'cover')) c.removeStatus(t, 'cover'); blast(c, t, scaleB(15 * m), 'phys', 'DERAIL'); if (!t.dead && t.tier !== 'boss' && Math.random() < 0.4) c.addStatus(t, 'stun', 0, 1); }); } },
  };
  api.DEFS = DEFS;
  api.art = ART;
  const POOL = {
    hazard: { heat: ['barrel', 'lamp', 'trough'], cavein: ['boulder', 'dynamite', 'boulder'], blizzard: ['trough', 'dynamite', 'barrel'], cramped: ['traincar', 'lamp', 'barrel'], sunless: ['lamp', 'boulder'] },
    act: { 1: ['barrel', 'trough', 'lamp'], 2: ['boulder', 'dynamite', 'barrel'], 3: ['barrel', 'lamp', 'trough'], 4: ['trough', 'dynamite', 'boulder'], 5: ['traincar', 'lamp', 'barrel'], 6: ['barrel', 'dynamite', 'traincar'] },
  };
  api.POOL = POOL;

  function makeObject(c, key, near) {
    const D = DEFS[key];
    const hp = Math.max(1, Math.round(D.hp * (1 + CFG.hpAct * (act() - 1))));
    return {
      uid: U.uid('f'), id: 'fo_' + key, key, name: D.short, fullName: D.name, side: 'field', near, field: true,
      def: { name: D.name, short: D.short, field: true, native: true, res: {}, color: D.color }, art: { kind: 'field', key },
      stats: { spin: 0, aim: 0, grit: 0, ride: 0, res: 0, luck: 0 }, maxHp: hp, hp, cds: {}, statuses: [], dead: false, baseRes: {},
      tier: 'field', energy: 0, maxEnergy: 0, init: 0, abilities: [], upgrades: {},
    };
  }
  /** put objects onto a fresh Combat (not animated: it happens during setup) */
  function spawn(c) {
    const o = c.opts || {};
    if (!api.enabled || o.noField || o.sprint) return;
    const kind = o.boss ? 'boss' : o.elite ? 'elite' : 'fight';
    const hz = o.hazard && POOL.hazard[o.hazard];
    let pool = hz || POOL.act[Math.min(6, act())] || POOL.act[1];
    let count = 0;
    if (hz) count = kind === 'boss' ? 1 : U.randInt(1, 2);
    else if (Math.random() < CFG.chance[kind]) count = kind === 'boss' ? 1 : (Math.random() < 0.35 ? 2 : 1);
    count = Math.min(count, CFG.max[kind]);
    for (let i = 0; i < count; i++) {
      const key = U.pick(pool);
      const near = kind === 'boss' ? 'enemy' : i === 0 ? (Math.random() < CFG.nearEnemy ? 'enemy' : 'party') : (c.units.some(u => u.side === 'field' && u.near === 'enemy') ? 'party' : 'enemy');
      c.units.push(makeObject(c, key, near));
      pool = pool.filter(k => k !== key).length ? pool.filter(k => k !== key) : pool;
    }
    applyCover(c, true);
  }
  function applyCover(c, silent) {
    c.units.filter(u => u.side === 'field' && !u.dead && DEFS[u.key].cover).forEach(o => c.alive(o.near).forEach(t => c.addStatus(t, 'cover', 0, 2, silent)));
  }

  /* ---------- engine hooks ---------- */
  const Base = SBR.Combat;
  SBR.Combat = class extends Base {
    constructor(e, o) { super(e, o); try { spawn(this); } catch (err) { console.warn('field objects', err); } }
  };
  const P = SBR.Combat.prototype;
  api.objects = c => c.units.filter(u => u.side === 'field' && !u.dead && !u.removed);

  /** an object breaks: its effect lands on the side it sits near (or the enemy side, kicked) */
  function breakObject(c, o, src) {
    if (o.dead) return;
    o.dead = true; o.hp = 0;
    const D = DEFS[o.key];
    let side = o.near, m = 1, kicked = false;
    if (D.explosive && src && src.side === 'party' && o.near === 'party') { side = 'enemy'; m = CFG.kick; kicked = true; }
    c.push({ t: 'fieldBreak', uid: o.uid, key: o.key, side, kicked, by: src ? src.uid : null });
    c.log(`${D.name} ${kicked ? 'is kicked across the field and' : ''} ${D.explosive ? 'goes off' : 'breaks'}${side === 'party' ? ' among your riders' : ' among the enemies'}!`, side === 'party' ? 'dmg' : 'good');
    if (D.cover) c.alive(o.near).forEach(t => { if (c.has(t, 'cover') && !others(c, o.near).some(x => DEFS[x.key].cover)) c.removeStatus(t, 'cover'); });
    D.effect(c, o, side, m);
    c.checkEnd();
  }
  api.breakObject = breakObject;
  const onDeath = P.onDeath;
  P.onDeath = function (u, src) { if (u && u.side === 'field') return breakObject(this, u, src); return onDeath.call(this, u, src); };
  // objects can't dodge or block; nothing hides behind them
  const dodge = P.dodgeChance; P.dodgeChance = function (u) { return u && u.side === 'field' ? 0 : dodge.call(this, u); };
  const block = P.blockChance; P.blockChance = function (u) { return u && u.side === 'field' ? 0 : block.call(this, u); };
  // Soaked riders can't burn
  const addStatus = P.addStatus;
  P.addStatus = function (t, id, stacks, turns, silent) {
    if (id === 'burn' && t && this.has(t, 'soaked')) { this.push({ t: 'float', uid: t.uid, text: 'SOAKED', cls: 'block' }); return; }
    if (t && t.side === 'field' && id !== 'burn' && id !== 'vuln') return; // statuses mean nothing to a barrel
    return addStatus.call(this, t, id, stacks, turns, silent);
  };
  // cover is renewed every round while the car stands
  const startRound = P.startRound;
  P.startRound = function () { const r = startRound.call(this); if (!this.result) applyCover(this, true); return r; };

  /** enemy tactics: shoot or kick an explosive that sits among the party, when it beats a normal attack */
  function worth(c, u, o) {
    const D = DEFS[o.key];
    if (!D.explosive) return 0;
    const P = c.alive('party');
    if (P.length < 2) return 0;
    const per = o.key === 'boulder' ? scaleB(18) + scaleB(4) * (P.length - 1) : scaleB(D.blast) * P.length + (o.key === 'lamp' ? 9 * P.length : 0) + (o.key === 'dynamite' ? 0 : 0);
    const own = 5 + 2.5 * act();
    return per / own;
  }
  const enemyAct = P.enemyAct;
  P.enemyAct = function (u, free) {
    if (!free && api.enabled && u && u.side === 'enemy' && !u.dead && u.tier !== 'boss' && !(u.bt && u.bt.intent) && u.art && u.art.kind === 'portrait' && !this.has(u, 'disclock') && !this.has(u, 'raptor')) {
      const objs = api.objects(this).filter(o => o.near === 'party');
      const best = objs.map(o => ({ o, v: worth(this, u, o) })).sort((a, b) => b.v - a.v)[0];
      if (best && best.v >= CFG.aiRatio && Math.random() < CFG.aiChance) {
        const o = best.o, gun = (u.def.dtype === 'bullet') || (u.xAbilities || u.def.abilities || []).some(a => a.fx === 'gun');
        this.push({ t: 'act', uid: u.uid, name: gun ? `Shoot the ${DEFS[o.key].short}!` : `Kick the ${DEFS[o.key].short}!`, fx: gun ? 'gun' : 'hit', targets: [o.uid], enemy: true, cost: 0, fieldUse: true });
        if (this.preAction(u) && !u.dead) breakObject(this, o, u);
        this.endTurn(u);
        return;
      }
    }
    return enemyAct.call(this, u, free);
  };

  /* ---------- UI ---------- */
  const { el, sleep } = U;
  const calm = () => !!SBR.settings.reducedMotion;
  api.tip = (u, c) => {
    const D = DEFS[u.key];
    const who = u.near === 'party' ? 'your side' : 'the enemy side';
    return `<b>${D.name}</b> <small>· battlefield object</small><br>HP ${u.hp}/${u.maxHp} · sits on <b>${who}</b><br>${D.desc(1)}${D.explosive && u.near === 'party' ? '<br><i>Enemies may set it off among your riders. Break it yourself and you kick it across: it goes off among them at half strength.</i>' : ''}<br><small>Target it with any single-target attack or item. It never acts.</small>`;
  };
  async function onBreak(e, u, api2) {
    const cards = api2.cards(), card = cards[e.uid];
    const D = DEFS[e.key];
    const pt = api2.center(e.uid);
    if (card) card.classList.add('fo-broken');
    const to = e.side !== (u && u.near) && api2.root ? (() => { const s = api2.root.querySelector(e.side === 'enemy' ? '.enemy-side' : '.party-side'); const r = s && s.getBoundingClientRect(); return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : pt; })() : pt;
    if (e.kicked && !calm()) { SBR.ui.sfxText('KICK!', pt.x, pt.y - 40, 'k-hit'); await sleep(160); }
    const at = e.kicked ? to : pt;
    const F = SBR.fx;
    if (e.key === 'trough') { SBR.audio.play('miss'); F.bubbles(at.x, at.y, '#9fd0f0', 16); F.ring(at.x, at.y, '#4a9ad8', 140, 8, 0.5); F.shards(at.x, at.y, '#bfe6ff', 14, 260); }
    else if (e.key === 'lamp') { SBR.audio.play('boom'); F.flames(at.x, at.y, 22, 60, -180, 26); F.shards(at.x, at.y, '#f6e8b0', 10, 240); }
    else if (e.key === 'boulder') { SBR.audio.play('boom'); F.debris(at.x, at.y, '#8a8494', 18); F.dust({ x: at.x, y: at.y + 30 }, 18); SBR.ui.shake(undefined, true); }
    else if (e.key === 'traincar') { SBR.audio.play('boom'); F.boom(at.x, at.y); F.debris(at.x, at.y, '#a8402e', 22); F.dust({ x: at.x, y: at.y + 30 }, 22); SBR.ui.shake(undefined, true); }
    else { SBR.audio.play('boom'); F.boom(at.x, at.y); if (e.key === 'dynamite') { F.debris(at.x, at.y, '#c89a5a', 16); F.flash('#fff3a0', 160, 0.4); } SBR.ui.shake(undefined, true); }
    if (!calm()) F.kana(at.x, at.y - 70, D.kana, D.color, 72, 850);
    // the blast lights up every card on the side it hits
    if (api2.root) api2.root.querySelectorAll(`.${e.side === 'enemy' ? 'enemy' : 'party'}-side .unit-card:not(.dead):not(.gone)`).forEach(k => { k.classList.remove('fo-blasted'); void k.offsetWidth; k.classList.add('fo-blasted'); setTimeout(() => k.classList.remove('fo-blasted'), 700); });
    api2.addLog(`<b>${D.name}</b> ${D.explosive ? 'goes off' : 'breaks'}!`, 'dmg');
    setTimeout(() => { if (card) card.classList.add('gone'); }, 450);
    await sleep(380);
  }
  function onRender(root, api2) {
    const c = api2.c, key = c.opts && c.opts.hazard, hz = key && SBR.HAZARDS && SBR.HAZARDS[key];
    if (!hz) return;
    const top = root.querySelector('.battle-top');
    const chip = el('div', { class: 'hazard-chip hz-' + key, html: `<b>⚠</b><span>${hz.name}</span>` });
    SBR.tip.bind(chip, `<b>Hazard: ${hz.name}</b><br>${hz.desc}`);
    if (top) { const rb = top.querySelector('.round-box'); top.insertBefore(chip, rb || null); }
    const b = el('div', { class: 'hazard-banner hz-' + key, html: `<span class="hb-kick">HAZARD</span><span class="hb-name">${hz.name}</span><span class="hb-desc">${hz.desc}</span>` });
    root.appendChild(b);
    setTimeout(() => b.classList.add('out'), (calm() ? 2600 : 3400) / (SBR.settings.speed || 1));
    setTimeout(() => b.remove(), (calm() ? 3000 : 3900) / (SBR.settings.speed || 1));
  }
  function hook() {
    const H = SBR.battle && SBR.battle.hooks;
    if (!H) return false;
    H.events.fieldBreak = onBreak;
    H.render.push(onRender);
    return true;
  }
  if (!hook()) window.addEventListener('load', hook);
  return api;
})();
SBR.FIELD_OBJECTS = SBR.fieldobjects.DEFS;
