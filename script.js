document.addEventListener('DOMContentLoaded', () => {
    // Referencias DOM
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const sidebarMenu = document.getElementById('sidebar-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const progressBar = document.getElementById('progress-bar');
    const projectCards = document.querySelectorAll('.project-card');
    const projectOverlay = document.getElementById('project-overlay');
    const closeProjectBtn = document.getElementById('close-project-btn');
    const sections = document.querySelectorAll('main section'); // Todas las secciones para el fade-in

    /* =======================================
       1. FUNCIONALIDAD DEL MENÚ LATERAL
       ======================================= */
    
    // Función para abrir el menú
    const openMenu = () => {
        sidebarMenu.classList.add('is-open');
        sidebarMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Evita el scroll del fondo
    };

    // Función para cerrar el menú
    const closeMenu = () => {
        sidebarMenu.classList.remove('is-open');
        sidebarMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restaura el scroll
    };

    menuToggleBtn.addEventListener('click', openMenu);
    closeMenuBtn.addEventListener('click', closeMenu);

    // Cerrar menú al hacer clic en un enlace y hacer scroll suave
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            closeMenu();

            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            // Scroll suave a la sección
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* =======================================
       2. BARRA DE PROGRESO DE SCROLL
       ======================================= */

    const updateProgressBar = () => {
        // Altura total del documento menos la altura visible del viewport
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        
        // Posición actual del scroll
        const scrollTop = document.documentElement.scrollTop;
        
        // Cálculo del porcentaje de avance
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        // Actualiza la altura de la barra
        progressBar.style.height = scrollPercent + '%';
    };

    window.addEventListener('scroll', updateProgressBar);
    // Ejecutar al cargar para inicializar
    updateProgressBar();


    /* =======================================
       3. DETALLE DE PROYECTO (OVERLAY MODAL)
       ======================================= */

    // Función para abrir el overlay
    const openProjectOverlay = (projectId) => {
        // En un caso real, aquí cargarías el contenido del proyecto (HTML/JSON) usando el projectId
        // Por ahora, solo abrimos el modal
        projectOverlay.classList.add('is-open');
        projectOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Bloquea el scroll del fondo
        projectOverlay.focus(); // Enfoca el modal para accesibilidad
        
        // Placeholder de contenido dinámico (se podría usar AJAX o un objeto JS con el contenido)
        const detailTitle = projectOverlay.querySelector('.detail-title');
        const longDesc = projectOverlay.querySelectorAll('.project-long-desc');
        detailTitle.textContent = `Detalle de Proyecto: ${projectId.replace('-', ' ').toUpperCase()}`;
        longDesc[0].textContent = 'Este es el resumen de la investigación y la estrategia detrás del proyecto ' + projectId + '. Aquí irían los párrafos completos y la galería.';

    };

    // Función para cerrar el overlay
    const closeProjectOverlay = () => {
        projectOverlay.classList.remove('is-open');
        projectOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.dataset.projectId;
            openProjectOverlay(projectId);
        });
        
        // Soporte de accesibilidad para teclado (Enter/Espacio)
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Previene la acción por defecto
                const projectId = card.dataset.projectId;
                openProjectOverlay(projectId);
            }
        });
    });

    closeProjectBtn.addEventListener('click', closeProjectOverlay);

    // Cerrar el modal al presionar ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectOverlay.classList.contains('is-open')) {
            closeProjectOverlay();
        }
    });

    /* =======================================
       4. MICROANIMACIONES (FADE-IN AL SCROLL)
       ======================================= */
    
    // Función de observador para aplicar clase al entrar en el viewport
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Dejar de observar una vez que es visible
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1 // Porcentaje de visibilidad del elemento para disparar
    });

    // Agregar la clase inicial 'fade-in' a todas las secciones (excepto la home/hero)
    sections.forEach(section => {
        if (section.id !== 'home') {
            section.classList.add('fade-in');
            observer.observe(section);
        }
    });

});