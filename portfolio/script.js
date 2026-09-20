document.addEventListener('DOMContentLoaded', () => {
    // Force scroll to top on reload
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    window.addEventListener('beforeunload', () => {
        window.scrollTo(0, 0);
    });

    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Starfield Canvas Particle System
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');

    let stars = [];
    const starCount = window.innerWidth < 768 ? 50 : 120;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initStars();
    }

    class Star {
        constructor() {
            this.reset(true);
        }

        reset(isInitial = false) {
            this.x = Math.random() * canvas.width;
            this.y = isInitial ? (Math.random() * canvas.height) : -10;
            
            // 3 Parallax Depth layers
            const rand = Math.random();
            if (rand < 0.6) {
                // Background stars (tiny, slow drift)
                this.size = Math.random() * 0.6 + 0.3;
                this.speedY = Math.random() * 0.04 + 0.02;
                this.speedX = (Math.random() * 0.02 - 0.01);
                this.baseAlpha = Math.random() * 0.4 + 0.2;
                this.isSparkle = false;
            } else if (rand < 0.9) {
                // Midground stars (medium drift)
                this.size = Math.random() * 0.8 + 0.6;
                this.speedY = Math.random() * 0.08 + 0.04;
                this.speedX = (Math.random() * 0.04 - 0.02);
                this.baseAlpha = Math.random() * 0.5 + 0.4;
                this.isSparkle = Math.random() > 0.7;
            } else {
                // Foreground stars (large, faster drift, always sparkle)
                this.size = Math.random() * 1.2 + 1.0;
                this.speedY = Math.random() * 0.16 + 0.08;
                this.speedX = (Math.random() * 0.06 - 0.03);
                this.baseAlpha = Math.random() * 0.6 + 0.5;
                this.isSparkle = true;
            }

            this.alpha = this.baseAlpha;
            this.twinkleSpeed = Math.random() * 0.03 + 0.01;
            this.twinklePhase = Math.random() * Math.PI * 2;
            this.glow = Math.random() > 0.85;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;

            this.twinklePhase += this.twinkleSpeed;
            this.alpha = this.baseAlpha + Math.sin(this.twinklePhase) * 0.25;
            
            if (this.alpha < 0.1) this.alpha = 0.1;
            if (this.alpha > 1.0) this.alpha = 1.0;

            // Wrap around boundaries
            if (this.y > canvas.height) {
                this.reset(false);
            }
            if (this.x < 0) {
                this.x = canvas.width;
            } else if (this.x > canvas.width) {
                this.x = 0;
            }
        }

        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();

            // Glow Aura
            if (this.glow) {
                ctx.fillStyle = `rgba(0, 245, 212, ${this.alpha * 0.25})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fill();
            }

            // 4-Point Sparkle Lens Flare
            if (this.isSparkle && this.alpha > 0.6) {
                const flareOpacity = (this.alpha - 0.6) * 1.5;
                const sizeFactor = this.size * 4;

                ctx.strokeStyle = `rgba(255, 255, 255, ${flareOpacity})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(this.x - sizeFactor, this.y);
                ctx.lineTo(this.x + sizeFactor, this.y);
                ctx.moveTo(this.x, this.y - sizeFactor);
                ctx.lineTo(this.x, this.y + sizeFactor);
                ctx.stroke();
            }
        }
    }

    class ShootingStar {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * (canvas.height * 0.4);
            this.length = Math.random() * 80 + 40;
            this.speed = Math.random() * 12 + 6;
            this.angle = (Math.PI / 4) + (Math.random() * 0.2 - 0.1);
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.active = false;
            this.alpha = 1.0;
            this.fadeSpeed = Math.random() * 0.03 + 0.015;
        }

        trigger() {
            this.reset();
            this.active = true;
        }

        update() {
            if (!this.active) return;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.fadeSpeed;
            if (this.alpha <= 0 || this.x > canvas.width || this.y > canvas.height) {
                this.active = false;
            }
        }

        draw() {
            if (!this.active) return;
            
            const grad = ctx.createLinearGradient(
                this.x, this.y, 
                this.x - this.vx * 2, this.y - this.vy * 2
            );
            grad.addColorStop(0, `rgba(255, 255, 255, ${this.alpha})`);
            grad.addColorStop(0.2, `rgba(0, 245, 212, ${this.alpha * 0.6})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
            ctx.stroke();
        }
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < starCount; i++) {
            stars.push(new Star());
        }
    }

    let shootingStars = [new ShootingStar(), new ShootingStar()];

    let isCanvasVisible = true;
    if (typeof IntersectionObserver !== 'undefined' && canvas) {
        const canvasObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isCanvasVisible = entry.isIntersecting;
            });
        }, { threshold: 0.01 });
        canvasObserver.observe(canvas);
    }

    function animateStars() {
        if (isCanvasVisible) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(star => {
                star.update();
                star.draw();
            });

            shootingStars.forEach(sStar => {
                if (!sStar.active && Math.random() < 0.001) {
                    sStar.trigger();
                }
                if (sStar.active) {
                    sStar.update();
                    sStar.draw();
                }
            });
        }
        requestAnimationFrame(animateStars);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateStars();

    // 3. Interactive Tech Stack details hover
    const techDetails = {
        'react': {
            title: 'React',
            description: 'Building high-performance, component-driven interactive user interfaces. Used to build dynamic platforms, results analytics panels, and dashboard client apps.'
        },
        'nodejs': {
            title: 'Node.js',
            description: 'Designing robust backend APIs and streaming servers. Powers orchestration, database models, and real-time communications.'
        },
        'angular': {
            title: 'Angular',
            description: 'Developing enterprise dashboard frontends. Utilized structured modular design patterns, client-side routing, and complex state services for administrative operations.'
        },
        'mysql': {
            title: 'MySQL',
            description: 'Structuring relational database schemas. Built transaction-safe tracking tables, unique result constraints to prevent race conditions, and complex query procedures.'
        },
        'php': {
            title: 'PHP',
            description: 'Creating server-side handlers and script controls. Maintained stable system controllers, validation gateways, and user authorization sessions for local environments.'
        },
        'github': {
            title: 'GitHub & VCS',
            description: 'Managing source versioning and deployment setups. Implemented standardized branch structures, commit protocols, and stable pull request integration tracks.'
        },
        'html': {
            title: 'HTML5',
            description: 'Structuring responsive, accessible, and semantic web layouts. Implementing proper markup hierarchy, canvas views, SVG vectors, and SEO-optimized web documents.'
        },
        'css': {
            title: 'CSS3',
            description: 'Crafting beautiful, modern layouts with CSS. Specializes in advanced keyframe animations, glassmorphism, responsive grids, transitions, and customized theme systems.'
        },
        'javascript': {
            title: 'JavaScript (ES6+)',
            description: 'Core engine of development expertise. Powers lightweight client-side manipulations, data calculations, custom particle canvas animations, and full-stack utilities.'
        }
    };

    const techTitle = document.getElementById('tech-title');
    const techDesc = document.getElementById('tech-description');
    const orbitNodes = document.querySelectorAll('.orbit-node');
    const defaultTitle = "Interactive Core";
    const defaultDesc = "Hover or click any technology node to explore its application in my development ecosystem.";

    // Track active node for mobile click styling
    let activeNode = null;

    orbitNodes.forEach(node => {
        // Extract tech identifier from classes (e.g. node-react -> react)
        const techId = Array.from(node.classList)
            .find(c => c.startsWith('node-'))
            .replace('node-', '');

        const data = techDetails[techId];

        if (data) {
            // Hover event listeners
            node.addEventListener('mouseenter', () => {
                techTitle.textContent = data.title;
                techDesc.textContent = data.description;
                // Add soft glowing border to info card
                document.getElementById('tech-details-box').style.borderColor = 'rgba(0, 245, 212, 0.4)';
            });

            node.addEventListener('mouseleave', () => {
                if (!activeNode) {
                    techTitle.textContent = defaultTitle;
                    techDesc.textContent = defaultDesc;
                    document.getElementById('tech-details-box').style.borderColor = 'var(--border-color)';
                } else {
                    const activeId = Array.from(activeNode.classList)
                        .find(c => c.startsWith('node-'))
                        .replace('node-', '');
                    const activeData = techDetails[activeId];
                    techTitle.textContent = activeData.title;
                    techDesc.textContent = activeData.description;
                    document.getElementById('tech-details-box').style.borderColor = 'rgba(0, 245, 212, 0.4)';
                }
            });

            // Click event listener (especially for mobile/tablets)
            node.addEventListener('click', (e) => {
                e.stopPropagation();
                if (activeNode === node) {
                    // Deselect
                    activeNode = null;
                    techTitle.textContent = defaultTitle;
                    techDesc.textContent = defaultDesc;
                    document.getElementById('tech-details-box').style.borderColor = 'var(--border-color)';
                    node.querySelector('.node-icon').style.borderColor = 'var(--border-color)';
                } else {
                    if (activeNode) {
                        activeNode.querySelector('.node-icon').style.borderColor = 'var(--border-color)';
                    }
                    activeNode = node;
                    techTitle.textContent = data.title;
                    techDesc.textContent = data.description;
                    document.getElementById('tech-details-box').style.borderColor = 'rgba(0, 245, 212, 0.4)';
                    node.querySelector('.node-icon').style.borderColor = 'var(--color-accent)';
                }
            });
        }
    });

    // Global click to reset active node selection
    document.addEventListener('click', () => {
        if (activeNode) {
            activeNode.querySelector('.node-icon').style.borderColor = 'var(--border-color)';
            activeNode = null;
            techTitle.textContent = defaultTitle;
            techDesc.textContent = defaultDesc;
            document.getElementById('tech-details-box').style.borderColor = 'var(--border-color)';
        }
    });

    // 4. Nav scroll active indicator spy
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 200; // Offset for header trigger

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // 5. Contact Form Submission handler (mock)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Sending...</span><i data-lucide="loader-2" class="icon-sm spin-loader"></i>`;
            lucide.createIcons();
            
            // Add spin animation class to icon
            const loaderIcon = submitBtn.querySelector('.spin-loader');
            if (loaderIcon) {
                loaderIcon.style.animation = 'spin 1s linear infinite';
            }

            // Simulate server network latency
            setTimeout(() => {
                // Success feedback UI
                submitBtn.innerHTML = `<span>Sent Successfully!</span><i data-lucide="check" class="icon-sm"></i>`;
                submitBtn.style.backgroundColor = '#10b981';
                submitBtn.style.color = '#ffffff';
                lucide.createIcons();

                // Clear input fields
                contactForm.reset();

                // Reset button after 3 seconds
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.color = '';
                    lucide.createIcons();
                }, 3000);

            }, 1200);
        });
    }

    // ==========================================================================
    // PREMIUM LUSION-INSPIRED INTERACTION ENGINE (GSAP + NATIVE SCROLL)
    // ==========================================================================

    // Register GSAP ScrollTrigger Plugin
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // 2. 4-Stack Status List Preloader (~1.8s smooth pacing)
    document.body.style.overflow = 'hidden';
    const preloader = document.getElementById('preloader');
    const loadPercentage = document.getElementById('load-percentage');
    const progressFill = preloader ? preloader.querySelector('.preloader-progress-fill') : null;
    const statusMsg = preloader ? preloader.querySelector('.preloader-status-msg') : null;

    const s1 = document.getElementById('step-1');
    const s2 = document.getElementById('step-2');
    const s3 = document.getElementById('step-3');
    const s4 = document.getElementById('step-4');

    function setStepState(el, state) {
        if (!el) return;
        if (state === 'pending') {
            el.classList.remove('loading', 'completed');
            el.classList.add('pending');
        } else if (state === 'loading') {
            el.classList.remove('pending', 'completed');
            el.classList.add('loading');
        } else if (state === 'completed') {
            el.classList.remove('pending', 'loading');
            el.classList.add('completed');
        }
    }

    function updateProgressUI(val) {
        const roundedVal = Math.floor(val);
        if (loadPercentage) {
            loadPercentage.textContent = String(roundedVal).padStart(3, '0');
        }
        if (progressFill) {
            progressFill.style.width = `${roundedVal}%`;
        }

        let msg = "LOADING FULL-STACK ARCHITECTURE...";
        if (roundedVal >= 0 && roundedVal < 25) {
            msg = "LOADING FULL-STACK ARCHITECTURE...";
            setStepState(s1, 'loading');
            setStepState(s2, 'pending');
            setStepState(s3, 'pending');
            setStepState(s4, 'pending');
        } else if (roundedVal >= 25 && roundedVal < 50) {
            msg = "INITIALIZING AI & MCP WORKFLOWS...";
            setStepState(s1, 'completed');
            setStepState(s2, 'loading');
            setStepState(s3, 'pending');
            setStepState(s4, 'pending');
        } else if (roundedVal >= 50 && roundedVal < 75) {
            msg = "COMPILING EMBEDDED HARDWARE SYSTEMS...";
            setStepState(s1, 'completed');
            setStepState(s2, 'completed');
            setStepState(s3, 'loading');
            setStepState(s4, 'pending');
        } else if (roundedVal >= 75 && roundedVal < 100) {
            msg = "LAUNCHING PORTFOLIO EXPERIENCE...";
            setStepState(s1, 'completed');
            setStepState(s2, 'completed');
            setStepState(s3, 'completed');
            setStepState(s4, 'loading');
        } else if (roundedVal >= 100) {
            msg = "SYSTEM READY";
            setStepState(s1, 'completed');
            setStepState(s2, 'completed');
            setStepState(s3, 'completed');
            setStepState(s4, 'completed');
        }
        if (statusMsg) statusMsg.textContent = msg;

    }

    let val = 0;
    const stackPreloaderInterval = setInterval(() => {
        val += Math.floor(Math.random() * 3) + 2; // Increments smoothly
        if (val >= 100) {
            val = 100;
            clearInterval(stackPreloaderInterval);
            updateProgressUI(100);
            setTimeout(triggerStackReveal, 250);
        } else {
            updateProgressUI(val);
        }
    }, 35);

    function triggerStackReveal() {
        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline({
                onComplete: () => {
                    if (preloader) preloader.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });

            tl.to([".preloader-counter-container", ".preloader-status-msg", ".preloader-bar-wrapper", ".preloader-stack-list"], {
                opacity: 0,
                y: -15,
                duration: 0.4,
                stagger: 0.05,
                ease: "power2.in"
            });

            tl.to("#preloader", {
                opacity: 0,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.15");

            tl.fromTo(".nav-container", { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" }, "-=0.35");
            tl.fromTo(".hero-content", { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, "-=0.5");


        } else {
            if (preloader) preloader.style.display = 'none';
            document.body.style.overflow = '';
        }
    }






    // 3. Custom Follower Cursor & Background Glow Blob Lerp
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = cursor ? cursor.querySelector('.cursor-dot') : null;
    const cursorCircle = cursor ? cursor.querySelector('.cursor-circle') : null;
    const glowBlob3 = document.querySelector('.blob-3');

    if (cursor && cursorDot && cursorCircle) {
        let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let dot = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let circle = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let blob = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        function updatePositions() {
            // Linear Interpolation (lerp) for smooth lagging effect
            dot.x += (mouse.x - dot.x) * 0.25;
            dot.y += (mouse.y - dot.y) * 0.25;

            circle.x += (mouse.x - circle.x) * 0.085;
            circle.y += (mouse.y - circle.y) * 0.085;

            blob.x += (mouse.x - blob.x) * 0.02;
            blob.y += (mouse.y - blob.y) * 0.02;

            cursorDot.style.left = `${dot.x}px`;
            cursorDot.style.top = `${dot.y}px`;

            cursorCircle.style.left = `${circle.x}px`;
            cursorCircle.style.top = `${circle.y}px`;

            if (glowBlob3) {
                glowBlob3.style.left = '0px';
                glowBlob3.style.top = '0px';
                glowBlob3.style.transform = `translate3d(calc(-50% + ${blob.x}px), calc(-50% + ${blob.y}px), 0)`;
            }

            requestAnimationFrame(updatePositions);
        }
        updatePositions();

        // Cursor scaling states on hover
        const hoverables = document.querySelectorAll(
            'a, button, .orbit-node, input, textarea, .project-card, .timeline-card, .social-link'
        );
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-hover');
            });
        });
    }

    // 4. Magnetic Hover Effect for Buttons
    const magnetics = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-resume, .social-link');
    magnetics.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0) scale(1.02)`;
            btn.style.boxShadow = `0 10px 25px rgba(0, 245, 212, 0.12)`;
            
            const btnInner = btn.querySelector('span, i');
            if (btnInner) {
                btnInner.style.transform = `translate3d(${x * 0.08}px, ${y * 0.08}px, 0)`;
            }
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.boxShadow = '';
            const btnInner = btn.querySelector('span, i');
            if (btnInner) {
                btnInner.style.transform = '';
            }
        });
    });

    // =========================================================================
    // 5. 3D Cylindrical Spine Project Cards Animation Engine
    // =========================================================================
    const spineSection = document.getElementById('projects');
    const spineVerticalLine = document.getElementById('spine-vertical-line');
    const spineNodesWrapper = document.getElementById('spine-nodes-wrapper');
    const spineProgressNav = document.getElementById('spine-progress-nav');
    const spineScrollCue = document.getElementById('spine-scroll-cue');
    const cardWrappers = Array.from(document.querySelectorAll('.spine-card-wrapper'));

    if (spineSection && cardWrappers.length > 0) {
        const N = cardWrappers.length; // 8
        const stepAngle = 60; // 60 deg between adjacent cards

        // Generate milestone dots on the central spine track
        if (spineNodesWrapper) {
            spineNodesWrapper.innerHTML = '';
            for (let i = 0; i < N; i++) {
                const dot = document.createElement('div');
                dot.className = 'spine-node-dot';
                dot.setAttribute('data-spine-node', i);
                dot.style.width = '8px';
                dot.style.height = '8px';
                dot.style.left = '0px';
                dot.style.top = '0px';
                dot.style.background = 'rgba(0, 245, 212, 0.35)';
                spineNodesWrapper.appendChild(dot);
            }
        }

        // Generate right-side milestone indicators
        if (spineProgressNav) {
            spineProgressNav.innerHTML = '';
            for (let i = 0; i < N; i++) {
                const navDot = document.createElement('div');
                navDot.className = 'spine-nav-dot' + (i === 0 ? ' active' : '');
                navDot.setAttribute('data-index', i);
                navDot.title = `Project 0${i + 1}`;
                navDot.addEventListener('click', () => {
                    const totalScrollable = spineSection.offsetHeight - window.innerHeight;
                    const targetScroll = spineSection.offsetTop + (i / (N - 1)) * totalScrollable;
                    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
                });
                spineProgressNav.appendChild(navDot);
            }
        }

        const navDots = spineProgressNav ? Array.from(spineProgressNav.querySelectorAll('.spine-nav-dot')) : [];
        const spineDots = spineNodesWrapper ? Array.from(spineNodesWrapper.querySelectorAll('.spine-node-dot')) : [];

        let currentProgress = 0;
        let targetProgress = 0;
        let isAnimating = false;

        function updateSpineScene() {
            // Smooth progress interpolation for ultra-silky motion
            currentProgress += (targetProgress - currentProgress) * 0.16;
            if (Math.abs(targetProgress - currentProgress) < 0.0004) {
                currentProgress = targetProgress;
            }

            const R = window.innerWidth < 768 ? 210 : 310;
            const CARD_GAP = window.innerWidth < 768 ? 150 : 190;

            const p = currentProgress;
            const riseY = p * (N - 1) * CARD_GAP;
            const rotation = -p * (N - 1) * stepAngle;
            const activeIndex = Math.min(N - 1, Math.max(0, Math.round(p * (N - 1))));

            // 1. Update Central Glowing Spine Line Height (grows upward from center)
            if (spineVerticalLine) {
                spineVerticalLine.style.height = `${riseY}px`;
            }

            // 2. Update Spine Milestone Nodes
            spineDots.forEach((dot, i) => {
                const dotY = -(i * CARD_GAP - riseY); // negative is upward
                if (dotY > 4) {
                    dot.style.opacity = '0';
                    dot.style.pointerEvents = 'none';
                } else {
                    const isActive = activeIndex === i;
                    const size = isActive ? 12 : 7;
                    dot.style.opacity = '1';
                    dot.style.width = `${size}px`;
                    dot.style.height = `${size}px`;
                    dot.style.top = `${dotY}px`;
                    const cardEl = cardWrappers[i]?.querySelector('.spine-project-card');
                    const accent = cardEl?.getAttribute('data-accent') || '#00f5d4';
                    
                    if (isActive) {
                        dot.style.background = accent;
                        dot.style.boxShadow = `0 0 14px ${accent}cc`;
                    } else {
                        dot.style.background = 'rgba(0, 245, 212, 0.4)';
                        dot.style.boxShadow = 'none';
                    }
                }
            });

            // 3. Update Cylindrical Cards 3D Transforms
            cardWrappers.forEach((wrapper, i) => {
                const angle = i * stepAngle + rotation;
                const cardY = i * CARD_GAP - riseY;

                const normAngle = ((angle % 360) + 360) % 360;
                const facingAngle = normAngle > 180 ? 360 - normAngle : normAngle; // 0..180
                const facing = 0.2 + 0.8 * Math.max(0, 1 - facingAngle / 90);
                const isCenter = facing > 0.84;

                const cardEl = wrapper.querySelector('.spine-project-card');
                const accent = cardEl?.getAttribute('data-accent') || '#00f5d4';

                // Center card vertically (-115px half height offset)
                wrapper.style.top = `${cardY - 115}px`;
                wrapper.style.transform = `rotateY(${angle}deg) translateZ(${R}px)`;
                wrapper.style.opacity = `${facing}`;
                wrapper.style.pointerEvents = isCenter ? 'auto' : 'none';
                wrapper.style.zIndex = isCenter ? '20' : '10';

                if (cardEl) {
                    cardEl.style.setProperty('--card-accent', accent);
                    cardEl.style.setProperty('--card-glow', `${accent}40`);
                    if (isCenter) {
                        cardEl.classList.add('is-front');
                    } else {
                        cardEl.classList.remove('is-front');
                    }
                }
            });

            // 4. Update Right Navigation Dots
            navDots.forEach((dot, i) => {
                const cardEl = cardWrappers[i]?.querySelector('.spine-project-card');
                const accent = cardEl?.getAttribute('data-accent') || '#00f5d4';
                if (activeIndex === i) {
                    dot.classList.add('active');
                    dot.style.background = accent;
                    dot.style.boxShadow = `0 0 12px ${accent}`;
                } else {
                    dot.classList.remove('active');
                    dot.style.background = 'rgba(148, 163, 184, 0.35)';
                    dot.style.boxShadow = 'none';
                }
            });

            // 5. Update Scroll Cue Visibility
            if (spineScrollCue) {
                spineScrollCue.style.opacity = p > 0.04 ? '0' : '1';
            }

            if (Math.abs(targetProgress - currentProgress) > 0.0004) {
                requestAnimationFrame(updateSpineScene);
            } else {
                isAnimating = false;
            }
        }

        function onScrollSpine() {
            const rect = spineSection.getBoundingClientRect();
            const total = spineSection.offsetHeight - window.innerHeight;
            if (total <= 0) return;
            const p = Math.min(1, Math.max(0, -rect.top / total));
            targetProgress = p;

            if (!isAnimating) {
                isAnimating = true;
                requestAnimationFrame(updateSpineScene);
            }
        }

        window.addEventListener('scroll', onScrollSpine, { passive: true });
        window.addEventListener('resize', () => {
            onScrollSpine();
        }, { passive: true });

        // Initial calculation
        onScrollSpine();
    }

    // 6. Buttery Scroll Reveal triggers for other page nodes
    const scrollRevealElements = document.querySelectorAll(
        '.timeline-item, .stat-card, .certifications-card, .browser-window, .orbit-container-wrapper, .impact-card, #contact-form, .info-card, .social-links-container'
    );

    if (typeof gsap !== 'undefined') {
        scrollRevealElements.forEach((el) => {
            if (el.classList.contains('timeline-item')) {
                // Timeline cards slide inward with subtle tilt
                const timelineCard = el.querySelector('.timeline-card');
                if (timelineCard) {
                    gsap.fromTo(timelineCard, 
                        { x: -40, opacity: 0, rotation: -1.5 },
                        { 
                            x: 0, 
                            opacity: 1, 
                            rotation: 0,
                            scrollTrigger: {
                                trigger: el,
                                start: "top 90%",
                                toggleActions: "play none none none"
                            },
                            duration: 1.1,
                            ease: "power3.out"
                        }
                    );
                }
            } else {
                // Custom fade-in-up for stats, dashboards, form cards
                gsap.fromTo(el, 
                    { y: 35, opacity: 0 },
                    { 
                        y: 0, 
                        opacity: 1, 
                        scrollTrigger: {
                            trigger: el,
                            start: "top 92%",
                            toggleActions: "play none none none"
                        },
                        duration: 1.2,
                        ease: "power3.out"
                    }
                );
            }
        });
    }

    // 7. Interactive 3D Magnetic Tilt & Radial Cursor Spotlight for Project Cards
    const tiltCards = document.querySelectorAll('.project-card-3d');

    tiltCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease, border-color 0.3s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease';
        });
    });

    // 8. Project Detail Modal Data & Event Handlers
    const projectsData = {
        aethon: {
            badge: "FLAGSHIP PRODUCT // SOFTWARE & AI",
            status: "Primary Developer",
            title: "Aethon Sentinel",
            tagline: "Intelligent Talent Assessment Platform",
            overview: "Aethon Sentinel is an end-to-end talent assessment platform designed to simplify technical recruitment and campus hiring by providing secure assessments, intelligent evaluation workflows, and AI-assisted administrative capabilities.",
            motivation: "Traditional assessment systems often require significant manual effort for test creation, student management, and candidate evaluation. Aethon Sentinel streamlines these processes through automation and AI-assisted workflows.",
            role: "Primary Developer — Designed and developed the platform from scratch, including: System Architecture, Database Design, Angular Frontend, Node.js Backend, Authentication, Role-Based Access Control (RBAC), MySQL Database, REST APIs, AI Integration, and MCP Integration.",
            features: [
                { icon: "lock", title: "Authentication & RBAC", desc: "Role-based access control powering dedicated Student, HR, and Admin Portals." },
                { icon: "file-code-2", title: "Assessment Engine", desc: "Test creation, question management, candidate evaluation, and automated results processing." },
                { icon: "bar-chart-3", title: "Analytics Hub", desc: "Detailed student performance tracking, assessment reports, and candidate insights." },
                { icon: "bot", title: "AI & MCP Integration", desc: "GROQ API powers the Developer Module & Admin AI Assistant. MCP enables natural language database queries." }
            ],
            challenges: ["Multi-Role Access Control", "Secure Authentication", "Backend Architecture", "Database Relationships", "Natural Language Querying", "AI Integration"],
            roadmap: [
                "Multi-tenant architecture for institutions",
                "Subscription-based licensing",
                "Cloud deployment & scalable infrastructure",
                "Advanced AI-assisted analytics",
                "Real-time proctoring enhancements",
                "Institution-level dashboards"
            ],
            tech: ["Angular", "Node.js", "MySQL", "JavaScript", "REST APIs", "GROQ API", "MCP SDK"]
        },
        truva: {
            badge: "FLAGSHIP PRODUCT // HARDWARE & EMBEDDED",
            status: "Functional Prototype",
            title: "TRUVA",
            tagline: "Smart Personal Safety System (Founder)",
            overview: "TRUVA is a smart personal safety solution designed to improve emergency response through an integrated hardware and software ecosystem.",
            motivation: "The idea originated from reflecting on a real-world public safety incident and asking a simple question: How can technology help someone receive assistance faster during an emergency?",
            role: "Founder & Lead Architect — Responsibilities: Product Ideation, System Architecture, Prototype Development, Feature Planning, Embedded Integration.",
            features: [
                { icon: "cpu", title: "Hardware Integration", desc: "Arduino and ESP microcontroller sensor setup for alert detection." },
                { icon: "radio", title: "Emergency Signal Trigger", desc: "Instant response dispatch architecture for emergency situations." },
                { icon: "shield-alert", title: "Safety Protocol", desc: "Designed for immediate user protection and real-time connectivity." }
            ],
            challenges: ["Hardware Sensor Calibration", "Embedded Code Optimization", "Reliable Dispatch Signaling", "Power Efficiency"],
            roadmap: [
                "Wearable safety hardware device",
                "Dedicated mobile application",
                "Automated emergency contact alert system",
                "Real-time GPS location tracking integration",
                "Cloud connectivity & incident logging"
            ],
            tech: ["Arduino / ESP", "Sensors", "Embedded Systems", "Software Integration"]
        },
        princeisolve: {
            badge: "HACKATHON WINNER // TRANSIT ROUTING",
            status: "Lead Developer",
            title: "Prince iSOLVE",
            tagline: "Smart Transit Routing & Real-Time Logistics Solution",
            overview: "Engineered a smart transit routing and real-time tracking solution for the Prince iSOLVE Hackathon. Built custom dieline maps, routing optimizations, and auto-notification modules to resolve logistics delays.",
            motivation: "Urban transportation and delivery logistics frequently face unexpected delays due to route bottlenecks and poor notification dispatch systems.",
            role: "Lead Developer — Designed system architecture, integrated Leaflet.js live mapping, built backend routing algorithms, and engineered automated alert notifications.",
            features: [
                { icon: "navigation", title: "Smart Transit Routing", desc: "Dynamic route optimization engine minimizing transit delays and bottlenecks." },
                { icon: "map-pin", title: "Leaflet.js Live Maps", desc: "Interactive map integration for real-time fleet and transit tracking." },
                { icon: "bell", title: "Auto Notifications", desc: "Automated alert dispatches for delays, rerouting, and estimated arrival updates." }
            ],
            challenges: ["Real-time Map Rendering", "Route Optimization Algorithms", "Hackathon High-Pressure Timeline"],
            tech: ["HTML5", "CSS3", "JavaScript", "PHP", "MySQL", "Leaflet.js"]
        },
        jgc: {

            badge: "CLIENT ERP // CONSTRUCTION PLATFORM",
            status: "Freelance Developer",
            title: "JGC Construction Management System",
            tagline: "Full-Stack Construction ERP",
            overview: "Collaborated within a 3-member development team to build a full-stack construction management platform for client JGC.",
            motivation: "Construction sites need centralized tracking for site workforce attendance, materials inventory, daily progress reporting, and manager approvals.",
            role: "Freelance Full-Stack Developer — Implemented attendance tracking, inventory monitoring, task assignment, role-based access control, and 20+ custom screens.",
            features: [
                { icon: "users", title: "Workforce & Attendance", desc: "Employee check-in logging, supervisor overrides, and site attendance reporting." },
                { icon: "package-check", title: "Inventory Monitoring", desc: "Material allocation tracking, stock count alerts, and dispatch approvals." },
                { icon: "bar-chart-2", title: "Site Analytics", desc: "20+ screens covering operational metrics, project timelines, and expense reports." }
            ],
            challenges: ["Role-Based Access Control", "Complex Data Schema", "20+ Custom Interfaces", "Client Workflow Alignment"],
            tech: ["HTML5", "CSS3", "JavaScript", "PHP", "MySQL"]
        },
        packazilla: {
            badge: "CLIENT PLATFORM // E-COMMERCE",
            status: "Full-Stack Developer",
            title: "Packazilla",
            tagline: "Custom Packaging Box Configurator",
            overview: "Designed and built an interactive web configurator and pricing engine for custom packaging boxes.",
            motivation: "Custom packaging customers require real-time 3D style visualization, exact dynamic dimension pricing, and direct quote requests.",
            role: "Full-Stack Developer — Created responsive interfaces for 3D box styles, custom dimension inputs, live pricing calculators, and secure order processing.",
            features: [
                { icon: "box", title: "3D Box Configurator", desc: "Interactive dimension sliders, style selector, and SVG preview generators." },
                { icon: "calculator", title: "Dynamic Pricing Engine", desc: "Instant calculated price quotes based on material, volume, and dimensions." },
                { icon: "shopping-bag", title: "Order Automation", desc: "Seamless checkout inquiry processing and customer specs delivery." }
            ],
            challenges: ["Real-time Price Math", "Dynamic SVG Generation", "Mobile Configurator Ergonomics"],
            tech: ["HTML5", "CSS3", "JavaScript", "PHP", "MySQL", "SVG Generators"]
        },
        bigbull: {
            badge: "INTERNSHIP PROJECT // EVENTS",
            status: "Eximio Intern",
            title: "The Big Bull",
            tagline: "Event & Service Platform",
            overview: "Contributed as a Frontend Developer within a 3-member internship team at Eximio Services Pvt. Ltd.",
            motivation: "Event management brand required a high-converting web portal with smooth animations and service booking forms.",
            role: "Frontend Developer Intern — Designed and implemented Home, Services, Events, About Us, Contact, and Inquiry pages.",
            features: [
                { icon: "calendar", title: "Events Showcase", desc: "Interactive event catalog with schedules, gallery, and venue maps." },
                { icon: "message-square", title: "Inquiry System", desc: "Active PHP backend form validation and customer inquiry logging." }
            ],
            challenges: ["Cross-Browser Compatibility", "Tight Internship Timeline", "Pixel-Perfect Layouts"],
            tech: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "PHP", "MySQL"]
        },
        sovereign: {
            badge: "INTERNSHIP PROJECT // RECOGNITION",
            status: "Eximio Intern",
            title: "Sovereign Awards",
            tagline: "Recognition & Nomination Portal",
            overview: "Developed frontend interfaces for a client-facing corporate awards platform.",
            motivation: "Automating annual awards submissions, public nomination entries, and sponsor highlights.",
            role: "Frontend Developer Intern — Built responsive user interfaces for nominations, candidate registrations, and sponsor showcases.",
            features: [
                { icon: "award", title: "Nomination Engine", desc: "Multi-step candidate entry form with file uploads and category pickers." },
                { icon: "star", title: "Sponsor Hub", desc: "High-impact sponsor showcase grid and partner recognition layouts." }
            ],
            challenges: ["Multi-Step Form Validation", "Responsive Layout Architecture"],
            tech: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "PHP", "MySQL"]
        },
        eximio: {
            badge: "INTERNSHIP PROJECT // CORPORATE",
            status: "Eximio Intern",
            title: "Eximio Corporate Website",
            tagline: "Corporate Interface & Lead Engine",
            overview: "Designed and built responsive pages and modern, clean-code layouts for Eximio's corporate site in Kosmo One.",
            motivation: "Corporate IT firm needed a modern web refresh with active lead capture and clean tech presentation.",
            role: "Web Developer Intern — Developed clean responsive layouts, integrated active lead generation forms, and interactive widgets.",
            features: [
                { icon: "globe", title: "Corporate Portal", desc: "Clean service presentation pages, tech stacks highlight, and team profiles." },
                { icon: "send", title: "Lead Engine", desc: "Interactive client consultation request forms and automatic email routing." }
            ],
            challenges: ["SEO Optimization", "Clean Modular Architecture", "Performance Tuning"],
            tech: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "PHP", "MySQL"]
        }
    };

    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-content-body');
    const closeBtn = document.getElementById('modal-close-btn');
    const backdrop = modal ? modal.querySelector('.modal-backdrop') : null;

    function openProjectModal(projectId) {
        const data = projectsData[projectId];
        if (!data || !modal || !modalBody) return;

        let featuresHtml = '';
        if (data.features) {
            featuresHtml = `
                <div class="flagship-block">
                    <h4 class="block-label"><i data-lucide="layers" class="icon-sm"></i> Core Features</h4>
                    <div class="flagship-features-grid">
                        ${data.features.map(f => `
                            <div class="feature-subcard">
                                <div class="feature-icon"><i data-lucide="${f.icon || 'check-circle'}"></i></div>
                                <h5>${f.title}</h5>
                                <p>${f.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        let roadmapHtml = '';
        if (data.roadmap) {
            roadmapHtml = `
                <div class="flagship-block roadmap-block">
                    <h4 class="block-label"><i data-lucide="compass" class="icon-sm"></i> Future Roadmap / Enhancements</h4>
                    <ul class="roadmap-list">
                        ${data.roadmap.map(item => `<li><i data-lucide="check-circle-2"></i> ${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        let challengesHtml = '';
        if (data.challenges) {
            challengesHtml = `
                <div class="flagship-block">
                    <h4 class="block-label"><i data-lucide="wrench" class="icon-sm"></i> Technical Challenges Solved</h4>
                    <div class="pills-flex">
                        ${data.challenges.map(c => `<span class="pill-item">${c}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        modalBody.innerHTML = `
            <div class="modal-header-section">
                <h2 class="modal-project-title">${data.title}</h2>
                <p class="modal-project-tagline">${data.tagline}</p>
            </div>

            <div class="flagship-block">
                <h4 class="block-label"><i data-lucide="eye" class="icon-sm"></i> Overview</h4>
                <p class="block-text">${data.overview}</p>
            </div>

            ${data.motivation ? `
                <div class="flagship-block">
                    <h4 class="block-label"><i data-lucide="lightbulb" class="icon-sm"></i> Why / Motivation</h4>
                    <p class="block-text highlight-inspiration">${data.motivation}</p>
                </div>
            ` : ''}

            ${data.role ? `
                <div class="flagship-block">
                    <h4 class="block-label"><i data-lucide="user-check" class="icon-sm"></i> My Role &amp; Responsibilities</h4>
                    <p class="block-text">${data.role}</p>
                </div>
            ` : ''}

            ${featuresHtml}
            ${challengesHtml}
            ${roadmapHtml}

            <div class="tech-stack-row">
                ${data.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
            </div>
        `;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    document.querySelectorAll('.compact-project-card').forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.getAttribute('data-project-id');
            openProjectModal(projectId);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
});



