/* DEV ONLY: Ryomen Sukuna, the King of Curses. Hidden on the registration screen until you type S-U-K-U-N-A.
   Deliberately overpowered, for testing. He can take every power the custom rider can (Hamon, the Stone Mask,
   German science, the Stand Arrow), and has his own Shrine technique: Dismantle, Cleave, Spiderweb, Fuga and the
   Malevolent Shrine domain. His moves get their own full-screen effects. */
'use strict';

/* ---------------- the character ---------------- */
SBR.art.addPortrait({ sukuna: { skin: '#f0d6c8', hair: '#f09ab8', hairStyle: 'spiky', hat: null, outfit: '#f6f4ee', outfit2: '#1a1020', eye: '#c8323c', lip: '#8a3a4a', bg: ['#2a0610', '#c8323c'], extra: 'sukuna' } });
SBR.CHARS.sukuna = {
  name: 'Ryomen Sukuna', short: 'Sukuna', title: 'King of Curses', portrait: 'sukuna', color: '#c8323c',
  hp: 140, stats: { spin: 14, aim: 14, grit: 14, ride: 12, res: 14, luck: 12 }, growth: { spin: 3, aim: 3, grit: 3, res: 3, ride: 2, luck: 2 },
  abilities: [{ id: 'suk_dismantle' }, { id: 'suk_cleave' }, { id: 'suk_web' }, { id: 'suk_fuga' }, { id: 'suk_shrine' }],
  passive: { name: 'Reverse Cursed Technique', desc: 'DEV CHARACTER. Heals 6 every turn, starts battles with 4 Energy, +40% damage, +25% crit, +10% dodge.' },
  bio: 'The King of Curses, a thousand years out of his time, entered in a horse race for his own amusement. For testing only.',
};
Object.defineProperty(SBR.CHARS.sukuna, 'stand', { get: () => { const m = SBR.run && SBR.run.party.concat(SBR.run.reserve || []).find(x => x.id === 'sukuna'); const P = m && SBR.pathOf(m); return P ? P.name : 'Shrine'; } });
if (!SBR.LEADS.includes('sukuna')) SBR.LEADS.push('sukuna');
(() => {
  const base = SBR.equipBonus;
  SBR.equipBonus = m => { const o = base(m); if (m.id === 'sukuna') { const add = (k, v) => { o.bonus[k] = (o.bonus[k] || 0) + v; }; add('energyStart', 3); add('regen', 6); add('dmg', 0.4); add('crit', 0.25); add('critDmg', 0.5); add('dodge', 0.1); } return o; };
})();

