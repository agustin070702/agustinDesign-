history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
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

// =======================================================
// SMOOTH SCROLL PERSONALIZADO
// Reemplaza el behavior:'smooth' nativo que en móvil se
// siente brusco e inconsistente entre browsers.
// Usa easeInOutCubic: arranca suave, acelera en el medio
// y frena suavemente al llegar — igual que las animaciones
// CSS del resto de la página.
// =======================================================

/* --- Función de easing: curva cuadrática simétrica ---
   easeInOutQuad usa exponente 2 en vez de 3 (cúbica).
   Resultado: arranca lento igual, pero la velocidad pico
   es bastante más moderada — sin el disparo agresivo del medio. */
function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* --- Motor del scroll animado con requestAnimationFrame ---
   to:       posición destino en px
   duration: duración total en ms */
function smoothScrollTo(to, duration) {
    const from = window.scrollY;
    const distance = to - from;
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;

        // Progreso de 0 a 1, nunca supera 1
        const progress = Math.min(elapsed / duration, 1);

        // Aplicamos la curva de easing al progreso lineal
        const easedProgress = easeInOutCubic(progress);

        // Movemos la ventana a la posición interpolada
        window.scrollTo(0, from + distance * easedProgress);

        // Si no llegamos, pedimos el siguiente frame
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

/* --- Posición absoluta de un elemento en el documento ---
   Suma todos los offsetTop de los padres para obtener
   la posición real sin depender del scroll actual. */
function getAbsoluteTop(el) {
    let top = 0;
    while (el) { top += el.offsetTop; el = el.offsetParent; }
    return top;
}

/* --- Listener para todos los anchor links (#seccion) ---
   En móvil agrega un delay de 120ms antes de arrancar el scroll.
   Esto le da tiempo al efecto :active (scale+opacity) de ser
   visible antes de que la página empiece a moverse, haciendo
   la experiencia coherente y no brusca. */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        const absoluteTop = getAbsoluteTop(target);
        const targetHeight = target.offsetHeight;
        const windowHeight = window.innerHeight;

        // #about: snap al borde superior exacto de la sección negra
        // #work:  snap al borde superior (sección 100vh se centra sola)
        // Resto:  centrar la sección en viewport
        let offsetTop;
        if (targetId === '#about') {
            offsetTop = absoluteTop;
        } else if (targetId === '#work') {
            offsetTop = absoluteTop;
        } else {
            offsetTop = absoluteTop - (windowHeight / 2) + (targetHeight / 2);
        }

        // Nunca scrollear por encima del origen de la página
        const clampedOffset = Math.max(0, offsetTop);

        // Detectamos dispositivo táctil para aplicar el delay
        const isTouchDevice = window.matchMedia('(hover: none)').matches;

        // Touch: 120ms de delay para que el efecto :active sea visible
        // Mouse: arranca de inmediato
        const delay = isTouchDevice ? 120 : 0;

        setTimeout(() => {
            // 900ms: duración que se siente premium, ni rápida ni lenta
            smoothScrollTo(clampedOffset, 1200);
        }, delay);
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
const elementsToAnimate = document.querySelectorAll('.nav-link, .scroll-animate:not(.contact-anim-left):not(.contact-anim-right):not(.works-carousel-scroll)');

// Scroll animate más lento para el contact
const contactScrollElements = document.querySelectorAll('.contact-section .scroll-animate');
contactScrollElements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 2.5s ease-out, transform 2.5s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
});

elementsToAnimate.forEach((el) => {
    // Configuración inicial
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Empezar a observar
    observer.observe(el);
});

// Scroll animate más lento para el carrusel
const worksCarouselScroll = document.querySelector('.works-carousel-scroll');
if (worksCarouselScroll) {
    worksCarouselScroll.style.opacity = '0';
    worksCarouselScroll.style.transform = 'translateY(30px)';
    worksCarouselScroll.style.transition = 'opacity 2.2s ease-out, transform 2.2s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(worksCarouselScroll);
}

// Animación de entrada columnas About
const aboutProfile = document.querySelector('.about-profile');
const aboutResume = document.querySelector('.about-resume');

const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, { threshold: 0.2 });

if (aboutProfile) {
    aboutProfile.style.animationPlayState = 'paused';
    aboutObserver.observe(aboutProfile);
}
if (aboutResume) {
    aboutResume.style.animationPlayState = 'paused';
    aboutObserver.observe(aboutResume);
}

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
// CARRUSEL SELECTED WORKS (INFINITO)
// ==========================================
const worksTrack = document.getElementById('carouselTrack');
const worksPrev = document.getElementById('prevBtn');
const worksNext = document.getElementById('nextBtn');

if (worksTrack && worksPrev && worksNext) {

    // Triplicamos las tarjetas: [clon] [original] [clon]
    // Así el reset siempre ocurre fuera de la vista
    const originalCards = Array.from(worksTrack.children);
    const total = originalCards.length;

    // Clonar antes (prepend)
    const clonesBefore = originalCards.map(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        return clone;
    });
    clonesBefore.reverse().forEach(clone => worksTrack.prepend(clone));

    // Clonar después (append)
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        worksTrack.appendChild(clone);
    });

    // Arrancamos en el set del medio (índice = total)
    let currentIndex = total;
    let isAnimating = false;

    const getCardWidth = () => {
        const card = worksTrack.querySelector('.work-card-wrapper');
        return card ? card.offsetWidth + 24 : 0;
    };

    const MAX_ANIMATIONS = 2; // veces que cada tarjeta puede animarse

    const animateCards = () => {
        const wrapperRect = worksTrack.parentElement.getBoundingClientRect();
        const cards = worksTrack.querySelectorAll('.work-card-wrapper');
        let delay = 0;
        cards.forEach((card) => {
            const cardRect = card.getBoundingClientRect();
            const isVisible = cardRect.left < wrapperRect.right - 50 && cardRect.right > wrapperRect.left + 50;
            const timesShown = parseInt(card.dataset.shown || '0');

            if (!isVisible) {
                // Sale de vista: si aún le quedan animaciones, la reseteamos
                if (timesShown < MAX_ANIMATIONS) {
                    card.classList.remove('visible');
                }
            } else if (!card.classList.contains('visible')) {
                // Entra en vista: la animamos y sumamos una vez
                card.dataset.shown = timesShown + 1;
                setTimeout(() => card.classList.add('visible'), delay);
                delay += 80;
            }
        });
    };

    const goTo = (index, animated = true) => {
        worksTrack.style.transition = animated
            ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
            : 'none';
        worksTrack.style.transform = `translateX(-${index * getCardWidth()}px)`;
        currentIndex = index;
    };

    // Posición inicial sin animación
    goTo(currentIndex, false);
    setTimeout(animateCards, 100);

    worksNext.addEventListener('click', () => {
        if (isAnimating) return;
        isAnimating = true;
        goTo(currentIndex + 1);

        setTimeout(() => {
            // Si llegamos al último set de clones, saltamos silenciosamente al medio
            if (currentIndex >= total * 2) {
                goTo(currentIndex - total, false);
            }
            animateCards();
            isAnimating = false;
        }, 520);
    });

    worksPrev.addEventListener('click', () => {
        if (isAnimating) return;
        isAnimating = true;
        goTo(currentIndex - 1);

        setTimeout(() => {
            // Si llegamos al primer set de clones, saltamos silenciosamente al medio
            if (currentIndex < total) {
                goTo(currentIndex + total, false);
            }
            animateCards();
            isAnimating = false;
        }, 520);
    });

    // Scroll horizontal con trackpad
    worksTrack.parentElement.addEventListener('wheel', (e) => {
        const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        if (!isHorizontal) return;
        e.preventDefault();
        if (e.deltaX > 15) worksNext.click();
        if (e.deltaX < -15) worksPrev.click();
    }, { passive: false });
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

    /* Guardar posición del scroll horizontal del carrusel.
       iOS Safari resetea scrollLeft cuando el elemento sale del viewport.
       Salvamos el valor en cada scroll y lo restauramos cuando el track
       vuelve a ser visible. */
    let savedCleanScroll = 0;

    trackClean.addEventListener('scroll', () => {
        savedCleanScroll = trackClean.scrollLeft;
    }, { passive: true });

    const wrapClean = trackClean.closest('.lc-carousel-wrap');
    if (wrapClean) {
        const restoreClean = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && savedCleanScroll > 0) {
                    // Restaurar sin animación para que sea instantáneo
                    trackClean.scrollLeft = savedCleanScroll;
                }
            });
        }, { root: null, threshold: 0 });
        restoreClean.observe(wrapClean);
    }

    /* Observer de slides: solo añade is-active, nunca quita */
    const observerClean = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-active');
            }
        });
    }, { root: null, threshold: 0.2 });

    slidesClean.forEach(slide => observerClean.observe(slide));

    /* Detección de dirección del gesto en móvil */
    let tcStartX = 0, tcStartY = 0, tcLocked = false;

    trackClean.addEventListener('touchstart', (e) => {
        tcStartX = e.touches[0].clientX;
        tcStartY = e.touches[0].clientY;
        tcLocked = false;
    }, { passive: true });

    trackClean.addEventListener('touchmove', (e) => {
        if (tcLocked) return;
        const dx = Math.abs(e.touches[0].clientX - tcStartX);
        const dy = Math.abs(e.touches[0].clientY - tcStartY);
        tcLocked = true;
        if (dy > dx) {
            trackClean.style.overflowX = 'hidden';
        } else {
            trackClean.style.overflowX = 'scroll';
        }
    }, { passive: true });

    trackClean.addEventListener('touchend', () => {
        tcLocked = false;
        trackClean.style.overflowX = 'scroll';
    }, { passive: true });
}

