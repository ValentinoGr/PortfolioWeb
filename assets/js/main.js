// ── Constante del nav ─────────────────────────────────────
const NAV_H = 72;

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

// ── Hamburger menu ────────────────────────────────────────
const toggle   = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const body     = document.body;

toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('is-open');
    navLinks.classList.toggle('is-open', isOpen);
    body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
        toggle.classList.remove('is-open');
        navLinks.classList.remove('is-open');
        body.style.overflow = '';
    });
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
