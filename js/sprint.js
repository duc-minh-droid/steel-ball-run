/* Stage-finish sprint minigame: time presses to the Golden Rectangle ring */
'use strict';
SBR.sprint = (() => {
  const { el, sleep } = SBR.util;
  const art = SBR.art;

  function run({ name, act, favourite, tutorial }) {
    SBR.music.play('sprint');
    return new Promise(resolve => {
      const r = SBR.run;
      const horse = SBR.HORSES[r.horse];
      const b = SBR.bonus();
      const johnny = r.party.find(m => m.id === 'johnny');
      const ride = johnny ? johnny.stats.ride + (horse.bonus.ride || 0) : 6;

      // participants
      const rivalKeys = Object.keys(SBR.RIVALS).filter(k => {
        const rv = SBR.RIVALS[k];
        if (rv.outAfter && act > rv.outAfter) return false;
        if (k === 'gyro' && r.flags.valDead) return false;
        if (k === 'diego' && act === 5 && r.flags.valDead) return false;
        return true;
      });
      let chosen = SBR.util.shuffle(rivalKeys.filter(k => k !== favourite)).slice(0, 4);
      if (favourite && rivalKeys.includes(favourite)) chosen.unshift(favourite); else chosen = SBR.util.shuffle(rivalKeys).slice(0, 5);
      chosen = chosen.slice(0, 5);
      const LEN = 1000;
      const startOffset = (r.pace - 50) * 1.6;
      const actScale = 1.1 + (act - 1) * 0.05;
      const runners = [{ key: 'player', name: 'Johnny', coat: horse.coat, mane: horse.mane, wrap: horse.wrap, spots: horse.spots, pos: startOffset, speed: 0, base: 44 + horse.speed * 2.2 + ride * 0.25, player: true }]
        .concat(chosen.map((k, i) => {
          const rv = SBR.RIVALS[k];
          const coats = ['#c8c8d0', '#6a4a2a', '#e8d8c0', '#3a2a1a', '#8a5a30', '#b8703a'];
          return { key: k, name: rv.name.split(' ')[0], coat: coats[i % coats.length], mane: '#1a1020', wrap: ['#3fb8a9', '#e8508a', '#f2c14e', '#c8323c', '#6b5bd6'][i % 5], pos: SBR.util.randInt(-30, 20), speed: 0, base: (47 + horse.speed * 0.4) * rv.speed * actScale * (k === favourite ? 1.12 : 1), surge: 0 };
        }));

      // DOM
      const wrap = el('div', { class: 'sprint' });
      wrap.innerHTML = `<div class="sprint-scene">${art.scene(SBR.ACTS[act] ? SBR.ACTS[act].scene : 1)}</div>
        <div class="sprint-head"><div class="sprint-name">${name}</div><div class="sprint-sub">Press <b>SPACE</b> / click when the needle hits <span class="gold">GOLD</span></div></div>
        <div class="sprint-track"></div>
        <div class="sprint-progress"><div class="sp-line"></div></div>
        <div class="sprint-ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="rgba(26,16,32,.75)" stroke="#1a1020" stroke-width="10"/><circle cx="100" cy="100" r="80" fill="none" stroke="#f6ecd8" stroke-width="4" opacity=".3"/><path class="zone-good" fill="none" stroke="#6b5bd6" stroke-width="16"/><path class="zone-gold" fill="none" stroke="#f2c14e" stroke-width="16"/><g class="needle"><line x1="100" y1="100" x2="100" y2="26" stroke="#e8508a" stroke-width="6" stroke-linecap="round"/><circle cx="100" cy="100" r="10" fill="#e8508a" stroke="#1a1020" stroke-width="3"/></g></svg><div class="ring-feedback"></div><div class="ring-combo"></div></div>
        <div class="sprint-stamina"><span>STAMINA</span><div class="stam-bar"><div></div></div></div>
        <div class="sprint-count"></div><div class="sprint-hazard"></div>`;
      document.getElementById('overlay').appendChild(wrap);
      requestAnimationFrame(() => wrap.classList.add('show'));
      const track = wrap.querySelector('.sprint-track');
      const prog = wrap.querySelector('.sprint-progress');
      runners.forEach((rn, i) => {
        rn.node = el('div', { class: 'runner' + (rn.player ? ' me' : ''), style: { top: (i * 15) + '%', zIndex: 10 + i, '--sc': (0.78 + i * 0.07).toFixed(2) } });
        rn.node.innerHTML = `<div class="runner-tag">${rn.player ? 'YOU' : rn.name}</div>${art.horse({ coat: rn.coat, mane: rn.mane, wrap: rn.wrap, spots: rn.spots, rider: { cape: rn.player ? '#5b3a8c' : rn.wrap, body: rn.player ? '#3b5bb5' : '#6a4a2a', hat: rn.player ? '#5b3a8c' : '#3a2a1a' } })}`;
        track.appendChild(rn.node);
        rn.dot = el('div', { class: 'sp-dot' + (rn.player ? ' me' : ''), title: rn.name });
        prog.appendChild(rn.dot);
      });
      const pxLayers = [...wrap.querySelectorAll('.px-layer')];
      pxLayers.forEach(l => { l.style.animation = 'none'; });
      const PX_RATE = [0.15, 0.6, 1.6, 4.2];
      const finishLine = el('div', { class: 'finish-line' }, el('span', {}, 'GOAL'));
      track.appendChild(finishLine);

      // ring state
      const needle = wrap.querySelector('.needle');
      const goldEl = wrap.querySelector('.zone-gold'), goodEl = wrap.querySelector('.zone-good');
      const fb = wrap.querySelector('.ring-feedback'), comboEl = wrap.querySelector('.ring-combo');
      const stamFill = wrap.querySelector('.stam-bar div');
      const goldSize = 26 + ride * 0.6 + (b.sprint || horse.bonus.sprint ? 6 : 0);
      let angle = 0, rot = 200, zone = 90, combo = 0, stamina = 100, cool = 0, boost = 0, stumble = 0;
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

      let started = false, finished = false, finishOrder = [], last = 0, elapsed = 0, hazardT = 4;
      const hazEl = wrap.querySelector('.sprint-hazard');
      const ringEl = wrap.querySelector('.sprint-ring');
      /* Rivals use their Stands to get ahead */
      function hazard() {
        const cands = runners.slice(1).filter(x => !x.done);
        if (!cands.length) return;
        const rn = SBR.util.pick(cands);
        const say = t => { hazEl.innerHTML = t; hazEl.classList.remove('show'); void hazEl.offsetWidth; hazEl.classList.add('show'); SBR.audio.play('menace'); };
        switch (rn.key) {
          case 'diego': rn.surge = 2.5; rn.bigSurge = 2.5; say('DIEGO: 「Scary Monsters」 — raptor legs!'); break;
          case 'hotpants': ringEl.classList.add('blinded'); setTimeout(() => ringEl.classList.remove('blinded'), 1800 / SBR.settings.speed); say('HOT PANTS: 「Cream Starter」 — flesh sprayed over your eyes!'); break;
          case 'pocoloco': rn.pos += 30; say('POCOLOCO: 「Hey Ya!」 — a lucky shortcut!'); break;
          case 'sandman': rn.surge = 3; rn.bigSurge = 3; say('SANDMAN leaves his horse and runs on foot!'); break;
          case 'gyro': stumble = 0.6; say('GYRO\'s steel ball ricochets past your horse!'); break;
          case 'mountaintim': rn.surge = 2; rn.bigSurge = 2; say('MOUNTAIN TIM lassos a shortcut!'); break;
          default: rn.surge = 2; rn.bigSurge = 1.5; say(rn.name.toUpperCase() + ' makes a break for it!');
        }
      }
      function press() {
        if (!started || finished || cool > 0) return;
        cool = 0.28;
        let d = Math.abs(((angle - zone + 540) % 360) - 180);
        if (d <= goldSize / 2) {
          combo++; boost = Math.min(2.2, 0.9 + combo * 0.18); stamina = Math.min(100, stamina + 6);
          feedback(combo >= 3 ? 'GOLDEN!' : 'PERFECT', 'gold'); SBR.audio.play('spin');
          if (combo >= 3) wrap.classList.add('golden'); setTimeout(() => wrap.classList.remove('golden'), 300);
        } else if (d <= goldSize * 1.25) {
          combo = 0; boost = 0.55; feedback('GOOD', 'good'); SBR.audio.play('gallop');
        } else {
          combo = 0; stumble = 0.7; stamina = Math.max(0, stamina - 12); feedback('STUMBLE', 'bad'); SBR.audio.play('miss');
        }
        comboEl.textContent = combo > 1 ? `×${combo}` : '';
        rot = Math.min(420, rot + 12);
        placeZone();
      }
      const onKey = e => { if (e.code === 'Space') { e.preventDefault(); press(); } };
      document.addEventListener('keydown', onKey);
      wrap.addEventListener('mousedown', press);

      function frame(t) {
        if (!last) last = t;
        const dt = Math.min(0.05, (t - last) / 1000) * SBR.settings.speed;
        last = t;
        if (started && !finished) {
          elapsed += dt;
          angle = (angle + rot * dt) % 360;
          needle.setAttribute('transform', `rotate(${angle} 100 100)`);
          cool = Math.max(0, cool - dt);
          boost = Math.max(0, boost - dt * 0.9);
          stumble = Math.max(0, stumble - dt);
          stamina = Math.max(0, stamina - dt * 3.2);
          stamFill.style.width = stamina + '%';
          const me = runners[0];
          me.speed = me.base * (0.72 + stamina / 100 * 0.35) * (1 + boost * 0.45) * (stumble > 0 ? 0.55 : 1);
          runners.slice(1).forEach(rn => {
            rn.surge = Math.max(0, rn.surge - dt);
            if (Math.random() < dt * 0.7) rn.surge = 0.7 + Math.random() * 1;
            const fatigue = 1 - Math.min(0.06, elapsed * 0.002);
            const rubber = rn.pos < runners[0].pos - 60 ? 1.1 : 1;
            rn.speed = rn.base * fatigue * rubber * (1 + (rn.surge > 0 ? (rn.bigSurge > 0 ? 0.6 : 0.32) : 0)) * (0.96 + Math.random() * 0.08);
            rn.bigSurge = Math.max(0, (rn.bigSurge || 0) - dt);
          });
          hazardT -= dt;
          if (hazardT <= 0) { hazardT = 5 + Math.random() * 3; hazard(); }
          runners.forEach(rn => {
            if (rn.done) return;
            rn.pos += rn.speed * dt;
            if (rn.pos >= LEN) { rn.done = true; finishOrder.push(rn); if (rn.player) SBR.audio.play('whistle'); }
          });
          if (runners[0].done && finishOrder.length >= 1) {
            // let the rest resolve instantly by projected time
            const remaining = runners.filter(x => !x.done).sort((a, b) => (LEN - a.pos) / a.speed - (LEN - b.pos) / b.speed);
            remaining.forEach(x => { x.done = true; finishOrder.push(x); });
            end();
          }
        }
        // camera
        const me = runners[0];
        const W = track.clientWidth;
        const scale = W / 360;
        runners.forEach(rn => {
          const x = W * 0.38 + (rn.pos - me.pos) * scale;
          rn.node.style.transform = `translateX(${x}px) scale(var(--sc))`;
          rn.node.classList.toggle('boosting', rn.player ? boost > 0.8 : rn.surge > 0);
          rn.dot.style.left = Math.max(0, Math.min(100, rn.pos / LEN * 100)) + '%';
        });
        finishLine.style.transform = `translateX(${W * 0.38 + (LEN - me.pos) * scale + 80}px)`;
        pxLayers.forEach((l, i) => { const half = l.offsetWidth / 2 || 1; l.style.transform = `translateX(${-((me.pos * PX_RATE[i] + 2000) % half)}px)`; });
        if (!finished) requestAnimationFrame(frame);
      }

      async function countdown() {
        const cd = wrap.querySelector('.sprint-count');
        // real seconds, independent of game speed: 3, 2, 1, GO!
        for (const n of ['3', '2', '1', 'GO!']) {
          cd.textContent = n; cd.classList.remove('pop'); void cd.offsetWidth; cd.classList.add('pop');
          SBR.audio.play(n === 'GO!' ? 'whistle' : 'click');
          await new Promise(r => setTimeout(r, n === 'GO!' ? 450 : 1000));
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
          <div class="podium">${finishOrder.map((x, i) => `<div class="pod-row ${x.player ? 'me' : ''}" style="animation-delay:${i * 0.12}s"><span class="pod-pos">${i + 1}</span><span class="pod-port">${x.player ? art.portrait('johnny') : art.portrait(SBR.RIVALS[x.key].portrait)}</span><span class="pod-name">${x.player ? 'Johnny Joestar' : SBR.RIVALS[x.key].name}</span><span class="pod-pts">+${SBR.POINTS[i] || 3}</span></div>`).join('')}</div>`;
        const go = SBR.ui.btn('Continue ▸', () => { wrap.classList.remove('show'); setTimeout(() => wrap.remove(), 300); resolve({ place, order: finishOrder.map(x => x.key) }); }, 'btn-primary');
        res.appendChild(go);
        wrap.appendChild(res);
        SBR.audio.play(place <= 3 ? 'level' : 'coin');
      }

      requestAnimationFrame(frame);
      (async () => {
        // the race starts straight away; first-timers get a hint banner instead of a blocking dialogue
        if (tutorial || !SBR.meta.sprintHintSeen) {
          const tip = el('div', { class: 'sprint-tip', html: '<b>HOW TO RACE</b> Press <b>SPACE</b> or click when the needle crosses the <span class="gold">GOLD</span> zone to surge. Miss and your horse stumbles. Your act PACE is your head start.' });
          wrap.appendChild(tip);
          setTimeout(() => tip.classList.add('out'), 7000);
          setTimeout(() => tip.remove(), 7600);
          SBR.meta.sprintHintSeen = true; SBR.saveMeta();
        }
        await countdown();
      })();
    });
  }
  return { run };
})();