// ==========================================
// CARRUSEL GALERÍA FINAL LC2 (LA COLUMNA)
// ==========================================
const trackLC2   = document.getElementById('trackLC2');
const lc2BtnPrev = document.getElementById('lc2BtnPrev');
const lc2BtnNext = document.getElementById('lc2BtnNext');
const slidesLC2  = document.querySelectorAll('#trackLC2 .lc2-slide');

if (trackLC2) {

    const getLC2Scroll = () => {
        const slide = trackLC2.querySelector('.lc2-slide');
        if (!slide) return 0;
        return slide.offsetWidth + 20;
    };

    if (lc2BtnNext) {
        lc2BtnNext.addEventListener('click', () => {
            trackLC2.scrollBy({ left: getLC2Scroll(), behavior: 'smooth' });
        });
    }
    if (lc2BtnPrev) {
        lc2BtnPrev.addEventListener('click', () => {
            trackLC2.scrollBy({ left: -getLC2Scroll(), behavior: 'smooth' });
        });
    }

    /* Guardar y restaurar posición horizontal del carrusel LC2 */
    let savedLC2Scroll = 0;

    trackLC2.addEventListener('scroll', () => {
        savedLC2Scroll = trackLC2.scrollLeft;
    }, { passive: true });

    const wrapLC2 = trackLC2.closest('.lc-carousel-wrap');
    if (wrapLC2) {
        const restoreLC2 = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && savedLC2Scroll > 0) {
                    trackLC2.scrollLeft = savedLC2Scroll;
                }
            });
        }, { root: null, threshold: 0 });
        restoreLC2.observe(wrapLC2);
    }

    /* Observer de slides: solo añade is-active, nunca quita */
    const observerLC2 = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-active');
            }
        });
    }, { root: null, threshold: 0.2 });

    slidesLC2.forEach(slide => observerLC2.observe(slide));

    /* Detección de dirección del gesto en móvil */
    let lc2StartX = 0, lc2StartY = 0, lc2Locked = false;

    trackLC2.addEventListener('touchstart', (e) => {
        lc2StartX = e.touches[0].clientX;
        lc2StartY = e.touches[0].clientY;
        lc2Locked = false;
    }, { passive: true });

    trackLC2.addEventListener('touchmove', (e) => {
        if (lc2Locked) return;
        const dx = Math.abs(e.touches[0].clientX - lc2StartX);
        const dy = Math.abs(e.touches[0].clientY - lc2StartY);
        lc2Locked = true;
        if (dy > dx) {
            trackLC2.style.overflowX = 'hidden';
        } else {
            trackLC2.style.overflowX = 'scroll';
        }
    }, { passive: true });

    trackLC2.addEventListener('touchend', () => {
        lc2Locked = false;
        trackLC2.style.overflowX = 'scroll';
    }, { passive: true });
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

// Animación entrada Selected Works
const sectionLabel = document.querySelector('.section-label');
const sectionTitle = document.querySelector('.section-title');
const worksControls = document.querySelector('.works-controls-anim');
const worksTrackWrapper = document.querySelector('.works-track-wrapper');

const worksObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            sectionLabel.classList.add('visible');
            sectionTitle.classList.add('visible');
            if (worksControls) worksControls.classList.add('visible');
            if (worksTrackWrapper) worksTrackWrapper.classList.add('visible');
        }
    });
}, { threshold: 0.2 });

if (sectionLabel) worksObserver.observe(sectionLabel);




// Animación entrada Contact
const contactLeft = document.querySelector('.contact-anim-left');
const contactRight = document.querySelector('.contact-anim-right');

const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, { threshold: 0.2 });

if (contactLeft) {
    contactLeft.style.animationPlayState = 'paused';
    contactObserver.observe(contactLeft);
}
if (contactRight) {
    contactRight.style.animationPlayState = 'paused';
    contactObserver.observe(contactRight);
}


// ==========================================
// TRANSICIÓN HERO → ABOUT
// ==========================================
const heroContent = document.querySelector('.hero-content');
const heroSection = document.querySelector('.hero');
const heroImage = document.querySelector('.hero-image img');
if (heroImage) heroImage.style.transform = 'scale(1.15)';

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;
    const progress = Math.min(scrollTop / (heroHeight * 0.5), 1);

    // Fade out + movimiento suave del contenido del hero
    if (heroContent) {
        heroContent.style.cssText += `opacity: ${1 - progress} !important; transform: translateY(-${progress * 20}px) !important;`;
    }

    // Zoom out suave en la imagen
if (heroImage && scrollTop < heroHeight) {
    const imgProgress = Math.min(scrollTop / heroHeight, 1);
heroImage.style.transform = `scale(${1.15 - imgProgress * 0.15})`;
}
}, { passive: true });


































/* =========================================
   KIT DE PRIMEROS AUXILIOS - LÓGICA MAESTRA
   ========================================= */

// --- 1. CONFIGURACIÓN ---
const PHONE_NUMBER = "56956247539"; // Ej: 56912345678 (Sin el +)

