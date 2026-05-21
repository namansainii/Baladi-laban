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
    let scrollLockY = 0;

    // ---- Scroll Morph: Hero Brand -> Navbar Logo ----
    const navLogo = document.getElementById('nav-logo');
    const heroOverlayBrand = document.querySelector('.hero-bilingual-brand--overlay');
    const heroBrandEn = heroOverlayBrand?.querySelector('.hero-brand-en') || null;
    let brandMorphRafPending = false;
    let heroOverlayInitialRect = null;
    let heroOverlayInitialWidth = null;
    let heroOverlayInitialHeight = null;
    let heroOverlayPlaceholder = null;

    function openMenu() {
        if (menuOverlay) {
            menuOverlay.classList.add('active');
            // Robust scroll lock (works on mobile Safari too)
            scrollLockY = window.scrollY || window.pageYOffset || 0;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollLockY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
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
            const y = scrollLockY;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            if (y) window.scrollTo(0, y);
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

    function clamp01(value) {
        return Math.max(0, Math.min(1, value));
    }

    function smoothstep(t) {
        const x = clamp01(t);
        return x * x * (3 - 2 * x);
    }

    function updateBrandMorph() {
        brandMorphRafPending = false;
        if (!navLogo || !heroOverlayBrand || !heroBrandEn) return;

        // If hero is gone (e.g. scrolled past), just show nav logo normally.
        const navRect = navLogo.getBoundingClientRect();
        if (!heroOverlayInitialRect) {
            const rect = heroOverlayBrand.getBoundingClientRect();
            heroOverlayInitialRect = { left: rect.left, top: rect.top };
            heroOverlayInitialWidth = rect.width || 1;
            heroOverlayInitialHeight = rect.height || 1;
            heroOverlayBrand.classList.add('is-morphing');

            // Move to <body> so it can appear above the navbar (escape hero stacking context).
            if (!heroOverlayPlaceholder) {
                heroOverlayPlaceholder = document.createComment('hero-overlay-brand-placeholder');
                heroOverlayBrand.parentNode?.insertBefore(heroOverlayPlaceholder, heroOverlayBrand);
            }
            if (heroOverlayBrand.parentNode !== document.body) {
                document.body.appendChild(heroOverlayBrand);
            }
        }

        const startY = 0;
        const endY = Math.max(420, Math.min(window.innerHeight * 1.25, 900));
        const rawProgress = (window.scrollY - startY) / endY;
        const progress = smoothstep(rawProgress);

        // Keep the real (animated) hero brand as the navbar brand when morphed.
        // So the English <-> Urdu animation continues even in the navbar position.
        navLogo.style.opacity = '0';
        navLogo.style.pointerEvents = 'none';

        // Move the real hero overlay brand into the navbar logo position.
        const from = heroOverlayInitialRect;

        // Make the brand a bit larger than the normal navbar logo for readability,
        // but clamp on small screens so it doesn't become huge.
        let targetWidth = Math.max(navRect.width * 2.1, 240);
        if (window.innerWidth <= 480) {
            targetWidth = Math.min(200, Math.max(140, navRect.width * 1.6));
        } else if (window.innerWidth <= 768) {
            targetWidth = Math.min(260, Math.max(180, navRect.width * 1.9));
        }
        const targetScale = heroOverlayInitialWidth > 0 ? (targetWidth / heroOverlayInitialWidth) : 1;
        const targetHeight = heroOverlayInitialHeight * targetScale;

        const toLeft = navRect.left + (navRect.width - targetWidth) / 2;
        const toTop = navRect.top + (navRect.height - targetHeight) / 2;

        const translateX = from.left + (toLeft - from.left) * progress;
        const translateY = from.top + (toTop - from.top) * progress;
        const uniformScale = 1 + (targetScale - 1) * progress;

        heroOverlayBrand.style.opacity = '1';
        heroOverlayBrand.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${uniformScale})`;

        // When we're essentially at the top, let CSS control positioning (avoids any jitter).
        if (progress < 0.001) {
            heroOverlayBrand.classList.remove('is-morphing');
            heroOverlayBrand.style.transform = '';
            heroOverlayBrand.style.opacity = '';
            heroOverlayInitialRect = null;
            heroOverlayInitialWidth = null;
            heroOverlayInitialHeight = null;

            // Restore to original DOM position.
            if (heroOverlayPlaceholder?.parentNode) {
                heroOverlayPlaceholder.parentNode.insertBefore(heroOverlayBrand, heroOverlayPlaceholder);
                heroOverlayPlaceholder.parentNode.removeChild(heroOverlayPlaceholder);
            }
            heroOverlayPlaceholder = null;
        }
    }

    function requestBrandMorphUpdate() {
        if (brandMorphRafPending) return;
        brandMorphRafPending = true;
        window.requestAnimationFrame(updateBrandMorph);
    }

    // Init state
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (!reduceMotion && navLogo && heroOverlayBrand && heroBrandEn) {
        navLogo.style.opacity = '0';
        navLogo.style.pointerEvents = 'none';
        requestBrandMorphUpdate();
        window.addEventListener('scroll', requestBrandMorphUpdate, { passive: true });
        window.addEventListener('resize', () => {
            heroOverlayInitialRect = null;
            heroOverlayInitialWidth = null;
            heroOverlayInitialHeight = null;
            heroOverlayBrand.classList.remove('is-morphing');
            heroOverlayBrand.style.transform = '';
            requestBrandMorphUpdate();
        });
    } else if (navLogo) {
        navLogo.style.opacity = '';
        navLogo.style.pointerEvents = '';
        // Ensure hero overlay brand is in its normal place on reduced motion.
        if (heroOverlayBrand) {
            heroOverlayBrand.classList.remove('is-morphing');
            heroOverlayBrand.style.transform = '';
            heroOverlayBrand.style.opacity = '';
            if (heroOverlayPlaceholder?.parentNode) {
                heroOverlayPlaceholder.parentNode.insertBefore(heroOverlayBrand, heroOverlayPlaceholder);
                heroOverlayPlaceholder.parentNode.removeChild(heroOverlayPlaceholder);
            }
            heroOverlayPlaceholder = null;
        }
    }

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
