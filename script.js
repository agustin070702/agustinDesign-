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









/* =========================================
   LÓGICA MISIÓN 14 FEBRERO (FINAL)
   ========================================= */

// 1. ABRIR EL OVERLAY (Al hacer click en "jotita")
const btnJotita = document.getElementById('btnJotita');
const overlayMision = document.getElementById('misionOverlay');

if (btnJotita && overlayMision) {
    btnJotita.addEventListener('click', function() {
        overlayMision.style.display = 'flex';
        // Pequeño delay para permitir la transición de opacidad
        setTimeout(() => {
            overlayMision.classList.add('open');
        }, 10);
    });
}

// 2. SELECCIONAR FOTOS (CAPTCHA)
function toggleFoto(elemento) {
    elemento.classList.toggle('selected');
}

// 3. VERIFICAR SI GANÓ
function verificarCaptcha() {
    const todasLasFotos = document.querySelectorAll('.captcha-item');
    let error = false;

    // A) Validar selección
    todasLasFotos.forEach(foto => {
        const esCorrecta = foto.getAttribute('data-correcta') === 'true';
        const estaSeleccionada = foto.classList.contains('selected');

        // Error si: Correcta NO seleccionada O Incorrecta SÍ seleccionada
        if ((esCorrecta && !estaSeleccionada) || (!esCorrecta && estaSeleccionada)) {
            error = true;
        }
    });

    // B) Si hay error
    if (error) {
        const msg = document.getElementById('mensajeError');
        if(msg) msg.style.display = 'block';
        
        // Animación de "temblor" en la tarjeta
        const card = document.querySelector('.mision-card');
        card.style.transform = 'translateX(10px)';
        setTimeout(() => card.style.transform = 'translateX(-10px)', 100);
        setTimeout(() => card.style.transform = 'translateX(0)', 200);
    } 
    // C) SI ESTÁ CORRECTO (Paso a la siguiente fase)
    else {
        // Ocultamos Fase 1 INMEDIATAMENTE (Método Nuclear)
        document.getElementById('faseCaptcha').style.display = 'none';

        // Mostramos Fase 2
        const fase2 = document.getElementById('fasePregunta');
        fase2.style.display = 'block';
        
        // Agregamos la animación que definimos en el CSS
        fase2.classList.add('animacion-entrada');
    }
}

// 4. EL BOTÓN "NO" QUE SE ESCAPA
function esquivarBoton() {
    const btnNo = document.getElementById('btnNo');
    
    // 1. TRUCO DE MAGIA: Si el botón sigue dentro de la tarjeta, lo sacamos.
    // Al moverlo al <body>, deja de estar limitado por el pop-up.
    if (btnNo.parentNode !== document.body) {
        document.body.appendChild(btnNo);
    }

    // 2. Lo configuramos para que flote libremente
    btnNo.style.position = 'fixed';
    btnNo.style.zIndex = '100000'; // ¡Por encima de todo! (incluso del overlay negro)
    
    // 3. Calculamos posición aleatoria (Toda la pantalla)
    // Restamos el ancho del botón (aprox 100px) para que no se salga por la derecha
    const x = Math.random() * (window.innerWidth - 120);
    const y = Math.random() * (window.innerHeight - 60);
    
    btnNo.style.left = x + 'px';
    btnNo.style.top = y + 'px';
}

// 5. ACEPTAR PROPUESTA (Mostrar Carta)
// (Nota: En el HTML le pusimos onclick="aceptarPropuesta()")
function aceptarPropuesta() {
    // 1. Ocultamos la pregunta y el botón NO
    document.getElementById('fasePregunta').style.display = 'none';
    const btnNo = document.getElementById('btnNo');
    if (btnNo) btnNo.style.display = 'none';

    // 2. BUSCAMOS LA TARJETA Y LE DAMOS EL NUEVO ANCHO
    const tarjeta = document.querySelector('.mision-card');
    tarjeta.classList.add('modo-carta');

    // 3. Mostramos la carta
    const fase3 = document.getElementById('faseCarta');
    fase3.style.display = 'block';
    fase3.classList.add('animacion-entrada');
}

// 6. CERRAR TODO Y RESETEAR
function cerrarMision() {
    const overlay = document.getElementById('misionOverlay');
    overlay.classList.remove('open');
    
    setTimeout(() => {
        overlay.style.display = 'none';
        
        // --- RESETEO DE ANCHO ---
        const tarjeta = document.querySelector('.mision-card');
        tarjeta.classList.remove('modo-carta'); // Vuelve a los 450px originales

        // ... el resto de tu código de reseteo que ya tienes ...
        document.getElementById('fasePregunta').style.display = 'none';
        document.getElementById('faseCarta').style.display = 'none';
        document.getElementById('faseCaptcha').style.display = 'block';
        
        // (Asegúrate de mantener aquí la lógica de devolver el botón NO que ya pusimos)
    }, 400);
}