// --- 2. BASE DE DATOS DE PREGUNTAS ---
const DB_PREGUNTAS = [
    {
        id: 1,
        pregunta: "Pregunta Cheat Meal: Identifique la primera ingesta de comida consumida al interior del vehículo en nuestra historia.",
        opciones: ["Un Streat Wrap", "Churros", "Pizza", "Hamburguesa"],
        correcta: 2, 
        evidenceTitle: "EVIDENCIA #001 DESBLOQUEADA",
        evidenceText: "Correcto. Aún quedan restos de queso en el piso de la camioneta como prueba forense ¿Que mejor panorama que manejar contigo despúes de la playa comiendo algo rico?",
        evidenceImg: "img/evidencia1.jpg"
    },
    {
        id: 2,
        pregunta: "Tradición Culinaria: ¿Qué menú inauguró oficialmente el concepto de 'Siemprelab'?",
        opciones: ["Sushi", "Risotto", "Tapas Españolas", "Carne con crema"],
        correcta: 1, 
        evidenceTitle: "ARCHIVO CULINARIO: 'EL ORIGEN'",
        evidenceText: "Afirmativo. El Risotto de champiñong con entraña. Yo creo que si cierras bien los ojos, todavía puedes sentir ese olorcito y el estrés real de que no se nos pegara el arroz en el intento",
        evidenceImg: "img/evidencia2.jpg"
    },
    {
        id: 3,
        pregunta: "Verificación de Antecedentes: ¿Qué apariencia proyectaba Josefina al presentarse en la ida a la Notaría/Comisaría?",
        opciones: ["Un vago / Indigente", "Un ladrón internacional", "Un puber de 15", "Todas las anteriores"],
        correcta: 3, 
        evidenceTitle: "FICHA POLICIAL: BERNARDITA LÓPEZ ",
        evidenceText: "Cacha jajajaja No sé cómo no te llevaron detenida con tal facha de dudosa procedencia que te mandaste. Pero weno, entre el estilo y el olorsito con el que andabai, menos mal no encontraron pruebas ",
        evidenceImg: "img/evidencia3.jpg"
    },
    {
        id: 4,
        pregunta: "Clave de Acceso Emocional: ¿Qué figura artística se utilizó como metáfora para la petición de pololeo?",
        opciones: ["Leonardo Da Vinci", "Miguel Ángel", "Rafael Sanzio", "Donatello"],
        correcta: 1, 
        evidenceTitle: "ANÁLISIS ARTÍSTICO: LA CREACIÓN ",
        evidenceText: "Exacto. Ni la Capilla Sixtina tiene tanta historia. Quién lo diría que después de esa metáfora, en un par de meses vamos a estar allá mismo viendo las obras de Miguel Ángel juntos",
        evidenceImg: "img/evidencia4.jpg"
    },
    {
        id: 5,
        pregunta: "Test de Memoria Fotográfica: Indique el color de la vestimenta utilizada por la sujeto el día de la propuesta.",
        opciones: ["Blanco Inocencia", "Rojo Pasión", "Negro Fancy", "Azul Potente"],
        correcta: 2, 
        evidenceTitle: "REGISTRO VISUAL DE LA DIOSA DE LA FACHA",
        evidenceText: "De negro, pues claro. ¿Que mejor facha que de negro con tus pantalones grises fancy? Todavía no se si se veía más rica la burga o mi futura polola en ese momento...",
        evidenceImg: "img/evidencia5.jpg"
    },
    {
        id: 6,
        pregunta: "Análisis Artístico: Durante nuestra sesión de pintura (absracta parece), ¿cuál fue la lógica detrás de los stichs pintados?",
        opciones: ["Usted quería un perro azul / Yo pinté lo primero que encontré", " Usted por tener un Stitch tamaño real / Yo por representación mía", "Usted pintó al Stitch para regalármelo / Yo pinté un stich Elvis", "Fue un error de cálculo técnico / A mi me encantó la foto elegida"],
        correcta: 1, 
        evidenceTitle: "REGISTRO ARTÍSTICO #006",
        evidenceText: "Confirmado. Tu Stitch de a escala 1:1 cumplía el deseo de una mascota que no fuera un gato, y a mi me representaba el sapo en la mano :)",
        evidenceImg: "img/evidencia6.jpg" 
    },
    {
        id: 7,
        pregunta: "Incidente Gastronómico: ¿Cuál fue el primer suministro alimenticio dulce que la Dra. Josefina preparó para su marido?",
        opciones: ["Rocas cafés", "Pedazos de caca de caballo", "Carbón vegetal dulce", "Los mejores brownies de su vida"],
        correcta: 3, 
        evidenceTitle: "REPORTE DE TOXICOLOGÍA #007",
        evidenceText: "Weno, hay que decir las cosas como son: cuando los vi, pensé que me habíai traído un par de pedazos de pavimento. Pero cacha que al primer mordisco me di cuenta de que eran los mejores brownies del mundo",
        evidenceImg: "img/evidencia7.jpg"
    },
    {
        id: 8,
        pregunta: "Registro de Conflictos: Identifique la causa de la queja y alegato durante el consumo de helados en la playa",
        opciones: ["Supuesto joteo de la que atendía", "Mala elección del sabor de helado", "Colapso estructural (se chorreaba)", "Todas las anteriores"],
        correcta: 3, 
        evidenceTitle: "REGISTRO DE INCIDENCIAS: PLAYA",
        evidenceText: "Correctoooo. Yo ahí todo un pobre inocente mientras la del helado me andaba tirando los cagados y tú con una cara de 'te mato' por el sabor re malo que elegí. Pero muy lindo momento :)",
        evidenceImg: "img/evidencia8.jpg"
    },
    {
        id: 9,
        pregunta: "Evaluación Estética: Según el registro central de datos del pololo, ¿cómo se considera actualmente a la Dra. Josefina?",
        opciones: ["La mujer más bella y fachera del planeta"],
        correcta: 0, 
        evidenceTitle: "ESTADO #009: IDENTIDAD CONFIRMADA",
        evidenceText: "Es que no hay margen de error Josefinaaaa. Gemini me arroja un 100% de coincidencia con el estándar de 'Belleza Máxima'. Te juro que hasta zorreada con mi ropa me enamoras igual, es que con esa facha, bua",
        evidenceImg: "img/evidencia9.jpg"
    },
    {
        id: 10,
        pregunta: "Operación Runner: ¿Qué anomalías se registraron durante la primera incursión de trote en pareja?",
        opciones: ["Escolta perfumado a copete", "Falla sistémica de Josefina a los 300mts", "Tour posterior por clínicas locales", "Todas las anteriores"],
        correcta: 3, 
        evidenceTitle: "REPORTE DE RENDIMIENTO #010",
        evidenceText: "El equipo runner resultó ser un desastre mal. Entre el olor a pisco y la fatiga trempanera, terminamos siendo clientes múltiples clínicas",
        evidenceImg: "img/evidencia10.jpg"
    },
    {
        id: 11,
        pregunta: "Preferencia Animal: ¿Cuál de las mascotas de Agustín que posee el mayor rango de afecto por parte de la susodicha?",
        opciones: ["Baloo", "Nala", "Bucky", "Miau Miau", "Todas :)"],
        correcta: 4, 
        evidenceTitle: "ANÁLISIS DE ESPECIES #011",
        evidenceText: "Correcto: Cualquiera. Aunque ya va siendo hora de asumir que ahora entre la Miau Miau y el Bucky, tienes claro que: gatos > perros",
        evidenceImg: "img/evidencia11.jpg"
    },
    {
        id: 12,
        pregunta: "Análisis de Estilo: ¿Cuál es el outfit favorito de la presente según el marido, Agustín?",
        opciones: ["Corte Ejecutiva", "Deportista Rica", "Modo Pijama", "Ninguna de las anteriores"],
        correcta: 3, 
        evidenceTitle: "FICHA DE VESTUARIO #012",
        evidenceText: "no hay comparación alguna...",
        evidenceImg: "img/evidencia12.jpg"
    },
    {
        id: 13,
        pregunta: "Logística de Bikers: ¿Cuántos KM reales pedaleamos para el café y el muffin de Red Velvet?",
        opciones: ["5 km", "7 km", "11 km", "13 km"],
        correcta: 2, 
        evidenceTitle: "DATOS GPS #013 (CORREGIDOS)",
        evidenceText: "El registro oficial dice 11km, pero todos sabemos la verdad, fue pura bajada y pedaleamos con suerte 500 metros. El resto aplicamos vuelito",
        evidenceImg: "img/evidencia13.jpg"
    },
    {
        id: 14,
        pregunta: "Protocolo de Cierre: Tras analizar los registros y desastres previos... ¿Cuál es la conclusión del sistema?",
        opciones: ["Error de funcionamiento: Exceso de cringe", "El sistema confirma que no hay mejor equipo que este", "Reiniciar simulación para repetir nuestra historia", "Falla de Conectividad: El GPS no reconoce rutas de trote de menos de 500 metros"],
        correcta: 1, 
        evidenceTitle: "ESTADO FINAL #014: ACCESO TOTAL",
        evidenceText: "Acceso Total Concedido. El sistema colapsó analizando tanta historia juntos. Al final, aunque andemos zorreados o pedaleemos 500 metros de pura bajada, weno, no hay nadie más con quien quiera vivir estas cosas más que contigo. Eres mi partner, mi número uno y taxss",
        evidenceImg: "img/evidencia14.jpg"
    }

];

