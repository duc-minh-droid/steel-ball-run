/* UX helpers (css/ux.css is the matching stylesheet).
   - Enter / Space continues a result or rewards panel, and those buttons show the ↵ hint. */
'use strict';

(() => {
  const CONT = '.result-panel > .btn-primary, .rewards > .btn-primary';
  const blocked = () => document.querySelector('.dlg-wrap, .sprint, .boss-intro, .dice-modal, .cutin');
  document.addEventListener('keydown', e => {
    if ((e.key !== 'Enter' && e.key !== ' ') || e.repeat || blocked()) return;
    const a = document.activeElement;
    if (a && a.matches && a.matches('input, textarea, select, [contenteditable]')) return;
    const wraps = document.querySelectorAll('#overlay > .modal-wrap');
    const top = wraps[wraps.length - 1];
    const b = top && top.querySelector(CONT);
    if (!b || b.classList.contains('disabled')) return;
    e.preventDefault();
    if (a && a !== document.body && a.blur) a.blur();
    b.click();
  });
  const deco = node => {
    if (!node.querySelectorAll) return;
    const list = node.matches && node.matches(CONT) ? [node] : node.querySelectorAll(CONT);
    list.forEach(b => { if (!b.querySelector('.ux-kbd')) b.insertAdjacentHTML('beforeend', '<kbd class="ux-kbd">↵</kbd>'); });
  };
  const start = () => {
    const o = document.getElementById('overlay');
    if (!o) return;
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) deco(n); }))).observe(o, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
