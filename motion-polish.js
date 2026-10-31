/*
  PauzeX Developments — interaction polish
  Active navigation and pointer-only magnetic response.
  Scroll-linked visual work is centralized in runtime-optimizations.js.
*/
(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
  const sections = navLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          if (link.getAttribute("href") === "#" + entry.target.id) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-28% 0px -58% 0px", threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  }

  if (!finePointer || reduceMotion) return;

  document.querySelectorAll(".hero-actions .button, .header-contact, .closing .button").forEach(el => {
    el.addEventListener("pointermove", event => {
      const rect = el.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const dy = (event.clientY - rect.top - rect.height / 2) / rect.height;
      el.style.transform = "translate3d(" + (dx * 4).toFixed(1) + "px," + (dy * 3).toFixed(1) + "px,0)";
    }, { passive: true });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    el.addEventListener("blur", () => { el.style.transform = ""; });
  });
})();