// --- 3. BASE DE DATOS DE CUPONES ---
const DB_CUPONES = [
   { 
        id: "01", 
        title: "Kit Anti-Colapso", 
        desc: "Canjea esto para recibir tu regalo. Ideal para no volverte loca con el estrés de la semana.", 
        msg: "*[TICKET CANJEADO]* Alerta de colapso inminente. Solicito formalmente la entrega de mi regalo sorpresa para salvar la semana.",
        img: "img/cupon1.jpg"
    },
    { 
        id: "02", 
        title: "El Bajón Auspiciado", 
        desc: "Te mando la comida que quieras cuando no haya nada decente en el refri.", 
        msg: "[TICKET CANJEADO] Vengo a cobrar mi Bajón Auspiciado. El refri no se la banca y mi guata exige la inyección de comida prometida.",
        img: "img/cupon2.jpg"
    },
    { 
        id: "03", 
        title: "Bypass de Trámites", 
        desc: "Pásame ese cacho administrativo. Yo redacto el mail con tono formal para que tú no te estreses, o te traduzco y resumo los papers que quieras.", 
        msg: "[TICKET CANJEADO] Hola, señor secretario. Vengo a canjear mi cupón para que te hagas cargo de este trámite o paper que me da demasiada lata.",
        img: "img/cupon3.jpg"
    },
    { 
        id: "04", 
        title: "Date de Película Premium", 
        desc: "Cita a distancia donde prometo no quedarme dormido (o al menos intentarlo) a la mitad de la pelicula. Incluye el envío de algo rico para acompañar.", 
        msg: "[TICKET CANJEADO] Ola amdv. Exijo película contigo, comida y un análisis profundo post-créditos.",
        img: "img/cupon4.jpg"
    },
    { 
        id: "05", 
        title: "Pase Libre para el Demogorgon", 
        desc: "Válido para putear al universo entero por 60 minutos mientras te doy la razón en absolutamente todo.", 
        msg: "[TICKET CANJEADO] Alerta roja. Necesito putear al universo un rato. Canjeando mi pase libre, responde cuando estés listo.",
        img: "img/cupon52.jpg"
    },
    { 
        id: "06", 
        title: "Inyección de Azúcar Express", 
        desc: "Sobredosis de glucosa auspiciada por tu pololo para salvar la tarde.", 
        msg: "[TICKET CANJEADO] Mi cuerpo pide azúcar urgente. Vengo a cobrar el dulcecito auspiciado.",
        img: "img/cupon63.jpg"
    },
    { 
        id: "07", 
        title: "Despacho en Vivo: BCN", 
        desc: "Me conecto desde un spot bonito de Barcelona para mostrártelo en tiempo real.", 
        msg: "[TICKET CANJEADO] Vengo a cobrar mi paseo virtual. Ponte en modo guía turístico que quiero conocer ...",
        img: "img/cupon7.jpg"
    },
    { 
        id: "08", 
        title: "Despertador VIP", 
        desc: "Servicio de alarma humana. No me rindo hasta que escuche por el micrófono que te estás sentando a estudiar o yendo al gym.", 
        msg: "[TICKET CANJEADO] Programando mi Despertador VIP. Necesito que me llames a las ... y no me dejes dormir, asegúrate que me levanté.",
        img: "img/cupon8.jpg"
    },
    { 
        id: "09", 
        title: "Hype Letter", 
        desc: "Inyección de ego directa a la vena. Para esas veces que se te parece olvidar lo tremenda que eres.", 
        msg: "[TICKET CANJEADO] Alerta de día gris, necesito una ayudita :/",
        img: "img/cupon9.jpg"
    },
    { 
        id: "10", 
        title: "Vitrineo por FaceTime", 
        desc: "Mándame a la tienda que elijas, te llamo por videollamada y vitrineamos juntos para comprarte lo que quieras.", 
        msg: "[TICKET CANJEADO] Prepara la billetera. Te voy a mandar a una tienda y me llamas para vitrinear juntos.",
        img: "img/cupon10.jpg"
    },
    { 
        id: "11", 
        title: "Co-Working Mudo", 
        desc: "Prendemos la cámara y nos hacemos compañía en silencio mientras cada uno hace lo suyo.", 
        msg: "[TICKET CANJEADO] Canjeando Co-Working Mudo. Prendamos la cámara que no quiero estar sola haciendo esto.",
        img: "img/cupon113.jpg"
    },
    { 
        id: "12", 
        title: "Lo Que Quiera la Jefa", 
        desc: "Válido por un milagro, un capricho o una locura. Prometo no hacer muchas preguntas.", 
        msg: "[TICKET CANJEADO] Comodín supremo activado. Voy a pedir lo siguiente ... (prometiste no hacer preguntas)",
        img: "img/cupon12.jpg"
    }
];

// --- 4. VARIABLES DE ESTADO ---
let preguntaActual = 0;
const kitOverlay = document.getElementById('kitOverlay');
const introScreen = document.getElementById('introScreen'); // La nueva pantalla
const securityScreen = document.getElementById('securityScreen');
const evidenceScreen = document.getElementById('evidenceScreen');
const moodScreen = document.getElementById('moodScreen');
const couponsScreen = document.getElementById('couponsScreen');

// --- 5. FUNCIONES DE CONTROL ---
function abrirKit() {
    kitOverlay.classList.add('active');
    // Reseteamos todo al abrir
    preguntaActual = 0;
    
    // MOSTRAR SOLO LA INTRO
    if(introScreen) introScreen.style.display = 'block';
    securityScreen.style.display = 'none';
    evidenceScreen.style.display = 'none';
    moodScreen.style.display = 'none';
    couponsScreen.style.display = 'none';
}

function comenzarProtocolo() {
    // Del Intro a la Trivia
    if(introScreen) introScreen.style.display = 'none';
    securityScreen.style.display = 'block';
    renderizarPregunta();
}

function cerrarKit() {
    const kitOverlay = document.getElementById('kitOverlay');
    if (kitOverlay) kitOverlay.classList.remove('active');
    
    // Devolvemos los elementos a su estado oculto para la próxima vez
    setTimeout(() => {
        const animElements = document.querySelectorAll('.coupon-label-anim, .coupon-title-anim, .coupon-controls-anim, .coupon-track-anim');
        animElements.forEach(el => el.classList.remove('visible'));
        
        const track = document.getElementById('cpCarouselTrack');
        if (track) track.innerHTML = '';
    }, 500);
}

// --- 6. LÓGICA DE LA TRIVIA ---
function renderizarPregunta() {
    const data = DB_PREGUNTAS[preguntaActual];
    let html = `
        <div class="security-card">
            <div class="security-header">
                <h3>Protocolo de Seguridad // Paso ${preguntaActual + 1} de ${DB_PREGUNTAS.length}</h3>
            </div>
            <p class="security-question">${data.pregunta}</p>
            <div class="options-grid">
    `;
    data.opciones.forEach((opcion, index) => {
        html += `<button class="btn-option" onclick="verificarRespuesta(${index}, this)">[ ] ${opcion}</button>`;
    });
    html += `</div></div>`;
    securityScreen.innerHTML = html;
}

function verificarRespuesta(indiceSeleccionado, btnElement) {
    const data = DB_PREGUNTAS[preguntaActual];
    
    if (indiceSeleccionado === data.correcta) {
        // --- CORRECTO (FIESTA VISUAL) ---
        
        // 1. Agregamos la clase que lo pone VERDE
        btnElement.classList.add('correct');
        
        // 2. Cambiamos el texto para mostrar un check
        btnElement.innerText = "[ ✔ ] " + data.opciones[indiceSeleccionado];
        
        // 3. Esperamos 1 segundo (1000ms) para que disfrute su victoria antes de cambiar
        setTimeout(() => {
            mostrarEvidencia(data);
        }, 1000);
        
    } else {
        // --- INCORRECTO (ERROR) ---
        
        // Efecto de temblor y color rojo momentáneo
        btnElement.style.borderColor = "#FF3300";
        btnElement.style.color = "#FF3300";
        btnElement.classList.add('shake-anim'); // (Si tienes la animación definida)
        
        // Reset visual rápido (para que pueda intentar de nuevo)
        setTimeout(() => {
            btnElement.style.borderColor = "#ddd"; // O el color original del borde
            btnElement.style.color = "#555";
            // Si quieres que vuelva al estilo base, podrías limpiar el style inline:
            btnElement.style = ""; 
        }, 1000);
    }
}

