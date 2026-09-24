/* Stand figures: drawn SVG for every Stand. Shown briefly when a Stand ability fires; "entity" Stands also hover beside their user. */
'use strict';
SBR.stands = (() => {
  const K = '#1a1020';
  const st = `stroke="${K}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
  let n = 0;
  // Shared muscular silhouette (viewBox 0 0 120 160)
  const BODY = 'M40 50 Q60 42 80 50 L93 58 Q100 74 101 92 L92 96 L85 72 L82 104 L90 152 L75 152 L62 112 L58 112 L45 152 L30 152 L38 104 L35 72 L28 96 L19 92 Q20 74 27 58 Z';
  const patterns = {
    stars: c => [[50, 64], [70, 70], [56, 88], [74, 96], [44, 122], [78, 128]].map(([x, y]) => `<path transform="translate(${x} ${y}) scale(.8)" d="M0-7l2 5 5 .5-4 3 1.5 5L0 3.5-4.5 6.5-3 1.5-7-1.5l5-.5z" fill="${c}"/>`).join(''),
    hearts: c => [[48, 118], [72, 118], [60, 70]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0 6c-4-5-9-5-9-1 0 4 9 9 9 9s9-5 9-9c0-4-5-4-9 1z" fill="${c}" stroke="${K}" stroke-width="1.2"/>`).join(''),
    stripes: c => [0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="20" y="${52 + i * 15}" width="84" height="6" fill="${c}"/>`).join(''),
    grid: c => [0, 1, 2, 3, 4, 5].map(i => `<path d="M${24 + i * 14} 44V156M20 ${52 + i * 18}H104" stroke="${c}" stroke-width="2"/>`).join(''),
    drops: c => [[48, 66], [70, 76], [56, 98], [76, 112], [46, 130]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0-6q-5 7-5 10a5 5 0 0 0 10 0q0-3-5-10z" fill="${c}"/>`).join(''),
    cracks: c => `<path d="M50 52l6 20-8 16 10 18-6 20M72 56l-4 22 10 14-6 22" stroke="${c}" stroke-width="2.4" fill="none"/>`,
    dots: c => [[50, 62], [66, 60], [74, 80], [52, 84], [62, 104], [46, 126], [76, 124]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${c}"/>`).join(''),
    bands: c => [0, 1, 2, 3, 4].map(i => `<path d="M26 ${60 + i * 20}q34 8 68 0" stroke="${c}" stroke-width="4" fill="none"/>`).join(''),
    text: c => `<text x="60" y="84" font-family="Bangers" font-size="18" text-anchor="middle" fill="${c}">ドン</text><text x="60" y="120" font-family="Bangers" font-size="14" text-anchor="middle" fill="${c}">バン</text>`,
  };
  const heads = {
    round: (c, e) => `<circle cx="60" cy="30" r="15" fill="${c}" ${st}/>${eyes(e, 30)}`,
    mask: (c, e, a) => `<path d="M46 34Q44 14 60 12q16 2 14 22l-4 10H50z" fill="${c}" ${st}/><path d="M48 26h24l-2 8H50z" fill="${a}" ${st} stroke-width="1.6"/>${eyes(e, 30)}`,
    horns: (c, e, a) => `<path d="M48 22l-6-20 10 12M72 22l6-20-10 12" fill="${c}" ${st}/><circle cx="60" cy="30" r="14" fill="${c}" ${st}/><path d="M48 28h24" stroke="${a}" stroke-width="3"/>${eyes(e, 32)}`,
    helmet: (c, e, a) => `<path d="M44 36Q42 12 60 12q18 0 16 24z" fill="${c}" ${st}/><rect x="48" y="26" width="24" height="6" fill="${a}" ${st} stroke-width="1.4"/>`,
    skull: (c, e) => `<path d="M40 30q2-18 22-18 18 0 22 14l-6 6-8 0 6 6-6 6-20 0q-10-4-10-14z" fill="${c}" ${st}/><circle cx="68" cy="22" r="3" fill="${e}"/><path d="M58 38l2 4 2-4 2 4 2-4" stroke="${K}" stroke-width="1.4" fill="none"/>`,
    drop: (c, e) => `<path d="M60 4Q46 24 46 32a14 14 0 0 0 28 0Q74 24 60 4z" fill="${c}" ${st}/>${eyes(e, 32)}`,
    watch: (c, e, a) => `<circle cx="60" cy="30" r="16" fill="${c}" ${st}/><circle cx="60" cy="30" r="11" fill="${a}" ${st} stroke-width="1.4"/><path d="M60 30v-8M60 30l6 3" ${st}/>`,
    cross: (c, e, a) => `<path d="M54 6h12v12h12v12H66v14H54V30H42V18h12z" fill="${c}" ${st}/><circle cx="60" cy="24" r="3" fill="${e}"/>`,
    bomb: (c, e, a) => `<circle cx="60" cy="30" r="15" fill="${c}" ${st}/><path d="M60 15q4-10 12-8" stroke="${K}" stroke-width="2" fill="none"/><circle cx="72" cy="7" r="3" fill="${a}"/>${eyes(e, 30)}`,
    hook: (c, e) => `<path d="M60 44V22q0-12 10-12t8 10q-2 6-8 4" fill="none" stroke="${K}" stroke-width="7"/><path d="M60 44V22q0-12 10-12t8 10q-2 6-8 4" fill="none" stroke="${c}" stroke-width="3.4"/><circle cx="60" cy="30" r="3" fill="${e}"/>`,
    star: (c, e) => `<path d="M60 8l6 12 13 1-10 9 3 13-12-7-12 7 3-13-10-9 13-1z" fill="${c}" ${st}/>${eyes(e, 28)}`,
    cowboy: (c, e, a) => `<circle cx="60" cy="32" r="13" fill="${c}" ${st}/><path d="M50 22q0-12 10-12t10 12z M38 24q22-6 44 0-22 6-44 0z" fill="${a}" ${st}/>${eyes(e, 33)}`,
  };
  function eyes(e, y) { return `<path d="M52 ${y}l5 1M68 ${y}l-5 1" stroke="${e}" stroke-width="3" stroke-linecap="round"/><path d="M52 ${y}l5 1M68 ${y}l-5 1" stroke="#fff" stroke-width="1" opacity=".7"/>`; }

  function humanoid({ body, accent, head = 'round', pattern, pc, eye = '#fff', extra = '', aura }) {
    const id = 'sb' + (++n);
    return `<svg class="stand-svg" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><clipPath id="${id}"><path d="${BODY}"/></clipPath>
      <radialGradient id="${id}a"><stop offset="0" stop-color="${aura || accent}" stop-opacity=".6"/><stop offset="1" stop-color="${aura || accent}" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="60" cy="86" rx="58" ry="78" fill="url(#${id}a)"/>
      <path d="${BODY}" fill="${body}" ${st}/>
      <g clip-path="url(#${id})">${pattern ? patterns[pattern](pc || accent) : ''}<path d="M60 48V110" stroke="${K}" stroke-width="1.4" opacity=".35"/></g>
      <path d="${BODY}" fill="none" ${st}/>
      <path d="M44 62q16 6 32 0M48 80q12 4 24 0" stroke="${K}" stroke-width="1.4" fill="none" opacity=".45"/>
      ${heads[head](body, eye, accent)}
      ${extra}
    </svg>`;
  }
  const wrapObj = (inner, aura = '#fff') => { const id = 'so' + (++n); return `<svg class="stand-svg" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="${id}"><stop offset="0" stop-color="${aura}" stop-opacity=".6"/><stop offset="1" stop-color="${aura}" stop-opacity="0"/></radialGradient></defs><ellipse cx="60" cy="86" rx="58" ry="74" fill="url(#${id})"/>${inner}</svg>`; };

  const DEFS = {
    tusk1: { name: 'Tusk ACT1', entity: true, draw: () => wrapObj(`<path d="M34 120q-6-40 26-56 32 16 26 56-26 14-52 0z" fill="#e89ac8" ${st}/><circle cx="50" cy="88" r="5" fill="#fff" ${st} stroke-width="1.6"/><circle cx="70" cy="88" r="5" fill="#fff" ${st} stroke-width="1.6"/><path d="M52 104q8 5 16 0" ${st} fill="none"/>${patterns.stars('#8a5ad0')}<path d="M40 70l-8-14M80 70l8-14" ${st}/>`, '#e89ac8') },
    tusk2: { name: 'Tusk ACT2', entity: true, draw: () => wrapObj(`<path d="M30 124q-8-46 30-64 38 18 30 64-30 16-60 0z" fill="#d880c0" ${st}/><circle cx="48" cy="86" r="6" fill="#fff" ${st} stroke-width="1.6"/><circle cx="72" cy="86" r="6" fill="#fff" ${st} stroke-width="1.6"/><path d="M60 108m-2 0a2 2 0 1 1 4 0 5 5 0 1 1-10 0 8 8 0 1 1 16 0" fill="none" stroke="#5b3a8c" stroke-width="2.4"/>${patterns.stars('#6b5bd6')}<path d="M36 68l-12-18M84 68l12-18" ${st}/>`, '#d880c0') },
    tusk3: { name: 'Tusk ACT3', entity: true, draw: () => humanoid({ body: '#c870b8', accent: '#6b5bd6', head: 'round', pattern: 'stars', pc: '#f6ecd8', eye: '#6b5bd6', extra: '<ellipse cx="96" cy="120" rx="10" ry="20" fill="#2a1a38" stroke="#1a1020" stroke-width="2"/>' }) },
    tusk4: { name: 'Tusk ACT4', entity: true, draw: () => humanoid({ body: '#e8a0d0', accent: '#f2c14e', head: 'star', pattern: 'stars', pc: '#f2c14e', eye: '#6b5bd6', aura: '#ffd84a' }) },
    ballbreaker: { name: 'Ball Breaker', draw: () => wrapObj(`<circle cx="60" cy="86" r="40" fill="#e8d8a8" ${st}/><path d="M36 70q24 12 48 0M36 102q24-12 48 0" stroke="#c8a040" stroke-width="3" fill="none"/><path d="M44 86l6-4 6 4M64 86l6-4 6 4" ${st} fill="none"/><path d="M60 46l-4 14 8 6-6 12" stroke="#1a1020" stroke-width="1.6" fill="none"/>`, '#ffd84a') },
    heyya: { name: 'Hey Ya!', entity: true, draw: () => wrapObj(`<circle cx="60" cy="70" r="12" fill="#f2c14e" ${st}/><path d="M60 82v30M60 92l-18-12M60 92l18-12M60 112l-10 22M60 112l10 22" ${st} fill="none"/><circle cx="40" cy="78" r="8" fill="#e8508a" ${st}/><circle cx="80" cy="78" r="8" fill="#e8508a" ${st}/><path d="M52 58l16 0" stroke="#e8742a" stroke-width="4"/>${eyes('#1a1020', 70)}`, '#f2c14e') },
    lonesome: { name: 'Oh! Lonesome Me', entity: false, draw: () => humanoid({ body: '#c8a070', accent: '#8a5a30', head: 'cowboy', pattern: 'bands', pc: '#8a5a30', eye: '#e8742a' }) },
    creamstarter: { name: 'Cream Starter', draw: () => wrapObj(`<rect x="40" y="60" width="40" height="80" rx="8" fill="#f09ac0" ${st}/><rect x="48" y="44" width="24" height="18" fill="#e8e0d0" ${st}/><path d="M72 50h14" ${st}/><g fill="#f09ac0" ${st} stroke-width="1.4"><circle cx="94" cy="44" r="5"/><circle cx="104" cy="38" r="4"/><circle cx="102" cy="52" r="3"/></g><path d="M44 84h32M44 104h32" stroke="#c8407a" stroke-width="3"/>`, '#f09ac0') },
    wreckingball: { name: 'Wrecking Ball', draw: () => wrapObj(`<circle cx="60" cy="86" r="30" fill="#8a8aa0" ${st}/>${[...Array(10)].map((_, i) => `<circle cx="${60 + Math.cos(i * 0.628) * 44}" cy="${86 + Math.sin(i * 0.628) * 44}" r="5" fill="#c8c8d8" ${st} stroke-width="1.4"/>`).join('')}<path d="M36 80q24 10 48 0" stroke="#c8c8d8" stroke-width="3" fill="none"/>`, '#c8c8d8') },
    ticket: { name: 'Ticket to Ride', draw: () => wrapObj(`${[...Array(12)].map((_, i) => `<path d="M60 86L${60 + Math.cos(i * 0.52) * 58} ${86 + Math.sin(i * 0.52) * 58}" stroke="#fff3a0" stroke-width="3"/>`).join('')}<path d="M60 124S30 104 30 82a15 15 0 0 1 30-6 15 15 0 0 1 30 6c0 22-30 42-30 42z" fill="#f09ac0" ${st}/>`, '#fff3a0') },
    scarymonsters: { name: 'Scary Monsters', draw: () => humanoid({ body: '#6aa04a', accent: '#c8e04a', head: 'skull', pattern: 'dots', pc: '#3a6a2a', eye: '#f2c14e', extra: '<path d="M22 96l-8 8M98 96l8 8" stroke="#f6f0e0" stroke-width="3"/>' }) },
    d4c: { name: 'D4C', entity: true, draw: () => humanoid({ body: '#3a5ac8', accent: '#f6ecd8', head: 'horns', pattern: 'stripes', pc: '#e8e8f0', eye: '#f2c14e', extra: '<path transform="translate(60 70) scale(1.1)" d="M0-8l2.4 5.6 6 .4-4.6 4 1.4 6L0 5 -5.2 8l1.4-6L-8.4-2l6-.4z" fill="#f6ecd8" stroke="#1a1020" stroke-width="1.4"/>' }) },
    lovetrain: { name: 'D4C — Love Train', entity: true, draw: () => humanoid({ body: '#3a5ac8', accent: '#fff3a0', head: 'horns', pattern: 'stripes', pc: '#fff3a0', eye: '#fff', aura: '#fff3a0', extra: '<ellipse cx="60" cy="8" rx="20" ry="5" fill="none" stroke="#ffd84a" stroke-width="3"/>' }) },
    theworld: { name: 'THE WORLD', entity: true, draw: () => humanoid({ body: '#f2c14e', accent: '#2a6a4a', head: 'mask', pattern: 'hearts', pc: '#e8508a', eye: '#e8508a', aura: '#ffd84a' }) },
    mandom: { name: 'Mandom', entity: true, draw: () => humanoid({ body: '#e8c070', accent: '#f6ecd8', head: 'watch', pattern: 'bands', pc: '#8a3a3a', eye: '#8a3a3a' }) },
    catchrainbow: { name: 'Catch the Rainbow', entity: true, draw: () => humanoid({ body: '#9fc7e8', accent: '#6a8ad0', head: 'drop', pattern: 'drops', pc: '#2a2a4a', eye: '#2a2a4a', extra: '<path d="M8 150Q60 60 112 150" stroke="#e8508a" stroke-width="3" fill="none" opacity=".7"/><path d="M14 150Q60 72 106 150" stroke="#f2c14e" stroke-width="3" fill="none" opacity=".7"/>' }) },
    silentway: { name: 'In a Silent Way', draw: () => humanoid({ body: '#7a4a9a', accent: '#e8508a', head: 'round', pattern: 'text', pc: '#e8508a', eye: '#e8508a' }) },
    civilwar: { name: 'Civil War', entity: true, draw: () => humanoid({ body: '#5a1a2a', accent: '#e8d8c8', head: 'cross', pattern: 'cracks', pc: '#e8d8c8', eye: '#e8d8c8', extra: '<path d="M20 100q40 14 80 0" stroke="#aab" stroke-width="3" stroke-dasharray="4 3" fill="none"/>' }) },
    century: { name: '20th Century BOY', draw: () => humanoid({ body: '#9fc7e8', accent: '#1a1020', head: 'helmet', pattern: 'bands', pc: '#6a7a9a' }) },
    chocolatedisco: { name: 'Chocolate Disco', draw: () => humanoid({ body: '#e8742a', accent: '#3a2a1a', head: 'helmet', pattern: 'grid', pc: '#3a2a1a' }) },
    tubular: { name: 'Tubular Bells', draw: () => wrapObj(`<g fill="#e8508a" ${st}><ellipse cx="44" cy="90" rx="22" ry="14"/><ellipse cx="80" cy="90" rx="18" ry="12"/><ellipse cx="94" cy="68" rx="12" ry="14"/><ellipse cx="34" cy="116" rx="6" ry="14"/><ellipse cx="52" cy="118" rx="6" ry="14"/><ellipse cx="78" cy="116" rx="6" ry="14"/></g><circle cx="98" cy="64" r="2" fill="#1a1020"/>`, '#e8508a') },
    tomboom: { name: 'Tomb of the Boom', draw: () => humanoid({ body: '#8a8aa0', accent: '#c8323c', head: 'helmet', pattern: 'dots', pc: '#5a5a6a', extra: '<path d="M16 60v14a8 8 0 0 0 16 0V60h-5v14a3 3 0 0 1-6 0V60z" fill="#c8323c" stroke="#1a1020" stroke-width="1.6"/>' }) },
    boku: { name: 'Boku no Rhythm wo Kiitekure', draw: () => humanoid({ body: '#c8323c', accent: '#f2c14e', head: 'bomb', pattern: 'dots', pc: '#f2c14e', eye: '#fff' }) },
    wired: { name: 'Wired', draw: () => humanoid({ body: '#6a5a8a', accent: '#c8c8d8', head: 'hook', pattern: 'bands', pc: '#c8c8d8', eye: '#f2c14e' }) },
    insect: { name: 'Insect Swarm', draw: () => wrapObj([...Array(18)].map((_, i) => { const a = i * 1.7, r = 12 + i * 2.4; return `<g transform="translate(${60 + Math.cos(a) * r} ${86 + Math.sin(a) * r * 1.2}) rotate(${i * 40})"><ellipse rx="5" ry="3" fill="#2a2a1a"/><path d="M-3-2l-3-4M3-2l3-4" stroke="#a0c040" stroke-width="1.4"/></g>`; }).join(''), '#a0c040') },
  };

  /** which Stand a unit manifests */
  const PARTY = { mountaintim: 'lonesome', pocoloco: 'heyya', hotpants: 'creamstarter', wekapipo: 'wreckingball', lucy: 'ticket', diego: 'scarymonsters' };
  const ENEMY = { robinson: 'insect', benjamin: 'tomboom', andre: 'tomboom', laboom: 'tomboom', oyecomova: 'boku', porkpie: 'wired', diego_rival: 'scarymonsters', ferdinand: 'scarymonsters', hotpants_foe: 'creamstarter', ringo: 'mandom', blackmore: 'catchrainbow', sandman: 'silentway', magent: 'century', wekapipo_foe: 'wreckingball', axl: 'civilwar', disco: 'chocolatedisco', mikeo: 'tubular', valentine1: 'd4c', lovetrain: 'lovetrain', diego_world: 'theworld' };
  function keyFor(u, abilityId) {
    if (u.side === 'party') {
      if (u.id === 'gyro') return abilityId === 'ball_breaker' ? 'ballbreaker' : null;
      if (u.id === 'johnny') { const f = SBR.run.flags; return f.tusk4 ? 'tusk4' : f.tusk3 ? 'tusk3' : f.tusk2 ? 'tusk2' : f.tusk1 ? 'tusk1' : null; }
      return PARTY[u.id] || null;
    }
    return ENEMY[u.id] || null;
  }
  const svg = key => (DEFS[key] ? DEFS[key].draw() : '');
  return { DEFS, keyFor, svg, isEntity: key => !!(DEFS[key] && DEFS[key].entity), name: key => DEFS[key] && DEFS[key].name };
})();
