// ── Constante del nav ─────────────────────────────────────
const NAV_H = 72;

// ── Spotlight cursor ──────────────────────────────────────
const spotlight = document.querySelector('.spotlight');
document.addEventListener('mousemove', (e) => {
    spotlight.style.setProperty('--mx', `${e.clientX}px`);
    spotlight.style.setProperty('--my', `${e.clientY}px`);
}, { passive: true });

// ── Typewriter hero subtitle ──────────────────────────────
const heroSub = document.querySelector('.hero-sub[data-typewriter]');
if (heroSub) {
    const fullText = heroSub.dataset.typewriter;
    heroSub.textContent = '';
    heroSub.classList.add('is-typing');
    let i = 0;
    const type = () => {
        if (i < fullText.length) {
            heroSub.textContent += fullText[i++];
            setTimeout(type, i < 15 ? 40 : 24);
        } else {
            heroSub.classList.remove('is-typing');
        }
    };
    setTimeout(type, 1100);
}

// ── Scroll animations (IntersectionObserver) ─────────────
const animObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                if (!entry.target.classList.contains('skill-card')) {
                    animObserver.unobserve(entry.target);
                }
            }
        });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.animate, .animate-left, .animate-scale, .skill-card').forEach((el) => {
    animObserver.observe(el);
});

// ── Barra de progreso ─────────────────────────────────────
const progressBar = document.querySelector('.scroll-progress');

const updateProgress = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : '0%';
};

// ── Nav: scrolled class ───────────────────────────────────
const nav = document.querySelector('nav');

const updateNav = () => nav.classList.toggle('scrolled', window.scrollY > 20);

// ── Scroll to top ─────────────────────────────────────────
const scrollTopBtn = document.querySelector('.scroll-top');

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Nav: link activo según sección visible ────────────────
const sections   = Array.from(document.querySelectorAll('section[id]'));
const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));

const updateActiveLink = () => {
    // Punto de referencia: borde inferior del nav + buffer
    const refY = window.scrollY + NAV_H + 80;

    // Si llegamos al fondo, activar la última sección que tiene link en el nav
    const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 60;

    let currentId = '';

    if (atBottom) {
        for (let i = sections.length - 1; i >= 0; i--) {
            const id = sections[i].id;
            if (navAnchors.some((a) => a.getAttribute('href') === `#${id}`)) {
                currentId = id;
                break;
            }
        }
    } else {
        sections.forEach((section) => {
            // offsetTop no se ve afectado por transforms CSS (a diferencia de getBoundingClientRect)
            if (section.offsetTop <= refY) currentId = section.id;
        });
    }

    navAnchors.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
};

// ── Listener de scroll ────────────────────────────────────
window.addEventListener('scroll', () => {
    updateNav();
    updateProgress();
    updateActiveLink();
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

// Estado inicial
updateNav();
updateProgress();
updateActiveLink();

// ── Mobile menu (panel derecho) ───────────────────────────
const toggle      = document.querySelector('.nav-toggle');
const mobileMenu  = document.querySelector('.mobile-menu');
const overlay     = document.querySelector('.menu-overlay');
const menuClose   = document.querySelector('.menu-close');
const body        = document.body;

const openMenu = () => {
    toggle.classList.add('is-open');
    mobileMenu.classList.add('is-open');
    overlay.classList.add('is-open');
    body.style.overflow = 'hidden';
};

const closeMenu = () => {
    toggle.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    overlay.classList.remove('is-open');
    body.style.overflow = '';
};

toggle.addEventListener('click', () => {
    mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
});

menuClose.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

document.querySelectorAll('.mobile-menu-links a').forEach((link) => {
    link.addEventListener('click', closeMenu);
});

// ── Smooth scroll ─────────────────────────────────────────
// Usamos section.getBoundingClientRect() (sin transforms) + paddingTop calculado
// para no verse afectados por el transform: translateY(32px) del .animate
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
        const section = document.querySelector(anchor.getAttribute('href'));
        if (!section) return;
        e.preventDefault();

        const sectionAbsTop  = section.getBoundingClientRect().top + window.scrollY;
        const sectionPadding = parseFloat(getComputedStyle(section).paddingTop) || 0;

        // Centra visualmente: posiciona el contenido al 38% del viewport
        // pero nunca menos de nav + 40px para no quedar tapado por el nav
        const desiredOffset = Math.max(NAV_H + 40, window.innerHeight * 0.38);
        const top = sectionAbsTop + sectionPadding - desiredOffset;

        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
});
