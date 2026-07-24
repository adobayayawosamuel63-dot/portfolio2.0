document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. EFFET DE SUIVI DU CURSEUR (BACKGROUND GLOW)
       ========================================================================== */
    const bgGlow = document.getElementById('bg-glow');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Inertie fluide pour l'effet de lumière d'arrière-plan
    function updateGlowPosition() {
        const dx = mouseX - currentX;
        const dy = mouseY - currentY;
        
        currentX += dx * 0.1;
        currentY += dy * 0.1;
        
        bgGlow.style.setProperty('--mouse-x', `${currentX}px`);
        bgGlow.style.setProperty('--mouse-y', `${currentY}px`);
        
        requestAnimationFrame(updateGlowPosition);
    }
    updateGlowPosition();

    /* ==========================================================================
       2. NAVIGATION MOBILE (MENU BURGER)
       ========================================================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Fermer le menu mobile au clic sur un lien
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Changement de style du header au scroll
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* ==========================================================================
       3. ANIMATION DE DACTYLOGRAPHIE (TYPEWRITER)
       ========================================================================== */
    const typewriterElement = document.getElementById('typewriter');
    if (typewriterElement) {
        const words = JSON.parse(typewriterElement.getAttribute('data-words') || '[]');
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let currentText = '';

        function type() {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                currentText = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                currentText = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            typewriterElement.innerHTML = currentText;

            let typeSpeed = isDeleting ? 40 : 80;

            if (!isDeleting && charIndex === currentWord.length) {
                // Pause à la fin du mot entier
                typeSpeed = 1800;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500; // Petite pause avant d'attaquer le mot suivant
            }

            setTimeout(type, typeSpeed);
        }

        // Commencer l'animation après un petit délai
        setTimeout(type, 800);
    }

    /* ==========================================================================
       4. SCROLL REVEAL & BARRES DE COMPÉTENCES & SECTION ACTIVE INDICATION
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal');
    const skillBars = document.querySelectorAll('.skill-bar');
    const sections = document.querySelectorAll('.section-scroll');

    const observerOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Révéler l'élément
                entry.target.classList.add('active');
                
                // Si l'élément contient des barres de compétence, les animer
                if (entry.target.classList.contains('skill-card')) {
                    const bar = entry.target.querySelector('.skill-bar');
                    if (bar) {
                        bar.style.width = bar.getAttribute('data-progress');
                    }
                }
                
                // Arrêter d'observer une fois animé (sauf pour les sections)
                if (!entry.target.classList.contains('section-scroll')) {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
    
    // Observer pour le menu actif lors du défilement
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, { root: null, threshold: 0.4 });

    sections.forEach(sec => sectionObserver.observe(sec));

    /* ==========================================================================
       5. EFFET DE HOULE 3D SUR LES CARTES (3D TILT EFFECT)
       ========================================================================== */
    const tiltCards = document.querySelectorAll('.project-card, .skill-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Mettre à jour les variables CSS pour le dégradé radial local de la carte
            card.style.setProperty('--card-x', `${x}px`);
            card.style.setProperty('--card-y', `${y}px`);

            // Calcul du tilt 3D
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            const dx = x - xc;
            const dy = y - yc;
            
            // Angle de rotation max (5 degrés pour les compétences, 8 pour les projets)
            const maxTilt = card.classList.contains('project-card') ? 7 : 4;
            const angleX = -(dy / yc) * maxTilt;
            const angleY = (dx / xc) * maxTilt;

            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

    /* ==========================================================================
       6. SYSTÈME DE FILTRES DYNAMIQUES (COMPÉTENCES & PROJETS)
       ========================================================================== */
    
    // Filtrage des Compétences
    const skillsFilters = document.querySelectorAll('#skills-filter-container .filter-btn');
    const skillCards = document.querySelectorAll('.skills-grid .skill-card');

    skillsFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            skillsFilters.forEach(f => f.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-filter');

            skillCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'block';
                    // Animer doucement l'apparition
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1) translateY(0)';
                        // Re-remplir la barre
                        const bar = card.querySelector('.skill-bar');
                        if (bar) bar.style.width = bar.getAttribute('data-progress');
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9) translateY(10px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Filtrage des Projets
    const projectFilters = document.querySelectorAll('#projects-filter-container .filter-btn');
    const projectCards = document.querySelectorAll('.projects-grid .project-card');

    projectFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            projectFilters.forEach(f => f.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');

                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1) translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9) translateY(10px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    /* ==========================================================================
       7. FORMULAIRE DE CONTACT AVEC EFFET ET VALIDATION
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    const resetFormBtn = document.getElementById('btn-reset-form');
    const submitBtn = document.getElementById('btn-submit-form');
    const submitBtnText = submitBtn ? submitBtn.querySelector('span') : null;

    if (contactForm && formFeedback) {
        contactForm.addEventListener('submit', (e) => {
            // e.preventDefault();

            // Desactiver le bouton et simuler l'envoi
            submitBtn.disabled = true;
            if (submitBtnText) submitBtnText.textContent = 'Envoi en cours...';

            setTimeout(() => {
                // Réinitialiser le formulaire
                contactForm.reset();
                submitBtn.disabled = false;
                if (submitBtnText) submitBtnText.textContent = 'Envoyer le message';

                // Activer le feedback de succès
                formFeedback.classList.add('active');
            }, 1800);
        });

        if (resetFormBtn) {
            resetFormBtn.addEventListener('click', () => {
                formFeedback.classList.remove('active');
            });
        }
    }
});

/* Gestionnaire du préchargeur au chargement complet de la page */
window.addEventListener('load', () => {
    const body = document.body;
    setTimeout(() => {
        body.classList.remove('loading');
        body.classList.add('loaded');
    }, 1200);
});

