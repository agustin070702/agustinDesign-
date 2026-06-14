/* ============================================================
   PLANNING SESSION — LÓGICA COMPLETA
   Stack: Vanilla JS + Supabase Realtime + SortableJS
   12 rondas

   SQL para crear las tablas en Supabase:
   ──────────────────────────────────────
   CREATE TABLE planning_session (
     key        TEXT PRIMARY KEY,
     value      JSONB,
     updated_at TIMESTAMPTZ DEFAULT now()
   );
   ALTER TABLE planning_session ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "allow anon all" ON planning_session
     FOR ALL TO anon USING (true) WITH CHECK (true);
   ALTER PUBLICATION supabase_realtime ADD TABLE planning_session;
   ============================================================ */

(() => {
    'use strict';

    /* ── CONFIG ── */
    const SUPABASE_URL     = 'https://lnfcyubjuyfligrkphcf.supabase.co';
    const SUPABASE_KEY     = 'sb_publishable_wWAgSocPgRxv5wa2ZwCl6w_YL4ZvqIq';
    const TABLE            = 'planning_session';
    const SESSION_USER     = 'ps_user';
    const SESSION_UNLOCKED = 'ps_unlocked';
    const PASSWORD         = 'siempre';
    const TOTAL_ROUNDS     = 12;

    /* ── RONDA 7: ¿Quién de los dos? ── */
    const QUIEN_QS = [
        '¿Quién llora primero en una película?',
        '¿Quién es más cabeza dura?',
        '¿Quién elige mejor la música?',
        '¿Quién cede primero después de pelear?',
        '¿Quién se estresa más antes de un viaje?',
        '¿Quién es más dramático/a?',
        '¿Quién recuerda más los detalles de la relación?',
        '¿Quién tiene mejores ideas de planes?',
        '¿Quién expresa más lo que siente?',
        '¿Quién tiene más fe en lo nuestro?',
    ];

    /* ── RONDA 6: Esto o aquello ── */
    const QUIZ = [
        { q: '¿Destino natural ideal?',
          opts: ['Playa', 'Montaña', 'Lago', 'Bosque'] },
        { q: '¿Dónde vivir juntos?',
          opts: ['Departamento en el centro', 'Casa con patio', 'Algo pequeño pero en el barrio perfecto'] },
        { q: '¿Perro o gato?',
          opts: ['Perro', 'Gato'] },
        { q: '¿Dónde vivir si pudieran elegir?',
          opts: ['Santiago', 'Otra ciudad en Latinoamérica', 'Ciudad europea', 'Ciudad asiática', 'Donde caiga'] },
        { q: '¿Cómo viajar?',
          opts: ['Un viaje largo al año', 'Varios viajes cortos', 'Un viaje sorpresa sin planear nada'] },
        { q: '¿Cena de semana típica?',
          opts: ['Cocinar juntos en casa', 'Salir a un restaurant', 'Pedir delivery y ver algo'] },
        { q: '¿Plan de viernes por la noche?',
          opts: ['Película acostados', 'Cenar en algún lugar especial', 'Ir al cine', 'Quedarnos y cocinar algo rico', 'Salir a algo: bar, concierto, show', 'Un plan sorpresa, que decida el otro'] },
        { q: '¿Cómo gastarían un inesperado fin de semana libre juntos?',
          opts: ['Viaje espontáneo sin planear nada', 'Quedarse en casa sin compromisos', 'Recorrer la ciudad como turistas', 'Invitar amigos y hacer algo en grupo'] },
        { q: '¿Próximo destino internacional si pudieran ir mañana?',
          opts: ['Ciudades europeas con historia, arte y vida nocturna', 'Asia: templos, street food y caos bonito', 'Naturaleza extrema: glaciares, selva, volcanes', 'Playas y calor caribeñas o del Mediterráneo', 'Una ciudad cosmopolita enorme que no hayamos pisado', 'Algo raro que casi nadie hace'] },
        { q: '¿Primer gran gasto importante juntos?',
          opts: ['Auto', 'Departamento propio', 'Viaje largo de verdad', 'Emprender algo juntos'] },
        { q: '¿Qué harían si tuvieran un año libre sin consecuencias?',
          opts: ['Viajar 6 meses sin parar', 'Mudarse a vivir a otra ciudad', 'Estudiar algo nuevo juntos', 'Lanzar un proyecto propio'] },
        { q: '¿Hijos?',
          opts: ['Antes de los 30', 'Después de los 30, sin apuro', 'Solo si las condiciones son las ideales', 'No quiero tener hijos', 'Quizás adoptar algún día', 'Todavía no tengo idea honestamente'] },
        { q: '¿Casarse o no?',
          opts: ['Casarse', 'Vivir juntos sin casarse', 'Vivir juntos primero, casarse después'] },
        { q: '¿Mascota ideal?',
          opts: ['Perro grande', 'Perro chico', 'Gato', 'Perro y gato juntos', 'Algo distinto: conejo, pájaro, tortuga', 'Por ahora ninguna'] },
        { q: '¿Cuándo mudarse juntos?',
          opts: ['Apenas se pueda, sin esperar el momento perfecto', 'Cuando los dos estén más estables', 'Cuando tengamos un plan concreto y claro'] }
    ];

    /* ── RONDA 10: A qué plazo — tablero colaborativo ── */
    const TABLERO_DEFAULTS = [
        { id: 'tbl_vivir_juntos',  label: 'vivir juntos' },
        { id: 'tbl_mascota',       label: 'primera mascota juntos' },
        { id: 'tbl_viaje_largo',   label: 'viaje largo los dos solos (+10 días)' },
        { id: 'tbl_emprender',     label: 'emprender algo juntos' },
        { id: 'tbl_compromiso',    label: 'comprometerse' },
        { id: 'tbl_casarse',       label: 'casarse' },
        { id: 'tbl_hijos',         label: 'tener hijos' },
        { id: 'tbl_mudarse',       label: 'mudarse a otro barrio o ciudad' },
        { id: 'tbl_vivir_afuera',  label: 'vivir afuera por un período' },
        { id: 'tbl_depto',         label: 'depto o casa propio' },
        { id: 'tbl_noches',        label: 'más noches solos sin planes fijos' },
        { id: 'tbl_tradicion',     label: 'una tradición inventada solo nuestra' },
    ];

    const TABLERO_COLS = [
        { key: 'esteAnio',    label: '[ este año ]',       sub: 'antes de que termine el año' },
        { key: 'en2a3',       label: '[ 2 a 3 años ]',     sub: 'pronto, pero sin apuro' },
        { key: 'en5mas',      label: '[ 5+ años ]',         sub: 'largo plazo, sin fecha exacta' },
        { key: 'quizasNo',    label: '[ quizás no ]',      sub: 'no por ahora o quizás nunca' },
    ];

    /* ── ESTADO ── */
    let sb              = null;
    let presenceChannel = null;
    let dataChannel     = null;
    let currentUser     = null;
    const other = u => u === 'agus' ? 'jo' : 'agus';
    const db = {};
    const suppressEcho = new Set();
    let quizAnswers  = {};
    let quienAnswers = {};

    const drafts = {
        r1:       ['', '', ''],
        r2:       ['', '', ''],
        r3:       { ranking: ['', '', ''], mencion: '' },
        r4:       '',
        r5:       '',
        // r6:  quiz  — sessionStorage 'ps_quiz_draft'
        // r7:  quién — sessionStorage 'ps_quien_draft'
        r8:       ['', '', ''],
        r9:       { q1: '', q2: '', q3: '' },
        r10input: ['', '', '', '', ''],  // fase input del tablero
        r11:      { y1: '', y3: '', someday: '' },
        r12:      ''
    };

    /* ── HELPERS DOM ── */
    const $ = (sel, root = document) => root.querySelector(sel);
    const h = s => String(s ?? '').replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

    function el(tag, cls) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        return e;
    }

    function setStatus(msg, isErr = false) {
        const s = $('#ps-status');
        if (!s) return;
        s.textContent = msg;
        s.classList.toggle('ps-status-error', isErr);
    }

    /* ── GATE ── */
    const gateEl   = $('#ps-gate');
    const gateCard = $('#ps-gate-card');
    const appEl    = $('.ps-app');
    const stepPwd  = $('#ps-step-pwd');
    const stepUser = $('#ps-step-user');
    const pwdForm  = $('#ps-pwd-form');
    const pwdInput = $('#ps-pwd-input');
    const pwdError = $('#ps-pwd-error');

    function initGate() {
        // Siempre pedir clave al cargar la página (no cachear el unlock)
        sessionStorage.removeItem(SESSION_UNLOCKED);
        setTimeout(() => pwdInput && pwdInput.focus({ preventScroll: true }), 400);
        pwdForm.addEventListener('submit', e => {
            e.preventDefault();
            const val = (pwdInput.value || '').trim().toLowerCase();
            if (val === PASSWORD) {
                sessionStorage.setItem(SESSION_UNLOCKED, '1');
                pwdError.hidden = true;
                showUserStep();
            } else {
                pwdError.hidden = false;
                pwdInput.value = '';
                pwdInput.focus({ preventScroll: true });
                gateCard.classList.remove('ps-wrong');
                void gateCard.offsetWidth;
                gateCard.classList.add('ps-wrong');
            }
        });
    }

    function showUserStep() {
        stepPwd.hidden  = true;
        stepUser.hidden = false;
        stepUser.querySelectorAll('.ps-gate-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const u = btn.dataset.user;
                sessionStorage.setItem(SESSION_USER, u);
                startSession(u);
            });
        });
    }

    function startSession(user) {
        currentUser   = user;
        gateEl.hidden = true;
        appEl.hidden  = false;
        connectSupabase();
    }

    /* ── SUPABASE ── */
    function connectSupabase() {
        if (typeof window.supabase === 'undefined') { setStatus('sdk no cargó', true); return; }
        try {
            sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY,
                { realtime: { params: { eventsPerSecond: 20 } } });
        } catch (e) { setStatus('error de conexión', true); return; }

        loadAll().then(() => { markUserReady(); render(); });

        dataChannel = sb.channel('ps-data')
            .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, onRemoteChange)
            .subscribe(s => { if (s === 'SUBSCRIBED') setStatus('en vivo'); });

        presenceChannel = sb.channel('ps-presence', {
            config: { presence: { key: 'u-' + Math.random().toString(36).slice(2, 8) } }
        });
        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const n = Object.keys(presenceChannel.presenceState()).length || 1;
                const c = $('#ps-count');
                if (c) c.textContent = n;
            })
            .subscribe(async s => { if (s === 'SUBSCRIBED') await presenceChannel.track({ at: Date.now() }); });
    }

    async function loadAll() {
        setStatus('cargando');
        const { data, error } = await sb.from(TABLE).select('*');
        if (error) { setStatus('error al cargar', true); return; }
        (data || []).forEach(r => { db[r.key] = r.value; });
        setStatus('cargado');
    }

    async function upsert(key, value) {
        suppressEcho.add(key);
        db[key] = value;
        setStatus('guardando');
        const { error } = await sb.from(TABLE)
            .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
        if (error) setStatus('error al guardar', true);
        else        setStatus('sincronizado');
        setTimeout(() => suppressEcho.delete(key), 2000);
    }

    function onRemoteChange(payload) {
        const row = payload.new || payload.old;
        if (!row || !row.key) return;
        if (suppressEcho.has(row.key)) return;
        if (payload.eventType === 'DELETE') return;
        db[row.key] = row.value;
        render();
    }

    /* ── USER READY ── */
    async function markUserReady() {
        const ready = db['user_ready'] || { agus: false, jo: false };
        ready[currentUser] = true;
        await upsert('user_ready', ready);
        if (!db['current_round']) await upsert('current_round', 1);
        render();
    }

    function bothReady() {
        const r = db['user_ready'] || {};
        return r.agus && r.jo;
    }

    /* ── RENDER ── */
    let renderTimer = null;

    function render() {
        clearTimeout(renderTimer);
        renderTimer = setTimeout(_doRender, 60);
    }

    function _doRender() {
        const container = $('#ps-rounds');
        if (!container) return;
        const currentRound = db['current_round'] || 1;
        const frag = document.createDocumentFragment();

        if (!bothReady()) {
            frag.appendChild(waitingCard('esperando que el otro se conecte...'));
        } else if (db['session_complete']) {
            const closeCard = buildClosing();
            if (closeCard) frag.appendChild(closeCard);
        } else if (currentRound <= TOTAL_ROUNDS) {
            container.dataset.currentRound = currentRound;
            const card = buildRound(currentRound, currentRound);
            if (card) frag.appendChild(card);
        }

        container.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
        container.style.opacity    = '0';
        container.style.transform  = 'translateY(8px)';
        setTimeout(() => {
            container.innerHTML = '';
            container.appendChild(frag);
            requestAnimationFrame(() => {
                container.style.opacity   = '1';
                container.style.transform = 'translateY(0)';
            });
        }, 190);
    }

    /* ── ROUND BUILDER ── */
    function buildRound(r, current) {
        switch (r) {
            case 1:  return buildRound1(r, current);
            case 2:  return buildRound2(r, current);
            case 3:  return buildRound3(r, current);
            case 4:  return buildRound4(r, current);
            case 5:  return buildRound5(r, current);
            case 6:  return buildRound6(r, current);
            case 7:  return buildRound7(r, current);
            case 8:  return buildRound8(r, current);
            case 9:  return buildRound9(r, current);
            case 10: return buildRound10(r, current);
            case 11: return buildRound11(r, current);
            case 12: return buildRound12(r, current);
        }
    }

    function roundCard(delay) {
        const d = el('div', 'ps-round');
        d.style.animationDelay = (delay || 0) + 'ms';
        return d;
    }

    function roundHeader(card, tag, title, sub) {
        const t = el('div', 'ps-round-tag'); t.textContent = tag;
        const tt = el('h2', 'ps-round-title'); tt.textContent = title;
        card.appendChild(t);
        card.appendChild(tt);
        if (sub) { const s = el('p', 'ps-round-sub'); s.textContent = sub; card.appendChild(s); }
    }

    function myKey(r)    { return `round_${r}_${currentUser}`; }
    function bothDone(r) { return db[`round_${r}_agus`] != null && db[`round_${r}_jo`] != null; }
    function iDone(r)    { return db[myKey(r)] != null; }

    function waitingBadge() {
        const b = el('div', 'ps-done-badge');
        b.textContent = `listo · esperando a ${other(currentUser)}`;
        return b;
    }
    function bothDoneBadge() {
        const b = el('div', 'ps-done-badge ps-both-done');
        b.textContent = 'ambos respondieron';
        return b;
    }
    function waitingCard(msg) {
        const c = roundCard(0);
        const w = el('div', 'ps-waiting');
        const d = el('span', 'ps-waiting-dot');
        w.appendChild(d);
        w.insertAdjacentText('beforeend', msg);
        c.appendChild(w);
        return c;
    }

    async function advanceRound(from) {
        if ((db['current_round'] || 1) <= from) {
            await upsert('current_round', from + 1);
            render();
        }
    }

    function buildNextRoundBtn(r) {
        const wrap = el('div', 'ps-next-wrap');
        const btn = el('button', 'ps-next-btn');
        btn.textContent = 'siguiente ronda →';
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            await advanceRound(r);
        });
        wrap.appendChild(btn);
        return wrap;
    }

    function makeInput(placeholder, getValue, setValue) {
        const inp = el('input', 'ps-input');
        inp.type = 'text'; inp.placeholder = placeholder; inp.value = getValue() || '';
        inp.addEventListener('input', () => setValue(inp.value));
        return inp;
    }

    /* ══════════════════════════════════════════════════════════
       RONDA 1 — agosto
    ══════════════════════════════════════════════════════════ */
    function buildRound1(r, current) {
        const card = roundCard(100);
        roundHeader(card, '[ agosto ]', 'La semana del 10 al 16 de agosto', 'Tres ideas para esa semana. Sin filtro.');

        if (iDone(r)) {
            if (bothDone(r)) { card.appendChild(bothDoneBadge()); card.appendChild(buildReveal1()); if (current === r) card.appendChild(buildNextRoundBtn(r)); }
            else card.appendChild(waitingBadge());
            return card;
        }

        const fields = el('div', 'ps-fields');
        const r1ph = ['primera idea', 'segunda idea', 'tercera idea'];
        const inputs = [0, 1, 2].map(i => {
            const wrap = el('div');
            const lbl = el('label', 'ps-field-label'); lbl.textContent = `idea ${i + 1}`;
            const inp = makeInput(r1ph[i], () => drafts.r1[i], v => { drafts.r1[i] = v; });
            wrap.appendChild(lbl); wrap.appendChild(inp); fields.appendChild(wrap);
            return inp;
        });

        const btn = el('button', 'ps-submit'); btn.textContent = 'enviar ideas';
        btn.addEventListener('click', async () => {
            const vals = inputs.map(i => i.value.trim()).filter(Boolean);
            if (!vals.length) return;
            btn.disabled = true; drafts.r1 = ['', '', ''];
            await upsert(myKey(r), vals); render();
        });

        card.appendChild(fields); card.appendChild(btn);
        return card;
    }

    function buildReveal1() {
        const wrap = el('div', 'ps-reveal');
        ['agus', 'jo'].forEach(u => {
            const col = el('div', 'ps-reveal-col');
            const who = el('span', 'ps-reveal-who'); who.textContent = u; col.appendChild(who);
            (db[`round_1_${u}`] || []).forEach((idea, i) => {
                const it = el('div', 'ps-reveal-item');
                const num = el('span', 'ps-item-num'); num.textContent = `idea ${i + 1}`;
                const p = el('p'); p.textContent = idea;
                it.appendChild(num); it.appendChild(p); col.appendChild(it);
            });
            wrap.appendChild(col);
        });
        return wrap;
    }

    /* ══════════════════════════════════════════════════════════
       RONDA 2 — lo que me gusta de ti  [NUEVA]
    ══════════════════════════════════════════════════════════ */
    function buildRound2(r, current) {
        const card = roundCard(120);
        roundHeader(card, '[ lo que me gusta de ti ]', 'Tres cosas que me gustan de ti',
            'No tiene que ser perfecto, tiene que ser honesto. Específico gana sobre bonito.');

        if (iDone(r)) {
            if (bothDone(r)) { card.appendChild(bothDoneBadge()); card.appendChild(buildReveal2()); if (current === r) card.appendChild(buildNextRoundBtn(r)); }
            else card.appendChild(waitingBadge());
            return card;
        }

        const fields = el('div', 'ps-fields');
        const labels = ['primera cosa', 'segunda cosa', 'tercera cosa'];
        const inputs = [0, 1, 2].map(i => {
            const wrap = el('div');
            const lbl = el('label', 'ps-field-label'); lbl.textContent = labels[i];
            const inp = makeInput(['escríbelo', 'otra cosa', 'una más'][i], () => drafts.r2[i], v => { drafts.r2[i] = v; });
            wrap.appendChild(lbl); wrap.appendChild(inp); fields.appendChild(wrap);
            return inp;
        });

        const btn = el('button', 'ps-submit'); btn.textContent = 'enviar';
        btn.addEventListener('click', async () => {
            const vals = inputs.map(i => i.value.trim()).filter(Boolean);
            if (!vals.length) return;
            btn.disabled = true; drafts.r2 = ['', '', ''];
            await upsert(myKey(r), vals); render();
        });

        card.appendChild(fields); card.appendChild(btn);
        return card;
    }

    function buildReveal2() {
        const wrap = el('div', 'ps-reveal');
        ['agus', 'jo'].forEach(u => {
            const col = el('div', 'ps-reveal-col');
            const who = el('span', 'ps-reveal-who'); who.textContent = `${u} sobre ${other(u)}`; col.appendChild(who);
            (db[`round_2_${u}`] || []).forEach((cosa, i) => {
                const it = el('div', 'ps-reveal-item');
                const num = el('span', 'ps-item-num'); num.textContent = (i + 1) + '.';
                const p = el('p'); p.textContent = cosa;
                it.appendChild(num); it.appendChild(p); col.appendChild(it);
            });
            wrap.appendChild(col);
        });
        return wrap;
    }

    /* ══════════════════════════════════════════════════════════
       RONDA 3 — top 3 + mención  (era r2)
    ══════════════════════════════════════════════════════════ */
    function buildRound3(r, current) {
        const card = roundCard(150);
        roundHeader(card, '[ top 3 + mención ]', 'Top 3 destinos soñados',
            'Más una mención honrosa. Sin filtro de plata ni de tiempo.');

        if (iDone(r)) {
            if (bothDone(r)) {
                card.appendChild(bothDoneBadge());
                card.appendChild(buildReveal3());
                card.appendChild(buildTierListSection(r, current));
                if (current === r && tierlistReady()) card.appendChild(buildNextRoundBtn(r));
            } else card.appendChild(waitingBadge());
            return card;
        }

        const fields = el('div', 'ps-fields');
        const inps = ['primero', 'segundo', 'tercero'].map((label, i) => {
            const wrap = el('div');
            const lbl = el('label', 'ps-field-label'); lbl.textContent = label;
            const inp = makeInput('destino', () => drafts.r3.ranking[i], v => { drafts.r3.ranking[i] = v; });
            wrap.appendChild(lbl); wrap.appendChild(inp); fields.appendChild(wrap);
            return inp;
        });
        const wrapM = el('div');
        const lblM = el('label', 'ps-field-label'); lblM.textContent = 'mención honrosa';
        const inpM = makeInput('el que casi entró', () => drafts.r3.mencion, v => { drafts.r3.mencion = v; });
        wrapM.appendChild(lblM); wrapM.appendChild(inpM); fields.appendChild(wrapM);

        const btn = el('button', 'ps-submit'); btn.textContent = 'enviar ranking';
        btn.addEventListener('click', async () => {
            const vals = inps.map(i => i.value.trim());
            const men  = inpM.value.trim();
            if (!vals[0]) return;
            btn.disabled = true; drafts.r3 = { ranking: ['', '', ''], mencion: '' };
            await upsert(myKey(r), { ranking: vals, mencion: men }); render();
        });

        card.appendChild(fields); card.appendChild(btn);
        return card;
    }

    function buildReveal3() {
        const wrap = el('div', 'ps-reveal');
        ['agus', 'jo'].forEach(u => {
            const col = el('div', 'ps-reveal-col');
            const who = el('span', 'ps-reveal-who'); who.textContent = u; col.appendChild(who);
            const data = db[`round_3_${u}`] || {};
            (data.ranking || []).forEach((dest, i) => {
                const it = el('div', 'ps-reveal-item');
                const num = el('span', 'ps-item-num'); num.textContent = `# ${i + 1}`;
                const p = el('p'); p.textContent = dest || '–';
                it.appendChild(num); it.appendChild(p); col.appendChild(it);
            });
            if (data.mencion) {
                const it = el('div', 'ps-reveal-item');
                const num = el('span', 'ps-item-num'); num.textContent = 'mención';
                const p = el('p'); p.textContent = data.mencion;
                it.appendChild(num); it.appendChild(p); col.appendChild(it);
            }
            wrap.appendChild(col);
        });
        return wrap;
    }

    /* ── TIER LIST COLABORATIVO (embebido en ronda 3) ── */
    function tierlistReady() { const r = db['tierlist_ready'] || {}; return r.agus && r.jo; }
    let tierSortables = [];

    function buildTierListSection(roundNum, current) {
        const section = el('div', 'ps-tierlist ps-tierlist-board');
        const sep = document.createElement('hr');
        sep.style.cssText = 'border:none;border-top:1px solid rgba(32,32,32,0.08);margin:28px 0';
        section.appendChild(sep);

        const tag = el('div', 'ps-round-tag'); tag.textContent = '[ tier list colaborativo ]';
        const title = el('h3'); title.style.cssText = 'font-size:1.3rem;font-weight:600;letter-spacing:-0.04em;margin:0 0 8px';
        title.textContent = 'los destinos de los dos';
        const sub = el('p', 'ps-round-sub'); sub.style.marginBottom = '20px';
        sub.textContent = 'Arrastren las cards a donde les corresponda. Los dos lo ven en tiempo real.';
        section.appendChild(tag); section.appendChild(title); section.appendChild(sub);

        if (tierlistReady()) {
            const done = el('div', 'ps-done-badge ps-both-done'); done.textContent = 'tier list cerrado';
            section.appendChild(done);
            section.appendChild(buildTierlistReveal(db['tierlist'] || {}));
            return section;
        }

        if (!db['tierlist']) {
            const items = collectDestinations();
            const initial = { items, tiers: { S: [], A: [], B: [], C: [] } };
            db['tierlist'] = initial; upsert('tierlist', initial);
        }

        const tl = db['tierlist'];
        const usedIds = new Set(Object.values(tl.tiers || {}).flat());
        const poolItems = (tl.items || []).filter(item => !usedIds.has(item.id));

        const unclass = el('div', 'ps-unclassified');
        const uLabel = el('span', 'ps-unclassified-label'); uLabel.textContent = '/ sin clasificar';
        unclass.appendChild(uLabel);
        const pool = el('div', 'ps-pool'); pool.dataset.tier = 'pool';
        poolItems.forEach(item => pool.appendChild(buildDestCard(item)));
        unclass.appendChild(pool); section.appendChild(unclass);

        const tiersWrap = el('div', 'ps-tiers');
        ['S', 'A', 'B', 'C'].forEach(letter => {
            const tierEl = el('div', 'ps-tier');
            const lbl = el('div', 'ps-tier-label'); lbl.dataset.tier = letter; lbl.textContent = letter;
            const row = el('div', 'ps-tier-row'); row.dataset.tier = letter;
            (tl.tiers[letter] || []).forEach(id => {
                const item = (tl.items || []).find(it => it.id === id);
                if (item) row.appendChild(buildDestCard(item));
            });
            tierEl.appendChild(lbl); tierEl.appendChild(row); tiersWrap.appendChild(tierEl);
        });
        section.appendChild(tiersWrap);

        const tlReady = db['tierlist_ready'] || {};
        const readyBtn = el('button', 'ps-submit ps-tierlist-ready-btn');
        if (tlReady[currentUser]) {
            readyBtn.textContent = `esperando a ${other(currentUser)}…`;
            readyBtn.disabled = true;
        } else {
            readyBtn.textContent = 'listo con el tier list';
            readyBtn.addEventListener('click', async () => {
                readyBtn.disabled = true;
                const r = db['tierlist_ready'] || { agus: false, jo: false };
                r[currentUser] = true;
                await upsert('tierlist_ready', r);
                render();
            });
        }
        section.appendChild(readyBtn);
        requestAnimationFrame(() => setupTierSortables());
        return section;
    }

    function collectDestinations() {
        const items = [];
        ['agus', 'jo'].forEach(u => {
            const d = db[`round_3_${u}`] || {};
            (d.ranking || []).forEach((dest, i) => { if (dest) items.push({ id: `${u}_r${i}`, label: dest, owner: u }); });
            if (d.mencion) items.push({ id: `${u}_m`, label: d.mencion, owner: u });
        });
        return items;
    }

    function buildDestCard(item) {
        const card = el('div', 'ps-dest-card'); card.dataset.id = item.id; card.textContent = item.label;
        const badge = el('span', 'ps-owner-badge'); badge.textContent = item.owner; card.appendChild(badge);
        return card;
    }

    function buildTierlistReveal(tl) {
        const wrap = el('div'); wrap.style.marginTop = '16px';
        ['S', 'A', 'B', 'C'].forEach(letter => {
            const ids = (tl.tiers || {})[letter] || [];
            if (!ids.length) return;
            const row = el('div'); row.style.cssText = 'margin-bottom:12px;display:flex;align-items:baseline;gap:14px;flex-wrap:wrap';
            const lbl = el('span', 'ps-round-tag'); lbl.style.marginBottom = '0'; lbl.textContent = letter; row.appendChild(lbl);
            ids.forEach(id => {
                const item = (tl.items || []).find(it => it.id === id); if (!item) return;
                const c = el('span'); c.style.cssText = 'font-size:.88rem;font-weight:300;padding:4px 12px;background:var(--ps-bg-soft);border-radius:50px';
                c.textContent = item.label; row.appendChild(c);
            });
            wrap.appendChild(row);
        });
        return wrap;
    }

    function setupTierSortables() {
        if (typeof Sortable === 'undefined') return;
        tierSortables.forEach(s => s.destroy()); tierSortables = [];
        const board = document.querySelector('.ps-tierlist-board');
        if (!board) return;
        const containers = [board.querySelector('.ps-pool'), ...board.querySelectorAll('.ps-tier-row')].filter(Boolean);
        containers.forEach(cont => {
            const s = new Sortable(cont, {
                group: 'ps-tierlist', animation: 240, easing: 'cubic-bezier(0.22,1,0.36,1)',
                ghostClass: 'ps-ghost', dragClass: 'ps-drag', chosenClass: 'ps-chosen',
                delay: 60, delayOnTouchOnly: true, touchStartThreshold: 4,
                onStart: () => containers.forEach(c => c.classList.add('ps-drop-active')),
                onEnd:   () => { containers.forEach(c => c.classList.remove('ps-drop-active')); saveTierState(); }
            });
            tierSortables.push(s);
        });
    }

    async function saveTierState() {
        const tl = db['tierlist'] || {};
        const newTiers = { S: [], A: [], B: [], C: [] };
        const board = document.querySelector('.ps-tierlist-board');
        if (!board) return;
        board.querySelectorAll('.ps-tier-row').forEach(row => {
            const tier = row.dataset.tier; if (!newTiers[tier]) return;
            [...row.children].forEach(card => { if (card.dataset.id) newTiers[tier].push(card.dataset.id); });
        });
        tl.tiers = newTiers; await upsert('tierlist', tl);
    }

    /* ══════════════════════════════════════════════════════════
       RONDAS 4 & 5 — helper texto libre
    ══════════════════════════════════════════════════════════ */
    function buildSimpleTextRound(r, current, delay, tag, title, sub, placeholder, draftKey) {
        const card = roundCard(delay);
        roundHeader(card, tag, title, sub);
        if (iDone(r)) {
            if (bothDone(r)) { card.appendChild(bothDoneBadge()); card.appendChild(buildSimpleReveal(r)); if (current === r) card.appendChild(buildNextRoundBtn(r)); }
            else card.appendChild(waitingBadge());
            return card;
        }
        const inp = makeInput(placeholder || 'tu respuesta', () => drafts[draftKey], v => { drafts[draftKey] = v; });
        inp.style.marginBottom = '20px';
        const btn = el('button', 'ps-submit'); btn.textContent = 'enviar';
        btn.addEventListener('click', async () => {
            const val = inp.value.trim(); if (!val) return;
            btn.disabled = true; drafts[draftKey] = '';
            await upsert(myKey(r), val); render();
        });
        card.appendChild(inp); card.appendChild(btn);
        return card;
    }

    function buildSimpleReveal(r) {
        const wrap = el('div', 'ps-reveal');
        ['agus', 'jo'].forEach(u => {
            const col = el('div', 'ps-reveal-col');
            const who = el('span', 'ps-reveal-who'); who.textContent = u; col.appendChild(who);
            const it = el('div', 'ps-reveal-item');
            const p = el('p'); p.textContent = db[`round_${r}_${u}`] || '–';
            it.appendChild(p); col.appendChild(it); wrap.appendChild(col);
        });
        return wrap;
    }

    function buildRound4(r, current) {
        return buildSimpleTextRound(r, current, 200, '[ antes de fin de año ]',
            'Una cosa que quieren hacer juntos antes de que termine el año', null, 'la cosa', 'r4');
    }
    function buildRound5(r, current) {
        return buildSimpleTextRound(r, current, 250, '[ tradición nueva ]', 'Una tradición nueva',
            'Algo que quieren instaurar como ritual de pareja.', 'la tradición', 'r5');
    }

    /* ══════════════════════════════════════════════════════════
       RONDA 6 — esto o aquello  (era r5)
    ══════════════════════════════════════════════════════════ */
    function buildRound6(r, current) {
        const card = roundCard(300);
        roundHeader(card, '[ esto o aquello ]', 'Esto o aquello', 'Quince preguntas. Sin pensar mucho.');

        if (iDone(r)) {
            if (bothDone(r)) { card.appendChild(bothDoneBadge()); card.appendChild(buildQuizReveal(r)); if (current === r) card.appendChild(buildNextRoundBtn(r)); }
            else card.appendChild(waitingBadge());
            return card;
        }

        const stored = sessionStorage.getItem('ps_quiz_draft');
        if (stored) { try { quizAnswers = JSON.parse(stored); } catch (_) {} }

        const quiz = el('div', 'ps-quiz');
        QUIZ.forEach((q, qi) => {
            const qEl = el('div', 'ps-question');
            const qText = el('p', 'ps-question-text');
            const num = el('span', 'ps-question-num'); num.textContent = (qi + 1) + '.';
            qText.appendChild(num); qText.insertAdjacentText('beforeend', q.q);
            const opts = el('div', 'ps-options');
            q.opts.forEach(opt => {
                const btn = el('button', 'ps-opt'); btn.textContent = opt;
                const key = `q${qi + 1}`;
                if (quizAnswers[key] === opt) btn.classList.add('ps-opt-selected');
                btn.addEventListener('click', () => {
                    opts.querySelectorAll('.ps-opt').forEach(b => b.classList.remove('ps-opt-selected'));
                    btn.classList.add('ps-opt-selected');
                    quizAnswers[key] = opt;
                    sessionStorage.setItem('ps_quiz_draft', JSON.stringify(quizAnswers));
                });
                opts.appendChild(btn);
            });
            qEl.appendChild(qText); qEl.appendChild(opts); quiz.appendChild(qEl);
        });

        const btnSend = el('button', 'ps-submit'); btnSend.textContent = 'enviar respuestas'; btnSend.style.marginTop = '28px';
        btnSend.addEventListener('click', async () => {
            if (Object.keys(quizAnswers).length < QUIZ.length) { alert(`Responde las ${QUIZ.length} preguntas antes de enviar.`); return; }
            btnSend.disabled = true;
            await upsert(myKey(r), quizAnswers);
            sessionStorage.removeItem('ps_quiz_draft'); render();
        });

        card.appendChild(quiz); card.appendChild(btnSend);
        return card;
    }

    function buildQuizReveal(r) {
        const agusA = db[`round_${r}_agus`] || {};
        const joA   = db[`round_${r}_jo`]   || {};
        let matches = 0;
        const revWrap = el('div', 'ps-quiz-reveal');
        QUIZ.forEach((q, qi) => {
            const key = `q${qi + 1}`;
            const aA = agusA[key] || '–', aJ = joA[key] || '–';
            const match = aA === aJ && aA !== '–';
            if (match) matches++;
            const item = el('div', `ps-qr-item ${match ? 'ps-match' : 'ps-nomatch'}`);
            const qText = el('p', 'ps-qr-question');
            const num = el('span', 'ps-question-num'); num.textContent = (qi + 1) + '.';
            qText.appendChild(num); qText.insertAdjacentText('beforeend', q.q); item.appendChild(qText);
            const answers = el('div', 'ps-qr-answers');
            ['agus', 'jo'].forEach(u => {
                const ans = el('div', 'ps-qr-answer');
                const who = el('span'); who.textContent = u; ans.appendChild(who);
                ans.insertAdjacentText('beforeend', (u === 'agus' ? agusA : joA)[key] || '–');
                answers.appendChild(ans);
            });
            if (match) { const badge = el('span', 'ps-match-badge'); badge.textContent = '✓ coinciden'; answers.appendChild(badge); }
            item.appendChild(answers); revWrap.appendChild(item);
        });
        const score = el('div', 'ps-score'); score.textContent = `coincidieron ${matches} de ${QUIZ.length}`;
        revWrap.appendChild(score);
        return revWrap;
    }

    /* ══════════════════════════════════════════════════════════
       RONDA 7 — ¿quién de los dos?  [NUEVA]
    ══════════════════════════════════════════════════════════ */
    function buildRound7(r, current) {
        const card = roundCard(320);
        roundHeader(card, '[ ¿quién de los dos? ]', '¿Quién de los dos?',
            'Sin trampa. Lo primero que se te venga. Al revelar ven cómo se ven mutuamente.');

        if (iDone(r)) {
            if (bothDone(r)) { card.appendChild(bothDoneBadge()); card.appendChild(buildQuienReveal(r)); if (current === r) card.appendChild(buildNextRoundBtn(r)); }
            else card.appendChild(waitingBadge());
            return card;
        }

        const stored = sessionStorage.getItem('ps_quien_draft');
        if (stored) { try { quienAnswers = JSON.parse(stored); } catch (_) {} }

        const quizEl = el('div', 'ps-quiz');
        QUIEN_QS.forEach((q, qi) => {
            const qEl = el('div', 'ps-question');
            const qText = el('p', 'ps-question-text');
            const num = el('span', 'ps-question-num'); num.textContent = (qi + 1) + '.';
            qText.appendChild(num); qText.insertAdjacentText('beforeend', q);
            const opts = el('div', 'ps-options');
            ['agus', 'jo', 'los dos', 'ninguno'].forEach(opt => {
                const btn = el('button', 'ps-opt'); btn.textContent = opt;
                const key = `q${qi + 1}`;
                if (quienAnswers[key] === opt) btn.classList.add('ps-opt-selected');
                btn.addEventListener('click', () => {
                    opts.querySelectorAll('.ps-opt').forEach(b => b.classList.remove('ps-opt-selected'));
                    btn.classList.add('ps-opt-selected');
                    quienAnswers[key] = opt;
                    sessionStorage.setItem('ps_quien_draft', JSON.stringify(quienAnswers));
                });
                opts.appendChild(btn);
            });
            qEl.appendChild(qText); qEl.appendChild(opts); quizEl.appendChild(qEl);
        });

        const btnSend = el('button', 'ps-submit'); btnSend.textContent = 'enviar'; btnSend.style.marginTop = '28px';
        btnSend.addEventListener('click', async () => {
            if (Object.keys(quienAnswers).length < QUIEN_QS.length) { alert(`Responde las ${QUIEN_QS.length} preguntas antes de enviar.`); return; }
            btnSend.disabled = true;
            await upsert(myKey(r), quienAnswers);
            sessionStorage.removeItem('ps_quien_draft'); render();
        });

        card.appendChild(quizEl); card.appendChild(btnSend);
        return card;
    }

    function buildQuienReveal(r) {
        const agusA = db[`round_${r}_agus`] || {};
        const joA   = db[`round_${r}_jo`]   || {};
        let matches = 0;
        const revWrap = el('div', 'ps-quiz-reveal');
        QUIEN_QS.forEach((q, qi) => {
            const key = `q${qi + 1}`;
            const aA = agusA[key] || '–', aJ = joA[key] || '–';
            const match = aA === aJ && aA !== '–';
            if (match) matches++;
            const item = el('div', `ps-qr-item ${match ? 'ps-match' : 'ps-nomatch'}`);
            const qText = el('p', 'ps-qr-question');
            const num = el('span', 'ps-question-num'); num.textContent = (qi + 1) + '.';
            qText.appendChild(num); qText.insertAdjacentText('beforeend', q); item.appendChild(qText);
            const answers = el('div', 'ps-qr-answers');
            ['agus', 'jo'].forEach(u => {
                const ans = el('div', 'ps-qr-answer');
                const who = el('span'); who.textContent = u + ' dijo'; ans.appendChild(who);
                ans.insertAdjacentText('beforeend', (u === 'agus' ? agusA : joA)[key] || '–');
                answers.appendChild(ans);
            });
            if (match) { const badge = el('span', 'ps-match-badge'); badge.textContent = '✓ coinciden'; answers.appendChild(badge); }
            item.appendChild(answers); revWrap.appendChild(item);
        });
        const score = el('div', 'ps-score'); score.textContent = `coincidieron en ${matches} de ${QUIEN_QS.length}`;
        revWrap.appendChild(score);
        return revWrap;
    }

    /* ══════════════════════════════════════════════════════════
       RONDA 8 — pendientes  (era r6)
    ══════════════════════════════════════════════════════════ */
    function buildRound8(r, current) {
        const card = roundCard(350);
        roundHeader(card, '[ pendientes ]', 'Lista de pendientes',
            'Tres cosas que sienten que tienen pendiente como pareja.');

        if (iDone(r)) {
            if (bothDone(r)) { card.appendChild(bothDoneBadge()); card.appendChild(buildRevealList(r)); if (current === r) card.appendChild(buildNextRoundBtn(r)); }
            else card.appendChild(waitingBadge());
            return card;
        }

        const fields = el('div', 'ps-fields');
        const inps = [0, 1, 2].map(i => {
            const wrap = el('div');
            const lbl = el('label', 'ps-field-label'); lbl.textContent = `pendiente ${i + 1}`;
            const inp = makeInput(['escríbelo', 'otro pendiente', 'uno más'][i], () => drafts.r8[i], v => { drafts.r8[i] = v; });
            wrap.appendChild(lbl); wrap.appendChild(inp); fields.appendChild(wrap);
            return inp;
        });

        const btn = el('button', 'ps-submit'); btn.textContent = 'enviar lista';
        btn.addEventListener('click', async () => {
            const vals = inps.map(i => i.value.trim()).filter(Boolean);
            if (!vals.length) return;
            btn.disabled = true; drafts.r8 = ['', '', ''];
            await upsert(myKey(r), vals); render();
        });

        card.appendChild(fields); card.appendChild(btn);
        return card;
    }

    function buildRevealList(r) {
        const wrap = el('div', 'ps-reveal');
        ['agus', 'jo'].forEach(u => {
            const col = el('div', 'ps-reveal-col');
            const who = el('span', 'ps-reveal-who'); who.textContent = u; col.appendChild(who);
            (db[`round_${r}_${u}`] || []).forEach((item, i) => {
                const it = el('div', 'ps-reveal-item');
                const num = el('span', 'ps-item-num'); num.textContent = (i + 1) + '.';
                const p = el('p'); p.textContent = item;
                it.appendChild(num); it.appendChild(p); col.appendChild(it);
            });
            wrap.appendChild(col);
        });
        return wrap;
    }

    /* ══════════════════════════════════════════════════════════
       RONDA 9 — cuando las cosas se ponen difíciles  [NUEVA]
    ══════════════════════════════════════════════════════════ */
    function buildRound9(r, current) {
        const card = roundCard(400);
        roundHeader(card, '[ cuando las cosas se ponen difíciles ]',
            'Cuando las cosas se ponen difíciles',
            'No es para resolver nada ahora. Es para entenderse mejor. Responde por ti, sin pensar en cómo suena.');

        if (iDone(r)) {
            if (bothDone(r)) { card.appendChild(bothDoneBadge()); card.appendChild(buildReveal9()); if (current === r) card.appendChild(buildNextRoundBtn(r)); }
            else card.appendChild(waitingBadge());
            return card;
        }

        const fields = el('div', 'ps-fields');
        const questions = [
            { key: 'q1', label: '¿Qué necesitas de mí cuando algo está mal entre nosotros?', ph: 'lo que necesito es...' },
            { key: 'q2', label: '¿Qué hago yo sin querer que hace las cosas peores?',         ph: 'cuando haces...' },
            { key: 'q3', label: '¿Qué te ayuda a volver?',                                     ph: 'lo que me ayuda es...' },
        ];
        const inps = {};
        questions.forEach(({ key, label, ph }) => {
            const wrap = el('div');
            const lbl = el('label', 'ps-field-label');
            lbl.textContent = label;
            lbl.style.cssText = 'font-size:.82rem;line-height:1.5;white-space:normal;margin-bottom:6px;display:block';
            const inp = makeInput(ph, () => drafts.r9[key], v => { drafts.r9[key] = v; });
            wrap.appendChild(lbl); wrap.appendChild(inp); fields.appendChild(wrap);
            inps[key] = inp;
        });

        const btn = el('button', 'ps-submit'); btn.textContent = 'enviar';
        btn.addEventListener('click', async () => {
            const val = { q1: inps.q1.value.trim(), q2: inps.q2.value.trim(), q3: inps.q3.value.trim() };
            if (!val.q1) return;
            btn.disabled = true; drafts.r9 = { q1: '', q2: '', q3: '' };
            await upsert(myKey(r), val); render();
        });

        card.appendChild(fields); card.appendChild(btn);
        return card;
    }

    function buildReveal9() {
        const agusD = db['round_9_agus'] || {}, joD = db['round_9_jo'] || {};
        const wrap = el('div'); wrap.style.marginTop = '16px';
        const labels = {
            q1: '¿Qué necesita del otro cuando algo está mal?',
            q2: '¿Qué hace el otro sin querer que empeora?',
            q3: '¿Qué le ayuda a volver?'
        };
        ['q1', 'q2', 'q3'].forEach(key => {
            const block = el('div'); block.style.marginBottom = '24px';
            const lbl = el('p', 'ps-field-label');
            lbl.style.cssText = 'font-size:.78rem;margin-bottom:10px;white-space:normal;line-height:1.5';
            lbl.textContent = labels[key]; block.appendChild(lbl);
            const cols = el('div', 'ps-reveal');
            ['agus', 'jo'].forEach(u => {
                const col = el('div', 'ps-reveal-col');
                const who = el('span', 'ps-reveal-who'); who.textContent = u; col.appendChild(who);
                const it = el('div', 'ps-reveal-item');
                const p = el('p'); p.textContent = (u === 'agus' ? agusD : joD)[key] || '–';
                it.appendChild(p); col.appendChild(it); cols.appendChild(col);
            });
            block.appendChild(cols); wrap.appendChild(block);
        });
        return wrap;
    }

    /* ══════════════════════════════════════════════════════════
       RONDA 10 — a qué plazo (tablero colaborativo)  [NUEVA]
    ══════════════════════════════════════════════════════════ */
    function tablReady() { const r = db['tablero_ready'] || {}; return r.agus && r.jo; }
    let tablSortables = [];

    function buildRound10(r, current) {
        const card = roundCard(420);
        roundHeader(card, '[ a qué plazo ]', '¿A qué plazo?',
            'Cinco aspiraciones propias de cada uno más doce hitos de pareja. Clasifiquen juntos en tiempo real.');

        // Fase 2: ambos enviaron sus aspiraciones
        if (bothDone(r)) {
            if (tablReady()) {
                card.appendChild(bothDoneBadge());
                card.appendChild(buildTablBoardReveal());
                if (current === r) card.appendChild(buildNextRoundBtn(r));
            } else {
                card.appendChild(buildTablBoardSection(r, current));
            }
            return card;
        }

        // Fase 1: input de aspiraciones
        if (iDone(r)) { card.appendChild(waitingBadge()); return card; }

        const hint = el('p', 'ps-round-sub');
        hint.style.cssText = 'font-size:.8rem;color:var(--ps-mute);margin-bottom:20px';
        hint.textContent = 'Cinco cosas que quieres que pasen como pareja. Se suman al tablero junto con las del otro.';
        card.appendChild(hint);

        const fields = el('div', 'ps-fields');
        const inputs = [0, 1, 2, 3, 4].map(i => {
            const wrap = el('div');
            const lbl = el('label', 'ps-field-label'); lbl.textContent = `aspiración ${i + 1}`;
            const inp = makeInput('algo que quieres que pase', () => drafts.r10input[i], v => { drafts.r10input[i] = v; });
            wrap.appendChild(lbl); wrap.appendChild(inp); fields.appendChild(wrap);
            return inp;
        });

        const btn = el('button', 'ps-submit'); btn.textContent = 'enviar mis aspiraciones';
        btn.addEventListener('click', async () => {
            const vals = inputs.map(i => i.value.trim()).filter(Boolean);
            if (!vals.length) return;
            btn.disabled = true; drafts.r10input = ['', '', '', '', ''];
            await upsert(myKey(r), vals); render();
        });

        card.appendChild(fields); card.appendChild(btn);
        return card;
    }

    function collectTablItems() {
        const items = TABLERO_DEFAULTS.map(item => ({ ...item, owner: 'shared' }));
        ['agus', 'jo'].forEach(u => {
            (db[`round_10_${u}`] || []).forEach((label, i) => {
                if (label) items.push({ id: `${u}_t${i}`, label, owner: u });
            });
        });
        return items;
    }

    function buildTablCard(item) {
        const card = el('div', 'ps-dest-card'); card.dataset.id = item.id; card.textContent = item.label;
        if (item.owner !== 'shared') {
            const badge = el('span', 'ps-owner-badge'); badge.textContent = item.owner; card.appendChild(badge);
        }
        return card;
    }

    function buildTablBoardSection(roundNum, current) {
        const section = el('div', 'ps-tierlist ps-tablero-board');
        const sep = document.createElement('hr');
        sep.style.cssText = 'border:none;border-top:1px solid rgba(32,32,32,0.08);margin:20px 0';
        section.appendChild(sep);

        if (!db['tablero']) {
            const items = collectTablItems();
            const cols  = {};
            TABLERO_COLS.forEach(c => { cols[c.key] = []; });
            const initial = { items, columns: cols };
            db['tablero'] = initial; upsert('tablero', initial);
        }

        const tl = db['tablero'];
        const usedIds = new Set(Object.values(tl.columns || {}).flat());
        const poolItems = (tl.items || []).filter(item => !usedIds.has(item.id));

        const unclass = el('div', 'ps-unclassified');
        const uLabel = el('span', 'ps-unclassified-label'); uLabel.textContent = '/ sin clasificar';
        unclass.appendChild(uLabel);
        const pool = el('div', 'ps-pool'); pool.dataset.tablercol = 'pool';
        poolItems.forEach(item => pool.appendChild(buildTablCard(item)));
        unclass.appendChild(pool); section.appendChild(unclass);

        const colsWrap = el('div', 'ps-tiers');
        TABLERO_COLS.forEach(({ key, label, sub }) => {
            const colEl = el('div', 'ps-tier');
            const lbl = el('div', 'ps-tier-label');
            lbl.dataset.tablercol = key;
            lbl.innerHTML = `${h(label)}<small style="display:block;font-size:.68rem;font-weight:300;color:var(--ps-mute);margin-top:3px;letter-spacing:0;text-transform:none">${h(sub)}</small>`;
            const row = el('div', 'ps-tier-row'); row.dataset.tablercol = key;
            ((tl.columns || {})[key] || []).forEach(id => {
                const item = (tl.items || []).find(it => it.id === id);
                if (item) row.appendChild(buildTablCard(item));
            });
            colEl.appendChild(lbl); colEl.appendChild(row); colsWrap.appendChild(colEl);
        });
        section.appendChild(colsWrap);

        const tblReadyState = db['tablero_ready'] || {};
        const readyBtn = el('button', 'ps-submit ps-tierlist-ready-btn');
        if (tblReadyState[currentUser]) {
            readyBtn.textContent = `esperando a ${other(currentUser)}…`;
            readyBtn.disabled = true;
        } else {
            readyBtn.textContent = 'listo con el tablero';
            readyBtn.addEventListener('click', async () => {
                readyBtn.disabled = true;
                const rdy = db['tablero_ready'] || { agus: false, jo: false };
                rdy[currentUser] = true;
                await upsert('tablero_ready', rdy);
                render();
            });
        }
        section.appendChild(readyBtn);
        requestAnimationFrame(() => setupTablSortables());
        return section;
    }

    function buildTablBoardReveal() {
        const wrap = el('div'); wrap.style.marginTop = '16px';
        const tl = db['tablero'] || {};
        TABLERO_COLS.forEach(({ key, label }) => {
            const ids = (tl.columns || {})[key] || [];
            if (!ids.length) return;
            const row = el('div'); row.style.cssText = 'margin-bottom:14px;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap';
            const lbl = el('span', 'ps-round-tag'); lbl.style.marginBottom = '0'; lbl.textContent = label; row.appendChild(lbl);
            ids.forEach(id => {
                const item = (tl.items || []).find(it => it.id === id); if (!item) return;
                const c = el('span'); c.style.cssText = 'font-size:.88rem;font-weight:300;padding:4px 12px;background:var(--ps-bg-soft);border-radius:50px';
                c.textContent = item.label; row.appendChild(c);
            });
            wrap.appendChild(row);
        });
        return wrap;
    }

    function setupTablSortables() {
        if (typeof Sortable === 'undefined') return;
        tablSortables.forEach(s => s.destroy()); tablSortables = [];
        const board = document.querySelector('.ps-tablero-board');
        if (!board) return;
        const containers = [board.querySelector('.ps-pool'), ...board.querySelectorAll('.ps-tier-row')].filter(Boolean);
        containers.forEach(cont => {
            const s = new Sortable(cont, {
                group: 'ps-tablero', animation: 240, easing: 'cubic-bezier(0.22,1,0.36,1)',
                ghostClass: 'ps-ghost', dragClass: 'ps-drag', chosenClass: 'ps-chosen',
                delay: 60, delayOnTouchOnly: true, touchStartThreshold: 4,
                onStart: () => containers.forEach(c => c.classList.add('ps-drop-active')),
                onEnd:   () => { containers.forEach(c => c.classList.remove('ps-drop-active')); saveTablState(); }
            });
            tablSortables.push(s);
        });
    }

    async function saveTablState() {
        const tl = db['tablero'] || {};
        const newCols = {};
        TABLERO_COLS.forEach(c => { newCols[c.key] = []; });
        const board = document.querySelector('.ps-tablero-board');
        if (!board) return;
        board.querySelectorAll('.ps-tier-row').forEach(row => {
            const col = row.dataset.tablercol; if (!newCols[col]) return;
            [...row.children].forEach(card => { if (card.dataset.id) newCols[col].push(card.dataset.id); });
        });
        tl.columns = newCols; await upsert('tablero', tl);
    }

    /* ══════════════════════════════════════════════════════════
       RONDA 11 — 1 / 3 / algún día  (era r10)
    ══════════════════════════════════════════════════════════ */
    function buildRound11(r, current) {
        const card = roundCard(450);
        roundHeader(card, '[ 1 / 3 / algún día ]', '1 año / 3 años / algún día',
            'Tres ventanas de tiempo. En cada una, una cosa que genuinamente quieres que exista en la vida que están construyendo juntos. No tiene que ser posible ahora — tiene que ser honesta.');

        if (iDone(r)) {
            if (bothDone(r)) { card.appendChild(bothDoneBadge()); card.appendChild(buildReveal11()); if (current === r) card.appendChild(buildNextRoundBtn(r)); }
            else card.appendChild(waitingBadge());
            return card;
        }

        const fields = el('div', 'ps-fields');
        const horizons = [
            { key: 'y1', label: 'en un año' },
            { key: 'y3', label: 'en tres años' },
            { key: 'someday', label: 'algún día' }
        ];
        const inps = {};
        horizons.forEach(({ key, label }) => {
            const wrap = el('div');
            const lbl = el('label', 'ps-field-label'); lbl.textContent = label;
            const inp = makeInput(label, () => drafts.r11[key], v => { drafts.r11[key] = v; });
            wrap.appendChild(lbl); wrap.appendChild(inp); fields.appendChild(wrap);
            inps[key] = inp;
        });

        const btn = el('button', 'ps-submit'); btn.textContent = 'enviar horizontes';
        btn.addEventListener('click', async () => {
            const val = {}; horizons.forEach(({ key }) => { val[key] = inps[key].value.trim(); });
            if (!val.y1) return;
            btn.disabled = true; drafts.r11 = { y1: '', y3: '', someday: '' };
            await upsert(myKey(r), val); render();
        });

        card.appendChild(fields); card.appendChild(btn);
        return card;
    }

    function buildReveal11() {
        const agusD = db['round_11_agus'] || {}, joD = db['round_11_jo'] || {};
        const table = el('table', 'ps-table');
        const thead = el('thead'); thead.innerHTML = '<tr><th></th><th>agus</th><th>jo</th></tr>';
        table.appendChild(thead);
        const tbody = el('tbody');
        [{ key: 'y1', label: '1 año' }, { key: 'y3', label: '3 años' }, { key: 'someday', label: 'algún día' }]
            .forEach(({ key, label }) => {
                const tr = el('tr');
                tr.innerHTML = `<td>${h(label)}</td><td>${h(agusD[key] || '–')}</td><td>${h(joD[key] || '–')}</td>`;
                tbody.appendChild(tr);
            });
        table.appendChild(tbody);
        return table;
    }

    /* ══════════════════════════════════════════════════════════
       RONDA 12 — pregunta libre  (era r11)
    ══════════════════════════════════════════════════════════ */
    function buildRound12(r, current) {
        const card = roundCard(470);
        roundHeader(card, '[ pregunta libre ]', 'Una pregunta',
            'La pregunta que le quieras hacer al otro sobre el futuro. La que sea.');

        if (iDone(r)) {
            if (bothDone(r)) {
                card.appendChild(bothDoneBadge());
                card.appendChild(buildReveal12());
                if (!db['session_complete']) {
                    const btnDone = el('button', 'ps-submit'); btnDone.textContent = 'ya la respondimos'; btnDone.style.marginTop = '24px';
                    btnDone.addEventListener('click', async () => {
                        btnDone.disabled = true; await upsert('session_complete', true); render();
                    });
                    card.appendChild(btnDone);
                }
            } else card.appendChild(waitingBadge());
            return card;
        }

        const inp = makeInput('la pregunta', () => drafts.r12, v => { drafts.r12 = v; });
        inp.style.marginBottom = '12px';
        const hint = el('p');
        hint.style.cssText = 'font-size:.82rem;font-weight:300;color:var(--ps-mute);margin:0 0 24px;line-height:1.5';
        hint.textContent = 'No hay respuesta escrita. Se responden en voz alta.';
        const btn = el('button', 'ps-submit'); btn.textContent = 'enviar pregunta';
        btn.addEventListener('click', async () => {
            const val = inp.value.trim(); if (!val) return;
            btn.disabled = true; drafts.r12 = '';
            await upsert(myKey(r), val); render();
        });

        card.appendChild(inp); card.appendChild(hint); card.appendChild(btn);
        return card;
    }

    function buildReveal12() {
        const wrap = el('div', 'ps-reveal');
        ['agus', 'jo'].forEach(u => {
            const col = el('div', 'ps-reveal-col');
            const who = el('span', 'ps-reveal-who'); who.textContent = u + ' pregunta'; col.appendChild(who);
            const it = el('div', 'ps-reveal-item');
            const p = el('p'); p.style.fontWeight = '400'; p.textContent = db[`round_12_${u}`] || '–';
            it.appendChild(p); col.appendChild(it); wrap.appendChild(col);
        });
        return wrap;
    }

    /* ══════════════════════════════════════════════════════════
       CIERRE — resumen generado desde Claude API
    ══════════════════════════════════════════════════════════ */
    function buildClosing() {
        const card = roundCard(520);
        card.style.textAlign = 'center';

        const tag = el('div', 'ps-closing-tag'); tag.textContent = '[ sesión completa ]';
        const title = el('h2', 'ps-closing-title'); title.textContent = 'eso es todo';
        const sub = el('p', 'ps-closing-sub'); sub.textContent = 'Doce rondas. Todo dicho. Ahora léanlo.';
        card.appendChild(tag); card.appendChild(title); card.appendChild(sub);

        if (db['_claude_summary']) {
            card.appendChild(renderSummary(db['_claude_summary']));
            return card;
        }

        if (db['_claude_generating']) {
            const loading = el('div', 'ps-waiting');
            loading.style.cssText = 'justify-content:center;margin-top:20px';
            const dot = el('span', 'ps-waiting-dot'); loading.appendChild(dot);
            loading.insertAdjacentText('beforeend', 'generando resumen...');
            card.appendChild(loading);
            return card;
        }

        const btnSummary = el('button', 'ps-submit');
        btnSummary.textContent = 'generar resumen';
        btnSummary.addEventListener('click', () => generateSummary(card, btnSummary));
        card.appendChild(btnSummary);
        return card;
    }

    async function generateSummary(card, btn) {
        btn.disabled = true;
        btn.textContent = 'generando...';
        await upsert('_claude_generating', true);

        try {
            const { data, error } = await sb.functions.invoke('generate-summary', {
                body: {
                    systemPrompt: buildSystemPromptText(),
                    prompt:       buildClaudePrompt()
                }
            });

            if (error || !data?.text) throw new Error(error?.message || 'sin respuesta de Claude');

            await upsert('_claude_generating', null);
            await upsert('_claude_summary', data.text);
            render();

        } catch (e) {
            await upsert('_claude_generating', null);
            // Fallback manual si la edge function no está configurada todavía
            btn.textContent = 'generar resumen';
            btn.disabled = false;
            const errNote = el('p', 'ps-round-sub');
            errNote.style.cssText = 'color:var(--ps-mute);font-size:.79rem;margin-top:10px';
            errNote.textContent = 'La función no está configurada. Usa la opción manual:';
            card.appendChild(errNote);
            const manualBtn = el('button', 'ps-submit');
            manualBtn.style.cssText = 'margin-top:8px;font-size:.82rem';
            manualBtn.textContent = 'generar manualmente con claude.ai';
            manualBtn.addEventListener('click', () => {
                manualBtn.style.display = 'none';
                errNote.style.display = 'none';
                showSummaryPasteUI(card);
            });
            card.appendChild(manualBtn);
        }
    }

    function showSummaryPasteUI(card) {
        const wrap = el('div'); wrap.style.textAlign = 'left'; wrap.style.marginTop = '28px';

        const hint = el('p', 'ps-round-sub'); hint.style.marginBottom = '20px';
        hint.innerHTML =
            'Usa Claude.ai para generar el resumen.<br>' +
            '<strong style="font-weight:500;color:var(--ps-ink)">1.</strong> Copia el prompt<br>' +
            '<strong style="font-weight:500;color:var(--ps-ink)">2.</strong> Abre <a href="https://claude.ai" target="_blank" style="color:var(--ps-ink);text-decoration:underline">claude.ai</a> y pégalo<br>' +
            '<strong style="font-weight:500;color:var(--ps-ink)">3.</strong> Pega la respuesta abajo';
        wrap.appendChild(hint);

        const btnCopy = el('button', 'ps-submit'); btnCopy.textContent = 'copiar prompt'; btnCopy.style.marginBottom = '20px';
        btnCopy.addEventListener('click', () => {
            const fullPrompt = buildSystemPromptText() + '\n\n---\n\n' + buildClaudePrompt();
            navigator.clipboard.writeText(fullPrompt).then(() => {
                btnCopy.textContent = 'copiado ✓';
                setTimeout(() => { btnCopy.textContent = 'copiar prompt'; }, 2500);
            }).catch(() => {
                const ta = el('textarea', 'ps-summary-textarea');
                ta.value = buildSystemPromptText() + '\n\n---\n\n' + buildClaudePrompt();
                ta.readOnly = true; ta.style.cssText = 'margin-bottom:16px;font-size:.78rem;color:var(--ps-mute)';
                wrap.insertBefore(ta, btnCopy.nextSibling);
            });
        });
        wrap.appendChild(btnCopy);

        const sep = el('p', 'ps-field-label'); sep.textContent = 'respuesta de claude'; sep.style.marginBottom = '8px';
        wrap.appendChild(sep);
        const ta = el('textarea', 'ps-summary-textarea'); ta.placeholder = 'pega la respuesta de Claude acá';
        wrap.appendChild(ta);

        const btnSave = el('button', 'ps-submit'); btnSave.textContent = 'guardar resumen'; btnSave.style.marginTop = '16px';
        btnSave.addEventListener('click', async () => {
            const text = ta.value.trim(); if (!text) return;
            btnSave.disabled = true;
            await upsert('_claude_summary', text); render();
        });
        wrap.appendChild(btnSave);
        card.appendChild(wrap);
    }

    function renderSummary(summary) {
        const wrap = el('div', 'ps-summary-blocks');
        const parts = parseSummary(summary);

        const b1 = el('div', 'ps-summary-block');
        const t1 = el('span', 'ps-summary-block-tag'); t1.textContent = '[ el acta ]';
        const p1 = el('div', 'ps-summary-block-body'); p1.textContent = parts.acta || summary;
        b1.appendChild(t1); b1.appendChild(p1); wrap.appendChild(b1);

        if (parts.preguntas) {
            const b2 = el('div', 'ps-summary-block');
            const t2 = el('span', 'ps-summary-block-tag'); t2.textContent = '[ preguntas ]';
            const p2 = el('div', 'ps-summary-block-body'); p2.textContent = parts.preguntas;
            b2.appendChild(t2); b2.appendChild(p2); wrap.appendChild(b2);
        }

        const copyBtn = el('button', 'ps-copy-btn'); copyBtn.textContent = 'copiar resumen';
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(summary).then(() => {
                copyBtn.textContent = 'copiado ✓';
                setTimeout(() => { copyBtn.textContent = 'copiar resumen'; }, 2000);
            });
        });
        wrap.appendChild(copyBtn);
        return wrap;
    }

    function parseSummary(text) {
        const lower = text.toLowerCase();
        const pregIdx = lower.indexOf('[ preguntas ]');
        if (pregIdx === -1) return { acta: text, preguntas: null };
        const actaIdx = lower.indexOf('[ el acta ]');
        const acta = actaIdx !== -1
            ? text.slice(actaIdx + '[ el acta ]'.length, pregIdx).trim()
            : text.slice(0, pregIdx).trim();
        return { acta, preguntas: text.slice(pregIdx + '[ preguntas ]'.length).trim() };
    }

    function buildSystemPromptText() {
        return `Eres un observador externo inteligente que acaba de leer las respuestas completas de una pareja, Agus y Jo, en una sesión de planificación. Tu tarea es escribirles un resumen directo de lo que viste, y luego hacerles preguntas que los inviten a seguir conversando.
Escríbeles en segunda persona (ustedes, tú), como alguien que los conoce bien y les habla de frente.
El tono es directo, perceptivo e informal, pero sin expresiones regionales ni jerga. No suenas a terapeuta ni a coach. Suenas a alguien que leyó todo con atención y tiene algo concreto que decir.
No uses emojis. No uses frases motivacionales ni lenguaje clínico. No uses voseo argentino (nada de vos/tenés/podés/quedás).
Cuando encuentres diferencias o tensiones entre las respuestas, menciónalas pero siempre desde un ángulo constructivo: como conversaciones pendientes, no como problemas. El tono general debe impulsar hacia adelante, no dejar un sabor a conflicto.
Estructura tu respuesta EXACTAMENTE así, con estas dos etiquetas sin ningún símbolo adicional antes:
[ el acta ]
un texto fluido que señala qué quedó definido, qué coincidió sin que se dieran cuenta, qué patrones aparecen, y qué conversaciones quedan pendientes. No más de 220 palabras. No resumas mecánicamente — interpreta, pero siempre orientando hacia lo que pueden construir juntos.
Dentro del texto, cuando menciones algo concreto que acordaron (un destino, un plan, una fecha, una tradición), agrega una pregunta corta e inmediata justo ahí, entre guiones o en su propia línea corta. Esas preguntas son específicas a lo que nombraron, no genéricas. Ejemplo: si los dos pusieron Japón en S del tier list, escribes "Japón en S los dos — ¿cuándo lo hacen real?" Esto hace el acta más dinámica y conversacional, no un informe plano.

[ preguntas ]
entre 4 y 6 preguntas cortas que salgan directamente de las respuestas reales. Deben ser preguntas abiertas y curiosas, no acusatorias. Que los hagan pensar y querer responder, no ponerse a la defensiva. Cada pregunta en su propia línea, numerada.
Las preguntas no tienen respuesta dentro de la app, son para hablar en voz alta.`;
    }

    function buildClaudePrompt() {
        const lines = ['Sesión de planning entre Agus y Jo:', ''];

        const r1a = db['round_1_agus'] || [], r1j = db['round_1_jo'] || [];
        lines.push('RONDA 1 — semana 10-16 agosto');
        lines.push('Agus: ' + (r1a.join(' / ') || '–')); lines.push('Jo: ' + (r1j.join(' / ') || '–')); lines.push('');

        const r2a = db['round_2_agus'] || [], r2j = db['round_2_jo'] || [];
        lines.push('RONDA 2 — lo que me gusta del otro');
        lines.push('Agus sobre Jo: ' + (r2a.join(' / ') || '–')); lines.push('Jo sobre Agus: ' + (r2j.join(' / ') || '–')); lines.push('');

        const r3a = db['round_3_agus'] || {}, r3j = db['round_3_jo'] || {};
        lines.push('RONDA 3 — top 3 destinos');
        lines.push('Agus: ' + ((r3a.ranking || []).join(', ')) + (r3a.mencion ? ` / mención: ${r3a.mencion}` : ''));
        lines.push('Jo: ' + ((r3j.ranking || []).join(', ')) + (r3j.mencion ? ` / mención: ${r3j.mencion}` : '')); lines.push('');

        const tl = db['tierlist'] || {}, tiers = tl.tiers || {}, tlItems = tl.items || [];
        lines.push('TIER LIST FINAL');
        ['S', 'A', 'B', 'C'].forEach(t => {
            const names = (tiers[t] || []).map(id => (tlItems.find(it => it.id === id) || {}).label || id).join(', ');
            if (names) lines.push(`${t}: ${names}`);
        }); lines.push('');

        lines.push('RONDA 4 — antes de fin de año');
        lines.push('Agus: ' + (db['round_4_agus'] || '–')); lines.push('Jo: ' + (db['round_4_jo'] || '–')); lines.push('');

        lines.push('RONDA 5 — tradición nueva');
        lines.push('Agus: ' + (db['round_5_agus'] || '–')); lines.push('Jo: ' + (db['round_5_jo'] || '–')); lines.push('');

        const r6a = db['round_6_agus'] || {}, r6j = db['round_6_jo'] || {};
        lines.push('RONDA 6 — esto o aquello');
        QUIZ.forEach((q, qi) => {
            const key = `q${qi + 1}`, match = r6a[key] && r6a[key] === r6j[key];
            lines.push(`${qi + 1}. ${q.q}`);
            lines.push(`   Agus: ${r6a[key] || '–'} | Jo: ${r6j[key] || '–'}${match ? ' *coinciden*' : ''}`);
        }); lines.push('');

        const r7a = db['round_7_agus'] || {}, r7j = db['round_7_jo'] || {};
        lines.push('RONDA 7 — ¿quién de los dos?');
        QUIEN_QS.forEach((q, qi) => {
            const key = `q${qi + 1}`, match = r7a[key] && r7a[key] === r7j[key];
            lines.push(`${qi + 1}. ${q}`);
            lines.push(`   Agus dijo: ${r7a[key] || '–'} | Jo dijo: ${r7j[key] || '–'}${match ? ' *coinciden*' : ''}`);
        }); lines.push('');

        const r8a = db['round_8_agus'] || [], r8j = db['round_8_jo'] || [];
        lines.push('RONDA 8 — pendientes');
        lines.push('Agus: ' + (r8a.join(' / ') || '–')); lines.push('Jo: ' + (r8j.join(' / ') || '–')); lines.push('');

        const r9a = db['round_9_agus'] || {}, r9j = db['round_9_jo'] || {};
        lines.push('RONDA 9 — cuando las cosas se ponen difíciles');
        lines.push('¿Qué necesita del otro cuando algo está mal?');
        lines.push('   Agus: ' + (r9a.q1 || '–')); lines.push('   Jo: ' + (r9j.q1 || '–'));
        lines.push('¿Qué hace el otro sin querer que empeora?');
        lines.push('   Agus: ' + (r9a.q2 || '–')); lines.push('   Jo: ' + (r9j.q2 || '–'));
        lines.push('¿Qué les ayuda a volver?');
        lines.push('   Agus: ' + (r9a.q3 || '–')); lines.push('   Jo: ' + (r9j.q3 || '–')); lines.push('');

        const tbl = db['tablero'] || {}, tblCols = tbl.columns || {}, tblItems = tbl.items || [];
        lines.push('RONDA 10 — a qué plazo (tablero colaborativo)');
        TABLERO_COLS.forEach(({ key, label }) => {
            const names = (tblCols[key] || []).map(id => (tblItems.find(it => it.id === id) || {}).label || id).join(', ');
            if (names) lines.push(`${label}: ${names}`);
        }); lines.push('');

        const r11a = db['round_11_agus'] || {}, r11j = db['round_11_jo'] || {};
        lines.push('RONDA 11 — horizontes');
        lines.push('Agus — 1 año: ' + (r11a.y1 || '–') + ' | 3 años: ' + (r11a.y3 || '–') + ' | algún día: ' + (r11a.someday || '–'));
        lines.push('Jo   — 1 año: ' + (r11j.y1 || '–') + ' | 3 años: ' + (r11j.y3 || '–') + ' | algún día: ' + (r11j.someday || '–')); lines.push('');

        lines.push('RONDA 12 — preguntas al otro (responden en voz alta)');
        lines.push('Agus pregunta a Jo: ' + (db['round_12_agus'] || '–'));
        lines.push('Jo pregunta a Agus: ' + (db['round_12_jo'] || '–'));

        return lines.join('\n');
    }

    /* ── INIT ── */
    initGate();

})();
