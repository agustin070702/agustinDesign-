/* ============================================================
   PHOTO RANKING — GATE EN INDEX.HTML
   - Listener del botón "ranking" del footer
   - Overlay con input de password
   - Si la clave es correcta → setea sessionStorage y redirige
   - Aislado, no toca script.js ni style.css
   ============================================================ */

(() => {
    'use strict';

    // Misma clave que photo-ranking.config.js
    // (duplicada acá porque el config solo se carga en la página del tier list)
    const PASSWORD     = 'viajelito';
    const TARGET_URL   = 'photo-ranking.html';
    const SESSION_KEY  = 'pr_unlocked';

    const trigger = document.getElementById('prg-trigger');
    const overlay = document.getElementById('prg-overlay');
    if (!trigger || !overlay) return;

    const card    = overlay.querySelector('.prg-card');
    const form    = overlay.querySelector('#prg-form');
    const input   = overlay.querySelector('#prg-input');
    const errorEl = overlay.querySelector('#prg-error');
    const closeBtn = overlay.querySelector('.prg-close');

    let savedScrollY = 0;

    function lockScroll() {
        savedScrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollY}px`;
        document.body.style.width = '100%';
    }
    function unlockScroll() {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, savedScrollY);
    }

    function open() {
        overlay.classList.add('prg-open');
        lockScroll();
        errorEl.hidden = true;
        input.value = '';
        // Esperamos a que termine la transición de entrada antes de enfocar
        setTimeout(() => input.focus({ preventScroll: true }), 350);
    }

    function close() {
        overlay.classList.remove('prg-open');
        unlockScroll();
    }

    function triggerWrong() {
        errorEl.hidden = false;
        input.value = '';
        input.focus({ preventScroll: true });

        // Re-aplicar la animación de shake al error y a la tarjeta
        errorEl.classList.remove('prg-shake');
        card.classList.remove('prg-wrong');
        // Forzar reflow para reiniciar las animaciones
        void errorEl.offsetWidth;
        void card.offsetWidth;
        errorEl.classList.add('prg-shake');
        card.classList.add('prg-wrong');
    }

    function submit(e) {
        e.preventDefault();
        const val = (input.value || '').trim().toLowerCase();
        if (val === PASSWORD.toLowerCase()) {
            try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (_) {}
            window.location.href = TARGET_URL;
        } else {
            triggerWrong();
        }
    }

    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        open();
    });

    if (closeBtn) closeBtn.addEventListener('click', close);
    form.addEventListener('submit', submit);

    // ESC para cerrar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('prg-open')) close();
    });

    // Click en backdrop (cualquier zona del overlay que no sea la card o la X) para cerrar
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });
})();
