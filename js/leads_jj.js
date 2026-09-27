/* Two strangers pulled through time: Jotaro Kujo (Part 3) and Josuke Higashikata (Part 4) as playable lead riders.
   A Stand Arrow nicked each of them in their own century and dropped them at the San Diego registration tent in 1890.
   Johnny and Gyro still ride with them; the story plays as it does for Mountain Tim or Hot Pants.
     Jotaro   「Star Platinum」  Paths: Stardust Crusader (ORA rushes) · The World Within (stopped time) · Marine Biologist (scan, counter, trivia)
     Josuke   「Crazy Diamond」  Paths: Crazy Diamond (restoration) · Homing Restoration (shards that fly home) · Great Days (pompadour rage)
   Unlocks (quests, not Race Points): Jotaro — beat a boss from Act II on with nobody falling, or defeat DIO;
   Josuke — bring a rider back from under 10% HP to full health in one battle.
   Everything lives here: characters, portraits, abilities, statuses, Paths and trainers, Legacy trees, race powers,
   achievements and the story lines. Registries that load later (standfx, trees, sprint, combat wrappers) are hooked
   on DOMContentLoaded. The Stand figures and choreography are the Drifter's Star Platinum / Crazy Diamond ones. */
'use strict';

(() => {
  const INK = '#1a1020';
  const MIR = s => `${s}<g transform="translate(100 0) scale(-1 1)">${s}</g>`;
  const lvlOf = x => (x.user && x.user.ref && x.user.ref.level) || 1;
  const lv = (x, a, b) => (x.lvl > 1 ? b : a);

  /* ================= 1. Portraits ================= */
  const A = SBR.art, HB = A.PARTS.hairStyle, HAT = A.PARTS.hat, STY = A.PARTS.style;
  const BODYP = 'M8 120 Q12 94 50 88 Q88 94 92 120 Z';
  const chain = (d) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#f2c14e" stroke-width="1.9" stroke-dasharray="2.2 1.1" stroke-linecap="round"/>`;
  // Jotaro: spiky black hair behind the head, down to the collar
  HB.jj_jotaro = c => `<path d="M28 46 Q27 25 50 23 Q73 25 72 46 L77 57 L71.6 55.6 L74.4 67 L68 62 L67 73 L61 65 L39 65 L33 73 L32 62 L25.6 67 L28.4 55.6 L23 57Z" fill="${c}"/>`;
  // Josuke: short, slicked back at the sides
  HB.jj_josuke = c => `<path d="M29 46 Q28 25 50 23 Q72 25 71 46 L71.6 60 L28.4 60Z" fill="${c}"/>`;
  // Jotaro's cap: the back of it turns into his hair; gold plate on the front, short visor
  HAT.jj_jotaro = (c, c2, p) => {
    const h = (p && p.hair) || INK;
    return `<path d="M70 20 Q82 22 90 33 L81.6 33.4 L89.6 43 L79.6 41.4 L85 53 L75.6 47 L73.4 36Z" fill="${h}"/>
      <path d="M79 26 Q84 29 86 32 M77 36 L84 42 M76 43 L81 50" fill="none" stroke-width=".8" opacity=".5"/>
      <path d="M27.4 44 Q25.6 17 50 14.6 Q70 15.4 74 33 L73.4 44 Q50 38 27.4 44Z" fill="${c}"/>
      <path d="M28.6 37.6 Q50 31.4 72.6 37.6" fill="none" stroke-width="1.1"/>
      <path d="M36 23 Q42 18 52 17" fill="none" stroke="#fff" stroke-width="1.6" opacity=".25" stroke-linecap="round"/>
      <rect x="42.6" y="22.4" width="14.8" height="8.4" rx="2" fill="${c2}" stroke-width="1.3"/>
      <path d="M46 26.6 h8 M50 23.8 v5.6" stroke-width="1"/><circle cx="50" cy="26.6" r="1.6" fill="${c2}" stroke-width=".8"/>
      <path d="M44 23.6 l2 1" stroke="#fff" stroke-width=".8" opacity=".7"/>
      <path d="M31 48.6 Q50 43.6 69 48.6 L68.4 55.4 Q50 50.6 31.6 55.4Z" fill="#000" opacity=".3" stroke="none"/>
      <path d="M25.6 43.6 Q50 35 74.4 43.6 L71 50.4 Q50 43.6 29 50.4Z" fill="#101416"/>
      <path d="M32 46.4 Q50 40.6 68 46.4" fill="none" stroke="#fff" stroke-width=".7" opacity=".25"/>
      ${MIR(`<path d="M30.2 46 L27.6 58 L31.4 52.6 L32 60.4 L34.8 48.6Z" fill="${h}" stroke-width="1.4"/>`)}`;
  };
  // Josuke's pompadour: a tall, glossy roll swept up off the forehead
  HAT.jj_josuke = (c, c2, p) => {
    const h = (p && p.hair) || INK;
    const curl = 'M49 17.6 Q49.6 12.4 56 11.4 Q64 10.8 66.6 16.6 Q68 23 61 25.4 Q54 26.6 51.4 21.4 Q50.6 17 55.6 16 Q60.4 15.8 61 19.4 Q60.4 22 57 21.6';
    return MIR(`<path d="M30.4 50 Q28.6 36 33 30 L39.6 44.6 Q34 45 31 52Z" fill="${h}"/><path d="M31.6 46 Q31 40 33.6 35" fill="none" stroke-width=".7" opacity=".5"/>`)
      + `<path d="M31 44 Q25.6 30 29.6 19 Q34 7 52 5.6 Q70 5 75.6 14 Q79 22 73 28.6 Q70.4 31 69.6 36 L69 44 Q60 38.4 50 38.4 Q40 38.4 31 44Z" fill="${h}"/>
      <path d="M32.6 38 Q30 28 33.6 20 Q38 12.6 48 11 M40 38 Q37.4 30 40 23 Q43 17.6 49 16.4 M50 38.4 Q48.6 32 50.6 27 M60 38 Q63 32 66 28.6 M67.6 38 Q68.6 32 71 28" fill="none" stroke-width=".9" opacity=".6"/>
      <ellipse cx="58.4" cy="18.4" rx="16" ry="11" transform="rotate(-10 58.4 18.4)" fill="${h}"/>
      <path d="${curl}" fill="none" stroke="#8a7ae8" stroke-width="1.8" opacity=".8"/><path d="${curl}" fill="none" stroke-width=".7"/>
      <path d="M44.6 11.6 Q52 6.6 62 7.6" fill="none" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/>
      <path d="M31.4 34 Q29.6 26 32.6 20" fill="none" stroke="#fff" stroke-width="1.4" opacity=".35" stroke-linecap="round"/>
      <path d="M43 38.4 Q46.6 41.6 45 46.4 L47.6 38.6Z M52 38.4 Q55.6 41.6 54.4 45.8 L56.2 38.8Z" fill="${h}" stroke-width="1"/>`;
  };
  // gakuran: long school coat, open over a dark shirt, with the tall standing collar
  const gakuran = (p, id, extraO = '', extraU = '') => ({
    u: `<path d="${BODYP}" fill="${p.outfit}"/><path d="M41.6 88 L50 120 L58.4 88Z" fill="${p.outfit2}"/>
      ${MIR(`<path d="M41.6 88 L50 120 L47.6 120 L39 92Z" fill="${p.outfit}" stroke-width="1.4"/>`)}
      <path d="M30 100 Q36 96 40 95 M70 100 Q64 96 60 95" fill="none" stroke="#fff" stroke-width=".8" opacity=".18"/>${extraU}`,
    o: `${MIR(`<path d="M40.6 79.6 L39.4 92 L46.4 96.4 L46.6 83.6Z" fill="${p.outfit}" stroke-width="1.8"/><path d="M41.4 81.4 L40.6 90.6" stroke="#fff" stroke-width=".7" opacity=".2"/>`)}${extraO}`,
  });
  STY.jj_jotaro = (p, id) => gakuran(p, id,
    `<circle cx="57.4" cy="85" r="1.9" fill="#f2c14e" stroke-width="1"/>`,
    chain('M57.6 87 Q62 99 70 104 Q74 106 76 103') + `<circle cx="76.6" cy="102.6" r="2.4" fill="#f2c14e" stroke-width="1.1"/><circle cx="34" cy="104" r="1.5" fill="#f2c14e" stroke-width=".8"/><circle cx="34.6" cy="112" r="1.5" fill="#f2c14e" stroke-width=".8"/>`);
  const heartD = (x, y, s) => `M${x} ${y + s * 0.9} C${x - s * 1.6} ${y - s * 0.1} ${x - s * 0.9} ${y - s * 1.3} ${x} ${y - s * 0.45} C${x + s * 0.9} ${y - s * 1.3} ${x + s * 1.6} ${y - s * 0.1} ${x} ${y + s * 0.9}Z`;
  const peace = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f2c14e" stroke-width="1"/><path d="M${x} ${y - r * 0.8} V${y + r * 0.8} M${x} ${y} L${x - r * 0.6} ${y + r * 0.6} M${x} ${y} L${x + r * 0.6} ${y + r * 0.6}" fill="none" stroke-width=".8"/>`;
  const anchor = (x, y) => `<g transform="translate(${x} ${y})"><path d="M0 -5 V4 M-3 -2.6 H3 M-4.4 1.6 Q-3.6 5.6 0 5.6 Q3.6 5.6 4.4 1.6" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><path d="M0 -5 V4 M-3 -2.6 H3 M-4.4 1.6 Q-3.6 5.6 0 5.6 Q3.6 5.6 4.4 1.6" fill="none" stroke="#f2c14e" stroke-width="1.3" stroke-linecap="round"/><circle cy="-6" r="1.4" fill="none" stroke="#f2c14e" stroke-width="1"/></g>`;
  STY.jj_josuke = (p, id) => gakuran(p, id,
    `${peace(42.8, 87.6, 2.6)}<path d="${heartD(57.2, 87.8, 2.2)}" fill="#f2c14e" stroke-width="1"/>`,
    anchor(67, 103) + `<path d="${heartD(33.4, 104, 2.4)}" fill="#f2c14e" stroke-width="1"/><path d="${heartD(36, 113, 1.8)}" fill="#e89ac8" stroke-width=".9"/>`);

  A.addPortrait({
    jotaro: { skin: '#f0cfae', hair: '#15151c', hairStyle: 'jj_jotaro', hat: 'jj_jotaro', hatColor: '#1a2023', hat2: '#f2c14e', outfit: '#1f2c29', outfit2: '#2a2a36', eye: '#3a9a8a', lip: '#b87a6a', bg: ['#6a4ab8', '#1e1438'], eyes: 'sharp', brows: 'thick', mouth: 'flat', style: 'jj_jotaro' },
    josuke: { skin: '#f4d2b4', hair: '#231d34', hairStyle: 'jj_josuke', hat: 'jj_josuke', hatColor: '#231d34', hat2: '#f2c14e', outfit: '#25306a', outfit2: '#1a1a2a', eye: '#5a6ad8', lip: '#c07a78', bg: ['#e89ac8', '#3a5ac8'], eyes: 'sharp', brows: 'thick', mouth: 'smirk', style: 'jj_josuke' },
    // trainers met on the road
    jj_boxer: { skin: '#d8a070', hair: '#3a2a1a', hairStyle: 'slicked', hat: null, outfit: '#d8a070', outfit2: '#c8323c', eye: '#3a2a1a', lip: '#9a5a4a', bg: ['#c8323c', '#f2c14e'], facial: 'handlebar', eyes: 'narrow', brows: 'thick', mouth: 'gritted', acc: ['bandage'] },
    jj_watch: { skin: '#f0d6c0', hair: '#d0d0d8', hairStyle: 'swept', hat: null, outfit: '#3a2a1a', outfit2: '#f2c14e', eye: '#4a6a8a', lip: '#a07070', bg: ['#ffd84a', '#2a1a4a'], facial: 'mustache', acc: ['monocle'], style: 'vest' },
    jj_natural: { skin: '#eccaa8', hair: '#8a5a30', hairStyle: 'short', hat: 'straw', hatColor: '#e8d8a0', hat2: '#3a8ad0', outfit: '#e8d8b0', outfit2: '#3a8ad0', eye: '#3a6a9a', lip: '#b07060', bg: ['#3a8ad0', '#9fe0f0'], acc: ['glasses'], facial: 'shortbeard' },
    jj_tinker: { skin: '#e0b890', hair: '#6a4a2a', hairStyle: 'short', hat: 'bowler', hatColor: '#4a3a2a', hat2: '#c8a070', outfit: '#6a5a4a', outfit2: '#c8a070', eye: '#5a3a2a', lip: '#a06050', bg: ['#e89ac8', '#6a5a4a'], facial: 'fullbeard', acc: ['goggles'] },
    jj_glass: { skin: '#f4d8c0', hair: '#c86a3a', hairStyle: 'curls', hat: null, outfit: '#8a8a9a', outfit2: '#8adcff', eye: '#3a7a8a', lip: '#c07070', bg: ['#8adcff', '#3a6ac8'], marks: ['freckles'], acc: ['goggles'], mouth: 'smile' },
    jj_barber: { skin: '#eccab0', hair: '#1a1020', hairStyle: 'slicked', hat: null, outfit: '#f6f6f0', outfit2: '#c8323c', eye: '#2a2a3a', lip: '#a06060', bg: ['#c8323c', '#f6f6f0'], facial: 'handlebar', acc: ['bowtie'], mouth: 'smirk', eyes: 'narrow', brows: 'arched', style: 'vest' },
  });

  /* ================= 2. Statuses ================= */
  Object.assign(SBR.STATUS, {
    jj_catch: { name: 'Star Catch', glyph: '捕', color: '#9a7ae8', kind: 'buff', mode: 'turns', desc: () => 'Star Platinum is watching. The next enemy attack on this rider is caught (no damage) and punched straight back. Piercing attacks get through.' },
    jj_rage: { name: 'Pompadour Rage', glyph: '怒', color: '#c8323c', kind: 'buff', mode: 'turns', mods: { dmgOut: 1.35, dmgIn: 1.1 }, desc: () => '"WHAT did you say about my hair?!" Deals 35% more damage, takes 10% more.' },
  });
  (() => {
    const I = SBR.icons, st = I.st;
    I.define('status', 'jj_catch', () => `<circle cx="24" cy="24" r="18" fill="#3a2a6a" ${st}/><path d="M14 30 Q12 18 20 14 L22 24 L26 12 L30 24 L34 16 Q38 24 32 32 Q24 38 14 30Z" fill="#9a7ae8" ${st} stroke-width="1.4"/><circle cx="26" cy="27" r="3.4" fill="#f2c14e" ${st} stroke-width="1.2"/>`);
    I.define('status', 'jj_rage', () => `<circle cx="24" cy="24" r="18" fill="#c8323c" ${st}/><path d="M12 26 Q10 12 26 8 Q40 8 38 22 Q30 16 22 20 Q16 22 12 26Z" fill="#231d34" ${st} stroke-width="1.4"/><path d="M18 30 l4 4 4 -4 4 4 4 -4" fill="none" stroke="#fff" stroke-width="2.2"/>`);
  })();

  /* ================= 3. Abilities ================= */
  const AB = SBR.ABILITIES;
  const hits = (x, n, base, scale, first) => { for (let i = 0; i < n; i++) { if (!x.target || x.target.dead) break; x.dmg(x.target, base, scale, { label: i === 0 ? first : undefined }); } };
  Object.assign(AB, {
    /* --- Jotaro: base kit --- */
    jot_ora: { name: 'ORA ORA', cost: 0, target: 'enemy', tags: ['stand'], dtype: 'stand', fx: 'hit', desc: () => 'Star Platinum\'s fists: 3 punches of 2, scales with SPIN.', run(x) { hits(x, 3, 2, { spin: 0.03 }, 'ORA'); } },
    jot_finger: { name: 'Star Finger', cost: 2, cd: 2, target: 'enemy', tags: ['stand'], dtype: 'stand', fx: 'nail', desc: l => `Two fingers shoot across the room. ${l > 1 ? 14 : 11} base, cannot be dodged.`, run(x) { x.dmg(x.target, lv(x, 11, 14), { aim: 0.05 }, { noDodge: true }); } },
    jot_yare: { name: 'Yare Yare Daze', cost: 1, cd: 3, target: 'self', tags: [], fx: 'buff', desc: l => `"Good grief." Shrug off ${l > 1 ? 2 : 1} debuff, gain Rider's Calm 2 and Guard 2.`, run(x) { x.cleanse(x.user, lv(x, 1, 2)); x.status(x.user, 'calm', 0, 2); x.status(x.user, 'guard', 0, 2); x.say(x.user, 'Yare yare daze.'); } },
    jot_glare: { name: 'Menacing Glare', cost: 1, cd: 3, target: 'allEnemies', tags: ['stand'], fx: 'debuff', desc: () => 'ゴゴゴゴ. Jotaro stares them down: every enemy is Weakened 1, and he gains Taunt 2.', run(x) { x.enemies.forEach(e => x.status(e, 'weak', 0, 1)); x.status(x.user, 'taunt', 0, 2); } },
    /* --- Jotaro: Stardust Crusader --- */
    jot_rush: { name: 'ORA ORA Rush', cost: 1, cd: 1, target: 'enemy', tags: ['stand'], dtype: 'stand', fx: 'hit', desc: l => `ORA ORA ORA! ${l > 1 ? 4 : 3} punches of 3; the last one Weakens the target for 1 turn.`, run(x) { hits(x, lv(x, 3, 4), 3, { spin: 0.03 }, 'ORA ORA'); if (!x.target.dead) x.status(x.target, 'weak', 0, 1); } },
    jot_barrage: { name: 'Stardust Barrage', cost: 2, cd: 3, target: 'allEnemies', tags: ['stand'], dtype: 'stand', fx: 'aoe', desc: l => `Star Platinum moves faster than the eye: 2 punches of ${l > 1 ? 4 : 3} on every enemy.`, run(x) { x.enemies.forEach(e => { for (let i = 0; i < 2; i++) if (!e.dead) x.dmg(e, lv(x, 3, 4), { spin: 0.03 }); }); } },
    jot_final: { name: 'ORAAAAA!', cost: 3, cd: 4, target: 'enemy', tags: ['stand'], dtype: 'stand', fx: 'crit', desc: () => 'The finishing rush: 8 punches of 2.5, then the target is Exposed for 2 turns.', run(x) { hits(x, 8, 2.5, { spin: 0.03 }, 'ORAAAA'); if (!x.target.dead) x.status(x.target, 'vuln', 0, 2); } },
    /* --- Jotaro: The World Within --- */
    jot_stop1: { name: 'One Still Second', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], dtype: 'stand', fx: 'debuff', desc: l => `Time stops for one heartbeat. ${l > 1 ? 7 : 5} base (cannot be dodged) and the target is Time Stopped for its next turn.`, run(x) { x.dmg(x.target, lv(x, 5, 7), { spin: 0.03 }, { noDodge: true }); if (!x.target.dead) x.status(x.target, 'timestop', 0, 1); } },
    jot_timestrike: { name: 'Stopped-Time Strike', cost: 2, cd: 2, target: 'enemy', tags: ['stand'], dtype: 'stand', fx: 'crit', desc: () => '10 base. Against a Time Stopped or Spun target it always crits and deals 50% more.', run(x) { const fz = x.has(x.target, 'timestop') || x.has(x.target, 'stun'); x.dmg(x.target, fz ? 15 : 10, { spin: 0.04 }, { forceCrit: fz, noDodge: fz, label: fz ? '止' : undefined }); } },
    jot_world: { name: 'Star Platinum: The World', cost: 3, cd: 5, target: 'allEnemies', tags: ['stand'], fx: 'debuff', desc: () => `"Time has stopped." Every enemy is frozen for 1 turn (2 turns from level 9). Jotaro gains Empowered 1. Bosses shake it off after one.`,
      run(x) { const n = lvlOf(x) >= 9 ? 2 : 1; x.c.push({ t: 'timestop', on: true }); x.enemies.forEach(e => x.status(e, 'timestop', 0, e.tier === 'boss' ? 1 : n)); x.c.push({ t: 'timestop', on: false }); x.status(x.user, 'empower', 0, 2); x.say(x.user, 'Star Platinum: The World.'); } },
    /* --- Jotaro: Marine Biologist --- */
    jot_observe: { name: 'Keen Observation', cost: 1, cd: 2, target: 'enemy', tags: [], fx: 'scan', desc: l => `Jotaro studies the Stand's range and habits. Scanned ${l > 1 ? 3 : 2} and Exposed 1.`, run(x) { x.status(x.target, 'marked', 0, lv(x, 2, 3)); x.status(x.target, 'vuln', 0, 1); } },
    jot_catch: { name: 'Bullet Catch', cost: 1, cd: 3, target: 'self', tags: ['stand'], fx: 'buff', desc: l => `Star Platinum waits with two fingers out. Gain Star Catch for ${l > 1 ? 3 : 2} turns: the next enemy hit is caught and punched back.`, run(x) { x.status(x.user, 'jj_catch', 0, lv(x, 2, 3)); } },
    jot_dolphin: { name: 'Did You Know? Dolphins...', cost: 2, cd: 4, target: 'allAllies', tags: [], fx: 'buff', desc: () => 'A marine biology lecture at the worst possible moment. Allies gain Lucky 2 and Rider\'s Calm 2; every Scanned enemy is also Exposed 2.',
      run(x) { x.allies.forEach(a => { x.status(a, 'lucky', 0, 2); x.status(a, 'calm', 0, 2); }); x.c.foes(x.user).forEach(e => { if (x.has(e, 'marked')) x.status(e, 'vuln', 0, 2); }); x.say(x.user, 'Dolphins sleep with half their brain awake. So do I.'); } },

    /* --- Josuke: base kit --- */
    jos_dora: { name: 'DORARARA', cost: 0, target: 'enemy', tags: ['stand'], dtype: 'stand', fx: 'hit', desc: () => 'Crazy Diamond\'s fists: 3 punches of 2, scales with SPIN.', run(x) { hits(x, 3, 2, { spin: 0.03 }, 'DORA'); } },
    jos_fix: { name: 'Crazy Diamond: Fix', cost: 1, cd: 1, target: 'ally', tags: ['stand', 'heal'], fx: 'heal', desc: l => `Put an ally back together: heal ${l > 1 ? 11 : 9} and remove 1 debuff. (Crazy Diamond can't heal Josuke.)`, run(x) { x.heal(x.target, lv(x, 9, 11), { res: 0.05 }); x.cleanse(x.target, 1); } },
    jos_restore: { name: 'Restore to Before', cost: 2, cd: 3, target: 'ally', tags: ['stand', 'heal'], fx: 'heal', desc: () => 'Undo what happened: an ally gets back every HP lost since the start of this round (at least 6) and loses 2 debuffs. Not Josuke.',
      run(x) { const t = x.target, was = t._jjRoundHp != null ? t._jjRoundHp : t.hp; x.heal(t, Math.max(6, was - t.hp), {}); x.cleanse(t, 2); } },
    jos_wall: { name: 'Rubble Wall', cost: 2, cd: 4, target: 'allAllies', tags: ['stand'], fx: 'buff', desc: () => 'Josuke smashes the scenery and fixes it into a wall: every ally gains an 8 Shield and Guard 1.', run(x) { x.allies.forEach(a => { x.status(a, 'shield', 8); x.status(a, 'guard', 0, 2); }); } },
    /* --- Josuke: Crazy Diamond (restoration) --- */
    jos_mend: { name: 'Heal Wounds', cost: 1, cd: 1, target: 'ally', tags: ['stand', 'heal'], fx: 'heal', desc: l => `Close the wound: heal 8 and Regen ${l > 1 ? 3 : 2}.`, run(x) { x.heal(x.target, 8, { res: 0.05 }); x.status(x.target, 'regen', 0, lv(x, 2, 3)); } },
    jos_together: { name: 'Put It Back Together', cost: 2, cd: 3, target: 'allAllies', tags: ['stand', 'heal'], fx: 'heal', desc: l => `Every ally heals 6 and loses ${l > 1 ? 2 : 1} debuff.`, run(x) { x.allies.forEach(a => { x.heal(a, 6, { res: 0.04 }); x.cleanse(a, lv(x, 1, 2)); }); } },
    jos_reset: { name: 'Restore Everything', cost: 3, cd: 5, target: 'allAllies', tags: ['stand', 'heal'], fx: 'heal', desc: () => 'Put the whole party back the way it walked in: each ally regains the HP lost this battle (10 to 25) and loses every debuff. Not Josuke, and not the dead.',
      run(x) { x.allies.forEach(a => { const was = a._jjStartHp != null ? a._jjStartHp : a.maxHp; x.heal(a, Math.min(25, Math.max(10, was - a.hp)), {}); x.cleanse(a, 9); }); } },
    /* --- Josuke: Homing Restoration --- */
    jos_shards: { name: 'Glass Shards', cost: 1, cd: 1, target: 'enemy', tags: ['stand'], dtype: 'stand', fx: 'gun', desc: l => `Break a bottle, then fix it with the target in the way: ${l > 1 ? 4 : 3} shards of 3 that cannot be dodged.`, run(x) { for (let i = 0; i < lv(x, 3, 4); i++) { if (x.target.dead) break; x.dmg(x.target, 3, { aim: 0.03 }, { noDodge: true, label: i ? undefined : 'SHARD' }); } } },
    jos_blood: { name: 'Blood Tracker', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], dtype: 'stand', fx: 'gun', desc: l => `A drop of their blood, restored to where it came from. 7 base, Bleed 2 and Scanned ${l > 1 ? 4 : 3}: there's nowhere to hide.`, run(x) { const r = x.dmg(x.target, 7, { aim: 0.04 }, { noDodge: true }); if (r.hit) x.status(x.target, 'bleed', 2); if (!x.target.dead) x.status(x.target, 'marked', 0, lv(x, 3, 4)); } },
    jos_bullet: { name: 'Homing Bullet Restoration', cost: 3, cd: 4, target: 'enemy', tags: ['stand'], dtype: 'stand', fx: 'gun', pierce: true, desc: () => 'Fix the fragments back into one bullet, with the target in between: 5 fragments of 4 that pierce and cannot be dodged.', run(x) { for (let i = 0; i < 5; i++) { if (x.target.dead) break; x.dmg(x.target, 4, { aim: 0.03 }, { noDodge: true, pierce: true, label: i ? undefined : 'HOMING' }); } } },
    /* --- Josuke: Great Days --- */
    jos_hair: { name: 'What About My Hair?!', cost: 1, cd: 3, target: 'self', tags: [], fx: 'buff', desc: l => `Someone insulted the pompadour. Pompadour Rage ${l > 1 ? 3 : 2} (+35% damage) and Taunt 2.`, run(x) { x.status(x.user, 'jj_rage', 0, lv(x, 2, 3) + 1); x.status(x.user, 'taunt', 0, 2); x.say(x.user, 'WHAT did you say about my hair?!'); } },
    jos_beatdown: { name: 'DORARARA Beatdown', cost: 2, cd: 2, target: 'enemy', tags: ['stand'], dtype: 'stand', fx: 'hit', desc: () => '5 punches of 3; 2 more while in Pompadour Rage.', run(x) { hits(x, x.has(x.user, 'jj_rage') ? 7 : 5, 3, { spin: 0.03 }, 'DORARARA'); } },
    jos_fuse: { name: 'Fused Into the Rock', cost: 3, cd: 5, target: 'enemy', tags: ['stand'], dtype: 'stand', fx: 'crit', desc: () => 'Beat them into the scenery, then fix the scenery around them. 16 base, Spun 1, Hooked 2 and Weakened 2.', run(x) { const r = x.dmg(x.target, 16, { spin: 0.05 }, { label: 'ドラァ' }); if (r.hit && !x.target.dead) { x.status(x.target, 'stun', 0, 1); x.status(x.target, 'hooked', 0, 2); x.status(x.target, 'weak', 0, 2); } } },
  });

  // ability icons: a badge in the Stand's colour with its cry
  (() => {
    const I = SBR.icons, st = I.st, K = I.K;
    const badge = (c, t, fs = 12, c2 = '#fff', deco = '') => `<circle cx="24" cy="24" r="19" fill="${c}" ${st}/>${deco}<circle cx="24" cy="24" r="14" fill="none" stroke="#fff" stroke-width="1.2" opacity=".5"/><text x="24" y="${24 + fs * 0.36}" font-size="${fs}" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${c2}" stroke="${K}" stroke-width="1.6" paint-order="stroke">${t}</text>`;
    const stars = `<g fill="#fff3c0" opacity=".85">${[[12, 14], [36, 12], [38, 34]].map(([x, y]) => `<path d="M${x} ${y - 3}l1 2 2 .2-1.6 1.4.6 2.2-2-1.2-2 1.2.6-2.2-1.6-1.4 2-.2z"/>`).join('')}</g>`;
    const hearts = `<g fill="#fff" opacity=".7">${[[13, 14], [35, 13]].map(([x, y]) => `<path d="${heartD(x, y, 2.4)}"/>`).join('')}</g>`;
    const SP = '#6a4ab8', TW = '#c89a20', MB = '#2a7ab8', CD = '#d878b0', HR = '#3aa8d8', GD = '#5a3aa0';
    const T = {
      jot_ora: [SP, 'ORA', 13], jot_finger: [SP, '指', 18], jot_yare: ['#2a3a36', 'やれやれ', 8], jot_glare: ['#3a2a5a', 'ゴゴゴ', 10],
      jot_rush: [SP, 'ORAx3', 10], jot_barrage: [SP, '星', 18], jot_final: ['#c8323c', 'ORAAA', 9],
      jot_stop1: [TW, '一秒', 14], jot_timestrike: [TW, '止', 18], jot_world: [TW, 'ZA WARUDO', 7, '#1a1020'],
      jot_observe: [MB, '観', 18], jot_catch: [MB, '捕', 18], jot_dolphin: [MB, '海豚', 14],
      jos_dora: [CD, 'DORA', 11], jos_fix: [CD, '治', 18], jos_restore: [CD, '戻', 18], jos_wall: ['#8a6a4a', '壁', 18],
      jos_mend: [CD, '癒', 18], jos_together: [CD, '直', 18], jos_reset: [CD, '全治', 14],
      jos_shards: [HR, '破片', 14], jos_blood: ['#c8323c', '血', 18], jos_bullet: [HR, '弾', 18],
      jos_hair: [GD, '髪!?', 13], jos_beatdown: [GD, 'DORARA', 9], jos_fuse: ['#8a6a4a', '岩', 18],
    };
    Object.entries(T).forEach(([id, [c, t, fs, c2]]) => I.define('ability', id, () => badge(c, t, fs, c2 || '#fff', id.startsWith('jot') ? stars : hearts)));
  })();

  /* ================= 4. The characters ================= */
  SBR.CHARS.jotaro = {
    name: 'Jotaro Kujo', short: 'Jotaro', stand: 'Star Platinum', title: 'A Stardust Crusader, Out of His Century', portrait: 'jotaro', color: '#6a4ab8',
    hp: 38, stats: { spin: 5, aim: 5, grit: 5, ride: 3, res: 4, luck: 2 }, growth: { spin: 3, grit: 2, aim: 1 },
    abilities: [{ id: 'jot_ora' }, { id: 'jot_finger' }, { id: 'jot_yare' }, { id: 'jot_glare', level: 4 }],
    passive: { name: 'Precision and Power', desc: 'Star Platinum is fast and exact: +10% Stand damage and +5% crit chance.' },
    bio: 'A tall, silent delinquent in a school coat from nearly a century later. Somewhere in Egypt, in 1989, an old arrowhead nicked his hand — and he woke up at the Steel Ball Run registration tent. He says very little. His Stand says ORA.',
    aggro: 1.3,
  };
  SBR.CHARS.josuke = {
    name: 'Josuke Higashikata', short: 'Josuke', stand: 'Crazy Diamond', title: 'Diamond Is Unbreakable', portrait: 'josuke', color: '#d878b0',
    hp: 36, stats: { spin: 4, aim: 3, grit: 6, ride: 3, res: 6, luck: 2 }, growth: { grit: 2, res: 2, spin: 2 },
    abilities: [{ id: 'jos_dora' }, { id: 'jos_fix' }, { id: 'jos_restore' }, { id: 'jos_wall', level: 4 }],
    passive: { name: 'It Can\'t Fix Its Own User', desc: 'Crazy Diamond heals allies 25% more, but can never heal Josuke himself.' },
    bio: 'A kind-hearted high schooler from Morioh, 1999, with the tallest pompadour west of the Mississippi. He touched a strange arrowhead in his grandfather\'s evidence box and landed in 1890. Do not mention the hair.',
    aggro: 1.1,
  };
  ['jotaro', 'josuke'].forEach(k => { if (!SBR.LEADS.includes(k)) SBR.LEADS.push(k); });
  (() => {
    const base = SBR.equipBonus;
    SBR.equipBonus = m => {
      const o = base(m);
      if (m && m.id === 'jotaro') { o.bonus.standDmg = (o.bonus.standDmg || 0) + 0.1; o.bonus.crit = (o.bonus.crit || 0) + 0.05; }
      return o;
    };
  })();

  /* ================= 5. Paths ================= */
  const ab3 = ids => ids.map((id, i) => ({ id, level: [1, 3, 5][i] }));
  Object.assign(SBR.PATHS, {
    crusader:  { char: 'jotaro', name: 'Stardust Crusader', color: '#7a5ad0', acts: [1, 2, 3], stats: { spin: 3 }, bonus: { standDmg: 0.1 }, res: { stand: -0.1 },
      passive: '+3 SPIN, +10% Stand damage. -10% Stand damage taken.', desc: 'Fifty days across Asia to Cairo taught him one answer to every question: hit it faster.', abilities: ab3(['jot_rush', 'jot_barrage', 'jot_final']) },
    worldwithin: { char: 'jotaro', name: 'The World Within', color: '#e8b020', acts: [3, 4, 5], stats: { spin: 2, res: 1 }, bonus: { init: 3 }, res: { stand: -0.1 },
      passive: '+2 SPIN, +1 RESOLVE, +3 initiative. -10% Stand damage taken.', desc: 'Star Platinum can enter the stopped instant too. A heartbeat at first; longer, the more he rides.', abilities: ab3(['jot_stop1', 'jot_timestrike', 'jot_world']) },
    marinebio: { char: 'jotaro', name: 'Marine Biologist', color: '#3a8ad0', acts: [2, 3, 4], stats: { res: 2, luck: 1 }, bonus: { crit: 0.04 }, res: { cold: -0.15, bleed: -0.1 },
      passive: '+2 RESOLVE, +1 LUCK, +4% crit. -15% Cold and -10% Bleed damage taken.', desc: 'The older, quieter Jotaro: a scientist who studies a Stand before he punches it.', abilities: ab3(['jot_observe', 'jot_catch', 'jot_dolphin']) },
    cdiamond:  { char: 'josuke', name: 'Crazy Diamond', color: '#e89ac8', acts: [1, 2, 3], stats: { res: 3 }, bonus: { heal: 0.15 }, res: { phys: -0.1 },
      passive: '+3 RESOLVE, +15% healing. -10% Physical damage taken.', desc: 'The gentlest Stand in the world. It fixes anything broken, and anyone hurt, except its own user.', abilities: ab3(['jos_mend', 'jos_together', 'jos_reset']) },
    homing:    { char: 'josuke', name: 'Homing Restoration', color: '#8adcff', acts: [2, 3, 4], stats: { aim: 3 }, bonus: { standDmg: 0.1 }, res: { bullet: -0.1 },
      passive: '+3 AIM, +10% Stand damage. -10% Gunshot damage taken.', desc: 'Break something, and it wants to go home. Josuke just makes sure the enemy is standing in the way.', abilities: ab3(['jos_shards', 'jos_blood', 'jos_bullet']) },
    greatdays: { char: 'josuke', name: 'Great Days', color: '#6a4ab0', acts: [3, 4, 5], stats: { grit: 3, spin: 1 }, bonus: { maxHp: 10, dmg: 0.05 }, res: { phys: -0.1 },
      passive: '+3 GRIT, +1 SPIN, +10 max HP, +5% damage. The first time each battle Josuke drops below half HP, he flies into Pompadour Rage.', desc: 'Nobody insults the hair. Nobody.', abilities: ab3(['jos_hair', 'jos_beatdown', 'jos_fuse']) },
  });
  (() => {
    const I = SBR.icons, st = I.st;
    const ring = (c, inner) => `<circle cx="24" cy="24" r="20" fill="${c}" ${st}/><circle cx="24" cy="24" r="15" fill="#fbf4e4" ${st} stroke-width="1.4"/>${inner}`;
    const mini = (id, s = 0.6) => `<g transform="translate(${24 - 24 * s} ${24 - 24 * s}) scale(${s})">${I.ability(id).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>`;
    ['crusader', 'worldwithin', 'marinebio', 'cdiamond', 'homing', 'greatdays'].forEach(id => { const p = SBR.PATHS[id]; SBR.PATH_EMBLEM[id] = () => I.wrap(ring(p.color, mini(p.abilities[0].id))); });
  })();

  /* ================= 6. Trainers who teach the Paths ================= */
  (() => {
    const port = key => ({ kind: 'portrait', key });
    const E = SBR.ENEMIES;
    const trainer = (id, o) => { E[id] = Object.assign({ tier: 'elite', xp: 18, money: [20, 35], trainer: true }, o); };
    trainer('t_jj_boxer', { name: '"Iron" Mike Callahan', title: 'Bare-Knuckle Champion of Kansas', art: port('jj_boxer'), hp: 72, stats: { grit: 8, spin: 3 }, dtype: 'phys', res: { phys: -0.2 },
      abilities: [{ name: 'One-Two', w: 3, target: 'enemy', fx: 'hit', run: x => { x.dmg(x.target, 4, { grit: 0.03 }); x.dmg(x.target, 4, { grit: 0.03 }); } },
        { name: 'Haymaker', w: 1, cd: 3, target: 'enemy', fx: 'crit', run: x => x.dmg(x.target, 12, { grit: 0.04 }) }] });
    trainer('t_jj_watch', { name: 'Old Man Harrow', title: 'Watchmaker of St. Louis', art: port('jj_watch'), hp: 58, stats: { res: 8, aim: 4 }, res: { stand: -0.2 },
      abilities: [{ name: 'Pocket Watch Swing', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 6, { res: 0.04 }) },
        { name: 'Stopped Hands', w: 1, cd: 3, target: 'enemy', fx: 'debuff', run: x => x.status(x.target, 'stun', 0, 1) }] });
    trainer('t_jj_natural', { name: 'Professor Aldous Finch', title: 'Naturalist on the Mississippi', art: port('jj_natural'), hp: 60, stats: { res: 6, luck: 5 }, res: { cold: -0.2, bleed: -0.2 },
      abilities: [{ name: 'Specimen Jar', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 6, { luck: 0.04 }) },
        { name: 'Field Notes', w: 1, cd: 3, target: 'self', fx: 'buff', run: x => { x.status(x.user, 'calm', 0, 2); x.heal(x.user, 8, {}); } }] });
    trainer('t_jj_tinker', { name: 'Tobias the Tinker', title: 'Mender of Anything', art: port('jj_tinker'), hp: 66, stats: { res: 8, grit: 4 }, res: { phys: -0.2 },
      abilities: [{ name: 'Mallet', w: 3, target: 'enemy', fx: 'hit', run: x => x.dmg(x.target, 6, { grit: 0.04 }) },
        { name: 'Patch Up', w: 2, cd: 2, target: 'self', fx: 'heal', run: x => x.heal(x.user, 12, { res: 0.04 }) }] });
    trainer('t_jj_glass', { name: 'Ada Glassworth', title: 'Glassblower of Pittsburgh', art: port('jj_glass'), hp: 58, stats: { aim: 8 }, res: { bullet: -0.2 },
      abilities: [{ name: 'Blown Glass', w: 3, target: 'enemy', fx: 'gun', run: x => { for (let i = 0; i < 3; i++) x.dmg(x.target, 2, { aim: 0.03 }, { label: 'SHARD' }); } },
        { name: 'Shatter', w: 1, cd: 3, target: 'allEnemies', fx: 'aoe', run: x => x.enemies.forEach(e => x.dmg(e, 4, { aim: 0.03 })) }] });
    trainer('t_jj_barber', { name: 'Salvatore the Barber', title: 'Finest Scissors in Chicago', art: port('jj_barber'), hp: 64, stats: { aim: 6, luck: 4 }, res: { bleed: -0.3 },
      abilities: [{ name: 'Straight Razor', w: 3, target: 'enemy', fx: 'claw', run: x => { const r = x.dmg(x.target, 5, { aim: 0.04 }); if (r.hit) x.status(x.target, 'bleed', 2); } },
        { name: 'A Little Off the Top', w: 1, cd: 3, target: 'enemy', fx: 'debuff', run: x => x.status(x.target, 'vuln', 0, 2) }] });

    const T = [
      { path: 'crusader', foe: 't_jj_boxer', art: 'jj_boxer', title: 'The Bare-Knuckle Champion', blurb: 'A crowd is betting on a prizefight behind the saloon.',
        text: 'The champion wipes blood from his knuckles and points at Jotaro. "You. The big quiet one in the funny coat. I\'ve been watching your shoulders. You hit like three men. Show me."',
        check: { stat: 'spin', dc: 13, label: 'Win the prizefight' }, duel: 'Step into the ring', decline: { label: 'Bet on him instead', text: 'He wins. You win. ($35.)', fx: g => g.money(35) } },
      { path: 'worldwithin', foe: 't_jj_watch', art: 'jj_watch', title: 'The Watchmaker\'s Shop', blurb: 'Every clock in a little shop has stopped at the same second.',
        text: '"Curious," says the old watchmaker, looking at Jotaro over his monocle. "Every clock in my shop stopped when you walked in. Just for a moment. You felt it too, didn\'t you?"',
        check: { stat: 'res', dc: 14, label: 'Listen for the stopped second' }, duel: '"Prove it, then" — he winds his watch', decline: { label: 'Buy a pocket watch', text: 'It never runs quite right. It is oddly calming. (Jotaro +2 RESOLVE.)', fx: g => g.statUp('jotaro', 'res', 2) } },
      { path: 'marinebio', foe: 't_jj_natural', art: 'jj_natural', title: 'The Naturalist\'s Boat', blurb: 'A riverboat professor is sorting jars of river creatures.',
        text: '"A starfish! In the Mississippi! Impossible." The professor turns to Jotaro, who has been staring at the jar for ten minutes. "You know something about these, young man. Tell me."',
        check: { stat: 'luck', dc: 13, label: 'Identify every specimen' }, duel: 'He insists on a practical demonstration', decline: { label: 'Help him catalogue the jars', text: 'A quiet afternoon. He gives you his spare tonic. (A Snake Oil and some XP.)', fx: g => { g.item('snakeoil'); g.xp(15); } } },
      { path: 'cdiamond', foe: 't_jj_tinker', art: 'jj_tinker', title: 'The Tinker\'s Wagon', blurb: 'A travelling mender is surrounded by broken things.',
        text: 'The tinker watches Josuke fix a shattered plate with one touch. He drops his hammer. "Forty years I\'ve been mending pots, son. Teach me that and I\'ll teach you what I know about people."',
        check: { stat: 'res', dc: 13, label: 'Mend everything in the wagon' }, duel: '"Or show me what else those fists do"', decline: { label: 'Fix his wagon wheel and ride on', text: 'He waves you off with a sack of supplies. (Party heals 30%.)', fx: g => g.healAll(0.3) } },
      { path: 'homing', foe: 't_jj_glass', art: 'jj_glass', title: 'The Glassblower', blurb: 'A glassworks furnace glows by the road.',
        text: 'Ada Glassworth drops a vase on purpose, and Josuke fixes it before it lands. The shards leap back into place. She grins. "Now do that with the vase on the other side of a man."',
        check: { stat: 'aim', dc: 14, label: 'Thread the shards through a target' }, duel: 'She throws the first bottle', decline: { label: 'Buy a crate of bottles', text: 'She throws in a canteen. ($-10, a Canteen.)', fx: g => { g.money(-10); g.item('canteen'); } } },
      { path: 'greatdays', foe: 't_jj_barber', art: 'jj_barber', title: 'The Barber of Chicago', blurb: 'A barber is sharpening a razor in his doorway.',
        text: 'The barber looks up at Josuke\'s head and laughs. "Madonna! What died on your head, boy? Sit down, I\'ll take that sad old bird\'s nest off for free." Josuke goes very, very quiet.',
        check: { stat: 'grit', dc: 14, label: '"...Say that again."' }, duel: 'DORARARARA', decline: { label: 'Walk away (take a deep breath)', text: 'It takes real strength. (Josuke +2 GRIT.)', fx: g => g.statUp('josuke', 'grit', 2) } },
    ];
    T.forEach(t => {
      const P = SBR.PATHS[t.path], who = P.char, short = SBR.CHARS[who].short;
      SBR.EVENTS.push({
        id: 'path_' + t.path, acts: P.acts, type: 'trainer', title: t.title, blurb: t.blurb, icon: 'train', weight: 3, once: true, pace: -4, art: t.art,
        pathOffer: t.path, cond: g => g.canTakePath(who), text: t.text,
        html: `${t.text}<span class="ev-path" style="--pc:${P.color}"><b>Path: ${P.name}</b> (${short}) — ${P.desc}<br><i>${P.passive}</i></span>`,
        choices: [
          { label: `${t.check.label} (${short}'s ${SBR.STATS[t.check.stat].name})`, check: { stat: t.check.stat, dc: t.check.dc, who },
            ok: { text: `${short} walks the Path of the ${P.name}.`, fx: g => g.takePath(t.path) },
            fail: { text: 'Not good enough. Not yet. The trainer turns away — but offers a duel instead.', fight: { enemies: [t.foe], elite: true, after: g => g.takePath(t.path) } } },
          { label: t.duel, ok: { text: 'Fists settle it.', fight: { enemies: [t.foe], elite: true, after: g => g.takePath(t.path) } } },
          { label: t.decline.label, ok: { text: t.decline.text, fx: t.decline.fx } },
        ],
      });
      const fav = who === 'jotaro' ? 'racers' : 'law';
      SBR.CONSEQ['path_' + t.path + ':0'] = { rep: { [fav]: 1 }, deed: `${short} earned the Path of the ${P.name}.` };
      SBR.CONSEQ['path_' + t.path + ':0:fail'] = { rep: { [fav]: 1 }, deed: `${short} failed a trainer’s test for the ${P.name}.` };
      SBR.CONSEQ['path_' + t.path + ':1'] = { rep: { [fav]: 1 }, deed: `${short} won the Path of the ${P.name} in a fight.` };
      SBR.CONSEQ['path_' + t.path + ':2'] = { rep: { [fav]: -1 }, deed: `${short} turned down the ${P.name} trainer.`, later: ['trainer_rival', 5, 10] };
    });
  })();

  /* ================= 7. Unlocks: quests, not Race Points ================= */
  Object.assign(SBR.ACHIEVEMENTS, {
    jj_jotaro: { name: 'Yare Yare Daze', desc: 'Beat a boss in Act II or later without a single rider falling — or defeat DIO.', rp: 30, unlockLead: 'jotaro' },
    jj_josuke: { name: 'Crazy Diamond', desc: 'Bring a rider back from below 10% HP to full health in the same battle.', rp: 30, unlockLead: 'josuke' },
  });

  /* ================= 8. Story: why they're in 1890 ================= */
  (() => {
    const S = SBR.STORY;
    const intro = {
      jotaro: [
        { narr: 'That same morning a dust devil tears through the stables. When it settles, a tall young man in a long black school coat is standing where it was: clothes from a century that has not happened yet.' },
        { who: 'jotaro', text: '...An old arrowhead scratched my hand in Cairo. Now there are horses everywhere. Yare yare daze.' },
        { who: 'steven', text: 'You there, the tall fellow! Entry fee paid? Splendid! One more rider for the STEEL BALL RUN!' },
        { who: 'jotaro', text: 'A race across a continent, with a corpse nobody should be carrying. Fine. I\'ll ride.' },
      ],
      josuke: [
        { narr: 'Behind the registration tent a boy in a navy school coat is arguing with a horse. His hair stands a full foot above his head.' },
        { who: 'josuke', text: 'I touched ONE weird arrowhead in Grandpa\'s evidence box and now it\'s 1890?! Great. Just great.' },
        { who: 'steven', text: 'Young man! That, ah, magnificent hairdo will need a larger hat. Are you entering?' },
        { who: 'josuke', text: '...Did you just say something about my hair? No? Good. Then yeah. I\'m entering.' },
      ],
    };
    const pro = S.prologue;
    if (pro) {
      pro.leadLines = pro.leadLines || {};
      Object.entries(intro).forEach(([k, lines]) => { pro.leadLines[k] = pro.lines.slice(0, 2).concat(lines, pro.lines.slice(3)); });
    }
    const a1 = S.act1_intro;
    if (a1) {
      a1.leadLines = a1.leadLines || {};
      a1.leadLines.jotaro = [
        { narr: 'Gyro took the 1st Stage, and was immediately penalised for endangering Sandman. The 2nd Stage stretches 1,200 kilometres across the Arizona Desert.' },
        { who: 'gyro', text: 'Oi, the giant in the funny coat. That thing standing behind you. You can see it too, eh? Nyo-ho~.' },
        { who: 'jotaro', text: 'Star Platinum. ...You two are the only people here who looked at it.' },
        { who: 'johnny', text: 'Then ride with us. The desert kills people who ride it alone.' },
        { narr: 'JOHNNY and GYRO ride with you. Each stage, choose an encounter.' },
      ];
      a1.leadLines.josuke = [
        { narr: 'Gyro took the 1st Stage, and was immediately penalised for endangering Sandman. The 2nd Stage stretches 1,200 kilometres across the Arizona Desert.' },
        { who: 'josuke', text: 'Hey! You\'re the guy with the balls — uh. The STEEL balls. You fixed that kid\'s legs, right? I fix stuff too.' },
        { who: 'gyro', text: 'Nyo-ho-ho! Nice hat.' },
        { who: 'josuke', text: '...It\'s not a hat.' },
        { who: 'johnny', text: 'Gyro. Stop talking. Just... ride with us, Josuke. Please.' },
        { narr: 'JOHNNY and GYRO ride with you. Each stage, choose an encounter.' },
      ];
    }
  })();

  /* ================= 9. Hooks into files that load later ================= */
  function install() {
    if (SBR._jjInstalled) return; SBR._jjInstalled = true;

    // Stand figure beside them, and the Drifter's Star Platinum / Crazy Diamond choreography
    if (SBR.stands && SBR.stands.keyFor) {
      // stands.keyFor may already be wrapped by standfx; wrap whatever is there
      const kf = SBR.stands.keyFor;
      SBR.stands.keyFor = function (u, abId) { const k = kf.apply(this, arguments); if (u && u.side === 'party') { if (u.id === 'jotaro') return 'star_platinum'; if (u.id === 'josuke') return 'crazy_diamond'; } return k; };
    }
    if (SBR.standfx && SBR.standfx.MOVES) {
      const M = SBR.standfx.MOVES;
      const alias = { jot_ora: 'ora_rush', jot_rush: 'ora_rush', jot_barrage: 'ora_rush', jot_final: 'ora_rush', jot_finger: 'star_finger', jot_world: 'sp_the_world',
        jos_dora: 'dora_rush', jos_beatdown: 'dora_rush', jos_fuse: 'dora_rush', jos_fix: 'cd_restore', jos_mend: 'cd_restore', jos_restore: 'cd_restore', jos_together: 'cd_restore', jos_reset: 'cd_restore',
        jos_shards: 'cd_reverse', jos_blood: 'cd_reverse', jos_bullet: 'cd_reverse' };
      Object.entries(alias).forEach(([id, src]) => { if (M[src] && !M[id]) M[id] = M[src]; });
    }

    // race powers
    if (SBR.racePowers) {
      const base = SBR.racePowers;
      const POW = {
        jotaro: m => ({ id: 'jj_timestop', who: 'jotaro', name: 'Star Platinum: The World', glyph: '止', color: '#6a4ab8', desc: `Stop time for ${m.level >= 9 ? 3 : 2} seconds. Only you move.`, use: Ax => Ax.freeze(m.level >= 9 ? 3 : 2, 'STAR PLATINUM: THE WORLD!') }),
        josuke: () => ({ id: 'jj_restore', who: 'josuke', name: 'Crazy Diamond', glyph: '治', color: '#d878b0', desc: 'Fix your horse: +70 stamina, and any stumble or rope is undone.', use: Ax => { Ax.stamina(70); Ax.S.stumble = 0; Ax.S.slow = 0; } }),
      };
      SBR.racePowers = r => {
        const out = base(r);
        (r.party || []).filter(m => m.hp > 0 && POW[m.id]).forEach(m => { const p = POW[m.id](m); if (!out.some(o => o.id === p.id)) out.splice(H(out), 0, p); });
        return out.slice(0, 4);
      };
      const H = out => (out[0] && out[0].id === 'horse' ? 1 : 0);
    }

    // Legacy trees
    if (SBR.trees && SBR.trees.TREES) installTrees();

    // combat: passives, statuses, capstones, quest tracking
    installCombat();
  }

  function installTrees() {
    const TR = SBR.trees, IC = TR.ICON, st = `stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
    Object.assign(IC, {
      jj_cap: () => `<path d="M8 32 Q6 10 24 8 Q40 9 42 24 L41 32 Q24 27 8 32Z" fill="#1c2624" ${st}/><path d="M38 14 Q44 16 46 22 L41 22 L45 28 L40 27Z" fill="#15151c" ${st} stroke-width="1.6"/><rect x="18" y="14" width="12" height="7" rx="1.6" fill="#f2c14e" ${st} stroke-width="1.4"/><path d="M9 31 Q24 25 40 31 L38 36 Q24 31 11 36Z" fill="#12181a" ${st}/>`,
      jj_clock: () => `<circle cx="24" cy="26" r="16" fill="#fff3c0" ${st}/><circle cx="24" cy="26" r="12" fill="none" stroke="${INK}" stroke-width="1" opacity=".4"/><path d="M24 26V15M24 26l7 4" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><path d="M20 6h8v4h-8z" fill="#e8b020" ${st} stroke-width="1.6"/><circle cx="24" cy="26" r="2" fill="#c8323c"/>`,
      jj_star: () => `<path d="M24 5l5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1z" fill="#9a7ae8" ${st}/><path d="M24 12l2 6" stroke="#fff" stroke-width="1.6" opacity=".6"/>`,
      jj_starfish: () => `<path d="M24 5 Q27 18 42 18 Q30 25 36 40 Q24 31 12 40 Q18 25 6 18 Q21 18 24 5Z" fill="#e8742a" ${st}/>${[[24, 14], [33, 21], [29, 32], [19, 32], [15, 21]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#fff3c0"/>`).join('')}`,
      jj_cdheart: () => `<path d="${heartD(24, 26, 12)}" fill="#e89ac8" ${st}/><path d="M16 22 l4 -4 M30 18 l4 4" stroke="#8adcff" stroke-width="2.4" stroke-linecap="round"/><path d="M20 20 Q22 16 26 17" fill="none" stroke="#fff" stroke-width="1.6" opacity=".6"/>`,
      jj_pomp: () => `<path d="M8 36 Q4 16 18 8 Q30 2 40 10 Q46 18 40 30 Q30 24 18 28 Q12 30 8 36Z" fill="#231d34" ${st}/><path d="M12 24 Q22 14 38 16 M12 16 Q22 8 34 9" fill="none" stroke="#8a7ae8" stroke-width="1.6"/><path d="M18 10 Q26 6 32 7" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>`,
      jj_shard: () => `<path d="M24 4 L34 18 L28 44 L18 30 Z" fill="#bfeeff" ${st}/><path d="M8 20 L16 16 L14 28Z M40 30 L44 38 L34 38Z" fill="#8adcff" ${st} stroke-width="1.6"/><path d="M24 8 L26 30" stroke="#fff" stroke-width="1.4" opacity=".7"/>`,
    });
    const SHAPE = [{ tier: 0, col: 1, req: [] }, { tier: 1, col: 0, req: [0] }, { tier: 1, col: 2, req: [0] }, { tier: 2, col: 0, req: [1] }, { tier: 2, col: 2, req: [2] }, { tier: 3, col: 1, req: [3, 4], any: true }, { tier: 4, col: 1, req: [5], cap: true }];
    const COST = [10, 18, 18, 30, 30, 45, 70];
    const TREES = {
      jotaro: { stand: () => 'star_platinum', kana: '星', branches: [
        { key: 'star', name: 'Star Platinum', kana: '星', color: '#7a5ad0', nodes: [
          ['Precise Fists', 'fist', { stats: { spin: 1 }, bonus: { standDmg: 0.05 } }],
          ['Faster Than Light', 'bolt', { bonus: { init: 3 } }],
          ['Tough Guy', 'heart', { hp: 6 }],
          ['Eagle Eyes', 'eye', { stats: { aim: 1 }, bonus: { crit: 0.04 } }],
          ['ORA Drill', 'fist', { ability: 'jot_rush' }],
          ['Stand Power', 'jj_star', { bonus: { standDmg: 0.08, critDmg: 0.1 } }],
          ['ORA ORA ORA!', 'jj_cap', { cap: 'jt_ora', text: 'Jotaro\'s basic <b>ORA ORA</b> throws a 4th punch, and the last one Weakens the target for 1 turn.' }],
        ] },
        { key: 'time', name: 'Stopped Time', kana: '時', color: '#e8b020', nodes: [
          ['Five Seconds', 'jj_clock', { bonus: { init: 2 } }],
          ['Held Breath', 'shield', { res: { stand: -0.06 } }],
          ['Reflexes', 'bolt', { bonus: { dodge: 0.03 } }],
          ['Tick, Tock', 'jj_clock', { bonus: { energyStart: 1 } }],
          ['Frozen Instant', 'jj_clock', { ability: 'jot_stop1' }],
          ['Heart That Won\'t Stop', 'heart', { hp: 8 }],
          ['Time Stops for Me', 'jj_clock', { cap: 'jt_time', text: 'Once per battle, a blow that would drop Jotaro <b>stops time instead</b>: he stays up at 1 HP and every enemy is Time Stopped for its next turn.' }],
        ] },
        { key: 'sea', name: 'Marine Biologist', kana: '海', color: '#3a8ad0', nodes: [
          ['Field Notes', 'map', { check: 1 }],
          ['Sea Legs', 'horseshoe', { stats: { ride: 1 }, res: { cold: -0.1 } }],
          ['Starfish Grip', 'jj_starfish', { bonus: { regen: 1 } }],
          ['Spot the Tell', 'eye', { bonus: { crit: 0.04 } }],
          ['Calm Waters', 'shield', { stats: { res: 1 }, immune: ['fear'] }],
          ['Deductive Mind', 'eye', { check: 1, bonus: { critDmg: 0.1 } }],
          ['Stand Detective', 'jj_starfish', { cap: 'jt_det', text: 'Jotaro starts every battle with <b>Star Catch</b> (the first enemy hit on him is caught and punched back), and the toughest enemy is <b>Scanned</b> for 2 turns.' }],
        ] },
      ] },
      josuke: { stand: () => 'crazy_diamond', kana: '治', branches: [
        { key: 'cd', name: 'Crazy Diamond', kana: '治', color: '#e89ac8', nodes: [
          ['Gentle Touch', 'jj_cdheart', { bonus: { heal: 0.06 } }],
          ['Steady Hands', 'jj_cdheart', { stats: { res: 1 } }],
          ['Diamond Knuckles', 'fist', { bonus: { standDmg: 0.06 } }],
          ['Patch Job', 'jj_cdheart', { bonus: { heal: 0.08 } }],
          ['Rubble Armour', 'shield', { res: { phys: -0.06, bullet: -0.04 } }],
          ['Good as New', 'heart', { hp: 8 }],
          ['Better Than New', 'jj_cdheart', { cap: 'js_cd', text: 'Every ally Josuke heals also gains <b>Guard</b> and a 4-point <b>Shield</b>: fixed stronger than it was.' }],
        ] },
        { key: 'home', name: 'Homing Restoration', kana: '弾', color: '#8adcff', nodes: [
          ['Glass in the Pocket', 'jj_shard', { stats: { aim: 1 } }],
          ['Blood Sample', 'drop', { bonus: { bleedOnBasic: 0.2 } }],
          ['Keen Aim', 'eye', { bonus: { crit: 0.03 } }],
          ['Shatter', 'jj_shard', { bonus: { standDmg: 0.08 } }],
          ['Fragments', 'jj_shard', { ability: 'jos_shards' }],
          ['Tracking Shot', 'eye', { stats: { aim: 1 }, bonus: { critDmg: 0.1 } }],
          ['It Always Comes Back', 'jj_shard', { cap: 'js_home', text: 'Josuke\'s attacks <b>cannot be dodged</b>: whatever he breaks flies back to where it belongs.' }],
        ] },
        { key: 'hair', name: 'Pompadour', kana: '髪', color: '#6a4ab0', nodes: [
          ['Hair Grease', 'jj_pomp', { stats: { grit: 1 } }],
          ['Delinquent Pride', 'fist', { bonus: { physDmg: 0.06, standDmg: 0.04 } }],
          ['Thick Skull', 'heart', { hp: 6 }],
          ['Hot Temper', 'bolt', { bonus: { crit: 0.04 } }],
          ['Morioh Tough', 'shield', { stats: { grit: 1 }, res: { phys: -0.06 } }],
          ['Great Days', 'jj_pomp', { bonus: { dmg: 0.05 } }],
          ['Say That Again?!', 'jj_pomp', { cap: 'js_hair', text: 'A <b>critical hit</b> on Josuke sends him into <b>Pompadour Rage</b> for 2 turns, and while enraged his <b>DORARARA</b> throws 2 more punches.' }],
        ] },
      ] },
    };
    Object.entries(TREES).forEach(([cid, T]) => {
      if (TR.TREES[cid]) return;
      TR.TREES[cid] = T; TR.NODES[cid] = {};
      T.branches.forEach(B => {
        B.list = B.nodes.map(([name, icon, fx], i) => {
          const S = SHAPE[i];
          const n = { id: `${cid}_${B.key}_${i}`, cid, branch: B.key, idx: i, name, icon, fx, tier: S.tier, col: S.col, any: !!S.any, cap: !!S.cap, cost: COST[i] };
          n.req = S.req.map(r => `${cid}_${B.key}_${r}`);
          TR.NODES[cid][n.id] = n;
          return n;
        });
      });
      if (!TR.RIDERS.includes(cid)) TR.RIDERS.push(cid);
    });
  }

  function installCombat() {
    const P = SBR.Combat.prototype;
    const cap = (u, c) => !!(u && u.side === 'party' && !u.summon && SBR.trees && SBR.trees.NODES[u.id] && SBR.trees.bonusFor(u.id).caps.has(c));
    const isRider = u => u && u.side === 'party' && !u.summon && !u.removed;

    const startRound = P.startRound;
    P.startRound = function () {
      const r = startRound.apply(this, arguments);
      this.party().forEach(u => { if (!u.dead) u._jjRoundHp = u.hp; });
      if (this.round === 1) {
        this.party().forEach(u => {
          u._jjStartHp = u.hp;
          if (u.id === 'jotaro' || u.id === 'josuke') SBR.meta.seen.allies[u.id] = true;
          if (!u.dead && cap(u, 'jt_det')) {
            this.addStatus(u, 'jj_catch', 0, 99, true);
            const top = this.enemies().slice().sort((a, b) => b.hp - a.hp)[0];
            if (top) this.addStatus(top, 'marked', 0, 2);
          }
        });
      }
      return r;
    };

    const damage = P.damage;
    P.damage = function (src, tgt, base, scale, opts = {}, ability = null) {
      // Star Catch: the next enemy hit is caught and returned
      if (src && tgt && src.side !== tgt.side && src.side === 'enemy' && !tgt.dead && this.has(tgt, 'jj_catch') && !(opts.pierce || (ability && ability.pierce))) {
        this.removeStatus(tgt, 'jj_catch');
        this.push({ t: 'float', uid: tgt.uid, text: 'CAUGHT!', cls: 'block big' });
        if (!src.dead) damage.call(this, tgt, src, 6, { spin: 0.04 }, { label: 'ORA!', noDodge: true }, null);
        return { hit: false, dodged: true };
      }
      if (src && src.id === 'josuke' && cap(src, 'js_home') && !opts.noDodge) opts = Object.assign({}, opts, { noDodge: true });
      const r = damage.call(this, src, tgt, base, scale, opts, ability);
      if (r && r.crit && tgt && tgt.id === 'josuke' && !tgt.dead && isRider(tgt) && cap(tgt, 'js_hair')) this.addStatus(tgt, 'jj_rage', 0, 2);
      return r;
    };

    const applyHp = P.applyHp;
    P.applyHp = function (tgt) {
      const r = applyHp.apply(this, arguments);
      if (isRider(tgt) && !tgt.dead && tgt.hp > 0) {
        if (tgt.hp < tgt.maxHp * 0.1) tgt._jjLow = true;
        if (tgt.id === 'josuke' && tgt.ref && tgt.ref.path === 'greatdays' && !tgt._jjRaged && tgt.hp < tgt.maxHp / 2) {
          tgt._jjRaged = true; this.addStatus(tgt, 'jj_rage', 0, 2);
          this.push({ t: 'float', uid: tgt.uid, text: 'MY HAIR?!', cls: 'debuff big' });
        }
      }
      return r;
    };

    const heal = P.heal;
    P.heal = function (src, tgt, base, scale) {
      if (src && src.id === 'josuke' && src.side === 'party' && tgt) {
        if (tgt === src) {
          if (!src._jjNoSelf) { src._jjNoSelf = true; this.push({ t: 'float', uid: src.uid, text: 'CAN\'T FIX HIMSELF', cls: 'miss' }); }
          return 0;
        }
        base *= 1.25;
      }
      const got = heal.call(this, src, tgt, base, scale);
      if (src && src.id === 'josuke' && tgt && tgt !== src && !tgt.dead && cap(src, 'js_cd')) { this.addStatus(tgt, 'guard', 0, 2); this.addStatus(tgt, 'shield', 4); }
      if (isRider(tgt) && tgt._jjLow && tgt.hp >= tgt.maxHp) { tgt._jjLow = false; SBR.game.achieve('jj_josuke'); }
      return got;
    };

    const onDeath = P.onDeath;
    P.onDeath = function (u, src) {
      if (isRider(u) && !u.dead && u.hp <= 0 && cap(u, 'jt_time') && !u._jjTime) {
        u._jjTime = true; u.hp = 1;
        this.push({ t: 'revive', uid: u.uid, hp: 1 });
        this.push({ t: 'float', uid: u.uid, text: 'STAR PLATINUM: THE WORLD!', cls: 'buff big' });
        this.push({ t: 'timestop', on: true });
        this.enemies().forEach(e => this.addStatus(e, 'timestop', 0, 1));
        this.push({ t: 'timestop', on: false });
        return;
      }
      const r = onDeath.apply(this, arguments);
      if (isRider(u) && u.dead) this._jjFell = true;
      return r;
    };

    const checkEnd = P.checkEnd;
    P.checkEnd = function () {
      const r = checkEnd.apply(this, arguments);
      if (this.result === 'win' && !this._jjWon) {
        this._jjWon = true;
        const run = SBR.run;
        if (this.opts && this.opts.boss && run && run.act >= 2 && !this._jjFell) SBR.game.achieve('jj_jotaro');
        if (this.units.some(e => e.side === 'enemy' && e.id === 'sb_dio')) SBR.game.achieve('jj_jotaro');
      }
      return r;
    };

    const runPicked = P.runPicked;
    P.runPicked = function (u, ab, lvl, target) {
      const r = runPicked.apply(this, arguments);
      if (u && !u.dead && !this.result && target && !target.dead && isRider(u)) {
        if (ab === AB.jot_ora && cap(u, 'jt_ora')) { this.damage(u, target, 2, { spin: 0.03 }, {}, ab); if (!target.dead) this.addStatus(target, 'weak', 0, 1); }
        if (ab === AB.jos_dora && cap(u, 'js_hair') && this.has(u, 'jj_rage')) for (let i = 0; i < 2 && !target.dead; i++) this.damage(u, target, 2, { spin: 0.03 }, {}, ab);
      }
      return r;
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
})();
