/* Music and extra sound effects, all synthesized in WebAudio.
   SBR.music.play(key) crossfades to a theme: one per act, per detour area, per battle type, the sprint and the saloon.
   A theme is a small step-sequencer score: lead, bass, pad chords, drums and an ambience bed.
   Bring your own tracks: put music/manifest.json ({"act1": "file.mp3", ...}) and the files in a music/ folder
   (gitignored). Those play instead of the synth score for their keys and are never published. */
'use strict';

(() => {
  const A = SBR.audio;
  const S = SBR.settings;
  if (S.music === undefined) S.music = 0.35;

  /* ---------------- low-level voices ---------------- */
  const SCALES = {
    minor: [0, 2, 3, 5, 7, 8, 10], major: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10], harm: [0, 2, 3, 5, 7, 8, 11],
    phryg: [0, 1, 4, 5, 7, 8, 10], mixo: [0, 2, 4, 5, 7, 9, 10],
  };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const env = (ctx, g, t, a, peak, d, sus = 0.0001) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + d); };
  let noiseBuf = null;
  const nbuf = ctx => { if (!noiseBuf) { const len = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; } return noiseBuf; };
  function osc(ctx, type, f, t, dur, dest, vol, a = 0.005, d = null, opts = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (opts.bend) { o.frequency.setValueAtTime(f * Math.pow(2, opts.bend / 12), t); o.frequency.exponentialRampToValueAtTime(f, t + 0.06); }
    if (opts.slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slide), t + dur);
    if (opts.detune) o.detune.value = opts.detune;
    if (opts.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = opts.vib; lg.gain.value = f * 0.012; l.connect(lg); lg.connect(o.frequency); l.start(t + 0.12); l.stop(t + dur + 0.1); }
    env(ctx, g, t, a, vol, d == null ? dur : d, opts.sus);
    if (opts.sus) g.gain.setValueAtTime(opts.sus, t + dur); if (opts.sus) g.gain.exponentialRampToValueAtTime(0.0001, t + dur + (opts.rel || 0.12));
    let node = o;
    if (opts.lp) { const f2 = ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.setValueAtTime(opts.lp, t); if (opts.lpEnd) f2.frequency.exponentialRampToValueAtTime(opts.lpEnd, t + dur); o.connect(f2); node = f2; }
    node.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + (opts.rel || 0.12) + 0.05);
  }
  function nz(ctx, t, dur, dest, vol, type = 'lowpass', freq = 1200, q = 0.7) {
    const s = ctx.createBufferSource(); s.buffer = nbuf(ctx);
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); env(ctx, g, t, 0.002, vol, dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  const INST = {
    twang: (c, t, m, d, v, o) => { osc(c, 'sawtooth', hz(m), t, Math.max(0.25, d), o, v * 0.5, 0.004, Math.max(0.25, d), { bend: 1, lp: 3200, lpEnd: 700 }); osc(c, 'square', hz(m + 12), t, 0.12, o, v * 0.12, 0.003, 0.12); },
    whistle: (c, t, m, d, v, o) => osc(c, 'sine', hz(m + 12), t, d, o, v * 0.55, 0.06, d, { vib: 5.5, sus: v * 0.4, rel: 0.15 }),
    bell: (c, t, m, d, v, o) => { osc(c, 'sine', hz(m + 12), t, 1.4, o, v * 0.4, 0.003, 1.4); osc(c, 'sine', hz(m + 12) * 2.76, t, 0.6, o, v * 0.12, 0.002, 0.6); },
    organ: (c, t, m, d, v, o) => { osc(c, 'square', hz(m), t, d, o, v * 0.18, 0.02, d, { sus: v * 0.14, lp: 1800 }); osc(c, 'sine', hz(m + 12), t, d, o, v * 0.2, 0.02, d, { sus: v * 0.16 }); },
    brass: (c, t, m, d, v, o) => { osc(c, 'sawtooth', hz(m), t, d, o, v * 0.35, 0.05, d, { sus: v * 0.26, lp: 900, lpEnd: 2200 }); osc(c, 'sawtooth', hz(m), t, d, o, v * 0.2, 0.05, d, { sus: v * 0.15, detune: 9, lp: 1200 }); },
    chip: (c, t, m, d, v, o) => osc(c, 'square', hz(m + 12), t, d, o, v * 0.18, 0.003, d * 0.9, { sus: v * 0.1 }),
    piano: (c, t, m, d, v, o) => { osc(c, 'triangle', hz(m + 12), t, 0.5, o, v * 0.5, 0.002, 0.5); osc(c, 'square', hz(m + 12), t, 0.08, o, v * 0.08, 0.002, 0.08); },
    pluck: (c, t, m, d, v, o) => osc(c, 'triangle', hz(m - 12), t, Math.max(0.2, d), o, v * 0.7, 0.004, Math.max(0.2, d)),
    sub: (c, t, m, d, v, o) => osc(c, 'sine', hz(m - 12), t, d, o, v * 0.8, 0.01, d, { sus: v * 0.5 }),
    fuzz: (c, t, m, d, v, o) => { osc(c, 'sawtooth', hz(m - 12), t, d, o, v * 0.3, 0.004, d, { lp: 600, sus: v * 0.2 }); osc(c, 'square', hz(m - 12), t, d, o, v * 0.12, 0.004, d, { detune: -8, lp: 500, sus: v * 0.08 }); },
    pad: (c, t, m, d, v, o) => { osc(c, 'sawtooth', hz(m), t, d, o, v * 0.08, 0.4, d, { sus: v * 0.07, lp: 700, rel: 0.6 }); osc(c, 'sawtooth', hz(m), t, d, o, v * 0.08, 0.4, d, { sus: v * 0.07, lp: 700, detune: 12, rel: 0.6 }); },
    glass: (c, t, m, d, v, o) => { osc(c, 'sine', hz(m + 12), t, d, o, v * 0.12, 0.5, d, { sus: v * 0.1, vib: 3, rel: 0.8 }); osc(c, 'triangle', hz(m + 19), t, d, o, v * 0.05, 0.6, d, { sus: v * 0.04, rel: 0.8 }); },
  };
  const DRUM = {
    k: (c, t, o, v) => osc(c, 'sine', 150, t, 0.22, o, v * 0.9, 0.002, 0.22, { slide: 40 }),
    s: (c, t, o, v) => { nz(c, t, 0.14, o, v * 0.45, 'bandpass', 1800, 0.8); osc(c, 'triangle', 190, t, 0.08, o, v * 0.3, 0.002, 0.08); },
    h: (c, t, o, v) => nz(c, t, 0.035, o, v * 0.22, 'highpass', 7500),
    o: (c, t, o, v) => nz(c, t, 0.18, o, v * 0.2, 'highpass', 6500),
    c: (c, t, o, v) => { osc(c, 'sine', 820, t, 0.05, o, v * 0.35, 0.001, 0.05); osc(c, 'sine', 560, t + 0.004, 0.06, o, v * 0.2, 0.001, 0.06); },
    t: (c, t, o, v) => nz(c, t, 0.06, o, v * 0.16, 'highpass', 5000),
    r: (c, t, o, v) => { for (let i = 0; i < 3; i++) nz(c, t + i * 0.03, 0.03, o, v * 0.25, 'bandpass', 2000, 0.8); },
    b: (c, t, o, v) => { osc(c, 'sine', 90, t, 0.5, o, v * 0.9, 0.002, 0.5, { slide: 35 }); nz(c, t, 0.3, o, v * 0.25, 'lowpass', 500); },
  };

  /* ---------------- scores ---------------- */
  const P = str => str.replace(/\|/g, ' ').trim().split(/\s+/);
  const T = {
    // The Steel Ball Run — heroic frontier theme with a Morricone whistle
    title: { gain: 1.0, bpm: 128, root: 52, scale: 'minor', amb: 'wind',
      lead: { inst: 'whistle', v: 0.7, n: P('7 - - - 9 - 8 7 | 4 - - - 5 - 4 3 | 4 - - - 6 - 5 4 | 2 - - - . . . . | 7 - - - 9 - 11 9 | 7 - - - 8 - 7 6 | 4 - 5 - 6 - 7 - | 4 - - - - - . . ') },
      bass: { inst: 'pluck', v: 0.8, n: P('0 . . 0 . . 4 . | 0 . . 0 . . 4 . | 3 . . 3 . . 2 . | 4 . . 4 . . 1 . ') },
      pad: { inst: 'pad', v: 0.6, ch: [[0, 2, 4], [0, 2, 4], [3, 5, 7], [4, 6, 8], [0, 2, 4], [5, 7, 9], [3, 5, 7], [4, 6, 8]], every: 8 },
      drums: 'c..c..s.c..c..s.' },
    // Act I — Arizona: slow spaghetti-western twang over a phrygian drone
    act1: { gain: 2.4, bpm: 92, root: 57, scale: 'phryg', amb: 'wind',
      lead: { inst: 'twang', v: 0.65, n: P('0 . 1 2 - - 1 0 | . . . . . . . . | 4 . 5 4 - - 2 1 | 2 - - - . . . . | 7 . 8 7 - - 5 4 | 5 . 4 2 - - 1 - | 0 - - - . . . . | . . . . . . . . ') },
      bass: { inst: 'pluck', v: 0.7, n: P('0 . . . 0 . . . | 0 . . . -1 . . . ') },
      pad: { inst: 'pad', v: 0.45, ch: [[0, 4, 7], [0, 4, 7], [1, 3, 5], [0, 4, 7]], every: 16 },
      drums: 'c.......c...c...' },
    // Act II — Rockies: organ and bells, dorian, wide open
    act2: { gain: 0.55, bpm: 100, root: 50, scale: 'dorian', amb: 'wind',
      lead: { inst: 'bell', v: 0.6, n: P('4 . 7 . 8 . 7 . | 5 . 4 . 2 . . . | 4 . 7 . 9 . 8 . | 7 - - - . . . . | 3 . 5 . 7 . 5 . | 4 . 2 . 1 . . . | 0 . 2 . 4 . 5 . | 4 - - - . . . . ') },
      bass: { inst: 'sub', v: 0.6, n: P('0 - - - - - - - | 3 - - - - - - - | 4 - - - - - - - | 0 - - - 6 - - - ') },
      pad: { inst: 'organ', v: 0.35, ch: [[0, 2, 4], [3, 5, 7], [4, 6, 8], [0, 2, 4]], every: 16 },
      drums: 'k.......h...k.h.' },
    // Act III — Midwest: rolling prairie shuffle, rain
    act3: { gain: 1.7, bpm: 110, root: 55, scale: 'mixo', amb: 'rain',
      lead: { inst: 'twang', v: 0.55, n: P('4 . 4 5 6 . 4 . | 2 . 1 . 0 . . . | 4 . 4 5 6 . 7 . | 8 - - - . . . . | 7 . 6 . 4 . 2 . | 3 . 2 . 1 . . . | 0 . 1 . 2 . 4 . | 0 - - - . . . . ') },
      bass: { inst: 'pluck', v: 0.75, n: P('0 . 4 . 0 . 4 . | 3 . 0 . 3 . 0 . | 4 . 1 . 4 . 1 . | 0 . 4 . 6 . 4 . ') },
      pad: null, drums: 'k.h.s.h.k.hks.h.' },
    // Act IV — the frozen north: sparse bells in a storm
    act4: { gain: 0.62, bpm: 76, root: 52, scale: 'minor', amb: 'storm',
      lead: { inst: 'bell', v: 0.55, n: P('7 . . . 4 . . . | 5 . . . 2 . . . | 3 . . . 4 . . . | 0 . . . . . . . | 7 . . . 8 . . . | 9 . . . 7 . . . | 5 . . . 4 . . . | 2 . . . . . . . ') },
      bass: { inst: 'sub', v: 0.55, n: P('0 - - - - - - - | 5 - - - - - - - | 3 - - - - - - - | 4 - - - - - - - ') },
      pad: { inst: 'glass', v: 0.7, ch: [[0, 2, 4], [5, 7, 9], [3, 5, 7], [4, 6, 8]], every: 8 },
      drums: '................' },
    // Act V — the East Coast: a minor-key military march
    act5: { gain: 1.6, bpm: 116, root: 48, scale: 'minor', amb: null,
      lead: { inst: 'brass', v: 0.55, n: P('0 - . 0 2 - 3 - | 4 - - - 2 - . . | 3 - . 3 5 - 4 - | 2 - - - . . . . | 4 - . 4 7 - 6 - | 5 - 4 - 3 - 2 - | 1 - . 2 3 - 1 - | 0 - - - . . . . ') },
      bass: { inst: 'pluck', v: 0.7, n: P('0 . 4 . 0 . 4 . | 5 . 2 . 5 . 2 . | 3 . 0 . 3 . 0 . | 4 . 1 . 4 . 4 . ') },
      pad: null, drums: 'k.r.s.r.k.r.srrr' },
    // Act VI — New York: fast, electric, THE WORLD is coming
    act6: { gain: 1.2, bpm: 126, root: 53, scale: 'harm', amb: null,
      lead: { inst: 'chip', v: 0.55, n: P('0 2 4 7 6 4 2 4 | 5 4 2 1 2 - - - | 0 2 4 7 8 7 6 4 | 6 - 7 - 4 - - - ') },
      bass: { inst: 'fuzz', v: 0.7, n: P('0 . 0 . 0 . 0 7 | 5 . 5 . 5 . 5 4 | 3 . 3 . 3 . 3 4 | 4 . 4 . 6 . 4 . ') },
      pad: { inst: 'pad', v: 0.4, ch: [[0, 2, 4], [5, 7, 9], [3, 5, 7], [4, 6, 8]], every: 16 },
      drums: 'k.h.s.hkk.h.s.hh' },
    // Detours
    devilspalm: { gain: 0.5, bpm: 72, root: 50, scale: 'phryg', amb: 'wind',
      lead: { inst: 'whistle', v: 0.55, n: P('4 - - - 5 - 4 - | 1 - - - - - - - | . . . . . . . . | 0 - 1 - 4 - - - | 5 - - - 7 - 8 - | 7 - - - - - - - | . . . . . . . . | . . . . . . . . ') },
      bass: { inst: 'sub', v: 0.6, n: P('0 - - - - - - - | 0 - - - - - - - | 1 - - - - - - - | 0 - - - - - - - ') },
      pad: { inst: 'glass', v: 0.6, ch: [[0, 4, 7], [1, 4, 8]], every: 16 },
      drums: 'b...............|..........c...c.' },
    silvermine: { gain: 0.52, bpm: 70, root: 45, scale: 'harm', amb: 'drips',
      lead: { inst: 'bell', v: 0.45, n: P('0 . 2 . 4 . 2 . | 0 . 2 . 4 . 6 . | 5 . 3 . 1 . 3 . | 4 - - - . . . . ') },
      bass: { inst: 'sub', v: 0.7, n: P('0 - - - - - - - | 5 - - - - - - - | 3 - - - - - - - | 4 - - - - - - - ') },
      pad: null, drums: 'k.......k.......' },
    lakeice: { gain: 0.66, bpm: 64, root: 57, scale: 'minor', amb: 'storm',
      lead: { inst: 'glass', v: 0.7, n: P('7 - - - - - - - | 6 - - - 4 - - - | 5 - - - - - - - | 2 - - - . . . . ') },
      bass: { inst: 'sub', v: 0.5, n: P('0 - - - - - - - | 3 - - - - - - - ') },
      pad: { inst: 'pad', v: 0.35, ch: [[0, 2, 4], [3, 5, 7]], every: 16 },
      drums: '................' },
    railyard: { gain: 1.05, bpm: 138, root: 52, scale: 'harm', amb: 'rumble',
      lead: { inst: 'brass', v: 0.45, n: P('. . . . 7 - 6 - | 4 - - - . . . . | . . . . 8 - 7 - | 6 - 7 - 4 - - - ') },
      bass: { inst: 'fuzz', v: 0.75, n: P('0 0 7 0 0 7 0 0 | 5 5 4 5 5 4 5 5 | 3 3 2 3 3 2 3 3 | 4 4 6 4 4 6 4 4 ') },
      pad: null, drums: 'k.t.s.t.k.t.s.tt' },
    // Battles
    battle: { gain: 1.4, bpm: 148, root: 52, scale: 'harm', amb: null,
      lead: { inst: 'twang', v: 0.55, n: P('7 . 7 6 7 . 4 . | 5 . 6 . 4 . . . | 7 . 7 6 7 . 9 . | 8 - 7 - 6 - . . | 4 . 5 . 6 . 4 . | 5 . 3 . 2 . 3 . | 4 . 4 . 6 . 7 . | 4 - - - . . . . ') },
      bass: { inst: 'pluck', v: 0.8, n: P('0 . 0 7 0 . 0 7 | 5 . 5 4 5 . 5 4 | 3 . 3 2 3 . 3 4 | 4 . 4 6 4 . 4 . ') },
      pad: { inst: 'pad', v: 0.4, ch: [[0, 2, 4], [5, 7, 9], [3, 5, 7], [4, 6, 8]], every: 16 },
      drums: 'k.h.s.hkk.hks.h.' },
    elite: { gain: 1.05, bpm: 156, root: 50, scale: 'harm', amb: null,
      lead: { inst: 'brass', v: 0.5, n: P('0 - 2 - 3 - 4 - | 5 - 4 - 3 - 2 - | 3 - 4 - 5 - 7 - | 6 - - - 4 - - - ') },
      bass: { inst: 'fuzz', v: 0.75, n: P('0 0 . 0 0 . 0 7 | 5 5 . 5 5 . 5 4 | 3 3 . 3 3 . 3 2 | 4 4 . 4 6 . 4 4 ') },
      pad: null, drums: 'k.hks.hkk.hks.hr' },
    boss: { gain: 0.85, bpm: 164, root: 50, scale: 'harm', amb: null,
      lead: { inst: 'brass', v: 0.55, n: P('0 - - 1 0 - -1 - | 0 - - - . . . . | 3 - - 4 3 - 2 - | 3 - - - 6 - - - | 7 - - 8 7 - 6 - | 5 - 4 - 3 - 2 - | 1 - 0 - -1 - 0 - | 0 - - - . . . . ') },
      bass: { inst: 'fuzz', v: 0.8, n: P('0 0 0 0 0 0 1 0 | 0 0 0 0 0 0 -1 0 | 3 3 3 3 3 3 4 3 | 4 4 4 4 4 4 6 4 ') },
      pad: { inst: 'organ', v: 0.3, ch: [[0, 2, 4], [0, 2, 4], [3, 5, 7], [4, 6, 8]], every: 16 },
      drums: 'k.hks.hkk.hks.rr' },
    // Diego: a menacing chromatic motif (THE WORLD)
    boss_diego: { gain: 0.88, bpm: 170, root: 53, scale: 'harm', amb: null,
      lead: { inst: 'chip', v: 0.55, n: P('0 . 0 . 1 . 0 . | 6 . 5 . 6 . 7 . | 0 . 0 . 1 . 0 . | 8 - 7 - 6 - 4 - ') },
      bass: { inst: 'fuzz', v: 0.85, n: P('0 0 7 0 0 7 0 0 | 6 6 5 6 6 5 6 6 | 0 0 7 0 0 7 0 0 | 4 4 6 4 4 6 4 4 ') },
      pad: { inst: 'brass', v: 0.3, ch: [[0, 2, 4], [6, 8, 10], [0, 2, 4], [4, 6, 8]], every: 16 },
      drums: 'k.hks.hkk.hksrrr' },
    // Valentine: a patriotic anthem turned to minor
    boss_valentine: { gain: 0.5, bpm: 112, root: 48, scale: 'minor', amb: null,
      lead: { inst: 'brass', v: 0.55, n: P('4 - - 2 0 - 2 - | 4 - 7 - 9 - - - | 11 - - 10 9 - 7 - | 8 - 9 - 7 - - - | 7 - 9 - 11 - - - | 11 - 10 - 9 - 8 - | 7 - 6 - 4 - 3 - | 4 - - - . . . . ') },
      bass: { inst: 'sub', v: 0.7, n: P('0 - - - 4 - - - | 0 - - - 5 - - - | 3 - - - 4 - - - | 5 - - - 4 - - - ') },
      pad: { inst: 'organ', v: 0.35, ch: [[0, 2, 4], [5, 7, 9], [3, 5, 7], [4, 6, 8]], every: 16 },
      drums: 'k.r.s.r.k.rrs.rr' },
    // Stage sprint: galloping 12/8
    sprint: { gain: 0.95, bpm: 168, root: 52, scale: 'dorian', amb: null, steps: 12,
      lead: { inst: 'whistle', v: 0.55, n: P('7 - 6 7 - 9 | 7 - 4 5 - - | 7 - 6 7 - 9 | 10 - 9 7 - - | 5 - 4 5 - 7 | 5 - 2 4 - - | 3 - 4 5 - 6 | 7 - - - - - ') },
      bass: { inst: 'pluck', v: 0.8, n: P('0 . 4 0 . 4 | 3 . 6 3 . 6 | 4 . 1 4 . 1 | 0 . 4 6 . 4 ') },
      pad: null, drums: 'c.cc.cc.cc.c' },
    // Saloon / shops: ragtime piano
    shop: { gain: 1.9, bpm: 120, root: 48, scale: 'major', amb: null,
      lead: { inst: 'piano', v: 0.6, n: P('4 . 5 . 6 . 7 4 | . 7 . 4 7 . . . | 5 . 6 . 7 . 8 5 | . 8 . 5 8 . . . | 9 . 8 . 7 . 6 . | 5 . 4 . 3 . 4 . | 2 . 4 . 6 . 4 . | 7 - - - . . . . ') },
      bass: { inst: 'pluck', v: 0.75, n: P('0 . 7 . 4 . 7 . | 0 . 7 . 4 . 7 . | 3 . 7 . 5 . 7 . | 4 . 8 . 6 . 8 . ') },
      pad: null, drums: 'k...t...k...t...' },
  };
  SBR.MUSIC_THEMES = T;

  /* ---------------- ambience beds ---------------- */
  function ambience(ctx, kind, out) {
    if (!kind) return () => {};
    const nodes = [];
    const src = ctx.createBufferSource(); src.buffer = nbuf(ctx); src.loop = true;
    const f = ctx.createBiquadFilter(), g = ctx.createGain();
    const cfg = { wind: ['bandpass', 500, 0.10], storm: ['lowpass', 700, 0.16], rain: ['highpass', 3500, 0.05], rumble: ['lowpass', 140, 0.22], drips: ['lowpass', 300, 0.04] }[kind] || ['lowpass', 500, 0.05];
    f.type = cfg[0]; f.frequency.value = cfg[1]; g.gain.value = cfg[2];
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = kind === 'storm' ? 0.23 : 0.11; lg.gain.value = cfg[1] * 0.6; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
    src.connect(f); f.connect(g); g.connect(out); src.start();
    nodes.push(src, lfo);
    let timer = null;
    if (kind === 'drips') timer = setInterval(() => { const t = ctx.currentTime + 0.05; osc(ctx, 'sine', 1200 + Math.random() * 900, t, 0.12, out, 0.08, 0.001, 0.12, { slide: 700 }); }, 900 + Math.random() * 500);
    if (kind === 'rumble') { let k = 0; timer = setInterval(() => { const t = ctx.currentTime + 0.05; DRUM.c(ctx, t, out, (k++ % 2) ? 0.35 : 0.5); }, 430); }
    return () => { nodes.forEach(n => { try { n.stop(); } catch (e) {} }); if (timer) clearInterval(timer); };
  }

  /* ---------------- sequencer ---------------- */
  let bus = null, cur = null, wanted = null, files = null, unlocked = false;
  function ctx() { A.unlock(); return A.ctx; }
  function ensureBus() {
    const c = ctx(); if (!c) return null;
    if (!bus) { bus = c.createGain(); bus.connect(c.destination); }
    bus.gain.value = S.music;
    return c;
  }
  function degToMidi(tr, deg) {
    const sc = SCALES[tr.scale] || SCALES.minor, n = sc.length;
    const d = Math.floor(deg), oct = Math.floor(d / n), i = ((d % n) + n) % n;
    return tr.root + oct * 12 + sc[i];
  }
  function startSynth(key) {
    const c = ensureBus(); if (!c) return null;
    const tr = T[key]; if (!tr) return null;
    const out = c.createGain(); out.gain.setValueAtTime(0.0001, c.currentTime); out.gain.exponentialRampToValueAtTime(tr.gain || 1, c.currentTime + 0.9); out.connect(bus);
    const steps = tr.steps || 16, stepDur = 60 / tr.bpm / 4 * (steps === 12 ? 4 / 3 : 1);
    let step = 0, next = c.currentTime + 0.1;
    const lenOf = part => part.length;
    const noteLen = (arr, i) => { let k = 1; while (arr[(i + k) % arr.length] === '-' && k < 32) k++; return k; };
    const drums = (tr.drums || '').replace(/\|/g, '');
    const stopAmb = ambience(c, tr.amb, out);
    const tick = () => {
      while (next < c.currentTime + 0.15) {
        const t = next;
        for (const part of [tr.lead, tr.bass]) {
          if (!part) continue;
          const i = step % lenOf(part.n), tok = part.n[i];
          if (tok !== '.' && tok !== '-') INST[part.inst](c, t, degToMidi(tr, +tok), noteLen(part.n, i) * stepDur, part.v, out);
        }
        if (tr.pad && step % tr.pad.every === 0) {
          const ch = tr.pad.ch[Math.floor(step / tr.pad.every) % tr.pad.ch.length];
          ch.forEach(dg => INST[tr.pad.inst](c, t, degToMidi(tr, dg) - 12, tr.pad.every * stepDur * 0.98, tr.pad.v, out));
        }
        const dc = drums[step % (drums.length || 1)];
        if (dc && DRUM[dc]) DRUM[dc](c, t, out, 0.6);
        next += stepDur; step++;
      }
    };
    const iv = setInterval(tick, 25); tick();
    return { key, stop() { clearInterval(iv); const t = c.currentTime; try { out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), t); out.gain.exponentialRampToValueAtTime(0.0001, t + 0.8); } catch (e) {} setTimeout(() => { stopAmb(); try { out.disconnect(); } catch (e) {} }, 1000); } };
  }
  function startFile(key) {
    const a = new Audio('music/' + files[key]); a.loop = true; a.volume = 0;
    a.play().catch(() => {});
    let v = 0; const up = setInterval(() => { v = Math.min(1, v + 0.08); a.volume = v * S.music; if (v >= 1) clearInterval(up); }, 60);
    return { key, el: a, stop() { clearInterval(up); let w = a.volume; const dn = setInterval(() => { w = Math.max(0, w - 0.05); a.volume = w; if (w <= 0) { clearInterval(dn); a.pause(); } }, 50); } };
  }
  function play(key) {
    wanted = key;
    if (!unlocked || S.music <= 0) return;
    if (cur && cur.key === key) return;
    if (cur) cur.stop();
    cur = (files && files[key]) ? startFile(key) : startSynth(key);
  }
  function stop() { wanted = null; if (cur) { cur.stop(); cur = null; } }
  function setVolume(v) {
    S.music = v; SBR.saveSettings();
    if (bus) bus.gain.value = v;
    if (cur && cur.el) cur.el.volume = v;
    if (v <= 0) { if (cur) { cur.stop(); cur = null; } } else if (!cur && wanted) play(wanted);
  }
  // browsers only allow sound after a gesture
  const unlock = () => { if (unlocked) return; unlocked = true; if (wanted) { const w = wanted; wanted = null; play(w); } };
  ['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, unlock, { once: false, capture: true }));
  // only look for your own tracks when running locally (the published site never has a music/ folder)
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) try { fetch('music/manifest.json').then(r => (r.ok ? r.json() : null)).then(j => { if (j) files = j; }).catch(() => {}); } catch (e) {}

  /** which theme fits the current screen */
  function themeForStage() {
    const r = SBR.run; if (!r) return 'title';
    if (r.area) return r.area.id;
    return 'act' + Math.min(6, Math.max(1, r.act || 1));
  }
  function themeForBattle(enemies, opts) {
    const ids = enemies || [];
    if (ids.some(i => /^diego_world|^diego_rival/.test(i))) return 'boss_diego';
    if (ids.some(i => /^valentine|^lovetrain/.test(i))) return 'boss_valentine';
    if (opts && opts.boss) return 'boss';
    if (opts && opts.elite) return 'elite';
    return 'battle';
  }
  SBR.music = { play, stop, setVolume, themeForStage, themeForBattle, get current() { return cur && cur.key; }, get files() { return files; }, get bus() { return bus; } };

  /* ---------------- extra sound effects ---------------- */
  const def = (name, fn) => A.define(name, () => { const c = A.ctx; if (c) fn(c, A.master, c.currentTime); });
  // hits by damage type
  def('hit_phys', (c, o, t) => { nz(c, t, 0.12, o, 0.4, 'lowpass', 900); osc(c, 'sawtooth', 140, t, 0.12, o, 0.16, 0.002, 0.12, { slide: 70 }); });
  def('hit_bullet', (c, o, t) => { nz(c, t, 0.16, o, 0.5, 'highpass', 2500); osc(c, 'square', 900, t, 0.06, o, 0.1, 0.001, 0.06, { slide: 200 }); });
  def('hit_spin', (c, o, t) => { osc(c, 'sine', 300, t, 0.3, o, 0.16, 0.003, 0.3, { slide: 1500 }); osc(c, 'triangle', 600, t, 0.25, o, 0.08, 0.003, 0.25, { slide: 2000 }); nz(c, t + 0.1, 0.1, o, 0.25, 'bandpass', 1500); });
  def('hit_stand', (c, o, t) => { nz(c, t, 0.1, o, 0.35, 'bandpass', 1200, 1); osc(c, 'sawtooth', 220, t, 0.18, o, 0.12, 0.002, 0.18, { slide: 110 }); osc(c, 'sine', 880, t, 0.2, o, 0.06, 0.002, 0.2, { vib: 12 }); });
  def('hit_bleed', (c, o, t) => { nz(c, t, 0.18, o, 0.3, 'lowpass', 500); osc(c, 'sine', 180, t, 0.2, o, 0.14, 0.002, 0.2, { slide: 90 }); });
  def('hit_cold', (c, o, t) => { [2093, 2637, 3136].forEach((f, i) => osc(c, 'sine', f, t + i * 0.03, 0.3, o, 0.07, 0.001, 0.3)); nz(c, t, 0.08, o, 0.2, 'highpass', 5000); });
  def('hit_sound', (c, o, t) => { osc(c, 'sine', 80, t, 0.35, o, 0.5, 0.002, 0.35, { slide: 45 }); nz(c, t, 0.25, o, 0.3, 'lowpass', 300); });
  def('hit_holy', (c, o, t) => { [523, 659, 784, 1047].forEach((f, i) => osc(c, 'sine', f, t + i * 0.02, 0.45, o, 0.07, 0.01, 0.45)); nz(c, t, 0.1, o, 0.15, 'highpass', 4000); });
  def('hit_true', (c, o, t) => { osc(c, 'square', 60, t, 0.2, o, 0.14, 0.001, 0.2); osc(c, 'square', 61.5, t, 0.2, o, 0.14, 0.001, 0.2); });
  def('dodge', (c, o, t) => { nz(c, t, 0.18, o, 0.25, 'bandpass', 2500, 2); });
  def('immune', (c, o, t) => { osc(c, 'triangle', 300, t, 0.2, o, 0.16, 0.002, 0.2); osc(c, 'triangle', 302, t + 0.08, 0.2, o, 0.12, 0.002, 0.2); });
  def('shieldbreak', (c, o, t) => { for (let i = 0; i < 5; i++) osc(c, 'sine', 1800 + Math.random() * 1500, t + i * 0.025, 0.2, o, 0.06, 0.001, 0.2); nz(c, t, 0.2, o, 0.2, 'highpass', 4500); });
  def('st_buff', (c, o, t) => { osc(c, 'triangle', 520, t, 0.14, o, 0.08, 0.004, 0.14, { slide: 780 }); });
  def('st_debuff', (c, o, t) => { osc(c, 'sawtooth', 300, t, 0.2, o, 0.06, 0.004, 0.2, { slide: 180, lp: 1200 }); });
  def('stand', (c, o, t) => { osc(c, 'sawtooth', 110, t, 0.9, o, 0.08, 0.1, 0.9, { lp: 600, lpEnd: 2400 }); osc(c, 'sine', 55, t, 0.9, o, 0.2, 0.05, 0.9); nz(c, t, 0.5, o, 0.1, 'bandpass', 800, 3); });
  def('d4c', (c, o, t) => { [880, 1108, 1318, 1760].forEach((f, i) => osc(c, 'sine', f, t + i * 0.05, 0.6, o, 0.06, 0.02, 0.6, { vib: 7 })); });
  def('deal', (c, o, t) => { nz(c, t, 0.06, o, 0.2, 'highpass', 3000); osc(c, 'sine', 700, t, 0.05, o, 0.05, 0.001, 0.05, { slide: 400 }); });
  def('flip', (c, o, t) => { nz(c, t, 0.05, o, 0.18, 'bandpass', 2500); nz(c, t + 0.06, 0.04, o, 0.12, 'bandpass', 3500); });
  def('anvil', (c, o, t) => { [880, 1320, 2200].forEach(f => osc(c, 'sine', f, t, 0.9, o, 0.08, 0.001, 0.9)); nz(c, t, 0.05, o, 0.35, 'highpass', 3000); });
  def('equip', (c, o, t) => { nz(c, t, 0.04, o, 0.25, 'bandpass', 1800); osc(c, 'square', 440, t + 0.03, 0.06, o, 0.06, 0.001, 0.06); });
  def('fanfare', (c, o, t) => { [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.34], [784, 0.5], [1047, 0.6]].forEach(([f, d]) => { osc(c, 'sawtooth', f, t + d, 0.28, o, 0.07, 0.01, 0.28, { lp: 2400 }); osc(c, 'square', f / 2, t + d, 0.28, o, 0.04, 0.01, 0.28); }); });
  def('detour', (c, o, t) => { osc(c, 'sine', 196, t, 1.2, o, 0.12, 0.2, 1.2, { vib: 4 }); osc(c, 'sine', 233, t + 0.3, 1.1, o, 0.1, 0.2, 1.1, { vib: 4 }); });
  def('whinny', (c, o, t) => { osc(c, 'sawtooth', 900, t, 0.6, o, 0.06, 0.02, 0.6, { slide: 500, vib: 18, lp: 2500 }); osc(c, 'sawtooth', 700, t + 0.45, 0.4, o, 0.05, 0.02, 0.4, { slide: 400, vib: 22, lp: 2000 }); });
  def('victory', (c, o, t) => { [[392, 0], [523, 0.12], [659, 0.24], [784, 0.36], [659, 0.52], [784, 0.62], [1047, 0.78]].forEach(([f, d]) => osc(c, 'square', f, t + d, d > 0.7 ? 0.7 : 0.16, o, 0.07, 0.004, d > 0.7 ? 0.7 : 0.16)); });
  def('defeat', (c, o, t) => { [[392, 0], [370, 0.3], [349, 0.6], [330, 0.9]].forEach(([f, d]) => osc(c, 'sawtooth', f, t + d, 0.5, o, 0.06, 0.01, 0.5, { lp: 1200, vib: 5 })); });
  def('hazard', (c, o, t) => { osc(c, 'sawtooth', 70, t, 0.8, o, 0.1, 0.1, 0.8, { lp: 400 }); nz(c, t, 0.8, o, 0.12, 'bandpass', 600, 2); });
})();
