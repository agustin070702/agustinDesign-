/* ============================================================
   PLANNING SESSION — UI ENHANCEMENTS
   Confeti · Polaroids · Progreso · Contadores de quiz
   No toca la lógica de Supabase ni el render principal.
   ============================================================ */

(() => {
    'use strict';

    /* ── Confeti ─────────────────────────────────────────────
       Espera 3s antes de activarse para que el render inicial
       no dispare confeti en rondas ya completadas.
    ──────────────────────────────────────────────────────── */
    const confettiFired = new Set();
    const COLORS = ['#4ade80','#f59e0b','#60a5fa','#f472b6','#fbbf24','#c084fc'];
    let sessionReady = false;
    setTimeout(() => { sessionReady = true; }, 3000);

    function spawnConfetti(badgeEl) {
        const rect = badgeEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;

        for (let i = 0; i < 18; i++) {
            const p     = document.createElement('div');
            const size  = 5 + Math.random() * 6;
            const angle = (i / 18) * 360 + Math.random() * 20;
            const dist  = 40 + Math.random() * 60;
            const delay = Math.random() * 0.12;

            Object.assign(p.style, {
                position:      'fixed',
                width:         size + 'px',
                height:        size + 'px',
                background:    COLORS[i % COLORS.length],
                borderRadius:  Math.random() > .5 ? '50%' : '3px',
                left:          cx + 'px',
                top:           cy + 'px',
                pointerEvents: 'none',
                zIndex:        '99999',
                transform:     'translate(-50%, -50%)',
                opacity:       '1',
                transition:    `transform .75s cubic-bezier(.25,.46,.45,.94) ${delay}s, opacity .75s ease ${delay + .1}s`,
            });
            document.body.appendChild(p);

            requestAnimationFrame(() => {
                const rad = (angle * Math.PI) / 180;
                const dx  = Math.cos(rad) * dist;
                const dy  = Math.sin(rad) * dist;
                p.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random() * 360}deg)`;
                p.style.opacity   = '0';
            });

            setTimeout(() => p.remove(), 1100);
        }
    }

    /* ── Polaroids ───────────────────────────────────────────
       Se inyectan como fila decorativa encima del board.
       Solo aparece en el tier list y el tablero colaborativo.
    ──────────────────────────────────────────────────────── */
    const POLAROIDS = [
        { src: 'fotos-tier/ravello-juntos-beso.webp', rot: -6, delay: '0s',    caption: 'ravello'  },
        { src: 'fotos-tier/positano-espaldas-2.webp', rot:  4, delay: '0.08s', caption: 'positano' },
        { src: 'fotos-tier/capri-juntos.webp',        rot: -2, delay: '0.16s', caption: 'capri'    },
        { src: 'fotos-tier/plaza-espana-juntos.webp', rot:  7, delay: '0.24s', caption: 'sevilla'  },
    ];

    function injectPolaroids(board) {
        if (board.querySelector('.ps-polaroids-bg')) return;

        const bg = document.createElement('div');
        bg.className = 'ps-polaroids-bg';

        POLAROIDS.forEach(({ src, rot, delay, caption }) => {
            const pol = document.createElement('div');
            pol.className = 'ps-polaroid';
            pol.style.cssText = `--rot:${rot}deg; --delay:${delay}`;

            const img = document.createElement('img');
            img.src     = src;
            img.alt     = caption || '';
            img.loading = 'lazy';
            pol.appendChild(img);

            if (caption) {
                const cap = document.createElement('span');
                cap.className = 'ps-polaroid-caption';
                cap.textContent = caption;
                pol.appendChild(cap);
            }

            bg.appendChild(pol);
        });

        board.insertBefore(bg, board.firstChild);
    }

    /* ── Progress indicator ──────────────────────────────────
       Lee la cantidad de .ps-round en el DOM y actualiza
       el pill "ronda X / 12" del header.
    ──────────────────────────────────────────────────────── */
    function updateProgress() {
        const el = document.getElementById('ps-round-progress');
        if (!el) return;

        const container   = document.getElementById('ps-rounds');
        const rounds      = document.querySelectorAll('#ps-rounds .ps-round');
        const isOnlyWait  = rounds.length === 1 && rounds[0].querySelector('.ps-waiting:not(.ps-done-badge)');

        if (!rounds.length || isOnlyWait) { el.hidden = true; return; }

        el.hidden = false;
        const n    = parseInt(container?.dataset.currentRound, 10) || Math.min(rounds.length, 12);
        const text = `ronda ${n} / 12`;

        if (el.textContent !== text) {
            el.textContent = text;
            el.style.animation = 'none';
            void el.offsetWidth;
            el.style.animation = 'ps-counter-pop .3s var(--ps-ease-2)';
        }
    }

    /* ── Quiz counter ────────────────────────────────────────
       Muestra "X / N respondidas" encima del listado de
       preguntas. Se actualiza en cada click sobre una opción.
    ──────────────────────────────────────────────────────── */
    function updateQuizCounter(quizEl) {
        const questions = quizEl.querySelectorAll('.ps-question');
        const answered  = quizEl.querySelectorAll('.ps-question:has(.ps-opt-selected)').length;
        const total     = questions.length;
        const parent    = quizEl.parentElement;
        if (!parent) return;

        let counter = parent.querySelector('.ps-quiz-counter');
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'ps-quiz-counter';
            quizEl.before(counter);
        }

        const isDone = answered === total;
        const text   = isDone ? '✓ todas respondidas' : `${answered} / ${total} respondidas`;

        if (counter.textContent !== text) {
            counter.textContent = text;
            counter.classList.toggle('ps-quiz-counter-done', isDone);
            counter.style.animation = 'none';
            void counter.offsetWidth;
            counter.style.animation = isDone
                ? 'ps-counter-pop .4s cubic-bezier(0.34,1.56,0.64,1)'
                : 'none';
        }
    }

    /* ── MutationObserver ────────────────────────────────────
       Escucha cambios en #ps-rounds para:
         · disparar confeti cuando aparece .ps-both-done
         · inyectar polaroids cuando aparece el board del tier list
         · actualizar el indicador de progreso
    ──────────────────────────────────────────────────────── */
    const observer = new MutationObserver(mutations => {
        let didUpdate = false;

        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                didUpdate = true;

                /* — Confeti en "ambos terminaron" — */
                const badge = node.classList?.contains('ps-both-done')
                    ? node
                    : node.querySelector?.('.ps-both-done');

                if (badge && sessionReady) {
                    const roundTag = node.querySelector?.('.ps-round-tag')?.textContent
                        || badge.closest?.('.ps-round')?.querySelector('.ps-round-tag')?.textContent
                        || badge.textContent;

                    if (!confettiFired.has(roundTag)) {
                        confettiFired.add(roundTag);
                        setTimeout(() => spawnConfetti(badge), 350);
                    }
                }

                /* — Polaroids en tier list / tablero — */
                const board = (node.classList?.contains('ps-tierlist-board') || node.classList?.contains('ps-tablero-board'))
                    ? node
                    : node.querySelector?.('.ps-tierlist-board, .ps-tablero-board');

                if (board) injectPolaroids(board);
            });
        });

        if (didUpdate) updateProgress();
    });

    /* ── Click en opciones de quiz ───────────────────────── */
    document.addEventListener('click', e => {
        const opt = e.target.closest('.ps-opt');
        if (!opt) return;
        const quiz = opt.closest('.ps-quiz');
        if (!quiz) return;
        setTimeout(() => updateQuizCounter(quiz), 0);
    });

    /* ── Init ─────────────────────────────────────────────── */
    function init() {
        const rounds = document.getElementById('ps-rounds');
        if (!rounds) { setTimeout(init, 150); return; }
        observer.observe(rounds, { childList: true, subtree: true });
        updateProgress();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
