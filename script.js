/* ============================================
   NexusWebIQ — Main JavaScript
   Handles: Navbar, Animations, Slider, FAQ,
   Counters, Mobile Menu, VIP Expander, Particles
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================
    // 1. STICKY NAVBAR
    // ============================
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ============================
    // 2. MOBILE MENU
    // ============================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileNav.classList.toggle('open');
            document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
        });

        // Close mobile nav on link click
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileNav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ============================
    // 3. SCROLL REVEAL (Intersection Observer)
    // ============================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.12
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up, .fade-in-right, .fade-in-left, .scale-in').forEach(el => {
        revealObserver.observe(el);
    });

    // ============================
    // 4. SMOOTH SCROLLING (Anchor Links)
    // ============================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navHeight = navbar ? navbar.offsetHeight : 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================
    // 5. STATS COUNTER ANIMATION
    // ============================
    const counters = document.querySelectorAll('.stat-number[data-target]');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(easeOut * target);

                counter.textContent = current + '+';

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + '+';
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    if (counters.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        const statsSection = document.querySelector('.stats-strip');
        if (statsSection) {
            statsObserver.observe(statsSection);
        }
    }

    // ============================
    // 6. PORTFOLIO SLIDER
    // ============================
    const sliderTrack = document.getElementById('sliderTrack');
    const sliderPrev = document.getElementById('sliderPrev');
    const sliderNext = document.getElementById('sliderNext');
    const sliderDotsContainer = document.getElementById('sliderDots');

    if (sliderTrack && sliderPrev && sliderNext && sliderDotsContainer) {
        const slides = sliderTrack.querySelectorAll('.slide');
        const dots = sliderDotsContainer.querySelectorAll('.slider-dot');
        let currentSlide = 0;
        let autoplayInterval;
        const totalSlides = slides.length;

        function goToSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;
            currentSlide = index;

            // RTL: use positive translateX to move right
            sliderTrack.style.transform = `translateX(${currentSlide * 100}%)`;

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        sliderNext.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
            resetAutoplay();
        });

        sliderPrev.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
            resetAutoplay();
        });

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                goToSlide(parseInt(dot.getAttribute('data-index')));
                resetAutoplay();
            });
        });

        // Autoplay
        function startAutoplay() {
            autoplayInterval = setInterval(() => {
                goToSlide(currentSlide + 1);
            }, 4500);
        }

        function resetAutoplay() {
            clearInterval(autoplayInterval);
            startAutoplay();
        }

        startAutoplay();

        // Pause on hover
        const sliderWrapper = sliderTrack.closest('.slider-wrapper');
        if (sliderWrapper) {
            sliderWrapper.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
            sliderWrapper.addEventListener('mouseleave', () => startAutoplay());
        }

        // Touch/Swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        if (sliderWrapper) {
            sliderWrapper.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            sliderWrapper.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 50) {
                    // RTL: swipe directions are reversed
                    if (diff < 0) {
                        goToSlide(currentSlide + 1);
                    } else {
                        goToSlide(currentSlide - 1);
                    }
                    resetAutoplay();
                }
            }, { passive: true });
        }
    }

    // ============================
    // 7. FAQ ACCORDION
    // ============================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all other items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherQuestion = otherItem.querySelector('.faq-question');
                    if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
                });

                // Toggle current
                if (!isActive) {
                    item.classList.add('active');
                    question.setAttribute('aria-expanded', 'true');
                }
            });
        }
    });

    // ============================
    // 8. VIP READ MORE EXPANDER
    // ============================
    const readMoreBtn = document.getElementById('vip-read-more');
    const vipFeatures = document.getElementById('vip-features');

    if (readMoreBtn && vipFeatures) {
        readMoreBtn.addEventListener('click', () => {
            const isExpanded = vipFeatures.classList.contains('open');
            vipFeatures.classList.toggle('open');
            readMoreBtn.classList.toggle('expanded');

            const btnText = readMoreBtn.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = isExpanded ? 'قراءة المزيد' : 'عرض أقل';
            }
        });
    }

    // ============================
    // 9. PARTICLES BACKGROUND
    // ============================
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.4 + 0.1;
                this.color = Math.random() > 0.5 ? '0, 229, 255' : '176, 38, 255';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
                ctx.fill();
            }
        }

        function initParticles() {
            const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 15000));
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function connectParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        const opacity = (1 - distance / 150) * 0.15;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            connectParticles();
            animationId = requestAnimationFrame(animateParticles);
        }

        initParticles();
        animateParticles();

        // Pause particles when not visible
        const particleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animationId) animateParticles();
                } else {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            });
        });

        particleObserver.observe(canvas);
    }

    // ============================
    // 10. ACTIVE NAV LINK HIGHLIGHT
    // ============================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

});
