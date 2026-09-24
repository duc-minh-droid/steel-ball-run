/* Art: procedural SVG portraits, horses, scenes, icons */
'use strict';
SBR.art = (() => {
  const INK = '#1a1020';
  const SW = 2.2;
  let seq = 0;
  const nid = p => `${p}${++seq}`;

  /* seeded rng for repeatable landscapes */
  const seeded = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  /* ---------------- Portrait parts ---------------- */
  // Each portrait config: skin, hair, hairStyle, hat, hatColor, outfit, outfit2, eye, lip, bg, extra
  const P = {
    johnny:    { skin: '#f6d2b0', hair: '#f4d35e', hairStyle: 'shaggy', hat: 'johnny', hatColor: '#5b3a8c', hat2: '#f2c14e', outfit: '#3b5bb5', outfit2: '#e8508a', eye: '#4aa3df', lip: '#d9607a', bg: ['#6b5bd6', '#e8508a'] },
    gyro:      { skin: '#f0c8a0', hair: '#f2e27a', hairStyle: 'long', hat: 'gyro', hatColor: '#3a8c4a', hat2: '#f2c14e', outfit: '#4f8a3a', outfit2: '#f2c14e', eye: '#6fbf5a', lip: '#c8506a', bg: ['#3fb8a9', '#f2c14e'], extra: 'goldteeth' },
    diego:     { skin: '#f6d8b8', hair: '#f8e08a', hairStyle: 'swept', hat: 'jockey', hatColor: '#2a7a8a', hat2: '#f2c14e', outfit: '#2a2440', outfit2: '#3fb8a9', eye: '#3fb8a9', lip: '#b8507a', bg: ['#2a7a8a', '#8adf6a'], extra: 'dmark' },
    diegodino: { skin: '#8ab86a', hair: '#f8e08a', hairStyle: 'swept', hat: 'jockey', hatColor: '#2a5a3a', hat2: '#f2c14e', outfit: '#2a2440', outfit2: '#8adf6a', eye: '#f2c14e', lip: '#5a3a2a', bg: ['#2a5a3a', '#c8e04a'], extra: 'scales' },
    diegoworld:{ skin: '#f6d8b8', hair: '#ffd84a', hairStyle: 'swept', hat: 'jockey', hatColor: '#e8b020', hat2: '#e8508a', outfit: '#3a2a10', outfit2: '#ffd84a', eye: '#e8508a', lip: '#a0306a', bg: ['#f2c14e', '#6a2a8a'], extra: 'heart' },
    valentine: { skin: '#f6d8c0', hair: '#f8e8a0', hairStyle: 'curls', hat: null, outfit: '#1f2a6a', outfit2: '#e8e8f0', eye: '#4a6ad0', lip: '#c05a6a', bg: ['#1f2a6a', '#c8323c'], extra: 'flag' },
    mountaintim:{ skin: '#e8b890', hair: '#5a3a20', hairStyle: 'short', hat: 'cowboy', hatColor: '#8a5a30', hat2: '#e8c070', outfit: '#b88a4a', outfit2: '#5a3a20', eye: '#6a4a2a', lip: '#a0505a', bg: ['#e8742a', '#f6c27a'], extra: 'sideburns' },
    hotpants:  { skin: '#f6d0c0', hair: '#4a2a3a', hairStyle: 'bob', hat: 'dome', hatColor: '#e8508a', hat2: '#f6ecd8', outfit: '#c8407a', outfit2: '#f6ecd8', eye: '#8a4a9a', lip: '#e0407a', bg: ['#e8508a', '#6b5bd6'] },
    pocoloco:  { skin: '#8a5a3a', hair: '#1a1020', hairStyle: 'afro', hat: 'bandana', hatColor: '#e8742a', hat2: '#f2c14e', outfit: '#3a6ab0', outfit2: '#f2c14e', eye: '#3a2a1a', lip: '#b8605a', bg: ['#f2c14e', '#3fb8a9'], extra: 'grin' },
    wekapipo:  { skin: '#e8c0a0', hair: '#3a2a20', hairStyle: 'short', hat: 'helm', hatColor: '#6a7a9a', hat2: '#c8323c', outfit: '#2a3a6a', outfit2: '#c8c8d8', eye: '#3a6a8a', lip: '#a0506a', bg: ['#2a3a6a', '#9fc7e8'], extra: 'mustache' },
    lucy:      { skin: '#fbe0cc', hair: '#f8e090', hairStyle: 'bobbang', hat: 'ribbon', hatColor: '#e8508a', hat2: '#fff', outfit: '#f09ac0', outfit2: '#fff', eye: '#5a8ad0', lip: '#e0708a', bg: ['#f09ac0', '#fff3c0'] },
    sandman:   { skin: '#b87a50', hair: '#1a1020', hairStyle: 'verylong', hat: 'headband', hatColor: '#c8323c', hat2: '#f2c14e', outfit: '#8a5a30', outfit2: '#e8c070', eye: '#2a1a10', lip: '#8a4a3a', bg: ['#d9713a', '#5b3a8c'], extra: 'feather' },
    ringo:     { skin: '#f0c8a8', hair: '#6a3a2a', hairStyle: 'verylong', hat: 'cowboy', hatColor: '#3a2a30', hat2: '#c8a070', outfit: '#f0e8d8', outfit2: '#8a3a3a', eye: '#8a3a3a', lip: '#a0405a', bg: ['#5a3a2a', '#e8c070'], extra: 'scarf' },
    blackmore: { skin: '#dcd0e0', hair: '#2a2a4a', hairStyle: 'short', hat: 'umbrella', hatColor: '#2a2a4a', hat2: '#6a8ad0', outfit: '#1a1a3a', outfit2: '#6a8ad0', eye: '#6a8ad0', lip: '#6a4a8a', bg: ['#2a3a5a', '#9fc7e8'], extra: 'rain' },
    robinson:  { skin: '#e0b890', hair: '#6a4a2a', hairStyle: 'short', hat: 'cowboy', hatColor: '#6a8a3a', hat2: '#c8a040', outfit: '#6a5a3a', outfit2: '#a0c040', eye: '#1a1020', lip: '#8a4a3a', bg: ['#6a8a3a', '#e8b36a'], extra: 'bugs' },
    ferdinand: { skin: '#e8c8a8', hair: '#e8e8e8', hairStyle: 'bald', hat: 'goggles', hatColor: '#3a6a3a', hat2: '#c8e04a', outfit: '#e8e8d8', outfit2: '#3a6a3a', eye: '#3a6a3a', lip: '#8a5a4a', bg: ['#3a6a3a', '#c8e04a'] },
    oyecomova: { skin: '#e0b898', hair: '#2a1a1a', hairStyle: 'short', hat: 'tophat', hatColor: '#8a1a2a', hat2: '#f2c14e', outfit: '#1a1a1a', outfit2: '#c8323c', eye: '#c8323c', lip: '#6a2a2a', bg: ['#c8323c', '#1a1020'], extra: 'pins' },
    porkpie:   { skin: '#f0c0a0', hair: '#6a4a3a', hairStyle: 'short', hat: 'porkpie', hatColor: '#6a5a8a', hat2: '#e8508a', outfit: '#8a6aa0', outfit2: '#f2c14e', eye: '#1a1020', lip: '#c05a6a', bg: ['#8a6aa0', '#f6c27a'], extra: 'hook' },
    stroheim:  { skin: '#f0d0b0', hair: '#d0c0a0', hairStyle: 'short', hat: 'pickel', hatColor: '#4a4a3a', hat2: '#c0a040', outfit: '#5a5a40', outfit2: '#c0a040', eye: '#3a3a3a', lip: '#9a5a5a', bg: ['#5a5a40', '#e8e0c0'], extra: 'monocle' },
    benjamin:  { skin: '#d8b090', hair: '#e8e8e8', hairStyle: 'short', hat: 'cowboy', hatColor: '#5a4a3a', hat2: '#888', outfit: '#5a4a6a', outfit2: '#aaa', eye: '#3a3a3a', lip: '#8a5a5a', bg: ['#5a4a6a', '#c8a080'], extra: 'beard' },
    andre:     { skin: '#e0b890', hair: '#3a2a1a', hairStyle: 'short', hat: 'bandana', hatColor: '#5a4a8a', hat2: '#aaa', outfit: '#4a3a5a', outfit2: '#aaa', eye: '#3a2a1a', lip: '#8a5a5a', bg: ['#4a3a5a', '#9a8aba'], extra: 'mask' },
    laboomboom:{ skin: '#f0c8a8', hair: '#8a5a2a', hairStyle: 'shaggy', hat: 'cap', hatColor: '#3a5a8a', hat2: '#f2c14e', outfit: '#5a6a9a', outfit2: '#f2c14e', eye: '#5a3a1a', lip: '#b05a6a', bg: ['#3a5a8a', '#f6c27a'] },
    axl:       { skin: '#e8d0c0', hair: '#1a1020', hairStyle: 'short', hat: 'veil', hatColor: '#1a1020', hat2: '#f6ecd8', outfit: '#1a1020', outfit2: '#f6ecd8', eye: '#8a1a2a', lip: '#5a2a3a', bg: ['#3a1a2a', '#8a1a2a'], extra: 'cross' },
    mikeo:     { skin: '#f0d0b8', hair: '#3a2a4a', hairStyle: 'spiky', hat: null, outfit: '#2a2a4a', outfit2: '#e8508a', eye: '#e8508a', lip: '#a04a6a', bg: ['#e8508a', '#9fc7e8'], extra: 'balloon' },
    magent:    { skin: '#f0c8a8', hair: '#c8a060', hairStyle: 'short', hat: 'aviator', hatColor: '#6a4a2a', hat2: '#9fc7e8', outfit: '#5a4a3a', outfit2: '#c8a060', eye: '#3a2a1a', lip: '#b05a5a', bg: ['#9fc7e8', '#e8e0c0'], extra: 'grin' },
    disco:     { skin: '#f0d0b8', hair: '#1a1020', hairStyle: 'bowl', hat: 'checker', hatColor: '#1a1020', hat2: '#f6ecd8', outfit: '#3a2a1a', outfit2: '#e8742a', eye: '#1a1020', lip: '#9a5a5a', bg: ['#e8742a', '#3a2a1a'] },
    sugar:     { skin: '#fbe0cc', hair: '#8a4a2a', hairStyle: 'bobbang', hat: 'ribbon', hatColor: '#3fb8a9', hat2: '#fff', outfit: '#8adf6a', outfit2: '#fff', eye: '#3a8a4a', lip: '#e0708a', bg: ['#8adf6a', '#f2c14e'] },
    steven:    { skin: '#f0c8a8', hair: '#6a6a6a', hairStyle: 'short', hat: 'tophat', hatColor: '#2a2a2a', hat2: '#c8323c', outfit: '#2a2a3a', outfit2: '#f2c14e', eye: '#3a3a3a', lip: '#a05a5a', bg: ['#c8323c', '#f2c14e'], extra: 'mustache' },
    marco:     { skin: '#f6d0b0', hair: '#6a3a1a', hairStyle: 'shaggy', hat: null, outfit: '#8a8a7a', outfit2: '#aaa', eye: '#5a3a1a', lip: '#c07070', bg: ['#8a8a7a', '#e8e0c0'] },
    // generic mobs
    bandit:    { skin: '#d8a880', hair: '#3a2a1a', hairStyle: 'short', hat: 'cowboy', hatColor: '#6a4a2a', hat2: '#c8323c', outfit: '#7a5a3a', outfit2: '#c8323c', eye: '#1a1020', lip: '#8a4a3a', bg: ['#c8323c', '#e8b36a'], extra: 'mask' },
    agent:     { skin: '#e8c8b0', hair: '#1a1020', hairStyle: 'short', hat: 'bowler', hatColor: '#1a1a1a', hat2: '#555', outfit: '#1a1a2a', outfit2: '#f6ecd8', eye: '#1a1020', lip: '#8a5a5a', bg: ['#1f2a6a', '#8a8aa0'], extra: 'shades' },
    soldier:   { skin: '#e0b898', hair: '#3a2a1a', hairStyle: 'short', hat: 'kepi', hatColor: '#2a3a6a', hat2: '#f2c14e', outfit: '#2a3a6a', outfit2: '#f2c14e', eye: '#1a1020', lip: '#8a5a5a', bg: ['#2a3a6a', '#c8c8d8'] },
    gunslinger:{ skin: '#d8a880', hair: '#5a3a1a', hairStyle: 'long', hat: 'cowboy', hatColor: '#2a2a2a', hat2: '#c8a070', outfit: '#3a2a2a', outfit2: '#c8a070', eye: '#1a1020', lip: '#8a4a3a', bg: ['#3a2a2a', '#e8c070'], extra: 'mustache' },
    thug:      { skin: '#e0b090', hair: '#1a1020', hairStyle: 'bald', hat: 'bowler', hatColor: '#4a2a1a', hat2: '#aaa', outfit: '#5a3a2a', outfit2: '#aaa', eye: '#1a1020', lip: '#8a4a3a', bg: ['#5a3a2a', '#d0a070'], extra: 'scar' },
    tattoo:    { skin: '#e0c0a0', hair: '#2a2a2a', hairStyle: 'bald', hat: null, outfit: '#1a1a1a', outfit2: '#c8323c', eye: '#c8323c', lip: '#5a3a3a', bg: ['#1a1a1a', '#c8323c'], extra: 'tattoo' },
    parallel:  { skin: '#c8c0e8', hair: '#f8e8a0', hairStyle: 'curls', hat: null, outfit: '#3a3a8a', outfit2: '#c8c8f0', eye: '#e8e8ff', lip: '#6a5a9a', bg: ['#3a3a8a', '#c8c8f0'], extra: 'flag' },
    ghost:     { skin: '#c8d8e0', hair: '#6a7a8a', hairStyle: 'shaggy', hat: 'kepi', hatColor: '#4a5a7a', hat2: '#aab', outfit: '#4a5a7a', outfit2: '#aab', eye: '#ffffff', lip: '#6a7a8a', bg: ['#2a2a3a', '#6a7a8a'] },
    // Path trainers
    coach:     { skin: '#e8c0a0', hair: '#c8c8c8', hairStyle: 'short', hat: 'jockey', hatColor: '#c8323c', hat2: '#f6ecd8', outfit: '#c8323c', outfit2: '#f6ecd8', eye: '#3a3a3a', lip: '#9a5a5a', bg: ['#c8323c', '#f2c14e'], extra: 'mustache' },
    bounty:    { skin: '#c89870', hair: '#2a1a10', hairStyle: 'long', hat: 'cowboy', hatColor: '#4a3a2a', hat2: '#8a6a4a', outfit: '#5a4a3a', outfit2: '#c8a070', eye: '#1a1020', lip: '#7a4a3a', bg: ['#4a3a2a', '#e8742a'], extra: 'scarf' },
    mason:     { skin: '#e0b898', hair: '#8a7a6a', hairStyle: 'swept', hat: 'cap', hatColor: '#8a8a7a', hat2: '#f2c14e', outfit: '#8a7a6a', outfit2: '#f2c14e', eye: '#3a3a3a', lip: '#8a5a5a', bg: ['#f2c14e', '#8a7a6a'], extra: 'beard' },
    gregorio:  { skin: '#e8c8a8', hair: '#e8e0c8', hairStyle: 'long', hat: null, outfit: '#1a1a2a', outfit2: '#c8a040', eye: '#3a8a6a', lip: '#9a5a6a', bg: ['#1a1a2a', '#3fb8a9'], extra: 'beard' },
    doctor:    { skin: '#f0d0b8', hair: '#5a4a3a', hairStyle: 'swept', hat: 'tophat', hatColor: '#2a2a2a', hat2: '#8a8a8a', outfit: '#2a2a3a', outfit2: '#f6ecd8', eye: '#3a5a8a', lip: '#9a6a6a', bg: ['#6ad08a', '#f6ecd8'], extra: 'monocle' },
    whisperer: { skin: '#b88058', hair: '#1a1010', hairStyle: 'verylong', hat: 'headband', hatColor: '#3fb8a9', hat2: '#f2c14e', outfit: '#8a5a3a', outfit2: '#3fb8a9', eye: '#2a1a10', lip: '#7a4a3a', bg: ['#3fb8a9', '#f2c14e'], extra: 'feather' },
    marshal:   { skin: '#e0b088', hair: '#6a4a2a', hairStyle: 'short', hat: 'cowboy', hatColor: '#e8d8b0', hat2: '#3a2a1a', outfit: '#3a3a4a', outfit2: '#f2c14e', eye: '#2a2a2a', lip: '#8a5a4a', bg: ['#f2c14e', '#3a3a4a'], extra: 'sideburns' },
    rodeo:     { skin: '#f0c8a0', hair: '#c86a2a', hairStyle: 'curls', hat: 'cowboy', hatColor: '#e8508a', hat2: '#f2c14e', outfit: '#e8742a', outfit2: '#f2c14e', eye: '#3a6a3a', lip: '#c8506a', bg: ['#e8742a', '#6b5bd6'], extra: 'grin' },
    baron:     { skin: '#e8b890', hair: '#9a9a9a', hairStyle: 'short', hat: 'cowboy', hatColor: '#f6ecd8', hat2: '#8a5a30', outfit: '#6a3a1a', outfit2: '#e8d8b0', eye: '#3a3a3a', lip: '#9a5a4a', bg: ['#8a5a30', '#e8d8b0'], extra: 'mustache' },
    abbess:    { skin: '#f2dcc8', hair: '#1a1a2a', hairStyle: 'bob', hat: 'veil', hatColor: '#1a1a2a', hat2: '#f6ecd8', outfit: '#1a1a2a', outfit2: '#f6ecd8', eye: '#4a5a7a', lip: '#b07080', bg: ['#f6ecd8', '#8a8aa0'], extra: 'cross' },
    inquisitor:{ skin: '#e8c8b8', hair: '#3a1a2a', hairStyle: 'swept', hat: 'dome', hatColor: '#c8323c', hat2: '#f6ecd8', outfit: '#8a1a2a', outfit2: '#f6ecd8', eye: '#6a2a4a', lip: '#a04060', bg: ['#8a1a2a', '#e8508a'], extra: 'cross' },
    cardinal:  { skin: '#f0d0c0', hair: '#d8d8d8', hairStyle: 'short', hat: 'dome', hatColor: '#c8323c', hat2: '#f2c14e', outfit: '#c8323c', outfit2: '#f2c14e', eye: '#4a4a6a', lip: '#a06070', bg: ['#f2c14e', '#c8323c'], extra: 'cross' },
    // Detour areas
    palmghost: { skin: '#e0c090', hair: '#b8905a', hairStyle: 'verylong', hat: null, outfit: '#c8a070', outfit2: '#8a6a40', eye: '#ffe08a', lip: '#a08060', bg: ['#e8742a', '#8a1a10'], extra: 'scarf' },
    palmecho:  { skin: '#c8603a', hair: '#8a1a10', hairStyle: 'spiky', hat: null, outfit: '#5a1a1a', outfit2: '#ffd08a', eye: '#fff0a0', lip: '#5a1a1a', bg: ['#ffd08a', '#8a1a10'], extra: 'dmark' },
    miner:     { skin: '#d8a880', hair: '#4a3a2a', hairStyle: 'short', hat: 'helm', hatColor: '#8a8a7a', hat2: '#f2c14e', outfit: '#5a4a3a', outfit2: '#c8a070', eye: '#2a2a2a', lip: '#8a5a4a', bg: ['#3a3040', '#f2c14e'], extra: 'beard' },
    trapper:   { skin: '#e0b898', hair: '#6a4a2a', hairStyle: 'shaggy', hat: 'pickel', hatColor: '#8a6a4a', hat2: '#d8c8a8', outfit: '#6a4a2a', outfit2: '#d8c8a8', eye: '#3a5a7a', lip: '#9a5a5a', bg: ['#9fd0f0', '#1a2a4a'], extra: 'beard' },
    nicholas:  { skin: '#e8d0c0', hair: '#c8a060', hairStyle: 'swept', hat: 'jockey', hatColor: '#6a7a9a', hat2: '#fff', outfit: '#6a7a9a', outfit2: '#fff', eye: '#8a9ab0', lip: '#8a7a8a', bg: ['#2a2a3a', '#8a9ab0'] },
  };

  const hairBack = {
    shaggy: c => `<path d="M24 50 Q20 30 34 20 Q50 12 66 20 Q80 30 76 52 L78 80 Q70 72 68 60 L32 60 Q30 72 22 80 Z" fill="${c}"/>`,
    long: c => `<path d="M26 44 Q24 22 50 18 Q76 22 74 44 L80 100 Q70 96 66 84 L34 84 Q30 96 20 100 Z" fill="${c}"/>`,
    swept: c => `<path d="M28 46 Q28 22 50 20 Q72 22 72 46 L74 64 L26 64 Z" fill="${c}"/>`,
    curls: c => `<g fill="${c}">${[[26,34],[22,48],[24,62],[74,34],[78,48],[76,62],[34,22],[50,16],[66,22]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="10" stroke="${INK}" stroke-width="${SW}"/><path d="M${x-4} ${y} a4 4 0 1 1 4 4" fill="none" stroke="${INK}" stroke-width="1.4"/>`).join('')}</g>`,
    short: c => `<path d="M30 46 Q30 24 50 22 Q70 24 70 46 L70 52 L30 52 Z" fill="${c}"/>`,
    bob: c => `<path d="M26 48 Q24 24 50 20 Q76 24 74 48 L74 72 Q64 74 62 64 L38 64 Q36 74 26 72 Z" fill="${c}"/>`,
    bobbang: c => `<path d="M24 50 Q22 22 50 18 Q78 22 76 50 L76 76 Q64 78 64 66 L36 66 Q36 78 24 76 Z" fill="${c}"/>`,
    afro: c => `<g fill="${c}" stroke="${INK}" stroke-width="${SW}">${[[30,30],[42,20],[58,20],[70,30],[24,46],[76,46],[26,60],[74,60]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="12"/>`).join('')}</g>`,
    verylong: c => `<path d="M26 44 Q24 20 50 18 Q76 20 74 44 L82 118 L64 118 L64 84 L36 84 L36 118 L18 118 Z" fill="${c}"/>`,
    bald: () => '',
    spiky: c => `<path d="M28 44 L22 20 L36 30 L40 12 L50 26 L60 10 L64 30 L78 18 L72 44 Z" fill="${c}"/>`,
    bowl: c => `<path d="M28 50 Q26 24 50 22 Q74 24 72 50 Z" fill="${c}"/>`,
  };
  const hairFront = {
    shaggy: c => `<path d="M30 44 Q32 28 50 26 Q68 28 70 44 L64 38 L60 46 L54 36 L48 46 L42 36 L38 46 L34 38 Z" fill="${c}"/>`,
    long: c => `<path d="M32 42 Q36 26 50 25 Q64 26 68 42 Q60 34 50 36 Q40 34 32 42Z" fill="${c}"/>`,
    swept: c => `<path d="M30 44 Q34 24 56 24 Q72 28 70 42 Q60 30 46 34 Q38 38 30 44Z" fill="${c}"/>`,
    curls: () => '',
    short: c => `<path d="M32 42 Q34 28 50 27 Q66 28 68 42 Q58 34 50 35 Q42 34 32 42Z" fill="${c}"/>`,
    bob: c => `<path d="M30 46 Q30 28 50 26 Q70 28 70 46 L62 40 L50 44 L38 40Z" fill="${c}"/>`,
    bobbang: c => `<path d="M30 48 Q30 26 50 25 Q70 26 70 48 L66 48 L66 40 L34 40 L34 48Z" fill="${c}"/>`,
    afro: () => '',
    verylong: c => `<path d="M32 42 Q36 26 50 25 Q64 26 68 42 Q56 32 50 38 Q44 32 32 42Z" fill="${c}"/>`,
    bald: () => '',
    spiky: c => `<path d="M32 42 L36 30 L42 38 L48 28 L54 38 L60 28 L64 38 L68 42 Z" fill="${c}"/>`,
    bowl: c => `<path d="M30 48 Q30 28 50 27 Q70 28 70 48 Z" fill="${c}"/>`,
  };
  const hats = {
    johnny: (c, c2) => `<path d="M26 40 Q24 16 50 14 Q76 16 74 40 Z" fill="${c}"/><path d="M18 42 Q50 32 82 42 Q50 48 18 42Z" fill="${c}"/>${[[38,28],[50,22],[62,28]].map(([x,y])=>`<path d="M${x} ${y-4} l1.4 3 3.2.4-2.4 2.2.6 3.2-2.8-1.6-2.8 1.6.6-3.2-2.4-2.2 3.2-.4z" fill="${c2}" stroke="${INK}" stroke-width="1"/>`).join('')}`,
    gyro: (c, c2) => `<path d="M28 38 L34 10 L50 18 L66 10 L72 38 Z" fill="${c}"/><path d="M14 40 Q50 28 86 40 L80 46 Q50 38 20 46Z" fill="${c}"/><path d="M36 30 L64 30 M40 22 L60 22" stroke="${c2}" stroke-width="2.4"/><circle cx="50" cy="26" r="3" fill="${c2}" stroke="${INK}" stroke-width="1.2"/>`,
    jockey: (c, c2) => `<path d="M26 44 Q24 14 50 12 Q76 14 74 44 Z" fill="${c}"/><path d="M62 42 L90 46 L66 50Z" fill="${c}"/><text x="50" y="36" font-family="Rye,serif" font-size="16" text-anchor="middle" fill="${c2}" stroke="${INK}" stroke-width=".8">D</text>`,
    cowboy: (c, c2) => `<path d="M30 38 Q30 14 50 14 Q70 14 70 38 Z" fill="${c}"/><path d="M40 16 Q50 24 60 16" fill="none" stroke="${INK}" stroke-width="1.6"/><path d="M8 40 Q20 30 30 36 Q50 42 70 36 Q80 30 92 40 Q70 50 50 46 Q30 50 8 40Z" fill="${c}"/><path d="M30 35 Q50 40 70 35 L70 38 Q50 43 30 38Z" fill="${c2}"/>`,
    dome: (c, c2) => `<path d="M26 42 Q26 12 50 12 Q74 12 74 42 Z" fill="${c}"/><path d="M16 44 Q50 34 84 44 Q50 52 16 44Z" fill="${c}"/><path d="M30 34 Q50 28 70 34" stroke="${c2}" stroke-width="3" fill="none"/>`,
    bandana: (c, c2) => `<path d="M28 34 Q50 24 72 34 L72 40 Q50 32 28 40Z" fill="${c}"/><path d="M72 36 L86 30 L84 42Z" fill="${c}"/>${[36,46,56,64].map(x=>`<circle cx="${x}" cy="34" r="1.5" fill="${c2}"/>`).join('')}`,
    helm: (c, c2) => `<path d="M26 46 Q24 12 50 10 Q76 12 74 46 L68 46 L68 34 L32 34 L32 46 Z" fill="${c}"/><path d="M50 10 Q56 0 70 2 Q60 6 56 14" fill="${c2}"/><path d="M50 12 L50 34" stroke="${INK}" stroke-width="1.6"/>`,
    ribbon: (c, c2) => `<path d="M60 22 L74 14 L72 28 Z M60 22 L68 34 L56 30Z" fill="${c}"/><circle cx="60" cy="24" r="3" fill="${c2}" stroke="${INK}" stroke-width="1.2"/>`,
    headband: (c, c2) => `<path d="M29 36 Q50 30 71 36 L71 41 Q50 35 29 41Z" fill="${c}"/>${[36,44,52,60,66].map((x,i)=>`<rect x="${x}" y="35" width="3" height="3" fill="${i%2?c2:'#3fb8a9'}"/>`).join('')}`,
    umbrella: (c, c2) => `<path d="M6 30 Q50 -6 94 30 Q84 26 72 30 Q61 24 50 30 Q39 24 28 30 Q16 26 6 30Z" fill="${c}"/><path d="M50 6 L50 30" stroke="${c2}" stroke-width="1.6"/>`,
    goggles: (c, c2) => `<path d="M28 38 Q50 30 72 38" stroke="${c}" stroke-width="6" fill="none"/><circle cx="40" cy="36" r="7" fill="${c2}" stroke="${INK}" stroke-width="${SW}"/><circle cx="60" cy="36" r="7" fill="${c2}" stroke="${INK}" stroke-width="${SW}"/>`,
    tophat: (c, c2) => `<rect x="32" y="2" width="36" height="34" fill="${c}"/><rect x="32" y="26" width="36" height="6" fill="${c2}"/><path d="M18 38 Q50 30 82 38 Q50 44 18 38Z" fill="${c}"/>`,
    porkpie: (c, c2) => `<path d="M32 36 L34 20 Q50 16 66 20 L68 36 Z" fill="${c}"/><rect x="33" y="28" width="34" height="5" fill="${c2}"/><path d="M16 38 Q50 30 84 38 Q50 44 16 38Z" fill="${c}"/>`,
    pickel: (c, c2) => `<path d="M28 42 Q28 18 50 16 Q72 18 72 42 Z" fill="${c}"/><path d="M47 16 L50 2 L53 16Z" fill="${c2}"/><circle cx="50" cy="28" r="5" fill="${c2}" stroke="${INK}" stroke-width="1.2"/>`,
    cap: (c, c2) => `<path d="M28 40 Q28 18 50 16 Q72 18 72 40 Z" fill="${c}"/><path d="M50 38 L84 42 L70 46 L50 42Z" fill="${c}"/><circle cx="50" cy="17" r="3" fill="${c2}" stroke="${INK}" stroke-width="1"/>`,
    veil: (c, c2) => `<path d="M22 110 L22 44 Q22 14 50 12 Q78 14 78 44 L78 110 L66 110 L68 50 Q50 40 32 50 L34 110Z" fill="${c}"/><path d="M30 42 Q50 34 70 42 L70 46 Q50 38 30 46Z" fill="${c2}"/>`,
    aviator: (c, c2) => `<path d="M26 46 Q24 16 50 14 Q76 16 74 46 L68 40 L32 40 Z" fill="${c}"/><rect x="32" y="26" width="14" height="9" rx="4" fill="${c2}" stroke="${INK}" stroke-width="${SW}"/><rect x="54" y="26" width="14" height="9" rx="4" fill="${c2}" stroke="${INK}" stroke-width="${SW}"/>`,
    checker: (c, c2) => `<path d="M26 44 Q24 14 50 12 Q76 14 74 44 Z" fill="${c2}"/>${[0,1,2,3].map(r=>[0,1,2,3].map(k=>(r+k)%2?`<rect x="${30+k*10}" y="${16+r*7}" width="10" height="7" fill="${c}"/>`:'').join('')).join('')}`,
    bowler: (c) => `<path d="M30 36 Q30 14 50 14 Q70 14 70 36 Z" fill="${c}"/><path d="M20 38 Q50 30 80 38 Q50 44 20 38Z" fill="${c}"/>`,
    kepi: (c, c2) => `<path d="M30 38 L32 16 L68 20 L70 38 Z" fill="${c}"/><path d="M40 38 L60 38 L68 44 L36 44Z" fill="#1a1020"/><rect x="31" y="30" width="38" height="3" fill="${c2}"/>`,
  };
  const extras = {
    goldteeth: p => `<path d="M42 72 Q50 78 58 72 L57 75 Q50 79 43 75Z" fill="#f2c14e" stroke="${INK}" stroke-width="1"/><text x="50" y="76.2" font-size="3.2" text-anchor="middle" font-family="Oswald" font-weight="700" fill="${INK}">GO!GO!</text>`,
    dmark: () => '',
    scales: () => `<g fill="#5a8a3a" opacity=".7">${[[38,62],[44,66],[58,64],[62,60],[36,50]].map(([x,y])=>`<path d="M${x} ${y} l3 -2 3 2 -3 2z"/>`).join('')}</g>`,
    heart: () => `<path d="M50 104 c-4-6-12-6-12 0 0 5 12 12 12 12 s12-7 12-12c0-6-8-6-12 0z" fill="#e8508a" stroke="${INK}" stroke-width="1.6"/>`,
    flag: () => `<g transform="translate(28 96)"><rect width="44" height="22" fill="#fff" stroke="${INK}" stroke-width="1.4"/>${[0,1,2,3,4,5].map(i=>`<rect y="${i*3.7}" width="44" height="1.85" fill="#c8323c"/>`).join('')}<rect width="18" height="11" fill="#1f2a6a"/><circle cx="9" cy="5.5" r="2" fill="#fff"/></g>`,
    sideburns: p => `<path d="M33 50 L33 64 L36 64 L36 50Z M67 50 L67 64 L64 64 L64 50Z" fill="${p.hair}"/>`,
    grin: () => `<path d="M42 71 Q50 78 58 71 Q50 75 42 71Z" fill="#fff" stroke="${INK}" stroke-width="1.2"/>`,
    mustache: p => `<path d="M40 70 Q45 66 50 69 Q55 66 60 70 Q55 70 50 71 Q45 70 40 70Z" fill="${p.hair}" stroke="${INK}" stroke-width="1"/>`,
    feather: () => `<path d="M72 36 Q88 20 86 4 Q80 18 70 34Z" fill="#f6ecd8" stroke="${INK}" stroke-width="1.4"/><path d="M84 8 L74 32" stroke="#c8323c" stroke-width="1.2"/>`,
    scarf: () => `<path d="M34 84 Q50 92 66 84 L68 94 Q50 100 32 94Z" fill="#8a3a3a" stroke="${INK}" stroke-width="${SW}"/>`,
    rain: () => `<g stroke="#9fc7e8" stroke-width="1.4">${[[12,50],[20,70],[86,56],[80,84],[14,96],[90,100]].map(([x,y])=>`<path d="M${x} ${y} l-2 6"/>`).join('')}</g>`,
    bugs: () => `<g fill="#1a1020">${[[18,40],[80,34],[84,70],[16,74],[26,24]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="2.4" ry="1.4"/><path d="M${x-3} ${y-2} l-2 -2 M${x+3} ${y-2} l2 -2" stroke="#1a1020" stroke-width=".8"/>`).join('')}</g>`,
    pins: () => `<g stroke="${INK}" stroke-width="1">${[[36,8],[50,4],[64,8]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.4" fill="#f2c14e"/><path d="M${x} ${y+2} L${x} ${y+8}"/>`).join('')}</g>`,
    hook: () => `<path d="M84 60 Q92 60 92 70 Q92 78 84 76" fill="none" stroke="#aaa" stroke-width="2.4"/><path d="M84 20 L84 60" stroke="#aaa" stroke-width="1.2"/>`,
    monocle: () => `<circle cx="59" cy="55" r="6.5" fill="none" stroke="#c0a040" stroke-width="1.8"/>`,
    beard: p => `<path d="M34 64 Q36 90 50 94 Q64 90 66 64 Q60 76 50 76 Q40 76 34 64Z" fill="${p.hair}" stroke="${INK}" stroke-width="${SW}"/>`,
    mask: p => `<path d="M33 62 Q50 58 67 62 L64 76 Q50 86 36 76Z" fill="${p.outfit2}" stroke="${INK}" stroke-width="${SW}"/><path d="M40 68 L60 68" stroke="${INK}" stroke-width="1" opacity=".5"/>`,
    cross: () => `<path d="M50 96 L50 116 M42 102 L58 102" stroke="#f6ecd8" stroke-width="3"/>`,
    balloon: () => `<g><ellipse cx="86" cy="24" rx="8" ry="10" fill="#e8508a" stroke="${INK}" stroke-width="1.6"/><path d="M86 34 Q82 50 88 64" stroke="${INK}" stroke-width="1" fill="none"/><ellipse cx="14" cy="40" rx="6" ry="8" fill="#3fb8a9" stroke="${INK}" stroke-width="1.4"/></g>`,
    shades: () => `<rect x="35" y="51" width="12" height="6" rx="2" fill="${INK}"/><rect x="53" y="51" width="12" height="6" rx="2" fill="${INK}"/><path d="M47 54 L53 54" stroke="${INK}" stroke-width="1.4"/>`,
    scar: () => `<path d="M60 48 L66 64" stroke="#8a2a2a" stroke-width="1.6"/>`,
    tattoo: () => `<g fill="none" stroke="#c8323c" stroke-width="1.4"><path d="M36 60 q4 -4 8 0 M56 60 q4 -4 8 0"/><text x="50" y="112" font-family="Bangers" font-size="11" text-anchor="middle" fill="#c8323c" stroke="none">YOU!</text></g>`,
  };

  /** register extra portrait configs from other files */
  function addPortrait(o) { Object.assign(P, o); }
  function portrait(key, opts = {}) {
    const p = Object.assign({}, P[key] || P.bandit, opts.override || {});
    const id = nid('pt');
    const bg = p.bg || ['#6b5bd6', '#e8508a'];
    const hs = p.hairStyle || 'short';
    const face = 'M32 48 Q32 30 50 28 Q68 30 68 48 L67 62 Q64 76 50 82 Q36 76 33 62 Z';
    const eyeStroke = p.extra === 'scales' || key === 'diegodino' ? `<path d="M41 52 L41 58 M59 52 L59 58" stroke="${INK}" stroke-width="1.6"/>` : '';
    const eyes = p.extra === 'shades' ? '' : `
      <path d="M35 55 Q41 50 47 55 Q41 58 35 55Z" fill="#fff" stroke="${INK}" stroke-width="1.2"/>
      <path d="M53 55 Q59 50 65 55 Q59 58 53 55Z" fill="#fff" stroke="${INK}" stroke-width="1.2"/>
      <circle cx="41.5" cy="54.6" r="2.4" fill="${p.eye}" stroke="${INK}" stroke-width=".6"/><circle cx="58.5" cy="54.6" r="2.4" fill="${p.eye}" stroke="${INK}" stroke-width=".6"/>
      <circle cx="41.5" cy="54.6" r="1" fill="${INK}"/><circle cx="58.5" cy="54.6" r="1" fill="${INK}"/>
      <circle cx="40.6" cy="53.7" r=".7" fill="#fff"/><circle cx="57.6" cy="53.7" r=".7" fill="#fff"/>
      ${eyeStroke}
      <path d="M32.5 53.5 Q41 46.5 48.5 53 L47 53.6 Q41 49.5 34 54.6Z" fill="${INK}"/>
      <path d="M51.5 53 Q59 46.5 67.5 53.5 L66 54.6 Q59 49.5 53 53.6Z" fill="${INK}"/>
      <path d="M32.6 53.4 l-2.2 -1.6 M67.4 53.4 l2.2 -1.6" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M37 57.6 l-.6 1.2 M40 58.1 l-.3 1.2 M60 58.1 l.3 1.2 M63 57.6 l.6 1.2" stroke="${INK}" stroke-width=".7"/>`;
    const brows = `<path d="M33 47.5 Q39 44.5 47 48.6 L46.4 49.8 Q39 47 33.6 48.8Z" fill="${INK}"/><path d="M67 47.5 Q61 44.5 53 48.6 L53.6 49.8 Q61 47 66.4 48.8Z" fill="${INK}"/>`;
    const nose = `<path d="M51 52 Q52.5 58 51.5 63" fill="none" stroke="${INK}" stroke-width=".7" opacity=".55"/><path d="M50 57 L47.5 65 L51.5 66" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/><path d="M52.5 64.5 l1.6 .6" stroke="${INK}" stroke-width=".9" stroke-linecap="round"/>`;
    const lips = (p.extra === 'mask') ? '' : `<path d="M43.5 72 Q47 70 50 71 Q53 70 56.5 72 Q50 75.5 43.5 72Z" fill="${p.lip}" stroke="${INK}" stroke-width="1.1"/><path d="M45 73.6 Q50 75 55 73.6" stroke="${INK}" stroke-width=".7" fill="none"/><ellipse cx="51.5" cy="73.6" rx="2" ry=".7" fill="#fff" opacity=".7"/>`;
    const dark = shade(p.skin);
    const hatch = `<path d="M58 29.5 Q68 32 68 48 L67 62 Q64 76 50 82 Q59 71 61 57 Q63 42 58 29.5Z" fill="${dark}" opacity=".45"/>
      <path d="M33.5 62 Q36 72 44 78 Q38 70 37 62Z" fill="${dark}" opacity=".35"/>
      <g stroke="${INK}" stroke-width=".7" opacity=".5">${[0,1,2,3].map(i=>`<path d="M${62-i*.6} ${61+i*2.6} l4 -2.2"/>`).join('')}${[0,1,2].map(i=>`<path d="M${36+i*.6} ${62+i*2.6} l-3 -1.8"/>`).join('')}<path d="M44 42 l3 -1 M53 41 l3 1" opacity=".6"/></g>`;
    const neckShade = `<path d="M42 78 L58 78 L58 86 Q50 84 42 81Z" fill="${dark}" opacity=".7"/>`;
    const hairShine = hs === 'bald' ? `<path d="M40 34 Q48 30 56 32" stroke="#fff" stroke-width="1.6" opacity=".45" fill="none"/>` : `<g fill="none" stroke-linecap="round"><path d="M38 33 Q46 28 56 30" stroke="#fff" stroke-width="2" opacity=".4"/><path d="M42 36 Q48 33 54 34" stroke="#fff" stroke-width="1.2" opacity=".3"/></g>`;
    const hairStrands = ['long', 'verylong', 'shaggy', 'bob', 'bobbang'].includes(hs) ? `<g stroke="${INK}" stroke-width=".8" opacity=".45" fill="none">${hs === 'verylong' || hs === 'long' ? '<path d="M24 60 Q22 80 24 96"/><path d="M76 60 Q78 80 76 96"/><path d="M28 70 Q27 84 29 94"/><path d="M72 70 Q73 84 71 94"/>' : '<path d="M27 52 Q25 62 27 70"/><path d="M73 52 Q75 62 73 70"/>'}</g>` : '';
    const folds = `<g stroke="${INK}" stroke-width="1" opacity=".5" fill="none"><path d="M24 108 Q30 100 34 96"/><path d="M76 108 Q70 100 66 96"/><path d="M30 118 Q34 110 40 106"/><path d="M70 118 Q66 110 60 106"/></g><path d="M8 120 Q12 94 50 88 Q30 98 26 120Z" fill="#000" opacity=".12"/>`;
    const hatSvg = p.hat && hats[p.hat] ? hats[p.hat](p.hatColor, p.hat2) : '';
    const ex = p.extra && extras[p.extra] ? extras[p.extra](p) : '';
    const exBehind = ['feather', 'rain', 'bugs', 'balloon', 'hook'].includes(p.extra);
    const exOnTop = ['flag', 'heart', 'cross', 'scarf'].includes(p.extra);
    const exFace = !exBehind && !exOnTop;
    return `<svg class="portrait" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>
        <pattern id="${id}d" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="${INK}" opacity=".18"/></pattern>
      </defs>
      <rect width="100" height="120" fill="url(#${id}g)"/>
      <path d="M62 0 L100 0 L100 120 L28 120Z" fill="${bg[1]}" opacity=".5"/>
      <rect width="100" height="120" fill="url(#${id}d)"/>
      <g fill="#fff" opacity=".35">${[[10,14,3],[88,22,2.4],[14,96,2],[90,90,3],[80,8,1.6]].map(([x,y,r])=>`<path d="M${x} ${y-r} l${r*.3} ${r*.7} ${r*.75} .1 -${r*.6} ${r*.5} .25 ${r*.75} -${r*.7} -${r*.42} -${r*.7} ${r*.42} .25 -${r*.75} -${r*.6} -${r*.5} ${r*.75} -.1z"/>`).join('')}</g>
      <g stroke="#fff" stroke-width="1" opacity=".25">${[0,1,2,3,4,5,6,7].map(i=>`<path d="M50 60 L${50+Math.cos(i*0.785)*90} ${60+Math.sin(i*0.785)*90}"/>`).join('')}</g>
      ${exBehind ? ex : ''}
      <g stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round">
        ${hairBack[hs] ? hairBack[hs](p.hair) : ''}
        <path d="M8 120 Q12 94 50 88 Q88 94 92 120 Z" fill="${p.outfit}"/>
        <path d="M38 88 L50 104 L62 88" fill="${p.outfit2}"/>
        <path d="M42 76 L42 90 L58 90 L58 76 Z" fill="${p.skin}"/>
      </g>
      ${folds}${neckShade}
      <g stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round">
        <path d="${face}" fill="${p.skin}"/>
        <path d="M33 52 Q28 56 32 62" fill="${p.skin}"/><path d="M67 52 Q72 56 68 62" fill="${p.skin}"/>
      </g>
      ${hairStrands}${hatch}${eyes}${brows}${nose}${lips}
      ${exFace ? ex : ''}
      <g stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round">
        ${hairFront[hs] ? hairFront[hs](p.hair) : ''}
      </g>
      ${p.hat && p.hat !== 'ribbon' && p.hat !== 'headband' && p.hat !== 'bandana' ? '' : hairShine}
      <g stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round">
        ${hatSvg}
      </g>
      ${hatSvg ? `<g fill="none" stroke="#fff" stroke-linecap="round" opacity=".35"><path d="M36 22 Q44 16 54 16" stroke-width="2"/></g>` : ''}
      ${exOnTop ? ex : ''}
    </svg>`;
  }

  /* ---------------- Creature portraits ---------------- */
  const creatures = {
    raptor: c => `<path d="M14 90 Q20 60 44 52 L76 44 Q92 44 94 54 L90 60 L70 62 L66 70 L84 72 Q86 80 76 82 L50 80 Q40 100 30 118 L10 118Z" fill="${c}" stroke="${INK}" stroke-width="${SW}"/><circle cx="76" cy="50" r="3" fill="#f2c14e" stroke="${INK}" stroke-width="1"/><path d="M76 48 L76 52" stroke="${INK}" stroke-width="1.2"/><path d="M70 62 L72 66 L75 62 L78 66 L81 62 L84 66 L86 62" fill="#fff" stroke="${INK}" stroke-width=".8"/><path d="M40 60 Q38 40 50 30 Q52 44 48 56" fill="#c8323c" stroke="${INK}" stroke-width="1.4"/>`,
    cougar: c => `<path d="M20 118 Q18 80 30 60 Q34 44 40 36 L44 22 L52 34 Q56 32 60 34 L68 22 L70 38 Q80 50 80 70 Q80 92 70 100 L80 118Z" fill="${c}" stroke="${INK}" stroke-width="${SW}"/><path d="M40 56 Q46 52 50 56 M60 56 Q64 52 70 56" stroke="${INK}" stroke-width="2" fill="#f2c14e"/><path d="M52 66 L58 66 L55 70Z" fill="${INK}"/><path d="M55 70 Q50 78 44 76 M55 70 Q60 78 66 76" stroke="${INK}" stroke-width="1.4" fill="none"/><path d="M30 70 L10 66 M30 74 L10 76 M80 70 L96 66 M80 74 L96 76" stroke="${INK}" stroke-width=".8"/>`,
    wolf: c => `<path d="M16 118 Q16 80 28 62 L22 20 L42 44 Q50 40 58 44 L78 20 L72 62 Q84 80 84 118Z" fill="${c}" stroke="${INK}" stroke-width="${SW}"/><path d="M50 60 L40 88 L50 96 L60 88Z" fill="#e8e8f0" stroke="${INK}" stroke-width="1.4"/><circle cx="40" cy="60" r="3" fill="#f2c14e" stroke="${INK}"/><circle cx="60" cy="60" r="3" fill="#f2c14e" stroke="${INK}"/><path d="M47 88 L53 88 L50 92Z" fill="${INK}"/>`,
    snake: c => `<path d="M10 110 Q40 90 30 70 Q20 50 50 40 Q80 34 84 54 Q86 66 72 66 Q60 66 62 56" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M10 110 Q40 90 30 70 Q20 50 50 40 Q80 34 84 54 Q86 66 72 66 Q60 66 62 56" fill="none" stroke="${c}" stroke-width="11" stroke-linecap="round"/><path d="M62 56 L72 50" stroke="#c8323c" stroke-width="1.6"/><circle cx="80" cy="50" r="2" fill="#f2c14e" stroke="${INK}"/>`,
    coyote: c => `<path d="M18 118 Q20 84 32 64 L28 24 L46 48 Q54 46 60 50 L78 30 L70 66 Q76 76 90 80 Q88 90 70 90 Q64 100 72 118Z" fill="${c}" stroke="${INK}" stroke-width="${SW}"/><circle cx="54" cy="62" r="2.6" fill="#f2c14e" stroke="${INK}"/><path d="M86 80 L90 82" stroke="${INK}" stroke-width="3"/>`,
    grizzly: c => `<path d="M10 118 Q8 70 26 50 L22 30 Q30 24 36 34 Q50 26 64 34 Q70 24 78 30 L74 50 Q92 70 90 118Z" fill="${c}" stroke="${INK}" stroke-width="${SW}"/><ellipse cx="50" cy="72" rx="14" ry="10" fill="#c8a070" stroke="${INK}" stroke-width="1.6"/><path d="M45 68 L55 68 L50 73Z" fill="${INK}"/><circle cx="38" cy="54" r="2.4" fill="${INK}"/><circle cx="62" cy="54" r="2.4" fill="${INK}"/>`,
    crow: c => `<path d="M20 100 Q30 60 50 50 Q60 40 74 44 L92 50 L76 54 Q80 70 70 86 L90 118 L10 118Z" fill="${c}" stroke="${INK}" stroke-width="${SW}"/><circle cx="70" cy="48" r="2.4" fill="#f2c14e" stroke="${INK}"/>`,
    cactus: c => `<path d="M40 118 L40 30 Q50 18 60 30 L60 118Z M40 70 L24 70 L24 48 Q30 40 34 48 L34 62 L40 62Z M60 60 L76 60 L76 40 Q70 32 66 40 L66 52 L60 52Z" fill="${c}" stroke="${INK}" stroke-width="${SW}"/><circle cx="50" cy="26" r="6" fill="#e8508a" stroke="${INK}" stroke-width="1.4"/>`,
    ball: c => `<circle cx="50" cy="60" r="30" fill="${c}" stroke="${INK}" stroke-width="${SW}"/>${[0,1,2,3,4,5,6,7].map(i=>`<circle cx="${50+Math.cos(i*0.785)*20}" cy="${60+Math.sin(i*0.785)*20}" r="3" fill="#6a7a9a" stroke="${INK}" stroke-width="1"/>`).join('')}`,
    world: c => `<path d="M20 118 Q18 76 34 60 Q30 40 40 26 L50 34 L60 26 Q70 40 66 60 Q82 76 80 118Z" fill="${c}" stroke="${INK}" stroke-width="${SW}"/><path d="M36 50 L64 50 L60 58 L40 58Z" fill="#1a1020"/><circle cx="44" cy="54" r="2" fill="#e8508a"/><circle cx="56" cy="54" r="2" fill="#e8508a"/><path d="M50 84 c-3-5-10-5-10 0 0 4 10 10 10 10 s10-6 10-10c0-5-7-5-10 0z" fill="#e8508a" stroke="${INK}" stroke-width="1.4"/>`,
  };
  function creature(kind, color, bg = ['#5b3a8c', '#e8742a']) {
    const id = nid('cr');
    return `<svg class="portrait" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>
      <pattern id="${id}d" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="${INK}" opacity=".18"/></pattern></defs>
      <rect width="100" height="120" fill="url(#${id}g)"/><rect width="100" height="120" fill="url(#${id}d)"/>
      ${(creatures[kind] || creatures.coyote)(color)}
    </svg>`;
  }

  /* ---------------- Horse ---------------- */
  function horse(opts = {}) {
    const coat = opts.coat || '#7a4a2a', mane = opts.mane || '#2a1a1a', wrap = opts.wrap || '#8a5ad0';
    const spots = opts.spots;
    const rider = opts.rider;
    const leg = (x, y, cls, back) => `<g class="leg ${cls}" style="transform-origin:${x}px ${y}px"><path d="M${x-6} ${y} L${x+6} ${y} L${x+4} ${y+26} L${x+3} ${y+38} L${x-3} ${y+38} L${x-2} ${y+26}Z" fill="${back ? shade(coat) : coat}" stroke="${INK}" stroke-width="${SW}"/><rect x="${x-3.5}" y="${y+26}" width="7" height="8" fill="${wrap}" stroke="${INK}" stroke-width="1.4"/><path d="M${x-4} ${y+38} L${x+4} ${y+38} L${x+5} ${y+43} L${x-5} ${y+43}Z" fill="${INK}"/></g>`;
    const spotSvg = spots ? [[80,62],[96,70],[70,74],[110,58],[118,72],[88,78]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="${spots}"/>`).join('') : '';
    const riderSvg = rider ? `<g class="rider">
        <path class="cape" d="M100 30 Q70 20 50 30 Q60 36 56 44 Q76 40 98 44Z" fill="${rider.cape || '#3a8c4a'}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M94 50 Q92 34 102 28 Q112 30 112 44 L110 56 Z" fill="${rider.body || '#3b5bb5'}" stroke="${INK}" stroke-width="${SW}"/>
        <circle cx="106" cy="22" r="7" fill="${rider.skin || '#f6d2b0'}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M96 20 Q106 8 116 20 Z M92 20 L120 19" fill="${rider.hat || '#5b3a8c'}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M104 40 L120 36 L134 42" stroke="${INK}" stroke-width="2" fill="none"/>
      </g>` : '';
    return `<svg class="horse-svg" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g class="horse-body">
        ${leg(68, 80, 'bl', true)}${leg(134, 80, 'fl', true)}
        <path class="tail" d="M52 60 Q34 56 22 70 Q14 88 24 104 Q28 86 38 78 Q46 70 56 68Z" fill="${mane}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M50 62 Q56 46 100 48 Q130 46 142 54 Q152 70 140 84 Q110 92 70 88 Q46 84 50 62Z" fill="${coat}" stroke="${INK}" stroke-width="${SW}"/>
        ${spotSvg}
        <path d="M128 58 Q136 30 150 20 L166 28 Q158 46 148 70Z" fill="${coat}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M150 18 Q160 10 170 14 L188 36 Q190 43 183 45 L168 41 Q160 37 157 32Z" fill="${coat}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M155 15 L157 3 L163 13Z" fill="${coat}" stroke="${INK}" stroke-width="${SW}"/>
        <circle cx="168" cy="24" r="2" fill="${INK}"/>
        <path d="M150 20 Q140 28 134 42 Q130 52 124 58 Q132 46 136 36 Q142 24 152 16Z" fill="${mane}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M170 34 L182 40 M160 30 L176 44" stroke="${wrap}" stroke-width="2"/>
        <path d="M84 50 Q96 44 108 50 L110 62 Q96 66 82 62Z" fill="${opts.saddle || '#c8a040'}" stroke="${INK}" stroke-width="${SW}"/>
        ${leg(60, 80, 'br')}${leg(126, 80, 'fr')}
        ${riderSvg}
      </g>
    </svg>`;
  }
  function shade(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (n >> 16) - 40), g = Math.max(0, ((n >> 8) & 255) - 40), b = Math.max(0, (n & 255) - 40);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  /* ---------------- Scenes ---------------- */
  const SCENES = {
    1: { name: 'Arizona Desert', sky: ['#3d7fd9', '#9ec3ef', '#f6c27a'], far: '#c78f9a', mid: '#d9713a', midShade: '#8a3a4a', ground: '#e8b36a', groundShade: '#c8844a', cloud: '#ffffff', cloudShade: '#b8a8e0', sun: '#fff6d0', deco: 'cactus' },
    2: { name: 'Monument Valley', sky: ['#3a2270', '#6a4ac0', '#b07ad8'], far: '#8a6ac0', mid: '#b04a2a', midShade: '#5a1a2a', ground: '#e0782e', groundShade: '#b0501e', cloud: '#f4ecff', cloudShade: '#a888d8', sun: '#ffd8f0', deco: 'butte' },
    3: { name: 'The Great Plains', sky: ['#1f3440', '#4a6a6a', '#9fbf9a'], far: '#4a6a5a', mid: '#5a7a3a', midShade: '#2a4a2a', ground: '#8aaa4a', groundShade: '#5a7a2a', cloud: '#c8d8d0', cloudShade: '#6a7a80', sun: '#e8f0d0', deco: 'grass', rain: true },
    4: { name: 'The Frozen North', sky: ['#6a9ac8', '#b8d8f0', '#f0f6ff'], far: '#a8c0d8', mid: '#2a5a5a', midShade: '#1a3a3a', ground: '#e8f0f8', groundShade: '#b0c8e0', cloud: '#ffffff', cloudShade: '#b8c8e8', sun: '#ffffff', deco: 'pine', snow: true },
    5: { name: 'The East Coast', sky: ['#2a0c0c', '#8a2a14', '#f0822a'], far: '#6a3a2a', mid: '#4a2a2a', midShade: '#2a1010', ground: '#b8e0f0', groundShade: '#6aa0c8', cloud: '#e8b870', cloudShade: '#7a3a20', sun: '#ffe080', deco: 'waves' },
    7: { name: 'The Devil\'s Palm', sky: ['#8a1a10', '#e8742a', '#ffd08a'], far: '#c8603a', mid: '#a8402a', midShade: '#5a1a1a', ground: '#f0c070', groundShade: '#c88a4a', cloud: '#ffe0b0', cloudShade: '#c86a4a', sun: '#fff0a0', deco: 'palm' },
    8: { name: 'The Silver Mine', sky: ['#0a0810', '#241a28', '#4a3a3a'], far: '#2a2230', mid: '#3a3040', midShade: '#1a1420', ground: '#5a4a40', groundShade: '#3a2e28', cloud: '#3a3040', cloudShade: '#1a1420', sun: '#f2c14e', deco: 'mine' },
    9: { name: 'Frozen Lake Michigan', sky: ['#1a2a4a', '#6a8ab0', '#d8e8f8'], far: '#8aa0c0', mid: '#c8d8ec', midShade: '#8aa8c8', ground: '#e8f4ff', groundShade: '#9fc0e0', cloud: '#e8f0ff', cloudShade: '#8a9ac0', sun: '#ffffff', deco: 'ice', snow: true },
    10: { name: 'Philadelphia Rail Yard', sky: ['#1a1018', '#5a2a2a', '#c86a3a'], far: '#4a2a2a', mid: '#2a1a1a', midShade: '#140a0a', ground: '#6a5a50', groundShade: '#3a3028', cloud: '#8a6a6a', cloudShade: '#3a2a2a', sun: '#ffb070', deco: 'rail', rain: true },
    6: { name: 'New York City', sky: ['#0a0c28', '#3a1a5a', '#8a2a6a'], far: '#2a2050', mid: '#1a1438', midShade: '#0a0820', ground: '#3a3050', groundShade: '#1a1430', cloud: '#6a4a9a', cloudShade: '#2a1a4a', sun: '#ffe8a0', deco: 'city' },
  };

  function ridge(rng, w, h, base, amp, steps, jag = false) {
    const pts = [];
    const n = steps;
    const ys = [];
    for (let i = 0; i <= n; i++) ys.push(base - rng() * amp);
    ys[n] = ys[0];
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * w;
      if (jag && i < n) {
        const x2 = ((i + 0.5) / n) * w;
        pts.push(`${x},${ys[i]}`, `${x2},${ys[i] - amp * 0.3 * rng()}`);
      } else pts.push(`${x},${ys[i]}`);
    }
    return pts;
  }
  function mesas(rng, w, base, color, shadeC) {
    let s = '';
    let x = 20 + rng() * 60;
    while (x < w - 180) {
      const mw = 80 + rng() * 170, mh = 70 + rng() * 150;
      const top = base - mh;
      s += `<path d="M${x} ${base} L${x + 14} ${top + 12} L${x + 20} ${top} L${x + mw - 20} ${top} L${x + mw - 12} ${top + 14} L${x + mw} ${base}Z" fill="${color}" stroke="${INK}" stroke-width="3"/>`;
      s += `<path d="M${x + mw * 0.62} ${top} L${x + mw - 20} ${top} L${x + mw - 12} ${top + 14} L${x + mw} ${base} L${x + mw * 0.55} ${base}Z" fill="${shadeC}" opacity=".55"/>`;
      let hl = '';
      for (let hy = top + 16; hy < base - 6; hy += 11) hl += `M${x + mw * 0.66} ${hy} l${mw * 0.22} -8 `;
      s += `<path d="${hl}" stroke="${INK}" stroke-width="1.3" opacity=".35"/>`;
      s += `<path d="M${x + 18} ${top + mh * 0.3} H${x + mw * 0.6} M${x + 22} ${top + mh * 0.55} H${x + mw * 0.58} M${x + 26} ${top + mh * 0.78} H${x + mw * 0.56}" stroke="${INK}" stroke-width="1.2" opacity=".25"/>`;
      s += `<path d="M${x + 20} ${top} L${x + mw * 0.6} ${top}" stroke="#fff" stroke-width="2.4" opacity=".45"/>`;
      for (let k = 0; k < 3; k++) s += `<path d="M${x + 18} ${top + 20 + k * 22} L${x + mw * 0.55} ${top + 24 + k * 22}" stroke="${INK}" stroke-width="1.2" opacity=".35"/>`;
      x += mw + 40 + rng() * 160;
    }
    return s;
  }
  function cloud(x, y, s, c, sh) {
    const blobs = [[0, 0, 40], [38, -18, 46], [82, -4, 38], [118, 8, 30], [-34, 10, 28]];
    const shadow = blobs.map(([bx, by, r]) => `<circle cx="${x + bx * s}" cy="${y + by * s + 10 * s}" r="${r * s}" fill="${sh}"/>`).join('');
    const main = blobs.map(([bx, by, r]) => `<circle cx="${x + bx * s}" cy="${y + by * s}" r="${r * s}" fill="${c}"/>`).join('');
    return `<g class="cloud-g"><g stroke="${INK}" stroke-width="${5 / s > 6 ? 6 : 5}">${blobs.map(([bx, by, r]) => `<circle cx="${x + bx * s}" cy="${y + by * s + 4 * s}" r="${r * s + 1}" fill="${INK}"/>`).join('')}</g>${shadow}${main}<rect x="${x - 70 * s}" y="${y + 26 * s}" width="${220 * s}" height="${40 * s}" fill="transparent"/></g>`;
  }
  /** distant landmarks drawn on the far layer, one set per region */
  function farDeco(act, rng, w, base, c) {
    let s = '';
    const sil = c.far;
    if (act === 1 || act === 7) {
      // rock arch and saguaro silhouettes
      const ax = 300 + rng() * 300;
      s += `<path d="M${ax} ${base} L${ax + 10} ${base - 120} Q${ax + 90} ${base - 190} ${ax + 170} ${base - 120} L${ax + 180} ${base} L${ax + 150} ${base} L${ax + 146} ${base - 96} Q${ax + 90} ${base - 146} ${ax + 36} ${base - 96} L${ax + 30} ${base}Z" fill="${sil}" stroke="${INK}" stroke-width="2.4" opacity=".9"/>`;
      for (let i = 0; i < 6; i++) { const x = rng() * w, h = 40 + rng() * 40; s += `<path d="M${x - 4} ${base} V${base - h} q4 -6 8 0 V${base} M${x - 4} ${base - h * 0.5} h-10 v-${h * 0.3} q3 -4 6 0 v${h * 0.16} h4 M${x + 4} ${base - h * 0.6} h9 v-${h * 0.25} q-3 -4 -5 0 v${h * 0.12} h-4" fill="${shade(sil)}" stroke="${INK}" stroke-width="1.6" opacity=".7"/>`; }
    } else if (act === 2) {
      for (let i = 0; i < 3; i++) { const x = 150 + i * 520 + rng() * 120, h = 180 + rng() * 60, bw = 40 + rng() * 30; s += `<path d="M${x} ${base} L${x + 8} ${base - h} L${x + bw - 8} ${base - h} L${x + bw} ${base}Z" fill="${sil}" stroke="${INK}" stroke-width="2.4"/><path d="M${x + 6} ${base - h * 0.6} H${x + bw - 6} M${x + 4} ${base - h * 0.3} H${x + bw - 4}" stroke="${INK}" stroke-width="1.2" opacity=".35"/>`; }
    } else if (act === 3) {
      // windmill, farmhouse, grain silo
      const x = 260 + rng() * 200;
      s += `<g stroke="${INK}" stroke-width="2.2" fill="${shade(sil)}"><path d="M${x} ${base} L${x + 8} ${base - 110} L${x + 16} ${base}Z"/><g class="windmill" style="transform-origin:${x + 8}px ${base - 110}px">${[0, 1, 2, 3, 4, 5].map(k => `<path d="M${x + 8} ${base - 110} L${x + 8 + Math.cos(k * 1.047) * 34} ${base - 110 + Math.sin(k * 1.047) * 34} L${x + 8 + Math.cos(k * 1.047 + .25) * 30} ${base - 110 + Math.sin(k * 1.047 + .25) * 30}Z"/>`).join('')}</g></g>`;
      const fx = 900 + rng() * 300;
      s += `<g stroke="${INK}" stroke-width="2.2"><path d="M${fx} ${base} V${base - 44} L${fx + 34} ${base - 70} L${fx + 68} ${base - 44} V${base}Z" fill="#8a3a2a"/><rect x="${fx + 26}" y="${base - 30}" width="14" height="30" fill="#3a1a1a"/><rect x="${fx + 80}" y="${base - 96}" width="30" height="96" fill="#a8a8b0"/><path d="M${fx + 80} ${base - 96} Q${fx + 95} ${base - 114} ${fx + 110} ${base - 96}" fill="#8a8a98"/></g>`;
    } else if (act === 4 || act === 9) {
      // snow-capped peaks
      for (let i = 0; i < 4; i++) { const x = i * 440 + rng() * 120, h = 150 + rng() * 90, bw = 260 + rng() * 80; s += `<path d="M${x} ${base} L${x + bw / 2} ${base - h} L${x + bw} ${base}Z" fill="${sil}" stroke="${INK}" stroke-width="2.4"/><path d="M${x + bw / 2} ${base - h} L${x + bw / 2 - 34} ${base - h + 50} L${x + bw / 2 - 12} ${base - h + 40} L${x + bw / 2} ${base - h + 56} L${x + bw / 2 + 14} ${base - h + 40} L${x + bw / 2 + 36} ${base - h + 52}Z" fill="#fff" stroke="${INK}" stroke-width="1.6"/>`; }
    } else if (act === 5 || act === 10) {
      // church spires and a harbour mast line
      for (let i = 0; i < 4; i++) { const x = 120 + i * 400 + rng() * 80, h = 110 + rng() * 60; s += `<path d="M${x} ${base} V${base - h * 0.6} L${x + 18} ${base - h} L${x + 36} ${base - h * 0.6} V${base}Z" fill="${shade(sil)}" stroke="${INK}" stroke-width="2"/><path d="M${x + 18} ${base - h} V${base - h - 16} M${x + 12} ${base - h - 10} H${x + 24}" stroke="${INK}" stroke-width="2"/>`; }
    } else if (act === 6) {
      // the bridge and a spire
      s += `<g stroke="${INK}" stroke-width="2.2" fill="${shade(sil)}"><rect x="200" y="${base - 170}" width="26" height="170"/><rect x="620" y="${base - 170}" width="26" height="170"/><path d="M0 ${base - 60} Q213 ${base - 190} 213 ${base - 170} Q420 ${base - 40} 633 ${base - 170} Q640 ${base - 190} 900 ${base - 70}" fill="none"/>${Array.from({ length: 14 }, (_, k) => `<path d="M${226 + k * 28} ${base - 150 + Math.sin(k / 13 * Math.PI) * 100} V${base - 40}" fill="none" stroke-width="1"/>`).join('')}<path d="M1200 ${base} V${base - 200} L1214 ${base - 260} L1228 ${base - 200} V${base}Z"/></g>`;
    } else if (act === 8) {
      for (let i = 0; i < 8; i++) { const x = rng() * w, h = 30 + rng() * 60; s += `<path d="M${x} 0 L${x + 10} ${h} L${x + 20} 0Z" fill="${shade(sil)}" stroke="${INK}" stroke-width="1.6"/>`; }
    }
    return s;
  }
  /** foreground props: fences, skulls, rocks, hoofprints */
  function props(act, rng, w, base, c) {
    let s = '';
    if ([1, 2, 3, 7].includes(act)) {
      // fence posts with wire
      const fx0 = rng() * 400, n = 7;
      for (let i = 0; i < n; i++) { const x = fx0 + i * 70, y = base + 34 + i * 1.5; s += `<path d="M${x} ${y} l2 -34 l6 0 l-2 34z" fill="#8a6a4a" stroke="${INK}" stroke-width="1.6"/>`; }
      s += `<path d="M${fx0 + 4} ${base + 14} ${Array.from({ length: n - 1 }, (_, i) => `Q${fx0 + i * 70 + 39} ${base + 20 + i * 1.5} ${fx0 + (i + 1) * 70 + 4} ${base + 15 + (i + 1) * 1.5}`).join(' ')}" stroke="${INK}" stroke-width="1" fill="none"/>`;
    }
    if ([1, 2, 7].includes(act)) {
      // cattle skull
      const x = 900 + rng() * 400, y = base + 60;
      s += `<g transform="translate(${x} ${y})" stroke="${INK}" stroke-width="1.8"><path d="M-30 -8 Q-40 -20 -46 -12 Q-36 -12 -24 -2 M30 -8 Q40 -20 46 -12 Q36 -12 24 -2" fill="#f6ecd8"/><path d="M-22 -10 Q0 -18 22 -10 L14 18 Q0 26 -14 18Z" fill="#f6ecd8"/><ellipse cx="-8" cy="0" rx="4" ry="5" fill="${INK}"/><ellipse cx="8" cy="0" rx="4" ry="5" fill="${INK}"/><path d="M-4 14 h8" /></g>`;
    }
    // hoofprint trail
    for (let i = 0; i < 12; i++) { const x = i * 140 + rng() * 20, y = base + 80 + (i % 2) * 10; s += `<path d="M${x} ${y} a6 5 0 1 1 10 0 l-2 -1 a3 3 0 0 0 -6 0z" fill="${shade(c.ground)}" opacity=".6"/>`; }
    // rocks with hatching
    for (let i = 0; i < 6; i++) { const x = rng() * w, y = base + 40 + rng() * 60, r = 8 + rng() * 14; s += `<path d="M${x - r} ${y} Q${x - r * 0.8} ${y - r} ${x} ${y - r} Q${x + r} ${y - r * 0.8} ${x + r} ${y}Z" fill="${c.groundShade}" stroke="${INK}" stroke-width="1.8"/><path d="M${x + r * 0.2} ${y - r * 0.6} l${r * 0.5} ${r * 0.4} M${x + r * 0.4} ${y - r * 0.8} l${r * 0.4} ${r * 0.5}" stroke="${INK}" stroke-width="1" opacity=".5"/>`; }
    return s;
  }
  function decoLayer(kind, rng, w, base, cfg) {
    let s = '';
    if (kind === 'cactus' || kind === 'butte') {
      for (let i = 0; i < 7; i++) {
        const x = rng() * (w - 40) + 20, h = 30 + rng() * 50;
        s += `<g transform="translate(${x} ${base})"><path d="M-6 0 L-6 ${-h} Q0 ${-h - 8} 6 ${-h} L6 0Z M-6 ${-h * 0.5} L-18 ${-h * 0.5} L-18 ${-h * 0.8} Q-14 ${-h * 0.9} -12 ${-h * 0.8} L-12 ${-h * 0.62} L-6 ${-h * 0.62}Z" fill="#4a8a3a" stroke="${INK}" stroke-width="2.4"/></g>`;
      }
      for (let i = 0; i < 14; i++) {
        const x = rng() * w, r = 4 + rng() * 14;
        s += `<ellipse cx="${x}" cy="${base + 20 + rng() * 60}" rx="${r * 1.6}" ry="${r * 0.7}" fill="${cfg.groundShade}" stroke="${INK}" stroke-width="1.6"/>`;
      }
    } else if (kind === 'grass') {
      for (let i = 0; i < 60; i++) {
        const x = rng() * w, y = base + rng() * 90, h = 10 + rng() * 22;
        s += `<path d="M${x} ${y} q-4 ${-h * 0.6} -6 ${-h} M${x} ${y} q2 ${-h * 0.7} 6 ${-h * 0.9}" stroke="${cfg.groundShade}" stroke-width="2.2" fill="none"/>`;
      }
    } else if (kind === 'pine') {
      for (let i = 0; i < 12; i++) {
        const x = rng() * w, h = 60 + rng() * 80;
        s += `<path d="M${x} ${base - h} L${x + h * 0.32} ${base} L${x - h * 0.32} ${base}Z" fill="${cfg.mid}" stroke="${INK}" stroke-width="2.4"/><path d="M${x - h * 0.2} ${base - h * 0.35} L${x + h * 0.2} ${base - h * 0.35}" stroke="#fff" stroke-width="3" opacity=".7"/>`;
      }
    } else if (kind === 'waves') {
      for (let i = 0; i < 9; i++) {
        const x = (i / 9) * w + rng() * 40, y = base + 30 + rng() * 50, r = 20 + rng() * 26;
        s += `<g stroke="${INK}" stroke-width="2.4"><path d="M${x - r * 2} ${y + r} Q${x - r} ${y - r * 1.4} ${x + r * 0.4} ${y - r * 0.2} Q${x + r} ${y + r * 0.6} ${x + r * 0.2} ${y + r * 0.4} Q${x - r * 0.2} ${y + r * 0.2} ${x - r * 0.1} ${y - r * 0.2}" fill="#e8f6ff"/><path d="M${x - r * 1.6} ${y + r} L${x + r * 1.4} ${y + r}" fill="none"/></g>`;
      }
    } else if (kind === 'palm') {
      // giant stone fingers rising from the sand, bones, heat spirals
      for (let i = 0; i < 5; i++) {
        const x = 100 + i * 330 + rng() * 60, h = 90 + rng() * 90, lean = (rng() - 0.5) * 30;
        s += `<path d="M${x - 16} ${base} Q${x - 18 + lean * 0.3} ${base - h * 0.6} ${x - 8 + lean} ${base - h} Q${x + lean} ${base - h - 14} ${x + 8 + lean} ${base - h} Q${x + 18 + lean * 0.3} ${base - h * 0.6} ${x + 16} ${base}Z" fill="${cfg.midShade}" stroke="${INK}" stroke-width="2.4"/><path d="M${x - 4 + lean * 0.5} ${base - h * 0.55} q6 -4 12 0" stroke="${INK}" stroke-width="1.6" fill="none" opacity=".6"/>`;
      }
      for (let i = 0; i < 10; i++) {
        const x = rng() * w, y = base + 20 + rng() * 60;
        s += `<path d="M${x} ${y} l14 -4 M${x + 4} ${y - 5} l3 6 M${x + 10} ${y - 7} l3 6" stroke="#f6ecd8" stroke-width="3" stroke-linecap="round"/>`;
      }
      for (let i = 0; i < 4; i++) {
        const x = 200 + rng() * (w - 400), y = base - 40 - rng() * 60;
        s += `<path d="M${x} ${y}a4 4 0 0 1 8 0 8 8 0 0 1 -16 0 12 12 0 0 1 24 0" stroke="#ffd08a" stroke-width="2" fill="none" opacity=".6"/>`;
      }
    } else if (kind === 'mine') {
      // timber supports, rails and lanterns
      for (let x = 60; x < w; x += 260 + rng() * 60) {
        s += `<g stroke="${INK}" stroke-width="2.4"><rect x="${x}" y="${base - 170}" width="16" height="170" fill="#6a4a2a"/><rect x="${x + 150}" y="${base - 170}" width="16" height="170" fill="#6a4a2a"/><rect x="${x - 10}" y="${base - 184}" width="186" height="18" fill="#7a5a34"/></g>`;
        s += `<g transform="translate(${x + 83} ${base - 150})"><path d="M0 -16v10" stroke="${INK}" stroke-width="2"/><rect x="-7" y="-6" width="14" height="18" fill="#f2c14e" stroke="${INK}" stroke-width="2"/><circle cx="0" cy="3" r="22" fill="#f2c14e" opacity=".18"/></g>`;
      }
      s += `<path d="M0 ${base + 40} H${w} M0 ${base + 58} H${w}" stroke="#9a9aaa" stroke-width="4"/>`;
      for (let x = 0; x < w; x += 36) s += `<rect x="${x}" y="${base + 36}" width="22" height="26" fill="#4a3424" stroke="${INK}" stroke-width="1.4"/>`;
      for (let i = 0; i < 12; i++) { const x = rng() * w, y = base + 70 + rng() * 30; s += `<path d="M${x} ${y}l6-10 8 2 4 8z" fill="#c8d0e0" stroke="${INK}" stroke-width="1.4"/>`; }
    } else if (kind === 'ice') {
      // cracks in the lake, snow drifts, a distant pine line
      for (let i = 0; i < 9; i++) {
        const x = rng() * w, y = base + 20 + rng() * 70;
        s += `<path d="M${x} ${y} l${30 + rng() * 40} ${-6 + rng() * 12} l${20 + rng() * 30} ${10 + rng() * 10} m-20 -8 l10 -16" stroke="#6a8ab0" stroke-width="2" fill="none"/>`;
      }
      for (let i = 0; i < 6; i++) { const x = rng() * w; s += `<ellipse cx="${x}" cy="${base + 6}" rx="${50 + rng() * 60}" ry="10" fill="#ffffff" stroke="${INK}" stroke-width="1.6"/>`; }
      for (let i = 0; i < 16; i++) { const x = rng() * w, h = 24 + rng() * 26; s += `<path d="M${x} ${base - h} L${x + h * 0.3} ${base - 4} L${x - h * 0.3} ${base - 4}Z" fill="#2a4a5a" stroke="${INK}" stroke-width="1.6"/>`; }
    } else if (kind === 'rail') {
      // freight cars on the line, telegraph poles
      let x = 20;
      while (x < w) {
        const cw = 170 + rng() * 60, col = ['#6a2a1a', '#3a3a4a', '#5a4a2a'][Math.floor(rng() * 3)];
        s += `<g stroke="${INK}" stroke-width="2.4"><rect x="${x}" y="${base - 96}" width="${cw}" height="78" fill="${col}"/><rect x="${x + cw * 0.38}" y="${base - 84}" width="${cw * 0.24}" height="60" fill="${cfg.midShade}"/><circle cx="${x + 26}" cy="${base - 12}" r="12" fill="#2a2a2a"/><circle cx="${x + cw - 26}" cy="${base - 12}" r="12" fill="#2a2a2a"/></g>`;
        x += cw + 26;
      }
      s += `<path d="M0 ${base + 2} H${w}" stroke="#8a8a9a" stroke-width="4"/>`;
      for (let px = 80; px < w; px += 380) s += `<path d="M${px} ${base - 200} V${base} M${px - 24} ${base - 186} H${px + 24} M${px - 18} ${base - 170} H${px + 18}" stroke="${INK}" stroke-width="3.2"/>`;
      s += `<path d="M0 ${base - 186} ${Array.from({ length: 6 }, (_, i) => `Q${80 + i * 380 + 190} ${base - 160} ${80 + (i + 1) * 380} ${base - 186}`).join(' ')}" stroke="${INK}" stroke-width="1.2" fill="none"/>`;
    } else if (kind === 'city') {
      let x = 0;
      while (x < w) {
        const bw = 40 + rng() * 60, bh = 60 + rng() * 170;
        s += `<rect x="${x}" y="${base - bh}" width="${bw}" height="${bh}" fill="${cfg.midShade}" stroke="${INK}" stroke-width="2"/>`;
        for (let wy = base - bh + 10; wy < base - 10; wy += 16)
          for (let wx = x + 6; wx < x + bw - 8; wx += 12)
            if (rng() > 0.55) s += `<rect x="${wx}" y="${wy}" width="5" height="7" fill="#ffd84a" opacity=".85"/>`;
        x += bw + 4;
      }
    }
    return s;
  }
  /** Parallax scene: returns HTML string with layered, seamlessly scrolling SVGs. */
  function scene(act, opts = {}) {
    const c = SCENES[act] || SCENES[1];
    const W = 1600, H = 600;
    const rng = seeded(act * 977 + 13);
    const id = nid('sc');
    const layer = (content, speed, extraCls = '') =>
      `<div class="px-layer ${extraCls}" style="--spd:${speed}s"><svg viewBox="0 0 ${W * 2} ${H}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><g>${content}</g><g transform="translate(${W} 0)">${content}</g></svg></div>`;
    const sky = `<svg class="px-sky" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sky[0]}"/><stop offset=".55" stop-color="${c.sky[1]}"/><stop offset="1" stop-color="${c.sky[2]}"/></linearGradient>
      <radialGradient id="${id}sun"><stop offset="0" stop-color="${c.sun}" stop-opacity=".95"/><stop offset="1" stop-color="${c.sun}" stop-opacity="0"/></radialGradient>
      <pattern id="${id}ht" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.3" fill="#000" opacity=".08"/></pattern></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}s)"/>
      <g class="sun-rays" style="transform-origin:${W * 0.72}px ${H * 0.34}px;${act === 8 ? 'display:none' : ''}">${Array.from({ length: 16 }, (_, k) => { const a = k / 16 * Math.PI * 2, a2 = a + 0.09; return `<path d="M${W * 0.72} ${H * 0.34} L${W * 0.72 + Math.cos(a) * 1400} ${H * 0.34 + Math.sin(a) * 1400} L${W * 0.72 + Math.cos(a2) * 1400} ${H * 0.34 + Math.sin(a2) * 1400}Z" fill="${c.sun}" opacity=".13"/>`; }).join('')}</g>
      <circle cx="${W * 0.72}" cy="${H * 0.34}" r="260" fill="url(#${id}sun)"/>
      ${act === 8 ? '' : `<circle cx="${W * 0.72}" cy="${H * 0.34}" r="46" fill="${c.sun}" opacity=".9" stroke="${INK}" stroke-width="3"/>`}
      <circle cx="${W * 0.72}" cy="${H * 0.34}" r="58" fill="none" stroke="${c.sun}" stroke-width="3" opacity=".5" stroke-dasharray="6 10"/>
      <rect y="${H * 0.62}" width="${W}" height="${H * 0.38}" fill="${c.sun}" opacity=".12"/>
      <rect width="${W}" height="${H}" fill="url(#${id}ht)"/>
      <pattern id="${id}ht2" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="3" fill="#fff" opacity=".12"/></pattern>
      <rect y="${H * 0.5}" width="${W}" height="${H * 0.2}" fill="url(#${id}ht2)"/></svg>`;
    let clouds = '';
    const cr = seeded(act * 31 + 7);
    for (let i = 0; i < 5; i++) clouds += cloud(120 + i * 320 + cr() * 80, 70 + cr() * 150, 0.6 + cr() * 0.7, c.cloud, c.cloudShade);
    const farPts = ridge(rng, W, H, 400, 130, 14, true);
    const far = `<path d="M0 ${H} L${farPts.join(' L')} L${W} ${H}Z" fill="${c.far}" stroke="${INK}" stroke-width="2.4" opacity=".85"/>` + farDeco(act, seeded(act * 57 + 3), W, 470, c);
    let mid;
    if (act === 1 || act === 2 || act === 7) mid = mesas(rng, W, 470, c.mid, c.midShade);
    else if (act === 10) mid = decoLayer('city', rng, W, 470, c);
    else if (act === 5) mid = `<path d="M0 470 ${ridge(rng, W, H, 470, 60, 10).map(p => 'L' + p).join(' ')} L${W} ${H} L0 ${H}Z" fill="${c.mid}" stroke="${INK}" stroke-width="2.4"/>` + decoLayer('city', seeded(99), W, 440, c).replace(/opacity=".85"/g, 'opacity=".4"');
    else if (act === 6) mid = decoLayer('city', rng, W, 500, c);
    else { const mp = ridge(rng, W, H, 470, 80, 10); mid = `<path d="M0 ${H} L${mp.join(' L')} L${W} ${H}Z" fill="${c.mid}" stroke="${INK}" stroke-width="2.4"/>`; }
    const groundPts = ridge(rng, W, H, 500, 16, 8);
    const ground = `<path d="M0 ${H} L${groundPts.join(' L')} L${W} ${H}Z" fill="${c.ground}" stroke="${INK}" stroke-width="2.4"/>` +
      `<g stroke="${c.groundShade}" stroke-width="3" opacity=".7">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 210 + 40} ${540 + (i % 3) * 18} l120 0"/>`).join('')}</g>` +
      decoLayer(act === 5 ? 'waves' : c.deco, rng, W, 505, c) + props(act, seeded(act * 71 + 9), W, 505, c);
    const weather = c.rain ? '<div class="weather rain"></div>' : c.snow ? '<div class="weather snow"></div>' : '<div class="weather dust"></div>';
    const still = opts.still ? ' still' : '';
    const birds = [1, 2, 3, 7].includes(act) ? `<div class="scene-birds">${[0, 1, 2].map(i => `<svg class="bird b${i}" viewBox="0 0 40 16"><path d="M2 12 Q10 0 20 10 Q30 0 38 12 Q30 6 20 14 Q10 6 2 12Z" fill="${INK}"/></svg>`).join('')}</div>` : '';
    const tumble = [1, 2, 7].includes(act) ? `<div class="tumbleweed"><svg viewBox="0 0 60 60"><g fill="none" stroke="#8a6a3a" stroke-width="2.4"><circle cx="30" cy="30" r="24"/><path d="M8 24 Q30 40 52 22 M10 40 Q30 18 50 42 M22 8 Q34 30 20 52 M38 8 Q26 30 42 52"/></g><circle cx="30" cy="30" r="25" fill="none" stroke="${INK}" stroke-width="1.4"/></svg></div>` : '';
    return `<div class="scene act${act}${still}">${sky}
      ${layer(clouds, 160, 'clouds')}${birds}${layer(far, 120)}${layer(mid, 60)}${layer(ground, 22, 'ground')}${tumble}${weather}<div class="scene-vignette"></div></div>`;
  }

  /* ---------------- Icons ---------------- */
  const ICONS = {
    coin: '<circle cx="12" cy="12" r="9" fill="#f2c14e" stroke="#1a1020" stroke-width="2"/><text x="12" y="16.5" font-size="12" font-family="Rye" text-anchor="middle" fill="#1a1020">$</text>',
    heart: '<path d="M12 21s-8-5.3-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.7-8 11-8 11z" fill="#e8508a" stroke="#1a1020" stroke-width="2"/>',
    energy: '<path d="M13 2 L5 14 h6 l-1 8 8-12 h-6z" fill="#f2c14e" stroke="#1a1020" stroke-width="2" stroke-linejoin="round"/>',
    hourglass: '<path d="M6 3h12M6 21h12M7 3c0 6 10 6 10 9s-10 3-10 9M17 3c0 6-10 6-10 9s10 3 10 9" fill="none" stroke="#1a1020" stroke-width="2"/>',
    dice: '<rect x="3" y="3" width="18" height="18" rx="4" fill="#f6ecd8" stroke="#1a1020" stroke-width="2"/><circle cx="8" cy="8" r="1.6"/><circle cx="16" cy="16" r="1.6"/><circle cx="12" cy="12" r="1.6"/>',
    sword: '<path d="M4 20 L14 10 M14 10 L19 3 L21 5 L14 10 M6 14 L10 18" stroke="#1a1020" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    skull: '<path d="M12 3a8 8 0 0 0-8 8c0 3 1.6 5 4 6v3h8v-3c2.4-1 4-3 4-6a8 8 0 0 0-8-8z" fill="#f6ecd8" stroke="#1a1020" stroke-width="2"/><circle cx="9" cy="11" r="2"/><circle cx="15" cy="11" r="2"/>',
    tent: '<path d="M2 20 L12 4 L22 20Z M12 4 L12 20 M8 20 L12 13 L16 20" fill="#e8742a" stroke="#1a1020" stroke-width="2" stroke-linejoin="round"/>',
    question: '<circle cx="12" cy="12" r="10" fill="#6b5bd6" stroke="#1a1020" stroke-width="2"/><text x="12" y="17" font-size="14" font-family="Bangers" text-anchor="middle" fill="#fff">?</text>',
    fire: '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z" fill="#e8742a" stroke="#1a1020" stroke-width="2"/>',
    crown: '<path d="M3 18 L5 7 L10 12 L12 5 L14 12 L19 7 L21 18Z" fill="#f2c14e" stroke="#1a1020" stroke-width="2" stroke-linejoin="round"/>',
    recruit: '<circle cx="9" cy="8" r="4" fill="#3fb8a9" stroke="#1a1020" stroke-width="2"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7" fill="#3fb8a9" stroke="#1a1020" stroke-width="2"/><path d="M19 8v6M16 11h6" stroke="#1a1020" stroke-width="2.4"/>',
    train: '<path d="M12 3 L20 12 L15 12 L15 21 L9 21 L9 12 L4 12Z" fill="#3fb8a9" stroke="#1a1020" stroke-width="2" stroke-linejoin="round"/>',
    bag: '<path d="M5 8h14l-1 13H6z" fill="#c8844a" stroke="#1a1020" stroke-width="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="#1a1020" stroke-width="2"/>',
    map: '<path d="M3 6 L9 3 L15 6 L21 3 L21 18 L15 21 L9 18 L3 21Z M9 3 V18 M15 6 V21" fill="#f6ecd8" stroke="#1a1020" stroke-width="2" stroke-linejoin="round"/>',
    gear: '<circle cx="12" cy="12" r="3.5" fill="none" stroke="#1a1020" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" stroke="#1a1020" stroke-width="2.4"/>',
    party: '<circle cx="8" cy="8" r="3.5" fill="#e8508a" stroke="#1a1020" stroke-width="2"/><circle cx="16" cy="8" r="3.5" fill="#3fb8a9" stroke="#1a1020" stroke-width="2"/><path d="M2 20c0-3.5 2.6-6 6-6s6 2.5 6 6M10 20c0-3.5 2.6-6 6-6s6 2.5 6 6" fill="none" stroke="#1a1020" stroke-width="2"/>',
    horseshoe: '<path d="M6 4 Q2 14 6 19 Q12 23 18 19 Q22 14 18 4 L15 4 Q18 13 15 16 Q12 18 9 16 Q6 13 9 4Z" fill="#aab" stroke="#1a1020" stroke-width="2"/>',
    search: '<circle cx="10" cy="10" r="6" fill="#9fc7e8" stroke="#1a1020" stroke-width="2.4"/><path d="M15 15 L21 21" stroke="#1a1020" stroke-width="3"/>',
    star: '<path d="M12 2l3 7 7 .6-5.4 4.6 1.8 7L12 17l-6.4 4.2 1.8-7L2 9.6 9 9z" fill="#f2c14e" stroke="#1a1020" stroke-width="2" stroke-linejoin="round"/>',
    corpse: '<path d="M12 2 C9 2 8 5 8 7 C8 9 10 10 10 12 L7 22 L17 22 L14 12 C14 10 16 9 16 7 C16 5 15 2 12 2Z" fill="#e8d8a8" stroke="#1a1020" stroke-width="2"/><path d="M12 13 L12 20 M10 16 L14 16" stroke="#c8a040" stroke-width="1.6"/>',
    flag: '<path d="M5 22 V3 M5 4 H19 L16 8 L19 12 H5" fill="#c8323c" stroke="#1a1020" stroke-width="2" stroke-linejoin="round"/>',
    shield: '<path d="M12 2 L20 5 V11 C20 16 16 20 12 22 C8 20 4 16 4 11 V5Z" fill="#6a8ad0" stroke="#1a1020" stroke-width="2"/>',
    book: '<path d="M4 4 H11 Q12 4 12 6 V21 Q12 19 10 19 H4Z M20 4 H13 Q12 4 12 6 V21 Q12 19 14 19 H20Z" fill="#f6ecd8" stroke="#1a1020" stroke-width="2" stroke-linejoin="round"/>',
    trophy: '<path d="M7 3h10v5a5 5 0 0 1-10 0z M7 5H3c0 3 2 5 4 5 M17 5h4c0 3-2 5-4 5 M12 13v4 M8 21h8 M9 17h6v4H9z" fill="#f2c14e" stroke="#1a1020" stroke-width="2"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2" fill="#8a8a9a" stroke="#1a1020" stroke-width="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#1a1020" stroke-width="2"/>',
    anvil: '<path d="M3 8h14q3 0 4 3h-5v3l3 5H5l3-5v-3H6Q3 11 3 8z" fill="#7a7a8a" stroke="#1a1020" stroke-width="2" stroke-linejoin="round"/><path d="M14 2l5 2" stroke="#f2c14e" stroke-width="2"/>',
    ball: '<circle cx="12" cy="12" r="9" fill="#c8c8d8" stroke="#1a1020" stroke-width="2"/><path d="M4 9 Q12 13 20 9 M4 15 Q12 11 20 15" stroke="#1a1020" stroke-width="1.4" fill="none"/>',
  };
  const icon = (name, size = 20, cls = '') => `<svg class="ico ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.question}</svg>`;

  /* ---------------- Stand sigil (boss intros) ---------------- */
  function sigil(motif, color = '#f2c14e') {
    const m = {
      star: `<path d="M100 30 l18 42 46 4 -35 30 11 45 -40-24 -40 24 11-45 -35-30 46-4z" fill="${color}"/>`,
      clock: `<circle cx="100" cy="100" r="62" fill="none" stroke="${color}" stroke-width="10"/>${[...Array(12)].map((_, i) => `<rect x="97" y="44" width="6" height="14" fill="${color}" transform="rotate(${i * 30} 100 100)"/>`).join('')}<path d="M100 100 L100 58 M100 100 L128 112" stroke="${color}" stroke-width="8" stroke-linecap="round"/>`,
      drops: [...Array(7)].map((_, i) => `<path d="M${40 + i * 20} ${50 + (i % 3) * 30} q-8 14 0 20 q8 -6 0 -20z" fill="${color}"/>`).join(''),
      claw: [0, 1, 2].map(i => `<path d="M${60 + i * 28} 40 Q${50 + i * 28} 100 ${70 + i * 28} 160" stroke="${color}" stroke-width="12" fill="none" stroke-linecap="round"/>`).join(''),
      cross: `<path d="M100 30 V170 M60 70 H140" stroke="${color}" stroke-width="18" stroke-linecap="square"/>`,
      magnet: `<path d="M60 50 V110 A40 40 0 0 0 140 110 V50 H116 V110 A16 16 0 0 1 84 110 V50Z" fill="${color}"/>`,
      bomb: `<circle cx="100" cy="112" r="44" fill="${color}"/><path d="M120 76 Q140 50 160 44" stroke="${color}" stroke-width="8" fill="none"/>`,
      flag: `<rect x="40" y="56" width="120" height="84" fill="none" stroke="${color}" stroke-width="8"/>${[0, 1, 2, 3].map(i => `<rect x="40" y="${64 + i * 20}" width="120" height="8" fill="${color}"/>`).join('')}`,
      sound: `<text x="100" y="120" font-family="Bangers" font-size="70" text-anchor="middle" fill="${color}">ドン</text>`,
      grid: [...Array(5)].map((_, i) => `<path d="M${40 + i * 30} 40 V160 M40 ${40 + i * 30} H160" stroke="${color}" stroke-width="5"/>`).join(''),
      ball: `<circle cx="100" cy="100" r="50" fill="none" stroke="${color}" stroke-width="10"/>${[...Array(10)].map((_, i) => `<circle cx="${100 + Math.cos(i * 0.628) * 50}" cy="${100 + Math.sin(i * 0.628) * 50}" r="8" fill="${color}"/>`).join('')}`,
      balloon: `<ellipse cx="100" cy="86" rx="40" ry="50" fill="${color}"/><path d="M100 136 Q90 160 104 176" stroke="${color}" stroke-width="5" fill="none"/>`,
      hook: `<path d="M100 30 V120 Q100 160 70 150 Q50 140 60 120" stroke="${color}" stroke-width="12" fill="none" stroke-linecap="round"/>`,
      heart: `<path d="M100 150 C60 120 40 96 40 76 A30 30 0 0 1 100 64 A30 30 0 0 1 160 76 C160 96 140 120 100 150Z" fill="${color}"/>`,
      spiral: `<path d="M100 100 m0 0 a8 8 0 0 1 16 0 a16 16 0 0 1 -32 0 a24 24 0 0 1 48 0 a32 32 0 0 1 -64 0 a40 40 0 0 1 80 0 a48 48 0 0 1 -96 0" fill="none" stroke="${color}" stroke-width="7"/>`,
    };
    return `<svg class="sigil" viewBox="0 0 200 200" aria-hidden="true">${m[motif] || m.star}</svg>`;
  }

  /* ---------------- US route map ---------------- */
  const ROUTE = [
    { name: 'San Diego', x: 90, y: 300 }, { name: 'Arizona Desert', x: 190, y: 290 }, { name: 'Monument Valley', x: 250, y: 230 },
    { name: 'Rocky Mountains', x: 330, y: 200 }, { name: 'Kansas City', x: 520, y: 230 }, { name: 'Mississippi', x: 590, y: 210 },
    { name: 'Lake Michigan', x: 650, y: 150 }, { name: 'Philadelphia', x: 800, y: 185 }, { name: 'New York', x: 830, y: 160 },
  ];
  function usMap(progress) {
    const usa = 'M60 120 L150 90 L300 80 L460 90 L600 80 L700 60 L770 70 L760 110 L830 120 L860 150 L840 200 L800 250 L760 310 L720 330 L700 380 L660 350 L560 360 L480 400 L420 360 L330 340 L260 330 L150 320 L80 300 L60 240Z';
    const pts = ROUTE.map(p => `${p.x},${p.y}`).join(' ');
    const done = ROUTE.slice(0, Math.max(1, progress + 1)).map(p => `${p.x},${p.y}`).join(' ');
    return `<svg class="usmap" viewBox="0 0 900 420" xmlns="http://www.w3.org/2000/svg">
      <defs><pattern id="mapht" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.4" fill="#1a1020" opacity=".12"/></pattern></defs>
      <path d="${usa}" fill="#f0dcae" stroke="#1a1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="${usa}" fill="url(#mapht)"/>
      <path d="M640 110 Q660 90 680 120 Q670 150 650 140Z" fill="#9fc7e8" stroke="#1a1020" stroke-width="2"/>
      <path d="M580 120 Q590 220 560 330" stroke="#6aa0c8" stroke-width="4" fill="none"/>
      <polyline points="${pts}" fill="none" stroke="#1a1020" stroke-width="3" stroke-dasharray="8 8" opacity=".5"/>
      <polyline class="route-done" points="${done}" fill="none" stroke="#e8508a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      ${ROUTE.map((p, i) => `<g class="map-node ${i <= progress ? 'done' : ''} ${i === progress ? 'current' : ''}"><circle cx="${p.x}" cy="${p.y}" r="${i === progress ? 11 : 8}" fill="${i <= progress ? '#f2c14e' : '#f6ecd8'}" stroke="#1a1020" stroke-width="3"/><text x="${p.x}" y="${p.y + (i % 2 ? 28 : -18)}" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="15" fill="#1a1020" stroke="#f6ecd8" stroke-width="4" paint-order="stroke">${p.name}</text></g>`).join('')}
    </svg>`;
  }

  return { addPortrait, portrait, creature, horse, scene, icon, sigil, usMap, SCENES, P, INK };
})();
