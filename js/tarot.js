/* The Arrow's choice as a tarot reading: three cards dealt face down, turned one by one,
   each showing a Stand, its arcana, its passive and its three moves. Pick one and it awakens. */
'use strict';
(() => {
  const { el } = SBR.util;
  // Part 3 Stands carry their real arcana; later parts are named for their part
  const ARCANA = {
    star_platinum: ['XVII', 'THE STAR'], magicians_red: ['I', 'THE MAGICIAN'], hierophant: ['V', 'THE HIEROPHANT'], silver_chariot: ['VII', 'THE CHARIOT'],
  };
  const PART_NAME = { 3: 'STARDUST CRUSADERS', 4: 'DIAMOND IS UNBREAKABLE', 5: 'GOLDEN WIND', 6: 'STONE OCEAN' };
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const LV = [1, 3, 5];
  const abIds = P => (P.abilities || []).map(a => (typeof a === 'string' ? a : a.id));
  const esc = s => String(s).replace(/</g, '&lt;');

  function cardFace(id, i) {
    const P = SBR.PATHS[id];
    const [num, arc] = ARCANA[id] || [ROMAN[P.part] || '?', PART_NAME[P.part] || 'THE UNKNOWN'];
    const fig = SBR.stands && SBR.stands.svg(P.stand) || '';
    const moves = abIds(P).map((a, k) => { const A = SBR.ABILITIES[a]; return A ? `<li><em>Lv${LV[k] || k + 1}</em><b>${A.name}</b><span>${esc(A.desc(1))}</span></li>` : ''; }).join('');
    return `<div class="tc-inner" style="--tc:${P.color}">
      <div class="tc-back"><div class="tcb-frame"><div class="tcb-arrow">${arrowSvg()}</div><div class="tcb-text">STAND</div></div></div>
      <div class="tc-front">
        <div class="tc-top"><span class="tc-num">${num}</span><span class="tc-arc">${arc}</span></div>
        <div class="tc-art"><div class="tc-rays"></div><div class="tc-fig">${fig}</div><div class="tc-kana">ゴゴゴ</div></div>
        <div class="tc-name">「${P.name}」</div>
        <div class="tc-part">PART ${ROMAN[P.part] || P.part}</div>
        <div class="tc-desc">${esc(P.desc)}</div>
        <div class="tc-passive">${esc(P.passive)}</div>
        <ul class="tc-moves">${moves}</ul>
        <div class="tc-key">${i + 1}</div>
      </div></div>`;
  }
  function arrowSvg() {
    return `<svg viewBox="0 0 60 120"><path d="M30 4L46 40L34 36V112H26V36L14 40z" fill="#f2c14e" stroke="#1a1020" stroke-width="3" stroke-linejoin="round"/><path d="M30 12L40 36L30 33L20 36z" fill="#fff3c0" opacity=".6"/><circle cx="30" cy="70" r="8" fill="#c8323c" stroke="#1a1020" stroke-width="2.5"/><path d="M18 100h24M20 108h20" stroke="#1a1020" stroke-width="3"/></svg>`;
  }

  /** the reading: resolves with the chosen path id */
  function reading(pool, fate) {
    return new Promise(resolve => {
      const wrap = el('div', { class: 'tarot-wrap' });
      wrap.innerHTML = `<div class="tr-bg"></div><div class="tr-motes">${[...Array(24)].map(() => `<i style="--x:${Math.random() * 100}%;--d:${(Math.random() * 6).toFixed(1)}s;--s:${(0.5 + Math.random()).toFixed(2)}"></i>`).join('')}</div>
        <div class="tr-kana l">ゴ<br>ゴ<br>ゴ</div><div class="tr-kana r">ド<br>ド<br>ド</div>
        <div class="tr-head">${fate ? '<small>YOU BLACK OUT</small><b>The Arrow chooses for you</b><span>One card turns in the dark.</span>' : '<small>THE ARROW PIERCES YOU</small><b>Three fates turn in the dark</b><span>Choose the one that stays.</span>'}</div>
        <div class="tr-cards"></div>
        <div class="tr-foot"><button class="btn btn-primary tr-go" disabled>Choose a card</button></div>`;
      document.getElementById('overlay').appendChild(wrap);
      const row = wrap.querySelector('.tr-cards'), go = wrap.querySelector('.tr-go');
      const cards = pool.map((id, i) => { const c = el('div', { class: 'tarot-card', html: cardFace(id, i), dataset: { id } }); c.style.setProperty('--i', i); row.appendChild(c); return c; });
      let pick = null, ready = false, done = false;
      requestAnimationFrame(() => wrap.classList.add('show'));
      SBR.audio.play('menace');
      // deal, then turn them one by one
      cards.forEach((c, i) => setTimeout(() => { c.classList.add('dealt'); SBR.audio.play('page'); }, 350 + i * 220));
      cards.forEach((c, i) => setTimeout(() => { c.classList.add('flipped'); SBR.audio.play('spin'); if (i === cards.length - 1) { ready = true; if (fate) setTimeout(() => { select(c); setTimeout(confirm, 900); }, 700); } }, 1500 + i * 550));
      const select = c => {
        if (!ready || done) return;
        pick = c; SBR.audio.play('select');
        cards.forEach(x => x.classList.toggle('chosen', x === c));
        row.classList.add('has-pick');
        go.disabled = false; go.textContent = `Awaken 「${SBR.PATHS[c.dataset.id].name}」 ▸`;
      };
      cards.forEach(c => c.addEventListener('click', () => (pick === c ? confirm() : select(c))));
      const onKey = e => { const n = +e.key; if (n >= 1 && n <= cards.length) select(cards[n - 1]); if (e.key === 'Enter' && pick) confirm(); };
      document.addEventListener('keydown', onKey);
      go.addEventListener('click', () => confirm());
      function confirm() {
        if (!pick || done) return;
        done = true;
        document.removeEventListener('keydown', onKey);
        const id = pick.dataset.id, P = SBR.PATHS[id];
        wrap.classList.add('awaken'); wrap.style.setProperty('--tc', P.color);
        cards.forEach(x => { if (x !== pick) x.classList.add('burn'); });
        pick.classList.add('rise');
        SBR.audio.play('boom');
        setTimeout(() => {
          const t = el('div', { class: 'tr-title', html: `<small>YOUR STAND</small><b>「${P.name}」</b><i>ドドドドド</i>` });
          wrap.appendChild(t); SBR.audio.play('level');
          if (SBR.ui.shake) SBR.ui.shake(undefined, true);
        }, 700);
        setTimeout(() => { wrap.classList.add('out'); setTimeout(() => { wrap.remove(); resolve(id); }, 450); }, 2900);
      }
    });
  }
  SBR.tarotReading = reading;
  /** the Arrow picked already: show its one card turning over */
  SBR.tarotFate = id => reading([id], true);

  SBR.standPick = g => {
    const pool = SBR.util.shuffle(SBR.CUSTOM_STANDS.slice()).slice(0, 3);
    return reading(pool).then(id => {
      const r = SBR.run; const i = (r.trinkets || []).indexOf('stand_arrow'); if (i >= 0) r.trinkets.splice(i, 1);
      r.flags.arrowGone = true;
      g.takePath(id);
    });
  };
})();
