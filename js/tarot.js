/* The Arrow's choice as a tarot reading, drawn like the Stardust Crusaders deck: a deck spins, three cards are dealt
   face down and turned one by one. Each face is an ornate gold card: a roman numeral in a keystone crest, the Stand in an
   arched window with rays and aged paper, a scroll banner with its arcana and 「name」. Passive and moves are read in
   the panel under the cards. Pick one and it awakens.
   Every Drifter Stand has an arcana (ARCANA below): Part 3 Stands carry their real one; later parts get a themed
   major arcana with the musician they are named for as the card's subtitle. */
'use strict';
(() => {
  const { el } = SBR.util;
  // id: [numeral, arcana, musician (Parts 4-8)]; all 22 major arcana, each used once
  const ARCANA = {
    the_fool: ['0', 'THE FOOL'], magicians_red: ['I', 'THE MAGICIAN'], hierophant: ['V', 'THE HIEROPHANT'], silver_chariot: ['VII', 'THE CHARIOT'],
    hermit_purple: ['IX', 'THE HERMIT'], star_platinum: ['XVII', 'THE STAR'], the_world: ['XXI', 'THE WORLD'],
    whitesnake: ['II', 'THE HIGH PRIESTESS', 'WHITESNAKE'], heavens_door: ['III', 'THE EMPRESS', 'BOB DYLAN'], aerosmith: ['IV', 'THE EMPEROR', 'AEROSMITH'],
    soft_wet: ['VI', 'THE LOVERS', 'PRINCE'], stone_free: ['VIII', 'STRENGTH', 'JIMI HENDRIX'], made_in_heaven: ['X', 'WHEEL OF FORTUNE', 'QUEEN'],
    sticky_fingers: ['XI', 'JUSTICE', 'THE ROLLING STONES'], purple_haze: ['XII', 'THE HANGED MAN', 'JIMI HENDRIX'], killer_queen: ['XIII', 'DEATH', 'QUEEN'],
    crazy_diamond: ['XIV', 'TEMPERANCE', 'PINK FLOYD'], king_crimson: ['XV', 'THE DEVIL', 'KING CRIMSON'], the_hand: ['XVI', 'THE TOWER', 'THE THE'],
    weather_report: ['XVIII', 'THE MOON', 'WEATHER REPORT'], gold_experience: ['XIX', 'THE SUN', 'PRINCE'], echoes: ['XX', 'JUDGEMENT', 'PINK FLOYD'],
  };
  // numeral: [Japanese card name, omen]
  const OMEN = {
    0: ['愚者', 'a leap into the unknown'], I: ['魔術師', 'will made into fire'], II: ['女教皇', 'secrets and hidden memory'], III: ['女帝', 'creation, the written word'],
    IV: ['皇帝', 'command, the gun that rules'], V: ['法王', 'doctrine and a steady hand'], VI: ['恋人', 'a bond, a choice of the heart'], VII: ['戦車', 'victory through speed'],
    VIII: ['力', 'courage that will not break'], IX: ['隠者', 'the lamp that seeks in the dark'], X: ['運命の輪', 'the turning of fate'], XI: ['正義', 'a debt paid in full'],
    XII: ['吊られた男', 'sacrifice, a world upended'], XIII: ['死神', 'an ending, a quiet change'], XIV: ['節制', 'restoration and balance'], XV: ['悪魔', 'bondage to a hidden master'],
    XVI: ['塔', 'sudden ruin'], XVII: ['星', 'hope, a guiding light'], XVIII: ['月', 'illusion, fear in the fog'], XIX: ['太陽', 'life, the gift of the sun'],
    XX: ['審判', 'awakening, a voice that calls'], XXI: ['世界', 'completion, the world entire'],
  };
  const PART_NAME = { 3: 'STARDUST CRUSADERS', 4: 'DIAMOND IS UNBREAKABLE', 5: 'GOLDEN WIND', 6: 'STONE OCEAN', 7: 'STEEL BALL RUN', 8: 'JOJOLION' };
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  const LV = [1, 3, 5];
  const abIds = P => (P.abilities || []).map(a => (typeof a === 'string' ? a : a.id));
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const K = '#2a1608', BR = '#6a4414';

  /** [numeral, arcana, subtitle, japanese, omen] for a path */
  function arcanaOf(id) {
    const P = SBR.PATHS[id] || {};
    const a = ARCANA[id] || P.arcana || [ROMAN[P.part] || '?', PART_NAME[P.part] || 'THE UNKNOWN'];
    const o = OMEN[a[0]] || ['', ''];
    return { num: a[0], arc: a[1], music: a[2] || null, jp: o[0], omen: o[1] };
  }

  /* shared SVG defs: gradients, paper grain, lattice (once per page; ids referenced by every card) */
  function ensureDefs() {
    if (document.getElementById('tcDefs')) return;
    const d = document.createElement('div');
    d.innerHTML = `<svg id="tcDefs" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs>
      <linearGradient id="tcGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a4a12"/><stop offset=".22" stop-color="#f7d97a"/><stop offset=".45" stop-color="#b8862a"/><stop offset=".68" stop-color="#fff0b0"/><stop offset="1" stop-color="#8a5a18"/></linearGradient>
      <linearGradient id="tcGoldV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".4" stop-color="#d8a640"/><stop offset=".6" stop-color="#b8862a"/><stop offset="1" stop-color="#f2cf6a"/></linearGradient>
      <linearGradient id="tcPaper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8ecd0"/><stop offset=".6" stop-color="#efdcb0"/><stop offset="1" stop-color="#e0c08a"/></linearGradient>
      <linearGradient id="tcRibbon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6de"/><stop offset=".55" stop-color="#f2dfb2"/><stop offset="1" stop-color="#d9b877"/></linearGradient>
      <radialGradient id="tcVig" cx="50%" cy="55%" r="65%"><stop offset=".55" stop-color="#5a3008" stop-opacity="0"/><stop offset="1" stop-color="#5a3008" stop-opacity=".6"/></radialGradient>
      <radialGradient id="tcHalo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fffbe8" stop-opacity=".95"/><stop offset=".6" stop-color="#fff2c0" stop-opacity=".35"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></radialGradient>
      <filter id="tcGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" values="0 0 0 0 .36  0 0 0 0 .22  0 0 0 0 .07  0 0 0 -1.4 1.05"/><feComposite operator="in" in2="SourceGraphic"/></filter>
      <filter id="tcStain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .28  0 0 0 0 .08  0 0 0 -2.2 1.25"/><feComposite operator="in" in2="SourceGraphic"/></filter>
      <pattern id="tcLattice" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M9 0L18 9L9 18L0 9Z" fill="none" stroke="#e8b84a" stroke-width=".8" opacity=".55"/><circle cx="9" cy="9" r="1.3" fill="#e8b84a" opacity=".7"/><circle cx="0" cy="0" r=".9" fill="#e8b84a" opacity=".5"/><circle cx="18" cy="18" r=".9" fill="#e8b84a" opacity=".5"/></pattern>
    </defs></svg>`;
    document.body.appendChild(d.firstChild);
  }

  /* ---------- the frame ---------- */
  // one corner of filigree, drawn for the top-left and mirrored into the others
  const corner = (stroke, jewel) => `<g fill="none" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round">
      <path d="M5 40C5 20 18 6 40 5"/><path d="M11 50C12 32 21 20 31 15C41 10 50 14 48 23C46 30 37 30 37 23C37 19 41 18 43 20"/>
      <path d="M50 11C32 12 20 21 15 31C10 41 14 50 23 48C30 46 30 37 23 37C19 37 18 41 20 43"/><path d="M26 26l6 6" stroke-width="1"/></g>
    <path d="M0 0H22L0 22Z" fill="url(#tcGold)" stroke="${K}" stroke-width="1"/><path d="M29 29q9-3 13 4q-9 3-13-4z" fill="url(#tcGold)" stroke="${BR}" stroke-width=".7"/>
    <circle cx="9" cy="9" r="3.4" fill="${jewel}" stroke="${K}" stroke-width="1"/><circle cx="8" cy="8" r="1" fill="#fff" opacity=".7"/>`;
  const corners = (stroke, jewel, s = 1, sb = s) => [[10, 10, 1, 1, s], [210, 10, -1, 1, s], [10, 370, 1, -1, sb], [210, 370, -1, -1, sb]]
    .map(([x, y, a, b, k]) => `<g transform="translate(${x} ${y}) scale(${a * k} ${b * k})">${corner(stroke, jewel)}</g>`).join('');
  const frame = inner => `<rect x="1.5" y="1.5" width="217" height="377" rx="12" fill="${K}"/><rect x="5" y="5" width="210" height="370" rx="9" fill="url(#tcGold)"/>
    <rect x="5.8" y="5.8" width="208.4" height="368.4" rx="8.4" fill="none" stroke="#fff4c4" stroke-width=".7" opacity=".7"/>${inner}`;

  let uid = 0;
  /** the face of a card as one SVG (scales cleanly at any card width) */
  function faceSvg(id) {
    const P = SBR.PATHS[id] || {};
    const A = arcanaOf(id), n = ++uid, col = P.color || '#f2c14e';
    let fig = (SBR.stands && P.stand && SBR.stands.svg(P.stand)) || (SBR.PATH_EMBLEM && SBR.PATH_EMBLEM[id] ? SBR.PATH_EMBLEM[id]() : '');
    fig = fig.replace(/<svg\b([^>]*?)\sclass="[^"]*"/, '<svg$1').replace(/<svg\b/, '<svg class="tc-standsvg" x="24" y="72" width="172" height="192" preserveAspectRatio="xMidYMax meet"');
    const arch = 'M24 262V122C24 82 62 58 110 58C158 58 196 82 196 122V262Z';
    const rays = [...Array(18)].map((_, i) => { const a0 = (i * 20) * Math.PI / 180, a1 = (i * 20 + 9) * Math.PI / 180, R = 260; return `M110 168L${(110 + R * Math.cos(a0)).toFixed(1)} ${(168 + R * Math.sin(a0)).toFixed(1)}L${(110 + R * Math.cos(a1)).toFixed(1)} ${(168 + R * Math.sin(a1)).toFixed(1)}Z`; }).join('');
    // the lettering is HTML over the art (SVG text misplaces itself mid-animation in Chrome); sizes are in cqw of the card
    const fit = (txt, base, per) => Math.min(base, per / Math.max(1, txt.length)).toFixed(2) + 'cqw';
    const name = `「${P.name || id}」`, sub = A.music ? `♪ ${A.music}` : `「${A.jp}」のカード`;
    const partTxt = `PART ${ROMAN[P.part] || P.part || '?'}${P.rarity ? ' · ★ ' + P.rarity : ''}`;
    const text = `<div class="tcx"><div class="tcx-num" style="font-size:${fit(A.num, 11.8, 36)}">${esc(A.num)}</div>
      <div class="tcx-arc" style="font-size:${fit(A.arc, 6.6, 82)}">${esc(A.arc)}</div>
      <div class="tcx-name" style="font-size:${fit(name, 7.6, 118)}">${esc(name)}</div>
      <div class="tcx-sub${A.music ? '' : ' jp'}" style="font-size:${fit(sub, 4.4, 72)}">${esc(sub)}</div>
      <div class="tcx-part">${esc(partTxt)}</div></div>`;
    return `<div class="tc-face"><svg class="tc-svg" viewBox="0 0 220 380" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
        <clipPath id="tcw${n}"><path d="${arch}"/></clipPath>
        <radialGradient id="tcbg${n}" cx="50%" cy="58%" r="70%"><stop offset="0" stop-color="#fff6d8"/><stop offset=".5" stop-color="${col}" stop-opacity=".85"/><stop offset="1" stop-color="${K}"/></radialGradient></defs>
      ${frame(`<rect x="10" y="10" width="200" height="360" rx="6" fill="url(#tcPaper)"/>
      <rect x="10" y="10" width="200" height="360" rx="6" fill="#fff" filter="url(#tcStain)" opacity=".55"/>
      <rect x="10" y="10" width="200" height="360" rx="6" fill="#fff" filter="url(#tcGrain)" opacity=".5"/>
      <rect x="14" y="14" width="192" height="352" rx="4" fill="none" stroke="${BR}" stroke-width=".9"/>
      <rect x="17" y="17" width="186" height="346" rx="3" fill="none" stroke="${BR}" stroke-width=".7" stroke-dasharray="1 2.4"/>`)}
      ${corners(BR, '#c8323c', 1, 0.72)}
      <g clip-path="url(#tcw${n})">
        <rect x="20" y="50" width="180" height="220" fill="url(#tcbg${n})"/>
        <g class="tc-rays"><path d="${rays}" fill="#fff8e0" opacity=".32"/></g>
        <ellipse cx="110" cy="150" rx="70" ry="70" fill="url(#tcHalo)"/>
        <path d="M24 246Q70 236 110 244T196 240V262H24Z" fill="${K}" opacity=".28"/><path d="M30 252h40M90 256h50M150 251h40" stroke="${K}" stroke-width="1" opacity=".35"/>
        ${fig}
        <rect x="20" y="50" width="180" height="220" fill="#fff" filter="url(#tcGrain)" opacity=".35" style="mix-blend-mode:multiply"/>
        <rect x="20" y="50" width="180" height="220" fill="url(#tcVig)"/>
        <rect x="20" y="50" width="180" height="220" fill="#d8a860" opacity=".2" style="mix-blend-mode:multiply"/>
      </g>
      <path d="${arch}" fill="none" stroke="${K}" stroke-width="3.6"/><path d="${arch}" fill="none" stroke="url(#tcGoldV)" stroke-width="1.5"/>
      <path d="M18 128V258M21 132V256M202 128V258M199 132V256" stroke="url(#tcGoldV)" stroke-width="1.1"/>
      ${[150, 180, 210, 240].map(y => `<circle cx="19.5" cy="${y}" r="1.6" fill="url(#tcGold)" stroke="${K}" stroke-width=".5"/><circle cx="200.5" cy="${y}" r="1.6" fill="url(#tcGold)" stroke="${K}" stroke-width=".5"/>`).join('')}
      <g class="tc-crest">
        <path d="M74 27C60 20 50 28 42 21C38 17 42 12 46 15" fill="none" stroke="${BR}" stroke-width="1.3" stroke-linecap="round"/><path d="M146 27C160 20 170 28 178 21C182 17 178 12 174 15" fill="none" stroke="${BR}" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M78 13H142L149 22Q153 42 134 54L110 67L86 54Q67 42 71 22Z" fill="url(#tcGold)" stroke="${K}" stroke-width="1.8"/>
        <path d="M83 18H137L142 24Q145 40 130 49L110 60L90 49Q75 40 78 24Z" fill="#f6e6bf" stroke="${BR}" stroke-width=".9"/>
        ${[[58, 40], [162, 40]].map(([x, y]) => `<path d="M${x} ${y - 5}L${x + 1.5} ${y - 1.5}L${x + 5} ${y}L${x + 1.5} ${y + 1.5}L${x} ${y + 5}L${x - 1.5} ${y + 1.5}L${x - 5} ${y}L${x - 1.5} ${y - 1.5}Z" fill="url(#tcGold)" stroke="${K}" stroke-width=".6"/>`).join('')}
        <circle cx="110" cy="61" r="2.6" fill="#c8323c" stroke="${K}" stroke-width=".8"/>
      </g>
      <g class="tc-banner">
        <path d="M13 276H42V302H13L22 289Z" fill="#b8862a" stroke="${K}" stroke-width="1.3"/><path d="M207 276H178V302H207L198 289Z" fill="#b8862a" stroke="${K}" stroke-width="1.3"/>
        <path d="M42 302L50 297V302Z M178 302L170 297V302Z" fill="#6a4414"/>
        <path d="M34 270Q110 262 186 270V297Q110 289 34 297Z" fill="url(#tcRibbon)" stroke="${K}" stroke-width="1.5"/>
        <path d="M38 273.5Q110 266 182 273.5M38 293.5Q110 286 182 293.5" fill="none" stroke="#b8862a" stroke-width=".8"/>
      </g>
      <path d="M72 359H104M116 359H148" stroke="${BR}" stroke-width=".9"/><path d="M110 355L114 359L110 363L106 359Z" fill="url(#tcGold)" stroke="${K}" stroke-width=".7"/>
    </svg>${text}</div>`;
  }

  /** the back: burgundy lattice, gold medallion with the Arrow and the Joestar star */
  function backSvg() {
    const star = (cx, cy, r) => `<path d="${[...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; return (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1); }).join('')}Z"`;
    const burst = [...Array(32)].map((_, i) => { const a = i * Math.PI / 16, r = i % 2 ? 44 : 60; return (i ? 'L' : 'M') + (110 + r * Math.cos(a)).toFixed(1) + ' ' + (190 + r * Math.sin(a)).toFixed(1); }).join('') + 'Z';
    const cart = (y, flip) => `<g transform="${flip ? `rotate(180 110 ${y})` : ''}"><path d="M62 ${y - 13}H158L166 ${y}L158 ${y + 13}H62L54 ${y}Z" fill="#1a0610" stroke="url(#tcGold)" stroke-width="2"/><path d="M66 ${y - 9}H154L159 ${y}L154 ${y + 9}H66L61 ${y}Z" fill="none" stroke="#e8b84a" stroke-width=".6" opacity=".7"/></g>`;
    return `<div class="tc-face tc-backface"><svg class="tc-svg" viewBox="0 0 220 380" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${frame(`<rect x="10" y="10" width="200" height="360" rx="6" fill="#3a0c18"/><rect x="10" y="10" width="200" height="360" rx="6" fill="url(#tcLattice)"/>
      <rect x="10" y="10" width="200" height="360" rx="6" fill="#fff" filter="url(#tcGrain)" opacity=".18"/>
      <rect x="15" y="15" width="190" height="350" rx="4" fill="none" stroke="url(#tcGold)" stroke-width="2"/><rect x="19" y="19" width="182" height="342" rx="3" fill="none" stroke="#e8b84a" stroke-width=".6" stroke-dasharray="1 2.4"/>`)}
      ${corners('#e8b84a', '#2a7ad0')}
      ${cart(52)}${cart(328, true)}
      <circle cx="110" cy="190" r="72" fill="none" stroke="#e8b84a" stroke-width=".8" stroke-dasharray="2 3" opacity=".8"/>
      <path d="${burst}" fill="url(#tcGold)" stroke="${K}" stroke-width="1"/>
      <circle cx="110" cy="190" r="40" fill="#1a0610" stroke="url(#tcGold)" stroke-width="3"/><circle cx="110" cy="190" r="34" fill="none" stroke="#e8b84a" stroke-width=".7"/>
      <g transform="translate(110 190) scale(.52) translate(-30 -60)"><path d="M30 4L46 40L34 36V112H26V36L14 40z" fill="#f2c14e" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M30 12L40 36L30 33L20 36z" fill="#fff3c0" opacity=".6"/><circle cx="30" cy="70" r="7" fill="#c8323c" stroke="${K}" stroke-width="2.5"/><path d="M18 100h24M20 108h20" stroke="${K}" stroke-width="3"/></g>
      ${star(110, 102, 10)} fill="url(#tcGold)" stroke="${K}" stroke-width="1"/>${star(110, 278, 10)} fill="url(#tcGold)" stroke="${K}" stroke-width="1"/>
      ${star(40, 190, 6)} fill="#e8b84a"/>${star(180, 190, 6)} fill="#e8b84a"/>
      <path d="M40 120Q60 150 50 190Q60 230 40 260M180 120Q160 150 170 190Q160 230 180 260" fill="none" stroke="#e8b84a" stroke-width="1" opacity=".75"/>
    </svg><div class="tcx-back t">STAND</div><div class="tcx-back b">STAND</div></div>`;
  }

  function cardFace(id, i) {
    const P = SBR.PATHS[id];
    return `<div class="tc-inner" style="--tc:${P.color}">
      <div class="tc-back">${backSvg()}</div>
      <div class="tc-front">${faceSvg(id)}<div class="tc-foil"></div><div class="tc-key">${i + 1}</div></div></div>`;
  }
  /** what the card says, read in the panel under the cards */
  function detail(id) {
    const P = SBR.PATHS[id], A = arcanaOf(id);
    const moves = abIds(P).map((a, k) => { const AB = SBR.ABILITIES[a]; return AB ? `<li><em>Lv${LV[k] || k + 1}</em><b>${esc(AB.name)}</b><span>${esc(AB.desc(1))}</span></li>` : ''; }).join('');
    return `<div class="trd-head"><b>「${esc(P.name)}」</b><span>${esc(A.num)} · ${esc(A.arc)}${A.music ? ` · ♪ ${esc(A.music)}` : ''} — <i>${esc(A.omen)}</i></span></div>
      <p class="trd-desc">${esc(P.desc)}</p><div class="trd-passive">${esc(P.passive)}</div><ul class="trd-moves">${moves}</ul>`;
  }

  /** the reading: resolves with the chosen path id */
  function reading(pool, fate) {
    ensureDefs();
    return new Promise(resolve => {
      const calm = !!SBR.settings.reducedMotion;
      const prevMusic = SBR.music ? SBR.music.current || SBR.music.wanted : null;
      if (SBR.music && SBR.MUSIC_THEMES && SBR.MUSIC_THEMES.tarot) SBR.music.play('tarot');
      const wrap = el('div', { class: 'tarot-wrap' + (calm ? ' calm' : '') });
      wrap.innerHTML = `<div class="tr-bg"></div><div class="tr-ring"></div><div class="tr-motes">${[...Array(24)].map(() => `<i style="--x:${Math.random() * 100}%;--d:${(Math.random() * 6).toFixed(1)}s;--s:${(0.5 + Math.random()).toFixed(2)}"></i>`).join('')}</div>
        <div class="tr-kana l">ゴ<br>ゴ<br>ゴ</div><div class="tr-kana r">ド<br>ド<br>ド</div>
        <div class="tr-head">${fate ? '<small>YOU BLACK OUT</small><b>The Arrow chooses for you</b><span>One card turns in the dark.</span>' : '<small>THE ARROW PIERCES YOU</small><b>Three fates turn in the dark</b><span>Choose the one that stays.</span>'}</div>
        <div class="tr-cards"><div class="tr-deck">${[0, 1, 2, 3, 4].map(k => `<div class="trk" style="--k:${k}">${backSvg()}</div>`).join('')}</div></div>
        <div class="tr-detail"><div class="trd-hint">Hover a card to read its fate · keys 1–${pool.length}</div></div>
        <div class="tr-foot"><button class="btn btn-primary tr-go" disabled>Choose a card</button></div>`;
      document.getElementById('overlay').appendChild(wrap);
      const row = wrap.querySelector('.tr-cards'), go = wrap.querySelector('.tr-go'), deck = wrap.querySelector('.tr-deck'), info = wrap.querySelector('.tr-detail');
      const cards = pool.map((id, i) => { const c = el('div', { class: 'tarot-card', html: cardFace(id, i), dataset: { id } }); c.style.setProperty('--i', i - (pool.length - 1) / 2); row.appendChild(c); return c; });
      // every card starts stacked on the deck
      cards.forEach(c => { c.style.transition = 'none'; c.style.transform = 'none'; });
      const rects = cards.map(c => c.getBoundingClientRect());
      const b = deck.getBoundingClientRect();
      cards.forEach((c, i) => { const a = rects[i]; c.style.setProperty('--dx', (b.left + b.width / 2 - a.left - a.width / 2).toFixed(0) + 'px'); c.style.setProperty('--dy', (b.top + b.height / 2 - a.top - a.height / 2).toFixed(0) + 'px'); c.style.transform = ''; });
      void row.offsetWidth; cards.forEach(c => { c.style.transition = ''; });
      let pick = null, ready = false, done = false, shown = null;
      const show = c => { if (!c || shown === c) return; shown = c; info.innerHTML = detail(c.dataset.id); info.classList.add('on'); };
      requestAnimationFrame(() => wrap.classList.add('show'));
      SBR.audio.play('menace');
      const T0 = calm ? 100 : 950, TF = calm ? 300 : 1650, DI = calm ? 60 : 200, FI = calm ? 150 : 420;
      if (!calm) setTimeout(() => { deck.classList.add('spin'); SBR.audio.play('shuffle'); }, 150);
      // deal from the deck, then turn them one by one
      cards.forEach((c, i) => setTimeout(() => { c.classList.add('dealt'); SBR.audio.play('deal'); }, T0 + i * DI));
      setTimeout(() => deck.classList.add('gone'), T0 + cards.length * DI + 100);
      cards.forEach((c, i) => setTimeout(() => {
        c.classList.add('flipped'); SBR.audio.play('flip');
        if (i === cards.length - 1) { ready = true; if (fate) { show(c); setTimeout(() => { select(c); setTimeout(confirm, 900); }, 700); } }
      }, TF + i * FI));
      const select = c => {
        if (!ready || done) return;
        pick = c; SBR.audio.play('select');
        cards.forEach(x => x.classList.toggle('chosen', x === c));
        row.classList.add('has-pick'); show(c); shown = c;
        go.disabled = false; go.textContent = `Awaken 「${SBR.PATHS[c.dataset.id].name}」 ▸`;
      };
      cards.forEach(c => {
        c.addEventListener('click', () => (pick === c ? confirm() : select(c)));
        c.addEventListener('mouseenter', () => { if (c.classList.contains('flipped')) { show(c); SBR.audio.play('hover'); } });
        c.addEventListener('mouseleave', () => { c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); if (pick && pick !== c) { shown = null; show(pick); } });
        // foil and tilt follow the mouse
        c.addEventListener('mousemove', e => {
          if (calm || !c.classList.contains('flipped')) return;
          const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          c.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); c.style.setProperty('--my', (y * 100).toFixed(1) + '%');
          c.style.setProperty('--rx', ((x - 0.5) * 16).toFixed(1) + 'deg'); c.style.setProperty('--ry', ((0.5 - y) * 12).toFixed(1) + 'deg');
        });
      });
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
          const A = arcanaOf(id);
          const t = el('div', { class: 'tr-title', html: `<small>YOUR STAND · ${esc(A.num)} ${esc(A.arc)}</small><b>「${esc(P.name)}」</b><i>ドドドドド</i>` });
          wrap.appendChild(t); SBR.audio.play('level');
          if (SBR.ui.shake && !calm) SBR.ui.shake(undefined, true);
        }, 700);
        setTimeout(() => {
          wrap.classList.add('out');
          setTimeout(() => {
            wrap.remove();
            if (SBR.music && (SBR.music.current === 'tarot' || SBR.music.wanted === 'tarot')) SBR.music.play(prevMusic && prevMusic !== 'tarot' ? prevMusic : SBR.music.themeForStage());
            resolve(id);
          }, 450);
        }, 2900);
      }
    });
  }
  SBR.tarotReading = reading;
  /** the Arrow picked already: show its one card turning over */
  SBR.tarotFate = id => reading([id], true);
  /** the card art on its own (gallery, compendium): face or back SVG markup */
  SBR.tarotCard = { face: id => (ensureDefs(), faceSvg(id)), back: () => (ensureDefs(), backSvg()), arcana: arcanaOf, ARCANA };

  SBR.standPick = g => {
    const pool = SBR.standDraw ? SBR.standDraw(3) : SBR.util.shuffle(SBR.CUSTOM_STANDS.slice()).slice(0, 3);
    return reading(pool).then(id => {
      const r = SBR.run; const i = (r.trinkets || []).indexOf('stand_arrow'); if (i >= 0) r.trinkets.splice(i, 1);
      r.flags.arrowGone = true;
      g.takePath(id);
    });
  };
})();
