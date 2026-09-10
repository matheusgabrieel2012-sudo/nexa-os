/* =========================================================
   CRIS ÓTICA
   INTERAÇÕES + ANIMAÇÕES
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       LOADER
    ===================================================== */

    const loader = document.getElementById("loader");

    window.addEventListener("load", () => {

        setTimeout(() => {

            loader.classList.add("loaded");

            document.body.classList.add("loaded");

        }, 700);

    });


    /* =====================================================
       HEADER
    ===================================================== */

    const header = document.getElementById("header");

    function updateHeader() {

        if (window.scrollY > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

    }

    window.addEventListener("scroll", updateHeader);

    updateHeader();


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuButton = document.getElementById("menuButton");
    const nav = document.getElementById("nav");

    menuButton.addEventListener("click", () => {

        menuButton.classList.toggle("open");
        nav.classList.toggle("open");
        document.body.classList.toggle("menu-open");

    });


    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            menuButton.classList.remove("open");
            nav.classList.remove("open");
            document.body.classList.remove("menu-open");

        });

    });


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealElements = document.querySelectorAll(".reveal");

    const revealObserver = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    revealObserver.unobserve(entry.target);

                }

            });

        },

        {
            threshold: 0.12,
            rootMargin: "0px 0px -50px 0px"
        }

    );

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });


    /* =====================================================
       ACTIVE NAV
    ===================================================== */

    const sections = document.querySelectorAll(
        "section[id]"
    );

    function updateActiveNavigation() {

        let currentSection = "";

        sections.forEach(section => {

            const sectionTop =
                section.offsetTop - 180;

            if (window.scrollY >= sectionTop) {
                currentSection = section.id;
            }

        });

        navLinks.forEach(link => {

            link.classList.remove("active");

            const target =
                link.getAttribute("href");

            if (target === `#${currentSection}`) {
                link.classList.add("active");
            }

        });

    }

    window.addEventListener(
        "scroll",
        updateActiveNavigation
    );

    updateActiveNavigation();


    /* =====================================================
       COUNTERS
    ===================================================== */

    const counters =
        document.querySelectorAll(".counter");

    const counterObserver =
        new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) return;

                    const counter = entry.target;

                    const target =
                        Number(counter.dataset.target);

                    const duration = 1300;

                    const startTime =
                        performance.now();

                    function updateCounter(currentTime) {

                        const progress =
                            Math.min(
                                (currentTime - startTime) /
                                duration,
                                1
                            );

                        const eased =
                            1 -
                            Math.pow(
                                1 - progress,
                                3
                            );

                        const value =
                            Math.floor(
                                eased * target
                            );

                        counter.textContent =
                            String(value).padStart(
                                target < 10 ? 2 : 1,
                                "0"
                            );

                        if (progress < 1) {

                            requestAnimationFrame(
                                updateCounter
                            );

                        }

                    }

                    requestAnimationFrame(
                        updateCounter
                    );

                    counterObserver.unobserve(
                        counter
                    );

                });

            },

            {
                threshold: .7
            }

        );

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });


    /* =====================================================
       HERO MOUSE PARALLAX
    ===================================================== */

    const hero = document.querySelector(".hero");
    const heroVisual =
        document.querySelector(".hero-visual");

    if (
        hero &&
        heroVisual &&
        window.matchMedia(
            "(pointer: fine)"
        ).matches
    ) {

        hero.addEventListener("mousemove", event => {

            const rect =
                hero.getBoundingClientRect();

            const x =
                (event.clientX - rect.left) /
                rect.width -
                .5;

            const y =
                (event.clientY - rect.top) /
                rect.height -
                .5;

            const moveX = x * 12;
            const moveY = y * 12;

            heroVisual.style.transform =
                `translateY(calc(-50% + ${moveY}px))
                 translateX(${moveX}px)`;

        });

        hero.addEventListener("mouseleave", () => {

            heroVisual.style.transform =
                "translateY(-50%) translateX(0)";

        });

    }


    /* =====================================================
       CARDS MAGNETIC HOVER
    ===================================================== */

    const cards =
        document.querySelectorAll(
            ".experience-card, .style-item"
        );

    if (
        window.matchMedia(
            "(pointer: fine)"
        ).matches
    ) {

        cards.forEach(card => {

            card.addEventListener(
                "mousemove",
                event => {

                    const rect =
                        card.getBoundingClientRect();

                    const x =
                        event.clientX -
                        rect.left;

                    const y =
                        event.clientY -
                        rect.top;

                    const centerX =
                        rect.width / 2;

                    const centerY =
                        rect.height / 2;

                    const rotateX =
                        (y - centerY) /
                        centerY *
                        -1.5;

                    const rotateY =
                        (x - centerX) /
                        centerX *
                        1.5;

                    card.style.transform =
                        `translateY(-8px)
                         perspective(900px)
                         rotateX(${rotateX}deg)
                         rotateY(${rotateY}deg)`;

                }
            );

            card.addEventListener(
                "mouseleave",
                () => {

                    card.style.transform =
                        "";

                }
            );

        });

    }


    /* =====================================================
       SMOOTH ANCHOR
    ===================================================== */

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach(anchor => {

        anchor.addEventListener(
            "click",
            event => {

                const id =
                    anchor.getAttribute("href");

                if (id === "#") return;

                const target =
                    document.querySelector(id);

                if (!target) return;

                event.preventDefault();

                const offset =
                    header.offsetHeight;

                const position =
                    target.offsetTop -
                    offset;

                window.scrollTo({
                    top: position,
                    behavior: "smooth"
                });

            }
        );

    });


    /* =====================================================
       TILT NO MAP
    ===================================================== */

    const mapCard =
        document.querySelector(".map-card");

    if (
        mapCard &&
        window.matchMedia(
            "(pointer: fine)"
        ).matches
    ) {

        mapCard.addEventListener(
            "mousemove",
            event => {

                const rect =
                    mapCard.getBoundingClientRect();

                const x =
                    event.clientX -
                    rect.left;

                const y =
                    event.clientY -
                    rect.top;

                const rotateY =
                    ((x / rect.width) - .5) * 3;

                const rotateX =
                    ((y / rect.height) - .5) * -3;

                mapCard.style.transform =
                    `perspective(1000px)
                     rotateX(${rotateX}deg)
                     rotateY(${rotateY}deg)`;

            }
        );

        mapCard.addEventListener(
            "mouseleave",
            () => {

                mapCard.style.transform = "";

            }
        );

    }


    /* =====================================================
       PARALLAX ELEMENTS
    ===================================================== */

    const parallaxElements =
        document.querySelectorAll(
            ".about-word, .feature-number"
        );

    let ticking = false;

    function updateParallax() {

        const scroll =
            window.scrollY;

        parallaxElements.forEach(element => {

            const rect =
                element.getBoundingClientRect();

            const center =
                rect.top +
                rect.height / 2;

            const distance =
                center -
                window.innerHeight / 2;

            const move =
                distance * -.025;

            element.style.transform =
                `translateY(${move}px)`;

        });

        ticking = false;

    }

    window.addEventListener(
        "scroll",
        () => {

            if (!ticking) {

                window.requestAnimationFrame(
                    updateParallax
                );

                ticking = true;

            }

        },
        {
            passive: true
        }
    );


    /* =====================================================
       WHATSAPP HOVER
    ===================================================== */

    const whatsapp =
        document.querySelector(".whatsapp");

    if (whatsapp) {

        whatsapp.addEventListener(
            "mouseenter",
            () => {

                whatsapp.querySelector(
                    ".whatsapp-icon"
                ).style.transform =
                    "rotate(45deg)";

            }
        );

        whatsapp.addEventListener(
            "mouseleave",
            () => {

                whatsapp.querySelector(
                    ".whatsapp-icon"
                ).style.transform =
                    "";

            }
        );

    }


    /* =====================================================
       CURSOR GLOW — DESKTOP
    ===================================================== */

    if (
        window.matchMedia(
            "(pointer: fine)"
        ).matches
    ) {

        const glow =
            document.createElement("div");

        glow.className =
            "cursor-glow";

        document.body.appendChild(glow);

        Object.assign(
            glow.style,
            {
                position: "fixed",
                width: "250px",
                height: "250px",
                borderRadius: "50%",
                pointerEvents: "none",
                zIndex: "0",
                opacity: "0",
                background:
                    "radial-gradient(circle, rgba(244,207,0,.10), transparent 70%)",
                transform:
                    "translate(-50%, -50%)",
                transition:
                    "opacity .4s ease"
            }
        );

        let mouseX = 0;
        let mouseY = 0;

        let glowX = 0;
        let glowY = 0;

        document.addEventListener(
            "mousemove",
            event => {

                mouseX = event.clientX;
                mouseY = event.clientY;

                glow.style.opacity = "1";

            }
        );

        document.addEventListener(
            "mouseleave",
            () => {

                glow.style.opacity = "0";

            }
        );

        function animateGlow() {

            glowX +=
                (mouseX - glowX) * .08;

            glowY +=
                (mouseY - glowY) * .08;

            glow.style.left =
                `${glowX}px`;

            glow.style.top =
                `${glowY}px`;

            requestAnimationFrame(
                animateGlow
            );

        }

        animateGlow();

    }


    /* =====================================================
       IMAGE-FREE FRAME ANIMATION
    ===================================================== */

    const frame =
        document.querySelector(".frame-one");

    if (frame) {

        let direction = 1;

        setInterval(() => {

            if (
                window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches
            ) return;

            direction *= -1;

            frame.style.transform =
                direction === 1
                    ? "translate(0, -5px) rotate(1deg)"
                    : "translate(4%, 3px) rotate(3deg)";

        }, 2800);

    }

});