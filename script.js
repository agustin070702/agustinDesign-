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
    
    // IMPORTANTE: Borra cualquier línea que diga document.body...
    // No toques el body, deja que el CSS maneje el color de fondo.
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


// ==========================================
// CARRUSEL CUADRADO (LÓGICA FINAL)
// ==========================================
const trackClean = document.getElementById('trackClean');
const btnPrevClean = document.getElementById('btnPrevClean');
const btnNextClean = document.getElementById('btnNextClean');
const slidesClean = document.querySelectorAll('#trackClean .slide-clean');

if (trackClean) {
    const getCleanScroll = () => {
        const slide = trackClean.querySelector('.slide-clean');
        if (!slide) return 0;
        return slide.offsetWidth + 30; 
    };

    if (btnNextClean) {
        btnNextClean.addEventListener('click', () => {
            trackClean.scrollBy({ left: getCleanScroll(), behavior: 'smooth' });
        });
    }

    if (btnPrevClean) {
        btnPrevClean.addEventListener('click', () => {
            trackClean.scrollBy({ left: -getCleanScroll(), behavior: 'smooth' });
        });
    }

    const observerClean = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-active');
            } else {
                entry.target.classList.remove('is-active');
            }
        });
    }, { root: trackClean, threshold: 0.2 });

    slidesClean.forEach(slide => observerClean.observe(slide));
}


// ==========================================
// CARRUSEL POSTERS (LÓGICA AISLADA PG)
// ==========================================

const trackPG = document.getElementById('trackPG');
const btnPrevPG = document.getElementById('btnPrevPG');
const btnNextPG = document.getElementById('btnNextPG');

// Solo ejecutamos si existen los elementos
if (trackPG && btnPrevPG && btnNextPG) {

    // Función para calcular ancho de movimiento
    const getScrollPG = () => {
        const item = trackPG.querySelector('.pg-item');
        // Ancho del item + el gap (20px)
        return item.offsetWidth + 20; 
    };

    btnNextPG.addEventListener('click', () => {
        trackPG.scrollBy({ left: getScrollPG(), behavior: 'smooth' });
    });

    btnPrevPG.addEventListener('click', () => {
        trackPG.scrollBy({ left: -getScrollPG(), behavior: 'smooth' });
    });

    // Observador para la animación de entrada
    const observerPG = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-active');
            } else {
                entry.target.classList.remove('is-active');
            }
        });
    }, { root: trackPG, threshold: 0.5 });

    trackPG.querySelectorAll('.pg-item').forEach(item => {
        observerPG.observe(item);
    });
}

// ==========================================
// LIGHTBOX INTELIGENTE (CON NAVEGACIÓN)
// ==========================================

const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('lightboxImg');
const closeBtn = document.querySelector('.close-btn');
const btnPrevLB = document.getElementById('lbPrev');
const btnNextLB = document.getElementById('lbNext');

// Variables para controlar la galería actual
let currentGalleryImages = []; // Aquí guardaremos la lista de fotos del carrusel actual
let currentImageIndex = 0;     // Aquí guardaremos en qué número vamos

if (modal) {
    
    // Función para abrir el Modal en una foto específica
    const openModal = (index) => {
        if (index >= 0 && index < currentGalleryImages.length) {
            currentImageIndex = index;
            modalImg.src = currentGalleryImages[index].src;
            modal.style.display = "flex";
            document.body.style.overflow = "hidden";
            
            // Ocultar flechas si es una foto única (como la portada)
            if (currentGalleryImages.length <= 1) {
                btnPrevLB.style.display = 'none';
                btnNextLB.style.display = 'none';
            } else {
                btnPrevLB.style.display = 'block';
                btnNextLB.style.display = 'block';
            }
        }
    };

    // SELECTOR UNIVERSAL: Detectamos todas las fotos zoomables
    const allZoomableImages = document.querySelectorAll(`
        .hero-image,
        .square-slide img,
        .slide-clean img,
        .pg-item img,
        .project-gallery-grid img,
        .project-gallery-grid2 img,
        .gallery-item img,
        .process-slide img
    `);

    allZoomableImages.forEach(img => {
        img.addEventListener('click', function() {
            // TRUCO DE MAGIA: Detectar el "grupo" de la foto
            // Buscamos el contenedor padre (el Track o la Grilla)
            const parentContext = this.closest(`
                #squareTrack, 
                #trackClean, 
                #trackPG, 
                #processTrack, 
                .project-gallery-grid, 
                .project-gallery-grid2
            `);

            if (parentContext) {
                // Si está en un grupo, coleccionamos todas las fotos de ese grupo
                currentGalleryImages = Array.from(parentContext.querySelectorAll('img'));
            } else {
                // Si no tiene grupo (ej: Portada), es una galería de 1 sola foto
                currentGalleryImages = [this];
            }

            // Encontramos qué número es la foto que clickeaste
            const index = currentGalleryImages.indexOf(this);
            openModal(index);
        });
    });

   // --- NAVEGACIÓN CON TRANSICIÓN SUAVE ---
    
    const changeImageWithFade = (newIndex) => {
        // 1. Desvanecer la foto actual (Fade Out)
        modalImg.style.opacity = "0";
        modalImg.style.transform = "scale(0.95)"; // Se achica un poquito para efecto elegante
        
        // 2. Esperar 300ms (lo que dura la transición CSS)
        setTimeout(() => {
            currentImageIndex = newIndex;
            
            // 3. Cambiar la foto
            modalImg.src = currentGalleryImages[currentImageIndex].src;
            
            // 4. Volver a mostrarla (Fade In)
            modalImg.style.opacity = "1";
            modalImg.style.transform = "scale(1)";
            
        }, 250); // Tiene que coincidir con los 0.3s del CSS
    };

    const showNext = (e) => {
        if(e) e.stopPropagation();
        let newIndex = currentImageIndex + 1;
        if (newIndex >= currentGalleryImages.length) newIndex = 0;
        
        changeImageWithFade(newIndex);
    };

    const showPrev = (e) => {
        if(e) e.stopPropagation();
        let newIndex = currentImageIndex - 1;
        if (newIndex < 0) newIndex = currentGalleryImages.length - 1;
        
        changeImageWithFade(newIndex);
    };

    if (btnNextLB) btnNextLB.addEventListener('click', showNext);
    if (btnPrevLB) btnPrevLB.addEventListener('click', showPrev);

    // --- NAVEGACIÓN (TECLADO) ---
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === "flex") {
            if (e.key === "ArrowRight") showNext(e);
            if (e.key === "ArrowLeft") showPrev(e);
            if (e.key === "Escape") closeModal();
        }
    });

    // --- CERRAR ---
    const closeModal = () => {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}