// --- 7. LÓGICA DE EVIDENCIA ---
function mostrarEvidencia(data) {
    securityScreen.style.display = 'none';
    evidenceScreen.style.display = 'block';
    
    // Inyectamos el HTML limpio
    evidenceScreen.innerHTML = `
        <div class="evidence-card">
            <div class="tape-fix"></div>
            <div class="evidence-img-container">
                <img src="${data.evidenceImg}" alt="Evidencia">
            </div>
            <div class="verified-stamp">VERIFICADO</div>
            
            <div class="evidence-text">
                <h4>${data.evidenceTitle}</h4>
                <p>${data.evidenceText}</p>
            </div>
            <button class="btn-next-evidence" onclick="siguientePaso()">SIGUIENTE ARCHIVO →</button>
        </div>
    `;
}

function siguientePaso() {
    preguntaActual++;
    if (preguntaActual < DB_PREGUNTAS.length) {
        evidenceScreen.style.display = 'none';
        securityScreen.style.display = 'block';
        renderizarPregunta();
    } else {
        // FIN TRIVIA -> MOOD
        evidenceScreen.style.display = 'none';
        moodScreen.style.display = 'flex'; // Flex para centrar
    }
}

// --- 8. LÓGICA DEL CARRUSEL ---
function iniciarCarrusel() {
    const moodScreen = document.getElementById('moodScreen');
    const couponsScreen = document.getElementById('couponsScreen');

    // Si venimos del flujo normal (Pantalla de Mood)
    if (moodScreen && moodScreen.style.display !== 'none') {
        moodScreen.style.transition = "opacity 0.5s ease";
        moodScreen.style.opacity = "0";

        setTimeout(() => {
            moodScreen.style.display = 'none';
            mostrarPantallaCupones(couponsScreen);
        }, 500);
    } else {
        // Si venimos directo del parche temporal del asterisco
        mostrarPantallaCupones(couponsScreen);
    }
}

function mostrarPantallaCupones(couponsScreen) {
    if (!couponsScreen) return;
    
    // Encendemos la caja (ya no usamos opacity:0 aquí para evitar pestañeos)
    couponsScreen.style.display = 'block';
    renderizarCupones();
    
    // Esperamos 50ms para que el navegador procese el bloque antes de animar
    setTimeout(() => {
        setupCpCarousel();
        
        // Disparamos la entrada estilo "Selected Works"
        const animElements = document.querySelectorAll('.coupon-label-anim, .coupon-title-anim, .coupon-controls-anim, .coupon-track-anim');
        animElements.forEach(el => el.classList.add('visible'));
    }, 50);
}

function renderizarCupones() {
    const track = document.getElementById('cpCarouselTrack');
    if (!track) return;
    
    track.innerHTML = ''; 

    DB_CUPONES.forEach((ticket) => {
        // Estructura semántica, limpia y con clases 100% independientes
        const html = `
            <div class="coupon-wrapper">
                <div class="coupon-card" onclick="canjearCupón('${ticket.msg}')">
                    <div class="coupon-image">
                        <img src="${ticket.img}" alt="${ticket.title}">
                    </div>
                    <div class="coupon-content">
                        <span class="coupon-category">CUPÓN Nº ${ticket.id}</span>
                        <h3 class="coupon-title">${ticket.title}</h3>
                        <p class="coupon-desc">${ticket.desc}</p>
                        
                        <button class="coupon-btn">CANJEAR RECURSO</button>
                    </div>
                </div>
            </div>
        `;
        track.insertAdjacentHTML('beforeend', html);
    });
}

function setupCpCarousel() {
    const cpTrack = document.getElementById('cpCarouselTrack');
    const cpPrev = document.getElementById('cpPrevBtn');
    const cpNext = document.getElementById('cpNextBtn');

    if (cpTrack && cpPrev && cpNext) {
        // Triplicamos las tarjetas: [clon] [original] [clon]
        const originalCards = Array.from(cpTrack.children);
        const total = originalCards.length;

        // Clonar antes
        const clonesBefore = originalCards.map(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            return clone;
        });
        clonesBefore.reverse().forEach(clone => cpTrack.prepend(clone));

        // Clonar después
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            cpTrack.appendChild(clone);
        });

        let currentIndex = total;
        let isAnimating = false;

        const getCardWidth = () => {
            const card = cpTrack.querySelector('.coupon-wrapper');
            // Ancho + 24px del gap
            return card ? card.offsetWidth + 24 : 0;
        };

        const MAX_ANIMATIONS = 2;

        const animateCards = () => {
            const wrapperRect = cpTrack.parentElement.getBoundingClientRect();
            const cards = cpTrack.querySelectorAll('.coupon-wrapper');
            let delay = 0;
            cards.forEach((card) => {
                const cardRect = card.getBoundingClientRect();
                const isVisible = cardRect.left < wrapperRect.right - 50 && cardRect.right > wrapperRect.left + 50;
                const timesShown = parseInt(card.dataset.shown || '0');

                if (!isVisible) {
                    if (timesShown < MAX_ANIMATIONS) {
                        card.classList.remove('visible');
                    }
                } else if (!card.classList.contains('visible')) {
                    card.dataset.shown = timesShown + 1;
                    setTimeout(() => card.classList.add('visible'), delay);
                    delay += 80;
                }
            });
        };

        const goTo = (index, animated = true) => {
            cpTrack.style.transition = animated
                ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
                : 'none';
            cpTrack.style.transform = `translateX(-${index * getCardWidth()}px)`;
            currentIndex = index;
        };

        // Posición inicial
        goTo(currentIndex, false);
        setTimeout(animateCards, 100);

        // Controles de flecha
        cpNext.addEventListener('click', () => {
            if (isAnimating) return;
            isAnimating = true;
            goTo(currentIndex + 1);

            setTimeout(() => {
                if (currentIndex >= total * 2) {
                    goTo(currentIndex - total, false);
                }
                animateCards();
                isAnimating = false;
            }, 520);
        });

        cpPrev.addEventListener('click', () => {
            if (isAnimating) return;
            isAnimating = true;
            goTo(currentIndex - 1);

            setTimeout(() => {
                if (currentIndex < total) {
                    goTo(currentIndex + total, false);
                }
                animateCards();
                isAnimating = false;
            }, 520);
        });

        // Scroll horizontal con trackpad
        cpTrack.parentElement.addEventListener('wheel', (e) => {
            const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
            if (!isHorizontal) return;
            e.preventDefault();
            // Reducimos la sensibilidad un poco (de 15 a 20) para evitar saltos locos al deslizar rápido
            if (e.deltaX > 20) cpNext.click();
            if (e.deltaX < -20) cpPrev.click();
        }, { passive: false });

        /* --- Swipe táctil con el dedo (móvil) ---
           Registramos la posición X inicial al tocar,
           comparamos con la posición al levantar el dedo,
           y si el delta supera el umbral de 50px, avanzamos o retrocedemos. */
        let touchStartX = 0;
        let touchStartY = 0;
        let isSwiping = false;

        cpTrack.parentElement.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isSwiping = false;
        }, { passive: true });

        cpTrack.parentElement.addEventListener('touchmove', (e) => {
            if (!touchStartX) return;
            const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
            const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
            // Si el movimiento es más horizontal que vertical, bloqueamos el scroll vertical
            if (deltaX > deltaY && deltaX > 8) {
                isSwiping = true;
                e.preventDefault();
            }
        }, { passive: false });

        cpTrack.parentElement.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            // Umbral de 50px para considerar un swipe intencional
            if (deltaX < -50) cpNext.click();
            if (deltaX > 50) cpPrev.click();
            touchStartX = 0;
            isSwiping = false;
        }, { passive: true });
    }
}

