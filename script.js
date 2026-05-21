/* ============================================
   Feel Laban — Website JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ---- Full-Screen Menu Overlay ----
    const menuLinkDesktop = document.getElementById('menu-link-desktop');
    const mobileToggle = document.getElementById('mobile-toggle');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuOverlayClose = document.getElementById('menu-overlay-close');
    const menuNavLinks = document.querySelectorAll('[data-menu-close]');
    let menuCardsObserved = false;

    function openMenu() {
        if (menuOverlay) {
            menuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Lazy-init menu card reveal + touch feedback once the overlay is shown
            if (!menuCardsObserved) {
                initMenuCardEffects();
                menuCardsObserved = true;
            }
        }
    }

    function closeMenu() {
        if (menuOverlay) {
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (menuLinkDesktop) {
        menuLinkDesktop.addEventListener('click', (e) => {
            e.preventDefault();
            openMenu();
        });
    }

    const heroMenuBtn = document.getElementById('hero-menu-btn');
    if (heroMenuBtn) {
        heroMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openMenu();
        });
    }

    const footerMenuLink = document.getElementById('footer-menu-link');
    if (footerMenuLink) {
        footerMenuLink.addEventListener('click', (e) => {
            e.preventDefault();
            openMenu();
        });
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            openMenu();
        });
    }

    if (menuOverlayClose) {
        menuOverlayClose.addEventListener('click', closeMenu);
    }

    menuNavLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Open menu when clicking any homepage food card
    document.querySelectorAll('[data-open-menu]').forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault?.();
            openMenu();
        });

        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openMenu();
            }
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuOverlay?.classList.contains('active')) {
            closeMenu();
        }
    });

    // ---- Product Tabs ----
    const productTabs = document.querySelectorAll('.product-tab');

    productTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            productTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Carousel logic removed due to new grid layout.

    // ---- Explore Location Arrows ----
    const explorePrev = document.getElementById('explore-prev');
    const exploreNext = document.getElementById('explore-next');
    const locations = [
        {
            city: 'New Delhi',
            phone: '+91 7780521176',
            hours: 'Open 2:00 PM - 1:00 AM',
            address: 'https://maps.app.goo.gl/UKtrvr4XetQJqkXNA'
        }
    ];
    let currentLocation = 0;

    function updateLocation() {
        const loc = locations[currentLocation];
        const cityEl = document.querySelector('.store-city');
        const phoneEl = document.querySelector('.store-phone');
        const hoursEl = document.querySelector('.store-hours');
        const addressEl = document.querySelector('.store-address');

        if (cityEl) cityEl.textContent = loc.city;
        if (phoneEl) phoneEl.textContent = loc.phone;
        if (hoursEl) hoursEl.textContent = loc.hours;
        if (addressEl) addressEl.href = loc.address;
    }

    if (explorePrev) {
        explorePrev.addEventListener('click', () => {
            currentLocation = (currentLocation - 1 + locations.length) % locations.length;
            updateLocation();
        });
    }

    if (exploreNext) {
        exploreNext.addEventListener('click', () => {
            currentLocation = (currentLocation + 1) % locations.length;
            updateLocation();
        });
    }

    // ---- Smooth Scroll for Anchor Links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.navbar')?.offsetHeight || 70;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ---- Navbar Scroll Effect ----
    let lastScrollY = 0;
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (navbar) {
            if (currentScrollY > 100) {
                navbar.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        }

        lastScrollY = currentScrollY;
    });

    // ---- Intersection Observer for Premium Animations ----
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-actions, .hero-floating-image, .hero-image-blob, .product-card, .section-heading, .visit-content, .about-content, .franchise-content');

    revealElements.forEach((el, index) => {
        el.classList.add('reveal-init');
        revealObserver.observe(el);
    });

    // CSS for Premium Transitions
    const style = document.createElement('style');
    style.textContent = `
        .reveal-init {
            opacity: 0;
            transform: translateY(40px);
            transition: all 1.2s cubic-bezier(0.2, 1, 0.3, 1);
        }
        
        .reveal-init.is-revealed {
            opacity: 1;
            transform: translateY(0);
        }

        .hero-floating-image.reveal-init {
            transform: translateY(40px) scale(0.95);
            transition: all 1.4s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .hero-floating-image.is-revealed {
            transform: translateY(0) scale(1);
        }

        .hero-image-blob.reveal-init {
            opacity: 0;
            transform: scale(0.8) rotate(-10deg);
            transition: all 1.6s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .hero-image-blob.is-revealed {
            opacity: 1;
            transform: scale(1) rotate(-5deg);
        }

        .product-card {
            transition-delay: 0.1s;
        }

        .product-card:nth-child(2) { transition-delay: 0.2s; }
        .product-card:nth-child(3) { transition-delay: 0.3s; }
        .product-card:nth-child(4) { transition-delay: 0.4s; }

        .hero-title { transition-delay: 0.1s; }
        .hero-subtitle { transition-delay: 0.2s; }
        .hero-actions { transition-delay: 0.3s; }
    `;
    document.head.appendChild(style);

    function initMenuCardEffects() {
        if (!menuOverlay) return;

        // Reveal menu cards when the overlay is opened
        const menuCards = menuOverlay.querySelectorAll('.menu-card');
        menuCards.forEach((card) => {
            card.classList.add('reveal-init');
            revealObserver.observe(card);
        });

        // Tap/press feedback for touch devices (simulates hover "pop")
        const isTouchLike = window.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches;
        if (!isTouchLike) return;

        let pressedCard = null;
        const clearPressed = () => {
            if (pressedCard) pressedCard.classList.remove('is-pressed');
            pressedCard = null;
        };

        menuOverlay.addEventListener('pointerdown', (e) => {
            const card = e.target?.closest?.('.menu-card');
            if (!card) return;
            clearPressed();
            pressedCard = card;
            pressedCard.classList.add('is-pressed');
        }, { passive: true });

        menuOverlay.addEventListener('pointerup', clearPressed, { passive: true });
        menuOverlay.addEventListener('pointercancel', clearPressed, { passive: true });
        menuOverlay.addEventListener('scroll', clearPressed, { passive: true });
    }
});
