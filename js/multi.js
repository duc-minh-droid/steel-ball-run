/* Multi-target moves: pick 1, 2, 3 or 4 targets.
   ab.pick = how many you may choose. ab.spread = the damage (or healing) is split between them:
   one target takes it all, two take 62% each, three 46%, four 38%. Without spread, every pick gets the full effect.
   Enemies use the same flags (combat.js enemyAct fans out about half the time). */
'use strict';

SBR.SPREAD = [1, 1, 0.62, 0.46, 0.38, 0.32];

(() => {
  const A = SBR.ABILITIES;
  const lv = (x, a, b) => (x.lvl > 1 ? b : a);

  /* ---- existing moves that can now fan out ---- */
  const fan = (id, n, spread = true, note) => {
    const ab = A[id]; if (!ab) return;
    ab.pick = n; ab.spread = spread;
    const d = ab.desc;
    ab.desc = l => `${d(l)} ${note || `Pick up to ${n} targets${spread ? ' and split the damage' : ''}.`}`;
  };
  fan('nail_shot', 2);
  fan('drifter_shot', 2);
  fan('hp_revolver', 2);
  fan('weka_ball', 2);
  fan('pitchfork', 2);
  fan('suk_dismantle', 4, false, 'Pick up to 4 targets. Each one gets every cut.');

  /* ---- new moves ---- */
  Object.assign(A, {
    // Johnny
    nail_volley: { name: 'Ten-Nail Volley', cost: 1, cd: 2, target: 'enemy', pick: 3, spread: true, tags: ['gun', 'stand'], fx: 'nail',
      desc: l => `Tusk fires all ten fingernails at once. ${l > 1 ? 9 : 7} base, scales with AIM, ${l > 1 ? 45 : 30}% to leave a Hole.`,
      run(x) { const r = x.dmg(x.target, lv(x, 7, 9), { aim: 0.05 }); if (r.hit && x.roll(lv(x, 0.3, 0.45))) x.status(x.target, 'holed', 1); } },
    // Gyro
    twin_balls: { name: 'Twin Steel Balls', cost: 1, cd: 1, target: 'enemy', pick: 2, spread: false, tags: ['spin'], fx: 'ball',
      desc: l => `Gyro throws both balls. Up to 2 targets take ${l > 1 ? 6 : 5} Spin damage each. ${l > 1 ? 50 : 35}% to Weaken.`,
      run(x) { const r = x.dmg(x.target, lv(x, 5, 6), { spin: 0.04 }); if (r.hit && x.roll(lv(x, 0.35, 0.5))) x.status(x.target, 'weak', 0, 2); } },
    spin_massage: { name: 'Spin Massage', cost: 2, cd: 3, target: 'ally', pick: 2, spread: false, tags: ['spin', 'heal'], fx: 'heal',
      desc: l => `The Spin loosens knotted muscle. Up to 2 allies heal ${l > 1 ? 8 : 6}, cleanse 1 and gain Regen 2.`,
      run(x) { x.heal(x.target, lv(x, 6, 8), { res: 0.04, spin: 0.02 }); x.cleanse(x.target, 1); x.status(x.target, 'regen', 0, 2); } },
    // Mountain Tim
    lasso_sweep: { name: 'Lasso Sweep', cost: 1, cd: 2, target: 'enemy', pick: 3, spread: true, tags: ['stand'], fx: 'rope',
      desc: l => `Oh! Lonesome Me splits the rope and loops several riders. ${l > 1 ? 9 : 7} base, ${l > 1 ? 50 : 35}% to Hook.`,
      run(x) { const r = x.dmg(x.target, lv(x, 7, 9), { ride: 0.04, aim: 0.02 }); if (r.hit && x.roll(lv(x, 0.35, 0.5))) x.status(x.target, 'hooked', 0, 2); } },
    // Pocoloco
    lucky_breeze: { name: 'Lucky Breeze', cost: 1, cd: 2, target: 'ally', pick: 2, spread: false, tags: ['stand'], fx: 'buff',
      desc: l => `"Today's your lucky day too!" Up to 2 allies gain Lucky ${l > 1 ? 3 : 2} and Empowered 1.`,
      run(x) { x.status(x.target, 'lucky', 0, lv(x, 2, 3)); x.status(x.target, 'empower', 0, 1); } },
    // Hot Pants
    flesh_patch: { name: 'Cream Starter: Patchwork', cost: 2, cd: 3, target: 'ally', pick: 3, spread: true, tags: ['stand', 'heal'], fx: 'heal',
      desc: l => `Sprays flesh over several wounds at once. Heals ${l > 1 ? 14 : 11} split between up to 3 allies, plus Regen 2.`,
      run(x) { x.heal(x.target, lv(x, 11, 14), { res: 0.06 }); x.status(x.target, 'regen', 0, 2); } },
    flesh_choke: { name: 'Cream Starter: Choke', cost: 1, cd: 2, target: 'enemy', pick: 2, spread: false, tags: ['stand'], fx: 'spray',
      desc: l => `Flesh spray over the mouth and eyes. Up to 2 enemies are Blinded 1${l > 1 ? ' and Weakened 1' : ''}.`,
      run(x) { x.status(x.target, 'blind', 0, 1); if (x.lvl > 1) x.status(x.target, 'weak', 0, 1); } },
    // Wekapipo
    ricochet: { name: 'Wrecking Ricochet', cost: 1, cd: 2, target: 'enemy', pick: 3, spread: true, tags: ['spin', 'stand'], fx: 'ball',
      desc: l => `The ball bounces from rider to rider. ${l > 1 ? 11 : 9} base, ${l > 1 ? 40 : 25}% to blind the left side.`,
      run(x) { const r = x.dmg(x.target, lv(x, 9, 11), { spin: 0.045 }); if (r.hit && x.roll(lv(x, 0.25, 0.4))) x.status(x.target, 'leftblind', 0, 2); } },
    // Lucy
    lucy_rally: { name: 'Keep Going!', cost: 1, cd: 3, target: 'ally', pick: 2, spread: false, tags: [], fx: 'buff',
      desc: l => `Lucy won't let them quit. Up to 2 allies gain 1 Energy${l > 1 ? ' and Guard 1' : ''}.`,
      run(x) { x.energy(x.target, 1); if (x.lvl > 1) x.status(x.target, 'guard', 0, 1); } },
    // Diego
    raptor_rake: { name: 'Raptor Rake', cost: 1, cd: 2, target: 'enemy', pick: 3, spread: true, tags: ['stand'], fx: 'claw',
      desc: l => `Diego leaps down the line, claws out. ${l > 1 ? 10 : 8} base, every hit Bleeds.`,
      run(x) { const r = x.dmg(x.target, lv(x, 8, 10), { aim: 0.03, ride: 0.03 }); if (r.hit) x.status(x.target, 'bleed', 1); } },
    // Custom rider
    fan_hammer: { name: 'Fan the Hammer', cost: 1, cd: 2, target: 'enemy', pick: 4, spread: true, tags: ['gun'], fx: 'gun',
      desc: l => `Six shots as fast as your palm can slap the hammer. ${l > 1 ? 13 : 10} base, split between up to 4 targets.`,
      run(x) { x.dmg(x.target, lv(x, 10, 13), { aim: 0.05 }); } },
    dust_kick: { name: 'Dust in Their Eyes', cost: 1, cd: 2, target: 'enemy', pick: 3, spread: false, tags: [], fx: 'spray',
      desc: l => `Kick a cloud of desert over them. Up to 3 enemies are Marked${l > 1 ? ' and Blinded 1' : ''}.`,
      run(x) { x.status(x.target, 'marked', 0, 2); if (x.lvl > 1) x.status(x.target, 'blind', 0, 1); } },
    rally_cry: { name: 'Rally Cry', cost: 1, cd: 3, target: 'ally', pick: 2, spread: false, tags: [], fx: 'buff',
      desc: l => `"Ride, damn you!" Up to 2 allies (you count) gain Empowered ${l > 1 ? 2 : 1} and Guard 1.`,
      run(x) { x.status(x.target, 'empower', 0, lv(x, 1, 2)); x.status(x.target, 'guard', 0, 1); } },
    // Sukuna
    suk_mark: { name: 'Contempt', cost: 1, cd: 2, target: 'enemy', pick: 4, spread: false, tags: [], fx: 'suk_dismantle',
      desc: () => 'He looks at them like insects. Up to 4 enemies are Marked, Vulnerable and Afraid.',
      run(x) { x.status(x.target, 'marked', 0, 2); x.status(x.target, 'vuln', 0, 2); x.status(x.target, 'fear', 0, 1); } },
  });

  /* ---- who learns them ---- */
  const learn = (char, list) => { const C = SBR.CHARS[char]; if (!C) return; list.forEach(a => { if (!C.abilities.some(b => b.id === a.id)) C.abilities.push(a); }); };
  learn('johnny', [{ id: 'nail_volley', flag: 'tusk1', level: 3 }]);
  learn('gyro', [{ id: 'twin_balls', level: 2 }, { id: 'spin_massage', level: 5 }]);
  learn('mountaintim', [{ id: 'lasso_sweep', level: 2 }]);
  learn('pocoloco', [{ id: 'lucky_breeze', level: 2 }]);
  learn('hotpants', [{ id: 'flesh_choke', level: 2 }, { id: 'flesh_patch', level: 5 }]);
  learn('wekapipo', [{ id: 'ricochet', level: 3 }]);
  learn('lucy', [{ id: 'lucy_rally', level: 2 }]);
  learn('diego', [{ id: 'raptor_rake', level: 3 }]);
  learn('custom', [{ id: 'dust_kick', level: 2 }, { id: 'fan_hammer', level: 3 }, { id: 'rally_cry', level: 5 }]);
  learn('sukuna', [{ id: 'suk_mark' }]);

  /* ---- enemies: gunmen and packs fan out, healers and buffers cover two ---- */
  const FAN = /volley|spray|fan|barrage|rake|swarm|buckshot|scatter|gatling|machine|rapid|flurry|shotgun|hail|storm|pack/i;
  Object.values(SBR.ENEMIES).forEach(e => (e.abilities || []).forEach(a => {
    if (a.pick) return;
    if (a.target === 'enemy' && FAN.test(a.name || '')) { a.pick = e.tier === 'boss' ? 3 : 2; a.spread = true; }
    else if (a.target === 'ally' && (e.tier === 'elite' || e.tier === 'boss')) { a.pick = 2; a.spread = false; }
  }));

  /* ---- icons ---- */
  const I = SBR.icons, st = I.st, K = I.K;
  const badge = (c, t, fs = 12, c2 = '#fff') => `<circle cx="24" cy="24" r="19" fill="${c}" ${st}/><circle cx="24" cy="24" r="14" fill="none" stroke="#fff" stroke-width="1.2" opacity=".5"/><text x="24" y="${24 + fs * 0.36}" font-size="${fs}" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${c2}" stroke="${K}" stroke-width="1.6" paint-order="stroke">${t}</text>`
    + `<g transform="translate(34 34)"><circle r="8" fill="#f6ecd8" ${st} stroke-width="1.6"/><path d="M-4 -1l3 3M-1 -4l3 3M2 -1l3 3" stroke="${K}" stroke-width="1.6"/></g>`;
  const T = { nail_volley: ['#e87aa8', '十', 18], twin_balls: ['#3a9a5a', 'II', 16], spin_massage: ['#3ac870', '癒', 18], lasso_sweep: ['#b8905a', '輪', 18],
    lucky_breeze: ['#f2c14e', '運', 18, '#1a1020'], flesh_patch: ['#e8a0a0', '肉', 18], flesh_choke: ['#c87878', '塞', 18], ricochet: ['#4a7ac8', '跳', 18],
    lucy_rally: ['#e87aa8', 'GO!', 12], raptor_rake: ['#6a8a3a', '爪', 18], fan_hammer: ['#8a6a4a', '×6', 14], dust_kick: ['#c8a060', '砂', 18],
    rally_cry: ['#c8323c', '鬨', 18], suk_mark: ['#8a1a2a', '蔑', 18] };
  Object.entries(T).forEach(([id, [c, t, fs, c2]]) => I.define('ability', id, () => badge(c, t, fs, c2 || '#fff')));
})();