function canjearCupón(mensaje) {
    const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}











/* =======================================================
   PARCHE TEMPORAL DEV MODE (BORRAR ANTES DE PUBLICAR)
   ======================================================= */
function parcheCupones() {
    const overlay = document.getElementById('kitOverlay');
    if(overlay) {
        overlay.classList.add('active'); 
        overlay.style.display = 'block'; 
    }

    // Apagamos todas las demás pantallas primero
    const pantallasOcultas = ['introScreen', 'securityScreen', 'evidenceScreen', 'moodScreen'];
    pantallasOcultas.forEach(id => {
        const pantalla = document.getElementById(id);
        if(pantalla) pantalla.style.display = 'none';
    });

    if(typeof iniciarCarrusel === 'function') {
        iniciarCarrusel(); 
    }
}






















/* =========================================================
   🚧 SISTEMA CAFELITO TIME (VERSIÓN DEFINITIVA Y ORDENADA) 🚧
   ========================================================= */

// --- 1. SELECCIÓN DE ELEMENTOS DEL HTML ---
// Elementos de la carpeta
const overlayCarpeta = document.getElementById('cafelitoOverlay');
const btnAbrirKit = document.getElementById('btnKit'); // El botón original de tu web
const btnCerrarCarpeta = document.getElementById('cerrarCafelito'); // La X de la carpeta

// Elementos del Ticket Gigante (Pop-up)
const ticketEnCarpeta = document.querySelector('.folder-image-container');
const modalTicket = document.getElementById('ticketModal');
const btnCerrarTicket = document.getElementById('cerrarModalTicket'); // La X del ticket gigante


// --- 2. FUNCIONES PRINCIPALES ---
function abrirCarpeta() {
    if (overlayCarpeta) {
        overlayCarpeta.classList.add('active');
        // Técnica position:fixed: único método que bloquea el scroll en iOS Safari
        // Guardamos scrollY para restaurarlo exactamente al cerrar
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.dataset.scrollY = scrollY;
    }
}

function cerrarCarpeta() {
    if (overlayCarpeta) {
        overlayCarpeta.classList.remove('active');
        // Restauramos posición exacta sin salto visual
        const scrollY = parseInt(document.body.dataset.scrollY || '0');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
    }
}


// --- 3. EVENTOS (LOS "CABLES" QUE CONECTAN LOS CLICS) ---

// A. El Secuestro Físico: Abrir la carpeta desde el botón original
if (btnAbrirKit) {
    btnAbrirKit.removeAttribute('onclick'); // Matamos el evento viejo
    btnAbrirKit.addEventListener('click', function(e) {
        e.preventDefault();
        abrirCarpeta();
    });
}

// B. Cerrar la carpeta al hacer clic en su "X" (¡Esto es lo que te faltaba!)
if (btnCerrarCarpeta) {
    btnCerrarCarpeta.addEventListener('click', cerrarCarpeta);
}

// C. Abrir el Ticket gigante al hacer clic en la foto de la carpeta
if (ticketEnCarpeta && modalTicket) {
    ticketEnCarpeta.addEventListener('click', function(e) {
        const clickedTicket = e.target.closest('.cafelito-image');
        if (!clickedTicket) return;
        e.stopPropagation();

        const ticketNum = clickedTicket.dataset.ticket;
        const ticketImgEl = document.getElementById('ticketAmpliadoImg');
        const btnCarta = document.querySelector('.btn-ver-carta');

        if (ticketNum === '1') {
            ticketImgEl.src = 'img/ticket_cafelitotime_2.webp';
            ticketImgEl.style.maxWidth = '';
            ticketImgEl.style.maxHeight = '';
            if (btnCarta) btnCarta.classList.remove('visible');
        } else if (ticketNum === '2') {
            ticketImgEl.src = 'img/ticket_cafelitotime_7meses.png';
            ticketImgEl.style.maxWidth = '';
            ticketImgEl.style.maxHeight = '';
            if (btnCarta) btnCarta.classList.add('visible');
        } else if (ticketNum === '3') {
            ticketImgEl.src = 'img/ticket_cafelitotime_n3.png';
            ticketImgEl.style.maxWidth = '30vw';
            ticketImgEl.style.maxHeight = '80vh';
            if (btnCarta) btnCarta.classList.remove('visible');
        }

        modalTicket.classList.add('active');
    });
}

// D. Cerrar el Ticket gigante al hacer clic en su "X"
if (btnCerrarTicket && modalTicket) {
    btnCerrarTicket.addEventListener('click', function() {
        modalTicket.classList.remove('active');
        const btnCarta = document.querySelector('.btn-ver-carta');
        const ticketImgEl = document.getElementById('ticketAmpliadoImg');
        if (btnCarta) btnCarta.classList.remove('visible');
        if (ticketImgEl) { ticketImgEl.style.maxWidth = ''; ticketImgEl.style.maxHeight = ''; }
    });
}

// E. (Extra pro) Cerrar el Ticket gigante haciendo clic en el fondo oscuro exterior
if (modalTicket) {
    modalTicket.addEventListener('click', function(e) {
        if (e.target === modalTicket) {
            modalTicket.classList.remove('active');
            const btnCarta = document.querySelector('.btn-ver-carta');
            const ticketImgEl = document.getElementById('ticketAmpliadoImg');
            if (btnCarta) btnCarta.classList.remove('visible');
            if (ticketImgEl) { ticketImgEl.style.maxWidth = ''; ticketImgEl.style.maxHeight = ''; }
        }
    });
}











/* =======================================================
   TAP IN PAGE — JavaScript exclusivo de proyecto-tapin.html
   Todo el código vive en un IIFE para no contaminar el
   scope global del resto del sitio.
   El primer if() aborta si no estamos en esta página.
   ======================================================= */
