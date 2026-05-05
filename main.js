// main.js — Motion.dev animations + interactions
import { animate, inView, stagger } from "motion";

// As soon as Motion is loaded, mark the document so the fallback timer doesn't fire.
document.documentElement.classList.add("motion-ready");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- HERO ENTRANCE ---------- */
// The hero text is hidden via CSS (opacity: 0). Motion fades it in on load,
// staggered for a magazine-style reveal.
window.addEventListener("DOMContentLoaded", () => {
    const heroLines = document.querySelectorAll(".hero-title-line");
    const heroSub = document.querySelector(".hero-sub");
    const heroCta = document.querySelector(".hero-cta-row");

    if (reduceMotion) {
        [...heroLines, heroSub, heroCta].forEach((el) => {
            if (el) {
                el.style.opacity = 1;
                el.style.transform = "none";
            }
        });
        return;
    }

    animate(
        heroLines,
        { opacity: [0, 1], y: [40, 0] },
        {
            duration: 1.1,
            delay: stagger(0.12, { startDelay: 0.2 }),
            easing: [0.22, 1, 0.36, 1],
        }
    );

    if (heroCta) {
        animate(
            heroCta,
            { opacity: [0, 1], y: [20, 0] },
            { duration: 0.9, delay: 0.85, easing: [0.22, 1, 0.36, 1] }
        );
    }
});

/* ---------- SCROLL REVEALS ---------- */
const revealEls = document.querySelectorAll("[data-reveal]");
revealEls.forEach((el) => {
    inView(
        el,
        () => {
            if (reduceMotion) {
                el.classList.add("is-visible");
                return;
            }
            animate(
                el,
                { opacity: [0, 1], y: [28, 0] },
                { duration: 0.8, easing: [0.22, 1, 0.36, 1] }
            );
            el.classList.add("is-visible");
        },
        { margin: "0px 0px -10% 0px" }
    );
});

/* ---------- COUNTERS ---------- */
const counters = document.querySelectorAll("[data-counter]");
counters.forEach((el) => {
    const target = parseInt(el.getAttribute("data-counter"), 10) || 0;
    // Reset to 0 only when JS is ready — the HTML has the real number for the
    // no-JS / motion-failed case.
    el.textContent = "0";
    inView(
        el,
        () => {
            if (reduceMotion) {
                el.textContent = String(target);
                return;
            }
            const obj = { val: 0 };
            animate(obj, { val: target }, {
                duration: 1.6,
                easing: [0.22, 1, 0.36, 1],
                onUpdate: (latest) => {
                    const v = typeof latest === "number" ? latest : obj.val;
                    el.textContent = Math.round(v);
                },
            });
        },
        { margin: "0px 0px -15% 0px" }
    );
});

/* ---------- EVAL BARS ---------- */
const evalBars = document.querySelectorAll(".eval-bar");
evalBars.forEach((bar, i) => {
    inView(
        bar,
        () => {
            // Delay each bar a little for a cascade
            setTimeout(() => bar.classList.add("is-visible"), i * 140);
        },
        { margin: "0px 0px -20% 0px" }
    );
});

/* ---------- SCHEDULE TABS ---------- */
const tabs = document.querySelectorAll(".schedule-tab");
const panels = document.querySelectorAll(".schedule-panel");

tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const day = tab.getAttribute("data-day");
        tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
        panels.forEach((p) => {
            const isMatch = p.getAttribute("data-day-panel") === day;
            p.classList.toggle("is-active", isMatch);
            if (isMatch && !reduceMotion) {
                const items = p.querySelectorAll(".timeline-item");
                animate(
                    items,
                    { opacity: [0, 1], y: [16, 0] },
                    { duration: 0.5, delay: stagger(0.04), easing: [0.22, 1, 0.36, 1] }
                );
            }
        });
    });
});

/* ---------- TIMELINE INITIAL STAGGER ---------- */
// First-render reveal of the active timeline (day 1).
const initialTimeline = document.querySelector(".schedule-panel.is-active .timeline");
if (initialTimeline) {
    inView(
        initialTimeline,
        () => {
            if (reduceMotion) return;
            const items = initialTimeline.querySelectorAll(".timeline-item");
            animate(
                items,
                { opacity: [0, 1], x: [-12, 0] },
                { duration: 0.55, delay: stagger(0.05), easing: [0.22, 1, 0.36, 1] }
            );
        },
        { margin: "0px 0px -10% 0px" }
    );
}

/* ---------- CUSTOM CURSOR ---------- */
const cursor = document.querySelector(".cursor-dot");
if (cursor && !("ontouchstart" in window)) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener("mousemove", (e) => {
        tx = e.clientX;
        ty = e.clientY;
        cursor.style.opacity = 1;
    });
    window.addEventListener("mouseout", () => (cursor.style.opacity = 0));

    const loop = () => {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
        requestAnimationFrame(loop);
    };
    loop();

    // Hover state on interactive elements
    document
        .querySelectorAll("a, button, .liquid-button, .ghost-button, .talk-card, .theme-card, .event-card, .special-card")
        .forEach((el) => {
            el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
            el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
        });
}

/* ---------- CARD MICRO-LIFTS ---------- */
const liftables = document.querySelectorAll(".talk-card, .theme-card, .event-card");
liftables.forEach((card) => {
    card.addEventListener("mouseenter", () => {
        if (reduceMotion) return;
        animate(card, { y: -4 }, { duration: 0.35, easing: [0.22, 1, 0.36, 1] });
    });
    card.addEventListener("mouseleave", () => {
        if (reduceMotion) return;
        animate(card, { y: 0 }, { duration: 0.4, easing: [0.22, 1, 0.36, 1] });
    });
});

/* ---------- SMOOTH ANCHOR OFFSET ---------- */
// Adjust scroll position so anchored sections land below the fixed nav.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (id.length <= 1) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        // Close mobile menu if open
        hamburger?.classList.remove("is-open");
        mobileMenu?.classList.remove("is-open");
        hamburger?.setAttribute("aria-expanded", "false");
        mobileMenu?.setAttribute("aria-hidden", "true");
        const navH = document.querySelector(".nav")?.offsetHeight || 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
        window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    });
});

/* ---------- HAMBURGER MENU ---------- */
const hamburger = document.querySelector(".nav-hamburger");
const mobileMenu = document.querySelector(".mobile-menu");

if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
        const isOpen = hamburger.classList.toggle("is-open");
        mobileMenu.classList.toggle("is-open", isOpen);
        hamburger.setAttribute("aria-expanded", String(isOpen));
        mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    });
}
