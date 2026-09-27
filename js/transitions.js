/* Screen transitions and screen music that other files don't have to know about.
   - SBR.transitions.pick(style): ui.transition asks it which wipe to use. The first plain wipe after a battle
     becomes the battle exit wipe ('battleout'); main.js asks for 'pageturn' on the act card.
   - The event panel turns in like a manga page, with its own music while it is open.
   - The Map drawer plays the map theme; the rewards screen plays the victory loop. */
'use strict';
(() => {
  const M = () => SBR.music;
  let exitAt = 0;
  SBR.transitions = {
    pick(style) {
      const fresh = exitAt && Date.now() - exitAt < 60000;
      if (fresh && (style === 'slash' || style === 'fade')) { exitAt = 0; return 'battleout'; }
      if (!fresh) exitAt = 0;
      return style;
    },
    /** force the next plain wipe to be the battle exit wipe */
    battleEnded() { exitAt = Date.now(); },
  };

  // the battle's end: wrap SBR.battle.run from outside (js/battle-ui.js stays untouched)
  if (SBR.battle && SBR.battle.run) {
    const base = SBR.battle.run;
    SBR.battle.run = function (...a) { return Promise.resolve(base.apply(this, a)).then(res => { SBR.transitions.battleEnded(); return res; }); };
  }

  // screen music that comes and goes with a panel: remember what was playing and put it back
  function scoped(key) {
    const prev = M().current || M().wanted;
    if (prev === key) return () => {};
    M().play(key);
    return () => { const now = M().current || M().wanted; if (now === key) M().play(prev || M().themeForStage()); };
  }
  const idle = () => !SBR.inBattle;

  // rewards: the victory loop until the screen closes
  if (SBR.ui && SBR.ui.rewardsScreen) {
    const base = SBR.ui.rewardsScreen;
    SBR.ui.rewardsScreen = function (res) {
      const M2 = M();
      if (M2) M2.play('victory');
      return base.call(this, res).then(x => { if (M2 && (M2.current === 'victory' || M2.wanted === 'victory')) M2.play(M2.themeForStage()); return x; });
    };
  }

  // watch the overlay for event panels and the map drawer (both are opened from several places)
  function watch() {
    const ov = document.getElementById('overlay'); if (!ov || !window.MutationObserver) return;
    let evRestore = null, mapRestore = null, evTimer = 0;
    const has = sel => !!ov.querySelector(sel);
    new MutationObserver(muts => {
      for (const m of muts) m.addedNodes.forEach(n => {
        if (!(n instanceof HTMLElement)) return;
        if (n.classList.contains('event-modal')) {
          if (!SBR.settings.reducedMotion) { n.classList.add('tx-pageflip'); SBR.audio.play('page'); }
          clearTimeout(evTimer);
          // a stale scope (the screen changed the music under it) is replaced
          if ((!evRestore || (M().current || M().wanted) !== 'event') && idle() && SBR.run) evRestore = scoped('event');
        }
        if (n.querySelector && n.querySelector('.map-screen') && !mapRestore && idle()) mapRestore = scoped('map');
      });
      if (evRestore && !has('.event-modal')) {
        clearTimeout(evTimer);
        evTimer = setTimeout(() => { if (evRestore && !has('.event-modal')) { const f = evRestore; evRestore = null; if (idle()) f(); } }, 400);
      }
      if (mapRestore && !has('.map-screen')) { const f = mapRestore; mapRestore = null; if (idle()) f(); }
    }).observe(ov, { childList: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();
