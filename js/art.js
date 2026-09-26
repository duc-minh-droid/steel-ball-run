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
    // the named cast: shapes follow the SBR manga / anime designs (JoJo Wiki appearance notes); `special` adds per-character layers
    johnny:    { skin: '#f6d2b0', hair: '#f4d35e', hairStyle: 'johnny', hat: 'johnny', hatColor: '#4a2e78', hat2: '#f2c14e', outfit: '#3b5bb5', outfit2: '#f6ecd8', eye: '#4aa3df', lip: '#d9607a', bg: ['#6b5bd6', '#e8508a'], special: 'johnny' },
    gyro:      { skin: '#f0c8a0', hair: '#f2e27a', hairStyle: 'gyro', hat: 'gyro', hatColor: '#c8b070', hat2: '#3fb8a9', outfit: '#5a3a78', outfit2: '#3fb8a9', eye: '#6fbf5a', lip: '#c8506a', bg: ['#3fb8a9', '#f2c14e'], mouth: 'zeppeli', facial: 'jawsquares', special: 'gyro' },
    diego:     { skin: '#f6d8b8', hair: '#f8e08a', hairStyle: 'diego', hat: 'dio', hatColor: '#3fb8c8', hat2: '#f2c14e', outfit: '#5ac8d8', outfit2: '#2a7a8a', eye: '#3fb8a9', lip: '#b8507a', bg: ['#2a7a8a', '#8adf6a'], eyes: 'sharp', brows: 'thick', style: 'turtleneck', special: 'diego' },
    diegodino: { skin: '#8ab86a', hair: '#f8e08a', hairStyle: 'diego', hat: 'dio', hatColor: '#2a5a3a', hat2: '#c8e04a', outfit: '#3a6a3a', outfit2: '#8adf6a', eye: '#f2c14e', lip: '#5a3a2a', bg: ['#2a5a3a', '#c8e04a'], eyes: 'sharp', brows: 'angry', mouth: 'teeth', style: 'turtleneck', extra: 'scales', special: ['diego', 'dino'] },
    diegoworld:{ skin: '#f6d8b8', hair: '#ffd84a', hairStyle: 'diego', hat: 'dio', hatColor: '#e8b020', hat2: '#e8508a', outfit: '#3a2a10', outfit2: '#ffd84a', eye: '#e8508a', lip: '#a0306a', bg: ['#f2c14e', '#6a2a8a'], eyes: 'sharp', brows: 'thick', style: 'turtleneck', extra: 'heart', special: 'diego' },
    valentine: { skin: '#f6d8c0', hair: '#f8e8a0', hairStyle: 'valentine', hat: null, outfit: '#e87aa8', outfit2: '#6a3a9a', eye: '#4a6ad0', lip: '#c05a6a', bg: ['#1f2a6a', '#c8323c'], face: 'square', special: 'valentine' },
    mountaintim:{ skin: '#e8b890', hair: '#f2d27a', hairStyle: 'mullet', hat: 'zebra', hatColor: '#f6f2e4', hat2: '#1a1020', outfit: '#9a9aa8', outfit2: '#6a6a7a', eye: '#4a8ad0', lip: '#a0505a', bg: ['#e8742a', '#f6c27a'], special: 'tim' },
    hotpants:  { skin: '#f6d0c0', hair: '#f08ab8', hairStyle: 'hotpants', hat: 'furspike', hatColor: '#f6ecd8', hat2: '#d8b040', outfit: '#e8508a', outfit2: '#f6ecd8', eye: '#8a4a9a', lip: '#e0407a', bg: ['#e8508a', '#6b5bd6'], eyes: 'lashes', special: 'hotpants' },
    pocoloco:  { skin: '#8a5a3a', hair: '#1a1020', hairStyle: 'short', hat: 'pocohelm', hatColor: '#f2c14e', hat2: '#e8742a', outfit: '#e8742a', outfit2: '#e8d8b0', eye: '#1a1020', lip: '#6a3a2a', bg: ['#f2c14e', '#3fb8a9'], facial: 'horseshoe', mouth: 'teeth', special: 'poco' },
    wekapipo:  { skin: '#e8c0a0', hair: '#f2d27a', hairStyle: 'grid', hat: null, outfit: '#f2c14e', outfit2: '#f6ecd8', eye: '#6a4a2a', lip: '#a0506a', bg: ['#2a3a6a', '#9fc7e8'], facial: 'mustache', brows: 'thick', eyes: 'narrow', special: 'weka' },
    lucy:      { skin: '#fbe0cc', hair: '#f8e090', hairStyle: 'lucy', hat: null, outfit: '#f09ac0', outfit2: '#fff', eye: '#5a8ad0', lip: '#e0708a', bg: ['#f09ac0', '#fff3c0'], eyes: 'round', special: 'lucy' },
    sandman:   { skin: '#b87a50', hair: '#e8d8a8', hairStyle: 'sandman', hat: null, outfit: '#2a2a3a', outfit2: '#e8c070', eye: '#2a1a10', lip: '#3a8c4a', bg: ['#d9713a', '#5b3a8c'], eyes: 'sharp', special: 'sandman' },
    ringo:     { skin: '#d8a880', hair: '#f2f0ea', hairStyle: 'ringo', hat: null, outfit: '#f0ece0', outfit2: '#9a9ab0', eye: '#8ac8e8', lip: '#a0505a', bg: ['#5a3a2a', '#e8c070'], eyes: 'narrow', facial: 'ringo', special: 'ringo' },
    blackmore: { skin: '#ecdcd4', hair: '#f2d27a', hairStyle: 'bmfringe', hat: 'bmhood', hatColor: '#1f2a5a', hat2: '#f2c14e', outfit: '#1f2a5a', outfit2: '#b8b8c8', eye: '#2a4ab0', lip: '#8a5a7a', bg: ['#2a3a5a', '#9fc7e8'], brows: 'worried', extra: 'rain', special: 'blackmore' },
    robinson:  { skin: '#e0b890', hair: '#c8b8e0', hairStyle: 'robinson', hat: 'robincap', hatColor: '#2a1a3a', hat2: '#f2c14e', outfit: '#6a3a8a', outfit2: '#f2c14e', eye: '#6a4a2a', lip: '#3a1a3a', bg: ['#6a8a3a', '#e8b36a'], brows: 'angry', extra: 'bugs', special: 'robinson' },
    ferdinand: { skin: '#f0d0b8', hair: '#f2e08a', hairStyle: 'ferdinand', hat: 'hood', hatColor: '#d8c8a0', hat2: '#a0c040', outfit: '#d8c8a0', outfit2: '#b8203a', eye: '#1a1020', lip: '#e8708a', bg: ['#3a6a3a', '#c8e04a'], eyes: 'lashes', special: 'ferdinand' },
    oyecomova: { skin: '#f2e4dc', hair: '#6a3a2a', hairStyle: 'oyedreads', hat: 'biker', hatColor: '#8a1a2a', hat2: '#c8ccd8', outfit: '#8a1a3a', outfit2: '#f2c14e', eye: '#1a1020', lip: '#6a2a3a', bg: ['#c8323c', '#1a1020'], extra: 'pins', special: 'oyecomova' },
    porkpie:   { skin: '#f0c8a8', hair: '#6a4a3a', hairStyle: 'bald', hat: 'porkpie', hatColor: '#3a6a3a', hat2: '#f2c14e', outfit: '#2a5a3a', outfit2: '#a0d060', eye: '#1a1020', lip: '#c05a6a', bg: ['#8a6aa0', '#f6c27a'], face: 'square', eyes: 'void', mouth: 'wide', extra: 'hook', special: 'porkpie' },
    stroheim:  { skin: '#f0d0b0', hair: '#d8c8a0', hairStyle: 'slicked', hat: 'peaked', hatColor: '#6a7050', hat2: '#1a1020', outfit: '#6a7050', outfit2: '#c0a040', eye: '#3a6a9a', lip: '#9a5a5a', bg: ['#5a5a40', '#e8e0c0'], mouth: 'shout', brows: 'angry', style: 'military', special: 'stroheim' },
    benjamin:  { skin: '#f0dcd0', hair: '#f2d27a', hairStyle: 'bowl', hat: null, outfit: '#7a8a7a', outfit2: '#6a7a6a', eye: '#a08060', lip: '#8a5a5a', bg: ['#5a4a6a', '#c8a080'], brows: 'none', facial: 'stubble', special: ['boom', 'target', 'benjamin'] },
    andre:     { skin: '#d8a070', hair: '#1a1020', hairStyle: 'mullet', hat: 'dotcap', hatColor: '#7a8a7a', hat2: '#3a6ad0', outfit: '#7a8a7a', outfit2: '#6a5a2a', eye: '#5a3a1a', lip: '#8a5a5a', bg: ['#4a3a5a', '#9a8aba'], special: ['boom', 'andre', 'target'] },
    laboomboom:{ skin: '#f6d8c8', hair: '#d8702a', hairStyle: 'labb', hat: 'goggletop', hatColor: '#c8ccd8', hat2: '#3a3a8a', outfit: '#7a8a7a', outfit2: '#6a7a6a', eye: '#6a4a2a', lip: '#8a1a2a', bg: ['#3a5a8a', '#f6c27a'], brows: 'none', eyes: 'lashes', special: ['boom', 'target'] },
    axl:       { skin: '#e8d0c0', hair: '#b890b0', hairStyle: 'short', hat: 'nethelm', hatColor: '#6a5a3a', hat2: '#5a6a3a', outfit: '#b0a070', outfit2: '#e8c040', eye: '#c8323c', lip: '#5a2a3a', bg: ['#3a1a2a', '#8a1a2a'], special: 'axl' },
    mikeo:     { skin: '#8a5a3a', hair: '#1a1020', hairStyle: 'mikeo', hat: null, outfit: '#2a4a9a', outfit2: '#9aa0e0', eye: '#c8307a', lip: '#6a3a3a', bg: ['#e8508a', '#9fc7e8'], extra: 'balloon', special: 'mikeo' },
    magent:    { skin: '#f0dcd8', hair: '#1a1020', hairStyle: 'magent', hat: 'bolero', hatColor: '#6a2a7a', hat2: '#c8408a', outfit: '#6a2a7a', outfit2: '#c8a0e0', eye: '#b8a0e0', lip: '#e070a0', bg: ['#9fc7e8', '#e8e0c0'], eyes: 'sleepy', mouth: 'teeth', special: 'magent' },
    disco:     { skin: '#f0d0b8', hair: '#5a3a20', hairStyle: 'disco', hat: 'hairclip', hatColor: '#f2c14e', hat2: '#c89020', outfit: '#2a4ab0', outfit2: '#1a1020', eye: '#3fc8d8', lip: '#9a5a5a', bg: ['#e8742a', '#3a2a1a'], facial: 'stubbybeard', special: 'disco' },
    sugar:     { skin: '#fbe8dc', hair: '#1a1020', hairStyle: 'hime', hat: 'bonnet', hatColor: '#b8a0e0', hat2: '#8a6ac0', outfit: '#1a1020', outfit2: '#b8a0e0', eye: '#e8b020', lip: '#a080c8', bg: ['#8adf6a', '#f2c14e'], eyes: 'round', special: 'sugar' },
    steven:    { skin: '#f0c8a8', hair: '#e8c860', hairStyle: 'bald', hat: 'serrated', hatColor: '#e8c860', hat2: '#c8a040', outfit: '#3a7a4a', outfit2: '#2a5a3a', eye: '#7a8a3a', lip: '#a05a5a', bg: ['#c8323c', '#f2c14e'], face: 'long', facial: 'mustache', special: 'steven' },
    marco:     { skin: '#f6d8c0', hair: '#1a1020', hairStyle: 'marco', hat: null, outfit: '#e8d8b0', outfit2: '#f6ecd8', eye: '#1a1020', lip: '#e09090', bg: ['#8a8a7a', '#e8e0c0'], face: 'round', eyes: 'round', special: 'marco' },
    // generic mobs
    bandit:    { skin: '#d8a880', hair: '#3a2a1a', hairStyle: 'short', hat: 'cowboy', hatColor: '#6a4a2a', hat2: '#c8323c', outfit: '#7a5a3a', outfit2: '#c8323c', eye: '#1a1020', lip: '#8a4a3a', bg: ['#c8323c', '#e8b36a'], extra: 'mask', eyes: 'glare', brows: 'angry' },
    agent:     { skin: '#e8c8b0', hair: '#1a1020', hairStyle: 'short', hat: 'bowler', hatColor: '#1a1a1a', hat2: '#555', outfit: '#1a1a2a', outfit2: '#f6ecd8', eye: '#1a1020', lip: '#8a5a5a', bg: ['#1f2a6a', '#8a8aa0'], extra: 'shades', special: 'agent' },
    soldier:   { skin: '#e0b898', hair: '#3a2a1a', hairStyle: 'short', hat: 'kepi', hatColor: '#2a3a6a', hat2: '#f2c14e', outfit: '#2a3a6a', outfit2: '#f2c14e', eye: '#1a1020', lip: '#8a5a5a', bg: ['#2a3a6a', '#c8c8d8'], style: 'military', brows: 'thick' },
    gunslinger:{ skin: '#d8a880', hair: '#5a3a1a', hairStyle: 'long', hat: 'cowboy', hatColor: '#2a2a2a', hat2: '#c8a070', outfit: '#3a2a2a', outfit2: '#c8a070', eye: '#1a1020', lip: '#8a4a3a', bg: ['#3a2a2a', '#e8c070'], extra: 'mustache', style: 'duster', eyes: 'narrow' },
    thug:      { skin: '#e0b090', hair: '#1a1020', hairStyle: 'bald', hat: 'bowler', hatColor: '#4a2a1a', hat2: '#aaa', outfit: '#5a3a2a', outfit2: '#aaa', eye: '#1a1020', lip: '#8a4a3a', bg: ['#5a3a2a', '#d0a070'], extra: 'scar' },
    tattoo:    { skin: '#e0c0a0', hair: '#2a2a2a', hairStyle: 'bald', hat: null, outfit: '#1a1a1a', outfit2: '#c8323c', eye: '#c8323c', lip: '#5a3a3a', bg: ['#1a1a1a', '#c8323c'], extra: 'tattoo' },
    parallel:  { skin: '#c8c0e8', hair: '#f8e8a0', hairStyle: 'valentine', hat: null, outfit: '#3a3a8a', outfit2: '#c8c8f0', eye: '#e8e8ff', lip: '#6a5a9a', bg: ['#3a3a8a', '#c8c8f0'], face: 'square', special: 'valentine' },
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
    pompadour: c => `<path d="M30 50 Q28 28 38 20 Q50 10 64 13 Q74 18 72 50 L70 56 L30 56Z" fill="${c}"/>`,
    braids: c => `<path d="M28 46 Q28 22 50 20 Q72 22 72 46 L72 60 L28 60Z" fill="${c}"/>`,
    mohawk: c => `<path d="M43 31 L37 8 L45 15 L50 2 L55 15 L63 8 L57 31Z" fill="${c}"/>`,
    flowing: c => `<path d="M28 44 Q24 18 52 16 Q80 20 76 46 Q80 66 94 84 Q82 86 76 80 Q80 96 90 110 Q70 106 66 88 L34 88 Q30 100 16 106 Q24 94 24 78 Q20 62 28 44Z" fill="${c}"/>`,
    ponytail: c => `<path d="M66 28 Q88 30 86 58 Q84 76 92 92 Q76 88 74 66 Q74 46 64 38Z" fill="${c}"/><path d="M30 46 Q30 22 50 21 Q70 22 70 46 L70 52 L30 52Z" fill="${c}"/><circle cx="70" cy="33" r="3.4" fill="#c8323c"/>`,
    slicked: c => `<path d="M30 48 Q29 22 50 21 Q71 22 70 48 L70 54 L30 54Z" fill="${c}"/>`,
    dreads: c => `<path d="M28 46 Q28 22 50 20 Q72 22 72 46Z" fill="${c}"/>${[25, 30, 70, 75].map(x => `<path d="M${x} 40 Q${x - 2} 70 ${x} 100" fill="none" stroke-width="6.4" stroke-linecap="round"/><path d="M${x} 40 Q${x - 2} 70 ${x} 100" fill="none" stroke="${c}" stroke-width="3.8" stroke-linecap="round"/>`).join('')}`,
    gyrostyle: c => `<path d="M26 44 Q24 22 50 18 Q76 22 74 44 L76 84 Q70 88 66 80 L66 62 L34 62 L34 80 Q30 88 24 84Z" fill="${c}"/>`,
    topknot: c => `<circle cx="50" cy="14" r="7.5" fill="${c}"/><path d="M30 46 Q30 23 50 22 Q70 23 70 46 L70 50 L30 50Z" fill="${c}"/><rect x="45.5" y="19" width="9" height="3.4" fill="#c8323c" stroke-width="1.2"/>`,
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
    bowl: c => `<path d="M30 48 Q30 28 50 27 Q70 28 70 48 Z" fill="${c}"/><path d="M36 47 L37 36 M42 47.4 L42.6 33 M48 47.6 V31 M54 47.4 L53.6 32 M60 47.2 L59.4 34 M65 46.6 L64 37" fill="none" stroke-width=".7" opacity=".5"/>`,
    pompadour: c => `<path d="M31 46 Q29 30 37 22 Q45 10 62 11 Q74 13 72 22 Q64 17 55 21 Q67 25 69 42 Q60 31 48 33 Q39 35 31 46Z" fill="${c}"/><path d="M39 25 Q49 15 63 15 M40 31 Q50 22 63 24" fill="none" stroke-width=".8" opacity=".5"/>`,
    braids: c => `<path d="M32 42 Q34 27 50 26 Q66 27 68 42 Q60 32 51 33 L50 27 L49 33 Q40 32 32 42Z" fill="${c}"/>${MIR(`${[64, 71, 78, 85, 92].map(y => `<ellipse cx="28" cy="${y}" rx="4.2" ry="4.4" fill="${c}" stroke-width="1.6"/>`).join('')}<rect x="25" y="96" width="6" height="3.4" fill="#c8323c" stroke-width="1.2"/><path d="M26 99.4 L25 105 M28 99.4 V106 M30 99.4 L31 105" stroke-width="1.2"/>`)}`,
    mohawk: c => `<path d="M44 31 Q50 26 56 31 L55 36 Q50 33 45 36Z" fill="${c}"/><path d="M42 12 L44 26 M50 6 V26 M58 12 L56 26" fill="none" stroke-width=".8" opacity=".5"/>`,
    flowing: c => `<path d="M30 46 Q30 26 50 24 Q72 24 72 44 Q64 31 52 33 Q59 38 61 45 Q49 36 40 38 Q34 40 30 46Z" fill="${c}"/>`,
    ponytail: c => `<path d="M31 44 Q32 27 50 26 Q68 27 69 44 Q63 33 52 32 Q42 32 36 38 Q33 40 31 44Z" fill="${c}"/>`,
    slicked: c => `<path d="M31 42 Q31 26 50 25 Q69 26 69 42 Q62 30.6 50 30.4 Q38 30.6 31 42Z" fill="${c}"/><path d="M36 36 Q46 27 62 30 M40 30 Q50 26 60 27" fill="none" stroke-width=".8" opacity=".5"/>`,
    dreads: c => `<path d="M32 42 Q34 26 50 25 Q66 26 68 42 L64 40 L62 46 L58 38 L54 44 L50 36 L46 44 L42 38 L38 46 L36 40Z" fill="${c}"/>`,
    gyrostyle: c => `<path d="M30 48 Q30 26 50 24 Q70 26 70 48 L66 41 Q61 31 51 30 L50 37 L49 30 Q39 31 34 41Z" fill="${c}"/>`,
    topknot: c => `<path d="M31 44 Q31 27 50 26 Q69 27 69 44 Q62 31 50 31 Q38 31 31 44Z" fill="${c}"/>`,
  };
  const hats = {
    // Johnny's knit cap: printed with small stars, hair poking out of two holes like horns, a horseshoe framing a rearing horse's head
    johnny: (c, c2, p) => {
      const h = p && p.hair || c2;
      const ribs = [...Array(15)].map((_, i) => { const t = (i + 0.5) / 15, x = 25.8 + 48.4 * t, y = 45 - 12.8 * t * (1 - t); return `M${f2(x)} ${f2(y + 0.6)}v4.4`; }).join('');
      return `<path d="M26.6 45 Q25 17 50 14.6 Q75 17 73.4 45 Q50 39.4 26.6 45Z" fill="${c}"/>
        <path d="${[[33.4, 35.6], [38.2, 27.2], [61.8, 27.2], [66.6, 35.6], [44.6, 20.4], [55.4, 20.4], [30.4, 42], [69.6, 42], [39.4, 37.4], [60.6, 37.4]].map(([x, y]) => starD(x, y, 2.5)).join('')}" fill="${c2}" stroke-width=".8"/>
        <path d="M25.8 45 Q50 38.6 74.2 45 L74.6 50.4 Q50 44 25.4 50.4Z" fill="${shade(c)}"/><path d="${ribs}" stroke-width=".7" opacity=".55"/>
        ${MIR(`<ellipse cx="39.6" cy="19.8" rx="2.9" ry="1.8" fill="${INK}" transform="rotate(-32 39.6 19.8)"/><path d="M41 20.6 Q33 16.2 30.2 5.4 Q35.6 10.4 38.8 9.6 Q38.2 14.6 43.4 18.2Z" fill="${h}" stroke-width="1.6"/><path d="M38.4 16.2 Q34.8 12.8 33.4 9.2" fill="none" stroke-width=".7" opacity=".6"/>`)}
        <path d="M44.4 41.6 Q42.4 30 45.8 26.4 Q50 22.2 54.2 26.4 Q57.6 30 55.6 41.6" fill="none" stroke-width="4.8" stroke-linecap="round"/>
        <path d="M44.4 41.6 Q42.4 30 45.8 26.4 Q50 22.2 54.2 26.4 Q57.6 30 55.6 41.6" fill="none" stroke="#d8dce8" stroke-width="2.8" stroke-linecap="round"/>
        <path d="${dotD([[44.3, 38], [44.1, 33.2], [46, 28], [54, 28], [55.9, 33.2], [55.7, 38]])}" stroke-width="1.1" stroke-linecap="round"/>
        <path d="M47.4 41 L47.8 35.6 Q47.2 32.8 48.6 30.8 L49.8 28.4 L50.8 30 Q53.6 30.6 54 33.4 L52.8 34.2 Q51.8 33 50.8 33.8 L52 41Z" fill="${INK}" stroke="none"/>
        <path d="M33 30 Q36 21 45 17" fill="none" stroke="#fff" stroke-width="1.6" opacity=".3" stroke-linecap="round"/>`;
    },
    // Gyro's wide hat: slits cut through the brim, slit goggles on the crown
    gyro: (c, c2) => `<path d="M33.4 38.6 L35.6 13.4 Q50 9.8 64.4 13.4 L66.6 38.6Z" fill="${c}"/><path d="M40 12 Q50 16.4 60 12" fill="none" stroke-width="1.2"/>
      <path d="M34.4 30.6 Q50 33 65.6 30.6 L66.2 37.4 Q50 40 33.8 37.4Z" fill="${shade(c)}"/>
      ${MIR(`<path d="M37.4 17.6 H47.2 Q48.6 17.6 48.6 19 V25.4 Q48.6 26.8 47.2 26.8 H37.4 Q36 26.8 36 25.4 V19 Q36 17.6 37.4 17.6Z" fill="${c2}" stroke-width="1.6"/><path d="M38 20.2 H46.6 M38 22.4 H46.6 M38 24.6 H46.6" stroke-width="1.1"/><path d="M36 22 L34.6 22.4" stroke-width="1.6"/>`)}
      <path d="M48.6 22 H51.4" stroke-width="1.6"/><path d="M38.6 18.8 l2.6 -.2" stroke="#fff" stroke-width=".8" opacity=".7"/>
      <path d="M5.6 41 Q20 31.6 36 36.4 Q50 39.8 64 36.4 Q80 31.6 94.4 41 Q84 50 50 45.8 Q16 50 5.6 41Z" fill="${c}"/>
      <path d="M11.4 42 l3.2 -1 M18.6 40.6 l3.4 -.5 M25.8 40.4 h3.4 M70.8 40.4 h3.4 M78 40.1 l3.4 .5 M85.4 41 l3.2 1 M38.4 43.4 h3 M45.2 43.9 h3 M51.8 43.9 h3 M58.6 43.4 h3" stroke-width="1.9" stroke-linecap="round"/>
      <path d="M12 39.4 Q24 34.6 34 37.6" fill="none" stroke="#fff" stroke-width="1.2" opacity=".35"/>`,
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
    // wider-brimmed and town hats
    stetson: (c, c2) => `<path d="M31 38 Q28 8 42 8 Q50 14 58 8 Q72 8 69 38 Z" fill="${c}"/><path d="M44 12 Q50 20 56 12" fill="none" stroke="${INK}" stroke-width="1.6"/><path d="M4 38 Q16 26 30 34 Q50 42 70 34 Q84 26 96 38 Q74 52 50 47 Q26 52 4 38Z" fill="${c}"/><path d="M31 33 Q50 38 69 33 L69 37 Q50 42 31 37Z" fill="${c2}"/><circle cx="36" cy="35" r="2" fill="#d0d4e0" stroke="${INK}" stroke-width=".8"/>`,
    sombrero: (c, c2) => `<path d="M36 36 Q36 6 50 6 Q64 6 64 36 Z" fill="${c}"/><path d="M0 40 Q10 28 30 34 Q50 40 70 34 Q90 28 100 40 Q80 54 50 50 Q20 54 0 40Z" fill="${c}"/><path d="M36 30 Q50 34 64 30 L64 35 Q50 39 36 35Z" fill="${c2}"/><path d="M8 42 Q50 56 92 42" fill="none" stroke="${c2}" stroke-width="2" stroke-dasharray="3 3"/>`,
    newsboy: (c, c2) => `<path d="M26 42 Q20 18 50 16 Q82 18 76 40 Q66 34 50 36 Q34 36 26 42Z" fill="${c}"/><path d="M50 16 L46 38 M50 16 L62 36 M50 16 L34 38" stroke="${INK}" stroke-width="1" opacity=".5"/><path d="M34 40 Q50 34 66 40 L64 46 Q50 42 36 46Z" fill="${c2}"/><circle cx="50" cy="16" r="2.4" fill="${c}" stroke="${INK}" stroke-width="1"/>`,
    beret: (c, c2) => `<path d="M24 40 Q18 22 48 18 Q80 16 78 34 Q70 42 50 38 Q34 38 24 40Z" fill="${c}"/><path d="M28 38 Q50 32 72 36" fill="none" stroke="${c2}" stroke-width="2.4"/><path d="M50 18 l2 -6" stroke="${INK}" stroke-width="2"/>`,
    bonnet: (c, c2) => `<path d="M22 60 Q16 22 50 16 Q84 22 78 60 L70 58 Q72 32 50 30 Q28 32 30 58Z" fill="${c}"/><path d="M28 34 Q50 24 72 34" fill="none" stroke="${c2}" stroke-width="2"/><path d="M30 58 Q34 76 42 84 M70 58 Q66 76 58 84" fill="none" stroke="${c2}" stroke-width="2.4"/><path d="M58 84 l8 6 -6 2Z M42 84 l-8 6 6 2Z" fill="${c2}"/>`,
    // creator hats
    fedora: (c, c2) => `<path d="M31 37 Q30 16 42 15 Q50 20 58 15 Q70 16 69 37Z" fill="${c}"/><path d="M44 17 Q50 23 56 17" fill="none" stroke-width="1.4"/><path d="M14 39 Q30 32 50 36 Q70 32 86 39 Q70 46 50 43 Q30 46 14 39Z" fill="${c}"/><path d="M31 31.6 Q50 35.6 69 31.6 L69 36.4 Q50 40.4 31 36.4Z" fill="${c2}"/><path d="M62 33.4 l3 -6 1 6.6" fill="${c2}" stroke-width="1"/>`,
    gaucho: (c, c2) => `<path d="M30 40 Q32 64 38 78" fill="none" stroke-width="1"/><path d="M33 36 L35 19 L65 19 L67 36Z" fill="${c}"/><path d="M8 38 Q50 29 92 38 Q50 47 8 38Z" fill="${c}"/><path d="M33.8 30 L66.2 30 L66.8 35 L33.2 35Z" fill="${c2}"/><circle cx="37" cy="32.5" r="1.6" fill="#d0d4e0" stroke-width=".8"/>`,
    straw: (c, c2) => `<path d="M32 36 Q32 17 50 16 Q68 17 68 36Z" fill="${c}"/><path d="M4 40 Q20 30 50 35 Q80 30 96 40 Q76 51 50 46 Q24 51 4 40Z" fill="${c}"/><path d="M32.4 30.6 Q50 34 67.6 30.6 L67.8 35.4 Q50 39 32.2 35.4Z" fill="${c2}"/><g fill="none" stroke-width=".6" opacity=".45"><path d="M36 22 Q50 19 64 22 M34 27 Q50 24 66 27 M12 41 Q50 50 88 41 M20 44 Q50 52 80 44"/></g><path d="M8 42 l-3 3 M14 44 l-2 4 M88 43 l3 3 M82 45 l2 4" stroke-width="1"/>`,
    coonskin: (c, c2) => `<path d="M68 34 Q84 44 82 78 Q77 82 73 78 Q75 52 64 40Z" fill="${c}"/><path d="M76 50 l7 -2 M75 60 l8 -1 M74.6 70 l8 0" stroke="${c2}" stroke-width="3"/><path d="M28 42 Q26 16 50 15 Q74 16 72 42 Q50 36 28 42Z" fill="${c}"/><path d="M34 24 l2 3 M42 19 l1 3.4 M52 18 l0 3.4 M61 20 l-1 3.4 M67 26 l-2 3" fill="none" stroke-width="1"/>`,
    turban: (c, c2) => `<path d="M26 44 Q18 22 50 13 Q82 22 74 44 Q50 36 26 44Z" fill="${c}"/><path d="M28 36 Q46 22 72 30 M27 41 Q50 30 73 38 M32 26 Q48 18 66 22" fill="none" stroke-width="1" opacity=".7"/><path d="M50 36 Q60 12 58 4 Q66 14 54 36Z" fill="#f6ecd8" stroke-width="1.2"/><path d="M50 27 l3 3.6 -3 3.6 -3 -3.6z" fill="${c2}" stroke-width="1.2"/>`,
    hood: (c, c2) => `<path d="M20 110 L22 52 Q20 14 50 12 Q80 14 78 52 L80 110 L68 110 L70 56 Q69 35 50 33 Q31 35 30 56 L32 110Z" fill="${c}"/><path d="M30 56 Q31 35 50 33 Q69 35 70 56" fill="none" stroke="${c2}" stroke-width="2"/><path d="M50 12 Q46 24 50 33" fill="none" stroke-width="1" opacity=".5"/>`,
    cavalier: (c, c2) => `<path d="M30 38 Q30 16 50 15 Q70 16 70 38Z" fill="${c}"/><path d="M10 42 Q24 34 50 38 Q72 34 80 22 Q90 34 88 42 Q66 50 50 46 Q28 50 10 42Z" fill="${c}"/><path d="M30.6 32.6 Q50 37 69.6 32.6 L69.8 37.4 Q50 41.6 30.4 37.4Z" fill="${c2}"/><path d="M34 34 Q18 20 22 4 Q30 16 40 32Z" fill="${c2}" stroke-width="1.4"/><path d="M24 8 Q28 20 38 32" fill="none" stroke-width="1"/>`,
  };
  /* accessories: a list on each config (`deco: ['bib:7', 'collar']`), drawn in three layers.
     body = over the clothes, face = over the face, behind = behind the head. Unknown names are ignored. */
  const decoParts = {
    bib: (p, n = '') => ({ body: `<g><path d="M33 94 L28 88 M67 94 L72 88" stroke="${INK}" stroke-width="1.2"/><path d="M33 94 L67 94 L66 118 L34 118Z" fill="#f6f2e4" stroke="${INK}" stroke-width="1.8"/><path d="M34 99 H66" stroke="#c8323c" stroke-width="2.4"/><text x="50" y="98" text-anchor="middle" font-family="Oswald,sans-serif" font-weight="700" font-size="3" fill="${INK}">STEEL BALL RUN</text><text x="50" y="114" text-anchor="middle" font-family="Oswald,'Arial Narrow',sans-serif" font-weight="700" font-size="${String(n).length > 2 ? 11 : 14}" fill="${INK}">${n}</text><circle cx="36" cy="97" r="1" fill="#c8c8d8" stroke="${INK}" stroke-width=".5"/><circle cx="64" cy="97" r="1" fill="#c8c8d8" stroke="${INK}" stroke-width=".5"/><path d="M40 104 q-2 6 0 12 M60 104 q2 6 0 12" stroke="${INK}" stroke-width=".5" opacity=".35" fill="none"/></g>` }),
    collar: (p, c) => ({ body: `<path d="M41 84 L37 96 L48 92 Z M59 84 L63 96 L52 92 Z" fill="${c || '#f6f2e4'}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>` }),
    necklace: (p, kind = 'cross') => {
      const chain = `<path d="M42 82 Q44 94 50 97 Q56 94 58 82" fill="none" stroke="#c0a040" stroke-width="1" stroke-dasharray="1.2 .8"/>`;
      const pend = kind === 'cross' ? `<path d="M50 96 V108 M45.5 100 H54.5" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/><path d="M50 96 V108 M45.5 100 H54.5" stroke="#f2c14e" stroke-width="1.8" stroke-linecap="round"/>`
        : kind === 'beads' ? [[43, 88], [45, 92], [48, 95], [52, 95], [55, 92], [57, 88]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${['#3fb8a9', '#c8323c', '#f2c14e'][i % 3]}" stroke="${INK}" stroke-width=".6"/>`).join('') + `<path d="M50 97 l-3 8 3 3 3-3z" fill="#f6ecd8" stroke="${INK}" stroke-width="1"/>`
        : `<circle cx="50" cy="100" r="3.4" fill="#3fb8a9" stroke="${INK}" stroke-width="1.2"/><circle cx="49" cy="99" r="1" fill="#fff" opacity=".8"/>`;
      return { body: chain + pend };
    },
    badge: () => ({ body: `<g transform="translate(29 104)"><path d="M0 -7 l2 4.4 4.8.6 -3.5 3.3 .9 4.8 -4.2-2.4 -4.2 2.4 .9-4.8 -3.5-3.3 4.8-.6z" fill="#f2c14e" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><circle r="1.6" fill="none" stroke="${INK}" stroke-width=".6"/><ellipse cx="-1.6" cy="-3" rx=".9" ry="1.5" fill="#fff" opacity=".7"/></g>` }),
    medal: () => ({ body: `<g transform="translate(30 100)"><path d="M-3 -4 h6 l-1 6 h-4z" fill="#c8323c" stroke="${INK}" stroke-width=".8"/><path d="M-1 -4 v6" stroke="#f6ecd8" stroke-width=".8"/><circle cy="5" r="3.2" fill="#c0a040" stroke="${INK}" stroke-width="1"/></g>` }),
    bolo: () => ({ body: `<path d="M44 84 Q48 92 50 94 Q52 92 56 84" fill="none" stroke="${INK}" stroke-width="1.2"/><path d="M49 95 V110 M51 95 V110" stroke="${INK}" stroke-width="1"/><circle cx="49" cy="111" r="1.2" fill="#c0a040"/><circle cx="51" cy="111" r="1.2" fill="#c0a040"/><ellipse cx="50" cy="95" rx="3.6" ry="3" fill="#3fb8a9" stroke="${INK}" stroke-width="1.2"/><ellipse cx="50" cy="95" rx="3.6" ry="3" fill="none" stroke="#d0d4e0" stroke-width=".6"/>` }),
    bowtie: (p, c) => ({ body: `<path d="M50 90 L42 86 L42 95Z M50 90 L58 86 L58 95Z" fill="${c || '#c8323c'}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><rect x="48" y="88" width="4" height="4" rx="1" fill="${c || '#c8323c'}" stroke="${INK}" stroke-width="1"/>` }),
    bandolier: () => ({ body: `<path d="M20 98 L74 120 L66 120 L16 102Z" fill="#6a4a2a" stroke="${INK}" stroke-width="1.6"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${24 + i * 8}" y="${96 + i * 3.3}" width="3" height="6" rx="1" fill="#f2c14e" stroke="${INK}" stroke-width=".7" transform="rotate(22 ${25 + i * 8} ${99 + i * 3.3})"/>`).join('')}` }),
    freckles: () => ({ face: `<g fill="#a0603a" opacity=".6">${[[37, 61], [39.5, 63], [36, 64], [41, 60.5], [63, 61], [60.5, 63], [64, 64], [59, 60.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".7"/>`).join('')}</g>` }),
    blush: () => ({ face: `<ellipse cx="38" cy="63" rx="4" ry="2" fill="#e8508a" opacity=".3"/><ellipse cx="62" cy="63" rx="4" ry="2" fill="#e8508a" opacity=".3"/><path d="M36 62.5 l1 -1.4 M38.4 62.8 l1 -1.4 M60.6 62.8 l1 -1.4 M63 62.5 l1 -1.4" stroke="#c8406a" stroke-width=".6" opacity=".7"/>` }),
    earring: (p, c) => ({ face: `<circle cx="31.5" cy="64" r="2.2" fill="none" stroke="${INK}" stroke-width="1.8"/><circle cx="31.5" cy="64" r="2.2" fill="none" stroke="${c || '#f2c14e'}" stroke-width="1"/><circle cx="68.5" cy="64" r="2.2" fill="none" stroke="${INK}" stroke-width="1.8"/><circle cx="68.5" cy="64" r="2.2" fill="none" stroke="${c || '#f2c14e'}" stroke-width="1"/>` }),
    bandage: () => ({ face: `<g transform="rotate(-20 61 64)"><rect x="55" y="62" width="12" height="5" rx="1.5" fill="#f6ecd8" stroke="${INK}" stroke-width="1"/><path d="M58 62v5M64 62v5" stroke="${INK}" stroke-width=".5" opacity=".5"/><rect x="59.5" y="63" width="3" height="3" fill="#e8c8b0"/></g>` }),
    eyepatch: () => ({ face: `<path d="M30 46 L70 60" stroke="${INK}" stroke-width="1.6"/><path d="M35 52 Q41 48 47 52 L46 58 Q41 61 36 58Z" fill="${INK}"/><path d="M37 53 Q41 51 44 53" stroke="#fff" stroke-width=".7" opacity=".5" fill="none"/>` }),
    stubble: p => ({ face: `<g fill="${p.hair === '#e8e8e8' ? '#8a8a8a' : INK}" opacity=".35">${[[40, 74], [43, 77], [46, 79], [50, 80], [54, 79], [57, 77], [60, 74], [42, 71], [58, 71], [48, 77], [52, 77], [38, 70], [62, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".55"/>`).join('')}</g>` }),
    cheekscar: () => ({ face: `<path d="M36 58 L42 66 M42 58 L37 65" stroke="#8a2a2a" stroke-width="1.2" stroke-linecap="round"/>` }),
  };
  const applyDeco = (p, layer) => (p.deco || []).map(d => { const [nm, arg] = String(d).split(':'); const f = decoParts[nm]; const r = f ? f(p, arg) : null; return r && r[layer] || ''; }).join('');
  // which characters wear what (numbers on the bibs are decorative)
  const DECO = {
    // the named racers show their manga outfits instead of race bibs (in SBR the numbers ride on the saddle cloth)
    johnny: ['collar:#e8508a'], diegoworld: ['collar:#ffd84a'],
    hotpants: ['necklace:cross'], mountaintim: ['stubble'], whisperer: ['necklace:beads'],
    wekapipo: ['collar:#f6ecd8'],
    lucy: ['blush'], sugar: ['blush'], marshal: ['badge'], gunslinger: ['bandolier', 'stubble'], bandit: ['bandolier'],
    thug: ['bandage', 'stubble'], bounty: ['eyepatch', 'stubble'], rodeo: ['freckles', 'bib:66'], trapper: ['stubble'], baron: ['bolo'],
    doctor: ['collar', 'bowtie:#1a1020'], agent: ['collar'], soldier: ['medal'], coach: ['collar'],
    nicholas: ['collar'], miner: ['cheekscar'], marco: ['collar:#f6ecd8'],
  };
  Object.entries(DECO).forEach(([k, d]) => { if (P[k] && !P[k].deco) P[k].deco = d; });
  if (P.marshal) P.marshal.hat = 'stetson';
  const extras = {
    goldteeth: p => `<path d="M42 72 Q50 78 58 72 L57 75 Q50 79 43 75Z" fill="#f2c14e" stroke="${INK}" stroke-width="1"/><text x="50" y="76.2" font-size="3.2" text-anchor="middle" font-family="Oswald" font-weight="700" fill="${INK}">GO!GO!</text>`,
    dmark: () => '',
    halo: () => `<ellipse cx="50" cy="13" rx="19" ry="5" fill="none" stroke="${INK}" stroke-width="4.2"/><ellipse cx="50" cy="13" rx="19" ry="5" fill="none" stroke="#ffd84a" stroke-width="2.2"/><path d="M36 11.4 Q42 9 48 8.6" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/>`,
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
    sukuna: () => `<g stroke="#1a1020" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M37 63 q4-2.4 7 0M56 63 q4-2.4 7 0"/><path d="M36 67 l7 1.6M64 67 l-7 1.6"/><path d="M44 40 l3 3 3-3 3 3 3-3"/><path d="M49 80 h2"/></g><circle cx="40.5" cy="63.4" r="1" fill="#c8323c"/><circle cx="59.5" cy="63.4" r="1" fill="#c8323c"/>`,
    tattoo: () => `<g fill="none" stroke="#c8323c" stroke-width="1.4"><path d="M36 60 q4 -4 8 0 M56 60 q4 -4 8 0"/><text x="50" y="112" font-family="Bangers" font-size="11" text-anchor="middle" fill="#c8323c" stroke="none">YOU!</text></g>`,
  };
  /* ---- creator parts: every key is optional, and a missing key draws the classic face ---- */
  const MIR = s => `${s}<g transform="matrix(-1 0 0 1 100 0)">${s}</g>`;
  const FACES = {
    square: 'M32 48 Q32 30 50 28 Q68 30 68 48 L68 66 Q67 76 58 80 L42 80 Q33 76 32 66 Z',
    long: 'M33 48 Q33 30 50 28 Q67 30 67 48 L65.5 64 Q62 80 50 85 Q38 80 34.5 64 Z',
    round: 'M31.5 48 Q31.5 29 50 28 Q68.5 29 68.5 48 Q69 70 50 80 Q31 70 31.5 48 Z',
    pointed: 'M32 48 Q32 30 50 28 Q68 30 68 48 L67 60 Q62 72 50 84 Q38 72 33 60 Z',
    broad: 'M32 48 Q32 30 50 28 Q68 30 68 48 L69 64 Q68 74 60 79 Q54 83 50 83 Q46 83 40 79 Q32 74 31 64 Z',
  };
  // one eye (the left); the right is its mirror. w = white, i = iris [cx, cy, r], l = heavy upper lash, x = extra ink
  const EYES = {
    sharp: { w: 'M34.5 54 Q40 52.2 47 55.2 Q41 57.6 36 56Z', i: [42, 55.2, 2.3], l: 'M32 52 Q40 49 48.5 54.6 L47 55.4 Q40 51.4 34 54.2Z', x: `<path d="M32 52 l-2.6 -.6" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>` },
    round: { w: 'M35.2 55 A5.8 4 0 1 1 46.8 55 A5.8 4 0 1 1 35.2 55Z', i: [41.6, 55.2, 3], l: 'M33.6 54 Q41 47.6 48.2 54 L46.9 54.4 Q41 49.6 35 54.6Z', x: `<circle cx="43" cy="56.6" r=".6" fill="#fff"/>` },
    sleepy: { w: 'M35 55.2 Q41 52.8 47 55.2 Q41 58.6 35 55.2Z', i: [41.5, 55.8, 2.5], l: 'M33 55 Q41 50.8 48.5 54.8 L47 55.5 Q41 52.8 34.6 55.9Z', x: `<path d="M35 52.9 Q41 50.2 47 52.7" fill="none" stroke="${INK}" stroke-width=".8"/>` },
    lashes: { w: 'M35 55 Q41 50 47 55 Q41 58 35 55Z', i: [41.5, 54.6, 2.4], l: 'M32.5 53.5 Q41 46.5 48.5 53 L47 53.6 Q41 49.5 34 54.6Z', x: p => `<path d="M33.6 52.4 Q41 45.8 48 51.8" fill="none" stroke="${p.lip}" stroke-width="2" opacity=".45"/><path d="M33.4 53 l-3.4 -2.6 M35 51.4 l-2.4 -3.4 M37.4 50.2 l-1.2 -3.6 M40 49.6 l-.2 -3.2" stroke="${INK}" stroke-width="1.1" stroke-linecap="round"/><path d="M37 57.6 l-.8 1.6 M39.6 58.1 l-.4 1.6" stroke="${INK}" stroke-width=".8"/>` },
    narrow: { w: 'M35.5 55.2 Q41 53 46.8 55.2 Q41 56.8 35.5 55.2Z', i: [41.6, 55.1, 2], l: 'M33 54.2 Q41 50 48.4 54.2 L47 55 Q41 52.4 34.6 55.2Z', x: `<path d="M36 56.8 Q41 58 46 56.8" fill="none" stroke="${INK}" stroke-width=".8"/>` },
    glare: { w: 'M35 55 Q41 50 47 55 Q41 58 35 55Z', i: [41.5, 54.8, 1.5], l: 'M32.5 53.5 Q41 46.5 48.5 53 L47 53.6 Q41 49.5 34 54.6Z', x: `<path d="M36 58.8 Q41 60.4 46 58.8 M37 60.6 Q41 61.6 45 60.6" fill="none" stroke="${INK}" stroke-width=".7" opacity=".7"/>` },
    closed: { c: true, x: `<path d="M34.6 55.2 Q41 59 47.4 55.2" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><path d="M34.8 55.4 l-2.4 -1.2 M36.6 57 l-1.4 1.6 M39.4 58 l-.6 1.8" stroke="${INK}" stroke-width="1" stroke-linecap="round"/>` },
  };
  const eyeSet = (st, p, id) => {
    if (st.c) return MIR(st.x);
    const [cx, cy, r] = st.i, x = typeof st.x === 'function' ? st.x(p) : st.x || '';
    return `<clipPath id="${id}e"><path d="${st.w}"/></clipPath>` + MIR(`<path d="${st.w}" fill="#fff" stroke="${INK}" stroke-width="1.2"/><g clip-path="url(#${id}e)"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.eye}" stroke="${INK}" stroke-width=".6"/><circle cx="${cx}" cy="${cy}" r="${(r * 0.42).toFixed(2)}" fill="${INK}"/><circle cx="${cx - r * 0.38}" cy="${cy - r * 0.38}" r="${(r * 0.3).toFixed(2)}" fill="#fff"/></g><path d="${st.l}" fill="${INK}"/>${x}`);
  };
  const BROWS = {
    thick: `<path d="M32.6 47.8 Q39 43.2 47.4 48 L46.6 50.6 Q39 46.8 33.4 49.8Z" fill="${INK}"/>`,
    thin: `<path d="M33.6 47.8 Q39.6 45.4 46.6 48.4 L46.4 49.1 Q39.6 46.5 33.8 48.7Z" fill="${INK}"/>`,
    angry: `<path d="M32.8 45.4 Q40 45.8 47.6 50.2 L46.8 51.6 Q39.6 47.8 33.4 47.2Z" fill="${INK}"/>`,
    worried: `<path d="M33 49.8 Q40 46.8 46.8 45.2 L47.2 46.8 Q40.4 48.2 33.6 51Z" fill="${INK}"/>`,
    arched: `<path d="M33.2 49.2 Q37 43.4 47 47.4 L46.6 48.6 Q37.4 45.4 34 50Z" fill="${INK}"/>`,
    bushy: p => `<path d="M32.4 48.6 Q37 42.6 47.8 47.2 L47.2 50.6 Q44 49 42 50 Q39 47.8 36 50 Q34.6 49 33 50.4Z" fill="${p.hair}" stroke="${INK}" stroke-width=".9"/>`,
    scarred: [`<path d="M33 47.5 Q36 46 38.6 45.6 L39 47 Q36 47.4 33.6 48.8Z M41.6 45.6 Q44 46.4 47 48.6 L46.4 49.8 Q44 48.4 41.4 47.2Z" fill="${INK}"/>`, `<path d="M40 42.6 L40.6 50.6" stroke="#8a2a2a" stroke-width="1.2" stroke-linecap="round"/><path d="M38.8 44.6 l2.4 -.2 M39 48 l2.4 -.2" stroke="#8a2a2a" stroke-width=".7"/>`],
  };
  const NOSES = {
    button: `<path d="M50.8 59 Q51.4 61 50.6 62.4" fill="none" stroke="${INK}" stroke-width=".7" opacity=".5"/><path d="M47.8 64.4 Q50 66.6 52.4 64.4" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/><circle cx="52.4" cy="63" r=".9" fill="#fff" opacity=".6"/>`,
    hook: `<path d="M50.4 56 Q55.2 60.4 52.8 65 L49.4 65.8" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M51.2 66 l2.2 -.4" stroke="${INK}" stroke-width=".9" stroke-linecap="round"/>`,
    broad: `<path d="M51 53 Q52 58 51.6 61" fill="none" stroke="${INK}" stroke-width=".7" opacity=".55"/><path d="M47.6 62 Q45.4 65.8 48.2 66.2 Q50 67.4 51.8 66.2 Q54.6 65.8 52.4 62" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>`,
    pointed: `<path d="M51 51 Q52.6 57 51.8 61" fill="none" stroke="${INK}" stroke-width=".7" opacity=".55"/><path d="M50.2 55 L46 65.8 L51.2 66.6" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`,
    none: `<path d="M50.6 63.6 l1.4 .6" stroke="${INK}" stroke-width="1" stroke-linecap="round"/>`,
  };
  const MOUTHS = {
    smirk: p => `<path d="M47 74.6 Q51 75.8 54.6 73.8 Q51 76.8 47 74.6Z" fill="${p.lip}" stroke="${INK}" stroke-width=".8"/><path d="M43.6 72.8 Q50 73.8 56.6 70.4" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/><path d="M56.8 69.6 l1.2 -1" stroke="${INK}" stroke-width=".9" stroke-linecap="round"/>`,
    smile: p => `<path d="M43.6 71 Q50 74.4 56.4 71 Q50 77 43.6 71Z" fill="${p.lip}" stroke="${INK}" stroke-width="1.2"/><path d="M42.6 70.4 l1.2 .8 M57.4 70.4 l-1.2 .8" stroke="${INK}" stroke-width=".9" stroke-linecap="round"/>`,
    teeth: () => `<path d="M42.6 70.6 Q50 71.8 57.4 70.6 Q56 77.6 50 77.8 Q44 77.6 42.6 70.6Z" fill="#fff" stroke="${INK}" stroke-width="1.2"/><path d="M46 71.4 v2.6 M50 71.8 v2.8 M54 71.4 v2.6 M43.8 73.8 Q50 75 56.2 73.8" fill="none" stroke="${INK}" stroke-width=".6"/>`,
    gritted: () => `<path d="M42.4 70.8 Q50 69.6 57.6 70.8 L57 75.2 Q50 76.2 43 75.2Z" fill="#fff" stroke="${INK}" stroke-width="1.2"/><path d="M42.8 73 Q50 72.4 57.2 73 M46 70.2 v5.4 M50 69.9 v6 M54 70.2 v5.4" fill="none" stroke="${INK}" stroke-width=".6"/><path d="M40.6 71.6 l1.8 .6 M59.4 71.6 l-1.8 .6" stroke="${INK}" stroke-width="1" stroke-linecap="round"/>`,
    frown: p => `<path d="M46 74.8 Q50 73.4 54 74.8 Q50 76.2 46 74.8Z" fill="${p.lip}" stroke="${INK}" stroke-width=".7"/><path d="M43.8 74 Q50 70.2 56.2 74" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round"/>`,
    flat: p => `<path d="M46.4 73.8 Q50 75.2 53.6 73.8" fill="none" stroke="${p.lip}" stroke-width="1.6" stroke-linecap="round"/><path d="M44.2 72.4 H55.8" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>`,
    shout: () => `<path d="M43 70 Q50 68.4 57 70 Q56.4 79.4 50 79.8 Q43.6 79.4 43 70Z" fill="#5a1a2a" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/><path d="M44 70.4 Q50 69.2 56 70.4 L55.6 72.2 Q50 71.4 44.4 72.2Z" fill="#fff"/><path d="M46.2 77.8 Q50 75.2 53.8 77.8 Q50 79.4 46.2 77.8Z" fill="#e0607a"/>`,
    tongue: p => `<path d="M43.6 71 Q50 74.6 56.4 71 Q50 76.4 43.6 71Z" fill="${p.lip}" stroke="${INK}" stroke-width="1.1"/><path d="M48 73.8 Q48 79 51 79 Q54 79 53.4 73.6Z" fill="#e0607a" stroke="${INK}" stroke-width="1"/><path d="M50.8 74.6 v2.4" stroke="${INK}" stroke-width=".5"/>`,
    gogo: p => `<path d="M43.5 72 Q47 70 50 71 Q53 70 56.5 72 Q50 75.5 43.5 72Z" fill="${p.lip}" stroke="${INK}" stroke-width="1.1"/>` + extras.goldteeth(p),
  };
  const FACIAL = {
    stubble: p => decoParts.stubble(p).face + `<g fill="${p.hair === '#e8e8e8' ? '#8a8a8a' : INK}" opacity=".3">${[[36, 66], [37, 69], [64, 66], [63, 69], [44, 80], [56, 80], [50, 82]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".55"/>`).join('')}</g>`,
    mustache: p => extras.mustache(p),
    handlebar: p => `<path d="M40.4 69.2 Q45 66 50 68.6 Q55 66 59.6 69.2 Q62.6 69.4 63.2 65.6 Q65.6 70.6 60 71.4 Q55 70.6 50 70.4 Q45 70.6 40 71.4 Q34.4 70.6 36.8 65.6 Q37.4 69.4 40.4 69.2Z" fill="${p.hair}" stroke="${INK}" stroke-width="1"/>`,
    horseshoe: p => `<path d="M40 69.6 Q45 66.4 50 68.4 Q55 66.4 60 69.6 L60.8 79.4 L58.2 79.6 L57 71.6 Q50 70.4 43 71.6 L41.8 79.6 L39.2 79.4Z" fill="${p.hair}" stroke="${INK}" stroke-width="1" stroke-linejoin="round"/>`,
    goatee: p => `<path d="M42 70 Q46 68 50 69.4 Q54 68 58 70 Q54 70.6 50 70.6 Q46 70.6 42 70Z" fill="${p.hair}" stroke="${INK}" stroke-width=".9"/><path d="M46 76.8 Q50 75.6 54 76.8 L53 81 Q50 84.4 47 81Z" fill="${p.hair}" stroke="${INK}" stroke-width="1"/>`,
    beard: p => extras.beard(p),
    fullbeard: p => `<path d="M32.6 56 Q31.6 88 50 98 Q68.4 88 67.4 56 Q66.6 70 58.4 76.4 Q50 74.4 41.6 76.4 Q33.4 70 32.6 56Z" fill="${p.hair}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M40 84 Q42 90 46 93 M60 84 Q58 90 54 93 M50 80 V94" fill="none" stroke="${INK}" stroke-width=".8" opacity=".45"/>` + extras.mustache(p),
    chops: p => MIR(`<path d="M32.8 50 L32.6 64 Q35 74.4 42.4 75.2 Q44.4 71.4 40.6 69 Q37.4 66 37 58 L36.8 50Z" fill="${p.hair}" stroke="${INK}" stroke-width="1" stroke-linejoin="round"/>`),
    soulpatch: p => `<path d="M48.4 76.4 L51.6 76.4 L50 79.6Z" fill="${p.hair}" stroke="${INK}" stroke-width=".8" stroke-linejoin="round"/>`,
  };
  const MARKS = {
    scar: () => decoParts.cheekscar().face,
    eyescar: () => `<path d="M60.4 45 L63.4 64" stroke="#8a2a2a" stroke-width="1.6" stroke-linecap="round"/><path d="M59.6 48.6 l2.6 -.4 M60.4 58.6 l2.6 -.4 M61 61.8 l2.6 -.4" stroke="#8a2a2a" stroke-width=".8"/>`,
    freckles: () => decoParts.freckles().face,
    blush: () => decoParts.blush().face,
    jojolines: () => `<path d="M47.4 77.6 v2 M50 78 v2.2 M52.6 77.6 v2" stroke="${INK}" stroke-width=".8" stroke-linecap="round"/><path d="M42.4 70.4 l-1.2 -1.2 M57.6 70.4 l1.2 -1.2" stroke="${INK}" stroke-width=".8" stroke-linecap="round"/>`,
    star: p => `<path d="M45 81.6 l1.1 2.3 2.5.3-1.8 1.7.5 2.5-2.3-1.3-2.3 1.3.5-2.5-1.8-1.7 2.5-.3z" fill="${shade(p.skin)}" stroke="${INK}" stroke-width=".6" stroke-linejoin="round"/>`,
    warpaint: () => MIR(`<path d="M34.6 60.6 L42 62.4 M35 64 L41.4 65.6" stroke="#c8323c" stroke-width="1.8" stroke-linecap="round"/>`),
    facetat: () => `<g fill="none" stroke="#3a4a8a" stroke-width="1.2" stroke-linecap="round"><path d="M35.6 59.6 Q35.4 66 40.4 66.4 Q43.6 66.4 43.6 63.6 Q43.4 61.6 41.2 61.8"/><path d="M36.6 59 L39 57.8 M38.6 60.4 L41 59.4"/></g><circle cx="46" cy="67.6" r=".8" fill="#3a4a8a"/><circle cx="47.6" cy="69.2" r=".6" fill="#3a4a8a"/>`,
    mole: () => `<circle cx="56.6" cy="68.4" r=".9" fill="${INK}"/>`,
    stitches: () => `<path d="M56 58.6 Q61 63 63.4 69.4" fill="none" stroke="#8a2a2a" stroke-width="1.1"/>${[[57, 59.6], [59.4, 62], [61.4, 64.8], [62.8, 67.8]].map(([x, y]) => `<path d="M${x - 1.6} ${y + 1.2} l3.2 -2.4" stroke="${INK}" stroke-width=".8" stroke-linecap="round"/>`).join('')}`,
    tears: () => MIR(`<path d="M38.4 59.4 Q37.4 63.4 38.8 64.4 Q40.2 63.4 38.4 59.4Z" fill="#9fc7e8" stroke="${INK}" stroke-width=".7"/>`),
  };
  // accessories: up to a few at once, each drawn on its own layer
  const ACC = {
    earring: { face: p => decoParts.earring(p).face },
    dangle: { face: () => MIR(`<path d="M31.5 61.6 v3.4" stroke="${INK}" stroke-width="1"/><path d="M31.5 65 l-2 3.6 2 3.6 2 -3.6z" fill="#3fb8a9" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/>`) },
    mask: { hideMouth: true, face: p => `<path d="M31.6 61 Q50 57 68.4 61 L66 74 Q58 86 50 91 Q42 86 34 74Z" fill="${p.accColor || '#c8323c'}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/><g fill="#fff" opacity=".75">${[[40, 64], [50, 62], [60, 64], [44, 72], [56, 72], [50, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.1"/>`).join('')}</g><path d="M42 68 Q50 66 58 68" fill="none" stroke="${INK}" stroke-width=".8" opacity=".5"/>` },
    eyepatch: { face: () => decoParts.eyepatch().face },
    glasses: { face: () => MIR(`<circle cx="41.5" cy="55" r="5.4" fill="#fff" fill-opacity=".15" stroke="${INK}" stroke-width="1.4"/><path d="M36.2 54 L32 52.8" stroke="${INK}" stroke-width="1.2"/>`) + `<path d="M46.8 54.2 Q50 52.4 53.2 54.2" fill="none" stroke="${INK}" stroke-width="1.2"/>` },
    shades: { hideEyes: true, face: () => MIR(`<path d="M34 51.6 H47.6 Q47.6 58.6 41 58.6 Q34.4 58.6 34 51.6Z" fill="${INK}"/><path d="M36 53.4 l3 3" stroke="#fff" stroke-width="1" opacity=".5" stroke-linecap="round"/><path d="M34 52 L31.6 51.6" stroke="${INK}" stroke-width="1.4"/>`) + `<path d="M47.6 52.4 H52.4" stroke="${INK}" stroke-width="1.4"/>` },
    monocle: { face: () => `<circle cx="58.5" cy="54.8" r="6" fill="#fff" fill-opacity=".15" stroke="${INK}" stroke-width="2.6"/><circle cx="58.5" cy="54.8" r="6" fill="none" stroke="#c0a040" stroke-width="1.4"/><path d="M63.6 58.4 Q68 72 62 86" fill="none" stroke="#c0a040" stroke-width=".9" stroke-dasharray="1.2 .8"/>` },
    cigar: { face: () => `<g transform="rotate(14 56 73)"><rect x="55" y="71.5" width="13" height="3.4" rx="1.4" fill="#7a4a2a" stroke="${INK}" stroke-width="1"/><rect x="58.4" y="71.5" width="2.4" height="3.4" fill="#c8323c" stroke="${INK}" stroke-width=".6"/><rect x="66.4" y="71.5" width="1.8" height="3.4" fill="#b0a8a0"/></g><path d="M69.6 72 q-2.4 -4 .6 -7 q3 -3 0 -7 q-2.4 -3 .4 -6" fill="none" stroke="#fff" stroke-width="1.2" opacity=".6" stroke-linecap="round"/>` },
    cigarette: { face: () => `<g transform="rotate(10 56 73)"><rect x="55" y="72.2" width="11" height="2" fill="#f6f4ee" stroke="${INK}" stroke-width=".8"/><rect x="64.6" y="72.2" width="1.6" height="2" fill="#e8742a"/></g><path d="M67 71 q-2 -3.6 .6 -6.4 q2.6 -2.6 0 -6" fill="none" stroke="#fff" stroke-width="1" opacity=".6" stroke-linecap="round"/>` },
    straw: { face: () => `<path d="M55 73.6 L75 62" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><path d="M55 73.6 L75 62" stroke="#e8c060" stroke-width="1.2" stroke-linecap="round"/>${[[72, 62], [74.6, 60.4], [77, 59]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.8" ry=".9" transform="rotate(-50 ${x} ${y})" fill="#e8c060" stroke="${INK}" stroke-width=".6"/>`).join('')}` },
    badge: { body: () => decoParts.badge().body },
    bolo: { body: () => decoParts.bolo().body },
    scarf: { body: p => `<path d="M35 84 Q50 93 65 84 L67 92 Q50 101 33 92Z" fill="${p.accColor || '#c8323c'}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M56 95 L63 114 L55 114 L51 97Z" fill="${p.accColor || '#c8323c'}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M40 89 Q50 94 60 89" fill="none" stroke="${INK}" stroke-width=".8" opacity=".45"/>` },
    kerchief: { body: p => `<path d="M37 85 Q50 91 63 85 L61 91 L50 107 L39 91Z" fill="${p.accColor || '#c8323c'}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><g fill="#fff" opacity=".7">${[[44, 92], [50, 96], [56, 92], [50, 101]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9"/>`).join('')}</g>` },
    cross: { body: p => decoParts.necklace(p, 'cross').body },
    beads: { body: p => decoParts.necklace(p, 'beads').body },
    pendant: { body: p => decoParts.necklace(p, 'gem').body },
    goggles: { body: () => `<path d="M34 88 Q50 97 66 88" fill="none" stroke="${INK}" stroke-width="3.6"/><path d="M34 88 Q50 97 66 88" fill="none" stroke="#6a4a2a" stroke-width="2"/>${[43, 57].map(x => `<circle cx="${x}" cy="93.4" r="4.6" fill="#9fc7e8" stroke="${INK}" stroke-width="1.8"/><circle cx="${x}" cy="93.4" r="3.4" fill="none" stroke="#c0a040" stroke-width="1"/><path d="M${x - 2} ${91.6} l2 -1.2" stroke="#fff" stroke-width="1" stroke-linecap="round"/>`).join('')}` },
    bowtie: { body: p => decoParts.bowtie(p, p.accColor).body },
    bandolier: { body: () => decoParts.bandolier().body },
    medal: { body: () => decoParts.medal().body },
    starpin: { body: () => `<path d="M66 97 l1.8 3.7 4 .5-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.5z" fill="#f2c14e" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/><circle cx="64.6" cy="100.6" r=".8" fill="#fff" opacity=".8"/>` },
    bandage: { face: () => decoParts.bandage().face },
    feather: { behind: () => extras.feather() },
    flower: { top: () => `<g transform="translate(28 56)">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-3" rx="2.6" ry="3.2" transform="rotate(${a})" fill="#c8323c" stroke="${INK}" stroke-width=".9"/>`).join('')}<circle r="2" fill="#8a1a2a" stroke="${INK}" stroke-width=".8"/><path d="M-1 -.4 a1.2 1.2 0 1 1 1.4 1" fill="none" stroke="#e8508a" stroke-width=".6"/><path d="M2 3 l4 4 M4 6 l2.4 -.4" stroke="#3a8c4a" stroke-width="1.4" stroke-linecap="round"/></g>` },
  };
  const accLayer = (p, layer) => (p.acc || []).map(a => ACC[a] && ACC[a][layer] ? ACC[a][layer](p) : '').join('');
  // outfit cuts: `u` replaces the shirt under the neck, `o` is drawn over the neck (collars)
  const STYLES = {
    duster: p => ({ u: `<path d="M8 120 Q12 94 50 88 Q88 94 92 120 Z" fill="${p.outfit}"/><path d="M38 88 L50 112 L62 88" fill="${p.outfit2}"/>${MIR(`<path d="M38 88 L50 112 L46 115 L36 99 L40 96.4 L32.6 91.6Z" fill="${shade(p.outfit)}"/>`)}<circle cx="44" cy="116.6" r="1.4" fill="${p.outfit2}" stroke-width=".8"/>` }),
    poncho: p => ({ u: `<path d="M2 120 Q6 97 50 86.6 Q94 97 98 120 Z" fill="${p.outfit}"/><path d="M5 110 Q50 94 95 110 L96.4 115.4 Q50 99.4 3.6 115.4Z" fill="${p.outfit2}"/><path d="M10 103 Q50 89 90 103" fill="none" stroke="${p.outfit2}" stroke-width="1.6" stroke-dasharray="3 2"/>`, o: `<path d="M41 88 Q50 95 59 88" fill="none" stroke="${INK}" stroke-width="1.4"/>` }),
    vest: p => ({ u: `<path d="M8 120 Q12 94 50 88 Q88 94 92 120 Z" fill="${p.outfit2}"/><path d="M43 88 L50 97 L57 88Z" fill="${p.skin}"/>${MIR(`<path d="M21 120 Q22 101 30 95 Q36 91 42.4 90.4 L50 110 L50 120Z" fill="${p.outfit}"/>`)}<g stroke-width=".8">${[104, 110, 116].map(y => `<circle cx="47.4" cy="${y}" r="1" fill="#f2c14e"/>`).join('')}</g><path d="M52 111 Q60 118 66 110" fill="none" stroke="#f2c14e" stroke-width="1" stroke-dasharray="1.2 .8"/>` }),
    jockey: (p, id) => ({ u: `<clipPath id="${id}b"><path d="M8 120 Q12 94 50 88 Q88 94 92 120 Z"/></clipPath><path d="M8 120 Q12 94 50 88 Q88 94 92 120 Z" fill="${p.outfit}"/><g clip-path="url(#${id}b)" stroke-width="1.2">${[14, 32, 50, 68, 86].map(x => [98, 116].map(y => `<path d="M${x} ${y - 7} l7 7 -7 7 -7 -7z" fill="${p.outfit2}"/>`).join('')).join('')}</g><path d="M8 120 Q12 94 50 88 Q88 94 92 120 Z" fill="none"/>`, o: `<path d="M40 86 Q50 92 60 86 L60.4 90.4 Q50 96.4 39.6 90.4Z" fill="${p.outfit2}" stroke-width="1.6"/>` }),
    priest: p => ({ u: `<path d="M8 120 Q12 94 50 88 Q88 94 92 120 Z" fill="${p.outfit}"/><path d="M50 94 V120" stroke-width="1"/>${[100, 107, 114].map(y => `<circle cx="50" cy="${y}" r="1.1" fill="${p.outfit2}" stroke-width=".7"/>`).join('')}`, o: `<path d="M41 84.4 Q50 88.4 59 84.4 L59 89.6 Q50 93.6 41 89.6Z" fill="${p.outfit}" stroke-width="1.6"/><rect x="47.8" y="87" width="4.4" height="4.4" fill="#fff" stroke-width="1"/>` }),
    military: p => ({ u: `<path d="M8 120 Q12 94 50 88 Q88 94 92 120 Z" fill="${p.outfit}"/>${MIR(`<path d="M11 110 Q14 97 28 94 L31 99.6 Q20 101 15.6 111Z" fill="${p.outfit2}" stroke-width="1.4"/><path d="M13 110 l-1 4 M15.4 110.6 l-.6 4 M17.6 108 l-.4 4" stroke="${p.outfit2}" stroke-width="1.2"/>`)}${[98, 106, 114].map(y => `<circle cx="44" cy="${y}" r="1.5" fill="${p.outfit2}" stroke-width=".8"/><circle cx="56" cy="${y}" r="1.5" fill="${p.outfit2}" stroke-width=".8"/>`).join('')}`, o: `<path d="M41 82 L41 90 Q50 93.6 59 90 L59 82 Q50 85.6 41 82Z" fill="${p.outfit}" stroke-width="1.8"/><path d="M41.4 88.4 Q50 91.8 58.6 88.4" fill="none" stroke="${p.outfit2}" stroke-width="1.2"/>` }),
    turtleneck: p => ({ u: `<path d="M8 120 Q12 94 50 88 Q88 94 92 120 Z" fill="${p.outfit}"/><path d="M30 104 Q50 96 70 104 M28 110 Q50 102 72 110" fill="none" stroke="${p.outfit2}" stroke-width="2"/>`, o: `<path d="M40.6 80 Q50 83 59.4 80 L60 91 Q50 95 40 91Z" fill="${p.outfit}" stroke-width="1.8"/><path d="M41 84 Q50 87 59 84 M41 87.4 Q50 90.4 59 87.4" fill="none" stroke="${INK}" stroke-width=".7" opacity=".5"/>` }),
  };

  /* ================= Character detail pass =================
     Signature hair and hats for the named cast (after the SBR manga/anime designs), small ink helpers,
     and `special` layers. A config's `special` (a name or a list of names) draws extra detail on fixed layers:
     behind (under the head), body (over the clothes), under (on the skin, below the eyes), face (over the features),
     front (over the fringe) and top (over the hat). `hideMouth` skips the lips. */
  function f2(n) { return +n.toFixed(2); }
  function starD(cx, cy, R, r = R * 0.42) { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; d += (i ? 'L' : 'M') + f2(cx + Math.cos(a) * q) + ' ' + f2(cy + Math.sin(a) * q); } return d + 'Z'; }
  /** many round dots in one path: draw with a round-capped stroke */
  function dotD(pts) { return pts.map(([x, y]) => `M${x} ${y}h.01`).join(''); }
  function circD(x, y, r) { return `M${f2(x - r)} ${y}a${r} ${r} 0 1 0 ${f2(2 * r)} 0a${r} ${r} 0 1 0 ${f2(-2 * r)} 0`; }
  function sqD(x, y, s, a) { const c = Math.cos(a * Math.PI / 180), n = Math.sin(a * Math.PI / 180), h = s / 2; return [[-h, -h], [h, -h], [h, h], [-h, h]].map(([u, v], i) => (i ? 'L' : 'M') + f2(x + u * c - v * n) + ' ' + f2(y + u * n + v * c)).join('') + 'Z'; }
  /** a fluffy band (fur trim): bumps along top(x) and bot(x) */
  function furD(x0, x1, top, bot, n) {
    const w = (x1 - x0) / n; let d = `M${x0} ${f2(top(x0))}`;
    for (let i = 0; i < n; i++) { const a = x0 + w * i; d += `Q${f2(a + w / 2)} ${f2(top(a + w / 2) - 3)} ${f2(a + w)} ${f2(top(a + w))}`; }
    d += `L${x1} ${f2(bot(x1))}`;
    for (let i = n; i > 0; i--) { const a = x0 + w * i; d += `Q${f2(a - w / 2)} ${f2(bot(a - w / 2) + 2.6)} ${f2(a - w)} ${f2(bot(a - w))}`; }
    return d + 'Z';
  }
  function diagD(step, y0 = 84, h = 40) { let d = ''; for (let k = -40; k <= 100; k += step) d += `M${k} ${y0}l${h} ${h}M${k + h} ${y0}l${-h} ${h}`; return d; }
  const BODY = 'M8 120 Q12 94 50 88 Q88 94 92 120 Z';
  const inBody = (id, k, s) => `<clipPath id="${id}B${k}"><path d="${BODY}"/></clipPath><g clip-path="url(#${id}B${k})">${s}</g>`;
  const inkG = s => s ? `<g stroke="${INK}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">${s}</g>` : '';
  const rose = (x, y, r, c = '#c8323c') => `<path d="${circD(x, y, r)}" fill="${c}" stroke-width="1"/><path d="M${f2(x - r * .5)} ${y}a${f2(r * .5)} ${f2(r * .5)} 0 1 1 ${f2(r * .5)} ${f2(r * .5)}a${f2(r * .25)} ${f2(r * .25)} 0 0 1 ${f2(-r * .25)} ${f2(-r * .3)}M${f2(x - r * .8)} ${f2(y - r * .1)}q${f2(r * .3)} ${f2(-r * .7)} ${f2(r * 1.1)} ${f2(-r * .6)}" fill="none" stroke-width=".7"/><path d="M${f2(x + r * .7)} ${f2(y + r * .6)}l${f2(r * .9)} ${f2(r * .4)} ${f2(-r * .3)} ${f2(-r * .9)}z" fill="#3a8c4a" stroke-width=".7"/>`;
  const metalFlower = (x, y, r, c) => `<path d="${[0, 1, 2, 3, 4].map(k => circD(f2(x + Math.cos(k * 1.2566 - 1.57) * r * .62), f2(y + Math.sin(k * 1.2566 - 1.57) * r * .62), f2(r * .46))).join('')}" fill="${c}" stroke-width=".7"/><path d="${circD(x, y, f2(r * .36))}" fill="${shade(c)}" stroke-width=".6"/>`;
  const leopard = pts => `<path d="${pts.map(([x, y]) => `M${x} ${y}a2 2 0 1 1 3 1.6`).join('')}" fill="none" stroke-width="1.5"/><path d="${dotD(pts.map(([x, y]) => [x + 1.6, y + .2]))}" stroke-width="1.4" opacity=".75"/>`;
  const steelBall = (x, y, r) => `<path d="${circD(x, y, r)}" fill="#d8dce8" stroke-width="1.6"/><path d="${dotD([[-.45, -.15], [.1, -.5], [.5, .05], [-.05, .4], [-.5, .4], [.45, .5]].map(([u, v]) => [f2(x + u * r), f2(y + v * r)]))}" stroke-width="${f2(r * .24)}" opacity=".55"/><path d="M${f2(x - r * .62)} ${f2(y - r * .4)}q${f2(r * .3)} ${f2(-r * .42)} ${f2(r * .78)} ${f2(-r * .46)}" fill="none" stroke="#fff" stroke-width="1.2"/><path d="M${f2(x - r * 1.6)} ${f2(y + r * .1)}a${f2(r * 1.6)} ${f2(r * .62)} -12 0 0 ${f2(r * 3.2)} 0M${f2(x - r * 1.35)} ${f2(y - r * .5)}a${f2(r * 1.4)} ${f2(r * .5)} -12 0 1 ${f2(r * 2.7)} 0" fill="none" stroke="#fff" stroke-width=".9" opacity=".75"/>`;

  Object.assign(hairBack, {
    johnny: c => `<path d="M30 46 Q30 28 50 26 Q70 28 70 46 L70 62 L30 62Z" fill="${c}"/>` + MIR(`<path d="M30.4 40 Q25 56 26.6 70 Q25.6 76.6 18.4 78 Q21 83.6 29.4 83 Q35.6 81 36.4 74 L36.4 48Z" fill="${c}"/><path d="M28.4 50 Q27 60 28.6 71 M32.4 56 Q31.6 66 33 76 M20.6 80.4 Q25 80.2 27.2 76.6" fill="none" stroke-width=".8" opacity=".55"/>`),
    gyro: c => `<path d="M27 44 Q24 22 50 19 Q76 22 73 44 L75.6 70 Q79 92 84 112 Q74 116 68 108 L66 84 L34 84 L32 108 Q26 116 16 112 Q21 92 24.4 70Z" fill="${c}"/><path d="M26 60 Q24 84 20 106 M30 64 Q29 86 26 108 M74 60 Q76 84 80 106 M70 64 Q71 86 74 108" fill="none" stroke-width=".8" opacity=".5"/>`,
    diego: c => `<path d="M29 46 Q28 26 50 24 Q72 26 71 46 L71 60 L29 60Z" fill="${c}"/>` + MIR(`<path d="M30 42 Q24.6 56 25.6 71 Q27.8 76.6 31.6 74 Q31.4 78.4 35.4 77.4 L36.6 50Z" fill="${c}"/><path d="M28.4 52 Q27.4 62 28.6 70" fill="none" stroke-width=".8" opacity=".55"/>`),
    valentine: c => {
      const ring = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><path d="M${f2(x - r * .5)} ${y}a${f2(r * .5)} ${f2(r * .5)} 0 1 1 ${f2(r * .5)} ${f2(r * .5)}a${f2(r * .22)} ${f2(r * .22)} 0 0 1 ${f2(-r * .22)} ${f2(-r * .28)}" fill="none" stroke-width="1.1"/>`;
      return `<path d="M28 46 Q26 26 50 22 Q74 26 72 46 L74 70 L26 70Z" fill="${c}"/>` + MIR(`<path d="M30 42 Q25 52 26 60 L32 62 L34 46Z" fill="${c}"/>${ring(24.4, 62.6, 6.2)}${ring(22.8, 75, 6.6)}${ring(29.6, 85.8, 5.6)}`);
    },
    mullet: c => `<path d="M29 46 Q28 26 50 24 Q72 26 71 46 L73.6 62 Q76 74 71 84 L29 84 Q24 74 26.4 62Z" fill="${c}"/>` + MIR(`<g fill="${c}">${[[25.6, 64, 4.4], [24.6, 74, 4.6], [28.6, 83, 4.4], [35, 86, 3.6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g><path d="M24 64 a1.6 1.6 0 1 1 2 1.6 M23 74 a1.6 1.6 0 1 1 2 1.6 M27 83 a1.6 1.6 0 1 1 2 1.6" fill="none" stroke-width=".8"/>`),
    hotpants: c => `<path d="M27.6 46 Q26 26 50 23.4 Q74 26 72.4 46 L73 70 Q68 74.6 64.6 70 L64 60 L36 60 L35.4 70 Q32 74.6 27 70Z" fill="${c}"/><path d="M29.6 52 Q29 62 30 70 M70.4 52 Q71 62 70 70" fill="none" stroke-width=".8" opacity=".5"/>`,
    grid: c => `<path d="M30 48 Q29 22 50 20 Q71 22 70 48 L70 54 L30 54Z" fill="${c}"/>`,
    lucy: c => `<path d="M27 46 Q25 23 50 20.6 Q75 23 73 46 L74.6 76 Q72.4 83.6 64.6 81.6 L64 64 L36 64 L35.4 81.6 Q27.6 83.6 25.4 76Z" fill="${c}"/><path d="M28.4 54 Q27.6 66 29 78 M71.6 54 Q72.4 66 71 78" fill="none" stroke-width=".8" opacity=".5"/>`,
    sandman: c => `<path d="M28 44 Q26 22 50 20 Q74 22 72 44 L74.6 70 L69 78 L65 70 L35 70 L31 78 L25.4 70Z" fill="${c}"/><path d="M28 50 Q27 60 28 70 M72 50 Q73 60 72 70" fill="none" stroke-width=".8" opacity=".5"/>`,
    ringo: c => `<path d="M29 48 Q28 24 50 22 Q72 24 71 48 L72 62 L28 62Z" fill="${c}"/>`,
    bmfringe: c => `<path d="M30 48 Q30 26 50 24 Q70 26 70 48Z" fill="${c}"/>`,
    robinson: c => `<path d="M29 46 Q28 24 50 22 Q72 24 71 46 L72 64 L28 64Z" fill="${c}"/>` + MIR(`<path d="M31 36 L12 38 L22 45 L6 52 L21 57 L8 68 L24 68 L14 82 L28 76 L24 92 L34 80 L36 56Z" fill="${c}"/><path d="M28 44 L16 50 M28 54 L14 62 M30 64 L20 76" fill="none" stroke-width=".8" opacity=".5"/>`),
    ferdinand: c => `<path d="M29 46 Q28 26 50 24 Q72 26 71 46 L71 60 L29 60Z" fill="${c}"/>`,
    oyedreads: c => `<path d="M28 46 Q28 22 50 20 Q72 22 72 46Z" fill="${c}"/>` + MIR([23, 28, 33].map((x, i) => { const d = `M${x + 4} 40 Q${x - 1} ${70 + i * 4} ${x + 1} ${104 - i * 6}`; return `<path d="${d}" fill="none" stroke-width="6.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`; }).join('')),
    magent: c => `<path d="M28 46 Q27 24 50 22 Q73 24 72 46 L73 66 L27 66Z" fill="${c}"/>` + MIR(`<g fill="${c}">${[[28.4, 44, 5], [26.6, 54, 5.2], [27.4, 64, 5], [31.6, 71.6, 4.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g><path d="M25.4 44 a2.6 2.6 0 1 1 3 2.6 M23.6 54 a2.6 2.6 0 1 1 3 2.6 M24.4 64 a2.6 2.6 0 1 1 3 2.6 M29 71.6 a2 2 0 1 1 2.4 2" fill="none" stroke="#e0408a" stroke-width="1"/>`),
    disco: c => `<path d="M28 46 Q22 40 26 30 Q28 20 38 18 Q44 12 52 15 Q60 12 66 18 Q76 20 76 30 Q80 40 74 48 Q78 56 74 64 Q76 72 70 76 L30 76 Q24 72 26 64 Q22 56 28 46Z" fill="${c}"/><path d="M24.6 38 a2.4 2.4 0 1 1 3 2 M23.6 58 a2.4 2.4 0 1 1 3 2 M73 36 a2.4 2.4 0 1 0 -3 2 M75.6 58 a2.4 2.4 0 1 0 -3 2 M27 68 a2 2 0 1 1 2.6 1.6 M72.6 68 a2 2 0 1 0 -2.6 1.6" fill="none" stroke-width=".8" opacity=".7"/>`,
    hime: c => `<path d="M27 46 Q25 23 50 20.6 Q75 23 73 46 L74 88 L64 88 L64 62 L36 62 L36 88 L26 88Z" fill="${c}"/><path d="M29 56 V86 M71 56 V86 M32.6 64 V86 M67.4 64 V86" fill="none" stroke="#fff" stroke-width=".7" opacity=".25"/>`,
    marco: c => `<path d="M30 48 Q29 24 50 22 Q71 24 70 48 L70 54 L30 54Z" fill="${c}"/>`,
    patchy: () => '',
    dothan: (c, p) => `<path d="M58 26 Q74 24 79 38 Q83 56 78 82 Q75 66 71 58 Q68 44 60 34Z" fill="${c}"/><path d="M66 31 Q74 38 76 56 M62 30 Q70 40 71 52" fill="none" stroke-width=".8" opacity=".5"/><path d="M65.2 27.6 L70.6 35.6" stroke-width="4.6"/><path d="M65.2 27.6 L70.6 35.6" stroke="${p && p.hat2 || '#e8742a'}" stroke-width="2.6"/>`,
    labb: c => `<path d="M26 46 Q17 30 30 17 Q40 9.6 50 11.6 Q62 9.6 72 17 Q85 30 76 48 Q84 62 80 80 Q84 92 76 102 L24 102 Q16 92 20 80 Q16 62 26 46Z" fill="${c}"/><path d="M22 60 Q18 72 22 84 M78 60 Q82 72 78 84 M26 88 Q24 94 28 100 M74 88 Q76 94 72 100 M28 22 Q34 16 42 15" fill="none" stroke-width=".8" opacity=".55"/>`,
    mikeo: () => '',
    sukuna: () => `<path d="M30 50 Q29 30 50 27 Q71 30 70 50Z" fill="#3a2a2a"/>`,
  });
  Object.assign(hairFront, {
    johnny: c => `<path d="M30.4 45 Q31 50 33.6 55 Q35 50 38 48.6 Q39.6 53 42.6 54 Q43 50 46 48 Q49 52 52 53.4 Q53 49.6 56 48.4 Q58.6 52.6 62.4 53.6 Q62.8 49.6 65.6 48.6 Q67 52 68.6 54.4 Q69.6 49 69.6 45 Q50 40 30.4 45Z" fill="${c}"/><path d="M36 46.6 Q37 49 38 48.6 M47 46.4 Q49 49 51 50 M59 46.6 Q61 49 62 51" fill="none" stroke-width=".7" opacity=".6"/>`,
    gyro: c => `<path d="M30 52 Q28.6 30 48.6 26.6 L50 33 L51.4 26.6 Q71.4 30 70 52 Q68 41 62.6 36 Q57 32.6 52.4 35 L50 39 L47.6 35 Q43 32.6 37.4 36 Q32 41 30 52Z" fill="${c}"/>` + MIR(`<path d="M31.4 44 Q27.4 56 29.6 70 Q31 60 34.4 52 Q34 48 31.4 44Z" fill="${c}" stroke-width="1.6"/>`) + `<path d="M36 36 Q42 32 47 34 M64 36 Q58 32 53 34" fill="none" stroke-width=".7" opacity=".6"/>`,
    diego: c => MIR(`<path d="M30 44 Q29 52 31.4 60 Q33 54 36 50 Q35.6 47 37.4 44.6Z" fill="${c}" stroke-width="1.6"/>`) + `<path d="M39.6 44.6 Q43 47.6 42.4 50.4 Q46 46.8 48.4 45Z" fill="${c}" stroke-width="1.4"/>`,
    valentine: c => `<path d="M30 52 Q28.6 28 50 25.6 Q71.4 28 70 52 Q67.6 39 60.4 34.6 Q54.6 32 51.4 36.4 L50 30.6 L48.6 36.4 Q45.4 32 39.6 34.6 Q32.4 39 30 52Z" fill="${c}"/>` + MIR(`<path d="M31.2 44 Q27.6 52 28.8 60 L32.6 59 Q32 51 34.2 46Z" fill="${c}" stroke-width="1.6"/><path d="M34 36 Q40 32.6 46 34" fill="none" stroke-width=".7" opacity=".6"/>`),
    mullet: c => `<path d="M30.4 50 Q29 36 36 33.4 Q38.4 38 42.4 36.4 Q45.6 40 49 37.6 Q52.4 40.6 55.6 37.6 Q59 40 62 36.4 Q65.6 38 64 33.4 Q71 36 69.6 50 Q66.4 44 62.4 45 Q59 41.6 55 44 Q51 41 47 44 Q43 41.4 39.4 44.6 Q35 43.4 33.4 47 Q31.6 46.6 30.4 50Z" fill="${c}"/>`,
    hotpants: c => `<path d="M30 50 Q29.4 30 50 27 Q70.6 30 70 50 L68 46.6 L66.6 51.6 L63.6 45 L60.4 49.4 L57.4 43.4 L53.6 47.6 L51 42.6 L47 47 L44.6 42.6 L40.6 47.8 L38.6 43.6 L35 49 L33.4 44.6Z" fill="${c}"/>`,
    grid: (c, p, id) => {
      const sh = 'M31 47 Q29.6 24 50 22 Q70.4 24 69 47 Q67 40 63 38 L37 38 Q33 40 31 47Z';
      return `<clipPath id="${id}w"><path d="${sh}"/></clipPath><path d="${sh}" fill="${c}"/><g clip-path="url(#${id}w)"><path d="M28 27.4 H72 M28 32.8 H72 M38.2 20 V40 M44.4 20 V40 M50 20 V40 M55.6 20 V40 M61.8 20 V40 M33 30 V48 M67 30 V48" stroke-width="2.4" opacity=".55"/><path d="M28 27.4 H72 M28 32.8 H72 M38.2 20 V40 M44.4 20 V40 M50 20 V40 M55.6 20 V40 M61.8 20 V40 M33 30 V48 M67 30 V48" stroke="${p.skin}" stroke-width="1.3"/></g><path d="${sh}" fill="none"/>`;
    },
    lucy: c => `<path d="M30 52 Q28.6 27 50 25 Q71 26.6 70.4 50 Q67.4 39.4 58.6 36.4 Q62.4 40.6 62.6 47 Q55.4 38.6 46 38.6 Q38.4 40 34.4 44.6 Q31.6 47.6 30 52Z" fill="${c}"/>` + MIR(`<path d="M31.4 46 Q28.6 54 30 62 L33.4 56 Q33 50 34.6 47Z" fill="${c}" stroke-width="1.5"/>`) + `<path d="M36 34 Q44 30 54 31 M58 36 Q62 38 64 42" fill="none" stroke-width=".7" opacity=".55"/><circle cx="64.6" cy="37.6" r="2.4" fill="#e8508a" stroke-width="1.2"/><circle cx="64" cy="37" r=".8" fill="#fff" stroke="none"/>`,
    sandman: c => {
      const braid = d => `<path d="${d}" fill="none" stroke-width="6.2" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="3.8" stroke-linecap="round"/><path d="${d}" fill="none" stroke-width="3.8" stroke-dasharray=".9 2.4" opacity=".6"/>`;
      return `<path d="M30 50 Q29 28 50 25.6 Q71 28 70 50 Q66 38 58 33 L50 36 L42 33 Q34 38 30 50Z" fill="${c}"/><path d="M50 26 V35 M38 34 Q34 40 32 46 M62 34 Q66 40 68 46" fill="none" stroke-width=".8" opacity=".6"/>`
        + braid('M42.4 32 Q35.6 42 36.2 56 Q36.8 70 42 80 Q46 88 54 94 Q60 99 61.6 110') + braid('M57.6 32 Q64.4 42 63.8 56 Q63.2 70 58 80 Q54 88 46 94 Q40 99 38.4 110')
        + `<path d="M59.4 108.6 l4.4 3.6 M40.6 108.6 l-4.4 3.6" stroke="#c8323c" stroke-width="2.4"/>`;
    },
    ringo: c => `<path d="M30 52 Q27.6 30 46 24.6 Q64 21.6 71 38 Q73.4 48 71 60 L68.4 52 L66.6 57 Q65 49 62.4 46 L60 51 Q58.6 46 55 45 L52.6 49.4 Q52 45 48.6 44 L45 47.4 Q45 44 41.6 43.4 Q36 45 33 49 Q31.4 50 30 52Z" fill="${c}"/><path d="M36 34 Q48 27 60 32 M40 40 Q52 33 64 38 M60 30 Q68 36 69 48 M46 44 Q52 40 58 42" fill="none" stroke-width=".8" opacity=".6"/>`,
    bmfringe: c => `<path d="M31.6 48 Q32.6 35.6 50 34.4 Q67.4 35.6 68.4 48 L65 43.4 L63 49.4 L59.4 42.6 L56.4 48.6 L53 42 L50 48 L47 42 L43.6 48.6 L40.6 42.6 L37 49.4 L35 43.4Z" fill="${c}"/>`,
    robinson: c => MIR(`<path d="M31 43 L28.4 56 L33.6 49.4Z" fill="${c}" stroke-width="1.4"/>`),
    ferdinand: c => `<path d="M31 50 Q30 33 45 31.6 Q60 31 67.6 39 Q57.6 36.6 51.4 40.6 Q46.4 45 45 53 Q43.6 61 39 67.4 Q39.4 59 37.4 54 Q34 57.4 32 63 Q30.6 56 31 50Z" fill="${c}"/><path d="M47 36 Q42 44 41 56 M52 38 Q47 44 45 50" fill="none" stroke-width=".7" opacity=".6"/>`,
    oyedreads: c => hairFront.dreads(c),
    magent: c => `<path d="M31 48 Q29 36 36 34 Q38 30 43 32 Q47 28 51 31 Q56 28 59 32 Q64 30 65 35 Q71 38 69 48 Q66 42 62 43 Q60 38 55 41 Q51 37 47 41 Q43 38 40 43 Q35 41 33 46Z" fill="${c}"/><path d="M38 36 a2 2 0 1 1 2.6 1.6 M52 33 a2 2 0 1 1 2.6 1.6 M60 38 a2 2 0 1 1 2.6 1.6" fill="none" stroke="#e0408a" stroke-width=".9"/>`,
    disco: c => `<path d="M30 48 Q28 38 34 34 Q36 28 42 30 Q46 25 51 29 Q57 25 60 30 Q66 29 67 35 Q72 40 70 48 Q66 42 62 44 Q60 38 55 41 Q52 36 48 41 Q44 37 41 43 Q37 40 34 46 Q32 44 30 48Z" fill="${c}"/><path d="M38 33 a2 2 0 1 1 2.4 1.6 M50 30 a2 2 0 1 1 2.4 1.6 M60 34 a2 2 0 1 0 -2.4 1.6" fill="none" stroke-width=".8" opacity=".7"/>`,
    hime: c => `<path d="M30 50 Q29 26 50 24 Q71 26 70 50 L70.4 71 L64.6 71 L64.6 46.2 L35.4 46.2 L35.4 71 L29.6 71Z" fill="${c}"/><path d="M40 38 V46 M46 36 V46 M54 36 V46 M60 38 V46" fill="none" stroke="#fff" stroke-width=".7" opacity=".3"/>`,
    marco: c => `<path d="M31 46 Q32 30 50 28 Q68 30 69 46 Q62 38 50 38 Q38 38 31 46Z" fill="${c}"/><path d="M44 35 Q42 24 50 20 Q60 18 62.4 24 Q56.4 22 54.4 26 Q58.6 28.4 56.4 34.6 Q50 30.4 44 35Z" fill="#f2d27a"/><path d="M48 32 Q47 26 51 23" fill="none" stroke-width=".7" opacity=".6"/>`,
    patchy: c => `<path d="M31.4 44 Q31 26.6 50 25.6 Q69 26.6 68.6 44 Q60 37.6 50 37.4 Q40 37.6 31.4 44Z" fill="${c}" fill-opacity=".75"/><path d="${sqD(38.6, 34.4, 3.4, 12)}${sqD(46, 30, 3.2, -8)}${sqD(54.6, 30.6, 3.4, 10)}${sqD(61.6, 35.6, 3, -12)}${sqD(50, 35.4, 2.8, 4)}" fill="#e8dcc0" stroke-width=".8"/>`,
    dothan: c => `<path d="M33 40 Q33 29.6 50 28.6 Q67 29.6 67 40 Q50 35 33 40Z" fill="${c}" fill-opacity=".35" stroke="none"/><path d="M45.4 36 Q44 22 50 14.6 Q56 22 54.6 36 Q50 34 45.4 36Z" fill="${c}"/><path d="M47.6 33 Q47 24 50 18 M52.4 33 Q53 24 50 18" fill="none" stroke-width=".7" opacity=".5"/>`,
    labb: c => `<path d="M30 52 Q27 30 44 25 Q58 22 66 29 Q72 34 71 50 Q67 40 60 37 Q62 42 60 46 Q54 38 46 39 Q38 40 34 46 Q31 48 30 52Z" fill="${c}"/><path d="M40 30 Q48 27 56 29" fill="none" stroke-width=".7" opacity=".55"/>`,
    mikeo: c => `<path d="M40.6 31.4 Q37.4 24.6 43 22.4 Q45 16.6 50.6 18.6 Q56 15.6 58.4 21 Q63.6 22.4 61.4 28.4 Q63 32.4 58.4 33 Q54.4 35.4 50 33 Q45.6 35.6 42.4 33.2 Q38.8 34 40.6 31.4Z" fill="${c}"/><path d="M44 26 a2 2 0 1 1 2.6 2 M52 22 a2 2 0 1 1 2.6 2 M54 29 a2 2 0 1 1 2.6 2 M46 31 a1.6 1.6 0 1 1 2 1.6" fill="none" stroke="#fff" stroke-width=".7" opacity=".4"/>`,
    sukuna: c => MIR(`<path d="M31 46 Q30.6 38 34.6 35 L35.4 47Z" fill="#3a2a2a" stroke-width="1.4"/>`) + `<path d="M31 44 Q30.4 33.6 34.6 29.6 L29.6 18 L39.4 24.6 L39.6 11.6 L47 21.6 L51.6 8.6 L55 21.6 L63.4 12.6 L61.6 25.4 L71 20.6 L66.4 31.4 Q69.6 37 69 44 Q64.6 36 58.6 34.4 L55.6 38.6 L51.6 33.6 L47 38.6 L43 33.6 L38.6 38 Q34 38.6 31 44Z" fill="${c}"/><path d="M40 24 L44 30 M51.6 14 L51 28 M61 20 L57 28" fill="none" stroke-width=".7" opacity=".5"/>`,
  });
  // hats that leave the hair on show (the hair keeps its shine)
  const NOCOVER = new Set(['ribbon', 'headband', 'bandana', 'hairclip', 'goggletop', 'dotband']);
  // hats that draw their own highlight
  const HAT_OWNSHINE = new Set(['gaucho', 'johnny', 'gyro', 'dio', 'zebra', 'furspike', 'pocohelm', 'bmhood', 'robincap', 'biker', 'peaked', 'nethelm', 'bolero', 'hairclip', 'serrated', 'dotband', 'dotcap', 'goggletop']);
  // hairstyles that draw no generic shine
  const HAIR_NOSHINE = new Set(['mikeo', 'dothan', 'grid', 'patchy', 'sukuna', 'marco', 'sandman']);
  Object.assign(hats, {
    // Diego: riding helmet with the letters DIO loosely mounted on bent pins
    dio: (c, c2) => `<path d="M41 17.4 q-3 -2.4 -.6 -4.6 q2.2 -2.2 -.8 -4.2 M50 13.8 q2.4 -1.6 0 -3.4 q-2.2 -1.6 0 -3.2 M59 17.4 q3 -2.4 .6 -4.6 q-2.2 -2.2 .8 -4.2" fill="none" stroke-width="1.1"/>
      <g font-family="Rye,Oswald,Impact,serif" font-weight="700" font-size="7.6" text-anchor="middle" fill="${c2}" stroke-width=".9" paint-order="stroke"><text x="39.2" y="9.6" transform="rotate(-14 39.2 7)">D</text><text x="50" y="7.4">I</text><text x="60.8" y="9.6" transform="rotate(14 60.8 7)">O</text></g>
      <path d="M27.4 45.4 Q25.4 15.4 50 13.4 Q74.6 15.4 72.6 45.4 Q50 39 27.4 45.4Z" fill="${c}"/>
      <path d="M50 13.8 V39.4 M39 15.6 Q35.6 27 37.2 41.4 M61 15.6 Q64.4 27 62.8 41.4" fill="none" stroke-width=".8" opacity=".55"/><circle cx="50" cy="14" r="1.8" fill="${shade(c)}" stroke-width="1"/>
      <path d="M33.6 28 Q37 19 46 16.4" fill="none" stroke="#fff" stroke-width="1.8" opacity=".45" stroke-linecap="round"/>
      <path d="M28.8 44 Q50 36 71.2 44 Q72 47 70 47.4 Q50 41.4 30 47.4 Q28 47 28.8 44Z" fill="${shade(c)}"/>
      ${MIR(`<path d="M28.6 47.4 Q30 57 35.6 64.6" fill="none" stroke-width="1.2"/>`)}`,
    // Mountain Tim: zebra-print cowboy hat with a little cow skull
    zebra: (c, c2, p, id) => {
      const crown = 'M30 38.4 Q29 12 50 12.6 Q71 12 70 38.4Z', brim = 'M6 40 Q18 29 30 35.4 Q50 41.4 70 35.4 Q82 29 94 40 Q72 50.6 50 46.4 Q28 50.6 6 40Z';
      return `<clipPath id="${id}z"><path d="${crown}"/><path d="${brim}"/></clipPath><path d="${crown}" fill="${c}"/><path d="${brim}" fill="${c}"/>
        <g clip-path="url(#${id}z)"><path d="M33 38 Q30 26 35 14 M39 38 Q37 28 41 18 Q43 24 42 30 M47 36 Q45 24 48 13 M54 37 Q56 26 53 14 M61 38 Q63 28 59 18 Q58 25 60 31 M67 38 Q70 26 65 14 M10 38 Q16 42 13 46 M18 34 Q24 40 21 47 M26 34 Q30 42 28 48 M74 34 Q70 42 72 48 M82 34 Q76 40 79 47 M90 38 Q84 42 87 46" fill="none" stroke="${c2}" stroke-width="2.3" stroke-linecap="round"/></g>
        <path d="${crown}" fill="none"/><path d="${brim}" fill="none"/><path d="M40 14.6 Q50 21.6 60 14.6" fill="none" stroke-width="1.4"/>
        <path d="M30.6 34.4 Q50 39.6 69.4 34.4 L69.8 38 Q50 43.4 30.2 38Z" fill="#6a4a2a"/>
        <path d="M46.6 31 Q43 31 41.6 27.6 M53.4 31 Q57 31 58.4 27.6" fill="none" stroke-width="2.4" stroke-linecap="round"/><path d="M46.6 31 Q43 31 41.6 27.6 M53.4 31 Q57 31 58.4 27.6" fill="none" stroke="#f6ecd8" stroke-width="1.1" stroke-linecap="round"/>
        <path d="M46.8 29.6 Q50 27.6 53.2 29.6 L52.8 33.6 Q51.8 36 50 36 Q48.2 36 47.2 33.6Z" fill="#f6ecd8" stroke-width="1"/><path d="${dotD([[48.6, 31.4], [51.4, 31.4]])}" stroke-width="1.3" stroke-linecap="round"/><path d="M49.4 34.4 h1.2" stroke-width=".6"/>`;
    },
    // Hot Pants: fur cap with a single spike
    furspike: (c, c2) => `<path d="M28.6 42 Q27.4 19 50 17.4 Q72.6 19 71.4 42Z" fill="${c}"/><path d="M36 26 l1 3 M44 22 l.6 3 M56 22 l-.6 3 M64 26 l-1 3 M40 32 l.8 3 M60 32 l-.8 3 M50 27 v3" fill="none" stroke-width=".8" opacity=".6"/>
      <path d="${furD(25.6, 74.4, x => 43.4 - 3.4 * (1 - ((x - 50) / 24.4) ** 2), x => 48.4 - 3.4 * (1 - ((x - 50) / 24.4) ** 2), 9)}" fill="${c}"/>
      <path d="M47.2 18.6 L50 1.6 L52.8 18.6Z" fill="${c2}"/><path d="M49.3 16 L50 5" stroke="#fff" stroke-width=".9" opacity=".7"/><ellipse cx="50" cy="18.4" rx="4.4" ry="1.8" fill="${shade(c2)}"/>`,
    // Pocoloco: leather aviator helmet covered in oval pieces
    pocohelm: (c, c2) => MIR(`<path d="M26.6 46 Q25 58 28.6 66 Q32 68.4 34.6 64 L33.6 52 L30.4 46Z" fill="${c}"/><path d="M31 64.4 Q33 71 37.6 75.4" fill="none" stroke-width="1.2"/>`)
      + `<path d="M26.4 52 Q24 17 50 15.4 Q76 17 73.6 52 L69.6 52 Q70 40 64.4 36.6 Q50 31.6 35.6 36.6 Q30 40 30.4 52Z" fill="${c}"/>
      <g fill="${c2}" stroke-width="1">${[[38, 25, -30], [50, 21, 0], [62, 25, 30], [31.4, 36, -62], [68.6, 36, 62], [44, 29.6, -12], [56, 29.6, 12], [28.4, 46, -84], [71.6, 46, 84]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="2.1" transform="rotate(${a} ${x} ${y})"/>`).join('')}</g>
      <path d="M50 15.6 V20 M34 30 Q40 22 48 19" fill="none" stroke-width=".8" opacity=".5"/><path d="M36 22 Q41 18 46 17" fill="none" stroke="#fff" stroke-width="1.4" opacity=".4" stroke-linecap="round"/>`,
    // Blackmore: hooded poncho with his ponytail threaded through the top
    bmhood: (c, c2, p) => `<path d="M18 112 L21 52 Q19 12 50 10.6 Q81 12 79 52 L82 112 L68 112 L70 56 Q69 34.6 50 32.6 Q31 34.6 30 56 L32 112Z" fill="${c}"/>
      <path d="M30 56 Q31 34.6 50 32.6 Q69 34.6 70 56" fill="none" stroke="#4a5a9a" stroke-width="1.4"/><path d="M26 60 Q24 84 26 108 M74 60 Q76 84 74 108" fill="none" stroke-width=".8" opacity=".5"/>
      <ellipse cx="50" cy="12.6" rx="3.6" ry="1.8" fill="${INK}"/>
      <path d="M49 12.4 Q52 2 64 4 Q78 8 82 22 Q86 36 80 50 Q79 36 72 26 Q64 16 53 14Z" fill="${p && p.hair || c2}"/><path d="M60 7 Q72 10 78 22 M56 11 Q68 14 74 26" fill="none" stroke-width=".7" opacity=".55"/>
      <ellipse cx="52" cy="10.4" rx="2.8" ry="2" transform="rotate(-30 52 10.4)" fill="${c2}" stroke-width="1"/>`,
    // Mrs. Robinson: dark head covering with a crest of hair left along the top
    robincap: (c, c2, p) => `<path d="M28 45 Q26.6 18 50 16 Q73.4 18 72 45 Q50 38.6 28 45Z" fill="${c}"/><path d="M45 39 L41.6 31 L45.6 29.6 L42 21 L47 20 L46 10 L51 14.6 L53.6 5.6 L55 16 L59 18 L55.6 26.6 L59 30 L55.6 39 Q50 37 45 39Z" fill="${p && p.hair || c2}"/><path d="M50 14 V36" fill="none" stroke-width=".7" opacity=".5"/><path d="${dotD([[31, 42.6], [36, 40.8], [41.6, 39.6], [58.4, 39.6], [64, 40.8], [69, 42.6], [31.2, 32], [68.8, 32]])}" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>`,
    // Oyecomova: biker's cap with chains, spirals of hair out of the top, a sun veil of netting
    biker: (c, c2, p) => {
      const h = p && p.hair || c, sp = (x, s) => { const d = `M${x} 21 Q${x - 4 * s} 14 ${x} 10.6 Q${x + 5 * s} 9.6 ${x + 4 * s} 14.6 Q${x + 3 * s} 17.4 ${x + .8 * s} 15.4`; return `<path d="${d}" fill="none" stroke-width="4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${h}" stroke-width="2.2" stroke-linecap="round"/>`; };
      let net = ''; for (let x = 33; x <= 67; x += 3.4) net += `M${f2(x)} 42.4V${f2(63 - Math.abs(x - 50) * .06)}`; for (let y = 45; y <= 62; y += 3.4) net += `M31 ${f2(y)}H69`;
      return `<path d="M30 40 L31.4 19.6 Q50 13.4 68.6 19.6 L70 40Z" fill="${c}"/><ellipse cx="40" cy="18.6" rx="2.6" ry="1.3" fill="${INK}"/><ellipse cx="60" cy="18.6" rx="2.6" ry="1.3" fill="${INK}"/>${sp(40, -1)}${sp(60, 1)}
        <path d="M31.4 27 Q50 22.4 68.6 27" fill="none" stroke-width="1"/><path d="M31 31 Q50 26.6 69 31 M32 25 Q42 36 50 30 Q58 36 68 25" fill="none" stroke="${c2}" stroke-width="1.6" stroke-dasharray="1.6 1"/>
        <path d="M29.6 38 Q50 33.6 70.4 38 L72.4 44 Q50 39 27.6 44Z" fill="${INK}"/><path d="M34 40 Q50 36.8 66 40" fill="none" stroke="#fff" stroke-width=".8" opacity=".35"/>
        <path d="M30.4 43.4 Q50 39.4 69.6 43.4 L68.4 63 Q50 66.6 31.6 63Z" fill="${INK}" fill-opacity=".07" stroke-width=".6" opacity=".7"/><path d="${net}" fill="none" stroke-width=".35" opacity=".35"/>`;
    },
    // Stroheim: officer's peaked cap with the eagle
    peaked: (c, c2) => `<path d="M23.6 31.4 Q27 13 50 11.4 Q74 12.4 77.4 27.6 Q71 34.4 50 35.4 Q31 35.2 23.6 31.4Z" fill="${c}"/><path d="M30 20 Q38 14 50 13.6" fill="none" stroke="#fff" stroke-width="1.4" opacity=".3" stroke-linecap="round"/>
      <path d="M30.6 30.6 Q50 35.6 69.4 30.6 L69.4 38.8 Q50 43 30.6 38.8Z" fill="${shade(c)}"/><path d="M31 33.4 Q50 38 69 33.4" fill="none" stroke="#e8e8e8" stroke-width=".9"/>
      <path d="M31.4 38.4 Q50 43.2 68.6 38.4 Q66.4 46 50 46.2 Q33.6 46 31.4 38.4Z" fill="${c2}"/><path d="M38 42.6 Q50 45 62 42.6" fill="none" stroke="#fff" stroke-width="1" opacity=".35"/><path d="M31.4 38.4 Q50 42.8 68.6 38.4" fill="none" stroke="#d8dce8" stroke-width="1.1"/>
      <path d="M50 22.4 l-7.4 -3 2.6 3.4 -3.8 -.2 4.6 2.8 4 .6 4 -.6 4.6 -2.8 -3.8 .2 2.6 -3.4Z" fill="#d8dce8" stroke-width=".7"/><path d="M50 23.4 v3.6" stroke-width="1"/>
      <circle cx="50" cy="36.4" r="2" fill="#d8dce8" stroke-width=".9"/><circle cx="50" cy="36.4" r=".8" fill="#c8323c" stroke="none"/>`,
    // Axl RO: thick round helmet under a net, red leather straps
    nethelm: (c, c2, p, id) => {
      const dome = 'M23.4 45 Q21 11 50 10 Q79 11 76.6 45 Q50 38.4 23.4 45Z';
      let net = ''; for (let k = -24; k <= 96; k += 6) net += `M${k} 8l40 40M${k + 40} 8l-40 40`;
      return `<clipPath id="${id}n"><path d="${dome}"/></clipPath><path d="${dome}" fill="${c}"/><g clip-path="url(#${id}n)"><path d="${net}" fill="none" stroke="${c2}" stroke-width="1.1"/><path d="M29 25 l6 1.6 -2 4Z M57 16 l7 1 -1 5Z M63 33 l6 -1 1 4Z M37 35 l5 -3 2 4Z" fill="#d8c8a0" stroke-width=".6"/><path d="M28 30 Q34 16 48 13" fill="none" stroke="#fff" stroke-width="2" opacity=".25"/></g><path d="${dome}" fill="none"/>
        <path d="M19.4 44.6 Q50 36 80.6 44.6 L80.4 49.4 Q50 41 19.6 49.4Z" fill="${shade(c)}"/>`
        + MIR(`<path d="M25.6 48.6 Q27.6 60 35 69" fill="none" stroke-width="3"/><path d="M25.6 48.6 Q27.6 60 35 69" fill="none" stroke="#b8323c" stroke-width="1.6"/>`) + `<rect x="33.6" y="66.6" width="3" height="3" fill="#f2c14e" stroke-width=".8"/>`;
    },
    // Magent Magent: flat bolero hat
    bolero: (c, c2) => `<path d="M33.4 37.6 L34.6 17.4 L65.4 17.4 L66.6 37.6Z" fill="${c}"/><path d="M34.6 17.4 Q50 13.6 65.4 17.4 Q50 20.6 34.6 17.4Z" fill="${shade(c)}"/><path d="M33.8 31 L66.2 31 L66.6 36.6 L33.4 36.6Z" fill="${c2}"/>
      <path d="M38 22 Q40 20 44 19.6" fill="none" stroke="#fff" stroke-width="1.4" opacity=".35"/><path d="M6 40 Q50 29.6 94 40 Q50 49 6 40Z" fill="${c}"/><path d="M12 40.4 Q50 32.4 88 40.4" fill="none" stroke-width=".8" opacity=".5"/>`,
    // D-I-S-C-O: the big rectangular hair clip
    hairclip: (c, c2) => `<g transform="rotate(-24 64 33)"><rect x="57" y="29.6" width="14" height="7" rx="1.4" fill="${c}"/><path d="M59 31.8 H69 M59 34.4 H69" stroke="${c2}" stroke-width="1"/><path d="M58.4 30.8 h4" stroke="#fff" stroke-width=".8" opacity=".6"/></g>`,
    // Steven Steel: a smooth cap with a serrated edge over his bald head
    serrated: (c, c2) => { let z = ''; for (let i = 1; i <= 12; i++) z += `L${f2(70.6 - i * 3.43)} ${i % 2 ? 41.8 : 45.6}`; return `<path d="M29.4 45.6 Q28 19 50 17.4 Q72 19 70.6 45.6${z}Z" fill="${c}"/><path d="M36 27 Q42 20.6 52 19.6" fill="none" stroke="#fff" stroke-width="1.8" opacity=".45" stroke-linecap="round"/><path d="M31.6 39.4 Q50 34 68.4 39.4" fill="none" stroke="${c2}" stroke-width="1"/>`; },
    // Dot Han: dark strap low across the forehead, cut into segments
    dotband: (c, c2, p) => `<path d="M29.6 42 Q50 36.4 70.4 42 L70.8 48 Q50 42.4 29.2 48Z" fill="${c}"/><path d="${[36, 42, 48, 54, 60, 66].map(x => `M${x - 1.2} ${f2(43.4 - 2.8 * (1 - ((x - 50) / 20.4) ** 2))}h2.4v2.4h-2.4Z`).join('')}" fill="${p && p.skin || c2}" stroke-width=".6"/>`,
    // Andre Boomboom: dotted cap with ribbons
    dotcap: (c, c2) => MIR(`<path d="M31 40 Q20 46 20 64 Q24 58 27 56 Q25 64 27 70 Q30 58 33 48Z" fill="${c2}" stroke-width="1.4"/>`)
      + `<path d="M27.6 43 Q26.4 18 50 16 Q73.6 18 72.4 43 Q50 37 27.6 43Z" fill="${c}"/><path d="${[[36, 26], [44, 21], [56, 21], [64, 26], [40, 34], [50, 28], [60, 34], [32, 38], [68, 38]].map(([x, y]) => circD(x, y, 1.5)).join('')}" fill="#3fc8d8" stroke-width=".6"/><path d="M27 42 Q50 36 73 42 L73.4 46 Q50 40 26.6 46Z" fill="${shade(c)}"/>`,
    // L.A. Boomboom: goggles pushed up on the head
    goggletop: (c, c2) => `<path d="M28.6 38 Q50 26 71.4 38" fill="none" stroke-width="4.4"/><path d="M28.6 38 Q50 26 71.4 38" fill="none" stroke="#6a4a2a" stroke-width="2.6"/>` + MIR(`<circle cx="41.4" cy="29.6" r="5.6" fill="${c}"/><circle cx="41.4" cy="29.6" r="3.8" fill="${c2}" stroke-width="1.2"/><path d="M39.4 27.8 l2 -1.4" stroke="#fff" stroke-width="1" stroke-linecap="round"/>`),
  });
  Object.assign(EYES, {
    void: { w: 'M34.8 55 A6.2 4.4 0 1 1 47.2 55 A6.2 4.4 0 1 1 34.8 55Z', i: [41.4, 55, 3.9], l: 'M33.2 54 Q41 47 48.6 54 L47.2 54.4 Q41 49 34.6 54.6Z', x: '' },
    small: { w: 'M35 55.2 Q41 52.4 47 55.2 Q41 57.8 35 55.2Z', i: [41.4, 55.2, 1.5], l: 'M33 54.2 Q41 50.2 48.6 54.4 L47 55.2 Q41 52.2 34.6 55.4Z', x: `<path d="M36 57.8 Q41 59.2 46 57.8" fill="none" stroke="${INK}" stroke-width=".8"/>` },
  });
  BROWS.none = ' ';
  Object.assign(MOUTHS, {
    // GO! GO! ZEPPELI on the gold teeth
    zeppeli: p => `<path d="M41.6 70.8 Q50 68.8 58.4 70.8 Q57 78 50 78.4 Q43 78 41.6 70.8Z" fill="#4a1020" stroke="${INK}" stroke-width="1.2"/><path d="M42.6 71.2 Q50 69.8 57.4 71.2 L56.8 74.4 Q50 73.4 43.2 74.4Z" fill="#f2c14e" stroke="${INK}" stroke-width=".7"/><text x="50" y="73.7" font-size="2.7" text-anchor="middle" font-family="Oswald,Impact,sans-serif" font-weight="700" fill="${INK}">GO!GO!</text><path d="M44.6 76 Q50 77.2 55.4 76 L54.6 77.4 Q50 78 45.4 77.4Z" fill="#f2c14e" stroke="${INK}" stroke-width=".5"/><path d="M40.8 70.6 Q45.4 67.8 50 69 Q54.6 67.8 59.2 70.6 Q50 69.6 40.8 70.6Z" fill="${p.lip}" stroke="${INK}" stroke-width="1"/><path d="M43.8 77.6 Q50 81 56.2 77.6 Q50 79.2 43.8 77.6Z" fill="${p.lip}" stroke="${INK}" stroke-width="1"/><path d="M47.6 80.6 l.3 1.4 M50 81 v1.6 M52.4 80.6 l-.3 1.4" stroke="${INK}" stroke-width=".6"/>`,
    // a wide toothy grin
    wide: () => `<path d="M38.6 69.4 Q50 72 61.4 69.4 Q59 79.6 50 80 Q41 79.6 38.6 69.4Z" fill="#fff" stroke="${INK}" stroke-width="1.3"/><path d="M39.6 72.8 Q50 75.4 60.4 72.8 M42.6 70.4 V77 M46.2 71 V79 M50 71.2 V79.6 M53.8 71 V79 M57.4 70.4 V77" fill="none" stroke="${INK}" stroke-width=".7"/><path d="M36.6 68.4 l2.4 1.4 M63.4 68.4 l-2.4 1.4" stroke="${INK}" stroke-width="1" stroke-linecap="round"/>`,
  });
  Object.assign(FACIAL, {
    // Gyro: four square patches of beard along each side of the jaw
    jawsquares: p => MIR(`<path d="${[[35.8, 64, 70], [37.8, 69.4, 58], [40.8, 73.8, 42], [44.8, 77, 25]].map(([x, y, a]) => sqD(x, y, 2.8, a)).join('')}" fill="${p.hair}" stroke="${INK}" stroke-width=".8"/>`),
    // Ringo: long thin mustache, skull-shaped soul patch, slim patches bordering the chin
    ringo: p => `<path d="M44.6 69.6 Q47 68 50 69 Q53 68 55.4 69.6 Q59 70 61 75 Q58 71.4 55 70.6 Q52 70 50 70.2 Q48 70 45 70.6 Q42 71.4 39 75 Q41 70 44.6 69.6Z" fill="${p.hair}" stroke="${INK}" stroke-width=".8"/><path d="M48.2 77.2 Q50 75.8 51.8 77.2 Q52.4 79 51.2 79.8 L51.2 81 L48.8 81 L48.8 79.8 Q47.6 79 48.2 77.2Z" fill="${p.hair}" stroke="${INK}" stroke-width=".7"/><path d="${dotD([[49.2, 78], [50.8, 78]])}" stroke="${INK}" stroke-width=".9" stroke-linecap="round"/>` + MIR(`<path d="M41.4 76.6 Q44 81.4 47.6 82.8 L47.8 81.8 Q44.6 80.4 42.6 76.2Z" fill="${p.hair}" stroke="${INK}" stroke-width=".7"/>`),
    shortbeard: p => `<path d="M35.6 65 Q37.4 80 50 84.4 Q62.6 80 64.4 65 Q61 73.6 56.4 75.4 Q50 73 43.6 75.4 Q39 73.6 35.6 65Z" fill="${p.hair}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/><path d="M42 79 l1 2.4 M50 80 v2.6 M58 79 l-1 2.4" stroke="#fff" stroke-width=".6" opacity=".3"/>` + extras.mustache(p),
    stubbybeard: p => FACIAL.stubble(p) + `<path d="M41 69.8 Q45.4 67 50 68.8 Q54.6 67 59 69.8 Q54.6 70.6 50 70.4 Q45.4 70.6 41 69.8Z" fill="${p.hair}" stroke="${INK}" stroke-width=".9"/><path d="M44 77.6 Q50 76 56 77.6 L54.6 82.4 Q50 84.4 45.4 82.4Z" fill="${p.hair}" stroke="${INK}" stroke-width=".9"/>`,
  });
  const SPECIAL = {
    johnny: { body: (p, id) => inBody(id, 'j', `<path d="M0 99 H100 M0 106.6 H100 M0 114.2 H100" stroke="${p.outfit2}" stroke-width="3.4"/>`) + `<path d="${starD(56.6, 84.6, 2.4)}" fill="${shade(p.skin)}" stroke="${INK}" stroke-width=".6"/>` },
    gyro: {
      body: (p, id) => `<pattern id="${id}sb" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.25" fill="#d8dce8" stroke="${INK}" stroke-width=".5"/></pattern>` + inBody(id, 'g', `<rect x="0" y="86" width="100" height="34" fill="url(#${id}sb)"/>`)
        + inkG(MIR(`<path d="M7 120 Q8 100 22 93.4 Q32 89 40.6 88.4 L37 97 Q26 100 21.6 110 L20 120Z" fill="${p.outfit2}" stroke-width="1.8"/><path d="M20 120 Q22 104 34 99 M12 112 Q16 100 26 95" fill="none" stroke-width=".8" opacity=".5"/>`) + steelBall(84, 106, 7)),
    },
    diego: { body: (p, id) => inBody(id, 'd', `<path d="${diagD(8)}" fill="none" stroke="${p.outfit2}" stroke-width="1.2" opacity=".85"/>`) },
    dino: { face: () => `<path d="M42 52.8 V57.6 M58 52.8 V57.6" stroke="${INK}" stroke-width="1.5"/><path d="M44.4 71.6 L45.6 76.2 L47 72Z M53 72 L54.4 76.2 L55.6 71.6Z" fill="#fff" stroke="${INK}" stroke-width=".7"/><path d="M36 44 l2 -2.4 2 2.4 2 -2.4 2 2.4 M56 44 l2 -2.4 2 2.4 2 -2.4 2 2.4" fill="none" stroke="#3a6a2a" stroke-width="1"/><path d="${dotD([[47.4, 64.6], [52.6, 64.6]])}" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>` },
    valentine: {
      behind: () => { let s = ''; for (let i = 0; i < 7; i += 2) { const y = f2(13.4 + i * 6.86); s += `M0 ${y}Q25 ${f2(y - 7)} 50 ${y}T100 ${y}`; }
        return `<g stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"><path d="M0 10 Q25 3 50 10 T100 10 V58 Q75 51 50 58 T0 58Z" fill="#f6f2e4"/><path d="${s}" fill="none" stroke="#c8323c" stroke-width="6.86" stroke-linecap="butt"/><path d="M0 10 Q14 5.4 30 6.2 V33.6 Q14 32.8 0 37Z" fill="#1f2a6a"/><path d="${dotD([[5, 12], [11, 11], [17, 10], [23, 10], [8, 18], [14, 17], [20, 16.6], [26, 16.4], [5, 24], [11, 23], [17, 22.6], [23, 22.4], [8, 30], [14, 29.4], [20, 29], [26, 28.6]])}" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M0 10 Q25 3 50 10 T100 10 V58 Q75 51 50 58 T0 58Z" fill="none"/></g><path d="M0 10 Q25 3 50 10 T100 10 V58 Q75 51 50 58 T0 58Z" fill="${INK}" opacity=".12"/>`; },
      body: () => inkG(MIR(`<path d="M41 86 Q34 92 30 106 L38 102 L45 91Z" fill="#f6f2e4" stroke-width="1.6"/>`) + `<path d="M43.4 88.4 Q50 93 56.6 88.4 L58.6 94.4 Q55 92.6 53.4 96.6 Q51.4 93.6 50 97.4 Q48.6 93.6 46.6 96.6 Q45 92.6 41.4 94.4Z" fill="#fff"/><path d="M42.6 95.6 Q46 94 47.6 98.6 Q49 95 50 99.6 Q51 95 52.4 98.6 Q54 94 57.4 95.6 L58.4 102 Q55 100.6 53.6 104.6 Q52 101.6 50 105.4 Q48 101.6 46.4 104.6 Q45 100.6 41.6 102Z" fill="#fff"/><path d="M42.4 103 Q46 101.6 47.6 106 Q49 103 50 107.6 Q51 103 52.4 106 Q54 101.6 57.6 103 L57 110 Q53 108 50 112 Q47 108 43 110Z" fill="#fff"/>`),
      face: () => `<path d="M50 78.6 q-.5 1.6 0 3" fill="none" stroke="${INK}" stroke-width=".9" stroke-linecap="round"/>`,
    },
    tim: { body: (p, id) => inkG(inBody(id, 't', MIR(`<path d="M0 120 L0 96 Q14 91 25 93.4 Q29.6 108 30 120Z" fill="#f2c14e" stroke-width="1.4"/>${leopard([[6, 101], [14, 98], [11, 108], [20, 105], [22, 114], [6, 114], [15, 117]])}`)) + `<path d="${starD(37.4, 105, 5.4)}" fill="#f2c14e" stroke-width="1.2"/><path d="${circD(37.4, 105, 1.4)}" fill="none" stroke-width=".6"/><path d="M35.6 101.4 l1.4 -.6" stroke="#fff" stroke-width=".8"/>`) },
    hotpants: { body: (p, id) => inkG(inBody(id, 'h', `<path d="M14 88 V120 M22 88 V120 M30 88 V120 M70 88 V120 M78 88 V120 M86 88 V120" stroke="${p.outfit2}" stroke-width="3.2"/>`) + `<path d="${furD(35, 65, x => 86.6 + ((x - 50) / 15) ** 2 * 2.4, x => 92.4 + ((x - 50) / 15) ** 2 * 3, 7)}" fill="#f6ecd8" stroke-width="1.2"/>` + metalFlower(36, 104, 4, '#d8b040') + metalFlower(64, 104, 4, '#d8b040') + metalFlower(26, 112, 3, '#c8ccd8') + metalFlower(74, 112, 3, '#c8ccd8')) },
    poco: { body: p => inkG(MIR(`<path d="M8 120 Q10 101 22 95 Q25.4 106 24 120Z" fill="${p.skin}" stroke-width="1.8"/><path d="M14 110 Q17 104 21 102" fill="none" stroke-width=".8" opacity=".5"/>`) + `<path d="M24 96 L60 120 M76 96 L40 120" fill="none" stroke-width="5.2"/><path d="M24 96 L60 120 M76 96 L40 120" fill="none" stroke="${p.outfit2}" stroke-width="3.2"/><rect x="46.6" y="105.4" width="6.8" height="6" rx="1.2" fill="#b8c8e0" stroke-width="1.2"/><rect x="48.6" y="107.2" width="2.8" height="2.4" fill="none" stroke-width=".7"/>`) },
    weka: { body: (p, id) => `<pattern id="${id}wd" width="11" height="10" patternUnits="userSpaceOnUse"><circle cx="3.4" cy="3.4" r="2.2" fill="#e8742a"/><circle cx="5.2" cy="4.6" r="2.1" fill="#6ab8e8" opacity=".85"/></pattern>` + inBody(id, 'w', `<rect y="86" width="100" height="34" fill="url(#${id}wd)"/>`)
      + inkG(MIR(`<path d="M47 97 Q39 94 34.6 100.6 Q41 103.4 47.4 99Z" fill="#f6ecd8" stroke-width="1"/><path d="M47 98 L37 100.4" fill="none" stroke-width=".6"/>`) + `<path d="M47.8 90.6 L52.2 90.6 L53.6 105 L50 110.6 L46.4 105Z" fill="#6ab8e8" stroke-width="1.2"/><path d="M47.6 89 H52.4 L51.6 92.6 H48.4Z" fill="#4a98c8" stroke-width="1"/>`) },
    lucy: { body: () => inkG(`<path d="M40 86.6 Q43.6 94.6 50 91.6 Q56.4 94.6 60 86.6 Q50 90.6 40 86.6Z" fill="#fff" stroke-width="1.2"/>` + rose(30, 104, 3.4) + rose(69, 108, 3.4) + rose(46, 114, 3) + `<path d="${circD(18, 112, 1.6)}${circD(82, 112, 1.6)}${circD(58, 102, 1.3)}" fill="#f2c14e" stroke-width=".7"/>`) },
    sandman: { body: p => inkG(`<path d="M35 90 Q50 95 65 90 L60 120 L40 120Z" fill="${p.skin}" stroke-width="1.6"/><path d="M44 102 Q50 106 56 102" fill="none" stroke-width=".8" opacity=".6"/><path d="M39.4 91 L40 120 M60.6 91 L60 120" fill="none" stroke="${p.outfit2}" stroke-width="1.4" stroke-dasharray="1.4 2"/><path d="M39.6 84 Q50 90 60.4 84 L62.6 92 Q50 99 37.4 92Z" fill="${p.outfit2}" stroke-width="1.8"/><path d="M39 88.4 l2.4 2.4 2.4 -3 2.4 3 2.4 -3 2.4 3 2.4 -3 2.4 3 2.4 -3 2.4 2.4" fill="none" stroke-width="1.1"/><path d="M42 106 l1.4 1.6 3 -3.4 M42 110 l1.4 1.6 3 -3.4 M42 114 l1.4 1.6 3 -3.4" fill="none" stroke-width="1.1"/>` + MIR(`<path d="${circD(15, 110, 3.6)}" fill="none" stroke="#3a6a3a" stroke-width="1"/><path d="M13 111 q1 -2 2 0 t2 0" fill="none" stroke="#3a6a3a" stroke-width=".8"/>`)) },
    ringo: { body: p => inkG(MIR(`<path d="M42.6 90 L36.6 72.6 Q38.4 70.6 41 72 L45.4 88Z" fill="${p.outfit}" stroke-width="1.6"/>`) + `<path d="M50 92 V120" fill="none" stroke-width="1"/><path d="${dotD([[52.6, 100], [52.6, 108], [52.6, 116]])}" stroke-width="1.8"/><path d="M8 120 Q10 104 18 98 M92 120 Q90 104 82 98" fill="none" stroke-width=".9" opacity=".5"/>`) },
    blackmore: { body: () => { const d = [96, 102, 108, 114].map(y => circD(42, y, 1.7) + circD(58, y, 1.7)).join(''); return inkG(`<path d="${d}" fill="none" stroke-width="2.6"/><path d="${d}" fill="none" stroke="#f2c14e" stroke-width="1.2"/>`); } },
    robinson: {
      under: () => `<path d="M52.4 49.6 Q58 43 66.6 47.4 Q71 54 66.4 60.4 Q60 64.4 54 60.6 Q50.6 56 52.4 49.6Z" fill="${INK}" opacity=".88"/><path d="M60 62.6 L61 67 M64.6 60.8 L66.8 64" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>`,
      face: () => MIR(`<path d="M31.6 62 V67.4" stroke="${INK}" stroke-width=".8"/><path d="${circD(30.6, 68.6, 1.7)}${circD(32.9, 70, 1.6)}${circD(31, 71.9, 1.5)}" fill="#fff" stroke="${INK}" stroke-width=".7"/><path d="${dotD([[30.6, 68.6], [32.9, 70], [31, 71.9]])}" stroke="#6a3a8a" stroke-width="1.4" stroke-linecap="round"/>`),
      body: p => inkG(`<path d="M36 89.4 Q50 93.4 64 89.4 L59 120 L41 120Z" fill="${p.skin}" stroke-width="1.6"/><path d="M42 102 Q46 106 50 102 Q54 106 58 102 M50 96 V110" fill="none" stroke-width=".8" opacity=".6"/><path d="${[[30, 98, 2], [24, 104, 1.4], [34, 108, 1.6], [28, 114, 2.2], [70, 98, 2], [76, 104, 1.4], [66, 108, 1.6], [72, 114, 2.2]].map(([x, y, r]) => circD(x, y, r)).join('')}" fill="#f2c14e" stroke-width=".9"/><path d="M12 104 L44 120" stroke-width="5.4" fill="none"/><path d="M12 104 L44 120" stroke="#c8408a" stroke-width="3.6" fill="none"/><text x="27" y="112.8" font-size="2.7" font-family="Oswald,Impact,sans-serif" font-weight="700" fill="#fff" stroke="none" transform="rotate(26.6 27 112)" text-anchor="middle">TRUE LOVE</text>`),
    },
    ferdinand: {
      face: () => MIR(`<path d="M35.4 57.6 Q41 61 46.8 57.4" fill="none" stroke="${INK}" stroke-width="1.5"/><path d="M36.6 58.8 l-.8 1.6 M39 59.8 l-.4 1.8 M41.6 60 v1.8 M44 59.6 l.4 1.6" stroke="${INK}" stroke-width=".7"/>`),
      body: p => inkG(MIR(`<path d="M38 88.6 Q30 94 26 120 L36 120 Q36 100 44 90Z" fill="${p.outfit}" stroke-width="1.6"/><path d="${circD(33.4, 106, 1.5)}${circD(32.4, 114, 1.5)}" fill="#a0d040" stroke-width=".8"/>`) + rose(44, 94, 3, '#f050a0') + rose(56, 94, 3, '#f050a0') + rose(50, 100, 3.2, '#f050a0')),
    },
    oyecomova: {
      under: () => `<path d="M32.6 50.4 Q50 46.4 67.4 50.4 L67 58.6 Q50 55.4 33 58.6Z" fill="#3a5ab0" opacity=".7"/><path d="${starD(38.6, 63.6, 2.4)}${starD(61.4, 63.6, 2.4)}" fill="#f6f2f4" stroke="#3a5ab0" stroke-width=".7"/><path d="M45 78 L45.6 81.4 M48.4 79 V82.4 M51.6 79 V82.4 M55 78 L54.4 81.4" stroke="#3a5ab0" stroke-width="1.4" stroke-linecap="round"/>`,
      body: () => inkG(`<path d="${circD(55, 84, 3)}" fill="#f6f2e8" stroke="#3a7a4a" stroke-width="1"/><path d="M55 82 V84 L56.4 85" fill="none" stroke="#3a7a4a" stroke-width=".8"/><path d="M38 88.6 L50 104 L62 88.6" fill="none" stroke="#f2c14e" stroke-width="1" stroke-dasharray="1.6 1.2"/><path d="M20 102 Q30 98 36 104 M80 102 Q70 98 64 104" fill="none" stroke="#f2c14e" stroke-width="1" stroke-dasharray="1.6 1.2"/>`),
    },
    porkpie: { body: () => inkG(`<path d="${dotD([[40, 98], [40, 104], [40, 110], [40, 116], [60, 98], [60, 104], [60, 110], [60, 116]])}" stroke="#f2c14e" stroke-width="2.4"/>` + MIR(`<path d="M12 104 Q10 94 18 92 Q16 98 22 96 Q20 100 26 98 Q24 104 16 106Z" fill="#a0d060" stroke-width="1.2"/>`)) },
    stroheim: {
      face: () => `<path d="M34 60.4 L40.4 59.4 L41 66.4 L35.4 67.4Z" fill="#b8bcc8" stroke="${INK}" stroke-width="1"/><path d="${dotD([[35.4, 61.2], [39.4, 60.6], [36.4, 66], [39.8, 65.4]])}" stroke="${INK}" stroke-width="1" stroke-linecap="round"/>`,
      body: () => inkG(`<path d="M47.6 92 L52.4 92 L51.6 95.6 L55 94.8 L55 99.6 L51.6 98.8 L52.4 102.4 L47.6 102.4 L48.4 98.8 L45 99.6 L45 94.8 L48.4 95.6Z" fill="${INK}" stroke="#e8e8e8" stroke-width=".8"/>`),
    },
    axl: {
      under: p => `<path d="M28 26 H72 V58.8 Q64 56.6 60 59.4 Q56 57 52 59.6 L50 58 L48 59.6 Q44 57 40 59.4 Q36 56.6 28 58.8Z" fill="${INK}" opacity=".92"/>` + MIR(`<path d="M34.6 58 Q33.6 66.6 38.6 70.4 Q37.4 65 39.6 61.4 Q38 60 38 58Z" fill="${INK}" opacity=".92"/>`) + `<path d="${dotD([[40, 40], [44, 37], [56, 37], [60, 40], [50, 42], [37, 46], [63, 46], [45, 44], [55, 44]])}" stroke="${p.skin}" stroke-width="1.3" stroke-linecap="round"/>`,
      body: p => inkG(MIR(`<path d="${sqD(17, 104, 8, -30)}" fill="#5a7a7a" stroke-width="1.2"/>`) + `<path d="M36 88 L50 104 L64 88 Q50 92 36 88Z" fill="${p.outfit2}" stroke-width="1.6"/><path d="${sqD(46, 106, 4.4, 0)}${sqD(54, 106, 4.4, 0)}${sqD(50, 110.6, 4.4, 0)}" fill="${p.outfit2}" stroke-width="1"/>`),
    },
    mikeo: {
      face: () => MIR(`<path d="M34 53.4 Q30.4 46 35.6 40.6 Q40.4 36.6 42.6 39.6 Q43.6 42.4 40.6 42.4 Q39 41.6 40 40.4" fill="none" stroke="#f070b0" stroke-width="1.6" stroke-linecap="round"/><path d="M34.4 58 Q33 64.6 38 66.6 Q41.4 67.2 41.2 64.2 Q40.6 62.6 39.2 63.6" fill="none" stroke="#f070b0" stroke-width="1.6" stroke-linecap="round"/>`) + `<path d="M36 33 Q42 29.4 48 30" fill="none" stroke="#fff" stroke-width="1.4" opacity=".35" stroke-linecap="round"/>`,
      body: p => inkG(MIR(`<path d="M37.6 93 Q28 96 22 104 L30 106 Q34 98 42 96Z" fill="${shade(p.outfit)}" stroke-width="1.4"/>`) + `<path d="M39.6 85 Q50 91 60.4 85 L62.4 93 Q50 99.4 37.6 93Z" fill="${p.outfit2}" stroke-width="1.8"/><path d="M42 90 Q50 94 58 90" fill="none" stroke-width=".8" opacity=".5"/><path d="M50 99 V120" fill="none" stroke-width="3.6"/><path d="M50 99 V120" fill="none" stroke="#a0a060" stroke-width="2.2" stroke-dasharray="1.6 1"/>`),
    },
    magent: { body: (p, id) => inkG(inBody(id, 'm', `<path d="${diagD(9)}" fill="none" stroke-width=".7" opacity=".45"/><path d="${dotD([[20, 104], [29, 113], [71, 104], [80, 113], [38, 104], [62, 104]])}" stroke="#c8a0e0" stroke-width="2"/>`) + `<path d="${furD(30, 70, x => 86 + ((x - 50) / 20) ** 2 * 5, x => 94 + ((x - 50) / 20) ** 2 * 3, 9)}" fill="#f0a0c8" stroke-width="1.2"/><path d="M46.4 94.6 L53.6 94.6 L52.2 102 L50 106 L47.8 102Z" fill="${p.outfit2}" stroke-width="1.1"/><path d="${circD(50, 99, 1.4)}" fill="#f2c14e" stroke-width=".7"/>`) },
    disco: { body: p => inkG(MIR(`<rect x="26" y="104" width="12" height="9" rx="1" fill="${shade(p.outfit)}" stroke-width="1.2"/><path d="M25.6 104 H38.4 L37.6 107.4 H26.4Z" fill="${p.outfit}" stroke-width="1.1"/>`) + `<path d="${circD(46, 100, 1.5)}${circD(46, 110, 1.5)}${circD(54, 100, 1.5)}${circD(54, 110, 1.5)}" fill="${INK}" stroke="#f2c14e" stroke-width=".7"/>`) },
    sugar: { body: (p, id) => inkG(inBody(id, 's', MIR(`<path d="M0 120 L0 96 Q14 91 25 93.4 Q29.6 108 30 120Z" fill="#a0a8e8" stroke-width="1.4"/>${leopard([[6, 101], [14, 98], [11, 108], [20, 105], [22, 114], [6, 114], [15, 117]])}`)) + `<path d="M41 86 Q50 94 59 86 L50 98Z" fill="${p.hatColor || '#b8a0e0'}" stroke-width="1.4"/><path d="M43 90 Q46 98 49.4 100 M57 90 Q54 98 50.6 100" fill="none" stroke="#c0a040" stroke-width=".8"/><path d="${[[47.4, 101], [52.6, 101], [50, 104], [45.2, 104], [54.8, 104], [47.6, 107.2], [52.4, 107.2], [50, 110.2]].map(([x, y]) => circD(x, y, 2.1)).join('')}" fill="#8ad060" stroke-width=".8"/><path d="M50 98.6 l2.6 -2.4 1.6 2Z" fill="#3a8c4a" stroke-width=".7"/>`) },
    steven: {
      face: () => MIR(`<rect x="36.4" y="52.4" width="10" height="5.4" rx=".8" fill="#fff" fill-opacity=".2" stroke="${INK}" stroke-width="1.3"/><path d="M36.4 54 L32 53" stroke="${INK}" stroke-width="1.1"/><path d="M38 53.6 l2 -.6" stroke="#fff" stroke-width=".8" opacity=".7"/>`) + `<path d="M46.4 54.6 Q50 53.4 53.6 54.6" fill="none" stroke="${INK}" stroke-width="1.1"/>`,
      body: p => inkG(MIR(`<path d="M42.6 90 L36 74 Q38.4 72.4 41.4 74 L46 89Z" fill="${p.outfit2}" stroke-width="1.6"/><path d="M36.6 76 l-2.6 3.6 M38 80.4 l-2.8 3.4 M39.4 85 l-2.8 3" fill="none" stroke="#f2c14e" stroke-width="1.4"/><path d="${dotD([[33.8, 80], [35, 84.2], [36.4, 88.4]])}" stroke="#f2c14e" stroke-width="2.2"/>`)),
    },
    marco: { body: () => inkG(`<path d="M36 102 L64 102 L66 120 L34 120Z" fill="#7a4a2a" stroke-width="1.6"/><path d="M36.4 102.6 L31 91.4 M63.6 102.6 L69 91.4" fill="none" stroke-width="4.2"/><path d="M36.4 102.6 L31 91.4 M63.6 102.6 L69 91.4" fill="none" stroke="#7a4a2a" stroke-width="2.6"/><path d="${circD(38.6, 104.6, 1.4)}${circD(61.4, 104.6, 1.4)}" fill="#f2c14e" stroke-width=".8"/><path d="M44 108 H56 V114 H44Z" fill="none" stroke-width=".8" opacity=".6"/>`) },
    norisuke: {
      face: () => MIR(`<path d="${circD(41.4, 55.4, 3.8)}" fill="${INK}" stroke="${INK}" stroke-width="1"/><path d="M39.8 53.8 l1.8 -1" stroke="#fff" stroke-width=".8" opacity=".6"/><path d="M37.6 55 L32.4 53.6" stroke="${INK}" stroke-width="1"/>`) + `<path d="M45.2 55 Q50 53.4 54.8 55" fill="none" stroke="${INK}" stroke-width="1"/>`,
      body: (p, id) => `<pattern id="${id}cm" width="3.2" height="3.2" patternUnits="userSpaceOnUse"><circle cx="1.6" cy="1.6" r="1.1" fill="none" stroke="${INK}" stroke-width=".45" opacity=".7"/></pattern>` + inkG(inBody(id, 'n', [[24, 106, 9], [44, 112, 8], [68, 104, 9], [84, 114, 7], [57, 118, 6]].map(([x, y, r]) => `<path d="${circD(x, y, r)}" fill="#a8a898" stroke-width="1.2"/><path d="${circD(x, y, r)}" fill="url(#${id}cm)" stroke="none"/>`).join(''))),
    },
    dothan: { body: p => inkG(MIR(`<path d="M40.4 86 L34 96 L44 94 L47 88Z" fill="${p.outfit}" stroke-width="1.4"/>`) + `<path d="M30 110 Q50 104 70 110" fill="none" stroke-width=".8" opacity=".5"/>`) },
    boom: { body: (p, id) => `<pattern id="${id}bd" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.15" fill="#3fc8d8"/><circle cx="5.5" cy="5.5" r="1.15" fill="#3fc8d8"/></pattern>` + inBody(id, 'b', `<rect y="86" width="100" height="34" fill="url(#${id}bd)"/>`) },
    target: { body: () => inkG(`<path d="${circD(50, 107, 8.4)}" fill="#f2c14e" stroke-width="1.4"/><path d="${circD(50, 107, 5.8)}" fill="#3fc8d8" stroke-width="1"/><path d="${circD(50, 107, 3.4)}" fill="${INK}" stroke-width="1"/><path d="${circD(50, 107, 1.3)}" fill="#f2c14e" stroke="none"/>`) },
    benjamin: { hideMouth: true, face: () => `<path d="M35.4 68 Q37.6 79.6 50 83.4 Q62.4 79.6 64.6 68 Q58 72.4 50 72.4 Q42 72.4 35.4 68Z" fill="#c8ccd8" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M39 73.6 Q50 77.6 61 73.6 M41.6 77.6 Q50 81 58.4 77.6 M44.4 74.6 V79.6 M50 75.6 V81.4 M55.6 74.6 V79.6" fill="none" stroke="${INK}" stroke-width=".8"/><path d="${dotD([[38.6, 70.6], [61.4, 70.6], [50, 74.8]])}" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/><path d="M40 71.4 Q44 73.4 48 73.8" fill="none" stroke="#fff" stroke-width="1" opacity=".7"/>` },
    andre: {
      face: () => `<path d="${dotD([[35.6, 61], [37.8, 61], [40, 61.2], [42.2, 61.4], [44.4, 61.6], [55.6, 61.6], [57.8, 61.4], [60, 61.2], [62.2, 61], [64.4, 61], [37, 63.6], [39.4, 63.8], [41.8, 64], [58.2, 64], [60.6, 63.8], [63, 63.6], [47.6, 60], [50, 59.6], [52.4, 60]])}" stroke="#8a4a2a" stroke-width=".95" stroke-linecap="round" opacity=".75"/>`,
      body: p => inkG(MIR(`<path d="M18 120 Q20 100 30 94 Q36 91 41 90.4 L46 120Z" fill="${p.outfit2}" stroke-width="1.4"/>`)),
    },
    sukuna: { body: p => inkG(`<path d="M40 84 Q50 92 60 84 L61 91 Q50 98 39 91Z" fill="${INK}" stroke-width="1.2"/><path d="M40 92 L55 118 M60 92 L50 106" fill="none" stroke-width="1.4"/>`) },
    agent: { body: () => inkG(`<path d="M48 90.4 L52 90.4 L53.2 106 L50 110 L46.8 106Z" fill="#8a1a2a" stroke-width="1.2"/><path d="M47.8 89 H52.2 L51.4 92 H48.6Z" fill="#6a1020" stroke-width="1"/>`) },
  };

  /** register extra portrait configs from other files */
  function addPortrait(o) { Object.assign(P, o); }
  function portrait(key, opts = {}) {
    const p = Object.assign({}, P[key] || P.bandit, opts.override || {});
    const id = nid('pt');
    const bg = p.bg || ['#6b5bd6', '#e8508a'];
    const hs = p.hairStyle || 'short';
    const acc = p.acc || [], accHas = k => acc.some(a => ACC[a] && ACC[a][k]);
    const face = FACES[p.face] || 'M32 48 Q32 30 50 28 Q68 30 68 48 L67 62 Q64 76 50 82 Q36 76 33 62 Z';
    const eyeStroke = p.extra === 'scales' || key === 'diegodino' ? `<path d="M41 52 L41 58 M59 52 L59 58" stroke="${INK}" stroke-width="1.6"/>` : '';
    const eyes = p.extra === 'shades' || accHas('hideEyes') ? '' : EYES[p.eyes] ? eyeSet(EYES[p.eyes], p, id) : `
      <path d="M35 55 Q41 50 47 55 Q41 58 35 55Z" fill="#fff" stroke="${INK}" stroke-width="1.2"/>
      <path d="M53 55 Q59 50 65 55 Q59 58 53 55Z" fill="#fff" stroke="${INK}" stroke-width="1.2"/>
      <circle cx="41.5" cy="54.6" r="2.4" fill="${p.eye}" stroke="${INK}" stroke-width=".6"/><circle cx="58.5" cy="54.6" r="2.4" fill="${p.eye}" stroke="${INK}" stroke-width=".6"/>
      <circle cx="41.5" cy="54.6" r="1" fill="${INK}"/><circle cx="58.5" cy="54.6" r="1" fill="${INK}"/>
      <circle cx="40.6" cy="53.7" r=".7" fill="#fff"/><circle cx="57.6" cy="53.7" r=".7" fill="#fff"/>
      ${eyeStroke}
      <path d="M32.5 53.5 Q41 46.5 48.5 53 L47 53.6 Q41 49.5 34 54.6Z" fill="${INK}"/>
      <path d="M51.5 53 Q59 46.5 67.5 53.5 L66 54.6 Q59 49.5 53 53.6Z" fill="${INK}"/>
      <path d="M32.6 53.4 l-2.2 -1.6 M67.4 53.4 l2.2 -1.6" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M37 57.6 l-.6 1.2 M40 58.1 l-.3 1.2 M60 58.1 l.3 1.2 M63 57.6 l.6 1.2" stroke="${INK}" stroke-width=".7"/>
      <path d="M34.8 51.2 Q41 47.4 47.2 50.8 M52.8 50.8 Q59 47.4 65.2 51.2 M36.6 59.2 Q41 60.6 45.4 59 M54.6 59 Q59 60.6 63.4 59.2" fill="none" stroke="${INK}" stroke-width=".6" opacity=".5"/>`;
    const sps = [].concat(p.special || []).map(k => SPECIAL[k]).filter(Boolean);
    const spL = layer => sps.map(s => s[layer] ? s[layer](p, id) : '').join('');
    const bw = BROWS[p.brows], brows = bw ? (Array.isArray(bw) ? MIR(bw[0]) + bw[1] : MIR(typeof bw === 'function' ? bw(p) : bw)) : `<path d="M33 47.5 Q39 44.5 47 48.6 L46.4 49.8 Q39 47 33.6 48.8Z" fill="${INK}"/><path d="M67 47.5 Q61 44.5 53 48.6 L53.6 49.8 Q61 47 66.4 48.8Z" fill="${INK}"/>`;
    const nose = NOSES[p.nose] || `<path d="M51 52 Q52.5 58 51.5 63" fill="none" stroke="${INK}" stroke-width=".7" opacity=".55"/><path d="M50 57 L47.5 65 L51.5 66" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/><path d="M52.5 64.5 l1.6 .6" stroke="${INK}" stroke-width=".9" stroke-linecap="round"/>`;
    // default mouth: full JoJo lips, a cupid's bow, the little ink lines under the lower lip
    const lips = (p.extra === 'mask' || accHas('hideMouth') || sps.some(s => s.hideMouth)) ? '' : MOUTHS[p.mouth] ? MOUTHS[p.mouth](p) : `<path d="M43.2 72 Q46.6 70 48.8 70.8 Q50 70.2 51.2 70.8 Q53.4 70 56.8 72 Q50 72.8 43.2 72Z" fill="${p.lip}" stroke="${INK}" stroke-width="1"/><path d="M44.4 72.4 Q50 73.2 55.6 72.4 Q54 76.2 50 76.4 Q46 76.2 44.4 72.4Z" fill="${p.lip}" stroke="${INK}" stroke-width="1"/><path d="M42.8 72 Q50 73 57.2 72" fill="none" stroke="${INK}" stroke-width="1.1" stroke-linecap="round"/><ellipse cx="51.4" cy="74.4" rx="2" ry=".7" fill="#fff" opacity=".65"/><path d="M47.8 77.8 l.3 1.3 M50 78.2 v1.5 M52.2 77.8 l-.3 1.3" stroke="${INK}" stroke-width=".6" opacity=".7"/>`;
    const dark = shade(p.skin);
    const hatch = `<path d="M58 29.5 Q68 32 68 48 L67 62 Q64 76 50 82 Q59 71 61 57 Q63 42 58 29.5Z" fill="${dark}" opacity=".45"/>
      <path d="M58 29.5 Q68 32 68 48 L67 62 Q64 76 50 82 Q59 71 61 57 Q63 42 58 29.5Z" fill="url(#${id}t)" opacity=".26"/>
      ${hs === 'bald' && !p.hat ? '' : `<path d="M28 34 Q50 28 72 34 L72 42 Q50 36.8 28 42Z" fill="url(#${id}t)" opacity=".18"/>`}
      <path d="M44.6 79.6 Q50 82.4 55.4 79.6 L55 83 L45 83Z" fill="${dark}" opacity=".35"/>
      <path d="M33.5 62 Q36 72 44 78 Q38 70 37 62Z" fill="${dark}" opacity=".35"/>
      <g stroke="${INK}" stroke-width=".7" opacity=".5">${[0,1,2,3].map(i=>`<path d="M${62-i*.6} ${61+i*2.6} l4 -2.2"/>`).join('')}${[0,1,2].map(i=>`<path d="M${36+i*.6} ${62+i*2.6} l-3 -1.8"/>`).join('')}<path d="M44 42 l3 -1 M53 41 l3 1" opacity=".6"/></g>`;
    const neckShade = `<path d="M42 78 L58 78 L58 86 Q50 84 42 81Z" fill="${dark}" opacity=".7"/><path d="M42 78 L58 78 L58 90 L42 90Z" fill="url(#${id}t)" opacity=".22"/><path d="M45.2 81.6 L46 89 M54.8 81.6 L54 89" fill="none" stroke="${INK}" stroke-width=".6" opacity=".45"/>`;
    const hairShine = hs === 'bald' ? `<path d="M40 34 Q48 30 56 32" stroke="#fff" stroke-width="1.6" opacity=".45" fill="none"/>` : `<g fill="none" stroke-linecap="round"><path d="M38 33 Q46 28 56 30" stroke="#fff" stroke-width="2" opacity=".4"/><path d="M42 36 Q48 33 54 34" stroke="#fff" stroke-width="1.2" opacity=".3"/></g>`;
    const hairStrands = ['long', 'verylong', 'shaggy', 'bob', 'bobbang', 'flowing'].includes(hs) ? `<g stroke="${INK}" stroke-width=".8" opacity=".45" fill="none">${['verylong', 'long', 'flowing'].includes(hs) ? '<path d="M24 60 Q22 80 24 96"/><path d="M76 60 Q78 80 76 96"/><path d="M28 70 Q27 84 29 94"/><path d="M72 70 Q73 84 71 94"/>' : '<path d="M27 52 Q25 62 27 70"/><path d="M73 52 Q75 62 73 70"/>'}</g>` : '';
    const folds = `<g stroke="${INK}" stroke-width="1" opacity=".5" fill="none"><path d="M24 108 Q30 100 34 96"/><path d="M76 108 Q70 100 66 96"/><path d="M30 118 Q34 110 40 106"/><path d="M70 118 Q66 110 60 106"/></g><path d="M8 120 Q12 94 50 88 Q30 98 26 120Z" fill="#000" opacity=".12"/><path d="M92 120 Q88 94 50 88 Q70 98 76 120Z" fill="url(#${id}t)" opacity=".22"/>`;
    const hatSvg = p.hat && hats[p.hat] ? hats[p.hat](p.hatColor, p.hat2, p, id) : '';
    const ex = p.extra && extras[p.extra] ? extras[p.extra](p) : '';
    const exBehind = ['feather', 'rain', 'bugs', 'balloon', 'hook'].includes(p.extra);
    const exOnTop = ['flag', 'heart', 'cross', 'scarf', 'halo'].includes(p.extra);
    const exFace = !exBehind && !exOnTop;
    const cut = STYLES[p.style] ? STYLES[p.style](p, id) : null;
    const faceHatch = `<clipPath id="${id}f"><path d="${face}"/></clipPath><g clip-path="url(#${id}f)">${hatch}${spL('under')}</g>`;
    const facial = [].concat(p.facial || []).map(k => FACIAL[k] ? FACIAL[k](p) : '').join(''), mark = [].concat(p.marks || []).map(k => MARKS[k] ? MARKS[k](p) : '').join('');
    const covered = p.hat && hats[p.hat] && !NOCOVER.has(p.hat);
    return `<svg class="portrait" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>
        <pattern id="${id}d" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="${INK}" opacity=".18"/></pattern>
        <pattern id="${id}t" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="1.1" cy="1.1" r=".55" fill="${INK}"/></pattern>
      </defs>
      ${opts.nobg ? '' : `      <rect width="100" height="120" fill="url(#${id}g)"/>
      <path d="M62 0 L100 0 L100 120 L28 120Z" fill="${bg[1]}" opacity=".5"/>
      <rect width="100" height="120" fill="url(#${id}d)"/>
      <g fill="#fff" opacity=".35">${[[10,14,3],[88,22,2.4],[14,96,2],[90,90,3],[80,8,1.6]].map(([x,y,r])=>`<path d="M${x} ${y-r} l${r*.3} ${r*.7} ${r*.75} .1 -${r*.6} ${r*.5} .25 ${r*.75} -${r*.7} -${r*.42} -${r*.7} ${r*.42} .25 -${r*.75} -${r*.6} -${r*.5} ${r*.75} -.1z"/>`).join('')}</g>
      <g stroke="#fff" stroke-width="1" opacity=".25">${[0,1,2,3,4,5,6,7].map(i=>`<path d="M50 60 L${50+Math.cos(i*0.785)*90} ${60+Math.sin(i*0.785)*90}"/>`).join('')}</g>`}
      ${spL('behind')}${exBehind ? ex : ''}${accLayer(p, 'behind')}
      <g stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round">
        ${hairBack[hs] ? hairBack[hs](p.hair, p, id) : ''}
        ${cut ? cut.u : `<path d="M8 120 Q12 94 50 88 Q88 94 92 120 Z" fill="${p.outfit}"/>
        <path d="M38 88 L50 104 L62 88" fill="${p.outfit2}"/>`}
        <path d="M42 76 L42 90 L58 90 L58 76 Z" fill="${p.skin}"/>
      </g>
      ${folds}${neckShade}${cut && cut.o ? `<g stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round">${cut.o}</g>` : ''}${applyDeco(p, 'body')}${accLayer(p, 'body')}${spL('body')}
      <g stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round">
        <path d="${face}" fill="${p.skin}"/>
        <path d="M33 52 Q28 56 32 62" fill="${p.skin}"/><path d="M67 52 Q72 56 68 62" fill="${p.skin}"/>
      </g>
      <path d="M31.8 54.6 Q30.2 57 31.8 59.8 M68.2 54.6 Q69.8 57 68.2 59.8" fill="none" stroke="${INK}" stroke-width=".8" opacity=".7"/>
      ${hairStrands}${faceHatch}${eyes}${brows}${nose}${mark}${lips}${facial}${spL('face')}
      ${exFace ? ex : ''}${applyDeco(p, 'face')}${accLayer(p, 'face')}
      <g stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round">
        ${hairFront[hs] ? hairFront[hs](p.hair, p, id) : ''}
      </g>
      ${spL('front')}${covered || HAIR_NOSHINE.has(hs) ? '' : hairShine}
      <g stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round">
        ${hatSvg}
      </g>
      ${hatSvg && !HAT_OWNSHINE.has(p.hat) ? `<g fill="none" stroke="#fff" stroke-linecap="round" opacity=".35"><path d="M36 22 Q44 16 54 16" stroke-width="2"/></g>` : ''}
      ${exOnTop ? ex : ''}${accLayer(p, 'top')}${spL('top')}
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
    // optional markings (blaze, socks, patches, stitches, scales): passed in, or borrowed from the SBR.HORSES entry with these colours
    const mk = opts.marks || ((SBR.HORSES && Object.values(SBR.HORSES).find(h => h.marks && h.coat === coat && h.mane === mane && h.wrap === wrap)) || {}).marks || {};
    const sock = (x, y) => mk.socks ? `<path d="M${x-3.4} ${y+17} L${x+4.7} ${y+17} L${x+4} ${y+26} L${x-2} ${y+26}Z M${x-2.6} ${y+34} L${x+3.4} ${y+34} L${x+3} ${y+38} L${x-3} ${y+38}Z" fill="${mk.socks}"/>` : '';
    const leg = (x, y, cls, back) => `<g class="leg ${cls}" style="transform-origin:${x}px ${y}px"><path d="M${x-6} ${y} L${x+6} ${y} L${x+4} ${y+26} L${x+3} ${y+38} L${x-3} ${y+38} L${x-2} ${y+26}Z" fill="${back ? shade(coat) : coat}" stroke="${INK}" stroke-width="${SW}"/>${sock(x, y)}<path d="M${x+2} ${y+4} Q${x+4} ${y+14} ${x+2} ${y+22}" stroke="${INK}" stroke-width=".9" opacity=".4" fill="none"/><rect x="${x-3.5}" y="${y+26}" width="7" height="8" fill="${wrap}" stroke="${INK}" stroke-width="1.4"/><path d="M${x-3.5} ${y+29} h7 M${x-3.5} ${y+32} h7" stroke="${INK}" stroke-width=".6" opacity=".45"/><path d="M${x-4} ${y+38} L${x+4} ${y+38} L${x+5} ${y+43} L${x-5} ${y+43}Z" fill="${INK}"/><path d="M${x-3} ${y+40} h4" stroke="#8a8a9a" stroke-width="1"/></g>`;
    const num = opts.num != null ? opts.num : ([...(coat + mane + wrap)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 89) + 1;
    const light = (() => { const v = parseInt(coat.slice(1), 16); return ((v >> 16) + ((v >> 8) & 255) + (v & 255)) / 3 > 150; })();
    const blanket = `<path d="M78 52 L114 50 L116 73 Q96 78 76 73Z" fill="${wrap}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M78 55 L114 53 M77 70 Q96 74 115 70" stroke="#f6ecd8" stroke-width="1.6" fill="none"/>
        <path d="M77 66 ${Array.from({ length: 9 }, (_, i) => `L${80 + i * 4} ${i % 2 ? 62 : 66}`).join(' ')} L115 66" stroke="#f6ecd8" stroke-width="1.4" fill="none" opacity=".85"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${79 + i * 4.8} ${74 + (i % 2)} v3" stroke="${INK}" stroke-width="1"/>`).join('')}
        <rect x="77" y="61" width="14" height="11" rx="1.5" fill="#f6f2e4" stroke="${INK}" stroke-width="1.4"/><text x="84" y="70" font-size="8" text-anchor="middle" font-family="Oswald,'Arial Narrow',sans-serif" font-weight="700" fill="${INK}">${num}</text>`;
    const tack = `<path d="M158 13 L167 37" stroke="${INK}" stroke-width="3.2" fill="none"/><path d="M158 13 L167 37" stroke="#6a3a1a" stroke-width="1.6" fill="none"/>
        <path d="M155 17 L165 13" stroke="#6a3a1a" stroke-width="2.4"/><path d="M178 31 L173 43" stroke="${INK}" stroke-width="3.2"/><path d="M178 31 L173 43" stroke="#6a3a1a" stroke-width="1.6"/>
        <path d="M167 37 L176 36" stroke="#6a3a1a" stroke-width="1.8"/><circle cx="176" cy="41" r="2.4" fill="#d0d4e0" stroke="${INK}" stroke-width="1.2"/><circle cx="165.5" cy="13.4" r="1.4" fill="#f2c14e" stroke="${INK}" stroke-width=".6"/>`;
    const face = `<path d="M164 22 Q168 19 172 22" stroke="${INK}" stroke-width="1.4" fill="none"/><circle cx="168" cy="24" r="2.2" fill="${INK}"/><circle cx="167.3" cy="23.2" r=".8" fill="#fff"/>
        <path d="M183 38 q2 -2 3 1" stroke="${INK}" stroke-width="1.4" fill="none"/><path d="M178 44 L186 43" stroke="${INK}" stroke-width="1" opacity=".6"/>
        <path d="M156 30 Q162 34 172 32" stroke="${INK}" stroke-width=".9" opacity=".35" fill="none"/>`;
    const muscle = `<g stroke="${INK}" stroke-width="1" opacity=".35" fill="none"><path d="M128 60 Q136 70 132 82"/><path d="M62 62 Q56 72 64 84"/><path d="M84 84 Q100 90 118 84"/></g>
        <path d="M60 80 Q100 94 138 82 Q110 90 70 88Z" fill="${INK}" opacity=".14"/><path d="M60 58 Q90 48 124 52" stroke="#fff" stroke-width="2" opacity="${light ? '.35' : '.2'}" fill="none"/>`;
    const maneStrands = `<g stroke="${INK}" stroke-width=".8" opacity=".45" fill="none"><path d="M148 22 Q142 32 138 42"/><path d="M144 26 Q138 38 132 50"/></g>`;
    const tailStrands = `<g stroke="${INK}" stroke-width=".8" opacity=".45" fill="none"><path d="M48 64 Q30 70 26 92"/><path d="M44 68 Q34 76 32 88"/></g>`;
    const spotSvg = (spots ? [[80,62],[96,70],[70,74],[110,58],[118,72],[88,78]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="${spots}"/>`).join('') : '')
      + (mk.patches ? `<g fill="${mk.patches}"><path d="M60 58 Q76 50 90 58 Q92 72 76 80 Q58 78 54 68Z"/><path d="M112 64 Q128 58 138 68 Q136 84 118 86 Q106 80 112 64Z"/><path d="M134 46 Q142 34 150 36 Q150 50 142 60 Q134 56 134 46Z"/></g>` : '')
      + (mk.scales ? `<g stroke="${mk.scales}" stroke-width="1.3" fill="none" opacity=".8">${[[62,64],[70,72],[66,80],[78,80],[114,62],[122,70],[118,78],[130,72],[138,48],[144,40],[140,58]].map(([x,y])=>`<path d="M${x} ${y} q3 -4 6 0 q3 -4 6 0"/>`).join('')}</g>` : '')
      + (mk.stitches ? `<g stroke="${INK}" fill="none">${[[62,58,76,88],[118,52,126,86],[140,40,150,58]].map(([x1,y1,x2,y2])=>{ const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy), nx=-dy/L*3, ny=dx/L*3; return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke-width="1.4"/>` + [1,2,3,4,5].map(i=>{ const px=x1+dx*i/6, py=y1+dy*i/6; return `<path d="M${(px-nx).toFixed(1)} ${(py-ny).toFixed(1)} L${(px+nx).toFixed(1)} ${(py+ny).toFixed(1)}" stroke-width="1.1"/>`; }).join(''); }).join('')}</g>` : '');
    const blazeSvg = mk.blaze ? `<path d="M162 18 Q166 15 170 19 L185 35 Q185 39 181 39 L165 24Z" fill="${mk.blaze}"/>` : '';
    const saddleC = opts.saddle || '#c8a040';
    const riderSvg = rider ? `<g class="rider">
        <path class="cape" d="M100 30 Q70 20 50 30 Q60 36 56 44 Q76 40 98 44Z" fill="${rider.cape || '#3a8c4a'}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M99 50 L95 70 L102 71 L107 53Z" fill="${rider.legs || '#3a2a3a'}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M93 67 L103 67 L106 74 L91 74Z" fill="#5a3a20" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="91" cy="72" r="2" fill="none" stroke="#d0d4e0" stroke-width="1.2"/>
        <path d="M94 50 Q92 34 102 28 Q112 30 112 44 L110 56 Z" fill="${rider.body || '#3b5bb5'}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M102 30 L104 44 M97 46 L111 47" stroke="${INK}" stroke-width=".9" opacity=".45" fill="none"/>
        <circle cx="106" cy="22" r="7" fill="${rider.skin || '#f6d2b0'}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M110 22 l1.6 .4" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M96 20 Q106 8 116 20 Z M92 20 L120 19" fill="${rider.hat || '#5b3a8c'}" stroke="${INK}" stroke-width="${SW}"/><path d="M97.5 18.4 Q106 16 114.5 18.2" stroke="${rider.band || '#f2c14e'}" stroke-width="1.6" fill="none"/>
        <path d="M104 40 L120 36 L134 42" stroke="${INK}" stroke-width="2" fill="none"/><circle cx="134" cy="42" r="2.4" fill="${rider.skin || '#f6d2b0'}" stroke="${INK}" stroke-width="1.2"/>
      </g>` : '';
    const reinPath = rider ? 'M176 41 Q156 58 134 42' : 'M176 41 Q150 62 110 50';
    const reins = `<path d="${reinPath}" stroke="${INK}" stroke-width="2.6" fill="none"/><path d="${reinPath}" stroke="#8a5a30" stroke-width="1.2" fill="none"/>` +
      (rider ? '' : `<path d="M104 62 V73" stroke="${INK}" stroke-width="2"/><path d="M99 78 h10 M100 78 q4 -8 8 0" stroke="${INK}" stroke-width="2.6" fill="none"/><path d="M100 78 q4 -8 8 0" stroke="#9aa0b0" stroke-width="1.1" fill="none"/>`);
    return `<svg class="horse-svg" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g class="horse-body">
        ${leg(68, 80, 'bl', true)}${leg(134, 80, 'fl', true)}
        <path class="tail" d="M52 60 Q34 56 22 70 Q14 88 24 104 Q28 86 38 78 Q46 70 56 68Z" fill="${mane}" stroke="${INK}" stroke-width="${SW}"/>
        ${tailStrands}
        <path d="M50 62 Q56 46 100 48 Q130 46 142 54 Q152 70 140 84 Q110 92 70 88 Q46 84 50 62Z" fill="${coat}" stroke="${INK}" stroke-width="${SW}"/>
        ${spotSvg}${muscle}
        <path d="M128 58 Q136 30 150 20 L166 28 Q158 46 148 70Z" fill="${coat}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M150 18 Q160 10 170 14 L188 36 Q190 43 183 45 L168 41 Q160 37 157 32Z" fill="${coat}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M155 15 L157 3 L163 13Z" fill="${coat}" stroke="${INK}" stroke-width="${SW}"/><path d="M157.6 7 L159 12" stroke="${INK}" stroke-width="1" opacity=".5"/>
        ${blazeSvg}${face}
        <path d="M150 20 Q140 28 134 42 Q130 52 124 58 Q132 46 136 36 Q142 24 152 16Z" fill="${mane}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M152 16 Q158 11 161 17 Q156 18 152 16Z" fill="${mane}" stroke="${INK}" stroke-width="1.4"/>
        ${maneStrands}${tack}
        ${blanket}
        <path d="M100 73 Q102 82 100 90" stroke="${INK}" stroke-width="3.6" fill="none"/><path d="M100 73 Q102 82 100 90" stroke="#6a3a1a" stroke-width="2" fill="none"/>
        <path d="M84 50 Q96 44 108 50 L110 62 Q96 66 82 62Z" fill="${saddleC}" stroke="${INK}" stroke-width="${SW}"/>
        <path d="M82 51 Q79 43 86 44 L88 50Z M106 49 L109 41 Q113 40 112 44 L109 50Z" fill="${shade(saddleC)}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M86 56 Q96 53 106 56" stroke="${INK}" stroke-width="1" stroke-dasharray="2 2" opacity=".55" fill="none"/>
        ${leg(60, 80, 'br')}${leg(126, 80, 'fr')}
        ${reins}
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
  /* ---------- per-act scene extras: landmarks, props and small animated details (css/art2.css) ---------- */
  const puffs = (x, y, n = 3, c = '#e8e0e0', dur = 5) => `<g class="sx-smoke">${Array.from({ length: n }, (_, i) => `<circle class="sx-puff" cx="${x}" cy="${y}" r="${9 + i * 2}" fill="${c}" stroke="${INK}" stroke-width="1.6" style="animation-duration:${dur}s;animation-delay:${(-i * dur / n).toFixed(2)}s"/>`).join('')}</g>`;
  const saguaro = (x, base, h, c = '#4a8a3a') => `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="M${x - 10} ${base} V${base - h + 10} Q${x} ${base - h - 6} ${x + 10} ${base - h + 10} V${base}Z M${x - 10} ${base - h * 0.45} H${x - 30} Q${x - 38} ${base - h * 0.45} ${x - 38} ${base - h * 0.55} V${base - h * 0.78} Q${x - 31} ${base - h * 0.88} ${x - 24} ${base - h * 0.78} V${base - h * 0.58} H${x - 10}Z M${x + 10} ${base - h * 0.6} H${x + 26} Q${x + 34} ${base - h * 0.6} ${x + 34} ${base - h * 0.7} V${base - h * 0.9} Q${x + 27} ${base - h} ${x + 20} ${base - h * 0.9} V${base - h * 0.72} H${x + 10}Z" fill="${c}"/></g>
    <g stroke="${INK}" stroke-width="1.2" opacity=".45"><path d="M${x - 4} ${base - 6} V${base - h + 14} M${x + 4} ${base - 6} V${base - h + 14} M${x - 31} ${base - h * 0.5} V${base - h * 0.76} M${x + 27} ${base - h * 0.65} V${base - h * 0.88}"/></g>
    <path d="M${x - 6} ${base - h + 16} V${base - 10}" stroke="#fff" stroke-width="2" opacity=".3"/><circle cx="${x}" cy="${base - h + 2}" r="4" fill="#f09ac0" stroke="${INK}" stroke-width="1.4"/>`;
  const pineTree = (x, base, h, c, snow) => `<g stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"><rect x="${x - 4}" y="${base - h * 0.18}" width="8" height="${h * 0.18}" fill="#5a3a20"/>${[0, 1, 2, 3].map(i => { const ty = base - h * 0.15 - i * h * 0.22, bw = h * (0.42 - i * 0.08); return `<path d="M${x - bw} ${ty} L${x} ${ty - h * 0.34} L${x + bw} ${ty} Q${x} ${ty - h * 0.06} ${x - bw} ${ty}Z" fill="${c}"/>${snow ? `<path d="M${x - bw * 0.7} ${ty - h * 0.08} Q${x} ${ty - h * 0.2} ${x + bw * 0.5} ${ty - h * 0.1} L${x} ${ty - h * 0.3}Z" fill="#fff" stroke-width="1.4"/>` : ''}`; }).join('')}</g>`;
  const soarBird = (c = INK) => `<svg viewBox="0 0 60 24"><path d="M2 14 Q14 2 28 12 L30 10 L32 12 Q46 2 58 14 Q46 9 34 16 L30 20 L26 16 Q14 9 2 14Z" fill="${c}"/><path d="M28 12 L30 6 L32 12" fill="${c}"/></svg>`;
  function sceneExtras(act, W, H, id) {
    const r = seeded(act * 131 + 17);
    const X = { sky: '', far: '', mid: '', ground: '', over: '' };
    if (act === 1) {
      for (let i = 0; i < 4; i++) { const x = 150 + i * 380 + r() * 120, y = 540 + r() * 30; X.ground += `<g stroke="${INK}" stroke-width="1.8">${[[-14, 0, 12, 16, -20], [8, -4, 10, 14, 15], [-2, -18, 9, 12, 0]].map(([dx, dy, rx, ry, rot]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="${rx}" ry="${ry}" fill="#6aa04a" transform="rotate(${rot} ${x + dx} ${y + dy})"/>`).join('')}<circle cx="${x - 2}" cy="${y - 32}" r="3.4" fill="#f2c14e"/><circle cx="${x + 12}" cy="${y - 18}" r="3" fill="#e8508a"/></g>`; }
      X.ground += saguaro(1480, 596, 190) + saguaro(90, 600, 120, '#3a7a30');
      X.ground += `<g transform="translate(1180 560)" stroke="${INK}" stroke-width="2.4"><path d="M-5 30 L-3 -70 H5 L5 30Z" fill="#8a6a4a"/><path d="M-4 -64 H62 L74 -54 L62 -44 H-4Z" fill="#e8c890"/><path d="M4 -34 H-58 L-70 -24 L-58 -14 H4Z" fill="#e8c890"/><text x="30" y="-49" text-anchor="middle" font-family="Rye,serif" font-size="12" fill="${INK}" stroke="none">ARIZONA</text><text x="-30" y="-19" text-anchor="middle" font-family="Rye,serif" font-size="10" fill="${INK}" stroke="none">SAN DIEGO</text></g>`;
      X.over = `<div class="sx-orbit" style="left:30%;top:16%"><div class="sx-soar">${soarBird()}</div></div>`;
    } else if (act === 2) {
      // the Mittens and Merrick Butte
      [[520, 150, 1], [860, 130, -1]].forEach(([x, h, s]) => { X.far += `<g stroke="${INK}" stroke-width="2.4"><path d="M${x - 70} 470 L${x - 60} ${470 - h * 0.55} L${x - 50} ${470 - h * 0.62} L${x + 40} ${470 - h * 0.62} L${x + 52} ${470 - h * 0.5} L${x + 70} 470Z" fill="${shade(c2(act).far)}"/><path d="M${x + s * 12} ${470 - h * 0.62} L${x + s * 14} ${470 - h} Q${x + s * 20} ${470 - h - 6} ${x + s * 26} ${470 - h} L${x + s * 30} ${470 - h * 0.62}Z" fill="${shade(c2(act).far)}"/></g><path d="M${x - 60} ${470 - h * 0.4} H${x + 56} M${x - 64} ${470 - h * 0.25} H${x + 60}" stroke="${INK}" stroke-width="1.2" opacity=".35"/>`; });
      for (let i = 0; i < 18; i++) { const x = r() * W, y = 525 + r() * 60, s = 8 + r() * 10; X.ground += `<g stroke="${INK}" stroke-width="1.4"><circle cx="${x}" cy="${y}" r="${s}" fill="#8a9a6a"/><circle cx="${x + s * 0.8}" cy="${y + 2}" r="${s * 0.7}" fill="#9aaa7a"/><path d="M${x - 2} ${y + s} l2 ${-s * 0.6} M${x + 4} ${y + s} l-1 ${-s * 0.7}" fill="none" opacity=".5"/></g>`; }
      for (let i = 0; i < 8; i++) { const x = r() * W, y = 560 + r() * 30; X.ground += `<path d="M${x} ${y} l18 -4 l10 8 l20 -2 M${x + 18} ${y - 4} l4 -10 M${x + 28} ${y + 4} l6 10" stroke="${shade(c2(act).ground)}" stroke-width="1.6" fill="none" opacity=".7"/>`; }
      X.ground += `<g transform="translate(1320 548)" stroke="${INK}" stroke-width="2">${[[0, 0, 22], [-4, -18, 16], [2, -32, 12], [-1, -42, 8]].map(([dx, dy, w]) => `<ellipse cx="${dx}" cy="${dy}" rx="${w}" ry="${w * 0.45}" fill="${['#c8844a', '#d09060', '#b87840', '#d8a070'][Math.abs(dy) % 4]}"/>`).join('')}</g>`;
      X.over = `<div class="sx-orbit" style="left:62%;top:12%"><div class="sx-soar">${soarBird('#2a1030')}</div></div>`;
    } else if (act === 3) {
      // steam train crossing the plains, red barn and hay
      const ty = 462;
      X.mid += `<path d="M0 ${ty + 6} H${W}" stroke="${INK}" stroke-width="3"/><path d="M0 ${ty + 10} H${W}" stroke="#6a5a4a" stroke-width="2" stroke-dasharray="4 8"/>`;
      const tx = 380;
      X.mid += `<g stroke="${INK}" stroke-width="2.2" stroke-linejoin="round">${[0, 1, 2].map(i => `<rect x="${tx - 250 + i * 80}" y="${ty - 38}" width="72" height="36" fill="${['#8a3a2a', '#6a5a3a', '#3a4a5a'][i]}"/><path d="M${tx - 244 + i * 80} ${ty - 30} h60" stroke="#f6ecd8" stroke-width="1.2" opacity=".5"/><circle cx="${tx - 234 + i * 80}" cy="${ty}" r="6" fill="#2a2a2a"/><circle cx="${tx - 190 + i * 80}" cy="${ty}" r="6" fill="#2a2a2a"/>`).join('')}
        <rect x="${tx - 16}" y="${ty - 54}" width="34" height="52" fill="#3a3a4a"/><rect x="${tx - 10}" y="${ty - 48}" width="12" height="12" fill="#ffd84a"/><path d="M${tx - 20} ${ty - 56} h42" stroke-width="4"/>
        <rect x="${tx + 18}" y="${ty - 34}" width="62" height="28" rx="6" fill="#2a2a3a"/><path d="M${tx + 30} ${ty - 34} v28 M${tx + 50} ${ty - 34} v28" stroke="#c0a040" stroke-width="2"/>
        <path d="M${tx + 58} ${ty - 34} L${tx + 54} ${ty - 56} H${tx + 74} L${tx + 70} ${ty - 34}Z" fill="#2a2a3a"/><circle cx="${tx + 84}" cy="${ty - 22}" r="5" fill="#ffd84a"/>
        <path d="M${tx + 80} ${ty - 6} L${tx + 100} ${ty} H${tx + 80}Z" fill="#8a3a2a"/>${[0, 24, 48].map(dx => `<circle cx="${tx + dx}" cy="${ty - 2}" r="${dx ? 9 : 7}" fill="#8a3a2a"/><circle cx="${tx + dx}" cy="${ty - 2}" r="2" fill="${INK}"/>`).join('')}</g>` + puffs(tx + 64, ty - 62, 4, '#e8e8e8', 4);
      const bx = 1180;
      X.mid += `<g stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"><path d="M${bx} 470 V${420} L${bx + 40} ${392} L${bx + 80} 420 V470Z" fill="#b83a2a"/><path d="M${bx - 6} 422 L${bx + 40} 388 L${bx + 86} 422" fill="none" stroke="#f6ecd8" stroke-width="3"/><rect x="${bx + 24}" y="436" width="32" height="34" fill="#8a2a1a"/><path d="M${bx + 24} 436 l32 34 M${bx + 56} 436 l-32 34" stroke="#f6ecd8" stroke-width="2.4"/><rect x="${bx + 34}" y="404" width="12" height="10" fill="#f6ecd8"/></g>`;
      for (let i = 0; i < 6; i++) { const x = 200 + i * 240 + r() * 80, y = 548 + r() * 30; X.ground += `<g stroke="${INK}" stroke-width="2"><path d="M${x - 22} ${y} Q${x - 24} ${y - 26} ${x} ${y - 28} Q${x + 24} ${y - 26} ${x + 22} ${y}Z" fill="#e8c860"/><path d="M${x - 14} ${y - 4} q2 -16 14 -18 M${x + 4} ${y - 2} q2 -14 10 -18" stroke="#b89830" stroke-width="1.4" fill="none"/></g>`; }
      for (let x = 20; x < W; x += 26) X.ground += `<path d="M${x} 600 l-2 -18 M${x + 6} 600 l1 -14" stroke="#5a7a2a" stroke-width="2"/>`;
    } else if (act === 4) {
      for (let x = 0; x < W; x += 22 + r() * 16) { const h = 22 + r() * 22; X.far += `<path d="M${x} 472 L${x + h * 0.3} ${472 - h} L${x + h * 0.6} 472Z" fill="#3a5a6a" stroke="${INK}" stroke-width="1.2"/>`; }
      const cx = 1060;
      X.mid += `<g stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"><rect x="${cx}" y="424" width="96" height="46" fill="#7a4a2a"/>${[432, 442, 452, 462].map(y => `<path d="M${cx} ${y} H${cx + 96}" stroke-width="1.2"/>`).join('')}<path d="M${cx - 12} 426 L${cx + 48} 390 L${cx + 108} 426Z" fill="#fff"/><rect x="${cx + 70}" y="388" width="12" height="24" fill="#6a5a5a"/><rect x="${cx + 18}" y="438" width="18" height="14" fill="#ffd84a" class="sx-win"/><rect x="${cx + 52}" y="440" width="16" height="30" fill="#4a2a1a"/></g>` + puffs(cx + 76, 380, 3, '#e8eef8', 6);
      // a frozen river winding through the snow
      X.ground += `<path d="M0 530 Q200 505 400 540 T800 548 T1200 528 T1600 530 L1600 562 Q1400 560 1200 556 T800 578 T400 572 T0 560Z" fill="#bfe0f4" stroke="${INK}" stroke-width="2.4"/><path d="M60 540 q60 -8 120 0 M520 556 q60 -6 110 2 M980 548 q50 -8 100 0 M1380 542 q50 -6 90 0" stroke="#fff" stroke-width="3" fill="none" opacity=".9"/><path d="M300 548 l30 6 l14 -8 M900 560 l20 -6 l24 8" stroke="#6a9ac8" stroke-width="1.4" fill="none"/>`;
      X.ground += pineTree(60, 600, 230, '#1f4a4a', true) + pineTree(1540, 604, 260, '#1f4a4a', true) + pineTree(1440, 596, 150, '#2a5a5a', true);
    } else if (act === 5) {
      const lx = 1360;
      X.mid += `<g stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"><path d="M${lx - 60} 480 Q${lx} 440 ${lx + 70} 480Z" fill="#4a3a3a"/><path d="M${lx - 14} 456 L${lx - 9} 356 H${lx + 9} L${lx + 14} 456Z" fill="#f6ecd8"/><path d="M${lx - 12} 430 H${lx + 12} M${lx - 11} 400 H${lx + 11}" stroke="#c8323c" stroke-width="8"/><rect x="${lx - 11}" y="336" width="22" height="20" fill="#ffe080"/><path d="M${lx - 14} 336 L${lx} 322 L${lx + 14} 336Z" fill="#c8323c"/><path d="M${lx - 16} 356 H${lx + 16}" stroke-width="3"/></g>`;
      X.mid += `<g class="sx-beam" style="transform-origin:${lx}px 346px"><path d="M${lx} 346 L${lx - 420} 300 L${lx - 420} 380Z" fill="#ffe080" opacity=".28"/></g>`;
      const sx = 420, sy = 528;
      X.ground += `<g stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"><path d="M${sx - 70} ${sy} H${sx + 80} L${sx + 60} ${sy + 22} H${sx - 56}Z" fill="#5a3a2a"/><path d="M${sx - 60} ${sy + 8} H${sx + 72}" stroke="#f2c14e" stroke-width="2"/><path d="M${sx} ${sy} V${sy - 120} M${sx + 44} ${sy} V${sy - 90}" stroke-width="3"/><path d="M${sx + 4} ${sy - 116} Q${sx + 40} ${sy - 80} ${sx + 4} ${sy - 20}Z M${sx - 4} ${sy - 108} Q${sx - 44} ${sy - 70} ${sx - 4} ${sy - 24}Z M${sx + 48} ${sy - 86} Q${sx + 78} ${sy - 56} ${sx + 48} ${sy - 16}Z" fill="#f6ecd8"/><path d="M${sx} ${sy - 120} l14 4 -14 4" fill="#c8323c"/></g>`;
      const px = 980;
      X.ground += `<g stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"><path d="M${px - 90} ${sy - 6} H${px + 90} L${px + 72} ${sy + 18} H${px - 80}Z" fill="#2a2a3a"/><rect x="${px - 60}" y="${sy - 30}" width="100" height="24" fill="#f6ecd8"/>${[0, 1, 2, 3, 4].map(i => `<circle cx="${px - 48 + i * 20}" cy="${sy - 18}" r="3.6" fill="#ffd84a"/>`).join('')}<rect x="${px - 10}" y="${sy - 66}" width="18" height="36" fill="#c8323c"/><path d="M${px - 10} ${sy - 58} h18" stroke-width="3"/><path d="M${px - 82} ${sy + 4} H${px + 80}" stroke="#c8323c" stroke-width="2"/></g>` + puffs(px, sy - 76, 4, '#d8d0d0', 5);
      for (let i = 0; i < 7; i++) X.ground += `<rect x="${1180 + i * 34}" y="${520 + (i % 2) * 4}" width="7" height="44" fill="#6a4a2a" stroke="${INK}" stroke-width="1.6"/>`;
      X.ground += `<path d="M1176 524 H1420" stroke="#8a6a4a" stroke-width="6"/><path d="M1176 524 H1420" stroke="${INK}" stroke-width="1.2" fill="none"/>`;
      X.over = `<div class="sx-gulls">${[0, 1, 2].map(i => `<svg class="sx-gull g${i}" viewBox="0 0 40 16"><path d="M2 10 Q10 2 20 9 Q30 2 38 10" fill="none" stroke="#f6ecd8" stroke-width="3" stroke-linecap="round"/><path d="M2 10 Q10 2 20 9 Q30 2 38 10" fill="none" stroke="${INK}" stroke-width="1" stroke-linecap="round"/></svg>`).join('')}</div>`;
    } else if (act === 6) {
      for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * 260, s = 1 + r() * 2.2; X.sky += `<circle class="sx-star" cx="${x}" cy="${y}" r="${s}" fill="#fff" style="animation-delay:${(-r() * 4).toFixed(2)}s"/>`; }
      // Liberty in the harbour
      const lx = 1420;
      X.far += `<g transform="translate(${lx} 470) scale(1.9) translate(${-lx} -470)"><g fill="${shade(c2(act).far)}" stroke="${INK}" stroke-width="2"><path d="M${lx - 34} 470 L${lx - 26} 420 H${lx + 26} L${lx + 34} 470Z"/><path d="M${lx - 16} 420 L${lx - 12} 380 H${lx + 12} L${lx + 16} 420Z"/><path d="M${lx - 10} 380 Q${lx - 12} 340 ${lx - 6} 326 Q${lx} 318 ${lx + 6} 326 Q${lx + 12} 340 ${lx + 10} 380Z"/><circle cx="${lx}" cy="318" r="7"/><path d="M${lx + 6} 330 L${lx + 16} 290" stroke-width="5"/><path d="M${lx + 12} 290 h9 l-2 -6 h-5z"/><path d="M${lx - 6} 312 l-4 -8 M${lx} 310 v-9 M${lx + 6} 312 l4 -8" fill="none"/></g><circle cx="${lx + 16}" cy="282" r="6" fill="#ffe080" class="sx-glow"/></g>`;
      for (let i = 0; i < 9; i++) { const x = 90 + i * 180; X.ground += `<g stroke="${INK}" stroke-width="2.2"><path d="M${x} 600 V${520}" stroke-width="4"/><path d="M${x - 10} 520 h20 l-4 -20 h-12z" fill="#2a2a3a"/><rect x="${x - 6}" y="503" width="12" height="15" fill="#ffe8a0"/></g><circle cx="${x}" cy="510" r="26" fill="#ffe8a0" opacity=".22" class="sx-glow"/>`; }
      for (let i = 0; i < 40; i++) { const x = r() * W, y = 540 + r() * 56; X.ground += `<path d="M${x} ${y} h12" stroke="#5a5070" stroke-width="3" stroke-linecap="round" opacity=".6"/>`; }
    } else if (act === 7) {
      const bx = 820, by = 560;
      X.ground += `<g stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"><path d="M${bx - 90} ${by} Q${bx} ${by - 12} ${bx + 90} ${by}" stroke-width="6" fill="none"/><path d="M${bx - 90} ${by} Q${bx} ${by - 12} ${bx + 90} ${by}" stroke="#f6ecd8" stroke-width="3" fill="none"/>${[-70, -46, -22, 2, 26, 50].map((dx, i) => `<path d="M${bx + dx} ${by - 6} Q${bx + dx - 12} ${by - 50 - i % 2 * 8} ${bx + dx + 10} ${by - 64 + i * 2}" stroke-width="6" fill="none"/><path d="M${bx + dx} ${by - 6} Q${bx + dx - 12} ${by - 50 - i % 2 * 8} ${bx + dx + 10} ${by - 64 + i * 2}" stroke="#f6ecd8" stroke-width="3" fill="none"/>`).join('')}<path d="M${bx + 96} ${by - 4} q14 -22 34 -14 q10 8 2 20 q-18 8 -36 -6z" fill="#f6ecd8"/><circle cx="${bx + 116}" cy="${by - 8}" r="4" fill="${INK}"/></g>`;
      X.over = `<div class="sx-orbit" style="left:40%;top:14%"><div class="sx-soar">${soarBird('#3a1010')}</div></div><div class="sx-orbit slow" style="left:58%;top:20%"><div class="sx-soar">${soarBird('#3a1010')}</div></div><div class="sx-haze"></div>`;
    } else if (act === 8) {
      const cx = 700, cy = 545;
      X.ground += `<g transform="translate(${cx} ${cy + 12}) scale(1.5) translate(${-cx} ${-cy - 12})"><g stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"><path d="M${cx - 46} ${cy - 44} H${cx + 46} L${cx + 36} ${cy - 4} H${cx - 36}Z" fill="#6a5a50"/><path d="M${cx - 40} ${cy - 30} H${cx + 40}" stroke="#9a8a7a" stroke-width="2"/>${[[-26, -52], [-8, -58], [10, -54], [28, -50], [0, -46]].map(([dx, dy]) => `<path d="M${cx + dx - 9} ${cy + dy + 8} l6 -10 9 2 4 8z" fill="#c8d0e0"/>`).join('')}<circle cx="${cx - 24}" cy="${cy}" r="9" fill="#2a2a2a"/><circle cx="${cx + 24}" cy="${cy}" r="9" fill="#2a2a2a"/></g></g>`;
      X.ground += `<g transform="translate(980 560) rotate(-30)" stroke="${INK}" stroke-width="2.2"><path d="M0 0 V-60" stroke-width="6"/><path d="M0 0 V-60" stroke="#8a5a30" stroke-width="3"/><path d="M-24 -54 Q0 -72 24 -54 L20 -58 Q0 -66 -20 -58Z" fill="#9aa0b0"/></g>`;
      for (let i = 0; i < 7; i++) { const x = 100 + i * 230 + r() * 60, y = 590 - r() * 20; X.ground += `<g transform="translate(${x} ${y}) scale(1.7) translate(${-x} ${-y})"><g class="sx-glow" stroke="${INK}" stroke-width="1.6">${[[-8, 0, -14], [0, 0, 0], [8, 0, 14]].map(([dx, , rot]) => `<path transform="rotate(${rot} ${x + dx} ${y})" d="M${x + dx - 4} ${y} L${x + dx} ${y - 22 - Math.abs(dx)} L${x + dx + 4} ${y}Z" fill="#b8e8ff"/>`).join('')}</g><ellipse cx="${x}" cy="${y - 10}" rx="26" ry="18" fill="#9fe0ff" opacity=".18"/></g>`; }
      X.over = `<div class="sx-drips">${[12, 31, 47, 66, 83].map((l, i) => `<i style="left:${l}%;animation-delay:${-i * 0.7}s"></i>`).join('')}</div><div class="sx-motes"></div>`;
    } else if (act === 9) {
      const hx = 1150, hy = 522;
      X.ground += `<g transform="translate(${hx} ${hy}) scale(1.5) translate(${-hx} ${-hy})"><g stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"><rect x="${hx}" y="${hy - 40}" width="54" height="40" fill="#8a3a2a"/><path d="M${hx - 6} ${hy - 38} L${hx + 27} ${hy - 58} L${hx + 60} ${hy - 38}Z" fill="#fff"/><rect x="${hx + 36}" y="${hy - 70}" width="8" height="18" fill="#5a5a6a"/><rect x="${hx + 10}" y="${hy - 28}" width="12" height="10" fill="#ffd84a" class="sx-win"/><ellipse cx="${hx - 30}" cy="${hy + 6}" rx="12" ry="4" fill="#2a4a6a"/><path d="M${hx - 30} ${hy + 4} V${hy - 30} L${hx - 10} ${hy - 48}" stroke-width="1.4" fill="none"/></g>` + puffs(hx + 40, hy - 78, 3, '#eef4ff', 6) + '</g>';
      [[380, 514, 1], [430, 518, -1], [470, 512, 1]].forEach(([x, y, s]) => { X.ground += `<g transform="translate(${x} ${y}) scale(${s * 1.1} 1.1)" fill="#3a4a5a" stroke="${INK}" stroke-width="1.2"><path d="M-20 0 Q-22 -12 -8 -14 L10 -14 L16 -24 L20 -14 L26 -10 L20 -6 L14 -6 L12 4 L8 4 L8 -4 L-10 -4 L-12 4 L-16 4 L-16 -2 Q-26 -2 -30 -10 Q-24 -4 -20 -6Z"/></g>`; });
      for (let i = 0; i < 6; i++) X.ground += `<rect x="${40 + i * 30}" y="${500 + i * 6}" width="8" height="${40 - i * 3}" fill="#5a4a3a" stroke="${INK}" stroke-width="1.6"/><path d="M${38 + i * 30} ${500 + i * 6} h12" stroke="#fff" stroke-width="3"/>`;
      X.over = `<div class="sx-drift"></div>`;
    } else if (act === 10) {
      // Philadelphia rowhouses in front of the skyline, with Independence Hall's steeple beyond
      const tx = 980;
      X.far += `<g fill="${shade(c2(act).far)}" stroke="${INK}" stroke-width="2"><rect x="${tx - 30}" y="380" width="60" height="90"/><rect x="${tx - 20}" y="330" width="40" height="50"/><circle cx="${tx}" cy="352" r="10" fill="#f6ecd8"/><path d="M${tx} 352 v-6 M${tx} 352 l4 3" stroke-width="1.4"/><path d="M${tx - 16} 330 L${tx - 12} 300 H${tx + 12} L${tx + 16} 330Z"/><path d="M${tx - 8} 300 L${tx} 250 L${tx + 8} 300Z"/><path d="M${tx - 120} 470 V410 H${tx - 30} M${tx + 30} 410 H${tx + 120} V470"/></g>`;
      let x = -10; const bricks = ['#8a3a2a', '#9a4632', '#7a3226', '#a0503a'];
      while (x < W) {
        const w = 90 + r() * 40, h = 100 + r() * 60, top = 470 - h, bc = bricks[Math.floor(r() * 4)];
        X.mid += `<g stroke="${INK}" stroke-width="2"><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${bc}"/><rect x="${x - 4}" y="${top - 8}" width="${w + 8}" height="9" fill="#e8dcc8"/>`;
        for (let yy = top + 8; yy < 468; yy += 7) X.mid += `<path d="M${x + 2} ${yy} H${x + w - 2}" stroke="${shade(bc)}" stroke-width="1" stroke-dasharray="7 2" opacity=".8"/>`;
        for (let row = 0; row < 3; row++) for (let k = 0; k < 2; k++) { const wx = x + 14 + k * (w - 44), wy = top + 16 + row * 34; if (wy > 440) continue; X.mid += `<rect x="${wx}" y="${wy}" width="16" height="22" fill="${r() > 0.5 ? '#ffd84a' : '#2a2030'}" ${r() > 0.8 ? 'class="sx-win"' : ''}/><path d="M${wx - 3} ${wy - 3} h22 M${wx - 2} ${wy + 24} h20" stroke="#f6ecd8" stroke-width="2.4"/>`; }
        X.mid += `<rect x="${x + w / 2 - 8}" y="440" width="16" height="30" fill="#2a1a10"/><path d="M${x + w / 2 - 12} 470 h24" stroke="#e8dcc8" stroke-width="3"/>`;
        if (r() > 0.4) { const chx = x + w - 26; X.mid += `<rect x="${chx}" y="${top - 26}" width="12" height="20" fill="${bc}"/><path d="M${chx - 2} ${top - 26} h16" stroke-width="3"/></g>` + puffs(chx + 6, top - 34, 3, '#a89898', 6); } else X.mid += '</g>';
        x += w + 4;
      }
      X.ground += `<g stroke="${INK}" stroke-width="2.4"><path d="M1480 600 V470" stroke-width="5"/><rect x="1468" y="452" width="24" height="44" rx="4" fill="#2a2a2a"/><circle cx="1480" cy="464" r="6" fill="#c8323c" class="sx-glow"/><circle cx="1480" cy="484" r="6" fill="#3a4a3a"/></g>`;
    }
    return X;
  }
  const c2 = act => SCENES[act] || SCENES[1];

  /** Parallax scene: returns HTML string with layered, seamlessly scrolling SVGs. */
  function scene(act, opts = {}) {
    const c = SCENES[act] || SCENES[1];
    const W = 1600, H = 600;
    const rng = seeded(act * 977 + 13);
    const id = nid('sc');
    const X = sceneExtras(act, W, H, id);
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
      <rect width="${W}" height="${H}" fill="url(#${id}ht)"/>${X.sky}
      <pattern id="${id}ht2" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="3" fill="#fff" opacity=".12"/></pattern>
      <rect y="${H * 0.5}" width="${W}" height="${H * 0.2}" fill="url(#${id}ht2)"/></svg>`;
    let clouds = '';
    const cr = seeded(act * 31 + 7);
    for (let i = 0; i < 5; i++) clouds += cloud(120 + i * 320 + cr() * 80, 70 + cr() * 150, 0.6 + cr() * 0.7, c.cloud, c.cloudShade);
    const farPts = ridge(rng, W, H, 400, 130, 14, true);
    const far = `<path d="M0 ${H} L${farPts.join(' L')} L${W} ${H}Z" fill="${c.far}" stroke="${INK}" stroke-width="2.4" opacity=".85"/>` + farDeco(act, seeded(act * 57 + 3), W, 470, c) + X.far;
    let mid;
    if (act === 1 || act === 2 || act === 7) mid = mesas(rng, W, 470, c.mid, c.midShade);
    else if (act === 10) mid = decoLayer('city', rng, W, 470, c);
    else if (act === 5) mid = `<path d="M0 470 ${ridge(rng, W, H, 470, 60, 10).map(p => 'L' + p).join(' ')} L${W} ${H} L0 ${H}Z" fill="${c.mid}" stroke="${INK}" stroke-width="2.4"/>` + decoLayer('city', seeded(99), W, 440, c).replace(/opacity=".85"/g, 'opacity=".4"');
    else if (act === 6) mid = decoLayer('city', rng, W, 500, c);
    else { const mp = ridge(rng, W, H, 470, 80, 10); mid = `<path d="M0 ${H} L${mp.join(' L')} L${W} ${H}Z" fill="${c.mid}" stroke="${INK}" stroke-width="2.4"/>`; }
    if (act === 6) { let k = 0; mid = mid.replace(/fill="#ffd84a" opacity=".85"/g, m => (++k % 7 ? m : m + ' class="sx-win"')); }
    mid += X.mid;
    const groundPts = ridge(rng, W, H, 500, 16, 8);
    const ground = `<path d="M0 ${H} L${groundPts.join(' L')} L${W} ${H}Z" fill="${c.ground}" stroke="${INK}" stroke-width="2.4"/>` +
      `<g stroke="${c.groundShade}" stroke-width="3" opacity=".7">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 210 + 40} ${540 + (i % 3) * 18} l120 0"/>`).join('')}</g>` +
      decoLayer(act === 5 ? 'waves' : c.deco, rng, W, 505, c) + props(act, seeded(act * 71 + 9), W, 505, c) + X.ground;
    const weather = c.rain ? '<div class="weather rain"></div>' : c.snow ? '<div class="weather snow"></div>' : '<div class="weather dust"></div>';
    const still = opts.still ? ' still' : '';
    const birds = [1, 2, 3, 7].includes(act) ? `<div class="scene-birds">${[0, 1, 2].map(i => `<svg class="bird b${i}" viewBox="0 0 40 16"><path d="M2 12 Q10 0 20 10 Q30 0 38 12 Q30 6 20 14 Q10 6 2 12Z" fill="${INK}"/></svg>`).join('')}</div>` : '';
    const tumble = [1, 2, 7].includes(act) ? `<div class="tumbleweed"><svg viewBox="0 0 60 60"><g fill="none" stroke="#8a6a3a" stroke-width="2.4"><circle cx="30" cy="30" r="24"/><path d="M8 24 Q30 40 52 22 M10 40 Q30 18 50 42 M22 8 Q34 30 20 52 M38 8 Q26 30 42 52"/></g><circle cx="30" cy="30" r="25" fill="none" stroke="${INK}" stroke-width="1.4"/></svg></div>` : '';
    return `<div class="scene act${act}${still}">${sky}
      ${layer(clouds, 160, 'clouds')}${birds}${layer(far, 120)}${layer(mid, 60)}${layer(ground, 22, 'ground')}${tumble}${X.over ? `<div class="sx-over">${X.over}</div>` : ''}${weather}<div class="scene-vignette"></div></div>`;
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

  const PARTS = { face: FACES, eyes: EYES, brows: BROWS, nose: NOSES, mouth: MOUTHS, facial: FACIAL, marks: MARKS, acc: ACC, style: STYLES, hairStyle: hairBack, hat: hats };
  return { addPortrait, portrait, creature, horse, scene, icon, sigil, usMap, SCENES, P, INK, PARTS };
})();
