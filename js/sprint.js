/* Stage-finish sprint minigame: time presses to the Golden Rectangle ring.
   The course is one long drawn map from the start line to the goal (no looping backgrounds), and rivals play dirty:
   they shoot, lasso, throw dust and use their Stands on you. A telegraphed attack is dodged by hitting GOLD in time. */
'use strict';
SBR.sprint = (() => {
  const { el, sleep } = SBR.util;
  const art = SBR.art;
  const K = '#1a1020';

  /* ---------- the course: long parallax layers that end at the goal ---------- */
  const PAL = {
    1: { sky: ['#f6b26b', '#fde9c9'], far: '#d08a6a', mid: '#b86a44', ground: '#e8c080', dirt: '#c89a5a', deco: 'cactus' },
    2: { sky: ['#8ab8e8', '#e8f4ff'], far: '#8a9ab8', mid: '#4a6a4a', ground: '#9aaa5a', dirt: '#8a7a4a', deco: 'pine', snowcap: true },
    3: { sky: ['#7ab0e0', '#f6f0d0'], far: '#9ab870', mid: '#6a9a4a', ground: '#b8c870', dirt: '#a08a50', deco: 'fence' },
    4: { sky: ['#9ab0c8', '#eef4fa'], far: '#b8c8d8', mid: '#6a8a9a', ground: '#eef4f8', dirt: '#c8d4e0', deco: 'snowpine', snowcap: true },
    5: { sky: ['#e8a070', '#f8e0c0'], far: '#a88a7a', mid: '#7a6a5a', ground: '#9aa860', dirt: '#8a7a50', deco: 'farm' },
    6: { sky: ['#6a5a9a', '#f0b890'], far: '#5a5070', mid: '#3a3050', ground: '#8a8a8a', dirt: '#6a6a70', deco: 'city' },
  };
  function seeded(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  const DECO = {
    cactus: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-5 0V-40a5 5 0 0 1 10 0V0zM-5-18h-8v-12a4 4 0 0 1 8 0M5-24h8v-10a4 4 0 0 0-8 0" fill="#5a8a3a" stroke="${K}" stroke-width="2.4"/></g>`,
    pine: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0-60L-16-20h8L-20 0h40L8-20h8z" fill="#2a5a3a" stroke="${K}" stroke-width="2.4"/><rect x="-3" y="0" width="6" height="8" fill="#5a3a2a"/></g>`,
    snowpine: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0-60L-16-20h8L-20 0h40L8-20h8z" fill="#3a6a5a" stroke="${K}" stroke-width="2.4"/><path d="M0-60l-8 20 8-4 8 4zM-12-20l12 6 12-6" fill="#fff" stroke="${K}" stroke-width="1.4"/></g>`,
    fence: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30-14h60M-30-26h60" stroke="#8a6a4a" stroke-width="4"/><path d="M-26 0v-32M0 0v-32M26 0v-32" stroke="#6a4a2a" stroke-width="5"/></g>`,
    farm: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-24 0v-26l24-16 24 16V0z" fill="#b8423a" stroke="${K}" stroke-width="2.4"/><path d="M-8 0v-14h16V0" fill="#f6ecd8" stroke="${K}" stroke-width="2"/></g>`,
    city: (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0v-44" stroke="${K}" stroke-width="3"/><circle cx="0" cy="-46" r="5" fill="#fff3a0" stroke="${K}" stroke-width="2"/></g>`,
  };
  /** build the course; returns layers [{node, rate}] and the goal's x in near-layer coordinates */
  function buildCourse(host, act, W, H, LEN, PRE, scale) {
    const P = PAL[act] || PAL[1];
    const rnd = seeded(act * 977 + 13);
    host.innerHTML = `<div class="sw-sky" style="background:linear-gradient(${P.sky[1]}, ${P.sky[0]})"><div class="sw-sun"></div></div>`;
    const worldW = rate => Math.ceil(W * 1.6 + (LEN + PRE + 400) * scale * rate);
    const mk = (rate, inner, w, cls) => { const d = el('div', { class: 'sw-layer ' + cls, html: `<svg width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>` }); host.appendChild(d); return { node: d, rate }; };
    const layers = [];
    // far: mountains / skyline and clouds
    { const w = worldW(0.12), base = H * 0.36; let d = `M0 ${H}L0 ${base}`; let x = 0; const peaks = [];
      while (x < w) { const pw = 80 + rnd() * 140, ph = 30 + rnd() * (P.deco === 'city' ? 50 : 90); if (P.deco === 'city') { d += `L${x} ${base - ph}L${x + pw * 0.6} ${base - ph}L${x + pw * 0.6} ${base - ph * 0.6}`; } else { d += `L${x + pw / 2} ${base - ph}L${x + pw} ${base}`; peaks.push([x + pw / 2, base - ph]); } x += pw * (P.deco === 'city' ? 0.6 : 0.8); }
      d += `L${w} ${base}L${w} ${H}z`;
      const snow = P.snowcap ? peaks.map(([px, py]) => `<path d="M${px - 12} ${py + 16}L${px} ${py}L${px + 12} ${py + 16}l-6-3-6 5-6-5z" fill="#fff" opacity=".9"/>`).join('') : '';
      const clouds = [...Array(Math.ceil(w / 260))].map((_, i) => { const cx = i * 260 + rnd() * 120, cy = H * (0.08 + rnd() * 0.18); return `<g opacity=".85"><ellipse cx="${cx}" cy="${cy}" rx="46" ry="14" fill="#fff"/><ellipse cx="${cx + 24}" cy="${cy - 8}" rx="26" ry="14" fill="#fff"/></g>`; }).join('');
      layers.push(mk(0.12, clouds + `<path d="${d}" fill="${P.far}" stroke="${K}" stroke-width="2"/>` + snow, w, 'far')); }
    // mid: hills and landmarks
    { const w = worldW(0.4), base = H * 0.43; let d = `M0 ${H}L0 ${base}`; for (let x = 0; x <= w; x += 60) d += `Q${x + 30} ${base - 10 - rnd() * 34} ${x + 60} ${base - rnd() * 8}`; d += `L${w} ${H}z`;
      const deco = [...Array(Math.ceil(w / 170))].map((_, i) => (DECO[P.deco] || DECO.cactus)(i * 170 + rnd() * 90, base + 4, 0.55 + rnd() * 0.3)).join('');
      layers.push(mk(0.4, `<path d="${d}" fill="${P.mid}" stroke="${K}" stroke-width="2"/>${deco}`, w, 'mid')); }
    // near: the track itself, distance posts, and the goal
    { const w = worldW(1), top = H * 0.47;
      const X = p => W * 0.38 + (p + PRE) * scale;
      let s = `<rect x="0" y="${top}" width="${w}" height="${H - top}" fill="${P.ground}"/><path d="M0 ${top}H${w}" stroke="${K}" stroke-width="3"/>`;
      s += [...Array(6)].map((_, i) => `<path d="M0 ${top + 24 + i * 34}H${w}" stroke="${P.dirt}" stroke-width="${3 + i}" stroke-dasharray="${30 + i * 10} ${40 + i * 12}" opacity=".6"/>`).join('');
      for (let p = 0; p <= LEN; p += 100) { const x = X(p); const left = LEN - p; s += `<g transform="translate(${x} ${top})"><path d="M0 0v-40" stroke="#6a4a2a" stroke-width="5"/><rect x="-22" y="-58" width="44" height="18" fill="#f6ecd8" stroke="${K}" stroke-width="2"/><text x="0" y="-45" font-size="11" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="${K}">${left ? left * 15 + 'm' : 'GOAL'}</text></g>`; }
      for (let i = 0; i < w / 90; i++) { const x = i * 90 + rnd() * 60; s += `<ellipse cx="${x}" cy="${top + 10 + rnd() * (H - top - 20)}" rx="${4 + rnd() * 6}" ry="${2 + rnd() * 3}" fill="${K}" opacity=".18"/>`; }
      // start line
      s += `<rect x="${X(0) - 6}" y="${top}" width="10" height="${H - top}" fill="#fff" opacity=".8"/>`;
      // goal: checkered arch, banner and a crowd
      const gx = X(LEN) + 80;
      const crowd = [...Array(26)].map((_, i) => { const cx = gx - 160 + i * 14 + rnd() * 6, cy = top - 6 - rnd() * 8; const c = ['#c8323c', '#3b5bb5', '#f2c14e', '#3a8c4a', '#e8508a', '#f6ecd8'][i % 6]; return `<path d="M${cx - 6} ${cy + 6}q6-18 12 0z" fill="${c}" stroke="${K}" stroke-width="1.4"/><circle cx="${cx}" cy="${cy - 12}" r="4.4" fill="#f0c8a0" stroke="${K}" stroke-width="1.4"/>`; }).join('');
      s += crowd + `<g transform="translate(${gx} ${top})"><path d="M-70 0v-150M70 0v-150" stroke="${K}" stroke-width="10"/><path d="M-70 0v-150M70 0v-150" stroke="#f6ecd8" stroke-width="6" stroke-dasharray="12 12"/><rect x="-90" y="-176" width="180" height="36" fill="#c8323c" stroke="${K}" stroke-width="3"/><text x="0" y="-150" font-size="26" text-anchor="middle" font-family="Anton,Impact,sans-serif" fill="#f2c14e" stroke="${K}" stroke-width="1.4" paint-order="stroke">GOAL</text>${[...Array(8)].map((_, i) => `<path d="M${-90 + i * 24} -140l12 14 12-14" fill="${i % 2 ? '#fff' : '#3b5bb5'}" stroke="${K}" stroke-width="1.4"/>`).join('')}</g>`;
      layers.push(mk(1, s, w, 'near'));
    }
    return layers;
  }

  /* ---------- dirty tricks ---------- */
  const TRICKS = {
    shot:  { warn: 'draws a revolver on you', hit: 'BANG! Your horse rears.', fx: s => { s.stumble = 1.3; s.stamina -= 15; } },
    lasso: { warn: 'swings a lasso at your horse', hit: 'Roped! Your horse is dragging.', fx: s => { s.slow = 2.2; } },
    dust:  { warn: 'kicks up a cloud of dust', hit: 'Sand in your eyes!', fx: s => { s.blind = 2; } },
    knife: { warn: 'throws a knife', hit: 'A cut on the flank. Stamina drains.', fx: s => { s.stamina -= 26; } },
    shove: { warn: 'rides in close to shove you', hit: 'Shoved off the line!', fx: s => { s.me.pos -= 14; s.stumble = 0.6; } },
    stand: { warn: 'uses a Stand on you', hit: 'The Stand hits home.', fx: s => { s.stumble = 1.6; s.stamina -= 12; } },
    sound: { warn: 'stamps a sound onto your saddle', hit: 'DOGOOON! Your next press will misfire.', fx: s => { s.misfire = true; } },
  };
  /** what each rival does to you */
  const RIVAL_TRICK = { diego: ['stand', 'Diego\'s raptor bites at your horse!'], hotpants: ['dust', 'Hot Pants sprays flesh over your eyes!'], sandman: ['sound', 'Sandman: 「In a Silent Way」!'],
    gyro: ['stand', 'Gyro\'s steel ball ricochets at you!'], mountaintim: ['lasso', 'Mountain Tim throws his rope!'], pocoloco: ['shove', 'Pocoloco, somehow, luckily bumps into you!'],
    mackknife: ['knife', 'Mack the Knife throws a blade!'], dixie: ['shot', 'Dixie Chicken takes a trick shot!'], dothan: ['shot', 'Dot Han fires from the saddle!'], johnny: ['stand', 'Johnny fires his nails at you!'],
    gaucho: ['lasso', 'Gaucho throws his bolas!'], babayaga: ['dust', 'Baba Yaga throws a pouch of ash!'], norisuke: ['shove', 'Norisuke cuts across your line!'] };

  function run({ name, act, favourite, tutorial }) {
    SBR.music.play('sprint');
    return new Promise(resolve => {
      const r = SBR.run;
      const horse = SBR.HORSES[r.horse];
      const b = SBR.bonus();
      const leadId = r.lead || 'johnny';
      const L = SBR.CHARS[leadId] || SBR.CHARS.johnny;
      const leadM = r.party.find(m => m.id === leadId) || r.party[0];
      const ride = leadM ? leadM.stats.ride + (horse.bonus.ride || 0) : 6;
      // difficulty climbs with every stage finish: the 1st Stage is gentle, the 9th is brutal
      const hard = tutorial ? 0 : act * 1.2 - 0.6 + (SBR.threatTier ? SBR.threatTier() * 0.5 : 0);

      // participants
      const rivalKeys = Object.keys(SBR.RIVALS).filter(k => {
        const rv = SBR.RIVALS[k];
        if (k === leadId) return false;
        if (rv.outAfter && act > rv.outAfter) return false;
        if (rv.out && rv.out(r)) return false;
        if (k === 'gyro' && r.flags.valDead) return false;
        if (k === 'diego' && act === 5 && r.flags.valDead) return false;
        return true;
      });
      let chosen = SBR.util.shuffle(rivalKeys.filter(k => k !== favourite)).slice(0, 4);
      if (favourite && rivalKeys.includes(favourite)) chosen.unshift(favourite); else chosen = SBR.util.shuffle(rivalKeys).slice(0, 5);
      chosen = chosen.slice(0, 5);
      const LEN = 1000, PRE = 250;
      const startOffset = (r.pace - 50) * 1.6;
      const actScale = tutorial ? 1.05 : 1.1 + act * 0.07;
      const riderCol = L.color || '#5b3a8c';
      const runners = [{ key: 'player', name: L.short, coat: horse.coat, mane: horse.mane, wrap: horse.wrap, spots: horse.spots, pos: startOffset, speed: 0, base: 44 + horse.speed * 2.2 + ride * 0.25, player: true }]
        .concat(chosen.map((k, i) => {
          const rv = SBR.RIVALS[k];
          const coats = ['#c8c8d0', '#6a4a2a', '#e8d8c0', '#3a2a1a', '#8a5a30', '#b8703a'];
          return { key: k, name: rv.name.split(' ')[0], coat: coats[i % coats.length], mane: '#1a1020', wrap: ['#3fb8a9', '#e8508a', '#f2c14e', '#c8323c', '#6b5bd6'][i % 5], pos: SBR.util.randInt(-30, 20), speed: 0, base: (47 + horse.speed * 0.4) * rv.speed * actScale * (k === favourite ? 1.12 : 1), surge: 0 };
        }));

      // DOM
      const wrap = el('div', { class: 'sprint' });
      wrap.innerHTML = `<div class="sprint-scene sprint-world"></div>
        <div class="sprint-head"><div class="sprint-name">${name}</div><div class="sprint-sub">Press <b>SPACE</b> / click when the needle hits <span class="gold">GOLD</span>. Hit GOLD while a rival attacks to <b>dodge</b>.</div></div>
        <div class="sprint-track"></div>
        <div class="sprint-progress"><div class="sp-line"></div></div>
        <div class="sprint-ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="rgba(26,16,32,.75)" stroke="#1a1020" stroke-width="10"/><circle cx="100" cy="100" r="80" fill="none" stroke="#f6ecd8" stroke-width="4" opacity=".3"/><path class="zone-good" fill="none" stroke="#6b5bd6" stroke-width="16"/><path class="zone-gold" fill="none" stroke="#f2c14e" stroke-width="16"/><g class="needle"><line x1="100" y1="100" x2="100" y2="26" stroke="#e8508a" stroke-width="6" stroke-linecap="round"/><circle cx="100" cy="100" r="10" fill="#e8508a" stroke="#1a1020" stroke-width="3"/></g></svg><div class="ring-feedback"></div><div class="ring-combo"></div></div>
        <div class="sprint-stamina"><span>STAMINA</span><div class="stam-bar"><div></div></div></div>
        <div class="sprint-warn"><b></b><span></span><i></i></div>
        <div class="sprint-count"></div><div class="sprint-hazard"></div>`;
      document.getElementById('overlay').appendChild(wrap);
      requestAnimationFrame(() => wrap.classList.add('show'));
      const track = wrap.querySelector('.sprint-track');
      const prog = wrap.querySelector('.sprint-progress');
      runners.forEach((rn, i) => {
        rn.node = el('div', { class: 'runner' + (rn.player ? ' me' : ''), style: { top: (i * 15) + '%', zIndex: 10 + i, '--sc': (0.78 + i * 0.07).toFixed(2) } });
        rn.node.innerHTML = `<div class="runner-tag">${rn.player ? 'YOU' : rn.name}</div>${art.horse({ coat: rn.coat, mane: rn.mane, wrap: rn.wrap, spots: rn.spots, rider: { cape: rn.player ? riderCol : rn.wrap, body: rn.player ? '#3b5bb5' : '#6a4a2a', hat: rn.player ? riderCol : '#3a2a1a' } })}`;
        track.appendChild(rn.node);
        rn.dot = el('div', { class: 'sp-dot' + (rn.player ? ' me' : ''), title: rn.name });
        prog.appendChild(rn.dot);
      });
      const W0 = track.clientWidth || innerWidth, scale0 = W0 / 360;
      const layers = buildCourse(wrap.querySelector('.sprint-world'), act, W0, wrap.clientHeight || innerHeight, LEN, PRE, scale0);
      const finishLine = el('div', { class: 'finish-line' }, el('span', {}, 'GOAL'));
      track.appendChild(finishLine);

      // ring state (harder every act)
      const needle = wrap.querySelector('.needle');
      const goldEl = wrap.querySelector('.zone-gold'), goodEl = wrap.querySelector('.zone-good');
      const fb = wrap.querySelector('.ring-feedback'), comboEl = wrap.querySelector('.ring-combo');
      const stamFill = wrap.querySelector('.stam-bar div');
      const goldSize = Math.max(14, 26 + ride * 0.5 - hard * 1.4 + (b.sprint || horse.bonus.sprint ? 6 : 0));
      const S = { stamina: 100, stumble: 0, slow: 0, blind: 0, misfire: false, me: runners[0] };
      let angle = 0, rot = 200 + hard * 14, zone = 90, combo = 0, cool = 0, boost = 0;
      const arc = (a0, a1) => {
        const p = a => [100 + 80 * Math.sin(a * Math.PI / 180), 100 - 80 * Math.cos(a * Math.PI / 180)];
        const [x0, y0] = p(a0), [x1, y1] = p(a1);
        return `M${x0} ${y0} A80 80 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
      };
      const placeZone = () => {
        zone = 40 + Math.random() * 280;
        goldEl.setAttribute('d', arc(zone - goldSize / 2, zone + goldSize / 2));
        goodEl.setAttribute('d', arc(zone - goldSize * 1.25, zone + goldSize * 1.25));
      };
      placeZone();
      const feedback = (t, cls) => { fb.textContent = t; fb.className = 'ring-feedback show ' + cls; clearTimeout(fb._t); fb._t = setTimeout(() => fb.classList.remove('show'), 500); };

      let started = false, finished = false, finishOrder = [], last = 0, elapsed = 0, hazardT = 3;
      const hazEl = wrap.querySelector('.sprint-hazard');
      const ringEl = wrap.querySelector('.sprint-ring');
      const warnEl = wrap.querySelector('.sprint-warn');
      const say = t => { hazEl.innerHTML = t; hazEl.classList.remove('show'); void hazEl.offsetWidth; hazEl.classList.add('show'); SBR.audio.play('menace'); };
      let threat = null;
      /** a rival telegraphs an attack; hit GOLD before the bar runs out to dodge it */
      function attack(rn) {
        const [kind, line] = RIVAL_TRICK[rn.key] || [SBR.util.pick(['shot', 'lasso', 'dust', 'shove']), null];
        if (kind === 'shove' && Math.abs(rn.pos - runners[0].pos) > 40) rn.pos = runners[0].pos + 10;
        const T = TRICKS[kind];
        const dur = Math.max(0.9, 1.6 - hard * 0.08);
        threat = { rn, kind, t: dur, dur, line: line || `${rn.name.toUpperCase()} ${T.warn}!` };
        warnEl.querySelector('b').textContent = '⚠ ' + threat.line;
        warnEl.querySelector('span').textContent = 'Hit GOLD to dodge!';
        warnEl.classList.add('show');
        rn.node.classList.add('attacking');
        SBR.audio.play('menace');
      }
      function clearThreat() { if (!threat) return; threat.rn.node.classList.remove('attacking'); threat = null; warnEl.classList.remove('show'); }
      function landThreat() {
        const T = TRICKS[threat.kind];
        T.fx(S); S.stamina = Math.max(0, S.stamina);
        if (S.blind > 0) ringEl.classList.add('blinded');
        say(T.hit); feedback('HIT!', 'bad'); SBR.audio.play(threat.kind === 'shot' ? 'gun' : 'hit');
        wrap.classList.remove('struck'); void wrap.offsetWidth; wrap.classList.add('struck');
        clearThreat();
      }
      /* rivals push themselves too */
      function selfBoost(rn) {
        switch (rn.key) {
          case 'diego': rn.surge = 2.5; rn.bigSurge = 2.5; say('DIEGO: 「Scary Monsters」 raptor legs!'); break;
          case 'pocoloco': rn.pos += 30; say('POCOLOCO: 「Hey Ya!」 a lucky shortcut!'); break;
          case 'sandman': rn.surge = 3; rn.bigSurge = 3; say('SANDMAN leaves his horse and runs on foot!'); break;
          case 'mountaintim': rn.surge = 2; rn.bigSurge = 2; say('MOUNTAIN TIM lassos a shortcut!'); break;
          default: rn.surge = 2; rn.bigSurge = 1.5; say(rn.name.toUpperCase() + ' makes a break for it!');
        }
      }
      function hazard() {
        const cands = runners.slice(1).filter(x => !x.done);
        if (!cands.length) return;
        // attackers are the ones close to you, ahead or behind
        const near = cands.filter(x => Math.abs(x.pos - runners[0].pos) < 120);
        if (!threat && (near.length || Math.random() < 0.4) && Math.random() < 0.55 + hard * 0.05) attack(SBR.util.pick(near.length ? near : cands));
        else selfBoost(SBR.util.pick(cands));
      }
      function press() {
        if (!started || finished || cool > 0) return;
        cool = 0.28;
        const d = Math.abs(((angle - zone + 540) % 360) - 180);
        if (S.misfire) { S.misfire = false; combo = 0; S.stumble = 0.8; feedback('MISFIRE', 'bad'); SBR.audio.play('boom'); placeZone(); return; }
        if (d <= goldSize / 2) {
          combo++; boost = Math.min(2.2, 0.9 + combo * 0.18); S.stamina = Math.min(100, S.stamina + 6);
          if (threat) { feedback('DODGED!', 'gold'); say(`You slip past ${threat.rn.name}!`); clearThreat(); boost += 0.4; }
          else feedback(combo >= 3 ? 'GOLDEN!' : 'PERFECT', 'gold');
          SBR.audio.play('spin');
          if (combo >= 3) wrap.classList.add('golden'); setTimeout(() => wrap.classList.remove('golden'), 300);
        } else if (d <= goldSize * 1.25) {
          combo = 0; boost = 0.55; feedback('GOOD', 'good'); SBR.audio.play('gallop');
        } else {
          combo = 0; S.stumble = 0.7; S.stamina = Math.max(0, S.stamina - 12); feedback('STUMBLE', 'bad'); SBR.audio.play('miss');
        }
        comboEl.textContent = combo > 1 ? `×${combo}` : '';
        rot = Math.min(440 + hard * 10, rot + 12);
        placeZone();
      }
      const onKey = e => { if (e.code === 'Space') { e.preventDefault(); press(); } };
      document.addEventListener('keydown', onKey);
      wrap.addEventListener('mousedown', press);

      function frame(t) {
        if (!last) last = t;
        const dt = Math.min(0.05, (t - last) / 1000) * SBR.settings.speed;
        last = t;
        const me = runners[0];
        if (started && !finished) {
          elapsed += dt;
          angle = (angle + rot * dt) % 360;
          needle.setAttribute('transform', `rotate(${angle} 100 100)`);
          cool = Math.max(0, cool - dt);
          boost = Math.max(0, boost - dt * 0.9);
          S.stumble = Math.max(0, S.stumble - dt);
          S.slow = Math.max(0, S.slow - dt);
          if (S.blind > 0) { S.blind -= dt; if (S.blind <= 0) ringEl.classList.remove('blinded'); }
          S.stamina = Math.max(0, S.stamina - dt * (3.2 + hard * 0.25));
          stamFill.style.width = S.stamina + '%';
          wrap.classList.toggle('roped', S.slow > 0);
          me.speed = me.base * (0.72 + S.stamina / 100 * 0.35) * (1 + boost * 0.45) * (S.stumble > 0 ? 0.55 : 1) * (S.slow > 0 ? 0.62 : 1);
          runners.slice(1).forEach(rn => {
            rn.surge = Math.max(0, rn.surge - dt);
            if (Math.random() < dt * 0.7) rn.surge = 0.7 + Math.random() * 1;
            const fatigue = 1 - Math.min(0.06, elapsed * 0.002);
            const rubber = rn.pos < me.pos - 60 ? 1.15 : 1;
            rn.speed = rn.base * fatigue * rubber * (1 + (rn.surge > 0 ? (rn.bigSurge > 0 ? 0.6 : 0.32) : 0)) * (0.96 + Math.random() * 0.08);
            rn.bigSurge = Math.max(0, (rn.bigSurge || 0) - dt);
          });
          if (threat) { threat.t -= dt; warnEl.querySelector('i').style.width = Math.max(0, threat.t / threat.dur * 100) + '%'; if (threat.t <= 0) landThreat(); }
          hazardT -= dt;
          if (hazardT <= 0 && me.pos < LEN - 60) { hazardT = Math.max(2.2, 4.6 - hard * 0.35) + Math.random() * 2; hazard(); }
          runners.forEach(rn => {
            if (rn.done) return;
            rn.pos += rn.speed * dt;
            if (rn.pos >= LEN) { rn.done = true; finishOrder.push(rn); if (rn.player) SBR.audio.play('whistle'); }
          });
          if (me.done && finishOrder.length >= 1) {
            clearThreat();
            // let the rest resolve instantly by projected time
            const remaining = runners.filter(x => !x.done).sort((a, b) => (LEN - a.pos) / a.speed - (LEN - b.pos) / b.speed);
            remaining.forEach(x => { x.done = true; finishOrder.push(x); });
            end();
          }
        }
        // camera: one long course, never wrapped, clamped at both ends
        const W = track.clientWidth || W0, scale = W / 360;
        const camPos = Math.max(-PRE + 20, Math.min(LEN + 60, me.pos));
        runners.forEach(rn => {
          const x = W * 0.38 + (rn.pos - camPos) * scale;
          rn.node.style.transform = `translateX(${x}px) scale(var(--sc))`;
          rn.node.classList.toggle('boosting', rn.player ? boost > 0.8 : rn.surge > 0);
          rn.dot.style.left = Math.max(0, Math.min(100, rn.pos / LEN * 100)) + '%';
        });
        finishLine.style.transform = `translateX(${W * 0.38 + (LEN - camPos) * scale + 80}px)`;
        layers.forEach(l => { l.node.style.transform = `translate3d(${-((camPos + PRE) * scale0 * l.rate)}px,0,0)`; });
        if (!finished) requestAnimationFrame(frame);
      }

      async function countdown() {
        const cd = wrap.querySelector('.sprint-count');
        // real seconds, independent of game speed: 3, 2, 1, GO!
        for (const n of ['3', '2', '1', 'GO!']) {
          cd.textContent = n; cd.classList.remove('pop'); void cd.offsetWidth; cd.classList.add('pop');
          SBR.audio.play(n === 'GO!' ? 'whistle' : 'click');
          await new Promise(res => setTimeout(res, n === 'GO!' ? 450 : 1000));
        }
        cd.textContent = '';
        started = true;
      }

      async function end() {
        finished = true;
        document.removeEventListener('keydown', onKey);
        const place = finishOrder.findIndex(x => x.player) + 1;
        await sleep(400);
        const res = el('div', { class: 'sprint-results' });
        res.innerHTML = `<div class="sr-title">${place === 1 ? 'STAGE WINNER!' : SBR.util.ordinal(place) + ' PLACE'}</div>
          <div class="podium">${finishOrder.map((x, i) => `<div class="pod-row ${x.player ? 'me' : ''}" style="animation-delay:${i * 0.12}s"><span class="pod-pos">${i + 1}</span><span class="pod-port">${x.player ? art.portrait(L.portrait) : art.portrait(SBR.RIVALS[x.key].portrait)}</span><span class="pod-name">${x.player ? L.name : SBR.RIVALS[x.key].name}</span><span class="pod-pts">+${SBR.POINTS[i] || 3}</span></div>`).join('')}</div>`;
        const go = SBR.ui.btn('Continue ▸', () => { wrap.classList.remove('show'); setTimeout(() => wrap.remove(), 300); resolve({ place, order: finishOrder.map(x => x.key) }); }, 'btn-primary');
        res.appendChild(go);
        wrap.appendChild(res);
        SBR.audio.play(place <= 3 ? 'level' : 'coin');
      }

      requestAnimationFrame(frame);
      (async () => {
        // the race starts straight away; first-timers get a hint banner instead of a blocking dialogue
        if (tutorial || !SBR.meta.sprintHintSeen2) {
          const tip = el('div', { class: 'sprint-tip', html: '<b>HOW TO RACE</b> Press <b>SPACE</b> or click when the needle crosses the <span class="gold">GOLD</span> zone to surge. Miss and your horse stumbles. When a rival attacks (<b>⚠</b>), hit GOLD before the red bar runs out to dodge. Your act PACE is your head start.' });
          wrap.appendChild(tip);
          setTimeout(() => tip.classList.add('out'), 7000);
          setTimeout(() => tip.remove(), 7600);
          SBR.meta.sprintHintSeen2 = true; SBR.saveMeta();
        }
        await countdown();
      })();
    });
  }
  return { run };
})();
