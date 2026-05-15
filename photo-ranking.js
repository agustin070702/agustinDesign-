/* ============================================================
   PHOTO RANKING — LÓGICA
   - Gate de password (frontend, no security real)
   - Render de tiers + pool desde config
   - Drag & drop con SortableJS
   - Sync en vivo + persistencia con Supabase
   - Lightbox (visor) con zoom in/out y navegación prev/next
   ============================================================ */

(() => {
    'use strict';

    /* ---------- 0. Config + helpers ---------- */
    const CFG = window.PR_CONFIG;
    if (!CFG) {
        console.error('[PR] photo-ranking.config.js no se cargó');
        return;
    }

    const $  = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

    const SESSION_KEY = 'pr_unlocked';
    const POOL_TIER   = 'pool';

    // Estado local: { photo_id: { tier, position } }
    const state = {};
    let sortableInstances = [];
    let supabaseClient = null;
    let presenceChannel = null;
    let dataChannel = null;
    let suppressEcho = new Set();

    // Estado del lightbox — declarado arriba para que setupLightbox() pueda
    // asignar a estas refs sin caer en TDZ (initApp se llama temprano).
    let lbState = {
        open:    false,
        index:   0,
        photos:  [],
        scale:   1,
        tx:      0,
        ty:      0,
        dragging:false,
        startX:  0,
        startY:  0,
        baseTx:  0,
        baseTy:  0,
        pinchDist: 0,
        pinchScale: 1
    };
    let lbEl, lbImg, lbStage, lbZoomLabel, lbCurrentEl, lbTotalEl;

    /* ============================================================
       1. PASSWORD GATE
       ============================================================ */
    const gateEl   = $('#pr-gate');
    const cardEl   = $('.pr-gate-card');
    const appEl    = $('.pr-app');
    const formEl   = $('#pr-gate-form');
    const inputEl  = $('#pr-gate-input');
    const errorEl  = $('#pr-gate-error');

    function unlock() {
        try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (_) {}
        gateEl.hidden = true;
        appEl.hidden = false;
        initApp();
    }

    function alreadyUnlocked() {
        try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (_) { return false; }
    }

    if (alreadyUnlocked()) {
        unlock();
    } else {
        setTimeout(() => inputEl && inputEl.focus(), 50);
    }

    function triggerGateWrong() {
        errorEl.hidden = false;
        inputEl.value = '';
        inputEl.focus();
        // Re-trigger animación
        cardEl.classList.remove('pr-wrong');
        void cardEl.offsetWidth;
        cardEl.classList.add('pr-wrong');
    }

    formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = (inputEl.value || '').trim().toLowerCase();
        if (val === String(CFG.password).toLowerCase()) {
            errorEl.hidden = true;
            unlock();
        } else {
            triggerGateWrong();
        }
    });

    /* ============================================================
       2. INIT APP
       ============================================================ */
    function initApp() {
        renderTiers();
        renderPhotos();
        setupSortables();
        connectSupabase();
        setupLightbox();
    }

    /* ---------- 2.1 Render de tiers ---------- */
    function renderTiers() {
        const board = $('#pr-board');
        board.innerHTML = '';

        CFG.tiers.forEach(t => {
            const row = document.createElement('div');
            row.className = 'pr-tier';
            row.style.setProperty('--tier-color', t.color);
            if (t.textColor) row.style.setProperty('--tier-text', t.textColor);
            const letterHtml = t.letter ? `<span class="pr-tier-letter">${escapeHtml(t.letter)}</span>` : '';
            const descHtml   = t.desc   ? `<span class="pr-tier-desc">${escapeHtml(t.desc)}</span>`   : '';
            row.innerHTML = `
                <div class="pr-tier-label">
                    ${letterHtml}
                    <span class="pr-tier-name">${escapeHtml(t.name)}</span>
                    ${descHtml}
                </div>
                <div class="pr-tier-row" data-tier="${escapeAttr(t.id)}"></div>
            `;
            board.appendChild(row);
        });
    }

    /* ---------- 2.2 Render de fotos en pool inicial ---------- */
    function renderPhotos() {
        const pool = $('#pr-pool');
        pool.innerHTML = '';

        if (!CFG.photos || CFG.photos.length === 0) {
            $('#pr-empty-hint').hidden = false;
            updatePoolCount();
            return;
        }
        $('#pr-empty-hint').hidden = true;

        CFG.photos.forEach((p, idx) => {
            state[p.id] = { tier: POOL_TIER, position: idx };
            pool.appendChild(buildCard(p));
        });
        updatePoolCount();
    }

    function buildCard(photo) {
        const card = document.createElement('div');
        card.className = 'pr-card pr-card-clickable';
        card.dataset.photoId = photo.id;
        card.draggable = true;
        const src = (CFG.photosFolder || '') + photo.file;
        card.innerHTML = `
            <img src="${escapeAttr(src)}"
                 alt="${escapeAttr(photo.alt || photo.id)}"
                 loading="lazy"
                 draggable="false">
        `;
        return card;
    }

    function updatePoolCount() {
        const n = $('#pr-pool').children.length;
        $('#pr-pool-count').textContent = n;
    }

    /* ---------- 2.3 Sortable ---------- */
    function setupSortables() {
        if (typeof Sortable === 'undefined') {
            console.error('[PR] Sortable no cargó');
            return;
        }
        sortableInstances.forEach(s => s.destroy());
        sortableInstances = [];

        const containers = [$('#pr-pool'), ...$$('.pr-tier-row')];
        containers.forEach(el => {
            const s = new Sortable(el, {
                group: 'pr-photos',
                animation: 280,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                ghostClass: 'pr-card-ghost',
                dragClass: 'pr-card-drag',
                chosenClass: 'pr-card-chosen',
                forceFallback: false,
                fallbackOnBody: true,
                fallbackTolerance: 5,
                swapThreshold: 0.6,
                invertSwap: true,
                delay: 80,
                delayOnTouchOnly: true,
                touchStartThreshold: 4,
                onStart: () => {
                    containers.forEach(c => c.classList.add('pr-drop-active'));
                },
                onEnd: (evt) => {
                    containers.forEach(c => c.classList.remove('pr-drop-active'));
                    handleDragEnd(evt);
                }
            });
            sortableInstances.push(s);
        });
    }

    function handleDragEnd(evt) {
        const movedId = evt.item.dataset.photoId;
        if (!movedId) return;

        const fromTier = evt.from.dataset.tier;
        const toTier   = evt.to.dataset.tier;

        const tiersToSync = new Set([fromTier, toTier]);
        const updates = [];

        tiersToSync.forEach(tier => {
            const container = (tier === POOL_TIER)
                ? $('#pr-pool')
                : $(`.pr-tier-row[data-tier="${cssEscape(tier)}"]`);
            if (!container) return;
            [...container.children].forEach((el, idx) => {
                const id = el.dataset.photoId;
                if (!id) return;
                state[id] = { tier, position: idx };
                updates.push({
                    photo_id:   id,
                    tier:       tier,
                    position:   idx,
                    updated_at: new Date().toISOString()
                });
                suppressEcho.add(id);
            });
        });

        updatePoolCount();

        if (supabaseClient) {
            supabaseClient
                .from('photo_rankings')
                .upsert(updates, { onConflict: 'photo_id' })
                .then(({ error }) => {
                    if (error) {
                        console.error('[PR] upsert fail', error);
                        setStatus('error al guardar', true);
                    } else {
                        setStatus('sincronizado');
                    }
                });
        }

        setTimeout(() => updates.forEach(u => suppressEcho.delete(u.photo_id)), 1500);
    }

    /* ============================================================
       3. SUPABASE — realtime + persistencia
       ============================================================ */
    function connectSupabase() {
        if (!CFG.supabaseUrl || CFG.supabaseUrl.startsWith('PEGA_AQUI')) {
            setStatus('sin supabase configurado', true);
            console.warn('[PR] Faltan credenciales de Supabase en photo-ranking.config.js');
            return;
        }
        if (typeof window.supabase === 'undefined') {
            setStatus('sdk no cargó', true);
            return;
        }

        try {
            supabaseClient = window.supabase.createClient(
                CFG.supabaseUrl,
                CFG.supabaseAnonKey,
                { realtime: { params: { eventsPerSecond: 20 } } }
            );
        } catch (err) {
            console.error('[PR] createClient fail', err);
            setStatus('error de conexión', true);
            return;
        }

        loadInitialState();

        dataChannel = supabaseClient
            .channel('pr-rankings')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'photo_rankings' },
                onRemoteChange
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') setStatus('en vivo');
            });

        presenceChannel = supabaseClient.channel('pr-presence', {
            config: { presence: { key: makeUserId() } }
        });
        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const stateMap = presenceChannel.presenceState();
                const count = Object.keys(stateMap).length || 1;
                $('#pr-count').textContent = count;
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await presenceChannel.track({ at: Date.now() });
                }
            });
    }

    async function loadInitialState() {
        const { data, error } = await supabaseClient
            .from('photo_rankings')
            .select('*');
        if (error) {
            console.error('[PR] load fail', error);
            setStatus('error al cargar', true);
            return;
        }
        if (!data || data.length === 0) return;
        data.forEach(row => applyRemoteRow(row));
    }

    function onRemoteChange(payload) {
        const row = payload.new || payload.old;
        if (!row || !row.photo_id) return;
        if (suppressEcho.has(row.photo_id)) return;
        if (payload.eventType === 'DELETE') return;
        applyRemoteRow(payload.new);
    }

    function applyRemoteRow(row) {
        if (!row || !row.photo_id) return;
        const card = document.querySelector(`.pr-card[data-photo-id="${cssEscape(row.photo_id)}"]`);
        if (!card) return;

        const targetContainer = (row.tier === POOL_TIER)
            ? $('#pr-pool')
            : $(`.pr-tier-row[data-tier="${cssEscape(row.tier)}"]`);
        if (!targetContainer) return;

        state[row.photo_id] = { tier: row.tier, position: row.position };

        const currentParent = card.parentElement;
        const currentIndex  = currentParent ? [...currentParent.children].indexOf(card) : -1;
        if (currentParent === targetContainer && currentIndex === row.position) return;

        const siblings = [...targetContainer.children].filter(c => c !== card);
        if (row.position >= siblings.length) {
            targetContainer.appendChild(card);
        } else {
            targetContainer.insertBefore(card, siblings[row.position]);
        }
        updatePoolCount();
    }

    /* ============================================================
       4. LIGHTBOX — visor con zoom + prev/next
       (Las declaraciones del estado están al tope del IIFE para evitar
       TDZ: setupLightbox() se invoca temprano por unlock() → initApp().)
       ============================================================ */
    const MIN_SCALE = 0.5;
    const MAX_SCALE = 5;
    const STEP      = 0.25;

    function setupLightbox() {
        lbEl         = $('#pr-lightbox');
        lbImg        = $('#pr-lb-img');
        lbStage      = $('#pr-lb-stage');
        lbZoomLabel  = $('#pr-lb-zoom');
        lbCurrentEl  = $('#pr-lb-current');
        lbTotalEl    = $('#pr-lb-total');

        if (!lbEl) return;

        // Click en una card (pool o tier) → abre lightbox
        // (Sortable usa delay/touch threshold y suprime el click si hubo drag real)
        const appEl = $('.pr-app');
        if (appEl) appEl.addEventListener('click', onCardClick);

        // Botones del lightbox
        $('#pr-lb-close').addEventListener('click', closeLightbox);
        $('#pr-lb-prev').addEventListener('click', () => navLightbox(-1));
        $('#pr-lb-next').addEventListener('click', () => navLightbox(1));
        $('#pr-lb-zoom-in').addEventListener('click', () => applyZoom(STEP));
        $('#pr-lb-zoom-out').addEventListener('click', () => applyZoom(-STEP));
        $('#pr-lb-reset').addEventListener('click', resetTransform);

        // Click en backdrop (fuera de la imagen) → cerrar
        lbEl.addEventListener('click', (e) => {
            if (e.target === lbEl || e.target === lbStage) closeLightbox();
        });

        // Doble-click sobre imagen para alternar zoom 1x / 2x
        lbImg.addEventListener('dblclick', (e) => {
            e.preventDefault();
            if (lbState.scale > 1) {
                resetTransform();
            } else {
                lbState.scale = 2;
                applyTransform();
            }
        });

        // Wheel = zoom centrado en cursor
        lbStage.addEventListener('wheel', onWheelZoom, { passive: false });

        // Drag con mouse (solo si está zoomeado)
        lbStage.addEventListener('mousedown', onPanStart);
        window.addEventListener('mousemove', onPanMove);
        window.addEventListener('mouseup', onPanEnd);

        // Touch: pinch + pan + swipe
        lbStage.addEventListener('touchstart', onTouchStart, { passive: false });
        lbStage.addEventListener('touchmove',  onTouchMove,  { passive: false });
        lbStage.addEventListener('touchend',   onTouchEnd);

        // Teclado
        document.addEventListener('keydown', onLightboxKey);
    }

    function onCardClick(e) {
        const card = e.target.closest('.pr-card');
        if (!card) return;
        // Aceptamos clicks en pool o en cualquier tier-row
        const parent = card.parentElement;
        if (!parent) return;
        const inPool = parent.id === 'pr-pool';
        const inTier = parent.classList && parent.classList.contains('pr-tier-row');
        if (!inPool && !inTier) return;
        const id = card.dataset.photoId;
        const idx = (CFG.photos || []).findIndex(p => p.id === id);
        if (idx < 0) return;
        openLightbox(idx);
    }

    function openLightbox(idx) {
        lbState.photos = CFG.photos || [];
        lbState.index  = idx;
        lbState.open   = true;
        resetTransformState();
        loadCurrentPhoto(false);
        lbEl.classList.add('pr-lb-open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lbState.open = false;
        lbEl.classList.remove('pr-lb-open');
        document.body.style.overflow = '';
    }

    function navLightbox(dir) {
        if (!lbState.photos.length) return;
        const n = lbState.photos.length;
        lbState.index = (lbState.index + dir + n) % n;
        resetTransformState();
        loadCurrentPhoto(true);
    }

    function loadCurrentPhoto(animateSwitch) {
        const p = lbState.photos[lbState.index];
        if (!p) return;
        const src = (CFG.photosFolder || '') + p.file;

        if (animateSwitch) {
            lbImg.classList.add('pr-lb-img-switching');
            // Pequeña espera para que se note el fade-out antes de cambiar src
            setTimeout(() => {
                lbImg.src = src;
                lbImg.alt = p.alt || p.id || '';
                // Esperar que cargue para sacar la clase
                if (lbImg.complete) {
                    requestAnimationFrame(() => lbImg.classList.remove('pr-lb-img-switching'));
                } else {
                    lbImg.onload = () => lbImg.classList.remove('pr-lb-img-switching');
                }
            }, 150);
        } else {
            lbImg.src = src;
            lbImg.alt = p.alt || p.id || '';
        }

        lbCurrentEl.textContent = (lbState.index + 1);
        lbTotalEl.textContent   = lbState.photos.length;
        applyTransform();
    }

    function resetTransformState() {
        lbState.scale = 1;
        lbState.tx = 0;
        lbState.ty = 0;
    }
    function resetTransform() {
        resetTransformState();
        applyTransform();
    }
    function applyZoom(delta, originX, originY) {
        const prev = lbState.scale;
        let next = clamp(prev + delta, MIN_SCALE, MAX_SCALE);
        if (next === prev) return;

        // Si pasamos un origen, ajustar tx/ty para zoom hacia el cursor
        if (originX != null && originY != null) {
            const rect = lbStage.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = originX - cx;
            const dy = originY - cy;
            const ratio = next / prev;
            lbState.tx = dx + (lbState.tx - dx) * ratio;
            lbState.ty = dy + (lbState.ty - dy) * ratio;
        }

        lbState.scale = next;
        // Si quedó en escala 1, recentrar
        if (Math.abs(lbState.scale - 1) < 0.01) {
            lbState.tx = 0;
            lbState.ty = 0;
        }
        applyTransform();
    }

    function applyTransform() {
        const { scale, tx, ty } = lbState;
        lbImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        lbZoomLabel.textContent = Math.round(scale * 100) + '%';
        // Mientras esté zoomeado se desactiva la transición (drag fluido)
        lbImg.style.transition = (scale === 1)
            ? 'transform 0.4s var(--pr-ease-3, cubic-bezier(0.4, 0, 0.2, 1)), opacity 0.4s ease'
            : 'none';
        lbStage.style.cursor = scale > 1 ? 'grab' : 'default';
    }

    function onWheelZoom(e) {
        e.preventDefault();
        const dir = e.deltaY > 0 ? -1 : 1;
        applyZoom(dir * STEP, e.clientX, e.clientY);
    }

    /* --- Pan con mouse --- */
    function onPanStart(e) {
        if (lbState.scale <= 1) return;
        lbState.dragging = true;
        lbState.startX = e.clientX;
        lbState.startY = e.clientY;
        lbState.baseTx = lbState.tx;
        lbState.baseTy = lbState.ty;
        lbStage.classList.add('pr-lb-grabbing');
        e.preventDefault();
    }
    function onPanMove(e) {
        if (!lbState.dragging) return;
        lbState.tx = lbState.baseTx + (e.clientX - lbState.startX);
        lbState.ty = lbState.baseTy + (e.clientY - lbState.startY);
        applyTransform();
    }
    function onPanEnd() {
        if (!lbState.dragging) return;
        lbState.dragging = false;
        lbStage.classList.remove('pr-lb-grabbing');
    }

    /* --- Touch: pinch + pan + swipe --- */
    let touchSwipeStartX = null;
    let touchMoved = false;

    function onTouchStart(e) {
        if (e.touches.length === 2) {
            const [a, b] = e.touches;
            lbState.pinchDist  = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
            lbState.pinchScale = lbState.scale;
            touchSwipeStartX = null;
        } else if (e.touches.length === 1) {
            const t = e.touches[0];
            if (lbState.scale > 1) {
                lbState.dragging = true;
                lbState.startX = t.clientX;
                lbState.startY = t.clientY;
                lbState.baseTx = lbState.tx;
                lbState.baseTy = lbState.ty;
            } else {
                touchSwipeStartX = t.clientX;
                touchMoved = false;
            }
        }
    }
    function onTouchMove(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const [a, b] = e.touches;
            const d = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
            const ratio = d / (lbState.pinchDist || d);
            lbState.scale = clamp(lbState.pinchScale * ratio, MIN_SCALE, MAX_SCALE);
            applyTransform();
        } else if (e.touches.length === 1) {
            const t = e.touches[0];
            if (lbState.dragging) {
                e.preventDefault();
                lbState.tx = lbState.baseTx + (t.clientX - lbState.startX);
                lbState.ty = lbState.baseTy + (t.clientY - lbState.startY);
                applyTransform();
            } else if (touchSwipeStartX != null) {
                if (Math.abs(t.clientX - touchSwipeStartX) > 6) touchMoved = true;
            }
        }
    }
    function onTouchEnd(e) {
        // Swipe horizontal con un dedo cuando no hay zoom → prev/next
        if (touchSwipeStartX != null && lbState.scale === 1 && touchMoved) {
            const endX = (e.changedTouches[0] || {}).clientX || touchSwipeStartX;
            const dx = endX - touchSwipeStartX;
            if (Math.abs(dx) > 60) {
                navLightbox(dx > 0 ? -1 : 1);
            }
        }
        touchSwipeStartX = null;
        touchMoved = false;
        lbState.dragging = false;
    }

    function onLightboxKey(e) {
        if (!lbState.open) return;
        switch (e.key) {
            case 'Escape':     closeLightbox(); break;
            case 'ArrowLeft':  navLightbox(-1); break;
            case 'ArrowRight': navLightbox(1);  break;
            case '+':
            case '=':          applyZoom(STEP); break;
            case '-':
            case '_':          applyZoom(-STEP); break;
            case '0':          resetTransform(); break;
        }
    }

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    /* ============================================================
       5. UTILIDADES
       ============================================================ */
    function setStatus(msg, isError = false) {
        const el = $('#pr-status');
        if (!el) return;
        el.textContent = msg;
        el.classList.toggle('pr-status-error', !!isError);
    }

    function makeUserId() {
        return 'u-' + Math.random().toString(36).slice(2, 8);
    }

    function escapeHtml(s) {
        return String(s ?? '').replace(/[&<>"']/g, c => ({
            '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
        })[c]);
    }
    function escapeAttr(s) { return escapeHtml(s); }

    function cssEscape(s) {
        if (window.CSS && CSS.escape) return CSS.escape(s);
        return String(s).replace(/["\\]/g, '\\$&');
    }
})();
