// Elementos del DOM
const menuToggle = document.getElementById('menuToggle');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');

// Links que deben cerrar el menú (todos los <a> dentro del side-menu)
const closeMenuLinks = document.querySelectorAll('.side-menu a');

// Toggle para el submenú de Works
const submenuToggle = document.querySelector('.submenu-toggle');
const submenu = document.querySelector('.submenu');

// Función para abrir/cerrar menú principal
function toggleMenu() {
    menuToggle.classList.toggle('active');
    sideMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Prevenir scroll cuando el menú está abierto
    if (sideMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
        // Opcional: cerrar el submenú al cerrar el menú principal
        // submenu.classList.remove('open');
        // submenuToggle.classList.remove('open');
    }
}

// Event listeners para el menú principal
menuToggle.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

// Cerrar menú al hacer click en un link de navegación (Home, Tap In, Posters, etc.)
closeMenuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Permitimos la navegación normal, pero cerramos el menú
        toggleMenu();
    });
});

// Lógica para el acordeón del submenú "Works"
if(submenuToggle) {
    submenuToggle.addEventListener('click', (e) => {
        e.preventDefault(); // Evita comportamiento de link si fuera un <a>
        submenu.classList.toggle('open');
        submenuToggle.classList.toggle('open');
    });
}

// Cerrar menú con tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sideMenu.classList.contains('active')) {
        toggleMenu();
    }
});

// Smooth scroll con offset para las anclas
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        
        if (target) {
            const offsetTop = target.offsetTop;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Animación de aparición al hacer scroll
// Animación de aparición al hacer scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // PARTE 1: Cuando el elemento ENTRA en la pantalla
            // Le ponemos opacidad 1 y lo movemos a su lugar original
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        } else {
            // PARTE 2 (NUEVA): Cuando el elemento SALE de la pantalla
            // Lo volvemos a esconder y lo bajamos 30px.
            // Así, cuando vuelvas a bajar, estará listo para animarse de nuevo.
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(30px)';
        }
    });
}, observerOptions);

// Seleccionamos qué cosas vamos a animar:
// 1. Los links del menú (.nav-link)
// 2. Los elementos de la sección About (.scroll-animate)
const elementsToAnimate = document.querySelectorAll('.nav-link, .scroll-animate');

elementsToAnimate.forEach((el) => {
    // Configuración inicial
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Empezar a observar
    observer.observe(el);
});
// Efecto parallax sutil en la imagen al hacer scroll
let lastScrollTop = 0;
const heroImage = document.querySelector('.hero-image img');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (heroImage && scrollTop < window.innerHeight) {
        const translateY = scrollTop * 0.3;
        heroImage.style.transform = `translateY(${translateY}px)`;
    }
    
    lastScrollTop = scrollTop;
});

// Agregar clase al body cuando se hace scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});

// ... (Todo tu código anterior) ...

// ==========================================
// LÓGICA DEL CARRUSEL DE PROYECTOS (CIRCULAR)
// ==========================================

const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (track && prevBtn && nextBtn) {
    
    // Función para calcular el ancho de avance
    const getScrollAmount = () => {
        const firstCard = track.querySelector('.card-wrapper'); // Ojo: ahora buscamos el wrapper
        if (!firstCard) return 0;
        return firstCard.offsetWidth; // Ya incluye el gap visualmente al scrollear
    };

    // BOTÓN SIGUIENTE
    nextBtn.addEventListener('click', () => {
        const amount = getScrollAmount();
        
        // Calculamos si ya llegamos al final
        // (Scroll actual + Ancho visible >= Ancho total del contenido)
        const maxScroll = track.scrollWidth - track.clientWidth;
        
        // Usamos una pequeña tolerancia de 10px por si acaso
        if (track.scrollLeft >= maxScroll - 10) {
            // Si estamos al final, volvemos al principio suavemente
            track.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        } else {
            // Si no, avanzamos normal
            track.scrollBy({
                left: amount,
                behavior: 'smooth'
            });
        }
    });

    // BOTÓN ANTERIOR
    prevBtn.addEventListener('click', () => {
        const amount = getScrollAmount();

        // Calculamos si estamos al principio
        if (track.scrollLeft <= 10) {
            // Si estamos al inicio, vamos al final suavemente
            track.scrollTo({
                left: track.scrollWidth,
                behavior: 'smooth'
            });
        } else {
            // Si no, retrocedemos normal
            track.scrollBy({
                left: -amount,
                behavior: 'smooth'
            });
        }
    });
}

// ==========================================
// MENSAJE DE CRÉDITOS (CONSOLE EGG)
// ==========================================
console.log(
    "%c ¡Hola! 👋 \n%c Diseñé y programé este sitio desde cero con HTML, CSS y Vanilla JS. \n ¿Te gusta el código? Hablemos: agustin.avendano@uc.cl", 
    "font-size: 24px; font-weight: bold; color: #666;", 
    "font-size: 14px; color: #666;"
);

// Reloj en tiempo real
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    const clockElement = document.getElementById('clock');
    if(clockElement) clockElement.innerText = timeString;
}
setInterval(updateClock, 1000);
updateClock(); // Iniciar inmediatamente

// ==========================================
// CARRUSEL INTERNO (PÁGINA DE PROYECTO)
// ==========================================

const processTrack = document.getElementById('processTrack');
const prevProcess = document.getElementById('prevProcess');
const nextProcess = document.getElementById('nextProcess');

if (processTrack && prevProcess && nextProcess) {
    
    nextProcess.addEventListener('click', () => {
        // Avanzamos el ancho exacto de un slide
        const slideWidth = processTrack.clientWidth;
        processTrack.scrollBy({ left: slideWidth, behavior: 'smooth' });
    });

    prevProcess.addEventListener('click', () => {
        const slideWidth = processTrack.clientWidth;
        processTrack.scrollBy({ left: -slideWidth, behavior: 'smooth' });
    });
}

// ==========================================
// ANIMACIÓN DE ENTRADA CARRUSEL (Is-Active)
// ==========================================

const slides = document.querySelectorAll('.process-slide');
const trackContainer = document.getElementById('processTrack');

if (slides.length > 0 && trackContainer) {
    
    // Configuración del observador
    const carouselObserverOptions = {
        root: trackContainer, // Vigilar dentro de la pista
        threshold: 0.5        // Activar cuando el 50% de la imagen sea visible
    };

    const carouselObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Si la imagen entra en la zona visible, la activamos
                entry.target.classList.add('is-active');
            } else {
                // Si sale, la desactivamos (para que se anime de nuevo al volver)
                entry.target.classList.remove('is-active');
            }
        });
    }, carouselObserverOptions);

    // Empezar a vigilar todas las slides
    slides.forEach(slide => {
        carouselObserver.observe(slide);
    });
}