(function () {

    /* --- 0. GUARD: solo correr en la página Tap In ---
       Si el canvas de grain no existe, no estamos aquí. */
    var grainCanvas = document.getElementById('tp-grain');
    if (!grainCanvas) return;


    /* =======================================================
       1. GRAIN CANVAS — desactivado
       La textura de noise ahora se aplica vía CSS (background-image
       SVG feTurbulence en #tp-grain). El canvas ya no necesita JS.
       ======================================================= */
    /* Sin código de dibujo — el elemento existe en el DOM
       pero queda vacío y transparente. */


    /* =======================================================
       2. SCROLL REVEAL — IntersectionObserver propio
       Observa .tp-fade, .tp-slide-left y .tp-slide-right.
       Cuando el 8% de un elemento es visible, agrega .tp-vis
       que dispara la transición CSS de entrada (opacity + transform,
       sin blur para no generar lag).
       Una vez visible, deja de observarlo (unobserve).
       ======================================================= */
    var tpRevealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('tp-vis');
                tpRevealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.tp-fade, .tp-slide-left, .tp-slide-right').forEach(function (el) {
        tpRevealObs.observe(el);
    });


    /* =======================================================
       3. CAROUSEL INFINITO — respeto al prefers-reduced-motion
       El carousel CSS puro funciona solo.
       Este bloque solo pausa la animación si el usuario
       prefiere menos movimiento (accesibilidad).
       ======================================================= */
    var infTrack = document.getElementById('tp-inf-track');
    if (infTrack) {
        /* Si el sistema tiene "reduce motion" activado,
           detenemos la animación infinita */
        var mediaMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaMotion.matches) {
            infTrack.style.animationPlayState = 'paused';
        }
    }


    /* =======================================================
       4. BENTO GRID — tilt 3D al mover el mouse
       En cada bento-item, calcula la posición relativa
       del cursor dentro del card y aplica una pequeña
       rotación en perspectiva.
       Al salir el mouse, vuelve suavemente a 0.
       ======================================================= */
    document.querySelectorAll('.tp-bento-item').forEach(function (card) {

        /* Tilt mientras se mueve el mouse */
        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            /* Posición normalizada de -0.5 a 0.5 */
            var x = (e.clientX - rect.left)  / rect.width  - 0.5;
            var y = (e.clientY - rect.top)   / rect.height - 0.5;
            card.style.transition = 'transform 0.1s ease';
            card.style.transform  =
                'perspective(900px) rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 7) + 'deg)';
        });

        /* Reset suave al salir el mouse */
        card.addEventListener('mouseleave', function () {
            card.style.transition = 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)';
            card.style.transform  = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
        });
    });


    /* =======================================================
       5. MARQUEE — corre siempre sin pausas
       Pausa hover eliminada por petición (cambio 7).
       El marquee y el carousel corren continuamente.
       ======================================================= */
    /* No se agrega ningún listener de pausa */


    /* =======================================================
       6. BLOQUEO DE SCROLL EN LÍMITES — solo táctil (iOS)
       overscroll-behavior: none funciona en Android/Chrome pero
       iOS Safari lo ignora. Este listener bloquea touchmove
       cuando el scroll ya está en el tope (0) o en el fondo
       (scrollHeight - innerHeight), evitando que aparezca el
       fondo del html por debajo del footer o encima del hero.
       ======================================================= */
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {

        var lastTouchY = 0;

        document.addEventListener('touchstart', function(e) {
            lastTouchY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchmove', function(e) {
            var touchY    = e.touches[0].clientY;
            var direction = touchY - lastTouchY; /* + = hacia arriba (scroll down) */
            lastTouchY    = touchY;

            var atTop    = window.scrollY <= 0;
            var atBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 1;

            /* Bloquear: intenta bajar más cuando está al fondo,
               o subir más cuando está al tope */
            if ((atBottom && direction < 0) || (atTop && direction > 0)) {
                e.preventDefault();
            }
        }, { passive: false }); /* passive:false es obligatorio para poder llamar preventDefault */

    }


    /* =======================================================
       7. GALERÍA KINÉTICA — Drag con inercia
       currentX: posición actual del track.
       targetX:  destino al que el RAF anima suavemente.
       En mousedown/touchstart se congela targetX = currentX
       para que arranque desde donde está sin salto.
       ======================================================= */
    var kgTrack = document.getElementById('tp-kgallery-track');
    if (kgTrack) {

        var kgWrapper = kgTrack.closest('.tp-kgallery');
        var kgCurrentX = 0, kgTargetX = 0;
        var kgIsDown   = false;
        var kgStartX   = 0, kgStartOff = 0;
        var kgRafId    = null;
        var KG_LERP    = 0.13;  /* suavidad de inercia */
        var KG_MULT    = 1.4;   /* multiplicador velocidad drag */

        function kgGetMax() {
            return -(kgTrack.scrollWidth - kgWrapper.offsetWidth);
        }
        function kgClamp(v) {
            return Math.max(kgGetMax(), Math.min(0, v));
        }

        /* Bucle RAF: interpola kgCurrentX → kgTargetX */
        function kgRafLoop() {
            kgCurrentX += (kgTargetX - kgCurrentX) * KG_LERP;
            kgTrack.style.transform = 'translateX(' + kgCurrentX + 'px)';
            if (Math.abs(kgTargetX - kgCurrentX) > 0.1) {
                kgRafId = requestAnimationFrame(kgRafLoop);
            } else {
                kgCurrentX = kgTargetX;
                kgTrack.style.transform = 'translateX(' + kgCurrentX + 'px)';
                kgRafId = null;
            }
        }
        function kgStartRaf() {
            if (!kgRafId) kgRafId = requestAnimationFrame(kgRafLoop);
        }

        /* --- Mouse events --- */
        kgWrapper.addEventListener('mousedown', function(e) {
            kgIsDown   = true;
            kgStartX   = e.pageX;
            kgStartOff = kgTargetX;
            kgWrapper.classList.add('grabbing');
            cancelAnimationFrame(kgRafId);
            kgRafId    = null;
            kgCurrentX = kgTargetX;
        });
        document.addEventListener('mouseup', function() {
            if (!kgIsDown) return;
            kgIsDown = false;
            kgWrapper.classList.remove('grabbing');
            kgStartRaf();
        });
        kgWrapper.addEventListener('mouseleave', function() {
            if (kgIsDown) {
                kgIsDown = false;
                kgWrapper.classList.remove('grabbing');
                kgStartRaf();
            }
        });
        kgWrapper.addEventListener('mousemove', function(e) {
            if (!kgIsDown) return;
            e.preventDefault();
            var walk = (e.pageX - kgStartX) * KG_MULT;
            kgTargetX  = kgClamp(kgStartOff + walk);
            kgCurrentX = kgTargetX;
            kgTrack.style.transform = 'translateX(' + kgCurrentX + 'px)';
        });

        /* --- Touch events ---
           En táctil (móvil) el scroll es nativo (CSS scroll-snap).
           El JS de drag solo corre en desktop. */
        if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
            var kgTouchStart = 0, kgTouchOff = 0;
            kgWrapper.addEventListener('touchstart', function(e) {
                kgTouchStart = e.touches[0].pageX;
                kgTouchOff   = kgTargetX;
                cancelAnimationFrame(kgRafId);
                kgRafId      = null;
                kgCurrentX   = kgTargetX;
            }, { passive: true });
            kgWrapper.addEventListener('touchmove', function(e) {
                var walk = (e.touches[0].pageX - kgTouchStart) * KG_MULT;
                kgTargetX  = kgClamp(kgTouchOff + walk);
                kgCurrentX = kgTargetX;
                kgTrack.style.transform = 'translateX(' + kgCurrentX + 'px)';
            }, { passive: true });
            kgWrapper.addEventListener('touchend', function() {
                kgStartRaf();
            }, { passive: true });
        }

    } /* fin kgTrack */


})();
/* =======================================================
   FIN TAP IN PAGE JS
   ======================================================= */










/* =======================================================
   LA COLUMNA PAGE JS
   Solo se ejecuta si el body tiene la clase lc-page
   ======================================================= */