// --- LÓGICA SIEMPRE LAB ---
const jotitaTrigger = document.getElementById('jotita-trigger');
const labOverlay = document.getElementById('siempre-lab-overlay');
const closeLab = document.getElementById('close-lab');
const labList = document.getElementById('lab-list');

// CONFIGURA AQUÍ LA FECHA (Año, Mes (0-11), Día, Hora, Minuto)
// Ejemplo: 14 de Febrero 2026 a las 20:00 -> (2026, 1, 14, 20, 0)
const fechaEvento = new Date(2026, 0, 17, 20, 0).getTime(); 

jotitaTrigger.addEventListener('click', () => {
    // En vez de style.display, agregamos la clase
    labOverlay.classList.add('active'); 
    
    document.body.style.overflow = 'hidden'; // Bloquea scroll
    actualizarContador();
});

closeLab.addEventListener('click', () => {
    // Quitamos la clase para que se desvanezca suavemente
    labOverlay.classList.remove('active');
    
    document.body.style.overflow = 'auto'; // Reactiva scroll
});

function actualizarContador() {
    const x = setInterval(function() {
        const ahora = new Date().getTime();
        const distancia = fechaEvento - ahora;

        const d = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const h = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distancia % (1000 * 60)) / 1000);

        document.getElementById("days").innerHTML = d;
        document.getElementById("hours").innerHTML = h;
        document.getElementById("minutes").innerHTML = m;
        document.getElementById("seconds").innerHTML = s;

        if (distancia < 0) {
            clearInterval(x);
            document.getElementById("lab-timer").style.display = "none";
            labList.style.display = "block";
        }
    }, 1000);
}

// --- LÓGICA DEL BOTÓN DESPLEGABLE (CON TRANSICIÓN) ---
const toggleBtn = document.getElementById('toggle-list-btn');

toggleBtn.addEventListener('click', () => {
    // Alternamos la clase 'open' en la lista
    labList.classList.toggle('open');
    
    // Verificamos si la clase está puesta para cambiar el texto
    if (labList.classList.contains('open')) {
        toggleBtn.textContent = "Ocultar listado";
        
        // Pequeña espera para hacer el scroll suave y que no sea brusco
        setTimeout(() => {
            labList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
        
    } else {
        toggleBtn.textContent = "Ver el listado de compras :)";
    }
});


/* --- EFECTO SMART SCROLL (Nuevo y Limpio) --- */
let ultimoScroll = 0;

window.addEventListener('scroll', () => {
    // 1. Si es pantalla grande (>1024px), no hacemos nada
    if (window.innerWidth > 1024) return;

    // 2. PROTECCIÓN: Si el menú está abierto, ¡NO ocultamos el botón!
    if (sideMenu.classList.contains('active')) {
        menuToggle.classList.remove('oculto'); // Aseguramos que se vea
        return; 
    }

    // 3. Detectar dirección del scroll
    const scrollActual = window.pageYOffset || document.documentElement.scrollTop;

    // Si bajamos más de 50px...
    if (scrollActual > ultimoScroll && scrollActual > 50) {
        // BAJANDO -> Agregamos la clase para ocultar
        menuToggle.classList.add('oculto');
    } else {
        // SUBIENDO -> Quitamos la clase para mostrar
        menuToggle.classList.remove('oculto');
    }

    // 4. Actualizar posición (evitando números negativos)
    ultimoScroll = Math.max(0, scrollActual);
});