/* ---------------- the Shrine ---------------- */
Object.assign(SBR.ABILITIES, {
  suk_dismantle: { name: 'Dismantle', cost: 0, target: 'enemy', tags: [], dtype: 'phys', fx: 'suk_dismantle', desc: () => 'Invisible slashes: 3 cuts of 9 that cannot be dodged.', run(x) { for (let i = 0; i < 3; i++) { if (x.target.dead) break; x.dmg(x.target, 9, { spin: 0.02 }, { noDodge: true, label: i ? undefined : 'DISMANTLE' }); } } },
  suk_cleave: { name: 'Cleave', cost: 1, cd: 1, target: 'enemy', tags: ['stand'], dtype: 'true', pierce: true, fx: 'suk_cleave', desc: () => 'A slash that adjusts to its target: 30% of their max HP plus 12, as True damage.', run(x) { x.dmg(x.target, Math.round(x.target.maxHp * 0.3) + 12, {}, { noDodge: true, label: 'CLEAVE' }); } },
  suk_web: { name: 'Dismantle: Spiderweb', cost: 2, cd: 2, target: 'allEnemies', tags: ['stand'], dtype: 'phys', fx: 'suk_web', desc: () => 'The ground splits in a web of cuts. 4 slashes of 8 on every enemy, and Bleed 3.', run(x) { x.enemies.forEach(e => { for (let i = 0; i < 4; i++) { if (e.dead) break; x.dmg(e, 8, { spin: 0.02 }, { noDodge: true }); } if (!e.dead) x.status(e, 'bleed', 3); }); } },
  suk_fuga: { name: 'Fuga: Open', cost: 3, cd: 3, target: 'allEnemies', tags: ['stand'], dtype: 'holy', fx: 'suk_fuga', desc: () => '「■, 開」 A bow of fire. 34 to every enemy and Burning 5.', run(x) { x.say(x.user, 'Fuga.'); x.enemies.forEach(e => { x.dmg(e, 34, { spin: 0.02 }, { noDodge: true, dtype: 'phys', label: '竈' }); if (!e.dead) x.status(e, 'burn', 5); }); } },
  suk_shrine: { name: 'Domain Expansion: Malevolent Shrine', cost: 3, cd: 5, target: 'allEnemies', tags: ['stand'], dtype: 'true', pierce: true, fx: 'suk_shrine', desc: () => 'Domain Expansion. Everything inside is cut, again and again: 10 slashes of 7 True damage on every enemy, then Bleed 8 and Exposed 3.', run(x) { x.say(x.user, 'Domain Expansion. Malevolent Shrine.'); x.enemies.forEach(e => { for (let i = 0; i < 10; i++) { if (e.dead) break; x.dmg(e, 7, {}, { noDodge: true, label: i === 0 ? '伏魔御廚子' : undefined }); } if (!e.dead) { x.status(e, 'bleed', 8); x.status(e, 'vuln', 0, 3); } }); } },
});
(() => {
  const I = SBR.icons, st = I.st, K = I.K;
  const cut = (a) => `<path d="M8 ${40 - a} L40 ${8 + a}" stroke="${K}" stroke-width="6" stroke-linecap="round"/><path d="M8 ${40 - a} L40 ${8 + a}" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`;
  const draw = {
    suk_dismantle: () => `<circle cx="24" cy="24" r="19" fill="#2a0610" ${st}/>` + cut(0) + cut(8) + cut(-8),
    suk_cleave: () => `<circle cx="24" cy="24" r="19" fill="#c8323c" ${st}/><path d="M10 10L38 38M38 10L10 38" stroke="${K}" stroke-width="7" stroke-linecap="round"/><path d="M10 10L38 38M38 10L10 38" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
    suk_web: () => `<circle cx="24" cy="24" r="19" fill="#2a0610" ${st}/>` + [0, 1, 2, 3, 4, 5].map(i => `<path d="M24 24L${24 + Math.cos(i * 1.047) * 18} ${24 + Math.sin(i * 1.047) * 18}" stroke="#fff" stroke-width="1.8"/>`).join('') + `<circle cx="24" cy="24" r="7" fill="none" stroke="#fff" stroke-width="1.4"/><circle cx="24" cy="24" r="13" fill="none" stroke="#fff" stroke-width="1.4"/>`,
    suk_fuga: () => `<circle cx="24" cy="24" r="19" fill="#e8742a" ${st}/><path d="M12 36Q24 4 36 36" fill="none" stroke="${K}" stroke-width="3"/><path d="M12 36L36 12" stroke="#fff3a0" stroke-width="3"/><path d="M30 10l8 2-2 8z" fill="#fff3a0" ${st} stroke-width="1.2"/>`,
    suk_shrine: () => `<circle cx="24" cy="24" r="19" fill="#1a0408" ${st}/><path d="M8 18h32l-4 5H12z" fill="#c8323c" ${st} stroke-width="1.4"/><path d="M14 23v14M34 23v14" stroke="#c8323c" stroke-width="3"/><path d="M17 30q7 6 14 0" fill="#f6f4ee" ${st} stroke-width="1.2"/><path d="M19 30l2 3 2-3 2 3 2-3 2 3" stroke="${K}" stroke-width="1" fill="none"/>`,
  };
  Object.entries(draw).forEach(([id, fn]) => I.define('ability', id, fn));
})();

/* ---------------- Malevolent Shrine: a Stand-like figure that hovers beside him ---------------- */
SBR.stands.DEFS.shrine = { name: 'Malevolent Shrine', entity: true, draw: () => {
  const K = '#1a1020', st = `stroke="${K}" stroke-width="2.4" stroke-linejoin="round"`;
  const skulls = [...Array(9)].map((_, i) => `<g transform="translate(${16 + i * 11} ${146 - (i % 3) * 4})"><circle r="6" fill="#e8e0d0" ${st} stroke-width="1.4"/><circle cx="-2" cy="-1" r="1.4" fill="${K}"/><circle cx="2" cy="-1" r="1.4" fill="${K}"/></g>`).join('');
  return `<svg class="stand-svg" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><radialGradient id="shrA"><stop offset="0" stop-color="#c8323c" stop-opacity=".7"/><stop offset="1" stop-color="#c8323c" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="60" cy="84" rx="58" ry="76" fill="url(#shrA)"/>
    <path d="M10 44Q60 20 110 44L104 54H16z" fill="#2a0610" ${st}/><path d="M4 40Q60 10 116 40" fill="none" stroke="#c8323c" stroke-width="4"/>
    <path d="M22 54v84M98 54v84" stroke="${K}" stroke-width="8"/><path d="M22 54v84M98 54v84" stroke="#8a1a2a" stroke-width="5"/>
    <path d="M30 60h60v30H30z" fill="#3a0a14" ${st}/>
    <path d="M34 96Q60 130 86 96Q60 108 34 96z" fill="#1a0408" ${st}/><path d="M36 96l4 8 4-8 4 8 4-8 4 8 4-8 4 8 4-8 4 8 4-8" fill="#f6f4ee" stroke="${K}" stroke-width="1"/>
    <path d="M38 118l4-7 4 7 4-7 4 7 4-7 4 7 4-7 4 7 4-7 4 7" fill="#f6f4ee" stroke="${K}" stroke-width="1"/>
    <circle cx="46" cy="74" r="4" fill="#c8323c"/><circle cx="74" cy="74" r="4" fill="#c8323c"/><path d="M40 68l12 4M80 68l-12 4" stroke="#f6f4ee" stroke-width="2"/>
    <path d="M40 22L30 4M80 22l10-18" stroke="${K}" stroke-width="5" stroke-linecap="round"/><path d="M40 22L30 4M80 22l10-18" stroke="#e8e0d0" stroke-width="2.6" stroke-linecap="round"/>
    ${skulls}</svg>`;
} };

/* ---------------- effects: every Shrine move gets its own ---------------- */
const sukInstallFx = () => {
  if (!SBR.fx || SBR.fx._suk) return; SBR.fx._suk = true;
  const FX = SBR.fx, orig = FX.play;
  const spd = () => SBR.settings.speed || 1;
  const wait = ms => new Promise(r => setTimeout(r, ms / spd()));
  const shake = big => SBR.ui && SBR.ui.shake && SBR.ui.shake(undefined, big);
  /** full-screen DOM layer that removes itself */
  const layer = (cls, html, ms) => { const d = document.createElement('div'); d.className = 'suk-layer ' + cls; d.innerHTML = html || ''; d.style.setProperty('--spd', spd()); document.body.appendChild(d); setTimeout(() => d.remove(), ms / spd()); return d; };
  const slashLines = (n, spread = 1) => [...Array(n)].map((_, i) => `<i style="--a:${Math.round(-60 + Math.random() * 120)}deg;--x:${Math.round(Math.random() * 100)}%;--y:${Math.round(Math.random() * 100 * spread)}%;--d:${(i * 0.035).toFixed(3)}s;--w:${Math.round(40 + Math.random() * 70)}vw"></i>`).join('');
  const cutAt = (t, n, c = '#fff', r = 90) => { FX.slash(t.x, t.y, c, n, r); FX.sparks(t.x, t.y, '#fff', 14, 9); };
  async function dismantle(from, tos) {
    for (let k = 0; k < 3; k++) { tos.forEach(t => cutAt(t, 1, k === 2 ? '#ffb0b8' : '#fff', 110)); SBR.audio.play('hit'); await wait(90); }
    tos.forEach(t => { FX.blood(t.x, t.y, 14); FX.kana(t.x, t.y - 90, '解', '#fff', 70, 500); });
    shake(false);
  }
  async function cleave(from, tos) {
    layer('suk-dim', '', 500);
    const t = tos[0];
    FX.kana(t.x, t.y - 110, '捌', '#c8323c', 150, 700);
    await wait(160);
    layer('suk-cross', `<i style="--a:38deg"></i><i style="--a:-38deg;--d:.12s"></i>`, 700);
    cutAt(t, 2, '#fff', 180); FX.invert(120); FX.blood(t.x, t.y, 40, '#c8323c');
    SBR.audio.play('crit'); shake(true);
    await wait(320);
  }
  async function web(from, tos) {
    layer('suk-dim', '', 900);
    layer('suk-web', `<svg viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid slice">${[...Array(16)].map((_, i) => `<line x1="0" y1="0" x2="${(Math.cos(i * 0.3927) * 160).toFixed(1)}" y2="${(Math.sin(i * 0.3927) * 160).toFixed(1)}"/>`).join('')}${[20, 42, 68, 96, 130].map(r => `<polygon points="${[...Array(16)].map((_, i) => `${(Math.cos(i * 0.3927) * r).toFixed(1)},${(Math.sin(i * 0.3927) * r).toFixed(1)}`).join(' ')}"/>`).join('')}</svg>`, 900);
    FX.kana(innerWidth / 2, innerHeight * 0.3, '蜘蛛の糸', '#fff', 90, 800);
    shake(true);
    for (let k = 0; k < 4; k++) { tos.forEach(t => cutAt(t, 2, '#fff', 120)); SBR.audio.play('hit'); await wait(110); }
    tos.forEach(t => FX.blood(t.x, t.y, 20));
    await wait(200);
  }
  async function fuga(from, tos) {
    layer('suk-dim fire', '', 1300);
    FX.kana(from.x, from.y - 120, '■', '#e8742a', 120, 500);
    await wait(380);
    FX.kana(from.x + 60, from.y - 120, '開', '#fff3a0', 160, 700);
    FX.flames(from.x, from.y, 40, 40, -220, 26);
    layer('suk-arrow', '', 700).style.setProperty('--y', from.y + 'px');
    await wait(260);
    FX.flash('#ff9a3a', 260, 0.9);
    tos.forEach(t => { FX.flames(t.x, t.y, 60, 60, -260, 30); FX.boom(t.x, t.y); FX.ring(t.x, t.y, '#ffb050', 220, 10, 0.7); });
    SBR.audio.play('boom'); shake(true);
    await wait(400);
  }
  async function shrine(from, tos) {
    const L = layer('suk-domain', `<div class="sd-shrine">${SBR.stands.svg('shrine')}</div><div class="sd-t1">領域展開</div><div class="sd-t2">伏魔御廚子</div><div class="sd-en">DOMAIN EXPANSION · MALEVOLENT SHRINE</div><div class="sd-cuts">${slashLines(70)}</div>`, 3200);
    SBR.audio.play('menace');
    await wait(900);
    L.classList.add('cutting'); shake(true);
    for (let k = 0; k < 10; k++) { tos.forEach(t => cutAt(t, 2, k % 2 ? '#ffb0b8' : '#fff', 150)); if (k % 2 === 0) SBR.audio.play('hit'); await wait(120); }
    tos.forEach(t => FX.blood(t.x, t.y, 50, '#c8323c'));
    FX.invert(160); shake(true);
    await wait(700);
  }
  const MAP = { suk_dismantle: dismantle, suk_cleave: cleave, suk_web: web, suk_fuga: fuga, suk_shrine: shrine };
  FX.play = async (kind, from, tos, meta = {}) => { const f = MAP[kind]; if (!f) return orig(kind, from, tos, meta); if (!tos || !tos.length) tos = [from]; try { await f(from, tos, meta); } catch (e) { console.warn(e); } };
};
/* fx.js loads after this file: install once everything is in */
if (SBR.fx) sukInstallFx(); else window.addEventListener('DOMContentLoaded', sukInstallFx);

/* ---------------- the secret: type S-U-K-U-N-A on the registration screen ---------------- */
(() => {
  let buf = '';
  document.addEventListener('keydown', e => {
    if (!e.key || e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-6);
    if (buf !== 'sukuna' || !document.querySelector('.screen-setup')) return;
    buf = '';
    SBR.meta.devSukuna = !SBR.meta.devSukuna; SBR.saveMeta();
    SBR.audio.play(SBR.meta.devSukuna ? 'menace' : 'click');
    SBR.toast(SBR.meta.devSukuna ? '<b>領域展開.</b> The King of Curses has entered the race. (dev)' : 'Sukuna hidden again.', SBR.meta.devSukuna ? 'bad' : 'good');
    if (SBR.game.setupScreen) SBR.game.setupScreen();
  });
})();
