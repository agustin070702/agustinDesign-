/* ============================================================
   PHOTO RANKING — GATE EN INDEX.HTML
   Gate eliminado: redirige directo a planning-session.html
   ============================================================ */

(() => {
    'use strict';

    const TARGET_URL = 'planning-session.html';

    const trigger = document.getElementById('prg-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = TARGET_URL;
    });
})();
