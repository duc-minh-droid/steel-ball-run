/* Legacy skill trees: a permanent tree for each lead rider (Johnny, Gyro, Mountain Tim, Hot Pants), bought with Race Points.
   Modelled on An Average Campaign's per-class trees: three branches per rider, prerequisites, a capstone per branch
   that changes how the rider plays, a paid respec, and Legacy ranks (a small stacking bonus once a tree is complete).
   Purchases live in SBR.meta.trees = { johnny: ['j_tusk_0', ...] } and ranks in SBR.meta.treeRanks.
   Bonuses apply only when that rider leads the run (allies ride without their Legacy):
     - stats / bonus keys / resistances   -> wrapped SBR.equipBonus (combat reads them like gear)
     - granted abilities                  -> wrapped SBR.extraAbilities
     - skill-check bonus                  -> wrapped SBR.bonus().check while the rider is in the party
     - battle HP, starting statuses and capstone triggers -> SBR.Combat subclass + prototype wraps (combat.js is untouched)
   UI: the Saloon's "Legacy" tab (SBR.trees.tab) and a button on the registration screen (SBR.trees.setupButton). */
'use strict';
SBR.trees = (() => {
  const { el } = SBR.util;
  const K = '#1a1020';
  const st = `stroke="${K}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
  const RIDERS = ['johnny', 'gyro', 'mountaintim', 'hotpants'];

  /* ---------------- node icons (48×48, thick ink) ---------------- */
  const shine = (x, y, r = 3) => `<ellipse cx="${x}" cy="${y}" rx="${r * 0.6}" ry="${r}" fill="#fff" opacity=".7" transform="rotate(30 ${x} ${y})"/>`;
  const ICON = {
    ball: (c = '#f2c14e') => `<circle cx="24" cy="24" r="15" fill="${c}" ${st}/><path d="M13 20q11-8 22 0M11 27q13 7 26 0" fill="none" stroke="${K}" stroke-width="1.8"/><circle cx="24" cy="24" r="4" fill="#fff3c0" ${st} stroke-width="1.6"/>${shine(18, 16, 3)}`,
    twin: () => `<circle cx="17" cy="27" r="11" fill="#d0d4e0" ${st}/><circle cx="31" cy="19" r="11" fill="#f2c14e" ${st}/><path d="M23 16q8-5 16 0M9 25q8-4 16 0" fill="none" stroke="${K}" stroke-width="1.5"/>${shine(27, 14, 2.4)}`,
    nail: (c = '#b070e0') => `<path d="M24 4l7 10-3 26-4 6-4-6-3-26z" fill="${c}" ${st}/><path d="M17 14h14" stroke="${K}" stroke-width="2"/><path d="M24 16v22" stroke="#fff" stroke-width="1.6" opacity=".6"/>`,
    storm: () => [[-18, 13], [0, 24], [18, 35]].map(([r, x]) => `<g transform="translate(${x - 24} 0) rotate(${r} 24 30)"><path d="M24 8l5 7-2 19-3 5-3-5-2-19z" fill="#b070e0" ${st} stroke-width="1.8"/></g>`).join('') + `<path d="M6 42q18-6 36 0" stroke="#f2c14e" stroke-width="3" fill="none"/>`,
    horseshoe: (c = '#c8c8d0') => `<path d="M12 40V22a12 12 0 0 1 24 0v18h-7V22a5 5 0 0 0-10 0v18z" fill="${c}" ${st}/>${[[15, 34], [15, 26], [33, 34], [33, 26]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="${K}"/>`).join('')}`,
    rope: () => `<ellipse cx="24" cy="20" rx="15" ry="10" fill="none" stroke="${K}" stroke-width="6"/><ellipse cx="24" cy="20" rx="15" ry="10" fill="none" stroke="#d8a860" stroke-width="3" stroke-dasharray="4 2"/><path d="M28 30q4 8-2 14" fill="none" stroke="${K}" stroke-width="6" stroke-linecap="round"/><path d="M28 30q4 8-2 14" fill="none" stroke="#d8a860" stroke-width="3" stroke-linecap="round"/>`,
    drop: (c = '#e8508a') => `<path d="M24 5Q12 22 12 30a12 12 0 0 0 24 0Q36 22 24 5z" fill="${c}" ${st}/><path d="M18 30q2 6 8 6" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>${shine(19, 26, 3)}`,
    cross: (c = '#ffd84a') => `<path d="M20 4h8v10h10v8H28v22h-8V22H10v-8h10z" fill="${c}" ${st}/><circle cx="24" cy="18" r="3" fill="#fff" ${st} stroke-width="1.4"/>`,
    spiral: () => `<rect x="5" y="11" width="38" height="26" fill="#fff3c0" ${st}/><path d="M28 11v26M28 27h15M34 27v-16" stroke="${K}" stroke-width="1.2" opacity=".5"/><path d="M28 37a16 16 0 0 1-16-16 10 10 0 0 1 10-10 6 6 0 0 1 6 6 4 4 0 0 1-4 4" fill="none" stroke="#e8a83a" stroke-width="3"/>`,
    star: () => `<circle cx="24" cy="24" r="17" fill="#c8a040" ${st}/><path d="M24 11l3.6 8 8.4.6-6.4 5.6 2 8.4L24 29l-7.6 4.6 2-8.4-6.4-5.6 8.4-.6z" fill="#fff3c0" ${st} stroke-width="1.6"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${(24 + Math.sin(a * Math.PI / 180) * 17).toFixed(1)}" cy="${(24 - Math.cos(a * Math.PI / 180) * 17).toFixed(1)}" r="2.6" fill="#c8a040" ${st} stroke-width="1.4"/>`).join('')}`,
    gun: () => SBR.icons.P.revolver('#8a8a9a', '#7a4a2a'),
    eye: () => `<path d="M4 24q20-18 40 0-20 18-40 0z" fill="#fff" ${st}/><circle cx="24" cy="24" r="8" fill="#3fb8a9" ${st}/><circle cx="24" cy="24" r="3.4" fill="${K}"/>${shine(21, 21, 1.8)}`,
    med: () => `<rect x="7" y="7" width="34" height="34" rx="6" fill="#fff" ${st}/><path d="M20 12h8v8h8v8h-8v8h-8v-8h-8v-8h8z" fill="#6ad08a" ${st} stroke-width="1.8"/>`,
    skull: () => `<path d="M6 12q4 6 10 6M42 12q-4 6-10 6" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round"/><path d="M6 12q4 6 10 6M42 12q-4 6-10 6" fill="none" stroke="#e8e0d0" stroke-width="2.6" stroke-linecap="round"/><path d="M14 16q10-6 20 0l-2 16-4 10h-8l-4-10z" fill="#e8e0d0" ${st}/><circle cx="19" cy="24" r="3" fill="${K}"/><circle cx="29" cy="24" r="3" fill="${K}"/><path d="M22 36h4" stroke="${K}" stroke-width="2"/>`,
    spur: () => `<path d="M6 30h18" stroke="${K}" stroke-width="6" stroke-linecap="round"/><path d="M6 30h18" stroke="#c8c8d0" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="30" r="9" fill="#f2c14e" ${st}/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M${(32 + Math.cos(a * Math.PI / 180) * 9).toFixed(1)} ${(30 + Math.sin(a * Math.PI / 180) * 9).toFixed(1)}L${(32 + Math.cos(a * Math.PI / 180) * 14).toFixed(1)} ${(30 + Math.sin(a * Math.PI / 180) * 14).toFixed(1)}" stroke="${K}" stroke-width="2.4"/>`).join('')}<circle cx="32" cy="30" r="3" fill="${K}"/>`,
    shield: (c = '#9fc7e8') => `<path d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10z" fill="${c}" ${st}/><path d="M24 10v28M14 20h20" stroke="${K}" stroke-width="1.6" opacity=".45"/>${shine(17, 15, 2.6)}`,
    hat: (c = '#8a5a3a') => `<path d="M4 32q20 8 40 0l-6-2H10z" fill="${c}" ${st}/><path d="M12 31l3-16q9-5 18 0l3 16q-12 4-24 0z" fill="${c}" ${st}/><path d="M13 26q11 3 22 0" stroke="#e8742a" stroke-width="3" fill="none"/>`,
    bolt: () => `<path d="M28 3L10 27h11l-4 18 20-26H26z" fill="#ffd84a" ${st}/>`,
    heart: () => `<path d="M24 42S6 30 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 13-18 25-18 25z" fill="#c8323c" ${st}/>${shine(15, 16, 3)}`,
    map: () => `<path d="M6 10l12-4 12 4 12-4v32l-12 4-12-4-12 4z" fill="#f6ecd8" ${st}/><path d="M18 6v32M30 10v32" stroke="${K}" stroke-width="1.4"/><path d="M10 28q6-8 10-2t12-8" fill="none" stroke="#c8323c" stroke-width="2" stroke-dasharray="3 2"/><path d="M33 17l4 4M37 17l-4 4" stroke="#c8323c" stroke-width="2.4"/>`,
    knife: () => SBR.icons.P.blade('#d0d4e0', '#6a4a2a'),
    cow: () => `<path d="M10 16q-6-2-6-8 5 1 9 6M38 16q6-2 6-8-5 1-9 6" fill="#f6ecd8" ${st}/><path d="M12 14h24l-2 18q-4 10-10 10T14 32z" fill="#8a5a3a" ${st}/><ellipse cx="24" cy="34" rx="8" ry="6" fill="#e8b0a0" ${st}/><circle cx="21" cy="34" r="1.4" fill="${K}"/><circle cx="27" cy="34" r="1.4" fill="${K}"/><circle cx="18" cy="22" r="2" fill="${K}"/><circle cx="30" cy="22" r="2" fill="${K}"/>`,
    fist: () => `<path d="M12 20q0-6 6-6h14q6 0 6 6v10q0 10-12 12-14-2-14-12z" fill="#e8c8a8" ${st}/><path d="M18 14v10M25 14v10M32 15v9M12 24h26" stroke="${K}" stroke-width="1.6"/>`,
    wheel: () => `<circle cx="24" cy="24" r="17" fill="none" stroke="${K}" stroke-width="7"/><circle cx="24" cy="24" r="17" fill="none" stroke="#b8844a" stroke-width="4"/>${[0, 60, 120].map(a => `<path d="M${(24 + Math.cos(a * Math.PI / 180) * 16).toFixed(1)} ${(24 + Math.sin(a * Math.PI / 180) * 16).toFixed(1)}L${(24 - Math.cos(a * Math.PI / 180) * 16).toFixed(1)} ${(24 - Math.sin(a * Math.PI / 180) * 16).toFixed(1)}" stroke="${K}" stroke-width="2.4"/>`).join('')}<circle cx="24" cy="24" r="4" fill="#f2c14e" ${st}/>`,
    crown: () => `<path d="M6 36l4-22 9 10 5-14 5 14 9-10 4 22z" fill="#f2c14e" ${st}/><rect x="6" y="36" width="36" height="6" fill="#e8a83a" ${st}/><circle cx="24" cy="30" r="3" fill="#c8323c" ${st} stroke-width="1.4"/>`,
    lock: () => `<rect x="12" y="22" width="24" height="18" rx="3" fill="#8a7a8a" ${st}/><path d="M17 22v-6a7 7 0 0 1 14 0v6" fill="none" stroke="${K}" stroke-width="4"/><circle cx="24" cy="31" r="2.6" fill="${K}"/>`,
  };
  const svg = (inner, cls = '') => `<svg class="tr-ico ${cls}" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  const icon = key => svg((ICON[key] || ICON.star)());

  /* ---------------- the trees ----------------
     Every branch uses the same shape: a root, two arms, a merge that needs EITHER arm, and a capstone.
        tier 0:        [0]
        tier 1:   [1]       [2]
        tier 2:   [3]       [4]
        tier 3:        [5]        (needs 3 OR 4)
        tier 4:       [CAP]                        */
  const SHAPE = [
    { tier: 0, col: 1, req: [] },
    { tier: 1, col: 0, req: [0] }, { tier: 1, col: 2, req: [0] },
    { tier: 2, col: 0, req: [1] }, { tier: 2, col: 2, req: [2] },
    { tier: 3, col: 1, req: [3, 4], any: true },
    { tier: 4, col: 1, req: [5], cap: true },
  ];
  const COST = [10, 18, 18, 30, 30, 45, 70]; // 221 per branch, 663 per rider
  const RANK_MAX = 5;
  const rankCost = r => 60 + 30 * r;
  const RANK_FX = { dmg: 0.03, hp: 4 };

  // [name, icon, effect]
  const TREES = {
    johnny: { stand: () => (SBR.meta.stats.bestAct >= 5 ? 'tusk4' : 'tusk2'), kana: '爪', branches: [
      { key: 'tusk', name: 'Tusk', kana: '牙', color: '#8a5ad0', nodes: [
        ['Fingernail Chamber', 'nail', { stats: { aim: 1 }, bonus: { bulletDmg: 0.05 } }],
        ['ACT1 Instinct', 'nail', { ability: 'nail_bullet' }],
        ['Horn-Shell Guard', 'shield', { bonus: { standDmg: 0.08 }, res: { stand: -0.06 } }],
        ['Spiral Chamber', 'spiral', { stats: { aim: 1 }, bonus: { crit: 0.04 } }],
        ['ACT2 Burrow', 'nail', { bonus: { standDmg: 0.06, critDmg: 0.1 } }],
        ['Ten Loaded Fingers', 'bolt', { bonus: { energyStart: 1 } }],
        ['ACT4: Nail Storm', 'storm', { ability: 'tree_nail_storm', cap: 'j_tusk', text: 'Every basic attack Johnny lands also leaves a <b>Nail Hole</b>.' }],
      ] },
      { key: 'jockey', name: 'Jockey', kana: '騎', color: '#6b5bd6', nodes: [
        ['Saddle Sense', 'horseshoe', { stats: { ride: 1 }, bonus: { dodge: 0.02 } }],
        ['Racing Lines', 'spur', { stats: { ride: 1 }, bonus: { init: 2 } }],
        ['Learned to Fall', 'heart', { hp: 6, res: { phys: -0.05 } }],
        ['Slow Dancer\'s Pace', 'horseshoe', { bonus: { dodge: 0.04 } }],
        ['Wrapped Reins', 'rope', { bonus: { regen: 1 }, res: { bullet: -0.06 } }],
        ['Jockey\'s Eye', 'eye', { check: 1, bonus: { crit: 0.03 } }],
        ['Slow Dancer\'s Rhythm', 'wheel', { cap: 'j_jockey', text: 'When Johnny <b>dodges</b> a hit he gains <b>+1 Energy</b> and fires a free counter-nail at the attacker (once per round).' }],
      ] },
      { key: 'spin', name: 'Spin', kana: '回', color: '#e8a83a', nodes: [
        ['Gyro\'s Lesson', 'ball', { stats: { spin: 1 }, bonus: { spinDmg: 0.05 } }],
        ['Rotation Drill', 'spiral', { start: { rotation: 1 } }],
        ['Golden Ratio Sight', 'eye', { bonus: { critDmg: 0.12 } }],
        ['Horse Power', 'horseshoe', { bonus: { spinDmg: 0.08 } }],
        ['ACT3: Wormhole', 'nail', { ability: 'wormhole' }],
        ['Infinite Study', 'spiral', { stats: { spin: 2 } }],
        ['Golden Spin Nail', 'ball', { ability: 'tree_golden_nail', start: { rotation: 1 }, cap: 'j_spin', text: 'Starts battles with 1 more Rotation.' }],
      ] },
    ] },
    gyro: { stand: () => 'ballbreaker', kana: '球', branches: [
      { key: 'ball', name: 'Steel Ball', kana: '鉄', color: '#3fb8a9', nodes: [
        ['Zeppeli Steel', 'ball', { bonus: { spinDmg: 0.05 } }],
        ['Nyo-ho Throw', 'ball', { stats: { spin: 1 }, bonus: { crit: 0.03 } }],
        ['Magnetic Return', 'spiral', { start: { rotation: 1 } }],
        ['Spin Scalpel', 'knife', { bonus: { critDmg: 0.12 } }],
        ['Iron Grip', 'fist', { stats: { grit: 1 }, bonus: { block: 0.04 } }],
        ['A Ball in Each Hand', 'bolt', { bonus: { energyStart: 1 } }],
        ['Twin Balls', 'twin', { cap: 'g_ball', text: '<b>Steel Ball</b> throws a second ball for 60% damage and builds 1 more Rotation.' }],
      ] },
      { key: 'med', name: 'Zeppeli Medicine', kana: '医', color: '#4aa86a', nodes: [
        ['Family Medicine', 'med', { bonus: { heal: 0.08 } }],
        ['Naples Anatomy', 'heart', { stats: { res: 1 } }],
        ['Thick Skin', 'shield', { hp: 8 }],
        ['Surgical Spin', 'med', { bonus: { heal: 0.1, regen: 1 } }],
        ['Executioner\'s Oath', 'cross', { immune: ['fear'], res: { stand: -0.05 } }],
        ['Bedside Manner', 'hat', { check: 1, stats: { res: 1 } }],
        ['Zeppeli Surgery', 'med', { ability: 'tree_zeppeli_surgery', cap: 'g_med', text: 'Whenever Gyro heals someone, he gains <b>1 Rotation</b>.' }],
      ] },
      { key: 'gold', name: 'Golden Rectangle', kana: '黄', color: '#d8a020', nodes: [
        ['1 : 1.618', 'spiral', { stats: { spin: 1 } }],
        ['The Saint\'s Eyes', 'eye', { ability: 'scan' }],
        ['Valkyrie\'s Stride', 'horseshoe', { stats: { ride: 1 }, bonus: { init: 2 } }],
        ['Natural Rotation', 'ball', { bonus: { spinDmg: 0.08 } }],
        ['Rider\'s Golden Stride', 'spur', { bonus: { dodge: 0.04 } }],
        ['Golden Spin', 'spiral', { ability: 'golden_spin' }],
        ['Ball Breaker', 'crown', { ability: 'ball_breaker', cap: 'g_gold', text: '<b>Golden Spin</b> always pierces every defence.' }],
      ] },
    ] },
    mountaintim: { stand: () => 'lonesome', kana: '縄', branches: [
      { key: 'rope', name: 'Oh! Lonesome Me', kana: '縄', color: '#e8742a', nodes: [
        ['Rope Stand', 'rope', { bonus: { standDmg: 0.06 } }],
        ['Split Body', 'rope', { bonus: { dodge: 0.03 } }],
        ['Lasso Reach', 'rope', { stats: { aim: 1 } }],
        ['Scattered Limbs', 'heart', { res: { bleed: -0.15, phys: -0.05 } }],
        ['Rope Corral', 'shield', { ability: 'rope_wall' }],
        ['Lonesome Cowboy', 'bolt', { bonus: { energyStart: 1 } }],
        ['Lonesome Puppeteer', 'rope', { ability: 'tree_rope_puppet', cap: 't_rope', text: 'While Tim has <b>Taunt</b>, he dodges 20% more.' }],
      ] },
      { key: 'sheriff', name: 'Sheriff', kana: '保', color: '#c8a040', nodes: [
        ['Tin Star', 'star', { stats: { aim: 1 } }],
        ['Quick Hands', 'spur', { bonus: { init: 3 } }],
        ['Winchester Oil', 'gun', { bonus: { bulletDmg: 0.08 } }],
        ['Deadeye', 'eye', { bonus: { crit: 0.05 } }],
        ['Posse Leader', 'hat', { check: 1, stats: { luck: 1 } }],
        ['Law and Order', 'star', { bonus: { critDmg: 0.15 } }],
        ['High Noon', 'gun', { cap: 't_sheriff', text: 'Tim always draws first in the opening round, and his first attack each battle is a <b>guaranteed crit</b> that cannot be dodged.' }],
      ] },
      { key: 'ranch', name: 'Rancher', kana: '牧', color: '#8a5a3a', nodes: [
        ['Cattle Hand', 'cow', { stats: { grit: 1 } }],
        ['Leather Chaps', 'shield', { res: { phys: -0.06, bullet: -0.04 } }],
        ['Trail Grub', 'heart', { hp: 8 }],
        ['Fence Post', 'shield', { bonus: { block: 0.05 } }],
        ['Branding Iron', 'fist', { bonus: { physDmg: 0.1 } }],
        ['Herd Instinct', 'cow', { stats: { grit: 1 }, bonus: { regen: 1 } }],
        ['Cattle Drive', 'cow', { ability: 'tree_stampede', cap: 't_ranch', text: 'Whenever Tim <b>blocks</b> a hit, he heals 4 HP.' }],
      ] },
    ] },
    hotpants: { stand: () => 'creamstarter', kana: '肉', branches: [
      { key: 'cream', name: 'Cream Starter', kana: '肉', color: '#e8508a', nodes: [
        ['Spray Nozzle', 'drop', { bonus: { heal: 0.06 } }],
        ['Flesh Seal', 'drop', { bonus: { regen: 1 } }],
        ['Muzzle Spray', 'drop', { bonus: { standDmg: 0.08 } }],
        ['Graft', 'heart', { stats: { res: 1 }, bonus: { heal: 0.06 } }],
        ['Flesh Disguise', 'shield', { ability: 'flesh_disguise' }],
        ['Living Tissue', 'heart', { hp: 6 }],
        ['Flesh Armour', 'drop', { cap: 'h_cream', text: 'Healing Hot Pants does past full HP becomes <b>Shield</b> on that ally (up to 15).' }],
      ] },
      { key: 'vatican', name: 'Vatican', kana: '聖', color: '#d8b020', nodes: [
        ['Penitent\'s Prayer', 'cross', { stats: { res: 1 } }],
        ['Rosary', 'cross', { res: { stand: -0.08 } }],
        ['Confessor\'s Aim', 'gun', { stats: { aim: 1 }, bonus: { bulletDmg: 0.05 } }],
        ['Sacred Rite', 'cross', { bonus: { holyDmg: 0.15 } }],
        ['Vatican Credentials', 'map', { check: 1, stats: { luck: 1 } }],
        ['Absolution', 'cross', { immune: ['blind'] }],
        ['Vatican Rite', 'cross', { ability: 'tree_vatican_rite', cap: 'h_vatican', text: 'Her <b>Revolver</b> fires blessed rounds: Holy damage, double against the undead.' }],
      ] },
      { key: 'hunter', name: 'Corpse Hunter', kana: '屍', color: '#8a1a2a', nodes: [
        ['Hunter\'s Map', 'map', { stats: { ride: 1 } }],
        ['Tracking', 'eye', { bonus: { crit: 0.04 } }],
        ['Relic Lore', 'skull', { res: { stand: -0.08 } }],
        ['Scavenger\'s Knife', 'knife', { bonus: { bleedOnBasic: 0.25 } }],
        ['Cold Resolve', 'shield', { stats: { grit: 1 }, res: { cold: -0.15 } }],
        ['Killer Instinct', 'skull', { bonus: { executeBonus: 0.2 } }],
        ['Relic Sense', 'eye', { cap: 'h_hunter', text: 'At the start of each battle the toughest enemy is <b>Scanned</b> for 2 turns, and Hot Pants deals +25% damage to Scanned targets.' }],
      ] },
    ] },
  };
  // expand into flat node lists with ids, positions, prerequisites and costs
  const NODES = {}; // cid -> { id: node }
  Object.entries(TREES).forEach(([cid, T]) => {
    NODES[cid] = {};
    T.branches.forEach(B => {
      B.list = B.nodes.map(([name, ico, fx], i) => {
        const S = SHAPE[i];
        const n = { id: `${cid}_${B.key}_${i}`, cid, branch: B.key, idx: i, name, icon: ico, fx, tier: S.tier, col: S.col, any: !!S.any, cap: !!S.cap, cost: COST[i] };
        n.req = S.req.map(r => `${cid}_${B.key}_${r}`);
        NODES[cid][n.id] = n;
        return n;
      });
    });
  });

  /* ---------------- state ---------------- */
  const meta = () => { const m = SBR.meta; m.trees = m.trees || {}; m.treeRanks = m.treeRanks || {}; return m; };
  const owned = cid => meta().trees[cid] || [];
  const has = (cid, id) => owned(cid).includes(id);
  const rank = cid => meta().treeRanks[cid] || 0;
  const all = cid => Object.values(NODES[cid] || {});
  const complete = cid => all(cid).length > 0 && all(cid).every(n => has(cid, n.id));
  const reqMet = n => !n.req.length || (n.any ? n.req.some(r => has(n.cid, r)) : n.req.every(r => has(n.cid, r)));
  const stateOf = n => (has(n.cid, n.id) ? 'owned' : reqMet(n) ? (meta().rp >= n.cost ? 'open' : 'poor') : 'locked');
  const spent = cid => owned(cid).reduce((s, id) => s + ((NODES[cid][id] || {}).cost || 0), 0);
  const respecFee = cid => Math.max(10, Math.round(spent(cid) * 0.1));

  /** everything a rider's tree adds up to (cached per purchase list) */
  const cache = {};
  const EMPTY = { stats: {}, bonus: {}, res: {}, immune: [], abilities: [], hp: 0, check: 0, start: {}, caps: new Set() };
  /** a Legacy only empowers the rider who starts the run: allies ride as they are */
  function bonusFor(cid) {
    if (!NODES[cid]) return null;
    if (SBR.run && SBR.run.lead && SBR.run.lead !== cid) return EMPTY;
    const key = owned(cid).join(',') + '|' + rank(cid);
    if (cache[cid] && cache[cid].key === key) return cache[cid].v;
    const v = { stats: {}, bonus: {}, res: {}, immune: [], abilities: [], hp: 0, check: 0, start: {}, caps: new Set() };
    const addTo = (o, src) => { for (const k in src || {}) o[k] = (o[k] || 0) + src[k]; };
    owned(cid).forEach(id => {
      const n = NODES[cid][id]; if (!n) return;
      const f = n.fx;
      addTo(v.stats, f.stats); addTo(v.bonus, f.bonus); addTo(v.res, f.res); addTo(v.start, f.start);
      if (f.immune) v.immune.push(...f.immune);
      if (f.ability && !v.abilities.includes(f.ability)) v.abilities.push(f.ability);
      v.hp += f.hp || 0; v.check += f.check || 0;
      if (f.cap) v.caps.add(f.cap);
    });
    const r = rank(cid);
    if (r) { v.bonus.dmg = (v.bonus.dmg || 0) + RANK_FX.dmg * r; v.hp += RANK_FX.hp * r; }
    cache[cid] = { key, v };
    return v;
  }
  const capOf = (u, cap) => !!(u && u.side === 'party' && !u.removed && NODES[u.id] && bonusFor(u.id).caps.has(cap));

  function buy(cid, id) {
    const n = NODES[cid] && NODES[cid][id], m = meta();
    if (!n || has(cid, id) || !reqMet(n) || m.rp < n.cost) return false;
    m.rp -= n.cost;
    m.trees[cid] = owned(cid).concat(id);
    SBR.saveMeta();
    return true;
  }
  function respec(cid) {
    const m = meta(), s = spent(cid);
    if (!s) return false;
    const fee = respecFee(cid);
    m.rp += Math.max(0, s - fee);
    m.trees[cid] = [];
    SBR.saveMeta();
    return s - fee;
  }
  function prestige(cid) {
    const m = meta(), r = rank(cid);
    if (!complete(cid) || r >= RANK_MAX || m.rp < rankCost(r)) return false;
    m.rp -= rankCost(r);
    m.treeRanks[cid] = r + 1;
    SBR.saveMeta();
    return true;
  }

  /* ---------------- text ---------------- */
  const BL = { dmg: 'damage', spinDmg: 'Spin damage', bulletDmg: 'Gunshot damage', standDmg: 'Stand damage', physDmg: 'Physical damage', holyDmg: 'Holy damage', coldDmg: 'Cold damage', bleedDmg: 'Bleed damage', crit: 'crit chance', critDmg: 'crit damage', dodge: 'dodge', block: 'block chance', heal: 'healing done', executeBonus: 'damage to enemies under 35% HP', bleedOnBasic: 'chance for basic attacks to cause Bleed', lifesteal: 'lifesteal' };
  function fxLines(f) {
    const out = [];
    Object.entries(f.stats || {}).forEach(([k, v]) => out.push(`<b style="color:${SBR.STATS[k].color}">+${v} ${SBR.STATS[k].name}</b>`));
    Object.entries(f.bonus || {}).forEach(([k, v]) => {
      if (BL[k]) out.push(`+${Math.round(v * 100)}% ${BL[k]}`);
      else if (k === 'regen') out.push(`Regen ${v} HP every turn`);
      else if (k === 'init') out.push(`+${v} initiative`);
      else if (k === 'energyStart') out.push(`+${v} Energy at the start of battle`);
    });
    if (f.res) out.push(Object.entries(f.res).map(([t, n]) => `<b style="color:${SBR.DMG[t].color}">${Math.round(-n * 100)}% less ${SBR.DMG[t].name}</b> taken`).join(', '));
    if (f.immune) out.push('Immune to ' + f.immune.map(s => SBR.STATUS[s].name).join(', '));
    if (f.hp) out.push(`+${f.hp} max HP in battle`);
    if (f.check) out.push(`+${f.check} to every skill check while riding with you`);
    if (f.start && f.start.rotation && !f.cap) out.push(`Starts battles with +${f.start.rotation} Rotation`);
    if (f.ability) { const A = SBR.ABILITIES[f.ability]; if (A) out.push(`${f.cap ? 'New ability' : 'Knows'} <b>${A.name}</b>${f.cap ? '' : ' from the first stage'}: <i>${A.desc(1)}</i>`); }
    if (f.text) out.push(f.text);
    return out;
  }
  function tipHtml(n) {
    const B = TREES[n.cid].branches.find(b => b.key === n.branch);
    const s = stateOf(n);
    const need = n.req.map(r => NODES[n.cid][r].name).join(n.any ? ' or ' : ' and ');
    const status = s === 'owned' ? '<span class="tr-tip-own">「OWNED」</span>' : s === 'locked' ? `<span class="tr-tip-lock">Needs ${need}</span>` : s === 'poor' ? `<span class="tr-tip-poor">${n.cost} RP (you have ${meta().rp})</span>` : `<span class="tr-tip-buy">Click to buy · ${n.cost} RP</span>`;
    return `<div class="tr-tip" style="--bc:${B.color}"><div class="tr-tip-h">${n.cap ? '<i>CAPSTONE</i> ' : ''}<b>${n.name}</b><small>${B.name}</small></div><ul>${fxLines(n.fx).map(l => `<li>${l}</li>`).join('')}</ul>${status}</div>`;
  }

  /* ---------------- hooks: gear-style bonuses, abilities, checks ---------------- */
  const baseEB = SBR.equipBonus;
  SBR.equipBonus = m => {
    const out = baseEB(m);
    const T = m && NODES[m.id] ? bonusFor(m.id) : null;
    if (!T) return out;
    for (const k in T.stats) out.stats[k] = (out.stats[k] || 0) + T.stats[k];
    for (const k in T.bonus) out.bonus[k] = (out.bonus[k] || 0) + T.bonus[k];
    if (Object.keys(T.res).length) { const r = out.bonus.res = Object.assign({}, out.bonus.res); for (const t in T.res) r[t] = (r[t] || 0) + T.res[t]; }
    if (T.immune.length) out.bonus.immune = (out.bonus.immune || []).concat(T.immune);
    return out;
  };
  const prevExtra = SBR.extraAbilities;
  SBR.extraAbilities = m => {
    const out = prevExtra ? (prevExtra(m) || []).slice() : [];
    const T = m && NODES[m.id] ? bonusFor(m.id) : null;
    if (T) T.abilities.forEach(id => { if (!out.includes(id)) out.push(id); });
    return out;
  };
  const baseBonus = SBR.bonus;
  SBR.bonus = () => {
    const b = baseBonus();
    const r = SBR.run;
    if (r && r.party) { let c = 0; r.party.forEach(m => { if (m && NODES[m.id]) c += bonusFor(m.id).check; }); if (c) b.check = (b.check || 0) + c; }
    return b;
  };

  /* ---------------- new abilities granted by capstones ---------------- */
  const A = SBR.ABILITIES;
  A.tree_nail_storm = { name: 'ACT4: Nail Storm', cost: 2, cd: 3, target: 'allEnemies', tags: ['gun', 'stand', 'spin'], fx: 'aoe',
    desc: l => `All ten nails at once. Hits every enemy for ${l > 1 ? 8 : 6} base and leaves a Nail Hole; enemies already carrying 3+ holes take chase damage.`,
    run(x) { x.enemies.forEach(e => { const r = x.dmg(e, x.lvl > 1 ? 8 : 6, { aim: 0.04, spin: 0.02 }); if (r.hit) { x.status(e, 'holed', 1); const h = x.stacks(e, 'holed'); if (h >= 3 && !e.dead) x.dmg(e, h * 2, {}, { noCrit: true, noDodge: true, label: 'CHASE' }); } }); } };
  A.tree_golden_nail = { name: 'Golden Spin Nail', cost: 3, cd: 4, target: 'enemy', tags: ['gun', 'stand', 'spin'], fx: 'golden', pierce: true,
    desc: () => 'A nail spun on the Golden Rectangle. Consumes all Rotation (+15% damage per stack) and adds 3 damage per Nail Hole on the target. Pierces.',
    run(x) { const rot = x.stacks(x.user, 'rotation'); if (rot) x.removeStatus(x.user, 'rotation'); const holes = x.stacks(x.target, 'holed'); x.dmg(x.target, (14 + holes * 3) * (1 + rot * 0.15), { spin: 0.05, aim: 0.03 }, { pierce: true, noDodge: true }); if (x.target && !x.target.dead) x.status(x.target, 'holed', 1); } };
  A.tree_zeppeli_surgery = { name: 'Zeppeli Surgery', cost: 2, cd: 3, target: 'allAllies', tags: ['spin', 'heal'], fx: 'heal',
    desc: l => `Stitches with spinning steel. Heals the whole party, removes ${l > 1 ? 2 : 1} debuff from each and gives Regen 2.`,
    run(x) { x.allies.forEach(a => { x.heal(a, 7, { res: 0.05, spin: 0.02 }); x.cleanse(a, x.lvl > 1 ? 2 : 1); x.status(a, 'regen', 0, 2); }); } };
  A.tree_rope_puppet = { name: 'Lonesome Puppet', cost: 2, cd: 3, target: 'enemy', tags: ['stand'], fx: 'rope',
    desc: l => `The rope runs through the target's body and pulls it apart. Hooked 2 turns (no natural Energy), ${l > 1 ? 65 : 50}% chance to stun. Tim gains Taunt.`,
    run(x) { const r = x.dmg(x.target, 7, { aim: 0.04, grit: 0.02 }); if (r.hit) { x.status(x.target, 'hooked', 0, 2); if (x.roll(x.lvl > 1 ? 0.65 : 0.5)) x.status(x.target, 'stun', 0, 1); } x.status(x.user, 'taunt', 0, 2); } };
  A.tree_stampede = { name: 'Cattle Drive', cost: 3, cd: 4, target: 'allEnemies', tags: [], fx: 'aoe', dtype: 'phys',
    desc: l => `Tim drives the herd through the enemy line. ${l > 1 ? 10 : 8} base Physical to every enemy (scales with Grit); the party gains Guard.`,
    run(x) { x.enemies.forEach(e => x.dmg(e, x.lvl > 1 ? 10 : 8, { grit: 0.05 })); x.allies.forEach(a => x.status(a, 'guard', 0, 2)); } };
  A.tree_vatican_rite = { name: 'Vatican Rite', cost: 2, cd: 3, target: 'enemy', tags: [], fx: 'spray', dtype: 'holy',
    desc: l => `Holy rite of the Vatican. ${l > 1 ? 13 : 10} base Holy damage; every ally loses 1 debuff and becomes Sanctified for 2 turns.`,
    run(x) { x.dmg(x.target, x.lvl > 1 ? 13 : 10, { res: 0.05, aim: 0.02 }); x.allies.forEach(a => { x.cleanse(a, 1); x.status(a, 'sanctified', 0, 2); }); } };
  const badge = (c, inner) => `<path d="M24 2l22 22-22 22L2 24z" fill="${c}" ${st}/><g transform="translate(24 24) scale(.62) translate(-24 -24)">${inner}</g>`;
  [['tree_nail_storm', '#3a2a5a', 'storm'], ['tree_golden_nail', '#1a1020', 'ball'], ['tree_zeppeli_surgery', '#2a5a3a', 'med'], ['tree_rope_puppet', '#5a2a10', 'rope'], ['tree_stampede', '#3a2a1a', 'cow'], ['tree_vatican_rite', '#5a4a10', 'cross']]
    .forEach(([id, c, ico]) => SBR.icons.define('ability', id, () => badge(c, ICON[ico]())));

  /* ---------------- hooks: battle HP, starting statuses and capstone triggers ---------------- */
  const Base = SBR.Combat;
  SBR.Combat = class extends Base {
    constructor(e, o) {
      super(e, o);
      this.party().forEach(u => {
        if (!NODES[u.id]) return;
        const T = bonusFor(u.id);
        if (T.hp) { u.maxHp += T.hp; if (!u.dead) u.hp = Math.min(u.maxHp, u.hp + T.hp); }
        if (T.start.rotation && !u.dead) this.addStatus(u, 'rotation', T.start.rotation, 0, true);
        if (T.caps.has('h_hunter') && !u.dead) {
          const top = this.enemies().slice().sort((a, b) => b.hp - a.hp)[0];
          if (top) { this.addStatus(top, 'marked', 0, 2, true); (this.storyNotes = this.storyNotes || []).push(`Relic Sense: Hot Pants has ${top.name}'s measure.`); }
        }
      });
    }
  };
  const P = SBR.Combat.prototype;

  // Twin Balls (Gyro) and Nail Storm's passive (Johnny): run inside the action, before the turn ends
  const runPicked = P.runPicked;
  P.runPicked = function (u, ab, lvl, target, picks) {
    const r = runPicked.call(this, u, ab, lvl, target, picks);
    if (u && u.side === 'party' && !u.dead && !this.result) {
      if (ab === A.steel_ball && capOf(u, 'g_ball')) {
        const t = target && !target.dead ? target : SBR.util.pick(this.foes(u));
        if (t) { this.damage(u, t, 5 * 0.6, { spin: 0.045 * 0.6 }, { label: '2ND BALL' }, ab); this.addStatus(u, 'rotation', 1); }
      }
      if (ab.cost === 0 && ab.target === 'enemy' && capOf(u, 'j_tusk') && target && !target.dead) this.addStatus(target, 'holed', 1);
    }
    return r;
  };

  const damage = P.damage;
  P.damage = function (src, tgt, base, scale, opts = {}, ability = null) {
    if (src && src.side === 'party') {
      if (capOf(src, 't_sheriff') && !src._highNoon) { src._highNoon = true; opts = Object.assign({}, opts, { forceCrit: true, noDodge: true, label: opts.label || 'HIGH NOON' }); }
      if (ability === A.golden_spin && capOf(src, 'g_gold')) opts = Object.assign({}, opts, { pierce: true });
      if (ability === A.hp_revolver && capOf(src, 'h_vatican')) opts = Object.assign({}, opts, { dtype: 'holy' });
      if (tgt && capOf(src, 'h_hunter') && this.has(tgt, 'marked')) base *= 1.25;
    }
    const r = damage.call(this, src, tgt, base, scale, opts, ability);
    if (r && tgt && src && src !== tgt) {
      // Slow Dancer's Rhythm: a dodge becomes Energy and a counter-nail
      if (r.dodged && capOf(tgt, 'j_jockey') && !tgt.dead && !opts._counter && tgt._rhythm !== this.round) {
        tgt._rhythm = this.round;
        tgt.energy = Math.min(tgt.maxEnergy || 6, (tgt.energy || 0) + 1);
        this.push({ t: 'float', uid: tgt.uid, text: '+1 ENERGY', cls: 'energy' });
        if (!src.dead) damage.call(this, tgt, src, 4, { aim: 0.04 }, { _counter: true, label: 'COUNTER' }, A.nail_shot);
      }
      // Cattle Drive: blocks heal Tim
      if (r.blocked && capOf(tgt, 't_ranch') && !tgt.dead) this.heal(null, tgt, 4);
    }
    return r;
  };

  const heal = P.heal;
  P.heal = function (src, tgt, base, scale) {
    let want = 0;
    if (src && tgt && !tgt.dead && capOf(src, 'h_cream')) {
      want = src ? this.scaleVal(src, base, scale) : base;
      want *= (1 + (this.bonus.heal || 0) + this.eq(src, 'heal')) * (src.id === 'hotpants' ? 1.2 : 1) * (1 - 0.15 * (src.exhaustion || 0));
      want = Math.round(want);
    }
    const got = heal.call(this, src, tgt, base, scale);
    if (want > got && tgt && !tgt.dead) this.addStatus(tgt, 'shield', Math.min(15, want - got));
    if (src && capOf(src, 'g_med') && tgt && !tgt.dead && got > 0) this.addStatus(src, 'rotation', 1, 0, true);
    return got;
  };

  const dodge = P.dodgeChance;
  P.dodgeChance = function (u) {
    const d = dodge.call(this, u);
    return capOf(u, 't_rope') && this.has(u, 'taunt') && d > 0 ? Math.min(0.75, d + 0.2) : d;
  };
  const rollInit = P.rollInit;
  P.rollInit = function (u) { return rollInit.call(this, u) + (capOf(u, 't_sheriff') ? 15 : 0); };

  /* ---------------- UI ---------------- */
  let sel = null;          // rider shown in the tab
  let armed = null;        // touch: first tap selects, second buys
  const hoverable = () => !window.matchMedia || window.matchMedia('(hover: hover)').matches;
  const pos = n => ({ x: n.cap ? 36 : [18, 50, 82][n.col], y: [9, 29, 49, 68, 87][n.tier] });

  function stamp(node, cap) {
    const r = node.getBoundingClientRect();
    const s = el('div', { class: 'tr-stamp' + (cap ? ' cap' : ''), style: { left: (r.left + r.width / 2) + 'px', top: (r.top + r.height / 2) + 'px' }, html: `<b>「GET」</b><i>${cap ? 'ドドドド' : 'ゴゴゴ'}</i>` });
    document.getElementById('fx-layer').appendChild(s);
    setTimeout(() => s.remove(), cap ? 1500 : 1000);
  }

  function riderPicker(cid, refresh) {
    const riders = el('div', { class: 'tr-riders' });
    RIDERS.forEach(k => {
      const C = SBR.CHARS[k], n = owned(k).length;
      const b = el('button', { class: 'tr-rider' + (k === cid ? ' active' : ''), style: { '--rc': C.color }, 'aria-label': C.name, html: `<span class="tr-rport">${SBR.art.portrait(C.portrait)}</span><small>${n}/${all(k).length}${rank(k) ? ' ★' + rank(k) : ''}</small>` });
      SBR.tip.bind(b, `<b>${C.name}</b><br>${n} of ${all(k).length} nodes${rank(k) ? ' · Legacy rank ' + rank(k) : ''}`);
      b.onclick = () => { SBR.audio.play('select'); SBR.tip.hide(); sel = k; armed = null; refresh(); };
      riders.appendChild(b);
    });
    return riders;
  }

  function heroCard(cid, refresh, opts = {}) {
    const C = SBR.CHARS[cid], T = TREES[cid];
    const n = owned(cid).length, tot = all(cid).length, r = rank(cid);
    const box = el('div', { class: 'tr-hero', style: { '--rc': C.color } });
    if (!opts.modal) box.appendChild(riderPicker(cid, refresh));
    box.insertAdjacentHTML('beforeend', `<div class="tr-hero-art"><div class="tr-stand">${SBR.stands.svg(T.stand())}</div><div class="tr-medal">${SBR.art.portrait(C.portrait)}</div><span class="tr-kana">${T.kana}</span></div>
      <div class="tr-hero-txt"><div class="tr-name">${C.name}</div><div class="tr-standname">「${C.stand}」</div>
      <div class="tr-prog"><div style="width:${Math.round(n / tot * 100)}%"></div><span>${n} / ${tot}</span></div>
      <div class="tr-row"><div class="tr-rank" title="Legacy ranks: +${Math.round(RANK_FX.dmg * 100)}% damage and +${RANK_FX.hp} battle HP each. Unlock by completing the tree.">${[...Array(RANK_MAX)].map((_, i) => `<span class="${i < r ? 'on' : ''}">★</span>`).join('')}</div>
      <div class="tr-rpb">${SBR.art.icon('trophy', 18)} <b>${meta().rp}</b> RP</div></div></div>`);
    const inspect = el('div', { class: 'tr-inspect', html: `<p class="tr-hint">${hoverable() ? 'Hover a medallion to read it. Click to buy.' : 'Tap a medallion to read it, tap again to buy.'} Bonuses apply whenever ${C.short} is in your party.</p>` });
    const acts = el('div', { class: 'tr-acts' });
    if (complete(cid)) {
      if (r < RANK_MAX) {
        const c = rankCost(r);
        acts.appendChild(SBR.ui.btn(`★ Legacy rank ${r + 1} · ${c} RP`, () => {
          if (!prestige(cid)) { SBR.toast(`Not enough RP (${c} needed)`, 'bad'); SBR.audio.play('back'); return; }
          SBR.audio.play('level'); SBR.toast(`<b>${C.short}</b> reaches Legacy rank ${r + 1}: +${Math.round(RANK_FX.dmg * 100)}% damage, +${RANK_FX.hp} battle HP.`, 'good'); refresh();
        }, 'btn-small btn-unlock tr-prestige' + (meta().rp < c ? ' poor' : '')));
      } else acts.appendChild(el('span', { class: 'tr-maxed' }, 'LEGACY COMPLETE'));
    }
    if (n) {
      const fee = respecFee(cid);
      let sure = false;
      const b = SBR.ui.btn(`Respec · −${fee} RP fee`, () => {
        if (!sure) { sure = true; b.textContent = `Refund ${spent(cid) - fee} RP?`; b.classList.add('sure'); return; }
        const got = respec(cid); SBR.audio.play('page'); SBR.toast(`${C.short}'s tree cleared: ${got} RP refunded.`, ''); refresh();
      }, 'btn-small btn-ghost tr-respec');
      acts.appendChild(b);
    }
    box.append(inspect, acts);
    box._inspect = inspect;
    return box;
  }

  function branchEl(cid, B, hero, refresh) {
    const wrap = el('div', { class: 'tr-branch', style: { '--bc': B.color } });
    const got = B.list.filter(n => has(cid, n.id)).length;
    wrap.appendChild(el('div', { class: 'tr-bhead', html: `<span class="tr-bk">${B.kana}</span><b>${B.name}</b><small>${got}/${B.list.length}</small>` }));
    const board = el('div', { class: 'tr-board', 'data-kana': B.kana });
    // ink lines
    const lines = [];
    B.list.forEach(n => n.req.forEach(rid => {
      const a = pos(NODES[cid][rid]), b = pos(n);
      const cls = has(cid, rid) && has(cid, n.id) ? 'own' : has(cid, rid) ? 'open' : 'lock';
      lines.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="ink"/><line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${cls}"/>`);
    }));
    board.innerHTML = `<svg class="tr-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines.join('')}</svg>`;
    B.list.forEach(n => {
      const s = stateOf(n), p = pos(n);
      const node = el('button', { class: `tr-node ${s}${n.cap ? ' cap' : ''}${armed === n.id ? ' armed' : ''}`, style: { left: p.x + '%', top: p.y + '%' }, 'aria-label': `${n.name} (${s === 'owned' ? 'owned' : n.cost + ' RP'})` });
      node.innerHTML = `<span class="tr-gem">${s === 'locked' ? icon('lock') : icon(n.icon)}</span><span class="tr-cost">${s === 'owned' ? '✔' : n.cost}</span>${n.cap ? `<span class="tr-capname" data-cost="${s === 'owned' ? 'OWNED' : n.cost + ' RP'}">${n.name}</span>` : ''}`;
      SBR.tip.bind(node, () => tipHtml(n));
      const show = () => { hero._inspect.innerHTML = tipHtml(n); };
      node.addEventListener('mouseenter', show);
      node.addEventListener('focus', show);
      node.onclick = () => {
        const st2 = stateOf(n);
        if (!hoverable() && armed !== n.id) { armed = n.id; show(); board.closest('.trees').querySelectorAll('.tr-node.armed').forEach(x => x.classList.remove('armed')); node.classList.add('armed'); SBR.audio.play('click'); return; }
        if (st2 === 'owned') return;
        if (st2 === 'locked') { SBR.audio.play('back'); SBR.toast(`Needs ${n.req.map(r => NODES[cid][r].name).join(n.any ? ' or ' : ' and ')} first.`, 'bad'); return; }
        if (st2 === 'poor') { SBR.audio.play('back'); SBR.toast(`Not enough RP (${n.cost} needed)`, 'bad'); return; }
        if (!buy(cid, n.id)) return;
        armed = null;
        SBR.tip.hide();
        SBR.audio.play('coin'); if (n.cap) SBR.audio.play('menace');
        stamp(node, n.cap);
        if (n.cap) SBR.toast(`<b>${SBR.CHARS[cid].short}</b> — capstone learned: <b>${n.name}</b>`, 'achv');
        refresh();
      };
      board.appendChild(node);
    });
    wrap.appendChild(board);
    return wrap;
  }

  /** the whole tree view for one rider */
  function panel(cid, refresh, opts = {}) {
    const root = el('div', { class: 'trees' + (opts.modal ? ' in-modal' : '') });
    const main = el('div', { class: 'tr-main' });
    const hero = heroCard(cid, refresh, opts);
    const br = el('div', { class: 'tr-branches' });
    TREES[cid].branches.forEach(B => br.appendChild(branchEl(cid, B, hero, refresh)));
    main.append(hero, br);
    root.appendChild(main);
    return root;
  }

  /** Saloon tab: SBR.trees.tab(body, refresh) */
  function tab(body, refresh) {
    const last = SBR.meta.lastLead;
    if (!sel) sel = RIDERS.includes(last) ? last : 'johnny';
    body.appendChild(el('p', { class: 'muted tr-intro', html: 'Each lead rider has a permanent <b>Legacy tree</b>: three branches bought with Race Points. A capstone at the top of each branch changes how that rider fights. Bonuses apply only when that rider is your lead: allies ride without their Legacy.' }));
    // keep the scroll position when a purchase re-renders the Saloon body
    const keep = () => { const y = body.scrollTop; refresh(); body.scrollTop = y; };
    body.appendChild(panel(sel, keep));
  }

  /** a modal tree for one rider (registration screen) */
  function open(cid, onClose) {
    if (!NODES[cid]) return;
    let wrap = null;
    const box = el('div');
    const render = () => { const M = box.closest('.modal'), y = M ? M.scrollTop : 0; box.innerHTML = ''; box.appendChild(panel(cid, render, { modal: true })); if (M) M.scrollTop = y; };
    render();
    wrap = SBR.ui.modal(box, { title: `${SBR.CHARS[cid].short}'s Legacy`, cls: 'trees-modal', onClose });
    return wrap;
  }
  /** small button for the registration screen; null for riders without a tree */
  function setupButton(lead, after) {
    if (!NODES[lead]) return null;
    const n = owned(lead).length, tot = all(lead).length;
    const row = el('div', { class: 'solo-row tr-setup-row' });
    row.appendChild(SBR.ui.btn(el('span', { html: `${icon(TREES[lead].branches[0].list[6].icon)} Legacy tree · ${n}/${tot}${rank(lead) ? ' ★' + rank(lead) : ''}` }), () => open(lead, after), 'btn-small tr-setup-btn', { 'data-kana': '系' }));
    const caps = all(lead).filter(x => x.cap && has(lead, x.id)).map(x => x.name);
    row.appendChild(el('span', { class: 'muted' }, caps.length ? `Capstones: ${caps.join(', ')}` : `Spend Race Points on ${SBR.CHARS[lead].short}'s permanent skill tree.`));
    return row;
  }

  return { TREES, NODES, RIDERS, ICON, owned, has, rank, complete, bonusFor, buy, respec, prestige, respecFee, spent, stateOf, tab, panel, open, setupButton, rankCost };
})();