(function () {

    if (!document.body.classList.contains('lc-page')) return;


    /* =======================================================
       1. GRAIN — textura papel arrugado con Canvas
       Ruido aleatorio + fibras horizontales que simulan
       las fibras del papel. mix-blend-mode: screen en CSS
       hace que el grano sea visible sobre el fondo oscuro.
       ======================================================= */
    var canvas = document.getElementById('lc-grain');
    if (canvas) {
        var ctx = canvas.getContext('2d');

        function lcResizeGrain() {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
            lcDrawGrain();
        }

        function lcDrawGrain() {
            var w = canvas.width, h = canvas.height;
            var img = ctx.createImageData(w, h);
            var d   = img.data;
            for (var i = 0; i < d.length; i += 4) {
                var n = Math.random();
                var y = Math.floor(i / 4 / w);
                /* Fibras horizontales: aparecen cuando sin(y) supera umbral */
                var fiber = (Math.sin(y * 0.9 + Math.random() * 0.4) > 0.90) ? 0.20 : 0;
                var v = Math.floor((n + fiber) * 255);
                d[i]     = d[i + 1] = d[i + 2] = v;
                /* Alpha más alto = grano más visible */
                d[i + 3] = Math.floor(n * 55 + fiber * 70);
            }
            ctx.putImageData(img, 0, 0);
        }

        window.addEventListener('resize', lcResizeGrain);
        lcResizeGrain();
    }


    /* =======================================================
       2. SCROLL ANIMATIONS — lc-fade → lc-visible + lc-anim → lc-anim-in
       Un solo observer maneja:
       a) La transición de opacidad/translateY del contenedor (.lc-fade)
       b) Las animaciones escalonadas de hijos (.lc-anim) con sus delays CSS
       ======================================================= */
    var lcObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                /* Activa el contenedor */
                e.target.classList.add('lc-visible');
                /* Activa los hijos con animación escalonada (delays en CSS) */
                e.target.querySelectorAll('.lc-anim').forEach(function (child) {
                    child.classList.add('lc-anim-in');
                });
                lcObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.lc-fade').forEach(function (el) {
        lcObs.observe(el);
    });


    /* =======================================================
       3. CARRUSELES — avance de a 1 slide, 3 visibles
       Cada carrusel se maneja de forma independiente por ID.
       El selector de slides acepta tanto .slide-clean como .lc2-slide.
       ======================================================= */
    function lcInitCarousel(trackId, prevBtnId, nextBtnId) {
        var track   = document.getElementById(trackId);
        var btnPrev = document.getElementById(prevBtnId);
        var btnNext = document.getElementById(nextBtnId);
        if (!track || !btnPrev || !btnNext) return;

        /* Soporta ambos tipos de slide dentro del mismo carrusel */
        var slides = track.querySelectorAll('.slide-clean, .lc2-slide');
        var totalSlides = slides.length;
        if (totalSlides === 0) return;

        var current = 0;

        /* Cuántos slides son visibles a la vez (3 desktop, 1 móvil) */
        function getVisible() {
            return window.innerWidth <= 768 ? 1 : 3;
        }

        function getSlideWidth() {
            /* Ancho de un slide + gap (12px) */
            if (slides[0]) {
                return slides[0].offsetWidth + 12;
            }
            return 0;
        }

        function goTo(index) {
            var visible  = getVisible();
            var maxIndex = Math.max(0, totalSlides - visible);
            current = Math.max(0, Math.min(index, maxIndex));
            track.scrollTo({ left: current * getSlideWidth(), behavior: 'smooth' });
        }

        btnPrev.addEventListener('click', function () { goTo(current - 1); });
        btnNext.addEventListener('click', function () { goTo(current + 1); });

        /* Resetear posición si cambia el tamaño de ventana */
        window.addEventListener('resize', function () { goTo(current); });
    }

    /* Carrusel 1: Galería de Piezas */
    lcInitCarousel('trackClean', 'btnPrevClean', 'btnNextClean');

    /* Carrusel 2: Galería Final */
    lcInitCarousel('trackLC2', 'lc2BtnPrev', 'lc2BtnNext');


    /* =======================================================
       4. CARRUSELES TRANSFORM — reemplaza el sistema scrollTo()
       Mueve el track con translateX en lugar de scrollLeft.
       Sin scroll nativo: el track tiene overflow:visible y
       touch-action:pan-y (definido en style.css).
       Activa los slides en bloque (un solo observer por carrusel)
       para evitar reflows múltiples en la primera carga.
       ======================================================= */

    /* --- 4a. Sistema de navegación por transform --- */
    function lcInitTransformCarousel(trackId, prevId, nextId) {
        var track   = document.getElementById(trackId);
        var btnPrev = document.getElementById(prevId);
        var btnNext = document.getElementById(nextId);
        if (!track || !btnPrev || !btnNext) return;

        var slides = track.querySelectorAll('.slide-clean, .lc2-slide');
        var total  = slides.length;
        if (total === 0) return;

        var current = 0;

        function getVisible() {
            return window.innerWidth <= 768 ? 1 : 3;
        }

        function getSlideW() {
            /* Ancho de slide + gap (12px definido en CSS) */
            return slides[0] ? slides[0].offsetWidth + 12 : 0;
        }

        function goTo(index) {
            var visible = getVisible();
            var max     = Math.max(0, total - visible);
            current     = Math.max(0, Math.min(index, max));
            track.style.transform = 'translateX(' + (-(current * getSlideW())) + 'px)';
            /* En móvil: is-active solo en el slide central — el resto atenuado */
            if (window.innerWidth <= 768) {
                slides.forEach(function(slide, i) {
                    slide.classList.toggle('is-active', i === current);
                });
            }
        }

        /* Clonar botones para eliminar los listeners previos de lcInitCarousel */
        var newPrev = btnPrev.cloneNode(true);
        var newNext = btnNext.cloneNode(true);
        btnPrev.parentNode.replaceChild(newPrev, btnPrev);
        btnNext.parentNode.replaceChild(newNext, btnNext);

        newPrev.addEventListener('click', function() { goTo(current - 1); });
        newNext.addEventListener('click', function() { goTo(current + 1); });

        window.addEventListener('resize', function() { goTo(current); });

        /* --- Trackpad: wheel horizontal (deltaX) --- */
        /* wheelAccum acumula el delta para no disparar en cada micro-movimiento.
           wheelLocked bloquea nuevas transiciones durante el cooldown para
           garantizar avance de exactamente una foto por gesto, sin importar
           cuánto delta acumule un trackpad con inercia fuerte. */
        var wheelAccum  = 0;
        var wheelTimer  = null;
        var wheelLocked = false;
        var wrap = track.closest('.lc-carousel-wrap');
        if (wrap) {
            wrap.addEventListener('wheel', function(e) {
                var absX = Math.abs(e.deltaX);
                var absY = Math.abs(e.deltaY);
                /* Solo interceptar si el gesto es predominantemente horizontal */
                if (absX < absY * 0.7) return;
                e.preventDefault();
                if (wheelLocked) return;           /* cooldown activo → ignorar */
                wheelAccum += e.deltaX;
                clearTimeout(wheelTimer);
                wheelTimer = setTimeout(function() { wheelAccum = 0; }, 300);
                if (wheelAccum >  60) {
                    wheelAccum  = 0;
                    wheelLocked = true;
                    goTo(current + 1);
                    setTimeout(function() { wheelLocked = false; }, 420);
                } else if (wheelAccum < -60) {
                    wheelAccum  = 0;
                    wheelLocked = true;
                    goTo(current - 1);
                    setTimeout(function() { wheelLocked = false; }, 420);
                }
            }, { passive: false });
        }

        /* --- Touch swipe (dedos en móvil / trackpad táctil) --- */
        var dragStartX = 0;
        var isDragging = false;
        var dragTarget = wrap || track;

        dragTarget.addEventListener('pointerdown', function(e) {
            if (e.pointerType === 'mouse') return; /* mouse lo maneja wheel */
            isDragging  = true;
            dragStartX  = e.clientX;
            track.style.transition = 'none';
        });

        dragTarget.addEventListener('pointermove', function(e) {
            if (!isDragging) return;
            var dx = e.clientX - dragStartX;
            if (Math.abs(dx) > 8) e.preventDefault();
        }, { passive: false });

        dragTarget.addEventListener('pointerup', function(e) {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = '';
            var delta = e.clientX - dragStartX;
            if (delta < -40)      goTo(current + 1);
            else if (delta > 40)  goTo(current - 1);
            else                  goTo(current);
        });

        dragTarget.addEventListener('pointerleave', function() {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = '';
            goTo(current);
        });

        /* Posición inicial explícita */
        track.style.transform = 'translateX(0)';
    }

    /* --- 4b. Activar slides en bloque al entrar en viewport --- */
    /* Un solo IntersectionObserver por carrusel (no uno por slide)
       para evitar múltiples callbacks y reflows en primera carga. */
    function lcActivateSlidesOnEntry(trackId) {
        var track = document.getElementById(trackId);
        if (!track) return;
        var slides = track.querySelectorAll('.slide-clean, .lc2-slide');
        if (slides.length === 0) return;

        var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    if (window.innerWidth <= 768) {
                        /* Móvil: activar solo el primer slide (index 0) */
                        slides[0].classList.add('is-active');
                    } else {
                        /* PC: activar todos con aparición escalonada */
                        slides.forEach(function(slide, i) {
                            setTimeout(function() {
                                slide.classList.add('is-active');
                            }, i * 60);
                        });
                    }
                    obs.disconnect();
                }
            });
        }, { threshold: 0.1 });

        obs.observe(track);
    }

    lcInitTransformCarousel('trackClean', 'btnPrevClean', 'btnNextClean');
    lcInitTransformCarousel('trackLC2',   'lc2BtnPrev',  'lc2BtnNext');

    lcActivateSlidesOnEntry('trackClean');
    lcActivateSlidesOnEntry('trackLC2');


})();
/* =======================================================
   FIN LA COLUMNA PAGE JS
   ======================================================= */