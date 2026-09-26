/* Enemies learn more moves the further the race goes.
   Regular enemies and elites get extra moves on top of their own kit, picked from a pool that fits what they are
   (gunmen, brawlers, beasts, Stand users), and from act IV a set of tactical moves anyone can use.
   How many: act I none (one from stage 5), act II one, act III one then two, act IV two, act V two then three, act VI three.
   Elites get one more. Bosses keep their designed kits. The enemy AI (enemyai.js) decides when each move is worth it. */
'use strict';
(() => {
  const act = () => (SBR.run && SBR.run.act) || 1;
  const stage = () => (SBR.run && (SBR.run.area ? 3 : SBR.run.stage)) || 1;
  const stages = () => { const A = SBR.ACTS && SBR.ACTS[act()]; return (A && A.stages) || 7; };

  /** how many extra moves an enemy of this tier gets right now */
  function extraCount(tier) {
    if (tier === 'boss') return 0;
    const a = act(), late = stage() > stages() / 2;
    const base = { 1: late ? 1 : 0, 2: 1, 3: late ? 2 : 1, 4: 2, 5: late ? 3 : 2, 6: 3 }[Math.min(6, a)] || 0;
    return Math.min(4, base + (tier === 'elite' && a >= 2 ? 1 : 0));
  }
  // damage grows with the act (and a touch for elites), so a late move is worth its slot
  const pow = (u, k) => (2.6 + 1.1 * (act() - 1)) * (u.tier === 'elite' ? 1.25 : 1) * k;
  const others = x => x.allies.filter(a => a !== x.user && !a.dead);

  const GUN = [
    { name: 'Fan the Hammer', w: 2, cd: 2, target: 'enemy', fx: 'gun', desc: 'Three quick shots at random riders.',
      run: x => { const alive = x.enemies.filter(e => !e.dead); for (let i = 0; i < 3 && alive.length; i++) x.dmg(SBR.util.pick(alive), pow(x.user, 0.5), { aim: 0.02 }, { dtype: 'bullet', label: 'BANG' }); } },
    { name: 'Dead-Eye Shot', w: 1, cd: 3, target: 'enemy', fx: 'gun', desc: 'A slow, careful shot that hits hard.',
      run: x => x.dmg(x.target, pow(x.user, 1.6), { aim: 0.05 }, { dtype: 'bullet' }) },
    { name: 'Kneecap', w: 1, cd: 3, target: 'enemy', fx: 'gun', desc: 'A shot to the leg. Weakened for 2 turns.',
      run: x => { const r = x.dmg(x.target, pow(x.user, 0.8), { aim: 0.03 }, { dtype: 'bullet' }); if (r && r.hit) x.status(x.target, 'weak', 0, 2); } },
    { name: 'Covering Fire', w: 1, cd: 4, target: 'allAllies', fx: 'buff', desc: 'Pins you down so the gang can move. Allies gain Guard.',
      run: x => others(x).concat([x.user]).forEach(a => x.status(a, 'guard', 0, 1)) },
  ];
  const MELEE = [
    { name: 'Haymaker', w: 2, cd: 2, target: 'enemy', fx: 'hit', desc: 'A heavy swing. Sometimes knocks the rider senseless.',
      run: x => { const r = x.dmg(x.target, pow(x.user, 1.3), { grit: 0.03 }, { dtype: 'phys' }); if (r && r.hit && Math.random() < 0.3) x.status(x.target, 'stun', 0, 1); } },
    { name: 'Dirty Trick', w: 1, cd: 3, target: 'enemy', fx: 'spray', desc: 'Dust, a thumb, a bottle. Blinded for a turn.',
      run: x => { x.dmg(x.target, pow(x.user, 0.5), {}, { dtype: 'phys' }); x.status(x.target, 'blind', 0, 1); } },
    { name: 'Rally the Gang', w: 1, cd: 4, target: 'allAllies', fx: 'buff', desc: 'Every ally is Empowered for 2 turns.',
      run: x => x.allies.filter(a => !a.dead).forEach(a => x.status(a, 'empower', 0, 2)) },
    { name: 'Grit Teeth', w: 1, cd: 4, target: 'self', fx: 'buff', desc: 'Shrugs off a quarter of its wounds.',
      run: x => x.heal(x.user, Math.round(x.user.maxHp * 0.25), {}) },
  ];
  const BEAST = [
    { name: 'Savage Rend', w: 2, cd: 2, target: 'enemy', fx: 'claw', desc: 'Tears in and leaves it bleeding.',
      run: x => { const r = x.dmg(x.target, pow(x.user, 0.9), {}, { dtype: 'phys' }); if (r && r.hit) x.status(x.target, 'bleed', 2 + Math.floor(act() / 2)); } },
    { name: 'Pounce', w: 1, cd: 3, target: 'enemy', fx: 'claw', desc: 'Leaps and knocks the rider open. Exposed for a turn.',
      run: x => { const r = x.dmg(x.target, pow(x.user, 1.2), {}, { dtype: 'phys' }); if (r && r.hit) x.status(x.target, 'vuln', 0, 1); } },
    { name: 'Feral Howl', w: 1, cd: 4, target: 'allAllies', fx: 'buff', desc: 'The pack answers. Allies Empowered for 2 turns.',
      run: x => x.allies.filter(a => !a.dead).forEach(a => x.status(a, 'empower', 0, 2)) },
    { name: 'Lick Wounds', w: 1, cd: 4, target: 'self', fx: 'buff', desc: 'Regen for 3 turns.',
      run: x => x.status(x.user, 'regen', 0, 3) },
  ];
  const STAND = [
    { name: 'Stand Barrage', w: 2, cd: 2, target: 'enemy', fx: 'hit', dtype: 'stand', desc: 'A flurry of Stand blows.',
      run: x => { for (let i = 0; i < 3; i++) x.dmg(x.target, pow(x.user, 0.45), { aim: 0.02 }, { dtype: 'stand', label: 'ORA' }); } },
    { name: 'Stand Guard', w: 1, cd: 4, target: 'self', fx: 'buff', desc: 'Its Stand blocks for it. Gains a Shield.',
      run: x => x.status(x.user, 'shield', Math.round(x.user.maxHp * 0.2), 0) },
  ];
  // act IV onwards: moves that make a group play together
  const TACTIC = [
    { name: 'Mark the Target', w: 1, cd: 3, target: 'enemy', fx: 'spray', desc: 'Calls out a rider: Scanned and Exposed for the gang to follow up.',
      run: x => { x.status(x.target, 'marked', 0, 2); x.status(x.target, 'vuln', 0, 1); } },
    { name: 'Go for the Throat', w: 1, cd: 3, target: 'enemy', fx: 'hit', desc: 'Hits much harder against a rider under half HP.',
      run: x => x.dmg(x.target, pow(x.user, x.target.hp < x.target.maxHp * 0.5 ? 1.8 : 0.9), {}, { dtype: 'phys' }) },
    { name: 'Shake It Off', w: 1, cd: 4, target: 'self', fx: 'buff', desc: 'Clears its debuffs.',
      run: x => x.cleanse(x.user, 99) },
    { name: 'Cover Me', w: 1, cd: 4, target: 'ally', fx: 'buff', desc: 'Shields a wounded ally.',
      run: x => { const t = x.target && x.target.side === x.user.side ? x.target : others(x).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] || x.user; x.status(t, 'shield', Math.round(t.maxHp * 0.2), 0); } },
  ];

  function kindOf(u) {
    const d = u.def || {};
    if (d.stand) return 'stand';
    if (d.art && d.art.kind === 'creature') return 'beast';
    const abl = d.abilities || [];
    if (abl.some(a => a.fx === 'gun' || /shot|shoot|rifle|revolver|pistol|gun/i.test(a.name))) return 'gun';
    return 'melee';
  }

  function grant(u) {
    if (!u || u.side !== 'enemy' || u.summon || u.extraMoves || (u.def && u.def.noExtraMoves)) return;
    const n = extraCount(u.tier === 'boss' ? 'boss' : u.tier === 'elite' || (u.traits || []).length ? 'elite' : 'mob');
    if (!n) return;
    const own = (u.xAbilities || (u.def && u.def.abilities) || []);
    const names = new Set(own.map(a => a.name));
    const kind = kindOf(u);
    const pool = SBR.util.shuffle(({ gun: GUN, melee: MELEE, beast: BEAST, stand: STAND.concat(MELEE) }[kind]).slice());
    const late = act() >= 4 ? SBR.util.shuffle(TACTIC.slice()) : [];
    // mostly its own kind, with one tactical move mixed in late
    const picks = [];
    const order = late.length ? [pool[0], late[0]].concat(pool.slice(1), late.slice(1)) : pool;
    for (const m of order) { if (picks.length >= n) break; if (m && !names.has(m.name)) { picks.push(Object.assign({ extra: true }, m)); names.add(m.name); } }
    u.xAbilities = own.concat(picks);
    u.extraMoves = picks.length;
  }

  const Base = SBR.Combat;
  SBR.Combat = class extends Base {
    constructor(e, o) {
      super(e, o);
      if (!SBR.enemyMoves.enabled || !SBR.run) return;
      this.units.filter(u => u.side === 'enemy').forEach(grant);
    }
  };
  SBR.enemyMoves = { enabled: true, extraCount, grant, pools: { GUN, MELEE, BEAST, STAND, TACTIC } };
})();
