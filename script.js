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

// Smooth scroll con offset para las anclas
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        
        if (target) {
    const targetRect = target.getBoundingClientRect();
    const targetHeight = targetRect.height;
    const windowHeight = window.innerHeight;
    const offsetTop = target.offsetTop - (windowHeight / 2) + (targetHeight / 2);
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
    }
}

function cerrarCarpeta() {
    if (overlayCarpeta) {
        overlayCarpeta.classList.remove('active');
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
        e.stopPropagation(); // Evita que el clic traspase hacia atrás
        modalTicket.classList.add('active');
    });
}

// D. Cerrar el Ticket gigante al hacer clic en su "X"
if (btnCerrarTicket && modalTicket) {
    btnCerrarTicket.addEventListener('click', function() {
        modalTicket.classList.remove('active');
    });
}

// E. (Extra pro) Cerrar el Ticket gigante haciendo clic en el fondo oscuro exterior
if (modalTicket) {
    modalTicket.addEventListener('click', function(e) {
        if (e.target === modalTicket) {
            modalTicket.classList.remove('active');
        }
    });
}